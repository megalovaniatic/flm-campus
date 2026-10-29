import { ROLE_PERMISSIONS } from '@flm/shared';
import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { clearSessionCookie } from '../auth/cookies';
import { listActiveSessions, publicSession, revokeSession, revokeUserSessions, type SessionRow } from '../auth/sessions';
import type { AppContext, AppEnv, AuthUser } from '../context';
import { all, get, run, transaction, type SqlParam } from '../db/database';
import { notFound } from '../lib/errors';
import { jsonBody, queryParams } from '../lib/validation';
import { currentUser, requirePermission } from '../middleware/authorize';
import { enforce, RATE_RULES } from '../middleware/rate-limit';
import { deactivateUser, reactivateUser, removeUser, sendActivationLink } from '../services/accounts';
import { audit } from '../services/audit';
import { getFile, readMultipart, registerFile } from '../services/files';
import {
  accountState,
  activeUsers,
  adminPerson,
  completePersonalDates,
  createUser,
  directoryEntry,
  missingDatesOf,
  personalDatesPatchSchema,
  personCreateSchema,
  personUpdateSchema,
  requireUserRow,
  toPerson,
  updateUser,
  type UserRow,
} from '../services/people';

/** Sustituye la foto de perfil (la anterior se borra: es un dato personal, no se versiona). */
async function replacePhoto(ctx: AppContext, c: Context<AppEnv>, target: UserRow, actor: AuthUser): Promise<UserRow> {
  enforce(ctx.limiter, `subidas:${actor.id}`, RATE_RULES.uploads, (wait) => `Has alcanzado el límite de 30 subidas por hora. Vuelve a intentarlo en ${wait}.`);
  const form = await readMultipart(c);
  const stored = await ctx.storage.store(form.archivo, ['imagen']);
  const now = ctx.now();
  let previous: string | null;
  try {
    previous = transaction(ctx.db, () => {
      registerFile(ctx.db, stored, 'foto-perfil', actor.id, now.toISOString());
      const old = target.photo_file_id ? getFile(ctx.db, target.photo_file_id) : undefined;
      run(ctx.db, 'UPDATE users SET photo_file_id = ?, updated_at = ? WHERE id = ?', stored.id, now.toISOString(), target.id);
      if (old) run(ctx.db, 'DELETE FROM files WHERE id = ?', old.id);
      audit(ctx.db, { actorId: actor.id, action: 'persona.foto', entity: 'persona', entityId: target.id, ip: c.get('clientIp') }, now);
      return old?.storage_name ?? null;
    });
  } catch (err) {
    await ctx.storage.remove(stored.storageName);
    throw err;
  }
  if (previous) await ctx.storage.remove(previous);
  return requireUserRow(ctx.db, target.id);
}

async function removePhoto(ctx: AppContext, c: Context<AppEnv>, target: UserRow, actor: AuthUser): Promise<UserRow> {
  if (!target.photo_file_id) return target;
  const now = ctx.now();
  const old = getFile(ctx.db, target.photo_file_id);
  transaction(ctx.db, () => {
    run(ctx.db, 'UPDATE users SET photo_file_id = NULL, updated_at = ? WHERE id = ?', now.toISOString(), target.id);
    if (old) run(ctx.db, 'DELETE FROM files WHERE id = ?', old.id);
    audit(ctx.db, { actorId: actor.id, action: 'persona.foto-eliminar', entity: 'persona', entityId: target.id, ip: c.get('clientIp') }, now);
  });
  if (old) await ctx.storage.remove(old.storage_name);
  return requireUserRow(ctx.db, target.id);
}

/** Perfil propio: consulta, foto y datos del calendario (cumpleaños e incorporación). */
export function meRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db } = ctx;

  /** `missingPersonalDates`: datos del calendario que faltan en la ficha (se piden sin bloquear el acceso). */
  r.get('/', requirePermission('campus:leer'), (c) => {
    const user = requireUserRow(db, currentUser(c).id);
    return c.json({
      person: toPerson(user),
      missingPersonalDates: missingDatesOf(user),
      accountState: accountState(user),
      permissions: [...ROLE_PERMISSIONS[user.role]],
    });
  });

  /**
   * Completar los datos del calendario que faltan: el cumpleaños (día y mes; también se puede corregir)
   * y la fecha de incorporación (solo si aún no consta: 409 `INCORPORACION_YA_INDICADA`). La auditoría
   * anota qué campos cambian, nunca las fechas.
   */
  r.patch('/personal-dates', requirePermission('progreso:propio'), async (c) => {
    const input = await jsonBody(c, personalDatesPatchSchema);
    const me = currentUser(c);
    const now = ctx.now();
    const { user, changed } = transaction(db, () => {
      const result = completePersonalDates(db, requireUserRow(db, me.id), input, now.toISOString());
      if (result.changed.length) {
        audit(db, { actorId: me.id, action: 'perfil.fechas', entity: 'persona', entityId: me.id, detail: `Campos: ${result.changed.join(', ')}`, ip: c.get('clientIp') }, now);
      }
      return result;
    });
    return c.json({ person: toPerson(user), missingPersonalDates: missingDatesOf(user), changed });
  });

  r.put('/photo', requirePermission('progreso:propio'), async (c) => {
    const me = currentUser(c);
    return c.json({ person: toPerson(await replacePhoto(ctx, c, requireUserRow(db, me.id), me)) });
  });

  r.delete('/photo', requirePermission('progreso:propio'), async (c) => {
    const me = currentUser(c);
    return c.json({ person: toPerson(await removePhoto(ctx, c, requireUserRow(db, me.id), me)) });
  });

  return r;
}

/** Gestión de personas y cuentas (administración). */
export function peopleRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db } = ctx;
  const ip = (c: Context<AppEnv>) => c.get('clientIp');

  /** Directorio interno: ficha mínima de las personas activas (sin correo electrónico), con el cumpleaños y la incorporación del calendario. */
  r.get('/directory', requirePermission('campus:leer'), (c) => c.json({ items: activeUsers(db).map(directoryEntry) }));

  r.get('/', requirePermission('personas:gestionar'), (c) => {
    const q = queryParams(
      c,
      z.object({
        status: z.enum(['activa', 'inactiva']).optional(),
        role: z.enum(['empleado', 'autor', 'admin']).optional(),
        q: z.string().trim().max(100).optional(),
      }),
    );
    const where: string[] = [];
    const params: SqlParam[] = [];
    if (q.status) {
      where.push('status = ?');
      params.push(q.status);
    }
    if (q.role) {
      where.push('role = ?');
      params.push(q.role);
    }
    if (q.q) {
      where.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${q.q}%`, `%${q.q}%`);
    }
    const rows = all<UserRow>(db, `SELECT * FROM users ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY name COLLATE NOCASE`, ...params);
    const now = ctx.now();
    return c.json({ items: rows.map((u) => adminPerson(u, now)) });
  });

  /**
   * Alta: solo correos @flmexperts.com, con el cumpleaños (día y mes) y la fecha de incorporación
   * obligatorios: el calendario de empresa muestra sus cumpleaños y aniversarios desde ese momento.
   * La persona recibe un enlace para fijar su contraseña.
   */
  r.post('/', requirePermission('personas:gestionar'), async (c) => {
    const input = await jsonBody(c, personCreateSchema);
    const actor = currentUser(c);
    const now = ctx.now();
    const user = createUser(db, input, now.toISOString());
    audit(db, { actorId: actor.id, action: 'persona.alta', entity: 'persona', entityId: user.id, detail: `Rol: ${user.role}`, ip: ip(c) }, now);
    const activation = await sendActivationLink(ctx, user, actor.id, ip(c));
    return c.json({ person: adminPerson(user, now), activation }, 201);
  });

  r.get('/:id', requirePermission('personas:gestionar'), (c) => c.json({ person: adminPerson(requireUserRow(db, c.req.param('id')), ctx.now()) }));

  /**
   * Edición de puesto, departamento, oficina, rol, cumpleaños, incorporación… Cambiar el rol cierra las
   * sesiones de la persona. El calendario cambia con la ficha (sus entradas se calculan a partir de ella).
   * La auditoría anota los campos editados, nunca sus valores.
   */
  r.patch('/:id', requirePermission('personas:gestionar'), async (c) => {
    const input = await jsonBody(c, personUpdateSchema);
    const actor = currentUser(c);
    const target = requireUserRow(db, c.req.param('id'));
    if (target.anonymized_at) throw notFound('Los datos de esta persona se eliminaron y no se pueden editar.');
    const now = ctx.now();
    const { user, roleChanged } = updateUser(db, target, input, now.toISOString());
    const changed = Object.keys(input).join(', ');
    audit(db, { actorId: actor.id, action: 'persona.editar', entity: 'persona', entityId: user.id, detail: `Campos: ${changed}`, ip: ip(c) }, now);
    if (roleChanged) {
      const closed = revokeUserSessions(db, user.id, 'cambio-rol', now.getTime());
      audit(db, { actorId: actor.id, action: 'persona.cambiar-rol', entity: 'persona', entityId: user.id, detail: `Rol: ${target.role} → ${user.role}. Sesiones cerradas: ${closed}`, ip: ip(c) }, now);
      if (user.id === actor.id) clearSessionCookie(c, ctx.config, ctx.cookies);
    }
    return c.json({ person: adminPerson(user, now), sessionsRevoked: roleChanged });
  });

  r.post('/:id/deactivate', requirePermission('personas:gestionar'), (c) => {
    const actor = currentUser(c);
    const user = deactivateUser(db, actor, requireUserRow(db, c.req.param('id')), ctx.now(), ip(c));
    if (user.id === actor.id) clearSessionCookie(c, ctx.config, ctx.cookies);
    return c.json({ person: adminPerson(user, ctx.now()) });
  });

  r.post('/:id/reactivate', requirePermission('personas:gestionar'), (c) => {
    const user = reactivateUser(db, currentUser(c), requireUserRow(db, c.req.param('id')), ctx.now(), ip(c));
    return c.json({ person: adminPerson(user, ctx.now()) });
  });

  /** Reenvía el enlace de activación (invalida el anterior). */
  r.post('/:id/activation-link', requirePermission('personas:gestionar'), async (c) => {
    const activation = await sendActivationLink(ctx, requireUserRow(db, c.req.param('id')), currentUser(c).id, ip(c));
    return c.json({ activation });
  });

  r.put('/:id/photo', requirePermission('personas:gestionar'), async (c) => {
    const target = requireUserRow(db, c.req.param('id'));
    if (target.anonymized_at) throw notFound('Los datos de esta persona se eliminaron.');
    return c.json({ person: adminPerson(await replacePhoto(ctx, c, target, currentUser(c)), ctx.now()) });
  });

  r.delete('/:id/photo', requirePermission('personas:gestionar'), async (c) => {
    const target = requireUserRow(db, c.req.param('id'));
    return c.json({ person: adminPerson(await removePhoto(ctx, c, target, currentUser(c)), ctx.now()) });
  });

  /**
   * «Eliminar el perfil» de quien deja FLM: exige `confirm` con el correo de la persona. Borra la
   * persona y sus sesiones; su contenido se conserva sin autoría; sus bienvenidas se borran.
   */
  r.post('/:id/remove', requirePermission('datos-personales:eliminar'), async (c) => {
    const { confirm } = await jsonBody(c, z.object({ confirm: z.string({ error: 'Escribe el correo de la persona en «confirm» para confirmar.' }).max(254) }));
    const { removed, photoStorageName } = removeUser(db, currentUser(c), requireUserRow(db, c.req.param('id')), confirm, ctx.now(), ip(c));
    if (photoStorageName) await ctx.storage.remove(photoStorageName);
    return c.json({ removed });
  });

  r.get('/:id/sessions', requirePermission('sesiones:revocar'), (c) => {
    const target = requireUserRow(db, c.req.param('id'));
    return c.json({ items: listActiveSessions(db, target.id, ctx.now().getTime()).map((s) => publicSession(s, c.get('session')?.id)) });
  });

  r.delete('/:id/sessions', requirePermission('sesiones:revocar'), (c) => {
    const actor = currentUser(c);
    const target = requireUserRow(db, c.req.param('id'));
    const now = ctx.now();
    const closed = revokeUserSessions(db, target.id, 'admin', now.getTime());
    audit(db, { actorId: actor.id, action: 'sesion.revocar-todas', entity: 'persona', entityId: target.id, detail: `Sesiones cerradas: ${closed}`, ip: ip(c) }, now);
    if (target.id === actor.id) clearSessionCookie(c, ctx.config, ctx.cookies);
    return c.json({ closed });
  });

  r.delete('/:id/sessions/:sessionId', requirePermission('sesiones:revocar'), (c) => {
    const actor = currentUser(c);
    const target = requireUserRow(db, c.req.param('id'));
    const session = get<SessionRow>(db, 'SELECT * FROM sessions WHERE id = ? AND user_id = ? AND revoked_at IS NULL', c.req.param('sessionId'), target.id);
    if (!session) throw notFound('No existe esa sesión abierta para esta persona.');
    const now = ctx.now();
    revokeSession(db, session.id, 'admin', now.getTime());
    audit(db, { actorId: actor.id, action: 'sesion.revocar', entity: 'sesion', entityId: session.id, detail: `Persona: ${target.id}`, ip: ip(c) }, now);
    if (session.id === c.get('session')?.id) clearSessionCookie(c, ctx.config, ctx.cookies);
    return c.json({ ok: true });
  });

  return r;
}

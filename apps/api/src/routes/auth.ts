import { loginInput, passwordInput, ROLE_LABEL, ROLE_PERMISSIONS } from '@flm/shared';
import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { clearSessionCookie, readCookie, setCsrfCookie, setSessionCookie } from '../auth/cookies';
import { hashPassword, needsRehash, verifyAgainstDummy, verifyPassword } from '../auth/passwords';
import {
  ABSOLUTE_TIMEOUT_MS,
  createSession,
  listActiveSessions,
  publicSession,
  revokeSession,
  revokeUserSessions,
  rotateSession,
  type SessionRow,
} from '../auth/sessions';
import { randomToken } from '../auth/tokens';
import type { AppContext, AppEnv } from '../context';
import { get, run, transaction } from '../db/database';
import { badRequest, HttpError, notFound, tooManyRequests, waitText } from '../lib/errors';
import { jsonBody } from '../lib/validation';
import { currentUser, requirePermission } from '../middleware/authorize';
import { enforce, RATE_RULES } from '../middleware/rate-limit';
import { consumeAuthToken, findAuthToken, issueAuthToken } from '../services/account-tokens';
import { audit } from '../services/audit';
import { passwordChangedEmail, resetEmail, resetUrl } from '../services/emails';
import { fileUrl, getUserByEmail, missingDatesOf, requireUserRow, type UserRow } from '../services/people';

/**
 * Datos de sesión que recibe la web (incluye el token CSRF que debe enviar en X-CSRF-Token).
 * `missingPersonalDates` lista los datos del calendario que faltan en la ficha: la web los pide
 * (PATCH /api/me/personal-dates) sin bloquear el acceso.
 */
export function sessionPayload(user: UserRow, session: SessionRow) {
  return {
    authenticated: true as const,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleLabel: ROLE_LABEL[user.role],
      position: user.position,
      department: user.department,
      office: user.office,
      ...(user.photo_file_id ? { photo: fileUrl(user.photo_file_id) } : {}),
      ...(user.birthday ? { birthday: user.birthday } : {}),
      ...(user.start_date ? { startDate: user.start_date } : {}),
      missingPersonalDates: missingDatesOf(user),
    },
    permissions: [...ROLE_PERMISSIONS[user.role]],
    csrfToken: session.csrf_token,
    session: publicSession(session, session.id),
  };
}

const GENERIC_RECOVERY_MESSAGE =
  'Si existe una cuenta activa con ese correo, recibirás en unos minutos un enlace para restablecer la contraseña. El enlace caduca a los 30 minutos.';

const tokenField = z.string().trim().min(1, 'Falta el token del enlace').max(200);

export function authRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db, limiter } = ctx;

  /** Inicia una sesión nueva (rotación: si había otra en este navegador, se revoca). */
  const startSession = (c: Context<AppEnv>, user: UserRow): SessionRow => {
    const now = ctx.now().getTime();
    const previous = c.get('session');
    if (previous) revokeSession(db, previous.id, 'rotacion', now);
    const { token, session } = createSession(db, user.id, now, { ip: c.get('clientIp'), userAgent: c.req.header('user-agent') ?? null });
    setSessionCookie(c, ctx.config, ctx.cookies, token, ABSOLUTE_TIMEOUT_MS / 1000);
    c.set('session', session);
    c.set('user', { id: user.id, email: user.email, name: user.name, role: user.role });
    return session;
  };

  r.post('/login', async (c) => {
    const input = await jsonBody(c, loginInput);
    const ip = c.get('clientIp');
    // Por IP y correo cuenta cada intento (se pone a cero al acertar); por IP, solo los fallidos. Los dos se
    // anotan antes de comprobar la contraseña, para que una ráfaga simultánea no se cuele, y el correcto se devuelve.
    const pairKey = `login:${ip}:${input.email}`;
    const failuresKey = `login-fallos:${ip}`;
    const keys = [
      { key: pairKey, rule: RATE_RULES.loginIpEmail },
      { key: failuresKey, rule: RATE_RULES.loginIpFailures },
    ];
    for (const { key, rule } of keys) {
      const check = limiter.check(key, rule);
      if (!check.allowed) {
        throw tooManyRequests(`Demasiados intentos de inicio de sesión. Espera ${waitText(check.retryAfterSec)} y vuelve a intentarlo.`, check.retryAfterSec);
      }
    }
    limiter.consume(pairKey, RATE_RULES.loginIpEmail);
    limiter.consume(failuresKey, RATE_RULES.loginIpFailures);

    const now = ctx.now();
    const user = getUserByEmail(db, input.email);
    const failure = (detail: string) => {
      audit(db, { actorId: null, action: 'sesion.inicio-fallido', entity: 'persona', entityId: user?.id ?? null, detail, ip }, now);
      return new HttpError(401, 'CREDENCIALES_NO_VALIDAS', 'Correo o contraseña incorrectos.');
    };
    if (!user || !user.password_hash || user.anonymized_at) {
      await verifyAgainstDummy(input.password);
      throw failure(user ? 'Cuenta sin activar' : 'Correo no registrado');
    }
    if (!(await verifyPassword(input.password, user.password_hash))) throw failure('Contraseña incorrecta');
    if (user.status !== 'activa') {
      audit(db, { actorId: user.id, action: 'sesion.inicio-rechazado', entity: 'persona', entityId: user.id, detail: 'Cuenta desactivada', ip }, now);
      throw new HttpError(403, 'CUENTA_DESACTIVADA', 'Tu cuenta está desactivada. Si crees que es un error, contacta con administración.');
    }
    limiter.reset(pairKey);
    limiter.release(failuresKey);
    if (needsRehash(user.password_hash)) {
      run(db, 'UPDATE users SET password_hash = ? WHERE id = ?', await hashPassword(input.password), user.id);
    }
    const session = startSession(c, user);
    audit(db, { actorId: user.id, action: 'sesion.inicio', entity: 'sesion', entityId: session.id, ip }, now);
    return c.json(sessionPayload(user, session));
  });

  r.post('/logout', requirePermission('campus:leer'), (c) => {
    const session = c.get('session')!;
    const now = ctx.now();
    revokeSession(db, session.id, 'cierre', now.getTime());
    clearSessionCookie(c, ctx.config, ctx.cookies);
    audit(db, { actorId: session.user_id, action: 'sesion.cierre', entity: 'sesion', entityId: session.id, ip: c.get('clientIp') }, now);
    return c.json({ ok: true, message: 'Has cerrado la sesión.' });
  });

  /** Comprueba un enlace de activación antes de mostrar el formulario de contraseña. */
  r.post('/activation/check', async (c) => {
    const { token } = await jsonBody(c, z.object({ token: tokenField }));
    const row = findAuthToken(db, token, 'activacion', ctx.now().getTime());
    const user = requireUserRow(db, row.user_id);
    return c.json({ valid: true, email: user.email, name: user.name, expiresAt: new Date(row.expires_at).toISOString() });
  });

  /** Activa la cuenta: la persona fija su contraseña con el enlace de un solo uso. */
  r.post('/activate', async (c) => {
    const input = await jsonBody(c, z.object({ token: tokenField, password: passwordInput }));
    const now = ctx.now();
    const t = now.getTime();
    const row = findAuthToken(db, input.token, 'activacion', t);
    const user = requireUserRow(db, row.user_id);
    if (user.status !== 'activa' || user.anonymized_at) {
      throw new HttpError(403, 'CUENTA_DESACTIVADA', 'La cuenta está desactivada. Contacta con administración.');
    }
    const hash = await hashPassword(input.password);
    const activated = transaction(db, () => {
      consumeAuthToken(db, findAuthToken(db, input.token, 'activacion', t), t);
      const nowIso = now.toISOString();
      run(
        db,
        'UPDATE users SET password_hash = ?, password_changed_at = ?, activated_at = COALESCE(activated_at, ?), updated_at = ? WHERE id = ?',
        hash,
        nowIso,
        nowIso,
        nowIso,
        user.id,
      );
      audit(db, { actorId: user.id, action: 'cuenta.activar', entity: 'persona', entityId: user.id, ip: c.get('clientIp') }, now);
      return requireUserRow(db, user.id);
    });
    const session = startSession(c, activated);
    return c.json({ ...sessionPayload(activated, session), message: 'Cuenta activada. Te damos la bienvenida a FLM Campus.' });
  });

  /** Solicitud de recuperación: respuesta genérica, exista o no la cuenta. */
  r.post('/password/forgot', async (c) => {
    const { email } = await jsonBody(c, z.object({ email: z.string().trim().toLowerCase().max(254) }));
    const ip = c.get('clientIp');
    const message = (wait: string) => `Has solicitado demasiados enlaces de recuperación. Espera ${wait} antes de volver a intentarlo.`;
    const byIp = limiter.check(`recuperacion-ip:${ip}`, RATE_RULES.recoveryIp);
    if (!byIp.allowed) throw tooManyRequests(message(waitText(byIp.retryAfterSec)), byIp.retryAfterSec);
    enforce(limiter, `recuperacion:${email}`, RATE_RULES.recoveryEmail, message);
    enforce(limiter, `recuperacion-ip:${ip}`, RATE_RULES.recoveryIp, message);

    const user = email ? getUserByEmail(db, email) : undefined;
    if (user && user.status === 'activa' && user.password_hash && !user.anonymized_at) {
      const now = ctx.now();
      const { token } = issueAuthToken(db, user.id, 'recuperacion', now.getTime(), null);
      audit(db, { actorId: null, action: 'contrasena.solicitud', entity: 'persona', entityId: user.id, ip }, now);
      // Sin esperar al envío: el tiempo de respuesta no debe delatar si la cuenta existe.
      void ctx.mailer.send(resetEmail(user.email, user.name, resetUrl(ctx.config.appOrigin, token)));
    }
    return c.json({ message: GENERIC_RECOVERY_MESSAGE }, 202);
  });

  /** Comprueba un enlace de recuperación antes de mostrar el formulario de la nueva contraseña. */
  r.post('/password/reset/check', async (c) => {
    const { token } = await jsonBody(c, z.object({ token: tokenField }));
    const row = findAuthToken(db, token, 'recuperacion', ctx.now().getTime());
    const user = requireUserRow(db, row.user_id);
    return c.json({ valid: true, email: user.email, name: user.name, expiresAt: new Date(row.expires_at).toISOString() });
  });

  /** Restablecimiento con el enlace de 30 minutos: cierra todas las sesiones de la cuenta. */
  r.post('/password/reset', async (c) => {
    const input = await jsonBody(c, z.object({ token: tokenField, password: passwordInput }));
    const now = ctx.now();
    const t = now.getTime();
    const row = findAuthToken(db, input.token, 'recuperacion', t);
    const user = requireUserRow(db, row.user_id);
    if (user.status !== 'activa' || user.anonymized_at) {
      throw new HttpError(403, 'CUENTA_DESACTIVADA', 'La cuenta está desactivada. Contacta con administración.');
    }
    const hash = await hashPassword(input.password);
    transaction(db, () => {
      consumeAuthToken(db, findAuthToken(db, input.token, 'recuperacion', t), t);
      run(db, 'UPDATE users SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE id = ?', hash, now.toISOString(), now.toISOString(), user.id);
      const closed = revokeUserSessions(db, user.id, 'restablecimiento', t);
      run(db, "DELETE FROM auth_tokens WHERE user_id = ? AND purpose = 'recuperacion' AND used_at IS NULL", user.id);
      audit(db, { actorId: user.id, action: 'contrasena.restablecer', entity: 'persona', entityId: user.id, detail: `Sesiones cerradas: ${closed}`, ip: c.get('clientIp') }, now);
    });
    if (readCookie(c, ctx.cookies.session)) clearSessionCookie(c, ctx.config, ctx.cookies);
    void ctx.mailer.send(passwordChangedEmail(user.email, user.name));
    return c.json({ message: 'Contraseña restablecida. Se han cerrado todas tus sesiones: inicia sesión con la nueva contraseña.' });
  });

  /** Cambio de contraseña con la actual: cierra las demás sesiones y renueva la actual. */
  r.post('/password/change', requirePermission('campus:leer'), async (c) => {
    const input = await jsonBody(c, z.object({ currentPassword: z.string().min(1, 'Indica tu contraseña actual').max(256), newPassword: passwordInput }));
    const me = currentUser(c);
    const session = c.get('session')!;
    enforce(limiter, `cambio-contrasena:${me.id}`, RATE_RULES.passwordChange, (wait) => `Demasiados intentos de cambio de contraseña. Espera ${wait}.`);
    const user = requireUserRow(db, me.id);
    const now = ctx.now();
    const t = now.getTime();
    if (!user.password_hash || !(await verifyPassword(input.currentPassword, user.password_hash))) {
      audit(db, { actorId: me.id, action: 'contrasena.cambio-fallido', entity: 'persona', entityId: me.id, ip: c.get('clientIp') }, now);
      throw new HttpError(400, 'CONTRASENA_ACTUAL_INCORRECTA', 'La contraseña actual no es correcta.');
    }
    if (input.currentPassword === input.newPassword) {
      throw badRequest('La nueva contraseña debe ser distinta de la actual.', undefined, 'CONTRASENA_REPETIDA');
    }
    const hash = await hashPassword(input.newPassword);
    const rotated = transaction(db, () => {
      run(db, 'UPDATE users SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE id = ?', hash, now.toISOString(), now.toISOString(), me.id);
      const closed = revokeUserSessions(db, me.id, 'cambio-contrasena', t, session.id);
      run(db, "DELETE FROM auth_tokens WHERE user_id = ? AND purpose = 'recuperacion' AND used_at IS NULL", me.id);
      audit(db, { actorId: me.id, action: 'contrasena.cambio', entity: 'persona', entityId: me.id, detail: `Otras sesiones cerradas: ${closed}`, ip: c.get('clientIp') }, now);
      return rotateSession(db, session, t);
    });
    setSessionCookie(c, ctx.config, ctx.cookies, rotated.token, (session.expires_at - t) / 1000);
    void ctx.mailer.send(passwordChangedEmail(user.email, user.name));
    return c.json({ message: 'Contraseña actualizada. Se han cerrado tus demás sesiones.', csrfToken: rotated.csrfToken });
  });

  return r;
}

export function sessionRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db } = ctx;

  /**
   * Estado de la sesión. Con sesión: datos de la persona, permisos y token CSRF.
   * Sin sesión: token CSRF previo para iniciar sesión, activar la cuenta o recuperar la contraseña,
   * y el motivo si la sesión anterior ha caducado o se ha cerrado.
   */
  r.get('/session', (c) => {
    const session = c.get('session');
    const me = c.get('user');
    if (session && me) return c.json(sessionPayload(requireUserRow(db, me.id), session));
    let token = readCookie(c, ctx.cookies.csrf);
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      token = randomToken(32);
      setCsrfCookie(c, ctx.config, ctx.cookies, token);
    }
    const problem = c.get('sessionProblem');
    return c.json({ authenticated: false, csrfToken: token, ...(problem ? { reason: problem } : {}) });
  });

  r.get('/sessions', requirePermission('campus:leer'), (c) => {
    const me = currentUser(c);
    const current = c.get('session')!;
    return c.json({ items: listActiveSessions(db, me.id, ctx.now().getTime()).map((s) => publicSession(s, current.id)) });
  });

  r.post('/sessions/revoke-others', requirePermission('campus:leer'), (c) => {
    const me = currentUser(c);
    const now = ctx.now();
    const closed = revokeUserSessions(db, me.id, 'usuario', now.getTime(), c.get('session')!.id);
    audit(db, { actorId: me.id, action: 'sesion.cerrar-otras', entity: 'persona', entityId: me.id, detail: `Sesiones cerradas: ${closed}`, ip: c.get('clientIp') }, now);
    return c.json({ closed });
  });

  r.delete('/sessions/:id', requirePermission('campus:leer'), (c) => {
    const me = currentUser(c);
    const id = c.req.param('id');
    const target = get<SessionRow>(db, 'SELECT * FROM sessions WHERE id = ? AND user_id = ? AND revoked_at IS NULL', id, me.id);
    if (!target) throw notFound('No existe esa sesión entre tus sesiones abiertas.');
    const now = ctx.now();
    revokeSession(db, target.id, 'usuario', now.getTime());
    const current = target.id === c.get('session')?.id;
    if (current) clearSessionCookie(c, ctx.config, ctx.cookies);
    audit(db, { actorId: me.id, action: 'sesion.cerrar', entity: 'sesion', entityId: target.id, ip: c.get('clientIp') }, now);
    return c.json({ ok: true, current });
  });

  return r;
}

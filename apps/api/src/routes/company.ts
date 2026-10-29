import {
  compareHistory,
  compareUpcoming,
  entriesForMonth,
  eventPhase,
  eventToIcs,
  holidaySchema,
  nextSession,
  type CampusEvent,
  type Holiday,
  type NewClient,
  type Office,
  type Welcome,
} from '@flm/shared';
import { Hono } from 'hono';
import { z } from 'zod';
import { newId } from '../auth/tokens';
import type { AppContext, AppEnv } from '../context';
import { all, isUniqueViolation, run } from '../db/database';
import { conflict, notFound } from '../lib/errors';
import { jsonBody, queryParams, revisionField } from '../lib/validation';
import { currentUser, requirePermission } from '../middleware/authorize';
import { audit } from '../services/audit';
import { composeItem, findPublished, listPublished, requireContent, setManualPhase, type ContentRow } from '../services/content';
import { contentDisposition } from '../services/files';
import { activeUsers, directoryCard, getUser, toPerson } from '../services/people';
import { contentDetail } from './contents';

interface HolidayRow {
  id: string;
  date: string;
  name: string;
  scope: Holiday['scope'];
  offices: string;
  source: string;
}

const toHoliday = (h: HolidayRow) => ({ id: h.id, date: h.date, name: h.name, scope: h.scope, offices: JSON.parse(h.offices) as Office[], source: h.source });

/**
 * Vida de empresa: eventos (fase calculada con `eventPhase()` en Europe/Madrid), calendario
 * (`entriesForMonth()`) y festivos.
 */
export function companyRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db } = ctx;

  const withPhase = (ev: CampusEvent, now: Date) => ({ ...ev, phase: eventPhase(ev, now), nextSession: nextSession(ev, now) ?? null });

  r.get('/events', requirePermission('campus:leer'), (c) => {
    const q = queryParams(
      c,
      z.object({
        phase: z.enum(['en-curso', 'proximo', 'historico']).optional(),
        kind: z.enum(['evento', 'comunicado']).optional(),
        category: z.enum(['formacion-interna', 'desayuno', 'encuentro', 'reconocimiento', 'celebracion', 'iniciativa', 'comunicacion']).optional(),
      }),
    );
    const now = ctx.now();
    const events = listPublished(db, q.kind ? [q.kind] : ['evento', 'comunicado']).map((row) => composeItem(db, row) as unknown as CampusEvent);
    const upcoming = events.filter((e) => eventPhase(e, now) !== 'historico').sort((a, b) => compareUpcoming(a, b, now));
    const history = events.filter((e) => eventPhase(e, now) === 'historico').sort(compareHistory);
    const items = [...upcoming, ...history]
      .map((e) => withPhase(e, now))
      .filter((e) => (!q.phase || e.phase === q.phase) && (!q.category || e.category === q.category));
    return c.json({ items });
  });

  r.get('/events/:ref', requirePermission('campus:leer'), (c) => {
    const row = findPublished(db, ['evento', 'comunicado'], c.req.param('ref'));
    if (!row) throw notFound('No existe ningún evento publicado con ese identificador.');
    return c.json({ event: withPhase(composeItem(db, row) as unknown as CampusEvent, ctx.now()) });
  });

  /** Exportación .ics con zona Europe/Madrid. */
  r.get('/events/:ref/ics', requirePermission('campus:leer'), (c) => {
    const row = findPublished(db, ['evento', 'comunicado'], c.req.param('ref'));
    if (!row) throw notFound('No existe ningún evento publicado con ese identificador.');
    const ev = composeItem(db, row) as unknown as CampusEvent;
    return c.body(eventToIcs(ev, ctx.now()), 200, {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': contentDisposition('attachment', `${ev.slug}.ics`),
    });
  });

  /** Reclasificación manual (próximo / histórico) o vuelta al cálculo automático con `null`. */
  r.patch('/events/:id/phase', requirePermission('contenido:editar-cualquiera'), async (c) => {
    const input = await jsonBody(c, z.object({ manualPhase: z.enum(['proximo', 'historico']).nullable(), revision: revisionField }));
    const row = setManualPhase(db, currentUser(c), requireContent(db, c.req.param('id')), input, ctx.now(), c.get('clientIp'));
    return c.json({ content: contentDetail(db, row, ctx.now()) });
  });

  /**
   * Calendario del mes: festivos, encuentros de equipo y los cumpleaños y aniversarios de incorporación
   * de las personas activas. Estos no se guardan como eventos: `entriesForMonth(…, { people })` los
   * calcula a partir de cada ficha, así que cambian con ella, desaparecen al desactivarla o eliminarla y
   * nunca se duplican (una entrada por persona, tipo y año). Sin correos ni años de nacimiento.
   */
  r.get('/calendar', requirePermission('campus:leer'), (c) => {
    const { year, month } = queryParams(
      c,
      z.object({
        year: z.coerce.number({ error: 'Indica el año (year)' }).int().min(2000).max(2100),
        month: z.coerce.number({ error: 'Indica el mes (month)' }).int().min(1).max(12),
      }),
    );
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const holidays = all<HolidayRow>(db, 'SELECT * FROM holidays WHERE date LIKE ?', `${prefix}-%`).map(toHoliday);
    const events = listPublished(db, ['evento'])
      .map((row) => composeItem(db, row) as unknown as CampusEvent)
      .filter((e) => e.category === 'encuentro');
    const people = activeUsers(db).map(toPerson);
    return c.json({ year, month, entries: entriesForMonth(year, month, { holidays, events, people }) });
  });

  r.get('/holidays', requirePermission('campus:leer'), (c) => {
    const { year } = queryParams(c, z.object({ year: z.coerce.number().int().min(2000).max(2100).optional() }));
    const rows = year ? all<HolidayRow>(db, 'SELECT * FROM holidays WHERE date LIKE ? ORDER BY date', `${year}-%`) : all<HolidayRow>(db, 'SELECT * FROM holidays ORDER BY date');
    return c.json({ items: rows.map(toHoliday) });
  });

  // Los festivos son de toda la firma: solo administración (la autoría publica lo suyo, no el calendario).
  r.post('/holidays', requirePermission('contenido:editar-cualquiera'), async (c) => {
    const h = await jsonBody(c, holidaySchema);
    const id = newId();
    try {
      run(db, 'INSERT INTO holidays (id, date, name, scope, offices, source) VALUES (?, ?, ?, ?, ?, ?)', id, h.date, h.name, h.scope, JSON.stringify(h.offices), h.source);
    } catch (err) {
      if (isUniqueViolation(err)) throw conflict('Ya existe un festivo en esa fecha para esas oficinas.', 'FESTIVO_DUPLICADO');
      throw err;
    }
    audit(db, { actorId: currentUser(c).id, action: 'festivo.crear', entity: 'festivo', entityId: id, detail: h.date, ip: c.get('clientIp') }, ctx.now());
    return c.json({ holiday: { id, ...h } }, 201);
  });

  r.delete('/holidays/:id', requirePermission('contenido:editar-cualquiera'), (c) => {
    if (run(db, 'DELETE FROM holidays WHERE id = ?', c.req.param('id')) !== 1) throw notFound('No existe ese festivo.');
    audit(db, { actorId: currentUser(c).id, action: 'festivo.eliminar', entity: 'festivo', entityId: c.req.param('id'), ip: c.get('clientIp') }, ctx.now());
    return c.json({ ok: true });
  });

  /* ── «Ponte al día» (Inicio): nuevos clientes y bienvenidas ─────────────────── */

  /** Nuevos clientes publicados, del más reciente al más antiguo. Solo uso interno: sin datos económicos. */
  r.get('/clients', requirePermission('campus:leer'), (c) => {
    const { limit } = queryParams(c, z.object({ limit: z.coerce.number().int().min(1).max(50).optional() }));
    const items = listPublished(db, ['cliente'])
      .map((row) => composeItem(db, row) as unknown as NewClient)
      .sort((a, b) => b.date.localeCompare(a.date));
    return c.json({ items: limit ? items.slice(0, limit) : items });
  });

  /**
   * Bienvenidas publicadas a personas que siguen activas en el equipo, con su ficha mínima (sin correo
   * ni fechas). El anuncio solo tiene su fecha de publicación: la de incorporación es de la ficha y se
   * ve en el calendario de empresa (su aniversario), no en la bienvenida.
   */
  r.get('/welcomes', requirePermission('campus:leer'), (c) => {
    const { limit } = queryParams(c, z.object({ limit: z.coerce.number().int().min(1).max(50).optional() }));
    const rows = all<ContentRow & { person_id: string }>(
      db,
      `SELECT c.*, u.id AS person_id FROM contents c
       JOIN users u ON u.id = json_extract(c.payload, '$.personId')
       WHERE c.type = 'bienvenida' AND c.status = 'publicado' AND u.status = 'activa' AND u.anonymized_at IS NULL`,
    );
    const items = rows
      .map((row) => {
        const person = getUser(db, row.person_id);
        return { ...(composeItem(db, row) as unknown as Welcome), person: person ? directoryCard(person) : null };
      })
      .filter((w) => w.person !== null)
      .sort((a, b) => b.date.localeCompare(a.date));
    return c.json({ items: limit ? items.slice(0, limit) : items });
  });

  return r;
}

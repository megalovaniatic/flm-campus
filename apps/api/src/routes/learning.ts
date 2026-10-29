import { AREA_IDS, madridDateKey, type Quiz } from '@flm/shared';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppContext, AppEnv } from '../context';
import { all } from '../db/database';
import { notFound } from '../lib/errors';
import { jsonBody, queryParams } from '../lib/validation';
import { currentUser, requirePermission } from '../middleware/authorize';
import { assignmentInput, createAssignment, deleteAssignment, dueDatesForUser, listAssignments } from '../services/assignments';
import { composeItem, findPublished, listPublished, type ContentRow } from '../services/content';
import { attemptHistory, attemptInput, confirmRead, progressFor, progressView, submitAttempt, withPublicQuiz } from '../services/learning';

const areaQuery = z.object({ area: z.enum(AREA_IDS).optional() });

/**
 * Formaciones y evaluaciones sectoriales tal como las ve una persona empleada: el test llega sin
 * respuestas correctas, explicaciones ni retroalimentación, y se corrige en el servidor.
 */
export function learningRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db } = ctx;

  const requirePublished = (types: ('formacion' | 'test')[], ref: string, label: string): ContentRow => {
    const row = findPublished(db, types, ref);
    if (!row) throw notFound(`No existe ninguna ${label} publicada con ese identificador.`);
    return row;
  };

  /** Asignación obligatoria de cada formación para una persona (se calcula una vez por petición). */
  const assignmentsOf = (userId: string) => {
    const dues = dueDatesForUser(db, userId);
    const today = madridDateKey(ctx.now());
    return (contentId: string) => {
      const due = dues.get(contentId);
      if (!due) return null;
      return { mandatory: true, dueDate: due.dueDate, overdue: !!due.dueDate && due.dueDate < today };
    };
  };

  /* ── Formaciones ─────────────────────────────────────────────────────────── */

  r.get('/formations', requirePermission('campus:leer'), (c) => {
    const { area } = queryParams(c, areaQuery);
    const me = currentUser(c);
    const assignmentFor = assignmentsOf(me.id);
    const items = listPublished(db, ['formacion'], area).map((row) => {
      const f = JSON.parse(row.payload) as Record<string, unknown>;
      const progress = progressView(row, progressFor(db, me.id, row));
      return {
        id: row.id,
        slug: row.slug,
        area: row.area,
        title: row.title,
        summary: f.summary,
        readingMinutes: f.readingMinutes,
        outcomes: f.outcomes,
        version: row.version,
        verifiedAt: f.verifiedAt,
        publishedAt: row.published_at,
        updatedAt: row.updated_at,
        progress,
        assignment: assignmentFor(row.id),
      };
    });
    return c.json({ items });
  });

  r.get('/formations/:ref', requirePermission('campus:leer'), (c) => {
    const row = requirePublished(['formacion'], c.req.param('ref'), 'formación');
    const me = currentUser(c);
    const formation = withPublicQuiz(composeItem(db, row) as Record<string, unknown> & { quiz: Quiz });
    return c.json({ formation, progress: progressView(row, progressFor(db, me.id, row)), assignment: assignmentsOf(me.id)(row.id) });
  });

  /** Confirmación de lectura de la versión vigente (al llegar al final de la formación). */
  r.post('/formations/:ref/read', requirePermission('progreso:propio'), async (c) => {
    const { version } = await jsonBody(c, z.object({ version: z.number().int().positive().optional() }));
    const row = requirePublished(['formacion'], c.req.param('ref'), 'formación');
    const progress = confirmRead(db, currentUser(c).id, row, version, ctx.now());
    return c.json({ progress: progressView(row, progress) });
  });

  r.post('/formations/:ref/attempts', requirePermission('progreso:propio'), async (c) => {
    const input = await jsonBody(c, attemptInput);
    const row = requirePublished(['formacion'], c.req.param('ref'), 'formación');
    const me = currentUser(c);
    const result = submitAttempt(db, me.id, row, input, ctx.now());
    return c.json({ ...result, progress: progressView(row, progressFor(db, me.id, row)) }, 201);
  });

  r.get('/formations/:ref/attempts', requirePermission('progreso:propio'), (c) => {
    const row = requirePublished(['formacion'], c.req.param('ref'), 'formación');
    return c.json({ items: attemptHistory(db, currentUser(c).id, row.id) });
  });

  /* ── Evaluaciones sectoriales («Pon a prueba tus conocimientos»: 10 preguntas, aprobado con 8) ── */

  r.get('/assessments', requirePermission('campus:leer'), (c) => {
    const { area } = queryParams(c, areaQuery);
    const me = currentUser(c);
    const items = listPublished(db, ['test'], area).map((row) => {
      const a = JSON.parse(row.payload) as { title: string; intro: string; quiz: Quiz };
      const attempts = attemptHistory(db, me.id, row.id).filter((at) => at.version === row.version);
      const best = [...attempts].sort((x, y) => y.correct - x.correct)[0];
      return {
        id: row.id,
        area: row.area,
        title: a.title,
        intro: a.intro,
        questions: a.quiz.questions.length,
        passMark: a.quiz.passMark,
        version: row.version,
        attempts: attempts.length,
        bestScore: best ? { correct: best.correct, total: best.total, passed: best.passed } : null,
        passed: attempts.some((at) => at.passed),
      };
    });
    return c.json({ items });
  });

  r.get('/assessments/:ref', requirePermission('campus:leer'), (c) => {
    const row = requirePublished(['test'], c.req.param('ref'), 'evaluación');
    const assessment = withPublicQuiz(composeItem(db, row) as Record<string, unknown> & { quiz: Quiz });
    return c.json({ assessment: { ...assessment, version: row.version } });
  });

  r.post('/assessments/:ref/attempts', requirePermission('progreso:propio'), async (c) => {
    const input = await jsonBody(c, attemptInput);
    const row = requirePublished(['test'], c.req.param('ref'), 'evaluación');
    return c.json(submitAttempt(db, currentUser(c).id, row, input, ctx.now()), 201);
  });

  r.get('/assessments/:ref/attempts', requirePermission('progreso:propio'), (c) => {
    const row = requirePublished(['test'], c.req.param('ref'), 'evaluación');
    return c.json({ items: attemptHistory(db, currentUser(c).id, row.id) });
  });

  /* ── Progreso propio ─────────────────────────────────────────────────────── */

  r.get('/me/progress', requirePermission('progreso:propio'), (c) => {
    const me = currentUser(c);
    const assignmentFor = assignmentsOf(me.id);
    const formations = listPublished(db, ['formacion']).map((row) => ({
      id: row.id,
      slug: row.slug,
      area: row.area,
      title: row.title,
      progress: progressView(row, progressFor(db, me.id, row)),
      assignment: assignmentFor(row.id),
    }));
    return c.json({ formations, mandatory: formations.filter((f) => f.assignment) });
  });

  /** Historial propio de intentos (fecha, versión, respuestas y aciertos) de todos los tests. */
  r.get('/me/attempts', requirePermission('progreso:propio'), (c) => {
    const me = currentUser(c);
    const titles = new Map(all<{ id: string; title: string; type: string }>(db, 'SELECT id, title, type FROM contents').map((t) => [t.id, t]));
    const rows = all<{ id: string; content_id: string }>(db, 'SELECT id, content_id FROM quiz_attempts WHERE user_id = ?', me.id);
    const contentOf = new Map(rows.map((r2) => [r2.id, r2.content_id]));
    const items = attemptHistory(db, me.id).map((a) => {
      const contentId = contentOf.get(a.id) ?? '';
      return { ...a, contentId, contentType: titles.get(contentId)?.type ?? null, contentTitle: titles.get(contentId)?.title ?? null };
    });
    return c.json({ items });
  });

  /* ── Asignaciones obligatorias (administración) ──────────────────────────── */

  r.get('/assignments', requirePermission('formaciones:asignar'), (c) => c.json({ items: listAssignments(db) }));

  r.post('/assignments', requirePermission('formaciones:asignar'), async (c) => {
    const input = await jsonBody(c, assignmentInput);
    return c.json({ assignment: createAssignment(db, currentUser(c), input, ctx.now(), c.get('clientIp')) }, 201);
  });

  r.delete('/assignments/:id', requirePermission('formaciones:asignar'), (c) => {
    deleteAssignment(db, currentUser(c), c.req.param('id'), ctx.now(), c.get('clientIp'));
    return c.json({ ok: true });
  });

  return r;
}

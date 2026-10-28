import { eventPhase, type CampusEvent } from '@flm/shared';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppContext, AppEnv } from '../context';
import type { Db } from '../db/database';
import { all, run } from '../db/database';
import { badRequest } from '../lib/errors';
import { idParam, jsonBody, queryParams, revisionField } from '../lib/validation';
import { currentUser, requirePermission } from '../middleware/authorize';
import {
  assertCanEdit,
  composeItem,
  contentSummary,
  CONTENT_TYPES,
  createContent,
  deleteDraft,
  discardRevision,
  listContents,
  openRevision,
  requireContent,
  saveContent,
  transitionContent,
  type ContentRow,
} from '../services/content';

/** Ficha editorial completa: contenido vigente (con soluciones) y revisión pendiente, si la hay. */
export function contentDetail(db: Db, row: ContentRow, now: Date) {
  const open = openRevision(db, row.id);
  const item = composeItem(db, row);
  return {
    ...contentSummary(db, row),
    item,
    ...(row.type === 'evento' || row.type === 'comunicado' ? { phase: eventPhase(item as unknown as CampusEvent, now) } : {}),
    pendingRevision: open
      ? {
          id: open.id,
          status: open.status,
          authorId: open.author_id,
          createdAt: open.created_at,
          updatedAt: open.updated_at,
          returnComment: open.return_comment,
          item: composeItem(db, row, open.payload),
        }
      : null,
  };
}

const typeEnum = z.enum(CONTENT_TYPES);
const statusEnum = z.enum(['borrador', 'en-revision', 'publicado', 'archivado']);

/**
 * Panel editorial (personas autoras y administración). La autorización por acción y la propiedad
 * se comprueban con `checkTransition()`; un autor solo ve y modifica sus propios contenidos.
 */
export function contentRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db } = ctx;

  r.get('/', requirePermission('contenido:crear'), (c) => {
    const f = queryParams(c, z.object({ type: typeEnum.optional(), status: statusEnum.optional(), authorId: idParam.optional(), q: z.string().trim().max(100).optional() }));
    return c.json({ items: listContents(db, currentUser(c), f) });
  });

  r.post('/', requirePermission('contenido:crear'), async (c) => {
    const input = await jsonBody(c, z.object({ type: typeEnum, payload: z.unknown() }));
    if (input.type === 'documento') {
      throw badRequest('Los documentos de la biblioteca se crean con POST /api/documents, enviando el PDF en un formulario multipart.');
    }
    const row = createContent(db, currentUser(c), input.type, input.payload, ctx.now(), { ip: c.get('clientIp') });
    return c.json({ content: contentDetail(db, row, ctx.now()) }, 201);
  });

  r.get('/:id', requirePermission('contenido:crear'), (c) => {
    const row = requireContent(db, c.req.param('id'));
    assertCanEdit(currentUser(c), row);
    return c.json({ content: contentDetail(db, row, ctx.now()) });
  });

  /** Guardar. Si el contenido está publicado, los cambios quedan en una revisión pendiente de aprobación. */
  r.put('/:id', requirePermission('contenido:crear'), async (c) => {
    const input = await jsonBody(c, z.object({ revision: revisionField, payload: z.unknown() }));
    const row = requireContent(db, c.req.param('id'));
    const result = saveContent(db, currentUser(c), row, { revision: input.revision, payload: input.payload }, ctx.now(), c.get('clientIp'));
    return c.json({ content: contentDetail(db, result.content, ctx.now()) });
  });

  /** Acciones del flujo editorial: enviar, publicar, devolver (con comentario), archivar y restaurar. */
  r.post('/:id/transitions', requirePermission('contenido:crear'), async (c) => {
    const input = await jsonBody(
      c,
      z.object({
        action: z.enum(['enviar', 'publicar', 'devolver', 'archivar', 'restaurar']),
        revision: revisionField,
        comment: z.string().max(2000).optional(),
      }),
    );
    const row = requireContent(db, c.req.param('id'));
    const result = transitionContent(db, currentUser(c), row, input, ctx.now(), c.get('clientIp'));
    return c.json({ content: contentDetail(db, result.content, ctx.now()) });
  });

  /** Vista previa para la autoría y administración: la versión de trabajo, con soluciones. */
  r.get('/:id/preview', requirePermission('contenido:crear'), (c) => {
    const row = requireContent(db, c.req.param('id'));
    assertCanEdit(currentUser(c), row);
    const open = openRevision(db, row.id);
    const item = composeItem(db, row, open?.payload ?? row.payload);
    return c.json({
      preview: true,
      source: open ? 'revision-pendiente' : 'contenido',
      status: open?.status ?? row.status,
      item,
      ...(row.type === 'evento' || row.type === 'comunicado' ? { phase: eventPhase(item as unknown as CampusEvent, ctx.now()) } : {}),
    });
  });

  /** Historial de revisiones (aprobadas o descartadas) de un contenido. */
  r.get('/:id/revisions', requirePermission('contenido:crear'), (c) => {
    const row = requireContent(db, c.req.param('id'));
    assertCanEdit(currentUser(c), row);
    const items = all<{ id: string; status: string; author_id: string; created_at: string; decided_at: string | null; decided_by: string | null; return_comment: string | null }>(
      db,
      'SELECT id, status, author_id, created_at, decided_at, decided_by, return_comment FROM content_revisions WHERE content_id = ? ORDER BY created_at DESC',
      row.id,
    ).map((rv) => ({
      id: rv.id,
      status: rv.status,
      authorId: rv.author_id,
      createdAt: rv.created_at,
      decidedAt: rv.decided_at,
      decidedBy: rv.decided_by,
      returnComment: rv.return_comment,
    }));
    return c.json({ items });
  });

  r.delete('/:id/revision', requirePermission('contenido:crear'), (c) => {
    const { revision } = queryParams(c, z.object({ revision: z.coerce.number().int().positive() }));
    const row = discardRevision(db, currentUser(c), requireContent(db, c.req.param('id')), revision, ctx.now(), c.get('clientIp'));
    return c.json({ content: contentDetail(db, row, ctx.now()) });
  });

  /** Elimina un borrador que nunca se ha publicado (y sus archivos). */
  r.delete('/:id', requirePermission('contenido:crear'), async (c) => {
    const { revision } = queryParams(c, z.object({ revision: z.coerce.number().int().positive() }));
    const fileIds = deleteDraft(db, currentUser(c), requireContent(db, c.req.param('id')), revision, ctx.now(), c.get('clientIp'));
    for (const id of fileIds) {
      const file = all<{ storage_name: string }>(db, 'SELECT storage_name FROM files WHERE id = ?', id)[0];
      run(db, 'DELETE FROM files WHERE id = ?', id);
      if (file) await ctx.storage.remove(file.storage_name);
    }
    return c.json({ ok: true });
  });

  return r;
}

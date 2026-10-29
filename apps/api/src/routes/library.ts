import { AREA_IDS, can, type DocumentVersion, type NewsItem } from '@flm/shared';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppContext, AppEnv, AuthUser } from '../context';
import { all, transaction } from '../db/database';
import { badRequest, HttpError, notFound } from '../lib/errors';
import { parseWith, queryParams } from '../lib/validation';
import { currentUser, requirePermission } from '../middleware/authorize';
import { enforce, RATE_RULES } from '../middleware/rate-limit';
import { audit } from '../services/audit';
import {
  assertCanReplaceFile,
  canEdit,
  composeItem,
  createContent,
  findPublished,
  getContent,
  insertDocumentVersion,
  listPublished,
  replaceDocumentFile,
  requireContent,
  type FileChange,
} from '../services/content';
import { contentDisposition, getFile, publicFile, readMultipart, registerFile, type FileRow, type StoredFile } from '../services/files';
import { contentDetail } from './contents';

const uploadMessage = (wait: string) => `Has alcanzado el límite de 30 subidas por hora. Vuelve a intentarlo en ${wait}.`;

/**
 * Biblioteca (documentos PDF con historial de versiones), noticias, lecturas y descarga de archivos.
 */
export function libraryRoutes(ctx: AppContext) {
  const r = new Hono<AppEnv>();
  const { db } = ctx;

  const versionOf = (stored: StoredFile, version: number, user: AuthUser, nowIso: string, note?: string): DocumentVersion => ({
    version,
    file: `/api/files/${stored.id}`,
    sizeKb: Math.max(1, Math.round(stored.size / 1024)),
    uploadedAt: nowIso,
    uploadedBy: user.name,
    ...(note ? { note } : {}),
  });

  /* ── Documentos ──────────────────────────────────────────────────────────── */

  r.get('/documents', requirePermission('campus:leer'), (c) => {
    const { area } = queryParams(c, z.object({ area: z.enum([...AREA_IDS, 'general']).optional() }));
    return c.json({ items: listPublished(db, ['documento'], area).map((row) => composeItem(db, row)) });
  });

  r.get('/documents/:id', requirePermission('campus:leer'), (c) => {
    const row = findPublished(db, ['documento'], c.req.param('id'));
    if (!row) throw notFound('No existe ningún documento publicado con ese identificador.');
    return c.json({ document: composeItem(db, row) });
  });

  /**
   * Alta de documento: formulario multipart con `archivo` (PDF ≤ 15 MB) y `datos` (JSON con
   * title, area, issuer, date, summary, kind, tags y publicDemo). Queda como borrador, que puede estar
   * a medias: al publicarlo se exigen todos los datos.
   */
  r.post('/documents', requirePermission('contenido:crear', 'documentos:subir'), async (c) => {
    const user = currentUser(c);
    enforce(ctx.limiter, `subidas:${user.id}`, RATE_RULES.uploads, uploadMessage);
    const form = await readMultipart(c);
    let data: unknown;
    try {
      data = JSON.parse(typeof form.datos === 'string' ? form.datos : '');
    } catch {
      throw badRequest('El campo «datos» debe contener un JSON con los datos del documento (título, área, emisor, fecha, resumen, tipo…).');
    }
    const nota = parseWith(z.string().max(500).optional(), typeof form.nota === 'string' ? form.nota : undefined);
    const stored = await ctx.storage.store(form.archivo, ['pdf']);
    const now = ctx.now();
    const nowIso = now.toISOString();
    try {
      const row = transaction(db, () => {
        registerFile(db, stored, 'documento', user.id, nowIso);
        const created = createContent(db, user, 'documento', data, now, { versions: [versionOf(stored, 1, user, nowIso, nota)], ip: c.get('clientIp') });
        insertDocumentVersion(db, { contentId: created.id, version: 1, stored, userId: user.id, nowIso, note: nota });
        audit(db, { actorId: user.id, action: 'documento.subir', entity: 'documento', entityId: created.id, detail: `Archivo ${stored.id} (v1)`, ip: c.get('clientIp') }, now);
        return created;
      });
      return c.json({ content: contentDetail(db, row, now) }, 201);
    } catch (err) {
      await ctx.storage.remove(stored.storageName);
      throw err;
    }
  });

  /**
   * Sustitución del archivo con historial. En un borrador que nunca se ha publicado, su autoría (o
   * administración) lo cambia al momento. En un documento publicado, solo administración, y el PDF nuevo
   * espera en la revisión pendiente hasta publicarla, como el resto de los cambios de algo publicado.
   */
  r.post('/documents/:id/versions', requirePermission('contenido:crear', 'documentos:subir'), async (c) => {
    const user = currentUser(c);
    assertCanReplaceFile(user, requireContent(db, c.req.param('id')));
    enforce(ctx.limiter, `subidas:${user.id}`, RATE_RULES.uploads, uploadMessage);
    const form = await readMultipart(c);
    const nota = parseWith(z.string().max(500).optional(), typeof form.nota === 'string' && form.nota.trim() ? form.nota.trim() : undefined);
    const stored = await ctx.storage.store(form.archivo, ['pdf']);
    const now = ctx.now();
    let result: FileChange;
    try {
      // Se vuelve a leer: el documento puede haber cambiado mientras se recibía el archivo.
      result = replaceDocumentFile(db, user, requireContent(db, c.req.param('id')), { stored, note: nota }, now, c.get('clientIp'));
    } catch (err) {
      await ctx.storage.remove(stored.storageName);
      throw err;
    }
    for (const name of result.removedFiles) await ctx.storage.remove(name);
    return c.json({ content: contentDetail(db, result.content, now) }, 201);
  });

  /* ── Archivos ────────────────────────────────────────────────────────────── */

  /** Subida de imágenes para contenidos (JPEG, PNG o WebP de hasta 5 MB). */
  r.post('/files', requirePermission('documentos:subir'), async (c) => {
    const user = currentUser(c);
    enforce(ctx.limiter, `subidas:${user.id}`, RATE_RULES.uploads, uploadMessage);
    const form = await readMultipart(c);
    const stored = await ctx.storage.store(form.archivo, ['imagen']);
    const now = ctx.now();
    try {
      const row = transaction(db, () => {
        const file = registerFile(db, stored, 'imagen', user.id, now.toISOString());
        audit(db, { actorId: user.id, action: 'archivo.subir', entity: 'archivo', entityId: file.id, detail: file.mime_type, ip: c.get('clientIp') }, now);
        return file;
      });
      return c.json({ file: publicFile(row) }, 201);
    } catch (err) {
      await ctx.storage.remove(stored.storageName);
      throw err;
    }
  });

  /**
   * Descarga con sesión y permisos. Los PDF heredan la visibilidad de su documento: publicados para
   * todo el campus; borradores o archivados, solo para su autoría y administración. El PDF nuevo que
   * espera en una revisión aún no es público: solo lo descargan su autoría y administración.
   */
  r.get('/files/:id', requirePermission('campus:leer'), async (c) => {
    const user = currentUser(c);
    const file = getFile(db, c.req.param('id'));
    if (!file) throw notFound('No existe ese archivo.');
    assertCanDownload(user, file);
    const bytes = await ctx.storage.read(file);
    if (!bytes) {
      ctx.logger.error('Archivo registrado pero ausente del almacenamiento', { fileId: file.id });
      throw notFound('El archivo no está disponible en el servidor. Avisa a administración.');
    }
    const attachment = file.kind === 'pdf' || c.req.query('descargar') !== undefined;
    return c.body(bytes, 200, {
      'Content-Type': file.mime_type,
      'Content-Length': String(bytes.length),
      'Content-Disposition': contentDisposition(attachment ? 'attachment' : 'inline', file.original_name),
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': file.kind === 'pdf' ? 'private, no-store' : 'private, max-age=3600',
    });
  });

  function assertCanDownload(user: AuthUser, file: FileRow): void {
    if (file.purpose !== 'documento') return; // imágenes y fotos: cualquier sesión del campus
    const owners = all<{ content_id: string; revision_id: string | null }>(db, 'SELECT content_id, revision_id FROM document_versions WHERE file_id = ?', file.id);
    const visible = owners.some(({ content_id, revision_id }) => {
      const row = getContent(db, content_id);
      if (!row) return false;
      if (revision_id) return canEdit(user, row);
      if (row.status === 'publicado') return true;
      if (row.status === 'archivado') return can(user.role, 'contenido:editar-cualquiera');
      return canEdit(user, row);
    });
    if (!visible) throw new HttpError(403, 'SIN_PERMISO', 'No tienes permiso para descargar este archivo.');
  }

  /* ── Noticias y lecturas ─────────────────────────────────────────────────── */

  r.get('/news', requirePermission('campus:leer'), (c) => {
    const q = queryParams(c, z.object({ area: z.enum(AREA_IDS).optional(), kind: z.enum(['legislacion', 'jurisprudencia', 'criterio', 'aviso-interno']).optional() }));
    const items = listPublished(db, ['noticia'], q.area)
      .map((row) => composeItem(db, row) as unknown as NewsItem)
      .filter((n) => !q.kind || n.kind === q.kind)
      .sort((a, b) => b.date.localeCompare(a.date));
    return c.json({ items });
  });

  r.get('/news/:ref', requirePermission('campus:leer'), (c) => {
    const row = findPublished(db, ['noticia'], c.req.param('ref'));
    if (!row) throw notFound('No existe ninguna noticia publicada con ese identificador.');
    return c.json({ news: composeItem(db, row) });
  });

  r.get('/readings', requirePermission('campus:leer'), (c) => {
    const { area } = queryParams(c, z.object({ area: z.enum(AREA_IDS).optional() }));
    const rows = area
      ? all<{ payload: string }>(db, 'SELECT payload FROM readings WHERE area = ? ORDER BY id', area)
      : all<{ payload: string }>(db, 'SELECT payload FROM readings ORDER BY area, id');
    return c.json({ items: rows.map((row) => JSON.parse(row.payload) as unknown) });
  });

  return r;
}

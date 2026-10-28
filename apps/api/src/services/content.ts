import {
  assessmentSchema,
  can,
  checkTransition,
  CREATABLE_TYPES,
  documentSchema,
  eventSchema,
  formationSchema,
  newsSchema,
  type ContentType,
  type DocumentVersion,
  type EditorialAction,
  type EditorialMeta,
  type EditorialStatus,
} from '@flm/shared';
import type { z } from 'zod';
import { newId } from '../auth/tokens';
import type { AuthUser } from '../context';
import { all, get, isUniqueViolation, run, transaction, type Db, type SqlParam } from '../db/database';
import { badRequest, conflict, forbidden, HttpError, notFound, revisionConflict } from '../lib/errors';
import { parseWith } from '../lib/validation';
import { audit } from './audit';
import { fileUrl } from './people';

/**
 * Contenidos editoriales en una tabla genérica. El `payload` se valida siempre con el esquema zod
 * del tipo definido en @flm/shared (el mismo que valida el contenido semilla de la demo), y el flujo
 * editorial se decide con `checkTransition()`, también compartido.
 */
export const CONTENT_TYPES = ['formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado'] as const satisfies readonly ContentType[];

const SCHEMAS: Record<ContentType, z.ZodType> = {
  formacion: formationSchema,
  test: assessmentSchema,
  noticia: newsSchema,
  documento: documentSchema,
  evento: eventSchema,
  comunicado: eventSchema,
};

export const TYPE_LABEL: Record<ContentType, string> = {
  formacion: 'formación',
  test: 'test',
  noticia: 'noticia',
  documento: 'documento',
  evento: 'evento',
  comunicado: 'comunicado',
};

/** Campos que gestiona el servidor: si llegan del cliente se descartan. */
const SERVER_FIELDS: Record<ContentType, readonly string[]> = {
  formacion: ['id', 'editorial'],
  test: ['id', 'editorial'],
  noticia: ['id', 'editorial'],
  documento: ['id', 'editorial', 'versions'],
  evento: ['id', 'editorial', 'kind', 'archived', 'manualPhase'],
  comunicado: ['id', 'editorial', 'kind', 'archived', 'manualPhase'],
};

export interface ContentRow {
  id: string;
  type: ContentType;
  slug: string | null;
  title: string;
  area: string | null;
  status: EditorialStatus;
  author_id: string;
  payload: string;
  revision: number;
  version: number;
  review: string;
  return_comment: string | null;
  manual_phase: 'proximo' | 'historico' | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RevisionRow {
  id: string;
  content_id: string;
  status: 'borrador' | 'en-revision' | 'aprobada' | 'descartada';
  author_id: string;
  payload: string;
  return_comment: string | null;
  created_at: string;
  updated_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

type Payload = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Payload => typeof value === 'object' && value !== null && !Array.isArray(value);

function strip(type: ContentType, obj: Payload): Payload {
  const out: Payload = {};
  for (const [key, value] of Object.entries(obj)) if (!SERVER_FIELDS[type].includes(key)) out[key] = value;
  return out;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Lectura y composición
 * ──────────────────────────────────────────────────────────────────────────── */

export function getContent(db: Db, id: string): ContentRow | undefined {
  return get<ContentRow>(db, 'SELECT * FROM contents WHERE id = ?', id);
}

export function requireContent(db: Db, id: string): ContentRow {
  const row = getContent(db, id);
  if (!row) throw notFound('No existe ningún contenido con ese identificador.');
  return row;
}

export function openRevision(db: Db, contentId: string): RevisionRow | undefined {
  return get<RevisionRow>(db, "SELECT * FROM content_revisions WHERE content_id = ? AND status IN ('borrador', 'en-revision')", contentId);
}

/** Contenido publicado por id o por slug. */
export function findPublished(db: Db, types: readonly ContentType[], ref: string): ContentRow | undefined {
  const marks = types.map(() => '?').join(', ');
  return get<ContentRow>(db, `SELECT * FROM contents WHERE type IN (${marks}) AND status = 'publicado' AND (id = ? OR slug = ?)`, ...types, ref, ref);
}

export function listPublished(db: Db, types: readonly ContentType[], area?: string): ContentRow[] {
  const marks = types.map(() => '?').join(', ');
  const params: SqlParam[] = [...types];
  let sql = `SELECT * FROM contents WHERE type IN (${marks}) AND status = 'publicado'`;
  if (area) {
    sql += ' AND area = ?';
    params.push(area);
  }
  return all<ContentRow>(db, `${sql} ORDER BY COALESCE(published_at, created_at) DESC`, ...params);
}

export function editorialMeta(row: ContentRow): EditorialMeta {
  let review: EditorialMeta['review'] = { state: 'pendiente' };
  try {
    review = JSON.parse(row.review) as EditorialMeta['review'];
  } catch {
    /* valor por defecto */
  }
  return {
    status: row.status,
    authorId: row.author_id,
    ...(row.published_at ? { publishedAt: row.published_at } : {}),
    updatedAt: row.updated_at,
    review,
    ...(row.return_comment ? { returnComment: row.return_comment } : {}),
  };
}

interface VersionRow {
  version: number;
  file_id: string | null;
  original_file: string | null;
  size_kb: number;
  pages: number | null;
  note: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  uploader: string | null;
}

export type ApiDocumentVersion = DocumentVersion & { available: boolean };

/** Historial de versiones de un documento (la más reciente es la vigente). */
export function documentVersions(db: Db, contentId: string): ApiDocumentVersion[] {
  return all<VersionRow>(
    db,
    `SELECT dv.*, u.name AS uploader FROM document_versions dv LEFT JOIN users u ON u.id = dv.uploaded_by
     WHERE dv.content_id = ? ORDER BY dv.version`,
    contentId,
  ).map((v) => ({
    version: v.version,
    file: v.file_id ? fileUrl(v.file_id) : (v.original_file ?? 'no-disponible'),
    sizeKb: v.size_kb,
    ...(v.pages ? { pages: v.pages } : {}),
    uploadedAt: v.uploaded_at,
    uploadedBy: v.uploader ?? v.uploaded_by_name ?? 'Persona desconocida',
    ...(v.note ? { note: v.note } : {}),
    available: v.file_id !== null,
  }));
}

/** Reconstruye el objeto completo del tipo compartido (Formation, NewsItem, CampusEvent…). */
export function composeItem(db: Db, row: ContentRow, payloadJson: string = row.payload): Payload {
  const payload = JSON.parse(payloadJson) as Payload;
  const item: Payload = { ...payload, id: row.id, editorial: editorialMeta(row) };
  if (row.type === 'test') delete item.editorial;
  if (row.type === 'documento') item.versions = documentVersions(db, row.id);
  if (row.type === 'evento' || row.type === 'comunicado') {
    item.kind = row.type;
    if (row.manual_phase) item.manualPhase = row.manual_phase;
    if (row.status === 'archivado') item.archived = true;
  }
  return item;
}

export function canEdit(user: AuthUser, row: ContentRow): boolean {
  return can(user.role, 'contenido:editar-cualquiera') || (row.author_id === user.id && can(user.role, 'contenido:editar-propio'));
}

export function assertCanEdit(user: AuthUser, row: ContentRow): void {
  if (!canEdit(user, row)) throw forbidden('Solo puedes consultar y modificar tus propios contenidos.');
}

/* ────────────────────────────────────────────────────────────────────────────
 * Validación
 * ──────────────────────────────────────────────────────────────────────────── */

interface Denormalized {
  title: string;
  area: string | null;
  slug: string | null;
}

function denormalize(type: ContentType, p: Payload): Denormalized {
  const s = (v: unknown) => (typeof v === 'string' ? v : null);
  switch (type) {
    case 'formacion':
      return { title: s(p.title) ?? '', area: s(p.area), slug: s(p.slug) };
    case 'test':
      return { title: s(p.title) ?? '', area: s(p.area), slug: null };
    case 'noticia':
      return { title: s(p.headline) ?? '', area: s(p.area), slug: s(p.slug) };
    case 'documento':
      return { title: s(p.title) ?? '', area: s(p.area), slug: null };
    case 'evento':
    case 'comunicado':
      return { title: s(p.title) ?? '', area: null, slug: s(p.slug) };
  }
}

/**
 * Valida el payload con el esquema del tipo. El servidor completa los campos que gestiona
 * (id, editorial, versiones de documento, tipo de evento) y devuelve el payload sin ellos.
 */
export function validatePayload(type: ContentType, raw: unknown, ctx: { id: string; versions?: DocumentVersion[] }): Payload {
  if (!isPlainObject(raw)) throw badRequest('El campo «payload» debe ser un objeto JSON con el contenido.');
  const candidate: Payload = {
    ...strip(type, raw),
    id: ctx.id,
    editorial: { status: 'borrador', authorId: 'servidor', review: { state: 'pendiente' } },
  };
  if (type === 'documento') candidate.versions = ctx.versions ?? [];
  if (type === 'evento' || type === 'comunicado') candidate.kind = type;
  const parsed = parseWith(SCHEMAS[type], candidate, `El contenido de tipo ${TYPE_LABEL[type]} no es válido. Revisa los campos indicados.`) as Payload;
  return strip(type, parsed);
}

function versionOf(type: ContentType, payload: Payload, fallback: number): number {
  return type === 'formacion' && typeof payload.version === 'number' ? payload.version : fallback;
}

function assertRevision(row: ContentRow, expected: number): void {
  if (row.revision !== expected) throw revisionConflict();
}

/** Errores de `checkTransition()`: permisos y propiedad → 403; estado → 409. */
function transitionError(reason: string | undefined): HttpError {
  const message = reason ?? 'Acción editorial no permitida.';
  return /permiso|propios/i.test(message) ? forbidden(message) : conflict(message, 'TRANSICION_NO_VALIDA');
}

function check(user: AuthUser, action: EditorialAction, from: EditorialStatus, isOwner: boolean): EditorialStatus {
  const result = checkTransition(user.role, action, from, isOwner);
  if (!result.ok || !result.to) throw transitionError(result.reason);
  return result.to;
}

function slugConflict(err: unknown): never {
  if (isUniqueViolation(err)) throw conflict('Ya existe otro contenido de este tipo con el mismo identificador de dirección (slug).', 'SLUG_DUPLICADO');
  throw err;
}

/** Actualiza contadores con control de concurrencia optimista. */
function bump(db: Db, row: ContentRow, sets: string, params: SqlParam[]): void {
  let changed: number;
  try {
    changed = run(db, `UPDATE contents SET ${sets}, revision = revision + 1 WHERE id = ? AND revision = ?`, ...params, row.id, row.revision);
  } catch (err) {
    slugConflict(err);
  }
  if (changed !== 1) throw revisionConflict();
}

/* ────────────────────────────────────────────────────────────────────────────
 * Operaciones editoriales
 * ──────────────────────────────────────────────────────────────────────────── */

export interface CreateOptions {
  id?: string;
  versions?: DocumentVersion[];
  ip?: string | null;
}

export function createContent(db: Db, user: AuthUser, type: ContentType, raw: unknown, now: Date, opts: CreateOptions = {}): ContentRow {
  if (!CREATABLE_TYPES[user.role].includes(type)) throw forbidden(`Tu rol no permite crear contenidos de tipo ${TYPE_LABEL[type]}.`);
  check(user, 'guardar', 'borrador', true);
  const id = opts.id ?? newId();
  const payload = validatePayload(type, raw, { id, versions: opts.versions });
  const meta = denormalize(type, payload);
  const nowIso = now.toISOString();
  try {
    run(
      db,
      `INSERT INTO contents (id, type, slug, title, area, status, author_id, payload, revision, version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'borrador', ?, ?, 1, ?, ?, ?)`,
      id,
      type,
      meta.slug,
      meta.title,
      meta.area,
      user.id,
      JSON.stringify(payload),
      versionOf(type, payload, 1),
      nowIso,
      nowIso,
    );
  } catch (err) {
    slugConflict(err);
  }
  audit(db, { actorId: user.id, action: 'contenido.crear', entity: type, entityId: id, ip: opts.ip }, now);
  return requireContent(db, id);
}

export interface SaveResult {
  content: ContentRow;
  /** Si el contenido ya estaba publicado, los cambios quedan en una revisión pendiente. */
  pendingRevision: RevisionRow | null;
}

export function saveContent(db: Db, user: AuthUser, row: ContentRow, input: { revision: number; payload: unknown }, now: Date, ip?: string | null): SaveResult {
  assertRevision(row, input.revision);
  const isOwner = row.author_id === user.id;
  const nowIso = now.toISOString();
  return transaction(db, () => {
    if (row.status === 'publicado') {
      const open = openRevision(db, row.id);
      check(user, 'guardar', open?.status === 'en-revision' ? 'en-revision' : 'borrador', isOwner);
      const payload = validatePayload(row.type, input.payload, { id: row.id, versions: documentVersions(db, row.id) });
      if (row.type === 'formacion' && versionOf(row.type, payload, row.version) < row.version) {
        throw badRequest(`La versión de la formación no puede ser inferior a la publicada (${row.version}).`, undefined, 'VERSION_NO_VALIDA');
      }
      if (open) {
        run(db, 'UPDATE content_revisions SET payload = ?, updated_at = ? WHERE id = ?', JSON.stringify(payload), nowIso, open.id);
      } else {
        run(
          db,
          `INSERT INTO content_revisions (id, content_id, status, author_id, payload, created_at, updated_at) VALUES (?, ?, 'borrador', ?, ?, ?, ?)`,
          newId(),
          row.id,
          user.id,
          JSON.stringify(payload),
          nowIso,
          nowIso,
        );
      }
      bump(db, row, 'updated_at = updated_at', []);
      audit(db, { actorId: user.id, action: 'contenido.guardar', entity: row.type, entityId: row.id, detail: 'Revisión de un contenido publicado', ip }, now);
    } else {
      check(user, 'guardar', row.status, isOwner);
      const payload = validatePayload(row.type, input.payload, { id: row.id, versions: documentVersions(db, row.id) });
      const meta = denormalize(row.type, payload);
      bump(db, row, 'payload = ?, title = ?, area = ?, slug = ?, version = ?, updated_at = ?', [
        JSON.stringify(payload),
        meta.title,
        meta.area,
        meta.slug,
        versionOf(row.type, payload, row.version),
        nowIso,
      ]);
      audit(db, { actorId: user.id, action: 'contenido.guardar', entity: row.type, entityId: row.id, ip }, now);
    }
    return { content: requireContent(db, row.id), pendingRevision: openRevision(db, row.id) ?? null };
  });
}

export interface TransitionInput {
  action: Exclude<EditorialAction, 'guardar'>;
  revision: number;
  comment?: string;
}

/**
 * Aplica una acción del flujo editorial: borrador → en revisión → publicado / devuelto con comentario;
 * publicado ↔ archivado. Si el contenido está publicado y tiene una revisión pendiente, las acciones
 * enviar, devolver y publicar se aplican a la revisión: la versión pública no cambia hasta aprobarla.
 */
export function transitionContent(db: Db, user: AuthUser, row: ContentRow, input: TransitionInput, now: Date, ip?: string | null): SaveResult {
  assertRevision(row, input.revision);
  const isOwner = row.author_id === user.id;
  const nowIso = now.toISOString();
  const comment = input.comment?.trim();
  const { action } = input;
  if (action === 'devolver' && !comment) {
    throw badRequest('Escribe un comentario que explique qué hay que corregir antes de devolver el contenido.', undefined, 'COMENTARIO_OBLIGATORIO');
  }

  return transaction(db, () => {
    const open = openRevision(db, row.id);
    const onRevision = row.status === 'publicado' && !!open && action !== 'archivar' && action !== 'restaurar';

    if (onRevision && open) {
      const to = check(user, action, open.status === 'en-revision' ? 'en-revision' : 'borrador', isOwner);
      if (action === 'publicar') {
        const payload = validatePayload(row.type, JSON.parse(open.payload), { id: row.id, versions: documentVersions(db, row.id) });
        const meta = denormalize(row.type, payload);
        const version = row.type === 'test' ? row.version + 1 : versionOf(row.type, payload, row.version);
        bump(db, row, 'payload = ?, title = ?, area = ?, slug = ?, version = ?, review = ?, return_comment = NULL, updated_at = ?', [
          JSON.stringify(payload),
          meta.title,
          meta.area,
          meta.slug,
          version,
          JSON.stringify({ state: 'revisado', reviewerName: user.name, reviewedAt: nowIso }),
          nowIso,
        ]);
        run(db, "UPDATE content_revisions SET status = 'aprobada', decided_at = ?, decided_by = ?, updated_at = ? WHERE id = ?", nowIso, user.id, nowIso, open.id);
      } else {
        run(
          db,
          'UPDATE content_revisions SET status = ?, return_comment = ?, updated_at = ? WHERE id = ?',
          to,
          action === 'devolver' ? (comment ?? null) : null,
          nowIso,
          open.id,
        );
        bump(db, row, 'updated_at = updated_at', []);
      }
      audit(db, { actorId: user.id, action: `contenido.${action}`, entity: row.type, entityId: row.id, detail: 'Revisión de un contenido publicado', ip }, now);
    } else {
      const to = check(user, action, row.status, isOwner);
      if (action === 'archivar' && open) {
        throw conflict('Este contenido tiene una revisión pendiente. Publícala o descártala antes de archivarlo.', 'REVISION_PENDIENTE');
      }
      if (action === 'publicar') {
        // Se vuelve a validar: el contenido publicado siempre cumple el esquema vigente.
        validatePayload(row.type, JSON.parse(row.payload), { id: row.id, versions: documentVersions(db, row.id) });
        bump(db, row, 'status = ?, published_at = COALESCE(published_at, ?), review = ?, return_comment = NULL, updated_at = ?', [
          to,
          nowIso,
          JSON.stringify({ state: 'revisado', reviewerName: user.name, reviewedAt: nowIso }),
          nowIso,
        ]);
      } else if (action === 'devolver') {
        bump(db, row, 'status = ?, return_comment = ?, updated_at = ?', [to, comment ?? null, nowIso]);
      } else if (action === 'enviar') {
        bump(db, row, 'status = ?, return_comment = NULL, updated_at = ?', [to, nowIso]);
      } else {
        bump(db, row, 'status = ?, updated_at = ?', [to, nowIso]);
      }
      audit(db, { actorId: user.id, action: `contenido.${action}`, entity: row.type, entityId: row.id, detail: comment ? `Comentario: ${comment.slice(0, 500)}` : null, ip }, now);
    }
    return { content: requireContent(db, row.id), pendingRevision: openRevision(db, row.id) ?? null };
  });
}

/** Descarta la revisión pendiente de un contenido publicado. */
export function discardRevision(db: Db, user: AuthUser, row: ContentRow, revision: number, now: Date, ip?: string | null): ContentRow {
  assertRevision(row, revision);
  assertCanEdit(user, row);
  const open = openRevision(db, row.id);
  if (!open) throw notFound('Este contenido no tiene ninguna revisión pendiente.');
  const nowIso = now.toISOString();
  transaction(db, () => {
    run(db, "UPDATE content_revisions SET status = 'descartada', decided_at = ?, decided_by = ?, updated_at = ? WHERE id = ?", nowIso, user.id, nowIso, open.id);
    bump(db, row, 'updated_at = updated_at', []);
    audit(db, { actorId: user.id, action: 'contenido.descartar-revision', entity: row.type, entityId: row.id, ip }, now);
  });
  return requireContent(db, row.id);
}

/**
 * Elimina un borrador que nunca se ha publicado. Devuelve los identificadores de archivo que
 * quedan huérfanos (versiones de documento) para borrarlos del almacenamiento.
 */
export function deleteDraft(db: Db, user: AuthUser, row: ContentRow, revision: number, now: Date, ip?: string | null): string[] {
  assertRevision(row, revision);
  assertCanEdit(user, row);
  if (row.status !== 'borrador' || row.published_at) {
    throw conflict('Solo se pueden eliminar borradores que nunca se han publicado. Para retirar un contenido publicado, archívalo.', 'NO_ELIMINABLE');
  }
  return transaction(db, () => {
    const files = all<{ file_id: string }>(db, 'SELECT file_id FROM document_versions WHERE content_id = ? AND file_id IS NOT NULL', row.id).map((f) => f.file_id);
    run(db, 'DELETE FROM contents WHERE id = ?', row.id);
    audit(db, { actorId: user.id, action: 'contenido.eliminar-borrador', entity: row.type, entityId: row.id, ip }, now);
    return files;
  });
}

/** Reclasificación manual de un evento (prevalece sobre el cálculo automático de `eventPhase()`). */
export function setManualPhase(
  db: Db,
  user: AuthUser,
  row: ContentRow,
  input: { manualPhase: 'proximo' | 'historico' | null; revision: number },
  now: Date,
  ip?: string | null,
): ContentRow {
  assertRevision(row, input.revision);
  if (row.type !== 'evento' && row.type !== 'comunicado') throw badRequest('Solo los eventos y comunicados se pueden reclasificar.');
  transaction(db, () => {
    bump(db, row, 'manual_phase = ?, updated_at = ?', [input.manualPhase, now.toISOString()]);
    audit(db, { actorId: user.id, action: 'evento.reclasificar', entity: row.type, entityId: row.id, detail: `Fase manual: ${input.manualPhase ?? 'automática'}`, ip }, now);
  });
  return requireContent(db, row.id);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Listados del panel editorial
 * ──────────────────────────────────────────────────────────────────────────── */

export interface ContentFilters {
  type?: ContentType;
  status?: EditorialStatus;
  authorId?: string;
  q?: string;
}

export function contentSummary(db: Db, row: ContentRow) {
  const open = openRevision(db, row.id);
  const author = get<{ name: string }>(db, 'SELECT name FROM users WHERE id = ?', row.author_id);
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    area: row.area,
    slug: row.slug,
    status: row.status,
    authorId: row.author_id,
    authorName: author?.name ?? null,
    revision: row.revision,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    returnComment: row.return_comment,
    manualPhase: row.manual_phase,
    pendingRevision: open
      ? { id: open.id, status: open.status, authorId: open.author_id, updatedAt: open.updated_at, returnComment: open.return_comment }
      : null,
  };
}

/** Administración ve todo; las personas autoras, solo sus contenidos. */
export function listContents(db: Db, user: AuthUser, f: ContentFilters) {
  const where: string[] = [];
  const params: SqlParam[] = [];
  if (!can(user.role, 'contenido:editar-cualquiera')) {
    where.push('author_id = ?');
    params.push(user.id);
  } else if (f.authorId) {
    where.push('author_id = ?');
    params.push(f.authorId);
  }
  if (f.type) {
    where.push('type = ?');
    params.push(f.type);
  }
  if (f.status) {
    where.push('status = ?');
    params.push(f.status);
  }
  if (f.q) {
    where.push('title LIKE ?');
    params.push(`%${f.q.replace(/[%_]/g, '')}%`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return all<ContentRow>(db, `SELECT * FROM contents ${clause} ORDER BY updated_at DESC`, ...params).map((row) => contentSummary(db, row));
}

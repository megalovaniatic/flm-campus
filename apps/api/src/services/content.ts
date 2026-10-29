import {
  AREAS,
  assessmentClashReason,
  assessmentSchema,
  can,
  canHandleType,
  checkTransition,
  isAreaId,
  documentSchema,
  eventSchema,
  formationSchema,
  newClientSchema,
  newsSchema,
  welcomeSchema,
  type ContentType,
  type DocumentVersion,
  type EditorialAction,
  type EditorialMeta,
  type EditorialStatus,
  type TransitionCheck,
} from '@flm/shared';
import { z } from 'zod';
import { newId } from '../auth/tokens';
import type { AuthUser } from '../context';
import { all, get, isUniqueViolation, run, transaction, type Db, type SqlParam } from '../db/database';
import { badRequest, conflict, forbidden, HttpError, notFound, revisionConflict } from '../lib/errors';
import { parseWith } from '../lib/validation';
import { audit } from './audit';
import { registerFile, type StoredFile } from './files';
import { fileUrl } from './people';

/**
 * Contenidos editoriales en una tabla genérica. El `payload` se valida siempre con el esquema zod
 * del tipo definido en @flm/shared (el mismo que valida el contenido semilla de la demo): completo al
 * publicar y, al guardar un borrador, su versión laxa (`draftSchema()`), que admite contenido a medias.
 * El flujo editorial se decide con `checkTransition()`, también compartido, y cada acción comprueba
 * además que el rol trabaja con ese tipo (`canHandleType()`), no solo al crear.
 *
 * Flujo sin revisión previa: «Guardar borrador» y «Publicar». La autoría publica lo suyo y
 * administración, cualquier contenido; archivar y restaurar es solo de administración. Editar algo
 * publicado guarda una revisión (borrador) que no cambia la versión pública hasta publicarla.
 * La autoría es opcional: el contenido de una persona cuyo perfil se ha eliminado queda sin autoría.
 */
export const CONTENT_TYPES = ['formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado', 'cliente', 'bienvenida'] as const satisfies readonly ContentType[];

const SCHEMAS: Record<ContentType, z.ZodType> = {
  formacion: formationSchema,
  test: assessmentSchema,
  noticia: newsSchema,
  documento: documentSchema,
  evento: eventSchema,
  comunicado: eventSchema,
  cliente: newClientSchema,
  bienvenida: welcomeSchema,
};

/** Comprobaciones que un borrador no exige: mínimos de caracteres o de elementos (lo obligatorio) y refinamientos (reglas de publicación). */
const NOT_IN_DRAFTS: ReadonlySet<string> = new Set(['min_length', 'custom']);

/**
 * Versión laxa de un esquema para «Guardar borrador»: la misma forma (los campos desconocidos se
 * descartan y los objetos estrictos siguen siéndolo), los mismos tipos, formatos y longitudes máximas,
 * pero todos los campos son opcionales y no hay mínimos ni refinamientos (las 3 preguntas del test
 * final, el ejemplo realista, la respuesta correcta entre las opciones…). En una unión discriminada,
 * la clave que distingue las opciones sigue siendo obligatoria.
 */
function draftSchema(schema: z.core.$ZodType, discriminator?: string): z.core.$ZodType {
  const def = schema._zod.def;
  const checks = def.checks?.filter((ch) => !NOT_IN_DRAFTS.has(ch._zod.def.check));
  switch (def.type) {
    case 'object': {
      const shape: Record<string, z.core.$ZodType> = {};
      for (const [key, field] of Object.entries((def as z.core.$ZodObjectDef).shape)) {
        const lax = draftSchema(field);
        shape[key] = key === discriminator || lax._zod.def.type === 'optional' ? lax : z.optional(lax);
      }
      return z.clone(schema, { ...def, shape, checks: [] } as typeof def);
    }
    case 'array':
      return z.clone(schema, { ...def, element: draftSchema((def as z.core.$ZodArrayDef).element), checks } as typeof def);
    case 'union': {
      const { options, discriminator: key } = def as z.core.$ZodDiscriminatedUnionDef;
      return z.clone(schema, { ...def, options: options.map((option) => draftSchema(option, key)), checks } as typeof def);
    }
    case 'optional':
    case 'nullable':
      return z.clone(schema, { ...def, innerType: draftSchema((def as z.core.$ZodOptionalDef).innerType), checks } as typeof def);
    default:
      return checks?.length === def.checks?.length ? schema : z.clone(schema, { ...def, checks } as typeof def);
  }
}

/** Esquemas de los borradores (los clones de un esquema de zod son de su misma clase). */
const DRAFT_SCHEMAS = Object.fromEntries(Object.entries(SCHEMAS).map(([type, schema]) => [type, draftSchema(schema) as z.ZodType])) as Record<ContentType, z.ZodType>;

export const TYPE_LABEL: Record<ContentType, string> = {
  formacion: 'formación',
  test: 'evaluación del área',
  noticia: 'noticia',
  documento: 'documento',
  evento: 'evento',
  comunicado: 'comunicado',
  cliente: 'cliente nuevo',
  bienvenida: 'bienvenida',
};

/** Campos que gestiona el servidor: si llegan del cliente se descartan. */
const SERVER_FIELDS: Record<ContentType, readonly string[]> = {
  formacion: ['id', 'editorial'],
  test: ['id', 'editorial'],
  noticia: ['id', 'editorial'],
  documento: ['id', 'editorial', 'versions'],
  evento: ['id', 'editorial', 'kind', 'archived', 'manualPhase'],
  comunicado: ['id', 'editorial', 'kind', 'archived', 'manualPhase'],
  cliente: ['id', 'editorial'],
  bienvenida: ['id', 'editorial'],
};

/** Eventos y comunicados comparten la dirección de la agenda (/participar/agenda/:slug): un solo espacio de slugs. */
const AGENDA: readonly ContentType[] = ['evento', 'comunicado'];

/** Título que se guarda para una bienvenida: nunca el nombre de la persona (dato personal). */
export const WELCOME_TITLE = 'Bienvenida al equipo';

export interface ContentRow {
  id: string;
  type: ContentType;
  slug: string | null;
  title: string;
  area: string | null;
  status: EditorialStatus;
  /** NULL si el contenido no tiene autoría (perfil eliminado o contenido institucional). */
  author_id: string | null;
  payload: string;
  revision: number;
  version: number;
  review: string;
  manual_phase: 'proximo' | 'historico' | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RevisionRow {
  id: string;
  content_id: string;
  status: 'borrador' | 'aprobada' | 'descartada';
  author_id: string | null;
  payload: string;
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

/**
 * `payload` que se guarda de un objeto completo del tipo (lo usa la carga de datos semilla): sin los
 * campos que gestiona el servidor en ese tipo. `kind` solo lo es en eventos y comunicados: en noticias
 * y documentos es su clase (legislación, nota informativa…) y se conserva.
 */
export function storedPayload(type: ContentType, item: object): string {
  return JSON.stringify(strip(type, item as Payload));
}

/** En un borrador, un texto vacío es un campo sin rellenar: se quita (también en los objetos de las listas). */
function withoutBlankText(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutBlankText);
  if (!isPlainObject(value)) return value;
  const out: Payload = {};
  for (const [key, v] of Object.entries(value)) if (!(typeof v === 'string' && !v.trim())) out[key] = withoutBlankText(v);
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

/** Revisión abierta (borrador) de un contenido publicado. */
export function openRevision(db: Db, contentId: string): RevisionRow | undefined {
  return get<RevisionRow>(db, "SELECT * FROM content_revisions WHERE content_id = ? AND status = 'borrador'", contentId);
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
    ...(row.author_id ? { authorId: row.author_id } : {}),
    ...(row.published_at ? { publishedAt: row.published_at } : {}),
    updatedAt: row.updated_at,
    review,
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
  /** Revisión pendiente en la que espera este PDF (aún no es público); NULL si ya es una versión publicada. */
  revision_id: string | null;
  uploader: string | null;
}

export type ApiDocumentVersion = DocumentVersion & { available: boolean; pending?: boolean };

/** Firma neutra de lo que sube o publica una persona cuyo perfil ya no existe. */
export const NEUTRAL_SIGNATURE = 'FLM';

/**
 * Historial de versiones de un documento (la más reciente es la vigente). Con `revisionId`, incluye
 * también el PDF que espera en esa revisión (`pending`): lo ven la vista previa y quien edita, no el campus.
 */
export function documentVersions(db: Db, contentId: string, revisionId?: string): ApiDocumentVersion[] {
  return all<VersionRow>(
    db,
    `SELECT dv.*, u.name AS uploader FROM document_versions dv LEFT JOIN users u ON u.id = dv.uploaded_by
     WHERE dv.content_id = ? AND (dv.revision_id IS NULL OR dv.revision_id = ?) ORDER BY dv.version`,
    contentId,
    revisionId ?? null,
  ).map((v) => ({
    version: v.version,
    file: v.file_id ? fileUrl(v.file_id) : (v.original_file ?? 'no-disponible'),
    sizeKb: v.size_kb,
    ...(v.pages ? { pages: v.pages } : {}),
    uploadedAt: v.uploaded_at,
    uploadedBy: v.uploader ?? v.uploaded_by_name ?? NEUTRAL_SIGNATURE,
    ...(v.note ? { note: v.note } : {}),
    available: v.file_id !== null,
    ...(v.revision_id ? { pending: true } : {}),
  }));
}

/**
 * Reconstruye el objeto completo del tipo compartido (Formation, NewsItem, CampusEvent, NewClient, Welcome…).
 * Con `revisionId` (la revisión pendiente), un documento lleva también el PDF que espera en ella.
 */
export function composeItem(db: Db, row: ContentRow, payloadJson: string = row.payload, revisionId?: string): Payload {
  const payload = JSON.parse(payloadJson) as Payload;
  const item: Payload = { ...payload, id: row.id, editorial: editorialMeta(row) };
  if (row.type === 'test') delete item.editorial;
  if (row.type === 'documento') item.versions = documentVersions(db, row.id, revisionId);
  if (row.type === 'evento' || row.type === 'comunicado') {
    item.kind = row.type;
    if (row.manual_phase) item.manualPhase = row.manual_phase;
    if (row.status === 'archivado') item.archived = true;
  }
  return item;
}

export const isOwnerOf = (user: AuthUser, row: Pick<ContentRow, 'author_id'>) => row.author_id !== null && row.author_id === user.id;

/**
 * Si la persona puede consultar y modificar el contenido: su rol trabaja con ese tipo (tras un cambio de
 * rol, la evaluación del área sigue siendo de administración aunque figure como suya) y es suyo, salvo
 * con «contenido:editar-cualquiera».
 */
export function canEdit(user: AuthUser, row: ContentRow): boolean {
  if (!canHandleType(user.role, row.type)) return false;
  return can(user.role, 'contenido:editar-cualquiera') || (isOwnerOf(user, row) && can(user.role, 'contenido:editar-propio'));
}

/** El rol trabaja con el tipo en cada acción (guardar, publicar, descartar, borrar…), no solo al crear. */
function assertHandlesType(user: AuthUser, type: ContentType): void {
  if (!canHandleType(user.role, type)) throw forbidden(`Tu rol no permite trabajar con contenidos de tipo ${TYPE_LABEL[type]}.`);
}

export function assertCanEdit(user: AuthUser, row: ContentRow): void {
  assertHandlesType(user, row.type);
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
  // Un borrador sin slug no ocupa ninguna dirección (el índice único admite varios NULL).
  const slug = s(p.slug) || null;
  switch (type) {
    case 'formacion':
      return { title: s(p.title) ?? '', area: s(p.area), slug };
    case 'test':
      return { title: s(p.title) ?? '', area: s(p.area), slug: null };
    case 'noticia':
      return { title: s(p.headline) ?? '', area: s(p.area), slug };
    case 'documento':
      return { title: s(p.title) ?? '', area: s(p.area), slug: null };
    case 'evento':
    case 'comunicado':
      return { title: s(p.title) ?? '', area: null, slug };
    case 'cliente':
      return { title: s(p.name) ?? '', area: s(p.area), slug: null };
    case 'bienvenida':
      // El nombre de la persona se lee de su ficha al mostrarla: la tabla no lo copia.
      return { title: WELCOME_TITLE, area: null, slug: null };
  }
}

/**
 * Valida el payload con el esquema del tipo: el completo para publicar y, con `draft`, su versión laxa
 * para «Guardar borrador» (los textos vacíos cuentan como campos sin rellenar). El servidor completa los
 * campos que gestiona (id, editorial, versiones de documento, tipo de evento) y devuelve el payload sin ellos.
 */
export function validatePayload(type: ContentType, raw: unknown, ctx: { id: string; versions?: DocumentVersion[]; draft?: boolean }): Payload {
  if (!isPlainObject(raw)) throw badRequest('El campo «payload» debe ser un objeto JSON con el contenido.');
  const candidate: Payload = {
    ...strip(type, ctx.draft ? (withoutBlankText(raw) as Payload) : raw),
    id: ctx.id,
    editorial: { status: 'borrador', authorId: 'servidor', review: { state: 'pendiente' } },
  };
  if (type === 'documento') candidate.versions = ctx.versions ?? [];
  if (type === 'evento' || type === 'comunicado') candidate.kind = type;
  const parsed = ctx.draft
    ? parseWith(DRAFT_SCHEMAS[type], candidate, `El borrador de tipo ${TYPE_LABEL[type]} no es válido. Revisa los campos indicados.`)
    : parseWith(SCHEMAS[type], candidate, `El contenido de tipo ${TYPE_LABEL[type]} no está completo para publicarse. Revisa los campos indicados.`);
  return strip(type, parsed as Payload);
}

/**
 * Bienvenidas: una por persona y solo para personas activas del directorio. Ni el anuncio ni la ficha
 * guardan la fecha de incorporación (el esquema es estricto y rechaza cualquier campo de más).
 */
function assertWelcomeFor(db: Db, payload: Payload, contentId: string): void {
  const personId = typeof payload.personId === 'string' ? payload.personId : '';
  const person = get<{ id: string }>(db, "SELECT id FROM users WHERE id = ? AND status = 'activa' AND anonymized_at IS NULL", personId);
  if (!person) {
    throw badRequest('La persona de la bienvenida no está en el directorio o ya no está activa. Elige a una persona activa del equipo.', undefined, 'PERSONA_NO_DISPONIBLE');
  }
  const other = get<{ id: string }>(db, "SELECT id FROM contents WHERE type = 'bienvenida' AND id <> ? AND json_extract(payload, '$.personId') = ?", contentId, personId);
  if (other) throw conflict('Esta persona ya tiene una bienvenida. Edita la que existe en lugar de crear otra.', 'BIENVENIDA_DUPLICADA');
}

/**
 * Una sola evaluación del área vigente (no archivada: publicada o en borrador) por área, como en la demo.
 * El motivo (`assessmentClashReason()`, compartido) dice cuál tiene ya el área y qué hacer.
 */
function assertSingleAssessment(db: Db, area: unknown, contentId: string, action: 'preparar' | 'publicar' | 'restaurar'): void {
  if (!isAreaId(area)) return;
  const other = get<{ status: EditorialStatus }>(
    db,
    "SELECT status FROM contents WHERE type = 'test' AND area = ? AND status <> 'archivado' AND id <> ? ORDER BY status = 'publicado' DESC LIMIT 1",
    area,
    contentId,
  );
  if (other) throw conflict(assessmentClashReason(AREAS[area].name, other.status === 'publicado' ? 'publicado' : 'borrador', action), 'EVALUACION_DUPLICADA');
}

const slugTaken = (type: ContentType) =>
  conflict(
    AGENDA.includes(type)
      ? 'Ya hay un evento o comunicado con el mismo identificador de dirección (slug): comparten la dirección de la agenda. Elige otro.'
      : 'Ya existe otro contenido de este tipo con el mismo identificador de dirección (slug).',
    'SLUG_DUPLICADO',
  );

/** El slug está libre en su espacio de direcciones (el del tipo o, en eventos y comunicados, el de la agenda). */
function assertSlugFree(db: Db, type: ContentType, slug: unknown, contentId: string): void {
  if (typeof slug !== 'string' || !slug) return;
  const space = AGENDA.includes(type) ? AGENDA : [type];
  const marks = space.map(() => '?').join(', ');
  if (get(db, `SELECT 1 AS x FROM contents WHERE type IN (${marks}) AND slug = ? AND id <> ?`, ...space, slug, contentId)) throw slugTaken(type);
}

/**
 * Reglas entre contenidos: una bienvenida por persona activa, una evaluación vigente por área y slugs
 * únicos en su espacio de direcciones. En un borrador solo se comprueba lo que ya está rellenado; al
 * publicar, el esquema completo exige el resto y todo se vuelve a comprobar.
 */
function assertFitsWithOthers(db: Db, type: ContentType, payload: Payload, contentId: string, action: 'preparar' | 'publicar'): void {
  if (type === 'bienvenida' && payload.personId !== undefined) assertWelcomeFor(db, payload, contentId);
  if (type === 'test') assertSingleAssessment(db, payload.area, contentId, action);
  assertSlugFree(db, type, payload.slug, contentId);
}

function versionOf(type: ContentType, payload: Payload, fallback: number): number {
  return type === 'formacion' && typeof payload.version === 'number' ? payload.version : fallback;
}

function assertRevision(row: ContentRow, expected: number): void {
  if (row.revision !== expected) throw revisionConflict();
}

/** Errores de `checkTransition()` por su código estable: permiso y propiedad → 403; estado → 409. */
export function transitionError(result: TransitionCheck): HttpError {
  const message = result.reason ?? 'Acción editorial no permitida.';
  switch (result.code) {
    case 'estado':
      return conflict(message, 'TRANSICION_NO_VALIDA');
    case 'propiedad':
      return forbidden(message, 'SOLO_LO_PROPIO');
    default:
      return forbidden(message);
  }
}

function check(user: AuthUser, action: EditorialAction, from: EditorialStatus, isOwner: boolean): EditorialStatus {
  const result = checkTransition(user.role, action, from, isOwner);
  if (!result.ok || !result.to) throw transitionError(result);
  return result.to;
}

/** Respaldo del índice único (type, slug): si dos peticiones chocan, el mismo 409 que da `assertSlugFree()`. */
function slugConflict(type: ContentType, err: unknown): never {
  if (isUniqueViolation(err)) throw slugTaken(type);
  throw err;
}

/** Actualiza contadores con control de concurrencia optimista. */
function bump(db: Db, row: ContentRow, sets: string, params: SqlParam[]): void {
  let changed: number;
  try {
    changed = run(db, `UPDATE contents SET ${sets}, revision = revision + 1 WHERE id = ? AND revision = ?`, ...params, row.id, row.revision);
  } catch (err) {
    slugConflict(row.type, err);
  }
  if (changed !== 1) throw revisionConflict();
}

const PENDING_REVIEW = JSON.stringify({ state: 'pendiente' });

/**
 * Revisión editorial que se anota al publicar. Con «Lo ha revisado el área», quién la anota (nombre e
 * identificador: si se elimina su perfil, su nombre se retira). Sin marcarlo, la primera publicación
 * conserva la del borrador y publicar cambios de algo publicado (`changes`) la deja pendiente.
 */
function reviewOnPublish(row: ContentRow, user: AuthUser, reviewed: boolean | undefined, nowIso: string, changes: boolean): string {
  if (reviewed) return JSON.stringify({ state: 'revisado', reviewerName: user.name, reviewerId: user.id, reviewedAt: nowIso });
  return changes ? PENDING_REVIEW : row.review;
}

function insertRevision(db: Db, contentId: string, authorId: string, payload: string, nowIso: string): RevisionRow {
  const id = newId();
  run(
    db,
    `INSERT INTO content_revisions (id, content_id, status, author_id, payload, created_at, updated_at) VALUES (?, ?, 'borrador', ?, ?, ?, ?)`,
    id,
    contentId,
    authorId,
    payload,
    nowIso,
    nowIso,
  );
  return get<RevisionRow>(db, 'SELECT * FROM content_revisions WHERE id = ?', id)!;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Archivos de los documentos
 * ──────────────────────────────────────────────────────────────────────────── */

/** Anota una versión de documento. Con `revisionId`, espera en esa revisión: el campus no la ve hasta publicarla. */
export function insertDocumentVersion(
  db: Db,
  v: { contentId: string; version: number; stored: StoredFile; userId: string; nowIso: string; note?: string; revisionId?: string | null },
): void {
  run(
    db,
    `INSERT INTO document_versions (content_id, version, file_id, size_kb, note, uploaded_at, uploaded_by, revision_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    v.contentId,
    v.version,
    v.stored.id,
    Math.max(1, Math.round(v.stored.size / 1024)),
    v.note ?? null,
    v.nowIso,
    v.userId,
    v.revisionId ?? null,
  );
}

/** Archivos de las versiones que esperan en una revisión. */
function pendingFiles(db: Db, revisionId: string): string[] {
  return all<{ file_id: string }>(db, 'SELECT file_id FROM document_versions WHERE revision_id = ? AND file_id IS NOT NULL', revisionId).map((f) => f.file_id);
}

/** Quita del registro archivos que ya no usa ninguna versión. Devuelve sus nombres para borrarlos del almacenamiento tras confirmar. */
function unregisterFiles(db: Db, fileIds: string[]): string[] {
  const names: string[] = [];
  for (const id of fileIds) {
    const file = get<{ storage_name: string }>(db, 'SELECT storage_name FROM files WHERE id = ?', id);
    run(db, 'DELETE FROM files WHERE id = ?', id);
    if (file) names.push(file.storage_name);
  }
  return names;
}

/**
 * Quién sustituye el PDF de un documento: el de un borrador que nunca se ha publicado, su autoría (o
 * administración); el de un documento publicado, solo administración. Un documento archivado, no.
 */
export function assertCanReplaceFile(user: AuthUser, row: ContentRow): void {
  if (row.type !== 'documento') throw notFound('No existe ningún documento con ese identificador.');
  if (row.status === 'archivado') throw conflict('El documento está archivado. Restáuralo antes de sustituir el archivo.', 'DOCUMENTO_ARCHIVADO');
  if (row.status === 'borrador' && !row.published_at) assertCanEdit(user, row);
  else if (!can(user.role, 'documentos:reemplazar')) throw forbidden('Solo administración puede sustituir el archivo de un documento publicado.');
}

export interface FileChange {
  content: ContentRow;
  /** Archivos que dejan de usarse: hay que borrarlos del almacenamiento. */
  removedFiles: string[];
}

/**
 * Sustituye el PDF de un documento conservando el historial. En un borrador que nunca se ha publicado,
 * la versión nueva es la vigente al momento. En un documento publicado, como el resto de sus cambios,
 * espera en la revisión pendiente (se abre si no la hay) y pasa a ser la vigente al publicarla; un PDF
 * nuevo sustituye al que ya esperaba y, si la revisión se descarta, se descarta con ella.
 */
export function replaceDocumentFile(db: Db, user: AuthUser, row: ContentRow, file: { stored: StoredFile; note?: string }, now: Date, ip?: string | null): FileChange {
  assertCanReplaceFile(user, row);
  const nowIso = now.toISOString();
  return transaction(db, () => {
    registerFile(db, file.stored, 'documento', user.id, nowIso);
    let revisionId: string | null = null;
    let replaced: string[] = [];
    if (row.status === 'publicado') {
      const open = openRevision(db, row.id) ?? insertRevision(db, row.id, user.id, row.payload, nowIso);
      revisionId = open.id;
      replaced = pendingFiles(db, open.id);
      run(db, 'DELETE FROM document_versions WHERE revision_id = ?', open.id);
      run(db, 'UPDATE content_revisions SET updated_at = ? WHERE id = ?', nowIso, open.id);
    }
    const next = (get<{ v: number | null }>(db, 'SELECT MAX(version) AS v FROM document_versions WHERE content_id = ?', row.id)?.v ?? 0) + 1;
    insertDocumentVersion(db, { contentId: row.id, version: next, stored: file.stored, userId: user.id, nowIso, note: file.note, revisionId });
    // La versión pública no cambia hasta publicar la revisión: tampoco su fecha de actualización.
    if (revisionId) bump(db, row, 'updated_at = updated_at', []);
    else bump(db, row, 'updated_at = ?', [nowIso]);
    const detail = `Versión ${next} (archivo ${file.stored.id})${revisionId ? ', pendiente de publicar con la revisión' : ''}`;
    audit(db, { actorId: user.id, action: 'documento.sustituir', entity: 'documento', entityId: row.id, detail, ip }, now);
    return { content: requireContent(db, row.id), removedFiles: unregisterFiles(db, replaced) };
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Operaciones editoriales
 * ──────────────────────────────────────────────────────────────────────────── */

export interface CreateOptions {
  id?: string;
  versions?: DocumentVersion[];
  ip?: string | null;
}

/** Crear es guardar el primer borrador: puede estar a medias (se valida con el esquema laxo). */
export function createContent(db: Db, user: AuthUser, type: ContentType, raw: unknown, now: Date, opts: CreateOptions = {}): ContentRow {
  if (!canHandleType(user.role, type)) throw forbidden(`Tu rol no permite crear contenidos de tipo ${TYPE_LABEL[type]}.`);
  check(user, 'guardar', 'borrador', true);
  const id = opts.id ?? newId();
  const payload = validatePayload(type, raw, { id, versions: opts.versions, draft: true });
  const meta = denormalize(type, payload);
  const nowIso = now.toISOString();
  transaction(db, () => {
    assertFitsWithOthers(db, type, payload, id, 'preparar');
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
      slugConflict(type, err);
    }
    audit(db, { actorId: user.id, action: 'contenido.crear', entity: type, entityId: id, ip: opts.ip }, now);
  });
  return requireContent(db, id);
}

export interface SaveResult {
  content: ContentRow;
  /** Si el contenido ya estaba publicado, los cambios quedan en una revisión pendiente de publicar. */
  pendingRevision: RevisionRow | null;
}

/** «Guardar borrador»: valida con el esquema laxo (el completo se exige al publicar). */
export function saveContent(db: Db, user: AuthUser, row: ContentRow, input: { revision: number; payload: unknown }, now: Date, ip?: string | null): SaveResult {
  assertHandlesType(user, row.type);
  assertRevision(row, input.revision);
  const isOwner = isOwnerOf(user, row);
  const nowIso = now.toISOString();
  return transaction(db, () => {
    if (row.status === 'publicado') {
      const open = openRevision(db, row.id);
      // La revisión de un contenido publicado es siempre un borrador: la versión pública no cambia.
      check(user, 'guardar', 'borrador', isOwner);
      const payload = validatePayload(row.type, input.payload, { id: row.id, versions: documentVersions(db, row.id, open?.id), draft: true });
      assertFitsWithOthers(db, row.type, payload, row.id, 'preparar');
      if (row.type === 'formacion' && versionOf(row.type, payload, row.version) < row.version) {
        throw badRequest(`La versión de la formación no puede ser inferior a la publicada (${row.version}).`, undefined, 'VERSION_NO_VALIDA');
      }
      if (open) run(db, 'UPDATE content_revisions SET payload = ?, updated_at = ? WHERE id = ?', JSON.stringify(payload), nowIso, open.id);
      else insertRevision(db, row.id, user.id, JSON.stringify(payload), nowIso);
      bump(db, row, 'updated_at = updated_at', []);
      audit(db, { actorId: user.id, action: 'contenido.guardar', entity: row.type, entityId: row.id, detail: 'Revisión de un contenido publicado', ip }, now);
    } else {
      check(user, 'guardar', row.status, isOwner);
      const payload = validatePayload(row.type, input.payload, { id: row.id, versions: documentVersions(db, row.id), draft: true });
      assertFitsWithOthers(db, row.type, payload, row.id, 'preparar');
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
  /** Al publicar: quien publica indica que el área lo ha revisado (se muestra «Revisado por …»). */
  reviewed?: boolean;
}

/**
 * Aplica una acción del flujo editorial: borrador → publicado; publicado ↔ archivado.
 * Si el contenido está publicado y tiene una revisión pendiente, «publicar» publica la revisión:
 * hasta entonces la versión pública no cambia. Publicar exige el esquema completo del tipo.
 */
export function transitionContent(db: Db, user: AuthUser, row: ContentRow, input: TransitionInput, now: Date, ip?: string | null): SaveResult {
  assertHandlesType(user, row.type);
  assertRevision(row, input.revision);
  const isOwner = isOwnerOf(user, row);
  const nowIso = now.toISOString();
  const { action } = input;

  return transaction(db, () => {
    const open = openRevision(db, row.id);

    if (row.status === 'publicado' && open && action === 'publicar') {
      check(user, 'publicar', 'borrador', isOwner);
      const payload = validatePayload(row.type, JSON.parse(open.payload), { id: row.id, versions: documentVersions(db, row.id, open.id) });
      assertFitsWithOthers(db, row.type, payload, row.id, 'publicar');
      const meta = denormalize(row.type, payload);
      const version = row.type === 'test' ? row.version + 1 : versionOf(row.type, payload, row.version);
      bump(db, row, 'payload = ?, title = ?, area = ?, slug = ?, version = ?, review = ?, updated_at = ?', [
        JSON.stringify(payload),
        meta.title,
        meta.area,
        meta.slug,
        version,
        reviewOnPublish(row, user, input.reviewed, nowIso, true),
        nowIso,
      ]);
      // El PDF nuevo que esperaba en la revisión pasa a ser la versión vigente del documento.
      const newFile = run(db, 'UPDATE document_versions SET revision_id = NULL WHERE revision_id = ?', open.id) > 0;
      run(db, "UPDATE content_revisions SET status = 'aprobada', decided_at = ?, decided_by = ?, updated_at = ? WHERE id = ?", nowIso, user.id, nowIso, open.id);
      const detail = newFile ? 'Revisión de un contenido publicado, con un PDF nuevo' : 'Revisión de un contenido publicado';
      audit(db, { actorId: user.id, action: 'contenido.publicar', entity: row.type, entityId: row.id, detail, ip }, now);
    } else {
      const to = check(user, action, row.status, isOwner);
      if (action === 'archivar' && open) {
        throw conflict('Este contenido tiene una revisión pendiente. Publícala o descártala antes de archivarlo.', 'REVISION_PENDIENTE');
      }
      if (action === 'publicar') {
        // Se valida con el esquema completo: un borrador puede estar a medias; lo publicado, no.
        const payload = validatePayload(row.type, JSON.parse(row.payload), { id: row.id, versions: documentVersions(db, row.id) });
        assertFitsWithOthers(db, row.type, payload, row.id, 'publicar');
        bump(db, row, 'status = ?, published_at = COALESCE(published_at, ?), review = ?, updated_at = ?', [to, nowIso, reviewOnPublish(row, user, input.reviewed, nowIso, false), nowIso]);
      } else {
        // Restaurar una evaluación la vuelve a hacer vigente: su área no puede tener ya otra.
        if (action === 'restaurar' && row.type === 'test') assertSingleAssessment(db, row.area, row.id, 'restaurar');
        bump(db, row, 'status = ?, updated_at = ?', [to, nowIso]);
      }
      audit(db, { actorId: user.id, action: `contenido.${action}`, entity: row.type, entityId: row.id, ip }, now);
    }
    return { content: requireContent(db, row.id), pendingRevision: openRevision(db, row.id) ?? null };
  });
}

/** Descarta la revisión pendiente de un contenido publicado, con el PDF nuevo que esperaba en ella. */
export function discardRevision(db: Db, user: AuthUser, row: ContentRow, revision: number, now: Date, ip?: string | null): FileChange {
  assertCanEdit(user, row);
  assertRevision(row, revision);
  const open = openRevision(db, row.id);
  if (!open) throw notFound('Este contenido no tiene ninguna revisión pendiente.');
  const nowIso = now.toISOString();
  const removedFiles = transaction(db, () => {
    const files = pendingFiles(db, open.id);
    run(db, 'DELETE FROM document_versions WHERE revision_id = ?', open.id);
    run(db, "UPDATE content_revisions SET status = 'descartada', decided_at = ?, decided_by = ?, updated_at = ? WHERE id = ?", nowIso, user.id, nowIso, open.id);
    bump(db, row, 'updated_at = updated_at', []);
    audit(db, { actorId: user.id, action: 'contenido.descartar-revision', entity: row.type, entityId: row.id, ip }, now);
    return unregisterFiles(db, files);
  });
  return { content: requireContent(db, row.id), removedFiles };
}

/**
 * Elimina un borrador que nunca se ha publicado. Devuelve los archivos que quedan huérfanos (versiones
 * de documento), ya fuera del registro, para borrarlos del almacenamiento.
 */
export function deleteDraft(db: Db, user: AuthUser, row: ContentRow, revision: number, now: Date, ip?: string | null): string[] {
  assertCanEdit(user, row);
  assertRevision(row, revision);
  if (row.status !== 'borrador' || row.published_at) {
    throw conflict('Solo se pueden eliminar borradores que nunca se han publicado. Para retirar un contenido publicado, archívalo.', 'NO_ELIMINABLE');
  }
  return transaction(db, () => {
    const files = all<{ file_id: string }>(db, 'SELECT file_id FROM document_versions WHERE content_id = ? AND file_id IS NOT NULL', row.id).map((f) => f.file_id);
    run(db, 'DELETE FROM contents WHERE id = ?', row.id);
    audit(db, { actorId: user.id, action: 'contenido.eliminar-borrador', entity: row.type, entityId: row.id, ip }, now);
    return unregisterFiles(db, files);
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
  const author = row.author_id ? get<{ name: string }>(db, 'SELECT name FROM users WHERE id = ?', row.author_id) : undefined;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    area: row.area,
    slug: row.slug,
    status: row.status,
    /** null = sin autoría (perfil eliminado). */
    authorId: row.author_id,
    authorName: author?.name ?? null,
    revision: row.revision,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    manualPhase: row.manual_phase,
    pendingRevision: open ? { id: open.id, status: open.status, authorId: open.author_id, updatedAt: open.updated_at } : null,
  };
}

/**
 * Administración ve todo (también lo que no tiene autoría); las personas autoras, solo sus contenidos
 * de los tipos con los que trabaja su rol (tras un cambio de rol, no la evaluación del área).
 */
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
  return all<ContentRow>(db, `SELECT * FROM contents ${clause} ORDER BY updated_at DESC`, ...params)
    .filter((row) => canHandleType(user.role, row.type))
    .map((row) => contentSummary(db, row));
}

/**
 * Gestión de contenidos · modelo común del espacio de trabajo, del creador y del editor.
 *
 * Une en una sola lista el contenido del campus (semilla y lo ya publicado en la demo) y los
 * borradores de Gestión (`useDemo.drafts`). Un borrador «rev-<id>» guarda los cambios de un contenido
 * publicado: la versión pública no cambia hasta que se publican, igual que en la API (tabla
 * content_revisions). Flujo editorial: «Guardar borrador» o «Publicar», sin revisión previa.
 */
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, ClipboardCheck, FileText, GraduationCap, Handshake, Megaphone, Newspaper, UserRoundPlus } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
  AREAS,
  can,
  canHandleType,
  ROLE_LABEL,
  type AreaId,
  type CampusEvent,
  type ContentType,
  type EditorialStatus,
  type Formation,
  type LibraryDocument,
  type NewClient,
  type NewsItem,
  type Person,
  type Quiz,
  type Role,
  type Scope,
  type SectorAssessment,
  type Welcome,
} from '@flm/shared';
import { seed } from '@flm/content';
import { mergeContent, useAssessments, useClients, useDocuments, useEvents, useFormations, useNews, usePeople } from '@/data/selectors';
import { useDemo, type CampusItem, type DraftRecord, type ExtraList } from '@/data/store';
import { itemToForm, normalizeForm, quizToForm, type AnyForm } from './forms';

export const CONTENT_TYPES: ContentType[] = ['formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado', 'cliente', 'bienvenida'];

export function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && (CONTENT_TYPES as string[]).includes(value);
}

/** Destino de cada tipo en el creador: dónde lo verá el equipo una vez publicado. */
export type CreatorGroup = 'aprender' | 'consultar' | 'participar' | 'inicio';

export interface TypeMeta {
  label: string;
  lower: string;
  /** «la formación», «la evaluación»… para la microcopia. */
  the: string;
  plural: string;
  newLabel: string;
  icon: LucideIcon;
  /** Qué es, en una línea (tarjetas del creador). */
  description: string;
  /** Dónde se ve una vez publicado. */
  destination: string;
  group: CreatorGroup;
}

export const TYPE_META: Record<ContentType, TypeMeta> = {
  formacion: {
    label: 'Formación',
    lower: 'formación',
    the: 'la formación',
    plural: 'Formaciones',
    newLabel: 'Nueva formación',
    icon: GraduationCap,
    description: 'Lectura por apartados con recuadros, ejemplo resuelto, apoyos interactivos, idea clave y test final de 3 preguntas.',
    destination: 'Aprender › su área',
    group: 'aprender',
  },
  test: {
    label: 'Evaluación del área',
    lower: 'evaluación del área',
    the: 'la evaluación del área',
    plural: 'Evaluaciones del área',
    newLabel: 'Evaluación del área',
    icon: ClipboardCheck,
    description: '«Pon a prueba tus conocimientos»: diez preguntas sobre las formaciones de un área. Se supera con 8.',
    destination: 'Aprender › su área › Evaluación',
    group: 'aprender',
  },
  noticia: {
    label: 'Noticia',
    lower: 'noticia',
    the: 'la noticia',
    plural: 'Noticias',
    newLabel: 'Nueva noticia',
    icon: Newspaper,
    description: 'Novedad en cinco bloques: qué cambia, a quién afecta, qué hacer, un ejemplo y la fuente.',
    destination: 'Consultar › Actualidad',
    group: 'consultar',
  },
  documento: {
    label: 'Documento',
    lower: 'documento',
    the: 'el documento',
    plural: 'Documentos',
    newLabel: 'Nuevo documento',
    icon: FileText,
    description: 'PDF original con su ficha, versión e historial de sustituciones.',
    destination: 'Consultar › Notas informativas',
    group: 'consultar',
  },
  evento: {
    label: 'Evento',
    lower: 'evento',
    the: 'el evento',
    plural: 'Eventos',
    newLabel: 'Nuevo evento',
    icon: CalendarDays,
    description: 'Encuentro, desayuno o formación interna, con una o varias sesiones, materiales y enlaces.',
    destination: 'Participar › Agenda',
    group: 'participar',
  },
  comunicado: {
    label: 'Comunicado',
    lower: 'comunicado',
    the: 'el comunicado',
    plural: 'Comunicados',
    newLabel: 'Nuevo comunicado',
    icon: Megaphone,
    description: 'Aviso para toda la firma: iniciativas, novedades internas o campañas, con fechas clave si las hay.',
    destination: 'Participar › Agenda',
    group: 'participar',
  },
  cliente: {
    label: 'Nuevo cliente',
    lower: 'cliente nuevo',
    the: 'el cliente nuevo',
    plural: 'Clientes nuevos',
    newLabel: 'Nuevo cliente',
    icon: Handshake,
    description: 'Empresa que empieza a trabajar con FLM: nombre, sector, país de origen y el área que lleva el encargo.',
    destination: 'Inicio › Ponte al día',
    group: 'inicio',
  },
  bienvenida: {
    label: 'Bienvenida',
    lower: 'bienvenida',
    the: 'la bienvenida',
    plural: 'Bienvenidas',
    newLabel: 'Nueva bienvenida',
    icon: UserRoundPlus,
    description: 'Anuncio de una persona que se suma al equipo, con un mensaje breve. La fecha de incorporación va en su ficha.',
    destination: 'Inicio › Ponte al día',
    group: 'inicio',
  },
};

export const GROUPS: { id: CreatorGroup; label: string; lede: string }[] = [
  { id: 'aprender', label: 'Aprender', lede: 'Formaciones con su test final y las evaluaciones de cada área.' },
  { id: 'consultar', label: 'Consultar', lede: 'Novedades en cinco bloques y documentos originales.' },
  { id: 'participar', label: 'Participar', lede: 'Encuentros, formaciones internas y avisos para toda la firma.' },
  { id: 'inicio', label: 'Inicio · Ponte al día', lede: 'Lo que el equipo ve nada más entrar: clientes nuevos y bienvenidas.' },
];

/** Lista de la demo donde queda lo publicado desde Gestión. */
export const EXTRA_LIST: Record<ContentType, ExtraList> = {
  formacion: 'extraFormations',
  test: 'extraAssessments',
  noticia: 'extraNews',
  documento: 'extraDocuments',
  evento: 'extraEvents',
  comunicado: 'extraEvents',
  cliente: 'extraClients',
  bienvenida: 'extraWelcomes',
};

/** Contenido semilla de cada tipo (no cambia: los cambios de la demo van aparte). */
export function seedItems(type: ContentType): readonly CampusItem[] {
  switch (type) {
    case 'formacion':
      return seed.formations;
    case 'test':
      return seed.assessments;
    case 'noticia':
      return seed.news;
    case 'documento':
      return seed.documents;
    case 'evento':
    case 'comunicado':
      return seed.events.filter((e) => e.kind === type);
    case 'cliente':
      return seed.clients;
    case 'bienvenida':
      return seed.welcomes;
  }
}

/** Quién puede empezar un tipo desde el creador (regla compartida: la evaluación del área es de administración). */
export function canCreateType(role: Role, type: ContentType): boolean {
  return can(role, 'contenido:crear') && canHandleType(role, type);
}

/** Motivo del rechazo cuando el rol no trabaja con un tipo de contenido (la evaluación del área es de administración). */
export const typeNotAllowed = (role: Role, type: ContentType) => `Tu perfil (${ROLE_LABEL[role]}) no puede modificar ni publicar ${TYPE_META[type].plural.toLowerCase()}.`;

/** Datos que Gestión guarda dentro de `DraftRecord.data`. */
export interface DraftData {
  /** 1: editor anterior · 2: creador actual. Los dos se leen con `normalizeForm`. */
  schema: 1 | 2;
  form: AnyForm;
  /** Contenido publicado del que este borrador guarda cambios (revisión). */
  sourceId?: string;
  /** Borrador de ejemplo de la demostración (rotulado). */
  example?: boolean;
  /** Primera publicación. */
  publishedAt?: string;
  /** Ya está en las listas públicas de la demo (Aprender, Actualidad, Agenda, Inicio…). */
  mirrored?: boolean;
  /** Dirección pública fijada al publicar por primera vez. */
  publishedSlug?: string;
  /** Quién marcó al publicar que el área lo había revisado (nombre e id, como `review` del contenido). */
  reviewerName?: string;
  reviewerId?: string;
  /** Test final del editor anterior que aún hay que pasar a su formación (migración v3 de la demo). */
  pendingQuiz?: Quiz;
}

const normalized = new WeakMap<object, DraftData | null>();

/** Datos del borrador con el formulario puesto al día (los borradores antiguos no se rompen). */
export function readDraft(d: DraftRecord | undefined): DraftData | null {
  const raw = d?.data as (Partial<DraftData> & { form?: unknown }) | undefined;
  if (!raw || typeof raw !== 'object') return null;
  if (normalized.has(raw)) return normalized.get(raw) ?? null;
  const form = raw.form ? normalizeForm(raw.form) : null;
  const result = form ? ({ ...raw, schema: raw.schema === 1 ? 1 : 2, form } as DraftData) : null;
  normalized.set(raw, result);
  return result;
}

/** Test pendiente de un borrador de revisión creado al migrar (sin formulario todavía). */
export function pendingQuizOf(d: DraftRecord | undefined): Quiz | undefined {
  const raw = d?.data as Partial<DraftData> | undefined;
  return raw && !raw.form && raw.pendingQuiz ? raw.pendingQuiz : undefined;
}

/** Formulario de esa revisión migrada: el de su formación con el test pendiente en «Test final». */
export function formWithPendingQuiz(base: AnyForm | undefined, d: DraftRecord | undefined): AnyForm | undefined {
  const quiz = pendingQuizOf(d);
  return quiz && base?.type === 'formacion' ? { ...base, quiz: quizToForm(quiz) } : undefined;
}

export const revisionId = (contentId: string) => `rev-${contentId}`;

export interface ContentRow {
  key: string;
  /** Identificador sobre el que se actúa: borrador de Gestión o contenido del campus. */
  id: string;
  type: ContentType;
  title: string;
  area: Scope | null;
  status: EditorialStatus;
  /** Persona que guardó la fila (en unos cambios de algo publicado, quien los empezó). */
  authorId?: string;
  /**
   * Autoría del contenido, la que decide los permisos y se muestra en Gestión: en los cambios de algo
   * publicado, la de ese contenido (como en la API). Sin ella, o si la persona ya no está en el campus,
   * la fila se rotula «Sin autoría».
   */
  ownerId?: string;
  updatedAt: string;
  /** La fecha de actualización no tiene hora (contenido semilla con fecha AAAA-MM-DD). */
  dateOnly?: boolean;
  publishedAt?: string;
  /** Borrador de Gestión que representa la fila (si existe). */
  draft?: DraftRecord;
  /** Si la fila guarda cambios de un contenido publicado, id de ese contenido. */
  revisionOf?: string;
  /** Cambios guardados sin publicar de un contenido publicado. */
  openRevision?: DraftRecord;
  /** Página pública del contenido, si está publicado. */
  publicHref?: string;
  example?: boolean;
  origin: 'campus' | 'gestion';
  /** Slug público (formación, noticia, evento). */
  slug?: string;
  /** Persona a la que se da la bienvenida. */
  personId?: string;
}

/** Página pública de un contenido publicado. Clientes y bienvenidas se ven en Inicio («Ponte al día»). */
export function hrefFor(type: ContentType, area: string | null, slug: string | undefined, id: string): string | undefined {
  switch (type) {
    case 'formacion':
      return area && slug ? `/aprender/${area}/${slug}` : undefined;
    case 'test':
      return area ? `/aprender/${area}/evaluacion` : undefined;
    case 'noticia':
      return slug ? `/consultar/actualidad/${slug}` : undefined;
    case 'documento':
      return `/consultar/notas/${id}`;
    case 'evento':
    case 'comunicado':
      return slug ? `/participar/agenda/${slug}` : undefined;
    case 'cliente':
    case 'bienvenida':
      return '/';
  }
}

/** Ruta del editor para una fila: los cambios de algo publicado se abren desde su contenido. */
export function editHref(row: Pick<ContentRow, 'id' | 'revisionOf'>): string {
  return `/gestion/editar/${encodeURIComponent(row.revisionOf ?? row.id)}`;
}

/** Título de un formulario. Las bienvenidas se titulan con el nombre de la persona (solo en Gestión). */
export function formTitle(form: AnyForm, nameOf?: (id: string) => string | undefined): string {
  switch (form.type) {
    case 'noticia':
      return form.headline.trim();
    case 'test':
      return `Evaluación del área ${AREAS[form.area].name}`;
    case 'cliente':
      return form.name.trim();
    case 'bienvenida': {
      const name = form.personId ? nameOf?.(form.personId) : undefined;
      return name ? `Bienvenida a ${name}` : form.personId ? 'Bienvenida' : '';
    }
    default:
      return form.title.trim();
  }
}

export function formArea(form: AnyForm): Scope | null {
  switch (form.type) {
    case 'formacion':
    case 'test':
    case 'noticia':
    case 'documento':
    case 'cliente':
      return form.area;
    default:
      return null;
  }
}

const ts = (s: string | undefined) => (s ? (s.length === 10 ? `${s}T12:00:00.000Z` : s) : '');

function openRevisionIn(drafts: Record<string, DraftRecord>, id: string) {
  const r = drafts[revisionId(id)];
  return r && r.status === 'borrador' ? r : undefined;
}

/** Fila de Gestión para un borrador (también justo después de guardarlo). */
export function draftRow(d: DraftRecord, drafts: Record<string, DraftRecord>, nameOf?: (id: string) => string | undefined): ContentRow | null {
  const data = readDraft(d);
  if (!data) return null;
  const area = formArea(data.form);
  const slug = data.publishedSlug ?? ('slug' in data.form ? data.form.slug : undefined);
  return {
    key: `d:${d.id}`,
    id: d.id,
    type: d.type,
    title: formTitle(data.form, nameOf) || d.title || 'Sin título',
    area,
    status: d.status,
    authorId: d.authorId || undefined,
    // En los cambios de algo publicado, la autoría de ese contenido (la de la semilla la completa contentRows).
    ownerId: (data.sourceId ? drafts[data.sourceId]?.authorId : d.authorId) || undefined,
    updatedAt: d.updatedAt,
    publishedAt: data.publishedAt,
    draft: d,
    revisionOf: data.sourceId,
    openRevision: data.sourceId ? undefined : openRevisionIn(drafts, d.id),
    publicHref: d.status === 'publicado' && data.mirrored ? hrefFor(d.type, area, slug, d.id) : undefined,
    example: data.example,
    origin: 'gestion',
    slug,
    personId: data.form.type === 'bienvenida' ? data.form.personId : undefined,
  };
}

/** Bienvenidas del campus sin filtrar por persona (Gestión también ve las de personas inactivas). */
function useWelcomeItems(): Welcome[] {
  const statuses = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraWelcomes);
  const overrides = useDemo((s) => s.contentOverrides);
  return useMemo(() => mergeContent(extra, seed.welcomes, overrides, statuses), [extra, overrides, statuses]);
}

/** Contenido del campus y estado de la demo del que salen las filas de Gestión. */
export interface RowSources {
  formations: readonly Formation[];
  /** Todas, también las archivadas: su estado está en `statuses`. */
  assessments: readonly SectorAssessment[];
  statuses: Readonly<Record<string, EditorialStatus>>;
  news: readonly NewsItem[];
  documents: readonly LibraryDocument[];
  events: readonly CampusEvent[];
  clients: readonly NewClient[];
  welcomes: readonly Welcome[];
  drafts: Record<string, DraftRecord>;
  removed: Readonly<Record<string, string>>;
  people: readonly Person[];
}

/** Todas las filas de Gestión, sin filtrar por permisos. */
export function contentRows({ formations, assessments, statuses, news, documents, events, clients, welcomes, drafts, removed, people }: RowSources): ContentRow[] {
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name;
  const rows: ContentRow[] = [];
  const openRevisionFor = (id: string) => openRevisionIn(drafts, id);
  // Las bienvenidas de un perfil eliminado se retiran con él (en la API se borran).
  const gone = (personId: string | undefined) => !!personId && !!removed[personId];

  for (const d of Object.values(drafts)) {
    const row = draftRow(d, drafts, nameOf);
    if (row && !gone(row.personId)) rows.push(row);
  }

  const push = (row: Omit<ContentRow, 'key' | 'origin' | 'openRevision' | 'ownerId'>) => {
    // Lo publicado desde Gestión ya tiene su fila de borrador.
    if (drafts[row.id]) return;
    rows.push({ ...row, ownerId: row.authorId, dateOnly: row.updatedAt.endsWith('T12:00:00.000Z'), key: `c:${row.id}`, origin: 'campus', openRevision: openRevisionFor(row.id) });
  };
  const live = (status: EditorialStatus, type: ContentType, area: string | null, slug: string | undefined, id: string) => (status === 'publicado' ? hrefFor(type, area, slug, id) : undefined);

  for (const f of formations) {
    push({
      id: f.id,
      type: 'formacion',
      title: f.title,
      area: f.area,
      status: f.editorial.status,
      authorId: f.editorial.authorId,
      updatedAt: ts(f.editorial.updatedAt ?? f.editorial.publishedAt ?? f.verifiedAt),
      publishedAt: f.editorial.publishedAt,
      publicHref: live(f.editorial.status, 'formacion', f.area, f.slug, f.id),
      slug: f.slug,
    });
  }
  for (const a of assessments) {
    // Sin estado editorial propio: publicadas salvo que administración las archive.
    const status = statuses[a.id] ?? 'publicado';
    push({ id: a.id, type: 'test', title: `Evaluación del área ${AREAS[a.area].name}`, area: a.area, status, updatedAt: '', publicHref: live(status, 'test', a.area, undefined, a.id) });
  }
  for (const n of news) {
    push({
      id: n.id,
      type: 'noticia',
      title: n.headline,
      area: n.area,
      status: n.editorial.status,
      authorId: n.editorial.authorId,
      updatedAt: ts(n.editorial.updatedAt ?? n.editorial.publishedAt ?? n.date),
      publishedAt: n.editorial.publishedAt,
      publicHref: live(n.editorial.status, 'noticia', n.area, n.slug, n.id),
      slug: n.slug,
    });
  }
  for (const d of documents) {
    const last = [...d.versions].sort((a, b) => b.version - a.version)[0];
    push({
      id: d.id,
      type: 'documento',
      title: d.title,
      area: d.area,
      status: d.editorial.status,
      authorId: d.editorial.authorId,
      updatedAt: ts(last?.uploadedAt ?? d.editorial.updatedAt ?? d.editorial.publishedAt ?? d.date),
      publishedAt: d.editorial.publishedAt,
      publicHref: live(d.editorial.status, 'documento', d.area, undefined, d.id),
    });
  }
  for (const e of events) {
    push({
      id: e.id,
      type: e.kind,
      title: e.title,
      area: null,
      status: e.editorial.status,
      authorId: e.editorial.authorId,
      updatedAt: ts(e.editorial.updatedAt ?? e.editorial.publishedAt),
      publishedAt: e.editorial.publishedAt,
      publicHref: live(e.editorial.status, e.kind, null, e.slug, e.id),
      slug: e.slug,
    });
  }
  for (const c of clients) {
    push({
      id: c.id,
      type: 'cliente',
      title: c.name,
      area: c.area,
      status: c.editorial.status,
      authorId: c.editorial.authorId,
      updatedAt: ts(c.editorial.updatedAt ?? c.editorial.publishedAt ?? c.date),
      publishedAt: c.editorial.publishedAt,
      publicHref: live(c.editorial.status, 'cliente', c.area, undefined, c.id),
      example: c.fictional,
    });
  }
  for (const w of welcomes) {
    if (gone(w.personId)) continue;
    const name = nameOf(w.personId);
    push({
      id: w.id,
      type: 'bienvenida',
      title: name ? `Bienvenida a ${name}` : 'Bienvenida',
      area: null,
      status: w.editorial.status,
      authorId: w.editorial.authorId,
      updatedAt: ts(w.editorial.updatedAt ?? w.editorial.publishedAt ?? w.date),
      publishedAt: w.editorial.publishedAt,
      publicHref: live(w.editorial.status, 'bienvenida', null, undefined, w.id),
      personId: w.personId,
    });
  }

  // Los cambios guardados de algo publicado son de quien firma ese contenido, no de quien los empezó.
  const byId = new Map(rows.filter((r) => !r.revisionOf).map((r) => [r.id, r]));
  for (const r of rows) {
    const base = r.revisionOf ? byId.get(r.revisionOf) : undefined;
    if (base) r.ownerId = base.ownerId;
  }
  // Revisión que dejó la migración v3 con el test final del editor anterior, aún sin formulario: se
  // rotula con su formación para poder abrirla, publicarla o descartarla.
  for (const d of Object.values(drafts)) {
    const sourceId = (d.data as Partial<DraftData> | undefined)?.sourceId;
    const base = sourceId && d.status === 'borrador' && pendingQuizOf(d) ? byId.get(sourceId) : undefined;
    if (!base) continue;
    rows.push({ key: `d:${d.id}`, id: d.id, type: d.type, title: base.title, area: base.area, status: 'borrador', authorId: d.authorId || undefined, ownerId: base.ownerId, updatedAt: d.updatedAt, draft: d, revisionOf: base.id, origin: 'gestion' });
  }

  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Todas las filas de Gestión, sin filtrar por permisos. */
export function useContentRows(): ContentRow[] {
  const formations = useFormations(true);
  // Gestión ve todas las evaluaciones del área, también las archivadas, con su estado real.
  const assessments = useAssessments(true);
  const statuses = useDemo((s) => s.statusOverrides);
  const news = useNews(true);
  const documents = useDocuments(true);
  const events = useEvents(true);
  const clients = useClients(true);
  const welcomes = useWelcomeItems();
  const drafts = useDemo((s) => s.drafts);
  const removed = useDemo((s) => s.removedPeople);
  const people = usePeople();
  return useMemo(
    () => contentRows({ formations, assessments, statuses, news, documents, events, clients, welcomes, drafts, removed, people }),
    [formations, assessments, statuses, news, documents, events, clients, welcomes, drafts, removed, people],
  );
}

export interface CampusEntry {
  type: ContentType;
  item: CampusItem;
  form: AnyForm;
}

/** Contenido del campus (semilla o publicado aquí, con sus revisiones publicadas) por id, con su formulario. */
export function useCampusForms(): (id: string) => CampusEntry | null {
  const formations = useFormations(true);
  const assessments = useAssessments(true);
  const news = useNews(true);
  const documents = useDocuments(true);
  const events = useEvents(true);
  const clients = useClients(true);
  const welcomes = useWelcomeItems();
  return useCallback(
    (id: string) => {
      const entry = (type: ContentType, item: CampusItem | undefined): CampusEntry | null => (item ? { type, item, form: itemToForm(type, item) } : null);
      return (
        entry('formacion', formations.find((x) => x.id === id)) ??
        entry('test', assessments.find((x) => x.id === id)) ??
        entry('noticia', news.find((x) => x.id === id)) ??
        entry('documento', documents.find((x) => x.id === id)) ??
        (() => {
          const e = events.find((x) => x.id === id);
          return e ? entry(e.kind, e) : null;
        })() ??
        entry('cliente', clients.find((x) => x.id === id)) ??
        entry('bienvenida', welcomes.find((x) => x.id === id))
      );
    },
    [formations, assessments, news, documents, events, clients, welcomes],
  );
}

/** Formulario que representa una fila (borrador de Gestión o contenido del campus). */
export function rowForm(row: ContentRow, campus: (id: string) => { form: AnyForm } | null): AnyForm | null {
  if (row.draft) {
    const form = readDraft(row.draft)?.form;
    if (form) return form;
    // Revisión migrada sin formulario: su formación con el test pendiente.
    return (row.revisionOf ? formWithPendingQuiz(campus(row.revisionOf)?.form, row.draft) : undefined) ?? null;
  }
  return campus(row.id)?.form ?? null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Permisos por fila (reflejo de la API: canEdit / checkTransition)
 * ──────────────────────────────────────────────────────────────────────────── */

export type Actor = Person & { effectiveRole: Role };

/** Si la persona firma el contenido de la fila (en unos cambios de algo publicado, ese contenido). */
export const isOwnRow = (actor: Pick<Actor, 'id'>, row: Pick<ContentRow, 'ownerId'>) => !!row.ownerId && row.ownerId === actor.id;

/**
 * Si puede modificar el contenido de la fila: el tipo es de su rol (`canHandleType`: la evaluación del
 * área es de administración aunque figure como propia) y el contenido es suyo o es administración.
 */
export function canEditRow(actor: Pick<Actor, 'id' | 'effectiveRole'>, row: Pick<ContentRow, 'ownerId' | 'type'>): boolean {
  const role = actor.effectiveRole;
  if (!canHandleType(role, row.type)) return false;
  return can(role, 'contenido:editar-cualquiera') || (isOwnRow(actor, row) && can(role, 'contenido:editar-propio'));
}

/**
 * Qué ve cada perfil en Gestión: administración, todo; autoría, lo suyo en cualquier estado
 * y lo publicado por otras personas (solo lectura).
 */
export function canSeeRow(actor: Actor, row: ContentRow): boolean {
  if (can(actor.effectiveRole, 'contenido:editar-cualquiera')) return true;
  return isOwnRow(actor, row) || (row.status === 'publicado' && !row.revisionOf);
}

/**
 * «Sin autoría»: el contenido no tiene persona autora (las evaluaciones del área) o su perfil ya no está
 * en el campus; lleva la firma neutra y solo lo edita administración. Es el filtro de Gestión y el
 * recuento del resumen de Administración, para que la cifra coincida con lo que se ve.
 */
export function withoutAuthor(row: Pick<ContentRow, 'ownerId'>, people: readonly Pick<Person, 'id'>[]): boolean {
  return !row.ownerId || !people.some((p) => p.id === row.ownerId);
}

/**
 * Evaluación de un área, publicada o en borrador (las archivadas no cuentan): como mucho una por área.
 * El creador y el editor llevan a ella en lugar de empezar otra; `exceptId` es la que se está editando.
 */
export function areaAssessmentRow(rows: readonly ContentRow[], area: AreaId, exceptId?: string): ContentRow | undefined {
  const own = rows.filter((r) => r.type === 'test' && !r.revisionOf && r.area === area && r.status !== 'archivado' && r.id !== exceptId);
  return own.find((r) => r.status === 'publicado') ?? own[0];
}

/** Áreas para las etiquetas de los filtros. */
export const AREA_FILTERS: { value: AreaId | 'general'; label: string }[] = [...Object.values(AREAS).map((a) => ({ value: a.id, label: a.name })), { value: 'general', label: 'Toda la firma' }];

/**
 * Dónde se verá un contenido una vez publicado. Con el área ya elegida, formaciones y evaluaciones
 * dicen la suya («Aprender › Laboral»); sin ella, el destino genérico del tipo («Aprender › su área»).
 */
export function destinationOf(type: ContentType, area?: Scope | null): string {
  if ((type === 'formacion' || type === 'test') && area && area !== 'general') {
    const name = AREAS[area].name;
    return type === 'test' ? `Aprender › ${name} › Evaluación` : `Aprender › ${name}`;
  }
  return TYPE_META[type].destination;
}

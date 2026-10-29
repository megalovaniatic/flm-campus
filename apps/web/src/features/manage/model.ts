/**
 * Gestión de contenidos · modelo común del espacio de trabajo y del editor.
 *
 * Une en una sola lista el contenido del campus (semilla y lo ya incorporado en la demo)
 * y los borradores de Gestión (`useDemo.drafts`). Un borrador «rev-<id>» es la revisión
 * pendiente de un contenido publicado: la versión pública no cambia hasta que se publica,
 * igual que en la API (tabla content_revisions).
 */
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, FileText, GraduationCap, ListChecks, Megaphone, Newspaper } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { can, type AreaId, type ContentType, type EditorialStatus, type Person, type Role } from '@flm/shared';
import { useDocuments, useEvents, useFormations, useNews } from '@/data/selectors';
import { useDemo, type DraftRecord } from '@/data/store';
import { documentToForm, eventToForm, formationToForm, newsToForm, type AnyForm } from './forms';

export const CONTENT_TYPES: ContentType[] = ['formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado'];

export function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && (CONTENT_TYPES as string[]).includes(value);
}

export interface TypeMeta {
  label: string;
  lower: string;
  /** «la formación», «el test»… para la microcopia. */
  the: string;
  plural: string;
  newLabel: string;
  icon: LucideIcon;
  template: string;
  /** Dónde se ve una vez publicado. */
  destination: string;
}

export const TYPE_META: Record<ContentType, TypeMeta> = {
  formacion: {
    label: 'Formación',
    lower: 'formación',
    the: 'la formación',
    plural: 'Formaciones',
    newLabel: 'Nueva formación',
    icon: GraduationCap,
    template: 'Lectura con resultados de aprendizaje, bloques, ejemplo resuelto e idea clave.',
    destination: 'Aprender',
  },
  test: {
    label: 'Test',
    lower: 'test',
    the: 'el test',
    plural: 'Tests',
    newLabel: 'Nuevo test',
    icon: ListChecks,
    template: 'Tres preguntas con explicación y «por qué no» en cada opción incorrecta. Se aprueba con 2 de 3.',
    destination: 'Aprender, al final de su formación',
  },
  noticia: {
    label: 'Noticia',
    lower: 'noticia',
    the: 'la noticia',
    plural: 'Noticias',
    newLabel: 'Nueva noticia',
    icon: Newspaper,
    template: 'Los cinco bloques de Actualidad: la novedad, a quién afecta, qué hacer, un ejemplo y la fuente.',
    destination: 'Consultar › Actualidad',
  },
  documento: {
    label: 'Documento',
    lower: 'documento',
    the: 'el documento',
    plural: 'Documentos',
    newLabel: 'Nuevo documento',
    icon: FileText,
    template: 'PDF original con metadatos, versión e historial de sustituciones.',
    destination: 'Consultar › Notas informativas',
  },
  evento: {
    label: 'Evento',
    lower: 'evento',
    the: 'el evento',
    plural: 'Eventos',
    newLabel: 'Nuevo evento',
    icon: CalendarDays,
    template: 'Una o varias sesiones en hora de Madrid, icono y enlaces.',
    destination: 'Participar › Agenda',
  },
  comunicado: {
    label: 'Comunicado',
    lower: 'comunicado',
    the: 'el comunicado',
    plural: 'Comunicados',
    newLabel: 'Nuevo comunicado',
    icon: Megaphone,
    template: 'Aviso para toda la firma, con fechas clave opcionales.',
    destination: 'Participar › Agenda',
  },
};

/** Datos que Gestión guarda dentro de `DraftRecord.data`. */
export interface DraftData {
  schema: 1;
  form: AnyForm;
  /** Contenido publicado del que este borrador es una revisión. */
  sourceId?: string;
  /** Borrador de ejemplo de la demostración (rotulado). */
  example?: boolean;
  /** Primera publicación. */
  publishedAt?: string;
  /** Se ha incorporado ya a las listas públicas de la demo (Actualidad, Notas, Agenda). */
  mirrored?: boolean;
  /** Dirección pública fijada al publicar por primera vez. */
  publishedSlug?: string;
  reviewerName?: string;
}

export function readDraft(d: DraftRecord): DraftData | null {
  const data = d.data as Partial<DraftData> | undefined;
  if (!data || typeof data !== 'object' || !data.form || typeof data.form !== 'object') return null;
  return data as DraftData;
}

export const revisionId = (contentId: string) => `rev-${contentId}`;

export interface ContentRow {
  key: string;
  /** Identificador sobre el que se actúa: borrador de Gestión o contenido del campus. */
  id: string;
  type: ContentType;
  title: string;
  area: AreaId | 'general' | null;
  status: EditorialStatus;
  authorId: string;
  updatedAt: string;
  /** La fecha de actualización no tiene hora (contenido semilla con fecha AAAA-MM-DD). */
  dateOnly?: boolean;
  publishedAt?: string;
  /** Borrador de Gestión que representa la fila (si existe). */
  draft?: DraftRecord;
  /** Si la fila es una revisión pendiente, id del contenido publicado. */
  revisionOf?: string;
  /** Revisión abierta (borrador o en revisión) de un contenido publicado. */
  openRevision?: DraftRecord;
  returnComment?: string;
  /** Página pública del contenido, si está publicado. */
  publicHref?: string;
  example?: boolean;
  origin: 'campus' | 'gestion';
  /** Slug público (formación, noticia, evento). */
  slug?: string;
}

function hrefFor(type: ContentType, area: string | null, slug: string | undefined, id: string): string | undefined {
  switch (type) {
    case 'formacion':
      return area && slug ? `/aprender/${area}/${slug}` : undefined;
    case 'noticia':
      return slug ? `/consultar/actualidad/${slug}` : undefined;
    case 'documento':
      return `/consultar/notas/${id}`;
    case 'evento':
    case 'comunicado':
      return slug ? `/participar/agenda/${slug}` : undefined;
    default:
      return undefined;
  }
}

/** Ruta del editor para una fila: las revisiones se abren desde su contenido publicado. */
export function editHref(row: Pick<ContentRow, 'id' | 'revisionOf'>): string {
  return `/gestion/editar/${encodeURIComponent(row.revisionOf ?? row.id)}`;
}

export function formTitle(form: AnyForm): string {
  const t = form.type === 'noticia' ? form.headline : form.title;
  return t.trim();
}

export function formArea(form: AnyForm): AreaId | 'general' | null {
  switch (form.type) {
    case 'formacion':
    case 'noticia':
      return form.area;
    case 'documento':
      return form.area;
    default:
      return null;
  }
}

const ts = (s: string | undefined) => (s ? (s.length === 10 ? `${s}T12:00:00.000Z` : s) : '');

function openRevisionIn(drafts: Record<string, DraftRecord>, id: string) {
  const r = drafts[revisionId(id)];
  return r && (r.status === 'borrador' || r.status === 'en-revision') ? r : undefined;
}

/** Fila de Gestión para un borrador (también justo después de guardarlo). */
export function draftRow(d: DraftRecord, drafts: Record<string, DraftRecord>): ContentRow | null {
  const data = readDraft(d);
  if (!data) return null;
  const area = formArea(data.form);
  const slug = data.publishedSlug;
  return {
    key: `d:${d.id}`,
    id: d.id,
    type: d.type,
    title: d.title || formTitle(data.form) || 'Sin título',
    area,
    status: d.status,
    authorId: d.authorId,
    updatedAt: d.updatedAt,
    publishedAt: data.publishedAt,
    draft: d,
    revisionOf: data.sourceId,
    openRevision: data.sourceId ? undefined : openRevisionIn(drafts, d.id),
    returnComment: d.returnComment,
    publicHref: d.status === 'publicado' && data.mirrored ? hrefFor(d.type, area, slug, d.id) : undefined,
    example: data.example,
    origin: 'gestion',
    slug,
  };
}

/** Todas las filas de Gestión, sin filtrar por permisos. */
export function useContentRows(): ContentRow[] {
  const formations = useFormations(true);
  const news = useNews(true);
  const documents = useDocuments(true);
  const events = useEvents(true);
  const drafts = useDemo((s) => s.drafts);

  return useMemo(() => {
    const rows: ContentRow[] = [];
    const openRevisionFor = (id: string) => openRevisionIn(drafts, id);

    for (const d of Object.values(drafts)) {
      const row = draftRow(d, drafts);
      if (row) rows.push(row);
    }

    const push = (row: Omit<ContentRow, 'key' | 'origin' | 'openRevision'>) => {
      // Lo publicado desde Gestión ya tiene su fila de borrador.
      if (drafts[row.id]) return;
      rows.push({ ...row, dateOnly: row.updatedAt.endsWith('T12:00:00.000Z'), key: `c:${row.id}`, origin: 'campus', openRevision: openRevisionFor(row.id) });
    };

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
        returnComment: f.editorial.returnComment,
        publicHref: f.editorial.status === 'publicado' ? hrefFor('formacion', f.area, f.slug, f.id) : undefined,
        slug: f.slug,
      });
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
        returnComment: n.editorial.returnComment,
        publicHref: n.editorial.status === 'publicado' ? hrefFor('noticia', n.area, n.slug, n.id) : undefined,
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
        returnComment: d.editorial.returnComment,
        publicHref: d.editorial.status === 'publicado' ? hrefFor('documento', d.area, undefined, d.id) : undefined,
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
        returnComment: e.editorial.returnComment,
        publicHref: e.editorial.status === 'publicado' ? hrefFor(e.kind, null, e.slug, e.id) : undefined,
        slug: e.slug,
      });
    }

    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [formations, news, documents, events, drafts]);
}

/** Formulario de un contenido del campus (semilla o ya incorporado), para editarlo o previsualizarlo. */
export function useCampusForms(): (id: string) => { type: ContentType; form: AnyForm } | null {
  const formations = useFormations(true);
  const news = useNews(true);
  const documents = useDocuments(true);
  const events = useEvents(true);
  return useCallback(
    (id: string) => {
      const f = formations.find((x) => x.id === id);
      if (f) return { type: 'formacion' as const, form: formationToForm(f) };
      const n = news.find((x) => x.id === id);
      if (n) return { type: 'noticia' as const, form: newsToForm(n) };
      const d = documents.find((x) => x.id === id);
      if (d) return { type: 'documento' as const, form: documentToForm(d) };
      const e = events.find((x) => x.id === id);
      if (e) return { type: e.kind, form: eventToForm(e) };
      return null;
    },
    [formations, news, documents, events],
  );
}

/** Formulario que representa una fila (borrador de Gestión o contenido del campus). */
export function rowForm(row: ContentRow, campus: (id: string) => { form: AnyForm } | null): AnyForm | null {
  if (row.draft) return readDraft(row.draft)?.form ?? null;
  return campus(row.id)?.form ?? null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Permisos por fila (reflejo de la API: canEdit / checkTransition)
 * ──────────────────────────────────────────────────────────────────────────── */

export type Actor = Person & { effectiveRole: Role };

export function canEditRow(actor: Actor, row: Pick<ContentRow, 'authorId'>): boolean {
  const role = actor.effectiveRole;
  return can(role, 'contenido:editar-cualquiera') || (row.authorId === actor.id && can(role, 'contenido:editar-propio'));
}

/**
 * Qué ve cada perfil en Gestión: administración, todo; autoría, lo suyo en cualquier estado
 * y lo publicado por otras personas (solo lectura).
 */
export function canSeeRow(actor: Actor, row: ContentRow): boolean {
  if (can(actor.effectiveRole, 'contenido:editar-cualquiera')) return true;
  return row.authorId === actor.id || (row.status === 'publicado' && !row.revisionOf);
}

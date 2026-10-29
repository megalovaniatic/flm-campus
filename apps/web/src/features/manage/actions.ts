/**
 * Acciones editoriales de la demo: aplican el flujo de `checkTransition()` sobre el estado local
 * (useDemo), dejan constancia en la auditoría con los mismos códigos que la API (contenido.publicar,
 * contenido.archivar…) y devuelven una función para deshacer.
 *
 * Flujo: «Guardar borrador» o «Publicar». La autoría publica lo suyo y administración, cualquier
 * contenido; archivar y restaurar es solo de administración. Publicar por primera vez incorpora el
 * contenido a su sitio (Aprender, Consultar, Participar o Inicio); publicar los cambios de algo ya
 * publicado sustituye la versión vigente (`contentOverrides`), igual que en la API.
 *
 * Como la API, no se fía de lo que dice la fila: la propiedad se lee del estado de la demo (la del
 * contenido, también en sus cambios guardados) y el tipo se comprueba en cada acción (`canHandleType`).
 */
import {
  ACTION_LABEL,
  AREAS,
  assessmentClashReason,
  can,
  canHandleType,
  checkTransition,
  madridDateKey,
  type AreaId,
  type CampusEvent,
  type ContentType,
  type DocumentVersion,
  type EditorialAction,
  type EditorialMeta,
  type EditorialStatus,
  type Formation,
  type LibraryDocument,
  type SectorAssessment,
} from '@flm/shared';
import { seed } from '@flm/content';
import { toast, useToasts } from '@/design';
import { demoPeople } from '@/data/selectors';
import { useDemo, type CampusItem, type DraftRecord, type ExtraList } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { formToItem, uniqueSlug, validateForm, type AnyForm, type FieldError } from './forms';
import { canEditRow, destinationOf, EXTRA_LIST, hrefFor, readDraft, seedItems, TYPE_META, typeNotAllowed, type Actor, type ContentRow, type DraftData } from './model';

export type TransitionAction = Exclude<EditorialAction, 'guardar'>;

export interface TransitionOptions {
  /** Al publicar: el área lo ha revisado (se muestra «Revisado por …»). */
  reviewed?: boolean;
}

export interface TransitionOutcome {
  ok: boolean;
  to?: EditorialStatus;
  reason?: string;
  errors?: FieldError[];
  undo?: () => void;
  /** Página pública tras publicar («Ver publicado»). */
  href?: string;
}

type EventPatch = Partial<Pick<CampusEvent, 'archived' | 'manualPhase'>>;

const isEventType = (type: ContentType) => type === 'evento' || type === 'comunicado';

/** Versión vigente de un contenido del campus (con su revisión publicada, si la hay). */
export function campusItem(type: ContentType, id: string): CampusItem | undefined {
  const st = useDemo.getState();
  const list = st[EXTRA_LIST[type]] as CampusItem[];
  const base = list.find((x) => x.id === id) ?? seedItems(type).find((x) => x.id === id);
  if (!base) return undefined;
  return st.contentOverrides[id] ?? base;
}

const editorialOf = (item: CampusItem | undefined): EditorialMeta | undefined => (item && 'editorial' in item ? item.editorial : undefined);

/**
 * Autoría del contenido de una fila, leída del estado de la demo (la API la lee de la base de datos, no de
 * lo que manda el navegador). En unos cambios guardados de algo publicado es la de ese contenido, no la
 * de quien los empezó: así nadie publica ni descarta cambios en lo que no es suyo.
 */
function ownerOf(row: Pick<ContentRow, 'id' | 'type' | 'revisionOf'>): string | undefined {
  const id = row.revisionOf ?? row.id;
  const own = useDemo.getState().drafts[id];
  if (own) return own.authorId || undefined;
  return editorialOf(campusItem(row.type, id))?.authorId;
}

/**
 * Otra evaluación vigente del área, sin contar `exceptId`: sin archivar, publicada o (como en la API) en
 * borrador. Como mucho una por área. Devuelve su estado, para explicar el rechazo.
 */
function otherAssessment(area: AreaId, exceptId: string): 'publicado' | 'borrador' | undefined {
  const st = useDemo.getState();
  const published = [...st.extraAssessments, ...seed.assessments].some(
    (a) => a.id !== exceptId && st.statusOverrides[a.id] !== 'archivado' && ((st.contentOverrides[a.id] as SectorAssessment | undefined) ?? a).area === area,
  );
  if (published) return 'publicado';
  const drafted = Object.values(st.drafts).some((d) => {
    if (d.type !== 'test' || d.id === exceptId || d.status !== 'borrador') return false;
    const data = readDraft(d);
    return !!data && !data.sourceId && data.form.type === 'test' && data.form.area === area;
  });
  return drafted ? 'borrador' : undefined;
}

/** Versiones vigentes de un documento (orden ascendente: la última es la vigente, como en la API). */
export function currentVersions(id: string): DocumentVersion[] {
  const st = useDemo.getState();
  const base = st.documentVersions[id] ?? (campusItem('documento', id) as LibraryDocument | undefined)?.versions ?? [];
  return [...base].sort((a, b) => a.version - b.version);
}

/** Registra el estado previo de lo que se va a tocar para poder deshacerlo (clave a clave). */
function recorder() {
  const st = useDemo.getState();
  const drafts = new Map<string, DraftRecord | undefined>();
  const statuses = new Map<string, EditorialStatus | undefined>();
  const events = new Map<string, EventPatch | undefined>();
  const versions = new Map<string, DocumentVersion[] | undefined>();
  const overrides = new Map<string, CampusItem | undefined>();
  const extras = new Map<string, { list: ExtraList; id: string; item: CampusItem | undefined }>();
  return {
    draft(id: string) {
      if (!drafts.has(id)) drafts.set(id, st.drafts[id]);
    },
    status(id: string) {
      if (!statuses.has(id)) statuses.set(id, st.statusOverrides[id]);
    },
    event(id: string) {
      if (!events.has(id)) events.set(id, st.eventOverrides[id]);
    },
    versions(id: string) {
      if (!versions.has(id)) versions.set(id, st.documentVersions[id]);
    },
    override(id: string) {
      if (!overrides.has(id)) overrides.set(id, st.contentOverrides[id]);
    },
    extra(list: ExtraList, id: string) {
      const key = `${list}:${id}`;
      if (!extras.has(key)) extras.set(key, { list, id, item: (st[list] as CampusItem[]).find((x) => x.id === id) });
    },
    restore() {
      const s = useDemo.getState();
      drafts.forEach((rec, id) => (rec ? s.saveDraft(rec) : s.removeDraft(id)));
      statuses.forEach((status, id) => s.setStatus(id, status ?? null));
      events.forEach((patch, id) => {
        s.setEventOverride(id, null);
        if (patch) s.setEventOverride(id, patch);
      });
      versions.forEach((v, id) => s.addDocumentVersion(id, v ?? null));
      overrides.forEach((item, id) => s.setOverride(id, item ?? null));
      extras.forEach(({ list, id, item }) => (item ? s.upsertExtra(list, item as never) : s.removeExtra(list, id)));
    },
  };
}

const asData = (d: DraftData) => d as unknown as Record<string, unknown>;

/**
 * Revisión que se anota al publicar: «Revisado por …» (con el id de quien lo marca, para retirar su nombre
 * si se elimina su perfil) solo si se marca «Lo ha revisado el área». Si no, queda pendiente, también al
 * publicar los cambios de algo que ya estaba revisado: la versión nueva no la ha revisado nadie.
 */
function reviewFor(reviewed: boolean | undefined, actor: Actor, nowIso: string): EditorialMeta['review'] {
  return reviewed ? { state: 'revisado', reviewerName: actor.name, reviewerId: actor.id, reviewedAt: nowIso } : { state: 'pendiente' };
}

/** Datos del borrador de Gestión con quien revisó la versión que se publica (o sin nadie, si no se marcó). */
function withReviewer(data: DraftData, reviewed: boolean | undefined, actor: Actor): DraftData {
  const { reviewerName: _name, reviewerId: _id, ...rest } = data;
  return reviewed ? { ...rest, reviewerName: actor.name, reviewerId: actor.id } : rest;
}

/**
 * Direcciones públicas ya usadas por el tipo (para que la nueva sea única). Eventos y comunicados
 * comparten la ruta /participar/agenda/:slug: son un solo espacio de direcciones.
 */
function takenSlugs(type: ContentType): string[] {
  const st = useDemo.getState();
  const base = isEventType(type) ? seed.events : seedItems(type);
  const items = [...(st[EXTRA_LIST[type]] as CampusItem[]), ...base];
  return items.flatMap((x) => ('slug' in x && typeof x.slug === 'string' ? [x.slug] : []));
}

function slugBase(form: AnyForm): string {
  switch (form.type) {
    case 'noticia':
      return form.headline;
    case 'formacion':
    case 'evento':
    case 'comunicado':
      return form.title;
    default:
      return '';
  }
}

/** Comprobaciones que dependen del resto del campus (personas, otras bienvenidas, permisos de archivo). */
function contextProblem(actor: Actor, row: ContentRow, form: AnyForm): string | null {
  const st = useDemo.getState();
  if (form.type === 'bienvenida') {
    const person = demoPeople(st).find((p) => p.id === form.personId);
    if (!person || person.status !== 'activa') return 'La persona de la bienvenida ya no está activa en el directorio. Elige a otra persona.';
    const self = row.revisionOf ?? row.id;
    const welcomes = [...st.extraWelcomes, ...seed.welcomes].map((w) => ({ ...w, ...(st.contentOverrides[w.id] as Partial<typeof w> | undefined) }));
    const published = welcomes.some((w) => w.id !== self && w.personId === form.personId);
    const drafted = Object.values(st.drafts).some((d) => {
      if (d.type !== 'bienvenida' || d.id === row.id || d.id === self) return false;
      const data = readDraft(d);
      return !!data && data.sourceId !== self && data.form.type === 'bienvenida' && data.form.personId === form.personId;
    });
    if (published || drafted) return 'Esta persona ya tiene una bienvenida. Edita la que existe en lugar de crear otra.';
    // Las de las incorporaciones reales las ha facilitado FLM y se pueden retocar; una nueva sería inventar un hecho.
    const editsOwn = welcomes.some((w) => w.id === self && w.personId === form.personId);
    if (__DEMO__ && !person.fictional && !editsOwn) return 'En la demostración, las bienvenidas nuevas son para personas ficticias: anunciar la llegada de una persona real sería inventar un hecho sobre ella.';
  }
  if (form.type === 'documento' && row.revisionOf && form.upload && !can(actor.effectiveRole, 'documentos:reemplazar')) {
    return 'Solo administración puede sustituir el PDF de un documento publicado. Quita el archivo nuevo para publicar el resto de cambios.';
  }
  // Una evaluación vigente por área (como en la API): la nueva no tapa a la que ya tiene el área.
  if (form.type === 'test') {
    const other = otherAssessment(form.area, row.revisionOf ?? row.id);
    if (other) return assessmentClashReason(AREAS[form.area].name, other, 'publicar');
  }
  return null;
}

/**
 * Aplica una acción del flujo editorial a una fila. Comprueba permisos, estado y propiedad con
 * `checkTransition()`, valida el contenido antes de publicarlo y deja rastro en la auditoría.
 */
export function applyTransition(actor: Actor, row: ContentRow, action: TransitionAction, opts: TransitionOptions = {}): TransitionOutcome {
  const st = useDemo.getState();
  // El tipo, en cada acción: tras un cambio de rol, la evaluación del área sigue siendo de administración.
  if (!canHandleType(actor.effectiveRole, row.type)) return { ok: false, reason: typeNotAllowed(actor.effectiveRole, row.type) };
  const owner = ownerOf(row);
  // Los cambios guardados de algo publicado son siempre un borrador.
  const from: EditorialStatus = row.revisionOf ? 'borrador' : row.status;
  const check = checkTransition(actor.effectiveRole, action, from, !!owner && owner === actor.id);
  if (!check.ok || !check.to) return { ok: false, reason: check.reason ?? 'Acción editorial no permitida.' };
  if (action === 'archivar' && row.openRevision) {
    return { ok: false, reason: 'Este contenido tiene cambios guardados sin publicar. Publícalos o descártalos antes de archivarlo.' };
  }
  if (action === 'restaurar' && row.type === 'test') {
    const area = (campusItem('test', row.id) as SectorAssessment | undefined)?.area;
    const other = area ? otherAssessment(area, row.id) : undefined;
    if (area && other) return { ok: false, reason: assessmentClashReason(AREAS[area].name, other, 'restaurar') };
  }
  const data = row.draft ? readDraft(row.draft) : null;
  if (action === 'publicar') {
    if (!row.draft || !data) return { ok: false, reason: 'No hay cambios que publicar.' };
    // Sin el contenido en el campus, los cambios no tendrían a qué sustituir.
    if (row.revisionOf && !campusItem(row.type, row.revisionOf)) return { ok: false, reason: 'Este contenido aún no está en el campus: publícalo primero.' };
    const errors = validateForm(data.form);
    if (errors.length) return { ok: false, reason: MESSAGES.invalidFields(errors.length), errors };
    const problem = contextProblem(actor, row, data.form);
    if (problem) return { ok: false, reason: problem };
  }

  const to = check.to;
  const nowIso = new Date().toISOString();
  const today = madridDateKey();
  const rec = recorder();
  const list = EXTRA_LIST[row.type];
  let detail: string | undefined;
  let href: string | undefined;

  if (action === 'publicar' && row.draft && data && row.revisionOf) {
    // Cambios de un contenido publicado: sustituyen a la versión vigente al publicarlos.
    const sourceId = row.revisionOf;
    const form = data.form;
    const current = campusItem(row.type, sourceId);
    const source = st.drafts[sourceId];
    const sourceData = source ? readDraft(source) : null;
    const prev = editorialOf(current);
    const slug = current && 'slug' in current && typeof current.slug === 'string' ? current.slug : (sourceData?.publishedSlug ?? sourceId);
    const version = form.type === 'formacion' ? ((current as Formation | undefined)?.version ?? form.version) + (form.majorChange ? 1 : 0) : undefined;
    const editorial: EditorialMeta = {
      status: 'publicado',
      ...(prev?.authorId ? { authorId: prev.authorId } : {}),
      publishedAt: prev?.publishedAt ?? nowIso,
      updatedAt: nowIso,
      review: reviewFor(opts.reviewed, actor, nowIso),
    };
    const item = formToItem(form, { id: sourceId, slug, editorial, uploadedBy: actor.id, today, version });
    rec.override(sourceId);
    st.setOverride(sourceId, item);
    if (row.type === 'documento') {
      rec.versions(sourceId);
      st.addDocumentVersion(sourceId, (item as LibraryDocument).versions);
      if (form.type === 'documento' && form.upload) st.log({ actorId: actor.id, action: 'documento.sustituir', entity: 'documento', entityId: sourceId, detail: `Versión ${(item as LibraryDocument).versions.at(-1)?.version ?? ''}` });
    }
    if (source && sourceData) {
      rec.draft(sourceId);
      const merged: AnyForm =
        form.type === 'documento'
          ? { ...form, upload: undefined, versionNote: '', versions: (item as LibraryDocument).versions }
          : form.type === 'formacion'
            ? { ...form, version: version ?? form.version, majorChange: false }
            : form;
      st.saveDraft({ ...source, title: row.title, updatedAt: nowIso, revision: source.revision + 1, data: asData(withReviewer({ ...sourceData, form: merged }, opts.reviewed, actor)) });
    }
    rec.draft(row.id);
    st.removeDraft(row.id);
    detail = form.type === 'formacion' && form.majorChange ? 'Revisión de un contenido publicado · cambio importante (versión nueva)' : 'Revisión de un contenido publicado';
    href = hrefFor(row.type, row.area, slug, sourceId);
  } else if (action === 'publicar' && row.draft && data) {
    // Primera publicación: el contenido llega a su sitio en el campus.
    const form = data.form;
    rec.draft(row.id);
    rec.status(row.id);
    rec.override(row.id);
    rec.extra(list, row.id);
    const base = slugBase(form);
    const slug = data.publishedSlug ?? (base ? uniqueSlug(base, takenSlugs(row.type)) : row.id);
    const editorial: EditorialMeta = {
      status: 'publicado',
      ...(owner ? { authorId: owner } : {}),
      publishedAt: data.publishedAt ?? nowIso,
      updatedAt: nowIso,
      review: reviewFor(opts.reviewed, actor, nowIso),
    };
    const item = formToItem(form, { id: row.id, slug, editorial, uploadedBy: owner ?? actor.id, today });
    st.upsertExtra(list, item as never);
    st.setStatus(row.id, null);
    st.setOverride(row.id, null);
    if (form.type === 'documento') st.log({ actorId: actor.id, action: 'documento.subir', entity: 'documento', entityId: row.id, detail: 'Versión 1' });
    const next = withReviewer({ ...data, schema: 2, publishedAt: data.publishedAt ?? nowIso, mirrored: true, publishedSlug: slug }, opts.reviewed, actor);
    st.saveDraft({ ...row.draft, status: to, updatedAt: nowIso, data: asData(next) });
    href = hrefFor(row.type, row.area, slug, row.id);
  } else {
    // Archivar o restaurar un contenido publicado (de la semilla o publicado aquí).
    rec.status(row.id);
    st.setStatus(row.id, to);
    if (row.draft) {
      rec.draft(row.id);
      st.saveDraft({ ...row.draft, status: to, updatedAt: nowIso });
    }
    if (isEventType(row.type)) {
      rec.event(row.id);
      st.setEventOverride(row.id, { archived: to === 'archivado' });
    }
  }

  const entityId = row.revisionOf ?? row.id;
  st.log({ actorId: actor.id, action: `contenido.${action}`, entity: row.type, entityId, detail });

  const undo = () => {
    rec.restore();
    useDemo.getState().log({ actorId: actor.id, action: 'contenido.deshacer', entity: row.type, entityId, detail: `Deshecho: ${ACTION_LABEL[action]}` });
  };
  return { ok: true, to, undo, href };
}

const short = (s: string) => (s.length > 70 ? `${s.slice(0, 68).trimEnd()}…` : s);

function pushUndo(title: string, description: string, undo?: () => void) {
  useToasts.getState().push({
    title,
    description,
    tone: 'success',
    duration: 10_000,
    action: undo
      ? {
          label: 'Deshacer',
          onClick: () => {
            undo();
            toast.info('Acción deshecha', 'Se ha recuperado el estado anterior.');
          },
        }
      : undefined,
  });
}

/** Avisa del resultado de una acción (con «Deshacer» durante 10 s tras publicar o archivar). */
export function announce(row: Pick<ContentRow, 'type' | 'title' | 'revisionOf' | 'area'>, action: TransitionAction, out: TransitionOutcome) {
  if (!out.ok) {
    toast.error('No se ha podido completar la acción', out.reason);
    return;
  }
  const what = `${TYPE_META[row.type].label} «${short(row.title || 'Sin título')}»`;
  switch (action) {
    case 'publicar':
      pushUndo(row.revisionOf ? 'Cambios publicados' : 'Publicado', `${what} ya está en ${destinationOf(row.type, row.area)}.`, out.undo);
      break;
    case 'archivar':
      pushUndo('Archivado', `${what} deja de mostrarse en el campus.`, out.undo);
      break;
    case 'restaurar':
      toast.success('Restaurado', `${what} vuelve a estar publicado.`);
      break;
  }
}

/** Elimina un borrador que nunca se ha publicado (o descarta los cambios guardados de algo publicado). */
export function removeWorkingDraft(actor: Actor, row: ContentRow): { ok: boolean; reason?: string } {
  const st = useDemo.getState();
  if (!row.draft) return { ok: false, reason: 'Solo se pueden eliminar borradores.' };
  if (!canHandleType(actor.effectiveRole, row.type)) return { ok: false, reason: typeNotAllowed(actor.effectiveRole, row.type) };
  if (!canEditRow(actor, { type: row.type, ownerId: ownerOf(row) })) return { ok: false, reason: 'Solo puedes consultar y modificar tus propios contenidos.' };
  if (row.revisionOf) {
    // También la revisión que dejó la migración con el test final pendiente, aunque aún no tenga formulario.
    st.removeDraft(row.id);
    st.log({ actorId: actor.id, action: 'contenido.descartar-revision', entity: row.type, entityId: row.revisionOf });
    return { ok: true };
  }
  const data = readDraft(row.draft);
  if (!data) return { ok: false, reason: 'Solo se pueden eliminar borradores.' };
  if (row.status !== 'borrador' || data.publishedAt) {
    return { ok: false, reason: 'Solo se pueden eliminar borradores que nunca se han publicado. Para retirar un contenido publicado, archívalo.' };
  }
  st.removeDraft(row.id);
  st.log({ actorId: actor.id, action: 'contenido.eliminar-borrador', entity: row.type, entityId: row.id });
  return { ok: true };
}

/** Reclasificación manual de un evento publicado (solo administración; inmediata, como en la API). */
export function reclassifyEvent(actor: Actor, eventId: string, phase: '' | 'proximo' | 'historico'): { ok: boolean; reason?: string } {
  if (!can(actor.effectiveRole, 'contenido:editar-cualquiera')) return { ok: false, reason: 'Solo administración puede reclasificar eventos.' };
  const st = useDemo.getState();
  st.setEventOverride(eventId, { manualPhase: phase || undefined });
  const own = st.drafts[eventId];
  const data = own ? readDraft(own) : null;
  if (own && data && (data.form.type === 'evento' || data.form.type === 'comunicado')) {
    st.saveDraft({ ...own, data: asData({ ...data, form: { ...data.form, manualPhase: phase } }) });
  }
  st.log({ actorId: actor.id, action: 'evento.reclasificar', entity: 'evento', entityId: eventId, detail: `Fase manual: ${phase || 'automática'}` });
  return { ok: true };
}

/**
 * Acciones editoriales de la demo: aplican el flujo de `checkTransition()` sobre el estado
 * local (useDemo), dejan constancia en la auditoría con los mismos códigos que la API
 * (contenido.enviar, contenido.publicar…) y devuelven una función para deshacer.
 */
import { seed } from '@flm/content';
import {
  ACTION_LABEL,
  can,
  checkTransition,
  madridDateKey,
  type CampusEvent,
  type DocumentVersion,
  type EditorialAction,
  type EditorialMeta,
  type EditorialStatus,
} from '@flm/shared';
import { toast, useToasts } from '@/design';
import { useDemo, type DraftRecord } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { formToDocument, formToEvent, formToNews, uniqueSlug, uploadToVersion, validateForm, type AnyForm, type FieldError } from './forms';
import { readDraft, TYPE_META, type Actor, type ContentRow, type DraftData } from './model';

export type TransitionAction = Exclude<EditorialAction, 'guardar'>;

export interface TransitionOutcome {
  ok: boolean;
  to?: EditorialStatus;
  reason?: string;
  errors?: FieldError[];
  undo?: () => void;
}

type EventPatch = Partial<Pick<CampusEvent, 'archived' | 'manualPhase'>>;

function campusItem(id: string): { editorial: EditorialMeta } | undefined {
  const st = useDemo.getState();
  return (
    seed.formations.find((x) => x.id === id) ??
    st.extraNews.find((x) => x.id === id) ??
    seed.news.find((x) => x.id === id) ??
    st.extraDocuments.find((x) => x.id === id) ??
    seed.documents.find((x) => x.id === id) ??
    st.extraEvents.find((x) => x.id === id) ??
    seed.events.find((x) => x.id === id)
  );
}

function effectiveStatus(id: string): EditorialStatus | undefined {
  const st = useDemo.getState();
  return st.statusOverrides[id] ?? st.drafts[id]?.status ?? campusItem(id)?.editorial.status;
}

/** Versiones vigentes de un documento (orden ascendente: la última es la vigente, como en la API). */
export function currentVersions(id: string): DocumentVersion[] {
  const st = useDemo.getState();
  const base = st.documentVersions[id] ?? (st.extraDocuments.find((d) => d.id === id) ?? seed.documents.find((d) => d.id === id))?.versions ?? [];
  return [...base].sort((a, b) => a.version - b.version);
}

function campusEvent(id: string): CampusEvent | undefined {
  const st = useDemo.getState();
  return st.extraEvents.find((e) => e.id === id) ?? seed.events.find((e) => e.id === id);
}

/** Registra el estado previo de lo que se va a tocar para poder deshacerlo. */
function recorder() {
  const st = useDemo.getState();
  const drafts = new Map<string, DraftRecord | undefined>();
  const statuses = new Map<string, EditorialStatus | undefined>();
  const events = new Map<string, EventPatch>();
  const versions = new Map<string, DocumentVersion[]>();
  return {
    draft(id: string) {
      if (!drafts.has(id)) drafts.set(id, st.drafts[id]);
    },
    status(id: string) {
      if (!statuses.has(id)) statuses.set(id, effectiveStatus(id));
    },
    event(id: string) {
      if (!events.has(id)) {
        const ev = campusEvent(id);
        events.set(id, { archived: st.eventOverrides[id]?.archived ?? ev?.archived ?? false, manualPhase: st.eventOverrides[id]?.manualPhase ?? ev?.manualPhase });
      }
    },
    versions(id: string) {
      if (!versions.has(id)) versions.set(id, currentVersions(id));
    },
    restore() {
      const s = useDemo.getState();
      drafts.forEach((rec, id) => (rec ? s.saveDraft(rec) : s.removeDraft(id)));
      statuses.forEach((status, id) => {
        if (status) s.setStatus(id, status);
      });
      events.forEach((patch, id) => s.setEventOverride(id, patch));
      versions.forEach((v, id) => s.addDocumentVersion(id, v));
    },
  };
}

const asData = (d: DraftData) => d as unknown as Record<string, unknown>;

/** Incorpora a las listas públicas de la demo lo que se publica por primera vez. */
function mirror(row: ContentRow, form: AnyForm, actor: Actor, nowIso: string, today: string): { slug?: string } | null {
  const st = useDemo.getState();
  const editorial: EditorialMeta = {
    status: 'publicado',
    authorId: row.authorId,
    publishedAt: nowIso,
    updatedAt: nowIso,
    review: { state: 'revisado', reviewerName: actor.name, reviewedAt: nowIso },
  };
  if (form.type === 'noticia') {
    const slug = uniqueSlug(form.headline, [...seed.news, ...st.extraNews].map((n) => n.slug));
    st.addNews(formToNews(form, { id: row.id, slug, editorial, uploadedBy: row.authorId, today }));
    return { slug };
  }
  if (form.type === 'documento') {
    st.addDocument(formToDocument(form, { id: row.id, slug: row.id, editorial, uploadedBy: row.authorId, today }));
    st.log({ actorId: actor.id, action: 'documento.subir', entity: 'documento', entityId: row.id, detail: 'Versión 1' });
    return {};
  }
  if (form.type === 'evento' || form.type === 'comunicado') {
    const slug = uniqueSlug(form.title, [...seed.events, ...st.extraEvents].map((e) => e.slug));
    st.addEvent(formToEvent(form, { id: row.id, slug, editorial, uploadedBy: row.authorId, today }));
    return { slug };
  }
  // Formaciones y tests: en la demo no hay listas públicas editables; quedan publicados en Gestión.
  return null;
}

/**
 * Aplica una acción del flujo editorial a una fila. Comprueba permisos y estado con
 * `checkTransition()`, valida el contenido antes de enviarlo o publicarlo y deja rastro en la auditoría.
 */
export function applyTransition(actor: Actor, row: ContentRow, action: TransitionAction, opts: { comment?: string } = {}): TransitionOutcome {
  const st = useDemo.getState();
  const isOwner = row.authorId === actor.id;
  const check = checkTransition(actor.effectiveRole, action, row.status, isOwner);
  if (!check.ok || !check.to) return { ok: false, reason: check.reason ?? 'Acción editorial no permitida.' };
  if (action === 'archivar' && row.openRevision) {
    return { ok: false, reason: 'Este contenido tiene una revisión pendiente. Publícala o descártala antes de archivarlo.' };
  }
  const comment = opts.comment?.trim() ?? '';
  if (action === 'devolver' && !comment) {
    return { ok: false, reason: 'Escribe un comentario que explique qué hay que corregir antes de devolver el contenido.' };
  }
  const data = row.draft ? readDraft(row.draft) : null;
  if ((action === 'enviar' || action === 'publicar') && data) {
    const errors = validateForm(data.form);
    if (errors.length) return { ok: false, reason: MESSAGES.invalidFields(errors.length), errors };
  }

  const to = check.to;
  const nowIso = new Date().toISOString();
  const today = madridDateKey();
  const rec = recorder();
  const isEvent = row.type === 'evento' || row.type === 'comunicado';
  let detail: string | undefined = action === 'devolver' ? `Comentario: ${comment.slice(0, 500)}` : undefined;

  if (row.draft && data && row.revisionOf && action === 'publicar') {
    // Revisión de un contenido publicado: la versión pública se actualiza al aprobarla.
    const sourceId = row.revisionOf;
    const form = data.form;
    rec.draft(row.id);
    let versions: DocumentVersion[] | undefined;
    if (form.type === 'documento' && form.upload) {
      rec.versions(sourceId);
      const current = currentVersions(sourceId);
      const n = Math.max(0, ...current.map((v) => v.version)) + 1;
      versions = [...current, uploadToVersion(form.upload, n, row.authorId, today, form.versionNote)];
      st.addDocumentVersion(sourceId, versions);
      st.log({ actorId: actor.id, action: 'documento.sustituir', entity: 'documento', entityId: sourceId, detail: `Versión ${n}` });
    }
    const source = st.drafts[sourceId];
    const sourceData = source ? readDraft(source) : null;
    if (source && sourceData) {
      rec.draft(sourceId);
      const merged: AnyForm = form.type === 'documento' ? { ...form, upload: undefined, versionNote: '', versions: versions ?? form.versions } : form;
      st.saveDraft({ ...source, title: row.title, updatedAt: nowIso, revision: source.revision + 1, data: asData({ ...sourceData, form: merged, reviewerName: actor.name }) });
    }
    rec.status(sourceId);
    if (effectiveStatus(sourceId) !== 'publicado') st.setStatus(sourceId, 'publicado');
    st.removeDraft(row.id);
    detail = 'Revisión de un contenido publicado';
  } else if (row.draft && data) {
    rec.draft(row.id);
    rec.status(row.id);
    const next: DraftData = { ...data };
    if (action === 'publicar') {
      next.publishedAt = data.publishedAt ?? nowIso;
      next.reviewerName = actor.name;
      if (!row.revisionOf && !data.mirrored) {
        const m = mirror(row, data.form, actor, nowIso, today);
        if (m) {
          next.mirrored = true;
          if (m.slug) next.publishedSlug = m.slug;
        }
      }
    }
    st.saveDraft({
      ...row.draft,
      status: to,
      updatedAt: nowIso,
      returnComment: action === 'devolver' ? comment : undefined,
      data: asData(next),
    });
    if (next.mirrored) {
      st.setStatus(row.id, to);
      if (isEvent && (action === 'archivar' || action === 'restaurar')) {
        rec.event(row.id);
        st.setEventOverride(row.id, { archived: to === 'archivado' });
      }
    }
    if (row.revisionOf) detail = detail ? `${detail} · Revisión de un contenido publicado` : 'Revisión de un contenido publicado';
  } else {
    // Contenido del campus (semilla): solo cambia su estado editorial.
    rec.status(row.id);
    st.setStatus(row.id, to);
    if (isEvent && (action === 'archivar' || action === 'restaurar')) {
      rec.event(row.id);
      st.setEventOverride(row.id, { archived: to === 'archivado' });
    }
  }

  const entityId = row.revisionOf ?? row.id;
  st.log({ actorId: actor.id, action: `contenido.${action}`, entity: row.type, entityId, detail });

  // Aviso en la campana para la persona autora (en la demo, si es la persona con la sesión iniciada).
  if ((action === 'publicar' || action === 'devolver') && row.authorId === st.userId && actor.effectiveRole === 'admin') {
    st.pushNotice(
      action === 'publicar'
        ? { title: `Se ha publicado ${TYPE_META[row.type].the}`, body: `«${row.title}» ya está publicado.`, href: `/gestion/editar/${entityId}` }
        : { title: `Te han devuelto ${TYPE_META[row.type].the} con comentarios`, body: comment.slice(0, 160), href: `/gestion/editar/${entityId}` },
    );
  }

  const undo = () => {
    rec.restore();
    useDemo.getState().log({ actorId: actor.id, action: 'contenido.deshacer', entity: row.type, entityId, detail: `Deshecho: ${ACTION_LABEL[action]}` });
  };
  return { ok: true, to, undo };
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
export function announce(row: Pick<ContentRow, 'type' | 'title' | 'revisionOf'>, action: TransitionAction, out: TransitionOutcome) {
  if (!out.ok) {
    toast.error('No se ha podido completar la acción', out.reason);
    return;
  }
  const what = `${TYPE_META[row.type].label} «${short(row.title || 'Sin título')}»`;
  switch (action) {
    case 'enviar':
      toast.success('Enviado a revisión', `${what} queda pendiente de administración.`);
      break;
    case 'publicar':
      pushUndo(row.revisionOf ? 'Revisión publicada' : 'Publicado', `${what} ya está publicado.`, out.undo);
      break;
    case 'devolver':
      toast.info('Devuelto con comentario', `${what} vuelve a borrador con tu comentario.`);
      break;
    case 'archivar':
      pushUndo('Archivado', `${what} deja de mostrarse en el campus.`, out.undo);
      break;
    case 'restaurar':
      toast.success('Restaurado', `${what} vuelve a estar publicado.`);
      break;
  }
}

/** Elimina un borrador que nunca se ha publicado (o descarta una revisión pendiente). */
export function removeWorkingDraft(actor: Actor, row: ContentRow): { ok: boolean; reason?: string } {
  const st = useDemo.getState();
  const data = row.draft ? readDraft(row.draft) : null;
  if (!row.draft || !data) return { ok: false, reason: 'Solo se pueden eliminar borradores.' };
  const canEdit = can(actor.effectiveRole, 'contenido:editar-cualquiera') || (row.authorId === actor.id && can(actor.effectiveRole, 'contenido:editar-propio'));
  if (!canEdit) return { ok: false, reason: 'Solo puedes consultar y modificar tus propios contenidos.' };
  if (row.revisionOf) {
    st.removeDraft(row.id);
    st.log({ actorId: actor.id, action: 'contenido.descartar-revision', entity: row.type, entityId: row.revisionOf });
    return { ok: true };
  }
  if (row.status !== 'borrador' || data.publishedAt) {
    return { ok: false, reason: 'Solo se pueden eliminar borradores que nunca se han publicado. Para retirar un contenido publicado, archívalo.' };
  }
  st.removeDraft(row.id);
  st.log({ actorId: actor.id, action: 'contenido.eliminar-borrador', entity: row.type, entityId: row.id });
  return { ok: true };
}

/** Reclasificación manual de un evento publicado (solo administración; inmediata, como en la API). */
export function reclassifyEvent(actor: Actor, eventId: string, phase: '' | 'proximo' | 'historico'): { ok: boolean; reason?: string } {
  if (!can(actor.effectiveRole, 'contenido:publicar')) return { ok: false, reason: 'Solo administración puede reclasificar eventos.' };
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

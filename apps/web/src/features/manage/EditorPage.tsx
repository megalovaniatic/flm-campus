import { AnimatePresence, motion } from 'motion/react';
import { Archive, ArrowLeft, BadgeCheck, CircleAlert, CornerUpLeft, ExternalLink, FileQuestionMark, RotateCcw, Save, Send, ShieldAlert, Trash } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Navigate, useBlocker, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { can, checkTransition, CREATABLE_TYPES, madridDateKey, madridParts, ROLE_LABEL, type ContentType, type EditorialStatus } from '@flm/shared';
import { ActionButton, Button, ButtonLink, Dialog, EmptyState, Notice, PageHeader, Tabs, toast, type ActionStatus } from '@/design';
import { useMe } from '@/data/selectors';
import { uid, useDemo, type DraftRecord } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { announce, applyTransition, removeWorkingDraft, type TransitionAction } from './actions';
import { ContentPreview } from './ContentPreview';
import { EditorialTrack, trackLabel } from './EditorialTrack';
import { DocumentEditor } from './editor/DocumentEditor';
import { EventEditor } from './editor/EventEditor';
import { FormationEditor } from './editor/FormationEditor';
import { NewsEditor } from './editor/NewsEditor';
import { TestEditor } from './editor/TestEditor';
import type { EditorContext } from './editor/fields';
import { anchorId, newForm, validateForm, type AnyForm, type FieldError } from './forms';
import { canEditRow, draftRow, formTitle, isContentType, readDraft, revisionId, TYPE_META, useCampusForms, useContentRows, type Actor, type ContentRow, type DraftData } from './model';
import { ReturnDialog } from './ReturnDialog';
import { useMediaQuery } from './useMediaQuery';
import styles from './EditorPage.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (iso: string) => {
  const p = madridParts(new Date(iso));
  return `${pad(p.hour)}:${pad(p.minute)}`;
};
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

interface Target {
  key: string;
  type: ContentType;
  /** Borrador en el que se guarda: propio, nuevo o revisión «rev-<id>». */
  workingId: string;
  /** Contenido publicado del que se prepara una revisión. */
  baseId?: string;
  initialForm: AnyForm;
  baseForm?: AnyForm;
  savedAt?: string;
  isNewRoute?: boolean;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="container page">{children}</div>;
}

/** Editor por tipo con vista previa en vivo, autoguardado, validación y flujo editorial. */
export default function EditorPage() {
  const { type: typeParam, id: idParam } = useParams();
  const [search] = useSearchParams();
  const location = useLocation();
  const me = useMe();
  const drafts = useDemo((s) => s.drafts);
  const campusForm = useCampusForms();
  const freshId = useMemo(() => `bor-${uid().replace(/-/g, '').slice(0, 10)}`, [typeParam, location.key]);
  const today = madridDateKey();

  if (!me) return null;

  let target: Target | null = null;
  if (typeParam !== undefined) {
    if (!isContentType(typeParam)) return <EditorMissing />;
    if (!can(me.effectiveRole, 'contenido:crear') || !CREATABLE_TYPES[me.effectiveRole].includes(typeParam)) return <EditorForbidden role={me.effectiveRole} />;
    const resume = search.get('borrador');
    const d = resume ? drafts[resume] : undefined;
    const data = d ? readDraft(d) : null;
    target =
      d && data && d.type === typeParam
        ? { key: `${typeParam}:${d.id}`, type: typeParam, workingId: d.id, initialForm: data.form, savedAt: d.updatedAt, isNewRoute: true }
        : { key: `${typeParam}:${freshId}`, type: typeParam, workingId: freshId, initialForm: newForm(typeParam, me, today), isNewRoute: true };
  } else if (idParam) {
    const d = drafts[idParam];
    const data = d ? readDraft(d) : null;
    if (d && data && (d.status === 'borrador' || d.status === 'en-revision')) {
      const base = data.sourceId ? (drafts[data.sourceId] ? readDraft(drafts[data.sourceId]!)?.form : campusForm(data.sourceId)?.form) : undefined;
      target = { key: d.id, type: d.type, workingId: d.id, baseId: data.sourceId, initialForm: data.form, baseForm: base, savedAt: d.updatedAt };
    } else if (d && data) {
      const rev = drafts[revisionId(d.id)];
      const revData = rev ? readDraft(rev) : null;
      target = { key: revisionId(d.id), type: d.type, workingId: revisionId(d.id), baseId: d.id, initialForm: revData?.form ?? data.form, baseForm: data.form, savedAt: rev?.updatedAt };
    } else if (idParam.startsWith('rev-')) {
      return <Navigate to={`/gestion/editar/${encodeURIComponent(idParam.slice(4))}`} replace />;
    } else {
      const campus = campusForm(idParam);
      if (!campus) return <EditorMissing />;
      const rev = drafts[revisionId(idParam)];
      const revData = rev ? readDraft(rev) : null;
      target = { key: revisionId(idParam), type: campus.type, workingId: revisionId(idParam), baseId: idParam, initialForm: revData?.form ?? campus.form, baseForm: campus.form, savedAt: rev?.updatedAt };
    }
  }
  if (!target) return <EditorMissing />;
  const { key, ...props } = target;
  return <Editor key={key} {...props} me={me} />;
}

function EditorMissing() {
  usePageTitle('Contenido no disponible');
  return (
    <Shell>
      <EmptyState icon={<FileQuestionMark />} title="Este contenido no existe o se ha eliminado" action={<ButtonLink to="/gestion" icon={<ArrowLeft />}>Volver a Gestión</ButtonLink>}>
        <p>Puede que el borrador se haya descartado o que el enlace sea antiguo. Búscalo en Gestión de contenidos.</p>
      </EmptyState>
    </Shell>
  );
}

function EditorForbidden({ role }: { role: Actor['effectiveRole'] }) {
  usePageTitle(MESSAGES.forbidden.title);
  return (
    <Shell>
      <EmptyState icon={<ShieldAlert />} tone="error" title={MESSAGES.forbidden.title} action={<ButtonLink to="/gestion">Volver a Gestión</ButtonLink>}>
        <p>Tu perfil actual ({ROLE_LABEL[role]}) no puede crear este tipo de contenido.</p>
      </EmptyState>
    </Shell>
  );
}

function Editor({ type, workingId, baseId, initialForm, baseForm, savedAt: initialSavedAt, isNewRoute, me }: Omit<Target, 'key'> & { me: Actor }) {
  const role = me.effectiveRole;
  const isAdmin = can(role, 'contenido:publicar');
  const reduce = useReducedMotionPref();
  const rows = useContentRows();
  const working = useDemo((s) => s.drafts[workingId]);
  const workingRow = useMemo(() => rows.find((r) => r.key === `d:${workingId}`), [rows, workingId]);
  const baseRow = useMemo(() => (baseId ? rows.find((r) => r.id === baseId && r.key !== `d:${workingId}`) : undefined), [rows, baseId, workingId]);
  const navigate = useNavigate();
  const [, setSearch] = useSearchParams();
  const compact = useMediaQuery('(max-width: 1099px)');

  const [form, setForm] = useState<AnyForm>(initialForm);
  const formRef = useRef(form);
  formRef.current = form;
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const [savedAt, setSavedAt] = useState<string | undefined>(initialSavedAt);
  const lastSave = useRef(Date.now());
  const [showErrors, setShowErrors] = useState(false);
  const [summaryTick, setSummaryTick] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const [tab, setTab] = useState<'editar' | 'vista'>('editar');
  const [saveStatus, setSaveStatus] = useState<ActionStatus>('idle');
  const [publishStatus, setPublishStatus] = useState<ActionStatus>('idle');
  const [returnOpen, setReturnOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const panelId = useId();
  const summaryId = useId();

  /* ── Estado y permisos (reflejo de checkTransition) ─────────────────── */
  const workingStatus: EditorialStatus = working?.status ?? 'borrador';
  const ownerId = working?.authorId ?? me.id;
  const isOwner = ownerId === me.id;
  const baseEditable = !baseRow || baseRow.status === 'publicado' || baseRow.status === 'borrador';
  const canReviseBase = !baseRow || canEditRow(me, baseRow);
  const canWrite = checkTransition(role, 'guardar', 'borrador', isOwner).ok;
  const editable = canWrite && canReviseBase && baseEditable && workingStatus === 'borrador' && (!working || working.status === 'borrador');
  const mode: 'edit' | 'review' | 'readonly' = editable ? 'edit' : working?.status === 'en-revision' ? 'review' : 'readonly';
  const editableRef = useRef(editable);
  editableRef.current = editable;
  const isRevision = !!baseId;
  const displayStatus: EditorialStatus = working ? working.status : (baseRow?.status ?? 'borrador');
  const liveRow: ContentRow | undefined = baseRow ?? (workingRow && (workingRow.status === 'publicado' || workingRow.status === 'archivado') ? workingRow : undefined);
  const flowRow: ContentRow | undefined = working ? workingRow : baseRow && (baseRow.status === 'borrador' || baseRow.status === 'en-revision') ? baseRow : undefined;
  const hasChanges = !isRevision || !!working || dirty;
  const meta = TYPE_META[type];
  const workingData: DraftData | null = working ? readDraft(working) : null;

  const errors: FieldError[] = useMemo(() => (showErrors ? validateForm(form) : []), [form, showErrors]);
  const errMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of errors) if (!m.has(e.path)) m.set(e.path, e.message);
    return m;
  }, [errors]);
  const err = useCallback((p: string) => errMap.get(p), [errMap]);

  /* ── Guardado ───────────────────────────────────────────────────────── */
  const save = useCallback(
    (reason: 'auto' | 'manual'): DraftRecord | null => {
      if (!editableRef.current) return null;
      const st = useDemo.getState();
      const existing = st.drafts[workingId];
      const f = formRef.current;
      const nowIso = new Date().toISOString();
      const prev = existing ? readDraft(existing) : null;
      const data: DraftData = prev ? { ...prev, form: f } : { schema: 1, form: f, ...(baseId ? { sourceId: baseId } : {}) };
      const record: DraftRecord = {
        id: workingId,
        type,
        title: formTitle(f),
        status: existing?.status ?? 'borrador',
        authorId: existing?.authorId ?? me.id,
        updatedAt: nowIso,
        data: data as unknown as Record<string, unknown>,
        returnComment: existing?.returnComment,
        revision: (existing?.revision ?? 0) + 1,
      };
      st.saveDraft(record);
      dirtyRef.current = false;
      lastSave.current = Date.now();
      setDirty(false);
      setSavedAt(nowIso);
      const entityId = baseId ?? workingId;
      if (!existing) {
        st.log({ actorId: me.id, action: baseId ? 'contenido.guardar' : 'contenido.crear', entity: type, entityId, ...(baseId ? { detail: 'Revisión de un contenido publicado' } : {}) });
        if (isNewRoute) setSearch({ borrador: workingId }, { replace: true, preventScrollReset: true });
      } else if (reason === 'manual') {
        st.log({ actorId: me.id, action: 'contenido.guardar', entity: type, entityId, ...(baseId ? { detail: 'Revisión de un contenido publicado' } : {}) });
      }
      return record;
    },
    [workingId, type, baseId, me.id, isNewRoute, setSearch],
  );

  const update = useCallback(<T extends AnyForm>(fn: (prev: T) => T) => {
    setForm((prev) => fn(prev as T));
    dirtyRef.current = true;
    setDirty(true);
  }, []);

  // Autoguardado: 2,5 s después del último cambio (y como mucho cada 8 s si no se deja de escribir).
  useEffect(() => {
    if (!dirty || mode !== 'edit') return;
    const since = Date.now() - lastSave.current;
    const t = window.setTimeout(() => save('auto'), since > 8000 ? 0 : 2500);
    return () => window.clearTimeout(t);
  }, [form, dirty, mode, save]);

  // Al ocultar la pestaña, se guarda lo pendiente; al cerrar con cambios, se avisa.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && dirtyRef.current) save('auto');
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [save]);

  const blocker = useBlocker(
    useCallback(({ currentLocation, nextLocation }: { currentLocation: { pathname: string; search: string }; nextLocation: { pathname: string; search: string } }) => dirtyRef.current && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search), []),
  );

  useEffect(() => {
    if (summaryTick) summaryRef.current?.focus();
  }, [summaryTick]);

  const showValidation = () => {
    setShowErrors(true);
    setTab('editar');
    setSummaryTick((n) => n + 1);
  };

  const focusField = (path: string) => {
    setTab('editar');
    window.requestAnimationFrame(() => {
      let p = path;
      let el: HTMLElement | null = null;
      while (p && !(el = document.getElementById(anchorId(p)))) p = p.includes('.') ? p.slice(0, p.lastIndexOf('.')) : '';
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      const control = el.querySelector<HTMLElement>('input:not([type=hidden]):not([disabled]), textarea, select, button:not([disabled])');
      control?.focus({ preventScroll: true });
    });
  };

  /* ── Flujo editorial ────────────────────────────────────────────────── */
  const runFlow = (action: TransitionAction, comment?: string): boolean => {
    let row: ContentRow | undefined = flowRow;
    if (mode === 'edit') {
      if (action === 'enviar' || action === 'publicar') {
        if (validateForm(formRef.current).length) {
          showValidation();
          return false;
        }
      }
      const rec = save('auto');
      if (rec) row = draftRow(rec, useDemo.getState().drafts) ?? undefined;
    }
    if (!row) return false;
    const out = applyTransition(me, row, action, { comment });
    if (!out.ok && out.errors) {
      showValidation();
      return false;
    }
    announce(row, action, out);
    if (out.ok) {
      setShowErrors(false);
      // El formulario puede desaparecer (en revisión, publicado): el foco pasa al estado.
      window.setTimeout(() => statusRef.current?.focus(), 60);
    }
    return out.ok;
  };

  const onSave = async () => {
    setSaveStatus('pending');
    await wait(reduce ? 0 : 320);
    const ok = !!save('manual');
    setSaveStatus(ok ? 'success' : 'idle');
    if (ok) window.setTimeout(() => setSaveStatus('idle'), 1600);
  };

  const onPublish = async () => {
    if (mode === 'edit' && validateForm(formRef.current).length) {
      showValidation();
      return;
    }
    setPublishStatus('pending');
    await wait(reduce ? 0 : 420);
    const ok = runFlow('publicar');
    setPublishStatus(ok ? 'success' : 'idle');
    if (ok) window.setTimeout(() => setPublishStatus('idle'), 2200);
  };

  const onLive = (action: 'archivar' | 'restaurar') => {
    if (!liveRow) return;
    const out = applyTransition(me, liveRow, action);
    announce(liveRow, action, out);
  };

  const onDelete = () => {
    const row = workingRow;
    if (!row) return;
    const res = removeWorkingDraft(me, row);
    setDeleteOpen(false);
    if (!res.ok) {
      toast.error('No se ha podido eliminar', res.reason);
      return;
    }
    dirtyRef.current = false;
    setDirty(false);
    if (row.revisionOf) {
      if (baseForm) setForm(baseForm);
      setSavedAt(undefined);
      setShowErrors(false);
      announceInfo('Revisión descartada', 'La versión publicada sigue siendo la vigente.');
    } else {
      announceInfo('Borrador eliminado', `Se ha eliminado ${meta.the} «${row.title}».`);
      navigate('/gestion');
    }
  };

  /* ── Acciones visibles según rol y estado ───────────────────────────── */
  const canSend = !isAdmin && mode === 'edit' && checkTransition(role, 'enviar', 'borrador', isOwner).ok && hasChanges;
  const canPublish = isAdmin && (mode === 'edit' ? hasChanges : !!flowRow && checkTransition(role, 'publicar', flowRow.status, flowRow.authorId === me.id).ok);
  const canReturn = !!flowRow && checkTransition(role, 'devolver', flowRow.status, flowRow.authorId === me.id).ok;
  const liveOwner = liveRow?.authorId === me.id;
  const canArchive = !!liveRow && checkTransition(role, 'archivar', liveRow.status, liveOwner).ok && !liveRow.openRevision && mode !== 'review';
  const canRestore = !!liveRow && checkTransition(role, 'restaurar', liveRow.status, liveOwner).ok;
  const canDelete = !!workingRow && !!workingData && mode === 'edit' && (isRevision || (!workingData.publishedAt && workingStatus === 'borrador'));

  const heading = mode === 'review' && isAdmin ? `Revisar ${meta.lower}` : isNewRoute && !workingData?.publishedAt ? meta.newLabel : `Editar ${meta.lower}`;
  usePageTitle(heading);
  const title = formTitle(form);

  const actions = (
    <div className={styles.actions}>
      {mode === 'edit' && <ActionButton variant="secondary" status={saveStatus} label="Guardar borrador" pendingLabel="Guardando…" successLabel="Guardado" icon={<Save />} onClick={onSave} />}
      {canSend && (
        <Button icon={<Send />} onClick={() => runFlow('enviar')}>
          Enviar a revisión
        </Button>
      )}
      {canReturn && (
        <Button variant="secondary" icon={<CornerUpLeft />} onClick={() => setReturnOpen(true)}>
          Devolver con comentario
        </Button>
      )}
      {(canPublish || publishStatus === 'success') && (
        <ActionButton status={publishStatus} label={isRevision ? 'Publicar revisión' : 'Publicar'} pendingLabel="Publicando…" successLabel="Publicado" icon={<BadgeCheck />} onClick={onPublish} disabled={publishStatus === 'success'} />
      )}
      {canRestore && (
        <Button variant="secondary" icon={<RotateCcw />} onClick={() => onLive('restaurar')}>
          Restaurar
        </Button>
      )}
      {canArchive && (
        <Button variant="ghost" icon={<Archive />} onClick={() => onLive('archivar')}>
          Archivar
        </Button>
      )}
      {liveRow?.publicHref && liveRow.status === 'publicado' && (
        <ButtonLink variant="ghost" to={liveRow.publicHref} icon={<ExternalLink />}>
          Ver publicado
        </ButtonLink>
      )}
    </div>
  );

  /* ── Avisos ─────────────────────────────────────────────────────────── */
  const notices: React.ReactNode[] = [];
  if (working?.returnComment && workingStatus === 'borrador') {
    notices.push(
      <Notice key="ret" tone="warning" icon={<CornerUpLeft size={18} />} title="Devuelto con comentarios">
        «{working.returnComment}» Corrígelo y vuelve a enviarlo a revisión.
      </Notice>,
    );
  }
  if (mode === 'review') {
    notices.push(
      isAdmin ? (
        <Notice key="rev" title="Pendiente de tu revisión">
          Léelo en la vista previa y publícalo, o devuélvelo con un comentario que explique qué hay que corregir.
        </Notice>
      ) : (
        <Notice key="rev" title="En revisión">
          Administración lo está revisando. No se puede editar hasta que lo publique o te lo devuelva con comentarios.
        </Notice>
      ),
    );
  } else if (mode === 'readonly') {
    if (displayStatus === 'archivado')
      notices.push(
        <Notice key="arc" tone="warning" title="Archivado">
          No se muestra en el campus. {canRestore ? 'Restáuralo para volver a publicarlo y editarlo.' : 'Solo administración puede restaurarlo.'}
        </Notice>,
      );
    else if (!canReviseBase || !canWrite)
      notices.push(
        <Notice key="ro" title="Solo lectura">
          Solo puedes consultar y modificar tus propios contenidos.
        </Notice>,
      );
    else if (displayStatus === 'publicado')
      notices.push(
        <Notice key="pub" tone="success" title="Publicado">
          Ya está en {meta.destination}. Para cambiarlo, abre una revisión: la versión pública no cambia hasta que se publique.
        </Notice>,
      );
  } else if (isRevision) {
    notices.push(
      <Notice key="isrev" title={working ? 'Revisión en curso' : 'Contenido publicado'}>
        {working ? 'Estás editando una revisión. La versión publicada no cambia hasta que se publique la revisión.' : `Está publicado en ${meta.destination}. Si cambias algo, se guardará como revisión y la versión pública no cambiará hasta que se publique.`}
      </Notice>,
    );
  }
  if (__DEMO__ && (type === 'formacion' || type === 'test') && displayStatus === 'publicado') {
    notices.push(
      <Notice key="sim-f" tone="info" title="Simulación">
        En la demostración, {type === 'formacion' ? 'las formaciones publicadas' : 'los tests publicados'} desde aquí quedan en Gestión; en la versión interna se incorporan a Aprender.
      </Notice>,
    );
  }

  const ctx: EditorContext = { me, role, isAdmin, today: madridDateKey(), isRevision, publishedId: liveRow && (type === 'evento' || type === 'comunicado') && liveRow.status === 'publicado' ? liveRow.id : undefined };
  const editorEl = (() => {
    switch (form.type) {
      case 'noticia':
        return <NewsEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'documento':
        return <DocumentEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'evento':
      case 'comunicado':
        return <EventEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'formacion':
        return <FormationEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'test':
        return <TestEditor value={form} update={update} err={err} ctx={ctx} />;
    }
  })();

  const previewEl = (
    <section className={styles.preview} aria-labelledby={`${panelId}-pv`}>
      <header className={styles.previewHead}>
        <h2 id={`${panelId}-pv`} className={styles.previewTitle}>
          Vista previa
        </h2>
        <p className={styles.previewWhere}>Así se verá en {meta.destination}</p>
      </header>
      <div className={styles.paper}>
        <ContentPreview form={form} meta={{ authorId: ownerId, status: displayStatus, reviewerName: workingData?.reviewerName }} />
      </div>
    </section>
  );

  const savedText = savedAt ? `Guardado a las ${hhmm(savedAt)}` : mode === 'edit' ? 'Se guarda solo mientras escribes' : '';

  return (
    <div className="container page">
      <PageHeader
        crumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Gestión', to: '/gestion' },
          { label: heading },
        ]}
        eyebrow={
          <>
            {meta.label} · {isRevision ? 'revisión de un contenido publicado' : 'plantilla'}
          </>
        }
        title={heading}
        lede={title ? <span className={styles.ledeTitle}>«{title}»</span> : meta.template}
      />

      {__DEMO__ && <p className={styles.sim}>{MESSAGES.demoSimulated}</p>}
      {notices.length > 0 && <div className={styles.notices}>{notices}</div>}

      <div className={styles.bar} data-compact={compact || undefined}>
        <div className={styles.barStatus}>
          <EditorialTrack status={displayStatus} />
          <div className={styles.barText}>
            <span ref={statusRef} tabIndex={-1} className={styles.barState}>
              {trackLabel(displayStatus)}
              {isRevision && working ? ' · revisión' : ''}
            </span>
            <span className={styles.saved}>
              <span aria-live="polite">{savedText}</span>
              {dirty && mode === 'edit' && <span className={styles.dirty}> · cambios pendientes</span>}
            </span>
          </div>
        </div>
        {compact && mode === 'edit' ? (
          <Tabs
            label="Modo del editor"
            size="sm"
            panelId={panelId}
            value={tab}
            onChange={setTab}
            options={[
              { value: 'editar', label: 'Editar' },
              { value: 'vista', label: 'Vista previa' },
            ]}
          />
        ) : (
          !compact && actions
        )}
      </div>
      {compact && mode !== 'edit' && <div className={styles.compactActions}>{actions}</div>}

      <AnimatePresence initial={false}>
        {showErrors && errors.length > 0 && (
          <motion.div
            key="summary"
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby={summaryId}
            className={styles.summary}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
          >
            <p id={summaryId} className={styles.summaryTitle}>
              <CircleAlert size={18} aria-hidden="true" /> {MESSAGES.invalidFields(errors.length)}
            </p>
            <ul className={styles.summaryList}>
              {errors.map((e, i) => (
                <li key={`${e.path}-${i}`}>
                  <button type="button" className={styles.summaryLink} onClick={() => focusField(e.path)}>
                    {e.message}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'edit' ? (
        compact ? (
          <div id={panelId} role="tabpanel" aria-label={tab === 'editar' ? 'Editar' : 'Vista previa'} className={styles.panel}>
            <form className={styles.form} hidden={tab !== 'editar'} noValidate onSubmit={(e) => e.preventDefault()}>
              {editorEl}
              <div className={styles.endActions}>
                <p className={styles.endTitle}>Siguiente paso</p>
                {actions}
              </div>
            </form>
            <div hidden={tab !== 'vista'}>
              {previewEl}
              <div className={styles.endActions}>{actions}</div>
            </div>
          </div>
        ) : (
          <div className={styles.workspace}>
            <form className={styles.form} noValidate onSubmit={(e) => e.preventDefault()} aria-label={`Formulario de ${meta.lower}`}>
              {editorEl}
              <div className={styles.endActions}>
                <p className={styles.endTitle}>Siguiente paso</p>
                {actions}
              </div>
            </form>
            <aside className={styles.previewPane} aria-label="Vista previa en vivo">
              {previewEl}
            </aside>
          </div>
        )
      ) : (
        <div className={styles.readonly}>{previewEl}</div>
      )}

      {canDelete && (
        <div className={styles.danger}>
          <Button variant="ghost" icon={<Trash />} onClick={() => setDeleteOpen(true)}>
            {isRevision ? 'Descartar la revisión' : 'Eliminar el borrador'}
          </Button>
        </div>
      )}

      <ReturnDialog
        open={returnOpen}
        title={title || meta.label}
        onClose={() => setReturnOpen(false)}
        onConfirm={(comment) => {
          setReturnOpen(false);
          runFlow('devolver', comment);
        }}
      />

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={isRevision ? '¿Descartar la revisión?' : '¿Eliminar el borrador?'}
        description={isRevision ? 'Se pierden los cambios de la revisión. La versión publicada no cambia.' : 'El borrador nunca se ha publicado. Esta acción no se puede deshacer.'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<Trash />} onClick={onDelete}>
              {isRevision ? 'Descartar' : 'Eliminar'}
            </Button>
          </>
        }
      />

      <Dialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="Tienes cambios sin guardar"
        description={MESSAGES.unsavedChanges}
        footer={
          <>
            <Button variant="ghost" onClick={() => blocker.reset?.()}>
              Seguir editando
            </Button>
            <Button variant="secondary" onClick={() => blocker.proceed?.()}>
              Salir sin guardar
            </Button>
            {mode === 'edit' && (
              <Button
                icon={<Save />}
                onClick={() => {
                  save('manual');
                  blocker.proceed?.();
                }}
              >
                Guardar y salir
              </Button>
            )}
          </>
        }
      />
    </div>
  );
}

function announceInfo(title: string, body: string) {
  toast.info(title, body);
}

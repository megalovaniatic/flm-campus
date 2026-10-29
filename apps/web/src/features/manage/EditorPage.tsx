import { AnimatePresence, motion } from 'motion/react';
import { Archive, ArrowLeft, BadgeCheck, CircleAlert, Ellipsis, ExternalLink, FilePlus2, FileQuestionMark, LayoutDashboard, PencilLine, RotateCcw, Save, ShieldAlert, Trash } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useBlocker, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { AREAS, can, canHandleType, checkTransition, isAreaId, madridDateKey, madridParts, ROLE_LABEL, type ContentType, type EditorialStatus } from '@flm/shared';
import { ActionButton, Button, ButtonLink, Checkbox, Dialog, EmptyState, Kbd, Notice, PageHeader, Popover, Tabs, toast, type ActionStatus } from '@/design';
import { useMe, usePeople } from '@/data/selectors';
import { uid, useDemo, type DraftRecord } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { announce, applyTransition, removeWorkingDraft, type TransitionAction } from './actions';
import { ContentPreview } from './ContentPreview';
import { EditorialTrack, trackLabel } from './EditorialTrack';
import { AssessmentEditor } from './editor/AssessmentEditor';
import { DocumentEditor } from './editor/DocumentEditor';
import { EventEditor } from './editor/EventEditor';
import { FormationEditor } from './editor/FormationEditor';
import { NewsEditor } from './editor/NewsEditor';
import { ClientEditor, WelcomeEditor } from './editor/PonteAlDiaEditors';
import type { EditorContext } from './editor/fields';
import { anchorId, assessmentIntro, validateForm, type AnyForm, type FieldError } from './forms';
import {
  areaAssessmentRow,
  canCreateType,
  canEditRow,
  destinationOf,
  draftRow,
  editHref,
  formTitle,
  formWithPendingQuiz,
  isContentType,
  isOwnRow,
  readDraft,
  revisionId,
  TYPE_META,
  typeNotAllowed,
  useCampusForms,
  useContentRows,
  type Actor,
  type ContentRow,
  type DraftData,
} from './model';
import { copyAsNew, startForm } from './templates';
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
  /** Borrador en el que se guarda: propio, nuevo o «rev-<id>» (cambios de algo publicado). */
  workingId: string;
  /** Contenido publicado del que se preparan cambios. */
  baseId?: string;
  initialForm: AnyForm;
  baseForm?: AnyForm;
  savedAt?: string;
  isNewRoute?: boolean;
  /** El test final del editor anterior se ha pasado a esta formación (migración de la demo). */
  importedQuiz?: boolean;
}

/** Resultado de la última publicación («Publicado · Ver publicado»). */
interface Published {
  /** Contenido publicado: el del borrador o aquel cuyos cambios se publicaron. */
  contentId: string;
  /** Se publicaron los cambios de algo que ya estaba publicado. */
  revision: boolean;
  href?: string;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="container page">{children}</div>;
}

/** Creador y editor por tipo, con vista previa en vivo, autoguardado, validación y «Guardar borrador» o «Publicar». */
export default function EditorPage() {
  const { type: typeParam, id: idParam } = useParams();
  const [search] = useSearchParams();
  const location = useLocation();
  const me = useMe();
  const drafts = useDemo((s) => s.drafts);
  const campusForm = useCampusForms();
  const rows = useContentRows();
  const freshId = useMemo(() => `bor-${uid().replace(/-/g, '').slice(0, 10)}`, [typeParam, location.key]);
  // Vive aquí y no en el editor: al publicar un borrador abierto desde Gestión, el editor pasa a sus
  // cambios («rev-<id>») y se vuelve a montar, y el aviso «Publicado · Ver publicado» debe seguir.
  const [published, setPublished] = useState<Published | null>(null);
  const today = madridDateKey();

  if (!me) return null;

  let target: Target | null = null;
  if (typeParam !== undefined) {
    if (!isContentType(typeParam)) return <EditorMissing />;
    if (!canCreateType(me.effectiveRole, typeParam)) return <EditorForbidden role={me.effectiveRole} />;
    const resume = search.get('borrador');
    const d = resume ? drafts[resume] : undefined;
    const data = d ? readDraft(d) : null;
    if (d && data && d.type === typeParam) {
      target = { key: `${typeParam}:${d.id}`, type: typeParam, workingId: d.id, initialForm: data.form, savedAt: d.updatedAt, isNewRoute: true };
    } else {
      // «Partir de un ejemplo»: copia de un contenido real (de la semilla o de Gestión).
      const from = search.get('desde');
      const source = from ? (drafts[from] ? readDraft(drafts[from])?.form : campusForm(from)?.form) : undefined;
      let initialForm = source && source.type === typeParam ? copyAsNew(source, today) : startForm(typeParam, me, today);
      // Evaluación de un área concreta (desde «Crear contenido › Evaluación del área»).
      const area = search.get('area');
      if (initialForm.type === 'test' && isAreaId(area)) initialForm = { ...initialForm, area, intro: assessmentIntro(area), quiz: { ...initialForm.quiz, title: `Evaluación del área ${AREAS[area].name}` } };
      // Una evaluación por área: si la suya ya existe, se abre esa en lugar de empezar otra. El borrador
      // que se acaba de crear aquí no cuenta (la dirección cambia a «?borrador=» justo después).
      const existing = initialForm.type === 'test' ? areaAssessmentRow(rows, initialForm.area, freshId) : undefined;
      if (existing) return <Navigate to={editHref(existing)} replace />;
      target = { key: `${typeParam}:${freshId}`, type: typeParam, workingId: freshId, initialForm, isNewRoute: true };
    }
  } else if (idParam) {
    const d = drafts[idParam];
    const data = d ? readDraft(d) : null;
    if (d && data && d.status === 'borrador') {
      const base = data.sourceId ? (drafts[data.sourceId] ? readDraft(drafts[data.sourceId])?.form : campusForm(data.sourceId)?.form) : undefined;
      target = { key: d.id, type: d.type, workingId: d.id, baseId: data.sourceId, initialForm: data.form, baseForm: base, savedAt: d.updatedAt };
    } else if (d && data) {
      // Publicado o archivado desde Gestión: los cambios van a «rev-<id>» (también el test que dejó la migración).
      const rev = drafts[revisionId(d.id)];
      const revData = rev ? readDraft(rev) : null;
      const migrated = revData ? undefined : formWithPendingQuiz(data.form, rev);
      target = { key: revisionId(d.id), type: d.type, workingId: revisionId(d.id), baseId: d.id, initialForm: revData?.form ?? migrated ?? data.form, baseForm: data.form, savedAt: revData ? rev?.updatedAt : undefined, importedQuiz: !!migrated };
    } else if (idParam.startsWith('rev-')) {
      return <Navigate to={`/gestion/editar/${encodeURIComponent(idParam.slice(4))}`} replace />;
    } else {
      const campus = campusForm(idParam);
      if (!campus) return <EditorMissing />;
      const rev = drafts[revisionId(idParam)];
      const revData = rev ? readDraft(rev) : null;
      const migrated = revData ? undefined : formWithPendingQuiz(campus.form, rev);
      target = { key: revisionId(idParam), type: campus.type, workingId: revisionId(idParam), baseId: idParam, initialForm: revData?.form ?? migrated ?? campus.form, baseForm: campus.form, savedAt: revData ? rev?.updatedAt : undefined, importedQuiz: !!migrated };
    }
  }
  if (!target) return <EditorMissing />;
  const { key, ...props } = target;
  const contentId = props.baseId ?? props.workingId;
  return <Editor key={key} {...props} me={me} initialStep={search.get('paso')} published={published?.contentId === contentId ? published : null} onPublished={setPublished} />;
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
      <EmptyState icon={<ShieldAlert />} tone="error" title={MESSAGES.forbidden.title} action={<ButtonLink to="/gestion/nuevo">Ver qué puedes crear</ButtonLink>}>
        <p>Tu perfil actual ({ROLE_LABEL[role]}) no puede crear este tipo de contenido.</p>
      </EmptyState>
    </Shell>
  );
}

function Editor({
  type,
  workingId,
  baseId,
  initialForm,
  baseForm,
  savedAt: initialSavedAt,
  isNewRoute,
  importedQuiz,
  me,
  initialStep,
  published,
  onPublished,
}: Omit<Target, 'key'> & { me: Actor; initialStep: string | null; published: Published | null; onPublished: (p: Published | null) => void }) {
  const role = me.effectiveRole;
  const isAdmin = can(role, 'contenido:editar-cualquiera');
  const reduce = useReducedMotionPref();
  const rows = useContentRows();
  const people = usePeople();
  const working = useDemo((s) => s.drafts[workingId]);
  const workingRow = useMemo(() => rows.find((r) => r.key === `d:${workingId}`), [rows, workingId]);
  const baseRow = useMemo(() => (baseId ? rows.find((r) => r.id === baseId && r.key !== `d:${workingId}`) : undefined), [rows, baseId, workingId]);
  const navigate = useNavigate();
  const [, setSearch] = useSearchParams();
  const compact = useMediaQuery('(max-width: 1099px)');
  const nameOf = useCallback((id: string) => people.find((p) => p.id === id)?.name, [people]);

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
  const doneRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'editar' | 'vista'>('editar');
  const [saveStatus, setSaveStatus] = useState<ActionStatus>('idle');
  const [publishStatus, setPublishStatus] = useState<ActionStatus>('idle');
  const [publishOpen, setPublishOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const panelId = useId();
  const summaryId = useId();

  /* ── Estado y permisos (reflejo de checkTransition) ─────────────────── */
  const isRevision = !!baseId;
  const workingStatus: EditorialStatus = working?.status ?? 'borrador';
  // El aviso de publicado sale del estado de la demo: tras «Deshacer» desaparece (los cambios vuelven a
  // estar guardados aparte o el borrador vuelve a ser borrador).
  const done = !!published && (isRevision ? !working : workingStatus === 'publicado');
  // La propiedad es la del contenido: en los cambios de algo publicado, la de su versión publicada.
  const ownsContent = baseRow ? isOwnRow(me, baseRow) : working ? working.authorId === me.id : true;
  // El tipo, también al editar lo que ya existe: la evaluación del área es de administración.
  const handlesType = canHandleType(role, type);
  const canWrite = handlesType && checkTransition(role, 'guardar', 'borrador', ownsContent).ok;
  const baseEditable = !baseRow || baseRow.status === 'publicado';
  const editable = canWrite && baseEditable && workingStatus === 'borrador';
  const mode: 'edit' | 'readonly' = editable ? 'edit' : 'readonly';
  const editableRef = useRef(editable);
  editableRef.current = editable;
  const displayStatus: EditorialStatus = isRevision ? (baseRow?.status ?? 'publicado') : workingStatus;
  const liveRow: ContentRow | undefined = baseRow ?? (workingRow && workingRow.status !== 'borrador' ? workingRow : undefined);
  const hasChanges = !isRevision || !!working || dirty;
  const meta = TYPE_META[type];
  // Con el área ya elegida, el destino concreto: «Aprender › Laboral»
  const destination = destinationOf(type, 'area' in form ? form.area : undefined);
  const workingData: DraftData | null = working ? readDraft(working) : null;
  const bylineAuthor = isRevision ? baseRow?.ownerId : (working?.authorId ?? me.id);

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
      const data: DraftData = prev ? { ...prev, schema: 2, form: f } : { schema: 2, form: f, ...(baseId ? { sourceId: baseId } : {}) };
      delete data.pendingQuiz;
      const record: DraftRecord = {
        id: workingId,
        type,
        title: formTitle(f, nameOf),
        status: existing?.status ?? 'borrador',
        authorId: existing?.authorId ?? me.id,
        updatedAt: nowIso,
        data: data as unknown as Record<string, unknown>,
        revision: (existing?.revision ?? 0) + 1,
      };
      st.saveDraft(record);
      dirtyRef.current = false;
      lastSave.current = Date.now();
      setDirty(false);
      setSavedAt(nowIso);
      const entityId = baseId ?? workingId;
      if (!existing || !readDraft(existing)) {
        st.log({ actorId: me.id, action: baseId ? 'contenido.guardar' : 'contenido.crear', entity: type, entityId, ...(baseId ? { detail: 'Revisión de un contenido publicado' } : {}) });
        if (isNewRoute) setSearch({ borrador: workingId }, { replace: true, preventScrollReset: true });
      } else if (reason === 'manual') {
        st.log({ actorId: me.id, action: 'contenido.guardar', entity: type, entityId, ...(baseId ? { detail: 'Revisión de un contenido publicado' } : {}) });
      }
      return record;
    },
    [workingId, type, baseId, me.id, isNewRoute, setSearch, nameOf],
  );

  const update = useCallback(
    <T extends AnyForm>(fn: (prev: T) => T) => {
      setForm((prev) => fn(prev as T));
      dirtyRef.current = true;
      setDirty(true);
      onPublished(null);
    },
    [onPublished],
  );

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

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

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
  const flowRow = (): ContentRow | undefined => {
    const rec = mode === 'edit' ? save('auto') : null;
    return rec ? (draftRow(rec, useDemo.getState().drafts, nameOf) ?? undefined) : workingRow;
  };

  const run = (action: TransitionAction, row: ContentRow | undefined, opts: { reviewed?: boolean } = {}): boolean => {
    if (!row) return false;
    const out = applyTransition(me, row, action, opts);
    if (!out.ok && out.errors) {
      showValidation();
      return false;
    }
    // «Deshacer» deja el editor como estaba antes de publicar: sin el aviso ni el botón «Publicado».
    const restore = out.undo;
    const undo =
      restore &&
      (() => {
        restore();
        onPublished(null);
        setPublishStatus('idle');
      });
    announce(row, action, { ...out, undo });
    if (out.ok) {
      setShowErrors(false);
      if (action === 'publicar') onPublished({ contentId: baseId ?? workingId, revision: isRevision, href: out.href });
      else window.setTimeout(() => statusRef.current?.focus(), 60);
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

  const askPublish = () => {
    if (validateForm(formRef.current).length) {
      showValidation();
      return;
    }
    setReviewed(false);
    setPublishOpen(true);
  };

  const onPublish = async () => {
    setPublishOpen(false);
    setPublishStatus('pending');
    await wait(reduce ? 0 : 420);
    const ok = run('publicar', flowRow(), { reviewed });
    setPublishStatus(ok ? 'success' : 'idle');
    if (ok) window.setTimeout(() => setPublishStatus('idle'), 2200);
  };

  const onLive = (action: 'archivar' | 'restaurar') => {
    if (!liveRow) return;
    const out = applyTransition(me, liveRow, action);
    announce(liveRow, action, out);
    if (out.ok) window.setTimeout(() => statusRef.current?.focus(), 60);
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
      toast.info('Cambios descartados', 'La versión publicada sigue siendo la vigente.');
    } else {
      toast.info('Borrador eliminado', `Se ha eliminado ${meta.the} «${row.title}».`);
      navigate('/gestion');
    }
  };

  /* ── Acciones visibles según rol y estado ───────────────────────────── */
  const canPublish = mode === 'edit' && hasChanges && checkTransition(role, 'publicar', 'borrador', ownsContent).ok;
  const liveOwner = !!liveRow && isOwnRow(me, liveRow);
  const canArchive = !!liveRow && liveRow.status === 'publicado' && checkTransition(role, 'archivar', 'publicado', liveOwner).ok && !working;
  const canRestore = !!liveRow && liveRow.status === 'archivado' && checkTransition(role, 'restaurar', 'archivado', liveOwner).ok;
  // Los cambios guardados se descartan aunque aún no tengan formulario (la revisión que dejó la migración).
  const canDelete = !!workingRow && mode === 'edit' && (isRevision || (!!workingData && !workingData.publishedAt && workingStatus === 'borrador'));
  const canOpenRevision = mode === 'readonly' && !!liveRow && liveRow.status === 'publicado' && canEditRow(me, liveRow) && !isRevision;
  const liveHref = liveRow?.status === 'publicado' ? liveRow.publicHref : undefined;

  // Atajos del editor: Control (⌘) + S guarda y Control (⌘) + Intro abre «Publicar».
  const shortcuts = useRef({ save: onSave, publish: askPublish, canPublish, mode });
  shortcuts.current = { save: onSave, publish: askPublish, canPublish, mode };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const s = shortcuts.current;
      if (e.key.toLowerCase() === 's' && s.mode === 'edit') {
        e.preventDefault();
        void s.save();
      } else if (e.key === 'Enter' && s.canPublish) {
        e.preventDefault();
        s.publish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const heading = isNewRoute && !workingData?.publishedAt ? meta.newLabel : `Editar ${meta.lower}`;
  usePageTitle(heading);
  const title = formTitle(form, nameOf);
  const publishLabel = isRevision ? 'Publicar cambios' : 'Publicar';

  const more: { key: string; label: string; icon: React.ReactNode; run?: () => void; href?: string; danger?: boolean }[] = [];
  if (liveHref) more.push({ key: 'ver', label: 'Ver publicado', icon: <ExternalLink size={18} />, href: liveHref });
  if (canArchive) more.push({ key: 'archivar', label: 'Archivar', icon: <Archive size={18} />, run: () => onLive('archivar') });
  if (canDelete) more.push({ key: 'quitar', label: isRevision ? 'Descartar los cambios' : 'Eliminar el borrador', icon: <Trash size={18} />, run: () => setDeleteOpen(true), danger: true });

  const actions = (
    <div className={styles.actions}>
      {mode === 'edit' && <ActionButton variant="secondary" status={saveStatus} label="Guardar borrador" pendingLabel="Guardando…" successLabel="Guardado" icon={<Save />} onClick={onSave} />}
      {(canPublish || publishStatus === 'success') && (
        <ActionButton status={publishStatus} label={publishLabel} pendingLabel="Publicando…" successLabel="Publicado" icon={<BadgeCheck />} onClick={askPublish} disabled={publishStatus === 'success'} />
      )}
      {canOpenRevision && (
        <ButtonLink to={`/gestion/editar/${encodeURIComponent(liveRow.id)}`} icon={<PencilLine />}>
          Editar
        </ButtonLink>
      )}
      {canRestore && (
        <Button variant="secondary" icon={<RotateCcw />} onClick={() => onLive('restaurar')}>
          Restaurar
        </Button>
      )}
      {more.length > 0 && (
        <Popover label="Más acciones" width={250} triggerClassName={styles.more} trigger={<Ellipsis size={20} aria-hidden="true" />}>
          {(close) => (
            <ul role="list" className={styles.menu}>
              {more.map((it) => (
                <li key={it.key}>
                  {it.href ? (
                    <Link to={it.href} className={styles.menuItem} onClick={close}>
                      {it.icon} {it.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={styles.menuItem}
                      data-danger={it.danger || undefined}
                      onClick={() => {
                        close();
                        it.run?.();
                      }}
                    >
                      {it.icon} {it.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Popover>
      )}
    </div>
  );

  /* ── Avisos ─────────────────────────────────────────────────────────── */
  const notices: React.ReactNode[] = [];
  // La revisión que dejó la migración solo lleva el test (sin formulario) hasta que se guarda.
  if (importedQuiz && !workingData && mode === 'edit') {
    notices.push(
      <Notice key="quiz" title="Tu test final está aquí">
        El test que preparaste con el editor anterior se ha pasado a esta formación, en «Test final». Revísalo y publica los cambios cuando esté listo.
      </Notice>,
    );
  }
  if (mode === 'readonly') {
    if (displayStatus === 'archivado') {
      notices.push(
        <Notice key="arc" tone="warning" title="Archivado">
          No se muestra en el campus. {canRestore ? 'Restáuralo para volver a publicarlo y editarlo.' : 'Solo administración puede restaurarlo.'}
        </Notice>,
      );
    } else if (!handlesType) {
      notices.push(
        <Notice key="ro" title="Solo lectura">
          {typeNotAllowed(role, type)}
        </Notice>,
      );
    } else if (!canWrite || (baseRow && !canEditRow(me, baseRow))) {
      notices.push(
        <Notice key="ro" title="Solo lectura">
          Solo puedes consultar y modificar tus propios contenidos.
        </Notice>,
      );
    } else if (displayStatus === 'publicado' && !done) {
      notices.push(
        <Notice key="pub" tone="success" title="Publicado">
          Ya está en {destination}. Para cambiarlo, pulsa «Editar»: la versión pública no cambia hasta que publiques los cambios.
        </Notice>,
      );
    }
  } else if (isRevision && !done) {
    notices.push(
      <Notice key="isrev" title={working ? 'Cambios sin publicar' : 'Estás editando algo publicado'}>
        {working ? `Tus cambios se guardan aparte: ${destination} sigue mostrando la versión publicada hasta que pulses «Publicar cambios».` : `Está publicado en ${destination}. Si cambias algo, se guardará aparte y la versión pública no cambiará hasta que pulses «Publicar cambios».`}
      </Notice>,
    );
  }

  const ctx: EditorContext = {
    me,
    role,
    isAdmin,
    today: madridDateKey(),
    isRevision,
    publishedId: liveRow && (type === 'evento' || type === 'comunicado') && liveRow.status === 'publicado' ? liveRow.id : undefined,
    contentId: baseId ?? workingId,
  };
  // El asterisco de cada etiqueta es decorativo (aria-hidden): los lectores de pantalla ya anuncian «obligatorio»
  const requiredNote = (
    <p className={styles.requiredNote}>
      Los campos marcados con{' '}
      <span className={styles.requiredMark} aria-hidden="true">
        *
      </span>
      <span className="sr-only">asterisco</span> son obligatorios para publicar. Para guardar un borrador no hace falta completarlos.
    </p>
  );

  const editorEl = (() => {
    switch (form.type) {
      case 'formacion':
        return <FormationEditor value={form} update={update} err={err} ctx={ctx} errors={errors} showErrors={showErrors} reduce={reduce} initialStep={initialStep} />;
      case 'test':
        return <AssessmentEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'noticia':
        return <NewsEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'documento':
        return <DocumentEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'evento':
      case 'comunicado':
        return <EventEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'cliente':
        return <ClientEditor value={form} update={update} err={err} ctx={ctx} />;
      case 'bienvenida':
        return <WelcomeEditor value={form} update={update} err={err} ctx={ctx} />;
    }
  })();

  const previewEl = (
    <section className={styles.preview} aria-labelledby={`${panelId}-pv`}>
      <header className={styles.previewHead}>
        <h2 id={`${panelId}-pv`} className={styles.previewTitle}>
          Vista previa
        </h2>
        <p className={styles.previewWhere}>Así se verá en {destination}</p>
      </header>
      <div className={styles.paper}>
        <ContentPreview form={form} meta={{ authorId: bylineAuthor, status: done ? 'publicado' : displayStatus, reviewerName: workingData?.reviewerName }} />
      </div>
    </section>
  );

  const savedText = savedAt ? `Guardado a las ${hhmm(savedAt)}` : mode === 'edit' ? 'Se guarda solo mientras escribes' : '';
  const shownStatus: EditorialStatus = done ? 'publicado' : displayStatus;

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Inicio', to: '/' }, { label: 'Gestión', to: '/gestion' }, ...(isNewRoute ? [{ label: 'Crear contenido', to: '/gestion/nuevo' }] : []), { label: heading }]}
        eyebrow={
          <>
            {meta.label} · {isRevision ? 'cambios de algo publicado' : `aparecerá en ${destination}`}
          </>
        }
        title={heading}
        lede={title ? <span className={styles.ledeTitle}>«{title}»</span> : meta.description}
      />

      {__DEMO__ && <p className={styles.sim}>{MESSAGES.demoSimulated}</p>}
      {notices.length > 0 && <div className={styles.notices}>{notices}</div>}

      <AnimatePresence initial={false}>
        {done && published && (
          <motion.div key="done" ref={doneRef} tabIndex={-1} className={styles.done} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }} role="status">
            <p className={styles.doneTitle}>
              <BadgeCheck size={20} aria-hidden="true" /> {published.revision ? 'Cambios publicados' : 'Publicado'} en {destination}
            </p>
            <p className={styles.doneText}>Ya lo ve todo el equipo. Durante unos segundos puedes deshacerlo desde el aviso.</p>
            <div className={styles.doneActions}>
              {published.href && (
                <ButtonLink to={published.href} icon={<ExternalLink />}>
                  Ver publicado
                </ButtonLink>
              )}
              <ButtonLink variant="secondary" to="/gestion/nuevo" icon={<FilePlus2 />}>
                Crear otro contenido
              </ButtonLink>
              <ButtonLink variant="ghost" to="/gestion" icon={<LayoutDashboard />}>
                Volver a Gestión
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.bar} data-compact={compact || undefined}>
        <div className={styles.barStatus}>
          <EditorialTrack status={shownStatus} />
          <div className={styles.barText}>
            <span ref={statusRef} tabIndex={-1} className={styles.barState}>
              {trackLabel(shownStatus)}
              {isRevision && working ? ' · cambios sin publicar' : ''}
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
      {compact && <div className={styles.compactActions}>{actions}</div>}
      {mode === 'edit' && !compact && (
        <p className={styles.keys}>
          <Kbd>Ctrl</Kbd> <Kbd>S</Kbd> guarda · <Kbd>Ctrl</Kbd> <Kbd>Intro</Kbd> publica
        </p>
      )}

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
              <CircleAlert size={18} aria-hidden="true" /> Antes de publicar: {MESSAGES.invalidFields(errors.length).toLowerCase()}
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
              {requiredNote}
              {editorEl}
              <div className={styles.endActions}>
                <p className={styles.endTitle}>Siguiente paso</p>
                {actions}
              </div>
            </form>
            <div hidden={tab !== 'vista'}>{previewEl}</div>
          </div>
        ) : (
          <div className={styles.workspace}>
            <form className={styles.form} noValidate onSubmit={(e) => e.preventDefault()} aria-label={`Formulario: ${meta.lower}`}>
              {requiredNote}
              {editorEl}
              <div className={styles.endActions}>
                <p className={styles.endTitle}>Siguiente paso</p>
                <p className={styles.endText}>«Guardar borrador» lo deja en Gestión, sin que nadie más lo vea. «{publishLabel}» lo lleva a {destination}.</p>
                {actions}
              </div>
            </form>
            <aside className={styles.previewPane} aria-label="Vista previa en vivo" tabIndex={0}>
              {previewEl}
            </aside>
          </div>
        )
      ) : (
        <div className={styles.readonly}>{previewEl}</div>
      )}

      <Dialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title={isRevision ? '¿Publicar los cambios?' : `¿Publicar ${meta.the}?`}
        description={
          isRevision
            ? `Los cambios sustituyen a la versión publicada en ${destination}. La anterior deja de verse.`
            : `Aparecerá en ${destination} y lo verá todo el equipo en cuanto lo publiques.`
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" data-autofocus onClick={() => setPublishOpen(false)}>
              Seguir editando
            </Button>
            <Button icon={<BadgeCheck />} onClick={() => void onPublish()}>
              {publishLabel}
            </Button>
          </>
        }
      >
        <div className={styles.publishBody}>
          <p className={styles.publishWhat}>
            <strong>{title || meta.label}</strong>
          </p>
          {form.type === 'formacion' && form.majorChange && (
            <Notice tone="warning" title="Cambio importante">
              La formación pasará a la versión {form.version + 1}: quien ya la había completado tendrá que volver a leerla y confirmarlo.
            </Notice>
          )}
          {(form.type === 'formacion' || form.type === 'noticia' || form.type === 'documento' || form.type === 'test') && (
            <Checkbox
              label="Lo ha revisado el área"
              hint={`Se mostrará «Revisado por ${me.name}». Si no lo marcas, se publica igualmente y ${isRevision ? 'la revisión vuelve a quedar pendiente, aunque la versión anterior estuviera revisada' : 'queda pendiente de revisión'}.`}
              checked={reviewed}
              onChange={setReviewed}
            />
          )}
          <p className={styles.small}>Durante unos segundos podrás deshacerlo desde el aviso. Después, administración puede archivarlo.</p>
        </div>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={isRevision ? '¿Descartar los cambios?' : '¿Eliminar el borrador?'}
        description={isRevision ? 'Se pierden los cambios sin publicar. La versión publicada no cambia.' : 'El borrador nunca se ha publicado. Esta acción no se puede deshacer.'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" data-autofocus onClick={() => setDeleteOpen(false)}>
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
            <Button variant="ghost" data-autofocus onClick={() => blocker.reset?.()}>
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

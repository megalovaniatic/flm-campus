import { AnimatePresence, motion } from 'motion/react';
import { Archive, ArrowRight, BadgeCheck, Copy, Ellipsis, ExternalLink, Eye, FlaskConical, Inbox, PencilLine, Plus, RotateCcw, Search, ShieldCheck, Trash, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AREAS, can, canHandleType, checkTransition, formatShortDate, madridDateKey, madridParts, neutralSignature, normalize, relativeDay, STATUS_LABEL_EDITORIAL, type ContentType, type EditorialStatus } from '@flm/shared';
import { AreaTag, Avatar, Button, ButtonLink, Checkbox, Dialog, EditorialChip, EmptyState, Notice, PageHeader, Popover, SelectField, Tabs, toast } from '@/design';
import { useMe, usePeople } from '@/data/selectors';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { announce, applyTransition, removeWorkingDraft, type TransitionAction } from './actions';
import { ContentPreview } from './ContentPreview';
import {
  AREA_FILTERS,
  canCreateType,
  canEditRow,
  canSeeRow,
  CONTENT_TYPES,
  destinationOf,
  editHref,
  isOwnRow,
  readDraft,
  rowForm,
  TYPE_META,
  useCampusForms,
  useContentRows,
  withoutAuthor,
  type Actor,
  type ContentRow,
} from './model';
import { TypeTile } from './TypeTile';
import { useMediaQuery } from './useMediaQuery';
import styles from './ManagePage.module.css';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(2, '0');

type TabValue = 'todo' | EditorialStatus;
const TABS: { value: TabValue; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'borrador', label: 'Borradores' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'archivado', label: 'Archivado' },
];
const isTab = (v: string | null): v is TabValue => !!v && TABS.some((t) => t.value === v);

/** «hoy, 23:41», «ayer, 10:02» o «22 oct» (con año si no es el actual). */
function whenLabel(row: ContentRow): string {
  if (!row.updatedAt) return '';
  const d = new Date(row.updatedAt);
  if (Number.isNaN(d.getTime())) return '';
  const key = madridDateKey(d);
  const today = madridDateKey();
  const rel = relativeDay(key, today);
  if (rel === 'hoy' || rel === 'ayer') {
    if (row.dateOnly) return rel;
    const p = madridParts(d);
    return `${rel}, ${pad(p.hour)}:${pad(p.minute)}`;
  }
  return formatShortDate(key, key.slice(0, 4) !== today.slice(0, 4));
}

function AreaCell({ area }: { area: ContentRow['area'] }) {
  if (!area) return <span className={styles.none}>—<span className="sr-only">Sin área</span></span>;
  return <AreaTag area={area} size="sm" />;
}

interface RowHandlers {
  actor: Actor;
  onPreview: (row: ContentRow) => void;
  onPublish: (row: ContentRow) => void;
  onAction: (row: ContentRow, action: TransitionAction) => void;
  onRemove: (row: ContentRow) => void;
}

function RowFlags({ row }: { row: ContentRow }) {
  const flags: ReactNode[] = [];
  if (row.revisionOf) flags.push(<span key="r">Cambios de algo publicado</span>);
  if (row.openRevision) flags.push(<span key="o" className={styles.pending}>Cambios sin publicar</span>);
  if (row.example) flags.push(<span key="e" className={styles.example}>Ejemplo</span>);
  if (!flags.length) return null;
  return <span className={styles.flags}>{flags}</span>;
}

/**
 * Acciones por fila según permisos (checkTransition), tipo (canHandleType) y estado: una principal y el
 * resto en «Más acciones». La propiedad es la del contenido, también en sus cambios guardados (`ownerId`).
 */
function RowActions({ row, actor, onPreview, onPublish, onAction, onRemove }: RowHandlers & { row: ContentRow }) {
  const role = actor.effectiveRole;
  const isOwner = isOwnRow(actor, row);
  const from: EditorialStatus = row.revisionOf ? 'borrador' : row.status;
  const ok = (a: TransitionAction) => canHandleType(role, row.type) && checkTransition(role, a, from, isOwner).ok;
  const editable = canEditRow(actor, row) && (row.status === 'borrador' || row.status === 'publicado');
  const data = row.draft ? readDraft(row.draft) : null;
  // Los cambios guardados se descartan aunque aún no tengan formulario (la revisión que dejó la migración).
  const removable = !!row.draft && canEditRow(actor, row) && (!!row.revisionOf || (!!data && row.status === 'borrador' && !data.publishedAt));
  const copyable = !row.revisionOf && row.type !== 'test' && canCreateType(role, row.type);

  const primary = editable ? (
    <ButtonLink size="sm" variant="secondary" to={editHref(row)} icon={<PencilLine />}>
      Editar
    </ButtonLink>
  ) : (
    <Button size="sm" variant="secondary" icon={<Eye />} onClick={() => onPreview(row)}>
      Vista previa
    </Button>
  );

  const items: { key: string; label: string; icon: ReactNode; run: () => void; danger?: boolean; href?: string }[] = [];
  if (editable) items.push({ key: 'preview', label: 'Vista previa', icon: <Eye size={18} />, run: () => onPreview(row) });
  if (data && ok('publicar')) items.push({ key: 'publicar', label: row.revisionOf ? 'Publicar los cambios' : 'Publicar', icon: <BadgeCheck size={18} />, run: () => onPublish(row) });
  if (row.publicHref && row.status === 'publicado' && !row.revisionOf) items.push({ key: 'ver', label: 'Ver publicado', icon: <ExternalLink size={18} />, run: () => undefined, href: row.publicHref });
  if (copyable) items.push({ key: 'copiar', label: 'Duplicar como borrador nuevo', icon: <Copy size={18} />, run: () => undefined, href: `/gestion/nuevo/${row.type}?desde=${encodeURIComponent(row.id)}` });
  if (!row.revisionOf && row.status === 'publicado' && ok('archivar') && !row.openRevision) items.push({ key: 'archivar', label: 'Archivar', icon: <Archive size={18} />, run: () => onAction(row, 'archivar') });
  if (!row.revisionOf && row.status === 'archivado' && ok('restaurar')) items.push({ key: 'restaurar', label: 'Restaurar', icon: <RotateCcw size={18} />, run: () => onAction(row, 'restaurar') });
  if (removable) items.push({ key: 'quitar', label: row.revisionOf ? 'Descartar los cambios' : 'Eliminar el borrador', icon: <Trash size={18} />, run: () => onRemove(row), danger: true });

  return (
    <div className={styles.rowActions}>
      {primary}
      {items.length > 0 && (
        <Popover label={`Más acciones para «${row.title}»`} width={270} triggerClassName={styles.more} trigger={<Ellipsis size={20} aria-hidden="true" />}>
          {(close) => (
            <ul role="list" className={styles.menu}>
              {items.map((it) => (
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
                        it.run();
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
}

/**
 * Autoría del contenido de una fila (en unos cambios de algo publicado, la de ese contenido). Si la persona
 * ya no está en el campus (o nunca la hubo), «Sin autoría» con la firma pública.
 */
function Author({ row, compact }: { row: ContentRow; compact?: boolean }) {
  const people = usePeople();
  const p = row.ownerId ? people.find((x) => x.id === row.ownerId) : undefined;
  if (!p) {
    return (
      <span className={styles.author} data-none>
        <span className={styles.noAuthor} aria-hidden="true">
          —
        </span>
        <span className={styles.authorText}>
          <span className={styles.authorName}>Sin autoría</span>
          <span className={styles.authorSub}>Firma: {neutralSignature({ type: row.type, area: row.area })}</span>
        </span>
      </span>
    );
  }
  return (
    <span className={styles.author}>
      <Avatar name={p.name} photo={p.photo ? base + p.photo : undefined} size={compact ? 24 : 28} decorative />
      <span className={styles.authorName}>{p.name}</span>
    </span>
  );
}

const rowMotion = {
  layout: 'position' as const,
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, transition: { duration: 0.14 } },
  transition: { duration: 0.24, ease: [0.2, 0, 0, 1] as [number, number, number, number] },
};

function StatusCell({ status }: { status: EditorialStatus }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={status} className={styles.statusWrap} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 520, damping: 32 }}>
        <EditorialChip status={status} size="sm" />
      </motion.span>
    </AnimatePresence>
  );
}

function ContentTable({ rows, handlers, caption }: { rows: ContentRow[]; handlers: RowHandlers; caption: string }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Contenido</th>
            <th scope="col">Área</th>
            <th scope="col">Estado</th>
            <th scope="col" className={styles.colAuthor}>
              Autoría
            </th>
            <th scope="col">Actualizado</th>
            <th scope="col">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <motion.tr key={row.key} {...rowMotion}>
                <td>
                  <span className={styles.titleCell}>
                    <TypeTile type={row.type} />
                    <span className={styles.titleText}>
                      <span className={styles.typeLabel}>{TYPE_META[row.type].label}</span>
                      <span className={styles.rowTitle}>{row.title}</span>
                      <RowFlags row={row} />
                    </span>
                  </span>
                </td>
                <td>
                  <AreaCell area={row.area} />
                </td>
                <td>
                  <StatusCell status={row.revisionOf ? 'borrador' : row.status} />
                </td>
                <td className={styles.colAuthor}>
                  <Author row={row} />
                </td>
                <td className={styles.when}>{whenLabel(row)}</td>
                <td>
                  <RowActions row={row} {...handlers} />
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

function ContentCards({ rows, handlers }: { rows: ContentRow[]; handlers: RowHandlers }) {
  return (
    <ul role="list" className={styles.cards}>
      <AnimatePresence initial={false}>
        {rows.map((row) => (
          <motion.li key={row.key} {...rowMotion} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.titleCell}>
                <TypeTile type={row.type} size={28} />
                <span className={styles.typeLabel}>{TYPE_META[row.type].label}</span>
              </span>
              <StatusCell status={row.revisionOf ? 'borrador' : row.status} />
            </div>
            <h3 className={styles.cardTitle}>{row.title}</h3>
            <RowFlags row={row} />
            <div className={styles.cardMeta}>
              <AreaCell area={row.area} />
              <Author row={row} compact />
              <span className={styles.when}>{whenLabel(row)}</span>
            </div>
            <RowActions row={row} {...handlers} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/**
 * Crear: acceso rápido a cada tipo (tarjetas normales con la cápsula de acción; sin protagonista en Gestión).
 * La evaluación del área no está: una por área, se empieza eligiendo el área en «Crear contenido».
 */
function QuickCreate({ actor }: { actor: Actor }) {
  const types = CONTENT_TYPES.filter((t) => t !== 'test' && canCreateType(actor.effectiveRole, t));
  if (!types.length) return null;
  return (
    <section className={styles.block} aria-labelledby="h-crear">
      <div className={styles.blockHead}>
        <h2 id="h-crear" className={styles.blockTitle}>
          Crear
        </h2>
        <Link to="/gestion/nuevo" className="link-arrow">
          Ver todos los tipos, con ejemplos <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ul role="list" className={styles.quick}>
        {types.map((t) => (
          <li key={t} className={styles.quickCard} data-cta-host>
            <TypeTile type={t} size={36} />
            <span className={styles.quickText}>
              <Link to={`/gestion/nuevo/${t}`} className={styles.quickLink}>
                {TYPE_META[t].label}
              </Link>
              <span className={styles.quickWhere}>{TYPE_META[t].destination}</span>
            </span>
            <span className="cta-pill" aria-hidden="true">
              <Plus size={16} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** «Sigue donde lo dejaste»: tus borradores más recientes. */
function Resume({ rows }: { rows: ContentRow[] }) {
  if (!rows.length) return null;
  return (
    <section className={styles.block} aria-labelledby="h-seguir">
      <div className={styles.blockHead}>
        <h2 id="h-seguir" className={styles.blockTitle}>
          Sigue donde lo dejaste
        </h2>
      </div>
      <ul role="list" className={styles.resume}>
        {rows.map((r) => (
          <li key={r.key} className={styles.resumeCard} data-cta-host>
            <span className={styles.titleCell}>
              <TypeTile type={r.type} size={28} />
              <span className={styles.typeLabel}>{r.revisionOf ? `${TYPE_META[r.type].label} · cambios sin publicar` : TYPE_META[r.type].label}</span>
            </span>
            <Link to={editHref(r)} className={styles.resumeLink}>
              {r.title}
            </Link>
            <span className={styles.resumeFoot}>
              <span className={styles.when}>Guardado {whenLabel(r)}</span>
              <span className="cta-pill" aria-hidden="true">
                Seguir <ArrowRight size={16} />
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Espacio de trabajo de Gestión: crear, seguir con lo empezado y todo el contenido por estado. */
export default function ManagePage() {
  usePageTitle('Gestión de contenidos');
  const me = useMe();
  const all = useContentRows();
  const people = usePeople();
  const campus = useCampusForms();
  const navigate = useNavigate();
  const compact = useMediaQuery('(max-width: 899px)');
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(30);
  const [preview, setPreview] = useState<ContentRow | null>(null);
  const [publishing, setPublishing] = useState<ContentRow | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [removing, setRemoving] = useState<ContentRow | null>(null);

  const tab: TabValue = isTab(params.get('estado')) ? (params.get('estado') as TabValue) : 'todo';
  const q = params.get('q') ?? '';
  const tipo = params.get('tipo') ?? '';
  const area = params.get('area') ?? '';
  const autoria = params.get('autoria') ?? '';
  const orden = params.get('orden') === 'titulo' ? 'titulo' : 'recientes';

  const setParam = (key: string, value: string, replace = false) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace, preventScrollReset: true });
    setLimit(30);
  };

  const visible = useMemo(() => (me ? all.filter((r) => canSeeRow(me, r)) : []), [all, me]);
  const nameOf = useMemo(() => new Map(people.map((p) => [p.id, p.name])), [people]);

  // La autoría que se filtra y se busca es la de la columna: la del contenido (`ownerId`).
  const filtered = useMemo(() => {
    const nq = normalize(q);
    return visible.filter((r) => {
      if (tipo && r.type !== tipo) return false;
      if (area && r.area !== area) return false;
      if (autoria === 'mias' && r.ownerId !== me?.id) return false;
      if (autoria === 'sin' && !withoutAuthor(r, people)) return false;
      if (nq) {
        const hay = normalize([r.title, TYPE_META[r.type].label, (r.ownerId && nameOf.get(r.ownerId)) || 'sin autoria', r.area && r.area !== 'general' ? AREAS[r.area].name : r.area === 'general' ? 'toda la firma' : ''].join(' '));
        if (!nq.split(' ').every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [visible, q, tipo, area, autoria, nameOf, people, me?.id]);

  const statusOf = (r: ContentRow): EditorialStatus => (r.revisionOf ? 'borrador' : r.status);

  const counts = useMemo(() => {
    const c: Record<TabValue, number> = { todo: filtered.length, borrador: 0, publicado: 0, archivado: 0 };
    for (const r of filtered) c[statusOf(r)]++;
    return c;
  }, [filtered]);

  const shown = useMemo(() => {
    const list = tab === 'todo' ? filtered : filtered.filter((r) => statusOf(r) === tab);
    return orden === 'titulo' ? [...list].sort((a, b) => a.title.localeCompare(b.title, 'es')) : list;
  }, [filtered, tab, orden]);

  if (!me) return null;
  const role = me.effectiveRole;
  const isAdmin = can(role, 'contenido:editar-cualquiera');
  const recent = visible.filter((r) => r.draft && statusOf(r) === 'borrador' && r.draft.authorId === me.id).slice(0, 3);

  const onAction = (row: ContentRow, action: TransitionAction, opts: { reviewed?: boolean } = {}) => {
    const out = applyTransition(me, row, action, opts);
    if (!out.ok && out.errors) {
      toast.error('Antes de publicar, completa el contenido', MESSAGES.invalidFields(out.errors.length), { label: 'Abrir el editor', onClick: () => navigate(editHref(row)) });
      return;
    }
    announce(row, action, out);
  };

  const handlers: RowHandlers = {
    actor: me,
    onPreview: setPreview,
    onPublish: (row) => {
      setReviewed(false);
      setPublishing(row);
    },
    onAction,
    onRemove: setRemoving,
  };

  const filtersOn = !!(q || tipo || area || autoria);
  const tabLabel = TABS.find((t) => t.value === tab)?.label ?? 'Todo';
  const previewForm = preview ? rowForm(preview, campus) : null;
  const typeOptions = [{ value: '', label: 'Todos los tipos' }, ...CONTENT_TYPES.map((t) => ({ value: t, label: TYPE_META[t].plural }))];
  const areaOptions = [{ value: '', label: 'Todas las áreas' }, ...AREA_FILTERS];
  const authorOptions = [
    { value: '', label: 'Cualquier autoría' },
    { value: 'mias', label: 'Lo mío' },
    ...(isAdmin ? [{ value: 'sin', label: 'Sin autoría' }] : []),
  ];
  const publishType: ContentType | null = publishing?.type ?? null;

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Inicio', to: '/' }, { label: 'Gestión de contenidos' }]}
        eyebrow={isAdmin ? 'Gestión · administración' : 'Gestión · autoría'}
        title="Gestión de contenidos"
        lede={isAdmin ? 'Crea, publica y archiva lo que se comparte en el campus. Puedes editar cualquier contenido.' : 'Crea formaciones, novedades, documentos y eventos. Guárdalos como borrador y publícalos cuando estén listos.'}
        actions={
          <>
            {CONTENT_TYPES.some((t) => canCreateType(role, t)) && (
              <ButtonLink to="/gestion/nuevo" icon={<Plus />}>
                Crear contenido
              </ButtonLink>
            )}
            {can(role, 'personas:gestionar') && (
              <ButtonLink variant="ghost" to="/admin" icon={<ShieldCheck />}>
                Administración
              </ButtonLink>
            )}
          </>
        }
      />

      {__DEMO__ && (
        <div className={styles.sim}>
          <Notice icon={<FlaskConical size={18} />} title="Simulación">
            En la demostración pública, lo que hagas aquí solo se guarda en tu navegador; en la versión interna lo ejecuta el servidor con permisos. Cambia de perfil en tu avatar («Ver la demo como») para probar la autoría y la administración.
          </Notice>
        </div>
      )}

      <QuickCreate actor={me} />
      <Resume rows={recent} />

      <section className={styles.workspace} aria-labelledby="h-contenidos">
        <div className={styles.workHead}>
          <h2 id="h-contenidos" className="section-title">
            Todo el contenido
          </h2>
          <p className={styles.resultCount} aria-live="polite">
            {shown.length === 1 ? '1 contenido' : `${shown.length} contenidos`}
            {tab !== 'todo' ? ` · ${tabLabel.toLowerCase()}` : ''}
          </p>
        </div>

        <div className={styles.tabsWrap}>
          <Tabs<TabValue> label="Estado editorial" value={tab} onChange={(v) => setParam('estado', v === 'todo' ? '' : v)} panelId="panel-contenidos" options={TABS.map((t) => ({ ...t, count: counts[t.value] }))} />
        </div>

        <div className={styles.toolbar} role="search" aria-label="Buscar y filtrar contenidos">
          <div className={styles.search}>
            <label htmlFor="gestion-buscar" className="sr-only">
              Buscar por título, tipo o autoría
            </label>
            <Search size={18} aria-hidden="true" className={styles.searchIcon} />
            <input id="gestion-buscar" type="search" value={q} placeholder="Buscar por título, tipo o autoría" onChange={(e) => setParam('q', e.target.value, true)} className={styles.searchInput} autoComplete="off" />
            {q && (
              <button type="button" className={styles.clear} onClick={() => setParam('q', '')} aria-label="Borrar la búsqueda">
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className={styles.filters}>
            <SelectField label="Tipo" value={tipo} onChange={(e) => setParam('tipo', e.target.value)} options={typeOptions} />
            <SelectField label="Área" value={area} onChange={(e) => setParam('area', e.target.value)} options={areaOptions} />
            <SelectField label="Autoría" value={autoria} onChange={(e) => setParam('autoria', e.target.value)} options={authorOptions} />
            <SelectField
              label="Orden"
              value={orden}
              onChange={(e) => setParam('orden', e.target.value === 'titulo' ? 'titulo' : '')}
              options={[
                { value: 'recientes', label: 'Más recientes' },
                { value: 'titulo', label: 'Título (A–Z)' },
              ]}
            />
          </div>
          {filtersOn && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X />}
              className={styles.reset}
              onClick={() => {
                const next = new URLSearchParams(params);
                ['q', 'tipo', 'area', 'autoria'].forEach((k) => next.delete(k));
                setParams(next, { preventScrollReset: true });
              }}
            >
              Quitar filtros
            </Button>
          )}
        </div>

        <div id="panel-contenidos" role="tabpanel" aria-label={`Contenidos: ${tabLabel}`} className={styles.panel}>
          {shown.length === 0 ? (
            q ? (
              <EmptyState icon={<Search />} title={MESSAGES.emptySearch.title}>
                <p>{MESSAGES.emptySearch.body(q)}</p>
              </EmptyState>
            ) : filtersOn ? (
              <EmptyState icon={<Search />} title={MESSAGES.emptyFilter.title} action={<Button variant="secondary" onClick={() => setParams(new URLSearchParams(tab === 'todo' ? {} : { estado: tab }))}>Quitar filtros</Button>}>
                <p>{MESSAGES.emptyFilter.body}</p>
              </EmptyState>
            ) : (
              <EmptyState icon={<Inbox />} title={tab === 'todo' ? 'Todavía no hay contenidos' : `No hay contenidos en «${tabLabel}»`} action={tab === 'borrador' ? <ButtonLink to="/gestion/nuevo" icon={<Plus />}>Crear contenido</ButtonLink> : undefined}>
                <p>{tab === 'borrador' ? 'Lo que empieces se guarda solo mientras escribes y aparece aquí hasta que lo publiques.' : 'Prueba con otra pestaña.'}</p>
              </EmptyState>
            )
          ) : compact ? (
            <ContentCards rows={shown.slice(0, limit)} handlers={handlers} />
          ) : (
            <ContentTable rows={shown.slice(0, limit)} handlers={handlers} caption={`Contenidos: ${tabLabel} (${shown.length})`} />
          )}
          {shown.length > limit && (
            <div className={styles.moreRow}>
              <Button variant="secondary" onClick={() => setLimit((l) => l + 30)}>
                Mostrar más ({shown.length - limit} restantes)
              </Button>
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={!!preview}
        onClose={() => setPreview(null)}
        variant="sheet"
        size="lg"
        title={preview ? `Vista previa · ${TYPE_META[preview.type].label}` : 'Vista previa'}
        description={preview ? `${STATUS_LABEL_EDITORIAL[statusOf(preview)]} · así se verá en ${destinationOf(preview.type, preview.area)}` : undefined}
        footer={
          preview && (
            <>
              {preview.publicHref && preview.status === 'publicado' && !preview.revisionOf && (
                <ButtonLink variant="ghost" to={preview.publicHref} icon={<ExternalLink />}>
                  Ver publicado
                </ButtonLink>
              )}
              {canEditRow(me, preview) && (
                <ButtonLink variant="secondary" to={editHref(preview)} icon={<PencilLine />}>
                  Abrir en el editor
                </ButtonLink>
              )}
              <Button onClick={() => setPreview(null)}>Cerrar</Button>
            </>
          )
        }
      >
        {preview && previewForm ? (
          <div className={styles.sheetPaper}>
            <ContentPreview form={previewForm} meta={{ authorId: preview.ownerId, status: statusOf(preview), reviewerName: preview.draft ? readDraft(preview.draft)?.reviewerName : undefined }} />
          </div>
        ) : (
          preview && <p>{MESSAGES.missingDocument.body}</p>
        )}
      </Dialog>

      <Dialog
        open={!!publishing}
        onClose={() => setPublishing(null)}
        size="sm"
        title={publishing?.revisionOf ? '¿Publicar los cambios?' : '¿Publicar?'}
        description={publishType ? `«${publishing?.title ?? ''}» ${publishing?.revisionOf ? 'sustituirá a la versión publicada en' : 'aparecerá en'} ${destinationOf(publishType, publishing?.area)}. Durante unos segundos podrás deshacerlo.` : undefined}
        footer={
          <>
            <Button variant="ghost" data-autofocus onClick={() => setPublishing(null)}>
              Cancelar
            </Button>
            <Button
              icon={<BadgeCheck />}
              onClick={() => {
                if (!publishing) return;
                const row = publishing;
                setPublishing(null);
                onAction(row, 'publicar', { reviewed });
              }}
            >
              {publishing?.revisionOf ? 'Publicar cambios' : 'Publicar'}
            </Button>
          </>
        }
      >
        {publishType && ['formacion', 'noticia', 'documento', 'test'].includes(publishType) && (
          <Checkbox
            label="Lo ha revisado el área"
            hint={`Se mostrará «Revisado por ${me.name}». Si no lo marcas, ${publishing?.revisionOf ? 'la revisión vuelve a quedar pendiente' : 'queda pendiente de revisión'}.`}
            checked={reviewed}
            onChange={setReviewed}
          />
        )}
      </Dialog>

      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        title={removing?.revisionOf ? '¿Descartar los cambios?' : '¿Eliminar el borrador?'}
        description={removing?.revisionOf ? 'Se pierden los cambios sin publicar. La versión publicada no cambia.' : `«${removing?.title ?? ''}» nunca se ha publicado. Esta acción no se puede deshacer.`}
        footer={
          <>
            <Button variant="ghost" data-autofocus onClick={() => setRemoving(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              icon={<Trash />}
              onClick={() => {
                if (!removing) return;
                const row = removing;
                setRemoving(null);
                const res = removeWorkingDraft(me, row);
                if (res.ok) toast.success(row.revisionOf ? 'Cambios descartados' : 'Borrador eliminado', row.revisionOf ? 'La versión publicada sigue siendo la vigente.' : `Se ha eliminado «${row.title}».`);
                else toast.error('No se ha podido eliminar', res.reason);
              }}
            >
              {removing?.revisionOf ? 'Descartar' : 'Eliminar'}
            </Button>
          </>
        }
      />
    </div>
  );
}

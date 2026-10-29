import { AnimatePresence, motion } from 'motion/react';
import { Archive, BadgeCheck, CornerUpLeft, Ellipsis, ExternalLink, Eye, FlaskConical, Inbox, PencilLine, Plus, RotateCcw, Search, Send, ShieldCheck, Trash, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  AREAS,
  can,
  checkTransition,
  CREATABLE_TYPES,
  formatShortDate,
  madridDateKey,
  madridParts,
  normalize,
  relativeDay,
  STATUS_LABEL_EDITORIAL,
  type ContentType,
  type EditorialStatus,
} from '@flm/shared';
import { AreaTag, Avatar, Button, ButtonLink, Chip, Dialog, EditorialChip, EmptyState, Notice, PageHeader, Popover, SelectField, Tabs, toast } from '@/design';
import { useMe, usePeople } from '@/data/selectors';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { announce, applyTransition, removeWorkingDraft, type TransitionAction } from './actions';
import { ContentPreview } from './ContentPreview';
import { EditorialTrack, trackLabel } from './EditorialTrack';
import { loadExampleDrafts } from './examples';
import { validateForm } from './forms';
import { canEditRow, canSeeRow, CONTENT_TYPES, editHref, readDraft, rowForm, TYPE_META, useCampusForms, useContentRows, type Actor, type ContentRow } from './model';
import { ReturnDialog } from './ReturnDialog';
import { useMediaQuery } from './useMediaQuery';
import styles from './ManagePage.module.css';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(2, '0');
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

type TabValue = 'todo' | EditorialStatus;
const TABS: { value: TabValue; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'borrador', label: 'Borradores' },
  { value: 'en-revision', label: 'En revisión' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'archivado', label: 'Archivado' },
];
const isTab = (v: string | null): v is TabValue => !!v && TABS.some((t) => t.value === v);

/** «hoy, 23:41», «ayer, 10:02» o «22 oct» (con año si no es el actual). */
function whenLabel(row: ContentRow): string {
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

/** Tipo de contenido: rectángulo de radio pequeño con su icono (el texto va siempre al lado). */
export function TypeTile({ type, size = 32 }: { type: ContentType; size?: number }) {
  const Icon = TYPE_META[type].icon;
  return (
    <span className={styles.tile} style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

function AreaCell({ area }: { area: ContentRow['area'] }) {
  if (!area) return <span className={styles.none}>—<span className="sr-only">Sin área</span></span>;
  if (area === 'general') return <Chip size="sm">General</Chip>;
  return <AreaTag area={area} size="sm" />;
}

interface RowHandlers {
  actor: Actor;
  onPreview: (row: ContentRow) => void;
  onReturn: (row: ContentRow) => void;
  onAction: (row: ContentRow, action: TransitionAction) => void;
  onRemove: (row: ContentRow) => void;
}

function RowFlags({ row }: { row: ContentRow }) {
  const flags: ReactNode[] = [];
  if (row.revisionOf) flags.push(<span key="r">Revisión de un contenido publicado</span>);
  if (row.openRevision) flags.push(<span key="o">Revisión en curso</span>);
  if (row.returnComment && row.status === 'borrador') flags.push(<span key="d" className={styles.returned}>Devuelto con comentarios</span>);
  if (row.example) flags.push(<span key="e" className={styles.example}>Ejemplo</span>);
  if (!flags.length) return null;
  return <span className={styles.flags}>{flags}</span>;
}

/** Acciones por fila según permisos (checkTransition) y estado: una principal y el resto en «Más acciones». */
function RowActions({ row, actor, onPreview, onReturn, onAction, onRemove }: RowHandlers & { row: ContentRow }) {
  const role = actor.effectiveRole;
  const isOwner = row.authorId === actor.id;
  const ok = (a: TransitionAction) => checkTransition(role, a, row.status, isOwner).ok;
  const editable = canEditRow(actor, row) && (row.status === 'borrador' || row.status === 'publicado');
  const review = row.status === 'en-revision' && can(role, 'contenido:publicar');
  const data = row.draft ? readDraft(row.draft) : null;
  const removable = !!data && canEditRow(actor, row) && (!!row.revisionOf ? row.status !== 'en-revision' : row.status === 'borrador' && !data.publishedAt);

  const primary = review ? (
    <ButtonLink size="sm" variant="secondary" to={editHref(row)} icon={<Eye />}>
      Revisar
    </ButtonLink>
  ) : editable ? (
    <ButtonLink size="sm" variant="secondary" to={editHref(row)} icon={<PencilLine />}>
      Editar
    </ButtonLink>
  ) : (
    <Button size="sm" variant="secondary" icon={<Eye />} onClick={() => onPreview(row)}>
      Vista previa
    </Button>
  );

  const items: { key: string; label: string; icon: ReactNode; run: () => void; danger?: boolean; href?: string }[] = [];
  if (review || editable) items.push({ key: 'preview', label: 'Vista previa', icon: <Eye size={18} />, run: () => onPreview(row) });
  if (row.draft && ok('enviar') && !can(role, 'contenido:publicar')) items.push({ key: 'enviar', label: 'Enviar a revisión', icon: <Send size={18} />, run: () => onAction(row, 'enviar') });
  if (ok('publicar')) items.push({ key: 'publicar', label: row.revisionOf ? 'Publicar la revisión' : 'Publicar', icon: <BadgeCheck size={18} />, run: () => onAction(row, 'publicar') });
  if (ok('devolver')) items.push({ key: 'devolver', label: 'Devolver con comentario', icon: <CornerUpLeft size={18} />, run: () => onReturn(row) });
  if (ok('archivar') && !row.openRevision) items.push({ key: 'archivar', label: 'Archivar', icon: <Archive size={18} />, run: () => onAction(row, 'archivar') });
  if (ok('restaurar')) items.push({ key: 'restaurar', label: 'Restaurar', icon: <RotateCcw size={18} />, run: () => onAction(row, 'restaurar') });
  if (row.publicHref && row.status === 'publicado') items.push({ key: 'ver', label: 'Ver publicado', icon: <ExternalLink size={18} />, run: () => undefined, href: row.publicHref });
  if (removable) items.push({ key: 'quitar', label: row.revisionOf ? 'Descartar la revisión' : 'Eliminar el borrador', icon: <Trash size={18} />, run: () => onRemove(row), danger: true });

  return (
    <div className={styles.rowActions}>
      {primary}
      {items.length > 0 && (
        <Popover label={`Más acciones para «${row.title}»`} width={250} triggerClassName={styles.more} trigger={<Ellipsis size={20} aria-hidden="true" />}>
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

function Author({ id, compact }: { id: string; compact?: boolean }) {
  const people = usePeople();
  const p = people.find((x) => x.id === id);
  const name = p?.name ?? 'Persona desconocida';
  return (
    <span className={styles.author}>
      <Avatar name={name} photo={p?.photo ? base + p.photo : undefined} size={compact ? 24 : 28} decorative />
      <span className={styles.authorName}>{name}</span>
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
                  <StatusCell status={row.status} />
                </td>
                <td className={styles.colAuthor}>
                  <Author id={row.authorId} />
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
              <StatusCell status={row.status} />
            </div>
            <h3 className={styles.cardTitle}>{row.title}</h3>
            <RowFlags row={row} />
            <div className={styles.cardMeta}>
              <AreaCell area={row.area} />
              <Author id={row.authorId} compact />
              <span className={styles.when}>{whenLabel(row)}</span>
            </div>
            <RowActions row={row} {...handlers} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/** Cola destacada de administración: lo más antiguo primero; publicar hace fluir el puente hasta «Publicado». */
function ReviewQueue({ rows, handlers }: { rows: ContentRow[]; handlers: RowHandlers }) {
  const reduce = useReducedMotionPref();
  const [settling, setSettling] = useState<Record<string, EditorialStatus>>({});
  const publish = async (row: ContentRow) => {
    const data = row.draft ? readDraft(row.draft) : null;
    if (data && validateForm(data.form).length) {
      handlers.onAction(row, 'publicar');
      return;
    }
    setSettling((s) => ({ ...s, [row.key]: 'publicado' }));
    await wait(reduce ? 0 : 520);
    handlers.onAction(row, 'publicar');
    setSettling(({ [row.key]: _done, ...rest }) => rest);
  };
  return (
    <section className={styles.queue} aria-labelledby="h-cola">
      <div className={styles.queueHead}>
        <h2 id="h-cola" className={styles.queueTitle}>
          <Inbox size={20} aria-hidden="true" /> Pendiente de tu revisión
          <span className="sr-only">: </span>
          <span className={styles.queueCount}>{rows.length}</span>
        </h2>
        <p className={styles.queueSub}>{rows.length ? 'Lo más antiguo primero. Revisa, publica o devuelve con un comentario.' : 'Nada pendiente.'}</p>
      </div>
      {rows.length === 0 ? (
        <div className={styles.queueEmpty}>
          <p>Cuando una persona autora envíe un contenido a revisión, aparecerá aquí.</p>
          {__DEMO__ && (
            <Button
              size="sm"
              variant="secondary"
              icon={<FlaskConical />}
              onClick={() => {
                const n = loadExampleDrafts();
                if (n) toast.success('Borradores de ejemplo cargados', `${n} contenidos rotulados «Ejemplo», de personas ficticias, para probar la revisión.`);
                else toast.info('Los ejemplos ya están cargados', 'Búscalos en las pestañas «En revisión» y «Borradores».');
              }}
            >
              Cargar ejemplos para probar la revisión
            </Button>
          )}
        </div>
      ) : (
        <ul role="list" className={styles.queueList}>
          <AnimatePresence initial={false}>
            {rows.map((row) => {
              const shown = settling[row.key] ?? row.status;
              return (
                <motion.li
                  key={row.key}
                  layout
                  className={styles.queueCard}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, x: 18, transition: { duration: 0.22 } }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                >
                  <div className={styles.qTop}>
                    <TypeTile type={row.type} size={28} />
                    <span className={styles.typeLabel}>
                      {TYPE_META[row.type].label}
                      {row.revisionOf ? ' · revisión' : ''}
                    </span>
                    {row.example && <span className={styles.example}>Ejemplo</span>}
                  </div>
                  <h3 className={styles.qTitle}>
                    <Link to={editHref(row)}>{row.title}</Link>
                  </h3>
                  <div className={styles.qMeta}>
                    <Author id={row.authorId} compact />
                    <span className={styles.when}>Enviado {whenLabel(row)}</span>
                  </div>
                  <div className={styles.qTrack}>
                    <EditorialTrack status={shown} />
                    <span>{trackLabel(shown)}</span>
                  </div>
                  <div className={styles.qActions}>
                    <ButtonLink size="sm" variant="ghost" to={editHref(row)} icon={<Eye />}>
                      Revisar
                    </ButtonLink>
                    <Button size="sm" variant="ghost" icon={<CornerUpLeft />} onClick={() => handlers.onReturn(row)} disabled={!!settling[row.key]}>
                      Devolver
                    </Button>
                    <Button size="sm" icon={<BadgeCheck />} onClick={() => void publish(row)} disabled={!!settling[row.key]}>
                      Publicar
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}

/** Actividad propia de la autoría: devueltos con comentarios y envíos pendientes. */
function AuthorDesk({ rows }: { rows: ContentRow[] }) {
  if (!rows.length) return null;
  return (
    <section className={styles.queue} aria-labelledby="h-mesa">
      <div className={styles.queueHead}>
        <h2 id="h-mesa" className={styles.queueTitle}>
          <Inbox size={20} aria-hidden="true" /> Tus envíos
          <span className={styles.queueCount}>{rows.length}</span>
        </h2>
        <p className={styles.queueSub}>Lo devuelto con comentarios, primero.</p>
      </div>
      <ul role="list" className={styles.queueList}>
        {rows.map((row) => (
          <li key={row.key} className={styles.queueCard}>
            <div className={styles.qTop}>
              <TypeTile type={row.type} size={28} />
              <span className={styles.typeLabel}>{TYPE_META[row.type].label}</span>
              <EditorialChip status={row.status} size="sm" />
            </div>
            <h3 className={styles.qTitle}>
              <Link to={editHref(row)}>{row.title}</Link>
            </h3>
            {row.returnComment && row.status === 'borrador' ? <p className={styles.comment}>«{row.returnComment}»</p> : <p className={styles.qSub}>Pendiente de administración desde {whenLabel(row)}.</p>}
            {row.status === 'borrador' && (
              <div className={styles.qActions}>
                <ButtonLink size="sm" to={editHref(row)} icon={<PencilLine />}>
                  Corregir
                </ButtonLink>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewMenu({ role }: { role: Actor['effectiveRole'] }) {
  const types = CREATABLE_TYPES[role];
  if (!types.length) return null;
  return (
    <Popover
      label="Nuevo contenido"
      align="start"
      width={380}
      triggerClassName={styles.newTrigger}
      trigger={
        <>
          <Plus size={18} aria-hidden="true" /> Nuevo
        </>
      }
    >
      {(close) => (
        <div className={styles.newMenu}>
          <p className={styles.newTitle}>Elige una plantilla</p>
          <ul role="list" className={styles.newList}>
            {types.map((t, i) => (
              <motion.li key={t} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i, duration: 0.2, ease: [0.2, 0, 0, 1] }}>
                <Link to={`/gestion/nuevo/${t}`} onClick={close} className={styles.newItem}>
                  <TypeTile type={t} size={36} />
                  <span className={styles.newText}>
                    <strong>{TYPE_META[t].label}</strong>
                    <span>{TYPE_META[t].template}</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </Popover>
  );
}

/** Espacio de trabajo de Gestión: pestañas por estado, búsqueda, filtros, cola de revisión y acciones. */
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
  const [returning, setReturning] = useState<ContentRow | null>(null);
  const [removing, setRemoving] = useState<ContentRow | null>(null);

  const tab: TabValue = isTab(params.get('estado')) ? (params.get('estado') as TabValue) : 'todo';
  const q = params.get('q') ?? '';
  const tipo = params.get('tipo') ?? '';
  const area = params.get('area') ?? '';
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

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return visible.filter((r) => {
      if (tipo && r.type !== tipo) return false;
      if (area && r.area !== area) return false;
      if (nq) {
        const hay = normalize([r.title, TYPE_META[r.type].label, nameOf.get(r.authorId) ?? '', r.area && r.area !== 'general' ? AREAS[r.area].name : r.area ?? ''].join(' '));
        if (!nq.split(' ').every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [visible, q, tipo, area, nameOf]);

  const counts = useMemo(() => {
    const c: Record<TabValue, number> = { todo: filtered.length, borrador: 0, 'en-revision': 0, publicado: 0, archivado: 0 };
    for (const r of filtered) c[r.status]++;
    return c;
  }, [filtered]);

  const shown = useMemo(() => {
    const list = tab === 'todo' ? filtered : filtered.filter((r) => r.status === tab);
    return orden === 'titulo' ? [...list].sort((a, b) => a.title.localeCompare(b.title, 'es')) : list;
  }, [filtered, tab, orden]);

  if (!me) return null;
  const role = me.effectiveRole;
  const isAdmin = can(role, 'contenido:publicar');
  const queue = isAdmin ? visible.filter((r) => r.status === 'en-revision').sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)) : [];
  const desk = !isAdmin
    ? visible
        .filter((r) => r.authorId === me.id && r.draft && ((r.status === 'borrador' && r.returnComment) || r.status === 'en-revision'))
        .sort((a, b) => Number(!!b.returnComment) - Number(!!a.returnComment) || a.updatedAt.localeCompare(b.updatedAt))
    : [];

  const onAction = (row: ContentRow, action: TransitionAction) => {
    const out = applyTransition(me, row, action);
    if (!out.ok && out.errors) {
      toast.error(action === 'publicar' ? 'Antes de publicar, completa el contenido' : 'Antes de enviarlo, completa el contenido', MESSAGES.invalidFields(out.errors.length), { label: 'Abrir el editor', onClick: () => navigate(editHref(row)) });
      return;
    }
    announce(row, action, out);
  };

  const handlers: RowHandlers = {
    actor: me,
    onPreview: setPreview,
    onReturn: setReturning,
    onAction,
    onRemove: setRemoving,
  };

  const filtersOn = !!(q || tipo || area);
  const tabLabel = TABS.find((t) => t.value === tab)?.label ?? 'Todo';
  const previewForm = preview ? rowForm(preview, campus) : null;
  const typeOptions = [{ value: '', label: 'Todos los tipos' }, ...CONTENT_TYPES.map((t) => ({ value: t, label: TYPE_META[t].plural }))];
  const areaOptions = [{ value: '', label: 'Todas las áreas' }, ...Object.values(AREAS).map((a) => ({ value: a.id, label: a.name })), { value: 'general', label: 'General' }];

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Inicio', to: '/' }, { label: 'Gestión de contenidos' }]}
        eyebrow={isAdmin ? 'Gestión · administración' : 'Gestión · autoría'}
        title="Gestión de contenidos"
        lede={isAdmin ? 'Revisa, publica y archiva lo que se comparte en el campus.' : 'Prepara formaciones, novedades, documentos y eventos, y envíalos a revisión.'}
        actions={
          <>
            <NewMenu role={role} />
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
            En la demostración pública, lo que hagas aquí solo se guarda en tu navegador; en la versión interna lo ejecuta el servidor con permisos. Cambia de perfil en tu avatar («Ver la demo como») para recorrer el flujo de autoría y de administración.
          </Notice>
        </div>
      )}

      {isAdmin ? <ReviewQueue rows={queue} handlers={handlers} /> : <AuthorDesk rows={desk} />}

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
                ['q', 'tipo', 'area'].forEach((k) => next.delete(k));
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
              <EmptyState icon={<Inbox />} title={tab === 'todo' ? 'Todavía no hay contenidos' : `No hay contenidos en «${tabLabel}»`}>
                <p>{tab === 'borrador' ? 'Empieza uno nuevo con el botón «Nuevo»: se guarda solo mientras escribes.' : tab === 'en-revision' ? 'Lo que se envíe a revisión aparecerá aquí.' : 'Prueba con otra pestaña.'}</p>
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
        description={preview ? `${STATUS_LABEL_EDITORIAL[preview.status]} · así se verá en ${TYPE_META[preview.type].destination}` : undefined}
        footer={
          preview && (
            <>
              {preview.publicHref && preview.status === 'publicado' && (
                <ButtonLink variant="ghost" to={preview.publicHref} icon={<ExternalLink />}>
                  Ver publicado
                </ButtonLink>
              )}
              {(canEditRow(me, preview) || isAdmin) && (
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
            <ContentPreview form={previewForm} meta={{ authorId: preview.authorId, status: preview.status, reviewerName: preview.draft ? readDraft(preview.draft)?.reviewerName : undefined }} />
          </div>
        ) : (
          preview && <p>{MESSAGES.missingDocument.body}</p>
        )}
      </Dialog>

      <ReturnDialog
        open={!!returning}
        title={returning?.title ?? ''}
        onClose={() => setReturning(null)}
        onConfirm={(comment) => {
          if (!returning) return;
          const row = returning;
          setReturning(null);
          const out = applyTransition(me, row, 'devolver', { comment });
          announce(row, 'devolver', out);
        }}
      />

      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        size="sm"
        title={removing?.revisionOf ? '¿Descartar la revisión?' : '¿Eliminar el borrador?'}
        description={removing?.revisionOf ? 'Se pierden los cambios de la revisión. La versión publicada no cambia.' : `«${removing?.title ?? ''}» nunca se ha publicado. Esta acción no se puede deshacer.`}
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
                if (res.ok) toast.success(row.revisionOf ? 'Revisión descartada' : 'Borrador eliminado', row.revisionOf ? 'La versión publicada sigue siendo la vigente.' : `Se ha eliminado «${row.title}».`);
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

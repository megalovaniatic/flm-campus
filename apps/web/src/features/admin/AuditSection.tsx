import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { ChartColumn, Download, FileText, KeyRound, Search, Server, UserRoundX, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { seed } from '@flm/content';
import { formatShortDate, madridDateKey, madridParts, normalize, relativeDay, REMOVED_PERSON } from '@flm/shared';
import { Avatar, Button, Chip, EmptyState, Notice, SelectField, toast } from '@/design';
import { useMe, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { downloadText, toCsv } from '@/lib/download';
import { MESSAGES } from '@/lib/messages';
import { useContentRows } from '@/features/manage/model';
import { useMediaQuery } from '@/features/manage/useMediaQuery';
import { actionInfo, CATEGORY_LABEL, ENTITY_LABEL, exampleAudit, type AuditCategory, type AuditEntry } from './auditCatalog';
import styles from './Admin.module.css';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(2, '0');

const CATEGORY_ICON: Record<AuditCategory, LucideIcon> = {
  contenido: FileText,
  personas: Users,
  sesiones: KeyRound,
  informes: ChartColumn,
  sistema: Server,
};

/** Acciones cuya persona destino ya no está en el campus por definición. */
const REMOVES_PERSON = new Set(['persona.eliminar-perfil', 'persona.eliminar-datos']);

/** Claves del filtro «Persona» que agrupan a quien ya no tiene ficha (para no repetir el mismo rótulo). */
const GONE_KEY = '~eliminada';
const UNKNOWN_KEY = '~desconocida';

const PERIODS: { value: string; label: string; ms: number }[] = [
  { value: '', label: 'Todo', ms: 0 },
  { value: '1', label: 'Últimas 24 horas', ms: 86_400_000 },
  { value: '7', label: 'Últimos 7 días', ms: 7 * 86_400_000 },
  { value: '30', label: 'Últimos 30 días', ms: 30 * 86_400_000 },
];

function when(iso: string) {
  const d = new Date(iso);
  const p = madridParts(d);
  const rel = relativeDay(madridDateKey(d));
  const day = rel === 'hoy' || rel === 'ayer' ? rel : formatShortDate(madridDateKey(d));
  return { day, time: `${pad(p.hour)}:${pad(p.minute)}` };
}

/** Auditoría: registros de la demo y ejemplos rotulados, con filtros y exportación. */
export function AuditSection() {
  const me = useMe();
  const audit = useDemo((s) => s.audit);
  const removed = useDemo((s) => s.removedPeople);
  const overrides = useDemo((s) => s.peopleOverrides);
  const people = usePeople();
  const rows = useContentRows();
  const compact = useMediaQuery('(max-width: 979px)');
  const [cat, setCat] = useState('');
  const [actor, setActor] = useState('');
  const [origin, setOrigin] = useState('');
  const [period, setPeriod] = useState('');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(25);
  const examples = useMemo(exampleAudit, []);

  const personName = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const titleOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rows) {
      m.set(r.id, r.title);
      if (r.revisionOf && !m.has(r.revisionOf)) m.set(r.revisionOf, r.title);
    }
    for (const d of seed.documents) if (!m.has(d.id)) m.set(d.id, d.title);
    for (const e of seed.events) if (!m.has(e.id)) m.set(e.id, e.title);
    return m;
  }, [rows]);

  const entries = useMemo(() => {
    // Sin ficha en el campus: perfil eliminado (o anonimizado con la acción anterior) o desconocido.
    const gone = (id: string) => !!removed[id] || !!overrides[id]?.email?.endsWith('@anonimizada.invalid');
    const missing = (id: string) => (gone(id) ? REMOVED_PERSON : 'Persona desconocida');
    const all: AuditEntry[] = [...audit, ...examples].sort((a, b) => b.at.localeCompare(a.at));
    return all.map((e) => {
      const info = actionInfo(e.action);
      const actorP = personName.get(e.actorId);
      const actorName = e.actorId === 'sistema' ? 'Sistema' : (actorP?.name ?? missing(e.actorId));
      const actorKey = e.actorId === 'sistema' || actorP ? e.actorId : gone(e.actorId) ? GONE_KEY : UNKNOWN_KEY;
      const targetP = e.entity === 'persona' && e.entityId ? personName.get(e.entityId) : undefined;
      const target = !e.entityId ? '' : e.entity !== 'persona' ? (titleOf.get(e.entityId) ?? e.entityId) : (targetP?.name ?? (REMOVES_PERSON.has(e.action) ? REMOVED_PERSON : missing(e.entityId)));
      return { ...e, info, actorP, actorName, actorKey, target };
    });
  }, [audit, examples, personName, titleOf, removed, overrides]);

  const actors = useMemo(() => [...new Map(entries.map((e) => [e.actorKey, e.actorName])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'es')), [entries]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const ms = PERIODS.find((p) => p.value === period)?.ms ?? 0;
    const nq = normalize(q);
    return entries.filter((e) => {
      if (cat && e.info.category !== cat) return false;
      if (actor && e.actorKey !== actor) return false;
      if (origin === 'demo' && e.example) return false;
      if (origin === 'ejemplo' && !e.example) return false;
      if (ms && now - new Date(e.at).getTime() > ms) return false;
      if (nq && !nq.split(' ').every((t) => normalize(`${e.actorName} ${e.info.label} ${e.action} ${ENTITY_LABEL[e.entity] ?? e.entity} ${e.target} ${e.detail ?? ''}`).includes(t))) return false;
      return true;
    });
  }, [entries, cat, actor, origin, period, q]);

  if (!me) return null;
  const actorId = me.id;
  const shown = filtered.slice(0, limit);

  const exportCsv = () => {
    const today = madridDateKey();
    downloadText(
      `flm-campus-auditoria-${today}.csv`,
      toCsv([
        ['Fecha y hora (UTC)', 'Persona', 'Acción', 'Código', 'Elemento', 'Identificador', 'Detalle', 'Origen'],
        ...filtered.map((e) => [e.at, e.actorName, e.info.label, e.action, ENTITY_LABEL[e.entity] ?? e.entity, e.entityId ?? '', e.detail ?? '', e.example ? 'Ejemplo' : 'Esta demo']),
      ]),
      'text/csv;charset=utf-8',
    );
    useDemo.getState().log({ actorId, action: 'informe.exportar', entity: 'informe', detail: 'Auditoría' });
    toast.success('Auditoría exportada', `${filtered.length} registros en CSV. La exportación también queda registrada.`);
  };

  const filtersOn = !!(cat || actor || origin || period || q);

  return (
    <section className={styles.section} aria-labelledby="h-auditoria">
      <div className={styles.sectionHead}>
        <h2 id="h-auditoria" className="section-title">
          Registro de actividad
        </h2>
        <Button size="sm" variant="secondary" icon={<Download />} onClick={exportCsv} disabled={!filtered.length}>
          Exportar CSV
        </Button>
      </div>
      {audit.length === 0 && (
        <Notice title="Aún no hay actividad de esta demo">
          Lo que hagas en Gestión y en Administración (publicar, archivar, cambiar un rol…) aparecerá aquí al momento. Mientras tanto, ves ejemplos rotulados.
        </Notice>
      )}

      <div className={styles.toolbar} role="search" aria-label="Buscar y filtrar la auditoría">
        <div className={styles.search}>
          <label htmlFor="admin-auditoria-q" className="sr-only">
            Buscar en la auditoría
          </label>
          <Search size={18} aria-hidden="true" className={styles.searchIcon} />
          <input id="admin-auditoria-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por persona, acción o elemento" className={styles.searchInput} autoComplete="off" />
          {q && (
            <button type="button" className={styles.clear} aria-label="Borrar la búsqueda" onClick={() => setQ('')}>
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className={styles.filters4}>
          <SelectField label="Tipo de acción" value={cat} onChange={(e) => setCat(e.target.value)} options={[{ value: '', label: 'Todas' }, ...(Object.keys(CATEGORY_LABEL) as AuditCategory[]).map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))]} />
          <SelectField label="Persona" value={actor} onChange={(e) => setActor(e.target.value)} options={[{ value: '', label: 'Todas' }, ...actors.map(([id, name]) => ({ value: id, label: name }))]} />
          <SelectField label="Periodo" value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIODS.map((p) => ({ value: p.value, label: p.label }))} />
          <SelectField
            label="Origen"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            options={[
              { value: '', label: 'Todo' },
              { value: 'demo', label: 'Esta demo' },
              { value: 'ejemplo', label: 'Ejemplos' },
            ]}
          />
        </div>
      </div>
      <p className={styles.count} aria-live="polite">
        {filtered.length === 1 ? '1 registro' : `${filtered.length} registros`}
        {filtersOn ? ' con estos filtros' : ''}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search />} title={q ? MESSAGES.emptySearch.title : MESSAGES.emptyFilter.title}>
          <p>{q ? MESSAGES.emptySearch.body(q) : MESSAGES.emptyFilter.body}</p>
        </EmptyState>
      ) : compact ? (
        <ol role="list" className={styles.cards}>
          <AnimatePresence initial={false}>
            {shown.map((e) => {
              const Icon = CATEGORY_ICON[e.info.category];
              const w = when(e.at);
              return (
                <motion.li key={e.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.auditAction}>
                      <span className={styles.catIcon} aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      {e.info.label}
                    </span>
                    <span className={styles.auditWhen}>
                      <span className={styles.firstUp}>{w.day}</span>, {w.time}
                    </span>
                  </div>
                  <p className={styles.cardLine}>
                    <strong>{e.actorName}</strong>
                    {e.target ? ` · ${ENTITY_LABEL[e.entity] ?? e.entity}: ${e.target}` : ''}
                  </p>
                  {e.detail && <p className={styles.cellSub}>{e.detail}</p>}
                  {e.example && <span className={styles.exampleTag}>Ejemplo</span>}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="sr-only">Registro de auditoría ({filtered.length})</caption>
            <thead>
              <tr>
                <th scope="col">Cuándo</th>
                <th scope="col">Persona</th>
                <th scope="col">Acción</th>
                <th scope="col">Elemento</th>
                <th scope="col">Detalle</th>
                <th scope="col">Origen</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {shown.map((e) => {
                  const Icon = CATEGORY_ICON[e.info.category];
                  const w = when(e.at);
                  return (
                    <motion.tr key={e.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td className={styles.nowrap}>
                        <time dateTime={e.at}>
                          <span className={styles.cellMain}>{w.time}</span>
                          <span className={`${styles.cellSub} ${styles.firstUp}`}>{w.day}</span>
                        </time>
                      </td>
                      <td>
                        <span className={styles.person}>
                          {e.actorId === 'sistema' ? (
                            <span className={styles.catIcon} aria-hidden="true">
                              <Server size={16} />
                            </span>
                          ) : e.actorP ? (
                            <Avatar name={e.actorName} photo={e.actorP.photo ? base + e.actorP.photo : undefined} size={28} decorative />
                          ) : (
                            <span className={styles.catIcon} aria-hidden="true">
                              <UserRoundX size={16} />
                            </span>
                          )}
                          <span className={styles.personName}>{e.actorName}</span>
                        </span>
                      </td>
                      <td>
                        <span className={styles.auditAction}>
                          <span className={styles.catIcon} aria-hidden="true">
                            <Icon size={16} />
                          </span>
                          <span>
                            <span className={styles.cellMain}>{e.info.label}</span>
                            <code className={styles.code}>{e.action}</code>
                          </span>
                        </span>
                      </td>
                      <td>
                        {e.target ? (
                          <>
                            <span className={styles.cellSub}>{ENTITY_LABEL[e.entity] ?? e.entity}</span>
                            <span className={styles.cellMain}>{e.target}</span>
                          </>
                        ) : (
                          <span className={styles.cellSub}>{ENTITY_LABEL[e.entity] ?? e.entity}</span>
                        )}
                      </td>
                      <td className={styles.detail}>{e.detail ?? '—'}</td>
                      <td>{e.example ? <span className={styles.exampleTag}>Ejemplo</span> : <Chip size="sm">Esta demo</Chip>}</td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
      {filtered.length > limit && (
        <div className={styles.moreRow}>
          <Button variant="secondary" onClick={() => setLimit((l) => l + 25)}>
            Mostrar más ({filtered.length - limit} restantes)
          </Button>
        </div>
      )}
    </section>
  );
}

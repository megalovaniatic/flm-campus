import { AnimatePresence, motion } from 'motion/react';
import { CalendarRange, Check, ChevronDown, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import {
  addDays,
  addMonthsClamped,
  CALENDAR_KINDS,
  diffDays,
  entriesForMonth,
  formatWeekdayDate,
  monthName,
  relativeDay,
  weekdayMondayFirst,
  weekdayName,
  type CalendarKind,
  type CalendarSources,
} from '@flm/shared';
import { Button, ButtonLink, Dialog, EmptyState, IconButton, Kbd, Notice, PageHeader } from '@/design';
import { holidays, useEvents } from '@/data/selectors';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { countLabel, indexMonths, KIND_ORDER, shiftMonth } from './calendarView';
import { DayEntries } from './DayEntries';
import { capitalize } from './eventView';
import { useMediaQuery, useToday } from './hooks';
import { KindIcon } from './icons';
import { MonthGrid } from './MonthGrid';
import { WeekStrip } from './WeekStrip';
import styles from './Calendar.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const isDateKey = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const MONTHS = Array.from({ length: 12 }, (_, i) => capitalize(monthName(i + 1)));

/**
 * Calendario de FLM: encuentros de equipo y festivos de nuestras sedes (sin fechas personales).
 * Cuadrícula mensual en escritorio; tira semanal y lista en móvil.
 */
export default function CalendarPage() {
  usePageTitle('Calendario');
  const [params] = useSearchParams();
  const today = useToday();
  const events = useEvents();
  const reduce = useReducedMotionPref();
  const isMobile = useMediaQuery('(max-width: 719px)');
  const wide = useMediaQuery('(min-width: 1100px)');
  const titleId = useId();
  const filtersId = useId();
  const panelTitleId = useId();
  const listTitleId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);

  // Los comunicados no son encuentros: solo los eventos entran en el calendario.
  const meetings = useMemo(() => events.filter((e) => e.kind !== 'comunicado'), [events]);
  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);
  const sources = useMemo<CalendarSources>(() => ({ holidays, events: meetings }), [meetings]);

  const [initial] = useState(() => {
    const dia = params.get('dia');
    return dia && isDateKey(dia) ? dia : today;
  });
  const [selected, setSelected] = useState(initial);
  const [cursor, setCursor] = useState(() => ({ y: Number(initial.slice(0, 4)), m: Number(initial.slice(5, 7)) }));
  const [dir, setDir] = useState(0);
  const [kinds, setKinds] = useState<Set<CalendarKind>>(() => new Set(KIND_ORDER));
  const [sheetOpen, setSheetOpen] = useState(() => !!params.get('dia') && !window.matchMedia('(min-width: 1100px)').matches);

  const index = useMemo(() => indexMonths([shiftMonth(cursor.y, cursor.m, -1), cursor, shiftMonth(cursor.y, cursor.m, 1)], sources), [cursor, sources]);
  const entriesFor = useCallback((key: string) => (index.get(key) ?? []).filter((e) => kinds.has(e.kind)), [index, kinds]);

  const prefix = `${cursor.y}-${pad(cursor.m)}`;
  const monthDays = useMemo(() => [...index.keys()].filter((k) => k.startsWith(prefix)).sort(), [index, prefix]);
  const counts = useMemo(() => {
    const c: Record<CalendarKind, number> = { encuentro: 0, festivo: 0 };
    for (const k of monthDays) for (const e of index.get(k) ?? []) c[e.kind] += 1;
    return c;
  }, [monthDays, index]);
  const visibleDays = monthDays.map((k) => [k, entriesFor(k)] as const).filter(([, list]) => list.length > 0);
  const visibleCount = visibleDays.reduce((n, [, list]) => n + list.length, 0);
  const noFilters = kinds.size === 0;
  // En el mes en curso, la lista móvil empieza hoy; los días anteriores se despliegan a petición.
  const [showPast, setShowPast] = useState(false);
  const isCurrentMonth = today.startsWith(prefix);
  const pastDays = isCurrentMonth ? visibleDays.filter(([k]) => k < today) : [];
  const listDays = isCurrentMonth && !showPast ? visibleDays.filter(([k]) => k >= today) : visibleDays;

  const moveTo = (key: string, focus = false) => {
    setDir(key > selected ? 1 : key < selected ? -1 : 0);
    setSelected(key);
    setCursor((c) => {
      const y = Number(key.slice(0, 4));
      const m = Number(key.slice(5, 7));
      return c.y === y && c.m === m ? c : { y, m };
    });
    if (focus) pendingFocus.current = key;
  };

  const showMonth = (y: number, m: number) => {
    if (y === cursor.y && m === cursor.m) return;
    const p = `${y}-${pad(m)}`;
    let target = `${p}-01`;
    if (today.startsWith(p)) target = today;
    else {
      const first = entriesForMonth(y, m, sources).find((e) => kinds.has(e.kind));
      if (first) target = first.date;
    }
    setDir(y * 12 + m > cursor.y * 12 + cursor.m ? 1 : -1);
    setCursor({ y, m });
    setSelected(target);
  };

  const goMonth = (delta: number) => {
    const n = shiftMonth(cursor.y, cursor.m, delta);
    showMonth(n.y, n.m);
  };

  // El foco sigue al día elegido con el teclado (también al cambiar de mes).
  useEffect(() => {
    const key = pendingFocus.current;
    if (!key) return;
    const el = gridRef.current?.querySelector<HTMLElement>(`[data-day="${key}"]`);
    if (el) {
      el.focus();
      pendingFocus.current = null;
    }
  });

  useEffect(() => {
    if (wide) setSheetOpen(false);
  }, [wide]);

  const onGridKey = (e: KeyboardEvent<HTMLElement>, key: string) => {
    let next: string | null = null;
    switch (e.key) {
      case 'ArrowRight':
        next = addDays(key, 1);
        break;
      case 'ArrowLeft':
        next = addDays(key, -1);
        break;
      case 'ArrowDown':
        next = addDays(key, 7);
        break;
      case 'ArrowUp':
        next = addDays(key, -7);
        break;
      case 'Home':
        next = addDays(key, -weekdayMondayFirst(key));
        break;
      case 'End':
        next = addDays(key, 6 - weekdayMondayFirst(key));
        break;
      case 'PageUp':
        next = addMonthsClamped(key, e.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonthsClamped(key, e.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        activate(key);
        return;
      default:
        return;
    }
    e.preventDefault();
    moveTo(next, true);
  };

  const activate = (key: string) => {
    if (key !== selected) moveTo(key);
    if (!wide) setSheetOpen(true);
  };

  const toggleKind = (k: CalendarKind) =>
    setKinds((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const showAll = () => setKinds(new Set(KIND_ORDER));

  const todayY = Number(today.slice(0, 4));
  const years: number[] = [];
  for (let yy = Math.min(cursor.y, todayY - 2); yy <= Math.max(cursor.y, todayY + 2); yy++) years.push(yy);

  const selEntries = entriesFor(selected);
  const hidden = (index.get(selected) ?? []).length - selEntries.length;
  const selDiff = diffDays(today, selected);
  const selEyebrow = Math.abs(selDiff) < 7 ? capitalize(relativeDay(selected, today)) : 'Día seleccionado';
  const selTitle = `${capitalize(formatWeekdayDate(selected))}${selected.slice(0, 4) !== today.slice(0, 4) ? ` de ${selected.slice(0, 4)}` : ''}`;

  const dayBody = selEntries.length ? (
    <DayEntries entries={selEntries} eventsById={eventsById} />
  ) : (
    <div className={styles.none}>
      <p>{hidden > 0 ? `${hidden === 1 ? 'Hay una entrada oculta' : `Hay ${hidden} entradas ocultas`} por los filtros.` : 'No hay encuentros ni festivos este día.'}</p>
      {hidden > 0 && (
        <Button variant="soft" size="sm" onClick={showAll}>
          Mostrar todo
        </Button>
      )}
    </div>
  );

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Participar', to: '/participar' }, { label: 'Calendario' }]}
        eyebrow="Vida de empresa"
        title="Calendario"
        lede="Encuentros de equipo y festivos de nuestras sedes, mes a mes."
        actions={
          <ButtonLink to="/participar/agenda" variant="secondary" icon={<CalendarRange />}>
            Ver la agenda
          </ButtonLink>
        }
      />

      <div className={styles.controls}>
        <div className={styles.toolbar}>
          <h2 id={titleId} className={styles.monthTitle}>
            {MONTHS[cursor.m - 1]} <span className={styles.year}>de {cursor.y}</span>
          </h2>
          <div className={styles.nav}>
            <IconButton label="Mes anterior" icon={<ChevronLeft />} variant="soft" onClick={() => goMonth(-1)} className={styles.prev} />
            <div className={styles.selects}>
              <label className={styles.select}>
                <span className="sr-only">Mes</span>
                <select value={cursor.m} onChange={(e) => showMonth(cursor.y, Number(e.target.value))}>
                  {MONTHS.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </label>
              <label className={styles.select}>
                <span className="sr-only">Año</span>
                <select value={cursor.y} onChange={(e) => showMonth(Number(e.target.value), cursor.m)}>
                  {years.map((yy) => (
                    <option key={yy} value={yy}>
                      {yy}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </label>
            </div>
            <IconButton label="Mes siguiente" icon={<ChevronRight />} variant="soft" onClick={() => goMonth(1)} className={styles.next} />
            <Button variant="secondary" size="sm" onClick={() => moveTo(today)} className={styles.todayBtn}>
              Hoy
            </Button>
          </div>
        </div>

        <div className={styles.filters} role="group" aria-labelledby={filtersId}>
          <span id={filtersId} className={styles.filtersLabel}>
            <ListFilter size={16} aria-hidden="true" /> Mostrar
          </span>
          {KIND_ORDER.map((k) => {
            const on = kinds.has(k);
            // En móvil se ve la primera palabra; el nombre completo sigue en el nombre accesible.
            const [head = '', ...rest] = CALENDAR_KINDS[k].label.split(' ');
            return (
              <button key={k} type="button" className={styles.filter} data-kind={k} aria-pressed={on} onClick={() => toggleKind(k)}>
                <span className={styles.filterCheck} aria-hidden="true">
                  {on && <Check size={12} strokeWidth={3} />}
                </span>
                <KindIcon kind={k} size={16} className={styles.filterIcon} />
                <span className={styles.filterLabel}>
                  {head}
                  {rest.length > 0 && <span className={styles.filterRest}>{` ${rest.join(' ')}`}</span>}
                </span>
                <span className="sr-only">: </span>
                <span className={styles.filterCount}>
                  {counts[k]}
                  <span className="sr-only"> en {monthName(cursor.m)}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="sr-only" aria-live="polite">
          {`${MONTHS[cursor.m - 1]} de ${cursor.y}: ${countLabel(visibleCount)}.`}
        </p>
      </div>

      {noFilters && (
        <div className={styles.emptyFilter}>
          <Notice tone="warning" icon={<ListFilter size={18} />} title={MESSAGES.emptyFilter.title}>
            <p>{MESSAGES.emptyFilter.body}</p>
            <Button variant="ghost" size="sm" onClick={showAll} className={styles.noticeAction}>
              Mostrar todo
            </Button>
          </Notice>
        </div>
      )}

      {isMobile ? (
        <div className={styles.mobile}>
          <WeekStrip
            selected={selected}
            today={today}
            dir={dir}
            entriesFor={entriesFor}
            onWeek={(delta) => moveTo(addDays(selected, delta * 7))}
            onPick={(key) => {
              moveTo(key);
              setSheetOpen(true);
            }}
          />
          <section className={styles.monthList} aria-labelledby={listTitleId}>
            <h2 id={listTitleId} className={styles.listTitle}>
              Fechas de {monthName(cursor.m)}
            </h2>
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={prefix}
                initial={reduce ? false : { x: dir >= 0 ? 32 : -32, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { x: dir >= 0 ? -32 : 32, opacity: 0 }}
                transition={{ x: { type: 'spring', stiffness: 420, damping: 40 }, opacity: { duration: 0.18 } }}
              >
                {visibleDays.length === 0 ? (
                  noFilters ? null : (
                    <EmptyState icon={<CalendarRange />} title={kinds.size < KIND_ORDER.length ? MESSAGES.emptyFilter.title : `No hay fechas en ${monthName(cursor.m)}`}>
                      {kinds.size < KIND_ORDER.length ? MESSAGES.emptyFilter.body : 'Prueba con otro mes.'}
                    </EmptyState>
                  )
                ) : (
                  <>
                    {pastDays.length > 0 && (
                      <button type="button" className={styles.pastToggle} aria-expanded={showPast} onClick={() => setShowPast((v) => !v)}>
                        <ChevronDown size={16} aria-hidden="true" className={styles.pastChevron} />
                        {showPast ? 'Ocultar los días anteriores' : `Ver ${pastDays.length === 1 ? 'el día anterior' : `los ${pastDays.length} días anteriores`} con fechas`}
                      </button>
                    )}
                    {listDays.length === 0 && <p className={styles.listNone}>No quedan más fechas en {monthName(cursor.m)}.</p>}
                  <ol role="list" className={styles.listDays}>
                    {listDays.map(([key, list]) => (
                      <li key={key} className={styles.listDay} data-today={key === today} data-past={key < today}>
                        <h3 className={styles.listDayHead}>
                          <span className={styles.listDayNum} aria-hidden="true">
                            {Number(key.slice(8, 10))}
                          </span>
                          <span className={styles.listDayWd} aria-hidden="true">
                            {key === today ? 'hoy' : weekdayName(weekdayMondayFirst(key)).slice(0, 3)}
                          </span>
                          <span className="sr-only">
                            {capitalize(formatWeekdayDate(key))}
                            {key === today ? ', hoy' : ''}
                          </span>
                        </h3>
                        <DayEntries entries={list} eventsById={eventsById} />
                      </li>
                    ))}
                  </ol>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      ) : (
        <div className={styles.layout} data-wide={wide}>
          <div className={styles.gridCol}>
            <MonthGrid
              y={cursor.y}
              m={cursor.m}
              dir={dir}
              selected={selected}
              today={today}
              titleId={titleId}
              entriesFor={entriesFor}
              gridRef={gridRef}
              onActivate={activate}
              onKey={onGridKey}
            />
            <p id={`${titleId}-help`} className={styles.keys}>
              <span aria-hidden="true">
                <Kbd>←</Kbd> <Kbd>→</Kbd> <Kbd>↑</Kbd> <Kbd>↓</Kbd> días · <Kbd>Inicio</Kbd> <Kbd>Fin</Kbd> semana · <Kbd>Re Pág</Kbd> <Kbd>Av Pág</Kbd> mes
                {!wide && (
                  <>
                    {' '}
                    · <Kbd>Intro</Kbd> abrir el día
                  </>
                )}
              </span>
              <span className="sr-only">
                Usa las flechas para cambiar de día, Inicio y Fin para ir al principio o al final de la semana y Re Pág y Av Pág para cambiar de mes.
                {!wide ? ' Pulsa Intro para abrir el detalle del día.' : ''}
              </span>
            </p>
          </div>
          {wide && (
            <aside className={styles.panel} aria-labelledby={panelTitleId}>
              <p className="eyebrow">{selEyebrow}</p>
              <h2 id={panelTitleId} className={styles.panelTitle}>
                {selTitle}
              </h2>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={`${selected}-${[...kinds].join()}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.08 } }} transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}>
                  {dayBody}
                </motion.div>
              </AnimatePresence>
            </aside>
          )}
        </div>
      )}

      <Dialog open={sheetOpen && !wide} onClose={() => setSheetOpen(false)} variant="sheet" title={selTitle} description={countLabel(selEntries.length).replace(/^./, (c) => c.toUpperCase())}>
        {dayBody}
      </Dialog>
    </div>
  );
}

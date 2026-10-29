import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import type { KeyboardEvent, RefObject } from 'react';
import { formatWeekdayDate, monthGrid, weekdayMondayFirst, weekdayName, type CalendarEntry } from '@flm/shared';
import { useReducedMotionPref } from '@/lib/preferences';
import { entrySentence, shortTitle } from './calendarView';
import { capitalize } from './eventView';
import { KindIcon } from './icons';
import styles from './Calendar.module.css';

const WEEKDAYS = Array.from({ length: 7 }, (_, i) => weekdayName(i));

interface MonthGridProps {
  y: number;
  m: number;
  /** Dirección del último cambio de mes (−1 atrás, 1 adelante). */
  dir: number;
  selected: string;
  today: string;
  titleId: string;
  entriesFor: (key: string) => CalendarEntry[];
  highlightId?: string;
  gridRef: RefObject<HTMLDivElement | null>;
  onActivate: (key: string) => void;
  onKey: (e: KeyboardEvent<HTMLElement>, key: string) => void;
}

const slide = {
  enter: (dir: number) => ({ x: dir === 0 ? 0 : dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

/**
 * Cuadrícula mensual (lunes primero) con el patrón ARIA «grid»: un único día en el orden
 * de tabulación, flechas para moverse, Inicio/Fin por semana y RePág/AvPág por mes.
 * El círculo de selección viaja de un día a otro; el mes entra desde su lado.
 */
export function MonthGrid({ y, m, dir, selected, today, titleId, entriesFor, highlightId, gridRef, onActivate, onKey }: MonthGridProps) {
  const reduce = useReducedMotionPref();
  const weeks = monthGrid(y, m);
  const monthKey = `${y}-${m}`;
  return (
    <div ref={gridRef} role="grid" aria-labelledby={titleId} aria-describedby={`${titleId}-help`} className={styles.grid}>
      <div role="row" className={styles.weekdays}>
        {WEEKDAYS.map((w, i) => (
          <div role="columnheader" key={w} className={styles.weekday} data-weekend={i >= 5}>
            <span aria-hidden="true">{w.slice(0, 3)}</span>
            <span className="sr-only">{w}</span>
          </div>
        ))}
      </div>
      <div className={styles.weeksClip}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={monthKey}
            role="rowgroup"
            className={styles.weeks}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0 } : { x: { type: 'spring', stiffness: 420, damping: 40 }, opacity: { duration: 0.2 } }}
          >
            <LayoutGroup id={`sel-${monthKey}`}>
              {weeks.map((week, wi) => (
                <div role="row" key={wi} className={styles.week}>
                  {week.map((key, di) =>
                    key ? (
                      <DayCell
                        key={key}
                        dateKey={key}
                        entries={entriesFor(key)}
                        selected={key === selected}
                        isToday={key === today}
                        highlightId={highlightId}
                        onActivate={onActivate}
                        onKey={onKey}
                      />
                    ) : (
                      <div role="gridcell" key={`b-${di}`} className={styles.blank} data-weekend={di >= 5} />
                    ),
                  )}
                </div>
              ))}
            </LayoutGroup>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface DayCellProps {
  dateKey: string;
  entries: CalendarEntry[];
  selected: boolean;
  isToday: boolean;
  highlightId?: string;
  onActivate: (key: string) => void;
  onKey: (e: KeyboardEvent<HTMLElement>, key: string) => void;
}

function DayCell({ dateKey, entries, selected, isToday, highlightId, onActivate, onKey }: DayCellProps) {
  const day = Number(dateKey.slice(8, 10));
  const weekend = weekdayMondayFirst(dateKey) >= 5;
  const festivo = entries.some((e) => e.kind === 'festivo');
  const marked = !!highlightId && entries.some((e) => e.personId === highlightId);
  const visible = entries.slice(0, 3);
  const more = entries.length - visible.length;
  const label = `${capitalize(formatWeekdayDate(dateKey))}${isToday ? ', hoy' : ''}: ${entries.length ? entries.map(entrySentence).join('; ') : 'sin entradas'}${marked ? ' (fecha resaltada)' : ''}`;
  return (
    <div
      role="gridcell"
      data-day={dateKey}
      tabIndex={selected ? 0 : -1}
      aria-selected={selected}
      aria-current={isToday ? 'date' : undefined}
      aria-label={label}
      className={styles.day}
      data-weekend={weekend}
      data-festivo={festivo}
      data-marked={marked}
      onClick={() => onActivate(dateKey)}
      onKeyDown={(e) => onKey(e, dateKey)}
    >
      <span className={styles.dayHead} aria-hidden="true">
        <span className={styles.dayNum}>
          {selected && <motion.span layoutId="seleccion" className={styles.selDisc} transition={{ type: 'spring', stiffness: 520, damping: 38 }} />}
          <span className={styles.dayNumText}>{day}</span>
        </span>
        {isToday && <span className={styles.todayTag}>hoy</span>}
      </span>
      <span className={styles.pills} aria-hidden="true">
        {visible.map((e) => (
          <span key={e.id} className={styles.pill} data-kind={e.kind} data-highlight={!!highlightId && e.personId === highlightId}>
            <KindIcon kind={e.kind} size={12} />
            <span className={styles.pillText}>
              {e.kind === 'encuentro' && e.time ? `${e.time} ` : ''}
              {shortTitle(e)}
            </span>
          </span>
        ))}
        {more > 0 && <span className={styles.more}>+{more} más</span>}
      </span>
    </div>
  );
}

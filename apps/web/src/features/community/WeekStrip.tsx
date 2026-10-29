import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, formatWeekdayDate, monthShort, weekdayMondayFirst, weekdayName, type CalendarEntry, type CalendarKind } from '@flm/shared';
import { IconButton } from '@/design';
import { useReducedMotionPref } from '@/lib/preferences';
import { countLabel, entrySentence, KIND_ORDER } from './calendarView';
import { capitalize } from './eventView';
import styles from './Calendar.module.css';

interface WeekStripProps {
  selected: string;
  today: string;
  dir: number;
  entriesFor: (key: string) => CalendarEntry[];
  onPick: (key: string) => void;
  onWeek: (delta: number) => void;
}

const short = (key: string) => `${Number(key.slice(8, 10))} ${monthShort(Number(key.slice(5, 7)))}`;

/** Tira semanal para móvil: siete días legibles con puntos por tipo; al tocar uno se abre su panel. */
export function WeekStrip({ selected, today, dir, entriesFor, onPick, onWeek }: WeekStripProps) {
  const reduce = useReducedMotionPref();
  const start = addDays(selected, -weekdayMondayFirst(selected));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = days[6] ?? start;
  return (
    <div className={styles.strip}>
      <div className={styles.stripHead}>
        <IconButton label="Semana anterior" icon={<ChevronLeft />} variant="soft" onClick={() => onWeek(-1)} />
        <p className={styles.stripRange}>
          <span className="sr-only">Semana del </span>
          {short(start)} – {short(end)}
        </p>
        <IconButton label="Semana siguiente" icon={<ChevronRight />} variant="soft" onClick={() => onWeek(1)} />
      </div>
      <div className={styles.stripClip}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.ul
            key={start}
            role="list"
            className={styles.stripDays}
            custom={dir}
            initial={reduce ? false : { x: dir >= 0 ? 36 : -36, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { x: dir >= 0 ? -36 : 36, opacity: 0 }}
            transition={{ x: { type: 'spring', stiffness: 420, damping: 40 }, opacity: { duration: 0.18 } }}
          >
            <LayoutGroup id={`strip-${start}`}>
              {days.map((key) => {
                const list = entriesFor(key);
                const kinds = KIND_ORDER.filter((k: CalendarKind) => list.some((e) => e.kind === k));
                const isSel = key === selected;
                const isToday = key === today;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      className={styles.stripDay}
                      data-selected={isSel}
                      data-weekend={weekdayMondayFirst(key) >= 5}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={`${capitalize(formatWeekdayDate(key))}${isToday ? ', hoy' : ''}: ${list.length ? list.map(entrySentence).join('; ') : countLabel(0)}. Abre el detalle del día.`}
                      onClick={() => onPick(key)}
                    >
                      <span className={styles.stripWd} data-today={isToday} aria-hidden="true">
                        {isToday ? 'hoy' : weekdayName(weekdayMondayFirst(key)).slice(0, 3)}
                      </span>
                      <span className={styles.stripNum} aria-hidden="true">
                        {isSel && <motion.span layoutId="tira" className={styles.selDisc} transition={{ type: 'spring', stiffness: 520, damping: 38 }} />}
                        <span className={styles.dayNumText}>{Number(key.slice(8, 10))}</span>
                      </span>
                      <span className={styles.stripDots} aria-hidden="true">
                        {kinds.map((k) => (
                          <span key={k} className={styles.dot} data-kind={k} />
                        ))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </LayoutGroup>
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}

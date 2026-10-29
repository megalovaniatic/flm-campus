import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { diffDays, formatWeekdayDate, monthGrid, monthName, monthShort, relativeDay, weekdayName, type CalendarEntry, type CalendarSources } from '@flm/shared';
import { holidays, useEvents } from '@/data/selectors';
import { entrySentence, festivoLabel, indexMonths, KIND_ORDER, kindLabel, shiftMonth } from './calendarView';
import { capitalize } from './eventView';
import { KindIcon } from './icons';
import styles from './Hub.module.css';

const INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Mes en curso en miniatura: puntos por tipo, días enlazados con el calendario y próximas fechas. */
export function MiniMonth({ today, headingId }: { today: string; headingId: string }) {
  const events = useEvents();
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  const meetings = useMemo(() => events.filter((e) => e.kind !== 'comunicado'), [events]);
  const sources = useMemo<CalendarSources>(() => ({ holidays, events: meetings }), [meetings]);
  const index = useMemo(() => indexMonths([{ y, m }, shiftMonth(y, m, 1)], sources), [y, m, sources]);
  const weeks = monthGrid(y, m);
  const soon = useMemo(
    () =>
      [...index.entries()]
        .filter(([k]) => k >= today && diffDays(today, k) <= 14)
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([, list]) => list)
        .slice(0, 5),
    [index, today],
  );

  return (
    <div className={styles.monthCard}>
      <div className={styles.monthHead}>
        <h2 id={headingId} className={styles.monthTitle}>
          {capitalize(monthName(m))} <span>de {y}</span>
        </h2>
        <Link to="/participar/calendario" className="link-arrow">
          Abrir el calendario <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <table className={styles.mini}>
        <caption className="sr-only">
          Fechas de {monthName(m)} de {y}. Los días con fechas enlazan con el calendario.
        </caption>
        <thead>
          <tr>
            {INITIALS.map((d, i) => (
              <th scope="col" key={d}>
                <span aria-hidden="true">{d}</span>
                <span className="sr-only">{weekdayName(i)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((key, di) => (
                <td key={di} data-weekend={di >= 5}>
                  {key && <MiniDay dateKey={key} entries={index.get(key) ?? []} isToday={key === today} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul role="list" className={styles.legend} aria-label="Tipos de fecha">
        {KIND_ORDER.map((k) => (
          <li key={k} data-kind={k}>
            <KindIcon kind={k} size={14} />
            {kindLabel(k)}
          </li>
        ))}
      </ul>

      <h3 className={styles.soonHeading}>Próximas fechas</h3>
      {soon.length === 0 ? (
        <p className={styles.soonNone}>No hay encuentros ni festivos en las próximas dos semanas.</p>
      ) : (
        <ul role="list" className={styles.soon}>
          {soon.map((e) => (
            <SoonItem key={e.id} entry={e} today={today} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MiniDay({ dateKey, entries, isToday }: { dateKey: string; entries: CalendarEntry[]; isToday: boolean }) {
  const kinds = KIND_ORDER.filter((k) => entries.some((e) => e.kind === k));
  const content = (
    <>
      <span className={styles.miniNum}>{Number(dateKey.slice(8, 10))}</span>
      <span className={styles.miniDots} aria-hidden="true">
        {kinds.map((k) => (
          <span key={k} className={styles.miniDot} data-kind={k} />
        ))}
      </span>
    </>
  );
  if (entries.length === 0) {
    return (
      <span className={styles.miniDay} data-today={isToday} aria-current={isToday ? 'date' : undefined}>
        {content}
        {isToday && <span className="sr-only"> (hoy)</span>}
      </span>
    );
  }
  return (
    <Link
      to={`/participar/calendario?dia=${dateKey}`}
      className={styles.miniDay}
      data-today={isToday}
      data-has={true}
      aria-current={isToday ? 'date' : undefined}
      aria-label={`${capitalize(formatWeekdayDate(dateKey))}${isToday ? ', hoy' : ''}: ${entries.map(entrySentence).join('; ')}`}
    >
      {content}
    </Link>
  );
}

function SoonItem({ entry: e, today }: { entry: CalendarEntry; today: string }) {
  const when = relativeDay(e.date, today);
  let extra = '';
  if (e.kind === 'encuentro' && e.time) extra = ` · ${e.time}`;
  if (e.kind === 'festivo' && e.detail) extra = ` · ${e.detail}`;
  return (
    <li className={styles.soonItem} data-kind={e.kind}>
      <span className={styles.soonDisc} aria-hidden="true">
        <KindIcon kind={e.kind} size={16} />
      </span>
      <span className={styles.soonText}>
        <span className={styles.soonTitle}>{e.kind === 'festivo' ? festivoLabel(e) : e.title}</span>
        <span className={styles.soonMeta}>
          <KindIcon kind={e.kind} size={13} className={styles.soonIcon} />
          {e.kind === 'festivo' ? 'Festivo' : kindLabel(e.kind)}
          {extra}
        </span>
      </span>
      <span className={styles.soonWhen}>
        <span className={styles.soonRel}>{capitalize(when)}</span>
        {Math.abs(diffDays(today, e.date)) < 7 && (
          <span className={styles.soonDate}>
            {Number(e.date.slice(8, 10))} {monthShort(Number(e.date.slice(5, 7)))}
          </span>
        )}
      </span>
    </li>
  );
}

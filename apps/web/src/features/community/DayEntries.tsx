import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { CalendarEntry, CampusEvent } from '@flm/shared';
import { festivoLabel, kindLabel } from './calendarView';
import { sessionHours } from './eventView';
import { KindIcon } from './icons';
import styles from './Calendar.module.css';

interface DayEntriesProps {
  entries: CalendarEntry[];
  eventsById: Map<string, CampusEvent>;
}

/** Entradas de un día: icono y nombre del tipo, título, detalle y, en los encuentros, enlace a la agenda. */
export function DayEntries({ entries, eventsById }: DayEntriesProps) {
  return (
    <ul role="list" className={styles.entries}>
      {entries.map((e) => {
        const ev = e.eventId ? eventsById.get(e.eventId) : undefined;
        const title = e.kind === 'festivo' ? festivoLabel(e) : e.title;
        let detail: string | undefined = e.detail;
        if (e.kind === 'encuentro') {
          // Horario, sesión y lugar de ese día (sin repetir el resumen del evento).
          const session = ev?.sessions.find((s) => s.start.slice(0, 10) === e.date);
          const label = e.detail && e.detail !== e.title && e.detail !== ev?.summary ? e.detail : undefined;
          detail = [session ? sessionHours(session) : e.time, label, session?.location].filter(Boolean).join(' · ') || undefined;
        }
        return (
          <li key={e.id} className={styles.entry} data-kind={e.kind}>
            <span className={styles.kindDisc} aria-hidden="true">
              <KindIcon kind={e.kind} size={18} />
            </span>
            <span className={styles.entryText}>
              <span className={styles.entryKind}>
                <KindIcon kind={e.kind} size={14} className={styles.kindIcon} />
                {e.kind === 'festivo' ? 'Festivo' : kindLabel(e.kind)}
              </span>
              <span className={styles.entryTitle}>{title}</span>
              {detail && <span className={styles.entryDetail}>{detail}</span>}
              {ev && (
                <Link to={`/participar/agenda/${ev.slug}`} className={styles.entryLink}>
                  Ver en la agenda
                  <span className="sr-only">: {ev.title}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import type { CalendarEntry, CampusEvent, Person } from '@flm/shared';
import { Avatar } from '@/design';
import { festivoLabel, kindLabel } from './calendarView';
import { sessionHours } from './eventView';
import { KindIcon } from './icons';
import styles from './Calendar.module.css';

const base = import.meta.env.BASE_URL;

interface DayEntriesProps {
  entries: CalendarEntry[];
  people: Person[];
  eventsById: Map<string, CampusEvent>;
  highlightId?: string;
}

/** Entradas de un día: persona (iniciales o foto aportada) o icono del tipo, con el tipo siempre escrito. */
export function DayEntries({ entries, people, eventsById, highlightId }: DayEntriesProps) {
  return (
    <ul role="list" className={styles.entries}>
      {entries.map((e) => {
        const person = e.personId ? people.find((p) => p.id === e.personId) : undefined;
        const ev = e.eventId ? eventsById.get(e.eventId) : undefined;
        const highlighted = !!highlightId && e.personId === highlightId;
        const title = e.kind === 'festivo' ? festivoLabel(e) : e.title;
        let detail: string | undefined = e.detail;
        if (e.kind === 'encuentro') {
          // Horario, sesión y lugar de ese día (sin repetir el resumen del evento).
          const session = ev?.sessions.find((s) => s.start.slice(0, 10) === e.date);
          const label = e.detail && e.detail !== e.title && e.detail !== ev?.summary ? e.detail : undefined;
          detail = [session ? sessionHours(session) : e.time, label, session?.location].filter(Boolean).join(' · ') || undefined;
        }
        return (
          <li key={e.id} className={styles.entry} data-kind={e.kind} data-highlight={highlighted || undefined}>
            {person ? (
              <Avatar name={person.name} photo={person.photo ? base + person.photo : undefined} size={40} decorative />
            ) : (
              <span className={styles.kindDisc} aria-hidden="true">
                <KindIcon kind={e.kind} size={18} />
              </span>
            )}
            <span className={styles.entryText}>
              <span className={styles.entryKind}>
                <KindIcon kind={e.kind} size={14} className={styles.kindIcon} />
                {e.kind === 'festivo' ? 'Festivo' : kindLabel(e.kind)}
                {highlighted && (
                  <>
                    <span className="sr-only">, </span>
                    <span className={styles.entryFlag}>Resaltado</span>
                  </>
                )}
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

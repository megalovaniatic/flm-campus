import type { CampusEvent } from '@flm/shared';
import { RichParagraphs } from '@/lib/rich';
import { DateMark } from './DateMark';
import { EventLinks, EventMaterials, EventPhoto } from './EventParts';
import { capitalize, eventKicker, eventTiming, type EventGroup } from './eventView';
import { EventIcon } from './icons';
import styles from './Agenda.module.css';

/** Histórico compacto, agrupado por meses: resumen, fotografía real y material. */
export function HistoryList({ groups, now, today }: { groups: EventGroup[]; now: Date; today: string }) {
  return (
    <div className={styles.history}>
      {groups.map((g) => (
        <section key={g.key} className={styles.group} aria-labelledby={`hist-${g.key}`}>
          <div className={styles.groupHead}>
            <h2 id={`hist-${g.key}`} className={styles.groupTitle}>
              {g.label}
            </h2>
            <p className={styles.groupCount}>{g.items.length === 1 ? '1 entrada' : `${g.items.length} entradas`}</p>
          </div>
          <ol role="list" className={styles.hList}>
            {g.items.map((ev) => (
              <HistoryEntry key={ev.id} ev={ev} now={now} today={today} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function HistoryEntry({ ev, now, today }: { ev: CampusEvent; now: Date; today: string }) {
  const t = eventTiming(ev, now, today);
  const first = t.sessions[0];
  const links = (ev.links ?? []).filter((l) => !l.example);
  return (
    <li id={`evento-${ev.slug}`} className={styles.hItem}>
      <article className={styles.hEntry} data-media={!!ev.image} aria-labelledby={`t-${ev.id}`}>
        <div className={styles.hDate}>
          <DateMark size="sm" tone="muted" dateKey={first?.start.slice(0, 10)} />
        </div>
        <div className={styles.hBody}>
          <p className={styles.kicker}>
            <EventIcon icon={ev.icon} size={16} className={styles.kickerIcon} />
            <span>{eventKicker(ev)}</span>
          </p>
          <h3 id={`t-${ev.id}`} className={styles.hTitle} tabIndex={-1} data-focus-target="">
            {ev.title}
          </h3>
          <p className={styles.hWhen}>
            {capitalize(t.when)}
            {t.places.length > 0 ? ` · ${t.places.join(' · ')}` : ''}
          </p>
          {ev.recap ? (
            <div className={styles.recap}>
              <p className={styles.recapLabel}>Resumen</p>
              <div className="prose">
                <RichParagraphs text={ev.recap} />
              </div>
            </div>
          ) : (
            <p className={styles.summary}>{ev.summary}</p>
          )}
          {ev.materials && ev.materials.length > 0 && (
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>Material del evento</h4>
              <EventMaterials materials={ev.materials} />
            </div>
          )}
          {links.length > 0 && (
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>Enlaces</h4>
              <EventLinks links={links} />
            </div>
          )}
        </div>
        {ev.image && <EventPhoto image={ev.image} className={styles.hPhoto} frameClassName={styles.hPhotoFrame} sizes="(min-width: 900px) 17rem, 92vw" position="50% 46%" />}
      </article>
    </li>
  );
}

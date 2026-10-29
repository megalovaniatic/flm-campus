import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, CalendarDays, ChevronDown, Link2, MapPin, Megaphone, Users } from 'lucide-react';
import { useId, useMemo } from 'react';
import { monthShort, weekdayMondayFirst, weekdayName, type CampusEvent, type EventSession } from '@flm/shared';
import { ButtonLink, Chip, PhaseChip } from '@/design';
import { useReducedMotionPref } from '@/lib/preferences';
import { RichParagraphs } from '@/lib/rich';
import { DateMark } from './DateMark';
import { AddToCalendarButton, CopyButton, EventLinks, EventMaterials, EventPhoto } from './EventParts';
import { capitalize, eventKicker, eventTiming, eventUrl, sessionHours, sessionState, type EventTiming } from './eventView';
import { EventIcon } from './icons';
import { SessionChain } from './SessionChain';
import styles from './Agenda.module.css';

interface AgendaEntryProps {
  ev: CampusEvent;
  now: Date;
  today: string;
  expanded: boolean;
  /** Lo siguiente de la agenda: foco claro, fecha con el anillo del tramo y la única acción principal. */
  featured?: boolean;
  onToggle: () => void;
}

/**
 * Entrada de «Actuales y próximos»: fecha grande en su círculo, texto editorial y detalle
 * desplegable en el sitio (la altura se anima; el resto de la agenda se desplaza con ella).
 */
export function AgendaEntry({ ev, now, today, expanded, featured = false, onToggle }: AgendaEntryProps) {
  const reduce = useReducedMotionPref();
  const t = eventTiming(ev, now, today);
  const refYear = Number(today.slice(0, 4));
  const titleId = useId();
  const detailId = useId();
  const canIcs = t.sessions.length > 0 && t.phase !== 'historico';
  const external = ev.links?.find((l) => !l.example);

  // Acción adecuada a cada entrada: calendario para los eventos con fecha, enlace oficial para los comunicados.
  let action = null;
  if (ev.kind === 'evento' && canIcs) action = <AddToCalendarButton ev={ev} sessions={t.sessions.length} size="sm" variant={featured ? 'primary' : 'secondary'} />;
  else if (external)
    action = (
      <ButtonLink to={external.url} target="_blank" rel="noreferrer" variant="secondary" size="sm" iconRight={<ArrowUpRight />}>
        {external.label}
        <span className="sr-only"> (se abre en una pestaña nueva)</span>
      </ButtonLink>
    );

  return (
    <li id={`evento-${ev.slug}`} className={styles.item} data-expanded={expanded} data-featured={featured || undefined}>
      <article className={styles.entry} data-expanded={expanded} data-featured={featured || undefined} aria-labelledby={titleId}>
        <div className={styles.head} data-media={!!ev.image}>
          <div className={styles.dateCol}>
            <DateMark dateKey={t.anchor?.key} caption={t.anchor?.caption} tone={t.phase === 'en-curso' ? 'current' : featured ? 'next' : 'default'} />
          </div>
          <div className={styles.body}>
            <p className={styles.kicker}>
              <EventIcon icon={ev.icon} size={16} className={styles.kickerIcon} />
              <span>
                {featured && 'Lo siguiente · '}
                {eventKicker(ev)}
              </span>
            </p>
            <h3 id={titleId} className={styles.title} tabIndex={-1} data-focus-target="">
              {ev.title}
            </h3>
            <p className={styles.when}>{t.when}</p>
            {t.nextLine && <p className={styles.nextLine}>{t.nextLine}</p>}
            <p className={styles.summary}>{ev.summary}</p>
          </div>
          {t.sessions.length > 1 && (
            <div className={styles.chain}>
              <SessionChain sessions={t.sessions} next={t.next} now={now} refYear={refYear} />
            </div>
          )}
          {ev.image && <EventPhoto image={ev.image} className={styles.media} frameClassName={styles.mediaFrame} sizes="(min-width: 900px) 15rem, 92vw" />}
          <div className={styles.foot}>
            <span className={styles.chips}>
              <PhaseChip phase={t.phase} pending={t.pending} size="sm" />
              {ev.kind === 'comunicado' && (
                <Chip size="sm" icon={<Megaphone size={13} />}>
                  Comunicado
                </Chip>
              )}
            </span>
            <span className={styles.actions}>
              {/* Con el detalle abierto, la acción vive en el detalle: no se duplica */}
              <AnimatePresence initial={false} mode="popLayout">
                {action && !expanded && (
                  <motion.span key="action" className={styles.raise} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.16 }}>
                    {action}
                  </motion.span>
                )}
              </AnimatePresence>
              <button type="button" className={styles.toggle} aria-expanded={expanded} aria-controls={detailId} onClick={onToggle}>
                <span>{expanded ? 'Ocultar detalle' : 'Ver detalle'}</span>
                <span className="sr-only">: {ev.title}</span>
                <ChevronDown size={18} aria-hidden="true" className={styles.chevron} />
              </button>
            </span>
          </div>
        </div>
        <div id={detailId} className={styles.detailSlot}>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="detail"
                className={styles.detailWrap}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { height: { duration: 0.36, ease: [0.2, 0, 0, 1] }, opacity: { duration: 0.2, ease: 'linear' } }}
              >
                <motion.div initial={reduce ? false : { y: 10 }} animate={{ y: 0 }} exit={{ y: 6 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                  <EventDetail ev={ev} t={t} now={now} canIcs={canIcs} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </article>
    </li>
  );
}

const weekdayShort = (key: string) => weekdayName(weekdayMondayFirst(key)).slice(0, 3);

function SessionList({ sessions, next, now, places }: { sessions: EventSession[]; next?: EventSession; now: Date; places: string[] }) {
  // El horario más habitual; el que se sale de él se destaca.
  const usual = useMemo(() => {
    const count = new Map<string, number>();
    for (const s of sessions) {
      const h = sessionHours(s) ?? '';
      count.set(h, (count.get(h) ?? 0) + 1);
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [sessions]);
  return (
    <ol role="list" className={styles.sessions}>
      {sessions.map((s, i) => {
        const key = s.start.slice(0, 10);
        const state = sessionState(s, next, now);
        const hours = sessionHours(s);
        return (
          <li key={`${s.start}-${i}`} className={styles.session} data-state={state}>
            <span className={styles.sDate}>
              {weekdayShort(key)} {Number(key.slice(8, 10))} {monthShort(Number(key.slice(5, 7)))}
            </span>
            <span className={styles.sLabel}>
              {s.label ?? `Sesión ${i + 1}`}
              {places.length > 1 && s.location ? <span className={styles.sPlace}> · {s.location}</span> : null}
              {state !== 'future' && (
                <>
                  <span className="sr-only">, </span>
                  <span className={styles.sState}>{state === 'past' ? 'Celebrada' : 'Próxima'}</span>
                </>
              )}
            </span>
            <span className={styles.sHours} data-different={!!hours && hours !== usual}>
              {hours ?? 'Todo el día'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function EventDetail({ ev, t, now, canIcs }: { ev: CampusEvent; t: EventTiming; now: Date; canIcs: boolean }) {
  const hasLinks = !!ev.links && ev.links.length > 0;
  const hasMaterials = !!ev.materials && ev.materials.length > 0;
  // Sin cuerpo, sesiones, enlaces ni materiales, el detalle se queda en los datos prácticos (sin repetir el resumen).
  const hasMain = !!ev.body || t.sessions.length > 1 || hasLinks || hasMaterials;
  return (
    <div className={styles.detail} data-compact={!hasMain}>
      {hasMain && (
        <div className={styles.detailMain}>
          {ev.body && (
            <div className={`prose ${styles.prose}`}>
              <RichParagraphs text={ev.body} />
            </div>
          )}
          {t.sessions.length > 1 && (
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>Sesiones</h4>
              <SessionList sessions={t.sessions} next={t.next} now={now} places={t.places} />
            </div>
          )}
          {hasLinks && (
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>Enlaces</h4>
              <EventLinks links={ev.links ?? []} />
            </div>
          )}
          {hasMaterials && (
            <div className={styles.block}>
              <h4 className={styles.blockTitle}>Materiales</h4>
              <EventMaterials materials={ev.materials ?? []} />
            </div>
          )}
        </div>
      )}
      <div className={styles.detailSide}>
        <h4 className="sr-only">Datos prácticos</h4>
        <dl className={styles.facts}>
          <div>
            <dt>
              <CalendarDays size={15} aria-hidden="true" /> Cuándo
            </dt>
            <dd>
              {capitalize(t.when)}
              {t.nextLine && <span className={styles.factSub}>{t.nextLine}</span>}
            </dd>
          </div>
          {t.places.length > 0 && (
            <div>
              <dt>
                <MapPin size={15} aria-hidden="true" /> Lugar
              </dt>
              <dd>{t.places.join(' · ')}</dd>
            </div>
          )}
          {ev.department && (
            <div>
              <dt>
                <Users size={15} aria-hidden="true" /> Área o equipo
              </dt>
              <dd>{ev.department}</dd>
            </div>
          )}
        </dl>
        <div className={styles.sideActions}>
          {canIcs ? (
            <>
              <AddToCalendarButton ev={ev} sessions={t.sessions.length} variant="primary" />
              {t.sessions.length > 1 && <p className={styles.fine}>Incluye las {t.sessions.length} sesiones, en hora de Madrid.</p>}
            </>
          ) : t.pending ? (
            <p className={styles.fine}>Cuando se confirme la fecha, podrás añadirlo a tu calendario desde aquí.</p>
          ) : null}
          <CopyButton text={eventUrl(ev.slug)} label="Copiar enlace" successLabel="Enlace copiado" icon={<Link2 size={18} />} />
        </div>
      </div>
    </div>
  );
}

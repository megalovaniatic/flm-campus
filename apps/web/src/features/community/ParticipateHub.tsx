import { ArrowRight, Lightbulb, MessageSquareText, Video, Workflow } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router';
import type { CampusEvent } from '@flm/shared';
import { ButtonLink, LinkedInGlyph, PageHeader, PhaseChip, PhotoCapsule } from '@/design';
import { useEvents } from '@/data/selectors';
import { usePageTitle } from '@/lib/preferences';
import { Rich } from '@/lib/rich';
import { DateMark } from './DateMark';
import { AddToCalendarButton, EventPhoto } from './EventParts';
import { CATEGORY_LABEL, capitalize, eventKicker, eventTiming, nextFeaturedEvent, partitionEvents } from './eventView';
import { useNow, useToday } from './hooks';
import { EventIcon } from './icons';
import { MiniMonth } from './MiniMonth';
import { SessionChain } from './SessionChain';
import styles from './Hub.module.css';

interface Way {
  id: string;
  icon: ReactNode;
  title: string;
  text: string;
}

/** La primera forma de participar; también es la invitación del protagonista cuando no hay evento próximo. */
const TOPIC: Way = { id: 'tema', icon: <Lightbulb size={20} strokeWidth={1.75} />, title: 'Propón un tema de formación', text: 'Lo que te preguntan los clientes puede ser la próxima formación del campus.' };

const WAYS: Way[] = [
  TOPIC,
  { id: 'mejora', icon: <Workflow size={20} strokeWidth={1.75} />, title: 'Propón una mejora de proceso', text: 'Ideas para trabajar mejor entre áreas y sedes.' },
  { id: 'videos', icon: <Video size={20} strokeWidth={1.75} />, title: 'Participa en los vídeos de FLM', text: '«¿Legal o ilegal?», «1 minuto legal» y otros formatos para explicar el derecho con claridad.' },
  { id: 'linkedin', icon: <LinkedInGlyph size={18} />, title: 'Apoya a FLM en LinkedIn', text: 'Interactúa y comparte de forma auténtica, con tu criterio profesional.' },
  { id: 'resenas', icon: <MessageSquareText size={20} strokeWidth={1.75} />, title: 'Concurso de reseñas', text: 'Solo reseñas voluntarias y reales de clientes, sin incentivos.' },
];

/** Las dos primeras frases de un texto enriquecido (para avances). */
function lead(text: string): string {
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.slice(0, 2).join(' ');
}

/**
 * Protagonista de Participar: lo siguiente de la agenda sobre «Superponer» (los círculos de la
 * paleta de redes, recreados). Una sola acción: añadirlo al calendario. Sin evento próximo,
 * el mismo panel invita a proponer un tema de formación.
 */
function NextUp({ ev, now, today }: { ev?: CampusEvent; now: Date; today: string }) {
  if (!ev) {
    return (
      <article className={`spotlight ${styles.featured}`} data-tone="redes" aria-labelledby="h-lo-siguiente">
        <span className={styles.featuredDisc} aria-hidden="true">
          {TOPIC.icon}
        </span>
        <div className={styles.featuredBody}>
          <p className={styles.kicker}>Mientras llega el próximo evento</p>
          <h3 id="h-lo-siguiente" className={styles.featuredTitle}>
            {TOPIC.title}
          </h3>
          <p className={styles.featuredWhen}>{TOPIC.text}</p>
        </div>
        <div className={styles.featuredAction}>
          <ButtonLink to={`/participar/contribuye#${TOPIC.id}`} variant="inverse" iconRight={<ArrowRight />}>
            Proponer un tema
          </ButtonLink>
        </div>
      </article>
    );
  }
  const t = eventTiming(ev, now, today);
  return (
    <article className={`spotlight ${styles.featured}`} data-tone="redes" aria-labelledby="h-lo-siguiente">
      {/* Dentro del panel, el círculo queda transparente con anillo y día en blanco y el mes en crema */}
      <DateMark size="md" dateKey={t.anchor?.key} caption={t.anchor?.caption} />
      <div className={styles.featuredBody}>
        <p className={styles.kicker}>
          <EventIcon icon={ev.icon} size={15} className={styles.kickerIcon} />
          Lo siguiente · {CATEGORY_LABEL[ev.category]}
        </p>
        <h3 id="h-lo-siguiente" className={styles.featuredTitle}>
          <Link to={`/participar/agenda/${ev.slug}`}>{ev.title}</Link>
        </h3>
        <p className={styles.featuredWhen}>{t.when}</p>
        {t.nextLine && <p className={styles.featuredWhen}>{t.nextLine}</p>}
      </div>
      <div className={styles.featuredAction}>
        <AddToCalendarButton ev={ev} sessions={t.sessions.length} variant="inverse" />
      </div>
    </article>
  );
}

/** Participar: lo que viene en la agenda, el mes en curso y las formas de aportar. */
export default function ParticipateHub() {
  usePageTitle('Participar');
  const today = useToday();
  const now = useNow(today);
  const events = useEvents();
  const refYear = Number(today.slice(0, 4));
  const { upcoming, history } = useMemo(() => partitionEvents(events, now), [events, now]);
  // Lo siguiente va en el protagonista; la lista sigue con los demás eventos con fecha
  const featured = nextFeaturedEvent(upcoming, now);
  const dated = upcoming.filter((e) => e.sessions.length > 0 && e !== featured).slice(0, 3);
  const pending = upcoming.filter((e) => e.sessions.length === 0);
  const last = history[0];
  const lastTiming = last ? eventTiming(last, now, today) : undefined;

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Vida de empresa"
        title={
          <>
            Participar<span className="red-dot" aria-hidden="true" />
          </>
        }
        lede="«Lo que sabe uno, lo sabemos todos.»"
        aside={<PhotoCapsule name="recepcion" aspect="12 / 5" position="50% 58%" priority caption="Recepción de la oficina de FLM" mobile="full" />}
      />

      <div className={styles.top}>
        <section className={styles.agenda} aria-labelledby="h-proximamente">
          <div className="section-head">
            <h2 id="h-proximamente" className="section-title">
              Próximamente en FLM
            </h2>
            <Link to="/participar/agenda" className="link-arrow">
              Abrir la agenda <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <NextUp ev={featured} now={now} today={today} />
          {dated.length === 0 ? (
            !featured && <p className={styles.empty}>No hay eventos con fecha en la agenda. Consulta los comunicados y el histórico en la agenda.</p>
          ) : (
            <ol role="list" className={styles.next}>
              {dated.map((ev) => {
                const t = eventTiming(ev, now, today);
                return (
                  <li key={ev.id} className={styles.nextItem}>
                    <DateMark size="md" dateKey={t.anchor?.key} caption={t.anchor?.caption} tone={t.phase === 'en-curso' ? 'current' : 'default'} />
                    <div className={styles.nextBody}>
                      <p className={styles.kicker}>
                        <EventIcon icon={ev.icon} size={15} className={styles.kickerIcon} />
                        {CATEGORY_LABEL[ev.category]}
                      </p>
                      <h3 className={styles.nextTitle}>
                        <Link to={`/participar/agenda/${ev.slug}`} className={styles.stretch}>
                          {ev.title}
                        </Link>
                      </h3>
                      <p className={styles.nextWhen}>{t.when}</p>
                      {t.sessions.length > 1 && (
                        <div className={styles.nextChain}>
                          <SessionChain sessions={t.sessions} next={t.next} now={now} refYear={refYear} />
                        </div>
                      )}
                    </div>
                    <span className={styles.nextChip}>
                      <PhaseChip phase={t.phase} size="sm" />
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          {pending.length > 0 && (
            <p className={styles.pending}>
              <DateMark size="sm" />
              <span>
                <strong>{pending.length === 1 ? '1 entrada' : `${pending.length} entradas`} con fecha por confirmar: </strong>
                {pending.map((e) => e.title).join(' · ')}.{' '}
                <Link to="/participar/agenda" className={styles.inlineLink}>
                  Verlas en la agenda
                </Link>
              </span>
            </p>
          )}
        </section>

        <section className={styles.monthCol} aria-labelledby="h-mes">
          <MiniMonth today={today} headingId="h-mes" />
        </section>
      </div>

      <section className="section" aria-labelledby="h-formas">
        <div className="section-head">
          <h2 id="h-formas" className="section-title">
            Formas de participar
          </h2>
          <Link to="/participar/contribuye" className="link-arrow">
            Ver todas las propuestas <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ul role="list" className={styles.ways}>
          {WAYS.map((w) => (
            <li key={w.id} className={styles.way}>
              <span className={styles.wayIcon} aria-hidden="true">
                {w.icon}
              </span>
              <h3 className={styles.wayTitle}>
                <Link to={`/participar/contribuye#${w.id}`} className={styles.stretch}>
                  {w.title}
                </Link>
              </h3>
              <p className={styles.wayText}>{w.text}</p>
              <ArrowRight className={styles.wayArrow} size={18} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </section>

      {last && lastTiming && (
        <section className="section" aria-labelledby="h-ultimo">
          <div className="section-head">
            <h2 id="h-ultimo" className="section-title">
              Lo último que hicimos juntos
            </h2>
            <Link to="/participar/agenda?vista=historico" className="link-arrow">
              Ver el histórico <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <article className={styles.recent} data-media={!!last.image} aria-labelledby="h-ultimo-titulo">
            {last.image && <EventPhoto image={last.image} className={styles.recentPhoto} frameClassName={styles.recentFrame} sizes="(min-width: 900px) 18rem, 92vw" position="50% 46%" />}
            <div className={styles.recentBody}>
              <p className={styles.kicker}>
                <EventIcon icon={last.icon} size={15} className={styles.kickerIcon} />
                {eventKicker(last)}
              </p>
              <h3 id="h-ultimo-titulo" className={styles.recentTitle}>
                <Link to={`/participar/agenda/${last.slug}`}>{last.title}</Link>
              </h3>
              <p className={styles.recentWhen}>
                {capitalize(lastTiming.when)}
                {lastTiming.places.length > 0 ? ` · ${lastTiming.places.join(' · ')}` : ''}
              </p>
              <p className={styles.recentText}>
                <Rich text={lead(last.recap ?? last.summary)} />
              </p>
              {last.materials && last.materials.length > 0 && (
                <Link to={`/participar/agenda/${last.slug}`} className="link-arrow">
                  Resumen completo y material <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          </article>
        </section>
      )}
    </div>
  );
}

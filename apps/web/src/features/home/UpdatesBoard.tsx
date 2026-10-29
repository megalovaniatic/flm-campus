import { ArrowRight, BriefcaseBusiness, CalendarDays, Newspaper, Plus, Sun, UserPlus } from 'lucide-react';
import { useId, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router';
import { areaName, countryCode, CREATABLE_TYPES, diffDays, entriesForMonth, formatShortDate, monthShort, plainText, relativeDay, type CampusEvent, type ContentType, type NewsItem } from '@flm/shared';
import { AreaTag, Avatar, ButtonLink, Chip } from '@/design';
import { holidays, useClients, useEvents, useMe, useNews, useWelcomes } from '@/data/selectors';
import { capitalize, eventTiming, nextFeaturedEvent, partitionEvents } from '@/features/community/eventView';
import { useNow, useToday } from '@/features/community/hooks';
import styles from './UpdatesBoard.module.css';

const base = import.meta.env.BASE_URL;

/** Avisos internos que solo remiten a la agenda: ya salen en «Próximos eventos». */
const isAgendaNotice = (n: NewsItem) => n.kind === 'aviso-interno' && n.source.url.startsWith('#/participar/agenda');

/** «Hoy», «Ayer» o la fecha corta: las noticias no se anuncian en futuro. */
function newsWhen(date: string, today: string): string {
  const d = diffDays(date, today);
  return d === 0 ? 'Hoy' : d === 1 ? 'Ayer' : formatShortDate(date, date.slice(0, 4) !== today.slice(0, 4));
}

/** Atajo al creador desde el tablero: solo para quien puede crear ese tipo (autoría y administración). */
interface CreateShortcut {
  type: ContentType;
  label: string;
}

function Tile({ tile, section, kicker, title, icon, link, create, extra, className, children }: { tile?: string; section?: string; kicker: string; title: string; icon: ReactNode; link?: { to: string; label: string }; create?: CreateShortcut; extra?: ReactNode; className?: string; children: ReactNode }) {
  const id = useId();
  const me = useMe();
  const canCreate = !!create && !!me && CREATABLE_TYPES[me.effectiveRole].includes(create.type);
  return (
    <article className={[styles.tile, 'a-card', className ?? ''].join(' ').trim()} aria-labelledby={id} data-section={section} data-tile={tile}>
      <header className={styles.head}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <div className={styles.headText}>
          <p className="section-kicker">{kicker}</p>
          <h3 id={id} className={styles.title}>
            {title}
          </h3>
        </div>
        {extra}
      </header>
      {children}
      {(link || canCreate) && (
        <div className={styles.foot}>
          {link && (
            <Link to={link.to} className="link-arrow">
              {link.label} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
          {canCreate && (
            <ButtonLink to={`/gestion/nuevo/${create.type}`} variant="soft" size="sm" icon={<Plus />} className={styles.create}>
              {create.label}
            </ButtonLink>
          )}
        </div>
      )}
    </article>
  );
}

/* ── Noticias ─────────────────────────────────────────────────────────── */

function NewsTile({ today }: { today: string }) {
  const all = useNews();
  const news = useMemo(() => all.filter((n) => n.date <= today && !isAgendaNotice(n)), [all, today]);
  const [first, ...rest] = news;
  const hasToday = !!first && first.date === today;
  return (
    <Tile section="consultar" kicker="Consultar · Actualidad" title={hasToday ? 'Noticias del día' : 'Últimas noticias'} icon={<Newspaper size={18} />} link={{ to: '/consultar/actualidad', label: 'Toda la actualidad' }} create={{ type: 'noticia', label: 'Nueva noticia' }} className="spotlight-soft">
      {!first ? (
        <p className={styles.empty}>Todavía no hay novedades publicadas.</p>
      ) : (
        <>
          <div className={styles.lead}>
            <p className={styles.leadMeta}>
              <AreaTag area={first.area} size="sm" on="wash" />
              <span>{newsWhen(first.date, today)}</span>
            </p>
            <h4 className={styles.leadTitle}>
              <Link to={`/consultar/actualidad/${first.slug}`}>{first.headline}</Link>
            </h4>
            <p className={styles.leadLine}>{plainText(first.oneLiner)}</p>
          </div>
          {rest.length > 0 && (
            <ul role="list" className={styles.list}>
              {rest.slice(0, 2).map((n) => (
                <li key={n.id} data-area={n.area}>
                  <span className={styles.areaBar} aria-hidden="true" />
                  <Link to={`/consultar/actualidad/${n.slug}`} className={styles.itemTitle}>
                    {n.headline}
                  </Link>
                  <span className={styles.itemMeta}>
                    {areaName(n.area)} · {newsWhen(n.date, today)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Tile>
  );
}

/* ── Próximos eventos ─────────────────────────────────────────────────── */

function EventsTile({ today }: { today: string }) {
  const me = useMe();
  const events = useEvents();
  const now = useNow(today);
  const { upcoming } = useMemo(() => partitionEvents(events, now), [events, now]);
  const featured = nextFeaturedEvent(upcoming, now);
  const dated = upcoming.filter((e) => e.sessions.length > 0).slice(0, 4);
  // Festivos de tu sede en los próximos siete días, sin repetir el mismo día: una línea al pie
  const office = me?.office;
  const soonHolidays = useMemo(() => {
    const y = Number(today.slice(0, 4));
    const m = Number(today.slice(5, 7));
    const next = m === 12 ? [y + 1, 1] : [y, m + 1];
    const seen = new Set<string>();
    return [...entriesForMonth(y, m, { holidays, events: [] }), ...entriesForMonth(next[0]!, next[1]!, { holidays, events: [] })].filter((e) => {
      const d = diffDays(today, e.date);
      const mine = !e.offices?.length || (!!office && e.offices.includes(office));
      if (d < 0 || d > 7 || !mine || seen.has(e.date)) return false;
      seen.add(e.date);
      return true;
    });
  }, [today, office]);
  return (
    <Tile section="participar" kicker="Participar · Agenda" title="Próximos eventos" icon={<CalendarDays size={18} />} link={{ to: '/participar/agenda', label: 'Abrir la agenda' }} create={{ type: 'evento', label: 'Nuevo evento' }}>
      {dated.length === 0 ? (
        <p className={styles.empty}>No hay eventos con fecha en la agenda. Consulta los que están por confirmar.</p>
      ) : (
        <ul role="list" className={styles.events}>
          {dated.map((ev) => (
            <EventRow key={ev.id} ev={ev} now={now} today={today} next={ev.id === featured?.id} />
          ))}
        </ul>
      )}
      {soonHolidays.length > 0 && (
        <p className={styles.holidays}>
          <Sun size={15} aria-hidden="true" />
          {soonHolidays.map((h) => `Festivo ${relativeDay(h.date, today)}: ${h.detail}`).join(' · ')}
        </p>
      )}
    </Tile>
  );
}

function EventRow({ ev, now, today, next }: { ev: CampusEvent; now: Date; today: string; next: boolean }) {
  const t = eventTiming(ev, now, today);
  const key = t.anchor?.key;
  const ongoing = t.phase === 'en-curso';
  // En curso: el círculo marca hasta cuándo y el texto lo dice (la leyenda no cabe en el círculo)
  const ongoingText = key && t.anchor?.caption === 'hasta' ? `En curso · hasta el ${formatShortDate(key, false)}` : 'En curso · hoy';
  return (
    <li className={styles.event}>
      <span className={styles.date} data-next={next || undefined} data-ongoing={ongoing || undefined} aria-hidden="true">
        {key ? (
          <>
            <span className={styles.dateDay}>{Number(key.slice(8, 10))}</span>
            <span className={styles.dateMonth}>{monthShort(Number(key.slice(5, 7)))}</span>
          </>
        ) : null}
      </span>
      <span className={styles.eventText}>
        <Link to={`/participar/agenda/${ev.slug}`} className={styles.itemTitle}>
          {ev.title}
        </Link>
        <span className={styles.itemMeta}>
          {next && <strong className={styles.nextTag}>Lo siguiente · </strong>}
          {ongoing ? ongoingText : capitalize(t.nextLine ?? t.when)}
        </span>
      </span>
    </li>
  );
}

/* ── Nuevos clientes ──────────────────────────────────────────────────── */

function ClientsTile({ today }: { today: string }) {
  const all = useClients();
  const clients = useMemo(() => all.filter((c) => c.date <= today).slice(0, 4), [all, today]);
  const examples = clients.some((c) => c.fictional);
  return (
    <Tile
      tile="clients"
      kicker="La firma · Clientes"
      title="Nuevos clientes"
      icon={<BriefcaseBusiness size={18} />}
      create={{ type: 'cliente', label: 'Nuevo cliente' }}
      extra={
        examples ? (
          <span className={styles.extra}>
            <Chip size="sm">Ejemplos ficticios</Chip>
          </span>
        ) : undefined
      }
    >
      {clients.length === 0 ? (
        <p className={styles.empty}>Cuando la firma incorpore un cliente nuevo, lo verás aquí.</p>
      ) : (
        <ul role="list" className={styles.clients}>
          {clients.map((c) => (
            <li key={c.id} className={styles.client} data-area={c.area}>
              <span className={styles.country} aria-hidden="true">
                {countryCode(c.country) ?? c.country.slice(0, 2).toUpperCase()}
              </span>
              <span className={styles.clientText}>
                <span className={styles.clientName}>{c.name}</span>
                <span className={styles.clientSector}>{c.sector}</span>
                <span className={styles.itemMeta}>
                  {c.country} · {areaName(c.area)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}

/* ── Nuevas incorporaciones ───────────────────────────────────────────── */

function TeamTile({ today }: { today: string }) {
  const all = useWelcomes();
  // Las tres últimas ya anunciadas, sin caducidad: las nuevas desplazan a las anteriores (o se archivan en Gestión).
  const welcomes = useMemo(() => all.filter((w) => w.date <= today).slice(0, 3), [all, today]);
  return (
    <Tile tile="team" kicker="La firma · Equipo" title="Nuevas incorporaciones" icon={<UserPlus size={18} />} create={{ type: 'bienvenida', label: 'Nueva bienvenida' }}>
      {welcomes.length === 0 ? (
        <p className={styles.empty}>Aquí daremos la bienvenida a quienes se sumen al equipo.</p>
      ) : (
        <ul role="list" className={styles.team}>
          {welcomes.map((w) => (
            <li key={w.id} className={styles.member}>
              <Avatar name={w.person.name} photo={w.person.photo ? base + w.person.photo : undefined} size={44} decorative />
              <span className={styles.memberText}>
                <span className={styles.memberName}>{w.person.name}</span>
                <span className={styles.itemMeta}>
                  {w.person.position} · {w.person.office}
                </span>
                <span className={styles.memberMessage}>{w.message}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}

/**
 * «Ponte al día»: lo primero tras la bienvenida. Noticias, agenda, nuevos clientes y nuevas
 * incorporaciones de un vistazo; cada pieza enlaza con su sección.
 */
export function UpdatesBoard() {
  const today = useToday();
  return (
    <section className={styles.board} aria-labelledby="h-ponte-al-dia">
      <div className={styles.boardHead}>
        <p className="section-kicker">Hoy en FLM</p>
        <h2 id="h-ponte-al-dia" className="section-title">
          Ponte al día
        </h2>
      </div>
      {/* Orden de lectura: noticias, clientes, incorporaciones y eventos */}
      <div className={styles.grid}>
        <NewsTile today={today} />
        <ClientsTile today={today} />
        <TeamTile today={today} />
        <EventsTile today={today} />
      </div>
    </section>
  );
}

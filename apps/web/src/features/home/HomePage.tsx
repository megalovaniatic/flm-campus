import { ArrowRight, BookOpen, CalendarDays, Cake, Award, Library, Users } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  AREAS,
  diffDays,
  entriesForMonth,
  eventPhase,
  formatShortDate,
  formatWeekdayDate,
  formationStatus,
  madridDateKey,
  monthShort,
  nextSession,
  plainText,
  sessionStart,
  timeOf,
  type CalendarEntry,
  type Formation,
} from '@flm/shared';
import { AreaTag, Avatar, ProgressRing, StatusGlyph } from '@/design';
import { assignments, holidays, useDocuments, useEvents, useFormations, useMe, useNews, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { usePageTitle } from '@/lib/preferences';
import { Arrival } from './Arrival';
import styles from './HomePage.module.css';

const base = import.meta.env.BASE_URL;

function useNextStep(): { formation: Formation; reason: string; due?: string } | null {
  const me = useMe();
  const formations = useFormations();
  const progress = useDemo((s) => s.progress);
  return useMemo(() => {
    if (!me || !formations.length) return null;
    const pending = (f: Formation) => formationStatus(progress[f.id], f) !== 'completada';
    for (const a of [...assignments].sort((x, y) => (x.dueDate ?? '').localeCompare(y.dueDate ?? ''))) {
      if (a.target.kind === 'persona' && a.target.personId !== me.id) continue;
      const f = formations.find((x) => x.id === a.formationId);
      if (f && pending(f)) return { formation: f, reason: 'Formación obligatoria', due: a.dueDate };
    }
    const inProgress = formations.find((f) => ['leida', 'test-intentado', 'test-superado'].includes(formationStatus(progress[f.id], f)));
    if (inProgress) return { formation: inProgress, reason: 'Continúa donde lo dejaste' };
    const mine = formations.find((f) => AREAS[f.area].name === me.department && pending(f));
    if (mine) return { formation: mine, reason: `Recomendada para ${me.department}` };
    const any = formations.find(pending);
    return any ? { formation: any, reason: 'Siguiente formación' } : null;
  }, [me, formations, progress]);
}

function NextStepCard() {
  const next = useNextStep();
  const progress = useDemo((s) => s.progress);
  if (!next) {
    return (
      <article className={`${styles.card} a-card`}>
        <p className={styles.cardLabel}>Tu siguiente paso</p>
        <h2 className={styles.cardTitle}>Lo tienes todo al día</h2>
        <p className={styles.cardText}>Has completado las formaciones disponibles. Pon a prueba tus conocimientos con la evaluación de tu área.</p>
        <Link className="link-arrow" to="/aprender">
          Ir a Aprender <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </article>
    );
  }
  const f = next.formation;
  const status = formationStatus(progress[f.id], f);
  const days = next.due ? diffDays(madridDateKey(), next.due) : undefined;
  return (
    <article className={`${styles.card} ${styles.next} a-card`} data-area={f.area}>
      <p className={styles.cardLabel}>
        Tu siguiente paso · <span className={styles.reason}>{next.reason}</span>
      </p>
      <h2 className={styles.cardTitle}>
        <Link to={`/aprender/${f.area}/${f.slug}`} className={styles.stretch}>
          {f.title}
        </Link>
      </h2>
      <div className={styles.nextMeta}>
        <AreaTag area={f.area} size="sm" />
        <span className="meta">{f.readingMinutes} min</span>
        {next.due && <span className={styles.due}>Antes del {formatShortDate(next.due, false)}{days !== undefined && days >= 0 ? ` · quedan ${days} días` : ''}</span>}
      </div>
      <div className={styles.nextFoot}>
        <StatusGlyph status={status} />
        <span className={styles.go} aria-hidden="true">
          {status === 'sin-empezar' ? 'Empezar' : 'Continuar'} <ArrowRight size={16} />
        </span>
      </div>
    </article>
  );
}

function TodayCard() {
  const people = usePeople();
  const events = useEvents();
  const today = madridDateKey();
  const entries = useMemo(() => {
    const y = Number(today.slice(0, 4));
    const m = Number(today.slice(5, 7));
    const next = m === 12 ? [y + 1, 1] : [y, m + 1];
    const all = [...entriesForMonth(y, m, { people, holidays, events: [] }), ...entriesForMonth(next[0]!, next[1]!, { people, holidays, events: [] })];
    return all.filter((e) => {
      const d = diffDays(today, e.date);
      return d >= 0 && d <= 7;
    });
  }, [people, today]);
  const todaysEvents = events.filter((e) => e.sessions.some((s) => madridDateKey(sessionStart(s)) === today));
  const icon = (e: CalendarEntry) => (e.kind === 'cumpleanos' ? <Cake size={14} /> : e.kind === 'aniversario' ? <Award size={14} /> : <CalendarDays size={14} />);
  return (
    <article className={`${styles.card} a-card`}>
      <p className={styles.cardLabel}>Hoy en FLM · {formatWeekdayDate(today)}</p>
      {todaysEvents.length === 0 && entries.length === 0 ? (
        <p className={styles.cardText}>Hoy no hay celebraciones ni encuentros en el calendario.</p>
      ) : (
        <ul role="list" className={styles.todayList}>
          {todaysEvents.map((e) => (
            <li key={e.id}>
              <span className={styles.todayIcon} aria-hidden="true">
                <CalendarDays size={16} />
              </span>
              <span>
                <Link to={`/participar/agenda/${e.slug}`} className={styles.todayLink}>
                  {e.title}
                </Link>
                <span className={styles.todaySub}>Hoy</span>
              </span>
            </li>
          ))}
          {entries.slice(0, 4).map((e) => {
            const person = e.personId ? people.find((p) => p.id === e.personId) : undefined;
            const d = diffDays(today, e.date);
            return (
              <li key={e.id}>
                {person ? <Avatar name={person.name} photo={person.photo ? base + person.photo : undefined} size={32} decorative /> : <span className={styles.todayIcon}>{icon(e)}</span>}
                <span>
                  <span className={styles.todayName}>{e.kind === 'festivo' ? 'Festivo' : e.title}</span>
                  <span className={styles.todaySub}>
                    {e.kind === 'cumpleanos' ? 'Cumpleaños' : e.kind === 'aniversario' ? e.detail : e.detail} · {d === 0 ? 'hoy' : d === 1 ? 'mañana' : formatShortDate(e.date, false)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <Link className="link-arrow" to="/participar/calendario">
        Ver calendario <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

function PathsCard() {
  const formations = useFormations();
  const progress = useDemo((s) => s.progress);
  const news = useNews();
  const events = useEvents();
  const completed = formations.filter((f) => formationStatus(progress[f.id], f) === 'completada').length;
  const today = madridDateKey();
  const recentNews = news.filter((n) => diffDays(n.date, today) <= 31);
  const upcoming = events
    .filter((e) => eventPhase(e) !== 'historico')
    .map((e) => ({ e, s: nextSession(e) }))
    .filter((x) => x.s)
    .sort((a, b) => sessionStart(a.s!).getTime() - sessionStart(b.s!).getTime())[0];
  return (
    <div className={`${styles.paths} a-card`}>
      <Link to="/aprender" className={styles.path}>
        <span className={styles.pathHead}>
          <BookOpen size={18} aria-hidden="true" /> Aprender
        </span>
        <span className={styles.pathBody}>
          <ProgressRing value={completed} total={formations.length} size={44} stroke={4} label="Formaciones completadas" />
          <span>
            <strong className={styles.pathNum}>
              {completed}/{formations.length || 12}
            </strong>
            <span className={styles.pathSub}>formaciones completadas</span>
          </span>
        </span>
      </Link>
      <Link to="/consultar/actualidad" className={styles.path}>
        <span className={styles.pathHead}>
          <Library size={18} aria-hidden="true" /> Consultar
        </span>
        <span className={styles.pathBody}>
          <strong className={styles.pathNum}>{recentNews.length}</strong>
          <span className={styles.pathSub}>{recentNews.length === 1 ? 'novedad en el último mes' : 'novedades en el último mes'}</span>
        </span>
      </Link>
      <Link to={upcoming ? `/participar/agenda/${upcoming.e.slug}` : '/participar/agenda'} className={styles.path}>
        <span className={styles.pathHead}>
          <Users size={18} aria-hidden="true" /> Participar
        </span>
        <span className={styles.pathBody}>
          {upcoming ? (
            <>
              <span className={styles.dateBadge} aria-hidden="true">
                <span>{Number(madridDateKey(sessionStart(upcoming.s!)).slice(8))}</span>
                <span>{monthShort(Number(madridDateKey(sessionStart(upcoming.s!)).slice(5, 7)))}</span>
              </span>
              <span>
                <strong className={styles.pathEvent}>{upcoming.s!.label ? `${upcoming.e.title.split(':')[0]} · ${upcoming.s!.label}` : upcoming.e.title}</strong>
                <span className={styles.pathSub}>
                  Próximo · {formatShortDate(madridDateKey(sessionStart(upcoming.s!)), false)}
                  {timeOf(upcoming.s!.start) ? `, ${timeOf(upcoming.s!.start)}` : ''}
                </span>
              </span>
            </>
          ) : (
            <span className={styles.pathSub}>Consulta la agenda de FLM</span>
          )}
        </span>
      </Link>
    </div>
  );
}

export function HomePage() {
  const me = useMe();
  usePageTitle('Inicio');
  const news = useNews().slice(0, 3);
  const docs = useDocuments().filter((d) => d.publicDemo).slice(0, 3);
  const events = useEvents()
    .filter((e) => eventPhase(e) !== 'historico')
    .slice(0, 4);
  const firstName = me?.name.split(' ')[0] ?? '';

  return (
    <div className={styles.home}>
      <section className={`container ${styles.hero}`} aria-label="Bienvenida">
        <Arrival
          firstName={firstName}
          aside={
            <div className={styles.strip}>
              <NextStepCard />
              <TodayCard />
              <PathsCard />
            </div>
          }
        />
      </section>

      {news.length > 0 && (
        <section className="container section" aria-labelledby="h-actualidad">
          <div className="section-head">
            <h2 id="h-actualidad" className="section-title">
              Actualidad en tu sector
            </h2>
            <Link to="/consultar/actualidad" className="link-arrow">
              Ver todas las novedades <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.newsGrid}>
            {news.map((n) => (
              <article key={n.id} className={styles.newsCard} data-area={n.area}>
                <div className={styles.newsTop}>
                  <AreaTag area={n.area} size="sm" />
                  <span className="meta">{formatShortDate(n.date)}</span>
                </div>
                <h3 className={styles.newsTitle}>
                  <Link to={`/consultar/actualidad/${n.slug}`} className={styles.stretch}>
                    {n.headline}
                  </Link>
                </h3>
                <p className={styles.newsLine}>{plainText(n.oneLiner)}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="container section" aria-labelledby="h-agenda">
        <div className="section-head">
          <h2 id="h-agenda" className="section-title">
            Lo que viene en FLM
          </h2>
          <Link to="/participar/agenda" className="link-arrow">
            Abrir la agenda <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ul role="list" className={styles.agenda}>
          {events.map((e) => {
            const s = nextSession(e);
            const day = s ? madridDateKey(sessionStart(s)) : null;
            return (
              <li key={e.id} className={styles.agendaItem}>
                <span className={styles.agendaDate} data-pending={!day} aria-hidden="true">
                  {day ? (
                    <>
                      <span className={styles.agendaDay}>{Number(day.slice(8))}</span>
                      <span className={styles.agendaMonth}>{monthShort(Number(day.slice(5, 7)))}</span>
                    </>
                  ) : (
                    <span className={styles.agendaMonth}>por fijar</span>
                  )}
                </span>
                <span className={styles.agendaText}>
                  <Link to={`/participar/agenda/${e.slug}`} className={styles.stretch}>
                    {e.title}
                  </Link>
                  <span className={styles.agendaSub}>
                    {day ? `${formatWeekdayDate(day)}${s && timeOf(s.start) ? `, ${timeOf(s.start)}` : ''}${e.sessions.length > 1 ? ` · ${e.sessions.length} sesiones` : ''}` : e.pendingDateNote ?? 'Fecha por confirmar'}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {docs.length > 0 && (
        <section className="container section" aria-labelledby="h-biblioteca">
          <div className="section-head">
            <h2 id="h-biblioteca" className="section-title">
              Recién llegado a la biblioteca
            </h2>
            <Link to="/consultar/notas" className="link-arrow">
              Ver notas informativas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul role="list" className={styles.docs}>
            {docs.map((d) => (
              <li key={d.id} className={styles.doc}>
                <span className={styles.docKind}>{d.issuer}</span>
                <Link to={`/consultar/notas/${d.id}`} className={styles.stretch}>
                  {d.title}
                </Link>
                <span className="meta">
                  {formatShortDate(d.date)} · PDF · {d.versions[0]?.pages} págs.
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

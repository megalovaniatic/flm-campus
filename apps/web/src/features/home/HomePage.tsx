import { ArrowRight, BookOpen, Library, Users } from 'lucide-react';
import { Link } from 'react-router';
import { diffDays, eventPhase, formatShortDate, formationStatus, madridDateKey, monthShort, nextSession, sessionEnd, sessionStart, timeOf } from '@flm/shared';
import { ProgressRing } from '@/design';
import { useDocuments, useEvents, useFormations, useMe, useNews } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { usePageTitle } from '@/lib/preferences';
import { NextStepPanel } from '@/features/learn/common/NextStepPanel';
import { Arrival } from './Arrival';
import { UpdatesBoard } from './UpdatesBoard';
import styles from './HomePage.module.css';

/** Las tres puertas del campus, cada una con el tramo de su sección (el mismo que en el titular). */
function PathsCard() {
  const formations = useFormations();
  const progress = useDemo((s) => s.progress);
  const news = useNews();
  const events = useEvents();
  const completed = formations.filter((f) => formationStatus(progress[f.id], f) === 'completada').length;
  const today = madridDateKey();
  // Del último mes y hasta hoy: una noticia con fecha futura aún no es una novedad (como en «Ponte al día»).
  const recentNews = news.filter((n) => {
    const d = diffDays(n.date, today);
    return d >= 0 && d <= 31;
  });
  const upcoming = events
    .filter((e) => eventPhase(e) !== 'historico')
    .map((e) => ({ e, s: nextSession(e) }))
    .filter((x) => x.s)
    .sort((a, b) => sessionStart(a.s!).getTime() - sessionStart(b.s!).getTime())[0];
  return (
    <div className={styles.paths}>
      <Link to="/aprender" className={styles.path}>
        <span className={styles.pathHead}>
          <BookOpen size={18} aria-hidden="true" />
          <span className={styles.pathLabel} data-section="aprender">
            Aprender
          </span>
        </span>
        <span className="sr-only">: </span>
        <span className={styles.pathBody}>
          <ProgressRing value={completed} total={formations.length} size={44} stroke={4} label="Formaciones completadas" decorative />
          <span>
            <strong className={styles.pathNum}>
              {completed}/{formations.length || 12}
            </strong>
            {/* Espacio duro: un espacio normal se pierde entre bloques y el nombre quedaría «1/12formaciones». */}
            <span className="sr-only">{' '}</span>
            <span className={styles.pathSub}>formaciones completadas</span>
          </span>
        </span>
      </Link>
      <Link to="/consultar/actualidad" className={styles.path}>
        <span className={styles.pathHead}>
          <Library size={18} aria-hidden="true" />
          <span className={styles.pathLabel} data-section="consultar">
            Consultar
          </span>
        </span>
        <span className="sr-only">: </span>
        <span className={styles.pathBody}>
          <strong className={styles.pathNum}>{recentNews.length}</strong>
          <span className="sr-only">{' '}</span>
          <span className={styles.pathSub}>{recentNews.length === 1 ? 'novedad en el último mes' : 'novedades en el último mes'}</span>
        </span>
      </Link>
      <Link to={upcoming ? `/participar/agenda/${upcoming.e.slug}` : '/participar/agenda'} className={styles.path}>
        <span className={styles.pathHead}>
          <Users size={18} aria-hidden="true" />
          <span className={styles.pathLabel} data-section="participar">
            Participar
          </span>
        </span>
        <span className="sr-only">: </span>
        <span className={styles.pathBody}>
          {upcoming ? (
            <>
              <span className={styles.dateBadge} aria-hidden="true">
                <span>{Number(madridDateKey(sessionStart(upcoming.s!)).slice(8))}</span>
                <span>{monthShort(Number(madridDateKey(sessionStart(upcoming.s!)).slice(5, 7)))}</span>
              </span>
              <span>
                <strong className={styles.pathEvent}>{upcoming.s!.label ? `${upcoming.e.title.split(':')[0]} · ${upcoming.s!.label}` : upcoming.e.title}</strong>
                <span className="sr-only">. </span>
                <span className={styles.pathSub}>
                  {sessionStart(upcoming.s!).getTime() <= Date.now() ? (
                    // Ya empezó (p. ej., un comunicado vigente un mes): no es «Próximo».
                    <>En curso{upcoming.s!.end ? ` · hasta el ${formatShortDate(madridDateKey(sessionEnd(upcoming.s!)), false)}` : ''}</>
                  ) : (
                    <>
                      Próximo · {formatShortDate(madridDateKey(sessionStart(upcoming.s!)), false)}
                      {timeOf(upcoming.s!.start) ? `, ${timeOf(upcoming.s!.start)}` : ''}
                    </>
                  )}
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

/**
 * Inicio: la bienvenida y, al deslizar un poco, «Ponte al día» (noticias, agenda, clientes y
 * equipo). Después, la tarjeta protagonista con tu siguiente paso y las tres puertas del campus.
 */
export function HomePage() {
  const me = useMe();
  usePageTitle('Inicio');
  // En la demo pública, solo los documentos aprobados para publicarse
  const docs = useDocuments()
    .filter((d) => !__DEMO__ || d.publicDemo)
    .slice(0, 3);
  const firstName = me?.name.split(' ')[0] ?? '';

  return (
    <div className={styles.home}>
      {/* Sin región propia: «La llegada» tiene su h1 y el tablero, su propia sección */}
      <div className={`container ${styles.hero}`}>
        <Arrival firstName={firstName} aside={<UpdatesBoard />} />
      </div>

      <section className={`container ${styles.next}`} aria-labelledby="h-tu-campus">
        <h2 id="h-tu-campus" className="sr-only">
          Tu formación y el campus
        </h2>
        <div className={styles.strip}>
          <NextStepPanel context="inicio" />
          <PathsCard />
        </div>
      </section>

      {docs.length > 0 && (
        <section className="container section" aria-labelledby="h-biblioteca">
          <div className="section-head">
            <div>
              <p className="section-kicker" data-section="consultar">
                Consultar · Biblioteca
              </p>
              <h2 id="h-biblioteca" className="section-title">
                Recién llegado a la biblioteca
              </h2>
            </div>
            <Link to="/consultar/notas" className="link-arrow">
              Ver notas informativas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul role="list" className={styles.docs}>
            {docs.map((d) => (
              <li key={d.id} className={styles.doc} data-area={d.area === 'general' ? undefined : d.area}>
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

import { ArrowRight, CalendarClock, ChevronDown, CircleCheck, CircleDot, Download, GraduationCap, Settings, ShieldCheck, Sparkles, TriangleAlert, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AREAS, formatLongDate, formatShortDate, madridDateKey, madridParts, ROLE_LABEL, type AreaId } from '@flm/shared';
import { AreaTag, Button, ButtonLink, EmptyState, Notice, PageHeader, ProgressRing, StatusGlyph } from '@/design';
import { DEMO_USER_ID, useFormations, useMe } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { Logo } from '@/layout/Logo';
import { downloadText, toCsv } from '@/lib/download';
import { usePageTitle } from '@/lib/preferences';
import { scrollToSection, useHashScroll } from '@/features/about/useSectionNav';
import { Portrait } from './Portrait';
import { Recognitions } from './Recognitions';
import { Trajectory } from './Trajectory';
import {
  upcomingBadges,
  useAreaSummaries,
  useAssessmentSummaries,
  useAttemptHistory,
  useBadges,
  useFormationGroups,
  useMandatory,
  usePublishedCount,
  type AreaSummary,
  type AssessmentSummary,
  type AttemptRow,
  type MandatoryItem,
} from './useProfileData';
import styles from './ProfilePage.module.css';

/** Sedes (dirección de flmexperts.com, como en el pie). */
const OFFICE_LINE: Record<string, string> = {
  Barcelona: 'C/ Bailèn, 71 bis, 2º · 08009 Barcelona',
  Vic: 'C/ de Figueres, 12 · 08500 Vic',
  Granollers: 'C/ Girona, 15-17 · 08402 Granollers',
};

const SECTIONS = [
  { id: 'recorrido', label: 'Tu recorrido' },
  { id: 'progreso', label: 'Progreso' },
  { id: 'obligatorias', label: 'Obligatorias' },
  { id: 'formaciones', label: 'Formaciones' },
  { id: 'intentos', label: 'Intentos' },
  { id: 'evaluaciones', label: 'Evaluaciones' },
  { id: 'reconocimientos', label: 'Reconocimientos' },
] as const;

const dayOf = (iso: string) => madridDateKey(new Date(iso));
const timeOfIso = (iso: string) => {
  const p = madridParts(new Date(iso));
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
};

/* ── Progreso por área ─────────────────────────────────────────────────── */

function AreaProgress({ summaries }: { summaries: AreaSummary[] }) {
  const done = summaries.reduce((n, s) => n + s.completed, 0);
  const total = summaries.reduce((n, s) => n + s.total, 0);
  return (
    <section id="progreso" aria-labelledby="h-progreso" className={`${styles.card} ${styles.progressCard}`}>
      <div className={styles.cardHead}>
        <h2 id="h-progreso" className={styles.cardTitle}>
          Progreso por área
        </h2>
        <p className={styles.cardMeta}>{total ? `${done} de ${total} formaciones completadas` : 'Formaciones en preparación'}</p>
      </div>
      <ul role="list" className={styles.areas}>
        {summaries.map((s) => {
          const left = s.total - s.completed;
          const status = !s.total ? 'En preparación' : left === 0 ? 'Itinerario completado' : left === 1 ? 'Te queda 1 formación' : `Te quedan ${left} formaciones`;
          return (
            <li key={s.area} className={styles.area} data-area={s.area} data-complete={s.total > 0 && left === 0}>
              <ProgressRing value={s.completed} total={s.total} size={60} stroke={5} label={`Formaciones completadas de ${AREAS[s.area].name}`}>
                <span className={styles.ringValue}>{s.total ? `${s.completed}/${s.total}` : '—'}</span>
              </ProgressRing>
              <span className={styles.areaText}>
                <Link to={`/aprender/${s.area}`} className={styles.stretch}>
                  <span className={styles.areaDot} aria-hidden="true" />
                  {AREAS[s.area].name}
                </Link>
                <span className={styles.areaStatus}>
                  {s.total > 0 && left === 0 && <CircleCheck size={14} aria-hidden="true" />}
                  {status}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Obligatorias ──────────────────────────────────────────────────────── */

function dueText(m: MandatoryItem): string {
  const due = m.assignment.dueDate;
  if (!due || m.days === undefined) return 'Sin fecha límite';
  if (m.days > 1) return `Antes del ${formatShortDate(due)} · quedan ${m.days} días`;
  if (m.days === 1) return `Vence mañana, ${formatShortDate(due, false)}`;
  if (m.days === 0) return 'Vence hoy';
  return `Vencida el ${formatShortDate(due)} · hace ${-m.days} ${m.days === -1 ? 'día' : 'días'}`;
}

function Mandatory({ total, pending, hasFormations }: { total: number; pending: MandatoryItem[]; hasFormations: boolean }) {
  return (
    <section id="obligatorias" aria-labelledby="h-obligatorias" className={styles.block}>
      <div className="section-head">
        <h2 id="h-obligatorias" className="section-title">
          Formaciones obligatorias
        </h2>
        {pending.length > 0 && <p className="meta">{pending.length === 1 ? '1 pendiente' : `${pending.length} pendientes`}</p>}
      </div>
      {!hasFormations ? (
        <EmptyState icon={<GraduationCap />} title="Aún no hay formaciones publicadas">
          <p>Cuando administración publique y asigne formaciones, verás aquí las que debes completar y su plazo.</p>
        </EmptyState>
      ) : pending.length === 0 ? (
        <Notice tone="success" icon={<CircleCheck size={18} />} title="Estás al día">
          {total ? `Has completado ${total === 1 ? 'la formación obligatoria que tenías asignada' : `las ${total} formaciones obligatorias que tenías asignadas`}.` : 'No tienes formaciones obligatorias asignadas.'}
        </Notice>
      ) : (
        <ul role="list" className={styles.mandatory}>
          {pending.map((m) => {
            const f = m.formation;
            const overdue = m.days !== undefined && m.days < 0;
            return (
              <li key={m.assignment.id} className={styles.mRow} data-area={f.area}>
                <div className={styles.mMain}>
                  <h3 className={styles.mTitle}>
                    <Link to={`/aprender/${f.area}/${f.slug}`} className={styles.stretch}>
                      {f.title}
                    </Link>
                  </h3>
                  <p className={styles.mMeta}>
                    <AreaTag area={f.area} size="sm" />
                    <span>{f.readingMinutes} min de lectura</span>
                    {m.assignedBy && <span>Asignada por {m.assignedBy}</span>}
                  </p>
                </div>
                <StatusGlyph status={m.status} />
                <p className={styles.due} data-overdue={overdue || undefined}>
                  {overdue ? <TriangleAlert size={16} aria-hidden="true" /> : <CalendarClock size={16} aria-hidden="true" />}
                  <span>{dueText(m)}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ── Formaciones ───────────────────────────────────────────────────────── */

function FormationsTable({ groups }: { groups: ReturnType<typeof useFormationGroups> }) {
  return (
    <section id="formaciones" aria-labelledby="h-formaciones" className={styles.block}>
      <div className="section-head">
        <h2 id="h-formaciones" className="section-title">
          Tus formaciones
        </h2>
        <Link to="/aprender" className="link-arrow">
          Ir a Aprender <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      {groups.length === 0 ? (
        <EmptyState icon={<GraduationCap />} title="Aún no hay formaciones publicadas" action={<ButtonLink to="/aprender" variant="secondary">Ir a Aprender</ButtonLink>}>
          <p>Cuando se publiquen, verás aquí el estado de cada una: lectura, test y resultado.</p>
        </EmptyState>
      ) : (
        <div className={styles.tableWrap}>
          <table role="table" className={styles.table}>
            <caption className="sr-only">Estado de tus formaciones, agrupadas por área</caption>
            <thead role="rowgroup">
              <tr role="row">
                <th role="columnheader" scope="col">
                  Formación
                </th>
                <th role="columnheader" scope="col">
                  Estado
                </th>
                <th role="columnheader" scope="col">
                  Lectura
                </th>
                <th role="columnheader" scope="col">
                  Mejor resultado
                </th>
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody role="rowgroup" key={g.area} data-area={g.area}>
                <tr role="row" className={styles.groupRow}>
                  <th role="rowheader" scope="rowgroup" colSpan={4}>
                    <span className={styles.groupName}>
                      <span className={styles.areaDot} aria-hidden="true" />
                      {AREAS[g.area].name}
                    </span>
                    <span className="sr-only">: </span>
                    <span className={styles.groupCount}>
                      {g.completed} de {g.rows.length} completadas
                    </span>
                  </th>
                </tr>
                {g.rows.map((r) => (
                  <tr role="row" key={r.formation.id}>
                    <th role="rowheader" scope="row" className={styles.titleCell}>
                      <Link to={`/aprender/${r.formation.area}/${r.formation.slug}`}>{r.formation.title}</Link>
                      <span className="sr-only">. </span>
                      <span className={styles.cellMeta}>
                        {r.formation.readingMinutes} min · versión {r.formation.version}
                      </span>
                    </th>
                    <td role="cell">
                      <StatusGlyph status={r.status} />
                    </td>
                    <td role="cell">
                      <span className={styles.cellLabel} aria-hidden="true">
                        Lectura:{' '}
                      </span>
                      {r.readAt ? `Confirmada el ${formatShortDate(dayOf(r.readAt))}` : 'Sin confirmar'}
                    </td>
                    <td role="cell">
                      <span className={styles.cellLabel} aria-hidden="true">
                        Mejor resultado:{' '}
                      </span>
                      {r.best ? `${r.best.correct} de ${r.best.total}${r.best.passed ? ' · test superado' : ''}` : r.attempts ? '—' : 'Sin intentos'}
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </section>
  );
}

/* ── Historial de intentos ─────────────────────────────────────────────── */

const PAGE = 8;

function AttemptsHistory({ rows, next }: { rows: AttemptRow[]; next?: { title: string; to: string } }) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, PAGE);

  const exportCsv = () => {
    const data = rows.map((r) => [
      formatShortDate(dayOf(r.attempt.at)),
      timeOfIso(r.attempt.at),
      r.formation?.title ?? r.formationId,
      r.formation ? AREAS[r.formation.area].name : '',
      r.attempt.correct,
      r.attempt.total,
      r.attempt.passed ? 'Superado' : 'Aún no',
      r.attempt.version,
      r.formation?.version,
    ]);
    downloadText(
      `flm-campus-intentos-${madridDateKey()}.csv`,
      toCsv([['Fecha', 'Hora', 'Formación', 'Área', 'Aciertos', 'Preguntas', 'Resultado', 'Versión del intento', 'Versión vigente'], ...data]),
      'text/csv;charset=utf-8',
    );
  };

  return (
    <section id="intentos" aria-labelledby="h-intentos" className={styles.card}>
      <div className={styles.cardHead}>
        <h2 id="h-intentos" className={styles.cardTitle}>
          Historial de intentos
        </h2>
        {rows.length > 0 && (
          <Button variant="ghost" size="sm" icon={<Download />} onClick={exportCsv}>
            Descargar (CSV)
          </Button>
        )}
      </div>
      {rows.length === 0 ? (
        <div className={styles.emptyAttempts}>
          <span className={styles.emptyGlyph} aria-hidden="true">
            <StatusGlyph status="sin-empezar" size={28} withLabel={false} />
          </span>
          <p className={styles.quiet}>Todavía no has hecho ningún test. Cuando termines uno, verás aquí la fecha, los aciertos, el resultado y la versión de la formación.</p>
          {next && (
            <Link to={next.to} className="link-arrow">
              Empieza por «{next.title}» <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={styles.tableWrap} data-plain="true">
            <table role="table" className={`${styles.table} ${styles.compact}`}>
              <caption className="sr-only">Tus intentos de test, del más reciente al más antiguo</caption>
              <thead role="rowgroup">
                <tr role="row">
                  <th role="columnheader" scope="col">
                    Fecha
                  </th>
                  <th role="columnheader" scope="col">
                    Formación
                  </th>
                  <th role="columnheader" scope="col">
                    Aciertos
                  </th>
                  <th role="columnheader" scope="col">
                    Resultado
                  </th>
                  <th role="columnheader" scope="col">
                    Versión
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {shown.map((r) => (
                  <tr role="row" key={r.attempt.id}>
                    <td role="cell" className={styles.dateCell}>
                      <time dateTime={r.attempt.at}>{formatShortDate(dayOf(r.attempt.at))}</time>
                      <span className={styles.cellMeta}>{timeOfIso(r.attempt.at)}</span>
                    </td>
                    <th role="rowheader" scope="row" className={styles.titleCell}>
                      {r.formation ? <Link to={`/aprender/${r.formation.area}/${r.formation.slug}`}>{r.formation.title}</Link> : <span>Formación retirada</span>}
                    </th>
                    <td role="cell" className={styles.num}>
                      <span className={styles.cellLabel} aria-hidden="true">
                        Aciertos:{' '}
                      </span>
                      {r.attempt.correct} de {r.attempt.total}
                    </td>
                    <td role="cell">
                      <span className={styles.result} data-passed={r.attempt.passed}>
                        {r.attempt.passed ? <CircleCheck size={15} aria-hidden="true" /> : <CircleDot size={15} aria-hidden="true" />}
                        {r.attempt.passed ? 'Superado' : 'Aún no'}
                      </span>
                    </td>
                    <td role="cell">
                      <span className={styles.cellLabel} aria-hidden="true">
                        Versión:{' '}
                      </span>
                      {r.attempt.version}
                      {r.outdated && <span className={styles.outdated}> · anterior (no cuenta)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > PAGE && (
            <Button variant="soft" size="sm" iconRight={<ChevronDown className={all ? styles.flip : undefined} />} aria-expanded={all} onClick={() => setAll((v) => !v)} className={styles.more}>
              {all ? 'Ver solo los más recientes' : `Ver los ${rows.length} intentos`}
            </Button>
          )}
        </>
      )}
    </section>
  );
}

/* ── Evaluaciones sectoriales ──────────────────────────────────────────── */

function Seal({ area }: { area: AreaId }) {
  if (area === 'contable') return <span className={styles.ringSeal} aria-hidden="true" />;
  return <Logo variant={area} height={20} decorative className={styles.seal} />;
}

function Assessments({ summaries }: { summaries: AssessmentSummary[] }) {
  return (
    <section id="evaluaciones" aria-labelledby="h-evaluaciones" className={styles.card}>
      <div className={styles.cardHead}>
        <h2 id="h-evaluaciones" className={styles.cardTitle}>
          Evaluaciones sectoriales
        </h2>
        <p className={styles.cardMeta}>«Pon a prueba tus conocimientos»</p>
      </div>
      <ul role="list" className={styles.assess}>
        {summaries.map((s) => {
          const quiz = s.assessment?.quiz;
          let state: 'preparacion' | 'superada' | 'aun-no' | 'sin-intentar';
          let label: string;
          let text: string;
          let cta: string | undefined;
          if (!s.assessment || !quiz) {
            state = 'preparacion';
            label = 'En preparación';
            text = 'La evaluación de esta área se está redactando.';
          } else if (s.passed) {
            state = 'superada';
            label = 'Superada';
            text = `${s.passed.correct} de ${s.passed.total} · ${formatShortDate(dayOf(s.passed.at))}${s.attempts.length > 1 ? ` · ${s.attempts.length} intentos` : ''}`;
            cta = 'Repasar la evaluación';
          } else if (s.best) {
            state = 'aun-no';
            label = 'Aún no';
            text = `Mejor resultado: ${s.best.correct} de ${s.best.total}. Se supera con ${quiz.passMark}.`;
            cta = 'Volver a intentarlo';
          } else {
            state = 'sin-intentar';
            label = 'Sin intentar';
            text = `${quiz.questions.length} preguntas · se supera con ${quiz.passMark}.`;
            cta = 'Empezar la evaluación';
          }
          return (
            <li key={s.area} className={styles.assessItem} data-area={s.area} data-state={state}>
              <div className={styles.assessHead}>
                <AreaTag area={s.area} size="sm" />
                {state === 'superada' && <Seal area={s.area} />}
              </div>
              <p className={styles.assessState}>
                {state === 'superada' ? <CircleCheck size={15} aria-hidden="true" /> : state === 'aun-no' ? <CircleDot size={15} aria-hidden="true" /> : null}
                {label}
              </p>
              <p className={styles.assessText}>{text}</p>
              {cta && (
                <Link to={`/aprender/${s.area}/evaluacion`} className={`link-arrow ${styles.assessLink}`}>
                  {cta}
                  <span className="sr-only"> de {AREAS[s.area].name}</span> <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Página ────────────────────────────────────────────────────────────── */

export default function ProfilePage() {
  usePageTitle('Mi perfil');
  useHashScroll();
  const me = useMe();
  const formations = useFormations();
  const allFormations = useFormations(true);
  const summaries = useAreaSummaries(formations);
  const mandatory = useMandatory(me?.id ?? DEMO_USER_ID, formations);
  const groups = useFormationGroups(formations);
  const attempts = useAttemptHistory(allFormations);
  const assessmentSummaries = useAssessmentSummaries();
  const published = usePublishedCount(me?.id ?? DEMO_USER_ID);
  const fallbackPerson = useMemo(() => ({ id: '', email: '', name: '', position: '', department: 'Administración' as const, office: 'Barcelona' as const, role: 'empleado' as const, showBirthday: false, status: 'activa' as const }), []);
  const badges = useBadges(me ?? fallbackPerson, formations, published);
  // Insignias que aún no se han celebrado al abrir la página (se fija al montar).
  const [fresh] = useState<ReadonlySet<string>>(() => {
    const done = new Set(useDemo.getState().celebrated);
    return new Set(badges.filter((b) => !done.has(b.id)).map((b) => b.id));
  });

  if (!me) {
    return (
      <div className="container page">
        <EmptyState icon={<UserRound />} title="No hemos encontrado tu perfil" action={<ButtonLink to="/acceso">Volver a entrar</ButtonLink>}>
          <p>Puede que la sesión ya no sea válida. Vuelve a entrar para ver tu progreso.</p>
        </EmptyState>
      </div>
    );
  }

  const upcoming = upcomingBadges(me, badges, summaries, published, assessmentSummaries);
  const viewingAs = me.effectiveRole !== me.role;
  const freshCount = badges.filter((b) => fresh.has(b.id)).length;

  return (
    <div className={`container page ${styles.page}`}>
      <PageHeader
        eyebrow="Mi perfil"
        title={me.name}
        lede={
          <>
            {me.position} · FLM {me.office}
          </>
        }
        actions={
          <>
            <ButtonLink to="/perfil/ajustes" variant="secondary" icon={<Settings />}>
              Ajustes
            </ButtonLink>
            {freshCount > 0 && (
              <Link to={{ hash: '#reconocimientos' }} className={styles.freshLink}>
                <Sparkles size={15} aria-hidden="true" />
                {freshCount === 1 ? 'Tienes un reconocimiento nuevo' : `Tienes ${freshCount} reconocimientos nuevos`}
              </Link>
            )}
          </>
        }
        aside={<Portrait name={me.name} photo={me.photo} />}
      />

      <dl className={styles.identity}>
        <div>
          <dt>Correo corporativo</dt>
          <dd>
            <a href={`mailto:${me.email}`}>{me.email}</a>
          </dd>
        </div>
        <div>
          <dt>Departamento</dt>
          <dd>{me.department}</dd>
        </div>
        <div>
          <dt>Sede</dt>
          <dd>
            {me.office}
            {OFFICE_LINE[me.office] && <span className={styles.ddSub}>{OFFICE_LINE[me.office]}</span>}
          </dd>
        </div>
        <div>
          <dt>En el campus</dt>
          <dd>
            {ROLE_LABEL[me.role]}
            {viewingAs && (
              <span className={styles.ddSub}>
                <ShieldCheck size={13} aria-hidden="true" /> Viendo la demo como {ROLE_LABEL[me.effectiveRole].toLowerCase()}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Incorporación</dt>
          <dd>{me.startDate ? formatLongDate(me.startDate) : 'No consta'}</dd>
        </div>
      </dl>

      <nav aria-label="Secciones del perfil" className={styles.toc}>
        <ul role="list">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link to={{ hash: `#${s.id}` }} onClick={() => scrollToSection(s.id)}>
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.top}>
        <section id="recorrido" aria-labelledby="h-recorrido" className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 id="h-recorrido" className={styles.cardTitle}>
                Tu recorrido
              </h2>
              <p className={styles.cardLede}>Tu trayectoria, peldaño a peldaño, unida a la de la firma.</p>
            </div>
          </div>
          <Trajectory person={me} />
        </section>
        <AreaProgress summaries={summaries} />
      </div>

      <Mandatory total={mandatory.total} pending={mandatory.pending} hasFormations={formations.length > 0} />

      <FormationsTable groups={groups} />

      <div className={styles.lower}>
        <AttemptsHistory
          rows={attempts}
          next={
            mandatory.pending[0]
              ? { title: mandatory.pending[0].formation.title, to: `/aprender/${mandatory.pending[0].formation.area}/${mandatory.pending[0].formation.slug}` }
              : formations[0]
                ? { title: formations[0].title, to: `/aprender/${formations[0].area}/${formations[0].slug}` }
                : undefined
          }
        />
        <Assessments summaries={assessmentSummaries} />
      </div>

      <section id="reconocimientos" aria-labelledby="h-reconocimientos" className={styles.block}>
        <div className="section-head">
          <div>
            <h2 id="h-reconocimientos" className="section-title">
              Reconocimientos
            </h2>
            <p className={styles.sectionLede}>Trayectoria, aprendizaje y contribución. Sin puntos ni clasificaciones: lo que has hecho, con fecha.</p>
          </div>
          <p className="meta">{badges.length === 1 ? '1 reconocimiento' : `${badges.length} reconocimientos`}</p>
        </div>
        <Recognitions badges={badges} upcoming={upcoming} fresh={fresh} />
      </section>
    </div>
  );
}

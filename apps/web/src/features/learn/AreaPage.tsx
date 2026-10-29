import { ArrowRight, BookOpen, Compass } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { AREAS, formationStatus, isAreaId, type AreaId, type FormationStatus } from '@flm/shared';
import { Avatar, ButtonLink, EmptyState, PageHeader, ProgressRing } from '@/design';
import { useAssessments, useFormations } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { AreaDot, AreaHeadline } from './common/AreaMark';
import { AREA_REFERENCE, areaCounts, bestOf, photoOf, usePerson, useProgressMap } from './common/data';
import { FormationCard } from './common/FormationCard';
import { TenDots } from './common/TenDots';
import styles from './AreaPage.module.css';

/** Estados «en curso»: leída o con el test hecho, todavía sin completar. */
const STARTED: FormationStatus[] = ['leida', 'test-intentado', 'test-superado'];

function ReferencePerson({ area }: { area: AreaId }) {
  const person = usePerson(AREA_REFERENCE[area]);
  if (!person) return null;
  return (
    <figure className={styles.person}>
      <Avatar name={person.name} photo={photoOf(person)} size={64} decorative />
      <figcaption>
        <span className={styles.personLabel}>Persona de referencia</span>
        <span className={styles.personName}>{person.name}</span>
        <span className={styles.personRole}>{person.position}</span>
      </figcaption>
    </figure>
  );
}

function AssessmentCard({ area, allDone }: { area: AreaId; allDone: boolean }) {
  const assessment = useAssessments().find((a) => a.area === area);
  const attempts = useDemo((s) => (assessment ? s.assessmentAttempts[assessment.id] : undefined));
  const best = bestOf(attempts);
  const passed = !!attempts?.some((a) => a.passed);
  const total = assessment?.quiz.questions.length ?? 10;
  const name = AREAS[area].name;
  // Protagonista solo cuando ya no queda ninguna formación pendiente y la evaluación está por superar
  const spot = allDone && !!assessment && !passed;
  return (
    <section
      className={spot ? `${styles.assess} spotlight` : styles.assess}
      data-tone={spot ? 'spot' : undefined}
      aria-labelledby="h-evaluacion"
      data-ready={!!assessment || undefined}
    >
      <div className={styles.assessText}>
        <p className="eyebrow">Evaluación sectorial</p>
        <h2 id="h-evaluacion" className={styles.assessTitle}>
          Pon a prueba tus conocimientos
        </h2>
        <p className={styles.assessLede}>
          {assessment ? assessment.intro : `La evaluación de ${name} está en preparación. Tendrá diez preguntas y se superará con ocho aciertos.`}
        </p>
      </div>
      <div className={styles.assessSide}>
        <TenDots total={total} filled={best?.correct ?? 0} pending={!assessment} />
        <p className={styles.assessStatus}>
          {!assessment
            ? 'En preparación'
            : !best
              ? `${total} preguntas · se supera con ${assessment.quiz.passMark}`
              : passed
                ? `Superada · mejor resultado ${best.correct}/${best.total}`
                : `Aún no · mejor resultado ${best.correct}/${best.total}`}
        </p>
        {assessment && (
          <ButtonLink to={`/aprender/${area}/evaluacion`} variant={spot ? 'inverse' : 'secondary'} iconRight={<ArrowRight />}>
            {best ? 'Volver a intentarlo' : 'Empezar la evaluación'}
          </ButtonLink>
        )}
      </div>
    </section>
  );
}

export default function AreaPage() {
  const { area: param } = useParams();
  const area = isAreaId(param) ? param : undefined;
  usePageTitle(area ? `Área ${AREAS[area].name}` : 'Área no encontrada');
  const formations = useFormations();
  const progress = useProgressMap();
  const list = useMemo(() => (area ? formations.filter((f) => f.area === area) : []), [formations, area]);

  if (!area) {
    return (
      <div className="container page">
        <EmptyState
          icon={<Compass />}
          title={MESSAGES.notFound.title}
          action={
            <ButtonLink to="/aprender" variant="primary">
              Ir a Aprender
            </ButtonLink>
          }
        >
          {MESSAGES.notFound.body}
        </EmptyState>
      </div>
    );
  }

  const info = AREAS[area];
  const { completed, total } = areaCounts(list, progress);
  const statuses = list.map((f) => formationStatus(progress[f.id], f));
  // Siguiente formación: la primera en curso o, si no hay ninguna, la primera sin empezar
  const started = statuses.findIndex((s) => STARTED.includes(s));
  const nextIndex = started >= 0 ? started : statuses.indexOf('sin-empezar');
  const nextKind = started >= 0 ? 'continua' : 'empieza';
  const allDone = statuses.every((s) => s === 'completada');

  // Atmósfera del área como envoltorio a todo el ancho; el contenedor va dentro
  return (
    <div className="area-atmos" data-area={area}>
      <div className="container page">
        <PageHeader
          crumbs={[{ label: 'Aprender', to: '/aprender' }, { label: `Área ${info.name}`, icon: <AreaDot area={area} size={8} /> }]}
          title={<AreaHeadline area={area} />}
          lede={info.description}
          aside={
            <div className={styles.aside}>
              <div className={styles.progress}>
                <ProgressRing value={completed} total={total} size={88} stroke={6} label={`Formaciones completadas en ${info.name}`} tone="area">
                  <span className={styles.ringNum}>
                    {total > 0 ? (
                      <>
                        {completed}
                        <span>/{total}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </span>
                </ProgressRing>
                <p className={styles.progressText}>
                  <strong>Tu itinerario</strong>
                  <span>{total > 0 ? `${completed} de ${total} formaciones completadas` : 'Formaciones en preparación'}</span>
                </p>
              </div>
              <ReferencePerson area={area} />
            </div>
          }
        />

        <section aria-labelledby="h-formaciones">
          <div className={styles.head}>
            <h2 id="h-formaciones" className="section-title">
              Formaciones de <span className="area-word">{info.name}</span>
            </h2>
            <Link to={`/aprender?area=${area}`} className="link-arrow">
              Ver todas las áreas <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {list.length > 0 ? (
            <ol role="list" className={styles.grid}>
              {list.map((f, i) => (
                <li key={f.id} className={styles.gridItem}>
                  <FormationCard formation={f} index={i + 1} status={statuses[i]!} next={i === nextIndex ? nextKind : undefined} />
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={<BookOpen />}
              title="Formaciones en preparación"
              action={
                <ButtonLink to="/consultar/notas" variant="secondary">
                  Ver las notas informativas
                </ButtonLink>
              }
            >
              El área {info.name} está redactando sus formaciones. Aparecerán aquí en cuanto se publiquen; mientras tanto, puedes consultar las notas informativas de la biblioteca.
            </EmptyState>
          )}
        </section>

        <AssessmentCard area={area} allDone={allDone} />
      </div>
    </div>
  );
}

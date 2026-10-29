import { ArrowRight, BookOpen, Compass } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { AREAS, formationStatus, isAreaId, type AreaId } from '@flm/shared';
import { Avatar, ButtonLink, EmptyState, PageHeader, ProgressRing } from '@/design';
import { assessments, useFormations } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { AreaHeadline } from './common/AreaMark';
import { AREA_REFERENCE, areaCounts, bestOf, dueInfo, photoOf, useMyAssignments, usePerson, useProgressMap } from './common/data';
import { FormationCard } from './common/FormationCard';
import { TenDots } from './common/TenDots';
import styles from './AreaPage.module.css';

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

function AssessmentCard({ area }: { area: AreaId }) {
  const assessment = assessments.find((a) => a.area === area);
  const attempts = useDemo((s) => (assessment ? s.assessmentAttempts[assessment.id] : undefined));
  const best = bestOf(attempts);
  const passed = !!attempts?.some((a) => a.passed);
  const total = assessment?.quiz.questions.length ?? 10;
  const name = AREAS[area].name;
  return (
    <section className={styles.assess} aria-labelledby="h-evaluacion" data-ready={!!assessment || undefined}>
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
          <ButtonLink to={`/aprender/${area}/evaluacion`} variant={passed ? 'secondary' : 'primary'} iconRight={<ArrowRight />}>
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
  const mine = useMyAssignments();
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

  return (
    <div className="container page" data-area={area}>
      <PageHeader
        crumbs={[{ label: 'Aprender', to: '/aprender' }, { label: `Área ${info.name}` }]}
        title={<AreaHeadline area={area} />}
        lede={info.description}
        aside={
          <div className={styles.aside}>
            <div className={styles.progress}>
              <ProgressRing value={completed} total={total} size={88} stroke={6} label={`Formaciones completadas en ${info.name}`}>
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
            Formaciones del área
          </h2>
          <Link to={`/aprender?area=${area}`} className="link-arrow">
            Ver todas las áreas <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {list.length > 0 ? (
          <ol role="list" className={styles.grid}>
            {list.map((f, i) => {
              const status = formationStatus(progress[f.id], f);
              const a = mine.find((m) => m.formation.id === f.id)?.assignment;
              return (
                <li key={f.id} className={styles.gridItem}>
                  <FormationCard formation={f} index={i + 1} status={status} due={a?.dueDate && status !== 'completada' ? dueInfo(a.dueDate) : undefined} />
                </li>
              );
            })}
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

      <AssessmentCard area={area} />
    </div>
  );
}

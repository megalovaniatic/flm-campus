import { ArrowRight, BookOpen, ClipboardCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { AREAS, currentAttempts, formationStatus, isAreaId, type Formation, type GradeResult } from '@flm/shared';
import { ButtonLink, EmptyState, Notice, StatusGlyph } from '@/design';
import { useByline, useFormations } from '@/data/selectors';
import { now, uid, useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { Escalon } from '@/motion/Escalon';
import { bestOf, formationPath, nextFormation, photoOf, sectionForRef, toSections, useLearnFormation } from './common/data';
import { QuizEngine, RetryButton, ReviewButton, type ResultApi } from './quiz/QuizEngine';
import { QuizHeader } from './quiz/QuizHeader';
import styles from './QuizPage.module.css';

function FormationQuiz({ f, isSample }: { f: Formation; isSample: boolean }) {
  // Firma de las notas al margen: la persona autora con su puesto («Judith Calet — Asesora Contable»)
  // o, sin ella (perfil eliminado), «Área … de FLM».
  const byline = useByline(f.editorial.authorId, { type: 'test', area: f.area });
  const progress = useDemo((s) => s.progress[f.id]);
  const allProgress = useDemo((s) => s.progress);
  const addAttempt = useDemo((s) => s.addAttempt);
  const formations = useFormations();
  const sections = useMemo(() => toSections(f.blocks), [f.blocks]);
  // Estado al empezar: «El escalón» solo se reproduce si esta vez se completa la formación.
  const [wasCompleted] = useState(() => formationStatus(progress, f) === 'completada');
  const read = !!progress?.readAt && progress.readVersion === f.version;
  const status = formationStatus(progress, f);
  const best = bestOf(currentAttempts(progress, f));
  const next = isSample ? undefined : nextFormation(f, formations, allProgress);
  const area = AREAS[f.area];
  const base = formationPath(f);

  const refHref = (ref: string) => {
    const s = sectionForRef(sections, ref);
    return s ? `${base}?apartado=${encodeURIComponent(s.id)}` : undefined;
  };

  const renderResult = (g: GradeResult, firstView: boolean) => (
    <>
      {g.passed && read && (
        <>
          <div className={styles.escalon}>
            <Escalon read passed play={firstView && !wasCompleted} />
          </div>
          <p className={styles.resultText}>
            {wasCompleted ? 'Ya tenías esta formación completada y has vuelto a superar el test.' : 'Lectura confirmada y test superado: has completado la formación. La verás así en tu perfil.'}
          </p>
        </>
      )}
      {g.passed && !read && (
        <Notice tone="info" title="Te falta confirmar la lectura">
          Has superado el test. Para completar la formación, ve al final de la lectura y pulsa «Marcar la lectura como terminada».
        </Notice>
      )}
      {!g.passed && (
        <p className={styles.resultText}>
          Necesitas {f.quiz.passMark} aciertos de {g.total}. Revisa tus respuestas, repasa los apartados que indica cada nota y vuelve a intentarlo cuando quieras.
        </p>
      )}
      <p className={styles.saved}>
        Intento guardado en tu historial.
        {__DEMO__ ? ` ${MESSAGES.demoSimulated}` : ''}
      </p>
    </>
  );

  const nextLink = (variant: 'primary' | 'ghost') =>
    next ? (
      <ButtonLink to={formationPath(next)} variant={variant} iconRight={<ArrowRight />}>
        Siguiente formación
      </ButtonLink>
    ) : variant === 'primary' ? (
      <ButtonLink to={`/aprender/${f.area}`} variant="primary" iconRight={<ArrowRight />}>
        Volver al área {area.name}
      </ButtonLink>
    ) : null;

  const resultActions = (g: GradeResult, api: ResultApi) => {
    if (g.passed && read) {
      return (
        <>
          {nextLink('primary')}
          <RetryButton api={api} />
          <ReviewButton api={api} />
        </>
      );
    }
    if (g.passed) {
      return (
        <>
          <ButtonLink to={`${base}?apartado=terminar`} variant="primary" icon={<BookOpen />}>
            Ir al final de la formación
          </ButtonLink>
          <ReviewButton api={api} variant="secondary" />
          {nextLink('ghost')}
        </>
      );
    }
    return (
      <>
        <RetryButton api={api} variant="primary" />
        <ButtonLink to={base} variant="secondary" icon={<BookOpen />}>
          Repasar la formación
        </ButtonLink>
        <ReviewButton api={api} />
        {nextLink('ghost')}
      </>
    );
  };

  return (
    <div className="container page" data-area={f.area}>
      <QuizHeader
        crumbs={[{ label: 'Aprender', to: '/aprender' }, { label: `Área ${area.name}`, to: `/aprender/${f.area}` }, { label: f.title, to: base }, { label: 'Test final' }]}
        eyebrow={<>Test final{isSample ? ' · Muestra de desarrollo' : ''}</>}
        title={f.title}
        meta={`${f.quiz.questions.length} preguntas · se supera con ${f.quiz.passMark} aciertos · corrección al momento`}
        aside={
          <div className={styles.status}>
            <StatusGlyph status={status} />
            {best && (
              <span className={styles.best}>
                Mejor resultado: {best.correct}/{best.total}
              </span>
            )}
          </div>
        }
      />
      <QuizEngine
        quiz={f.quiz}
        variant="circles"
        signature={byline.kind === 'persona' ? { name: byline.person.name, role: byline.person.position, photo: photoOf(byline.person) } : { name: byline.name, area: f.area }}
        refHref={refHref}
        onFinish={(g, answers) => addAttempt(f.id, { id: uid(), quizId: f.quiz.id, version: f.version, at: now(), answers, correct: g.correct, total: g.total, passed: g.passed })}
        renderResult={renderResult}
        resultActions={resultActions}
      />
    </div>
  );
}

export default function QuizPage() {
  const { area, slug } = useParams();
  const { formation, isSample } = useLearnFormation(area, slug);
  usePageTitle(formation ? `Test final · ${formation.title}` : 'Test no encontrado');
  if (!formation) {
    const valid = isAreaId(area) ? area : undefined;
    return (
      <div className="container page">
        <EmptyState
          icon={<ClipboardCheck />}
          title={MESSAGES.notFound.title}
          action={
            <>
              {valid && (
                <ButtonLink to={`/aprender/${valid}`} variant="primary">
                  Ver las formaciones de {AREAS[valid].name}
                </ButtonLink>
              )}
              <ButtonLink to="/aprender" variant={valid ? 'secondary' : 'primary'}>
                Ir a Aprender
              </ButtonLink>
            </>
          }
        >
          {MESSAGES.notFound.body}
        </EmptyState>
      </div>
    );
  }
  return <FormationQuiz key={formation.id} f={formation} isSample={isSample} />;
}

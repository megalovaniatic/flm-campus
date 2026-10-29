import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ClipboardCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { AREAS, isAreaId, type AreaId, type GradeResult, type QuizAttempt, type SectorAssessment } from '@flm/shared';
import { Button, ButtonLink, EmptyState } from '@/design';
import { now, uid, useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { AreaDot, AreaSeal } from './common/AreaMark';
import { bestOf, useAreaAssessment } from './common/data';
import { TenDots } from './common/TenDots';
import { QuizEngine, RetryButton, ReviewButton, type ResultApi } from './quiz/QuizEngine';
import { QuizHeader } from './quiz/QuizHeader';
import styles from './QuizPage.module.css';

function Intro({ a, best, isSample, onStart }: { a: SectorAssessment; best: QuizAttempt | undefined; isSample: boolean; onStart: () => void }) {
  const total = a.quiz.questions.length;
  const name = AREAS[a.area].name;
  return (
    <section className={styles.intro} aria-label="Antes de empezar">
      <div className={styles.introText}>
        <p className={styles.introLede}>{a.intro}</p>
        <ul role="list" className={styles.rules}>
          <li>
            <strong>{total} preguntas</strong>, una por pantalla.
          </li>
          <li>
            Se supera con <strong>{a.quiz.passMark} aciertos</strong>.
          </li>
          <li>Corrección al momento, con la explicación de cada respuesta.</li>
          <li>Puedes repetirla: al volver a intentarlo cambia el orden de preguntas y opciones.</li>
        </ul>
      </div>
      {/* Protagonista: la meta, con el sello sobre placa clara y la acción dentro */}
      <aside className={`${styles.introSide} spotlight`} aria-labelledby="meta-eval">
        <p id="meta-eval" className={styles.sideKicker}>
          Lo que consigues
        </p>
        <div className={`spotlight-plate ${styles.sealPlate}`}>
          <AreaSeal area={a.area} height={40} />
        </div>
        <p className={styles.sideGoal}>
          {isSample
            ? `Supera ${a.quiz.passMark} de ${total}. Es una muestra de desarrollo: el reconocimiento «Evaluación ${name} superada» no se añade a tu perfil.`
            : `Supera ${a.quiz.passMark} de ${total} y el reconocimiento «Evaluación ${name} superada» se añade a tu perfil.`}
        </p>
        <TenDots total={total} filled={best?.correct ?? 0} />
        <p className={styles.introBest}>{best ? `Tu mejor resultado: ${best.correct}/${best.total}${best.passed ? ' · superada' : ''}` : 'Aún no la has intentado.'}</p>
        <Button variant="inverse" block iconRight={<ArrowRight />} onClick={onStart}>
          {best ? 'Volver a intentarlo' : 'Empezar la evaluación'}
        </Button>
      </aside>
    </section>
  );
}

/** Sello del área al superar: cápsula oficial (Fiscal, Laboral, Mercantil) o anillo degradado (Contable). */
function SealResult({ area, play, wasPassed, isSample }: { area: AreaId; play: boolean; wasPassed: boolean; isSample: boolean }) {
  const reduce = useReducedMotionPref();
  const name = AREAS[area].name;
  const stamp = play && !reduce;
  return (
    <div className={styles.sealBox}>
      <motion.div
        className={styles.seal}
        initial={stamp ? { opacity: 0, scale: 1.16 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 24, delay: 0.55 }}
      >
        <AreaSeal area={area} height={46} />
      </motion.div>
      <div className={styles.sealText}>
        <p className={styles.sealTitle}>Reconocimiento: Evaluación {name} superada</p>
        <p className={styles.sealNote}>
          {isSample
            ? 'Muestra de desarrollo: este resultado no se añade a tu perfil.'
            : wasPassed
              ? 'Ya tenías este reconocimiento; tu perfil muestra siempre tu mejor resultado.'
              : 'Se añade a los reconocimientos de tu perfil.'}
        </p>
      </div>
    </div>
  );
}

function AssessmentRun({ a, isSample }: { a: SectorAssessment; isSample: boolean }) {
  const attempts = useDemo((s) => s.assessmentAttempts[a.id]);
  const add = useDemo((s) => s.addAssessmentAttempt);
  const [wasPassed] = useState(() => !!attempts?.some((x) => x.passed));
  const best = bestOf(attempts);
  const area = AREAS[a.area];
  const total = a.quiz.questions.length;

  const renderResult = (g: GradeResult, firstView: boolean) => (
    <>
      {g.passed ? (
        <SealResult area={a.area} play={firstView} wasPassed={wasPassed} isSample={isSample} />
      ) : (
        <p className={styles.resultText}>
          Necesitas {a.quiz.passMark} aciertos de {g.total}. Revisa tus respuestas, repasa las formaciones del área y vuelve a intentarlo cuando quieras.
        </p>
      )}
      <p className={styles.saved}>
        Intento guardado en tu historial.
        {__DEMO__ ? ` ${MESSAGES.demoSimulated}` : ''}
      </p>
    </>
  );

  const resultActions = (g: GradeResult, api: ResultApi) =>
    g.passed ? (
      <>
        <ButtonLink to={isSample ? `/aprender/${a.area}` : '/perfil'} variant="primary" icon={isSample ? <BookOpen /> : <UserRound />}>
          {isSample ? `Volver al área ${area.name}` : 'Ver tu perfil'}
        </ButtonLink>
        <RetryButton api={api} />
        <ReviewButton api={api} />
      </>
    ) : (
      <>
        <RetryButton api={api} variant="primary" />
        <ButtonLink to={`/aprender/${a.area}`} variant="secondary" icon={<BookOpen />}>
          Repasar las formaciones
        </ButtonLink>
        <ReviewButton api={api} />
      </>
    );

  // Atmósfera del área como envoltorio a todo el ancho; el contenedor va dentro
  return (
    <div className="area-atmos" data-area={a.area}>
      <div className="container page">
        <QuizHeader
          crumbs={[{ label: 'Aprender', to: '/aprender' }, { label: `Área ${area.name}`, to: `/aprender/${a.area}`, icon: <AreaDot area={a.area} size={8} /> }, { label: 'Evaluación' }]}
          eyebrow={
            <>
              <AreaDot area={a.area} size={9} />
              <span>
                Evaluación sectorial · {area.name}
                {isSample ? ' · Muestra de desarrollo' : ''}
              </span>
            </>
          }
          title={a.title}
          meta={`${total} preguntas · se supera con ${a.quiz.passMark} aciertos`}
        />
        <QuizEngine
          quiz={a.quiz}
          variant="points"
          passedLabel="Superada"
          signature={{ name: `Área ${area.name} de FLM`, role: 'Evaluación sectorial', area: a.area }}
          intro={(start) => <Intro a={a} best={best} isSample={isSample} onStart={start} />}
          onFinish={(g, answers) => add(a.id, { id: uid(), quizId: a.quiz.id, version: 1, at: now(), answers, correct: g.correct, total: g.total, passed: g.passed })}
          renderResult={renderResult}
          resultActions={resultActions}
        />
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const { area } = useParams();
  const [params] = useSearchParams();
  const valid = isAreaId(area) ? area : undefined;
  const { assessment, isSample } = useAreaAssessment(area, params.get('muestra') === '1');
  usePageTitle(valid ? `Pon a prueba tus conocimientos · ${AREAS[valid].name}` : 'Evaluación no encontrada');

  if (!valid) {
    return (
      <div className="container page">
        <EmptyState
          icon={<ClipboardCheck />}
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

  if (!assessment) {
    const name = AREAS[valid].name;
    return (
      <div className="area-atmos" data-area={valid}>
        <div className="container page">
          <QuizHeader
            crumbs={[{ label: 'Aprender', to: '/aprender' }, { label: `Área ${name}`, to: `/aprender/${valid}`, icon: <AreaDot area={valid} size={8} /> }, { label: 'Evaluación' }]}
            eyebrow={
              <>
                <AreaDot area={valid} size={9} />
                <span>Evaluación sectorial · {name}</span>
              </>
            }
            title="Pon a prueba tus conocimientos"
          />
          <EmptyState
            icon={<ClipboardCheck />}
            title="Evaluación en preparación"
            action={
              <ButtonLink to={`/aprender/${valid}`} variant="primary" iconRight={<ArrowRight />}>
                Ver las formaciones de {name}
              </ButtonLink>
            }
          >
            El área {name} está preparando su evaluación: diez preguntas que se superan con ocho aciertos. Mientras tanto, puedes completar las formaciones del área.
          </EmptyState>
        </div>
      </div>
    );
  }

  return <AssessmentRun key={assessment.id} a={assessment} isSample={isSample} />;
}

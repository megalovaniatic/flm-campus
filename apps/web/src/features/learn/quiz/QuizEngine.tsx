import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, ListChecks, RotateCcw } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode, type Ref } from 'react';
import { Link, useBlocker } from 'react-router';
import { gradeQuiz, type AreaId, type GradeResult, type Quiz, type QuizQuestion } from '@flm/shared';
import { Avatar, Button, Dialog, type ButtonVariant } from '@/design';
import { Rich } from '@/lib/rich';
import { useReducedMotionPref } from '@/lib/preferences';
import { AreaDot } from '../common/AreaMark';
import { letter, shuffle } from '../common/util';
import { ProofDots } from './ProofDots';
import styles from './QuizEngine.module.css';

/** Quién firma las notas al margen: la autoría de la formación (o el área, en la evaluación). */
export interface Signature {
  name: string;
  role?: string;
  photo?: string;
  /** Si no hay una persona autora, se firma con el área (punto + nombre). */
  area?: AreaId;
}

export interface QuizEngineProps {
  quiz: Quiz;
  variant: 'circles' | 'points';
  signature: Signature;
  /** Guarda el intento (una vez por intento, al terminar la última pregunta). */
  onFinish: (grade: GradeResult, answers: Record<string, string>) => void;
  /** Contenido propio del resultado: «El escalón», el sello del área, avisos… */
  renderResult: (grade: GradeResult, firstView: boolean) => ReactNode;
  /**
   * Botones del resultado, en el orden que decida cada pantalla («Siguiente formación», «Repasar»…).
   * Recibe las acciones del motor: volver a intentarlo (baraja preguntas y opciones) y revisar respuestas.
   */
  resultActions?: (grade: GradeResult, api: ResultApi) => ReactNode;
  /** Enlace de «Repasa: …» en la revisión de respuestas. */
  refHref?: (ref: string) => string | undefined;
  /** Pantalla previa (evaluación sectorial). */
  intro?: (start: () => void) => ReactNode;
  passedLabel?: string;
}

export interface ResultApi {
  retry: () => void;
  review: () => void;
}

type Phase = 'intro' | 'question' | 'result' | 'review';
type Mark = 'idle' | 'selected' | 'correct' | 'wrong' | 'other';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Marcas de corrección ────────────────────────────────────────────── */

/** Anillo abierto de corrector, trazado a mano alrededor de la opción errónea elegida. */
function OpenRing({ animated }: { animated: boolean }) {
  const reduce = useReducedMotionPref();
  return (
    <svg className={styles.ring} viewBox="0 0 48 48" aria-hidden="true">
      <motion.path
        d="M33 7.2c8.6 3.6 12.6 13.3 9.2 22.2-3.5 9.2-13.9 14.3-23.3 11.3C9.4 37.7 3.8 27.8 6.4 18.4 8.6 10.4 16.4 4.7 24.7 5.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={animated && !reduce ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1], delay: 0.05 }}
      />
    </svg>
  );
}

function markOf(q: QuizQuestion, optionId: string, chosen: string | undefined, checked: boolean): Mark {
  if (!checked) return chosen === optionId ? 'selected' : 'idle';
  if (optionId === q.correctOptionId) return 'correct';
  if (optionId === chosen) return 'wrong';
  return 'other';
}

function Signed({ signature }: { signature: Signature }) {
  return (
    <p className={styles.signature}>
      {signature.area && !signature.photo ? (
        <span className={styles.sigDot}>
          <AreaDot area={signature.area} size={12} />
        </span>
      ) : (
        <Avatar name={signature.name} photo={signature.photo} size={30} decorative />
      )}
      <span>
        <span className={styles.sigName}>— {signature.name}</span>
        {signature.role && <span className={styles.sigRole}>{signature.role}</span>}
      </span>
    </p>
  );
}

/** Nota al margen firmada: «Por qué no», «La respuesta correcta es…», «Repasa». */
function MarginNote({ q, chosen, signature, refHref, noteRef, titleId }: { q: QuizQuestion; chosen: string | undefined; signature: Signature; refHref?: string; noteRef?: Ref<HTMLDivElement>; titleId: string }) {
  const ok = chosen === q.correctOptionId;
  const wrong = q.options.find((o) => o.id === chosen && o.id !== q.correctOptionId);
  const correctIndex = q.options.findIndex((o) => o.id === q.correctOptionId);
  return (
    <div ref={noteRef} tabIndex={-1} role="group" aria-labelledby={titleId} className={styles.note} data-ok={ok || undefined}>
      <p id={titleId} className={styles.noteVerdict}>
        <span className={styles.noteGlyph} aria-hidden="true">
          {ok ? <Check size={14} strokeWidth={3} /> : null}
        </span>
        {ok ? 'Correcto' : chosen ? 'No es correcto' : 'Sin responder'}
      </p>
      {wrong?.feedback && (
        <p className={styles.noteLine}>
          <span className={styles.noteLabel}>Por qué no:</span> <Rich text={wrong.feedback} />
        </p>
      )}
      <p className={styles.noteLine}>
        <span className={styles.noteLabel}>La respuesta correcta es la {letter(correctIndex)}:</span> <Rich text={q.explanation} />
      </p>
      {q.ref && (
        <p className={styles.noteRef}>
          <span className={styles.noteLabel}>Repasa:</span>{' '}
          {refHref ? (
            <Link to={refHref} className={styles.noteLink}>
              {q.ref}
            </Link>
          ) : (
            q.ref
          )}
        </p>
      )}
      <Signed signature={signature} />
    </div>
  );
}

/* ── Una pregunta ────────────────────────────────────────────────────── */

interface QuestionProps {
  q: QuizQuestion;
  index: number;
  total: number;
  round: number;
  chosen: string | undefined;
  checked: boolean;
  error: string;
  autoFocus: boolean;
  signature: Signature;
  onChoose: (optionId: string) => void;
  onSubmit: (e: FormEvent) => void;
}

function QuestionView({ q, index, total, round, chosen, checked, error, autoFocus, signature, onChoose, onSubmit }: QuestionProps) {
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const errorId = useId();
  const noteTitleId = useId();
  const reduce = useReducedMotionPref();
  const last = index === total - 1;

  useEffect(() => {
    if (autoFocus) fieldsetRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  useEffect(() => {
    if (checked) noteRef.current?.focus({ preventScroll: false });
  }, [checked]);

  return (
    <motion.form
      className={styles.question}
      onSubmit={onSubmit}
      noValidate
      initial={{ opacity: 0, x: reduce ? 0 : 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduce ? 0 : -28 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <div className={styles.numberCol} aria-hidden="true">
        <span className={styles.bigNumber}>
          <motion.span initial={{ y: reduce ? 0 : '40%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, ease: EASE, delay: 0.05 }}>
            {index + 1}
          </motion.span>
        </span>
      </div>

      <div className={styles.mainCol}>
        <fieldset ref={fieldsetRef} tabIndex={-1} className={styles.fieldset} disabled={checked} aria-describedby={error ? errorId : undefined}>
          <legend className={styles.legend}>
            <span className="sr-only">
              Pregunta {index + 1} de {total}:{' '}
            </span>
            <span className={styles.prompt}>
              <Rich text={q.prompt} />
            </span>
          </legend>
          <div className={styles.options}>
            {q.options.map((o, i) => {
              const mark = markOf(q, o.id, chosen, checked);
              return (
                <label key={o.id} className={styles.option} data-mark={mark}>
                  <span className={styles.radioWrap}>
                    <input
                      type="radio"
                      className={styles.radio}
                      name={`q-${round}-${q.id}`}
                      value={o.id}
                      checked={chosen === o.id}
                      onChange={() => onChoose(o.id)}
                    />
                    {mark === 'wrong' && <OpenRing animated />}
                  </span>
                  <span className={styles.optLetter}>
                    {letter(i)}
                    <span className="sr-only">.</span>
                  </span>
                  <span className={styles.optText}>
                    <span className={styles.ink}>
                      <Rich text={o.text} />
                    </span>
                    {mark === 'correct' && <span className="sr-only"> (respuesta correcta)</span>}
                    {mark === 'wrong' && <span className="sr-only"> (tu respuesta: incorrecta)</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" size="lg" iconRight={checked ? <ArrowRight /> : undefined}>
            {!checked ? 'Comprobar' : last ? 'Ver el resultado' : 'Siguiente pregunta'}
          </Button>
          {error && (
            <p id={errorId} className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className={styles.noteCol}>
        <AnimatePresence>
          {checked && (
            <motion.div initial={{ opacity: 0, x: reduce ? 0 : 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.32, ease: EASE, delay: 0.12 }}>
              <MarginNote q={q} chosen={chosen} signature={signature} noteRef={noteRef} titleId={noteTitleId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}

/* ── Resultado y revisión ───────────────────────────────────────────── */

function ResultView({ grade, passedLabel, children, actions, firstView }: { grade: GradeResult; passedLabel: string; children: ReactNode; actions: ReactNode; firstView: boolean }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const reduce = useReducedMotionPref();
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    title.focus({ preventScroll: true });
    // El resultado sustituye a la última pregunta, que solía estar desplazada: si la cifra
    // quedaría bajo la cabecera fija o fuera de la vista, se trae el resultado entero a la vista.
    const top = title.getBoundingClientRect().top;
    if (top < 96 || top > window.innerHeight * 0.6) sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }, []);
  const rise = (delay: number) => (firstView && !reduce ? { initial: { y: '105%' }, animate: { y: '0%' }, transition: { duration: 0.6, ease: EASE, delay } } : {});
  return (
    <motion.section ref={sectionRef} className={styles.result} aria-labelledby={titleId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
      <p className={styles.resultKicker}>Resultado</p>
      <h2 id={titleId} ref={titleRef} tabIndex={-1} className={styles.resultTitle}>
        <span className={styles.score} aria-hidden="true">
          <span className={styles.mask}>
            <motion.span {...rise(0.05)}>{grade.correct}</motion.span>
          </span>
          <span className={styles.mask}>
            <motion.span className={styles.slash} {...rise(0.12)}>
              /{grade.total}
            </motion.span>
          </span>
        </span>
        <span className="sr-only">
          {grade.correct} de {grade.total} aciertos.{' '}
        </span>
        <motion.span className={styles.verdict} initial={firstView ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: firstView ? 0.45 : 0 }}>
          {grade.passed ? passedLabel : 'Aún no'}
        </motion.span>
      </h2>
      <div className={styles.resultBody}>{children}</div>
      <div className={styles.resultActions}>{actions}</div>
    </motion.section>
  );
}

/** Botones estándar del resultado: cada pantalla decide su orden y cuál es el principal. */
export function RetryButton({ api, variant = 'secondary' }: { api: ResultApi; variant?: ButtonVariant }) {
  return (
    <Button variant={variant} icon={<RotateCcw />} onClick={api.retry}>
      Volver a intentarlo
    </Button>
  );
}

export function ReviewButton({ api, variant = 'ghost' }: { api: ResultApi; variant?: ButtonVariant }) {
  return (
    <Button variant={variant} icon={<ListChecks />} onClick={api.review}>
      Revisar respuestas
    </Button>
  );
}

function DefaultActions({ grade, api }: { grade: GradeResult; api: ResultApi }) {
  return (
    <>
      <RetryButton api={api} variant={grade.passed ? 'secondary' : 'primary'} />
      <ReviewButton api={api} />
    </>
  );
}

function ReviewView({ order, answers, signature, refHref, onBack }: { order: QuizQuestion[]; answers: Record<string, string>; signature: Signature; refHref?: (ref: string) => string | undefined; onBack: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: false });
  }, []);
  return (
    <motion.section className={styles.review} aria-labelledby="revision-t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
      <div className={styles.reviewHead}>
        <h2 id="revision-t" ref={titleRef} tabIndex={-1} className={styles.reviewTitle}>
          Revisión de tus respuestas
        </h2>
        <Button variant="secondary" icon={<ArrowLeft />} onClick={onBack}>
          Volver al resultado
        </Button>
      </div>
      <ol role="list" className={styles.reviewList}>
        {order.map((q, qi) => {
          const chosen = answers[q.id];
          return (
            <li key={q.id} className={styles.reviewItem}>
              <div className={styles.reviewMain}>
                <p className={styles.qCount}>Pregunta {qi + 1}</p>
                <h3 className={styles.reviewPrompt}>
                  <Rich text={q.prompt} />
                </h3>
                <ul role="list" className={styles.options}>
                  {q.options.map((o, i) => {
                    const mark = markOf(q, o.id, chosen, true);
                    return (
                      <li key={o.id} className={`${styles.option} ${styles.static}`} data-mark={mark}>
                        <span className={styles.radioWrap} aria-hidden="true">
                          <span className={styles.radio} />
                          {mark === 'wrong' && <OpenRing animated={false} />}
                        </span>
                        <span className={styles.optLetter}>
                          {letter(i)}
                          <span className="sr-only">.</span>
                        </span>
                        <span className={styles.optText}>
                          <span className={styles.ink}>
                            <Rich text={o.text} />
                          </span>
                          {mark === 'correct' && <span className="sr-only"> (respuesta correcta{chosen === o.id ? ', la que elegiste' : ''})</span>}
                          {mark === 'wrong' && <span className="sr-only"> (tu respuesta: incorrecta)</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <MarginNote q={q} chosen={chosen} signature={signature} refHref={q.ref ? refHref?.(q.ref) : undefined} titleId={`revision-${q.id}`} />
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
}

/* ── Motor ───────────────────────────────────────────────────────────── */

/**
 * «Pruebas de imprenta»: una pregunta por pantalla con fieldset/legend y radios nativos.
 * Al comprobar, la opción errónea elegida se tacha con un anillo abierto y la correcta se subraya;
 * la nota al margen, firmada, explica por qué. El foco pasa a la nota y se anuncia el resultado.
 */
export function QuizEngine({ quiz, variant, signature, onFinish, renderResult, resultActions, refHref, intro, passedLabel = 'Superado' }: QuizEngineProps) {
  const [phase, setPhase] = useState<Phase>(intro ? 'intro' : 'question');
  const [round, setRound] = useState(0);
  const order = useMemo(() => (round === 0 ? quiz.questions : shuffle(quiz.questions).map((q) => ({ ...q, options: shuffle(q.options) }))), [quiz, round]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [live, setLive] = useState('');
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [firstView, setFirstView] = useState(true);
  const [moved, setMoved] = useState(false);

  const q = order[index];
  const total = order.length;
  const results = order.map((x) => (answers[x.id] === undefined ? undefined : answers[x.id] === x.correctOptionId));

  // Si sales a mitad del test, te avisamos: el intento solo se guarda al terminar.
  const inProgress = phase === 'question' && Object.keys(answers).length > 0;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => inProgress && currentLocation.pathname !== nextLocation.pathname);

  const start = () => {
    setMoved(true);
    setPhase('question');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!q) return;
    if (!checked) {
      if (!selected) {
        setError('Elige una respuesta para comprobarla.');
        return;
      }
      setError('');
      setAnswers((a) => ({ ...a, [q.id]: selected }));
      setChecked(true);
      const ok = selected === q.correctOptionId;
      const L = letter(q.options.findIndex((o) => o.id === q.correctOptionId));
      setLive(ok ? `Correcto. Pregunta ${index + 1} de ${total}.` : `No es correcto. La respuesta correcta es la ${L}.`);
      return;
    }
    if (index < total - 1) {
      setMoved(true);
      setIndex((i) => i + 1);
      setSelected(undefined);
      setChecked(false);
      setLive('');
      return;
    }
    const g = gradeQuiz(quiz, answers);
    setGrade(g);
    setFirstView(true);
    onFinish(g, answers);
    setPhase('result');
    setLive(`Resultado: ${g.correct} de ${g.total} aciertos. ${g.passed ? passedLabel : 'Aún no superado'}.`);
  };

  const retry = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setAnswers({});
    setSelected(undefined);
    setChecked(false);
    setError('');
    setGrade(null);
    setMoved(true);
    setPhase('question');
    setLive('Nuevo intento: preguntas y opciones en otro orden.');
  };

  const api: ResultApi = {
    retry,
    review: () => {
      setFirstView(false);
      setPhase('review');
    },
  };

  const showCounter = phase === 'question' && !!q;

  return (
    <div className={styles.engine}>
      {phase !== 'intro' && (
        <div className={styles.topbar}>
          <p className={styles.counter}>
            {showCounter ? (
              <>
                Pregunta <strong>{index + 1}</strong> de {total}
              </>
            ) : phase === 'review' ? (
              'Revisión'
            ) : (
              'Resultado'
            )}
          </p>
          <ProofDots total={total} current={index} results={results} variant={variant} />
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'intro' && intro && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {intro(start)}
          </motion.div>
        )}
        {phase === 'question' && q && (
          <QuestionView
            key={`${round}-${q.id}`}
            q={q}
            index={index}
            total={total}
            round={round}
            chosen={checked ? answers[q.id] : selected}
            checked={checked}
            error={error}
            autoFocus={moved}
            signature={signature}
            onChoose={(id) => {
              setSelected(id);
              setError('');
            }}
            onSubmit={onSubmit}
          />
        )}
        {phase === 'result' && grade && (
          <ResultView key={`result-${round}`} grade={grade} passedLabel={passedLabel} firstView={firstView} actions={resultActions ? resultActions(grade, api) : <DefaultActions grade={grade} api={api} />}>
            {renderResult(grade, firstView)}
          </ResultView>
        )}
        {phase === 'review' && (
          <ReviewView key={`review-${round}`} order={order} answers={answers} signature={signature} refHref={refHref} onBack={() => setPhase('result')} />
        )}
      </AnimatePresence>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>

      <Dialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="¿Salir del test?"
        description="Tu intento solo se guarda al terminar la última pregunta. Si sales ahora, perderás las respuestas de este intento."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => blocker.proceed?.()}>
              Salir sin guardar
            </Button>
            <Button variant="primary" data-autofocus onClick={() => blocker.reset?.()}>
              Seguir con el test
            </Button>
          </>
        }
      />
    </div>
  );
}

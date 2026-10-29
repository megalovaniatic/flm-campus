import { motion } from 'motion/react';
import { CircleCheck, CircleX, RotateCcw, Scale } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { TruthCard, WidgetSpec } from '@flm/shared';
import { Button } from '@/design';
import { RichParagraphs } from '@/lib/rich';
import { Frame, useTransition } from './ui';
import styles from './TarjetasVerdad.module.css';

type Spec = Extract<WidgetSpec, { kind: 'tarjetas-verdad' }>;
type Verdict = TruthCard['verdict'];
type Answer = Verdict | 'ver';

const VERDICT: Record<Verdict, { label: string; icon: ReactNode }> = {
  verdadero: { label: 'Verdadero', icon: <CircleCheck size={18} /> },
  falso: { label: 'Falso', icon: <CircleX size={18} /> },
  depende: { label: 'Depende', icon: <Scale size={18} /> },
};

const ORDER: Verdict[] = ['verdadero', 'falso', 'depende'];

export function TarjetasVerdad({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const n = spec.cards.length;
  const answered = Object.keys(answers).length;
  const guesses = Object.entries(answers).filter(([, a]) => a !== 'ver');
  const correct = guesses.filter(([i, a]) => a === spec.cards[Number(i)]?.verdict).length;

  const score =
    answered === 0
      ? `${n} afirmaciones. Decide antes de mirar.`
      : `Has respondido ${answered} de ${n}${guesses.length ? ` · ${correct} ${correct === 1 ? 'acierto' : 'aciertos'} de ${guesses.length} ${guesses.length === 1 ? 'intento' : 'intentos'}` : ''}.`;

  return (
    <Frame
      kind="Verdadero, falso o depende"
      title={spec.title ?? '¿Verdadero, falso o depende?'}
      intro="Elige tu respuesta en cada tarjeta y descubre la explicación. Si prefieres, mira directamente la respuesta."
      headingLevel={headingLevel}
      actions={
        answered > 0 ? (
          <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={() => setAnswers({})}>
            Volver a empezar
          </Button>
        ) : undefined
      }
    >
      <p className={styles.score} aria-live="polite">
        {score}
      </p>
      <ul className={styles.grid} role="list">
        {spec.cards.map((card, i) => (
          <TruthCardView key={i} card={card} index={i} answer={answers[i]} onAnswer={(a) => setAnswers((s) => ({ ...s, [i]: a }))} />
        ))}
      </ul>
    </Frame>
  );
}

function TruthCardView({ card, index, answer, onAnswer }: { card: TruthCard; index: number; answer?: Answer; onAnswer: (a: Answer) => void }) {
  const { t, spring, reduce } = useTransition();
  const resultRef = useRef<HTMLParagraphElement>(null);
  const revealed = answer !== undefined;
  const guessed = answer && answer !== 'ver' ? answer : null;
  const right = guessed === card.verdict;
  const wasRevealed = useRef(revealed);

  useEffect(() => {
    if (revealed && !wasRevealed.current) resultRef.current?.focus();
    wasRevealed.current = revealed;
  }, [revealed]);

  return (
    <li className={styles.card} data-verdict={revealed ? card.verdict : undefined}>
      <p className={styles.num}>Afirmación {index + 1}</p>
      <p className={styles.claim}>«{card.claim}»</p>
      {!revealed ? (
        <div className={styles.answer}>
          <div className={styles.choices} role="group" aria-label={`Tu respuesta a la afirmación ${index + 1}`}>
            {ORDER.map((v) => (
              <button key={v} type="button" className={styles.choice} onClick={() => onAnswer(v)}>
                {VERDICT[v].label}
              </button>
            ))}
          </div>
          <button type="button" className={styles.reveal} onClick={() => onAnswer('ver')}>
            Ver la respuesta
          </button>
        </div>
      ) : (
        <motion.div className={styles.result} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t(0.3)}>
          <motion.p ref={resultRef} tabIndex={-1} className={styles.stamp} data-verdict={card.verdict} initial={reduce ? false : { scale: 0.6, opacity: 0, rotate: -5 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={spring(520, 26)}>
            <span aria-hidden="true">{VERDICT[card.verdict].icon}</span>
            <span>
              <span className="sr-only">Respuesta: </span>
              {VERDICT[card.verdict].label}
            </span>
          </motion.p>
          {guessed && (
            <p className={styles.feedback} data-right={right || undefined}>
              {right ? 'Has acertado.' : `No exactamente: respondiste «${VERDICT[guessed].label}».`}
            </p>
          )}
          <div className={styles.explanation}>
            <RichParagraphs text={card.explanation} />
          </div>
        </motion.div>
      )}
    </li>
  );
}

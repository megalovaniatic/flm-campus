import { AnimatePresence, motion } from 'motion/react';
import { ListChecks, RotateCcw, StepForward } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { plainText, type Block } from '@flm/shared';
import { Button } from '@/design';
import { Rich, RichParagraphs } from '@/lib/rich';
import { useReducedMotionPref } from '@/lib/preferences';
import styles from './Example.module.css';

type ExampleBlock = Extract<Block, { type: 'example' }>;

/**
 * Ejemplo resuelto paso a paso: «Siguiente paso» y «Ver todo».
 * Nunca depende del desplazamiento; cada paso nuevo se anuncia y el foco no se pierde.
 */
export function WorkedExample({ block }: { block: ExampleBlock }) {
  const titleId = useId();
  const reduce = useReducedMotionPref();
  const total = block.steps.length;
  const [shown, setShown] = useState(1);
  const [announce, setAnnounce] = useState('');
  const focusAfter = useRef<'conclusion' | 'steps' | 'next' | null>(null);
  const conclusionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const all = shown >= total;

  useEffect(() => {
    const target = focusAfter.current;
    focusAfter.current = null;
    if (target === 'conclusion') conclusionRef.current?.focus();
    if (target === 'steps') stepsRef.current?.focus();
    if (target === 'next') nextRef.current?.focus();
  }, [shown]);

  const describe = (i: number) => {
    const s = block.steps[i];
    if (!s) return '';
    return [`Paso ${i + 1} de ${total}: ${plainText(s.label)}`, s.formula, s.result ? `Resultado: ${s.result}` : ''].filter(Boolean).join('. ');
  };

  const next = () => {
    const n = Math.min(total, shown + 1);
    if (n >= total) focusAfter.current = 'conclusion';
    setShown(n);
    setAnnounce(describe(n - 1));
  };

  const showAll = () => {
    focusAfter.current = 'steps';
    setShown(total);
    setAnnounce(`Se muestran los ${total} pasos y la conclusión.`);
  };

  const restart = () => {
    focusAfter.current = 'next';
    setShown(1);
    setAnnounce(describe(0));
  };

  const t = { duration: reduce ? 0 : 0.32, ease: [0.2, 0, 0, 1] as const };

  return (
    <div className={styles.example} role="group" aria-labelledby={titleId}>
      <p className={styles.kicker}>
        <ListChecks size={16} aria-hidden="true" /> Ejemplo resuelto
      </p>
      <h3 id={titleId} className={styles.title}>
        {block.title}
      </h3>
      <div className={styles.scenario}>
        <RichParagraphs text={block.scenario} />
      </div>

      <ol ref={stepsRef} className={styles.steps} tabIndex={-1} aria-label={`Pasos del ejemplo (${shown} de ${total} visibles)`}>
        <AnimatePresence initial={false}>
          {block.steps.slice(0, shown).map((s, i) => (
            <motion.li
              key={i}
              className={styles.step}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={t}
            >
              <div className={styles.stepInner}>
                <span className={styles.stepNum}>Paso {i + 1}</span>
                <p className={styles.stepLabel}>
                  <Rich text={s.label} />
                </p>
                {(s.formula || s.result) && (
                  <div className={styles.calc}>
                    {s.formula && (
                      <code className={styles.formula}>
                        <span className="sr-only">Cálculo: </span>
                        {s.formula}
                      </code>
                    )}
                    {s.result && (
                      <span className={styles.result}>
                        <span className={styles.resultLabel}>Resultado</span>
                        <strong>{s.result}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      <AnimatePresence initial={false} mode="popLayout">
        {all ? (
          <motion.div
            key="conclusion"
            ref={conclusionRef}
            tabIndex={-1}
            className={styles.conclusion}
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={t}
          >
            <p className={styles.conclusionLabel}>Conclusión</p>
            <div className={styles.conclusionText}>
              <RichParagraphs text={block.conclusion} />
            </div>
            {total > 1 && (
              <Button variant="ghost" size="sm" icon={<RotateCcw />} onClick={restart} className={styles.restart}>
                Volver a empezar
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div key="controls" className={styles.controls} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t}>
            <Button ref={nextRef} variant="primary" size="sm" icon={<StepForward />} onClick={next}>
              Siguiente paso
            </Button>
            <Button variant="ghost" size="sm" onClick={showAll}>
              Ver todo
            </Button>
            <span className={styles.count} aria-hidden="true">
              {shown} de {total}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

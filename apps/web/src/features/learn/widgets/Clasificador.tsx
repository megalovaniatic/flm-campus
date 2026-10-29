import { LayoutGroup, motion } from 'motion/react';
import { CircleCheck, CircleX, RotateCcw, Undo2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { plainText, type WidgetSpec } from '@flm/shared';
import { Button, Notice } from '@/design';
import { RichParagraphs } from '@/lib/rich';
import { Frame, LiveRegion, useTransition } from './ui';
import styles from './Clasificador.module.css';

type Spec = Extract<WidgetSpec, { kind: 'clasificador' }>;

export function Clasificador({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const uid = useId();
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [message, setMessage] = useState('');
  const [focusTarget, setFocusTarget] = useState<number | 'summary' | null>(null);
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const { spring } = useTransition();
  const Sub = `h${Math.min(6, headingLevel + 1)}` as 'h4';

  const n = spec.items.length;
  const pending = spec.items.map((item, i) => ({ item, i })).filter((x) => placed[x.i] === undefined);
  const done = n - pending.length;
  const correct = spec.items.filter((it, i) => placed[i] === it.answer).length;
  const unknown = spec.items.filter((it) => !spec.categories.includes(it.answer));

  useEffect(() => {
    if (focusTarget === null) return;
    if (focusTarget === 'summary') summaryRef.current?.focus();
    else itemRefs.current[focusTarget]?.querySelector('button')?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  const place = (i: number, category: string) => {
    const item = spec.items[i];
    if (!item) return;
    const ok = item.answer === category;
    setPlaced((p) => ({ ...p, [i]: category }));
    setMessage(`«${item.label}» en «${category}»: ${ok ? 'correcto' : `no es así, va en «${item.answer}»`}. ${plainText(item.explanation)}`);
    const next = pending.find((p) => p.i !== i);
    setFocusTarget(next ? next.i : 'summary');
  };

  const undo = (i: number) => {
    setPlaced((p) => {
      const copy = { ...p };
      delete copy[i];
      return copy;
    });
    setMessage(`«${spec.items[i]?.label ?? ''}» vuelve a la lista para clasificar.`);
    setFocusTarget(i);
  };

  const reset = () => {
    setPlaced({});
    setMessage('Clasificador reiniciado.');
  };

  return (
    <Frame
      kind="Clasificador"
      title={spec.title}
      intro={spec.prompt}
      headingLevel={headingLevel}
      actions={
        done > 0 ? (
          <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={reset}>
            Volver a empezar
          </Button>
        ) : undefined
      }
    >
      {import.meta.env.DEV && unknown.length > 0 && (
        <Notice tone="warning" title="Aviso solo en desarrollo">
          Estas respuestas no coinciden con ninguna categoría: {unknown.map((u) => `«${u.answer}»`).join(', ')}.
        </Notice>
      )}
      <LayoutGroup id={uid}>
        <section className={styles.pool} aria-labelledby={`${uid}-pool`}>
          <div className={styles.poolHead}>
            <Sub id={`${uid}-pool`} className={styles.sectionTitle}>
              Por clasificar
            </Sub>
            <p className={styles.counter} aria-hidden="true">
              {done} de {n}
            </p>
          </div>
          {pending.length === 0 ? (
            <p ref={summaryRef} tabIndex={-1} className={styles.summary}>
              <CircleCheck size={20} aria-hidden="true" />
              <span>
                Has clasificado todo: <strong>{correct}</strong> de {n} {correct === 1 ? 'acierto' : 'aciertos'}.{correct < n ? ' Revisa las explicaciones de los que no encajan.' : ' ¡Perfecto!'}
              </span>
            </p>
          ) : (
            <ul className={styles.items} role="list">
              {pending.map(({ item, i }) => (
                <motion.li
                  key={i}
                  layout
                  layoutId={`${uid}-item-${i}`}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className={styles.item}
                  transition={spring(380, 32)}
                >
                  <p className={styles.itemLabel} id={`${uid}-l-${i}`}>
                    {item.label}
                  </p>
                  <div className={styles.targets} role="group" aria-labelledby={`${uid}-l-${i}`} aria-describedby={`${uid}-hint`}>
                    {spec.categories.map((c) => (
                      <button key={c} type="button" className={styles.target} onClick={() => place(i, c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
          <p id={`${uid}-hint`} className="sr-only">
            Elige la categoría a la que pertenece.
          </p>
        </section>

        <div className={styles.bins}>
          {spec.categories.map((c, ci) => {
            const inBin = spec.items.map((item, i) => ({ item, i })).filter((x) => placed[x.i] === c);
            return (
              <section key={c} className={styles.bin} aria-labelledby={`${uid}-bin-${ci}`}>
                <Sub id={`${uid}-bin-${ci}`} className={styles.binTitle}>
                  {c}
                  <span className={styles.binCount}>{inBin.length}</span>
                </Sub>
                {inBin.length === 0 ? (
                  <p className={styles.binEmpty}>Aún nada aquí.</p>
                ) : (
                  <ul className={styles.binList} role="list">
                    {inBin.map(({ item, i }) => {
                      const ok = item.answer === c;
                      return (
                        <motion.li key={i} layout layoutId={`${uid}-item-${i}`} className={styles.placed} data-ok={ok || undefined} transition={spring(380, 32)}>
                          <p className={styles.placedHead}>
                            {ok ? <CircleCheck size={18} aria-hidden="true" /> : <CircleX size={18} aria-hidden="true" />}
                            <span>
                              <span className="sr-only">{ok ? 'Correcto: ' : 'Incorrecto: '}</span>
                              {item.label}
                            </span>
                          </p>
                          {!ok && (
                            <p className={styles.correction}>
                              Va en <strong>«{item.answer}»</strong>
                            </p>
                          )}
                          <div className={styles.explanation}>
                            <RichParagraphs text={item.explanation} />
                          </div>
                          {!ok && (
                            <button type="button" className={styles.undo} onClick={() => undo(i)}>
                              <Undo2 size={15} aria-hidden="true" /> Volver a intentarlo<span className="sr-only"> con «{item.label}»</span>
                            </button>
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </LayoutGroup>
      <LiveRegion message={message} delay={120} />
    </Frame>
  );
}

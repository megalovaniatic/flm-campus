import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CircleCheck, Forward, RotateCcw, TriangleAlert, Undo2 } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import type { WidgetSpec } from '@flm/shared';
import { Button, Notice } from '@/design';
import { RichParagraphs } from '@/lib/rich';
import { profundidadArbol, revisarArbol, type NodoArbol } from './calc';
import { Trail } from './Trail';
import { Frame, useTransition } from './ui';
import styles from './ArbolDecision.module.css';

type Spec = Extract<WidgetSpec, { kind: 'arbol-decision' }>;
type Tone = NonNullable<NodoArbol['outcome']>['tone'];

const TONE: Record<Tone, { label: string; icon: ReactNode }> = {
  derivar: { label: 'Derivar', icon: <Forward size={18} /> },
  resolver: { label: 'Resolver', icon: <CircleCheck size={18} /> },
  atencion: { label: 'Atención', icon: <TriangleAlert size={18} /> },
};

export function ArbolDecision({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const map = useMemo(() => new Map(spec.nodes.map((n) => [n.id, n])), [spec.nodes]);
  const problems = useMemo(() => revisarArbol(spec.start, spec.nodes), [spec.start, spec.nodes]);
  const [history, setHistory] = useState<{ id: string; choice: number }[]>([]);
  const { t, reduce } = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const uid = useId();
  const Sub = `h${Math.min(6, headingLevel + 1)}` as 'h4';

  const last = history[history.length - 1];
  const currentId = last ? (map.get(last.id)?.options?.[last.choice]?.next ?? '') : spec.start;
  const node = map.get(currentId);
  const isOutcome = !!node?.outcome;
  const remaining = node && !isOutcome ? profundidadArbol(node.id, spec.nodes) : 0;
  const total = history.length + remaining + 1;
  const done = history.length + (isOutcome ? 1 : 0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = window.setTimeout(() => headingRef.current?.focus({ preventScroll: false }), reduce ? 0 : 260);
    return () => window.clearTimeout(id);
  }, [history.length, currentId, reduce]);

  const choose = (i: number) => node && setHistory((h) => [...h, { id: node.id, choice: i }]);
  const restart = () => setHistory([]);
  const back = () => setHistory((h) => h.slice(0, -1));

  return (
    <Frame
      kind="Árbol de decisión"
      title={spec.title}
      intro="Responde a cada pregunta para llegar a una recomendación. Puedes cambiar cualquier respuesta."
      headingLevel={headingLevel}
      actions={
        history.length > 0 ? (
          <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={restart}>
            Volver a empezar
          </Button>
        ) : undefined
      }
    >
      {import.meta.env.DEV && problems.length > 0 && (
        <Notice tone="warning" title="Revisa la estructura del árbol (aviso solo en desarrollo)">
          <ul>
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Notice>
      )}

      <div className={styles.progress}>
        <Trail total={total} done={done} current={isOutcome ? undefined : history.length} />
        <p className={styles.progressText}>{isOutcome ? 'Resultado' : `Pregunta ${history.length + 1}${remaining > 1 ? ` · quedan como máximo ${remaining - 1} más` : ''}`}</p>
      </div>

      {history.length > 0 && (
        <ol className={styles.crumbs} aria-label="Tus respuestas">
          {history.map((h, k) => {
            const q = map.get(h.id);
            const answer = q?.options?.[h.choice]?.label ?? '';
            return (
              <li key={`${h.id}-${k}`} className={styles.crumb}>
                <span className={styles.crumbQ}>{q?.question}</span>
                <span className={styles.crumbA}>{answer}</span>
                <button type="button" className={styles.crumbEdit} onClick={() => setHistory((all) => all.slice(0, k))}>
                  Cambiar<span className="sr-only"> la respuesta a «{q?.question}»</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <div className={styles.stage}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${currentId}-${history.length}`} className={styles.card} data-outcome={isOutcome || undefined} data-tone={node?.outcome?.tone} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={t(0.26)}>
            {!node ? (
              <>
                <Sub ref={headingRef} tabIndex={-1} className={styles.question}>
                  Este camino todavía no tiene respuesta
                </Sub>
                <p className={styles.help}>Vuelve atrás o empieza de nuevo.</p>
                <div className={styles.actions}>
                  <Button variant="secondary" icon={<Undo2 size={16} />} onClick={back}>
                    Volver atrás
                  </Button>
                </div>
              </>
            ) : node.outcome ? (
              <>
                <p className={styles.tone} data-tone={node.outcome.tone}>
                  <span aria-hidden="true">{TONE[node.outcome.tone].icon}</span>
                  {TONE[node.outcome.tone].label}
                </p>
                <Sub ref={headingRef} tabIndex={-1} className={styles.outcomeTitle}>
                  {node.outcome.title}
                </Sub>
                <div className={styles.outcomeText}>
                  <RichParagraphs text={node.outcome.text} />
                </div>
                <div className={styles.actions}>
                  <Button variant="primary" icon={<RotateCcw size={16} />} onClick={restart}>
                    Volver a empezar
                  </Button>
                  <Button variant="secondary" icon={<Undo2 size={16} />} onClick={back}>
                    Cambiar la última respuesta
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Sub ref={headingRef} tabIndex={-1} id={`${uid}-q`} className={styles.question}>
                  {node.question}
                </Sub>
                <div className={styles.options} role="group" aria-labelledby={`${uid}-q`}>
                  {(node.options ?? []).map((o, i) => (
                    <motion.button key={o.label} type="button" className={styles.option} onClick={() => choose(i)} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={t(0.24, 0.05 + i * 0.05)}>
                      <span>{o.label}</span>
                      <ArrowRight size={18} aria-hidden="true" className={styles.optionIcon} />
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Frame>
  );
}

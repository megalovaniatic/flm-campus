import { animate } from 'motion/react';
import { useEffect, useState } from 'react';
import { bridgePath } from '@/motion/liquid';
import { useReducedMotionPref } from '@/lib/preferences';
import styles from './ProofDots.module.css';

/** Puente líquido entre dos respuestas consecutivas: «pasa» de un círculo a otro al aparecer. */
function Bridge({ a, b, r }: { a: [number, number]; b: [number, number]; r: number }) {
  const reduce = useReducedMotionPref();
  const [spread, setSpread] = useState(reduce ? 0.5 : 0);
  useEffect(() => {
    if (reduce) {
      setSpread(0.5);
      return;
    }
    const c = animate(0, 0.5, { duration: 0.42, ease: [0.22, 1, 0.36, 1], onUpdate: setSpread });
    return () => c.stop();
  }, [reduce]);
  return <path d={bridgePath(a, r, b, r, spread)} className={styles.bridge} />;
}

/**
 * Progreso del test: círculos sin letras (tres en el test final, diez puntos en la evaluación).
 * Respondida bien = círculo lleno; respondida mal = círculo lleno tachado; actual = anillo grueso.
 * Las respuestas consecutivas se unen con el puente líquido. Decorativo: la posición se escribe al lado.
 */
export function ProofDots({ total, current, results, variant }: { total: number; current: number; results: (boolean | undefined)[]; variant: 'circles' | 'points' }) {
  const r = variant === 'circles' ? 9 : 5.5;
  const gap = variant === 'circles' ? 30 : 18;
  const pad = 3;
  const width = pad * 2 + r * 2 + gap * (total - 1);
  const height = r * 2 + pad * 2;
  const cy = r + pad;
  const cx = (i: number) => pad + r + i * gap;
  return (
    <svg className={styles.dots} data-variant={variant} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <g>
        {Array.from({ length: total - 1 }, (_, i) =>
          results[i] !== undefined && results[i + 1] !== undefined ? <Bridge key={`b${i}`} a={[cx(i), cy]} b={[cx(i + 1), cy]} r={r - 0.75} /> : null,
        )}
      </g>
      {Array.from({ length: total }, (_, i) => {
        const res = results[i];
        const answered = res !== undefined;
        const isCurrent = i === current && !answered;
        return (
          <g key={i} className={styles.dot} data-state={answered ? (res ? 'right' : 'wrong') : isCurrent ? 'current' : 'todo'}>
            <circle cx={cx(i)} cy={cy} r={answered ? r - 0.75 : r - (isCurrent ? 1.25 : 0.75)} />
            {answered && !res && <line x1={cx(i) - r * 0.5} y1={cy + r * 0.5} x2={cx(i) + r * 0.5} y2={cy - r * 0.5} className={styles.strike} />}
          </g>
        );
      })}
    </svg>
  );
}

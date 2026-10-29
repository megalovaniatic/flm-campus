import { animate } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import type { EditorialStatus } from '@flm/shared';
import { bridgePath, easeOut, segment } from '@/motion/liquid';
import { useReducedMotionPref } from '@/lib/preferences';
import styles from './EditorialTrack.module.css';

const LEVEL: Record<EditorialStatus, number> = { borrador: 0, publicado: 1, archivado: 1 };

export const TRACK_STEPS = ['Borrador', 'Publicado'] as const;

/**
 * Recorrido editorial en dos círculos de estado (Borrador · Publicado). Al publicar, un puente líquido
 * une los dos (la conexión que crea la acción); al deshacer, se retira (≤ 450 ms). Con movimiento
 * reducido se muestra directamente el estado final. Decorativo: el estado siempre se escribe al lado.
 */
export function EditorialTrack({ status, size = 7 }: { status: EditorialStatus; size?: number }) {
  const reduce = useReducedMotionPref();
  const target = LEVEL[status];
  const [level, setLevel] = useState(target);
  const current = useRef(target);
  const id = useId();

  useEffect(() => {
    if (reduce) {
      current.current = target;
      setLevel(target);
      return;
    }
    const from = current.current;
    if (from === target) return;
    const controls = animate(from, target, {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        current.current = v;
        setLevel(v);
      },
    });
    return () => controls.stop();
  }, [target, reduce]);

  const r = size;
  const gap = Math.round(size * 3.7);
  const pad = 2;
  const width = pad * 2 + r * 2 + gap;
  const height = r * 2 + pad * 2;
  const cy = r + pad;
  const cx = (i: number) => pad + r + gap * i;
  const fill = (i: number) => (i === 0 ? 1 : easeOut(segment(level, 0.4, 1)));
  const spread = 0.5 * easeOut(segment(level, 0, 0.6));

  return (
    <svg className={styles.track} data-archived={status === 'archivado' || undefined} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`t${id}`} x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" className={styles.s1} />
          <stop offset="0.55" className={styles.s2} />
          <stop offset="1" className={styles.s3} />
        </linearGradient>
      </defs>
      {spread > 0.001 && <path d={bridgePath([cx(0), cy], r, [cx(1), cy], r, spread)} fill={`url(#t${id})`} />}
      {[0, 1].map((i) => {
        const f = fill(i);
        return (
          <g key={i}>
            <circle cx={cx(i)} cy={cy} r={r - 0.75} fill="none" className={styles.ring} strokeWidth="1.5" />
            {f > 0.001 && <circle cx={cx(i)} cy={cy} r={r * f} fill={`url(#t${id})`} />}
          </g>
        );
      })}
    </svg>
  );
}

/** «Borrador · aún no se ve en el campus», «Publicado» o «Archivado». */
export function trackLabel(status: EditorialStatus): string {
  if (status === 'archivado') return 'Archivado · retirado del campus';
  if (status === 'publicado') return 'Publicado · visible en el campus';
  return 'Borrador · aún no se ve en el campus';
}

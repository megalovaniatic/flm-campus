import { animate } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import type { EditorialStatus } from '@flm/shared';
import { bridgePath, easeOut, segment } from '@/motion/liquid';
import { useReducedMotionPref } from '@/lib/preferences';
import styles from './EditorialTrack.module.css';

const LEVEL: Record<EditorialStatus, number> = { borrador: 0, 'en-revision': 1, publicado: 2, archivado: 2 };

export const TRACK_STEPS = ['Borrador', 'En revisión', 'Publicado'] as const;

/**
 * Recorrido editorial en tres círculos de estado (Borrador · En revisión · Publicado).
 * Cada paso alcanzado se une al anterior con un puente líquido (la conexión que crea una acción:
 * enviar, aprobar). Al cambiar de estado el líquido fluye o se retira (≤ 450 ms por paso);
 * con movimiento reducido se muestra directamente el estado final. Decorativo: el estado
 * siempre se escribe al lado.
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
      duration: Math.min(0.9, 0.42 * Math.abs(target - from)),
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
  const width = pad * 2 + r * 2 + gap * 2;
  const height = r * 2 + pad * 2;
  const cy = r + pad;
  const cx = (i: number) => pad + r + gap * i;
  const fill = (i: number) => (i === 0 ? 1 : easeOut(segment(level - (i - 1), 0.4, 1)));
  const spread = (i: number) => 0.5 * easeOut(segment(level - i, 0, 0.6));

  return (
    <svg className={styles.track} data-archived={status === 'archivado' || undefined} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`t${id}`} x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" className={styles.s1} />
          <stop offset="0.55" className={styles.s2} />
          <stop offset="1" className={styles.s3} />
        </linearGradient>
      </defs>
      {[0, 1].map((i) => {
        const s = spread(i);
        return s > 0.001 ? <path key={`b${i}`} d={bridgePath([cx(i), cy], r, [cx(i + 1), cy], r, s)} fill={`url(#t${id})`} /> : null;
      })}
      {[0, 1, 2].map((i) => {
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

/** «Paso 2 de 3 · En revisión» (o «Archivado»). */
export function trackLabel(status: EditorialStatus): string {
  if (status === 'archivado') return 'Archivado · retirado de la consulta';
  const i = LEVEL[status];
  return `${TRACK_STEPS[i]} · paso ${i + 1} de 3`;
}

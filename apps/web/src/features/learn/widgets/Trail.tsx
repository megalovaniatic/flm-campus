import { motion } from 'motion/react';
import { useId } from 'react';
import { bridgePath } from '@/motion/liquid';
import { useTransition } from './ui';

/**
 * Rastro de progreso: un círculo por paso; al completar dos pasos seguidos, un puente líquido
 * (geometría de FLM-Diagonal) los une. Sin letras ni números dentro de los círculos.
 */
export function Trail({ total, done, current, size = 14, gap = 26, label }: { total: number; done: number; current?: number; size?: number; gap?: number; label?: string }) {
  const id = useId();
  const { t, reduce } = useTransition();
  const r = size / 2;
  const count = Math.max(1, total);
  const width = size + gap * (count - 1) + 4;
  const height = size + 8;
  const cy = height / 2;
  const cx = (i: number) => r + 2 + i * gap;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label} style={{ maxWidth: '100%', overflow: 'visible', flex: 'none' }}>
      <defs>
        {/* Degradado oficial rojo → burdeos → marino; en oscuro, los tonos claros de las áreas para que se vea sobre el fondo. */}
        <linearGradient id={`tg${id}`} x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--trail-0)' }} />
          <stop offset="0.55" style={{ stopColor: 'var(--trail-1)' }} />
          <stop offset="1" style={{ stopColor: 'var(--trail-2)' }} />
        </linearGradient>
      </defs>
      <g fill={`url(#tg${id})`}>
        {Array.from({ length: count - 1 }, (_, i) => {
          const on = i + 1 < done;
          const a: [number, number] = [cx(i), cy];
          const b: [number, number] = [cx(i + 1), cy];
          const thin = bridgePath(a, r - 0.5, b, r - 0.5, 0.02);
          const full = bridgePath(a, r - 0.5, b, r - 0.5, 0.5);
          if (!thin || !full) return null;
          return <motion.path key={i} initial={false} animate={{ d: on ? full : thin, opacity: on ? 1 : 0 }} transition={reduce ? { duration: 0 } : t(0.42, on ? 0.12 : 0)} />;
        })}
      </g>
      {Array.from({ length: count }, (_, i) => {
        const filled = i < done;
        const isCurrent = current === i;
        return (
          <g key={i}>
            <circle cx={cx(i)} cy={cy} r={r - 1} fill="var(--surface)" stroke={isCurrent ? 'var(--ink)' : 'var(--line-strong)'} strokeWidth={isCurrent ? 2 : 1.5} />
            <motion.circle cx={cx(i)} cy={cy} fill={`url(#tg${id})`} initial={false} animate={{ r: filled ? r - 0.5 : 0 }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 26 }} />
          </g>
        );
      })}
    </svg>
  );
}

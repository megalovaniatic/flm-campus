import { motion } from 'motion/react';
import { useId } from 'react';
import { useReducedMotionPref } from '@/lib/preferences';

/**
 * Anillo de progreso con el degradado del logotipo (rojo → burdeos → marino).
 * El valor también se expone como texto accesible. En modo oscuro las paradas se aclaran
 * (tokens --ring-*) para que el arco no desaparezca sobre el fondo marino.
 */
export function ProgressRing({
  value,
  total,
  size = 56,
  stroke = 5,
  label,
  decorative = false,
  children,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  label: string;
  /** El mismo dato ya está escrito al lado (p. ej., dentro de un enlace): el anillo se oculta a los lectores. */
  decorative?: boolean;
  children?: React.ReactNode;
}) {
  const id = useId();
  // Sistema o ajuste del campus («Reducido» también detiene el trazo).
  const reduce = useReducedMotionPref();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <span
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `${label}: ${value} de ${total}` })}
      style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', width: size, height: size, flex: 'none' }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--ring-1, #e53327)' }} />
            <stop offset="55%" style={{ stopColor: 'var(--ring-2, #792c35)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--ring-3, #172641)' }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#g${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - ratio) }}
          transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.15 }}
        />
      </svg>
      {children && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</span>}
    </span>
  );
}

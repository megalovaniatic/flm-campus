import { animate } from 'motion/react';
import { useEffect, useId, useState } from 'react';
import { useReducedMotionPref } from '@/lib/preferences';
import { bridgePath, easeOut, segment } from './liquid';

interface EscalonProps {
  /** Estados alcanzados: lectura confirmada, test superado. */
  read: boolean;
  passed: boolean;
  /** Texto de la cápsula final. */
  label?: string;
  /** Reproducir la animación (si no, se muestra el estado final). */
  play?: boolean;
  size?: number;
}

/**
 * «El escalón»: al completar una formación, los círculos se conectan con puentes líquidos,
 * el último sube un peldaño (variante H-Arriba del logotipo) y se abre en la cápsula
 * «Formación completada». Sin letras, sin confeti; con movimiento reducido, estado final.
 */
export function Escalon({ read, passed, label = 'Formación completada', play = true, size = 56 }: EscalonProps) {
  const reduce = useReducedMotionPref();
  const complete = read && passed;
  const [t, setT] = useState(play && !reduce ? 0 : 1);
  const id = useId();

  useEffect(() => {
    if (!play || reduce) {
      setT(1);
      return;
    }
    setT(0);
    const controls = animate(0, 1, { duration: complete ? 1.45 : 0.7, ease: 'linear', onUpdate: setT });
    return () => controls.stop();
  }, [play, reduce, complete]);

  const r = size / 2;
  const step = size * 0.969;
  const capsuleW = Math.max(size * 4.4, label.length * size * 0.205 + size * 1.2);
  const width = size + step * 2 + capsuleW - size + 8;
  const height = size * 2 + 12;
  const baseY = height - r - 6;

  // Línea de tiempo (0–1): llenado de los círculos, puentes, subida y apertura en cápsula.
  const fill1 = read ? easeOut(segment(t, 0, 0.22)) : 0;
  const fill2 = passed ? easeOut(segment(t, 0.12, 0.36)) : 0;
  const bridge12 = read && passed ? easeOut(segment(t, 0.3, 0.5)) * 0.5 : 0;
  const rise = complete ? easeOut(segment(t, 0.48, 0.72)) : 0;
  const bridge23 = complete ? easeOut(segment(t, 0.55, 0.75)) * 0.5 : 0;
  const open = complete ? easeOut(segment(t, 0.74, 0.96)) : 0;

  const c1: [number, number] = [r + 4, baseY];
  const c2: [number, number] = [r + 4 + step, baseY];
  const c3: [number, number] = [r + 4 + step * 2, baseY - step * rise];
  const capW = size + (capsuleW - size) * open;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={complete ? label : passed ? 'Test superado' : read ? 'Formación leída' : 'En curso'} style={{ maxWidth: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        {/* Tres paradas (--ring-*) reproducen el degradado oficial en claro y lo aclaran en oscuro. */}
        <linearGradient id={`g${id}`} x1="0" y1="0" x2={width} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'var(--ring-1, #e53327)' }} />
          <stop offset="0.58" style={{ stopColor: 'var(--ring-2, #792c35)' }} />
          <stop offset="1" style={{ stopColor: 'var(--ring-3, #172641)' }} />
        </linearGradient>
      </defs>
      <g fill={`url(#g${id})`}>
        {bridge12 > 0 && <path d={bridgePath(c1, r, c2, r, bridge12)} />}
        {bridge23 > 0 && <path d={bridgePath(c2, r, [c3[0], c3[1]], r, bridge23)} />}
      </g>
      {/* Círculo 1: lectura */}
      <circle cx={c1[0]} cy={c1[1]} r={r - 1} fill="none" stroke="var(--line-strong)" strokeWidth="2" />
      <circle cx={c1[0]} cy={c1[1]} r={(r - 1) * fill1} fill={`url(#g${id})`} />
      {/* Círculo 2: test */}
      <circle cx={c2[0]} cy={c2[1]} r={r - 1} fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray={passed ? undefined : '4 5'} />
      <circle cx={c2[0]} cy={c2[1]} r={(r - 1) * fill2} fill={`url(#g${id})`} />
      {/* Círculo 3: completada → cápsula */}
      {open > 0 ? (
        <g>
          {/* Cápsula en la superficie inversa: marino en claro y crema en oscuro (sobre el negro de FLM no se veía). */}
          <rect x={c3[0] - r} y={c3[1] - r} width={capW} height={size} rx={r} fill="var(--surface-inverse)" />
          <g opacity={segment(t, 0.86, 1)} transform={`translate(${c3[0] - r + size * 0.42} ${c3[1]})`}>
            <path d={`M ${-size * 0.13} 0 l ${size * 0.09} ${size * 0.09} l ${size * 0.18} ${-size * 0.18}`} fill="none" stroke="var(--ink-inverse)" strokeWidth={size * 0.06} strokeLinecap="round" strokeLinejoin="round" />
            <text x={size * 0.3} y={size * 0.11} fill="var(--ink-inverse)" fontFamily="var(--font-sans)" fontWeight="650" fontSize={size * 0.3}>
              {label}
            </text>
          </g>
        </g>
      ) : (
        <circle cx={c3[0]} cy={c3[1]} r={r - 1} fill={complete && rise > 0.98 ? 'var(--surface-inverse)' : 'none'} stroke="var(--line-strong)" strokeWidth="2" />
      )}
    </svg>
  );
}

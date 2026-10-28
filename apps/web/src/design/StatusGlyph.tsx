import { useId } from 'react';
import { STATUS_LABEL, type FormationStatus } from '@flm/shared';

/**
 * Glifo de estado de una formación (círculo de dos mitades):
 * izquierda = lectura · derecha = test (trama si intentado, llena si superado) ·
 * círculo completo con marca = completada. Siempre acompañado de texto.
 */
export function StatusGlyph({ status, size = 20, withLabel = true }: { status: FormationStatus; size?: number; withLabel?: boolean }) {
  const id = useId();
  const read = status === 'leida' || status === 'completada';
  const attempted = status === 'test-intentado';
  const passed = status === 'test-superado' || status === 'completada';
  const done = status === 'completada';
  const r = size / 2 - 1.5;
  const c = size / 2;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', fontWeight: 560, color: 'var(--ink-2)' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ flex: 'none' }}>
        <defs>
          <pattern id={`h${id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="1.6" height="4" fill="var(--ink)" />
          </pattern>
        </defs>
        {done ? (
          <>
            <circle cx={c} cy={c} r={r + 0.5} fill="var(--ink)" />
            <path d={`M ${c - r * 0.42} ${c} l ${r * 0.3} ${r * 0.32} l ${r * 0.58} ${-r * 0.62}`} fill="none" stroke="var(--paper)" strokeWidth={size * 0.11} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            {read && <path d={`M ${c} ${c - r} A ${r} ${r} 0 0 0 ${c} ${c + r} Z`} fill="var(--ink)" />}
            {(attempted || passed) && <path d={`M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r} Z`} fill={passed ? 'var(--ink)' : `url(#h${id})`} />}
            <circle cx={c} cy={c} r={r} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
            <line x1={c} y1={c - r} x2={c} y2={c + r} stroke="var(--ink)" strokeWidth="1" opacity="0.5" />
          </>
        )}
      </svg>
      {withLabel && <span>{STATUS_LABEL[status]}</span>}
    </span>
  );
}

import { motion } from 'motion/react';
import { useId } from 'react';
import { AREAS, type AreaId } from '@flm/shared';
import { Logo } from '@/layout/Logo';
import { useReducedMotionPref } from '@/lib/preferences';
import styles from './AreaMark.module.css';

/** Punto del área (Contable: relleno con el degradado completo). Siempre junto al nombre escrito. */
export function AreaDot({ area, size = 10, ring = false }: { area: AreaId; size?: number; ring?: boolean }) {
  return <span className={styles.dot} data-area={area} data-ring={ring || undefined} style={{ width: size, height: size }} aria-hidden="true" />;
}

/**
 * Anillo del degradado oficial («la suma de las tres»): marca de Contable.
 * Sin letras dentro: el nombre del área va siempre fuera, escrito.
 */
export function GradientRing({ size = 48, stroke, draw = false, className }: { size?: number; stroke?: number; draw?: boolean; className?: string }) {
  const id = useId();
  const reduce = useReducedMotionPref();
  const w = stroke ?? Math.max(2.5, size * 0.11);
  const r = (size - w) / 2;
  // En modo oscuro va sobre una placa clara (como los logotipos): el degradado no se recolorea.
  return (
    <span className={[styles.ringPlate, className ?? ''].join(' ')} aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={`ring${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e53327" />
            <stop offset="0.3" stopColor="#b8302d" />
            <stop offset="0.58" stopColor="#792c35" />
            <stop offset="0.82" stopColor="#3f293c" />
            <stop offset="1" stopColor="#172641" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring${id})`}
          strokeWidth={w}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={draw && !reduce ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </svg>
    </span>
  );
}

/**
 * Titular del área: logotipo OFICIAL del departamento (Fiscal, Laboral, Mercantil) o, en Contable,
 * titular tipográfico con el anillo del degradado (nunca un logotipo inventado).
 */
export function AreaHeadline({ area }: { area: AreaId }) {
  if (area === 'contable') {
    return (
      <span className={styles.typeHead}>
        <GradientRing size={56} draw className={styles.typeRing} />
        <span>
          Área <em>Contable</em>
        </span>
      </span>
    );
  }
  return (
    <span className={styles.logoHead}>
      <Logo variant={area} height={60} decorative />
      <span className="sr-only">Área {AREAS[area].name}</span>
    </span>
  );
}

/**
 * Sello del área al superar la evaluación: cápsula oficial (PNG) en Fiscal, Laboral y Mercantil;
 * anillo del degradado con el nombre escrito al lado en Contable.
 */
export function AreaSeal({ area, height = 44 }: { area: AreaId; height?: number }) {
  if (area === 'contable') {
    return (
      <span className={styles.sealType}>
        <GradientRing size={Math.round(height * 1.1)} draw />
        <span className={styles.sealName}>Contable</span>
      </span>
    );
  }
  return <Logo variant={area} height={height} />;
}

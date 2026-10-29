import { animate, useInView } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { monthShort, type EventSession } from '@flm/shared';
import { useReducedMotionPref } from '@/lib/preferences';
import { bridgePath, easeOut } from '@/motion/liquid';
import { useElementWidth } from './hooks';
import { dayMonth, daysListText, sessionState } from './eventView';
import styles from './SessionChain.module.css';

const R = 17;
const GAP = 9;
const STEP = R * 2 + GAP;
/** Espacio reservado sobre cada fila para el mes. */
const LABEL = 15;
const ROW_GAP = 12;
const PITCH = LABEL + R * 2 + ROW_GAP;

// Línea de tiempo (segundos): cada círculo aparece y el líquido pasa al siguiente.
const CIRCLE_IN = 0.18;
const BRIDGE_DELAY = 0.08;
const BRIDGE_IN = 0.16;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface SessionChainProps {
  sessions: EventSession[];
  next?: EventSession;
  now: Date;
  refYear: number;
}

/**
 * Sesiones de un mismo evento como círculos de fecha unidos por puentes líquidos
 * (geometría de la versión diagonal del logotipo, sin letras ni degradado de marca).
 * Las sesiones celebradas quedan llenas y unidas en tinta; la próxima, con anillo.
 * Al entrar en pantalla, el líquido recorre la serie en menos de medio segundo.
 */
export function SessionChain({ sessions, next, now, refYear }: SessionChainProps) {
  const reduce = useReducedMotionPref();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const inView = useInView(box, { once: true, amount: 0.5 });
  const n = sessions.length;
  const stagger = n > 1 ? Math.min(0.025, 0.2 / (n - 1)) : 0;
  const total = Math.max(0, n - 1) * stagger + Math.max(CIRCLE_IN, BRIDGE_DELAY + BRIDGE_IN);
  const [time, setTime] = useState(() => (reduce ? total : 0));

  useEffect(() => {
    if (reduce) {
      setTime(total);
      return;
    }
    if (!inView) return;
    const controls = animate(0, total, { duration: total, ease: 'linear', onUpdate: setTime });
    return () => controls.stop();
  }, [inView, reduce, total]);

  const layout = useMemo(() => {
    const maxPerRow = width > 0 ? Math.max(2, Math.floor((width - R * 2 - 2) / STEP) + 1) : n;
    const rows = Math.max(1, Math.ceil(n / maxPerRow));
    const perRow = Math.ceil(n / rows);
    const items = sessions.map((s, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const key = s.start.slice(0, 10);
      const month = Number(key.slice(5, 7));
      const prev = sessions[i - 1];
      const prevMonth = prev ? Number(prev.start.slice(5, 7)) : 0;
      return {
        i,
        key,
        row,
        cx: R + 1 + col * STEP,
        cy: LABEL + R + row * PITCH,
        day: Number(key.slice(8, 10)),
        month,
        showMonth: col === 0 || month !== prevMonth,
        state: sessionState(s, next, now),
      };
    });
    const cols = Math.min(n, perRow);
    return { items, w: Math.max(0, cols - 1) * STEP + R * 2 + 2, h: rows * PITCH - ROW_GAP + 1 };
  }, [sessions, next, now, width, n]);

  const label = `${n} sesiones: ${daysListText(
    sessions.map((s) => s.start.slice(0, 10)),
    refYear,
  )}.${next ? ` Próxima: ${dayMonth(next.start.slice(0, 10), refYear)}.` : ''}`;

  return (
    <div ref={box} className={styles.box}>
      <svg className={styles.svg} width={layout.w} height={layout.h} viewBox={`0 0 ${layout.w} ${layout.h}`} role="img" aria-label={label}>
        <g>
          {layout.items.map((a) => {
            const b = layout.items[a.i + 1];
            if (!b || b.row !== a.row) return null;
            const t = easeOut(clamp01((time - (a.i * stagger + BRIDGE_DELAY)) / BRIDGE_IN));
            if (t <= 0) return null;
            const d = bridgePath([a.cx, a.cy], R, [b.cx, b.cy], R, t * 0.5);
            return d ? <path key={`b-${a.i}`} d={d} className={b.state === 'past' ? styles.bridgeDone : styles.bridge} /> : null;
          })}
        </g>
        {layout.items.map((it) => {
          const p = easeOut(clamp01((time - it.i * stagger) / CIRCLE_IN));
          return (
            <g key={`c-${it.i}`} transform={`translate(${it.cx} ${it.cy})`} opacity={p}>
              {it.showMonth && (
                <text className={styles.month} y={-R - 5} textAnchor="middle">
                  {monthShort(it.month).toUpperCase()}
                </text>
              )}
              <g transform={`scale(${0.55 + 0.45 * p})`}>
                <circle r={it.state === 'next' ? R - 1 : R} className={styles[it.state]} />
                <text className={styles.num} data-state={it.state} textAnchor="middle" dy="0.36em">
                  {it.day}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

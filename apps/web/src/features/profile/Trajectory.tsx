import { animate, useInView } from 'motion/react';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { diffDays, formatLongDate, initials, madridDateKey, nextTenureMilestone, tenureYears, TENURE_MILESTONES, type Person } from '@flm/shared';
import { useReducedMotionPref } from '@/lib/preferences';
import { bridgePath, easeOut, segment } from '@/motion/liquid';
import { cropBox, portraitFor } from './portraitCrop';
import { daysLeftText } from './useProfileData';
import styles from './Trajectory.module.css';

const base = import.meta.env.BASE_URL;

/** Año de fundación según flmexperts.com («Desde 1921»). */
const FOUNDED = 1921;

type Kind = 'firm' | 'you' | 'unknown' | 'reached' | 'next';

interface Milestone {
  key: string;
  kind: Kind;
  year: string;
  title: string;
  detail: string;
  note?: string;
}

interface TrajectoryData {
  list: Milestone[];
  /** Cadena unida por puentes: tú, hitos alcanzados y próximo hito. */
  chain: Milestone[];
  /** Hitos alcanzados que no caben en la lista. */
  hidden: number;
  /** Avance (0–1) desde el último hito hasta el próximo. */
  progress: number;
  startYear?: number;
}

function tenureText(start: string, today: string): string {
  const days = diffDays(start, today);
  if (days < 0) return `Te incorporas el ${formatLongDate(start)}.`;
  if (days === 0) return 'Hoy es tu primer día en FLM. Te damos la bienvenida.';
  const years = tenureYears(start, today);
  if (years >= 1) return `Llevas ${years} ${years === 1 ? 'año' : 'años'} en FLM.`;
  if (days < 90) return `Llevas ${days} ${days === 1 ? 'día' : 'días'} en FLM.`;
  return `Llevas ${Math.floor(days / 30.44)} meses en FLM.`;
}

function useTrajectory(person: Person, maxReached: number): TrajectoryData {
  const start = person.startDate;
  return useMemo((): TrajectoryData => {
    const today = madridDateKey();
    const firm: Milestone = {
      key: 'firm',
      kind: 'firm',
      year: String(FOUNDED),
      title: `FLM, desde ${FOUNDED}`,
      detail: 'Más de cien años de asesoramiento, hoy en Barcelona, Vic y Granollers.',
      note: 'Dato de flmexperts.com',
    };
    if (!start) {
      const unknown: Milestone = {
        key: 'you',
        kind: 'unknown',
        year: '—',
        title: 'Tu fecha de incorporación no consta',
        detail: 'Sin ella no podemos calcular tus aniversarios ni tu próximo hito. Pide a administración que la añada a tu ficha.',
      };
      return { list: [firm, unknown], chain: [unknown], hidden: 0, progress: 0 };
    }
    const startYear = Number(start.slice(0, 4));
    const you: Milestone = { key: 'you', kind: 'you', year: String(startYear), title: `Tú, desde el ${formatLongDate(start)}`, detail: tenureText(start, today) };
    const years = tenureYears(start, today);
    const reached = TENURE_MILESTONES.filter((m) => years >= m).map((m): Milestone & { date: string } => {
      const date = `${startYear + m}${start.slice(4)}`;
      return { key: `m${m}`, kind: 'reached', year: date.slice(0, 4), title: m === 1 ? 'Primer año en FLM' : `${m} años en FLM`, detail: `Lo cumpliste el ${formatLongDate(date)}.`, date };
    });
    const next = nextTenureMilestone(start, today);
    const nextItem: Milestone | undefined = next
      ? {
          key: 'next',
          kind: 'next',
          year: next.date.slice(0, 4),
          title: `Próximo hito: ${next.years === 1 ? 'primer año en FLM' : `${next.years} años en FLM`}`,
          detail: `El ${formatLongDate(next.date)} · ${daysLeftText(next.inDays)}.`,
        }
      : undefined;
    let progress = 1;
    if (next) {
      const from = reached.length ? reached[reached.length - 1]!.date : start;
      const total = Math.max(1, diffDays(from, next.date));
      progress = Math.min(1, Math.max(0, diffDays(from, today) / total));
    }
    const listed = reached.slice(-3);
    return {
      list: [firm, you, ...listed, ...(nextItem ? [nextItem] : [])],
      chain: [you, ...reached.slice(-maxReached), ...(nextItem ? [nextItem] : [])],
      hidden: reached.length - listed.length,
      progress,
      startYear,
    };
  }, [start, maxReached]);
}

interface Point {
  x: number;
  y: number;
}

/**
 * Escalera de «Tu recorrido»: un hilo punteado (el tiempo) une el «desde 1921» de la firma con tu
 * llegada y, desde ahí, los hitos suben en escalera unidos por puentes líquidos (geometría de la
 * variante diagonal del logotipo, sin letras). El último puente se abre en proporción al tiempo
 * transcurrido hacia tu próximo hito. Es decorativa: la lista de debajo dice lo mismo en texto.
 */
function Emblem({ person, data, width }: { person: Person; data: TrajectoryData; width: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionPref();
  const inView = useInView(box, { once: true, amount: 0.15 });
  const [t, setT] = useState(() => (reduce ? 1 : 0));

  useEffect(() => {
    if (reduce) {
      setT(1);
      return;
    }
    if (!inView) return;
    const controls = animate(0, 1, { duration: 1.15, ease: 'linear', onUpdate: setT });
    return () => controls.stop();
  }, [inView, reduce]);

  const narrow = width < 560;
  const R = narrow ? 20 : 28;
  const step = R * 1.92;
  const right = narrow ? 96 : 124;
  const chain = data.chain;
  const n = chain.length;
  const yBase = 16 + R + (n - 1) * step;
  const xFirst = Math.max(R * 5.5, width - right - R - (n - 1) * step);
  const firm: Point = { x: R + 2, y: yBase };
  const pts: Point[] = chain.map((_, i) => ({ x: xFirst + i * step, y: yBase - i * step }));
  const height = yBase + R + 34;
  const first = pts[0]!;
  const last = pts[n - 1]!;
  const head = chain[0]!;

  // Línea de tiempo (0–1): la firma, el hilo del tiempo, tu llegada y, uno a uno, los puentes.
  const firmIn = easeOut(segment(t, 0, 0.14));
  const dotsFrom = firm.x + R + 9;
  const dotsTo = first.x - R - 9;
  const dotCount = Math.max(0, Math.floor((dotsTo - dotsFrom) / 9) + 1);
  const dotsShown = Math.round(dotCount * easeOut(segment(t, 0.08, 0.42)));
  const youIn = easeOut(segment(t, 0.34, 0.48));
  const span = n > 1 ? 0.5 / (n - 1) : 0;
  const stage = (i: number) => 0.46 + i * span;

  const crop = portraitFor(person.photo);
  const inner = R - 3.5;
  const photo = crop ? cropBox(crop, inner * 2) : undefined;
  const pop = (p: Point, a: number) => `translate(${p.x} ${p.y}) scale(${0.55 + 0.45 * a}) translate(${-p.x} ${-p.y})`;
  const grad = `url(#g${uid})`;

  return (
    <div ref={box} className={styles.emblem} style={{ height }} aria-hidden="true">
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.svg} focusable="false">
          <defs>
            <linearGradient id={`g${uid}`} gradientUnits="userSpaceOnUse" x1={first.x - R} y1={first.y + R} x2={n > 1 ? last.x + R : last.x + 2 * R} y2={n > 1 ? last.y - R : last.y}>
              <stop offset="0" style={{ stopColor: 'var(--tr-a)' }} />
              <stop offset="0.55" style={{ stopColor: 'var(--tr-b)' }} />
              <stop offset="1" style={{ stopColor: 'var(--tr-c)' }} />
            </linearGradient>
            <clipPath id={`c${uid}`}>
              <circle cx={first.x} cy={first.y} r={inner} />
            </clipPath>
          </defs>

          {/* La firma: anillo con el punto rojo de la marca */}
          <g opacity={firmIn} transform={pop(firm, firmIn)}>
            <circle cx={firm.x} cy={firm.y} r={R - 1} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="2" />
            <circle cx={firm.x} cy={firm.y} r={R * 0.2} fill="var(--flm-rojo)" />
          </g>

          {/* El tiempo: hilo punteado hasta tu llegada */}
          <g fill="var(--ink-3)">
            {Array.from({ length: dotsShown }, (_, i) => (
              <circle key={i} cx={dotsFrom + i * 9} cy={yBase} r={1.7} />
            ))}
          </g>

          {/* Puentes líquidos, uno a uno; el último, en proporción al tiempo hasta el próximo hito */}
          {chain.slice(1).map((m, i) => {
            const target = m.kind === 'next' ? 0.07 + 0.43 * data.progress : 0.5;
            const spread = target * easeOut(segment(t, stage(i), stage(i) + span * 0.85));
            const d = bridgePath([pts[i]!.x, pts[i]!.y], R, [pts[i + 1]!.x, pts[i + 1]!.y], R, spread);
            return d ? <path key={m.key} d={d} fill={grad} /> : null;
          })}

          {/* Tu llegada: círculo de persona (retrato o iniciales) con el filete del degradado */}
          {head.kind === 'unknown' ? (
            <circle cx={first.x} cy={first.y} r={R - 1} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="2" strokeDasharray="4 5" opacity={youIn} />
          ) : (
            <g opacity={youIn} transform={pop(first, youIn)}>
              <circle cx={first.x} cy={first.y} r={R} fill={grad} />
              <circle cx={first.x} cy={first.y} r={inner + 1.5} fill="var(--surface)" />
              {crop && photo ? (
                <image href={crop.src} x={first.x - inner + photo.x} y={first.y - inner + photo.y} width={photo.width} height={photo.height} clipPath={`url(#c${uid})`} preserveAspectRatio="none" />
              ) : person.photo ? (
                <image href={base + person.photo} x={first.x - inner} y={first.y - inner} width={inner * 2} height={inner * 2} clipPath={`url(#c${uid})`} preserveAspectRatio="xMidYMid slice" />
              ) : (
                <>
                  <circle cx={first.x} cy={first.y} r={inner} fill="var(--flm-marino)" />
                  <text x={first.x} y={first.y} dy="0.35em" textAnchor="middle" fill="#fff" fontFamily="var(--font-sans)" fontWeight="600" fontSize={R * 0.62}>
                    {initials(person.name)}
                  </text>
                </>
              )}
            </g>
          )}

          {/* Hitos alcanzados (círculo lleno con marca) y próximo hito (anillo discontinuo) */}
          {chain.slice(1).map((m, i) => {
            const p = pts[i + 1]!;
            if (m.kind === 'next') {
              const a = easeOut(segment(t, stage(i), stage(i) + span * 0.5));
              return <circle key={m.key} cx={p.x} cy={p.y} r={R - 1} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="2" strokeDasharray="4 5" opacity={a} />;
            }
            const a = easeOut(segment(t, stage(i) + span * 0.45, stage(i) + span));
            return (
              <g key={m.key} opacity={a} transform={pop(p, a)}>
                <circle cx={p.x} cy={p.y} r={R} fill={grad} />
                <path d={`M ${p.x - R * 0.34} ${p.y + R * 0.02} l ${R * 0.24} ${R * 0.24} l ${R * 0.46} ${-R * 0.48}`} fill="none" stroke="#fff" strokeWidth={R * 0.13} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
        </svg>
      )}

      {/* Años junto a cada círculo (en HTML para que el texto no se escale) */}
      {width > 0 && (
        <>
          <span className={styles.label} style={{ left: firm.x, top: firm.y + R + 6, opacity: firmIn }} data-align="center">
            {FOUNDED}
          </span>
          {data.startYear !== undefined && dotCount > 5 && (
            <span className={styles.gap} style={{ left: (dotsFrom + dotsTo) / 2, top: yBase - 28, opacity: easeOut(segment(t, 0.3, 0.5)) }}>
              {data.startYear - FOUNDED} años
            </span>
          )}
          <span className={styles.label} style={{ left: first.x, top: first.y + R + 6, opacity: youIn }} data-align="center">
            {head.year}
          </span>
          {chain.slice(1).map((m, i) => {
            const p = pts[i + 1]!;
            const next = m.kind === 'next';
            return (
              <span key={m.key} className={styles.label} style={{ left: p.x + R + (next ? 10 : 8), top: next ? p.y - 15 : p.y - 6, opacity: easeOut(segment(t, stage(i) + span * 0.5, stage(i) + span)) }} data-kind={m.kind}>
                {m.year}
                {next && <small>próximo hito</small>}
              </span>
            );
          })}
        </>
      )}
    </div>
  );
}

/** «Tu recorrido»: de «FLM, desde 1921» a tu llegada y a tu próximo hito de trayectoria. */
export function Trajectory({ person }: { person: Person }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setWidth(Math.round(el.getBoundingClientRect().width));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const data = useTrajectory(person, width > 0 && width < 560 ? 1 : 3);

  return (
    <div className={styles.root}>
      <div ref={wrap}>
        <Emblem person={person} data={data} width={width} />
      </div>
      <ol className={styles.list}>
        {data.list.map((m) => (
          <li key={m.key} className={styles.item} data-kind={m.kind}>
            <span className={styles.marker} data-kind={m.kind} aria-hidden="true" />
            <span className={styles.year} aria-hidden="true">
              {m.year}
            </span>
            <span className={styles.title}>{m.title}</span>
            <span className={styles.detail}>
              {m.detail}
              {m.kind === 'you' && data.hidden > 0 && ` Antes de los últimos hitos, ${data.hidden === 1 ? 'otro aniversario' : `${data.hidden} aniversarios más`}.`}
            </span>
            {m.note && <span className={styles.note}>{m.note}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

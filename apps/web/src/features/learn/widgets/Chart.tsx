import { motion, useInView } from 'motion/react';
import { Table2 } from 'lucide-react';
import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { niceScale } from './calc';
import { cx, Legend, useTransition } from './ui';
import styles from './Chart.module.css';

export interface ChartSeries {
  name: string;
  values: { x: string | number; y: number }[];
}

export type ChartType = 'barras' | 'lineas' | 'escalones';

export interface ChartProps {
  type: ChartType;
  title: string;
  /** Muestra el título como pie del gráfico (si el marco no lo muestra ya). */
  showTitle?: boolean;
  series: ChartSeries[];
  xLabel?: string;
  yLabel?: string;
  /** Formato de los valores en la lectura y en la tabla. */
  formatValue: (n: number) => string;
  /** Formato de las marcas del eje vertical (más compacto). */
  formatTick?: (n: number) => string;
  formatX?: (x: string | number) => string;
  /** Sombrea el área entre dos series (índices) con un rótulo. */
  band?: { from: number; to: number; label: string };
  /** Categorías destacadas (por ejemplo, años con ajuste). */
  emphasis?: (index: number) => boolean;
  activeIndex?: number | null;
  onActiveChange?: (index: number | null) => void;
  /** Lectura personalizada de la categoría activa. */
  readout?: (index: number) => ReactNode;
  /** Tabla alternativa plegable (por defecto, sí). */
  table?: boolean;
  height?: number;
}

const DASH = ['', '7 5', '2 4', '9 4 2 4'];
const SERIES_VAR = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'];
const SWATCH = ['line', 'dash', 'dot', 'dash'] as const;
const TYPE_LABEL: Record<ChartType, string> = { barras: 'Gráfico de barras', lineas: 'Gráfico de líneas', escalones: 'Gráfico en escalones' };

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Parte un rótulo en líneas de «max» caracteres como mucho (sin cortar palabras). */
function wrapWords(text: string, max: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/)) {
    if (!current) current = word;
    else if (`${current} ${word}`.length <= max) current = `${current} ${word}`;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function barPath(x: number, w: number, yv: number, yb: number): string {
  const top = Math.min(yv, yb);
  const bottom = Math.max(yv, yb);
  const r = Math.max(0, Math.min(4, w / 2, bottom - top));
  if (yv <= yb) return `M${r2(x)},${r2(bottom)} V${r2(top + r)} Q${r2(x)},${r2(top)} ${r2(x + r)},${r2(top)} H${r2(x + w - r)} Q${r2(x + w)},${r2(top)} ${r2(x + w)},${r2(top + r)} V${r2(bottom)} Z`;
  return `M${r2(x)},${r2(top)} V${r2(bottom - r)} Q${r2(x)},${r2(bottom)} ${r2(x + r)},${r2(bottom)} H${r2(x + w - r)} Q${r2(x + w)},${r2(bottom)} ${r2(x + w)},${r2(bottom - r)} V${r2(top)} Z`;
}

function Marker({ shape, x, y, active }: { shape: number; x: number; y: number; active?: boolean }) {
  const s = active ? 5.5 : 4.5;
  const common = { fill: SERIES_VAR[shape % 4], stroke: 'var(--surface)', strokeWidth: 2 } as const;
  switch (shape % 4) {
    case 1:
      return <rect x={x - s} y={y - s} width={s * 2} height={s * 2} rx={1.5} {...common} />;
    case 2:
      return <path d={`M${x},${y - s - 1} L${x + s + 1},${y + s} L${x - s - 1},${y + s} Z`} {...common} />;
    case 3:
      return <path d={`M${x},${y - s - 1.5} L${x + s + 1.5},${y} L${x},${y + s + 1.5} L${x - s - 1.5},${y} Z`} {...common} />;
    default:
      return <circle cx={x} cy={y} r={s} {...common} />;
  }
}

export function Chart({ type, title, showTitle, series, xLabel, yLabel, formatValue, formatTick, formatX = (x) => String(x), band, emphasis, activeIndex, onActiveChange, readout, table = true, height }: ChartProps) {
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const seen = useInView(wrapRef, { once: true, margin: '0px 0px -10% 0px' });
  const { t, reduce } = useTransition();
  const [width, setWidth] = useState(640);
  const [innerActive, setInnerActive] = useState<number | null>(null);
  const active = activeIndex !== undefined ? activeIndex : innerActive;
  const setActive = (i: number | null) => {
    if (onActiveChange) onActiveChange(i);
    else setInnerActive(i);
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width;
      if (w) setWidth(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cats = useMemo(() => {
    const out: (string | number)[] = [];
    series.forEach((s) => s.values.forEach((v) => (out.some((c) => c === v.x) ? null : out.push(v.x))));
    return out;
  }, [series]);
  const valueAt = (s: ChartSeries, x: string | number) => s.values.find((v) => v.x === x)?.y;

  const allY = series.flatMap((s) => s.values.map((v) => v.y));
  const H = height ?? (width < 440 ? 230 : 280);
  const scale = niceScale(Math.min(0, ...allY), Math.max(0, ...allY), H < 250 ? 4 : 5);
  const tick = formatTick ?? formatValue;
  const tickLabels = scale.ticks.map(tick);
  const ml = Math.min(110, Math.max(30, Math.max(...tickLabels.map((l) => l.length)) * 6.7 + 12));
  const mr = type === 'barras' ? 8 : 14;
  const mt = 16;
  const pw = Math.max(40, width - ml - mr);
  const n = Math.max(1, cats.length);
  const bandW = pw / n;

  // Rótulos del eje X sin choques: primero se parten en líneas; si no caben, se muestra uno de cada «step».
  const xTexts = cats.map(formatX);
  const maxChars = Math.max(4, Math.floor((bandW - 8) / 6.4));
  const wrapped = xTexts.map((s) => (s.length > maxChars ? wrapWords(s, maxChars) : [s]));
  const wrapFits = wrapped.every((lines) => lines.length <= 3 && lines.every((l) => l.length <= maxChars + 1));
  const xLines = wrapFits ? wrapped : xTexts.map((s) => [s]);
  const lineCount = Math.max(1, ...xLines.map((l) => l.length));
  const labelW = Math.max(...xTexts.map((s) => s.length)) * 6.6 + 10;
  const step = wrapFits ? 1 : Math.max(1, Math.ceil(labelW / bandW));
  const mb = 28 + (lineCount - 1) * 14 + (xLabel ? 20 : 0);
  const ph = Math.max(60, H - mt - mb);
  const xc = (i: number) => ml + bandW * (i + 0.5);
  const y = (v: number) => mt + ph - ((v - scale.min) / (scale.max - scale.min || 1)) * ph;
  const yBase = y(Math.min(scale.max, Math.max(scale.min, 0)));

  const linePath = (s: ChartSeries) => {
    let d = '';
    let pen = false;
    cats.forEach((c, i) => {
      const v = valueAt(s, c);
      if (v === undefined) {
        pen = false;
        return;
      }
      if (type === 'escalones') {
        const left = ml + bandW * i;
        const right = left + bandW;
        d += pen ? ` V${r2(y(v))} H${r2(right)}` : `M${r2(left)},${r2(y(v))} H${r2(right)}`;
      } else d += `${pen ? ' L' : 'M'}${r2(xc(i))},${r2(y(v))}`;
      pen = true;
    });
    return d;
  };

  const bandPath = (() => {
    if (!band || type === 'barras') return '';
    const a = series[band.from];
    const b = series[band.to];
    if (!a || !b) return '';
    const pts = cats.map((c, i) => ({ i, va: valueAt(a, c), vb: valueAt(b, c) })).filter((p) => p.va !== undefined && p.vb !== undefined) as { i: number; va: number; vb: number }[];
    if (pts.length < 2 || pts.every((p) => Math.abs(p.va - p.vb) < 0.005)) return '';
    const fwd = pts.map((p) => `${r2(xc(p.i))},${r2(y(p.va))}`).join(' L');
    const back = [...pts].reverse().map((p) => `${r2(xc(p.i))},${r2(y(p.vb))}`).join(' L');
    return `M${fwd} L${back} Z`;
  })();

  const nS = series.length;
  const gap = 3;
  const groupW = Math.min(bandW * 0.7, nS * 24 + (nS - 1) * gap);
  const bw = Math.max(2, (groupW - (nS - 1) * gap) / nS);
  const labelBars = type === 'barras' && cats.length * nS <= 8 && bw >= 16;

  const onPointer = (e: PointerEvent<SVGRectElement>) => {
    const rect = (e.currentTarget.ownerSVGElement ?? e.currentTarget).getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.floor((px - ml) / bandW);
    setActive(Math.min(n - 1, Math.max(0, i)));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = active ?? -1;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = Math.min(n - 1, cur + 1);
    if (e.key === 'ArrowLeft') next = cur < 0 ? n - 1 : Math.max(0, cur - 1);
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (e.key === 'Escape') {
      setActive(null);
      return;
    }
    if (next !== null) {
      e.preventDefault();
      setActive(next);
    }
  };

  const shown = active ?? null;
  const readoutContent =
    shown === null ? (
      <span className={styles.readoutHint}>Pasa el cursor por el gráfico o enfócalo y usa las flechas para leer cada valor.</span>
    ) : readout ? (
      readout(shown)
    ) : (
      <>
        <strong>{xTexts[shown]}</strong>
        {series.map((s) => {
          const v = valueAt(s, cats[shown]!);
          return (
            <span key={s.name}>
              {' · '}
              {s.name}: <strong>{v === undefined ? 'sin dato' : formatValue(v)}</strong>
            </span>
          );
        })}
      </>
    );

  const minV = Math.min(...allY);
  const maxV = Math.max(...allY);
  const desc = `${TYPE_LABEL[type]} con ${nS === 1 ? 'una serie' : `${nS} series (${series.map((s) => s.name).join(', ')})`}, de ${xTexts[0] ?? ''} a ${xTexts[xTexts.length - 1] ?? ''}. Valores entre ${formatValue(minV)} y ${formatValue(maxV)}. Los datos completos están en la tabla.`;

  return (
    <figure className={styles.figure}>
      {nS > 1 && <Legend items={series.map((s, i) => ({ label: s.name, swatch: type === 'barras' ? 'solid' : SWATCH[i % 4]!, color: SERIES_VAR[i % 4]! }))} />}
      {yLabel && <p className={styles.axisTitle}>{yLabel}</p>}
      <div ref={wrapRef} className={styles.wrap} tabIndex={0} role="group" aria-label={`${title}. ${TYPE_LABEL[type]} interactivo`} aria-describedby={`${id}-help`} onKeyDown={onKey} onBlur={() => onActiveChange === undefined && setInnerActive(null)}>
        <svg className={styles.svg} width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" aria-labelledby={`${id}-t ${id}-d`}>
          <title id={`${id}-t`}>{title}</title>
          <desc id={`${id}-d`}>{desc}</desc>

          {/* Rejilla y ejes */}
          <g aria-hidden="true">
            {scale.ticks.map((v, i) => (
              <g key={v}>
                <line className={styles.grid} x1={ml} x2={ml + pw} y1={r2(y(v))} y2={r2(y(v))} />
                <text className={styles.tick} x={ml - 8} y={y(v)} dy="0.32em" textAnchor="end">
                  {tickLabels[i]}
                </text>
              </g>
            ))}
            <line className={styles.baseline} x1={ml} x2={ml + pw} y1={r2(yBase)} y2={r2(yBase)} />
            {cats.map((c, i) =>
              i % step === 0 ? (
                <text key={String(c)} className={styles.tick} data-emph={emphasis?.(i) || undefined} x={xc(i)} y={mt + ph + 18} textAnchor="middle">
                  {(xLines[i] ?? []).map((line, li) => (
                    <tspan key={li} x={xc(i)} dy={li === 0 ? 0 : 14}>
                      {line}
                    </tspan>
                  ))}
                </text>
              ) : null,
            )}
            {xLabel && (
              <text className={styles.axisLabel} x={ml + pw / 2} y={H - 4} textAnchor="middle">
                {xLabel}
              </text>
            )}
          </g>

          {/* Categoría activa */}
          {shown !== null && (
            <g aria-hidden="true">
              {type === 'barras' ? <rect className={styles.activeBand} x={ml + bandW * shown} y={mt} width={bandW} height={ph} rx={6} /> : <line className={styles.crosshair} x1={xc(shown)} x2={xc(shown)} y1={mt} y2={mt + ph} />}
            </g>
          )}

          {/* Área entre series */}
          {bandPath && (
            <g aria-hidden="true">
              <motion.path className={styles.band} d={bandPath} initial={{ opacity: 0 }} animate={{ opacity: seen ? 1 : 0 }} transition={t(0.4, 0.5)} />
            </g>
          )}

          {/* Marcas de datos */}
          <g aria-hidden="true">
            {type === 'barras'
              ? series.map((s, si) =>
                  cats.map((c, i) => {
                    const v = valueAt(s, c);
                    if (v === undefined) return null;
                    const x = xc(i) - groupW / 2 + si * (bw + gap);
                    const zero = barPath(x, bw, yBase, yBase);
                    const full = barPath(x, bw, y(v), yBase);
                    return (
                      <Fragment key={`${s.name}-${String(c)}`}>
                        <motion.path d={full} className={styles.bar} data-dim={shown !== null && shown !== i ? true : undefined} style={{ fill: SERIES_VAR[si % 4] }} initial={reduce ? false : { d: zero }} animate={{ d: seen || reduce ? full : zero }} transition={t(0.5, i * 0.04 + si * 0.06)} />
                        {labelBars && (
                          <motion.text className={styles.barLabel} x={x + bw / 2} y={v >= 0 ? y(v) - 6 : y(v) + 14} textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: seen || reduce ? 1 : 0 }} transition={t(0.3, 0.45)}>
                            {bandW >= 76 ? formatValue(v) : tick(v)}
                          </motion.text>
                        )}
                      </Fragment>
                    );
                  }),
                )
              : series.map((s, si) => {
                  const d = linePath(s);
                  const dashed = si % 4 !== 0;
                  return (
                    <g key={s.name}>
                      <motion.path
                        d={d}
                        className={styles.line}
                        style={{ stroke: SERIES_VAR[si % 4], strokeDasharray: dashed ? DASH[si % 4] : undefined }}
                        initial={reduce ? false : dashed ? { opacity: 0 } : { pathLength: 0 }}
                        animate={dashed ? { opacity: seen || reduce ? 1 : 0, d } : { pathLength: seen || reduce ? 1 : 0, d }}
                        transition={t(dashed ? 0.4 : 0.7, si * 0.15)}
                      />
                      {cats.length <= 24 &&
                        cats.map((c, i) => {
                          const v = valueAt(s, c);
                          if (v === undefined) return null;
                          const mx = type === 'escalones' ? ml + bandW * (i + 0.5) : xc(i);
                          return (
                            <motion.g key={String(c)} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: seen || reduce ? 1 : 0 }} transition={t(0.25, 0.4 + i * 0.03)}>
                              <Marker shape={si} x={r2(mx)} y={r2(y(v))} active={shown === i} />
                            </motion.g>
                          );
                        })}
                    </g>
                  );
                })}
          </g>

          {/* Superficie de lectura (puntero) */}
          <rect className={styles.hit} x={ml} y={mt} width={pw} height={ph} onPointerMove={onPointer} onPointerDown={onPointer} onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)} />
        </svg>
        <p id={`${id}-help`} className="sr-only">
          Usa las flechas izquierda y derecha para recorrer los valores; la lectura aparece debajo del gráfico.
        </p>
      </div>
      <p className={styles.readout} aria-live="polite">
        {readoutContent}
      </p>
      {band && bandPath && (
        <p className={styles.bandNote}>
          <span className={styles.bandSwatch} aria-hidden="true" /> {band.label}
        </p>
      )}
      {showTitle && <figcaption className={styles.caption}>{title}</figcaption>}
      {table && (
        <details className={styles.details}>
          <summary className={styles.summary}>
            <Table2 size={16} aria-hidden="true" />
            Ver los datos en una tabla
          </summary>
          <div className={styles.tableWrap} role="region" aria-label={`Datos: ${title}`} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr>
                  <th scope="col">{xLabel ?? 'Categoría'}</th>
                  {series.map((s) => (
                    <th key={s.name} scope="col">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cats.map((c, i) => (
                  <tr key={String(c)} className={cx(shown === i && styles.rowActive)}>
                    <th scope="row">{xTexts[i]}</th>
                    {series.map((s) => {
                      const v = valueAt(s, c);
                      return <td key={s.name}>{v === undefined ? '—' : formatValue(v)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </figure>
  );
}

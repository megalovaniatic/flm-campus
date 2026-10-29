import { motion, useInView } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { number } from '@flm/shared';
import { TextField } from '@/design';
import { useReducedMotionPref } from '@/lib/preferences';
import { isDateKey, parseImporte } from './calc';
import styles from './ui.module.css';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/** Curvas del sistema (tokens de movimiento) para Motion. */
export const EASE_STANDARD = [0.2, 0, 0, 1] as const;
export const EASE_ENTER = [0.05, 0.7, 0.1, 1] as const;

/** Transición que respeta el movimiento reducido (Motion no anula anchuras ni opacidades por sí solo). */
export function useTransition() {
  const reduce = useReducedMotionPref();
  return {
    reduce,
    t: (duration = 0.32, delay = 0) => (reduce ? { duration: 0 } : { duration, delay, ease: EASE_STANDARD }),
    spring: (stiffness = 420, damping = 34) => (reduce ? { duration: 0 } : { type: 'spring' as const, stiffness, damping }),
  };
}

/** true cuando el elemento entra en pantalla (una vez): las barras crecen al verse, no antes. */
export function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  return [ref, seen] as const;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Marco común de los apoyos visuales
 * ──────────────────────────────────────────────────────────────────────────── */

export interface Source {
  label: string;
  url: string;
}

export interface FrameProps {
  /** Tipo de apoyo y referencia: «Simulador · Art. 27 LGT». */
  kind: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  sources?: Source[];
  /** Muestra «Cálculo orientativo con reglas verificadas a…». */
  verified?: boolean;
  headingLevel?: 2 | 3 | 4;
  className?: string;
  /** Acciones en la cabecera (por ejemplo, «Volver a empezar»). */
  actions?: ReactNode;
}

export const VERIFIED_AT = '28/10/2026';

export function Frame({ kind, title, intro, children, sources, verified, headingLevel = 3, className, actions }: FrameProps) {
  const id = useId();
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <section className={cx(styles.frame, className)} aria-labelledby={`${id}-t`}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <p className={styles.kind}>
            <span className={styles.kindDot} aria-hidden="true" />
            {kind}
          </p>
          <H id={`${id}-t`} className={styles.title}>
            {title}
          </H>
          {intro && <div className={styles.intro}>{intro}</div>}
        </div>
        {actions && <div className={styles.headActions}>{actions}</div>}
      </header>
      <div className={styles.body}>{children}</div>
      {(sources?.length || verified) && (
        <footer className={styles.foot}>
          {sources && sources.length > 0 && (
            <p className={styles.sources}>
              <span className={styles.sourcesLabel}>Fuentes:</span>
              {sources.map((s, i) => (
                <span key={s.url + i}>
                  <ExternalLink href={s.url}>{s.label}</ExternalLink>
                  {i < sources.length - 1 ? <span aria-hidden="true"> · </span> : null}
                </span>
              ))}
            </p>
          )}
          {verified && <p className={styles.verified}>Cálculo orientativo con las reglas verificadas a {VERIFIED_AT}. Revisa siempre el caso concreto.</p>}
        </footer>
      )}
    </section>
  );
}

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cx(styles.extLink, className)}>
      {children}
      <ArrowUpRight size={12} aria-hidden="true" className={styles.extIcon} />
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Anuncios accesibles
 * ──────────────────────────────────────────────────────────────────────────── */

/** Región viva educada que anuncia el resultado cuando deja de cambiar (no en la carga inicial). */
export function LiveRegion({ message, delay = 650 }: { message: string; delay?: number }) {
  const [out, setOut] = useState('');
  // Mensaje inicial: no se anuncia (comparar con él es seguro con el doble montaje de StrictMode).
  const initial = useRef(message);
  useEffect(() => {
    if (message === initial.current) return;
    initial.current = '\u0000';
    const t = window.setTimeout(() => setOut(message), delay);
    return () => window.clearTimeout(t);
  }, [message, delay]);
  return (
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {out}
    </p>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Cifra que rueda (odómetro): cada dígito se desliza a su nuevo valor
 * ──────────────────────────────────────────────────────────────────────────── */

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function RollingNumber({ text, className, style }: { text: string; className?: string; style?: CSSProperties }) {
  const chars = Array.from(text);
  return (
    <span className={cx(styles.rolling, className)} style={style}>
      <span className={styles.rollingVisual} aria-hidden="true">
        {chars.map((ch, i) => {
          const fromRight = chars.length - i;
          if (ch >= '0' && ch <= '9') {
            const d = Number(ch);
            return (
              <span key={`d${fromRight}`} className={styles.digit}>
                <span className={styles.strip} style={{ transform: `translateY(${-d * 10}%)`, transitionDelay: `${Math.min(fromRight, 8) * 18}ms` }}>
                  {DIGITS.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </span>
              </span>
            );
          }
          return (
            <span key={`c${fromRight}${ch}`} className={styles.char}>
              {ch}
            </span>
          );
        })}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Campos
 * ──────────────────────────────────────────────────────────────────────────── */

const formatEditable = (v: number) => (Number.isInteger(v) ? number(v, 0) : number(v, 2));

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: ReactNode;
  min?: number;
  max?: number;
  /** Mensaje de rango (si no, uno genérico). */
  rangeMessage?: string;
  integer?: boolean;
  placeholder?: string;
}

/** Campo numérico en formato español («2.800,50»): recalcula al escribir y avisa al salir si la cifra no es válida. */
export function NumberField({ label, value, onChange, hint, min, max, rangeMessage, integer, placeholder }: NumberFieldProps) {
  const [text, setText] = useState(() => formatEditable(value));
  const [error, setError] = useState<string>();
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(formatEditable(value));
  }, [value]);

  const check = (raw: string): { n: number } | { error: string } => {
    const n = parseImporte(raw);
    if (n === null) return { error: integer ? 'Escribe un número entero, por ejemplo 12.' : 'Escribe una cifra, por ejemplo 2.800,50.' };
    if (integer && !Number.isInteger(n)) return { error: 'Escribe un número entero, sin decimales.' };
    if ((min !== undefined && n < min) || (max !== undefined && n > max)) {
      return { error: rangeMessage ?? (min !== undefined && max !== undefined ? `Escribe un valor entre ${number(min)} y ${number(max)}.` : min !== undefined ? `Escribe un valor igual o superior a ${number(min)}.` : `Escribe un valor igual o inferior a ${number(max ?? 0)}.`) };
    }
    return { n };
  };

  return (
    <TextField
      label={label}
      hint={hint}
      error={error}
      inputMode={integer ? 'numeric' : 'decimal'}
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
      value={text}
      className={styles.numInput}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const r = check(raw);
        if ('n' in r) {
          setError(undefined);
          onChange(r.n);
        }
      }}
      onBlur={() => {
        focused.current = false;
        const r = check(text);
        if ('error' in r) setError(r.error);
        else {
          setError(undefined);
          setText(formatEditable(r.n));
        }
      }}
    />
  );
}

/** Campo de fecha nativo (AAAA-MM-DD) con validación al salir. */
export function DateField({ label, value, onChange, hint, min, max }: { label: string; value: string; onChange: (v: string) => void; hint?: ReactNode; min?: string; max?: string }) {
  const [text, setText] = useState(value);
  const [error, setError] = useState<string>();
  useEffect(() => setText(value), [value]);
  return (
    <TextField
      type="date"
      label={label}
      hint={hint}
      error={error}
      value={text}
      min={min}
      max={max}
      className={styles.dateInput}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        if (isDateKey(v)) {
          setError(undefined);
          onChange(v);
        }
      }}
      onBlur={() => setError(isDateKey(text) ? undefined : 'Indica una fecha válida (día, mes y año).')}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Selector segmentado (radios nativos con cápsula que se desliza)
 * ──────────────────────────────────────────────────────────────────────────── */

export function Segmented<T extends string>({ legend, options, value, onChange, hideLegend }: { legend: string; options: { value: T; label: string; icon?: ReactNode }[]; value: T; onChange: (v: T) => void; hideLegend?: boolean }) {
  const name = useId();
  const { spring } = useTransition();
  return (
    <fieldset className={styles.segField}>
      <legend className={hideLegend ? 'sr-only' : styles.segLegend}>{legend}</legend>
      <div className={styles.segmented}>
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label key={o.value} className={styles.segOption}>
              <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} />
              {checked && <motion.span layoutId={`seg-${name}`} className={styles.segIndicator} transition={spring(460, 36)} />}
              <span className={styles.segLabel}>
                {o.icon && <span aria-hidden="true">{o.icon}</span>}
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Deslizador accesible (input range nativo con escala propia)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface RangeFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  /** Texto que lee el lector de pantalla para cada valor. */
  valueText: (v: number) => string;
  /** Valor visible junto a la etiqueta. */
  display: ReactNode;
  /** Salto con RePág/AvPág. */
  pageStep?: number;
  /** Rótulos de la escala. */
  scale?: { value: number; label: string }[];
  /** Marca destacada (por ejemplo, el «muro» de los 12 meses). */
  mark?: { value: number; label: string };
  hint?: ReactNode;
}

export function RangeField({ label, value, min, max, onChange, valueText, display, pageStep = 3, scale, mark, hint }: RangeFieldProps) {
  const id = useId();
  const pos = (v: number) => (max === min ? 0 : (v - min) / (max - min));
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      onChange(Math.min(max, Math.max(min, value + (e.key === 'PageUp' ? pageStep : -pageStep))));
    }
  };
  return (
    <div className={styles.range}>
      <div className={styles.rangeHead}>
        <label htmlFor={id} className={styles.rangeLabel}>
          {label}
        </label>
        <span className={styles.rangeValue} aria-hidden="true">
          {display}
        </span>
      </div>
      {hint && (
        <p id={`${id}-hint`} className={styles.rangeHint}>
          {hint}
        </p>
      )}
      <div className={styles.rangeTrack} style={{ '--p': pos(value) } as CSSProperties}>
        <div className={styles.rail} aria-hidden="true">
          <span className={styles.railFill} />
          {mark && <span className={styles.railMark} style={{ left: `${pos(mark.value) * 100}%` }} />}
        </div>
        <input
          id={id}
          type="range"
          className={styles.rangeInput}
          min={min}
          max={max}
          step={1}
          value={value}
          aria-valuetext={valueText(value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onKeyDown={onKeyDown}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      {scale && (
        <div className={styles.rangeScale} aria-hidden="true">
          {scale.map((s) => (
            <span key={s.value} style={{ '--p': pos(s.value) } as CSSProperties} data-mark={mark?.value === s.value || undefined}>
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Piezas de resultado
 * ──────────────────────────────────────────────────────────────────────────── */

export function Figure({ label, text, sub, tone }: { label: string; text: string; sub?: ReactNode; tone?: 'neutral' | 'strong' }) {
  return (
    <div className={styles.figureBlock} data-tone={tone}>
      <p className={styles.figureLabel}>{label}</p>
      <RollingNumber text={text} className={styles.figure} />
      {sub && <div className={styles.figureSub}>{sub}</div>}
    </div>
  );
}

export interface BarCompareRow {
  label: string;
  value: number;
  display: ReactNode;
  tone?: 's1' | 's2' | 's3' | 'muted';
  current?: boolean;
}

/** Barras horizontales comparadas que crecen al entrar en pantalla (valor siempre escrito). */
export function BarCompare({ rows }: { rows: BarCompareRow[] }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const { t } = useTransition();
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.value))) * 1.02;
  return (
    <div className={styles.bars} ref={ref}>
      {rows.map((r, i) => (
        <div key={r.label} className={styles.barRow} data-current={r.current || undefined}>
          <span className={styles.barLabel}>{r.label}</span>
          <span className={styles.barValue}>{r.display}</span>
          <span className={styles.barTrack} aria-hidden="true">
            <motion.span className={styles.barFill} data-tone={r.tone ?? 's1'} initial={{ width: 0 }} animate={{ width: seen ? `${(Math.max(0, r.value) / max) * 100}%` : 0 }} transition={t(0.45, i * 0.07)} />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Lista de definición compacta para desgloses («concepto · operación · resultado»). */
export function Breakdown({ rows, caption }: { rows: { term: ReactNode; detail?: ReactNode; value: ReactNode; total?: boolean }[]; caption?: string }) {
  return (
    <div className={styles.breakdown}>
      {caption && <p className={styles.breakdownCaption}>{caption}</p>}
      <dl>
        {rows.map((r, i) => (
          <div key={i} className={styles.bdRow} data-total={r.total || undefined}>
            <dt>
              {r.term}
              {r.detail && <span className={styles.bdDetail}>{r.detail}</span>}
            </dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Leyenda de series: la marca de color acompaña siempre a un texto. */
export function Legend({ items }: { items: { label: string; swatch: 'solid' | 'hatch' | 'line' | 'dash' | 'dot'; color: string }[] }) {
  return (
    <ul className={styles.legend} role="list">
      {items.map((it) => (
        <li key={it.label}>
          <span className={styles.swatch} data-kind={it.swatch} style={{ '--c': it.color } as CSSProperties} aria-hidden="true" />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

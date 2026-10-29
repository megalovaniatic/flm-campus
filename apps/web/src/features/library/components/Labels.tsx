import { FlaskConical } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import type { AreaId, NewsKind } from '@flm/shared';
import { AreaTag, Chip } from '@/design';
import { DOC_KIND, NEWS_KIND, URGENCY, type DocKind, type Urgency } from '../lib/labels';
import { highlightRanges } from '../lib/search';
import styles from './Labels.module.css';

/** Tipo de novedad: icono + palabra. */
export function KindLabel({ kind, size = 'md' }: { kind: NewsKind; size?: 'sm' | 'md' }) {
  const { label, Icon } = NEWS_KIND[kind];
  return (
    <span className={styles.kind} data-size={size}>
      <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.8} aria-hidden="true" />
      {label}
    </span>
  );
}

/** Tipo de documento: icono + palabra. */
export function DocKindLabel({ kind, size = 'md' }: { kind: DocKind; size?: 'sm' | 'md' }) {
  const { label, Icon } = DOC_KIND[kind];
  return (
    <span className={styles.kind} data-size={size}>
      <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.8} aria-hidden="true" />
      {label}
    </span>
  );
}

/**
 * Glifo de urgencia con la gramática de estados del campus (círculos, sin letras):
 * lleno = alta · medio lleno = media · anillo = informativa. Siempre acompañado de texto.
 */
export function UrgencyGlyph({ urgency, size = 14 }: { urgency: Urgency; size?: number }) {
  const c = size / 2;
  const r = c - 1.25;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className={styles.glyph}>
      {urgency === 'alta' && <circle cx={c} cy={c} r={r + 0.75} className={styles.glyphFill} />}
      {urgency === 'media' && <path d={`M ${c} ${c - r} A ${r} ${r} 0 0 0 ${c} ${c + r} Z`} className={styles.glyphHalf} />}
      {urgency !== 'alta' && <circle cx={c} cy={c} r={r} className={styles.glyphRing} />}
    </svg>
  );
}

export function UrgencyLabel({ urgency }: { urgency: Urgency }) {
  return (
    <span className={styles.urgency} data-urgency={urgency}>
      <UrgencyGlyph urgency={urgency} />
      {URGENCY[urgency].label}
    </span>
  );
}

/** Área de un documento (los documentos pueden ser de ámbito general). */
export function DocAreaTag({ area, size = 'sm' }: { area: AreaId | 'general'; size?: 'sm' | 'md' }) {
  if (area === 'general') return <Chip size={size}>General</Chip>;
  return <AreaTag area={area} size={size} />;
}

/** Rótulo del contenido de muestra (solo en desarrollo). */
export function SampleBadge() {
  return (
    <Chip tone="warning" size="sm" icon={<FlaskConical size={13} />}>
      Muestra
    </Chip>
  );
}

/** Resalta las palabras buscadas (sin tildes ni mayúsculas) dentro de un texto. */
export function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  const ranges = useMemo(() => highlightRanges(text, tokens), [text, tokens]);
  if (!ranges.length) return <>{text}</>;
  const parts: ReactNode[] = [];
  let last = 0;
  ranges.forEach(([a, b], i) => {
    if (a > last) parts.push(text.slice(last, a));
    parts.push(
      <mark key={i} className={styles.mark}>
        {text.slice(a, b)}
      </mark>,
    );
    last = b;
  });
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

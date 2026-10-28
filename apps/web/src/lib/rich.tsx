import { createContext, Fragment, useContext, useId, type ReactNode } from 'react';
import { normalize, type KeyTerm } from '@flm/shared';

/**
 * Texto enriquecido ligero del campus:
 *   **negrita** · *cursiva* · [[término clave]] · [texto](https://enlace)
 * Los términos clave se enlazan con su definición mediante el contexto de la formación.
 */

export interface TermsContextValue {
  terms: KeyTerm[];
  /** Id del elemento que contiene la definición (para aria-describedby). */
  idFor: (term: string) => string | undefined;
  onTerm?: (term: KeyTerm) => void;
}

const TermsContext = createContext<TermsContextValue | null>(null);

export function TermsProvider({ terms, onTerm, children }: { terms: KeyTerm[]; onTerm?: (t: KeyTerm) => void; children: ReactNode }) {
  const base = useId();
  const idFor = (term: string) => {
    const i = terms.findIndex((t) => normalize(t.term) === normalize(term));
    return i >= 0 ? `${base}-term-${i}` : undefined;
  };
  return <TermsContext.Provider value={{ terms, idFor, onTerm }}>{children}</TermsContext.Provider>;
}

export function useTerms() {
  return useContext(TermsContext);
}

type Token = { kind: 'text' | 'strong' | 'em' | 'term' | 'link'; text: string; href?: string };

const PATTERN = /(\*\*[^*]+\*\*)|(\[\[[^\]]+\]\])|(\[[^\]]+\]\([^)\s]+\))|(\*[^*\s][^*]*\*)/g;

function tokenize(input: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of input.matchAll(PATTERN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ kind: 'text', text: input.slice(last, idx) });
    const s = m[0];
    if (s.startsWith('**')) out.push({ kind: 'strong', text: s.slice(2, -2) });
    else if (s.startsWith('[[')) out.push({ kind: 'term', text: s.slice(2, -2) });
    else if (s.startsWith('[')) {
      const close = s.indexOf('](');
      out.push({ kind: 'link', text: s.slice(1, close), href: s.slice(close + 2, -1) });
    } else out.push({ kind: 'em', text: s.slice(1, -1) });
    last = idx + s.length;
  }
  if (last < input.length) out.push({ kind: 'text', text: input.slice(last) });
  return out;
}

function Term({ text }: { text: string }) {
  const ctx = useTerms();
  const term = ctx?.terms.find((t) => normalize(t.term) === normalize(text));
  const id = ctx?.idFor(text);
  if (!ctx || !term) return <strong>{text}</strong>;
  return (
    <button type="button" className="term" aria-describedby={id} onClick={() => ctx.onTerm?.(term)}>
      {text}
    </button>
  );
}

/** Renderiza texto enriquecido en línea (sin párrafos). */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {tokenize(text).map((t, i) => {
        switch (t.kind) {
          case 'strong':
            return <strong key={i}>{t.text}</strong>;
          case 'em':
            return <em key={i}>{t.text}</em>;
          case 'term':
            return <Term key={i} text={t.text} />;
          case 'link': {
            const external = /^https?:/.test(t.href ?? '');
            return (
              <a key={i} href={t.href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                {t.text}
                {external && <span className="sr-only"> (se abre en una pestaña nueva)</span>}
              </a>
            );
          }
          default:
            return <Fragment key={i}>{t.text}</Fragment>;
        }
      })}
    </>
  );
}

/** Texto enriquecido con párrafos separados por línea en blanco. */
export function RichParagraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={className}>
            <Rich text={p} />
          </p>
        ))}
    </>
  );
}

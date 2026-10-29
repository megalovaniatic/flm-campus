import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState, type RefObject } from 'react';
import { normalize, type KeyTerm } from '@flm/shared';
import { Rich, useTerms } from '@/lib/rich';
import { useReducedMotionPref } from '@/lib/preferences';
import styles from './ReadingAids.module.css';

/* ── Filete de lectura ───────────────────────────────────────────────── */

/**
 * Filete en degradado bajo la cabecera que avanza con la lectura, con «Te quedan X min».
 * Es solo una ayuda visual: la lectura se confirma siempre con el botón del final.
 */
export function ReadingRule({ target, minutes }: { target: RefObject<HTMLElement | null>; minutes: number }) {
  const reduce = useReducedMotionPref();
  const { scrollYProgress } = useScroll({ target, offset: ['start 140px', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 240, damping: 40, restDelta: 0.001 });
  const [left, setLeft] = useState(minutes);
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setLeft(Math.max(0, Math.ceil(minutes * (1 - v) - 0.05)));
    setVisible(v > 0.015);
  });
  return (
    <div className={styles.rule} aria-hidden="true">
      <motion.span className={styles.ruleFill} style={{ scaleX: reduce ? scrollYProgress : smooth }} />
      <AnimatePresence>
        {visible && (
          <motion.span className={styles.left} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            {left > 0 ? `Te quedan ${left} min` : 'Has llegado al final'}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Apartado actual ─────────────────────────────────────────────────── */

/** Apartado que ocupa la franja de lectura (IntersectionObserver sobre cada apartado). */
export function useActiveSection(ids: string[]): string | undefined {
  const key = ids.join('|');
  const [active, setActive] = useState<string | undefined>(undefined);
  useEffect(() => {
    const list = key.split('|');
    const els = list.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const on = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) on.add(e.target.id);
          else on.delete(e.target.id);
        }
        const first = list.find((id) => on.has(id));
        if (first) setActive(first);
      },
      { rootMargin: '-30% 0px -64% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
}

/* ── Índice «En esta formación» ──────────────────────────────────────── */

export interface TocItem {
  id: string;
  label: string;
  number?: number;
}

export function Toc({ items, active, onGo, hrefFor, layoutKey }: { items: TocItem[]; active?: string; onGo: (id: string) => void; hrefFor: (id: string) => string; layoutKey: string }) {
  return (
    <ol role="list" className={styles.toc}>
      {items.map((it) => {
        const on = it.id === active;
        return (
          <li key={it.id}>
            <a
              href={hrefFor(it.id)}
              className={styles.tocLink}
              aria-current={on ? 'location' : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                onGo(it.id);
              }}
            >
              <span className={styles.tocMark} aria-hidden="true">
                {on && <motion.span layoutId={layoutKey} className={styles.tocDot} transition={{ type: 'spring', stiffness: 520, damping: 38 }} />}
              </span>
              {it.number !== undefined && (
                <>
                  <span className={styles.tocNum}>{it.number}</span>
                  <span className="sr-only">. </span>
                </>
              )}
              <span className={styles.tocLabel}>{it.label}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/* ── Términos clave ──────────────────────────────────────────────────── */

/** Margen de escritorio: definiciones siempre visibles; las del apartado actual, destacadas. */
export function KeyTermsMargin({ terms, current, flash }: { terms: KeyTerm[]; current: Set<string>; flash: string | null }) {
  const ctx = useTerms();
  return (
    <dl className={styles.terms}>
      {terms.map((t) => {
        const k = normalize(t.term);
        return (
          <div key={t.term} className={styles.term} data-term={k} data-current={current.has(k) || undefined} data-flash={flash === k || undefined}>
            <dt className={styles.termName}>{t.term}</dt>
            <dd id={ctx?.idFor(t.term)} className={styles.termDef}>
              <Rich text={t.definition} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/** En móvil: en línea y desplegables. */
export function KeyTermsInline({ terms }: { terms: KeyTerm[] }) {
  const ctx = useTerms();
  return (
    <ul role="list" className={styles.termsInline}>
      {terms.map((t) => (
        <li key={t.term}>
          <details className={styles.termDetails}>
            <summary>
              <span>{t.term}</span>
              <ChevronDown size={18} aria-hidden="true" className={styles.chev} />
            </summary>
            <div id={ctx?.idFor(t.term)} className={styles.termDef}>
              <Rich text={t.definition} />
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}

import type { ReactNode } from 'react';
import styles from './Section.module.css';

/** Apartado del dosier con número, antetítulo, título y entradilla. */
export function DossierSection({ id, number, eyebrow, title, lede, children }: { id: string; number: string; eyebrow: string; title: ReactNode; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`h-${id}`} className={styles.section}>
      <header className={styles.head}>
        <span className={styles.number} aria-hidden="true">
          {number}
        </span>
        <div className={styles.headText}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`h-${id}`} className={styles.title}>
            {title}
          </h2>
          {lede && <p className={styles.lede}>{lede}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

/** Subtítulo dentro de un apartado. */
export function SubHead({ children, hint, id }: { children: ReactNode; hint?: ReactNode; id?: string }) {
  return (
    <div className={styles.sub}>
      <h3 id={id} className={styles.subTitle}>
        {children}
      </h3>
      {hint && <p className={styles.subHint}>{hint}</p>}
    </div>
  );
}

import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { Crumb } from '@/design/PageHeader';
import styles from './QuizHeader.module.css';

/** Cabecera compacta de las pantallas de test: migas, antetítulo, titular y datos del test. */
export function QuizHeader({ crumbs, eyebrow, title, meta, aside }: { crumbs: Crumb[]; eyebrow: ReactNode; title: ReactNode; meta?: ReactNode; aside?: ReactNode }) {
  return (
    <header className={styles.header}>
      <div className={styles.main}>
        <nav aria-label="Estás en" className={styles.crumbs}>
          <ol role="list">
            {crumbs.map((c, i) => (
              <li key={i}>
                {c.to ? (
                  <Link to={c.to} title={c.label}>
                    <span className={styles.crumbText}>{c.label}</span>
                  </Link>
                ) : (
                  <span aria-current="page" className={styles.current}>
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && <ChevronRight size={14} aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </nav>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {meta && <p className={styles.meta}>{meta}</p>}
      </div>
      {aside && <div className={styles.aside}>{aside}</div>}
    </header>
  );
}

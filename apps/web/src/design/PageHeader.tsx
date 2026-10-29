import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import styles from './PageHeader.module.css';

export interface Crumb {
  label: string;
  to?: string;
  /** Señal delante de la etiqueta (p. ej., el punto del área). */
  icon?: ReactNode;
}

/**
 * Cabecera de página común: migas, antetítulo, titular (Newsreader), entradilla y acciones.
 * Usar en todas las secciones para mantener el ritmo editorial del campus.
 */
/**
 * Cabecera de página. `aside` va a la derecha, a su tamaño; `media` es la foto de portada de un destino:
 * ocupa la mitad derecha, centrada en ella.
 */
export function PageHeader({ crumbs, eyebrow, title, lede, actions, aside, media, id }: { crumbs?: Crumb[]; eyebrow?: ReactNode; title: ReactNode; lede?: ReactNode; actions?: ReactNode; aside?: ReactNode; media?: ReactNode; id?: string }) {
  return (
    <header className={styles.header} data-media={media ? '' : undefined}>
      <div className={styles.main}>
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Estás en" className={styles.crumbs}>
            <ol role="list">
              {crumbs.map((c, i) => (
                <li key={i}>
                  {c.to ? (
                    <Link to={c.to}>
                      {c.icon}
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page">
                      {c.icon}
                      {c.label}
                    </span>
                  )}
                  {i < crumbs.length - 1 && <ChevronRight size={14} aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 id={id} className={styles.title}>
          {title}
        </h1>
        {lede && <div className={styles.lede}>{lede}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {aside && <div className={styles.aside}>{aside}</div>}
      {media && <div className={styles.media}>{media}</div>}
    </header>
  );
}

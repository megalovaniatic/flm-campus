import { AREAS, type Reading } from '@flm/shared';
import styles from './BookCover.module.css';

/** «Juan Martín Queralt y otros» cuando la autoría es larga. */
export function shortAuthors(authors: string): string {
  const parts = authors
    .split(/,\s*|\s+y\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 2 ? `${parts[0]} y otros` : authors;
}

/**
 * Portada TIPOGRÁFICA generada (nunca imágenes de cubiertas): lomo con el color del área,
 * título en Newsreader, autoría y editorial. Es decorativa: el enlace que la contiene ya
 * nombra la lectura. Dentro de un elemento con [data-book-trigger], la portada se abre
 * ligeramente al pasar o enfocar (sin inclinación con movimiento reducido).
 */
export function BookCover({ reading, size = 'md' }: { reading: Reading; size?: 'md' | 'lg' }) {
  const len = reading.title.length;
  return (
    <span className={styles.book} data-size={size} data-area={reading.area} data-len={len > 52 ? 'xl' : len > 28 ? 'l' : 'm'} aria-hidden="true">
      <span className={styles.pages} />
      <span className={styles.cover}>
        <span className={styles.spine} />
        <span className={styles.face}>
          <span className={styles.area}>
            <span className={styles.dot} />
            {AREAS[reading.area].name}
          </span>
          <span className={styles.title}>{reading.title}</span>
          <span className={styles.rule} />
          <span className={styles.authors}>{shortAuthors(reading.authors)}</span>
          <span className={styles.publisher}>{reading.publisher}</span>
        </span>
      </span>
    </span>
  );
}

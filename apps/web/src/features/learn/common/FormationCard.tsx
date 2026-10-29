import { ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router';
import { AREAS, type Formation, type FormationStatus } from '@flm/shared';
import { StatusGlyph } from '@/design';
import { formationPath } from './data';
import { capitalize, cssVars } from './util';
import styles from './FormationCard.module.css';

/** «Término de portada»: el definido por la autoría o, si falta, el primer término clave. */
export function coverTermOf(f: Formation): string {
  return capitalize(f.coverTerm ?? f.keyTerms[0]?.term ?? AREAS[f.area].name);
}

/**
 * Portada tipográfica de una formación: banda con el relleno del área y el término de portada
 * en Newsreader grande, del color del área. Nunca fotografía de stock.
 */
export function FormationCover({ formation, index }: { formation: Formation; index?: number }) {
  const term = coverTermOf(formation);
  return (
    <div className={styles.cover} data-area={formation.area} aria-hidden="true">
      <span className={styles.band} />
      {index !== undefined && <span className={styles.index}>Formación {String(index).padStart(2, '0')}</span>}
      <span className={styles.term} style={cssVars({ '--fit': Math.max(4, term.length) })}>
        {term}
      </span>
    </div>
  );
}

/** Tarjeta de formación con portada tipográfica (página del área). */
export function FormationCard({ formation, index, status }: { formation: Formation; index: number; status: FormationStatus }) {
  return (
    <article className={styles.card} data-area={formation.area}>
      <FormationCover formation={formation} index={index} />
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link to={formationPath(formation)} className={styles.stretch}>
            {formation.title}
          </Link>
        </h3>
        <p className={styles.summary}>{formation.summary}</p>
        <div className={styles.foot}>
          <StatusGlyph status={status} />
          <span className={styles.minutes}>
            <Clock3 size={15} aria-hidden="true" />
            {formation.readingMinutes} min
          </span>
        </div>
      </div>
    </article>
  );
}

/** Fila compacta de formación con miniportada (selector de áreas de la portada de Aprender). */
export function FormationRow({ formation, status }: { formation: Formation; status: FormationStatus }) {
  const term = coverTermOf(formation);
  // En la miniportada el término puede partirse en dos líneas: se ajusta a la palabra más larga.
  const longest = Math.max(...term.split(/\s+/).map((w) => w.length));
  const fit = Math.max(3, longest, Math.ceil(term.length / 2));
  return (
    <li className={styles.row} data-area={formation.area}>
      <span className={styles.mini} aria-hidden="true">
        <span className={styles.miniBand} />
        <span className={styles.miniTerm} style={cssVars({ '--fit': fit })}>
          {term}
        </span>
      </span>
      <span className={styles.rowText}>
        <Link to={formationPath(formation)} className={`${styles.stretch} ${styles.rowTitle}`}>
          {formation.title}
        </Link>
        <span className={styles.rowMeta}>
          <StatusGlyph status={status} size={18} />
          <span className={styles.sep} aria-hidden="true" />
          <span>{formation.readingMinutes} min</span>
        </span>
      </span>
      <ArrowRight className={styles.rowArrow} size={18} aria-hidden="true" />
    </li>
  );
}

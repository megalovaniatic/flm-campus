import { monthShort } from '@flm/shared';
import styles from './DateMark.module.css';

interface DateMarkProps {
  /** «AAAA-MM-DD»; sin fecha, se dibuja el círculo discontinuo «por fijar». */
  dateKey?: string;
  /** Leyenda pequeña sobre el día: «hasta», «hoy», «próxima». */
  caption?: string;
  size?: 'lg' | 'md' | 'sm';
  /** «current»: en curso (círculo lleno) · «muted»: histórico. */
  tone?: 'default' | 'current' | 'muted';
}

/**
 * Círculo de fecha de la agenda: día en Newsreader y mes en versalitas.
 * Es decorativo: la fecha completa siempre se escribe junto a él.
 */
export function DateMark({ dateKey, caption, size = 'lg', tone = 'default' }: DateMarkProps) {
  if (!dateKey) {
    return (
      <span className={styles.mark} data-size={size} data-pending="true" aria-hidden="true">
        <svg className={styles.ring} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48.5" pathLength={100} />
        </svg>
        <span className={styles.pending}>
          por
          <br />
          fijar
        </span>
      </span>
    );
  }
  const m = Number(dateKey.slice(5, 7));
  const d = Number(dateKey.slice(8, 10));
  return (
    <span className={styles.mark} data-size={size} data-tone={tone} aria-hidden="true">
      {caption && <span className={styles.caption}>{caption}</span>}
      <span className={styles.day}>{d}</span>
      <span className={styles.month}>{monthShort(m)}</span>
    </span>
  );
}

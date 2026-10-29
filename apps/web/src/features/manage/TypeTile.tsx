import type { ContentType } from '@flm/shared';
import { TYPE_META } from './model';
import styles from './TypeTile.module.css';

/** Tipo de contenido: rectángulo de radio pequeño con su icono (el texto va siempre al lado). */
export function TypeTile({ type, size = 32 }: { type: ContentType; size?: number }) {
  const Icon = TYPE_META[type].icon;
  return (
    <span className={styles.tile} style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={Math.round(size * 0.5)} />
    </span>
  );
}

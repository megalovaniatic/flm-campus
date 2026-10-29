import type { CSSProperties } from 'react';
import styles from './Mascot.module.css';

/** Ilustraciones de los búhos de FLM (fondo transparente, recortadas a su contorno). */
const MASCOTS = {
  /** Aprender: el búho sentado, leyendo. */
  'buho-leyendo': { width: 1196, height: 1237, widths: [155, 232, 348, 464] },
  /** Consultar: el búho sacando un libro de la estantería. */
  'buho-biblioteca': { width: 1190, height: 1164, widths: [164, 245, 368, 491] },
  /** Participar: dos búhos encajando las piezas de un puzle. */
  'buho-equipo': { width: 1214, height: 1026, widths: [189, 284, 426, 568] },
} as const;

export type MascotName = keyof typeof MASCOTS;

const base = import.meta.env.BASE_URL;

/**
 * Búho de la cabecera de un destino: entero, sin marco, a la misma altura en todas las páginas y de pie
 * sobre la línea que cierra la cabecera, con un círculo suave detrás. Es decorativo: el titular ya dice dónde estás.
 */
export function Mascot({ name }: { name: MascotName }) {
  const m = MASCOTS[name];
  const aspect = m.width / m.height;
  const srcSet = (ext: string) => m.widths.map((w) => `${base}img/ilustraciones/${name}-${w}.${ext} ${w}w`).join(', ');
  // Alto de 8rem en móvil y hasta 15rem en escritorio: el ancho sale de la proporción de cada ilustración
  const sizes = `(max-width: 860px) ${(8 * aspect).toFixed(2)}rem, ${(15 * aspect).toFixed(2)}rem`;
  return (
    <div className={styles.mascot} style={{ '--ar': aspect } as CSSProperties}>
      <picture>
        <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
        <img className={styles.img} src={`${base}img/ilustraciones/${name}-${m.widths[1]}.webp`} alt="" width={m.width} height={m.height} decoding="async" fetchPriority="high" />
      </picture>
    </div>
  );
}

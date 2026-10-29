import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { useReducedMotionPref } from '@/lib/preferences';
import { Picture, type PhotoName } from './Picture';
import styles from './PhotoCapsule.module.css';

interface PhotoCapsuleProps {
  name: PhotoName;
  /** Proporción de la cápsula: «12 / 5» (lugar, horizontal) o «5 / 7» (vertical). */
  aspect?: '12 / 5' | '5 / 7';
  width?: string;
  position?: string;
  sizes?: string;
  priority?: boolean;
  /** Decorativa por defecto: el texto de la cabecera ya explica la página. */
  decorative?: boolean;
  caption?: string;
  /** En pantallas estrechas: a todo el ancho o sin foto (con «hide» no se descarga). */
  mobile?: 'full' | 'hide';
}

/**
 * Foto real de FLM en cápsula (lugar), en color natural y sin texto encima.
 * Nace como círculo y se abre en cápsula, como en la gramática de formas.
 */
export function PhotoCapsule({ name, aspect = '12 / 5', width = 'clamp(15rem, 25vw, 24rem)', position, sizes = '(min-width: 860px) 24rem, 92vw', priority = false, decorative = true, caption, mobile = 'full' }: PhotoCapsuleProps) {
  const reduce = useReducedMotionPref();
  const [w, h] = aspect.split('/').map((n) => Number(n.trim())) as [number, number];
  // Del círculo inscrito a la cápsula completa: se recorta el lado largo hasta igualar el corto
  const from = w >= h ? `inset(0% ${((1 - h / w) / 2) * 100}% 0% ${((1 - h / w) / 2) * 100}% round 999px)` : `inset(${((1 - w / h) / 2) * 100}% 0% ${((1 - w / h) / 2) * 100}% 0% round 999px)`;
  return (
    <figure className={styles.figure} data-mobile={mobile} style={{ '--pc-w': width, '--pc-ar': aspect } as CSSProperties}>
      <motion.div
        className={styles.capsule}
        initial={reduce ? false : { clipPath: from }}
        animate={{ clipPath: 'inset(0% 0% 0% 0% round 999px)' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        <Picture name={name} sizes={sizes} priority={priority && mobile !== 'hide'} decorative={decorative} position={position} />
      </motion.div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

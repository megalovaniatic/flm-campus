import { useState } from 'react';
import manifest from '@/assets/images.json';
import styles from './Picture.module.css';

export type PhotoName = keyof typeof manifest;

interface PictureProps {
  name: PhotoName;
  /** Atributo sizes para elegir la resolución adecuada. */
  sizes?: string;
  className?: string;
  /** Prioridad alta para la imagen principal de la pantalla. */
  priority?: boolean;
  /** Si la imagen es decorativa (el texto ya lo explica). */
  decorative?: boolean;
  position?: string;
}

const base = import.meta.env.BASE_URL;

/** Fotografía real de FLM en AVIF/WebP responsive con marcador difuminado (sin saltos de diseño). */
export function Picture({ name, sizes = '100vw', className, priority = false, decorative = false, position = 'center' }: PictureProps) {
  const meta = manifest[name];
  const [loaded, setLoaded] = useState(false);
  const srcset = (ext: string) => meta.sizes.map((w) => `${base}img/photos/${name}-${w}.${ext} ${w}w`).join(', ');
  const fallback = `${base}img/photos/${name}-${meta.sizes[Math.min(1, meta.sizes.length - 1)]}.webp`;
  return (
    <span className={[styles.frame, className ?? ''].join(' ')} style={{ backgroundImage: `url(${meta.placeholder})` }} data-loaded={loaded}>
      <picture>
        <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
        <img
          src={fallback}
          alt={decorative ? '' : meta.alt}
          width={meta.width}
          height={meta.height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={{ objectPosition: position }}
        />
      </picture>
    </span>
  );
}

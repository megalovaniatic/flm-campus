import { useState } from 'react';
import { Avatar } from '@/design';
import { portraitFor } from './portraitCrop';
import styles from './Portrait.module.css';

const base = import.meta.env.BASE_URL;

/**
 * Retrato circular de la cabecera del perfil (círculo = persona real).
 * Usa el retrato en alta resolución con su encuadre; si no hay, la foto o las iniciales.
 */
export function Portrait({ name, photo, size = 152 }: { name: string; photo?: string; size?: number }) {
  const crop = portraitFor(photo);
  const [loaded, setLoaded] = useState(false);
  if (!crop) {
    return (
      <span className={styles.ring} style={{ width: size + 8, height: size + 8 }}>
        <Avatar name={name} photo={photo ? base + photo : undefined} size={size} />
      </span>
    );
  }
  return (
    <span className={styles.ring} style={{ width: size + 8, height: size + 8 }}>
      <span className={styles.frame} role="img" aria-label={`Fotografía de ${name}`} style={{ width: size, height: size }} data-loaded={loaded}>
        <img
          src={crop.src}
          alt=""
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={{
            width: `${(crop.width / crop.size) * 100}%`,
            left: `${(-crop.x / crop.size) * 100}%`,
            top: `${(-crop.y / crop.size) * 100}%`,
          }}
        />
      </span>
    </span>
  );
}

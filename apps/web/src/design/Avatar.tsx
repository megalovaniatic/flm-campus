import { useState } from 'react';
import { initials } from '@flm/shared';
import styles from './Avatar.module.css';

const TONES = ['rojo', 'burdeos', 'marino', 'gris'] as const;

function toneFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

/** Avatar circular: fotografía aportada o iniciales (nunca imágenes inventadas). */
export function Avatar({ name, photo, size = 40, decorative = false }: { name: string; photo?: string; size?: number; decorative?: boolean }) {
  // Si la foto no carga (p. ej. una versión anterior en caché pide una ya retirada), quedan las iniciales
  const [failed, setFailed] = useState<string>();
  const label = decorative ? undefined : name;
  return (
    <span className={styles.avatar} data-tone={toneFor(name)} style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }} role={decorative ? undefined : 'img'} aria-label={label} aria-hidden={decorative || undefined}>
      {photo && failed !== photo ? <img src={photo} alt="" loading="lazy" decoding="async" onError={() => setFailed(photo)} /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}

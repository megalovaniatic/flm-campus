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
  const label = decorative ? undefined : name;
  return (
    <span className={styles.avatar} data-tone={toneFor(name)} style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }} role={decorative ? undefined : 'img'} aria-label={label} aria-hidden={decorative || undefined}>
      {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  );
}

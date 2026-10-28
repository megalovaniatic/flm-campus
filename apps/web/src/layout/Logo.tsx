const base = import.meta.env.BASE_URL;

const FILES = {
  horizontal: { file: 'flm-horizontal', w: 1314, h: 449, alt: 'FLM' },
  crowe: { file: 'flm-crowe-horizontal', w: 2277, h: 388, alt: 'FLM, a business associate of Crowe Global' },
  croweVertical: { file: 'flm-crowe-vertical', w: 1135, h: 656, alt: 'FLM, a business associate of Crowe Global' },
  diagonal: { file: 'flm-diagonal', w: 1314, h: 1315, alt: 'FLM' },
  vertical: { file: 'flm-vertical', w: 448, h: 1315, alt: 'FLM' },
  fiscal: { file: 'flm-fiscal', w: 1471, h: 294, alt: 'FLM Fiscal' },
  laboral: { file: 'flm-laboral', w: 1700, h: 295, alt: 'FLM Laboral' },
  mercantil: { file: 'flm-mercantil', w: 1922, h: 294, alt: 'FLM Mercantil' },
} as const;

export type LogoVariant = keyof typeof FILES;

/**
 * Logotipo ORIGINAL de FLM (archivos aportados, con transparencia).
 * Nunca se recolorea ni se recompone; en modo oscuro va sobre una placa clara.
 */
export function Logo({ variant = 'horizontal', height = 32, decorative = false, className }: { variant?: LogoVariant; height?: number; decorative?: boolean; className?: string }) {
  const f = FILES[variant];
  const width = Math.round((f.w / f.h) * height);
  return (
    <span className={['logo-plate', className ?? ''].join(' ')}>
      <picture>
        <source type="image/webp" srcSet={`${base}brand/${f.file}.webp`} />
        <img src={`${base}brand/${f.file}.png`} alt={decorative ? '' : f.alt} width={width} height={height} style={{ width, height }} decoding="async" />
      </picture>
    </span>
  );
}

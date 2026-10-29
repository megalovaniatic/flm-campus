/**
 * Retratos en alta resolución aportados por FLM, con el encuadre de cabeza y hombros
 * (coordenadas en píxeles del archivo original). Si una persona no tiene retrato,
 * se usa su fotografía de perfil o, en su defecto, sus iniciales.
 */
const base = import.meta.env.BASE_URL;

export interface PortraitCrop {
  /** Ruta pública del retrato original. */
  src: string;
  width: number;
  height: number;
  /** Cuadrado de encuadre dentro del original. */
  x: number;
  y: number;
  size: number;
}

const PORTRAITS: Record<string, Omit<PortraitCrop, 'src'> & { file: string }> = {
  'img/people/angel-ceniceros.webp': { file: 'img/people/angel-ceniceros-retrato.webp', width: 900, height: 1350, x: 120, y: 215, size: 600 },
};

/** Retrato encuadrado de una persona (si existe uno en alta resolución). */
export function portraitFor(photo: string | undefined): PortraitCrop | undefined {
  if (!photo) return undefined;
  const p = PORTRAITS[photo];
  if (!p) return undefined;
  const { file, ...crop } = p;
  return { ...crop, src: base + file };
}

/** Posición del retrato dentro de un círculo de diámetro `d` (en las mismas unidades que `d`). */
export function cropBox(crop: PortraitCrop, d: number) {
  const k = d / crop.size;
  return { x: -crop.x * k, y: -crop.y * k, width: crop.width * k, height: crop.height * k };
}

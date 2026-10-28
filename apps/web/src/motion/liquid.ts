/**
 * Geometría de los conectores líquidos (inspirada en la versión diagonal del logotipo FLM).
 * Devuelve el «puente» entre dos círculos; dibujado junto a ambos círculos con el mismo
 * relleno forma una única silueta continua. `spread` (0–1) controla cuánto se abre el cuello:
 * animarlo de 0 a ~0,5 hace que el líquido «pase» de un círculo a otro.
 */
type Pt = [number, number];

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const angle = (a: Pt, b: Pt) => Math.atan2(a[1] - b[1], a[0] - b[0]);
const vec = (c: Pt, a: number, r: number): Pt => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
const fmt = (p: Pt) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;

export function bridgePath(c1: Pt, r1: number, c2: Pt, r2: number, spread = 0.5, handleSize = 2.4): string {
  const d = dist(c1, c2);
  if (spread <= 0.001 || d <= Math.abs(r1 - r2) || d > (r1 + r2) * 2.2) return '';
  let u1 = 0;
  let u2 = 0;
  if (d < r1 + r2) {
    u1 = Math.acos(Math.min(1, Math.max(-1, (r1 * r1 + d * d - r2 * r2) / (2 * r1 * d))));
    u2 = Math.acos(Math.min(1, Math.max(-1, (r2 * r2 + d * d - r1 * r1) / (2 * r2 * d))));
  }
  const between = angle(c2, c1);
  const maxSpread = Math.acos(Math.min(1, Math.max(-1, (r1 - r2) / d)));
  const a1 = between + u1 + (maxSpread - u1) * spread;
  const a2 = between - u1 - (maxSpread - u1) * spread;
  const a3 = between + Math.PI - u2 - (Math.PI - u2 - maxSpread) * spread;
  const a4 = between - Math.PI + u2 + (Math.PI - u2 - maxSpread) * spread;
  const p1 = vec(c1, a1, r1);
  const p2 = vec(c1, a2, r1);
  const p3 = vec(c2, a3, r2);
  const p4 = vec(c2, a4, r2);
  const total = r1 + r2;
  const d2 = Math.min(spread * handleSize, dist(p1, p3) / total) * Math.min(1, (d * 2) / total);
  const h1 = vec(p1, a1 - Math.PI / 2, r1 * d2);
  const h2 = vec(p2, a2 + Math.PI / 2, r1 * d2);
  const h3 = vec(p3, a3 + Math.PI / 2, r2 * d2);
  const h4 = vec(p4, a4 - Math.PI / 2, r2 * d2);
  return `M ${fmt(p1)} C ${fmt(h1)} ${fmt(h3)} ${fmt(p3)} L ${fmt(p4)} C ${fmt(h4)} ${fmt(h2)} ${fmt(p2)} Z`;
}

/** Interpolación con curva de salida suave. */
export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
/** Progreso local de un tramo [a, b] dentro de una línea de tiempo 0–1. */
export const segment = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));

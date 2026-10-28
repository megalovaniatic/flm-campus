/** Normaliza texto en castellano para búsquedas: minúsculas y sin diacríticos (la ñ se conserva). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ñ/g, '\u0000')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0000/g, 'ñ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Elimina el formato ligero (**, *, [[ ]], enlaces) para obtener texto plano. */
export function plainText(rich: string): string {
  return rich
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');
}

export function wordCount(text: string): number {
  return plainText(text).split(/\s+/).filter(Boolean).length;
}

export function slugify(text: string): string {
  return normalize(text)
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter((p) => p.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(p));
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

/** Formato de importes en euros con convenciones españolas. */
export function euros(value: number, decimals = 2): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export function percent(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-ES', { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export function number(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

/** Tamaño de archivo legible: «1,2 MB». */
export function fileSize(kb: number): string {
  if (kb < 1024) return `${number(kb)} KB`;
  return `${number(kb / 1024, 1)} MB`;
}

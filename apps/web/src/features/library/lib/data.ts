/**
 * Datos de «Consultar»: actualidad, documentos y lecturas publicados en el campus.
 *
 * Mientras el equipo editorial redacta la actualidad y las lecturas, en DESARROLLO se puede
 * añadir contenido de muestra con ?muestra=1 en la dirección (antes o después de la #).
 * En producción la muestra no existe: `import.meta.env.DEV` es false al compilar.
 */
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { NewsItem, Reading } from '@flm/shared';
import { readings, useNews } from '@/data/selectors';
import { SAMPLE_NEWS, SAMPLE_READINGS } from '../dev/muestras';

const SAMPLES = import.meta.env.DEV ? { news: SAMPLE_NEWS, readings: SAMPLE_READINGS } : null;

export const isSample = (id: string) => id.startsWith('muestra-');

function outerFlag(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('muestra') === '1';
  } catch {
    return false;
  }
}

/** true solo en desarrollo y con ?muestra=1 en la dirección. */
export function useSampleMode(): boolean {
  const [params] = useSearchParams();
  if (!SAMPLES) return false;
  return params.get('muestra') === '1' || outerFlag();
}

/**
 * Enlaces internos de la sección: si la muestra se activó dentro de la ruta (#/…?muestra=1),
 * se conserva al navegar para que el detalle encuentre el contenido de muestra.
 */
export function useLibLink(): (to: string) => string {
  const [params] = useSearchParams();
  const keep = !!SAMPLES && params.get('muestra') === '1';
  return useCallback((to: string) => (keep && !/[?&]muestra=1/.test(to) ? `${to}${to.includes('?') ? '&' : '?'}muestra=1` : to), [keep]);
}

/** Actualidad publicada (más reciente primero), con la muestra si está activa. */
export function useLibraryNews(): NewsItem[] {
  const news = useNews();
  const sample = useSampleMode();
  return useMemo(() => (sample && SAMPLES ? [...news, ...SAMPLES.news].sort((a, b) => b.date.localeCompare(a.date)) : news), [news, sample]);
}

/** Lecturas recomendadas, con la muestra si está activa. */
export function useLibraryReadings(): Reading[] {
  const sample = useSampleMode();
  return useMemo(() => (sample && SAMPLES ? [...readings, ...SAMPLES.readings] : readings), [sample]);
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { madridDateKey } from '@flm/shared';

/** Coincidencia con una consulta de medios (se actualiza al girar o redimensionar). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/** Ancho disponible de un elemento (ResizeObserver), medido antes de pintar. */
export function useElementWidth<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Fecha de hoy en Madrid; se actualiza si la persona vuelve a la pestaña otro día. */
export function useToday(): string {
  const [today, setToday] = useState(() => madridDateKey());
  useEffect(() => {
    const on = () => {
      if (document.visibilityState === 'visible') setToday(madridDateKey());
    };
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return today;
}

/** Instante de referencia para calcular fases (estable durante el día). */
export function useNow(today: string): Date {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => new Date(), [today]);
}

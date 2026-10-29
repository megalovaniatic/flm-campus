import { useEffect, useState, type CSSProperties } from 'react';

/** Variables CSS en línea con tipos (p. ej. `--fit`). */
export const cssVars = (vars: Record<string, string | number>): CSSProperties => vars as unknown as CSSProperties;

/** Escucha una consulta de medios (sin parpadeo en el primer render del navegador). */
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

export const capitalize = (s: string) => (s ? s.charAt(0).toLocaleUpperCase('es-ES') + s.slice(1) : s);

/** Baraja (Fisher-Yates) sin modificar el original. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Letra de opción (A, B, C…): se muestra fuera del círculo, nunca dentro. */
export const letter = (i: number) => String.fromCharCode(65 + i);

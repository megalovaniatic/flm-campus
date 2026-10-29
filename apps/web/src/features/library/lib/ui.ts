import { useEffect, useState } from 'react';
import buttonStyles from '@/design/Button.module.css';

/**
 * Clases del botón del sistema para enlaces nativos (<a> de PDF o externos), que no pueden
 * usar ButtonLink porque no son rutas del campus.
 */
export function buttonClass(variant: 'primary' | 'secondary' | 'soft' | 'ghost' = 'secondary', size: 'sm' | 'md' | 'lg' = 'md', extra?: string) {
  return [buttonStyles.button, buttonStyles[variant], buttonStyles[size], extra].filter(Boolean).join(' ');
}

export const buttonIconClass = buttonStyles.icon;
export const buttonLabelClass = buttonStyles.label;

/** Valor con retardo: para anunciar resultados sin interrumpir a quien escribe. */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

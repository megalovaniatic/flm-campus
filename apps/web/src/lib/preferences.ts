import { useEffect, useState } from 'react';
import { useDemo } from '@/data/store';

/** Aplica tema (claro/oscuro/sistema) y preferencia de movimiento al documento. */
export function usePreferenceEffects() {
  const theme = useDemo((s) => s.theme);
  const motion = useDemo((s) => s.motion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'oscuro' || (theme === 'sistema' && mq.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  useEffect(() => {
    if (motion === 'reducido') document.documentElement.dataset.motion = 'reduce';
    else delete document.documentElement.dataset.motion;
  }, [motion]);
}

/** true si hay que reducir el movimiento (ajuste del sistema o del campus). */
export function useReducedMotionPref(): boolean {
  const pref = useDemo((s) => s.motion);
  const [system, setSystem] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setSystem(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  if (pref === 'reducido') return true;
  if (pref === 'completo') return false;
  return system;
}

/** Título del documento: «Sección · FLM Campus». */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · FLM Campus` : 'FLM Campus';
  }, [title]);
}

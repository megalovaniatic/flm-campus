import { animate, useInView } from 'motion/react';
import { useEffect, useState, type RefObject } from 'react';
import { useReducedMotionPref } from '@/lib/preferences';

/**
 * Línea de tiempo 0–1 para las demostraciones del dosier: se reproduce una vez al entrar en
 * pantalla y de nuevo cada vez que cambia `run`. Con movimiento reducido, estado final directo.
 */
export function useTimeline(ref: RefObject<Element | null>, duration: number, run = 0): { t: number; reduce: boolean } {
  const reduce = useReducedMotionPref();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [t, setT] = useState(() => (reduce ? 1 : 0));

  useEffect(() => {
    if (reduce) {
      setT(1);
      return;
    }
    if (!inView) return;
    setT(0);
    const controls = animate(0, 1, { duration, ease: 'linear', onUpdate: setT });
    return () => controls.stop();
  }, [inView, run, reduce, duration]);

  return { t, reduce };
}

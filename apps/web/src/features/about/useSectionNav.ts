import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useDemo } from '@/data/store';
import { useReducedMotionPref } from '@/lib/preferences';

function prefersReduced(): boolean {
  if (useDemo.getState().motion === 'reducido') return true;
  if (useDemo.getState().motion === 'completo') return false;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Desplaza hasta una sección y lleva el foco a su título (para teclado y lectores de pantalla). */
export function scrollToSection(id: string, reduce: boolean = prefersReduced()) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  const target = el.matches('h1, h2, h3') ? el : el.querySelector<HTMLElement>('h2, h3');
  if (target) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}

/**
 * Navegación por secciones ancladas con rutas «hash» (#/sobre#privacidad):
 * al cambiar el ancla, desplaza hasta la sección y lleva el foco a su título.
 */
export function useHashScroll(ready = true) {
  const { hash } = useLocation();
  const reduce = useReducedMotionPref();

  useEffect(() => {
    if (!ready || !hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => scrollToSection(id, reduce), 90);
    return () => window.clearTimeout(timer);
  }, [hash, ready, reduce]);
}

/** Sección visible ahora mismo (para marcar el índice), según el orden de `ids`. */
export function useScrollSpy(ids: readonly string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0]);
  const key = ids.join('|');

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!elements.length || typeof IntersectionObserver === 'undefined') return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        const first = ids.find((id) => visible.get(id));
        if (first) setActive(first);
      },
      { rootMargin: '-22% 0px -62% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}

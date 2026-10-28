import { MotionConfig } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Navigate, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { Toaster } from '@/design';
import { useDemo } from '@/data/store';
import { CommandPalette } from '@/features/search/CommandPalette';
import { usePreferenceEffects, useReducedMotionPref } from '@/lib/preferences';
import { DemoBand } from './DemoBand';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileTabBar } from './MobileTabBar';
import { OfflineBanner } from './OfflineBanner';
import styles from './AppShell.module.css';

/** Estructura común: cabecera, navegación móvil, contenido, pie y capas globales. */
export function AppShell() {
  usePreferenceEffects();
  const reduce = useReducedMotionPref();
  const userId = useDemo((s) => s.userId);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Al cambiar de página, el foco pasa al contenido principal y se anuncia el título.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      mainRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  if (!userId) return <Navigate to="/acceso" replace />;

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      {__DEMO__ && <DemoBand />}
      <Header />
      <OfflineBanner />
      <main id="contenido" ref={mainRef} tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <CommandPalette />
      <Toaster />
      <ScrollRestoration />
    </MotionConfig>
  );
}

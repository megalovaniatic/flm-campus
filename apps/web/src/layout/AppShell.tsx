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
  // Ruta anterior: solo se mueve el foco cuando la ruta cambia de verdad
  // (un indicador «primera vez» falla con el doble montaje de StrictMode en desarrollo).
  const prevPath = useRef(location.pathname);

  // Al cambiar de página, el foco pasa al contenido principal y se anuncia el título.
  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;
    const id = window.setTimeout(() => {
      mainRef.current?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  if (!userId) return <Navigate to="/acceso" replace />;

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <a
        className="skip-link"
        href="#contenido"
        onClick={(e) => {
          // Con rutas en el hash, «#contenido» se leería como una página (404): el foco se mueve a mano.
          e.preventDefault();
          const main = mainRef.current;
          if (!main) return;
          main.focus({ preventScroll: true });
          main.scrollIntoView({ block: 'start' });
        }}
      >
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

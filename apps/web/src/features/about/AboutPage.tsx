import { motion } from 'motion/react';
import { Link } from 'react-router';
import { PageHeader } from '@/design';
import { usePageTitle } from '@/lib/preferences';
import { Architecture } from './Architecture';
import { Brand } from './Brand';
import { Concept } from './Concept';
import { LiveSystem } from './LiveSystem';
import { Accessibility, Credits, DemoVsPrivate, Privacy } from './Statements';
import { scrollToSection, useHashScroll, useScrollSpy } from './useSectionNav';
import styles from './AboutPage.module.css';

const SECTIONS = [
  { id: 'concepto', label: 'Concepto' },
  { id: 'marca', label: 'Marca' },
  { id: 'sistema', label: 'Sistema de diseño' },
  { id: 'arquitectura', label: 'Arquitectura' },
  { id: 'accesibilidad', label: 'Accesibilidad' },
  { id: 'privacidad', label: 'Privacidad' },
  { id: 'demo', label: 'Demo y versión interna' },
  { id: 'creditos', label: 'Créditos' },
] as const;

const IDS = SECTIONS.map((s) => s.id);

/** «Sobre el campus»: dosier del proyecto con secciones ancladas (#concepto … #creditos). */
export default function AboutPage() {
  usePageTitle('Sobre el campus');
  useHashScroll();
  const active = useScrollSpy(IDS);

  return (
    <div className={`container page ${styles.page}`}>
      <PageHeader
        eyebrow="Dosier del proyecto"
        title="Sobre el campus"
        lede="Cómo está pensado FLM Campus, de dónde sale cada decisión y qué es real en esta demostración."
      />

      <div className={styles.layout}>
        <nav aria-label="Índice del dosier" className={styles.toc}>
          <p className={styles.tocTitle}>En esta página</p>
          <ol className={styles.tocList}>
            {SECTIONS.map((s, i) => {
              const current = active === s.id;
              return (
                <li key={s.id}>
                  <Link to={{ hash: `#${s.id}` }} onClick={() => scrollToSection(s.id)} aria-current={current ? 'true' : undefined} className={styles.tocLink}>
                    <span className={styles.tocNum} aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{s.label}</span>
                    {current && <motion.span layoutId="sobre-toc" className={styles.tocDot} transition={{ type: 'spring', stiffness: 520, damping: 34 }} />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className={styles.content}>
          <Concept />
          <Brand />
          <LiveSystem />
          <Architecture />
          <Accessibility />
          <Privacy />
          <DemoVsPrivate />
          <Credits />
        </div>
      </div>
    </div>
  );
}

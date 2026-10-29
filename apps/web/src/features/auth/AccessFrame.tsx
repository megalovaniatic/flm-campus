import { MotionConfig, motion, type Variants } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/layout/Logo';
import { asset } from '@/lib/download';
import { usePreferenceEffects, useReducedMotionPref } from '@/lib/preferences';
import styles from './AccessPage.module.css';

export const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Marco de las pantallas sin la estructura común del campus (acceso, activar la cuenta y nueva contraseña):
 * pieza oficial de FLM a un lado y, al otro, el logotipo, el titular y el contenido de cada pantalla.
 */
export function AccessFrame({ title, lede, children }: { title: string; lede: ReactNode; children: ReactNode }) {
  usePreferenceEffects();
  const reduce = useReducedMotionPref();
  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <div className={styles.page}>
        <main className={styles.main}>
          <motion.figure className={styles.art} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <img
              src={asset('brand/flm-redes.png')}
              alt="Pieza oficial de FLM para redes: las letras F, L y M en tres círculos blancos sobre grandes círculos translúcidos en rojo, burdeos y azul."
              width={1073}
              height={1073}
              className={styles.artImg}
              decoding="async"
              fetchPriority="high"
            />
            <figcaption className={styles.caption}>Pieza oficial de FLM para redes sociales</figcaption>
          </motion.figure>

          <motion.div className={styles.panel} initial={reduce ? false : 'hidden'} animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}>
            <motion.div variants={rise} className={styles.brand}>
              <Logo variant="crowe" height={40} />
            </motion.div>
            <motion.div variants={rise} className={styles.intro}>
              <p className="eyebrow">Campus · uso interno</p>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.lede}>{lede}</p>
            </motion.div>

            {children}

            <motion.div variants={rise} className={styles.foot}>
              <p>
                <ShieldCheck size={15} aria-hidden="true" /> Solo usamos cookies técnicas para mantener la sesión. Sin analítica ni seguimiento.
              </p>
              <p>
                FLM · Barcelona · Vic · Granollers ·{' '}
                <a href="https://flmexperts.com/" target="_blank" rel="noreferrer">
                  flmexperts.com<span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}

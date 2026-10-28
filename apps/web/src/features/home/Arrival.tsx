import { stagger, useAnimate } from 'motion/react';
import { Fragment, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { madridDateKey, madridParts, formatWeekdayDate } from '@flm/shared';
import { Picture } from '@/design';
import { useDemo } from '@/data/store';
import { useReducedMotionPref } from '@/lib/preferences';
import styles from './Arrival.module.css';

function greeting(): string {
  const h = madridParts(new Date()).hour;
  if (h >= 6 && h < 14) return 'Buenos días';
  if (h >= 14 && h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Palabras con máscara para que suban dentro de su línea. */
function Words({ text, tail }: { text: string; tail?: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className={`${styles.word} a-word`}>
            <span>
              {w}
              {i === words.length - 1 && tail ? <span className={styles.tail}>{tail}</span> : null}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}

function Phrase({ to, index, children, hint, tail }: { to: string; index: number; children: string; hint: string; tail?: string }) {
  const link = (
    <Link to={to} className={`${styles.phrase} a-phrase-${index}`} data-index={index}>
      <Words text={children} />
      <span className="sr-only"> ({hint})</span>
    </Link>
  );
  if (!tail) return link;
  return (
    <span className={styles.nowrap}>
      {link}
      <span className={`${styles.word} ${styles.glue} a-word`}>
        <span>{tail}</span>
      </span>
    </span>
  );
}

/**
 * Momento firma «La llegada»: una vez al día, ≤ 1,5 s, interrumpible.
 * El titular es el menú: las tres expresiones enlazan con Consultar, Participar y Aprender,
 * subrayadas con el degradado oficial en orden de lectura, y el punto final es el círculo rojo.
 */
export function Arrival({ firstName, aside }: { firstName: string; aside?: ReactNode }) {
  const reduce = useReducedMotionPref();
  const arrivalDay = useDemo((s) => s.arrivalDay);
  const setArrivalDay = useDemo((s) => s.setArrivalDay);
  const today = madridDateKey();
  const [play] = useState(() => !reduce && arrivalDay !== today);
  const [scope, animate] = useAnimate();
  const hello = useMemo(greeting, []);

  useLayoutEffect(() => {
    if (!play) return;
    const seq = animate([
      ['.a-eyebrow', { opacity: [0, 1], y: [6, 0] }, { duration: 0.24, at: 0 }],
      ['.a-word > span', { y: ['108%', '0%'] }, { duration: 0.6, delay: stagger(0.028), ease: [0.22, 1, 0.36, 1], at: 0.1 }],
      ['.a-photo', { clipPath: ['inset(31% 27% 31% 27% round 999px)', 'inset(0% 0% 0% 0% round 999px)'] }, { duration: 0.75, ease: [0.22, 1, 0.36, 1], at: 0.2 }],
      ['.a-photo img', { scale: [1.12, 1] }, { duration: 1.1, ease: [0.22, 1, 0.36, 1], at: 0.2 }],
      ['.a-support', { opacity: [0, 1], y: [8, 0] }, { duration: 0.38, at: 0.55 }],
      ['.a-phrase-0', { backgroundSize: ['0% 3px', '100% 3px'] }, { duration: 0.2, ease: [0.65, 0, 0.35, 1], at: 0.72 }],
      ['.a-phrase-1', { backgroundSize: ['0% 3px', '100% 3px'] }, { duration: 0.24, ease: [0.65, 0, 0.35, 1], at: 0.93 }],
      ['.a-phrase-2', { backgroundSize: ['0% 3px', '100% 3px'] }, { duration: 0.16, ease: [0.65, 0, 0.35, 1], at: 1.18 }],
      ['.a-dot', { scale: [0, 1] }, { type: 'spring', stiffness: 520, damping: 22, at: 1.3 }],
      ['.a-card', { opacity: [0, 1], y: [16, 0] }, { duration: 0.34, delay: stagger(0.07), ease: [0.22, 1, 0.36, 1], at: 0.82 }],
    ]);
    const finish = () => seq.complete();
    const opts = { once: true, passive: true } as const;
    window.addEventListener('keydown', finish, opts);
    window.addEventListener('pointerdown', finish, opts);
    window.addEventListener('wheel', finish, opts);
    window.addEventListener('touchmove', finish, opts);
    setArrivalDay(today);
    return () => {
      seq.stop();
      window.removeEventListener('keydown', finish);
      window.removeEventListener('pointerdown', finish);
      window.removeEventListener('wheel', finish);
      window.removeEventListener('touchmove', finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!play) setArrivalDay(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={scope} className={styles.arrival} data-play={play}>
      <div className={styles.text}>
        <p className={`eyebrow ${styles.eyebrow} a-eyebrow`}>
          <span className={styles.date}>{formatWeekdayDate(today)}</span>
          <span aria-hidden="true"> · </span>
          {hello}, {firstName}
        </p>
        <h1 className={styles.title}>
          <Words text="Tu espacio para" />{' '}
          <Phrase to="/consultar/actualidad" index={0} hint="Actualidad en tu sector" tail=",">
            estar al día
          </Phrase>{' '}
          <Phrase to="/participar" index={1} hint="Participar">
            compartir conocimiento
          </Phrase>{' '}
          <Words text="y" />{' '}
          <Phrase to="/aprender" index={2} hint="Aprender">
            avanzar
          </Phrase>{' '}
          <Words text="en FLM" />
          <span className={`${styles.dot} a-dot`} aria-hidden="true" />
          <span className="sr-only">.</span>
        </h1>
        <p className={`${styles.support} a-support`}>Apostamos por tu formación y tu crecimiento.</p>
      </div>
      <figure className={styles.figure}>
        <div className={`${styles.photo} a-photo`}>
          <Picture name="fachada" sizes="(min-width: 1024px) 34vw, 80vw" priority decorative />
        </div>
        <figcaption className={styles.caption}>Nuestra oficina de Barcelona, en la calle Bailèn</figcaption>
      </figure>
      {aside && <div className={styles.aside}>{aside}</div>}
    </div>
  );
}

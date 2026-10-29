import { motion } from 'motion/react';
import { FileText, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getThumb, peekThumb, type Thumb } from '../lib/pdfThumbs';
import styles from './DocThumb.module.css';

interface DocThumbProps {
  /** URL del PDF; sin URL (documento interno) se muestra la página bloqueada. */
  src?: string;
  /** Formato esperado mientras carga (las presentaciones son apaisadas). */
  landscape?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PORTRAIT = Math.SQRT2;
const LANDSCAPE = 9 / 16;

/**
 * Miniatura real de la primera página (pdf.js, perezoso). Mientras llega, una página
 * esquemática con la forma real del documento; al llegar, se «revela» como una prueba de imprenta.
 * Es decorativa: el título y los datos del documento ya están escritos al lado.
 */
export function DocThumb({ src, landscape = false, size = 'md' }: DocThumbProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<Thumb | null>(() => (src ? peekThumb(src) : null));
  const [fromCache] = useState(() => thumb !== null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src || thumb || failed) return;
    const el = ref.current;
    if (!el) return;
    let alive = true;
    const start = () =>
      getThumb(src).then(
        (t) => alive && setThumb(t),
        () => alive && setFailed(true),
      );
    if (typeof IntersectionObserver === 'undefined') {
      void start();
      return () => {
        alive = false;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void start();
        }
      },
      { rootMargin: '240px 0px' },
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
    };
  }, [src, thumb, failed]);

  const ratio = thumb?.ratio ?? (landscape ? LANDSCAPE : PORTRAIT);
  const state = !src ? 'locked' : thumb ? 'ready' : failed ? 'failed' : 'loading';

  return (
    <div ref={ref} className={styles.thumb} data-size={size} data-state={state} data-landscape={ratio < 1 || undefined} style={{ aspectRatio: `1 / ${ratio}` }} aria-hidden="true">
      {state === 'ready' && thumb ? (
        <motion.img
          src={thumb.src}
          alt=""
          draggable={false}
          className={styles.img}
          initial={fromCache ? false : { opacity: 0, scale: 1.025, filter: 'blur(3px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.42, ease: [0.2, 0, 0, 1] }}
        />
      ) : state === 'loading' ? (
        <span className={styles.sketch}>
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      ) : (
        <span className={styles.placeholder}>{state === 'locked' ? <Lock /> : <FileText />}</span>
      )}
    </div>
  );
}

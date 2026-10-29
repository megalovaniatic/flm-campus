import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import styles from './Toast.module.css';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastState {
  items: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => number;
  dismiss: (id: number) => void;
  /** Cierra todos los avisos (p. ej., al restablecer la demo: su «Deshacer» ya no tiene sentido). */
  clear: () => void;
}

let seq = 0;

export const useToasts = create<ToastState>((set) => ({
  items: [],
  push: (t) => {
    const id = ++seq;
    set((s) => ({ items: [...s.items.slice(-3), { ...t, id }] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

/**
 * Pulsar la acción de un aviso («Deshacer»…): solo si sigue abierto. Uno que ya se está cerrando, o que
 * «Restablecer» acaba de quitar, no la ejecuta aunque aún se vea durante su animación de salida.
 */
export function runToastAction(item: ToastItem): boolean {
  const { items, dismiss } = useToasts.getState();
  if (!items.some((i) => i.id === item.id)) return false;
  item.action?.onClick();
  dismiss(item.id);
  return true;
}

/** Atajo para lanzar avisos desde cualquier parte. */
export const toast = {
  info: (title: string, description?: string, action?: ToastItem['action']) => useToasts.getState().push({ title, description, tone: 'info', action }),
  success: (title: string, description?: string, action?: ToastItem['action']) => useToasts.getState().push({ title, description, tone: 'success', action }),
  error: (title: string, description?: string, action?: ToastItem['action']) => useToasts.getState().push({ title, description, tone: 'error', action, duration: 9000 }),
};

const ICON = { info: Info, success: CircleCheck, error: CircleAlert };

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToasts((s) => s.dismiss);
  const timer = useRef<number | undefined>(undefined);
  const start = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => dismiss(item.id), item.duration ?? 5200);
  };
  const stop = () => window.clearTimeout(timer.current);
  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const Icon = ICON[item.tone];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.16 } }}
      transition={{ type: 'spring', stiffness: 460, damping: 34 }}
      className={styles.toast}
      data-tone={item.tone}
      onMouseEnter={stop}
      onMouseLeave={start}
      onFocus={stop}
      onBlur={start}
    >
      <Icon className={styles.icon} size={20} aria-hidden="true" />
      <div className={styles.text}>
        <p className={styles.title}>{item.title}</p>
        {item.description && <p className={styles.description}>{item.description}</p>}
      </div>
      {item.action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => runToastAction(item)}
        >
          {item.action.label}
        </button>
      )}
      <button type="button" className={styles.close} aria-label="Cerrar aviso" onClick={() => dismiss(item.id)}>
        <X size={16} aria-hidden="true" />
      </button>
    </motion.li>
  );
}

export function Toaster() {
  const items = useToasts((s) => s.items);
  return (
    <div className={styles.region} role="region" aria-label="Avisos">
      <ol className={styles.list} aria-live="polite" aria-relevant="additions">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <ToastCard key={t.id} item={t} />
          ))}
        </AnimatePresence>
      </ol>
    </div>
  );
}

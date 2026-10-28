import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './Popover.module.css';

interface PopoverProps {
  /** Contenido del botón que abre el panel. */
  trigger: ReactNode;
  label: string;
  children: (close: () => void) => ReactNode;
  align?: 'start' | 'end';
  width?: number;
  triggerClassName?: string;
}

/**
 * Panel desplegable accesible (patrón disclosure): Esc y clic fuera lo cierran,
 * el foco entra en el panel al abrir y vuelve al botón al cerrar.
 */
export function Popover({ trigger, label, children, align = 'end', width = 320, triggerClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = (restore = true) => {
    setOpen(false);
    if (restore) button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"]), input');
      (first ?? panel.current)?.focus();
    }, 20);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={styles.root} ref={root}>
      <button ref={button} type="button" className={triggerClassName} aria-expanded={open} aria-controls={id} aria-label={label} onClick={() => setOpen((o) => !o)}>
        {trigger}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panel}
            id={id}
            role="region"
            aria-label={label}
            tabIndex={-1}
            className={styles.panel}
            data-align={align}
            style={{ width }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 36 }}
          >
            {children(() => close())}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

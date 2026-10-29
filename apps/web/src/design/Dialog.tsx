import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconButton } from './Button';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** «center»: diálogo centrado · «sheet»: panel lateral (abajo en móvil). */
  variant?: 'center' | 'sheet';
  size?: 'sm' | 'md' | 'lg';
  /** Impide cerrar con Esc o fuera del panel (p. ej. cambios sin guardar). */
  dismissable?: boolean;
}

/**
 * Diálogo modal accesible basado en <dialog> nativo:
 * capa superior, fondo inerte, foco atrapado y Esc para cerrar.
 */
export function Dialog({ open, onClose, title, description, children, footer, variant = 'center', size = 'md', dismissable = true }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      d.showModal();
      // Foco inicial en la acción segura marcada con data-autofocus («Cancelar», «Seguir con el test»);
      // sin marca, el navegador enfoca el primer control
      d.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    } else if (!open && d.open) {
      d.close();
      returnFocus.current?.focus?.();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={[styles.dialog, styles[variant], styles[size]].join(' ')}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissable) onClose();
      }}
      onClick={(e) => {
        if (dismissable && e.target === ref.current) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && (
              <div id={descId} className={styles.description}>
                {description}
              </div>
            )}
          </div>
          <IconButton label="Cerrar" icon={<X />} onClick={onClose} variant="soft" />
        </header>
        {children && <div className={styles.body}>{children}</div>}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}

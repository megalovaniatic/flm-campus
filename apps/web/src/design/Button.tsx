import { AnimatePresence, motion } from 'motion/react';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { Link, type LinkProps } from 'react-router';
import { Check, LoaderCircle } from 'lucide-react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Common {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  block?: boolean;
}

function classes({ variant = 'primary', size = 'md', block }: Common, extra?: string) {
  return [styles.button, styles[variant], styles[size], block ? styles.block : '', extra ?? ''].filter(Boolean).join(' ');
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Common & { ref?: Ref<HTMLButtonElement> };

export function Button({ variant, size, icon, iconRight, block, className, children, type = 'button', ref, ...rest }: ButtonProps) {
  return (
    <button ref={ref} type={type} className={classes({ variant, size, block }, className)} {...rest}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      {children && <span className={styles.label}>{children}</span>}
      {iconRight && <span className={styles.icon} aria-hidden="true">{iconRight}</span>}
    </button>
  );
}

export type ButtonLinkProps = LinkProps & Common;

export function ButtonLink({ variant, size, icon, iconRight, block, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={classes({ variant, size, block }, className)} {...rest}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span className={styles.label}>{children}</span>
      {iconRight && <span className={styles.icon} aria-hidden="true">{iconRight}</span>}
    </Link>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  variant?: 'ghost' | 'soft' | 'primary';
  size?: 'sm' | 'md';
  ref?: Ref<HTMLButtonElement>;
}

/** Botón circular de icono: siempre con nombre accesible. */
export function IconButton({ label, icon, variant = 'ghost', size = 'md', className, ref, ...rest }: IconButtonProps) {
  return (
    <button ref={ref} type="button" aria-label={label} title={label} className={[styles.iconButton, styles[`ib_${variant}`], styles[`ib_${size}`], className ?? ''].join(' ')} {...rest}>
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export type ActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  status: ActionStatus;
  label: string;
  pendingLabel?: string;
  successLabel?: string;
}

/**
 * Botón con respuesta de guardado/publicación: la cápsula se contrae en un círculo
 * con indicador mientras trabaja y vuelve a abrirse con la confirmación.
 */
export function ActionButton({ status, label, pendingLabel = 'Guardando…', successLabel = 'Guardado', icon, variant, size, className, disabled, onClick, ...rest }: ActionButtonProps) {
  const text = status === 'pending' ? pendingLabel : status === 'success' ? successLabel : label;
  const pending = status === 'pending';
  return (
    <motion.button
      layout
      transition={{ layout: { type: 'spring', stiffness: 420, damping: 34 } }}
      type="button"
      aria-live="polite"
      aria-busy={pending}
      // Mientras trabaja no se usa «disabled»: el botón perdería el foco y el teclado volvería al principio.
      aria-disabled={pending || undefined}
      disabled={disabled}
      data-status={status}
      className={classes({ variant, size }, [styles.action, className].filter(Boolean).join(' '))}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        if (pending) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...(rest as object)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {status === 'pending' ? (
          <motion.span key="p" className={styles.icon} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} aria-hidden="true">
            <LoaderCircle className={styles.spin} size={18} />
          </motion.span>
        ) : status === 'success' ? (
          <motion.span key="s" className={styles.icon} initial={{ opacity: 0, scale: 0.4, rotate: -30 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0 }} aria-hidden="true">
            <Check size={18} strokeWidth={2.5} />
          </motion.span>
        ) : icon ? (
          <motion.span key="i" className={styles.icon} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
            {icon}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <motion.span layout="position" className={styles.label}>
        {text}
      </motion.span>
    </motion.button>
  );
}

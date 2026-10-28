import type { ReactNode } from 'react';
import styles from './Feedback.module.css';

/** Estado vacío o de error con explicación y salida clara. */
export function EmptyState({ icon, title, children, action, tone = 'neutral' }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode; tone?: 'neutral' | 'error' }) {
  return (
    <div className={styles.empty} data-tone={tone} role={tone === 'error' ? 'alert' : undefined}>
      {icon && (
        <span className={styles.emptyIcon} aria-hidden="true">
          {icon}
        </span>
      )}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {children && <div className={styles.emptyText}>{children}</div>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 16, radius = 8, className }: { width?: number | string; height?: number | string; radius?: number; className?: string }) {
  return <span className={[styles.skeleton, className ?? ''].join(' ')} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}

/** Aviso en línea (información, atención o error) dentro de un formulario o página. */
export function Notice({ tone = 'info', title, children, icon }: { tone?: 'info' | 'warning' | 'danger' | 'success'; title?: string; children: ReactNode; icon?: ReactNode }) {
  return (
    <div className={styles.notice} data-tone={tone} role={tone === 'danger' ? 'alert' : 'note'}>
      {icon && (
        <span className={styles.noticeIcon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div>
        {title && <p className={styles.noticeTitle}>{title}</p>}
        <div className={styles.noticeText}>{children}</div>
      </div>
    </div>
  );
}

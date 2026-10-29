import styles from './TenDots.module.css';

/**
 * Diez puntos de la evaluación sectorial: rellenos según el mejor resultado.
 * Decorativo: el resultado siempre se escribe al lado.
 */
export function TenDots({ total = 10, filled = 0, pending = false }: { total?: number; filled?: number; pending?: boolean }) {
  return (
    <span className={styles.dots} data-pending={pending || undefined} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={styles.dot} data-on={i < filled || undefined} style={{ transitionDelay: `${i * 30}ms` }} />
      ))}
    </span>
  );
}

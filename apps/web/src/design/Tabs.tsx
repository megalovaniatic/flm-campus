import { motion } from 'motion/react';
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface TabOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps<T extends string> {
  label: string;
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Id del panel controlado (para aria-controls). */
  panelId?: string;
  size?: 'sm' | 'md';
}

/**
 * Pestañas accesibles (patrón ARIA tabs con tabindex itinerante y flechas).
 * La cápsula activa se desliza entre opciones: el círculo que se abre en cápsula.
 */
export function Tabs<T extends string>({ label, options, value, onChange, panelId, size = 'md' }: TabsProps<T>) {
  const group = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % options.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + options.length) % options.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = options.length - 1;
    if (next >= 0) {
      e.preventDefault();
      refs.current[next]?.focus();
      onChange(options[next]!.value);
    }
  };

  return (
    <div role="tablist" aria-label={label} className={[styles.tabs, styles[size]].join(' ')}>
      {options.map((o, i) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${group}-${o.value}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {selected && <motion.span layoutId={`tab-${group}`} className={styles.indicator} transition={{ type: 'spring', stiffness: 460, damping: 36 }} />}
            <span className={styles.content}>
              {o.icon && <span aria-hidden="true">{o.icon}</span>}
              {o.label}
              {o.count !== undefined && (
                <>
                  <span className="sr-only">: </span>
                  <span className={styles.count}>{o.count}</span>
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

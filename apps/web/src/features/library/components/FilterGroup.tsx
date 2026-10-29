import { LayoutGroup, motion } from 'motion/react';
import { useId, type ReactNode } from 'react';
import type { AreaId } from '@flm/shared';
import styles from './FilterGroup.module.css';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Área de la opción: muestra su punto de color junto al nombre. */
  area?: AreaId;
  /** Resultados que quedarían con esta opción (con el resto de filtros aplicados). */
  count?: number;
}

interface FilterGroupProps<T extends string> {
  label: string;
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Qué se cuenta, en singular y plural, para lectores de pantalla. */
  noun?: [string, string];
}

/**
 * Filtro de opción única con radios nativos (flechas del teclado incluidas).
 * La cápsula marcada se desliza entre opciones; en móvil la fila se desplaza en horizontal.
 */
export function FilterGroup<T extends string>({ label, options, value, onChange, noun }: FilterGroupProps<T>) {
  const id = useId();
  return (
    <div className={styles.group}>
      <span id={`${id}-label`} className={styles.label}>
        {label}
      </span>
      <div className={styles.scroller}>
        <div role="radiogroup" aria-labelledby={`${id}-label`} className={styles.options}>
          <LayoutGroup id={id}>
            {options.map((o) => {
              const checked = o.value === value;
              return (
                <label key={o.value} className={styles.option} data-checked={checked || undefined} data-empty={o.count === 0 || undefined}>
                  <input type="radio" name={id} value={o.value} checked={checked} onChange={() => onChange(o.value)} className={styles.input} />
                  {checked && <motion.span layoutId="indicator" className={styles.indicator} transition={{ type: 'spring', stiffness: 480, damping: 38 }} aria-hidden="true" />}
                  <span className={styles.content}>
                    {o.area && <span className={styles.dot} data-area={o.area} aria-hidden="true" />}
                    {o.icon && (
                      <span className={styles.icon} aria-hidden="true">
                        {o.icon}
                      </span>
                    )}
                    {o.label}
                    {o.count !== undefined && (
                      <span className={styles.count}>
                        <span className="sr-only">: </span>
                        {o.count}
                        {noun && <span className="sr-only"> {o.count === 1 ? noun[0] : noun[1]}</span>}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}

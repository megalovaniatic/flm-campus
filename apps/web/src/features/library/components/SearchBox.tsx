import { Search, X } from 'lucide-react';
import { useId, useRef, type ReactNode } from 'react';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  /** «lg»: el gran buscador de Consultar · «md»: buscador de cada lista. */
  size?: 'lg' | 'md';
  /** Intro: por ejemplo, llevar el foco a los resultados. */
  onSubmit?: () => void;
  hideLabel?: boolean;
  children?: ReactNode;
}

/** Buscador accesible: etiqueta visible, Esc para borrar y botón de borrar de 44 px. */
export function SearchBox({ label, value, onChange, placeholder, hint, size = 'md', onSubmit, hideLabel = false, children }: SearchBoxProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  return (
    <form
      role="search"
      className={styles.form}
      data-size={size}
      aria-labelledby={`${id}-label`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <label id={`${id}-label`} htmlFor={id} className={hideLabel ? 'sr-only' : styles.label}>
        {label}
      </label>
      <div className={styles.field}>
        <Search className={styles.icon} aria-hidden="true" />
        <input
          ref={input}
          id={id}
          className={styles.input}
          type="search"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && value) {
              e.preventDefault();
              e.stopPropagation();
              onChange('');
            }
          }}
        />
        {value && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Borrar la búsqueda"
            onClick={() => {
              onChange('');
              input.current?.focus();
            }}
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {children}
    </form>
  );
}

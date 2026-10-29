import { CircleAlert } from 'lucide-react';
import { useId, type InputHTMLAttributes, type ReactNode, type Ref, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

interface FieldShellProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  counter?: ReactNode;
}

function FieldShell({ id, label, hint, error, required, children, counter }: FieldShellProps) {
  return (
    <div className={styles.field} data-invalid={!!error || undefined}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        {counter && <span className={styles.counter}>{counter}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          <CircleAlert size={15} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, hint?: ReactNode, error?: string) => [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ label, hint, error, required, ref, className, ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input ref={ref} id={id} className={[styles.control, className ?? ''].join(' ')} aria-invalid={!!error || undefined} aria-describedby={describedBy(id, hint, error)} required={required} {...rest} />
    </FieldShell>
  );
}

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ label, hint, error, required, ref, maxLength, value, className, ...rest }: TextAreaProps) {
  const id = useId();
  const length = typeof value === 'string' ? value.length : undefined;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} counter={maxLength && length !== undefined ? `${length}/${maxLength}` : undefined}>
      <textarea ref={ref} id={id} className={[styles.control, styles.textarea, className ?? ''].join(' ')} aria-invalid={!!error || undefined} aria-describedby={describedBy(id, hint, error)} required={required} maxLength={maxLength} value={value} {...rest} />
    </FieldShell>
  );
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** `disabled`: la opción se ve pero no se puede elegir (la pista del campo explica por qué). */
  options: { value: string; label: string; disabled?: boolean }[];
}

export function SelectField({ label, hint, error, required, options, className, ...rest }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select id={id} className={[styles.control, styles.select, className ?? ''].join(' ')} aria-invalid={!!error || undefined} aria-describedby={describedBy(id, hint, error)} required={required} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Checkbox({ label, hint, checked, onChange, disabled }: { label: ReactNode; hint?: ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <div className={styles.check}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} aria-describedby={hint ? `${id}-hint` : undefined} />
      <span className={styles.checkText}>
        <label htmlFor={id}>{label}</label>
        {hint && (
          <span id={`${id}-hint`} className={styles.hint}>
            {hint}
          </span>
        )}
      </span>
    </div>
  );
}

/** Interruptor accesible (role="switch"). */
export function Switch({ label, description, checked, onChange, disabled }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <div className={styles.switchRow}>
      <span className={styles.switchText}>
        <span id={`${id}-l`} className={styles.switchLabel}>
          {label}
        </span>
        {description && (
          <span id={`${id}-d`} className={styles.hint}>
            {description}
          </span>
        )}
      </span>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={`${id}-l`} aria-describedby={description ? `${id}-d` : undefined} disabled={disabled} className={styles.switch} onClick={() => onChange(!checked)}>
        <span className={styles.thumb} />
      </button>
    </div>
  );
}

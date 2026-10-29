import { motion } from 'motion/react';
import { ArrowDown, ArrowUp, CircleAlert, Copy, Plus, Trash } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import type { Person, Role } from '@flm/shared';
import { Button, IconButton } from '@/design';
import { anchorId, type AnyForm } from '../forms';
import styles from './Editor.module.css';

export interface EditorContext {
  me: Person;
  role: Role;
  /** Puede editar, archivar y restaurar cualquier contenido (administración). */
  isAdmin: boolean;
  today: string;
  /** El contenido ya está publicado: los cambios se guardan aparte hasta publicarlos. */
  isRevision: boolean;
  /** Id del contenido publicado (eventos: reclasificación inmediata). */
  publishedId?: string;
  /** Id del contenido (o del borrador) que se edita: para no contarse a sí mismo (bienvenidas). */
  contentId: string;
}

export interface EditorProps<T extends AnyForm> {
  value: T;
  update: (fn: (prev: T) => T) => void;
  err: (path: string) => string | undefined;
  ctx: EditorContext;
}

/** Ancla del campo para los enlaces del resumen de errores. */
export function Slot({ path, children, className }: { path: string; children: ReactNode; className?: string }) {
  return (
    <div id={anchorId(path)} className={[styles.slot, className ?? ''].join(' ')} data-field={path}>
      {children}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  kicker,
  id,
  tone,
  aside,
  level = 2,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  kicker?: ReactNode;
  id?: string;
  tone?: 'key';
  aside?: ReactNode;
  /** Nivel del título: 3 para las secciones anidadas (cada pregunta dentro del test). */
  level?: 2 | 3;
}) {
  const hid = useId();
  const Heading = level === 3 ? 'h3' : 'h2';
  return (
    <section className={styles.section} aria-labelledby={hid} id={id} data-tone={tone} data-level={level}>
      <header className={styles.sectionHead}>
        {kicker && (
          <span className={styles.kicker} aria-hidden="true">
            {kicker}
          </span>
        )}
        <div className={styles.sectionHeadText}>
          <Heading id={hid} className={styles.sectionTitle} tabIndex={-1}>
            {title}
          </Heading>
          {description && <p className={styles.sectionDesc}>{description}</p>}
        </div>
        {aside && <div className={styles.sectionAside}>{aside}</div>}
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export const RICH_HINT = 'Admite **negrita**, *cursiva*, [[término clave]] y [texto del enlace](https://…). Usa la barra o escríbelo a mano.';

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className={styles.error} role="alert">
      <CircleAlert size={15} aria-hidden="true" /> {message}
    </p>
  );
}

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
}

/**
 * Grupo de opciones con radios nativos (flechas para moverse). La selección se desliza
 * de una opción a otra: la cápsula marina que se abre sobre la elegida.
 */
export function ChoiceGroup<T extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  variant = 'pills',
  disabled,
}: {
  legend: ReactNode;
  hint?: ReactNode;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (v: T) => void;
  error?: string;
  variant?: 'pills' | 'cards' | 'icons';
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <fieldset className={styles.choice} data-variant={variant} aria-describedby={[hint ? `${id}-h` : '', error ? `${id}-e` : ''].filter(Boolean).join(' ') || undefined} disabled={disabled}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && (
        <p id={`${id}-h`} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={styles.choiceList}>
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label key={o.value} className={styles.choiceItem} data-checked={checked || undefined}>
              <input type="radio" name={`choice-${id}`} value={o.value} checked={checked} onChange={() => onChange(o.value)} className={styles.choiceInput} />
              {checked && <motion.span layoutId={`choice-${id}`} className={styles.choiceMark} transition={{ type: 'spring', stiffness: 520, damping: 40 }} aria-hidden="true" />}
              <span className={styles.choiceContent}>
                {o.icon && (
                  <span className={styles.choiceIcon} aria-hidden="true">
                    {o.icon}
                  </span>
                )}
                <span className={styles.choiceLabel}>{o.label}</span>
                {o.description && (
                  <>
                    <span className="sr-only">. </span>
                    <span className={styles.choiceDesc}>{o.description}</span>
                  </>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${id}-e`} className={styles.error} role="alert">
          <CircleAlert size={15} aria-hidden="true" /> {error}
        </p>
      )}
    </fieldset>
  );
}

/** Subir, bajar, duplicar y eliminar un elemento de una lista del formulario (teclado completo). */
export function ItemTools({
  label,
  index,
  count,
  onMove,
  onRemove,
  onDuplicate,
  min = 0,
}: {
  label: string;
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  onDuplicate?: () => void;
  min?: number;
}) {
  return (
    <div className={styles.itemTools}>
      <IconButton label={`Subir ${label}`} icon={<ArrowUp />} size="sm" disabled={index === 0} onClick={() => onMove(index - 1)} />
      <IconButton label={`Bajar ${label}`} icon={<ArrowDown />} size="sm" disabled={index === count - 1} onClick={() => onMove(index + 1)} />
      {onDuplicate && <IconButton label={`Duplicar ${label}`} icon={<Copy />} size="sm" onClick={onDuplicate} />}
      <IconButton label={`Eliminar ${label}`} icon={<Trash />} size="sm" disabled={count <= min} onClick={onRemove} />
    </div>
  );
}

export function AddButton({ children, onClick, disabled, icon }: { children: ReactNode; onClick: () => void; disabled?: boolean; icon?: ReactNode }) {
  return (
    <Button variant="soft" size="sm" icon={icon ?? <Plus />} onClick={onClick} disabled={disabled} className={styles.add}>
      {children}
    </Button>
  );
}

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

export function insertAt<T>(list: T[], index: number, item: T): T[] {
  const next = [...list];
  next.splice(Math.max(0, Math.min(index, list.length)), 0, item);
  return next;
}

/** Transición de altura para elementos que entran y salen de una lista. */
export const itemMotion = {
  layout: true,
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.16 } },
  transition: { type: 'spring', stiffness: 420, damping: 36 },
} as const;

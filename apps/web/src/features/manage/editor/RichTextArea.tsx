import { Bold, BookMarked, Italic, Link2 } from 'lucide-react';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { normalize } from '@flm/shared';
import { Popover, TextArea } from '@/design';
import styles from './Editor.module.css';

/**
 * Enlace a un término clave elegido en el menú «Término». Si lo seleccionado es ese término (sin contar
 * mayúsculas, tildes ni los espacios de los extremos), se envuelve tal cual; si es otro texto, se sustituye por
 * el término: [[…]] solo enlaza cuando el texto coincide con un término clave, y la elección del menú no
 * puede perderse. Devuelve el texto nuevo y lo que queda seleccionado (el término).
 */
export function linkTerm(value: string, start: number, end: number, term: string): { text: string; from: number; to: number } {
  let a = Math.min(start, end);
  let b = Math.max(start, end);
  while (a < b && /\s/.test(value.charAt(a))) a++;
  while (b > a && /\s/.test(value.charAt(b - 1))) b--;
  const selected = value.slice(a, b);
  const inner = selected && normalize(selected) === normalize(term) ? selected : term;
  return { text: `${value.slice(0, a)}[[${inner}]]${value.slice(b)}`, from: a + 2, to: a + 2 + inner.length };
}

interface Props {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** Términos clave de la formación: el botón «Término» los ofrece para enlazarlos. */
  terms?: string[];
  hint?: ReactNode;
  error?: string;
  rows?: number;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
}

/**
 * Área de texto con la barra de formato ligero del campus: **negrita**, *cursiva*, [[término clave]]
 * y [enlace](https://…). La barra envuelve la selección (o inserta un texto de ejemplo seleccionado)
 * y devuelve el foco al texto; Control + B y Control + I funcionan dentro del campo.
 */
export function RichTextArea({ label, value, onChange, terms, hint, error, rows = 3, required, maxLength, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Cambia el texto y, al volver el foco al campo, deja seleccionado [from, to). */
  const apply = (next: string, from: number, to: number) => {
    const el = ref.current;
    onChange(next);
    window.requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(from, to);
    });
  };

  const insert = (before: string, after: string, sample: string, selectSample?: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || sample;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    if (selectSample) {
      const at = start + before.length + selected.length + after.indexOf(selectSample);
      apply(next, at, at + selectSample.length);
    } else apply(next, start + before.length, start + before.length + selected.length);
  };

  const insertTerm = (term: string) => {
    const el = ref.current;
    const { text, from, to } = linkTerm(value, el?.selectionStart ?? value.length, el?.selectionEnd ?? value.length, term);
    apply(text, from, to);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      insert('**', '**', 'texto en negrita');
    } else if (key === 'i') {
      e.preventDefault();
      insert('*', '*', 'texto en cursiva');
    }
  };

  const list = (terms ?? []).filter(Boolean);
  const name = typeof label === 'string' ? label : 'el texto';

  return (
    <div className={styles.rich}>
      <TextArea ref={ref} label={label} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} hint={hint} error={error} required={required} maxLength={maxLength} placeholder={placeholder} />
      <div role="toolbar" aria-label={`Formato de ${typeof label === 'string' ? `«${label}»` : 'este texto'}`} className={styles.toolbar}>
        <button type="button" className={styles.toolButton} onClick={() => insert('**', '**', 'texto en negrita')} aria-label={`Negrita en ${name} (Control + B)`} title="Negrita (Control + B)">
          <Bold size={16} aria-hidden="true" />
        </button>
        <button type="button" className={styles.toolButton} onClick={() => insert('*', '*', 'texto en cursiva')} aria-label={`Cursiva en ${name} (Control + I)`} title="Cursiva (Control + I)">
          <Italic size={16} aria-hidden="true" />
        </button>
        {list.length > 0 ? (
          <Popover label={`Enlazar un término clave en ${name}`} align="start" width={260} triggerClassName={styles.toolButtonWide} trigger={<><BookMarked size={16} aria-hidden="true" /> Término</>}>
            {(close) => (
              <ul role="list" className={styles.termMenu}>
                {list.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      className={styles.termItem}
                      onClick={() => {
                        close();
                        insertTerm(t);
                      }}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Popover>
        ) : (
          <button type="button" className={styles.toolButtonWide} onClick={() => insert('[[', ']]', 'término clave')} aria-label={`Marcar un término clave en ${name}`}>
            <BookMarked size={16} aria-hidden="true" /> Término
          </button>
        )}
        <button type="button" className={styles.toolButtonWide} onClick={() => insert('[', '](https://)', 'texto del enlace', 'https://')} aria-label={`Añadir un enlace en ${name}`}>
          <Link2 size={16} aria-hidden="true" /> Enlace
        </button>
      </div>
    </div>
  );
}

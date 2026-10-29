import { Check, FileText, ImageOff, Search } from 'lucide-react';
import { useId, useMemo, useState, type ReactNode } from 'react';
import { formatShortDate, normalize } from '@flm/shared';
import manifest from '@/assets/images.json';
import { Picture, type PhotoName } from '@/design';
import { useDocuments } from '@/data/selectors';
import { DOC_KIND_LABEL } from '../forms';
import styles from './Editor.module.css';

/** Fotos de las portadas de Aprender, Consultar y Participar: no son del equipo de FLM ni de sus eventos. */
const COVER_ONLY: readonly string[] = ['aprender-libro', 'consultar-biblioteca', 'equipo-puzle'];

/** Fotografías aprobadas para el campus (manifiesto de fotos de FLM). En la demo no se suben fotos. */
export const PHOTOS = (Object.keys(manifest) as PhotoName[]).filter((name) => !COVER_ONLY.includes(name)).map((name) => ({ name, alt: manifest[name].alt }));

/**
 * Selector de fotografía: solo las fotos aprobadas del manifiesto, sin subida. Radios nativos con la
 * miniatura y su descripción; elegir una propone su texto alternativo, que se puede ajustar.
 */
export function PhotoPicker({ legend, value, onChange, allowNone, hint }: { legend: string; value: string; onChange: (src: string, alt: string) => void; allowNone?: boolean; hint?: ReactNode }) {
  const id = useId();
  return (
    <fieldset className={styles.photoPicker} aria-describedby={hint ? `${id}-h` : undefined}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && (
        <p id={`${id}-h`} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={styles.photoGrid}>
        {allowNone && (
          <label className={styles.photoOption} data-checked={!value || undefined}>
            <input type="radio" name={`foto-${id}`} checked={!value} onChange={() => onChange('', '')} className={styles.photoInput} />
            <span className={styles.photoNone} aria-hidden="true">
              <ImageOff size={22} />
            </span>
            <span className={styles.photoCaption}>Sin fotografía</span>
          </label>
        )}
        {PHOTOS.map((p) => {
          const checked = value === p.name;
          return (
            <label key={p.name} className={styles.photoOption} data-checked={checked || undefined}>
              <input type="radio" name={`foto-${id}`} checked={checked} onChange={() => onChange(p.name, p.alt)} className={styles.photoInput} />
              <Picture name={p.name} sizes="10rem" decorative className={styles.photoThumb} />
              <span className={styles.photoCaption}>{p.alt}</span>
              {checked && (
                <span className={styles.photoCheck} aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Documentos de la biblioteca para vincular (formaciones) o enlazar como material (eventos):
 * casillas con búsqueda por título, emisor o etiqueta.
 */
export function DocumentChecklist({ legend, hint, selected, onChange }: { legend: string; hint?: ReactNode; selected: string[]; onChange: (ids: string[]) => void }) {
  const docs = useDocuments();
  const [q, setQ] = useState('');
  const id = useId();
  const shown = useMemo(() => {
    const nq = normalize(q);
    const list = nq ? docs.filter((d) => normalize([d.title, d.issuer, ...d.tags].join(' ')).includes(nq)) : docs;
    // Los ya elegidos, siempre arriba.
    return [...list.filter((d) => selected.includes(d.id)), ...list.filter((d) => !selected.includes(d.id))].slice(0, 30);
  }, [docs, q, selected]);
  const toggle = (docId: string, on: boolean) => onChange(on ? [...selected, docId] : selected.filter((x) => x !== docId));
  return (
    <fieldset className={styles.docPicker} aria-describedby={hint ? `${id}-h` : undefined}>
      <legend className={styles.legend}>{legend}</legend>
      {hint && (
        <p id={`${id}-h`} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={styles.docSearch}>
        <Search size={16} aria-hidden="true" />
        <label htmlFor={`${id}-q`} className="sr-only">
          Buscar documentos
        </label>
        <input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título, emisor o etiqueta" autoComplete="off" />
      </div>
      <ul role="list" className={styles.docList}>
        {shown.map((d) => {
          const checked = selected.includes(d.id);
          return (
            <li key={d.id}>
              <label className={styles.docOption} data-checked={checked || undefined}>
                <input type="checkbox" checked={checked} onChange={(e) => toggle(d.id, e.target.checked)} />
                <FileText size={18} aria-hidden="true" className={styles.docIcon} />
                <span className={styles.docText}>
                  <span className={styles.docTitle}>{d.title}</span>
                  <span className={styles.docMeta}>
                    {DOC_KIND_LABEL[d.kind]} · {d.issuer} · {formatShortDate(d.date)}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
        {shown.length === 0 && <li className={styles.docEmpty}>No hay documentos con esas palabras.</li>}
      </ul>
      {selected.length > 0 && (
        <p className={styles.metaNote} aria-live="polite">
          {selected.length === 1 ? '1 documento vinculado.' : `${selected.length} documentos vinculados.`}
        </p>
      )}
    </fieldset>
  );
}

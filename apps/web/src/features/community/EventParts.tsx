import { ArrowUpRight, CalendarPlus, Copy, Download, FileText, Link2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { eventToIcs, fileSize, type CampusEvent } from '@flm/shared';
import manifest from '@/assets/images.json';
import { ActionButton, Button, Chip, Picture, toast, type ActionStatus, type ButtonSize, type ButtonVariant, type PhotoName } from '@/design';
import { useDocuments } from '@/data/selectors';
import { asset, downloadText } from '@/lib/download';
import { MESSAGES } from '@/lib/messages';
import styles from './EventParts.module.css';

type EventLink = NonNullable<CampusEvent['links']>[number];
type EventMaterial = NonNullable<CampusEvent['materials']>[number];
type EventImage = NonNullable<CampusEvent['image']>;

const isPhotoName = (src: string): src is PhotoName => Object.prototype.hasOwnProperty.call(manifest, src);

/** Fotografía real de un evento (manifiesto de fotos de FLM o archivo subido). */
export function EventPhoto({ image, className, frameClassName, sizes, position }: { image: EventImage; className?: string; frameClassName?: string; sizes: string; position?: string }) {
  return (
    <figure className={className}>
      {isPhotoName(image.src) ? (
        <Picture name={image.src} sizes={sizes} position={position} className={frameClassName} />
      ) : (
        <img className={[styles.img, frameClassName ?? ''].join(' ')} src={/^https?:/.test(image.src) ? image.src : asset(image.src)} alt={image.alt} loading="lazy" decoding="async" />
      )}
      {image.credit && <figcaption className={styles.credit}>{image.credit}</figcaption>}
    </figure>
  );
}

/** Enlaces de un evento; los de ejemplo se rotulan y no llevan a ninguna parte. */
export function EventLinks({ links }: { links: EventLink[] }) {
  const hasExample = links.some((l) => l.example);
  return (
    <>
      <ul role="list" className={styles.links}>
        {links.map((l) => (
          <li key={l.url}>
            {l.example ? (
              <span className={styles.example}>
                <Link2 size={16} aria-hidden="true" />
                <span className={styles.exampleLabel}>{l.label}</span>
                <Chip size="sm" tone="warning">
                  Enlace de ejemplo
                </Chip>
              </span>
            ) : (
              <a className={styles.external} href={l.url} target="_blank" rel="noreferrer">
                {l.label}
                <ArrowUpRight size={16} aria-hidden="true" />
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
      {hasExample && <p className={styles.fine}>En la versión interna, los enlaces de ejemplo se sustituyen por los reales.</p>}
    </>
  );
}

/** Material de un evento: documento de la biblioteca con descarga y ficha. */
export function EventMaterials({ materials }: { materials: EventMaterial[] }) {
  const docs = useDocuments();
  return (
    <ul role="list" className={styles.materials}>
      {materials.map((m) => {
        const doc = docs.find((d) => d.id === m.documentId);
        const version = doc ? doc.versions[doc.versions.length - 1] : undefined;
        const available = !!doc && !!version && (!__DEMO__ || doc.publicDemo);
        return (
          <li key={m.documentId} className={styles.material}>
            <FileText className={styles.materialIcon} size={20} strokeWidth={1.75} aria-hidden="true" />
            <div className={styles.materialText}>
              <span className={styles.materialTitle}>{m.label}</span>
              <span className={styles.materialMeta}>
                {doc && version && available
                  ? `PDF · ${fileSize(version.sizeKb)}${version.pages ? ` · ${version.pages} págs.` : ''}`
                  : doc
                    ? MESSAGES.internalOnly
                    : MESSAGES.missingDocument.title}
              </span>
            </div>
            {doc && version && available && (
              <div className={styles.materialActions}>
                <a className={styles.download} href={asset(version.file)} download>
                  <Download size={16} aria-hidden="true" />
                  Descargar
                  <span className="sr-only"> {m.label}</span>
                </a>
                <Link className={styles.libraryLink} to={`/consultar/notas/${doc.id}`}>
                  Ver en la biblioteca
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** «Añadir a mi calendario (.ics)»: genera el archivo con todas las sesiones en hora de Madrid. */
export function AddToCalendarButton({ ev, sessions, size = 'md', variant = 'secondary' }: { ev: CampusEvent; sessions: number; size?: ButtonSize; variant?: ButtonVariant }) {
  const onClick = () => {
    try {
      downloadText(`${ev.slug}.ics`, eventToIcs(ev), 'text/calendar;charset=utf-8');
      toast.success('Archivo de calendario descargado', sessions > 1 ? `Ábrelo para añadir las ${sessions} sesiones a tu calendario.` : 'Ábrelo para añadir el evento a tu calendario.');
    } catch {
      toast.error('No se ha podido crear el archivo .ics', 'Vuelve a intentarlo. Si sigue sin funcionar, copia el enlace del evento y anótalo en tu calendario.');
    }
  };
  return (
    <Button variant={variant} size={size} icon={<CalendarPlus />} onClick={onClick}>
      Añadir a mi calendario (.ics)
    </Button>
  );
}

/** Copia un texto al portapapeles; la cápsula confirma con una marca y lo anuncia. */
export function CopyButton({ text, label, successLabel, size = 'md', variant = 'ghost', icon }: { text: string; label: string; successLabel: string; size?: ButtonSize; variant?: ButtonVariant; icon?: ReactNode }) {
  const [status, setStatus] = useState<ActionStatus>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      toast.error('No se ha podido copiar', `Tu navegador no permite copiar automáticamente. Selecciona y copia este texto: ${text}`);
      return;
    }
    setStatus('success');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), 2400);
  };
  return <ActionButton status={status} label={label} successLabel={successLabel} icon={icon ?? <Copy size={18} />} variant={variant} size={size} onClick={onClick} />;
}

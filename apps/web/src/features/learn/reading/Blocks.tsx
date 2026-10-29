import { ExternalLink, Lightbulb, Scale, TriangleAlert } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { Block, SourceRef } from '@flm/shared';
import { Rich, RichParagraphs } from '@/lib/rich';
import { asset } from '@/lib/download';
import { Widget } from '../widgets';
import { WorkedExample } from './Example';
import styles from './Blocks.module.css';

export const SOURCE_KIND: Record<NonNullable<SourceRef['kind']>, string> = {
  norma: 'Norma',
  jurisprudencia: 'Jurisprudencia',
  criterio: 'Criterio administrativo',
  documento: 'Documento',
  web: 'Web',
};

/** Enlace externo con aviso accesible de pestaña nueva. */
export function ExternalAnchor({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      <ExternalLink className={styles.extIcon} size={14} aria-hidden="true" />
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

function useOverflowX(ref: RefObject<HTMLElement | null>): boolean {
  const [over, setOver] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOver(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return over;
}

type CalloutBlock = Extract<Block, { type: 'callout' }>;

const CALLOUT: Record<Exclude<CalloutBlock['tone'], 'clave'>, { label: string; icon: ReactNode }> = {
  atencion: { label: 'Atención', icon: <TriangleAlert size={18} /> },
  consejo: { label: 'Consejo', icon: <Lightbulb size={18} /> },
  norma: { label: 'Norma', icon: <Scale size={18} /> },
};

function Callout({ block }: { block: CalloutBlock }) {
  const id = useId();
  if (block.tone === 'clave') {
    // Recuadro «Explicamos [TÍTULO]»: Belleza en mayúsculas espaciadas, como en el LinkedIn de FLM.
    return (
      <div role="note" aria-labelledby={id} className={styles.explain}>
        <h3 id={id} className={styles.explainTitle}>
          <span className={styles.explainKicker}>Explicamos</span>
          {block.title && (
            <>
              <span className="sr-only">: </span>
              <span className={styles.explainTerm}>{block.title}</span>
            </>
          )}
        </h3>
        <div className={styles.explainText}>
          <RichParagraphs text={block.text} />
        </div>
      </div>
    );
  }
  const meta = CALLOUT[block.tone];
  return (
    <div role="note" aria-labelledby={id} className={styles.callout} data-tone={block.tone}>
      <p className={styles.calloutKicker} id={block.title ? undefined : id}>
        <span aria-hidden="true">{meta.icon}</span>
        {meta.label}
      </p>
      {block.title && (
        <h3 id={id} className={styles.calloutTitle}>
          {block.title}
        </h3>
      )}
      <div className={styles.calloutText}>
        <RichParagraphs text={block.text} />
      </div>
      {block.refs && block.refs.length > 0 && (
        <ul role="list" className={styles.refs} aria-label="Referencias">
          {block.refs.map((r) => (
            <li key={r.url + r.label}>
              <span className={styles.refKind}>{SOURCE_KIND[r.kind ?? 'web']}</span>
              <ExternalAnchor href={r.url}>{r.label}</ExternalAnchor>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Table({ block }: { block: Extract<Block, { type: 'table' }> }) {
  const captionId = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const overflowing = useOverflowX(scroller);
  const numeric = new Set(block.numeric ?? []);
  return (
    <figure className={styles.tableFigure}>
      <div
        ref={scroller}
        className={styles.tableScroll}
        role={overflowing ? 'region' : undefined}
        aria-labelledby={overflowing && block.caption ? captionId : undefined}
        aria-label={overflowing && !block.caption ? 'Tabla desplazable' : undefined}
        tabIndex={overflowing ? 0 : undefined}
      >
        <table className={styles.table}>
          {block.caption && <caption id={captionId}>{block.caption}</caption>}
          <thead>
            <tr>
              {block.columns.map((c, i) => (
                <th key={i} scope="col" data-num={numeric.has(i) || undefined}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" data-num={numeric.has(i) || undefined}>
                      <Rich text={cell} />
                    </th>
                  ) : (
                    <td key={i} data-num={numeric.has(i) || undefined}>
                      <Rich text={cell} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {overflowing && (
        <p className={styles.scrollHint} aria-hidden="true">
          Desliza la tabla para ver todas las columnas
        </p>
      )}
    </figure>
  );
}

function Quote({ block }: { block: Extract<Block, { type: 'quote' }> }) {
  return (
    <figure className={styles.quote}>
      <span className={styles.quoteMark} aria-hidden="true">
        “
      </span>
      <blockquote>
        <RichParagraphs text={block.text} />
      </blockquote>
      {block.cite && <figcaption>{block.cite}</figcaption>}
    </figure>
  );
}

function Figure({ block }: { block: Extract<Block, { type: 'figure' }> }) {
  const src = /^(https?:|data:|\/)/.test(block.src) ? block.src : asset(block.src);
  return (
    <figure className={styles.figure}>
      <img src={src} alt={block.alt} loading="lazy" decoding="async" />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

/** Un bloque de contenido de la formación (salvo los encabezados, que abren apartado). */
export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return null;
    case 'paragraph':
      return <RichParagraphs text={block.text} />;
    case 'list': {
      const items = block.items.map((it, i) => (
        <li key={i}>
          <Rich text={it} />
        </li>
      ));
      return block.ordered ? <ol className={styles.ol}>{items}</ol> : <ul className={styles.ul}>{items}</ul>;
    }
    case 'callout':
      return <Callout block={block} />;
    case 'quote':
      return <Quote block={block} />;
    case 'example':
      return <WorkedExample block={block} />;
    case 'table':
      return <Table block={block} />;
    case 'widget':
      return (
        <figure className={styles.widget}>
          <Widget spec={block.widget} />
          {block.caption && <figcaption className={styles.widgetCaption}>{block.caption}</figcaption>}
        </figure>
      );
    case 'figure':
      return <Figure block={block} />;
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}

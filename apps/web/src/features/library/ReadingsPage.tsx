import { motion } from 'motion/react';
import { ExternalLink, FileText, Library } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { AREA_LIST, formatLongDate, type AreaInfo, type Reading } from '@flm/shared';
import { AreaTag, ButtonLink, Chip, Dialog, EmptyState, PageHeader } from '@/design';
import { useMyArea } from '@/features/learn/common/data';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { BookCover, shortAuthors } from './components/BookCover';
import { SampleBadge } from './components/Labels';
import { DevSampleHint, SampleNotice } from './components/SampleNotice';
import { isSample, useLibLink, useLibraryReadings, useSampleMode } from './lib/data';
import { plural } from './lib/labels';
import { sheetJustClosed, useSheetRoute } from './lib/params';
import { buttonClass, buttonIconClass, buttonLabelClass } from './lib/ui';
import styles from './ReadingsPage.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Lecturas recomendadas · «La estantería»: portadas tipográficas por área, sobre su balda.
 * /consultar/lecturas/:id abre la ficha de la lectura en un panel.
 */
export default function ReadingsPage() {
  const { id } = useParams();
  const readings = useLibraryReadings();
  const myArea = useMyArea();
  const sample = useSampleMode();
  const link = useLibLink();
  const sheet = useSheetRoute('/consultar/lecturas', id);
  // Las portadas se colocan en la balda al llegar, no cada vez que se abre o cierra una ficha.
  const [intro] = useState(() => !id && !sheetJustClosed('/consultar/lecturas'));

  const reading = id ? readings.find((r) => r.id === id) : undefined;
  const last = useRef<Reading | undefined>(reading);
  if (reading) last.current = reading;
  const shown = id ? reading : last.current;
  usePageTitle(id ? (reading ? reading.title : 'Lectura no disponible') : 'Lecturas recomendadas');

  // La balda de tu área va primero y es el foco claro; las demás, sin tinte y en el orden de siempre
  const shelves = [...AREA_LIST]
    .sort((a, b) => Number(b.id === myArea) - Number(a.id === myArea))
    .map((area) => ({ area, items: readings.filter((r) => r.area === area.id) }));
  const areasWithBooks = shelves.filter((s) => s.items.length > 0).length;

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Consultar', to: link('/consultar') }, { label: 'Lecturas recomendadas' }]}
        eyebrow="La estantería"
        title="Lecturas recomendadas"
        lede="Libros y manuales que recomienda cada área, con lo que aporta cada uno a tu trabajo diario."
        aside={
          readings.length > 0 ? (
            <dl className={styles.headStats}>
              <div>
                <dt>{readings.length === 1 ? 'lectura' : 'lecturas'}</dt>
                <dd>{readings.length}</dd>
              </div>
              <div>
                <dt>{areasWithBooks === 1 ? 'área' : 'áreas'}</dt>
                <dd>{areasWithBooks}</dd>
              </div>
            </dl>
          ) : undefined
        }
      />

      {sample && <SampleNotice />}

      {readings.length === 0 ? (
        <EmptyShelf />
      ) : (
        <div className={styles.shelves}>
          {shelves.map((shelf, s) => (
            <Shelf key={shelf.area.id} area={shelf.area} items={shelf.items} order={s} intro={intro} mine={shelf.area.id === myArea} linkProps={sheet.linkProps} />
          ))}
        </div>
      )}

      <Dialog
        open={!!id}
        onClose={sheet.close}
        variant="sheet"
        size="lg"
        title={shown ? shown.title : 'Lectura no disponible'}
        description={shown ? `${shortAuthors(shown.authors)} · ${shown.publisher}` : undefined}
        footer={
          shown ? (
            <a href={shown.url} target="_blank" rel="noreferrer" className={buttonClass('primary')}>
              <span className={buttonIconClass} aria-hidden="true">
                <ExternalLink />
              </span>
              <span className={buttonLabelClass}>
                Ver la referencia<span className="sr-only"> de «{shown.title}» (se abre en una pestaña nueva)</span>
              </span>
            </a>
          ) : undefined
        }
      >
        {shown ? (
          <ReadingDetail reading={shown} />
        ) : id ? (
          <EmptyState tone="error" icon={<Library />} title={MESSAGES.missingDocument.title}>
            {MESSAGES.missingDocument.body}
          </EmptyState>
        ) : null}
      </Dialog>
    </div>
  );
}

type SheetLink = ReturnType<typeof useSheetRoute>['linkProps'];

/**
 * Una balda por área: las portadas se apoyan en ella y se abren un poco al pasar o enfocar.
 * La de tu área («mine») es el foco claro de la página: lavado del área, banda y «Tu área».
 */
function Shelf({ area, items, order, intro, mine, linkProps }: { area: AreaInfo; items: Reading[]; order: number; intro: boolean; mine: boolean; linkProps: SheetLink }) {
  return (
    <section className={mine ? `${styles.shelf} spotlight-soft` : styles.shelf} data-area={area.id} data-mine={mine || undefined} aria-labelledby={`estante-${area.id}`}>
      <div className={styles.shelfHead}>
        <div className={styles.shelfName}>
          <h2 id={`estante-${area.id}`} className={styles.shelfTitle}>
            <span className={styles.shelfDot} aria-hidden="true" />
            {area.name}
          </h2>
          {mine && <Chip size="sm">Tu área</Chip>}
        </div>
        <p className={styles.shelfCount}>{items.length ? plural(items.length, 'lectura', 'lecturas') : 'Sin lecturas todavía'}</p>
      </div>

      <div className={styles.scroller}>
        <ul role="list" className={styles.row}>
          {items.map((r, i) => (
            <motion.li
              key={r.id}
              className={styles.slot}
              initial={intro ? { opacity: 0, y: 18 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.06 * order + 0.05 * i, ease: EASE }}
            >
              <Link {...linkProps(r.id)} className={styles.bookLink} data-book-trigger="">
                <BookCover reading={r} />
                <span className="sr-only">
                  {r.title}, de {r.authors}. {r.edition}. Ver la ficha.
                </span>
              </Link>
              <p className={styles.caption} aria-hidden="true">
                <span className={styles.captionAuthors}>{shortAuthors(r.authors)}</span>
                <span className={styles.captionEdition}>{r.edition}</span>
              </p>
              {isSample(r.id) && (
                <span className={styles.sample}>
                  <SampleBadge />
                </span>
              )}
            </motion.li>
          ))}
          {items.length === 0 && (
            <li className={styles.slot}>
              <span className={styles.ghost}>
                <span>Pronto, las lecturas de {area.name}</span>
              </span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

/** Ficha de la lectura: edición, editorial, ISBN, resumen, valor práctico, público y enlace. */
function ReadingDetail({ reading }: { reading: Reading }) {
  return (
    <div className={styles.detail} data-area={reading.area}>
      <div className={styles.detailTop}>
        <motion.div
          key={reading.id}
          className={styles.detailCover}
          initial={{ opacity: 0, rotateY: -28, x: -8 }}
          animate={{ opacity: 1, rotateY: 0, x: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
        >
          <BookCover reading={reading} size="lg" />
        </motion.div>
        <dl className={styles.facts}>
          <div>
            <dt>Autoría</dt>
            <dd>{reading.authors}</dd>
          </div>
          <div>
            <dt>Edición</dt>
            <dd>{reading.edition}</dd>
          </div>
          <div>
            <dt>Editorial</dt>
            <dd>{reading.publisher}</dd>
          </div>
          <div>
            <dt>ISBN</dt>
            <dd className={reading.isbn ? styles.isbn : styles.muted}>{reading.isbn ?? 'No consta'}</dd>
          </div>
          <div>
            <dt>Formato</dt>
            <dd>{reading.format}</dd>
          </div>
          <div>
            <dt>Área</dt>
            <dd>
              <AreaTag area={reading.area} size="sm" />
            </dd>
          </div>
        </dl>
      </div>

      {isSample(reading.id) && (
        <p className={styles.sampleLine}>
          <SampleBadge /> Ficha de muestra para revisar el diseño: no es una recomendación verificada.
        </p>
      )}

      <section aria-labelledby="h-lectura-resumen" className={styles.section}>
        <h3 id="h-lectura-resumen" className={styles.sectionTitle}>
          Resumen
        </h3>
        <p className={styles.summary}>{reading.summary}</p>
      </section>

      <section aria-labelledby="h-lectura-valor" className={styles.value}>
        <h3 id="h-lectura-valor" className={styles.sectionTitle}>
          Valor práctico
        </h3>
        <p>{reading.practicalValue}</p>
      </section>

      <section aria-labelledby="h-lectura-publico" className={styles.section}>
        <h3 id="h-lectura-publico" className={styles.sectionTitle}>
          Para quién
        </h3>
        <p className={styles.text}>{reading.audience}</p>
      </section>

      <p className={styles.verified}>Datos de la edición comprobados el {formatLongDate(reading.verifiedAt)}.</p>
    </div>
  );
}

/** Estado vacío digno: la estantería existe y se está llenando. */
function EmptyShelf() {
  return (
    <section className={styles.empty} aria-labelledby="h-estanteria-vacia">
      <div className={styles.ghostShelf} aria-hidden="true">
        {AREA_LIST.map((a, i) => (
          <span key={a.id} className={styles.ghostSpine} data-area={a.id} style={{ height: `${[78, 64, 88, 70][i]}%` }} />
        ))}
        <span className={styles.ghostSpine} data-empty="" style={{ height: '58%' }} />
        <span className={styles.ghostSpine} data-empty="" style={{ height: '74%' }} />
      </div>
      <h2 id="h-estanteria-vacia" className={styles.emptyTitle}>
        La estantería se está llenando
      </h2>
      <p className={styles.emptyText}>Cada área está eligiendo sus tres lecturas de referencia. Las verás aquí en cuanto estén verificadas, con su resumen y lo que aportan a tu trabajo.</p>
      <ButtonLink to="/consultar/notas" variant="secondary" icon={<FileText />}>
        Ver las notas informativas
      </ButtonLink>
      <DevSampleHint />
    </section>
  );
}

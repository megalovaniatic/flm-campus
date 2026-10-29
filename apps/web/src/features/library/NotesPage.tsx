import { AnimatePresence, motion } from 'motion/react';
import { Download, ExternalLink, FileX, Lock, SearchX, TriangleAlert, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { AREA_IDS, AREA_LIST, fileSize, formatLongDate, formatShortDate, type DocumentVersion, type LibraryDocument, type Person } from '@flm/shared';
import { Button, Chip, Dialog, EmptyState, Notice, PageHeader } from '@/design';
import { useDocuments, usePeople } from '@/data/selectors';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { DocThumb } from './components/DocThumb';
import { FilterGroup, type FilterOption } from './components/FilterGroup';
import { DocAreaTag, DocKindLabel, Highlight } from './components/Labels';
import { SearchBox } from './components/SearchBox';
import { useLibLink } from './lib/data';
import { currentVersion, fileName, fileUrl, formatLabel, isAvailable, isLandscape, versionsNewestFirst } from './lib/docs';
import { groupByMonth } from './lib/group';
import { DOC_KIND, DOC_KIND_IDS, plural, type DocArea, type DocKind } from './lib/labels';
import { pick, useLibraryParams, useSearchText, useSheetRoute } from './lib/params';
import { warmUpPdfjs } from './lib/pdfThumbs';
import { docFields, queryTokens, scoreFields } from './lib/search';
import { buttonClass, buttonIconClass, buttonLabelClass } from './lib/ui';
import lib from './Library.module.css';
import styles from './NotesPage.module.css';

const EASE = [0.2, 0, 0, 1] as const;

/**
 * Notas informativas: archivo de documentos originales con la miniatura real de su primera
 * página. /consultar/notas/:id abre la ficha (metadatos, resumen e historial de versiones).
 */
export default function NotesPage() {
  const { id } = useParams();
  const docs = useDocuments();
  const people = usePeople();
  const link = useLibLink();
  const [params, update] = useLibraryParams();
  const [q, setQ] = useSearchText(params, update);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const sheet = useSheetRoute('/consultar/notas', id);

  const doc = id ? docs.find((d) => d.id === id) : undefined;
  const lastDoc = useRef<LibraryDocument | undefined>(doc);
  if (doc) lastDoc.current = doc;
  const shown = id ? doc : lastDoc.current;
  usePageTitle(id ? (doc ? doc.title : 'Documento no disponible') : 'Notas informativas');

  // pdf.js solo se descarga en esta página, cuando el navegador está desocupado.
  useEffect(() => warmUpPdfjs(), []);

  const areaIds = useMemo<DocArea[]>(() => (docs.some((d) => d.area === 'general') ? [...AREA_IDS, 'general'] : [...AREA_IDS]), [docs]);
  const kindIds = useMemo(() => DOC_KIND_IDS.filter((k) => docs.some((d) => d.kind === k)), [docs]);
  const area = pick(params.get('area'), areaIds);
  const kind = pick(params.get('tipo'), kindIds);
  const tokens = useMemo(() => queryTokens(q), [q]);

  const index = useMemo(() => docs.map((d) => ({ item: d, fields: docFields(d) })), [docs]);
  const byQuery = useMemo(() => (tokens.length ? new Set(index.filter((e) => scoreFields(e.fields, tokens) > 0).map((e) => e.item.id)) : null), [index, tokens]);

  const inQuery = docs.filter((d) => !byQuery || byQuery.has(d.id));
  const filtered = inQuery.filter((d) => (!area || d.area === area) && (!kind || d.kind === kind));
  const groups = groupByMonth(filtered, (d) => d.date);
  const active = !!(area || kind || q.trim());
  const downloadable = docs.filter(isAvailable).length;

  const areaOptions: FilterOption<'todas' | DocArea>[] = [
    { value: 'todas', label: 'Todas', count: inQuery.filter((d) => !kind || d.kind === kind).length },
    ...AREA_LIST.map((a) => ({ value: a.id, label: a.name, area: a.id, count: inQuery.filter((d) => d.area === a.id && (!kind || d.kind === kind)).length })),
    ...(areaIds.includes('general') ? [{ value: 'general' as const, label: 'General', count: inQuery.filter((d) => d.area === 'general' && (!kind || d.kind === kind)).length }] : []),
  ];
  const kindOptions: FilterOption<'todos' | DocKind>[] = [
    { value: 'todos', label: 'Todos', count: inQuery.filter((d) => !area || d.area === area).length },
    ...kindIds.map((k) => {
      const { label, Icon } = DOC_KIND[k];
      return { value: k, label, icon: <Icon />, count: inQuery.filter((d) => d.kind === k && (!area || d.area === area)).length };
    }),
  ];

  const clearAll = () => {
    setQ('');
    update({ area: null, tipo: null, q: null });
  };

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Consultar', to: link('/consultar') }, { label: 'Notas informativas' }]}
        eyebrow={docs[0] ? `Último documento: ${formatLongDate(docs[0].date)}` : 'Biblioteca de FLM'}
        title="Notas informativas"
        lede="Los documentos originales de cada área: notas de FLM, publicaciones oficiales y material de los encuentros, con su versión vigente."
        aside={
          docs.length > 0 ? (
            <dl className={styles.headStats}>
              <div>
                <dt>documentos</dt>
                <dd>{docs.length}</dd>
              </div>
              <div>
                <dt>PDF descargables</dt>
                <dd>{downloadable}</dd>
              </div>
            </dl>
          ) : undefined
        }
      />

      {docs.length === 0 ? (
        <section aria-labelledby="h-sin-documentos">
          <h2 id="h-sin-documentos" className="sr-only">
            Sin documentos
          </h2>
          <EmptyState icon={<FileX />} title="Todavía no hay documentos publicados">
            Las notas informativas de cada área aparecerán aquí en cuanto se publiquen, con su versión vigente y su historial.
          </EmptyState>
        </section>
      ) : (
        <>
          <div className={lib.toolbar}>
            <div className={lib.search}>
              <SearchBox label="Buscar en las notas" value={q} onChange={setQ} placeholder="Título, tema, emisor o etiqueta…" onSubmit={() => statusRef.current?.focus()} />
            </div>
            <div className={lib.filters}>
              <FilterGroup label="Área" options={areaOptions} value={area ?? 'todas'} onChange={(v) => update({ area: v === 'todas' ? null : v })} noun={['documento', 'documentos']} />
              <FilterGroup label="Tipo" options={kindOptions} value={kind ?? 'todos'} onChange={(v) => update({ tipo: v === 'todos' ? null : v })} noun={['documento', 'documentos']} />
            </div>
          </div>

          <div className={lib.statusRow}>
            <p ref={statusRef} tabIndex={-1} role="status" className={lib.status}>
              {filtered.length === docs.length ? (
                <strong>{plural(docs.length, 'documento', 'documentos')}</strong>
              ) : (
                <>
                  <strong>{filtered.length}</strong> de {plural(docs.length, 'documento', 'documentos')}
                </>
              )}
            </p>
            {active && (
              <Button variant="ghost" size="sm" icon={<X />} onClick={clearAll}>
                Quitar filtros
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <section aria-labelledby="h-sin-resultados">
              <h2 id="h-sin-resultados" className="sr-only">
                Sin resultados
              </h2>
              {q.trim() && !area && !kind ? (
                <EmptyState icon={<SearchX />} title={MESSAGES.emptySearch.title} action={<Button variant="secondary" onClick={() => setQ('')}>Borrar la búsqueda</Button>}>
                  {MESSAGES.emptySearch.body(q.trim())}
                </EmptyState>
              ) : (
                <EmptyState icon={<SearchX />} title={MESSAGES.emptyFilter.title} action={<Button variant="secondary" onClick={clearAll}>Quitar filtros</Button>}>
                  {MESSAGES.emptyFilter.body}
                </EmptyState>
              )}
            </section>
          ) : (
            groups.map((g) => (
              <section key={g.key} className={lib.month} aria-labelledby={`mes-${g.key}`}>
                <h2 id={`mes-${g.key}`} className={lib.monthTitle}>
                  {g.title}
                  <span className="sr-only">, </span>
                  <span className={lib.monthCount}>{plural(g.items.length, 'documento', 'documentos')}</span>
                </h2>
                <ul role="list" className={styles.list}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {g.items.map((d) => (
                      <motion.li
                        key={d.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.16 } }}
                        transition={{ duration: 0.28, ease: EASE, layout: { duration: 0.32, ease: EASE } }}
                        className={styles.item}
                      >
                        <DocCard doc={d} tokens={tokens} sheetLink={sheet.linkProps} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))
          )}
        </>
      )}

      <Dialog
        open={!!id}
        onClose={sheet.close}
        variant="sheet"
        size="lg"
        title={shown ? shown.title : 'Documento no disponible'}
        description={shown ? `${shown.issuer} · ${formatLongDate(shown.date)}` : undefined}
        footer={shown ? <SheetActions doc={shown} /> : undefined}
      >
        {shown ? <DocDetail doc={shown} people={people} /> : id ? <MissingDocument onBack={sheet.close} /> : null}
      </Dialog>
    </div>
  );
}

type SheetLink = ReturnType<typeof useSheetRoute>['linkProps'];

/** Ficha del archivo: miniatura real, datos, avisos y acciones siempre visibles. */
function DocCard({ doc, tokens, sheetLink }: { doc: LibraryDocument; tokens: string[]; sheetLink: SheetLink }) {
  const v = currentVersion(doc);
  const available = isAvailable(doc) && !!v;
  const open = sheetLink(doc.id);
  return (
    <article className={styles.doc} data-area={doc.area === 'general' ? undefined : doc.area}>
      <Link to={open.to} state={open.state} preventScrollReset className={styles.thumbLink} tabIndex={-1} aria-hidden="true">
        <DocThumb key={v?.file} src={available && v ? fileUrl(v) : undefined} landscape={isLandscape(doc)} />
      </Link>
      <div className={styles.docBody}>
        <div className={styles.docTop}>
          <DocKindLabel kind={doc.kind} size="sm" />
          <DocAreaTag area={doc.area} />
        </div>
        <h3 className={styles.docTitle}>
          <Link {...open} className={styles.docTitleLink}>
            <Highlight text={doc.title} tokens={tokens} />
          </Link>
        </h3>
        <p className={styles.issuer}>{doc.issuer}</p>
        <p className={styles.facts}>
          <time dateTime={doc.date}>{formatShortDate(doc.date)}</time>
          {v?.pages ? ` · ${v.pages} págs.` : ''}
          {available && v ? ` · ${fileSize(v.sizeKb).replace(' ', ' ')}` : ''}
          {v ? ` · Versión ${v.version} (vigente)` : ''}
        </p>
        {doc.notice && (
          <p className={styles.notice}>
            <TriangleAlert size={16} aria-hidden="true" />
            <span>
              <span className="sr-only">Aviso editorial: </span>
              {doc.notice}
            </span>
          </p>
        )}
      </div>
      <div className={styles.actions}>{available && v ? <FileLinks doc={doc} version={v} /> : <InternalOnly />}</div>
    </article>
  );
}

/** «Abrir» y «Descargar (PDF · 239 KB)», con el título en el nombre accesible. */
function FileLinks({ doc, version, emphasis = false }: { doc: LibraryDocument; version: DocumentVersion; emphasis?: boolean }) {
  const url = fileUrl(version);
  return (
    <>
      <a href={url} download={fileName(version)} className={buttonClass(emphasis ? 'primary' : 'secondary')}>
        <span className={buttonIconClass} aria-hidden="true">
          <Download />
        </span>
        <span className={buttonLabelClass}>
          Descargar ({formatLabel(version)})<span className="sr-only">: {doc.title}</span>
        </span>
      </a>
      <a href={url} target="_blank" rel="noopener" className={buttonClass(emphasis ? 'secondary' : 'soft')}>
        <span className={buttonIconClass} aria-hidden="true">
          <ExternalLink />
        </span>
        <span className={buttonLabelClass}>
          Abrir<span className="sr-only">: {doc.title} (PDF, se abre en una pestaña nueva)</span>
        </span>
      </a>
    </>
  );
}

function InternalOnly() {
  return (
    <p className={styles.internal}>
      <Lock size={16} aria-hidden="true" />
      {MESSAGES.internalOnly}
    </p>
  );
}

function SheetActions({ doc }: { doc: LibraryDocument }) {
  const v = currentVersion(doc);
  if (!isAvailable(doc) || !v) return <InternalOnly />;
  return <FileLinks doc={doc} version={v} emphasis />;
}

/** Contenido de la ficha: datos, avisos, resumen, temas, historial de versiones y revisión. */
function DocDetail({ doc, people }: { doc: LibraryDocument; people: Person[] }) {
  const v = currentVersion(doc);
  const available = isAvailable(doc) && !!v;
  const versions = versionsNewestFirst(doc);
  const nameOf = (personId: string) => people.find((p) => p.id === personId)?.name;
  const review = doc.editorial.review;

  return (
    <div className={styles.sheet}>
      <div className={styles.sheetTop}>
        <div className={styles.sheetThumb}>
          <DocThumb key={v?.file} src={available && v ? fileUrl(v) : undefined} landscape={isLandscape(doc)} size="lg" />
        </div>
        <dl className={styles.sheetFacts}>
          <div>
            <dt>Tipo</dt>
            <dd>
              <DocKindLabel kind={doc.kind} size="sm" />
            </dd>
          </div>
          <div>
            <dt>Área</dt>
            <dd>
              <DocAreaTag area={doc.area} />
            </dd>
          </div>
          <div>
            <dt>Emite</dt>
            <dd>{doc.issuer}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>
              <time dateTime={doc.date}>{formatLongDate(doc.date)}</time>
            </dd>
          </div>
          {v?.pages ? (
            <div>
              <dt>Páginas</dt>
              <dd>{v.pages}</dd>
            </div>
          ) : null}
          {available && v && (
            <div>
              <dt>Formato</dt>
              <dd>{formatLabel(v)}</dd>
            </div>
          )}
          {v && (
            <div>
              <dt>Versión vigente</dt>
              <dd>Versión {v.version}</dd>
            </div>
          )}
        </dl>
      </div>

      {doc.notice && (
        <Notice tone="warning" title="Aviso editorial" icon={<TriangleAlert size={18} />}>
          {doc.notice}
        </Notice>
      )}

      <section aria-labelledby="h-resumen" className={styles.sheetSection}>
        <h3 id="h-resumen" className={styles.sheetH}>
          Resumen
        </h3>
        <p className={styles.summary}>{doc.summary}</p>
      </section>

      {doc.tags.length > 0 && (
        <section aria-labelledby="h-temas" className={styles.sheetSection}>
          <h3 id="h-temas" className={styles.sheetH}>
            Temas
          </h3>
          <ul role="list" className={styles.tags}>
            {doc.tags.map((t) => (
              <li key={t}>
                <Link to={`/consultar/notas?q=${encodeURIComponent(t)}`} className={styles.tag}>
                  {t}
                  <span className="sr-only"> (buscar notas con este tema)</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="h-versiones" className={styles.sheetSection}>
        <h3 id="h-versiones" className={styles.sheetH}>
          Historial de versiones
        </h3>
        <ol role="list" className={styles.versions}>
          {versions.map((ver, i) => (
            <li key={ver.version} className={styles.version} data-current={i === 0 || undefined}>
              <span className={styles.versionDot} aria-hidden="true" />
              <div className={styles.versionBody}>
                <p className={styles.versionTitle}>
                  Versión {ver.version}
                  {i === 0 ? (
                    <Chip tone="success" size="sm">
                      Vigente
                    </Chip>
                  ) : (
                    <Chip size="sm">Sustituida</Chip>
                  )}
                </p>
                <p className={styles.versionMeta}>
                  <time dateTime={ver.uploadedAt.slice(0, 10)}>{formatLongDate(ver.uploadedAt.slice(0, 10))}</time>
                  {ver.pages ? ` · ${ver.pages} págs.` : ''}
                  {available ? ` · ${fileSize(ver.sizeKb).replace(' ', ' ')}` : ''}
                  {nameOf(ver.uploadedBy) ? ` · Publica ${nameOf(ver.uploadedBy)}` : ''}
                </p>
                {ver.note && <p className={styles.versionNote}>{ver.note}</p>}
              </div>
            </li>
          ))}
        </ol>
        {versions.length === 1 && <p className={styles.sheetMuted}>Sin versiones anteriores: es la primera publicación del documento.</p>}
      </section>

      <section aria-labelledby="h-revision" className={styles.sheetSection}>
        <h3 id="h-revision" className={styles.sheetH}>
          Revisión editorial
        </h3>
        <p className={styles.sheetText}>
          {review.state === 'revisado' ? `Revisado${review.reviewerName ? ` · ${review.reviewerName}` : ''}.` : `Pendiente de revisión${review.note ? `: ${review.note}` : '.'}`}
        </p>
      </section>
    </div>
  );
}

function MissingDocument({ onBack }: { onBack: () => void }) {
  return (
    <EmptyState
      tone="error"
      icon={<FileX />}
      title={MESSAGES.missingDocument.title}
      action={
        <Button variant="secondary" onClick={onBack}>
          Volver a las notas
        </Button>
      }
    >
      {MESSAGES.missingDocument.body}
    </EmptyState>
  );
}

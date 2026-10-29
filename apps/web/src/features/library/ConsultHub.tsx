import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpen, FileText, Lock, Newspaper, SearchX } from 'lucide-react';
import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router';
import { AREAS, areaName, diffDays, fileSize, formatShortDate, madridDateKey, plainText, relativeDay, type LibraryDocument, type NewsItem, type Reading } from '@flm/shared';
import { Button, ButtonLink, EmptyState, PageHeader } from '@/design';
import { useDocuments, usePeople } from '@/data/selectors';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { shortAuthors } from './components/BookCover';
import { DocKindLabel, Highlight, KindLabel } from './components/Labels';
import { NewsCard } from './components/NewsCard';
import { DevSampleHint, SampleNotice } from './components/SampleNotice';
import { SearchBox } from './components/SearchBox';
import { useLibLink, useLibraryNews, useLibraryReadings, useSampleMode } from './lib/data';
import { currentVersion, isAvailable } from './lib/docs';
import { areaLabel, DOC_KIND, plural } from './lib/labels';
import { useLibraryParams, useSearchText } from './lib/params';
import { docFields, excerpt, newsFields, queryTokens, rank, readingFields, type Hit } from './lib/search';
import { useDebouncedValue } from './lib/ui';
import styles from './ConsultHub.module.css';

const EASE = [0.22, 1, 0.36, 1] as const;
const SUGGESTIONS = ['IVA', 'factura electrónica', 'BOICAC', 'no residentes', 'Sociedades', 'despido'];

/**
 * Consultar: la biblioteca del campus. Un gran buscador que filtra a la vez actualidad,
 * notas y lecturas; tres puertas con datos vivos; y lo último que ha llegado.
 */
export default function ConsultHub() {
  usePageTitle('Consultar');
  const news = useLibraryNews();
  const docs = useDocuments();
  const readings = useLibraryReadings();
  const people = usePeople();
  const sample = useSampleMode();
  const link = useLibLink();
  const [params, update] = useLibraryParams();
  const [q, setQ] = useSearchText(params, update);
  const resultsTitle = useRef<HTMLHeadingElement>(null);
  /** Al elegir una sugerencia, el título de resultados recibe el foco en cuanto aparece. */
  const focusResults = useRef(false);
  const setResultsTitle = (el: HTMLHeadingElement | null) => {
    resultsTitle.current = el;
    if (el && focusResults.current) {
      focusResults.current = false;
      el.focus();
    }
  };

  const tokens = useMemo(() => queryTokens(q), [q]);
  const searching = tokens.length > 0;

  const index = useMemo(() => {
    const author = (id: string) => people.find((p) => p.id === id);
    return {
      news: news.map((n) => ({ item: n, fields: newsFields(n, author(n.editorial.authorId)) })),
      docs: docs.map((d) => ({ item: d, fields: docFields(d) })),
      readings: readings.map((r) => ({ item: r, fields: readingFields(r) })),
    };
  }, [news, docs, readings, people]);

  const results = useMemo(() => (searching ? { news: rank(index.news, tokens), docs: rank(index.docs, tokens), readings: rank(index.readings, tokens) } : null), [index, tokens, searching]);
  const total = results ? results.news.length + results.docs.length + results.readings.length : 0;

  const suggestions = useMemo(
    () => SUGGESTIONS.filter((s) => {
      const t = queryTokens(s);
      return rank(index.docs, t).length + rank(index.news, t).length + rank(index.readings, t).length > 0;
    }).slice(0, 5),
    [index],
  );

  const query = q.trim();
  const where = (n: number, name: string) => `${n === 0 ? 'ninguno' : n} en ${name}`;
  const summary = results
    ? total === 0
      ? `Sin resultados para «${query}».`
      : `${plural(total, 'resultado', 'resultados')} para «${query}»: ${where(results.news.length, 'Actualidad')}, ${where(results.docs.length, 'Notas informativas')} y ${where(results.readings.length, 'Lecturas')}.`
    : '';
  const announced = useDebouncedValue(summary, 500);

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Biblioteca de FLM"
        title={
          <>
            Consultar<span className="red-dot" aria-hidden="true" />
          </>
        }
        lede="Novedades verificadas, documentos originales y lecturas de referencia: lo que necesitas para responder con criterio."
      />

      {sample && <SampleNotice />}

      <div className={styles.searchBlock}>
        <SearchBox
          size="lg"
          label="¿Qué necesitas consultar?"
          value={q}
          onChange={setQ}
          placeholder="Norma, impuesto o tema…"
          hint="Busca a la vez en Actualidad, Notas informativas y Lecturas. No hace falta escribir las tildes."
          onSubmit={() => resultsTitle.current?.focus()}
        >
          {!query && suggestions.length > 0 && (
            <div className={styles.suggest}>
              <span className={styles.suggestLabel} id="sugerencias">
                Prueba con
              </span>
              <ul role="list" aria-labelledby="sugerencias" className={styles.suggestList}>
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      className={styles.suggestion}
                      onClick={() => {
                        // La sugerencia desaparece al buscar: el foco pasa a los resultados en lugar de perderse.
                        focusResults.current = true;
                        setQ(s);
                      }}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SearchBox>
        <p className="sr-only" role="status">
          {announced}
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {results ? (
          <motion.section
            key="resultados"
            className={styles.results}
            aria-labelledby="h-resultados"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <h2 id="h-resultados" ref={setResultsTitle} tabIndex={-1} className={styles.resultsTitle}>
              Resultados para «{query}»<span className="sr-only">: </span>
              <span className={styles.resultsCount}>{plural(total, 'resultado', 'resultados')}</span>
            </h2>
            {total === 0 ? (
              <EmptyState icon={<SearchX />} title={MESSAGES.emptySearch.title} action={<Button variant="secondary" onClick={() => setQ('')}>Borrar la búsqueda</Button>}>
                {MESSAGES.emptySearch.body(query)}
              </EmptyState>
            ) : (
              <SearchResults results={results} tokens={tokens} query={query} link={link} />
            )}
          </motion.section>
        ) : (
          <motion.div key="portada" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.24 }}>
            <Doors news={news} docs={docs} readings={readings} link={link} />
            <LatestNews news={news} link={link} />
            <LatestDocuments docs={docs} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Resultados ─────────────────────────────────────────────────────── */

interface Results {
  news: Hit<NewsItem>[];
  docs: Hit<LibraryDocument>[];
  readings: Hit<Reading>[];
}

/** Las secciones con resultados, primero y a lo ancho; las vacías, en una línea al final. */
function SearchResults({ results, tokens, query, link }: { results: Results; tokens: string[]; query: string; link: (to: string) => string }) {
  const encoded = encodeURIComponent(query);
  const sections = [
    { key: 'news', title: 'Actualidad en tu sector', count: results.news.length },
    { key: 'docs', title: 'Notas informativas', count: results.docs.length },
    { key: 'readings', title: 'Lecturas recomendadas', count: results.readings.length },
  ] as const;
  const filled = sections.filter((s) => s.count > 0);
  const empty = sections.filter((s) => s.count === 0);
  const limit = filled.length === 1 ? 8 : 4;

  return (
    <>
      <div className={styles.groups} data-columns={filled.length}>
        {results.news.length > 0 && (
          <ResultGroup icon={<Newspaper />} title="Actualidad en tu sector" count={results.news.length} more={results.news.length > limit ? { to: link(`/consultar/actualidad?q=${encoded}`), label: `Ver las ${results.news.length} novedades` } : undefined}>
            {results.news.slice(0, limit).map(({ item }) => (
              <NewsResult key={item.id} item={item} tokens={tokens} to={link(`/consultar/actualidad/${item.slug}`)} />
            ))}
          </ResultGroup>
        )}
        {results.docs.length > 0 && (
          <ResultGroup icon={<FileText />} title="Notas informativas" count={results.docs.length} more={results.docs.length > limit ? { to: `/consultar/notas?q=${encoded}`, label: `Ver los ${results.docs.length} documentos` } : undefined}>
            {results.docs.slice(0, limit).map(({ item }) => (
              <DocResult key={item.id} item={item} tokens={tokens} />
            ))}
          </ResultGroup>
        )}
        {results.readings.length > 0 && (
          <ResultGroup icon={<BookOpen />} title="Lecturas recomendadas" count={results.readings.length}>
            {results.readings.slice(0, limit + 2).map(({ item }) => (
              <ReadingResult key={item.id} item={item} tokens={tokens} to={link(`/consultar/lecturas/${item.id}`)} />
            ))}
          </ResultGroup>
        )}
      </div>
      {empty.length > 0 && (
        <p className={styles.noneIn}>
          Sin resultados en {empty.map((s) => s.title).join(empty.length === 2 ? ' ni en ' : ', ')}.
        </p>
      )}
    </>
  );
}

function ResultGroup({ icon, title, count, more, children }: { icon: ReactNode; title: string; count: number; more?: { to: string; label: string }; children: ReactNode }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>
        <span className={styles.groupIcon} aria-hidden="true">
          {icon}
        </span>
        {title}
        <span className={styles.groupCount} aria-hidden="true">
          {count}
        </span>
        <span className="sr-only">: {plural(count, 'resultado', 'resultados')}</span>
      </h3>
      <ul role="list" className={styles.groupList}>
        {children}
      </ul>
      {more && (
        <Link to={more.to} className={`link-arrow ${styles.groupMore}`}>
          {more.label} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}

function NewsResult({ item, tokens, to }: { item: NewsItem; tokens: string[]; to: string }) {
  return (
    <li className={styles.result}>
      <Link to={to} className={styles.resultLink}>
        <Highlight text={item.headline} tokens={tokens} />
      </Link>
      <p className={styles.resultMeta}>
        <KindLabel kind={item.kind} size="sm" />
        <span>{areaName(item.area)}</span>
        <time dateTime={item.date}>{formatShortDate(item.date)}</time>
      </p>
      <p className={styles.resultText}>
        <Highlight text={excerpt(plainText(item.oneLiner), tokens, 150)} tokens={tokens} />
      </p>
    </li>
  );
}

function DocResult({ item, tokens }: { item: LibraryDocument; tokens: string[] }) {
  return (
    <li className={styles.result}>
      <Link to={`/consultar/notas/${item.id}`} className={styles.resultLink}>
        <Highlight text={item.title} tokens={tokens} />
      </Link>
      <p className={styles.resultMeta}>
        <DocKindLabel kind={item.kind} size="sm" />
        <span>{areaLabel(item.area)}</span>
        <time dateTime={item.date}>{formatShortDate(item.date)}</time>
      </p>
      <p className={styles.resultText}>
        <Highlight text={excerpt(item.summary, tokens, 150)} tokens={tokens} />
      </p>
    </li>
  );
}

function ReadingResult({ item, tokens, to }: { item: Reading; tokens: string[]; to: string }) {
  return (
    <li className={styles.result}>
      <Link to={to} className={styles.resultLink}>
        <Highlight text={item.title} tokens={tokens} />
      </Link>
      <p className={styles.resultMeta}>
        <span>
          <Highlight text={shortAuthors(item.authors)} tokens={tokens} />
        </span>
        <span>{areaName(item.area)}</span>
      </p>
      <p className={styles.resultText}>
        <Highlight text={excerpt(item.summary, tokens, 130)} tokens={tokens} />
      </p>
    </li>
  );
}

/* ── Las tres puertas ───────────────────────────────────────────────── */

interface Stat {
  value: number;
  label: string;
}

function Doors({ news, docs, readings, link }: { news: NewsItem[]; docs: LibraryDocument[]; readings: Reading[]; link: (to: string) => string }) {
  const today = madridDateKey();
  const lastMonth = news.filter((n) => {
    const d = diffDays(n.date, today);
    return d >= 0 && d <= 30;
  });
  const urgent = lastMonth.filter((n) => n.urgency === 'alta').length;
  const downloadable = docs.filter(isAvailable).length;
  const areas = new Set(readings.map((r) => r.area)).size;
  const latestNews = news[0];
  const latestDoc = docs[0];

  return (
    <ul role="list" className={styles.doors} aria-label="Secciones de Consultar">
      <Door
        index={0}
        kind="actualidad"
        to={link('/consultar/actualidad')}
        title="Actualidad en tu sector"
        text="Cada novedad en cinco bloques: qué cambia, a quién afecta, qué debemos hacer, un ejemplo y la fuente."
        art={<NewsArt />}
        stats={news.length ? [{ value: lastMonth.length, label: lastMonth.length === 1 ? 'novedad en 30 días' : 'novedades en 30 días' }, { value: urgent, label: 'de urgencia alta' }] : null}
        empty="Las primeras novedades están en revisión editorial."
        note={latestNews ? `Última: ${relativeDay(latestNews.date)}` : undefined}
        cta="Ver la actualidad"
      />
      <Door
        index={1}
        kind="notas"
        to="/consultar/notas"
        title="Notas informativas"
        text="Los documentos originales de cada área, con su versión vigente, para abrir o descargar."
        art={<DocsArt />}
        stats={docs.length ? [{ value: docs.length, label: docs.length === 1 ? 'documento' : 'documentos' }, { value: downloadable, label: 'PDF descargables' }] : null}
        empty="Todavía no hay documentos publicados."
        note={latestDoc ? `Último: ${formatShortDate(latestDoc.date, false)} · ${DOC_KIND[latestDoc.kind].label}` : undefined}
        cta="Ver las notas"
      />
      <Door
        index={2}
        kind="lecturas"
        to={link('/consultar/lecturas')}
        title="Lecturas recomendadas"
        text="La estantería del campus: los libros y manuales que recomienda cada área y por qué."
        art={<BooksArt />}
        stats={readings.length ? [{ value: readings.length, label: readings.length === 1 ? 'lectura' : 'lecturas' }, { value: areas, label: areas === 1 ? 'área' : 'áreas' }] : null}
        empty="La estantería se está llenando: cada área elige sus tres lecturas."
        cta="Ver la estantería"
      />
    </ul>
  );
}

interface DoorProps {
  index: number;
  kind: 'actualidad' | 'notas' | 'lecturas';
  to: string;
  title: string;
  text: string;
  art: ReactNode;
  stats: Stat[] | null;
  empty: string;
  note?: string;
  cta: string;
}

function Door({ index, kind, to, title, text, art, stats, empty, note, cta }: DoorProps) {
  return (
    <motion.li
      className={styles.door}
      data-door={kind}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.05 + index * 0.07, ease: EASE }}
    >
      <div className={styles.art} aria-hidden="true">
        {art}
      </div>
      <h2 className={styles.doorTitle}>
        <Link to={to} className={styles.stretch}>
          {title}
        </Link>
      </h2>
      <p className={styles.doorText}>{text}</p>
      {stats ? (
        <dl className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={styles.doorEmpty}>{empty}</p>
      )}
      <div className={styles.doorFoot}>
        {note && <span className={styles.doorNote}>{note}</span>}
        <span className={styles.doorGo} aria-hidden="true">
          {cta} <ArrowRight size={16} />
        </span>
      </div>
    </motion.li>
  );
}

/** Miniatura del formato de cinco bloques: círculos unidos por un filete; el tercero, lleno. */
function NewsArt() {
  return (
    <span className={styles.artNews}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={styles.artRow} data-action={i === 2 || undefined} style={{ '--i': i } as CSSProperties}>
          <span className={styles.artCircle} />
          <span className={styles.artBar} />
        </span>
      ))}
    </span>
  );
}

/** Tres hojas apiladas que se abren en abanico al pasar o enfocar. */
function DocsArt() {
  return (
    <span className={styles.artDocs}>
      <span className={styles.paper} />
      <span className={styles.paper} />
      <span className={styles.paper}>
        <span className={styles.paperDot} />
      </span>
    </span>
  );
}

const SPINES: { area: 'fiscal' | 'laboral' | 'mercantil' | 'contable'; h: number; w: number }[] = [
  { area: 'fiscal', h: 84, w: 18 },
  { area: 'laboral', h: 70, w: 14 },
  { area: 'mercantil', h: 92, w: 20 },
  { area: 'contable', h: 76, w: 16 },
  { area: 'fiscal', h: 62, w: 14 },
  { area: 'laboral', h: 88, w: 18 },
];

/** Lomos de la estantería en los colores de las áreas. */
function BooksArt() {
  return (
    <span className={styles.artBooks}>
      {SPINES.map((s, i) => (
        <span key={i} className={styles.spine} data-area={s.area} style={{ '--h': `${s.h}%`, '--w': `${s.w}px` } as CSSProperties} />
      ))}
    </span>
  );
}

/* ── Lo último ──────────────────────────────────────────────────────── */

function LatestNews({ news, link }: { news: NewsItem[]; link: (to: string) => string }) {
  const latest = news.slice(0, 3);
  return (
    <section className={styles.section} aria-labelledby="h-ultimas-novedades">
      <div className="section-head">
        <h2 id="h-ultimas-novedades" className="section-title">
          Últimas novedades
        </h2>
        {latest.length > 0 && (
          <Link to={link('/consultar/actualidad')} className="link-arrow">
            Ver toda la actualidad <ArrowRight size={16} aria-hidden="true" />
          </Link>
        )}
      </div>
      {latest.length > 0 ? (
        <ul role="list" className={styles.newsGrid}>
          {latest.map((n) => (
            <li key={n.id}>
              <NewsCard item={n} to={link(`/consultar/actualidad/${n.slug}`)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.newsEmpty}>
          <span className={styles.newsEmptyArt} aria-hidden="true">
            <NewsArt />
          </span>
          <div>
            <h3 className={styles.newsEmptyTitle}>Aún no hay novedades publicadas</h3>
            <p className={styles.newsEmptyText}>Cada novedad pasa por revisión editorial antes de publicarse. Cuando llegue la primera, la verás aquí y en tu inicio, explicada en cinco bloques.</p>
            <DevSampleHint />
          </div>
          <ButtonLink to="/consultar/notas" variant="secondary" icon={<FileText />}>
            Ver las notas informativas
          </ButtonLink>
        </div>
      )}
    </section>
  );
}

function LatestDocuments({ docs }: { docs: LibraryDocument[] }) {
  const latest = docs.slice(0, 4);
  if (!latest.length) return null;
  return (
    <section className={styles.section} aria-labelledby="h-ultimos-documentos">
      <div className="section-head">
        <h2 id="h-ultimos-documentos" className="section-title">
          Últimos documentos
        </h2>
        <Link to="/consultar/notas" className="link-arrow">
          Ver todas las notas <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ul role="list" className={styles.tiles}>
        {latest.map((d) => {
          const v = currentVersion(d);
          return (
            <li key={d.id} className={styles.tile} data-area={d.area === 'general' ? undefined : d.area}>
              <DocKindLabel kind={d.kind} size="sm" />
              <h3 className={styles.tileTitle}>
                <Link to={`/consultar/notas/${d.id}`} className={styles.stretch}>
                  {d.title}
                </Link>
              </h3>
              <p className={styles.tileIssuer}>{d.issuer}</p>
              <p className={styles.tileFacts}>
                <time dateTime={d.date}>{formatShortDate(d.date)}</time>
                {v?.pages ? ` · ${v.pages} págs.` : ''}
                {v && isAvailable(d) ? ` · ${fileSize(v.sizeKb).replace(' ', ' ')}` : ''}
              </p>
              {!isAvailable(d) && (
                <span className={styles.tileLock}>
                  <Lock size={14} aria-hidden="true" /> Versión interna
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

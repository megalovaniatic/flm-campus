import { AnimatePresence, motion } from 'motion/react';
import { FileText, Newspaper, SearchX, X } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { useLocation } from 'react-router';
import { AREA_IDS, AREA_LIST, formatLongDate, type AreaId, type NewsKind } from '@flm/shared';
import { Button, ButtonLink, EmptyState, PageHeader } from '@/design';
import { usePeople } from '@/data/selectors';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { FilterGroup, type FilterOption } from './components/FilterGroup';
import { NewsCard } from './components/NewsCard';
import { DevSampleHint, SampleNotice } from './components/SampleNotice';
import { SearchBox } from './components/SearchBox';
import { useLibLink, useLibraryNews, useSampleMode } from './lib/data';
import { groupByMonth } from './lib/group';
import { NEWS_KIND, NEWS_KIND_IDS, plural } from './lib/labels';
import { pick, useLibraryParams, useSearchText } from './lib/params';
import { newsFields, queryTokens, scoreFields } from './lib/search';
import lib from './Library.module.css';
import styles from './NewsList.module.css';

const EASE = [0.2, 0, 0, 1] as const;

/** Actualidad en tu sector: archivo por meses con filtros por área y tipo reflejados en la dirección. */
export default function NewsList() {
  usePageTitle('Actualidad en tu sector');
  const news = useLibraryNews();
  const people = usePeople();
  const sample = useSampleMode();
  const link = useLibLink();
  const location = useLocation();
  const [params, update] = useLibraryParams();
  const [q, setQ] = useSearchText(params, update);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const area = pick(params.get('area'), AREA_IDS);
  const kind = pick(params.get('tipo'), NEWS_KIND_IDS);
  const tokens = useMemo(() => queryTokens(q), [q]);

  const index = useMemo(() => news.map((n) => ({ item: n, fields: newsFields(n, people.find((p) => p.id === n.editorial.authorId)) })), [news, people]);
  const byQuery = useMemo(() => (tokens.length ? new Set(index.filter((e) => scoreFields(e.fields, tokens) > 0).map((e) => e.item.id)) : null), [index, tokens]);

  const inQuery = news.filter((n) => !byQuery || byQuery.has(n.id));
  const filtered = inQuery.filter((n) => (!area || n.area === area) && (!kind || n.kind === kind));
  const groups = groupByMonth(filtered, (n) => n.date);
  const active = !!(area || kind || q.trim());
  const latest = news[0];
  const from = `${location.pathname}${location.search}`;

  const areaOptions: FilterOption<'todas' | AreaId>[] = [
    { value: 'todas', label: 'Todas', count: inQuery.filter((n) => !kind || n.kind === kind).length },
    ...AREA_LIST.map((a) => ({ value: a.id, label: a.name, area: a.id, count: inQuery.filter((n) => n.area === a.id && (!kind || n.kind === kind)).length })),
  ];
  const kindOptions: FilterOption<'todos' | NewsKind>[] = [
    { value: 'todos', label: 'Todos', count: inQuery.filter((n) => !area || n.area === area).length },
    ...NEWS_KIND_IDS.map((k) => {
      const { label, Icon } = NEWS_KIND[k];
      return { value: k, label, icon: <Icon />, count: inQuery.filter((n) => n.kind === k && (!area || n.area === area)).length };
    }),
  ];

  const clearAll = () => {
    setQ('');
    update({ area: null, tipo: null, q: null });
  };

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Consultar', to: link('/consultar') }, { label: 'Actualidad en tu sector' }]}
        eyebrow={latest ? `Última novedad: ${formatLongDate(latest.date)}` : 'Biblioteca de FLM'}
        title="Actualidad en tu sector"
        lede="Novedades fiscales, laborales, mercantiles y contables, verificadas y explicadas en cinco bloques: qué cambia, a quién afecta, qué debemos hacer, un ejemplo y la fuente."
      />

      {sample && <SampleNotice />}

      {news.length === 0 ? (
        <section aria-labelledby="h-sin-novedades" className={styles.empty}>
          <h2 id="h-sin-novedades" className="sr-only">
            Sin novedades
          </h2>
          <EmptyState
            icon={<Newspaper />}
            title="Todavía no hay novedades publicadas"
            action={
              <ButtonLink to="/consultar/notas" variant="secondary" icon={<FileText />}>
                Ver las notas informativas
              </ButtonLink>
            }
          >
            Cada novedad pasa por revisión editorial antes de publicarse. Cuando llegue la primera, la verás aquí y en tu inicio. Mientras tanto, las notas informativas de cada área siguen disponibles.
            <DevSampleHint />
          </EmptyState>
        </section>
      ) : (
        <>
          <div className={lib.toolbar}>
            <div className={lib.search}>
              <SearchBox label="Buscar en la actualidad" value={q} onChange={setQ} placeholder="Titular, norma o tema…" onSubmit={() => statusRef.current?.focus()} />
            </div>
            <div className={lib.filters}>
              <FilterGroup label="Área" options={areaOptions} value={area ?? 'todas'} onChange={(v) => update({ area: v === 'todas' ? null : v })} noun={['novedad', 'novedades']} />
              <FilterGroup label="Tipo" options={kindOptions} value={kind ?? 'todos'} onChange={(v) => update({ tipo: v === 'todos' ? null : v })} noun={['novedad', 'novedades']} />
            </div>
          </div>

          <div className={lib.statusRow}>
            <p ref={statusRef} tabIndex={-1} role="status" className={lib.status}>
              {filtered.length === news.length ? (
                <strong>{plural(news.length, 'novedad', 'novedades')}</strong>
              ) : (
                <>
                  <strong>{filtered.length}</strong> de {plural(news.length, 'novedad', 'novedades')}
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
                  <span className={lib.monthCount}>{plural(g.items.length, 'novedad', 'novedades')}</span>
                </h2>
                <ul role="list" className={styles.grid}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {g.items.map((n) => (
                      <motion.li
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.16 } }}
                        transition={{ duration: 0.28, ease: EASE, layout: { duration: 0.32, ease: EASE } }}
                        className={styles.item}
                      >
                        <NewsCard item={n} to={link(`/consultar/actualidad/${n.slug}`)} state={{ from }} tokens={tokens} headingLevel={3} withYear={false} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}

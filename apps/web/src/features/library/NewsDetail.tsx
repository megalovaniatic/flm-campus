import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, FileText, Info } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { areaName, formatLongDate, formatShortDate, type NewsItem } from '@flm/shared';
import { AreaTag, Avatar, Button, ButtonLink, Notice, PageHeader, toast } from '@/design';
import { useDocuments, usePeople } from '@/data/selectors';
import { asset } from '@/lib/download';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { Rich, RichParagraphs } from '@/lib/rich';
import { KindLabel, SampleBadge, UrgencyLabel } from './components/Labels';
import { SampleNotice } from './components/SampleNotice';
import { isSample, useLibLink, useLibraryNews, useSampleMode } from './lib/data';
import { currentVersion } from './lib/docs';
import { NEWS_KIND } from './lib/labels';
import lib from './Library.module.css';
import styles from './NewsDetail.module.css';

const BLOCK_TITLES = ['La novedad, en una frase', 'A quién afecta', 'Qué debemos hacer', 'Un ejemplo sencillo', 'Fuente y fecha'] as const;

/** Fechas «AAAA-MM-DD» válidas (el contenido creado en Gestión puede llegar incompleto). */
const isDateKey = (value?: string): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Detalle de una novedad: los cinco bloques en una columna numerada, como la variante vertical del logotipo. */
export default function NewsDetail() {
  const { slug } = useParams();
  const news = useLibraryNews();
  const sample = useSampleMode();
  const link = useLibLink();
  const location = useLocation();
  const index = news.findIndex((n) => n.slug === slug);
  const item = index >= 0 ? news[index] : undefined;
  usePageTitle(item ? item.headline : 'Novedad no disponible');

  const from = (location.state as { from?: string } | null)?.from;
  const back = from && from.startsWith('/consultar/actualidad') ? from : link('/consultar/actualidad');

  if (!item) {
    return (
      <div className="container page">
        <PageHeader
          crumbs={[
            { label: 'Consultar', to: link('/consultar') },
            { label: 'Actualidad en tu sector', to: back },
          ]}
          title={MESSAGES.notFound.title}
          lede={MESSAGES.notFound.body}
          actions={
            <>
              <ButtonLink to={back} variant="primary" icon={<ArrowLeft />}>
                Ver la actualidad
              </ButtonLink>
              <ButtonLink to={link('/consultar')} variant="secondary">
                Buscar en Consultar
              </ButtonLink>
            </>
          }
        />
      </div>
    );
  }

  const newer = index > 0 ? news[index - 1] : undefined;
  const older = news[index + 1];
  const { Icon, label: kindLabel } = NEWS_KIND[item.kind];

  return (
    <article className="container page" data-area={item.area}>
      <PageHeader
        crumbs={[
          { label: 'Consultar', to: link('/consultar') },
          { label: 'Actualidad en tu sector', to: back },
          { label: 'Novedad' },
        ]}
        eyebrow={
          <span className={styles.eyebrow}>
            <Icon size={15} strokeWidth={2} aria-hidden="true" />
            {kindLabel}
            <span aria-hidden="true">·</span>
            {areaName(item.area)}
          </span>
        }
        title={item.headline}
        actions={
          <div className={styles.headMeta}>
            <UrgencyLabel urgency={item.urgency} />
            <span className={styles.metaText}>
              Publicada en el campus el <time dateTime={item.date}>{formatLongDate(item.date)}</time>
            </span>
            {isSample(item.id) && <SampleBadge />}
          </div>
        }
      />

      {sample && <SampleNotice />}

      <div className={styles.layout}>
        <FiveBlocks item={item} />
        <Aside item={item} />
      </div>

      {(newer || older) && (
        <nav className={styles.pager} aria-label="Más novedades">
          {newer && (
            <Link to={link(`/consultar/actualidad/${newer.slug}`)} state={from ? { from } : undefined} className={styles.pagerLink} data-dir="newer">
              <ArrowLeft size={18} aria-hidden="true" className={styles.pagerIcon} />
              <span>
                <span className={styles.pagerLabel}>Novedad más reciente</span>
                <span className={styles.pagerTitle}>{newer.headline}</span>
              </span>
            </Link>
          )}
          {older && (
            <Link to={link(`/consultar/actualidad/${older.slug}`)} state={from ? { from } : undefined} className={styles.pagerLink} data-dir="older">
              <span>
                <span className={styles.pagerLabel}>Novedad anterior</span>
                <span className={styles.pagerTitle}>{older.headline}</span>
              </span>
              <ArrowRight size={18} aria-hidden="true" className={styles.pagerIcon} />
            </Link>
          )}
        </nav>
      )}

      <p className={lib.backRow}>
        <Link to={back} className="link-arrow">
          <ArrowLeft size={16} aria-hidden="true" /> Volver a la actualidad
        </Link>
      </p>
    </article>
  );
}

interface RuleGeometry {
  x: number;
  top: number;
  length: number;
}

/**
 * Columna de cinco bloques. Los círculos 1–5 se unen con un filete que recorre el degradado
 * oficial de arriba abajo; al entrar, el filete se dibuja y cada círculo aparece cuando lo alcanza.
 */
function FiveBlocks({ item }: { item: NewsItem }) {
  const reduce = useReducedMotionPref();
  const [animate] = useState(() => !reduce);
  const listRef = useRef<HTMLOListElement>(null);
  const [rule, setRule] = useState<RuleGeometry | null>(null);

  useLayoutEffect(() => {
    const ol = listRef.current;
    if (!ol) return;
    const measure = () => {
      const markers = ol.querySelectorAll<HTMLElement>('[data-marker]');
      const first = markers[0];
      const last = markers[markers.length - 1];
      if (!first || !last) return;
      const box = ol.getBoundingClientRect();
      const a = first.getBoundingClientRect();
      const b = last.getBoundingClientRect();
      const next = { x: a.left - box.left + a.width / 2, top: a.top - box.top + a.height / 2, length: b.top - a.top };
      setRule((prev) => (prev && Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.top - next.top) < 0.5 && Math.abs(prev.length - next.length) < 0.5 ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [item.id]);

  const { source } = item;
  const published = isDateKey(source.publishedOn) ? source.publishedOn : undefined;
  const effective = isDateKey(source.effectiveOn) ? source.effectiveOn : undefined;
  const sourceUrl = /^https?:\/\//.test(source.url) ? source.url : undefined;
  const reference = [source.label, published && `Publicación: ${formatLongDate(published)}`, effective && `Entrada en vigor: ${formatLongDate(effective)}`].filter(Boolean).join('. ') + `.${sourceUrl ? ` ${sourceUrl}` : ''}`;

  const marker = (i: number) => (
    <motion.span
      data-marker=""
      className={styles.marker}
      aria-hidden="true"
      initial={animate ? { scale: 0.3, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.12 + i * 0.13, type: 'spring', stiffness: 460, damping: 24 }}
    >
      {i + 1}
    </motion.span>
  );

  return (
    <div className={styles.main}>
      <ol ref={listRef} role="list" className={styles.blocks} key={item.id}>
        {rule && (
          <span className={styles.ruleWrap} style={{ left: rule.x + 1, top: rule.top, width: rule.length } as CSSProperties} aria-hidden="true">
            <motion.span className={styles.rule} initial={animate ? { scaleX: 0 } : false} animate={{ scaleX: 1 }} transition={{ duration: 0.72, delay: 0.08, ease: [0.45, 0, 0.25, 1] }} />
          </span>
        )}

        <li className={styles.block} data-n="1">
          {marker(0)}
          <div className={styles.body}>
            <h2 className={styles.blockTitle}>{BLOCK_TITLES[0]}</h2>
            <p className={styles.statement}>
              <Rich text={item.oneLiner} />
            </p>
          </div>
        </li>

        <li className={styles.block} data-n="2">
          {marker(1)}
          <div className={styles.body}>
            <h2 className={styles.blockTitle}>{BLOCK_TITLES[1]}</h2>
            <div className={`prose ${styles.prose}`}>
              <RichParagraphs text={item.affects} />
            </div>
          </div>
        </li>

        <li className={styles.block} data-n="3" data-action="">
          {marker(2)}
          <div className={styles.body}>
            <div className={styles.actionCard}>
              <h2 className={`${styles.blockTitle} ${styles.actionTitle}`}>{BLOCK_TITLES[2]}</h2>
              <div className={styles.actionText}>
                <RichParagraphs text={item.action} />
              </div>
            </div>
            {item.nuance && (
              <div className={styles.nuance}>
                <Notice tone="info" title="Matiz" icon={<Info size={18} />}>
                  <Rich text={item.nuance} />
                </Notice>
              </div>
            )}
          </div>
        </li>

        <li className={styles.block} data-n="4">
          {marker(3)}
          <div className={styles.body}>
            <h2 className={styles.blockTitle}>{BLOCK_TITLES[3]}</h2>
            <div className={styles.example}>
              <RichParagraphs text={item.example} />
            </div>
          </div>
        </li>

        <li className={styles.block} data-n="5">
          {marker(4)}
          <div className={styles.body}>
            <h2 className={styles.blockTitle}>{BLOCK_TITLES[4]}</h2>
            <dl className={styles.source}>
              <div>
                <dt>Fuente</dt>
                <dd>
                  {sourceUrl ? (
                    <a href={sourceUrl} target="_blank" rel="noreferrer" className={styles.sourceLink}>
                      {source.label}
                      <ExternalLink size={15} aria-hidden="true" />
                      <span className="sr-only"> (se abre en una pestaña nueva)</span>
                    </a>
                  ) : source.url.startsWith('#/') ? (
                    <Link to={source.url.slice(1)} className={styles.sourceLink}>
                      {source.label}
                    </Link>
                  ) : (
                    source.label
                  )}
                </dd>
              </div>
              <div>
                <dt>Publicación</dt>
                <dd>{published ? <time dateTime={published}>{formatLongDate(published)}</time> : <span className={styles.muted}>No se indica</span>}</dd>
              </div>
              <div>
                <dt>Entrada en vigor</dt>
                <dd>{effective ? <time dateTime={effective}>{formatLongDate(effective)}</time> : <span className={styles.muted}>No se indica en la fuente</span>}</dd>
              </div>
            </dl>
            <div className={styles.reference}>
              <p className={styles.referenceText}>
                <span className={styles.referenceLabel}>Referencia</span>
                {reference}
              </p>
              <CopyReference text={reference} />
            </div>
          </div>
        </li>
      </ol>
    </div>
  );
}

/** Copia de respaldo para navegadores o marcos que bloquean la API del portapapeles. */
function legacyCopy(text: string): boolean {
  const previous = document.activeElement as HTMLElement | null;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  previous?.focus({ preventScroll: true });
  return ok;
}

/** «Copiar referencia»: portapapeles + aviso; si el navegador lo impide, se explica cómo hacerlo a mano. */
function CopyReference({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2600);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    let ok = false;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Portapapeles no disponible');
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    if (ok) {
      setCopied(true);
      toast.success('Referencia copiada', 'Ya puedes pegarla en un correo, un informe o una nota para el cliente.');
    } else {
      toast.error('No se ha podido copiar la referencia', 'Tu navegador no lo ha permitido. Selecciona el texto de la referencia y cópialo con Ctrl + C (⌘ + C en Mac).');
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={() => void copy()}
      data-copied={copied || undefined}
      className={styles.copy}
      icon={
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'ok' : 'copy'}
            className={styles.copyIcon}
            initial={{ opacity: 0, scale: 0.5, rotate: copied ? -40 : 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 520, damping: 28 }}
          >
            {copied ? <Check strokeWidth={2.5} /> : <Copy />}
          </motion.span>
        </AnimatePresence>
      }
    >
      {copied ? 'Referencia copiada' : 'Copiar referencia'}
    </Button>
  );
}

/** Ficha lateral: datos de la novedad, autoría y documentos del área para ampliar. */
function Aside({ item }: { item: NewsItem }) {
  const people = usePeople();
  const docs = useDocuments();
  const author = people.find((p) => p.id === item.editorial.authorId);
  const related = docs.filter((d) => d.area === item.area).slice(0, 3);
  const review = item.editorial.review;

  return (
    <aside className={styles.aside} aria-label="Ficha de la novedad">
      <section className={styles.panel} aria-labelledby="h-ficha">
        <h2 id="h-ficha" className={styles.panelTitle}>
          Ficha
        </h2>
        <dl className={styles.facts}>
          <div>
            <dt>Tipo</dt>
            <dd>
              <KindLabel kind={item.kind} size="sm" />
            </dd>
          </div>
          <div>
            <dt>Área</dt>
            <dd>
              <AreaTag area={item.area} size="sm" />
            </dd>
          </div>
          <div>
            <dt>Urgencia</dt>
            <dd>
              <UrgencyLabel urgency={item.urgency} />
            </dd>
          </div>
          {author && (
            <div>
              <dt>Redacta</dt>
              <dd className={styles.author}>
                <Avatar name={author.name} photo={author.photo ? asset(author.photo) : undefined} size={32} decorative />
                <span>
                  <span className={styles.authorName}>{author.name}</span>
                  <span className={styles.authorRole}>{author.position}</span>
                </span>
              </dd>
            </div>
          )}
          <div>
            <dt>Revisión</dt>
            <dd>{review.state === 'revisado' ? `Revisada${review.reviewerName ? ` · ${review.reviewerName}` : ''}` : 'Pendiente de revisión editorial'}</dd>
          </div>
        </dl>
      </section>

      {related.length > 0 && (
        <section className={styles.panel} aria-labelledby="h-ampliar">
          <h2 id="h-ampliar" className={styles.panelTitle}>
            Para ampliar · {areaName(item.area)}
          </h2>
          <ul role="list" className={styles.related}>
            {related.map((d) => {
              const v = currentVersion(d);
              return (
                <li key={d.id}>
                  <Link to={`/consultar/notas/${d.id}`} className={styles.relatedLink}>
                    <FileText size={18} aria-hidden="true" className={styles.relatedIcon} />
                    <span>
                      <span className={styles.relatedTitle}>{d.title}</span>
                      <span className={styles.relatedMeta}>
                        {formatShortDate(d.date)}
                        {v?.pages ? ` · ${v.pages} págs.` : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </aside>
  );
}

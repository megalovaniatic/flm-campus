import { animate } from 'motion/react';
import { CalendarPlus, Check, Copy, Download, ExternalLink, FileText, Lock, PenLine } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import {
  AREAS,
  eventPhase,
  fileSize,
  formatLongDate,
  formatShortDate,
  formatWeekdayDate,
  monthShort,
  STATUS_LABEL_EDITORIAL,
  type EditorialStatus,
  type KeyTerm,
} from '@flm/shared';
import { AreaTag, Avatar, Button, Chip, Notice, PhaseChip } from '@/design';
import { useFormations, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { Rich, RichParagraphs, TermsProvider, useTerms } from '@/lib/rich';
import { useReducedMotionPref } from '@/lib/preferences';
import { bridgePath, easeOut } from '@/motion/liquid';
import { eventIcon, NEWS_KIND_ICON } from './catalog';
import {
  CALLOUT_LABEL,
  CATEGORY_LABEL,
  DEMO_FILE_PREFIX,
  DOC_KIND_LABEL,
  formationMinutes,
  formToEvent,
  NEWS_KIND_LABEL,
  OPTION_LETTERS,
  sessionToShared,
  splitTags,
  URGENCY_LABEL,
  type AnyForm,
  type DocumentForm,
  type EditorBlock,
  type EventForm,
  type FormationForm,
  type NewsForm,
  type TestForm,
} from './forms';
import { TYPE_META } from './model';
import styles from './ContentPreview.module.css';

const base = import.meta.env.BASE_URL;

/** Texto provisional visible mientras un campo está vacío. */
function Ph({ children }: { children: ReactNode }) {
  return <span className={styles.ph}>{children}</span>;
}

function RichOr({ text, ph }: { text: string; ph: string }) {
  return text.trim() ? <Rich text={text} /> : <Ph>{ph}</Ph>;
}

export interface PreviewMeta {
  authorId?: string;
  status?: EditorialStatus;
  reviewerName?: string;
}

function Byline({ meta }: { meta?: PreviewMeta }) {
  const people = usePeople();
  const author = meta?.authorId ? people.find((p) => p.id === meta.authorId) : undefined;
  if (!author) return null;
  const reviewed = meta?.status === 'publicado' || meta?.status === 'archivado';
  return (
    <div className={styles.byline}>
      <Avatar name={author.name} photo={author.photo ? base + author.photo : undefined} size={36} decorative />
      <p>
        <span className={styles.bylineName}>{author.name}</span>
        <span className={styles.bylineRole}>
          {author.position} · {reviewed ? `Revisado${meta?.reviewerName ? ` por ${meta.reviewerName}` : ''}` : `Pendiente de revisión (${STATUS_LABEL_EDITORIAL[meta?.status ?? 'borrador'].toLowerCase()})`}
        </span>
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Noticia: cinco bloques en columna numerada
 * ──────────────────────────────────────────────────────────────────────────── */

function NewsPreview({ form, meta }: { form: NewsForm; meta?: PreviewMeta }) {
  const KindIcon = NEWS_KIND_ICON[form.kind];
  const [copied, setCopied] = useState(false);
  const reference = `${form.sourceLabel.trim() || 'Fuente'}${form.publishedOn ? `, ${formatLongDate(form.publishedOn)}` : ''}${form.sourceUrl.trim() ? `. ${form.sourceUrl.trim()}` : ''}`;
  return (
    <article className={styles.doc} data-area={form.area}>
      <div className={styles.topline}>
        <span className={styles.kind}>
          <KindIcon size={16} aria-hidden="true" /> {NEWS_KIND_LABEL[form.kind]}
        </span>
        <AreaTag area={form.area} size="sm" />
        <Chip size="sm" tone={form.urgency === 'alta' ? 'danger' : form.urgency === 'media' ? 'warning' : 'neutral'}>
          {URGENCY_LABEL[form.urgency]}
        </Chip>
      </div>
      <h2 className={styles.headline}>{form.headline.trim() || <Ph>Titular de la novedad</Ph>}</h2>
      <p className={styles.dateline}>{form.date ? formatLongDate(form.date) : <Ph>Fecha</Ph>}</p>
      <ol className={styles.five}>
        <li>
          <span className={styles.n} aria-hidden="true">
            1
          </span>
          <div>
            <h3 className={styles.blockTitle}>La novedad, en una frase</h3>
            <p className={styles.lead}>
              <RichOr text={form.oneLiner} ph="Qué cambia, en una sola frase." />
            </p>
          </div>
        </li>
        <li>
          <span className={styles.n} aria-hidden="true">
            2
          </span>
          <div>
            <h3 className={styles.blockTitle}>A quién afecta</h3>
            <p>
              <RichOr text={form.affects} ph="Tipo de cliente o de persona afectada." />
            </p>
          </div>
        </li>
        <li className={styles.key}>
          <span className={styles.n} aria-hidden="true">
            3
          </span>
          <div>
            <h3 className={styles.blockTitle}>Qué debemos hacer</h3>
            <p>
              <RichOr text={form.action} ph="La acción concreta para el equipo, con plazo si lo hay." />
            </p>
          </div>
        </li>
        <li>
          <span className={styles.n} aria-hidden="true">
            4
          </span>
          <div>
            <h3 className={styles.blockTitle}>Un ejemplo sencillo</h3>
            <p>
              <RichOr text={form.example} ph="Un caso breve con cifras redondas." />
            </p>
          </div>
        </li>
        <li>
          <span className={styles.n} aria-hidden="true">
            5
          </span>
          <div>
            <h3 className={styles.blockTitle}>Fuente y fecha</h3>
            <p>
              {form.sourceLabel.trim() ? (
                form.sourceUrl.trim().startsWith('https://') ? (
                  <a href={form.sourceUrl.trim()} target="_blank" rel="noreferrer">
                    {form.sourceLabel.trim()}
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                ) : (
                  form.sourceLabel.trim()
                )
              ) : (
                <Ph>Norma, resolución o criterio con su enlace oficial.</Ph>
              )}
            </p>
            <p className={styles.small}>
              {form.publishedOn && `Publicada el ${formatLongDate(form.publishedOn)}`}
              {form.effectiveOn && ` · En vigor desde el ${formatLongDate(form.effectiveOn)}`}
            </p>
            <Button
              size="sm"
              variant="soft"
              icon={copied ? <Check /> : <Copy />}
              onClick={() => {
                navigator.clipboard?.writeText(reference).then(
                  () => setCopied(true),
                  () => setCopied(false),
                );
                window.setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? 'Referencia copiada' : 'Copiar referencia'}
            </Button>
          </div>
        </li>
      </ol>
      {form.nuance.trim() && (
        <aside className={styles.nuance}>
          <h3 className={styles.blockTitle}>Matices</h3>
          <p>
            <Rich text={form.nuance} />
          </p>
        </aside>
      )}
      <Byline meta={meta} />
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Documento: ficha con miniatura, versión, tamaño e historial
 * ──────────────────────────────────────────────────────────────────────────── */

function DocumentPreview({ form, meta }: { form: DocumentForm; meta?: PreviewMeta }) {
  const people = usePeople();
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? id;
  const history = [...form.versions].sort((a, b) => b.version - a.version);
  const current = history[0];
  const pending = form.upload;
  const shown = pending ? { version: (current?.version ?? 0) + 1, sizeKb: pending.sizeKb, pages: pending.pages } : current;
  const tags = splitTags(form.tags);
  const thumb = pending?.thumb;
  const localFile = !pending && current?.file.startsWith(DEMO_FILE_PREFIX);
  return (
    <article className={styles.doc}>
      <div className={styles.docHead}>
        <div className={styles.thumb} data-real={!!thumb || undefined} aria-hidden="true">
          {thumb ? (
            <img src={thumb} alt="" />
          ) : (
            <>
              <span className={styles.thumbKind}>{DOC_KIND_LABEL[form.kind]}</span>
              <span className={styles.thumbLine} style={{ width: '82%' }} />
              <span className={styles.thumbLine} style={{ width: '64%' }} />
              <span className={styles.thumbLine} style={{ width: '74%' }} />
              <span className={styles.thumbLine} style={{ width: '40%' }} />
              <FileText className={styles.thumbIcon} size={22} />
            </>
          )}
        </div>
        <div className={styles.docInfo}>
          <p className={styles.kicker}>
            {DOC_KIND_LABEL[form.kind]} · {form.issuer.trim() || <Ph>Emisor</Ph>}
          </p>
          <h2 className={styles.docTitle}>{form.title.trim() || <Ph>Título del documento</Ph>}</h2>
          <div className={styles.metaRow}>
            {form.area === 'general' ? <Chip size="sm">General</Chip> : <AreaTag area={form.area} size="sm" />}
            <span className={styles.small}>
              {form.date ? formatShortDate(form.date) : ''}
              {shown ? ` · Versión ${shown.version}` : ''}
              {shown?.pages ? ` · ${shown.pages} págs.` : ''}
            </span>
          </div>
          <div className={styles.docActions}>
            <Button size="sm" variant="secondary" icon={<ExternalLink />} disabled>
              Abrir
            </Button>
            <Button size="sm" variant="secondary" icon={<Download />} disabled>
              {shown ? `Descargar (PDF · ${fileSize(shown.sizeKb)})` : 'Descargar (PDF)'}
            </Button>
          </div>
          {(pending || localFile) && <p className={styles.small}>En la demostración el PDF se valida en tu navegador, pero no se sube: los botones se activan en la versión interna.</p>}
        </div>
      </div>
      {form.notice.trim() && (
        <Notice tone="warning" title="Aviso editorial">
          {form.notice}
        </Notice>
      )}
      <p className={styles.summaryText}>{form.summary.trim() || <Ph>Resumen: qué explica el documento y para qué sirve.</Ph>}</p>
      {tags.length > 0 && (
        <ul role="list" className={styles.tags} aria-label="Etiquetas">
          {tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      <section className={styles.subsection} aria-label="Historial de versiones">
        <h3 className={styles.blockTitle}>Historial de versiones</h3>
        {history.length === 0 && !pending ? (
          <p className={styles.small}>
            <Ph>Sube el PDF para crear la versión 1.</Ph>
          </p>
        ) : (
          <ol role="list" className={styles.versions}>
            {pending && (
              <li data-pending>
                <span className={styles.vNum}>v{(current?.version ?? 0) + 1}</span>
                <span>
                  <strong>{pending.name}</strong>
                  <span className={styles.small}>
                    {' '}
                    · {fileSize(pending.sizeKb)}
                    {pending.pages ? ` · ${pending.pages} págs.` : ''} · se publicará como versión nueva
                  </span>
                  {form.versionNote.trim() && <span className={styles.vNote}>{form.versionNote}</span>}
                </span>
              </li>
            )}
            {history.map((v, i) => (
              <li key={v.version}>
                <span className={styles.vNum}>v{v.version}</span>
                <span>
                  <strong>{i === 0 && !pending ? 'Vigente' : 'Anterior'}</strong>
                  <span className={styles.small}>
                    {' '}
                    · {formatShortDate(v.uploadedAt.slice(0, 10))} · {nameOf(v.uploadedBy)} · {fileSize(v.sizeKb)}
                    {v.pages ? ` · ${v.pages} págs.` : ''}
                  </span>
                  {v.note && <span className={styles.vNote}>{v.note}</span>}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
      <Byline meta={meta} />
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Evento: círculos de fecha unidos por puentes, sesiones y enlaces
 * ──────────────────────────────────────────────────────────────────────────── */

function Bridge({ a, b, r }: { a: [number, number]; b: [number, number]; r: number }) {
  const reduce = useReducedMotionPref();
  const [s, setS] = useState(reduce ? 0.5 : 0);
  useEffect(() => {
    if (reduce) {
      setS(0.5);
      return;
    }
    const c = animate(0, 1, { duration: 0.42, ease: 'linear', onUpdate: (v) => setS(0.5 * easeOut(v)) });
    return () => c.stop();
  }, [reduce]);
  return <path d={bridgePath(a, r, b, r, s)} className={styles.chainFill} />;
}

function DateChain({ days, pending }: { days: string[]; pending: boolean }) {
  const r = 25;
  const step = 58;
  const max = 5;
  const shown = days.slice(0, max);
  const extra = days.length - shown.length;
  if (pending || days.length === 0) {
    return (
      <div className={styles.chain}>
        <svg width={2 * r + 4} height={2 * r + 4} viewBox={`0 0 ${2 * r + 4} ${2 * r + 4}`} aria-hidden="true">
          <circle cx={r + 2} cy={r + 2} r={r} fill="none" className={styles.pendingRing} strokeWidth="1.5" strokeDasharray="5 5" />
          <text x={r + 2} y={r + 6} textAnchor="middle" className={styles.pendingText}>
            por fijar
          </text>
        </svg>
        <span className={styles.chainNote}>Fecha por confirmar</span>
      </div>
    );
  }
  const width = 4 + 2 * r + step * (shown.length - 1);
  const c = (i: number): [number, number] => [2 + r + step * i, 2 + r];
  return (
    <div className={styles.chain}>
      <svg width={width} height={2 * r + 4} viewBox={`0 0 ${width} ${2 * r + 4}`} aria-hidden="true" className={styles.chainSvg}>
        {shown.slice(1).map((d, i) => (
          <Bridge key={`${shown[i]}-${d}`} a={c(i)} b={c(i + 1)} r={r} />
        ))}
        {shown.map((d, i) => (
          <g key={`${d}-${i}`}>
            <circle cx={c(i)[0]} cy={c(i)[1]} r={r} className={styles.chainFill} />
            <text x={c(i)[0]} y={c(i)[1] + 3} textAnchor="middle" className={styles.chainDay}>
              {Number(d.slice(8))}
            </text>
            <text x={c(i)[0]} y={c(i)[1] + 15} textAnchor="middle" className={styles.chainMonth}>
              {monthShort(Number(d.slice(5, 7)))}
            </text>
          </g>
        ))}
      </svg>
      {extra > 0 && <span className={styles.more}>+{extra} sesiones más</span>}
    </div>
  );
}

function EventPreview({ form, meta }: { form: EventForm; meta?: PreviewMeta }) {
  const { Icon, label: iconLabel } = eventIcon(form.icon);
  const built = useMemo(() => {
    try {
      return formToEvent(
        { ...form, sessions: form.sessions.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.startDate)) },
        { id: 'vista-previa', slug: 'vista-previa', editorial: { status: 'borrador', authorId: '', review: { state: 'pendiente' } }, uploadedBy: '', today: '' },
      );
    } catch {
      return null;
    }
  }, [form]);
  const phase = built ? eventPhase(built) : 'proximo';
  const sessions = form.pendingDate ? [] : form.sessions.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.startDate));
  const days = [...new Set(sessions.map((s) => s.startDate))].sort();
  return (
    <article className={styles.doc}>
      <div className={styles.eventHead}>
        <span className={styles.eventIcon} title={iconLabel}>
          <Icon size={26} aria-hidden="true" />
          <span className="sr-only">Icono: {iconLabel}</span>
        </span>
        <div className={styles.eventHeadText}>
          <p className={styles.kicker}>
            {TYPE_META[form.type].label} · {CATEGORY_LABEL[form.category]}
            {form.department.trim() ? ` · ${form.department}` : ''}
          </p>
          <h2 className={styles.docTitle}>{form.title.trim() || <Ph>Título del {TYPE_META[form.type].lower}</Ph>}</h2>
          <div className={styles.metaRow}>
            <PhaseChip phase={phase} pending={form.pendingDate || sessions.length === 0} size="sm" />
            {form.manualPhase && <Chip size="sm">Reclasificado a mano</Chip>}
          </div>
        </div>
      </div>
      <DateChain days={days} pending={form.pendingDate} />
      <p className={styles.summaryText}>{form.summary.trim() || <Ph>Descripción breve: qué es y para quién.</Ph>}</p>
      {form.body.trim() && (
        <div className={`prose ${styles.prose}`}>
          <RichParagraphs text={form.body} />
        </div>
      )}
      {!form.pendingDate && sessions.length > 0 && (
        <section className={styles.subsection} aria-label={sessions.length === 1 ? 'Sesión' : 'Sesiones'}>
          <h3 className={styles.blockTitle}>{sessions.length === 1 ? 'Sesión' : `${sessions.length} sesiones`}</h3>
          <ol role="list" className={styles.sessions}>
            {sessions.map((s) => {
              const sh = sessionToShared(s);
              const time = s.startTime ? `${s.startTime}${s.endTime ? `–${s.endTime}` : ''}` : 'Todo el día';
              return (
                <li key={s.id}>
                  <span className={styles.sessionDate}>{formatWeekdayDate(s.startDate)}</span>
                  <span className={styles.small}>
                    {time}
                    {s.endDate && s.endDate !== s.startDate ? ` · hasta el ${formatShortDate(s.endDate, false)}` : ''}
                    {sh.label ? ` · ${sh.label}` : ''}
                    {sh.location ? ` · ${sh.location}` : ''}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className={styles.small}>Horas de Madrid (hora peninsular española).</p>
        </section>
      )}
      {form.pendingDate && form.pendingDateNote.trim() && <p className={styles.small}>{form.pendingDateNote}</p>}
      {form.links.some((l) => l.label.trim()) && (
        <ul role="list" className={styles.links}>
          {form.links
            .filter((l) => l.label.trim())
            .map((l) => (
              <li key={l.id}>
                {l.example || !l.url.trim().startsWith('https://') ? (
                  <span className={styles.fakeLink}>
                    {l.label} <Chip size="sm">Enlace de ejemplo</Chip>
                  </span>
                ) : (
                  <a href={l.url.trim()} target="_blank" rel="noreferrer">
                    {l.label} <ExternalLink size={14} aria-hidden="true" />
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                )}
              </li>
            ))}
        </ul>
      )}
      {!form.pendingDate && sessions.length > 0 && (
        <div>
          <Button size="sm" variant="secondary" icon={<CalendarPlus />} disabled>
            Añadir a mi calendario (.ics)
          </Button>
        </div>
      )}
      <Byline meta={meta} />
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Formación: portada tipográfica, bloques, términos, idea clave y fuentes
 * ──────────────────────────────────────────────────────────────────────────── */

function BlockView({ b }: { b: EditorBlock }) {
  switch (b.type) {
    case 'heading':
      return <h3 className={styles.fHeading}>{b.text.trim() || <Ph>Título de sección</Ph>}</h3>;
    case 'paragraph':
      return b.text.trim() ? <RichParagraphs text={b.text} /> : <p><Ph>Párrafo</Ph></p>;
    case 'list': {
      const items = b.items.split('\n').map((x) => x.trim()).filter(Boolean);
      const Tag = b.ordered ? 'ol' : 'ul';
      return items.length ? (
        <Tag className={styles.fList}>
          {items.map((it, i) => (
            <li key={i}>
              <Rich text={it} />
            </li>
          ))}
        </Tag>
      ) : (
        <p>
          <Ph>Lista (un elemento por línea)</Ph>
        </p>
      );
    }
    case 'callout':
      return (
        <aside className={styles.callout} data-tone={b.tone}>
          <p className={b.tone === 'clave' ? styles.explicamos : styles.calloutLabel}>
            {CALLOUT_LABEL[b.tone]}
            {b.title.trim() ? ` ${b.title.trim()}` : ''}
          </p>
          <p>
            <RichOr text={b.text} ph="Texto del recuadro" />
          </p>
        </aside>
      );
    case 'example':
      return (
        <section className={styles.example} aria-label={b.title || 'Ejemplo resuelto'}>
          <p className={styles.exampleLabel}>Ejemplo resuelto</p>
          <h3 className={styles.exampleTitle}>{b.title.trim() || <Ph>Título del ejemplo</Ph>}</h3>
          <p>
            <RichOr text={b.scenario} ph="Planteamiento: el caso del cliente." />
          </p>
          <ol className={styles.steps}>
            {b.steps.map((s, i) => (
              <li key={s.id}>
                <span className={styles.stepN}>Paso {i + 1}</span>
                <span>
                  <RichOr text={s.label} ph="Qué se hace en este paso" />
                  {s.formula.trim() && <code className={styles.formula}>{s.formula}</code>}
                  {s.result.trim() && <strong className={styles.result}> = {s.result}</strong>}
                </span>
              </li>
            ))}
          </ol>
          <p className={styles.conclusion}>
            <RichOr text={b.conclusion} ph="Conclusión del ejemplo" />
          </p>
        </section>
      );
    case 'locked':
      return (
        <p className={styles.locked}>
          <Lock size={15} aria-hidden="true" /> Bloque avanzado ({b.block.type}): se conserva tal cual y se muestra en la formación publicada.
        </p>
      );
  }
}

function TermsList({ terms }: { terms: KeyTerm[] }) {
  const ctx = useTerms();
  return (
    <dl className={styles.terms}>
      {terms.map((t) => (
        <div key={t.term}>
          <dt>{t.term}</dt>
          <dd id={ctx?.idFor(t.term)}>
            <Rich text={t.definition} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FormationPreview({ form, meta }: { form: FormationForm; meta?: PreviewMeta }) {
  const terms = form.keyTerms.filter((k) => k.term.trim()).map((k) => ({ term: k.term.trim(), definition: k.definition }));
  const outcomes = form.outcomes.filter((o) => o.text.trim());
  const sources = form.sources.filter((s) => s.label.trim());
  return (
    <TermsProvider terms={terms}>
      <article className={styles.doc} data-area={form.area}>
        <header className={styles.cover}>
          <p className={styles.coverTerm} data-area={form.area}>
            {form.coverTerm.trim() || AREAS[form.area].name}
          </p>
          <div className={styles.metaRow}>
            <AreaTag area={form.area} size="sm" />
            <span className={styles.small}>
              {formationMinutes(form)} min de lectura · versión {form.version}
            </span>
          </div>
          <h2 className={styles.fTitle}>{form.title.trim() || <Ph>Título de la formación</Ph>}</h2>
          <p className={styles.fSummary}>{form.summary.trim() || <Ph>Resumen breve para las tarjetas.</Ph>}</p>
        </header>
        <div className={`prose ${styles.prose}`}>{form.intro.trim() ? <RichParagraphs text={form.intro} /> : <p><Ph>Introducción práctica: por qué importa, con una situación real de cliente.</Ph></p>}</div>
        <section className={styles.outcomes} aria-label="Resultados de aprendizaje">
          <h3 className={styles.blockTitle}>Al terminar, sabrás…</h3>
          {outcomes.length ? (
            <ul role="list">
              {outcomes.map((o) => (
                <li key={o.id}>
                  <Check size={16} aria-hidden="true" /> <span>{o.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <Ph>Entre 2 y 3 resultados de aprendizaje.</Ph>
            </p>
          )}
        </section>
        <div className={`prose ${styles.prose} ${styles.blocks}`}>
          {form.blocks.map((b) => (
            <BlockView key={b.id} b={b} />
          ))}
        </div>
        {terms.length > 0 && (
          <section className={styles.subsection} aria-label="Términos clave">
            <h3 className={styles.blockTitle}>Términos clave</h3>
            <TermsList terms={terms} />
          </section>
        )}
        <aside className={styles.takeaway}>
          <p className={styles.takeawayLabel}>Idea clave</p>
          <p className={styles.takeawayText}>
            <RichOr text={form.takeaway} ph="La idea que debe quedar." />
          </p>
        </aside>
        {sources.length > 0 && (
          <section className={styles.subsection} aria-label="Fuentes">
            <h3 className={styles.blockTitle}>Fuentes</h3>
            <ol className={styles.sources}>
              {sources.map((s) => (
                <li key={s.id}>
                  {s.url.trim().startsWith('https://') ? (
                    <a href={s.url.trim()} target="_blank" rel="noreferrer">
                      {s.label}
                      <span className="sr-only"> (se abre en una pestaña nueva)</span>
                    </a>
                  ) : (
                    s.label
                  )}
                  {s.date && <span className={styles.small}> · {formatShortDate(s.date)}</span>}
                </li>
              ))}
            </ol>
          </section>
        )}
        {form.quiz && <p className={styles.small}>Incluye un test final de {form.quiz.questions.length} preguntas (se edita con la plantilla Test).</p>}
        <Byline meta={meta} />
      </article>
    </TermsProvider>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Test: «pruebas de imprenta»
 * ──────────────────────────────────────────────────────────────────────────── */

function TestPreview({ form }: { form: TestForm }) {
  const formations = useFormations(true);
  const drafts = useDemo((s) => s.drafts);
  const linked = formations.find((f) => f.id === form.formationId)?.title ?? (drafts[form.formationId] ? drafts[form.formationId]!.title || 'Formación en borrador' : undefined);
  const id = useId();
  return (
    <article className={styles.doc}>
      <header className={styles.testHead}>
        <p className={styles.kicker}>Test final{linked ? ` · ${linked}` : ''}</p>
        <h2 className={styles.docTitle}>{form.title.trim() || <Ph>Título del test</Ph>}</h2>
        <p className={styles.small}>3 preguntas · se aprueba con 2 de 3 · pruebas de imprenta con la corrección al margen</p>
      </header>
      <ol role="list" className={styles.questions}>
        {form.questions.map((q, i) => {
          const correctIndex = q.options.findIndex((o) => o.id === q.correctOptionId);
          return (
            <li key={q.id} className={styles.question}>
              <p className={styles.qn}>Pregunta {i + 1} de 3</p>
              <p id={`${id}-q${i}`} className={styles.prompt}>
                <RichOr text={q.prompt} ph="Enunciado de la pregunta" />
              </p>
              <ul role="list" className={styles.options}>
                {q.options.map((o, j) => {
                  const correct = o.id === q.correctOptionId;
                  return (
                    <li key={o.id} data-correct={correct || undefined}>
                      <span className={styles.letter}>{OPTION_LETTERS[j]}</span>
                      <span className={styles.optBody}>
                        <span className={styles.optText}>
                          <RichOr text={o.text} ph="Texto de la opción" />
                          {correct && (
                            <span className={styles.correctTag}>
                              <Check size={14} aria-hidden="true" /> Correcta
                            </span>
                          )}
                        </span>
                        {!correct && q.correctOptionId && (
                          <span className={styles.why}>
                            <PenLine size={13} aria-hidden="true" /> Por qué no… <RichOr text={o.feedback} ph="falta la explicación" />
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className={styles.explanation}>
                {correctIndex >= 0 ? <strong>La respuesta correcta es la {OPTION_LETTERS[correctIndex]}. </strong> : <Ph>Marca la respuesta correcta. </Ph>}
                {q.explanation.trim() && <Rich text={q.explanation} />}
              </p>
              {q.ref.trim() && <p className={styles.small}>Repasa: {q.ref}</p>}
            </li>
          );
        })}
      </ol>
    </article>
  );
}

/** Vista previa de cualquier contenido de Gestión, tal como se verá publicado. */
export function ContentPreview({ form, meta }: { form: AnyForm; meta?: PreviewMeta }) {
  switch (form.type) {
    case 'noticia':
      return <NewsPreview form={form} meta={meta} />;
    case 'documento':
      return <DocumentPreview form={form} meta={meta} />;
    case 'evento':
    case 'comunicado':
      return <EventPreview form={form} meta={meta} />;
    case 'formacion':
      return <FormationPreview form={form} meta={meta} />;
    case 'test':
      return <TestPreview form={form} />;
  }
}

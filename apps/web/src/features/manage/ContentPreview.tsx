import { animate } from 'motion/react';
import { CalendarPlus, Check, Clock3, Copy, Download, ExternalLink, FileText, Hourglass, PenLine, Target } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import {
  AREAS,
  countryCode,
  eventPhase,
  fileSize,
  formatLongDate,
  formatShortDate,
  formatWeekdayDate,
  monthShort,
  type ContentType,
  type EditorialStatus,
  type Scope,
} from '@flm/shared';
import { AreaTag, Avatar, Button, Chip, Notice, PhaseChip } from '@/design';
import { useByline, useDocuments, usePeople } from '@/data/selectors';
import { EventPhoto } from '@/features/community/EventParts';
import { AreaDot } from '@/features/learn/common/AreaMark';
import { toSections } from '@/features/learn/common/data';
import { FormationCover } from '@/features/learn/common/FormationCard';
import { BlockView, ExternalAnchor, SOURCE_KIND } from '@/features/learn/reading/Blocks';
import { Rich, RichParagraphs, TermsProvider } from '@/lib/rich';
import { useReducedMotionPref } from '@/lib/preferences';
import { bridgePath, easeOut } from '@/motion/liquid';
import { eventIcon, NEWS_KIND_ICON } from './catalog';
import {
  ASSESSMENT_TITLE,
  blockToShared,
  CATEGORY_LABEL,
  DEMO_FILE_PREFIX,
  DOC_KIND_LABEL,
  formationMinutes,
  formToEvent,
  formToFormation,
  NEWS_KIND_LABEL,
  OPTION_LETTERS,
  QUIZ_RULES,
  sessionToShared,
  splitTags,
  URGENCY_LABEL,
  type AnyForm,
  type AssessmentForm,
  type ClientForm,
  type DocumentForm,
  type EventForm,
  type FormationForm,
  type NewsForm,
  type QuizForm,
  type WelcomeForm,
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

/**
 * Firma, como en la página publicada: la persona autora o, sin autoría (perfil eliminado o contenido
 * institucional), la firma neutra «Área X de FLM» o «FLM».
 */
function Byline({ meta, type, area }: { meta?: PreviewMeta; type: ContentType; area?: Scope | null }) {
  const byline = useByline(meta?.authorId, { type, area: area ?? undefined });
  const status = meta?.status ?? 'borrador';
  const state = status === 'borrador' ? 'Borrador: aún no se ve en el campus' : meta?.reviewerName ? `Revisado por ${meta.reviewerName}` : status === 'archivado' ? 'Archivado' : 'Publicado';
  return (
    <div className={styles.byline}>
      {byline.kind === 'persona' ? (
        <Avatar name={byline.person.name} photo={byline.person.photo ? base + byline.person.photo : undefined} size={36} decorative />
      ) : (
        <span className={styles.neutralMark} aria-hidden="true">
          {byline.area ? <AreaDot area={byline.area} size={12} /> : <span className="red-dot" />}
        </span>
      )}
      <p>
        <span className={styles.bylineName}>{byline.kind === 'persona' ? byline.person.name : byline.name}</span>
        <span className={styles.bylineRole}>
          {byline.kind === 'persona' ? `${byline.person.position} · ` : ''}
          {state}
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
  const url = form.sourceUrl.trim();
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
      <h3 className={styles.headline}>{form.headline.trim() || <Ph>Titular de la novedad</Ph>}</h3>
      <p className={styles.dateline}>{form.date ? formatLongDate(form.date) : <Ph>Fecha</Ph>}</p>
      <ol className={styles.five}>
        {[
          { title: 'La novedad, en una frase', text: form.oneLiner, ph: 'Qué cambia, en una sola frase.', lead: true },
          { title: 'A quién afecta', text: form.affects, ph: 'Tipo de cliente o de persona afectada.' },
          { title: 'Qué debemos hacer', text: form.action, ph: 'La acción concreta para el equipo, con plazo si lo hay.', key: true },
          { title: 'Un ejemplo sencillo', text: form.example, ph: 'Un caso breve con cifras redondas.' },
        ].map((b, i) => (
          <li key={b.title} className={b.key ? styles.key : undefined}>
            <span className={styles.n} aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h4 className={styles.blockTitle}>{b.title}</h4>
              <p className={b.lead ? styles.lead : undefined}>
                <RichOr text={b.text} ph={b.ph} />
              </p>
            </div>
          </li>
        ))}
        <li>
          <span className={styles.n} aria-hidden="true">
            5
          </span>
          <div>
            <h4 className={styles.blockTitle}>Fuente y fecha</h4>
            <p>
              {form.sourceLabel.trim() ? (
                url.startsWith('https://') ? (
                  <a href={url} target="_blank" rel="noreferrer">
                    {form.sourceLabel.trim()}
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                ) : (
                  form.sourceLabel.trim()
                )
              ) : (
                <Ph>Norma, resolución, criterio o comunicación interna, con su enlace.</Ph>
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
          <h4 className={styles.blockTitle}>Matices</h4>
          <p>
            <Rich text={form.nuance} />
          </p>
        </aside>
      )}
      <Byline meta={meta} type="noticia" area={form.area} />
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Documento: ficha con miniatura, versión, tamaño e historial
 * ──────────────────────────────────────────────────────────────────────────── */

function DocumentPreview({ form, meta }: { form: DocumentForm; meta?: PreviewMeta }) {
  const people = usePeople();
  // Quien subió una versión: su nombre si sigue en el campus; un id de persona que ya no está no se muestra.
  const uploader = (by: string) => people.find((p) => p.id === by)?.name ?? (/^p-/.test(by) ? '' : by);
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
          <h3 className={styles.docTitle}>{form.title.trim() || <Ph>Título del documento</Ph>}</h3>
          <div className={styles.metaRow}>
            <AreaTag area={form.area} size="sm" />
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
        <h4 className={styles.blockTitle}>Historial de versiones</h4>
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
            {history.map((v, i) => {
              const by = uploader(v.uploadedBy);
              return (
                <li key={v.version}>
                  <span className={styles.vNum}>v{v.version}</span>
                  <span>
                    <strong>{i === 0 && !pending ? 'Vigente' : 'Anterior'}</strong>
                    <span className={styles.small}>
                      {' '}
                      · {formatShortDate(v.uploadedAt.slice(0, 10))}
                      {by ? ` · ${by}` : ''} · {fileSize(v.sizeKb)}
                      {v.pages ? ` · ${v.pages} págs.` : ''}
                    </span>
                    {v.note && <span className={styles.vNote}>{v.note}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
      <Byline meta={meta} type="documento" area={form.area} />
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Evento: círculos de fecha unidos por puentes, sesiones, foto, materiales y enlaces
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

const PREVIEW_META = { id: 'vista-previa', slug: 'vista-previa', editorial: { status: 'borrador' as const, review: { state: 'pendiente' as const } }, uploadedBy: '', today: '2026-01-01' };

function EventPreview({ form, meta }: { form: EventForm; meta?: PreviewMeta }) {
  const { Icon, label: iconLabel } = eventIcon(form.icon);
  const documents = useDocuments();
  const built = useMemo(() => {
    try {
      return formToEvent({ ...form, sessions: form.sessions.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.startDate)) }, PREVIEW_META);
    } catch {
      return null;
    }
  }, [form]);
  const phase = built ? eventPhase(built) : 'proximo';
  const sessions = form.pendingDate ? [] : form.sessions.filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s.startDate));
  const days = [...new Set(sessions.map((s) => s.startDate))].sort();
  const materials = form.materials.filter((m) => m.documentId || m.label.trim());
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
          <h3 className={styles.docTitle}>{form.title.trim() || <Ph>Título del {TYPE_META[form.type].lower}</Ph>}</h3>
          <div className={styles.metaRow}>
            <PhaseChip phase={phase} pending={form.pendingDate || sessions.length === 0} size="sm" />
            {form.manualPhase && <Chip size="sm">Reclasificado a mano</Chip>}
          </div>
        </div>
      </div>
      {form.image?.src && <EventPhoto image={{ src: form.image.src, alt: form.image.alt, ...(form.image.credit.trim() ? { credit: form.image.credit } : {}) }} className={styles.photo} frameClassName={styles.photoFrame} sizes="(min-width: 1100px) 28rem, 92vw" />}
      <DateChain days={days} pending={form.pendingDate} />
      <p className={styles.summaryText}>{form.summary.trim() || <Ph>Descripción breve: qué es y para quién.</Ph>}</p>
      {form.body.trim() && (
        <div className={`prose ${styles.prose}`}>
          <RichParagraphs text={form.body} />
        </div>
      )}
      {!form.pendingDate && sessions.length > 0 && (
        <section className={styles.subsection} aria-label={sessions.length === 1 ? 'Sesión' : 'Sesiones'}>
          <h4 className={styles.blockTitle}>{sessions.length === 1 ? 'Sesión' : `${sessions.length} sesiones`}</h4>
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
      {materials.length > 0 && (
        <section className={styles.subsection} aria-label="Materiales">
          <h4 className={styles.blockTitle}>Materiales</h4>
          <ul role="list" className={styles.links}>
            {materials.map((m) => {
              const doc = documents.find((d) => d.id === m.documentId);
              return (
                <li key={m.id} className={styles.fakeLink}>
                  <FileText size={16} aria-hidden="true" /> {m.label.trim() || doc?.title || <Ph>Material sin nombre</Ph>}
                  {doc && <span className={styles.small}> · {DOC_KIND_LABEL[doc.kind]}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
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
      {form.recap.trim() && (
        <aside className={styles.nuance}>
          <h4 className={styles.blockTitle}>Cómo fue</h4>
          <RichParagraphs text={form.recap} />
        </aside>
      )}
      <Byline meta={meta} type={form.type} />
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Cuestionarios: «pruebas de imprenta» con la corrección al margen
 * ──────────────────────────────────────────────────────────────────────────── */

function QuizProof({ quiz, total }: { quiz: QuizForm; total: number }) {
  const id = useId();
  return (
    <ol role="list" className={styles.questions}>
      {quiz.questions.map((q, i) => {
        const correctIndex = q.options.findIndex((o) => o.id === q.correctOptionId);
        return (
          <li key={q.id} className={styles.question}>
            <p className={styles.qn}>
              Pregunta {i + 1} de {total}
            </p>
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
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Formación: portada, apartados con los bloques reales, idea clave, fuentes y test
 * ──────────────────────────────────────────────────────────────────────────── */

function FormationPreview({ form, meta }: { form: FormationForm; meta?: PreviewMeta }) {
  const documents = useDocuments();
  const terms = useMemo(() => form.keyTerms.filter((k) => k.term.trim()).map((k) => ({ term: k.term.trim(), definition: k.definition })), [form.keyTerms]);
  const blocks = useMemo(() => form.blocks.map(blockToShared), [form.blocks]);
  const sections = useMemo(() => toSections(blocks), [blocks]);
  const cover = useMemo(() => formToFormation(form, { ...PREVIEW_META, editorial: { ...PREVIEW_META.editorial } }), [form]);
  const outcomes = form.outcomes.filter((o) => o.text.trim());
  const sources = form.sources.filter((s) => s.label.trim());
  const docs = form.documentIds.map((docId) => documents.find((d) => d.id === docId)).filter((d): d is NonNullable<typeof d> => !!d);
  const area = AREAS[form.area];
  return (
    <TermsProvider terms={terms}>
      <article className={styles.doc} data-area={form.area}>
        <header className={styles.fHeader}>
          <FormationCover formation={cover} className={styles.fCover} />
          <div className={styles.metaRow}>
            <AreaTag area={form.area} size="sm" />
            {meta?.status !== 'borrador' && !meta?.reviewerName && (
              <Chip size="sm" tone="neutral" icon={<Hourglass size={14} />}>
                Pendiente de revisión por el área
              </Chip>
            )}
          </div>
          <h3 className={styles.fTitle}>{form.title.trim() || <Ph>Título de la formación</Ph>}</h3>
          <div className={`prose ${styles.prose}`}>{form.intro.trim() ? <RichParagraphs text={form.intro} /> : <p><Ph>Introducción práctica: por qué importa, con una situación real de cliente.</Ph></p>}</div>
          <p className={styles.facts}>
            <Clock3 size={15} aria-hidden="true" /> {formationMinutes(form)} min de lectura · versión {form.version + (form.majorChange ? 1 : 0)}
          </p>
          <p className={styles.small}>Tarjeta: {form.summary.trim() || <Ph>resumen breve para las tarjetas</Ph>}</p>
        </header>
        <section className={styles.outcomes} aria-label="Resultados de aprendizaje">
          <h4 className={`${styles.blockTitle} ${styles.withIcon}`}>
            <Target size={14} aria-hidden="true" /> Al terminar sabrás…
          </h4>
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
        {terms.length > 0 && (
          <p className={styles.small}>
            Términos clave: {terms.map((t) => t.term).join(' · ')}
          </p>
        )}
        <div className={`prose ${styles.prose} ${styles.flow}`}>
          {sections.length === 0 && (
            <p>
              <Ph>Añade apartados y bloques en «Contenido».</Ph>
            </p>
          )}
          {sections.map((s) => (
            <section key={s.id} className={styles.fSection} aria-label={s.title ? `Apartado ${s.number}: ${s.title}` : 'Introducción'}>
              {s.title && (
                <h4 className={styles.fHeading}>
                  <span className={styles.fNum}>Apartado {s.number}</span>
                  <span className="sr-only">. </span>
                  {s.title}
                </h4>
              )}
              {s.blocks.map((b, i) => (
                <BlockView key={b.type === 'widget' ? `${i}-${JSON.stringify(b.widget)}` : i} block={b} />
              ))}
            </section>
          ))}
        </div>
        <aside className={styles.takeaway}>
          <p className={styles.takeawayLabel}>Idea clave</p>
          <p className={styles.takeawayText}>
            <RichOr text={form.takeaway} ph="La idea que debe quedar." />
            {form.takeaway.trim() && <span className="red-dot" aria-hidden="true" />}
          </p>
        </aside>
        <section className={styles.subsection} aria-label="Fuentes y documentos">
          <h4 className={styles.blockTitle}>Fuentes y documentos</h4>
          {sources.length ? (
            <ol role="list" className={styles.sourceList}>
              {sources.map((s) => (
                <li key={s.id}>
                  <span className={styles.sourceKind}>{SOURCE_KIND[s.kind || 'web']}</span>
                  {s.url.trim().startsWith('https://') ? <ExternalAnchor href={s.url.trim()}>{s.label}</ExternalAnchor> : s.label}
                  {s.date && <span className={styles.small}> · Consultada el {formatShortDate(s.date)}</span>}
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.small}>
              <Ph>Normas, resoluciones o criterios con su enlace oficial.</Ph>
            </p>
          )}
          {form.verifiedAt && <p className={styles.small}>Normativa comprobada a {formatLongDate(form.verifiedAt)}.</p>}
          {docs.length > 0 && (
            <ul role="list" className={styles.links}>
              {docs.map((d) => (
                <li key={d.id} className={styles.fakeLink}>
                  <FileText size={16} aria-hidden="true" /> {d.title} <span className={styles.small}>· {d.issuer}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <Byline meta={meta} type="formacion" area={form.area} />
        <section className={styles.subsection} aria-label="Test final">
          <h4 className={styles.blockTitle}>
            Test final · {form.quiz.questions.length} preguntas · se supera con {QUIZ_RULES.formacion.passMark}
          </h4>
          <p className={styles.small}>Así lo verá quien corrija: cada opción incorrecta con su «por qué no» al margen. Área {area.name}.</p>
          <QuizProof quiz={form.quiz} total={form.quiz.questions.length} />
        </section>
      </article>
    </TermsProvider>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Evaluación del área
 * ──────────────────────────────────────────────────────────────────────────── */

function AssessmentPreview({ form }: { form: AssessmentForm }) {
  return (
    <article className={styles.doc} data-area={form.area}>
      <header className={styles.testHead}>
        <div className={styles.metaRow}>
          <AreaTag area={form.area} size="sm" />
        </div>
        <h3 className={styles.docTitle}>{ASSESSMENT_TITLE}</h3>
        <p className={styles.summaryText}>{form.intro.trim() || <Ph>Introducción de la evaluación.</Ph>}</p>
        <p className={styles.small}>
          {QUIZ_RULES.test.count} preguntas · se supera con {QUIZ_RULES.test.passMark} · voluntaria y repetible
        </p>
      </header>
      <QuizProof quiz={form.quiz} total={QUIZ_RULES.test.count} />
      <Byline type="test" area={form.area} meta={{ status: 'publicado' }} />
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * «Ponte al día» (Inicio): nuevo cliente y bienvenida
 * ──────────────────────────────────────────────────────────────────────────── */

function ClientPreview({ form, meta }: { form: ClientForm; meta?: PreviewMeta }) {
  const code = countryCode(form.country);
  return (
    <article className={styles.doc}>
      <p className={styles.kicker}>Inicio · Ponte al día · Nuevos clientes</p>
      <div className={styles.board}>
        <div className={styles.boardRow}>
          <span className={styles.country} aria-hidden="true">
            {code ?? '··'}
          </span>
          <div className={styles.boardText}>
            <p className={styles.boardName}>{form.name.trim() || <Ph>Nombre de la empresa</Ph>}</p>
            <p className={styles.small}>
              {form.sector.trim() || <Ph>Sector</Ph>} · {form.country || <Ph>País de origen</Ph>}
            </p>
            {form.summary.trim() && <p className={styles.boardSummary}>{form.summary}</p>}
            <div className={styles.metaRow}>
              <AreaTag area={form.area} size="sm" />
              {form.fictional && <Chip size="sm">Ejemplo ficticio</Chip>}
              {form.date && <span className={styles.small}>Anunciado el {formatShortDate(form.date)}</span>}
            </div>
          </div>
        </div>
      </div>
      <p className={styles.small}>Solo para uso interno: sin importes, honorarios ni datos confidenciales.</p>
      <Byline meta={meta} type="cliente" area={form.area} />
    </article>
  );
}

function WelcomePreview({ form, meta }: { form: WelcomeForm; meta?: PreviewMeta }) {
  const people = usePeople();
  const person = people.find((p) => p.id === form.personId);
  return (
    <article className={styles.doc}>
      <p className={styles.kicker}>Inicio · Ponte al día · Nuevas incorporaciones</p>
      <div className={styles.board}>
        <div className={styles.boardRow}>
          {person ? <Avatar name={person.name} photo={person.photo ? base + person.photo : undefined} size={44} decorative /> : <span className={styles.country} aria-hidden="true">?</span>}
          <div className={styles.boardText}>
            <p className={styles.boardName}>{person ? `Damos la bienvenida a ${person.name}` : <Ph>Elige a la persona que se suma</Ph>}</p>
            {person && (
              <p className={styles.small}>
                {person.position} · {person.department} · {person.office}
              </p>
            )}
            <p className={styles.boardSummary}>{form.message.trim() || <Ph>Mensaje de bienvenida, en una o dos frases.</Ph>}</p>
          </div>
        </div>
      </div>
      <p className={styles.small}>El anuncio solo lleva su fecha de publicación: la ficha de la persona no guarda la de incorporación.</p>
      <Byline meta={meta} type="bienvenida" />
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
      return <AssessmentPreview form={form} />;
    case 'cliente':
      return <ClientPreview form={form} meta={meta} />;
    case 'bienvenida':
      return <WelcomePreview form={form} meta={meta} />;
  }
}

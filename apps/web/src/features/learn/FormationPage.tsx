import { motion } from 'motion/react';
import { ArrowRight, BookOpen, ChevronDown, ChevronRight, Clock3, FileText, Hourglass, ListTree, NotebookText, Target } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import {
  AREAS,
  fileSize,
  formatLongDate,
  formatShortDate,
  formationStatus,
  isAreaId,
  madridDateKey,
  nextStepHint,
  normalize,
  type Formation,
  type KeyTerm,
} from '@flm/shared';
import { ActionButton, AreaTag, Avatar, ButtonLink, Chip, Dialog, EmptyState, Notice, StatusGlyph, toast, type ActionStatus } from '@/design';
import { useDocuments } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { Rich, RichParagraphs, TermsProvider } from '@/lib/rich';
import { Escalon } from '@/motion/Escalon';
import { editorialDates, formationPath, photoOf, toSections, useLearnFormation, usePerson, type ReadingSection } from './common/data';
import { useMediaQuery } from './common/util';
import { Blocks, ExternalAnchor, SOURCE_KIND } from './reading/Blocks';
import { KeyTermsInline, KeyTermsMargin, ReadingRule, Toc, useActiveSection, type TocItem } from './reading/ReadingAids';
import styles from './FormationPage.module.css';

const EMPTY = new Set<string>();
const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Cabecera ────────────────────────────────────────────────────────── */

function Header({ f, isSample, titleId }: { f: Formation; isSample: boolean; titleId: string }) {
  const author = usePerson(f.editorial.authorId);
  const progress = useDemo((s) => s.progress[f.id]);
  const status = formationStatus(progress, f);
  const dates = editorialDates(f);
  const area = AREAS[f.area];
  const item = (i: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.42, ease: EASE, delay: 0.04 + i * 0.05 } });
  return (
    <header className={styles.header}>
      <motion.nav aria-label="Estás en" className={styles.crumbs} {...item(0)}>
        <ol role="list">
          <li>
            <Link to="/aprender">Aprender</Link>
            <ChevronRight size={14} aria-hidden="true" />
          </li>
          <li>
            <Link to={`/aprender/${f.area}`}>Área {area.name}</Link>
            <ChevronRight size={14} aria-hidden="true" />
          </li>
          <li>
            <span aria-current="page" className={styles.crumbCurrent}>
              {f.title}
            </span>
          </li>
        </ol>
      </motion.nav>
      <motion.div className={styles.kicker} {...item(1)}>
        <AreaTag area={f.area} />
        {f.editorial.review.state === 'pendiente' && (
          <Chip tone="warning" icon={<Hourglass size={14} />}>
            Pendiente de revisión por el área
          </Chip>
        )}
        {isSample && <Chip tone="info">Muestra de desarrollo</Chip>}
      </motion.div>
      <motion.h1 id={titleId} className={styles.title} {...item(2)}>
        {f.title}
      </motion.h1>
      <motion.div className={styles.intro} {...item(3)}>
        <RichParagraphs text={f.intro} />
      </motion.div>
      <motion.div className={styles.byline} {...item(4)}>
        <div className={styles.author}>
          {author ? (
            <>
              <Avatar name={author.name} photo={photoOf(author)} size={44} decorative />
              <span>
                <span className={styles.authorName}>{author.name}</span>
                <span className={styles.authorRole}>{author.position}</span>
              </span>
            </>
          ) : (
            <span>
              <span className={styles.authorName}>Área {area.name} de FLM</span>
            </span>
          )}
        </div>
        <ul role="list" className={styles.facts}>
          {dates.map((d) => (
            <li key={d}>{d}</li>
          ))}
          <li>
            <Clock3 size={15} aria-hidden="true" />
            {f.readingMinutes} min de lectura
          </li>
          <li>
            <StatusGlyph status={status} size={18} />
          </li>
        </ul>
      </motion.div>
    </header>
  );
}

/* ── «Al terminar sabrás…» ───────────────────────────────────────────── */

function Outcomes({ f, done }: { f: Formation; done: boolean }) {
  const id = useId();
  return (
    <section className={styles.outcomes} aria-labelledby={id}>
      <h2 id={id} className={styles.outcomesTitle}>
        <Target size={18} aria-hidden="true" /> Al terminar sabrás…
      </h2>
      <ul role="list" className={styles.outcomeList} data-done={done || undefined}>
        {f.outcomes.map((o, i) => (
          <li key={i}>
            <span className={styles.outcomeMark} aria-hidden="true" />
            <span>{o}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Apartados ───────────────────────────────────────────────────────── */

function SectionView({ s }: { s: ReadingSection }) {
  return (
    <section id={s.id} className={styles.section} aria-labelledby={s.title ? `${s.id}-t` : undefined}>
      {s.title && (
        <h2 id={`${s.id}-t`} className={styles.h2} tabIndex={-1} data-focus-target>
          <span className={styles.h2Num}>Apartado {s.number}</span>
          <span className={styles.h2Text}>{s.title}</span>
        </h2>
      )}
      <div className={styles.flow}>
        <Blocks blocks={s.blocks} />
      </div>
    </section>
  );
}

function Takeaway({ text }: { text: string }) {
  const clean = text.trim().replace(/[.。]\s*$/, '');
  return (
    <section id="idea-clave" className={styles.takeaway} aria-labelledby="idea-clave-t">
      <h2 id="idea-clave-t" className={styles.takeawayKicker} tabIndex={-1} data-focus-target>
        Idea clave
      </h2>
      <p className={styles.takeawayText}>
        <Rich text={clean} />
        <motion.span
          className={styles.redDot}
          aria-hidden="true"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22, delay: 0.15 }}
        />
        <span className="sr-only">.</span>
      </p>
    </section>
  );
}

function Sources({ f }: { f: Formation }) {
  const all = useDocuments();
  const ids = f.documentIds ?? [];
  const docs = ids.map((id) => ({ id, doc: all.find((d) => d.id === id) }));
  return (
    <section id="fuentes" className={styles.sources} aria-labelledby="fuentes-t">
      <h2 id="fuentes-t" className={styles.h2Small} tabIndex={-1} data-focus-target>
        Fuentes y documentos
      </h2>
      <ol role="list" className={styles.sourceList}>
        {f.sources.map((s) => (
          <li key={s.url + s.label}>
            <span className={styles.sourceKind}>{SOURCE_KIND[s.kind ?? 'web']}</span>
            <ExternalAnchor href={s.url} className={styles.sourceLink}>
              {s.label}
            </ExternalAnchor>
            {s.date && <span className={styles.sourceDate}>Consultada el {formatShortDate(s.date)}</span>}
          </li>
        ))}
      </ol>
      <p className={styles.verified}>Normativa comprobada a {formatLongDate(f.verifiedAt)}.</p>
      {docs.length > 0 && (
        <>
          <h3 className={styles.docsTitle}>Documentos originales</h3>
          <ul role="list" className={styles.docs}>
            {docs.map(({ id, doc }) =>
              doc ? (
                <li key={id} className={styles.doc}>
                  <FileText size={18} aria-hidden="true" className={styles.docIcon} />
                  <span className={styles.docText}>
                    <span className={styles.docKind}>{doc.issuer}</span>
                    <Link to={`/consultar/notas/${doc.id}`} className={styles.stretch}>
                      {doc.title}
                    </Link>
                    <span className={styles.docMeta}>
                      {formatShortDate(doc.date)}
                      {doc.versions[0] ? ` · PDF${doc.versions[0].pages ? ` · ${doc.versions[0].pages} págs.` : ''} · ${fileSize(doc.versions[0].sizeKb)}` : ''}
                    </span>
                  </span>
                </li>
              ) : (
                <li key={id} className={styles.doc} data-missing="true">
                  <FileText size={18} aria-hidden="true" className={styles.docIcon} />
                  <span className={styles.docText}>
                    <span className={styles.docMissing}>{MESSAGES.missingDocument.title}</span>
                    <span className={styles.docMeta}>{MESSAGES.missingDocument.body}</span>
                  </span>
                </li>
              ),
            )}
          </ul>
        </>
      )}
    </section>
  );
}

/* ── Terminar: confirmar la lectura y pasar al test ──────────────────── */

function Finish({ f }: { f: Formation }) {
  const progress = useDemo((s) => s.progress[f.id]);
  const confirmRead = useDemo((s) => s.confirmRead);
  const status = formationStatus(progress, f);
  const readCurrent = !!progress?.readAt && progress.readVersion === f.version;
  const readOld = !!progress?.readAt && progress.readVersion !== f.version;
  const [st, setSt] = useState<ActionStatus>('idle');
  const [celebrate, setCelebrate] = useState(false);
  const [announce, setAnnounce] = useState('');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onConfirm = () => {
    if (st === 'pending') return;
    const willComplete = status === 'test-superado';
    setSt('pending');
    timer.current = window.setTimeout(() => {
      confirmRead(f.id, f.version);
      setSt('success');
      setCelebrate(willComplete);
      setAnnounce(willComplete ? 'Formación completada.' : 'Lectura confirmada. Ya puedes hacer el test final.');
      toast.success(willComplete ? 'Formación completada' : 'Lectura confirmada', __DEMO__ ? MESSAGES.demoSimulated : undefined);
    }, 420);
  };

  const readDay = progress?.readAt ? madridDateKey(new Date(progress.readAt)) : undefined;
  return (
    <section id="terminar" className={styles.finish} aria-labelledby="terminar-t">
      <h2 id="terminar-t" className={styles.finishTitle} tabIndex={-1} data-focus-target>
        Terminar la formación
      </h2>
      {readOld && (
        <Notice tone="warning" title="La formación se ha actualizado">
          Confirmaste una versión anterior. Revisa los cambios y vuelve a confirmar la lectura para mantenerla completada.
        </Notice>
      )}
      <p className={styles.finishText}>
        {readCurrent && readDay
          ? `Confirmaste la lectura el ${formatLongDate(readDay)}. ${nextStepHint(progress, f)}`
          : 'Cuando hayas llegado hasta aquí, confirma la lectura. Después, haz el test final: tres preguntas; se supera con dos aciertos.'}
      </p>
      <div className={styles.finishRow}>
        <ActionButton
          status={readCurrent ? 'success' : st}
          label="Marcar la lectura como terminada"
          pendingLabel="Confirmando…"
          successLabel="Lectura confirmada"
          icon={<BookOpen />}
          variant={readCurrent ? 'secondary' : 'primary'}
          disabled={readCurrent}
          onClick={onConfirm}
        />
        <ButtonLink to={`${formationPath(f)}/test`} variant={readCurrent && status !== 'completada' ? 'primary' : 'secondary'} iconRight={<ArrowRight />}>
          {status === 'completada' ? 'Repetir el test' : 'Hacer el test'}
        </ButtonLink>
      </div>
      <div className={styles.finishStatus}>
        <StatusGlyph status={status} />
      </div>
      {celebrate && (
        <div className={styles.celebrate}>
          <Escalon read passed play />
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  );
}

/* ── Lector ──────────────────────────────────────────────────────────── */

function Reader({ f, isSample }: { f: Formation; isSample: boolean }) {
  const reduce = useReducedMotionPref();
  const wide = useMediaQuery('(min-width: 1200px)');
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const titleId = useId();
  const tocTitle = useId();
  const termsTitle = useId();
  const articleRef = useRef<HTMLElement>(null);
  const sections = useMemo(() => toSections(f.blocks), [f.blocks]);
  const status = useDemo((s) => formationStatus(s.progress[f.id], f));

  const tocItems: TocItem[] = useMemo(
    () => [
      ...sections.filter((s) => s.title).map((s) => ({ id: s.id, label: s.title ?? '', number: s.number })),
      { id: 'idea-clave', label: 'Idea clave' },
      { id: 'fuentes', label: 'Fuentes y documentos' },
      { id: 'terminar', label: 'Terminar la formación' },
    ],
    [sections],
  );
  const observed = useMemo(() => [...sections.map((s) => s.id), 'idea-clave', 'fuentes', 'terminar'], [sections]);
  const active = useActiveSection(observed);
  const current = sections.find((s) => s.id === active)?.terms ?? EMPTY;

  const [flash, setFlash] = useState<string | null>(null);
  const [sheet, setSheet] = useState<KeyTerm | null>(null);
  const onTerm = useCallback(
    (t: KeyTerm) => {
      if (!wide) {
        setSheet(t);
        return;
      }
      const k = normalize(t.term);
      setFlash(null);
      window.requestAnimationFrame(() => setFlash(k));
      document.querySelector(`[data-term="${CSS.escape(k)}"]`)?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    },
    [wide, reduce],
  );

  const goTo = useCallback(
    (id: string, smooth = true) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
      (el.querySelector<HTMLElement>('[data-focus-target]') ?? el).focus({ preventScroll: true });
    },
    [reduce],
  );

  // Enlace directo a un apartado (?apartado=id), p. ej. desde «Repasa» en el test.
  const target = params.get('apartado');
  useEffect(() => {
    if (!target) return;
    const t = window.setTimeout(() => goTo(target, false), 160);
    return () => window.clearTimeout(t);
  }, [target, goTo]);

  const hrefFor = (id: string) => `#${pathname}?apartado=${encodeURIComponent(id)}`;
  const numbered = tocItems.filter((t) => t.number !== undefined).length;

  // El cuerpo no depende del apartado activo: se memoriza para no volver a pintar cada bloque al leer.
  const body = useMemo(
    () => (
      <>
        {sections.map((s) => (
          <SectionView key={s.id} s={s} />
        ))}
        <Takeaway text={f.takeaway} />
        <Sources f={f} />
        <Finish f={f} />
      </>
    ),
    [sections, f],
  );

  return (
    <div className={styles.page} data-area={f.area}>
      <ReadingRule target={articleRef} minutes={f.readingMinutes} />
      <TermsProvider terms={f.keyTerms} onTerm={onTerm}>
        <div className={`container ${styles.wrap}`}>
          <div className={styles.layout}>
            <div className={styles.headerArea}>
              <Header f={f} isSample={isSample} titleId={titleId} />
            </div>

            {wide ? (
              <nav className={styles.tocCol} aria-labelledby={tocTitle}>
                <h2 id={tocTitle} className={styles.colTitle}>
                  En esta formación
                </h2>
                <Toc items={tocItems} active={active} onGo={goTo} hrefFor={hrefFor} layoutKey={`toc-${f.id}`} />
              </nav>
            ) : (
              <details className={styles.disclosure} data-slot="toc">
                <summary>
                  <ListTree size={18} aria-hidden="true" />
                  <span>
                    En esta formación <span className={styles.summaryMeta}>· {numbered} apartados</span>
                  </span>
                  <ChevronDown size={18} aria-hidden="true" className={styles.chev} />
                </summary>
                <nav aria-label="En esta formación" className={styles.disclosureBody}>
                  <Toc items={tocItems} active={active} onGo={goTo} hrefFor={hrefFor} layoutKey={`toc-m-${f.id}`} />
                </nav>
              </details>
            )}

            <div className={styles.outcomesArea}>
              <Outcomes f={f} done={status === 'completada'} />
            </div>

            {wide ? (
              <aside className={styles.termsCol} aria-labelledby={termsTitle} tabIndex={0}>
                <h2 id={termsTitle} className={styles.colTitle}>
                  Términos clave
                </h2>
                <KeyTermsMargin terms={f.keyTerms} current={current} flash={flash} />
              </aside>
            ) : (
              <details className={styles.disclosure} data-slot="terms">
                <summary>
                  <NotebookText size={18} aria-hidden="true" />
                  <span>
                    Términos clave <span className={styles.summaryMeta}>· {f.keyTerms.length}</span>
                  </span>
                  <ChevronDown size={18} aria-hidden="true" className={styles.chev} />
                </summary>
                <div className={styles.disclosureBody}>
                  <KeyTermsInline terms={f.keyTerms} />
                </div>
              </details>
            )}

            <article ref={articleRef} className={`prose ${styles.article}`} aria-labelledby={titleId}>
              {body}
            </article>
          </div>
        </div>
      </TermsProvider>

      <Dialog open={!!sheet} onClose={() => setSheet(null)} title={sheet?.term ?? 'Término clave'} description="Término clave de esta formación" variant="center" size="sm">
        {sheet && (
          <div className={styles.sheetDef}>
            <RichParagraphs text={sheet.definition} />
          </div>
        )}
      </Dialog>
    </div>
  );
}

function NotFoundFormation({ area }: { area: string | undefined }) {
  const valid = isAreaId(area) ? area : undefined;
  return (
    <div className="container page">
      <EmptyState
        icon={<BookOpen />}
        title={MESSAGES.notFound.title}
        action={
          <>
            {valid && (
              <ButtonLink to={`/aprender/${valid}`} variant="primary">
                Ver las formaciones de {AREAS[valid].name}
              </ButtonLink>
            )}
            <ButtonLink to="/aprender" variant={valid ? 'secondary' : 'primary'}>
              Ir a Aprender
            </ButtonLink>
          </>
        }
      >
        {MESSAGES.notFound.body}
      </EmptyState>
    </div>
  );
}

export default function FormationPage() {
  const { area, slug } = useParams();
  const { formation, isSample } = useLearnFormation(area, slug);
  usePageTitle(formation ? formation.title : 'Formación no encontrada');
  if (!formation) return <NotFoundFormation area={area} />;
  return <Reader key={formation.id} f={formation} isSample={isSample} />;
}

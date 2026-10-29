import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useId, useMemo, useRef, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { AREA_LIST, AREAS, formationStatus, isAreaId, type AreaId, type FormationStatus } from '@flm/shared';
import { Avatar, ButtonLink, EmptyState, PageHeader, PhotoCapsule, ProgressRing, StatusGlyph } from '@/design';
import { useAssessments, useFormations } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { usePageTitle } from '@/lib/preferences';
import { AreaDot } from './common/AreaMark';
import { AREA_REFERENCE, areaCounts, bestOf, photoOf, useMyArea, usePerson, useProgressMap } from './common/data';
import { FormationRow } from './common/FormationCard';
import { NextStepPanel } from './common/NextStepPanel';
import { TenDots } from './common/TenDots';
import styles from './LearnHub.module.css';

const STATES: { status: FormationStatus; title: string; text: string }[] = [
  { status: 'leida', title: 'Formación leída', text: 'Has llegado al final y has pulsado «Marcar la lectura como terminada». Nunca se marca solo por desplazarte.' },
  { status: 'test-intentado', title: 'Test intentado', text: 'Has hecho el test final al menos una vez, sin llegar todavía a dos aciertos de tres.' },
  { status: 'test-superado', title: 'Test superado', text: 'Has acertado al menos dos de las tres preguntas del test final.' },
  { status: 'completada', title: 'Completada', text: 'Lectura confirmada y test superado en la versión vigente. Si la formación se actualiza, vuelve a confirmar la lectura.' },
];

/* ── Selector de áreas ───────────────────────────────────────────────── */

function AreaSwitch({ value, onChange, idBase }: { value: AreaId; onChange: (a: AreaId) => void; idBase: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const formations = useFormations();
  const progress = useProgressMap();
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = AREA_LIST.length;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      refs.current[next]?.focus();
      onChange(AREA_LIST[next]!.id);
    }
  };
  return (
    <div role="tablist" aria-label="Áreas" className={styles.switch}>
      {AREA_LIST.map((a, i) => {
        const selected = a.id === value;
        const { completed, total } = areaCounts(
          formations.filter((f) => f.area === a.id),
          progress,
        );
        return (
          <button
            key={a.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${a.id}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel`}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(a.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {selected && <motion.span layoutId={`${idBase}-pill`} className={styles.pill} transition={{ type: 'spring', stiffness: 460, damping: 36 }} />}
            <span className={styles.tabInner}>
              <AreaDot area={a.id} size={10} ring={selected} />
              {a.name}
              {total > 0 && (
                <>
                  <span className={styles.tabCount} aria-hidden="true">
                    {completed}/{total}
                  </span>
                  <span className="sr-only">
                    , {completed} de {total} completadas
                  </span>
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AreaPanel({ area }: { area: AreaId }) {
  const formations = useFormations();
  const progress = useProgressMap();
  const ref = usePerson(AREA_REFERENCE[area]);
  const list = useMemo(() => formations.filter((f) => f.area === area), [formations, area]);
  const { completed, total } = areaCounts(list, progress);
  const info = AREAS[area];
  return (
    <div className={styles.panelGrid}>
      <div className={styles.summary}>
        <div className={styles.summaryTop}>
          <ProgressRing value={completed} total={total} size={112} stroke={7} label={`Formaciones completadas en ${info.name}`} tone="area">
            <span className={styles.ringNum}>
              {total > 0 ? (
                <>
                  {completed}
                  <span>/{total}</span>
                </>
              ) : (
                '—'
              )}
            </span>
          </ProgressRing>
          <div className={styles.summaryText}>
            <h3 className={styles.areaName}>Área {info.name}</h3>
            <p className={styles.areaCount}>{total > 0 ? `${completed} de ${total} formaciones completadas` : 'Formaciones en preparación'}</p>
          </div>
        </div>
        <p className={styles.areaDesc}>{info.description}</p>
        {ref && (
          <p className={styles.refPerson}>
            <Avatar name={ref.name} photo={photoOf(ref)} size={36} decorative />
            <span>
              <span className={styles.refLabel}>Persona de referencia</span>
              <span className={styles.refName}>
                {ref.name} · {ref.position}
              </span>
            </span>
          </p>
        )}
        <ButtonLink to={`/aprender/${area}`} variant="secondary" iconRight={<ArrowRight />}>
          Ir al área {info.name}
        </ButtonLink>
      </div>
      <div className={styles.listCol}>
        {list.length > 0 ? (
          <ol role="list" className={styles.rows} aria-label={`Formaciones de ${info.name}`}>
            {list.map((f) => (
              <FormationRow key={f.id} formation={f} status={formationStatus(progress[f.id], f)} />
            ))}
          </ol>
        ) : (
          <EmptyState icon={<BookOpen />} title="Formaciones en preparación">
            El área {info.name} está redactando sus formaciones. Aparecerán aquí en cuanto se publiquen.
          </EmptyState>
        )}
      </div>
    </div>
  );
}

function Itineraries() {
  const myArea = useMyArea();
  const [params, setParams] = useSearchParams();
  const raw = params.get('area');
  const area: AreaId = isAreaId(raw) ? raw : myArea;
  const idBase = useId().replace(/:/g, '');
  const select = (a: AreaId) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        next.set('area', a);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  return (
    <section className={styles.block} aria-labelledby="h-itinerarios">
      <div className={styles.head}>
        <h2 id="h-itinerarios" className="section-title">
          Itinerarios por área
        </h2>
        <p className={styles.headNote}>Cada formación termina con un test de tres preguntas.</p>
      </div>
      <AreaSwitch value={area} onChange={select} idBase={idBase} />
      <div role="tabpanel" id={`${idBase}-panel`} aria-labelledby={`${idBase}-tab-${area}`} tabIndex={0} className={styles.panel} data-area={area}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={area} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}>
            <AreaPanel area={area} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ── Evaluaciones ─────────────────────────────────────────────────────── */

function Assessments() {
  const attemptsMap = useDemo((s) => s.assessmentAttempts);
  const assessments = useAssessments();
  return (
    <section className={styles.block} aria-labelledby="h-evaluaciones">
      <div className={styles.head}>
        <h2 id="h-evaluaciones" className="section-title">
          Pon a prueba tus conocimientos
        </h2>
        <p className={styles.headNote}>Diez preguntas por área. Se supera con ocho aciertos.</p>
      </div>
      <ul role="list" className={styles.assessGrid}>
        {AREA_LIST.map((a) => {
          const assessment = assessments.find((x) => x.area === a.id);
          const attempts = assessment ? attemptsMap[assessment.id] : undefined;
          const best = bestOf(attempts);
          const passed = !!attempts?.some((x) => x.passed);
          const total = assessment?.quiz.questions.length ?? 10;
          const status = !assessment ? 'En preparación' : !best ? `${total} preguntas · se supera con ${assessment.quiz.passMark}` : passed ? `Superada · mejor resultado ${best.correct}/${best.total}` : `Aún no · mejor resultado ${best.correct}/${best.total}`;
          return (
            <li key={a.id} className={styles.assess} data-area={a.id} data-ready={!!assessment || undefined} data-cta-host>
              <span className={styles.assessArea}>
                <AreaDot area={a.id} /> {a.name}
              </span>
              <h3 className={styles.assessTitle}>
                {assessment ? (
                  <Link to={`/aprender/${a.id}/evaluacion`} className={styles.stretch}>
                    Evaluación de {a.name}
                  </Link>
                ) : (
                  <>Evaluación de {a.name}</>
                )}
              </h3>
              <TenDots total={total} filled={best?.correct ?? 0} pending={!assessment} />
              <p className={styles.assessStatus}>{status}</p>
              {assessment && (
                <span className={`cta-pill ${styles.assessGo}`} aria-hidden="true">
                  {best ? 'Volver a intentarlo' : 'Empezar'} <ArrowRight size={16} />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Estados ──────────────────────────────────────────────────────────── */

function States() {
  return (
    <section className={styles.block} aria-labelledby="h-estados">
      <div className={styles.head}>
        <h2 id="h-estados" className="section-title">
          Cómo se mide tu avance
        </h2>
        <p className={styles.headNote}>Cada formación empieza «Sin empezar» y avanza así.</p>
      </div>
      <ol role="list" className={styles.states}>
        {STATES.map((s) => (
          <li key={s.status} className={styles.state}>
            <span className={styles.stateGlyph}>
              <StatusGlyph status={s.status} size={30} withLabel={false} />
            </span>
            <h3 className={styles.stateTitle}>{s.title}</h3>
            <p className={styles.stateText}>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function LearnHub() {
  usePageTitle('Aprender');
  const formations = useFormations();
  const progress = useProgressMap();
  const overall = areaCounts(formations, progress);
  return (
    <div className="container page">
      <PageHeader
        eyebrow="Formación de FLM"
        title={
          <>
            Aprender<span className="red-dot" aria-hidden="true" />
          </>
        }
        lede="Formaciones breves de las cuatro áreas de la firma. Lee cada una a tu ritmo, comprueba lo aprendido con un test de tres preguntas y completa tu itinerario."
        media={<PhotoCapsule name="aprender-libro" aspect="2 / 1" width="clamp(18rem, 30vw, 27rem)" position="50% 0%" sizes="(min-width: 861px) 27rem, 1px" mobile="hide" />}
      />
      {/* El anillo global va dentro del protagonista, en blanco */}
      <NextStepPanel context="aprender" progress={overall} className={styles.next} />
      <Itineraries />
      <Assessments />
      <States />
    </div>
  );
}

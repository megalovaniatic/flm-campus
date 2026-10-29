/**
 * Datos de la sección Aprender: formaciones (con la muestra de desarrollo), evaluaciones,
 * progreso, personas de referencia y ayudas de fechas y orden.
 */
import { use, useMemo } from 'react';
import {
  AREA_IDS,
  AREA_LIST,
  formatLongDate,
  formationStatus,
  isAreaId,
  madridDateKey,
  normalize,
  slugify,
  type AreaId,
  type Block,
  type Formation,
  type FormationProgress,
  type FormationStatus,
  type Person,
  type QuizAttempt,
  type SectorAssessment,
} from '@flm/shared';
import { useAssessments, useFormation, useFormations, useMe, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { asset } from '@/lib/download';

/* ── Muestra de desarrollo ─────────────────────────────────────────────── */

export const SAMPLE_SLUG = '_muestra';

type SampleModule = typeof import('../dev/muestra');

/** Solo en desarrollo: en producción la condición es falsa y el módulo no se incluye. */
const sampleModule: Promise<SampleModule> | null = import.meta.env.DEV ? import('../dev/muestra') : null;

function useSampleModule(enabled: boolean): SampleModule | null {
  return enabled && sampleModule ? use(sampleModule) : null;
}

/** Formación publicada por área y slug; en desarrollo, «_muestra» abre la formación de muestra. */
export function useLearnFormation(area: string | undefined, slug: string | undefined): { formation: Formation | undefined; isSample: boolean } {
  const wantSample = import.meta.env.DEV && slug === SAMPLE_SLUG && isAreaId(area);
  const sample = useSampleModule(wantSample);
  const published = useFormation(area, slug);
  return useMemo(() => {
    if (wantSample && sample && isAreaId(area)) return { formation: { ...sample.SAMPLE_FORMATION, area }, isSample: true };
    return { formation: published, isSample: false };
  }, [wantSample, sample, area, published]);
}

/** Evaluación sectorial del área; en desarrollo, `?muestra=1` abre la evaluación de muestra. */
export function useAreaAssessment(area: string | undefined, wantSample: boolean): { assessment: SectorAssessment | undefined; isSample: boolean } {
  const want = import.meta.env.DEV && wantSample && isAreaId(area);
  const sample = useSampleModule(want);
  const assessments = useAssessments();
  return useMemo(() => {
    if (want && sample && isAreaId(area)) return { assessment: { ...sample.SAMPLE_ASSESSMENT, area }, isSample: true };
    return { assessment: assessments.find((a) => a.area === area), isSample: false };
  }, [want, sample, area, assessments]);
}

/* ── Personas ──────────────────────────────────────────────────────────── */

/** Persona de referencia de cada área (persona real del departamento). */
export const AREA_REFERENCE: Record<AreaId, string> = {
  fiscal: 'p-angel-ceniceros',
  laboral: 'p-cristina-sebastian',
  mercantil: 'p-joan-navarro',
  contable: 'p-judith-calet',
};

export function usePerson(id: string | undefined): Person | undefined {
  const people = usePeople();
  return useMemo(() => (id ? people.find((p) => p.id === id) : undefined), [people, id]);
}

export const photoOf = (p: Person | undefined) => (p?.photo ? asset(p.photo) : undefined);

/** Área por defecto de la persona: la de su departamento, o Fiscal. */
export function useMyArea(): AreaId {
  const me = useMe();
  return AREA_LIST.find((a) => a.name === me?.department)?.id ?? 'fiscal';
}

/* ── Progreso ──────────────────────────────────────────────────────────── */

export function useProgressMap(): Record<string, FormationProgress> {
  return useDemo((s) => s.progress);
}

export function areaCounts(list: Formation[], progress: Record<string, FormationProgress>) {
  return { completed: list.filter((f) => formationStatus(progress[f.id], f) === 'completada').length, total: list.length };
}

export function bestOf(attempts: QuizAttempt[] | undefined): QuizAttempt | undefined {
  return [...(attempts ?? [])].sort((a, b) => b.correct - a.correct || b.at.localeCompare(a.at))[0];
}

/** Siguiente formación sin completar: primero en la misma área, luego en las demás. */
export function nextFormation(current: Pick<Formation, 'id' | 'area'>, list: Formation[], progress: Record<string, FormationProgress>): Formation | undefined {
  const pending = (f: Formation) => f.id !== current.id && formationStatus(progress[f.id], f) !== 'completada';
  const same = list.filter((f) => f.area === current.area);
  const idx = same.findIndex((f) => f.id === current.id);
  const after = [...same.slice(idx + 1), ...same.slice(0, Math.max(0, idx))].find(pending);
  if (after) return after;
  const order = [...AREA_IDS.slice(AREA_IDS.indexOf(current.area) + 1), ...AREA_IDS.slice(0, AREA_IDS.indexOf(current.area))];
  for (const a of order) {
    const f = list.find((x) => x.area === a && pending(x));
    if (f) return f;
  }
  return undefined;
}

/* ── Siguiente paso ───────────────────────────────────────────────────── */

export type NextReason = 'continuar' | 'tu-area' | 'siguiente';

export const NEXT_REASON: Record<NextReason, string> = {
  continuar: 'Continúa donde lo dejaste',
  'tu-area': 'De tu área',
  siguiente: 'Siguiente formación',
};

export type NextStep =
  | { kind: 'formation'; formation: Formation; status: FormationStatus; reason: NextReason }
  | { kind: 'assessment'; area: AreaId }
  | { kind: 'done' };

/**
 * Lo siguiente que conviene hacer (todas las formaciones son voluntarias, sin plazos):
 * la empezada de tu área → la siguiente de tu área → la empezada de otra área → la siguiente de otra
 * → la evaluación de tu área → al día. «Empezada» = la que tocaste más recientemente.
 */
export function useNextStep(): NextStep | null {
  const me = useMe();
  const formations = useFormations();
  const progress = useProgressMap();
  const attempts = useDemo((s) => s.assessmentAttempts);
  const assessments = useAssessments();
  const myArea = useMyArea();
  return useMemo((): NextStep | null => {
    if (!me || !formations.length) return null;
    const statusOf = (f: Formation) => formationStatus(progress[f.id], f);
    const started = (f: Formation) => ['leida', 'test-intentado', 'test-superado'].includes(statusOf(f));
    const touched = (f: Formation) => [progress[f.id]?.readAt ?? '', ...(progress[f.id]?.attempts ?? []).map((a) => a.at)].sort().pop() ?? '';
    const latest = (list: Formation[]) => [...list].sort((a, b) => touched(b).localeCompare(touched(a)))[0];
    const pick = (formation: Formation, reason: NextReason): NextStep => ({ kind: 'formation', formation, status: statusOf(formation), reason });
    const mine = formations.filter((f) => f.area === myArea);
    const others = AREA_IDS.filter((a) => a !== myArea).flatMap((a) => formations.filter((f) => f.area === a));
    const mineStarted = latest(mine.filter(started));
    if (mineStarted) return pick(mineStarted, 'continuar');
    const minePending = mine.find((f) => statusOf(f) !== 'completada');
    if (minePending) return pick(minePending, 'tu-area');
    const otherStarted = latest(others.filter(started));
    if (otherStarted) return pick(otherStarted, 'continuar');
    const otherPending = others.find((f) => statusOf(f) !== 'completada');
    if (otherPending) return pick(otherPending, 'siguiente');
    const assessment = assessments.find((a) => a.area === myArea);
    if (assessment && !(attempts[assessment.id] ?? []).some((a) => a.passed)) return { kind: 'assessment', area: myArea };
    return { kind: 'done' };
  }, [me, formations, progress, attempts, assessments, myArea]);
}

/* ── Fechas de la formación ───────────────────────────────────────────── */

/**
 * Día en Madrid de una fecha editorial. Lo publicado desde Gestión guarda el instante en UTC
 * («2026-11-04T23:30:00.000Z» ya es 5 de noviembre en Madrid); la semilla, la hora con su desfase.
 */
function madridDay(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const at = new Date(iso);
  return iso.length <= 10 || Number.isNaN(at.getTime()) ? iso.slice(0, 10) : madridDateKey(at);
}

/** «Publicada el … · Actualizada el …» en hora de Madrid, sin repetir fechas iguales. */
export function editorialDates(f: Formation): string[] {
  const pub = madridDay(f.editorial.publishedAt);
  const upd = madridDay(f.editorial.updatedAt);
  const out: string[] = [];
  if (pub) out.push(`Publicada el ${formatLongDate(pub)}`);
  if (upd && upd !== pub) out.push(`Actualizada el ${formatLongDate(upd)}`);
  return out;
}

/* ── Estructura de lectura ────────────────────────────────────────────── */

export interface ReadingSection {
  id: string;
  /** Título visible (sin título en la introducción previa al primer apartado). */
  title?: string;
  number?: number;
  blocks: Block[];
  /** Términos clave citados en el apartado (normalizados). */
  terms: Set<string>;
}

const TERM_RE = /\[\[([^\]]+)\]\]/g;

function blockTexts(b: Block): string[] {
  switch (b.type) {
    case 'heading':
      return [b.text];
    case 'paragraph':
    case 'quote':
      return [b.text];
    case 'list':
      return b.items;
    case 'callout':
      return [b.title ?? '', b.text];
    case 'example':
      return [b.scenario, b.conclusion, ...b.steps.map((s) => s.label)];
    case 'table':
      return b.rows.flat();
    case 'widget':
      return [b.caption ?? ''];
    case 'figure':
      return [b.caption ?? ''];
  }
}

/**
 * Agrupa los bloques en apartados (uno por encabezado de nivel 2) con ids únicos y sus términos clave.
 * Los subapartados (encabezados de nivel 3) se quedan dentro de su apartado como un bloque más.
 * Un apartado con título se conserva aunque no tenga bloques: así la numeración es la del editor
 * («Apartado N · …» en el «Repasa» del test).
 */
export function toSections(blocks: Block[]): ReadingSection[] {
  const used = new Set<string>(['al-terminar', 'idea-clave', 'fuentes', 'documentos', 'terminar', 'terminos']);
  const sections: ReadingSection[] = [];
  let current: ReadingSection = { id: 'inicio', blocks: [], terms: new Set() };
  let n = 0;
  for (const b of blocks) {
    if (b.type === 'heading' && b.level !== 3) {
      if (current.blocks.length || current.title) sections.push(current);
      let id = slugify(b.id ?? b.text) || `apartado-${n + 1}`;
      while (used.has(id)) id = `${id}-${n + 1}`;
      used.add(id);
      n += 1;
      current = { id, title: b.text, number: n, blocks: [], terms: new Set() };
      continue;
    }
    current.blocks.push(b);
    for (const t of blockTexts(b)) for (const m of t.matchAll(TERM_RE)) current.terms.add(normalize(m[1] ?? ''));
  }
  if (current.blocks.length || current.title) sections.push(current);
  return sections;
}

/** Títulos que cita un «Repasa»: entre comillas («…») o tras el número («Apartado 2 · …», «Apartado 2: …»). */
function citedTitles(ref: string): string[] {
  const quoted = [...ref.matchAll(/«([^»]+)»/g)].map((m) => m[1] ?? '');
  const after = /apartados?\s+\d+\s*[·:,]\s*(.+)$/i.exec(ref)?.[1];
  return [...quoted, ...(after ? [after] : []), ref].map(normalize).filter(Boolean);
}

/**
 * Resuelve el «Repasa» de una pregunta a su apartado. Manda el título que cita, que no cambia al
 * insertar o reordenar apartados; si no coincide con ninguno, el número («apartado 2») y, por
 * último, el apartado cuyo título aparece en el texto.
 */
export function sectionForRef(sections: ReadingSection[], ref: string | undefined): ReadingSection | undefined {
  if (!ref) return undefined;
  const cited = Number(/apartado\s+(\d+)/i.exec(ref)?.[1] ?? 0);
  for (const title of citedTitles(ref)) {
    const named = sections.filter((s) => s.title && normalize(s.title) === title);
    // Dos apartados con el mismo título: el del número citado.
    if (named.length) return named.find((s) => s.number === cited) ?? named[0];
  }
  const byNumber = cited ? sections.find((s) => s.number === cited) : undefined;
  if (byNumber) return byNumber;
  const r = normalize(ref);
  return sections.find((s) => s.title && r.includes(normalize(s.title)));
}

export const formationPath = (f: Pick<Formation, 'area' | 'slug'>) => `/aprender/${f.area}/${f.slug}`;

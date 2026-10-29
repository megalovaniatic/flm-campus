/**
 * Datos de la sección Aprender: formaciones (con la muestra de desarrollo), evaluaciones,
 * obligatorias de la persona, personas de referencia y ayudas de fechas y orden.
 */
import { use, useMemo } from 'react';
import {
  AREA_IDS,
  AREA_LIST,
  diffDays,
  formatLongDate,
  formatShortDate,
  formationStatus,
  isAreaId,
  madridDateKey,
  normalize,
  slugify,
  type AreaId,
  type Assignment,
  type Block,
  type Formation,
  type FormationProgress,
  type Person,
  type QuizAttempt,
  type SectorAssessment,
} from '@flm/shared';
import { assessments, assignments, useFormation, useFormations, useMe, usePeople } from '@/data/selectors';
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
  return useMemo(() => {
    if (want && sample && isAreaId(area)) return { assessment: { ...sample.SAMPLE_ASSESSMENT, area }, isSample: true };
    return { assessment: assessments.find((a) => a.area === area), isSample: false };
  }, [want, sample, area]);
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

/* ── Obligatorias ─────────────────────────────────────────────────────── */

export interface MyAssignment {
  assignment: Assignment;
  formation: Formation;
}

/** Formaciones obligatorias de la persona (asignadas a ella o a todo el equipo), por fecha límite. */
export function useMyAssignments(): MyAssignment[] {
  const me = useMe();
  const formations = useFormations();
  return useMemo(() => {
    if (!me) return [];
    const out: MyAssignment[] = [];
    for (const a of assignments) {
      if (a.target.kind === 'persona' && a.target.personId !== me.id) continue;
      const formation = formations.find((f) => f.id === a.formationId);
      if (formation) out.push({ assignment: a, formation });
    }
    return out.sort((x, y) => (x.assignment.dueDate ?? '9999').localeCompare(y.assignment.dueDate ?? '9999'));
  }, [me, formations]);
}

export interface DueInfo {
  /** «Antes del 30 nov» o «Venció el 15 nov». */
  label: string;
  /** «Quedan 33 días», «Vence hoy», «Venció hace 2 días». */
  hint: string;
  overdue: boolean;
  days: number;
}

export function dueInfo(due: string, today: string = madridDateKey()): DueInfo {
  const days = diffDays(today, due);
  const date = formatShortDate(due, due.slice(0, 4) !== today.slice(0, 4));
  if (days < 0) return { label: `Venció el ${date}`, hint: days === -1 ? 'Venció ayer' : `Venció hace ${-days} días`, overdue: true, days };
  const hint = days === 0 ? 'Vence hoy' : days === 1 ? 'Vence mañana' : `Quedan ${days} días`;
  return { label: `Antes del ${date}`, hint, overdue: false, days };
}

/* ── Fechas de la formación ───────────────────────────────────────────── */

/** «Publicada el … · Actualizada el …» sin repetir fechas iguales. */
export function editorialDates(f: Formation): string[] {
  const pub = f.editorial.publishedAt?.slice(0, 10);
  const upd = f.editorial.updatedAt?.slice(0, 10);
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

/** Agrupa los bloques en apartados (uno por encabezado) con ids únicos y sus términos clave. */
export function toSections(blocks: Block[]): ReadingSection[] {
  const used = new Set<string>(['al-terminar', 'idea-clave', 'fuentes', 'documentos', 'terminar', 'terminos']);
  const sections: ReadingSection[] = [];
  let current: ReadingSection = { id: 'inicio', blocks: [], terms: new Set() };
  let n = 0;
  for (const b of blocks) {
    if (b.type === 'heading') {
      if (current.blocks.length) sections.push(current);
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

/** Resuelve «apartado 2» o el título de un apartado a su id (para «Repasa»). */
export function sectionForRef(sections: ReadingSection[], ref: string | undefined): ReadingSection | undefined {
  if (!ref) return undefined;
  const m = /apartado\s+(\d+)/i.exec(ref);
  if (m) {
    const s = sections.find((x) => x.number === Number(m[1]));
    if (s) return s;
  }
  const r = normalize(ref);
  return sections.find((s) => s.title && r.includes(normalize(s.title)));
}

export const formationPath = (f: Pick<Formation, 'area' | 'slug'>) => `/aprender/${f.area}/${f.slug}`;

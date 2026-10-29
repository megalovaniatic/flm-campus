/**
 * Datos del perfil: progreso por área, obligatorias, intentos, evaluaciones y reconocimientos.
 * Todo se calcula con las reglas compartidas (@flm/shared) a partir del contenido publicado
 * y del progreso guardado (en la demo, en este navegador).
 */
import { useMemo } from 'react';
import {
  AREA_IDS,
  AREAS,
  areaProgress,
  bestAttempt,
  computeBadges,
  currentAttempts,
  diffDays,
  formatLongDate,
  formationStatus,
  madridDateKey,
  nextTenureMilestone,
  type AreaId,
  type Assignment,
  type Badge,
  type BadgeFamily,
  type Formation,
  type FormationStatus,
  type Person,
  type QuizAttempt,
  type SectorAssessment,
} from '@flm/shared';
import { assessments, assignments, useDocuments, useEvents, useFormations, useNews, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';

/** «faltan 308 días», «falta 1 día», «es hoy». */
export function daysLeftText(days: number): string {
  if (days <= 0) return 'es hoy';
  return days === 1 ? 'falta 1 día' : `faltan ${days} días`;
}

/* ── Progreso por área ─────────────────────────────────────────────────── */

export interface AreaSummary {
  area: AreaId;
  completed: number;
  total: number;
}

export function useAreaSummaries(formations: Formation[]): AreaSummary[] {
  const progress = useDemo((s) => s.progress);
  return useMemo(() => AREA_IDS.map((area) => ({ area, ...areaProgress(area, formations, progress) })), [formations, progress]);
}

/* ── Obligatorias ──────────────────────────────────────────────────────── */

export interface MandatoryItem {
  assignment: Assignment;
  formation: Formation;
  status: FormationStatus;
  /** Días hasta el plazo (negativo si ya ha vencido). */
  days?: number;
  assignedBy?: string;
}

export function useMandatory(personId: string, formations: Formation[]): { total: number; pending: MandatoryItem[] } {
  const progress = useDemo((s) => s.progress);
  const people = usePeople();
  return useMemo(() => {
    const today = madridDateKey();
    const mine = assignments
      .filter((a) => a.target.kind === 'todos' || a.target.personId === personId)
      .flatMap((a): MandatoryItem[] => {
        const formation = formations.find((f) => f.id === a.formationId);
        if (!formation) return [];
        return [
          {
            assignment: a,
            formation,
            status: formationStatus(progress[formation.id], formation),
            days: a.dueDate ? diffDays(today, a.dueDate) : undefined,
            assignedBy: people.find((p) => p.id === a.assignedBy)?.name,
          },
        ];
      });
    const pending = mine
      .filter((m) => m.status !== 'completada')
      .sort((x, y) => (x.assignment.dueDate ?? '9999-12-31').localeCompare(y.assignment.dueDate ?? '9999-12-31'));
    return { total: mine.length, pending };
  }, [personId, formations, progress, people]);
}

/* ── Formaciones ───────────────────────────────────────────────────────── */

export interface FormationRow {
  formation: Formation;
  status: FormationStatus;
  /** Lectura confirmada de la versión vigente (ISO). */
  readAt?: string;
  best?: QuizAttempt;
  attempts: number;
}

export function useFormationGroups(formations: Formation[]): { area: AreaId; completed: number; rows: FormationRow[] }[] {
  const progress = useDemo((s) => s.progress);
  return useMemo(
    () =>
      AREA_IDS.map((area) => {
        const rows = formations
          .filter((f) => f.area === area)
          .map((formation): FormationRow => {
            const p = progress[formation.id];
            const current = currentAttempts(p, formation);
            return {
              formation,
              status: formationStatus(p, formation),
              readAt: p?.readAt && p.readVersion === formation.version ? p.readAt : undefined,
              best: bestAttempt(current),
              attempts: current.length,
            };
          });
        return { area, completed: rows.filter((r) => r.status === 'completada').length, rows };
      }).filter((g) => g.rows.length > 0),
    [formations, progress],
  );
}

/* ── Historial de intentos ─────────────────────────────────────────────── */

export interface AttemptRow {
  attempt: QuizAttempt;
  formationId: string;
  formation?: Formation;
  /** El intento corresponde a una versión anterior de la formación (ya no cuenta). */
  outdated: boolean;
}

export function useAttemptHistory(allFormations: Formation[]): AttemptRow[] {
  const progress = useDemo((s) => s.progress);
  return useMemo(
    () =>
      Object.values(progress)
        .flatMap((p) =>
          p.attempts.map((attempt): AttemptRow => {
            const formation = allFormations.find((f) => f.id === p.formationId);
            return { attempt, formationId: p.formationId, formation, outdated: !!formation && attempt.version !== formation.version };
          }),
        )
        .sort((a, b) => b.attempt.at.localeCompare(a.attempt.at)),
    [progress, allFormations],
  );
}

/* ── Evaluaciones sectoriales ──────────────────────────────────────────── */

export interface AssessmentSummary {
  area: AreaId;
  assessment?: SectorAssessment;
  attempts: QuizAttempt[];
  best?: QuizAttempt;
  passed?: QuizAttempt;
}

export function useAssessmentSummaries(): AssessmentSummary[] {
  const map = useDemo((s) => s.assessmentAttempts);
  return useMemo(
    () =>
      AREA_IDS.map((area) => {
        const assessment = assessments.find((a) => a.area === area);
        const attempts = assessment ? (map[assessment.id] ?? []) : [];
        const passed = attempts.filter((a) => a.passed).sort((x, y) => y.correct - x.correct || x.at.localeCompare(y.at))[0];
        return { area, assessment, attempts, best: bestAttempt(attempts), passed };
      }),
    [map],
  );
}

/* ── Contribución ──────────────────────────────────────────────────────── */

/** Contenidos de la persona que han llegado a publicarse (los archivados también se publicaron). */
export function usePublishedCount(personId: string): number {
  const formations = useFormations(true);
  const news = useNews(true);
  const documents = useDocuments(true);
  const events = useEvents(true);
  const drafts = useDemo((s) => s.drafts);
  return useMemo(() => {
    const ids = new Set<string>();
    const shared = (status: string) => status === 'publicado' || status === 'archivado';
    for (const item of [...formations, ...news, ...documents, ...events]) {
      if (item.editorial.authorId === personId && shared(item.editorial.status)) ids.add(item.id);
    }
    for (const d of Object.values(drafts)) {
      if (d.authorId === personId && shared(d.status)) ids.add(d.id);
    }
    return ids.size;
  }, [personId, formations, news, documents, events, drafts]);
}

/* ── Reconocimientos ───────────────────────────────────────────────────── */

export function useBadges(person: Person, formations: Formation[], published: number): Badge[] {
  const progress = useDemo((s) => s.progress);
  const assessmentAttempts = useDemo((s) => s.assessmentAttempts);
  return useMemo(
    () => computeBadges({ person, formations, progress, assessments, assessmentAttempts, publishedByPerson: published }),
    [person, formations, progress, assessmentAttempts, published],
  );
}

export interface UpcomingBadge {
  family: BadgeFamily;
  title: string;
  detail: string;
  to?: string;
}

/** El siguiente reconocimiento de cada familia, explicado (sin puntos ni rankings). */
export function upcomingBadges(person: Person, badges: Badge[], areas: AreaSummary[], published: number, assessmentList: AssessmentSummary[]): UpcomingBadge[] {
  const out: UpcomingBadge[] = [];
  const earned = new Set(badges.map((b) => b.id));

  // Trayectoria
  if (person.startDate) {
    const next = nextTenureMilestone(person.startDate);
    if (next) {
      out.push({
        family: 'trayectoria',
        title: next.years === 1 ? 'Primer año en FLM' : `${next.years} años en FLM`,
        detail: `El ${formatLongDate(next.date)} · ${daysLeftText(next.inDays)}.`,
      });
    }
  } else {
    out.push({ family: 'trayectoria', title: 'Aniversarios en FLM', detail: 'Se calculan con tu fecha de incorporación, que aún no consta en tu ficha.' });
  }

  // Aprendizaje: el itinerario de tu departamento o el que tengas más cerca
  const open = areas.filter((a) => a.total > 0 && !earned.has(`area-${a.area}`));
  if (open.length) {
    const own = open.find((a) => AREAS[a.area].name === person.department);
    const pick = own ?? [...open].sort((x, y) => y.completed / y.total - x.completed / x.total)[0]!;
    const left = pick.total - pick.completed;
    out.push({
      family: 'aprendizaje',
      title: `Itinerario ${AREAS[pick.area].name} completado`,
      detail: `Llevas ${pick.completed} de ${pick.total}: ${left === 1 ? 'te queda 1 formación' : `te quedan ${left} formaciones`}.`,
      to: `/aprender/${pick.area}`,
    });
  } else {
    const assessment = assessmentList.find((a) => a.assessment && !earned.has(`evaluacion-${a.area}`));
    if (assessment) {
      out.push({
        family: 'aprendizaje',
        title: `Evaluación ${AREAS[assessment.area].name} superada`,
        detail: `${assessment.assessment!.quiz.questions.length} preguntas; se supera con ${assessment.assessment!.quiz.passMark}.`,
        to: `/aprender/${assessment.area}/evaluacion`,
      });
    } else if (!areas.some((a) => a.total > 0)) {
      out.push({ family: 'aprendizaje', title: 'Itinerarios de área', detail: 'Llegarán con las primeras formaciones publicadas en el campus.' });
    }
  }

  // Contribución
  if (published < 1) {
    out.push({ family: 'contribucion', title: 'Primera publicación', detail: 'Comparte con el equipo una formación, una novedad o un documento útil.', to: '/participar/contribuye' });
  } else if (published < 5) {
    out.push({ family: 'contribucion', title: 'Referente del campus', detail: `Llevas ${published} de 5 contenidos publicados.`, to: '/participar/contribuye' });
  }
  return out;
}

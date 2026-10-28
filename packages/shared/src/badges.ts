import { AREAS, AREA_IDS, type AreaId } from './areas';
import { diffDays, madridDateKey } from './dates';
import { formationStatus } from './progress';
import type { Badge, Formation, FormationProgress, Person, QuizAttempt, SectorAssessment } from './types';

/** Hitos de trayectoria que generan reconocimiento. */
export const TENURE_MILESTONES = [1, 3, 5, 10, 15, 20, 25, 30, 40] as const;

export function tenureYears(startDate: string, today: string = madridDateKey()): number {
  const [sy, sm, sd] = startDate.split('-').map(Number) as [number, number, number];
  const [ty, tm, td] = today.split('-').map(Number) as [number, number, number];
  let years = ty - sy;
  if (tm < sm || (tm === sm && td < sd)) years -= 1;
  return Math.max(0, years);
}

/** Próximo hito de trayectoria y días que faltan. */
export function nextTenureMilestone(startDate: string, today: string = madridDateKey()): { years: number; date: string; inDays: number } | undefined {
  const current = tenureYears(startDate, today);
  const next = TENURE_MILESTONES.find((m) => m > current);
  if (!next) return undefined;
  const date = `${Number(startDate.slice(0, 4)) + next}${startDate.slice(4)}`;
  return { years: next, date, inDays: diffDays(today, date) };
}

export interface BadgeInputs {
  person: Person;
  formations: Formation[];
  progress: Record<string, FormationProgress>;
  assessments: SectorAssessment[];
  assessmentAttempts: Record<string, QuizAttempt[]>;
  publishedByPerson: number;
  today?: string;
}

/** Reconocimientos profesionales: trayectoria, aprendizaje y contribución. */
export function computeBadges(input: BadgeInputs): Badge[] {
  const today = input.today ?? madridDateKey();
  const badges: Badge[] = [];

  const start = input.person.startDate;
  const years = start ? tenureYears(start, today) : 0;
  for (const m of TENURE_MILESTONES) {
    if (start && years >= m) {
      badges.push({
        id: `trayectoria-${m}`,
        family: 'trayectoria',
        title: m === 1 ? 'Primer año en FLM' : `${m} años en FLM`,
        description: `Reconocimiento por ${m === 1 ? 'tu primer año' : `${m} años`} de trayectoria en la firma.`,
        earnedAt: `${Number(start.slice(0, 4)) + m}${start.slice(4)}`,
        mark: String(m),
      });
    }
  }

  for (const area of AREA_IDS) {
    const list = input.formations.filter((f) => f.area === area && f.editorial.status === 'publicado');
    if (list.length && list.every((f) => formationStatus(input.progress[f.id], f) === 'completada')) {
      const last = list
        .flatMap((f) => (input.progress[f.id]?.attempts ?? []).filter((a) => a.passed).map((a) => a.at))
        .sort()
        .pop();
      badges.push({
        id: `area-${area}`,
        family: 'aprendizaje',
        title: `Itinerario ${AREAS[area].name} completado`,
        description: `Has completado todas las formaciones del área ${AREAS[area].name}.`,
        earnedAt: last,
        mark: AREAS[area].initial,
      });
    }
    const assessment = input.assessments.find((a) => a.area === area);
    const passed = assessment && (input.assessmentAttempts[assessment.id] ?? []).find((a) => a.passed);
    if (assessment && passed) {
      badges.push({
        id: `evaluacion-${area}`,
        family: 'aprendizaje',
        title: `Evaluación ${AREAS[area].name} superada`,
        description: `«Pon a prueba tus conocimientos» de ${AREAS[area].name}: ${passed.correct}/${passed.total}.`,
        earnedAt: passed.at,
        mark: `${passed.correct}/${passed.total}`,
      });
    }
  }

  if (input.publishedByPerson >= 1) {
    badges.push({
      id: 'contribucion-1',
      family: 'contribucion',
      title: 'Primera publicación',
      description: 'Has compartido conocimiento con el equipo a través del campus.',
      mark: '1',
    });
  }
  if (input.publishedByPerson >= 5) {
    badges.push({
      id: 'contribucion-5',
      family: 'contribucion',
      title: 'Referente del campus',
      description: 'Cinco contenidos publicados para el equipo.',
      mark: '5',
    });
  }
  return badges;
}

export function areaProgress(area: AreaId, formations: Formation[], progress: Record<string, FormationProgress>): { completed: number; total: number } {
  const list = formations.filter((f) => f.area === area && f.editorial.status === 'publicado');
  return { completed: list.filter((f) => formationStatus(progress[f.id], f) === 'completada').length, total: list.length };
}

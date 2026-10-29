import { AREAS, AREA_IDS, type AreaId } from './areas';
import { formationStatus } from './progress';
import type { Badge, Formation, FormationProgress, QuizAttempt, SectorAssessment } from './types';

export interface BadgeInputs {
  formations: Formation[];
  progress: Record<string, FormationProgress>;
  assessments: SectorAssessment[];
  assessmentAttempts: Record<string, QuizAttempt[]>;
  publishedByPerson: number;
}

/** Reconocimientos profesionales: aprendizaje y contribución. */
export function computeBadges(input: BadgeInputs): Badge[] {
  const badges: Badge[] = [];

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

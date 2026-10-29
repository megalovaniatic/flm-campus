import { AREA_IDS, AREAS, type AreaId, type QuizQuestion, type SectorAssessment } from '@flm/shared';
import { banks, formations } from './formaciones';

/**
 * «Pon a prueba tus conocimientos»: 10 preguntas de dificultad media por área (aprobado con 8),
 * compuestas a partir de los bancos de preguntas de las tres primeras formaciones del área (4 + 3 + 3).
 */
function assemble(area: AreaId): QuizQuestion[] {
  const pools = formations.filter((f) => f.area === area).map((f) => banks[f.id] ?? []);
  const quotas = [4, 3, 3];
  const picked: QuizQuestion[] = [];
  pools.forEach((pool, i) => picked.push(...pool.slice(0, quotas[i] ?? 3)));
  for (const pool of pools) for (const q of pool) if (picked.length < 10 && !picked.includes(q)) picked.push(q);
  return picked.slice(0, 10);
}

export const assessments: SectorAssessment[] = AREA_IDS.map(
  (area): SectorAssessment => ({
    id: `eval-${area}`,
    area,
    title: 'Pon a prueba tus conocimientos',
    intro: `Diez preguntas de dificultad media sobre las formaciones del área ${AREAS[area].name}. Se supera con 8 aciertos y puedes repetirla cuando quieras.`,
    quiz: { id: `eval-${area}-quiz`, title: `Evaluación del área ${AREAS[area].name}`, passMark: 8, questions: assemble(area) },
  }),
).filter((a) => a.quiz.questions.length === 10);

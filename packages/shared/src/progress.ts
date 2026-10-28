import type { Formation, FormationProgress, FormationStatus, Quiz, QuizAttempt } from './types';

export interface GradeResult {
  correct: number;
  total: number;
  passed: boolean;
  /** Resultado por pregunta, en el orden del test. */
  perQuestion: { questionId: string; chosen?: string; correct: boolean }[];
}

/** Corrige un test. En producción se ejecuta en el servidor; en la demo, en el navegador. */
export function gradeQuiz(quiz: Quiz, answers: Record<string, string>): GradeResult {
  const perQuestion = quiz.questions.map((q) => ({
    questionId: q.id,
    chosen: answers[q.id],
    correct: answers[q.id] === q.correctOptionId,
  }));
  const correct = perQuestion.filter((r) => r.correct).length;
  return { correct, total: quiz.questions.length, passed: correct >= quiz.passMark, perQuestion };
}

/** Intentos que cuentan para la versión vigente de la formación. */
export function currentAttempts(progress: FormationProgress | undefined, formation: Pick<Formation, 'version'>): QuizAttempt[] {
  return (progress?.attempts ?? []).filter((a) => a.version === formation.version);
}

export function bestAttempt(attempts: QuizAttempt[]): QuizAttempt | undefined {
  return [...attempts].sort((a, b) => b.correct - a.correct || a.at.localeCompare(b.at))[0];
}

/**
 * Estados de aprendizaje, definidos de forma explícita y medible:
 * - Leída: la persona llegó al final y confirmó la lectura de la versión vigente.
 * - Test intentado: hay al menos un intento de la versión vigente.
 * - Test superado: algún intento alcanza el mínimo (2/3 en las formaciones).
 * - Completada: leída y test superado, ambos sobre la versión vigente.
 */
export function formationStatus(progress: FormationProgress | undefined, formation: Pick<Formation, 'version'>): FormationStatus {
  const read = !!progress?.readAt && progress.readVersion === formation.version;
  const attempts = currentAttempts(progress, formation);
  const passed = attempts.some((a) => a.passed);
  if (read && passed) return 'completada';
  if (passed) return 'test-superado';
  if (attempts.length) return 'test-intentado';
  if (read) return 'leida';
  return 'sin-empezar';
}

export const STATUS_LABEL: Record<FormationStatus, string> = {
  'sin-empezar': 'Sin empezar',
  leida: 'Formación leída',
  'test-intentado': 'Test intentado',
  'test-superado': 'Test superado',
  completada: 'Formación completada',
};

/** Qué le falta a la persona para completar la formación (texto de ayuda). */
export function nextStepHint(progress: FormationProgress | undefined, formation: Pick<Formation, 'version'>): string {
  const status = formationStatus(progress, formation);
  switch (status) {
    case 'sin-empezar':
      return 'Lee la formación y haz el test final.';
    case 'leida':
      return 'Te falta superar el test final (2 de 3 aciertos).';
    case 'test-intentado':
      return 'Repasa las explicaciones y vuelve a intentar el test.';
    case 'test-superado':
      return 'Confirma la lectura de la formación para completarla.';
    case 'completada':
      return 'Formación completada. Puedes repasarla cuando quieras.';
  }
}

/** Errores más frecuentes por pregunta (para informes de administración). */
export function commonErrors(quiz: Quiz, attempts: QuizAttempt[]): { questionId: string; prompt: string; errorRate: number; mostChosenWrong?: string; responses: number }[] {
  return quiz.questions
    .map((q) => {
      const answered = attempts.filter((a) => a.answers[q.id] !== undefined);
      const wrong = answered.filter((a) => a.answers[q.id] !== q.correctOptionId);
      const counts = new Map<string, number>();
      wrong.forEach((a) => {
        const k = a.answers[q.id]!;
        counts.set(k, (counts.get(k) ?? 0) + 1);
      });
      const top = [...counts.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
      return {
        questionId: q.id,
        prompt: q.prompt,
        errorRate: answered.length ? wrong.length / answered.length : 0,
        mostChosenWrong: top ? q.options.find((o) => o.id === top)?.text : undefined,
        responses: answered.length,
      };
    })
    .sort((a, b) => b.errorRate - a.errorRate);
}

/** Tiempo de lectura estimado a partir del número de palabras (≈200 palabras/min en contenido técnico). */
export function estimateReadingMinutes(words: number): number {
  return Math.max(3, Math.round(words / 200));
}

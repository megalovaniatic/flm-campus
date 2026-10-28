import { formationStatus, gradeQuiz, nextStepHint, STATUS_LABEL, type FormationProgress, type Quiz, type QuizAttempt } from '@flm/shared';
import { z } from 'zod';
import { newId } from '../auth/tokens';
import { all, run, type Db } from '../db/database';
import { badRequest, conflict } from '../lib/errors';
import type { ContentRow } from './content';

/**
 * Aprendizaje: lectura confirmada, intentos de test corregidos en el servidor con `gradeQuiz()`
 * y estado de cada formación con `formationStatus()` (las mismas funciones que usa la demo).
 */
export interface AttemptRow {
  id: string;
  user_id: string | null;
  content_id: string;
  quiz_id: string;
  version: number;
  answers: string;
  correct: number;
  total: number;
  passed: number;
  created_at: string;
}

export function toQuizAttempt(r: AttemptRow): QuizAttempt {
  return {
    id: r.id,
    quizId: r.quiz_id,
    version: r.version,
    at: r.created_at,
    answers: JSON.parse(r.answers) as Record<string, string>,
    correct: r.correct,
    total: r.total,
    passed: r.passed === 1,
  };
}

export function quizOf(row: ContentRow): Quiz {
  return (JSON.parse(row.payload) as { quiz: Quiz }).quiz;
}

/** Test tal como lo ve quien lo realiza: sin respuesta correcta, explicación ni retroalimentación. */
export function publicQuiz(quiz: Quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    passMark: quiz.passMark,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      ...(q.ref ? { ref: q.ref } : {}),
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  };
}

/** Sustituye el test de un contenido (formación o evaluación) por su versión sin soluciones. */
export function withPublicQuiz<T extends { quiz: Quiz }>(item: T): Omit<T, 'quiz'> & { quiz: ReturnType<typeof publicQuiz> } {
  return { ...item, quiz: publicQuiz(item.quiz) };
}

export function progressFor(db: Db, userId: string, row: ContentRow): FormationProgress {
  const reads = all<{ version: number; read_at: string }>(
    db,
    'SELECT version, read_at FROM read_confirmations WHERE user_id = ? AND content_id = ? ORDER BY read_at DESC',
    userId,
    row.id,
  );
  const read = reads.find((r) => r.version === row.version) ?? reads[0];
  const attempts = all<AttemptRow>(db, 'SELECT * FROM quiz_attempts WHERE user_id = ? AND content_id = ? ORDER BY created_at', userId, row.id).map(toQuizAttempt);
  return { formationId: row.id, ...(read ? { readAt: read.read_at, readVersion: read.version } : {}), attempts };
}

/** Resumen del progreso propio con el estado calculado por `formationStatus()`. */
export function progressView(row: ContentRow, progress: FormationProgress) {
  const status = formationStatus(progress, { version: row.version });
  const current = progress.attempts.filter((a) => a.version === row.version);
  const best = [...current].sort((a, b) => b.correct - a.correct)[0];
  return {
    status,
    statusLabel: STATUS_LABEL[status],
    nextStep: nextStepHint(progress, { version: row.version }),
    version: row.version,
    readAt: progress.readVersion === row.version ? progress.readAt : undefined,
    readVersion: progress.readVersion,
    attempts: progress.attempts.length,
    currentVersionAttempts: current.length,
    bestScore: best ? { correct: best.correct, total: best.total, passed: best.passed } : null,
  };
}

function assertVersion(row: ContentRow, version: number | undefined): void {
  if (version !== undefined && version !== row.version) {
    throw conflict('El contenido se ha actualizado mientras lo consultabas. Recarga para ver la versión vigente.', 'VERSION_DESACTUALIZADA');
  }
}

export function confirmRead(db: Db, userId: string, row: ContentRow, version: number | undefined, now: Date): FormationProgress {
  assertVersion(row, version);
  run(db, 'INSERT OR IGNORE INTO read_confirmations (user_id, content_id, version, read_at) VALUES (?, ?, ?, ?)', userId, row.id, row.version, now.toISOString());
  return progressFor(db, userId, row);
}

export const attemptInput = z.object({
  answers: z.record(z.string().max(100), z.string().max(100)),
  version: z.number().int().positive().optional(),
});

/** Corrige un intento en el servidor y devuelve el resultado con las explicaciones. */
export function submitAttempt(db: Db, userId: string, row: ContentRow, input: z.output<typeof attemptInput>, now: Date) {
  assertVersion(row, input.version);
  const quiz = quizOf(row);
  const questionIds = new Set(quiz.questions.map((q) => q.id));
  const unknown = Object.keys(input.answers).filter((id) => !questionIds.has(id));
  if (unknown.length) throw badRequest('Hay respuestas a preguntas que no forman parte de este test.', unknown.map((id) => ({ path: `answers.${id}`, message: 'Pregunta desconocida' })));
  const issues = quiz.questions.flatMap((q) => {
    const chosen = input.answers[q.id];
    if (chosen === undefined) return [{ path: `answers.${q.id}`, message: 'Pregunta sin responder' }];
    if (!q.options.some((o) => o.id === chosen)) return [{ path: `answers.${q.id}`, message: 'Opción inexistente' }];
    return [];
  });
  if (issues.length) throw badRequest('Responde todas las preguntas con una de las opciones antes de enviar el test.', issues, 'RESPUESTAS_INCOMPLETAS');

  const grade = gradeQuiz(quiz, input.answers);
  const attempt: AttemptRow = {
    id: newId(),
    user_id: userId,
    content_id: row.id,
    quiz_id: quiz.id,
    version: row.version,
    answers: JSON.stringify(input.answers),
    correct: grade.correct,
    total: grade.total,
    passed: grade.passed ? 1 : 0,
    created_at: now.toISOString(),
  };
  run(
    db,
    `INSERT INTO quiz_attempts (id, user_id, content_id, quiz_id, version, answers, correct, total, passed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    attempt.id,
    attempt.user_id,
    attempt.content_id,
    attempt.quiz_id,
    attempt.version,
    attempt.answers,
    attempt.correct,
    attempt.total,
    attempt.passed,
    attempt.created_at,
  );

  const results = quiz.questions.map((q) => {
    const r = grade.perQuestion.find((p) => p.questionId === q.id);
    const chosen = q.options.find((o) => o.id === r?.chosen);
    return {
      questionId: q.id,
      chosen: r?.chosen ?? null,
      correct: r?.correct ?? false,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      ...(q.ref ? { ref: q.ref } : {}),
      ...(!r?.correct && chosen?.feedback ? { feedback: chosen.feedback } : {}),
    };
  });
  return {
    attempt: toQuizAttempt(attempt),
    correct: grade.correct,
    total: grade.total,
    passMark: quiz.passMark,
    passed: grade.passed,
    results,
  };
}

/** Historial propio de intentos de un contenido (fecha, versión, respuestas y aciertos). */
export function attemptHistory(db: Db, userId: string, contentId?: string): QuizAttempt[] {
  const rows = contentId
    ? all<AttemptRow>(db, 'SELECT * FROM quiz_attempts WHERE user_id = ? AND content_id = ? ORDER BY created_at DESC', userId, contentId)
    : all<AttemptRow>(db, 'SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC', userId);
  return rows.map(toQuizAttempt);
}

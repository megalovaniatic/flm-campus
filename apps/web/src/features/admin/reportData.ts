/**
 * Informes restringidos de la demo: participación por formación y errores frecuentes por pregunta.
 * Las formaciones son voluntarias, así que el informe es agregado y no muestra a nadie por su nombre.
 *
 * - La persona de la demostración aporta su progreso REAL (useDemo.progress).
 * - Las personas FICTICIAS reciben datos SIMULADOS y DETERMINISTAS (misma semilla → mismo
 *   resultado), rotulados «Datos simulados».
 * - Las personas REALES distintas de la de la demo se excluyen: nunca se inventa su progreso.
 *
 * La estructura replica la del servicio de informes de la API (byFormation y totals) y los CSV
 * usan las mismas columnas; la demo añade al final «Origen de los datos».
 */
import {
  commonErrors,
  formationStatus,
  gradeQuiz,
  madridDateKey,
  type Formation,
  type FormationProgress,
  type FormationStatus,
  type Person,
  type Quiz,
  type QuizAttempt,
} from '@flm/shared';

export type DataOrigin = 'real' | 'simulado';

/* ── Pseudoaleatorio determinista (FNV-1a + mulberry32) ─────────────────── */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seeded(seed: string): () => number {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── Intentos simulados ─────────────────────────────────────────────────── */

function simulateAnswers(quiz: Quiz, rnd: () => number, wantPass: boolean): Record<string, string> {
  // Hasta 12 tiradas deterministas para obtener un intento coherente con el estado simulado.
  for (let tries = 0; tries < 12; tries++) {
    const answers: Record<string, string> = {};
    for (const q of quiz.questions) {
      const qr = seeded(`${quiz.id}|${q.id}|dificultad`);
      const pCorrect = 0.5 + 0.38 * qr();
      const wrong = q.options.filter((o) => o.id !== q.correctOptionId);
      // Un distractor «atractivo» por pregunta concentra la mayoría de los errores.
      const lure = wrong[Math.floor(qr() * wrong.length)] ?? wrong[0];
      if (rnd() < pCorrect) answers[q.id] = q.correctOptionId;
      else answers[q.id] = (rnd() < 0.68 ? lure : wrong[Math.floor(rnd() * wrong.length)])?.id ?? q.correctOptionId;
    }
    if (gradeQuiz(quiz, answers).passed === wantPass) return answers;
  }
  // Último recurso: construir el intento a mano.
  const answers: Record<string, string> = {};
  quiz.questions.forEach((q, i) => {
    const wrong = q.options.find((o) => o.id !== q.correctOptionId);
    answers[q.id] = (wantPass ? i < quiz.passMark : i >= quiz.passMark) ? q.correctOptionId : (wrong?.id ?? q.correctOptionId);
  });
  return answers;
}

function simulatedProgress(person: Person, f: Formation): FormationProgress {
  const rnd = seeded(`${person.id}|${f.id}|v${f.version}`);
  const x = rnd();
  const status: FormationStatus = x < 0.5 ? 'completada' : x < 0.58 ? 'test-superado' : x < 0.7 ? 'test-intentado' : x < 0.8 ? 'leida' : 'sin-empezar';
  const day = (n: number) => `2026-10-${String(Math.min(28, 20 + n)).padStart(2, '0')}T${String(9 + Math.floor(rnd() * 9)).padStart(2, '0')}:00:00.000Z`;
  const attempts: QuizAttempt[] = [];
  const add = (passed: boolean, n: number) => {
    const answers = simulateAnswers(f.quiz, rnd, passed);
    const g = gradeQuiz(f.quiz, answers);
    attempts.push({ id: `sim-${person.id}-${f.id}-${n}`, quizId: f.quiz.id, version: f.version, at: day(n), answers, correct: g.correct, total: g.total, passed: g.passed });
  };
  if (status === 'test-intentado') {
    add(false, 1);
    if (rnd() < 0.4) add(false, 2);
  }
  if (status === 'test-superado' || status === 'completada') {
    if (rnd() < 0.35) add(false, 1);
    add(true, 2);
  }
  const read = status === 'leida' || status === 'completada';
  return { formationId: f.id, attempts, ...(read ? { readAt: day(0), readVersion: f.version } : {}) };
}

/* ── Informe ────────────────────────────────────────────────────────────── */

/** Progreso de una persona en una formación. Solo sirve para contar: nunca sale del informe con nombre. */
interface ProgressRow {
  personId: string;
  formation: Formation;
  status: FormationStatus;
  attempts: QuizAttempt[];
  origin: DataOrigin;
}

export interface FormationParticipation {
  formation: Formation;
  /** Personas sobre las que se calcula. */
  people: number;
  completed: number;
  /** Leída, test intentado o test superado, sin completar todavía. */
  inProgress: number;
  notStarted: number;
  rate: number | null;
}

export interface ReportData {
  today: string;
  formations: Formation[];
  people: number;
  rows: ProgressRow[];
  byFormation: FormationParticipation[];
  totals: { withCompleted: number; completed: number };
  excludedReal: number;
}

export function buildReport(input: { people: Person[]; formations: Formation[]; demoUserId: string | null; progress: Record<string, FormationProgress>; now?: Date }): ReportData {
  const today = madridDateKey(input.now);
  const active = input.people.filter((p) => p.status === 'activa' && !p.email.endsWith('@anonimizada.invalid'));
  const population = active.filter((p) => p.fictional || p.id === input.demoUserId);
  const excludedReal = active.length - population.length;

  const rows: ProgressRow[] = population.flatMap((person) =>
    input.formations.map((formation): ProgressRow => {
      const real = person.id === input.demoUserId;
      const progress = real ? input.progress[formation.id] : simulatedProgress(person, formation);
      return {
        personId: person.id,
        formation,
        status: formationStatus(progress, formation),
        attempts: (progress?.attempts ?? []).filter((x) => x.version === formation.version),
        origin: real ? 'real' : 'simulado',
      };
    }),
  );

  const byFormation = input.formations.map((formation): FormationParticipation => {
    const items = rows.filter((r) => r.formation.id === formation.id);
    const completed = items.filter((r) => r.status === 'completada').length;
    const notStarted = items.filter((r) => r.status === 'sin-empezar').length;
    return { formation, people: items.length, completed, inProgress: items.length - completed - notStarted, notStarted, rate: items.length ? completed / items.length : null };
  });

  const done = rows.filter((r) => r.status === 'completada');
  return {
    today,
    formations: input.formations,
    people: population.length,
    rows,
    byFormation,
    totals: { withCompleted: new Set(done.map((r) => r.personId)).size, completed: done.length },
    excludedReal,
  };
}

/** Errores frecuentes por pregunta con `commonErrors()` sobre los intentos (reales y simulados). */
export function errorsFor(report: ReportData, formation: Formation) {
  const attempts = report.rows.filter((r) => r.formation.id === formation.id).flatMap((r) => r.attempts);
  const realAttempts = report.rows.filter((r) => r.formation.id === formation.id && r.origin === 'real').reduce((n, r) => n + r.attempts.length, 0);
  return { attempts: attempts.length, realAttempts, passed: attempts.filter((a) => a.passed).length, questions: commonErrors(formation.quiz, attempts) };
}

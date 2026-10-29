/**
 * Informes restringidos de la demo.
 *
 * - La persona de la demostración aporta su progreso REAL (useDemo.progress).
 * - Las personas FICTICIAS reciben datos SIMULADOS y DETERMINISTAS (misma semilla → mismo
 *   resultado), rotulados «Datos simulados».
 * - Las personas REALES distintas de la de la demo se excluyen: nunca se inventa su progreso.
 *
 * La estructura replica la del servicio de informes de la API (byFormation, byPerson, rows)
 * y los CSV usan las mismas columnas.
 */
import {
  commonErrors,
  formationStatus,
  gradeQuiz,
  madridDateKey,
  STATUS_LABEL,
  type Assignment,
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

export interface ComplianceRow {
  person: Person;
  formation: Formation;
  dueDate: string | null;
  status: FormationStatus;
  completed: boolean;
  overdue: boolean;
  attempts: QuizAttempt[];
  origin: DataOrigin;
}

export interface ReportData {
  today: string;
  formations: Formation[];
  /** Asignaciones cuya formación aún no está publicada. */
  pendingAssignments: Assignment[];
  rows: ComplianceRow[];
  byFormation: { formation: Formation; target: string; dueDate: string | null; assigned: number; completed: number; pending: number; overdue: number; rate: number | null }[];
  byPerson: { person: Person; origin: DataOrigin; assigned: number; completed: number; pending: number; overdue: number; items: ComplianceRow[] }[];
  excludedReal: number;
}

export function buildReport(input: { people: Person[]; formations: Formation[]; assignments: Assignment[]; demoUserId: string | null; progress: Record<string, FormationProgress>; now?: Date }): ReportData {
  const today = madridDateKey(input.now);
  const active = input.people.filter((p) => p.status === 'activa' && !p.email.endsWith('@anonimizada.invalid'));
  const population = active.filter((p) => p.fictional || p.id === input.demoUserId);
  const excludedReal = active.length - population.length;
  const byId = new Map(input.formations.map((f) => [f.id, f]));

  // Pares persona–formación con la fecha límite más exigente.
  const pairs = new Map<string, { person: Person; formation: Formation; dueDate: string | null }>();
  for (const a of input.assignments) {
    const f = byId.get(a.formationId);
    if (!f) continue;
    const targets = a.target.kind === 'todos' ? population : population.filter((p) => a.target.kind === 'persona' && p.id === a.target.personId);
    for (const p of targets) {
      const key = `${p.id}|${f.id}`;
      const prev = pairs.get(key);
      const due = a.dueDate ?? null;
      if (!prev || (due && (!prev.dueDate || due < prev.dueDate))) pairs.set(key, { person: p, formation: f, dueDate: due });
    }
  }

  const rows: ComplianceRow[] = [...pairs.values()].map(({ person, formation, dueDate }) => {
    const real = person.id === input.demoUserId;
    const progress = real ? input.progress[formation.id] : simulatedProgress(person, formation);
    const status = formationStatus(progress, formation);
    const completed = status === 'completada';
    return {
      person,
      formation,
      dueDate,
      status,
      completed,
      overdue: !completed && !!dueDate && dueDate < today,
      attempts: (progress?.attempts ?? []).filter((x) => x.version === formation.version),
      origin: real ? 'real' : 'simulado',
    };
  });
  rows.sort((a, b) => a.person.name.localeCompare(b.person.name, 'es') || a.formation.title.localeCompare(b.formation.title, 'es'));

  const assignedFormations = input.formations.filter((f) => rows.some((r) => r.formation.id === f.id));
  const byFormation = assignedFormations
    .map((f) => {
      const items = rows.filter((r) => r.formation.id === f.id);
      const completed = items.filter((r) => r.completed).length;
      const as = input.assignments.filter((a) => a.formationId === f.id);
      const target = as.some((a) => a.target.kind === 'todos') ? 'Toda la firma' : `${items.length} ${items.length === 1 ? 'persona' : 'personas'}`;
      const dueDate = as.map((a) => a.dueDate).filter((d): d is string => !!d).sort()[0] ?? null;
      return { formation: f, target, dueDate, assigned: items.length, completed, pending: items.length - completed, overdue: items.filter((r) => r.overdue).length, rate: items.length ? completed / items.length : null };
    })
    .sort((a, b) => a.formation.title.localeCompare(b.formation.title, 'es'));

  const byPerson = population
    .map((p) => {
      const items = rows.filter((r) => r.person.id === p.id);
      return { person: p, origin: (p.id === input.demoUserId ? 'real' : 'simulado') as DataOrigin, assigned: items.length, completed: items.filter((r) => r.completed).length, pending: items.filter((r) => !r.completed).length, overdue: items.filter((r) => r.overdue).length, items };
    })
    .filter((p) => p.assigned > 0);

  return {
    today,
    formations: input.formations,
    pendingAssignments: input.assignments.filter((a) => !byId.has(a.formationId)),
    rows,
    byFormation,
    byPerson,
    excludedReal,
  };
}

/** Errores frecuentes por pregunta con `commonErrors()` sobre los intentos (reales y simulados). */
export function errorsFor(report: ReportData, formation: Formation) {
  const attempts = report.rows.filter((r) => r.formation.id === formation.id).flatMap((r) => r.attempts);
  const realAttempts = report.rows.filter((r) => r.formation.id === formation.id && r.origin === 'real').reduce((n, r) => n + r.attempts.length, 0);
  return { attempts: attempts.length, realAttempts, passed: attempts.filter((a) => a.passed).length, questions: commonErrors(formation.quiz, attempts) };
}

export const statusLabel = (s: FormationStatus) => STATUS_LABEL[s];

import { commonErrors, formationStatus, madridDateKey, plainText, STATUS_LABEL, type FormationProgress, type FormationStatus } from '@flm/shared';
import { all, type Db } from '../db/database';
import type { CsvValue } from '../lib/csv';
import type { AssignmentRow } from './assignments';
import { mergeDueDates } from './assignments';
import { listPublished, type ContentRow } from './content';
import { quizOf, toQuizAttempt, type AttemptRow } from './learning';
import { activeUsers } from './people';

/**
 * Informes de administración: cumplimiento de las formaciones obligatorias (por persona y por
 * formación) y errores frecuentes por pregunta con `commonErrors()`.
 */
export interface ComplianceRow {
  personId: string;
  personName: string;
  department: string;
  office: string;
  formationId: string;
  formationTitle: string;
  version: number;
  dueDate: string | null;
  status: FormationStatus;
  statusLabel: string;
  completed: boolean;
  completedAt: string | null;
  overdue: boolean;
  attempts: number;
}

export function complianceReport(db: Db, now: Date) {
  const today = madridDateKey(now);
  const formations = new Map(listPublished(db, ['formacion']).map((f) => [f.id, f]));
  const people = activeUsers(db);
  const assignments = all<AssignmentRow>(db, 'SELECT * FROM assignments');

  // Pares persona-formación con la fecha límite más exigente.
  const pairs = mergeDueDates(
    assignments.flatMap((a) => {
      if (!formations.has(a.content_id)) return [];
      const targets = a.target_kind === 'todos' ? people : people.filter((p) => p.id === a.person_id);
      return targets.map((p) => ({ key: `${p.id}|${a.content_id}`, dueDate: a.due_date, id: a.id }));
    }),
  );

  // Progreso en bloque (dos consultas) para no hacer una consulta por persona y formación.
  const reads = new Map<string, { version: number; read_at: string }[]>();
  for (const r of all<{ user_id: string; content_id: string; version: number; read_at: string }>(db, 'SELECT * FROM read_confirmations')) {
    const key = `${r.user_id}|${r.content_id}`;
    reads.set(key, [...(reads.get(key) ?? []), r]);
  }
  const attempts = new Map<string, AttemptRow[]>();
  for (const a of all<AttemptRow>(db, 'SELECT * FROM quiz_attempts WHERE user_id IS NOT NULL ORDER BY created_at')) {
    const key = `${a.user_id}|${a.content_id}`;
    attempts.set(key, [...(attempts.get(key) ?? []), a]);
  }
  const peopleById = new Map(people.map((p) => [p.id, p]));

  const rows: ComplianceRow[] = [];
  for (const [key, { dueDate }] of pairs) {
    const [personId = '', formationId = ''] = key.split('|');
    const person = peopleById.get(personId);
    const formation = formations.get(formationId);
    if (!person || !formation) continue;
    const userReads = reads.get(key) ?? [];
    const read = userReads.find((r) => r.version === formation.version) ?? userReads[0];
    const userAttempts = (attempts.get(key) ?? []).map(toQuizAttempt);
    const progress: FormationProgress = { formationId, ...(read ? { readAt: read.read_at, readVersion: read.version } : {}), attempts: userAttempts };
    const status = formationStatus(progress, { version: formation.version });
    const completed = status === 'completada';
    let completedAt: string | null = null;
    if (completed && progress.readAt) {
      const firstPass = userAttempts.find((a) => a.passed && a.version === formation.version)?.at ?? progress.readAt;
      completedAt = firstPass > progress.readAt ? firstPass : progress.readAt;
    }
    rows.push({
      personId,
      personName: person.name,
      department: person.department,
      office: person.office,
      formationId,
      formationTitle: formation.title,
      version: formation.version,
      dueDate,
      status,
      statusLabel: STATUS_LABEL[status],
      completed,
      completedAt,
      overdue: !completed && !!dueDate && dueDate < today,
      attempts: userAttempts.filter((a) => a.version === formation.version).length,
    });
  }
  rows.sort((a, b) => a.personName.localeCompare(b.personName, 'es') || a.formationTitle.localeCompare(b.formationTitle, 'es'));

  const byPerson = people
    .map((p) => {
      const items = rows.filter((r) => r.personId === p.id);
      return {
        personId: p.id,
        personName: p.name,
        department: p.department,
        office: p.office,
        assigned: items.length,
        completed: items.filter((r) => r.completed).length,
        pending: items.filter((r) => !r.completed).length,
        overdue: items.filter((r) => r.overdue).length,
        items,
      };
    })
    .filter((p) => p.assigned > 0);

  const byFormation = [...formations.values()]
    .map((f) => {
      const items = rows.filter((r) => r.formationId === f.id);
      const completed = items.filter((r) => r.completed).length;
      return {
        formationId: f.id,
        title: f.title,
        area: f.area,
        version: f.version,
        assigned: items.length,
        completed,
        pending: items.length - completed,
        overdue: items.filter((r) => r.overdue).length,
        completionRate: items.length ? Math.round((completed / items.length) * 100) : null,
      };
    })
    .filter((f) => f.assigned > 0)
    .sort((a, b) => a.title.localeCompare(b.title, 'es'));

  return { generatedAt: now.toISOString(), today, rows, byPerson, byFormation };
}

export function complianceCsv(report: ReturnType<typeof complianceReport>, view: 'personas' | 'formaciones'): { headers: string[]; rows: CsvValue[][] } {
  if (view === 'formaciones') {
    return {
      headers: ['Formación', 'Área', 'Versión', 'Asignadas', 'Completadas', 'Pendientes', 'Vencidas', '% completado'],
      rows: report.byFormation.map((f) => [f.title, f.area, f.version, f.assigned, f.completed, f.pending, f.overdue, f.completionRate]),
    };
  }
  return {
    headers: ['Persona', 'Departamento', 'Oficina', 'Formación', 'Versión', 'Estado', 'Completada', 'Fecha de finalización', 'Fecha límite', 'Vencida', 'Intentos'],
    rows: report.rows.map((r) => [
      r.personName,
      r.department,
      r.office,
      r.formationTitle,
      r.version,
      r.statusLabel,
      r.completed,
      r.completedAt?.slice(0, 10) ?? '',
      r.dueDate ?? '',
      r.overdue,
      r.attempts,
    ]),
  };
}

/** Errores frecuentes por pregunta en la versión vigente del test (incluye intentos ya anonimizados). */
export function commonErrorsReport(db: Db, row: ContentRow) {
  const quiz = quizOf(row);
  const attempts = all<AttemptRow>(db, 'SELECT * FROM quiz_attempts WHERE content_id = ? AND version = ?', row.id, row.version).map(toQuizAttempt);
  return {
    contentId: row.id,
    type: row.type,
    title: row.title,
    version: row.version,
    attempts: attempts.length,
    passed: attempts.filter((a) => a.passed).length,
    questions: commonErrors(quiz, attempts),
  };
}

export function commonErrorsCsv(report: ReturnType<typeof commonErrorsReport>): { headers: string[]; rows: CsvValue[][] } {
  return {
    headers: ['Pregunta', 'Enunciado', 'Respuestas', '% de error', 'Respuesta incorrecta más elegida'],
    rows: report.questions.map((q) => [q.questionId, plainText(q.prompt), q.responses, Math.round(q.errorRate * 100), q.mostChosenWrong ? plainText(q.mostChosenWrong) : '']),
  };
}

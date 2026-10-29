import { AREA_IDS, AREAS, commonErrors, formationStatus, isAreaId, plainText, type FormationProgress, type FormationStatus } from '@flm/shared';
import { all, type Db } from '../db/database';
import type { CsvValue } from '../lib/csv';
import { listPublished, type ContentRow } from './content';
import { quizOf, toQuizAttempt, type AttemptRow } from './learning';
import { activeUsers } from './people';

/**
 * Informes restringidos de administración. Las formaciones son voluntarias y el progreso de cada
 * persona es suyo: los informes solo dan recuentos agregados, sin nombres, correos ni datos por persona.
 * - Participación por formación (versión vigente), con el estado de `formationStatus()`.
 * - Errores frecuentes por pregunta, con `commonErrors()`.
 */

/** Estados «a medias»: leída, test intentado o test superado sin completar la formación. */
const IN_PROGRESS: ReadonlySet<FormationStatus> = new Set<FormationStatus>(['leida', 'test-intentado', 'test-superado']);

export interface ParticipationRow {
  formationId: string;
  title: string;
  area: string | null;
  version: number;
  /** Personas activas sobre las que se calcula. */
  people: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  /** Porcentaje (entero) de personas activas que la han completado; null si no hay ninguna activa. */
  completionRate: number | null;
}

const areaOrder = (area: string | null) => {
  const i = (AREA_IDS as readonly string[]).indexOf(area ?? '');
  return i === -1 ? AREA_IDS.length : i;
};

/**
 * Participación por formación publicada (versión vigente) sobre las personas activas: cuántas la han
 * completado, cuántas la tienen a medias y cuántas no la han empezado. Los totales dicen cuántas
 * personas han completado al menos una formación y cuántas formaciones se han completado en total.
 */
export function participationReport(db: Db, now: Date) {
  const people = activeUsers(db).map((u) => u.id);
  const formations = listPublished(db, ['formacion']);

  // Progreso en bloque (dos consultas), por «persona|formación», para no consultar par a par.
  const reads = new Map<string, { version: number; read_at: string }[]>();
  for (const r of all<{ user_id: string; content_id: string; version: number; read_at: string }>(db, 'SELECT user_id, content_id, version, read_at FROM read_confirmations')) {
    const key = `${r.user_id}|${r.content_id}`;
    reads.set(key, [...(reads.get(key) ?? []), r]);
  }
  const attempts = new Map<string, AttemptRow[]>();
  for (const a of all<AttemptRow>(db, 'SELECT * FROM quiz_attempts WHERE user_id IS NOT NULL')) {
    const key = `${a.user_id}|${a.content_id}`;
    attempts.set(key, [...(attempts.get(key) ?? []), a]);
  }

  const withCompleted = new Set<string>();
  const byFormation: ParticipationRow[] = formations.map((f) => {
    let completed = 0;
    let inProgress = 0;
    for (const personId of people) {
      const key = `${personId}|${f.id}`;
      const read = reads.get(key)?.find((r) => r.version === f.version);
      const progress: FormationProgress = {
        formationId: f.id,
        ...(read ? { readAt: read.read_at, readVersion: read.version } : {}),
        attempts: (attempts.get(key) ?? []).map(toQuizAttempt),
      };
      const status = formationStatus(progress, { version: f.version });
      if (status === 'completada') {
        completed++;
        withCompleted.add(personId);
      } else if (IN_PROGRESS.has(status)) {
        inProgress++;
      }
    }
    return {
      formationId: f.id,
      title: f.title,
      area: f.area,
      version: f.version,
      people: people.length,
      completed,
      inProgress,
      notStarted: people.length - completed - inProgress,
      completionRate: people.length ? Math.round((completed / people.length) * 100) : null,
    };
  });
  byFormation.sort((a, b) => areaOrder(a.area) - areaOrder(b.area) || a.title.localeCompare(b.title, 'es'));

  return {
    generatedAt: now.toISOString(),
    totals: {
      /** Personas activas. */
      people: people.length,
      /** Personas con al menos una formación completada. */
      peopleWithCompleted: withCompleted.size,
      /** Formaciones completadas en total (suma de la columna «Completada»). */
      completed: byFormation.reduce((n, f) => n + f.completed, 0),
    },
    byFormation,
  };
}

export function participationCsv(report: ReturnType<typeof participationReport>): { headers: string[]; rows: CsvValue[][] } {
  return {
    headers: ['Formación', 'Área', 'Versión', 'Personas', 'Completada', 'A medias', 'Sin empezar', '% completada'],
    rows: report.byFormation.map((f) => [
      f.title,
      isAreaId(f.area) ? AREAS[f.area].name : f.area,
      f.version,
      f.people,
      f.completed,
      f.inProgress,
      f.notStarted,
      f.completionRate,
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

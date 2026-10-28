import type { Assignment } from '@flm/shared';
import { z } from 'zod';
import { newId } from '../auth/tokens';
import type { AuthUser } from '../context';
import { all, get, isUniqueViolation, run, type Db } from '../db/database';
import { badRequest, conflict, notFound } from '../lib/errors';
import { dateKey, idParam } from '../lib/validation';
import { audit } from './audit';
import { getContent } from './content';
import { getUser } from './people';

/**
 * Formaciones obligatorias. Una asignación a «todos» se resuelve en cada consulta,
 * así que incluye automáticamente a las personas que se den de alta después.
 */
export interface AssignmentRow {
  id: string;
  content_id: string;
  target_kind: 'persona' | 'todos';
  person_id: string | null;
  due_date: string | null;
  assigned_by: string | null;
  assigned_at: string;
}

export const assignmentInput = z.object({
  formationId: idParam,
  target: z.discriminatedUnion('kind', [z.object({ kind: z.literal('persona'), personId: idParam }), z.object({ kind: z.literal('todos') })]),
  dueDate: dateKey.optional(),
});

export function toAssignment(r: AssignmentRow): Assignment {
  return {
    id: r.id,
    formationId: r.content_id,
    target: r.target_kind === 'todos' ? { kind: 'todos' } : { kind: 'persona', personId: r.person_id ?? '' },
    ...(r.due_date ? { dueDate: r.due_date } : {}),
    assignedBy: r.assigned_by ?? 'sistema',
    assignedAt: r.assigned_at,
  };
}

export function listAssignments(db: Db) {
  return all<AssignmentRow & { title: string | null; person_name: string | null }>(
    db,
    `SELECT a.*, c.title AS title, u.name AS person_name FROM assignments a
     LEFT JOIN contents c ON c.id = a.content_id LEFT JOIN users u ON u.id = a.person_id
     ORDER BY a.assigned_at DESC`,
  ).map((r) => ({ ...toAssignment(r), formationTitle: r.title, personName: r.person_name }));
}

export function createAssignment(db: Db, actor: AuthUser, input: z.output<typeof assignmentInput>, now: Date, ip?: string | null): Assignment {
  const formation = getContent(db, input.formationId);
  if (!formation || formation.type !== 'formacion') throw notFound('No existe ninguna formación con ese identificador.');
  if (formation.status !== 'publicado') throw conflict('Solo se pueden asignar formaciones publicadas.', 'FORMACION_NO_PUBLICADA');
  let personId: string | null = null;
  if (input.target.kind === 'persona') {
    const person = getUser(db, input.target.personId);
    if (!person || person.anonymized_at) throw notFound('No existe ninguna persona con ese identificador.');
    if (person.status !== 'activa') throw badRequest('No se pueden asignar formaciones a una cuenta desactivada.');
    personId = person.id;
  }
  const id = newId();
  try {
    run(
      db,
      'INSERT INTO assignments (id, content_id, target_kind, person_id, due_date, assigned_by, assigned_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      id,
      formation.id,
      input.target.kind,
      personId,
      input.dueDate ?? null,
      actor.id,
      now.toISOString(),
    );
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict('Esta formación ya está asignada a ese destinatario.', 'ASIGNACION_DUPLICADA');
    throw err;
  }
  audit(db, { actorId: actor.id, action: 'asignacion.crear', entity: 'asignacion', entityId: id, detail: `Formación ${formation.id} → ${input.target.kind === 'todos' ? 'todos' : `persona ${personId}`}`, ip }, now);
  return toAssignment(get<AssignmentRow>(db, 'SELECT * FROM assignments WHERE id = ?', id)!);
}

export function deleteAssignment(db: Db, actor: AuthUser, id: string, now: Date, ip?: string | null): void {
  if (run(db, 'DELETE FROM assignments WHERE id = ?', id) !== 1) throw notFound('No existe ninguna asignación con ese identificador.');
  audit(db, { actorId: actor.id, action: 'asignacion.eliminar', entity: 'asignacion', entityId: id, ip }, now);
}

/** Asignaciones que afectan a una persona (directas o a «todos»), con la fecha límite más exigente. */
export function dueDatesForUser(db: Db, userId: string): Map<string, { dueDate: string | null; assignmentIds: string[] }> {
  const rows = all<AssignmentRow>(db, "SELECT * FROM assignments WHERE target_kind = 'todos' OR person_id = ?", userId);
  return mergeDueDates(rows.map((r) => ({ key: r.content_id, dueDate: r.due_date, id: r.id })));
}

/** Combina asignaciones repetidas de la misma formación quedándose con la fecha límite más temprana. */
export function mergeDueDates(items: { key: string; dueDate: string | null; id: string }[]): Map<string, { dueDate: string | null; assignmentIds: string[] }> {
  const out = new Map<string, { dueDate: string | null; assignmentIds: string[] }>();
  for (const item of items) {
    const prev = out.get(item.key);
    if (!prev) {
      out.set(item.key, { dueDate: item.dueDate, assignmentIds: [item.id] });
      continue;
    }
    prev.assignmentIds.push(item.id);
    if (item.dueDate && (!prev.dueDate || item.dueDate < prev.dueDate)) prev.dueDate = item.dueDate;
  }
  return out;
}

import type { Assignment } from '@flm/shared';

/** Formaciones obligatorias asignadas en la demostración. */
export const assignments: Assignment[] = [
  { id: 'as-verifactu', formationId: 'fis-02', target: { kind: 'todos' }, dueDate: '2026-11-30', assignedBy: 'p-carme-soler', assignedAt: '2026-10-26' },
  { id: 'as-derivar', formationId: 'mer-01', target: { kind: 'todos' }, dueDate: '2026-11-20', assignedBy: 'p-carme-soler', assignedAt: '2026-10-26' },
  { id: 'as-boicac', formationId: 'con-01', target: { kind: 'persona', personId: 'p-judith-calet' }, dueDate: '2026-11-15', assignedBy: 'p-carme-soler', assignedAt: '2026-10-27' },
];

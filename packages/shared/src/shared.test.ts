import { describe, expect, it } from 'vitest';
import { entriesForMonth, monthGrid } from './calendar';
import { addMonthsClamped, fromMadrid, madridDateKey } from './dates';
import { eventPhase, eventToIcs, nextSession } from './events';
import { can, checkTransition, isCorporateEmail } from './permissions';
import { formationStatus, gradeQuiz } from './progress';
import { normalize, slugify } from './text';
import type { CampusEvent, Quiz } from './types';

const editorial = { status: 'publicado' as const, authorId: 'a', review: { state: 'revisado' as const } };
const baseEvent = (patch: Partial<CampusEvent>): CampusEvent => ({
  id: 'e1',
  slug: 'e1',
  kind: 'evento',
  category: 'formacion-interna',
  title: 'Evento',
  summary: 'Resumen',
  icon: 'calendario',
  sessions: [],
  editorial,
  ...patch,
});

describe('fechas en Europe/Madrid', () => {
  it('convierte hora local de invierno (UTC+1) y de verano (UTC+2)', () => {
    expect(fromMadrid('2026-01-15T10:00').toISOString()).toBe('2026-01-15T09:00:00.000Z');
    expect(fromMadrid('2026-07-15T10:00').toISOString()).toBe('2026-07-15T08:00:00.000Z');
  });
  it('resuelve el cambio de hora de octubre (25/10/2026)', () => {
    expect(fromMadrid('2026-10-24T12:00').toISOString()).toBe('2026-10-24T10:00:00.000Z');
    expect(fromMadrid('2026-10-26T12:00').toISOString()).toBe('2026-10-26T11:00:00.000Z');
  });
  it('obtiene el día de Madrid aunque en UTC sea otro', () => {
    expect(madridDateKey(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
  });
  it('suma meses respetando el último día', () => {
    expect(addMonthsClamped('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsClamped('2026-12-31', 3)).toBe('2027-03-31');
  });
});

describe('ciclo de vida de eventos', () => {
  const now = fromMadrid('2026-10-28T12:00');
  it('un evento sin fecha confirmada sigue entre los próximos', () => {
    expect(eventPhase(baseEvent({ sessions: [] }), now)).toBe('proximo');
  });
  it('un evento con varias sesiones pasa al histórico tras la última', () => {
    const ev = baseEvent({ sessions: [{ start: '2026-10-20T16:00', end: '2026-10-20T18:00' }, { start: '2026-11-03T16:00', end: '2026-11-03T18:00' }] });
    expect(eventPhase(ev, now)).toBe('en-curso');
    expect(nextSession(ev, now)?.start).toBe('2026-11-03T16:00');
    expect(eventPhase(ev, fromMadrid('2026-11-03T18:01'))).toBe('historico');
  });
  it('un evento de un día termina al final de ese día en Madrid', () => {
    const ev = baseEvent({ sessions: [{ start: '2026-10-28' }] });
    expect(eventPhase(ev, fromMadrid('2026-10-28T23:00'))).toBe('en-curso');
    expect(eventPhase(ev, fromMadrid('2026-10-29T00:00'))).toBe('historico');
  });
  it('la reclasificación manual prevalece y archivado no es lo mismo que histórico', () => {
    const past = baseEvent({ sessions: [{ start: '2026-01-10' }] });
    expect(eventPhase({ ...past, manualPhase: 'proximo' }, now)).toBe('proximo');
    expect(eventPhase({ ...past, archived: true }, now)).toBe('archivado');
  });
  it('exporta .ics con zona Europe/Madrid', () => {
    const ics = eventToIcs(baseEvent({ sessions: [{ start: '2026-11-03T16:00', end: '2026-11-03T18:00' }] }), now);
    expect(ics).toContain('DTSTART;TZID=Europe/Madrid:20261103T160000');
    expect(ics).toContain('BEGIN:VTIMEZONE');
  });
});

describe('calendario', () => {
  const navidad = { date: '2026-12-25', name: 'Navidad', scope: 'nacional' as const, offices: [], source: 'https://www.boe.es' };
  it('solo genera encuentros de equipo y festivos, sin fechas personales', () => {
    const comida = baseEvent({ title: 'Comida de Navidad', sessions: [{ start: '2026-12-16T14:00' }] });
    const list = entriesForMonth(2026, 12, { holidays: [navidad], events: [comida] });
    expect(list.map((e) => e.kind)).toEqual(['encuentro', 'festivo']);
    expect(list[0]).toMatchObject({ date: '2026-12-16', title: 'Comida de Navidad', eventId: 'e1', time: '14:00' });
  });
  it('muestra los festivos como «Festivo»', () => {
    const list = entriesForMonth(2026, 12, { holidays: [navidad], events: [] });
    expect(list[0]).toMatchObject({ title: 'Festivo', detail: 'Navidad' });
  });
  it('construye la cuadrícula empezando en lunes', () => {
    const grid = monthGrid(2026, 11);
    expect(grid[0]?.slice(0, 6).every((c) => c === null)).toBe(true);
    expect(grid[0]?.[6]).toBe('2026-11-01');
  });
});

describe('progreso de aprendizaje', () => {
  const quiz: Quiz = {
    id: 'q',
    title: 'Test',
    passMark: 2,
    questions: ['a', 'b', 'c'].map((id) => ({ id, prompt: id, options: [{ id: '1', text: '1' }, { id: '2', text: '2', feedback: 'no' }, { id: '3', text: '3', feedback: 'no' }], correctOptionId: '1', explanation: 'x' })),
  };
  it('aprueba con 2 de 3', () => {
    expect(gradeQuiz(quiz, { a: '1', b: '1', c: '2' })).toMatchObject({ correct: 2, passed: true });
    expect(gradeQuiz(quiz, { a: '1', b: '2', c: '2' })).toMatchObject({ correct: 1, passed: false });
  });
  it('distingue leída, intentada, superada y completada', () => {
    const f = { version: 1 };
    const attempt = (passed: boolean) => ({ id: 'x', quizId: 'q', version: 1, at: '2026-10-01', answers: {}, correct: passed ? 3 : 1, total: 3, passed });
    expect(formationStatus(undefined, f)).toBe('sin-empezar');
    expect(formationStatus({ formationId: 'f', readAt: 'x', readVersion: 1, attempts: [] }, f)).toBe('leida');
    expect(formationStatus({ formationId: 'f', attempts: [attempt(false)] }, f)).toBe('test-intentado');
    expect(formationStatus({ formationId: 'f', attempts: [attempt(true)] }, f)).toBe('test-superado');
    expect(formationStatus({ formationId: 'f', readAt: 'x', readVersion: 1, attempts: [attempt(true)] }, f)).toBe('completada');
    expect(formationStatus({ formationId: 'f', readAt: 'x', readVersion: 1, attempts: [attempt(true)] }, { version: 2 })).toBe('sin-empezar');
  });
});

describe('permisos y flujo editorial', () => {
  it('solo administración publica', () => {
    expect(can('autor', 'contenido:publicar')).toBe(false);
    expect(can('admin', 'contenido:publicar')).toBe(true);
    expect(checkTransition('autor', 'publicar', 'en-revision', true).ok).toBe(false);
    expect(checkTransition('admin', 'publicar', 'en-revision', false)).toMatchObject({ ok: true, to: 'publicado' });
  });
  it('un autor solo envía sus propios borradores', () => {
    expect(checkTransition('autor', 'enviar', 'borrador', true).ok).toBe(true);
    expect(checkTransition('autor', 'enviar', 'borrador', false).ok).toBe(false);
  });
  it('archivado y restauración', () => {
    expect(checkTransition('admin', 'archivar', 'publicado', false).to).toBe('archivado');
    expect(checkTransition('admin', 'restaurar', 'archivado', false).to).toBe('publicado');
    expect(checkTransition('admin', 'archivar', 'borrador', false).ok).toBe(false);
  });
  it('exige correo corporativo', () => {
    expect(isCorporateEmail('nombre@flmexperts.com')).toBe(true);
    expect(isCorporateEmail('nombre@gmail.com')).toBe(false);
  });
});

describe('texto', () => {
  it('normaliza tildes y conserva la ñ', () => {
    expect(normalize('Ámbito ESPAÑOL')).toBe('ambito español');
    expect(slugify('Cuándo derivar a Mercantil')).toBe('cuando-derivar-a-mercantil');
  });
});

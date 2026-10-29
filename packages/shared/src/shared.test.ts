import { describe, expect, it } from 'vitest';
import { computeBadges } from './badges';
import { entriesForMonth, monthGrid } from './calendar';
import { addMonthsClamped, fromMadrid, madridDateKey } from './dates';
import { eventPhase, eventToIcs, nextSession } from './events';
import { assessmentClashReason, can, canHandleType, checkTransition, CREATABLE_TYPES, isCorporateEmail, ROLE_PERMISSIONS, STATUS_LABEL_EDITORIAL } from './permissions';
import { birthdayKey, birthdayLabel, isValidBirthday, isValidDateKey, latestStartDate, missingPersonalDates, startDateLimitIssue } from './personalDates';
import { formationStatus, gradeQuiz } from './progress';
import { blockSchema, editorialSchema, newClientSchema, passwordChecks, passwordInput, personalDatesSchema, welcomeSchema } from './schemas';
import { countryCode } from './countries';
import { normalize, slugify } from './text';
import type { CampusEvent, Person, Quiz } from './types';

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
const person = (patch: Partial<Person>): Person => ({
  id: 'p-ficticia',
  email: 'ficticia@flmexperts.com',
  name: 'Persona Ficticia',
  position: 'Asesora',
  department: 'Fiscal',
  office: 'Vic',
  role: 'empleado',
  status: 'activa',
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
  it('sin personas, solo encuentros de equipo y festivos', () => {
    const comida = baseEvent({ title: 'Comida de Navidad', sessions: [{ start: '2026-12-16T14:00' }] });
    const list = entriesForMonth(2026, 12, { holidays: [navidad], events: [comida] });
    expect(list.map((e) => e.kind)).toEqual(['encuentro', 'festivo']);
    expect(list[0]).toMatchObject({ date: '2026-12-16', title: 'Comida de Navidad', eventId: 'e1', time: '14:00' });
  });
  it('cumpleaños cada año y aniversario desde el año siguiente a la incorporación, calculados desde el perfil', () => {
    const judith = person({ id: 'p-judith-calet', name: 'Judith Calet', position: 'Asesora Contable', birthday: '11-26', startDate: '2026-09-01' });
    const nov = (year: number) => entriesForMonth(year, 11, { holidays: [], events: [], people: [judith] });
    const sep = (year: number) => entriesForMonth(year, 9, { holidays: [], events: [], people: [judith] });
    expect(nov(2026)).toEqual([{ id: 'cumple-p-judith-calet-2026', date: '2026-11-26', kind: 'cumpleanos', title: 'Cumpleaños de Judith Calet', detail: 'Asesora Contable', personId: 'p-judith-calet' }]);
    expect(nov(2031)[0]).toMatchObject({ date: '2031-11-26', kind: 'cumpleanos' });
    // El año de la incorporación no hay aniversario; el primero es el 1 de septiembre de 2027
    expect(sep(2026)).toEqual([]);
    expect(sep(2027)[0]).toMatchObject({ id: 'aniv-p-judith-calet-2027', date: '2027-09-01', kind: 'aniversario', years: 1, detail: '1 año en FLM · desde el 1 de septiembre de 2026' });
    expect(sep(2030)[0]).toMatchObject({ date: '2030-09-01', years: 4, detail: '4 años en FLM · desde el 1 de septiembre de 2026' });
  });
  it('sin duplicados, sin perfiles inactivos y al día con los cambios del perfil', () => {
    const p = person({ birthday: '03-14' });
    expect(entriesForMonth(2027, 3, { holidays: [], events: [], people: [p, p] })).toHaveLength(1);
    expect(entriesForMonth(2027, 3, { holidays: [], events: [], people: [{ ...p, status: 'inactiva' }] })).toEqual([]);
    expect(entriesForMonth(2027, 3, { holidays: [], events: [], people: [person({})] })).toEqual([]);
    // Cambiar el cumpleaños mueve la entrada: no queda la anterior
    const moved = { ...p, birthday: '04-02' };
    expect(entriesForMonth(2027, 3, { holidays: [], events: [], people: [moved] })).toEqual([]);
    expect(entriesForMonth(2027, 4, { holidays: [], events: [], people: [moved] })[0]).toMatchObject({ date: '2027-04-02' });
  });
  it('el 29 de febrero se celebra el 28 en los años no bisiestos', () => {
    const p = person({ birthday: '02-29', startDate: '2024-02-29' });
    expect(entriesForMonth(2027, 2, { holidays: [], events: [], people: [p] }).map((e) => [e.kind, e.date])).toEqual([
      ['cumpleanos', '2027-02-28'],
      ['aniversario', '2027-02-28'],
    ]);
    expect(entriesForMonth(2028, 2, { holidays: [], events: [], people: [p] }).map((e) => e.date)).toEqual(['2028-02-29', '2028-02-29']);
  });
  it('valida el cumpleaños sin año y la fecha completa de incorporación', () => {
    expect(['11-26', '02-29', '12-31'].every(isValidBirthday)).toBe(true);
    expect(['02-30', '13-01', '1126', '26-11', '', undefined].some((v) => isValidBirthday(v))).toBe(false);
    expect(isValidDateKey('2026-09-01')).toBe(true);
    expect(['2026-02-29', '2026-13-01', '01-09-2026', '2026-9-1'].some((v) => isValidDateKey(v))).toBe(false);
    expect(birthdayLabel('11-26')).toBe('26 de noviembre');
    expect(birthdayKey(26, 11)).toBe('11-26');
    expect(missingPersonalDates({ birthday: '11-26' })).toEqual(['startDate']);
    expect(personalDatesSchema.safeParse({ birthday: '11-26', startDate: '2026-09-01' }).success).toBe(true);
    expect(personalDatesSchema.safeParse({ birthday: '11-26' }).success).toBe(false);
  });
  it('la incorporación admite altas previstas hasta un año vista (el mismo tope en la web y en la API)', () => {
    expect(latestStartDate('2026-10-29')).toBe('2027-10-29');
    // Un 29 de febrero como «hoy» deja el tope en el 28 del año siguiente, que no es bisiesto
    expect(latestStartDate('2028-02-29')).toBe('2029-02-28');
    expect(startDateLimitIssue('2027-10-29', '2026-10-29')).toBeNull();
    expect(startDateLimitIssue('2062-09-01', '2026-10-29')).toBe('La fecha de incorporación no puede ser posterior al 29 de octubre de 2027.');
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
  it('el reconocimiento de una evaluación superada se conserva aunque se archive o se sustituya', () => {
    const assessment = (id: string) => ({ id, area: 'fiscal' as const, title: 'Fiscal', intro: '', quiz: { ...quiz, id: `quiz-${id}` } });
    const passed = { id: 'i', quizId: 'quiz-vieja', version: 1, at: '2026-10-01', answers: {}, correct: 9, total: 10, passed: true };
    const input = { formations: [], progress: {}, assessmentAttempts: { vieja: [passed] }, publishedByPerson: 0 };
    // La vigente es la nueva (sin intentos); la archivada es la que se superó
    const badges = computeBadges({ ...input, assessments: [assessment('nueva'), assessment('vieja')] });
    expect(badges.find((b) => b.id === 'evaluacion-fiscal')).toMatchObject({ mark: '9/10', earnedAt: '2026-10-01' });
    expect(computeBadges({ ...input, assessments: [assessment('nueva')] }).some((b) => b.id === 'evaluacion-fiscal')).toBe(false);
  });
});

describe('permisos y flujo editorial', () => {
  it('la autoría publica lo suyo, nunca lo de otra persona; administración publica cualquier contenido', () => {
    expect(can('autor', 'contenido:publicar')).toBe(true);
    expect(can('empleado', 'contenido:publicar')).toBe(false);
    expect(checkTransition('autor', 'publicar', 'borrador', true)).toMatchObject({ ok: true, to: 'publicado' });
    expect(checkTransition('autor', 'publicar', 'borrador', false)).toMatchObject({ ok: false, code: 'propiedad' });
    expect(checkTransition('admin', 'publicar', 'borrador', false)).toMatchObject({ ok: true, to: 'publicado' });
    expect(checkTransition('empleado', 'publicar', 'borrador', true)).toMatchObject({ ok: false, code: 'permiso' });
  });
  it('solo dos estados de trabajo: guardar un borrador y publicarlo (sin revisión previa)', () => {
    expect(checkTransition('autor', 'guardar', 'borrador', true)).toMatchObject({ ok: true, to: 'borrador' });
    expect(checkTransition('autor', 'guardar', 'borrador', false)).toMatchObject({ ok: false, code: 'propiedad' });
    expect(checkTransition('admin', 'guardar', 'borrador', false).ok).toBe(true);
    expect(checkTransition('admin', 'publicar', 'publicado', false)).toMatchObject({ ok: false, code: 'estado' });
    expect(STATUS_LABEL_EDITORIAL).toEqual({ borrador: 'Borrador', publicado: 'Publicado', archivado: 'Archivado' });
    const all = Object.values(ROLE_PERMISSIONS).flatMap((set) => [...set]);
    expect(all.filter((p) => /revision|devolver/.test(p))).toEqual([]);
  });
  it('archivar y restaurar es cosa de administración', () => {
    expect(checkTransition('admin', 'archivar', 'publicado', false).to).toBe('archivado');
    expect(checkTransition('admin', 'restaurar', 'archivado', false).to).toBe('publicado');
    expect(checkTransition('admin', 'archivar', 'borrador', false)).toMatchObject({ ok: false, code: 'estado' });
    expect(checkTransition('autor', 'archivar', 'publicado', true)).toMatchObject({ ok: false, code: 'permiso' });
    expect(checkTransition('autor', 'restaurar', 'archivado', true)).toMatchObject({ ok: false, code: 'permiso' });
  });
  it('autoría crea siete tipos, incluidos clientes y bienvenidas; la evaluación del área es de administración', () => {
    expect(CREATABLE_TYPES.empleado).toEqual([]);
    expect(CREATABLE_TYPES.autor).toEqual(expect.arrayContaining(['formacion', 'noticia', 'documento', 'evento', 'comunicado', 'cliente', 'bienvenida']));
    expect(CREATABLE_TYPES.autor).not.toContain('test');
    expect(CREATABLE_TYPES.admin).toEqual(expect.arrayContaining(['formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado', 'cliente', 'bienvenida']));
    expect(can('autor', 'datos-personales:eliminar')).toBe(false);
    expect(can('admin', 'datos-personales:eliminar')).toBe(true);
  });
  it('el tipo se comprueba en cada acción: la evaluación del área, solo administración', () => {
    expect(canHandleType('admin', 'test')).toBe(true);
    expect(canHandleType('autor', 'test')).toBe(false);
    expect(canHandleType('autor', 'formacion')).toBe(true);
    expect(canHandleType('empleado', 'noticia')).toBe(false);
  });
  it('una evaluación vigente por área: el mismo motivo en la demo y en la API', () => {
    expect(assessmentClashReason('Fiscal', 'publicado', 'publicar')).toBe('El área Fiscal ya tiene su evaluación publicada. Edítala en lugar de publicar otra, o archívala antes.');
    expect(assessmentClashReason('Fiscal', 'publicado', 'restaurar')).toBe('El área Fiscal ya tiene otra evaluación publicada. Archívala antes de restaurar esta.');
    expect(assessmentClashReason('Laboral', 'borrador', 'preparar')).toBe('El área Laboral ya tiene un borrador de evaluación. Sigue con ese borrador en lugar de preparar otra.');
    expect(assessmentClashReason('Laboral', 'borrador', 'restaurar')).toContain('Elimínalo antes de restaurar esta');
  });
  it('exige correo corporativo', () => {
    expect(isCorporateEmail('nombre@flmexperts.com')).toBe(true);
    expect(isCorporateEmail('nombre@gmail.com')).toBe(false);
  });
});

describe('esquemas del creador', () => {
  it('el estado «en revisión» ya no existe', () => {
    expect(editorialSchema.safeParse({ status: 'en-revision', authorId: 'a', review: { state: 'pendiente' } }).success).toBe(false);
    expect(editorialSchema.safeParse({ status: 'borrador', authorId: 'a', review: { state: 'pendiente' } }).success).toBe(true);
  });
  it('los encabezados admiten subapartados de nivel 3', () => {
    expect(blockSchema.safeParse({ type: 'heading', text: 'Plazos', level: 3 }).success).toBe(true);
    expect(blockSchema.safeParse({ type: 'heading', text: 'Plazos', level: 4 }).success).toBe(false);
  });
  it('nuevo cliente: país de la lista común y bienvenida sin datos de la persona', () => {
    const editorial = { status: 'borrador' as const, authorId: 'a', review: { state: 'pendiente' as const } };
    const client = { id: 'c', name: 'Empresa', sector: 'Software', country: 'Suecia', area: 'mercantil', date: '2026-10-29', editorial };
    expect(newClientSchema.safeParse(client).success).toBe(true);
    expect(newClientSchema.safeParse({ ...client, country: 'Narnia' }).success).toBe(false);
    expect(countryCode('Suecia')).toBe('SE');
    const welcome = { id: 'w', personId: 'p', date: '2026-10-29', message: 'Bienvenida al equipo.', editorial };
    expect(welcomeSchema.safeParse(welcome).success).toBe(true);
    expect(welcomeSchema.safeParse({ ...welcome, name: 'Nombre Apellido' }).success).toBe(false);
  });
});

describe('texto', () => {
  it('normaliza tildes y conserva la ñ', () => {
    expect(normalize('Ámbito ESPAÑOL')).toBe('ambito español');
    expect(slugify('Cuándo derivar a Mercantil')).toBe('cuando-derivar-a-mercantil');
  });
});

describe('contraseña', () => {
  it('los requisitos que ve la persona son los mismos que valida la API', () => {
    for (const p of ['corta1', 'solamenteletras', '123456789012', 'DoceCaracteres1', 'añoBisiesto2028']) {
      const c = passwordChecks(p);
      expect(passwordInput.safeParse(p).success, p).toBe(c.length && c.lettersAndNumbers);
    }
    expect(passwordChecks('DoceCaracteres1')).toEqual({ length: true, lettersAndNumbers: true });
    expect(passwordChecks('123456789012')).toEqual({ length: true, lettersAndNumbers: false });
  });
});

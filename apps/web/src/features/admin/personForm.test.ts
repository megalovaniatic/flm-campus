import { describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import type { Person } from '@flm/shared';
import {
  auditFields,
  birthdayDaysIn,
  birthdayExists,
  birthdayFromParts,
  birthdayIssue,
  calendarParts,
  canEditOwnStartDate,
  emptyPersonForm,
  matchesCalendarFilter,
  missingText,
  newPersonFrom,
  personIdFor,
  personPatch,
  personToForm,
  startDateIssue,
  validateOwnDates,
  validatePersonForm,
  type PersonForm,
} from './personForm';

const TODAY = '2026-10-29';

const filled = (extra: Partial<PersonForm> = {}): PersonForm => ({
  ...emptyPersonForm(),
  name: 'Ana Pérez Gómez',
  email: 'ana.perez@flmexperts.com',
  position: 'Asesora fiscal',
  department: 'Fiscal',
  office: 'Vic',
  role: 'empleado',
  birthdayDay: '14',
  birthdayMonth: '3',
  startDate: '2026-11-02',
  ...extra,
});

const fieldsOf = (form: PersonForm, editing?: Person) => validatePersonForm(form, { people: seed.people, editing, today: TODAY }).map((i) => i.field);
const sara = seed.people.find((p) => p.id === 'p-sara-lopez')!;
const judith = seed.people.find((p) => p.id === 'p-judith-calet')!;

describe('alta de una persona: obligatorios', () => {
  it('un formulario vacío pide todo, en el orden de los campos, también el cumpleaños y la fecha de incorporación', () => {
    expect(fieldsOf(emptyPersonForm())).toEqual(['name', 'email', 'position', 'department', 'office', 'birthday', 'startDate']);
    const issues = validatePersonForm(emptyPersonForm(), { people: seed.people, today: TODAY });
    expect(issues.find((i) => i.field === 'birthday')?.message).toBe('Indica el día y el mes del cumpleaños (sin el año de nacimiento).');
    expect(issues.find((i) => i.field === 'startDate')?.message).toBe('Indica la fecha completa de incorporación a FLM: día, mes y año.');
  });

  it('completo y válido, no hay errores; el año de nacimiento no se pide nunca', () => {
    expect(fieldsOf(filled())).toEqual([]);
    expect(Object.keys(emptyPersonForm())).not.toContain('birthYear');
  });

  it('el correo ha de ser corporativo y no repetirse (sin distinguir mayúsculas)', () => {
    const corporate = validatePersonForm(filled({ email: 'ana@gmail.com' }), { people: seed.people, today: TODAY });
    expect(corporate).toEqual([{ field: 'email', message: 'Usa el correo corporativo: tiene que terminar en @flmexperts.com.' }]);
    expect(fieldsOf(filled({ email: '  Judith.Calet@FLMexperts.com ' }))).toEqual(['email']);
  });

  it('solo el día o solo el mes no bastan', () => {
    expect(birthdayIssue('26', '', true)).toBe('Elige también el mes del cumpleaños.');
    expect(birthdayIssue('', '11', true)).toBe('Elige también el día del cumpleaños.');
    expect(fieldsOf(filled({ birthdayMonth: '' }))).toEqual(['birthday']);
  });
});

describe('cumpleaños: día y mes que existan, el 29 de febrero también', () => {
  it('los selectores solo admiten días que existen en el mes elegido', () => {
    expect(birthdayDaysIn('2')).toBe(29);
    expect(birthdayDaysIn('4')).toBe(30);
    expect(birthdayDaysIn('11')).toBe(30);
    expect(birthdayDaysIn('')).toBe(31);
    expect(birthdayExists('31', '4')).toBe(false);
    expect(birthdayExists('30', '2')).toBe(false);
    expect(birthdayExists('29', '2')).toBe(true);
    expect(birthdayExists('31', '')).toBe(true);
  });

  it('una fecha imposible no se guarda y se explica', () => {
    expect(birthdayFromParts('31', '4')).toBeUndefined();
    expect(birthdayIssue('31', '4', true)).toBe('El 31 de abril no existe: elige otro día.');
    expect(birthdayIssue('30', '2', true)).toBe('El 30 de febrero no existe: elige otro día.');
  });

  it('el 29 de febrero es un cumpleaños válido', () => {
    expect(birthdayFromParts('29', '2')).toBe('02-29');
    expect(fieldsOf(filled({ birthdayDay: '29', birthdayMonth: '2' }))).toEqual([]);
  });

  it('se guarda como «MM-DD», sin año: el 26 de noviembre es «11-26»', () => {
    const person = newPersonFrom(filled({ birthdayDay: '26', birthdayMonth: '11' }), []);
    expect(person.birthday).toBe('11-26');
  });
});

describe('fecha de incorporación: completa y que exista', () => {
  it('pide día, mes y año, y que la fecha exista', () => {
    expect(startDateIssue('2026-09', true, TODAY)).toBe('Indica una fecha de incorporación que exista, con día, mes y año.');
    expect(startDateIssue('2026-02-29', true, TODAY)).toBe('Indica una fecha de incorporación que exista, con día, mes y año.');
    expect(startDateIssue('2024-02-29', true, TODAY)).toBeUndefined();
    expect(startDateIssue('2026-09-01', true, TODAY)).toBeUndefined();
  });

  it('admite altas previstas hasta un año vista, no erratas de décadas', () => {
    expect(startDateIssue('2027-10-29', true, TODAY)).toBeUndefined();
    expect(startDateIssue('2062-09-01', true, TODAY)).toBe('La fecha de incorporación no puede ser posterior al 29 de octubre de 2027.');
  });
});

describe('ficha nueva', () => {
  it('activa, con correo en minúsculas, id estable sin repetir y sus dos fechas', () => {
    const person = newPersonFrom(filled({ email: 'Ana.Perez@flmexperts.com', name: '  Ana   Pérez Gómez ' }), ['p-ana-perez-gomez']);
    expect(person).toEqual({
      id: 'p-ana-perez-gomez-2',
      email: 'ana.perez@flmexperts.com',
      name: 'Ana Pérez Gómez',
      position: 'Asesora fiscal',
      department: 'Fiscal',
      office: 'Vic',
      role: 'empleado',
      status: 'activa',
      birthday: '03-14',
      startDate: '2026-11-02',
    });
    expect(personIdFor('Núria Roca', [])).toBe('p-nuria-roca');
  });

  it('sin validar no se crea', () => {
    expect(() => newPersonFrom(emptyPersonForm(), [])).toThrow();
  });
});

describe('editar una ficha o completar sus datos', () => {
  it('un perfil anterior sin fechas se puede guardar sin inventarlas (no bloquea nada)', () => {
    expect(missingText(sara)).toBe('Faltan el cumpleaños y la fecha de incorporación');
    const form = { ...personToForm(sara), position: 'Asesora fiscal sénior' };
    expect(fieldsOf(form, sara)).toEqual([]);
    expect(personPatch(sara, form)).toEqual({ position: 'Asesora fiscal sénior' });
  });

  it('completar solo el cumpleaños deja la incorporación sin indicar', () => {
    const form = { ...personToForm(sara), birthdayDay: '2', birthdayMonth: '4' };
    expect(personPatch(sara, form)).toEqual({ birthday: '04-02' });
    expect(missingText({ ...sara, birthday: '04-02' })).toBe('Falta la fecha de incorporación');
  });

  it('lo que ya consta se corrige, pero no se vacía', () => {
    expect(fieldsOf({ ...personToForm(judith), birthdayDay: '', birthdayMonth: '' }, judith)).toEqual(['birthday']);
    expect(fieldsOf({ ...personToForm(judith), startDate: '' }, judith)).toEqual(['startDate']);
    expect(personPatch(judith, { ...personToForm(judith), birthdayDay: '27' })).toEqual({ birthday: '11-27' });
  });

  it('sin cambios, no hay nada que guardar; la auditoría nombra los campos, no los valores', () => {
    expect(personPatch(judith, personToForm(judith))).toEqual({});
    expect(auditFields({ position: 'x', birthday: '04-02', startDate: '2026-09-01' })).toBe('Campos: puesto, cumpleaños, fecha de incorporación');
  });

  it('el correo propio no cuenta como repetido', () => {
    expect(fieldsOf(personToForm(judith), judith)).toEqual([]);
  });
});

describe('autoservicio desde el perfil o los ajustes', () => {
  it('la persona completa lo que falta, uno o los dos', () => {
    expect(validateOwnDates({ birthdayDay: '26', birthdayMonth: '11', startDate: '' }, sara, TODAY)).toEqual({ issues: [], patch: { birthday: '11-26' } });
    expect(validateOwnDates({ birthdayDay: '26', birthdayMonth: '11', startDate: '2025-03-03' }, sara, TODAY).patch).toEqual({ birthday: '11-26', startDate: '2025-03-03' });
    expect(validateOwnDates({ birthdayDay: '', birthdayMonth: '', startDate: '' }, sara, TODAY)).toEqual({ issues: [], patch: {} });
  });

  it('puede corregir su cumpleaños; la fecha de incorporación que ya consta solo la cambia administración', () => {
    expect(canEditOwnStartDate(judith)).toBe(false);
    expect(canEditOwnStartDate(sara)).toBe(true);
    expect(validateOwnDates({ birthdayDay: '25', birthdayMonth: '11', startDate: '2020-01-01' }, judith, TODAY)).toEqual({ issues: [], patch: { birthday: '11-25' } });
  });

  it('no admite fechas imposibles ni vaciar el cumpleaños que ya consta', () => {
    expect(validateOwnDates({ birthdayDay: '31', birthdayMonth: '11', startDate: '' }, sara, TODAY).issues).toEqual([{ field: 'birthday', message: 'El 31 de noviembre no existe: elige otro día.' }]);
    expect(validateOwnDates({ birthdayDay: '', birthdayMonth: '', startDate: '' }, judith, TODAY).issues.map((i) => i.field)).toEqual(['birthday']);
  });
});

describe('confirmaciones: qué aparecerá en el calendario', () => {
  it('el cumpleaños cada año y el aniversario desde que se cumple el primero', () => {
    expect(calendarParts(judith, 'su')).toEqual(['su cumpleaños (cada 26 de noviembre)', 'su aniversario en FLM (cada año desde el 1 de septiembre de 2027)']);
    expect(calendarParts({ birthday: '02-29', startDate: '2024-02-29' }, 'tu')).toEqual(['tu cumpleaños (cada 29 de febrero, el 28 los años no bisiestos)', 'tu aniversario en FLM (cada año desde el 28 de febrero de 2025)']);
    expect(calendarParts({}, 'su')).toEqual([]);
  });
});

describe('filtro de datos del calendario', () => {
  it('separa los perfiles completos de los incompletos', () => {
    expect(matchesCalendarFilter(judith, 'completos')).toBe(true);
    expect(matchesCalendarFilter(judith, 'incompletos')).toBe(false);
    expect(matchesCalendarFilter(sara, 'incompletos')).toBe(true);
    expect(matchesCalendarFilter(sara, '')).toBe(true);
    expect(seed.people.filter((p) => matchesCalendarFilter(p, 'completos')).map((p) => p.id)).toEqual(['p-judith-calet']);
  });
});

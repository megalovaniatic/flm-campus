import { beforeEach, describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import { entriesForMonth, missingPersonalDates, type CalendarEntry } from '@flm/shared';
import { newPersonFrom, personPatch, personToForm, validatePersonForm, emptyPersonForm } from '@/features/admin/personForm';
import { campusPeople, demoPeople } from './selectors';
import { useDemo } from './store';

/** Cumpleaños y aniversarios de un mes con las personas que ve el campus ahora mismo. */
const personal = (year: number, month: number): CalendarEntry[] =>
  entriesForMonth(year, month, { holidays: [], events: [], people: demoPeople(useDemo.getState()) }).filter((e) => e.kind === 'cumpleanos' || e.kind === 'aniversario');

const ana = () =>
  newPersonFrom(
    { ...emptyPersonForm(), name: 'Ana Pérez Gómez', email: 'ana.perez@flmexperts.com', position: 'Asesora fiscal', department: 'Fiscal', office: 'Vic', birthdayDay: '14', birthdayMonth: '3', startDate: '2026-11-02' },
    seed.people.map((p) => p.id),
  );

describe('Judith Calet en el calendario de empresa', () => {
  beforeEach(() => useDemo.getState().reset());

  it('su cumpleaños, el 26 de noviembre de cada año', () => {
    expect(personal(2026, 11)).toEqual([expect.objectContaining({ id: 'cumple-p-judith-calet-2026', date: '2026-11-26', kind: 'cumpleanos', title: 'Cumpleaños de Judith Calet' })]);
    expect(personal(2029, 11).map((e) => e.date)).toEqual(['2029-11-26']);
  });

  it('septiembre de 2026, sin aniversario; el primero, el 1 de septiembre de 2027', () => {
    expect(personal(2026, 9)).toEqual([]);
    expect(personal(2027, 9)).toContainEqual(expect.objectContaining({ id: 'aniv-p-judith-calet-2027', date: '2027-09-01', kind: 'aniversario', years: 1 }));
  });

  it('el resto de la semilla queda «sin indicar»: solo cumple Judith, y solo celebran aniversario quienes tienen fecha de incorporación', () => {
    const all = Array.from({ length: 12 }, (_, i) => personal(2027, i + 1)).flat();
    expect(all.filter((e) => e.kind === 'cumpleanos').map((e) => e.personId)).toEqual(['p-judith-calet']);
    // Judith, Lluís y Christopher se incorporaron el 1 de septiembre de 2026 (datos facilitados por FLM)
    expect(all.filter((e) => e.kind === 'aniversario').map((e) => [e.personId, e.date]).sort()).toEqual([
      ['p-christopher-raudales', '2027-09-01'],
      ['p-judith-calet', '2027-09-01'],
      ['p-lluis-gomez', '2027-09-01'],
    ]);
    expect(demoPeople(useDemo.getState()).filter((p) => missingPersonalDates(p).length === 0).map((p) => p.id)).toEqual(['p-judith-calet']);
  });
});

describe('alta de una persona en la demo', () => {
  beforeEach(() => useDemo.getState().reset());

  it('se guarda en el navegador, aparece en el campus y genera sus fechas anuales', () => {
    const person = ana();
    useDemo.getState().addPerson(person);
    expect(useDemo.getState().extraPeople).toEqual([person]);
    expect(demoPeople(useDemo.getState()).find((p) => p.id === person.id)).toEqual(person);
    expect(personal(2027, 3).map((e) => [e.id, e.date])).toEqual([['cumple-p-ana-perez-gomez-2027', '2027-03-14']]);
    // Se incorpora en noviembre de 2026: su primer aniversario, en noviembre de 2027
    expect(personal(2026, 11).map((e) => e.kind)).toEqual(['cumpleanos']);
    expect(personal(2027, 11).map((e) => [e.kind, e.date, e.years])).toEqual([
      ['aniversario', '2027-11-02', 1],
      ['cumpleanos', '2027-11-26', undefined],
    ]);
  });

  it('su correo ya no se puede repetir en otra alta', () => {
    useDemo.getState().addPerson(ana());
    const again = { ...personToForm(ana()), name: 'Otra Ana' };
    expect(validatePersonForm(again, { people: demoPeople(useDemo.getState()) }).map((i) => i.field)).toEqual(['email']);
  });

  it('«Restablecer» la quita, con sus fechas', () => {
    useDemo.getState().addPerson(ana());
    useDemo.getState().reset();
    expect(useDemo.getState().extraPeople).toEqual([]);
    expect(personal(2027, 3)).toEqual([]);
    expect(campusPeople(useDemo.getState().extraPeople)).toBe(seed.people);
  });

  it('al eliminar su perfil se borran su ficha y sus fechas, y sale del calendario', () => {
    const person = ana();
    useDemo.getState().addPerson(person);
    useDemo.getState().patchPerson(person.id, { birthday: '03-15' });
    useDemo.getState().removePerson(person.id);
    const s = useDemo.getState();
    expect(s.extraPeople).toEqual([]);
    expect(s.peopleOverrides[person.id]).toBeUndefined();
    expect(s.removedPeople[person.id]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(personal(2027, 3)).toEqual([]);
  });
});

describe('editar un perfil actualiza el calendario sin duplicar', () => {
  beforeEach(() => useDemo.getState().reset());

  it('mover el cumpleaños de Judith lo cambia de día: la fecha anterior desaparece', () => {
    const judith = demoPeople(useDemo.getState()).find((p) => p.id === 'p-judith-calet')!;
    const patch = personPatch(judith, { ...personToForm(judith), birthdayDay: '27' });
    useDemo.getState().patchPerson(judith.id, patch);
    expect(personal(2026, 11).map((e) => [e.id, e.date])).toEqual([['cumple-p-judith-calet-2026', '2026-11-27']]);
    // Guardar otra vez lo mismo no añade nada
    useDemo.getState().patchPerson(judith.id, patch);
    expect(personal(2026, 11)).toHaveLength(1);
  });

  it('completar un perfil anterior le da sus fechas; cambiar su incorporación mueve el aniversario', () => {
    const st = useDemo.getState();
    st.patchPerson('p-sara-lopez', { birthday: '04-02' });
    expect(personal(2027, 4).map((e) => e.id)).toEqual(['cumple-p-sara-lopez-2027']);
    st.patchPerson('p-sara-lopez', { startDate: '2020-05-04' });
    expect(personal(2027, 5).map((e) => [e.id, e.years])).toEqual([['aniv-p-sara-lopez-2027', 7]]);
    st.patchPerson('p-sara-lopez', { startDate: '2020-06-04' });
    expect(personal(2027, 5)).toEqual([]);
    expect(personal(2027, 6).map((e) => e.id)).toEqual(['aniv-p-sara-lopez-2027']);
  });

  it('una cuenta desactivada no aparece en el calendario; al reactivarla, vuelve', () => {
    const st = useDemo.getState();
    st.patchPerson('p-judith-calet', { status: 'inactiva' });
    expect(personal(2026, 11)).toEqual([]);
    st.patchPerson('p-judith-calet', { status: 'activa' });
    expect(personal(2026, 11)).toHaveLength(1);
  });

  it('las altas se editan igual: un cambio de ficha se aplica sobre la persona dada de alta', () => {
    const person = ana();
    useDemo.getState().addPerson(person);
    useDemo.getState().patchPerson(person.id, { birthday: '03-20' });
    expect(personal(2027, 3).map((e) => e.date)).toEqual(['2027-03-20']);
  });
});

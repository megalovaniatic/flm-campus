import { describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import type { CalendarSources, Person } from '@flm/shared';
import { countByKind, entrySentence, indexMonths, KIND_ORDER, kindLabel, personOf, shortTitle } from './calendarView';

const sources = (people: readonly Person[]): CalendarSources => ({ holidays: seed.holidays, events: [], people });
const judith = seed.people.find((p) => p.id === 'p-judith-calet')!;

describe('calendario de empresa: cumpleaños y aniversarios desde el perfil', () => {
  it('los cuatro tipos tienen su nombre, en orden', () => {
    expect(KIND_ORDER).toEqual(['encuentro', 'festivo', 'cumpleanos', 'aniversario']);
    expect(KIND_ORDER.map(kindLabel)).toEqual(['Encuentro de equipo', 'Festivo', 'Cumpleaños', 'Aniversario en FLM']);
  });

  it('noviembre de 2026: el cumpleaños de Judith el día 26, sin año de nacimiento', () => {
    const index = indexMonths([{ y: 2026, m: 11 }], sources(seed.people));
    const day = index.get('2026-11-26') ?? [];
    expect(day.map((e) => e.kind)).toEqual(['cumpleanos']);
    const [cumple] = day;
    expect(cumple).toMatchObject({ id: 'cumple-p-judith-calet-2026', title: 'Cumpleaños de Judith Calet', detail: 'Asesora Contable', personId: 'p-judith-calet' });
    expect(shortTitle(cumple!)).toBe('Judith Calet');
    expect(entrySentence(cumple!)).toBe('Cumpleaños de Judith Calet, Asesora Contable');
    // Nadie más tiene cumpleaños: no se inventan fechas
    const all = [...index.values()].flat();
    expect(all.filter((e) => e.kind === 'cumpleanos' || e.kind === 'aniversario').map((e) => e.personId)).toEqual(['p-judith-calet']);
  });

  it('septiembre de 2026, el de su incorporación, sin aniversario; septiembre de 2027, el primero', () => {
    const sep26 = [...indexMonths([{ y: 2026, m: 9 }], sources(seed.people)).values()].flat();
    expect(sep26.some((e) => e.kind === 'aniversario')).toBe(false);
    const sep27 = indexMonths([{ y: 2027, m: 9 }], sources(seed.people));
    const aniversarios = (sep27.get('2027-09-01') ?? []).filter((e) => e.kind === 'aniversario');
    // Las tres incorporaciones del 1 de septiembre de 2026, una vez cada una
    expect(aniversarios.map((e) => e.personId).sort()).toEqual(['p-christopher-raudales', 'p-judith-calet', 'p-lluis-gomez']);
    const aniv = aniversarios.find((e) => e.personId === 'p-judith-calet');
    expect(aniv).toMatchObject({ id: 'aniv-p-judith-calet-2027', years: 1, personId: 'p-judith-calet' });
    expect(shortTitle(aniv!)).toBe('Judith Calet · 1 año');
    expect(personOf(aniv!)).toBe('Judith Calet');
    expect(entrySentence(aniv!)).toBe('Aniversario de Judith Calet en FLM: 1 año en FLM, desde el 1 de septiembre de 2026');
    const sep30 = indexMonths([{ y: 2030, m: 9 }], sources(seed.people));
    expect(shortTitle((sep30.get('2030-09-01') ?? []).find((e) => e.kind === 'aniversario' && e.personId === 'p-judith-calet')!)).toBe('Judith Calet · 4 años');
  });

  it('cada año vuelve el cumpleaños, una sola vez por persona aunque esté repetida', () => {
    const index = indexMonths([{ y: 2027, m: 11 }], sources([judith, judith]));
    expect((index.get('2027-11-26') ?? []).map((e) => e.id)).toEqual(['cumple-p-judith-calet-2027']);
  });

  it('cuenta cada tipo en el mes para los filtros', () => {
    const index = indexMonths([{ y: 2026, m: 12 }], sources([{ ...judith, birthday: '12-08' }]));
    const counts = countByKind(index.values());
    expect(counts.cumpleanos).toBe(1);
    expect(counts.aniversario).toBe(0);
    expect(counts.festivo).toBeGreaterThan(0);
    expect(Object.keys(counts)).toEqual(KIND_ORDER);
  });

  it('sin personas, el calendario sigue con encuentros y festivos', () => {
    const index = indexMonths([{ y: 2026, m: 11 }], { holidays: seed.holidays, events: [] });
    expect([...index.values()].flat().every((e) => e.kind === 'festivo' || e.kind === 'encuentro')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import type { Block, Formation } from '@flm/shared';
import { editorialDates, sectionForRef, toSections } from './data';

const fis01 = seed.formations.find((f) => f.id === 'fis-01')!;
const heading = (text: string): Block => ({ type: 'heading', text });
const paragraph = (text: string): Block => ({ type: 'paragraph', text });

describe('«Repasa» del test final', () => {
  it('cada «Repasa» de la semilla lleva al apartado que nombra (y al número que cita)', () => {
    for (const f of seed.formations) {
      const sections = toSections(f.blocks);
      for (const q of f.quiz.questions) {
        const s = sectionForRef(sections, q.ref);
        expect(s, `${f.id} · ${q.ref}`).toBeDefined();
        const cited = /apartado\s+(\d+)/i.exec(q.ref ?? '')?.[1];
        if (cited) expect(s?.number, `${f.id} · ${q.ref}`).toBe(Number(cited));
      }
    }
  });

  it('manda el título citado: al insertar un apartado, sigue llevando al mismo', () => {
    const ref = fis01.quiz.questions.find((q) => q.id === 'fis-01-q3')!.ref;
    expect(ref).toBe('apartado 2, «Cuánto cuesta: la escala del recargo»');
    // Un apartado nuevo justo después del primero: «Cuánto cuesta…» pasa a ser el 3.
    const second = fis01.blocks.flatMap((b, i) => (b.type === 'heading' && b.level !== 3 ? [i] : []))[1]!;
    const blocks = [...fis01.blocks.slice(0, second), heading('Apartado nuevo'), paragraph('Texto.'), ...fis01.blocks.slice(second)];
    const s = sectionForRef(toSections(blocks), ref);
    expect(s).toMatchObject({ title: 'Cuánto cuesta: la escala del recargo', number: 3 });
  });

  it('el formato del editor («Apartado N · título») sobrevive a reordenar los apartados', () => {
    const sections = toSections([heading('Plazos'), paragraph('a'), heading('Recargos'), paragraph('b')]);
    expect(sectionForRef(sections, 'Apartado 1 · Recargos')).toMatchObject({ title: 'Recargos', number: 2 });
    expect(sectionForRef(sections, 'Apartado 2: Plazos')).toMatchObject({ title: 'Plazos', number: 1 });
  });

  it('sin título que coincida, el número; con dos apartados del mismo título, el del número citado', () => {
    const sections = toSections([heading('Plazos'), paragraph('a'), heading('Ejemplo'), paragraph('b'), heading('Ejemplo'), paragraph('c')]);
    expect(sectionForRef(sections, 'Apartado 2')).toMatchObject({ number: 2 });
    expect(sectionForRef(sections, 'Apartado 1 · Plazos de antes')).toMatchObject({ title: 'Plazos', number: 1 });
    expect(sectionForRef(sections, 'Apartado 3 · Ejemplo')).toMatchObject({ number: 3 });
    expect(sectionForRef(sections, 'Apartado 9 · Ejemplo')).toMatchObject({ number: 2 });
    expect(sectionForRef(sections, 'Repaso general')).toBeUndefined();
  });
});

describe('apartados de la lectura', () => {
  it('un apartado con título y sin bloques se conserva: la numeración es la del editor', () => {
    const sections = toSections([heading('Primero'), heading('Segundo'), paragraph('Texto.')]);
    expect(sections.map((s) => [s.title, s.number, s.blocks.length])).toEqual([
      ['Primero', 1, 0],
      ['Segundo', 2, 1],
    ]);
    expect(sectionForRef(sections, 'Apartado 2 · Segundo')?.number).toBe(2);
  });
});

describe('fechas de la formación', () => {
  const at = (publishedAt?: string, updatedAt?: string): Formation => ({ ...fis01, editorial: { ...fis01.editorial, publishedAt, updatedAt } });

  it('se leen en hora de Madrid, también lo publicado desde Gestión (guardado en UTC)', () => {
    expect(editorialDates(at('2026-11-04T23:30:00.000Z'))).toEqual(['Publicada el 5 de noviembre de 2026']);
    expect(editorialDates(at('2026-06-10T22:30:00.000Z'))).toEqual(['Publicada el 11 de junio de 2026']);
    expect(editorialDates(at('2026-10-15T09:00:00+02:00', '2026-10-28'))).toEqual(['Publicada el 15 de octubre de 2026', 'Actualizada el 28 de octubre de 2026']);
  });

  it('no repite la fecha si se publicó y actualizó el mismo día en Madrid', () => {
    expect(editorialDates(at('2026-11-04T23:30:00.000Z', '2026-11-05T10:00:00.000Z'))).toEqual(['Publicada el 5 de noviembre de 2026']);
    expect(editorialDates(at())).toEqual([]);
  });
});

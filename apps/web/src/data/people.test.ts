import { beforeEach, describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import { bylineFor, bylineLine } from '@flm/shared';
import { DEMO_USER_ID, visiblePeople } from './selectors';
import { useDemo } from './store';

const AT = '2026-10-29T10:00:00.000Z';

describe('personas del campus sin los perfiles eliminados', () => {
  it('quita los perfiles eliminados y conserva los cambios de ficha del resto', () => {
    const people = visiblePeople(seed.people, { 'p-sara-lopez': { role: 'autor' } }, { 'p-angel-ceniceros': AT });
    expect(people.map((p) => p.id)).not.toContain('p-angel-ceniceros');
    expect(people.find((p) => p.id === 'p-sara-lopez')?.role).toBe('autor');
    expect(people).toHaveLength(seed.people.length - 1);
  });

  it('sin perfiles eliminados, la lista es la semilla con sus cambios', () => {
    expect(visiblePeople(seed.people, {}, {})).toEqual(seed.people);
  });

  it('las fichas anonimizadas con la acción anterior («Eliminar datos personales») cuentan como perfiles eliminados', () => {
    const anonymized = { name: 'Persona eliminada', email: 'eliminada-p-oriol-font@anonimizada.invalid', position: '', status: 'inactiva' as const };
    expect(visiblePeople(seed.people, { 'p-oriol-font': anonymized }, {}).map((p) => p.id)).not.toContain('p-oriol-font');
  });

  it('el contenido de una persona eliminada pasa a la firma neutra: «Área … de FLM» en formaciones y «FLM» en noticias', () => {
    // Todas las formaciones de la semilla son de Judith (el perfil de la demo, que no se elimina):
    // la formación de Ángel es sintética; su noticia, la de la semilla.
    const fiscal = seed.formations.find((f) => f.area === 'fiscal')!;
    const formation = { ...fiscal, editorial: { ...fiscal.editorial, authorId: 'p-angel-ceniceros' } };
    const news = seed.news.find((n) => n.editorial.authorId === 'p-angel-ceniceros');
    expect(news).toBeDefined();
    const before = visiblePeople(seed.people, {}, {});
    const after = visiblePeople(seed.people, {}, { 'p-angel-ceniceros': AT });
    expect(bylineFor(formation.editorial.authorId, before, { type: 'formacion', area: formation.area })).toMatchObject({ kind: 'persona', person: { id: 'p-angel-ceniceros' } });
    expect(bylineFor(formation.editorial.authorId, after, { type: 'formacion', area: formation.area })).toEqual({ kind: 'neutra', name: 'Área Fiscal de FLM', area: 'fiscal' });
    expect(bylineLine(bylineFor(formation.editorial.authorId, after, { type: 'test', area: formation.area }))).toBe('Área Fiscal de FLM');
    expect(bylineFor(news!.editorial.authorId, before, { type: 'noticia', area: news!.area })).toMatchObject({ kind: 'persona', person: { id: 'p-angel-ceniceros' } });
    expect(bylineFor(news!.editorial.authorId, after, { type: 'noticia', area: news!.area })).toEqual({ kind: 'neutra', name: 'FLM' });
  });
});

describe('autoría de las formaciones', () => {
  const JUDITH = 'Judith Calet — Asesora Contable';
  const people = visiblePeople(seed.people, {}, {});

  it('todas las formaciones de la semilla, y su test final, firman «Judith Calet — Asesora Contable»', () => {
    expect(seed.formations.length).toBeGreaterThan(0);
    for (const f of seed.formations) {
      expect(f.editorial.authorId, f.id).toBe(DEMO_USER_ID);
      expect(bylineLine(bylineFor(f.editorial.authorId, people, { type: 'formacion', area: f.area })), f.id).toBe(JUDITH);
      expect(bylineLine(bylineFor(f.editorial.authorId, people, { type: 'test', area: f.area })), f.id).toBe(JUDITH);
    }
  });

  it('la firma sale del campo de autoría y de la ficha, nunca de un texto escrito en cada formación', () => {
    for (const f of seed.formations) expect(JSON.stringify(f), f.id).not.toContain(JUDITH);
    // Si cambia el puesto en la ficha, cambia en todas a la vez.
    const promoted = visiblePeople(seed.people, { [DEMO_USER_ID]: { position: 'Responsable del Área Contable' } }, {});
    const lines = new Set(seed.formations.map((f) => bylineLine(bylineFor(f.editorial.authorId, promoted, { type: 'formacion', area: f.area }))));
    expect([...lines]).toEqual(['Judith Calet — Responsable del Área Contable']);
  });
});

describe('eliminar un perfil en la demo', () => {
  beforeEach(() => useDemo.getState().reset());

  it('lo anota con su fecha y borra sus cambios de ficha y sus sesiones revocadas', () => {
    const st = useDemo.getState();
    st.patchPerson('p-oriol-font', { role: 'autor' });
    st.revokeSessions('p-oriol-font');
    st.patchPerson('p-sara-lopez', { role: 'autor' });
    st.removePerson('p-oriol-font');
    const s = useDemo.getState();
    expect(s.removedPeople['p-oriol-font']).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(s.peopleOverrides).toEqual({ 'p-sara-lopez': { role: 'autor' } });
    expect(s.revokedSessions['p-oriol-font']).toBeUndefined();
    expect(visiblePeople(seed.people, s.peopleOverrides, s.removedPeople).map((p) => p.id)).not.toContain('p-oriol-font');
  });

  it('nunca elimina el perfil de la sesión abierta (en la demo, la persona con la que se ve)', () => {
    useDemo.getState().removePerson(DEMO_USER_ID);
    expect(useDemo.getState().removedPeople).toEqual({});
    expect(useDemo.getState().userId).toBe(DEMO_USER_ID);
  });

  it('eliminarlo dos veces conserva la primera fecha, y «Restablecer» lo devuelve todo', () => {
    const st = useDemo.getState();
    st.removePerson('p-oriol-font');
    const first = useDemo.getState().removedPeople['p-oriol-font'];
    st.removePerson('p-oriol-font');
    expect(useDemo.getState().removedPeople['p-oriol-font']).toBe(first);
    useDemo.getState().reset();
    expect(useDemo.getState().removedPeople).toEqual({});
  });
});

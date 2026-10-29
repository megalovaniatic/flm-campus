import { beforeEach, describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import { bylineFor } from '@flm/shared';
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
    const formation = seed.formations.find((f) => f.editorial.authorId === 'p-angel-ceniceros');
    const news = seed.news.find((n) => n.editorial.authorId === 'p-angel-ceniceros') ?? seed.news[0]!;
    expect(formation).toBeDefined();
    const before = visiblePeople(seed.people, {}, {});
    const after = visiblePeople(seed.people, {}, { 'p-angel-ceniceros': AT, [news.editorial.authorId ?? '']: AT });
    expect(bylineFor(formation!.editorial.authorId, before, { type: 'formacion', area: formation!.area })).toMatchObject({ kind: 'persona', person: { id: 'p-angel-ceniceros' } });
    expect(bylineFor(formation!.editorial.authorId, after, { type: 'formacion', area: formation!.area })).toEqual({ kind: 'neutra', name: 'Área Fiscal de FLM', area: 'fiscal' });
    expect(bylineFor(news.editorial.authorId, after, { type: 'noticia', area: news.area })).toEqual({ kind: 'neutra', name: 'FLM' });
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

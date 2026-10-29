import { describe, expect, it } from 'vitest';
import { AUTHOR_SEPARATOR, authorLine, authorParts, bylineFor, bylineLine, bylineName, neutralSignature, REMOVED_PERSON, signingArea } from './authorship';
import { editorialSchema } from './schemas';

const people = [
  { id: 'p-ana', name: 'Ana Herrera Gómez' },
  { id: 'p-oriol', name: 'Oriol Font Valls' },
];

describe('firma neutra', () => {
  it('formaciones y tests firman con su área', () => {
    expect(neutralSignature({ type: 'formacion', area: 'fiscal' })).toBe('Área Fiscal de FLM');
    expect(neutralSignature({ type: 'test', area: 'contable' })).toBe('Área Contable de FLM');
    expect(signingArea({ type: 'formacion', area: 'laboral' })).toBe('laboral');
  });

  it('noticias, eventos, comunicados, documentos, clientes y bienvenidas firman «FLM», aunque tengan área', () => {
    for (const type of ['noticia', 'evento', 'comunicado', 'documento', 'cliente', 'bienvenida'] as const) {
      expect(neutralSignature({ type, area: 'mercantil' }), type).toBe('FLM');
      expect(signingArea({ type, area: 'mercantil' }), type).toBeUndefined();
    }
  });

  it('sin un área válida, «FLM»', () => {
    expect(neutralSignature({ type: 'formacion' })).toBe('FLM');
    expect(neutralSignature({ type: 'formacion', area: 'general' })).toBe('FLM');
    expect(neutralSignature({ type: 'test', area: null })).toBe('FLM');
  });
});

describe('quién firma un contenido', () => {
  it('la persona autora, si sigue en el campus (lista o mapa)', () => {
    expect(bylineFor('p-ana', people, { type: 'noticia', area: 'fiscal' })).toEqual({ kind: 'persona', person: people[0] });
    expect(bylineFor('p-oriol', new Map(people.map((p) => [p.id, p])), { type: 'formacion', area: 'fiscal' })).toEqual({ kind: 'persona', person: people[1] });
  });

  it('sin autoría o con una persona que no existe, la firma neutra', () => {
    expect(bylineFor(undefined, people, { type: 'formacion', area: 'fiscal' })).toEqual({ kind: 'neutra', name: 'Área Fiscal de FLM', area: 'fiscal' });
    expect(bylineFor('p-no-existe', people, { type: 'noticia', area: 'fiscal' })).toEqual({ kind: 'neutra', name: 'FLM' });
    expect(bylineFor('', people, { type: 'evento' })).toEqual({ kind: 'neutra', name: 'FLM' });
  });

  it('con el perfil eliminado, la firma neutra aunque la lista aún incluya a la persona', () => {
    expect(bylineFor('p-ana', people, { type: 'test', area: 'laboral' }, { 'p-ana': '2026-10-29T10:00:00.000Z' })).toEqual({ kind: 'neutra', name: 'Área Laboral de FLM', area: 'laboral' });
    expect(bylineFor('p-ana', people, { type: 'documento', area: 'fiscal' }, new Set(['p-ana']))).toEqual({ kind: 'neutra', name: 'FLM' });
    expect(bylineFor('p-oriol', people, { type: 'documento' }, new Set(['p-ana']))).toMatchObject({ kind: 'persona' });
  });

  it('el nombre con el que firma sirve para buscadores y textos; «Persona eliminada» nunca firma', () => {
    expect(bylineName(bylineFor('p-ana', people, { type: 'noticia' }))).toBe('Ana Herrera Gómez');
    expect(bylineName(bylineFor(undefined, people, { type: 'formacion', area: 'mercantil' }))).toBe('Área Mercantil de FLM');
    expect(bylineName(bylineFor('p-x', people, { type: 'bienvenida' }))).not.toBe(REMOVED_PERSON);
  });
});

describe('línea de firma de la autoría', () => {
  const judith = { id: 'p-judith-calet', name: 'Judith Calet', position: 'Asesora Contable' };

  it('nombre y puesto unidos por « — »', () => {
    expect(AUTHOR_SEPARATOR).toBe(' — ');
    expect(authorLine(judith)).toBe('Judith Calet — Asesora Contable');
    expect(authorParts(judith)).toEqual({ name: 'Judith Calet', position: 'Asesora Contable' });
  });

  it('sin puesto, solo el nombre (sin un guion colgando); con espacios de más, limpia', () => {
    expect(authorLine({ name: 'Judith Calet', position: '' })).toBe('Judith Calet');
    expect(authorLine({ name: 'Judith Calet', position: '   ' })).toBe('Judith Calet');
    expect(authorLine({ name: 'Judith Calet' })).toBe('Judith Calet');
    expect(authorLine({ name: ' Judith Calet ', position: ' Asesora Contable ' })).toBe('Judith Calet — Asesora Contable');
    expect(authorParts({ name: 'Judith Calet', position: null })).toEqual({ name: 'Judith Calet' });
  });

  it('sale de la ficha: si cambia el puesto, cambia la firma', () => {
    expect(authorLine({ ...judith, position: 'Responsable del Área Contable' })).toBe('Judith Calet — Responsable del Área Contable');
  });

  it('de cualquier firma: la persona con su puesto o la firma neutra tal cual, sin puesto', () => {
    const team = [judith];
    expect(bylineLine(bylineFor('p-judith-calet', team, { type: 'formacion', area: 'fiscal' }))).toBe('Judith Calet — Asesora Contable');
    expect(bylineLine(bylineFor('p-judith-calet', team, { type: 'test', area: 'laboral' }))).toBe('Judith Calet — Asesora Contable');
    expect(bylineLine(bylineFor(undefined, team, { type: 'formacion', area: 'fiscal' }))).toBe('Área Fiscal de FLM');
    expect(bylineLine(bylineFor('p-judith-calet', team, { type: 'test', area: 'contable' }, new Set(['p-judith-calet'])))).toBe('Área Contable de FLM');
    expect(bylineLine(bylineFor(undefined, team, { type: 'noticia' }))).toBe('FLM');
  });
});

describe('esquema editorial', () => {
  const base = { status: 'publicado' as const, review: { state: 'revisado' as const } };
  it('admite contenido sin autoría, pero nunca un autor vacío', () => {
    expect(editorialSchema.safeParse(base).success).toBe(true);
    expect(editorialSchema.safeParse({ ...base, authorId: 'p-ana' }).success).toBe(true);
    expect(editorialSchema.safeParse({ ...base, authorId: '' }).success).toBe(false);
    expect(editorialSchema.safeParse({ ...base, authorId: '   ' }).success).toBe(false);
  });
});

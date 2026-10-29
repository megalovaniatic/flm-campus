import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { newBlock, newQuestion, reviewTargets, type EditorBlock, type QuizForm, type ReviewTarget } from '../forms';
import { QuizEditor } from './QuizEditor';

const quiz = (n: number): QuizForm => ({ id: 'q', title: 'Test final', questions: Array.from({ length: n }, newQuestion) });

/** Test final de una formación (3 preguntas, sin banco de preguntas). */
const render = (q: QuizForm, sections: ReviewTarget[] = []) =>
  renderToStaticMarkup(<QuizEditor quiz={q} update={() => undefined} err={() => undefined} base="quiz" count={3} passMark={2} sections={sections} />);

/** Si cada botón «Eliminar la pregunta N» está activo. */
const removable = (html: string) => [...html.matchAll(/<button[^>]*aria-label="Eliminar la pregunta \d+"[^>]*>/g)].map((m) => !/\sdisabled=""/.test(m[0]));

describe('test final con un número de preguntas distinto de 3 (borradores del editor anterior)', () => {
  it('si faltan preguntas se pueden añadir, y no se puede quitar la que hay', () => {
    const html = render(quiz(1));
    expect(html).toContain('Añadir pregunta');
    expect(html).toContain('Pregunta 1 de 3');
    expect(removable(html)).toEqual([false]);
  });

  it('con las 3 justas no se añaden ni se quitan', () => {
    const html = render(quiz(3));
    expect(html).not.toContain('Añadir pregunta');
    expect(removable(html)).toEqual([false, false, false]);
  });

  it('si sobran, se pueden quitar', () => {
    expect(removable(render(quiz(4)))).toEqual([true, true, true, true]);
  });
});

describe('«Repasa» que ya no coincide con los apartados', () => {
  it('se rotula en el selector, se avisa y se propone el apartado que le corresponde ahora', () => {
    const heading = (text: string) => ({ ...(newBlock('heading') as Extract<EditorBlock, { type: 'heading' }>), text });
    const blocks = ['Qué es', 'Apartado nuevo', 'Plazos'].flatMap((t) => [heading(t), newBlock('paragraph')]);
    const q = quiz(3);
    q.questions[0] = { ...q.questions[0]!, ref: 'Apartado 2 · Plazos' };
    const html = render(q, reviewTargets(blocks));
    expect(html).toContain('(ya no coincide) Apartado 2 · Plazos');
    expect(html).toContain('«Plazos» es ahora el apartado 3');
    expect(html).toContain('Usar «Apartado 3 · Plazos»');
    // El que coincide no avisa.
    q.questions[0] = { ...q.questions[0]!, ref: 'Apartado 3 · Plazos' };
    expect(render(q, reviewTargets(blocks))).not.toContain('ya no coincide');
  });
});

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { decisionTreeProblems, type WidgetSpec } from '@flm/shared';
import { exampleWidget, WIDGET_LABEL, widgetToForm, type WidgetKind } from '../forms';
import { classifierCategories, compareColumns, duplicateStep, freeSeriesName, removeStep, renameStep, WidgetFields } from './WidgetFields';

type Of<K extends WidgetSpec['kind']> = Extract<WidgetSpec, { kind: K }>;

const fields = (spec: WidgetSpec) => renderToStaticMarkup(createElement(WidgetFields, { spec: widgetToForm(spec), onChange: () => undefined }));

describe('campos de cada apoyo en el editor', () => {
  it('todos los apoyos de ejemplo se pueden editar', () => {
    for (const kind of Object.keys(WIDGET_LABEL) as WidgetKind[]) expect(fields(exampleWidget(kind)).length, kind).toBeGreaterThan(0);
  });

  it('un destino del árbol o una categoría que ya no existen se ven rotulados, no como «Elige…»', () => {
    const arbol = exampleWidget('arbol-decision') as Of<'arbol-decision'>;
    expect(fields({ ...arbol, start: 'borrado' })).toContain('borrado · ya no existe');
    const clasificador = exampleWidget('clasificador') as Of<'clasificador'>;
    expect(fields({ ...clasificador, categories: clasificador.categories.slice(1) })).toContain('Gasto anticipado (480 o 567) · ya no existe');
  });

  it('la comparativa edita aparte el encabezado de las filas; el gráfico no deja pasar de cuatro series', () => {
    expect(fields(exampleWidget('comparativa'))).toContain('Encabezado de las filas');
    const grafico = exampleWidget('grafico') as Of<'grafico'>;
    const cuatro = { ...grafico, chart: { ...grafico.chart, series: [...grafico.chart.series, { ...grafico.chart.series[0]!, name: 'Otra' }] } };
    expect(fields(cuatro)).toMatch(/<button[^>]*disabled=""[^>]*>(?:(?!<\/button>).)*Añadir serie/);
  });
});

describe('árbol de decisión: los pasos se renombran, duplican y eliminan sin romper los saltos', () => {
  const arbol = exampleWidget('arbol-decision') as Of<'arbol-decision'>;

  it('renombrar un paso lleva con él el primer paso y las opciones que saltaban a él', () => {
    const next = renameStep(arbol, 0, 'Requerimiento previo');
    expect(next.start).toBe('requerimiento-previo');
    expect(next.nodes[0]?.id).toBe('requerimiento-previo');
    const escala = renameStep(arbol, 5, 'fin escala 1 %');
    expect(escala.nodes[2]?.options?.[0]?.next).toBe('fin-escala-1');
    expect(decisionTreeProblems(escala.start, escala.nodes)).toEqual([]);
  });

  it('un identificador vacío o ya usado no se acepta tal cual', () => {
    expect(renameStep(arbol, 0, '  ')).toBe(arbol);
    expect(renameStep(arbol, 0, 'fin-quince').nodes[0]?.id).toBe('fin-quince-2');
  });

  it('duplicar un paso le da otro identificador', () => {
    const copy = duplicateStep(arbol, arbol.nodes[1]!);
    expect(copy).toMatchObject({ id: 'mismo-hecho-2', question: arbol.nodes[1]!.question });
    const nodes = [...arbol.nodes, copy];
    expect(decisionTreeProblems(arbol.start, nodes)).toEqual([]);
  });

  it('eliminar un paso deja sin elegir los saltos que llevaban a él (la validación lo señala)', () => {
    const sinEscala = removeStep(arbol, 5);
    expect(sinEscala.nodes.some((n) => n.id === 'fin-escala')).toBe(false);
    expect(sinEscala.nodes.find((n) => n.id === 'doce-meses')?.options?.[0]?.next).toBe('');
    expect(decisionTreeProblems(sinEscala.start, sinEscala.nodes).map((p) => p.message)).toEqual(['Elige a qué paso lleva la opción «No, menos de 12 meses» del paso «doce-meses»']);
    expect(removeStep(arbol, 0).start).toBe('');
  });
});

describe('clasificador: categorías y respuestas', () => {
  const base = exampleWidget('clasificador') as Of<'clasificador'>;

  it('al renombrar una categoría, sus elementos la siguen teniendo como respuesta', () => {
    const categories = base.categories.map((c, i) => (i === 0 ? 'Gasto anticipado' : c));
    const next = classifierCategories(base, categories, { kind: 'edit', index: 0, before: base.categories[0]! });
    expect(next.items[0]?.answer).toBe('Gasto anticipado');
  });

  it('al quitar una categoría, sus elementos se quedan sin respuesta para elegir otra', () => {
    const next = classifierCategories(base, base.categories.slice(1), { kind: 'remove', index: 0 });
    expect(next.items[0]?.answer).toBe('');
    expect(next.items[1]?.answer).toBe(base.items[1]?.answer);
  });

  it('escribir en una categoría nueva no se lleva los elementos sin respuesta', () => {
    const vacia = { ...base, categories: [...base.categories, ''], items: base.items.map((it, i) => (i === 0 ? { ...it, answer: '' } : it)) };
    const next = classifierCategories(vacia, [...base.categories, 'Otra'], { kind: 'edit', index: base.categories.length, before: '' });
    expect(next.items[0]?.answer).toBe('');
  });
});

describe('comparativa: la columna de las filas no se mueve ni se quita', () => {
  it('quitar o mover una columna comparada mueve con ella los valores de cada fila', () => {
    const spec = widgetToForm(exampleWidget('comparativa')) as Of<'comparativa'>;
    const [rowHeader, ...compared] = spec.columns;
    const sinPrimera = compareColumns(spec, compared.slice(1), { kind: 'remove', index: 0 });
    expect(sinPrimera.columns).toEqual([rowHeader, 'Objetivo']);
    expect(sinPrimera.rows[0]?.values).toEqual([spec.rows[0]!.values[1]]);
    const movida = compareColumns(spec, [...compared].reverse(), { kind: 'move', from: 0, to: 1 });
    expect(movida.columns).toEqual([rowHeader, 'Objetivo', 'Disciplinario']);
    expect(movida.rows[0]?.values).toEqual([...spec.rows[0]!.values].reverse());
    const nueva = compareColumns(spec, [...compared, ''], { kind: 'add' });
    expect(nueva.rows.every((r) => r.values.length === 3 && r.values[2] === '')).toBe(true);
  });
});

describe('gráfico', () => {
  it('una serie nueva recibe un nombre que no está usado', () => {
    expect(freeSeriesName(['Vigente'])).toBe('Serie 2');
    expect(freeSeriesName(['Serie 2'])).toBe('Serie 3');
    expect(freeSeriesName(['Serie 2', 'serie 3'])).toBe('Serie 4');
  });
});

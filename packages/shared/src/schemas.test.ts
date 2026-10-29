import { describe, expect, it } from 'vitest';
import { blockSchema, decisionTreeProblems } from './schemas';
import type { WidgetSpec } from './types';

/** Problemas del apoyo según el esquema compartido (el mismo que aplica la API), con su ruta. */
const problems = (widget: WidgetSpec) => {
  const r = blockSchema.safeParse({ type: 'widget', widget });
  return r.success ? [] : r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
};

const outcome = (title: string) => ({ title, text: 'Texto', tone: 'resolver' as const });

describe('apoyos interactivos: estructura que el esquema comprueba', () => {
  const tree: Extract<WidgetSpec, { kind: 'arbol-decision' }> = {
    kind: 'arbol-decision',
    title: '¿Recargo o sanción?',
    start: 'requerimiento',
    nodes: [
      { id: 'requerimiento', question: '¿Hay requerimiento previo?', options: [{ label: 'Sí', next: 'fin-sancion' }, { label: 'No', next: 'fin-recargo' }] },
      { id: 'fin-sancion', outcome: outcome('Intereses y posible sanción') },
      { id: 'fin-recargo', outcome: outcome('Recargo') },
    ],
  };

  it('árbol: primer paso y destinos que existen, identificadores únicos y pasos con salida', () => {
    expect(problems(tree)).toEqual([]);
    // Renombrar un paso sin actualizar quien lo apuntaba.
    expect(problems({ ...tree, start: 'requerimiento-previo' })).toEqual([{ path: 'widget.start', message: 'El primer paso «requerimiento-previo» no existe' }]);
    // Eliminar un paso al que lleva una opción.
    const sinRecargo = { ...tree, nodes: tree.nodes.filter((n) => n.id !== 'fin-recargo') };
    expect(problems(sinRecargo)).toEqual([{ path: 'widget.nodes.0.options.1.next', message: 'La opción «No» del paso «requerimiento» lleva a «fin-recargo», que no existe' }]);
    // Duplicar un paso sin cambiar su identificador.
    expect(problems({ ...tree, nodes: [...tree.nodes, tree.nodes[2]!] })).toEqual([{ path: 'widget.nodes.3.id', message: 'Hay dos pasos con el identificador «fin-recargo»' }]);
    // Destino sin elegir y paso sin opciones ni resultado.
    const incompleto = { ...tree, start: '', nodes: [{ ...tree.nodes[0]!, options: [{ label: 'Sí', next: '' }] }, { id: 'vacio' }] };
    expect(problems(incompleto).map((p) => p.path)).toEqual(['widget.start', 'widget.nodes.0.options.0.next', 'widget.nodes.1']);
  });

  it('el aviso de desarrollo del árbol usa la misma comprobación', () => {
    expect(decisionTreeProblems(tree.start, tree.nodes)).toEqual([]);
    expect(decisionTreeProblems('x', tree.nodes).map((p) => p.message)).toEqual(['El primer paso «x» no existe']);
  });

  it('clasificador: categorías no vacías, sin repetir, y respuestas que son una de ellas', () => {
    const base: Extract<WidgetSpec, { kind: 'clasificador' }> = {
      kind: 'clasificador',
      title: '¿Qué ajuste toca?',
      prompt: 'Clasifica cada operación.',
      categories: ['Gasto anticipado', 'Ingreso anticipado'],
      items: [
        { label: 'Seguro pagado en octubre', answer: 'Gasto anticipado', explanation: 'Nueve meses son del año siguiente.' },
        { label: 'Alquiler cobrado por adelantado', answer: 'Ingreso anticipado', explanation: 'Cuatro meses son del año siguiente.' },
      ],
    };
    expect(problems(base)).toEqual([]);
    expect(problems({ ...base, categories: ['Gasto anticipado', ''] }).map((p) => p.path)).toContain('widget.categories.1');
    expect(problems({ ...base, categories: ['Gasto anticipado', 'Ingreso anticipado', 'gasto  ANTICIPADO'] })).toEqual([{ path: 'widget.categories.2', message: 'La categoría «gasto  ANTICIPADO» está repetida' }]);
    // Quitar una categoría que era la respuesta de un elemento.
    expect(problems({ ...base, categories: ['Ingreso anticipado', 'Otra'] })).toEqual([{ path: 'widget.items.0.answer', message: 'La categoría correcta «Gasto anticipado» ya no está entre las categorías' }]);
  });

  it('gráfico: como mucho cuatro series y con nombres distintos', () => {
    const serie = (name: string) => ({ name, values: [{ x: '2026', y: 1 }] });
    const chart = (names: string[]): WidgetSpec => ({ kind: 'grafico', chart: { type: 'barras', title: 'Coste', series: names.map(serie) } });
    expect(problems(chart(['A', 'B', 'C', 'D']))).toEqual([]);
    expect(problems(chart(['A', 'B', 'C', 'D', 'E'])).map((p) => p.path)).toEqual(['widget.chart.series']);
    expect(problems(chart(['Serie 2', 'serie 2']))).toEqual([{ path: 'widget.chart.series.1.name', message: 'Hay dos series con el nombre «serie 2»' }]);
  });
});

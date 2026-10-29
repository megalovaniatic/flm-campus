import { describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import { assessmentSchema, documentSchema, eventSchema, formationSchema, newClientSchema, newsSchema, welcomeSchema, type EditorialMeta, type WidgetSpec } from '@flm/shared';
import {
  assessmentToForm,
  blockToForm,
  clientToForm,
  documentToForm,
  eventToForm,
  exampleWidget,
  formationToForm,
  formToAssessment,
  formToClient,
  formToDocument,
  formToEvent,
  formToFormation,
  formToNews,
  formToWelcome,
  newBlock,
  newForm,
  newsToForm,
  normalizeForm,
  reviewRefProblem,
  reviewTargets,
  validateForm,
  welcomeToForm,
  widgetToForm,
  widgetToShared,
  type EditorBlock,
  type FormationForm,
} from './forms';
import { copyAsNew, recommendedFormation } from './templates';

const today = '2026-10-29';
const meta = (item: { id: string; slug?: string; editorial: EditorialMeta }, extra: { version?: number } = {}) => ({ id: item.id, slug: item.slug ?? item.id, editorial: item.editorial, uploadedBy: 'p-judith-calet', today, ...extra });

/**
 * Ida y vuelta con todo el contenido de la demo: abrirlo en el creador y volver a publicarlo sin tocar
 * nada da exactamente el mismo contenido (salvo los campos que se calculan), válido con su esquema.
 * Es la garantía de que editar lo que ya existe no pierde bloques, referencias ni tipos de fuente.
 */
describe('ida y vuelta: editar lo que ya existe no pierde nada', () => {
  it('las 12 formaciones, con todos sus bloques, referencias, documentos y test final', () => {
    expect(seed.formations.length).toBeGreaterThan(0);
    for (const f of seed.formations) {
      const form = formationToForm(f);
      expect(validateForm(form), f.id).toEqual([]);
      const back = formToFormation(form, meta(f, { version: f.version }));
      // Los minutos de lectura se recalculan con el texto (campo derivado).
      expect({ ...back, readingMinutes: f.readingMinutes }, f.id).toEqual(f);
      expect(formationSchema.safeParse(back).success, f.id).toBe(true);
    }
  });

  it('las evaluaciones del área (10 preguntas)', () => {
    for (const a of seed.assessments) {
      const form = assessmentToForm(a);
      expect(validateForm(form), a.id).toEqual([]);
      const back = formToAssessment(form, { id: a.id });
      expect(back, a.id).toEqual(a);
      expect(assessmentSchema.safeParse(back).success).toBe(true);
    }
  });

  it('las noticias, también los avisos para toda la firma con fuente interna «#/…»', () => {
    for (const n of seed.news) {
      const form = newsToForm(n);
      expect(validateForm(form), n.id).toEqual([]);
      const back = formToNews(form, meta(n));
      expect(back, n.id).toEqual(n);
      expect(newsSchema.safeParse(back).success).toBe(true);
    }
    expect(seed.news.some((n) => n.area === 'general')).toBe(true);
  });

  it('los eventos y comunicados, con foto, materiales, enlaces y resumen posterior', () => {
    for (const e of seed.events) {
      const form = eventToForm(e);
      expect(validateForm(form), e.id).toEqual([]);
      const back = formToEvent(form, meta(e));
      // «Archivado» es un estado editorial, no un campo del formulario.
      const { archived: _archived, ...rest } = e;
      expect(back, e.id).toEqual(rest);
      expect(eventSchema.safeParse(back).success).toBe(true);
    }
  });

  it('los documentos, con su historial de versiones y su PDF público en la demo', () => {
    for (const d of seed.documents) {
      const form = documentToForm(d);
      expect(validateForm(form), d.id).toEqual([]);
      const back = formToDocument(form, meta(d));
      // Publicar cambios sin PDF nuevo conserva «se puede mostrar en la demostración» (y la descarga).
      expect(back, d.id).toEqual({ ...d, versions: [...d.versions].sort((a, b) => a.version - b.version) });
      expect(documentSchema.safeParse(back).success).toBe(true);
    }
    expect(seed.documents.some((d) => d.publicDemo)).toBe(true);
  });

  it('los clientes nuevos y las bienvenidas de «Ponte al día»', () => {
    for (const c of seed.clients) {
      const back = formToClient(clientToForm(c), meta(c));
      expect(back).toEqual(c);
      expect(newClientSchema.safeParse(back).success).toBe(true);
    }
    for (const w of seed.welcomes) {
      const form = welcomeToForm(w);
      const back = formToWelcome(form, meta(w));
      // La confirmación «la persona lo sabe» no se publica: el esquema estricto la rechazaría.
      expect(back).toEqual(w);
      expect(welcomeSchema.safeParse(back).success).toBe(true);
    }
  });
});

describe('formularios nuevos y plantillas', () => {
  it('una formación nueva llega con su estructura y un test de tres preguntas, pero sin completar', () => {
    const form = recommendedFormation({ department: 'Laboral' }, today);
    expect(form.area).toBe('laboral');
    expect(form.blocks.filter((b) => b.type === 'heading')).toHaveLength(4);
    expect(form.blocks.some((b) => b.type === 'example')).toBe(true);
    expect(form.quiz.questions).toHaveLength(3);
    const errors = validateForm(form);
    expect(errors.map((e) => e.path)).toEqual(expect.arrayContaining(['title', 'summary', 'intro', 'takeaway', 'quiz.questions.0.prompt']));
  });

  it('partir de un ejemplo copia la estructura y quita lo que identifica al original', () => {
    const f = seed.formations[0]!;
    const copy = copyAsNew(formationToForm(f), today) as FormationForm;
    expect(copy.title).toBe(`Copia de ${f.title}`);
    expect(copy.slug).toBeUndefined();
    expect(copy.version).toBe(1);
    expect(copy.blocks).toHaveLength(f.blocks.length);
    expect(copy.blocks.filter((b) => b.type === 'heading').every((b) => b.type === 'heading' && !b.anchor)).toBe(true);
    const welcome = copyAsNew(welcomeToForm(seed.welcomes[0]!), today);
    expect(welcome).toMatchObject({ personId: '', confirmed: false, message: seed.welcomes[0]!.message });
  });

  it('cliente y bienvenida exigen la confirmación antes de publicar', () => {
    const client = { ...(newForm('cliente', null, today) as Extract<ReturnType<typeof newForm>, { type: 'cliente' }>), name: 'Fjordlys Analytics AS', sector: 'Software', country: 'Noruega' };
    expect(validateForm(client).map((e) => e.path)).toEqual(['confirmed']);
    expect(validateForm({ ...client, confirmed: true })).toEqual([]);
    expect(validateForm({ ...client, confirmed: true, country: 'Noruegia' }).map((e) => e.path)).toEqual(['country']);
  });

  it('un apoyo interactivo mal rellenado se señala en su bloque', () => {
    const f = formationToForm(seed.formations[0]!);
    const i = f.blocks.findIndex((b) => b.type === 'widget');
    expect(i).toBeGreaterThanOrEqual(0);
    const broken = { ...f, blocks: f.blocks.map((b, j) => (j === i && b.type === 'widget' ? { ...b, widget: { kind: 'recargo-extemporaneo' as const, cuota: -5 } } : b)) };
    const errors = validateForm(broken);
    expect(errors[0]?.path.startsWith(`blocks.${i}.widget`)).toBe(true);
    expect(errors[0]?.message).toContain('Recargo');
  });
});

describe('borradores guardados con el editor anterior', () => {
  it('los bloques «avanzados» bloqueados vuelven a ser editables y el test incrustado pasa al formulario', () => {
    const f = seed.formations[0]!;
    const table = f.blocks.find((b) => b.type === 'table')!;
    const legacy = {
      type: 'formacion',
      area: 'fiscal',
      title: 'Formación antigua',
      coverTerm: '',
      summary: 'Resumen',
      intro: 'Intro',
      outcomes: [{ id: 'o1', text: 'Uno' }],
      blocks: [
        { id: 'b1', type: 'heading', text: 'Apartado' },
        { id: 'b2', type: 'locked', block: table },
        { id: 'b3', type: 'list', ordered: true, items: 'Uno\nDos' },
      ],
      keyTerms: [],
      takeaway: '',
      sources: [{ id: 's1', label: 'BOE', url: 'https://www.boe.es', date: '2026-10-01' }],
      version: 2,
      quiz: f.quiz,
    };
    const form = normalizeForm(legacy) as FormationForm;
    expect(form.blocks.map((b) => b.type)).toEqual(['heading', 'table', 'list']);
    expect(form.blocks[1]).toEqual({ ...blockToForm(table), id: form.blocks[1]!.id, columns: expect.any(Array), rows: expect.any(Array) });
    expect(form.quiz.questions.map((q) => q.id)).toEqual(f.quiz.questions.map((q) => q.id));
    expect(form.sources[0]).toMatchObject({ label: 'BOE', kind: '' });
    expect(form).toMatchObject({ version: 2, majorChange: false, documentIds: [] });
  });

  it('una noticia «general» ya no se convierte en Fiscal y un formulario desconocido no rompe nada', () => {
    expect(normalizeForm({ type: 'noticia', area: 'general', headline: 'Aviso' })).toMatchObject({ area: 'general', headline: 'Aviso', urgency: 'media' });
    expect(normalizeForm({ type: 'otra-cosa' })).toBeNull();
    expect(normalizeForm(null)).toBeNull();
  });
});

describe('documentos en la demo', () => {
  it('un PDF elegido en la demo no se publica: mientras sea la versión vigente, queda «disponible en la versión interna»', () => {
    const d = seed.documents.find((x) => x.publicDemo)!;
    const upload = { name: 'nota-revisada.pdf', sizeKb: 120, pages: 2, checkedAt: '2026-10-29T10:00:00.000Z' };
    const withUpload = formToDocument({ ...documentToForm(d), upload, versionNote: 'Revisión' }, meta(d));
    expect(withUpload.versions.at(-1)?.file).toBe('demo-local/nota-revisada.pdf');
    expect(withUpload.publicDemo).toBe(false);
    // Otro cambio después, sin PDF nuevo: la vigente sigue siendo la elegida en la demo.
    expect(formToDocument({ ...documentToForm(withUpload), publicDemo: true, summary: 'Otro resumen' }, meta(d)).publicDemo).toBe(false);
    // El interruptor de administración se sigue respetando.
    expect(formToDocument({ ...documentToForm(d), publicDemo: false }, meta(d)).publicDemo).toBe(false);
  });
});

/** Formación de la semilla con un bloque cambiado (o añadido al final) para probar la validación. */
const fis01 = () => formationToForm(seed.formations.find((f) => f.id === 'fis-01')!);
const pathsOf = (form: FormationForm) => validateForm(form).map((e) => e.path);

function withWidget(widget: WidgetSpec): { form: FormationForm; i: number } {
  const form = fis01();
  const block = { ...(newBlock('widget') as Extract<EditorBlock, { type: 'widget' }>), widget: widgetToForm(widget) };
  return { form: { ...form, blocks: [...form.blocks, block] }, i: form.blocks.length };
}

const widgetErrors = (widget: WidgetSpec) => {
  const { form, i } = withWidget(widget);
  return { i, errors: validateForm(form) };
};

describe('validación de los bloques: nada se pierde ni se rompe al publicar', () => {
  it('un paso del ejemplo con cálculo o resultado pero sin descripción se señala en ese paso', () => {
    const form = fis01();
    const k = form.blocks.findIndex((b) => b.type === 'example');
    const example = form.blocks[k] as Extract<EditorBlock, { type: 'example' }>;
    const steps = [...example.steps, { id: 'nuevo', label: '', formula: '2.800 € × 5 %', result: '140 €' }];
    const errors = validateForm({ ...form, blocks: form.blocks.map((b, j) => (j === k ? { ...example, steps } : b)) });
    expect(errors).toEqual([{ path: `blocks.${k}.steps.${steps.length - 1}.label`, message: `Describe qué se hace en el paso ${steps.length} del ejemplo (bloque ${k + 1}) o borra su cálculo y su resultado.` }]);
    // Un paso vacío del todo no se publica, pero tampoco se pierde nada.
    expect(validateForm({ ...form, blocks: form.blocks.map((b, j) => (j === k ? { ...example, steps: [...example.steps, { id: 'vacio', label: '', formula: '', result: '' }] } : b)) })).toEqual([]);
  });

  it('un apartado sin contenido hasta el siguiente no se publica (en la lectura desaparecería)', () => {
    const form = fis01();
    const h = form.blocks.findIndex((b) => b.type === 'heading' && b.level !== 3);
    const before = form.blocks.slice(0, h).filter((b) => b.type === 'heading' && b.level !== 3).length;
    const heading = { ...(newBlock('heading') as Extract<EditorBlock, { type: 'heading' }>), text: 'Apartado nuevo' };
    const errors = validateForm({ ...form, blocks: [...form.blocks.slice(0, h), heading, ...form.blocks.slice(h)] });
    expect(errors).toEqual([{ path: `blocks.${h}.text`, message: `El apartado ${before + 1} no tiene contenido: añade algún bloque debajo de su título o elimínalo (bloque ${h + 1}).` }]);
    // También al final, y un subapartado solo no cuenta como contenido.
    const sub = { ...(newBlock('heading', { level: 3 }) as Extract<EditorBlock, { type: 'heading' }>), text: 'Subapartado' };
    expect(pathsOf({ ...form, blocks: [...form.blocks, heading, sub] })).toEqual([`blocks.${form.blocks.length}.text`]);
  });

  it('un error dentro de un apoyo se ancla en el bloque (donde se muestra) y dice en qué elemento está', () => {
    const linea = exampleWidget('linea-tiempo') as Extract<WidgetSpec, { kind: 'linea-tiempo' }>;
    const { i, errors } = widgetErrors({ ...linea, items: linea.items.map((it, j) => (j === 1 ? { ...it, title: '' } : it)) });
    expect(errors).toEqual([{ path: `blocks.${i}.widget`, message: `Revisa el apoyo «Línea de tiempo» (bloque ${i + 1}, hito 2): Hito: campo obligatorio.` }]);
  });

  it('árbol de decisión: pasos renombrados, borrados o duplicados que dejan saltos rotos no se publican', () => {
    const arbol = exampleWidget('arbol-decision') as Extract<WidgetSpec, { kind: 'arbol-decision' }>;
    expect(widgetErrors(arbol).errors).toEqual([]);
    const renamed = widgetErrors({ ...arbol, nodes: arbol.nodes.map((n, j) => (j === 0 ? { ...n, id: 'requerimiento-previo' } : n)) });
    expect(renamed.errors).toEqual([{ path: `blocks.${renamed.i}.widget`, message: `Revisa el apoyo «Árbol de decisión» (bloque ${renamed.i + 1}): El primer paso «requerimiento» no existe.` }]);
    const removed = widgetErrors({ ...arbol, nodes: arbol.nodes.filter((n) => n.id !== 'fin-escala') });
    expect(removed.errors[0]?.message).toBe(`Revisa el apoyo «Árbol de decisión» (bloque ${removed.i + 1}, paso 3, opción 1): La opción «No, menos de 12 meses» del paso «doce-meses» lleva a «fin-escala», que no existe.`);
    const duplicated = widgetErrors({ ...arbol, nodes: [...arbol.nodes, arbol.nodes[0]!] });
    expect(duplicated.errors[0]?.message).toContain(`(bloque ${duplicated.i + 1}, paso 8): Hay dos pasos con el identificador «requerimiento»`);
  });

  it('clasificador: sin categorías vacías ni repetidas, y cada elemento con una categoría que existe', () => {
    const clasificador = exampleWidget('clasificador') as Extract<WidgetSpec, { kind: 'clasificador' }>;
    expect(widgetErrors(clasificador).errors).toEqual([]);
    const sinPrimera = widgetErrors({ ...clasificador, categories: clasificador.categories.slice(1) });
    expect(sinPrimera.errors[0]?.message).toBe(`Revisa el apoyo «Clasificador» (bloque ${sinPrimera.i + 1}, elemento 1): La categoría correcta «Gasto anticipado (480 o 567)» ya no está entre las categorías.`);
    expect(widgetErrors({ ...clasificador, categories: [...clasificador.categories, ' '] }).errors[0]?.message).toContain('categoría 5): Categoría: campo obligatorio');
    expect(widgetErrors({ ...clasificador, categories: [...clasificador.categories, clasificador.categories[0]!] }).errors[0]?.message).toContain('categoría 5): La categoría «Gasto anticipado (480 o 567)» está repetida');
  });

  it('gráfico: como mucho cuatro series y con nombres distintos', () => {
    const grafico = exampleWidget('grafico') as Extract<WidgetSpec, { kind: 'grafico' }>;
    const serie = grafico.chart.series[0]!;
    const cinco = widgetErrors({ ...grafico, chart: { ...grafico.chart, series: [serie, ...['B', 'C', 'D', 'E'].map((name) => ({ ...serie, name }))] } });
    expect(cinco.errors[0]?.message).toBe(`Revisa el apoyo «Gráfico» (bloque ${cinco.i + 1}): Como mucho 4 series: el gráfico solo distingue cuatro colores y trazos.`);
    const repetidas = widgetErrors({ ...grafico, chart: { ...grafico.chart, series: [serie, serie] } });
    expect(repetidas.errors[0]?.message).toContain(`(bloque ${repetidas.i + 1}, serie 2): Hay dos series con el nombre «${serie.name}»`);
  });

  it('comparativa sin columna de rótulos (las de la semilla): se edita con la primera columna vacía y se publica igual', () => {
    const lab01 = seed.formations.find((f) => f.id === 'lab-01')!;
    const original = lab01.blocks.find((b) => b.type === 'widget' && b.widget.kind === 'comparativa') as Extract<(typeof lab01.blocks)[number], { type: 'widget' }>;
    const spec = original.widget as Extract<WidgetSpec, { kind: 'comparativa' }>;
    expect(spec.columns).toHaveLength(spec.rows[0]!.values.length);
    const edited = widgetToForm(spec) as typeof spec;
    expect(edited.columns).toEqual(['', ...spec.columns]);
    expect(widgetToShared(edited)).toEqual(spec);
    // Con rótulo de las filas se queda como está.
    const ejemplo = exampleWidget('comparativa');
    expect(widgetToShared(widgetToForm(ejemplo))).toEqual(ejemplo);
  });
});

describe('«Repasa» del test final', () => {
  it('ninguna pregunta de las formaciones de la demo aparece como desactualizada', () => {
    const stale = seed.formations.flatMap((f) => {
      const targets = reviewTargets(formationToForm(f).blocks);
      return f.quiz.questions.flatMap((q) => (q.ref && reviewRefProblem(q.ref, targets) ? [`${f.id}: ${q.ref}`] : []));
    });
    expect(stale).toEqual([]);
  });

  it('al insertar un apartado, el «Repasa» que ya no coincide se detecta y se propone el apartado correcto', () => {
    const form = fis01();
    const h = form.blocks.findIndex((b) => b.type === 'heading' && b.level !== 3);
    const heading = { ...(newBlock('heading') as Extract<EditorBlock, { type: 'heading' }>), text: 'Apartado nuevo' };
    const blocks = [...form.blocks.slice(0, h + 2), heading, newBlock('paragraph'), ...form.blocks.slice(h + 2)];
    const targets = reviewTargets(blocks);
    const ref = 'apartado 2, «Cuánto cuesta: la escala del recargo»';
    expect(reviewRefProblem(ref, reviewTargets(form.blocks))).toBeNull();
    expect(reviewRefProblem(ref, targets)).toEqual({ message: '«Cuánto cuesta: la escala del recargo» es ahora el apartado 3', suggestion: expect.objectContaining({ value: 'Apartado 3 · Cuánto cuesta: la escala del recargo' }) });
    expect(reviewRefProblem('Apartado 9 · Otro', targets)?.message).toBe('Ya no hay apartado 9');
    expect(reviewRefProblem(targets[1]!.value, targets)).toBeNull();
  });

  it('si se renombra o se borra el apartado que nombraba, también se avisa (comparando con los apartados al abrir el editor)', () => {
    const form = fis01();
    const opened = reviewTargets(form.blocks);
    const second = form.blocks.findIndex((b) => b.type === 'heading' && b.level !== 3 && b.text === 'Cuánto cuesta: la escala del recargo');
    const renamed = form.blocks.map((b, j) => (j === second && b.type === 'heading' ? { ...b, text: 'Tramos y porcentajes' } : b));
    const ref = 'apartado 2, «Cuánto cuesta: la escala del recargo»';
    expect(reviewRefProblem(ref, reviewTargets(renamed), opened)).toEqual({ message: 'Ya no hay ningún apartado «Cuánto cuesta: la escala del recargo»' });
    // Un título abreviado sigue coincidiendo, y un texto que nunca nombró un apartado no se marca.
    expect(reviewRefProblem('Apartado 2 · Cuánto cuesta', opened)).toBeNull();
    expect(reviewRefProblem('Apartado 2 · Ejemplo resuelto del cliente', opened, opened)).toBeNull();
  });
});

describe('eventos', () => {
  it('el mismo documento dos veces como material no se publica', () => {
    const e = seed.events.find((x) => x.materials?.length)!;
    const form = eventToForm(e);
    const errors = validateForm({ ...form, materials: [...form.materials, { ...form.materials[0]!, id: 'm-copia' }] });
    expect(errors).toEqual([{ path: `materials.${form.materials.length}.documentId`, message: `El material ${form.materials.length + 1} repite el documento del material 1: elige otro o quítalo.` }]);
  });
});

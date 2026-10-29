/**
 * Formularios del creador: estructura por tipo, valores iniciales, conversión desde y hacia los
 * tipos compartidos, lectura tolerante de borradores guardados con versiones anteriores y validación
 * con mensajes claros. La validación final reutiliza los esquemas zod de @flm/shared (los mismos que
 * aplica la API), así que lo que se publica aquí también es válido en la versión interna.
 */
import {
  AREAS,
  assessmentSchema,
  blockSchema,
  COUNTRY_NAMES,
  documentSchema,
  estimateReadingMinutes,
  eventSchema,
  formationSchema,
  fromMadrid,
  isAreaId,
  newClientSchema,
  newsSchema,
  normalize,
  slugify,
  welcomeSchema,
  wordCount,
  type AreaId,
  type Block,
  type CampusEvent,
  type ContentType,
  type DocumentVersion,
  type EditorialMeta,
  type EventIcon,
  type EventSession,
  type Formation,
  type LibraryDocument,
  type NewClient,
  type NewsItem,
  type NewsKind,
  type Person,
  type Quiz,
  type QuizQuestion,
  type Scope,
  type SectorAssessment,
  type SourceRef,
  type Welcome,
  type WidgetSpec,
} from '@flm/shared';
import type { CampusItem } from '@/data/store';
import { EXAMPLES } from '@/features/learn/widgets/examples';
import { MESSAGES } from '@/lib/messages';

let seq = 0;
/** Identificador local estable para elementos de listas del formulario. */
export const kid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(seq++).toString(36)}`;

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos de formulario
 * ──────────────────────────────────────────────────────────────────────────── */

export type CalloutTone = 'clave' | 'atencion' | 'consejo' | 'norma';
export type SourceKind = NonNullable<SourceRef['kind']>;

/** Fuente o referencia normativa (fuentes de la formación y referencias de un recuadro). */
export interface RefForm {
  id: string;
  label: string;
  url: string;
  date: string;
  kind: SourceKind | '';
}

export interface ExampleStepForm {
  id: string;
  label: string;
  formula: string;
  result: string;
}

export interface TableColumnForm {
  id: string;
  label: string;
  /** Columna de cifras: se alinea a la derecha con números tabulares. */
  numeric: boolean;
}

export interface TableRowForm {
  id: string;
  cells: string[];
}

/** Un bloque del contenido de la formación, tal como se edita. Cada uno corresponde a un `Block`. */
export type EditorBlock =
  | { id: string; type: 'heading'; text: string; level: 2 | 3; anchor?: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'list'; ordered: boolean; items: string }
  | { id: string; type: 'callout'; tone: CalloutTone; title: string; text: string; refs: RefForm[] }
  | { id: string; type: 'quote'; text: string; cite: string }
  | { id: string; type: 'example'; title: string; scenario: string; steps: ExampleStepForm[]; conclusion: string }
  | { id: string; type: 'table'; caption: string; columns: TableColumnForm[]; rows: TableRowForm[] }
  | { id: string; type: 'widget'; widget: WidgetSpec; caption: string }
  | { id: string; type: 'figure'; src: string; alt: string; caption: string };

export type BlockType = EditorBlock['type'];
export type WidgetKind = WidgetSpec['kind'];

export interface OptionForm {
  id: string;
  text: string;
  feedback: string;
}

export interface QuestionForm {
  id: string;
  prompt: string;
  options: OptionForm[];
  correctOptionId: string;
  explanation: string;
  /** «Repasa»: apartado al que remitir si se falla («Apartado 2 · Plazos»). */
  ref: string;
}

export interface QuizForm {
  id: string;
  title: string;
  questions: QuestionForm[];
}

export interface FormationForm {
  type: 'formacion';
  area: AreaId;
  title: string;
  /** Dirección pública fijada al publicar por primera vez (no se edita). */
  slug?: string;
  coverTerm: string;
  summary: string;
  intro: string;
  outcomes: { id: string; text: string }[];
  blocks: EditorBlock[];
  keyTerms: { id: string; term: string; definition: string }[];
  takeaway: string;
  sources: RefForm[];
  /** Documentos de la biblioteca vinculados («Documentos originales»). */
  documentIds: string[];
  /** Vigencia normativa comprobada a esta fecha (AAAA-MM-DD). */
  verifiedAt: string;
  /** Versión publicada de la formación. */
  version: number;
  /** Cambio importante: al publicar sube la versión y se pide de nuevo la confirmación de lectura. */
  majorChange: boolean;
  /** Test final: 3 preguntas, se supera con 2. */
  quiz: QuizForm;
}

/** Evaluación del área («Pon a prueba tus conocimientos»): 10 preguntas, se supera con 8. */
export interface AssessmentForm {
  type: 'test';
  area: AreaId;
  intro: string;
  quiz: QuizForm;
}

export type Urgency = NewsItem['urgency'];

export interface NewsForm {
  type: 'noticia';
  area: Scope;
  kind: NewsKind;
  urgency: Urgency;
  headline: string;
  oneLiner: string;
  affects: string;
  action: string;
  example: string;
  nuance: string;
  sourceLabel: string;
  sourceUrl: string;
  publishedOn: string;
  effectiveOn: string;
  date: string;
  slug?: string;
}

export interface UploadedFile {
  name: string;
  sizeKb: number;
  pages?: number;
  checkedAt: string;
  /** Miniatura real de la primera página (pdf.js), como data URL ligera. */
  thumb?: string;
}

export interface DocumentForm {
  type: 'documento';
  title: string;
  area: Scope;
  issuer: string;
  date: string;
  summary: string;
  kind: LibraryDocument['kind'];
  tags: string;
  notice: string;
  publicDemo: boolean;
  /** Historial publicado (solo lectura en el formulario). */
  versions: DocumentVersion[];
  /** PDF elegido y validado en el navegador: será la versión siguiente al publicar. */
  upload?: UploadedFile;
  versionNote: string;
}

export interface SessionForm {
  id: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  label: string;
  location: string;
}

export interface LinkForm {
  id: string;
  label: string;
  url: string;
  example: boolean;
}

export interface MaterialForm {
  id: string;
  label: string;
  documentId: string;
}

export interface EventImageForm {
  /** Nombre de una foto aprobada del manifiesto (assets/images.json). */
  src: string;
  alt: string;
  credit: string;
}

export interface EventForm {
  type: 'evento' | 'comunicado';
  category: CampusEvent['category'];
  title: string;
  summary: string;
  body: string;
  icon: EventIcon;
  pendingDate: boolean;
  pendingDateNote: string;
  sessions: SessionForm[];
  department: string;
  links: LinkForm[];
  manualPhase: '' | 'proximo' | 'historico';
  slug?: string;
  image: EventImageForm | null;
  materials: MaterialForm[];
  /** Resumen posterior del evento (histórico). */
  recap: string;
}

export interface ClientForm {
  type: 'cliente';
  name: string;
  sector: string;
  country: string;
  area: Scope;
  /** Fecha del anuncio (no la del encargo). */
  date: string;
  summary: string;
  /** Empresa inventada para la demostración: se rotula «Ejemplo ficticio». */
  fictional: boolean;
  /** «Se puede anunciar dentro de FLM, sin datos económicos ni confidenciales». Obligatoria para publicar; no se publica. */
  confirmed: boolean;
}

export interface WelcomeForm {
  type: 'bienvenida';
  personId: string;
  /** Fecha del anuncio: la ficha de la persona no guarda la de incorporación. */
  date: string;
  message: string;
  /** «La persona sabe que se anuncia su llegada». Obligatoria para publicar; no se publica. */
  confirmed: boolean;
}

export type AnyForm = FormationForm | AssessmentForm | NewsForm | DocumentForm | EventForm | ClientForm | WelcomeForm;

/* ────────────────────────────────────────────────────────────────────────────
 * Etiquetas
 * ──────────────────────────────────────────────────────────────────────────── */

export const NEWS_KIND_LABEL: Record<NewsKind, string> = {
  legislacion: 'Legislación',
  jurisprudencia: 'Resolución judicial',
  criterio: 'Criterio administrativo',
  'aviso-interno': 'Aviso interno',
};

export const URGENCY_LABEL: Record<Urgency, string> = {
  alta: 'Urgencia alta',
  media: 'Urgencia media',
  informativa: 'Informativa',
};

export const DOC_KIND_LABEL: Record<LibraryDocument['kind'], string> = {
  'nota-informativa': 'Nota informativa',
  boletin: 'Boletín',
  'publicacion-oficial': 'Publicación oficial',
  presentacion: 'Presentación',
  'material-evento': 'Material de evento',
};

export const CATEGORY_LABEL: Record<CampusEvent['category'], string> = {
  'formacion-interna': 'Formación interna',
  desayuno: 'Desayuno',
  encuentro: 'Encuentro',
  reconocimiento: 'Reconocimiento',
  celebracion: 'Celebración',
  iniciativa: 'Iniciativa',
  comunicacion: 'Comunicación',
};

export const CALLOUT_LABEL: Record<CalloutTone, string> = {
  clave: 'Explicamos',
  atencion: 'Atención',
  consejo: 'Consejo',
  norma: 'Norma',
};

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  norma: 'Norma',
  jurisprudencia: 'Jurisprudencia',
  criterio: 'Criterio administrativo',
  documento: 'Documento',
  web: 'Web',
};

export const WIDGET_LABEL: Record<WidgetKind, string> = {
  'recargo-extemporaneo': 'Recargo por presentar fuera de plazo',
  'indemnizacion-despido': 'Indemnización por despido',
  'disolucion-perdidas': 'Disolución por pérdidas',
  'calendario-cuentas': 'Calendario de cuentas anuales',
  amortizacion: 'Amortización contable y fiscal',
  periodificacion: 'Periodificación de un gasto',
  'cuentas-t': 'Cuentas en T',
  'arbol-decision': 'Árbol de decisión',
  'linea-tiempo': 'Línea de tiempo',
  'tarjetas-verdad': 'Verdadero, falso o depende',
  comparativa: 'Comparativa',
  clasificador: 'Clasificador',
  grafico: 'Gráfico',
};

/** Nombre de un bloque para la interfaz («Apartado», «Recuadro · Atención»…). */
export function blockLabel(b: EditorBlock): string {
  switch (b.type) {
    case 'heading':
      return b.level === 3 ? 'Subapartado' : 'Apartado';
    case 'paragraph':
      return 'Párrafo';
    case 'list':
      return b.ordered ? 'Lista numerada' : 'Lista';
    case 'callout':
      return b.tone === 'clave' ? 'Recuadro «Explicamos»' : `Recuadro · ${CALLOUT_LABEL[b.tone]}`;
    case 'quote':
      return 'Cita';
    case 'example':
      return 'Ejemplo resuelto';
    case 'table':
      return 'Tabla';
    case 'widget':
      return `Apoyo interactivo · ${WIDGET_LABEL[b.widget.kind]}`;
    case 'figure':
      return 'Fotografía';
  }
}

export const DEPARTMENTS = ['Toda la firma', 'Fiscal', 'Laboral', 'Mercantil', 'Contable', 'Dirección', 'Administración', 'Comunicación', 'Sistemas'];

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const ASSESSMENT_TITLE = 'Pon a prueba tus conocimientos';

/** Número de preguntas y aprobado de cada cuestionario. */
export const QUIZ_RULES = {
  formacion: { count: 3, passMark: 2 },
  test: { count: 10, passMark: 8 },
} as const;

/** Apartado al que puede remitir el «Repasa» de una pregunta del test final. */
export interface ReviewTarget {
  value: string;
  label: string;
  /** Número y título del apartado: con ellos se reconoce un «Repasa» que ya no coincide. */
  number?: number;
  title?: string;
}

/** Apartados actuales de la formación («Apartado 2 · Plazos»), para el «Repasa» de cada pregunta. */
export function reviewTargets(blocks: EditorBlock[]): ReviewTarget[] {
  let n = 0;
  return blocks.flatMap((b) => {
    if (b.type !== 'heading' || b.level === 3) return [];
    n += 1;
    const title = b.text.trim();
    const label = `Apartado ${n} · ${title || 'sin título'}`;
    return [{ value: label, label, number: n, title }];
  });
}

/**
 * Si el «Repasa» de una pregunta ya no coincide con los apartados (se insertó, movió, renombró o borró
 * alguno), qué no cuadra y, cuando se sabe, el apartado que le corresponde ahora. Coincide si es uno de los
 * apartados actuales o si nombra, con su número, un apartado que existe con ese título; las formaciones del
 * campus escriben también «apartado 2, «Plazos»», «Apartado «Plazos»» o el título abreviado. Un texto que no
 * nombra ningún apartado no se marca (puede remitir a un ejemplo), salvo que nombrara uno de los que había
 * al abrir el editor (`before`) y que ya no está.
 */
export function reviewRefProblem(ref: string, targets: ReviewTarget[], before: ReviewTarget[] = targets): { message: string; suggestion?: ReviewTarget } | null {
  const r = ref.trim();
  if (!r || targets.some((t) => t.value === r)) return null;
  const nr = normalize(r);
  const numbers = [...r.matchAll(/apartados?\s+(\d+(?:\s*(?:,|y|e)\s*\d+)*)/gi)].flatMap((m) => (m[1] ?? '').split(/\D+/).filter(Boolean).map(Number));
  // El formato del selector («Apartado 2 · Plazos»): su título puede venir abreviado.
  const own = normalize(/^apartado\s+\d+\s*·\s*(.+)$/i.exec(r)?.[1] ?? '');
  const titled = (list: ReviewTarget[]) => list.flatMap((t) => (t.title ? [{ t, key: normalize(t.title) }] : []));
  const current = titled(targets);
  const inRef = current.filter((x) => nr.includes(x.key));
  // Sin los títulos que solo aparecen dentro de otro más largo («Plazos» dentro de «Plazos de pago»).
  const found = inRef.filter((x) => !inRef.some((o) => o.key.length > x.key.length && o.key.includes(x.key))).map((x) => x.t);
  if (found.length) {
    const moved = numbers.length ? found.find((t) => !numbers.includes(t.number ?? 0)) : undefined;
    return moved ? { message: `«${moved.title}» es ahora el apartado ${moved.number}`, suggestion: moved } : null;
  }
  const abbreviated = own ? current.filter((x) => x.key.includes(own)).map((x) => x.t) : [];
  if (abbreviated.length) {
    if (!numbers.length || abbreviated.some((t) => numbers.includes(t.number ?? 0))) return null;
    const [moved] = abbreviated;
    return abbreviated.length === 1 && moved ? { message: `«${moved.title}» es ahora el apartado ${moved.number}`, suggestion: moved } : null;
  }
  const missing = numbers.find((n) => !targets.some((t) => t.number === n));
  if (missing !== undefined) return { message: `Ya no hay apartado ${missing}` };
  // Nombraba un apartado que había al abrir el editor y que ya no está: se renombró o se borró.
  const gone = titled(before).find((x) => nr.includes(x.key) || (own && x.key.includes(own)))?.t;
  return gone ? { message: `Ya no hay ningún apartado «${gone.title}»` } : null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Valores iniciales
 * ──────────────────────────────────────────────────────────────────────────── */

export function defaultArea(me: Pick<Person, 'department'> | null): AreaId {
  const match = (Object.keys(AREAS) as AreaId[]).find((a) => AREAS[a].name === me?.department);
  return match ?? 'fiscal';
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Apoyo interactivo de ejemplo (datos reales de las formaciones) para no empezar en blanco. */
export function exampleWidget(kind: WidgetKind): WidgetSpec {
  const found = EXAMPLES.find((e) => e.spec.kind === kind);
  if (found) return clone(found.spec);
  return { kind: 'recargo-extemporaneo', cuota: 1000 };
}

type ComparisonSpec = Extract<WidgetSpec, { kind: 'comparativa' }>;
const isComparison = (w: WidgetSpec): w is ComparisonSpec => w.kind === 'comparativa' && Array.isArray(w.columns) && Array.isArray(w.rows);
const valuesPerRow = (w: ComparisonSpec) => Math.max(0, ...w.rows.map((r) => (Array.isArray(r?.values) ? r.values.length : 0)));

/**
 * Apoyo tal como se edita. Una comparativa se edita siempre con la primera columna para el rótulo de las
 * filas: si el original no la tenía (tantas columnas como valores por fila), se añade vacía. Así los valores
 * de cada fila quedan alineados con las columnas siguientes y ninguna edición los descoloca.
 */
export function widgetToForm(widget: WidgetSpec): WidgetSpec {
  const spec = clone(widget);
  if (!isComparison(spec)) return spec;
  const width = valuesPerRow(spec);
  return width > 0 && spec.columns.length === width ? { ...spec, columns: ['', ...spec.columns] } : spec;
}

/** Al publicar, una comparativa sin rótulo de las filas vuelve a su forma corta (se ve igual). */
export function widgetToShared(widget: WidgetSpec): WidgetSpec {
  if (!isComparison(widget) || widget.columns[0]?.trim()) return widget;
  const width = valuesPerRow(widget);
  return width >= 2 && widget.columns.length === width + 1 ? { ...widget, columns: widget.columns.slice(1) } : widget;
}

export const newRef = (date = ''): RefForm => ({ id: kid('r'), label: '', url: '', date, kind: '' });

export const newStep = (): ExampleStepForm => ({ id: kid('s'), label: '', formula: '', result: '' });

export function newBlock(type: BlockType, opts: { level?: 2 | 3; tone?: CalloutTone; widget?: WidgetKind } = {}): EditorBlock {
  const id = kid('b');
  switch (type) {
    case 'heading':
      return { id, type, text: '', level: opts.level ?? 2 };
    case 'paragraph':
      return { id, type, text: '' };
    case 'list':
      return { id, type, ordered: false, items: '' };
    case 'callout':
      return { id, type, tone: opts.tone ?? 'clave', title: '', text: '', refs: [] };
    case 'quote':
      return { id, type, text: '', cite: '' };
    case 'example':
      return { id, type, title: '', scenario: '', steps: [newStep()], conclusion: '' };
    case 'table':
      return {
        id,
        type,
        caption: '',
        columns: [
          { id: kid('c'), label: '', numeric: false },
          { id: kid('c'), label: '', numeric: false },
        ],
        rows: [{ id: kid('f'), cells: ['', ''] }],
      };
    case 'widget':
      return { id, type, widget: exampleWidget(opts.widget ?? 'tarjetas-verdad'), caption: '' };
    case 'figure':
      return { id, type, src: '', alt: '', caption: '' };
  }
}

/** Copia de un bloque con identificadores nuevos (para «Duplicar»). */
export function duplicateBlock(b: EditorBlock): EditorBlock {
  const copy = clone(b);
  copy.id = kid('b');
  if (copy.type === 'heading') delete copy.anchor;
  if (copy.type === 'example') copy.steps = copy.steps.map((s) => ({ ...s, id: kid('s') }));
  if (copy.type === 'callout') copy.refs = copy.refs.map((r) => ({ ...r, id: kid('r') }));
  if (copy.type === 'table') {
    copy.columns = copy.columns.map((c) => ({ ...c, id: kid('c') }));
    copy.rows = copy.rows.map((r) => ({ ...r, id: kid('f') }));
  }
  return copy;
}

export const newOption = (id: string): OptionForm => ({ id, text: '', feedback: '' });

export const newQuestion = (): QuestionForm => ({
  id: kid('p'),
  prompt: '',
  options: ['a', 'b', 'c'].map(newOption),
  correctOptionId: '',
  explanation: '',
  ref: '',
});

export const newQuiz = (count: number, title: string): QuizForm => ({ id: '', title, questions: Array.from({ length: count }, newQuestion) });

export const newSession = (date = '', withTimes = true): SessionForm => ({
  id: kid('s'),
  startDate: date,
  startTime: withTimes ? '09:30' : '',
  endDate: '',
  endTime: withTimes ? '10:30' : '',
  label: '',
  location: '',
});

export const assessmentIntro = (area: AreaId) =>
  `Diez preguntas de dificultad media sobre las formaciones del área ${AREAS[area].name}. Se supera con 8 aciertos y puedes repetirla cuando quieras.`;

export function newForm(type: ContentType, me: Pick<Person, 'department'> | null, today: string): AnyForm {
  const area = defaultArea(me);
  switch (type) {
    case 'formacion':
      return {
        type,
        area,
        title: '',
        coverTerm: '',
        summary: '',
        intro: '',
        outcomes: [
          { id: kid('o'), text: '' },
          { id: kid('o'), text: '' },
        ],
        blocks: [newBlock('heading'), newBlock('paragraph'), newBlock('example')],
        keyTerms: [0, 1, 2].map(() => ({ id: kid('t'), term: '', definition: '' })),
        takeaway: '',
        sources: [newRef(today)],
        documentIds: [],
        verifiedAt: today,
        version: 1,
        majorChange: false,
        quiz: newQuiz(QUIZ_RULES.formacion.count, 'Test final'),
      };
    case 'test':
      return { type, area, intro: assessmentIntro(area), quiz: newQuiz(QUIZ_RULES.test.count, `Evaluación del área ${AREAS[area].name}`) };
    case 'noticia':
      return {
        type,
        area,
        kind: 'legislacion',
        urgency: 'media',
        headline: '',
        oneLiner: '',
        affects: '',
        action: '',
        example: '',
        nuance: '',
        sourceLabel: '',
        sourceUrl: '',
        publishedOn: today,
        effectiveOn: '',
        date: today,
      };
    case 'documento':
      return {
        type,
        title: '',
        area,
        issuer: `FLM · Área ${AREAS[area].name}`,
        date: today,
        summary: '',
        kind: 'nota-informativa',
        tags: '',
        notice: '',
        publicDemo: false,
        versions: [],
        versionNote: '',
      };
    case 'evento':
      return {
        type,
        category: 'encuentro',
        title: '',
        summary: '',
        body: '',
        icon: 'calendario',
        pendingDate: false,
        pendingDateNote: '',
        sessions: [newSession('')],
        department: 'Toda la firma',
        links: [],
        manualPhase: '',
        image: null,
        materials: [],
        recap: '',
      };
    case 'comunicado':
      return {
        type,
        category: 'comunicacion',
        title: '',
        summary: '',
        body: '',
        icon: 'megafono',
        pendingDate: false,
        pendingDateNote: '',
        sessions: [{ ...newSession(today, false), label: 'Fecha de publicación' }],
        department: 'Toda la firma',
        links: [],
        manualPhase: '',
        image: null,
        materials: [],
        recap: '',
      };
    case 'cliente':
      return { type, name: '', sector: '', country: '', area, date: today, summary: '', fictional: __DEMO__, confirmed: false };
    case 'bienvenida':
      return { type, personId: '', date: today, message: '', confirmed: false };
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Desde los tipos compartidos
 * ──────────────────────────────────────────────────────────────────────────── */

const refToForm = (r: SourceRef): RefForm => ({ id: kid('r'), label: r.label, url: r.url, date: r.date ?? '', kind: r.kind ?? '' });

export function blockToForm(b: Block): EditorBlock {
  const id = kid('b');
  switch (b.type) {
    case 'heading':
      return { id, type: 'heading', text: b.text, level: b.level === 3 ? 3 : 2, ...(b.id ? { anchor: b.id } : {}) };
    case 'paragraph':
      return { id, type: 'paragraph', text: b.text };
    case 'list':
      return { id, type: 'list', ordered: !!b.ordered, items: b.items.join('\n') };
    case 'callout':
      return { id, type: 'callout', tone: b.tone, title: b.title ?? '', text: b.text, refs: (b.refs ?? []).map(refToForm) };
    case 'quote':
      return { id, type: 'quote', text: b.text, cite: b.cite ?? '' };
    case 'example':
      return {
        id,
        type: 'example',
        title: b.title,
        scenario: b.scenario,
        steps: b.steps.map((s) => ({ id: kid('s'), label: s.label, formula: s.formula ?? '', result: s.result ?? '' })),
        conclusion: b.conclusion,
      };
    case 'table': {
      const numeric = new Set(b.numeric ?? []);
      return {
        id,
        type: 'table',
        caption: b.caption ?? '',
        columns: b.columns.map((label, i) => ({ id: kid('c'), label, numeric: numeric.has(i) })),
        rows: b.rows.map((cells) => ({ id: kid('f'), cells: b.columns.map((_, i) => cells[i] ?? '') })),
      };
    }
    case 'widget':
      return { id, type: 'widget', widget: widgetToForm(b.widget), caption: b.caption ?? '' };
    case 'figure':
      return { id, type: 'figure', src: b.src, alt: b.alt, caption: b.caption ?? '' };
  }
}

export function quizToForm(q: Quiz): QuizForm {
  return {
    id: q.id,
    title: q.title,
    questions: q.questions.map((x) => ({
      id: x.id,
      prompt: x.prompt,
      options: x.options.map((o) => ({ id: o.id, text: o.text, feedback: o.feedback ?? '' })),
      correctOptionId: x.correctOptionId,
      explanation: x.explanation,
      ref: x.ref ?? '',
    })),
  };
}

export function formationToForm(f: Formation): FormationForm {
  return {
    type: 'formacion',
    area: f.area,
    title: f.title,
    slug: f.slug,
    coverTerm: f.coverTerm ?? '',
    summary: f.summary,
    intro: f.intro,
    outcomes: f.outcomes.map((text) => ({ id: kid('o'), text })),
    blocks: f.blocks.map(blockToForm),
    keyTerms: f.keyTerms.map((k) => ({ id: kid('t'), term: k.term, definition: k.definition })),
    takeaway: f.takeaway,
    sources: f.sources.map(refToForm),
    documentIds: [...(f.documentIds ?? [])],
    verifiedAt: f.verifiedAt,
    version: f.version,
    majorChange: false,
    quiz: quizToForm(f.quiz),
  };
}

export function assessmentToForm(a: SectorAssessment): AssessmentForm {
  return { type: 'test', area: a.area, intro: a.intro, quiz: quizToForm(a.quiz) };
}

export function newsToForm(n: NewsItem): NewsForm {
  return {
    type: 'noticia',
    area: n.area,
    kind: n.kind,
    urgency: n.urgency,
    headline: n.headline,
    oneLiner: n.oneLiner,
    affects: n.affects,
    action: n.action,
    example: n.example,
    nuance: n.nuance ?? '',
    sourceLabel: n.source.label,
    sourceUrl: n.source.url,
    publishedOn: n.source.publishedOn,
    effectiveOn: n.source.effectiveOn ?? '',
    date: n.date,
    slug: n.slug,
  };
}

export function documentToForm(d: LibraryDocument): DocumentForm {
  return {
    type: 'documento',
    title: d.title,
    area: d.area,
    issuer: d.issuer,
    date: d.date,
    summary: d.summary,
    kind: d.kind,
    tags: d.tags.join(', '),
    notice: d.notice ?? '',
    publicDemo: d.publicDemo,
    versions: [...d.versions].sort((a, b) => a.version - b.version),
    versionNote: '',
  };
}

function splitLocal(local: string): [string, string] {
  const [date = '', time = ''] = local.split('T');
  return [date, time.slice(0, 5)];
}

export function eventToForm(e: CampusEvent): EventForm {
  return {
    type: e.kind,
    category: e.category,
    title: e.title,
    summary: e.summary,
    body: e.body ?? '',
    icon: e.icon,
    pendingDate: e.sessions.length === 0,
    pendingDateNote: e.pendingDateNote ?? '',
    sessions: e.sessions.map((s) => {
      const [startDate, startTime] = splitLocal(s.start);
      const [endD, endTime] = s.end ? splitLocal(s.end) : ['', ''];
      return { id: kid('s'), startDate, startTime, endDate: endD && endD !== startDate ? endD : '', endTime, label: s.label ?? '', location: s.location ?? '' };
    }),
    department: e.department ?? '',
    links: (e.links ?? []).map((l) => ({ id: kid('l'), label: l.label, url: l.url, example: !!l.example })),
    manualPhase: e.manualPhase ?? '',
    slug: e.slug,
    image: e.image ? { src: e.image.src, alt: e.image.alt, credit: e.image.credit ?? '' } : null,
    materials: (e.materials ?? []).map((m) => ({ id: kid('m'), label: m.label, documentId: m.documentId })),
    recap: e.recap ?? '',
  };
}

export function clientToForm(c: NewClient): ClientForm {
  return { type: 'cliente', name: c.name, sector: c.sector, country: c.country, area: c.area, date: c.date, summary: c.summary ?? '', fictional: !!c.fictional, confirmed: true };
}

export function welcomeToForm(w: Welcome): WelcomeForm {
  return { type: 'bienvenida', personId: w.personId, date: w.date, message: w.message, confirmed: true };
}

/** Formulario de un contenido del campus (semilla o publicado aquí) para editarlo o previsualizarlo. */
export function itemToForm(type: ContentType, item: CampusItem): AnyForm {
  switch (type) {
    case 'formacion':
      return formationToForm(item as Formation);
    case 'test':
      return assessmentToForm(item as SectorAssessment);
    case 'noticia':
      return newsToForm(item as NewsItem);
    case 'documento':
      return documentToForm(item as LibraryDocument);
    case 'evento':
    case 'comunicado':
      return eventToForm(item as CampusEvent);
    case 'cliente':
      return clientToForm(item as NewClient);
    case 'bienvenida':
      return welcomeToForm(item as Welcome);
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Hacia los tipos compartidos
 * ──────────────────────────────────────────────────────────────────────────── */

export interface BuildMeta {
  id: string;
  slug: string;
  editorial: EditorialMeta;
  /** Quién figura como responsable de la versión subida (documentos). */
  uploadedBy: string;
  today: string;
  /** Versión de la formación que se publica (la sube «Cambio importante»). */
  version?: number;
}

const clean = (s: string) => s.trim();
const opt = (s: string | undefined) => (s && s.trim() ? s.trim() : undefined);

const refToShared = (r: RefForm): SourceRef => ({ label: clean(r.label), url: clean(r.url), ...(r.date ? { date: r.date } : {}), ...(r.kind ? { kind: r.kind } : {}) });
const hasRef = (r: RefForm) => !!(r.label.trim() || r.url.trim());

export const listItems = (items: string) =>
  items
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

/** Bloque compartido de un bloque del editor (uno por uno: los índices coinciden para enlazar errores). */
export function blockToShared(b: EditorBlock): Block {
  switch (b.type) {
    case 'heading':
      return { type: 'heading', text: clean(b.text), ...(b.anchor ? { id: b.anchor } : {}), ...(b.level === 3 ? { level: 3 as const } : {}) };
    case 'paragraph':
      return { type: 'paragraph', text: clean(b.text) };
    case 'list':
      return { type: 'list', ...(b.ordered ? { ordered: true } : {}), items: listItems(b.items) };
    case 'callout': {
      const refs = b.refs.filter(hasRef).map(refToShared);
      return { type: 'callout', tone: b.tone, ...(opt(b.title) ? { title: clean(b.title) } : {}), text: clean(b.text), ...(refs.length ? { refs } : {}) };
    }
    case 'quote':
      return { type: 'quote', text: clean(b.text), ...(opt(b.cite) ? { cite: clean(b.cite) } : {}) };
    case 'example':
      return {
        type: 'example',
        title: clean(b.title),
        scenario: clean(b.scenario),
        steps: b.steps.filter((s) => s.label.trim()).map((s) => ({ label: clean(s.label), ...(opt(s.formula) ? { formula: clean(s.formula) } : {}), ...(opt(s.result) ? { result: clean(s.result) } : {}) })),
        conclusion: clean(b.conclusion),
      };
    case 'table': {
      const numeric = b.columns.flatMap((c, i) => (c.numeric ? [i] : []));
      return {
        type: 'table',
        ...(opt(b.caption) ? { caption: clean(b.caption) } : {}),
        columns: b.columns.map((c) => clean(c.label)),
        rows: b.rows.filter((r) => r.cells.some((c) => c.trim())).map((r) => b.columns.map((_, i) => clean(r.cells[i] ?? ''))),
        ...(numeric.length ? { numeric } : {}),
      };
    }
    case 'widget':
      return { type: 'widget', widget: widgetToShared(b.widget), ...(opt(b.caption) ? { caption: clean(b.caption) } : {}) };
    case 'figure':
      return { type: 'figure', src: b.src, alt: clean(b.alt), ...(opt(b.caption) ? { caption: clean(b.caption) } : {}) };
  }
}

export function formToQuiz(q: QuizForm, fallbackId: string, passMark: number): Quiz {
  return {
    id: q.id || fallbackId,
    title: clean(q.title) || 'Test final',
    passMark,
    questions: q.questions.map(
      (x): QuizQuestion => ({
        id: x.id,
        prompt: clean(x.prompt),
        options: x.options.map((o) => ({ id: o.id, text: clean(o.text), ...(o.id !== x.correctOptionId && opt(o.feedback) ? { feedback: clean(o.feedback) } : {}) })),
        correctOptionId: x.correctOptionId,
        explanation: clean(x.explanation),
        ...(opt(x.ref) ? { ref: clean(x.ref) } : {}),
      }),
    ),
  };
}

export function formationWords(form: FormationForm): number {
  const parts: string[] = [form.intro, form.takeaway, ...form.outcomes.map((o) => o.text)];
  for (const b of form.blocks) {
    if (b.type === 'heading' || b.type === 'paragraph' || b.type === 'quote') parts.push(b.text);
    else if (b.type === 'callout') parts.push(b.title, b.text);
    else if (b.type === 'list') parts.push(b.items);
    else if (b.type === 'example') parts.push(b.title, b.scenario, b.conclusion, ...b.steps.map((s) => `${s.label} ${s.formula} ${s.result}`));
    else if (b.type === 'table') parts.push(b.caption, ...b.columns.map((c) => c.label), ...b.rows.flatMap((r) => r.cells));
    else if (b.type === 'widget' || b.type === 'figure') parts.push(b.caption);
  }
  return wordCount(parts.join(' '));
}

/** Minutos de lectura estimados (entre 3 y 40, como exige el esquema). */
export const formationMinutes = (form: FormationForm) => Math.max(3, Math.min(40, estimateReadingMinutes(formationWords(form))));

export function formToFormation(form: FormationForm, meta: BuildMeta): Formation {
  const documentIds = form.documentIds.filter(Boolean);
  return {
    id: meta.id,
    slug: meta.slug,
    area: form.area,
    title: clean(form.title),
    intro: clean(form.intro),
    summary: clean(form.summary),
    ...(opt(form.coverTerm) ? { coverTerm: clean(form.coverTerm) } : {}),
    readingMinutes: formationMinutes(form),
    outcomes: form.outcomes.map((o) => clean(o.text)).filter(Boolean),
    blocks: form.blocks.map(blockToShared),
    keyTerms: form.keyTerms.filter((k) => k.term.trim() || k.definition.trim()).map((k) => ({ term: clean(k.term), definition: clean(k.definition) })),
    takeaway: clean(form.takeaway),
    sources: form.sources.filter(hasRef).map(refToShared),
    quiz: formToQuiz(form.quiz, `quiz-${meta.id}`, QUIZ_RULES.formacion.passMark),
    ...(documentIds.length ? { documentIds } : {}),
    version: meta.version ?? form.version,
    editorial: meta.editorial,
    verifiedAt: form.verifiedAt || meta.today,
  };
}

export function formToAssessment(form: AssessmentForm, meta: Pick<BuildMeta, 'id'>): SectorAssessment {
  const quiz = formToQuiz(form.quiz, `${meta.id}-quiz`, QUIZ_RULES.test.passMark);
  return { id: meta.id, area: form.area, title: ASSESSMENT_TITLE, intro: clean(form.intro), quiz: { ...quiz, title: `Evaluación del área ${AREAS[form.area].name}` } };
}

export function formToNews(form: NewsForm, meta: BuildMeta): NewsItem {
  return {
    id: meta.id,
    slug: meta.slug,
    area: form.area,
    kind: form.kind,
    headline: clean(form.headline),
    oneLiner: clean(form.oneLiner),
    affects: clean(form.affects),
    action: clean(form.action),
    example: clean(form.example),
    source: { label: clean(form.sourceLabel), url: clean(form.sourceUrl), publishedOn: form.publishedOn, ...(form.effectiveOn ? { effectiveOn: form.effectiveOn } : {}) },
    ...(opt(form.nuance) ? { nuance: clean(form.nuance) } : {}),
    urgency: form.urgency,
    date: form.date || meta.today,
    editorial: meta.editorial,
  };
}

/** Ruta simbólica de un PDF validado en el navegador: en la demo no se sube el archivo. */
export const DEMO_FILE_PREFIX = 'demo-local/';

export function uploadToVersion(upload: UploadedFile, version: number, uploadedBy: string, today: string, note: string): DocumentVersion {
  return {
    version,
    file: `${DEMO_FILE_PREFIX}${upload.name}`,
    sizeKb: Math.max(1, upload.sizeKb),
    ...(upload.pages ? { pages: upload.pages } : {}),
    uploadedAt: today,
    uploadedBy,
    ...(opt(note) ? { note: clean(note) } : {}),
  };
}

export const splitTags = (s: string) =>
  s
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

export function formToDocument(form: DocumentForm, meta: BuildMeta): LibraryDocument {
  const versions = [...form.versions];
  if (form.upload) versions.push(uploadToVersion(form.upload, (versions.at(-1)?.version ?? 0) + 1, meta.uploadedBy, meta.today, form.versionNote));
  // Versión vigente: la de número más alto (la que ofrecen la ficha y la descarga).
  const current = versions.reduce<DocumentVersion | undefined>((best, v) => (!best || v.version > best.version ? v : best), undefined);
  return {
    id: meta.id,
    title: clean(form.title),
    area: form.area,
    issuer: clean(form.issuer),
    date: form.date,
    summary: clean(form.summary),
    kind: form.kind,
    versions,
    tags: splitTags(form.tags),
    // En la demo el PDF elegido no se sube: si la versión vigente es uno de esos, el documento queda «disponible
    // en la versión interna». Si sigue vigente un PDF que ya estaba publicado, se respeta el interruptor.
    publicDemo: __DEMO__ ? form.publicDemo && !!current && !current.file.startsWith(DEMO_FILE_PREFIX) : form.publicDemo,
    ...(opt(form.notice) ? { notice: clean(form.notice) } : {}),
    editorial: meta.editorial,
  };
}

export function sessionToShared(s: SessionForm): EventSession {
  const start = s.startDate + (s.startTime ? `T${s.startTime}` : '');
  const endDate = s.endDate || (s.endTime ? s.startDate : '');
  const end = endDate ? endDate + (s.endTime ? `T${s.endTime}` : '') : undefined;
  return { start, ...(end ? { end } : {}), ...(opt(s.label) ? { label: clean(s.label) } : {}), ...(opt(s.location) ? { location: clean(s.location) } : {}) };
}

export function formToEvent(form: EventForm, meta: BuildMeta): CampusEvent {
  const links = form.links.filter((l) => l.label.trim() || l.url.trim()).map((l) => ({ label: clean(l.label), url: clean(l.url), ...(l.example ? { example: true } : {}) }));
  const materials = form.materials.filter((m) => m.label.trim() || m.documentId).map((m) => ({ label: clean(m.label), documentId: m.documentId }));
  return {
    id: meta.id,
    slug: meta.slug,
    kind: form.type,
    category: form.category,
    title: clean(form.title),
    summary: clean(form.summary),
    ...(opt(form.body) ? { body: clean(form.body) } : {}),
    icon: form.icon,
    ...(form.image?.src ? { image: { src: form.image.src, alt: clean(form.image.alt), ...(opt(form.image.credit) ? { credit: clean(form.image.credit) } : {}) } } : {}),
    sessions: form.pendingDate ? [] : form.sessions.filter((s) => s.startDate).map(sessionToShared),
    ...(form.pendingDate ? { pendingDateNote: opt(form.pendingDateNote) ?? 'Fecha por confirmar' } : {}),
    ...(form.manualPhase ? { manualPhase: form.manualPhase } : {}),
    ...(opt(form.department) ? { department: clean(form.department) } : {}),
    ...(links.length ? { links } : {}),
    ...(materials.length ? { materials } : {}),
    ...(opt(form.recap) ? { recap: clean(form.recap) } : {}),
    editorial: meta.editorial,
  };
}

export function formToClient(form: ClientForm, meta: Pick<BuildMeta, 'id' | 'editorial' | 'today'>): NewClient {
  return {
    id: meta.id,
    name: clean(form.name),
    sector: clean(form.sector),
    country: form.country,
    area: form.area,
    date: form.date || meta.today,
    ...(opt(form.summary) ? { summary: clean(form.summary) } : {}),
    ...(form.fictional ? { fictional: true } : {}),
    editorial: meta.editorial,
  };
}

/** La bienvenida solo guarda la persona, la fecha del anuncio y el mensaje (la confirmación no se publica). */
export function formToWelcome(form: WelcomeForm, meta: Pick<BuildMeta, 'id' | 'editorial' | 'today'>): Welcome {
  return { id: meta.id, personId: form.personId, date: form.date || meta.today, message: clean(form.message), editorial: meta.editorial };
}

/** Contenido compartido que resulta de un formulario (lo que se publica). */
export function formToItem(form: AnyForm, meta: BuildMeta): CampusItem {
  switch (form.type) {
    case 'formacion':
      return formToFormation(form, meta);
    case 'test':
      return formToAssessment(form, meta);
    case 'noticia':
      return formToNews(form, meta);
    case 'documento':
      return formToDocument(form, meta);
    case 'evento':
    case 'comunicado':
      return formToEvent(form, meta);
    case 'cliente':
      return formToClient(form, meta);
    case 'bienvenida':
      return formToWelcome(form, meta);
  }
}

export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const set = new Set(taken);
  const root = slugify(base).slice(0, 80).replace(/-+$/, '') || 'contenido';
  if (!set.has(root)) return root;
  let n = 2;
  while (set.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Lectura tolerante: borradores guardados con versiones anteriores del editor
 * ──────────────────────────────────────────────────────────────────────────── */

type Raw = Record<string, unknown>;
const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function normalizeRef(v: unknown): RefForm {
  const r = isObj(v) ? v : {};
  const kind = str(r.kind);
  return { id: str(r.id) || kid('r'), label: str(r.label), url: str(r.url), date: str(r.date), kind: kind in SOURCE_KIND_LABEL ? (kind as SourceKind) : '' };
}

function normalizeBlock(v: unknown): EditorBlock | null {
  if (!isObj(v)) return null;
  // Editor anterior: los bloques avanzados se guardaban «bloqueados» con el bloque original dentro.
  if (v.type === 'locked' && isObj(v.block)) return blockToForm(v.block as Block);
  const id = str(v.id) || kid('b');
  switch (v.type) {
    case 'heading':
      return { id, type: 'heading', text: str(v.text), level: v.level === 3 ? 3 : 2, ...(str(v.anchor) ? { anchor: str(v.anchor) } : {}) };
    case 'paragraph':
      return { id, type: 'paragraph', text: str(v.text) };
    case 'list':
      return { id, type: 'list', ordered: !!v.ordered, items: Array.isArray(v.items) ? v.items.map((x) => str(x)).join('\n') : str(v.items) };
    case 'callout': {
      const tone = str(v.tone, 'clave');
      return { id, type: 'callout', tone: (tone in CALLOUT_LABEL ? tone : 'clave') as CalloutTone, title: str(v.title), text: str(v.text), refs: arr(v.refs).map(normalizeRef) };
    }
    case 'quote':
      return { id, type: 'quote', text: str(v.text), cite: str(v.cite) };
    case 'example':
      return {
        id,
        type: 'example',
        title: str(v.title),
        scenario: str(v.scenario),
        steps: arr(v.steps).map((s) => (isObj(s) ? { id: str(s.id) || kid('s'), label: str(s.label), formula: str(s.formula), result: str(s.result) } : newStep())),
        conclusion: str(v.conclusion),
      };
    case 'table': {
      if (Array.isArray(v.columns) && v.columns.every((c) => typeof c === 'string')) return blockToForm(v as unknown as Block);
      const columns = arr(v.columns).map((c) => (isObj(c) ? { id: str(c.id) || kid('c'), label: str(c.label), numeric: !!c.numeric } : { id: kid('c'), label: '', numeric: false }));
      const rows = arr(v.rows).map((r) => (isObj(r) ? { id: str(r.id) || kid('f'), cells: columns.map((_, i) => str(arr(r.cells)[i])) } : { id: kid('f'), cells: columns.map(() => '') }));
      return { id, type: 'table', caption: str(v.caption), columns, rows };
    }
    case 'widget':
      return isObj(v.widget) && typeof v.widget.kind === 'string' && v.widget.kind in WIDGET_LABEL ? { id, type: 'widget', widget: widgetToForm(v.widget as unknown as WidgetSpec), caption: str(v.caption) } : null;
    case 'figure':
      return { id, type: 'figure', src: str(v.src), alt: str(v.alt), caption: str(v.caption) };
    default:
      return null;
  }
}

function normalizeQuiz(v: unknown, count: number, title: string): QuizForm {
  if (!isObj(v)) return newQuiz(count, title);
  // Test del tipo compartido (formaciones existentes y tests del editor anterior): con «passMark».
  if ('passMark' in v && Array.isArray(v.questions)) return quizToForm(v as unknown as Quiz);
  return {
    id: str(v.id),
    title: str(v.title, title),
    questions: arr(v.questions).map((q) => {
      const x = isObj(q) ? q : {};
      return {
        id: str(x.id) || kid('p'),
        prompt: str(x.prompt),
        options: arr(x.options).map((o) => (isObj(o) ? { id: str(o.id), text: str(o.text), feedback: str(o.feedback) } : newOption('a'))),
        correctOptionId: str(x.correctOptionId),
        explanation: str(x.explanation),
        ref: str(x.ref),
      };
    }),
  };
}

/**
 * Formulario completo a partir de lo guardado en un borrador, aunque lo guardara una versión anterior
 * del editor (bloques «avanzados» bloqueados, test aparte, área «general» de los avisos…). Los campos que
 * falten toman su valor inicial: así ningún borrador se rompe ni se pierde. `null` si no se reconoce.
 */
export function normalizeForm(raw: unknown, today = ''): AnyForm | null {
  if (!isObj(raw) || typeof raw.type !== 'string') return null;
  const type = raw.type as ContentType;
  switch (type) {
    case 'formacion': {
      const base = newForm('formacion', null, today) as FormationForm;
      const area = isAreaId(raw.area) ? raw.area : base.area;
      return {
        ...base,
        area,
        title: str(raw.title),
        ...(str(raw.slug) ? { slug: str(raw.slug) } : {}),
        coverTerm: str(raw.coverTerm),
        summary: str(raw.summary),
        intro: str(raw.intro),
        outcomes: Array.isArray(raw.outcomes) ? raw.outcomes.map((o) => ({ id: (isObj(o) && str(o.id)) || kid('o'), text: isObj(o) ? str(o.text) : str(o) })) : base.outcomes,
        blocks: Array.isArray(raw.blocks) ? raw.blocks.map(normalizeBlock).filter((b): b is EditorBlock => b !== null) : base.blocks,
        keyTerms: Array.isArray(raw.keyTerms) ? raw.keyTerms.map((k) => ({ id: (isObj(k) && str(k.id)) || kid('t'), term: isObj(k) ? str(k.term) : '', definition: isObj(k) ? str(k.definition) : '' })) : base.keyTerms,
        takeaway: str(raw.takeaway),
        sources: Array.isArray(raw.sources) ? raw.sources.map(normalizeRef) : base.sources,
        documentIds: arr(raw.documentIds).map((d) => str(d)).filter(Boolean),
        verifiedAt: str(raw.verifiedAt, base.verifiedAt),
        version: typeof raw.version === 'number' && raw.version > 0 ? raw.version : 1,
        majorChange: !!raw.majorChange,
        quiz: raw.quiz ? normalizeQuiz(raw.quiz, QUIZ_RULES.formacion.count, 'Test final') : base.quiz,
      };
    }
    case 'test': {
      // Los tests del editor anterior (enlazados a una formación) se pasan a su formación al migrar.
      if ('formationId' in raw) return null;
      const area = isAreaId(raw.area) ? raw.area : 'fiscal';
      return { type: 'test', area, intro: str(raw.intro, assessmentIntro(area)), quiz: normalizeQuiz(raw.quiz, QUIZ_RULES.test.count, `Evaluación del área ${AREAS[area].name}`) };
    }
    case 'noticia': {
      const base = newForm('noticia', null, today) as NewsForm;
      return { ...base, ...(raw as Partial<NewsForm>), type: 'noticia', area: isAreaId(raw.area) || raw.area === 'general' ? (raw.area as Scope) : base.area };
    }
    case 'documento': {
      const base = newForm('documento', null, today) as DocumentForm;
      return { ...base, ...(raw as Partial<DocumentForm>), type: 'documento', versions: arr(raw.versions) as DocumentVersion[] };
    }
    case 'evento':
    case 'comunicado': {
      const base = newForm(type, null, today) as EventForm;
      const image = isObj(raw.image) && str(raw.image.src) ? { src: str(raw.image.src), alt: str(raw.image.alt), credit: str(raw.image.credit) } : null;
      return {
        ...base,
        ...(raw as Partial<EventForm>),
        type,
        sessions: arr(raw.sessions) as SessionForm[],
        links: arr(raw.links) as LinkForm[],
        image,
        materials: arr(raw.materials).map((m) => (isObj(m) ? { id: str(m.id) || kid('m'), label: str(m.label), documentId: str(m.documentId) } : { id: kid('m'), label: '', documentId: '' })),
        recap: str(raw.recap),
        manualPhase: raw.manualPhase === 'proximo' || raw.manualPhase === 'historico' ? raw.manualPhase : '',
      };
    }
    case 'cliente': {
      const base = newForm('cliente', null, today) as ClientForm;
      return { ...base, ...(raw as Partial<ClientForm>), type: 'cliente', fictional: !!raw.fictional, confirmed: !!raw.confirmed };
    }
    case 'bienvenida': {
      const base = newForm('bienvenida', null, today) as WelcomeForm;
      return { ...base, ...(raw as Partial<WelcomeForm>), type: 'bienvenida', confirmed: !!raw.confirmed };
    }
    default:
      return null;
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Validación
 * ──────────────────────────────────────────────────────────────────────────── */

export interface FieldError {
  path: string;
  message: string;
}

const HTTPS = /^https:\/\/[^\s]+$/;
const INTERNAL = /^#\/[^\s]*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const empty = (s: string | undefined) => !s || !s.trim();

function validateQuiz(q: QuizForm, count: number, base: string, what: string, out: FieldError[]) {
  if (q.questions.length !== count) out.push({ path: `${base}.questions`, message: `${what} debe tener exactamente ${count} preguntas (ahora ${q.questions.length === 1 ? 'tiene 1' : `tiene ${q.questions.length}`}).` });
  q.questions.forEach((x, i) => {
    const n = i + 1;
    const p = `${base}.questions.${i}`;
    if (empty(x.prompt)) out.push({ path: `${p}.prompt`, message: `Escribe el enunciado de la pregunta ${n}.` });
    if (x.options.length < 3) out.push({ path: `${p}.options`, message: `La pregunta ${n} necesita al menos 3 opciones.` });
    x.options.forEach((o, j) => {
      const letter = OPTION_LETTERS[j] ?? String(j + 1);
      if (empty(o.text)) out.push({ path: `${p}.options.${j}.text`, message: `Escribe la opción ${letter} de la pregunta ${n}.` });
      if (x.correctOptionId && o.id !== x.correctOptionId && empty(o.feedback)) out.push({ path: `${p}.options.${j}.feedback`, message: `Explica por qué la opción ${letter} de la pregunta ${n} no es correcta.` });
    });
    if (!x.correctOptionId || !x.options.some((o) => o.id === x.correctOptionId)) out.push({ path: `${p}.correct`, message: `Marca la respuesta correcta de la pregunta ${n}.` });
    if (empty(x.explanation)) out.push({ path: `${p}.explanation`, message: `Explica la respuesta correcta de la pregunta ${n}.` });
  });
}

function validateRefs(refs: RefForm[], base: string, what: string, out: FieldError[]) {
  refs.forEach((r, i) => {
    if (!hasRef(r)) return;
    if (empty(r.label)) out.push({ path: `${base}.${i}.label`, message: `Indica el nombre de ${what} ${i + 1}.` });
    if (!HTTPS.test(r.url.trim())) out.push({ path: `${base}.${i}.url`, message: `El enlace de ${what} ${i + 1} debe empezar por https://.` });
    if (r.date && !DATE.test(r.date)) out.push({ path: `${base}.${i}.date`, message: `Revisa la fecha de ${what} ${i + 1}.` });
  });
}

function validateBlock(b: EditorBlock, i: number, out: FieldError[]) {
  const n = i + 1;
  const p = `blocks.${i}`;
  const label = blockLabel(b).toLowerCase();
  switch (b.type) {
    case 'heading':
    case 'paragraph':
      if (empty(b.text)) out.push({ path: `${p}.text`, message: `Completa el texto del bloque ${n} (${label}) o elimínalo.` });
      return;
    case 'list':
      if (!listItems(b.items).length) out.push({ path: `${p}.items`, message: `Escribe al menos un elemento en la lista (bloque ${n}).` });
      return;
    case 'callout':
      if (empty(b.text)) out.push({ path: `${p}.text`, message: `Completa el texto del recuadro (bloque ${n}).` });
      if (b.tone === 'clave' && empty(b.title)) out.push({ path: `${p}.title`, message: `Indica el término que explica el recuadro «Explicamos» (bloque ${n}).` });
      validateRefs(b.refs, `${p}.refs`, 'la referencia', out);
      return;
    case 'quote':
      if (empty(b.text)) out.push({ path: `${p}.text`, message: `Escribe la cita (bloque ${n}).` });
      return;
    case 'example': {
      if (empty(b.title)) out.push({ path: `${p}.title`, message: `Pon título al ejemplo resuelto (bloque ${n}).` });
      if (empty(b.scenario)) out.push({ path: `${p}.scenario`, message: `Describe el planteamiento del ejemplo (bloque ${n}).` });
      // Un paso sin descripción no se publica: si tiene cálculo o resultado, se perderían sin aviso.
      const orphans = b.steps.flatMap((s, j) => (empty(s.label) && !(empty(s.formula) && empty(s.result)) ? [j] : []));
      if (!orphans.length && !b.steps.some((s) => s.label.trim())) out.push({ path: `${p}.steps`, message: `Añade al menos un paso al ejemplo (bloque ${n}).` });
      for (const j of orphans) out.push({ path: `${p}.steps.${j}.label`, message: `Describe qué se hace en el paso ${j + 1} del ejemplo (bloque ${n}) o borra su cálculo y su resultado.` });
      if (empty(b.conclusion)) out.push({ path: `${p}.conclusion`, message: `Escribe la conclusión del ejemplo (bloque ${n}).` });
      return;
    }
    case 'table':
      if (b.columns.length < 2 || b.columns.some((c) => empty(c.label))) out.push({ path: `${p}.columns`, message: `La tabla del bloque ${n} necesita al menos 2 columnas, todas con título.` });
      if (!b.rows.some((r) => r.cells.some((c) => c.trim()))) out.push({ path: `${p}.rows`, message: `Añade al menos una fila con datos a la tabla (bloque ${n}).` });
      return;
    case 'figure':
      if (empty(b.src)) out.push({ path: `${p}.src`, message: `Elige la fotografía del bloque ${n}.` });
      if (empty(b.alt)) out.push({ path: `${p}.alt`, message: `Describe la fotografía del bloque ${n} (texto alternativo).` });
      return;
    case 'widget': {
      // El mismo esquema que la API, con la estructura de cada apoyo (árbol, clasificador, gráfico…).
      // El error se ancla en el apoyo, que es donde se muestra; el mensaje dice en qué elemento está.
      const parsed = blockSchema.safeParse(blockToShared(b));
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const place = widgetPlace(b.widget.kind, issue?.path.slice(1) ?? []);
        out.push({ path: `${p}.widget`, message: `Revisa el apoyo «${WIDGET_LABEL[b.widget.kind]}» (bloque ${n}${place ? `, ${place}` : ''}): ${issue?.message ?? 'faltan datos'}.` });
      }
      return;
    }
  }
}

/** Nombre de los elementos de cada lista de un apoyo, para situar un error («paso 2, opción 1»). */
const WIDGET_ITEM: Partial<Record<string, string>> = {
  entries: 'asiento',
  lines: 'línea',
  nodes: 'paso',
  options: 'opción',
  cards: 'tarjeta',
  rows: 'fila',
  categories: 'categoría',
  series: 'serie',
};

/** Dónde está el error dentro del apoyo, a partir de la ruta del esquema («items.1.title» → «hito 2»). */
export function widgetPlace(kind: WidgetKind, path: readonly PropertyKey[]): string {
  return path
    .flatMap((key, i) => {
      const index = path[i + 1];
      if (typeof key !== 'string' || typeof index !== 'number') return [];
      const name = key === 'items' ? (kind === 'linea-tiempo' ? 'hito' : 'elemento') : key === 'values' ? (kind === 'grafico' ? 'punto' : undefined) : WIDGET_ITEM[key];
      return name ? [`${name} ${index + 1}`] : [];
    })
    .join(', ');
}

function validateFormation(f: FormationForm, out: FieldError[]) {
  if (empty(f.title)) out.push({ path: 'title', message: MESSAGES.required('el título de la formación') });
  if (f.coverTerm.trim().length > 16) out.push({ path: 'coverTerm', message: 'El término de portada admite 16 caracteres como máximo.' });
  if (empty(f.summary)) out.push({ path: 'summary', message: 'Escribe el resumen que se verá en las tarjetas.' });
  else if (f.summary.trim().length > 220) out.push({ path: 'summary', message: `El resumen admite 220 caracteres como máximo (ahora tiene ${f.summary.trim().length}).` });
  if (empty(f.intro)) out.push({ path: 'intro', message: 'Escribe la introducción práctica: por qué importa, con una situación real.' });
  const filled = f.outcomes.filter((o) => o.text.trim());
  if (filled.length < 2 || filled.length > 3) {
    const firstEmpty = f.outcomes.findIndex((o) => !o.text.trim());
    out.push({ path: firstEmpty >= 0 && filled.length < 2 ? `outcomes.${firstEmpty}` : 'outcomes', message: 'Escribe entre 2 y 3 resultados de aprendizaje.' });
  }
  if (f.blocks.length < 3) out.push({ path: 'blocks', message: 'Añade al menos 3 bloques de contenido.' });
  if (!f.blocks.some((b) => b.type === 'example')) out.push({ path: 'blocks', message: 'Añade un ejemplo resuelto: es obligatorio en todas las formaciones.' });
  let section = 0;
  f.blocks.forEach((b, i) => {
    validateBlock(b, i, out);
    if (b.type !== 'heading' || b.level === 3) return;
    // Un apartado sin contenido hasta el siguiente: en la lectura desaparecería o quedaría vacío.
    section += 1;
    const next = f.blocks.findIndex((x, j) => j > i && x.type === 'heading' && x.level !== 3);
    if (!f.blocks.slice(i + 1, next < 0 ? undefined : next).some((x) => x.type !== 'heading')) {
      out.push({ path: `blocks.${i}.text`, message: `El apartado ${section} no tiene contenido: añade algún bloque debajo de su título o elimínalo (bloque ${i + 1}).` });
    }
  });
  f.keyTerms.forEach((k, i) => {
    if (k.term.trim() && !k.definition.trim()) out.push({ path: `keyTerms.${i}.definition`, message: `Escribe la definición de «${k.term.trim()}».` });
    if (!k.term.trim() && k.definition.trim()) out.push({ path: `keyTerms.${i}.term`, message: `Indica el término que corresponde a la definición ${i + 1}.` });
  });
  if (f.keyTerms.filter((k) => k.term.trim() && k.definition.trim()).length < 3) out.push({ path: 'keyTerms', message: 'Añade al menos 3 términos clave con su definición.' });
  if (empty(f.takeaway)) out.push({ path: 'takeaway', message: MESSAGES.required('la idea clave') });
  if (!f.sources.some((s) => s.label.trim())) out.push({ path: 'sources', message: 'Añade al menos una fuente.' });
  validateRefs(f.sources, 'sources', 'la fuente', out);
  if (!DATE.test(f.verifiedAt)) out.push({ path: 'verifiedAt', message: 'Indica la fecha en que comprobaste que la normativa está vigente.' });
  validateQuiz(f.quiz, QUIZ_RULES.formacion.count, 'quiz', 'El test final', out);
}

function validateAssessment(f: AssessmentForm, out: FieldError[]) {
  if (empty(f.intro)) out.push({ path: 'intro', message: 'Escribe la introducción de la evaluación.' });
  validateQuiz(f.quiz, QUIZ_RULES.test.count, 'quiz', 'La evaluación del área', out);
}

function validateNews(f: NewsForm, out: FieldError[]) {
  if (empty(f.headline)) out.push({ path: 'headline', message: MESSAGES.required('el titular') });
  else if (f.headline.trim().length > 110) out.push({ path: 'headline', message: `El titular admite 110 caracteres como máximo (ahora tiene ${f.headline.trim().length}).` });
  if (empty(f.oneLiner)) out.push({ path: 'oneLiner', message: 'Escribe la novedad en una frase (bloque 1).' });
  if (empty(f.affects)) out.push({ path: 'affects', message: 'Indica a quién afecta (bloque 2).' });
  if (empty(f.action)) out.push({ path: 'action', message: 'Explica qué debemos hacer (bloque 3).' });
  if (empty(f.example)) out.push({ path: 'example', message: 'Añade un ejemplo sencillo (bloque 4).' });
  if (empty(f.sourceLabel)) out.push({ path: 'sourceLabel', message: 'Indica la fuente: norma, resolución, criterio o comunicación interna (bloque 5).' });
  const url = f.sourceUrl.trim();
  if (!url) out.push({ path: 'sourceUrl', message: 'Añade el enlace a la fuente (bloque 5).' });
  else if (!HTTPS.test(url) && !(f.kind === 'aviso-interno' && INTERNAL.test(url))) {
    out.push({ path: 'sourceUrl', message: f.kind === 'aviso-interno' ? 'El enlace debe empezar por https:// o ser una ruta del campus que empiece por #/.' : 'El enlace de la fuente debe empezar por https://.' });
  }
  if (!DATE.test(f.publishedOn)) out.push({ path: 'publishedOn', message: 'Indica la fecha de publicación de la fuente.' });
  if (f.effectiveOn && !DATE.test(f.effectiveOn)) out.push({ path: 'effectiveOn', message: 'Revisa la fecha de entrada en vigor.' });
  if (!DATE.test(f.date)) out.push({ path: 'date', message: 'Indica la fecha con la que aparecerá en Actualidad.' });
}

function validateDocument(f: DocumentForm, out: FieldError[]) {
  if (empty(f.title)) out.push({ path: 'title', message: MESSAGES.required('el título del documento') });
  if (empty(f.issuer)) out.push({ path: 'issuer', message: 'Indica quién emite el documento.' });
  if (!DATE.test(f.date)) out.push({ path: 'date', message: MESSAGES.required('la fecha del documento') });
  if (empty(f.summary)) out.push({ path: 'summary', message: 'Escribe un resumen del documento.' });
  if (f.versions.length === 0 && !f.upload) out.push({ path: 'upload', message: 'Sube el PDF del documento.' });
}

function validateEvent(f: EventForm, out: FieldError[]) {
  if (empty(f.title)) out.push({ path: 'title', message: MESSAGES.required('el título') });
  if (empty(f.summary)) out.push({ path: 'summary', message: 'Escribe una descripción breve.' });
  if (!f.pendingDate) {
    if (f.type === 'evento' && f.sessions.length === 0) out.push({ path: 'sessions', message: 'Añade al menos una sesión o marca «Fecha por confirmar».' });
    f.sessions.forEach((s, i) => {
      const n = i + 1;
      if (!DATE.test(s.startDate)) {
        out.push({ path: `sessions.${i}.startDate`, message: `Indica la fecha de la sesión ${n}.` });
        return;
      }
      if (s.startTime && !TIME.test(s.startTime)) out.push({ path: `sessions.${i}.startTime`, message: `Revisa la hora de inicio de la sesión ${n}.` });
      if (s.endTime && !s.startTime) out.push({ path: `sessions.${i}.startTime`, message: `Indica la hora de inicio de la sesión ${n} si indicas la de fin.` });
      if (s.endDate || s.endTime) {
        const sh = sessionToShared(s);
        if (sh.end && fromMadrid(sh.end, true).getTime() <= fromMadrid(sh.start).getTime()) {
          out.push({ path: s.endTime ? `sessions.${i}.endTime` : `sessions.${i}.endDate`, message: `La sesión ${n} termina antes de empezar. Revisa la fecha o la hora de fin.` });
        }
      }
    });
  }
  if (f.image && f.image.src && empty(f.image.alt)) out.push({ path: 'image.alt', message: 'Describe la fotografía (texto alternativo).' });
  f.links.forEach((l, i) => {
    const n = i + 1;
    if (empty(l.label) && empty(l.url)) return;
    if (empty(l.label)) out.push({ path: `links.${i}.label`, message: `Indica el texto del enlace ${n}.` });
    if (empty(l.url)) out.push({ path: `links.${i}.url`, message: `Indica la dirección del enlace ${n}.` });
    else if (!l.example && !HTTPS.test(l.url.trim())) out.push({ path: `links.${i}.url`, message: `El enlace ${n} debe empezar por https:// o marcarse como enlace de ejemplo.` });
  });
  f.materials.forEach((m, i) => {
    if (!m.label.trim() && !m.documentId) return;
    if (!m.documentId) out.push({ path: `materials.${i}.documentId`, message: `Elige el documento del material ${i + 1}.` });
    else {
      const first = f.materials.findIndex((x) => x.documentId === m.documentId);
      if (first < i) out.push({ path: `materials.${i}.documentId`, message: `El material ${i + 1} repite el documento del material ${first + 1}: elige otro o quítalo.` });
    }
    if (empty(m.label)) out.push({ path: `materials.${i}.label`, message: `Indica el nombre del material ${i + 1}.` });
  });
}

function validateClient(f: ClientForm, out: FieldError[]) {
  if (empty(f.name)) out.push({ path: 'name', message: MESSAGES.required('el nombre de la empresa') });
  else if (f.name.trim().length > 80) out.push({ path: 'name', message: 'El nombre admite 80 caracteres como máximo.' });
  if (empty(f.sector)) out.push({ path: 'sector', message: 'Indica el sector al que se dedica.' });
  else if (f.sector.trim().length > 80) out.push({ path: 'sector', message: 'El sector admite 80 caracteres como máximo.' });
  if (!(COUNTRY_NAMES as readonly string[]).includes(f.country)) out.push({ path: 'country', message: 'Elige el país de origen de la lista.' });
  if (!DATE.test(f.date)) out.push({ path: 'date', message: 'Indica la fecha del anuncio.' });
  if (f.summary.trim().length > 160) out.push({ path: 'summary', message: `El resumen admite 160 caracteres como máximo (ahora tiene ${f.summary.trim().length}).` });
  if (!f.confirmed) out.push({ path: 'confirmed', message: 'Confirma que se puede anunciar dentro de FLM, sin datos económicos ni confidenciales.' });
}

function validateWelcome(f: WelcomeForm, out: FieldError[]) {
  if (empty(f.personId)) out.push({ path: 'personId', message: 'Elige a la persona que se suma al equipo.' });
  if (!DATE.test(f.date)) out.push({ path: 'date', message: 'Indica la fecha del anuncio.' });
  if (empty(f.message)) out.push({ path: 'message', message: 'Escribe el mensaje de bienvenida.' });
  else if (f.message.trim().length > 240) out.push({ path: 'message', message: `El mensaje admite 240 caracteres como máximo (ahora tiene ${f.message.trim().length}).` });
  if (!f.confirmed) out.push({ path: 'confirmed', message: 'Confirma que la persona sabe que se anunciará su llegada.' });
}

const PLACEHOLDER_META: BuildMeta = {
  id: 'validacion',
  slug: 'validacion',
  editorial: { status: 'borrador', authorId: 'validacion', review: { state: 'pendiente' } },
  uploadedBy: 'validacion',
  today: '2026-01-01',
};

const SCHEMA = {
  formacion: formationSchema,
  test: assessmentSchema,
  noticia: newsSchema,
  documento: documentSchema,
  evento: eventSchema,
  comunicado: eventSchema,
  cliente: newClientSchema,
  bienvenida: welcomeSchema,
} as const;

/** Errores del formulario en orden de aparición. Lista vacía = listo para publicar. */
export function validateForm(form: AnyForm): FieldError[] {
  const out: FieldError[] = [];
  switch (form.type) {
    case 'formacion':
      validateFormation(form, out);
      break;
    case 'test':
      validateAssessment(form, out);
      break;
    case 'noticia':
      validateNews(form, out);
      break;
    case 'documento':
      validateDocument(form, out);
      break;
    case 'evento':
    case 'comunicado':
      validateEvent(form, out);
      break;
    case 'cliente':
      validateClient(form, out);
      break;
    case 'bienvenida':
      validateWelcome(form, out);
      break;
  }
  if (out.length) return out;
  // Última comprobación con el mismo esquema que aplica el servidor.
  const parsed = SCHEMA[form.type].safeParse(formToItem(form, PLACEHOLDER_META));
  if (!parsed.success) {
    for (const issue of parsed.error.issues.slice(0, 5)) {
      out.push({ path: issue.path.length ? issue.path.join('.') : '_schema', message: `No supera la validación del servidor: ${issue.message}.` });
    }
  }
  return out;
}

/** Ancla de un campo para el resumen de errores. */
export const anchorId = (path: string) => `campo-${path.replace(/[^a-zA-Z0-9]+/g, '-')}`;

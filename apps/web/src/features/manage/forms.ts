/**
 * Formularios del editor: estructura por tipo, plantillas con valores útiles,
 * conversión desde/hacia los tipos compartidos y validación con mensajes claros.
 * La validación final reutiliza los esquemas zod de @flm/shared (los mismos de la API).
 */
import {
  AREAS,
  documentSchema,
  estimateReadingMinutes,
  eventSchema,
  fromMadrid,
  newsSchema,
  slugify,
  wordCount,
  type AreaId,
  type Block,
  type CampusEvent,
  type DocumentVersion,
  type EditorialMeta,
  type EventIcon,
  type EventSession,
  type Formation,
  type LibraryDocument,
  type NewsItem,
  type NewsKind,
  type Person,
  type Quiz,
  type SourceRef,
} from '@flm/shared';
import { MESSAGES } from '@/lib/messages';

let seq = 0;
/** Identificador local estable para elementos de listas del formulario. */
export const kid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(seq++).toString(36)}`;

/* ────────────────────────────────────────────────────────────────────────────
 * Tipos de formulario
 * ──────────────────────────────────────────────────────────────────────────── */

export type CalloutTone = 'clave' | 'atencion' | 'consejo' | 'norma';

export interface ExampleStepForm {
  id: string;
  label: string;
  formula: string;
  result: string;
}

export type EditorBlock =
  | { id: string; type: 'heading'; text: string; anchor?: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'callout'; tone: CalloutTone; title: string; text: string; refs?: SourceRef[] }
  | { id: string; type: 'list'; ordered: boolean; items: string }
  | { id: string; type: 'example'; title: string; scenario: string; steps: ExampleStepForm[]; conclusion: string }
  /** Bloques avanzados (tablas, apoyos interactivos, figuras…) que se conservan sin editar. */
  | { id: string; type: 'locked'; block: Block };

export type EditableBlockType = Exclude<EditorBlock['type'], 'locked'>;

export interface FormationForm {
  type: 'formacion';
  area: AreaId;
  title: string;
  slug?: string;
  coverTerm: string;
  summary: string;
  intro: string;
  outcomes: { id: string; text: string }[];
  blocks: EditorBlock[];
  keyTerms: { id: string; term: string; definition: string }[];
  takeaway: string;
  sources: { id: string; label: string; url: string; date: string }[];
  version: number;
  /** Test final de una formación existente (se edita con la plantilla Test). */
  quiz?: Quiz;
}

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
  ref: string;
}

export interface TestForm {
  type: 'test';
  formationId: string;
  title: string;
  questions: QuestionForm[];
}

export type Urgency = NewsItem['urgency'];

export interface NewsForm {
  type: 'noticia';
  area: AreaId;
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
  area: AreaId | 'general';
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
  image?: CampusEvent['image'];
  materials?: CampusEvent['materials'];
  recap?: string;
}

export type AnyForm = FormationForm | TestForm | NewsForm | DocumentForm | EventForm;

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

export const BLOCK_LABEL: Record<EditableBlockType | 'locked', string> = {
  heading: 'Encabezado',
  paragraph: 'Párrafo',
  callout: 'Recuadro',
  list: 'Lista',
  example: 'Ejemplo resuelto',
  locked: 'Bloque avanzado',
};

export const DEPARTMENTS = ['Toda la firma', 'Fiscal', 'Laboral', 'Mercantil', 'Contable', 'Dirección', 'Administración', 'Comunicación', 'Sistemas'];

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/* ────────────────────────────────────────────────────────────────────────────
 * Plantillas
 * ──────────────────────────────────────────────────────────────────────────── */

export function defaultArea(me: Person | null): AreaId {
  const match = (Object.keys(AREAS) as AreaId[]).find((a) => AREAS[a].name === me?.department);
  return match ?? 'fiscal';
}

export function newBlock(type: EditableBlockType): EditorBlock {
  const id = kid('b');
  switch (type) {
    case 'heading':
      return { id, type, text: '' };
    case 'paragraph':
      return { id, type, text: '' };
    case 'callout':
      return { id, type, tone: 'clave', title: '', text: '' };
    case 'list':
      return { id, type, ordered: false, items: '' };
    case 'example':
      return { id, type, title: '', scenario: '', steps: [{ id: kid('s'), label: '', formula: '', result: '' }], conclusion: '' };
  }
}

export const newOption = (id: string): OptionForm => ({ id, text: '', feedback: '' });

export const newQuestion = (n: number): QuestionForm => ({
  id: `p${n}`,
  prompt: '',
  options: ['a', 'b', 'c'].map(newOption),
  correctOptionId: '',
  explanation: '',
  ref: '',
});

export const newSession = (date = '', withTimes = true): SessionForm => ({
  id: kid('s'),
  startDate: date,
  startTime: withTimes ? '09:30' : '',
  endDate: '',
  endTime: withTimes ? '10:30' : '',
  label: '',
  location: '',
});

export function newForm(type: AnyForm['type'], me: Person | null, today: string): AnyForm {
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
        sources: [{ id: kid('f'), label: '', url: '', date: today }],
        version: 1,
      };
    case 'test':
      return { type, formationId: '', title: 'Test final', questions: [1, 2, 3].map(newQuestion) };
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
      };
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Desde los tipos compartidos
 * ──────────────────────────────────────────────────────────────────────────── */

function blockToForm(b: Block): EditorBlock {
  const id = kid('b');
  switch (b.type) {
    case 'heading':
      return { id, type: 'heading', text: b.text, anchor: b.id };
    case 'paragraph':
      return { id, type: 'paragraph', text: b.text };
    case 'callout':
      return { id, type: 'callout', tone: b.tone, title: b.title ?? '', text: b.text, refs: b.refs };
    case 'list':
      return { id, type: 'list', ordered: !!b.ordered, items: b.items.join('\n') };
    case 'example':
      return {
        id,
        type: 'example',
        title: b.title,
        scenario: b.scenario,
        steps: b.steps.map((s) => ({ id: kid('s'), label: s.label, formula: s.formula ?? '', result: s.result ?? '' })),
        conclusion: b.conclusion,
      };
    default:
      return { id, type: 'locked', block: b };
  }
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
    sources: f.sources.map((s) => ({ id: kid('f'), label: s.label, url: s.url, date: s.date ?? '' })),
    version: f.version,
    quiz: f.quiz,
  };
}

export function quizToForm(q: Quiz, formationId: string): TestForm {
  return {
    type: 'test',
    formationId,
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
    image: e.image,
    materials: e.materials,
    recap: e.recap,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Hacia los tipos compartidos
 * ──────────────────────────────────────────────────────────────────────────── */

export interface BuildMeta {
  id: string;
  slug: string;
  editorial: EditorialMeta;
  /** Persona que sube el archivo (documentos). */
  uploadedBy: string;
  today: string;
}

const clean = (s: string) => s.trim();
const opt = (s: string) => (s.trim() ? s.trim() : undefined);

export function sessionToShared(s: SessionForm): EventSession {
  const start = s.startDate + (s.startTime ? `T${s.startTime}` : '');
  const endDate = s.endDate || (s.endTime ? s.startDate : '');
  const end = endDate ? endDate + (s.endTime ? `T${s.endTime}` : '') : undefined;
  return { start, ...(end ? { end } : {}), ...(opt(s.label) ? { label: clean(s.label) } : {}), ...(opt(s.location) ? { location: clean(s.location) } : {}) };
}

export function formToEvent(form: EventForm, meta: BuildMeta): CampusEvent {
  const links = form.links.filter((l) => l.label.trim() || l.url.trim()).map((l) => ({ label: clean(l.label), url: clean(l.url), ...(l.example ? { example: true } : {}) }));
  return {
    id: meta.id,
    slug: meta.slug,
    kind: form.type,
    category: form.category,
    title: clean(form.title),
    summary: clean(form.summary),
    ...(opt(form.body) ? { body: clean(form.body) } : {}),
    icon: form.icon,
    sessions: form.pendingDate ? [] : form.sessions.filter((s) => s.startDate).map(sessionToShared),
    ...(form.pendingDate ? { pendingDateNote: opt(form.pendingDateNote) ?? 'Fecha por confirmar' } : {}),
    ...(form.manualPhase ? { manualPhase: form.manualPhase } : {}),
    ...(opt(form.department) ? { department: clean(form.department) } : {}),
    ...(links.length ? { links } : {}),
    ...(form.image ? { image: form.image } : {}),
    ...(form.materials ? { materials: form.materials } : {}),
    ...(form.recap ? { recap: form.recap } : {}),
    editorial: meta.editorial,
  };
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

export function formToDocument(form: DocumentForm, meta: BuildMeta): LibraryDocument {
  const versions = [...form.versions];
  if (form.upload) versions.push(uploadToVersion(form.upload, (versions.at(-1)?.version ?? 0) + 1, meta.uploadedBy, meta.today, form.versionNote));
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
    // En la demo el PDF no se sube: el documento queda «disponible en la versión interna».
    publicDemo: __DEMO__ ? false : form.publicDemo,
    ...(opt(form.notice) ? { notice: clean(form.notice) } : {}),
    editorial: meta.editorial,
  };
}

export const splitTags = (s: string) =>
  s
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);

export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const set = new Set(taken);
  const root = slugify(base) || 'contenido';
  if (!set.has(root)) return root;
  let n = 2;
  while (set.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

export function formationWords(form: FormationForm): number {
  const parts: string[] = [form.intro, form.takeaway, ...form.outcomes.map((o) => o.text)];
  for (const b of form.blocks) {
    if (b.type === 'heading' || b.type === 'paragraph') parts.push(b.text);
    else if (b.type === 'callout') parts.push(b.title, b.text);
    else if (b.type === 'list') parts.push(b.items);
    else if (b.type === 'example') parts.push(b.title, b.scenario, b.conclusion, ...b.steps.map((s) => `${s.label} ${s.formula} ${s.result}`));
  }
  return wordCount(parts.join(' '));
}

export const formationMinutes = (form: FormationForm) => Math.min(40, estimateReadingMinutes(formationWords(form)));

/* ────────────────────────────────────────────────────────────────────────────
 * Validación
 * ──────────────────────────────────────────────────────────────────────────── */

export interface FieldError {
  path: string;
  message: string;
}

const HTTPS = /^https:\/\/[^\s]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const empty = (s: string | undefined) => !s || !s.trim();

function validateNews(f: NewsForm, out: FieldError[]) {
  if (empty(f.headline)) out.push({ path: 'headline', message: MESSAGES.required('el titular') });
  else if (f.headline.trim().length > 110) out.push({ path: 'headline', message: `El titular admite 110 caracteres como máximo (ahora tiene ${f.headline.trim().length}).` });
  if (empty(f.oneLiner)) out.push({ path: 'oneLiner', message: 'Escribe la novedad en una frase (bloque 1).' });
  if (empty(f.affects)) out.push({ path: 'affects', message: 'Indica a quién afecta (bloque 2).' });
  if (empty(f.action)) out.push({ path: 'action', message: 'Explica qué debemos hacer (bloque 3).' });
  if (empty(f.example)) out.push({ path: 'example', message: 'Añade un ejemplo sencillo (bloque 4).' });
  if (empty(f.sourceLabel)) out.push({ path: 'sourceLabel', message: 'Indica la fuente: norma, resolución o criterio (bloque 5).' });
  if (empty(f.sourceUrl)) out.push({ path: 'sourceUrl', message: 'Añade el enlace oficial a la fuente (bloque 5).' });
  else if (!HTTPS.test(f.sourceUrl.trim())) out.push({ path: 'sourceUrl', message: 'El enlace de la fuente debe empezar por https://.' });
  if (!DATE.test(f.publishedOn)) out.push({ path: 'publishedOn', message: 'Indica la fecha de publicación de la fuente.' });
  if (f.effectiveOn && !DATE.test(f.effectiveOn)) out.push({ path: 'effectiveOn', message: 'Revisa la fecha de entrada en vigor.' });
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
  f.links.forEach((l, i) => {
    const n = i + 1;
    if (empty(l.label) && empty(l.url)) return;
    if (empty(l.label)) out.push({ path: `links.${i}.label`, message: `Indica el texto del enlace ${n}.` });
    if (empty(l.url)) out.push({ path: `links.${i}.url`, message: `Indica la dirección del enlace ${n}.` });
    else if (!l.example && !HTTPS.test(l.url.trim())) out.push({ path: `links.${i}.url`, message: `El enlace ${n} debe empezar por https:// o marcarse como enlace de ejemplo.` });
  });
}

function validateFormation(f: FormationForm, out: FieldError[]) {
  if (empty(f.title)) out.push({ path: 'title', message: MESSAGES.required('el título de la formación') });
  if (f.coverTerm.trim().length > 16) out.push({ path: 'coverTerm', message: 'El término de portada admite 16 caracteres como máximo.' });
  if (empty(f.summary)) out.push({ path: 'summary', message: 'Escribe el resumen que se verá en las tarjetas.' });
  else if (f.summary.trim().length > 220) out.push({ path: 'summary', message: `El resumen admite 220 caracteres como máximo (ahora tiene ${f.summary.trim().length}).` });
  if (empty(f.intro)) out.push({ path: 'intro', message: 'Escribe la introducción práctica: por qué importa, con una situación real.' });
  const filled = f.outcomes.filter((o) => o.text.trim());
  if (filled.length < 2) {
    const firstEmpty = f.outcomes.findIndex((o) => !o.text.trim());
    out.push({ path: firstEmpty >= 0 ? `outcomes.${firstEmpty}` : 'outcomes', message: 'Escribe entre 2 y 3 resultados de aprendizaje.' });
  }
  if (f.blocks.length < 3) out.push({ path: 'blocks', message: 'Añade al menos 3 bloques de contenido.' });
  if (!f.blocks.some((b) => b.type === 'example' || (b.type === 'locked' && b.block.type === 'example'))) {
    out.push({ path: 'blocks', message: 'Añade un ejemplo resuelto: es obligatorio en todas las formaciones.' });
  }
  f.blocks.forEach((b, i) => {
    const n = i + 1;
    const label = `${BLOCK_LABEL[b.type]} · bloque ${n}`;
    if ((b.type === 'heading' || b.type === 'paragraph') && empty(b.text)) out.push({ path: `blocks.${i}.text`, message: `Completa el texto del bloque ${n} (${BLOCK_LABEL[b.type].toLowerCase()}) o elimínalo.` });
    if (b.type === 'callout' && empty(b.text)) out.push({ path: `blocks.${i}.text`, message: `Completa el texto del recuadro (bloque ${n}).` });
    if (b.type === 'list' && !b.items.split('\n').some((x) => x.trim())) out.push({ path: `blocks.${i}.items`, message: `Escribe al menos un elemento en la lista (bloque ${n}).` });
    if (b.type === 'example') {
      if (empty(b.title)) out.push({ path: `blocks.${i}.title`, message: `Pon título al ejemplo (${label}).` });
      if (empty(b.scenario)) out.push({ path: `blocks.${i}.scenario`, message: `Describe el planteamiento del ejemplo (${label}).` });
      if (!b.steps.some((s) => s.label.trim())) out.push({ path: `blocks.${i}.steps`, message: `Añade al menos un paso al ejemplo (${label}).` });
      if (empty(b.conclusion)) out.push({ path: `blocks.${i}.conclusion`, message: `Escribe la conclusión del ejemplo (${label}).` });
    }
  });
  const terms = f.keyTerms.filter((k) => k.term.trim() && k.definition.trim());
  f.keyTerms.forEach((k, i) => {
    if (k.term.trim() && !k.definition.trim()) out.push({ path: `keyTerms.${i}.definition`, message: `Escribe la definición de «${k.term.trim()}».` });
    if (!k.term.trim() && k.definition.trim()) out.push({ path: `keyTerms.${i}.term`, message: `Indica el término que corresponde a la definición ${i + 1}.` });
  });
  if (terms.length < 3) out.push({ path: 'keyTerms', message: 'Añade al menos 3 términos clave con su definición.' });
  if (empty(f.takeaway)) out.push({ path: 'takeaway', message: MESSAGES.required('la idea clave') });
  if (!f.sources.some((s) => s.label.trim())) out.push({ path: 'sources', message: 'Añade al menos una fuente.' });
  f.sources.forEach((s, i) => {
    if (!s.label.trim() && !s.url.trim()) return;
    if (empty(s.label)) out.push({ path: `sources.${i}.label`, message: `Indica el nombre de la fuente ${i + 1}.` });
    if (!HTTPS.test(s.url.trim())) out.push({ path: `sources.${i}.url`, message: `El enlace de la fuente ${i + 1} debe empezar por https://.` });
  });
}

function validateTest(f: TestForm, out: FieldError[]) {
  if (empty(f.formationId)) out.push({ path: 'formationId', message: 'Elige la formación a la que pertenece el test.' });
  if (empty(f.title)) out.push({ path: 'title', message: MESSAGES.required('el título del test') });
  if (f.questions.length !== 3) out.push({ path: 'questions', message: 'El test final debe tener exactamente 3 preguntas.' });
  f.questions.forEach((q, i) => {
    const n = i + 1;
    if (empty(q.prompt)) out.push({ path: `questions.${i}.prompt`, message: `Escribe el enunciado de la pregunta ${n}.` });
    q.options.forEach((o, j) => {
      const letter = OPTION_LETTERS[j] ?? String(j + 1);
      if (empty(o.text)) out.push({ path: `questions.${i}.options.${j}.text`, message: `Escribe la opción ${letter} de la pregunta ${n}.` });
      if (q.correctOptionId && o.id !== q.correctOptionId && empty(o.feedback)) {
        out.push({ path: `questions.${i}.options.${j}.feedback`, message: `Explica por qué la opción ${letter} de la pregunta ${n} no es correcta.` });
      }
    });
    if (!q.correctOptionId || !q.options.some((o) => o.id === q.correctOptionId)) out.push({ path: `questions.${i}.correct`, message: `Marca la respuesta correcta de la pregunta ${n}.` });
    if (empty(q.explanation)) out.push({ path: `questions.${i}.explanation`, message: `Explica la respuesta correcta de la pregunta ${n}.` });
  });
}

const PLACEHOLDER_META: BuildMeta = {
  id: 'validacion',
  slug: 'validacion',
  editorial: { status: 'borrador', authorId: 'validacion', review: { state: 'pendiente' } },
  uploadedBy: 'validacion',
  today: '2026-01-01',
};

/** Errores del formulario en orden de aparición. Lista vacía = listo para revisión o publicación. */
export function validateForm(form: AnyForm): FieldError[] {
  const out: FieldError[] = [];
  switch (form.type) {
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
    case 'formacion':
      validateFormation(form, out);
      break;
    case 'test':
      validateTest(form, out);
      break;
  }
  if (out.length) return out;
  // Última comprobación con el mismo esquema que aplica el servidor.
  const parsed =
    form.type === 'noticia'
      ? newsSchema.safeParse(formToNews(form, PLACEHOLDER_META))
      : form.type === 'documento'
        ? documentSchema.safeParse(formToDocument({ ...form, versions: form.versions.length ? form.versions : [] }, PLACEHOLDER_META))
        : form.type === 'evento' || form.type === 'comunicado'
          ? eventSchema.safeParse(formToEvent(form, PLACEHOLDER_META))
          : null;
  if (parsed && !parsed.success) {
    const issue = parsed.error.issues[0];
    out.push({ path: '_schema', message: `No supera la validación del servidor: ${issue?.message ?? 'revisa los campos'}.` });
  }
  return out;
}

/** Ancla de un campo para el resumen de errores. */
export const anchorId = (path: string) => `campo-${path.replace(/[^a-zA-Z0-9]+/g, '-')}`;

import type { AreaId, Scope } from './areas';

/* ────────────────────────────────────────────────────────────────────────────
 * Personas y roles
 * ──────────────────────────────────────────────────────────────────────────── */

export type Role = 'empleado' | 'autor' | 'admin';

export type Department =
  | 'Fiscal'
  | 'Laboral'
  | 'Mercantil'
  | 'Contable'
  | 'Dirección'
  | 'Administración'
  | 'Comunicación'
  | 'Sistemas';

export type Office = 'Barcelona' | 'Vic' | 'Granollers';

/**
 * Ficha de una persona del campus. El cumpleaños (solo día y mes) y la fecha de incorporación
 * alimentan el calendario de empresa; en los perfiles anteriores pueden faltar y se completan después.
 */
export interface Person {
  id: string;
  /** Correo corporativo; siempre @flmexperts.com. */
  email: string;
  name: string;
  position: string;
  department: Department;
  office: Office;
  role: Role;
  /** Ruta a la fotografía aportada; si no hay, se muestran las iniciales. */
  photo?: string;
  status: 'activa' | 'inactiva';
  /** Persona ficticia creada solo para la demostración. */
  fictional?: boolean;
  /** De dónde procede la información pública de una persona real. */
  publicSource?: string;
  /** Cumpleaños, solo día y mes («MM-DD»): nunca el año de nacimiento. */
  birthday?: string;
  /** Fecha de incorporación a FLM («AAAA-MM-DD»). */
  startDate?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Flujo editorial
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Flujo editorial: «Guardar borrador» o «Publicar». La autoría publica lo suyo y administración,
 * cualquier contenido; archivar y restaurar es cosa de administración. No hay revisión previa obligatoria.
 */
export type EditorialStatus = 'borrador' | 'publicado' | 'archivado';

/**
 * Tipos de contenido del creador. «test» es la evaluación del área («Pon a prueba tus conocimientos»):
 * el test final de cada formación va dentro de la propia formación.
 * «cliente» y «bienvenida» alimentan el tablero «Ponte al día» de Inicio.
 */
export type ContentType = 'formacion' | 'test' | 'noticia' | 'documento' | 'evento' | 'comunicado' | 'cliente' | 'bienvenida';

export interface EditorialMeta {
  status: EditorialStatus;
  /**
   * Persona autora. Ausente si el contenido no tiene autoría personal: su perfil se eliminó al dejar
   * FLM y el contenido se conserva con la firma neutra («Área Fiscal de FLM» o «FLM», ver authorship.ts).
   */
  authorId?: string;
  /** Fecha de primera publicación (ISO). */
  publishedAt?: string;
  /** Fecha de la última actualización relevante (ISO). */
  updatedAt?: string;
  /** Revisión editorial y jurídica del contenido. */
  review: {
    state: 'pendiente' | 'revisado';
    reviewerName?: string;
    /** Persona que lo marcó como revisado: si se elimina su perfil, su nombre se retira de aquí. */
    reviewerId?: string;
    reviewedAt?: string;
    note?: string;
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Formaciones
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Texto con formato ligero:
 *  **negrita**, *cursiva*, [[término clave]] (enlaza con el glosario de la formación)
 *  y [texto](https://enlace).
 */
export type RichText = string;

export interface SourceRef {
  label: string;
  url: string;
  /** Fecha de consulta o de publicación (AAAA-MM-DD). */
  date?: string;
  kind?: 'norma' | 'jurisprudencia' | 'criterio' | 'documento' | 'web';
}

export interface KeyTerm {
  term: string;
  definition: RichText;
}

export type Block =
  /** Encabezado: el de nivel 2 (por defecto) abre un apartado; el de nivel 3 es un subapartado dentro de él. */
  | { type: 'heading'; text: string; id?: string; level?: 2 | 3 }
  | { type: 'paragraph'; text: RichText }
  | { type: 'list'; ordered?: boolean; items: RichText[] }
  | { type: 'callout'; tone: 'clave' | 'atencion' | 'consejo' | 'norma'; title?: string; text: RichText; refs?: SourceRef[] }
  | { type: 'quote'; text: RichText; cite?: string }
  | { type: 'example'; title: string; scenario: RichText; steps: ExampleStep[]; conclusion: RichText }
  | { type: 'table'; caption?: string; columns: string[]; rows: RichText[][]; numeric?: number[] }
  | { type: 'widget'; widget: WidgetSpec; caption?: string }
  | { type: 'figure'; src: string; alt: string; caption?: string };

export interface ExampleStep {
  label: RichText;
  /** Fórmula o asiento mostrado en tipografía tabular. */
  formula?: string;
  result?: string;
}

/**
 * Componentes interactivos que acompañan a las explicaciones.
 * Importes en euros; fechas «AAAA-MM-DD»; porcentajes como número (25 = 25 %).
 */
export type WidgetSpec =
  /** Cuota a ingresar de la autoliquidación presentada fuera de plazo (€). */
  | { kind: 'recargo-extemporaneo'; cuota: number }
  /** Salario bruto anual (€) y fechas de inicio y fin del contrato. */
  | { kind: 'indemnizacion-despido'; salarioAnual: number; inicio: string; fin: string }
  /** Capital social, patrimonio neto contable y préstamo participativo (€). */
  | { kind: 'disolucion-perdidas'; capital: number; patrimonioNeto: number; prestamoParticipativo?: number }
  /** Fecha de cierre del ejercicio. */
  | { kind: 'calendario-cuentas'; cierre: string }
  /** Coste (€), vida útil (años), coeficiente fiscal máximo (% anual) y valor residual (€). */
  | { kind: 'amortizacion'; coste: number; vidaUtil: number; coeficienteFiscalMax: number; valorResidual?: number }
  /** Importe (€) que cubre «meses» meses desde «inicio»; «cierre» = fecha de cierre del ejercicio. */
  | { kind: 'periodificacion'; importe: number; inicio: string; meses: number; cierre: string; concepto: string }
  | { kind: 'cuentas-t'; title?: string; entries: JournalEntry[] }
  | { kind: 'arbol-decision'; title: string; start: string; nodes: DecisionNode[] }
  | { kind: 'linea-tiempo'; title?: string; items: TimelineItem[] }
  | { kind: 'tarjetas-verdad'; title?: string; cards: TruthCard[] }
  | { kind: 'comparativa'; title?: string; columns: string[]; rows: { label: string; values: RichText[] }[] }
  | { kind: 'clasificador'; title: string; prompt: string; categories: string[]; items: ClassifierItem[] }
  | { kind: 'grafico'; chart: ChartSpec };

export interface JournalEntry {
  date?: string;
  concept: string;
  lines: { account: string; name: string; debit?: number; credit?: number }[];
}

export interface DecisionNode {
  id: string;
  question?: string;
  options?: { label: string; next: string }[];
  /** Nodo final: recomendación. */
  outcome?: { title: string; text: RichText; tone: 'derivar' | 'resolver' | 'atencion' };
}

export interface TimelineItem {
  date: string;
  title: string;
  text?: RichText;
  tone?: 'hito' | 'plazo' | 'pendiente';
}

export interface TruthCard {
  claim: string;
  verdict: 'verdadero' | 'falso' | 'depende';
  explanation: RichText;
}

export interface ClassifierItem {
  label: string;
  answer: string;
  explanation: RichText;
}

export interface ChartSpec {
  type: 'barras' | 'lineas' | 'escalones';
  title: string;
  unit?: string;
  xLabel?: string;
  yLabel?: string;
  series: { name: string; values: { x: string | number; y: number }[] }[];
}

export interface QuizOption {
  id: string;
  text: RichText;
  /** Por qué esta opción es incorrecta (vacío en la correcta). */
  feedback?: RichText;
}

export interface QuizQuestion {
  id: string;
  prompt: RichText;
  options: QuizOption[];
  correctOptionId: string;
  /** Explicación de la respuesta correcta. */
  explanation: RichText;
  /** Referencia breve a la sección o norma. */
  ref?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  /** Aciertos mínimos para superar el test. */
  passMark: number;
}

export interface Formation {
  id: string;
  slug: string;
  area: AreaId;
  title: string;
  /** Introducción práctica: por qué importa, con una situación real de cliente. */
  intro: RichText;
  /** Frase corta para tarjetas. */
  summary: string;
  /** «Término de portada» de la cubierta tipográfica (p. ej. «Art. 27», «147», «¿A Mercantil?»). */
  coverTerm?: string;
  readingMinutes: number;
  outcomes: string[];
  blocks: Block[];
  keyTerms: KeyTerm[];
  takeaway: RichText;
  sources: SourceRef[];
  quiz: Quiz;
  /** Documentos originales descargables vinculados (ids de la biblioteca). */
  documentIds?: string[];
  /** Versión de contenido: un cambio de versión mayor obliga a confirmar de nuevo la lectura. */
  version: number;
  editorial: EditorialMeta;
  /** Vigencia normativa comprobada a esta fecha (AAAA-MM-DD). */
  verifiedAt: string;
}

export interface SectorAssessment {
  id: string;
  area: AreaId;
  title: string;
  intro: string;
  quiz: Quiz;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Progreso de aprendizaje
 * ──────────────────────────────────────────────────────────────────────────── */

export interface QuizAttempt {
  id: string;
  quizId: string;
  /** Versión de la formación en el momento del intento. */
  version: number;
  at: string;
  answers: Record<string, string>;
  correct: number;
  total: number;
  passed: boolean;
}

export interface FormationProgress {
  formationId: string;
  /** Lectura confirmada al llegar al final de la formación. */
  readAt?: string;
  readVersion?: number;
  attempts: QuizAttempt[];
}

export type FormationStatus = 'sin-empezar' | 'leida' | 'test-intentado' | 'test-superado' | 'completada';

/* ────────────────────────────────────────────────────────────────────────────
 * Biblioteca
 * ──────────────────────────────────────────────────────────────────────────── */

export type NewsKind = 'legislacion' | 'jurisprudencia' | 'criterio' | 'aviso-interno';

export interface NewsItem {
  id: string;
  slug: string;
  /** Área de la novedad o «general» (toda la firma) para avisos internos. */
  area: AreaId | 'general';
  kind: NewsKind;
  headline: string;
  /** 1. La novedad, en una frase. */
  oneLiner: RichText;
  /** 2. A quién afecta. */
  affects: RichText;
  /** 3. Qué debemos hacer. */
  action: RichText;
  /** 4. Un ejemplo sencillo. */
  example: RichText;
  /** 5. Fuente y fecha. */
  source: { label: string; url: string; publishedOn: string; effectiveOn?: string };
  /** Matices relevantes. */
  nuance?: RichText;
  urgency: 'alta' | 'media' | 'informativa';
  date: string;
  editorial: EditorialMeta;
}

export interface DocumentVersion {
  version: number;
  file: string;
  sizeKb: number;
  pages?: number;
  uploadedAt: string;
  uploadedBy: string;
  note?: string;
}

export interface LibraryDocument {
  id: string;
  title: string;
  area: AreaId | 'general';
  /** Quién emite el documento original (FLM, ICAC, AEAT...). */
  issuer: string;
  date: string;
  summary: string;
  kind: 'nota-informativa' | 'boletin' | 'publicacion-oficial' | 'presentacion' | 'material-evento';
  versions: DocumentVersion[];
  tags: string[];
  /** Si el documento se puede incluir en la demostración pública. */
  publicDemo: boolean;
  /** Aviso editorial visible (p. ej. contenido que puede haber quedado desfasado). */
  notice?: string;
  editorial: EditorialMeta;
}

export interface Reading {
  id: string;
  area: AreaId;
  title: string;
  authors: string;
  edition: string;
  publisher: string;
  isbn?: string;
  summary: string;
  practicalValue: string;
  audience: string;
  format: string;
  url: string;
  verifiedAt: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Vida de empresa
 * ──────────────────────────────────────────────────────────────────────────── */

export type EventIcon =
  | 'estrella'
  | 'trofeo'
  | 'cafe'
  | 'calendario'
  | 'formacion'
  | 'megafono'
  | 'web'
  | 'boletin'
  | 'brindis'
  | 'resenas'
  | 'video'
  | 'idea';

export interface EventSession {
  /** Inicio en hora local de Madrid: «AAAA-MM-DD» (todo el día) o «AAAA-MM-DDTHH:mm». */
  start: string;
  /** Fin opcional en hora local de Madrid. */
  end?: string;
  label?: string;
  location?: string;
}

export interface CampusEvent {
  id: string;
  slug: string;
  kind: 'evento' | 'comunicado';
  category: 'formacion-interna' | 'desayuno' | 'encuentro' | 'reconocimiento' | 'celebracion' | 'iniciativa' | 'comunicacion';
  title: string;
  summary: string;
  body?: RichText;
  icon: EventIcon;
  image?: { src: string; alt: string; credit?: string };
  /** Sesiones confirmadas. Si está vacío, el evento está pendiente de fecha. */
  sessions: EventSession[];
  /** Texto cuando la fecha no está confirmada. */
  pendingDateNote?: string;
  /** Reclasificación manual por administración. */
  manualPhase?: 'proximo' | 'historico';
  archived?: boolean;
  department?: string;
  links?: { label: string; url: string; example?: boolean }[];
  materials?: { label: string; documentId: string }[];
  /** Resumen posterior del evento (histórico). */
  recap?: RichText;
  editorial: EditorialMeta;
}

export type EventPhase = 'en-curso' | 'proximo' | 'historico' | 'archivado';

/* ────────────────────────────────────────────────────────────────────────────
 * «Ponte al día»: nuevos clientes y bienvenidas
 * ──────────────────────────────────────────────────────────────────────────── */

/** Nuevo cliente de la firma. En la demo, empresas inventadas y marcadas como ficticias. */
export interface NewClient {
  id: string;
  /** Nombre de la empresa. */
  name: string;
  /** Sector al que se dedica. */
  sector: string;
  /** País de origen. */
  country: string;
  /** Área de FLM que lleva el encargo; «general» si intervienen varias. */
  area: Scope;
  /** Fecha del anuncio (AAAA-MM-DD). */
  date: string;
  /** En una frase: qué hará FLM con el cliente. */
  summary?: string;
  /** Empresa inventada para la demostración. */
  fictional?: boolean;
  editorial: EditorialMeta;
}

/** Bienvenida a una persona que se suma al equipo. Solo lleva la fecha del anuncio: la de incorporación es de la ficha (`Person.startDate`). */
export interface Welcome {
  id: string;
  personId: string;
  /** Fecha del anuncio (AAAA-MM-DD). */
  date: string;
  /** Mensaje de bienvenida, en una o dos frases. */
  message: string;
  editorial: EditorialMeta;
}

export interface Holiday {
  date: string;
  name: string;
  scope: 'nacional' | 'autonomico' | 'local';
  /** Oficinas a las que aplica; vacío = todas. */
  offices: Office[];
  source: string;
}

/** Cumpleaños y aniversarios se calculan a partir del perfil de cada persona (ver personalDates.ts). */
export type CalendarKind = 'encuentro' | 'festivo' | 'cumpleanos' | 'aniversario';

export interface CalendarEntry {
  id: string;
  date: string;
  kind: CalendarKind;
  title: string;
  /** Festivo: su nombre. Encuentro: la sesión o el resumen del evento. Cumpleaños: el puesto. Aniversario: los años en FLM. */
  detail?: string;
  eventId?: string;
  time?: string;
  offices?: Office[];
  /** Cumpleaños y aniversario: la persona de cuyo perfil sale la entrada. */
  personId?: string;
  /** Aniversario: años cumplidos en FLM. */
  years?: number;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Reconocimientos
 * ──────────────────────────────────────────────────────────────────────────── */

export type BadgeFamily = 'aprendizaje' | 'contribucion';

export interface Badge {
  id: string;
  family: BadgeFamily;
  title: string;
  description: string;
  earnedAt?: string;
  /** Valor principal que muestra la insignia (aciertos, publicaciones, área...). */
  mark: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Datos semilla (los exporta @flm/content; los consumen la demo y la API)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface SeedData {
  people: Person[];
  formations: Formation[];
  assessments: SectorAssessment[];
  news: NewsItem[];
  documents: LibraryDocument[];
  readings: Reading[];
  events: CampusEvent[];
  holidays: Holiday[];
  clients: NewClient[];
  welcomes: Welcome[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Auditoría
 * ──────────────────────────────────────────────────────────────────────────── */

export interface AuditRecord {
  id: string;
  at: string;
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  detail?: string;
}

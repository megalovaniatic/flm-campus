/**
 * Cliente de la API privada (modo production).
 * - Cookies de sesión HttpOnly (credentials: 'include').
 * - Token CSRF obtenido en GET /api/session y enviado en X-CSRF-Token en toda escritura.
 * - Errores traducidos a mensajes claros en castellano (MESSAGES).
 * En la demostración pública (__DEMO__) no se usa: las operaciones se simulan en el navegador.
 */
import type { CalendarEntry, Department, Office, Person, PersonalDateField, Role } from '@flm/shared';
import { MESSAGES } from '@/lib/messages';

const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
let csrfToken: string | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export interface SessionPayload {
  authenticated: true;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'empleado' | 'autor' | 'admin';
    roleLabel: string;
    position: string;
    department: string;
    office: string;
    photo?: string;
    /** Cumpleaños «MM-DD» (sin año) y fecha de incorporación «AAAA-MM-DD», si constan en la ficha. */
    birthday?: string;
    startDate?: string;
    /**
     * Datos del calendario de empresa que faltan en la ficha: la web los pide con `completeMyDates`
     * sin bloquear el acceso (los perfiles anteriores a pedirlos no los tienen).
     */
    missingPersonalDates: PersonalDateField[];
  };
  permissions: string[];
  csrfToken: string;
}

/** Ficha en la administración (`GET /people`, `/people/:id` y respuestas de alta y edición). */
export interface ApiAdminPerson extends Person {
  /** Datos del calendario que faltan («birthday», «startDate»): la ficha se puede completar al editarla. */
  missingPersonalDates: PersonalDateField[];
  accountState: 'pendiente-activacion' | 'activa' | 'desactivada' | 'anonimizada';
  activatedAt: string | null;
  deactivatedAt: string | null;
  anonymizedAt: string | null;
  createdAt: string;
  updatedAt: string;
  retentionReviewDue: boolean;
}

/** Ficha del directorio interno (sin correo): lo necesario para el calendario, si consta. */
export interface ApiDirectoryEntry {
  id: string;
  name: string;
  position: string;
  department: string;
  office: string;
  photo?: string;
  birthday?: string;
  startDate?: string;
}

/**
 * Alta de una persona. `birthday` («MM-DD», sin año) y `startDate` («AAAA-MM-DD») son obligatorios
 * (`personalDatesSchema` de @flm/shared): sin ellos, 400 `VALIDACION` con esos campos en `fields`.
 */
export interface ApiPersonInput {
  email: string;
  name: string;
  position: string;
  department: Department;
  office: Office;
  role: Role;
  birthday: string;
  startDate: string;
}

/**
 * Edición: solo los campos que cambian. Un cumpleaños o una fecha de incorporación vacíos no se envían
 * (se rechazan: los datos se completan, no se borran).
 */
export type ApiPersonPatch = Partial<ApiPersonInput>;

/** Enlace de activación tras el alta: sin SMTP, `url` para entregarlo por un canal seguro. */
export interface ApiActivation {
  sent: boolean;
  expiresAt: string;
  url?: string;
}

/** Cuerpo de error de la API: `{ error: { code, message, details? } }`; en las validaciones, `details` lista los campos. */
interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

function messageFor(status: number, body: ErrorBody | null): string {
  if (body?.error?.message) return body.error.message;
  switch (status) {
    case 401:
      return MESSAGES.sessionExpired.body;
    case 403:
      return MESSAGES.forbidden.title;
    case 404:
      return MESSAGES.notFound.body;
    case 409:
      return 'Otra persona ha guardado cambios mientras editabas. Recarga para ver la última versión; tus cambios siguen en este dispositivo.';
    case 413:
      return 'El archivo supera el tamaño máximo permitido.';
    case 415:
      return 'Tipo de archivo no admitido.';
    case 429:
      return 'Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.';
    default:
      return MESSAGES.saveFailed.body;
  }
}

/** Campos con error de una validación (`details`: `{ path, message }[]`), como { ruta: mensaje }. */
function fieldsOf(details: unknown): Record<string, string> | undefined {
  if (!Array.isArray(details)) return undefined;
  const out: Record<string, string> = {};
  for (const d of details as { path?: unknown; message?: unknown }[]) {
    if (typeof d?.path === 'string' && typeof d.message === 'string' && !(d.path in out)) out[d.path] = d.message;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Conflictos entre contenidos (409) que se deben a un campo del formulario: el editor muestra el mensaje de
 * la API junto a ese campo. Una evaluación vigente por área; un solo espacio de slugs para eventos y
 * comunicados (comparten la dirección de la agenda); una bienvenida por persona; y, en la ficha propia,
 * la fecha de incorporación que ya consta (la corrige administración). Los demás 409
 * (CONFLICTO_REVISION, REVISION_PENDIENTE, TRANSICION_NO_VALIDA…) se muestran como aviso.
 */
const CONFLICT_FIELD: Record<string, string> = {
  EVALUACION_DUPLICADA: 'area',
  SLUG_DUPLICADO: 'slug',
  BIENVENIDA_DUPLICADA: 'personId',
  INCORPORACION_YA_INDICADA: 'startDate',
};

/** Versión de un documento según la API (la de número más alto es la vigente). */
export interface ApiDocumentVersion {
  version: number;
  file: string;
  sizeKb: number;
  pages?: number;
  uploadedAt: string;
  /** Quien la subió o, si su perfil ya no existe, la firma neutra «FLM». */
  uploadedBy: string;
  note?: string;
  /** El archivo está en el servidor (las versiones importadas sin PDF no se descargan). */
  available: boolean;
  /** PDF nuevo que espera en los cambios sin publicar: lo ven quien edita y administración, no el campus. */
  pending?: boolean;
}

/** Ficha editorial de un contenido (`GET /contents/:id` y respuesta de crear, guardar, publicar o sustituir el PDF). */
export interface ApiContentDetail {
  id: string;
  type: string;
  title: string;
  area: string | null;
  slug: string | null;
  status: 'borrador' | 'publicado' | 'archivado';
  /** `null`: sin autoría (perfil eliminado o contenido institucional). */
  authorId: string | null;
  authorName: string | null;
  revision: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  manualPhase: 'proximo' | 'historico' | null;
  /**
   * Contenido vigente. Un borrador puede estar a medias («Guardar borrador» no exige los campos obligatorios,
   * solo publicar): no hay que darlo por completo. En un documento, `versions` son `ApiDocumentVersion`.
   */
  item: Record<string, unknown>;
  /** Fase de un evento o comunicado (también de uno a medias). */
  phase?: string;
  /** Cambios sin publicar de algo publicado (con el PDF nuevo que espere en ellos, `pending`). */
  pendingRevision: { id: string; status: string; authorId: string | null; createdAt: string; updatedAt: string; item: Record<string, unknown> } | null;
}

/** Resultado de «Eliminar el perfil»: solo recuentos, sin datos de la persona. */
export interface RemovedProfile {
  id: string;
  contentsWithoutAuthor: number;
  revisionsWithoutAuthor: number;
  /** Contenidos de los que se retira su nombre de «Revisado por» (siguen constando como revisados). */
  reviewerNamesRemoved: number;
  welcomesDeleted: number;
  sessionsClosed: number;
  attemptsAnonymized: number;
  /** Cumpleaños y fecha de incorporación borrados con la ficha (0, 1 o 2): salen del calendario. */
  calendarDatesDeleted: number;
}

async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'sin-conexion', MESSAGES.offline);
  }
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const b = data as ErrorBody | null;
    const code = b?.error?.code ?? `http-${res.status}`;
    const message = messageFor(res.status, b);
    const field = res.status === 409 ? CONFLICT_FIELD[code] : undefined;
    throw new ApiError(res.status, code, message, fieldsOf(b?.error?.details) ?? (field ? { [field]: message } : undefined));
  }
  return data as T;
}

export const api = {
  async session(): Promise<SessionPayload | null> {
    try {
      const s = await request<SessionPayload | { authenticated: false; csrfToken?: string }>('GET', '/session');
      if ('csrfToken' in s && s.csrfToken) csrfToken = s.csrfToken;
      return s.authenticated ? (s as SessionPayload) : null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },
  async login(email: string, password: string) {
    const s = await request<SessionPayload>('POST', '/auth/login', { email, password });
    csrfToken = s.csrfToken;
    return s;
  },
  logout: () => request<void>('POST', '/auth/logout'),
  forgotPassword: (email: string) => request<{ message: string }>('POST', '/auth/password/forgot', { email }),
  resetPassword: (token: string, password: string) => request<void>('POST', '/auth/password/reset', { token, password }),
  formations: () => request<unknown[]>('GET', '/formations'),
  formation: (ref: string) => request<unknown>('GET', `/formations/${encodeURIComponent(ref)}`),
  confirmRead: (ref: string) => request<unknown>('POST', `/formations/${encodeURIComponent(ref)}/read`),
  submitAttempt: (ref: string, answers: Record<string, string>) => request<unknown>('POST', `/formations/${encodeURIComponent(ref)}/attempts`, { answers }),
  submitAssessment: (ref: string, answers: Record<string, string>) => request<unknown>('POST', `/assessments/${encodeURIComponent(ref)}/attempts`, { answers }),
  myProgress: () => request<unknown>('GET', '/me/progress'),
  documents: () => request<unknown[]>('GET', '/documents'),
  events: () => request<unknown[]>('GET', '/events'),
  /**
   * Calendario del mes con `entriesForMonth()`: festivos, encuentros de equipo y los cumpleaños y aniversarios
   * de las personas activas (calculados en el servidor a partir de cada ficha: una entrada por persona, tipo y año).
   */
  calendar: (year: number, month: number) => request<{ year: number; month: number; entries: CalendarEntry[] }>('GET', `/calendar?year=${year}&month=${month}`),
  /** Perfil propio, con los datos del calendario que faltan. */
  me: () => request<{ person: Person; missingPersonalDates: PersonalDateField[]; accountState: ApiAdminPerson['accountState']; permissions: string[] }>('GET', '/me'),
  /**
   * Completa los datos del calendario de la propia ficha: el cumpleaños («MM-DD», se puede corregir) y la
   * fecha de incorporación (solo si aún no consta; si no, 409 `INCORPORACION_YA_INDICADA`). `changed`: los
   * campos que han cambiado.
   */
  completeMyDates: (dates: { birthday?: string; startDate?: string }) =>
    request<{ person: Person; missingPersonalDates: PersonalDateField[]; changed: PersonalDateField[] }>('PATCH', '/me/personal-dates', dates),
  /** Directorio interno de las personas activas (sin correos). */
  directory: () => request<{ items: ApiDirectoryEntry[] }>('GET', '/people/directory'),
  /** Administración: listado de fichas (filtros opcionales). */
  people: (filters: { status?: 'activa' | 'inactiva'; role?: Role; q?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(filters).filter((e): e is [string, string] => !!e[1])).toString();
    return request<{ items: ApiAdminPerson[] }>('GET', `/people${qs ? `?${qs}` : ''}`);
  },
  person: (id: string) => request<{ person: ApiAdminPerson }>('GET', `/people/${encodeURIComponent(id)}`),
  /** Alta (con cumpleaños e incorporación obligatorios); la persona recibe el enlace de activación. */
  createPerson: (input: ApiPersonInput) => request<{ person: ApiAdminPerson; activation: ApiActivation }>('POST', '/people', input),
  /** Edición de la ficha; el calendario cambia con ella. Cambiar el rol cierra sus sesiones (`sessionsRevoked`). */
  updatePerson: (id: string, patch: ApiPersonPatch) => request<{ person: ApiAdminPerson; sessionsRevoked: boolean }>('PATCH', `/people/${encodeURIComponent(id)}`, patch),
  contents: () => request<{ items: unknown[] }>('GET', '/contents'),
  /** Ficha editorial. Un borrador puede estar a medias: a `item` le pueden faltar campos obligatorios. */
  content: (id: string) => request<{ content: ApiContentDetail }>('GET', `/contents/${encodeURIComponent(id)}`),
  /** Vista previa de la versión de trabajo (los cambios sin publicar, si los hay); como la ficha, puede estar a medias. */
  preview: (id: string) =>
    request<{ preview: true; source: 'contenido' | 'revision-pendiente'; status: string; item: Record<string, unknown>; phase?: string }>('GET', `/contents/${encodeURIComponent(id)}/preview`),
  /** Crea un borrador nuevo de ese tipo, aunque esté a medias (los documentos se suben con `uploadDocument`). */
  createContent: (type: string, payload: unknown) => request<{ content: ApiContentDetail }>('POST', '/contents', { type, payload }),
  /** «Guardar borrador». `revision`: la que se tiene abierta; si otra persona guardó antes, 409. */
  saveContent: (id: string, revision: number, payload: unknown) => request<{ content: ApiContentDetail }>('PUT', `/contents/${encodeURIComponent(id)}`, { revision, payload }),
  /** «Publicar» (con `reviewed` si lo ha revisado el área), «Archivar» o «Restaurar» (administración). */
  transition: (id: string, action: 'publicar' | 'archivar' | 'restaurar', revision: number, reviewed?: boolean) =>
    request<{ content: ApiContentDetail }>('POST', `/contents/${encodeURIComponent(id)}/transitions`, { action, revision, ...(reviewed === undefined ? {} : { reviewed }) }),
  /** «Eliminar el perfil» de quien deja FLM; `confirm` es su correo. Su contenido queda sin autoría y se retira su nombre de «Revisado por». */
  removePerson: (id: string, confirm: string) => request<{ removed: RemovedProfile }>('POST', `/people/${encodeURIComponent(id)}/remove`, { confirm }),
  uploadDocument: (form: FormData) => request<{ content: ApiContentDetail }>('POST', '/documents', form),
  /**
   * Sustituye el PDF (formulario con `archivo` y, opcional, `nota`). En un borrador nunca publicado, al momento
   * (su autoría o administración); en uno publicado, solo administración, y espera en los cambios (`pending`).
   */
  replaceDocumentFile: (id: string, form: FormData) => request<{ content: ApiContentDetail }>('POST', `/documents/${encodeURIComponent(id)}/versions`, form),
};

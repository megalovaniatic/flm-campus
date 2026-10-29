/**
 * Cliente de la API privada (modo production).
 * - Cookies de sesión HttpOnly (credentials: 'include').
 * - Token CSRF obtenido en GET /api/session y enviado en X-CSRF-Token en toda escritura.
 * - Errores traducidos a mensajes claros en castellano (MESSAGES).
 * En la demostración pública (__DEMO__) no se usa: las operaciones se simulan en el navegador.
 */
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
  user: { id: string; email: string; name: string; role: 'empleado' | 'autor' | 'admin'; roleLabel: string; position: string; department: string; office: string; photo?: string };
  permissions: string[];
  csrfToken: string;
}

function messageFor(status: number, body: { error?: string; message?: string } | null): string {
  if (body?.message) return body.message;
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
    const b = data as { error?: string; message?: string; fields?: Record<string, string> } | null;
    throw new ApiError(res.status, b?.error ?? `http-${res.status}`, messageFor(res.status, b), b?.fields);
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
  calendar: (year: number, month: number) => request<unknown>('GET', `/calendar?year=${year}&month=${month}`),
  contents: () => request<unknown[]>('GET', '/contents'),
  saveContent: (id: string | null, payload: unknown) => (id ? request<unknown>('PUT', `/contents/${id}`, payload) : request<unknown>('POST', '/contents', payload)),
  transition: (id: string, action: string, comment?: string) => request<unknown>('POST', `/contents/${id}/transitions`, { action, comment }),
  uploadDocument: (form: FormData) => request<unknown>('POST', '/documents', form),
};

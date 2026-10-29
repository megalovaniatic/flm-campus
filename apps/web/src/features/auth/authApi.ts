/**
 * Cliente mínimo de acceso para la versión interna (API en /api, ver apps/api/src/routes/auth.ts).
 * La demostración pública no lo usa: allí el acceso es sin contraseña y se rotula como simulación.
 * Las peticiones que modifican datos envían el token CSRF que entrega GET /api/session.
 */
const API = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api`;

export class AccessError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AccessError';
  }
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function csrfToken(): Promise<string> {
  const res = await fetch(`${API}/session`, { credentials: 'include' });
  const body = await readJson(res);
  if (!res.ok || typeof body.csrfToken !== 'string') throw new AccessError('No hemos podido conectar con el campus. Revisa la conexión e inténtalo de nuevo.');
  return body.csrfToken;
}

async function post(path: string, payload: unknown): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    const token = await csrfToken();
    res = await fetch(`${API}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (e instanceof AccessError) throw e;
    throw new AccessError('No hemos podido conectar con el campus. Revisa la conexión e inténtalo de nuevo.');
  }
  const body = await readJson(res);
  if (!res.ok) {
    const error = (body.error ?? {}) as { message?: string; code?: string };
    throw new AccessError(error.message ?? 'No se ha podido completar la operación. Inténtalo de nuevo.', error.code);
  }
  return body;
}

/** Inicia sesión con el correo corporativo y la contraseña. Devuelve el id de la persona. */
export async function login(email: string, password: string): Promise<{ id: string; name: string }> {
  const body = await post('/auth/login', { email, password });
  const user = body.user as { id: string; name: string } | undefined;
  if (!user) throw new AccessError('La respuesta del servidor no es válida. Inténtalo de nuevo.');
  return user;
}

/** Solicita el enlace de recuperación. La respuesta es siempre genérica (no revela si la cuenta existe). */
export async function requestPasswordReset(email: string): Promise<string> {
  const body = await post('/auth/password/forgot', { email });
  return typeof body.message === 'string' ? body.message : RECOVERY_MESSAGE;
}

/** Enlaces de los correos: activar la cuenta (7 días) o crear una contraseña nueva (30 minutos). */
export type AccountLink = 'activar' | 'restablecer';

/** Errores de un enlace que no sirve: la pantalla deja de pedir la contraseña y explica qué hacer. */
export const LINK_ERRORS = new Set(['ENLACE_NO_VALIDO', 'ENLACE_USADO', 'ENLACE_CADUCADO', 'CUENTA_DESACTIVADA']);

/** Comprueba el enlace antes de pedir la contraseña. Devuelve a quién pertenece. */
export async function checkAccountLink(kind: AccountLink, token: string): Promise<{ name: string; email: string; expiresAt: string }> {
  const body = await post(kind === 'activar' ? '/auth/activation/check' : '/auth/password/reset/check', { token });
  return { name: String(body.name ?? ''), email: String(body.email ?? ''), expiresAt: String(body.expiresAt ?? '') };
}

/** Activa la cuenta con la contraseña elegida; la API abre la sesión. Devuelve la persona. */
export async function activateAccount(token: string, password: string): Promise<{ id: string; name: string }> {
  const body = await post('/auth/activate', { token, password });
  const user = body.user as { id: string; name: string } | undefined;
  if (!user) throw new AccessError('La respuesta del servidor no es válida. Inténtalo de nuevo.');
  return user;
}

/** Guarda la contraseña nueva; la API cierra todas las sesiones de la cuenta. Devuelve el mensaje. */
export async function resetPassword(token: string, password: string): Promise<string> {
  const body = await post('/auth/password/reset', { token, password });
  return typeof body.message === 'string' ? body.message : 'Contraseña restablecida. Inicia sesión con la nueva contraseña.';
}

/** Mismo texto genérico que devuelve la API (apps/api/src/routes/auth.ts). */
export const RECOVERY_MESSAGE =
  'Si existe una cuenta activa con ese correo, recibirás en unos minutos un enlace para restablecer la contraseña. El enlace caduca a los 30 minutos.';

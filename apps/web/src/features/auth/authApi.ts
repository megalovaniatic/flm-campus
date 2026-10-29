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

/** Mismo texto genérico que devuelve la API (apps/api/src/routes/auth.ts). */
export const RECOVERY_MESSAGE =
  'Si existe una cuenta activa con ese correo, recibirás en unos minutos un enlace para restablecer la contraseña. El enlace caduca a los 30 minutos.';

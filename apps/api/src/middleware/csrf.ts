import type { Context, MiddlewareHandler } from 'hono';
import { readCookie } from '../auth/cookies';
import { safeEqual } from '../auth/tokens';
import type { AppContext, AppEnv } from '../context';
import { HttpError } from '../lib/errors';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Rutas que modifican datos sin sesión: usan el token CSRF previo (cookie + cabecera). */
export const PUBLIC_MUTATIONS = new Set([
  '/api/auth/login',
  '/api/auth/activation/check',
  '/api/auth/activate',
  '/api/auth/password/forgot',
  '/api/auth/password/reset',
]);

function requestOrigin(c: Context): string | null {
  const origin = c.req.header('origin');
  if (origin) return origin;
  const referer = c.req.header('referer');
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Protección CSRF para toda petición que modifica datos (POST, PUT, PATCH, DELETE):
 * 1. El origen (Origin o, en su defecto, Referer) debe coincidir con APP_ORIGIN.
 * 2. La cabecera X-CSRF-Token debe coincidir con el token de la sesión (o, sin sesión,
 *    con la cookie CSRF previa que entrega `GET /api/session`).
 */
export function csrfProtection(ctx: AppContext): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    if (SAFE_METHODS.has(c.req.method)) return next();

    const origin = requestOrigin(c);
    if (!origin) {
      throw new HttpError(403, 'ORIGEN_NO_PERMITIDO', 'La petición no indica su origen (cabecera Origin). Por seguridad, no se ha procesado.');
    }
    if (origin !== ctx.config.appOrigin) {
      throw new HttpError(403, 'ORIGEN_NO_PERMITIDO', 'La petición procede de un origen no autorizado.');
    }

    const session = c.get('session');
    const problem = c.get('sessionProblem');
    if (!session && problem && !PUBLIC_MUTATIONS.has(c.req.path)) {
      // Mejor explicar que la sesión ha caducado que devolver un error de token.
      throw new HttpError(401, problem.code, problem.message);
    }

    const sent = c.req.header('x-csrf-token') ?? '';
    const expected = session ? session.csrf_token : readCookie(c, ctx.cookies.csrf);
    if (!sent || !expected || !safeEqual(sent, expected)) {
      throw new HttpError(403, 'CSRF_NO_VALIDO', 'Falta el token de seguridad (CSRF) o no es válido. Recarga la página e inténtalo de nuevo.');
    }
    await next();
  };
}

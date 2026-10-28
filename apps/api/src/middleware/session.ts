import type { MiddlewareHandler } from 'hono';
import { clearSessionCookie, readCookie } from '../auth/cookies';
import { checkSession, revokeSession, touchSession } from '../auth/sessions';
import type { AppContext, AppEnv } from '../context';
import { getUser } from '../services/people';

/**
 * Carga la sesión de la cookie (si la hay) y la persona autenticada. No rechaza la petición:
 * si la sesión no sirve, guarda el motivo para que las rutas protegidas respondan 401 con un
 * mensaje claro («ha caducado tras 12 horas sin actividad», «administración la ha cerrado», etc.).
 */
export function sessionMiddleware(ctx: AppContext): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const token = readCookie(c, ctx.cookies.session);
    if (token) {
      const now = ctx.now().getTime();
      const check = checkSession(ctx.db, token, now);
      if (check.ok) {
        const user = getUser(ctx.db, check.session.user_id);
        if (user && user.status === 'activa' && !user.anonymized_at) {
          touchSession(ctx.db, check.session, now);
          c.set('session', check.session);
          c.set('user', { id: user.id, email: user.email, name: user.name, role: user.role });
        } else {
          revokeSession(ctx.db, check.session.id, 'desactivacion', now);
          c.set('sessionProblem', { code: 'CUENTA_DESACTIVADA', message: 'Tu cuenta está desactivada. Si crees que es un error, contacta con administración.' });
          clearSessionCookie(c, ctx.config, ctx.cookies);
        }
      } else {
        c.set('sessionProblem', { code: check.code, message: check.message });
        clearSessionCookie(c, ctx.config, ctx.cookies);
      }
    }
    await next();
  };
}

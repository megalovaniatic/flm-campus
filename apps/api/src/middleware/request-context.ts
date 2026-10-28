import { randomUUID } from 'node:crypto';
import type { Context, MiddlewareHandler } from 'hono';
import type { AppContext, AppEnv } from '../context';

/**
 * IP del cliente. Con TRUST_PROXY = n se toma la n-ésima dirección empezando por la derecha de
 * X-Forwarded-For (la que añadió el proxy de confianza más cercano), nunca la que envía el cliente.
 */
export function resolveClientIp(c: Context<AppEnv>, trustProxy: number): string {
  if (trustProxy > 0) {
    const forwarded = c.req.header('x-forwarded-for');
    if (forwarded) {
      const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
      const candidate = parts[Math.max(0, parts.length - trustProxy)];
      if (candidate) return normalizeIp(candidate);
    }
  }
  const remote = c.env?.incoming?.socket?.remoteAddress;
  return remote ? normalizeIp(remote) : 'desconocida';
}

function normalizeIp(ip: string): string {
  const clean = ip.replace(/^::ffff:/i, '').slice(0, 64);
  return /^[0-9a-f.:]+$/i.test(clean) ? clean : 'desconocida';
}

/** Identificador de petición, IP del cliente y registro de acceso (método, ruta, estado y duración). */
export function requestContext(ctx: AppContext): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const started = performance.now();
    const requestId = randomUUID();
    c.set('requestId', requestId);
    c.set('clientIp', resolveClientIp(c, ctx.config.trustProxy));
    c.set('user', null);
    c.set('session', null);
    c.set('sessionProblem', null);
    await next();
    c.header('X-Request-Id', requestId);
    if (ctx.config.env !== 'test') {
      ctx.logger.info(`${c.req.method} ${c.req.path} ${c.res.status} ${Math.round(performance.now() - started)} ms`, {
        requestId,
        ip: c.get('clientIp'),
        userId: c.get('user')?.id,
      });
    }
  };
}

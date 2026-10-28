import { Hono } from 'hono';
import { cookieNames } from './auth/cookies';
import type { AppContext, AppDeps, AppEnv } from './context';
import { get } from './db/database';
import './lib/validation';
import { csrfProtection } from './middleware/csrf';
import { apiNotFound, bodySizeLimit, errorHandler } from './middleware/errors';
import { generalRateLimit, RateLimiter } from './middleware/rate-limit';
import { requestContext } from './middleware/request-context';
import { securityHeaders } from './middleware/security-headers';
import { sessionMiddleware } from './middleware/session';
import { adminRoutes } from './routes/admin';
import { authRoutes, sessionRoutes } from './routes/auth';
import { companyRoutes } from './routes/company';
import { contentRoutes } from './routes/contents';
import { learningRoutes } from './routes/learning';
import { libraryRoutes } from './routes/library';
import { meRoutes, peopleRoutes } from './routes/people';
import { FileStorage } from './services/files';
import { mountWeb } from './web';

/**
 * Construye la aplicación Hono. No abre puertos ni lee el entorno: recibe sus dependencias,
 * de modo que las pruebas usan `app.request()` con SQLite en memoria y un reloj controlado.
 */
export function createApp(deps: AppDeps): { app: Hono<AppEnv>; ctx: AppContext } {
  const ctx: AppContext = {
    ...deps,
    limiter: deps.limiter ?? new RateLimiter(() => deps.now().getTime()),
    cookies: cookieNames(deps.config),
    storage: new FileStorage(deps.config.storageDir),
  };

  const app = new Hono<AppEnv>();
  app.use('*', requestContext(ctx));
  app.use('*', securityHeaders(ctx.config));
  app.onError(errorHandler(ctx));
  app.notFound((c) => (c.req.path === '/api' || c.req.path.startsWith('/api/') ? apiNotFound(c) : c.text('Página no encontrada', 404)));

  const api = new Hono<AppEnv>();
  api.use('*', async (c, next) => {
    await next();
    if (!c.res.headers.has('Cache-Control')) c.res.headers.set('Cache-Control', 'no-store');
  });
  api.use('*', generalRateLimit(ctx.limiter));
  api.use('*', bodySizeLimit());
  api.use('*', sessionMiddleware(ctx));
  api.use('*', csrfProtection(ctx));

  /** Comprobación de estado para Docker, Render o Fly.io (pública). */
  api.get('/health', (c) => {
    get(ctx.db, 'SELECT 1 AS ok');
    return c.json({ status: 'ok' });
  });

  api.route('/auth', authRoutes(ctx));
  api.route('/', sessionRoutes(ctx));
  api.route('/me', meRoutes(ctx));
  api.route('/people', peopleRoutes(ctx));
  api.route('/contents', contentRoutes(ctx));
  api.route('/', learningRoutes(ctx));
  api.route('/', libraryRoutes(ctx));
  api.route('/', companyRoutes(ctx));
  api.route('/', adminRoutes(ctx));
  app.route('/api', api);

  if (ctx.config.serveWebDist) mountWeb(app, ctx.config.serveWebDist);

  return { app, ctx };
}

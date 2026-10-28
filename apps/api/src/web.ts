import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import type { Context, Hono } from 'hono';
import type { AppEnv } from './context';

/**
 * Sirve la web compilada (apps/web/dist) desde el mismo origen que la API, con «fallback» SPA:
 * cualquier ruta sin extensión que no sea de la API devuelve index.html para que el enrutador
 * del navegador resuelva la página. Los recursos con hash se cachean un año; index.html, nunca.
 */
export function mountWeb(app: Hono<AppEnv>, distDir: string): void {
  const index = join(distDir, 'index.html');
  if (!existsSync(index)) throw new Error(`No se encuentra ${index}. Compila la web con «npm run build -w @flm/web».`);

  const cacheHeaders = (path: string, c: Context<AppEnv>) => {
    if (/[\\/]assets[\\/]/.test(path)) c.header('Cache-Control', 'public, max-age=31536000, immutable');
    else if (path.endsWith('.html')) c.header('Cache-Control', 'no-cache');
    else c.header('Cache-Control', 'public, max-age=3600');
  };
  const files = serveStatic<AppEnv>({ root: distDir, onFound: cacheHeaders });
  const spaFallback = serveStatic<AppEnv>({ path: index, onFound: cacheHeaders });
  const isApi = (path: string) => path === '/api' || path.startsWith('/api/');

  app.use('*', async (c, next) => (isApi(c.req.path) ? next() : files(c, next)));

  app.get('*', async (c, next) => {
    if (isApi(c.req.path)) return next();
    const last = c.req.path.split('/').pop() ?? '';
    if (last.includes('.')) return next(); // recurso inexistente: 404, nunca index.html
    return spaFallback(c, next);
  });
}

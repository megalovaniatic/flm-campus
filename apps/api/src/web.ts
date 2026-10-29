import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import type { Hono } from 'hono';
import type { AppEnv } from './context';

/**
 * Sirve la web compilada (apps/web/dist) desde el mismo origen que la API, con «fallback» SPA:
 * cualquier ruta sin extensión que no sea de la API devuelve index.html para que el enrutador
 * del navegador resuelva la página. Los recursos con hash (/assets/) se cachean un año;
 * el HTML nunca se cachea para que cada despliegue llegue al momento.
 */
export function mountWeb(app: Hono<AppEnv>, distDir: string): void {
  const index = join(distDir, 'index.html');
  if (!existsSync(index)) throw new Error(`No se encuentra ${index}. Compila la web con «npm run build -w @flm/web».`);

  const files = serveStatic<AppEnv>({ root: distDir });
  const spaFallback = serveStatic<AppEnv>({ path: index });
  const isApi = (path: string) => path === '/api' || path.startsWith('/api/');

  /** serveStatic crea la respuesta antes de avisar, así que la caché se fija sobre la respuesta devuelta. */
  const withCache = (res: Response | void, path: string): Response | void => {
    if (!(res instanceof Response) || res.status >= 400) return res;
    const html = (res.headers.get('content-type') ?? '').includes('text/html');
    res.headers.set('Cache-Control', html ? 'no-cache' : path.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
    return res;
  };

  app.use('*', async (c, next) => (isApi(c.req.path) ? next() : withCache(await files(c, next), c.req.path)));

  app.get('*', async (c, next) => {
    if (isApi(c.req.path)) return next();
    const last = c.req.path.split('/').pop() ?? '';
    if (last.includes('.')) return next(); // recurso inexistente: 404, nunca index.html
    return withCache(await spaFallback(c, next), '/index.html');
  });
}

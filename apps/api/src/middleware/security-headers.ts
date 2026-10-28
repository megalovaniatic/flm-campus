import type { MiddlewareHandler } from 'hono';
import type { AppConfig } from '../config';
import type { AppEnv } from '../context';

/**
 * Cabeceras de seguridad para todas las respuestas.
 * - API (JSON, archivos): CSP que no permite cargar nada.
 * - Web compilada (HTML): CSP estricta sin scripts ni estilos en línea.
 * - HSTS solo en producción (exige HTTPS en el dominio y sus subdominios durante 2 años).
 */
export const API_CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

export function webCsp(production: boolean): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(production ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}

export const PERMISSIONS_POLICY =
  'accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), usb=(), browsing-topics=()';

export function securityHeaders(config: AppConfig): MiddlewareHandler<AppEnv> {
  const production = config.env === 'production';
  const htmlPolicy = webCsp(production);
  return async (c, next) => {
    await next();
    const headers = c.res.headers;
    const isHtml = (headers.get('content-type') ?? '').includes('text/html');
    if (!headers.has('Content-Security-Policy')) headers.set('Content-Security-Policy', isHtml ? htmlPolicy : API_CSP);
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    // «same-origin»: no se filtran direcciones internas a otros sitios. No se usa «no-referrer»
    // porque con esa política los envíos de formularios llevan «Origin: null» y la comprobación
    // de origen los rechazaría.
    headers.set('Referrer-Policy', 'same-origin');
    headers.set('Permissions-Policy', PERMISSIONS_POLICY);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    if (production) headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    headers.delete('X-Powered-By');
  };
}

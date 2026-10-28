import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { AppConfig } from '../config';

/**
 * Nombres de cookie. Con HTTPS (siempre en producción) se usan los prefijos `__Host-`, que obligan a
 * Secure, Path=/ y prohíben Domain. En desarrollo sobre http://localhost el navegador rechazaría una
 * cookie `__Host-` sin Secure, así que se usa el mismo nombre sin prefijo.
 */
export interface CookieNames {
  session: string;
  csrf: string;
}

export function cookieNames(config: Pick<AppConfig, 'secureCookies'>): CookieNames {
  return config.secureCookies ? { session: '__Host-flm_sid', csrf: '__Host-flm_csrf' } : { session: 'flm_sid', csrf: 'flm_csrf' };
}

export function readCookie(c: Context, name: string): string | undefined {
  const value = getCookie(c, name);
  return value && value.length <= 200 ? value : undefined;
}

export function setSessionCookie(c: Context, config: AppConfig, names: CookieNames, token: string, maxAgeSeconds: number): void {
  setCookie(c, names.session, token, {
    httpOnly: true,
    secure: config.secureCookies,
    sameSite: 'Lax',
    path: '/',
    maxAge: Math.max(0, Math.floor(maxAgeSeconds)),
  });
}

export function clearSessionCookie(c: Context, config: AppConfig, names: CookieNames): void {
  deleteCookie(c, names.session, { path: '/', secure: config.secureCookies, httpOnly: true, sameSite: 'Lax' });
}

/** Cookie del token CSRF previo al inicio de sesión (patrón «double submit», solo para rutas públicas). */
export function setCsrfCookie(c: Context, config: AppConfig, names: CookieNames, token: string): void {
  setCookie(c, names.csrf, token, { httpOnly: true, secure: config.secureCookies, sameSite: 'Strict', path: '/' });
}

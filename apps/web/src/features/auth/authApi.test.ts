import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccessError, activateAccount, checkAccountLink, LINK_ERRORS, resetPassword } from './authApi';

/** Simula la API: GET /api/session da el token CSRF y cada POST responde lo indicado. */
function mockApi(responses: Record<string, { status: number; body: unknown }>) {
  const calls: { url: string; body?: unknown; csrf?: string | null }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined, csrf: headers.get('X-CSRF-Token') });
      if (url.endsWith('/api/session')) return new Response(JSON.stringify({ authenticated: false, csrfToken: 'csrf-1' }), { status: 200 });
      const path = url.replace(/^.*\/api/, '');
      const r = responses[path] ?? { status: 404, body: { error: { code: 'NO_ENCONTRADO', message: 'No existe.' } } };
      return new Response(JSON.stringify(r.body), { status: r.status });
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe('enlaces de los correos', () => {
  it('comprueba el enlace de activación y el de recuperación en su ruta, con el token CSRF', async () => {
    const calls = mockApi({
      '/auth/activation/check': { status: 200, body: { valid: true, name: 'Marta Nueva', email: 'marta.nueva@flmexperts.com', expiresAt: '2026-11-05T09:00:00.000Z' } },
      '/auth/password/reset/check': { status: 200, body: { valid: true, name: 'Marta Nueva', email: 'marta.nueva@flmexperts.com', expiresAt: '2026-10-29T21:30:00.000Z' } },
    });
    expect(await checkAccountLink('activar', 'tok-a')).toEqual({ name: 'Marta Nueva', email: 'marta.nueva@flmexperts.com', expiresAt: '2026-11-05T09:00:00.000Z' });
    expect((await checkAccountLink('restablecer', 'tok-r')).email).toBe('marta.nueva@flmexperts.com');
    const posts = calls.filter((c) => !c.url.endsWith('/api/session'));
    expect(posts.map((c) => [c.url.replace(/^.*\/api/, ''), c.body, c.csrf])).toEqual([
      ['/auth/activation/check', { token: 'tok-a' }, 'csrf-1'],
      ['/auth/password/reset/check', { token: 'tok-r' }, 'csrf-1'],
    ]);
  });

  it('un enlace caducado, usado o sustituido llega con su código y su mensaje', async () => {
    mockApi({ '/auth/password/reset/check': { status: 400, body: { error: { code: 'ENLACE_CADUCADO', message: 'El enlace ha caducado.' } } } });
    const error = await checkAccountLink('restablecer', 'viejo').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AccessError);
    expect(error).toMatchObject({ code: 'ENLACE_CADUCADO', message: 'El enlace ha caducado.' });
    expect(LINK_ERRORS.has((error as AccessError).code!)).toBe(true);
  });

  it('activar devuelve la persona (la API abre la sesión) y restablecer, el mensaje', async () => {
    const calls = mockApi({
      '/auth/activate': { status: 200, body: { authenticated: true, user: { id: 'p-marta', name: 'Marta Nueva' }, csrfToken: 'csrf-2' } },
      '/auth/password/reset': { status: 200, body: { message: 'Contraseña restablecida. Se han cerrado todas tus sesiones: inicia sesión con la nueva contraseña.' } },
    });
    expect(await activateAccount('tok-a', 'DoceCaracteres1')).toEqual({ id: 'p-marta', name: 'Marta Nueva' });
    expect(await resetPassword('tok-r', 'OtraClaveSegura2')).toContain('Se han cerrado todas tus sesiones');
    expect(calls.find((c) => c.url.endsWith('/auth/activate'))?.body).toEqual({ token: 'tok-a', password: 'DoceCaracteres1' });
  });
});

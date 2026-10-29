import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EMAILS, IDS } from './fixtures/seed';
import { RATE_RULES } from '../src/middleware/rate-limit';
import { createTestEnv, fileForm, json, loginAs, MINUTE, PASSWORD, PNG_BYTES, TestClient, type TestEnv } from './helpers';

describe('cabeceras de seguridad', () => {
  it('añade CSP estricta, X-Frame-Options, Referrer-Policy, Permissions-Policy y COOP; sin HSTS fuera de producción', async () => {
    const env = await createTestEnv({ seed: false });
    const res = await env.app.request('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-security-policy')).toBe("default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('same-origin');
    expect(res.headers.get('permissions-policy')).toContain('camera=()');
    expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('strict-transport-security')).toBeNull();
    env.close();
  });

  it('envía HSTS en producción', async () => {
    const env = await createTestEnv({ seed: false, config: { env: 'production' } });
    const res = await env.app.request('/api/health');
    expect(res.headers.get('strict-transport-security')).toBe('max-age=63072000; includeSubDomains');
    env.close();
  });

  it('en desarrollo sobre http usa la cookie flm_sid sin Secure (el prefijo __Host- exige HTTPS)', async () => {
    const env = await createTestEnv({ config: { env: 'development', secureCookies: false } });
    const client = new TestClient(env.app);
    await client.init();
    const res = await client.post('/api/auth/login', { email: EMAILS.empleado, password: PASSWORD });
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('flm_sid='))!;
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).not.toMatch(/Secure/);
    env.close();
  });
});

describe('CSRF y origen', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('exige X-CSRF-Token de la sesión en las peticiones que modifican datos', async () => {
    const client = await loginAs(env, EMAILS.empleado);
    const missing = await client.post('/api/auth/logout', {}, { csrf: false });
    expect(missing.status).toBe(403);
    expect((await json(missing)).error.code).toBe('CSRF_NO_VALIDO');
    expect((await client.post('/api/auth/logout', {}, { csrf: 'x'.repeat(43) })).status).toBe(403);
    expect((await client.post('/api/auth/logout')).status).toBe(200);
  });

  it('también sin sesión: el inicio de sesión necesita el token previo de GET /api/session (cookie + cabecera)', async () => {
    const client = new TestClient(env.app);
    expect((await client.post('/api/auth/login', { email: EMAILS.empleado, password: PASSWORD })).status).toBe(403);
    const { csrfToken } = await client.init();
    client.cookies.clear();
    expect((await client.post('/api/auth/login', { email: EMAILS.empleado, password: PASSWORD }, { csrf: csrfToken })).status).toBe(403);
    await client.init();
    expect((await client.post('/api/auth/login', { email: EMAILS.empleado, password: PASSWORD })).status).toBe(200);
  });

  it('comprueba Origin contra APP_ORIGIN (o Referer si falta Origin)', async () => {
    const client = await loginAs(env, EMAILS.empleado);
    const evil = await client.delete('/api/me/photo', { origin: 'https://malicioso.example' });
    expect(evil.status).toBe(403);
    expect((await json(evil)).error.code).toBe('ORIGEN_NO_PERMITIDO');
    expect((await client.delete('/api/me/photo', { origin: null })).status).toBe(403);
    const viaReferer = await client.delete('/api/me/photo', { origin: null, headers: { referer: 'https://campus.test/perfil' } });
    expect(viaReferer.status).toBe(200);
  });
});

describe('límites de frecuencia', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('inicio de sesión: 5 intentos cada 15 minutos por IP y correo, con Retry-After', async () => {
    const client = new TestClient(env.app);
    await client.init();
    for (let i = 0; i < 5; i++) {
      expect((await client.post('/api/auth/login', { email: EMAILS.empleado, password: 'Equivocada2026' })).status).toBe(401);
    }
    const blocked = await client.post('/api/auth/login', { email: EMAILS.empleado, password: PASSWORD });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBe(15 * 60);
    expect((await json(blocked)).error.message).toBe('Demasiados intentos de inicio de sesión. Espera 15 minutos y vuelve a intentarlo.');
    const otherIp = new TestClient(env.app);
    otherIp.ip = '198.51.100.77';
    expect((await otherIp.login(EMAILS.empleado)).status).toBe(200);
    env.clock.advance(15 * MINUTE + 1000);
    expect((await client.post('/api/auth/login', { email: EMAILS.empleado, password: PASSWORD })).status).toBe(200);
  });

  it('inicio de sesión: 30 intentos fallidos por hora por IP', async () => {
    const client = new TestClient(env.app);
    await client.init();
    for (let i = 0; i < RATE_RULES.loginIpFailures.limit; i++) {
      expect((await client.post('/api/auth/login', { email: `intento${i}@flmexperts.com`, password: 'Equivocada2026' })).status).toBe(401);
    }
    const blocked = await client.post('/api/auth/login', { email: EMAILS.admin, password: PASSWORD });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(55 * 60);
  });

  it('una ráfaga simultánea de intentos fallidos no supera el límite por IP', async () => {
    const client = new TestClient(env.app);
    client.ip = '203.0.113.99';
    await client.init();
    const limit = RATE_RULES.loginIpFailures.limit;
    const res = await Promise.all(Array.from({ length: limit + 5 }, (_, i) => client.post('/api/auth/login', { email: `rafaga${i}@flmexperts.com`, password: 'Equivocada2026' })));
    expect(res.filter((r) => r.status === 401)).toHaveLength(limit);
    expect(res.filter((r) => r.status === 429)).toHaveLength(5);
  });

  it('una oficina detrás de una sola IP: los inicios correctos no cuentan para el límite por IP', async () => {
    // 40 inicios correctos seguidos desde la misma IP (antes, el 21.º recibía 429), con algún fallo entre medias
    const accounts = [EMAILS.empleado, EMAILS.autor, EMAILS.admin];
    for (let i = 0; i < 40; i++) {
      const person = new TestClient(env.app);
      person.ip = '203.0.113.10';
      await person.init();
      if (i % 10 === 0) expect((await person.post('/api/auth/login', { email: accounts[i % 3], password: 'Equivocada2026' })).status).toBe(401);
      expect((await person.post('/api/auth/login', { email: accounts[i % 3], password: PASSWORD })).status, `inicio ${i + 1}`).toBe(200);
    }
  });

  it('recuperación: 3 por hora por correo y 10 por hora por IP', async () => {
    const client = new TestClient(env.app);
    await client.init();
    for (let i = 0; i < 3; i++) expect((await client.post('/api/auth/password/forgot', { email: EMAILS.empleado })).status).toBe(202);
    const byEmail = await client.post('/api/auth/password/forgot', { email: EMAILS.empleado });
    expect(byEmail.status).toBe(429);
    expect((await json(byEmail)).error.message).toContain('demasiados enlaces de recuperación');
    for (let i = 0; i < 7; i++) expect((await client.post('/api/auth/password/forgot', { email: `otra${i}@flmexperts.com` })).status).toBe(202);
    const byIp = await client.post('/api/auth/password/forgot', { email: 'nueva@flmexperts.com' });
    expect(byIp.status).toBe(429);
    expect(byIp.headers.get('retry-after')).not.toBeNull();
  });

  it('general: 1.500 peticiones por minuto por IP', async () => {
    const client = new TestClient(env.app);
    client.ip = '198.51.100.200';
    expect(RATE_RULES.general.limit).toBe(1500);
    for (let i = 0; i < RATE_RULES.general.limit; i++) expect((await client.get('/api/health')).status).toBe(200);
    const blocked = await client.get('/api/health');
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeLessThanOrEqual(60);
    expect((await json(blocked)).error.message).toContain('Demasiadas peticiones');
    env.clock.advance(MINUTE);
    expect((await client.get('/api/health')).status).toBe(200);
  });

  it('subidas: 30 por hora por persona', async () => {
    const author = await loginAs(env, EMAILS.autor);
    for (let i = 0; i < 30; i++) {
      expect((await author.upload('POST', '/api/files', fileForm(PNG_BYTES, `imagen-${i}.png`, 'image/png'))).status).toBe(201);
    }
    const blocked = await author.upload('POST', '/api/files', fileForm(PNG_BYTES, 'una-mas.png', 'image/png'));
    expect(blocked.status).toBe(429);
    expect((await json(blocked)).error.message).toContain('30 subidas por hora');
  });
});

describe('validación de entradas', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('responde 400 con los campos y mensajes en castellano', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const res = await admin.post('/api/people', { email: 42, name: '', department: 'Marketing' });
    expect(res.status).toBe(400);
    const body = await json(res);
    expect(body.error).toMatchObject({ code: 'VALIDACION' });
    const paths = body.error.details.map((d: { path: string }) => d.path);
    expect(paths).toEqual(expect.arrayContaining(['email', 'name', 'department', 'office', 'role']));
    expect(JSON.stringify(body.error.details)).toMatch(/se esperaba|obligatorio/);
  });

  it('exige JSON válido con Content-Type correcto', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const wrongType = await admin.request('POST', '/api/people', { body: 'email=x', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
    expect(wrongType.status).toBe(415);
    const broken = await admin.request('POST', '/api/people', { body: '{"email":', headers: { 'content-type': 'application/json' } });
    expect(broken.status).toBe(400);
    expect((await json(broken)).error.code).toBe('JSON_NO_VALIDO');
  });

  it('devuelve 404 en JSON para rutas desconocidas de la API', async () => {
    const res = await env.app.request('/api/no-existe');
    expect(res.status).toBe(404);
    expect((await json(res)).error.code).toBe('NO_ENCONTRADO');
  });
});

describe('autorización en todas las rutas', () => {
  const PUBLIC = new Set([
    'GET /api/health',
    'GET /api/session',
    'POST /api/auth/login',
    'POST /api/auth/activation/check',
    'POST /api/auth/activate',
    'POST /api/auth/password/forgot',
    'POST /api/auth/password/reset/check',
    'POST /api/auth/password/reset',
  ]);

  it('toda ruta no pública responde 401 sin sesión', async () => {
    const env = await createTestEnv();
    const routes = [...new Set(env.app.routes.filter((r) => r.method !== 'ALL' && r.path.startsWith('/api')).map((r) => `${r.method} ${r.path}`))];
    expect(routes.length).toBeGreaterThan(50);
    const anonymous = new TestClient(env.app);
    await anonymous.init();
    const unprotected: string[] = [];
    for (const route of routes) {
      if (PUBLIC.has(route)) continue;
      const [method, path] = route.split(' ') as [string, string];
      const res = await anonymous.request(method, path.replace(/:[A-Za-z]+/g, 'x'), method === 'GET' ? {} : { json: {} });
      if (res.status !== 401) unprotected.push(`${route} → ${res.status}`);
    }
    expect(unprotected).toEqual([]);
    env.close();
  });

  it('aplica la matriz de permisos por rol', async () => {
    const env = await createTestEnv();
    const adminOnly: [string, string][] = [
      ['GET', '/api/people'],
      ['POST', '/api/people'],
      ['PATCH', `/api/people/${IDS.autora2}`],
      ['POST', `/api/people/${IDS.autora2}/remove`],
      ['GET', `/api/people/${IDS.autora2}/sessions`],
      ['GET', '/api/reports/participation'],
      ['GET', '/api/reports/participation?format=csv'],
      ['GET', `/api/reports/errors/${IDS.formation}`],
      ['GET', '/api/audit'],
      // Con «contenido:publicar» la autoría publica lo suyo, pero los festivos siguen siendo de administración.
      ['POST', '/api/holidays'],
      ['DELETE', '/api/holidays/x'],
      ['PATCH', `/api/events/${IDS.encuentro}/phase`],
      // Sustituir el PDF de un documento publicado (el de un borrador propio nunca publicado, también la autoría).
      ['POST', `/api/documents/${IDS.document}/versions`],
    ];
    const authorLevel: [string, string][] = [
      ['GET', '/api/contents'],
      ['POST', '/api/contents'],
      // La autoría publica lo suyo: la ruta de transiciones no es solo de administración.
      ['POST', `/api/contents/${IDS.formation}/transitions`],
      ['POST', '/api/files'],
      ['POST', '/api/documents'],
    ];
    const employee = await loginAs(env, EMAILS.empleado);
    const author = await loginAs(env, EMAILS.autor);
    const admin = await loginAs(env, EMAILS.admin);
    const call = (c: TestClient, [method, path]: [string, string]) => c.request(method, path, method === 'GET' ? {} : { json: {} });
    for (const route of [...adminOnly, ...authorLevel]) expect((await call(employee, route)).status, `empleado ${route.join(' ')}`).toBe(403);
    for (const route of adminOnly) expect((await call(author, route)).status, `autor ${route.join(' ')}`).toBe(403);
    for (const route of authorLevel) expect((await call(author, route)).status, `autor ${route.join(' ')}`).not.toBe(403);
    for (const route of adminOnly) expect([401, 403], `admin ${route.join(' ')}`).not.toContain((await call(admin, route)).status);
    const denied = await json(await call(employee, ['GET', '/api/audit']));
    expect(denied.error).toMatchObject({ code: 'SIN_PERMISO', message: 'Solo administración puede consultar el registro de auditoría.' });
    env.close();
  });
});

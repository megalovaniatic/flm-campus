import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hashPassword, needsRehash, verifyPassword } from '../src/auth/passwords';
import { sha256 } from '../src/auth/tokens';
import { all, get } from '../src/db/database';
import { EMAILS, IDS, NEW_PERSON_DATES } from './fixtures/seed';
import { createTestEnv, DAY, HOUR, json, loginAs, MINUTE, PASSWORD, TestClient, type TestEnv } from './helpers';

const tokenFrom = (text: string, page: 'activar' | 'restablecer-contrasena') => {
  const match = new RegExp(`https://campus\\.test/#/${page}\\?token=([A-Za-z0-9_-]{43})`).exec(text);
  expect(match, `enlace /${page} en el correo`).not.toBeNull();
  return match![1]!;
};

describe('contraseñas con scrypt', () => {
  it('usa N=2^15, r=8, p=1, sal aleatoria de 16 bytes y verifica en tiempo constante', async () => {
    const hash = await hashPassword('Contraseña segura 2026');
    const [alg, n, r, p, salt, key] = hash.split('$');
    expect([alg, n, r, p]).toEqual(['scrypt', String(2 ** 15), '8', '1']);
    expect(Buffer.from(salt!, 'base64')).toHaveLength(16);
    expect(Buffer.from(key!, 'base64')).toHaveLength(64);
    expect(await verifyPassword('Contraseña segura 2026', hash)).toBe(true);
    expect(await verifyPassword('Contraseña segura 2027', hash)).toBe(false);
    expect(await hashPassword('Contraseña segura 2026')).not.toBe(hash);
    expect(needsRehash(hash)).toBe(false);
    expect(await verifyPassword('x', 'formato-desconocido')).toBe(false);
  });
});

describe('alta y activación de cuentas', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('solo admite correos @flmexperts.com', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const res = await admin.post('/api/people', { email: 'alguien@gmail.com', name: 'Externa', position: 'Asesora', department: 'Fiscal', office: 'Barcelona', role: 'empleado', ...NEW_PERSON_DATES });
    expect(res.status).toBe(400);
    const body = await json(res);
    expect(body.error.code).toBe('VALIDACION');
    expect(JSON.stringify(body.error.details)).toContain('@flmexperts.com');
  });

  it('crea la cuenta sin contraseña y envía un enlace de un solo uso válido 7 días (guardado como hash)', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const res = await admin.post('/api/people', {
      email: 'Marta.Nueva@FLMexperts.com',
      name: 'Marta Nueva',
      position: 'Asesora laboral',
      department: 'Laboral',
      office: 'Vic',
      role: 'empleado',
      ...NEW_PERSON_DATES,
    });
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.person).toMatchObject({ email: 'marta.nueva@flmexperts.com', accountState: 'pendiente-activacion' });
    expect(body.activation.sent).toBe(true);
    expect(body.activation.url).toBeUndefined();
    expect(new Date(body.activation.expiresAt).getTime() - env.clock.now().getTime()).toBe(7 * DAY);

    const token = tokenFrom(env.mailer.last('marta.nueva@flmexperts.com')!.text, 'activar');
    const stored = get<{ token_hash: string }>(env.db, 'SELECT token_hash FROM auth_tokens WHERE user_id = ?', body.person.id)!;
    expect(stored.token_hash).toBe(sha256(token));
    expect(JSON.stringify(all(env.db, 'SELECT * FROM auth_tokens'))).not.toContain(token);
    expect(get<{ password_hash: string | null }>(env.db, 'SELECT password_hash FROM users WHERE id = ?', body.person.id)!.password_hash).toBeNull();

    const visitor = new TestClient(env.app);
    await visitor.init();
    const check = await visitor.post('/api/auth/activation/check', { token });
    expect(check.status).toBe(200);
    expect(await json(check)).toMatchObject({ valid: true, name: 'Marta Nueva' });

    const short = await visitor.post('/api/auth/activate', { token, password: 'Corta1' });
    expect(short.status).toBe(400);
    expect(JSON.stringify(await json(short))).toContain('al menos 12 caracteres');
    const noDigits = await visitor.post('/api/auth/activate', { token, password: 'SoloLetrasMuyLargas' });
    expect(JSON.stringify(await json(noDigits))).toContain('Combina letras y números');

    const ok = await visitor.post('/api/auth/activate', { token, password: 'MiContraseña2026' });
    expect(ok.status).toBe(200);
    expect(await json(ok)).toMatchObject({ authenticated: true, user: { email: 'marta.nueva@flmexperts.com', role: 'empleado' } });
    expect(visitor.sessionCookie()).toBeDefined();

    const fresh = new TestClient(env.app);
    await fresh.init();
    const again = await fresh.post('/api/auth/activate', { token, password: 'OtraContraseña2026' });
    expect(again.status).toBe(400);
    expect((await json(again)).error.code).toBe('ENLACE_USADO');

    const login = await new TestClient(env.app).login('marta.nueva@flmexperts.com', 'MiContraseña2026');
    expect(login.status).toBe(200);
  });

  it('rechaza enlaces caducados (7 días) y los sustituidos por uno nuevo', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const created = await json(await admin.post('/api/people', { email: 'tarde@flmexperts.com', name: 'Tarde', position: 'Asesor', department: 'Fiscal', office: 'Barcelona', role: 'empleado', ...NEW_PERSON_DATES }));
    const first = tokenFrom(env.mailer.last('tarde@flmexperts.com')!.text, 'activar');

    const resend = await admin.post(`/api/people/${created.person.id}/activation-link`);
    expect(resend.status).toBe(200);
    const second = tokenFrom(env.mailer.last('tarde@flmexperts.com')!.text, 'activar');
    const visitor = new TestClient(env.app);
    await visitor.init();
    expect((await json(await visitor.post('/api/auth/activate', { token: first, password: PASSWORD }))).error.code).toBe('ENLACE_NO_VALIDO');

    env.clock.advance(7 * DAY + MINUTE);
    const expired = await visitor.post('/api/auth/activate', { token: second, password: PASSWORD });
    expect(expired.status).toBe(400);
    const body = await json(expired);
    expect(body.error.code).toBe('ENLACE_CADUCADO');
    expect(body.error.message).toContain('7 días');
  });
});

describe('inicio de sesión y cookies', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('fija la cookie __Host-flm_sid (HttpOnly, Secure, SameSite=Lax, Path=/) y guarda solo el hash del token', async () => {
    const client = new TestClient(env.app);
    await client.init();
    const res = await client.post('/api/auth/login', { email: EMAILS.empleado, password: PASSWORD });
    expect(res.status).toBe(200);
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('__Host-flm_sid='))!;
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).not.toMatch(/Domain=/);
    const token = client.sessionCookie()!;
    expect(get(env.db, 'SELECT id FROM sessions WHERE token_hash = ?', sha256(token))).toBeDefined();
    expect(get(env.db, 'SELECT id FROM sessions WHERE token_hash = ?', token)).toBeUndefined();

    const session = await json(await client.get('/api/session'));
    expect(session).toMatchObject({ authenticated: true, user: { id: IDS.empleado, role: 'empleado' } });
    expect(session.csrfToken).toHaveLength(43);
    expect(session.permissions).toEqual(['campus:leer', 'progreso:propio']);
  });

  it('responde igual si el correo no existe o la contraseña es incorrecta', async () => {
    const client = new TestClient(env.app);
    await client.init();
    const wrong = await client.post('/api/auth/login', { email: EMAILS.empleado, password: 'NoEsLaClave2026' });
    const unknown = await client.post('/api/auth/login', { email: 'nadie@flmexperts.com', password: 'NoEsLaClave2026' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await json(wrong)).toEqual(await json(unknown));
  });

  it('rota la sesión al iniciar sesión de nuevo en el mismo navegador', async () => {
    const client = await loginAs(env, EMAILS.empleado);
    const before = client.sessionCookie();
    const oldId = get<{ id: string }>(env.db, 'SELECT id FROM sessions WHERE token_hash = ?', sha256(before!))!.id;
    expect((await client.post('/api/auth/login', { email: EMAILS.empleado, password: PASSWORD })).status).toBe(200);
    expect(client.sessionCookie()).not.toBe(before);
    expect(get<{ revoked_reason: string }>(env.db, 'SELECT revoked_reason FROM sessions WHERE id = ?', oldId)!.revoked_reason).toBe('rotacion');
  });

  it('no deja entrar a cuentas desactivadas ni pendientes de activación', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    await admin.post(`/api/people/${IDS.reservada}/deactivate`);
    const client = new TestClient(env.app);
    await client.init();
    const res = await client.post('/api/auth/login', { email: EMAILS.reservada, password: PASSWORD });
    expect(res.status).toBe(403);
    expect((await json(res)).error.message).toContain('desactivada');

    const pending = await admin.post('/api/people', { email: 'pendiente@flmexperts.com', name: 'Pendiente', position: 'Asesor', department: 'Fiscal', office: 'Barcelona', role: 'empleado', ...NEW_PERSON_DATES });
    expect(pending.status).toBe(201);
    expect((await client.post('/api/auth/login', { email: 'pendiente@flmexperts.com', password: PASSWORD })).status).toBe(401);
  });

  it('cierra la sesión con logout', async () => {
    const client = await loginAs(env, EMAILS.empleado);
    const res = await client.post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(client.sessionCookie()).toBeUndefined();
    const after = await client.get('/api/me');
    expect(after.status).toBe(401);
  });
});

describe('caducidad de sesiones', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('caduca tras 12 horas de inactividad con un mensaje claro', async () => {
    const client = await loginAs(env, EMAILS.empleado);
    env.clock.advance(11 * HOUR);
    expect((await client.get('/api/me')).status).toBe(200);
    env.clock.advance(11 * HOUR);
    expect((await client.get('/api/me')).status).toBe(200);
    const token = client.sessionCookie()!;
    env.clock.advance(12 * HOUR + MINUTE);
    const res = await client.get('/api/me');
    expect(res.status).toBe(401);
    const body = await json(res);
    expect(body.error.code).toBe('SESION_CADUCADA');
    expect(body.error.message).toContain('12 horas sin actividad');
    expect(res.headers.getSetCookie().some((c) => c.startsWith('__Host-flm_sid=;') && /Max-Age=0/.test(c))).toBe(true);

    const status = new TestClient(env.app);
    status.cookies.set('__Host-flm_sid', token);
    const session = await status.init();
    expect(session.authenticated).toBe(false);
    expect(session.reason?.code).toBe('SESION_CADUCADA');
  });

  it('caduca a los 14 días aunque haya actividad', async () => {
    const client = await loginAs(env, EMAILS.empleado);
    for (let i = 0; i < 30; i++) {
      env.clock.advance(11 * HOUR);
      expect((await client.get('/api/me')).status).toBe(200);
    }
    env.clock.advance(11 * HOUR);
    const res = await client.get('/api/me');
    expect(res.status).toBe(401);
    expect((await json(res)).error.message).toContain('14 días');
  });
});

describe('gestión de sesiones', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('lista y revoca sesiones propias', async () => {
    const laptop = await loginAs(env, EMAILS.empleado, '198.51.100.1');
    const phone = await loginAs(env, EMAILS.empleado, '198.51.100.2');
    const list = await json(await laptop.get('/api/sessions'));
    expect(list.items).toHaveLength(2);
    const other = list.items.find((s: { current: boolean }) => !s.current);
    expect(other.ip).toBe('198.51.100.2');
    expect(JSON.stringify(list)).not.toMatch(/token_hash|csrf/i);

    expect((await laptop.delete(`/api/sessions/${other.id}`)).status).toBe(200);
    const res = await phone.get('/api/me');
    expect(res.status).toBe(401);
    expect((await json(res)).error.message).toContain('lista de sesiones');

    const tablet = await loginAs(env, EMAILS.empleado, '198.51.100.3');
    const closed = await json(await laptop.post('/api/sessions/revoke-others'));
    expect(closed.closed).toBe(1);
    expect((await tablet.get('/api/me')).status).toBe(401);
    expect((await laptop.get('/api/me')).status).toBe(200);
  });

  it('administración cierra las sesiones de cualquiera; el resto no', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const author = await loginAs(env, EMAILS.autor);
    expect((await author.delete(`/api/people/${IDS.empleado}/sessions`)).status).toBe(403);

    const admin = await loginAs(env, EMAILS.admin);
    const listed = await json(await admin.get(`/api/people/${IDS.empleado}/sessions`));
    expect(listed.items).toHaveLength(1);
    expect((await json(await admin.delete(`/api/people/${IDS.empleado}/sessions`))).closed).toBe(1);
    const res = await employee.get('/api/me');
    expect(res.status).toBe(401);
    expect((await json(res)).error.message).toContain('Administración ha cerrado tu sesión');
  });
});

describe('recuperación y cambio de contraseña', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('responde de forma genérica, exista o no la cuenta', async () => {
    const visitor = new TestClient(env.app);
    await visitor.init();
    const known = await visitor.post('/api/auth/password/forgot', { email: EMAILS.empleado });
    const unknown = await visitor.post('/api/auth/password/forgot', { email: 'nadie@flmexperts.com' });
    expect(known.status).toBe(202);
    expect(unknown.status).toBe(202);
    expect(await json(known)).toEqual(await json(unknown));
    await new Promise((r) => setTimeout(r, 0));
    expect(env.mailer.outbox.filter((m) => m.to === EMAILS.empleado)).toHaveLength(1);
    expect(env.mailer.outbox.some((m) => m.to === 'nadie@flmexperts.com')).toBe(false);
  });

  it('el enlace caduca a los 30 minutos y es de un solo uso; restablecer cierra todas las sesiones', async () => {
    const open = await loginAs(env, EMAILS.empleado);
    const visitor = new TestClient(env.app);
    await visitor.init();
    await visitor.post('/api/auth/password/forgot', { email: EMAILS.empleado });
    await new Promise((r) => setTimeout(r, 0));
    const stale = tokenFrom(env.mailer.last(EMAILS.empleado)!.text, 'restablecer-contrasena');
    env.clock.advance(31 * MINUTE);
    const expired = await json(await visitor.post('/api/auth/password/reset', { token: stale, password: 'NuevaClave2026x' }));
    expect(expired.error.code).toBe('ENLACE_CADUCADO');
    expect(expired.error.message).toContain('30 minutos');

    await visitor.post('/api/auth/password/forgot', { email: EMAILS.empleado });
    await new Promise((r) => setTimeout(r, 0));
    const token = tokenFrom(env.mailer.last(EMAILS.empleado)!.text, 'restablecer-contrasena');
    // La web comprueba el enlace antes de pedir la contraseña: el sustituido por otro más reciente, el válido y el usado se distinguen
    expect((await json(await visitor.post('/api/auth/password/reset/check', { token: stale }))).error.code).toBe('ENLACE_NO_VALIDO');
    const check = await visitor.post('/api/auth/password/reset/check', { token });
    expect(check.status).toBe(200);
    expect(await json(check)).toMatchObject({ valid: true, email: EMAILS.empleado });
    const reset = await visitor.post('/api/auth/password/reset', { token, password: 'NuevaClave2026x' });
    expect(reset.status).toBe(200);
    expect((await json(await visitor.post('/api/auth/password/reset/check', { token }))).error.code).toBe('ENLACE_USADO');
    expect((await json(await visitor.post('/api/auth/password/reset', { token, password: 'OtraClave2026xx' }))).error.code).toBe('ENLACE_USADO');

    const res = await open.get('/api/me');
    expect(res.status).toBe(401);
    expect((await json(res)).error.message).toContain('restablecido');

    expect((await new TestClient(env.app).login(EMAILS.empleado, PASSWORD)).status).toBe(401);
    expect((await new TestClient(env.app).login(EMAILS.empleado, 'NuevaClave2026x')).status).toBe(200);
    expect(env.mailer.outbox.some((m) => m.to === EMAILS.empleado && m.subject.includes('ha cambiado'))).toBe(true);
  });

  it('el cambio de contraseña exige la actual y cierra las demás sesiones', async () => {
    const main = await loginAs(env, EMAILS.empleado, '198.51.100.1');
    const other = await loginAs(env, EMAILS.empleado, '198.51.100.2');
    const wrong = await main.post('/api/auth/password/change', { currentPassword: 'NoEsLaActual2026', newPassword: 'NuevaClave2026x' });
    expect(wrong.status).toBe(400);
    expect((await json(wrong)).error.code).toBe('CONTRASENA_ACTUAL_INCORRECTA');
    const same = await main.post('/api/auth/password/change', { currentPassword: PASSWORD, newPassword: PASSWORD });
    expect((await json(same)).error.code).toBe('CONTRASENA_REPETIDA');

    const before = main.sessionCookie();
    const ok = await main.post('/api/auth/password/change', { currentPassword: PASSWORD, newPassword: 'NuevaClave2026x' });
    expect(ok.status).toBe(200);
    const body = await json(ok);
    main.csrf = body.csrfToken;
    expect(main.sessionCookie()).not.toBe(before);
    expect((await main.get('/api/me')).status).toBe(200);
    expect((await main.delete('/api/me/photo')).status).toBe(200);
    expect((await other.get('/api/me')).status).toBe(401);
  });
});

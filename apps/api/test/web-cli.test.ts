import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { all, openDatabase } from '../src/db/database';
import { webCsp } from '../src/middleware/security-headers';
import { createTestEnv, json, type TestEnv } from './helpers';

describe('web compilada desde el mismo origen (SERVE_WEB_DIST)', () => {
  let env: TestEnv;
  let dist: string;
  beforeAll(async () => {
    dist = mkdtempSync(join(tmpdir(), 'flm-web-'));
    writeFileSync(join(dist, 'index.html'), '<!doctype html><title>FLM Campus</title><div id="raiz"></div><script type="module" src="/assets/app-abc123.js"></script>');
    mkdirSync(join(dist, 'assets'));
    writeFileSync(join(dist, 'assets', 'app-abc123.js'), 'console.log("FLM Campus");');
    env = await createTestEnv({ seed: false, config: { serveWebDist: dist } });
  });
  afterAll(() => {
    env.close();
    rmSync(dist, { recursive: true, force: true });
  });

  it('sirve index.html con la CSP de la web y fallback SPA para rutas del navegador', async () => {
    const home = await env.app.request('/');
    expect(home.status).toBe(200);
    expect(home.headers.get('content-type')).toContain('text/html');
    expect(home.headers.get('content-security-policy')).toBe(webCsp(false));
    expect(home.headers.get('x-frame-options')).toBe('DENY');
    expect(home.headers.get('cache-control')).toBe('no-cache');
    const deep = await env.app.request('/formacion/recargos-extemporaneos');
    expect(deep.status).toBe(200);
    expect(await deep.text()).toContain('<div id="raiz">');
  });

  it('sirve los recursos con caché larga, 404 si faltan y nunca tapa la API', async () => {
    const asset = await env.app.request('/assets/app-abc123.js');
    expect(asset.status).toBe(200);
    expect(asset.headers.get('content-type')).toContain('javascript');
    expect(asset.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect((await env.app.request('/assets/no-existe.js')).status).toBe(404);
    const api = await env.app.request('/api/no-existe');
    expect(api.status).toBe(404);
    expect((await json(api)).error.code).toBe('NO_ENCONTRADO');
  });
});

describe('herramientas de línea de órdenes (compiladas con esbuild)', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  let work: string;
  let dist: string;
  let env: NodeJS.ProcessEnv;
  const runCli = (script: string, args: string[] = []) =>
    spawnSync(process.execPath, ['--disable-warning=ExperimentalWarning', join(dist, script), ...args], { cwd: work, env, encoding: 'utf8', timeout: 60_000 });

  beforeAll(() => {
    work = mkdtempSync(join(tmpdir(), 'flm-cli-'));
    dist = join(work, 'dist');
    const build = spawnSync(process.execPath, [join(root, 'scripts', 'build.mjs'), '--outdir', dist], { cwd: root, encoding: 'utf8', timeout: 120_000 });
    expect(build.status, build.stderr).toBe(0);
    env = {
      ...process.env,
      NODE_ENV: 'development',
      APP_ORIGIN: 'https://campus.test',
      DATABASE_PATH: join(work, 'datos', 'campus.sqlite'),
      STORAGE_DIR: join(work, 'archivos'),
      BACKUP_DIR: join(work, 'copias'),
      SMTP_HOST: '',
    };
  }, 180_000);
  afterAll(() => rmSync(work, { recursive: true, force: true }));

  it('compila server.mjs, los CLI y copia las migraciones', () => {
    const migrations = ['0001_esquema_inicial.sql', '0002_sin_cumpleanos_ni_incorporacion.sql', '0003_formaciones_voluntarias.sql', '0006_cumpleanos_e_incorporacion.sql'].map((m) => `migrations/${m}`);
    for (const file of ['server.mjs', 'create-admin.mjs', 'backup.mjs', 'seed.mjs', ...migrations]) {
      expect(existsSync(join(dist, file)), file).toBe(true);
    }
  });

  it('create-admin crea la primera cuenta sin contraseña, con cumpleaños e incorporación, y muestra un enlace de activación', () => {
    const usage = runCli('create-admin.mjs');
    expect(usage.status).toBe(1);
    expect(usage.stdout).toContain('Uso: npm run create-admin');
    expect(usage.stdout).toContain('--cumpleanos');
    expect(usage.stdout).toContain('--incorporacion');

    const dates = ['--cumpleanos', '26/11', '--incorporacion', '01/09/2026'];
    const external = runCli('create-admin.mjs', ['--email', 'admin@gmail.com', '--nombre', 'Externa', ...dates]);
    expect(external.status).toBe(1);
    expect(external.stderr).toContain('@flmexperts.com');

    // Los dos datos son obligatorios, como en el alta desde la administración; el año de nacimiento no se pide.
    const withoutDates = runCli('create-admin.mjs', ['--email', 'direccion@flmexperts.com', '--nombre', 'Dirección FLM']);
    expect(withoutDates.status).toBe(1);
    expect(withoutDates.stderr).toContain('--cumpleanos: Indica el día y el mes del cumpleaños');
    expect(withoutDates.stderr).toContain('--incorporacion: Indica la fecha completa de incorporación');
    const wrongDay = runCli('create-admin.mjs', ['--email', 'direccion@flmexperts.com', '--nombre', 'Dirección FLM', '--cumpleanos', '31/11', '--incorporacion', '2026-09-01']);
    expect(wrongDay.status).toBe(1);
    expect(wrongDay.stderr).toContain('--cumpleanos');

    const ok = runCli('create-admin.mjs', ['--email', 'Direccion@flmexperts.com', '--nombre', 'Dirección FLM', ...dates]);
    expect(ok.status, ok.stderr).toBe(0);
    expect(ok.stdout).toMatch(/https:\/\/campus\.test\/#\/activar\?token=[A-Za-z0-9_-]{43}/);
    expect(ok.stdout).toContain('cumpleaños el 26 de noviembre; incorporación el 1 de septiembre de 2026');
    const db = openDatabase(env.DATABASE_PATH!);
    const users = all<{ email: string; role: string; password_hash: string | null; birthday: string; start_date: string }>(db, 'SELECT email, role, password_hash, birthday, start_date FROM users');
    // Las migraciones compiladas se aplican: vuelven las columnas de la 0006, sin el consentimiento de la versión 1.
    const columns = all<{ name: string }>(db, "SELECT name FROM pragma_table_info('users')").map((c) => c.name);
    db.close();
    expect(users).toEqual([{ email: 'direccion@flmexperts.com', role: 'admin', password_hash: null, birthday: '11-26', start_date: '2026-09-01' }]);
    expect(columns).not.toContain('show_birthday');

    const again = runCli('create-admin.mjs', ['--email', 'direccion@flmexperts.com', '--nombre', 'Dirección FLM', '--cumpleanos', '26/11', '--incorporacion', '2026-09-01']);
    expect(again.status).toBe(0);
    expect(again.stdout).toContain('Nuevo enlace de activación');
  });

  it('backup genera una copia fechada de la base de datos', () => {
    const res = runCli('backup.mjs', ['--conservar', '3']);
    expect(res.status, res.stderr).toBe(0);
    expect(res.stdout).toContain('integridad: ok');
    expect(readdirSync(join(work, 'copias')).filter((f) => /^campus-\d{8}-\d{6}\.sqlite$/.test(f))).toHaveLength(1);
  });
});

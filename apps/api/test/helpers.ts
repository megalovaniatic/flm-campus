import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Hono } from 'hono';
import { expect } from 'vitest';
import { createApp } from '../src/app';
import { hashPassword } from '../src/auth/passwords';
import type { AppConfig } from '../src/config';
import type { AppContext, AppEnv } from '../src/context';
import { openDatabase, run, type Db } from '../src/db/database';
import { migrate } from '../src/db/migrate';
import { createLogger } from '../src/lib/logger';
import { MemoryMailer } from '../src/services/mailer';
import { importSeed } from '../src/services/seed';
import { fixtureSeed } from './fixtures/seed';

export const ORIGIN = 'https://campus.test';
/** Contraseña de prueba (≥ 12 caracteres, letras y números). */
export const PASSWORD = 'ClaveDePrueba2026';
/** 28/10/2026 10:00 UTC (11:00 en Madrid). */
export const START = new Date('2026-10-28T10:00:00.000Z');

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export class TestClock {
  private t: number;
  constructor(start: Date = START) {
    this.t = start.getTime();
  }
  now = (): Date => new Date(this.t);
  advance(ms: number): void {
    this.t += ms;
  }
}

export interface TestEnv {
  app: Hono<AppEnv>;
  ctx: AppContext;
  db: Db;
  mailer: MemoryMailer;
  clock: TestClock;
  storageDir: string;
  close(): void;
}

let sharedHash: Promise<string> | undefined;
/** Hash de PASSWORD calculado una sola vez (scrypt es costoso a propósito). */
export const passwordHash = () => (sharedHash ??= hashPassword(PASSWORD));

export interface TestEnvOptions {
  seed?: boolean;
  /** Fija PASSWORD en todas las cuentas importadas (como si ya estuvieran activadas). */
  activate?: boolean;
  config?: Partial<AppConfig>;
}

/** App completa con SQLite en memoria, almacenamiento temporal, correo en memoria y reloj controlado. */
export async function createTestEnv(opts: TestEnvOptions = {}): Promise<TestEnv> {
  const storageDir = mkdtempSync(join(tmpdir(), 'flm-api-'));
  const config: AppConfig = {
    env: 'test',
    port: 0,
    host: '127.0.0.1',
    appOrigin: ORIGIN,
    databasePath: ':memory:',
    storageDir,
    backupDir: join(storageDir, 'copias'),
    trustProxy: 1,
    serveWebDist: null,
    secureCookies: true,
    smtp: null,
    ...opts.config,
  };
  const db = openDatabase(':memory:');
  migrate(db);
  const mailer = new MemoryMailer();
  const clock = new TestClock();
  const { app, ctx } = createApp({ config, db, mailer, logger: createLogger('test'), now: clock.now });
  if (opts.seed !== false) {
    await importSeed(db, fixtureSeed, { now: clock.now() });
    if (opts.activate !== false) {
      run(db, 'UPDATE users SET password_hash = ?, activated_at = ? WHERE password_hash IS NULL', await passwordHash(), clock.now().toISOString());
    }
  }
  return {
    app,
    ctx,
    db,
    mailer,
    clock,
    storageDir,
    close() {
      db.close();
      rmSync(storageDir, { recursive: true, force: true });
    },
  };
}

interface RequestOptions {
  json?: unknown;
  body?: BodyInit;
  headers?: Record<string, string>;
  /** Token CSRF: por defecto el de la sesión; `false` para no enviarlo. */
  csrf?: string | false;
  /** Origen: por defecto el de la app; `null` para no enviarlo. */
  origin?: string | null;
}

/** Cliente de pruebas con «tarro» de cookies, token CSRF y cabeceras de origen e IP. */
export class TestClient {
  readonly cookies = new Map<string, string>();
  csrf: string | null = null;
  ip = '203.0.113.10';

  constructor(private readonly app: Hono<AppEnv>) {}

  async request(method: string, path: string, opts: RequestOptions = {}): Promise<Response> {
    const headers = new Headers(opts.headers);
    if (this.cookies.size) headers.set('cookie', [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '));
    if (!headers.has('x-forwarded-for')) headers.set('x-forwarded-for', this.ip);
    if (method !== 'GET' && method !== 'HEAD') {
      if (opts.origin !== null && !headers.has('origin')) headers.set('origin', opts.origin ?? ORIGIN);
      const token = opts.csrf === false ? null : (opts.csrf ?? this.csrf);
      if (token) headers.set('x-csrf-token', token);
    }
    let body = opts.body;
    if (opts.json !== undefined) {
      headers.set('content-type', 'application/json');
      body = JSON.stringify(opts.json);
    }
    const res = await this.app.request(path, { method, headers, body });
    for (const line of res.headers.getSetCookie()) {
      const pair = line.split(';')[0] ?? '';
      const eq = pair.indexOf('=');
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (/max-age=0\b/i.test(line) || value === '') this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
    return res;
  }

  get(path: string, opts?: RequestOptions) {
    return this.request('GET', path, opts);
  }
  post(path: string, json: unknown = {}, opts: RequestOptions = {}) {
    return this.request('POST', path, { ...opts, json });
  }
  put(path: string, json: unknown, opts: RequestOptions = {}) {
    return this.request('PUT', path, { ...opts, json });
  }
  patch(path: string, json: unknown, opts: RequestOptions = {}) {
    return this.request('PATCH', path, { ...opts, json });
  }
  delete(path: string, opts: RequestOptions = {}) {
    return this.request('DELETE', path, opts);
  }
  upload(method: 'POST' | 'PUT', path: string, form: FormData) {
    return this.request(method, path, { body: form });
  }

  /** Carga GET /api/session y guarda el token CSRF (de sesión o previo). */
  async init(): Promise<{ authenticated: boolean; csrfToken: string; reason?: { code: string; message: string } }> {
    const res = await this.get('/api/session');
    const body = (await res.json()) as { authenticated: boolean; csrfToken: string };
    this.csrf = body.csrfToken;
    return body;
  }

  async login(email: string, password: string = PASSWORD): Promise<Response> {
    await this.init();
    const res = await this.post('/api/auth/login', { email, password });
    if (res.ok) this.csrf = ((await res.clone().json()) as { csrfToken: string }).csrfToken;
    return res;
  }

  /** Identificador de la cookie de sesión actual (valor), si existe. */
  sessionCookie(): string | undefined {
    return this.cookies.get('__Host-flm_sid') ?? this.cookies.get('flm_sid');
  }
}

export async function loginAs(env: TestEnv, email: string, ip?: string): Promise<TestClient> {
  const client = new TestClient(env.app);
  if (ip) client.ip = ip;
  const res = await client.login(email);
  expect(res.status, `inicio de sesión de ${email}`).toBe(200);
  return client;
}

export async function json<T = any>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

/** Contenido de PDF mínimo válido (cabecera mágica %PDF-). */
export function pdfBytes(size = 2048): Uint8Array {
  const bytes = new Uint8Array(size).fill(0x20);
  bytes.set(new TextEncoder().encode('%PDF-1.7\n'), 0);
  return bytes;
}

export const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
export const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46]);
export const WEBP_BYTES = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20]);
export const GIF_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 1, 0, 1, 0]);

export function fileForm(bytes: Uint8Array, name: string, type: string, fields: Record<string, string> = {}): FormData {
  const form = new FormData();
  form.append('archivo', new File([bytes as Uint8Array<ArrayBuffer>], name, { type }));
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return form;
}

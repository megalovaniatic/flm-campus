import { existsSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { z } from 'zod';

/**
 * Configuración de la API a partir de variables de entorno.
 * No hay secretos en el código: todo lo sensible llega por el entorno (ver `.env.example`).
 */
export type NodeEnv = 'development' | 'production' | 'test';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

export interface AppConfig {
  env: NodeEnv;
  port: number;
  host: string;
  /** Origen público de la web (esquema + dominio + puerto), p. ej. https://campus.flmexperts.com */
  appOrigin: string;
  /** Ruta del archivo SQLite o «:memory:». */
  databasePath: string;
  /** Carpeta privada de archivos subidos (nunca se sirve directamente). */
  storageDir: string;
  /** Carpeta de destino de las copias de seguridad. */
  backupDir: string;
  /** Número de proxies de confianza delante de la API (0 = ninguno). */
  trustProxy: number;
  /** Carpeta de la web compilada que se sirve desde el mismo origen, o null. */
  serveWebDist: string | null;
  /** Cookies con atributo Secure y prefijo __Host- (siempre en producción). */
  secureCookies: boolean;
  smtp: SmtpConfig | null;
}

/** Interpreta un valor booleano; devuelve undefined si no es un booleano reconocible. */
const flag = (value: string | undefined): boolean | undefined => {
  const v = value?.trim().toLowerCase();
  if (!v) return undefined;
  if (['1', 'true', 'si', 'sí', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  return undefined;
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().trim().optional(),
  APP_ORIGIN: z.string().trim().optional(),
  DATABASE_PATH: z.string().trim().optional(),
  STORAGE_DIR: z.string().trim().optional(),
  BACKUP_DIR: z.string().trim().optional(),
  TRUST_PROXY: z.string().trim().optional(),
  SERVE_WEB_DIST: z.string().trim().optional(),
  SMTP_HOST: z.string().trim().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  SMTP_SECURE: z.string().trim().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().trim().optional(),
});

export class ConfigError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Configuración no válida:\n - ${problems.join('\n - ')}`);
    this.name = 'ConfigError';
  }
}

function parseOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function parseTrustProxy(value: string | undefined): number | null {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const b = flag(value);
  if (b === undefined) return null;
  return b ? 1 : 0;
}

/**
 * Lee y valida la configuración. `cwd` permite resolver rutas relativas
 * (por defecto, la carpeta desde la que se lanza el proceso: `apps/api` con `npm -w`).
 */
export function loadConfig(env: Record<string, string | undefined> = process.env, cwd: string = process.cwd()): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    throw new ConfigError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
  }
  const e = parsed.data;
  const problems: string[] = [];
  const isProd = e.NODE_ENV === 'production';
  const abs = (p: string) => (p === ':memory:' || isAbsolute(p) ? p : resolve(cwd, p));

  let appOrigin = 'http://localhost:5173';
  if (e.APP_ORIGIN) {
    const origin = parseOrigin(e.APP_ORIGIN);
    if (!origin) problems.push('APP_ORIGIN debe ser un origen válido, sin ruta (p. ej. https://campus.flmexperts.com).');
    else appOrigin = origin;
  } else if (isProd) {
    problems.push('APP_ORIGIN es obligatorio en producción.');
  }
  if (isProd && !appOrigin.startsWith('https://')) problems.push('En producción APP_ORIGIN debe usar https://.');

  if (isProd && !e.DATABASE_PATH) problems.push('DATABASE_PATH es obligatorio en producción.');
  if (isProd && e.DATABASE_PATH === ':memory:') problems.push('DATABASE_PATH no puede ser «:memory:» en producción.');
  if (isProd && !e.STORAGE_DIR) problems.push('STORAGE_DIR es obligatorio en producción.');

  const trustProxy = parseTrustProxy(e.TRUST_PROXY);
  if (trustProxy === null) problems.push('TRUST_PROXY debe ser «false», «true» o un número de proxies.');

  let serveWebDist: string | null = null;
  const web = e.SERVE_WEB_DIST;
  if (web && flag(web) !== false) {
    serveWebDist = flag(web) === true ? resolve(cwd, '../web/dist') : abs(web);
    if (!existsSync(serveWebDist)) problems.push(`SERVE_WEB_DIST apunta a una carpeta inexistente: ${serveWebDist}`);
  }

  let smtp: SmtpConfig | null = null;
  if (e.SMTP_HOST) {
    const port = e.SMTP_PORT ?? 587;
    smtp = {
      host: e.SMTP_HOST,
      port,
      secure: flag(e.SMTP_SECURE) ?? port === 465,
      user: e.SMTP_USER || undefined,
      pass: e.SMTP_PASS || undefined,
      from: e.SMTP_FROM || 'FLM Campus <campus@flmexperts.com>',
    };
    if (smtp.user && !smtp.pass) problems.push('SMTP_PASS es obligatorio si se indica SMTP_USER.');
  }

  if (problems.length) throw new ConfigError(problems);

  return {
    env: e.NODE_ENV,
    port: e.PORT,
    host: e.HOST || (isProd ? '0.0.0.0' : '127.0.0.1'),
    appOrigin,
    databasePath: abs(e.DATABASE_PATH || './data/campus.sqlite'),
    storageDir: abs(e.STORAGE_DIR || './storage'),
    backupDir: abs(e.BACKUP_DIR || './backups'),
    trustProxy: trustProxy ?? 0,
    serveWebDist,
    secureCookies: isProd || appOrigin.startsWith('https://'),
    smtp,
  };
}

/** Carga `.env` de la carpeta actual si existe (Node ≥ 21.7). En producción se usan variables reales. */
export function loadDotEnv(cwd: string = process.cwd()): void {
  const file = resolve(cwd, '.env');
  if (existsSync(file)) process.loadEnvFile(file);
}

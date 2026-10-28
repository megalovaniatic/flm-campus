import type { NodeEnv } from '../config';

/**
 * Registro mínimo: líneas JSON en producción (fáciles de recoger por Docker, Render o Fly.io),
 * texto legible en desarrollo y silencio en las pruebas. Nunca se registran contraseñas ni tokens.
 */
export interface Logger {
  info(message: string, extra?: Record<string, unknown>): void;
  warn(message: string, extra?: Record<string, unknown>): void;
  error(message: string, extra?: Record<string, unknown>): void;
}

type Level = 'info' | 'warn' | 'error';

export function createLogger(env: NodeEnv): Logger {
  if (env === 'test') return { info() {}, warn() {}, error() {} };
  const write = (level: Level, message: string, extra?: Record<string, unknown>) => {
    const stream = level === 'info' ? process.stdout : process.stderr;
    if (env === 'production') {
      stream.write(`${JSON.stringify({ time: new Date().toISOString(), level, message, ...extra })}\n`);
    } else {
      const suffix = extra && Object.keys(extra).length ? ` ${JSON.stringify(extra)}` : '';
      stream.write(`[${level}] ${message}${suffix}\n`);
    }
  };
  return {
    info: (m, e) => write('info', m, e),
    warn: (m, e) => write('warn', m, e),
    error: (m, e) => write('error', m, e),
  };
}

/** Serializa un error sin perder la pila (solo para el registro del servidor, nunca para la respuesta). */
export function errorDetail(err: unknown): Record<string, unknown> {
  if (err instanceof Error) return { error: err.message, stack: err.stack };
  return { error: String(err) };
}

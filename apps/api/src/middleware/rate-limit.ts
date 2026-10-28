import type { MiddlewareHandler } from 'hono';
import { tooManyRequests, waitText } from '../lib/errors';
import type { AppEnv } from '../context';

/**
 * Límite de frecuencia en memoria con ventana deslizante (registro de marcas de tiempo por clave).
 * Suficiente para una sola instancia de la API; con varias instancias habría que llevarlo a un
 * almacén compartido (ver README).
 */
export interface RateRule {
  limit: number;
  windowMs: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const RATE_RULES = {
  /** Inicio de sesión: 5 intentos cada 15 minutos por IP + correo. */
  loginIpEmail: { limit: 5, windowMs: 15 * MINUTE },
  /** Inicio de sesión: 20 intentos por hora por IP. */
  loginIp: { limit: 20, windowMs: HOUR },
  /** Recuperación de contraseña: 3 solicitudes por hora por correo. */
  recoveryEmail: { limit: 3, windowMs: HOUR },
  /** Recuperación de contraseña: 10 solicitudes por hora por IP. */
  recoveryIp: { limit: 10, windowMs: HOUR },
  /** Cambio de contraseña: 5 intentos cada 15 minutos por persona. */
  passwordChange: { limit: 5, windowMs: 15 * MINUTE },
  /** Subidas de archivos: 30 por hora por persona. */
  uploads: { limit: 30, windowMs: HOUR },
  /** General: 300 peticiones por minuto por IP. */
  general: { limit: 300, windowMs: MINUTE },
} satisfies Record<string, RateRule>;

export interface RateResult {
  allowed: boolean;
  retryAfterSec: number;
}

export class RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private lastSweep = 0;

  constructor(private readonly now: () => number = Date.now) {}

  private recent(key: string, windowMs: number, t: number): number[] {
    const list = (this.hits.get(key) ?? []).filter((at) => at > t - windowMs);
    if (list.length) this.hits.set(key, list);
    else this.hits.delete(key);
    return list;
  }

  /** Comprueba sin anotar. */
  check(key: string, rule: RateRule): RateResult {
    const t = this.now();
    const list = this.recent(key, rule.windowMs, t);
    if (list.length < rule.limit) return { allowed: true, retryAfterSec: 0 };
    const oldest = list[list.length - rule.limit] ?? t;
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((oldest + rule.windowMs - t) / 1000)) };
  }

  /** Comprueba y, si se permite, anota un intento. */
  consume(key: string, rule: RateRule): RateResult {
    const t = this.now();
    this.sweep(t);
    const result = this.check(key, rule);
    if (result.allowed) this.hits.set(key, [...(this.hits.get(key) ?? []), t]);
    return result;
  }

  reset(key: string): void {
    this.hits.delete(key);
  }

  /** Limpieza periódica de claves sin actividad reciente (máximo 1 hora de ventana). */
  private sweep(t: number): void {
    if (t - this.lastSweep < 5 * MINUTE) return;
    this.lastSweep = t;
    for (const [key, list] of this.hits) {
      if (!list.some((at) => at > t - HOUR)) this.hits.delete(key);
    }
  }
}

/** Lanza 429 con Retry-After si se supera la regla. */
export function enforce(limiter: RateLimiter, key: string, rule: RateRule, message: (wait: string) => string): void {
  const result = limiter.consume(key, rule);
  if (!result.allowed) throw tooManyRequests(message(waitText(result.retryAfterSec)), result.retryAfterSec);
}

/** Límite general por IP para toda la API. */
export function generalRateLimit(limiter: RateLimiter): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    enforce(limiter, `general:${c.get('clientIp')}`, RATE_RULES.general, (wait) => `Demasiadas peticiones desde tu conexión. Espera ${wait} y vuelve a intentarlo.`);
    await next();
  };
}

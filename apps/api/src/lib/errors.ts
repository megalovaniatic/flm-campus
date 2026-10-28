import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Error HTTP con código estable (para el cliente) y mensaje legible en castellano (para las personas).
 * El manejador global lo convierte en `{ error: { code, message, details? } }`.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (message: string, details?: unknown, code = 'PETICION_NO_VALIDA') => new HttpError(400, code, message, details);

export const forbidden = (message = 'No tienes permiso para realizar esta acción.', code = 'SIN_PERMISO') => new HttpError(403, code, message);

export const notFound = (message = 'No se ha encontrado el recurso solicitado.') => new HttpError(404, 'NO_ENCONTRADO', message);

export const conflict = (message: string, code = 'CONFLICTO') => new HttpError(409, code, message);

export const revisionConflict = () =>
  new HttpError(
    409,
    'CONFLICTO_REVISION',
    'Otra persona ha guardado cambios en este contenido mientras lo editabas. Recarga para ver la versión actual antes de volver a guardar.',
  );

/** Formatea una espera en segundos como texto («3 minutos», «45 segundos», «1 hora»). */
export function waitText(seconds: number): string {
  if (seconds < 60) return seconds === 1 ? '1 segundo' : `${seconds} segundos`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? '1 hora' : `${hours} horas`;
}

export const tooManyRequests = (message: string, retryAfterSec: number) =>
  new HttpError(429, 'DEMASIADAS_PETICIONES', message, undefined, { 'Retry-After': String(retryAfterSec) });

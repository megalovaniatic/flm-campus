import type { ErrorHandler, MiddlewareHandler, NotFoundHandler } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { HTTPException } from 'hono/http-exception';
import type { AppContext, AppEnv } from '../context';
import { HttpError } from '../lib/errors';
import { errorDetail } from '../lib/logger';

/** Convierte cualquier error en `{ error: { code, message, details? } }` sin filtrar detalles internos. */
export function errorHandler(ctx: AppContext): ErrorHandler<AppEnv> {
  return (err, c) => {
    if (err instanceof HttpError) {
      for (const [name, value] of Object.entries(err.headers ?? {})) c.header(name, value);
      const body = { code: err.code, message: err.message, ...(err.details !== undefined ? { details: err.details } : {}) };
      return c.json({ error: body }, err.status);
    }
    if (err instanceof HTTPException) {
      const tooLarge = err.status === 413;
      return c.json(
        { error: { code: tooLarge ? 'DEMASIADO_GRANDE' : 'PETICION_NO_VALIDA', message: tooLarge ? 'La petición es demasiado grande.' : 'La petición no es válida.' } },
        err.status,
      );
    }
    ctx.logger.error('Error no controlado', { requestId: c.get('requestId'), method: c.req.method, path: c.req.path, ...errorDetail(err) });
    return c.json({ error: { code: 'ERROR_INTERNO', message: 'Se ha producido un error inesperado. Inténtalo de nuevo más tarde.' } }, 500);
  };
}

export const apiNotFound: NotFoundHandler<AppEnv> = (c) =>
  c.json({ error: { code: 'NO_ENCONTRADO', message: 'No existe ese recurso de la API.' } }, 404);

export const JSON_MAX_BYTES = 2 * 1024 * 1024;
/** 15 MB del PDF más margen para la codificación multipart. */
export const UPLOAD_MAX_BYTES = 15 * 1024 * 1024 + 512 * 1024;
/** Rutas que reciben archivos (multipart/form-data). */
export const UPLOAD_ROUTE = /^\/api\/(files|documents|documents\/[^/]+\/versions|people\/[^/]+\/photo|me\/photo)$/;

/** Tamaño máximo del cuerpo: 2 MB para JSON y algo más de 15 MB en las rutas de subida. */
export function bodySizeLimit(): MiddlewareHandler<AppEnv> {
  const jsonLimit = bodyLimit({
    maxSize: JSON_MAX_BYTES,
    onError: () => {
      throw new HttpError(413, 'DEMASIADO_GRANDE', 'Los datos enviados superan el tamaño máximo de 2 MB.');
    },
  });
  const uploadLimit = bodyLimit({
    maxSize: UPLOAD_MAX_BYTES,
    onError: () => {
      throw new HttpError(413, 'ARCHIVO_DEMASIADO_GRANDE', 'El archivo supera el tamaño máximo permitido (15 MB para PDF y 5 MB para imágenes).');
    },
  });
  return async (c, next) => {
    if (c.req.method === 'GET' || c.req.method === 'HEAD') return next();
    return UPLOAD_ROUTE.test(c.req.path) ? uploadLimit(c, next) : jsonLimit(c, next);
  };
}

import type { Context } from 'hono';
import { z } from 'zod';
import { HttpError } from './errors';

/* Mensajes de validación de zod en castellano para todos los esquemas (incluidos los de @flm/shared). */
z.config(z.locales.es());

export interface FieldIssue {
  /** Ruta del campo con puntos («quiz.questions.0.prompt»); «(cuerpo)» si afecta a todo el objeto. */
  path: string;
  message: string;
}

export function formatIssues(error: z.ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.map(String).join('.') : '(cuerpo)',
    message: issue.message,
  }));
}

/** Valida datos con un esquema zod; si no son válidos, responde 400 con los campos afectados. */
export function parseWith<T extends z.ZodType>(schema: T, data: unknown, message = 'Hay datos no válidos en la petición. Revisa los campos indicados.'): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new HttpError(400, 'VALIDACION', message, formatIssues(result.error));
  return result.data;
}

/** Lee el cuerpo JSON exigiendo `Content-Type: application/json`. */
export async function readJson(c: Context): Promise<unknown> {
  const type = c.req.header('content-type') ?? '';
  if (!/^application\/json\b/i.test(type)) {
    throw new HttpError(415, 'TIPO_NO_ADMITIDO', 'Envía los datos en formato JSON (cabecera Content-Type: application/json).');
  }
  try {
    return await c.req.json();
  } catch {
    throw new HttpError(400, 'JSON_NO_VALIDO', 'El cuerpo de la petición no es un JSON válido.');
  }
}

export async function jsonBody<T extends z.ZodType>(c: Context, schema: T): Promise<z.output<T>> {
  return parseWith(schema, await readJson(c));
}

export function queryParams<T extends z.ZodType>(c: Context, schema: T): z.output<T> {
  return parseWith(schema, c.req.query(), 'Hay parámetros no válidos en la dirección de la petición.');
}

/* Piezas reutilizables */
export const idParam = z.string().trim().min(1).max(200);
export const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha con formato AAAA-MM-DD');
export const revisionField = z.number({ error: 'Indica el número de revisión que estabas editando (campo «revision»).' }).int().positive();

/** Día y mes válidos («MM-DD»), admitiendo el 29 de febrero. */
export const birthdaySchema = z
  .string()
  .regex(/^\d{2}-\d{2}$/, 'Cumpleaños con formato MM-DD')
  .refine((v) => {
    const [m, d] = v.split('-').map(Number) as [number, number];
    const max = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
    return !!max && d >= 1 && d <= max;
  }, 'El cumpleaños no es una fecha válida');

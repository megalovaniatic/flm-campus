import { can, type Permission } from '@flm/shared';
import type { Context, MiddlewareHandler } from 'hono';
import type { AppEnv, AuthUser } from '../context';
import { HttpError } from '../lib/errors';

/**
 * Autorización en el servidor con la matriz de `@flm/shared/permissions` (la misma que usa la web).
 * Cada ruta declara el permiso que exige; las comprobaciones de propiedad se hacen en los servicios.
 */
const PERMISSION_MESSAGES: Partial<Record<Permission, string>> = {
  'contenido:crear': 'Tu rol no permite crear contenidos.',
  'contenido:editar-cualquiera': 'Solo administración puede hacerlo: afecta a contenidos de toda la firma (de otras personas, la agenda o los festivos).',
  'contenido:publicar': 'Tu rol no permite publicar contenidos.',
  'contenido:archivar': 'Solo administración puede archivar contenidos.',
  'contenido:restaurar': 'Solo administración puede restaurar contenidos archivados.',
  'documentos:subir': 'Tu rol no permite subir archivos.',
  'documentos:reemplazar': 'Solo administración puede sustituir el archivo de un documento publicado.',
  'personas:gestionar': 'Solo administración puede gestionar las cuentas de las personas.',
  'sesiones:revocar': 'Solo administración puede cerrar las sesiones de otras personas.',
  'informes:ver': 'Solo administración puede consultar los informes.',
  'auditoria:ver': 'Solo administración puede consultar el registro de auditoría.',
  'datos-personales:eliminar': 'Solo administración puede eliminar el perfil de una persona.',
};

export function unauthenticated(c: Context<AppEnv>): HttpError {
  const problem = c.get('sessionProblem');
  if (problem) return new HttpError(401, problem.code, problem.message);
  return new HttpError(401, 'NO_AUTENTICADO', 'Inicia sesión para continuar.');
}

export function permissionError(permission: Permission): HttpError {
  return new HttpError(403, 'SIN_PERMISO', PERMISSION_MESSAGES[permission] ?? 'No tienes permiso para realizar esta acción.', { permission });
}

/** Exige sesión válida y todos los permisos indicados. */
export function requirePermission(...permissions: Permission[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user');
    if (!user) throw unauthenticated(c);
    for (const p of permissions) if (!can(user.role, p)) throw permissionError(p);
    await next();
  };
}

/** Persona autenticada (las rutas ya han pasado por `requirePermission`). */
export function currentUser(c: Context<AppEnv>): AuthUser {
  const user = c.get('user');
  if (!user) throw unauthenticated(c);
  return user;
}

export function assertCan(user: AuthUser, permission: Permission): void {
  if (!can(user.role, permission)) throw permissionError(permission);
}

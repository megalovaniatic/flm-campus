import type { ContentType, EditorialStatus, Role } from './types';

/**
 * Matriz de permisos. Se aplica en el servidor en producción
 * y se refleja en la interfaz para ocultar lo que no se puede hacer.
 */
export type Permission =
  | 'campus:leer'
  | 'progreso:propio'
  | 'contenido:crear'
  | 'contenido:editar-propio'
  | 'contenido:editar-cualquiera'
  | 'contenido:enviar-revision'
  | 'contenido:publicar'
  | 'contenido:devolver'
  | 'contenido:archivar'
  | 'contenido:restaurar'
  | 'documentos:subir'
  | 'documentos:reemplazar'
  | 'personas:gestionar'
  | 'sesiones:revocar'
  | 'informes:ver'
  | 'auditoria:ver'
  | 'datos-personales:eliminar'
  | 'formaciones:asignar';

const EMPLEADO: Permission[] = ['campus:leer', 'progreso:propio'];

const AUTOR: Permission[] = [
  ...EMPLEADO,
  'contenido:crear',
  'contenido:editar-propio',
  'contenido:enviar-revision',
  'documentos:subir',
];

const ADMIN: Permission[] = [
  ...AUTOR,
  'contenido:editar-cualquiera',
  'contenido:publicar',
  'contenido:devolver',
  'contenido:archivar',
  'contenido:restaurar',
  'documentos:reemplazar',
  'personas:gestionar',
  'sesiones:revocar',
  'informes:ver',
  'auditoria:ver',
  'datos-personales:eliminar',
  'formaciones:asignar',
];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  empleado: new Set(EMPLEADO),
  autor: new Set(AUTOR),
  admin: new Set(ADMIN),
};

export const ROLE_LABEL: Record<Role, string> = {
  empleado: 'Empleado',
  autor: 'Autor',
  admin: 'Administrador',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  empleado: 'Consulta el campus, realiza formaciones y tests, y gestiona su perfil.',
  autor: 'Además, prepara contenidos permitidos y los envía a revisión.',
  admin: 'Además, aprueba publicaciones, gestiona contenidos, accesos e informes.',
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/** Tipos de contenido que cada rol puede preparar. */
export const CREATABLE_TYPES: Record<Role, ContentType[]> = {
  empleado: [],
  autor: ['formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado'],
  admin: ['formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado'],
};

export const STATUS_LABEL_EDITORIAL: Record<EditorialStatus, string> = {
  borrador: 'Borrador',
  'en-revision': 'En revisión',
  publicado: 'Publicado',
  archivado: 'Archivado',
};

export type EditorialAction = 'guardar' | 'enviar' | 'publicar' | 'devolver' | 'archivar' | 'restaurar';

/** Transiciones válidas del flujo editorial y permiso necesario para cada una. */
const TRANSITIONS: Record<EditorialAction, { from: EditorialStatus[]; to: EditorialStatus; permission: Permission }> = {
  guardar: { from: ['borrador'], to: 'borrador', permission: 'contenido:crear' },
  enviar: { from: ['borrador'], to: 'en-revision', permission: 'contenido:enviar-revision' },
  publicar: { from: ['borrador', 'en-revision'], to: 'publicado', permission: 'contenido:publicar' },
  devolver: { from: ['en-revision'], to: 'borrador', permission: 'contenido:devolver' },
  archivar: { from: ['publicado'], to: 'archivado', permission: 'contenido:archivar' },
  restaurar: { from: ['archivado'], to: 'publicado', permission: 'contenido:restaurar' },
};

export interface TransitionCheck {
  ok: boolean;
  to?: EditorialStatus;
  reason?: string;
  /** Motivo estable del rechazo: permiso (403), estado no válido (409) o propiedad (403). */
  code?: 'permiso' | 'estado' | 'propiedad';
}

/**
 * Comprueba si un rol puede aplicar una acción editorial a un contenido.
 * `isOwner` indica si la persona es la autora del contenido.
 */
export function checkTransition(role: Role, action: EditorialAction, from: EditorialStatus, isOwner: boolean): TransitionCheck {
  const t = TRANSITIONS[action];
  if (!can(role, t.permission)) return { ok: false, code: 'permiso', reason: 'No tienes permiso para realizar esta acción.' };
  if (!t.from.includes(from)) return { ok: false, code: 'estado', reason: `No se puede ${ACTION_VERB[action]} un contenido en estado «${STATUS_LABEL_EDITORIAL[from]}».` };
  if ((action === 'guardar' || action === 'enviar') && !isOwner && !can(role, 'contenido:editar-cualquiera')) {
    return { ok: false, code: 'propiedad', reason: 'Solo puedes modificar tus propios borradores.' };
  }
  return { ok: true, to: t.to };
}

const ACTION_VERB: Record<EditorialAction, string> = {
  guardar: 'guardar',
  enviar: 'enviar a revisión',
  publicar: 'publicar',
  devolver: 'devolver',
  archivar: 'archivar',
  restaurar: 'restaurar',
};

export const ACTION_LABEL: Record<EditorialAction, string> = {
  guardar: 'Guardar borrador',
  enviar: 'Enviar a revisión',
  publicar: 'Publicar',
  devolver: 'Devolver con comentarios',
  archivar: 'Archivar',
  restaurar: 'Restaurar',
};

/** Dominio corporativo obligatorio para las cuentas. */
export const CORPORATE_DOMAIN = 'flmexperts.com';

export function isCorporateEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@flmexperts\.com$/.test(e);
}

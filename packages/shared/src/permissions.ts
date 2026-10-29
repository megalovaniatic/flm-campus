import type { ContentType, EditorialStatus, Role } from './types';

/**
 * Matriz de permisos. Se aplica en el servidor en producción
 * y se refleja en la interfaz para ocultar lo que no se puede hacer.
 *
 * Flujo editorial sin revisión previa: la autoría guarda borradores y publica lo suyo
 * («contenido:publicar» siempre se comprueba con la propiedad); administración edita,
 * publica, archiva y restaura cualquier contenido.
 */
export type Permission =
  | 'campus:leer'
  | 'progreso:propio'
  | 'contenido:crear'
  | 'contenido:editar-propio'
  | 'contenido:editar-cualquiera'
  | 'contenido:publicar'
  | 'contenido:archivar'
  | 'contenido:restaurar'
  | 'documentos:subir'
  | 'documentos:reemplazar'
  | 'personas:gestionar'
  | 'sesiones:revocar'
  | 'informes:ver'
  | 'auditoria:ver'
  | 'datos-personales:eliminar';

const EMPLEADO: Permission[] = ['campus:leer', 'progreso:propio'];

const AUTOR: Permission[] = [
  ...EMPLEADO,
  'contenido:crear',
  'contenido:editar-propio',
  // Solo lo propio: checkTransition() exige la propiedad salvo con «contenido:editar-cualquiera».
  'contenido:publicar',
  'documentos:subir',
];

const ADMIN: Permission[] = [
  ...AUTOR,
  'contenido:editar-cualquiera',
  'contenido:archivar',
  'contenido:restaurar',
  'documentos:reemplazar',
  'personas:gestionar',
  'sesiones:revocar',
  'informes:ver',
  'auditoria:ver',
  'datos-personales:eliminar',
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
  autor: 'Además, crea contenidos, los guarda como borrador y publica los suyos.',
  admin: 'Además, edita, publica y archiva cualquier contenido; gestiona personas, accesos e informes, y elimina el perfil de quien deja FLM.',
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/**
 * Tipos de contenido que cada rol puede crear. La evaluación del área («test»: una por área, común a
 * toda la firma y con su reconocimiento) la prepara y publica administración; el test final de cada
 * formación va dentro de la formación y lo hace su autoría.
 */
export const CREATABLE_TYPES: Record<Role, ContentType[]> = {
  empleado: [],
  autor: ['formacion', 'noticia', 'documento', 'evento', 'comunicado', 'cliente', 'bienvenida'],
  admin: ['formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado', 'cliente', 'bienvenida'],
};

/**
 * Si el rol puede trabajar con un tipo de contenido: crearlo y, después, guardarlo, publicarlo,
 * descartar sus cambios o borrarlo. Se comprueba en cada acción, no solo al crear: tras un cambio de
 * rol, la evaluación del área sigue siendo de administración aunque figure como propia.
 */
export function canHandleType(role: Role, type: ContentType): boolean {
  return CREATABLE_TYPES[role].includes(type);
}

export const STATUS_LABEL_EDITORIAL: Record<EditorialStatus, string> = {
  borrador: 'Borrador',
  publicado: 'Publicado',
  archivado: 'Archivado',
};

export type EditorialAction = 'guardar' | 'publicar' | 'archivar' | 'restaurar';

/** Transiciones válidas del flujo editorial y permiso necesario para cada una. */
const TRANSITIONS: Record<EditorialAction, { from: EditorialStatus[]; to: EditorialStatus; permission: Permission }> = {
  guardar: { from: ['borrador'], to: 'borrador', permission: 'contenido:crear' },
  publicar: { from: ['borrador'], to: 'publicado', permission: 'contenido:publicar' },
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

const NOT_OWNER: Record<EditorialAction, string> = {
  guardar: 'Solo puedes modificar tus propios contenidos.',
  publicar: 'Solo puedes publicar tus propios contenidos.',
  archivar: 'Solo puedes archivar tus propios contenidos.',
  restaurar: 'Solo puedes restaurar tus propios contenidos.',
};

/**
 * Comprueba si un rol puede aplicar una acción editorial a un contenido (o a su revisión pendiente:
 * `from` es entonces el estado de la revisión, siempre «borrador»).
 * `isOwner` indica si la persona es la autora del contenido. Todas las acciones exigen la propiedad
 * salvo con «contenido:editar-cualquiera»: así la autoría publica lo suyo y nunca lo de otra persona.
 */
export function checkTransition(role: Role, action: EditorialAction, from: EditorialStatus, isOwner: boolean): TransitionCheck {
  const t = TRANSITIONS[action];
  if (!can(role, t.permission)) return { ok: false, code: 'permiso', reason: 'No tienes permiso para realizar esta acción.' };
  if (!t.from.includes(from)) return { ok: false, code: 'estado', reason: `No se puede ${ACTION_VERB[action]} un contenido en estado «${STATUS_LABEL_EDITORIAL[from]}».` };
  if (!isOwner && !can(role, 'contenido:editar-cualquiera')) return { ok: false, code: 'propiedad', reason: NOT_OWNER[action] };
  return { ok: true, to: t.to };
}

const ACTION_VERB: Record<EditorialAction, string> = {
  guardar: 'guardar',
  publicar: 'publicar',
  archivar: 'archivar',
  restaurar: 'restaurar',
};

/**
 * Una evaluación del área vigente por área: sin archivar, publicada o en borrador. Motivo del rechazo,
 * el mismo en la demo y en la API (409 `EVALUACION_DUPLICADA`). `other` es el estado de la que ya tiene
 * el área; `action`, lo que se intentaba («preparar»: crearla o pasarla a esa área).
 */
export function assessmentClashReason(areaName: string, other: 'publicado' | 'borrador', action: 'preparar' | 'publicar' | 'restaurar'): string {
  const area = `El área ${areaName}`;
  if (other === 'publicado') {
    return action === 'restaurar' ? `${area} ya tiene otra evaluación publicada. Archívala antes de restaurar esta.` : `${area} ya tiene su evaluación publicada. Edítala en lugar de ${action} otra, o archívala antes.`;
  }
  return action === 'restaurar' ? `${area} tiene un borrador de evaluación sin publicar. Elimínalo antes de restaurar esta, o sigue con ese borrador.` : `${area} ya tiene un borrador de evaluación. Sigue con ese borrador en lugar de ${action} otra.`;
}

export const ACTION_LABEL: Record<EditorialAction, string> = {
  guardar: 'Guardar borrador',
  publicar: 'Publicar',
  archivar: 'Archivar',
  restaurar: 'Restaurar',
};

/** Dominio corporativo obligatorio para las cuentas. */
export const CORPORATE_DOMAIN = 'flmexperts.com';

export function isCorporateEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  return /^[a-z0-9._%+-]+@flmexperts\.com$/.test(e);
}

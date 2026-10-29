/**
 * Catálogo de acciones de auditoría (mismos códigos que la API) y registros de ejemplo
 * rotulados. Los ejemplos se derivan de los metadatos reales del contenido semilla
 * (autoría y fechas de publicación o de subida) o usan personas ficticias.
 */
import { seed } from '@flm/content';
import type { AuditRecord } from '@flm/shared';

export type AuditCategory = 'contenido' | 'personas' | 'sesiones' | 'informes' | 'sistema';

export const CATEGORY_LABEL: Record<AuditCategory, string> = {
  contenido: 'Contenido',
  personas: 'Personas y accesos',
  sesiones: 'Sesiones',
  informes: 'Informes',
  sistema: 'Sistema',
};

const ACTIONS: Record<string, { label: string; category: AuditCategory }> = {
  'contenido.crear': { label: 'Crea un borrador', category: 'contenido' },
  'contenido.guardar': { label: 'Guarda cambios', category: 'contenido' },
  'contenido.enviar': { label: 'Envía a revisión', category: 'contenido' },
  'contenido.publicar': { label: 'Publica', category: 'contenido' },
  'contenido.devolver': { label: 'Devuelve con comentario', category: 'contenido' },
  'contenido.archivar': { label: 'Archiva', category: 'contenido' },
  'contenido.restaurar': { label: 'Restaura', category: 'contenido' },
  'contenido.deshacer': { label: 'Deshace una acción', category: 'contenido' },
  'contenido.descartar-revision': { label: 'Descarta una revisión', category: 'contenido' },
  'contenido.eliminar-borrador': { label: 'Elimina un borrador', category: 'contenido' },
  'documento.subir': { label: 'Sube un documento', category: 'contenido' },
  'documento.sustituir': { label: 'Sustituye el PDF (versión nueva)', category: 'contenido' },
  'evento.reclasificar': { label: 'Reclasifica un evento', category: 'contenido' },
  'persona.alta': { label: 'Da de alta a una persona', category: 'personas' },
  'persona.editar': { label: 'Edita una ficha', category: 'personas' },
  'persona.cambiar-rol': { label: 'Cambia el rol', category: 'personas' },
  'persona.desactivar': { label: 'Desactiva una cuenta', category: 'personas' },
  'persona.reactivar': { label: 'Reactiva una cuenta', category: 'personas' },
  'persona.eliminar-perfil': { label: 'Elimina un perfil', category: 'personas' },
  // Acción anterior (anonimizar la ficha), sustituida por «Elimina un perfil»: se conserva para leer registros antiguos.
  'persona.eliminar-datos': { label: 'Elimina datos personales', category: 'personas' },
  'cuenta.enlace-activacion': { label: 'Envía el enlace de activación', category: 'personas' },
  'cuenta.activar': { label: 'Activa su cuenta', category: 'personas' },
  'sesion.inicio': { label: 'Inicia sesión', category: 'sesiones' },
  'sesion.inicio-fallido': { label: 'Intento de acceso fallido', category: 'sesiones' },
  'sesion.cierre': { label: 'Cierra sesión', category: 'sesiones' },
  'sesion.revocar': { label: 'Revoca una sesión', category: 'sesiones' },
  'sesion.revocar-todas': { label: 'Revoca todas las sesiones', category: 'sesiones' },
  'informe.exportar': { label: 'Exporta un informe', category: 'informes' },
  'retencion.purga': { label: 'Purga por retención', category: 'sistema' },
  'semilla.importar': { label: 'Importa el contenido inicial', category: 'sistema' },
};

export function actionInfo(code: string): { label: string; category: AuditCategory } {
  return ACTIONS[code] ?? { label: code, category: code.startsWith('persona') || code.startsWith('cuenta') ? 'personas' : code.startsWith('sesion') ? 'sesiones' : 'sistema' };
}

export const ENTITY_LABEL: Record<string, string> = {
  formacion: 'Formación',
  test: 'Test',
  noticia: 'Noticia',
  documento: 'Documento',
  evento: 'Evento',
  comunicado: 'Comunicado',
  cliente: 'Cliente nuevo',
  bienvenida: 'Bienvenida',
  persona: 'Persona',
  sesion: 'Sesión',
  informe: 'Informe',
  sistema: 'Sistema',
};

export type AuditEntry = AuditRecord & { example?: boolean };

/** Registros de ejemplo, deterministas y rotulados. */
export function exampleAudit(): AuditEntry[] {
  const out: AuditEntry[] = [];
  const add = (id: string, at: string, actorId: string, action: string, entity: string, entityId?: string, detail?: string) => out.push({ id: `ej-${id}`, at, actorId, action, entity, entityId, detail, example: true });

  add('semilla', '2026-10-20T06:30:00.000Z', 'sistema', 'semilla.importar', 'sistema', undefined, 'Contenido inicial del campus');
  // Derivados de los metadatos reales del contenido semilla.
  for (const d of seed.documents) {
    const v = d.versions[0];
    if (v) add(`doc-${d.id}`, `${v.uploadedAt}T08:15:00.000Z`, v.uploadedBy, 'documento.subir', 'documento', d.id, 'Versión 1');
  }
  for (const e of seed.events) {
    // Sin autoría (perfil eliminado) no hay a quién atribuir la publicación de ejemplo.
    if (e.editorial.publishedAt && e.editorial.authorId) add(`ev-${e.id}`, `${e.editorial.publishedAt}T09:00:00.000Z`, e.editorial.authorId, 'contenido.publicar', e.kind, e.id);
  }
  // Personas ficticias de administración.
  add('alta-1', '2026-10-21T07:42:00.000Z', 'p-carme-soler', 'persona.alta', 'persona', 'p-noelia-fuentes', 'Rol: empleado');
  add('act-1', '2026-10-21T07:43:00.000Z', 'p-carme-soler', 'cuenta.enlace-activacion', 'persona', 'p-noelia-fuentes');
  add('rol-1', '2026-10-22T10:05:00.000Z', 'p-marc-pujol', 'persona.cambiar-rol', 'persona', 'p-marina-castell', 'Rol: empleado → autor. Sesiones cerradas: 1');
  add('ses-1', '2026-10-26T07:58:00.000Z', 'p-laura-gil', 'sesion.inicio', 'sesion');
  add('fail-1', '2026-10-26T08:02:00.000Z', 'sistema', 'sesion.inicio-fallido', 'persona', 'p-xavier-roig', 'Contraseña incorrecta');
  add('rev-1', '2026-10-27T15:20:00.000Z', 'p-marc-pujol', 'sesion.revocar-todas', 'persona', 'p-oriol-font', 'Sesiones cerradas: 2');
  // Perfil de una persona ficticia que ya no está en la plantilla de ejemplo: su id no se resuelve a ningún nombre.
  add('baja-1', '2026-10-27T17:05:00.000Z', 'p-carme-soler', 'persona.eliminar-perfil', 'persona', 'p-ejemplo-baja', 'Contenidos publicados o archivados sin autoría: 2 · borradores sin autoría: 1 · bienvenidas retiradas: 0. Sesiones cerradas.');
  add('inf-1', '2026-10-27T16:40:00.000Z', 'p-carme-soler', 'informe.exportar', 'informe', undefined, 'Participación por formación');
  add('purga-1', '2026-10-28T02:00:00.000Z', 'sistema', 'retencion.purga', 'sistema', undefined, 'Sesiones caducadas: 3 · enlaces usados o caducados: 1');
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

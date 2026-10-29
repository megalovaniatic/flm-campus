/**
 * Qué cambia al eliminar el perfil de quien deja FLM (funciones puras, con pruebas).
 * El diálogo «Eliminar el perfil» las usa para explicarlo con recuentos reales y para comprobar
 * la confirmación (el correo, como la API); la auditoría, para dejar constancia solo con números,
 * sin datos de la persona.
 */
import { neutralSignature, type AreaId, type ContentType, type EditorialStatus } from '@flm/shared';

/** Nombre de cada tipo en singular y plural, para los recuentos («2 formaciones y 1 noticia»). */
const NOUN: Record<string, [string, string]> = {
  formacion: ['formación', 'formaciones'],
  test: ['evaluación del área', 'evaluaciones del área'],
  noticia: ['noticia', 'noticias'],
  documento: ['documento', 'documentos'],
  evento: ['evento', 'eventos'],
  comunicado: ['comunicado', 'comunicados'],
  cliente: ['cliente nuevo', 'clientes nuevos'],
  bienvenida: ['bienvenida', 'bienvenidas'],
};
const ORDER = Object.keys(NOUN);

export const listFormat = new Intl.ListFormat('es', { type: 'conjunction' });

/** «2 formaciones y 1 noticia». */
function countsText(counts: Map<string, number>): string {
  return listFormat.format(
    [...counts.entries()]
      .sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]))
      .map(([type, n]) => {
        const [one, many] = NOUN[type] ?? [type, type];
        return `${n} ${n === 1 ? one : many}`;
      }),
  );
}

export interface RemovalImpact {
  /** Lo publicado o archivado que se conserva, agrupado por la firma neutra que llevará. */
  kept: { signature: string; text: string }[];
  keptTotal: number;
  /** Borradores y revisiones pendientes que quedan en Gestión sin autoría. */
  drafts: number;
  /** Bienvenidas de «Ponte al día» dedicadas a la persona (publicadas, archivadas o en borrador), que se retiran. */
  welcomes: number;
  /** Áreas en las que es la persona de referencia. */
  referenceAreas: AreaId[];
}

/** Lo que hace falta de cada fila de Gestión (`ContentRow`). */
export interface RemovalRow {
  type: ContentType;
  status: EditorialStatus;
  area: string | null;
  /**
   * Autoría del contenido (`ContentRow.ownerId`): en unos cambios sin publicar de algo publicado, la de
   * ese contenido y no la de quien los empezó. Es la que queda sin autoría al eliminar el perfil.
   */
  ownerId?: string;
  /** Revisión pendiente de un contenido publicado. */
  revisionOf?: string;
  /** Persona a la que se da la bienvenida. */
  personId?: string;
}

/**
 * Recuento de lo que cambia al eliminar el perfil de una persona: sus contenidos publicados o
 * archivados (agrupados por la firma neutra que llevarán), sus borradores (también los cambios sin
 * publicar de lo que firma, los empezara quien los empezara), sus bienvenidas y las áreas de las que
 * es la persona de referencia.
 * Las bienvenidas se cuentan en las mismas filas de Gestión que se retiran con el perfil: también
 * en borrador y aunque su cuenta ya esté desactivada. No son contenido que se conserve, aunque
 * las haya escrito ella.
 */
export function removalImpact(personId: string, rows: readonly RemovalRow[], reference: Readonly<Record<AreaId, string>>): RemovalImpact {
  const welcome = (r: RemovalRow) => r.type === 'bienvenida' && r.personId === personId;
  const own = rows.filter((r) => r.ownerId === personId && !welcome(r));
  const live = (r: RemovalRow) => !r.revisionOf && (r.status === 'publicado' || r.status === 'archivado');
  const groups = new Map<string, Map<string, number>>();
  for (const r of own.filter(live)) {
    const signature = neutralSignature({ type: r.type, area: r.area });
    const counts = groups.get(signature) ?? new Map<string, number>();
    counts.set(r.type, (counts.get(r.type) ?? 0) + 1);
    groups.set(signature, counts);
  }
  // Primero las firmas de área (en orden alfabético) y al final «FLM».
  const kept = [...groups.entries()]
    .sort(([a], [b]) => (a === 'FLM' ? 1 : b === 'FLM' ? -1 : a.localeCompare(b, 'es')))
    .map(([signature, counts]) => ({ signature, text: countsText(counts) }));
  return {
    kept,
    keptTotal: own.filter(live).length,
    drafts: own.filter((r) => !live(r)).length,
    // Una por bienvenida: sus cambios sin publicar se retiran con ella.
    welcomes: rows.filter((r) => welcome(r) && !r.revisionOf).length,
    referenceAreas: (Object.keys(reference) as AreaId[]).filter((a) => reference[a] === personId),
  };
}

/**
 * Confirmación de «Eliminar el perfil»: su correo, sin distinguir mayúsculas ni contar los espacios
 * de los extremos. Es la misma regla que aplica la API al campo `confirm`.
 */
export function confirmsRemoval(typed: string, email: string): boolean {
  const expected = email.trim().toLowerCase();
  return expected !== '' && typed.trim().toLowerCase() === expected;
}

/** Detalle para la auditoría: solo recuentos, nunca datos de la persona. */
export function removalAuditDetail(impact: RemovalImpact): string {
  return `Contenidos publicados o archivados sin autoría: ${impact.keptTotal} · borradores sin autoría: ${impact.drafts} · bienvenidas retiradas: ${impact.welcomes}. Sesiones cerradas.`;
}

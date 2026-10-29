/**
 * Vocabulario de «Consultar»: tipos de novedad, urgencias y tipos de documento.
 * Cada etiqueta se muestra siempre con icono + palabra (el color nunca va solo).
 */
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, FileText, Gavel, Landmark, Megaphone, Newspaper, Presentation, ScrollText, Stamp } from 'lucide-react';
import { AREAS, type AreaId, type LibraryDocument, type NewsItem, type NewsKind } from '@flm/shared';

export const NEWS_KIND_IDS: readonly NewsKind[] = ['legislacion', 'jurisprudencia', 'criterio', 'aviso-interno'];

export const NEWS_KIND: Record<NewsKind, { label: string; plural: string; Icon: LucideIcon }> = {
  legislacion: { label: 'Legislación', plural: 'Legislación', Icon: ScrollText },
  jurisprudencia: { label: 'Resolución judicial', plural: 'Resoluciones judiciales', Icon: Gavel },
  criterio: { label: 'Criterio administrativo', plural: 'Criterios administrativos', Icon: Landmark },
  'aviso-interno': { label: 'Aviso interno', plural: 'Avisos internos', Icon: Megaphone },
};

export type Urgency = NewsItem['urgency'];

export const URGENCY: Record<Urgency, { label: string }> = {
  alta: { label: 'Urgencia alta' },
  media: { label: 'Urgencia media' },
  informativa: { label: 'Informativa' },
};

export type DocKind = LibraryDocument['kind'];
export type DocArea = LibraryDocument['area'];

export const DOC_KIND_IDS: readonly DocKind[] = ['nota-informativa', 'publicacion-oficial', 'boletin', 'presentacion', 'material-evento'];

export const DOC_KIND: Record<DocKind, { label: string; plural: string; Icon: LucideIcon }> = {
  'nota-informativa': { label: 'Nota informativa', plural: 'Notas informativas', Icon: FileText },
  'publicacion-oficial': { label: 'Publicación oficial', plural: 'Publicaciones oficiales', Icon: Stamp },
  boletin: { label: 'Boletín', plural: 'Boletines', Icon: Newspaper },
  presentacion: { label: 'Presentación', plural: 'Presentaciones', Icon: Presentation },
  'material-evento': { label: 'Material de evento', plural: 'Material de eventos', Icon: CalendarDays },
};

export const areaLabel = (area: AreaId | 'general') => (area === 'general' ? 'General' : AREAS[area].name);

/** «1 novedad» · «3 novedades». */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Primera letra en mayúscula (para fechas que empiezan por el día de la semana o el mes). */
export const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

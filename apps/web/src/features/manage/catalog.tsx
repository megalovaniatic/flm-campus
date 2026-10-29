/**
 * Catálogos visuales de Gestión: iconos curados de eventos y tipos de noticia.
 * Cada icono va siempre con su nombre escrito (el icono nunca va solo).
 */
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Coffee, Gavel, GraduationCap, Globe, Landmark, Lightbulb, Mail, Megaphone, MessageSquareQuote, Stamp, Star, Trophy, Video, Wine } from 'lucide-react';
import type { EventIcon, NewsKind } from '@flm/shared';

export const EVENT_ICONS: { id: EventIcon; label: string; Icon: LucideIcon }[] = [
  { id: 'estrella', label: 'Estrella', Icon: Star },
  { id: 'trofeo', label: 'Trofeo', Icon: Trophy },
  { id: 'cafe', label: 'Taza de café', Icon: Coffee },
  { id: 'calendario', label: 'Calendario', Icon: CalendarDays },
  { id: 'formacion', label: 'Formación', Icon: GraduationCap },
  { id: 'megafono', label: 'Megáfono', Icon: Megaphone },
  { id: 'web', label: 'Web', Icon: Globe },
  { id: 'boletin', label: 'Boletín', Icon: Mail },
  { id: 'brindis', label: 'Brindis', Icon: Wine },
  { id: 'resenas', label: 'Reseñas', Icon: MessageSquareQuote },
  { id: 'video', label: 'Vídeo', Icon: Video },
  { id: 'idea', label: 'Idea', Icon: Lightbulb },
];

export function eventIcon(id: EventIcon) {
  return EVENT_ICONS.find((i) => i.id === id) ?? EVENT_ICONS[3]!;
}

export const NEWS_KIND_ICON: Record<NewsKind, LucideIcon> = {
  legislacion: Landmark,
  jurisprudencia: Gavel,
  criterio: Stamp,
  'aviso-interno': Megaphone,
};

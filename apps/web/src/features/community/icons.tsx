import {
  Award,
  Cake,
  CalendarDays,
  Coffee,
  Globe,
  GraduationCap,
  Lightbulb,
  Megaphone,
  MessageSquareText,
  Newspaper,
  Star,
  Sun,
  Trophy,
  Users,
  Video,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import type { CalendarKind, EventIcon as EventIconName } from '@flm/shared';

const EVENT_ICONS: Record<EventIconName, LucideIcon> = {
  estrella: Star,
  trofeo: Trophy,
  cafe: Coffee,
  calendario: CalendarDays,
  formacion: GraduationCap,
  megafono: Megaphone,
  web: Globe,
  boletin: Newspaper,
  brindis: Wine,
  resenas: MessageSquareText,
  video: Video,
  idea: Lightbulb,
};

/** Icono de un evento de la agenda (siempre decorativo: el texto ya nombra el evento). */
export function EventIcon({ icon, size = 18, className }: { icon: EventIconName; size?: number; className?: string }) {
  const I = EVENT_ICONS[icon] ?? CalendarDays;
  return <I size={size} strokeWidth={1.75} aria-hidden="true" className={className} />;
}

export const KIND_ICON: Record<CalendarKind, LucideIcon> = {
  cumpleanos: Cake,
  aniversario: Award,
  encuentro: Users,
  festivo: Sun,
};

/** Icono de un tipo de fecha del calendario. */
export function KindIcon({ kind, size = 16, className }: { kind: CalendarKind; size?: number; className?: string }) {
  const I = KIND_ICON[kind];
  return <I size={size} strokeWidth={1.9} aria-hidden="true" className={className} />;
}

/** Glifo oficial de YouTube (trazado de Simple Icons, CC0) para el canal verificado de FLM. */
export function YouTubeGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

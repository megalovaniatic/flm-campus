import { BookOpen, House, Library, Users } from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Inicio', icon: House, match: (p: string) => p === '/' },
  { to: '/aprender', label: 'Aprender', icon: BookOpen, match: (p: string) => p.startsWith('/aprender') },
  { to: '/consultar', label: 'Consultar', icon: Library, match: (p: string) => p.startsWith('/consultar') },
  { to: '/participar', label: 'Participar', icon: Users, match: (p: string) => p.startsWith('/participar') },
] as const;

export type SectionId = 'aprender' | 'consultar' | 'participar' | 'perfil' | 'sobre';

const SECTIONS: readonly SectionId[] = ['aprender', 'consultar', 'participar', 'perfil', 'sobre'];

/** Sección de una ruta (fija el tramo de color del cromo). Inicio, Gestión, Administración y Acceso no tienen. */
export function sectionOf(pathname: string): SectionId | undefined {
  const first = pathname.split('/')[1] ?? '';
  return (SECTIONS as readonly string[]).includes(first) ? (first as SectionId) : undefined;
}

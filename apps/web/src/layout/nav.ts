import { BookOpen, House, Library, Users } from 'lucide-react';

export const NAV = [
  { to: '/', label: 'Inicio', icon: House, match: (p: string) => p === '/' },
  { to: '/aprender', label: 'Aprender', icon: BookOpen, match: (p: string) => p.startsWith('/aprender') },
  { to: '/consultar', label: 'Consultar', icon: Library, match: (p: string) => p.startsWith('/consultar') },
  { to: '/participar', label: 'Participar', icon: Users, match: (p: string) => p.startsWith('/participar') },
] as const;

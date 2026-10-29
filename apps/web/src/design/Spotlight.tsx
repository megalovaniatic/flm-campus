import { ArrowRight } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

type SpotlightTag = 'section' | 'article' | 'aside' | 'div';

interface SpotlightProps extends HTMLAttributes<HTMLElement> {
  as?: SpotlightTag;
  /** deep: el tramo profundo del degradado (protagonista); redes: «Superponer»; soft: foco claro. */
  tone?: 'deep' | 'redes' | 'soft';
  /** Área del contenido: en el foco claro, lavado y banda del área. */
  area?: string;
  /** La tarjeta entera es un enlace (con [data-stretch] dentro): se eleva al pasar el puntero. */
  link?: boolean;
  children: ReactNode;
}

/**
 * Tarjeta protagonista: una por pantalla, la de la acción principal. Las clases globales
 * (.spotlight, .spotlight-soft) viven en layout.css; la maquetación interior, en cada página.
 */
export function Spotlight({ as: Tag = 'section', tone = 'deep', area, link = false, className, children, ...rest }: SpotlightProps) {
  return (
    <Tag
      {...rest}
      className={[tone === 'soft' ? 'spotlight-soft' : 'spotlight', className ?? ''].join(' ').trim()}
      data-tone={tone === 'redes' ? 'redes' : undefined}
      data-area={area}
      data-link={link || undefined}
    >
      {children}
    </Tag>
  );
}

/** Cápsula blanca de acción dentro de un protagonista que es un único enlace (decorativa: el enlace ya tiene nombre). */
export function SpotlightCta({ children }: { children: ReactNode }) {
  return (
    <span className="spotlight-cta" aria-hidden="true">
      {children}
      <ArrowRight size={16} />
    </span>
  );
}

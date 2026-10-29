import { ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { ROLE_LABEL } from '@flm/shared';
import { ButtonLink, EmptyState } from '@/design';
import { useMe } from '@/data/selectors';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';

const RANK = { empleado: 0, autor: 1, admin: 2 } as const;

function Forbidden({ min }: { min: 'autor' | 'admin' }) {
  usePageTitle('Acceso restringido');
  return (
    <div className="container page">
      <h1 className="sr-only">Acceso restringido</h1>
      <EmptyState icon={<ShieldAlert />} title={MESSAGES.forbidden.title} tone="error" action={<ButtonLink to="/">Volver al inicio</ButtonLink>}>
        <p>{MESSAGES.forbidden.body(ROLE_LABEL[min])}</p>
        {__DEMO__ && <p>En la demostración puedes cambiar de perfil desde tu avatar › «Ver la demo como».</p>}
      </EmptyState>
    </div>
  );
}

/**
 * Protección de rutas en la interfaz. En la versión privada la autorización
 * real se comprueba en el servidor; aquí solo evitamos mostrar lo que no procede.
 */
export function RequireRole({ min, children }: { min: 'autor' | 'admin'; children: ReactNode }) {
  const me = useMe();
  if (!me || RANK[me.effectiveRole] < RANK[min]) return <Forbidden min={min} />;
  return <>{children}</>;
}

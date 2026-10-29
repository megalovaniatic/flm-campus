import { House, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button, ButtonLink } from '@/design';
import { Logo } from '@/layout/Logo';
import { usePageTitle } from '@/lib/preferences';
import { isChunkError, reloadOnce } from '@/lib/reload';
import styles from './NotFound.module.css';

/**
 * Error al mostrar una ruta (sustituye la pantalla genérica en inglés de React Router).
 * El caso habitual es una versión nueva publicada con el campus abierto: se recarga sola una vez.
 * Se importa de forma estática: si fallara la carga de este archivo, no habría nada que mostrar.
 */
export function RouteError({ standalone = false }: { standalone?: boolean }) {
  const error = useRouteError();
  const stale = isChunkError(error);
  const [reloading, setReloading] = useState(stale);
  usePageTitle(stale ? 'Actualizando el campus' : 'Algo ha fallado');

  useEffect(() => {
    if (stale && !reloadOnce()) setReloading(false);
  }, [stale]);

  const status = isRouteErrorResponse(error) ? error.status : undefined;
  const detail = error instanceof Error ? error.message : isRouteErrorResponse(error) ? error.statusText : String(error ?? '');

  const content = (
    <div className={`container page ${styles.page}`}>
      <section className={styles.hero} aria-labelledby="h-error">
        <div className={styles.logo}>
          <Logo variant="diagonal" height={80} decorative />
        </div>
        <div className={styles.text}>
          {stale ? (
            <>
              <p className="eyebrow">Versión nueva del campus</p>
              <h1 id="h-error" className={styles.title}>
                {reloading ? 'Cargando la versión más reciente' : 'No hemos podido cargar la versión nueva'}
              </h1>
              <p className={styles.body}>
                {reloading
                  ? 'Se ha publicado una actualización mientras tenías el campus abierto. La página se recarga sola en un momento.'
                  : 'Recarga la página para continuar. Si vuelve a pasar, comprueba tu conexión.'}
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow">{status ? `Error ${status}` : 'Error inesperado'}</p>
              <h1 id="h-error" className={styles.title}>
                Algo ha fallado al mostrar esta página
              </h1>
              <p className={styles.body}>No es culpa tuya. Recarga la página o vuelve al inicio; si se repite, avisa a la administración del campus.</p>
            </>
          )}
          {!reloading && (
            <div className={styles.actions}>
              <Button icon={<RefreshCw />} onClick={() => window.location.reload()}>
                Recargar la página
              </Button>
              <ButtonLink to="/" variant="secondary" icon={<House />}>
                Volver al inicio
              </ButtonLink>
            </div>
          )}
          {import.meta.env.DEV && detail && (
            <p className={styles.path}>
              Detalle técnico: <code>{detail}</code>
            </p>
          )}
        </div>
      </section>
    </div>
  );

  // Si falla el propio armazón, no hay <main> alrededor: lo aporta la página de error
  return standalone ? (
    <main id="contenido" tabIndex={-1}>
      {content}
    </main>
  ) : (
    content
  );
}

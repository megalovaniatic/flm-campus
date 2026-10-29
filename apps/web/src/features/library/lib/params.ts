/**
 * Estado de la biblioteca reflejado en la dirección (filtros, búsqueda y fichas en panel),
 * para que se pueda compartir un enlace exacto y volver atrás sin perder el contexto.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

export type ParamPatch = Record<string, string | null | undefined>;

/** Lee los parámetros y los actualiza sin añadir entradas al historial ni mover el desplazamiento. */
export function useLibraryParams(): [URLSearchParams, (patch: ParamPatch) => void] {
  const [params, setParams] = useSearchParams();
  const update = useCallback(
    (patch: ParamPatch) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true, preventScrollReset: true },
      ),
    [setParams],
  );
  return [params, update];
}

/** Valor de un filtro validado contra su lista de opciones («todas» si no es válido). */
export function pick<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

/**
 * Texto de búsqueda: responde al instante en pantalla y se refleja en la dirección (?q=)
 * tras una breve pausa al escribir.
 */
export function useSearchText(params: URLSearchParams, update: (patch: ParamPatch) => void, key = 'q'): [string, (value: string) => void] {
  const fromUrl = params.get(key) ?? '';
  const [value, setValue] = useState(fromUrl);
  const synced = useRef(fromUrl);

  // Dirección → campo (atrás/adelante o un enlace con ?q=)
  useEffect(() => {
    if (fromUrl !== synced.current) {
      synced.current = fromUrl;
      setValue(fromUrl);
    }
  }, [fromUrl]);

  // Campo → dirección, con pausa
  useEffect(() => {
    const next = value.trim() ? value : '';
    if (next === synced.current) return;
    const t = window.setTimeout(() => {
      synced.current = next;
      update({ [key]: next || null });
    }, 300);
    return () => window.clearTimeout(t);
  }, [value, update, key]);

  return [value, setValue];
}

interface SheetState {
  sheet?: boolean;
}

/**
 * Última ficha cerrada por sección. Vive fuera de React porque la lista y su ficha son rutas
 * distintas: al abrir o cerrar, la página se vuelve a montar y perdería el estado.
 */
const closedSheets = new Map<string, { id: string; at: number }>();
const RECENT_MS = 2000;

/** true si se acaba de cerrar una ficha de esta sección (para no repetir entradas animadas). */
export function sheetJustClosed(base: string): boolean {
  const memo = closedSheets.get(base);
  return !!memo && Date.now() - memo.at < RECENT_MS;
}

/**
 * Fichas en panel lateral con dirección propia (/consultar/notas/:id, /consultar/lecturas/:id).
 * - Abrir conserva filtros y desplazamiento.
 * - Cerrar vuelve atrás en el historial si la ficha se abrió desde la lista.
 * - Al cerrar, el foco vuelve al enlace que abrió la ficha.
 */
export function useSheetRoute(base: string, id: string | undefined) {
  const navigate = useNavigate();
  const location = useLocation();

  const linkProps = useCallback(
    (itemId: string) => ({
      to: `${base}/${encodeURIComponent(itemId)}${location.search}`,
      state: { sheet: true } satisfies SheetState,
      preventScrollReset: true,
      'data-sheet-trigger': itemId,
    }),
    [base, location.search],
  );

  const close = useCallback(() => {
    if ((location.state as SheetState | null)?.sheet) navigate(-1);
    else navigate(`${base}${location.search}`, { replace: true, preventScrollReset: true });
  }, [base, location.search, location.state, navigate]);

  useEffect(() => {
    if (id) {
      // Al dejar la ficha (cerrar o salir), se recuerda cuál era.
      return () => closedSheets.set(base, { id, at: Date.now() });
    }
    const memo = closedSheets.get(base);
    if (!memo || Date.now() - memo.at > RECENT_MS) return;
    // La cabecera del campus enfoca <main> tras cada cambio de ruta (60 ms): devolvemos el foco
    // al enlace que abrió la ficha justo después, para no perder la posición del teclado.
    const t = window.setTimeout(() => {
      document.querySelector<HTMLElement>(`[data-sheet-trigger="${CSS.escape(memo.id)}"]`)?.focus({ preventScroll: true });
      closedSheets.delete(base);
    }, 140);
    return () => window.clearTimeout(t);
  }, [base, id]);

  return { linkProps, close };
}

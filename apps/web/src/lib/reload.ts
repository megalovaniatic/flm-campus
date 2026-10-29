const KEY = 'flm-campus-recarga';
const WINDOW_MS = 15_000;

/**
 * Fallo al cargar un fragmento de la aplicación. Ocurre sobre todo cuando se publica una versión
 * nueva con el campus abierto: los archivos antiguos ya no existen en el servidor.
 */
export function isChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(message);
}

/**
 * Recarga la página una sola vez en 15 s. Devuelve false si ya se intentó (o si no hay
 * almacenamiento para comprobarlo), para no entrar en un bucle cuando el archivo falta de verdad.
 */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < WINDOW_MS) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * Importa @flm/content (lo mantiene otro equipo). Está en JavaScript a propósito: así `tsc` no
 * arrastra las fuentes de ese paquete al comprobar los tipos de la API, mientras que esbuild sí
 * puede empaquetarlo en `dist/seed.mjs` si existe al compilar. Devuelve null si el paquete no existe.
 */
export async function loadContentSeed() {
  try {
    const mod = await import('@flm/content');
    return mod.seed ?? null;
  } catch (err) {
    const missing = (err?.code === 'ERR_MODULE_NOT_FOUND' || err?.code === 'MODULE_NOT_FOUND') && /@flm\/content/.test(String(err?.message));
    if (missing) return null;
    throw err;
  }
}

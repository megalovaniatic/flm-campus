/// <reference types="vite/client" />

/** true en la demostración pública (GitHub Pages); false en la versión privada con API. */
declare const __DEMO__: boolean;
/** Fecha de compilación (AAAA-MM-DD). */
declare const __BUILD_DATE__: string;

interface ImportMetaEnv {
  readonly VITE_BASE?: string;
  readonly VITE_API_URL?: string;
}

import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * Modos de compilación:
 *  - demo        → demostración estática (GitHub Pages): datos de ejemplo y almacenamiento local.
 *  - production  → versión privada: datos y permisos servidos por la API.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');
  const isDemo = mode !== 'production';
  return {
    base: env.VITE_BASE || '/',
    define: {
      __DEMO__: JSON.stringify(isDemo),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    },
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { port: 5173, strictPort: true },
    preview: { port: 4173 },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 900,
    },
  };
});

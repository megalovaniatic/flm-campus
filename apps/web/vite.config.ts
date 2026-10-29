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
    server: {
      port: 5173,
      strictPort: true,
      // En desarrollo, /api se redirige a la API local (npm run dev:api, puerto 3000).
      proxy: { '/api': { target: env.VITE_API_PROXY || 'http://localhost:3000', changeOrigin: false } },
    },
    preview: { port: 4173 },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 900,
      rolldownOptions: {
        output: {
          // Trozos estables y cacheables: librerías, contenido del campus y aplicación.
          codeSplitting: {
            groups: [
              { name: 'contenido', test: /packages[\\/]content[\\/]/ },
              { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/ },
              { name: 'motion', test: /node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/ },
            ],
          },
        },
      },
    },
  };
});

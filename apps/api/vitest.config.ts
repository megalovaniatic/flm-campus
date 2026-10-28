import { defineConfig } from 'vitest/config';

/**
 * Pruebas de la API: se ejecutan con `app.request()` (sin red) y SQLite en memoria.
 * Los tiempos de espera son amplios porque scrypt (N = 2^15) es deliberadamente costoso.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});

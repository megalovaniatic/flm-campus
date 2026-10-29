import type { SeedData } from '@flm/shared';

/** Datos semilla de @flm/content, o null si el paquete no existe todavía. */
export function loadContentSeed(): Promise<SeedData | null>;

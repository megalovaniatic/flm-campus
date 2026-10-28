import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { all, run, transaction, type Db } from './database';

/**
 * Migraciones SQL versionadas: `src/db/migrations/NNNN_descripcion.sql`.
 * Al compilar, `scripts/build.mjs` las copia a `dist/migrations/`, junto al paquete,
 * de modo que la misma ruta relativa funciona en desarrollo, pruebas y producción.
 * Cada migración se aplica una sola vez, dentro de una transacción, y queda anotada
 * en `schema_migrations`. Nunca se edita una migración ya publicada: se añade otra.
 */
const MIGRATIONS_DIR = fileURLToPath(new URL('./migrations/', import.meta.url));
const FILE_PATTERN = /^(\d{4})_[a-z0-9_-]+\.sql$/i;

export interface MigrationResult {
  applied: string[];
  current: number;
}

export function listMigrations(dir: string = MIGRATIONS_DIR): { version: number; name: string; file: string }[] {
  return readdirSync(dir)
    .map((name) => ({ name, match: FILE_PATTERN.exec(name) }))
    .filter((m): m is { name: string; match: RegExpExecArray } => m.match !== null)
    .map(({ name, match }) => ({ version: Number(match[1]), name, file: join(dir, name) }))
    .sort((a, b) => a.version - b.version);
}

export function migrate(db: Db, dir: string = MIGRATIONS_DIR): MigrationResult {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  )`);
  const done = new Set(all<{ version: number }>(db, 'SELECT version FROM schema_migrations').map((r) => r.version));
  const applied: string[] = [];
  let current = done.size ? Math.max(...done) : 0;
  for (const m of listMigrations(dir)) {
    if (done.has(m.version)) continue;
    const sql = readFileSync(m.file, 'utf8');
    transaction(db, () => {
      db.exec(sql);
      run(db, 'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)', m.version, m.name, new Date().toISOString());
    });
    applied.push(m.name);
    current = Math.max(current, m.version);
  }
  return { applied, current };
}

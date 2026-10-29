import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { all, get, run, transaction, type Db } from './database';

/**
 * Migraciones SQL versionadas: `src/db/migrations/NNNN_descripcion.sql`.
 * Al compilar, `scripts/build.mjs` las copia a `dist/migrations/`, junto al paquete,
 * de modo que la misma ruta relativa funciona en desarrollo, pruebas y producción.
 * Cada migración se aplica una sola vez, dentro de una transacción, y queda anotada
 * en `schema_migrations`. Nunca se edita una migración ya publicada: se añade otra.
 *
 * Reconstruir una tabla con claves foráneas (crear la nueva, copiar, borrar la antigua y renombrar)
 * exige desactivarlas: con ellas activas, DROP TABLE hace un DELETE implícito que borraría en cascada
 * las filas que dependen de ella. Una migración así empieza por la línea `-- flm:sin-claves-foraneas`:
 * el migrador desactiva las claves foráneas FUERA de la transacción (dentro, el PRAGMA no tiene efecto),
 * comprueba con `PRAGMA foreign_key_check` que no queda ninguna referencia rota antes de confirmar y
 * las vuelve a activar al terminar, también si la migración falla.
 */
const MIGRATIONS_DIR = fileURLToPath(new URL('./migrations/', import.meta.url));
const FILE_PATTERN = /^(\d{4})_[a-z0-9_-]+\.sql$/i;
const WITHOUT_FOREIGN_KEYS = /^\s*--\s*flm:sin-claves-foraneas\b/i;

export interface MigrationResult {
  applied: string[];
  current: number;
}

export interface MigrationFile {
  version: number;
  name: string;
  file: string;
}

export class MigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationError';
  }
}

/** Migraciones de la carpeta, en orden. Dos archivos con la misma versión son un error: una se saltaría para siempre. */
export function listMigrations(dir: string = MIGRATIONS_DIR): MigrationFile[] {
  const list = readdirSync(dir)
    .map((name) => ({ name, match: FILE_PATTERN.exec(name) }))
    .filter((m): m is { name: string; match: RegExpExecArray } => m.match !== null)
    .map(({ name, match }) => ({ version: Number(match[1]), name, file: join(dir, name) }))
    .sort((a, b) => a.version - b.version || a.name.localeCompare(b.name));
  for (let i = 1; i < list.length; i++) {
    const prev = list[i - 1]!;
    const curr = list[i]!;
    if (prev.version === curr.version) {
      throw new MigrationError(
        `Hay dos migraciones con la versión ${String(curr.version).padStart(4, '0')}: «${prev.name}» y «${curr.name}». Cada versión debe ser única: renumera la más reciente antes de arrancar.`,
      );
    }
  }
  return list;
}

/** Si la migración pide reconstruir tablas sin claves foráneas (primera línea con la directiva). */
export function needsForeignKeysOff(sql: string): boolean {
  return WITHOUT_FOREIGN_KEYS.test(sql);
}

function applyOne(db: Db, m: MigrationFile, sql: string): void {
  transaction(db, () => {
    db.exec(sql);
    run(db, 'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)', m.version, m.name, new Date().toISOString());
  });
}

function applyWithoutForeignKeys(db: Db, m: MigrationFile, sql: string): void {
  const before = get<{ foreign_keys: number }>(db, 'PRAGMA foreign_keys')?.foreign_keys ?? 0;
  db.exec('PRAGMA foreign_keys = OFF');
  try {
    transaction(db, () => {
      db.exec(sql);
      const broken = all<{ table: string; parent: string }>(db, 'PRAGMA foreign_key_check');
      if (broken.length) {
        const where = [...new Set(broken.map((b) => `${b.table} → ${b.parent}`))].join(', ');
        throw new MigrationError(`La migración «${m.name}» deja ${broken.length} referencias rotas (${where}). No se ha aplicado ningún cambio.`);
      }
      run(db, 'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)', m.version, m.name, new Date().toISOString());
    });
  } finally {
    if (before) db.exec('PRAGMA foreign_keys = ON');
  }
}

export function migrate(db: Db, dir: string = MIGRATIONS_DIR): MigrationResult {
  const migrations = listMigrations(dir);
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  )`);
  const done = new Set(all<{ version: number }>(db, 'SELECT version FROM schema_migrations').map((r) => r.version));
  const applied: string[] = [];
  let current = done.size ? Math.max(...done) : 0;
  for (const m of migrations) {
    if (done.has(m.version)) continue;
    const sql = readFileSync(m.file, 'utf8');
    if (needsForeignKeysOff(sql)) applyWithoutForeignKeys(db, m, sql);
    else applyOne(db, m, sql);
    applied.push(m.name);
    current = Math.max(current, m.version);
  }
  return { applied, current };
}

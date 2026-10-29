import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { ConfigError, loadConfig, loadDotEnv } from '../config';
import { openDatabase } from '../db/database';
import { createBackup } from '../services/backup';
import { assertNotRoot, fail } from './common';

/**
 * Copia de seguridad fechada de la base de datos con VACUUM INTO (se puede ejecutar con la API en marcha).
 *
 *   npm run backup -w @flm/api                        → BACKUP_DIR/campus-AAAAMMDD-HHMMSS.sqlite
 *   npm run backup -w @flm/api -- --archivos          → además, copia de STORAGE_DIR
 *   npm run backup -w @flm/api -- --conservar 14      → conserva solo las 14 copias más recientes
 *   npm run backup -w @flm/api -- --destino /ruta     → carpeta de destino distinta de BACKUP_DIR
 */
function main(): void {
  const { values } = parseArgs({
    options: {
      destino: { type: 'string' },
      archivos: { type: 'boolean', default: false },
      conservar: { type: 'string' },
    },
  });
  loadDotEnv();
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) fail(err.message);
    throw err;
  }
  assertNotRoot(config);
  if (config.databasePath === ':memory:' || !existsSync(config.databasePath)) {
    fail(`No existe la base de datos ${config.databasePath}. Revisa DATABASE_PATH.`);
  }
  const keep = values.conservar ? Number(values.conservar) : undefined;
  if (keep !== undefined && (!Number.isInteger(keep) || keep < 1)) fail('--conservar debe ser un número entero positivo.');

  const db = openDatabase(config.databasePath);
  try {
    const result = createBackup(db, {
      dir: values.destino ? resolve(values.destino) : config.backupDir,
      now: new Date(),
      storageDir: values.archivos ? config.storageDir : undefined,
      keep,
    });
    console.log(`
✔ Copia de seguridad creada
  Base de datos: ${result.file} (${(result.sizeBytes / 1024).toFixed(0)} KB, integridad: ${result.integrity})
  Archivos:      ${result.filesDir ?? 'no incluidos (usa --archivos para copiar STORAGE_DIR)'}
  Eliminadas:    ${result.removed.length ? result.removed.join(', ') : 'ninguna'}
`);
  } finally {
    db.close();
  }
}

try {
  main();
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}

import { ConfigError, loadConfig, loadDotEnv, type AppConfig } from '../config';
import { openDatabase, type Db } from '../db/database';
import { migrate } from '../db/migrate';

/** Arranque común de las herramientas de línea de órdenes: `.env`, configuración y base de datos. */
export function bootstrap(): { config: AppConfig; db: Db } {
  loadDotEnv();
  let config: AppConfig;
  try {
    config = loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) fail(err.message);
    throw err;
  }
  assertNotRoot(config);
  const db = openDatabase(config.databasePath);
  migrate(db);
  return { config, db };
}

/** Como root se crearían archivos de SQLite que luego el servidor (usuario «campus») no podría escribir. */
export function assertNotRoot(config: AppConfig): void {
  if (config.env === 'production' && process.getuid?.() === 0) {
    fail('No ejecutes las herramientas como root. En Docker: docker compose exec -u campus api node dist/…');
  }
}

export function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

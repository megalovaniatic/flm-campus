import { serve } from '@hono/node-server';
import { createApp } from './app';
import { ConfigError, loadConfig, loadDotEnv, type AppConfig } from './config';
import { openDatabase } from './db/database';
import { migrate } from './db/migrate';
import { createLogger, errorDetail } from './lib/logger';
import { createConsoleMailer, createSmtpMailer } from './services/mailer';
import { purgeExpiredData } from './services/retention';

/** Punto de entrada del servidor: configuración, migraciones, purga diaria y arranque HTTP. */
function main(): void {
  loadDotEnv();
  let config: AppConfig;
  try {
    config = loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }

  const logger = createLogger(config.env);
  const db = openDatabase(config.databasePath);
  const { applied, current } = migrate(db);
  logger.info(`Base de datos lista (esquema v${current})`, { path: config.databasePath, applied });

  const mailer = config.smtp ? createSmtpMailer(config.smtp, logger) : createConsoleMailer(config.env, logger);
  if (!config.smtp) {
    logger.warn('SMTP sin configurar: los correos no se envían. Los enlaces de activación se muestran a administración al crear cada cuenta.');
  }

  const { app } = createApp({ config, db, mailer, logger, now: () => new Date() });

  const purge = () => {
    try {
      logger.info('Purga de datos caducados', { ...purgeExpiredData(db, new Date()) });
    } catch (err) {
      logger.error('La purga de datos caducados ha fallado', errorDetail(err));
    }
  };
  purge();
  const timer = setInterval(purge, 24 * 60 * 60 * 1000);
  timer.unref();

  const server = serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (info) => {
    logger.info(`FLM Campus API escuchando en http://${info.address}:${info.port} (${config.env})`, {
      origin: config.appOrigin,
      web: config.serveWebDist ?? 'no se sirve',
    });
  });

  let closing = false;
  const shutdown = (signal: string) => {
    if (closing) return;
    closing = true;
    logger.info(`Señal ${signal}: cerrando el servidor…`);
    clearInterval(timer);
    server.close(() => {
      db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();

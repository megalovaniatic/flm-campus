import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { FileStorage } from '../services/files';
import { importSeed, SeedValidationError } from '../services/seed';
import { bootstrap, fail } from './common';
import { loadContentSeed } from './load-content.mjs';

/**
 * Carga los datos semilla que exporta @flm/content (`seed: SeedData`).
 * Inserta solo lo que no existe; nunca sobrescribe cambios hechos en la plataforma.
 * Las personas marcadas como ficticias (`fictional`, solo para la demostración) no se importan
 * salvo que se pida expresamente con --incluir-ficticias (útil en un entorno de pruebas).
 *
 *   npm run seed -w @flm/api
 *   npm run seed -w @flm/api -- --archivos ../../packages/content/archivos
 *   npm run seed -w @flm/api -- --incluir-ficticias
 */
async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      archivos: { type: 'string', multiple: true },
      'incluir-ficticias': { type: 'boolean', default: false },
    },
  });
  const seed = await loadContentSeed();
  if (!seed) {
    console.warn(
      '\n⚠ Aviso: el paquete @flm/content todavía no existe o no exporta «seed» (tipo SeedData de @flm/shared).\n' +
        '  No se ha cargado ningún dato. Cuando esté disponible, vuelve a ejecutar «npm run seed -w @flm/api».\n',
    );
    process.exitCode = 1;
    return;
  }

  const { config, db } = bootstrap();
  const filesDirs = values.archivos?.length
    ? values.archivos.map((d) => resolve(d))
    : [resolve('../../packages/content'), resolve('../../packages/content/files'), resolve('../web/public')];
  try {
    const report = await importSeed(db, seed, {
      now: new Date(),
      storage: new FileStorage(config.storageDir),
      filesDirs,
      includeFictional: values['incluir-ficticias'],
    });
    const line = (r: Record<string, number>) => Object.entries(r).map(([k, n]) => `${k}: ${n}`).join(', ') || 'nada';
    console.log(`\n✔ Datos semilla cargados en ${config.databasePath}\n  Creados:  ${line(report.created)}\n  Omitidos: ${line(report.skipped)}`);
    if (report.warnings.length) console.log(`\n  Avisos (${report.warnings.length}):\n   - ${report.warnings.join('\n   - ')}`);
    console.log('\n  Las cuentas creadas no tienen contraseña: envía los enlaces de activación desde la administración');
    console.log('  (o usa «npm run create-admin» para la primera persona administradora).\n');
  } catch (err) {
    if (err instanceof SeedValidationError) fail(err.message);
    throw err;
  } finally {
    db.close();
  }
}

main().catch((err: unknown) => fail(err instanceof Error ? err.message : String(err)));

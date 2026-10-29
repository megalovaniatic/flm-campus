/**
 * Compila la API con esbuild en paquetes ESM autocontenidos (no necesitan node_modules):
 *   dist/server.mjs        servidor HTTP
 *   dist/create-admin.mjs  alta de la primera cuenta de administración
 *   dist/backup.mjs        copia de seguridad (VACUUM INTO)
 *   dist/seed.mjs          carga de datos semilla (incluye @flm/content si existe al compilar)
 *   dist/migrations/       migraciones SQL (se leen junto a los paquetes)
 */
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
/** `--outdir <carpeta>` permite compilar en otra carpeta (lo usan las pruebas de los CLI). */
const { values } = parseArgs({ options: { outdir: { type: 'string' } } });
const dist = values.outdir ? resolve(values.outdir) : join(root, 'dist');
const require = createRequire(join(root, 'package.json'));

/** @flm/content es opcional: si no existe al compilar, el import queda para tiempo de ejecución. */
const optionalContent = {
  name: 'contenido-opcional',
  setup(b) {
    b.onResolve({ filter: /^@flm\/content$/ }, (args) => {
      try {
        require.resolve('@flm/content');
        return undefined;
      } catch {
        console.warn('Aviso: @flm/content no está disponible; dist/seed.mjs lo buscará al ejecutarse.');
        return { path: args.path, external: true };
      }
    });
  },
};

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: {
    server: 'src/server.ts',
    'create-admin': 'src/cli/create-admin.ts',
    backup: 'src/cli/backup.ts',
    seed: 'src/cli/seed.ts',
  },
  outdir: dist,
  outExtension: { '.js': '.mjs' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  sourcemap: true,
  legalComments: 'none',
  logLevel: 'info',
  // Algunas dependencias son CommonJS: se les proporciona `require` dentro del paquete ESM.
  banner: { js: "import { createRequire as __flmCreateRequire } from 'node:module'; const require = __flmCreateRequire(import.meta.url);" },
  plugins: [optionalContent],
});

cpSync(join(root, 'src', 'db', 'migrations'), join(dist, 'migrations'), { recursive: true });
console.log(`✔ API compilada en ${dist}`);

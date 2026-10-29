// Crea los archivos de formación vacíos (si no existen) y el índice que los registra.
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../packages/content/src/formaciones');
const ids = ['fis-01-recargos', 'fis-02-verifactu', 'fis-03-gastos', 'lab-01-despido', 'lab-02-jornada', 'lab-03-contratos', 'mer-01-derivar', 'mer-02-perdidas', 'mer-03-cuentas', 'con-01-boicac-147', 'con-02-devengo', 'con-03-amortizacion', 'con-04-importaciones-dua', 'con-05-amortizaciones', 'con-06-bienes-inversion', 'con-07-anticipos'];

for (const id of ids) {
  const file = path.join(dir, `${id}.ts`);
  if (existsSync(file)) continue;
  writeFileSync(
    file,
    `import type { Formation, QuizQuestion } from '@flm/shared';\n\n/** Pendiente de redacción. */\nexport const formation: Formation | null = null;\n\n/** Banco de 4 preguntas adicionales para la evaluación sectorial. */\nexport const bank: QuizQuestion[] = [];\n`,
  );
}

const v = (id) => id.replace(/-/g, '_');
const index = `import type { Formation, QuizQuestion } from '@flm/shared';
${ids.map((id) => `import * as ${v(id)} from './${id}';`).join('\n')}

const modules = [${ids.map(v).join(', ')}];

/** Formaciones del campus por área, cada una en su archivo (al menos tres por área). */
export const formations: Formation[] = modules.map((m) => m.formation).filter((f): f is Formation => f !== null);

/** Bancos de preguntas por formación (para las evaluaciones sectoriales). */
export const banks: Record<string, QuizQuestion[]> = Object.fromEntries(modules.filter((m) => m.formation).map((m) => [m.formation!.id, m.bank]));
`;
writeFileSync(path.join(dir, 'index.ts'), index);
console.log('ok', ids.length);

#!/usr/bin/env node
/**
 * Capturas de pantalla de la demo para la documentación (docs/capturas).
 *
 * Requisitos: la demo compilada servida en local (npm run build:demo y vite preview en el puerto 4173
 * con base /flm-campus/) y Google Chrome o Microsoft Edge instalados.
 * Uso: node scripts/capturas.mjs [ruta-del-navegador]
 */
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = process.argv[2] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:4173/flm-campus/#';

const SHOTS = [
  ['escritorio-inicio', '/', 'desktop'],
  ['escritorio-aprender', '/aprender', 'desktop'],
  ['escritorio-area-fiscal', '/aprender/fiscal', 'desktop'],
  ['escritorio-formacion', '/aprender/fiscal/recargos-presentacion-fuera-de-plazo', 'desktop'],
  ['escritorio-test', '/aprender/fiscal/recargos-presentacion-fuera-de-plazo/test', 'desktop'],
  ['escritorio-consultar', '/consultar', 'desktop'],
  ['escritorio-actualidad', '/consultar/actualidad', 'desktop'],
  ['escritorio-notas', '/consultar/notas', 'desktop'],
  ['escritorio-lecturas', '/consultar/lecturas', 'desktop'],
  ['escritorio-agenda', '/participar/agenda', 'desktop'],
  ['escritorio-calendario', '/participar/calendario', 'desktop'],
  ['escritorio-perfil', '/perfil', 'desktop'],
  ['escritorio-sobre', '/sobre', 'desktop'],
  ['movil-inicio', '/', 'mobile'],
  ['movil-formacion', '/aprender/contable/devengo-y-periodificacion', 'mobile'],
  ['movil-test', '/aprender/contable/devengo-y-periodificacion/test', 'mobile'],
  ['movil-agenda', '/participar/agenda', 'mobile'],
  ['movil-calendario', '/participar/calendario', 'mobile'],
  ['movil-notas', '/consultar/notas', 'mobile'],
];

const out = path.join(root, 'docs/capturas');
await mkdir(out, { recursive: true });
const tmp = await mkdtemp(path.join(os.tmpdir(), 'flm-capturas-'));

for (const [name, route, kind] of SHOTS) {
  const png = path.join(tmp, `${name}.png`);
  const profile = await mkdtemp(path.join(tmp, 'perfil-'));
  const size = kind === 'desktop' ? '1440,900' : '390,844';
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    `--user-data-dir=${profile}`,
    `--window-size=${size}`,
    `--force-device-scale-factor=${kind === 'desktop' ? 1 : 2}`,
    '--virtual-time-budget=7000',
    `--screenshot=${png}`,
    `${BASE}${route}`,
  ];
  await run(browser, args, { timeout: 60000 });
  await sharp(png).webp({ quality: 82 }).toFile(path.join(out, `${name}.webp`));
  console.log(`✓ ${name}`);
}

await rm(tmp, { recursive: true, force: true });
console.log(`Capturas en ${out}`);

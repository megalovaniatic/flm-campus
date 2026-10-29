#!/usr/bin/env node
/**
 * Optimiza las fotografías y logotipos aportados por FLM para la web.
 *
 * Uso:
 *   node scripts/optimize-images.mjs <carpeta-de-originales>
 *
 * Genera en apps/web/public/img/:
 *   - fotos en AVIF y WebP a varios anchos, con relación de aspecto conservada;
 *   - un manifiesto (apps/web/src/assets/images.json) con dimensiones y un
 *     marcador de posición difuminado (LQIP) para cargas sin saltos de diseño.
 * Los originales no se versionan: se conservan en la carpeta de recursos de FLM.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Indica la carpeta de originales. Ejemplo: node scripts/optimize-images.mjs "D:/FLM/recursos"');
  process.exit(1);
}

/** Fotografías seleccionadas: nombre de salida → archivo original y uso previsto. */
const PHOTOS = {
  biblioteca: { file: 'BIBLIOTECA 1.jpg', alt: 'Sala de reuniones de FLM con la biblioteca jurídica al fondo', focus: 'center' },
  'biblioteca-mesa': { file: 'BIBLIOTECA 2.jpg', alt: 'Mesa de reuniones de FLM frente a las estanterías de la biblioteca', focus: 'center' },
  fachada: { file: 'EDIFICIO FACHADA FLM 1.jpg', alt: 'Fachada del edificio de la sede de FLM en Barcelona, con ventanales en zigzag', focus: 'center' },
  'fachada-arbol': { file: 'EDIFICIO FACHADA FLM 2.jpg', alt: 'Ventanales del edificio de FLM entre los árboles de la calle', focus: 'center' },
  'edificio-cielo': { file: 'EDIFICIO FLM 5.jpg', alt: 'Edificio de la sede de FLM en Barcelona bajo un cielo de nubes', focus: 'center' },
  eixample: { file: 'EDIFICIO FACHADA ENFRENTE.jpg', alt: 'Edificio modernista del Eixample frente a la sede de FLM', focus: 'center' },
  recepcion: { file: 'RECEPCIÓ.jpg', alt: 'Recepción de la oficina de FLM con personas en movimiento', focus: 'center' },
  libreta: { file: 'LIBRETA FLM 1.jpg', alt: 'Libreta burdeos con el logotipo de FLM y un bolígrafo sobre una mesa de madera', focus: 'center' },
  'libreta-mesa': { file: 'LIBRETA FLM 2.jpg', alt: 'Libreta de FLM sobre la mesa de una sala de reuniones', focus: 'center' },
  'desayuno-mercantil': { file: 'Desayuno Mercantil FLM.png', alt: 'Desayuno Mercantil en la Sala Biblioteca de FLM: el equipo sigue la presentación «La información es poder»', focus: 'center' },
  'web-nueva': { file: '../../dist/assets/company/new-flm-website.png', alt: 'Portada de la nueva web corporativa flmexperts.com', focus: 'top' },
  // Única foto que no es de FLM: la de Aprender, a petición de FLM (29/10/2026). Vitaly Gariev en Unsplash, Licencia Unsplash
  // (https://unsplash.com/photos/_4tpElFQemQ); descargada a 2400 px de ancho.
  'equipo-reunion': { file: 'unsplash-_4tpElFQemQ.jpg', alt: 'Cuatro profesionales conversan alrededor de una mesa de trabajo en una oficina luminosa', focus: 'center' },
};

const WIDTHS = [480, 960, 1600, 2400];
const outDir = path.join(root, 'apps/web/public/img/photos');
await mkdir(outDir, { recursive: true });

const manifest = {};
for (const [name, meta] of Object.entries(PHOTOS)) {
  const input = path.join(srcDir, meta.file);
  const buf = await readFile(input);
  const base = sharp(buf).rotate();
  const { width, height } = await base.metadata();
  const sizes = [];
  for (const w of WIDTHS.filter((w) => w <= width)) {
    const pipeline = sharp(buf).rotate().resize({ width: w });
    await pipeline.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(outDir, `${name}-${w}.avif`));
    await pipeline.clone().webp({ quality: 74, effort: 6 }).toFile(path.join(outDir, `${name}-${w}.webp`));
    sizes.push(w);
  }
  const lqip = await sharp(buf).rotate().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  manifest[name] = {
    alt: meta.alt,
    width,
    height,
    sizes,
    placeholder: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
  console.log(`✓ ${name} (${sizes.join(', ')})`);
}

await mkdir(path.join(root, 'apps/web/src/assets'), { recursive: true });
await writeFile(path.join(root, 'apps/web/src/assets/images.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Manifiesto escrito en apps/web/src/assets/images.json');

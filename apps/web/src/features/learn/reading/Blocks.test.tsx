import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Block } from '@flm/shared';
import { PHOTOS } from '@/features/manage/editor/pickers';
import { blockToShared, newBlock, type EditorBlock } from '@/features/manage/forms';
import { BlockView } from './Blocks';

const base = import.meta.env.BASE_URL;
const html = (block: Block) => renderToStaticMarkup(<BlockView block={block} />);

describe('bloque «Fotografía»', () => {
  it('la foto aprobada que se elige en el creador se pinta con sus archivos del manifiesto y la descripción escrita', () => {
    const photo = PHOTOS[0]!;
    const figure = { ...(newBlock('figure') as Extract<EditorBlock, { type: 'figure' }>), src: photo.name, alt: 'Sala de reuniones con la biblioteca', caption: 'La Sala Biblioteca' };
    const out = html(blockToShared(figure));
    expect(out).toContain(`src="${base}img/photos/${photo.name}-`);
    expect(out).toContain(`${base}img/photos/${photo.name}-480.avif 480w`);
    expect(out).not.toContain(`src="${base}${photo.name}"`);
    expect(out).toContain('alt="Sala de reuniones con la biblioteca"');
    expect(out).toContain('<figcaption>La Sala Biblioteca</figcaption>');
  });

  it('una ruta de archivo se sigue pintando como imagen', () => {
    const out = html({ type: 'figure', src: 'img/photos/biblioteca-mesa-960.webp', alt: 'Mesa de reuniones' });
    expect(out).toContain(`src="${base}img/photos/biblioteca-mesa-960.webp"`);
    expect(out).toContain('alt="Mesa de reuniones"');
  });
});

describe('recuadros', () => {
  const refs = [{ label: 'Ley 58/2003, General Tributaria, art. 27', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27', kind: 'norma' as const }];

  it('«Explicamos» muestra sus referencias oficiales, como los demás tonos', () => {
    const explica = html({ type: 'callout', tone: 'clave', title: 'Recargo extemporáneo', text: 'Lo que se paga por presentar tarde sin requerimiento.', refs });
    expect(explica).toContain('aria-label="Referencias"');
    expect(explica).toContain('Ley 58/2003, General Tributaria, art. 27');
    expect(html({ type: 'callout', tone: 'norma', text: 'Art. 27 LGT.', refs })).toContain('Ley 58/2003, General Tributaria, art. 27');
  });
});

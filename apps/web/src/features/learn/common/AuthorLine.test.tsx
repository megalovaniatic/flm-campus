import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { authorLine } from '@flm/shared';
import { AuthorLine } from './AuthorLine';

const judith = { name: 'Judith Calet', position: 'Asesora Contable' };
const html = (person: { name: string; position?: string }) => renderToStaticMarkup(<AuthorLine person={person} nameClassName="nombre" roleClassName="puesto" />);
const count = (text: string, part: string) => text.split(part).length - 1;

/** Lo que oye el lector de pantalla: el marcado sin lo que va con aria-hidden (siempre al final de la firma). */
const heard = (markup: string) =>
  markup
    .replace(/<span aria-hidden="true">.*$/, '')
    .replace(/<[^>]+>/g, '')
    .trim();

/** Lo que se ve: el marcado sin el texto solo para lectores de pantalla. */
const seen = (markup: string) =>
  markup
    .replace(/<span class="sr-only">[^<]*<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/ /g, ' ')
    .trim();

describe('firma de la persona autora en Aprender', () => {
  it('se ve «Judith Calet — Asesora Contable», con el nombre y el puesto de la ficha', () => {
    const out = html(judith);
    expect(seen(out)).toBe('Judith Calet — Asesora Contable');
    expect(seen(out)).toBe(authorLine(judith));
    expect(out).toContain('<span class="nombre">Judith Calet</span>');
    expect(out).toMatch(/class="[^"]*puesto[^"]*"> — <span[^>]*>Asesora Contable<\/span><\/span>/);
  });

  it('el lector de pantalla la oye una sola vez, entera', () => {
    const out = html(judith);
    expect(heard(out)).toBe('Judith Calet — Asesora Contable');
    expect(count(out, '<span class="sr-only">Judith Calet — Asesora Contable</span>')).toBe(1);
  });

  it('sin duplicar el texto: el nombre se pinta una vez y no hay otra línea con la firma', () => {
    const visible = seen(html(judith));
    expect(count(visible, 'Judith Calet')).toBe(1);
    expect(count(visible, 'Asesora Contable')).toBe(1);
    expect(count(visible, '—')).toBe(1);
  });

  it('la raya nunca empieza línea: el espacio de antes no la separa del nombre; el puesto pasa entero', () => {
    expect(html(judith)).toMatch(/Judith Calet<\/span><span[^>]*> — <span[^>]*>Asesora Contable</);
  });

  it('sin puesto, solo el nombre y sin raya', () => {
    const out = html({ name: 'Judith Calet', position: '' });
    expect(seen(out)).toBe('Judith Calet');
    expect(heard(out)).toBe('Judith Calet');
    expect(out).not.toContain('—');
  });
});

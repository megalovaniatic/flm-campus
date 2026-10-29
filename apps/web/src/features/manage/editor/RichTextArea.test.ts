import { describe, expect, it } from 'vitest';
import { linkTerm } from './RichTextArea';

describe('menú «Término» del texto con formato', () => {
  const text = 'Los recargos se aplican si no hay requerimiento.';
  const at = (s: string) => [text.indexOf(s), text.indexOf(s) + s.length] as const;

  it('si lo seleccionado es otro texto, escribe el término elegido (el enlace solo funciona con el término)', () => {
    const [start, end] = at('recargos');
    expect(linkTerm(text, start, end, 'Recargo extemporáneo')).toEqual({ text: 'Los [[Recargo extemporáneo]] se aplican si no hay requerimiento.', from: 6, to: 26 });
  });

  it('si lo seleccionado es el término (sin contar mayúsculas, tildes ni espacios de los extremos), lo envuelve tal cual', () => {
    // El doble clic selecciona también el espacio siguiente.
    const [start, end] = at('requerimiento');
    expect(linkTerm(text, start, end, 'Requerimiento').text).toBe('Los recargos se aplican si no hay [[requerimiento]].');
    expect(linkTerm('Sin requerimiento previo.', 3, 18, 'requerimiento')).toEqual({ text: 'Sin [[requerimiento]] previo.', from: 6, to: 19 });
    expect(linkTerm('El recargo extemporaneo', 3, 23, 'Recargo extemporáneo').text).toBe('El [[recargo extemporaneo]]');
  });

  it('sin selección, inserta el término en el cursor', () => {
    expect(linkTerm('Ver ', 4, 4, 'Recargo').text).toBe('Ver [[Recargo]]');
  });
});

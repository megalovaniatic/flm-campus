import { renderToStaticMarkup } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Rich } from './rich';

describe('texto enriquecido', () => {
  it('los enlaces a otra página del campus van por el router, sin abrir pestaña', () => {
    const router = createMemoryRouter([{ path: '*', element: <Rich text="Ver [«Importaciones y DUA»](#/aprender/contable/importaciones-y-dua)." /> }]);
    const html = renderToStaticMarkup(<RouterProvider router={router} />);
    expect(html).toContain('href="/aprender/contable/importaciones-y-dua"');
    expect(html).toContain('«Importaciones y DUA»</a>');
    expect(html).not.toContain('target=');
  });

  it('fuera del router, el enlace interno se queda con su hash', () => {
    const html = renderToStaticMarkup(<Rich text="[Agenda](#/participar/agenda)" />);
    expect(html).toBe('<a href="#/participar/agenda">Agenda</a>');
  });

  it('los enlaces externos se abren en otra pestaña y lo anuncian', () => {
    const html = renderToStaticMarkup(<Rich text="[art. 75 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75)" />);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('(se abre en una pestaña nueva)');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { EventLinks, EventPhoto } from './EventParts';

describe('partes de un evento', () => {
  it('la foto aprobada lleva la descripción que escribió quien publicó el evento', () => {
    const html = renderToStaticMarkup(<EventPhoto image={{ src: 'desayuno-mercantil', alt: 'El equipo de Mercantil en el desayuno de octubre' }} sizes="28rem" />);
    expect(html).toContain('img/photos/desayuno-mercantil-');
    expect(html).toContain('alt="El equipo de Mercantil en el desayuno de octubre"');
  });

  it('dos enlaces a la misma dirección se muestran los dos', () => {
    const url = 'https://forms.example.com/votacion';
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <EventLinks links={[{ label: 'Vota aquí', url }, { label: 'Formulario de votación', url }]} />
      </MemoryRouter>,
    );
    expect(html).toContain('Vota aquí');
    expect(html).toContain('Formulario de votación');
  });
});

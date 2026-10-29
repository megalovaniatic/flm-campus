import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import { neutralSignature } from '@flm/shared';
import { useDemo } from '@/data/store';
import { ContentPreview, type PreviewMeta } from './ContentPreview';
import { formationToForm, newsToForm, type AnyForm } from './forms';

const JUDITH = 'Judith Calet — Asesora Contable';
const count = (text: string, part: string) => text.split(part).length - 1;
// Sin los bloques del cuerpo: aquí solo cuenta la firma.
const formation = seed.formations[0]!;
const formationForm = { ...formationToForm(formation), blocks: [] };
const render = (form: AnyForm, meta?: PreviewMeta) => renderToStaticMarkup(<ContentPreview form={form} meta={meta} />);

describe('firma en la vista previa del editor', () => {
  beforeEach(() => useDemo.getState().reset());

  it('una formación firma como en Aprender: «Judith Calet — Asesora Contable», una sola vez, y el estado aparte', () => {
    const out = render(formationForm, { authorId: formation.editorial.authorId, status: 'publicado' });
    expect(count(out, `<span class="sr-only">${JUDITH}</span>`)).toBe(1);
    expect(out).toMatch(/>Judith Calet<\/span><span[^>]*> — <span[^>]*>Asesora Contable<\/span>/);
    // Ni el puesto repetido junto al estado ni el nombre en otra línea.
    expect(out).not.toContain('Asesora Contable · ');
    expect(count(out, '>Judith Calet<')).toBe(1);
    expect(out).toContain('Pendiente de revisión por el área');
  });

  it('sin autoría (perfil eliminado), la firma neutra del área, sin puesto', () => {
    const out = render(formationForm, { status: 'publicado' });
    expect(out).toContain(`>${neutralSignature({ type: 'formacion', area: formation.area })}<`);
    expect(out).not.toContain('Judith Calet');
    expect(out).not.toContain('Asesora Contable');
  });

  it('las noticias conservan su firma: nombre, y el puesto junto al estado', () => {
    const news = seed.news.find((n) => n.editorial.authorId === 'p-judith-calet')!;
    const out = render(newsToForm(news), { authorId: 'p-judith-calet', status: 'publicado' });
    expect(out).toContain('Asesora Contable · Publicado');
    expect(out).not.toContain(JUDITH);
  });
});

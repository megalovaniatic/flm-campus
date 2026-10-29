import { AREAS, areaName, normalize, plainText } from '@flm/shared';
import { seed } from '@flm/content';

export type ResultGroup = 'Formaciones' | 'Actualidad' | 'Notas informativas' | 'Lecturas' | 'Agenda' | 'Secciones';

export interface SearchItem {
  id: string;
  group: ResultGroup;
  title: string;
  subtitle: string;
  href: string;
  haystack: string;
  /** Peso para ordenar a igualdad de coincidencia. */
  weight: number;
}

const PAGES: [string, string, string][] = [
  ['Aprender', 'Formaciones por área y evaluaciones', '/aprender'],
  ['Actualidad en tu sector', 'Novedades fiscales, laborales, mercantiles y contables', '/consultar/actualidad'],
  ['Notas informativas', 'Documentos originales y PDF de FLM', '/consultar/notas'],
  ['Lecturas recomendadas', 'La estantería del campus', '/consultar/lecturas'],
  ['Agenda', 'Eventos y comunicados de FLM', '/participar/agenda'],
  ['Calendario', 'Encuentros de equipo y festivos', '/participar/calendario'],
  ['Formas de participar', 'Propón temas, mejoras y vídeos', '/participar/contribuye'],
  ['Mi perfil', 'Progreso, resultados y reconocimientos', '/perfil'],
  ['Ajustes', 'Tema, movimiento y preferencias', '/perfil/ajustes'],
  ['Gestión de contenidos', 'Crear, revisar y publicar', '/gestion'],
  ['Sobre el campus', 'Concepto, sistema de diseño y accesibilidad', '/sobre'],
];

let cache: SearchItem[] | null = null;

/** Índice local (en el navegador): sin servidor y en menos de 50 ms. */
export function buildIndex(): SearchItem[] {
  if (cache) return cache;
  const items: SearchItem[] = [];
  for (const f of seed.formations) {
    if (f.editorial.status !== 'publicado') continue;
    items.push({
      id: f.id,
      group: 'Formaciones',
      title: f.title,
      subtitle: `${AREAS[f.area].name} · ${f.readingMinutes} min`,
      href: `/aprender/${f.area}/${f.slug}`,
      haystack: normalize([f.title, f.summary, AREAS[f.area].name, ...f.outcomes, ...f.keyTerms.map((k) => k.term)].join(' ')),
      weight: 5,
    });
  }
  for (const n of seed.news) {
    items.push({ id: n.id, group: 'Actualidad', title: n.headline, subtitle: `${areaName(n.area)} · ${n.date}`, href: `/consultar/actualidad/${n.slug}`, haystack: normalize([n.headline, plainText(n.oneLiner), n.source.label].join(' ')), weight: 4 });
  }
  for (const d of seed.documents) {
    items.push({ id: d.id, group: 'Notas informativas', title: d.title, subtitle: d.issuer, href: `/consultar/notas/${d.id}`, haystack: normalize([d.title, d.summary, d.issuer, ...d.tags].join(' ')), weight: 3 });
  }
  for (const r of seed.readings) {
    items.push({ id: r.id, group: 'Lecturas', title: r.title, subtitle: `${r.authors} · ${r.edition}`, href: `/consultar/lecturas/${r.id}`, haystack: normalize([r.title, r.authors, r.publisher, r.summary].join(' ')), weight: 2 });
  }
  for (const e of seed.events) {
    items.push({ id: e.id, group: 'Agenda', title: e.title, subtitle: e.kind === 'comunicado' ? 'Comunicado' : 'Evento', href: `/participar/agenda/${e.slug}`, haystack: normalize([e.title, e.summary].join(' ')), weight: 3 });
  }
  for (const [title, subtitle, href] of PAGES) items.push({ id: href, group: 'Secciones', title, subtitle, href, haystack: normalize(`${title} ${subtitle}`), weight: 6 });
  cache = items;
  return items;
}

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** Búsqueda insensible a tildes y tolerante a una errata en palabras largas. */
export function search(query: string, limit = 24): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(' ').filter(Boolean);
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of buildIndex()) {
    let score = 0;
    let ok = true;
    const words = item.haystack.split(' ');
    for (const t of tokens) {
      if (item.haystack.includes(t)) {
        score += words.some((w) => w.startsWith(t)) ? 3 : 2;
        if (normalize(item.title).includes(t)) score += 3;
      } else if (t.length >= 5 && words.some((w) => editDistanceAtMostOne(t, w.slice(0, t.length + 1)) || editDistanceAtMostOne(t, w))) {
        score += 1;
      } else {
        ok = false;
        break;
      }
    }
    if (ok) scored.push({ item, score: score + item.weight * 0.1 });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item);
}

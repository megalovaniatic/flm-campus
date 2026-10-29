import { useMemo } from 'react';
import { AREAS, areaName, can, CREATABLE_TYPES, normalize, plainText, type CampusEvent, type ContentType, type Formation, type LibraryDocument, type NewsItem, type Reading, type Role } from '@flm/shared';
import { readings, useDocuments, useEvents, useFormations, useMe, useNews } from '@/data/selectors';

export type ResultGroup = 'Crear' | 'Formaciones' | 'Actualidad' | 'Notas informativas' | 'Lecturas' | 'Agenda' | 'Secciones';

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
  ['Gestión de contenidos', 'Crear, publicar y archivar', '/gestion'],
  ['Sobre el campus', 'Concepto, sistema de diseño y accesibilidad', '/sobre'],
];

/** Acciones «Crear…» del mando (Ctrl K). La evaluación del área se elige desde «Crear contenido». */
const CREATE_ACTIONS: { type: ContentType; title: string; subtitle: string; words: string }[] = [
  { type: 'formacion', title: 'Crear una formación', subtitle: 'Aparece en Aprender', words: 'nueva formacion curso apartados test final' },
  { type: 'noticia', title: 'Crear una noticia', subtitle: 'Aparece en Consultar › Actualidad', words: 'nueva noticia novedad actualidad aviso' },
  { type: 'documento', title: 'Crear un documento', subtitle: 'Aparece en Consultar › Notas informativas', words: 'nuevo documento pdf nota informativa' },
  { type: 'evento', title: 'Crear un evento', subtitle: 'Aparece en Participar › Agenda', words: 'nuevo evento sesion desayuno encuentro agenda' },
  { type: 'comunicado', title: 'Crear un comunicado', subtitle: 'Aparece en Participar › Agenda', words: 'nuevo comunicado aviso firma' },
  { type: 'cliente', title: 'Anunciar un cliente nuevo', subtitle: 'Aparece en Inicio › Ponte al día', words: 'crear nuevo cliente empresa ponte al dia' },
  { type: 'bienvenida', title: 'Dar la bienvenida a alguien', subtitle: 'Aparece en Inicio › Ponte al día', words: 'crear bienvenida incorporacion persona equipo ponte al dia' },
];

export interface IndexData {
  formations: readonly Formation[];
  news: readonly NewsItem[];
  documents: readonly LibraryDocument[];
  events: readonly CampusEvent[];
  readings: readonly Reading[];
  /** Rol con el que se usa el campus: decide las acciones «Crear…». */
  role: Role | null;
}

/** Índice local (en el navegador), con lo publicado en este momento: sin servidor y en menos de 50 ms. */
export function buildIndex(data: IndexData): SearchItem[] {
  const items: SearchItem[] = [];
  if (data.role && can(data.role, 'contenido:crear')) {
    items.push({ id: 'crear', group: 'Crear', title: 'Crear contenido', subtitle: 'Elige el tipo: formación, noticia, evento, cliente…', href: '/gestion/nuevo', haystack: normalize('crear contenido nuevo nueva publicar borrador'), weight: 7 });
    for (const a of CREATE_ACTIONS) {
      if (!CREATABLE_TYPES[data.role].includes(a.type)) continue;
      items.push({ id: `crear-${a.type}`, group: 'Crear', title: a.title, subtitle: a.subtitle, href: `/gestion/nuevo/${a.type}`, haystack: normalize(`crear ${a.title} ${a.words}`), weight: 7 });
    }
  }
  for (const f of data.formations) {
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
  for (const n of data.news) {
    items.push({ id: n.id, group: 'Actualidad', title: n.headline, subtitle: `${areaName(n.area)} · ${n.date}`, href: `/consultar/actualidad/${n.slug}`, haystack: normalize([n.headline, plainText(n.oneLiner), n.source.label].join(' ')), weight: 4 });
  }
  for (const d of data.documents) {
    items.push({ id: d.id, group: 'Notas informativas', title: d.title, subtitle: d.issuer, href: `/consultar/notas/${d.id}`, haystack: normalize([d.title, d.summary, d.issuer, ...d.tags].join(' ')), weight: 3 });
  }
  for (const r of data.readings) {
    items.push({ id: r.id, group: 'Lecturas', title: r.title, subtitle: `${r.authors} · ${r.edition}`, href: `/consultar/lecturas/${r.id}`, haystack: normalize([r.title, r.authors, r.publisher, r.summary].join(' ')), weight: 2 });
  }
  for (const e of data.events) {
    items.push({ id: e.id, group: 'Agenda', title: e.title, subtitle: e.kind === 'comunicado' ? 'Comunicado' : 'Evento', href: `/participar/agenda/${e.slug}`, haystack: normalize([e.title, e.summary].join(' ')), weight: 3 });
  }
  for (const [title, subtitle, href] of PAGES) items.push({ id: href, group: 'Secciones', title, subtitle, href, haystack: normalize(`${title} ${subtitle}`), weight: 6 });
  return items;
}

/** Índice con el contenido publicado ahora (también lo creado en la demo) y las acciones de la persona. */
export function useSearchIndex(): SearchItem[] {
  const formations = useFormations();
  const news = useNews();
  const documents = useDocuments();
  const events = useEvents();
  const me = useMe();
  const role = me?.effectiveRole ?? null;
  return useMemo(() => buildIndex({ formations, news, documents, events, readings, role }), [formations, news, documents, events, role]);
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
export function search(query: string, index: readonly SearchItem[], limit = 24): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(' ').filter(Boolean);
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of index) {
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

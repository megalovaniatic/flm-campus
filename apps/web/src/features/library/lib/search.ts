/**
 * Búsqueda local de la biblioteca.
 * Usa `normalize` del paquete compartido (minúsculas, sin tildes, ñ conservada) y además
 * descarta la puntuación, para que «verifactu» encuentre «VERI*FACTU» y «v5484» encuentre «V5484-26».
 * Todas las palabras deben aparecer (Y lógico); tolera una errata en palabras largas.
 */
import { AREAS, normalize, plainText, type LibraryDocument, type NewsItem, type Person, type Reading } from '@flm/shared';
import { areaLabel, DOC_KIND, NEWS_KIND } from './labels';

const WORD = /[\p{L}\p{N}]/u;
const SPACE = /\s/;
const STOP = new Set(['a', 'al', 'con', 'de', 'del', 'e', 'el', 'en', 'la', 'las', 'lo', 'los', 'o', 'para', 'por', 'que', 'se', 'su', 'sus', 'u', 'un', 'una', 'y']);

function foldChar(ch: string): string {
  if (SPACE.test(ch)) return ' ';
  let out = '';
  for (const c of normalize(ch)) if (WORD.test(c)) out += c;
  return out;
}

/** Texto plegado y, para cada carácter plegado, su posición en el original (para resaltar). */
export function foldWithMap(text: string): { text: string; map: number[] } {
  let out = '';
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const f = foldChar(text[i]!);
    for (let k = 0; k < f.length; k++) {
      out += f[k];
      map.push(i);
    }
  }
  return { text: out, map };
}

export function foldText(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) out += foldChar(text[i]!);
  return out;
}

/** Palabras útiles de la consulta (sin artículos ni preposiciones, salvo que no quede otra cosa). */
export function queryTokens(query: string): string[] {
  const all = foldText(query).split(' ').filter(Boolean);
  const useful = all.filter((t) => !STOP.has(t));
  return useful.length ? useful : all;
}

export interface SearchField {
  /** Texto ya plegado con `foldText`. */
  text: string;
  weight: number;
}

function withinOneEdit(a: string, b: string): boolean {
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

function fuzzy(token: string, text: string): boolean {
  for (const w of text.split(' ')) {
    if (w.length < token.length - 1) continue;
    if (withinOneEdit(token, w) || withinOneEdit(token, w.slice(0, token.length)) || withinOneEdit(token, w.slice(0, token.length + 1))) return true;
  }
  return false;
}

/** Las palabras cortas («IVA», «IS», «147») solo cuentan al principio de una palabra: «iva» no está en «informativa». */
const SHORT = 3;

const atWordStart = (text: string, i: number) => i === 0 || text[i - 1] === ' ';

/** Posiciones válidas de una palabra buscada dentro de un texto plegado. */
function occurrences(text: string, token: string): number[] {
  const found: number[] = [];
  for (let i = text.indexOf(token); i >= 0; i = text.indexOf(token, i + 1)) {
    if (token.length > SHORT || atWordStart(text, i)) found.push(i);
  }
  return found;
}

/** Puntuación de un elemento (0 = no coincide). */
export function scoreFields(fields: SearchField[], tokens: string[]): number {
  if (!tokens.length) return 0;
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const f of fields) {
      const hits = occurrences(f.text, t);
      if (hits.length) best = Math.max(best, f.weight * (hits.some((i) => atWordStart(f.text, i)) ? 1.4 : 1));
    }
    if (best === 0 && t.length >= 5) {
      for (const f of fields) if (fuzzy(t, f.text)) best = Math.max(best, f.weight * 0.45);
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

export interface Indexed<T> {
  item: T;
  fields: SearchField[];
}

export interface Hit<T> {
  item: T;
  score: number;
}

/** Ordena por relevancia (a igualdad, conserva el orden de entrada: el más reciente primero). */
export function rank<T>(entries: Indexed<T>[], tokens: string[]): Hit<T>[] {
  const hits: (Hit<T> & { i: number })[] = [];
  entries.forEach((e, i) => {
    const score = scoreFields(e.fields, tokens);
    if (score > 0) hits.push({ item: e.item, score, i });
  });
  return hits.sort((a, b) => b.score - a.score || a.i - b.i).map(({ item, score }) => ({ item, score }));
}

const field = (text: string, weight: number): SearchField => ({ text: foldText(text), weight });

export function newsFields(n: NewsItem, author?: Person): SearchField[] {
  return [
    field(n.headline, 5),
    field(plainText(n.oneLiner), 2.5),
    field([n.source.label, AREAS[n.area].name, NEWS_KIND[n.kind].label].join(' '), 2),
    field([plainText(n.affects), plainText(n.action), plainText(n.example), plainText(n.nuance ?? ''), author?.name ?? ''].join(' '), 1),
  ];
}

export function docFields(d: LibraryDocument): SearchField[] {
  return [field(d.title, 5), field(d.tags.join(' '), 3), field([d.issuer, areaLabel(d.area), DOC_KIND[d.kind].label].join(' '), 2), field(d.summary, 1)];
}

export function readingFields(r: Reading): SearchField[] {
  return [field(r.title, 5), field([r.authors, r.publisher].join(' '), 3), field(AREAS[r.area].name, 2), field([r.summary, r.practicalValue, r.audience].join(' '), 1)];
}

/** Tramos [inicio, fin) del texto original que coinciden con alguna palabra de la búsqueda. */
export function highlightRanges(text: string, tokens: string[]): [number, number][] {
  const useful = tokens.filter((t) => t.length >= 2);
  if (!useful.length || !text) return [];
  const { text: folded, map } = foldWithMap(text);
  const ranges: [number, number][] = [];
  for (const t of useful) {
    for (const i of occurrences(folded, t)) ranges.push([map[i]!, map[i + t.length - 1]! + 1]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

/** Fragmento de un texto largo centrado en la primera coincidencia. */
export function excerpt(text: string, tokens: string[], max = 160): string {
  if (text.length <= max) return text;
  const cutEnd = (end: number) => {
    const space = text.lastIndexOf(' ', end);
    return space > end * 0.6 ? space : end;
  };
  const { text: folded, map } = foldWithMap(text);
  let pos = -1;
  for (const t of tokens) {
    const i = occurrences(folded, t)[0];
    if (i !== undefined && (pos < 0 || map[i]! < pos)) pos = map[i]!;
  }
  if (pos < max * 0.55) return `${text.slice(0, cutEnd(max)).trim()}…`;
  let start = pos - Math.round(max * 0.35);
  const before = text.lastIndexOf(' ', start);
  if (before > 0 && start - before < 24) start = before + 1;
  let end = Math.min(text.length, start + max);
  if (end < text.length) end = Math.max(start + 1, cutEnd(end));
  return `…${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

/**
 * Calendario de FLM: textos y agrupaciones de las entradas (encuentros de equipo, festivos, cumpleaños
 * y aniversarios en FLM). Los festivos se rotulan siempre «Festivo». Cumpleaños y aniversarios no se
 * guardan: salen del perfil de cada persona activa (`personalEntries`, en @flm/shared).
 */
import { CALENDAR_KINDS, entriesForMonth, type CalendarEntry, type CalendarKind, type CalendarSources } from '@flm/shared';
import { listJoin } from './eventView';

export const KIND_ORDER: CalendarKind[] = ['encuentro', 'festivo', 'cumpleanos', 'aniversario'];

export const kindLabel = (k: CalendarKind) => CALENDAR_KINDS[k].label;

/** «Festivo» o «Festivo · Vic» cuando no aplica a todas las sedes. */
export function festivoLabel(e: CalendarEntry): string {
  return e.offices && e.offices.length ? `Festivo · ${listJoin(e.offices)}` : 'Festivo';
}

/** Nombre de la persona de un cumpleaños o un aniversario («Cumpleaños de Judith Calet» → «Judith Calet»). */
export function personOf(e: CalendarEntry): string {
  if (e.kind === 'cumpleanos') return e.title.replace(/^Cumpleaños de /, '');
  if (e.kind === 'aniversario') return e.title.replace(/^Aniversario de /, '').replace(/ en FLM$/, '');
  return e.title;
}

/** «1 año» o «4 años» en FLM. */
const yearsLabel = (n: number) => `${n} ${n === 1 ? 'año' : 'años'}`;

/** Rótulo breve para la celda del mes (el icono y el color dicen el tipo; el nombre accesible, todo). */
export function shortTitle(e: CalendarEntry): string {
  switch (e.kind) {
    case 'festivo':
      return festivoLabel(e);
    case 'cumpleanos':
      return personOf(e);
    case 'aniversario':
      return e.years ? `${personOf(e)} · ${yearsLabel(e.years)}` : personOf(e);
    default:
      return e.title;
  }
}

/** Texto completo de una entrada (lectores de pantalla y resúmenes). */
export function entrySentence(e: CalendarEntry): string {
  switch (e.kind) {
    case 'encuentro':
      return `Encuentro de equipo: ${e.title}${e.detail && e.detail !== e.title && e.detail.length < 60 ? `, ${e.detail}` : ''}${e.time ? `, a las ${e.time}` : ''}`;
    case 'festivo':
      return `${e.offices && e.offices.length ? `Festivo en ${listJoin(e.offices)}` : 'Festivo'}${e.detail ? `: ${e.detail}` : ''}`;
    case 'cumpleanos':
      return `${e.title}${e.detail ? `, ${e.detail}` : ''}`;
    case 'aniversario':
      return `${e.title}${e.detail ? `: ${e.detail.replace(' · ', ', ')}` : ''}`;
    default:
      return e.title;
  }
}

export function countLabel(n: number): string {
  return n === 0 ? 'sin entradas' : n === 1 ? '1 entrada' : `${n} entradas`;
}

/** Recuento por tipo de las entradas de unos días (los filtros muestran cuántas hay de cada tipo en el mes). */
export function countByKind(lists: Iterable<readonly CalendarEntry[]>): Record<CalendarKind, number> {
  const c = Object.fromEntries(KIND_ORDER.map((k) => [k, 0])) as Record<CalendarKind, number>;
  for (const list of lists) for (const e of list) c[e.kind] += 1;
  return c;
}

/** Índice día → entradas para los meses indicados (y, m). */
export function indexMonths(months: { y: number; m: number }[], sources: CalendarSources): Map<string, CalendarEntry[]> {
  const map = new Map<string, CalendarEntry[]>();
  for (const { y, m } of months) {
    for (const e of entriesForMonth(y, m, sources)) {
      const list = map.get(e.date);
      if (list) list.push(e);
      else map.set(e.date, [e]);
    }
  }
  return map;
}

export function shiftMonth(y: number, m: number, delta: number): { y: number; m: number } {
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
}

/**
 * Calendario de FLM: textos y agrupaciones de las entradas (encuentros de equipo y
 * festivos). Los festivos se rotulan siempre «Festivo».
 */
import { CALENDAR_KINDS, entriesForMonth, type CalendarEntry, type CalendarKind, type CalendarSources } from '@flm/shared';
import { listJoin } from './eventView';

export const KIND_ORDER: CalendarKind[] = ['encuentro', 'festivo'];

export const kindLabel = (k: CalendarKind) => CALENDAR_KINDS[k].label;

/** «Festivo» o «Festivo · Vic» cuando no aplica a todas las sedes. */
export function festivoLabel(e: CalendarEntry): string {
  return e.offices && e.offices.length ? `Festivo · ${listJoin(e.offices)}` : 'Festivo';
}

/** Rótulo breve para la celda del mes. */
export function shortTitle(e: CalendarEntry): string {
  return e.kind === 'festivo' ? festivoLabel(e) : e.title;
}

/** Texto completo de una entrada (lectores de pantalla y resúmenes). */
export function entrySentence(e: CalendarEntry): string {
  switch (e.kind) {
    case 'encuentro':
      return `Encuentro de equipo: ${e.title}${e.detail && e.detail !== e.title && e.detail.length < 60 ? `, ${e.detail}` : ''}${e.time ? `, a las ${e.time}` : ''}`;
    case 'festivo':
      return `${e.offices && e.offices.length ? `Festivo en ${listJoin(e.offices)}` : 'Festivo'}${e.detail ? `: ${e.detail}` : ''}`;
  }
}

export function countLabel(n: number): string {
  return n === 0 ? 'sin entradas' : n === 1 ? '1 entrada' : `${n} entradas`;
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

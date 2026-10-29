import { daysInMonth, madridDateKey, timeOf } from './dates';
import { sessionStart } from './events';
import { personalEntries } from './personalDates';
import type { CalendarEntry, CalendarKind, CampusEvent, Holiday, Person } from './types';

export const CALENDAR_KINDS: Record<CalendarKind, { label: string; plural: string }> = {
  encuentro: { label: 'Encuentro de equipo', plural: 'Encuentros de equipo' },
  festivo: { label: 'Festivo', plural: 'Festivos' },
  cumpleanos: { label: 'Cumpleaños', plural: 'Cumpleaños' },
  aniversario: { label: 'Aniversario en FLM', plural: 'Aniversarios en FLM' },
};

const pad = (n: number) => String(n).padStart(2, '0');

export interface CalendarSources {
  holidays: Holiday[];
  /** Eventos de categoría «encuentro» (u otros que deban figurar en el calendario). */
  events: CampusEvent[];
  /** Personas del campus: sus cumpleaños y aniversarios se calculan desde su perfil (solo las activas). */
  people?: readonly Person[];
}

/**
 * Entradas del calendario para un mes: festivos, encuentros de equipo y, si se pasan las personas,
 * sus cumpleaños y aniversarios de incorporación.
 * - Los festivos se muestran siempre como «Festivo».
 * - Cumpleaños y aniversarios no se guardan: salen del perfil y cambian con él (personalDates.ts).
 */
export function entriesForMonth(year: number, month: number, src: CalendarSources): CalendarEntry[] {
  const out: CalendarEntry[] = [];
  const prefix = `${year}-${pad(month)}`;

  for (const h of src.holidays) {
    if (h.date.startsWith(prefix)) {
      out.push({ id: `festivo-${h.date}-${h.offices.join('-') || 'todas'}`, date: h.date, kind: 'festivo', title: 'Festivo', detail: h.name, offices: h.offices });
    }
  }

  for (const ev of src.events) {
    if (ev.archived) continue;
    ev.sessions.forEach((s, i) => {
      const date = madridDateKey(sessionStart(s));
      if (!date.startsWith(prefix)) return;
      out.push({
        id: `enc-${ev.id}-${i}`,
        date,
        kind: 'encuentro',
        title: ev.title,
        detail: s.label ?? ev.summary,
        eventId: ev.id,
        time: timeOf(s.start),
      });
    });
  }

  if (src.people) out.push(...personalEntries(src.people, year, month));

  const order: CalendarKind[] = ['festivo', 'encuentro', 'cumpleanos', 'aniversario'];
  return out.sort((a, b) => a.date.localeCompare(b.date) || order.indexOf(a.kind) - order.indexOf(b.kind) || a.title.localeCompare(b.title, 'es'));
}

/** Cuadrícula del mes empezando en lunes: 5 o 6 semanas con claves «AAAA-MM-DD» o null. */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (first + 6) % 7;
  const total = daysInMonth(year, month);
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= total; d++) cells.push(`${year}-${pad(month)}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

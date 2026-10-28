import { daysInMonth, isLeapYear, madridDateKey, timeOf } from './dates';
import { sessionStart } from './events';
import type { CalendarEntry, CalendarKind, CampusEvent, Holiday, Person } from './types';

export const CALENDAR_KINDS: Record<CalendarKind, { label: string; plural: string }> = {
  cumpleanos: { label: 'Cumpleaños', plural: 'Cumpleaños' },
  aniversario: { label: 'Aniversario FLM', plural: 'Aniversarios FLM' },
  encuentro: { label: 'Encuentro de equipo', plural: 'Encuentros de equipo' },
  festivo: { label: 'Festivo', plural: 'Festivos' },
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Cumpleaños de 29 de febrero: en años no bisiestos se muestran el 28. */
function birthdayInYear(mmdd: string, year: number): string {
  if (mmdd === '02-29' && !isLeapYear(year)) return `${year}-02-28`;
  return `${year}-${mmdd}`;
}

export interface CalendarSources {
  people: Person[];
  holidays: Holiday[];
  /** Eventos de categoría «encuentro» (u otros que deban figurar en el calendario). */
  events: CampusEvent[];
}

/**
 * Entradas del calendario para un mes.
 * - Los aniversarios se generan desde la fecha de incorporación del perfil.
 * - Los cumpleaños solo aparecen si la persona lo ha aceptado.
 * - Los festivos se muestran siempre como «Festivo».
 */
export function entriesForMonth(year: number, month: number, src: CalendarSources): CalendarEntry[] {
  const out: CalendarEntry[] = [];
  const prefix = `${year}-${pad(month)}`;

  for (const p of src.people) {
    if (p.status !== 'activa') continue;
    if (p.birthday && p.showBirthday) {
      const date = birthdayInYear(p.birthday, year);
      if (date.startsWith(prefix)) {
        out.push({ id: `cumple-${p.id}-${year}`, date, kind: 'cumpleanos', title: p.name, detail: p.position, personId: p.id });
      }
    }
    if (!p.startDate) continue;
    const startYear = Number(p.startDate.slice(0, 4));
    const years = year - startYear;
    if (years >= 1) {
      const date = birthdayInYear(p.startDate.slice(5), year);
      if (date.startsWith(prefix)) {
        out.push({
          id: `aniv-${p.id}-${year}`,
          date,
          kind: 'aniversario',
          title: p.name,
          detail: `${years} ${years === 1 ? 'año' : 'años'} en FLM`,
          personId: p.id,
          years,
        });
      }
    }
  }

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

  const order: CalendarKind[] = ['festivo', 'encuentro', 'aniversario', 'cumpleanos'];
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

/**
 * Cumpleaños y aniversarios de incorporación del calendario de empresa.
 *
 * No se guardan como eventos: se calculan cada vez a partir del perfil de cada persona activa.
 * Así se actualizan solos al cambiar el perfil y nunca hay duplicados (una entrada por persona,
 * tipo y año). El cumpleaños es solo día y mes, sin año de nacimiento.
 */
import { daysInMonth, formatLongDate, isLeapYear, monthName } from './dates';
import type { CalendarEntry, Person } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/** Datos del perfil que alimentan el calendario de empresa. */
export type PersonalDateField = 'birthday' | 'startDate';

/** «MM-DD» que existe en algún año (el 29 de febrero, también). */
export function isValidBirthday(value: string | undefined | null): value is string {
  const m = /^(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!m) return false;
  const month = Number(m[1]);
  const day = Number(m[2]);
  // 2024 es bisiesto: admite el 29 de febrero
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(2024, month);
}

/** «AAAA-MM-DD» que existe en el calendario. */
export function isValidDateKey(value: string | undefined | null): value is string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!m) return false;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  return year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

/** «MM-DD» a partir del día y el mes. */
export function birthdayKey(day: number, month: number): string {
  return `${pad(month)}-${pad(day)}`;
}

/** «26 de noviembre». */
export function birthdayLabel(birthday: string): string {
  const [month, day] = birthday.split('-').map(Number);
  return `${day} de ${monthName(month ?? 0)}`;
}

/** Fecha en que se celebra cada año un día y mes («MM-DD»): el 29 de febrero, el 28 en los años no bisiestos. */
export function yearlyDate(monthDay: string, year: number): string {
  const [month, day] = monthDay.split('-').map(Number) as [number, number];
  const celebrated = month === 2 && day === 29 && !isLeapYear(year) ? 28 : day;
  return `${year}-${pad(month)}-${pad(celebrated)}`;
}

/**
 * Último día admitido como fecha de incorporación: un año después de `today` («AAAA-MM-DD»). Admite
 * las altas previstas y frena las erratas (2062 por 2026). La web y la API aplican el mismo tope.
 */
export function latestStartDate(today: string): string {
  return yearlyDate(today.slice(5), Number(today.slice(0, 4)) + 1);
}

/** Problema de una fecha de incorporación posterior a `latestStartDate(today)`, o null si está dentro del tope. */
export function startDateLimitIssue(startDate: string, today: string): string | null {
  const latest = latestStartDate(today);
  return startDate > latest ? `La fecha de incorporación no puede ser posterior al ${formatLongDate(latest)}.` : null;
}

/** Años en FLM que se cumplen en `year`; 0 el mismo año de la incorporación. */
export function anniversaryYears(startDate: string, year: number): number {
  return year - Number(startDate.slice(0, 4));
}

/** Datos del calendario que le faltan a un perfil, para pedir que se completen sin bloquear su acceso. */
export function missingPersonalDates(person: Pick<Person, 'birthday' | 'startDate'>): PersonalDateField[] {
  const missing: PersonalDateField[] = [];
  if (!isValidBirthday(person.birthday)) missing.push('birthday');
  if (!isValidDateKey(person.startDate)) missing.push('startDate');
  return missing;
}

/**
 * Cumpleaños y aniversarios de un mes, generados a partir de los perfiles activos.
 * - Cumpleaños: cada año en su día; el 29 de febrero, el 28 en los años no bisiestos.
 * - Aniversario: cada año desde el primero tras la incorporación (1 de septiembre de 2026 → 1 de septiembre de 2027).
 * Las personas inactivas o sin el dato no generan entrada. Una persona repetida en la lista cuenta una vez.
 */
export function personalEntries(people: readonly Person[], year: number, month: number): CalendarEntry[] {
  const out = new Map<string, CalendarEntry>();
  for (const p of people) {
    if (p.status !== 'activa') continue;
    if (isValidBirthday(p.birthday) && Number(p.birthday.slice(0, 2)) === month) {
      const id = `cumple-${p.id}-${year}`;
      out.set(id, { id, date: yearlyDate(p.birthday, year), kind: 'cumpleanos', title: `Cumpleaños de ${p.name}`, detail: p.position, personId: p.id });
    }
    if (isValidDateKey(p.startDate) && Number(p.startDate.slice(5, 7)) === month) {
      const years = anniversaryYears(p.startDate, year);
      if (years >= 1) {
        const id = `aniv-${p.id}-${year}`;
        out.set(id, {
          id,
          date: yearlyDate(p.startDate.slice(5), year),
          kind: 'aniversario',
          title: `Aniversario de ${p.name} en FLM`,
          detail: `${years} ${years === 1 ? 'año' : 'años'} en FLM · desde el ${formatLongDate(p.startDate)}`,
          personId: p.id,
          years,
        });
      }
    }
  }
  return [...out.values()];
}

/**
 * Utilidades de fecha con la zona horaria Europe/Madrid.
 * Todas las fechas «locales» del campus se interpretan en hora de Madrid,
 * con independencia de la zona del navegador o del servidor.
 */
export const TZ = 'Europe/Madrid';
export const LOCALE = 'es-ES';

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const partsFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** Hora de reloj en Madrid para un instante dado. */
export function madridParts(date: Date): WallClock {
  const parts: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Desfase de Madrid respecto a UTC, en minutos, para un instante dado. */
function offsetMinutes(date: Date): number {
  const p = madridParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** «AAAA-MM-DD» del instante en Madrid. */
export function madridDateKey(date: Date = new Date()): string {
  const p = madridParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Convierte una hora local de Madrid («AAAA-MM-DD» o «AAAA-MM-DDTHH:mm») en un instante UTC. */
export function fromMadrid(local: string, endOfDay = false): Date {
  const [datePart = '', timePart] = local.split('T');
  const [y, m, d] = datePart.split('-').map(Number) as [number, number, number];
  let hh = 0;
  let mm = 0;
  let ss = 0;
  if (timePart) {
    const [h, mi] = timePart.split(':').map(Number);
    hh = h ?? 0;
    mm = mi ?? 0;
  } else if (endOfDay) {
    hh = 23;
    mm = 59;
    ss = 59;
  }
  const guess = Date.UTC(y, m - 1, d, hh, mm, ss);
  const first = offsetMinutes(new Date(guess));
  let ts = guess - first * 60000;
  const second = offsetMinutes(new Date(ts));
  if (second !== first) ts = guess - second * 60000;
  return new Date(ts);
}

/** Suma días a una clave «AAAA-MM-DD» sin pasar por zonas horarias. */
export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Diferencia en días naturales entre dos claves «AAAA-MM-DD» (b − a). */
export function diffDays(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number) as [number, number, number];
  const [yb, mb, db] = b.split('-').map(Number) as [number, number, number];
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Día de la semana (0 = lunes … 6 = domingo) de una clave «AAAA-MM-DD». */
export function weekdayMondayFirst(key: string): number {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/** Último día de un mes que tiene N meses de distancia (para plazos «de mes a mes»). */
export function addMonthsClamped(key: string, months: number): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const ty = target.getUTCFullYear();
  const tm = target.getUTCMonth() + 1;
  const day = Math.min(d, daysInMonth(ty, tm));
  return `${ty}-${pad(tm)}-${pad(day)}`;
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export const monthName = (month: number) => MONTHS[month - 1] ?? '';
export const monthShort = (month: number) => MONTHS_SHORT[month - 1] ?? '';
export const weekdayName = (index: number) => WEEKDAYS[index] ?? '';

/** «28 de octubre de 2026». */
export function formatLongDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return `${d} de ${monthName(m)} de ${y}`;
}

/** «28 oct 2026». */
export function formatShortDate(key: string, withYear = true): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return withYear ? `${d} ${monthShort(m)} ${y}` : `${d} ${monthShort(m)}`;
}

/** «miércoles, 28 de octubre». */
export function formatWeekdayDate(key: string): string {
  const [, m, d] = key.split('-').map(Number) as [number, number, number];
  return `${weekdayName(weekdayMondayFirst(key))}, ${d} de ${monthName(m)}`;
}

/** «16:30» a partir de «AAAA-MM-DDTHH:mm». */
export function timeOf(local: string): string | undefined {
  const t = local.split('T')[1];
  return t ? t.slice(0, 5) : undefined;
}

/** Fecha relativa breve: «hoy», «mañana», «en 3 días», «hace 2 días». */
export function relativeDay(key: string, today: string = madridDateKey()): string {
  const diff = diffDays(today, key);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  if (diff === -1) return 'ayer';
  if (diff > 1 && diff < 7) return `en ${diff} días`;
  if (diff < -1 && diff > -7) return `hace ${-diff} días`;
  return formatShortDate(key, key.slice(0, 4) !== today.slice(0, 4));
}

import { fromMadrid, madridDateKey } from './dates';
import type { CampusEvent, EventPhase, EventSession } from './types';

/** Instante de inicio de una sesión. */
export function sessionStart(s: EventSession): Date {
  return fromMadrid(s.start);
}

/** Instante de fin de una sesión: su fin explícito o el final del día de inicio. */
export function sessionEnd(s: EventSession): Date {
  if (s.end) return fromMadrid(s.end, true);
  return fromMadrid(s.start.split('T')[0] ?? s.start, true);
}

export function sortedSessions(ev: CampusEvent): EventSession[] {
  return [...ev.sessions].sort((a, b) => sessionStart(a).getTime() - sessionStart(b).getTime());
}

/** Final efectivo del evento: el de su última sesión (eventos de varias sesiones incluidos). */
export function eventEnd(ev: CampusEvent): Date | undefined {
  if (!ev.sessions.length) return undefined;
  return new Date(Math.max(...ev.sessions.map((s) => sessionEnd(s).getTime())));
}

export function eventStart(ev: CampusEvent): Date | undefined {
  if (!ev.sessions.length) return undefined;
  return new Date(Math.min(...ev.sessions.map((s) => sessionStart(s).getTime())));
}

/**
 * Fase de un evento en la zona Europe/Madrid.
 * - Archivado: retirado por administración (no es lo mismo que histórico).
 * - Reclasificación manual: prevalece sobre el cálculo automático.
 * - Sin fecha confirmada: permanece entre los próximos.
 * - Varias sesiones: pasa al histórico tras la última.
 */
export function eventPhase(ev: CampusEvent, now: Date = new Date()): EventPhase {
  if (ev.archived) return 'archivado';
  if (ev.manualPhase) return ev.manualPhase;
  const end = eventEnd(ev);
  const start = eventStart(ev);
  if (!end || !start) return 'proximo';
  if (now.getTime() > end.getTime()) return 'historico';
  if (now.getTime() >= start.getTime()) return 'en-curso';
  return 'proximo';
}

/** Próxima sesión pendiente (o en curso) a partir de ahora. */
export function nextSession(ev: CampusEvent, now: Date = new Date()): EventSession | undefined {
  return sortedSessions(ev).find((s) => sessionEnd(s).getTime() >= now.getTime());
}

export function isPendingDate(ev: CampusEvent): boolean {
  return ev.sessions.length === 0;
}

/** Orden para «Actuales y próximos»: en curso, luego por fecha; los pendientes de fecha al final. */
export function compareUpcoming(a: CampusEvent, b: CampusEvent, now: Date = new Date()): number {
  const na = nextSession(a, now);
  const nb = nextSession(b, now);
  if (!na && !nb) return a.title.localeCompare(b.title, 'es');
  if (!na) return 1;
  if (!nb) return -1;
  return sessionStart(na).getTime() - sessionStart(nb).getTime();
}

/** Orden para el histórico: más reciente primero. */
export function compareHistory(a: CampusEvent, b: CampusEvent): number {
  return (eventEnd(b)?.getTime() ?? 0) - (eventEnd(a)?.getTime() ?? 0);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Exportación a calendario (.ics) con zona Europe/Madrid
 * ──────────────────────────────────────────────────────────────────────────── */

const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Madrid',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const compact = (local: string) => local.replace(/-/g, '').replace(':', '') + (local.includes('T') ? '00' : '');

function foldLine(line: string): string {
  if (line.length <= 74) return line;
  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += 73) chunks.push((i ? ' ' : '') + line.slice(i, i + 73));
  return chunks.join('\r\n');
}

export function eventToIcs(ev: CampusEvent, now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FLM//FLM Campus//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...VTIMEZONE];
  sortedSessions(ev).forEach((s, i) => {
    const allDay = !s.start.includes('T');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}-${i}@campus.flmexperts.com`);
    lines.push(`DTSTAMP:${stamp}`);
    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${compact(s.start)}`);
    } else {
      lines.push(`DTSTART;TZID=Europe/Madrid:${compact(s.start)}`);
      if (s.end) lines.push(`DTEND;TZID=Europe/Madrid:${compact(s.end.includes('T') ? s.end : `${s.end}T23:59`)}`);
    }
    lines.push(`SUMMARY:${icsEscape(s.label ? `${ev.title} · ${s.label}` : ev.title)}`);
    lines.push(`DESCRIPTION:${icsEscape(ev.summary)}`);
    if (s.location) lines.push(`LOCATION:${icsEscape(s.location)}`);
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n');
}

/** Día (AAAA-MM-DD) de cada sesión en Madrid, útil para el calendario. */
export function sessionDays(ev: CampusEvent): string[] {
  return ev.sessions.map((s) => madridDateKey(sessionStart(s)));
}

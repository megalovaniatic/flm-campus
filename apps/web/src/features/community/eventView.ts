/**
 * Presentación de eventos de la agenda: textos de fecha en castellano (zona Europe/Madrid),
 * fase, fecha que se dibuja en el círculo y agrupaciones editoriales.
 */
import {
  compareHistory,
  compareUpcoming,
  eventEnd,
  eventPhase,
  madridDateKey,
  monthName,
  nextSession,
  sessionEnd,
  sortedSessions,
  timeOf,
  weekdayMondayFirst,
  weekdayName,
  type CampusEvent,
  type EventPhase,
  type EventSession,
} from '@flm/shared';

export const CATEGORY_LABEL: Record<CampusEvent['category'], string> = {
  'formacion-interna': 'Formación interna',
  desayuno: 'Desayuno',
  encuentro: 'Encuentro',
  reconocimiento: 'Reconocimiento',
  celebracion: 'Celebración',
  iniciativa: 'Iniciativa',
  comunicacion: 'Comunicación',
};

/** Antetítulo de un evento: categoría y área o equipo (sin repetir «Comunicación · Comunicación»). */
export function eventKicker(ev: CampusEvent): string {
  const category = CATEGORY_LABEL[ev.category];
  const dept = ev.department?.trim();
  return dept && dept.toLowerCase() !== category.toLowerCase() ? `${category} · ${dept}` : category;
}

const dayOf = (local: string) => local.slice(0, 10);

function parts(key: string) {
  const [y = 1970, m = 1, d = 1] = key.split('-').map(Number);
  return { y, m, d };
}

export const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const LIST = new Intl.ListFormat('es', { type: 'conjunction' });
export const listJoin = (items: string[]) => LIST.format(items);

/** «2 de noviembre» (con el año solo si no es el de referencia). */
export function dayMonth(key: string, refYear: number): string {
  const { y, m, d } = parts(key);
  return `${d} de ${monthName(m)}${y !== refYear ? ` de ${y}` : ''}`;
}

/** «lunes, 2 de noviembre». */
export function weekdayDayMonth(key: string, refYear: number): string {
  return `${weekdayName(weekdayMondayFirst(key))}, ${dayMonth(key, refYear)}`;
}

/** «del 2 al 16 de noviembre» · «del 2 de noviembre al 2 de diciembre». */
export function rangeText(a: string, b: string, refYear: number): string {
  const pa = parts(a);
  const pb = parts(b);
  if (pa.y === pb.y && pa.m === pb.m) return `del ${pa.d} al ${pb.d} de ${monthName(pb.m)}${pb.y !== refYear ? ` de ${pb.y}` : ''}`;
  if (pa.y === pb.y) return `del ${pa.d} de ${monthName(pa.m)} al ${dayMonth(b, refYear)}`;
  return `del ${dayMonth(a, -1)} al ${dayMonth(b, -1)}`;
}

export function isMultiDay(s: EventSession): boolean {
  return !!s.end && dayOf(s.end) !== dayOf(s.start);
}

/** Horario de una sesión: «12:00–14:00», «14:00» o nada si dura todo el día. */
export function sessionHours(s: EventSession): string | undefined {
  const start = timeOf(s.start);
  if (!start) return undefined;
  const end = s.end && !isMultiDay(s) ? timeOf(s.end) : undefined;
  return end ? `${start}–${end}` : start;
}

/** «lunes, 2 de noviembre · 12:00–14:00» o «del 27 de octubre al 27 de noviembre». */
export function sessionWhen(s: EventSession, refYear: number): string {
  if (s.end && isMultiDay(s)) return rangeText(dayOf(s.start), dayOf(s.end), refYear);
  const h = sessionHours(s);
  return `${weekdayDayMonth(dayOf(s.start), refYear)}${h ? ` · ${h}` : ''}`;
}

/** «2, 5 y 9 de noviembre y 2 de diciembre» (para describir una serie de sesiones). */
export function daysListText(keys: string[], refYear: number): string {
  const groups: { y: number; m: number; days: string[] }[] = [];
  for (const k of keys) {
    const { y, m, d } = parts(k);
    const last = groups[groups.length - 1];
    if (last && last.y === y && last.m === m) last.days.push(String(d));
    else groups.push({ y, m, days: [String(d)] });
  }
  return listJoin(groups.map((g) => `${listJoin(g.days)} de ${monthName(g.m)}${g.y !== refYear ? ` de ${g.y}` : ''}`));
}

export type SessionState = 'past' | 'next' | 'future';

export function sessionState(s: EventSession, next: EventSession | undefined, now: Date): SessionState {
  if (sessionEnd(s).getTime() < now.getTime()) return 'past';
  return s === next ? 'next' : 'future';
}

export interface EventTiming {
  phase: EventPhase;
  pending: boolean;
  sessions: EventSession[];
  next?: EventSession;
  /** Línea principal: cuándo. */
  when: string;
  /** Línea secundaria: primera o próxima sesión de una serie. */
  nextLine?: string;
  /** Fecha que se dibuja en el círculo y su leyenda («hasta», «hoy», «próxima»). */
  anchor?: { key: string; caption?: string };
  /** Lugares distintos de las sesiones. */
  places: string[];
}

export function eventTiming(ev: CampusEvent, now: Date, today: string): EventTiming {
  const refYear = Number(today.slice(0, 4));
  const phase = eventPhase(ev, now);
  const sessions = sortedSessions(ev);
  const pending = sessions.length === 0;
  const next = nextSession(ev, now);
  const places = [...new Set(sessions.map((s) => s.location).filter((l): l is string => !!l))];
  const first = sessions[0];
  const last = sessions[sessions.length - 1];

  if (!first || !last) {
    return { phase, pending, sessions, next, when: ev.pendingDateNote ?? 'Fecha por confirmar', places };
  }

  if (sessions.length > 1) {
    const endKey = last.end && isMultiDay(last) ? dayOf(last.end) : dayOf(last.start);
    const when = `${sessions.length} sesiones · ${rangeText(dayOf(first.start), endKey, refYear)}`;
    const ref = phase === 'historico' ? last : (next ?? last);
    const started = sessionEnd(first).getTime() < now.getTime() || phase === 'en-curso';
    const nextLine = phase !== 'historico' && next ? `${started ? 'Próxima sesión' : 'Primera sesión'}: ${sessionWhen(next, refYear)}` : undefined;
    const caption = phase === 'historico' ? undefined : dayOf(ref.start) === today ? 'hoy' : started ? 'próxima' : undefined;
    return { phase, pending, sessions, next, when, nextLine, anchor: { key: dayOf(ref.start), caption }, places };
  }

  const when = `${sessionWhen(first, refYear)}${first.label ? ` · ${first.label}` : ''}`;
  let anchor: EventTiming['anchor'] = { key: dayOf(first.start) };
  if (phase === 'en-curso') {
    anchor = first.end && isMultiDay(first) ? { key: dayOf(first.end), caption: 'hasta' } : { key: today, caption: 'hoy' };
  }
  return { phase, pending, sessions, next, when, anchor, places };
}

/** Separa la agenda: actuales y próximos (en curso primero) e histórico (reciente primero). */
export function partitionEvents(events: CampusEvent[], now: Date) {
  const upcoming: CampusEvent[] = [];
  const history: CampusEvent[] = [];
  for (const ev of events) {
    const p = eventPhase(ev, now);
    if (p === 'archivado') continue;
    if (p === 'historico') history.push(ev);
    else upcoming.push(ev);
  }
  const rank = (ev: CampusEvent) => (eventPhase(ev, now) === 'en-curso' ? 0 : 1);
  upcoming.sort((a, b) => rank(a) - rank(b) || compareUpcoming(a, b, now));
  history.sort(compareHistory);
  return { upcoming, history };
}

export interface EventGroup {
  key: string;
  label: string;
  items: CampusEvent[];
}

/** Agrupa «Actuales y próximos»: En curso · un grupo por mes · Fecha por confirmar. */
export function groupUpcoming(list: CampusEvent[], now: Date, today: string): EventGroup[] {
  const refYear = Number(today.slice(0, 4));
  const groups = new Map<string, EventGroup>();
  const add = (key: string, label: string, ev: CampusEvent) => {
    const g = groups.get(key) ?? { key, label, items: [] };
    g.items.push(ev);
    groups.set(key, g);
  };
  for (const ev of list) {
    const t = eventTiming(ev, now, today);
    if (t.phase === 'en-curso') add('en-curso', 'En curso', ev);
    else if (t.pending || !t.anchor) add('pendiente', 'Fecha por confirmar', ev);
    else {
      const { y, m } = parts(t.anchor.key);
      add(`${y}-${String(m).padStart(2, '0')}`, `${capitalize(monthName(m))}${y !== refYear ? ` de ${y}` : ''}`, ev);
    }
  }
  const order = (k: string) => (k === 'en-curso' ? '0' : k === 'pendiente' ? '9' : `1${k}`);
  return [...groups.values()].sort((a, b) => order(a.key).localeCompare(order(b.key)));
}

/** Agrupa el histórico por el mes en que terminó cada evento. */
export function groupHistory(list: CampusEvent[]): EventGroup[] {
  const groups: EventGroup[] = [];
  for (const ev of list) {
    const end = eventEnd(ev);
    const key = end ? madridDateKey(end).slice(0, 7) : 'sin-fecha';
    const { y, m } = parts(`${key}-01`);
    const label = end ? `${capitalize(monthName(m))} de ${y}` : 'Sin fecha';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(ev);
    else groups.push({ key, label, items: [ev] });
  }
  return groups;
}

/** Enlace absoluto a un evento de la agenda (para compartir). */
export function eventUrl(slug: string): string {
  return `${window.location.origin}${window.location.pathname}#/participar/agenda/${slug}`;
}

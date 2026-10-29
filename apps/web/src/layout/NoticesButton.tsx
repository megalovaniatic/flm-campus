import { Bell, CalendarClock, GraduationCap, Newspaper } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { diffDays, eventPhase, formatShortDate, madridDateKey, nextSession, sessionStart, timeOf, formationStatus } from '@flm/shared';
import { Popover } from '@/design';
import { assignments, useEvents, useFormations, useMe, useNews } from '@/data/selectors';
import { useDemo } from '@/data/store';
import styles from './NoticesButton.module.css';

interface Notice {
  id: string;
  icon: typeof Bell;
  title: string;
  body: string;
  href: string;
}

/** Avisos calculados a partir de datos reales: obligatorias, agenda y novedades del área. */
export function useNotices(): Notice[] {
  const me = useMe();
  const formations = useFormations();
  const progress = useDemo((s) => s.progress);
  const events = useEvents();
  const news = useNews();
  return useMemo(() => {
    if (!me) return [];
    const today = madridDateKey();
    const out: Notice[] = [];
    const left = (days: number) => (days === 0 ? ' (vence hoy)' : days === 1 ? ' (queda 1 día)' : ` (quedan ${days} días)`);
    // La obligatoria que vence antes, primero.
    for (const a of [...assignments].sort((x, y) => (x.dueDate ?? '9999').localeCompare(y.dueDate ?? '9999'))) {
      if (a.target.kind === 'persona' && a.target.personId !== me.id) continue;
      const f = formations.find((x) => x.id === a.formationId);
      if (!f || formationStatus(progress[f.id], f) === 'completada') continue;
      const days = a.dueDate ? diffDays(today, a.dueDate) : undefined;
      out.push({
        id: `as-${a.id}`,
        icon: GraduationCap,
        title: `Formación obligatoria: ${f.title}`,
        body: a.dueDate ? `Complétala antes del ${formatShortDate(a.dueDate, false)}${days !== undefined && days >= 0 ? left(days) : ''}.` : 'Asignada por administración.',
        href: `/aprender/${f.area}/${f.slug}`,
      });
    }
    for (const ev of events) {
      if (eventPhase(ev) === 'historico') continue;
      const s = nextSession(ev);
      if (!s) continue;
      const day = madridDateKey(sessionStart(s));
      const d = diffDays(today, day);
      if (d >= 0 && d <= 7) {
        out.push({
          id: `ev-${ev.id}-${day}`,
          icon: CalendarClock,
          title: s.label ? `${ev.title} · ${s.label}` : ev.title,
          body: `${d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : formatShortDate(day, false)}${timeOf(s.start) ? `, a las ${timeOf(s.start)}` : ''}.`,
          href: `/participar/agenda/${ev.slug}`,
        });
      }
    }
    const areaNews = news.filter((n) => n.area === 'general' || n.area.toLowerCase() === me.department.toLowerCase()).slice(0, 2);
    for (const n of areaNews) {
      out.push({ id: `news-${n.id}`, icon: Newspaper, title: n.headline, body: `Novedad de tu área · ${formatShortDate(n.date)}`, href: `/consultar/actualidad/${n.slug}` });
    }
    return out;
  }, [me, formations, progress, events, news]);
}

export function NoticesButton() {
  const notices = useNotices();
  const count = notices.length;
  return (
    <Popover
      label={count ? `Avisos (${count})` : 'Avisos'}
      width={360}
      triggerClassName={styles.trigger}
      trigger={
        <>
          <Bell size={20} aria-hidden="true" />
          {count > 0 && (
            <span className={styles.badge} aria-hidden="true">
              {count}
            </span>
          )}
        </>
      }
    >
      {(close) => (
        <div>
          <p className={styles.head}>Avisos</p>
          {notices.length === 0 ? (
            <p className={styles.empty}>No tienes avisos pendientes. Todo al día.</p>
          ) : (
            <ul role="list" className={styles.list}>
              {notices.map((n) => (
                <li key={n.id}>
                  <Link to={n.href} onClick={close} className={styles.item}>
                    <span className={styles.icon} aria-hidden="true">
                      <n.icon size={18} />
                    </span>
                    <span>
                      <span className={styles.title}>{n.title}</span>
                      <span className="sr-only">. </span>
                      <span className={styles.body}>{n.body}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Popover>
  );
}

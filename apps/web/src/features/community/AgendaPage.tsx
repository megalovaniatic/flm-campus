import { AnimatePresence, motion } from 'motion/react';
import { CalendarCheck, CalendarDays, CalendarX, Clock3 } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { eventPhase } from '@flm/shared';
import { ButtonLink, EmptyState, Notice, PageHeader, Tabs } from '@/design';
import { useEvents } from '@/data/selectors';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { AgendaEntry } from './AgendaEntry';
import { groupHistory, groupUpcoming, nextFeaturedEvent, partitionEvents } from './eventView';
import { HistoryList } from './HistoryList';
import { useNow, useToday } from './hooks';
import styles from './Agenda.module.css';

type View = 'actuales' | 'historico';

/** Agenda de FLM: «Actuales y próximos» (agenda editorial) e «Histórico» (por meses). */
export default function AgendaPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const events = useEvents();
  const today = useToday();
  const now = useNow(today);
  const reduce = useReducedMotionPref();
  const panelId = useId();

  const { upcoming, history } = useMemo(() => partitionEvents(events, now), [events, now]);
  const upcomingGroups = useMemo(() => groupUpcoming(upcoming, now, today), [upcoming, now, today]);
  const historyGroups = useMemo(() => groupHistory(history), [history]);
  // La siguiente entrada es el foco claro de la agenda (el «En curso» conserva su círculo lleno)
  const featured = nextFeaturedEvent(upcoming, now);

  const found = slug ? events.find((e) => e.slug === slug) : undefined;
  const target = found && eventPhase(found, now) !== 'archivado' ? found : undefined;
  const targetIsHistory = !!target && eventPhase(target, now) === 'historico';
  const missing = !!slug && !target;

  const [view, setView] = useState<View>(() => (targetIsHistory || (!target && params.get('vista') === 'historico') ? 'historico' : 'actuales'));
  const [open, setOpen] = useState<Set<string>>(() => new Set(target && !targetIsHistory ? [target.id] : []));

  usePageTitle(target ? target.title : 'Agenda');

  // Un enlace nuevo (buscador, inicio) con la página ya abierta: despliega ese evento.
  const lastSlug = useRef(slug);
  useEffect(() => {
    if (slug === lastSlug.current) return;
    lastSlug.current = slug;
    if (!target) return;
    setView(targetIsHistory ? 'historico' : 'actuales');
    if (!targetIsHistory) setOpen((s) => new Set(s).add(target.id));
  }, [slug, target, targetIsHistory]);

  // Lleva el evento enlazado a la vista y deja el foco en su título.
  useEffect(() => {
    if (!target) return;
    let tries = 0;
    let timer = 0;
    const seek = () => {
      const el = document.getElementById(`evento-${target.slug}`);
      if (!el) {
        if (tries++ < 12) timer = window.setTimeout(seek, 90);
        return;
      }
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      el.querySelector<HTMLElement>('[data-focus-target]')?.focus({ preventScroll: true });
    };
    timer = window.setTimeout(seek, 160);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const changeView = (v: View) => {
    setView(v);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (v === 'historico') next.set('vista', 'historico');
        else next.delete('vista');
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Participar', to: '/participar' }, { label: 'Agenda' }]}
        eyebrow="Vida de empresa"
        title="Agenda"
        lede="Eventos, sesiones y comunicados de FLM. Despliega cada entrada para ver el detalle y añadirla a tu calendario."
        actions={
          <ButtonLink to="/participar/calendario" variant="secondary" icon={<CalendarDays />}>
            Ver el calendario
          </ButtonLink>
        }
      />

      {missing && (
        <div className={styles.notice}>
          <Notice tone="warning" icon={<CalendarX size={18} />} title={MESSAGES.notFound.title}>
            {MESSAGES.notFound.body}
          </Notice>
        </div>
      )}

      <div className={styles.tabsRow}>
        <Tabs<View>
          label="Agenda"
          value={view}
          onChange={changeView}
          panelId={panelId}
          options={[
            { value: 'actuales', label: 'Actuales y próximos', count: upcoming.length },
            { value: 'historico', label: 'Histórico', count: history.length },
          ]}
        />
        <p className={styles.tabsNote}>
          <Clock3 size={15} aria-hidden="true" /> Horas en horario de Madrid
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          id={panelId}
          role="tabpanel"
          aria-label={view === 'actuales' ? 'Actuales y próximos' : 'Histórico'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          {view === 'actuales' ? (
            upcoming.length === 0 ? (
              <EmptyState icon={<CalendarDays />} title="No hay eventos ni comunicados próximos">
                Cuando se publique uno nuevo, aparecerá aquí. Mientras tanto, repasa el histórico o consulta el calendario del equipo.
              </EmptyState>
            ) : (
              <div className={styles.groups}>
                {upcomingGroups.map((g) => (
                  <section key={g.key} className={styles.group} aria-labelledby={`grupo-${g.key}`}>
                    <div className={styles.groupHead}>
                      <h2 id={`grupo-${g.key}`} className={styles.groupTitle}>
                        {g.label}
                      </h2>
                      <p className={styles.groupCount}>{g.items.length === 1 ? '1 entrada' : `${g.items.length} entradas`}</p>
                    </div>
                    <ol role="list" className={styles.list}>
                      {g.items.map((ev) => (
                        <AgendaEntry key={ev.id} ev={ev} now={now} today={today} expanded={open.has(ev.id)} featured={ev.id === featured?.id} onToggle={() => toggle(ev.id)} />
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            )
          ) : history.length === 0 ? (
            <EmptyState icon={<CalendarCheck />} title="Todavía no hay eventos en el histórico">
              Los eventos pasan aquí cuando termina su última sesión, con su resumen y el material que se comparta.
            </EmptyState>
          ) : (
            <HistoryList groups={historyGroups} now={now} today={today} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

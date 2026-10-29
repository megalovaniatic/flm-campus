import { AnimatePresence, motion } from 'motion/react';
import { addDays, type CampusEvent } from '@flm/shared';
import { Checkbox, Notice, SelectField, Switch, TextArea, TextField, toast } from '@/design';
import { useEvents } from '@/data/selectors';
import { reclassifyEvent } from '../actions';
import { EVENT_ICONS } from '../catalog';
import { CATEGORY_LABEL, DEPARTMENTS, kid, newSession, type EventForm, type LinkForm, type SessionForm } from '../forms';
import { AddButton, ChoiceGroup, FieldError, ItemTools, itemMotion, move, RICH_HINT, Section, Slot, type EditorProps } from './fields';
import styles from './Editor.module.css';

type Phase = EventForm['manualPhase'];

const PHASE_OPTIONS: { value: Phase; label: string; description: string }[] = [
  { value: '', label: 'Automática', description: 'Según las fechas, en hora de Madrid' },
  { value: 'proximo', label: 'Próximo', description: 'Se mantiene entre los próximos' },
  { value: 'historico', label: 'Histórico', description: 'Pasa al histórico ya' },
];

/** Reclasificación manual de un evento ya publicado: inmediata y registrada en la auditoría. */
function LiveReclassify({ eventId, ctx }: { eventId: string; ctx: EditorProps<EventForm>['ctx'] }) {
  const events = useEvents(true);
  const live = events.find((e) => e.id === eventId);
  const value: Phase = live?.manualPhase ?? '';
  return (
    <ChoiceGroup<Phase>
      legend="Fase en la agenda"
      variant="cards"
      hint="Se aplica al momento sobre el evento publicado y queda en la auditoría."
      value={value}
      options={PHASE_OPTIONS}
      onChange={(v) => {
        const res = reclassifyEvent({ ...ctx.me, effectiveRole: ctx.role }, eventId, v);
        if (res.ok) toast.success('Fase actualizada', v ? `El evento se muestra como «${PHASE_OPTIONS.find((p) => p.value === v)?.label}».` : 'La fase vuelve a calcularse según las fechas.');
        else toast.error('No se ha podido reclasificar', res.reason);
      }}
    />
  );
}

function SessionCard({ s, i, count, f, update, err }: { s: SessionForm; i: number; count: number; f: EventForm; update: EditorProps<EventForm>['update']; err: EditorProps<EventForm>['err'] }) {
  const patch = (p: Partial<SessionForm>) => update((prev) => ({ ...prev, sessions: prev.sessions.map((x) => (x.id === s.id ? { ...x, ...p } : x)) }));
  const allDay = !s.startTime && !s.endTime;
  const label = f.type === 'evento' ? `la sesión ${i + 1}` : `la fecha ${i + 1}`;
  return (
    <motion.li {...itemMotion} className={styles.itemCard}>
      <div className={styles.itemHead}>
        <span className={styles.itemTitle}>{f.type === 'evento' ? `Sesión ${i + 1}` : `Fecha ${i + 1}`}</span>
        <ItemTools
          label={label}
          index={i}
          count={count}
          min={f.type === 'evento' ? 1 : 0}
          onMove={(to) => update((prev) => ({ ...prev, sessions: move(prev.sessions, i, to) }))}
          onRemove={() => update((prev) => ({ ...prev, sessions: prev.sessions.filter((x) => x.id !== s.id) }))}
        />
      </div>
      <div className={styles.sessionGrid}>
        <Slot path={`sessions.${i}.startDate`}>
          <TextField label="Fecha" type="date" required value={s.startDate} onChange={(e) => patch({ startDate: e.target.value })} error={err(`sessions.${i}.startDate`)} />
        </Slot>
        <div className={styles.allDay}>
          <Checkbox label="Todo el día" checked={allDay} onChange={(v) => patch(v ? { startTime: '', endTime: '' } : { startTime: '09:30', endTime: '10:30' })} />
        </div>
        {!allDay && (
          <>
            <Slot path={`sessions.${i}.startTime`}>
              <TextField label="Inicio" type="time" value={s.startTime} onChange={(e) => patch({ startTime: e.target.value })} error={err(`sessions.${i}.startTime`)} />
            </Slot>
            <Slot path={`sessions.${i}.endTime`}>
              <TextField label="Fin (opcional)" type="time" value={s.endTime} onChange={(e) => patch({ endTime: e.target.value })} error={err(`sessions.${i}.endTime`)} />
            </Slot>
          </>
        )}
        <Slot path={`sessions.${i}.endDate`}>
          <TextField label="Termina otro día (opcional)" type="date" value={s.endDate} min={s.startDate || undefined} onChange={(e) => patch({ endDate: e.target.value })} error={err(`sessions.${i}.endDate`)} />
        </Slot>
      </div>
      <div className={styles.grid2}>
        <TextField label="Etiqueta (opcional)" value={s.label} onChange={(e) => patch({ label: e.target.value })} placeholder={f.type === 'evento' ? 'p. ej., ChatGPT · sesión 1' : 'p. ej., Último día para participar'} />
        <TextField label="Lugar (opcional)" value={s.location} onChange={(e) => patch({ location: e.target.value })} placeholder="p. ej., Sala Biblioteca · Barcelona" />
      </div>
    </motion.li>
  );
}

function LinkCard({ l, i, count, update, err }: { l: LinkForm; i: number; count: number; update: EditorProps<EventForm>['update']; err: EditorProps<EventForm>['err'] }) {
  const patch = (p: Partial<LinkForm>) => update((prev) => ({ ...prev, links: prev.links.map((x) => (x.id === l.id ? { ...x, ...p } : x)) }));
  return (
    <motion.li {...itemMotion} className={styles.itemCard}>
      <div className={styles.itemHead}>
        <span className={styles.itemTitle}>Enlace {i + 1}</span>
        <ItemTools
          label={`el enlace ${i + 1}`}
          index={i}
          count={count}
          onMove={(to) => update((prev) => ({ ...prev, links: move(prev.links, i, to) }))}
          onRemove={() => update((prev) => ({ ...prev, links: prev.links.filter((x) => x.id !== l.id) }))}
        />
      </div>
      <div className={styles.grid2}>
        <Slot path={`links.${i}.label`}>
          <TextField label="Texto del enlace" value={l.label} onChange={(e) => patch({ label: e.target.value })} error={err(`links.${i}.label`)} placeholder="p. ej., Formulario de votación" />
        </Slot>
        <Slot path={`links.${i}.url`}>
          <TextField label="Dirección" type="url" inputMode="url" value={l.url} onChange={(e) => patch({ url: e.target.value })} error={err(`links.${i}.url`)} placeholder="https://" />
        </Slot>
      </div>
      <Checkbox label="Enlace de ejemplo (sin destino real todavía)" hint="Se muestra con la marca «Enlace de ejemplo» y sin enlace activo." checked={l.example} onChange={(v) => patch({ example: v })} />
    </motion.li>
  );
}

/** Evento o comunicado: icono curado, sesiones en hora de Madrid, fecha por confirmar y enlaces. */
export function EventEditor({ value: f, update, err, ctx }: EditorProps<EventForm>) {
  const set = <K extends keyof EventForm>(k: K, v: EventForm[K]) => update((p) => ({ ...p, [k]: v }));
  const isEvent = f.type === 'evento';
  const addSession = () =>
    update((prev) => {
      const last = prev.sessions.at(-1);
      const next = last ? { ...last, id: kid('s'), startDate: last.startDate ? addDays(last.startDate, 7) : '', endDate: '', label: '' } : newSession(ctx.today, isEvent);
      return { ...prev, sessions: [...prev.sessions, next] };
    });
  return (
    <>
      <Section title={isEvent ? 'El evento' : 'El comunicado'} description={isEvent ? 'Encuentros, formaciones internas, desayunos y celebraciones de la firma.' : 'Avisos para toda la firma: iniciativas, novedades internas, campañas.'}>
        <Slot path="title">
          <TextField label="Título" required value={f.title} onChange={(e) => set('title', e.target.value)} error={err('title')} placeholder={isEvent ? 'p. ej., Desayuno Laboral' : 'p. ej., Ya está en línea la nueva web'} />
        </Slot>
        <div className={styles.grid2}>
          <SelectField label="Categoría" value={f.category} onChange={(e) => set('category', e.target.value as CampusEvent['category'])} options={(Object.keys(CATEGORY_LABEL) as CampusEvent['category'][]).map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))} />
          <SelectField label="Organiza o se dirige a" value={f.department} onChange={(e) => set('department', e.target.value)} options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
        </div>
        <Slot path="summary">
          <TextArea label="Descripción breve" required rows={3} maxLength={280} value={f.summary} onChange={(e) => set('summary', e.target.value)} error={err('summary')} hint="Qué es y para quién, en una o dos frases. Se ve en la agenda y en Inicio." />
        </Slot>
        <TextArea label="Más información (opcional)" rows={4} value={f.body} onChange={(e) => set('body', e.target.value)} hint={`Programa, detalles prácticos o condiciones. ${RICH_HINT}`} />
      </Section>

      <Section title="Icono" description="Elige uno del conjunto del campus. Se muestra junto al título, siempre con su texto.">
        <ChoiceGroup
          legend="Icono del evento"
          variant="icons"
          value={f.icon}
          onChange={(v) => set('icon', v)}
          options={EVENT_ICONS.map(({ id, label, Icon }) => ({ value: id, label, icon: <Icon size={22} /> }))}
        />
      </Section>

      <Section title={isEvent ? 'Sesiones' : 'Fechas clave'} description="Fechas y horas en hora de Madrid. Si hay varias sesiones, la agenda las une con un puente en un solo evento.">
        <Switch
          label="Fecha por confirmar"
          description="Aparece entre los próximos con un anillo discontinuo hasta que fijes la fecha."
          checked={f.pendingDate}
          onChange={(v) => update((p) => ({ ...p, pendingDate: v, sessions: !v && p.sessions.length === 0 ? [newSession('', isEvent)] : p.sessions }))}
        />
        <AnimatePresence mode="popLayout" initial={false}>
          {f.pendingDate ? (
            <motion.div key="pending" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <TextField label="Nota sobre la fecha (opcional)" value={f.pendingDateNote} onChange={(e) => set('pendingDateNote', e.target.value)} placeholder="p. ej., Fecha pendiente de programar" />
            </motion.div>
          ) : (
            <motion.div key="sessions" className={styles.stack} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Slot path="sessions">
                <FieldError message={err('sessions')} />
              </Slot>
              <ol role="list" className={styles.items}>
                <AnimatePresence initial={false}>
                  {f.sessions.map((s, i) => (
                    <SessionCard key={s.id} s={s} i={i} count={f.sessions.length} f={f} update={update} err={err} />
                  ))}
                </AnimatePresence>
              </ol>
              <AddButton onClick={addSession}>{isEvent ? 'Añadir sesión' : 'Añadir fecha'}</AddButton>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <Section title="Enlaces" description="Formularios, inscripciones o páginas relacionadas. Marca como «de ejemplo» los que aún no tienen destino real.">
        {f.links.length > 0 && (
          <ol role="list" className={styles.items}>
            <AnimatePresence initial={false}>
              {f.links.map((l, i) => (
                <LinkCard key={l.id} l={l} i={i} count={f.links.length} update={update} err={err} />
              ))}
            </AnimatePresence>
          </ol>
        )}
        <AddButton onClick={() => update((p) => ({ ...p, links: [...p.links, { id: kid('l'), label: '', url: '', example: false }] }))}>Añadir enlace</AddButton>
      </Section>

      {ctx.isAdmin && (
        <Section title="Reclasificación manual" description="Solo administración. Prevalece sobre el cálculo automático de la fase (próximo, en curso, histórico).">
          {ctx.publishedId ? (
            <LiveReclassify eventId={ctx.publishedId} ctx={ctx} />
          ) : (
            <>
              <ChoiceGroup<Phase> legend="Fase en la agenda" variant="cards" value={f.manualPhase} options={PHASE_OPTIONS} onChange={(v) => set('manualPhase', v)} />
              <Notice>Se aplicará al publicar. Archivar no es lo mismo que pasar al histórico: lo archivado deja de mostrarse.</Notice>
            </>
          )}
        </Section>
      )}
    </>
  );
}

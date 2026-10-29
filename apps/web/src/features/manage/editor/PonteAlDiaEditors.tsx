import { Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { AREA_LIST, COUNTRIES, countryCode, normalize, type Scope } from '@flm/shared';
import { Avatar, Checkbox, Notice, SelectField, TextArea, TextField } from '@/design';
import { usePeople, useWelcomes } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { readDraft } from '../model';
import type { ClientForm, WelcomeForm } from '../forms';
import { FieldError, Section, Slot, type EditorProps } from './fields';
import styles from './Editor.module.css';

const base = import.meta.env.BASE_URL;

/** Nuevo cliente para «Ponte al día» (Inicio): nombre, sector, país de origen y área que lleva el encargo. */
export function ClientEditor({ value: f, update, err }: EditorProps<ClientForm>) {
  const set = <K extends keyof ClientForm>(k: K, v: ClientForm[K]) => update((p) => ({ ...p, [k]: v }));
  const code = countryCode(f.country);
  return (
    <>
      <Section title="La empresa" description="Solo lo que el equipo necesita saber para reconocerla. Sin importes, honorarios ni datos confidenciales.">
        <Slot path="name">
          <TextField label="Nombre de la empresa" required maxLength={80} value={f.name} onChange={(e) => set('name', e.target.value)} error={err('name')} placeholder="p. ej., Lindqvar Robotics AB" />
        </Slot>
        <Slot path="sector">
          <TextField label="Sector" required maxLength={80} value={f.sector} onChange={(e) => set('sector', e.target.value)} error={err('sector')} hint="A qué se dedica, en pocas palabras." placeholder="p. ej., Robótica para almacenes logísticos" />
        </Slot>
        <div className={styles.grid2}>
          <Slot path="country">
            <SelectField
              label="País de origen"
              required
              value={f.country}
              onChange={(e) => set('country', e.target.value)}
              error={err('country')}
              options={[{ value: '', label: 'Elige el país…' }, ...COUNTRIES.map((c) => ({ value: c.name, label: c.name }))]}
              hint={code ? `Código ${code}. En el tablero se muestra escrito, sin banderas.` : 'Se muestra escrito en el tablero de Inicio.'}
            />
          </Slot>
          <SelectField label="Área que lleva el encargo" value={f.area} onChange={(e) => set('area', e.target.value as Scope)} options={[...AREA_LIST.map((a) => ({ value: a.id, label: a.name })), { value: 'general', label: 'Varias áreas (toda la firma)' }]} />
        </div>
        <Slot path="summary">
          <TextArea label="Qué hará FLM, en una frase (opcional)" rows={2} maxLength={160} value={f.summary} onChange={(e) => set('summary', e.target.value)} error={err('summary')} hint="p. ej., «Abre filial en Barcelona: constitución de la sociedad y pacto de socios»." />
        </Slot>
        <Slot path="date">
          <TextField label="Fecha del anuncio" required type="date" value={f.date} onChange={(e) => set('date', e.target.value)} error={err('date')} hint="La del anuncio en el campus, no la del encargo." />
        </Slot>
      </Section>
      <Section title="Antes de publicar">
        <Checkbox label="Empresa de ejemplo (ficticia)" hint="Se rotula «Ejemplo ficticio» en el tablero. En la demostración, todos los clientes son inventados." checked={f.fictional} onChange={(v) => set('fictional', v)} />
        <Slot path="confirmed">
          <Checkbox label="Se puede anunciar dentro de FLM: el cliente lo permite y no incluye datos económicos ni confidenciales" hint="Obligatoria para publicar. No se guarda en el anuncio." checked={f.confirmed} onChange={(v) => set('confirmed', v)} />
          <FieldError message={err('confirmed')} />
        </Slot>
      </Section>
    </>
  );
}

/**
 * Bienvenida a una persona que se suma al equipo. Solo personas activas del directorio y sin otra
 * bienvenida; el anuncio solo tiene su propia fecha (la ficha no guarda la de incorporación).
 */
export function WelcomeEditor({ value: f, update, err, ctx }: EditorProps<WelcomeForm>) {
  const set = <K extends keyof WelcomeForm>(k: K, v: WelcomeForm[K]) => update((p) => ({ ...p, [k]: v }));
  const people = usePeople();
  const welcomes = useWelcomes(true);
  const drafts = useDemo((s) => s.drafts);
  const [q, setQ] = useState('');
  const id = useId();
  // Personas que ya tienen bienvenida (publicada o en otro borrador): una por persona.
  const taken = useMemo(() => {
    const self = ctx.contentId;
    const ids = new Set(welcomes.filter((w) => w.id !== self).map((w) => w.personId));
    for (const d of Object.values(drafts)) {
      if (d.type !== 'bienvenida' || d.id === self || d.id === `rev-${self}`) continue;
      const data = readDraft(d);
      if (data?.form.type === 'bienvenida' && data.sourceId !== self && data.form.personId) ids.add(data.form.personId);
    }
    return ids;
  }, [welcomes, drafts, ctx.contentId]);
  const candidates = useMemo(() => {
    const nq = normalize(q);
    return people
      // En la demo, solo personas ficticias: anunciar la llegada de una persona real sería inventar un hecho sobre ella.
      .filter((p) => p.status === 'activa' && (!__DEMO__ || p.fictional) && (!taken.has(p.id) || p.id === f.personId))
      .filter((p) => !nq || normalize(`${p.name} ${p.position} ${p.department} ${p.office}`).includes(nq))
      .sort((a, b) => Number(b.id === f.personId) - Number(a.id === f.personId) || a.name.localeCompare(b.name, 'es'))
      .slice(0, 24);
  }, [people, taken, q, f.personId]);
  const chosen = people.find((p) => p.id === f.personId);

  return (
    <>
      <Section
        title="Quién se suma"
        description={`Solo personas activas del directorio que aún no tienen bienvenida. El nombre, el puesto y la sede se leen de su ficha.${__DEMO__ ? ' En la demostración solo aparecen personas ficticias.' : ''}`}
      >
        {f.personId && !chosen && <Notice tone="warning" title="Esta persona ya no está en el directorio">Elige a otra persona o elimina el borrador.</Notice>}
        <Slot path="personId">
          <fieldset className={styles.personPicker}>
            <legend className={styles.legend}>Persona</legend>
            <div className={styles.docSearch}>
              <Search size={16} aria-hidden="true" />
              <label htmlFor={`${id}-q`} className="sr-only">
                Buscar persona
              </label>
              <input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, puesto, área o sede" autoComplete="off" />
            </div>
            <ul role="list" className={styles.personList}>
              {candidates.map((p) => (
                <li key={p.id}>
                  <label className={styles.personOption} data-checked={p.id === f.personId || undefined}>
                    <input type="radio" name={`persona-${id}`} checked={p.id === f.personId} onChange={() => set('personId', p.id)} />
                    <Avatar name={p.name} photo={p.photo ? base + p.photo : undefined} size={36} decorative />
                    <span className={styles.docText}>
                      <span className={styles.docTitle}>{p.name}</span>
                      <span className={styles.docMeta}>
                        {p.position} · {p.department} · {p.office}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
              {candidates.length === 0 && <li className={styles.docEmpty}>No hay personas sin bienvenida con esas palabras.</li>}
            </ul>
            <FieldError message={err('personId')} />
          </fieldset>
        </Slot>
      </Section>
      <Section title="El mensaje">
        <Slot path="message">
          <TextArea label="Mensaje de bienvenida" required rows={3} maxLength={240} value={f.message} onChange={(e) => set('message', e.target.value)} error={err('message')} hint="Una o dos frases: dónde se suma y en qué trabajará. Sin datos personales ni fechas de incorporación." placeholder="p. ej., Se suma al Área Laboral en Granollers: nóminas, contratos y trámites con la Seguridad Social." />
        </Slot>
        <Slot path="date">
          <TextField label="Fecha del anuncio" required type="date" value={f.date} onChange={(e) => set('date', e.target.value)} error={err('date')} hint="La del anuncio en el campus." />
        </Slot>
        <Slot path="confirmed">
          <Checkbox label="La persona sabe que se anunciará su llegada en el campus" hint="Obligatoria para publicar. No se guarda en el anuncio." checked={f.confirmed} onChange={(v) => set('confirmed', v)} />
          <FieldError message={err('confirmed')} />
        </Slot>
      </Section>
    </>
  );
}

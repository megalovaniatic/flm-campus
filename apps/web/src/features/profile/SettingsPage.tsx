import { animate, motion } from 'motion/react';
import {
  ArrowRight,
  Bell,
  Cake,
  Database,
  Download,
  FlaskConical,
  HardDrive,
  Keyboard,
  Lock,
  LogOut,
  MonitorSmartphone,
  Moon,
  Palette,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { AREAS, madridDateKey, monthName, number as formatNumber, ROLE_LABEL, type Person } from '@flm/shared';
import { ActionButton, Button, Dialog, Kbd, Notice, PageHeader, SelectField, Switch, toast, type ActionStatus } from '@/design';
import { useMe } from '@/data/selectors';
import { useDemo, type MotionPref, type ThemePref } from '@/data/store';
import { downloadText } from '@/lib/download';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { scrollToSection, useHashScroll, useScrollSpy } from '@/features/about/useSectionNav';
import { useNoticePrefs } from './noticePrefs';
import styles from './SettingsPage.module.css';

const SECTIONS = [
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'movimiento', label: 'Movimiento', icon: Sparkles },
  { id: 'teclado', label: 'Teclado', icon: Keyboard },
  { id: 'calendario', label: 'Calendario', icon: Cake },
  { id: 'avisos', label: 'Avisos', icon: Bell },
  { id: 'privacidad', label: 'Privacidad', icon: ShieldCheck },
  { id: 'sesion', label: 'Sesión y demo', icon: LogOut },
] as const;

const SECTION_IDS = SECTIONS.map((s) => s.id);

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/* ── Grupo de opciones (radio nativos con aspecto de tarjeta) ──────────── */

interface Choice<T extends string> {
  value: T;
  label: string;
  hint: string;
  icon: LucideIcon;
  preview?: ReactNode;
}

function ChoiceGroup<T extends string>({ name, legend, description, value, onChange, choices }: { name: string; legend: string; description?: ReactNode; value: T; onChange: (v: T) => void; choices: Choice<T>[] }) {
  const id = useId();
  return (
    <fieldset className={styles.choiceSet} aria-describedby={description ? `${id}-d` : undefined}>
      <legend className={styles.legend}>{legend}</legend>
      {description && (
        <p id={`${id}-d`} className={styles.hint}>
          {description}
        </p>
      )}
      <div className={styles.choices}>
        {choices.map((c) => {
          const checked = c.value === value;
          const Icon = c.icon;
          return (
            <label key={c.value} className={styles.choice} data-checked={checked}>
              <input type="radio" name={name} value={c.value} checked={checked} onChange={() => onChange(c.value)} className={styles.radio} />
              {c.preview && (
                <span className={styles.preview} aria-hidden="true">
                  {c.preview}
                </span>
              )}
              <span className={styles.choiceText}>
                <span className={styles.choiceLabel}>
                  <Icon size={16} aria-hidden="true" />
                  {c.label}
                </span>
                <span className="sr-only">. </span>
                <span className={styles.choiceHint}>{c.hint}</span>
              </span>
              <span className={styles.check} aria-hidden="true">
                {checked && (
                  <motion.span layoutId={`${name}-check`} className={styles.checkFill} transition={{ type: 'spring', stiffness: 520, damping: 36 }}>
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 8.5 6.5 11.5 12.5 5" />
                    </svg>
                  </motion.span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ThemePreview({ mode }: { mode: 'claro' | 'oscuro' | 'sistema' }) {
  return (
    <span className={styles.pv} data-mode={mode}>
      <span className={styles.pvHalf} data-tone={mode === 'oscuro' ? 'dark' : 'light'}>
        <span className={styles.pvBar} />
        <span className={styles.pvLine} />
        <span className={styles.pvLine} data-short="true" />
        <span className={styles.pvDot} />
      </span>
      {mode === 'sistema' && (
        <span className={styles.pvHalf} data-tone="dark">
          <span className={styles.pvBar} />
          <span className={styles.pvLine} />
          <span className={styles.pvLine} data-short="true" />
          <span className={styles.pvDot} />
        </span>
      )}
    </span>
  );
}

/** Muestra del movimiento del campus: un círculo que se abre en cápsula (320–460 ms, sin rebotes). */
function MotionSample({ run, reduce }: { run: number; reduce: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || run === 0 || reduce) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const r = `round ${h / 2}px`;
    const open = animate(el, { clipPath: [`inset(0px ${w - h}px 0px 0px ${r})`, `inset(0px 0px 0px 0px ${r})`] }, { duration: 0.46, ease: [0.22, 1, 0.36, 1] });
    const label = el.querySelector('[data-label]');
    const fade = label ? animate(label, { opacity: [0, 1], x: [-6, 0] }, { duration: 0.3, delay: 0.16 }) : undefined;
    open.then(() => {
      el.style.clipPath = '';
    });
    return () => {
      open.stop();
      fade?.stop();
    };
  }, [run, reduce]);
  return (
    <span ref={ref} className={styles.sample}>
      <span className={styles.sampleDot} aria-hidden="true" />
      <span data-label="">Así se abre una cápsula en el campus</span>
    </span>
  );
}

/* ── Cumpleaños (consentimiento) ───────────────────────────────────────── */

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const maxDay = (mm: string) => (mm === '02' ? 29 : ['04', '06', '09', '11'].includes(mm) ? 30 : 31);

function BirthdayForm({ person }: { person: Person }) {
  const patchPerson = useDemo((s) => s.patchPerson);
  const log = useDemo((s) => s.log);
  const saved = { day: person.birthday ? person.birthday.slice(3, 5) : '', month: person.birthday ? person.birthday.slice(0, 2) : '', show: !!person.birthday && person.showBirthday };
  const [day, setDay] = useState(saved.day);
  const [month, setMonth] = useState(saved.month);
  const [show, setShow] = useState(saved.show);
  const [error, setError] = useState<{ field: 'day' | 'month'; text: string }>();
  const [status, setStatus] = useState<ActionStatus>('idle');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const dirty = day !== saved.day || month !== saved.month || show !== saved.show;

  const validate = (): typeof error => {
    if (show && !day) return { field: 'day', text: 'Para mostrar tu cumpleaños, indica el día.' };
    if (show && !month) return { field: 'month', text: 'Para mostrar tu cumpleaños, indica el mes.' };
    if (day && !month) return { field: 'month', text: 'Indica también el mes.' };
    if (month && !day) return { field: 'day', text: 'Indica también el día.' };
    if (day && month && Number(day) > maxDay(month)) return { field: 'day', text: `${monthName(Number(month)).replace(/^./, (c) => c.toUpperCase())} tiene ${maxDay(month)} días como máximo.` };
    return undefined;
  };

  const save = () => {
    const problem = validate();
    setError(problem);
    if (problem) return;
    setStatus('pending');
    timers.current.push(
      window.setTimeout(() => {
        const birthday = day && month ? `${month}-${day}` : '';
        patchPerson(person.id, { birthday, showBirthday: show && !!birthday });
        log({ actorId: person.id, action: 'perfil.cumpleanos', entity: 'persona', entityId: person.id, detail: show && birthday ? 'Consiente mostrar su cumpleaños (día y mes)' : 'No muestra su cumpleaños' });
        setStatus('success');
        toast.success('Preferencias de calendario guardadas', show && birthday ? 'Tu cumpleaños aparecerá en el calendario, solo con el día y el mes.' : 'Tu cumpleaños no aparecerá en el calendario.');
        timers.current.push(window.setTimeout(() => setStatus('idle'), 1800));
      }, 450),
    );
  };

  const erase = () => {
    patchPerson(person.id, { birthday: '', showBirthday: false });
    log({ actorId: person.id, action: 'perfil.cumpleanos', entity: 'persona', entityId: person.id, detail: 'Borra su fecha de cumpleaños' });
    setDay('');
    setMonth('');
    setShow(false);
    setError(undefined);
    toast.info('Fecha de cumpleaños borrada', 'Ya no se guarda ni aparece en el calendario.');
  };

  return (
    <form
      className={styles.birthday}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <fieldset className={styles.dateSet}>
        <legend className={styles.legend}>Tu cumpleaños</legend>
        <p className={styles.hint}>Solo el día y el mes, nunca el año.</p>
        <div className={styles.dateRow}>
          <SelectField
            label="Día"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            error={error?.field === 'day' ? error.text : undefined}
            options={[{ value: '', label: 'Sin indicar' }, ...DAYS.map((d) => ({ value: d, label: String(Number(d)) }))]}
          />
          <SelectField
            label="Mes"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            error={error?.field === 'month' ? error.text : undefined}
            options={[{ value: '', label: 'Sin indicar' }, ...MONTHS.map((m) => ({ value: m, label: monthName(Number(m)) }))]}
          />
        </div>
      </fieldset>
      <div className={styles.switchBox}>
        <Switch
          label="Mostrar mi cumpleaños en el calendario"
          description="Lo verá el equipo en Participar › Calendario y en «Hoy en FLM». Puedes retirarlo cuando quieras."
          checked={show}
          onChange={setShow}
        />
      </div>
      <div className={styles.formActions}>
        <ActionButton status={status} label="Guardar cambios" successLabel="Guardado" disabled={!dirty && status === 'idle'} onClick={save} />
        {person.birthday && (
          <Button variant="ghost" onClick={erase}>
            Borrar mi fecha
          </Button>
        )}
      </div>
      {__DEMO__ && <p className={styles.demoNote}>{MESSAGES.demoSimulated}</p>}
    </form>
  );
}

/* ── Página ────────────────────────────────────────────────────────────── */

function storageSize(): number | null {
  try {
    const v = window.localStorage.getItem('flm-campus-demo') ?? '';
    const w = window.localStorage.getItem('flm-campus-avisos') ?? '';
    return new Blob([v, w]).size;
  } catch {
    return null;
  }
}

function sizeText(bytes: number | null): string {
  if (bytes === null) return 'no disponible (el almacenamiento está bloqueado)';
  if (bytes < 1024) return `${bytes} bytes`;
  return `${formatNumber(bytes / 1024, 1)} KB`;
}

export default function SettingsPage() {
  usePageTitle('Ajustes');
  useHashScroll();
  const me = useMe();
  const navigate = useNavigate();
  const theme = useDemo((s) => s.theme);
  const setTheme = useDemo((s) => s.setTheme);
  const motionPref = useDemo((s) => s.motion);
  const setMotion = useDemo((s) => s.setMotion);
  const singleKey = useDemo((s) => s.singleKeyShortcuts);
  const setSingleKey = useDemo((s) => s.setSingleKeyShortcuts);
  const reset = useDemo((s) => s.reset);
  const signOut = useDemo((s) => s.signOut);
  const prefs = useNoticePrefs();
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const systemReduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const reduce = useReducedMotionPref();
  const active = useScrollSpy(SECTION_IDS);
  const [announce, setAnnounce] = useState('');
  const [run, setRun] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [size, setSize] = useState<number | null>(() => storageSize());

  useEffect(() => {
    const refresh = () => window.setTimeout(() => setSize(storageSize()), 0);
    const a = useDemo.subscribe(refresh);
    const b = useNoticePrefs.subscribe(refresh);
    return () => {
      a();
      b();
    };
  }, []);

  if (!me) return null;

  const themeNow = theme === 'sistema' ? `${systemDark ? 'oscuro' : 'claro'}, según tu sistema` : theme;
  const motionNow = motionPref === 'sistema' ? `${systemReduce ? 'reducido' : 'completo'}, según tu sistema` : motionPref;
  const area = Object.values(AREAS).find((a) => a.name === me.department);

  const exportData = () => {
    const s = useDemo.getState();
    const data = {
      generado: new Date().toISOString(),
      origen: __DEMO__ ? 'Demostración pública de FLM Campus: datos guardados en este navegador.' : 'FLM Campus',
      persona: {
        nombre: me.name,
        correo: me.email,
        puesto: me.position,
        departamento: me.department,
        sede: me.office,
        perfil: ROLE_LABEL[me.role],
        fechaDeIncorporacion: me.startDate ?? null,
        cumpleanos: me.birthday ? { diaYMes: me.birthday, visibleEnElCalendario: me.showBirthday } : null,
      },
      preferencias: { tema: s.theme, movimiento: s.motion, atajosDeUnaTecla: s.singleKeyShortcuts, avisos: { obligatorias: prefs.obligatorias, agenda: prefs.agenda, novedades: prefs.novedades, correo: prefs.correo } },
      progreso: Object.values(s.progress).map((p) => ({ formacion: p.formationId, lecturaConfirmada: p.readAt ?? null, versionLeida: p.readVersion ?? null, intentos: p.attempts.map((a) => ({ fecha: a.at, aciertos: a.correct, preguntas: a.total, superado: a.passed, version: a.version })) })),
      evaluaciones: Object.entries(s.assessmentAttempts).map(([id, list]) => ({ evaluacion: id, intentos: list.map((a) => ({ fecha: a.at, aciertos: a.correct, preguntas: a.total, superada: a.passed })) })),
      reconocimientosVistos: s.celebrated,
    };
    downloadText(`flm-campus-mis-datos-${madridDateKey()}.json`, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
    toast.success('Datos descargados', 'El archivo JSON incluye tu ficha, tu progreso y tus preferencias.');
  };

  const confirmReset = () => {
    reset();
    useNoticePrefs.getState().resetPrefs();
    setConfirm(false);
    setRun(0);
    setFormKey((k) => k + 1);
    toast.success('Demostración restablecida', 'Se han borrado tu progreso, los intentos, los borradores y los cambios guardados en este navegador.');
  };

  const logout = () => {
    signOut();
    navigate('/acceso', { replace: true });
  };

  return (
    <div className={`container page ${styles.page}`}>
      <PageHeader crumbs={[{ label: 'Mi perfil', to: '/perfil' }, { label: 'Ajustes' }]} eyebrow="Mi perfil" title="Ajustes" lede="Adapta el campus a tu manera de trabajar. Los cambios se aplican al momento y puedes deshacerlos cuando quieras." />

      <div className={styles.layout}>
        <nav aria-label="Apartados de ajustes" className={styles.nav}>
          <ul role="list">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const current = active === s.id;
              return (
                <li key={s.id}>
                  <Link to={{ hash: `#${s.id}` }} onClick={() => scrollToSection(s.id)} aria-current={current ? 'true' : undefined} className={styles.navLink}>
                    {current && <motion.span layoutId="ajustes-nav" className={styles.navPill} transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                    <Icon size={16} aria-hidden="true" />
                    <span>{s.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.panels}>
          <section id="apariencia" aria-labelledby="h-apariencia" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-apariencia" className={styles.panelTitle}>
                Apariencia
              </h2>
              <p className={styles.panelLede}>
                Ahora: tema <strong>{themeNow}</strong>.
              </p>
            </header>
            <ChoiceGroup<ThemePref>
              name="tema"
              legend="Tema"
              value={theme}
              onChange={(v) => {
                setTheme(v);
                setAnnounce(v === 'sistema' ? 'Tema del sistema aplicado.' : `Tema ${v} aplicado.`);
              }}
              choices={[
                { value: 'sistema', label: 'Sistema', hint: 'Sigue el ajuste de tu dispositivo', icon: MonitorSmartphone, preview: <ThemePreview mode="sistema" /> },
                { value: 'claro', label: 'Claro', hint: 'Papel cálido y tinta marino', icon: Sun, preview: <ThemePreview mode="claro" /> },
                { value: 'oscuro', label: 'Oscuro', hint: 'El negro y el marino de FLM', icon: Moon, preview: <ThemePreview mode="oscuro" /> },
              ]}
            />
          </section>

          <section id="movimiento" aria-labelledby="h-movimiento" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-movimiento" className={styles.panelTitle}>
                Movimiento
              </h2>
              <p className={styles.panelLede}>
                Ahora: movimiento <strong>{motionNow}</strong>.
              </p>
            </header>
            <ChoiceGroup<MotionPref>
              name="movimiento"
              legend="Animaciones"
              description="Con el movimiento reducido no hay desplazamientos ni animaciones decorativas: los momentos firma muestran directamente su composición final."
              value={motionPref}
              onChange={(v) => {
                setMotion(v);
                setAnnounce(v === 'sistema' ? 'Movimiento según el sistema.' : `Movimiento ${v}.`);
                if (v === 'completo' || (v === 'sistema' && !systemReduce)) setRun((n) => n + 1);
              }}
              choices={[
                { value: 'sistema', label: 'Sistema', hint: 'Respeta «reducir movimiento» de tu dispositivo', icon: MonitorSmartphone },
                { value: 'reducido', label: 'Reducido', hint: 'Sin desplazamientos ni animaciones', icon: Pause },
                { value: 'completo', label: 'Completo', hint: 'Transiciones breves, de 150 a 450 ms', icon: Sparkles },
              ]}
            />
            <div className={styles.motionDemo}>
              <MotionSample run={run} reduce={reduce} />
              <Button variant="soft" size="sm" icon={<Play />} onClick={() => setRun((n) => n + 1)} disabled={reduce}>
                Probar
              </Button>
              <p className={styles.hint}>{reduce ? 'Con el movimiento reducido ves directamente el resultado final.' : 'Pulsa «Probar» para ver cómo se abre una cápsula.'}</p>
            </div>
          </section>

          <section id="teclado" aria-labelledby="h-teclado" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-teclado" className={styles.panelTitle}>
                Teclado
              </h2>
              <p className={styles.panelLede}>Atajos para moverte más rápido. Ninguno es imprescindible.</p>
            </header>
            <div className={styles.switchBox}>
              <Switch
                label="Atajos de una tecla"
                description="«/» abre la búsqueda desde cualquier página. Desactívalo si usas control por voz o un lector de pantalla que pueda activarlo sin querer."
                checked={singleKey}
                onChange={(v) => {
                  setSingleKey(v);
                  setAnnounce(v ? 'Atajos de una tecla activados.' : 'Atajos de una tecla desactivados.');
                }}
              />
            </div>
            <ul role="list" className={styles.keys}>
              <li data-off={!singleKey || undefined}>
                <Kbd>/</Kbd>
                <span>Buscar{!singleKey && ' (desactivado)'}</span>
              </li>
              <li>
                <span className={styles.combo}>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </span>
                <span>Buscar, siempre disponible</span>
              </li>
              <li>
                <Kbd>Esc</Kbd>
                <span>Cerrar búsqueda, diálogos y menús</span>
              </li>
            </ul>
          </section>

          <section id="calendario" aria-labelledby="h-calendario" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-calendario" className={styles.panelTitle}>
                Calendario
              </h2>
              <p className={styles.panelLede}>Tu cumpleaños solo aparece si das tu consentimiento.</p>
            </header>
            <BirthdayForm key={`${me.id}-${formKey}`} person={me} />
          </section>

          <section id="avisos" aria-labelledby="h-avisos" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-avisos" className={styles.panelTitle}>
                Avisos
              </h2>
              <p className={styles.panelLede}>Qué quieres ver en la campana de avisos.</p>
            </header>
            <div className={styles.switchList}>
              <Switch label="Formaciones obligatorias y plazos" description="Al asignarte una formación y una semana antes de que venza." checked={prefs.obligatorias} onChange={(v) => prefs.setPref('obligatorias', v)} />
              <Switch label="Agenda de la semana" description="Eventos y encuentros de los próximos siete días." checked={prefs.agenda} onChange={(v) => prefs.setPref('agenda', v)} />
              <Switch
                label={area ? `Novedades del área ${area.name}` : 'Novedades de tu área'}
                description="Actualidad en tu sector del departamento al que perteneces."
                checked={prefs.novedades}
                onChange={(v) => prefs.setPref('novedades', v)}
              />
              <Switch label="Resumen semanal por correo" description="Requiere la versión interna, con el servidor de correo configurado." checked={false} disabled onChange={() => undefined} />
            </div>
            {__DEMO__ && (
              <Notice tone="info" icon={<FlaskConical size={18} />}>
                En la demostración estos ajustes son de interfaz: se guardan en este navegador, pero la campana de avisos todavía no los aplica.
              </Notice>
            )}
          </section>

          <section id="privacidad" aria-labelledby="h-privacidad" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-privacidad" className={styles.panelTitle}>
                Privacidad
              </h2>
              <p className={styles.panelLede}>Qué se guarda, dónde y cómo llevártelo.</p>
            </header>
            <ul role="list" className={styles.facts}>
              <li>
                <span className={styles.factIcon} aria-hidden="true">
                  <HardDrive size={18} />
                </span>
                <span>
                  <strong>{__DEMO__ ? 'En este navegador.' : 'En este dispositivo.'}</strong> Tu progreso de lectura y tests, los intentos, los borradores, los cambios de la demostración y tus preferencias. Ocupa ahora <span className={styles.num}>{sizeText(size)}</span>.
                </span>
              </li>
              <li>
                <span className={styles.factIcon} aria-hidden="true">
                  <Lock size={18} />
                </span>
                <span>
                  <strong>Sin seguimiento.</strong> No hay analítica ni cookies de terceros, y las tipografías se sirven desde el propio campus.
                </span>
              </li>
              <li>
                <span className={styles.factIcon} aria-hidden="true">
                  <Database size={18} />
                </span>
                <span>
                  <strong>En la versión interna.</strong> Los datos se guardan en el servidor de FLM, con permisos por perfil, registro de auditoría y plazos de conservación.
                </span>
              </li>
            </ul>
            <div className={styles.rowActions}>
              <Button variant="secondary" icon={<Download />} onClick={exportData}>
                Descargar mis datos (JSON)
              </Button>
              <Link to="/sobre#privacidad" className="link-arrow">
                Privacidad y conservación de datos <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section id="sesion" aria-labelledby="h-sesion" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-sesion" className={styles.panelTitle}>
                Sesión y demostración
              </h2>
              <p className={styles.panelLede}>
                Has entrado como <strong>{me.name}</strong>
                {me.effectiveRole !== me.role ? `, viendo la demo como ${ROLE_LABEL[me.effectiveRole].toLowerCase()}` : ''}.
              </p>
            </header>
            <div className={styles.sessionGrid}>
              {__DEMO__ && (
                <div className={styles.sessionItem}>
                  <h3 className={styles.itemTitle}>Restablecer la demostración</h3>
                  <p className={styles.hint}>Borra tu progreso, los intentos, los borradores, los cambios de administración y las preferencias guardadas en este navegador.</p>
                  <Button variant="secondary" icon={<RotateCcw />} onClick={() => setConfirm(true)}>
                    Restablecer la demostración
                  </Button>
                </div>
              )}
              <div className={styles.sessionItem}>
                <h3 className={styles.itemTitle}>Cerrar sesión</h3>
                <p className={styles.hint}>{__DEMO__ ? 'La demostración no usa contraseñas: podrás volver a entrar desde la pantalla de acceso.' : 'Cerraremos tu sesión en este dispositivo.'}</p>
                <Button variant="secondary" icon={<LogOut />} onClick={logout}>
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="¿Restablecer la demostración?"
        description="Se borrarán tu progreso, los intentos, los borradores, los cambios de administración y las preferencias guardadas en este navegador. No se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="ghost" data-autofocus onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<RotateCcw />} onClick={confirmReset}>
              Restablecer
            </Button>
          </>
        }
      />
    </div>
  );
}

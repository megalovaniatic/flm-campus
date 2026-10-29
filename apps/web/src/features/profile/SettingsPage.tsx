import { animate, motion } from 'motion/react';
import {
  ArrowRight,
  Bell,
  CalendarHeart,
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
import { AREAS, madridDateKey, missingPersonalDates, number as formatNumber, ROLE_LABEL } from '@flm/shared';
import { Button, Dialog, Kbd, Notice, PageHeader, Switch, toast } from '@/design';
import { useMe } from '@/data/selectors';
import { useDemo, type MotionPref, type ThemePref } from '@/data/store';
import { resetDemo } from '@/layout/DemoBand';
import { downloadText } from '@/lib/download';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { scrollToSection, useHashScroll, useScrollSpy } from '@/features/about/useSectionNav';
import { OwnDatesForm } from '@/features/admin/PersonalDates';
import { birthdayText } from '@/features/admin/personForm';
import { useNoticePrefs } from './noticePrefs';
import styles from './SettingsPage.module.css';

const SECTIONS = [
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'movimiento', label: 'Movimiento', icon: Sparkles },
  { id: 'teclado', label: 'Teclado', icon: Keyboard },
  { id: 'avisos', label: 'Avisos', icon: Bell },
  { id: 'calendario', label: 'Calendario', icon: CalendarHeart },
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
  const signOut = useDemo((s) => s.signOut);
  const prefs = useNoticePrefs();
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const systemReduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const reduce = useReducedMotionPref();
  const active = useScrollSpy(SECTION_IDS);
  const [announce, setAnnounce] = useState('');
  const [run, setRun] = useState(0);
  const [confirm, setConfirm] = useState(false);
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

  const missingDates = missingPersonalDates(me);
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
        // Calendario de empresa: el cumpleaños sin año de nacimiento; null si no consta
        cumpleanos: birthdayText(me),
        fechaDeIncorporacion: me.startDate ?? null,
      },
      preferencias: { tema: s.theme, movimiento: s.motion, atajosDeUnaTecla: s.singleKeyShortcuts, avisos: { agenda: prefs.agenda, novedades: prefs.novedades, correo: prefs.correo } },
      progreso: Object.values(s.progress).map((p) => ({ formacion: p.formationId, lecturaConfirmada: p.readAt ?? null, versionLeida: p.readVersion ?? null, intentos: p.attempts.map((a) => ({ fecha: a.at, aciertos: a.correct, preguntas: a.total, superado: a.passed, version: a.version })) })),
      evaluaciones: Object.entries(s.assessmentAttempts).map(([id, list]) => ({ evaluacion: id, intentos: list.map((a) => ({ fecha: a.at, aciertos: a.correct, preguntas: a.total, superada: a.passed })) })),
      reconocimientosVistos: s.celebrated,
    };
    downloadText(`flm-campus-mis-datos-${madridDateKey()}.json`, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
    toast.success('Datos descargados', 'El archivo JSON incluye tu ficha, tu progreso y tus preferencias.');
  };

  const confirmReset = () => {
    // También cierra los avisos abiertos: su «Deshacer» devolvería lo que se acaba de borrar.
    resetDemo();
    useNoticePrefs.getState().resetPrefs();
    setConfirm(false);
    setRun(0);
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

          <section id="avisos" aria-labelledby="h-avisos" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-avisos" className={styles.panelTitle}>
                Avisos
              </h2>
              <p className={styles.panelLede}>Qué quieres ver en la campana de avisos.</p>
            </header>
            <div className={styles.switchList}>
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

          <section id="calendario" aria-labelledby="h-calendario" className={styles.panel}>
            <header className={styles.panelHead}>
              <h2 id="h-calendario" className={styles.panelTitle}>
                Calendario de empresa
              </h2>
              <p className={styles.panelLede}>
                {missingDates.length === 0
                  ? 'Tu cumpleaños y tu aniversario en FLM ya aparecen en el calendario de empresa.'
                  : missingDates.length === 2
                    ? 'Aún no constan tu cumpleaños ni tu fecha de incorporación. Puedes completarlos ahora o más adelante: el campus funciona igual.'
                    : `Aún no consta tu ${missingDates[0] === 'birthday' ? 'cumpleaños' : 'fecha de incorporación'}. Puedes completarlo ahora o más adelante: el campus funciona igual.`}
              </p>
            </header>
            <OwnDatesForm key={`${me.id}|${me.birthday ?? ''}|${me.startDate ?? ''}`} person={me} formId="ajustes-calendario" inline />
            <p className={styles.calendarLink}>
              <Link to="/participar/calendario" className="link-arrow">
                Ver el calendario de empresa <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </p>
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
                  <CalendarHeart size={18} />
                </span>
                <span>
                  <strong>Calendario de empresa.</strong> Tu cumpleaños (solo el día y el mes, nunca el año) y tu fecha de incorporación se muestran a todo el equipo en el calendario, como tu cumpleaños y tu aniversario en FLM. No se usan para nada más y se borran al eliminar tu perfil.
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

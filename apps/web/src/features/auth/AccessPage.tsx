import { AnimatePresence, MotionConfig, motion, type Variants } from 'motion/react';
import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, Eye, FlaskConical, KeyRound, LayoutDashboard, Lock, PenLine, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CORPORATE_DOMAIN, isCorporateEmail, type Role } from '@flm/shared';
import { Avatar, Button, Checkbox, Notice, TextField } from '@/design';
import { DEMO_USER_ID, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { Logo } from '@/layout/Logo';
import { asset } from '@/lib/download';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle, usePreferenceEffects, useReducedMotionPref } from '@/lib/preferences';
import { AccessError, login, RECOVERY_MESSAGE, requestPasswordReset } from './authApi';
import styles from './AccessPage.module.css';

const base = import.meta.env.BASE_URL;

/** Validación del correo corporativo con mensajes que dicen qué hacer. */
function emailProblem(value: string): string | undefined {
  const v = value.trim();
  if (!v) return MESSAGES.required('tu correo corporativo');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `Escribe el correo completo, por ejemplo nombre.apellido@${CORPORATE_DOMAIN}.`;
  if (!isCorporateEmail(v)) return `Usa tu correo corporativo, el que termina en @${CORPORATE_DOMAIN}.`;
  return undefined;
}

const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Entrada a la demostración ─────────────────────────────────────────── */

function DemoEntry({ onEnter }: { onEnter: (role: Role | null) => void }) {
  const people = usePeople();
  const demo = people.find((p) => p.id === DEMO_USER_ID);
  const name = demo?.name ?? 'Judith Calet';
  const position = demo?.position ?? 'Asesora Contable';
  return (
    <motion.section variants={rise} aria-labelledby="h-demo" className={styles.demo}>
      <p className={styles.badge}>
        <FlaskConical size={14} aria-hidden="true" /> Demostración pública
      </p>
      <h2 id="h-demo" className={styles.demoTitle}>
        Entra sin contraseña
      </h2>
      <p className={styles.demoText}>Esta demostración no pide contraseñas y guarda lo que hagas solo en tu navegador. Elige con qué permisos quieres recorrer el campus.</p>
      <button type="button" className={styles.entry} onClick={() => onEnter(null)}>
        <Avatar name={name} photo={demo?.photo ? base + demo.photo : undefined} size={48} decorative />
        <span className={styles.entryText}>
          <span className={styles.entryTitle}>
            Entrar como {name} <span className={styles.entryRole}>({position})</span>
          </span>
          <span className={styles.entrySub}>Perfil Empleado: formaciones, tests, agenda y tu progreso</span>
        </span>
        <ArrowRight size={20} aria-hidden="true" className={styles.entryArrow} />
      </button>
      <div className={styles.roles}>
        <button type="button" className={styles.role} onClick={() => onEnter('autor')}>
          <PenLine size={18} aria-hidden="true" />
          <span>
            <span className={styles.roleTitle}>Ver como autor</span>
            <span className={styles.roleText}>Además, prepara contenidos y los envía a revisión</span>
          </span>
        </button>
        <button type="button" className={styles.role} onClick={() => onEnter('admin')}>
          <LayoutDashboard size={18} aria-hidden="true" />
          <span>
            <span className={styles.roleTitle}>Ver como administrador</span>
            <span className={styles.roleText}>Además, publica y gestiona contenidos, personas e informes</span>
          </span>
        </button>
      </div>
    </motion.section>
  );
}

/* ── Acceso de la versión interna (vista previa en la demo) ────────────── */

type View = 'login' | 'forgot' | 'sent';

function PrivateAccess({ demo, onSignedIn }: { demo: boolean; onSignedIn: (userId: string) => void }) {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<{ tone: 'info' | 'danger' | 'success'; text: string }>();
  const [busy, setBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  // Vista anterior: el foco solo se mueve al cambiar de vista (seguro con el doble montaje de StrictMode).
  const prevView = useRef(view);

  useEffect(() => {
    if (prevView.current === view) return;
    prevView.current = view;
    heading.current?.focus();
  }, [view]);

  const go = (next: View) => {
    setError(undefined);
    setResult(undefined);
    setTouched(false);
    setView(next);
  };

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    const problem = emailProblem(email);
    setTouched(true);
    setError(problem);
    setResult(undefined);
    if (problem) return;
    if (demo) {
      setResult({ tone: 'info', text: 'Vista previa: en la demostración no se inicia sesión con contraseña. Usa «Entrar como Judith Calet» o uno de los perfiles de arriba.' });
      return;
    }
    if (!password) {
      setResult({ tone: 'danger', text: MESSAGES.required('tu contraseña') });
      return;
    }
    setBusy(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      onSignedIn(user.id);
    } catch (err) {
      setResult({ tone: 'danger', text: err instanceof AccessError ? err.message : 'No se ha podido iniciar sesión. Inténtalo de nuevo.' });
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async (e: FormEvent) => {
    e.preventDefault();
    const problem = emailProblem(email);
    setTouched(true);
    setError(problem);
    if (problem) return;
    if (demo) {
      go('sent');
      setResult({ tone: 'success', text: RECOVERY_MESSAGE });
      return;
    }
    setBusy(true);
    try {
      const message = await requestPasswordReset(email.trim().toLowerCase());
      go('sent');
      setResult({ tone: 'success', text: message });
    } catch (err) {
      setResult({ tone: 'danger', text: err instanceof AccessError ? err.message : 'No se ha podido enviar la solicitud. Inténtalo de nuevo.' });
    } finally {
      setBusy(false);
    }
  };

  const emailField = (
    <TextField
      label="Correo corporativo"
      type="email"
      inputMode="email"
      autoComplete="username"
      spellCheck={false}
      autoCapitalize="none"
      placeholder={`nombre.apellido@${CORPORATE_DOMAIN}`}
      hint={`Solo se admiten cuentas @${CORPORATE_DOMAIN}.`}
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        if (touched) setError(emailProblem(e.target.value));
      }}
      onBlur={() => {
        if (email.trim()) {
          setTouched(true);
          setError(emailProblem(email));
        }
      }}
      error={error}
      required
    />
  );

  const title = view === 'login' ? 'Acceso con tu cuenta de FLM' : view === 'forgot' ? 'Recuperar el acceso' : 'Revisa tu correo';

  return (
    <motion.section variants={rise} aria-labelledby="h-interna" className={styles.private} data-demo={demo || undefined}>
      {demo && (
        <p className={styles.previewBadge}>
          <Eye size={14} aria-hidden="true" /> Vista previa · así será en la versión interna
        </p>
      )}
      <h2 id="h-interna" ref={heading} tabIndex={-1} className={styles.privateTitle}>
        {title}
      </h2>
      {demo && view === 'login' && <p className={styles.privateNote}>En la demostración el formulario no comprueba contraseñas ni envía datos: puedes probar la validación del correo y la recuperación de contraseña.</p>}

      <AnimatePresence mode="wait" initial={false}>
        {view === 'login' && (
          <motion.form key="login" className={styles.form} onSubmit={submitLogin} noValidate initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
            {emailField}
            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={demo}
              placeholder={demo ? 'No se pide en la demostración' : undefined}
              hint={demo ? 'En la versión interna: mínimo 12 caracteres, con letras y números.' : undefined}
            />
            <div className={styles.formRow}>
              <Checkbox label="Mostrar la contraseña" checked={showPassword} onChange={setShowPassword} disabled={demo} />
              <button type="button" className={styles.textButton} onClick={() => go('forgot')}>
                ¿Has olvidado tu contraseña?
              </button>
            </div>
            <Button type="submit" block size="lg" icon={<Lock />} disabled={busy} aria-busy={busy || undefined}>
              {busy ? 'Entrando…' : 'Entrar'}
            </Button>
          </motion.form>
        )}
        {view === 'forgot' && (
          <motion.form key="forgot" className={styles.form} onSubmit={submitForgot} noValidate initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.22 }}>
            <p className={styles.formText}>Escribe tu correo corporativo y te enviaremos un enlace para crear una contraseña nueva. El enlace caduca a los 30 minutos y solo sirve una vez.</p>
            {emailField}
            <div className={styles.formActions}>
              <Button type="submit" icon={<KeyRound />} disabled={busy} aria-busy={busy || undefined}>
                {busy ? 'Enviando…' : 'Enviar el enlace'}
              </Button>
              <Button variant="ghost" icon={<ArrowLeft />} onClick={() => go('login')}>
                Volver al acceso
              </Button>
            </div>
          </motion.form>
        )}
        {view === 'sent' && (
          <motion.div key="sent" className={styles.form} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
            <p className={styles.formText}>Por seguridad, la respuesta es la misma tanto si la cuenta existe como si no.</p>
            <Button variant="secondary" icon={<ArrowLeft />} onClick={() => go('login')}>
              Volver al acceso
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div role="status" aria-live="polite" className={styles.result}>
        {result && (
          <Notice tone={result.tone === 'danger' ? 'warning' : result.tone} icon={result.tone === 'success' ? <CircleCheck size={18} /> : result.tone === 'danger' ? <CircleAlert size={18} /> : <FlaskConical size={18} />}>
            {result.text}
            {demo && view === 'sent' && <span className={styles.simulated}> Simulación: en la demostración no se envía ningún correo.</span>}
          </Notice>
        )}
      </div>
    </motion.section>
  );
}

/* ── Página ────────────────────────────────────────────────────────────── */

/** Pantalla de acceso independiente (sin la estructura común del campus). */
export default function AccessPage() {
  usePreferenceEffects();
  usePageTitle('Acceso');
  const reduce = useReducedMotionPref();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get('caducada') === '1';
  const userId = useDemo((s) => s.userId);
  const signIn = useDemo((s) => s.signIn);
  const setRoleView = useDemo((s) => s.setRoleView);
  const people = usePeople();
  const current = people.find((p) => p.id === userId);

  const enterDemo = (role: Role | null) => {
    signIn(DEMO_USER_ID);
    if (role) setRoleView(role);
    navigate('/', { replace: true });
  };

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <div className={styles.page}>
        <main className={styles.main}>
          <motion.figure className={styles.art} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <img
              src={asset('brand/flm-redes.png')}
              alt="Pieza oficial de FLM para redes: las letras F, L y M en tres círculos blancos sobre grandes círculos translúcidos en rojo, burdeos y azul."
              width={1073}
              height={1073}
              className={styles.artImg}
              decoding="async"
              fetchPriority="high"
            />
            <figcaption className={styles.caption}>Pieza oficial de FLM para redes sociales</figcaption>
          </motion.figure>

          <motion.div className={styles.panel} initial={reduce ? false : 'hidden'} animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}>
            <motion.div variants={rise} className={styles.brand}>
              <Logo variant="crowe" height={40} />
            </motion.div>
            <motion.div variants={rise} className={styles.intro}>
              <p className="eyebrow">Campus · uso interno</p>
              <h1 className={styles.title}>Te damos la bienvenida a FLM Campus</h1>
              <p className={styles.lede}>
                Tu espacio para estar al día, compartir conocimiento y avanzar en FLM<span className="red-dot" aria-hidden="true" />
              </p>
            </motion.div>

            {expired && (
              <motion.div variants={rise}>
                <Notice tone="warning" title={MESSAGES.sessionExpired.title} icon={<Lock size={18} />}>
                  {MESSAGES.sessionExpired.body}
                </Notice>
              </motion.div>
            )}

            {current && !expired && (
              <motion.div variants={rise}>
                <Notice tone="info" icon={<CircleCheck size={18} />}>
                  Ya has entrado como {current.name}.{' '}
                  <Link to="/" className={styles.inlineLink}>
                    Continuar en el campus
                  </Link>
                </Notice>
              </motion.div>
            )}

            {__DEMO__ && <DemoEntry onEnter={enterDemo} />}

            <PrivateAccess
              demo={__DEMO__}
              onSignedIn={(id) => {
                signIn(id);
                navigate('/', { replace: true });
              }}
            />

            <motion.div variants={rise} className={styles.foot}>
              <p>
                <ShieldCheck size={15} aria-hidden="true" /> Solo usamos cookies técnicas para mantener la sesión. Sin analítica ni seguimiento.
              </p>
              <p>
                FLM · Barcelona · Vic · Granollers ·{' '}
                <a href="https://flmexperts.com/" target="_blank" rel="noreferrer">
                  flmexperts.com<span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}

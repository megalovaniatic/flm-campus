import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, CircleAlert, CircleCheck, Eye, KeyRound, LoaderCircle, Minus } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { PASSWORD_MIN_LENGTH, passwordChecks, passwordInput } from '@flm/shared';
import { Button, ButtonLink, Checkbox, Notice, TextField } from '@/design';
import { DEMO_USER_ID, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { usePageTitle } from '@/lib/preferences';
import { AccessError, activateAccount, checkAccountLink, LINK_ERRORS, resetPassword, type AccountLink } from './authApi';
import { AccessFrame, rise } from './AccessFrame';
import styles from './AccessPage.module.css';

const COPY = {
  activar: {
    page: 'Activar la cuenta',
    title: 'Activa tu cuenta de FLM Campus',
    lede: 'Elige la contraseña con la que entrarás con tu correo corporativo.',
    heading: 'Elige tu contraseña',
    submit: 'Activar la cuenta',
    busy: 'Activando…',
    done: 'Cuenta activada',
    hint: 'Los enlaces de activación los envía administración.',
  },
  restablecer: {
    page: 'Nueva contraseña',
    title: 'Crea una contraseña nueva',
    lede: 'Al guardarla se cierran todas tus sesiones abiertas, también en otros dispositivos.',
    heading: 'Tu nueva contraseña',
    submit: 'Guardar la contraseña',
    busy: 'Guardando…',
    done: 'Contraseña guardada',
    hint: '',
  },
} as const;

/** Qué decir cuando el enlace no sirve: el motivo que da la API y, si hace falta, a quién pedir otro. */
function linkProblem(kind: AccountLink, message: string, code?: string): string {
  const hint = COPY[kind].hint && code !== 'ENLACE_CADUCADO' && code !== 'CUENTA_DESACTIVADA' ? ` ${COPY[kind].hint}` : '';
  return `${message}${hint}`;
}

type State = { step: 'comprobando' } | { step: 'formulario'; name: string; email: string } | { step: 'enlace'; message: string } | { step: 'hecho'; message: string; userId?: string };

/** Requisitos a la vista mientras se escribe (los mismos que valida la API). */
function Requirements({ password }: { password: string }) {
  const ok = passwordChecks(password);
  const items = [
    { met: ok.length, text: `Al menos ${PASSWORD_MIN_LENGTH} caracteres` },
    { met: ok.lettersAndNumbers, text: 'Letras y números' },
  ];
  return (
    <span className={styles.checks}>
      {items.map((i) => (
        <span key={i.text} className={styles.check} data-met={i.met || undefined}>
          {i.met ? <Check size={14} aria-hidden="true" /> : <Minus size={14} aria-hidden="true" />}
          {i.text}
          <span className="sr-only">{i.met ? ' (cumplido)' : ' (pendiente)'}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * «Activar la cuenta» y «Nueva contraseña»: las páginas a las que llevan los enlaces de los correos
 * (`#/activar?token=…` y `#/restablecer-contrasena?token=…`). El token se lee una vez y se quita de la
 * barra de direcciones; antes de pedir la contraseña se comprueba que el enlace sigue sirviendo.
 * En la demostración pública no hay servidor: las pantallas se ven como vista previa y nada se envía.
 */
export default function AccountLinkPage() {
  const { pathname } = useLocation();
  const kind: AccountLink = pathname.startsWith('/activar') ? 'activar' : 'restablecer';
  const copy = COPY[kind];
  usePageTitle(copy.page);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token] = useState(() => params.get('token') ?? '');
  const people = usePeople();
  const signIn = useDemo((s) => s.signIn);
  const demoPerson = people.find((p) => p.id === DEMO_USER_ID);

  const [state, setState] = useState<State>({ step: 'comprobando' });
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; repeat?: string }>({});
  const [failure, setFailure] = useState<string>();
  const [busy, setBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstStep = useRef(true);

  // El token no se queda en la barra de direcciones ni en el historial
  useEffect(() => {
    if (params.has('token')) navigate(pathname, { replace: true });
  }, [params, pathname, navigate]);

  useEffect(() => {
    let cancelled = false;
    if (__DEMO__) {
      setState({ step: 'formulario', name: demoPerson?.name ?? 'Judith Calet', email: demoPerson?.email ?? 'judith.calet@flmexperts.com' });
      return;
    }
    if (!token) {
      setState({ step: 'enlace', message: linkProblem(kind, 'Al enlace le falta su código: ábrelo de nuevo desde el correo, sin recortarlo.') });
      return;
    }
    checkAccountLink(kind, token)
      .then((info) => !cancelled && setState({ step: 'formulario', name: info.name, email: info.email }))
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof AccessError && e.code && LINK_ERRORS.has(e.code)) setState({ step: 'enlace', message: linkProblem(kind, e.message, e.code) });
        else setState({ step: 'enlace', message: e instanceof AccessError ? e.message : 'No hemos podido comprobar el enlace. Revisa la conexión y vuelve a abrirlo.' });
      });
    return () => {
      cancelled = true;
    };
    // Se comprueba una sola vez, con el token del enlace
  }, [token, kind]);

  // El foco pasa al titular de cada paso (no en la primera carga, para no saltarse la página)
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = state.step === 'comprobando';
      return;
    }
    heading.current?.focus();
  }, [state.step]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = passwordInput.safeParse(password);
    const next = {
      password: parsed.success ? undefined : (parsed.error.issues[0]?.message ?? 'Revisa la contraseña.'),
      repeat: !repeat ? 'Repite la contraseña para comprobar que la has escrito bien.' : repeat !== password ? 'Las dos contraseñas no coinciden.' : undefined,
    };
    setErrors(next);
    setFailure(undefined);
    if (next.password || next.repeat) return;
    if (__DEMO__) {
      setState({ step: 'hecho', message: kind === 'activar' ? 'Así se confirma: la cuenta queda activada y entras directamente en el campus.' : 'Así se confirma: la contraseña queda guardada y se cierran tus demás sesiones.' });
      return;
    }
    setBusy(true);
    try {
      if (kind === 'activar') {
        const user = await activateAccount(token, password);
        setState({ step: 'hecho', message: `Te damos la bienvenida, ${user.name}. Ya has entrado en el campus.`, userId: user.id });
      } else {
        setState({ step: 'hecho', message: await resetPassword(token, password) });
      }
    } catch (err) {
      if (err instanceof AccessError && err.code && LINK_ERRORS.has(err.code)) setState({ step: 'enlace', message: linkProblem(kind, err.message, err.code) });
      else setFailure(err instanceof AccessError ? err.message : 'No se ha podido guardar la contraseña. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const enterCampus = (userId?: string) => {
    if (userId) signIn(userId);
    navigate('/', { replace: true });
  };

  return (
    <AccessFrame title={copy.title} lede={copy.lede}>
      <motion.section variants={rise} aria-labelledby="h-enlace" aria-busy={state.step === 'comprobando' || undefined} className={styles.private} data-demo={__DEMO__ || undefined}>
        {__DEMO__ && (
          <p className={styles.previewBadge}>
            <Eye size={14} aria-hidden="true" /> Vista previa · así será en la versión interna
          </p>
        )}

        {state.step === 'comprobando' && (
          <>
            <h2 id="h-enlace" ref={heading} tabIndex={-1} className={styles.privateTitle}>
              Comprobando el enlace…
            </h2>
            <p className={styles.formText}>
              <LoaderCircle size={16} aria-hidden="true" className={styles.spin} /> Un momento: comprobamos que el enlace sigue siendo válido.
            </p>
          </>
        )}

        {state.step === 'formulario' && (
          <>
            <h2 id="h-enlace" ref={heading} tabIndex={-1} className={styles.privateTitle}>
              {copy.heading}
            </h2>
            <p className={styles.formText}>
              Cuenta de <strong>{state.name}</strong> · {state.email}
            </p>
            {__DEMO__ && <p className={styles.privateNote}>En la demostración no se guarda ninguna contraseña: puedes probar los requisitos y la confirmación.</p>}
            <form className={styles.form} onSubmit={submit} noValidate>
              {/* Para que el gestor de contraseñas asocie la nueva a la cuenta */}
              <input type="email" name="username" autoComplete="username" value={state.email} readOnly hidden />
              <TextField
                label="Contraseña nueva"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((x) => ({ ...x, password: undefined }));
                }}
                hint={<Requirements password={password} />}
                error={errors.password}
                required
              />
              <TextField
                label="Repite la contraseña"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={repeat}
                onChange={(e) => {
                  setRepeat(e.target.value);
                  if (errors.repeat) setErrors((x) => ({ ...x, repeat: undefined }));
                }}
                error={errors.repeat}
                required
              />
              <Checkbox label="Mostrar las contraseñas" checked={show} onChange={setShow} />
              <Button type="submit" block size="lg" icon={<KeyRound />} disabled={busy} aria-busy={busy || undefined}>
                {busy ? copy.busy : copy.submit}
              </Button>
            </form>
          </>
        )}

        {state.step === 'enlace' && (
          <>
            <h2 id="h-enlace" ref={heading} tabIndex={-1} className={styles.privateTitle}>
              Este enlace ya no sirve
            </h2>
            <Notice tone="warning" icon={<CircleAlert size={18} />}>
              {state.message}
            </Notice>
            <div className={styles.formActions}>
              {kind === 'restablecer' && (
                <ButtonLink to="/acceso?recuperar=1" icon={<KeyRound />}>
                  Pedir un enlace nuevo
                </ButtonLink>
              )}
              <ButtonLink to="/acceso" variant={kind === 'restablecer' ? 'ghost' : 'secondary'} icon={<ArrowLeft />}>
                Ir al acceso
              </ButtonLink>
            </div>
          </>
        )}

        {state.step === 'hecho' && (
          <>
            <h2 id="h-enlace" ref={heading} tabIndex={-1} className={styles.privateTitle}>
              {copy.done}
            </h2>
            <Notice tone="success" icon={<CircleCheck size={18} />}>
              {state.message}
              {__DEMO__ && <span className={styles.simulated}> Simulación: en la demostración no se guarda ninguna contraseña.</span>}
            </Notice>
            {kind === 'activar' && !__DEMO__ ? (
              <Button icon={<ArrowRight />} onClick={() => enterCampus(state.userId)}>
                Entrar en el campus
              </Button>
            ) : (
              <ButtonLink to="/acceso" variant="secondary" icon={<ArrowRight />}>
                Ir al acceso
              </ButtonLink>
            )}
          </>
        )}

        <div role="status" aria-live="polite" className={styles.result}>
          {failure && (
            <Notice tone="warning" icon={<CircleAlert size={18} />}>
              {failure}
            </Notice>
          )}
        </div>
      </motion.section>
    </AccessFrame>
  );
}

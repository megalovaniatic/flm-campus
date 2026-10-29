import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { CalendarHeart, Clock, DatabaseBackup, KeyRound, ListChecks, MailCheck, RefreshCw, ScrollText, Timer, UserRoundMinus } from 'lucide-react';
import { Link } from 'react-router';
import { useDemo } from '@/data/store';
import { useReducedMotionPref } from '@/lib/preferences';
import styles from './Admin.module.css';

interface Policy {
  id: string;
  figure: string;
  label: string;
  detail: string;
  ms: number;
  icon: LucideIcon;
}

const MIN = 60_000;
const DAY = 86_400_000;

/** Plazos de la versión interna (los mismos que aplica la API). */
const POLICIES: Policy[] = [
  { id: 'recuperacion', figure: '30 min', label: 'Enlace para restablecer la contraseña', detail: 'De un solo uso. Pedir uno nuevo invalida los anteriores.', ms: 30 * MIN, icon: KeyRound },
  { id: 'inactividad', figure: '12 h', label: 'Sesión sin actividad', detail: 'Tras 12 horas sin actividad, la sesión se cierra y hay que volver a entrar.', ms: 12 * 60 * MIN, icon: Timer },
  { id: 'activacion', figure: '7 días', label: 'Enlace de activación de la cuenta', detail: 'De un solo uso. Si caduca, administración envía uno nuevo.', ms: 7 * DAY, icon: MailCheck },
  { id: 'maxima', figure: '14 días', label: 'Duración máxima de una sesión', detail: 'Aunque haya actividad, a los 14 días se pide iniciar sesión de nuevo.', ms: 14 * DAY, icon: Clock },
  { id: 'intentos', figure: '+1 año', label: 'Intentos de test y lecturas', detail: 'Mientras la persona esté activa y hasta 1 año después de su baja, o hasta que se elimine su perfil. Después, los intentos se desvinculan (quedan como agregados anónimos) y las lecturas se borran.', ms: 365 * DAY, icon: ListChecks },
  { id: 'auditoria', figure: '2 años', label: 'Registro de auditoría', detail: 'Quién, qué y cuándo. Nunca guarda contraseñas, tokens, correos ni nombres en el detalle.', ms: 730 * DAY, icon: ScrollText },
];

const TICKS: { label: string; ms: number }[] = [
  { label: '1 hora', ms: 60 * MIN },
  { label: '1 día', ms: DAY },
  { label: '1 semana', ms: 7 * DAY },
  { label: '1 mes', ms: 30 * DAY },
  { label: '1 año', ms: 365 * DAY },
];

const lo = Math.log(POLICIES[0]!.ms);
const hi = Math.log(POLICIES[POLICIES.length - 1]!.ms);
const pos = (ms: number) => (Math.log(ms) - lo) / (hi - lo);

/** Regla logarítmica: de 30 minutos a 2 años, cada plazo en su sitio. Decorativa: la lista la acompaña. */
function Ruler() {
  const reduce = useReducedMotionPref();
  return (
    <div className={styles.ruler} aria-hidden="true">
      <motion.span className={styles.rulerLine} initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} />
      {TICKS.map((t) => (
        <span key={t.label} className={styles.rulerTick} style={{ left: `${pos(t.ms) * 100}%` }}>
          <span>{t.label}</span>
        </span>
      ))}
      {POLICIES.map((p, i) => {
        const x = pos(p.ms);
        const edge = x < 0.08 ? 'start' : x > 0.92 ? 'end' : 'mid';
        // La posición (left y su translateX) va en el contenedor; la animación, dentro: así no la pisa el transform de motion
        return (
          <span key={p.id} className={styles.rulerMark} data-side={i % 2 ? 'below' : 'above'} data-edge={edge} style={{ left: `${x * 100}%` }}>
            <motion.span
              className={styles.rulerMarkBody}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduce ? 0 : 0.2 + i * 0.06, type: 'spring', stiffness: 420, damping: 28 }}
            >
              <span className={styles.rulerCap}>{p.figure}</span>
              <span className={styles.rulerStem} />
            </motion.span>
          </span>
        );
      })}
    </div>
  );
}

/** Retención: cuánto se conserva cada dato, eliminación controlada y copias de seguridad. */
export function RetentionSection() {
  const drafts = useDemo((s) => Object.keys(s.drafts).length);
  const audit = useDemo((s) => s.audit.length);
  const attempts = useDemo((s) => Object.values(s.progress).reduce((n, p) => n + p.attempts.length, 0));
  const peopleChanges = useDemo((s) => Object.keys(s.peopleOverrides).length);
  const removedProfiles = useDemo((s) => Object.keys(s.removedPeople).length);

  return (
    <section className={styles.section} aria-labelledby="h-retencion">
      <div className={styles.sectionHead}>
        <h2 id="h-retencion" className="section-title">
          Cuánto se conserva cada dato
        </h2>
        <p className={styles.summary}>En escala logarítmica: de 30 minutos a 2 años.</p>
      </div>

      <Ruler />

      <ul role="list" className={styles.policies}>
        {POLICIES.map((p) => {
          const Icon = p.icon;
          return (
            <li key={p.id} className={styles.policy}>
              <span className={styles.policyIcon} aria-hidden="true">
                <Icon size={18} />
              </span>
              <p className={styles.policyFigure}>{p.figure}</p>
              <h3 className={styles.policyLabel}>{p.label}</h3>
              <p className={styles.policyDetail}>{p.detail}</p>
            </li>
          );
        })}
      </ul>

      <div className={styles.retentionGrid}>
        <article className={styles.retCard}>
          <h3 className={styles.retTitle}>
            <UserRoundMinus size={18} aria-hidden="true" /> Eliminar el perfil de quien deja FLM
          </h3>
          <ol className={styles.steps}>
            <li>Lo hace administración cuando una persona deja la firma, a más tardar al revisar las cuentas desactivadas hace más de 1 año. Si solo se ausenta una temporada, basta con desactivar la cuenta.</li>
            <li>Exige una confirmación explícita: escribir el correo de la persona.</li>
            <li>El perfil desaparece del campus: de Personas, de las búsquedas, de los informes, de «Ponte al día» y del calendario de empresa. Se retiran las bienvenidas que la anuncian, también las que están en borrador. Se cierran sus sesiones y se borran su fotografía, su cumpleaños, su fecha de incorporación, sus enlaces y sus lecturas.</li>
            <li>Sus contenidos se conservan sin autoría: las formaciones y las evaluaciones firman «Área … de FLM»; las noticias, los eventos, los documentos y los anuncios, «FLM». Si era la persona de referencia de un área, el área deja de mostrarla.</li>
            <li>Los intentos de test se desvinculan y solo cuentan como agregados anónimos.</li>
            <li>Queda constancia en la auditoría, sin datos personales en el detalle. No se puede aplicar a la propia cuenta ni al último administrador activo, y en la versión interna no se puede deshacer.</li>
          </ol>
          <Link to="/admin/personas" className="link-arrow">
            Ir a Personas
          </Link>
        </article>
        <article className={styles.retCard}>
          <h3 className={styles.retTitle}>
            <CalendarHeart size={18} aria-hidden="true" /> Cumpleaños y fecha de incorporación
          </h3>
          <ul className={styles.steps}>
            <li>Qué: el día y el mes del cumpleaños (nunca el año de nacimiento) y la fecha completa de incorporación. Se piden en el alta; en los perfiles anteriores se completan después, sin inventarlos ni bloquear el acceso.</li>
            <li>Para qué: el calendario de empresa muestra el cumpleaños cada año y el aniversario de incorporación desde que se cumple el primer año. Se calculan desde la ficha: no se guardan como eventos aparte.</li>
            <li>Quién lo ve: todo el equipo, en el calendario. La persona los completa o corrige desde su perfil (la fecha de incorporación que ya consta solo la cambia administración).</li>
            <li>Cuánto tiempo: mientras exista el perfil. Desactivar la cuenta los retira del calendario; eliminar el perfil los borra.</li>
          </ul>
        </article>
        <article className={styles.retCard}>
          <h3 className={styles.retTitle}>
            <DatabaseBackup size={18} aria-hidden="true" /> Copias de seguridad
          </h3>
          <ul className={styles.steps}>
            <li>Copia fechada de la base de datos que no detiene el servicio, con comprobación de integridad al terminar.</li>
            <li>Opcionalmente incluye los archivos subidos (PDF y fotografías).</li>
            <li>Se conservan solo las copias más recientes (número configurable, por ejemplo 14): un dato eliminado desaparece de las copias cuando estas rotan.</li>
          </ul>
        </article>
        <article className={styles.retCard}>
          <h3 className={styles.retTitle}>
            <RefreshCw size={18} aria-hidden="true" /> Purga automática
          </h3>
          <ul className={styles.steps}>
            <li>El servidor aplica esta política al arrancar y una vez al día.</li>
            <li>Borra sesiones caducadas, inactivas o revocadas (las conserva un día para poder explicar por qué se cerraron) y los enlaces usados o caducados.</li>
            <li>Cada purga con efectos queda en la auditoría como «Purga por retención».</li>
          </ul>
        </article>
        {__DEMO__ && (
          <article className={styles.retCard} data-tone="demo">
            <h3 className={styles.retTitle}>En esta demostración</h3>
            <p className={styles.policyDetail}>No hay servidor: todo se guarda solo en este navegador y «Restablecer», en la banda superior, lo borra.</p>
            <dl className={styles.localData}>
              <div>
                <dt>Borradores</dt>
                <dd>{drafts}</dd>
              </div>
              <div>
                <dt>Registros de auditoría</dt>
                <dd>{audit}</dd>
              </div>
              <div>
                <dt>Intentos de test</dt>
                <dd>{attempts}</dd>
              </div>
              <div>
                <dt>Fichas modificadas</dt>
                <dd>{peopleChanges}</dd>
              </div>
              <div>
                <dt>Perfiles eliminados</dt>
                <dd>{removedProfiles}</dd>
              </div>
            </dl>
          </article>
        )}
      </div>
    </section>
  );
}

import { useInView } from 'motion/react';
import { ArrowRight, Play, RotateCcw } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Button, IconButton, Tabs } from '@/design';
import { useDemo } from '@/data/store';
import { useReducedMotionPref } from '@/lib/preferences';
import { Escalon } from '@/motion/Escalon';
import { bridgePath, easeOut, segment } from '@/motion/liquid';
import { DossierSection, SubHead } from './Section';
import { useTimeline } from './useTimeline';
import styles from './Concept.module.css';

/* ── Demostraciones de los cuatro verbos ───────────────────────────────── */

function Tocar({ t }: { t: number }) {
  const k = easeOut(segment(t, 0.05, 0.85));
  const x = 150 + 56 * (1 - k);
  return (
    <>
      <circle cx={92} cy={60} r={28} className={styles.fillA} />
      <circle cx={x} cy={60} r={28} className={styles.fillB} opacity={0.35 + 0.65 * k} />
    </>
  );
}

function Unir({ t, gid }: { t: number; gid: string }) {
  const spread = 0.5 * easeOut(segment(t, 0.15, 0.9));
  const d = bridgePath([78, 60], 30, [162, 60], 30, spread);
  return (
    <g fill={`url(#${gid})`}>
      {d && <path d={d} />}
      <circle cx={78} cy={60} r={30} />
      <circle cx={162} cy={60} r={30} opacity={0.4 + 0.6 * easeOut(segment(t, 0, 0.5))} />
    </g>
  );
}

function Crecer({ t }: { t: number }) {
  const k = easeOut(segment(t, 0.1, 0.72));
  const w = 48 + 152 * k;
  const label = segment(t, 0.62, 1);
  return (
    <>
      <rect x={20} y={36} width={w} height={48} rx={24} className={styles.capsule} />
      <path d="M 36 60 l 5 5 l 10 -10" fill="none" className={styles.capsuleInk} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <text x={60} y={60} dy="0.35em" className={styles.capsuleText} opacity={label} fontSize={13.5} fontWeight={650}>
        Itinerario completado
      </text>
    </>
  );
}

function Superponer({ t }: { t: number }) {
  const k = easeOut(segment(t, 0, 1));
  return (
    <>
      <circle cx={70 - 12 * (1 - k)} cy={74} r={58} className={styles.redRojo} opacity={0.55 * k} />
      <circle cx={132} cy={34 - 12 * (1 - k)} r={58} className={styles.redVino} opacity={0.7 * k} />
      <circle cx={176 + 12 * (1 - k)} cy={98} r={58} className={styles.redAzul} opacity={0.8 * k} />
    </>
  );
}

type Verb = 'tocar' | 'unir' | 'crecer' | 'superponer';

const VERBS: { id: Verb; title: string; from: string; meaning: string }[] = [
  { id: 'tocar', title: 'Tocar', from: 'Logotipo horizontal y vertical: tres círculos tangentes.', meaning: 'Estar juntos: las sesiones de un mismo evento.' },
  { id: 'unir', title: 'Unir', from: 'Variantes diagonal y en escalera: conectores líquidos.', meaning: 'Una acción crea una conexión: completar una formación, superar un test, asistir.' },
  { id: 'crecer', title: 'Crecer', from: 'Cápsulas de área: el círculo de la inicial se expande con el nombre.', meaning: 'Algo se nombra o se reconoce: la sección activa, un área, un reconocimiento.' },
  { id: 'superponer', title: 'Superponer', from: 'Pieza de redes: grandes círculos translúcidos.', meaning: 'Comunidad: la pantalla de acceso y los fondos de Participar.' },
];

function VerbCard({ verb }: { verb: (typeof VERBS)[number] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const { t, reduce } = useTimeline(stage, verb.id === 'superponer' ? 1.2 : 0.9, run);
  const gid = `about-g-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  let art: ReactNode;
  if (verb.id === 'tocar') art = <Tocar t={t} />;
  else if (verb.id === 'unir') art = <Unir t={t} gid={gid} />;
  else if (verb.id === 'crecer') art = <Crecer t={t} />;
  else art = <Superponer t={t} />;
  return (
    <li className={styles.verb}>
      <div ref={stage} className={styles.stage} data-verb={verb.id}>
        <svg viewBox="0 0 240 120" className={styles.art} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="48" y1="0" x2="192" y2="0">
              <stop offset="0" style={{ stopColor: 'var(--about-a)' }} />
              <stop offset="0.55" style={{ stopColor: 'var(--about-b)' }} />
              <stop offset="1" style={{ stopColor: 'var(--about-c)' }} />
            </linearGradient>
          </defs>
          {art}
        </svg>
        <IconButton label={`Repetir la animación de «${verb.title}»`} icon={<RotateCcw />} size="sm" variant="soft" className={styles.replay} onClick={() => setRun((n) => n + 1)} disabled={reduce} />
      </div>
      <h4 className={styles.verbTitle}>{verb.title}</h4>
      <p className={styles.verbFrom}>{verb.from}</p>
      <p className={styles.verbMeaning}>{verb.meaning}</p>
    </li>
  );
}

/* ── Gramática de formas ───────────────────────────────────────────────── */

function ShapeGlyph({ kind }: { kind: 'circulo' | 'capsula' | 'puente' | 'rectangulo' }) {
  if (kind === 'circulo') return <span className={styles.gCircle} />;
  if (kind === 'capsula') return <span className={styles.gCapsule} />;
  if (kind === 'rectangulo') return <span className={styles.gRect} />;
  const d = bridgePath([14, 16], 9, [40, 16], 9, 0.5);
  return (
    <svg viewBox="0 0 54 32" width="54" height="32" className={styles.gBridge} focusable="false">
      <path d={d} />
      <circle cx="14" cy="16" r="9" />
      <circle cx="40" cy="16" r="9" />
    </svg>
  );
}

const SHAPES = [
  { kind: 'circulo' as const, name: 'Círculo', meaning: 'Una persona real (fotografía o iniciales de dos letras) o un estado.' },
  { kind: 'capsula' as const, name: 'Cápsula', meaning: 'Una acción, una etiqueta, un estado, un lugar o un momento.' },
  { kind: 'puente' as const, name: 'Puente', meaning: 'Una conexión creada por una acción: completar, aprobar, asistir.' },
  { kind: 'rectangulo' as const, name: 'Rectángulo', meaning: 'Un documento o una imagen de archivo (radio de 6 a 8 px).' },
];

/* ── Momentos firma ────────────────────────────────────────────────────── */

function EscalonDemo() {
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { once: true, amount: 0.5 });
  const reduce = useReducedMotionPref();
  const [state, setState] = useState<'completada' | 'aun-no'>('completada');
  const [run, setRun] = useState(0);
  const panelId = useId();
  return (
    <div className={styles.moment}>
      <div className={styles.momentHead}>
        <h4 className={styles.momentTitle}>El escalón</h4>
        <p className={styles.momentWhen}>Al completar una formación</p>
      </div>
      <p className={styles.momentText}>
        Al superar el test (2 de 3 o más) con la lectura confirmada, los círculos de lectura y test se unen con puentes líquidos, el último sube un peldaño —como la variante «H-Arriba» del logotipo— y se abre en la cápsula «Formación completada». Si no se aprueba, no hay escalón: el veredicto «Aún no» va en tinta, nunca en rojo.
      </p>
      <Tabs
        label="Estado de la demostración"
        size="sm"
        panelId={panelId}
        value={state}
        onChange={(v) => {
          setState(v);
          setRun((n) => n + 1);
        }}
        options={[
          { value: 'completada', label: 'Test superado' },
          { value: 'aun-no', label: 'Aún no' },
        ]}
      />
      <div id={panelId} role="tabpanel" aria-label={state === 'completada' ? 'Test superado' : 'Aún no'} ref={stage} className={styles.escalonStage}>
        {inView && <Escalon key={`${state}-${run}`} read passed={state === 'completada'} play={!reduce} size={52} />}
        {state === 'aun-no' && (
          <p className={styles.verdict}>
            Aún no<span className={styles.verdictSub}>Repasar · Volver a intentarlo</span>
          </p>
        )}
      </div>
      <div className={styles.momentActions}>
        <Button variant="secondary" size="sm" icon={<RotateCcw />} onClick={() => setRun((n) => n + 1)} disabled={reduce}>
          Volver a reproducir
        </Button>
        {reduce && <p className={styles.reduceNote}>Tienes el movimiento reducido: ves directamente la composición final.</p>}
      </div>
    </div>
  );
}

function ArrivalMoment() {
  const setArrivalDay = useDemo((s) => s.setArrivalDay);
  const navigate = useNavigate();
  const reduce = useReducedMotionPref();
  return (
    <div className={styles.moment}>
      <div className={styles.momentHead}>
        <h4 className={styles.momentTitle}>La llegada</h4>
        <p className={styles.momentWhen}>En Inicio, una vez al día</p>
      </div>
      <p className={styles.momentText}>
        El mensaje base es el menú: «Tu espacio para <em>estar al día</em>, <em>compartir conocimiento</em> y <em>avanzar</em> en FLM». Cada expresión enlaza con Consultar, Participar y Aprender y se subraya con el degradado oficial en orden de lectura; el punto final es un círculo rojo y la fotografía de la oficina nace como círculo y se abre en cápsula. Dura menos de 1,5 segundos y se interrumpe con cualquier tecla, clic o desplazamiento.
      </p>
      <ol className={styles.timeline} aria-label="Secuencia de La llegada">
        <li>
          <span>0–0,2 s</span> Antetítulo con la fecha y el saludo según la hora de Madrid
        </li>
        <li>
          <span>0,1–0,7 s</span> El titular sube dentro de su máscara
        </li>
        <li>
          <span>0,7–1,3 s</span> Tres trazos con un único degradado y el punto rojo
        </li>
        <li>
          <span>0,8–1,2 s</span> La tira de datos vivos sube con escalonado
        </li>
      </ol>
      <div className={styles.momentActions}>
        <Button
          variant="secondary"
          size="sm"
          icon={<Play />}
          iconRight={<ArrowRight />}
          onClick={() => {
            setArrivalDay('');
            navigate('/');
          }}
        >
          Ver «La llegada» en Inicio
        </Button>
        {reduce && <p className={styles.reduceNote}>Con el movimiento reducido verás la composición final.</p>}
      </div>
    </div>
  );
}

/* ── Apartado ──────────────────────────────────────────────────────────── */

const CANDIDATES = [
  { name: 'Círculo de confianza', angle: 'humano', score: '8,07', role: 'Base elegida (2 de 3 votos): personas reales, «Hoy en FLM» y pertenencia.' },
  { name: 'Punto y seguido', angle: 'editorial', score: '8,15', role: 'Injerto: Newsreader e Inter, «el titular es el menú» y el test como «pruebas de imprenta».' },
  { name: 'Vasos comunicantes', angle: 'movimiento', score: '7,78', role: 'Injerto: la geometría oficial como gramática, «El escalón», sesiones unidas y fechas por confirmar.' },
  { name: 'Círculo abierto', angle: 'producto', score: '7,58', role: 'Injerto: búsqueda global, glifo de estado, autoguardado, «Deshacer» y «Ver como».' },
  { name: 'Del círculo a la palabra', angle: 'propio', score: '5,93', role: 'Descartado: sus círculos con letras imitaban el logotipo.' },
];

export function Concept() {
  return (
    <DossierSection id="concepto" number="01" eyebrow="Concepto" title="Círculo de confianza" lede="El logotipo de FLM ya cuenta una historia de personas. El campus la convierte en su manera de funcionar.">
      <figure className={styles.motto}>
        <blockquote>
          <p>
            Lo que sabe uno, lo sabemos todos<span className="red-dot" aria-hidden="true" />
          </p>
        </blockquote>
        <figcaption>Lema del campus. El concepto se llama «Círculo de confianza»; el producto, FLM Campus.</figcaption>
      </figure>

      <div className={styles.idea}>
        <div className={`prose ${styles.ideaText}`}>
          <p>
            El logotipo son tres círculos que se tocan, se unen con puentes líquidos y se expanden en cápsulas para alojar un nombre. El campus convierte ese comportamiento en su gramática: aprender, consultar y participar es, literalmente, conectar con las personas de la casa.
          </p>
          <p>
            En castellano, <em>círculo de confianza</em> es la gente a la que puedes preguntar sin miedo. Es lo que necesita una firma de unas cincuenta personas en tres sedes: <em>tres despachos, un mismo equipo</em>.
          </p>
        </div>
        <aside className={styles.choice} aria-labelledby="h-eleccion">
          <h3 id="h-eleccion" className={styles.asideTitle}>
            Cómo se eligió
          </h3>
          <p className={styles.asideText}>Cuatro direcciones independientes y una propia, valoradas por un jurado de dirección creativa, experiencia de usuario y accesibilidad, y socio de la firma. Puntuación media sobre 10:</p>
          <ul role="list" className={styles.candidates}>
            {CANDIDATES.map((c, i) => (
              <li key={c.name} data-chosen={i === 0 || undefined} data-discarded={i === CANDIDATES.length - 1 || undefined}>
                <span className={styles.candName}>
                  {c.name} <span className={styles.candAngle}>· {c.angle}</span>
                </span>
                <span className={styles.candScore}>{c.score}</span>
                <span className={styles.candRole}>{c.role}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <SubHead hint="Cada verbo sale de una variante oficial del logotipo y significa siempre lo mismo en la interfaz. Las animaciones se reproducen al llegar aquí; con el movimiento reducido ves su estado final.">
        Cuatro verbos sacados de la marca
      </SubHead>
      <ul role="list" className={styles.verbs}>
        {VERBS.map((v) => (
          <VerbCard key={v.id} verb={v} />
        ))}
      </ul>

      <SubHead hint="Formas con significado fijo: si algo es un círculo, es una persona o un estado.">Gramática de formas</SubHead>
      <ul role="list" className={styles.shapes}>
        {SHAPES.map((s) => (
          <li key={s.kind}>
            <span className={styles.shapeGlyph} aria-hidden="true">
              <ShapeGlyph kind={s.kind} />
            </span>
            <span className={styles.shapeName}>{s.name}</span>
            <span className={styles.shapeMeaning}>{s.meaning}</span>
          </li>
        ))}
      </ul>
      <p className={styles.rule}>Nunca hay letras dentro de un círculo ni pseudologotipos; el puente nunca se une al logotipo, y el degradado solo es superficie en la tarjeta protagonista de cada pantalla.</p>

      <SubHead hint="Dos como máximo, una vez al día o por logro, de menos de 1,5 segundos e interrumpibles.">Momentos firma</SubHead>
      <div className={styles.moments}>
        <ArrivalMoment />
        <EscalonDemo />
      </div>
    </DossierSection>
  );
}

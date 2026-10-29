import { BookOpen, House, Info, Library, Search, ShieldCheck, UserRound, Users, type LucideIcon } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Tabs } from '@/design';
import { useMe } from '@/data/selectors';
import { DossierSection, SubHead } from './Section';
import styles from './Architecture.module.css';

interface Node {
  label: string;
  to?: string;
  note?: string;
  children?: Node[];
}

const MAIN: (Node & { icon: LucideIcon })[] = [
  { label: 'Inicio', to: '/', icon: House, note: 'Tu siguiente paso, hoy en FLM, novedades y agenda', children: [] },
  {
    label: 'Aprender',
    to: '/aprender',
    icon: BookOpen,
    note: 'Formación por áreas',
    children: [
      {
        label: 'Fiscal · Laboral · Mercantil · Contable',
        to: '/aprender/fiscal',
        note: 'Tres formaciones por área',
        children: [
          { label: 'Formación', note: 'Lectura, ejemplo resuelto e idea clave' },
          { label: 'Test final', note: '3 preguntas · se supera con 2' },
        ],
      },
      { label: 'Pon a prueba tus conocimientos', to: '/aprender/fiscal/evaluacion', note: '10 preguntas · se supera con 8' },
    ],
  },
  {
    label: 'Consultar',
    to: '/consultar',
    icon: Library,
    note: 'La biblioteca',
    children: [
      { label: 'Actualidad en tu sector', to: '/consultar/actualidad', note: 'Novedades en cinco bloques' },
      { label: 'Notas informativas', to: '/consultar/notas', note: 'Documentos originales en PDF' },
      { label: 'Lecturas recomendadas', to: '/consultar/lecturas', note: 'La estantería por áreas' },
    ],
  },
  {
    label: 'Participar',
    to: '/participar',
    icon: Users,
    note: 'Vida de empresa',
    children: [
      { label: 'Agenda', to: '/participar/agenda', note: 'Actuales y próximos · histórico' },
      { label: 'Calendario', to: '/participar/calendario', note: 'Cumpleaños, aniversarios, encuentros y festivos' },
      { label: 'Contribuye', to: '/participar/contribuye', note: 'Temas, mejoras, vídeos y reseñas' },
    ],
  },
];

function TreeNode({ node }: { node: Node }) {
  return (
    <li className={styles.node}>
      <span className={styles.nodeBody}>
        {node.to ? (
          <Link to={node.to} className={styles.nodeLink}>
            {node.label}
          </Link>
        ) : (
          <span className={styles.nodeLabel}>{node.label}</span>
        )}
        {node.note && <span className={styles.nodeNote}>{node.note}</span>}
      </span>
      {node.children && node.children.length > 0 && (
        <ul role="list" className={styles.children}>
          {node.children.map((c) => (
            <TreeNode key={c.label} node={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ── Recorridos ────────────────────────────────────────────────────────── */

interface Step {
  title: string;
  text: string;
  branches?: { when: string; result: string }[];
}

type Journey = 'empleado' | 'autor' | 'admin';

const JOURNEYS: Record<Journey, { intro: string; steps: Step[] }> = {
  empleado: {
    intro: 'Aprender algo útil y demostrarlo. Es el recorrido diario de la mayoría del equipo.',
    steps: [
      { title: 'Inicio · «Tu siguiente paso»', text: 'La formación obligatoria más urgente o la que dejaste a medias.' },
      { title: 'Formación', text: 'Resultados de aprendizaje, ejemplo resuelto paso a paso, «Explicamos» e idea clave.' },
      { title: '«Marcar la lectura como terminada»', text: 'Solo con el botón, nunca por desplazamiento.' },
      {
        title: 'Test final',
        text: 'Tres preguntas, una por pantalla, con corrección al margen firmada por la autoría.',
        branches: [
          { when: '2 de 3 o más', result: '«El escalón»: Formación completada' },
          { when: 'Menos de 2', result: '«Aún no», con «Repasar» y «Volver a intentarlo»' },
        ],
      },
      { title: 'Mi perfil', text: 'Progreso por área, historial de intentos y reconocimientos.' },
    ],
  },
  autor: {
    intro: 'Compartir conocimiento con el equipo con una revisión previa.',
    steps: [
      { title: 'Gestión · Nuevo', text: 'Plantilla por tipo: formación, test, noticia, documento, evento o comunicado.' },
      { title: 'Editor con vista previa', text: 'Autoguardado en el dispositivo y aviso de cambios sin guardar.' },
      {
        title: 'Enviar a revisión',
        text: 'Administración revisa el contenido.',
        branches: [
          { when: 'Lo publica', result: 'Publicado y visible para todo el equipo' },
          { when: 'Lo devuelve', result: 'Vuelve a borrador con un comentario' },
        ],
      },
      { title: 'Reconocimiento', text: '«Primera publicación» en tu perfil, con fecha.' },
    ],
  },
  admin: {
    intro: 'Mantener el campus al día y en orden, con trazabilidad.',
    steps: [
      { title: 'Gestión · Pendiente de tu revisión', text: 'Contenidos enviados por las personas autoras.' },
      { title: 'Publicar', text: 'Con «Deshacer» durante unos segundos, o devolver con comentarios.' },
      { title: 'Administración · Personas', text: 'Altas con enlace de activación de 7 días; desactivar cierra sus sesiones.' },
      { title: 'Informes', text: 'Cumplimiento de obligatorias y errores más frecuentes, exportables en CSV.' },
      { title: 'Auditoría', text: 'Quién hizo qué y cuándo.' },
    ],
  },
};

const JOURNEY_LABEL: Record<Journey, string> = { empleado: 'Empleado', autor: 'Autor', admin: 'Administración' };

function JourneyFlow({ journey }: { journey: Journey }) {
  const j = JOURNEYS[journey];
  return (
    <div className={styles.flow}>
      <p className={styles.flowIntro}>{j.intro}</p>
      <ol className={styles.steps}>
        {j.steps.map((s, i) => (
          <li key={s.title} className={styles.step} data-last={i === j.steps.length - 1 || undefined}>
            <span className={styles.marker} aria-hidden="true" />
            <span className={styles.stepNumber} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={styles.stepTitle}>{s.title}</span>
            <span className={styles.stepText}>{s.text}</span>
            {s.branches && (
              <ul role="list" className={styles.branches} aria-label="Según el resultado">
                {s.branches.map((b) => (
                  <li key={b.when}>
                    <span className={styles.branchWhen}>Si {b.when.charAt(0).toLowerCase() + b.when.slice(1)}</span>
                    <span className={styles.branchResult}>{b.result}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function GroupCard({ title, hint, children, icon: Icon }: { title: string; hint: string; children: ReactNode; icon: LucideIcon }) {
  return (
    <div className={styles.group}>
      <p className={styles.groupTitle}>
        <Icon size={16} aria-hidden="true" /> {title}
      </p>
      <p className={styles.groupHint}>{hint}</p>
      <ul role="list" className={styles.groupList}>
        {children}
      </ul>
    </div>
  );
}

export function Architecture() {
  const me = useMe();
  const role = me?.effectiveRole ?? 'empleado';
  const [journey, setJourney] = useState<Journey>('empleado');
  const panel = useId();

  return (
    <DossierSection id="arquitectura" number="04" eyebrow="Arquitectura de información" title="Cuatro destinos y un punto de partida" lede="Cada destino tiene un propósito único. La búsqueda (Ctrl K o «/») los atraviesa todos.">
      <nav aria-label="Mapa del sitio" className={styles.map}>
        <p className={styles.root}>
          <span className={styles.rootDot} aria-hidden="true" /> FLM Campus
        </p>
        <ul role="list" className={styles.trunks}>
          {MAIN.map((n) => {
            const Icon = n.icon;
            return (
              <li key={n.label} className={styles.trunk}>
                <Link to={n.to!} className={styles.trunkLink}>
                  <Icon size={17} aria-hidden="true" /> {n.label}
                </Link>
                {n.note && <span className={styles.trunkNote}>{n.note}</span>}
                {n.children && n.children.length > 0 && (
                  <ul role="list" className={styles.children}>
                    {n.children.map((c) => (
                      <TreeNode key={c.label} node={c} />
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <div className={styles.groups}>
          <GroupCard title="Tu espacio" hint="Desde tu círculo, arriba a la derecha (Perfil, en móvil)" icon={UserRound}>
            <li>
              <Link to="/perfil">Mi perfil</Link> <span>Recorrido, progreso y reconocimientos</span>
            </li>
            <li>
              <Link to="/perfil/ajustes">Ajustes</Link> <span>Tema, movimiento, atajos, cumpleaños y avisos</span>
            </li>
          </GroupCard>
          <GroupCard title="Según tu perfil" hint="Solo aparecen con el rol correspondiente" icon={ShieldCheck}>
            <li>
              {role === 'autor' || role === 'admin' ? <Link to="/gestion">Gestión de contenidos</Link> : <strong>Gestión de contenidos</strong>} <span>Autoría y administración</span>
            </li>
            <li>
              {role === 'admin' ? <Link to="/admin">Administración</Link> : <strong>Administración</strong>} <span>Personas, informes, auditoría y retención</span>
            </li>
          </GroupCard>
          <GroupCard title="Siempre a mano" hint="Transversales a todo el campus" icon={Search}>
            <li>
              <strong>Búsqueda global</strong> <span>Ctrl K o «/», en la cabecera</span>
            </li>
            <li>
              <Link to="/sobre">Sobre el campus</Link> <span>Este dosier</span>
            </li>
            <li>
              <strong>Acceso</strong> <span>Pantalla independiente, sin la estructura común</span>
            </li>
          </GroupCard>
        </div>
        <p className={styles.mapNote}>
          <Info size={14} aria-hidden="true" /> En móvil, los mismos destinos y en el mismo orden viven en la barra inferior: Inicio, Aprender, Consultar, Participar y Perfil.
        </p>
      </nav>

      <SubHead hint="Los recorridos clave de cada perfil, paso a paso. Las bifurcaciones dependen del resultado.">Recorridos</SubHead>
      <div className={styles.journeys}>
        <Tabs label="Perfil del recorrido" options={(Object.keys(JOURNEYS) as Journey[]).map((k) => ({ value: k, label: JOURNEY_LABEL[k] }))} value={journey} onChange={setJourney} panelId={panel} />
        <div id={panel} role="tabpanel" aria-label={`Recorrido de ${JOURNEY_LABEL[journey]}`} className={styles.panel}>
          <JourneyFlow journey={journey} />
        </div>
      </div>
    </DossierSection>
  );
}

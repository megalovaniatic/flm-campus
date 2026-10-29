import { ArrowRight, ArrowUpRight, Check, Lightbulb, Mail, MessageSquareText, Plus, ShieldCheck, Video, Workflow } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { participation } from '@flm/content';
import { ButtonLink, InstagramGlyph, LinkedInGlyph, Notice, PageHeader, toast } from '@/design';
import { useEvents } from '@/data/selectors';
import { usePageTitle, useReducedMotionPref } from '@/lib/preferences';
import { CopyButton } from './EventParts';
import { dayMonth, listJoin } from './eventView';
import { useToday } from './hooks';
import { YouTubeGlyph } from './icons';
import styles from './Contribute.module.css';

/** Enlace «mailto» con asunto y cuerpo prerrellenados: abre el correo, nunca envía nada. */
function mailto(to: string, subject: string, body: string[]): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join('\r\n'))}`;
}

const TOPIC_SUBJECT = 'Propuesta de tema de formación para FLM Campus';
const TOPIC_BODY = [
  'Hola:',
  '',
  'Me gustaría proponer un tema de formación para el campus.',
  '',
  'Tema:',
  'Área (Fiscal, Laboral, Mercantil o Contable):',
  'Por qué sería útil (un ejemplo, sin datos de clientes):',
  '¿Podrías prepararlo o revisarlo tú? (sí / no):',
  '',
  'Gracias.',
];

const PROCESS_SUBJECT = 'Propuesta de mejora de proceso';
const PROCESS_BODY = [
  'Hola:',
  '',
  'Quiero proponer una mejora en cómo trabajamos.',
  '',
  'Proceso o tarea:',
  'Qué ocurre ahora:',
  'Qué propongo:',
  'A quién ayudaría (áreas o sedes):',
  '',
  'Gracias.',
];

const VIDEO_SUBJECT = 'Quiero participar en los vídeos de FLM';
const videoBody = (formats: string[]) => [
  'Hola:',
  '',
  'Me gustaría participar en los vídeos de FLM.',
  '',
  `Formatos que me interesan: ${formats.length ? formats.map((f) => `«${f}»`).join(', ') : '(elige uno o varios)'}`,
  'Tema o pregunta que podría explicar:',
  'Disponibilidad para grabar:',
  '',
  'Gracias.',
];

const SOCIAL_GLYPH: Record<string, ReactNode> = {
  linkedin: <LinkedInGlyph size={20} />,
  instagram: <InstagramGlyph size={20} />,
  youtube: <YouTubeGlyph size={20} />,
};

function onMailClick() {
  toast.info('Abriendo tu programa de correo', 'Revisa el texto antes de enviarlo. Si no se abre, copia la dirección y escribe desde tu correo: no se envía nada hasta que tú lo hagas.');
}

/** Acciones de correo: abrir el borrador prerrellenado o copiar la dirección. */
function MailActions({ to, subject, body, label }: { to: string; subject: string; body: string[]; label: string }) {
  return (
    <div className={styles.mail}>
      <div className={styles.mailButtons}>
        <ButtonLink to={mailto(to, subject, body)} icon={<Mail />} onClick={onMailClick}>
          {label}
        </ButtonLink>
        <CopyButton text={to} label="Copiar dirección" successLabel="Dirección copiada" />
      </div>
      <p className={styles.mailNote}>
        Se abre tu correo dirigido a <strong>{to}</strong> con el asunto «{subject}». No se envía nada hasta que tú lo hagas.
      </p>
    </div>
  );
}

function Kicker({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className={styles.kicker}>
      <span className={styles.kickerIcon} aria-hidden="true">
        {icon}
      </span>
      {children}
    </p>
  );
}

/** Participa: propuestas por correo, vídeos, redes oficiales y concurso de reseñas. */
export default function ContributePage() {
  usePageTitle('Participa');
  const { hash } = useLocation();
  const reduce = useReducedMotionPref();
  const today = useToday();
  const events = useEvents();
  const [formats, setFormats] = useState<string[]>([]);
  const contest = events.find((e) => e.slug === 'concurso-resenas-google');
  const deadline = contest?.sessions[contest.sessions.length - 1]?.start.slice(0, 10);
  const linkedin = participation.social.find((s) => s.id === 'linkedin');
  const contacts = participation.contacts;

  // Llegada desde «Formas de participar»: lleva la propuesta a la vista y le da el foco.
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [hash, reduce]);

  const toggleFormat = (title: string) => setFormats((list) => (list.includes(title) ? list.filter((t) => t !== title) : [...list, title]));
  // Mantener el orden original de los formatos en el correo.
  const chosen = participation.videoFormats.map((f) => f.title).filter((t) => formats.includes(t));

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Participar', to: '/participar' }, { label: 'Participa' }]}
        eyebrow="Vida de empresa"
        title="Participa"
        lede="Propón temas y mejoras, ponle voz a FLM en vídeo y apoya a la firma en redes. Te preparamos el correo; tú decides si lo envías."
      />

      <div className={styles.grid}>
        <section id="tema" className={styles.card} aria-labelledby="tema-titulo">
          <Kicker icon={<Lightbulb size={16} />}>Formación</Kicker>
          <h2 id="tema-titulo" className={styles.title} tabIndex={-1}>
            Propón un tema de formación
          </h2>
          <p className={styles.text}>¿Hay una duda que se repite con los clientes o una novedad que todo el equipo debería dominar? Proponla para el campus.</p>
          <h3 className={styles.subhead}>Qué incluir</h3>
          <ul className={styles.checklist}>
            <li>El tema y su área: Fiscal, Laboral, Mercantil o Contable.</li>
            <li>Por qué sería útil, con un ejemplo y sin datos de clientes.</li>
            <li>Si podrías prepararlo o revisarlo.</li>
          </ul>
          <MailActions to={contacts.suggestions} subject={TOPIC_SUBJECT} body={TOPIC_BODY} label="Escribir la propuesta" />
        </section>

        <section id="mejora" className={styles.card} aria-labelledby="mejora-titulo">
          <Kicker icon={<Workflow size={16} />}>Forma de trabajar</Kicker>
          <h2 id="mejora-titulo" className={styles.title} tabIndex={-1}>
            Propón una mejora de proceso
          </h2>
          <p className={styles.text}>Un paso que se repite, un traspaso entre áreas que se atasca, una plantilla que ahorraría tiempo: las mejores ideas salen de quien hace el trabajo.</p>
          <h3 className={styles.subhead}>Qué incluir</h3>
          <ul className={styles.checklist}>
            <li>El proceso o la tarea, y qué ocurre ahora.</li>
            <li>Qué propones cambiar.</li>
            <li>A quién ayudaría: áreas, sedes o clientes.</li>
          </ul>
          <MailActions to={contacts.suggestions} subject={PROCESS_SUBJECT} body={PROCESS_BODY} label="Escribir la propuesta" />
        </section>

        <section id="videos" className={`${styles.card} ${styles.wide}`} aria-labelledby="videos-titulo">
          <div className={styles.videosIntro}>
            <Kicker icon={<Video size={16} />}>Comunicación</Kicker>
            <h2 id="videos-titulo" className={styles.title} tabIndex={-1}>
              Participa en los vídeos de FLM
            </h2>
            <p className={styles.text}>Estamos preparando con la agencia de contenidos formatos breves para explicar el derecho con claridad. Si te apetece ponerles voz o proponer temas, elige los que más te interesen.</p>
          </div>
          <fieldset className={styles.formats}>
            <legend className={styles.legend}>
              Formatos en preparación <span>· elige uno o varios</span>
            </legend>
            <ul role="list" className={styles.formatGrid}>
              {participation.videoFormats.map((f) => {
                const on = formats.includes(f.title);
                return (
                  <li key={f.title}>
                    <label className={styles.format} data-on={on}>
                      <input type="checkbox" className={styles.formatInput} checked={on} onChange={() => toggleFormat(f.title)} />
                      <span className={styles.formatCheck} aria-hidden="true">
                        {on ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
                      </span>
                      <span className={styles.formatTitle}>{f.title}</span>
                      <span className={styles.formatText}>{f.text}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <p className={styles.chosen}>
            {chosen.length === 0 ? 'Aún no has elegido ningún formato: puedes escribir igualmente.' : `En el correo irá: ${listJoin(chosen.map((t) => `«${t}»`))}.`}
          </p>
          <MailActions to={contacts.communication} subject={VIDEO_SUBJECT} body={videoBody(chosen)} label="Escribir a Comunicación" />
        </section>

        <section id="linkedin" className={styles.card} aria-labelledby="linkedin-titulo">
          <Kicker icon={<LinkedInGlyph size={14} />}>Redes</Kicker>
          <h2 id="linkedin-titulo" className={styles.title} tabIndex={-1}>
            Apoya a FLM en LinkedIn
          </h2>
          <p className={styles.text}>Cada interacción del equipo acerca nuestro trabajo a más empresas. Hazlo a tu manera y con criterio profesional.</p>
          <ul className={styles.practices}>
            <li>
              <strong>Interactúa con criterio.</strong> Un comentario que aporta vale más que un «me gusta».
            </li>
            <li>
              <strong>Comparte lo que te parezca útil</strong> para tu red, con una frase tuya.
            </li>
            <li>
              <strong>Sé auténtico.</strong> Nada de interacciones automáticas o pactadas.
            </li>
            <li>
              <strong>Cuida la confidencialidad.</strong> Nunca menciones clientes ni detalles de asuntos.
            </li>
          </ul>
          {linkedin && (
            <div className={styles.cta}>
              <ButtonLink to={linkedin.url} target="_blank" rel="noreferrer" icon={<LinkedInGlyph />} iconRight={<ArrowUpRight />}>
                Seguir a FLM en LinkedIn
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </ButtonLink>
            </div>
          )}
          <h3 className={styles.subhead}>Redes oficiales de FLM</h3>
          <ul role="list" className={styles.social}>
            {participation.social.map((s) => (
              <li key={s.id}>
                <a className={styles.socialLink} href={s.url} target="_blank" rel="noreferrer">
                  <span className={styles.socialGlyph} aria-hidden="true">
                    {SOCIAL_GLYPH[s.id]}
                  </span>
                  <span className={styles.socialText}>
                    <span className={styles.socialLabel}>{s.label}</span>
                    <span className={styles.socialName}>{s.name}</span>
                  </span>
                  <ArrowUpRight size={16} aria-hidden="true" className={styles.socialArrow} />
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section id="resenas" className={styles.card} aria-labelledby="resenas-titulo">
          <Kicker icon={<MessageSquareText size={16} />}>Iniciativa</Kicker>
          <h2 id="resenas-titulo" className={styles.title} tabIndex={-1}>
            Concurso de reseñas
          </h2>
          <p className={styles.text}>
            Invita a clientes satisfechos a contar su experiencia con FLM en Google.
            {deadline && deadline >= today ? ` El concurso está abierto hasta el ${dayMonth(deadline, Number(today.slice(0, 4)))}.` : ''}
          </p>
          <Notice tone="warning" icon={<ShieldCheck size={18} />} title="Solo reseñas voluntarias y reales">
            Pídelas únicamente a clientes que hayan trabajado con nosotros y quieran contarlo: sin ofrecer nada a cambio y sin redactarlas por ellos.
          </Notice>
          <h3 className={styles.subhead}>Cómo hacerlo bien</h3>
          <ul className={styles.checklist}>
            <li>Pídela al cerrar un asunto, cuando el cliente ya conoce el resultado.</li>
            <li>Comparte el enlace solo con quien quiera contar su experiencia.</li>
            <li>Agradece cualquier reseña, sea cual sea su valoración, y nunca la condiciones.</li>
          </ul>
          {contest && (
            <div className={styles.cta}>
              <ButtonLink to={`/participar/agenda/${contest.slug}`} variant="secondary" iconRight={<ArrowRight />}>
                Ver el concurso en la agenda
              </ButtonLink>
            </div>
          )}
        </section>
      </div>

      <aside className={styles.balance} aria-labelledby="seguir-titulo">
        <p id="seguir-titulo" className={styles.balanceText}>
          ¿Buscas formación o documentación?
        </p>
        <div className={styles.balanceLinks}>
          <Link to="/aprender" className="link-arrow">
            Ir a Aprender <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link to="/consultar" className="link-arrow">
            Ir a Consultar <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </div>
  );
}

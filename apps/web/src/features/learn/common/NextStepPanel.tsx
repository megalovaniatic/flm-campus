import { useId } from 'react';
import { Link } from 'react-router';
import { AREAS } from '@flm/shared';
import { AreaTag, ProgressRing, SpotlightCta, StatusGlyph } from '@/design';
import { formationPath, NEXT_REASON, useNextStep } from './data';
import styles from './NextStepPanel.module.css';

/**
 * «Tu siguiente paso»: la tarjeta protagonista de Inicio y Aprender. Toda la tarjeta es un enlace
 * (el titular, con data-stretch); la cápsula blanca es decorativa.
 */
export function NextStepPanel({ context, progress, className }: { context: 'inicio' | 'aprender'; progress?: { completed: number; total: number }; className?: string }) {
  const next = useNextStep();
  const titleId = useId();
  if (!next) return null;

  const kicker = context === 'inicio' ? 'Tu siguiente paso' : 'Sigue con tu formación';
  let reason: string | undefined;
  let title: string;
  let to: string;
  let cta: string;
  let facts: React.ReactNode;

  if (next.kind === 'formation') {
    const f = next.formation;
    reason = NEXT_REASON[next.reason];
    title = f.title;
    to = formationPath(f);
    cta = next.status === 'sin-empezar' ? 'Empezar' : 'Continuar';
    facts = (
      <>
        <AreaTag area={f.area} size="sm" />
        <span>{f.readingMinutes} min</span>
        <StatusGlyph status={next.status} />
      </>
    );
  } else if (next.kind === 'assessment') {
    title = 'Pon a prueba tus conocimientos';
    to = `/aprender/${next.area}/evaluacion`;
    cta = 'Empezar la evaluación';
    facts = <span>Evaluación de {AREAS[next.area].name} · 10 preguntas</span>;
  } else if (context === 'inicio') {
    title = 'Lo tienes todo al día';
    to = '/consultar/actualidad';
    cta = 'Ver la actualidad';
    facts = <span>Has completado tus formaciones y la evaluación de tu área.</span>;
  } else {
    title = 'Has completado tu itinerario';
    to = '/perfil#reconocimientos';
    cta = 'Ver tus reconocimientos';
    facts = <span>Formaciones y evaluación superadas. Lo verás en tu perfil.</span>;
  }

  return (
    <article className={['spotlight', styles.panel, className ?? ''].join(' ')} data-link data-slot="next" aria-labelledby={titleId}>
      <div className={styles.main}>
        <p className={styles.kicker}>
          {kicker}
          {reason && <span> · {reason}</span>}
        </p>
        <h2 id={titleId} className={styles.title}>
          <Link to={to} data-stretch>
            {title}
          </Link>
        </h2>
        {/* Una sola fila para los datos y la acción: la tarjeta no pasa de 1/6 de la primera vista */}
        <div className={styles.foot}>
          <p className={styles.facts}>{facts}</p>
          <SpotlightCta>{cta}</SpotlightCta>
        </div>
      </div>
      {progress && progress.total > 0 && (
        <div className={styles.progress}>
          <ProgressRing value={progress.completed} total={progress.total} size={88} stroke={6} label="Formaciones completadas" decorative>
            <span className={styles.ringNum}>
              {progress.completed}
              <span>/{progress.total}</span>
            </span>
          </ProgressRing>
          <p className={styles.progressText}>
            {progress.completed} de {progress.total} formaciones completadas
          </p>
        </div>
      )}
    </article>
  );
}

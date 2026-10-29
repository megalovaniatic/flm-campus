import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { formatShortDate, plainText, type NewsItem } from '@flm/shared';
import { AreaTag } from '@/design';
import { isSample } from '../lib/data';
import { Highlight, KindLabel, SampleBadge, UrgencyLabel } from './Labels';
import styles from './NewsCard.module.css';

interface NewsCardProps {
  item: NewsItem;
  to: string;
  state?: unknown;
  tokens?: string[];
  headingLevel?: 2 | 3;
  /** En listas agrupadas por mes el año sobra. */
  withYear?: boolean;
  /** Novedad destacada (foco claro de la lista): lavado del área y «Qué debemos hacer». */
  featured?: boolean;
}

/**
 * Tarjeta escaneable de una novedad: tipo, fecha, titular, «La novedad, en una frase»,
 * área y urgencia. Toda la tarjeta es un único enlace con el titular como nombre.
 */
export function NewsCard({ item, to, state, tokens = [], headingLevel = 3, withYear = true, featured = false }: NewsCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className={styles.card} data-area={item.area} data-featured={featured || undefined}>
      <div className={styles.top}>
        <KindLabel kind={item.kind} size="sm" />
        <time dateTime={item.date} className={styles.date}>
          {formatShortDate(item.date, withYear)}
        </time>
      </div>
      {featured && <p className={styles.kicker}>Última novedad</p>}
      <Heading className={styles.headline}>
        <Link to={to} state={state} className={styles.stretch}>
          <Highlight text={item.headline} tokens={tokens} />
        </Link>
      </Heading>
      <div className={styles.line}>
        <p className={styles.lineLabel}>La novedad, en una frase</p>
        <p className={styles.lineText}>
          <Highlight text={plainText(item.oneLiner)} tokens={tokens} />
        </p>
      </div>
      {featured && (
        <div className={styles.action}>
          <p className={styles.actionLabel}>Qué debemos hacer</p>
          <p className={styles.actionText}>{plainText(item.action)}</p>
        </div>
      )}
      <div className={styles.foot}>
        <AreaTag area={item.area} size="sm" on={featured ? 'wash' : undefined} />
        <UrgencyLabel urgency={item.urgency} />
        {isSample(item.id) && <SampleBadge />}
        <ArrowRight className={styles.arrow} size={18} aria-hidden="true" />
      </div>
    </article>
  );
}

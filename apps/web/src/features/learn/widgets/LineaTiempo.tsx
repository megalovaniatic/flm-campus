import { motion } from 'motion/react';
import { CircleDashed, Clock3 } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { TimelineItem, WidgetSpec } from '@flm/shared';
import { RichParagraphs } from '@/lib/rich';
import { fechaLibre } from './format';
import { Frame, useSeen, useTransition } from './ui';
import styles from './LineaTiempo.module.css';

type Spec = Extract<WidgetSpec, { kind: 'linea-tiempo' }>;
type Tone = NonNullable<TimelineItem['tone']>;

const TONE: Record<Exclude<Tone, 'hito'>, { label: string; icon: ReactNode }> = {
  plazo: { label: 'Plazo', icon: <Clock3 size={14} /> },
  pendiente: { label: 'Pendiente', icon: <CircleDashed size={14} /> },
};

export function LineaTiempo({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [ref, seen] = useSeen<HTMLOListElement>();
  const { t, reduce } = useTransition();
  return (
    <Frame kind="Línea de tiempo" title={spec.title ?? 'Cronología'} headingLevel={headingLevel}>
      <ol ref={ref} className={styles.list} role="list" data-seen={seen || reduce || undefined}>
        {spec.items.map((item, i) => {
          const tone = item.tone ?? 'hito';
          return (
            <motion.li
              key={`${item.date}-${i}`}
              className={styles.item}
              data-tone={tone}
              style={{ '--i': i } as CSSProperties}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={seen || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={t(0.36, 0.08 + i * 0.08)}
            >
              <span className={styles.node} aria-hidden="true" />
              <p className={styles.when}>{/^\d{4}-\d{2}-\d{2}$/.test(item.date) ? <time dateTime={item.date}>{fechaLibre(item.date)}</time> : item.date}</p>
              <div className={styles.body}>
                <p className={styles.title}>{item.title}</p>
                {item.text && (
                  <div className={styles.text}>
                    <RichParagraphs text={item.text} />
                  </div>
                )}
                {tone !== 'hito' && (
                  <span className={styles.tone} data-tone={tone}>
                    <span aria-hidden="true">{TONE[tone].icon}</span>
                    {TONE[tone].label}
                  </span>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Frame>
  );
}

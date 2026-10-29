import { motion } from 'motion/react';
import type { WidgetSpec } from '@flm/shared';
import { Rich } from '@/lib/rich';
import { cabecerasComparativa } from './calc';
import { Frame, useSeen, useTransition } from './ui';
import styles from './Comparativa.module.css';

type Spec = Extract<WidgetSpec, { kind: 'comparativa' }>;

export function Comparativa({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const { t, reduce } = useTransition();
  const valuesPerRow = Math.max(0, ...spec.rows.map((r) => r.values.length));
  const { labelHeader, valueHeaders } = cabecerasComparativa(spec.columns, valuesPerRow);
  const title = spec.title ?? 'Comparativa';
  const show = seen || reduce;

  return (
    <Frame kind="Comparativa" title={title} headingLevel={headingLevel}>
      <div ref={ref}>
        {/* Escritorio: tabla */}
        <div className={styles.tableView}>
          <div className={styles.scroll} role="region" aria-label={`${title} (tabla desplazable)`} tabIndex={0}>
            <table className={styles.table}>
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr>
                  <th scope="col" className={styles.corner}>
                    {labelHeader || <span className="sr-only">Concepto</span>}
                  </th>
                  {valueHeaders.map((h, i) => (
                    <th key={i} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spec.rows.map((r, ri) => (
                  <motion.tr key={ri} initial={reduce ? false : { opacity: 0, y: 8 }} animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }} transition={t(0.3, 0.05 + ri * 0.06)}>
                    <th scope="row">{r.label}</th>
                    {valueHeaders.map((_, ci) => (
                      <td key={ci}>
                        {r.values[ci] ? (
                          <Rich text={r.values[ci]!} />
                        ) : (
                          <>
                            <span aria-hidden="true">—</span>
                            <span className="sr-only">Sin dato</span>
                          </>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Móvil: una tarjeta por fila */}
        <ul className={styles.cardsView} role="list">
          {spec.rows.map((r, ri) => (
            <li key={ri} className={styles.rowCard}>
              <p className={styles.rowTitle}>{r.label}</p>
              <dl className={styles.pairs}>
                {valueHeaders.map((h, ci) => (
                  <div key={ci} className={styles.pair}>
                    <dt>{h}</dt>
                    <dd>{r.values[ci] ? <Rich text={r.values[ci]!} /> : '—'}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

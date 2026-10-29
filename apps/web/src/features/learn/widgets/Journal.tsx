import { CircleCheck, TriangleAlert } from 'lucide-react';
import type { JournalEntry } from '@flm/shared';
import { euros } from '@flm/shared';
import { cuadreAsiento } from './calc';
import { fechaCorta } from './format';
import { cx } from './ui';
import styles from './Journal.module.css';

/** Asiento con formato de libro diario: cargos arriba, abonos con «a» y sangría, totales y cuadre. */
export function JournalEntryView({ entry, number, compact, className }: { entry: JournalEntry; number?: number; compact?: boolean; className?: string }) {
  const c = cuadreAsiento(entry);
  const debits = entry.lines.filter((l) => l.debit);
  const credits = entry.lines.filter((l) => l.credit);
  const date = entry.date && /^\d{4}-\d{2}-\d{2}$/.test(entry.date) ? fechaCorta(entry.date) : entry.date;
  return (
    <table className={cx(styles.journal, compact && styles.compact, className)}>
      <caption className={styles.caption}>
        {number !== undefined && (
          <>
            <span className={styles.num}>Asiento {number}</span>
            <span className="sr-only">, </span>
          </>
        )}
        {date && (
          <>
            <span className={styles.date}>{date}</span>
            <span className="sr-only">: </span>
          </>
        )}
        <span className={styles.concept}>{entry.concept}</span>
      </caption>
      <thead>
        <tr>
          <th scope="col">Cuenta</th>
          <th scope="col" className={styles.amount}>
            Debe
          </th>
          <th scope="col" className={styles.amount}>
            Haber
          </th>
        </tr>
      </thead>
      <tbody>
        {debits.map((l, i) => (
          <tr key={`d${i}`}>
            <th scope="row">
              <span className={styles.code}>({l.account})</span> {l.name}
            </th>
            <td className={styles.amount}>{euros(l.debit ?? 0)}</td>
            <td className={styles.amount} />
          </tr>
        ))}
        {credits.map((l, i) => (
          <tr key={`c${i}`} className={styles.credit}>
            <th scope="row">
              <span className={styles.a} aria-hidden="true">
                a
              </span>{' '}
              <span className={styles.code}>({l.account})</span> {l.name}
            </th>
            <td className={styles.amount} />
            <td className={styles.amount}>{euros(l.credit ?? 0)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">
            <span className={styles.check} data-ok={c.cuadra || undefined}>
              {c.cuadra ? <CircleCheck size={15} aria-hidden="true" /> : <TriangleAlert size={15} aria-hidden="true" />}
              {c.cuadra ? 'Cuadra' : 'No cuadra'}
            </span>
          </th>
          <td className={styles.amount}>{euros(c.debe)}</td>
          <td className={styles.amount}>{euros(c.haber)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

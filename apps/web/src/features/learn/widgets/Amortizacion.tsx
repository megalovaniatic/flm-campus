import { AnimatePresence, motion } from 'motion/react';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { euros, number, type WidgetSpec } from '@flm/shared';
import { Notice } from '@/design';
import { Chart } from './Chart';
import { coeficienteComoFraccion, cuadroAmortizacion, formatPct, type FilaAmortizacion } from './calc';
import { cx, Frame, LiveRegion, NumberField, RollingNumber, useTransition } from './ui';
import ui from './ui.module.css';
import styles from './Amortizacion.module.css';

type Spec = Extract<WidgetSpec, { kind: 'amortizacion' }>;

const SOURCES = [
  { label: 'NRV 2.ª PGC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A2-2' },
  { label: 'Art. 12.1.a LIS', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a12' },
  { label: 'Art. 11.3 LIS', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11' },
  { label: 'NRV 13.ª PGC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A13' },
];

const signed = (n: number) => (n > 0 ? `+${euros(n)}` : n < 0 ? `−${euros(-n)}` : '—');

/** «años 1 a 3», «año 2», «años 1, 3 y 5». */
function yearsText(years: number[]): string {
  if (years.length === 0) return '';
  if (years.length === 1) return `año ${years[0]}`;
  const consecutive = years.every((y, i) => i === 0 || y === years[i - 1]! + 1);
  if (consecutive) return `años ${years[0]} a ${years[years.length - 1]}`;
  return `años ${years.slice(0, -1).join(', ')} y ${years[years.length - 1]}`;
}

export function Amortizacion({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [coste, setCoste] = useState(spec.coste);
  const [vida, setVida] = useState(spec.vidaUtil);
  const [residual, setResidual] = useState(spec.valorResidual ?? 0);
  const [coef, setCoef] = useState(coeficienteComoFraccion(spec.coeficienteFiscalMax) * 100);
  const [tipo, setTipo] = useState(25);
  const [active, setActive] = useState<number | null>(null);
  const { t } = useTransition();

  const valid = coste > 0 && vida > 0 && coef > 0 && residual >= 0 && residual < coste;
  const rows = valid ? cuadroAmortizacion({ coste, vidaUtil: vida, coeficienteFiscalMax: coef, valorResidual: residual, tipoGravamen: tipo }) : [];
  const base = coste - residual;
  const cuota = vida > 0 ? base / vida : 0;
  const maximo = (base * coef) / 100;
  const exceso = rows.filter((r) => r.ajuste > 0.004).map((r) => r.ejercicio);
  const reversion = rows.filter((r) => r.ajuste < -0.004).map((r) => r.ejercicio);
  const peak = rows.reduce<FilaAmortizacion | null>((m, r) => (!m || r.diferencia > m.diferencia ? r : m), null);
  const hasDiff = exceso.length > 0;

  const labels = ['Alta', ...rows.map((r) => `Año ${r.ejercicio}`)];
  const series = [
    { name: 'Valor neto contable', values: labels.map((x, i) => ({ x, y: i === 0 ? coste : rows[i - 1]!.vnc })) },
    { name: 'Valor fiscal pendiente', values: labels.map((x, i) => ({ x, y: i === 0 ? coste : rows[i - 1]!.valorFiscal })) },
  ];

  const verdict = hasDiff
    ? `La amortización contable supera el máximo fiscal en ${yearsText(exceso)}: ajuste positivo y diferencia temporaria deducible (4740), que revierte en ${yearsText(reversion)}.`
    : 'La amortización contable no supera el máximo fiscal: es deducible íntegramente, sin ajustes ni diferencias temporarias.';

  const readout = (i: number) => {
    if (i === 0) return <><strong>Alta</strong> · valor contable y fiscal: <strong>{euros(coste)}</strong></>;
    const r = rows[i - 1];
    if (!r) return null;
    return (
      <>
        <strong>Año {r.ejercicio}</strong> · Asiento: 681 a 281 por <strong>{euros(r.contable)}</strong>
        {r.ajuste !== 0 && (
          <>
            {' '}
            · Ajuste {r.ajuste > 0 ? 'positivo' : 'negativo'} <strong>{signed(r.ajuste)}</strong>
          </>
        )}
        {r.movimientoDiferido > 0 && (
          <>
            {' '}
            · 4740 a 6301 por <strong>{euros(r.movimientoDiferido)}</strong>
          </>
        )}
        {r.movimientoDiferido < 0 && (
          <>
            {' '}
            · 6301 a 4740 por <strong>{euros(-r.movimientoDiferido)}</strong>
          </>
        )}
        {' '}
        · VNC {euros(r.vnc)} · valor fiscal {euros(r.valorFiscal)}
      </>
    );
  };

  return (
    <Frame
      kind="Simulador · NRV 2.ª PGC y art. 12.1.a LIS"
      title="Amortización contable frente a fiscal"
      intro="La contabilidad sigue la vida útil; el Impuesto sobre Sociedades pone un tope anual. Cuando la contable lo supera, el exceso se suma a la base y se recupera después: es una diferencia temporaria."
      sources={SOURCES}
      verified
      headingLevel={headingLevel}
    >
      <div className={ui.stack}>
        <div className={styles.fields}>
          <NumberField label="Coste (€)" value={coste} onChange={setCoste} min={0.01} rangeMessage="El coste debe ser mayor que cero." hint="Sin el IVA deducible." />
          <NumberField label="Vida útil (años)" value={vida} onChange={setVida} min={0.5} max={100} rangeMessage="Escribe una vida útil entre 0,5 y 100 años." />
          <NumberField label="Valor residual (€)" value={residual} onChange={setResidual} min={0} rangeMessage="El valor residual no puede ser negativo." hint="0 si no es significativo." />
          <NumberField label="Coeficiente fiscal máximo (%)" value={coef} onChange={setCoef} min={0.01} max={100} rangeMessage="Escribe un coeficiente entre 0,01 y 100." hint="Tabla del art. 12.1.a LIS." />
          <NumberField label="Tipo de gravamen (%)" value={tipo} onChange={setTipo} min={0} max={100} rangeMessage="Escribe un tipo entre 0 y 100." hint="Para el 4740. General: 25 %." />
        </div>

        {!valid ? (
          <Notice tone="warning" title="Revisa los datos">
            El coste, la vida útil y el coeficiente deben ser mayores que cero, y el valor residual, inferior al coste.
          </Notice>
        ) : (
          <>
            <div className={styles.summary}>
              <div className={styles.tile}>
                <p className={ui.figureLabel}>Amortización contable anual</p>
                <RollingNumber text={euros(cuota)} className={styles.tileValue} />
                <p className={styles.tileSub}>{formatPct((cuota / base) * 100, 2)} sobre la base de {euros(base)}</p>
              </div>
              <div className={styles.tile}>
                <p className={ui.figureLabel}>Máximo fiscal anual</p>
                <RollingNumber text={euros(maximo)} className={styles.tileValue} />
                <p className={styles.tileSub}>{formatPct(coef, 2)} sobre la misma base</p>
              </div>
              <div className={styles.verdictBox} data-tone={hasDiff ? 'warning' : 'success'}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p key={hasDiff ? 'd' : 'c'} className={styles.verdictHead} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={t(0.24)}>
                    {hasDiff ? <TriangleAlert size={18} aria-hidden="true" /> : <CircleCheck size={18} aria-hidden="true" />}
                    {hasDiff ? 'Hay diferencia temporaria' : 'Coinciden'}
                  </motion.p>
                </AnimatePresence>
                <p className={styles.verdictText}>{verdict}</p>
                {hasDiff && peak && (
                  <p className={styles.verdictText}>
                    Máxima en el año {peak.ejercicio}: <strong>{euros(peak.diferencia)}</strong> · saldo del 4740: <strong>{euros(peak.saldoDiferido)}</strong>.
                  </p>
                )}
              </div>
            </div>

            <Chart
              type="lineas"
              title="Valor neto contable y valor fiscal pendiente"
              showTitle
              series={series}
              formatValue={(v) => euros(v)}
              formatTick={(v) => euros(v, 0)}
              band={{ from: 0, to: 1, label: 'Diferencia temporaria deducible (4740): el valor fiscal pendiente supera al contable.' }}
              emphasis={(i) => i > 0 && (rows[i - 1]?.ajuste ?? 0) > 0.004}
              activeIndex={active}
              onActiveChange={setActive}
              readout={readout}
              table={false}
            />

            <div className={styles.tableWrap} role="region" aria-label="Cuadro de amortización (desplazable)" tabIndex={0}>
              <table className={styles.table}>
                <caption className={styles.tableCaption}>Cuadro de amortización año a año</caption>
                <thead>
                  <tr>
                    <th scope="col">Año</th>
                    <th scope="col">Contable (681)</th>
                    <th scope="col">Máximo fiscal</th>
                    <th scope="col">Deducible</th>
                    <th scope="col">Ajuste</th>
                    <th scope="col">VNC</th>
                    <th scope="col">Diferencia temporaria</th>
                    <th scope="col">Saldo 4740</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const kind = r.ajuste > 0.004 ? 'exceso' : r.ajuste < -0.004 ? 'reversion' : undefined;
                    return (
                      <tr key={r.ejercicio} data-kind={kind} className={cx(active === r.ejercicio && styles.rowActive)}>
                        <th scope="row">{r.ejercicio}</th>
                        <td>{euros(r.contable)}</td>
                        <td>{euros(r.maximoFiscal)}</td>
                        <td>{euros(r.deducible)}</td>
                        <td>
                          <span className={styles.adj}>
                            {signed(r.ajuste)}
                            {kind && <span className={styles.adjTag}>{kind === 'exceso' ? 'aumento' : 'reversión'}</span>}
                          </span>
                        </td>
                        <td>{euros(r.vnc)}</td>
                        <td>{r.diferencia > 0 ? euros(r.diferencia) : '—'}</td>
                        <td>{r.saldoDiferido > 0 ? euros(r.saldoDiferido) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row">Total</th>
                    <td>{euros(rows.reduce((s, r) => s + r.contable, 0))}</td>
                    <td />
                    <td>{euros(rows.reduce((s, r) => s + r.deducible, 0))}</td>
                    <td>{signed(Math.round(rows.reduce((s, r) => s + r.ajuste, 0) * 100) / 100)}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className={styles.footnote}>
              Ejercicios completos desde la puesta en funcionamiento. «Ajuste» positivo: aumento de la base imponible; negativo: disminución. Saldo del 4740 al {formatPct(tipo, 2)}, si su recuperación es probable. No incluye libertad de amortización ni el coeficiente doble de las empresas de reducida dimensión. {number(rows.length)} {rows.length === 1 ? 'ejercicio' : 'ejercicios'} en el cuadro.
            </p>
          </>
        )}
      </div>
      <LiveRegion message={valid ? `Amortización contable anual ${euros(cuota)}; máximo fiscal ${euros(maximo)}. ${verdict}` : 'Revisa los datos de la amortización.'} />
    </Frame>
  );
}

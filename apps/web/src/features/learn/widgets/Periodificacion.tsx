import { motion } from 'motion/react';
import { Info } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { diffDays, euros, monthShort, number, type JournalEntry, type WidgetSpec } from '@flm/shared';
import { Notice } from '@/design';
import { cuentaDeGasto, isDateKey, periodificar, type MetodoPeriodificacion, type PeriodificacionResultado } from './calc';
import { diasTexto, fechaCorta } from './format';
import { JournalEntryView } from './Journal';
import { DateField, Frame, Legend, LiveRegion, NumberField, RollingNumber, Segmented, useSeen, useTransition } from './ui';
import ui from './ui.module.css';
import styles from './Periodificacion.module.css';

type Spec = Extract<WidgetSpec, { kind: 'periodificacion' }>;

const SOURCES = [
  { label: 'Marco Conceptual PGC (devengo)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A3' },
  { label: 'Cuenta 480 (PGC, quinta parte)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4-2' },
  { label: 'Art. 11 LIS', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11' },
];

const mesesTexto = (m: number) => {
  const rounded = Math.round(m * 100) / 100;
  if (Number.isInteger(rounded)) return rounded === 1 ? '1 mes' : `${rounded} meses`;
  return `${number(rounded, 2)} meses`;
};

export function Periodificacion({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [importe, setImporte] = useState(spec.importe);
  const [inicio, setInicio] = useState(spec.inicio);
  const [meses, setMeses] = useState(spec.meses);
  const [cierre, setCierre] = useState(spec.cierre);
  const [metodo, setMetodo] = useState<MetodoPeriodificacion>('meses');
  const valid = importe > 0 && isDateKey(inicio) && isDateKey(cierre) && meses >= 1;
  const r = valid ? periodificar({ importe, inicio, meses, cierre, metodo }) : null;
  const cuenta = cuentaDeGasto(spec.concepto);

  const asientos: JournalEntry[] = r && r.anticipado > 0 && r.delEjercicio >= 0
    ? [
        { date: cierre, concept: 'Periodificación al cierre: la parte del ejercicio siguiente sale del gasto', lines: [{ account: '480', name: 'Gastos anticipados', debit: r.anticipado }, { account: cuenta.account, name: cuenta.name, credit: r.anticipado }] },
        { date: r.reversion, concept: 'Reversión al empezar el ejercicio siguiente', lines: [{ account: cuenta.account, name: cuenta.name, debit: r.anticipado }, { account: '480', name: 'Gastos anticipados', credit: r.anticipado }] },
      ]
    : [];

  const live = r ? `Gasto del ejercicio: ${euros(r.delEjercicio)}. A la cuenta 480, gastos anticipados: ${euros(r.anticipado)}.` : 'Revisa los datos de la periodificación.';

  return (
    <Frame
      kind="Ajuste de cierre · Cuenta 480"
      title={`${spec.concepto}: ¿cuánto es gasto de este ejercicio?`}
      intro="El gasto se imputa al ejercicio en que se devenga, no al del pago. Al cierre, la parte que corresponde al ejercicio siguiente pasa a la 480 y vuelve a gasto el primer día del ejercicio nuevo."
      sources={SOURCES}
      verified
      headingLevel={headingLevel}
    >
      <div className={ui.stack}>
        <div className={styles.fields}>
          <NumberField label="Importe (€)" value={importe} onChange={setImporte} min={0.01} rangeMessage="El importe debe ser mayor que cero." hint="Base sin IVA: el IVA no se periodifica." />
          <DateField label="Inicio del periodo" value={inicio} onChange={setInicio} />
          <NumberField label="Meses que cubre" value={meses} onChange={setMeses} integer min={1} max={120} rangeMessage="Escribe entre 1 y 120 meses." />
          <DateField label="Cierre del ejercicio" value={cierre} onChange={setCierre} />
        </div>
        <Segmented<MetodoPeriodificacion>
          legend="Método de reparto"
          value={metodo}
          onChange={setMetodo}
          options={[
            { value: 'meses', label: 'Por meses' },
            { value: 'dias', label: 'Por días' },
          ]}
        />

        {!r ? (
          <Notice tone="warning" title="Revisa los datos">
            Indica un importe mayor que cero, fechas válidas y al menos un mes de cobertura.
          </Notice>
        ) : (
          <>
            <div className={styles.split}>
              <div className={styles.tile}>
                <p className={ui.figureLabel}>Gasto de este ejercicio</p>
                <RollingNumber text={euros(r.delEjercicio)} className={styles.tileValue} />
                <p className={styles.tileSub}>{metodo === 'meses' ? `${mesesTexto(r.mesesEjercicio)} de ${meses}` : `${diasTexto(r.diasEjercicio)} de ${number(r.totalDias)}`}</p>
              </div>
              <div className={styles.tile} data-kind="480">
                <p className={ui.figureLabel}>A la 480 · Gastos anticipados</p>
                <RollingNumber text={euros(r.anticipado)} className={styles.tileValue} />
                <p className={styles.tileSub}>{metodo === 'meses' ? `${mesesTexto(Math.max(0, meses - r.mesesEjercicio))} del ejercicio siguiente` : `${diasTexto(r.totalDias - r.diasEjercicio)} del ejercicio siguiente`}</p>
              </div>
            </div>

            <CutBar r={r} inicio={inicio} cierre={cierre} />

            {r.anticipado === 0 ? (
              <Notice icon={<Info size={18} />}>Todo el periodo cae dentro del ejercicio: no hay que periodificar.</Notice>
            ) : r.delEjercicio === 0 ? (
              <Notice icon={<Info size={18} />}>El periodo empieza después del cierre: todo el importe corresponde al ejercicio siguiente y va entero a la 480.</Notice>
            ) : null}

            {asientos.length > 0 && (
              <div className={styles.journals}>
                {asientos.map((a, i) => (
                  <JournalEntryView key={i} entry={a} compact />
                ))}
              </div>
            )}
            <p className={styles.footnote}>
              {cuenta.account === '6xx' ? 'Usa la cuenta del grupo 6 en la que registraste el gasto. ' : `Cuenta de gasto propuesta según el concepto: (${cuenta.account}) ${cuenta.name}. `}
              Elige un método (meses o días) y mantenlo de un año a otro: es el principio de uniformidad.
            </p>
          </>
        )}
      </div>
      <LiveRegion message={live} />
    </Frame>
  );
}

/* Barra del periodo con la línea de corte del cierre. */
function CutBar({ r, inicio, cierre }: { r: PeriodificacionResultado; inicio: string; cierre: string }) {
  const [ref, seen] = useSeen<HTMLElement>();
  const { t } = useTransition();
  const total = r.totalDias;
  const cut = Math.min(1, Math.max(0, r.diasEjercicio / total));
  const showCut = cut > 0 && cut < 1;
  const step = r.meses.length > 12 ? Math.ceil(r.meses.length / 12) : 1;
  return (
    <figure className={styles.cut} ref={ref}>
      <div className={styles.cutPlot} aria-hidden="true" style={{ '--cut': cut } as CSSProperties}>
        {showCut && (
          <span className={styles.cutLabel} data-side={cut > 0.6 ? 'left' : 'right'}>
            Cierre · {fechaCorta(cierre)}
          </span>
        )}
        <div className={styles.cutTrack}>
          <motion.span className={styles.segNow} initial={{ width: 0 }} animate={{ width: seen ? `${cut * 100}%` : 0 }} transition={t(0.5)} />
          <motion.span className={styles.segNext} initial={{ width: 0 }} animate={{ width: seen ? `${(1 - cut) * 100}%` : 0 }} transition={t(0.5, 0.25)} style={{ left: `${cut * 100}%` }} />
          {r.meses.slice(1).map((m) => (
            <span key={m.inicio} className={styles.monthTick} style={{ left: `${(diffDays(inicio, m.inicio) / total) * 100}%` }} />
          ))}
        </div>
        {showCut && <motion.span className={styles.cutLine} initial={{ scaleY: 0 }} animate={{ scaleY: seen ? 1 : 0 }} transition={t(0.3, 0.5)} />}
        <div className={styles.months}>
          {r.meses.map((m, i) =>
            i % step === 0 ? (
              <span key={m.inicio} style={{ left: `${((diffDays(inicio, m.inicio) + (diffDays(m.inicio, m.fin) + 1) / 2) / total) * 100}%` }}>
                {monthShort(Number(m.inicio.slice(5, 7)))}
              </span>
            ) : null,
          )}
        </div>
      </div>
      <figcaption>
        <Legend
          items={[
            { label: `Este ejercicio: ${euros(r.delEjercicio)}`, swatch: 'solid', color: 'var(--s1)' },
            { label: `Ejercicio siguiente (480): ${euros(r.anticipado)}`, swatch: 'hatch', color: 'var(--s2)' },
          ]}
        />
        <span className="sr-only">
          Periodo del {fechaCorta(inicio)} al {fechaCorta(r.fin)}, con el cierre el {fechaCorta(cierre)}.
        </span>
      </figcaption>
    </figure>
  );
}

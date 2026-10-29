import { motion } from 'motion/react';
import { CalendarRange, TriangleAlert } from 'lucide-react';
import { useId, useMemo, useState, type CSSProperties } from 'react';
import { euros, formatLongDate, type WidgetSpec } from '@flm/shared';
import { Button, Notice, Switch } from '@/design';
import { calcularRecargo, escalaRecargo, formatPct, INTERES_DEMORA, ordinal, RECARGO_MAX_MESES, retrasoConFechas } from './calc';
import { DateField, Figure, Frame, Legend, LiveRegion, NumberField, RangeField, useSeen, useTransition } from './ui';
import ui from './ui.module.css';
import styles from './Recargo.module.css';

type Spec = Extract<WidgetSpec, { kind: 'recargo-extemporaneo' }>;

const SOURCES = [
  { label: 'Art. 27 LGT', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27' },
  { label: 'Arts. 191 y 188 LGT', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a191' },
  { label: 'DA 42.ª Ley 31/2022 (interés de demora)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128#da-42' },
];

const mesesTexto = (m: number) => (m === 1 ? '1 mes completo' : `${m} meses completos`);

function tramoTexto(m: number) {
  if (m >= 12) return 'Han pasado más de 12 meses desde el fin del plazo';
  return `Presentación dentro del ${ordinal(m + 1)} mes`;
}

export function Recargo({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [cuota, setCuota] = useState(spec.cuota);
  const [meses, setMeses] = useState(4);
  const [reducido, setReducido] = useState(true);
  const r = calcularRecargo(cuota, meses, reducido);
  const escala = useMemo(() => escalaRecargo(), []);
  const Sub = `h${Math.min(6, headingLevel + 1)}` as 'h3';
  const cmpId = useId();

  const live = `Recargo a pagar: ${euros(r.aPagar)}, el ${formatPct(r.porcentajeEfectivo)} de la cuota, con ${mesesTexto(meses)} de retraso${reducido ? ' y la reducción del 25 %' : ''}.${r.conIntereses ? ' Además, se exigen intereses de demora.' : ''}`;

  return (
    <Frame
      kind="Simulador · Art. 27 LGT"
      title="¿Cuánto cuesta presentar tarde?"
      intro="Mueve el deslizador: cada mes completo de retraso, sin requerimiento previo de la AEAT, suma un punto al recargo. Pasado el año, el salto es al 15 % más intereses."
      sources={SOURCES}
      verified
      headingLevel={headingLevel}
    >
      <div className={ui.split}>
        <div className={ui.controls}>
          <NumberField label="Cuota a ingresar (€)" value={cuota} onChange={setCuota} min={0.01} rangeMessage="La cuota debe ser mayor que cero." hint="Importe a ingresar de la autoliquidación presentada fuera de plazo." />
          <RangeField
            label="Meses completos de retraso"
            value={meses}
            min={0}
            max={RECARGO_MAX_MESES}
            onChange={setMeses}
            pageStep={3}
            display={meses >= RECARGO_MAX_MESES ? '24 o más' : mesesTexto(meses)}
            hint={tramoTexto(meses)}
            valueText={(m) => `${mesesTexto(m)}. ${tramoTexto(m)}. Recargo del ${formatPct(calcularRecargo(1, m, false).porcentaje)}${m >= 12 ? ' más intereses de demora' : ''}.`}
            mark={{ value: 12, label: '12' }}
            scale={[
              { value: 0, label: '0' },
              { value: 6, label: '6' },
              { value: 12, label: '12' },
              { value: 18, label: '18' },
              { value: 24, label: '24' },
            ]}
          />
          <Switch label="Reducción del 25 % (art. 27.5 LGT)" description="Exige ingresar toda la deuda al presentar (o aplazarla con aval o seguro de caución pedido al presentar) y pagar el recargo reducido en plazo." checked={reducido} onChange={setReducido} />
          <DateHelper cuota={cuota} onApply={(m) => setMeses(Math.min(RECARGO_MAX_MESES, m))} />
        </div>

        <div className={ui.results}>
          <Figure
            label={reducido ? 'Recargo a pagar, con la reducción' : 'Recargo a pagar'}
            text={euros(r.aPagar)}
            sub={
              <>
                <strong>{formatPct(r.porcentajeEfectivo)}</strong> de la cuota
                {reducido ? (
                  <>
                    {' '}
                    · íntegro {euros(r.integro)} − 25 % ({euros(r.reduccion)})
                  </>
                ) : null}
              </>
            }
          />
          <Stairs meses={meses} reducido={reducido} escala={escala} onPick={setMeses} />
          {r.conIntereses && (
            <Notice tone="warning" icon={<TriangleAlert size={18} />} title="Pasados 12 meses: 15 % e intereses de demora">
              Los intereses corren desde el día siguiente al final de esos 12 meses hasta la presentación y se calculan por días. En 2026 el tipo es del {formatPct(INTERES_DEMORA[2026] ?? 0)} anual (DA 42.ª de la Ley 31/2022, prorrogada). La reducción del 25 % no alcanza a los intereses.
            </Notice>
          )}
          <section className={styles.compare} aria-labelledby={cmpId}>
            <Sub id={cmpId} className={styles.compareTitle}>
              ¿Y si la AEAT se adelanta con un requerimiento?
            </Sub>
            <CompareBars ahora={r.aPagar} sancionMinima={cuota * 0.5} />
            <p className={styles.compareText}>
              Ya no hay recargo: se exigen intereses de demora desde el día siguiente al fin del plazo y puede imponerse una sanción de, al menos, el 50 % de la cuota (art. 191 LGT), que se reduce un 30 % con conformidad y un 40 % por pronto pago (art. 188 LGT).
            </p>
          </section>
        </div>
      </div>
      <LiveRegion message={live} />
    </Frame>
  );
}

/* La escalera del recargo: una columna por mes; la trama marca los meses con intereses. */
function Stairs({ meses, reducido, escala, onPick }: { meses: number; reducido: boolean; escala: { meses: number; porcentaje: number }[]; onPick: (m: number) => void }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const current = escala[Math.min(meses, escala.length - 1)];
  const factor = reducido ? 0.75 : 1;
  return (
    <figure className={styles.stairs} ref={ref}>
      <div className={styles.plot} aria-hidden="true" data-seen={seen || undefined}>
        <span className={styles.wall} style={{ '--x': 12 / escala.length } as CSSProperties}>
          <span className={styles.wallLabel}>12 meses</span>
        </span>
        {escala.map((s) => {
          const state = s.meses < meses ? 'past' : s.meses === meses ? 'current' : 'future';
          return (
            <span
              key={s.meses}
              className={styles.col}
              data-state={state}
              data-late={s.meses >= 12 || undefined}
              style={{ '--h': s.porcentaje / 15, '--f': factor, '--i': s.meses } as CSSProperties}
              onClick={() => onPick(s.meses)}
            >
              <span className={styles.colFull} />
              <span className={styles.colPaid} />
            </span>
          );
        })}
        {current && (
          <span className={styles.flag} style={{ '--x': (current.meses + 0.5) / escala.length, '--h': (current.porcentaje / 15) * factor } as CSSProperties}>
            {formatPct(current.porcentaje * factor)}
          </span>
        )}
      </div>
      <div className={styles.axis} aria-hidden="true">
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>24 meses</span>
      </div>
      <figcaption className={styles.caption}>
        <Legend
          items={[
            { label: reducido ? 'Recargo con la reducción' : 'Recargo', swatch: 'solid', color: 'var(--s1)' },
            ...(reducido ? [{ label: 'Lo que ahorras con la reducción', swatch: 'solid' as const, color: 'color-mix(in srgb, var(--s1) 16%, transparent)' }] : []),
            { label: 'Más de 12 meses: 15 % e intereses', swatch: 'hatch', color: 'var(--s1)' },
          ]}
        />
        <span className="sr-only">Escala del recargo: 1 % dentro del primer mes y un punto más por cada mes completo, hasta el 12 %; pasados 12 meses, 15 % más intereses de demora.</span>
      </figcaption>
    </figure>
  );
}

function CompareBars({ ahora, sancionMinima }: { ahora: number; sancionMinima: number }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const { t } = useTransition();
  const max = Math.max(ahora, sancionMinima) * 1.22 || 1;
  return (
    <div className={styles.cmp} ref={ref}>
      <div className={styles.cmpRow}>
        <span className={styles.cmpLabel}>Ahora, sin requerimiento</span>
        <span className={styles.cmpTrack} aria-hidden="true">
          <motion.span className={styles.cmpBar} initial={{ width: 0 }} animate={{ width: seen ? `${(ahora / max) * 100}%` : 0 }} transition={t(0.42)} />
        </span>
        <span className={styles.cmpValue}>{euros(ahora)}</span>
      </div>
      <div className={styles.cmpRow}>
        <span className={styles.cmpLabel}>Tras el requerimiento</span>
        <span className={styles.cmpTrack} aria-hidden="true">
          <motion.span className={styles.cmpBar} data-tone="risk" initial={{ width: 0 }} animate={{ width: seen ? `${(sancionMinima / max) * 100}%` : 0 }} transition={t(0.42, 0.08)} />
          <motion.span className={styles.cmpTail} initial={{ opacity: 0 }} animate={{ opacity: seen ? 1 : 0 }} transition={t(0.3, 0.42)} />
        </span>
        <span className={styles.cmpValue}>
          desde {euros(sancionMinima)}
          <span className={styles.cmpPlus}> + intereses</span>
        </span>
      </div>
    </div>
  );
}

/* Ayuda: calcular los meses completos a partir de dos fechas (de fecha a fecha). */
function DateHelper({ cuota, onApply }: { cuota: number; onApply: (m: number) => void }) {
  const [fin, setFin] = useState('2026-04-20');
  const [pres, setPres] = useState('2026-09-15');
  const res = fin && pres ? retrasoConFechas(cuota, fin, pres) : null;
  return (
    <details className={styles.helper}>
      <summary className={styles.helperSummary}>
        <CalendarRange size={18} aria-hidden="true" />
        Calcular los meses con fechas
      </summary>
      <div className={styles.helperBody}>
        <div className={ui.fields2}>
          <DateField label="Fin del plazo" value={fin} onChange={setFin} />
          <DateField label="Presentación e ingreso" value={pres} onChange={setPres} />
        </div>
        {res && (
          <div className={styles.helperResult} aria-live="polite">
            {res.enPlazo ? (
              <p>Presentada en plazo: no hay recargo.</p>
            ) : (
              <>
                <p>
                  <strong>{mesesTexto(res.meses)}</strong> de retraso, contados de fecha a fecha desde el día siguiente al fin del plazo: recargo del {formatPct(calcularRecargo(1, res.meses, false).porcentaje)}.
                </p>
                {res.interesesDesde && (
                  <p>
                    {res.intereses ? (
                      <>
                        Intereses de demora estimados: <strong>{euros(res.intereses.importe)}</strong> ({res.intereses.dias} días desde el {formatLongDate(res.interesesDesde)}). La liquidación de la AEAT prevalece.
                      </>
                    ) : (
                      <>Hay intereses desde el {formatLongDate(res.interesesDesde)}, pero no los calculamos: el tipo de algún año del periodo aún no está verificado.</>
                    )}
                  </p>
                )}
                <Button variant="secondary" onClick={() => onApply(res.meses)}>
                  Llevar {Math.min(res.meses, RECARGO_MAX_MESES)} {res.meses === 1 ? 'mes' : 'meses'} al deslizador
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

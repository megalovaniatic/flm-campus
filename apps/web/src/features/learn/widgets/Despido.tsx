import { motion } from 'motion/react';
import { Info } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { euros, number, type WidgetSpec } from '@flm/shared';
import { Notice } from '@/design';
import { calcularIndemnizacion, describirMeses, FECHA_REFORMA_2012, type IndemnizacionResultado, type TipoDespido } from './calc';
import { dias2, fechaCorta } from './format';
import { BarCompare, Breakdown, DateField, Figure, Frame, Legend, LiveRegion, NumberField, Segmented, useSeen, useTransition } from './ui';
import ui from './ui.module.css';
import styles from './Despido.module.css';

type Spec = Extract<WidgetSpec, { kind: 'indemnizacion-despido' }>;

const SOURCES = [
  { label: 'Art. 53.1.b ET', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a53' },
  { label: 'Art. 56.1 ET', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a56' },
  { label: 'DT 11.ª ET', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#dtundecima' },
];

const TIPO_LABEL: Record<TipoDespido, string> = { improcedente: 'Improcedente', objetivo: 'Objetivo procedente' };

const ERRORS: Record<string, string> = {
  salario: 'Indica un salario bruto anual mayor que cero.',
  fechas: 'Revisa las fechas: indica día, mes y año.',
  orden: 'La fecha de efectos del despido debe ser posterior a la de alta.',
  'anterior-reforma': 'La calculadora aplica la DT 11.ª del ET, para despidos con efectos desde el 12/02/2012. Para fechas anteriores, consulta la normativa de entonces.',
};

function topeTexto(r: IndemnizacionResultado): string {
  switch (r.topeMotivo) {
    case 'objetivo':
      return '12 mensualidades (360 días)';
    case 'general':
      return '24 mensualidades (720 días)';
    case 'tramo-anterior':
      return `el tramo anterior a 2012 (${dias2(r.tope)} días), porque supera 720 días`;
    case 'absoluto':
      return '42 mensualidades (1.260 días), el máximo absoluto';
  }
}

export function Despido({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [tipo, setTipo] = useState<TipoDespido>('improcedente');
  const [salario, setSalario] = useState(spec.salarioAnual);
  const [inicio, setInicio] = useState(spec.inicio);
  const [fin, setFin] = useState(spec.fin);
  const res = calcularIndemnizacion({ salarioAnual: salario, inicio, fin, tipo });
  const imp = calcularIndemnizacion({ salarioAnual: salario, inicio, fin, tipo: 'improcedente' });
  const obj = calcularIndemnizacion({ salarioAnual: salario, inicio, fin, tipo: 'objetivo' });

  const live = res.ok ? `Indemnización por despido ${TIPO_LABEL[tipo].toLowerCase()}: ${euros(res.importe)}, ${dias2(res.dias)} días de salario a ${euros(res.salarioDiario)} al día.${res.topeAplicado ? ' Se aplica el tope.' : ''}` : (ERRORS[res.error] ?? '');

  return (
    <Frame
      kind="Calculadora · Arts. 53 y 56 ET"
      title="¿Cuánto cuesta este despido?"
      intro="Elige la calificación y ajusta salario y fechas. Para contratos anteriores al 12/02/2012, el despido improcedente se calcula en dos tramos (45 y 33 días por año), con sus topes."
      sources={SOURCES}
      verified
      headingLevel={headingLevel}
    >
      <div className={ui.split}>
        <div className={ui.controls}>
          <Segmented<TipoDespido>
            legend="Calificación del despido"
            value={tipo}
            onChange={setTipo}
            options={[
              { value: 'improcedente', label: 'Improcedente' },
              { value: 'objetivo', label: 'Objetivo procedente' },
            ]}
          />
          <NumberField label="Salario bruto anual (€)" value={salario} onChange={setSalario} min={1} rangeMessage="El salario debe ser mayor que cero." hint="Con todos los conceptos salariales y la prorrata de pagas extra (art. 26.1 ET); sin dietas ni suplidos." />
          <div className={ui.fields2}>
            <DateField label="Fecha de alta" value={inicio} onChange={setInicio} />
            <DateField label="Fecha de efectos" value={fin} onChange={setFin} />
          </div>
          {res.ok && <ServiceTimeline res={res} inicio={inicio} fin={fin} />}
          <Notice icon={<Info size={18} />}>
            Divisor 365 y prorrateo por meses: la fracción de mes cuenta como mes completo. No incluye preaviso, salarios de tramitación ni finiquito. En contratos de fomento de la contratación indefinida anteriores a 2012, revisa la DT 11.ª.3 ET.
          </Notice>
        </div>

        <div className={ui.results}>
          {!res.ok ? (
            <Notice tone="warning" title="No podemos calcularlo todavía">
              {ERRORS[res.error]}
            </Notice>
          ) : (
            <>
              <Figure label={`Indemnización · ${TIPO_LABEL[tipo].toLowerCase()}`} text={euros(res.importe)} sub={<><strong>{dias2(res.dias)} días</strong> de salario × {euros(res.salarioDiario)} al día</>} />
              <DaysBar res={res} />
              {imp.ok && obj.ok && (
                <div className={styles.block}>
                  <p className={styles.blockTitle}>Lo que está en juego según la calificación</p>
                  <BarCompare
                    rows={[
                      { label: 'Objetivo procedente (20 días por año)', value: obj.importe, display: euros(obj.importe), tone: 'muted', current: tipo === 'objetivo' },
                      { label: imp.tramos.length > 1 ? 'Improcedente (45 y 33 días por año)' : 'Improcedente (33 días por año)', value: imp.importe, display: euros(imp.importe), tone: 's1', current: tipo === 'improcedente' },
                    ]}
                  />
                  <p className={styles.diff}>
                    Diferencia: <strong>{euros(Math.max(0, imp.importe - obj.importe))}</strong>. Si el objetivo se declara improcedente, se descuenta lo ya cobrado (art. 53.5.b ET).
                  </p>
                </div>
              )}
              <Breakdown
                caption="Desglose"
                rows={[
                  { term: 'Salario diario', detail: `${euros(salario)} ÷ 365`, value: euros(res.salarioDiario) },
                  { term: 'Antigüedad', detail: `${describirMeses(res.mesesTotales)} (${number(res.mesesTotales)} meses)`, value: `${fechaCorta(inicio)} – ${fechaCorta(fin)}` },
                  ...res.tramos.map((tr) => ({
                    term: tr.id === 'antes-2012' ? 'Tramo hasta el 11/02/2012' : tr.id === 'desde-2012' ? 'Tramo desde el 12/02/2012' : `Días a razón de ${tr.diasPorAno} por año`,
                    detail: `${number(tr.meses)} meses × ${tr.diasPorAno} ÷ 12`,
                    value: `${dias2(tr.dias)} días`,
                  })),
                  { term: 'Tope', detail: `${topeTexto(res)}: ${res.topeAplicado ? 'se aplica' : 'no se alcanza'}`, value: `${dias2(res.tope)} días` },
                  { term: 'Indemnización', detail: `${dias2(res.dias)} días × ${euros(res.salarioDiario)}`, value: euros(res.importe), total: true },
                ]}
              />
            </>
          )}
        </div>
      </div>
      <LiveRegion message={live} />
    </Frame>
  );
}

/* Días de indemnización: un tramo por color, el tope como línea y lo que excede, tramado. */
function DaysBar({ res }: { res: IndemnizacionResultado }) {
  const [ref, seen] = useSeen<HTMLElement>();
  const { t } = useTransition();
  const scaleMax = Math.max(res.diasSinTope, res.tope) * 1.08 || 1;
  const pct = (d: number) => (d / scaleMax) * 100;
  const cap = pct(res.tope);
  const twoTramos = res.tramos.length > 1;
  let acc = 0;
  return (
    <figure className={styles.days} ref={ref}>
      <div className={styles.daysPlot} aria-hidden="true">
        <span className={styles.capLabel} data-side={cap > 62 ? 'left' : 'right'} style={{ '--x': cap } as CSSProperties}>
          Tope: {dias2(res.tope)} días
        </span>
        <div className={styles.daysTrack}>
          {res.tramos.map((tr, i) => {
            const left = acc;
            acc += tr.dias;
            return (
              <motion.span
                key={tr.id}
                className={styles.daysSeg}
                data-t={tr.id === 'desde-2012' ? '2' : '1'}
                data-gap={i > 0 || undefined}
                style={{ left: `${pct(left)}%` }}
                initial={{ width: 0 }}
                animate={{ width: seen ? `${pct(tr.dias)}%` : 0 }}
                transition={t(0.5, i * 0.14)}
              />
            );
          })}
          {res.topeAplicado && <motion.span className={styles.over} style={{ left: `${cap}%`, width: `${pct(res.diasSinTope) - cap}%` }} initial={{ opacity: 0 }} animate={{ opacity: seen ? 1 : 0 }} transition={t(0.3, 0.55)} />}
        </div>
        <span className={styles.capLine} style={{ left: `${cap}%` }} />
      </div>
      <figcaption>
        <Legend
          items={[
            ...(twoTramos
              ? [
                  { label: 'Hasta 11/02/2012 · 45 días por año', swatch: 'solid' as const, color: 'var(--s1)' },
                  { label: 'Desde 12/02/2012 · 33 días por año', swatch: 'solid' as const, color: 'var(--s3)' },
                ]
              : [{ label: `${res.tramos[0]?.diasPorAno ?? ''} días por año de servicio`, swatch: 'solid' as const, color: 'var(--s1)' }]),
            ...(res.topeAplicado ? [{ label: `Por encima del tope, no se paga (${dias2(res.diasSinTope - res.tope)} días)`, swatch: 'hatch' as const, color: 'var(--ink-2)' }] : []),
          ]}
        />
      </figcaption>
    </figure>
  );
}

/* Tiempo de servicio, con el hito de la reforma laboral de 2012. */
function ServiceTimeline({ res, inicio, fin }: { res: IndemnizacionResultado; inicio: string; fin: string }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const { t } = useTransition();
  const split = res.tramos.length > 1;
  const total = res.tramos.reduce((s, tr) => s + tr.meses, 0) || 1;
  const boundary = split ? ((res.tramos[0]?.meses ?? 0) / total) * 100 : null;
  return (
    <div className={styles.service} ref={ref}>
      <p className={styles.serviceTitle}>Tiempo de servicio</p>
      <div className={styles.serviceTrack} aria-hidden="true">
        {res.tramos.map((tr, i) => (
          <motion.span
            key={tr.id}
            className={styles.serviceSeg}
            data-t={tr.id === 'desde-2012' ? '2' : '1'}
            style={{ flexGrow: tr.meses, transformOrigin: 'left center' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: seen ? 1 : 0 }}
            transition={t(0.45, i * 0.18)}
          />
        ))}
      </div>
      <div className={styles.serviceDates} aria-hidden="true">
        <span>{fechaCorta(inicio)}</span>
        {boundary !== null && boundary > 24 && boundary < 76 && (
          <span className={styles.serviceMid} style={{ left: `${boundary}%` }}>
            {fechaCorta(FECHA_REFORMA_2012)}
          </span>
        )}
        <span>{fechaCorta(fin)}</span>
      </div>
      <ul className={styles.serviceList} role="list">
        {res.tramos.map((tr) => (
          <li key={tr.id}>
            <span className={styles.serviceDot} data-t={tr.id === 'desde-2012' ? '2' : '1'} aria-hidden="true" />
            <span>
              <strong>{describirMeses(tr.meses)}</strong> {split ? (tr.id === 'antes-2012' ? 'hasta el 11/02/2012' : 'desde el 12/02/2012') : 'de servicio'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { AnimatePresence, motion } from 'motion/react';
import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { euros, type WidgetSpec } from '@flm/shared';
import { Notice } from '@/design';
import { evaluarDisolucion, type DisolucionResultado } from './calc';
import { Breakdown, Figure, Frame, Legend, LiveRegion, NumberField, useSeen, useTransition } from './ui';
import ui from './ui.module.css';
import styles from './Disolucion.module.css';

type Spec = Extract<WidgetSpec, { kind: 'disolucion-perdidas' }>;

const SOURCES = [
  { label: 'Art. 363.1.e LSC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a363' },
  { label: 'Arts. 365 a 367 LSC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a365' },
  { label: 'Art. 20 RDL 7/1996', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-13002#a20' },
  { label: 'Art. 3.1 Resolución ICAC 5/3/2019', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-3422#ar-3' },
];

export function Disolucion({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [capital, setCapital] = useState(spec.capital);
  const [pn, setPn] = useState(spec.patrimonioNeto);
  const [pp, setPp] = useState(spec.prestamoParticipativo ?? 0);
  const r = evaluarDisolucion({ capital, patrimonioNeto: pn, prestamoParticipativo: pp });
  const { t } = useTransition();
  const igual = !r.enCausa && r.margen === 0;

  const live = r.enCausa
    ? `En causa de disolución: el patrimonio neto a efectos de la causa, ${euros(r.pnMercantil)}, es inferior a la mitad del capital, ${euros(r.umbral)}. Faltan ${euros(r.deficit)}.`
    : `Fuera de la causa de disolución: el patrimonio neto a efectos de la causa, ${euros(r.pnMercantil)}, ${igual ? 'es igual a' : 'supera'} la mitad del capital, ${euros(r.umbral)}.`;

  return (
    <Frame
      kind="Comprobación · Art. 363.1.e LSC"
      title="¿Está la sociedad en causa de disolución?"
      intro="Compara el patrimonio neto a efectos de la causa con la mitad del capital social. El préstamo participativo es pasivo en contabilidad, pero aquí cuenta como patrimonio neto."
      sources={SOURCES}
      verified
      headingLevel={headingLevel}
    >
      <div className={ui.split}>
        <div className={ui.controls}>
          <NumberField label="Capital social (€)" value={capital} onChange={setCapital} min={0.01} rangeMessage="El capital debe ser mayor que cero." />
          <NumberField label="Patrimonio neto contable (€)" value={pn} onChange={setPn} hint="Puede ser negativo. Usa el del último balance, también intermedio: la causa no espera al cierre." />
          <NumberField label="Préstamo participativo (€)" value={pp} onChange={setPp} min={0} rangeMessage="Indica 0 si no hay préstamo participativo." hint="Opcional. Computa como patrimonio neto a estos efectos (art. 20.Uno.d RDL 7/1996; art. 3.1 Resolución del ICAC de 5/3/2019)." />
          <Notice icon={<Info size={18} />}>
            Antes de concluir, revisa los demás ajustes del art. 36.1.c CCom y los regímenes temporales vigentes: pérdidas de 2020 y 2021 (hasta el cierre del ejercicio iniciado en 2026), DANA y empresas emergentes.
          </Notice>
        </div>

        <div className={ui.results}>
          <div className={styles.verdictWrap} aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={r.enCausa ? 'causa' : 'fuera'} className={styles.verdict} data-tone={r.enCausa ? 'danger' : 'success'} initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.96 }} transition={t(0.28)}>
                {r.enCausa ? <TriangleAlert size={18} /> : <CircleCheck size={18} />}
                {r.enCausa ? 'En causa de disolución' : 'Fuera de la causa de disolución'}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="sr-only">{r.enCausa ? 'Veredicto: en causa de disolución.' : 'Veredicto: fuera de la causa de disolución.'}</p>
          <Figure
            label={r.enCausa ? 'Falta para salir de la causa' : 'Margen sobre la mitad del capital'}
            text={euros(Math.abs(r.margen))}
            sub={
              r.enCausa ? (
                <>
                  Patrimonio neto a efectos de la causa: <strong>{euros(r.pnMercantil)}</strong>, inferior a la mitad del capital ({euros(r.umbral)}).
                </>
              ) : (
                <>
                  Patrimonio neto a efectos de la causa: <strong>{euros(r.pnMercantil)}</strong>, {igual ? 'igual a' : 'por encima de'} la mitad del capital ({euros(r.umbral)}){igual ? ': justo en el límite, sin causa' : ''}.
                </>
              )
            }
          />
          <Balance r={r} pn={pn} pp={pp} />
          {r.minimos ? (
            <>
              <Breakdown
                caption="Para salir de la causa, como mínimo"
                rows={[
                  { term: 'Aportación de socios (cuenta 118)', detail: 'No aumenta el capital ni el umbral', value: euros(r.minimos.aportacion) },
                  { term: 'Préstamo participativo', detail: 'Nuevo o novando un préstamo de socio', value: euros(r.minimos.participativo) },
                  { term: 'Aumento de capital a la par', detail: 'Hace falta el doble: también sube el umbral', value: euros(r.minimos.aumentoALaPar) },
                  r.minimos.reduccion !== null
                    ? { term: 'Reducción de capital por pérdidas', detail: `Capital resultante de ${euros(r.minimos.capitalMaximoTrasReducir ?? 0)} como máximo`, value: euros(r.minimos.reduccion) }
                    : { term: 'Reducción de capital por pérdidas', detail: 'Con patrimonio neto negativo no basta: hace falta una operación acordeón', value: 'No basta' },
                ]}
              />
              <p className={styles.clock}>
                <strong>El reloj ya corre:</strong> dos meses desde que se produce la causa para convocar la junta (art. 365 LSC). Si no se actúa, los administradores responden solidariamente de las deudas sociales posteriores (art. 367 LSC).
              </p>
            </>
          ) : (
            <p className={styles.clock}>Sin obligación legal por pérdidas. Vigila la evolución: la causa puede aparecer en cualquier balance, también intermedio.</p>
          )}
        </div>
      </div>
      <LiveRegion message={live} />
    </Frame>
  );
}

/* «La balanza»: patrimonio neto (y préstamo participativo) frente a la mitad del capital. */
function Balance({ r, pn, pp }: { r: DisolucionResultado; pn: number; pp: number }) {
  const [ref, seen] = useSeen<HTMLElement>();
  const { t } = useTransition();
  const lo = Math.min(0, pn, r.pnMercantil);
  const hi = Math.max(r.umbral * 2, r.pnMercantil, pn, 1) * 1.04;
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100;
  const zero = pos(0);
  const pnFrom = Math.min(0, pn);
  const pnTo = Math.max(0, pn);
  const ppFrom = pn;
  const ppTo = pn + pp;
  const gapFrom = Math.min(r.pnMercantil, r.umbral);
  const gapTo = Math.max(r.pnMercantil, r.umbral);
  const anim = (from: number, to: number, delay = 0) => ({
    initial: { left: `${zero}%`, width: '0%' },
    animate: seen ? { left: `${pos(from)}%`, width: `${Math.max(0, pos(to) - pos(from))}%` } : { left: `${zero}%`, width: '0%' },
    transition: t(0.5, delay),
  });
  return (
    <figure className={styles.balance} ref={ref}>
      <div className={styles.plot} aria-hidden="true">
        <span className={styles.thresholdLabel} data-side={pos(r.umbral) > 58 ? 'left' : 'right'} style={{ '--x': pos(r.umbral) } as CSSProperties}>
          Mitad del capital · {euros(r.umbral, 0)}
        </span>
        <div className={styles.track}>
          {lo < 0 && <span className={styles.zero} style={{ left: `${zero}%` }} />}
          {pn !== 0 && <motion.span className={styles.bar} data-neg={pn < 0 || undefined} {...anim(pnFrom, pnTo)} />}
          {pp > 0 && <motion.span className={styles.bar} data-kind="pp" {...anim(Math.min(ppFrom, ppTo), Math.max(ppFrom, ppTo), 0.18)} />}
        </div>
        <span className={styles.threshold} style={{ left: `${pos(r.umbral)}%` }} />
        {gapTo - gapFrom > 0 && (
          <motion.span className={styles.gap} data-tone={r.enCausa ? 'danger' : 'success'} initial={false} animate={{ left: `${pos(gapFrom)}%`, width: `${pos(gapTo) - pos(gapFrom)}%` }} transition={t(0.4)}>
            <span className={styles.gapLabel}>{r.enCausa ? `Faltan ${euros(r.deficit, 0)}` : `Margen ${euros(r.margen, 0)}`}</span>
          </motion.span>
        )}
      </div>
      <figcaption>
        <Legend
          items={[
            { label: pn < 0 ? 'Patrimonio neto contable (negativo)' : 'Patrimonio neto contable', swatch: pn < 0 ? 'hatch' : 'solid', color: pn < 0 ? 'var(--accent)' : 'var(--s1)' },
            ...(pp > 0 ? [{ label: 'Préstamo participativo (computa como PN)', swatch: 'solid' as const, color: 'var(--s3)' }] : []),
            { label: 'Mitad del capital', swatch: 'line', color: 'var(--accent)' },
          ]}
        />
      </figcaption>
    </figure>
  );
}

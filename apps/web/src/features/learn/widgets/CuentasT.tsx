import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CircleCheck, ListChecks, RotateCcw, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { euros, type WidgetSpec } from '@flm/shared';
import { Button, Notice } from '@/design';
import { cuadreAsiento, libroMayor, round2, type CuentaT } from './calc';
import { fechaCorta } from './format';
import { JournalEntryView } from './Journal';
import { Trail } from './Trail';
import { cx, Frame, LiveRegion, useTransition } from './ui';
import styles from './CuentasT.module.css';

type Spec = Extract<WidgetSpec, { kind: 'cuentas-t' }>;

const SOURCES = [{ label: 'PGC, cuarta y quinta parte (cuadro de cuentas y definiciones)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4' }];

export function CuentasT({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const entries = spec.entries;
  const n = entries.length;
  const [step, setStep] = useState(0);
  const mayor = libroMayor(entries, step);
  const current = step > 0 ? entries[step - 1] : undefined;
  const touched = new Set(current?.lines.map((l) => l.account) ?? []);
  const posted = entries.slice(0, step);
  const totalDebe = round2(posted.reduce((s, e) => s + cuadreAsiento(e).debe, 0));
  const totalHaber = round2(posted.reduce((s, e) => s + cuadreAsiento(e).haber, 0));
  const cuadra = Math.abs(totalDebe - totalHaber) < 0.005;
  const Sub = `h${Math.min(6, headingLevel + 1)}` as 'h4';
  const { t: tr } = useTransition();

  const live = current
    ? `Asiento ${step} de ${n}: ${current.concept}. ${current.lines.map((l) => (l.debit ? `Cargo de ${euros(l.debit)} en ${l.account} ${l.name}` : `abono de ${euros(l.credit ?? 0)} en ${l.account} ${l.name}`)).join('; ')}. ${cuadreAsiento(current).cuadra ? 'Cuadra.' : 'No cuadra.'}`
    : 'Cuentas en blanco: aún no hay asientos registrados.';

  if (n === 0) {
    return (
      <Frame kind="Paso a paso · Cuentas en T" title={spec.title ?? 'Asientos en cuentas en T'} headingLevel={headingLevel}>
        <Notice tone="warning">Este apoyo no tiene asientos todavía.</Notice>
      </Frame>
    );
  }

  return (
    <Frame
      kind="Paso a paso · Cuentas en T"
      title={spec.title ?? 'Asientos en cuentas en T'}
      intro="Avanza asiento a asiento y observa cómo se cargan (debe) y se abonan (haber) las cuentas. Al final, el total del debe tiene que ser igual al del haber."
      sources={SOURCES}
      headingLevel={headingLevel}
    >
      <div className={styles.toolbar}>
        <div className={styles.progress}>
          <Trail total={n} done={step} current={step < n ? step : undefined} />
          <p className={styles.progressText} aria-hidden="true">
            {step === 0 ? 'Sin asientos registrados' : `Asiento ${step} de ${n}`}
          </p>
        </div>
        <div className={styles.buttons}>
          <Button variant="secondary" icon={<ChevronLeft size={16} />} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Anterior
          </Button>
          <Button variant="primary" iconRight={<ChevronRight size={16} />} onClick={() => setStep((s) => Math.min(n, s + 1))} disabled={step === n}>
            {step === 0 ? 'Registrar el primer asiento' : 'Siguiente asiento'}
          </Button>
          {step < n ? (
            <Button variant="ghost" icon={<ListChecks size={16} />} onClick={() => setStep(n)}>
              Ver todo
            </Button>
          ) : (
            <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={() => setStep(0)}>
              Volver a empezar
            </Button>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.diary}>
          <Sub className={styles.colTitle}>Libro diario</Sub>
          <ol className={styles.steps} role="list">
            {entries.map((e, i) => {
              const state = i < step - 1 ? 'done' : i === step - 1 ? 'current' : 'pending';
              return (
                <li key={i} className={styles.stepItem} data-state={state}>
                  <button type="button" className={styles.stepButton} aria-current={state === 'current' ? 'step' : undefined} onClick={() => setStep(i + 1)}>
                    <span className={styles.stepNum}>{i + 1}</span>
                    <span className={styles.stepText}>
                      <span className={styles.stepConcept}>{e.concept}</span>
                      {e.date && <span className={styles.stepDate}>{/^\d{4}-\d{2}-\d{2}$/.test(e.date) ? fechaCorta(e.date) : e.date}</span>}
                    </span>
                    <span className={styles.stepState}>{state === 'done' ? 'Registrado' : state === 'current' ? 'Ahora' : 'Pendiente'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {state === 'current' && (
                      <motion.div className={styles.stepDetail} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={tr(0.28)}>
                        <JournalEntryView entry={e} number={i + 1} compact />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={styles.ledger}>
          <Sub className={styles.colTitle}>Mayor: cuentas en T</Sub>
          <div className={styles.grid}>
            {mayor.map((c) => (
              <TAccount key={c.account} cuenta={c} touched={touched.has(c.account)} headingLevel={Math.min(6, headingLevel + 2) as 5} />
            ))}
          </div>
          <p className={cx(styles.balance, step > 0 && (cuadra ? styles.balanceOk : styles.balanceKo))}>
            {step === 0 ? (
              'Registra el primer asiento para empezar.'
            ) : (
              <>
                {cuadra ? <CircleCheck size={18} aria-hidden="true" /> : <TriangleAlert size={18} aria-hidden="true" />}
                <span>
                  {cuadra ? 'Cuadra' : 'No cuadra'}: total debe <strong>{euros(totalDebe)}</strong> {cuadra ? '=' : '≠'} total haber <strong>{euros(totalHaber)}</strong>
                </span>
              </>
            )}
          </p>
        </div>
      </div>
      <LiveRegion message={live} delay={300} />
    </Frame>
  );
}

function TAccount({ cuenta, touched, headingLevel }: { cuenta: CuentaT; touched: boolean; headingLevel: 4 | 5 | 6 }) {
  const { t } = useTransition();
  const H = `h${headingLevel}` as 'h5';
  const saldoText = cuenta.saldo > 0 ? `Saldo deudor ${euros(cuenta.saldo)}` : cuenta.saldo < 0 ? `Saldo acreedor ${euros(-cuenta.saldo)}` : cuenta.totalDebe > 0 ? 'Saldada' : 'Sin movimientos';
  const side = (items: CuentaT['debe']) => (
    <ul className={styles.moves} role="list">
      <AnimatePresence initial={false}>
        {items.map((m) => (
          <motion.li key={m.asiento} className={styles.move} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={t(0.32)}>
            <motion.span className={styles.flash} aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={t(1.1, 0.3)} />
            <span className={styles.moveRef}>({m.asiento + 1})</span>
            <span className={styles.moveAmount}>{euros(m.importe)}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
  return (
    <section className={styles.t} data-touched={touched || undefined} data-empty={cuenta.debe.length + cuenta.haber.length === 0 || undefined}>
      <H className={styles.tHead}>
        <span className={styles.tCode}>{cuenta.account}</span> {cuenta.name}
      </H>
      <div className={styles.tBody}>
        <div className={styles.tSide}>
          <span className={styles.tSideLabel}>Debe</span>
          {side(cuenta.debe)}
        </div>
        <div className={styles.tSide}>
          <span className={styles.tSideLabel}>Haber</span>
          {side(cuenta.haber)}
        </div>
      </div>
      <div className={styles.tTotals}>
        <span>{euros(cuenta.totalDebe)}</span>
        <span>{euros(cuenta.totalHaber)}</span>
      </div>
      <p className={styles.tSaldo} data-kind={cuenta.saldo > 0 ? 'deudor' : cuenta.saldo < 0 ? 'acreedor' : 'cero'}>
        {saldoText}
      </p>
    </section>
  );
}

import { describe, expect, it } from 'vitest';
import {
  cabecerasComparativa,
  calcularIndemnizacion,
  calcularRecargo,
  calendarioCuentas,
  cuadreAsiento,
  cuadroAmortizacion,
  cuentaDeGasto,
  describirMeses,
  escalaRecargo,
  estadoPlazo,
  evaluarDisolucion,
  formatPct,
  interesesDemora,
  isDateKey,
  libroMayor,
  mesesCompletosDeRetraso,
  mesesDeServicio,
  niceScale,
  parseImporte,
  periodificar,
  profundidadArbol,
  recargoPorcentaje,
  retrasoConFechas,
  revisarArbol,
  round2,
  ultimoDiaCubierto,
  type IndemnizacionResultado,
} from './calc';

const ok = (r: ReturnType<typeof calcularIndemnizacion>): IndemnizacionResultado => {
  if (!r.ok) throw new Error(`Cálculo no válido: ${r.error}`);
  return r;
};

describe('utilidades', () => {
  it('redondea a céntimos', () => {
    expect(round2(46.12054794)).toBe(46.12);
    expect(round2(1.005)).toBe(1.01);
    expect(round2(-2.345)).toBe(-2.35);
  });

  it('interpreta importes escritos a la española', () => {
    expect(parseImporte('2.800')).toBe(2800);
    expect(parseImporte('2.800,50')).toBe(2800.5);
    expect(parseImporte('2800,5')).toBe(2800.5);
    expect(parseImporte('1.234.567,89')).toBe(1234567.89);
    expect(parseImporte(' 1 234,5 € ')).toBe(1234.5);
    expect(parseImporte('-2.000')).toBe(-2000);
    expect(parseImporte('33,33')).toBe(33.33);
    expect(parseImporte('2800.5')).toBe(2800.5);
    expect(parseImporte('0.500')).toBe(0.5);
    expect(parseImporte('')).toBeNull();
    expect(parseImporte('abc')).toBeNull();
    expect(parseImporte('1,2,3')).toBeNull();
  });

  it('describe años y meses', () => {
    expect(describirMeses(32)).toBe('2 años y 8 meses');
    expect(describirMeses(177)).toBe('14 años y 9 meses');
    expect(describirMeses(12)).toBe('1 año');
    expect(describirMeses(13)).toBe('1 año y 1 mes');
    expect(describirMeses(5)).toBe('5 meses');
  });

  it('valida claves de fecha', () => {
    expect(isDateKey('2026-02-29')).toBe(false);
    expect(isDateKey('2028-02-29')).toBe(true);
    expect(isDateKey('2026-13-01')).toBe(false);
    expect(isDateKey('')).toBe(false);
  });

  it('formatea porcentajes con espacio duro', () => {
    expect(formatPct(5)).toBe('5 %');
    expect(formatPct(3.75)).toBe('3,75 %');
    expect(formatPct(4.0625)).toBe('4,0625 %');
  });

  it('calcula el último día cubierto por n meses', () => {
    expect(ultimoDiaCubierto('2009-06-12', 32)).toBe('2012-02-11');
    expect(ultimoDiaCubierto('2026-10-01', 12)).toBe('2027-09-30');
    expect(ultimoDiaCubierto('2026-01-31', 3)).toBe('2026-04-30');
    expect(ultimoDiaCubierto('2026-01-31', 1)).toBe('2026-02-28');
  });
});

describe('recargo extemporáneo (art. 27 LGT)', () => {
  it('aplica 1 % + 1 % por mes completo y 15 % pasados 12 meses', () => {
    expect(recargoPorcentaje(0)).toBe(1);
    expect(recargoPorcentaje(4)).toBe(5);
    expect(recargoPorcentaje(11)).toBe(12);
    expect(recargoPorcentaje(12)).toBe(15);
    expect(recargoPorcentaje(24)).toBe(15);
    expect(escalaRecargo()).toHaveLength(25);
  });

  it('TC1 · Nébula Studio: 2.800 €, 4 meses completos → 140 € (105 € con reducción)', () => {
    expect(mesesCompletosDeRetraso('2026-04-20', '2026-09-15')).toBe(4);
    const integro = calcularRecargo(2800, 4, false);
    expect(integro.porcentaje).toBe(5);
    expect(integro.aPagar).toBe(140);
    expect(integro.conIntereses).toBe(false);
    const reducido = calcularRecargo(2800, 4, true);
    expect(reducido.reduccion).toBe(35);
    expect(reducido.aPagar).toBe(105);
    expect(reducido.porcentajeEfectivo).toBe(3.75);
  });

  it('TC2 · más de 12 meses: 15 % (315 € reducido) e intereses de 136 días = 42,38 €', () => {
    const r = retrasoConFechas(2800, '2025-01-30', '2026-06-15');
    expect(r.meses).toBeGreaterThanOrEqual(12);
    expect(r.interesesDesde).toBe('2026-01-31');
    expect(r.intereses?.dias).toBe(136);
    expect(r.intereses?.importe).toBe(42.38);
    expect(calcularRecargo(2800, r.meses, false).aPagar).toBe(420);
    expect(calcularRecargo(2800, r.meses, true).aPagar).toBe(315);
  });

  it('TC3 · con requerimiento: intereses de 148 días = 46,12 €', () => {
    const i = interesesDemora(2800, '2026-04-21', '2026-09-15');
    expect(i?.dias).toBe(148);
    expect(i?.importe).toBe(46.12);
  });

  it('TC4 · bordes del primer mes: 1 % el 20/05 y 2 % el 21/05', () => {
    expect(recargoPorcentaje(mesesCompletosDeRetraso('2026-04-20', '2026-05-20'))).toBe(1);
    expect(recargoPorcentaje(mesesCompletosDeRetraso('2026-04-20', '2026-05-21'))).toBe(2);
  });

  it('TC5 · bordes del año: 12 % el 20/04/2027 y 15 % el 21/04/2027, sin tipo verificado para 2027', () => {
    expect(recargoPorcentaje(mesesCompletosDeRetraso('2026-04-20', '2027-04-20'))).toBe(12);
    const r = retrasoConFechas(2800, '2026-04-20', '2027-04-21');
    expect(recargoPorcentaje(r.meses)).toBe(15);
    expect(r.interesesDesde).toBe('2027-04-21');
    expect(r.intereses).toBeNull();
  });

  it('presentación en plazo: sin recargo', () => {
    expect(retrasoConFechas(2800, '2026-04-20', '2026-04-20').enPlazo).toBe(true);
  });
});

describe('indemnización por despido (arts. 53 y 56 ET; DT 11.ª)', () => {
  it('cuenta los meses de servicio con la fracción como mes completo', () => {
    expect(mesesDeServicio('2009-06-12', '2012-02-11')).toBe(32);
    expect(mesesDeServicio('2012-02-12', '2026-11-11')).toBe(177);
    expect(mesesDeServicio('2009-06-12', '2026-11-11')).toBe(209);
    expect(mesesDeServicio('2022-02-16', '2022-09-23')).toBe(8);
    expect(mesesDeServicio('2026-03-01', '2026-03-01')).toBe(1);
  });

  const efectos = '2026-11-11';
  const salario = 32850;

  it('caso 1 · Laura (alta 12/06/2009): 54.607,50 € improcedente y 31.350,00 € objetivo', () => {
    const imp = ok(calcularIndemnizacion({ salarioAnual: salario, inicio: '2009-06-12', fin: efectos, tipo: 'improcedente' }));
    expect(imp.salarioDiario).toBe(90);
    expect(imp.tramos.map((t) => t.dias)).toEqual([120, 486.75]);
    expect(imp.dias).toBe(606.75);
    expect(imp.topeAplicado).toBe(false);
    expect(imp.importe).toBe(54607.5);
    const obj = ok(calcularIndemnizacion({ salarioAnual: salario, inicio: '2009-06-12', fin: efectos, tipo: 'objetivo' }));
    expect(obj.dias).toBeCloseTo(348.3333, 3);
    expect(obj.importe).toBe(31350);
  });

  it('caso 2 · tope por el tramo anterior a 2012 (alta 12/06/1995): 750 días = 67.500 €', () => {
    const imp = ok(calcularIndemnizacion({ salarioAnual: salario, inicio: '1995-06-12', fin: efectos, tipo: 'improcedente' }));
    expect(imp.tramos[0]?.dias).toBe(750);
    expect(imp.tope).toBe(750);
    expect(imp.topeMotivo).toBe('tramo-anterior');
    expect(imp.dias).toBe(750);
    expect(imp.importe).toBe(67500);
    const obj = ok(calcularIndemnizacion({ salarioAnual: salario, inicio: '1995-06-12', fin: efectos, tipo: 'objetivo' }));
    expect(obj.topeAplicado).toBe(true);
    expect(obj.importe).toBe(32400);
  });

  it('caso 3 · tope general (alta 12/02/1998): 1.116,75 días → 720 días = 64.800 €', () => {
    const imp = ok(calcularIndemnizacion({ salarioAnual: salario, inicio: '1998-02-12', fin: efectos, tipo: 'improcedente' }));
    expect(imp.diasSinTope).toBe(1116.75);
    expect(imp.tope).toBe(720);
    expect(imp.topeAplicado).toBe(true);
    expect(imp.importe).toBe(64800);
    expect(ok(calcularIndemnizacion({ salarioAnual: salario, inicio: '1998-02-12', fin: efectos, tipo: 'objetivo' })).importe).toBe(32400);
  });

  it('caso 4 · contrato posterior a 2012 (alta 12/03/2016): 31.680 € y 19.200 €', () => {
    const imp = ok(calcularIndemnizacion({ salarioAnual: salario, inicio: '2016-03-12', fin: efectos, tipo: 'improcedente' }));
    expect(imp.tramos).toHaveLength(1);
    expect(imp.dias).toBe(352);
    expect(imp.importe).toBe(31680);
    expect(ok(calcularIndemnizacion({ salarioAnual: salario, inicio: '2016-03-12', fin: efectos, tipo: 'objetivo' })).importe).toBe(19200);
  });

  it('contraste con la STS 736/2025: 8 meses a 33 días con 68,49 €/día = 1.506,78 €', () => {
    const r = ok(calcularIndemnizacion({ salarioAnual: 2083.33 * 12, inicio: '2022-02-16', fin: '2022-09-23', tipo: 'improcedente' }));
    expect(r.salarioDiario).toBe(68.49);
    expect(r.dias).toBe(22);
    expect(r.importe).toBe(1506.78);
  });

  it('rechaza datos imposibles', () => {
    expect(calcularIndemnizacion({ salarioAnual: 0, inicio: '2020-01-01', fin: '2026-01-01', tipo: 'objetivo' })).toEqual({ ok: false, error: 'salario' });
    expect(calcularIndemnizacion({ salarioAnual: 30000, inicio: '2026-01-01', fin: '2020-01-01', tipo: 'objetivo' })).toEqual({ ok: false, error: 'orden' });
    expect(calcularIndemnizacion({ salarioAnual: 30000, inicio: '2005-01-01', fin: '2011-01-01', tipo: 'improcedente' })).toEqual({ ok: false, error: 'anterior-reforma' });
  });
});

describe('causa de disolución por pérdidas (art. 363.1.e LSC)', () => {
  it('ALFA, S.L.: 24.000 € frente a 30.000 € → en causa; faltan 6.000 €', () => {
    const r = evaluarDisolucion({ capital: 60000, patrimonioNeto: 24000 });
    expect(r.umbral).toBe(30000);
    expect(r.enCausa).toBe(true);
    expect(r.deficit).toBe(6000);
    expect(r.minimos).toEqual({ aportacion: 6000, participativo: 6000, aumentoALaPar: 12000, reduccion: 12000, capitalMaximoTrasReducir: 48000 });
  });

  it('el préstamo participativo computa como patrimonio neto', () => {
    const r = evaluarDisolucion({ capital: 60000, patrimonioNeto: 24000, prestamoParticipativo: 10000 });
    expect(r.pnMercantil).toBe(34000);
    expect(r.enCausa).toBe(false);
    expect(r.margen).toBe(4000);
  });

  it('exactamente la mitad no es causa', () => {
    expect(evaluarDisolucion({ capital: 60000, patrimonioNeto: 30000 }).enCausa).toBe(false);
  });

  it('con PN negativo reducir no basta (operación acordeón)', () => {
    const r = evaluarDisolucion({ capital: 3000, patrimonioNeto: -2000 });
    expect(r.deficit).toBe(3500);
    expect(r.minimos?.aumentoALaPar).toBe(7000);
    expect(r.minimos?.reduccion).toBeNull();
  });
});

describe('calendario de cuentas anuales', () => {
  it('cierre a 31/12/2026', () => {
    const c = calendarioCuentas('2026-12-31');
    expect(c.formulacion).toBe('2027-03-31');
    expect(c.legalizacion).toBe('2027-04-30');
    expect(c.juntaLimite).toBe('2027-06-30');
    expect(c.deposito).toBe('2027-07-30');
    expect(c.cierreRegistral).toBe('2027-12-31');
    expect(calendarioCuentas('2026-12-31', '2027-06-22').deposito).toBe('2027-07-22');
  });

  it('cierre a 30/06/2026', () => {
    const c = calendarioCuentas('2026-06-30');
    expect(c.formulacion).toBe('2026-09-30');
    expect(c.legalizacion).toBe('2026-10-30');
    expect(c.juntaLimite).toBe('2026-12-31');
    expect(calendarioCuentas('2026-06-30', '2026-12-15').deposito).toBe('2027-01-15');
    expect(c.deposito).toBe('2027-01-31');
    expect(c.cierreRegistral).toBe('2027-06-30');
  });

  it('respeta el último día del mes y descarta juntas anteriores al cierre', () => {
    expect(calendarioCuentas('2026-11-30').formulacion).toBe('2027-02-28');
    expect(calendarioCuentas('2027-08-31', '2027-08-15').aprobacion).toBe(calendarioCuentas('2027-08-31').juntaLimite);
  });

  it('clasifica el estado de cada plazo', () => {
    expect(estadoPlazo('2026-10-30', '2026-10-28')).toEqual({ estado: 'pronto', dias: 2 });
    expect(estadoPlazo('2026-09-30', '2026-10-28').estado).toBe('vencido');
    expect(estadoPlazo('2026-10-28', '2026-10-28').estado).toBe('hoy');
    expect(estadoPlazo('2026-12-31', '2026-10-28').estado).toBe('en-plazo');
  });
});

describe('amortización contable frente a fiscal', () => {
  it('caso A: 1.500 € en 4 años al 25 %: sin ajustes', () => {
    const rows = cuadroAmortizacion({ coste: 1500, vidaUtil: 4, coeficienteFiscalMax: 25 });
    expect(rows).toHaveLength(4);
    expect(rows.map((r) => r.ajuste)).toEqual([0, 0, 0, 0]);
    expect(rows.map((r) => r.vnc)).toEqual([1125, 750, 375, 0]);
  });

  it('caso B: 1.500 € en 3 años al 25 %: +125 × 3 y reversión de 375; 4740 al 25 %', () => {
    const rows = cuadroAmortizacion({ coste: 1500, vidaUtil: 3, coeficienteFiscalMax: 25, tipoGravamen: 25 });
    expect(rows.map((r) => r.contable)).toEqual([500, 500, 500, 0]);
    expect(rows.map((r) => r.deducible)).toEqual([375, 375, 375, 375]);
    expect(rows.map((r) => r.ajuste)).toEqual([125, 125, 125, -375]);
    expect(rows.map((r) => r.valorFiscal)).toEqual([1125, 750, 375, 0]);
    expect(rows.map((r) => r.saldoDiferido)).toEqual([31.25, 62.5, 93.75, 0]);
    expect(rows.map((r) => r.movimientoDiferido)).toEqual([31.25, 31.25, 31.25, -93.75]);
  });

  it('admite el coeficiente como fracción y reparte los céntimos sin residuos', () => {
    const rows = cuadroAmortizacion({ coste: 1000, vidaUtil: 3, coeficienteFiscalMax: 0.5 });
    expect(rows.map((r) => r.contable)).toEqual([333.33, 333.34, 333.33]);
    expect(rows.at(-1)?.vnc).toBe(0);
  });

  it('con valor residual, la base amortizable es coste − residual', () => {
    const rows = cuadroAmortizacion({ coste: 10000, vidaUtil: 5, coeficienteFiscalMax: 20, valorResidual: 1000 });
    expect(rows[0]?.contable).toBe(1800);
    expect(rows.at(-1)?.vnc).toBe(1000);
  });
});

describe('periodificación (cuenta 480)', () => {
  it('seguro de 1.200 € del 01/10/2026: 300 € del ejercicio y 900 € a la 480 (por meses)', () => {
    const r = periodificar({ importe: 1200, inicio: '2026-10-01', meses: 12, cierre: '2026-12-31', metodo: 'meses' });
    expect(r.fin).toBe('2027-09-30');
    expect(r.mesesEjercicio).toBe(3);
    expect(r.delEjercicio).toBe(300);
    expect(r.anticipado).toBe(900);
    expect(r.reversion).toBe('2027-01-01');
  });

  it('el mismo seguro por días: 302,47 € y 897,53 €', () => {
    const r = periodificar({ importe: 1200, inicio: '2026-10-01', meses: 12, cierre: '2026-12-31', metodo: 'dias' });
    expect(r.totalDias).toBe(365);
    expect(r.diasEjercicio).toBe(92);
    expect(r.delEjercicio).toBe(302.47);
    expect(r.anticipado).toBe(897.53);
  });

  it('alquiler de 4.800 € de noviembre a abril: 1.600 € en el ejercicio', () => {
    expect(periodificar({ importe: 4800, inicio: '2026-11-01', meses: 6, cierre: '2026-12-31', metodo: 'meses' }).delEjercicio).toBe(1600);
  });

  it('periodo que empieza a mitad de mes y periodo ya consumido', () => {
    const r = periodificar({ importe: 1200, inicio: '2026-10-15', meses: 12, cierre: '2026-12-31', metodo: 'meses' });
    expect(r.mesesEjercicio).toBeCloseTo(2 + 17 / 31, 6);
    expect(periodificar({ importe: 600, inicio: '2026-01-01', meses: 6, cierre: '2026-12-31', metodo: 'meses' }).anticipado).toBe(0);
  });

  it('propone la cuenta de gasto según el concepto', () => {
    expect(cuentaDeGasto('Prima de seguro multirriesgo').account).toBe('625');
    expect(cuentaDeGasto('Alquiler del local').account).toBe('621');
    expect(cuentaDeGasto('Licencias de software').account).toBe('6xx');
  });
});

describe('cuentas en T', () => {
  const entries = [
    { concept: 'Pago de la prima', lines: [{ account: '625', name: 'Primas de seguros', debit: 1200 }, { account: '572', name: 'Bancos', credit: 1200 }] },
    { concept: 'Periodificación', lines: [{ account: '480', name: 'Gastos anticipados', debit: 900 }, { account: '625', name: 'Primas de seguros', credit: 900 }] },
  ];

  it('comprueba el cuadre de cada asiento', () => {
    expect(cuadreAsiento(entries[0]!)).toEqual({ debe: 1200, haber: 1200, cuadra: true });
    expect(cuadreAsiento({ concept: 'Mal', lines: [{ account: '1', name: 'A', debit: 10 }, { account: '2', name: 'B', credit: 9 }] }).cuadra).toBe(false);
  });

  it('acumula el mayor paso a paso con todas las cuentas visibles', () => {
    const uno = libroMayor(entries, 1);
    expect(uno.map((c) => c.account)).toEqual(['625', '572', '480']);
    expect(uno.find((c) => c.account === '480')?.totalDebe).toBe(0);
    const dos = libroMayor(entries, 2);
    const primas = dos.find((c) => c.account === '625')!;
    expect(primas.totalDebe).toBe(1200);
    expect(primas.totalHaber).toBe(900);
    expect(primas.saldo).toBe(300);
    expect(dos.find((c) => c.account === '572')?.saldo).toBe(-1200);
  });
});

describe('árbol de decisión', () => {
  const nodes = [
    { id: 'a', question: '¿Hay requerimiento?', options: [{ label: 'Sí', next: 'fin1' }, { label: 'No', next: 'b' }] },
    { id: 'b', question: '¿Más de 12 meses?', options: [{ label: 'Sí', next: 'fin2' }, { label: 'No', next: 'fin3' }] },
    { id: 'fin1', outcome: { title: 'Intereses y sanción', text: '…', tone: 'atencion' as const } },
    { id: 'fin2', outcome: { title: '15 %', text: '…', tone: 'resolver' as const } },
    { id: 'fin3', outcome: { title: '1 % + 1 %', text: '…', tone: 'resolver' as const } },
  ];

  it('valida la estructura y mide la profundidad', () => {
    expect(revisarArbol('a', nodes)).toEqual([]);
    expect(profundidadArbol('a', nodes)).toBe(2);
    expect(revisarArbol('x', nodes)).toHaveLength(1);
    expect(revisarArbol('a', [...nodes, { id: 'c', question: '¿?', options: [{ label: 'Sí', next: 'nada' }] }])).toHaveLength(1);
  });
});

describe('gráficos y comparativas', () => {
  it('elige escalas limpias', () => {
    expect(niceScale(0, 15).ticks).toEqual([0, 5, 10, 15]);
    expect(niceScale(0, 1500).ticks).toEqual([0, 500, 1000, 1500]);
    expect(niceScale(0, 0).ticks.length).toBeGreaterThan(1);
  });

  it('detecta si la primera columna rotula las filas', () => {
    expect(cabecerasComparativa(['', 'Disciplinario', 'Objetivo'], 2)).toEqual({ labelHeader: '', valueHeaders: ['Disciplinario', 'Objetivo'] });
    expect(cabecerasComparativa(['Calificación', 'Disciplinario', 'Objetivo'], 2).labelHeader).toBe('Calificación');
    expect(cabecerasComparativa(['Disciplinario', 'Objetivo'], 2)).toEqual({ labelHeader: '', valueHeaders: ['Disciplinario', 'Objetivo'] });
  });
});

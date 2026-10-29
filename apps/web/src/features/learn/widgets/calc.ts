/**
 * Lógica pura de los apoyos visuales interactivos de las formaciones.
 *
 * Todas las reglas proceden de los informes de investigación verificados a 28/10/2026:
 *  - research/10-fis-01-recargos.md (art. 27 LGT; intereses de demora de 2023-2026)
 *  - research/20-lab-01-despido.md (arts. 53.1.b y 56.1 ET; DT 11.ª ET)
 *  - research/31-mer-02-perdidas.md (art. 363.1.e LSC; art. 20.Uno.d RDL 7/1996; art. 3.1 Resolución ICAC 5/3/2019)
 *  - research/32-mer-03-cuentas.md (arts. 164, 253, 279 y 282 LSC; art. 18 Ley 14/2013; art. 5.1 CC)
 *  - research/41-con-02-devengo.md (cuenta 480; reparto por meses o por días)
 *  - research/42-con-03-amortizacion.md (NRV 2.ª PGC; art. 12.1.a y 11.3.1.º LIS; NRV 13.ª PGC)
 *
 * Las fechas son claves «AAAA-MM-DD» (sin zonas horarias) y los importes, euros.
 */
import type { JournalEntry } from '@flm/shared';
import { addDays, addMonthsClamped, daysInMonth, decisionTreeProblems, diffDays, isLeapYear } from '@flm/shared';

/* ────────────────────────────────────────────────────────────────────────────
 * Utilidades
 * ──────────────────────────────────────────────────────────────────────────── */

/** Redondeo a céntimos (mitad hacia arriba, simétrico para negativos). */
export function round2(n: number): number {
  const r = Math.round(Math.abs(n) * 100 + 1e-7) / 100;
  return n < 0 ? -r : r;
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const pad = (n: number) => String(n).padStart(2, '0');

/** ¿Es una clave de fecha «AAAA-MM-DD» válida? */
export function isDateKey(value: string | undefined | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

/**
 * Interpreta un importe escrito a la española: «2.800», «2.800,50», «2800,5», «-2.000», «1 234,5 €».
 * Un único punto seguido de tres cifras se lee como separador de miles («1.500» = 1500).
 */
export function parseImporte(raw: string): number | null {
  let s = raw.trim().replace(/[\s  ]/g, '').replace(/(€|eur|euros)$/i, '');
  if (!s) return null;
  let sign = 1;
  if (s.startsWith('-') || s.startsWith('−')) {
    sign = -1;
    s = s.slice(1);
  } else if (s.startsWith('+')) s = s.slice(1);
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  let normalized: string;
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.';
    const thousands = decimal === ',' ? '.' : ',';
    normalized = s.split(thousands).join('').replace(decimal, '.');
  } else if (lastComma >= 0) {
    if (s.indexOf(',') !== lastComma) return null;
    normalized = s.replace(',', '.');
  } else if (lastDot >= 0) {
    const parts = s.split('.');
    if (parts.length > 2) {
      if (!parts.slice(1).every((p) => p.length === 3)) return null;
      normalized = parts.join('');
    } else {
      const [int = '', frac = ''] = parts;
      normalized = frac.length === 3 && int !== '0' && int !== '' ? int + frac : s;
    }
  } else normalized = s;
  if (normalized.startsWith('.')) normalized = '0' + normalized;
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const n = Number(normalized) * sign;
  return Number.isFinite(n) ? n : null;
}

/** «1 año», «2 años y 8 meses», «5 meses», «0 meses». */
export function describirMeses(totalMeses: number): string {
  const n = Math.max(0, Math.round(totalMeses));
  const years = Math.floor(n / 12);
  const months = n % 12;
  const y = years === 1 ? '1 año' : `${years} años`;
  const m = months === 1 ? '1 mes' : `${months} meses`;
  if (years === 0) return m;
  if (months === 0) return y;
  return `${y} y ${m}`;
}

/** Ordinal abreviado masculino: «5.º». */
export const ordinal = (n: number) => `${n}.º`;

/**
 * Último día cubierto por los primeros «n» meses de un periodo que empieza (incluido) en «inicio».
 * Del 12/06 al 11/07 hay un mes; del 01/10 al 31/10, también. Si el día no existe en el mes
 * de destino, el periodo termina el último día de ese mes (art. 5.1 CC).
 */
export function ultimoDiaCubierto(inicio: string, n: number): string {
  const [y, m, d] = inicio.split('-').map(Number) as [number, number, number];
  if (d === 1) {
    const t = new Date(Date.UTC(y, m - 1 + n - 1, 1));
    const ty = t.getUTCFullYear();
    const tm = t.getUTCMonth() + 1;
    return `${ty}-${pad(tm)}-${pad(daysInMonth(ty, tm))}`;
  }
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  const ty = t.getUTCFullYear();
  const tm = t.getUTCMonth() + 1;
  return `${ty}-${pad(tm)}-${pad(Math.min(d - 1, daysInMonth(ty, tm)))}`;
}

/** Porcentaje legible: «5 %», «3,75 %» (espacio duro, como en la norma). */
export function formatPct(value: number, maxDecimals = 4): string {
  const s = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: maxDecimals }).format(value);
  return `${s} %`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · Recargo por presentación extemporánea (art. 27 LGT)
 * ──────────────────────────────────────────────────────────────────────────── */

export const RECARGO_MAX_MESES = 24;
export const RECARGO_REDUCCION = 0.25;

/**
 * Interés de demora tributario verificado (DA 42.ª Ley 31/2022, prorrogada; Manual de Renta 2025 de la AEAT).
 * Años sin tipo verificado: no se calculan intereses.
 */
export const INTERES_DEMORA: Readonly<Record<number, number>> = { 2023: 4.0625, 2024: 4.0625, 2025: 4.0625, 2026: 4.0625 };

/** 1 % + 1 % por cada mes completo de retraso hasta 12 meses; después, 15 % (art. 27.2 LGT). */
export function recargoPorcentaje(mesesCompletos: number): number {
  const m = Math.max(0, Math.floor(mesesCompletos));
  return m < 12 ? 1 + m : 15;
}

export interface RecargoResultado {
  meses: number;
  /** Porcentaje legal antes de la reducción. */
  porcentaje: number;
  /** Porcentaje efectivo sobre la cuota (con la reducción si se aplica). */
  porcentajeEfectivo: number;
  integro: number;
  reduccion: number;
  aPagar: number;
  /** Pasados 12 meses se exigen además intereses de demora. */
  conIntereses: boolean;
}

export function calcularRecargo(cuota: number, mesesCompletos: number, reducido: boolean): RecargoResultado {
  const meses = Math.max(0, Math.floor(mesesCompletos));
  const porcentaje = recargoPorcentaje(meses);
  const integro = round2((cuota * porcentaje) / 100);
  const reduccion = reducido ? round2(integro * RECARGO_REDUCCION) : 0;
  return {
    meses,
    porcentaje,
    porcentajeEfectivo: reducido ? porcentaje * (1 - RECARGO_REDUCCION) : porcentaje,
    integro,
    reduccion,
    aPagar: round2(integro - reduccion),
    conIntereses: meses >= 12,
  };
}

/** Escala completa (0 a 24 meses completos) para el gráfico en escalera. */
export function escalaRecargo(maxMeses = RECARGO_MAX_MESES): { meses: number; porcentaje: number }[] {
  return Array.from({ length: maxMeses + 1 }, (_, meses) => ({ meses, porcentaje: recargoPorcentaje(meses) }));
}

/**
 * Meses completos de retraso, de fecha a fecha desde el día siguiente al fin del plazo:
 * número de k ≥ 1 tales que (fin del plazo + k meses) < presentación.
 */
export function mesesCompletosDeRetraso(finPlazo: string, presentacion: string): number {
  if (presentacion <= finPlazo) return 0;
  let k = 0;
  while (k < 1200 && addMonthsClamped(finPlazo, k + 1) < presentacion) k += 1;
  return k;
}

export interface InteresesDemora {
  dias: number;
  importe: number;
  tramos: { year: number; dias: number; tipo: number }[];
}

/**
 * Intereses de demora por días (ambos extremos incluidos), con el tipo de cada año
 * (importe × tipo × días / 365, o 366 en bisiestos). Devuelve null si algún día cae en
 * un año sin tipo verificado.
 */
export function interesesDemora(cuota: number, desde: string, hasta: string, tipos: Readonly<Record<number, number>> = INTERES_DEMORA): InteresesDemora | null {
  if (hasta < desde) return { dias: 0, importe: 0, tramos: [] };
  let cursor = desde;
  let total = 0;
  let dias = 0;
  const tramos: InteresesDemora['tramos'] = [];
  while (cursor <= hasta) {
    const year = Number(cursor.slice(0, 4));
    const yearEnd = `${year}-12-31`;
    const end = hasta < yearEnd ? hasta : yearEnd;
    const d = diffDays(cursor, end) + 1;
    const tipo = tipos[year];
    if (tipo === undefined) return null;
    total += (cuota * (tipo / 100) * d) / (isLeapYear(year) ? 366 : 365);
    dias += d;
    tramos.push({ year, dias: d, tipo });
    cursor = addDays(end, 1);
  }
  return { dias, importe: round2(total), tramos };
}

export interface RetrasoConFechas {
  meses: number;
  enPlazo: boolean;
  /** Primer día con intereses (día siguiente al fin de los 12 meses), si procede. */
  interesesDesde?: string;
  intereses?: InteresesDemora | null;
}

/** Retraso a partir de dos fechas; si pasan 12 meses, intereses desde el día siguiente al final de esos 12 meses. */
export function retrasoConFechas(cuota: number, finPlazo: string, presentacion: string): RetrasoConFechas {
  if (presentacion <= finPlazo) return { meses: 0, enPlazo: true };
  const meses = mesesCompletosDeRetraso(finPlazo, presentacion);
  if (meses < 12) return { meses, enPlazo: false };
  const interesesDesde = addDays(addMonthsClamped(finPlazo, 12), 1);
  return { meses, enPlazo: false, interesesDesde, intereses: interesesDemora(cuota, interesesDesde, presentacion) };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · Indemnización por despido (arts. 53.1.b y 56.1 ET; DT 11.ª ET)
 * ──────────────────────────────────────────────────────────────────────────── */

export type TipoDespido = 'improcedente' | 'objetivo';

/** Entrada en vigor del RDL 3/2012: separa los dos tramos de la DT 11.ª ET. */
export const FECHA_REFORMA_2012 = '2012-02-12';
export const DIA_ANTERIOR_REFORMA = '2012-02-11';

/** Topes en días de salario: 12 mensualidades (360), 24 (720) y 42 (1.260). */
export const TOPE_OBJETIVO = 360;
export const TOPE_IMPROCEDENTE = 720;
export const TOPE_ABSOLUTO = 1260;

/**
 * Meses de servicio entre dos fechas, ambas incluidas; la fracción de mes cuenta
 * como mes completo (prorrateo por meses de los arts. 53.1.b y 56.1 ET).
 */
export function mesesDeServicio(inicio: string, fin: string): number {
  if (fin < inicio) return 0;
  const [yi, mi] = inicio.split('-').map(Number) as [number, number];
  const [yf, mf] = fin.split('-').map(Number) as [number, number];
  let n = Math.max(1, (yf - yi) * 12 + (mf - mi) - 2);
  while (ultimoDiaCubierto(inicio, n) < fin) n += 1;
  return n;
}

export interface TramoDespido {
  id: 'antes-2012' | 'desde-2012' | 'unico';
  desde: string;
  hasta: string;
  meses: number;
  diasPorAno: number;
  dias: number;
}

export interface IndemnizacionResultado {
  ok: true;
  tipo: TipoDespido;
  salarioDiario: number;
  mesesTotales: number;
  tramos: TramoDespido[];
  /** Días antes de aplicar el tope. */
  diasSinTope: number;
  tope: number;
  /** Explicación del tope aplicable. */
  topeMotivo: 'objetivo' | 'general' | 'tramo-anterior' | 'absoluto';
  topeAplicado: boolean;
  dias: number;
  importe: number;
}

export type IndemnizacionError = { ok: false; error: 'salario' | 'fechas' | 'orden' | 'anterior-reforma' };

export function calcularIndemnizacion(input: { salarioAnual: number; inicio: string; fin: string; tipo: TipoDespido }): IndemnizacionResultado | IndemnizacionError {
  const { salarioAnual, inicio, fin, tipo } = input;
  if (!(salarioAnual > 0)) return { ok: false, error: 'salario' };
  if (!isDateKey(inicio) || !isDateKey(fin)) return { ok: false, error: 'fechas' };
  if (fin < inicio) return { ok: false, error: 'orden' };
  if (tipo === 'improcedente' && fin < FECHA_REFORMA_2012) return { ok: false, error: 'anterior-reforma' };

  const salarioDiario = round2(salarioAnual / 365);
  const mesesTotales = mesesDeServicio(inicio, fin);
  let tramos: TramoDespido[];
  let tope: number;
  let topeMotivo: IndemnizacionResultado['topeMotivo'];
  let diasSinTope: number;
  let dias: number;

  if (tipo === 'objetivo') {
    const d = (20 * mesesTotales) / 12;
    tramos = [{ id: 'unico', desde: inicio, hasta: fin, meses: mesesTotales, diasPorAno: 20, dias: d }];
    tope = TOPE_OBJETIVO;
    topeMotivo = 'objetivo';
    diasSinTope = d;
    dias = Math.min(d, TOPE_OBJETIVO);
  } else if (inicio < FECHA_REFORMA_2012) {
    const m1 = mesesDeServicio(inicio, DIA_ANTERIOR_REFORMA);
    const m2 = mesesDeServicio(FECHA_REFORMA_2012, fin);
    const d1 = (45 * m1) / 12;
    const d2 = (33 * m2) / 12;
    tramos = [
      { id: 'antes-2012', desde: inicio, hasta: DIA_ANTERIOR_REFORMA, meses: m1, diasPorAno: 45, dias: d1 },
      { id: 'desde-2012', desde: FECHA_REFORMA_2012, hasta: fin, meses: m2, diasPorAno: 33, dias: d2 },
    ];
    diasSinTope = d1 + d2;
    if (d1 > TOPE_IMPROCEDENTE) {
      tope = Math.min(d1, TOPE_ABSOLUTO);
      topeMotivo = d1 > TOPE_ABSOLUTO ? 'absoluto' : 'tramo-anterior';
    } else {
      tope = TOPE_IMPROCEDENTE;
      topeMotivo = 'general';
    }
    dias = Math.min(diasSinTope, tope);
  } else {
    const d = (33 * mesesTotales) / 12;
    tramos = [{ id: 'unico', desde: inicio, hasta: fin, meses: mesesTotales, diasPorAno: 33, dias: d }];
    tope = TOPE_IMPROCEDENTE;
    topeMotivo = 'general';
    diasSinTope = d;
    dias = Math.min(d, TOPE_IMPROCEDENTE);
  }

  return {
    ok: true,
    tipo,
    salarioDiario,
    mesesTotales,
    tramos,
    diasSinTope,
    tope,
    topeMotivo,
    topeAplicado: diasSinTope > tope + 1e-9,
    dias,
    importe: round2(dias * salarioDiario),
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3 · Causa de disolución por pérdidas (art. 363.1.e LSC)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface DisolucionResultado {
  umbral: number;
  /** PN a efectos de la causa: PN contable + préstamos participativos. */
  pnMercantil: number;
  enCausa: boolean;
  /** Lo que falta para salir de la causa (0 si no está en causa). */
  deficit: number;
  /** PN mercantil − umbral (negativo si está en causa). */
  margen: number;
  minimos: null | {
    aportacion: number;
    participativo: number;
    aumentoALaPar: number;
    /** Reducción de capital mínima; null si el PN no es positivo (hace falta una operación acordeón). */
    reduccion: number | null;
    capitalMaximoTrasReducir: number | null;
  };
}

export function evaluarDisolucion(input: { capital: number; patrimonioNeto: number; prestamoParticipativo?: number }): DisolucionResultado {
  const umbral = round2(input.capital / 2);
  const pnMercantil = round2(input.patrimonioNeto + (input.prestamoParticipativo ?? 0));
  // Si el PN es exactamente la mitad, no hay causa: la ley exige que sea inferior.
  const enCausa = pnMercantil < umbral;
  const deficit = enCausa ? round2(umbral - pnMercantil) : 0;
  return {
    umbral,
    pnMercantil,
    enCausa,
    deficit,
    margen: round2(pnMercantil - umbral),
    minimos: enCausa
      ? {
          aportacion: deficit,
          participativo: deficit,
          aumentoALaPar: round2(deficit * 2),
          reduccion: pnMercantil > 0 ? round2(deficit * 2) : null,
          capitalMaximoTrasReducir: pnMercantil > 0 ? round2(pnMercantil * 2) : null,
        }
      : null,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 4 · Calendario de cuentas anuales (LSC, Ley 14/2013 y art. 5.1 CC)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface CalendarioCuentas {
  cierre: string;
  /** 3 meses desde el cierre (art. 253 LSC). */
  formulacion: string;
  /** Antes de 4 meses desde el cierre (art. 18 Ley 14/2013). */
  legalizacion: string;
  /** Último día del sexto mes del ejercicio siguiente (art. 164 LSC). */
  juntaLimite: string;
  /** Fecha de aprobación usada para el depósito (la junta prevista o, si no hay, la fecha límite). */
  aprobacion: string;
  /** Mes siguiente a la aprobación (art. 279 LSC). */
  deposito: string;
  /** Un año desde el cierre: sin depósito, cierre registral (art. 282 LSC; art. 378 RRM). */
  cierreRegistral: string;
}

export function calendarioCuentas(cierre: string, juntaPrevista?: string | null): CalendarioCuentas {
  const juntaLimite = addDays(addMonthsClamped(addDays(cierre, 1), 6), -1);
  const aprobacion = juntaPrevista && isDateKey(juntaPrevista) && juntaPrevista > cierre ? juntaPrevista : juntaLimite;
  return {
    cierre,
    formulacion: addMonthsClamped(cierre, 3),
    legalizacion: addMonthsClamped(cierre, 4),
    juntaLimite,
    aprobacion,
    deposito: addMonthsClamped(aprobacion, 1),
    cierreRegistral: addMonthsClamped(cierre, 12),
  };
}

export type EstadoPlazo = 'vencido' | 'hoy' | 'pronto' | 'en-plazo';

/** Estado de un plazo respecto a hoy: vencido, vence hoy, menos de 15 días o en plazo. */
export function estadoPlazo(fecha: string, hoy: string): { estado: EstadoPlazo; dias: number } {
  const dias = diffDays(hoy, fecha);
  if (dias < 0) return { estado: 'vencido', dias };
  if (dias === 0) return { estado: 'hoy', dias };
  if (dias <= 15) return { estado: 'pronto', dias };
  return { estado: 'en-plazo', dias };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 5 · Amortización contable frente a fiscal (NRV 2.ª PGC; art. 12.1.a y 11.3.1.º LIS)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface FilaAmortizacion {
  /** Ejercicio 1, 2, 3… desde la puesta en funcionamiento (años completos). */
  ejercicio: number;
  contable: number;
  maximoFiscal: number;
  deducible: number;
  /** Positivo = aumento de la base imponible; negativo = disminución (reversión). */
  ajuste: number;
  acumuladaContable: number;
  vnc: number;
  valorFiscal: number;
  /** Diferencia temporaria deducible (valor fiscal − VNC). */
  diferencia: number;
  /** Saldo del activo por impuesto diferido (4740) al tipo indicado. */
  saldoDiferido: number;
  movimientoDiferido: number;
}

/** Coeficiente fiscal como fracción: admite 25 (= 25 %) o 0,25. */
export function coeficienteComoFraccion(coeficiente: number): number {
  return coeficiente > 1 ? coeficiente / 100 : coeficiente;
}

export function cuadroAmortizacion(input: { coste: number; vidaUtil: number; coeficienteFiscalMax: number; valorResidual?: number; tipoGravamen?: number }): FilaAmortizacion[] {
  const { coste, vidaUtil } = input;
  const residual = Math.max(0, input.valorResidual ?? 0);
  const base = round2(coste - residual);
  const coef = coeficienteComoFraccion(input.coeficienteFiscalMax);
  const tipo = (input.tipoGravamen ?? 25) / 100;
  if (!(base > 0) || !(vidaUtil > 0) || !(coef > 0)) return [];
  const cuota = base / vidaUtil;
  const maximo = round2(base * coef);
  const rows: FilaAmortizacion[] = [];
  let acumC = 0;
  let acumF = 0;
  let saldoPrevio = 0;
  for (let t = 1; t <= 200; t++) {
    // Redondeo acumulado: los céntimos se reparten sin dejar residuos al final.
    const objetivo = round2(Math.min(base, cuota * t));
    const contable = round2(objetivo - acumC);
    const exceso = round2(acumC - acumF);
    const pendienteFiscal = round2(base - acumF);
    const deducible = round2(Math.max(0, Math.min(contable + exceso, maximo, pendienteFiscal)));
    acumC = round2(acumC + contable);
    acumF = round2(acumF + deducible);
    const diferencia = round2(acumC - acumF);
    const saldo = round2(diferencia * tipo);
    rows.push({
      ejercicio: t,
      contable,
      maximoFiscal: maximo,
      deducible,
      ajuste: round2(contable - deducible),
      acumuladaContable: acumC,
      vnc: round2(coste - acumC),
      valorFiscal: round2(coste - acumF),
      diferencia,
      saldoDiferido: saldo,
      movimientoDiferido: round2(saldo - saldoPrevio),
    });
    saldoPrevio = saldo;
    if (acumC >= base - 0.004 && diferencia <= 0.004) break;
  }
  return rows;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 6 · Periodificación de un gasto (cuenta 480)
 * ──────────────────────────────────────────────────────────────────────────── */

export type MetodoPeriodificacion = 'meses' | 'dias';

export interface PeriodificacionResultado {
  /** Último día cubierto por el gasto. */
  fin: string;
  totalDias: number;
  diasEjercicio: number;
  /** Meses (con fracción si el periodo no empieza el día 1) que caen hasta el cierre. */
  mesesEjercicio: number;
  delEjercicio: number;
  /** Parte que corresponde al ejercicio siguiente: va a la 480. */
  anticipado: number;
  /** Fecha de la reversión (día siguiente al cierre). */
  reversion: string;
  /** Inicio de cada mes del periodo (para dibujar la barra). */
  meses: { inicio: string; fin: string }[];
}

export function periodificar(input: { importe: number; inicio: string; meses: number; cierre: string; metodo: MetodoPeriodificacion }): PeriodificacionResultado {
  const { importe, inicio, cierre, metodo } = input;
  const nMeses = Math.max(1, Math.round(input.meses));
  const fin = ultimoDiaCubierto(inicio, nMeses);
  const totalDias = diffDays(inicio, fin) + 1;
  const diasEjercicio = clamp(diffDays(inicio, cierre) + 1, 0, totalDias);
  const meses: { inicio: string; fin: string }[] = [];
  let mesesEjercicio = 0;
  for (let k = 0; k < nMeses; k++) {
    const ini = k === 0 ? inicio : addDays(ultimoDiaCubierto(inicio, k), 1);
    const finK = ultimoDiaCubierto(inicio, k + 1);
    meses.push({ inicio: ini, fin: finK });
    if (finK <= cierre) mesesEjercicio += 1;
    else if (ini <= cierre) mesesEjercicio += (diffDays(ini, cierre) + 1) / (diffDays(ini, finK) + 1);
  }
  const fraccion = metodo === 'dias' ? diasEjercicio / totalDias : mesesEjercicio / nMeses;
  const delEjercicio = round2(importe * fraccion);
  return {
    fin,
    totalDias,
    diasEjercicio,
    mesesEjercicio,
    delEjercicio,
    anticipado: round2(importe - delEjercicio),
    reversion: addDays(cierre, 1),
    meses,
  };
}

/** Cuenta de gasto habitual del grupo 6 según el concepto (si no se reconoce, genérica). */
export function cuentaDeGasto(concepto: string): { account: string; name: string } {
  const c = concepto.toLowerCase();
  if (/seguro|prima|póliza|poliza/.test(c)) return { account: '625', name: 'Primas de seguros' };
  if (/alquiler|arrendamiento|renting|canon/.test(c)) return { account: '621', name: 'Arrendamientos y cánones' };
  if (/mantenimiento|reparaci|conservaci/.test(c)) return { account: '622', name: 'Reparaciones y conservación' };
  if (/publicidad|propaganda|patrocinio/.test(c)) return { account: '627', name: 'Publicidad, propaganda y relaciones públicas' };
  if (/suministro|electricidad|luz|agua|gas/.test(c)) return { account: '628', name: 'Suministros' };
  return { account: '6xx', name: 'Cuenta de gasto del grupo 6' };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 7 · Cuentas en T
 * ──────────────────────────────────────────────────────────────────────────── */

export interface MovimientoT {
  /** Índice del asiento (0, 1, 2…). */
  asiento: number;
  importe: number;
}

export interface CuentaT {
  account: string;
  name: string;
  debe: MovimientoT[];
  haber: MovimientoT[];
  totalDebe: number;
  totalHaber: number;
  /** Positivo = saldo deudor; negativo = saldo acreedor. */
  saldo: number;
}

export function cuadreAsiento(entry: JournalEntry): { debe: number; haber: number; cuadra: boolean } {
  const debe = round2(entry.lines.reduce((s, l) => s + (l.debit ?? 0), 0));
  const haber = round2(entry.lines.reduce((s, l) => s + (l.credit ?? 0), 0));
  return { debe, haber, cuadra: Math.abs(debe - haber) < 0.005 };
}

/** Mayor de las cuentas tras registrar los «hasta» primeros asientos (todas las cuentas aparecen, aunque estén vacías). */
export function libroMayor(entries: JournalEntry[], hasta: number): CuentaT[] {
  const map = new Map<string, CuentaT>();
  entries.forEach((e) =>
    e.lines.forEach((l) => {
      if (!map.has(l.account)) map.set(l.account, { account: l.account, name: l.name, debe: [], haber: [], totalDebe: 0, totalHaber: 0, saldo: 0 });
    }),
  );
  entries.slice(0, Math.max(0, hasta)).forEach((e, i) =>
    e.lines.forEach((l) => {
      const c = map.get(l.account)!;
      if (l.debit) c.debe.push({ asiento: i, importe: l.debit });
      if (l.credit) c.haber.push({ asiento: i, importe: l.credit });
    }),
  );
  return [...map.values()].map((c) => {
    const totalDebe = round2(c.debe.reduce((s, m) => s + m.importe, 0));
    const totalHaber = round2(c.haber.reduce((s, m) => s + m.importe, 0));
    return { ...c, totalDebe, totalHaber, saldo: round2(totalDebe - totalHaber) };
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * 8 · Árbol de decisión
 * ──────────────────────────────────────────────────────────────────────────── */

export interface NodoArbol {
  id: string;
  question?: string;
  options?: { label: string; next: string }[];
  outcome?: { title: string; text: string; tone: 'derivar' | 'resolver' | 'atencion' };
}

/**
 * Problemas de estructura (identificadores repetidos, destinos inexistentes, pasos sin salida) para avisar
 * al equipo editorial. Es la misma comprobación que aplica el esquema al publicar (web y API).
 */
export function revisarArbol(start: string, nodes: NodoArbol[]): string[] {
  return decisionTreeProblems(start, nodes).map((p) => `${p.message}.`);
}

/** Profundidad máxima (número de preguntas) desde el nodo inicial, sin ciclos. */
export function profundidadArbol(start: string, nodes: NodoArbol[]): number {
  const map = new Map(nodes.map((n) => [n.id, n]));
  const visit = (id: string, seen: Set<string>): number => {
    const n = map.get(id);
    if (!n || seen.has(id) || n.outcome || !n.options?.length) return 0;
    const next = new Set(seen).add(id);
    return 1 + Math.max(0, ...n.options.map((o) => visit(o.next, next)));
  };
  return visit(start, new Set());
}

/* ────────────────────────────────────────────────────────────────────────────
 * 9 · Gráficos: escala «bonita»
 * ──────────────────────────────────────────────────────────────────────────── */

export function niceScale(minValue: number, maxValue: number, target = 5): { min: number; max: number; step: number; ticks: number[] } {
  let lo = Math.min(minValue, maxValue);
  let hi = Math.max(minValue, maxValue);
  if (lo === hi) {
    if (hi === 0) hi = 1;
    else if (hi > 0) lo = 0;
    else hi = 0;
  }
  const raw = (hi - lo) / Math.max(1, target);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const min = Math.floor(lo / step + 1e-9) * step;
  const max = Math.ceil(hi / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return { min, max, step, ticks };
}

/* ────────────────────────────────────────────────────────────────────────────
 * 10 · Comparativa: ¿la primera columna rotula las filas?
 * ──────────────────────────────────────────────────────────────────────────── */

export function cabecerasComparativa(columns: string[], valuesPerRow: number): { labelHeader: string; valueHeaders: string[] } {
  if (columns.length === valuesPerRow + 1) return { labelHeader: columns[0] ?? '', valueHeaders: columns.slice(1) };
  const valueHeaders = Array.from({ length: valuesPerRow }, (_, i) => columns[i] ?? '');
  return { labelHeader: '', valueHeaders };
}

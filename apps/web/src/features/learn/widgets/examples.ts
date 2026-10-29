import type { WidgetSpec } from '@flm/shared';

/**
 * Ejemplos de la galería de desarrollo. Datos tomados de los informes verificados a 28/10/2026
 * (research/10-fis-01, 20-lab-01, 31-mer-02, 32-mer-03, 41-con-02 y 42-con-03). Empresas ficticias.
 */
export interface GalleryExample {
  id: string;
  name: string;
  source: string;
  spec: WidgetSpec;
}

export const EXAMPLES: GalleryExample[] = [
  {
    id: 'recargo',
    name: 'Recargo por presentación extemporánea',
    source: 'Caso Nébula Studio, S.L.: modelo 303 con 2.800 € de cuota (10-fis-01).',
    spec: { kind: 'recargo-extemporaneo', cuota: 2800 },
  },
  {
    id: 'despido',
    name: 'Indemnización por despido',
    source: 'Caso Laura: alta el 12/06/2009, 32.850 € al año, efectos el 11/11/2026 (20-lab-01).',
    spec: { kind: 'indemnizacion-despido', salarioAnual: 32850, inicio: '2009-06-12', fin: '2026-11-11' },
  },
  {
    id: 'disolucion',
    name: 'Causa de disolución por pérdidas',
    source: 'Caso ALFA, S.L.: capital de 60.000 € y patrimonio neto de 24.000 € a 30/09/2026 (31-mer-02). Prueba a escribir 10.000 € de préstamo participativo.',
    spec: { kind: 'disolucion-perdidas', capital: 60000, patrimonioNeto: 24000 },
  },
  {
    id: 'calendario',
    name: 'Calendario de cuentas anuales',
    source: 'Ejercicio cerrado el 31/12/2026 (32-mer-03). Prueba también con 30/06/2026.',
    spec: { kind: 'calendario-cuentas', cierre: '2026-12-31' },
  },
  {
    id: 'amortizacion',
    name: 'Amortización contable frente a fiscal',
    source: 'Caso B: equipo informático de 1.500 € amortizado en 3 años con un máximo fiscal del 25 % (42-con-03).',
    spec: { kind: 'amortizacion', coste: 1500, vidaUtil: 3, coeficienteFiscalMax: 25, valorResidual: 0 },
  },
  {
    id: 'periodificacion',
    name: 'Periodificación de un gasto',
    source: 'Seguro multirriesgo de 1.200 € pagado el 01/10/2026 (41-con-02).',
    spec: { kind: 'periodificacion', importe: 1200, inicio: '2026-10-01', meses: 12, cierre: '2026-12-31', concepto: 'Prima del seguro multirriesgo' },
  },
  {
    id: 'cuentas-t',
    name: 'Cuentas en T',
    source: 'Seguro y alquiler del caso Taller Ribera Metal, S.L. (41-con-02).',
    spec: {
      kind: 'cuentas-t',
      title: 'Seguro y alquiler: del pago al ajuste de cierre',
      entries: [
        { date: '2026-10-01', concept: 'Pago de la prima anual del seguro', lines: [{ account: '625', name: 'Primas de seguros', debit: 1200 }, { account: '572', name: 'Bancos', credit: 1200 }] },
        {
          date: '2026-11-01',
          concept: 'Cobro anticipado del alquiler de noviembre a abril',
          lines: [
            { account: '572', name: 'Bancos', debit: 4896 },
            { account: '473', name: 'Hacienda Pública, retenciones y pagos a cuenta', debit: 912 },
            { account: '752', name: 'Ingresos por arrendamientos', credit: 4800 },
            { account: '477', name: 'Hacienda Pública, IVA repercutido', credit: 1008 },
          ],
        },
        { date: '2026-12-31', concept: 'Periodificación del seguro: 9 meses son de 2027', lines: [{ account: '480', name: 'Gastos anticipados', debit: 900 }, { account: '625', name: 'Primas de seguros', credit: 900 }] },
        { date: '2026-12-31', concept: 'Periodificación del alquiler: 4 meses son de 2027', lines: [{ account: '752', name: 'Ingresos por arrendamientos', debit: 3200 }, { account: '485', name: 'Ingresos anticipados', credit: 3200 }] },
      ],
    },
  },
  {
    id: 'arbol',
    name: 'Árbol de decisión',
    source: 'Diagrama de decisión para clientes que han presentado tarde (10-fis-01, apartado 6.4).',
    spec: {
      kind: 'arbol-decision',
      title: '¿Recargo, intereses o sanción?',
      start: 'requerimiento',
      nodes: [
        {
          id: 'requerimiento',
          question: '¿Se ha notificado algún requerimiento sobre ese impuesto y periodo antes de presentar? Cuenta también la notificación electrónica rechazada a los diez días.',
          options: [
            { label: 'Sí, hay requerimiento previo', next: 'fin-requerimiento' },
            { label: 'No, ninguno', next: 'mismo-hecho' },
          ],
        },
        {
          id: 'mismo-hecho',
          question: '¿Se corrige en otro periodo un hecho idéntico al que ya regularizó la AEAT, dentro de los seis meses, sin recurrir y sin sanción previa?',
          options: [
            { label: 'Sí', next: 'fin-exclusion' },
            { label: 'No', next: 'doce-meses' },
          ],
        },
        {
          id: 'doce-meses',
          question: '¿Han pasado más de 12 meses desde el fin del plazo?',
          options: [
            { label: 'No, menos de 12 meses', next: 'fin-escala' },
            { label: 'Sí, más de 12 meses', next: 'fin-quince' },
          ],
        },
        {
          id: 'fin-requerimiento',
          outcome: {
            tone: 'atencion',
            title: 'Sin recargo, pero con intereses y posible sanción',
            text: 'Se exigen **intereses de demora** desde el día siguiente al fin del plazo y puede imponerse una **sanción** (arts. 191 o 192 LGT), con las reducciones del art. 188 por conformidad y pronto pago.\n\nRevisa con el cliente la fecha exacta de la notificación antes de presentar.',
          },
        },
        {
          id: 'fin-exclusion',
          outcome: {
            tone: 'derivar',
            title: 'Sin recargo si se cumplen las cuatro condiciones',
            text: 'El art. 27.2 LGT excluye el recargo si se presenta en seis meses, se paga todo, no se recurre la liquidación y no hubo sanción. Es una decisión estratégica: **coméntala con el responsable del área** antes de recurrir nada.',
          },
        },
        {
          id: 'fin-escala',
          outcome: {
            tone: 'resolver',
            title: '1 % más 1 % por cada mes completo',
            text: 'Sin intereses ni sanción. Presenta e ingresa cuanto antes: con el ingreso total y el pago del recargo en plazo, se reduce un 25 % (art. 27.5 LGT).',
          },
        },
        {
          id: 'fin-quince',
          outcome: {
            tone: 'resolver',
            title: '15 % e intereses de demora',
            text: 'Recargo fijo del 15 % e intereses desde el día siguiente al final de los 12 meses. La reducción del 25 % se aplica al recargo, no a los intereses.',
          },
        },
      ],
    },
  },
  {
    id: 'linea',
    name: 'Línea de tiempo',
    source: 'El reloj de los 2 + 2 meses del caso ALFA, S.L. (31-mer-02, apartado 6.3).',
    spec: {
      kind: 'linea-tiempo',
      title: 'El reloj de los dos más dos meses',
      items: [
        { date: '2026-09-30', title: 'Se produce la causa de disolución (como tarde)', text: 'El balance intermedio muestra un patrimonio neto inferior a la mitad del capital.', tone: 'hito' },
        { date: '2026-11-02', title: 'Convocatoria recomendada', text: 'No conviene apurar el plazo legal.', tone: 'hito' },
        { date: '2026-11-18', title: 'Junta general', text: 'Al menos 15 días después de la convocatoria en la S.L. (art. 176.1 LSC).', tone: 'hito' },
        { date: '2026-11-30', title: 'Último día para convocar la junta', text: 'Dos meses desde la causa (arts. 365.1 y 367.1 LSC).', tone: 'plazo' },
        { date: '2027-01-18', title: 'Límite para pedir la disolución judicial', text: 'Si la junta no acuerda la disolución ni remueve la causa (art. 366.2 LSC).', tone: 'plazo' },
        { date: 'Cada mes', title: 'Seguimiento del patrimonio neto', text: 'Control mensual y plan de viabilidad mientras dure la situación.', tone: 'pendiente' },
      ],
    },
  },
  {
    id: 'tarjetas',
    name: 'Tarjetas de verdadero, falso o depende',
    source: 'Errores frecuentes de los informes 10-fis-01, 20-lab-01 y 31-mer-02.',
    spec: {
      kind: 'tarjetas-verdad',
      title: 'Ideas habituales, a examen',
      cards: [
        { claim: 'Con 2.800 € de cuota y 4 meses completos de retraso, el recargo es del 5 %.', verdict: 'verdadero', explanation: '1 % más 1 % por cada mes completo: 1 % + 4 % = 5 % (art. 27.2 LGT). Con la reducción del 25 %, queda en el 3,75 %.' },
        { claim: 'Al cumplir 12 meses, el recargo pasa al 13 % y los intereses se cuentan desde el fin del plazo.', verdict: 'falso', explanation: 'La escala llega al 12 %. Pasados 12 meses, el recargo es fijo del **15 %** y los intereses corren solo desde el día siguiente al final de esos 12 meses.' },
        { claim: 'En un contrato de 2009 se aplican 33 días por año a toda la antigüedad.', verdict: 'falso', explanation: 'Hay dos tramos: **45 días** por año hasta el 11/02/2012 y **33 días** después (DT 11.ª ET), cada uno prorrateado por meses.' },
        { claim: 'Despedir a una persona de baja médica es nulo automáticamente.', verdict: 'depende', explanation: 'La incapacidad temporal no está en la lista del art. 55.5 ET, pero si el motivo es la enfermedad, el despido es nulo por discriminación (arts. 2.1 y 26 de la Ley 15/2022).' },
        { claim: 'Si faltan 6.000 € para salir de la causa de disolución, basta con ampliar capital en 6.000 €.', verdict: 'falso', explanation: 'Un aumento a la par también sube el umbral: hacen falta **12.000 €**. Sin aumentar capital (aportación a la cuenta 118 o préstamo participativo), bastan 6.000 €.' },
      ],
    },
  },
  {
    id: 'comparativa',
    name: 'Comparativa',
    source: 'Tabla de efectos del despido (20-lab-01, apartado 6).',
    spec: {
      kind: 'comparativa',
      title: 'Efectos del despido según su calificación',
      columns: ['Calificación', 'Disciplinario', 'Objetivo'],
      rows: [
        { label: 'Procedente', values: ['Sin indemnización ni salarios de tramitación (art. 55.7 ET).', '**20 días por año**, con tope de 12 mensualidades, que se consolidan (art. 53.5.a ET).'] },
        { label: 'Improcedente', values: ['Readmisión con salarios de tramitación, o **33 días por año** con tope de 24 mensualidades (45/33 según la DT 11.ª).', 'Igual; se descuentan los 20 días cobrados o se devuelven si hay readmisión (art. 53.5.b ET).'] },
        { label: 'Nulo', values: ['Readmisión inmediata y salarios dejados de percibir (art. 55.6 ET).', 'Igual (art. 53.5 ET).'] },
      ],
    },
  },
  {
    id: 'clasificador',
    name: 'Clasificador',
    source: 'Matriz «¿Qué ajuste toca?» (41-con-02, apartado 6.2).',
    spec: {
      kind: 'clasificador',
      title: '¿Qué ajuste de cierre toca?',
      prompt: 'Clasifica cada operación abierta a 31 de diciembre en el ajuste que le corresponde.',
      categories: ['Gasto anticipado (480 o 567)', 'Gasto devengado pendiente (4009, 4109, 527 o 528)', 'Ingreso anticipado (485 o 568)', 'Ingreso devengado pendiente (4309, 546, 547 o 548)'],
      items: [
        { label: 'Seguro anual pagado el 1 de octubre', answer: 'Gasto anticipado (480 o 567)', explanation: 'Pagado y contabilizado, pero 9 de los 12 meses son del año siguiente: 900 € a la 480.' },
        { label: 'Alquiler de seis meses cobrado por adelantado el 1 de noviembre', answer: 'Ingreso anticipado (485 o 568)', explanation: 'Cuatro de los seis meses son del año siguiente: 3.200 € a la 485.' },
        { label: 'Luz de diciembre facturada en enero', answer: 'Gasto devengado pendiente (4009, 4109, 527 o 528)', explanation: 'El consumo es de diciembre: 462 € a la 628 con abono a la 4109, sin el IVA.' },
        { label: 'Intereses del préstamo que se pagarán el 1 de marzo', answer: 'Gasto devengado pendiente (4009, 4109, 527 o 528)', explanation: 'Los de septiembre a diciembre ya se han devengado: 1.000 € a la 662 con abono a la 527.' },
        { label: 'Servicio terminado en diciembre que se facturará en enero', answer: 'Ingreso devengado pendiente (4309, 546, 547 o 548)', explanation: 'El servicio ya está prestado: se reconoce el ingreso con cargo a la 4309.' },
        { label: 'Intereses de un depósito a plazo que vence en abril', answer: 'Ingreso devengado pendiente (4309, 546, 547 o 548)', explanation: 'Los intereses devengados hasta el cierre se reconocen en una subcuenta de la 548.' },
      ],
    },
  },
  {
    id: 'grafico-escalones',
    name: 'Gráfico en escalones',
    source: 'Escala del recargo, vigente y anterior a la Ley 11/2021 (10-fis-01, apartado 6.2).',
    spec: {
      kind: 'grafico',
      chart: {
        type: 'escalones',
        title: 'Lo que cuesta cada mes de retraso',
        unit: '%',
        xLabel: 'Mes en que se presenta',
        yLabel: 'Recargo sobre la cuota',
        series: [
          { name: 'Vigente', values: ['1.º', '2.º', '3.º', '4.º', '5.º', '6.º', '7.º', '8.º', '9.º', '10.º', '11.º', '12.º', 'Más de 12'].map((x, i) => ({ x, y: i < 12 ? i + 1 : 15 })) },
          { name: 'Con la reducción del 25 %', values: ['1.º', '2.º', '3.º', '4.º', '5.º', '6.º', '7.º', '8.º', '9.º', '10.º', '11.º', '12.º', 'Más de 12'].map((x, i) => ({ x, y: (i < 12 ? i + 1 : 15) * 0.75 })) },
          { name: 'Anterior al 11/07/2021', values: ['1.º', '2.º', '3.º', '4.º', '5.º', '6.º', '7.º', '8.º', '9.º', '10.º', '11.º', '12.º', 'Más de 12'].map((x, i) => ({ x, y: i < 3 ? 5 : i < 6 ? 10 : i < 12 ? 15 : 20 })) },
        ],
      },
    },
  },
  {
    id: 'grafico-barras',
    name: 'Gráfico de barras',
    source: 'Coste añadido en los cinco escenarios del caso Nébula Studio (10-fis-01, paso 7).',
    spec: {
      kind: 'grafico',
      chart: {
        type: 'barras',
        title: 'El precio de esperar: coste añadido a la cuota de 2.800 €',
        unit: '€',
        xLabel: 'Escenario',
        series: [
          {
            name: 'Coste añadido',
            values: [
              { x: 'Voluntario, con reducción', y: 105 },
              { x: 'Voluntario', y: 140 },
              { x: 'Requerimiento, conformidad y pronto pago', y: 634.12 },
              { x: 'Requerimiento y pronto pago', y: 886.12 },
              { x: 'Requerimiento, sin reducciones', y: 1446.12 },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'grafico-lineas',
    name: 'Gráfico de líneas',
    source: 'Valor neto contable y valor fiscal del caso B de amortización (42-con-03, apartado 6.1).',
    spec: {
      kind: 'grafico',
      chart: {
        type: 'lineas',
        title: 'Valor contable y valor fiscal de un equipo de 1.500 €',
        unit: '€',
        xLabel: 'Cierre del ejercicio',
        series: [
          { name: 'Valor neto contable', values: [{ x: 'Alta', y: 1500 }, { x: '2026', y: 1000 }, { x: '2027', y: 500 }, { x: '2028', y: 0 }, { x: '2029', y: 0 }] },
          { name: 'Valor fiscal pendiente', values: [{ x: 'Alta', y: 1500 }, { x: '2026', y: 1125 }, { x: '2027', y: 750 }, { x: '2028', y: 375 }, { x: '2029', y: 0 }] },
        ],
      },
    },
  },
];

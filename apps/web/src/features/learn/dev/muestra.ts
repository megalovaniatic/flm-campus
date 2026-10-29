/**
 * MUESTRA DE DESARROLLO · solo se carga con `import.meta.env.DEV`.
 *
 * Una formación completa (todos los tipos de bloque y de apoyo visual, test de 3 preguntas)
 * y una evaluación sectorial (10 preguntas) para revisar la sección Aprender mientras el
 * contenido real se redacta. No aparece en producción ni en ningún listado: solo se abre
 * escribiendo la ruta a mano.
 *   /#/aprender/fiscal/_muestra
 *   /#/aprender/fiscal/_muestra/test
 *   /#/aprender/fiscal/evaluacion?muestra=1
 * (Se puede sustituir «fiscal» por cualquier área para revisar su color.)
 */
import type { Formation, SectorAssessment } from '@flm/shared';

export const SAMPLE_FORMATION: Formation = {
  id: 'dev-muestra',
  slug: '_muestra',
  area: 'fiscal',
  title: 'Recargos por presentar fuera de plazo: cómo se calculan y cuándo se reducen',
  intro:
    'Un cliente nos escribe un lunes: se le pasó el modelo 303 del segundo trimestre y quiere presentarlo hoy. Antes de responder «no pasa nada» o «te van a sancionar», conviene saber qué dice el [[artículo 27 de la LGT]], qué [[recargo]] le corresponde y qué tiene que hacer para pagar menos.',
  summary: 'Qué recargo se aplica al presentar tarde sin requerimiento, cómo se calcula por meses completos y cuándo se reduce un 25 %.',
  coverTerm: 'Art. 27',
  readingMinutes: 9,
  outcomes: [
    'Calcular el recargo según los meses completos de retraso.',
    'Distinguir el tramo del 1 % al 12 % del recargo del 15 % con intereses.',
    'Explicar al cliente qué debe pagar, y cuándo, para reducir el recargo un 25 %.',
  ],
  blocks: [
    { type: 'heading', text: 'Qué es el recargo por declaración extemporánea', id: 'que-es' },
    {
      type: 'paragraph',
      text: 'Cuando una autoliquidación o declaración se presenta después de su plazo **sin [[requerimiento previo]]** de la Administración, la ley no impone una sanción: exige un [[recargo]]. Es la forma de premiar que el obligado tributario regularice por su cuenta.\n\nHay requerimiento previo cuando la Administración ha realizado cualquier actuación, con conocimiento formal del obligado, dirigida al reconocimiento, regularización, comprobación, inspección, aseguramiento o liquidación de la deuda.',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'El recargo extemporáneo',
      text: 'Es una **prestación accesoria**, no una sanción. No exige culpa y sustituye a las sanciones que podrían haberse impuesto. Cuanto antes se presente, menor es el porcentaje.',
    },
    {
      type: 'quote',
      text: 'Los recargos por declaración extemporánea son prestaciones accesorias que deben satisfacer los obligados tributarios como consecuencia de la presentación de autoliquidaciones o declaraciones fuera de plazo sin requerimiento previo de la Administración tributaria.',
      cite: 'Artículo 27.1 de la Ley General Tributaria',
    },
    { type: 'heading', text: 'Cómo se calcula', id: 'calculo' },
    {
      type: 'paragraph',
      text: 'Desde la [[Ley 11/2021]], el recargo es del **1 % más otro 1 % por cada mes completo de retraso**, hasta los doce meses. En ese tramo no se exigen intereses de demora ni sanciones. Pasados doce meses, el recargo es del **15 %** y se suman intereses de demora desde el día siguiente al final de esos doce meses.',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Cuenta los **meses completos** desde el día siguiente al fin del plazo hasta el día de la presentación.',
        'Aplica el 1 % fijo y suma un 1 % por cada mes completo.',
        'Calcula el porcentaje sobre el **importe a ingresar** de la autoliquidación.',
      ],
    },
    {
      type: 'table',
      caption: 'Recargo según el retraso, sin requerimiento previo',
      columns: ['Retraso desde el fin del plazo', 'Recargo', 'Intereses de demora', 'Sanción'],
      rows: [
        ['Menos de un mes', '1 %', 'No', 'No'],
        ['4 meses y 10 días', '5 %', 'No', 'No'],
        ['11 meses y 20 días', '12 %', 'No', 'No'],
        ['Más de 12 meses', '15 %', 'Sí, desde el día siguiente a los 12 meses', 'No'],
      ],
      numeric: [1],
    },
    { type: 'widget', widget: { kind: 'recargo-extemporaneo', cuota: 2000 }, caption: 'Cambia la cuota y el retraso para ver el recargo que corresponde.' },
    {
      type: 'widget',
      widget: {
        kind: 'grafico',
        chart: {
          type: 'escalones',
          title: 'Recargo según los meses completos de retraso',
          unit: '%',
          xLabel: 'Meses completos de retraso',
          yLabel: 'Recargo',
          series: [
            {
              name: 'Recargo',
              values: [
                { x: 0, y: 1 },
                { x: 1, y: 2 },
                { x: 2, y: 3 },
                { x: 3, y: 4 },
                { x: 4, y: 5 },
                { x: 5, y: 6 },
                { x: 6, y: 7 },
                { x: 7, y: 8 },
                { x: 8, y: 9 },
                { x: 9, y: 10 },
                { x: 10, y: 11 },
                { x: 11, y: 12 },
                { x: '12 o más', y: 15 },
              ],
            },
          ],
        },
      },
      caption: 'El salto del 12 % al 15 % llega al cumplirse los doce meses.',
    },
    {
      type: 'example',
      title: 'Un 303 presentado con cuatro meses de retraso',
      scenario:
        'Una sociedad presenta el 3 de diciembre, sin requerimiento, el modelo 303 del segundo trimestre (plazo hasta el 20 de julio). Resultado a ingresar: **2.000 €**. Ingresa la deuda al presentar.',
      steps: [
        { label: 'Contamos los meses completos: del 21 de julio al 20 de noviembre hay cuatro; el quinto no se ha cumplido el 3 de diciembre.', formula: '21/07 → 20/11 = 4 meses completos', result: '4 meses' },
        { label: 'Aplicamos el porcentaje: el 1 % fijo más un 1 % por mes completo.', formula: '1 % + 4 × 1 % = 5 %', result: '5 %' },
        { label: 'Calculamos el recargo sobre el importe a ingresar.', formula: '2.000,00 € × 5 % = 100,00 €', result: '100,00 €' },
        { label: 'Si paga el recargo en el plazo abierto con su notificación, se reduce un 25 %.', formula: '100,00 € × (1 − 0,25) = 75,00 €', result: '75,00 €' },
      ],
      conclusion: 'El cliente pagará **75 €** de recargo si cumple las condiciones de la reducción, y 100 € si no las cumple. No hay intereses de demora ni sanción.',
    },
    { type: 'heading', text: 'Cuándo se reduce un 25 %', id: 'reduccion' },
    {
      type: 'paragraph',
      text: 'El recargo se reduce un **25 %** si se ingresa entero en el plazo del artículo 62.2 de la LGT abierto con la notificación de su liquidación, y siempre que la deuda de la autoliquidación se haya ingresado al presentarla (o se haya aplazado o fraccionado con aval o seguro de caución, solicitado al presentarla).',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Si no se ingresa al presentar',
      text: 'Presentar sin ingresar no evita el recargo: hace perder la reducción y abre el [[periodo ejecutivo]], con sus propios recargos. Si el cliente no puede pagar, solicita el aplazamiento con la presentación.',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Cómo explicárselo al cliente',
      text: 'Habla de fechas, no de porcentajes: «si lo presentamos esta semana, el recargo es del 2 %; a partir del día 21, del 3 %». Ayuda a decidir rápido.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Artículo 27 de la Ley General Tributaria',
      text: 'Regula los recargos por declaración extemporánea sin requerimiento previo: porcentajes, exclusión de sanciones e intereses y reducción del 25 %.',
      refs: [
        { label: 'Ley 58/2003, de 17 de diciembre, General Tributaria (art. 27)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186', kind: 'norma', date: '2026-10-21' },
        { label: 'Ley 11/2021, de 9 de julio, de medidas de prevención y lucha contra el fraude fiscal', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473', kind: 'norma' },
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'tarjetas-verdad',
        title: 'Mitos y realidades',
        cards: [
          { claim: 'Presentar tarde siempre conlleva una sanción.', verdict: 'falso', explanation: 'Sin requerimiento previo se exige un recargo, que excluye la sanción.' },
          { claim: 'Con quince meses de retraso se paga un 15 % y, además, intereses.', verdict: 'verdadero', explanation: 'Pasados doce meses, se exigen intereses desde el día siguiente al final de esos doce meses.' },
          { claim: 'El recargo se reduce siempre un 25 %.', verdict: 'depende', explanation: 'Solo si se ingresa la deuda al presentar (o se aplaza con garantía) y el recargo en el plazo abierto con su notificación.' },
        ],
      },
    },
    { type: 'heading', text: 'Recargo, sanción o periodo ejecutivo', id: 'distinguir' },
    {
      type: 'widget',
      widget: {
        kind: 'comparativa',
        title: 'Tres figuras que se confunden',
        columns: ['Recargo extemporáneo', 'Sanción', 'Periodo ejecutivo'],
        rows: [
          { label: 'Cuándo aparece', values: ['Presentación tardía sin requerimiento', 'Infracción tras un procedimiento sancionador', 'Deuda no ingresada en plazo'] },
          { label: 'Porcentaje', values: ['Del 1 % al 12 %, o 15 %', 'Según la infracción', '5 %, 10 % o 20 %'] },
          { label: 'Intereses de demora', values: ['Solo pasados 12 meses', 'No', 'Con el recargo del 20 %'] },
        ],
      },
    },
    {
      type: 'widget',
      widget: {
        kind: 'clasificador',
        title: '¿Recargo o posible sanción?',
        prompt: 'Clasifica cada situación.',
        categories: ['Recargo extemporáneo', 'Posible sanción'],
        items: [
          { label: 'El cliente presenta el 303 dos meses tarde por iniciativa propia.', answer: 'Recargo extemporáneo', explanation: 'No hay requerimiento previo: corresponde un recargo del 3 %.' },
          { label: 'Hacienda notifica un requerimiento y después el cliente presenta.', answer: 'Posible sanción', explanation: 'Con requerimiento previo ya no se aplica el régimen de recargos del artículo 27.' },
          { label: 'El cliente presenta una complementaria quince meses tarde.', answer: 'Recargo extemporáneo', explanation: '15 % más intereses de demora desde el día siguiente a los doce meses.' },
        ],
      },
    },
    {
      type: 'widget',
      widget: {
        kind: 'arbol-decision',
        title: '¿Qué recargo corresponde?',
        start: 'q1',
        nodes: [
          { id: 'q1', question: '¿Hubo requerimiento previo de la Administración?', options: [{ label: 'Sí', next: 'o-req' }, { label: 'No', next: 'q2' }] },
          { id: 'q2', question: '¿Han pasado más de doce meses desde el fin del plazo?', options: [{ label: 'Sí', next: 'o-15' }, { label: 'No', next: 'o-12' }] },
          { id: 'o-req', outcome: { title: 'Fuera del régimen de recargos', text: 'Con requerimiento previo no se aplica el artículo 27. Consulta con el área el posible procedimiento sancionador.', tone: 'derivar' } },
          { id: 'o-15', outcome: { title: 'Recargo del 15 % con intereses', text: 'Intereses de demora desde el día siguiente al final de los doce meses. Sin sanción.', tone: 'atencion' } },
          { id: 'o-12', outcome: { title: 'Recargo del 1 % al 12 %', text: 'El 1 % más un 1 % por mes completo de retraso. Sin intereses ni sanción.', tone: 'resolver' } },
        ],
      },
    },
    {
      type: 'widget',
      widget: {
        kind: 'linea-tiempo',
        title: 'Plazos del modelo 303 trimestral',
        items: [
          { date: '1-20 abr', title: 'Primer trimestre', tone: 'plazo' },
          { date: '1-20 jul', title: 'Segundo trimestre', tone: 'plazo' },
          { date: '1-20 oct', title: 'Tercer trimestre', tone: 'plazo' },
          { date: '1-30 ene', title: 'Cuarto trimestre', text: 'Junto con el resumen anual (modelo 390).', tone: 'hito' },
        ],
      },
    },
    { type: 'heading', text: 'Apoyos visuales de las otras áreas', id: 'otras-areas' },
    {
      type: 'paragraph',
      text: 'Este apartado solo existe en la muestra de desarrollo: reúne el resto de apoyos visuales para revisarlos dentro de una formación.',
    },
    { type: 'list', items: ['Laboral: indemnización por despido.', 'Mercantil: disolución por pérdidas.', 'Contable: calendario de cuentas, amortización, periodificación y cuentas en T.'] },
    { type: 'widget', widget: { kind: 'indemnizacion-despido', salarioAnual: 30000, inicio: '2014-03-03', fin: '2026-10-15' }, caption: 'Despido improcedente: 33 días por año de servicio.' },
    { type: 'widget', widget: { kind: 'disolucion-perdidas', capital: 60000, patrimonioNeto: 24000, prestamoParticipativo: 10000 }, caption: 'El préstamo participativo computa como patrimonio neto a estos efectos.' },
    { type: 'widget', widget: { kind: 'calendario-cuentas', cierre: '2025-12-31' } },
    { type: 'widget', widget: { kind: 'amortizacion', coste: 24000, vidaUtil: 8, coeficienteFiscalMax: 10, valorResidual: 0 } },
    { type: 'widget', widget: { kind: 'periodificacion', importe: 1200, inicio: '2025-10-01', meses: 12, cierre: '2025-12-31', concepto: 'Prima anual del seguro del local' } },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Seguro pagado por adelantado',
        entries: [
          {
            date: '2025-10-01',
            concept: 'Pago de la prima anual',
            lines: [
              { account: '625', name: 'Primas de seguros', debit: 1200 },
              { account: '572', name: 'Bancos', credit: 1200 },
            ],
          },
          {
            date: '2025-12-31',
            concept: 'Periodificación al cierre',
            lines: [
              { account: '480', name: 'Gastos anticipados', debit: 900 },
              { account: '625', name: 'Primas de seguros', credit: 900 },
            ],
          },
        ],
      },
    },
    {
      type: 'figure',
      src: 'img/photos/biblioteca-mesa-960.webp',
      alt: 'Mesa de reuniones de FLM frente a las estanterías de la biblioteca',
      caption: 'Sala de reuniones con la biblioteca jurídica de la sede de Barcelona.',
    },
  ],
  keyTerms: [
    { term: 'artículo 27 de la LGT', definition: 'Precepto de la Ley 58/2003, General Tributaria, que regula los recargos por declaración extemporánea sin requerimiento previo.' },
    { term: 'recargo', definition: 'Prestación accesoria que se paga por presentar fuera de plazo sin requerimiento previo. **No es una sanción.**' },
    { term: 'requerimiento previo', definition: 'Cualquier actuación de la Administración, notificada al obligado, dirigida a regularizar, comprobar o liquidar la deuda. Si existe, no se aplica el régimen de recargos.' },
    { term: 'Ley 11/2021', definition: 'Ley de medidas de prevención y lucha contra el fraude fiscal. Desde el 11 de julio de 2021 fija el recargo del 1 % más un 1 % por mes completo.' },
    { term: 'periodo ejecutivo', definition: 'Fase de cobro que se abre cuando la deuda no se ingresa en plazo. Tiene sus propios recargos: 5 %, 10 % o 20 %.' },
  ],
  takeaway:
    'Sin requerimiento previo, presentar tarde cuesta un recargo, no una sanción: el 1 % más un 1 % por mes completo hasta los doce meses, y el 15 % con intereses después. Si se paga a tiempo, se reduce un 25 %.',
  sources: [
    { label: 'Ley 58/2003, de 17 de diciembre, General Tributaria', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186', kind: 'norma', date: '2026-10-21' },
    { label: 'Ley 11/2021, de 9 de julio, de medidas de prevención y lucha contra el fraude fiscal', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473', kind: 'norma' },
    { label: 'Sede electrónica de la Agencia Tributaria', url: 'https://sede.agenciatributaria.gob.es/', kind: 'web' },
  ],
  quiz: {
    id: 'dev-muestra-test',
    title: 'Test final · Recargos por presentar fuera de plazo',
    passMark: 2,
    questions: [
      {
        id: 'q1',
        prompt: 'Un cliente presenta el 303 con **3 meses y 12 días** de retraso, sin requerimiento previo. ¿Qué recargo le corresponde?',
        options: [
          { id: 'a', text: 'El 4 %' },
          { id: 'b', text: 'El 5 %', feedback: 'Solo cuentan los meses completos: son tres, no cuatro.' },
          { id: 'c', text: 'El 15 %', feedback: 'El 15 % solo se aplica cuando han pasado más de doce meses.' },
        ],
        correctOptionId: 'a',
        explanation: 'El recargo es el 1 % fijo más un 1 % por cada mes completo de retraso: 1 % + 3 × 1 % = 4 %.',
        ref: 'apartado 2, «Cómo se calcula»',
      },
      {
        id: 'q2',
        prompt: 'Si la autoliquidación se presenta **quince meses** tarde, ¿qué se exige además del recargo del 15 %?',
        options: [
          { id: 'a', text: 'Una sanción por infracción tributaria', feedback: 'El recargo excluye la sanción, también pasados los doce meses.' },
          { id: 'b', text: 'Intereses de demora desde el día siguiente al final de los doce meses' },
          { id: 'c', text: 'Nada más', feedback: 'Pasados los doce meses se exigen intereses de demora por el tiempo que excede de ese plazo.' },
        ],
        correctOptionId: 'b',
        explanation: 'Pasados doce meses, el recargo es del 15 % y se exigen intereses de demora desde el día siguiente al final de esos doce meses hasta la presentación.',
        ref: 'apartado 2, «Cómo se calcula»',
      },
      {
        id: 'q3',
        prompt: '¿Cuándo se reduce el recargo un 25 %?',
        options: [
          { id: 'a', text: 'Siempre que se presente antes de seis meses', feedback: 'La reducción no depende del retraso, sino de cómo y cuándo se paga.' },
          { id: 'b', text: 'Si se ingresa la deuda al presentar y el recargo en el plazo abierto con su notificación' },
          { id: 'c', text: 'Solo si el cliente la solicita por escrito', feedback: 'No hace falta pedirla: se aplica si se cumplen las condiciones de pago.' },
        ],
        correctOptionId: 'b',
        explanation: 'La reducción exige ingresar toda la deuda al presentar (o aplazarla con aval o seguro de caución) y pagar el recargo en el plazo del artículo 62.2 abierto con su notificación.',
        ref: 'apartado 3, «Cuándo se reduce un 25 %»',
      },
    ],
  },
  documentIds: ['doc-verifactu', 'doc-facturacion-b2b'],
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-jordi-ferrer',
    publishedAt: '2026-10-12',
    updatedAt: '2026-10-21',
    review: { state: 'pendiente' },
  },
  verifiedAt: '2026-10-21',
};

export const SAMPLE_ASSESSMENT: SectorAssessment = {
  id: 'dev-evaluacion-muestra',
  area: 'fiscal',
  title: 'Pon a prueba tus conocimientos',
  intro: 'Diez preguntas sobre plazos, recargos, facturación y retenciones. Se supera con ocho aciertos y puedes repetirla cuando quieras.',
  quiz: {
    id: 'dev-evaluacion-muestra-test',
    title: 'Pon a prueba tus conocimientos',
    passMark: 8,
    questions: [
      {
        id: 'e1',
        prompt: '¿Hasta qué día se presenta el modelo 303 del tercer trimestre, sin domiciliar el pago?',
        options: [
          { id: 'a', text: 'Hasta el 20 de octubre' },
          { id: 'b', text: 'Hasta el 30 de octubre', feedback: 'El día 30 es el límite del cuarto trimestre, en enero.' },
          { id: 'c', text: 'Hasta el 15 de octubre', feedback: 'El día 15 es el límite cuando se domicilia el pago, no el plazo general.' },
        ],
        correctOptionId: 'a',
        explanation: 'Las autoliquidaciones trimestrales del IVA se presentan del 1 al 20 del mes siguiente al trimestre, salvo la del cuarto, que llega hasta el 30 de enero.',
        ref: 'Plazos de presentación',
      },
      {
        id: 'e2',
        prompt: '¿Cuál es el plazo general de prescripción del derecho de la Administración a liquidar?',
        options: [
          { id: 'a', text: 'Cinco años', feedback: 'Cinco años es la prescripción general de las acciones personales en el Código Civil, no la tributaria.' },
          { id: 'b', text: 'Cuatro años' },
          { id: 'c', text: 'Diez años', feedback: 'Diez años es el plazo para comprobar bases o créditos compensables, no el general de prescripción.' },
        ],
        correctOptionId: 'b',
        explanation: 'El artículo 66 de la Ley General Tributaria fija en cuatro años la prescripción del derecho a determinar la deuda mediante liquidación.',
        ref: 'Ley General Tributaria, art. 66',
      },
      {
        id: 'e3',
        prompt: 'Una autoliquidación se presenta con **20 días** de retraso y sin requerimiento. ¿Qué recargo se aplica?',
        options: [
          { id: 'a', text: 'El 2 %', feedback: 'No ha pasado ningún mes completo: solo se aplica el 1 % fijo.' },
          { id: 'b', text: 'El 5 %', feedback: 'El 5 % es el recargo ejecutivo, que nada tiene que ver con presentar tarde.' },
          { id: 'c', text: 'El 1 %' },
        ],
        correctOptionId: 'c',
        explanation: 'El recargo es el 1 % más un 1 % por mes completo; con 20 días no hay ningún mes completo.',
        ref: 'Ley General Tributaria, art. 27',
      },
      {
        id: 'e4',
        prompt: 'Pasados doce meses desde el fin del plazo, ¿qué corresponde si se presenta sin requerimiento?',
        options: [
          { id: 'a', text: 'Un recargo del 15 % más intereses de demora' },
          { id: 'b', text: 'Un recargo del 12 % sin intereses', feedback: 'El 12 % es el máximo del tramo de hasta doce meses.' },
          { id: 'c', text: 'Un recargo del 20 % y una sanción', feedback: 'El 20 % es el recargo de apremio ordinario del periodo ejecutivo; sin requerimiento no hay sanción.' },
        ],
        correctOptionId: 'a',
        explanation: 'Pasados doce meses, el recargo es del 15 % y se exigen intereses de demora desde el día siguiente al final de esos doce meses.',
        ref: 'Ley General Tributaria, art. 27',
      },
      {
        id: 'e5',
        prompt: '¿Qué tipo general del IVA se aplica en la Península y Baleares?',
        options: [
          { id: 'a', text: 'El 16 %', feedback: 'El 16 % fue el tipo general hasta junio de 2010.' },
          { id: 'b', text: 'El 10 %', feedback: 'El 10 % es el tipo reducido.' },
          { id: 'c', text: 'El 21 %' },
        ],
        correctOptionId: 'c',
        explanation: 'El tipo general del IVA es el 21 % desde septiembre de 2012.',
        ref: 'Ley del IVA, art. 90',
      },
      {
        id: 'e6',
        prompt: '¿Qué retención general se aplica a los rendimientos de actividades profesionales?',
        options: [
          { id: 'a', text: 'El 15 %' },
          { id: 'b', text: 'El 7 %', feedback: 'El 7 % se aplica en el año de inicio de la actividad y en los dos siguientes.' },
          { id: 'c', text: 'El 19 %', feedback: 'El 19 % es la retención general sobre los rendimientos del capital mobiliario.' },
        ],
        correctOptionId: 'a',
        explanation: 'La retención general sobre rendimientos de actividades profesionales es del 15 %.',
        ref: 'Reglamento del IRPF, art. 101',
      },
      {
        id: 'e7',
        prompt: 'Si el destinatario es empresario o profesional, ¿cuándo debe expedirse la factura?',
        options: [
          { id: 'a', text: 'En el momento de la operación, sin excepción', feedback: 'Es la regla general, pero con destinatario empresario o profesional el plazo se amplía.' },
          { id: 'b', text: 'Antes del día 16 del mes siguiente al devengo' },
          { id: 'c', text: 'Antes de que termine el trimestre', feedback: 'El plazo no es trimestral: se cuenta desde el mes del devengo.' },
        ],
        correctOptionId: 'b',
        explanation: 'El Reglamento de facturación permite expedirla antes del día 16 del mes siguiente a aquel en que se devengó el impuesto.',
        ref: 'Reglamento de facturación, art. 11',
      },
      {
        id: 'e8',
        prompt: 'Una sociedad con ejercicio igual al año natural, ¿cuándo presenta el Impuesto sobre Sociedades?',
        options: [
          { id: 'a', text: 'Del 1 al 30 de junio', feedback: 'Junio es el final de la campaña de la renta de las personas físicas.' },
          { id: 'b', text: 'Del 1 al 25 de julio' },
          { id: 'c', text: 'Hasta el 30 de enero', feedback: 'En enero se presentan los resúmenes anuales, no el Impuesto sobre Sociedades.' },
        ],
        correctOptionId: 'b',
        explanation: 'Se presenta en los 25 días naturales siguientes a los seis meses posteriores al cierre: del 1 al 25 de julio.',
        ref: 'Ley del Impuesto sobre Sociedades, art. 124',
      },
      {
        id: 'e9',
        prompt: '¿Qué modelo recoge el resumen anual del IVA?',
        options: [
          { id: 'a', text: 'El modelo 347', feedback: 'El 347 es la declaración de operaciones con terceras personas.' },
          { id: 'b', text: 'El modelo 190', feedback: 'El 190 es el resumen anual de retenciones del trabajo y de actividades profesionales.' },
          { id: 'c', text: 'El modelo 390' },
        ],
        correctOptionId: 'c',
        explanation: 'El modelo 390 es la declaración-resumen anual del IVA.',
        ref: 'Modelos tributarios',
      },
      {
        id: 'e10',
        prompt: 'Un cliente presenta tarde una autoliquidación a ingresar, pero no paga. ¿Qué ocurre?',
        options: [
          { id: 'a', text: 'Solo se exige el recargo extemporáneo', feedback: 'Si no se ingresa al presentar, la deuda entra además en periodo ejecutivo.' },
          { id: 'b', text: 'Se exige el recargo extemporáneo y se abre el periodo ejecutivo' },
          { id: 'c', text: 'La autoliquidación se tiene por no presentada', feedback: 'La autoliquidación se tiene por presentada; lo que falta es el ingreso.' },
        ],
        correctOptionId: 'b',
        explanation: 'Los recargos por presentar tarde son compatibles con los recargos e intereses del periodo ejecutivo cuando no se ingresa al presentar.',
        ref: 'Ley General Tributaria, art. 27.4',
      },
    ],
  },
};

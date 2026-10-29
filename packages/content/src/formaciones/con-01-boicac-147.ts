import type { Formation, QuizQuestion } from '@flm/shared';

export const formation: Formation = {
  id: 'con-01',
  slug: 'boicac-147',
  area: 'contable',
  title: 'BOICAC 147: los criterios del ICAC que debes aplicar',
  intro:
    'Imagina dos clientes. Un distribuidor de vehículos industriales vende contratos de mantenimiento de 36 meses con cuota fija y quiere registrar cada cuota como ingreso del mes; otro ha recuperado por impago la máquina que vendió a plazos y no sabe por qué importe debe volver a su balance. El BOICAC n.º 147 resuelve ambos casos y aclara quién publica el informe fiscal de algunas filiales de grupos no europeos.',
  summary:
    'Contratos de mantenimiento a cuota fija, bienes recuperados por impago y filiales de grupos no europeos: qué resuelve el ICAC y cómo aplicarlo con tus clientes.',
  coverTerm: '147',
  readingMinutes: 10,
  outcomes: [
    'Decidir si un contrato de servicios con cuota fija se reconoce a lo largo del tiempo y con qué método se mide su grado de avance.',
    'Calcular el ingreso de cada ejercicio con el método de recursos y el saldo de anticipos de clientes al cierre.',
    'Determinar por qué importe se registra un bien recuperado mediante dación en pago y cómo se da de baja el crédito.',
  ],
  blocks: [
    /* ── 1 · El boletín ─────────────────────────────────────────────────── */
    { type: 'heading', text: 'Qué trae el BOICAC 147', id: 'que-trae-el-boicac-147' },
    {
      type: 'paragraph',
      text: 'El BOICAC n.º 147 lleva en la portada la fecha de septiembre de 2026 y el ICAC lo [publicó en su web el 22 de octubre de 2026](https://www.icac.gob.es/node/26707). Además de información sobre auditores y dos reglamentos delegados europeos sobre sostenibilidad, incluye tres consultas contables. Cada respuesta se refiere a los hechos del consultante: antes de aplicarla a un cliente, comprueba que su situación es la misma.',
    },
    {
      type: 'list',
      items: [
        '[Consulta 1](https://www.icac.gob.es/node/26674): informe fiscal de filiales españolas de grupos no europeos con dominante intermedia europea.',
        '[Consulta 2](https://www.icac.gob.es/node/26675): imputación temporal de ingresos en un contrato de mantenimiento con cuota fija.',
        '[Consulta 3](https://www.icac.gob.es/node/26676): bien vendido y recuperado mediante dación en pago del crédito.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Empezamos por las consultas 2 y 3, las más útiles para pymes, porque afectan directamente al resultado y al balance. La consulta 1 solo alcanza a filiales de grupos muy grandes, pero conviene saber detectarlas en la cartera.',
    },

    /* ── 2 · Consulta 2 ─────────────────────────────────────────────────── */
    { type: 'heading', text: 'Consulta 2: mantenimiento con cuota fija', id: 'consulta-2-mantenimiento' },
    {
      type: 'paragraph',
      text: 'Un mayorista de vehículos industriales vende contratos de mantenimiento de 36 meses con cuota fija mensual (revisiones y sustitución de piezas desgastadas no cubiertas por la garantía, en cualquier taller oficial). Registraba los cobros como pasivo hasta la primera visita al taller y, después, imputaba ingresos según el uso estimado del vehículo. Según su histórico, los costes se reparten, de media, un 15 %, un 34 % y un 51 % entre los tres años de servicio. Preguntaba si podía aplicar el porcentaje de realización de la adaptación del PGC a las empresas constructoras.',
    },
    {
      type: 'paragraph',
      text: 'El ICAC recuerda que debe atenderse a la realidad económica ([art. 34.2 del Código de Comercio](https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art34)) y resuelve con el marco vigente: la [NRV 14.ª del PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A14) y la [Resolución del ICAC de 10 de febrero de 2021](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155) sobre ingresos, que la desarrolla. Su razonamiento:',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Recambios y mano de obra se prestan integrados: no son distintos en el contexto del contrato y forman una sola [[obligación a cumplir]] ([art. 7](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a7)).',
        'El servicio está disponible de forma continua durante tres años a precio fijo: la obligación se cumple a lo largo del tiempo ([art. 9](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a9)).',
        'El ingreso se reconoce, por tanto, según el [[grado de avance]] ([art. 8.3](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a8)).',
        'Como método, el ICAC apunta al [[método de recursos]]: costes incurridos al final de cada año frente a costes totales estimados con el histórico ([art. 11.5](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a1-3)).',
        'Las estimaciones deben obtenerse de carteras de contratos homogéneos, siempre que el resultado no difiera significativamente del cálculo contrato a contrato, y se revisan si las previsiones cambian de forma significativa ([art. 1.4](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a1)).',
      ],
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Grado de avance',
      text: 'Mide cuánto has avanzado en una obligación que se cumple a lo largo del tiempo. Con el [[método de recursos]] basado en costes, es el coste incurrido acumulado entre el coste total estimado; el ingreso del ejercicio es ese porcentaje por el precio total, menos lo ya reconocido.\n\nSi no puedes medirlo razonablemente, pero esperas recuperar los costes, solo reconoces ingresos por un importe igual a los costes incurridos ([art. 8.3](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a8)). Se actualiza al menos en cada cierre, como cambio de estimación, sin reexpresar ejercicios anteriores ([art. 11.6](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a1-3); [NRV 22.ª del PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A22)).',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'La factura no es el ingreso',
      text: 'Si registras cada cuota como ingreso del mes, adelantas margen a los primeros años y dejas pérdidas para el último: el reparto lineal solo es apropiado si el esfuerzo es uniforme. Lo cobrado o exigible antes de prestar el servicio es un [[pasivo del contrato]], que se presenta en «Anticipos de clientes» (cuenta 438) si se aplicará a corto plazo, o en «Periodificaciones a largo plazo» (cuenta 181) si es a largo.',
      refs: [
        { label: 'Resolución del ICAC de 10/02/2021, art. 11.5 (método de recursos)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a1-3', date: '2026-10-28', kind: 'norma' },
        { label: 'Resolución del ICAC de 10/02/2021, art. 33.3 (pasivo del contrato)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a3-5', date: '2026-10-28', kind: 'norma' },
      ],
    },
    {
      type: 'example',
      title: 'Cartera de 100 contratos de mantenimiento',
      scenario:
        'Supuesto ilustrativo con el patrón de costes de la consulta 2. Una sociedad que aplica el PGC firma el 1 de enero de 20X1 cien contratos homogéneos de 36 meses a 150 € al mes (sin IVA), que factura y cobra cada mes. Su histórico estima un coste total de 3.600 € por contrato, repartido un 15 %, un 34 % y un 51 % entre los tres años.',
      steps: [
        {
          label: 'Precio total y facturación anual de la cartera',
          formula: '100 × 150 € × 36 = 540.000 €;  100 × 150 € × 12 = 180.000 €',
          result: '540.000 € en total; 180.000 € al año',
        },
        {
          label: 'Coste total estimado y reparto por años',
          formula: '100 × 3.600 € = 360.000 €;  360.000 € × 15 % · 34 % · 51 %',
          result: '54.000 € · 122.400 € · 183.600 €',
        },
        {
          label: '[[grado de avance]] e ingreso de 20X1',
          formula: '54.000 / 360.000 = 15 %;  15 % × 540.000 €',
          result: 'Ingreso de 20X1: 81.000 €',
        },
        {
          label: 'Saldo de la cuenta 438 a 31/12/20X1',
          formula: '180.000 € facturados − 81.000 € de ingreso',
          result: '99.000 € de pasivo del contrato, a corto plazo',
        },
        {
          label: 'Ingreso de 20X2',
          formula: '(54.000 + 122.400) / 360.000 = 49 %;  49 % × 540.000 − 81.000',
          result: '183.600 € (saldo de la 438: 99.000 + 180.000 − 183.600 = 95.400 €)',
        },
        {
          label: 'Ingreso de 20X3, último año del contrato',
          formula: '100 % × 540.000 − 264.600',
          result: '275.400 € (la cuenta 438 queda a cero)',
        },
        {
          label: 'Margen de cada año, frente al que saldría facturando',
          formula: '81.000 − 54.000 · 183.600 − 122.400 · 275.400 − 183.600',
          result: '27.000 € · 61.200 € · 91.800 € (facturando: 126.000 € · 57.600 € · −3.600 €)',
        },
      ],
      conclusion:
        'El margen total es el mismo, 180.000 €, pero cambia el ejercicio en que aparece: con el [[grado de avance]], es un tercio del ingreso cada año, sin beneficios adelantados ni pérdidas al final.\n\nSi al cierre de 20X2 el coste total estimado subiera a 392.000 €, el avance acumulado pasaría al 45 % (176.400 / 392.000) y el ingreso de 20X2, a 162.000 € (45 % × 540.000 − 81.000), sin tocar 20X1.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Asientos de 20X1 de la cartera (resumen anual)',
        entries: [
          {
            concept: 'Facturación de las cuotas de 20X1, exigibles cada mes',
            lines: [
              { account: '430', name: 'Clientes', debit: 180000 },
              { account: '438', name: 'Anticipos de clientes', credit: 180000 },
            ],
          },
          {
            concept: 'Cobro de las cuotas',
            lines: [
              { account: '572', name: 'Bancos', debit: 180000 },
              { account: '430', name: 'Clientes', credit: 180000 },
            ],
          },
          {
            concept: 'Ingreso por grado de avance (15 % × 540.000 €)',
            lines: [
              { account: '438', name: 'Anticipos de clientes', debit: 81000 },
              { account: '705', name: 'Prestaciones de servicios', credit: 81000 },
            ],
          },
        ],
      },
      caption: 'Importes sin IVA; en la práctica, se registra cada mes. El saldo acreedor de la 438 (99.000 €) es el pasivo del contrato que se aplicará en 20X2.',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Si tu cliente aplica el PGC de Pymes',
      text: 'La NRV 16.ª del PGC de Pymes también exige reconocer los servicios según su porcentaje de realización al cierre, si el resultado puede estimarse con fiabilidad, y la Resolución de 2021 se puede aplicar de forma subsidiaria si su marco no desarrolla la operación. Revisa los contratos plurianuales a cuota fija de talleres, concesionarios y empresas de mantenimiento, y documenta el histórico de costes que sostiene la estimación.',
      refs: [
        { label: 'PGC de Pymes, NRV 16.ª (ingresos por ventas y prestación de servicios)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#A16', date: '2026-10-28', kind: 'norma' },
        { label: 'Resolución del ICAC de 10/02/2021, art. 1.2 (aplicación subsidiaria)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a1', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 3 · Consulta 3 ─────────────────────────────────────────────────── */
    { type: 'heading', text: 'Consulta 3: el bien vendido que vuelve por impago', id: 'consulta-3-dacion-en-pago' },
    {
      type: 'paragraph',
      text: 'Una sociedad vendió en 20X2 una máquina de su inmovilizado con pago aplazado y registró una pérdida. En 20X5, ante el impago, se resolvió la compraventa y la máquina volvió a su patrimonio. ¿Por qué valor la registra? Para el ICAC, es la cancelación de un crédito mediante [[dación en pago]] en la que se recibe el mismo bien vendido.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Qué dice la norma y qué concluye el ICAC',
      text: 'El apartado 2.3 de la norma 13.ª de la Resolución del ICAC de 14 de abril de 2015 valora los bienes recibidos por el cobro de créditos por el importe por el que figura en cuentas el crédito, más los gastos de la operación, o por su valor razonable si es menor.\n\nEl ICAC concluye que la maquinaria se reconoce por el [[valor en libros]] del crédito cancelado, salvo clara evidencia de que su valor razonable en la fecha de adjudicación es inferior; en ese caso, se usa este.',
      refs: [
        { label: 'Resolución del ICAC de 14/04/2015, norma 13.ª, apartado 2.3', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-4394#decimotercera', date: '2026-10-28', kind: 'norma' },
        { label: 'ICAC · BOICAC n.º 147, consulta 3', url: 'https://www.icac.gob.es/node/26676', date: '2026-10-28', kind: 'criterio' },
      ],
    },
    {
      type: 'list',
      items: [
        '**No deshaces la venta**: recibes el bien en pago del crédito, y la pérdida de 20X2 no se revierte.',
        '**Parte del crédito neto**: su [[valor en libros]] es el nominal pendiente menos el deterioro registrado.',
        '**Suma los gastos de la operación**, como el transporte o la formalización.',
        '**Compara con el valor razonable** en la fecha de adjudicación: si hay clara evidencia de que es menor que esa suma (por ejemplo, por una tasación independiente), entra por ese importe y la diferencia es pérdida; si es mayor, no hay beneficio.',
      ],
    },
    {
      type: 'table',
      caption: 'Supuesto ilustrativo: crédito pendiente de 30.000 €, deterioro registrado de 6.000 € y gastos de la operación de 1.000 €',
      columns: ['Concepto', 'Valor razonable: 32.000 €', 'Valor razonable: 21.000 €'],
      rows: [
        ['Crédito pendiente (cuenta 543)', '30.000 €', '30.000 €'],
        ['Deterioro registrado (cuenta 598)', '−6.000 €', '−6.000 €'],
        ['Valor en libros del crédito', '24.000 €', '24.000 €'],
        ['Gastos de la operación', '1.000 €', '1.000 €'],
        ['Valor en libros más gastos', '25.000 €', '25.000 €'],
        ['**Valor de entrada de la máquina (el menor)**', '**25.000 €**', '**21.000 €**'],
        ['Pérdida reconocida', '0 €', '4.000 €'],
      ],
      numeric: [1, 2],
    },
    {
      type: 'table',
      caption: 'Asiento propuesto en la adjudicación, con un valor razonable de 21.000 €',
      columns: ['Cuenta', 'Debe', 'Haber'],
      rows: [
        ['213 Maquinaria', '21.000', ''],
        ['598 Deterioro de valor de créditos a corto plazo', '6.000', ''],
        ['667 Pérdidas de créditos no comerciales', '4.000', ''],
        ['543 Créditos a corto plazo por enajenación de inmovilizado', '', '30.000'],
        ['572 Bancos (gastos de la operación)', '', '1.000'],
        ['**Total**', '**31.000**', '**31.000**'],
      ],
      numeric: [1, 2],
    },
    {
      type: 'paragraph',
      text: 'Con un valor razonable de 32.000 €, la máquina entra por 25.000 € y no hay pérdida. El ICAC no fija cuentas: la propuesta sigue las [definiciones del PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo5-2), que llevan a la cuenta 667 la pérdida en la baja de estos créditos.',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Coordina el IVA con el área fiscal',
      text: 'La resolución de la compraventa puede afectar al IVA de la venta original: la ley prevé modificar la base imponible cuando una operación gravada queda sin efecto con arreglo a Derecho. Comprueba con el área fiscal si se cumplen los requisitos; no forma parte del criterio del ICAC.',
      refs: [{ label: 'Ley 37/1992, del IVA, art. 80.Dos', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a80', date: '2026-10-28', kind: 'norma' }],
    },

    /* ── 4 · Consulta 1 ─────────────────────────────────────────────────── */
    { type: 'heading', text: 'Consulta 1: filiales de grupos no europeos', id: 'consulta-1-informe-fiscal' },
    {
      type: 'paragraph',
      text: 'La [disposición adicional 11.ª de la Ley de Auditoría de Cuentas](https://www.boe.es/buscar/act.php?id=BOE-A-2015-8147#da) obliga a las filiales españolas que no sean entidades pequeñas ([art. 3.9](https://www.boe.es/buscar/act.php?id=BOE-A-2015-8147#a3)) a publicar y hacer accesible el informe consolidado sobre el impuesto sobre sociedades de su dominante última, si esta no está sujeta al Derecho de un Estado miembro y su cifra de negocios consolidada ha superado 750 millones de euros en cada uno de los dos últimos ejercicios. Rige para ejercicios iniciados desde el 22 de junio de 2024: el informe se publica en los seis meses siguientes al cierre y se deposita en el Registro Mercantil con las cuentas anuales.',
    },
    {
      type: 'paragraph',
      text: 'El ICAC ya admitía (BOICAC n.º 146, consulta 3) una única publicación por la entidad que designe el grupo, con garantías de integridad, trazabilidad y accesibilidad, si las demás identifican quién cumple y dónde se consulta el informe. La [consulta 1 del BOICAC 147](https://www.icac.gob.es/node/26674) añade que puede ser la designada la dominante intermedia europea de la que dependan las españolas, salvo que la dominante última designe expresamente a otra filial. El informe debe cubrir el grupo de la dominante última, incluidas las filiales españolas, y cumplir los requisitos de contenido, plazo, publicidad y accesibilidad.',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Qué revisar si llevas una filial así',
      text: 'Comprueba la cifra de negocios consolidada del grupo en los dos últimos ejercicios y si la filial es entidad pequeña. Si está obligada, confirma qué entidad publica el informe y que tu cliente identifica con claridad quién lo publica y dónde puede consultarse. Con ejercicio natural, el primero afectado es 2025, cuyo informe debía publicarse como tarde el 30 de junio de 2026.',
      refs: [
        { label: 'ICAC · BOICAC n.º 147, consulta 1', url: 'https://www.icac.gob.es/node/26674', date: '2026-10-28', kind: 'criterio' },
        { label: 'Ley 22/2015, de Auditoría de Cuentas, disposición adicional 11.ª', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-8147#da', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 5 · Errores frecuentes ─────────────────────────────────────────── */
    { type: 'heading', text: 'Errores frecuentes', id: 'errores-frecuentes' },
    {
      type: 'paragraph',
      text: 'Comprueba si distingues el criterio del ICAC de lo que se hace por inercia.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'tarjetas-verdad',
        title: '¿Verdadero, falso o depende?',
        cards: [
          {
            claim: 'Si cobro una cuota fija cada mes, el ingreso del mes es la cuota.',
            verdict: 'depende',
            explanation: 'Solo si el esfuerzo es uniforme. Con costes del 15 %, el 34 % y el 51 %, el ingreso sigue al grado de avance medido con costes (consulta 2).',
          },
          {
            claim: 'Los recambios y la mano de obra del contrato se reconocen por separado.',
            verdict: 'falso',
            explanation: 'Se prestan integrados: no son distintos en el contexto del contrato y forman una sola obligación (consulta 2).',
          },
          {
            claim: 'Si al cierre cambia el coste total estimado, hay que rehacer el ejercicio anterior.',
            verdict: 'falso',
            explanation: 'Es un cambio de estimación: el efecto va al ejercicio corriente y a los siguientes (art. 11.6 de la Resolución de 2021; NRV 22.ª del PGC).',
          },
          {
            claim: 'La máquina recuperada vuelve por su valor razonable, aunque supere el crédito.',
            verdict: 'falso',
            explanation: 'Entra por el valor en libros del crédito más los gastos; el valor razonable solo cuenta si es menor, así que no aflora beneficio (consulta 3).',
          },
          {
            claim: 'Con una holding intermedia europea, las filiales españolas ya no tienen nada que hacer.',
            verdict: 'falso',
            explanation: 'La intermedia puede ser la entidad designada, pero las filiales deben identificar quién publica el informe y dónde puede consultarse (consulta 1).',
          },
        ],
      },
      caption: 'Cinco ideas habituales, contrastadas con el BOICAC 147.',
    },
  ],
  keyTerms: [
    {
      term: 'obligación a cumplir',
      definition:
        'Compromiso del contrato de transferir al cliente un bien o servicio distinto, o un grupo de ellos. Si un bien o servicio no es distinto, se combina con otros hasta formar un grupo que lo sea (art. 7 de la Resolución del ICAC de 10 de febrero de 2021).',
    },
    {
      term: 'grado de avance',
      definition:
        'Medida del progreso hacia el cumplimiento completo de una obligación que se cumple a lo largo del tiempo. Determina el ingreso de cada ejercicio, siempre que haya información fiable para medirlo.',
    },
    {
      term: 'método de recursos',
      definition:
        'Forma de medir el grado de avance con los factores empleados (costes, horas, tiempo) respecto del total previsto. En la consulta 2: coste incurrido acumulado entre coste total estimado.',
    },
    {
      term: 'pasivo del contrato',
      definition:
        'Contraprestación cobrada o exigible antes de prestar el servicio. Se presenta en «Anticipos de clientes» (438) si se aplicará a corto plazo, o en «Periodificaciones a largo plazo» (181) si es a largo.',
    },
    {
      term: 'dación en pago',
      definition: 'Entrega de un bien al acreedor para cancelar un crédito. En la consulta 3, el deudor devuelve el mismo bien que había comprado.',
    },
    {
      term: 'valor en libros',
      definition:
        'Importe neto por el que un activo figura en el balance, una vez deducidas su amortización acumulada y las correcciones por deterioro registradas (Marco Conceptual del PGC, apartado 6.º, punto 9).',
    },
  ],
  takeaway:
    'Contabiliza el servicio, no la factura: en un mantenimiento plurianual a cuota fija, el ingreso sigue al grado de avance medido con costes. Y si un bien vendido vuelve por impago, entra por el valor en libros del crédito más los gastos, sin superar su valor razonable ni generar beneficio.',
  sources: [
    { label: 'ICAC · BOICAC n.º 147, consulta 1: informe sobre el impuesto sobre sociedades de filiales con dominante intermedia europea', url: 'https://www.icac.gob.es/node/26674', date: '2026-10-28', kind: 'criterio' },
    { label: 'ICAC · BOICAC n.º 147, consulta 2: imputación temporal de ingresos en un contrato de mantenimiento', url: 'https://www.icac.gob.es/node/26675', date: '2026-10-28', kind: 'criterio' },
    { label: 'ICAC · BOICAC n.º 147, consulta 3: bien vendido y recuperado mediante dación en pago', url: 'https://www.icac.gob.es/node/26676', date: '2026-10-28', kind: 'criterio' },
    { label: 'ICAC · Publicación del BOICAC n.º 147 (22 de octubre de 2026)', url: 'https://www.icac.gob.es/node/26707', date: '2026-10-28', kind: 'documento' },
    { label: 'Resolución del ICAC de 10 de febrero de 2021, sobre reconocimiento de ingresos por la entrega de bienes y la prestación de servicios', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 1514/2007, de 16 de noviembre, Plan General de Contabilidad (NRV 14.ª)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A14', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 1515/2007, Plan General de Contabilidad de Pymes (NRV 16.ª)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#A16', date: '2026-10-28', kind: 'norma' },
    { label: 'Resolución del ICAC de 14 de abril de 2015, sobre el coste de producción (norma 13.ª)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-4394#decimotercera', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 22/2015, de Auditoría de Cuentas (disposición adicional 11.ª)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-8147#da', date: '2026-10-28', kind: 'norma' },
    { label: 'Código de Comercio (art. 34)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art34', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido (art. 80)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a80', date: '2026-10-28', kind: 'norma' },
  ],
  quiz: {
    id: 'con-01-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'con-01-q1',
        prompt:
          'Un distribuidor vende contratos de mantenimiento de 36 meses con cuota fija mensual que incluyen revisiones y sustitución de piezas desgastadas. Su histórico muestra costes del 15 %, el 34 % y el 51 % en cada año. Según la consulta 2 del BOICAC 147, ¿cómo debe reconocer el ingreso?',
        options: [
          {
            id: 'a',
            text: 'Por la cuota facturada cada mes, porque el precio es fijo.',
            feedback:
              'La factura no mide el servicio prestado. El reparto lineal solo es apropiado si el esfuerzo es uniforme (art. 11.5 de la Resolución de 2021), y con costes del 15 %, el 34 % y el 51 % no lo es.',
          },
          { id: 'b', text: 'A lo largo del tiempo, según el grado de avance: coste incurrido acumulado entre coste total estimado.' },
          {
            id: 'c',
            text: 'Todo al terminar el contrato, cuando el servicio está completo.',
            feedback:
              'La obligación se cumple a lo largo del tiempo, porque el servicio está disponible de forma continua. Incluso si el avance no pudiera medirse, se reconocería un ingreso igual a los costes incurridos, si se espera recuperarlos (art. 8.3), no cero hasta el final.',
          },
          {
            id: 'd',
            text: 'Separando los recambios, que se reconocen al montarlos, de la mano de obra, que se reparte de forma lineal.',
            feedback: 'Recambios y mano de obra se prestan integrados: no son distintos en el contexto del contrato y forman una sola obligación (consulta 2; art. 7).',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'El ICAC concluye que hay una sola obligación que se cumple a lo largo del tiempo y apunta como adecuado un método de recursos: comparar los costes incurridos al final de cada año con los costes totales estimados a partir del histórico de carteras homogéneas.',
        ref: 'Apartado 2 · Consulta 2: mantenimiento con cuota fija',
      },
      {
        id: 'con-01-q2',
        prompt:
          'Una cartera de contratos de mantenimiento tiene un precio total de 540.000 € y un coste total estimado de 360.000 €. En 20X1 se incurre en 54.000 € de costes y se facturan y cobran cuotas por 180.000 €, registradas en la cuenta 438. ¿Qué ingreso reconoces en 20X1 y qué saldo tiene la 438 al cierre?',
        options: [
          {
            id: 'a',
            text: 'Ingreso de 180.000 € y saldo cero en la 438.',
            feedback: 'Iguala ingreso y facturación, justo lo que descarta la consulta 2 cuando el coste no se reparte de forma uniforme.',
          },
          {
            id: 'b',
            text: 'Ingreso de 54.000 € y saldo de 126.000 € en la 438.',
            feedback: 'Reconocer un ingreso igual al coste solo procede si no puedes medir razonablemente el avance (art. 8.3); aquí el histórico permite medirlo.',
          },
          {
            id: 'c',
            text: 'Ingreso de 27.000 € y saldo de 153.000 € en la 438.',
            feedback: '27.000 € es el margen (81.000 − 54.000), no el ingreso: el método calcula el ingreso y el margen es su consecuencia.',
          },
          { id: 'd', text: 'Ingreso de 81.000 € y saldo de 99.000 € en la 438.' },
        ],
        correctOptionId: 'd',
        explanation:
          'Grado de avance: 54.000 / 360.000 = 15 %. Ingreso: 15 % × 540.000 = 81.000 €. Lo facturado por encima del ingreso, 180.000 − 81.000 = 99.000 €, es un pasivo del contrato y se presenta en «Anticipos de clientes» porque se aplicará en 20X2 (art. 33.3 de la Resolución de 2021).',
        ref: 'Apartado 2 · Ejemplo resuelto: cartera de 100 contratos',
      },
      {
        id: 'con-01-q3',
        prompt:
          'En 20X5 tu cliente recupera, por impago, la máquina que vendió a plazos en 20X2. Crédito pendiente: 30.000 €; deterioro registrado: 6.000 €; gastos de la operación: 1.000 €; una tasación independiente fija su valor razonable en 32.000 €. ¿Por qué importe registra la máquina?',
        options: [
          {
            id: 'a',
            text: '60.000 €, el valor neto contable que tenía antes de venderla.',
            feedback: 'La recuperación no deshace la venta de 20X2: el ICAC la trata como la cancelación de un crédito mediante dación en pago (consulta 3).',
          },
          {
            id: 'b',
            text: '32.000 €, su valor razonable, con un beneficio de 7.000 €.',
            feedback: 'El valor razonable solo se usa cuando es menor que el valor en libros del crédito más los gastos; la regla no permite reconocer beneficio.',
          },
          { id: 'c', text: '25.000 €: el valor en libros del crédito (24.000 €) más los gastos (1.000 €).' },
          {
            id: 'd',
            text: '31.000 €: el nominal pendiente (30.000 €) más los gastos (1.000 €).',
            feedback: 'El valor en libros del crédito es neto del deterioro registrado: 30.000 − 6.000 = 24.000 € (Marco Conceptual del PGC).',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'El bien recibido se valora por el importe por el que figura en cuentas el crédito, más los gastos de la operación, o por su valor razonable si es menor (norma 13.ª, apartado 2.3, de la Resolución del ICAC de 14 de abril de 2015, que aplica la consulta 3). Como 32.000 € supera 25.000 €, la máquina entra por 25.000 € y no hay beneficio.',
        ref: 'Apartado 3 · Consulta 3: el bien vendido que vuelve por impago',
      },
    ],
  },
  documentIds: ['doc-boicac-147'],
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-judith-calet',
    publishedAt: '2026-10-27T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: '2026-10-28',
};

/** Banco de 4 preguntas adicionales para la evaluación sectorial («Pon a prueba tus conocimientos»). */
export const bank: QuizQuestion[] = [
  {
    id: 'con-01-b1',
    prompt:
      'Una sociedad recupera por impago la máquina que vendió a plazos. El crédito pendiente es de 30.000 €, tiene un deterioro registrado de 6.000 € y los gastos de la operación ascienden a 1.000 €. Una tasación independiente acredita un valor razonable de 21.000 € en la fecha de adjudicación. Según la consulta 3 del BOICAC 147, ¿cómo se registra?',
    options: [
      { id: 'a', text: 'Máquina por 21.000 € y pérdida de 4.000 €.' },
      {
        id: 'b',
        text: 'Máquina por 25.000 €, sin pérdida, porque el crédito ya estaba deteriorado.',
        feedback: 'El límite del valor razonable opera aunque el crédito tenga deterioro: 25.000 € superaría el valor razonable acreditado.',
      },
      {
        id: 'c',
        text: 'Máquina por 24.000 € y los 1.000 € de gastos, como gasto del ejercicio.',
        feedback: '24.000 € también supera el valor razonable (21.000 €): la máquina no puede entrar por encima de él.',
      },
      {
        id: 'd',
        text: 'Máquina por 30.000 €, el nominal pendiente, sin pérdida.',
        feedback: 'Ignora el deterioro y el límite del valor razonable: el punto de partida es el valor en libros del crédito.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Hay clara evidencia de un valor razonable (21.000 €) inferior al valor en libros del crédito más los gastos (24.000 + 1.000 = 25.000 €), así que la máquina entra por 21.000 € y la diferencia, 4.000 €, es pérdida. Asiento propuesto: 213 (21.000 €), 598 (6.000 €) y 667 (4.000 €) al debe; 543 (30.000 €) y 572 (1.000 €) al haber.',
    ref: 'BOICAC 147 · Apartado 3: el bien vendido que vuelve por impago',
  },
  {
    id: 'con-01-b2',
    prompt:
      'Una cartera de contratos de mantenimiento tiene un precio total de 540.000 €. En 20X1 reconoció 81.000 € de ingreso y, al cierre de 20X2, el coste incurrido acumulado es de 176.400 €. En ese cierre, la empresa revisa el coste total estimado de 360.000 € a 392.000 €. ¿Qué ingreso reconoce en 20X2?',
    options: [
      {
        id: 'a',
        text: '183.600 €, porque el porcentaje de avance se fijó al inicio del contrato.',
        feedback: 'El avance se actualiza, al menos, en cada cierre (art. 11.6 de la Resolución de 2021); mantener el 49 % ignoraría la nueva estimación.',
      },
      {
        id: 'b',
        text: '162.000 € y, además, un ajuste de 20X1 contra reservas.',
        feedback: 'Los cambios de estimación se aplican de forma prospectiva: no se reexpresa 20X1 ni se ajustan reservas (NRV 22.ª del PGC).',
      },
      { id: 'c', text: '162.000 € (45 % × 540.000 − 81.000), sin tocar 20X1.' },
      {
        id: 'd',
        text: '176.400 €, igual al coste incurrido acumulado.',
        feedback: 'Mezcla una cifra acumulada con una anual y reconoce un ingreso igual al coste, criterio reservado a cuando el avance no puede medirse (art. 8.3).',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Avance acumulado: 176.400 / 392.000 = 45 %. Ingreso acumulado: 45 % × 540.000 = 243.000 €. Ingreso de 20X2: 243.000 − 81.000 = 162.000 €. Es un cambio de estimación contable, con efecto prospectivo (art. 11.6 de la Resolución de 2021; NRV 22.ª del PGC).',
    ref: 'BOICAC 147 · Apartado 2: ejemplo resuelto y cambio de estimación',
  },
  {
    id: 'con-01-b3',
    prompt:
      'Una sociedad española que no es entidad pequeña pertenece a un grupo estadounidense cuya cifra de negocios consolidada supera los 750 millones de euros en cada uno de los dos últimos ejercicios. Depende de una holding intermedia irlandesa y la matriz no ha designado a ninguna filial. Según la consulta 1 del BOICAC 147, ¿quién puede asumir la publicación, la accesibilidad y el depósito del informe sobre el impuesto sobre sociedades?',
    options: [
      {
        id: 'a',
        text: 'Cada filial española, con una publicación íntegra y separada.',
        feedback: 'El ICAC no exige publicaciones idénticas por cada filial: basta una única publicación con garantías de integridad, trazabilidad y accesibilidad.',
      },
      {
        id: 'b',
        text: 'Nadie: la existencia de una dominante intermedia europea exime al grupo.',
        feedback: 'La intermedia es una vía para cumplir, no una exención: el informe debe publicarse y cumplir los requisitos de contenido, plazo, publicidad y accesibilidad.',
      },
      {
        id: 'c',
        text: 'Solo la matriz estadounidense, en su web y sin requisitos de plazo.',
        feedback: 'El informe debe cumplir los requisitos de contenido, plazo, publicidad y accesibilidad, y la filial española debe identificar quién lo publica y dónde puede consultarse.',
      },
      {
        id: 'd',
        text: 'La holding irlandesa, como entidad designada, salvo que la matriz designe expresamente a otra filial; la sociedad española debe identificar quién publica y dónde.',
      },
    ],
    correctOptionId: 'd',
    explanation:
      'Es el criterio de la consulta 1: puede admitirse que la dominante intermedia europea sea la entidad designada, salvo designación expresa de otra filial por la dominante última. El informe debe cubrir el grupo encabezado por la dominante última e incluir a las filiales españolas (disposición adicional 11.ª de la Ley de Auditoría de Cuentas).',
    ref: 'BOICAC 147 · Apartado 4: filiales de grupos no europeos',
  },
  {
    id: 'con-01-b4',
    prompt:
      'Para medir el grado de avance de sus contratos de mantenimiento, una empresa quiere estimar los costes totales con su experiencia histórica. ¿Qué admite el ICAC en la consulta 2 del BOICAC 147?',
    options: [
      {
        id: 'a',
        text: 'Nada: los costes deben estimarse contrato a contrato, sin datos históricos.',
        feedback: 'El ICAC acepta expresamente la información histórica como base del método de recursos.',
      },
      {
        id: 'b',
        text: 'Usar estimaciones de carteras de contratos homogéneos, si el resultado no difiere significativamente del cálculo contrato a contrato, y revisarlas cuando las previsiones cambien de forma significativa.',
      },
      {
        id: 'c',
        text: 'Reunir en una sola cartera todos los contratos de la empresa (turismos, vehículos industriales y flotas), aunque tengan características distintas.',
        feedback:
          'La cartera debe ser homogénea, con características y circunstancias similares; mezclar contratos con patrones de coste distintos rompe esa condición (art. 1.4 de la Resolución de 2021).',
      },
      {
        id: 'd',
        text: 'Fijar el porcentaje histórico al inicio y no modificarlo durante la vida del contrato.',
        feedback: 'Las estimaciones se revisan ante cambios significativos y el avance se actualiza, al menos, en cada cierre (art. 11.6 de la Resolución de 2021).',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'Las estimaciones basadas en la experiencia histórica deben obtenerse de grupos o carteras de contratos homogéneos, siempre que aplicar el criterio a la cartera no difiera significativamente de aplicarlo a cada contrato, sin perjuicio de los cambios de estimación que procedan (consulta 2; art. 1.4 de la Resolución de 2021).',
    ref: 'BOICAC 147 · Apartado 2: consulta 2',
  },
];

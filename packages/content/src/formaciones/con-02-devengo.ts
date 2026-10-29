import type { Formation, QuizQuestion } from '@flm/shared';

export const formation: Formation = {
  id: 'con-02',
  slug: 'devengo-y-periodificacion',
  area: 'contable',
  title: 'Devengo y periodificación: los ajustes de cierre, paso a paso',
  intro:
    'Es enero de 2027 y preparas el cierre de 2026 de un taller: el seguro anual pagado en octubre está entero en gastos, el alquiler cobrado por adelantado hasta abril está entero en ingresos y faltan la luz de diciembre y los intereses del préstamo, que el banco cobrará en marzo. Sin cuatro ajustes de [[devengo]], el resultado sale inflado en 3.762 € y el Impuesto sobre Sociedades parte de una cifra equivocada.',
  summary:
    'Cómo imputar cada gasto e ingreso a su ejercicio: ajustes de cierre con las cuentas 480, 485, 4109 y 527, sin el IVA, y su efecto en el Impuesto sobre Sociedades.',
  coverTerm: 'Devengo',
  readingMinutes: 11,
  outcomes: [
    'Identificar qué operaciones abiertas al cierre exigen un ajuste de periodificación y elegir la cuenta que corresponde (480, 485, 567, 568, 4009, 4109, 4309, 527 o 528).',
    'Calcular la parte de cada gasto o ingreso que pertenece al ejercicio y formular el asiento de cierre y su reversión o cancelación, sin incluir el IVA.',
    'Decidir si un gasto o un ingreso contabilizado fuera de su ejercicio obliga a ajustar la base imponible del Impuesto sobre Sociedades.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Qué es el devengo y por qué manda en el cierre', id: 'que-es-el-devengo' },
    {
      type: 'paragraph',
      text: 'El [[devengo]] es un principio contable de aplicación obligatoria recogido en el [Marco Conceptual del PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A3): los efectos de las transacciones se registran cuando ocurren y cada ejercicio recoge los gastos y los ingresos que le afectan, **con independencia de la fecha de su pago o de su cobro**. Lo mismo dicen el [artículo 38.d) del Código de Comercio](https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art38) y el [PGC de Pymes](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#A3). Ante cada operación abierta al cierre, no preguntes «¿cuándo se pagó?», sino «¿a qué periodo pertenece el consumo, el servicio o el uso?».',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Devengo',
      text: 'Un gasto o un ingreso pertenece al ejercicio en que se consume el bien o el servicio, o en que se gana el ingreso, no al del pago, el cobro o la factura. Al cierre se traduce en dos ajustes: sacar del resultado lo ya contabilizado que es del año siguiente y añadir lo devengado que aún no tiene factura o no ha vencido.',
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Lo ya contabilizado que es del año siguiente: 480 y 485', id: 'gastos-e-ingresos-anticipados' },
    {
      type: 'paragraph',
      text: 'Si ya has registrado un gasto o un ingreso que corresponde en parte al ejercicio siguiente, esa parte sale del resultado y pasa al balance. Los [[gastos anticipados]] se cargan en la 480 con abono a la cuenta del grupo 6 que recogió el gasto; los [[ingresos anticipados]] se abonan en la 485 con cargo a la cuenta del grupo 7. Si son intereses, se usan la 567 «Intereses pagados por anticipado» y la 568 «Intereses cobrados por anticipado», contra los subgrupos 66 y 76.',
    },
    {
      type: 'paragraph',
      text: 'Las cuatro cuentas se revierten al principio del ejercicio siguiente y, en el balance, figuran en «Periodificaciones a corto plazo»: la 480 y la 567 en el activo corriente, y la 485 y la 568 en el pasivo corriente ([cuentas 480 y 485](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4-2); [cuentas 567 y 568](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo5-2)).',
    },
    {
      type: 'widget',
      widget: { kind: 'periodificacion', importe: 1200, inicio: '2026-10-01', meses: 12, cierre: '2026-12-31', concepto: 'Prima de seguro anual' },
      caption: 'Seguro de 1.200 € pagado el 01/10/2026: por meses, 300,00 € son gasto de 2026 y 900,00 € van a la 480; por días, 302,47 € y 897,53 €.',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Meses o días: elige y mantén el criterio',
      text: 'El PGC no fija cómo repartir: meses y días son criterios habituales (en este seguro, 2,47 € de diferencia). Por el principio de uniformidad, mantén el método elegido mientras no cambien los supuestos que motivaron su elección, y en los intereses aplica la convención de días del contrato. Para importes escasamente significativos, la importancia relativa permite no periodificar.',
      refs: [
        { label: 'Plan General de Contabilidad, Marco Conceptual, 3.º Principios contables', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A3', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Lo devengado sin factura o sin vencer: 4009, 4109, 4309 y 527', id: 'devengado-pendiente' },
    {
      type: 'paragraph',
      text: 'El caso inverso: el gasto o el ingreso ya se ha devengado, pero falta la factura o el vencimiento. Se reconoce igualmente, con las subcuentas de [[facturas pendientes de recibir o de formalizar]]: la 4009 para proveedores de bienes del grupo 3 (y de servicios del proceso productivo); con carácter general, la 4109 para servicios y suministros del subgrupo 62, como la luz o una reparación, y la 4309 para ventas o servicios ya realizados que aún no has facturado.',
    },
    {
      type: 'paragraph',
      text: 'Con los préstamos ocurre lo mismo: los [[intereses devengados no vencidos]] se cargan en la 662 «Intereses de deudas» con abono a la 527 si el prestamista es una entidad de crédito, o a la 528 en las demás deudas del subgrupo 52 (con partes vinculadas, la 514); el PGC precisa que estas cuentas recogen los intereses del ejercicio, «incluidos los no vencidos». Si tu cliente es el acreedor, usa la 546, la 547 o, en las imposiciones a plazo, una subcuenta de la 548 (con partes vinculadas, la 533 o la 534).',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'El IVA no se periodifica',
      text: 'Periodifica bases, no cuotas: el IVA tiene su propio devengo ([art. 75 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75)). En un alquiler cobrado por adelantado se devenga al cobrar y se declara entero en ese periodo. En una factura pendiente de recibir, la cuota no se deduce hasta que tienes la factura: en ese periodo o en los siguientes, dentro de cuatro años ([arts. 97](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a97) y [99 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a99)). Y al revés: un servicio terminado en diciembre y facturado en enero devengó el IVA en diciembre; si el cliente es empresario o profesional, la factura debe expedirse antes del día 16 de enero ([art. 11.1 RD 1619/2012](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a11)).',
      refs: [
        { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido, arts. 75, 97 y 99', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75', date: '2026-10-28', kind: 'norma' },
        { label: 'Real Decreto 1619/2012, Reglamento de facturación, art. 11', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a11', date: '2026-10-28', kind: 'norma' },
      ],
    },
    {
      type: 'paragraph',
      text: 'Si falta la factura, estima el importe con datos razonables (lecturas, consumo medio, contrato). Si llega antes de formular las cuentas (en las sociedades de capital, como máximo tres meses después del cierre: [art. 253.1 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a253)), confirma una condición que ya existía al cierre, así que ajusta la estimación ([NRV 23.ª PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A23); [22.ª PGC de Pymes](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#A22)). Si llega después y la estimación era razonable, la diferencia es un **cambio de estimación** y va al resultado del ejercicio en que se conoce. Solo hay **error**, que se corrige contra reservas y reexpresando las cifras comparativas, si al formular no se usó información fiable que estaba disponible o podía obtenerse ([NRV 22.ª PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A22); [21.ª PGC de Pymes](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#A21)). La nota de FLM vinculada resume una consulta de la DGT sobre el efecto fiscal de una corrección contra reservas.',
    },
    {
      type: 'table',
      caption: '¿Qué ajuste toca al cierre?',
      columns: ['Partida', 'Ya contabilizada, pero es del año siguiente', 'Es del ejercicio, pero sin factura o sin vencer'],
      rows: [
        ['Gasto', '480 (567 si son intereses) · activo corriente', '4009 o 4109 (527 o 528 si son intereses) · pasivo corriente'],
        ['Ingreso', '485 (568 si son intereses) · pasivo corriente', '4309 (546, 547 o 548 si son intereses) · activo corriente'],
      ],
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso práctico: los cuatro ajustes de un taller', id: 'caso-practico' },
    {
      type: 'example',
      title: 'Cierre de 2026 de un taller de calderería',
      scenario:
        'Sociedad limitada ficticia que aplica el PGC de Pymes, con 2,4 M€ de cifra de negocios en 2025, y cierra el 31/12/2026; preparas los ajustes el 25/01/2027. Operaciones abiertas: (1) seguro de 1.200 €, exento de IVA, pagado el 01/10/2026 por doce meses y cargado entero en la 625; (2) local alquilado a otra empresa por 800 €/mes más IVA, cobrado el 01/11/2026 por adelantado hasta abril, con retención del 19 % y 4.800 € abonados en la 752; (3) luz de diciembre, con factura recibida el 14/01/2027 (base imponible de 462,00 €), y (4) préstamo bancario de 60.000 € recibido el 01/09/2026, al 5 % fijo, base 30/360, sin comisiones y con intereses semestrales el 01/03 y el 01/09.',
      steps: [
        {
          label: 'Seguro: nueve de los doce meses de cobertura son de 2027 y pasan a la 480.',
          formula: '1.200 € × 9/12 = 900,00 € · 480 Gastos anticipados a 625 Primas de seguros',
          result: '900,00 € (quedan 300,00 € de gasto en 2026)',
        },
        {
          label: 'Alquiler: de enero a abril es renta de 2027. Solo se periodifica la renta; el IVA (1.008,00 €) y la retención (912,00 €) no son ingreso.',
          formula: '800 € × 4 = 3.200,00 € · 752 Ingresos por arrendamientos a 485 Ingresos anticipados',
          result: '3.200,00 € (quedan 1.600,00 € de ingreso en 2026)',
        },
        {
          label: 'Luz: el consumo es de diciembre y ya tienes la factura, así que usas el importe real. El IVA se registrará con la factura, en enero.',
          formula: '628 Suministros a 4109 (facturas pendientes de recibir o de formalizar)',
          result: '462,00 €',
        },
        {
          label: 'Préstamo: de septiembre a diciembre se han devengado cuatro meses de intereses, que el banco cobrará el 01/03/2027.',
          formula: '60.000 € × 5 % × 120/360 = 1.000,00 € · 662 Intereses de deudas a 527',
          result: '1.000,00 €',
        },
        {
          label: 'Efecto en el resultado de 2026.',
          formula: '+900,00 − 3.200,00 − 462,00 − 1.000,00 = −3.762,00 €',
          result: '−3.762,00 €',
        },
        {
          label: 'En 2027: el 1 de enero reviertes la 480 y la 485; la 4109 se cancela al registrar la factura, con su IVA, y la 527, al pagar la cuota semestral.',
          formula: '01/01: 625 a 480 (900,00) y 485 a 752 (3.200,00) · 01/03: 527 (1.000,00) y 662 (500,00) a 572 (1.500,00)',
          result: '500,00 € de intereses son gasto de 2027',
        },
      ],
      conclusion:
        'Sin estos asientos, el resultado de 2026 estaría sobrevalorado en **3.762,00 €**. Con ellos, la 625 muestra 300,00 € de gasto y la 752, 1.600,00 € de ingreso, y cada importe pendiente queda en su partida del balance.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Registro y ajustes de cierre del taller (2026)',
        entries: [
          {
            date: '2026-10-01',
            concept: 'Pago del seguro anual',
            lines: [
              { account: '625', name: 'Primas de seguros', debit: 1200 },
              { account: '572', name: 'Bancos', credit: 1200 },
            ],
          },
          {
            date: '2026-11-01',
            concept: 'Cobro anticipado del alquiler',
            lines: [
              { account: '572', name: 'Bancos', debit: 4896 },
              { account: '473', name: 'Hacienda Pública, retenciones y pagos a cuenta', debit: 912 },
              { account: '752', name: 'Ingresos por arrendamientos', credit: 4800 },
              { account: '477', name: 'Hacienda Pública, IVA repercutido', credit: 1008 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Seguro: parte de 2027',
            lines: [
              { account: '480', name: 'Gastos anticipados', debit: 900 },
              { account: '625', name: 'Primas de seguros', credit: 900 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Alquiler: parte de 2027',
            lines: [
              { account: '752', name: 'Ingresos por arrendamientos', debit: 3200 },
              { account: '485', name: 'Ingresos anticipados', credit: 3200 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Luz de diciembre sin factura',
            lines: [
              { account: '628', name: 'Suministros', debit: 462 },
              { account: '4109', name: 'Acreedores por prestaciones de servicios, facturas pendientes de recibir o de formalizar', credit: 462 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Intereses devengados no vencidos',
            lines: [
              { account: '662', name: 'Intereses de deudas', debit: 1000 },
              { account: '527', name: 'Intereses a corto plazo de deudas con entidades de crédito', credit: 1000 },
            ],
          },
        ],
      },
      caption: 'Avanza asiento a asiento y fíjate en que el IVA (477) y la retención (473) no se periodifican.',
    },
    { type: 'paragraph', text: 'Antes de dar por cerrado el ejercicio de cualquier cliente, repasa:' },
    {
      type: 'list',
      items: [
        'Seguros, cuotas y suscripciones pagados por adelantado (480).',
        'Cobros anticipados registrados ya como ingreso (485).',
        'Facturas de diciembre que llegan en enero y albaranes sin factura (4009 o 4109).',
        'Entregas o servicios de diciembre sin facturar (4309), con el IVA si ya se ha devengado.',
        'Intereses devengados de préstamos, créditos y depósitos (527, 528, 546, 547 o 548).',
        'La reversión, el 1 de enero, de los ajustes del cierre anterior.',
      ],
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'El devengo en el Impuesto sobre Sociedades', id: 'impuesto-sobre-sociedades' },
    {
      type: 'paragraph',
      text: 'La base imponible del Impuesto sobre Sociedades se calcula corrigiendo el resultado contable ([art. 10.3 LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a10)) y el [artículo 11.1 LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11) adopta el devengo como regla de imputación temporal. Por eso, un ajuste de cierre que falta cambia el impuesto de dos ejercicios.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Artículo 11.3.1.º de la Ley del Impuesto sobre Sociedades',
      text: 'Los gastos y los ingresos contabilizados en un ejercicio distinto del de su devengo se imputan fiscalmente al que corresponda. **Excepción:** los gastos contabilizados *después* y los ingresos contabilizados *antes* se imputan al ejercicio en que se contabilizaron, siempre que de ello no se derive una [[tributación inferior]]. Además, no es deducible el gasto que no pasa por la cuenta de pérdidas y ganancias (o por reservas, si lo exige una norma), salvo libertad de amortización o amortización acelerada.',
      refs: [
        { label: 'Ley 27/2014, del Impuesto sobre Sociedades, art. 11', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11', date: '2026-10-28', kind: 'norma' },
      ],
    },
    {
      type: 'paragraph',
      text: 'Aplícalo al taller: es [entidad de reducida dimensión](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a101), porque no es entidad patrimonial y su cifra de negocios de 2025 (2,4 millones de euros) no llega a 10 millones. Como supera 1 millón, no le corresponde la escala de las entidades más pequeñas: tributa al 23 % en 2026 y, si sigue siendo de reducida dimensión, al 22 % en 2027 ([DT 44.ª LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#dt-6)). Sin los ajustes, ocurriría esto:',
    },
    {
      type: 'table',
      caption: 'Lectura fiscal si el taller no hubiera hecho los ajustes de 2026',
      columns: ['Operación', 'Imputación contable', 'Tratamiento fiscal', 'Ajuste en la base'],
      rows: [
        ['Seguro (900 €)', 'Gasto de 2027 llevado a 2026', 'No entra en la excepción: es gasto de 2027', '+900 € en 2026 y −900 € en 2027'],
        ['Alquiler (3.200 €)', 'Ingreso de 2027 llevado a 2026', 'Tributa en 2026: al 23 % paga más que al 22 %', 'Ninguno'],
        ['Luz (462 €)', 'Gasto de 2026 llevado a 2027', 'Se deduce en 2027: al 22 % ahorra menos que al 23 %', 'Ninguno'],
        ['Intereses (1.000 €)', 'Gasto de 2026 llevado a 2027', 'Se deducen en 2027, como la luz', 'Ninguno'],
      ],
    },
    {
      type: 'paragraph',
      text: 'Así, la base imponible de 2026 sería 4.662 € mayor (3.762 € de exceso de resultado más el ajuste del seguro) y la de 2027, 4.662 € menor: 1.072,26 € más de cuota en 2026 (al 23 %) y 1.025,64 € menos en 2027 (al 22 %). El cliente pagaría 46,62 € más, y un año antes. Es un cálculo simplificado (bases positivas, sin deducciones); si los importes son relevantes, revisa la [[tributación inferior]] con el área fiscal.',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Si el cliente es autónomo',
      text: 'En el IRPF, los rendimientos de actividades económicas siguen las reglas de imputación del Impuesto sobre Sociedades ([art. 14.1.b LIRPF](https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a14)). Pero quien solo lleva libros registro, y no contabilidad ajustada al Código de Comercio, puede optar por cobros y pagos para todas sus actividades: basta con manifestarlo en la declaración y debe mantenerse al menos tres años ([art. 7.2 RIRPF](https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a7)). Comprueba el criterio antes de periodificar.',
      refs: [
        { label: 'Ley 35/2006, del IRPF, art. 14', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a14', date: '2026-10-28', kind: 'norma' },
        { label: 'Real Decreto 439/2007, Reglamento del IRPF, art. 7', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a7', date: '2026-10-28', kind: 'norma' },
      ],
    },
  ],
  keyTerms: [
    {
      term: 'devengo',
      definition: 'Principio contable obligatorio: los gastos y los ingresos se imputan al ejercicio al que afectan, con independencia de la fecha de su pago o de su cobro.',
    },
    {
      term: 'gastos anticipados',
      definition: 'Cuenta 480: gastos contabilizados en el ejercicio que se cierra que corresponden al siguiente. Activo corriente; se revierte al principio del ejercicio siguiente. Si son intereses, la 567.',
    },
    {
      term: 'ingresos anticipados',
      definition: 'Cuenta 485: ingresos contabilizados en el ejercicio que se cierra que corresponden al siguiente. Pasivo corriente; se revierte al principio del ejercicio siguiente. Si son intereses, la 568.',
    },
    {
      term: 'facturas pendientes de recibir o de formalizar',
      definition: 'Subcuentas 4009 (proveedores) y 4109 (acreedores por servicios) para gastos devengados cuya factura falta al cierre. En ventas, la 4309.',
    },
    {
      term: 'intereses devengados no vencidos',
      definition: 'Intereses del ejercicio que se pagarán o cobrarán después del cierre: a pagar, en la 527 (entidades de crédito) o la 528 (otras deudas del subgrupo 52), con cargo a la 662; a cobrar, en la 546, la 547 o una subcuenta de la 548. Con partes vinculadas, la 514 o la 533 y la 534.',
    },
    {
      term: 'tributación inferior',
      definition: 'Límite del art. 11.3.1.º LIS: un gasto contabilizado después de su devengo, o un ingreso contabilizado antes, se imputa al ejercicio en que se contabilizó solo si de ello no resulta pagar menos impuesto del que correspondería.',
    },
  ],
  takeaway:
    'Cada gasto y cada ingreso pertenecen al ejercicio en que se consumen o se ganan, no al de su pago, su cobro o su factura. Al cierre, saca del resultado lo anticipado (480 y 485) e incorpora lo devengado pendiente (4009, 4109, 4309, 527 o 528) por su base, sin el IVA: en el Impuesto sobre Sociedades, adelantar gastos o retrasar ingresos obliga a ajustar la base.',
  sources: [
    { label: 'Real Decreto 1514/2007, Plan General de Contabilidad: Marco Conceptual, 3.º Principios contables', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A3', date: '2026-10-28', kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 4 (cuentas 400, 410, 430, 480 y 485)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4-2', date: '2026-10-28', kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 5 (cuentas 527, 528, 546, 547, 548, 567 y 568)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo5-2', date: '2026-10-28', kind: 'norma' },
    { label: 'Plan General de Contabilidad, NRV 22.ª Cambios en criterios contables, errores y estimaciones contables', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A22', date: '2026-10-28', kind: 'norma' },
    { label: 'Plan General de Contabilidad, NRV 23.ª Hechos posteriores al cierre del ejercicio', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A23', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: Marco Conceptual, 3.º Principios contables', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#A3', date: '2026-10-28', kind: 'norma' },
    { label: 'Código de Comercio, art. 38', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art38', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades, art. 11 (imputación temporal)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades, disposición transitoria cuadragésima cuarta (tipos de 2025 a 2028)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#dt-6', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 634/2015, Reglamento del Impuesto sobre Sociedades, art. 60 (rentas sujetas a retención)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-7771#a60', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido, art. 75 (devengo)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido, art. 99 (ejercicio del derecho a la deducción)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a99', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 439/2007, Reglamento del IRPF, art. 7 (imputación temporal de rendimientos)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a7', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto Legislativo 1/2010, Ley de Sociedades de Capital, art. 253 (formulación de las cuentas)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a253', date: '2026-10-28', kind: 'norma' },
  ],
  quiz: {
    id: 'con-02-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'con-02-q1',
        prompt:
          'Un cliente paga el 01/10/2026 un seguro anual de 1.200 € (cobertura del 01/10/2026 al 30/09/2027) y lo carga entero en la 625 «Primas de seguros». Su ejercicio coincide con el año natural y reparte por meses. ¿Qué asiento debe registrar a 31/12/2026?',
        options: [
          {
            id: 'a',
            text: '300 € con cargo a la 480 «Gastos anticipados» y abono a la 625.',
            feedback: '300 € es la parte devengada en 2026, que debe quedarse en la 625. Llevarla a la 480 dejaría 900 € de gasto en 2026 y solo 300 € en 2027.',
          },
          {
            id: 'b',
            text: '900 € con cargo a la 625 y abono a la 480 «Gastos anticipados».',
            feedback: 'Es el asiento de reversión del 01/01/2027. Hecho al cierre, elevaría el gasto de 2026 a 2.100 € y dejaría la 480, una cuenta de activo, con saldo acreedor.',
          },
          { id: 'c', text: '900 € con cargo a la 480 «Gastos anticipados» y abono a la 625.' },
          {
            id: 'd',
            text: 'Ninguno: el gasto es de 2026 porque se pagó en 2026.',
            feedback: 'Confunde pago con devengo: el gasto se imputa al ejercicio al que afecta, con independencia de la fecha de pago.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'Nueve de los doce meses de cobertura son de 2027: 1.200 € × 9/12 = 900 €. La 480 se carga al cierre con abono a la cuenta del grupo 6 que recogió el gasto, y en la 625 quedan los 300 € devengados en 2026.',
        ref: 'Apartado 2 · Lo ya contabilizado que es del año siguiente',
      },
      {
        id: 'con-02-q2',
        prompt:
          'La factura de la luz de diciembre de 2026 (base imponible de 462,00 € más IVA) llega el 14/01/2027, antes de que prepares el cierre. ¿Cómo la registras a 31/12/2026?',
        options: [
          {
            id: 'a',
            text: 'Cargo en la 628 «Suministros» por 462,00 € con abono a la 4109 «Acreedores por prestaciones de servicios, facturas pendientes de recibir o de formalizar».',
          },
          {
            id: 'b',
            text: 'Cargo en la 628 por 462,00 € y en la 472 «Hacienda Pública, IVA soportado» por la cuota, con abono a la 4109 por el total.',
            feedback: 'La cuota soportada no puede deducirse antes del periodo en que se recibe la factura (arts. 97 y 99 LIVA): se registra con ella, en enero de 2027. El ajuste de cierre va por la base.',
          },
          {
            id: 'c',
            text: 'No se registra nada en 2026: el gasto se contabiliza con la factura, en 2027.',
            feedback: 'Trasladaría a 2027 un gasto de 2026, contra el devengo. Además, la factura recibida antes de formular confirma una condición que ya existía al cierre.',
          },
          {
            id: 'd',
            text: 'Cargo en la 628 por 462,00 € con abono a la 4309 «Clientes, facturas pendientes de formalizar».',
            feedback: 'La 4309 recoge créditos con clientes por ventas o servicios pendientes de facturar; aquí la empresa es deudora, no acreedora.',
          },
        ],
        correctOptionId: 'a',
        explanation:
          'El consumo es de diciembre, así que el gasto es de 2026 aunque la factura llegue en enero. Para servicios y suministros del subgrupo 62, la subcuenta del cuadro es la 4109, y el ajuste se hace por la base imponible, sin el IVA.',
        ref: 'Apartado 3 · Lo devengado sin factura o sin vencer',
      },
      {
        id: 'con-02-q3',
        prompt:
          'Una entidad de reducida dimensión (tipos del 23 % en 2026 y del 22 % en 2027) no registró en 2026 los 1.000 € de intereses devengados de su préstamo y los contabiliza como gasto en 2027, al pagarlos. ¿Qué ocurre en el Impuesto sobre Sociedades?',
        options: [
          {
            id: 'a',
            text: 'No son deducibles en ningún ejercicio, porque no se contabilizaron en el de su devengo.',
            feedback: 'La no deducibilidad afecta al gasto que no se imputa contablemente en resultados (o en reservas, si lo exige una norma). Este sí se ha contabilizado, aunque en 2027.',
          },
          {
            id: 'b',
            text: 'Se deducen en 2027, porque es un gasto contabilizado después de su devengo y de ello no se deriva una tributación inferior.',
          },
          {
            id: 'c',
            text: 'Deben deducirse en 2026 mediante un ajuste negativo en la declaración de ese año.',
            feedback: 'Solo habría que llevarlos a 2026 si deducirlos en 2027 diera una tributación inferior. Con un tipo menor en 2027, el ahorro es menor (220 € frente a 230 €), no mayor.',
          },
          {
            id: 'd',
            text: 'Se deducen en 2027 en cualquier caso, aunque de ello se derive una tributación inferior.',
            feedback: 'La excepción está condicionada: si imputarlos a 2027 diera lugar a una tributación inferior, el gasto se imputaría a 2026, su ejercicio de devengo.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Según el art. 11.3.1.º LIS, los gastos contabilizados en un periodo posterior al de su devengo se imputan en el periodo en que se contabilizan si de ello no se deriva una tributación inferior. Deducir 1.000 € en 2027 ahorra 220 € (22 %), frente a 230 € (23 %) en 2026: la tributación total es mayor, no inferior.',
        ref: 'Apartado 5 · El devengo en el Impuesto sobre Sociedades',
      },
    ],
  },
  documentIds: ['doc-correcciones-is'],
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-judith-calet',
    publishedAt: '2026-10-22T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: '2026-10-28',
};

/** Banco de 4 preguntas adicionales para «Pon a prueba tus conocimientos». */
export const bank: QuizQuestion[] = [
  {
    id: 'con-02-b1',
    prompt:
      'El 01/11/2026 un cliente factura y cobra por adelantado seis meses de alquiler de un local (de noviembre de 2026 a abril de 2027), a 800 €/mes más IVA, y abona 4.800 € en la 752 «Ingresos por arrendamientos». ¿Qué saldo debe tener la 485 «Ingresos anticipados» a 31/12/2026?',
    options: [
      { id: 'a', text: '1.600 €.', feedback: '1.600 € (2 × 800 €) es el ingreso devengado en 2026, que debe permanecer en la 752.' },
      { id: 'b', text: '4.800 €.', feedback: 'Es la renta total: periodificarla entera dejaría 2026 sin los ingresos de noviembre y diciembre, que ya se han devengado.' },
      { id: 'c', text: '3.200 €.' },
      { id: 'd', text: '3.872 €.', feedback: 'Es 3.200 € × 1,21. El IVA no forma parte del ingreso, se registró en la 477 y se devengó al cobrar la renta: no se periodifica.' },
    ],
    correctOptionId: 'c',
    explanation:
      'De enero a abril de 2027 hay cuatro meses × 800 € = 3.200 €: un ingreso contabilizado en 2026 que corresponde a 2027. En el arrendamiento operativo, la renta es ingreso del ejercicio en que se devenga (NRV 8.ª PGC; NRV 7.ª PGC de Pymes).',
    ref: 'Apartado 2 · Lo ya contabilizado que es del año siguiente',
  },
  {
    id: 'con-02-b2',
    prompt:
      'Un cliente recibió el 01/09/2026 un préstamo bancario de 60.000 € al 5 % anual (base 30/360), con intereses semestrales vencidos el 01/03 y el 01/09 y sin comisiones. ¿Qué asiento procede a 31/12/2026?',
    options: [
      { id: 'a', text: '1.500 € con cargo a la 662 y abono a la 527.', feedback: '1.500 € es el semestre completo que se pagará el 01/03/2027; 500 € corresponden a enero y febrero de 2027.' },
      {
        id: 'b',
        text: '1.000 € con cargo a la 567 «Intereses pagados por anticipado» y abono a la 662.',
        feedback: 'La 567 recoge intereses ya pagados que corresponden a ejercicios siguientes; aquí no se han pagado y son de 2026: es la situación inversa.',
      },
      {
        id: 'c',
        text: '1.000 € con cargo a la 662 y abono a la 520 «Deudas a corto plazo con entidades de crédito».',
        feedback: 'La 520 recoge el principal de la deuda; los intereses devengados van a la 527, una cuenta distinta.',
      },
      { id: 'd', text: '1.000 € con cargo a la 662 «Intereses de deudas» y abono a la 527 «Intereses a corto plazo de deudas con entidades de crédito».' },
    ],
    correctOptionId: 'd',
    explanation:
      '60.000 € × 5 % × 120/360 = 1.000 € devengados de septiembre a diciembre. La 527 se abona por los intereses del ejercicio, «incluidos los no vencidos», con cargo a la 662.',
    ref: 'Apartado 3 · Lo devengado sin factura o sin vencer',
  },
  {
    id: 'con-02-b3',
    prompt:
      'Una sociedad formula sus cuentas de 2026 el 25/03/2027 sin la factura de la luz de diciembre, porque la comercializadora factura con retraso, y registró 450,00 € estimados con el consumo medio de los tres meses anteriores. La factura llega el 20/04/2027 con una base imponible de 462,00 €. ¿Cómo se tratan los 12,00 € de diferencia?',
    options: [
      {
        id: 'a',
        text: 'Como un error contable: se corrigen contra reservas y se reexpresan las cifras de 2026.',
        feedback: 'Solo hay error cuando al formular no se usó información fiable que estaba disponible o podía obtenerse; la factura llegó después de formular.',
      },
      { id: 'b', text: 'Como un cambio de estimación: mayor gasto en la 628 de 2027.' },
      {
        id: 'c',
        text: 'Se reformulan las cuentas de 2026 para recoger los 462,00 €.',
        feedback: 'La reformulación se reserva a riesgos conocidos entre la formulación y la aprobación que afecten de forma muy significativa a la imagen fiel; 12,00 € no lo hacen.',
      },
      {
        id: 'd',
        text: 'Se registran en la 480 «Gastos anticipados».',
        feedback: 'La 480 recoge gastos ya contabilizados que corresponden al ejercicio siguiente; aquí el consumo es de 2026 y no hay ningún pago adelantado.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'La estimación era razonable con la información disponible al formular y la diferencia procede de información nueva: es un cambio de estimación, que se aplica de forma prospectiva al resultado del ejercicio en que se conoce (NRV 22.ª PGC; NRV 21.ª PGC de Pymes).',
    ref: 'Apartado 3 · Lo devengado sin factura o sin vencer',
  },
  {
    id: 'con-02-b4',
    prompt:
      'Una diseñadora gráfica autónoma (actividad profesional en estimación directa simplificada, solo con libros registro) termina un encargo el 18/12/2026 y lo cobra el 15/01/2027. ¿En qué ejercicio imputa el ingreso en su IRPF?',
    options: [
      { id: 'a', text: 'En 2026, salvo que haya optado por el criterio de cobros y pagos manifestándolo en su declaración, en cuyo caso en 2027.' },
      { id: 'b', text: 'Siempre en 2027: los autónomos tributan en el IRPF por cobros y pagos.', feedback: 'La regla general es el devengo, como en el Impuesto sobre Sociedades; cobros y pagos es una opción, no la regla.' },
      { id: 'c', text: 'Siempre en 2026: el criterio de caja solo existe en el IVA.', feedback: 'El art. 7.2 RIRPF regula una opción propia del IRPF, distinta del régimen especial del criterio de caja del IVA.' },
      { id: 'd', text: 'En el ejercicio que prefiera, decidiéndolo factura a factura.', feedback: 'La opción se aplica a todas sus actividades y debe mantenerse al menos tres años; no se elige factura a factura.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Los rendimientos de actividades económicas siguen las reglas de imputación del Impuesto sobre Sociedades, es decir, el devengo (art. 14.1.b LIRPF). Pero quien solo lleva libros registro puede optar por cobros y pagos para todas sus actividades: basta con manifestarlo en la declaración y debe mantenerse al menos tres años (art. 7.2 RIRPF).',
    ref: 'Apartado 5 · El devengo en el Impuesto sobre Sociedades',
  },
];

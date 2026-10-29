import type { Formation, QuizQuestion } from '@flm/shared';

/* Fuentes (texto consolidado vigente del BOE y Sede de la AEAT, consultadas el 29/10/2026). */
const PGC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884';
const PYMES = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966';
const ICAC_IM = 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-2557';
const ICAC_II = 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-5827';
const RD_602 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2016-11954';
const LIS = 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328';
const RIS = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-7771';
const LIVA = 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740';
const RIVA = 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925';
const RF = 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696';
const AEAT_BI =
  'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-05-deducciones-devoluciones/deducciones/regularizacion-deducciones-bienes-inversion/concepto-bienes-inversion.html';
const VERIFIED = '2026-10-29';
/* Formaciones del campus que ya cubren parte del tema (enlaces internos). */
const CON_02 = '#/aprender/contable/devengo-y-periodificacion';
const CON_03 = '#/aprender/contable/amortizacion-contable-y-fiscal';
const CON_04 = '#/aprender/contable/importaciones-y-dua';
const CON_06 = '#/aprender/contable/bienes-de-inversion';
const CON_07 = '#/aprender/contable/facturas-de-anticipo';

export const formation: Formation = {
  id: 'con-05',
  slug: 'amortizaciones',
  area: 'contable',
  title: 'Amortizaciones: del alta del bien a su venta, paso a paso',
  intro:
    'Un taller de mecanizado de Granollers te envía a primeros de julio tres facturas: la del torno CNC, la del transportista y la del instalador; en la del torno aparece, además, una línea de mantenimiento de un año. El torno llegó en mayo, pero no produjo su primera pieza hasta el 1 de julio, después del montaje y las pruebas. ¿Qué parte es coste de la máquina, desde qué fecha se amortiza y qué tendrás que hacer cuando el cliente la venda dentro de cuatro años? Esta formación te da el método para responder con los documentos en la mano.',
  summary:
    'Qué se amortiza, desde cuándo y por cuánto: lee factura, albarán y acta, calcula la cuota del primer año, distingue mejora de reparación y da de baja el bien al venderlo.',
  coverTerm: 'Puesta en marcha',
  readingMinutes: 35,
  outcomes: [
    'Decidir, con la factura y sus documentos relacionados (albarán, acta de puesta en marcha, contrato), si un desembolso es inmovilizado o gasto, en qué cuenta va y si además es bien de inversión a efectos del IVA.',
    'Calcular el coste, la base amortizable y la cuota del primer año desde la puesta en condiciones de funcionamiento, y preparar el cuadro de amortización del elemento.',
    'Registrar los gastos posteriores (reparación, renovación, ampliación o mejora) y la baja o la venta del elemento, con el resultado en la 671 o la 771.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Qué se amortiza y qué no', id: 'que-se-amortiza' },
    {
      type: 'paragraph',
      text: `El grupo 2 del PGC recoge los activos «destinados a servir de forma duradera en las actividades de la empresa» ([PGC, quinta parte, grupo 2](${PGC}#grupo2-2)). Ese uso duradero, más allá del ejercicio, es la primera señal de inmovilizado. La amortización reparte su coste «de manera sistemática y racional» en función de la vida útil y del [[valor residual]] ([NRV 2.ª.2.1 PGC](${PGC}#A2-2)). Pero no todo lo que está en el grupo 2 se amortiza, ni desde el primer día:`,
    },
    {
      type: 'list',
      items: [
        '**Inmovilizado material** (subgrupo 21): maquinaria (213), otras instalaciones (215), equipos para procesos de información (217), elementos de transporte (218)… Se amortiza con cargo a la 681 y abono a la 281.',
        `**Terrenos** (210): normalmente no se amortizan, porque su vida es ilimitada. La excepción es la parte de su coste que corresponde a costes de rehabilitación activados ([NRV 3.ª.a PGC](${PGC}#A3-2)).`,
        `**Edificios** (211): sí se amortizan. Aunque compres terreno y edificio juntos, valóralos por separado y amortiza solo la construcción ([NRV 3.ª.b PGC](${PGC}#A3-2)).`,
        `**Inversiones inmobiliarias** (220 y 221): inmuebles para obtener rentas o plusvalías. Siguen los criterios del inmovilizado material y se amortizan con la 682 y la 282 ([NRV 4.ª PGC](${PGC}#A4-2)).`,
        `**Inmovilizado intangible** (subgrupo 20): desde 2016 todo intangible tiene vida útil definida y se amortiza; si no puedes estimarla con fiabilidad, en diez años ([NRV 5.ª.2 PGC](${PGC}#A5-2)). Los que antes se calificaban de vida útil indefinida se amortizan de forma prospectiva ([RD 602/2016, disposición transitoria única](${RD_602}#dt)).`,
        `**Todavía no se amortizan** el [[inmovilizado en curso]] o en montaje (subgrupo 23), porque aún no está en condiciones de funcionamiento, ni los anticipos (239 y 209), que son una entrega a cuenta y no el bien ([subgrupos 20 y 23 del PGC](${PGC}#grupo2-2)).`,
        `**No son inmovilizado**: los recambios con un ciclo de almacenamiento inferior al año son existencias ([Resolución del ICAC de 1 de marzo de 2013](${ICAC_IM}#segunda), norma segunda, apartado 2.4), y los utensilios y herramientas que no forman parte de una máquina y se usan menos de un año son gasto ([NRV 3.ª.d PGC](${PGC}#A3-2)).`,
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Suelo y construcción: sepáralos desde el alta',
      text: `El PGC exige valorar por separado el terreno y el edificio, pero no fija el método de reparto: si el cliente tiene una tasación, valora con el área si usarla. En el Impuesto sobre Sociedades, cuando no se conoce el valor del suelo, el precio se reparte entre los valores catastrales del suelo y de la construcción del año de adquisición, salvo que se pruebe otro criterio basado en el valor normal de mercado ([art. 3.2 RIS](${RIS}#a3)). Pide la escritura y el recibo del IBI.`,
      refs: [
        { label: 'Plan General de Contabilidad, NRV 3.ª, letras a) y b)', url: `${PGC}#A3-2`, date: VERIFIED, kind: 'norma' },
        { label: 'Real Decreto 634/2015, Reglamento del Impuesto sobre Sociedades, art. 3.2', url: `${RIS}#a3`, date: VERIFIED, kind: 'norma' },
      ],
    },
    { type: 'heading', text: 'Arrendamientos y obras en locales alquilados', level: 3 },
    {
      type: 'paragraph',
      text: `El nombre del contrato no decide («renting», «leasing», «alquiler con opción de compra»): para la [NRV 8.ª PGC](${PGC}#A8) es arrendamiento cualquier acuerdo de cesión de uso, sea cual sea su forma jurídica. Lo que importa es si se transfieren sustancialmente los riesgos y beneficios de la propiedad.`,
    },
    {
      type: 'list',
      items: [
        'Con opción de compra que no haya dudas razonables de ejercitar, se presume **arrendamiento financiero**. También se presume, salvo prueba en contrario, aunque no haya opción, entre otros casos: si la propiedad se transfiere al final del contrato; si el plazo cubre la mayor parte de la vida económica del bien; si el valor actual de los pagos mínimos supone la práctica totalidad de su valor razonable, o si sus características hacen que solo sea útil para el arrendatario.',
        'En el **financiero**, tu cliente registra el bien según su naturaleza (213, 218…) y una deuda (174 y 524), y lo **amortiza** como cualquier otro elemento.',
        'En el **operativo**, las cuotas son gasto (621) del periodo en que se devengan: no hay nada que amortizar.',
        `Las **obras no separables en un local alquilado** con arrendamiento operativo son inmovilizado material de tu cliente si cumplen la definición de activo. Se amortizan en la duración del contrato, incluida la prórroga si hay evidencias de que se producirá, cuando es inferior a la vida económica de las obras ([NRV 3.ª.h PGC](${PGC}#A3-2)).`,
      ],
    },
    { type: 'heading', text: 'Programas y licencias', level: 3 },
    {
      type: 'list',
      items: [
        `Se activa en la 206 Aplicaciones informáticas lo pagado por la propiedad o por el derecho de uso de programas que vayas a utilizar durante varios ejercicios ([Resolución del ICAC de 28 de mayo de 2013](${ICAC_II}#sexta), norma sexta, apartado 5.1).`,
        `Se amortiza (680 y 280) con los criterios de los gastos de desarrollo, cuya vida útil se presume, salvo prueba en contrario, no superior a cinco años ([NRV 6.ª PGC](${PGC}#A6-2)).`,
        '**Nunca** se activan el mantenimiento ni la formación del personal; tampoco las consultas y revisiones globales, ni las modernizaciones de aplicaciones existentes, salvo que sean ampliaciones o mejoras identificables (norma sexta, apartado 5.3).',
        'Si una máquina viene con el programa que necesita para funcionar en un precio global, juzga qué elemento pesa más; cada uno puede amortizarse como componente separado (norma sexta, apartado 5.4). Pide el desglose al proveedor.',
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Suscripciones en la nube',
      text: 'No hemos localizado una consulta del ICAC sobre el acceso a programas por suscripción. Lo verificado es esto: un derecho de uso plurianual va a la 206, y el mantenimiento y la formación, a gasto. Ante una cuota de acceso, lee el contrato y decide con el área antes de activar nada.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Si el cliente aplica el PGC de Pymes',
      text: `Las normas de inmovilizado tienen la misma numeración (NRV 2.ª a 6.ª) y, en lo que trata esta formación, los mismos criterios de amortización, incluida la regla de componentes; los arrendamientos son su [NRV 7.ª](${PYMES}#A7-2). Las Resoluciones del ICAC de 2013, como desarrollos del PGC, también obligan a quien aplica el PGC de Pymes ([RD 1515/2007, disposición final primera](${PYMES}#dfprimera)).`,
      refs: [
        { label: 'Real Decreto 1515/2007, PGC de Pymes, NRV 2.ª', url: `${PYMES}#A2-2`, date: VERIFIED, kind: 'norma' },
        { label: 'Real Decreto 1515/2007, disposición final primera', url: `${PYMES}#dfprimera`, date: VERIFIED, kind: 'norma' },
      ],
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Inmovilizado o bien de inversión: dos preguntas distintas', id: 'bien-de-inversion' },
    {
      type: 'paragraph',
      text: `Son dos conceptos con fines distintos. El inmovilizado decide **cómo registras y amortizas**; el [[bien de inversión]] decide **si regularizas el IVA deducido** cuando hay prorrata. Para el IVA, son bienes de inversión los bienes corporales destinados normalmente a utilizarse más de un año como instrumentos de trabajo o medios de explotación ([art. 108 LIVA](${LIVA}#a108)).`,
    },
    {
      type: 'table',
      caption: 'Inmovilizado (PGC) frente a bien de inversión (IVA)',
      columns: ['Aspecto', 'Inmovilizado (PGC)', 'Bien de inversión (art. 108 LIVA)'],
      rows: [
        ['Qué es', 'Activo que sirve de forma duradera en la actividad', 'Bien corporal usado normalmente más de un año como instrumento de trabajo o medio de explotación'],
        ['Intangibles', 'Sí: programas, licencias, derechos', 'No: solo bienes corporales'],
        ['Importe mínimo', 'No hay umbral normativo: rige la importancia relativa', 'No lo son los de valor de adquisición inferior a 3.005,06 € (500.000 pesetas)'],
        ['Recambios y reparaciones', 'Una renovación puede activarse', 'No lo son los recambios ni las obras para reparar bienes de inversión'],
        ['Para qué sirve', 'Coste, amortización y baja', 'Regularizar el IVA deducido si el porcentaje de deducción varía más de diez puntos; libro registro de bienes de inversión'],
      ],
    },
    {
      type: 'list',
      items: [
        'Un ordenador de 1.800 € que usarás cuatro años es inmovilizado (217), pero no es bien de inversión para el IVA.',
        'Una licencia de software de 20.000 € es inmovilizado intangible (206), pero tampoco es bien de inversión: no es un bien corporal.',
        `Si el cliente deduce todo el IVA y no aplica prorrata, la calificación como bien de inversión no cambia nada en el día a día. Importa cuando hay prorrata, cuando el cliente empieza a tenerla dentro del periodo de regularización ([art. 107.Dos LIVA](${LIVA}#a107)) o cuando vende el bien en ese periodo ([art. 110 LIVA](${LIVA}#a110)).`,
        'Que un bien no sea bien de inversión para el IVA no lo convierte en gasto contable, ni al revés.',
      ],
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Regularización y libro registro',
      text: `Las cuotas deducibles por bienes de inversión se regularizan durante los cuatro años naturales siguientes a su adquisición (nueve en terrenos y edificaciones); si la utilización empieza después, el año en que empieza y los cuatro (o nueve) siguientes. Solo se regulariza si el porcentaje de deducción definitivo de un año difiere en más de diez puntos del definitivo del año en que se soportó el IVA, también cuando ese año se deducía todo ([art. 107 LIVA](${LIVA}#a107)). Quien deba regularizar lleva el libro registro de bienes de inversión, con la fecha de comienzo de utilización de cada bien ([art. 65 RIVA](${RIVA}#a65)). La AEAT expresa en 3.005,06 € el límite de 500.000 pesetas ([Manual práctico de IVA 2026](${AEAT_BI})). El cálculo de la regularización se explica en la formación [«Bienes de inversión»](${CON_06}).`,
      refs: [
        { label: 'Ley 37/1992, del IVA, arts. 107 y 108', url: `${LIVA}#a107`, date: VERIFIED, kind: 'norma' },
        { label: 'Real Decreto 1624/1992, Reglamento del IVA, art. 65', url: `${RIVA}#a65`, date: VERIFIED, kind: 'norma' },
        { label: 'AEAT, Manual práctico de IVA 2026: concepto de bienes de inversión', url: AEAT_BI, date: VERIFIED, kind: 'criterio' },
      ],
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Adquisición y amortización: las tres fechas', id: 'tres-fechas' },
    {
      type: 'paragraph',
      text: 'Comprar no es empezar a amortizar. En cada alta distingue tres fechas, porque cada una decide algo distinto. La última, la [[puesta en condiciones de funcionamiento]], es la que manda en la amortización.',
    },
    {
      type: 'table',
      caption: 'Qué decide cada fecha',
      columns: ['Fecha', 'Documento', 'Qué decide'],
      rows: [
        ['Expedición de la factura (y fecha de la operación, si es distinta)', 'Factura', 'Cuándo se soporta el IVA y puede deducirse: al recibir la factura o, si es posterior, al devengo'],
        ['Entrega o recepción a conformidad', 'Albarán, CMR o acta de entrega', 'Cuándo registras el bien en el activo, con abono a la 523'],
        ['Puesta en condiciones de funcionamiento', 'Acta de puesta en marcha, certificado de instalación o informe de pruebas', 'Cuándo **empieza la amortización**, contable y fiscal'],
      ],
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Puesta en condiciones de funcionamiento',
      text: `Es el momento en que el bien, superados el montaje, la instalación y las pruebas necesarias, está disponible para su uso y puede producir ingresos con regularidad ([Resolución del ICAC de 1 de marzo de 2013](${ICAC_IM}#segunda), norma segunda, apartados 3.6.1 y 3.6.2). Desde ese día empieza la amortización contable y también la fiscal ([art. 3.3 RIS](${RIS}#a3)). No amortizas desde la factura ni desde el pago.`,
      refs: [
        { label: 'Resolución del ICAC de 1 de marzo de 2013, norma segunda, apartado 3.6', url: `${ICAC_IM}#segunda`, date: VERIFIED, kind: 'norma' },
        { label: 'Real Decreto 634/2015, Reglamento del Impuesto sobre Sociedades, art. 3.3', url: `${RIS}#a3`, date: VERIFIED, kind: 'norma' },
      ],
    },
    {
      type: 'list',
      items: [
        `**Entre la entrega y la puesta en marcha**, acumula el coste en la cuenta de montaje: 233 Maquinaria en montaje, 232 Instalaciones técnicas en montaje o 237 Equipos para procesos de información en montaje. Si al cierre el bien sigue en montaje, debe figurar ahí, sin amortizar; cuando termina, se traspasa al subgrupo 21 ([cuentas 230 a 237](${PGC}#grupo2-2)).`,
        `**Si se pagó antes de recibir el bien**, lo pagado es un anticipo: va a la 239 y se da de baja cuando el bien se incorpora, en curso o terminado, al patrimonio ([norma primera, apartado 3, de la Resolución de 2013](${ICAC_IM}#primera)). En una compra interior, el IVA del anticipo se devenga al pagarlo, por el importe pagado ([art. 75.Dos LIVA](${LIVA}#a75)); en una importación, se devenga con la importación, no con el anticipo. Relaciona la factura de anticipo con la definitiva para no duplicar coste ni IVA; el detalle está en la formación [«Facturas de anticipo»](${CON_07}).`,
        `**La amortización no se detiene** porque el bien esté parado o retirado temporalmente: solo cesa si está totalmente amortizado o se clasifica como mantenido para la venta (norma segunda, apartado 3.7). Y se registra aunque el ejercicio dé pérdidas ([Marco Conceptual del PGC, 3.º, prudencia](${PGC}#A3)).`,
      ],
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'La cuenta de montaje durante el ejercicio',
      text: 'La definición de las cuentas 230 a 237 se refiere a los trabajos pendientes al cierre del ejercicio. Usarlas también entre la entrega y la puesta en marcha dentro del mismo año es una práctica de control, no una exigencia literal: deja a la vista lo que aún no se amortiza. Lo que sí exige el PGC es que al cierre figure ahí lo que siga en montaje.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'arbol-decision',
        title: '¿Dónde registro el bien y desde cuándo lo amortizo?',
        start: 'q1',
        nodes: [
          {
            id: 'q1',
            question: '¿Has recibido el bien a conformidad (albarán o acta de entrega)?',
            options: [
              { label: 'Sí', next: 'q3' },
              { label: 'No', next: 'q2' },
            ],
          },
          {
            id: 'q2',
            question: '¿Se ha pagado algo a cuenta del bien?',
            options: [
              { label: 'Sí', next: 'r-anticipo' },
              { label: 'No', next: 'r-pedido' },
            ],
          },
          {
            id: 'q3',
            question: '¿Hay acta de puesta en marcha, certificado de instalación o informe de pruebas superadas?',
            options: [
              { label: 'Sí', next: 'r-amortiza' },
              { label: 'No', next: 'q4' },
            ],
          },
          {
            id: 'q4',
            question: '¿Necesita montaje, instalación o pruebas antes de poder producir con regularidad?',
            options: [
              { label: 'Sí', next: 'r-montaje' },
              { label: 'No', next: 'r-disponible' },
            ],
          },
          {
            id: 'r-anticipo',
            outcome: {
              title: 'Anticipo (239), sin amortizar',
              text: 'Lo pagado es una entrega a cuenta, no el bien. Se da de baja al recibirlo. El IVA se devenga con el pago: enlaza esa factura con la definitiva para no duplicar coste ni IVA.',
              tone: 'atencion',
            },
          },
          {
            id: 'r-pedido',
            outcome: {
              title: 'Todavía no hay alta',
              text: 'Con carácter general, sin recepción ni pagos a cuenta aún no registras nada en el activo: el bien se da de alta al recibirlo a conformidad, con abono a la 523. Si la factura llega antes que el bien, su IVA no se deduce hasta que se devengue.',
              tone: 'resolver',
            },
          },
          {
            id: 'r-amortiza',
            outcome: {
              title: 'Subgrupo 21: amortiza desde la fecha del acta',
              text: 'Si el coste estaba en la cuenta de montaje, trasládalo al subgrupo 21. Empieza a amortizar ese día, en contabilidad y en el Impuesto sobre Sociedades.',
              tone: 'resolver',
            },
          },
          {
            id: 'r-montaje',
            outcome: {
              title: 'Subgrupo 23, sin amortizar',
              text: 'Acumula el coste (bien, transporte, instalación y pruebas) en la cuenta de montaje y pide el acta de puesta en marcha. Si hubo anticipos, da de baja la 239. Si al cierre sigue sin funcionar, se queda en el subgrupo 23.',
              tone: 'atencion',
            },
          },
          {
            id: 'r-disponible',
            outcome: {
              title: 'Amortiza desde que está disponible para su uso',
              text: 'Si no necesita montaje ni pruebas, va directamente al subgrupo 21 y la amortización empieza cuando el bien está disponible para utilizarse. Anota en la ficha esa fecha y el documento que la acredita.',
              tone: 'resolver',
            },
          },
        ],
      },
      caption: 'Recorre el árbol con cada alta: la respuesta está en el albarán y en el acta, no en la factura.',
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Coste, base amortizable y cuota', id: 'coste-y-cuota' },
    {
      type: 'paragraph',
      text: `El coste (precio de adquisición) es el importe facturado por el vendedor, después de descuentos, más todos los gastos adicionales y directamente relacionados que se produzcan hasta la puesta en condiciones de funcionamiento, incluida la ubicación en el lugar: transporte, derechos arancelarios, seguros, instalación, montaje y similares ([NRV 2.ª.1.1 PGC](${PGC}#A2-2)). También las pruebas necesarias para que funcione ([Resolución del ICAC de 1 de marzo de 2013](${ICAC_IM}#primera), norma primera, apartado 1.6) y, si el bien necesita más de un año para estar listo, los gastos financieros devengados hasta entonces (NRV 2.ª.1).`,
    },
    {
      type: 'list',
      items: [
        'El **IVA deducible no** forma parte del coste; solo se suma el que no puedas recuperar, como la parte no deducible por prorrata (NRV 2.ª.1).',
        `El **transporte de la máquina** va a su coste, no a la 624 Transportes, que solo recoge los que no proceda incluir en el precio de adquisición del inmovilizado ([cuenta 624](${PGC}#grupo6-2)).`,
        `**No** son coste las líneas de servicios posteriores a la puesta en marcha, como el mantenimiento o la conservación: son gasto en la 622 (norma segunda, apartado 2.1, de la Resolución de 2013; [cuenta 622](${PGC}#grupo6-2)).`,
        `Si la máquina es importada, los derechos arancelarios también son coste. Cómo leer la factura del proveedor extranjero, el DUA y las facturas del transitario se explica en la formación [«Importaciones y DUA»](${CON_04}).`,
      ],
    },
    {
      type: 'paragraph',
      text: `La [[base amortizable]] es el coste menos el valor residual ([norma segunda, apartado 3.1](${ICAC_IM}#segunda)). El valor residual es lo que la empresa obtendría hoy, neto de costes de venta, por el bien si ya tuviera la antigüedad y el estado previstos al final de su vida útil ([Marco Conceptual del PGC, 6.º.10](${PGC}#A6)). Si no es significativo, se ignora (apartado 3.2.2). Fiscalmente, la base también excluye el valor residual ([art. 3.2 RIS](${RIS}#a3)).`,
    },
    { type: 'heading', text: 'Vida útil, método y cuota del primer año', level: 3 },
    {
      type: 'list',
      items: [
        `**Vida útil**: la estimas con criterio propio (uso, desgaste, obsolescencia, límites legales) y la documentas. Por qué no debe copiarse de la tabla fiscal se explica en la formación [«Amortización contable y fiscal»](${CON_03}).`,
        `**Método**: cualquiera que responda a un criterio técnico-económico, al margen de la fiscalidad. La Resolución del ICAC cita el lineal (cuota constante), el decreciente en función del valor contable y el de unidades de producción (norma segunda, apartado 3.5.2). Elegido uno, mantenlo para bienes similares ([principio de uniformidad](${PGC}#A3)).`,
        '**Unidades de producción**: una máquina con una base amortizable de 48.000 € y 20.000 horas de uso previstas se amortiza a 2,40 € la hora; si el primer año trabaja 1.500 horas, la cuota es de 3.600 €.',
        '**Primer año**: la cuota es proporcional al tiempo transcurrido desde la puesta en funcionamiento. Por meses, cuota anual × meses de uso / 12; por días, cuota anual × días de uso / 365.',
      ],
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Meses o días: un solo criterio',
      text: 'Ninguna norma consultada impone uno u otro. Elige un criterio, aplícalo igual a todos los elementos del cliente, en el primer año y en el último, y confirma con el área el que usa FLM. En el caso resuelto, la diferencia es de 19,73 €: 2.400 € por meses frente a 2.419,73 € por días.',
    },
    { type: 'heading', text: 'Componentes, cuadro y revisión anual', level: 3 },
    {
      type: 'list',
      items: [
        `**Componentes**: si una parte del bien tiene un coste significativo y una vida útil distinta, se amortiza por separado ([NRV 2.ª.2.1 PGC](${PGC}#A2-2)). El coste de las grandes reparaciones o inspecciones periódicas se identifica como componente y se amortiza hasta la siguiente ([NRV 3.ª.g PGC](${PGC}#A3-2)).`,
        '**Cuadro y ficha**: para cada elemento, un cuadro (ejercicio, cuota, amortización acumulada y valor neto contable) y una ficha con la fecha y el documento de la puesta en marcha, el coste desglosado, la vida útil y su justificación, el valor residual y el método.',
        `**Revisión al cierre**: revisa, como mínimo al cierre de cada ejercicio, el valor residual, la vida útil y el método (norma segunda, apartado 3.5.4). Si cambian por información nueva, es un cambio de estimación y se aplica de forma prospectiva, sin tocar los ejercicios anteriores ([NRV 22.ª PGC](${PGC}#A22)). Si corrige un error, el tratamiento es otro.`,
      ],
    },
    { type: 'heading', text: 'Lo fiscal, en lo imprescindible', level: 3 },
    {
      type: 'list',
      items: [
        `**Inicio**: el mismo que en contabilidad. El inmovilizado material y las inversiones inmobiliarias se amortizan desde su puesta en condiciones de funcionamiento, y el intangible, desde que puede producir ingresos ([art. 3.3 RIS](${RIS}#a3)).`,
        '**Base**: el precio de adquisición sin el valor residual; en los edificios, sin el suelo (art. 3.2 RIS).',
        `**Tabla**: para la maquinaria, coeficiente lineal máximo del 12 % y periodo máximo de 18 años ([art. 12.1.a LIS](${LIS}#a12)); es deducible cualquier coeficiente lineal entre ambos límites ([art. 4.1 RIS](${RIS}#a4)). Si la cuota contable cae en esa horquilla, no hay ajuste; si no, aplica la formación [«Amortización contable y fiscal»](${CON_03}).`,
        '**Intangible**: se amortiza según su vida útil; si no puede estimarse con fiabilidad, con el límite anual de una veinteava parte (art. 12.2 LIS).',
        '**Mejoras**: las renovaciones, ampliaciones o mejoras se amortizan en los periodos que resten de vida útil del elemento, al ritmo que marca la amortización del propio elemento (art. 3.4 RIS). Compara esa cuota con la contable.',
      ],
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Cómo identificarlo al revisar facturas y documentos', id: 'identificar' },
    {
      type: 'paragraph',
      text: 'La decisión empieza en la factura, pero rara vez termina en ella. Léela línea a línea y relaciónala con los documentos que la completan.',
    },
    { type: 'heading', text: 'Qué mirar en la factura', level: 3 },
    {
      type: 'table',
      caption: 'Campos de la factura y lo que te dicen',
      columns: ['Campo', 'Qué buscas', 'Señal'],
      rows: [
        ['Descripción y precio unitario', 'Qué se entrega o se presta, línea a línea', '«Suministro», «máquina», «equipo», «instalación», «montaje», «puesta en marcha», «licencia perpetua», «ampliación» o «reforma» apuntan a inmovilizado; «reparación», «revisión», «mantenimiento», «cuota mensual», «suscripción» o «consumibles», a gasto'],
        ['Varias líneas en la misma factura', 'Bien y servicios mezclados', 'Bien, transporte e instalación van al coste; el mantenimiento y la conservación posteriores a la puesta en marcha, a gasto. En software, también la formación del personal'],
        ['Fecha de expedición y fecha de la operación', 'Si difieren, la factura indica cuándo se hizo la operación o se recibió el pago anticipado', 'Entrega en otra fecha, «pago anticipado» o «a cuenta», o un periodo de servicio futuro (mantenimiento, licencia anual)'],
        ['Emisor', 'Proveedor del bien, transportista, instalador o entidad financiera', 'Una entidad financiera con «cuota», «arrendamiento financiero» u «opción de compra»: califica el contrato con la NRV 8.ª'],
        ['Importe unitario y del conjunto', 'Cuánto vale cada unidad', 'Sirve para tres pruebas distintas: importancia relativa (contabilidad), bien de inversión (IVA) e incentivo de 300 € (Impuesto sobre Sociedades)'],
        ['Número de serie, modelo o matrícula', 'Un bien concreto e identificable', 'Candidato a inmovilizado y a su propia ficha'],
        ['Tipo de IVA y cuota', '21 % en maquinaria, transporte e instalación', 'Si la cuota no es deducible (prorrata, operaciones exentas), la parte no deducible va al coste'],
        ['Referencias', 'Pedido, presupuesto, albarán, contrato o factura de anticipo', 'Te llevan a los documentos que completan la decisión'],
      ],
    },
    {
      type: 'paragraph',
      text: `La factura debe describir la operación con su precio unitario sin impuesto y, si es distinta de la de expedición, la fecha de la operación o del pago anticipado ([art. 6.1 del Reglamento de facturación](${RF}#a6)). El tipo general del IVA es el 21 % ([art. 90 LIVA](${LIVA}#a90)); los tipos reducidos del [art. 91 LIVA](${LIVA}#a91) no incluyen la maquinaria industrial ni su transporte o instalación.`,
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: '300 € y 3.005,06 € no son umbrales contables',
      text: `Los 300 € por unidad del [art. 12.3.e LIS](${LIS}#a12) son un incentivo fiscal para elementos nuevos del inmovilizado material: presuponen que el bien es inmovilizado y no autorizan a llevarlo a gasto en contabilidad. Los 3.005,06 € son el límite de los bienes de inversión del IVA. En contabilidad no hay umbral normativo: solo la importancia relativa, que no fija ningún importe ([Marco Conceptual del PGC, 3.º](${PGC}#A3)). Pide al cliente su política de activación por escrito y aplícala de forma uniforme.`,
      refs: [
        { label: 'Plan General de Contabilidad, Marco Conceptual, 3.º Principios contables (uniformidad e importancia relativa)', url: `${PGC}#A3`, date: VERIFIED, kind: 'norma' },
        { label: 'Ley 27/2014, del Impuesto sobre Sociedades, art. 12.3.e', url: `${LIS}#a12`, date: VERIFIED, kind: 'norma' },
        { label: 'AEAT, Manual práctico de IVA 2026: concepto de bienes de inversión', url: AEAT_BI, date: VERIFIED, kind: 'criterio' },
      ],
    },
    { type: 'heading', text: 'Documentos que completan la decisión', level: 3 },
    {
      type: 'list',
      items: [
        '**Pedido o presupuesto aceptado**: qué se compró en total; puede haber facturas de transporte e instalación de otros proveedores.',
        `**Albarán o acta de entrega**: fecha de recepción a conformidad, que da el alta con abono a la 523 ([cuenta 523](${PGC}#grupo5-2)).`,
        '**Acta de puesta en marcha, certificado de instalación o informe de pruebas**: fecha de inicio de la amortización.',
        '**Facturas de anticipo**: para dar de baja la 239 y no duplicar el coste.',
        '**Contrato** (compraventa, arrendamiento del local, renting o leasing, licencia): duración, prórrogas, opción de compra, derecho de uso y servicios incluidos.',
        '**Informe técnico o política de renovación**: vida útil y valor residual.',
        '**Escritura y recibo del IBI**, en los inmuebles: reparto entre suelo y construcción.',
      ],
    },
    { type: 'heading', text: 'Cuándo la factura no basta y qué pedir', level: 3 },
    {
      type: 'table',
      caption: 'Conceptos que obligan a pedir más documentación',
      columns: ['Concepto en la factura', 'Qué falta saber', 'Qué pedir y a quién', 'Tratamiento'],
      rows: [
        ['«Obras en local» o «reforma»', '¿Local propio o alquilado? ¿Repara o amplía y mejora? ¿Es separable? ¿Cuánto dura el alquiler?', 'Al cliente: contrato de arrendamiento (plazo y prórrogas), presupuesto detallado y qué se hace', 'Reparación, 622; mejora o ampliación, mayor valor; obra no separable en local alquilado, inmovilizado amortizado en la duración del contrato si es inferior a su vida económica'],
        ['«Licencia de software»', '¿Perpetua o temporal? ¿Para varios ejercicios? ¿Incluye mantenimiento, soporte o formación? ¿Es un acceso por suscripción?', 'Al cliente o al proveedor: contrato de licencia y desglose', 'Derecho de uso plurianual, 206; mantenimiento y formación, gasto; suscripción de acceso, consulta con el área'],
        ['«Pago a cuenta», «anticipo» o «entrega a cuenta»', '¿De qué bien? ¿Se ha entregado ya? ¿Cuál será la factura definitiva?', 'Al cliente: pedido y calendario de pagos; después, la factura final', 'Mientras no llegue el bien, 239'],
        ['«Suministro e instalación» fechada en diciembre', '¿Funciona al cierre?', 'Al cliente o al instalador: acta de puesta en marcha', 'Si sigue en montaje al cierre, subgrupo 23, sin amortizar'],
        ['«Revisión general» o «sustitución de…»', '¿Se cambia un componente significativo? ¿Aumenta la capacidad o la vida útil?', 'Al cliente o al servicio técnico: parte de trabajo e informe', 'Gasto, renovación o mejora: ver «Gastos posteriores»'],
        ['«Cuota de renting» o «cuota de leasing»', '¿Hay opción de compra? ¿Plazo frente a vida económica? ¿Valor de los pagos frente al del bien?', 'Al cliente: contrato completo y cuadro de pagos', 'Financiero: activo y deuda, y se amortiza; operativo: gasto (621)'],
        ['Máquina con «software incluido»', '¿Qué parte del precio corresponde al programa?', 'Al proveedor: desglose', 'Juzga qué elemento pesa más; cada uno puede ser un componente'],
        ['Línea de «mantenimiento» o «soporte» en la factura del bien', '¿Qué periodo cubre? ¿Cuándo se paga o es exigible el precio?', 'Al cliente o al proveedor: contrato de mantenimiento y condiciones de pago', `Gasto (622), con la parte del ejercicio siguiente en la 480 al cierre ([«Devengo y periodificación»](${CON_02})); su IVA se devenga con el pago anticipado o cuando es exigible cada parte del precio`],
        ['Máquina facturada por un proveedor de fuera de la Unión Europea, sin IVA español', '¿Cuánto se pagó de arancel y de IVA en la aduana? ¿Qué parte de la factura del transitario son sus honorarios y qué parte suplidos?', 'Al cliente o al transitario: el DUA y el desglose de la factura del transitario o representante aduanero', `Precio, arancel, transporte y despacho, al coste; el IVA de la importación, si es deducible, no. No sumes dos veces el arancel que el transitario cobra como suplido: detalle en [«Importaciones y DUA»](${CON_04})`],
        ['Elemento de importe pequeño', '¿Cuántas unidades? ¿Cuánto dura? ¿Qué política tiene el cliente?', 'Al cliente: política escrita de activación', 'Importancia relativa, aplicada de forma uniforme: no hay umbral contable normativo'],
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'clasificador',
        title: '¿Coste del bien, gasto, intangible o existencias?',
        prompt: 'Clasifica cada línea de factura de un taller de mecanizado. Piensa en qué paga y en cuándo lo consume.',
        categories: ['Coste del inmovilizado material', 'Gasto del ejercicio', 'Inmovilizado intangible (206)', 'Existencias'],
        items: [
          {
            label: 'Transporte y descarga del torno hasta el taller',
            answer: 'Coste del inmovilizado material',
            explanation: 'Gasto necesario hasta la puesta en condiciones de funcionamiento: va al coste, no a la 624 Transportes (NRV 2.ª.1.1 PGC).',
          },
          {
            label: 'Anclaje, montaje y pruebas antes del acta de puesta en marcha',
            answer: 'Coste del inmovilizado material',
            explanation: 'La instalación, el montaje y las pruebas necesarias para que el bien funcione forman parte de su coste.',
          },
          {
            label: 'Mantenimiento preventivo de 12 meses desde la puesta en marcha',
            answer: 'Gasto del ejercicio',
            explanation: 'Servicio posterior a la puesta en marcha: gasto en la 622, periodificando al cierre la parte del ejercicio siguiente.',
          },
          {
            label: 'Alimentador automático que permite un turno más sin operario',
            answer: 'Coste del inmovilizado material',
            explanation: 'Ampliación: aumenta la capacidad de la máquina y se activa como mayor valor.',
          },
          {
            label: 'Revisión anual con cambio de filtros y aceite',
            answer: 'Gasto del ejercicio',
            explanation: 'Conservación: mantiene la máquina como estaba. Gasto del ejercicio en la 622.',
          },
          {
            label: 'Licencia perpetua de un programa de gestión de la producción',
            answer: 'Inmovilizado intangible (206)',
            explanation: 'Derecho de uso de un programa que se utilizará durante varios ejercicios.',
          },
          {
            label: 'Formación del personal para usar ese programa',
            answer: 'Gasto del ejercicio',
            explanation: 'La formación del personal nunca se activa (Resolución del ICAC de 28 de mayo de 2013, norma sexta, apartado 5.3).',
          },
          {
            label: 'Recambios de uso corriente que se guardan en el almacén menos de un año',
            answer: 'Existencias',
            explanation: 'Piezas de recambio con un ciclo de almacenamiento inferior al año: van al grupo 3.',
          },
          {
            label: 'Llaves y brocas sueltas, que no forman parte de ninguna máquina y duran menos de un año',
            answer: 'Gasto del ejercicio',
            explanation: 'Utensilios y herramientas que no forman parte de una máquina y se usan menos de un año: gasto del ejercicio (NRV 3.ª.d PGC).',
          },
        ],
      },
      caption: 'Nueve líneas habituales en facturas de inmovilizado: decide antes de mirar la respuesta.',
    },

    /* ── 6 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Gastos posteriores: reparar, renovar, ampliar o mejorar', id: 'gastos-posteriores' },
    {
      type: 'paragraph',
      text: `Después del alta llegan las facturas del servicio técnico. Pregunta qué se ha hecho. Si solo mantiene el bien o lo vuelve a poner en marcha, es gasto. Si sustituye una parte o le da más capacidad, productividad o vida útil, se activa ([NRV 3.ª.f PGC](${PGC}#A3-2)).`,
    },
    {
      type: 'table',
      caption: 'Qué se activa y qué es gasto',
      columns: ['Actuación', 'Qué es', 'Tratamiento'],
      rows: [
        ['Reparación', 'Volver a poner el bien en funcionamiento', 'Gasto (622)'],
        ['Conservación y mantenimiento', 'Mantenerlo en buenas condiciones, con la misma capacidad', 'Gasto (622)'],
        ['Renovación o sustitución', 'Recuperar las características iniciales del bien', 'Se activa lo nuevo y se da de baja lo sustituido, con su amortización acumulada; si no conoces su valor, el coste de la renovación sirve de indicio'],
        ['Ampliación', 'Incorporar elementos nuevos que dan más capacidad', 'Mayor valor del bien'],
        ['Mejora', 'Alterar el bien para aumentar su eficiencia', 'Mayor valor si aumenta la capacidad, mejora sustancialmente la productividad o alarga la vida útil'],
        ['Gran reparación o inspección periódica', 'Revisión general recurrente', 'Componente que se amortiza hasta la siguiente; al hacerla, se activa y se da de baja lo pendiente de la anterior'],
        ['Piezas de recambio', 'Repuestos', 'Existencias si se almacenan menos de un año; los repuestos de seguridad de elementos concretos van con el bien y se amortizan con él'],
      ],
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Ampliación o mejora',
      text: `Una [[ampliación o mejora]] se activa como mayor valor del bien solo si produce una o varias de estas consecuencias: aumento de su capacidad, mejora sustancial de su productividad o alargamiento de su vida útil, con el límite de su importe recuperable ([Resolución del ICAC de 1 de marzo de 2013](${ICAC_IM}#segunda), norma segunda, apartado 2.3). La reparación y la conservación, en cambio, son gasto del ejercicio en que se producen (apartado 2.1).`,
      refs: [
        { label: 'Resolución del ICAC de 1 de marzo de 2013, norma segunda, apartados 2.1 a 2.4', url: `${ICAC_IM}#segunda`, date: VERIFIED, kind: 'norma' },
        { label: 'Plan General de Contabilidad, NRV 3.ª, letras f) y g)', url: `${PGC}#A3-2`, date: VERIFIED, kind: 'norma' },
      ],
    },
    {
      type: 'list',
      items: [
        `Lo activado como ampliación o mejora se amortiza en la vida útil que le corresponda; si comparte la del bien, en la vida útil restante. Fiscalmente, en los periodos que resten de vida útil del elemento, con el coeficiente que fija el [art. 3.4 RIS](${RIS}#a3).`,
        `Aunque la factura diga «reparación», si se sustituye un componente del bien, como el grupo hidráulico del ejemplo siguiente, el elemento sustituido se contabiliza como en la renovación ([norma segunda, apartado 2.1, de la Resolución de 2013](${ICAC_IM}#segunda)).`,
        'En la renovación, da de baja a la vez el elemento sustituido con su amortización acumulada (apartado 2.2). Si no lo haces, el activo recoge dos veces la misma pieza.',
        `En los intangibles, la regla es la contraria: los desembolsos posteriores al reconocimiento son, con carácter general, gasto ([Resolución del ICAC de 28 de mayo de 2013](${ICAC_II}#cuaa), norma cuarta, apartado 1.2). En las aplicaciones informáticas, las modernizaciones solo se activan si son ampliaciones o mejoras identificables (norma sexta, apartado 5.3).`,
      ],
    },
    {
      type: 'example',
      title: 'Plegadora: revisión, alimentador y grupo hidráulico en la misma visita',
      scenario:
        'El taller tiene una plegadora puesta en funcionamiento el 01/07/2024. Coste: 96.000 €, de los que la factura de compra desglosaba 12.000 € para el grupo hidráulico, con la misma vida útil. Vida útil: 12 años, sin valor residual; cuota lineal de 8.000 € al año (1.000 € del grupo hidráulico). El 30/06/2028 el servicio técnico emite tres facturas con IVA del 21 %, deducible: (a) revisión anual con cambio de filtros y aceite, 1.500 €; (b) alimentador automático de chapa que permite un turno más sin operario, 8.000 €, y (c) grupo hidráulico nuevo que sustituye al averiado, 12.000 €.',
      steps: [
        { label: 'Amortiza hasta la fecha toda la plegadora (enero a junio de 2028).', formula: '8.000 € × 6/12', result: '4.000 €; acumulada al 30/06/2028: 32.000 € (4.000 € del grupo hidráulico)' },
        { label: 'Revisión anual: es conservación.', formula: '622 Reparaciones y conservación', result: '1.500 € de gasto' },
        { label: 'Alimentador: aumenta la capacidad, es una ampliación.', formula: '213 Maquinaria', result: '8.000 € de mayor valor' },
        { label: 'Grupo hidráulico nuevo: renovación. Activas el nuevo y das de baja el sustituido, sin valor de recuperación.', formula: '12.000 € − 4.000 € de amortización acumulada', result: 'Pérdida de 8.000 € (671)' },
        { label: 'Resto de la plegadora, en los 8 años que le quedan.', formula: '[(96.000 − 12.000) − (32.000 − 4.000)] / 8 = 56.000 / 8', result: '7.000 € al año' },
        { label: 'Alimentador y grupo nuevo, en la vida útil restante: se estima que durarán lo que le queda a la máquina.', formula: '8.000 / 8 + 12.000 / 8', result: '1.000 € + 1.500 € al año' },
        { label: 'Amortización de julio a diciembre de 2028.', formula: '(7.000 + 1.000 + 1.500) × 6/12', result: '4.750 €; desde 2029, 9.500 € al año' },
      ],
      conclusion:
        'Al 31/12/2028, la 213 suma 104.000 € y la 2813, 32.750 €: valor neto contable de 71.250 €. En el IVA, el alimentador es un bien corporal nuevo de más de 3.005,06 €. El grupo hidráulico se compra para reparar un bien de inversión, y el art. 108.Dos LIVA excluye de los bienes de inversión los recambios para reparación: su calificación debe confirmarla el área fiscal. Solo importa si hay prorrata.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Plegadora: registro de la visita del servicio técnico (2028)',
        entries: [
          {
            date: '2028-06-30',
            concept: 'Amortización de enero a junio',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4000 },
              { account: '2813', name: 'Amortización acumulada de maquinaria', credit: 4000 },
            ],
          },
          {
            date: '2028-06-30',
            concept: 'Revisión anual (conservación)',
            lines: [
              { account: '622', name: 'Reparaciones y conservación', debit: 1500 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 315 },
              { account: '410', name: 'Acreedores por prestaciones de servicios', credit: 1815 },
            ],
          },
          {
            date: '2028-06-30',
            concept: 'Alimentador automático (ampliación)',
            lines: [
              { account: '213', name: 'Maquinaria', debit: 8000 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 1680 },
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', credit: 9680 },
            ],
          },
          {
            date: '2028-06-30',
            concept: 'Grupo hidráulico nuevo (renovación)',
            lines: [
              { account: '213', name: 'Maquinaria', debit: 12000 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 2520 },
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', credit: 14520 },
            ],
          },
          {
            date: '2028-06-30',
            concept: 'Baja del grupo hidráulico sustituido',
            lines: [
              { account: '2813', name: 'Amortización acumulada de maquinaria', debit: 4000 },
              { account: '671', name: 'Pérdidas procedentes del inmovilizado material', debit: 8000 },
              { account: '213', name: 'Maquinaria', credit: 12000 },
            ],
          },
          {
            date: '2028-12-31',
            concept: 'Amortización de julio a diciembre',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4750 },
              { account: '2813', name: 'Amortización acumulada de maquinaria', credit: 4750 },
            ],
          },
        ],
      },
      caption: 'Solo los movimientos de 2028: a 1 de enero, la 213 tenía 96.000 € y la 2813, 28.000 €. Fíjate en que el grupo viejo sale de la 213 y de la 2813 a la vez.',
    },

    /* ── 7 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Bajas y ventas', id: 'bajas-y-ventas' },
    {
      type: 'list',
      ordered: true,
      items: [
        `**Amortiza hasta la fecha de la baja.** La dotación del año llega hasta el día de la venta o del siniestro: el resultado se calcula con el valor contable en esa fecha ([NRV 2.ª.3 PGC](${PGC}#A2-2)). La amortización solo se habría detenido antes si el bien se hubiera clasificado como mantenido para la venta ([norma segunda, apartado 3.7](${ICAC_IM}#segunda)).`,
        `**Da de baja** el coste, con abono a la cuenta del subgrupo 21, y la amortización acumulada, con cargo a la 281 ([cuenta 281](${PGC}#grupo2-2)).`,
        `**Calcula el resultado**: importe obtenido, neto de costes de venta, menos valor contable. El beneficio va a la 771 y la pérdida a la 671 ([cuenta 671](${PGC}#grupo6-2) y [cuenta 771](${PGC}#grupo7-2)), dentro del resultado de explotación ([norma cuarta, apartado 1.2, de la Resolución del ICAC de 1 de marzo de 2013](${ICAC_IM}#cuaa)).`,
        `**No es una venta ordinaria**: el cobro pendiente a un año o menos va a la 543, no a la 430, y el ingreso no va a la 700 ([cuenta 543](${PGC}#grupo5-2)).`,
        '**Siniestro**: el bien inutilizado por un incendio, una inundación u otro siniestro se da de baja por su valor en libros con un gasto; la indemnización del seguro se reconoce solo cuando es prácticamente cierta (norma cuarta, apartado 2.3).',
        `**Bien de inversión**: si se vende dentro del periodo de regularización, hay una regularización única por el tiempo que falta ([art. 110 LIVA](${LIVA}#a110)), y se da de baja en el libro registro de bienes de inversión ([art. 65 RIVA](${RIVA}#a65)).`,
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'El IVA de la venta',
      text: `Vendida a un comprador en España, la maquinaria industrial usada tributa al tipo general del 21 %: no tiene tipo reducido en el art. 91 ([art. 90 LIVA](${LIVA}#a90)). Si la máquina sale de España hacia el comprador, consulta con el área fiscal. En una venta interior, solo estaría exenta si el bien se hubiera usado en operaciones exentas sin derecho a deducir el IVA de su compra, y nunca por esa vía si es un bien de inversión vendido durante su periodo de regularización ([art. 20.Uno.24.º LIVA](${LIVA}#a20)). Los inmuebles tienen su propio régimen (segundas entregas de edificaciones, art. 20.Uno.22.º), que esta formación no desarrolla: consúltalo con el área fiscal. Con deducción plena y venta sujeta y no exenta, la regularización única no tiene efecto.`,
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 20.Uno, números 22.º y 24.º', url: `${LIVA}#a20`, date: VERIFIED, kind: 'norma' },
        { label: 'Ley 37/1992, del IVA, arts. 90 y 110', url: `${LIVA}#a110`, date: VERIFIED, kind: 'norma' },
      ],
    },

    /* ── 8 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Procedimiento paso a paso', id: 'procedimiento' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Reúne el expediente**: facturas del proveedor, del transportista y del instalador, pedido, albarán, acta de puesta en marcha y, si existen, contrato y facturas de anticipo.',
        '**Clasifica cada línea** de cada factura: bien, gasto necesario hasta la puesta en marcha (coste) o servicio posterior (gasto).',
        '**Decide la naturaleza y la cuenta**: subgrupo 21 (material), 20 (intangible), 22 (inversión inmobiliaria), 23 (en montaje o anticipo), grupo 3 (recambios que rotan en menos de un año) o grupo 6 (gasto). Si es un arrendamiento, califícalo antes con la NRV 8.ª.',
        '**Comprueba el IVA**: el tipo (21 %, salvo los reducidos del art. 91), si es deducible (si no, va al coste) y si el bien es bien de inversión (corporal, más de un año y al menos 3.005,06 €) para el libro registro y la regularización.',
        '**Registra el alta** al recibir el bien, con abono a la 523. Si hay montaje, usa el subgrupo 23 hasta la puesta en marcha. Da de baja los anticipos.',
        '**Fija la fecha de puesta en condiciones de funcionamiento** con el acta o un documento equivalente, y traspasa el coste del subgrupo 23 al 21.',
        '**Calcula el coste total y la base amortizable**: coste menos valor residual, si es significativo.',
        '**Estima y documenta** la vida útil, el valor residual y el método, e identifica los componentes significativos con vida útil distinta.',
        '**Calcula la cuota del primer año** por meses o por días, con el criterio habitual del cliente, y prepara el cuadro de amortización y la ficha del elemento.',
        `**Contrasta con la tabla fiscal** (art. 12.1.a LIS y art. 4.1 RIS). Si la cuota se sale de la horquilla, aplica la formación [«Amortización contable y fiscal»](${CON_03}).`,
        '**En cada cierre**, dota la amortización aunque el bien esté parado o haya pérdidas, y revisa la vida útil, el valor residual y el método.',
        '**Ante cada gasto posterior**, decide si es reparación o conservación (gasto) o renovación, ampliación o mejora (activo, con baja de lo sustituido), y actualiza el cuadro.',
        '**En la baja o la venta**, dota la amortización hasta la fecha, da de baja el coste y la amortización acumulada, registra el resultado en la 671 o la 771 y el IVA repercutido, y da de baja el bien en el libro registro de bienes de inversión si procede.',
      ],
    },

    /* ── 9 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso resuelto: el torno CNC, del alta a la venta', id: 'caso-torno' },
    {
      type: 'paragraph',
      text: 'Volvemos al taller de Granollers: una sociedad limitada con ejercicio natural que deduce todo el IVA, sin prorrata. Compra el torno a un fabricante nacional. Estos son los documentos del expediente:',
    },
    {
      type: 'table',
      caption: 'Expediente del torno CNC',
      columns: ['Documento', 'Fecha', 'Contenido', 'Base', 'IVA 21 %', 'Total'],
      rows: [
        ['Factura del fabricante, con albarán del mismo día (pagada a la entrega)', '20/05/2026', 'Torno CNC', '48.000 €', '10.080 €', '58.080 €'],
        ['Misma factura, segunda línea', '20/05/2026', 'Mantenimiento preventivo, 12 meses desde la puesta en marcha', '2.400 €', '504 €', '2.904 €'],
        ['Factura del transportista', '20/05/2026', 'Transporte y descarga del torno', '1.000 €', '210 €', '1.210 €'],
        ['Factura del instalador', '30/06/2026', 'Anclaje, conexión eléctrica, montaje y pruebas', '3.000 €', '630 €', '3.630 €'],
        ['Acta de puesta en marcha', '01/07/2026', 'Pruebas superadas; empieza a producir', '—', '—', '—'],
      ],
      numeric: [3, 4, 5],
    },
    {
      type: 'example',
      title: 'Torno CNC: coste, cuota, cuadro y venta',
      scenario:
        'La factura del fabricante se paga a la entrega; el transporte y la instalación, el 15/07/2026. Vida útil estimada: 10 años, según el informe técnico y la experiencia del taller. Valor residual estimado: 4.000 €, significativo (casi un 8 % del coste). Método lineal, con la cuota del primer año por meses. El 30/09/2030 el taller vende el torno a otra empresa por 36.000 € más IVA, a cobrar en 30 días.',
      steps: [
        { label: 'Coste: bien, transporte e instalación con pruebas. El mantenimiento es gasto (622).', formula: '48.000 + 1.000 + 3.000', result: '52.000 €' },
        { label: 'Base amortizable.', formula: '52.000 − 4.000 de valor residual', result: '48.000 €' },
        { label: 'Cuota anual lineal.', formula: '48.000 / 10 años', result: '4.800 € (400 € al mes)' },
        { label: 'Cuota de 2026, desde el 1 de julio, por meses.', formula: '4.800 × 6/12', result: '2.400 € (por días, 4.800 × 184/365 = 2.419,73 €)' },
        { label: 'Contraste fiscal con la horquilla de la maquinaria: del 5,56 % (100 / 18 años) al 12 %.', formula: '4.800 / 48.000 = 10 % · 4.800 / 52.000 = 9,23 %', result: 'Dentro de la horquilla con cualquiera de las dos lecturas: sin ajustes' },
        { label: 'Mantenimiento: 200 € al mes de julio de 2026 a junio de 2027. Al cierre, la parte de 2027 pasa a la 480.', formula: '2.400 × 6/12', result: '1.200 € de gasto en 2026 y 1.200 € en 2027' },
        { label: 'Amortización hasta la venta (enero a septiembre de 2030).', formula: '400 × 9', result: '3.600 €' },
        { label: 'Amortización acumulada y valor contable al 30/09/2030.', formula: '2.400 + 3 × 4.800 + 3.600 = 20.400 · 52.000 − 20.400', result: 'Valor contable: 31.600 €' },
        { label: 'Resultado de la venta.', formula: '36.000 − 31.600', result: '+4.400 € en la 771' },
        { label: 'IVA de la venta: entrega sujeta y no exenta.', formula: '36.000 × 21 %', result: '7.560 €; crédito en la 543 por 43.560 €' },
      ],
      conclusion:
        'La factura fija el coste; el acta, el inicio. El torno amortiza 2.400 € en 2026 y 4.800 € al año después, y al venderse en 2030 deja un beneficio de 4.400 €. Como la amortización contable cabe en la tabla, el valor fiscal coincide con el contable y el beneficio tributa tal como está, sin ajustes. El torno es bien de inversión y 2030 cae dentro del periodo de regularización (2026 y los cuatro años siguientes): hay regularización única, sin efecto porque la deducción fue plena y la venta está sujeta y no exenta, y se da de baja en el libro registro si se llevaba.',
    },
    {
      type: 'table',
      caption: 'Cuadro de amortización del torno (sin venta)',
      columns: ['Ejercicio', 'Meses', 'Cuota', 'Amortización acumulada', 'Valor neto contable'],
      rows: [
        ['Alta (01/07/2026)', '—', '—', '0 €', '52.000 €'],
        ['2026', '6', '2.400 €', '2.400 €', '49.600 €'],
        ['2027', '12', '4.800 €', '7.200 €', '44.800 €'],
        ['2028', '12', '4.800 €', '12.000 €', '40.000 €'],
        ['2029', '12', '4.800 €', '16.800 €', '35.200 €'],
        ['2030', '12', '4.800 €', '21.600 €', '30.400 €'],
        ['2031', '12', '4.800 €', '26.400 €', '25.600 €'],
        ['2032', '12', '4.800 €', '31.200 €', '20.800 €'],
        ['2033', '12', '4.800 €', '36.000 €', '16.000 €'],
        ['2034', '12', '4.800 €', '40.800 €', '11.200 €'],
        ['2035', '12', '4.800 €', '45.600 €', '6.400 €'],
        ['2036 (hasta el 30/06)', '6', '2.400 €', '48.000 €', '4.000 € (valor residual)'],
        ['Total', '120', '48.000 €', '', ''],
      ],
      numeric: [1, 2, 3, 4],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'El IVA del mantenimiento',
      text: `Las cuotas se entienden soportadas al recibir la factura o, si es posterior, al devengo ([art. 99.Cuatro LIVA](${LIVA}#a99)): la deducción no espera a la puesta en marcha. El torno, el transporte y la instalación ya se han entregado o prestado en la fecha de su factura. El mantenimiento, en cambio, se prestará de julio de 2026 a junio de 2027: aquí su IVA se devenga el 20/05/2026 porque se paga por anticipado con la factura ([art. 75.Dos LIVA](${LIVA}#a75)). Si se pagara después, se devengaría cuando fuera exigible cada parte del precio (art. 75.Uno.7.º) y no podrías deducirlo antes. Cómo registrar en ese caso la cuota aún no devengada y en qué autoliquidación deducirla, decídelo con el área fiscal.`,
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 75 (devengo)', url: `${LIVA}#a75`, date: VERIFIED, kind: 'norma' },
        { label: 'Ley 37/1992, del IVA, art. 99 (ejercicio del derecho a la deducción)', url: `${LIVA}#a99`, date: VERIFIED, kind: 'norma' },
      ],
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: '523 o 410',
      text: `La 523 recoge las deudas con suministradores de bienes del grupo 2 ([cuenta 523](${PGC}#grupo5-2)). Aquí se usa para el fabricante, el transportista y el instalador, porque su cargo va al grupo 2, y la 410 para la línea de mantenimiento. Es un criterio razonable, no el único: confírmalo con el área si el cliente usa otro.`,
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Torno CNC: del alta a la venta (2026-2030)',
        entries: [
          {
            date: '2026-05-20',
            concept: 'Factura del fabricante: torno y mantenimiento',
            lines: [
              { account: '233', name: 'Maquinaria en montaje', debit: 48000 },
              { account: '622', name: 'Reparaciones y conservación', debit: 2400 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 10584 },
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', credit: 58080 },
              { account: '410', name: 'Acreedores por prestaciones de servicios', credit: 2904 },
            ],
          },
          {
            date: '2026-05-20',
            concept: 'Pago al fabricante a la entrega',
            lines: [
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', debit: 58080 },
              { account: '410', name: 'Acreedores por prestaciones de servicios', debit: 2904 },
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', credit: 60984 },
            ],
          },
          {
            date: '2026-05-20',
            concept: 'Factura del transportista',
            lines: [
              { account: '233', name: 'Maquinaria en montaje', debit: 1000 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 210 },
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', credit: 1210 },
            ],
          },
          {
            date: '2026-06-30',
            concept: 'Factura del instalador: montaje y pruebas',
            lines: [
              { account: '233', name: 'Maquinaria en montaje', debit: 3000 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 630 },
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', credit: 3630 },
            ],
          },
          {
            date: '2026-07-01',
            concept: 'Acta de puesta en marcha: traspaso a la 213',
            lines: [
              { account: '213', name: 'Maquinaria', debit: 52000 },
              { account: '233', name: 'Maquinaria en montaje', credit: 52000 },
            ],
          },
          {
            date: '2026-07-15',
            concept: 'Pago del transporte y de la instalación',
            lines: [
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', debit: 4840 },
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', credit: 4840 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Amortización de 2026 (julio a diciembre)',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 2400 },
              { account: '2813', name: 'Amortización acumulada de maquinaria', credit: 2400 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Mantenimiento de enero a junio de 2027',
            lines: [
              { account: '480', name: 'Gastos anticipados', debit: 1200 },
              { account: '622', name: 'Reparaciones y conservación', credit: 1200 },
            ],
          },
          {
            date: '2027-01-01',
            concept: 'Imputación a 2027 del mantenimiento anticipado',
            lines: [
              { account: '622', name: 'Reparaciones y conservación', debit: 1200 },
              { account: '480', name: 'Gastos anticipados', credit: 1200 },
            ],
          },
          {
            date: '2027-12-31',
            concept: 'Amortización de 2027',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4800 },
              { account: '2813', name: 'Amortización acumulada de maquinaria', credit: 4800 },
            ],
          },
          {
            date: '2028-12-31',
            concept: 'Amortización de 2028',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4800 },
              { account: '2813', name: 'Amortización acumulada de maquinaria', credit: 4800 },
            ],
          },
          {
            date: '2029-12-31',
            concept: 'Amortización de 2029',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4800 },
              { account: '2813', name: 'Amortización acumulada de maquinaria', credit: 4800 },
            ],
          },
          {
            date: '2030-09-30',
            concept: 'Amortización de enero a septiembre de 2030',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 3600 },
              { account: '2813', name: 'Amortización acumulada de maquinaria', credit: 3600 },
            ],
          },
          {
            date: '2030-09-30',
            concept: 'Venta y baja del torno',
            lines: [
              { account: '2813', name: 'Amortización acumulada de maquinaria', debit: 20400 },
              { account: '543', name: 'Créditos a corto plazo por enajenación de inmovilizado', debit: 43560 },
              { account: '213', name: 'Maquinaria', credit: 52000 },
              { account: '477', name: 'Hacienda Pública, IVA repercutido', credit: 7560 },
              { account: '771', name: 'Beneficios procedentes del inmovilizado material', credit: 4400 },
            ],
          },
          {
            date: '2030-10-30',
            concept: 'Cobro de la venta',
            lines: [
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', debit: 43560 },
              { account: '543', name: 'Créditos a corto plazo por enajenación de inmovilizado', credit: 43560 },
            ],
          },
        ],
      },
      caption: 'Avanza asiento a asiento: la 233 se vacía con el acta, la 480 se revierte el 1 de enero y, al vender, la 213 y la 2813 quedan a cero.',
    },
    {
      type: 'paragraph',
      text: 'Si el taller vendiera el torno por 30.000 € más IVA (6.300 €), el resultado sería 30.000 − 31.600 = −1.600 €, una pérdida en la 671:',
    },
    {
      type: 'table',
      caption: 'Variante con pérdida: venta del 30/09/2030 por 30.000 € más IVA',
      columns: ['Cuenta', 'Debe', 'Haber'],
      rows: [
        ['2813 Amortización acumulada de maquinaria', '20.400,00', ''],
        ['543 Créditos a corto plazo por enajenación de inmovilizado', '36.300,00', ''],
        ['671 Pérdidas procedentes del inmovilizado material', '1.600,00', ''],
        ['213 Maquinaria', '', '52.000,00'],
        ['477 Hacienda Pública, IVA repercutido', '', '6.300,00'],
        ['Total', '58.300,00', '58.300,00'],
      ],
      numeric: [1, 2],
    },

    /* ── 10 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Errores frecuentes y cómo evitarlos', id: 'errores' },
    {
      type: 'list',
      items: [
        '**Amortizar desde la fecha de la factura o del pago.** La amortización empieza con la puesta en condiciones de funcionamiento. *Cómo evitarlo:* pide siempre el acta de puesta en marcha y, si al cierre el bien sigue en montaje, déjalo en el subgrupo 23 sin amortizar.',
        '**Llevar a gasto el transporte o la instalación, o activar el mantenimiento incluido en la factura de la máquina.** El transporte y la instalación son coste; el mantenimiento y la conservación posteriores a la puesta en marcha, gasto (en software, también la formación del personal). *Cómo evitarlo:* lee la factura línea a línea y separa antes de contabilizar.',
        '**Usar los 300 € del Impuesto sobre Sociedades o los 3.005,06 € del IVA como umbral para activar.** Son reglas fiscales con otros fines; en contabilidad no hay umbral normativo, sino importancia relativa. *Cómo evitarlo:* pide al cliente su política de activación por escrito y aplícala de forma uniforme.',
        '**Activar reparaciones, llevar a gasto mejoras o activar una sustitución sin dar de baja la pieza vieja.** *Cómo evitarlo:* pregunta qué se ha hecho y qué efecto tiene (capacidad, productividad, vida útil) y, si se sustituye un componente, localiza su coste y su amortización acumulada.',
        '**Vender el bien sin dotar la amortización del año, o registrar la venta en la 700 contra la 430.** Infla el valor contable y desplaza el resultado. *Cómo evitarlo:* dota la amortización hasta la fecha de venta, da de baja el coste y la amortización acumulada y lleva la diferencia a la 671 o a la 771, con el cobro en la 543.',
        '**Amortizar el terreno o dejar de amortizar la máquina parada.** *Cómo evitarlo:* separa suelo y construcción desde el alta y dota la amortización en cada cierre mientras el bien siga en el balance.',
      ],
    },

    /* ── 11 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Lista de comprobación', id: 'comprobacion' },
    { type: 'paragraph', text: 'Antes de cerrar el expediente de cada elemento, comprueba que:' },
    {
      type: 'list',
      items: [
        'Tienes la factura, el albarán y el acta de puesta en marcha (o un documento equivalente) de cada alta, y el contrato si hay arrendamiento, licencia u obras en un local alquilado.',
        'Cada línea de cada factura está clasificada como coste del bien, gasto necesario hasta la puesta en marcha (coste) o servicio posterior (gasto).',
        'El coste incluye el transporte, la instalación, el montaje y las pruebas, y excluye el IVA deducible y el mantenimiento.',
        'El bien figura en la cuenta que le corresponde (subgrupo 21, 20, 22 o 23) y la deuda con su proveedor, en la 523.',
        'La fecha de inicio de la amortización es la de la puesta en condiciones de funcionamiento, no la de la factura.',
        'La ficha del elemento recoge la vida útil, el valor residual y el método, con su justificación, y los componentes significativos.',
        'La cuota del primer año está calculada por meses o por días, con el mismo criterio que el resto de elementos del cliente.',
        'La cuota cabe en la horquilla de la tabla fiscal o, si no, has aplicado la formación «Amortización contable y fiscal».',
        'Has decidido si es bien de inversión a efectos del IVA y, si hay prorrata, lo has anotado en el libro registro.',
        'En las bajas y las ventas, has dotado la amortización hasta la fecha y el resultado está en la 671 o la 771, con el IVA repercutido y el cobro en la 543.',
      ],
    },
  ],
  keyTerms: [
    {
      term: 'puesta en condiciones de funcionamiento',
      definition: 'Momento en que el bien, tras el montaje, la instalación y las pruebas necesarias, está disponible para su uso y puede producir con regularidad. Marca el inicio de la amortización contable y fiscal.',
    },
    {
      term: 'base amortizable',
      definition: 'Valor amortizable o base de amortización: coste del bien menos su valor residual. Es lo que se reparte durante la vida útil.',
    },
    {
      term: 'valor residual',
      definition: 'Importe que la empresa obtendría hoy, neto de costes de venta, por el bien si ya tuviera la antigüedad y el estado previstos al final de su vida útil. Se ignora si no es significativo.',
    },
    {
      term: 'inmovilizado en curso',
      definition: 'Bien recibido o en construcción que aún no está en condiciones de funcionamiento (subgrupo 23; por ejemplo, la 233 Maquinaria en montaje). No se amortiza hasta su traspaso al subgrupo 21.',
    },
    {
      term: 'bien de inversión',
      definition: 'A efectos del IVA, bien corporal destinado normalmente a usarse más de un año como instrumento de trabajo o medio de explotación, con un valor de adquisición de al menos 3.005,06 €. Sirve para regularizar el IVA deducido; no decide el tratamiento contable.',
    },
    {
      term: 'ampliación o mejora',
      definition: 'Actuación sobre el bien que aumenta su capacidad, mejora sustancialmente su productividad o alarga su vida útil. Se activa como mayor valor, a diferencia de la reparación y la conservación, que son gasto.',
    },
  ],
  takeaway:
    'La factura dice cuánto cuesta el bien; el acta de puesta en marcha dice cuándo empieza a amortizarse. Activa todo lo necesario para que funcione y nada de lo que solo lo mantiene, y al darlo de baja amortiza hasta el último día.',
  sources: [
    { label: 'Real Decreto 1514/2007, Plan General de Contabilidad: Marco Conceptual, 3.º Principios contables', url: `${PGC}#A3`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad: Marco Conceptual, 6.º Criterios valorativos (valor residual)', url: `${PGC}#A6`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 2.ª Inmovilizado material', url: `${PGC}#A2-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 3.ª Normas particulares sobre inmovilizado material', url: `${PGC}#A3-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 4.ª Inversiones inmobiliarias', url: `${PGC}#A4-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 5.ª Inmovilizado intangible', url: `${PGC}#A5-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 6.ª Normas particulares sobre el inmovilizado intangible', url: `${PGC}#A6-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 8.ª Arrendamientos y otras operaciones de naturaleza similar', url: `${PGC}#A8`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 22.ª Cambios en criterios contables, errores y estimaciones contables', url: `${PGC}#A22`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad, cuarta parte: cuadro de cuentas', url: `${PGC}#grupo2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 2 (subgrupos 20, 21, 22, 23 y 28)', url: `${PGC}#grupo2-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 4 (cuentas 472 y 480)', url: `${PGC}#grupo4-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 5 (cuentas 523 y 543)', url: `${PGC}#grupo5-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 6 (cuentas 622, 624 y 671)', url: `${PGC}#grupo6-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 7 (cuenta 771)', url: `${PGC}#grupo7-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: NRV 2.ª (inmovilizado material)', url: `${PYMES}#A2-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: NRV 7.ª (arrendamientos)', url: `${PYMES}#A7-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1515/2007: disposición final primera (desarrollos del PGC aplicables a las pymes)', url: `${PYMES}#dfprimera`, date: VERIFIED, kind: 'norma' },
    { label: 'Resolución del ICAC de 1 de marzo de 2013 (inmovilizado material e inversiones inmobiliarias): normas primera, segunda y cuarta', url: ICAC_IM, date: VERIFIED, kind: 'norma' },
    { label: 'Resolución del ICAC de 28 de mayo de 2013 (inmovilizado intangible): normas cuarta y sexta', url: ICAC_II, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 602/2016: disposición transitoria única (intangibles de vida útil indefinida)', url: `${RD_602}#dt`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades: art. 12 (amortizaciones)', url: `${LIS}#a12`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 634/2015, Reglamento del Impuesto sobre Sociedades: arts. 3 y 4', url: `${RIS}#a3`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: arts. 107, 108 y 110 (bienes de inversión)', url: `${LIVA}#a108`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: arts. 75 (devengo) y 99 (deducción)', url: `${LIVA}#a75`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: arts. 20 (exenciones), 90 y 91 (tipos)', url: `${LIVA}#a90`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1624/1992, Reglamento del IVA: art. 65 (libro registro de bienes de inversión)', url: `${RIVA}#a65`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1619/2012, Reglamento de facturación: art. 6 (contenido de la factura)', url: `${RF}#a6`, date: VERIFIED, kind: 'norma' },
    { label: 'AEAT, Manual práctico de IVA 2026: concepto de bienes de inversión (actualizado el 30/09/2026)', url: AEAT_BI, date: VERIFIED, kind: 'criterio' },
  ],
  quiz: {
    id: 'con-05-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'con-05-q1',
        prompt:
          'Un cliente con ejercicio natural recibe el 15 de diciembre de 2026 una prensa de 40.000 € más IVA, con factura y albarán de ese día. El montaje y las pruebas terminan el 10 de febrero de 2027, fecha del acta de puesta en marcha. ¿Cómo debe figurar la prensa al cierre de 2026?',
        options: [
          {
            id: 'a',
            text: 'En la 213 Maquinaria, con la amortización de la segunda quincena de diciembre.',
            feedback: 'La amortización no empieza con la factura ni con la entrega, sino con la puesta en condiciones de funcionamiento, una vez superados el montaje y las pruebas.',
          },
          { id: 'b', text: 'En la 233 Maquinaria en montaje por 40.000 €, sin amortizar; pasa a la 213 y empieza a amortizarse el 10 de febrero de 2027.' },
          {
            id: 'c',
            text: 'Como gasto de 2026, porque todavía no se usa.',
            feedback: 'La prensa es un activo que el cliente controla y del que espera rendimientos; que aún no funcione solo retrasa el inicio de la amortización.',
          },
          {
            id: 'd',
            text: 'En la 239 Anticipos para inmovilizaciones materiales.',
            feedback: 'La 239 recoge entregas a cuenta antes de recibir el bien; aquí el bien ya se ha recibido.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Al cierre, la prensa está recibida pero en montaje: figura en el subgrupo 23, sin amortizar (cuentas 230 a 237 del PGC). Se traspasa a la 213 con el acta del 10 de febrero de 2027, fecha en que empieza la amortización contable (Resolución del ICAC de 1 de marzo de 2013, norma segunda, apartado 3.6) y fiscal (art. 3.3 RIS). El IVA, en cambio, se deduce desde que se recibe la factura (art. 99.Cuatro LIVA).',
        ref: 'Apartado 3 · Adquisición y amortización: las tres fechas',
      },
      {
        id: 'con-05-q2',
        prompt:
          'La factura de un horno industrial incluye: horno, 30.000 €; transporte, 600 €; instalación, 1.400 €, y contrato de mantenimiento de dos años, 1.800 €. Todo lleva IVA del 21 %, deducible. El cliente estima que hoy obtendría 2.500 €, netos de costes de venta, por un horno como este si ya tuviera la antigüedad y el estado previstos al final de su vida útil, y considera significativo ese importe. ¿Cuál es la base amortizable?',
        options: [
          {
            id: 'a',
            text: '31.300 €.',
            feedback: 'Incluye los 1.800 € del mantenimiento, que es un servicio posterior a la puesta en marcha y, por tanto, gasto.',
          },
          {
            id: 'b',
            text: '32.000 €.',
            feedback: 'Es el coste, pero falta restar el valor residual, que es significativo.',
          },
          { id: 'c', text: '29.500 €.' },
          {
            id: 'd',
            text: '27.500 €.',
            feedback: 'Deja fuera el transporte y la instalación, que forman parte del coste porque son necesarios hasta la puesta en condiciones de funcionamiento.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'Coste = 30.000 + 600 + 1.400 = 32.000 € (NRV 2.ª.1.1 PGC); base amortizable = 32.000 − 2.500 de valor residual = 29.500 € (Resolución del ICAC de 1 de marzo de 2013, norma segunda, apartado 3.1). Los 1.800 € del mantenimiento son gasto (622) y el IVA deducible queda fuera del coste.',
        ref: 'Apartado 4 · Coste, base amortizable y cuota',
      },
      {
        id: 'con-05-q3',
        prompt:
          'Una máquina costó 20.000 € y se amortiza linealmente en 10 años, sin valor residual (2.000 € al año). Al 31 de diciembre de 2028, su amortización acumulada es de 8.000 €. Se vende el 30 de junio de 2029 por 12.000 € más IVA, a cobrar en 30 días. ¿Qué es correcto?',
        options: [
          {
            id: 'a',
            text: 'No hay resultado: el precio (12.000 €) coincide con el valor contable.',
            feedback: 'Toma el valor contable al 31 de diciembre de 2028 y olvida dotar la amortización de enero a junio de 2029 (1.000 €): a la fecha de venta el valor contable es de 11.000 € y hay un beneficio de 1.000 €.',
          },
          {
            id: 'b',
            text: 'Se dota una amortización de 1.000 € hasta el 30 de junio y, al vender, se abonan la 213 (20.000 €), la 477 (2.520 €) y la 771 (1.000 €), con cargo a la 2813 (9.000 €) y a la 543 (14.520 €).',
          },
          {
            id: 'c',
            text: 'Se abona la 700 Ventas de mercaderías por 12.000 € con cargo a la 430 Clientes.',
            feedback: 'No es una venta del tráfico ordinario: el cobro pendiente va a la 543 y el resultado, a la 771 o a la 671.',
          },
          {
            id: 'd',
            text: 'Se registra una pérdida de 8.000 € en la 671.',
            feedback: 'Compara el precio con el coste sin restar la amortización acumulada: hay que dar de baja también la 2813.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Amortización acumulada = 8.000 + 1.000 = 9.000 €; valor contable = 20.000 − 9.000 = 11.000 €; resultado = 12.000 − 11.000 = +1.000 € (771). IVA al 21 %: 2.520 €; crédito: 14.520 €. Debe: 2813 (9.000 €) + 543 (14.520 €) = 23.520 €; Haber: 213 (20.000 €) + 477 (2.520 €) + 771 (1.000 €) = 23.520 € (NRV 2.ª.3 PGC).',
        ref: 'Apartado 7 · Bajas y ventas',
      },
    ],
  },
  version: 1,
  verifiedAt: VERIFIED,
  editorial: {
    status: 'publicado',
    authorId: 'p-judith-calet',
    publishedAt: '2026-10-29T09:00:00+01:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
};

/** Banco de 4 preguntas adicionales para «Pon a prueba tus conocimientos». */
export const bank: QuizQuestion[] = [
  {
    id: 'con-05-b1',
    prompt:
      'Un cliente alquila un local por 5 años, sin prórroga prevista ni indicios de que vaya a renovar. Paga 30.000 € más IVA por obras de adecuación (instalaciones fijas, no separables del local) con una vida económica de 15 años. El alquiler es un arrendamiento operativo. ¿Cómo trata las obras?',
    options: [
      {
        id: 'a',
        text: 'Como gasto del ejercicio (622), porque el local no es suyo.',
        feedback: 'Las inversiones no separables en un local con arrendamiento operativo son inmovilizado material del arrendatario si cumplen la definición de activo (NRV 3.ª.h PGC).',
      },
      {
        id: 'b',
        text: 'Como inmovilizado material amortizado en 15 años.',
        feedback: 'Su vida útil es la duración del contrato cuando es inferior a la vida económica de las obras.',
      },
      { id: 'c', text: 'Como inmovilizado material amortizado en 5 años: 6.000 € al año.' },
      {
        id: 'd',
        text: 'Como mayor valor de la 211 Construcciones.',
        feedback: 'El cliente no es propietario del edificio: registra sus inversiones en el local, no el inmueble.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'NRV 3.ª, letra h), PGC: las inversiones no separables en un local con arrendamiento operativo son inmovilizado material y se amortizan en la duración del contrato, incluida la renovación solo si hay evidencias de que se producirá, cuando es inferior a su vida económica. 30.000 / 5 = 6.000 € al año.',
    ref: 'Formación «Amortizaciones», apartado 1 · Qué se amortiza y qué no',
  },
  {
    id: 'con-05-b2',
    prompt:
      'Una factura de un proveedor de software incluye: licencia de uso perpetua de un programa de gestión de la producción, 6.000 €; mantenimiento y actualizaciones del primer año, 1.200 €, y formación del personal, 800 €. ¿Qué se activa en la 206 Aplicaciones informáticas?',
    options: [
      {
        id: 'a',
        text: '8.000 €.',
        feedback: 'La formación del personal y el mantenimiento nunca se activan.',
      },
      {
        id: 'b',
        text: '7.200 €.',
        feedback: 'El mantenimiento de la aplicación es gasto: en ningún caso puede figurar en el activo (NRV 6.ª PGC).',
      },
      { id: 'c', text: '6.000 €.' },
      {
        id: 'd',
        text: 'Nada: el software es siempre gasto.',
        feedback: 'El derecho de uso de un programa que se utilizará durante varios ejercicios es inmovilizado intangible.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Se activan los 6.000 € de la licencia (Resolución del ICAC de 28 de mayo de 2013, norma sexta, apartado 5.1); los 1.200 € y los 800 € son gasto del ejercicio (apartado 5.3). La licencia se amortiza en su vida útil, que, como en los gastos de desarrollo, se presume no superior a cinco años salvo prueba en contrario (NRV 6.ª PGC).',
    ref: 'Formación «Amortizaciones», apartado 1 · Qué se amortiza y qué no',
  },
  {
    id: 'con-05-b3',
    prompt: 'Una empresa compra un equipo informático de 1.800 € (sin IVA) que usará cuatro años. ¿Qué afirmación es correcta?',
    options: [
      {
        id: 'a',
        text: 'Como no es bien de inversión a efectos del IVA, se registra como gasto.',
        feedback: 'La calificación en el IVA no decide la contable: el equipo sirve de forma duradera a la actividad.',
      },
      {
        id: 'b',
        text: 'Es inmovilizado material (217) y se amortiza en cuatro años; a efectos del IVA no es bien de inversión, porque vale menos de 3.005,06 €, y no entra en la regularización del art. 107 LIVA.',
      },
      {
        id: 'c',
        text: 'Es bien de inversión a efectos del IVA porque se usará más de un año.',
        feedback: 'Además de usarse más de un año, su valor de adquisición no puede ser inferior a 3.005,06 €.',
      },
      {
        id: 'd',
        text: 'Puede amortizarse libremente porque vale menos de 3.005,06 €.',
        feedback: 'La libertad de amortización del art. 12.3.e LIS se refiere a elementos nuevos de hasta 300 € por unidad; los 3.005,06 € son un límite del IVA.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'Contabilidad e IVA usan conceptos distintos. El equipo es inmovilizado material (217) porque sirve de forma duradera a la actividad, y no es bien de inversión porque no alcanza el valor del art. 108 LIVA; por eso no se regulariza por el art. 107.',
    ref: 'Formación «Amortizaciones», apartado 2 · Inmovilizado o bien de inversión: dos preguntas distintas',
  },
  {
    id: 'con-05-b4',
    prompt:
      'Una sociedad compra por 400.000 € (sin IVA) una nave para su actividad. La escritura no desglosa el precio y no hay tasación. Los valores catastrales del año de compra son 100.000 € para el suelo y 150.000 € para la construcción, y se usa el reparto catastral que admite el Reglamento del Impuesto sobre Sociedades cuando no se conoce el valor del suelo. Vida útil de la construcción: 50 años, sin valor residual. ¿Cuál es la amortización anual?',
    options: [
      {
        id: 'a',
        text: '8.000 €.',
        feedback: 'Amortiza también el suelo, que no se amortiza.',
      },
      {
        id: 'b',
        text: '3.000 €.',
        feedback: 'Aplica el valor catastral de la construcción en lugar de su proporción sobre el precio pagado.',
      },
      { id: 'c', text: '4.800 €.' },
      {
        id: 'd',
        text: 'Ninguna: los inmuebles se revalorizan.',
        feedback: 'Los edificios tienen vida útil limitada y se amortizan, aunque el terreno se revalorice.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Proporción de la construcción = 150.000 / 250.000 = 60 %; 400.000 × 60 % = 240.000 €; 240.000 / 50 = 4.800 € al año. El suelo (160.000 €) va a la 210 y no se amortiza (NRV 3.ª PGC; art. 3.2 RIS).',
    ref: 'Formación «Amortizaciones», apartado 1 · Qué se amortiza y qué no',
  },
];

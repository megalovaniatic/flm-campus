import type { Formation, QuizQuestion } from '@flm/shared';

export const formation: Formation = {
  id: 'con-07',
  slug: 'facturas-de-anticipo',
  area: 'contable',
  title: 'Facturas de anticipo: cómo reconocerlas, su IVA y sus asientos sin duplicidades',
  intro:
    'En la documentación de julio de una conservera de Granollers aparece la factura de su nueva envasadora, con un precio de 100.000 € más IVA. En junio la clienta ya había pagado 36.300 € «a cuenta del pedido 245» y había recibido otra factura. Si das de alta la máquina sin cancelar el anticipo, el balance tendrá 30.000 € de una máquina que no existe. Si además deduces el IVA de los 100.000 €, la clienta habrá deducido dos veces 6.300 €. Aquí aprenderás a reconocer un [[anticipo]], a enlazarlo con la factura definitiva y a tratar su IVA desde los dos lados.',
  summary:
    'Reconoce una factura de anticipo, aplica el devengo del IVA en el cobro y sus excepciones, regístrala en la 407, 239 o 438 y enlázala con la factura definitiva sin duplicar gasto ni IVA.',
  coverTerm: 'Anticipos',
  readingMinutes: 33,
  outcomes: [
    'Reconocer una factura o un pago de anticipo, decidir si la factura basta o qué documentos faltan y clasificarlo en la cuenta que corresponde (407, 239, 209, 438 o 181).',
    'Aplicar el devengo del IVA en el cobro anticipado, con sus excepciones, y expedir o exigir la factura de anticipo en plazo y con el contenido obligatorio.',
    'Registrar el anticipo, la factura definitiva y el pago del resto sin duplicar activo, gasto ni IVA, y regularizar un anticipo devuelto con factura rectificativa.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Qué es un anticipo y qué no lo es', id: 'que-es' },
    {
      type: 'paragraph',
      text: 'Un [[anticipo]] es un pago que se hace **antes** de recibir el bien o el servicio, **a cuenta del precio** de un suministro futuro. El PGC lo define así para proveedores y clientes: entregas «a cuenta» de suministros futuros ([cuentas 407 y 438](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4-2)) o, si se trata de inmovilizado, entregas a cuenta a sus proveedores ([cuentas 209 y 239](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo2-2)).',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Anticipo',
      text: 'Hasta que se entrega el bien o se presta el servicio, el anticipo es un activo para quien paga y un pasivo para quien cobra. Todavía no hay compra ni venta, ni gasto ni ingreso. Pero su IVA, salvo excepciones, se devenga al cobrarse: la contabilidad y el IVA van a ritmos distintos, y ahí nacen las duplicidades.',
    },
    { type: 'paragraph', text: 'No lo confundas con:' },
    {
      type: 'list',
      items: [
        '**Un gasto o un ingreso anticipado (480 y 485).** Ahí ya hay factura y gasto o ingreso contabilizados, y al cierre se trasladan al ejercicio siguiente (formación [«Devengo y periodificación»](#/aprender/contable/devengo-y-periodificacion)). En el anticipo aún no hay entrega, ni compra, ni venta.',
        '**Una retención en garantía.** En las obras es frecuente que el cliente retenga, por ejemplo, un 5 % de cada certificación. Para la AEAT, esas cantidades no se consideran cobradas a efectos del devengo por pagos anticipados ([Manual práctico de IVA 2026](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-04-sujetos-pasivos-repercusion-impositivo/cuando-se-producen-operaciones-efectos-devengo/entregas-bienes-prestaciones-servicios-devengo.html)): es lo contrario de un anticipo, un cobro aplazado.',
        '**Un [[suplido]].** Es dinero que el proveedor paga en nombre y por cuenta de su cliente, con mandato expreso. No forma parte de la base del IVA ([art. 78.Tres.3.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a78)). Lo verás en el apartado 10.',
        '**Un anticipo al personal o un pago a cuenta de impuestos.** Van a la 460 «Anticipos de remuneraciones» y a la 473 «Hacienda Pública, retenciones y pagos a cuenta» ([cuadro de cuentas del PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4)). La palabra «anticipo» o «a cuenta» en un extracto bancario no siempre se refiere a un proveedor.',
      ],
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Contabilidad: activo para quien paga, pasivo para quien cobra', id: 'contabilidad' },
    { type: 'heading', text: 'El comprador: 407, 239 o 209', level: 3 },
    {
      type: 'paragraph',
      text: 'Para quien paga, el anticipo es un **activo**, no un gasto. La cuenta depende del destino de lo que compra ([PGC, quinta parte: cuentas 209, 239 y 407](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo2-2); [modelo normal de balance](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#balance)):',
    },
    {
      type: 'table',
      caption: 'Cuenta del anticipo según el destino de la compra (PGC)',
      columns: ['Lo que se compra', 'Cuenta del anticipo', 'Dónde figura en el balance (modelo normal)', 'Al recibir el bien'],
      rows: [
        ['Mercaderías, materias primas y demás existencias', '407 Anticipos a proveedores', 'Activo corriente, dentro de «Existencias» (línea «Anticipos a proveedores»)', 'Abono a la 407 con cargo, generalmente, al subgrupo 60'],
        ['Inmovilizado material (maquinaria, mobiliario, instalaciones…)', '239 Anticipos para inmovilizaciones materiales', 'Activo no corriente, «Inmovilizado en curso y anticipos»', 'Abono a la 239 con cargo al subgrupo 21 (o a la 233 «Maquinaria en montaje» si al cierre sigue en montaje)'],
        ['Inmovilizado intangible (aplicaciones informáticas, desarrollo…)', '209 Anticipos para inmovilizaciones intangibles', 'Activo no corriente', 'Abono a la 209 con cargo al subgrupo 20'],
      ],
    },
    {
      type: 'list',
      items: [
        '**Valoración.** El anticipo de existencias se valora por su coste ([NRV 10.ª PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A10)), es decir, por lo pagado sin el IVA deducible.',
        '**Moneda extranjera.** Si pagas el anticipo en dólares a un proveedor de fuera de la zona euro, conviértelo al tipo de cambio del día del pago y no lo actualices al cierre: es una partida no monetaria ([NRV 11.ª PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A11)).',
        '**Amortización.** Un anticipo de inmovilizado no se amortiza. Lo vemos al final de este apartado.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Con el PGC de Pymes, las cuentas [407 y 438](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#grupo4-2) y la [239](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#grupo2-2) se definen igual, pero su modelo de balance no tiene líneas propias para los anticipos: la 239 se presenta dentro de «Inmovilizado material» y la 407, dentro de «Existencias» ([modelos de cuentas anuales de Pymes](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#iimodelosdecuentasanuales)).',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Si pagas sin tener aún la factura',
      text: 'El PGC carga la 472 cuando se devenga el impuesto, pero en el 303 solo puedes deducir la cuota cuando tengas la factura ([arts. 97 y 99 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a99)). Recomendación interna, que el PGC no regula: registra la cuota en una subcuenta de la 472 de IVA pendiente de factura y trasládala a la 472 cuando la recibas. Confirma con el área contable la subcuenta que usa FLM.',
      refs: [
        { label: 'Plan General de Contabilidad, quinta parte: cuenta 472', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4-2', date: '2026-10-29', kind: 'norma' },
        { label: 'Ley 37/1992, del IVA, arts. 97 y 99', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a97', date: '2026-10-29', kind: 'norma' },
      ],
    },
    { type: 'heading', text: 'El vendedor: 438 o 181', level: 3 },
    {
      type: 'paragraph',
      text: 'Para quien cobra, el anticipo es un **pasivo**: se ha comprometido a entregar un bien o a prestar un servicio. Se registra en la 438 «Anticipos de clientes», en el pasivo corriente ([cuenta 438](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4-2)), o, si se aplicará a más de un año, en la 181 «Anticipos recibidos por ventas o prestaciones de servicios a largo plazo» ([cuenta 181](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo1-2)), que se presenta en «Periodificaciones a largo plazo», en el pasivo no corriente ([art. 33.3 de la Resolución del ICAC de 10 de febrero de 2021](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a3-5)). En el balance de Pymes, la 438 va en «Otros acreedores» y la 181, en «Periodificaciones a largo plazo». Es el mismo pasivo del contrato que ves en la formación [«BOICAC 147»](#/aprender/contable/boicac-147).',
    },
    {
      type: 'paragraph',
      text: 'El ingreso se reconoce cuando se transfiere el bien o el servicio, y entonces se cancela el pasivo ([art. 28 de la Resolución del ICAC de 2021](https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a2-10)). Lo mismo ocurre en el Impuesto sobre Sociedades, que sigue el devengo contable ([art. 11.1 LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11)): el cobro de un anticipo no es ingreso del ejercicio.',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Anticipos a más de un año',
      text: 'La Resolución del ICAC sobre ingresos es obligatoria con el PGC y, con el de Pymes, puede aplicarse de forma subsidiaria cuando su marco no desarrolla la operación. Prevé actualizar el anticipo por su efecto financiero cuando el contrato tiene un componente financiero significativo. No hace falta si entre el cobro y la entrega no media más de un año y el componente no es significativo. Tampoco hay componente financiero significativo si el cliente pagó por anticipado y decide cuándo se le entrega, ni si la diferencia con el precio al contado se debe a razones distintas de la financiación, por ejemplo, a asegurarse de que el cliente cumplirá. La 181 recoge esos ajustes con cargo a la 662. Valorar la significatividad y el tipo de descuento exige juicio: consúltalo con el área contable.',
      refs: [
        { label: 'Resolución del ICAC de 10 de febrero de 2021 (ingresos), arts. 1 y 14', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a1-6', date: '2026-10-29', kind: 'norma' },
        { label: 'Resolución del ICAC de 10 de febrero de 2021 (ingresos), art. 28', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a2-10', date: '2026-10-29', kind: 'norma' },
        { label: 'Plan General de Contabilidad, quinta parte: cuenta 181', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo1-2', date: '2026-10-29', kind: 'norma' },
      ],
    },
    { type: 'heading', text: 'Anticipo de inmovilizado: bien de inversión y amortización', level: 3 },
    {
      type: 'list',
      items: [
        '**Contabilidad.** El anticipo de una máquina es inmovilizado material «en curso y anticipos» (239). Cuando la máquina se recibe a conformidad, el anticipo pasa a formar parte de su precio de adquisición: a la 213, o a la 233 si al cierre sigue en montaje ([cuentas 230/237 y 239](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo2-2)).',
        '**IVA.** El [[bien de inversión]] es un concepto propio del IVA y no depende de la cuenta contable: bienes corporales destinados normalmente a usarse más de un año como instrumentos de trabajo, con exclusiones como los de valor inferior a 3.005,06 € ([art. 108 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a108)). El IVA del anticipo se deduce con las reglas generales (apartado 4). Si tu cliente aplica la prorrata, la regularización por bienes de inversión empieza el año de entrada en funcionamiento, si es posterior a la adquisición ([art. 107 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a107)). Y si el anticipo y la entrega caen en años distintos, no hay criterio oficial localizado sobre la prorrata que toma cada cuota: analízalo con la formación [«Bienes de inversión»](#/aprender/contable/bienes-de-inversion) y consúltalo con el área.',
        '**Amortización.** Empieza cuando el bien está en condiciones de funcionamiento, concluidas las pruebas ([Resolución del ICAC de 1 de marzo de 2013, norma segunda, 3.6.1](https://www.boe.es/buscar/act.php?id=BOE-A-2013-2557#segunda)), nunca en la fecha del anticipo ni en la de la factura. Pide el acta de instalación o de puesta en marcha. El cálculo de la cuota está en la formación [«Amortizaciones»](#/aprender/contable/amortizaciones).',
      ],
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'El IVA del anticipo: se devenga al cobrarse', id: 'iva' },
    {
      type: 'paragraph',
      text: '**Regla general.** Si hay pagos anticipados anteriores a la entrega o al servicio, el IVA se devenga en el momento del cobro, total o parcial, **por los importes efectivamente percibidos** ([art. 75.Dos LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75)). El resto se devenga con la regla ordinaria: en las entregas de bienes, con la puesta a disposición del adquirente ([art. 75.Uno.1.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75)). La AEAT lo recoge igual en su [Manual práctico de IVA 2026](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-04-sujetos-pasivos-repercusion-impositivo/cuando-se-producen-operaciones-efectos-devengo/entregas-bienes-prestaciones-servicios-devengo.html).',
    },
    {
      type: 'paragraph',
      text: '**Tipo.** El de la operación (el general es el 21 %), vigente en la fecha de cada devengo ([art. 90 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a90)). Si el tipo cambiara entre el anticipo y la entrega, cada parte iría a su tipo.',
    },
    {
      type: 'paragraph',
      text: '**¿El anticipo incluye el IVA?** Depende del contrato. Si el pedido dice «30 % del precio, más IVA», la base es el 30 % del precio. Si la factura no repercute expresamente el IVA, se entiende que la contraprestación no lo incluía, salvo cuando la repercusión expresa no es obligatoria y en las cantidades que el proveedor retiene al resolverse la operación ([art. 78.Cuatro LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a78)). Aclara el acuerdo antes de facturar.',
    },
    {
      type: 'table',
      caption: 'Excepciones y particularidades',
      columns: ['Situación', '¿El anticipo devenga IVA?', 'Norma o criterio'],
      rows: [
        [
          'Entrega intracomunitaria exenta: tu cliente vende a una empresa de otro Estado miembro y cobra un anticipo',
          '**No.** Tampoco hay obligación de facturar el anticipo',
          '[Art. 75.Dos LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75); [art. 2.1 del Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a2-2)',
        ],
        [
          'Adquisición intracomunitaria: tu cliente paga un anticipo a un proveedor de otro Estado miembro',
          '**No.** El devengo por pagos anticipados no se aplica a estas adquisiciones',
          '[Art. 76 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a76)',
        ],
        [
          'Importación: tu cliente paga un anticipo a un proveedor de fuera de la UE',
          '**Normalmente, no.** Si el bien viaja desde fuera de la UE y tu cliente es el importador, el IVA se liquida con la importación y se devenga cuando se devengan los derechos de importación: lo verás en el DUA (formación [«Importaciones y DUA»](#/aprender/contable/importaciones-y-dua)). **Ojo:** si el proveedor importa el bien y lo entrega en España, o lo instala aquí y queda inmovilizado, su entrega se localiza en España: revisa el contrato con el área fiscal',
          '[Arts. 68.Dos](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a68) y [77 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a77)',
        ],
        [
          'Inversión del sujeto pasivo: por ejemplo, obras de construcción o rehabilitación contratadas directamente entre promotor y contratista',
          '**Entendemos que sí**, y lo declara el destinatario: el art. 75.Dos no excluye estas operaciones. La factura lleva la mención «inversión del sujeto pasivo» y el NIF del destinatario. Criterio pendiente de confirmar con el área fiscal',
          '[Arts. 75.Dos y 84.Uno.2.º f) LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a84); [art. 6.1 del Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6)',
        ],
        [
          'Servicios con inversión del sujeto pasivo prestados de forma continuada durante más de un año',
          'Si **no** hay pagos anticipados, devengo el 31 de diciembre por la parte proporcional. Si los hay, no se aplica esa regla: los anticipos devengan al cobrarse y el resto, con la regla general de los servicios',
          '[Art. 75.Uno.2.º y Dos LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75)',
        ],
        [
          'Retenciones en garantía en obras',
          'No se consideran cobradas, así que no devengan como pago anticipado. Su IVA se devenga con la regla general de la operación: en una ejecución de obra con aportación de materiales, al poner la obra a disposición del dueño',
          '[AEAT, Manual práctico de IVA 2026](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-04-sujetos-pasivos-repercusion-impositivo/cuando-se-producen-operaciones-efectos-devengo/entregas-bienes-prestaciones-servicios-devengo.html); [art. 75.Uno.2.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75)',
        ],
        [
          'Servicios de abogados y procuradores en un procedimiento judicial',
          'Devengan al concluir el procedimiento, salvo pagos anticipados, que devengan al cobrarse',
          '[AEAT, Manual práctico de IVA 2026](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-04-sujetos-pasivos-repercusion-impositivo/cuando-se-producen-operaciones-efectos-devengo/entregas-bienes-prestaciones-servicios-devengo.html)',
        ],
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'arbol-decision',
        title: '¿Devenga IVA español el anticipo?',
        start: 'operacion',
        nodes: [
          {
            id: 'operacion',
            question: '¿Qué operación hay detrás del anticipo?',
            options: [
              { label: 'Tu cliente vende y envía el bien a una empresa de otro Estado miembro (entrega intracomunitaria exenta)', next: 'fin-entrega-ic' },
              { label: 'Tu cliente compra a un proveedor de otro Estado miembro (adquisición intracomunitaria)', next: 'fin-adquisicion-ic' },
              { label: 'Tu cliente compra un bien a un proveedor de fuera de la UE', next: 'importacion' },
              { label: 'Operación interior: proveedor y cliente en España', next: 'inversion' },
            ],
          },
          {
            id: 'importacion',
            question: '¿Quién importa el bien y dónde se entrega?',
            options: [
              { label: 'Tu cliente es el importador: el DUA irá a su nombre', next: 'fin-importacion' },
              { label: 'El proveedor lo importa o lo instala en España, o no lo sabes', next: 'fin-revisar' },
            ],
          },
          {
            id: 'inversion',
            question: '¿La factura lleva la mención «inversión del sujeto pasivo»?',
            options: [
              { label: 'No', next: 'cobro' },
              { label: 'Sí', next: 'fin-inversion' },
            ],
          },
          {
            id: 'cobro',
            question: '¿Consta ya el pago del anticipo?',
            options: [
              { label: 'Sí, hay justificante bancario', next: 'fin-devenga' },
              { label: 'No: es una proforma o una solicitud de pago', next: 'fin-sin-cobro' },
            ],
          },
          {
            id: 'fin-entrega-ic',
            outcome: {
              title: 'Sin IVA ni factura del anticipo',
              text: 'El cobro no devenga IVA y no obliga a facturar el anticipo ([art. 75.Dos LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75); [art. 2.1 del Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a2-2)). Regístralo en la 438. La entrega exenta devenga el día 15 del mes siguiente al inicio del transporte o, si antes se expide factura por la operación, en la fecha de esa factura.',
              tone: 'resolver',
            },
          },
          {
            id: 'fin-adquisicion-ic',
            outcome: {
              title: 'El pago no devenga IVA',
              text: 'En las adquisiciones intracomunitarias no se aplica el devengo por pagos anticipados ([art. 76 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a76)). Registra el anticipo en la 407, 239 o 209, sin IVA español, y no autoliquides nada con el pago.',
              tone: 'resolver',
            },
          },
          {
            id: 'fin-importacion',
            outcome: {
              title: 'El IVA llega con el DUA',
              text: 'El IVA de la importación se devenga cuando se devengan los derechos de importación ([art. 77 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a77)), no con el anticipo. Registra el anticipo sin IVA y, si lo pagas en divisa, al tipo de cambio del día del pago. Pide el DUA al transitario o al representante aduanero cuando llegue la mercancía. El circuito completo está en la formación [«Importaciones y DUA»](#/aprender/contable/importaciones-y-dua).',
              tone: 'resolver',
            },
          },
          {
            id: 'fin-revisar',
            outcome: {
              title: 'Revísalo con el área fiscal',
              text: 'Si el proveedor importa el bien y lo entrega aquí, o lo instala en España y queda inmovilizado, su entrega se localiza en España ([art. 68.Dos LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a68)). Quién declara el IVA y si el anticipo lo devenga depende del caso: pide al cliente el pedido y las condiciones de entrega y consúltalo.',
              tone: 'derivar',
            },
          },
          {
            id: 'fin-inversion',
            outcome: {
              title: 'Lo declara el destinatario',
              text: 'Entendemos que el anticipo devenga al pagarse y que el destinatario autoliquida el IVA ([arts. 75.Dos y 84.Uno.2.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a84)). Es un criterio pendiente de confirmar: revisa el contrato con el área fiscal.',
              tone: 'atencion',
            },
          },
          {
            id: 'fin-devenga',
            outcome: {
              title: 'Devenga IVA al cobrarse',
              text: 'Por el importe cobrado y al tipo vigente ese día ([arts. 75.Dos](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75) y [90 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a90)). El proveedor lo declara en el periodo del cobro; el comprador lo deduce cuando tenga la factura.',
              tone: 'resolver',
            },
          },
          {
            id: 'fin-sin-cobro',
            outcome: {
              title: 'Todavía no hay devengo',
              text: 'Sin cobro no hay devengo, y sin devengo no nace el derecho a deducir ([art. 98 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a98)). Una proforma no es factura. Espera al pago y pide la factura del anticipo.',
              tone: 'atencion',
            },
          },
        ],
      },
      caption: 'Recorre el árbol con la factura o el pago que tienes delante. Normativa vigente a 29/10/2026.',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Entregas intracomunitarias con factura del anticipo',
      text: 'No hay obligación de facturar estos anticipos. Pero la entrega intracomunitaria exenta se devenga el día 15 del mes siguiente al inicio del transporte o, si antes se expide factura por la operación, en la fecha de esa factura ([art. 75.Uno.8.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75)). Si tu cliente factura el anticipo de forma voluntaria, valora con el área fiscal si esa factura adelanta el devengo de la entrega.',
      refs: [{ label: 'Ley 37/1992, del IVA, art. 75', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75', date: '2026-10-29', kind: 'norma' }],
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'La factura del anticipo y la deducción del IVA', id: 'factura-anticipo' },
    {
      type: 'paragraph',
      text: '**Obligación.** El empresario o profesional que cobra un anticipo debe expedir una [[factura de anticipo]], salvo si corresponde a una entrega intracomunitaria exenta ([art. 2.1 del Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a2-2); [AEAT, «Obligación de facturar»](https://sede.agenciatributaria.gob.es/Sede/iva/facturacion-registro/facturacion-iva/obligacion-facturar.html)).',
    },
    {
      type: 'paragraph',
      text: '**Contenido.** El ordinario del [art. 6 del Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6), incluida la descripción de la operación con los datos necesarios para determinar la base. Además:',
    },
    {
      type: 'list',
      items: [
        'la **fecha en que se recibió el pago anticipado**, si es distinta de la fecha de expedición;',
        'con inversión del sujeto pasivo, la mención «inversión del sujeto pasivo» y el NIF del destinatario.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Como buena práctica, aunque el Reglamento no lo exige, cita también el número de pedido o de contrato y el porcentaje del precio que representa el anticipo. Es lo que te permitirá enlazarla después con la factura definitiva.',
    },
    {
      type: 'paragraph',
      text: '**Plazo.** Si el cliente es empresario o profesional, expídela antes del día 16 del mes siguiente al del devengo, que aquí es el día del cobro ([art. 11.1 del Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a11)). Aunque la factura se expida en el mes siguiente, **el IVA se declara en el periodo del cobro** ([AEAT, «¿En qué momento tengo que repercutir el IVA?»](https://sede.agenciatributaria.gob.es/Sede/iva/calculo-iva-repercutido-clientes/que-momento-tengo-que-repercutir-iva.html)). Si el cliente es un particular, la regla es expedirla en el momento de realizarse la operación; aplicado a un anticipo, entendemos que al cobrar. Confírmalo con el área fiscal, también si cabe la factura simplificada.',
    },
    { type: 'heading', text: 'La deducción del comprador', level: 3 },
    {
      type: 'paragraph',
      text: 'Si el comprador tiene derecho a deducir, deduce el IVA del anticipo cuando se cumplen dos condiciones: que se haya devengado, porque el pago está hecho, y que tenga la factura ([arts. 97.Uno](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a97) y [98.Uno LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a98)). Lo deduce en el periodo en que recibe la factura o en los siguientes, mientras no pasen cuatro años desde que nació el derecho, es decir, desde el pago. Si la factura llega antes que el pago, la cuota se entiende soportada cuando se paga ([art. 99 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a99)).',
    },
    {
      type: 'table',
      caption: 'En qué periodo se deduce el IVA del anticipo',
      columns: ['Pago', 'Factura del anticipo', 'Periodo de la deducción'],
      rows: [
        ['En junio', 'Llega en julio', 'Julio, cuando tienes la factura (o los siguientes, dentro de cuatro años)'],
        ['En junio', 'Llegó en mayo, antes del pago', 'Junio: la cuota se entiende soportada al devengarse, con el pago'],
        ['Pendiente', 'Proforma o solicitud de pago', 'Ninguno todavía: no es factura y no hay devengo'],
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Proformas y facturas anteriores al pago',
      text: 'Un documento que no reúne todos los requisitos del art. 6 del Reglamento de facturación no es factura a efectos de deducir. Y una factura de anticipo expedida **antes** de cobrar tampoco permite todavía la deducción: el derecho a deducir nace con el devengo. Además, nunca puedes deducir más que la cuota consignada expresa y separadamente en la factura: la cuota del anticipo se deduce una sola vez, con su factura.',
      refs: [
        { label: 'Real Decreto 1619/2012, Reglamento de facturación, art. 6.4', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6', date: '2026-10-29', kind: 'norma' },
        { label: 'Ley 37/1992, del IVA, arts. 97.Tres, 98.Uno y 99.Cuatro', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a97', date: '2026-10-29', kind: 'norma' },
      ],
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'La factura definitiva: cómo se enlaza sin duplicar', id: 'factura-definitiva' },
    {
      type: 'paragraph',
      text: 'Con la entrega se devenga el IVA del resto del precio ([art. 75.Uno.1.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75)). El IVA del anticipo ya se devengó y se declaró al cobrarlo. Por tanto, la [[factura definitiva]] debe repercutir solo la cuota pendiente.',
    },
    {
      type: 'paragraph',
      text: 'El Reglamento de facturación no fija un formato para descontar el anticipo. Esta es la presentación que recomendamos, porque deja la base y la cuota de la factura definitiva iguales a lo que se devenga con ella:',
    },
    {
      type: 'table',
      caption: 'Factura definitiva recomendada (caso del apartado 8)',
      columns: ['Línea de la factura definitiva', 'Importe'],
      rows: [
        ['Envasadora modelo X, instalada (pedido 245)', '100.000,00 €'],
        ['Menos: anticipo facturado (factura A-2026/014, de 15/06/2026)', '−30.000,00 €'],
        ['**Base imponible**', '**70.000,00 €**'],
        ['IVA 21 %', '14.700,00 €'],
        ['**Total factura**', '**84.700,00 €**'],
      ],
      numeric: [1],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Si la factura muestra el IVA total y resta el anticipo con su IVA',
      text: 'Algunos proveedores presentan la factura definitiva por el total (100.000 € de base y 21.000 € de IVA) y restan al final el anticipo con su IVA (−36.300 €), con 84.700 € a pagar. Ese formato no deja claro qué cuota se repercute con esta factura. Si lo recibes, pide al proveedor que confirme que la cuota de esta operación es 14.700 €, porque los 6.300 € del anticipo ya se devengaron y se dedujeron con su factura. Si la factura repercute 21.000 € y no descuenta el anticipo, la cuota está mal determinada: pide la factura rectificativa. En ningún caso deduzcas dos veces los 6.300 €. El área fiscal debe confirmar el criterio de FLM para estos formatos.',
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 97.Tres', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a97', date: '2026-10-29', kind: 'norma' },
        { label: 'Real Decreto 1619/2012, Reglamento de facturación, art. 15', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a15', date: '2026-10-29', kind: 'norma' },
      ],
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Comprobación rápida',
      text: 'La suma de las bases de todas las facturas del pedido (anticipos más definitiva) debe ser igual al precio pactado. Si el tipo no ha cambiado, la suma de sus cuotas debe ser igual al precio por el tipo. En el caso: 30.000 + 70.000 = 100.000 € de base y 6.300 + 14.700 = 21.000 € de IVA, el 21 % de 100.000 €.',
    },

    /* ── 6 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Cómo identificar un anticipo en facturas y documentos', id: 'identificar' },
    {
      type: 'paragraph',
      text: 'Al revisar la documentación de un cliente, el anticipo aparece en el concepto de una factura, en una transferencia o en un pedido. Estas son las señales que lo delatan y los documentos que lo confirman.',
    },
    { type: 'heading', text: 'Qué mirar en la factura del anticipo', level: 3 },
    {
      type: 'table',
      caption: 'Señales de que una factura documenta un anticipo',
      columns: ['Elemento', 'Qué indica que es un anticipo'],
      rows: [
        ['**Concepto**', '«Anticipo», «a cuenta», «entrega a cuenta», «pago a cuenta del pedido…», «30 % a la firma», «primer pago», «reserva», «señal», «provisión de fondos». Describe una operación futura («fabricación de…», «suministro de…») sin unidades entregadas.'],
        ['**Fechas**', 'Fecha de expedición y fecha del pago anticipado **anteriores** a la entrega, a la instalación o a la prestación del servicio. No hay fecha de entrega ni albarán.'],
        ['**Referencia**', 'Número de pedido, contrato o presupuesto; porcentaje del precio total («30 % de 100.000 €»).'],
        ['**Importes**', 'Porcentaje redondo del precio; base e IVA al tipo de la operación futura. Sin IVA español si es una adquisición intracomunitaria o, en general, una compra a un proveedor de fuera de la UE que se importará (revisa las excepciones del apartado 3). En una entrega intracomunitaria exenta, lo normal es que no haya factura del anticipo.'],
        ['**Menciones**', '«Inversión del sujeto pasivo» y NIF del destinatario, si es el destinatario quien declara el IVA.'],
      ],
    },
    { type: 'heading', text: 'Qué mirar en la factura definitiva', level: 3 },
    {
      type: 'list',
      items: [
        'Una línea que **descuente el anticipo**, con el **número y la fecha** de su factura y su base (y, si la presenta, su cuota). El Reglamento no lo exige, pero sin esa referencia no podrás enlazar las dos facturas: si falta, pídela al proveedor.',
        'Una **base imponible** y una **cuota** que correspondan solo al importe pendiente (en el caso del apartado 8, 70.000 € y 14.700 €).',
        'Un **total a pagar** igual al precio total menos lo ya pagado.',
        'La **fecha de la operación**: la entrega o el fin del servicio. Para el inmovilizado, pide además el acta de instalación o de puesta en marcha, que fija el inicio de la amortización.',
      ],
    },
    { type: 'heading', text: 'Documentos que hay que cruzar', level: 3 },
    {
      type: 'table',
      caption: 'La factura casi nunca basta sola: crúzala con estos documentos',
      columns: ['Documento', 'Para qué sirve', 'A quién pedirlo'],
      rows: [
        ['Pedido, contrato o presupuesto aceptado', 'Precio total, calendario de pagos, si el anticipo incluye o no el IVA, condiciones de anulación y penalizaciones', 'Al cliente (compras o gerencia)'],
        ['Justificante bancario del pago o del cobro', 'Fecha y cuantía del devengo del IVA del anticipo', 'Al cliente o al extracto bancario'],
        ['Factura del anticipo', 'Deducción del IVA y enlace con la definitiva', 'Al proveedor'],
        ['Albarán, acta de entrega o de recepción de obra', 'Devengo del resto y cancelación de la 407 o la 239', 'Al cliente (almacén, producción)'],
        ['Acta de instalación o de puesta en marcha', 'Inicio de la amortización; paso de la 233 a la 213', 'Al cliente o al proveedor de la máquina'],
        ['DUA, en las compras a proveedores de fuera de la UE', 'IVA de la importación, que no llega con el anticipo', 'Al transitario o al representante aduanero, cuando llegue la mercancía'],
        ['Mayor de la 407, 239, 209 o 438 por proveedor o cliente', 'Detectar anticipos sin cancelar o cancelados dos veces', 'Contabilidad'],
      ],
    },
    { type: 'heading', text: 'Cuándo la factura no basta y qué pedir', level: 3 },
    {
      type: 'table',
      caption: 'Situaciones frecuentes en la revisión',
      columns: ['Situación', 'Por qué no basta', 'Qué pedir y a quién'],
      rows: [
        ['Factura de anticipo sin indicación del destino de lo comprado', 'No sabes si va a la 407 (existencias), a la 239 (inmovilizado material) o a la 209 (intangible)', 'Al cliente: el pedido y para qué usará el bien (revenderlo o consumirlo, o usarlo más de un año)'],
        ['Transferencia «a cuenta del pedido 245» sin factura', 'Sin factura no hay deducción', 'Al proveedor: la factura del anticipo, que debía expedir en plazo'],
        ['«Factura proforma» o «solicitud de pago»', 'No es factura si le falta algún requisito; si aún no se ha pagado, tampoco hay devengo', 'Al proveedor, una vez pagado: la factura del anticipo'],
        ['Factura definitiva por el total, sin descontar el anticipo', 'Puede duplicar activo, gasto e IVA', 'Al proveedor: si el anticipo se facturó y con qué número, y la rectificativa si la cuota está mal determinada'],
        [
          'Factura de un proveedor comunitario o de fuera de la UE con «advance payment»',
          'En general, sin IVA español en el anticipo; la cuenta depende del destino; en moneda extranjera, tipo de cambio del día del pago. Si el proveedor de fuera de la UE importa él mismo o instala el bien en España, la factura no basta para saberlo',
          'Al cliente: el pedido y las condiciones de entrega (quién importa, dónde se instala). Al transitario o al representante aduanero: el DUA, cuando llegue la mercancía',
        ],
        ['Provisión de fondos de un abogado o una gestoría', 'Puede mezclar suplidos sin IVA y honorarios con IVA', 'Al profesional: el desglose y, para los suplidos, las facturas a nombre del cliente'],
        ['Factura de anticipo con «inversión del sujeto pasivo»', 'El IVA lo declara tu cliente, y entendemos que al pagar el anticipo (criterio pendiente de confirmar)', 'Al cliente: el contrato, para confirmar que se cumplen los requisitos del art. 84 LIVA'],
        ['Anticipo pagado y pedido anulado', 'Sin factura rectificativa, no hay base para regularizar el IVA', 'Al proveedor: la rectificativa y el justificante de la devolución'],
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'clasificador',
        title: '¿Anticipo, suplido u otra partida?',
        prompt: 'Clasifica cada apunte que encuentras al revisar la documentación de un cliente.',
        categories: ['Anticipo a proveedor (407, 239 o 209)', 'Anticipo de cliente (438 o 181)', 'Suplido', 'Otra partida'],
        items: [
          {
            label: 'Transferencia de 36.300 € a un fabricante de maquinaria: «30 % a la firma, pedido 245», con factura de anticipo',
            answer: 'Anticipo a proveedor (407, 239 o 209)',
            explanation: 'Pago antes de la entrega y a cuenta del precio. Si la máquina es para la línea de producción, va a la 239.',
          },
          {
            label: 'Pago de 7.260 € «a cuenta» a un fabricante de luminarias por mercaderías para revender',
            answer: 'Anticipo a proveedor (407, 239 o 209)',
            explanation: 'Existencias: va a la 407 y se cancela con cargo a la 600 cuando llegan las mercaderías.',
          },
          {
            label: 'Cobro de una clienta «a cuenta del pedido 88», con la mercancía por servir',
            answer: 'Anticipo de cliente (438 o 181)',
            explanation: 'Es un pasivo hasta la entrega: 438, o 181 si se aplicará a más de un año. Su IVA se devenga al cobrarlo.',
          },
          {
            label: 'Pago de la gestoría al Registro Mercantil en nombre del cliente, con mandato expreso y factura del Registro a nombre del cliente',
            answer: 'Suplido',
            explanation: 'Sumas pagadas en nombre y por cuenta del cliente con mandato expreso: no forman parte de la base del IVA de la gestoría (art. 78.Tres.3.º LIVA).',
          },
          {
            label: 'El cliente de una constructora le retiene el 5 % de cada certificación como garantía',
            answer: 'Otra partida',
            explanation: 'Es lo contrario de un anticipo: un cobro aplazado. Para la AEAT, esas cantidades no se consideran cobradas, así que no devengan IVA como pago anticipado.',
          },
          {
            label: 'Anticipo de nómina a un trabajador',
            answer: 'Otra partida',
            explanation: 'Va a la 460 «Anticipos de remuneraciones»: no es una entrega a cuenta de un suministro.',
          },
        ],
      },
      caption: 'La palabra «anticipo» o «a cuenta» no basta: mira quién paga, a quién y a cuenta de qué.',
    },

    /* ── 7 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Procedimiento paso a paso', id: 'procedimiento' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Detecta el anticipo.** Busca las señales del apartado 6 en facturas, extractos y pedidos: concepto, fecha anterior a la entrega, referencia a un pedido, porcentaje del precio.',
        '**Reúne los documentos.** Pedido o contrato, justificante del pago o del cobro y factura del anticipo. Si falta alguno, pídelo antes de registrar.',
        '**Clasifica según el destino.** Comprador: 407 (existencias), 239 (inmovilizado material) o 209 (intangible). Vendedor: 438 o, si se aplicará a más de un año, 181.',
        '**Determina el IVA.** ¿Entrega intracomunitaria exenta o adquisición intracomunitaria? El anticipo no devenga. ¿Proveedor de fuera de la UE? El IVA llegará con la importación, salvo que el proveedor importe o instale el bien en España (consúltalo). ¿Inversión del sujeto pasivo? Declara el destinatario. En el resto de casos, devengo al cobrar, al tipo vigente.',
        '**Si eres el proveedor, factura el anticipo.** Indica la fecha del cobro si difiere de la de expedición. Si el cliente es empresario, expídela antes del día 16 del mes siguiente al cobro y declara el IVA en el periodo del cobro.',
        '**Registra el anticipo.** Comprador: cargo a la 407, 239 o 209 por la base y a la 472 por la cuota, si ya tienes la factura (si no, ver apartado 2); abono al banco. Vendedor: cargo al banco; abono a la 438 por la base y a la 477 por la cuota.',
        '**Al llegar la factura definitiva, crúzala con el anticipo.** Comprueba el número de la factura de anticipo, que la base y la cuota sean solo las pendientes y que las sumas cuadren con el precio.',
        '**Cancela el anticipo con la factura definitiva.** Comprador: abono a la 407, 239 o 209 por la base del anticipo y cargo al activo o a la compra por el precio total. Vendedor: cargo a la 438 y abono a la venta por el precio total.',
        '**Revisa al cierre.** Concilia los saldos de la 407, 239, 209, 438 y 181 por proveedor y por cliente: cada saldo debe corresponder a un pedido pendiente de entregar. Reclasifica a largo plazo lo que proceda y valora el componente financiero de lo que supere el año.',
        '**Si el pedido se anula,** pide la factura rectificativa y el justificante de la devolución, y regulariza el IVA de las dos partes. Comprueba si el proveedor se queda una parte.',
      ],
    },

    /* ── 8 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso resuelto: anticipo del 30 % por una envasadora', id: 'caso-resuelto' },
    {
      type: 'example',
      title: 'Envasadora de 100.000 € con un anticipo del 30 %, desde los dos lados',
      scenario:
        'Dos sociedades ficticias, con ejercicio natural, en el régimen general del IVA, con derecho a deducir todo el impuesto y autoliquidación trimestral. Envasats del Congost, S.L. (Granollers), conservera que aplica el PGC de Pymes, compra una envasadora para su línea de producción a Maquinària Plana de Vic, S.A. (Vic), que la fabrica y aplica el PGC. Pedido 245, firmado el 15/06/2026: envasadora instalada por 100.000 € más IVA; 30 % a la firma (más IVA) y el 70 % restante a los 30 días de la instalación. La máquina se instala, supera las pruebas y queda a disposición de la compradora el 20/07/2026. El resto se paga el 19/08/2026. Tipo: 21 %, el general; la maquinaria industrial no figura entre los bienes con tipo reducido del [art. 91 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a91).',
      steps: [
        {
          label: 'Anticipo: 30 % del precio, más IVA. El fabricante cobra el 15/06/2026 y expide ese día la factura A-2026/014; como cobro y expedición coinciden, no hace falta indicar aparte la fecha del cobro.',
          formula: '100.000 € × 30 % = 30.000,00 € · 30.000 € × 21 % = 6.300,00 €',
          result: '36.300,00 €',
        },
        {
          label: 'Devengo del anticipo: el día del cobro. Los dos lo llevan al 303 del 2T 2026: el fabricante, como IVA devengado; la conservera, como IVA deducible, porque ya tiene la factura.',
          formula: 'Art. 75.Dos LIVA',
          result: '6.300,00 € en el 2T',
        },
        {
          label: 'Resto: se devenga con la puesta a disposición, el 20/07/2026. Factura definitiva 2026/0457, que descuenta el anticipo.',
          formula: '100.000 € − 30.000 € = 70.000,00 € · 70.000 € × 21 % = 14.700,00 €',
          result: '84.700,00 € (3T 2026)',
        },
        {
          label: 'Comprobación: las dos facturas suman el precio y el IVA del pedido.',
          formula: '30.000 + 70.000 = 100.000 € · 6.300 + 14.700 = 21.000 €',
          result: '121.000,00 €',
        },
        {
          label: 'Compradora: con la recepción a conformidad, la 239 se cancela y la 213 recoge el precio total.',
          formula: '213 (100.000) y 472 (14.700) a 239 (30.000) y 523 (84.700)',
          result: 'La 239 queda a cero',
        },
        {
          label: 'Vendedor: el ingreso se reconoce con la entrega, no con el cobro.',
          formula: '430 (84.700) y 438 (30.000) a 701 (100.000) y 477 (14.700)',
          result: '100.000 € de ingreso en julio',
        },
        {
          label: 'Amortización: la envasadora entra en funcionamiento el 20/07/2026.',
          formula: 'Inicio de la amortización',
          result: '20/07/2026, no el 15/06/2026',
        },
      ],
      conclusion:
        'La 213 recoge 100.000 €, la 239 y la 438 quedan a cero y la 472 suma 21.000 € entre los dos trimestres: ni un euro más. Si la conservera hubiera dado de alta la máquina sin cancelar la 239, tendría 30.000 € de más en el activo. Y si hubiera deducido 21.000 € con la factura definitiva, habría deducido dos veces los 6.300 €.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Envasats del Congost, S.L. (compradora, PGC de Pymes)',
        entries: [
          {
            date: '2026-06-15',
            concept: 'Pago del anticipo y factura A-2026/014',
            lines: [
              { account: '239', name: 'Anticipos para inmovilizaciones materiales', debit: 30000 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 6300 },
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', credit: 36300 },
            ],
          },
          {
            date: '2026-07-20',
            concept: 'Recepción a conformidad de la envasadora y factura definitiva 2026/0457',
            lines: [
              { account: '213', name: 'Maquinaria', debit: 100000 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 14700 },
              { account: '239', name: 'Anticipos para inmovilizaciones materiales', credit: 30000 },
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', credit: 84700 },
            ],
          },
          {
            date: '2026-08-19',
            concept: 'Pago del resto',
            lines: [
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', debit: 84700 },
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', credit: 84700 },
            ],
          },
        ],
      },
      caption: 'Tras el 20/07, la 239 queda a cero y la 213 recoge el precio total. La 472 suma 21.000 €: 6.300 € en el 2T y 14.700 € en el 3T.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Maquinària Plana de Vic, S.A. (vendedor, PGC)',
        entries: [
          {
            date: '2026-06-15',
            concept: 'Cobro del anticipo y factura A-2026/014',
            lines: [
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', debit: 36300 },
              { account: '438', name: 'Anticipos de clientes', credit: 30000 },
              { account: '477', name: 'Hacienda Pública, IVA repercutido', credit: 6300 },
            ],
          },
          {
            date: '2026-07-20',
            concept: 'Entrega de la envasadora y factura definitiva 2026/0457',
            lines: [
              { account: '430', name: 'Clientes', debit: 84700 },
              { account: '438', name: 'Anticipos de clientes', debit: 30000 },
              { account: '701', name: 'Ventas de productos terminados', credit: 100000 },
              { account: '477', name: 'Hacienda Pública, IVA repercutido', credit: 14700 },
            ],
          },
          {
            date: '2026-08-19',
            concept: 'Cobro del resto',
            lines: [
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', debit: 84700 },
              { account: '430', name: 'Clientes', credit: 84700 },
            ],
          },
        ],
      },
      caption: 'El ingreso (100.000 €) se reconoce en julio, con la entrega, y no en junio, con el cobro. La 477 recoge 6.300 € en el 2T y 14.700 € en el 3T.',
    },
    { type: 'paragraph', text: 'Variantes del caso:' },
    {
      type: 'list',
      items: [
        '**Si la entrega se retrasara al ejercicio siguiente.** A 31/12/2026, la compradora, que aplica el PGC de Pymes, tendría 30.000 € en la 239, dentro de «Inmovilizado material». El vendedor, que aplica el PGC, tendría 30.000 € en «Anticipos de clientes», sin ingreso; si la entrega fuera a más de doce meses, en la 181, dentro de «Periodificaciones a largo plazo».',
        '**Si la factura del anticipo llegara el 10/07/2026.** El vendedor declara igualmente el IVA en el 2T, porque el devengo es el cobro. La compradora no puede deducirlo hasta el 3T, el periodo en que recibe la factura.',
        '**Si fueran mercaderías.** Cambian las cuentas, no el razonamiento: la compradora usaría la 407 en lugar de la 239, la 600 «Compras de mercaderías» en lugar de la 213 y la 400 «Proveedores» en lugar de la 523. El vendedor seguiría con la 701 si fabrica lo que vende; si lo revende, usaría la 700 «Ventas de mercaderías».',
        '**Si al cierre la máquina estuviera recibida pero aún en montaje.** Su coste figuraría en la 233 «Maquinaria en montaje» (la 239 se abonaría con cargo a la 233) hasta que quede en condiciones de funcionamiento; entonces pasa a la 213 y empieza a amortizarse.',
      ],
    },

    /* ── 9 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Si el pedido se anula: devolución del anticipo', id: 'devolucion' },
    {
      type: 'paragraph',
      text: 'Cuando el pedido se anula con arreglo a Derecho o a los usos de comercio, la operación gravada queda sin efecto y la base se modifica ([art. 80.Dos LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a80); [AEAT, Manual práctico de IVA 2026](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-04-sujetos-pasivos-repercusion-impositivo/importe-sobre-que-se-aplica-bi/entregas-bienes-prestaciones-servicios/modificacion-base-imponible.html)).',
    },
    {
      type: 'list',
      items: [
        '**El proveedor** debe rectificar la cuota repercutida dentro de los cuatro años siguientes a la circunstancia que deja sin efecto la operación ([art. 89 LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a89)). Lo hace con una [[factura rectificativa]] que identifica la factura del anticipo, expedida en una serie específica en cuanto conoce la causa y remitida al cliente ([arts. 6.1.a) y 15 del Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a15)). Sin ella, no puede reducir la base ([art. 24.1 del Reglamento del IVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a24)). Para minorar el IVA, puede pedir la rectificación de la autoliquidación o regularizar en el periodo en que deba rectificar (o en los siguientes, hasta un año); si regulariza así, debe reintegrar la cuota al cliente. En el 303, la modificación va en las casillas 14 y 15, con signo negativo ([instrucciones del modelo 303](https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/iva/modelo-303-iva-autoliquidacion_/instrucciones-2026/instrucciones-02-12-2t-4t-2026.html)).',
        '**El cliente** minora la deducción en la declaración del periodo en que **recibe** la factura rectificativa ([art. 114.Dos.2.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a114)), en las casillas 40 y 41 del 303. No necesita presentar una autoliquidación rectificativa del periodo en que dedujo.',
        '**En contabilidad**, el proveedor carga la 438 y la 477 y abona el banco. El cliente, a la inversa: abona la 407, 239 o 209 y la 472, y carga el banco ([cuentas 472 y 477](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4-2)).',
      ],
    },
    {
      type: 'example',
      title: 'Pedido de luminarias anulado y anticipo devuelto',
      scenario:
        'Distribucions del Vallès, S.L. (Granollers, PGC de Pymes), con derecho a deducir todo el IVA y autoliquidación trimestral, encarga a un fabricante de luminarias 20.000 € más IVA de mercaderías para revender. El 10/03/2026 paga un anticipo del 30 % y recibe su factura. El 15/04/2026 el fabricante comunica que no puede servir el pedido, y el 30/04/2026 lo anulan de mutuo acuerdo. Ese mismo día el fabricante devuelve todo el anticipo y expide la factura rectificativa R-2026/003, de su serie de rectificativas, que identifica la factura del anticipo y anula su base y su cuota. Tipo: 21 %.',
      steps: [
        {
          label: 'Anticipo pagado el 10/03/2026: base, IVA y total.',
          formula: '20.000 € × 30 % = 6.000,00 € · 6.000 € × 21 % = 1.260,00 €',
          result: '7.260,00 €',
        },
        {
          label: 'Compradora, 10/03: son mercaderías, así que lo registra en la 407 y deduce la cuota en el 1T.',
          formula: '407 (6.000) y 472 (1.260) a 572 (7.260)',
          result: '1.260 € deducidos en el 1T',
        },
        {
          label: 'Fabricante, 10/03: pasivo en la 438 e IVA devengado en el 1T.',
          formula: '572 (7.260) a 438 (6.000) y 477 (1.260)',
          result: '1.260 € declarados en el 1T',
        },
        {
          label: 'Rectificativa R-2026/003 y devolución, 30/04: cada uno revierte su asiento.',
          formula: 'Compradora: 572 a 407 y 472 · Fabricante: 438 y 477 a 572',
          result: '−6.000,00 € de base y −1.260,00 € de cuota',
        },
        {
          label: 'IVA en el 303 del 2T 2026: el fabricante regulariza en las casillas 14 y 15 y reintegra la cuota, que va dentro de los 7.260 € devueltos; la compradora minora su deducción en las casillas 40 y 41.',
          formula: 'Arts. 89.Cinco y 114.Dos.2.º LIVA',
          result: 'Fabricante: −1.260 € de IVA devengado · Compradora: −1.260 € de IVA deducible',
        },
      ],
      conclusion:
        'Ninguno de los dos presenta una autoliquidación rectificativa del 1T: la compradora regulariza en el periodo en que recibe la rectificativa, sin recargo, y la 407, la 438, la 472 y la 477 vuelven a quedar como estaban antes del pedido.',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Antes de rectificar, lee el contrato',
      text: 'Si el proveedor se queda una parte del anticipo al resolverse la operación, las cantidades retenidas con arreglo a derecho forman parte de la base ([art. 78.Dos.5.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a78)): esa parte no se rectifica. A estas cantidades no se aplica la regla de que, si la factura no repercute el IVA, el precio no lo incluía (art. 78.Cuatro). Si lo retenido es una indemnización, el tratamiento puede ser otro: calificar una señal, unas arras o una penalización depende del contrato. No hemos localizado una consulta de la DGT específica sobre anticipos devueltos: en estos casos, y si hay dudas con el plazo de cuatro años, revísalo con el área fiscal.',
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 78', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a78', date: '2026-10-29', kind: 'norma' },
        { label: 'Ley 37/1992, del IVA, arts. 80 y 89', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a80', date: '2026-10-29', kind: 'norma' },
      ],
    },

    /* ── 10 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Provisión de fondos: suplidos y anticipo de honorarios', id: 'provision-de-fondos' },
    {
      type: 'paragraph',
      text: 'Los profesionales (abogados, gestorías, asesorías) suelen pedir una **provisión de fondos**, que puede mezclar dos cosas distintas:',
    },
    {
      type: 'list',
      items: [
        '**Provisión para suplidos.** Dinero para pagar en nombre y por cuenta del cliente, con su mandato expreso, aranceles notariales, tasas o registros. No forma parte de la base del IVA, el profesional debe justificar el importe exacto y no deduce el IVA que figure en esas facturas ([art. 78.Tres.3.º LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a78)). Los suplidos se acreditan con facturas expedidas a cargo del cliente, no del intermediario ([AEAT, «¿Cómo calculo la base imponible?»](https://sede.agenciatributaria.gob.es/Sede/iva/calculo-iva-repercutido-clientes/calculo-base-imponible.html)).',
        '**Provisión a cuenta de honorarios.** Es un pago anticipado de un servicio sujeto: devenga IVA al cobrarse y obliga a expedir factura ([art. 75.Dos LIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75); [art. 2.1 del Reglamento de facturación](https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a2-2)). Aunque los servicios de abogados y procuradores en un procedimiento judicial devengan al concluir, la AEAT exceptúa los pagos anticipados.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Los profesionales personas físicas en estimación directa registran estas cantidades en su libro registro de provisiones de fondos y suplidos ([art. 68.5.d) RIRPF](https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a68)). En contabilidad, el PGC no tiene una cuenta específica para los anticipos a acreedores por servicios ni para los fondos recibidos para suplidos: la subcuenta y su presentación las decide el área contable.',
    },
    {
      type: 'table',
      caption: 'Ejemplo de lectura: provisión de fondos de 1.063 € de un abogado a un particular',
      columns: ['Concepto', 'Importe', 'IVA', 'Tratamiento'],
      rows: [
        ['Notario y Registro, pagados en nombre del cliente con mandato expreso', '700,00 €', '—', 'Suplido: fuera de la base, si se justifica con facturas a nombre del cliente'],
        ['A cuenta de honorarios', '300,00 €', '63,00 €', 'Pago anticipado: devenga IVA al cobrarse (21 % × 300 €)'],
        ['**Total de la provisión**', '**1.000,00 €**', '**63,00 €**', '**1.063,00 € a cobrar**'],
      ],
      numeric: [1, 2],
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Retención del IRPF al pagar el anticipo',
      text: 'Si el profesional es persona física y quien paga está obligado a retener (una sociedad o un empresario que paga en el ejercicio de su actividad), la retención se practica **al pagar el anticipo**, porque la obligación nace cuando se satisfacen las rentas. El tipo general es el 15 % sobre los ingresos íntegros; el 7 % en el año de inicio de la actividad y en los dos siguientes, si el profesional no ejerció ninguna actividad profesional el año anterior y lo comunica al pagador. Si el cliente del ejemplo fuera una sociedad, retendría 45 € (15 % × 300 €) al pagar la provisión. El IVA no se computa en los ingresos íntegros de la actividad, así que la práctica habitual es retener sobre los honorarios sin IVA; no hemos localizado una fuente oficial que lo diga expresamente para la retención, así que, ante la duda, confírmalo con el área fiscal.',
      refs: [
        { label: 'Real Decreto 439/2007, Reglamento del IRPF, arts. 76 y 78', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a78', date: '2026-10-29', kind: 'norma' },
        { label: 'Real Decreto 439/2007, Reglamento del IRPF, art. 95', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a95', date: '2026-10-29', kind: 'norma' },
        {
          label: 'AEAT, Folleto de actividades económicas: 7. Otras obligaciones fiscales. Retenciones',
          url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/folleto-actividades-economicas/7-otras-obligaciones-fiscales-retenciones.html',
          date: '2026-10-29',
          kind: 'criterio',
        },
        {
          label: 'AEAT, Manual práctico de Renta 2025: IVA devengado',
          url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c07-rendimientos-actividades-economicas-estimacion-directa/fase-1-determinacion-rendimiento-neto/ingresos-integros-computables/iva-devengado.html',
          date: '2026-10-29',
          kind: 'criterio',
        },
      ],
    },

    /* ── 11 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Errores frecuentes y cómo evitarlos', id: 'errores' },
    {
      type: 'list',
      items: [
        '**Registrar la factura definitiva por el precio total sin cancelar el anticipo.** El activo o la compra quedan duplicados en el importe del anticipo y la 239 o la 407 conservan un saldo que no corresponde a ningún pedido. Si además la factura repercute el IVA del precio total, el del anticipo se deduce dos veces. *Cómo evitarlo:* antes de registrar una factura definitiva, busca anticipos del mismo proveedor en la 407, 239 o 209 y comprueba que la base y la cuota sean solo las pendientes (apartado 5).',
        '**Registrar el anticipo como gasto, como compra o como inmovilizado en uso.** Cargado en la 600 o en el subgrupo 62, adelanta el gasto; cargado en la 213, empieza a amortizarse antes de tiempo. *Cómo evitarlo:* usa la 407, 239 o 209 hasta la recepción a conformidad y amortiza solo desde la puesta en funcionamiento.',
        '**Declarar el IVA del anticipo en el periodo de la factura, no en el del cobro.** Si cobras el 28 de septiembre y facturas el 10 de octubre, el IVA es del 3T. *Cómo evitarlo:* el devengo lo marca el justificante bancario. Si la fecha del cobro difiere de la de expedición, debe constar en la factura.',
        '**Deducir el IVA de una proforma o de una factura de anticipo aún no pagada.** No hay factura válida o no hay devengo. *Cómo evitarlo:* deduce cuando tengas la factura y conste el pago.',
        '**Aplicar el devengo del anticipo donde no corresponde.** Repercutir IVA en el anticipo de una entrega intracomunitaria exenta o autoliquidar el IVA de un anticipo pagado a un proveedor comunitario. *Cómo evitarlo:* antes de facturar o registrar un anticipo internacional, identifica la operación: entrega intracomunitaria, adquisición intracomunitaria o importación (apartado 3).',
        '**Tratar una provisión de fondos como un bloque.** Toda sin IVA, como si fueran suplidos, o toda con IVA, como si fueran honorarios. *Cómo evitarlo:* pide el desglose y las facturas de los suplidos a nombre del cliente; aplica el IVA, y en su caso la retención, solo a los honorarios (apartado 10).',
      ],
    },

    /* ── 12 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Lista de comprobación', id: 'comprobacion' },
    { type: 'paragraph', text: 'Antes de cerrar el trimestre o el ejercicio de un cliente con anticipos, comprueba que:' },
    {
      type: 'list',
      items: [
        'Cada pago o cobro «a cuenta» tiene su factura de anticipo, con la fecha del cobro si difiere de la de expedición (salvo en las entregas intracomunitarias exentas, que no la exigen).',
        'El IVA de cada anticipo cobrado está declarado en el periodo del cobro, no en el de la factura.',
        'Los anticipos de entregas intracomunitarias exentas y de adquisiciones intracomunitarias no llevan IVA devengado por el anticipo.',
        'Cada anticipo está en la cuenta de su destino: 407, 239 o 209 (comprador); 438 o 181 (vendedor).',
        'Ningún anticipo de inmovilizado se amortiza; la amortización empieza cuando el bien está en condiciones de funcionamiento, según el acta de puesta en marcha.',
        'Cada factura definitiva cita la factura de anticipo y repercute solo la base y la cuota pendientes; la suma de bases es igual al precio pactado.',
        'Al cierre, el saldo de la 407, 239, 209, 438 y 181 coincide con pedidos pendientes de entregar, proveedor a proveedor y cliente a cliente.',
        'Los anticipos a más de un año están clasificados a largo plazo y se ha valorado su componente financiero.',
        'Cada anticipo devuelto tiene su factura rectificativa (serie específica, con referencia a la factura de anticipo) y su regularización en el 303 de ambas partes.',
        'Las provisiones de fondos están desglosadas en suplidos y honorarios, con la retención practicada al pagar los honorarios cuando procede.',
      ],
    },
  ],
  keyTerms: [
    {
      term: 'anticipo',
      definition: 'Pago hecho antes de recibir un bien o un servicio, a cuenta de su precio. Para quien paga es un activo (407, 239 o 209); para quien cobra, un pasivo (438 o, a largo plazo, 181). Salvo excepciones, su IVA se devenga al cobrarse.',
    },
    {
      term: 'factura de anticipo',
      definition: 'La que documenta un pago recibido antes de la entrega o del servicio. Es obligatoria salvo en las entregas intracomunitarias exentas e indica la fecha del cobro si difiere de la de expedición.',
    },
    {
      term: 'factura definitiva',
      definition: 'La que documenta la entrega o el servicio. Para no duplicar, descuenta el anticipo ya facturado y repercute solo la cuota pendiente.',
    },
    {
      term: 'factura rectificativa',
      definition: 'La que corrige o anula otra, en una serie específica y con referencia a la factura rectificada. Es obligatoria cuando la operación queda sin efecto, por ejemplo, si se anula el pedido y se devuelve el anticipo.',
    },
    {
      term: 'bien de inversión',
      definition: 'Concepto del IVA, independiente de la cuenta contable: bien corporal destinado normalmente a usarse más de un año como instrumento de trabajo o medio de explotación. Quedan fuera, entre otros, los de valor inferior a 3.005,06 € (art. 108 LIVA).',
    },
    {
      term: 'suplido',
      definition: 'Cantidad pagada en nombre y por cuenta del cliente, con mandato expreso. No forma parte de la base del IVA y se justifica con facturas u otros justificantes a nombre del cliente (en aduanas, la declaración de importación).',
    },
  ],
  takeaway:
    'Un anticipo no es una compra ni una venta: es un activo para quien paga y un pasivo para quien cobra, pero su IVA se devenga al cobrarse, salvo excepciones como las operaciones intracomunitarias. Registra cada anticipo con su factura y cancélalo con la definitiva, que solo debe repercutir lo pendiente: así no duplicas ni el activo ni el IVA.',
  sources: [
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 75 (devengo y pagos anticipados)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a75', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 76 (devengo en las adquisiciones intracomunitarias)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a76', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 77 (devengo en las importaciones)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a77', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 68 (lugar de las entregas de bienes)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a68', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 78 (base imponible, suplidos y percepciones retenidas)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a78', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 80 (modificación de la base imponible)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a80', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 84 (sujetos pasivos e inversión del sujeto pasivo)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a84', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 89 (rectificación de las cuotas repercutidas)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a89', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: arts. 90 y 91 (tipos impositivos)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a90', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: arts. 97 a 99 (requisitos, nacimiento y ejercicio del derecho a deducir)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a97', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: arts. 107 y 108 (bienes de inversión)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a108', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 37/1992, del Impuesto sobre el Valor Añadido: art. 114 (rectificación de deducciones)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a114', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 1624/1992, Reglamento del IVA: art. 24 (modificación de la base imponible)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a24', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 1619/2012, Reglamento de facturación: art. 2 (obligación de expedir factura)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a2-2', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 1619/2012, Reglamento de facturación: art. 6 (contenido de la factura)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 1619/2012, Reglamento de facturación: art. 11 (plazo para expedir la factura)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a11', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 1619/2012, Reglamento de facturación: art. 15 (facturas rectificativas)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a15', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 439/2007, Reglamento del IRPF: art. 68 (libros registro de los profesionales)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a68', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 439/2007, Reglamento del IRPF: arts. 76 y 78 (obligados a retener y nacimiento de la obligación)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a76', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 439/2007, Reglamento del IRPF: art. 95 (retención de actividades profesionales)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a95', date: '2026-10-29', kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades: art. 11 (imputación temporal)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11', date: '2026-10-29', kind: 'norma' },
    { label: 'Plan General de Contabilidad, cuarta parte: cuadro de cuentas (grupo 4)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4', date: '2026-10-29', kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 1 (cuenta 181)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo1-2', date: '2026-10-29', kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 2 (cuentas 209, 230/237 y 239)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo2-2', date: '2026-10-29', kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 4 (cuentas 407, 438, 472 y 477)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo4-2', date: '2026-10-29', kind: 'norma' },
    { label: 'Plan General de Contabilidad, tercera parte: modelo normal de balance', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#balance', date: '2026-10-29', kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 10.ª (existencias)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A10', date: '2026-10-29', kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 11.ª (moneda extranjera)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A11', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: quinta parte, definiciones y relaciones contables (grupo 4)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#grupo4-2', date: '2026-10-29', kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: modelos de cuentas anuales (balance)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#iimodelosdecuentasanuales', date: '2026-10-29', kind: 'norma' },
    { label: 'Resolución del ICAC de 10 de febrero de 2021, sobre reconocimiento de ingresos: arts. 1 y 14', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a1-6', date: '2026-10-29', kind: 'norma' },
    { label: 'Resolución del ICAC de 10 de febrero de 2021, sobre reconocimiento de ingresos: arts. 28 y 33 (anticipos y presentación)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-2155#a2-10', date: '2026-10-29', kind: 'norma' },
    { label: 'Resolución del ICAC de 1 de marzo de 2013 (inmovilizado material): norma segunda, inicio de la amortización', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-2557#segunda', date: '2026-10-29', kind: 'norma' },
    {
      label: 'AEAT, Manual práctico de IVA 2026: devengo en las entregas de bienes y prestaciones de servicios',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-04-sujetos-pasivos-repercusion-impositivo/cuando-se-producen-operaciones-efectos-devengo/entregas-bienes-prestaciones-servicios-devengo.html',
      date: '2026-10-29',
      kind: 'criterio',
    },
    {
      label: 'AEAT, Manual práctico de IVA 2026: modificación de la base imponible',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-04-sujetos-pasivos-repercusion-impositivo/importe-sobre-que-se-aplica-bi/entregas-bienes-prestaciones-servicios/modificacion-base-imponible.html',
      date: '2026-10-29',
      kind: 'criterio',
    },
    { label: 'AEAT, «¿En qué momento tengo que repercutir el IVA (devengo)?»', url: 'https://sede.agenciatributaria.gob.es/Sede/iva/calculo-iva-repercutido-clientes/que-momento-tengo-que-repercutir-iva.html', date: '2026-10-29', kind: 'criterio' },
    { label: 'AEAT, «Obligación de facturar»', url: 'https://sede.agenciatributaria.gob.es/Sede/iva/facturacion-registro/facturacion-iva/obligacion-facturar.html', date: '2026-10-29', kind: 'criterio' },
    { label: 'AEAT, «¿Cómo calculo la base imponible?»', url: 'https://sede.agenciatributaria.gob.es/Sede/iva/calculo-iva-repercutido-clientes/calculo-base-imponible.html', date: '2026-10-29', kind: 'criterio' },
    {
      label: 'AEAT, modelo 303: instrucciones 2026 (casillas 14, 15, 40 y 41)',
      url: 'https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/iva/modelo-303-iva-autoliquidacion_/instrucciones-2026/instrucciones-02-12-2t-4t-2026.html',
      date: '2026-10-29',
      kind: 'criterio',
    },
    {
      label: 'AEAT, Manual práctico de Renta 2025: IVA devengado en los ingresos íntegros',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c07-rendimientos-actividades-economicas-estimacion-directa/fase-1-determinacion-rendimiento-neto/ingresos-integros-computables/iva-devengado.html',
      date: '2026-10-29',
      kind: 'criterio',
    },
    {
      label: 'AEAT, Folleto de actividades económicas: 7. Otras obligaciones fiscales. Retenciones',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/folleto-actividades-economicas/7-otras-obligaciones-fiscales-retenciones.html',
      date: '2026-10-29',
      kind: 'criterio',
    },
  ],
  quiz: {
    id: 'con-07-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'con-07-q1',
        prompt:
          'Envasats del Congost pagó el 15/06/2026 un anticipo de 30.000 € más 6.300 € de IVA por una envasadora de 100.000 € y lo registró en la 239. El 20/07/2026 recibe la máquina, ya instalada, con una factura definitiva de 70.000 € de base y 14.700 € de IVA que descuenta el anticipo. ¿Qué asiento registra?',
        options: [
          {
            id: 'a',
            text: 'Cargo en la 213 «Maquinaria» por 100.000 € y en la 472 por 21.000 €, con abono a la 523 «Proveedores de inmovilizado a corto plazo» por 121.000 €.',
            feedback: 'Ignora el anticipo: la 239 se queda con 30.000 € sin pedido detrás, la deuda con el proveedor supera en 36.300 € lo que se le debe y los 6.300 € de IVA del anticipo se deducen dos veces.',
          },
          { id: 'b', text: 'Cargo en la 213 por 100.000 € y en la 472 por 14.700 €, con abono a la 239 por 30.000 € y a la 523 por 84.700 €.' },
          {
            id: 'c',
            text: 'Cargo en la 213 por 70.000 € y en la 472 por 14.700 €, con abono a la 523 por 84.700 €.',
            feedback: 'La máquina quedaría valorada en 70.000 € y la 239, con 30.000 €: el anticipo es parte del precio de adquisición y debe pasar a la 213.',
          },
          {
            id: 'd',
            text: 'Cargo en la 213 por 100.000 € y en la 472 por 21.000 €, con abono a la 239 por 36.300 € y a la 523 por 84.700 €.',
            feedback: 'La 239 recogió solo la base (30.000 €). Abonarla por 36.300 € la deja con saldo acreedor, y cargar 21.000 € en la 472 vuelve a deducir los 6.300 € del anticipo.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Con la recepción a conformidad, la 239 se abona con cargo al subgrupo 21 y la 213 recoge el precio total. La factura definitiva solo documenta la cuota devengada con la entrega (14.700 €); la del anticipo ya se dedujo en junio, y no se puede deducir más que la cuota consignada en cada factura (art. 97.Tres LIVA). Debe = 114.700 € = haber.',
        ref: 'Apartado 8 · Caso resuelto: anticipo del 30 % por una envasadora',
      },
      {
        id: 'con-07-q2',
        prompt:
          'Un cliente fabricante, con sede en Vic, cobra el 05/10/2026 un anticipo de 15.000 € de una sociedad francesa, identificada a efectos del IVA, por una máquina que enviará a Lyon en diciembre como entrega intracomunitaria exenta. ¿Qué tratamiento tiene el anticipo?',
        options: [
          {
            id: 'a',
            text: 'Expedir factura del anticipo con IVA al 21 % y declararlo en el 303 del 4T.',
            feedback: 'Repercute IVA en una entrega que estará exenta y aplica el devengo del anticipo, que la ley excluye para las entregas del art. 25 LIVA.',
          },
          {
            id: 'b',
            text: 'Expedir factura del anticipo exenta y declarar en octubre el devengo del anticipo.',
            feedback: 'El devengo por pago anticipado no se aplica a estas entregas, y el Reglamento de facturación exceptúa sus anticipos de la obligación de facturar.',
          },
          {
            id: 'c',
            text: 'El cobro no devenga IVA ni obliga a expedir factura por el anticipo; se registra en la 438, y el IVA de la entrega exenta se devengará con las reglas propias de las entregas intracomunitarias.',
          },
          {
            id: 'd',
            text: 'No se registra nada hasta la entrega, porque el anticipo no devenga IVA.',
            feedback: 'Que no haya devengo de IVA no significa que no haya registro contable: el cobro es un pasivo con el cliente (438).',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'El art. 75.Dos LIVA excluye del devengo por pagos anticipados las entregas del art. 25, y el art. 2.1 del Reglamento de facturación exceptúa sus anticipos de la obligación de facturar. La entrega se devengará el día 15 del mes siguiente al inicio del transporte o, si antes se expide factura por la operación, en la fecha de esa factura (art. 75.Uno.8.º LIVA).',
        ref: 'Apartado 3 · El IVA del anticipo: se devenga al cobrarse',
      },
      {
        id: 'con-07-q3',
        prompt:
          'Revisas las facturas de octubre de Papereria Osona, S.L., que vende material y mobiliario de oficina, tributa en el régimen general del IVA y tiene derecho a deducir todo el impuesto. Encuentras una de un carpintero, de 10/10/2026: «Pedido 312. 30 % a la firma. Fabricación de mostrador y estanterías», 3.000 € de base y 630 € de IVA, pagada ese día. No hay albarán. ¿Qué haces?',
        options: [
          {
            id: 'a',
            text: 'La registras en la 216 «Mobiliario» y empiezas a amortizarla en octubre.',
            feedback: 'Los muebles aún no existen: no están en condiciones de funcionamiento y no pueden amortizarse. Hasta la recepción, es un anticipo.',
          },
          {
            id: 'b',
            text: 'No la registras hasta que llegue la factura final, porque una factura de anticipo no permite deducir el IVA.',
            feedback: 'El IVA del anticipo pagado está devengado y hay factura: es deducible en el periodo en que se recibe.',
          },
          {
            id: 'c',
            text: 'La registras como gasto del mes en una cuenta del grupo 6.',
            feedback: 'El anticipo es un activo, no un gasto: todavía no hay ni bien recibido ni consumo.',
          },
          {
            id: 'd',
            text: 'La tratas como anticipo, deduces los 630 € y pides al cliente el pedido y el destino de los muebles: si son para equipar la tienda, van a la 239; si son para revenderlos, a la 407.',
          },
        ],
        correctOptionId: 'd',
        explanation:
          'El concepto («30 % a la firma»), la referencia al pedido y la falta de albarán indican un anticipo. La factura no dice si los muebles serán inmovilizado o existencias, así que hay que preguntar al cliente. El IVA se deduce porque el pago está hecho y la factura está en su poder (arts. 98 y 99 LIVA).',
        ref: 'Apartado 6 · Cómo identificar un anticipo en facturas y documentos',
      },
    ],
  },
  version: 1,
  verifiedAt: '2026-10-29',
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
    id: 'con-07-b1',
    prompt:
      'Un cliente cobra el 28/09/2026 un anticipo de otra empresa española por una entrega de bienes que hará en noviembre. ¿Cuándo debe expedir la factura del anticipo y en qué autoliquidación trimestral declara su IVA?',
    options: [
      { id: 'a', text: 'Antes del 16/10/2026, y declara el IVA en el 303 del 3T 2026.' },
      {
        id: 'b',
        text: 'Antes del 16/10/2026, y declara el IVA en el 303 del 4T 2026, porque la factura es de octubre.',
        feedback: 'El IVA se declara en el periodo del devengo, que es el del cobro, aunque la factura se expida después.',
      },
      {
        id: 'c',
        text: 'Al entregar los bienes en noviembre, con una sola factura por el total.',
        feedback: 'El anticipo obliga a expedir su propia factura, y su IVA ya se devengó en septiembre.',
      },
      {
        id: 'd',
        text: 'No hace falta factura: basta el justificante bancario hasta la entrega.',
        feedback: 'El Reglamento de facturación exige factura por los pagos recibidos antes de la entrega; sin ella, la empresa que paga no puede deducir.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'El devengo se produce el 28/09/2026, al cobrar (art. 75.Dos LIVA). Si el destinatario es empresario, la factura se expide antes del día 16 del mes siguiente al devengo (art. 11.1 del Reglamento de facturación), pero el IVA se declara en el periodo del cobro, como recuerda la AEAT.',
    ref: 'Formación «Facturas de anticipo», apartado 4 · La factura del anticipo y la deducción del IVA',
  },
  {
    id: 'con-07-b2',
    prompt:
      'Tu cliente dedujo en el 1T 2026 los 1.260 € de IVA de un anticipo. El proveedor anula el pedido de mutuo acuerdo, le devuelve el anticipo y le envía la factura rectificativa el 30/04/2026. ¿Qué debe hacer tu cliente con esos 1.260 €?',
    options: [
      {
        id: 'a',
        text: 'Presentar una autoliquidación rectificativa del 1T, con recargo e intereses.',
        feedback: 'Es la regla general cuando se minoran deducciones, pero si la causa es una de las del art. 80 LIVA, como la anulación del pedido, la rectificación va al periodo en que se recibe la factura rectificativa.',
      },
      { id: 'b', text: 'Minorar sus deducciones en el 303 del 2T 2026, el periodo en que recibe la rectificativa.' },
      {
        id: 'c',
        text: 'Nada, porque cuando los dedujo la deducción era correcta.',
        feedback: 'La rectificación de las cuotas obliga a rectificar la deducción cuando la minora.',
      },
      {
        id: 'd',
        text: 'Esperar a que el proveedor regularice su IVA y a que la AEAT se lo comunique.',
        feedback: 'La obligación del cliente no depende de que el proveedor regularice: nace al recibir la rectificativa.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'El pedido ha quedado sin efecto con arreglo a Derecho (art. 80.Dos LIVA). El proveedor rectifica con factura rectificativa y el cliente minora su deducción en la declaración del periodo en que la recibe (art. 114.Dos.2.º LIVA), en las casillas 40 y 41 del 303.',
    ref: 'Formación «Facturas de anticipo», apartado 9 · Si el pedido se anula: devolución del anticipo',
  },
  {
    id: 'con-07-b3',
    prompt:
      'Un abogado cobra a un particular una provisión de fondos: 700 € para pagar en su nombre, con mandato expreso, al notario y al Registro, que facturan al cliente, y 300 € más IVA a cuenta de sus honorarios por un asunto que terminará el año que viene. ¿Sobre qué importe se devenga IVA al cobrar la provisión?',
    options: [
      {
        id: 'a',
        text: 'Sobre 1.000 €: todo lo cobrado por el abogado es contraprestación de su servicio.',
        feedback: 'Las sumas pagadas en nombre y por cuenta del cliente, con mandato expreso, no forman parte de la base (art. 78.Tres.3.º LIVA).',
      },
      {
        id: 'b',
        text: 'Sobre nada hasta que termine el asunto, porque los servicios de abogados se devengan al concluir.',
        feedback: 'La AEAT precisa que esa regla rige salvo pagos anticipados, y la ley devenga los pagos anticipados al cobrarse.',
      },
      { id: 'c', text: 'Sobre 300 €: los honorarios cobrados por anticipado devengan al cobrarse, y los 700 € son suplidos.' },
      {
        id: 'd',
        text: 'Sobre 700 €: los honorarios se facturarán al final y los suplidos se facturan al cobrarse.',
        feedback: 'Invierte la regla: los suplidos no integran la base y los honorarios anticipados sí devengan.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Los 300 € son un pago anticipado de un servicio sujeto (art. 75.Dos LIVA): IVA de 63 € al 21 %. Los 700 € son suplidos si el abogado justifica su cuantía (art. 78.Tres.3.º LIVA) y se acreditan con facturas a nombre del cliente.',
    ref: 'Formación «Facturas de anticipo», apartado 10 · Provisión de fondos: suplidos y anticipo de honorarios',
  },
  {
    id: 'con-07-b4',
    prompt:
      'Una sociedad paga el 01/10/2026 a una abogada (persona física, con más de tres años de ejercicio) un anticipo de 2.000 € de honorarios más IVA. ¿Cuánto le transfiere?',
    options: [
      {
        id: 'a',
        text: '2.420 €: la retención se practicará cuando llegue la factura final.',
        feedback: 'La obligación de retener nace al satisfacer las rentas, también si se pagan por anticipado (art. 78.1 RIRPF).',
      },
      { id: 'b', text: '2.120 €: 2.000 € + 420 € de IVA − 300 € de retención (15 % de 2.000 €).' },
      {
        id: 'c',
        text: '2.057 €: 2.000 € + 420 € de IVA − 363 € de retención (15 % de 2.420 €).',
        feedback: 'El IVA no forma parte de los ingresos íntegros de la actividad: la retención se calcula sobre los honorarios.',
      },
      {
        id: 'd',
        text: '2.280 €: 2.000 € + 420 € de IVA − 140 € de retención (7 % de 2.000 €).',
        feedback: 'El 7 % es para el año de inicio de la actividad y los dos siguientes, si no se ejerció actividad profesional el año anterior y se comunica al pagador; no es el caso.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'La sociedad está obligada a retener (art. 76.1 RIRPF) y lo hace al pagar el anticipo (art. 78.1 RIRPF), al 15 % sobre los ingresos íntegros (art. 95.1 RIRPF). IVA: 2.000 € × 21 % = 420 €; retención: 2.000 € × 15 % = 300 €; transferencia: 2.000 + 420 − 300 = 2.120 €.',
    ref: 'Formación «Facturas de anticipo», apartado 10 · Provisión de fondos: suplidos y anticipo de honorarios',
  },
];

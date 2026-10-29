import type { Formation, QuizQuestion } from '@flm/shared';

/* Fuentes (BOE, DOUE publicado en el BOE y Sede de la AEAT), consultadas el 29/10/2026. */
const LIVA = 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740';
const RIVA = 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925';
const PGC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884';
const PYMES = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966';
const ORDEN_303 = 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-1761';
const CAU = 'https://www.boe.es/doue/2013/269/L00001-00101.pdf';
const CAU_CORRECCION = 'https://www.boe.es/doue/2013/287/L00090-00090.pdf';
const RE_2447 = 'https://www.boe.es/doue/2015/343/L00558-00893.pdf';
const AEAT_DIFERIR = 'https://sede.agenciatributaria.gob.es/Sede/iva/iva-operaciones-comercio-exterior/iva-importacion-diferir-pago.html';
const AEAT_303 = 'https://www3.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/iva/modelo-303-iva-autoliquidacion_/instrucciones-2026.html';
const AEAT_PRE303 = 'https://sede.agenciatributaria.gob.es/Sede/iva/pre-303/2026/iva-deducible.html';
const AEAT_LIBRO = 'https://sede.agenciatributaria.gob.es/Sede/iva/facturacion-registro/preguntas-frecuentes/libro-registro-facturas-recibidas-iva-irpf.html';
const AEAT_SII = 'https://sede.agenciatributaria.gob.es/Sede/impuestos-tasas/iva/iva-libros-registro-iva-traves-aeat/preguntas-frecuentes/4-libro-registro-facturas-recibidas.html';
const AEAT_H1 = 'https://sede.agenciatributaria.gob.es/static_files/Sede/Tema/Aduanas/adu_electronica/info/guias_tecnicas/InfCAUGENERAL.pdf';
const AEAT_PRECAU = 'https://sede.agenciatributaria.gob.es/Sede/aduanas/novedades/2025/octubre/7/cierre-definitivo-declaracion-importacion-precau-14102025.html';
const AEAT_DECLARANTE = 'https://sede.agenciatributaria.gob.es/Sede/aduanas/novedades/2025/noviembre/24/declaracion-importacion-cau-declarante-vs-u_e_.html';
const MANUAL_IVA = 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026';
const AEAT_JUSTIFICANTES = `${MANUAL_IVA}/capitulo-05-deducciones-devoluciones/deducciones/requisitos-deduccion/justificantes-efectuar-deduccion.html`;
const AEAT_BIENES_INVERSION = `${MANUAL_IVA}/capitulo-05-deducciones-devoluciones/deducciones/regularizacion-deducciones-bienes-inversion/concepto-bienes-inversion.html`;
const AEAT_BASE = `${MANUAL_IVA}/capitulo-04-sujetos-pasivos-repercusion-impositivo/importe-sobre-que-se-aplica-bi/importaciones-bi.html`;
const AEAT_CAMBIO =
  'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-importacion-exportacion-envios-escaso-valor/3-mecanismos-recaudacion-iva/3_1-regimen-ventanilla-unica-importaciones/3_1_5-tipo-cambio.html';
const AEAT_VALOR = 'https://sede.agenciatributaria.gob.es/Sede/aduanas/deuda-aduanera-garantias-elementos/valor-mercancia/valor-transaccion-ajustes-sobre-valor-transaccion.html';
const VERIFIED = '2026-10-29';
/* Formaciones del campus que amplían partes del tema (enlaces internos). */
const CON_03 = '#/aprender/contable/amortizacion-contable-y-fiscal';
const CON_05 = '#/aprender/contable/amortizaciones';
const CON_06 = '#/aprender/contable/bienes-de-inversion';
const CON_07 = '#/aprender/contable/facturas-de-anticipo';

export const formation: Formation = {
  id: 'con-04',
  slug: 'importaciones-y-dua',
  area: 'contable',
  title: 'Importaciones y DUA: cómo contabilizar cada documento',
  intro:
    'Un cliente de Granollers, distribuidor de iluminación, te entrega en septiembre tres papeles de la misma compra: la factura de 23.400 dólares de su proveedor chino, sin IVA; una declaración de importación con una cuota de IVA de 4.258,80 €, y la factura del transitario, que vuelve a incluir esos 4.258,80 € junto a un arancel y sus honorarios. Si registras los tres como compras, duplicas el coste; si deduces el IVA con la factura del transitario, la deducción se queda sin justificante. Aquí aprenderás qué aporta cada documento, cuánto cuesta de verdad la mercancía y en qué casillas del modelo 303 va cada cuota.',
  summary:
    'Factura del proveedor, DUA y factura del transitario: cómo reconocer una importación, valorar la mercancía con aranceles y tipo de cambio, deducir el IVA con el documento correcto y declararlo en el 303.',
  coverTerm: 'DUA',
  readingMinutes: 34,
  outcomes: [
    'Reconocer una importación al revisar la factura del proveedor, la declaración de importación (DUA) y la factura del transitario, y distinguirla de una adquisición intracomunitaria.',
    'Calcular el precio de adquisición de la mercancía o de la máquina importada (con aranceles y gastos de despacho, sin el IVA deducible) y la diferencia de cambio al pagar en divisa.',
    'Deducir el IVA a la importación con el documento correcto, declararlo en las casillas del modelo 303 que corresponden y aplicar el IVA diferido cuando el cliente tiene derecho a él.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Qué es una importación (y qué no)', id: 'que-es-una-importacion' },
    {
      type: 'paragraph',
      text: `Hay [[importación de bienes]] cuando entra en el territorio del IVA español un bien que no está en libre práctica en la Unión, o un bien que llega desde un territorio tercero ([art. 18 LIVA](${LIVA}#a18)). Está sujeta al IVA sea quien sea el importador y sea cual sea el destino del bien ([art. 17 LIVA](${LIVA}#a17)). Las exenciones existen, pero quedan fuera de esta formación.`,
    },
    {
      type: 'list',
      items: [
        `**Canarias, Ceuta y Melilla son territorio tercero** a efectos del IVA ([art. 3 LIVA](${LIVA}#a3)). Ceuta y Melilla, porque no están en la Unión Aduanera; Canarias, porque, aun estando en ella, queda fuera de la armonización del IVA. Una compra a un proveedor de Las Palmas que llega a Barcelona es una importación, aunque no salga de España.`,
        `**No la confundas con la adquisición intracomunitaria**, que exige que el bien se envíe desde otro Estado miembro ([art. 15 LIVA](${LIVA}#a15)). No deciden la nacionalidad del proveedor ni la divisa de la factura, sino desde dónde viaja el bien y si se ha despachado en aduana.`,
        `**Importación aplazada.** Si, desde su entrada, la mercancía queda en depósito temporal o se vincula a un régimen del [art. 24 LIVA](${LIVA}#a24) (depósito aduanero, zona franca, importación temporal con exención total o tránsito externo, entre otros), la importación se produce cuando cesa la situación o se ultima el régimen ([art. 18.Dos LIVA](${LIVA}#a18)). El depósito distinto del aduanero es una excepción con reglas propias. Si el cliente usa depósitos aduaneros, pide al transitario en qué régimen está cada partida.`,
      ],
    },
    {
      type: 'table',
      caption: 'Tres casos que suelen confundir',
      columns: ['Situación', 'Qué es en España', 'Por qué'],
      rows: [
        ['Proveedor alemán que envía la mercancía desde Shanghái directamente a Barcelona, donde se despacha a libre práctica', 'Importación', 'El bien entra desde un país tercero sin estar en libre práctica.'],
        ['Proveedor suizo que factura en euros', 'Importación', 'La divisa no cambia nada: el bien llega desde un país tercero.'],
        [
          'Mercancía china que el proveedor ya despachó a libre práctica en otro Estado miembro y envía desde allí',
          'No hay importación en España',
          'Puede haber una adquisición intracomunitaria si se cumplen sus requisitos. Pide los documentos de transporte y, en su caso, el NIF-IVA del vendedor.',
        ],
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Cuando el importador es el proveedor',
      text: `Si quien importa es el proveedor extranjero (por ejemplo, porque vende con los derechos y el IVA pagados), su venta posterior a tu cliente se entiende realizada en España ([art. 68.Dos.1.º LIVA](${LIVA}#a68)). Tu cliente no recibe un DUA a su nombre, sino una factura de esa venta. Quién debe declarar ese IVA depende del caso: consúltalo con el área fiscal antes de registrar la factura.`,
      refs: [{ label: 'Ley 37/1992, del IVA, art. 68.Dos.1.º', url: `${LIVA}#a68`, date: VERIFIED, kind: 'norma' }],
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Tres documentos, tres funciones', id: 'tres-documentos' },
    {
      type: 'paragraph',
      text: 'Lo habitual es que te lleguen tres papeles de la misma compra. Cada uno hace un trabajo distinto y ninguno sustituye a los otros: si los registras los tres como compras, duplicas el coste.',
    },
    {
      type: 'table',
      caption: 'Qué aporta cada documento',
      columns: ['Documento', 'Qué acredita', 'Qué no acredita', 'Cómo se registra'],
      rows: [
        [
          '**Factura del proveedor extranjero**',
          'El precio pactado, en divisa, y las condiciones de entrega del contrato. Sin IVA español.',
          'Ninguna deducción de IVA.',
          'Compra (600) o inmovilizado (213) contra el proveedor (4004 o 523). No se anota en el libro registro de facturas recibidas del IVA; en el SII, solo si llegó antes que el DUA, como F6, clave 13 y cuota deducible 0.',
        ],
        [
          '**Declaración de importación (DUA)**',
          'La liquidación de la Aduana a nombre del importador: valor en aduana, derechos (arancel) y cuota de IVA.',
          'El coste contable en divisa: usa el tipo de cambio aduanero, no el de contado.',
          'Arancel al coste; IVA a la 472 si es deducible. Libro registro: tipo F5, con su número de referencia y su fecha de admisión. Es el único justificante de la deducción.',
        ],
        [
          '**Factura del transitario o representante aduanero**',
          'Sus servicios (despacho, gestión, transporte…), con IVA si están sujetos, y los suplidos que pagó por cuenta del cliente.',
          'La deducción del IVA de importación que cobra como suplido.',
          'Honorarios al coste, con su IVA a la 472; suplidos sin IVA, solo para cancelar lo que el cliente le debe. Libro registro: solo la parte de su servicio.',
        ],
      ],
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'El único justificante del IVA de importación',
      text: `En las importaciones, el justificante de la deducción es «el documento en el que conste la liquidación practicada por la Administración» ([art. 97.Uno.3.º LIVA](${LIVA}#a97)). No puedes deducir más de la cuota consignada en él, y un documento que no cumple todos los requisitos no justifica la deducción salvo que se rectifique ([art. 97.Dos y Tres LIVA](${LIVA}#a97)). Si en él figura como importador otra persona, no deduzcas sin consultarlo con el área fiscal.`,
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 97', url: `${LIVA}#a97`, date: VERIFIED, kind: 'norma' },
        { label: 'AEAT, Manual práctico de IVA 2026: justificantes de la deducción', url: AEAT_JUSTIFICANTES, date: VERIFIED, kind: 'criterio' },
      ],
    },
    { type: 'heading', text: 'Suplidos y honorarios en la factura del transitario', id: 'suplidos-y-honorarios', level: 3 },
    {
      type: 'paragraph',
      text: `El transitario suele pagar en la Aduana los derechos y el IVA en nombre y por cuenta de tu cliente. Cada [[suplido]] de este tipo no forma parte de su base imponible, no lleva IVA y él no puede deducir el IVA que contiene ([art. 78.Tres.3.º LIVA](${LIVA}#a78)). Sus honorarios sí llevan IVA al 21 % ([art. 90 LIVA](${LIVA}#a90)), salvo los servicios cuyo importe ya está incluido en la base de la importación, que están exentos ([art. 64 LIVA](${LIVA}#a64)). El ejemplo de la AEAT muestra una factura de transitario con las dos cosas: una prestación exenta de 300 € y un servicio sujeto de 500 € con 105 € de cuota ([preguntas frecuentes del libro registro de facturas recibidas](${AEAT_LIBRO})).`,
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: '¿Exento o con IVA?',
      text: 'En los casos de esta formación, los honorarios de despacho no forman parte de la base de la importación y llevan IVA. Si un gasto anterior al primer lugar de destino se incluye en la base del DUA, el servicio está exento y no debe llevar IVA. Dónde está la frontera (despacho, manipulación, transporte hasta el almacén) depende de cada expediente: confírmalo con el área fiscal.',
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 64', url: `${LIVA}#a64`, date: VERIFIED, kind: 'norma' },
        { label: 'Ley 37/1992, del IVA, art. 83.Uno', url: `${LIVA}#a83`, date: VERIFIED, kind: 'norma' },
      ],
    },
    { type: 'heading', text: 'El DUA hoy: la declaración adaptada al CAU', id: 'dua-cau', level: 3 },
    {
      type: 'paragraph',
      text: `Desde el 14/10/2025 está cerrada la declaración de importación anterior al Código Aduanero de la Unión (CAU), la llamada «PreCau» ([AEAT, novedad de 07/10/2025](${AEAT_PRECAU})). La declaración ordinaria se presenta en el sistema adaptado al CAU, que la documentación técnica de la AEAT identifica como H1; los envíos de escaso valor usan la H7 ([preguntas frecuentes del SII](${AEAT_SII})). En sus páginas de IVA, la AEAT sigue llamando [[DUA]] al documento, y aquí usamos «DUA» y «declaración de importación» indistintamente.`,
    },
    {
      type: 'paragraph',
      text: `La declaración adaptada al CAU se organiza por elementos de datos, no por las casillas numeradas del antiguo DUA, aunque algunas páginas de la AEAT todavía citan casillas antiguas. La copia que recibe el cliente puede mostrarlos con etiquetas en castellano. Estos son los que necesitas para contabilizar, con el nombre que les da la [documentación técnica de la AEAT](${AEAT_H1}):`,
    },
    {
      type: 'table',
      caption: 'Datos de la declaración que debes localizar',
      columns: ['Dato (nombre técnico AEAT)', 'Qué es', 'Para qué lo usas'],
      rows: [
        ['Número de referencia de la declaración (MRN)', 'El identificador de la declaración', 'Número del registro F5 en el libro de facturas recibidas y enlace con el resto del expediente'],
        ['Fecha de aceptación o admisión (*dateOfAcceptance*)', 'El momento en que la Aduana admite la declaración', 'Devengo de la deuda aduanera y del IVA; fecha del registro F5'],
        ['Importador (*importer*) y comprador (*buyer*)', 'Quién importa y quién compra', 'Debe ser tu cliente. Si figura otra persona, no deduzcas sin consultarlo'],
        ['Exportador (*exporter*) y vendedor (*seller*)', 'Quién expide y quién vende', 'Cruce con la factura del proveedor'],
        ['Declarante (*declarant*) y tipo de representación', 'Autodespacho, representación directa o representación indirecta', 'Saber si el transitario actuó en nombre de tu cliente o en el suyo propio, y quién es deudor'],
        ['Divisa (*InvoiceCurrency*) e importe facturado de la partida (*ItemAmountInvoiced*)', 'Lo que dice la factura comercial', 'Debe cuadrar con la factura del proveedor'],
        ['Tipo de cambio en euros (*ExchangeRate*)', 'Si no se declara, el de la fecha de admisión', 'Explica por qué el valor en euros no coincide con tu contabilidad'],
        ['Ajustes al valor (*additionsAndDeductions*)', 'Sumas (códigos A) y restas (códigos B) al precio facturado', 'Detectar fletes, seguros o comisiones añadidos al valor'],
        [
          'Derechos e impuestos (*DutiesAndTaxes*)',
          'Por tributo: tipo (A00, el arancel; B00, el IVA), base, tipo de gravamen, cuota y modalidad de pago',
          'El A00 va al coste; el B00 es la cuota que deduces y declaras. La modalidad de pago y los totales que comunica la Aduana te dicen si se pagó o se difirió',
        ],
        ['Base imponible del IVA (elemento de dato 1403)', 'La base de la liquidación', 'Base del registro F5 en el SII'],
      ],
    },
    {
      type: 'paragraph',
      text: `Fíjate en el declarante. El [[representante aduanero]] puede actuar en representación directa, en nombre y por cuenta de tu cliente, o indirecta, en nombre propio pero por cuenta de él ([art. 18 del CAU](${CAU})). En la declaración CAU, el declarante actúa en autodespacho, en representación directa o en representación indirecta, y en esta última ha de ser representante aduanero ([AEAT, novedad de 24/11/2025](${AEAT_DECLARANTE})).`,
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Cómo identificarla al revisar facturas y documentos', id: 'como-identificarla' },
    {
      type: 'paragraph',
      text: 'Una importación rara vez llega etiquetada como tal. Lee cada papel buscando estas señales y cruza los datos entre documentos antes de registrar nada.',
    },
    {
      type: 'table',
      caption: 'Qué mirar en cada documento',
      columns: ['Documento', 'Campos y datos', 'Señal de importación o de alerta'],
      rows: [
        [
          '**Factura del proveedor**',
          'Nombre, dirección y país del emisor; NIF-IVA (o su ausencia); divisa; Incoterm y lugar de entrega; fecha de factura frente a fecha de embarque; descripción, cantidades y precio unitario; condiciones de pago (¿hay anticipo?)',
          'Emisor fuera de la UE o en Canarias, Ceuta o Melilla; factura sin IVA español; divisa distinta del euro (indicio, no prueba); lugar de entrega en España',
        ],
        [
          '**Documentos de transporte** (conocimiento de embarque, carta de porte aérea o terrestre)',
          'Lugar de origen y de destino; fecha de llegada; destinatario',
          'Origen fuera de la UE. El destino que figura en ellos es el «primer lugar de destino» que cuenta para la base del IVA',
        ],
        [
          '**Declaración de importación (DUA)**',
          'MRN; fecha de admisión; levante; importador y comprador; exportador y vendedor; declarante y representación; divisa e importe facturado; tipo de cambio; ajustes; A00 y B00 con base, tipo y cuota; modalidad de pago',
          'Su existencia prueba la importación. Alerta si el importador no es tu cliente, si el importe o la divisa no cuadran con la factura o si la modalidad de pago indica diferimiento y el cliente es trimestral',
        ],
        [
          '**Factura del transitario**',
          'Referencia del expediente y del DUA; honorarios con IVA; servicios exentos; suplidos («derechos», «arancel», «IVA importación», «IVA aduana»); fecha',
          'Suplidos sin IVA: el cliente ya ha soportado la liquidación de un DUA; si no lo tienes, pídelo. Alerta si el transitario repercute IVA sobre los suplidos o presenta el IVA de importación como cuota repercutida suya',
        ],
        ['**Extracto bancario**', 'Importe en divisa, tipo aplicado, comisiones y fecha', 'Base para calcular la diferencia de cambio del pago'],
      ],
    },
    { type: 'heading', text: 'Fechas e importes que deben cuadrar', id: 'fechas-e-importes', level: 3 },
    {
      type: 'list',
      items: [
        '**Fecha de admisión del DUA** = devengo del IVA y fecha del registro F5. **Fecha del levante** = notificación de la liquidación a efectos del diferimiento.',
        '**Fecha de reconocimiento de la compra** (recepción o puesta en camino): fija el tipo de cambio contable. Puede no coincidir con la fecha de la factura ni con la del DUA.',
        '**Importe facturado y divisa** del DUA = factura del proveedor. Si no cuadran, puede haber facturas parciales, gastos añadidos o un error de la declaración.',
        '**Cuota B00** del DUA = suplido «IVA importación» de la factura del transitario (si no hay diferimiento) = cuota que anotas en el F5 y deduces una sola vez.',
        '**Cuota A00** del DUA = suplido «derechos» o «arancel» de la factura del transitario = importe que sumas al coste.',
      ],
    },
    { type: 'heading', text: 'Cuándo la factura no basta y qué pedir', id: 'que-pedir', level: 3 },
    {
      type: 'table',
      caption: 'Lo que la factura del proveedor no te dice',
      columns: ['Duda', 'Por qué la factura no la resuelve', 'Qué pedir', 'A quién'],
      rows: [
        [
          '¿Hubo importación en España?',
          'Un proveedor de fuera de la UE puede enviar desde un almacén europeo con la mercancía ya en libre práctica; uno europeo puede enviar desde Asia',
          'Documentos de transporte (origen) y la declaración de importación, o la confirmación de que no la hay',
          'Cliente y transitario',
        ],
        ['¿Quién es el importador?', 'La factura no lo dice', 'La declaración de importación: importador, declarante y tipo de representación', 'Transitario o representante aduanero'],
        ['¿Cuánto IVA y cuánto arancel?', 'La factura no lleva IVA, y los suplidos del transitario no son justificante', 'La declaración con su liquidación (A00 y B00)', 'Transitario o representante aduanero'],
        [
          '¿Se pagó o se difirió el IVA?',
          'Solo consta en la declaración y en el censo del cliente',
          'Modalidad de pago del DUA y, si el cliente optó por el diferimiento, su declaración censal',
          'Transitario y cliente (o el área fiscal, que lleva su censo)',
        ],
        ['¿Qué fecha y qué tipo de cambio uso?', 'La fecha de factura no siempre es la de reconocimiento', 'Contrato o pedido con el Incoterm, y fecha de llegada o de embarque', 'Cliente'],
        [
          '¿Existencia o inmovilizado? ¿Bien corriente o de inversión para el IVA?',
          'La descripción no dice el uso',
          'Destino del bien (reventa o uso propio durante más de un año) y valor unitario',
          'Cliente',
        ],
        ['¿Qué parte de la factura del transitario lleva IVA?', 'Muchas facturas agrupan conceptos', 'Desglose de honorarios, servicios exentos y suplidos, con referencia al DUA', 'Transitario'],
        ['¿Cuántos euros salieron realmente?', 'La factura está en divisa', 'Justificante bancario del pago', 'Cliente o banco'],
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'arbol-decision',
        title: '¿Qué operación tienes delante?',
        start: 'origen',
        nodes: [
          {
            id: 'origen',
            question: '¿Desde dónde se envía el bien hasta tu cliente?',
            options: [
              { label: 'Desde fuera de la UE, o desde Canarias, Ceuta o Melilla', next: 'dua' },
              { label: 'Desde otro Estado miembro', next: 'libre-practica' },
              { label: 'No lo sé: la factura no lo dice', next: 'fin-transporte' },
            ],
          },
          {
            id: 'libre-practica',
            question: '¿La mercancía ya estaba en libre práctica en la Unión cuando salió hacia España?',
            options: [
              { label: 'Sí: es mercancía de la Unión o ya se despachó en otro Estado miembro', next: 'fin-intracomunitaria' },
              { label: 'No, se despacha a libre práctica en España', next: 'dua' },
            ],
          },
          {
            id: 'dua',
            question: '¿Hay una declaración de importación con tu cliente como importador?',
            options: [
              { label: 'Sí', next: 'pago' },
              { label: 'Hay declaración, pero figura otra persona como importador', next: 'fin-otro-importador' },
              { label: 'No: el proveedor vende con los derechos y el IVA pagados', next: 'fin-proveedor-importa' },
              { label: 'Todavía no: la mercancía está en depósito aduanero o en zona franca', next: 'fin-aplazada' },
            ],
          },
          {
            id: 'pago',
            question: '¿Cómo se liquidó el IVA de la importación, según la modalidad de pago del DUA?',
            options: [
              { label: 'Se pagó en la Aduana, normalmente a través del transitario', next: 'fin-suplido' },
              { label: 'Con pago diferido', next: 'mensual' },
            ],
          },
          {
            id: 'mensual',
            question: '¿Tu cliente liquida el IVA por meses y tiene en vigor la opción por el diferimiento (declaración censal presentada en noviembre)?',
            options: [
              { label: 'Sí', next: 'fin-diferido' },
              { label: 'No', next: 'fin-revisar-diferido' },
            ],
          },
          {
            id: 'fin-transporte',
            outcome: {
              title: 'Pide los documentos de transporte',
              text: 'La factura no dice desde dónde viaja el bien. Pide el conocimiento de embarque o la carta de porte y pregunta al transitario si hay declaración de importación.',
              tone: 'atencion',
            },
          },
          {
            id: 'fin-intracomunitaria',
            outcome: {
              title: 'No es una importación en España',
              text: 'Puede ser una adquisición intracomunitaria si se cumplen sus requisitos (art. 15 LIVA). Revísalo con los documentos de transporte y el NIF-IVA del vendedor.',
              tone: 'atencion',
            },
          },
          {
            id: 'fin-otro-importador',
            outcome: {
              title: 'No deduzcas todavía',
              text: 'Si el importador no es tu cliente, en principio esa liquidación no justifica su deducción (arts. 86 y 97 LIVA). Habla con el representante aduanero y con el área fiscal antes de deducir.',
              tone: 'derivar',
            },
          },
          {
            id: 'fin-proveedor-importa',
            outcome: {
              title: 'Consúltalo con el área fiscal',
              text: 'Si importó el proveedor, su venta posterior se entiende realizada en España (art. 68.Dos.1.º LIVA). Quién declara ese IVA depende del caso.',
              tone: 'derivar',
            },
          },
          {
            id: 'fin-aplazada',
            outcome: {
              title: 'La importación aún no se ha producido',
              text: 'Se produce cuando cesa la situación o se ultima el régimen (art. 18.Dos LIVA). Pide al transitario en qué régimen está cada partida.',
              tone: 'atencion',
            },
          },
          {
            id: 'fin-suplido',
            outcome: {
              title: 'Importación con el IVA pagado en la Aduana',
              text: 'Deduce la cuota B00 con el DUA, una sola vez. En la factura del transitario, el IVA de importación es un suplido: no lo vuelvas a registrar.',
              tone: 'resolver',
            },
          },
          {
            id: 'fin-diferido',
            outcome: {
              title: 'Importación con IVA diferido',
              text: 'La cuota va en la casilla 77 del 303 del periodo del levante. Si es deducible, puedes deducirla ya en ese periodo, en las casillas 32 y 33 (o 34 y 35).',
              tone: 'resolver',
            },
          },
          {
            id: 'fin-revisar-diferido',
            outcome: {
              title: 'Revisa la declaración',
              text: 'Solo puede diferir el importador con periodo de liquidación mensual que ha optado (art. 74.1.a RIVA). Aclara con el transitario y con el área fiscal qué ha pasado antes de presentar el 303.',
              tone: 'derivar',
            },
          },
        ],
      },
      caption: 'Recorre el árbol con el expediente de tu cliente. Si el resultado te manda consultar, no registres la deducción hasta tener la respuesta.',
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'El IVA de la importación: devengo, base y tipo de cambio', id: 'iva-de-la-importacion' },
    {
      type: 'list',
      items: [
        `**Devengo.** El IVA se devenga cuando lo hace la deuda aduanera, aunque la mercancía no pague arancel ([art. 77 LIVA](${LIVA}#a77)), y la deuda aduanera nace con la admisión de la declaración ([art. 77 del CAU](${CAU})). Esa fecha es también la que manda para aplicar las normas del régimen declarado (art. 172 del CAU). Se aplica el tipo vigente en ese momento ([art. 90.Dos LIVA](${LIVA}#a90)). No es la fecha de la factura del proveedor ni la del pago.`,
        `**Sujeto pasivo.** Quien realiza la importación, normalmente el destinatario de los bienes ([art. 86 LIVA](${LIVA}#a86)). En representación indirecta, el transitario es declarante y, junto con tu cliente, deudor de la deuda aduanera (arts. 18 y 77.3 del CAU). Quién figura como importador y quién puede deducir en esos casos debe revisarlo el área fiscal.`,
        `**Base imponible** ([art. 83.Uno LIVA](${LIVA}#a83); [Manual práctico de IVA 2026](${AEAT_BASE})): el valor en aduana, más los derechos e impuestos de la importación (salvo el IVA) y los gastos accesorios (comisiones, embalaje, transporte, seguro) hasta el primer lugar de destino en la Comunidad, si no están ya incluidos. El primer lugar de destino es el que figura en la carta de porte o en el documento que ampara la entrada de los bienes.`,
        `**Valor en aduana.** El [[valor en aduana]] es el precio realmente pagado o por pagar, más, entre otros ajustes, el transporte y el seguro hasta el lugar de entrada en la Unión, si no están en el precio. No incluye el transporte posterior a la entrada ni los derechos de importación (arts. 70 a 72 del CAU; [AEAT, valor de transacción](${AEAT_VALOR})).`,
        `**Tipo de cambio.** El aduanero ([art. 83.Cuatro LIVA](${LIVA}#a83)): el que publica el BCE el penúltimo miércoles de cada mes, que se aplica durante todo el mes siguiente ([art. 146 del Reglamento de Ejecución (UE) 2015/2447](${RE_2447}); [AEAT, tipo de cambio](${AEAT_CAMBIO})). Por eso la base del DUA en euros casi nunca coincide con la compra en tu contabilidad.`,
        `**Tipo impositivo.** El que corresponda al bien, igual que en una compra interior: el 21 % general, salvo que el bien figure entre los de tipo reducido del [art. 91 LIVA](${LIVA}#a91) ([art. 90 LIVA](${LIVA}#a90)). Las lámparas LED y la máquina de envasado de los casos de esta formación van al 21 %.`,
      ],
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Valor en aduana',
      text: 'Es el punto de partida de la base del IVA de la importación: el precio de la factura comercial, ajustado con el transporte y el seguro hasta la entrada en la Unión y convertido al tipo de cambio aduanero del mes. En el ejemplo de la documentación técnica de la AEAT, la base del IVA (B00) es el valor en aduana más la cuota del arancel (A00).',
      refs: [
        { label: 'Reglamento (UE) n.º 952/2013, Código Aduanero de la Unión, arts. 70 a 72', url: CAU, date: VERIFIED, kind: 'norma' },
        { label: 'AEAT, Valor de la mercancía. Valor de transacción: ajustes', url: AEAT_VALOR, date: VERIFIED, kind: 'criterio' },
        { label: 'AEAT, Información complementaria H1, versión 3.26', url: AEAT_H1, date: VERIFIED, kind: 'documento' },
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Dos tipos de cambio, los dos correctos',
      text: `El DUA convierte la factura al tipo aduanero del mes; tu contabilidad registra la compra al tipo de contado de la fecha de reconocimiento ([NRV 11.ª PGC](${PGC}#A11)). En el caso práctico, el DUA valora las lámparas en 19.500,00 € y la contabilidad en 20.000,00 €, y los dos importes son correctos. No ajustes la compra al DUA ni recalcules el IVA con tu tipo de cambio.`,
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 83.Cuatro', url: `${LIVA}#a83`, date: VERIFIED, kind: 'norma' },
        { label: 'Plan General de Contabilidad, NRV 11.ª Moneda extranjera', url: `${PGC}#A11`, date: VERIFIED, kind: 'norma' },
      ],
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Deducción, libros registro y modelo 303', id: 'deduccion-y-303' },
    {
      type: 'list',
      items: [
        `**Qué se deduce.** La cuota de la importación, en la medida en que los bienes se usen en operaciones que dan derecho a deducir ([art. 92 LIVA](${LIVA}#a92)). Si el cliente aplica la prorrata o tiene operaciones exentas, revisa el porcentaje con el área fiscal.`,
        `**Con qué documento.** Solo con la declaración en la que consta la liquidación, y nunca por más de la cuota consignada ([art. 97 LIVA](${LIVA}#a97)). La factura del transitario no sirve para el IVA de importación.`,
        `**Cuándo.** En el periodo en que el cliente recibe ese documento o en los siguientes, siempre que no hayan pasado cuatro años desde el devengo ([art. 99 LIVA](${LIVA}#a99)).`,
      ],
    },
    {
      type: 'table',
      caption: 'Dónde va cada cuota en el modelo 303 de 2026',
      columns: ['Operación', 'Casillas', 'Qué tener en cuenta'],
      rows: [
        ['Importación de bienes corrientes (mercaderías, materias primas)', '32 (base) y 33 (cuota)', 'Registros F5 del DUA'],
        ['Importación de bienes de inversión', '34 (base) y 35 (cuota)', 'En el SII, el F5 debe llevar la marca de bien de inversión para sumar aquí'],
        ['Honorarios del transitario', '28 (base) y 29 (cuota), con carácter general', 'Son una operación interior corriente. Si el despacho es de un bien de inversión, confirma las casillas con el área fiscal'],
        ['IVA a la importación diferido, pendiente de ingreso', '77', 'Solo con los requisitos del art. 74.1 RIVA; se suma al resultado (casilla 69)'],
      ],
    },
    {
      type: 'paragraph',
      text: `Las bases se consignan sin prorratear ([instrucciones del modelo 303 de 2026](${AEAT_303}); [Pre 303 de 2026, «IVA deducible»](${AEAT_PRE303})). Son las casillas vigentes a 29/10/2026: si la AEAT aprueba un nuevo diseño del modelo, revísalas.`,
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Bien de inversión',
      text: `Para el IVA, es el bien corporal destinado normalmente a usarse más de un año como instrumento de trabajo o medio de explotación; no lo es el de valor inferior a 3.005,06 € ([art. 108 LIVA](${LIVA}#a108); [Manual práctico de IVA 2026](${AEAT_BIENES_INVERSION})). Ese umbral es solo del IVA: la [NRV 2.ª del PGC](${PGC}#A2-2) no fija ningún importe mínimo para el inmovilizado material. Una máquina importada de 2.000 € que se usará varios años va a la 213 y se amortiza, pero su IVA de importación se declara en las casillas 32 y 33, como bien corriente. El detalle está en la formación [«Bienes de inversión»](${CON_06}).`,
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 108', url: `${LIVA}#a108`, date: VERIFIED, kind: 'norma' },
        { label: 'AEAT, Manual práctico de IVA 2026: concepto de bienes de inversión', url: AEAT_BIENES_INVERSION, date: VERIFIED, kind: 'criterio' },
        { label: 'Plan General de Contabilidad, NRV 2.ª Inmovilizado material', url: `${PGC}#A2-2`, date: VERIFIED, kind: 'norma' },
      ],
    },
    { type: 'heading', text: 'Libros registro: qué se anota y qué no', id: 'libros-registro', level: 3 },
    {
      type: 'list',
      items: [
        `**Fuera del SII** ([AEAT, preguntas frecuentes del libro registro de facturas recibidas](${AEAT_LIBRO})): la factura del proveedor extranjero no se anota. El DUA se anota con su número de referencia y su fecha de admisión, y como datos del proveedor se ponen los del propio importador. De la factura del transitario solo se anota la parte de su servicio, no el IVA de importación que cobra como suplido.`,
        `**En el SII** ([AEAT, preguntas frecuentes del SII](${AEAT_SII})): la importación se anota con el tipo de factura F5, el número de referencia y la fecha de admisión de la declaración, los datos del importador como proveedor y la base del elemento de dato 1403. Los gastos posteriores a la admisión que no forman parte de la base se anotan aparte, cada uno con su factura, y del transitario, solo su servicio. No es necesario anotar la factura del proveedor extranjero, salvo que se hubiera recibido antes; si se anota, va como F6, con la clave de régimen 13 y cuota deducible 0.`,
        `**Quién va por el SII.** Quien liquida el IVA por meses lleva los libros a través de la Sede ([art. 62.6 RIVA](${RIVA}#a62)) y presenta el 303 en los treinta primeros días naturales del mes siguiente; el de enero, hasta el último día de febrero ([art. 71.4 RIVA](${RIVA}#a71)).`,
      ],
    },

    /* ── 6 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'IVA a la importación diferido', id: 'iva-diferido' },
    {
      type: 'paragraph',
      text: `**Regla general.** El IVA de la importación se liquida como los derechos arancelarios y a la vez que ellos, aunque la mercancía no pague arancel ([art. 167.Dos LIVA](${LIVA}#a167); [art. 73 RIVA](${RIVA}#a73)). Sin diferimiento, normalmente lo ingresa el transitario por cuenta del cliente y se lo cobra después como suplido.`,
    },
    {
      type: 'paragraph',
      text: `Con el [[IVA a la importación diferido]], el importador no paga en la Aduana: incluye la cuota en su autoliquidación ([art. 74.1.a RIVA](${RIVA}#a74)). Requisitos y efectos:`,
    },
    {
      type: 'list',
      items: [
        `Solo puede optar el empresario importador con periodo de liquidación **mensual**. Lo tienen, entre otros, quien superó 6.010.121,04 € de volumen de operaciones el año anterior, quien está en el registro de devolución mensual o quien aplica el régimen de grupo de entidades ([art. 71.3 RIVA](${RIVA}#a71)).`,
        'Se opta con una declaración censal en noviembre del año anterior. La opción se prorroga sola y abarca todas sus importaciones. La renuncia se presenta también en noviembre y dura tres años como mínimo, y la opción se pierde al dejar de liquidar por meses.',
        `La cuota va en la **casilla 77** del 303 (o del 322) del periodo en que se notifica la liquidación, que en la importación es la **fecha del levante** ([AEAT, «IVA a la importación, cómo diferir su pago»](${AEAT_DIFERIR})). Lo que no se incluya pasa a periodo ejecutivo. La casilla 77 se suma al resultado de la autoliquidación (casilla 69).`,
        'Si procede, la misma cuota puede deducirse ya en ese periodo, en las casillas 32 y 33 o 34 y 35. Con deducción total, el efecto neto en caja es cero.',
        `Ejemplo de la AEAT: los DUA despachados en febrero se incluyen en el 303 que se presenta entre el 1 y el 30 de marzo ([AEAT](${AEAT_DIFERIR}); [art. 71.4 RIVA](${RIVA}#a71)).`,
      ],
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Levante',
      text: `La Aduana autoriza el levante de la mercancía en cuanto ha comprobado los datos de la declaración o los ha aceptado sin comprobarlos ([art. 194 del CAU](${CAU})). En la importación, la AEAT entiende notificada la liquidación en la fecha del levante: con diferimiento, esa fecha decide en qué 303 va la casilla 77. En los casos de esta formación, la admisión y el levante son del mismo día.`,
      refs: [
        { label: 'Reglamento (UE) n.º 952/2013, Código Aduanero de la Unión, art. 194', url: CAU, date: VERIFIED, kind: 'norma' },
        { label: 'AEAT, IVA a la importación, cómo diferir su pago', url: AEAT_DIFERIR, date: VERIFIED, kind: 'criterio' },
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Un cliente trimestral no puede diferir',
      text: 'Paga el IVA en la Aduana, directamente o a través del transitario, y lo deduce después con el DUA. Si la declaración de un cliente trimestral muestra el IVA como diferido, aclara con el transitario y con el área fiscal qué ha pasado antes de presentar el 303.',
      refs: [
        { label: 'Real Decreto 1624/1992, Reglamento del IVA, art. 74.1.a)', url: `${RIVA}#a74`, date: VERIFIED, kind: 'norma' },
        { label: 'Real Decreto 1624/1992, Reglamento del IVA, art. 71.3', url: `${RIVA}#a71`, date: VERIFIED, kind: 'norma' },
      ],
    },

    /* ── 7 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Contabilidad: precio de adquisición, divisa y cuentas', id: 'contabilidad' },
    {
      type: 'paragraph',
      text: `**Existencias.** Su precio de adquisición es el importe facturado por el proveedor, neto de descuentos, más los transportes, aranceles, seguros y otros gastos directamente atribuibles hasta que los bienes están ubicados para la venta ([NRV 10.ª PGC](${PGC}#A10); [NRV 12.ª PGC de Pymes](${PYMES}#A12)). Los honorarios de despacho del transitario son uno de esos gastos. El IVA deducible no forma parte del coste; el que no sea recuperable, sí.`,
    },
    {
      type: 'paragraph',
      text: `**Inmovilizado.** Lo mismo, hasta su puesta en funcionamiento: transporte, derechos arancelarios, seguros, instalación y montaje ([NRV 2.ª PGC](${PGC}#A2-2); [PGC de Pymes](${PYMES}#A2-2)). La amortización empieza cuando el bien está en condiciones de funcionamiento, como viste en la formación [«Amortización contable y fiscal»](${CON_03}); el alta y el cálculo, paso a paso, están en [«Amortizaciones»](${CON_05}).`,
    },
    {
      type: 'list',
      items: [
        `**Los aranceles no son «otros tributos».** La 631 excluye los tributos que se contabilizan en las cuentas 600/602 ([PGC, quinta parte](${PGC}#grupo6-2)): los derechos de importación van al coste de la compra o del inmovilizado.`,
        `**Cuándo se reconoce la compra.** A la recepción de la mercancía o a su puesta en camino, si viaja por cuenta de la empresa ([PGC, cuentas 600 a 602](${PGC}#grupo6-2)). El contrato y el Incoterm pactado dicen quién transporta y dónde se entrega: léelos antes de fijar la fecha. Si la mercancía viaja por cuenta de tu cliente, puede haber mercancías en tránsito al cierre; decide su tratamiento con el área contable.`,
        `**La compra en divisa** se convierte al tipo de cambio de contado de la fecha en que se reconoce, o a un tipo medio, como máximo mensual, si no hay variaciones significativas ([NRV 11.ª PGC](${PGC}#A11); [NRV 13.ª PGC de Pymes](${PYMES}#A13)). No uses el tipo aduanero del DUA, ni el de la fecha de la factura si no coincide con el reconocimiento.`,
        `**La deuda con el proveedor** es una partida monetaria: al pagarla, la diferencia entre lo registrado y lo pagado va a la [668](${PGC}#grupo6-2) o a la [768](${PGC}#grupo7-2); si sigue pendiente al cierre, se valora al tipo de cierre.`,
        '**Las existencias y el inmovilizado** son partidas no monetarias: conservan el tipo de la fecha de la transacción y no se corrigen con la diferencia de cambio.',
        `**Si el cliente pagó un anticipo al proveedor**, también es una partida no monetaria: conserva el tipo de cambio del día del pago y no se actualiza al cierre ([NRV 11.ª PGC](${PGC}#A11)). Al registrar la compra, aplícalo contra ella y deja en el proveedor solo la parte pendiente: así no duplicas ni la compra ni el pago. La parte de la compra cubierta por el anticipo queda a su tipo de cambio, y solo la pendiente se convierte al tipo de contado del reconocimiento; es la lectura coherente con la NRV 11.ª, pero no hay criterio del ICAC localizado que lo diga expresamente: confírmalo con el área. Las cuentas del anticipo y su enlace con la factura definitiva están en la formación [«Facturas de anticipo»](${CON_07}).`,
      ],
    },
    {
      type: 'table',
      caption: 'Cuentas que usarás (mismo número y nombre en el PGC de Pymes)',
      columns: ['Cuenta', 'Para qué'],
      rows: [
        ['600 Compras de mercaderías', 'Precio, arancel y honorarios de despacho de la mercancía'],
        ['213 Maquinaria', 'Lo mismo, si el bien importado es inmovilizado'],
        ['4004 Proveedores (moneda extranjera)', 'Deuda en divisa con el proveedor de mercaderías'],
        ['523 Proveedores de inmovilizado a corto plazo', 'Deuda con el proveedor del inmovilizado'],
        ['4100 Acreedores por prestaciones de servicios (euros)', `Transitario: honorarios y suplidos (si quieres, con una subcuenta propia para los suplidos). Si despacha un inmovilizado, también vale la 523, como en [«Amortizaciones»](${CON_05})`],
        ['472 Hacienda Pública, IVA soportado', 'Cuota deducible del DUA y de los honorarios, cargada cuando se devenga el impuesto'],
        ['475 Hacienda Pública, acreedora por conceptos fiscales', 'IVA diferido pendiente de ingreso'],
        ['668 Diferencias negativas de cambio · 768 Diferencias positivas de cambio', 'Diferencia de la deuda en divisa al pagarla o al cierre'],
      ],
    },
    {
      type: 'paragraph',
      text: `Los movimientos contables de la quinta parte del PGC no son vinculantes, salvo en lo que contengan criterios de registro o valoración ([art. 2 del Real Decreto 1514/2007](${PGC}#a2)). Estas contrapartidas son una opción razonable, no la única. Para el IVA diferido, elige la 475 o una subcuenta propia y úsala siempre igual.`,
    },
    {
      type: 'widget',
      widget: {
        kind: 'clasificador',
        title: '¿Coste, IVA deducible o ninguno de los dos?',
        prompt: 'Clasifica cada concepto del expediente de una importación de mercaderías. El cliente tiene derecho a deducir todo el IVA.',
        categories: ['Coste de la mercancía (600)', 'IVA deducible (472)', 'Ni coste ni IVA deducible'],
        items: [
          {
            label: 'Precio de la factura del proveedor, convertido al tipo de contado de la recepción',
            answer: 'Coste de la mercancía (600)',
            explanation: 'Es el punto de partida del precio de adquisición (NRV 10.ª PGC).',
          },
          {
            label: 'Derecho arancelario (A00) de la declaración de importación',
            answer: 'Coste de la mercancía (600)',
            explanation: 'Los aranceles forman parte del precio de adquisición; no van a la 631.',
          },
          {
            label: 'Cuota de IVA (B00) de la declaración de importación',
            answer: 'IVA deducible (472)',
            explanation: 'Se deduce con el DUA, que es su único justificante (art. 97 LIVA).',
          },
          {
            label: 'Honorarios de despacho del transitario',
            answer: 'Coste de la mercancía (600)',
            explanation: 'Son un gasto directamente atribuible a la adquisición.',
          },
          {
            label: 'IVA del 21 % sobre los honorarios del transitario',
            answer: 'IVA deducible (472)',
            explanation: 'Es el IVA de una operación interior: va en las casillas 28 y 29 del 303.',
          },
          {
            label: 'Suplido «IVA importación» de la factura del transitario',
            answer: 'Ni coste ni IVA deducible',
            explanation: 'Es la misma cuota del DUA, que ya registraste. Solo cancela lo que debes al transitario.',
          },
          {
            label: 'Valor en aduana en euros que figura en el DUA',
            answer: 'Ni coste ni IVA deducible',
            explanation: 'Es el punto de partida de la base del IVA, calculado al tipo aduanero. La compra sale de la factura del proveedor: si lo registras también, duplicas el coste.',
          },
          {
            label: 'Diferencia negativa de cambio al pagar al proveedor en dólares',
            answer: 'Ni coste ni IVA deducible',
            explanation: 'Va a la 668: la deuda es una partida monetaria y su diferencia no corrige el coste (NRV 11.ª PGC).',
          },
        ],
      },
      caption: 'Ocho conceptos del mismo expediente. Si alguno te sale en dos sitios a la vez, estás duplicando.',
    },

    /* ── 8 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Procedimiento paso a paso', id: 'procedimiento' },
    { type: 'paragraph', text: 'Sigue este orden con cada expediente de importación:' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Reúne el expediente** de cada compra: factura del proveedor, documento de transporte, declaración de importación (con MRN y liquidación), factura del transitario y justificantes de pago. Enlázalos por el MRN y por el número de factura del proveedor.',
        '**Confirma que es una importación en España**: origen fuera de la UE o en un territorio tercero, y una declaración de importación a nombre de tu cliente. Si no la hay, analiza si es una adquisición intracomunitaria u otra operación.',
        '**Comprueba la declaración**: importador = tu cliente; tipo de representación; divisa e importe = factura del proveedor; A00 y B00 con base, tipo y cuota; modalidad de pago.',
        '**Fija la fecha de reconocimiento de la compra** con el contrato y el transporte, y convierte la factura en divisa al tipo de contado de esa fecha.',
        '**Registra la compra**: 600 (o 213, si es inmovilizado) contra 4004 (o 523).',
        '**Registra el DUA** en la fecha de admisión: cuota A00 al coste (600 o 213) y cuota B00 a la 472 si es deducible. Contrapartida: el transitario (4100) si pagó él o la 572 si pagó el cliente; la cuota de IVA diferida, a la 475.',
        '**Registra la factura del transitario**: solo sus honorarios, al coste y con su IVA a la 472. Los suplidos ya están registrados con el DUA: no los repitas.',
        '**Anota los libros registro**: el DUA como F5 (MRN, fecha de admisión, el propio importador como proveedor, base y cuota, y la marca de bien de inversión si lo es y el cliente lleva el SII); del transitario, solo su servicio; la factura del proveedor, no.',
        '**Prepara el modelo 303**: base y cuota del DUA en las casillas 32 y 33 (bienes corrientes) o 34 y 35 (bienes de inversión); honorarios del transitario en las 28 y 29; con diferimiento, la cuota también en la casilla 77 del periodo del levante.',
        '**Paga al proveedor**: cancela la 4004 por su saldo y lleva la diferencia a la 668 o a la 768. Al cierre, valora al tipo de cierre las deudas en divisa pendientes.',
        '**Si es inmovilizado**, abre su ficha con el coste total (precio, arancel, despacho e instalación) y la fecha de puesta en funcionamiento, que es cuando empieza la amortización.',
      ],
    },

    /* ── 9 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso práctico: lámparas de China pagadas en dólares', id: 'caso-lamparas' },
    {
      type: 'example',
      title: 'Lámparas LED de Shenzhen, con el IVA pagado por el transitario',
      scenario:
        'Sociedad limitada ficticia de Granollers que distribuye iluminación, aplica el PGC y liquida el IVA por trimestres (ni supera 6.010.121,04 € de volumen de operaciones ni está en el registro de devolución mensual), así que no puede diferir el IVA. El 20/08/2026, un fabricante de Shenzhen (China) le factura 1.200 lámparas LED a 19,50 USD: 23.400 USD, sin IVA. Según el contrato, el proveedor paga el flete marítimo y el seguro hasta el puerto de Barcelona y asume el riesgo hasta poner la mercancía a disposición de la compradora allí; el pago es a 30 días desde la llegada. El 15/09/2026 la mercancía llega a Barcelona y la sociedad la recoge con su vehículo, sin coste adicional. Ese día, el transitario presenta la declaración en representación directa, con la sociedad como importadora (admisión y levante el mismo día), y paga la liquidación. El 30/09/2026 le factura 400,00 € de honorarios más IVA, junto con los suplidos, y la sociedad le paga. El 15/10/2026 paga los 23.400 USD al proveedor, sin comisiones. Tipos supuestos: aduanero de septiembre, 1 EUR = 1,2000 USD; de contado del 15/09, 1,1700 USD; del banco en el pago, 1,1250 USD; arancel, 4 % (en la realidad, el que fije el TARIC).',
      steps: [
        { label: 'Valor en aduana, al tipo de cambio aduanero del mes.', formula: '23.400 USD ÷ 1,20', result: '19.500,00 €' },
        { label: 'Derecho arancelario (A00), al 4 % supuesto.', formula: '19.500,00 € × 4 %', result: '780,00 €' },
        { label: 'Base imponible del IVA (B00): el flete y el seguro hasta Barcelona ya están en el precio, así que no hay gastos accesorios que sumar.', formula: '19.500,00 € + 780,00 €', result: '20.280,00 €' },
        { label: 'Cuota de IVA de importación: las lámparas no están en el art. 91 LIVA.', formula: '20.280,00 € × 21 %', result: '4.258,80 €' },
        { label: 'Compra en contabilidad, al tipo de contado de la fecha de recepción.', formula: '23.400 USD ÷ 1,17', result: '20.000,00 €' },
        { label: 'Factura del transitario: honorarios, su IVA y los dos suplidos.', formula: '400,00 € + 84,00 € + 780,00 € + 4.258,80 €', result: '5.522,80 €' },
        { label: 'Precio de adquisición de las lámparas.', formula: '20.000,00 € + 780,00 € + 400,00 €', result: '21.180,00 € (17,65 € por unidad)' },
        { label: 'Pago al proveedor y diferencia de cambio.', formula: '23.400 USD ÷ 1,125 = 20.800,00 € − 20.000,00 €', result: '800,00 € negativa (668)' },
      ],
      conclusion:
        'El DUA valora la mercancía en 19.500,00 € y la contabilidad, en 20.000,00 €: cada importe usa el tipo de cambio que le manda su norma. Las lámparas cuestan **21.180,00 €**, sin IVA y sin la diferencia de cambio. La 472 recoge 4.342,80 € (4.258,80 € del DUA y 84,00 € de los honorarios), y la 4004 y la 4100 quedan a cero.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Registro de la importación de las lámparas',
        entries: [
          {
            date: '2026-09-15',
            concept: 'Recepción de 1.200 lámparas (23.400 USD ÷ 1,17)',
            lines: [
              { account: '600', name: 'Compras de mercaderías', debit: 20000 },
              { account: '4004', name: 'Proveedores (moneda extranjera)', credit: 20000 },
            ],
          },
          {
            date: '2026-09-15',
            concept: 'Declaración de importación: arancel (A00) e IVA (B00) pagados por el transitario',
            lines: [
              { account: '600', name: 'Compras de mercaderías', debit: 780 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 4258.8 },
              { account: '4100', name: 'Acreedores por prestaciones de servicios (euros)', credit: 5038.8 },
            ],
          },
          {
            date: '2026-09-30',
            concept: 'Factura del transitario: solo los honorarios de despacho',
            lines: [
              { account: '600', name: 'Compras de mercaderías', debit: 400 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 84 },
              { account: '4100', name: 'Acreedores por prestaciones de servicios (euros)', credit: 484 },
            ],
          },
          {
            date: '2026-09-30',
            concept: 'Pago al transitario (honorarios y suplidos)',
            lines: [
              { account: '4100', name: 'Acreedores por prestaciones de servicios (euros)', debit: 5522.8 },
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', credit: 5522.8 },
            ],
          },
          {
            date: '2026-10-15',
            concept: 'Pago de 23.400 USD al proveedor (23.400 ÷ 1,125)',
            lines: [
              { account: '4004', name: 'Proveedores (moneda extranjera)', debit: 20000 },
              { account: '668', name: 'Diferencias negativas de cambio', debit: 800 },
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', credit: 20800 },
            ],
          },
        ],
      },
      caption: 'Avanza asiento a asiento: el DUA aporta el arancel (al coste) y el IVA (a la 472); la factura del transitario, solo sus honorarios. Saldos finales: 600, 21.180,00 €; 472, 4.342,80 €; 4004 y 4100, a cero.',
    },
    {
      type: 'paragraph',
      text: 'El asiento del DUA se fecha en la admisión, porque es cuando se devenga el IVA. Si el DUA llegara en el trimestre siguiente, la cuota se deduciría en el 303 del periodo en que se recibe o en uno posterior, antes de que pasen cuatro años desde el devengo. Si quieres seguir en la contabilidad los gastos de importación, usa una subcuenta propia de la 600.',
    },
    { type: 'heading', text: 'Libros registro y modelo 303 del tercer trimestre', id: 'caso-lamparas-303', level: 3 },
    {
      type: 'list',
      items: [
        'Libro registro de facturas recibidas (la sociedad es trimestral, no está obligada al SII y no ha optado por él): DUA con tipo F5, número = MRN, fecha 15/09/2026, proveedor = la propia sociedad, base 20.280,00 € y cuota 4.258,80 €.',
        'Transitario: tipo F1, base 400,00 € y cuota 84,00 €, sin los suplidos. La factura del proveedor chino no se anota en este libro.',
        'Modelo 303 del tercer trimestre de 2026: casillas 32 y 33, 20.280,00 € y 4.258,80 €; casillas 28 y 29, 400,00 € y 84,00 €, junto con el resto de operaciones interiores del trimestre.',
        'Si al cierre quedan lámparas sin vender, siguen en existencias a 17,65 € por unidad, sin efecto de la diferencia de cambio.',
      ],
    },

    /* ── 10 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso breve: máquina de Suiza con IVA diferido', id: 'caso-maquina' },
    {
      type: 'example',
      title: 'Máquina de envasado importada por una sociedad que liquida por meses',
      scenario:
        'Sociedad industrial ficticia de Vic que aplica el PGC. Su volumen de operaciones de 2025 fue de 9 millones de euros, así que liquida el IVA por meses, y en noviembre de 2025 optó por el diferimiento con efectos desde 2026. El 06/10/2026 recibe una máquina de envasado nueva de un fabricante suizo, que factura 30.000,00 € (en euros: sigue siendo una importación). Según el contrato (supuesto), el precio incluye el transporte y el seguro hasta la entrada en la Unión; la sociedad lleva la máquina a Vic con medios propios, sin coste adicional, y no hay instalación. Declaración en representación directa, con la sociedad como importadora; admisión y levante ese día; arancel supuesto del 2 %, que paga el transitario, e IVA con pago diferido. El mismo día, el transitario factura 500,00 € de honorarios más 105,00 € de IVA y los 600,00 € de derechos como suplido.',
      steps: [
        { label: 'Valor en aduana: el precio ya incluye el transporte y el seguro hasta la entrada en la Unión.', result: '30.000,00 €' },
        { label: 'Derecho arancelario (A00), al 2 % supuesto.', formula: '30.000,00 € × 2 %', result: '600,00 €' },
        { label: 'Cuota de IVA (B00), con pago diferido.', formula: '(30.000,00 € + 600,00 €) × 21 %', result: '6.426,00 €' },
        { label: 'Precio de adquisición de la máquina (213).', formula: '30.000,00 € + 600,00 € + 500,00 €', result: '31.100,00 €' },
        { label: '¿Bien de inversión para el IVA? Es un bien corporal que se usará varios años como instrumento de trabajo y vale más de 3.005,06 €.', result: 'Sí: casillas 34 y 35' },
        {
          label: 'Modelo 303 de octubre de 2026, que se presenta del 1 al 30 de noviembre.',
          formula: 'Casilla 77: 6.426,00 € · casillas 34 y 35: 30.600,00 € y 6.426,00 € · casillas 28 y 29: 500,00 € y 105,00 € (las de los honorarios, por confirmar con el área: apartado 5)',
          result: 'Efecto neto en caja del IVA de importación: 0 €',
        },
      ],
      conclusion:
        'La cuota de la 472 entra en la regularización del mes como cualquier otra, y la casilla 77 suma lo mismo al resultado (casilla 69). En el SII, obligatorio para esta sociedad, el DUA va como F5, con la sociedad como proveedor, base 30.600,00 €, cuota 6.426,00 € y la marca de bien de inversión; el transitario, como F1, solo con su servicio. Si la sociedad liquidara por trimestres, no podría diferir: el transitario pagaría los 6.426,00 € en la Aduana y los cobraría como suplido, como en el caso anterior, y la cuota iría a las casillas 34 y 35 del trimestre. La amortización empieza cuando la máquina está en condiciones de funcionamiento.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Registro de la máquina con IVA diferido',
        entries: [
          {
            date: '2026-10-06',
            concept: 'Recepción de la máquina (factura del proveedor suizo)',
            lines: [
              { account: '213', name: 'Maquinaria', debit: 30000 },
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', credit: 30000 },
            ],
          },
          {
            date: '2026-10-06',
            concept: 'Declaración de importación: arancel (A00) pagado por el transitario e IVA (B00) diferido',
            lines: [
              { account: '213', name: 'Maquinaria', debit: 600 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 6426 },
              { account: '4100', name: 'Acreedores por prestaciones de servicios (euros)', credit: 600 },
              { account: '475', name: 'Hacienda Pública, acreedora por conceptos fiscales', credit: 6426 },
            ],
          },
          {
            date: '2026-10-06',
            concept: 'Factura del transitario: solo los honorarios de despacho',
            lines: [
              { account: '213', name: 'Maquinaria', debit: 500 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 105 },
              { account: '4100', name: 'Acreedores por prestaciones de servicios (euros)', credit: 605 },
            ],
          },
          {
            concept: 'Pago del 303 de octubre (del 1 al 30/11/2026): parte que corresponde a la casilla 77',
            lines: [
              { account: '475', name: 'Hacienda Pública, acreedora por conceptos fiscales', debit: 6426 },
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', credit: 6426 },
            ],
          },
        ],
      },
      caption: 'Como en el caso anterior, el arancel entra con el DUA y la factura del transitario solo aporta sus honorarios: la 213 suma 31.100,00 € y la 4100, los 1.205,00 € de esa factura. El último asiento solo separa, dentro del pago del 303, la parte de la casilla 77. Faltan, por simplicidad, los pagos al proveedor (523) y al transitario (4100).',
    },

    /* ── 11 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Errores frecuentes y cómo evitarlos', id: 'errores' },
    {
      type: 'list',
      items: [
        '**Deducir el IVA de la importación con la factura del transitario, o deducirlo dos veces.** La cuota cobrada como suplido no es IVA repercutido por el transitario: el único justificante es la declaración con la liquidación. *Cómo evitarlo:* anota el DUA como F5 y, del transitario, solo su servicio; cruza la cuota B00 con el suplido «IVA importación» antes de cerrar el periodo.',
        '**Duplicar el coste.** Registrar como compra la factura del proveedor y, además, el valor en aduana o la base del DUA, o llevar a gasto los suplidos ya registrados con el DUA. *Cómo evitarlo:* la compra sale de la factura del proveedor; del DUA solo tomas el arancel (al coste) y la cuota de IVA (a la 472); de la factura del transitario, solo sus honorarios.',
        '**Olvidar los aranceles y el despacho en el precio de adquisición.** Llevarlos a la 631 o a la 629 infravalora las existencias y el inmovilizado. *Cómo evitarlo:* carga el A00 y los honorarios de despacho en la 600 (o en la 213).',
        '**Aceptar un DUA a nombre de otra persona.** Si el importador no es tu cliente, en principio esa liquidación no justifica su deducción. *Cómo evitarlo:* comprueba importador, comprador y tipo de representación al recibir el DUA; si no cuadran, habla con el representante aduanero y con el área fiscal antes de deducir.',
        '**Usar un tipo de cambio equivocado.** Registrar la compra al tipo aduanero del DUA, al de la fecha de la factura o al del pago, o corregir el coste con la diferencia de cambio. *Cómo evitarlo:* la compra, al tipo de contado de la fecha de reconocimiento; la diferencia del pago, a la 668 o a la 768; el IVA, tal como lo liquida la Aduana.',
        '**Equivocar las casillas del 303 o el diferimiento.** Declarar en las casillas 32 y 33 una máquina que es bien de inversión, o usar la casilla 77 con un cliente trimestral o sin opción censal. *Cómo evitarlo:* bienes de inversión en las casillas 34 y 35; casilla 77 solo con periodo mensual y la opción en vigor.',
      ],
    },

    /* ── 12 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Lista de comprobación', id: 'lista-de-comprobacion' },
    { type: 'paragraph', text: 'Antes de cerrar el periodo, comprueba en cada importación que:' },
    {
      type: 'list',
      items: [
        'El bien procede de fuera de la UE o de Canarias, Ceuta o Melilla, y existe una declaración de importación con su MRN.',
        'En la declaración, el importador es tu cliente y conoces el tipo de representación del declarante.',
        'La divisa y el importe facturado de la declaración coinciden con la factura del proveedor.',
        'En la factura del transitario has separado sus honorarios (con IVA) de los suplidos (derechos e IVA de importación, sin IVA).',
        'La cuota B00 se ha deducido una sola vez, con el DUA anotado como F5, con su MRN y su fecha de admisión.',
        'El precio de adquisición incluye arancel, transporte, seguro y honorarios de despacho, y excluye el IVA deducible.',
        'La compra en divisa está convertida al tipo de contado de la fecha de reconocimiento, y la diferencia del pago está en la 668 o en la 768.',
        'La cuota está en las casillas 32 y 33 (bienes corrientes) o 34 y 35 (bienes de inversión) del periodo en que se recibió el documento o de uno posterior, antes de que pasen cuatro años desde el devengo.',
        'Si hay diferimiento, el cliente liquida por meses, tiene en vigor la opción censal y la cuota está en la casilla 77 del periodo del levante.',
        'Al cierre, las deudas en divisa pendientes están valoradas al tipo de cierre, y las existencias, a coste.',
      ],
    },
  ],
  keyTerms: [
    {
      term: 'importación de bienes',
      definition: 'Entrada en el territorio del IVA español de un bien que no está en libre práctica en la Unión o que procede de un territorio tercero, como Canarias, Ceuta o Melilla (arts. 3 y 18 LIVA).',
    },
    {
      term: 'DUA',
      definition:
        'Declaración de importación con la que se despacha la mercancía: contiene la liquidación de derechos e IVA y es el único justificante para deducir esa cuota. Desde el 14/10/2025 se presenta en el sistema adaptado al Código Aduanero de la Unión (H1).',
    },
    {
      term: 'valor en aduana',
      definition: 'Precio realmente pagado o por pagar, ajustado con el transporte y el seguro hasta la entrada en la Unión y convertido al tipo de cambio aduanero; es el punto de partida de la base del IVA de la importación.',
    },
    {
      term: 'suplido',
      definition:
        'Cantidad que alguien paga en nombre y por cuenta de su cliente por mandato expreso, como el transitario con los derechos y el IVA de importación. No forma parte de su base imponible ni lleva IVA (art. 78.Tres.3.º LIVA).',
    },
    {
      term: 'representante aduanero',
      definition: 'Persona nombrada para hacer los trámites aduaneros de otra: en representación directa actúa en nombre y por cuenta de ella; en la indirecta, en nombre propio y por cuenta de ella (art. 18 del CAU).',
    },
    {
      term: 'IVA a la importación diferido',
      definition: 'Opción del importador con periodo de liquidación mensual para ingresar la cuota en su autoliquidación (casilla 77 del 303) en lugar de pagarla en la Aduana (art. 74.1.a RIVA).',
    },
  ],
  takeaway:
    'Cada documento hace un trabajo: la factura del proveedor fija el coste en divisa, el DUA liquida aranceles e IVA y es el único justificante para deducir esa cuota, y la factura del transitario solo añade sus honorarios. Suma al coste aranceles y gastos de despacho, nunca el IVA deducible, y lleva la diferencia de cambio del pago a resultados.',
  sources: [
    { label: 'Ley 37/1992, del IVA: arts. 3, 15, 17, 18, 23 y 24 (territorio, adquisición intracomunitaria e importación)', url: `${LIVA}#a18`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: arts. 64, 68, 77, 78, 83, 86, 90 y 91 (exención, lugar, devengo, base, sujeto pasivo y tipo)', url: `${LIVA}#a83`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: arts. 92, 97, 99, 108 y 167 (deducción, justificantes, bienes de inversión y liquidación)', url: `${LIVA}#a97`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1624/1992, Reglamento del IVA: arts. 62, 71, 73 y 74 (SII, periodo de liquidación e IVA diferido)', url: `${RIVA}#a74`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1514/2007, Plan General de Contabilidad: art. 2 y NRV 2.ª, 10.ª y 11.ª', url: `${PGC}#A10`, date: VERIFIED, kind: 'norma' },
    { label: 'Plan General de Contabilidad, cuarta y quinta parte: cuentas 213, 4004, 4100, 472, 475, 523, 572, 600, 631, 668 y 768', url: `${PGC}#grupo6-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: NRV 2.ª, 12.ª y 13.ª y cuadro de cuentas', url: `${PYMES}#A12`, date: VERIFIED, kind: 'norma' },
    { label: 'Orden HAC/27/2026, de 22 de enero, que modifica los modelos 303, 322, 353 y 390', url: ORDEN_303, date: VERIFIED, kind: 'norma' },
    { label: 'Reglamento (UE) n.º 952/2013, Código Aduanero de la Unión: arts. 18, 70 a 72, 77, 172 y 194 (DOUE L 269, copia en el BOE)', url: CAU, date: VERIFIED, kind: 'norma' },
    { label: 'Corrección de errores del Reglamento (UE) n.º 952/2013: aplicación desde el 1 de mayo de 2016 (DOUE L 287, copia en el BOE)', url: CAU_CORRECCION, date: VERIFIED, kind: 'norma' },
    { label: 'Reglamento de Ejecución (UE) 2015/2447: art. 146, tipo de cambio (DOUE L 343, copia en el BOE)', url: RE_2447, date: VERIFIED, kind: 'norma' },
    { label: 'AEAT, IVA a la importación, cómo diferir su pago', url: AEAT_DIFERIR, date: VERIFIED, kind: 'criterio' },
    { label: 'AEAT, Modelo 303: instrucciones 2026', url: AEAT_303, date: VERIFIED, kind: 'documento' },
    { label: 'AEAT, Pre 303, ejercicio 2026: IVA deducible', url: AEAT_PRE303, date: VERIFIED, kind: 'documento' },
    { label: 'AEAT, Preguntas frecuentes: libro registro de facturas recibidas (IVA)', url: AEAT_LIBRO, date: VERIFIED, kind: 'criterio' },
    { label: 'AEAT, Preguntas frecuentes del SII: libro registro de facturas recibidas', url: AEAT_SII, date: VERIFIED, kind: 'criterio' },
    { label: 'AEAT, Información complementaria H1. Sistema de importación adaptado al CAU, versión 3.26', url: AEAT_H1, date: VERIFIED, kind: 'documento' },
    { label: 'AEAT, Novedades de Aduanas (07/10/2025): cierre definitivo de la declaración de importación PreCau', url: AEAT_PRECAU, date: VERIFIED, kind: 'web' },
    { label: 'AEAT, Novedades de Aduanas (24/11/2025): declarante y tipo de representación en la declaración CAU', url: AEAT_DECLARANTE, date: VERIFIED, kind: 'web' },
    { label: 'AEAT, Manual práctico de IVA 2026: justificantes de la deducción', url: AEAT_JUSTIFICANTES, date: VERIFIED, kind: 'criterio' },
    { label: 'AEAT, Manual práctico de IVA 2026: concepto de bienes de inversión', url: AEAT_BIENES_INVERSION, date: VERIFIED, kind: 'criterio' },
    { label: 'AEAT, Manual práctico de IVA 2026: base imponible en las importaciones', url: AEAT_BASE, date: VERIFIED, kind: 'criterio' },
    { label: 'AEAT, Manual de importación y exportación de envíos de escaso valor, 3.1.5: tipo de cambio', url: AEAT_CAMBIO, date: VERIFIED, kind: 'criterio' },
    { label: 'AEAT, Valor de la mercancía. Valor de transacción: ajustes', url: AEAT_VALOR, date: VERIFIED, kind: 'criterio' },
  ],
  quiz: {
    id: 'con-04-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'con-04-q1',
        prompt:
          'Tu cliente, una sociedad trimestral, importa lámparas de China. El transitario le factura 400 € de honorarios más 84 € de IVA y, como suplidos, 780 € de derechos y 4.258,80 € de «IVA importación». ¿Con qué documento justifica la deducción de los 4.258,80 €?',
        options: [
          {
            id: 'a',
            text: 'Con la factura del transitario, porque es quien ha pagado la cuota y se la cobra.',
            feedback: 'Esa cantidad es un suplido: no forma parte de la base del transitario ni es IVA repercutido por él (art. 78.Tres.3.º LIVA). De su factura solo se registra la parte de su servicio.',
          },
          {
            id: 'b',
            text: 'Con la factura del proveedor chino, convertida a euros al tipo del día.',
            feedback: 'La factura del proveedor no lleva IVA español y ni siquiera se anota en el libro registro de facturas recibidas a efectos del IVA.',
          },
          { id: 'c', text: 'Con la declaración de importación (DUA) en la que la sociedad figura como importadora y consta la liquidación de 4.258,80 €.' },
          {
            id: 'd',
            text: 'Con el justificante bancario del pago al transitario.',
            feedback: 'El art. 97 LIVA enumera los únicos documentos que justifican la deducción, y un justificante de pago no es uno de ellos.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'En las importaciones, el justificante es el documento en el que consta la liquidación practicada por la Administración, y no se puede deducir más de la cuota que figura en él (art. 97.Uno.3.º y Tres LIVA). Se anota como F5, con su número de referencia y su fecha de admisión.',
        ref: 'Apartado 2 · Tres documentos, tres funciones',
      },
      {
        id: 'con-04-q2',
        prompt:
          'Con los datos del caso práctico (compra de 23.400 USD reconocida a 1 EUR = 1,17 USD, valor en aduana de 19.500 €, arancel de 780 €, IVA de importación de 4.258,80 €, honorarios del transitario de 400 € más 84 € de IVA y pago al proveedor con 800 € de diferencia negativa de cambio), ¿cuál es el precio de adquisición de las lámparas?',
        options: [
          {
            id: 'a',
            text: '20.680,00 €.',
            feedback: 'Parte del valor en aduana (19.500 €), calculado con el tipo de cambio aduanero; la compra se registra al tipo de contado de la fecha de reconocimiento (NRV 11.ª PGC).',
          },
          { id: 'b', text: '21.180,00 €.' },
          {
            id: 'c',
            text: '21.980,00 €.',
            feedback: 'Suma la diferencia de cambio del pago, que corresponde a la deuda (una partida monetaria) y va a resultados, no al coste de las existencias.',
          },
          {
            id: 'd',
            text: '25.522,80 €.',
            feedback: 'Suma las cuotas de IVA (4.258,80 € y 84,00 €), que son deducibles y, por tanto, no forman parte del coste (NRV 10.ª PGC).',
          },
        ],
        correctOptionId: 'b',
        explanation: '20.000,00 € (23.400 USD ÷ 1,17) + 780,00 € de arancel + 400,00 € de honorarios de despacho = 21.180,00 €, es decir, 17,65 € por lámpara (NRV 10.ª y 11.ª PGC).',
        ref: 'Apartado 9 · Caso práctico: lámparas de China pagadas en dólares',
      },
      {
        id: 'con-04-q3',
        prompt:
          'Una sociedad industrial con periodo de liquidación mensual optó en noviembre de 2025 por el diferimiento. El 06/10/2026 obtiene el levante de una máquina (bien de inversión) con una cuota de IVA de importación de 6.426,00 € sobre una base de 30.600,00 €. ¿Cómo lo refleja en el modelo 303 de octubre de 2026?',
        options: [
          {
            id: 'a',
            text: 'Solo con la deducción en las casillas 32 y 33; la casilla 77 no se usa porque la Aduana ya ha liquidado la cuota.',
            feedback: 'Con diferimiento, la cuota liquidada se ingresa en la casilla 77 y, si no se incluye, pasa a periodo ejecutivo. Además, una máquina que es bien de inversión va en las casillas 34 y 35.',
          },
          {
            id: 'b',
            text: 'Casilla 77 en octubre, pero la deducción no puede hacerse hasta que la sociedad haya ingresado la cuota, en el 303 de noviembre.',
            feedback: 'El derecho a deducir no depende del ingreso: la cuota se entiende soportada al recibir el documento de liquidación (art. 99 LIVA), que se notifica con el levante, así que ya puede deducirse en el 303 de octubre.',
          },
          {
            id: 'c',
            text: 'Nada en el 303: el transitario paga la cuota en la Aduana y la cobra como suplido.',
            feedback: 'Eso ocurre sin diferimiento. Con la opción en vigor, la Aduana no cobra el IVA y el importador lo incluye en su autoliquidación.',
          },
          { id: 'd', text: 'Casilla 77: 6.426,00 €; y, si cumple los requisitos de deducción, casillas 34 y 35: 30.600,00 € y 6.426,00 €.' },
        ],
        correctOptionId: 'd',
        explanation:
          'El importador mensual que ha optado incluye la cuota en la casilla 77 del periodo en que se le notifica la liquidación, que en la importación es la fecha del levante (art. 74.1.a RIVA y criterio de la AEAT), y la deduce en las casillas de importaciones de bienes de inversión. Con deducción total, el efecto neto es cero.',
        ref: 'Apartado 6 · IVA a la importación diferido',
      },
    ],
  },
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-judith-calet',
    publishedAt: '2026-10-29T09:00:00+01:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: '2026-10-29',
};

/** Banco de 4 preguntas adicionales para «Pon a prueba tus conocimientos». */
export const bank: QuizQuestion[] = [
  {
    id: 'con-04-b1',
    prompt:
      'El 10/03/2026 una sociedad registra la recepción de mercaderías facturadas por 12.000 USD a un tipo de contado de 1 EUR = 1,20 USD (10.000 €). Las paga el 10/04/2026, cuando el tipo es 1 EUR = 1,25 USD. ¿Qué asiento hace al pagar?',
    options: [
      {
        id: 'a',
        text: '4004 Proveedores (moneda extranjera), 10.000 €, y 668 Diferencias negativas de cambio, 400 €, al debe; 572 Bancos, 10.400 €, al haber.',
        feedback: 'El euro se ha apreciado: 12.000 USD cuestan ahora menos euros (9.600 €), así que hay un beneficio, no una pérdida.',
      },
      {
        id: 'b',
        text: '4004, 10.000 €, al debe; 572, 9.600 €, y 600 Compras de mercaderías, 400 €, al haber.',
        feedback: 'La diferencia de cambio de una partida monetaria va a resultados; no corrige el coste de la compra (NRV 11.ª PGC).',
      },
      { id: 'c', text: '4004 Proveedores (moneda extranjera), 10.000 €, al debe; 572 Bancos, 9.600 €, y 768 Diferencias positivas de cambio, 400 €, al haber.' },
      {
        id: 'd',
        text: '4004, 10.000 €, al debe; 572, 10.000 €, al haber.',
        feedback: 'El banco solo carga 9.600 €: la deuda se cancela por su saldo y la diferencia se reconoce al liquidarla.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      '12.000 USD ÷ 1,25 = 9.600 €. La deuda estaba registrada por 10.000 €; la diferencia de 400 € es un beneficio por la variación del tipo de cambio en una partida monetaria, que va a la 768 (NRV 11.ª PGC, apartado 1.2.1).',
    ref: 'Formación «Importaciones y DUA», apartado 7 · Contabilidad: precio de adquisición, divisa y cuentas',
  },
  {
    id: 'con-04-b2',
    prompt:
      'Una sociedad de Vic compra 500 bombas hidráulicas a un fabricante alemán con NIF-IVA alemán. La mercancía sale de Shanghái y llega directamente al puerto de Barcelona, donde el transitario presenta la declaración de importación con la sociedad como importadora y le cobra como suplido el IVA liquidado por la Aduana. ¿Qué operación es para tu cliente?',
    options: [
      { id: 'a', text: 'Una importación de bienes en España: la mercancía entra desde un país tercero sin estar en libre práctica, y deduce el IVA con la declaración de importación.' },
      {
        id: 'b',
        text: 'Una adquisición intracomunitaria, porque el proveedor es alemán: autorrepercute el IVA en el 303.',
        feedback: 'La adquisición intracomunitaria exige que el bien se envíe desde otro Estado miembro (art. 15 LIVA), y estas bombas vienen de China.',
      },
      {
        id: 'c',
        text: 'Una compra interior con inversión del sujeto pasivo.',
        feedback: 'La mercancía no está en España cuando se vende: entra desde un país tercero, y eso es una importación (art. 18 LIVA).',
      },
      {
        id: 'd',
        text: 'Una operación no sujeta, porque el vendedor no está establecido en España.',
        feedback: 'Las importaciones están sujetas sea quien sea el importador y sea cual sea el fin de los bienes (art. 17 LIVA).',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Decide el recorrido del bien, no la nacionalidad del proveedor. El bien entra desde China sin estar en libre práctica (art. 18 LIVA), la sociedad es la importadora (art. 86 LIVA) y la liquidación de la Aduana es su justificante (art. 97 LIVA).',
    ref: 'Formación «Importaciones y DUA», apartado 1 · Qué es una importación (y qué no)',
  },
  {
    id: 'con-04-b3',
    prompt:
      'A 31/12/2026 una sociedad debe todavía 23.400 USD a su proveedor chino. Registró la compra a 1 EUR = 1,17 USD (20.000 €) y las lámparas siguen en su almacén. El tipo de cierre es 1 EUR = 1,20 USD. ¿Qué hace al cierre?',
    options: [
      {
        id: 'a',
        text: 'Ajusta la deuda y, además, reduce en 500 € el valor de las existencias.',
        feedback: 'Las existencias son una partida no monetaria a coste histórico y conservan el tipo de cambio de la fecha de la transacción.',
      },
      { id: 'b', text: 'Ajusta la deuda a 19.500 € con un cargo de 500 € en la 4004 y abono a la 768; las existencias siguen valoradas a coste.' },
      {
        id: 'c',
        text: 'No hace nada hasta el pago.',
        feedback: 'Las partidas monetarias, como la deuda con el proveedor, se valoran al cierre al tipo de cambio de cierre.',
      },
      {
        id: 'd',
        text: 'Registra una pérdida de 500 € en la 668.',
        feedback: 'La deuda baja de 20.000 € a 19.500 € (23.400 ÷ 1,20): es un beneficio, no una pérdida.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'La deuda con el proveedor es una partida monetaria: al cierre, 23.400 USD ÷ 1,20 = 19.500 €, y la diferencia de 500 € va a la 768. Las existencias no se tocan (NRV 11.ª PGC, apartados 1.2.1 y 1.2.2.1).',
    ref: 'Formación «Importaciones y DUA», apartado 7 · Contabilidad: precio de adquisición, divisa y cuentas',
  },
  {
    id: 'con-04-b4',
    prompt:
      'Una sociedad de Granollers compra mobiliario a un fabricante de Las Palmas de Gran Canaria, que le factura sin IVA. La mercancía llega por barco al puerto de Barcelona. ¿Cómo la tratas a efectos del IVA?',
    options: [
      {
        id: 'a',
        text: 'Como una adquisición intracomunitaria, porque Canarias forma parte de España y de la UE.',
        feedback: 'A efectos del IVA, Canarias queda fuera del «interior del país» y es territorio tercero (art. 3 LIVA).',
      },
      {
        id: 'b',
        text: 'Como una compra interior: el proveedor debió repercutir el 21 %.',
        feedback: 'La entrada de un bien procedente de un territorio tercero es una importación (arts. 3 y 18 LIVA), y su IVA lo liquida la Aduana.',
      },
      {
        id: 'c',
        text: 'Como una operación no sujeta, porque no sale de España.',
        feedback: 'El ámbito del IVA no coincide con el territorio nacional: Canarias, Ceuta y Melilla quedan fuera.',
      },
      { id: 'd', text: 'Como una importación: Canarias es territorio tercero a efectos del IVA; la cuota la liquida la Aduana y se deduce con la declaración de importación.' },
    ],
    correctOptionId: 'd',
    explanation:
      'El art. 3 LIVA excluye Canarias del «interior del país», y el art. 18 considera importación la entrada de un bien procedente de un territorio tercero. Pide al cliente la declaración de importación.',
    ref: 'Formación «Importaciones y DUA», apartado 1 · Qué es una importación (y qué no)',
  },
];

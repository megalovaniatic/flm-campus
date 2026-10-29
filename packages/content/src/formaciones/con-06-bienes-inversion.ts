import type { Formation, QuizQuestion } from '@flm/shared';

/*
 * Fuentes primarias consultadas el 29/10/2026: textos consolidados del BOE (LIVA, RIVA, Reglamento de
 * facturación, PGC, PGC de Pymes y Resolución del ICAC de 1 de marzo de 2013), Manual práctico de IVA 2026
 * e instrucciones del modelo 303 de 2026 de la AEAT, y consultas vinculantes de la DGT V1492-21 y V5404-26.
 */
const LIVA = 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740';
const RIVA = 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925';
const RF = 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696';
const PGC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884';
const PYMES = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966';
const ICAC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-2557';
const MANUAL = 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-05-deducciones-devoluciones';
const M_REG = `${MANUAL}/deducciones/regularizacion-deducciones-bienes-inversion`;
const M_CONCEPTO = `${M_REG}/concepto-bienes-inversion.html`;
const M_PROCEDIMIENTO = `${M_REG}/procedimiento-regularizacion.html`;
const M_ENTREGAS = `${M_REG}/entregas-bienes-invers-per-regularizacion.html`;
const M_FAQ = `${MANUAL}/cuestiones-frecuentes-planteadas-capitulo.html`;
const M303_PDF = 'https://sede.agenciatributaria.gob.es/static_files/Sede/Biblioteca/Manual/Practicos/IVA/IVA_2026/Imagenes/Cap7_303_1T.pdf';
const M303_INSTR = 'https://sede.agenciatributaria.gob.es/Sede/todas-gestiones/impuestos-tasas/iva/modelo-303-iva-autoliquidacion_/instrucciones-2026/instrucciones-02-12-2t-4t-2026.html';
const DGT = 'https://petete.tributos.hacienda.gob.es/consultas/?num_consulta=';
const CONSULTA = '2026-10-29';
/* Formaciones del campus que amplían partes del tema (enlaces internos). */
const CON_03 = '#/aprender/contable/amortizacion-contable-y-fiscal';
const CON_04 = '#/aprender/contable/importaciones-y-dua';
const CON_07 = '#/aprender/contable/facturas-de-anticipo';

export const formation: Formation = {
  id: 'con-06',
  slug: 'bienes-de-inversion',
  area: 'contable',
  title: 'Bienes de inversión: identificarlos y regularizar el IVA cuando cambia la prorrata',
  intro:
    'Una sociedad de Granollers que alquila locales y viviendas te envía en el mismo correo tres facturas: un servidor de 20.000 €, diez sillas de 350 € y una licencia de software de 9.000 €. Aplica la prorrata: el año de la compra cierra en el 80 % y el siguiente baja al 64 %. ¿Qué compras van al libro registro de bienes de inversión, cuánto IVA hay que ingresar y en qué cuenta se registra el ajuste? Aquí aprenderás a decidirlo con la factura delante y a cerrar la regularización sin tocar el coste del activo.',
  summary:
    'Distingue el bien de inversión del IVA del inmovilizado contable, regulariza la deducción cuando cambia la prorrata o se vende el bien y registra el ajuste en las cuentas 6342 y 6392.',
  coverTerm: 'Art. 108',
  readingMinutes: 31,
  outcomes: [
    'Decidir si una compra es bien de inversión en el IVA (art. 108 LIVA), si además es inmovilizado en contabilidad y qué documentos pedir cuando la factura no basta.',
    'Calcular el ajuste a la prorrata definitiva del año de compra (casilla 44), la regularización de los años siguientes (arts. 107 y 109 LIVA, casilla 43) y la regularización única cuando se vende el bien (art. 110).',
    'Contabilizar el IVA no deducible como mayor coste del bien y los ajustes posteriores en las cuentas 6342 y 6392, sin alterar la base de amortización.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Bien de inversión e inmovilizado: no son lo mismo', id: 'concepto' },
    {
      type: 'paragraph',
      text: `En contabilidad, el inmovilizado es un activo no corriente, material o intangible, que la empresa usa durante más de un ejercicio. El PGC no fija un importe mínimo: mandan la naturaleza del activo y su importancia relativa. El [[bien de inversión]] es otra cosa: un concepto del IVA con requisitos propios ([art. 108 LIVA](${LIVA}#a108)). Una compra puede ser inmovilizado y no bien de inversión, y de eso depende que la deducción del IVA se cierre el primer año o quede abierta cinco o diez años.`,
    },
    { type: 'paragraph', text: 'Para ser bien de inversión, la compra debe cumplir cuatro condiciones a la vez:' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Es un bien corporal**: mueble, semoviente o inmueble.',
        '**Por su naturaleza y función, se usa normalmente más de un año.**',
        '**Sirve como instrumento de trabajo o medio de explotación** de la actividad.',
        '**No está en las exclusiones** del art. 108.Dos: accesorios y piezas de recambio para reparar bienes de inversión, obras de reparación de esos bienes, envases y embalajes (aunque se reutilicen), ropa de trabajo y cualquier bien cuyo valor de adquisición sea inferior a 500.000 pesetas.',
      ],
    },
    {
      type: 'paragraph',
      text: `La ley sigue expresando el umbral en pesetas. La AEAT lo traduce a **3.005,06 €** ([Manual práctico IVA 2026](${M_CONCEPTO})) y la DGT lo aplica así: una bicicleta de menor valor no es bien de inversión, y su uso parcial en la actividad no da derecho a deducir ([consulta V1492-21](${DGT}V1492-21)). Por la misma razón, un ordenador de 1.000 € no es bien de inversión, y la deducción del año de compra no se regulariza en los años siguientes ([Manual práctico IVA 2026, cuestiones frecuentes](${M_FAQ})).`,
    },
    {
      type: 'paragraph',
      text: `Una licencia de software tampoco lo es, porque no es corporal. En el IVA solo hay entrega de bienes cuando se transmite el poder de disposición sobre bienes corporales ([art. 8.Uno](${LIVA}#a8)), y el suministro de productos informáticos que no es entrega de bienes es prestación de servicios ([art. 11.Dos.16.º](${LIVA}#a11)). En contabilidad, en cambio, la licencia sí es inmovilizado intangible: cuenta 206 «Aplicaciones informáticas» ([PGC, quinta parte](${PGC}#grupo2-2)).`,
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Bien de inversión',
      text: 'En el IVA, bien corporal (mueble, semoviente o inmueble) que, por su naturaleza y función, se destina normalmente a usarse más de un año como instrumento de trabajo o medio de explotación. Nunca lo son los recambios y las obras para reparar bienes de inversión, los envases y embalajes, la ropa de trabajo ni los bienes de valor inferior a 3.005,06 €. Que algo sea inmovilizado en contabilidad no decide nada.',
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 108', url: `${LIVA}#a108`, date: CONSULTA, kind: 'norma' },
        { label: 'AEAT, Manual práctico IVA 2026: concepto de bienes de inversión', url: M_CONCEPTO, date: CONSULTA, kind: 'criterio' },
      ],
    },
    {
      type: 'table',
      caption: 'Mismas compras, dos preguntas distintas',
      columns: ['Compra', '¿Inmovilizado?', '¿Bien de inversión?', 'Por qué'],
      rows: [
        ['Servidor de 20.000 €', 'Sí (217)', '**Sí**', 'Corporal, de uso durante varios años y de 3.005,06 € o más.'],
        ['Ordenador de 1.200 €', 'Sí (217)', '**No**', 'Vale menos de 3.005,06 €.'],
        ['Licencia de software de 9.000 € (3 años)', 'Sí, intangible (206)', '**No**', 'No es un bien corporal.'],
        ['Repuesto de seguridad de 8.000 € para una prensa', 'Sí, con la prensa (213)', '**No**', 'Es un recambio adquirido para reparar.'],
        ['Envases retornables (palés, bidones)', 'Pueden serlo (219)', '**No**', 'Envases y embalajes, aunque se reutilicen.'],
        ['Reparación del motor de una carretilla, 4.500 €', 'No: es gasto', '**No**', 'Obra de reparación.'],
        ['Máquina de 10.000 € anclada en la nave', 'Sí (213)', '**Sí**, con periodo de 5 años', `Una máquina no es una edificación, aunque esté anclada ([art. 6.Tres.c) LIVA](${LIVA}#a6)).`],
        ['Local comprado para la actividad', 'Sí (211, y el terreno en la 210)', '**Sí**, con periodo de 10 años', 'Es una edificación.'],
      ],
    },
    {
      type: 'paragraph',
      text: `Los envases que deban considerarse inmovilizado y los repuestos con un ciclo de almacenamiento superior al año van a la 219 ([PGC, quinta parte](${PGC}#grupo2-2)). Los repuestos de seguridad de un elemento concreto se registran con él y se amortizan con él, y las piezas de recambio con un ciclo inferior al año son existencias, del grupo 3 ([Resolución del ICAC de 1 de marzo de 2013, norma segunda, 2.4](${ICAC}#segunda)). En el IVA, ninguno es bien de inversión.`,
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'El umbral se aplica a cada bien',
      text: 'Compara 3.005,06 € con el valor de **cada** bien, no con el total de la factura: diez sillas de 350 € son diez bienes de 350 €, no uno de 3.500 €. No hay criterio oficial localizado para dos situaciones: si el valor incluye el IVA no deducible y gastos como el transporte o el montaje, y cómo se mide una instalación hecha de piezas que solo funcionan juntas. Si la compra está cerca del umbral o es una de esas, decídelo con el área y documenta el criterio.',
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 108.Dos.5.º', url: `${LIVA}#a108`, date: CONSULTA, kind: 'norma' },
        { label: 'AEAT, Manual práctico IVA 2026: concepto de bienes de inversión', url: M_CONCEPTO, date: CONSULTA, kind: 'criterio' },
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'arbol-decision',
        title: '¿Es bien de inversión? ¿Con qué periodo?',
        start: 'q1',
        nodes: [
          {
            id: 'q1',
            question: '¿Es un bien corporal? (No lo son una licencia, un servicio ni un derecho)',
            options: [
              { label: 'Sí', next: 'q2' },
              { label: 'No', next: 'o-no-corporal' },
            ],
          },
          {
            id: 'q2',
            question: '¿Es un recambio o una obra para reparar un bien de inversión, un envase o embalaje, o ropa de trabajo?',
            options: [
              { label: 'Sí', next: 'o-excluido' },
              { label: 'No', next: 'q3' },
            ],
          },
          {
            id: 'q3',
            question: '¿Se usará normalmente más de un año como instrumento de trabajo o medio de explotación?',
            options: [
              { label: 'Sí', next: 'q4' },
              { label: 'No', next: 'o-sin-uso' },
            ],
          },
          {
            id: 'q4',
            question: '¿El precio unitario sin IVA de cada bien llega a 3.005,06 €?',
            options: [
              { label: 'Sí', next: 'q5' },
              { label: 'No', next: 'o-umbral' },
              { label: 'No está claro: lote, instalación por piezas o importe cercano', next: 'o-dudoso' },
            ],
          },
          {
            id: 'q5',
            question: '¿Es un terreno o una edificación?',
            options: [
              { label: 'Sí', next: 'o-diez' },
              { label: 'No (también una máquina anclada)', next: 'o-cinco' },
              { label: 'Es una instalación incorporada al edificio', next: 'o-instalacion' },
            ],
          },
          {
            id: 'o-no-corporal',
            outcome: {
              title: 'No es bien de inversión',
              text: 'El art. 108 exige un bien corporal. Una licencia puede ser inmovilizado intangible (206), pero su deducción no se regulariza en los años siguientes.',
              tone: 'resolver',
            },
          },
          {
            id: 'o-excluido',
            outcome: {
              title: 'Excluido por el art. 108.Dos',
              text: 'Recambios y obras de reparación de bienes de inversión, envases y embalajes y ropa de trabajo nunca son bienes de inversión, aunque alguno sea inmovilizado en contabilidad.',
              tone: 'resolver',
            },
          },
          {
            id: 'o-sin-uso',
            outcome: { title: 'No es bien de inversión', text: 'No cumple el art. 108.Uno: su deducción no se regulariza en los años siguientes.', tone: 'resolver' },
          },
          {
            id: 'o-umbral',
            outcome: {
              title: 'No es bien de inversión',
              text: 'Vale menos de 3.005,06 €. Puede ser inmovilizado, pero no va al libro registro de bienes de inversión ni se regulariza.',
              tone: 'resolver',
            },
          },
          {
            id: 'o-dudoso',
            outcome: {
              title: 'Consúltalo antes de anotarlo',
              text: 'No hay criterio oficial localizado sobre lotes, instalaciones por piezas ni sobre si el valor incluye transporte o montaje. Pide el desglose, decídelo con el área y documenta el criterio.',
              tone: 'derivar',
            },
          },
          {
            id: 'o-cinco',
            outcome: {
              title: 'Bien de inversión: 5 años',
              text: 'Año de adquisición, o de inicio de uso, y los cuatro siguientes; divisor 5. Anótalo en el libro registro de bienes de inversión.',
              tone: 'atencion',
            },
          },
          {
            id: 'o-diez',
            outcome: {
              title: 'Bien de inversión: 10 años',
              text: 'Terrenos y edificaciones: año de adquisición, o de inicio de uso, y los nueve siguientes; divisor 10. Anótalo en el libro registro de bienes de inversión.',
              tone: 'atencion',
            },
          },
          {
            id: 'o-instalacion',
            outcome: {
              title: 'Consúltalo: ¿máquina o edificación?',
              text: 'Climatización, ascensores, placas solares o cerramientos: decide con el área si son máquinas (5 años) o parte de la edificación (10 años). Pide la ficha técnica y la memoria de la obra.',
              tone: 'derivar',
            },
          },
        ],
      },
      caption: 'Recorre el árbol con cada línea de la factura. Si acabas en «Consúltalo», no anotes el bien hasta decidirlo con el área.',
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Cómo identificarlo en la factura y en los documentos', id: 'identificar' },
    {
      type: 'paragraph',
      text: 'La calificación se decide línea a línea, con la factura delante. Pero muchas veces la factura sola no basta: el concepto es genérico, falta el precio por unidad o no dice cuándo empezó a funcionar el bien. Sigue este orden: qué mirar, qué pedir y qué documentos relacionar.',
    },
    { type: 'heading', text: 'Qué mirar en la factura', id: 'que-mirar', level: 3 },
    {
      type: 'table',
      caption: 'Campos de la factura que deciden el caso',
      columns: ['Campo', 'Qué compruebas', 'Por qué'],
      rows: [
        [
          '**Concepto**',
          'Qué es el bien (marca, modelo, unidades) y si es una compra, un alquiler, una licencia, una reparación o una mejora.',
          `Solo un bien corporal puede ser bien de inversión, y la regularización alcanza a las cuotas de su adquisición o importación ([art. 107 LIVA](${LIVA}#a107)). Recambios y reparaciones están excluidos.`,
        ],
        ['**Precio unitario sin IVA**', 'Si **cada** bien llega a 3.005,06 €.', `La factura debe mostrarlo ([art. 6.1.f) del Reglamento de facturación](${RF}#a6)) y el umbral se aplica a cada bien.`],
        ['**Unidades**', 'Si el total supera el umbral solo porque hay muchas unidades baratas.', 'Diez sillas de 350 € no son un bien de inversión de 3.500 €.'],
        [
          '**Fecha de expedición y fecha de operación**',
          'En qué año se soporta el IVA. Si pone «anticipo» o «a cuenta», o indica una fecha de pago anticipado, lee el subapartado de anticipos.',
          `La cuota se entiende soportada al recibir la factura ([art. 99.Cuatro LIVA](${LIVA}#a99)), y la prorrata definitiva de ese año es la referencia de las regularizaciones.`,
        ],
        ['**Tipo y cuota**', 'Tipo general del 21 %, salvo los reducidos del art. 91. Comprueba que el cliente deduce con la prorrata provisional del año, no con el 100 %.', `[Arts. 90](${LIVA}#a90) y [105 LIVA](${LIVA}#a105).`],
        ['**Proveedor y origen**', 'Si es una compra interior, una importación (con DUA) o una adquisición intracomunitaria.', 'Cambian el justificante y las casillas del modelo 303: 30-31, 34-35 o 38-39.'],
        [
          '**Palabras de alerta**',
          '«Suministro e instalación», «reparación», «sustitución», «mejora», «licencia», «suscripción», «cuota de renting», «envases retornables», «uniformes».',
          'La factura sola no basta: pide lo que indica la tabla siguiente.',
        ],
      ],
    },
    { type: 'heading', text: 'Cuándo la factura no basta y qué pedir', id: 'que-pedir', level: 3 },
    {
      type: 'table',
      caption: 'Situaciones habituales y documento que resuelve cada una',
      columns: ['Situación', 'Qué falta saber', 'Qué pides y a quién'],
      rows: [
        [
          '«Suministro e instalación de equipo de climatización, 18.000 €»',
          'Si es una máquina (5 años) o parte de la edificación (10 años), y si sustituye a otro equipo o lo repara.',
          'Ficha técnica y memoria de la obra, al cliente (mantenimiento) y al proveedor.',
        ],
        ['«Trabajos en el motor de la línea 2, 6.000 €»', 'Si es una reparación (gasto y nunca bien de inversión) o una mejora (mayor valor del activo).', 'Informe técnico o presupuesto con el alcance, al cliente.'],
        ['Factura de un lote sin precio por unidad', 'El precio unitario sin IVA.', 'Rectificación o desglose, al proveedor.'],
        ['Bien recibido en diciembre que se monta en febrero', 'La fecha real de entrada en funcionamiento.', 'Acta de puesta en marcha, al cliente.'],
        ['Cliente que alquila viviendas y locales, o con varias actividades', 'La prorrata definitiva de cada año y si hay sectores diferenciados.', 'Cálculo de la prorrata, al responsable fiscal del cliente o en su expediente de FLM.'],
        ['Vehículo u otro bien con posible uso privado', 'El grado de uso previsible y cómo se acredita.', 'Al cliente. El uso mixto se explica en la formación «Gastos deducibles en el IS y el IVA».'],
        ['Licencia o software', 'Si es un derecho de uso o un servicio (no es bien corporal) o un soporte físico estándar, que es un caso dudoso.', 'Contrato de licencia, al proveedor. Si hay soporte físico, consúltalo con el área.'],
        ['Renting o leasing', 'Si hay adquisición: la regularización se refiere a las cuotas por adquisición o importación.', 'Contrato, al cliente. Decide con el área si hay adquisición de un bien corporal.'],
        ['Venta de un bien usado por el cliente', 'Fecha y factura de la compra, prorrata de ese año y si la venta está sujeta y no exenta.', 'Al cliente, y en el libro registro de bienes de inversión.'],
      ],
    },
    { type: 'paragraph', text: 'Además de la factura, localiza o pide:' },
    {
      type: 'list',
      items: [
        '**Albarán, acta de entrega o acta de puesta en marcha**: dan la fecha en que el bien empieza a usarse, que mueve el periodo de regularización y el inicio de la amortización.',
        '**Ficha técnica o catálogo**: muestran si es un bien corporal, si es una máquina o una edificación y su vida esperada.',
        '**Presupuesto o informe técnico de la obra**: dicen si es una reparación o una mejora.',
        '**Contrato**: dice si es una compra, un renting o un leasing.',
        '**DUA y documento de liquidación de la Aduana**, en las importaciones.',
        '**Cálculo de la prorrata del cliente**: la definitiva de cada año y la provisional del año en curso.',
        '**Libro registro de bienes de inversión**: si el bien ya está anotado y cuál es su historial.',
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'clasificador',
        title: '¿Va al libro registro de bienes de inversión?',
        prompt: 'Clasifica cada línea de factura de una sociedad con prorrata. Los importes son precios unitarios sin IVA.',
        categories: ['Bien de inversión: 5 años', 'Bien de inversión: 10 años', 'No es bien de inversión', 'Falta información: pide documentos'],
        items: [
          {
            label: 'Servidor, 1 unidad, 20.000 €',
            answer: 'Bien de inversión: 5 años',
            explanation: 'Corporal, de uso durante varios años y por encima de 3.005,06 €. No es terreno ni edificación.',
          },
          {
            label: '10 sillas de oficina a 350 €',
            answer: 'No es bien de inversión',
            explanation: 'El umbral se aplica a cada silla: 350 € es menos de 3.005,06 €.',
          },
          {
            label: 'Licencia de software de gestión para 3 años, 9.000 €',
            answer: 'No es bien de inversión',
            explanation: 'No es un bien corporal. En contabilidad sí es inmovilizado intangible (206).',
          },
          {
            label: 'Reparación del motor del montacargas, con piezas y mano de obra, 4.000 €',
            answer: 'No es bien de inversión',
            explanation: 'Las obras de reparación de bienes de inversión están excluidas (art. 108.Dos LIVA). En contabilidad, es gasto.',
          },
          {
            label: 'Local comprado al promotor para oficinas, con IVA',
            answer: 'Bien de inversión: 10 años',
            explanation: 'Edificación: año de adquisición y los nueve siguientes, con divisor 10.',
          },
          {
            label: 'Máquina envasadora de 10.000 € anclada al suelo de la nave',
            answer: 'Bien de inversión: 5 años',
            explanation: 'Una máquina no es una edificación aunque esté anclada (art. 6.Tres.c LIVA).',
          },
          {
            label: '200 palés retornables a 15 €',
            answer: 'No es bien de inversión',
            explanation: 'Envases y embalajes: excluidos aunque se reutilicen. Además, cada palé vale menos de 3.005,06 €.',
          },
          {
            label: '«Suministro e instalación de equipo de climatización», 18.000 €',
            answer: 'Falta información: pide documentos',
            explanation: '¿Máquina (5 años) o parte del edificio (10 años)? ¿Es nueva o sustituye a otra? Pide la ficha técnica y la memoria de la obra y decide con el área.',
          },
          {
            label: 'Lote de equipos de laboratorio, 12.000 €, sin precio por unidad',
            answer: 'Falta información: pide documentos',
            explanation: 'Sin precio unitario no puedes aplicar el umbral: pide el desglose al proveedor.',
          },
        ],
      },
      caption: 'Ahora tú: nueve líneas de factura como las que recibirás de tus clientes.',
    },
    { type: 'heading', text: 'Importaciones y anticipos', id: 'importaciones-anticipos', level: 3 },
    {
      type: 'paragraph',
      text: `En una importación tendrás tres documentos: la factura del proveedor extranjero, sin IVA español; el DUA, y la factura del transitario o del representante aduanero. Para deducir, el justificante es el documento en que consta la liquidación practicada por la Aduana ([art. 97.Uno.3.º LIVA](${LIVA}#a97)). De ahí sale la cuota soportada: le aplicas la prorrata y declaras la parte deducible en las casillas 34 y 35 del modelo 303. En el libro registro, el bien se identifica con ese documento de aduanas ([art. 65 RIVA](${RIVA}#a65)). No busques la cuota en la factura del transitario. El circuito completo del DUA se explica en la formación [«Importaciones y DUA»](${CON_04}).`,
    },
    {
      type: 'paragraph',
      text: `Una factura de anticipo se reconoce por el concepto («anticipo», «a cuenta», «pago a cuenta») o porque indica la fecha del pago anticipado, que debe constar si es distinta de la de expedición ([art. 6.1.i) del Reglamento de facturación](${RF}#a6)). En una compra interior, el IVA del anticipo se devenga en el momento del cobro, por el importe percibido ([art. 75.Dos LIVA](${LIVA}#a75)), y tu cliente lo soporta al recibir su factura o, si la recibe antes de pagar, al pagar ([art. 99.Cuatro](${LIVA}#a99)): puede caer en un año distinto al de la entrega del bien. En una importación, el anticipo no devenga IVA: se devenga con la importación. Para no deducir dos veces:`,
    },
    {
      type: 'list',
      items: [
        'Pide al cliente el justificante del pago y comprueba que la factura definitiva descuenta el anticipo y su cuota. Si no, pide al proveedor que la rectifique.',
        'Anota el bien una sola vez en el libro registro, con referencia a las dos facturas.',
        `Si el anticipo y la entrega caen en años distintos, no hay criterio oficial localizado sobre qué prorrata de referencia toma cada cuota: consúltalo con el área antes de regularizar. El resto del tratamiento de los anticipos está en la formación [«Facturas de anticipo»](${CON_07}).`,
      ],
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'La regularización cuando cambia la prorrata', id: 'regularizacion' },
    {
      type: 'paragraph',
      text: `La [[prorrata]] la aplica quien, en su actividad, realiza a la vez operaciones que dan derecho a deducir y operaciones que no lo dan ([art. 102 LIVA](${LIVA}#a102)). Es el caso de una sociedad que alquila locales, con IVA del 21 % ([art. 90](${LIVA}#a90)), y viviendas, exentas ([art. 20.Uno.23.º.b)](${LIVA}#a20)). El arrendamiento se considera siempre actividad habitual, así que esas rentas cuentan en el cálculo, y el porcentaje se redondea a la unidad superior ([art. 104](${LIVA}#a104)).`,
    },
    {
      type: 'list',
      items: [
        `**Durante el año** deduces con el porcentaje provisional, que es el definitivo del año anterior, salvo que se haya solicitado otro o la actividad empiece ese año ([art. 105](${LIVA}#a105)).`,
        '**En la última autoliquidación del año** (4T o mes 12) calculas el definitivo y ajustas todas las cuotas del año, corrientes y de inversión: es la casilla 44 del modelo 303.',
        '**En los bienes de inversión, la deducción no se cierra ahí.** Durante su periodo de regularización se revisa cada año si la prorrata definitiva cambia más de diez puntos.',
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Antes de calcular, descarta dos supuestos',
      text: `**Prorrata especial.** Se aplica si el cliente opta por ella, y es obligatoria cuando las cuotas deducibles del año con la general superan en un 10 % o más a las que resultarían con la especial ([art. 103.Dos](${LIVA}#a103)). Con ella, el bien usado solo en operaciones con derecho deduce el 100 %; el usado solo en operaciones sin derecho, nada, y el de uso común, el porcentaje ([art. 106](${LIVA}#a106)).\n\n**Sectores diferenciados.** Las actividades de grupos distintos de la CNAE cuyo porcentaje de deducción difiere en más de 50 puntos del de la actividad principal forman otro sector diferenciado, con sus propias deducciones ([art. 9.1.º.c) LIVA](${LIVA}#a9)). No cuenta como actividad distinta la accesoria que contribuye a realizar la principal y no superó el 15 % de su volumen el año anterior.`,
      refs: [
        { label: 'Ley 37/1992, del IVA, arts. 103 y 106 (prorrata especial)', url: `${LIVA}#a103`, date: CONSULTA, kind: 'norma' },
        { label: 'Ley 37/1992, del IVA, art. 9.1.º.c) (sectores diferenciados)', url: `${LIVA}#a9`, date: CONSULTA, kind: 'norma' },
      ],
    },
    { type: 'heading', text: 'El periodo de regularización', id: 'periodo', level: 3 },
    {
      type: 'paragraph',
      text: `Las cuotas deducibles por adquirir o importar un bien de inversión se regularizan durante los cuatro años naturales siguientes al de la compra; en terrenos y edificaciones, durante los nueve siguientes ([art. 107 LIVA](${LIVA}#a107)). Si el bien empieza a usarse más tarde, el [[periodo de regularización]] arranca el año de inicio de uso.`,
    },
    {
      type: 'table',
      caption: 'Periodo de regularización y divisor',
      columns: ['Bien', 'Periodo', 'Divisor'],
      rows: [
        ['Bienes que no son terrenos ni edificaciones: muebles, semovientes y máquinas, aunque estén ancladas', 'Año de adquisición y los 4 años naturales siguientes', '5'],
        ['Terrenos y edificaciones', 'Año de adquisición y los 9 años naturales siguientes', '10'],
        ['Bien que empieza a usarse después de la compra', 'Año de inicio de uso y los 4 (o 9) siguientes', '5 (o 10)'],
      ],
    },
    {
      type: 'list',
      items: [
        '**Referencia:** el porcentaje que prevaleció el año en que se soportó el IVA, es decir, el definitivo de ese año. No el provisional.',
        '**Más de diez puntos:** solo se regulariza el año cuya prorrata definitiva difiere en más de diez puntos de la referencia. Con diez exactos, no.',
        '**Cambio de situación:** también se regulariza si el año de compra solo hubo operaciones con derecho a deducir, o solo sin él, y eso cambia después.',
        '**Pérdida o inutilización definitiva** del bien, por causa no imputable al cliente y debidamente justificada: no se regulariza en los años siguientes.',
        '**Transmisión de todo el negocio** no sujeta (art. 7.1.º LIVA): no se regulariza; el adquirente se subroga y aplica su propia prorrata.',
      ],
    },
    { type: 'heading', text: 'Cómo se calcula cada año', id: 'calculo', level: 3 },
    {
      type: 'list',
      ordered: true,
      items: [
        'Calcula la deducción que procedería si el IVA se hubiera soportado ese año: cuota × prorrata definitiva del año.',
        'Réstala de la deducción del año de adquisición, calculada con la prorrata definitiva de ese año.',
        `Divide la diferencia entre 5, o entre 10 en terrenos y edificaciones ([art. 109 LIVA](${LIVA}#a109)). Si sale positiva, dedujiste de más y hay un ingreso; si sale negativa, hay una deducción complementaria.`,
      ],
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Dónde y cuándo se declara',
      text: 'Los ingresos o deducciones complementarios van en la autoliquidación del último periodo del año al que se refieren: 4T o mes 12 (art. 107.Siete LIVA). En el modelo 303 se consignan en la casilla 43, con signo negativo si reducen las deducciones y positivo si las aumentan.',
      refs: [
        { label: 'Ley 37/1992, del IVA, arts. 107 y 109', url: `${LIVA}#a107`, date: CONSULTA, kind: 'norma' },
        { label: 'AEAT, instrucciones del modelo 303 de 2026: casilla 43', url: M303_INSTR, date: CONSULTA, kind: 'criterio' },
      ],
    },
    {
      type: 'paragraph',
      text: `La AEAT lo ilustra con una máquina de 20.000 € y 4.200 € de IVA, con una prorrata del 50 % el año de compra ([Manual práctico IVA 2026](${M_PROCEDIMIENTO})). Si al año siguiente la definitiva es del 67 % (17 puntos más), sale una deducción complementaria de 142,80 €: (2.100 − 2.814) / 5. Si fuera del 58 %, no se regularizaría: solo hay 8 puntos de diferencia.`,
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Si el bien se vende dentro del periodo', id: 'venta' },
    {
      type: 'paragraph',
      text: `Si el bien se entrega antes de que termine el periodo, se hace una [[regularización única]] por los años que faltan, **contando el de la venta** ([art. 110 LIVA](${LIVA}#a110); [Manual práctico IVA 2026](${M_ENTREGAS})). Sustituye a la regularización anual de ese año. Se practica aunque el cliente no tuviera prorrata y hubiera deducido siempre el 100 %, y también si vende el bien antes de usarlo. El cálculo: (deducción del año de adquisición − deducción con el porcentaje de la tabla) / 5 × años que faltan; en terrenos y edificaciones, entre 10.`,
    },
    {
      type: 'table',
      caption: 'Regularización única: qué porcentaje se aplica',
      columns: ['Situación', 'Porcentaje', 'Resultado'],
      rows: [
        ['Venta sujeta y no exenta', '100 %: se considera que el bien se usó solo en operaciones con derecho a deducir', 'Deducción complementaria, con el límite de la cuota devengada en la venta'],
        ['Venta exenta o no sujeta', '0 %, salvo que esa entrega dé derecho a deducir', 'Ingreso'],
        ['El bien pasa a destinarse a fines que limitan la deducción (arts. 95 y 96 LIVA)', '0 %', 'Ingreso'],
        ['Venta de todo el negocio, no sujeta (art. 7.1.º LIVA)', 'No se regulariza', 'El comprador se subroga en la posición del vendedor'],
      ],
    },
    {
      type: 'list',
      items: [
        `**La exención de bienes usados no se aplica dentro del periodo.** La del [art. 20.Uno.24.º LIVA](${LIVA}#a20) exige que el vendedor no haya tenido derecho a deducir, ni siquiera en parte, y nunca alcanza a los bienes de inversión vendidos dentro de su periodo de regularización.`,
        `**La venta no entra en la prorrata del año.** Las entregas de bienes de inversión usados en la actividad no se computan en ninguno de sus términos ([art. 104.Tres.3.º](${LIVA}#a104)).`,
        `**El cese de la actividad no lo evita.** La DGT ha confirmado en 2026 que vender dentro del periodo un vehículo afecto, comprado en 2024, obliga a regularizar por el art. 110 aunque la actividad haya cesado ([consulta V5404-26](${DGT}V5404-26)).`,
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Periodo de declaración y cuenta: confírmalos',
      text: 'La ley fija el último periodo del año para las regularizaciones anuales, pero no concreta en qué autoliquidación se declara la regularización única por venta, y la página de la AEAT tampoco. Tampoco hay consulta del ICAC sobre su cuenta: llevarla a la 6392 o la 6342, y no al resultado de la venta (671 o 771), es un criterio razonable. El caso práctico la declara en la casilla 43 y la contabiliza el día de la venta. Confirma las dos cosas con el área antes de presentar.',
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 110', url: `${LIVA}#a110`, date: CONSULTA, kind: 'norma' },
        { label: 'AEAT, Manual práctico IVA 2026: entregas de bienes de inversión durante el periodo de regularización', url: M_ENTREGAS, date: CONSULTA, kind: 'criterio' },
      ],
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Libro registro y modelo 303', id: 'libro-registro' },
    {
      type: 'paragraph',
      text: `Quien tenga que practicar las regularizaciones de los arts. 107 a 110 LIVA debe llevar el [[libro registro de bienes de inversión]], uno de los libros registro del IVA ([arts. 62.1.c)](${RIVA}#a62) y [65 RIVA](${RIVA}#a65)). En él anota, por cada bien individualizado:`,
    },
    {
      type: 'list',
      items: ['los datos que identifican su factura o su documento de aduanas;', 'la fecha en que empieza a usarse;', 'la prorrata anual definitiva;', 'la regularización de cada año, si procede.'],
    },
    {
      type: 'paragraph',
      text: `Si el bien se vende dentro del periodo, se da de baja con la referencia del asiento del libro registro de facturas expedidas que recoge la venta y con la regularización practicada. Quien está en el SII, obligatorio si liquida el IVA cada mes ([art. 62.6 RIVA](${RIVA}#a62)), lleva este libro en la Sede electrónica de la AEAT y remite todos los registros en el plazo del último periodo del año.`,
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Controla también a los clientes sin prorrata',
      text: 'Una venta exenta o no sujeta dentro del periodo obliga a regularizar aunque el cliente haya deducido siempre el 100 %. Es una recomendación interna, no una obligación legal: lleva un control de los bienes de inversión de todos los clientes, con la fecha de inicio de uso y la cuota deducida.',
    },
    {
      type: 'table',
      caption: 'Casillas del modelo 303 de 2026 relacionadas con bienes de inversión',
      columns: ['Casillas', 'Qué se declara'],
      rows: [
        ['30 y 31', 'IVA soportado en operaciones interiores con bienes de inversión.'],
        ['34 y 35', 'IVA soportado en importaciones de bienes de inversión. Justificante: el documento de liquidación de la Aduana.'],
        ['38 y 39', 'IVA soportado en adquisiciones intracomunitarias de bienes de inversión.'],
        ['43', 'Regularización de bienes de inversión, con signo negativo si reduce las deducciones.'],
        ['44', 'Regularización por aplicar el porcentaje definitivo de prorrata. Solo en el 4T o el mes 12, o si cesa la actividad.'],
        ['55 y 56', 'Régimen simplificado: cuotas por activos fijos y regularización de bienes de inversión (la 56, solo en el 4T).'],
      ],
    },
    {
      type: 'paragraph',
      text: `En las casillas 28 a 39 se declaran las cuotas deducibles después de aplicar, en su caso, la prorrata ([instrucciones del modelo 303 de 2026](${M303_INSTR}); [formulario](${M303_PDF})). Las bases, en cambio, se consignan siempre sin prorratear: la instrucción lo dice expresamente.`,
    },

    /* ── 6 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Contabilidad: coste, ajustes y amortización', id: 'contabilidad' },
    {
      type: 'paragraph',
      text: `Los impuestos indirectos solo forman parte del precio de adquisición del inmovilizado cuando no son recuperables de la Hacienda Pública ([NRV 2.ª.1 PGC](${PGC}#A2-2); [Resolución del ICAC de 1 de marzo de 2013, norma primera](${ICAC}#primera)). Por eso, el [[IVA soportado no deducible]] con la prorrata aplicada en la compra es mayor coste del bien ([NRV 12.ª PGC](${PGC}#A12); [NRV 14.ª PGC de Pymes](${PYMES}#A14)). El asiento: cargo en la cuenta del activo (por ejemplo, la 217) por la base más el IVA no deducible; cargo en la 472 por el IVA deducible, y abono en la 523 por el total de la factura.`,
    },
    {
      type: 'paragraph',
      text: `El ajuste a la prorrata definitiva y las regularizaciones de los años siguientes **no** cambian ese coste. La NRV 12.ª lo dice expresamente, incluida la regularización por bienes de inversión, y la NRV 14.ª del PGC de Pymes repite el texto. Van a resultados, siempre contra la 472 ([cuentas 634 y 639](${PGC}#grupo6-2); [cuenta 472](${PGC}#grupo4-2)):`,
    },
    {
      type: 'table',
      caption: 'Dónde va cada ajuste del IVA de un bien de inversión',
      columns: ['Si el ajuste…', 'Cargo', 'Abono'],
      rows: [
        ['Reduce la deducción (ingreso a Hacienda)', '6342 Ajustes negativos en IVA de inversiones', '472 Hacienda Pública, IVA soportado'],
        ['Aumenta la deducción', '472 Hacienda Pública, IVA soportado', '6392 Ajustes positivos en IVA de inversiones'],
      ],
    },
    {
      type: 'paragraph',
      text: `Las subcuentas 6341 y 6391 recogen los mismos ajustes del IVA de los bienes y servicios corrientes. Todas están también en el cuadro de cuentas del [PGC de Pymes](${PYMES}#grupo6). En la venta del bien, el IVA repercutido va a la 477 y no forma parte del resultado de la operación (NRV 12.ª PGC).`,
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'IVA soportado no deducible',
      text: 'Parte del IVA de la compra que no puedes deducir. Es mayor precio de adquisición del activo y se fija con la prorrata aplicada al registrar la compra. El ajuste de fin de año y las regularizaciones posteriores van a resultados, en la 6342 o la 6392, y nunca a la cuenta del activo.',
      refs: [
        { label: 'Plan General de Contabilidad, NRV 12.ª (IVA)', url: `${PGC}#A12`, date: CONSULTA, kind: 'norma' },
        { label: 'PGC de Pymes, NRV 14.ª (IVA)', url: `${PYMES}#A14`, date: CONSULTA, kind: 'norma' },
      ],
    },
    { type: 'heading', text: 'Relación con la amortización', id: 'amortizacion', level: 3 },
    {
      type: 'list',
      items: [
        '**Base de amortización:** el precio de adquisición con el IVA no deducible incluido. No cambia con el ajuste de diciembre ni con las regularizaciones, que son gasto o ingreso del ejercicio y no se amortizan.',
        `**Inicio:** la amortización empieza cuando el bien está en condiciones de funcionamiento, no en la fecha de la factura ([Resolución del ICAC de 1 de marzo de 2013, norma segunda, 3.6](${ICAC}#segunda)). En el IVA, si el uso empieza después de la compra, el periodo de regularización también se retrasa. Comprueba en los dos casos la misma fecha, la de puesta en marcha, aunque cada norma la regule a su manera.`,
        `**Tres plazos independientes:** la vida útil, que fija la empresa; los coeficientes fiscales, que fija la tabla del art. 12 LIS (formación [«Amortización contable y fiscal»](${CON_03})), y el periodo de regularización, que fija la LIVA: 5 o 10 años. Una máquina amortizada en 12 años se regulariza durante 5; un edificio amortizado en 50, durante 10.`,
        '**Reparaciones y mejoras:** la reparación es gasto del ejercicio (norma segunda, 2.1.3) y nunca es bien de inversión. La ampliación o mejora solo es mayor valor del activo si aumenta su capacidad, mejora sustancialmente su productividad o alarga su vida útil (norma segunda, 2.3.3).',
      ],
    },

    /* ── 7 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Procedimiento paso a paso', id: 'paso-a-paso' },
    { type: 'paragraph', text: 'Con cada compra relevante de un cliente, sigue este orden:' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Clasifica la compra.** Comprueba que es un bien corporal, que se usará más de un año como instrumento de trabajo y que no está en las exclusiones del art. 108.Dos. Si no lo es, tiene la deducción normal del año y no se regulariza después.',
        '**Comprueba el valor de cada bien** con el precio unitario sin IVA de la factura. Por debajo de 3.005,06 €, no es bien de inversión. Si está cerca del umbral o hay transporte o montaje aparte, consúltalo con el área.',
        '**Decide el tipo de bien.** Terreno o edificación: 10 años. El resto, incluida una máquina anclada: 5 años.',
        '**Fija el año de inicio del periodo:** el de la adquisición o, si es posterior, el del inicio de uso. Si la fecha no está clara, pide el acta de puesta en marcha.',
        '**Contabiliza la compra** con la prorrata provisional del año. El IVA no deducible suma al coste del bien y la cuota deducible va a la casilla 31, 35 o 39.',
        '**Anota el bien en el libro registro** con su factura o DUA y la fecha de inicio de uso.',
        '**En la última autoliquidación del año de compra** (4T o mes 12), aplica la prorrata definitiva: ajuste en la casilla 44, contra la 6392 o la 6342, sin tocar el activo. Esa definitiva es la referencia de los años siguientes.',
        '**Cada año siguiente del periodo**, compara la prorrata definitiva con la referencia. Si la diferencia supera 10 puntos, calcula la regularización, declárala en la casilla 43 del último periodo con su signo, contabilízala en la 6342 o la 6392 y anótala en el libro registro.',
        '**Si el bien se vende dentro del periodo o pasa a destinarse a fines que limitan la deducción** (arts. 95 y 96 LIVA), haz la regularización única por los años que faltan, incluido el de la venta. Si es una venta, exclúyela de la prorrata y da de baja el bien en el libro registro.',
        '**Archiva el expediente del bien:** factura o DUA, acta de puesta en marcha, cálculo de la prorrata de cada año y regularizaciones practicadas.',
      ],
    },

    /* ── 8 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso práctico: el servidor de una sociedad con prorrata', id: 'caso-practico' },
    {
      type: 'paragraph',
      text: 'Volvemos al cliente de la introducción. Las sillas y la licencia no son bienes de inversión; el servidor, sí. Así se lleva durante todo su periodo.',
    },
    {
      type: 'example',
      title: 'Servidor de 20.000 € comprado por una sociedad que alquila locales y viviendas',
      scenario:
        'Sociedad limitada ficticia de Granollers que aplica el PGC de Pymes, con ejercicio natural; liquida el IVA cada trimestre y no está en el SII. Solo alquila inmuebles, sin sectores diferenciados: locales y oficinas, al 21 %, y viviendas, exentas. Aplica la prorrata general: definitiva del 75 % en 2025 (300.000 € de alquileres con derecho a deducir sobre 400.000 €) y del 80 % en 2026 (320.000 € sobre 400.000 €). Para 2027, 2028, 2029 y 2030 se suponen el 64 %, el 72 %, el 92 % y el 80 %. El 2 de enero de 2026 compra y pone en funcionamiento un servidor para gestionar todos sus inmuebles: una línea, una unidad, 20.000 € más 4.200 € de IVA. Lo paga el 1 de febrero. Vida útil de 5 años, lineal, sin valor residual; para simplificar, se amortiza por años completos.',
      steps: [
        {
          label: '¿Es bien de inversión? Corporal, de uso durante varios años, de más de 3.005,06 € y no es una edificación.',
          formula: 'Año de compra + 4 años siguientes',
          result: 'Periodo de 2026 a 2030, divisor 5',
        },
        {
          label: 'Compra con la prorrata provisional del 75 % (la definitiva de 2025). La base completa, 20.000,00 €, va a la casilla 30 del 1T y la cuota deducible, a la 31.',
          formula: '4.200,00 × 75 % = 3.150,00 deducible · 4.200,00 − 3.150,00 = 1.050,00 no deducible',
          result: 'Coste del servidor: 21.050,00 €',
        },
        { label: 'Amortización anual.', formula: '21.050,00 / 5', result: '4.210,00 € al año' },
        {
          label: 'Ajuste a la definitiva de 2026, del 80 %, en la casilla 44 del 4T de 2026. Esta deducción (3.360,00 €) es la referencia de los años siguientes.',
          formula: '4.200,00 × 80 % − 3.150,00',
          result: '+210,00 € a deducir; el coste sigue en 21.050,00 €',
        },
        {
          label: '2027: prorrata del 64 %, 16 puntos por debajo del 80 %. Se regulariza.',
          formula: '(3.360,00 − 4.200,00 × 64 %) / 5 = (3.360,00 − 2.688,00) / 5',
          result: '134,40 € a ingresar (casilla 43: −134,40)',
        },
        { label: '2028: prorrata del 72 %, solo 8 puntos por debajo.', formula: '80 − 72 = 8 puntos', result: 'No se regulariza' },
        {
          label: '2029: prorrata del 92 %, 12 puntos por encima. Se regulariza.',
          formula: '(3.360,00 − 4.200,00 × 92 %) / 5 = (3.360,00 − 3.864,00) / 5',
          result: '100,80 € a deducir (casilla 43: +100,80)',
        },
        { label: '2030: prorrata del 80 %. El periodo termina el 31 de diciembre.', formula: '80 − 80 = 0 puntos', result: 'No se regulariza' },
        { label: 'IVA deducido en total por el servidor.', formula: '3.150,00 + 210,00 − 134,40 + 100,80', result: '3.326,40 €' },
      ],
      conclusion:
        'Los tres ajustes (210,00, 134,40 y 100,80 €) van a resultados y no tocan la 217 ni la amortización: el servidor queda totalmente amortizado en 2030 por sus 21.050,00 €. Que la vida útil y el periodo de regularización duren 5 años es casualidad: son plazos independientes.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Registro del servidor (2026-2030)',
        entries: [
          {
            date: '2026-01-02',
            concept: 'Compra del servidor con la prorrata provisional del 75 %',
            lines: [
              { account: '217', name: 'Equipos para procesos de información', debit: 21050 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 3150 },
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', credit: 24200 },
            ],
          },
          {
            date: '2026-02-01',
            concept: 'Pago al proveedor',
            lines: [
              { account: '523', name: 'Proveedores de inmovilizado a corto plazo', debit: 24200 },
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', credit: 24200 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Amortización de 2026',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4210 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 4210 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Ajuste a la prorrata definitiva del 80 % (casilla 44 del 4T)',
            lines: [
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 210 },
              { account: '6392', name: 'Ajustes positivos en IVA de inversiones', credit: 210 },
            ],
          },
          {
            date: '2027-12-31',
            concept: 'Amortización de 2027',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4210 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 4210 },
            ],
          },
          {
            date: '2027-12-31',
            concept: 'Regularización de 2027 (casilla 43: −134,40)',
            lines: [
              { account: '6342', name: 'Ajustes negativos en IVA de inversiones', debit: 134.4 },
              { account: '472', name: 'Hacienda Pública, IVA soportado', credit: 134.4 },
            ],
          },
          {
            date: '2028-12-31',
            concept: 'Amortización de 2028 (sin regularización: 8 puntos)',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4210 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 4210 },
            ],
          },
          {
            date: '2029-12-31',
            concept: 'Amortización de 2029',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4210 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 4210 },
            ],
          },
          {
            date: '2029-12-31',
            concept: 'Regularización de 2029 (casilla 43: +100,80)',
            lines: [
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 100.8 },
              { account: '6392', name: 'Ajustes positivos en IVA de inversiones', credit: 100.8 },
            ],
          },
          {
            date: '2030-12-31',
            concept: 'Amortización de 2030: queda totalmente amortizado (5 × 4.210 = 21.050)',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 4210 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 4210 },
            ],
          },
        ],
      },
      caption: 'Los ajustes del IVA van siempre contra la 472 y a resultados (6342 o 6392): la 217 se queda en 21.050,00 € y la amortización, en 4.210,00 € al año.',
    },
    {
      type: 'table',
      caption: 'Lo que se anota cada año en el libro registro. El servidor se identifica con su número de serie, la factura del 02/01/2026 (base de 20.000,00 € y cuota de 4.200,00 €) y el inicio de uso, el 02/01/2026.',
      columns: ['Año', 'Prorrata definitiva', 'Diferencia con el 80 %', 'Regularización (casilla 43)'],
      rows: [
        ['2026 (adquisición)', '80 %', '—', '— (ajuste de +210,00 € en la casilla 44)'],
        ['2027', '64 %', '16 puntos', '−134,40 €'],
        ['2028', '72 %', '8 puntos', '0,00 €'],
        ['2029', '92 %', '12 puntos', '+100,80 €'],
        ['2030', '80 %', '0 puntos', '0,00 €'],
      ],
      numeric: [1, 2, 3],
    },
    { type: 'heading', text: 'Variante: venta del servidor en 2028', id: 'venta-del-servidor', level: 3 },
    {
      type: 'example',
      title: 'Venta del servidor el 1 de julio de 2028',
      scenario:
        'Mismos datos, con el ajuste de 2026 y la regularización de 2027 ya practicados. El 1 de julio de 2028 la sociedad vende el servidor a un tercero por 8.000 € más 1.680 € de IVA (21 %) y cobra el 1 de agosto. La venta está sujeta y no exenta: la exención de bienes usados no se aplica, porque el servidor dio derecho a deducir en parte y, además, sigue dentro de su periodo de regularización.',
      steps: [
        { label: 'Años que faltan, contando el de la venta.', formula: '2028, 2029 y 2030', result: '3 años' },
        {
          label: 'Regularización única: la venta sujeta y no exenta se trata como uso al 100 % en operaciones con derecho a deducir.',
          formula: '(3.360,00 − 4.200,00 × 100 %) / 5 × 3 = −840,00 / 5 × 3',
          result: '504,00 € a deducir (casilla 43: +504,00)',
        },
        { label: 'Límite: la cuota devengada en la venta.', formula: '8.000,00 × 21 % = 1.680,00 ≥ 504,00', result: 'Se deduce entera' },
        { label: 'Amortización de enero a junio de 2028.', formula: '4.210,00 × 6/12', result: '2.105,00 €' },
        { label: 'Valor neto contable al vender.', formula: '21.050,00 − (4.210,00 + 4.210,00 + 2.105,00)', result: '10.525,00 €' },
        { label: 'Resultado de la venta, sin el IVA repercutido, que va a la 477.', formula: '8.000,00 − 10.525,00', result: 'Pérdida de 2.525,00 € (671)' },
      ],
      conclusion:
        'En 2028 no hay regularización anual: la sustituye la única, y la venta no entra en la prorrata de ese año. En el libro registro, el servidor se da de baja con la referencia del asiento de la factura en el libro de facturas expedidas y la regularización de +504,00 €. Si la venta hubiera sido exenta sin derecho a deducir, se aplicaría el 0 %: (3.360,00 − 0) / 5 × 3 = 2.016,00 € a ingresar, contra la 6342. Con este servidor no puede ocurrir, porque la exención no le alcanza.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Venta del servidor (2028)',
        entries: [
          {
            date: '2028-07-01',
            concept: 'Amortización de enero a junio',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 2105 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 2105 },
            ],
          },
          {
            date: '2028-07-01',
            concept: 'Venta del servidor',
            lines: [
              { account: '543', name: 'Créditos a corto plazo por enajenación de inmovilizado', debit: 9680 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', debit: 10525 },
              { account: '671', name: 'Pérdidas procedentes del inmovilizado material', debit: 2525 },
              { account: '217', name: 'Equipos para procesos de información', credit: 21050 },
              { account: '477', name: 'Hacienda Pública, IVA repercutido', credit: 1680 },
            ],
          },
          {
            date: '2028-07-01',
            concept: 'Regularización única por la venta (casilla 43: +504,00)',
            lines: [
              { account: '472', name: 'Hacienda Pública, IVA soportado', debit: 504 },
              { account: '6392', name: 'Ajustes positivos en IVA de inversiones', credit: 504 },
            ],
          },
          {
            date: '2028-08-01',
            concept: 'Cobro de la venta',
            lines: [
              { account: '572', name: 'Bancos e instituciones de crédito c/c vista, euros', debit: 9680 },
              { account: '543', name: 'Créditos a corto plazo por enajenación de inmovilizado', credit: 9680 },
            ],
          },
        ],
      },
      caption: 'La fecha y la cuenta de la regularización única (6392, y no el resultado de la venta) siguen un criterio razonable que ningún texto oficial confirma: valídalos con el área.',
    },

    /* ── 9 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Errores frecuentes y cómo evitarlos', id: 'errores' },
    {
      type: 'table',
      columns: ['Error', 'Cómo evitarlo'],
      rows: [
        [
          'Tratar todo el inmovilizado como bien de inversión: el ordenador de 1.200 €, la licencia, los envases retornables o los repuestos. Acabas regularizando lo que no toca.',
          'Clasifica cada línea con las cuatro condiciones y las exclusiones del art. 108 LIVA.',
        ],
        [
          'Llevar a gasto una mejora de 15.000 € porque la factura dice «reparación».',
          'Pide el informe técnico cuando la factura diga «reparación» o «mejora». Si es una mejora, actívala y consulta con el área si además es bien de inversión.',
        ],
        ['Aplicar el umbral al total de la factura: diez sillas de 350 € no son un bien de 3.500 €.', 'Compara el precio unitario sin IVA de cada bien.'],
        ['Comparar con la prorrata equivocada (la provisional o la del año anterior) o regularizar con 10 puntos de diferencia o menos.', 'Guarda en el libro registro la prorrata definitiva de cada año. La referencia es la del año en que se soportó el IVA.'],
        [
          'Contar mal el periodo: dividir entre 4, empezar en la fecha de la factura cuando el bien entró en funcionamiento al año siguiente o aplicar 5 años a un inmueble.',
          'Usa el acta de puesta en marcha y la tabla del periodo de regularización.',
        ],
        ['Cargar o abonar la regularización en la cuenta del activo: cambia la base de amortización.', 'Usa siempre la 6342 o la 6392 contra la 472.'],
        [
          'Olvidar la regularización al vender o sumarle la anual de ese año, incluir la venta en la prorrata o equivocar el signo de la casilla 43.',
          'Una sola regularización por los años que faltan, contando el de la venta; la venta, fuera de la prorrata, y signo negativo si reduce la deducción.',
        ],
        ['Deducir dos veces el IVA de un anticipo: el de su factura y el de la definitiva sin descontarlo.', 'Comprueba que la definitiva descuenta el anticipo y su cuota, y anota el bien una sola vez.'],
        ['Buscar la cuota de una importación en la factura del transitario.', 'Deduce la del documento de liquidación de la Aduana, en las casillas 34 y 35.'],
      ],
    },

    /* ── 10 ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Lista de comprobación', id: 'lista-comprobacion' },
    { type: 'paragraph', text: 'Antes de cerrar el expediente de un bien, comprueba que:' },
    {
      type: 'list',
      items: [
        'Cada línea de la factura está clasificada como bien de inversión o no, con las cuatro condiciones del art. 108 y sus exclusiones.',
        'Has comparado el precio unitario sin IVA de cada bien con 3.005,06 €.',
        'Has decidido si es terreno o edificación (10 años) o no lo es (5 años) y has documentado por qué.',
        'Tienes la fecha de inicio de uso, con el acta o el albarán, y con ella has fijado el periodo de regularización y el inicio de la amortización.',
        'El IVA no deducible del año de compra está sumado al coste del activo, y la cuota deducible está en la casilla 31, 35 o 39.',
        'En una importación, la cuota sale del documento de liquidación de la Aduana; con un anticipo, la factura definitiva lo descuenta junto con su cuota.',
        'El bien está en el libro registro de bienes de inversión con su factura o DUA, la fecha de inicio de uso y la prorrata.',
        'En el 4T o el mes 12, el ajuste a la prorrata definitiva está en la casilla 44 y contabilizado en la 6342 o la 6392, sin tocar el activo.',
        'Cada año del periodo has comparado la prorrata definitiva con la del año en que se soportó el IVA y solo has regularizado si la diferencia supera 10 puntos, en la casilla 43 y con el signo correcto.',
        'Si el bien se ha vendido o ha cambiado de uso, has hecho la regularización única, con su límite, y has excluido la venta de la prorrata.',
        'Has descartado los sectores diferenciados y la prorrata especial obligatoria antes de calcular.',
      ],
    },
  ],
  keyTerms: [
    {
      term: 'bien de inversión',
      definition:
        'En el IVA, bien corporal (mueble, semoviente o inmueble) que, por su naturaleza y función, se usa más de un año como instrumento de trabajo, salvo las exclusiones legales y los bienes de valor inferior a 3.005,06 € (art. 108 LIVA).',
    },
    {
      term: 'prorrata',
      definition:
        'Porcentaje del IVA soportado que puede deducir quien realiza a la vez operaciones con derecho a deducir y operaciones sin él. Durante el año se aplica el provisional, que es el definitivo del año anterior; en la última autoliquidación se calcula el definitivo.',
    },
    {
      term: 'periodo de regularización',
      definition:
        'Años durante los cuales la deducción de un bien de inversión se corrige si la prorrata cambia más de diez puntos: 10 en terrenos y edificaciones y 5 en los demás bienes, contando el año de adquisición o el de inicio de uso.',
    },
    {
      term: 'regularización única',
      definition:
        'Ajuste que se hace una sola vez cuando el bien de inversión se entrega dentro del periodo. Cubre los años que faltan, incluido el de la entrega, al 100 % o al 0 % según la entrega (art. 110 LIVA).',
    },
    {
      term: 'IVA soportado no deducible',
      definition:
        'Parte del IVA de la compra que no se puede deducir. Es mayor precio de adquisición del activo, y sus rectificaciones posteriores por la prorrata no cambian ese coste (NRV 12.ª PGC).',
    },
    {
      term: 'libro registro de bienes de inversión',
      definition:
        'Libro del IVA en el que quien debe regularizar anota cada bien de inversión, su factura o documento de aduanas, la fecha de inicio de uso, la prorrata definitiva de cada año y las regularizaciones (art. 65 RIVA).',
    },
  ],
  takeaway:
    'No todo el inmovilizado es bien de inversión: el IVA exige un bien corporal de al menos 3.005,06 €, usado más de un año en la actividad y fuera de las exclusiones. Cuando lo es, la deducción no se cierra el primer año: se revisa durante 5 o 10 años si la prorrata cambia más de diez puntos o si se vende el bien, y cada ajuste va a la 6342 o la 6392, nunca al coste del activo.',
  sources: [
    { label: 'Ley 37/1992, del IVA: art. 108 (concepto de bienes de inversión)', url: `${LIVA}#a108`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 107 (regularización de deducciones por bienes de inversión)', url: `${LIVA}#a107`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 109 (procedimiento de regularización)', url: `${LIVA}#a109`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 110 (entregas durante el periodo de regularización)', url: `${LIVA}#a110`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: arts. 102 a 106 (regla de prorrata)', url: `${LIVA}#a102`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 6 (concepto de edificaciones)', url: `${LIVA}#a6`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 8 (entrega de bienes)', url: `${LIVA}#a8`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 9.1.º.c) (sectores diferenciados)', url: `${LIVA}#a9`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 11.Dos.16.º (productos informáticos)', url: `${LIVA}#a11`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 20.Uno.23.º y 24.º (exenciones)', url: `${LIVA}#a20`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 75.Dos (devengo de los anticipos)', url: `${LIVA}#a75`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 90 (tipo general)', url: `${LIVA}#a90`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 95 (limitaciones del derecho a deducir)', url: `${LIVA}#a95`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 97 (requisitos formales de la deducción)', url: `${LIVA}#a97`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA: art. 99 (ejercicio del derecho a la deducción)', url: `${LIVA}#a99`, date: CONSULTA, kind: 'norma' },
    { label: 'Real Decreto 1624/1992, Reglamento del IVA: art. 62 (libros registro)', url: `${RIVA}#a62`, date: CONSULTA, kind: 'norma' },
    { label: 'Real Decreto 1624/1992, Reglamento del IVA: art. 65 (libro registro de bienes de inversión)', url: `${RIVA}#a65`, date: CONSULTA, kind: 'norma' },
    { label: 'Real Decreto 1619/2012, Reglamento de facturación: art. 6 (contenido de la factura)', url: `${RF}#a6`, date: CONSULTA, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 2.ª (inmovilizado material)', url: `${PGC}#A2-2`, date: CONSULTA, kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 12.ª (impuesto sobre el valor añadido)', url: `${PGC}#A12`, date: CONSULTA, kind: 'norma' },
    { label: 'Plan General de Contabilidad, cuarta parte: grupo 6 (cuentas 634 y 639)', url: `${PGC}#grupo6`, date: CONSULTA, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 2 (cuentas 206, 217 y 219)', url: `${PGC}#grupo2-2`, date: CONSULTA, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 4 (cuenta 472)', url: `${PGC}#grupo4-2`, date: CONSULTA, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: grupo 6 (cuentas 634 y 639)', url: `${PGC}#grupo6-2`, date: CONSULTA, kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: NRV 14.ª (impuesto sobre el valor añadido)', url: `${PYMES}#A14`, date: CONSULTA, kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: cuadro de cuentas, grupo 6', url: `${PYMES}#grupo6`, date: CONSULTA, kind: 'norma' },
    { label: 'Resolución del ICAC de 1 de marzo de 2013 (inmovilizado material): norma primera', url: `${ICAC}#primera`, date: CONSULTA, kind: 'norma' },
    { label: 'Resolución del ICAC de 1 de marzo de 2013 (inmovilizado material): norma segunda', url: `${ICAC}#segunda`, date: CONSULTA, kind: 'norma' },
    { label: 'AEAT, Manual práctico IVA 2026: concepto de bienes de inversión', url: M_CONCEPTO, date: CONSULTA, kind: 'criterio' },
    { label: 'AEAT, Manual práctico IVA 2026: procedimiento de regularización', url: M_PROCEDIMIENTO, date: CONSULTA, kind: 'criterio' },
    { label: 'AEAT, Manual práctico IVA 2026: entregas de bienes de inversión durante el periodo de regularización', url: M_ENTREGAS, date: CONSULTA, kind: 'criterio' },
    { label: 'AEAT, Manual práctico IVA 2026: cuestiones más frecuentes del capítulo 5', url: M_FAQ, date: CONSULTA, kind: 'criterio' },
    { label: 'AEAT, Manual práctico IVA 2026: formulario del modelo 303 (1T 2026)', url: M303_PDF, date: CONSULTA, kind: 'documento' },
    { label: 'AEAT, instrucciones del modelo 303 de 2026 (periodos 02 a 12 y 2T a 4T)', url: M303_INSTR, date: CONSULTA, kind: 'criterio' },
    { label: 'DGT, consulta vinculante V1492-21, de 21 de mayo de 2021 (bien de valor inferior a 3.005,06 €)', url: `${DGT}V1492-21`, date: CONSULTA, kind: 'criterio' },
    { label: 'DGT, consulta vinculante V5404-26, de 28 de julio de 2026 (venta dentro del periodo de regularización tras el cese)', url: `${DGT}V5404-26`, date: CONSULTA, kind: 'criterio' },
  ],
  quiz: {
    id: 'con-06-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'con-06-q1',
        prompt:
          'Una sociedad con prorrata recibe en marzo de 2026 una factura con cuatro líneas (precios unitarios sin IVA): 10 sillas de oficina a 350 € (3.500 €), un servidor de 6.000 €, una licencia de software de gestión para 3 años por 9.000 € y la reparación del motor del montacargas, con piezas y mano de obra, por 4.000 €. ¿Qué líneas son bienes de inversión y van al libro registro?',
        options: [
          {
            id: 'a',
            text: 'Todas, porque cada línea supera 3.005,06 €.',
            feedback: 'El umbral se aplica a cada bien, y cada silla vale 350 €. Además, la licencia no es un bien corporal y las reparaciones están excluidas.',
          },
          { id: 'b', text: 'Solo el servidor.' },
          {
            id: 'c',
            text: 'El servidor y la licencia.',
            feedback: 'La licencia es inmovilizado intangible (206), pero el art. 108 LIVA exige un bien corporal.',
          },
          {
            id: 'd',
            text: 'El servidor y la reparación del motor.',
            feedback: 'Las ejecuciones de obra para reparar bienes de inversión nunca lo son (art. 108.Dos LIVA). Además, en contabilidad la reparación es gasto.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'El servidor es corporal, se usará más de un año como instrumento de trabajo y vale 3.005,06 € o más. Las sillas no llegan al umbral por unidad, la licencia no es corporal y la reparación está excluida (art. 108 LIVA).',
        ref: 'Apartado 1 · Bien de inversión e inmovilizado: no son lo mismo',
      },
      {
        id: 'con-06-q2',
        prompt:
          'En 2026, una sociedad compra una máquina por 40.000 € más 8.400 € de IVA. Su prorrata definitiva es del 90 % en 2026 y del 75 % en 2027. ¿Qué hace en el 4T de 2027 por esta máquina?',
        options: [
          {
            id: 'a',
            text: 'Ingresa 1.260 € (8.400 × 15 %) y consigna −1.260 en la casilla 43.',
            feedback: 'La diferencia se divide entre 5: se reparte entre los cinco años del periodo de regularización (art. 109 LIVA).',
          },
          { id: 'b', text: 'Ingresa 252 € (casilla 43: −252) y registra un cargo en la 6342 con abono a la 472.' },
          {
            id: 'c',
            text: 'Deduce 252 € más (casilla 43: +252) y registra un cargo en la 472 con abono a la 6392.',
            feedback: 'El signo está invertido: si la prorrata baja, se dedujo de más el año de compra y sale un ingreso.',
          },
          {
            id: 'd',
            text: 'Nada más: el paso de la provisional de 2027 (90 %) a la definitiva (75 %) ya se ajusta en la casilla 44 del 4T de 2027.',
            feedback: 'La casilla 44 ajusta las cuotas soportadas en 2027. La máquina se compró en 2026, y su deducción se regulariza aparte, en la casilla 43, comparando la definitiva de 2027 con la de 2026.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Deducción de 2026: 8.400 × 90 % = 7.560 €. Deducción que procedería en 2027: 8.400 × 75 % = 6.300 €. La prorrata ha bajado 15 puntos, más de diez, así que la diferencia, 1.260 €, se divide entre 5: 252 € a ingresar en la última autoliquidación de 2027 (arts. 107 y 109 LIVA). En contabilidad, cargo en la 6342 Ajustes negativos en IVA de inversiones con abono a la 472.',
        ref: 'Apartado 3 · La regularización cuando cambia la prorrata',
      },
      {
        id: 'con-06-q3',
        prompt:
          'Una sociedad con prorrata provisional del 70 % en 2026 compra el 1 de marzo una máquina por 10.000 € más 2.100 € de IVA. Su prorrata definitiva de 2026 es del 80 %. ¿Qué es correcto?',
        options: [
          { id: 'a', text: 'El coste de la máquina es de 10.630 €. Al cierre se registra un cargo en la 472 con abono a la 6392 por 210 €, y la base de amortización sigue siendo de 10.630 €.' },
          {
            id: 'b',
            text: 'El coste inicial es de 10.630 €. Al cierre se rebaja a 10.420 €, con abono a la 213, porque al final solo fue no deducible el 20 %.',
            feedback: 'Las rectificaciones del IVA no deducible por la prorrata definitiva no alteran la valoración inicial del activo (NRV 12.ª PGC).',
          },
          {
            id: 'c',
            text: 'El coste es de 10.000 €, y los 630 € de IVA no deducible van a una cuenta de gasto.',
            feedback: 'El IVA soportado no deducible forma parte del precio de adquisición del activo.',
          },
          {
            id: 'd',
            text: 'El coste es de 12.100 €, y al cierre no se registra nada porque es un bien de inversión.',
            feedback: 'El IVA deducible no forma parte del coste, y el ajuste a la prorrata definitiva se hace en todo caso en la última autoliquidación del año.',
          },
        ],
        correctOptionId: 'a',
        explanation:
          'IVA deducible provisional: 2.100 × 70 % = 1.470 €. Los 630 € no deducibles se suman al coste: 10.630 € (NRV 12.ª PGC; NRV 14.ª PGC de Pymes). Con la definitiva del 80 % son deducibles 1.680 €: 210 € más, que van a la casilla 44 y se registran en la 6392, sin tocar el activo ni la base de amortización.',
        ref: 'Apartado 6 · Contabilidad: coste, ajustes y amortización',
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
    id: 'con-06-b1',
    prompt: 'Una sociedad con prorrata compra en marzo de 2026 un local nuevo al promotor, con IVA, y empieza a usarlo ese mes en su actividad. ¿Hasta qué año deberá regularizar la deducción de ese IVA?',
    options: [
      { id: 'a', text: 'Hasta 2030, como cualquier bien de inversión.', feedback: 'El periodo de 5 años (año de compra y cuatro siguientes) es el de los bienes que no son terrenos ni edificaciones.' },
      { id: 'b', text: 'Hasta 2035: el año de compra y los nueve siguientes, dividiendo entre 10.' },
      { id: 'c', text: 'Hasta 2036, porque son diez años naturales siguientes.', feedback: 'Son nueve años naturales siguientes al de la adquisición; el divisor 10 incluye el año de compra.' },
      { id: 'd', text: 'No se regulariza: los inmuebles quedan fuera del art. 108 LIVA.', feedback: 'El art. 108 incluye expresamente los bienes inmuebles.' },
    ],
    correctOptionId: 'b',
    explanation: 'En terrenos y edificaciones, las cuotas se regularizan durante los nueve años naturales siguientes a la adquisición, y la diferencia se divide entre 10 (arts. 107.Tres y 109 LIVA).',
    ref: 'Formación «Bienes de inversión», apartado 3 · La regularización cuando cambia la prorrata',
  },
  {
    id: 'con-06-b2',
    prompt:
      'El 15 de diciembre de 2026, una sociedad con prorrata recibe la factura y la entrega de una máquina de 60.000 €. El montaje y las pruebas terminan el 10 de febrero de 2027, día en que empieza a funcionar. ¿Qué es correcto?',
    options: [
      {
        id: 'a',
        text: 'El periodo de regularización va de 2026 a 2030 y la amortización empieza en diciembre de 2026.',
        feedback: 'Si la entrada en funcionamiento es posterior a la compra, el periodo empieza ese año; y la amortización, cuando el bien está en condiciones de funcionamiento.',
      },
      { id: 'b', text: 'Se regulariza de 2027 a 2031, comparando cada año con la prorrata definitiva de 2026, y la amortización empieza el 10 de febrero de 2027.' },
      { id: 'c', text: 'Se regulariza de 2027 a 2030, porque solo se cuentan cuatro años.', feedback: 'Con entrada en funcionamiento posterior, se regulariza ese año y los cuatro siguientes.' },
      { id: 'd', text: 'El periodo depende de la vida útil contable de la máquina.', feedback: 'El periodo lo fija la LIVA (5 o 10 años), con independencia de la vida útil.' },
    ],
    correctOptionId: 'b',
    explanation:
      'El art. 107.Uno LIVA retrasa el periodo al año de inicio de uso: 2027 y los cuatro siguientes. La referencia sigue siendo el porcentaje del año en que se soportó el IVA, 2026. En contabilidad, la amortización empieza cuando el activo está en condiciones de funcionamiento (Resolución del ICAC de 1 de marzo de 2013, norma segunda, 3.6).',
    ref: 'Formación «Bienes de inversión», apartado 3 · La regularización cuando cambia la prorrata',
  },
  {
    id: 'con-06-b3',
    prompt:
      'Un bien mueble se compró en 2025 por 30.000 € más 6.300 € de IVA, con una prorrata definitiva de 2025 del 60 % (se dedujeron 3.780 €). En 2027 se vende por 12.000 € más 2.520 € de IVA, en una operación sujeta y no exenta. ¿Cuál es la regularización por la venta?',
    options: [
      { id: 'a', text: 'Una deducción complementaria de 1.512 €.' },
      {
        id: 'b',
        text: 'Una deducción complementaria de 2.520 €, toda la diferencia hasta el 100 %.',
        feedback: 'Solo se regulariza la parte de los años que faltan del periodo. Además, 2.520 € es la cuota devengada en la venta, que es el límite, no el importe.',
      },
      { id: 'c', text: 'Una deducción complementaria de 1.008 €, por 2028 y 2029.', feedback: 'Se cuenta también el año de la venta: son 3 años, 2027, 2028 y 2029.' },
      { id: 'd', text: 'Ninguna, si cada año se han practicado las regularizaciones anuales del art. 107.', feedback: 'La entrega dentro del periodo exige una regularización única propia (art. 110 LIVA).' },
    ],
    correctOptionId: 'a',
    explanation:
      '(3.780 − 6.300 × 100 %) / 5 × 3 = −2.520 / 5 × 3 = −1.512, es decir, 1.512 € a deducir. No supera la cuota devengada en la venta (2.520 €), así que se deduce entera (art. 110.Uno.1.º LIVA).',
    ref: 'Formación «Bienes de inversión», apartado 4 · Si el bien se vende dentro del periodo',
  },
  {
    id: 'con-06-b4',
    prompt:
      'Una sociedad con prorrata, que ha comprado varios bienes de inversión en los últimos tres años, liquida el IVA cada trimestre y no está en el SII. ¿Qué es correcto sobre su libro registro de bienes de inversión?',
    options: [
      { id: 'a', text: 'Debe llevarlo y anotar, por cada bien individualizado, su factura o documento de aduanas, la fecha de inicio de uso, la prorrata anual definitiva y la regularización anual.' },
      { id: 'b', text: 'Solo deben llevarlo las empresas incluidas en el SII.', feedback: 'El SII cambia la forma de llevarlo, en la Sede electrónica, no la obligación.' },
      { id: 'c', text: 'Basta con el libro registro de facturas recibidas.', feedback: 'El Reglamento del IVA lo regula como un libro registro propio (art. 62.1.c RIVA).' },
      { id: 'd', text: 'En él se anotan todos los elementos del inmovilizado, incluidos los intangibles.', feedback: 'Solo se anotan los bienes de inversión del art. 108 LIVA.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Quien deba practicar las regularizaciones de los arts. 107 a 110 LIVA lleva este libro, y una sociedad con prorrata y bienes de inversión dentro de su periodo está en ese caso. Anota por cada bien los datos de su factura o documento de aduanas, la fecha de inicio de uso, la prorrata anual definitiva y la regularización, y lo da de baja si lo vende dentro del periodo (art. 65 RIVA).',
    ref: 'Formación «Bienes de inversión», apartado 5 · Libro registro y modelo 303',
  },
];

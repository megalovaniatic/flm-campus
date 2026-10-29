import type { Formation, QuizQuestion } from '@flm/shared';

/*
 * Fuentes primarias consultadas el 28/10/2026: textos consolidados del BOE (LIS actualizada el 03/09/2026,
 * LIVA el 07/10/2026), BOE-A-2026-5843 y Manual práctico de IVA 2026 de la AEAT.
 */
const LIS = 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328';
const LIVA = 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740';
const LGT = 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186';
const LIRPF = 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764';
const RIRPF = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820';
const RF = 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696';
const LSC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544';
const CCOM = 'https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627';
const PGC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884';
const PLAN_2026 = 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-5843';
const MANUAL_IVA =
  'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2026/capitulo-05-deducciones-devoluciones/deducciones/requisitos-deduccion/iva-soportado-adq-bienes-servic-profes.html';
const CONSULTA = '2026-10-28';

export const formation: Formation = {
  id: 'fis-03',
  slug: 'gastos-deducibles',
  area: 'fiscal',
  title: 'Gastos deducibles en el IS y el IVA: lo que Hacienda revisa',
  intro:
    'Una startup paga con la tarjeta de la sociedad la cena familiar del fundador, el renting del coche que este también usa los fines de semana y vino para regalar a clientes, y deduce todo el IVA. La Agencia Tributaria ha anunciado que en 2026 prestará especial atención al uso abusivo de sociedades instrumentales para pagar gastos personales de los socios. Aprende a separar lo deducible antes de que llegue un requerimiento.',
  summary:
    'Cuándo un gasto reduce el IS y cuándo se deduce su IVA: comidas, coches, portátiles, viajes y gastos de los socios, con un caso resuelto y los errores que Hacienda detecta.',
  coverTerm: '¿Deducible?',
  readingMinutes: 12,
  outcomes: [
    'Identificar si un gasto habitual (comida, vehículo, equipo o viaje) es deducible en el IS y si su IVA lo es, con la norma que lo justifica.',
    'Calcular el IVA deducible de un conjunto de gastos y el ajuste en el IS por el exceso de atenciones a clientes sobre el 1 % de la cifra de negocios.',
    'Decidir qué documentación o instrumentación recomendar al cliente: factura a nombre de la sociedad, registro de uso, retribución en especie o cargo al socio.',
  ],
  blocks: [
    /* ── 1. IS ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Las cuatro condiciones del gasto en el IS', id: 'condiciones-is' },
    {
      type: 'paragraph',
      text: `En el Impuesto sobre Sociedades (IS), la base imponible parte del resultado contable, corregido según la ley ([art. 10.3 LIS](${LIS}#a10)). Un gasto solo la reduce si cumple cuatro condiciones:`,
    },
    {
      type: 'list',
      ordered: true,
      items: [
        `**Contabilización:** debe figurar en la cuenta de pérdidas y ganancias (o en reservas, si una norma lo establece), salvo amortizaciones libres o aceleradas ([art. 11.3.1.º LIS](${LIS}#a11)).`,
        '**Imputación temporal:** se deduce en el ejercicio de su devengo; si se contabiliza en uno posterior, se admite en este, siempre que no resulte una tributación inferior (art. 11 LIS).',
        `**Justificación:** la factura es la prueba prioritaria, pero no privilegiada; si Hacienda cuestiona fundadamente la operación, hay que probar que es real ([art. 106.4 LGT](${LGT}#a106)).`,
        `**Correlación:** debe existir [[correlación con los ingresos]]; si no, es una [[liberalidad]] o un gasto personal ([art. 15.e LIS](${LIS}#a15)).`,
      ],
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'correlación con los ingresos',
      text: 'Es el vínculo, directo o indirecto, entre el gasto y la actividad que genera ingresos. Pregúntate: «¿quién lo disfruta y para qué?». Una comida para negociar un contrato tiene correlación; la cena familiar del socio, no, aunque la pague la sociedad.',
    },
    {
      type: 'paragraph',
      text: `El [art. 15 LIS](${LIS}#a15) excluye, entre otros, las multas y sanciones, los recargos del período ejecutivo y por presentar fuera de plazo (letra c) y los donativos y liberalidades (letra e). La propia letra e) aclara que **no** son liberalidad:`,
    },
    {
      type: 'list',
      items: [
        'los gastos con el personal según usos y costumbres, como la cena de Navidad;',
        'los de promoción y los correlacionados con los ingresos;',
        'las [[atenciones a clientes]] o proveedores, deducibles hasta el **1 % del importe neto de la cifra de negocios (INCN)** del período;',
        'la retribución de los administradores por funciones de alta dirección o derivadas de un contrato laboral.',
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Lo que vigila Hacienda en 2026',
      text: `Las directrices del [Plan Anual de Control Tributario y Aduanero de 2026](${PLAN_2026}) anuncian especial atención al uso abusivo de sociedades instrumentales para pagar «gastos personales de todo tipo» de los socios y financiarles activos de uso personal, como vehículos. Si la sociedad paga un gasto privado del socio, cárgalo en su cuenta o documéntalo como retribución, con su retención; si no, no se deduce y puede tributar en el IRPF del socio ([art. 25.1.d LIRPF](${LIRPF}#a25)).`,
      refs: [
        {
          label: 'Resolución de 11 de marzo de 2026, de la AEAT: directrices del Plan Anual de Control Tributario y Aduanero de 2026 (BOE de 12 de marzo)',
          url: PLAN_2026,
          date: CONSULTA,
          kind: 'criterio',
        },
        { label: 'Ley 35/2006, del IRPF, art. 25 (rendimientos del capital mobiliario)', url: `${LIRPF}#a25`, date: CONSULTA, kind: 'norma' },
      ],
    },

    /* ── 2. IVA ────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'IVA: afectación, exclusiones y factura', id: 'iva-deducible' },
    {
      type: 'paragraph',
      text: `En el IVA solo se deduce lo que se afecta **directa y exclusivamente** a la actividad ([art. 95 LIVA](${LIVA}#a95)). Lo que también se usa para fines privados no se deduce, salvo que sea un [[bien de inversión]]: entonces se deduce según su uso previsible. Comprobada la [[afectación]], revisa las exclusiones del [art. 96.Uno LIVA](${LIVA}#a96), que impide deducir, en ninguna proporción, el IVA de:`,
    },
    {
      type: 'list',
      items: [
        'joyas y alhajas;',
        'alimentos, bebidas y tabaco;',
        'espectáculos y servicios recreativos;',
        'atenciones a clientes, asalariados o terceros, salvo muestras gratuitas y objetos publicitarios de escaso valor;',
        'viajes, hostelería y restauración, **salvo** que el gasto sea deducible en el IS o en el IRPF.',
      ],
    },
    {
      type: 'paragraph',
      text: `Hay excepciones tasadas, como lo que compra un restaurante para servir (art. 96.Dos). Ojo a la asimetría: la comida con un cliente es deducible en el IS dentro del 1 % del INCN, pero su IVA nunca; el del hotel y las comidas de una empleada que viaja por trabajo, en cambio, sí se deduce. El IVA no deducible suma al coste del gasto ([PGC, norma 12.ª](${PGC}#A12)).`,
    },
    {
      type: 'paragraph',
      text: `Además, hace falta una factura a nombre de la sociedad ([art. 97 LIVA](${LIVA}#a97)). Una factura simplificada (el antiguo tique) solo sirve si incluye el NIF y el domicilio de la sociedad y la cuota separada ([art. 7.2 del Reglamento de facturación](${RF}#a7)). Si falta un dato, pide la rectificación. El derecho a deducir solo puede ejercerse en los cuatro años siguientes a su nacimiento ([arts. 99.Tres y 100 LIVA](${LIVA}#a99)).`,
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Hábitos que evitan regularizaciones',
      text: `Pide la factura en el momento y anota en cada comida asistentes y motivo. Conserva los justificantes mientras Hacienda pueda comprobar el impuesto (cuatro años como regla general, [art. 66 LGT](${LGT}#a66); diez si sustentan bases negativas, [art. 66 bis LGT](${LGT}#a66bis)) y, como mínimo, seis años desde el último asiento ([art. 30 CCom](${CCOM}#art30)).`,
      refs: [
        { label: 'Ley 58/2003, General Tributaria, art. 66 (plazos de prescripción)', url: `${LGT}#a66`, date: CONSULTA, kind: 'norma' },
        { label: 'Código de Comercio, art. 30 (conservación de libros y justificantes)', url: `${CCOM}#art30`, date: CONSULTA, kind: 'norma' },
      ],
    },

    /* ── 3. Uso mixto ──────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Coches, portátiles y móviles de uso mixto', id: 'uso-mixto' },
    {
      type: 'paragraph',
      text: `«¿Puedo deducirme el coche al 100 %?» Depende del impuesto. En el IVA, los turismos se presumen afectos al 50 %, pero, según el [Manual práctico de IVA 2026](${MANUAL_IVA}), antes hay que acreditar algún uso empresarial; un porcentaje mayor lo prueba la empresa, y uno menor, Hacienda. El 100 % solo se presume en vehículos tasados, como los mixtos de transporte de mercancías o los de agentes comerciales.`,
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Art. 95.Tres LIVA, en tres reglas',
      text: '**Regla 2.ª:** turismos, remolques, ciclomotores y motocicletas se presumen afectos al 50 %. **Regla 3.ª:** si se acredita otro grado de uso, se regulariza. **Regla 4.ª:** el uso se prueba por cualquier medio, pero ni la autoliquidación ni la contabilización del vehículo bastan.',
      refs: [
        { label: 'Ley 37/1992, del IVA, art. 95 (limitaciones del derecho a deducir)', url: `${LIVA}#a95`, date: CONSULTA, kind: 'norma' },
        { label: 'AEAT, Manual práctico de IVA 2026: afectación de bienes y servicios', url: MANUAL_IVA, date: CONSULTA, kind: 'criterio' },
      ],
    },
    {
      type: 'paragraph',
      text: `En el IS no hay presunción: se deduce la parte vinculada a la actividad. El uso privado de un trabajador es deducible si se pacta como [[retribución en especie]], por la que tributará en su IRPF: el 20 % anual del coste del coche o, si no es de la empresa, de su valor de mercado como nuevo ([art. 43.1.1.º.b LIRPF](${LIRPF}#a43)). Si es el administrador, comprueba que los estatutos prevean la retribución: si no, el cargo es gratuito ([art. 217 LSC](${LSC}#a217)).`,
    },
    {
      type: 'paragraph',
      text: `Ojo con los autónomos: en su IRPF, un turismo de uso también privado no se considera afecto, salvo excepciones tasadas ([art. 22 RIRPF](${RIRPF}#a22)). Sobre la cesión del coche a la plantilla, consulta la nota del Área Fiscal vinculada.`,
    },
    {
      type: 'paragraph',
      text: `«¿Puedo deducir el portátil del fundador?» Sí, si la factura está a nombre de la sociedad y el equipo sirve a la actividad. Pero es inmovilizado: en el IS se amortiza como máximo al **25 %** anual ([art. 12.1.a LIS](${LIS}#a12)), el doble si es nuevo y la sociedad es de reducida dimensión, con INCN del año anterior inferior a 10 millones ([arts. 101 y 103 LIS](${LIS}#a103)). Los elementos nuevos de hasta 300 € admiten libertad de amortización (art. 12.3.e LIS).`,
    },
    {
      type: 'paragraph',
      text: `En el IVA, el uso mixto lo cambia todo: un portátil o un móvil de menos de 3.005,06 € no es bien de inversión ([art. 108 LIVA](${LIVA}#a108)); si también se usa para fines privados, no se deduce **nada** de su IVA. Y con la factura a nombre del fundador, la sociedad tampoco puede deducirlo.`,
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Prepara la prueba del uso',
      text: 'Firma con el cliente una política de uso, inventaría los equipos con su usuario y lleva un registro de desplazamientos (fecha, destino y motivo). Si hay uso privado, coordina con Laboral la retribución en especie.',
    },

    /* ── 4. Caso práctico ──────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso práctico: ocho gastos de una startup', id: 'caso-practico' },
    {
      type: 'table',
      caption: 'Gastos de Brisa Apps, S.L. en 2026',
      columns: ['N.º', 'Gasto', 'Base (€)', 'Tipo', 'Cuota (€)'],
      rows: [
        ['1', 'Comidas con clientes (asistentes y motivo anotados)', '2.800,00', '10 %', '280,00'],
        ['2', 'Vino sin logotipo regalado a clientes', '900,00', '21 %', '189,00'],
        ['3', 'Cena de Navidad de la plantilla', '1.500,00', '10 %', '150,00'],
        ['4', 'Cena familiar del socio-administrador', '240,00', '10 %', '24,00'],
        ['5', 'Portátil del CTO, solo para trabajar (alta: 1 de abril)', '1.600,00', '21 %', '336,00'],
        ['6', 'Renting del turismo (uso profesional acreditado: 50 %)', '5.400,00', '21 %', '1.134,00'],
        ['7', 'Material de oficina con tique sin NIF', '100,00', '21 %', '21,00'],
        ['8', 'Multa de tráfico', '200,00', '—', '—'],
        ['', '**Total**', '**12.740,00**', '', '**2.134,00**'],
      ],
      numeric: [2, 3, 4],
    },
    {
      type: 'example',
      title: 'Brisa Apps, S.L.: qué se deduce y cuánto cuesta',
      scenario:
        'Brisa Apps (ficticia) es una startup de software con bases imponibles positivas desde 2022 y sin la condición de empresa emergente ([Ley 28/2022](https://www.boe.es/buscar/act.php?id=BOE-A-2022-21739#a7)): no aplica el 15 % de nueva creación ni el de las empresas emergentes. INCN: 380.000 € en 2026 y 300.000 € en 2025. Base imponible antes de revisar la tabla: 62.000 €. Todo tiene factura completa a nombre de la sociedad, salvo el material (pagado con tarjeta) y la multa. El uso privado del coche no está pactado como retribución. Se supone que el material se acredita por otros medios y que el IVA de su tique (21 €) es gasto, aunque sobre esto no hay criterio administrativo confirmado.',
      steps: [
        {
          label: '**IVA deducible:** solo el del portátil (afecto en exclusiva) y la mitad del del turismo; el resto son atenciones (art. 96.Uno LIVA), un gasto no afecto o un tique sin NIF.',
          formula: '336,00 + 1.134,00 × 50 %',
          result: '903,00 € de 2.134,00 € soportados',
        },
        {
          label: '**Coste en resultados:** cada gasto más su IVA no deducible; del portátil, nueve meses de amortización al 25 %.',
          formula: '3.080 + 1.089 + 1.650 + 264 + (1.600 × 25 % × 9/12) + 5.967 + 121 + 200',
          result: '12.671,00 €',
        },
        {
          label: '**Límite de las atenciones a clientes** (comidas y vino, con su IVA). La cena de Navidad no computa: es gasto de personal.',
          formula: '4.169,00 − 1 % × 380.000,00',
          result: 'Ajuste positivo de 369,00 €',
        },
        {
          label:
            '**Otros ajustes positivos:** cena familiar (art. 15.e LIS), multa (art. 15.c LIS) y mitad privada del turismo, con todo su IVA no deducible: es justo el que corresponde al uso privado.',
          formula: '264,00 + (5.400,00 + 1.134,00) × 50 % + 200,00',
          result: '3.731,00 €',
        },
        {
          label: '**Gasto deducible en el IS.** Del renting quedan 2.700,00 €: la mitad profesional de la base, cuyo IVA ya se ha deducido.',
          formula: '12.671,00 − 369,00 − 3.731,00',
          result: '8.571,00 € (ajustes: 4.100,00 €)',
        },
        {
          label: `**Coste fiscal:** con un INCN de 2025 inferior a 1 millón, Brisa tributa en 2026 al 19 % hasta 50.000 € de base y al 21 % el resto ([DT 44.ª.2 LIS](${LIS}#dt-6)): todo el ajuste tributa al 21 %.`,
          formula: '4.100,00 × 21 %',
          result: '861,00 € más de cuota',
        },
      ],
      conclusion:
        'Si Brisa hubiera deducido todo el IVA, Hacienda podría regularizarle 1.231,00 € más intereses de demora y, en su caso, sanción. Aconseja cargar la cena familiar al socio, valorar pactar el uso privado del coche como retribución en especie, pedir factura con NIF y planificar las atenciones: la ley no prevé trasladar el exceso sobre el 1 % a otros ejercicios.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'clasificador',
        title: '¿Deducible en el IS, en el IVA o en ninguno?',
        prompt: 'Clasifica cada gasto de una SL; supón que hay factura completa a su nombre cuando procede.',
        categories: ['Deducible en IS e IVA', 'Deducible en IS, pero no su IVA', 'Deducible solo en parte', 'No deducible'],
        items: [
          {
            label: 'Hotel y cenas de una comercial que viaja para visitar clientes',
            answer: 'Deducible en IS e IVA',
            explanation: 'Viaje de trabajo: su IVA se deduce porque el gasto es deducible en el IS (art. 96.Uno.6.º LIVA).',
          },
          {
            label: 'Portátil que la diseñadora usa solo para trabajar',
            answer: 'Deducible en IS e IVA',
            explanation: 'En el IS, a través de la amortización; su IVA, entero, porque está afecto en exclusiva.',
          },
          {
            label: 'Furgoneta mixta para repartir la mercancía',
            answer: 'Deducible en IS e IVA',
            explanation: 'Los vehículos mixtos de transporte de mercancías se presumen afectos al 100 % en el IVA (art. 95.Tres.2.ª LIVA).',
          },
          {
            label: 'Comida con un cliente para negociar un contrato, dentro del límite del 1 %',
            answer: 'Deducible en IS, pero no su IVA',
            explanation: 'Atención a clientes: en el IS, hasta el 1 % del INCN; su IVA, nunca (art. 96.Uno.5.º LIVA).',
          },
          {
            label: 'Cena de Navidad de la plantilla',
            answer: 'Deducible en IS, pero no su IVA',
            explanation: 'Gasto de personal según usos y costumbres, sin el límite del 1 %; su IVA no se deduce: es una atención a asalariados.',
          },
          {
            label: 'Turismo que el administrador usa también los fines de semana, sin pacto de retribución en especie',
            answer: 'Deducible solo en parte',
            explanation: 'En el IVA, presunción del 50 %. En el IS, solo la parte vinculada a la actividad.',
          },
          {
            label: 'Cena familiar del socio pagada con la tarjeta de la sociedad',
            answer: 'No deducible',
            explanation: 'Gasto personal, sin correlación con los ingresos; su IVA no está afecto. Cárgala al socio.',
          },
          {
            label: 'Recargo por presentar tarde, sin requerimiento, una autoliquidación',
            answer: 'No deducible',
            explanation: 'Lo excluye expresamente el art. 15.c LIS. No lleva IVA.',
          },
        ],
      },
      caption: 'Ahora tú: ocho gastos nuevos.',
    },

    /* ── 5. Mitos y cierre ─────────────────────────────────────────────────── */
    { type: 'heading', text: 'Mitos que conviene desmontar', id: 'mitos' },
    {
      type: 'paragraph',
      text: '¿Sabrías rebatir estas frases con la norma en la mano?',
    },
    {
      type: 'widget',
      widget: {
        kind: 'tarjetas-verdad',
        title: 'Mitos sobre gastos deducibles',
        cards: [
          {
            claim: '«Si lo pago con la tarjeta de la sociedad, es gasto de la sociedad».',
            verdict: 'falso',
            explanation: 'El medio de pago no decide nada: la cena con clientes es deducible dentro del 1 % del INCN; la familiar, no, y puede tributar en el IRPF del socio.',
          },
          {
            claim: '«Si es deducible en el IS, su IVA también lo es».',
            verdict: 'falso',
            explanation: 'El IVA de las atenciones a clientes o a la plantilla nunca se deduce; la salvedad ligada al IS solo vale para viajes, hostelería y restauración.',
          },
          {
            claim: '«Me puedo deducir el coche al 100 %».',
            verdict: 'depende',
            explanation: 'En el IVA, el turismo se presume afecto al 50 %; más, solo con prueba o en vehículos tasados. En el IS, el uso privado solo se deduce como retribución en especie.',
          },
          {
            claim: '«El portátil se deduce entero el año de la compra».',
            verdict: 'falso',
            explanation: 'Por regla general, no: es inmovilizado y se amortiza al 25 % anual como máximo (el doble si es nuevo y la sociedad es de reducida dimensión).',
          },
        ],
      },
      caption: 'Con su veredicto y el porqué.',
    },
  ],
  keyTerms: [
    {
      term: 'correlación con los ingresos',
      definition: `Vínculo, directo o indirecto, entre un gasto y la actividad que genera ingresos; sin él, el gasto no es deducible ([art. 15.e LIS](${LIS}#a15)).`,
    },
    {
      term: 'liberalidad',
      definition: `Disposición gratuita sin relación con la obtención de ingresos; no es deducible en el IS. No lo son las atenciones a clientes ni los gastos de personal según usos y costumbres ([art. 15.e LIS](${LIS}#a15)).`,
    },
    {
      term: 'atenciones a clientes',
      definition: `Gastos de cortesía para cuidar la relación comercial (comidas, regalos, invitaciones). En el IS se deducen hasta el 1 % del INCN; su IVA, nunca ([art. 96.Uno.5.º LIVA](${LIVA}#a96)).`,
    },
    {
      term: 'afectación',
      definition: `Destino de un bien o servicio a la actividad. En el IVA debe ser directa y exclusiva, salvo en bienes de inversión, deducibles según su uso previsible ([art. 95 LIVA](${LIVA}#a95)).`,
    },
    {
      term: 'bien de inversión',
      definition: `En el IVA, bien corporal destinado a usarse más de un año como instrumento de trabajo y con valor de adquisición de al menos 3.005,06 €; admite deducción parcial si el uso es mixto ([art. 108 LIVA](${LIVA}#a108)).`,
    },
    {
      term: 'retribución en especie',
      definition: `Uso o consumo de bienes o servicios para fines particulares, gratis o por debajo del precio de mercado ([art. 42.1 LIRPF](${LIRPF}#a42)): gasto de personal para la sociedad y renta para quien la recibe.`,
    },
  ],
  takeaway:
    'En el IS, un gasto se deduce si está contabilizado, imputado a su ejercicio, justificado y vinculado a la actividad; en el IVA, además, debe estar afecto, no figurar entre las exclusiones del art. 96 y constar en factura a nombre de la sociedad. Pregunta siempre: «¿quién lo disfruta y para qué?».',
  sources: [
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades, art. 11 (imputación temporal)', url: `${LIS}#a11`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades, art. 12 (amortizaciones)', url: `${LIS}#a12`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades, art. 15 (gastos no deducibles)', url: `${LIS}#a15`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades, DT 44.ª (tipos de gravamen de 2025 a 2028)', url: `${LIS}#dt-6`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 28/2022, de fomento del ecosistema de las empresas emergentes, art. 7 (tipo del 15 %)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-21739#a7', date: CONSULTA, kind: 'norma' },
    { label: 'Plan General de Contabilidad (Real Decreto 1514/2007), norma de registro y valoración 12.ª (IVA no deducible)', url: `${PGC}#A12`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA, art. 95 (limitaciones del derecho a deducir)', url: `${LIVA}#a95`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA, art. 96 (exclusiones y restricciones del derecho a deducir)', url: `${LIVA}#a96`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA, art. 97 (requisitos formales de la deducción)', url: `${LIVA}#a97`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 37/1992, del IVA, art. 108 (concepto de bienes de inversión)', url: `${LIVA}#a108`, date: CONSULTA, kind: 'norma' },
    { label: 'Reglamento de facturación (Real Decreto 1619/2012), art. 7 (facturas simplificadas)', url: `${RF}#a7`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria, art. 106 (prueba de gastos y deducciones)', url: `${LGT}#a106`, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 35/2006, del IRPF, art. 43 (valoración de las rentas en especie)', url: `${LIRPF}#a43`, date: CONSULTA, kind: 'norma' },
    {
      label: 'Resolución de 11 de marzo de 2026, de la AEAT: directrices del Plan Anual de Control Tributario y Aduanero de 2026 (BOE de 12 de marzo)',
      url: PLAN_2026,
      date: CONSULTA,
      kind: 'criterio',
    },
    { label: 'AEAT, Manual práctico de IVA 2026: afectación de bienes y servicios a la actividad', url: MANUAL_IVA, date: CONSULTA, kind: 'criterio' },
  ],
  quiz: {
    id: 'fis-03-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'fis-03-q1',
        prompt:
          'Una SL invita a comer a dos clientes para negociar la renovación de un contrato. Tiene factura completa a su nombre (300 € de base y 30 € de IVA) y anota asistentes y motivo. Sus atenciones a clientes del año no superan el 1 % del INCN. ¿Cómo se trata el gasto?',
        options: [
          {
            id: 'a',
            text: 'IS: 300 € deducibles. IVA: 30 € deducibles, porque el IVA de la restauración se deduce si el gasto es deducible en el IS.',
            feedback: 'Esa salvedad es la del art. 96.Uno.6.º LIVA (viajes, hostelería y restauración). Una comida con clientes es una atención a clientes (5.º), que no la tiene. Además, el IVA no deducible eleva el gasto a 330 €.',
          },
          { id: 'b', text: 'IS: 330 € deducibles (base más IVA no deducible). IVA: no deducible.' },
          {
            id: 'c',
            text: 'IS: no deducible, por ser una liberalidad. IVA: no deducible.',
            feedback: 'El art. 15.e LIS excluye expresamente las atenciones a clientes del concepto de liberalidad: son deducibles hasta el 1 % del INCN.',
          },
          {
            id: 'd',
            text: 'IS e IVA: deducibles al 50 %, como cualquier gasto mixto.',
            feedback: 'No hay ninguna regla del 50 % para las comidas. La presunción del 50 % es la del IVA de los turismos (art. 95.Tres.2.ª LIVA) y no existe en el IS.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Las atenciones a clientes no son liberalidades y se deducen en el IS hasta el 1 % del INCN (art. 15.e LIS). Su IVA no se deduce en ninguna proporción (art. 96.Uno.5.º LIVA) y, como IVA no deducible, se suma al coste del servicio (PGC, norma 12.ª): el gasto deducible es de 330 €.',
        ref: 'Apartado «IVA: afectación, exclusiones y factura»',
      },
      {
        id: 'fis-03-q2',
        prompt:
          'Una SL compra un turismo que su administrador usa para visitar clientes entre semana y para fines personales los fines de semana. No se ha pactado retribución en especie. ¿Qué afirmación es correcta?',
        options: [
          {
            id: 'a',
            text: 'En el IVA puede deducir el 100 %, porque el coche figura en la contabilidad de la sociedad.',
            feedback: 'La regla 4.ª del art. 95.Tres LIVA dice que la contabilización no es prueba suficiente del grado de uso. El 100 % solo se presume en vehículos tasados, como los mixtos para transporte de mercancías.',
          },
          {
            id: 'b',
            text: 'En el IS se aplica la misma presunción del 50 %, así que la mitad del gasto es deducible sin más prueba.',
            feedback: 'La LIS no contiene ninguna presunción del 50 %: en el IS se deduce lo que se acredite vinculado a la actividad.',
          },
          {
            id: 'c',
            text: 'En el IS todo el gasto es deducible, porque el art. 15 LIS no menciona los vehículos.',
            feedback: 'Que el art. 15 no cite los vehículos no los hace deducibles: rigen la correlación y la prueba, y la parte privada no instrumentada como retribución no es deducible.',
          },
          {
            id: 'd',
            text: 'En el IVA puede deducir, en principio, el 50 % si acredita algún uso en la actividad; un porcentaje mayor tendría que probarlo la sociedad, y uno menor, Hacienda.',
          },
        ],
        correctOptionId: 'd',
        explanation:
          'El art. 95.Tres.2.ª LIVA presume afectos al 50 % los turismos, y la regla 3.ª obliga a regularizar si se acredita otro grado de uso. El Manual práctico de IVA 2026 de la AEAT precisa que antes hay que probar algún uso empresarial y que el uso mayor lo prueba el contribuyente, y el menor, la Administración.',
        ref: 'Apartado «Coches, portátiles y móviles de uso mixto»',
      },
      {
        id: 'fis-03-q3',
        prompt:
          'En 2026 una sociedad tiene un INCN de 250.000 € y ha contabilizado 3.400 € de atenciones a clientes (comidas y regalos, con el IVA no deducible incluido). ¿Qué ajuste debe hacer en el IS?',
        options: [
          { id: 'a', text: 'Un ajuste positivo de 900 €.' },
          {
            id: 'b',
            text: 'Ninguno: las atenciones a clientes son deducibles sin límite.',
            feedback: 'El art. 15.e LIS fija expresamente el límite del 1 % del INCN del período impositivo.',
          },
          {
            id: 'c',
            text: 'Un ajuste positivo de 3.400 €, porque las atenciones a clientes son liberalidades.',
            feedback: 'Las atenciones a clientes no son liberalidades; solo el exceso sobre el límite deja de ser deducible.',
          },
          {
            id: 'd',
            text: 'Un ajuste positivo de 2.500 €.',
            feedback: '2.500 € es el límite, es decir, lo que sí se deduce. Ajustar esa cifra dejaría sin deducir 1.600 € que son deducibles.',
          },
        ],
        correctOptionId: 'a',
        explanation:
          'El límite es el 1 % del INCN del ejercicio: 250.000 × 1 % = 2.500 €. El exceso, 3.400 − 2.500 = 900 €, no es deducible y se corrige con un ajuste positivo (art. 15.e LIS).',
        ref: 'Apartado «Las cuatro condiciones del gasto en el IS» y caso práctico',
      },
    ],
  },
  documentIds: ['doc-iva-vehiculos'],
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-lluis-gomez',
    publishedAt: '2026-10-15T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: '2026-10-28',
};

/** Banco de 4 preguntas adicionales (dificultad media) para «Pon a prueba tus conocimientos». */
export const bank: QuizQuestion[] = [
  {
    id: 'fis-03-b1',
    prompt:
      'El CTO de una startup, socio y empleado, usa el portátil de la empresa (1.200 € más IVA, factura a nombre de la sociedad) para trabajar y, de forma habitual, para uso familiar. No se ha pactado ninguna retribución en especie. ¿Puede la sociedad deducir el IVA soportado?',
    options: [
      {
        id: 'a',
        text: 'Sí, el 50 %, por analogía con la presunción de los turismos.',
        feedback: 'La presunción del 50 % se limita a turismos, remolques, ciclomotores y motocicletas (art. 95.Tres.2.ª LIVA) y no se extiende por analogía.',
      },
      {
        id: 'b',
        text: 'Sí, el 100 %, porque la factura está a nombre de la sociedad.',
        feedback: 'La factura a nombre de la sociedad es necesaria, pero no suficiente: también hace falta la afectación directa y exclusiva.',
      },
      {
        id: 'c',
        text: 'No: al usarse también para fines privados no está afecto y, como no es un bien de inversión, no cabe una deducción parcial.',
      },
      {
        id: 'd',
        text: 'Sí, en proporción a las horas de uso profesional.',
        feedback: 'La deducción proporcional al uso solo existe para los bienes de inversión (art. 95.Tres.1.ª LIVA), y un bien de menos de 3.005,06 € no lo es.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Los bienes que se usan a la vez para la actividad y para necesidades privadas no se consideran afectos (art. 95.Dos.2.º LIVA). La deducción parcial solo se admite para los bienes de inversión (art. 95.Tres), y no lo son los de valor inferior a 3.005,06 € (art. 108.Dos.5.º). El Manual práctico de IVA 2026 de la AEAT lo ilustra con un ordenador de 1.000 € de uso mixto: no se deduce nada.',
    ref: 'Apartado «Coches, portátiles y móviles de uso mixto»',
  },
  {
    id: 'fis-03-b2',
    prompt:
      'Una consultora paga el hotel y las cenas de una empleada que viaja a Sevilla para reunirse con un cliente. Las facturas están a nombre de la sociedad, con su NIF y el IVA desglosado. ¿Qué ocurre con ese IVA?',
    options: [
      {
        id: 'a',
        text: 'No es deducible, porque el IVA de la hostelería y la restauración nunca se deduce.',
        feedback: 'El art. 96.Uno.6.º LIVA exceptúa los viajes, la hostelería y la restauración cuando el gasto es fiscalmente deducible en el IS o en el IRPF.',
      },
      { id: 'b', text: 'Es deducible, porque el gasto del viaje es deducible en el IS de la sociedad.' },
      {
        id: 'c',
        text: 'No es deducible, porque las cenas son atenciones a asalariados.',
        feedback: 'Las comidas de una empleada durante un viaje de trabajo son un gasto de desplazamiento de la actividad, no una atención a la plantilla como la cena de Navidad.',
      },
      {
        id: 'd',
        text: 'Solo es deducible el 50 %, como en los turismos.',
        feedback: 'La presunción del 50 % es exclusiva de los vehículos del art. 95.Tres.2.ª LIVA.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'El art. 96.Uno.6.º LIVA excluye el IVA de los viajes, la hostelería y la restauración salvo que el gasto sea fiscalmente deducible en el IS o en el IRPF. Un viaje para atender a un cliente está correlacionado con los ingresos y es deducible en el IS; con factura a nombre de la sociedad (art. 97 LIVA), su IVA se deduce.',
    ref: 'Apartado «IVA: afectación, exclusiones y factura»',
  },
  {
    id: 'fis-03-b3',
    prompt:
      'Una empleada compra material de oficina para la sociedad y solo pide el tique, sin el NIF ni el domicilio de la empresa: 60,50 €, IVA del 21 % incluido (50,00 € de base y 10,50 € de cuota). ¿Qué es correcto?',
    options: [
      {
        id: 'a',
        text: 'El IVA de 10,50 € es deducible, porque el material se usa solo en la actividad.',
        feedback: 'La afectación es necesaria, pero no suple el requisito formal: sin una factura que cumpla los requisitos reglamentarios no se puede deducir el IVA (art. 97 LIVA).',
      },
      {
        id: 'b',
        text: 'Ni el IVA ni el gasto son deducibles, porque la factura es el único medio de prueba.',
        feedback: 'En el IS la factura es el medio de prueba prioritario, pero no el único (art. 106.4 LGT).',
      },
      {
        id: 'c',
        text: 'El gasto y el IVA son deducibles, porque el pago con la tarjeta de la empresa sustituye a la factura.',
        feedback: 'El cargo en la tarjeta puede servir para acreditar el gasto en el IS, pero no justifica la deducción del IVA, que exige factura (art. 97 LIVA).',
      },
      {
        id: 'd',
        text: 'El IVA no es deducible con ese documento: hacía falta una factura con el NIF y el domicilio de la sociedad y la cuota separada. En el IS, el gasto puede deducirse si se acredita por otros medios.',
      },
    ],
    correctOptionId: 'd',
    explanation:
      'Solo justifica la deducción del IVA la factura que cumple los requisitos reglamentarios (art. 97 LIVA); una factura simplificada sirve si incluye el NIF y el domicilio del destinatario y la cuota por separado (art. 7.2 del Reglamento de facturación). En el IS, la factura es prueba prioritaria, pero no exclusiva (art. 106.4 LGT).',
    ref: 'Apartado «IVA: afectación, exclusiones y factura»',
  },
  {
    id: 'fis-03-b4',
    prompt:
      'Una asesoría factura a una sociedad en diciembre de 2025 un servicio prestado ese mes, pero la sociedad lo contabiliza por error en marzo de 2026. Tributa al tipo general del 25 % en ambos ejercicios y tiene base imponible positiva en los dos. ¿En qué ejercicio es deducible el gasto?',
    options: [
      { id: 'a', text: 'En 2026, ejercicio en que se contabiliza, siempre que de ello no se derive una tributación inferior a la que habría correspondido imputándolo en 2025.' },
      {
        id: 'b',
        text: 'Solo en 2025; en 2026, nunca.',
        feedback: 'El art. 11.3.1.º LIS admite expresamente la imputación en el ejercicio de la contabilización, con esa condición.',
      },
      {
        id: 'c',
        text: 'En ninguno, porque no se contabilizó en el ejercicio de su devengo.',
        feedback: 'El error de imputación no hace perder la deducción; solo la condiciona.',
      },
      {
        id: 'd',
        text: 'En el ejercicio que elija la sociedad, sin condiciones.',
        feedback: 'No hay libre elección: rige el devengo (art. 11.1 LIS), y la excepción tiene una condición.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'El art. 11.3.1.º LIS permite imputar el gasto en el período en que se contabiliza, aunque sea posterior al de su devengo, siempre que de ello no resulte una tributación inferior. Con el mismo tipo y bases positivas en ambos ejercicios, retrasar la deducción no reduce la tributación.',
    ref: 'Apartado «Las cuatro condiciones del gasto en el IS»',
  },
];

import type { Formation, QuizQuestion } from '@flm/shared';

/* Textos consolidados del BOE (artículos y anclas comprobados el 28/10/2026; vigencia de la LSC, el TRLC
 * y el art. 30 del RDL 7/2026 revisada de nuevo el 29/10/2026). */
const LSC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544';
const TRLC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-4859';
const ET = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430';
const AGENCIA = 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-12347';
const RDL_7_1996 = 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-13002';
const ICAC_2019 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-3422';
const RDL_7_2026 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-6544';
const RDL_1_2025 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-1560';
const CONSULTA = '2026-10-28';

export const formation: Formation = {
  id: 'mer-01',
  slug: 'cuando-derivar-a-mercantil',
  area: 'mercantil',
  title: 'Cuándo derivar un cliente a Mercantil: señales, urgencia y cómo hacerlo',
  intro:
    'Una clienta de Laboral comenta, de pasada, que su socio quiere jubilarse y vender su parte. Para la nómina es un detalle; para la sociedad es una transmisión de participaciones que, si no respeta la ley o los estatutos, no producirá efecto alguno frente a ella. Esta formación te enseña a reconocer esas frases y a llevarlas a Mercantil a tiempo y con lo necesario.',
  summary:
    'Qué frases de clientes de Fiscal, Laboral y Contabilidad piden a Mercantil, por qué, qué plazos marcan la urgencia y cómo derivar con lo necesario.',
  coverTerm: '¿A Mercantil?',
  readingMinutes: 12,
  outcomes: [
    'Identificar en una conversación de Fiscal, Laboral o Contabilidad las señales que piden a Mercantil y explicar por qué cada una es un asunto mercantil.',
    'Calcular, con el balance que ya tienes, si hay una posible causa de disolución por pérdidas y cómo cambia el control de la sociedad tras una operación.',
    'Decidir la urgencia de la derivación y preparar un mensaje con cliente, situación, urgencia, documentos y una pregunta concreta.',
  ],
  blocks: [
    /* 1 · Qué es mercantil */
    { type: 'heading', text: 'Qué convierte una conversación en un asunto mercantil', id: 'que-es-mercantil' },
    {
      type: 'paragraph',
      text: 'Un asunto es mercantil cuando cambia **quién es dueño de la sociedad, quién decide, quién responde o si la empresa puede seguir**. El cliente casi nunca lo plantea así: lo dice de pasada en una reunión de nóminas, de impuestos o de cierre. Para no dejarlo escapar, el área Mercantil presentó en el Desayuno Mercantil del 23 de octubre el [[Radar Mercantil]]: diez señales para llamar a Mercantil.',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Entra o sale un socio',
        'Cambia el administrador o los cargos',
        'Relevo generacional en la empresa familiar',
        'Compra, venta o fusión de un negocio',
        'Ampliación de capital o entrada de un inversor',
        'Tensión o desacuerdo entre socios',
        'Cuentas sin depositar o libros sin legalizar',
        'Firma de un contrato relevante',
        'Nueva sociedad, filial o salto internacional',
        'Herencia o donación de participaciones',
      ],
    },
    {
      type: 'paragraph',
      text: 'A esas diez, súmales dos que el Radar no enumera y que no admiten espera: un patrimonio neto por debajo de la mitad del capital social y una sociedad que ya no puede pagar con regularidad. Las dos activan plazos legales de dos meses.',
    },
    {
      type: 'paragraph',
      text: 'Muchas de estas señales acaban en un acuerdo de la [[junta general]], y prepararlo a tiempo y con la mayoría correcta es trabajo de Mercantil.',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'junta general',
      text: `Es el órgano en el que los socios deciden lo que la ley les reserva: aprobar las cuentas, nombrar y separar a los administradores, modificar los estatutos, aumentar o reducir el capital, transformar, fusionar o escindir la sociedad y disolverla. También acuerda la compra, la venta o la aportación a otra sociedad de **activos esenciales**, y se presume que lo son cuando la operación supera el 25 % del valor de los activos del último balance aprobado ([art. 160 LSC](${LSC}#a160)).`,
      refs: [{ label: 'Art. 160 LSC · Competencia de la junta', url: `${LSC}#a160`, date: CONSULTA, kind: 'norma' }],
    },

    /* 2 · Lo que oyes */
    { type: 'heading', text: 'Lo que oyes en Fiscal, Laboral y Contabilidad', id: 'lo-que-oyes' },
    {
      type: 'paragraph',
      text: 'La matriz recoge las frases más habituales, por qué son mercantiles y qué hará el área, según los servicios del Radar y los que FLM publica en [su web](https://flmexperts.com/) («Venta de empresa, sucesión empresarial y concurso de acreedores» y «Contratos comerciales e internacionales»).',
    },
    {
      type: 'widget',
      widget: {
        kind: 'comparativa',
        title: 'Señal → por qué es mercantil → qué hará Mercantil',
        columns: ['Lo que oyes', 'Por qué es mercantil', 'Qué hará Mercantil'],
        rows: [
          {
            label: '«Mi socio quiere jubilarse y vender su parte»',
            values: [
              `Exige documento público y seguir el régimen de los estatutos o de la ley; si no se ajusta a ellos, no produce efecto frente a la sociedad ([arts. 106](${LSC}#a106), [107](${LSC}#a107) y [112 LSC](${LSC}#a112)).`,
              'Revisa estatutos y pactos, prepara la escritura y actualiza el libro registro.',
            ],
          },
          {
            label: '«Entra un inversor» o «vamos a poner dinero»',
            values: [
              `En la S.L., ampliar capital exige acuerdo de la junta por más de la mitad de los votos y respetar la preferencia de los socios ([arts. 199](${LSC}#a199) y [304 LSC](${LSC}#a304)).`,
              'Diseña la operación, el acuerdo y el pacto con el inversor.',
            ],
          },
          {
            label: '«Fichamos a un director general» o «el administrador va a cobrar»',
            values: [
              `Si va a ser administrador, lo nombra la junta, el nombramiento se presenta a inscripción en diez días y solo cobra por el cargo si los estatutos lo prevén ([arts. 214](${LSC}#a214), [215](${LSC}#a215) y [217 LSC](${LSC}#a217)); si no, actuará con poderes de la sociedad.`,
              'Nombramiento, poderes y contrato coordinado con Laboral.',
            ],
          },
          {
            label: '«Queremos pasar el negocio a los hijos»',
            values: [
              `Es libre salvo que los estatutos digan otra cosa, pero exige documento público ([arts. 106](${LSC}#a106) y [107 LSC](${LSC}#a107)).`,
              'Protocolo familiar, donación de participaciones y estatutos adaptados.',
            ],
          },
          {
            label: '«Vamos a vender la empresa» o «compramos otra con su plantilla»',
            values: [
              `Comprar o vender activos esenciales requiere acuerdo de la junta ([art. 160 LSC](${LSC}#a160)), y quien adquiere el negocio (no las participaciones) se subroga en sus relaciones laborales ([art. 44 ET](${ET}#a44)).`,
              'Revisión previa (*due diligence*), contrato de compraventa y garantías.',
            ],
          },
          {
            label: '«Este año no hemos hecho la junta»',
            values: [
              `Las cuentas se aprueban en los seis primeros meses del ejercicio y se depositan en el mes siguiente a su aprobación; sin depósito, el Registro se cierra ([arts. 164](${LSC}#a164), [279](${LSC}#a279) y [282 LSC](${LSC}#a282)).`,
              'Secretaría societaria: juntas, actas y depósito en plazo.',
            ],
          },
          {
            label: '«Estamos bloqueados al 50 %»',
            values: [
              `La paralización de los órganos sociales que impida su funcionamiento es causa de disolución ([art. 363 LSC](${LSC}#a363)).`,
              'Pactos de socios para prevenir y litigios si hace falta.',
            ],
          },
          {
            label: '«Firmamos con un distribuidor o un agente»',
            values: [
              `Algunas reglas son imperativas, como el preaviso y la indemnización por clientela del agente ([arts. 3](${AGENCIA}#a3), [25](${AGENCIA}#a25) y [28 Ley 12/1992](${AGENCIA}#a28)).`,
              'Contratos de distribución, franquicia y proveedores clave.',
            ],
          },
          {
            label: '«No llegamos a pagar la Seguridad Social»',
            values: [
              `Si no puede pagar con regularidad, está en insolvencia actual y debe pedir el concurso en los dos meses siguientes a conocerla ([arts. 2](${TRLC}#a2) y [5 TRLC](${TRLC}#a5)).`,
              'Área concursal: negociación con acreedores, reestructuración o concurso.',
            ],
          },
        ],
      },
    },
    {
      type: 'paragraph',
      text: `Fíjate en la primera fila: el [[régimen de transmisión]] no es un trámite entre comprador y vendedor. Si no se respeta, la venta no produce efecto frente a la sociedad, que solo reputa socio a quien figura en el libro registro ([arts. 104](${LSC}#a104) y [112 LSC](${LSC}#a112)).`,
    },

    /* 3 · Urgencia */
    { type: 'heading', text: 'Urgencia: los plazos que no esperan al cierre', id: 'urgencia' },
    {
      type: 'paragraph',
      text: 'La urgencia la marca la ley, no el cliente: muchos plazos societarios corren en días o meses desde un hecho concreto, no desde el cierre del ejercicio. Si derivas tarde, pueden vencer antes de que Mercantil vea el caso.',
    },
    {
      type: 'table',
      caption: 'Plazos que convierten una señal en urgente',
      columns: ['Situación', 'Plazo', 'Qué hay que hacer'],
      rows: [
        ['El nuevo administrador ya ha aceptado', '10 días desde la aceptación', `Presentar el nombramiento a inscripción ([art. 215 LSC](${LSC}#a215))`],
        ['Ampliación de capital con aportaciones dinerarias', '1 mes como mínimo', `Respetar el [[derecho de preferencia]] de los socios ([arts. 304](${LSC}#a304) y [305 LSC](${LSC}#a305))`],
        ['Patrimonio neto inferior a la mitad del capital', '2 meses', `Convocar la junta para disolver o remover la causa ([arts. 365](${LSC}#a365) y [367 LSC](${LSC}#a367))`],
        ['La sociedad no puede pagar con regularidad', '2 meses desde que conoció o debió conocer la insolvencia', `Solicitar el concurso ([art. 5 TRLC](${TRLC}#a5))`],
        ['Un socio se queda con todas las participaciones', '6 meses', `Inscribir la unipersonalidad; si no, el socio único responde de las deudas de ese periodo ([arts. 13](${LSC}#a13) y [14 LSC](${LSC}#a14))`],
        ['Un socio quiere impugnar un acuerdo', '1 año, por regla general', `Ejercer la acción antes de que caduque ([art. 205 LSC](${LSC}#a205))`],
      ],
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Dos relojes de dos meses',
      text: `Con [[causa de disolución por pérdidas]], los administradores deben convocar la junta en dos meses para disolver o remover la causa; si no, responden solidariamente de las deudas sociales posteriores ([arts. 363](${LSC}#a363), [365](${LSC}#a365) y [367 LSC](${LSC}#a367)). Con [[insolvencia actual]], la sociedad debe solicitar el concurso en los dos meses siguientes a la fecha en que la conoció o debió conocerla ([arts. 2](${TRLC}#a2) y [5 TRLC](${TRLC}#a5)).`,
      refs: [
        { label: 'Arts. 363, 365 y 367 LSC · Disolución por pérdidas', url: `${LSC}#a363`, date: CONSULTA, kind: 'norma' },
        { label: 'Arts. 2 y 5 TRLC · Insolvencia y deber de solicitar el concurso', url: `${TRLC}#a2`, date: CONSULTA, kind: 'norma' },
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Antes de dar por buena la cifra',
      text: `Para este cálculo, los préstamos participativos cuentan como patrimonio neto ([art. 20.Uno.d RDL 7/1996](${RDL_7_1996}#a20); [art. 3.1 Res. ICAC de 5/3/2019](${ICAC_2019}#ar-3)), y hasta el cierre del ejercicio que se inicie en 2026 no computan las pérdidas de 2020 y 2021 ([art. 30 RDL 7/2026](${RDL_7_2026}#a3-2)) ni, en las sociedades afectadas, las de la DANA de 2024 ([art. 2 RDL 1/2025](${RDL_1_2025}#a2)). Cuando se aplican, esas normas cuentan los dos meses desde el cierre del ejercicio; la LSC, desde que concurre la causa. Cómo se combinan lo valora Mercantil: tú no esperes al cierre para derivar.`,
      refs: [
        { label: 'Art. 20 RDL 7/1996 · Préstamos participativos', url: `${RDL_7_1996}#a20`, date: CONSULTA, kind: 'norma' },
        { label: 'Art. 3 Resolución del ICAC de 5 de marzo de 2019 · Patrimonio neto', url: `${ICAC_2019}#ar-3`, date: CONSULTA, kind: 'norma' },
        { label: 'Art. 30 RDL 7/2026 · Pérdidas de 2020 y 2021', url: `${RDL_7_2026}#a3-2`, date: '2026-10-29', kind: 'norma' },
        { label: 'Art. 2 RDL 1/2025 · Pérdidas de la DANA de 2024', url: `${RDL_1_2025}#a2`, date: CONSULTA, kind: 'norma' },
      ],
    },

    /* 4 · Cómo derivar */
    { type: 'heading', text: 'Cómo derivar: detecta, comparte, acompañamos', id: 'como-derivar' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Detecta.** Usa el radar en tus reuniones y llamadas con el cliente.',
        '**Comparte.** Escribe a Mercantil con tres datos: cliente, situación y urgencia.',
        '**Acompañamos.** Mercantil responde y, si hace falta, va contigo a la reunión con el cliente.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Son los tres pasos del Radar. El canal y el plazo de respuesta aún figuran en él como pendientes de definir («[ email / Teams ]» y «[ 48 h ]»): hasta que FLM los fije, pregunta al área cómo prefiere recibir cada caso.',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Propuesta pendiente de validar por FLM',
      text: 'Las urgencias, los documentos y el mensaje modelo que siguen son una propuesta de esta formación; todavía no son un procedimiento aprobado por la firma.',
    },
    {
      type: 'paragraph',
      text: '**Urgencia propuesta.** Alta, el mismo día: posible causa de disolución, impagos o embargos, administrador aceptado sin inscribir, acuerdo que alguien quiere impugnar o firma inminente. Media, en la semana: operaciones sin fecha, cambios de cargos previstos o contratos por firmar. Programada: pactos de socios sin conflicto, protocolos familiares o revisiones de estatutos.',
    },
    { type: 'paragraph', text: 'Antes de escribir, reúne:' },
    {
      type: 'list',
      items: [
        '**Siempre:** denominación y NIF, interlocutor, estatutos, información registral actualizada, reparto del capital, pactos o protocolo familiar y últimas cuentas depositadas.',
        '**Pérdidas o impagos:** balance reciente, préstamos de socios, deudas con la AEAT y la Seguridad Social, embargos y previsión de tesorería.',
        '**Operaciones y cargos:** oferta o borradores, calendario, plantilla afectada y fecha de aceptación del nuevo administrador.',
      ],
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Qué no hacer',
      text: 'No prometas soluciones, precios ni plazos; no valores participaciones, no redactes documentos societarios ni pidas al cliente que firme nada «provisional». Tu papel es que Mercantil llegue a tiempo.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'arbol-decision',
        title: '¿Derivo a Mercantil?',
        start: 'pagos',
        nodes: [
          {
            id: 'pagos',
            question: '¿Ha dejado de pagar con regularidad o tiene embargos?',
            options: [
              { label: 'Sí', next: 'fin-concurso' },
              { label: 'No', next: 'balance' },
            ],
          },
          {
            id: 'balance',
            question: '¿Su patrimonio neto es inferior a la mitad del capital?',
            options: [
              { label: 'Sí', next: 'fin-disolucion' },
              { label: 'No', next: 'dueno' },
              { label: 'No lo sé', next: 'fin-balance' },
            ],
          },
          {
            id: 'dueno',
            question: '¿Cambia quién es dueño (socios, inversores, ventas, donaciones o herencias de participaciones)?',
            options: [
              { label: 'Sí', next: 'fecha' },
              { label: 'No', next: 'decide' },
            ],
          },
          {
            id: 'fecha',
            question: '¿Hay oferta, fecha de firma o algo firmado?',
            options: [
              { label: 'Sí', next: 'fin-hoy-operacion' },
              { label: 'No', next: 'fin-semana' },
            ],
          },
          {
            id: 'decide',
            question: '¿Cambia quién decide o quién responde (administradores, retribución, junta pendiente, conflicto)?',
            options: [
              { label: 'Sí', next: 'plazo' },
              { label: 'No', next: 'operacion' },
            ],
          },
          {
            id: 'plazo',
            question: '¿El administrador ya ha aceptado o alguien quiere impugnar un acuerdo?',
            options: [
              { label: 'Sí', next: 'fin-hoy-plazo' },
              { label: 'No', next: 'fin-semana' },
            ],
          },
          {
            id: 'operacion',
            question: '¿Hay otra operación o documento mercantil (nueva sociedad, fusión, contrato relevante, cuentas sin depositar)?',
            options: [
              { label: 'Sí', next: 'fin-antes-firmar' },
              { label: 'No', next: 'fin-resolver' },
            ],
          },
          {
            id: 'fin-concurso',
            outcome: {
              title: 'Deriva hoy al área concursal',
              text: `El concurso debe pedirse en los dos meses siguientes a conocer, o deber conocer, la insolvencia actual ([art. 5 TRLC](${TRLC}#a5)).`,
              tone: 'derivar',
            },
          },
          {
            id: 'fin-disolucion',
            outcome: {
              title: 'Deriva hoy: posible causa de disolución',
              text: `Junta en dos meses o los administradores responden de las deudas posteriores ([art. 367 LSC](${LSC}#a367)).`,
              tone: 'derivar',
            },
          },
          {
            id: 'fin-balance',
            outcome: {
              title: 'Pide el balance y vuelve a empezar',
              text: 'Si hay pérdidas fuertes y hoy no puedes confirmarlo, deriva igualmente y dilo.',
              tone: 'atencion',
            },
          },
          {
            id: 'fin-hoy-operacion',
            outcome: {
              title: 'Deriva hoy: hay fecha a la vista',
              text: `Documento público, régimen de transmisión y preferencia no se improvisan ([arts. 106](${LSC}#a106), [107](${LSC}#a107) y [304 LSC](${LSC}#a304)).`,
              tone: 'derivar',
            },
          },
          {
            id: 'fin-hoy-plazo',
            outcome: {
              title: 'Deriva hoy: el plazo ya corre',
              text: `Diez días para presentar el nombramiento a inscripción ([art. 215 LSC](${LSC}#a215)); por regla general, un año para impugnar ([art. 205 LSC](${LSC}#a205)).`,
              tone: 'derivar',
            },
          },
          {
            id: 'fin-semana',
            outcome: {
              title: 'Deriva esta semana',
              text: 'Urgencia media: que Mercantil lo revise antes de que el cliente se comprometa.',
              tone: 'derivar',
            },
          },
          {
            id: 'fin-antes-firmar',
            outcome: {
              title: 'Deriva antes de firmar',
              text: 'Urgencia media; alta si la firma es inminente.',
              tone: 'derivar',
            },
          },
          {
            id: 'fin-resolver',
            outcome: {
              title: 'Sigue en tu área, con el radar encendido',
              text: 'Anótalo en la ficha del cliente y vuelve a pasar el radar en la próxima reunión.',
              tone: 'resolver',
            },
          },
        ],
      },
      caption: 'Las urgencias siguen la propuesta pendiente de validar por FLM.',
    },

    /* 5 · Caso práctico */
    { type: 'heading', text: 'Caso práctico: una frase, cuatro señales', id: 'caso-practico' },
    {
      type: 'paragraph',
      text: 'Así se aplica en una reunión corriente de Contabilidad. Sociedad y personas son ficticias; los cálculos, exactos.',
    },
    {
      type: 'example',
      title: 'Distribuciones Garbí, S.L.: una frase, cuatro señales',
      scenario:
        'Distribuciones Garbí, S.L. tiene 30.000 € de capital en 3.000 participaciones de 10 €: Marta, 1.500 (50 %); Jordi, 900 (30 %), y Pau, 600 (20 %). Marta y Pau son administradores solidarios. Balance a 30 de septiembre de 2026: reservas de 3.000 €, pérdidas de 2025 de 6.000 € y pérdidas de 2026 de 15.000 €. No hay préstamos participativos, pérdidas de 2020 o 2021 ni otros ajustes, y la sociedad paga con normalidad. Marta comenta: «Pau quiere salir de la sociedad y le compraré su parte. Y pondré 40.000 € para la nave nueva».',
      steps: [
        {
          label: 'Pasa el radar por la frase de Marta.',
          formula: 'Sale un socio (señal 1) + se va un administrador (señal 2) + entra dinero (señal 5)',
          result: 'Tres señales del Radar en una sola frase.',
        },
        {
          label: 'Mira el balance que ya tienes.',
          formula: 'PN = 30.000 + 3.000 − 6.000 − 15.000 = 12.000 € · mitad del capital = 0,5 × 30.000 = 15.000 €',
          result: '12.000 € < 15.000 €: posible causa de disolución, la señal que nadie había nombrado.',
        },
        {
          label: 'Calcula quién manda si Marta compra las participaciones de Pau.',
          formula: 'Marta = (1.500 + 600) / 3.000 = 70 % · Jordi = 900 / 3.000 = 30 %',
          result: 'Con las mayorías legales (art. 199 LSC), Marta decidiría sola ampliaciones, cambios de estatutos y fusiones, salvo que los estatutos exijan más.',
        },
        {
          label: 'Mira qué pasa si los 40.000 € entran como ampliación a la par y Jordi no ejerce su [[derecho de preferencia]].',
          formula: '40.000 / 10 = 4.000 participaciones nuevas · Marta = (2.100 + 4.000) / 7.000 = 87,14 % · Jordi = 900 / 7.000 = 12,86 %',
          result: 'Jordi conservaría su 30 % asumiendo 1.200 participaciones (12.000 €): cómo entra el dinero cambia quién manda.',
        },
        {
          label: 'Comprueba si esa ampliación eliminaría la causa de disolución.',
          formula: 'PN = 12.000 + 40.000 = 52.000 € · mitad del capital = 0,5 × 70.000 = 35.000 €',
          result: '52.000 € ≥ 35.000 €: la causa desaparecería. Un préstamo ordinario, en cambio, no aumentaría el patrimonio neto.',
        },
        {
          label: 'Clasifica la urgencia y escribe hoy a Mercantil.',
          formula: 'Cliente + situación + urgencia + documentos + pregunta',
          result:
            '«Distribuciones Garbí, S.L. (Contabilidad). Urgencia alta. A 30/09/2026, patrimonio neto de 12.000 € frente a 15.000 €. Sale Pau (20 %, administrador) y Marta le comprará; Marta aportará 40.000 €. Adjunto estatutos, información registral, libro registro, cuentas de 2025 y balance. ¿Qué vía y qué orden recomendáis?»',
        },
      ],
      conclusion:
        'El radar encontró cuatro señales, y la más urgente era la que nadie mencionó. Mercantil fijará con un balance cerrado desde cuándo corren los dos meses para convocar la junta, ordenará las operaciones y coordinará con Fiscal la venta de Pau y con Contabilidad el registro de la aportación.',
    },
  ],
  keyTerms: [
    {
      term: 'Radar Mercantil',
      definition:
        'Presentación del área Mercantil de FLM (Desayuno Mercantil del 23 de octubre de 2026) con diez señales que indican que hay que llamar a Mercantil y tres pasos para derivar.',
    },
    {
      term: 'junta general',
      definition: `Órgano en el que los socios acuerdan lo que la ley o los estatutos les reservan: cuentas, administradores, estatutos, capital, modificaciones estructurales, activos esenciales y disolución ([art. 160 LSC](${LSC}#a160)).`,
    },
    {
      term: 'régimen de transmisión',
      definition: `Reglas para transmitir participaciones: las de los estatutos o, en su defecto, las legales (libre entre socios y a favor del cónyuge, ascendientes, descendientes o sociedades del grupo; en los demás casos, con consentimiento de la junta). Si no se respetan, la transmisión no produce efecto frente a la sociedad ([arts. 107](${LSC}#a107) y [112 LSC](${LSC}#a112)).`,
    },
    {
      term: 'derecho de preferencia',
      definition: `Derecho de cada socio a asumir, en un aumento de capital con aportaciones dinerarias, participaciones en proporción al valor nominal de las que ya tiene, en un plazo no inferior a un mes ([arts. 304](${LSC}#a304) y [305 LSC](${LSC}#a305)).`,
    },
    {
      term: 'causa de disolución por pérdidas',
      definition: `Pérdidas que dejan el patrimonio neto por debajo de la mitad del capital social, salvo que este se aumente o se reduzca lo suficiente y siempre que no proceda el concurso ([art. 363.1.e LSC](${LSC}#a363)).`,
    },
    {
      term: 'insolvencia actual',
      definition: `Estado del deudor que no puede cumplir regularmente sus obligaciones exigibles ([art. 2.3 TRLC](${TRLC}#a2)); obliga a solicitar el concurso en dos meses ([art. 5.1 TRLC](${TRLC}#a5)).`,
    },
  ],
  takeaway:
    'Cuando el cliente hable de quién es dueño, quién decide, quién responde o si la empresa puede seguir, piensa en Mercantil y deriva ese mismo día con cliente, situación, urgencia y documentos. Muchos plazos societarios corren en días o meses desde un hecho concreto: no esperes al cierre.',
  sources: [
    {
      label: 'Real Decreto Legislativo 1/2010, de 2 de julio, texto refundido de la Ley de Sociedades de Capital (texto consolidado)',
      url: LSC,
      date: '2026-10-29',
      kind: 'norma',
    },
    {
      label: 'Real Decreto Legislativo 1/2020, de 5 de mayo, texto refundido de la Ley Concursal (texto consolidado)',
      url: TRLC,
      date: '2026-10-29',
      kind: 'norma',
    },
    {
      label: 'Real Decreto-ley 7/2026, de 20 de marzo, art. 30: suspensión de la causa de disolución por pérdidas',
      url: `${RDL_7_2026}#a3-2`,
      date: '2026-10-29',
      kind: 'norma',
    },
    {
      label: 'Real Decreto-ley 1/2025, de 28 de enero, art. 2: pérdidas derivadas de la DANA de 2024',
      url: `${RDL_1_2025}#a2`,
      date: CONSULTA,
      kind: 'norma',
    },
    {
      label: 'Real Decreto-ley 7/1996, de 7 de junio, art. 20: préstamos participativos',
      url: `${RDL_7_1996}#a20`,
      date: CONSULTA,
      kind: 'norma',
    },
    {
      label: 'Resolución del ICAC de 5 de marzo de 2019, art. 3: patrimonio neto a efectos de disolución',
      url: `${ICAC_2019}#ar-3`,
      date: CONSULTA,
      kind: 'norma',
    },
    {
      label: 'Real Decreto Legislativo 2/2015, de 23 de octubre, Estatuto de los Trabajadores, arts. 1 y 44',
      url: `${ET}#a44`,
      date: CONSULTA,
      kind: 'norma',
    },
    {
      label: 'Ley 12/1992, de 27 de mayo, sobre Contrato de Agencia, arts. 3, 25 y 28',
      url: `${AGENCIA}#a25`,
      date: CONSULTA,
      kind: 'norma',
    },
    {
      label: 'FLM · Áreas de servicio publicadas en la web corporativa',
      url: 'https://flmexperts.com/',
      date: CONSULTA,
      kind: 'web',
    },
  ],
  quiz: {
    id: 'mer-01-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'mer-01-q1',
        prompt:
          'En la reunión trimestral de una S.L. cliente de Contabilidad, la gerente comenta: «Pau, que tiene el 20 %, vende sus participaciones a un inversor que no es socio; ya han firmado un documento privado». Los estatutos no regulan las transmisiones. ¿Qué haces?',
        options: [
          {
            id: 'a',
            text: 'Nada: es una operación entre particulares y Contabilidad la registrará cuando llegue la documentación.',
            feedback: `Sí afecta a la sociedad: cambia quién es socio, y la sociedad solo reputa socio a quien figura en su libro registro ([art. 104 LSC](${LSC}#a104)). Una transmisión defectuosa abre un conflicto sobre quién vota y quién cobra los dividendos.`,
          },
          {
            id: 'b',
            text: 'Anotar al inversor en el libro registro de socios con una copia del documento privado.',
            feedback: `Sería anotar una transmisión que no cumple la forma ni el procedimiento legal y que, por eso, no produce efecto alguno frente a la sociedad ([art. 112 LSC](${LSC}#a112)).`,
          },
          {
            id: 'c',
            text: 'Derivar a Mercantil: la venta a un tercero exige comunicarla por escrito a los administradores y el consentimiento de la junta, debe constar en documento público y, si no se ajusta a la ley, no produce efecto frente a la sociedad.',
          },
          {
            id: 'd',
            text: 'Pedir al cliente que presente el documento privado en el Registro Mercantil para que lo inscriba.',
            feedback: `No arregla nada: la transmisión debe constar en documento público ([art. 106.1 LSC](${LSC}#a106)) y seguir el procedimiento del [art. 107](${LSC}#a107), y la titularidad se refleja en el libro registro de socios de la propia sociedad.`,
          },
        ],
        correctOptionId: 'c',
        explanation: `Sin reglas estatutarias, la transmisión a un tercero exige comunicarla por escrito a los administradores y el consentimiento de la junta, que solo puede denegarlo comunicando quién adquirirá las participaciones ([art. 107.2 LSC](${LSC}#a107)). Además, debe constar en documento público ([art. 106.1](${LSC}#a106)) y, si no se ajusta a la ley o a los estatutos, no produce efecto alguno frente a la sociedad ([art. 112](${LSC}#a112)).`,
        ref: 'Apartado «Lo que oyes en Fiscal, Laboral y Contabilidad» · arts. 106, 107 y 112 LSC',
      },
      {
        id: 'mer-01-q2',
        prompt:
          'Contabilidad revisa el balance trimestral de una S.L.: capital social, 60.000 €; patrimonio neto, 26.000 €. No hay préstamos participativos ni pérdidas excluidas por normas temporales (como las de 2020 y 2021), y la sociedad paga con normalidad. ¿Qué es correcto?',
        options: [
          {
            id: 'a',
            text: 'Hay una posible causa de disolución, porque 26.000 € es menos de la mitad del capital (30.000 €): deriva hoy a Mercantil, ya que los administradores deben convocar la junta en dos meses y, si no lo hacen, responden de las deudas posteriores.',
          },
          {
            id: 'b',
            text: 'No hay ninguna señal: el patrimonio neto sigue siendo positivo.',
            feedback: `La ley no compara el patrimonio neto con cero, sino con la mitad del capital social ([art. 363.1.e LSC](${LSC}#a363)): 26.000 € es menos que 30.000 €.`,
          },
          {
            id: 'c',
            text: 'No hay causa de disolución: basta con que el patrimonio neto supere el 25 % del capital.',
            feedback: `El umbral legal es la mitad del capital (30.000 €), no una cuarta parte ([art. 363.1.e LSC](${LSC}#a363)).`,
          },
          {
            id: 'd',
            text: 'La sociedad debe disolverse sin remedio: ya no cabe aumentar ni reducir el capital.',
            feedback: `La causa puede removerse: si consta en el orden del día, la junta puede acordar las medidas necesarias, como aumentar o reducir el capital en la medida suficiente ([arts. 363.1.e](${LSC}#a363) y [365.2 LSC](${LSC}#a365)).`,
          },
        ],
        correctOptionId: 'a',
        explanation: `Las pérdidas han dejado el patrimonio neto (26.000 €) por debajo de la mitad del capital (30.000 €): es la causa de disolución del [art. 363.1.e LSC](${LSC}#a363), salvo que se remueva o proceda el concurso. Los administradores deben convocar la junta en dos meses ([art. 365.1](${LSC}#a365)) y, si no lo hacen, responden solidariamente de las obligaciones sociales posteriores ([art. 367](${LSC}#a367)). Es una derivación de urgencia alta.`,
        ref: 'Apartado «Urgencia: los plazos que no esperan al cierre» · arts. 363, 365 y 367 LSC',
      },
      {
        id: 'mer-01-q3',
        prompt:
          'En una reunión de Laboral, el gerente de una S.L. cuenta que llevan cuatro meses sin pagar las cuotas de la Seguridad Social, que Hacienda les ha embargado una cuenta y que «ya lo arreglarán cuando cierren el año». ¿Qué es lo más adecuado?',
        options: [
          {
            id: 'a',
            text: 'Esperar al cierre del ejercicio para ver si hay pérdidas que obliguen a disolver.',
            feedback: `La insolvencia depende de la capacidad de pago, no del resultado de fin de año, y el plazo de dos meses para pedir el concurso no espera al cierre ([art. 5.1 TRLC](${TRLC}#a5)).`,
          },
          {
            id: 'b',
            text: 'Proponer que la próxima junta ordinaria acuerde la disolución de la sociedad.',
            feedback: `Ignora el plazo de dos meses, y la disolución por pérdidas solo opera si no procede solicitar el concurso ([art. 363.1.e LSC](${LSC}#a363)); con insolvencia, el camino es el concurso o la comunicación de negociaciones con los acreedores.`,
          },
          {
            id: 'c',
            text: 'Gestionar solo un aplazamiento con la Seguridad Social, porque el concurso únicamente pueden pedirlo los acreedores.',
            feedback: `El propio deudor está obligado a solicitar su concurso ([art. 5.1 TRLC](${TRLC}#a5)) y, si incumple ese deber, el concurso se presume culpable, salvo prueba en contrario ([art. 444 TRLC](${TRLC}#a4-56)).`,
          },
          {
            id: 'd',
            text: 'Derivar hoy mismo a Mercantil (área concursal) con urgencia alta: puede haber insolvencia actual, y el deber de pedir el concurso vence a los dos meses de conocerla.',
          },
        ],
        correctOptionId: 'd',
        explanation: `Quien no puede cumplir regularmente sus obligaciones exigibles está en insolvencia actual ([art. 2.3 TRLC](${TRLC}#a2)) y debe solicitar el concurso en los dos meses siguientes a la fecha en que la conoció o debió conocerla ([art. 5.1](${TRLC}#a5)). El impago generalizado de las cuotas de la Seguridad Social durante los tres meses anteriores es uno de los hechos del art. 2.4.5.º, y hace presumir que el deudor conoce su insolvencia ([art. 5.2](${TRLC}#a5)).`,
        ref: 'Apartado «Urgencia: los plazos que no esperan al cierre» · arts. 2 y 5 TRLC',
      },
    ],
  },
  documentIds: ['doc-radar-mercantil'],
  version: 1,
  verifiedAt: '2026-10-29',
  editorial: {
    status: 'publicado',
    authorId: 'p-judith-calet',
    publishedAt: '2026-10-24T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
};

/** Banco de 4 preguntas adicionales para la evaluación sectorial «Pon a prueba tus conocimientos». */
export const bank: QuizQuestion[] = [
  {
    id: 'mer-01-b1',
    prompt:
      'Los estatutos de una S.L. dicen que el cargo de administrador es gratuito. El administrador único quiere cobrar 3.000 € al mes «como administrador» desde enero, y Contabilidad te pregunta si puede empezar a pagarle. ¿Qué respondes?',
    options: [
      {
        id: 'a',
        text: 'Sí: basta con que lo decida el propio administrador y se refleje en la memoria.',
        feedback: `El administrador no puede fijarse su retribución: el sistema debe estar en los estatutos y el importe máximo anual lo aprueba la junta ([art. 217 LSC](${LSC}#a217)). La memoria informa, no habilita.`,
      },
      {
        id: 'b',
        text: 'Sí, siempre que el importe no supere el salario mínimo interprofesional.',
        feedback: `La LSC no prevé ninguna exención por importe: cualquier retribución por el cargo exige previsión estatutaria ([art. 217.1 LSC](${LSC}#a217)).`,
      },
      {
        id: 'c',
        text: 'No sin pasar por Mercantil: hay que modificar los estatutos para fijar el sistema de remuneración y que la junta apruebe el importe máximo anual; Mercantil lo coordinará con Fiscal y Laboral.',
      },
      {
        id: 'd',
        text: 'Sí, si se le da de alta con un contrato laboral ordinario, porque así queda fuera de la Ley de Sociedades de Capital.',
        feedback: `El mero desempeño del cargo de administrador queda fuera del Estatuto de los Trabajadores ([art. 1.3.c ET](${ET}#a1)) y, en la S.L., cualquier relación de servicios entre la sociedad y un administrador requiere acuerdo de la junta ([art. 220 LSC](${LSC}#a220)).`,
      },
    ],
    correctOptionId: 'c',
    explanation: `El cargo de administrador es gratuito salvo que los estatutos establezcan lo contrario determinando el sistema de remuneración ([art. 217.1 LSC](${LSC}#a217)), y el importe máximo anual del conjunto de los administradores lo aprueba la junta ([art. 217.3](${LSC}#a217)). Modificar los estatutos exige acuerdo de la junta con más de la mitad de los votos ([art. 199 LSC](${LSC}#a199)).`,
    ref: 'Apartado «Lo que oyes en Fiscal, Laboral y Contabilidad» · arts. 217 y 220 LSC',
  },
  {
    id: 'mer-01-b2',
    prompt:
      'En una reunión de Laboral, un cliente cuenta que ayer la junta de su S.L. nombró administrador único a su director comercial, que aceptó el cargo en el acto. Te pregunta si «esto ya está». ¿Qué es correcto?',
    options: [
      {
        id: 'a',
        text: 'Sí: el nombramiento surte efecto desde la aceptación y no hace falta nada más.',
        feedback: `Que surta efecto desde la aceptación ([art. 214.3 LSC](${LSC}#a214)) no exime de inscribirlo: el nombramiento aceptado debe presentarse a inscripción en el Registro Mercantil ([art. 215.1](${LSC}#a215)).`,
      },
      {
        id: 'b',
        text: 'No del todo: el nombramiento debe presentarse a inscripción en el Registro Mercantil en los diez días siguientes a la aceptación, así que derivas hoy a Mercantil.',
      },
      {
        id: 'c',
        text: 'Hay un mes para inscribirlo, el mismo plazo que para depositar las cuentas.',
        feedback: `El mes es el plazo para depositar las cuentas desde su aprobación ([art. 279.1 LSC](${LSC}#a279)); para el nombramiento, la ley da diez días desde la aceptación ([art. 215.2](${LSC}#a215)).`,
      },
      {
        id: 'd',
        text: 'Basta con el alta en la Seguridad Social: el Registro Mercantil actualizará el cargo de oficio.',
        feedback: `El Registro no actúa de oficio: el nombramiento aceptado debe presentarse a inscripción ([art. 215 LSC](${LSC}#a215)). El encuadramiento en la Seguridad Social es otra cuestión, que revisa Laboral.`,
      },
    ],
    correctOptionId: 'b',
    explanation: `El nombramiento surte efecto desde la aceptación ([art. 214.3 LSC](${LSC}#a214)), pero debe presentarse a inscripción en el Registro Mercantil ([art. 215.1](${LSC}#a215)) dentro de los diez días siguientes a la fecha de la aceptación ([art. 215.2](${LSC}#a215)). Como el plazo ya corre, la derivación es urgente.`,
    ref: 'Apartado «Urgencia: los plazos que no esperan al cierre» · arts. 214 y 215 LSC',
  },
  {
    id: 'mer-01-b3',
    prompt:
      'El administrador de una S.L. cliente de Fiscal quiere vender por 420.000 € la nave donde trabaja la empresa. El activo del último balance aprobado suma 1.200.000 €. ¿Qué es correcto?',
    options: [
      {
        id: 'a',
        text: 'Es un acto de gestión del administrador: no necesita a la junta.',
        feedback: `La venta de activos esenciales es competencia de la junta, y aquí se presume ese carácter porque la operación supera el 25 % del activo del último balance aprobado ([art. 160.f LSC](${LSC}#a160)).`,
      },
      {
        id: 'b',
        text: 'Solo necesita a la junta si el precio supera la mitad del activo.',
        feedback: `El umbral de la presunción es el 25 %, no el 50 %: 420.000 / 1.200.000 = 35 % ([art. 160.f LSC](${LSC}#a160)).`,
      },
      {
        id: 'c',
        text: 'Solo haría falta la junta si la nave se aportara a otra sociedad, no si se vende.',
        feedback: `La norma incluye la adquisición, la enajenación y la aportación a otra sociedad de activos esenciales ([art. 160.f LSC](${LSC}#a160)).`,
      },
      {
        id: 'd',
        text: 'Se presume que la nave es un activo esencial, porque 420.000 € son el 35 % del activo (más del 25 %): salvo prueba en contrario, la venta debe aprobarla la junta, y conviene derivar a Mercantil antes de firmar.',
      },
    ],
    correctOptionId: 'd',
    explanation: `Es competencia de la junta la adquisición, la enajenación o la aportación a otra sociedad de activos esenciales, y se presume el carácter esencial cuando el importe de la operación supera el 25 % del valor de los activos del último balance aprobado ([art. 160.f LSC](${LSC}#a160)): 420.000 / 1.200.000 = 35 %.`,
    ref: 'Apartado «Qué convierte una conversación en un asunto mercantil» · art. 160 LSC',
  },
  {
    id: 'mer-01-b4',
    prompt:
      'Un cliente de Fiscal quiere donar parte de sus participaciones de una S.L. a su hija. Los estatutos no regulan las transmisiones. ¿Qué es correcto?',
    options: [
      {
        id: 'a',
        text: 'Es una transmisión libre, porque los estatutos no dicen lo contrario, pero debe constar en documento público y anotarse en el libro registro de socios; deriva a Mercantil para revisar estatutos y pacto de socios y coordinar con Fiscal.',
      },
      {
        id: 'b',
        text: 'Necesita siempre el consentimiento de la junta por mayoría de dos tercios.',
        feedback: `Sin restricción estatutaria, la transmisión a descendientes es libre ([art. 107.1 LSC](${LSC}#a107)); los dos tercios son la mayoría de otras decisiones, como la fusión o la exclusión de socios ([art. 199 LSC](${LSC}#a199)).`,
      },
      {
        id: 'c',
        text: 'Basta con un documento privado firmado por padre e hija.',
        feedback: `La transmisión de participaciones debe constar en documento público ([art. 106.1 LSC](${LSC}#a106)).`,
      },
      {
        id: 'd',
        text: 'Las participaciones de una S.L. no pueden donarse; solo se transmiten por herencia.',
        feedback: `La LSC regula las transmisiones voluntarias por actos inter vivos, también las gratuitas ([art. 107 LSC](${LSC}#a107)), además de las que se producen por causa de muerte.`,
      },
    ],
    correctOptionId: 'a',
    explanation: `Salvo disposición contraria de los estatutos, es libre la transmisión voluntaria por actos inter vivos a favor de descendientes del socio ([art. 107.1 LSC](${LSC}#a107)); debe constar en documento público ([art. 106.1](${LSC}#a106)) y reflejarse en el libro registro de socios ([art. 104](${LSC}#a104)). Fiscal revisará la tributación de la donación.`,
    ref: 'Apartado «Lo que oyes en Fiscal, Laboral y Contabilidad» · arts. 104, 106 y 107 LSC',
  },
];

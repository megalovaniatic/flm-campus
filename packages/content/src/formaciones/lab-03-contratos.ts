import type { Formation, QuizQuestion } from '@flm/shared';

const ET = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430';
const LISOS = 'https://www.boe.es/buscar/act.php?id=BOE-A-2000-15060';
const LGSS = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724';
const ORDEN_COTIZACION = 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-7296';
const SMI_2026 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-3815';
const RD_723 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-19200';
const RD_1065 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-24011';
const PLAN_ITSS = 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-18078';
const VERIFIED = '2026-10-28';

export const formation: Formation = {
  id: 'lab-03',
  slug: 'que-contrato-corresponde',
  area: 'laboral',
  title: 'Qué contrato corresponde tras la reforma laboral',
  intro:
    'Una pastelería con heladería te pide «lo de siempre»: un eventual de seis meses para la temporada de helados y refuerzos para Navidad. Si eliges mal, esas personas pasan a ser fijas y la empresa se expone a una multa de 1.000 a 10.000 € por cada una. Aquí tienes un método para elegir el contrato y documentarlo.',
  summary:
    'Elige bien el contrato tras la reforma: causa temporal, cupo de 90 días, fijo-discontinuo, sustitución, formativos, regla 18/24, costes de 2026 y sanciones por persona.',
  coverTerm: '¿Qué contrato?',
  readingMinutes: 11,
  outcomes: [
    'Identificar la modalidad que corresponde a cada necesidad del cliente: indefinido, fijo-discontinuo, circunstancias de la producción, sustitución o formativo.',
    'Calcular los límites y costes de cada opción: cupo de 90 días, regla de 18 meses en 24, indemnización de 12 días por año y cotización adicional de 33,62 €.',
    'Decidir qué debe constar por escrito y a quién hay que comunicarlo para evitar la fijeza y la sanción.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Punto de partida: indefinido, salvo causa probada', id: 'punto-de-partida' },
    {
      type: 'paragraph',
      text: `Desde el 30 de marzo de 2022, el contrato de trabajo se presume indefinido y solo hay dos causas de duración determinada: las [[circunstancias de la producción]] y la sustitución de una persona trabajadora ([art. 15.1 ET](${ET}#a15)). El contrato de obra o servicio ya no puede celebrarse. Cuando te pidan «un temporal», no empieces por la duración: pregunta qué necesidad cubre y si volverá.`,
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'causa de temporalidad',
      text: 'Es lo que hace válido un temporal: el contrato debe precisar la **causa habilitante**, las **circunstancias concretas** que la justifican y su **conexión con la duración prevista**. «Necesidades de la producción» no basta; «situación ocasional y previsible: refuerzo de mostrador por la venta de turrones del 21 al 24 de diciembre de 2026», sí.',
      refs: [{ label: 'Estatuto de los Trabajadores, art. 15.1', url: `${ET}#a15`, date: VERIFIED, kind: 'norma' }],
    },
    {
      type: 'paragraph',
      text: `Sin [[causa de temporalidad]], o si se incumple otra regla del art. 15, la persona pasa a ser fija ([art. 15.4 ET](${ET}#a15)), igual que la temporal no dada de alta en la Seguridad Social tras un plazo igual al del periodo de prueba. Los temporales de más de cuatro semanas y los fijos-discontinuos van por escrito; si no, se presumen indefinidos y a jornada completa, salvo prueba en contrario ([art. 8.2 ET](${ET}#a8)).`,
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Novedad desde el 5 de octubre de 2026',
      text: `Si la relación dura más de cuatro semanas, la empresa debe informar por escrito, **antes del inicio**, de los elementos esenciales del contrato, incluida la causa en los temporales. Basta con que el contrato escrito lo recoja todo ([RD 723/2026, arts. 2.2, 3, 6.1 y 7.1](${RD_723}#a3)).`,
      refs: [{ label: 'Real Decreto 723/2026, de 9 de septiembre (BOE núm. 228, de 15/09/2026)', url: `${RD_723}#a3`, date: VERIFIED, kind: 'norma' }],
    },
    {
      type: 'widget',
      widget: {
        kind: 'arbol-decision',
        title: '¿Qué contrato corresponde?',
        start: 'q1',
        nodes: [
          {
            id: 'q1',
            question: '¿La necesidad es permanente y dura todo el año?',
            options: [
              { label: 'Sí', next: 'r-indefinido' },
              { label: 'No', next: 'q2' },
            ],
          },
          {
            id: 'q2',
            question: '¿Es una temporada o una actividad intermitente que vuelve cada año (no unos pocos días punta), o una contrata previsible de la actividad ordinaria?',
            options: [
              { label: 'Sí', next: 'r-fijo-discontinuo' },
              { label: 'No', next: 'q3' },
            ],
          },
          {
            id: 'q3',
            question: '¿Cubres una reserva de puesto, una jornada reducida o una vacante en selección?',
            options: [
              { label: 'Sí', next: 'r-sustitucion' },
              { label: 'No', next: 'q4' },
            ],
          },
          {
            id: 'q4',
            question: '¿Quieres formar a alguien que estudia o darle práctica tras el título?',
            options: [
              { label: 'Sí', next: 'r-formativo' },
              { label: 'No', next: 'q5' },
            ],
          },
          {
            id: 'q5',
            question: '¿Es un aumento imprevisible o una oscilación puntual, incluidas las vacaciones?',
            options: [
              { label: 'Sí', next: 'r-cp-imprevisible' },
              { label: 'No', next: 'q6' },
            ],
          },
          {
            id: 'q6',
            question: '¿Son situaciones ocasionales y previsibles, de pocos días, identificables en el contrato?',
            options: [
              { label: 'Sí', next: 'r-cp-previsible' },
              { label: 'No', next: 'r-sin-causa' },
            ],
          },
          {
            id: 'r-indefinido',
            outcome: { title: 'Indefinido ordinario', text: 'Es la regla general y no necesita causa.', tone: 'resolver' },
          },
          {
            id: 'r-fijo-discontinuo',
            outcome: {
              title: 'Fijo-discontinuo',
              text: 'Indefinido y por escrito, con periodo de actividad y jornada. Llamamiento con criterios objetivos.',
              tone: 'resolver',
            },
          },
          {
            id: 'r-sustitucion',
            outcome: {
              title: 'Sustitución',
              text: 'Nombre de la persona sustituida y causa; traspaso de 15 días como máximo. Vacante: 3 meses como máximo.',
              tone: 'resolver',
            },
          },
          {
            id: 'r-formativo',
            outcome: {
              title: 'Contrato formativo',
              text: 'Alternancia si estudia (3 meses a 2 años) o práctica en los 3 años siguientes al título (6 meses a 1 año).',
              tone: 'atencion',
            },
          },
          {
            id: 'r-cp-imprevisible',
            outcome: {
              title: 'Producción: imprevisible u oscilación',
              text: 'Hasta 6 meses (1 año por convenio sectorial), con una prórroga. Vigila la regla 18/24.',
              tone: 'atencion',
            },
          },
          {
            id: 'r-cp-previsible',
            outcome: {
              title: 'Producción: ocasional previsible',
              text: 'Hasta 90 días por empresa y año natural, no continuados, con previsión anual a la representación legal.',
              tone: 'atencion',
            },
          },
          {
            id: 'r-sin-causa',
            outcome: {
              title: 'No hay causa temporal',
              text: 'Debe ser indefinido. Si el cliente insiste, consúltalo con una persona senior del área.',
              tone: 'derivar',
            },
          },
        ],
      },
      caption: 'Responde en orden: la primera respuesta afirmativa te da la modalidad.',
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Circunstancias de la producción: dos variantes con límites distintos', id: 'circunstancias-de-la-produccion' },
    {
      type: 'paragraph',
      text: `La primera variante cubre el **incremento ocasional e imprevisible** de la actividad y las **oscilaciones** de la actividad normal, incluidas las vacaciones anuales. Dura **6 meses** como máximo, ampliables a 1 año por convenio sectorial, con una única prórroga dentro de ese límite ([art. 15.2 ET](${ET}#a15)). No cubre lo que encaja en el fijo-discontinuo: una temporada que se repite cada año no es una oscilación.`,
    },
    {
      type: 'paragraph',
      text: 'La segunda atiende **situaciones ocasionales, previsibles y de duración reducida y delimitada**, identificadas en el contrato. La empresa puede usarla **90 días por año natural** como máximo (120 en el sector agrario y agroalimentario), con independencia de las personas que contrate cada día, y no de manera continuada. En el último trimestre debe trasladar a la representación legal de las personas trabajadoras (RLT) una previsión anual de uso.',
    },
    {
      type: 'list',
      items: [
        'Se cuentan **días**, no personas: 2 o 10 personas el mismo día consumen 1 día.',
        'El cupo es de la **empresa** y va por **año natural**: un refuerzo del 28/12 al 5/1 consume días de dos cupos.',
        'Un contrato de pocos días consume cupo y, si dura menos de 30 días, genera [[cotización adicional]].',
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: '«No continuada»: criterio prudente',
      text: 'La ley no dice cuántos días seguidos caben en cada bloque. **Interpretación prudente:** planifica bloques cortos y separados, cada uno ligado a una situación concreta (*Black Friday*, Navidad, Sant Joan). Si la campaña es larga y se repite cada año en las mismas fechas, valora el fijo-discontinuo.',
      refs: [{ label: 'Estatuto de los Trabajadores, art. 15.2', url: `${ET}#a15`, date: VERIFIED, kind: 'norma' }],
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Fijo-discontinuo, sustitución y contratos formativos', id: 'fijo-discontinuo-sustitucion-y-formativos' },
    {
      type: 'paragraph',
      text: `Si la necesidad **vuelve cada año** (trabajos estacionales o de temporada) o es intermitente, con periodos de ejecución ciertos, determinados o indeterminados, el contrato es [[fijo-discontinuo]], es decir, indefinido ([art. 16 ET](${ET}#a16)). También sirve para contratas previsibles de la actividad ordinaria. Va por escrito, con la duración del periodo de actividad, la jornada y su distribución horaria; estas dos últimas pueden ser estimadas y concretarse en el llamamiento.`,
    },
    {
      type: 'paragraph',
      text: `El llamamiento sigue los criterios objetivos del convenio o del acuerdo de empresa y se notifica por escrito o por un medio que deje constancia. Al inicio de cada año, la RLT recibe el calendario de llamamientos. La antigüedad cuenta toda la relación y, durante la inactividad, la persona está en situación legal de desempleo ([art. 267.1.d LGSS](${LGSS}#a267)).`,
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Tampoco es un comodín',
      text: `El [Plan Estratégico de la Inspección de Trabajo 2025-2027](${PLAN_ITSS}) prioriza regularizar los fijos-discontinuos sin la estacionalidad o la intermitencia que exige la ley. Si la actividad es continua todo el año, el contrato es indefinido ordinario.`,
      refs: [{ label: 'Plan Estratégico de la Inspección de Trabajo y Seguridad Social 2025-2027 (BOE núm. 220, de 12/09/2025)', url: PLAN_ITSS, date: VERIFIED, kind: 'documento' }],
    },
    {
      type: 'paragraph',
      text: `El [[contrato de sustitución]] cubre a una persona con **reserva de puesto** (como en la suspensión por nacimiento: [art. 48.4 ET](${ET}#a48)), completa una **jornada reducida** por causa legal o convencional o cubre una **vacante durante la selección** (3 meses como máximo, o menos si lo fija el convenio). En los dos primeros casos, indica el nombre de la persona sustituida y la causa. Si cubre una ausencia, puede empezar antes el tiempo imprescindible, 15 días como máximo ([art. 15.3 ET](${ET}#a15)). No genera indemnización ni cotización adicional.`,
    },
    {
      type: 'paragraph',
      text: `Hay dos contratos formativos ([art. 11 ET](${ET}#a11)). La **formación en alternancia** acompaña a estudios en curso, dura de 3 meses a 2 años y no admite periodo de prueba. La **práctica profesional** se concierta en los 3 años siguientes al fin de los estudios (5 con discapacidad), dura de 6 meses a 1 año y admite 1 mes de prueba como máximo. El [RD 1065/2025](${RD_1065}#a2) limita cuántos puede haber a la vez en cada centro (3 en centros de hasta 10 personas). Con fraude o sin formación, son indefinidos ordinarios.`,
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Límites, costes y sanciones', id: 'limites-costes-y-sanciones' },
    {
      type: 'paragraph',
      text: `La [[regla 18/24]] hace fija a la persona contratada **más de 18 meses en 24** con dos o más contratos por circunstancias de la producción, con o sin interrupciones, en el mismo o distinto puesto, en la empresa o el grupo, incluso a través de una empresa de trabajo temporal. También es fija la persona que ocupa un puesto cubierto así durante más de 18 meses en 24. En los 10 días siguientes, la empresa debe entregarle un documento escrito que acredite su condición de fija ([art. 15.5 y 15.9 ET](${ET}#a15)).`,
    },
    {
      type: 'paragraph',
      text: `Sin convenio, el periodo de prueba máximo es de 6 meses para técnicos titulados y de 2 meses para el resto (3 en empresas de menos de 25 personas); en los temporales de hasta 6 meses, de 1 mes, salvo convenio. Es nulo si la persona ya hizo esas funciones en la empresa ([art. 14.1 ET](${ET}#a14)).`,
    },
    {
      type: 'list',
      items: [
        `**Indemnización:** 12 días de salario por año de servicio, en proporción al tiempo trabajado; no se paga en la sustitución ni en los formativos ([art. 49.1.c ET](${ET}#a49)).`,
        `**Cotización adicional:** 33,62 € en 2026 por cada contrato de duración determinada inferior a 30 días ([art. 28 de la Orden PJC/297/2026](${ORDEN_COTIZACION}#a2-10)); no se aplica a la sustitución ni, entre otros, al sistema especial agrario ([art. 151 LGSS](${LGSS}#a151)).`,
        `**Salario mínimo interprofesional (SMI) de 2026:** 1.221 € al mes o 40,70 € al día; en temporales con servicios a la empresa de hasta 120 días, 57,82 € por jornada, más las vacaciones no disfrutadas ([RD 126/2026, arts. 1 y 4.1](${SMI_2026}#a4)).`,
      ],
    },
    {
      type: 'paragraph',
      text: `Usar un temporal en fraude de ley o fuera de sus supuestos y límites es una **infracción grave**, y hay **una infracción por cada persona afectada** ([art. 7.2 LISOS](${LISOS}#a7)): de 1.000 a 10.000 € cada una, con grado mínimo hasta 2.000 €, medio hasta 5.000 € y máximo hasta 10.000 € ([art. 40.1.c bis LISOS](${LISOS}#a40)). La multa no evita la fijeza, y pagar los 12 días por año no subsana el fraude.`,
    },
    {
      type: 'widget',
      widget: {
        kind: 'comparativa',
        title: 'Modalidades en 2026',
        columns: ['Fijo-discontinuo', 'Producción: imprevisible', 'Producción: ocasional previsible', 'Sustitución', 'Formativos'],
        rows: [
          {
            label: 'Duración',
            values: [
              'Indefinida, con llamamientos',
              'Hasta 6 meses (1 año por convenio sectorial)',
              'Hasta 90 días por empresa y año, no continuados',
              'Hasta la reincorporación; vacante, 3 meses',
              'Alternancia: de 3 meses a 2 años · Práctica: de 6 meses a 1 año',
            ],
          },
          {
            label: 'Prueba sin convenio',
            values: [
              '6 meses titulados; 2 el resto (3 en empresas de menos de 25)',
              '1 mes si dura hasta 6 meses',
              '1 mes',
              '1 mes si dura hasta 6 meses',
              'Alternancia: no cabe · Práctica: 1 mes',
            ],
          },
          { label: 'Al terminar', values: ['Inactividad hasta el llamamiento', '12 días por año', '12 días por año', 'Sin indemnización', 'Sin indemnización'] },
          { label: 'Cotización adicional (menos de 30 días)', values: ['No', '33,62 €', '33,62 €', 'No (excluida)', 'Alternancia: excluida · Práctica: mínimo 6 meses'] },
          { label: 'Desempleo, parte de la empresa', values: ['5,50 %', '6,70 %', '6,70 %', '5,50 %', '5,50 % (la alternancia tiene reglas propias)'] },
        ],
      },
      caption: 'Datos de 2026 sin convenio que los modifique (desempleo: art. 33 de la Orden PJC/297/2026). La prueba es nula si la persona ya hizo esas funciones en la empresa.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Qué está pendiente',
      text: 'A 28 de octubre de 2026 no consta en el BOE ningún cambio aprobado y pendiente de entrar en vigor en estos preceptos. Las cuantías de 2027 (SMI y cotización adicional) aún no se han publicado: compruébalas antes de calcular contratos de 2027.',
      refs: [
        { label: 'Real Decreto 126/2026, de 18 de febrero, SMI para 2026 (disposición final tercera)', url: `${SMI_2026}#df-3`, date: VERIFIED, kind: 'norma' },
        { label: 'Orden PJC/297/2026, de 30 de marzo, de cotización para 2026 (art. 28)', url: `${ORDEN_COTIZACION}#a2-10`, date: VERIFIED, kind: 'norma' },
      ],
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso resuelto: pastelería con heladería', id: 'caso-resuelto' },
    {
      type: 'example',
      title: 'Tres necesidades, tres contratos',
      scenario:
        'Pastelería con heladería en la costa catalana, con 14 personas y una delegada de personal (caso ficticio). El 28 de octubre de 2026 pide: (1) las dos personas de cada temporada para la heladería, del 1 de abril al 31 de octubre; (2) dos refuerzos para los días punta de Navidad, y (3) cubrir a Marta, la encargada, que desde el 18 de enero de 2027 disfrutará 17 semanas seguidas de suspensión por nacimiento. Ya ha usado 9 días del cupo de 2026. Su convenio no amplía plazos y paga 70,00 € por jornada de campaña, con domingos, festivos y pagas extra prorrateados.',
      steps: [
        {
          label: '**Heladería.** Mide la temporada.',
          formula: 'Del 1/4 al 31/10: 30 + 31 + 30 + 31 + 31 + 30 + 31',
          result: '214 días: más de 6 meses',
        },
        {
          label: '**Heladería.** Se repite cada año: el art. 15.2 ET la excluye de las circunstancias de la producción.',
          formula: 'Temporada (art. 16.1 ET) → fijo-discontinuo',
          result: '2 fijos-discontinuos, sin prueba: ya hicieron esas funciones',
        },
        {
          label: '**Heladería.** Coste del error si mantienes el eventual.',
          formula: '2 personas × (1.000 € a 10.000 €)',
          result: 'De 2.000 a 20.000 € de multa, y fijeza de ambas',
        },
        {
          label: '**Navidad.** Bloques cortos y separados, con dos personas cada uno.',
          formula: 'A: 21-24/12/2026 (4 días) · B: 28-31/12/2026 (4 días)',
          result: '4 contratos y 8 días de uso',
        },
        {
          label: '**Navidad.** Cupo de 2026: se cuentan días, no personas.',
          formula: '9 + 4 + 4 = 17 · 90 − 17 = 73',
          result: '73 días libres (las 16 personas-día no cuentan)',
        },
        {
          label: '**Navidad.** Indemnización de 12 días por año (4 contratos).',
          formula: '70,00 € × 12 × 16 días ÷ 365',
          result: '36,82 €',
        },
        {
          label: '**Navidad.** Cotización adicional (4 contratos de menos de 30 días).',
          formula: '47,48 € × 23,60 % × 3 = 33,62 € · 4 × 33,62 €',
          result: '134,48 €',
        },
        {
          label: '**Navidad.** Coste específico de 2026, sin cotizaciones ordinarias.',
          formula: '2 × 8 × 70,00 € = 1.120,00 € · 1.120,00 + 36,82 + 134,48',
          result: '1.291,30 €, más las vacaciones no disfrutadas',
        },
        {
          label: '**Encargada.** Sustitución con el nombre de Marta y la causa.',
          formula: 'Traspaso 4-17/01/2027 (14 días) + ausencia 18/01-16/05/2027 (17 × 7 = 119 días)',
          result: '133 días: prueba de 1 mes como máximo; sin indemnización ni cotización adicional',
        },
      ],
      conclusion:
        'Dos fijos-discontinuos, cuatro ocasionales previsibles y una sustitución. Antes del 31 de diciembre, la delegada recibe la previsión anual y, a principios de 2027, el calendario de llamamientos. Si los contratos de más de cuatro semanas no lo recogen todo, informa por escrito antes del inicio. Y revisa los eventuales de otras temporadas: podrían reclamar la fijeza.',
    },
    { type: 'paragraph', text: 'Antes de firmar, comprueba también:' },
    {
      type: 'list',
      items: [
        'La causa concreta por escrito, incluso en temporales de menos de cuatro semanas: es lo prudente, porque el art. 15.1 ET exige precisarla «en el contrato».',
        `La comunicación al servicio público de empleo y la copia básica a la RLT, en 10 días ([art. 8.3 y 8.4 ET](${ET}#a8)).`,
      ],
    },
  ],
  keyTerms: [
    {
      term: 'causa de temporalidad',
      definition: `Justificación que todo contrato temporal debe precisar: causa habilitante, circunstancias concretas y su conexión con la duración prevista ([art. 15.1 ET](${ET}#a15)).`,
    },
    {
      term: 'circunstancias de la producción',
      definition: 'Causa temporal con dos variantes: aumento imprevisible u oscilación (hasta 6 meses) y situaciones ocasionales previsibles (hasta 90 días por empresa y año natural).',
    },
    {
      term: 'fijo-discontinuo',
      definition: 'Contrato indefinido para trabajos de temporada o intermitentes que se repiten; entre periodos de actividad, la persona espera el llamamiento.',
    },
    {
      term: 'contrato de sustitución',
      definition: 'Temporal que cubre una reserva de puesto, completa una jornada reducida o cubre una vacante en selección (3 meses como máximo).',
    },
    {
      term: 'regla 18/24',
      definition: 'Fijeza de quien suma más de 18 meses en 24 con dos o más contratos por circunstancias de la producción, con o sin interrupciones.',
    },
    {
      term: 'cotización adicional',
      definition: 'Cuota fija de la empresa al terminar cada contrato de duración determinada inferior a 30 días: 33,62 € en 2026. No se aplica a la sustitución.',
    },
  ],
  takeaway:
    'Lo indefinido es la regla y lo temporal, la excepción que hay que probar: si la necesidad vuelve cada año, piensa en fijo-discontinuo; si es puntual, escribe la causa concreta y cuenta días (90 por año) y meses (18 en 24). Cada error cuesta fijeza y de 1.000 a 10.000 € por persona.',
  sources: [
    { label: 'Estatuto de los Trabajadores (RDLeg 2/2015), texto consolidado: art. 15', url: `${ET}#a15`, date: VERIFIED, kind: 'norma' },
    { label: 'Estatuto de los Trabajadores: art. 16 (contrato fijo-discontinuo)', url: `${ET}#a16`, date: VERIFIED, kind: 'norma' },
    { label: 'Estatuto de los Trabajadores: arts. 8, 11, 14, 48.4 y 49.1.c', url: ET, date: VERIFIED, kind: 'norma' },
    { label: 'LISOS (RDLeg 5/2000): arts. 7.2 y 40.1.c bis', url: `${LISOS}#a40`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley General de la Seguridad Social (RDLeg 8/2015): arts. 151 y 267.1.d', url: `${LGSS}#a151`, date: VERIFIED, kind: 'norma' },
    { label: 'Orden PJC/297/2026, de 30 de marzo, de cotización para 2026: arts. 3, 4, 28 y 33', url: `${ORDEN_COTIZACION}#a2-10`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 126/2026, de 18 de febrero, por el que se fija el SMI para 2026', url: `${SMI_2026}#a4`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 723/2026, de 9 de septiembre, de condiciones laborales transparentes y previsibles (en vigor desde el 05/10/2026)', url: `${RD_723}#a3`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1065/2025, de 26 de noviembre, del contrato formativo', url: `${RD_1065}#a2`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto-ley 32/2021, de 28 de diciembre, de reforma laboral: entrada en vigor (DF 8.ª)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-21788#df-8', date: VERIFIED, kind: 'norma' },
    { label: 'Plan Estratégico de la Inspección de Trabajo y Seguridad Social 2025-2027', url: PLAN_ITSS, date: VERIFIED, kind: 'documento' },
  ],
  quiz: {
    id: 'lab-03-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'lab-03-q1',
        prompt:
          'En 2026, una tienda usa por primera vez el contrato por circunstancias de la producción ocasionales y previsibles: contrata a 4 personas el viernes 27 y el sábado 28 de noviembre, y a 2 personas del lunes 21 al jueves 24 de diciembre. ¿Cuántos días del límite anual ha consumido?',
        options: [
          {
            id: 'a',
            text: '16 días, porque se suman los días trabajados por cada persona.',
            feedback: '16 son personas-día (4 × 2 + 2 × 4). El límite cuenta los días en que la empresa usa la modalidad, no las personas contratadas.',
          },
          {
            id: 'b',
            text: 'Ninguno, porque los contratos de menos de 30 días no consumen el cupo: solo generan cotización adicional.',
            feedback: 'La duración inferior a 30 días activa la cotización adicional, pero no saca el contrato del cupo: todo uso de esta modalidad consume días.',
          },
          { id: 'c', text: '6 días: el límite es de la empresa por año natural y se cuentan días, no personas.' },
          {
            id: 'd',
            text: '6 días, pero cada persona contratada tiene su propio límite de 90 días.',
            feedback: 'Aciertas en los 6 días, pero el cupo no es individual: hay un único límite de 90 días por año natural para toda la empresa.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'El art. 15.2 ET fija un máximo de 90 días en el año natural para la empresa, «independientemente de las personas trabajadoras que sean necesarias» cada día. Se usan 2 días en noviembre y 4 en diciembre: 2 + 4 = 6.',
        ref: 'Circunstancias de la producción: dos variantes con límites distintos (art. 15.2 ET)',
      },
      {
        id: 'lab-03-q2',
        prompt:
          'Un cámping abre cada año del 1 de abril al 31 de octubre y necesita 3 recepcionistas solo durante ese periodo. El convenio sectorial no amplía la duración del contrato por circunstancias de la producción. ¿Qué contrato corresponde?',
        options: [
          { id: 'a', text: 'Contrato fijo-discontinuo.' },
          {
            id: 'b',
            text: 'Contrato por circunstancias de la producción por oscilación, de 6 meses, con una prórroga de un mes.',
            feedback: 'El art. 15.2 ET excluye de las circunstancias de la producción los supuestos del art. 16.1 y, además, la prórroga no puede superar el máximo de 6 meses: la temporada dura 214 días.',
          },
          {
            id: 'c',
            text: 'Contrato por circunstancias de la producción ocasionales y previsibles, con el cupo de 90 días de cada año.',
            feedback: 'La temporada (214 días) supera todo el cupo anual de 90 días, y esos días no pueden usarse de manera continuada.',
          },
          {
            id: 'd',
            text: 'Contrato de sustitución mientras dure la temporada.',
            feedback: 'La sustitución exige una persona con reserva de puesto, una jornada reducida que completar o una vacante en selección, y aquí no hay ninguna.',
          },
        ],
        correctOptionId: 'a',
        explanation:
          'Es una actividad de temporada que se repite cada año: el supuesto típico del fijo-discontinuo (art. 16.1 ET). Se formaliza por escrito con el periodo de actividad, la jornada y su distribución, y la reincorporación se hace mediante llamamiento.',
        ref: 'Fijo-discontinuo, sustitución y contratos formativos (art. 16 ET)',
      },
      {
        id: 'lab-03-q3',
        prompt:
          'La Inspección de Trabajo concluye que una empresa ha contratado en fraude de ley a 5 personas con contratos por circunstancias de la producción. ¿Qué consecuencia es correcta?',
        options: [
          {
            id: 'a',
            text: 'Una única infracción grave de la empresa, con multa de 751 a 7.500 €.',
            feedback: 'Esa es la escala general de las infracciones graves (art. 40.1.b LISOS). El fraude en la contratación temporal tiene escala propia y se cuenta una infracción por persona.',
          },
          {
            id: 'b',
            text: 'Una infracción muy grave, de 7.501 a 225.018 €, sin efecto sobre los contratos.',
            feedback: 'Es una infracción grave, no muy grave, y sí afecta a los contratos: las personas adquieren la condición de fijas.',
          },
          {
            id: 'c',
            text: 'No hay multa si la empresa paga a cada persona la indemnización de 12 días por año al terminar el contrato.',
            feedback: 'La indemnización de 12 días es un derecho al terminar un temporal válido (art. 49.1.c ET); no subsana el fraude ni evita la sanción.',
          },
          {
            id: 'd',
            text: 'Cinco infracciones graves, de 1.000 a 10.000 € cada una (de 5.000 a 50.000 € en total), y las 5 personas adquieren la condición de fijas.',
          },
        ],
        correctOptionId: 'd',
        explanation:
          'El art. 7.2 LISOS cuenta una infracción por cada persona afectada y el art. 40.1.c bis la sanciona con 1.000 a 10.000 €: 5 × 1.000 = 5.000 € y 5 × 10.000 = 50.000 €. Además, el art. 15.4 ET convierte en fijas a las personas contratadas incumpliendo el art. 15.',
        ref: 'Límites, costes y sanciones (arts. 7.2 y 40.1.c bis LISOS)',
      },
    ],
  },
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-judith-calet',
    publishedAt: '2026-10-01T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: VERIFIED,
};

/** Banco de 4 preguntas adicionales para la evaluación sectorial. */
export const bank: QuizQuestion[] = [
  {
    id: 'lab-03-b1',
    prompt:
      'Una startup contrata a una persona para sustituir a un empleado que va a iniciar la suspensión por nacimiento. ¿Cuánto tiempo pueden coincidir ambos en el puesto antes de la ausencia?',
    options: [
      {
        id: 'a',
        text: 'Ningún día: el contrato de sustitución debe empezar el mismo día de la ausencia.',
        feedback: 'El art. 15.3 ET permite expresamente que la prestación empiece antes de la ausencia de la persona sustituida.',
      },
      { id: 'b', text: 'El tiempo imprescindible para garantizar el desempeño adecuado del puesto, con un máximo de 15 días.' },
      {
        id: 'c',
        text: 'Hasta 1 mes, lo mismo que el periodo de prueba máximo de un temporal.',
        feedback: 'Confunde el traspaso con el periodo de prueba (art. 14.1 ET), que es otra institución con otro fin.',
      },
      {
        id: 'd',
        text: 'Sin límite, si se pacta por escrito.',
        feedback: 'El límite de 15 días lo fija la ley y un pacto escrito no lo amplía.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'El art. 15.3 ET permite iniciar la prestación antes de la ausencia, coincidiendo en las funciones el tiempo imprescindible para garantizar el desempeño adecuado del puesto y, como máximo, durante 15 días.',
    ref: 'Fijo-discontinuo, sustitución y contratos formativos (art. 15.3 ET)',
  },
  {
    id: 'lab-03-b2',
    prompt:
      'En noviembre de 2026, una empresa celebra un contrato de sustitución de 20 días y un contrato por circunstancias de la producción de 20 días. Ambas personas están en el Régimen General, fuera de cualquier sistema especial, y ninguna tiene una relación laboral especial. ¿Qué cotización adicional debe ingresar al finalizar ambos?',
    options: [
      {
        id: 'a',
        text: '0 €.',
        feedback: 'El contrato por circunstancias de la producción de menos de 30 días sí genera la cotización adicional.',
      },
      {
        id: 'b',
        text: '67,24 €.',
        feedback: '2 × 33,62 € supone aplicarla también a la sustitución, que está excluida (art. 151.3 LGSS).',
      },
      { id: 'c', text: '33,62 €.' },
      {
        id: 'd',
        text: '672,40 €.',
        feedback: '20 × 33,62 € supone pagarla por cada día. Es una cuantía fija por contrato que se ingresa a su finalización.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Solo genera cotización adicional el contrato por circunstancias de la producción inferior a 30 días: 1 × 33,62 € (art. 28 de la Orden PJC/297/2026). La sustitución está excluida (art. 151.3 LGSS).',
    ref: 'Límites, costes y sanciones (art. 151 LGSS)',
  },
  {
    id: 'lab-03-b3',
    prompt:
      'Luis ha trabajado para la misma empresa, dentro de un periodo de 24 meses, con cuatro contratos por circunstancias de la producción: 6 meses en el almacén, 6 en la tienda, 6 en el almacén y 1 en la tienda. Entre contrato y contrato pasaron varias semanas sin trabajar. ¿Qué ocurre?',
    options: [
      { id: 'a', text: 'Adquiere la condición de fijo: suma 19 meses (6 + 6 + 6 + 1) en un periodo de 24.' },
      {
        id: 'b',
        text: 'Nada: las interrupciones entre contratos rompen el cómputo.',
        feedback: 'La norma incluye expresamente los periodos trabajados «con o sin solución de continuidad».',
      },
      {
        id: 'c',
        text: 'Nada: al cambiar de puesto no hay encadenamiento.',
        feedback: 'La regla se aplica «para el mismo o diferente puesto de trabajo».',
      },
      {
        id: 'd',
        text: 'Solo sería fijo si los contratos se hubieran hecho a través de una ETT.',
        feedback: 'La ETT es una vía más de cómputo, no un requisito: los contratos directos con la empresa también cuentan.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'El art. 15.5 ET hace fija a la persona contratada más de 18 meses en un periodo de 24 mediante dos o más contratos por circunstancias de la producción, con o sin solución de continuidad y para el mismo o diferente puesto.',
    ref: 'Límites, costes y sanciones (art. 15.5 ET)',
  },
  {
    id: 'lab-03-b4',
    prompt:
      'Una startup sin otros contratos formativos vigentes quiere contratar durante 9 meses a una graduada en ADE que terminó el grado hace 2 años, nunca ha trabajado en la empresa y no ha tenido ningún contrato formativo, para que adquiera práctica profesional. ¿Qué es correcto?',
    options: [
      {
        id: 'a',
        text: 'Debe usar el contrato de formación en alternancia, que no admite periodo de prueba.',
        feedback: 'La alternancia compatibiliza el trabajo con estudios en curso; ella ya tiene el título y busca práctica profesional (art. 11.2 ET).',
      },
      {
        id: 'b',
        text: 'No puede: la práctica profesional solo cabe en los 12 meses siguientes a terminar los estudios.',
        feedback: 'El plazo es de 3 años desde la terminación de los estudios (5 con discapacidad), no de 12 meses.',
      },
      {
        id: 'c',
        text: 'Debe usar un contrato por circunstancias de la producción de 6 meses, prorrogable hasta 9.',
        feedback: 'No hay una causa productiva temporal y, sin ampliación por convenio sectorial, la prórroga no puede superar el máximo de 6 meses (art. 15.2 ET).',
      },
      { id: 'd', text: 'Puede usar el contrato formativo para la obtención de práctica profesional, con un periodo de prueba de 1 mes como máximo.' },
    ],
    correctOptionId: 'd',
    explanation:
      'Está dentro de los 3 años siguientes a terminar los estudios y 9 meses queda entre la duración mínima (6 meses) y la máxima (1 año) del art. 11.3 ET. El art. 11.3.e ET fija un periodo de prueba de 1 mes como máximo, salvo lo dispuesto en convenio, y el art. 24 del RD 1065/2025 precisa que el convenio solo puede reducirlo.',
    ref: 'Fijo-discontinuo, sustitución y contratos formativos (art. 11.3 ET)',
  },
];

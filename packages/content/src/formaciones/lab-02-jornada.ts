import type { Formation, QuizQuestion } from '@flm/shared';

const ET = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430';
const LOPDGDD = 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673';
const LTD = 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-11472';
const LISOS = 'https://www.boe.es/buscar/act.php?id=BOE-A-2000-15060';
const LRJS = 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936';
const RDL_8_2019 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-3481';
const RD_1561 = 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-21346';
const RD_723 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-19200';
const STJUE_C55 = 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:62018CJ0055';
const BARBULESCU = 'https://hudoc.echr.coe.int/eng?i=001-177082';
const STC_170 = 'https://www.boe.es/buscar/doc.php?id=BOE-A-2013-11681';
const GUIA = 'https://www.mites.gob.es/ficheros/ministerio/GuiaRegistroJornada.pdf';
const PARTICIPA = 'https://expinterweb.mites.gob.es/participa/listado?tramite=1&estado=2';
const RGPD = 'https://www.boe.es/buscar/doc.php?id=DOUE-L-2016-80807';
const VOTACION_37_5 = 'https://www.congreso.es/webpublica/opendata/votaciones/Leg15/Sesion130/20250910/Votacion010/VOT_20250910213533.pdf';
const VERIFIED = '2026-10-28';

export const formation: Formation = {
  id: 'lab-02',
  slug: 'registro-jornada-horas-extra-desconexion',
  area: 'laboral',
  title: 'Registro de jornada, horas extra y desconexión digital: qué exige hoy la ley',
  intro:
    'Una startup de seis personas recibe un requerimiento de la Inspección de Trabajo para que aporte sus registros de jornada: solo tiene una hoja que la gerente rellena a fin de mes. Además, dos personas encadenan horas extra «cuando hace falta», el equipo contesta mensajes a las once de la noche y el socio quiere leer el correo de una desarrolladora. Tienes que separar lo que la ley exige hoy de lo que aún es un proyecto.',
  summary:
    'Qué exige hoy el registro de jornada, cómo se computa el tope de 80 horas extra y qué límites tienen la desconexión digital y el control del correo corporativo.',
  coverTerm: 'Art. 34.9',
  readingMinutes: 11,
  outcomes: [
    'Identificar qué exige hoy el registro diario de jornada y distinguirlo del proyecto de registro digital, que no está en vigor.',
    'Calcular las horas extraordinarias que computan para el tope anual, incluida su reducción proporcional, y el margen de horas complementarias a tiempo parcial.',
    'Decidir si una comunicación fuera de horario o un acceso al correo corporativo es lícito y qué riesgo sancionador supone.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Registro diario: qué exige hoy el art. 34.9 ET', id: 'registro-diario' },
    {
      type: 'paragraph',
      text: `Desde el 12 de mayo de 2019, la empresa debe garantizar el [[registro diario de jornada]] de cada persona trabajadora, con la hora concreta de inicio y de fin ([art. 34.9 ET](${ET}#a34); [RDL 8/2019, disp. final 6.ª](${RDL_8_2019}#df-6)). Alcanza a quien teletrabaja, a los comerciales, a quien tiene horario flexible y a los mandos intermedios; queda fuera la alta dirección, y las relaciones laborales especiales siguen su propia normativa ([Guía del Ministerio de Trabajo](${GUIA})).`,
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'registro diario de jornada',
      text: 'Es la anotación, día a día y por persona, de la hora en que empieza y termina la jornada. No hay un soporte obligatorio: vale el papel o una aplicación si el sistema es **objetivo, fiable y accesible** y no permite rehacer los datos después. Una hoja que se rellena a fin de mes no cumple.',
      refs: [
        { label: 'Estatuto de los Trabajadores, art. 34.9', url: `${ET}#a34`, date: VERIFIED, kind: 'norma' },
        { label: 'STJUE (Gran Sala) de 14 de mayo de 2019, asunto C-55/18, apdo. 60', url: STJUE_C55, date: VERIFIED, kind: 'jurisprudencia' },
      ],
    },
    { type: 'paragraph', text: 'Al implantarlo en un cliente, revisa:' },
    {
      type: 'list',
      items: [
        '**Sistema.** Lo fija el convenio o un acuerdo de empresa; si no, la empresa, previa consulta con la representación legal (o sola, si no la hay).',
        '**Pausas.** Anótalas también: según la Guía, así se evita presumir que todo el tiempo entre el inicio y el fin es trabajo efectivo.',
        '**Conservación.** Cuatro años, accesibles de inmediato desde el centro de trabajo para la plantilla, su representación y la Inspección.',
        `**Tiempo parcial.** Además, totalización mensual y copia del resumen con la nómina; si falta, se presume la jornada completa, salvo prueba en contrario ([art. 12.4.c ET](${ET}#a12)).`,
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'El registro digital obligatorio todavía es un proyecto',
      text: 'El Ministerio de Trabajo sometió a audiencia pública un proyecto de real decreto de registro de jornada, con aportaciones del 10 al 20 de octubre de 2025. A 28/10/2026 **no se ha publicado en el BOE**, así que no obliga: no digas a un cliente que el papel está prohibido. Si se publica, revisa su texto y su entrada en vigor.',
      refs: [
        { label: 'Ministerio de Trabajo: audiencias públicas cerradas (proyecto de RD de registro de jornada)', url: PARTICIPA, date: VERIFIED, kind: 'documento' },
      ],
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'El RD 723/2026 no regula el registro',
      text: `El [Real Decreto 723/2026](${RD_723}), en vigor desde el 5 de octubre de 2026, regula la información sobre el contrato. En las relaciones de más de cuatro semanas, la empresa debe informar por escrito, antes del inicio, de la jornada y su distribución, de cómo se modifica (incluidos los cambios de turno) y de los acuerdos sobre horas extra ([arts. 2.2, 3.2.g y 7.1](${RD_723}#a3)). En los contratos vigentes a esa fecha, la empresa la entrega a quien la pida en 30 días hábiles.`,
      refs: [{ label: 'Real Decreto 723/2026, de 9 de septiembre (BOE núm. 228, de 15/09/2026)', url: `${RD_723}#a3`, date: VERIFIED, kind: 'norma' }],
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Horas extraordinarias: tope, voluntariedad y cómputo', id: 'horas-extra' },
    {
      type: 'paragraph',
      text: `Son [[horas extraordinarias]] las que superan la duración máxima de la jornada ordinaria, que fija el convenio o el contrato sin pasar del límite legal: 40 horas semanales de promedio en cómputo anual ([arts. 34.1](${ET}#a34) y [35.1 ET](${ET}#a35)). El convenio o, en su defecto, el contrato decide si se pagan (nunca por debajo del valor de la hora ordinaria) o se compensan con descanso retribuido; sin pacto, se compensan con descanso en los cuatro meses siguientes ([art. 35.1 ET](${ET}#a35)).`,
    },
    {
      type: 'list',
      items: [
        `**Tope de 80 al año**, reducido en la misma proporción si la jornada anual del contrato es inferior a la general de la empresa ([art. 35.2 ET](${ET}#a35)).`,
        '**No computan** las compensadas con descanso en los cuatro meses siguientes ni las trabajadas para prevenir o reparar siniestros y otros daños extraordinarios y urgentes, que se compensan igualmente como extra (art. 35.2 y 35.3).',
        '**Son voluntarias**, salvo pacto en convenio o contrato y siempre dentro del tope (art. 35.4). Según el Ministerio, las de fuerza mayor sí pueden exigirse.',
        `**Control.** Resumen con la nómina (art. 35.5) e información mensual a la representación legal ([RD 1561/1995, disp. adicional 3.ª](${RD_1561}#datercera)).`,
        `**Tiempo parcial.** No caben, salvo siniestros: se usan [[horas complementarias]] ([art. 12.4.c y 12.5 ET](${ET}#a12)).`,
      ],
    },
    {
      type: 'table',
      caption: 'Horas complementarias: las dos vías del art. 12.5 ET',
      columns: ['Aspecto', 'Pactadas', 'Voluntarias'],
      rows: [
        ['Contrato', 'Parcial de al menos 10 h semanales (cómputo anual)', 'Solo indefinido de al menos 10 h semanales'],
        ['Forma', 'Pacto escrito; la empresa puede exigirlas', 'La empresa las ofrece; la persona decide'],
        ['Límite', '30 % de las horas ordinarias (convenio: del 30 % al 60 %)', '15 % (convenio: hasta el 30 %)'],
        ['Preaviso', '3 días, salvo que el convenio fije menos', 'Sin plazo legal'],
        ['Negativa', 'No sancionable si la empresa incumple las reglas del pacto', 'Nunca sancionable'],
      ],
    },
    {
      type: 'paragraph',
      text: `Ambas se pagan como ordinarias ([art. 12.5.i ET](${ET}#a12)), y la suma con las horas ordinarias debe quedar por debajo de la jornada a tiempo completo comparable ([art. 12.4.c ET](${ET}#a12)).`,
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Desconexión digital y control de dispositivos', id: 'desconexion-dispositivos' },
    {
      type: 'paragraph',
      text: `Toda la plantilla, no solo quien teletrabaja, tiene derecho a la [[desconexión digital]] ([art. 20 bis ET](${ET}#a2-2); [art. 88 LOPDGDD](${LOPDGDD}#a8-10)). Sus modalidades se pactan en el convenio o con la representación legal, y la empresa debe elaborar, previa audiencia de esta, una política interna que incluya a los directivos y prevea formación frente a la fatiga informática.`,
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'desconexión digital',
      text: 'Es el derecho a que, fuera del tiempo de trabajo, se respeten el descanso, los permisos, las vacaciones y la intimidad personal y familiar. La ley **no prohíbe enviar un mensaje**, pero la persona tiene derecho a no atenderlo fuera de su jornada. Si contesta y trabaja, ese tiempo es jornada: se registra y puede dar lugar a horas extra.',
      refs: [{ label: 'Ley Orgánica 3/2018 (LOPDGDD), art. 88', url: `${LOPDGDD}#a8-10`, date: VERIFIED, kind: 'norma' }],
    },
    {
      type: 'paragraph',
      text: `Si alguien trabaja a distancia al menos el 30 % de su jornada en un periodo de tres meses, la [Ley 10/2021](${LTD}#a1) añade el deber de limitar el uso de las herramientas de comunicación durante los descansos y de respetar la jornada máxima ([art. 18](${LTD}#a1-10)).`,
    },
    {
      type: 'paragraph',
      text: `Con el correo y el ordenador, la empresa solo puede acceder al contenido para controlar el cumplimiento laboral o la integridad de los equipos. Antes debe fijar unos [[criterios de utilización]], con participación de la representación legal, e informar de ellos a la plantilla ([art. 87 LOPDGDD](${LOPDGDD}#a8-9)). Además, el TEDH pide ponderar los factores del [[test Bărbulescu]] ([STEDH de 5/9/2017, § 121](${BARBULESCU})). El Constitucional avaló el control cuando el convenio sancionaba el uso extralaboral del correo ([STC 170/2013](${STC_170})), y la prueba obtenida vulnerando derechos fundamentales no se admite ([art. 90.2 LRJS](${LRJS}#a90)).`,
    },
    { type: 'paragraph', text: 'Antes de abrir un buzón corporativo, comprueba:' },
    {
      type: 'list',
      ordered: true,
      items: [
        '¿Hay criterios de uso informados **antes**, con aviso de que puede haber controles?',
        '¿Existe un motivo concreto, no una sospecha genérica?',
        '¿Basta con revisar el flujo (remitentes, fechas, volumen) en lugar del contenido?',
        '¿El acceso está limitado en tiempo y personas, y queda documentado?',
        '¿El resultado se usará solo para el fin declarado?',
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Sin criterios previos, no abras el contenido',
      text: `Un acceso desproporcionado puede invalidar la prueba y constituir una infracción muy grave, con multa de 7.501 a 225.018 € ([arts. 8.11 y 40.1.c LISOS](${LISOS}#a8)), además de una posible sanción de la Agencia Española de Protección de Datos. Preserva las evidencias técnicas y aprueba e informa ya los criterios de uso.`,
      refs: [
        { label: 'Ley Orgánica 3/2018 (LOPDGDD), art. 87', url: `${LOPDGDD}#a8-9`, date: VERIFIED, kind: 'norma' },
        { label: 'STEDH (Gran Sala) Bărbulescu c. Rumanía, de 5 de septiembre de 2017, n.º 61496/08', url: BARBULESCU, date: VERIFIED, kind: 'jurisprudencia' },
        { label: 'LISOS, arts. 8.11 y 40.1', url: `${LISOS}#a40`, date: VERIFIED, kind: 'norma' },
        { label: 'Reglamento (UE) 2016/679 (RGPD), art. 83.5', url: RGPD, date: '2026-10-29', kind: 'norma' },
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'tarjetas-verdad',
        title: '¿Legal o ilegal?',
        cards: [
          {
            claim: 'Si hay un pico de trabajo, la empresa puede exigir horas extra aunque no estén pactadas.',
            verdict: 'falso',
            explanation: 'Son voluntarias salvo pacto en convenio o contrato, y siempre dentro del tope (art. 35.4 ET). Según el Ministerio, sin pacto solo pueden exigirse las de fuerza mayor.',
          },
          {
            claim: 'La empresa puede cambiar el horario habitual de una persona de un día para otro.',
            verdict: 'depende',
            explanation: 'Un ajuste menor puede entrar en el poder de dirección. Un cambio sustancial exige causas probadas y, si es individual, 15 días de preaviso (art. 41 ET), y la distribución irregular, 5 días (art. 34.2 ET). En relaciones de más de cuatro semanas, el cambio se comunica además por escrito, a más tardar el día en que surte efecto (RD 723/2026, arts. 5 y 7.3).',
          },
          {
            claim: 'La empresa puede leer el correo profesional de una persona trabajadora.',
            verdict: 'depende',
            explanation: 'Solo para controlar el cumplimiento laboral o la integridad del equipo, con criterios de uso informados antes y de forma proporcionada (art. 87 LOPDGDD y test Bărbulescu). Ser la titular de la cuenta no basta.',
          },
          {
            claim: 'Escribir a la plantilla fuera de horario está prohibido por la ley.',
            verdict: 'falso',
            explanation: 'La ley no lo prohíbe con carácter general, aunque el convenio o la política interna pueden limitarlo. Lo que garantiza es el derecho a no atender el mensaje fuera de la jornada (art. 88 LOPDGDD); si la persona contesta y trabaja, ese tiempo se registra.',
          },
        ],
      },
      caption: 'Decide si cada práctica es legal antes de ver la respuesta.',
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Sanciones y situación normativa a 28/10/2026', id: 'sanciones-situacion' },
    {
      type: 'paragraph',
      text: `No registrar la jornada o incumplir las normas sobre horas extra, horas complementarias o descansos es una infracción grave ([art. 7.5 LISOS](${LISOS}#a7)); los actos contrarios a la intimidad y la dignidad, muy grave ([art. 8.11](${LISOS}#a8)).`,
    },
    {
      type: 'table',
      caption: 'Multas en materia de relaciones laborales (art. 40.1 LISOS)',
      columns: ['Calificación', 'Grado mínimo', 'Grado medio', 'Grado máximo'],
      rows: [
        ['Grave: registro, horas extra y complementarias', '751 a 1.500 €', '1.501 a 3.750 €', '3.751 a 7.500 €'],
        ['Muy grave: intimidad y dignidad', '7.501 a 30.000 €', '30.001 a 120.005 €', '120.006 a 225.018 €'],
      ],
      numeric: [1, 2, 3],
    },
    {
      type: 'paragraph',
      text: `El grado depende, entre otros criterios, de la intencionalidad, de las advertencias previas de la Inspección y del número de afectados ([art. 39.2](${LISOS}#a39)). A diferencia de la contratación temporal en fraude ([art. 7.2](${LISOS}#a7)), el art. 7.5 no cuenta una infracción por persona: no registrar a seis personas no supone seis infracciones, y el número de afectados sirve para graduar la multa.`,
    },
    {
      type: 'widget',
      widget: {
        kind: 'linea-tiempo',
        title: 'Hitos normativos del registro y la desconexión',
        items: [
          { date: '2017-09-05', title: 'STEDH Bărbulescu (Gran Sala)', text: 'Factores para valorar el control de las comunicaciones.', tone: 'hito' },
          { date: '2018-12-07', title: 'Entra en vigor la LOPDGDD', text: 'Arts. 87 y 88 y nuevo art. 20 bis ET.', tone: 'hito' },
          { date: '2019-05-12', title: 'Registro diario obligatorio', text: 'Art. 34.9 ET, añadido por el RDL 8/2019.', tone: 'hito' },
          { date: '2019-05-14', title: 'STJUE C-55/18', text: 'Sistema objetivo, fiable y accesible.', tone: 'hito' },
          { date: '2021-07-11', title: 'Entra en vigor la Ley 10/2021', text: 'Desconexión en el trabajo a distancia.', tone: 'hito' },
          { date: '2025-09-10', title: 'El Congreso devuelve al Gobierno el proyecto de 37,5 horas', text: 'La jornada máxima legal sigue siendo de 40 horas semanales.', tone: 'hito' },
          { date: '2025-10-09', title: 'Proyecto de RD de registro de jornada', text: 'Audiencia pública hasta el 20/10/2025.', tone: 'pendiente' },
          { date: '2026-10-05', title: 'Entra en vigor el RD 723/2026', text: 'Información escrita sobre jornada y horas extra.', tone: 'hito' },
          { date: '2026-10-28', title: 'Fecha de esta formación', text: 'El registro digital sigue sin publicarse en el BOE.', tone: 'pendiente' },
        ],
      },
      caption: 'Fechas comprobadas en fuentes oficiales a 28/10/2026.',
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso resuelto: una startup ante la Inspección', id: 'caso-resuelto' },
    { type: 'paragraph', text: 'Aplica lo visto a un cliente con varios frentes abiertos a la vez.' },
    {
      type: 'example',
      title: 'NubeÁgil, S.L.: registro, horas extra y desconexión',
      scenario:
        'Startup de software con seis personas y sin representación legal (caso ficticio); su convenio no modifica las reglas legales. Jornada completa: 40 h semanales; jornada anual general: 1.760 h. **Bruno**, indefinido a jornada completa, ha hecho 95 horas extra en 2026: cobró 60 y descansó 35, pero 8 de ellas, trabajadas el 15 de junio, las descansó el 20 de octubre. **Carla** tiene un temporal de seis meses a jornada completa (880 h). **Fran** trabaja 20 h semanales con contrato indefinido. **David** teletrabaja tres de cinco días y recibe mensajes a las 22:30. El socio quiere leer el correo de **Ana** y no hay criterios de uso.',
      steps: [
        {
          label: '**Registro.** Sustituye la hoja mensual por un registro diario de las seis personas, con el sistema documentado.',
          formula: 'Registro de octubre de 2026 + 4 años',
          result: 'Se conserva hasta octubre de 2030',
        },
        {
          label: '**Bruno.** ¿Salen del cómputo las 8 horas descansadas en octubre?',
          formula: '15/06/2026 + 4 meses = 15/10/2026 < 20/10/2026',
          result: 'No: fuera de plazo, computan',
        },
        {
          label: '**Bruno.** Calcula las horas que cuentan para el tope.',
          formula: '95 h − (35 h − 8 h) = 68 h',
          result: '68 h ≤ 80 h: le quedan 12 h computables en 2026',
        },
        {
          label: '**Carla.** Reduce el tope en proporción a su jornada.',
          formula: '80 h × 880 h / 1.760 h',
          result: '40 h',
        },
        {
          label: '**Fran.** No puede hacer horas extra: calcula su margen de complementarias pactadas (30 %) y voluntarias (15 %).',
          formula: '1.760 h × 20/40 = 880 h · 880 h × 30 % = 264 h · 880 h × 15 % = 132 h',
          result: 'Hasta 1.276 h al año, por debajo de 1.760 h',
        },
        {
          label: '**David.** ¿Su teletrabajo es regular? Si contesta a las 22:30, ese tiempo se registra como jornada.',
          formula: '3 días / 5 días = 60 % ≥ 30 %',
          result: 'Sí: se aplica el art. 18 de la Ley 10/2021',
        },
        {
          label: '**Ana.** Aplica la lista de comprobación antes de abrir su buzón.',
          formula: 'Criterios previos: no · Motivo concreto: sí · ¿Hay una medida menos invasiva?: sí',
          result: 'No abrir el contenido todavía',
        },
      ],
      conclusion:
        'El riesgo inmediato es la falta de registro: infracción grave, de 751 a 7.500 €. Bruno está dentro del tope y Carla no puede pasar de 40 horas extra computables. Deja por escrito el sistema de registro, la política de desconexión y los criterios de uso; si el socio abre hoy el correo de Ana, la prueba puede no servir y el riesgo pasa a muy grave.',
    },
  ],
  keyTerms: [
    {
      term: 'registro diario de jornada',
      definition: `Anotación diaria, por persona, de la hora de inicio y de fin de la jornada; se conserva cuatro años ([art. 34.9 ET](${ET}#a34)).`,
    },
    {
      term: 'horas extraordinarias',
      definition: `Las trabajadas por encima de la duración máxima de la jornada ordinaria; tope general de 80 al año ([art. 35 ET](${ET}#a35)).`,
    },
    {
      term: 'horas complementarias',
      definition: `Las que se añaden a las ordinarias en un contrato a tiempo parcial, pactadas o voluntarias; se pagan como ordinarias ([art. 12.5 ET](${ET}#a12)).`,
    },
    {
      term: 'desconexión digital',
      definition: `Derecho a que, fuera del tiempo de trabajo, se respeten el descanso, los permisos, las vacaciones y la intimidad ([art. 88 LOPDGDD](${LOPDGDD}#a8-10)).`,
    },
    {
      term: 'criterios de utilización',
      definition: `Normas de uso de los dispositivos de la empresa, informadas a la plantilla antes de cualquier control ([art. 87.3 LOPDGDD](${LOPDGDD}#a8-9)).`,
    },
    {
      term: 'test Bărbulescu',
      definition: `Factores del TEDH para valorar un control de comunicaciones: aviso previo, alcance, motivo, alternativas menos invasivas, consecuencias y garantías ([§ 121](${BARBULESCU})).`,
    },
  ],
  takeaway:
    'El registro diario de jornada es obligatorio para toda la plantilla, en papel o en digital si es fiable; el registro digital obligatorio aún es un proyecto. Las horas extra son voluntarias salvo pacto, con un tope de 80 al año, y la desconexión y el control del correo exigen reglas previas y proporcionadas.',
  sources: [
    { label: 'Estatuto de los Trabajadores, art. 34 (jornada y registro)', url: `${ET}#a34`, date: VERIFIED, kind: 'norma' },
    { label: 'Estatuto de los Trabajadores, art. 35 (horas extraordinarias)', url: `${ET}#a35`, date: VERIFIED, kind: 'norma' },
    { label: 'Estatuto de los Trabajadores, art. 12 (tiempo parcial y horas complementarias)', url: `${ET}#a12`, date: VERIFIED, kind: 'norma' },
    { label: 'Estatuto de los Trabajadores, art. 20 bis (intimidad y desconexión)', url: `${ET}#a2-2`, date: VERIFIED, kind: 'norma' },
    { label: 'Estatuto de los Trabajadores, art. 41 (modificaciones sustanciales)', url: `${ET}#a41`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto-ley 8/2019, de 8 de marzo, disp. final 6.ª (aplicación del registro)', url: `${RDL_8_2019}#df-6`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley Orgánica 3/2018 (LOPDGDD), arts. 87 y 88', url: `${LOPDGDD}#a8-9`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley 10/2021, de 9 de julio, de trabajo a distancia, arts. 1 y 18', url: `${LTD}#a1-10`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 723/2026, de 9 de septiembre (información sobre el contrato)', url: RD_723, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto 1561/1995, disp. adicional 3.ª (información de horas extra)', url: `${RD_1561}#datercera`, date: VERIFIED, kind: 'norma' },
    { label: 'Real Decreto Legislativo 5/2000 (LISOS), arts. 7, 8, 39 y 40', url: `${LISOS}#a7`, date: VERIFIED, kind: 'norma' },
    { label: 'Ley 36/2011, reguladora de la jurisdicción social, art. 90.2', url: `${LRJS}#a90`, date: VERIFIED, kind: 'norma' },
    { label: 'STJUE (Gran Sala) de 14 de mayo de 2019, asunto C-55/18, CCOO/Deutsche Bank', url: STJUE_C55, date: VERIFIED, kind: 'jurisprudencia' },
    { label: 'STEDH (Gran Sala) Bărbulescu c. Rumanía, de 5 de septiembre de 2017', url: BARBULESCU, date: VERIFIED, kind: 'jurisprudencia' },
    { label: 'STC 170/2013, de 7 de octubre', url: STC_170, date: VERIFIED, kind: 'jurisprudencia' },
    { label: 'Ministerio de Trabajo: Guía sobre el registro de jornada', url: GUIA, date: VERIFIED, kind: 'criterio' },
    { label: 'Ministerio de Trabajo: audiencia pública del proyecto de RD de registro de jornada (octubre de 2025)', url: PARTICIPA, date: VERIFIED, kind: 'documento' },
    { label: 'Congreso de los Diputados: votación de 10/09/2025 de las enmiendas de totalidad de devolución al proyecto de ley de reducción de la jornada (178 votos a favor y 170 en contra)', url: VOTACION_37_5, date: '2026-10-29', kind: 'documento' },
    { label: 'Reglamento (UE) 2016/679, general de protección de datos (RGPD), art. 83.5', url: RGPD, date: '2026-10-29', kind: 'norma' },
  ],
  quiz: {
    id: 'lab-02-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'lab-02-q1',
        prompt: 'Una pyme de seis personas, sin representación legal, te pregunta qué le exige **hoy (28/10/2026)** la ley sobre el registro de jornada. ¿Qué le respondes?',
        options: [
          {
            id: 'a',
            text: 'Implantar un sistema digital, porque el RD 723/2026 ya ha prohibido el registro en papel.',
            feedback: 'El RD 723/2026 regula la información escrita sobre el contrato, no el registro. El registro digital obligatorio es un proyecto que no se ha publicado en el BOE.',
          },
          {
            id: 'b',
            text: 'Registrar solo las horas extraordinarias de cada persona, totalizarlas cada mes y conservarlas dos años.',
            feedback: 'Confunde el registro de horas extra (art. 35.5 ET) con el registro diario de toda la jornada (art. 34.9 ET), que además se conserva cuatro años.',
          },
          {
            id: 'c',
            text: 'Registrar a diario el inicio y el fin de la jornada de cada persona y conservar los registros cuatro años a disposición de la plantilla y de la Inspección.',
          },
          {
            id: 'd',
            text: 'Nada por ahora: sin representación legal no puede organizarse el sistema, así que la obligación queda en suspenso.',
            feedback: 'Sin convenio ni representación, el registro lo organiza la propia empresa: la obligación existe en todo caso.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'Es lo que exige el art. 34.9 ET: registro diario con el horario concreto de inicio y de fin de cada persona, conservado cuatro años y a disposición de la plantilla, de su representación y de la Inspección. Si no hay convenio ni representación, el sistema lo organiza y documenta la empresa.',
        ref: 'Apartado 1, «Registro diario: qué exige hoy el art. 34.9 ET»',
      },
      {
        id: 'lab-02-q2',
        prompt: 'Laia, con contrato indefinido a jornada completa desde 2020, ha hecho 90 horas extra en 2026: se le han pagado 70 y las otras 20 se han compensado con descanso dentro de los cuatro meses siguientes. No ha habido siniestros. ¿Ha superado el tope legal?',
        options: [
          {
            id: 'a',
            text: 'Sí, porque ha hecho 90 horas y el máximo es de 80 al año.',
            feedback: 'No computan para el tope las horas compensadas con descanso dentro de los cuatro meses siguientes a su realización (art. 35.2 ET).',
          },
          { id: 'b', text: 'No, porque computan 70 horas, por debajo del tope de 80.' },
          {
            id: 'c',
            text: 'No, porque el tope de 80 horas solo se aplica si el convenio lo recoge.',
            feedback: 'El tope lo fija la ley (art. 35.2 ET) y se aplica con convenio o sin él.',
          },
          {
            id: 'd',
            text: 'Sí, porque las horas compensadas con descanso solo se descuentan si lo prevé el contrato.',
            feedback: 'La exclusión la establece la ley (art. 35.2 ET) y no depende de lo que diga el contrato.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'El art. 35.2 ET excluye del cómputo las horas compensadas con descanso dentro de los cuatro meses siguientes a su realización: 90 − 20 = 70 horas, por debajo de 80.',
        ref: 'Apartado 2, «Horas extraordinarias: tope, voluntariedad y cómputo»',
      },
      {
        id: 'lab-02-q3',
        prompt: 'El socio de una startup sospecha que un desarrollador filtra código y quiere leer hoy su correo corporativo. La empresa nunca ha fijado ni comunicado criterios de uso de los dispositivos. ¿Qué le aconsejas?',
        options: [
          {
            id: 'a',
            text: 'Que lo lea ya: la cuenta y el ordenador son de la empresa, así que no hay intimidad que proteger.',
            feedback: 'Ser titular del equipo no elimina el derecho a la intimidad en su uso (art. 87.1 LOPDGDD y art. 20 bis ET).',
          },
          {
            id: 'b',
            text: 'Que lo lea solo después de pedir autorización a la Agencia Española de Protección de Datos.',
            feedback: 'La ley no prevé una autorización previa de la AEPD: exige criterios de utilización previos e informados y una medida proporcionada.',
          },
          {
            id: 'c',
            text: 'Que renuncie: el correo corporativo no puede controlarse nunca, por el secreto de las comunicaciones.',
            feedback: 'El control es posible para verificar el cumplimiento laboral o la integridad de los equipos, con criterios previos e informados y de forma proporcionada (art. 87 LOPDGDD).',
          },
          {
            id: 'd',
            text: 'Que no abra el contenido todavía: sin criterios de uso previos e informados, el acceso es de alto riesgo.',
          },
        ],
        correctOptionId: 'd',
        explanation:
          'El art. 87 LOPDGDD limita el acceso al control del cumplimiento laboral o de la integridad de los equipos y exige criterios de utilización informados a la plantilla. El test Bărbulescu pide aviso previo y claro, motivo legítimo y medios menos invasivos, y la prueba obtenida vulnerando derechos fundamentales no se admite (art. 90.2 LRJS). Lo prudente es preservar las evidencias y aprobar e informar los criterios.',
        ref: 'Apartado 3, «Desconexión digital y control de dispositivos»',
      },
    ],
  },
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-cristina-sebastian',
    publishedAt: '2026-10-20T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: VERIFIED,
};

/** Banco de 4 preguntas adicionales para la evaluación sectorial. */
export const bank: QuizQuestion[] = [
  {
    id: 'lab-02-b1',
    prompt: 'Fran trabaja 20 horas semanales con contrato indefinido y la empresa necesita más horas suyas en campaña. Ningún convenio modifica las reglas legales. ¿Qué vía es legal?',
    options: [
      {
        id: 'a',
        text: 'Horas complementarias: las pactadas por escrito, hasta el 30 % de sus horas ordinarias y con 3 días de preaviso como mínimo, y además las voluntarias, hasta el 15 %.',
      },
      {
        id: 'b',
        text: 'Horas extraordinarias, con el mismo tope anual de 80 horas que el resto de la plantilla.',
        feedback: 'A tiempo parcial no caben horas extra, salvo las de siniestros y otros daños urgentes (art. 12.4.c ET).',
      },
      {
        id: 'c',
        text: 'Exigirle horas complementarias sin pacto escrito, siempre que se le paguen con el recargo de las horas extra.',
        feedback: 'Solo pueden exigirse las complementarias pactadas por escrito (art. 12.5.a ET), y un recargo no suple el pacto. Las voluntarias no necesitan pacto, pero Fran puede rechazarlas sin sanción (art. 12.5.g ET).',
      },
      {
        id: 'd',
        text: 'Ninguna: solo puede ampliarse su tiempo de trabajo convirtiendo el contrato a jornada completa.',
        feedback: 'Existen las horas complementarias y, además, la conversión a jornada completa es siempre voluntaria para la persona (art. 12.4.e ET).',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'A tiempo parcial, la ampliación se hace con horas complementarias (art. 12.5 ET). Como Fran es indefinido y trabaja al menos 10 horas semanales, caben las pactadas y las voluntarias; sin convenio que lo modifique, rigen el 30 %, el 15 % y el preaviso de 3 días. Ambas se pagan como ordinarias, y la suma con sus horas ordinarias no puede alcanzar la jornada completa (art. 12.4.c ET).',
    ref: 'Apartado 2, «Horas extraordinarias: tope, voluntariedad y cómputo»',
  },
  {
    id: 'lab-02-b2',
    prompt: 'Un cliente con 25 personas y un delegado de personal te pregunta qué le obliga a hacer el art. 88 LOPDGDD en materia de desconexión digital. ¿Qué es correcto?',
    options: [
      {
        id: 'a',
        text: 'Nada: la desconexión digital es una recomendación sin obligaciones para la empresa.',
        feedback: 'Es un derecho legal de la plantilla (art. 88.1 LOPDGDD y art. 20 bis ET) con obligaciones concretas para la empresa.',
      },
      {
        id: 'b',
        text: 'Solo debe actuar si tiene personas en teletrabajo, porque el derecho nace de la Ley 10/2021.',
        feedback: 'El derecho es de toda la plantilla; la Ley 10/2021 lo refuerza en el trabajo a distancia, pero no lo crea.',
      },
      {
        id: 'c',
        text: 'Elaborar, previa audiencia del delegado, una política interna para toda la plantilla, directivos incluidos, con formación y sensibilización.',
      },
      {
        id: 'd',
        text: 'Prohibir el envío de correos y mensajes de trabajo fuera del horario de cada persona.',
        feedback: 'La ley vigente no impone una prohibición general de envío: garantiza el descanso y obliga a aprobar una política interna.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Es lo que exige el art. 88.3 LOPDGDD: una política interna, previa audiencia de la representación legal, dirigida también a quienes ocupan puestos directivos, que defina cómo se ejerce el derecho e incluya acciones de formación y sensibilización frente a la fatiga informática.',
    ref: 'Apartado 3, «Desconexión digital y control de dispositivos»',
  },
  {
    id: 'lab-02-b3',
    prompt: 'La Inspección comprueba que una empresa de seis personas no lleva registro de jornada de nadie. Según la LISOS vigente a 28/10/2026, ¿qué consecuencia es correcta?',
    options: [
      {
        id: 'a',
        text: 'Una infracción leve, con multa de 70 a 750 €.',
        feedback: 'El registro de jornada figura expresamente entre las infracciones graves (art. 7.5 LISOS).',
      },
      {
        id: 'b',
        text: 'Una infracción grave, con multa de 751 a 7.500 € según su grado, que tiene en cuenta, entre otros criterios, el número de personas afectadas.',
      },
      {
        id: 'c',
        text: 'Seis infracciones graves, una por cada persona afectada, con multa de 751 a 7.500 € cada una.',
        feedback: 'El art. 7.5 no cuenta una infracción por persona, a diferencia del art. 7.2 para la contratación temporal en fraude: el número de afectados sirve para graduar la multa.',
      },
      {
        id: 'd',
        text: 'Una infracción muy grave, con multa de 7.501 a 225.018 €.',
        feedback: 'Las cuantías muy graves corresponden a otros tipos, como los actos contrarios a la intimidad y la dignidad (art. 8.11 LISOS), no a la falta de registro.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'El art. 7.5 LISOS califica como grave la transgresión de las normas sobre registro de jornada; el art. 40.1.b fija una multa de 751 a 7.500 € en tres grados, y el art. 39.2 incluye el número de personas afectadas entre los criterios de graduación.',
    ref: 'Apartado 4, «Sanciones y situación normativa a 28/10/2026»',
  },
  {
    id: 'lab-02-b4',
    prompt: 'Un cliente contratará el 2 de noviembre de 2026 a una persona durante seis meses. El contrato escrito no dice nada sobre horas extra ni sobre cambios de turno. ¿Qué exige el RD 723/2026?',
    options: [
      {
        id: 'a',
        text: 'Nada: el RD 723/2026 regula el registro digital de jornada, que todavía no está en vigor.',
        feedback: 'El RD 723/2026 no regula el registro: desarrolla el art. 8.5 ET sobre la información de los elementos esenciales del contrato y está en vigor desde el 5 de octubre de 2026.',
      },
      {
        id: 'b',
        text: 'Solo debe entregar esa información si la persona la pide, en un plazo de 30 días hábiles.',
        feedback: 'Esa regla se aplica a las relaciones que ya existían el 5 de octubre de 2026 (disposición transitoria única). En las nuevas, la información se da antes del inicio.',
      },
      {
        id: 'c',
        text: 'Basta con decirle de palabra que se aplica «el convenio del sector», sin más detalle.',
        feedback: 'La información debe darse por escrito (art. 3.1) y la remisión al convenio solo vale si es precisa y permite identificarlo (arts. 3.2.o y 3.3).',
      },
      {
        id: 'd',
        text: 'Informarla por escrito, antes del inicio, de la jornada y su distribución, de cómo se modifica, incluidos los cambios de turno, y de los acuerdos sobre horas extra.',
      },
    ],
    correctOptionId: 'd',
    explanation:
      'El capítulo II del RD 723/2026 se aplica a las relaciones de más de cuatro semanas (art. 2.2). La información sobre tiempo de trabajo del art. 3.2.g debe facilitarse por escrito antes del inicio (art. 7.1) y, si el contrato no la recoge, en uno o varios documentos escritos (art. 6.1).',
    ref: 'Apartado 1, «El RD 723/2026 no regula el registro»',
  },
];

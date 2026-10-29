import type { Formation, QuizQuestion } from '@flm/shared';

/* Fuentes primarias (BOE consolidado; anclas comprobadas el 28/10/2026). */
const LSC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544';
const TRLC = 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-4859';
const CCOM_36 = 'https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art36';
const CC_5 = 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763#art5';
const RDL_7_1996 = 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-13002#a20';
const ICAC_2019 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2019-3422';
const RDL_7_2026 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-6544#a3-2';
const CONVALIDACION_RDL_7_2026 = 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-7125';
const RDL_1_2025 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2025-1560#a2';
const LEY_28_2022 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-21739#a1-5';
const LEY_3_2020 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-10923#a1-5';
const PGC_118 = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#grupo1-2';

const CONSULTA = '2026-10-28';

export const formation: Formation = {
  id: 'mer-02',
  slug: 'perdidas-causa-de-disolucion',
  area: 'mercantil',
  title: 'Pérdidas y causa de disolución: cálculo, plazos y soluciones',
  intro:
    'Cierras el tercer trimestre de una S.L. cliente con 60.000 € de capital y compruebas que las pérdidas han dejado su patrimonio neto en 24.000 €, por debajo de la mitad del capital. Desde que concurre esa causa, la administradora tiene dos meses para convocar la junta; si no lo hace, responderá con su propio patrimonio de las deudas sociales posteriores. Detectarlo en el cierre y proponer a tiempo una salida evita la disolución y esa responsabilidad.',
  summary:
    'Cuándo obligan las pérdidas a disolver, qué patrimonio neto cuenta, qué plazos corren para el administrador y cómo sacar a la sociedad de la causa a tiempo.',
  coverTerm: '½ capital',
  readingMinutes: 11,
  outcomes: [
    'Calcular el patrimonio neto a efectos de disolución, con préstamos participativos y exclusiones vigentes, y determinar si la sociedad está en causa y cuánto le falta para salir.',
    'Identificar los plazos para convocar la junta y pedir la disolución judicial, la responsabilidad del administrador que no los cumple y cuándo la vía es el concurso.',
    'Decidir y cuantificar la medida adecuada para eliminar la causa: aportación de socios, préstamo participativo, aumento o reducción de capital.',
  ],
  blocks: [
    /* ── 1 · La prueba ─────────────────────────────────────────────────── */
    { type: 'heading', text: 'La prueba: patrimonio neto frente a la mitad del capital', id: 'la-prueba' },
    {
      type: 'paragraph',
      text: `La sociedad de capital debe disolverse por «pérdidas que dejen reducido el patrimonio neto a una cantidad inferior a la mitad del capital social, a no ser que éste se aumente o se reduzca en la medida suficiente, y siempre que no sea procedente solicitar la declaración de concurso» ([art. 363.1.e) LSC](${LSC}#a363)). Es la [[causa de disolución por pérdidas]].`,
    },
    {
      type: 'paragraph',
      text: 'Es una prueba de balance, no de caja: una sociedad puede pagar puntualmente y estar en causa. Tampoco espera al cierre del ejercicio: si un balance intermedio la revela, la causa ya existe. Y la ley dice «inferior»: si el [[patrimonio neto a efectos de disolución]] es exactamente la mitad del capital, no hay causa.',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'patrimonio neto a efectos de disolución',
      text: `Es el que se compara con la mitad del capital, y no siempre coincide con el del balance. El [art. 36.1.c) del Código de Comercio](${CCOM_36}) le suma el capital suscrito no exigido y el capital (nominal y primas) registrado como pasivo, y descarta los ajustes por coberturas de flujos de efectivo pendientes. Los préstamos participativos también cuentan, aunque figuren en el pasivo ([art. 3.1 de la Resolución del ICAC de 5 de marzo de 2019](${ICAC_2019}#ar-3)).`,
    },
    {
      type: 'table',
      caption: 'Del patrimonio neto contable al que cuenta para disolver',
      columns: ['Partida', 'Tratamiento', 'Base'],
      rows: [
        ['Capital suscrito no exigido y capital registrado como pasivo', 'Se suman', `[Art. 36.1.c) CCom](${CCOM_36})`],
        ['Ajustes por coberturas de flujos de efectivo pendientes', 'Se descartan (si son negativos, el patrimonio neto sube)', `[Art. 36.1.c) CCom](${CCOM_36})`],
        ['Préstamos participativos', 'Se suman', `[Art. 20 RDL 7/1996](${RDL_7_1996}); [art. 3.1 Res. ICAC 2019](${ICAC_2019}#ar-3)`],
        ['Subvenciones no reintegrables', 'Se mantienen: solo se restan para repartir dividendos', `[Art. 28.2 Res. ICAC 2019](${ICAC_2019}#ar-28)`],
        ['Pérdidas de 2020 y 2021, y las de la DANA en sociedades afectadas', 'No cuentan hasta el cierre del ejercicio iniciado en 2026', `[Art. 30 RDL 7/2026](${RDL_7_2026}); [art. 2 RDL 1/2025](${RDL_1_2025})`],
      ],
    },

    /* ── 2 · Exclusiones y fin de la medida COVID ──────────────────────── */
    { type: 'heading', text: 'Exclusiones vigentes y fin de la medida COVID', id: 'exclusiones-y-fin-covid' },
    {
      type: 'paragraph',
      text: 'Antes de concluir que hay causa, comprueba estas exclusiones. Operan solo a efectos de la causa de disolución: las pérdidas siguen en las cuentas y el deber de pedir el concurso, que depende de la insolvencia, no cambia.',
    },
    {
      type: 'list',
      items: [
        `**Pérdidas de 2020 y 2021 (COVID):** no se toman en consideración «hasta el cierre del ejercicio que se inicie en el año 2026» ([art. 30 RDL 7/2026](${RDL_7_2026}), vigente desde el 22/03/2026 y [convalidado por el Congreso](${CONVALIDACION_RDL_7_2026}) el 26/03/2026).`,
        `**DANA de octubre y noviembre de 2024:** las sociedades afectadas excluyen las pérdidas que les causó hasta ese mismo cierre y las identifican en la memoria ([art. 2 RDL 1/2025](${RDL_1_2025})).`,
        `**Empresas emergentes certificadas por ENISA:** no incurren en esta causa hasta tres años después de su constitución, salvo que proceda el concurso ([art. 13 de la Ley 28/2022](${LEY_28_2022})).`,
      ],
    },
    {
      type: 'paragraph',
      text: 'La exclusión COVID, nacida en 2020 y prorrogada varias veces, ya tiene fecha de fin. En ejercicios naturales, el último cierre que la aplica es el de 31/12/2026: en los ejercicios que se inicien en 2027, esas pérdidas volverán a computar, salvo nueva prórroga. Con ejercicio no natural llega al cierre del iniciado en 2026 (por ejemplo, el 30/06/2027). La de la DANA acaba igual.',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Prepara ya a los clientes afectados',
      text: 'Si un cliente solo está fuera de la causa gracias a la exclusión, simula ya su patrimonio neto con esas pérdidas y planifica antes del cierre cómo cubrir el déficit.\n\nOjo con los huecos: el Congreso no convalidó tres prórrogas (RDL 9/2024, 16/2025 y 2/2026), lo que dejó periodos sin cobertura en 2025 y 2026. Si en ellos un cliente estuvo en causa solo por esas pérdidas, consúltalo con el área.',
      refs: [
        { label: 'Art. 30 del RDL 7/2026 (exclusión vigente)', url: RDL_7_2026, date: CONSULTA, kind: 'norma' },
        { label: 'Art. 13 de la Ley 3/2020 (origen de la medida)', url: LEY_3_2020, date: CONSULTA, kind: 'norma' },
      ],
    },

    /* ── 3 · Plazos y responsabilidad ──────────────────────────────────── */
    { type: 'heading', text: 'Plazos y responsabilidad de los administradores', id: 'plazos-y-responsabilidad' },
    {
      type: 'paragraph',
      text: `Cuando concurre la causa, los administradores deben convocar la junta en dos meses para que acuerde la disolución ([art. 365.1 LSC](${LSC}#a365)). El plazo corre desde que acaece la causa o, si el administrador se nombra después, desde que acepta el cargo ([art. 367.1 LSC](${LSC}#a367)), y se cuenta de fecha a fecha ([art. 5.1 del Código Civil](${CC_5})).`,
    },
    {
      type: 'paragraph',
      text: `Incluye en el orden del día la disolución y, como alternativa, las medidas para remover la causa, que la junta solo puede acordar si figuran en él ([art. 365.2 LSC](${LSC}#a365)). En la S.L., la disolución requiere mayoría ordinaria ([arts. 364](${LSC}#a364) y [198 LSC](${LSC}#a198)) y entre la convocatoria y la junta deben mediar al menos quince días ([art. 176 LSC](${LSC}#a176)); con todo el capital presente o representado y de acuerdo en celebrarla, cabe la junta universal ([art. 178 LSC](${LSC}#a178)).`,
    },
    {
      type: 'paragraph',
      text: `Si la junta no se constituye, o no acuerda la disolución ni la remoción de la causa, los administradores deben pedir la disolución judicial en otros dos meses, desde la fecha prevista para la junta o desde su celebración ([art. 366.2 LSC](${LSC}#a366)).`,
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Qué deudas alcanza el art. 367 LSC',
      text: 'Quien incumple cualquiera de los dos plazos responde **solidariamente** con la sociedad de las obligaciones sociales posteriores a la causa, incluidas las nacidas mientras corren los dos meses. Las reclamadas judicialmente se presumen posteriores, «salvo prueba en contrario». Esta [[responsabilidad solidaria del administrador]] no requiere que la sociedad esté en concurso.',
      refs: [{ label: 'Art. 367 LSC (redacción de la Ley 16/2022)', url: `${LSC}#a367`, date: CONSULTA, kind: 'norma' }],
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'No apures el plazo',
      text: 'Convoca en cuanto detectes la causa y usa los días hasta la junta para cerrar las medidas que la eliminarán. Si hay causa aun sin las pérdidas COVID o DANA, esas normas cuentan los dos meses «desde el cierre del ejercicio»; como no está claro cómo encaja con el art. 367, no esperes al cierre.',
      refs: [{ label: 'Art. 30 del RDL 7/2026, párrafo segundo', url: RDL_7_2026, date: CONSULTA, kind: 'norma' }],
    },
    {
      type: 'widget',
      widget: {
        kind: 'linea-tiempo',
        title: 'El reloj de los 2 + 2 meses',
        items: [
          {
            date: '2026-09-30',
            title: 'Acaece la causa (como tarde)',
            text: 'Patrimonio neto de 24.000 €, inferior a 30.000 €. Pudo surgir antes: revisa los cierres mensuales.',
            tone: 'hito',
          },
          { date: '2026-11-02', title: 'Convocatoria recomendada (sin apurar el plazo)', tone: 'hito' },
          {
            date: '2026-11-18',
            title: 'Junta general',
            text: `Quince días completos después de la convocatoria ([art. 176 LSC](${LSC}#a176)).`,
            tone: 'hito',
          },
          {
            date: '2026-11-30',
            title: 'Último día para convocar',
            text: `Dos meses de fecha a fecha. Sin convocatoria, la administradora responde de las deudas posteriores a la causa ([art. 367 LSC](${LSC}#a367)).`,
            tone: 'plazo',
          },
          {
            date: '2026-12-31',
            title: 'Último cierre con la exclusión COVID',
            text: 'Ejercicios naturales: en 2027 vuelven a computar las pérdidas de 2020 y 2021, salvo nueva prórroga.',
            tone: 'pendiente',
          },
          {
            date: '2027-01-18',
            title: 'Límite para pedir la disolución judicial',
            text: `Si la junta del 18/11/2026 no acuerda la disolución ni remueve la causa ([art. 366.2 LSC](${LSC}#a366)).`,
            tone: 'plazo',
          },
        ],
      },
      caption: 'Plazos del caso ALFA, S.L., que resolvemos en el último apartado.',
    },

    /* ── 4 · Insolvencia ───────────────────────────────────────────────── */
    { type: 'heading', text: 'Si además no puede pagar: concurso o negociaciones', id: 'insolvencia' },
    {
      type: 'paragraph',
      text: `La causa de disolución mira al balance; la insolvencia, a la caja. Hay [[insolvencia actual]] cuando la sociedad «no puede cumplir regularmente sus obligaciones exigibles» ([art. 2.3 TRLC](${TRLC}#a2)); entonces debe solicitar el concurso en los dos meses siguientes a conocerla o deber conocerla ([art. 5.1 TRLC](${TRLC}#a5)). Si no lo hace, el concurso se presume culpable, salvo prueba en contrario ([art. 444.1.º TRLC](${TRLC}#a4-56)), y, abierta la liquidación, los administradores pueden ser condenados a cubrir el déficit ([art. 456 TRLC](${TRLC}#a4-68)).`,
    },
    {
      type: 'paragraph',
      text: `Con probabilidad de insolvencia (horizonte de dos años), insolvencia inminente (tres meses) o actual, mientras no se admita un concurso necesario, el órgano de administración puede comunicar al juzgado negociaciones con los acreedores ([arts. 584](${TRLC}#a5-96) y [585 TRLC](${TRLC}#a5-97)). Mientras duren sus efectos (tres meses, prorrogables hasta otros tres; [art. 607 TRLC](${TRLC}#a6-19)), queda en suspenso el deber de acordar la disolución por pérdidas ([art. 613 TRLC](${TRLC}#a6-25)).`,
    },
    {
      type: 'paragraph',
      text: `Si los administradores solicitan el concurso o comunican negociaciones, no tienen que convocar la junta; si la comunicación deja de surtir efectos, deben convocarla en dos meses ([art. 365.3 LSC](${LSC}#a365)). Actuar dentro de los dos meses desde la causa evita la responsabilidad del art. 367, aunque, si no se alcanza un plan, ese plazo «se reanudará» ([art. 367.3 LSC](${LSC}#a367)): por prudencia, convoca en cuanto cesen los efectos.`,
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Disolver no sustituye al concurso',
      text: 'Si la sociedad no puede pagar con regularidad, disolverla no cumple el deber de solicitar el concurso. Y estar en causa de disolución no obliga, por sí solo, a pedirlo: revisa siempre balance y caja.',
      refs: [
        { label: 'Art. 5 TRLC (deber de solicitar el concurso)', url: `${TRLC}#a5`, date: CONSULTA, kind: 'norma' },
        { label: 'Art. 363.1.e) LSC (causa de disolución por pérdidas)', url: `${LSC}#a363`, date: CONSULTA, kind: 'norma' },
      ],
    },

    /* ── 5 · Soluciones y caso resuelto ────────────────────────────────── */
    { type: 'heading', text: 'Cómo salir de la causa: cálculo y caso resuelto', id: 'soluciones' },
    {
      type: 'paragraph',
      text: 'Calcula primero el déficit: **D = mitad del capital − patrimonio neto a efectos de disolución**. Si el dinero entra sin aumentar el capital —una [[aportación de socios]] a la cuenta 118 o un [[préstamo participativo]], nuevo o novando un préstamo de socio—, basta con D. Si aumentas el capital a la par, en dinero o compensando créditos, necesitas **2D**, porque el umbral sube la mitad de lo que entra.',
    },
    {
      type: 'paragraph',
      text: `Con prima, basta con que la mitad del nominal más la prima cubran D. La reducción de capital por pérdidas también debe ser de 2D y, en la S.L., exige agotar antes todas las reservas ([art. 322.1 LSC](${LSC}#a322)) y un balance de los seis meses anteriores, verificado por auditor y aprobado por la junta ([art. 323 LSC](${LSC}#a323)). Con patrimonio neto negativo hace falta dinero nuevo, a menudo con una operación acordeón: reducción a cero y aumento simultáneo ([art. 343 LSC](${LSC}#a343)).`,
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'préstamo participativo',
      text: `Préstamo con interés variable ligado a la evolución de la actividad del prestatario (puede añadirse uno fijo), que solo puede amortizarse anticipadamente si se compensa con una ampliación igual de los fondos propios y que cobra después de los acreedores comunes ([art. 20.Uno RDL 7/1996](${RDL_7_1996})). Sigue en el pasivo, pero suma al patrimonio neto a efectos de disolución.`,
    },
    {
      type: 'example',
      title: 'Caso resuelto: ALFA, S.L., a 30/09/2026',
      scenario:
        'ALFA, S.L. (sociedad ficticia) fabrica mobiliario. Capital: 60.000 €. Socias: A (70 %), administradora única, y B (30 %). Ejercicio natural, sin pérdidas en 2020 y 2021, fuera de la zona de la DANA y no es empresa emergente. Balance a 30/09/2026: capital, 60.000 €; reserva legal, 4.000 €; resultados negativos de 2024 y 2025, −28.000 €; pérdida de 2026 hasta septiembre, −15.000 €, y subvenciones de capital no reintegrables, 3.000 €. En el pasivo figura un préstamo ordinario de A de 10.000 € (interés fijo, vence en 2029). Paga sus deudas a su vencimiento.',
      steps: [
        { label: 'Umbral: la mitad del capital', formula: '60.000 × 50 %', result: '30.000 €' },
        { label: 'Patrimonio neto contable', formula: '60.000 + 4.000 − 28.000 − 15.000 + 3.000', result: '24.000 €' },
        {
          label: 'Ajustes: no hay capital no exigido ni registrado como pasivo, coberturas ni exclusiones; el préstamo ordinario de A no computa y las subvenciones se mantienen',
          formula: '24.000 + 0',
          result: '24.000 €',
        },
        { label: 'Comparación y déficit', formula: '24.000 < 30.000 → D = 30.000 − 24.000', result: 'En causa: D = 6.000 €' },
        { label: '¿Insolvencia? Paga con regularidad y su previsión a tres meses no muestra impagos', result: 'No: vía societaria (arts. 365 a 367 LSC)' },
        { label: 'Último día para convocar la junta', formula: '30/09/2026 + 2 meses, de fecha a fecha', result: '30/11/2026' },
        { label: 'Medida 1: novar el préstamo de A como participativo', formula: '24.000 + 10.000 = 34.000 ≥ 30.000', result: 'Sale de la causa (margen: 4.000 €)' },
        {
          label: 'Previsión a 31/12/2026 con 5.000 € de pérdida por trimestre (15.000 / 3)',
          formula: '24.000 − 5.000 + 10.000 = 29.000 < 30.000',
          result: 'Solo con el participativo, vuelve a la causa',
        },
        {
          label: 'Medida 2: aportación de 6.000 € a la cuenta 118, en proporción a la participación (A, 4.200 €; B, 1.800 €)',
          formula: '29.000 + 6.000 = 35.000 ≥ 30.000',
          result: 'Margen previsto al cierre: 5.000 €',
        },
      ],
      conclusion: `Propón convocar ya la junta (antes del 30/11/2026) con la disolución y, como alternativa, las dos medidas. Como A es administradora única y prestamista, debe comunicar el conflicto de interés a la junta, y conviene que esta autorice la novación ([arts. 229.3](${LSC}#a229) y [230.2 LSC](${LSC}#a230)). Con ambas medidas, el patrimonio neto a efectos de disolución sería de 40.000 € a 30/09/2026 y de unos 35.000 € al cierre. Vigílalo cada mes: a este ritmo, el margen se agota en el primer trimestre de 2027.`,
    },
    {
      type: 'table',
      caption: 'Caso ALFA: efecto de cada medida por separado (margen 0 = sale, sin colchón)',
      columns: ['Medida', 'Capital (€)', 'Umbral (€)', 'PN a efectos de disolución (€)', 'Margen (€)'],
      numeric: [1, 2, 3, 4],
      rows: [
        ['Situación a 30/09/2026', '60.000', '30.000', '24.000', '−6.000'],
        ['Aportación de socios de 6.000 € (D)', '60.000', '30.000', '30.000', '0'],
        ['Préstamo de 10.000 € novado como participativo', '60.000', '30.000', '34.000', '+4.000'],
        ['Capitalizar los 10.000 € a la par (error típico)', '70.000', '35.000', '34.000', '−1.000'],
        ['Aumento dinerario a la par de 12.000 € (2D)', '72.000', '36.000', '36.000', '0'],
        ['Reducción por pérdidas de 12.000 € (2D), tras aplicar la reserva legal', '48.000', '24.000', '24.000', '0'],
      ],
    },
    {
      type: 'paragraph',
      text: `Además, en la S.L. capitalizar exige un crédito totalmente líquido y exigible ([art. 301.1 LSC](${LSC}#a301)), y el de A vence en 2029; y la reducción no aporta dinero ni cambia el patrimonio neto ([art. 37 Res. ICAC 2019](${ICAC_2019}#ar-37)): solo rebaja el umbral.`,
    },
    {
      type: 'widget',
      widget: { kind: 'disolucion-perdidas', capital: 60000, patrimonioNeto: 24000, prestamoParticipativo: 10000 },
      caption: 'ALFA tras novar el préstamo como participativo: 34.000 € de patrimonio neto a efectos de disolución frente a un umbral de 30.000 €.',
    },
  ],
  keyTerms: [
    {
      term: 'causa de disolución por pérdidas',
      definition: `Supuesto del [art. 363.1.e) LSC](${LSC}#a363): pérdidas que dejan el patrimonio neto por debajo de la mitad del capital (si es justo la mitad, no hay causa), salvo que el capital se aumente o reduzca lo suficiente y siempre que no proceda el concurso.`,
    },
    {
      term: 'patrimonio neto a efectos de disolución',
      definition: 'Patrimonio neto contable más el capital suscrito no exigido y el registrado como pasivo, sin los ajustes por coberturas de flujos de efectivo pendientes y con los préstamos participativos. Las subvenciones se mantienen. Hasta el cierre del ejercicio iniciado en 2026 no restan las pérdidas de 2020 y 2021, ni las de la DANA en sociedades afectadas.',
    },
    {
      term: 'préstamo participativo',
      definition: `Préstamo con interés variable ligado a la actividad del prestatario, que solo se amortiza anticipadamente si se compensa con más fondos propios y que cobra después de los acreedores comunes ([art. 20 RDL 7/1996](${RDL_7_1996})). Es pasivo contable, pero cuenta como patrimonio neto para la reducción obligatoria de capital y la disolución.`,
    },
    {
      term: 'aportación de socios',
      definition: `Dinero o bienes que los socios entregan sin recibir participaciones ni contraprestación y sin naturaleza de pasivo; la [cuenta 118 del PGC](${PGC_118}) incluye las entregas para compensar pérdidas. Suma al patrimonio neto sin elevar el capital ni el umbral.`,
    },
    {
      term: 'responsabilidad solidaria del administrador',
      definition: `La del [art. 367 LSC](${LSC}#a367): quien no convoca la junta en dos meses desde la causa, o no pide la disolución judicial cuando procede, responde con la sociedad de las obligaciones sociales posteriores a la causa; las reclamadas judicialmente se presumen posteriores, salvo prueba en contrario.`,
    },
    {
      term: 'insolvencia actual',
      definition: `Situación de quien no puede cumplir regularmente sus obligaciones exigibles ([art. 2.3 TRLC](${TRLC}#a2)). Obliga a solicitar el concurso en los dos meses siguientes a conocerla o deber conocerla ([art. 5.1 TRLC](${TRLC}#a5)).`,
    },
  ],
  takeaway:
    'Calcula en cada cierre, también en los trimestrales, el patrimonio neto a efectos de disolución: si no llega a la mitad del capital, el administrador tiene dos meses para convocar la junta con la disolución y medidas que cubran el déficit con margen; si además la sociedad no puede pagar, la vía es el concurso. Y prepara 2027: salvo nueva prórroga, volverán a computar las pérdidas de 2020 y 2021.',
  sources: [
    { label: 'Texto refundido de la Ley de Sociedades de Capital (RDLeg 1/2010), arts. 363 a 367', url: `${LSC}#a363`, date: CONSULTA, kind: 'norma' },
    { label: 'Código de Comercio, art. 36.1.c) (patrimonio neto a efectos mercantiles)', url: CCOM_36, date: CONSULTA, kind: 'norma' },
    { label: 'Real Decreto-ley 7/1996, art. 20 (préstamos participativos)', url: RDL_7_1996, date: CONSULTA, kind: 'norma' },
    { label: 'Resolución del ICAC de 5 de marzo de 2019, arts. 3, 9, 28 y 37', url: `${ICAC_2019}#ar-3`, date: CONSULTA, kind: 'norma' },
    { label: 'Real Decreto-ley 7/2026, art. 30 (pérdidas de 2020 y 2021)', url: RDL_7_2026, date: CONSULTA, kind: 'norma' },
    { label: 'Resolución de 26 de marzo de 2026, del Congreso de los Diputados, de convalidación del Real Decreto-ley 7/2026', url: CONVALIDACION_RDL_7_2026, date: CONSULTA, kind: 'documento' },
    { label: 'Real Decreto-ley 1/2025, art. 2 (pérdidas por la DANA)', url: RDL_1_2025, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 28/2022, de fomento del ecosistema de las empresas emergentes, art. 13', url: LEY_28_2022, date: CONSULTA, kind: 'norma' },
    { label: 'Ley 3/2020, art. 13 (origen de la exclusión de las pérdidas de 2020 y 2021)', url: LEY_3_2020, date: CONSULTA, kind: 'norma' },
    { label: 'Texto refundido de la Ley Concursal (RDLeg 1/2020), arts. 2, 5, 444, 456, 584, 585, 607 y 613', url: `${TRLC}#a5`, date: CONSULTA, kind: 'norma' },
    { label: 'Plan General de Contabilidad, quinta parte: cuenta 118', url: PGC_118, date: CONSULTA, kind: 'norma' },
    { label: 'Código Civil, art. 5 (cómputo de plazos)', url: CC_5, date: CONSULTA, kind: 'norma' },
  ],
  quiz: {
    id: 'mer-02-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'mer-02-q1',
        prompt:
          'Una S.L. tiene 60.000 € de capital. Su patrimonio neto contable es de 24.000 €, que incluye 3.000 € de subvenciones de capital no reintegrables, y en el pasivo figura un préstamo participativo de un socio de 10.000 € que cumple el art. 20 del RDL 7/1996. No hay otros ajustes ni exclusiones. ¿Está en causa de disolución por pérdidas?',
        options: [
          {
            id: 'a',
            text: 'Sí: su patrimonio neto, 24.000 €, es inferior a 30.000 €.',
            feedback: 'Usa el patrimonio neto contable sin sumar el préstamo participativo, que a estos efectos cuenta como patrimonio neto aunque figure en el pasivo.',
          },
          {
            id: 'b',
            text: 'Sí: hay que restar las subvenciones, y el patrimonio neto queda en 21.000 €.',
            feedback: 'Las subvenciones solo se restan para repartir dividendos (art. 28.2 de la Resolución del ICAC de 2019), no para la causa de disolución; además, olvida el préstamo participativo.',
          },
          { id: 'c', text: 'No: a estos efectos su patrimonio neto es de 34.000 €, superior a 30.000 €.' },
          {
            id: 'd',
            text: 'No: mientras el patrimonio neto sea positivo, no hay causa de disolución.',
            feedback: 'La ley no exige un patrimonio neto negativo, sino inferior a la mitad del capital: con 20.000 € positivos, esta sociedad estaría en causa.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'El préstamo participativo es pasivo contable, pero cuenta como patrimonio neto a efectos de la disolución por pérdidas (art. 20.Uno.d RDL 7/1996 y art. 3.1 de la Resolución del ICAC de 2019), y las subvenciones se mantienen: 24.000 + 10.000 = 34.000 €, que no es inferior a la mitad del capital (30.000 €).',
        ref: 'La prueba: patrimonio neto frente a la mitad del capital',
      },
      {
        id: 'mer-02-q2',
        prompt:
          'El balance a 30/09/2026 de una S.L. solvente revela que está en causa de disolución por pérdidas desde esa fecha. La administradora no convoca la junta ni hace nada más. En 2027, un proveedor reclama judicialmente una factura impagada por mercancía pedida y entregada el 20/10/2026. ¿Responde la administradora con su patrimonio?',
        options: [
          { id: 'a', text: 'Sí, solidariamente con la sociedad: es una obligación posterior a la causa y, además, la ley presume que lo es salvo prueba en contrario.' },
          {
            id: 'b',
            text: 'No, porque la deuda nació dentro de los dos meses de que disponía para convocar la junta.',
            feedback: 'El art. 367 LSC alcanza todas las obligaciones posteriores a la causa, también las nacidas mientras corrían los dos meses.',
          },
          {
            id: 'c',
            text: 'No, porque en una S.L. solo responde la sociedad con su patrimonio.',
            feedback: 'La responsabilidad limitada protege a los socios; el art. 367 LSC impone al administrador que incumple sus deberes una responsabilidad legal propia.',
          },
          {
            id: 'd',
            text: 'Solo si la sociedad es declarada en concurso y este se califica como culpable.',
            feedback: 'Confunde esta responsabilidad con la del concurso culpable (arts. 442 y 456 TRLC); la del art. 367 LSC no exige que haya concurso.',
          },
        ],
        correctOptionId: 'a',
        explanation:
          'Quien no convoca la junta en los dos meses siguientes a la causa responde solidariamente de las obligaciones sociales posteriores a ella (art. 367.1 LSC), y las reclamadas judicialmente se presumen posteriores, salvo prueba en contrario (art. 367.2 LSC). La deuda nació el 20/10/2026, después de la causa.',
        ref: 'Plazos y responsabilidad de los administradores',
      },
      {
        id: 'mer-02-q3',
        prompt:
          'Una S.L. con 60.000 € de capital tiene un patrimonio neto a efectos de disolución de 24.000 €. La socia mayoritaria le ha prestado 10.000 € con un préstamo ordinario. ¿Cuál de estas medidas, por sí sola, **no** saca a la sociedad de la causa de disolución?',
        options: [
          {
            id: 'a',
            text: 'Una aportación de los socios de 6.000 € a la cuenta 118, sin aumentar el capital.',
            feedback: 'Sí la elimina: el patrimonio neto llega a 30.000 €, justo la mitad del capital, y la ley exige que sea inferior para que haya causa (aunque la sociedad queda sin margen).',
          },
          {
            id: 'b',
            text: 'Novar el préstamo de 10.000 € para convertirlo en participativo.',
            feedback: 'Sí la elimina: el patrimonio neto a efectos de disolución sube a 34.000 €, por encima del umbral de 30.000 €, sin tocar el capital.',
          },
          {
            id: 'c',
            text: 'Reducir el capital en 12.000 € por pérdidas, después de aplicar todas las reservas a compensarlas.',
            feedback: 'Sí la elimina: el capital queda en 48.000 €, el umbral en 24.000 € y el patrimonio neto (24.000 €) ya no es inferior. Eso sí, exige un balance verificado por auditor (art. 323 LSC).',
          },
          { id: 'd', text: 'Capitalizar el préstamo de 10.000 € con un aumento de capital a la par, sin prima, por compensación de créditos.' },
        ],
        correctOptionId: 'd',
        explanation:
          'Al aumentar el capital a la par, el umbral también sube: capital de 70.000 €, umbral de 35.000 € y patrimonio neto de 34.000 €, que sigue siendo inferior. A la par harían falta 12.000 € (el doble del déficit), o emitir con prima de modo que la mitad del nominal más la prima cubran los 6.000 €.',
        ref: 'Cómo salir de la causa: cálculo y caso resuelto',
      },
    ],
  },
  version: 1,
  verifiedAt: '2026-10-28',
  editorial: {
    status: 'publicado',
    authorId: 'p-joan-navarro',
    publishedAt: '2026-10-09T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
};

/** Banco de 4 preguntas adicionales para la evaluación sectorial «Pon a prueba tus conocimientos». */
export const bank: QuizQuestion[] = [
  {
    id: 'mer-02-b1',
    prompt:
      'Una S.L. con 60.000 € de capital presenta un patrimonio neto contable de 27.000 €, que incluye −4.000 € de «Ajustes por cambios de valor» de una cobertura de flujos de efectivo pendiente de imputar a resultados y 5.000 € de subvenciones no reintegrables. No tiene préstamos participativos ni le afecta ninguna exclusión temporal. ¿Cuál es su patrimonio neto a efectos de la causa de disolución?',
    options: [
      {
        id: 'a',
        text: '27.000 €: está en causa de disolución.',
        feedback: 'No descarta el ajuste negativo de la cobertura de flujos de efectivo, que a estos efectos no se considera patrimonio neto.',
      },
      { id: 'b', text: '31.000 €: no está en causa de disolución.' },
      {
        id: 'c',
        text: '26.000 €: está en causa de disolución.',
        feedback: 'Descarta bien la cobertura, pero además resta las subvenciones (27.000 + 4.000 − 5.000), algo que solo procede para repartir dividendos.',
      },
      {
        id: 'd',
        text: '22.000 €: está en causa de disolución.',
        feedback: 'Resta las subvenciones y no descarta la cobertura (27.000 − 5.000).',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'Los ajustes por cambios de valor de coberturas de flujos de efectivo pendientes de imputar no se consideran patrimonio neto (art. 36.1.c del Código de Comercio): 27.000 − (−4.000) = 31.000 €. Las subvenciones se mantienen. Como 31.000 € no es inferior a 30.000 €, no hay causa.',
    ref: 'La prueba: patrimonio neto frente a la mitad del capital',
  },
  {
    id: 'mer-02-b2',
    prompt:
      'Hoy, 28/10/2026, revisas el balance de una S.L. con ejercicio natural que arrastra 8.000 € de pérdidas de 2020. Un compañero sostiene que deben computarse en la causa de disolución porque «la moratoria COVID terminó en 2024». ¿Qué le respondes?',
    options: [
      {
        id: 'a',
        text: 'Que tiene razón: la exclusión solo llegó hasta el cierre del ejercicio iniciado en 2024.',
        feedback: 'Esa era la redacción del art. 13 de la Ley 3/2020 tras el RDL 20/2022; después hubo nuevas prórrogas y hoy rige el art. 30 del RDL 7/2026.',
      },
      {
        id: 'b',
        text: 'Que esas pérdidas están excluidas de forma indefinida.',
        feedback: 'La exclusión es temporal: llega hasta el cierre del ejercicio que se inicie en 2026.',
      },
      {
        id: 'c',
        text: 'Que solo pueden excluirse si la sociedad recibió ayudas públicas por la COVID.',
        feedback: 'La norma no exige haber recibido ayudas: se aplica a cualquier sociedad de capital, solo a efectos de la causa del art. 363.1.e) LSC.',
      },
      {
        id: 'd',
        text: 'Que no se computan hasta el cierre del ejercicio que se inicie en 2026 (art. 30 del RDL 7/2026, convalidado) y que, salvo nueva prórroga, volverán a computar en el ejercicio 2027.',
      },
    ],
    correctOptionId: 'd',
    explanation:
      'El art. 30 del RDL 7/2026, vigente desde el 22/03/2026 y convalidado por el Congreso el 26/03/2026, excluye las pérdidas de 2020 y 2021 hasta el cierre del ejercicio iniciado en 2026; con ejercicio natural, hasta el cierre de 31/12/2026.',
    ref: 'Exclusiones vigentes y fin de la medida COVID',
  },
  {
    id: 'mer-02-b3',
    prompt:
      'Una S.L. está en causa de disolución por pérdidas y, desde hace tres semanas, no puede pagar con regularidad a sus proveedores ni las cuotas de la Seguridad Social. No negocia con sus acreedores. ¿Qué debe hacer su órgano de administración?',
    options: [
      { id: 'a', text: 'Solicitar el concurso dentro de los dos meses siguientes a la fecha en que conoció o debió conocer la insolvencia; si lo hace, no tiene que convocar la junta para disolver.' },
      {
        id: 'b',
        text: 'Convocar la junta para acordar la disolución y la liquidación: con eso cumple todas sus obligaciones.',
        feedback: 'La disolución no sustituye al concurso cuando hay insolvencia actual, y no solicitarlo hace presumir culpable el concurso (art. 444.1.º TRLC).',
      },
      {
        id: 'c',
        text: 'Esperar al cierre del ejercicio para confirmar las pérdidas con las cuentas anuales.',
        feedback: 'Los plazos corren desde que se conoce o debió conocerse la insolvencia, y desde que acaece la causa de disolución, no desde el cierre.',
      },
      {
        id: 'd',
        text: 'Acordar una reducción de capital por pérdidas, que resuelve a la vez la causa de disolución y la falta de liquidez.',
        feedback: 'La reducción por pérdidas no aporta dinero ni cambia el patrimonio neto (art. 37 de la Resolución del ICAC de 2019): no resuelve la falta de liquidez.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Con insolvencia actual, el deber es solicitar el concurso en dos meses (arts. 2.3 y 5.1 TRLC). Al hacerlo, desaparece el deber de convocar la junta para disolver (art. 365.3 LSC) y, si lo solicita dentro de los dos meses desde la causa, la responsabilidad del art. 367 LSC (art. 367.3).',
    ref: 'Si además no puede pagar: concurso o negociaciones',
  },
  {
    id: 'mer-02-b4',
    prompt:
      'Una S.L. certificada por ENISA como empresa emergente se constituyó en marzo de 2025 con 3.000 € de capital. A 30/09/2026 su patrimonio neto es de 500 € y paga sus deudas con regularidad. ¿Cuál es su situación?',
    options: [
      {
        id: 'a',
        text: 'Está en causa de disolución (500 € < 1.500 €) y debe convocar la junta en dos meses.',
        feedback: 'Aplica la regla general sin tener en cuenta el régimen especial de las empresas emergentes.',
      },
      {
        id: 'b',
        text: 'Está exenta mientras conserve la condición de empresa emergente, es decir, hasta cinco años.',
        feedback: 'Confunde los tres años de esta exclusión con el plazo de cinco años (siete en sectores estratégicos) que delimita la condición de empresa emergente (art. 3.1.a de la Ley 28/2022).',
      },
      { id: 'c', text: 'No incurre en esta causa hasta que pasen tres años desde su constitución (marzo de 2028), siempre que no proceda el concurso.' },
      {
        id: 'd',
        text: 'No puede incurrir en causa porque el capital mínimo de la S.L. es de 1 €.',
        feedback: 'El capital mínimo de 1 € (art. 4 LSC) no cambia la prueba: el umbral es la mitad del capital que tenga la sociedad, aquí 1.500 €.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Las empresas emergentes no incurren en causa de disolución por pérdidas hasta que hayan transcurrido tres años desde su constitución, siempre que no proceda solicitar el concurso (art. 13 de la Ley 28/2022).',
    ref: 'Exclusiones vigentes y fin de la medida COVID',
  },
];

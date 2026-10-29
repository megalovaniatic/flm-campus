import type { Formation, QuizQuestion } from '@flm/shared';

export const formation: Formation = {
  id: 'fis-01',
  slug: 'recargos-presentacion-fuera-de-plazo',
  area: 'fiscal',
  title: 'Presentar fuera de plazo: recargo del art. 27, intereses y sanciones',
  intro:
    'Septiembre: el nuevo responsable financiero de una *startup* cliente te avisa de que nadie presentó el modelo 303 del primer trimestre y hay 2.800 € de IVA pendientes. Si lo presentáis e ingresáis antes de cualquier [[requerimiento previo]], el coste añadido puede quedarse en 105 €; si la AEAT se adelanta, habrá intereses y una posible sanción de 588 € a 1.400 €. Saber en qué lado de esa línea estáis, y calcularlo bien, es asesoramiento de valor inmediato.',
  summary:
    'Cuánto cuesta presentar tarde sin requerimiento, cómo conservar la reducción del 25 % y qué cambia si la AEAT se adelanta: intereses y posible sanción.',
  coverTerm: 'Art. 27',
  readingMinutes: 10,
  outcomes: [
    'Identificar si una actuación de la AEAT es un requerimiento previo y, con ello, si corresponde recargo o intereses y posible sanción.',
    'Calcular el recargo según los meses completos de retraso, su reducción del 25 % y, cuando proceda, los intereses de demora.',
    'Decidir con el cliente la vía de regularización más económica y los pagos que no puede saltarse para conservar la reducción.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Recargo o sanción: lo decide el requerimiento previo', id: 'requerimiento-previo' },
    {
      type: 'paragraph',
      text: 'Cuando una autoliquidación se presenta fuera de plazo, la ley separa dos escenarios. Si la presentas sin [[requerimiento previo]], pagas un [[recargo por declaración extemporánea]]: una prestación accesoria que excluye las sanciones ([art. 27 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27)). Si la AEAT se ha adelantado, el art. 27 ya no se aplica: se exigen intereses de demora y la falta de ingreso puede sancionarse ([art. 191.1 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a191)). Por eso, la primera pregunta es siempre la misma: ¿se ha notificado al cliente alguna actuación sobre ese impuesto y periodo?',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'requerimiento previo',
      text: 'La ley lo define como «cualquier actuación administrativa realizada con conocimiento formal del obligado tributario conducente al reconocimiento, regularización, comprobación, inspección, aseguramiento o liquidación de la deuda tributaria» ([art. 27.1 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27)). Retén dos ideas: tiene que haberse notificado al cliente y tiene que ir dirigida a esa deuda. Manda la cronología: si la notificación es anterior a la presentación, aunque sea por un día, ya no hay recargo posible.',
    },
    { type: 'paragraph', text: 'En la práctica, son requerimiento previo, entre otras, estas actuaciones:' },
    {
      type: 'list',
      items: [
        'El requerimiento para que presentes la autoliquidación que falta.',
        'El inicio de una verificación de datos, una comprobación limitada o una inspección sobre ese impuesto y periodo.',
        'Un requerimiento de información o documentación dirigido al propio cliente para comprobar esa deuda.',
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Una notificación sin abrir también cuenta',
      text: 'Si el cliente está obligado a relacionarse electrónicamente con la Administración (por ejemplo, una sociedad) o ha elegido esa vía, la notificación se entiende rechazada a los diez días naturales de su puesta a disposición sin acceder a ella, y el procedimiento sigue ([arts. 14.2, 41.5 y 43.2 de la Ley 39/2015](https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565#a43), aplicables por el [art. 109 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a109)). Antes de presentar, revisa siempre su buzón de notificaciones.',
      refs: [
        { label: 'Ley 39/2015, del Procedimiento Administrativo Común, art. 43: notificaciones electrónicas', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565#a43', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley 39/2015, art. 14: obligados a relacionarse electrónicamente', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565#a14', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley 58/2003, General Tributaria, art. 109: notificaciones en materia tributaria', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a109', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Cuánto cuesta: la escala del recargo', id: 'escala-del-recargo' },
    {
      type: 'paragraph',
      text: 'Desde el 11 de julio de 2021, el recargo es del 1 % más otro 1 % por cada [[mes completo de retraso]] desde el fin del plazo ([art. 27.2 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27), según la [Ley 11/2021](https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473#ad-3)): dentro del primer mes, el 1 %; dentro del segundo, el 2 %, y así hasta el 12 %. Transcurridos 12 meses, el recargo es un **15 % fijo** y se añaden intereses de demora, pero solo desde el día siguiente al final de esos 12 meses hasta la presentación. Se calcula sobre el importe a ingresar de la autoliquidación y excluye las sanciones (y, hasta los 12 meses, también los intereses). No lo autoliquidas tú: la AEAT dicta y notifica su liquidación. Para que se aplique, la autoliquidación tardía debe identificar expresamente el periodo y contener solo sus datos ([art. 27.4 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27)).',
    },
    {
      type: 'table',
      caption: 'Recargo sobre la cuota según el momento de la presentación (sin requerimiento previo)',
      columns: ['Presentación', 'Meses completos', 'Recargo', 'Con reducción del 25 %', 'Intereses de demora'],
      rows: [
        ['Dentro del 1.er mes', '0', '1 %', '0,75 %', 'No'],
        ['Dentro del 2.º mes', '1', '2 %', '1,5 %', 'No'],
        ['Dentro del 3.er mes', '2', '3 %', '2,25 %', 'No'],
        ['Dentro del 6.º mes', '5', '6 %', '4,5 %', 'No'],
        ['Dentro del 12.º mes', '11', '12 %', '9 %', 'No'],
        ['Más de 12 meses', '12 o más', '15 %', '11,25 %', 'Sí, desde el día siguiente al final de los 12 meses'],
      ],
      numeric: [1, 2, 3],
    },
    {
      type: 'widget',
      widget: { kind: 'recargo-extemporaneo', cuota: 10000 },
      caption: 'Simula el recargo de una cuota de 10.000 € y observa el salto del 12 % al 15 % al superar los 12 meses.',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'mes completo de retraso',
      text: 'Cuenta los meses de fecha a fecha desde el fin del plazo ([art. 5.1 del Código Civil](https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763#art5), supletorio según el [art. 7.2 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a7)). Si el plazo acabó el 20 de abril, los meses se cumplen el 20 de mayo, el 20 de junio y así sucesivamente. Solo suman los meses enteros: con 4 meses y 25 días de retraso hay 4 completos y el recargo es del 5 %. Si estás a punto de cumplir otro mes, no apures: presenta antes.',
    },
    {
      type: 'paragraph',
      text: 'Pasado el año, el cálculo cambia. Un 303 del cuarto trimestre de 2024 (plazo hasta el 30/01/2025) presentado e ingresado el 15/06/2026, con 2.800 € de cuota, lleva un recargo del 15 % (420 €; 315 € con reducción) e intereses solo del 31/01/2026 al 15/06/2026: 2.800 × 4,0625 % × 136 / 365 = 42,38 €.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'De dónde sale la escala',
      text: 'La escala la introdujo la [Ley 11/2021](https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473#ad-3), vigente desde el 11/07/2021, en sustitución de la anterior: 5 %, 10 % o 15 % dentro de los 3, 6 o 12 meses, y 20 % con intereses después. La AEAT recoge la tabla vigente en su [Manual práctico de Renta 2025](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/regularizacion-situaciones-tributarias/recargos-aplicables.html).',
      refs: [
        { label: 'Ley 58/2003, General Tributaria, art. 27', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley 11/2021, de medidas de prevención y lucha contra el fraude fiscal, art. 13', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473#ad-3', date: '2026-10-28', kind: 'norma' },
        {
          label: 'AEAT, Manual práctico de Renta 2025: «Recargos aplicables»',
          url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/regularizacion-situaciones-tributarias/recargos-aplicables.html',
          date: '2026-10-28',
          kind: 'documento',
        },
      ],
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'La reducción del 25 % y el error de presentar sin pagar', id: 'reduccion-del-recargo' },
    {
      type: 'paragraph',
      text: 'La [[reducción del 25 %]] no hay que pedirla, pero exige dos pagos ([art. 27.5 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27)):',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'Ingresar toda la deuda al presentar o, si no es posible, pedir en ese momento un aplazamiento o fraccionamiento con aval o certificado de seguro de caución y cumplir sus plazos.',
        'Pagar el resto del recargo en el plazo del [art. 62.2 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a62) abierto con su notificación: si llega entre los días 1 y 15, hasta el día 20 del mes siguiente; si llega entre el 16 y el final de mes, hasta el día 5 del segundo mes siguiente (o el inmediato hábil siguiente).',
      ],
    },
    {
      type: 'paragraph',
      text: 'Si falla cualquiera de esos pagos, la AEAT exige la parte reducida con una simple notificación. Y la reducción no alcanza a los intereses de demora.',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Presentar sin ingresar es la peor opción',
      text: 'Si presentas sin ingresar y sin pedir aplazamiento, fraccionamiento o compensación, pierdes la reducción y el [[periodo ejecutivo]] empieza al día siguiente de la presentación ([art. 161.1.b LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a161)): al recargo del art. 27 se suman los del periodo ejecutivo sobre la cuota, del 5 %, 10 % o 20 % ([arts. 27.3](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27) y [28 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a28)). Si el cliente no puede pagar, solicita el aplazamiento o fraccionamiento al presentar; con aval o seguro de caución, conservará además la reducción.',
      refs: [
        { label: 'Ley 58/2003, General Tributaria, art. 161: inicio del periodo ejecutivo', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a161', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley 58/2003, General Tributaria, art. 28: recargos del periodo ejecutivo', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a28', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley 58/2003, General Tributaria, art. 27.3 y 27.5', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Si la AEAT se adelanta: intereses y sanción', id: 'tras-el-requerimiento' },
    {
      type: 'paragraph',
      text: 'Con requerimiento previo no hay recargo, sino [[interés de demora]] desde el día siguiente al fin del plazo hasta el ingreso, sin necesidad de culpa ([art. 26 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a26)). Se calcula por días: cuota × tipo × días / 365 (366 en años bisiestos), con el tipo de cada año. En 2026 es del **4,0625 %**, el que fijó la [Ley 31/2022](https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128#da-42) para 2023 y que se mantiene por la prórroga presupuestaria. La AEAT advierte que una Ley de Presupuestos para 2026 podría fijar otro tipo ([reglas de cálculo](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/incremento-cuotas-liquidas-estatal-autonomica/calculo-intereses-demora/reglas-calculo.html)); a 28/10/2026 no se ha publicado ninguna.',
    },
    {
      type: 'paragraph',
      text: 'Además, dejar de ingresar en plazo es infracción si hay al menos negligencia ([arts. 183.1](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a183) y [191 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a191)). Como regla general, es **leve** (multa del 50 % de la cuota no ingresada) si esta no supera 3.000 € o, superándolos, no hay ocultación; **grave** (del 50 % al 100 %) si los supera y hay ocultación, y **muy grave** (del 100 % al 150 %) si hay medios fraudulentos. La sanción se reduce un 30 % por conformidad (en verificación de datos y comprobación limitada, basta con no recurrir la liquidación) y, sobre lo que quede, un 40 % si la pagas en el plazo del art. 62.2 sin recurrir; en actas con acuerdo, un 65 % ([arts. 187.1.d](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a187) y [188 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a188); [art. 7.1 RGST](https://www.boe.es/buscar/act.php?id=BOE-A-2004-18398#a7)).',
    },
    {
      type: 'example',
      title: 'Caso práctico: el 303 que nadie presentó',
      scenario:
        'Una *startup* cliente (sociedad limitada, IVA trimestral) no presentó el 303 del primer trimestre de 2026: 2.800 € a ingresar, con plazo hasta el lunes 20/04/2026 ([art. 71.4 RIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a71)). Tras comprobar que no hay notificaciones, lo presentáis e ingresáis el 15/09/2026. Compáralo con lo que costaría si la AEAT hubiera notificado el 01/09/2026 un requerimiento para presentarlo.',
      steps: [
        {
          label: '¿Requerimiento previo? No hay notificaciones anteriores: se aplica el art. 27, sin sanción.',
          formula: 'Notificaciones antes del 15/09/2026: ninguna',
          result: 'Recargo del art. 27',
        },
        {
          label: 'Meses completos, de fecha a fecha desde el 20/04: se cumplen el 20/05, el 20/06, el 20/07 y el 20/08; el quinto sigue en curso.',
          formula: '20/04/2026 → 20/08/2026 = 4 meses completos',
          result: '4 meses',
        },
        { label: 'Porcentaje: el 1 % fijo más un 1 % por mes completo.', formula: '1 % + 4 × 1 % = 5 %', result: '5 %' },
        {
          label: 'Recargo sobre el importe a ingresar; sin intereses, porque el retraso no llega a 12 meses.',
          formula: '2.800,00 € × 5 % = 140,00 €',
          result: '140,00 €',
        },
        {
          label: 'Reducción del 25 %: cuota ingresada al presentar y recargo pagado en plazo (si se notifica el 06/10/2026, hasta el 20/11/2026).',
          formula: '140,00 € × (1 − 0,25) = 105,00 €',
          result: '105,00 €',
        },
        {
          label: 'Con requerimiento el 01/09: sin recargo, pero con intereses del 21/04 al 15/09/2026 (10 + 31 + 30 + 31 + 31 + 15 = 148 días) al 4,0625 %.',
          formula: '2.800,00 € × 4,0625 % × 148 / 365 = 46,12 €',
          result: '46,12 €',
        },
        {
          label: 'Posible sanción leve del art. 191 (la cuota no supera 3.000 €): 50 %. Con pronto pago, 840 €; con conformidad y pronto pago, 588 €.',
          formula: '2.800,00 € × 50 % = 1.400,00 € → 1.400,00 € × 0,70 × 0,60 = 588,00 €',
          result: 'De 588,00 € a 1.400,00 €',
        },
        {
          label: 'Coste añadido a la cuota en el mejor caso de cada escenario.',
          formula: '46,12 € + 588,00 € = 634,12 € frente a 105,00 €',
          result: 'Unas 6 veces más',
        },
      ],
      conclusion:
        'Presentar e ingresar el 15/09 sin requerimiento cuesta **105 €** (140 € sin la reducción); con requerimiento, el coste añadido iría de 634,12 € a 1.446,12 €. Días de interés con ambos extremos incluidos; el importe definitivo es el que liquide la AEAT.',
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Cómo actuar con el cliente', id: 'como-actuar' },
    { type: 'paragraph', text: 'Comprueba que sabes desmontar estas ideas erróneas:' },
    {
      type: 'widget',
      widget: {
        kind: 'tarjetas-verdad',
        title: 'Ideas erróneas que salen caras',
        cards: [
          {
            claim: 'Si presento con 13 meses de retraso, el recargo es del 13 % y los intereses corren desde el fin del plazo.',
            verdict: 'falso',
            explanation:
              'La escala llega como máximo al 12 %. Superados los 12 meses, el recargo es un 15 % fijo y los intereses solo corren desde el día siguiente al final de esos 12 meses ([art. 27.2 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27)).',
          },
          {
            claim: 'La reducción del 25 % se aplica siempre: presento ahora y ya pagaré cuando pueda.',
            verdict: 'falso',
            explanation:
              'Exige ingresar la deuda al presentar (o aplazarla con aval o seguro de caución pedido en ese momento) y pagar el recargo en el plazo del art. 62.2. Sin ingreso, además, se abre el periodo ejecutivo ([art. 27.3 y 27.5 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27)).',
          },
          {
            claim: 'Si el cliente no abre la notificación de la AEAT, todavía no hay requerimiento.',
            verdict: 'falso',
            explanation:
              'Si está obligado a recibir notificaciones electrónicas (o las ha elegido), a los diez días naturales sin acceder se entiende rechazada y el procedimiento sigue ([art. 43.2 de la Ley 39/2015](https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565#a43)).',
          },
          {
            claim: 'La factura olvidada del trimestre anterior la sumo al 303 siguiente y así me ahorro el recargo.',
            verdict: 'falso',
            explanation:
              'Para aplicar el art. 27, la autoliquidación tardía debe identificar el periodo y contener solo sus datos. Si mezclas periodos, la falta de ingreso en plazo es siempre infracción leve ([arts. 27.4 y 191.6 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a191)): cambias un recargo pequeño por una sanción.',
          },
        ],
      },
      caption: 'Decide si cada afirmación es verdadera o falsa antes de leer la explicación.',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Tras una liquidación, revisa los demás ejercicios',
      text: 'Si la AEAT ha regularizado un hecho (por ejemplo, un gasto no deducible en el Impuesto sobre Sociedades de 2023) que se repite en otros periodos del mismo impuesto, el cliente puede corregirlos sin recargo si: a) presenta en los seis meses siguientes a la notificación de la liquidación; b) paga todo en los términos del art. 27.5; c) no pide la rectificación de esas autoliquidaciones ni recurre la liquidación, y d) esta no conllevó sanción ([art. 27.2 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27)). Si falla alguna condición, el recargo se exige con una simple notificación. Recurrir la liquidación original tiene, por tanto, un coste en los demás ejercicios.',
      refs: [{ label: 'Ley 58/2003, General Tributaria, art. 27.2 (exclusión del recargo)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27', date: '2026-10-28', kind: 'norma' }],
    },
    { type: 'paragraph', text: 'Antes de presentar fuera de plazo, sigue esta lista:' },
    {
      type: 'list',
      ordered: true,
      items: [
        'Revisa el buzón de notificaciones (sede electrónica de la AEAT y dirección electrónica habilitada única) y confirma que no hay ninguna actuación sobre ese impuesto y periodo.',
        'Calcula los meses completos y explica el coste en fechas: «si presentamos esta semana, el 3 %; el mes que viene, el 4 %».',
        'Identifica el periodo en la autoliquidación e incluye solo sus datos.',
        'Prepara el ingreso para el día de la presentación o, si no es posible, el aplazamiento, mejor con aval o seguro de caución.',
        'Anota el plazo del art. 62.2 para pagar el recargo reducido.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Un matiz final: si la autoliquidación no tiene importe a ingresar (sale a devolver, a compensar o a cero), no hay recargo, pero presentarla tarde es infracción leve, con multa fija de 200 €, que se reduce a 100 € si la presentas sin requerimiento previo ([art. 198 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a198)).',
    },
  ],
  keyTerms: [
    {
      term: 'requerimiento previo',
      definition:
        'Actuación de la Administración, conocida formalmente por el obligado tributario, dirigida a reconocer, regularizar, comprobar, inspeccionar, asegurar o liquidar la deuda. Si se notifica antes de presentar, no hay recargo, sino intereses y posible sanción.',
    },
    {
      term: 'recargo por declaración extemporánea',
      definition:
        'Prestación accesoria que se paga por presentar fuera de plazo sin requerimiento previo: el 1 % más un 1 % por mes completo, o el 15 % pasados 12 meses. La liquida la AEAT y excluye las sanciones.',
    },
    {
      term: 'mes completo de retraso',
      definition: 'Cada mes entero, contado de fecha a fecha desde el fin del plazo, transcurrido al presentar. Cada uno suma un 1 % al 1 % inicial, hasta un máximo del 12 %.',
    },
    {
      term: 'reducción del 25 %',
      definition:
        'Rebaja del recargo si ingresas la deuda al presentar (o la aplazas con aval o seguro de caución pedido al presentar) y pagas el recargo en el plazo del art. 62.2 LGT. No alcanza a los intereses.',
    },
    {
      term: 'interés de demora',
      definition: 'Prestación accesoria que compensa el retraso en el ingreso, sin necesidad de culpa. En 2026 es del 4,0625 % anual y se calcula por días.',
    },
    {
      term: 'periodo ejecutivo',
      definition:
        'Fase de cobro que se abre cuando la deuda no se ingresa en plazo; si presentas tarde sin ingresar, empieza al día siguiente de la presentación. Lleva recargos del 5 %, 10 % o 20 %.',
    },
  ],
  takeaway:
    'Sin requerimiento previo, presentar tarde cuesta un 1 % más un 1 % por mes completo (15 % con intereses pasado el año), sin sanción y con un 25 % de rebaja si pagas a tiempo; con requerimiento, hay intereses y una posible sanción de al menos el 50 % de la cuota, antes de reducciones. Ante un olvido, revisa las notificaciones y presenta e ingresa cuanto antes.',
  sources: [
    { label: 'Ley 58/2003, General Tributaria, art. 27: recargos por declaración extemporánea', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a27', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria, art. 26: interés de demora', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a26', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria, art. 191: infracción por dejar de ingresar', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a191', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria, art. 188: reducción de las sanciones', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a188', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria, art. 62: plazos para el pago', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a62', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria, art. 161: inicio del periodo ejecutivo', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a161', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria, art. 198: presentación tardía sin perjuicio económico', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a198', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 11/2021, de medidas de prevención y lucha contra el fraude fiscal, art. 13', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473#ad-3', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 31/2022, de Presupuestos Generales del Estado para 2023, disposición adicional 42.ª', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-22128#da-42', date: '2026-10-28', kind: 'norma' },
    { label: 'Reglamento del IVA (Real Decreto 1624/1992), art. 71: plazos de las autoliquidaciones', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a71', date: '2026-10-28', kind: 'norma' },
    { label: 'Reglamento general del régimen sancionador tributario (Real Decreto 2063/2004), art. 7', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2004-18398#a7', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 39/2015, del Procedimiento Administrativo Común, art. 43', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565#a43', date: '2026-10-28', kind: 'norma' },
    { label: 'Código Civil, art. 5: cómputo de plazos', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763#art5', date: '2026-10-28', kind: 'norma' },
    {
      label: 'AEAT, Manual práctico de Renta 2025: «Recargos aplicables»',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/regularizacion-situaciones-tributarias/recargos-aplicables.html',
      date: '2026-10-28',
      kind: 'documento',
    },
    {
      label: 'AEAT, Manual práctico de Renta 2025: «Reglas de cálculo» de los intereses de demora',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/incremento-cuotas-liquidas-estatal-autonomica/calculo-intereses-demora/reglas-calculo.html',
      date: '2026-10-28',
      kind: 'documento',
    },
  ],
  quiz: {
    id: 'fis-01-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'fis-01-q1',
        prompt:
          'Una sociedad no presentó el modelo 303 del 2T 2026, cuyo plazo acabó el 20/07/2026. El 02/09/2026 se le notifica el inicio de una comprobación limitada del IVA de ese trimestre y el 10/09/2026 presenta e ingresa la autoliquidación. ¿Qué se le aplica?',
        options: [
          {
            id: 'a',
            text: 'Un recargo del 2 % (1 % más un mes completo de retraso), porque la autoliquidación la ha presentado la propia sociedad.',
            feedback: 'No importa quién presente, sino si antes se notificó una actuación dirigida a comprobar esa deuda. El recargo del art. 27 solo existe sin requerimiento previo.',
          },
          { id: 'b', text: 'No hay recargo del art. 27: se exigen intereses de demora y, si la AEAT aprecia al menos negligencia, una sanción del art. 191 LGT.' },
          {
            id: 'c',
            text: 'Un recargo del 15 % más intereses de demora, porque ha intervenido la Administración.',
            feedback: 'El 15 % es el tramo del propio art. 27 para presentaciones sin requerimiento con más de 12 meses de retraso: aquí hay requerimiento y no han pasado 12 meses.',
          },
          {
            id: 'd',
            text: 'Ninguna consecuencia, porque ha ingresado antes de que la AEAT dicte una liquidación.',
            feedback: 'Ingresar antes de la liquidación no borra el retraso: hay intereses desde el fin del plazo y la falta de ingreso puede sancionarse, porque no se ha regularizado conforme al art. 27.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'El inicio de una comprobación limitada sobre ese impuesto y periodo es una actuación notificada a la sociedad y dirigida a comprobar la deuda: un requerimiento previo (art. 27.1 LGT). Como se notificó antes de presentar, no cabe recargo; se deben intereses por el retraso (art. 26 LGT) y la falta de ingreso en plazo es sancionable (art. 191.1 LGT).',
        ref: 'apartado 1, «Recargo o sanción: lo decide el requerimiento previo»',
      },
      {
        id: 'fis-01-q2',
        prompt:
          'El plazo del 303 del 2T 2026 acabó el 20/07/2026. Tu cliente lo presenta sin requerimiento el 26/10/2026, ingresa al presentar los 6.000 € de cuota y pagará el recargo en el plazo abierto con su notificación. ¿Cuánto pagará de recargo?',
        options: [
          { id: 'a', text: '240 €', feedback: 'Es el recargo del 4 % antes de la reducción del 25 %, que procede porque ingresa la cuota al presentar y paga el recargo en plazo.' },
          {
            id: 'b',
            text: '225 €',
            feedback: 'Cuenta cuatro meses porque la presentación toca cuatro meses naturales. Solo suman los meses completos, de fecha a fecha: 20/08, 20/09 y 20/10 (tres), así que el recargo es del 4 %, no del 5 %.',
          },
          { id: 'c', text: '180 €' },
          { id: 'd', text: '135 €', feedback: 'Olvida el 1 % inicial: aplica solo un 3 % (180 €) y lo reduce. El porcentaje es el 1 % más un 1 % por cada mes completo.' },
        ],
        correctOptionId: 'c',
        explanation:
          'Del 20/07 al 26/10 hay tres meses completos (cumplidos el 20/08, el 20/09 y el 20/10), así que el recargo es del 1 % + 3 % = 4 %: 6.000 × 4 % = 240 €. Como la cuota se ingresa al presentar y el recargo se paga en el plazo del art. 62.2, se reduce un 25 %: 240 × 0,75 = 180 € (art. 27.2 y 27.5 LGT).',
        ref: 'apartados 2 y 3, «Cuánto cuesta: la escala del recargo» y «La reducción del 25 % y el error de presentar sin pagar»',
      },
      {
        id: 'fis-01-q3',
        prompt:
          'Una autoliquidación con 10.000 € a ingresar, cuyo plazo acabó el 30/01/2025, se presenta sin requerimiento y con ingreso el 15/06/2026. Antes de aplicar ninguna reducción, ¿qué se exige?',
        options: [
          {
            id: 'a',
            text: 'Un recargo del 13 % (1 % más 12 meses completos), sin intereses de demora.',
            feedback: 'La escala progresiva llega como máximo al 12 %. Superados los 12 meses no se suma un punto más: el recargo es un 15 % fijo con intereses.',
          },
          {
            id: 'b',
            text: 'Un recargo del 15 % e intereses de demora desde el 31/01/2025 (501 días).',
            feedback: 'Los primeros 12 meses quedan cubiertos por el recargo: los intereses solo corren desde el día siguiente al final de esos 12 meses.',
          },
          {
            id: 'c',
            text: 'Un recargo del 20 % más intereses de demora.',
            feedback: 'El 20 % pertenecía a la escala anterior a la Ley 11/2021, que no se aplica a las presentaciones realizadas desde el 11/07/2021.',
          },
          { id: 'd', text: 'Un recargo del 15 % (1.500 €) e intereses del 31/01/2026 al 15/06/2026: 10.000 × 4,0625 % × 136 / 365 = 151,37 €.' },
        ],
        correctOptionId: 'd',
        explanation:
          'Han transcurrido más de 12 meses desde el fin del plazo (se cumplieron el 30/01/2026), así que el recargo es del 15 % y los intereses se exigen solo desde el día siguiente al final de esos 12 meses hasta la presentación (art. 27.2 LGT), al 4,0625 % que se aplica en 2026.',
        ref: 'apartado 2, «Cuánto cuesta: la escala del recargo»',
      },
    ],
  },
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-angel-ceniceros',
    publishedAt: '2026-10-06T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: '2026-10-28',
};

export const bank: QuizQuestion[] = [
  {
    id: 'fis-01-b1',
    prompt:
      'El 10/03/2026 la AEAT notificó a una sociedad una liquidación, sin sanción, que considera no deducible un gasto en el Impuesto sobre Sociedades de 2023. La sociedad aplicó el mismo criterio en 2024. ¿Qué le permite regularizar 2024 sin recargo?',
    options: [
      {
        id: 'a',
        text: 'Presentar la autoliquidación de 2024 en cualquier momento antes de que prescriba, siempre que ingrese la cuota al presentarla.',
        feedback: 'La exclusión solo opera si se presenta en los seis meses siguientes a la notificación de la liquidación; después se aplica el recargo según los meses de retraso.',
      },
      {
        id: 'b',
        text: 'Recurrir la liquidación de 2023 y, mientras se resuelve, regularizar 2024: el recurso no afecta a la exclusión del recargo.',
        feedback: 'Recurrir la liquidación incumple una de las condiciones legales: el recargo se exigiría con una simple notificación.',
      },
      {
        id: 'c',
        text: 'Presentar 2024 corrigiendo ese hecho en los seis meses siguientes a la notificación, pagarlo en los términos del art. 27.5 y no recurrir la liquidación ni pedir la rectificación.',
      },
      {
        id: 'd',
        text: 'Esperar a que la AEAT compruebe 2024, porque una liquidación administrativa nunca lleva recargo y sale más barata.',
        feedback: 'Es cierto que no lleva recargo, pero sí intereses desde el fin del plazo y, si se aprecia culpa, sanción del art. 191: normalmente sale más cara.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'El art. 27.2 LGT excluye el recargo cuando se regularizan en otros periodos del mismo impuesto hechos idénticos a los ya regularizados por la AEAT, siempre que se presente en los seis meses siguientes a la notificación, se pague todo en los términos del art. 27.5, no se pida la rectificación ni se recurra la liquidación y esta no haya dado lugar a sanción.',
    ref: 'apartado 5, «Cómo actuar con el cliente»',
  },
  {
    id: 'fis-01-b2',
    prompt:
      'En julio de 2026 un autónomo descubre una factura emitida en marzo cuyo IVA no declaró. Para simplificar, suma esa cuota a su 303 del 2T sin identificar que corresponde al 1T. ¿Qué consecuencia tiene?',
    options: [
      { id: 'a', text: 'No se aplica el régimen de recargos: la falta de ingreso en plazo del 1T es infracción leve, además de los intereses de demora que procedan.' },
      {
        id: 'b',
        text: 'Se aplica el recargo del art. 27 sobre esa cuota, como si hubiera regularizado el 1T por separado.',
        feedback: 'El art. 27.4 exige que la autoliquidación tardía identifique el periodo y contenga solo sus datos; si no, no hay recargo, sino infracción.',
      },
      {
        id: 'c',
        text: 'Ninguna: el IVA acaba ingresándose y Hacienda no pierde nada.',
        feedback: 'El IVA del 1T se ingresa unos tres meses tarde y la ley califica expresamente esta conducta como infracción leve (art. 191.6 LGT).',
      },
      {
        id: 'd',
        text: 'Solo intereses de demora: incluir la cuota en otro periodo nunca es sancionable.',
        feedback: 'El art. 191.6 LGT dice lo contrario: siempre es infracción leve la falta de ingreso regularizada sin cumplir los requisitos del art. 27.4.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Para aplicar el régimen de recargos, la autoliquidación extemporánea debe identificar expresamente el periodo y contener solo sus datos (art. 27.4 LGT). Si la cuota se incluye en otro periodo, la falta de ingreso en plazo constituye siempre infracción leve (art. 191.6 LGT), y el ingreso tardío devenga intereses de demora (art. 26 LGT).',
    ref: 'apartado 2, «Cuánto cuesta: la escala del recargo»',
  },
  {
    id: 'fis-01-b3',
    prompt:
      'Una sociedad presenta con dos meses de retraso y sin requerimiento un 303 con 5.000 € a ingresar, pero no ingresa ni solicita aplazamiento, fraccionamiento o compensación. ¿Qué ocurre?',
    options: [
      {
        id: 'a',
        text: 'Solo se le exigirá el recargo del art. 27, reducido en un 25 % si lo paga en el plazo abierto con su notificación.',
        feedback: 'Sin ingreso al presentar (ni aplazamiento con aval o seguro de caución) no hay reducción, y además se abre el periodo ejecutivo.',
      },
      {
        id: 'b',
        text: 'Se le liquidará el recargo del art. 27 sin reducción y, además, el periodo ejecutivo empieza al día siguiente de presentar, con sus recargos del 5 %, 10 % o 20 %.',
      },
      {
        id: 'c',
        text: 'La autoliquidación se tiene por no presentada y la AEAT impondrá una sanción por no presentarla.',
        feedback: 'La autoliquidación sí se tiene por presentada; lo que falta es el ingreso, y eso abre el periodo ejecutivo.',
      },
      {
        id: 'd',
        text: 'Solo intereses de demora hasta que pague, porque el recargo del art. 27 exige haber ingresado la cuota.',
        feedback: 'El recargo se devenga por presentar tarde, se ingrese o no; y la falta de ingreso suma los recargos del periodo ejecutivo.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'Si no se ingresa ni se solicita aplazamiento, fraccionamiento o compensación al presentar, la liquidación del recargo del art. 27 no impide exigir los recargos e intereses del periodo ejecutivo (art. 27.3 LGT), que empieza el día siguiente a la presentación (art. 161.1.b LGT). Además, se pierde la reducción del 25 % (art. 27.5 LGT).',
    ref: 'apartado 3, «La reducción del 25 % y el error de presentar sin pagar»',
  },
  {
    id: 'fis-01-b4',
    prompt:
      'En una comprobación limitada, la AEAT regulariza una cuota de 2.000 € y, por la falta de ingreso, impone una sanción leve del 50 % (1.000 €). El cliente no recurre la liquidación ni la sanción y paga la sanción en el plazo del art. 62.2 LGT. ¿Cuánto paga de sanción?',
    options: [
      { id: 'a', text: '300 €', feedback: 'Suma los porcentajes (30 % + 40 % = 70 %), pero el 40 % se aplica sobre la sanción ya reducida por conformidad.' },
      { id: 'b', text: '700 €', feedback: 'Aplica solo la reducción por conformidad y olvida la del 40 % por pronto pago, que procede porque paga en plazo y no recurre.' },
      { id: 'c', text: '750 €', feedback: 'Aplica una reducción del 25 %, que es la del recargo del art. 27, no la de las sanciones.' },
      { id: 'd', text: '420 €' },
    ],
    correctOptionId: 'd',
    explanation:
      'Primero se aplica la reducción por conformidad del 30 % (en una comprobación limitada se entiende prestada si no se recurre la liquidación): 1.000 × 0,70 = 700 €. Después, el 40 % por pronto pago sobre esa cantidad: 700 × 0,60 = 420 € (arts. 187.1.d y 188 LGT; art. 7.1 RGST).',
    ref: 'apartado 4, «Si la AEAT se adelanta: intereses y sanción»',
  },
];

import type { Formation, QuizQuestion } from '@flm/shared';

export const formation: Formation = {
  id: 'lab-01',
  slug: 'despido-tipos-forma-indemnizacion',
  area: 'laboral',
  title: 'Despido disciplinario y objetivo: forma, calificación e indemnización',
  intro:
    'Imagina que el gerente de una pyme cliente te escribe: quiere despedir «por WhatsApp, que es más rápido» a una administrativa contratada en 2009 que lleva dos semanas de baja. Antes de contestar, necesitas saber qué despido encaja, qué forma exige, cuánto costaría si sale mal y de qué plazo dispone ella para reclamar.',
  summary:
    'Disciplinario u objetivo: forma de la carta (también por WhatsApp), calificación, cálculo en dos tramos para contratos anteriores a 2012, despido durante la baja y plazo para impugnar.',
  coverTerm: '33 días',
  readingMinutes: 11,
  outcomes: [
    'Identificar el tipo de despido y comprobar su forma, también cuando se comunica por WhatsApp o correo electrónico.',
    'Calcular la indemnización de 20, 33 o 45 y 33 días por año, con prorrateo por meses y topes.',
    'Decidir cómo asesorar ante un despido durante la baja médica y controlar el plazo para impugnarlo.',
  ],
  blocks: [
    /* ── 1 · Tipos y calificación ─────────────────────────────────────────── */
    { type: 'heading', text: 'Disciplinario u objetivo: la causa marca el camino', id: 'tipos-de-despido' },
    {
      type: 'paragraph',
      text: 'La empresa puede despedir por dos vías. El **despido disciplinario** exige un incumplimiento grave y culpable, como las faltas repetidas de asistencia, la indisciplina, la transgresión de la buena fe, la disminución voluntaria del rendimiento o el acoso ([art. 54 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a54)). El **despido objetivo** no exige culpa: puede deberse a la ineptitud, a la falta de adaptación a cambios técnicos o a causas económicas, técnicas, organizativas o de producción por debajo de los umbrales del despido colectivo, entre otros supuestos ([art. 52 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a52)).',
    },
    {
      type: 'paragraph',
      text: 'Si la persona lo impugna, el juzgado califica el despido ([art. 55.3 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a55)), y esa calificación decide el coste:',
    },
    {
      type: 'list',
      items: [
        '**Procedente**: se acreditan la causa y la forma. El disciplinario no genera indemnización; en el objetivo, la persona conserva los 20 días por año ([arts. 55.7](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a55) y [53.5 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a53)).',
        '**Improcedente**: no se prueba la causa o falla la forma. La empresa elige entre readmitir o indemnizar.',
        '**Nulo**: es discriminatorio, vulnera derechos fundamentales o afecta a una situación protegida, como el embarazo o los permisos de cuidado, salvo que se declare procedente por motivos ajenos a ella. Obliga a readmitir de inmediato con los salarios dejados de percibir ([art. 55.5 y 55.6 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a55)).',
      ],
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'El despido improcedente',
      text: 'Cuando el juzgado declara el [[despido improcedente]], la empresa tiene **5 días** desde la notificación de la sentencia para elegir: readmitir y pagar los [[salarios de tramitación]], o indemnizar con **33 días de salario por año**, hasta 24 mensualidades. Si no elige, se entiende que readmite. Si la persona es representante legal o delegado sindical, la opción es suya y cobra salarios de tramitación en todo caso ([art. 56 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a56)).',
    },
    {
      type: 'widget',
      widget: {
        kind: 'comparativa',
        title: 'Disciplinario frente a objetivo',
        columns: ['Disciplinario', 'Objetivo'],
        rows: [
          { label: 'Causa', values: ['Incumplimiento grave y culpable', 'Ineptitud, falta de adaptación o causas económicas, técnicas, organizativas o de producción'] },
          { label: 'Carta', values: ['Hechos y fecha de efectos', 'Causa'] },
          { label: 'Además', values: ['Audiencia previa; expediente contradictorio si es representante', 'Preaviso de 15 días e indemnización puesta a disposición'] },
          { label: 'Si es procedente', values: ['Sin indemnización', '20 días por año, máximo 12 mensualidades'] },
          { label: 'Si es improcedente', values: ['Readmisión con salarios de tramitación o 33 días por año (45 y 33 si el contrato es anterior al 12/02/2012)', 'Igual, descontando o devolviendo lo cobrado'] },
          { label: 'Si es nulo', values: ['Readmisión inmediata y salarios dejados de percibir', 'Igual'] },
        ],
      },
      caption: 'Las dos vías, de la causa a los efectos de cada calificación.',
    },

    /* ── 2 · Forma ───────────────────────────────────────────────────────── */
    { type: 'heading', text: 'La forma: qué debe contener la comunicación', id: 'forma' },
    {
      type: 'paragraph',
      text: '**Disciplinario.** El despido se notifica **por escrito**, con los hechos que lo motivan y la fecha de efectos, más lo que exija el convenio. Si la persona es representante legal o delegado sindical, hay que abrir expediente contradictorio; si a la empresa le consta su afiliación sindical, debe oír antes a los delegados sindicales de su sección ([art. 55.1 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a55)).',
    },
    {
      type: 'paragraph',
      text: 'Sin esa forma, el despido es improcedente ([art. 55.4 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a55)), aunque la empresa puede hacer uno nuevo en forma en los 20 días siguientes, pagando los salarios intermedios y manteniendo el alta ([art. 55.2 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a55)). En el juicio solo podrá defender los motivos que figuren en la carta ([art. 105.2 LRJS](https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936#a105)).',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Audiencia previa en el despido disciplinario',
      text: 'Desde noviembre de 2024, el Pleno de la Sala de lo Social del Tribunal Supremo aplica directamente el art. 7 del Convenio 158 de la OIT: antes de despedir por conducta o rendimiento, hay que ofrecer a la persona la posibilidad de defenderse de los cargos, «a menos que no pueda pedirse razonablemente al empleador». Rige para los despidos posteriores a su sentencia. Hazlo por escrito, con un plazo razonable para responder, y guarda la prueba.',
      refs: [
        { label: 'Convenio n.º 158 de la OIT, art. 7 (BOE de 29/06/1985)', url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-1985-12535', date: '2026-10-28', kind: 'norma' },
        {
          label: 'Tribunal Supremo, Pleno de la Sala de lo Social: sentencia ECLI:ES:TS:2024:5454 (nota de 18/11/2024)',
          url: 'https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Noticias-Judiciales/El-Tribunal-Supremo-fija-que-las-empresas-no-pueden-despedir-disciplinariamente-a-los-trabajadores-sin-abrir-tramite-de--audiencia-previa-',
          date: '2026-10-28',
          kind: 'jurisprudencia',
        },
      ],
    },
    {
      type: 'paragraph',
      text: '**Objetivo.** La carta debe expresar la causa, y al entregarla hay que hacer la [[puesta a disposición]] de la indemnización: 20 días por año, con un máximo de 12 mensualidades. Solo puede aplazarse si una causa económica lo impide y así consta. El preaviso es de **15 días**, con copia a la representación legal si la causa es del art. 52.c, y da derecho a 6 horas semanales de permiso retribuido para buscar empleo ([art. 53.1 y 53.2 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a53)).',
    },
    {
      type: 'paragraph',
      text: 'Sin causa acreditada, carta o indemnización, el despido objetivo es improcedente. En cambio, no dar el preaviso o un error excusable en la cifra no lo hacen improcedente: se pagan esos salarios o la diferencia ([art. 53.4 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a53)).',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: '¿Vale un WhatsApp o un correo electrónico?',
      text: 'El Estatuto exige una comunicación **escrita** con un contenido mínimo, pero no regula el canal. Un correo o un WhatsApp solo vale si recoge los hechos y la fecha de efectos (la causa, en el objetivo) y la empresa puede probar que llegó y qué decía. «Desde mañana no vengas» no describe ningún hecho: el despido sería, como mínimo, improcedente.\n\nPara no depender de capturas, entrega la carta en mano con firma de recibí (ante testigos si no firma) o por burofax con certificación de texto.',
      refs: [
        { label: 'Estatuto de los Trabajadores, arts. 53.1 y 55.1', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a55', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley reguladora de la jurisdicción social, art. 105.2', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936#a105', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 3 · Cálculo ─────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Cómo se calcula la indemnización', id: 'calculo' },
    {
      type: 'paragraph',
      text: 'Parte del [[salario regulador]]: el salario bruto anual al despedir, con todos los conceptos salariales, en dinero o en especie, y la prorrata de pagas extra, sin percepciones extrasalariales como dietas o suplidos ([art. 26 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a26)). Divídelo entre 365, que es el criterio habitual.\n\nDespués, cuenta la antigüedad hasta la fecha de efectos. Los periodos inferiores al año se prorratean por meses ([arts. 53.1.b](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a53) y [56.1 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a56)), y el criterio habitual es contar como mes completo los días sueltos. No redondees los días: solo el importe final.',
    },
    {
      type: 'table',
      caption: 'Días de salario por año de servicio y topes (en días, con la convención habitual de 30 días por mensualidad)',
      columns: ['Supuesto', 'Días por año', 'Tope'],
      rows: [
        ['Objetivo procedente', '20', '12 mensualidades (360 días)'],
        ['Improcedente, contrato desde el 12/02/2012', '33', '24 mensualidades (720 días)'],
        ['Improcedente, contrato anterior al 12/02/2012', '45 hasta el 11/02/2012 y 33 después', '720 días, o los del primer tramo si son más, hasta 42 mensualidades (1.260 días)'],
      ],
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Contratos anteriores al 12/02/2012: el doble tramo',
      text: 'En los contratos anteriores al 12/02/2012, la DT 11.ª ET divide la indemnización por despido improcedente en dos tramos, cada uno prorrateado por meses: 45 días por año hasta el 11/02/2012 y 33 desde entonces. Si el primer tramo ya supera 720 días, ese número es el tope y el segundo no suma, con un límite absoluto de 42 mensualidades.\n\nEl objetivo procedente no tiene tramos: siempre son 20 días por año. Y si el contrato era de fomento de la contratación indefinida, en el despido objetivo se rige por su normativa de origen (DT 11.ª.3 ET).',
      refs: [
        { label: 'Estatuto de los Trabajadores, disposición transitoria undécima', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#dtundecima', date: '2026-10-28', kind: 'norma' },
        { label: 'Real Decreto-ley 3/2012, de 10 de febrero (en vigor desde el 12/02/2012)', url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2012-2076', date: '2026-10-28', kind: 'norma' },
      ],
    },
    {
      type: 'example',
      title: 'Despido objetivo de una administrativa contratada en 2009',
      scenario:
        'Laura, administrativa de una pyme cliente, tiene contrato indefinido desde el **12/06/2009** y cobra **32.850 €** brutos al año con las pagas extra prorrateadas. El martes 27/10/2026 recibe una carta de despido objetivo por causas productivas, con efectos del 11/11/2026. ¿Es correcta la cantidad puesta a disposición? ¿Cuánto costaría una improcedencia?',
      steps: [
        { label: 'Salario diario: bruto anual con prorrata de pagas, entre 365.', formula: '32.850 € ÷ 365', result: '90,00 € al día' },
        { label: 'Antigüedad hasta la fecha de efectos, sin días sueltos.', formula: '12/06/2009 → 11/11/2026', result: '17 años y 5 meses (209 meses)' },
        { label: 'Objetivo procedente: 20 días por año. El tope de 360 días no se alcanza.', formula: '20 × 209 ÷ 12 = 348,333… días × 90,00 €', result: '31.350,00 €' },
        { label: 'Improcedente, primer tramo (12/06/2009 a 11/02/2012): 2 años y 8 meses a 45 días.', formula: '45 × 32 ÷ 12', result: '120,00 días' },
        {
          label: 'Segundo tramo (12/02/2012 a 11/11/2026): 14 años y 9 meses a 33 días. El total no llega al tope de 720.',
          formula: '33 × 177 ÷ 12 = 486,75 días; (120,00 + 486,75) × 90,00 €',
          result: '54.607,50 €',
        },
        {
          label: 'Si se declara improcedente y la empresa indemniza, descuenta lo ya cobrado ([art. 53.5.b ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a53)).',
          formula: '54.607,50 € − 31.350,00 €',
          result: '23.257,50 € más',
        },
      ],
      conclusion:
        'La cifra puesta a disposición, **31.350,00 €**, es correcta, y el preaviso se cumple (del 28/10 al 11/11 hay 15 días). Una improcedencia costaría **54.607,50 €**; si la empresa readmite, Laura devuelve lo cobrado y percibe salarios de tramitación. Error típico: aplicar 33 días a toda la antigüedad (51.727,50 €) infravalora el riesgo en 2.880,00 €.',
    },
    {
      type: 'widget',
      widget: { kind: 'indemnizacion-despido', salarioAnual: 32000, inicio: '2009-03-02', fin: '2026-10-30' },
      caption: 'Ahora, otro caso: 32.000 € anuales, alta el 02/03/2009 y efectos el 30/10/2026. Hay días sueltos en los dos tramos, y cada uno se prorratea por separado.',
    },

    /* ── 4 · Baja médica ─────────────────────────────────────────────────── */
    { type: 'heading', text: 'Despido durante la baja médica', id: 'baja-medica' },
    {
      type: 'paragraph',
      text: 'La baja médica no está entre los supuestos de nulidad del [art. 55.5 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a55), salvo la causada por embarazo, parto o lactancia natural: despedir a alguien de baja no es nulo por sí solo. Pero desde el 14/07/2022 la [Ley 15/2022](https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589) prohíbe discriminar por «enfermedad o condición de salud» ([art. 2.1](https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589#a2)), también en el despido ([art. 9.1](https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589#a9)), y declara nulos los actos discriminatorios ([art. 26](https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589#a2-8)).',
    },
    {
      type: 'paragraph',
      text: 'Todo depende del **móvil**. Si la persona aporta indicios fundados de que se la despidió por su enfermedad (por ejemplo, una carta genérica días después del parte de baja), la empresa debe probar una justificación objetiva y razonable ([art. 30](https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589#a3-2)). Si no lo consigue, el juzgado puede declarar un [[despido nulo]]: readmisión, salarios dejados de percibir e indemnización por el daño moral, que se presume ([art. 27](https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589#a2-9)).',
    },
    {
      type: 'paragraph',
      text: 'Ten en cuenta, además, que desde 2020 no cabe el despido objetivo por faltas de asistencia intermitentes, aunque estén justificadas, porque se derogó la letra d del [art. 52 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a52), y que una baja de duración incierta puede encajar en el concepto de discapacidad si la limitación es «duradera» ([STJUE de 1/12/2016, C-395/15, Daouidi](https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:62015CJ0395)).',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Si la persona está de baja',
      text: 'Solo es defendible un despido con una causa real, documentada y ajena a la salud, mejor con pruebas anteriores a la baja. Pregunta al cliente desde cuándo existe la causa y qué documentos la acreditan. Una carta genérica justo después del parte es el escenario de más riesgo.',
    },

    /* ── 5 · Plazos ──────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Plazo para impugnar y siguientes pasos', id: 'plazos' },
    {
      type: 'paragraph',
      text: 'La persona despedida puede reclamar en los **20 días hábiles** siguientes al despido. Es un plazo de [[caducidad]]: si vence, pierde la acción. No cuentan los sábados, los domingos ni los festivos de la sede del juzgado; en cambio, en el despido sí cuentan agosto y los días del 24 de diciembre al 6 de enero que no sean festivos ([art. 59.3 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a59); [arts. 43.4](https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936#a43) y [103.1 LRJS](https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936#a103)).',
    },
    {
      type: 'paragraph',
      text: 'Antes de demandar hay que intentar la **conciliación** ([art. 63 LRJS](https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936#a63)). La papeleta suspende la caducidad, que se reanuda al día siguiente del intento de conciliación o, si no se celebra, a los 15 días hábiles de presentarla. El plazo no empieza de nuevo: los días consumidos no se recuperan ([art. 65.1 LRJS](https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936#a65)).',
    },
    {
      type: 'paragraph',
      text: 'Tras una sentencia de improcedencia corren los **5 días** para optar, y si se dicta más de 90 días hábiles después de la demanda, la empresa puede reclamar al Estado los salarios de tramitación del exceso ([art. 56.5 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a56)).',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: '¿Va a cambiar la indemnización?',
      text: 'La Sala de lo Social del Tribunal Supremo, en Pleno, ha rechazado que los jueces aumenten la indemnización del art. 56 ET, también cuando se invoca la Carta Social Europea.\n\nEl Plan Anual Normativo 2026, aprobado el 05/05/2026, prevé reformar el despido y su indemnización, pero a 28/10/2026 no se ha publicado ningún cambio y las Cortes están disueltas, con elecciones el 29/11/2026: hasta la nueva legislatura, solo un real decreto-ley podría cambiarlo. Hoy rigen las reglas de esta formación.',
      refs: [
        {
          label: 'Tribunal Supremo, Pleno de la Sala de lo Social: sentencia ECLI:ES:TS:2024:6112 (nota de 20/12/2024)',
          url: 'https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Noticias-Judiciales/El-Tribunal-Supremo-concluye-que-no-es-posible-incrementar-en-via-judicial-la-indemnizacion-por-despido-improcedente-del-art-56-del-Estatuto-de-Trabajadores',
          date: '2026-10-28',
          kind: 'jurisprudencia',
        },
        {
          label: 'Tribunal Supremo, Pleno de la Sala de lo Social: sentencia ECLI:ES:TS:2025:3387 (nota de 16/07/2025)',
          url: 'https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Noticias-Judiciales/El-Tribunal-Supremo-establece-que-la-indemnizacion-por-despido-improcedente-no-puede-verse-incrementada-en-la-via-judicial-',
          date: '2026-10-28',
          kind: 'jurisprudencia',
        },
        {
          label: 'Plan Anual Normativo 2026 de la Administración General del Estado',
          url: 'https://transparencia.gob.es/content/dam/transparencia_home/publicidadactiva/normativa/pan2026/PAN%202026.pdf',
          date: '2026-10-28',
          kind: 'documento',
        },
        {
          label: 'Consejo de Ministros: referencia del 05/05/2026 (aprobación del Plan Anual Normativo 2026)',
          url: 'https://www.lamoncloa.gob.es/consejodeministros/referencias/Paginas/2026/20260505-referencia-rueda-de-prensa-ministros.aspx',
          date: '2026-10-28',
          kind: 'documento',
        },
        { label: 'Real Decreto 806/2026, de 5 de octubre, de disolución de las Cortes y convocatoria de elecciones', url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20742', date: '2026-10-28', kind: 'norma' },
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'tarjetas-verdad',
        title: '¿Despido o no?',
        cards: [
          {
            claim: 'Un WhatsApp que dice «desde mañana no vengas» es un despido.',
            verdict: 'verdadero',
            explanation: 'Expresa la voluntad de extinguir el contrato. Al no recoger los hechos, será como mínimo improcedente (art. 55.4 ET), pero hay que impugnarlo en 20 días hábiles.',
          },
          {
            claim: 'Si la carta no detalla los hechos, el despido no produce efectos.',
            verdict: 'falso',
            explanation: 'Los produce: si no se impugna a tiempo, queda firme. Además, la empresa puede rehacerlo en forma en 20 días (art. 55.2 ET).',
          },
          {
            claim: 'Despedir a una persona de baja médica es nulo.',
            verdict: 'depende',
            explanation: 'Lo es si el móvil es la enfermedad (Ley 15/2022) o si la baja se debe a embarazo, parto o lactancia (art. 55.5 ET). Con una causa real, probada y ajena a la salud, puede ser procedente.',
          },
          {
            claim: 'Si la empresa no opta en 5 días tras la sentencia de improcedencia, el trabajador vuelve a su puesto.',
            verdict: 'verdadero',
            explanation: 'Se entiende que readmite, con salarios de tramitación (art. 56.2 y 56.3 ET).',
          },
        ],
      },
      caption: 'Decide si cada afirmación es verdadera, falsa o depende.',
    },
  ],
  keyTerms: [
    {
      term: 'despido improcedente',
      definition: 'El que no acredita la causa o incumple la forma exigida. Obliga a la empresa a elegir, en 5 días, entre readmitir o indemnizar.',
    },
    {
      term: 'despido nulo',
      definition: 'El discriminatorio, el que vulnera derechos fundamentales o el que afecta a una situación protegida del art. 55.5 ET, salvo que se declare procedente por motivos ajenos a ella. Obliga a readmitir con los salarios dejados de percibir.',
    },
    {
      term: 'puesta a disposición',
      definition: 'Entrega efectiva de la indemnización de 20 días por año al dar la carta de despido objetivo. Solo puede aplazarse por una causa económica que conste en ella.',
    },
    {
      term: 'salario regulador',
      definition: 'Salario bruto anual al despedir, con todos los conceptos salariales y la prorrata de pagas extra, sin percepciones extrasalariales. Dividido entre 365 (criterio habitual), da el salario diario.',
    },
    {
      term: 'salarios de tramitación',
      definition: 'Salarios dejados de percibir desde el despido hasta la notificación de la sentencia, menos lo cobrado en otro empleo. Se deben si hay readmisión y, a representantes legales y delegados sindicales, siempre.',
    },
    {
      term: 'caducidad',
      definition: 'Plazo de 20 días hábiles para impugnar el despido; si vence, la acción se pierde. La papeleta de conciliación lo suspende, pero no lo reinicia.',
    },
  ],
  takeaway:
    'Antes de calcular, califica: la causa, la forma (carta, puesta a disposición y audiencia previa) y el móvil deciden si el despido se sostiene; el preaviso omitido solo se paga. Después, calcula con el salario diario, el prorrateo por meses y, en contratos anteriores al 12/02/2012, los dos tramos con sus topes.',
  sources: [
    {
      label: 'Real Decreto Legislativo 2/2015, texto refundido de la Ley del Estatuto de los Trabajadores (arts. 26, 52 a 56 y 59 y DT 11.ª)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Ley 36/2011, reguladora de la jurisdicción social (arts. 43, 63, 65, 103, 105 y 108)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2011-15936',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Ley 15/2022, integral para la igualdad de trato y la no discriminación (arts. 2, 9, 26, 27 y 30)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Convenio n.º 158 de la OIT sobre la terminación de la relación de trabajo (BOE de 29/06/1985)',
      url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-1985-12535',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Real Decreto-ley 3/2012, de 10 de febrero, de medidas urgentes para la reforma del mercado laboral',
      url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2012-2076',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Tribunal Supremo, Pleno de la Sala de lo Social: audiencia previa al despido disciplinario, ECLI:ES:TS:2024:5454 (nota de 18/11/2024)',
      url: 'https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Noticias-Judiciales/El-Tribunal-Supremo-fija-que-las-empresas-no-pueden-despedir-disciplinariamente-a-los-trabajadores-sin-abrir-tramite-de--audiencia-previa-',
      date: '2026-10-28',
      kind: 'jurisprudencia',
    },
    {
      label: 'Tribunal Supremo, Pleno de la Sala de lo Social: indemnización del art. 56 ET y Convenio 158 de la OIT, ECLI:ES:TS:2024:6112 (nota de 20/12/2024)',
      url: 'https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Noticias-Judiciales/El-Tribunal-Supremo-concluye-que-no-es-posible-incrementar-en-via-judicial-la-indemnizacion-por-despido-improcedente-del-art-56-del-Estatuto-de-Trabajadores',
      date: '2026-10-28',
      kind: 'jurisprudencia',
    },
    {
      label: 'Tribunal Supremo, Pleno de la Sala de lo Social: art. 24 de la Carta Social Europea, ECLI:ES:TS:2025:3387 (nota de 16/07/2025)',
      url: 'https://www.poderjudicial.es/cgpj/es/Poder-Judicial/Tribunal-Supremo/Noticias-Judiciales/El-Tribunal-Supremo-establece-que-la-indemnizacion-por-despido-improcedente-no-puede-verse-incrementada-en-la-via-judicial-',
      date: '2026-10-28',
      kind: 'jurisprudencia',
    },
    {
      label: 'Sentencia del Tribunal de Justicia de la Unión Europea de 1/12/2016, asunto C-395/15, Daouidi',
      url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:62015CJ0395',
      date: '2026-10-28',
      kind: 'jurisprudencia',
    },
    {
      label: 'Plan Anual Normativo 2026 de la Administración General del Estado (aprobado el 05/05/2026)',
      url: 'https://transparencia.gob.es/content/dam/transparencia_home/publicidadactiva/normativa/pan2026/PAN%202026.pdf',
      date: '2026-10-28',
      kind: 'documento',
    },
    {
      label: 'Real Decreto 806/2026, de 5 de octubre, de disolución del Congreso de los Diputados y del Senado y de convocatoria de elecciones',
      url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20742',
      date: '2026-10-28',
      kind: 'norma',
    },
  ],
  quiz: {
    id: 'lab-01-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'lab-01-q1',
        prompt: 'Una empresa envía a un trabajador este WhatsApp: «Desde mañana no vengas, estás despedido». No hay ninguna otra comunicación y el trabajador demanda en plazo. ¿Cuál es la calificación más probable?',
        options: [
          {
            id: 'a',
            text: 'Nulo, porque el Estatuto de los Trabajadores prohíbe comunicar el despido por medios electrónicos.',
            feedback: 'El Estatuto no prohíbe ningún canal. La nulidad se reserva a la discriminación, la vulneración de derechos fundamentales y los supuestos del art. 55.5 ET; un defecto de forma no la provoca.',
          },
          {
            id: 'b',
            text: 'Procedente, si en el juicio la empresa prueba las faltas graves que motivaron el despido.',
            feedback: 'En el juicio la empresa no puede alegar motivos que no consten en la comunicación escrita (art. 105.2 LRJS), y el defecto de forma basta para la improcedencia. Lo que podía hacer era un nuevo despido en forma en los 20 días siguientes (art. 55.2 ET).',
          },
          { id: 'c', text: 'Improcedente, porque la comunicación no recoge los hechos que motivan el despido, como exige el art. 55.1 ET.' },
          {
            id: 'd',
            text: 'No hay despido mientras la empresa no entregue una carta, así que el contrato sigue vigente.',
            feedback: 'El mensaje expresa la voluntad de extinguir el contrato: hay despido, aunque sea defectuoso. Si el trabajador no lo impugna en 20 días hábiles, pierde la acción.',
          },
        ],
        correctOptionId: 'c',
        explanation: 'El despido disciplinario debe notificarse por escrito, con los hechos que lo motivan y la fecha de efectos (art. 55.1 ET). Si la forma no se ajusta a ese apartado, el despido es improcedente (art. 55.4 ET y art. 108.1 LRJS).',
        ref: 'Apartado 2: La forma: qué debe contener la comunicación',
      },
      {
        id: 'lab-01-q2',
        prompt: 'Un contrato indefinido comenzó el 12/03/2010. El despido, con efectos del 11/05/2026, se declara improcedente y la empresa opta por indemnizar. El salario diario es de 100 €. ¿Qué indemnización corresponde?',
        options: [
          {
            id: 'a',
            text: '53.350,00 €',
            feedback: 'Aplica 33 días a toda la antigüedad (533,5 días). El tiempo trabajado hasta el 11/02/2012 se paga a 45 días por año (DT 11.ª ET).',
          },
          { id: 'b', text: '55.650,00 €' },
          {
            id: 'c',
            text: '72.750,00 €',
            feedback: 'Aplica 45 días a toda la antigüedad (727,5 días). El tiempo trabajado desde el 12/02/2012 se paga a 33 días y, además, esa cifra superaría el tope de 720 días.',
          },
          {
            id: 'd',
            text: '32.333,33 €',
            feedback: 'Es la indemnización del despido objetivo procedente (20 días por año), no la de la improcedencia.',
          },
        ],
        correctOptionId: 'b',
        explanation: 'Hay dos tramos (DT 11.ª ET). Del 12/03/2010 al 11/02/2012 hay 1 año y 11 meses: 45 × 23 ÷ 12 = 86,25 días. Del 12/02/2012 al 11/05/2026 hay 14 años y 3 meses: 33 × 171 ÷ 12 = 470,25 días. En total, 556,5 días, por debajo del tope de 720: 556,5 × 100 € = 55.650,00 €.',
        ref: 'Apartado 3: Cómo se calcula la indemnización',
      },
      {
        id: 'lab-01-q3',
        prompt: 'Una trabajadora de baja por una lumbalgia recibe, dos días después de que la empresa conozca su baja, una carta de despido por «bajo rendimiento» sin hechos concretos. Con la Ley 15/2022 en vigor, ¿qué afirmación es correcta?',
        options: [
          {
            id: 'a',
            text: 'El despido es nulo automáticamente porque se produce durante la incapacidad temporal.',
            feedback: 'La incapacidad temporal no está en la lista de nulidad del art. 55.5 ET, salvo la causada por embarazo, parto o lactancia. Aquí la nulidad exigiría que la enfermedad fuera el móvil del despido.',
          },
          {
            id: 'b',
            text: 'La enfermedad no es un motivo de discriminación, así que como mucho el despido será improcedente.',
            feedback: 'Es el planteamiento anterior a la Ley 15/2022. Desde el 14/07/2022, la «enfermedad o condición de salud» es un motivo de discriminación prohibido (art. 2.1).',
          },
          {
            id: 'c',
            text: 'Solo podría ser nulo si la baja supera los 12 meses, porque entonces equivale siempre a una discapacidad.',
            feedback: 'No existe esa regla. El TJUE valora si la limitación es «duradera» con indicios como la falta de una perspectiva bien delimitada de finalización a corto plazo, y la Ley 15/2022 protege la enfermedad aunque no sea una discapacidad.',
          },
          {
            id: 'd',
            text: 'Si ella aporta indicios fundados de que su enfermedad fue el motivo, la empresa debe probar una justificación objetiva y razonable; si no lo consigue, el despido puede declararse nulo.',
          },
        ],
        correctOptionId: 'd',
        explanation: 'La Ley 15/2022 prohíbe discriminar por enfermedad o condición de salud (art. 2.1), también en el despido (art. 9.1), y declara nulos los actos discriminatorios (art. 26). Con indicios fundados, la carga de justificar recae en la empresa (art. 30). Y aunque no se apreciara discriminación, una carta sin hechos haría el despido improcedente.',
        ref: 'Apartado 4: Despido durante la baja médica',
      },
    ],
  },
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-cristina-sebastian',
    publishedAt: '2026-10-08T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: '2026-10-28',
};

export const bank: QuizQuestion[] = [
  {
    id: 'lab-01-b1',
    prompt: 'Una trabajadora despedida presenta la papeleta de conciliación cuando ya han transcurrido íntegros 12 de los 20 días hábiles de caducidad. El acto se celebra sin avenencia 10 días hábiles después de presentarla. ¿De qué plazo dispone para presentar la demanda?',
    options: [
      {
        id: 'a',
        text: 'De 20 días hábiles nuevos, a contar desde el día siguiente al acto de conciliación.',
        feedback: 'La papeleta no reinicia la caducidad: solo la suspende, y los días consumidos no se recuperan (art. 65.1 LRJS).',
      },
      {
        id: 'b',
        text: 'De ninguno: la papeleta no afecta a la caducidad, así que el plazo siguió corriendo.',
        feedback: 'La papeleta sí suspende la caducidad desde su presentación (art. 65.1 LRJS). Además, 12 días consumidos no agotan los 20.',
      },
      { id: 'c', text: 'De los 8 días hábiles que le quedaban, que vuelven a correr desde el día siguiente al intento de conciliación.' },
      {
        id: 'd',
        text: 'De un año, porque tras la conciliación se aplica el plazo general del art. 59.1 ET.',
        feedback: 'La acción de despido tiene un plazo especial de caducidad de 20 días hábiles (art. 59.3 ET y art. 103.1 LRJS). El año del art. 59.1 es para las acciones sin plazo especial.',
      },
    ],
    correctOptionId: 'c',
    explanation: 'La presentación de la papeleta suspende la caducidad, y el cómputo se reanuda al día siguiente de intentada la conciliación, o a los 15 días hábiles de la presentación si no se ha celebrado (art. 65.1 LRJS). Como el acto se celebró antes de esos 15 días, el plazo se reanuda al día siguiente del acto con los 8 días hábiles no consumidos.',
    ref: 'Despido disciplinario y objetivo, apartado 5: Plazo para impugnar y siguientes pasos',
  },
  {
    id: 'lab-01-b2',
    prompt: 'Una sentencia declara improcedente el despido de un trabajador que no es representante legal ni delegado sindical; su convenio no le atribuye la opción. En los 5 días siguientes a la notificación, la empresa no manifiesta nada. ¿Qué ocurre?',
    options: [
      {
        id: 'a',
        text: 'Se entiende que opta por indemnizar con 33 días por año.',
        feedback: 'El silencio no equivale a elegir la indemnización: la ley presume lo contrario (art. 56.3 ET).',
      },
      {
        id: 'b',
        text: 'El contrato queda extinguido sin indemnización por no haber elegido.',
        feedback: 'Esa consecuencia no existe. La extinción sin indemnización solo se da en el despido procedente (art. 55.7 ET).',
      },
      {
        id: 'c',
        text: 'La opción pasa automáticamente al trabajador.',
        feedback: 'La ley solo da la opción a la persona despedida si es representante legal o delegado sindical (art. 56.4 ET), y el convenio puede atribuírsela en otros casos; pero el silencio de la empresa nunca se la traslada.',
      },
      { id: 'd', text: 'Se entiende que opta por la readmisión, con abono de los salarios de tramitación.' },
    ],
    correctOptionId: 'd',
    explanation: 'Si la empresa no opta en plazo, se entiende que elige la readmisión (art. 56.3 ET), y la readmisión conlleva los salarios de tramitación (art. 56.2 ET).',
    ref: 'Despido disciplinario y objetivo, apartado 1: Disciplinario u objetivo: la causa marca el camino',
  },
  {
    id: 'lab-01-b3',
    prompt: 'Una empresa va a despedir disciplinariamente a una comercial por una disminución continuada y voluntaria de su rendimiento. Según la doctrina que fijó en noviembre de 2024 la Sala de lo Social del Tribunal Supremo, en Pleno, ¿qué debe hacer antes de despedirla?',
    options: [
      {
        id: 'a',
        text: 'Tramitar un expediente contradictorio con audiencia a toda la representación legal de la plantilla.',
        feedback: 'El expediente contradictorio solo es obligatorio si la persona despedida es representante legal o delegado sindical (art. 55.1 ET).',
      },
      { id: 'b', text: 'Ofrecerle la posibilidad de defenderse de los cargos, salvo que no pueda pedirse razonablemente a la empresa.' },
      {
        id: 'c',
        text: 'Nada más: la audiencia previa solo es exigible si la prevé el convenio colectivo.',
        feedback: 'Ese era el criterio anterior. Desde noviembre de 2024, el Tribunal Supremo aplica directamente el art. 7 del Convenio 158 de la OIT; además, el convenio puede añadir otras exigencias formales (art. 55.1 ET).',
      },
      {
        id: 'd',
        text: 'Pedir autorización previa a la Inspección de Trabajo.',
        feedback: 'El Estatuto no exige ninguna autorización administrativa para el despido individual.',
      },
    ],
    correctOptionId: 'b',
    explanation: 'La Sala de lo Social del Tribunal Supremo, en Pleno, considera directamente aplicable el art. 7 del Convenio 158 de la OIT: no puede despedirse por motivos de conducta o rendimiento sin ofrecer antes la posibilidad de defenderse de los cargos, «a menos que no pueda pedirse razonablemente al empleador».',
    ref: 'Despido disciplinario y objetivo, apartado 2: La forma: qué debe contener la comunicación',
  },
  {
    id: 'lab-01-b4',
    prompt: 'Un contrato se inició el 12/06/1995 y el despido, con efectos del 11/11/2026, se declara improcedente. ¿Cuántos días de indemnización corresponden?',
    options: [
      { id: 'a', text: '750 días, porque el primer tramo ya supera 720 días y ese número pasa a ser el máximo.' },
      {
        id: 'b',
        text: '720 días, el tope general de 24 mensualidades.',
        feedback: 'El tope de 720 días no se aplica cuando el tramo anterior al 12/02/2012 ya da más días (DT 11.ª.2 ET).',
      },
      {
        id: 'c',
        text: '1.236,75 días: 750 del primer tramo más 486,75 del segundo.',
        feedback: 'Cuando el primer tramo supera 720 días, ese número opera como máximo: el segundo tramo no suma.',
      },
      {
        id: 'd',
        text: '42 mensualidades en todo caso, porque el contrato es anterior a 2012.',
        feedback: 'Las 42 mensualidades son un límite absoluto que no puede superarse, no una cifra que se aplique siempre.',
      },
    ],
    correctOptionId: 'a',
    explanation: 'Del 12/06/1995 al 11/02/2012 hay 16 años y 8 meses: 45 × 200 ÷ 12 = 750 días. Como superan 720, esa cifra es el importe máximo (DT 11.ª.2 ET), por debajo del límite absoluto de 42 mensualidades.',
    ref: 'Despido disciplinario y objetivo, apartado 3: Cómo se calcula la indemnización',
  },
];

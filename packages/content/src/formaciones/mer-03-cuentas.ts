import type { Formation, QuizQuestion } from '@flm/shared';

/**
 * mer-03 · Cuentas anuales: formular, aprobar y depositar a tiempo.
 * Preceptos comprobados el 28/10/2026 en los textos consolidados del BOE (LSC, RRM, Ley 14/2013,
 * RD 1515/2007, RD 2/2021, TRLC y Código Civil), en la Instrucción de la DGRN de 12/02/2015 y en
 * el texto oficial de la Directiva Delegada (UE) 2023/2775. Vigencia de la LSC, el RRM y el
 * RD 1515/2007 revisada de nuevo el 29/10/2026. El caso resuelto es ficticio.
 */
export const formation: Formation = {
  id: 'mer-03',
  slug: 'cuentas-anuales-plazos',
  area: 'mercantil',
  title: 'Cuentas anuales: formular, aprobar y depositar a tiempo',
  intro:
    'Una startup cierra una ronda de inversión y el Registro Mercantil no le inscribe la ampliación de capital: nadie depositó las cuentas de 2024 y, pasado un año desde el cierre de ese ejercicio, su hoja registral está cerrada. Además, el ICAC puede multarla. Para evitarlo, calcula el calendario de cada cliente desde su propia fecha de cierre y comprueba a tiempo si puede presentar cuentas abreviadas o debe auditarse.',
  summary:
    'Plazos para formular, legalizar libros, aprobar y depositar las cuentas; límites del modelo abreviado, el PGC de Pymes y la auditoría, y efectos de no depositar.',
  coverTerm: '3 · 6 · 1',
  readingMinutes: 11,
  outcomes: [
    'Calcular las fechas límite de formulación, legalización de libros, junta ordinaria, nombramiento de auditor y depósito a partir de cualquier fecha de cierre.',
    'Identificar si una sociedad puede formular cuentas abreviadas o aplicar el PGC de Pymes, y si debe auditarse, con la regla de 2 de 3 límites durante 2 ejercicios.',
    'Decidir cómo actuar ante unas cuentas no aprobadas o no depositadas y estimar sus consecuencias: cierre registral, multa del ICAC y riesgo concursal.',
  ],
  blocks: [
    /* ── 1 · Calendario ───────────────────────────────────────────────────── */
    { type: 'heading', text: 'El calendario: formular, legalizar, aprobar y depositar', id: 'calendario' },
    {
      type: 'paragraph',
      text: 'El calendario arranca el día de cierre del ejercicio, que no tiene por qué ser el 31 de diciembre. En los tres meses siguientes, los administradores deben formular las cuentas anuales, el informe de gestión (si es obligatorio) y la propuesta de aplicación del resultado: es la [[formulación]]. Firman todos los administradores y, si falta alguna firma, se señala en cada documento con expresión de la causa ([art. 253 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a253)).',
    },
    {
      type: 'paragraph',
      text: 'Antes de que pasen cuatro meses desde el cierre toca la [[legalización de libros]]: los libros obligatorios se llevan en soporte electrónico y se presentan por vía telemática en el Registro Mercantil ([art. 18 Ley 14/2013](https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074#a18)). Cada año se legalizan el Diario, el de Inventarios y Cuentas anuales y el de actas; el registro de socios o de acciones nominativas, solo si en el ejercicio ha cambiado la titularidad o se han constituido gravámenes. Si llegan tarde, el registrador los legaliza, pero hace constar que se pidió fuera del plazo legal ([reglas 8.ª, 10.ª y 21.ª de la Instrucción de la DGRN de 12/02/2015](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2015-1481)).',
    },
    {
      type: 'paragraph',
      text: 'La junta general ordinaria se reúne dentro de los seis primeros meses del ejercicio para aprobar, en su caso, la gestión social, las cuentas del ejercicio anterior y la aplicación del resultado; si se convoca o se celebra fuera de plazo, es válida, pero retrasa el depósito ([art. 164 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a164)). Entre la convocatoria y la junta debe haber al menos quince días en la SL y un mes en la SA ([art. 176 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a176)) y, desde la convocatoria, los socios pueden obtener gratis las cuentas y los informes ([art. 272 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a272)).',
    },
    {
      type: 'paragraph',
      text: 'Dentro del mes siguiente a la aprobación, los administradores presentan a [[depósito de cuentas]] en el Registro Mercantil del domicilio social la certificación de los acuerdos de aprobación de las cuentas y de aplicación del resultado, con firmas legitimadas, junto con las cuentas y, cuando procedan, los informes de gestión y de auditoría ([art. 279 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a279); [art. 366 RRM](https://www.boe.es/buscar/act.php?id=BOE-A-1996-17533#a366)). Si el registrador aprecia defectos, habrá que subsanarlos ([art. 280 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a280)): no lo dejes para el último día.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Cómo se cuentan los plazos',
      text: 'Los plazos en meses se cuentan de fecha a fecha y, si en el mes del vencimiento no existe el día equivalente, acaban el último día de ese mes; los días inhábiles no se excluyen. Así, 31/12/2026 + 4 meses = 30/04/2027, y 30/06/2026 + 4 meses = 30/10/2026. Si el último día cae en fin de semana, presenta antes.',
      refs: [{ label: 'Código Civil, art. 5', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763#art5', date: '2026-10-28', kind: 'norma' }],
    },
    {
      type: 'widget',
      widget: { kind: 'calendario-cuentas', cierre: '2026-12-31' },
      caption: 'Plazos que se derivan de un cierre a 31/12/2026.',
    },
    {
      type: 'table',
      caption: 'Mismas reglas, fechas distintas',
      columns: ['Trámite y regla', 'Cierre 31/12/2026', 'Cierre 30/06/2026'],
      rows: [
        ['Nombrar auditor, si debe auditarse: antes de que acabe el ejercicio', '31/12/2026', '30/06/2026'],
        ['Formular: 3 meses desde el cierre', '31/03/2027', '30/09/2026'],
        ['Legalizar los libros: antes de 4 meses', '30/04/2027', '30/10/2026'],
        ['Junta ordinaria: 6 primeros meses del ejercicio siguiente', '30/06/2027', '31/12/2026'],
        ['Depositar: 1 mes desde la aprobación', 'Junta el 22/06/2027 → 22/07/2027', 'Junta el 15/12/2026 → 15/01/2027'],
        ['Cierre registral sin depósito: documentos presentados pasado 1 año desde el cierre', 'Después del 31/12/2027', 'Después del 30/06/2027'],
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'El depósito no vence siempre el 30 de julio',
      text: 'Vence un mes después de la aprobación. El 30/07 solo es el límite si la sociedad cierra el 31/12 y aprueba sus cuentas el 30/06; con junta el 22/06, el depósito vence el 22/07.',
      refs: [{ label: 'Ley de Sociedades de Capital, art. 279', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a279', date: '2026-10-28', kind: 'norma' }],
    },

    /* ── 2 · Límites ──────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Modelo abreviado, PGC de Pymes y auditoría: la regla de 2 de 3', id: 'limites' },
    {
      type: 'paragraph',
      text: 'El tamaño decide si la sociedad puede formular cuentas abreviadas, aplicar el PGC de Pymes y quedar exenta de auditoría. Las tres preguntas se resuelven con la [[regla de 2 de 3]], cada una con sus importes: cumplir, al cierre de dos ejercicios consecutivos, al menos dos de tres límites referidos al total activo, al importe neto de la cifra de negocios (INCN) y a la [[plantilla media]] ([arts. 257](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a257), [258](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a258) y [263 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a263); [art. 2 RD 1515/2007](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#a2)).',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'regla de 2 de 3',
      text: 'La facultad se obtiene si, al cierre de dos ejercicios seguidos, no se superan al menos dos de los tres límites, y solo se pierde tras **dos ejercicios consecutivos** sin cumplirlos: un año aislado no cambia el modelo. En el primer ejercicio tras la constitución (y, según la LSC, tras una transformación o fusión) basta con cumplirlos al cierre. Para el PGC de Pymes, si la sociedad forma parte de un grupo, se suman las magnitudes de todo el grupo.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'comparativa',
        title: 'Límites vigentes a 29/10/2026',
        columns: ['Total activo', 'INCN', 'Plantilla media'],
        rows: [
          { label: 'Balance, ECPN y memoria abreviados', values: ['≤ 4.000.000 €', '≤ 8.000.000 €', '≤ 50'] },
          { label: 'PGC de Pymes', values: ['≤ 4.000.000 €', '≤ 8.000.000 €', '≤ 50'] },
          { label: 'Cuenta de pérdidas y ganancias abreviada', values: ['≤ 11.400.000 €', '≤ 22.800.000 €', '≤ 250'] },
          { label: 'Exención de auditoría', values: ['≤ 2.850.000 €', '≤ 5.700.000 €', '≤ 50'] },
          { label: 'Criterios de microempresas (dentro del PGC de Pymes)', values: ['≤ 1.000.000 €', '≤ 2.000.000 €', '≤ 10'] },
        ],
      },
      caption: 'Los límites de auditoría son los más bajos: abreviado no significa sin auditoría.',
    },
    {
      type: 'paragraph',
      text: 'Quien puede formular balance abreviado no está obligado a presentar el estado de cambios en el patrimonio neto (ECPN) ni el estado de flujos de efectivo (EFE) ([art. 257.3 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a257)) y, si formula balance y ECPN abreviados, tampoco el informe de gestión ([art. 262.3 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a262)). La opción por el PGC de Pymes se mantiene al menos tres ejercicios, salvo que antes se pierda la facultad, y no pueden aplicarlo, entre otras, las entidades de interés público ni las sociedades de un grupo que formule o deba formular cuentas consolidadas ([art. 2 RD 1515/2007](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#a2)).',
    },
    {
      type: 'paragraph',
      text: 'Ojo con la plantilla media: no es la plantilla al cierre, sino la media de todas las personas con relación laboral durante el ejercicio, según el tiempo trabajado ([norma 10.ª de elaboración de las cuentas anuales del PGC de Pymes](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#inormasdeelaboracion-2)). La fila de microempresas solo da acceso a criterios simplificados dentro del PGC de Pymes ([art. 4 RD 1515/2007](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#a4)).',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Los 5 y 10 millones de la UE aún no se aplican en España',
      text: 'La Directiva Delegada (UE) 2023/2775 elevó los umbrales de la pequeña empresa a 5.000.000 € de activo y 10.000.000 € de cifra de negocios, con plazo de incorporación hasta el 24/12/2024. España no lo ha hecho: a 29/10/2026, la LSC y el RD 1515/2007 mantienen los importes de la tabla. Revisa el BOE antes de cada campaña de cierre.',
      refs: [
        { label: 'Directiva Delegada (UE) 2023/2775, arts. 1 y 2', url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023L2775', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley de Sociedades de Capital, art. 257 (texto consolidado)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a257', date: '2026-10-29', kind: 'norma' },
      ],
    },

    /* ── 3 · Auditor ──────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Nombrar al auditor antes de que acabe el ejercicio', id: 'auditor' },
    {
      type: 'paragraph',
      text: 'Si la sociedad debe auditarse, la junta nombra al auditor **antes de que termine el ejercicio que se va a auditar**, por un periodo inicial de tres a nueve años ([art. 264 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a264)), y el nombramiento se inscribe en el Registro Mercantil ([art. 94 RRM](https://www.boe.es/buscar/act.php?id=BOE-A-1996-17533#a94)). Si la junta no lo nombra, los administradores o cualquier socio pueden pedir la designación al registrador mercantil ([art. 265.1 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a265)); cerrado el ejercicio, la competencia ya es del registrador ([art. 350 RRM](https://www.boe.es/buscar/act.php?id=BOE-A-1996-17533#a350)). El auditor dispone como mínimo de un mes desde que recibe las cuentas firmadas ([art. 270 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a270)): entrégaselas cuanto antes.',
    },
    {
      type: 'paragraph',
      text: 'Si la sociedad no está obligada, los socios con al menos el 5 % del capital pueden pedir al registrador, en los tres meses siguientes al cierre, un auditor a cargo de la sociedad ([art. 265.2 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a265)).',
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Revisa los límites antes del cierre',
      text: 'Dos o tres meses antes del cierre de cada cliente, compara su previsión con los límites de auditoría. Si va a encadenar dos ejercicios sin cumplirlos, propón una junta universal o extraordinaria que nombre auditor antes del cierre e inscribe el nombramiento.',
      refs: [
        { label: 'Ley de Sociedades de Capital, art. 178 (junta universal)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a178', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley de Sociedades de Capital, art. 264', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a264', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 4 · Consecuencias ────────────────────────────────────────────────── */
    { type: 'heading', text: 'Si las cuentas no llegan al Registro', id: 'consecuencias' },
    {
      type: 'paragraph',
      text: 'La falta de depósito provoca el [[cierre registral]]: mientras persista, el Registro Mercantil no inscribe ningún documento de la sociedad ([art. 282 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a282)). El Reglamento lo concreta: afecta a los documentos presentados cuando ha pasado un año desde el cierre del ejercicio sin depósito y dura hasta que se depositan las cuentas pendientes o se acredita que no se aprobaron ([art. 378 RRM](https://www.boe.es/buscar/act.php?id=BOE-A-1996-17533#a378)). Solo se exceptúan algunos títulos, como el cese o la dimisión de administradores, la revocación o renuncia de poderes, la disolución y el nombramiento de liquidadores.',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'cierre registral',
      text: 'Es el bloqueo de la hoja de la sociedad en el Registro Mercantil por no depositar las cuentas. Impide inscribir, por ejemplo, una ampliación de capital o un nuevo administrador, aunque sí la dimisión del actual. Se levanta depositando las cuentas pendientes o acreditando que la junta no las aprobó.',
    },
    {
      type: 'paragraph',
      text: 'Si la junta no aprueba las cuentas, no hay nada que depositar, pero el cierre llega igual. Para evitarlo, el órgano de administración debe acreditar en el Registro la falta de aprobación antes de que se cumpla un año desde el cierre, con una certificación con firmas legitimadas que exprese la causa o con copia autorizada del acta notarial de la junta, y justificar cada seis meses que la situación persiste ([art. 378.5 RRM](https://www.boe.es/buscar/act.php?id=BOE-A-1996-17533#a378)).',
    },
    {
      type: 'paragraph',
      text: 'Además, el ICAC puede imponer a la sociedad una multa de 1.200 a 60.000 €; si la sociedad o su grupo facturan más de 6.000.000 € al año, el límite sube a 300.000 € por cada año de retraso ([art. 283 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a283)). La cuantía es el 0,5 ‰ del activo más el 0,5 ‰ de las ventas de la última declaración tributaria; si supera el 2 % del capital social, se aplica ese 2 % reducido un 10 %, y sin declaración, el 2 % del capital ([DA 11.ª RD 2/2021](https://www.boe.es/buscar/act.php?id=BOE-A-2021-1351#da-11)). Si deposita antes de que se inicie el expediente, la sanción se impone en su grado mínimo y se reduce un 50 %. La infracción prescribe a los tres años.',
    },
    {
      type: 'paragraph',
      text: 'Por último, si la sociedad acaba en concurso, no haber formulado, auditado (debiendo hacerlo) o depositado las cuentas en alguno de los tres últimos ejercicios hace presumir que el concurso es culpable, salvo prueba en contrario ([art. 444 TRLC](https://www.boe.es/buscar/act.php?id=BOE-A-2020-4859#a4-56)).',
    },

    /* ── 5 · Caso resuelto ────────────────────────────────────────────────── */
    { type: 'heading', text: 'Caso resuelto: qué presenta un fabricante por 2026 y cuándo', id: 'caso' },
    {
      type: 'paragraph',
      text: 'Aplica lo anterior en orden: primero el tamaño, después la auditoría y, por último, el calendario y el coste de no depositar.',
    },
    {
      type: 'example',
      title: 'Fabricante del Vallès con cierre a 31/12/2026',
      scenario:
        'Caso ficticio. El 28/10/2026, una SL industrial (dos administradores mancomunados, 120.000 € de capital) pregunta qué cuentas presenta por 2026 y si debe auditarse. Ejercicio igual al año natural, en euros, sin grupo, no es entidad de interés público y nunca se ha auditado. Cierre de 2024: activo de 2.700.000 €, INCN de 5.900.000 € y plantilla media de 41. Cierre de 2025: 4.350.000 €, 7.600.000 € y 46. Previsión de 2026: 4.620.000 € y 7.950.000 €, con esta plantilla a jornada completa: 38 personas todo el año, 10 altas el 01/04, 6 refuerzos del 01/06 al 30/09 y 2 bajas el 30/06.',
      steps: [
        {
          label: 'Plantilla media de 2026: personas por meses trabajados, entre 12.',
          formula: '(38 × 12 + 10 × 9 + 6 × 4 + 2 × 6) / 12 = (456 + 90 + 24 + 12) / 12 = 582 / 12',
          result: '48,5 personas: no supera 50.',
        },
        {
          label: 'Balance abreviado y PGC de Pymes (4.000.000 € · 8.000.000 € · 50).',
          formula: '2025: activo no, INCN sí, plantilla sí → 2 de 3 · 2026: activo no, INCN sí, plantilla sí → 2 de 3',
          result: 'Puede formular balance y memoria abreviados y aplicar el PGC de Pymes.',
        },
        {
          label: 'Cuenta de pérdidas y ganancias abreviada (11.400.000 € · 22.800.000 € · 250).',
          formula: '2025: 3 de 3 · 2026: 3 de 3',
          result: 'También abreviada. No está obligada a presentar ECPN, EFE ni informe de gestión.',
        },
        {
          label: 'Exención de auditoría (2.850.000 € · 5.700.000 € · 50).',
          formula: '2024: activo sí, INCN no, plantilla sí → 2 de 3 · 2025: 1 de 3 · 2026: 1 de 3',
          result: 'Dos ejercicios seguidos sin cumplir: pierde la exención y debe auditar las cuentas de 2026 (art. 263.2 LSC).',
        },
        {
          label: 'Nombramiento del auditor: antes de que acabe el ejercicio a auditar.',
          formula: 'Convocatoria el viernes 20/11/2026 → junta el jueves 10/12/2026 (20 días; mínimo de 15 en la SL)',
          result: 'Auditor nombrado para 2026-2028 antes del 31/12/2026; después, inscribe el nombramiento.',
        },
        {
          label: 'Calendario de las cuentas de 2026.',
          formula: 'Cierre + 3 meses · cierre + 4 meses · 6 primeros meses de 2027 · aprobación + 1 mes',
          result: 'Formular: 31/03/2027 · Legalizar libros: 30/04/2027 · Junta: 30/06/2027 · Depositar: con junta el 22/06/2027, hasta el 22/07/2027.',
        },
        {
          label: 'Multa si no depositara, suponiendo que la última declaración del IS recoge las cifras de 2026.',
          formula: '0,0005 × 4.620.000 + 0,0005 × 7.950.000 = 2.310 + 3.975 = 6.285 € > 2 % × 120.000 = 2.400 € → 2.400 × 0,90',
          result: '2.160 €: entre el mínimo de 1.200 € y el máximo de 300.000 € por año de retraso, porque factura más de 6.000.000 €.',
        },
      ],
      conclusion:
        'Por 2026 presenta balance, cuenta de pérdidas y ganancias y memoria abreviados con el PGC de Pymes, pero auditados: lo urgente es la junta que nombre auditor antes del 31/12/2026. Vigila el margen: el INCN previsto queda a 50.000 € de 8.000.000 €. Si lo superara, conservaría el abreviado en 2026 (primer ejercicio sin cumplir), pero lo perdería en 2027 si tampoco cumpliera.',
    },
  ],
  keyTerms: [
    {
      term: 'formulación',
      definition: 'Elaboración y firma, por todos los administradores, de las cuentas anuales, el informe de gestión (si procede) y la propuesta de aplicación del resultado, en los tres meses siguientes al cierre.',
    },
    {
      term: 'legalización de libros',
      definition: 'Diligencia del Registro Mercantil sobre los libros obligatorios llevados en soporte electrónico, que se presentan por vía telemática antes de que pasen cuatro meses desde el cierre.',
    },
    {
      term: 'depósito de cuentas',
      definition: 'Presentación en el Registro Mercantil, en el mes siguiente a la aprobación, de la certificación de los acuerdos y de las cuentas, con los informes que procedan.',
    },
    {
      term: 'regla de 2 de 3',
      definition: 'Criterio para formular cuentas abreviadas, aplicar el PGC de Pymes o no auditarse: cumplir al menos dos de tres límites (activo, INCN y plantilla media) al cierre de dos ejercicios consecutivos.',
    },
    {
      term: 'plantilla media',
      definition: 'Promedio de las personas con relación laboral con la empresa durante el ejercicio, ponderadas por el tiempo trabajado. No es la plantilla al cierre.',
    },
    {
      term: 'cierre registral',
      definition: 'Bloqueo de la hoja registral de la sociedad cuando pasa un año desde el cierre del ejercicio sin depósito: solo se inscriben las excepciones legales, como la dimisión de administradores.',
    },
  ],
  takeaway:
    'Tres meses para formular, cuatro para legalizar los libros, seis para aprobar y uno más, desde la aprobación, para depositar: el calendario lo marca la fecha de cierre de cada cliente. Si las cuentas no llegan al Registro, la sociedad apenas podrá inscribir nada y se expone a una multa del ICAC.',
  sources: [
    {
      label: 'Real Decreto Legislativo 1/2010, texto refundido de la Ley de Sociedades de Capital (texto consolidado): arts. 164, 176, 178, 253, 257, 258, 262 a 265, 270, 272, 279, 280, 282 y 283',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544',
      date: '2026-10-29',
      kind: 'norma',
    },
    {
      label: 'Real Decreto 1784/1996, Reglamento del Registro Mercantil (texto consolidado): arts. 94, 350, 366 y 378',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-17533',
      date: '2026-10-29',
      kind: 'norma',
    },
    {
      label: 'Ley 14/2013, de apoyo a los emprendedores y su internacionalización, art. 18 (legalización de libros)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074#a18',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Instrucción de la DGRN de 12 de febrero de 2015, sobre legalización de libros (reglas 3.ª, 7.ª, 8.ª, 10.ª y 21.ª)',
      url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2015-1481',
      date: '2026-10-28',
      kind: 'criterio',
    },
    {
      label: 'Real Decreto 1515/2007, PGC de Pymes y criterios de microempresas (texto consolidado): arts. 2 y 4 y norma 10.ª de elaboración de las cuentas anuales',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966',
      date: '2026-10-29',
      kind: 'norma',
    },
    {
      label: 'Real Decreto 2/2021, Reglamento de desarrollo de la Ley de Auditoría de Cuentas, disposición adicional undécima',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-1351#da-11',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Real Decreto Legislativo 1/2020, texto refundido de la Ley Concursal, art. 444',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-4859#a4-56',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Código Civil, art. 5 (cómputo de plazos)',
      url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763#art5',
      date: '2026-10-28',
      kind: 'norma',
    },
    {
      label: 'Directiva Delegada (UE) 2023/2775 de la Comisión, de 17 de octubre de 2023, sobre el ajuste de los criterios de tamaño (DO L de 21/12/2023)',
      url: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32023L2775',
      date: '2026-10-28',
      kind: 'norma',
    },
  ],
  quiz: {
    id: 'mer-03-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'mer-03-q1',
        prompt:
          'Una SL cliente cierra su ejercicio el 30 de junio. Es 28 de octubre de 2026 y aún no ha legalizado los libros del ejercicio cerrado el 30/06/2026. ¿Qué le dices?',
        options: [
          {
            id: 'a',
            text: 'Ya va tarde: el plazo venció el 30/09/2026, igual que el de formulación.',
            feedback: 'Confunde la legalización con la formulación, que sí vence a los tres meses del cierre (art. 253 LSC). Para los libros hay cuatro meses.',
          },
          {
            id: 'b',
            text: 'Tiene hasta el viernes 30/10/2026: cuatro meses desde el cierre, por vía telemática y con los libros en soporte electrónico.',
          },
          {
            id: 'c',
            text: 'Tiene hasta el 30/04/2027, porque la legalización vence siempre el 30 de abril.',
            feedback: 'El 30 de abril solo es el límite de quien cierra el 31 de diciembre: el plazo se cuenta desde la fecha de cierre de cada sociedad.',
          },
          {
            id: 'd',
            text: 'Tiene hasta el 31/12/2026, porque los libros se legalizan cuando se aprueban las cuentas.',
            feedback: 'El 31/12/2026 es el límite de su junta ordinaria (art. 164 LSC). La legalización no depende de la aprobación: se cuenta desde el cierre.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Los libros se legalizan por vía telemática antes de que pasen cuatro meses desde el cierre (art. 18 Ley 14/2013). De fecha a fecha (art. 5 CC): 30/06/2026 + 4 meses = 30/10/2026. Si los presenta después, el registrador los legaliza, pero hace constar que se pidió fuera del plazo legal.',
        ref: 'Apartado 1 · El calendario: formular, legalizar, aprobar y depositar',
      },
      {
        id: 'mer-03-q2',
        prompt:
          'Una SL formula balance abreviado desde hace años y, hasta 2024 inclusive, cumplió cada año al menos dos de los tres límites del art. 257 LSC. Al cierre de 2025 tenía un activo de 3.900.000 €, un INCN de 8.300.000 € y una plantilla media de 52; al cierre de 2026, 4.200.000 €, 7.800.000 € y 49. ¿Puede formular balance abreviado en 2026?',
        options: [
          {
            id: 'a',
            text: 'No, porque en 2025 solo cumplió uno de los tres límites.',
            feedback: 'Un solo ejercicio sin cumplir no hace perder la facultad: hacen falta dos ejercicios consecutivos (art. 257.1 LSC).',
          },
          {
            id: 'b',
            text: 'No, porque en 2026 su activo supera los 4.000.000 €.',
            feedback: 'Basta con cumplir dos de los tres límites; superar uno de ellos no impide el modelo abreviado.',
          },
          {
            id: 'c',
            text: 'Sí: solo se pierde la facultad tras dos ejercicios consecutivos sin cumplir dos de los tres límites, y en 2026 vuelve a cumplir dos.',
          },
          {
            id: 'd',
            text: 'Sí, porque desde 2024 se aplican los límites de 5.000.000 € y 10.000.000 € de la Directiva Delegada (UE) 2023/2775.',
            feedback: 'España no ha incorporado esos importes: a 29/10/2026, el art. 257 LSC mantiene 4.000.000 €, 8.000.000 € y 50 trabajadores.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'En 2025 cumple 1 de 3 (solo el activo) y en 2026, 2 de 3 (INCN y plantilla). Como 2024 sí cumplía, solo hay un ejercicio sin cumplir (2025), y la facultad se pierde si se dejan de cumplir dos límites «durante dos ejercicios consecutivos» (art. 257.1 LSC).',
        ref: 'Apartado 2 · Modelo abreviado, PGC de Pymes y auditoría: la regla de 2 de 3',
      },
      {
        id: 'mer-03-q3',
        prompt:
          'Una SL no depositó las cuentas de 2024 (cierre a 31/12/2024). En octubre de 2026 presenta en el Registro Mercantil la dimisión de su administrador único y el nombramiento de uno nuevo. ¿Qué ocurrirá?',
        options: [
          {
            id: 'a',
            text: 'Se inscribe la dimisión, pero no el nombramiento del nuevo administrador hasta que deposite las cuentas pendientes.',
          },
          {
            id: 'b',
            text: 'Se inscriben las dos cosas, porque el cierre registral solo dura un año.',
            feedback: 'El año marca cuándo empieza el cierre; después, dura mientras no se depositen las cuentas (art. 282.1 LSC y art. 378.7 RRM).',
          },
          {
            id: 'c',
            text: 'No se inscribe nada, ni siquiera la dimisión, hasta que deposite.',
            feedback: 'Olvida las excepciones legales: el cese y la dimisión de administradores sí se inscriben (art. 282.2 LSC).',
          },
          {
            id: 'd',
            text: 'Se inscriben las dos cosas si antes paga la multa del ICAC.',
            feedback: 'La multa es una consecuencia adicional e independiente. El cierre solo se levanta depositando las cuentas o acreditando que no se aprobaron (art. 378.7 RRM).',
          },
        ],
        correctOptionId: 'a',
        explanation:
          'Con el Registro cerrado no se inscribe ningún documento, salvo las excepciones legales, entre ellas el cese o la dimisión de administradores. El nombramiento no está entre ellas (art. 282 LSC y art. 378.1 RRM).',
        ref: 'Apartado 4 · Si las cuentas no llegan al Registro',
      },
    ],
  },
  version: 1,
  editorial: {
    status: 'publicado',
    authorId: 'p-joan-navarro',
    publishedAt: '2026-10-16T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
  verifiedAt: '2026-10-29',
};

/** Banco de 4 preguntas adicionales para la evaluación sectorial «Pon a prueba tus conocimientos». */
export const bank: QuizQuestion[] = [
  {
    id: 'mer-03-b1',
    prompt: 'Una SL con un INCN de 9.000.000 € no deposita sus cuentas. ¿Cuál es el límite máximo de la multa del ICAC por cada año de retraso?',
    options: [
      {
        id: 'a',
        text: '60.000 €.',
        feedback: 'Es el máximo general; se eleva cuando la sociedad o su grupo facturan más de 6.000.000 € al año.',
      },
      {
        id: 'b',
        text: '1.200 €, que es la multa fija por cada ejercicio no depositado.',
        feedback: '1.200 € es el mínimo, no una cuantía fija: el importe se calcula con el activo, las ventas o el capital social (DA 11.ª RD 2/2021).',
      },
      {
        id: 'c',
        text: 'No hay multa: la única consecuencia es el cierre registral.',
        feedback: 'El cierre registral y la multa se suman: el art. 283 LSC dice que el incumplimiento «también» da lugar a la multa.',
      },
      { id: 'd', text: '300.000 €.' },
    ],
    correctOptionId: 'd',
    explanation:
      'Si la sociedad o, en su caso, su grupo facturan más de 6.000.000 € al año, el límite de la multa «para cada año de retraso» se eleva a 300.000 € (art. 283.1 LSC).',
    ref: 'Cuentas anuales: formular, aprobar y depositar a tiempo · Apartado 4',
  },
  {
    id: 'mer-03-b2',
    prompt:
      'Una SL con cierre a 31 de diciembre superó en 2025 dos de los tres límites de exención de auditoría, y su previsión de 2026 también los supera. Nunca se ha auditado. ¿Qué fecha límite fija la ley para que su junta general nombre auditor para las cuentas de 2026?',
    options: [
      { id: 'a', text: 'El 31/12/2026: el auditor se nombra antes de que termine el ejercicio que se va a auditar.' },
      {
        id: 'b',
        text: 'El 31/03/2027, fecha límite para formular las cuentas.',
        feedback: 'La formulación no marca este plazo. Cerrado el ejercicio sin nombramiento, la designación corresponde al registrador mercantil (art. 265.1 LSC y art. 350 RRM).',
      },
      {
        id: 'c',
        text: 'La fecha de la junta ordinaria de junio de 2027, que puede nombrar al auditor y aprobar las cuentas en la misma sesión.',
        feedback: 'Llega tarde: la junta debe nombrar al auditor antes de que acabe el ejercicio a auditar (art. 264.1 LSC), y las cuentas que aprueba deben estar ya auditadas.',
      },
      {
        id: 'd',
        text: 'Ninguna: no tiene que nombrarlo, porque el Registro Mercantil asigna de oficio un auditor a las sociedades obligadas.',
        feedback: 'El registrador no actúa de oficio: designa auditor a petición de los administradores o de cualquier socio cuando la junta no lo ha nombrado (art. 265.1 LSC).',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'La junta nombra al auditor antes de que finalice el ejercicio a auditar, por un periodo inicial de tres a nueve años (art. 264.1 LSC). Como 2025 y 2026 son dos ejercicios consecutivos sin cumplir los límites, debe auditar las cuentas de 2026 (art. 263.2 LSC).',
    ref: 'Cuentas anuales: formular, aprobar y depositar a tiempo · Apartado 3',
  },
  {
    id: 'mer-03-b3',
    prompt:
      'En junio de 2026, la junta de una SL con cierre a 31/12/2025 rechaza las cuentas por un desacuerdo entre socios. ¿Qué debe hacer el órgano de administración para evitar el cierre registral?',
    options: [
      {
        id: 'a',
        text: 'Nada: si las cuentas no se aprueban, no hay depósito ni cierre registral.',
        feedback: 'Pasado un año desde el cierre sin depósito, el Registro se cierra (art. 378.1 RRM), salvo que se acredite a tiempo la falta de aprobación.',
      },
      {
        id: 'b',
        text: 'Depositar igualmente las cuentas formuladas, aunque no estén aprobadas.',
        feedback: 'El depósito exige la certificación del acuerdo de aprobación (art. 279.1 LSC y art. 366 RRM), y el registrador comprueba que las cuentas estén aprobadas por la junta (art. 280.1 LSC).',
      },
      {
        id: 'c',
        text: 'Acreditar en el Registro Mercantil, antes de que se cumpla un año desde el cierre (31/12/2026), la falta de aprobación y su causa (certificación con firmas legitimadas o copia del acta notarial) y reiterarlo cada seis meses.',
      },
      {
        id: 'd',
        text: 'Pedir al ICAC una prórroga del plazo de depósito.',
        feedback: 'No existe esa prórroga: el ICAC no amplía plazos de depósito, sanciona su incumplimiento (art. 283 LSC).',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Lo prevé el art. 378.5 RRM: la acreditación se presenta antes de que se cumpla un año desde el cierre (31/12/2025 + 1 año = 31/12/2026) y se justifica cada seis meses que la situación persiste.',
    ref: 'Cuentas anuales: formular, aprobar y depositar a tiempo · Apartado 4',
  },
  {
    id: 'mer-03-b4',
    prompt: 'Una SA cuyo ejercicio coincide con el año natural celebra su junta ordinaria el martes 22/06/2027 y aprueba las cuentas de 2026. ¿Cuándo vence el plazo para presentarlas a depósito?',
    options: [
      {
        id: 'a',
        text: 'El 30/06/2027.',
        feedback: 'Es la fecha límite para celebrar la junta ordinaria de una sociedad que cierra el 31 de diciembre (art. 164.1 LSC), no la del depósito.',
      },
      { id: 'b', text: 'El jueves 22/07/2027.' },
      {
        id: 'c',
        text: 'El viernes 30/07/2027, porque el depósito vence siempre el 30 de julio.',
        feedback: 'El plazo se cuenta desde la aprobación: el 30/07 solo sería correcto con una junta celebrada el 30/06.',
      },
      {
        id: 'd',
        text: 'El 31/12/2027.',
        feedback: 'Es cuando se cumple un año desde el cierre de 2026: si no hay depósito, a partir de entonces opera el cierre registral (art. 378.1 RRM). No es el plazo de depósito.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'El depósito se presenta dentro del mes siguiente a la aprobación (art. 279.1 LSC), contado de fecha a fecha (art. 5 CC): 22/06/2027 + 1 mes = 22/07/2027.',
    ref: 'Cuentas anuales: formular, aprobar y depositar a tiempo · Apartado 1',
  },
];

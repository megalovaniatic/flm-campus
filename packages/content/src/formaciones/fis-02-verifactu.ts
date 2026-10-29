import type { Formation, QuizQuestion } from '@flm/shared';

export const formation: Formation = {
  id: 'fis-02',
  slug: 'verifactu',
  area: 'fiscal',
  title: 'Verifactu: qué clientes deben adaptar su software de facturación y desde cuándo',
  intro:
    'Una S.L. cliente factura con un ERP en la nube y un TPV en su tienda. Su gerente ha leído que Verifactu «se aplaza a 2028» y te pregunta si puede parar la adaptación del software. Para responder, distingue lo vigente de lo anunciado, comprueba si el cliente está obligado y qué debe exigir a su proveedor.',
  summary:
    'Quién debe adaptar su software de facturación, qué modalidad elegir, qué fechas rigen hoy y en qué punto está el aplazamiento a 2028 anunciado por Hacienda.',
  coverTerm: 'VERI*FACTU',
  readingMinutes: 11,
  outcomes: [
    'Identificar si un cliente está obligado con la regla de los 4 NO y asignarle su fecha vigente: antes del 1/1/2027 o antes del 1/7/2027.',
    'Decidir con el cliente entre la modalidad VERI*FACTU y la no verificable, y comprobar qué debe entregarle su proveedor de software.',
    'Calcular la sanción por tener un sistema no adaptado y distinguir Verifactu de la factura electrónica B2B.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Qué es Verifactu y qué exige', id: 'que-es-verifactu' },
    {
      type: 'paragraph',
      text: '«Verifactu» es el nombre popular del Reglamento de sistemas informáticos de facturación (RRSIF), aprobado por el [Real Decreto 1007/2023](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840). Desarrolla, solo para la facturación, el [art. 29.2.j) LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a29), vigente desde el 11/10/2021, que exige a los sistemas contables, de facturación y de gestión garantizar la integridad, conservación, accesibilidad, legibilidad, trazabilidad e inalterabilidad de los registros. La [Orden HAC/1177/2024](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138) fija los detalles técnicos.',
    },
    {
      type: 'paragraph',
      text: 'Cada factura que expide un [[sistema informático de facturación]] genera un [[registro de facturación]] de alta y, si se anula por haberse emitido por error, otro de anulación. Cada registro lleva una [[huella]] que incluye la del anterior, así que cualquier alteración se detecta, y la factura incorpora un código QR. Verifactu no crea impuestos ni sustituye los libros registro ni los modelos 347 o 349.',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'Sistema informático de facturación',
      text: 'Es el conjunto de *hardware* y *software* que se usa para expedir facturas y que admite, conserva y procesa sus datos ([art. 1.2 RRSIF](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1)). Lo son un ERP, un TPV, un programa en la nube o una hoja de cálculo cuya macro genera el libro registro. No lo es, según la AEAT, la hoja que solo sirve para escribir, imprimir y guardar facturas.',
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'A quién afecta: la regla de los 4 NO', id: 'a-quien-afecta' },
    {
      type: 'paragraph',
      text: 'Están obligados quienes facturan con un sistema informático, aunque sea en parte de su actividad, y son contribuyentes del Impuesto sobre Sociedades (IS, salvo las entidades totalmente exentas), personas físicas con actividad económica, no residentes con establecimiento permanente o entidades en atribución de rentas con actividad ([art. 3 RRSIF](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a3)). También lo están los productores y comercializadores del software. La AEAT lo resume en la «regla de los 4 NO»:',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        '**No** factura exclusivamente a mano.',
        '**No** lleva los libros del IVA por el SII, obligatoria o voluntariamente ([art. 3.3 RRSIF](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a3)).',
        '**No** tiene el domicilio fiscal en el País Vasco ni en Navarra (Canarias, Ceuta y Melilla sí están dentro).',
        '**No** tiene una resolución de no aplicación de la AEAT ([art. 5 RRSIF](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a5)).',
      ],
    },
    {
      type: 'paragraph',
      text: 'El SII es obligatorio para quien liquida el IVA por meses ([art. 71.3 RIVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a71)): por ejemplo, por superar 6.010.121,04 € de volumen de operaciones el año anterior, por estar en el REDEME o por aplicar el régimen del grupo de entidades. La AEAT incluye expresamente a las sociedades patrimoniales y a quien factura voluntariamente con un programa (por ejemplo, en recargo de equivalencia).',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Hojas de cálculo y facturas mezcladas',
      text: 'Una plantilla de Excel no deja fuera al cliente si procesa los datos, por ejemplo con una macro que genera el libro registro. Y, salvo excepciones, la AEAT no admite mezclar facturas a mano y facturas del sistema.',
      refs: [
        {
          label: 'AEAT: preguntas frecuentes sobre los ámbitos de aplicación',
          url: 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html',
          date: '2026-10-28',
          kind: 'criterio',
        },
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'arbol-decision',
        title: '¿Afecta a mi cliente?',
        start: 'q1',
        nodes: [
          { id: 'q1', question: '¿Expide facturas, aunque sea voluntariamente?', options: [{ label: 'Sí', next: 'q2' }, { label: 'No', next: 'o-sin-facturas' }] },
          { id: 'q2', question: '¿Factura con algún sistema (ERP, TPV, programa en la nube, Excel con macro)?', options: [{ label: 'Sí', next: 'q3' }, { label: 'No, todo a mano', next: 'o-manual' }] },
          { id: 'q3', question: '¿Lleva los libros del IVA por el SII?', options: [{ label: 'Sí', next: 'o-sii' }, { label: 'No', next: 'q4' }] },
          { id: 'q4', question: '¿Tiene el domicilio fiscal en el País Vasco o en Navarra?', options: [{ label: 'Sí', next: 'o-foral' }, { label: 'No', next: 'q5' }] },
          { id: 'q5', question: '¿Tiene una resolución de no aplicación?', options: [{ label: 'Sí', next: 'o-resolucion' }, { label: 'No', next: 'q6' }] },
          {
            id: 'q6',
            question: '¿Qué tipo de contribuyente es?',
            options: [
              { label: 'Del Impuesto sobre Sociedades', next: 'o-sociedades' },
              { label: 'Autónomo, entidad en atribución de rentas con actividad o no residente con establecimiento permanente', next: 'o-resto' },
              { label: 'Ninguno de los anteriores', next: 'o-otro' },
            ],
          },
          { id: 'o-sin-facturas', outcome: { title: 'No le afecta', text: 'Sin facturas no hay sistema que adaptar.', tone: 'resolver' } },
          { id: 'o-manual', outcome: { title: 'Fuera, mientras facture a mano', text: 'Si empieza a usar un programa, entra.', tone: 'atencion' } },
          { id: 'o-sii', outcome: { title: 'Excluido por el SII', text: 'Art. 3.3 RRSIF. Si deja el SII, pasa a estar obligado.', tone: 'resolver' } },
          { id: 'o-foral', outcome: { title: 'Normativa foral', text: 'En general rige su normativa foral. Consúltalo con el área.', tone: 'derivar' } },
          { id: 'o-resolucion', outcome: { title: 'Según su resolución', text: 'Aplica lo que diga la resolución de la AEAT (art. 5 RRSIF).', tone: 'derivar' } },
          { id: 'o-sociedades', outcome: { title: 'Obligado antes del 1/1/2027', text: 'Art. 3.1.a RRSIF, salvo entidades totalmente exentas. Aplazamiento anunciado, sin publicar.', tone: 'atencion' } },
          {
            id: 'o-resto',
            outcome: { title: 'Obligado antes del 1/7/2027', text: 'Autónomos, no residentes con establecimiento permanente y entidades en atribución. Aplazamiento anunciado, sin publicar.', tone: 'atencion' },
          },
          {
            id: 'o-otro',
            outcome: {
              title: 'Comprueba si está obligado',
              text: 'El art. 3.1 RRSIF solo incluye a contribuyentes del IS, personas físicas y entidades en atribución de rentas con actividad económica y no residentes con establecimiento permanente. Consúltalo con el área.',
              tone: 'derivar',
            },
          },
        ],
      },
      caption: 'Recorre el árbol con los datos de tu cliente. Fechas vigentes a 28/10/2026.',
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Calendario vigente y aplazamiento anunciado', id: 'calendario' },
    {
      type: 'paragraph',
      text: 'Rigen las fechas de la [disposición final cuarta del RD 1007/2023](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#df-4), en la redacción del [Real Decreto-ley 15/2025](https://www.boe.es/buscar/doc.php?id=BOE-A-2025-24446), que el Congreso convalidó el 11/12/2025. Es el segundo cambio publicado: la fecha original era el 1/7/2025 y el [RD 254/2025](https://www.boe.es/buscar/doc.php?id=BOE-A-2025-6600) la había llevado al 1/1/2026 y al 1/7/2026.',
    },
    {
      type: 'table',
      caption: 'Fechas vigentes a 28/10/2026',
      columns: ['Quién', 'Obligación', 'Fin de las pruebas'],
      rows: [
        ['Contribuyentes del Impuesto sobre Sociedades', 'Sistema adaptado **antes del 1/1/2027**', '31/12/2026'],
        ['Autónomos, no residentes con establecimiento permanente y entidades en atribución de rentas', 'Sistema operativo **antes del 1/7/2027**', '30/6/2027'],
        ['Productores y comercializadores', 'Software adaptado desde el **29/7/2025**', 'No aplica'],
      ],
    },
    {
      type: 'paragraph',
      text: 'El 5/10/2026, el Ministerio de Hacienda publicó una [nota informativa](https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf) con la «previsión» de aplazar las obligaciones pendientes del RD 1007/2023 «hasta octubre de 2028», para hacerlas coincidir con la factura electrónica obligatoria de quienes facturan hasta 8 millones de euros. Después prevé otra reforma para adaptar el reglamento a ViDA (el IVA en la era digital), aunque, según la nota, las exigencias técnicas de fondo (integridad, inalterabilidad, trazabilidad, etc.) se mantendrán «en términos sustancialmente equivalentes».',
    },
    {
      type: 'paragraph',
      text: '**Estado a 28/10/2026: anunciado, no aprobado.** El BOE no ha publicado ninguna norma que modifique el RD 1007/2023 (revisados los sumarios del 5 al 28 de octubre) y la AEAT mantiene las fechas de 2027 en sus preguntas frecuentes del 21/10/2026. La nota no fija el día exacto; el alcance dependerá de la norma que se apruebe.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Qué falta para que el aplazamiento rija',
      text: 'Una norma publicada en el BOE que modifique la disposición final cuarta del RD 1007/2023. Bastaría un real decreto, porque el RDL 15/2025 mantuvo su rango reglamentario; por eso no depende de las Cortes, disueltas por el RD 806/2026. A 28/10/2026 no hay ningún proyecto en audiencia pública.',
      refs: [
        { label: 'Ministerio de Hacienda: nota informativa de 5 de octubre de 2026', url: 'https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf', date: '2026-10-28', kind: 'documento' },
        { label: 'Real Decreto-ley 15/2025, de 2 de diciembre (disposiciones finales primera y segunda)', url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-24446', date: '2026-10-28', kind: 'norma' },
        { label: 'Real Decreto 806/2026, de 5 de octubre, de disolución de las Cortes', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742', date: '2026-10-28', kind: 'norma' },
      ],
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Qué decir hoy al cliente',
      text: 'Planifica con las fechas de 2027 y aprovecha el periodo de pruebas: según la AEAT, hasta la fecha obligatoria el cliente puede probar la modalidad VERI*FACTU sin quedar atado a ella. Si se publica el aplazamiento, ganará margen; mientras, revisa el BOE cada semana.',
      refs: [
        {
          label: 'AEAT: nota informativa sobre la ampliación del plazo de adaptación',
          url: 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/nota-informativa-ampliacion-plazo-adaptacion-facturacion.html',
          date: '2026-10-28',
          kind: 'criterio',
        },
        {
          label: 'AEAT: preguntas frecuentes, cuestiones generales (periodo de pruebas)',
          url: 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes.html',
          date: '2026-10-28',
          kind: 'criterio',
        },
      ],
    },
    {
      type: 'widget',
      widget: {
        kind: 'linea-tiempo',
        title: 'Calendario de Verifactu y de la factura electrónica B2B',
        items: [
          { date: '2025-07-29', title: 'Productores: software adaptado', text: 'Nueve meses desde la entrada en vigor de la Orden HAC/1177/2024.', tone: 'plazo' },
          { date: '2025-12-04', title: 'Entra en vigor el RDL 15/2025', text: 'Fija las fechas de 2027.', tone: 'hito' },
          { date: '2026-10-05', title: 'Hacienda anuncia el aplazamiento a octubre de 2028', text: 'Previsión sin norma publicada a 28/10/2026.', tone: 'pendiente' },
          { date: '2026-10-06', title: 'Entra en vigor la Orden HAC/1028/2026', text: 'Arrancan los plazos de la factura electrónica B2B.', tone: 'hito' },
          { date: '2027-01-01', title: 'Contribuyentes del IS', text: 'Sistema adaptado «antes del 1 de enero de 2027».', tone: 'plazo' },
          { date: '2027-07-01', title: 'Resto de obligados', text: 'Sistema operativo «antes del 1 de julio de 2027».', tone: 'plazo' },
          { date: '2027-10-06', title: 'Factura electrónica B2B: más de 8 M€', tone: 'plazo' },
          { date: '2028-10-06', title: 'Factura electrónica B2B: resto', text: 'Hito con el que Hacienda prevé alinear Verifactu.', tone: 'plazo' },
        ],
      },
      caption: 'Fechas vigentes a 28/10/2026; el aplazamiento solo está anunciado.',
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Modalidad VERI*FACTU o no verificable', id: 'modalidades' },
    {
      type: 'paragraph',
      text: 'Todos los sistemas cumplen los mismos requisitos de fondo ([art. 8 RRSIF](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a8)), pero el cliente elige la modalidad. En [[VERI*FACTU]], el programa envía a la AEAT cada registro de forma automática y continua, y se presume que cumple por diseño ([art. 16 RRSIF](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-8)). En la modalidad no verificable, el sistema firma los registros y lleva un [[registro de eventos]], y el cliente los conserva y los entrega cuando la AEAT los requiere ([art. 14.2 RRSIF](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-6)).',
    },
    {
      type: 'widget',
      widget: {
        kind: 'comparativa',
        title: 'VERI*FACTU frente a modalidad no verificable',
        columns: ['VERI*FACTU', 'No verificable'],
        rows: [
          { label: 'Envío a la AEAT', values: ['Automático y continuo (art. 16 RRSIF)', 'Solo a requerimiento (art. 14.2 RRSIF)'] },
          { label: 'Huella encadenada', values: ['Sí', 'Sí'] },
          { label: 'Firma electrónica', values: ['No', 'Sí, XAdES con certificado cualificado'] },
          { label: 'Registro de eventos', values: ['No', 'Sí, con un resumen al menos cada 6 horas'] },
          { label: 'Conservar y exportar registros', values: ['No: ya están en la AEAT', 'Sí, aunque cambie de programa (art. 8 de la Orden)'] },
          { label: 'Código QR', values: ['Sí', 'Sí'] },
          { label: 'Frase en la factura', values: ['«VERI*FACTU» o «Factura verificable en la sede electrónica de la AEAT»', 'No'] },
          { label: 'Permanencia', values: ['Al menos hasta el 31/12 del año del primer envío (art. 16.5 RRSIF)', 'No aplica'] },
        ],
      },
      caption: 'La huella y el QR son comunes a las dos modalidades.',
    },
    { type: 'paragraph', text: 'Pide al proveedor de cada sistema:' },
    {
      type: 'list',
      items: [
        'La [[declaración responsable]] de cada sistema y versión, visible en el propio programa ([art. 15 de la Orden](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-7)).',
        'Registros de alta y anulación encadenados, generados con cada factura.',
        'Código QR de entre 30×30 y 40×40 mm en las facturas completas y simplificadas ([art. 21 de la Orden](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a2-3)).',
        'En la modalidad no verificable: firma XAdES con certificado cualificado, registro de eventos y exportación de los registros.',
        'Si el programa factura para varios obligados, una cadena de registros para cada uno ([art. 2 de la Orden](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a2)).',
      ],
    },
    {
      type: 'paragraph',
      text: 'Si el cliente emite pocas facturas, valora la aplicación gratuita de la AEAT: siempre es VERI*FACTU, solo factura en nombre propio o por apoderado y exige destinatario ([art. 19 de la Orden](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-11)).',
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Permanencia e incidencias',
      text: 'Quien elige la modalidad VERI*FACTU debe mantenerla, al menos, hasta el 31 de diciembre del año del primer envío ([art. 16.5 RRSIF](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-8)), salvo durante el periodo de pruebas. Si falla la conexión, no se deja de facturar: el sistema reintenta el envío al menos cada hora y remite los registros en cuanto sea posible ([art. 16.4 de la Orden](https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-8)).',
      refs: [
        {
          label: 'AEAT: preguntas frecuentes sobre los sistemas VERI*FACTU',
          url: 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/sistemas-verifactu.html',
          date: '2026-10-28',
          kind: 'criterio',
        },
      ],
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Sanciones y relación con la factura electrónica B2B', id: 'sanciones-y-b2b' },
    {
      type: 'paragraph',
      text: 'El [art. 201 bis LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a2-2), vigente desde el 11/10/2021, tipifica dos infracciones graves con multa fija:',
    },
    {
      type: 'list',
      items: [
        '**Productores y comercializadores:** 150.000 € por ejercicio con ventas y por tipo de sistema que, por ejemplo, permita llevar contabilidades distintas u ocultar o alterar registros; 1.000 € por cada sistema vendido sin certificar.',
        '**Usuarios:** 50.000 € por ejercicio por tener un sistema sin certificar, debiendo estarlo, o alterado. Según la AEAT, conservar el programa antiguo solo es admisible si se acredita que ya no permite facturar.',
      ],
    },
    {
      type: 'paragraph',
      text: 'La multa se reduce un 40 % si se paga en periodo voluntario y no se recurre ([art. 188.3 LGT](https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a188)). No admite la reducción del 30 % por conformidad, que el art. 188.1 reserva a las sanciones de los arts. 191 a 197.',
    },
    {
      type: 'paragraph',
      text: '**Verifactu no es la factura electrónica B2B**, que regulan la Ley 18/2022 y el [RD 238/2026](https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295). Sus plazos cuentan desde la entrada en vigor de la [Orden HAC/1028/2026](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20587), el 6/10/2026: emitir y recibir facturas electrónicas será obligatorio desde el 6/10/2027 si se superaron 8 millones de euros de volumen de operaciones el año anterior, y desde el 6/10/2028 en los demás casos. Las personas físicas y entidades en atribución de rentas de hasta 8 millones informarán de los estados de la factura desde el 6/10/2029.',
    },
    {
      type: 'paragraph',
      text: 'Se conectan en un punto: la factura electrónica debe salir de un sistema adaptado al art. 29.2.j) LGT ([art. 2.d RD 238/2026](https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#a2)).',
    },
    {
      type: 'example',
      title: 'Una S.L. con ERP y TPV: fecha y riesgo',
      scenario:
        'Caso ficticio. «Ferretería Vallès, S.L.» (Granollers) tributa por el IS, tuvo un volumen de operaciones de **2.400.000 €** en 2025 y liquida el IVA por trimestres, sin REDEME, grupo de entidades ni SII voluntario. Factura con un ERP en la nube y un TPV en la tienda. Análisis a 28/10/2026.',
      steps: [
        { label: '¿Lleva el SII? Comparamos su volumen con el umbral del art. 71.3 RIVA.', formula: '6.010.121,04 € − 2.400.000,00 € = 3.610.121,04 €', result: 'Por debajo: no lleva SII' },
        { label: 'Regla de los 4 NO: usa sistemas, sin SII, territorio común y sin resolución.', formula: '4 NO → art. 3.1.a RRSIF', result: 'Obligada' },
        { label: 'Fecha vigente: antes del 1/1/2027. Días naturales hasta esa fecha desde el 28/10/2026:', formula: '1/1/2027 − 28/10/2026 = 3 (oct.) + 30 (nov.) + 31 (dic.) + 1 = 65 días', result: '65 días; pruebas hasta el 31/12/2026' },
        { label: 'Una declaración responsable por sistema; los tiques del TPV también llevarán QR.', formula: 'ERP + TPV = 2 sistemas', result: '2 declaraciones responsables' },
        { label: 'Riesgo si la sociedad mantiene el TPV sin adaptar durante 2027 y 2028 (art. 201 bis.4 LGT):', formula: '2 × 50.000 € = 100.000 €', result: '100.000 €' },
        { label: 'Con pago en periodo voluntario y sin recurso, reducción del 40 % (art. 188.3 LGT):', formula: '100.000 € × (1 − 0,40) = 60.000 €', result: '60.000 €' },
        {
          label: 'Factura electrónica B2B: al no superar 8 millones (se supone que en 2026 tampoco), tiene 24 meses desde la Orden HAC/1028/2026. Los tiques quedan fuera, salvo las simplificadas cualificadas.',
          formula: '6/10/2026 + 24 meses = 6/10/2028',
          result: 'Desde el 6/10/2028',
        },
      ],
      conclusion:
        'Los dos sistemas deben estar adaptados **antes del 1/1/2027**: pide ya las declaraciones, decide la modalidad y aprovecha las pruebas. El aplazamiento anunciado no tendrá efecto jurídico hasta que se publique; la factura electrónica B2B llegará después, con su propia fecha.',
    },
  ],
  keyTerms: [
    {
      term: 'sistema informático de facturación',
      definition: 'Conjunto de *hardware* y *software* con el que se expiden facturas y que admite, conserva y procesa sus datos (art. 1.2 RRSIF).',
    },
    {
      term: 'registro de facturación',
      definition: 'Fichero que el sistema genera al expedir una factura (alta) o al anularla (anulación), con sus datos y la huella del registro anterior (arts. 9 a 11 RRSIF).',
    },
    {
      term: 'huella',
      definition: 'Resumen criptográfico (*hash*) de cada registro que incluye la huella del anterior: si se altera uno, la cadena lo delata (art. 12 RRSIF).',
    },
    {
      term: 'VERI*FACTU',
      definition: 'Modalidad en la que el sistema envía a la AEAT todos sus registros al momento. Exime de firmarlos, del registro de eventos y de conservarlos (art. 16 RRSIF y art. 3 de la Orden).',
    },
    {
      term: 'registro de eventos',
      definition: 'Bitácora firmada que exige la modalidad no verificable: anota su inicio y su fin, las anomalías y las exportaciones, con un resumen al menos cada 6 horas (art. 9 de la Orden).',
    },
    {
      term: 'declaración responsable',
      definition: 'Certificación del productor de que cada versión de su sistema cumple la normativa. Debe constar en el programa y entregarse al cliente (art. 13 RRSIF).',
    },
  ],
  takeaway:
    'A 28/10/2026 manda el BOE: sociedades, antes del 1/1/2027; resto de obligados, antes del 1/7/2027; el aplazamiento a 2028 solo regirá cuando se publique. Aplica la regla de los 4 NO, pide la declaración responsable y no confundas Verifactu con la factura electrónica B2B.',
  sources: [
    { label: 'Real Decreto 1007/2023, de 5 de diciembre, y Reglamento de sistemas informáticos de facturación (texto consolidado)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840', date: '2026-10-28', kind: 'norma' },
    { label: 'Orden HAC/1177/2024, de 17 de octubre (especificaciones técnicas)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto-ley 15/2025, de 2 de diciembre (fechas de 2027)', url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-24446', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 254/2025, de 1 de abril (calendario anterior)', url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-6600', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria: art. 201 bis (infracciones y sanciones)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a2-2', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 58/2003, General Tributaria: art. 188 (reducción de las sanciones)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a188', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 1619/2012, Reglamento de facturación: art. 6.5 (código QR y frase)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6', date: '2026-10-28', kind: 'norma' },
    { label: 'Reglamento del IVA: art. 71.3 (liquidación mensual y SII)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a71', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 238/2026, de 25 de marzo (factura electrónica entre empresarios y profesionales)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295', date: '2026-10-28', kind: 'norma' },
    { label: 'Orden HAC/1028/2026, de 2 de octubre (solución pública de facturación electrónica)', url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20587', date: '2026-10-28', kind: 'norma' },
    { label: 'Ministerio de Hacienda: nota informativa de 5 de octubre de 2026 sobre el aplazamiento previsto', url: 'https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf', date: '2026-10-28', kind: 'documento' },
    {
      label: 'AEAT: nota informativa sobre la ampliación del plazo de adaptación',
      url: 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/nota-informativa-ampliacion-plazo-adaptacion-facturacion.html',
      date: '2026-10-28',
      kind: 'criterio',
    },
    { label: 'AEAT: preguntas frecuentes, cuestiones generales (sanciones y periodo de pruebas)', url: 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes.html', date: '2026-10-28', kind: 'criterio' },
    {
      label: 'AEAT: preguntas frecuentes sobre los ámbitos de aplicación',
      url: 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html',
      date: '2026-10-28',
      kind: 'criterio',
    },
    {
      label: 'AEAT: preguntas frecuentes sobre los sistemas VERI*FACTU',
      url: 'https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/sistemas-verifactu.html',
      date: '2026-10-28',
      kind: 'criterio',
    },
    { label: 'AEAT: calendario de implantación de la factura electrónica', url: 'https://sede.agenciatributaria.gob.es/Sede/iva/factura-electronica/calendario-implantacion.html', date: '2026-10-28', kind: 'criterio' },
  ],
  quiz: {
    id: 'fis-02-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'fis-02-q1',
        prompt:
          'Hoy, 28/10/2026, la administradora de una S.L. te dice que ha leído que Verifactu se aplaza a octubre de 2028 y que va a parar la adaptación de su software. La sociedad tributa por el Impuesto sobre Sociedades, liquida el IVA por trimestres, tiene el domicilio fiscal en Barcelona y no lleva el SII. ¿Qué le respondes?',
        options: [
          {
            id: 'a',
            text: 'Que tiene razón: la nota de Hacienda de 5/10/2026 ya ha trasladado su obligación a octubre de 2028.',
            feedback: 'Esa nota anuncia una previsión. Un comunicado no modifica un reglamento: hace falta una norma publicada en el BOE, y a 28/10/2026 no existe.',
          },
          {
            id: 'b',
            text: 'Que su fecha es antes del 1/7/2026, la que fijó el RD 254/2025.',
            feedback: 'El RDL 15/2025 sustituyó las fechas del RD 254/2025. Además, el 1/7/2026 nunca fue la fecha de las sociedades, sino la del resto de obligados.',
          },
          { id: 'c', text: 'Que su fecha sigue siendo antes del 1/1/2027: el aplazamiento solo regirá cuando se publique en el BOE.' },
          {
            id: 'd',
            text: 'Que, al ser una pyme que factura menos de 8 millones, su fecha es antes del 1/7/2027.',
            feedback: 'El reglamento distingue por tipo de contribuyente, no por tamaño: todo contribuyente del Impuesto sobre Sociedades tiene la fecha del 1/1/2027. El umbral de 8 millones pertenece a la factura electrónica B2B.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'La disposición final cuarta del RD 1007/2023, en la redacción del RDL 15/2025, exige a los contribuyentes del Impuesto sobre Sociedades tener el sistema adaptado antes del 1/1/2027. El BOE no ha publicado ninguna modificación posterior y la AEAT mantiene esa fecha en sus preguntas frecuentes de 21/10/2026.',
        ref: 'Apartado 3, «Calendario vigente y aplazamiento anunciado»',
      },
      {
        id: 'fis-02-q2',
        prompt: 'Según el reglamento y el criterio de la AEAT, ¿cuál de estos clientes **no** está sujeto a Verifactu? Todos tienen el domicilio fiscal en territorio común.',
        options: [
          {
            id: 'a',
            text: 'Un autónomo en estimación directa que factura con un programa en la nube.',
            feedback: 'Es contribuyente del IRPF con actividad económica y usa un sistema informático de facturación (art. 3.1.b RRSIF).',
          },
          {
            id: 'b',
            text: 'Una sociedad patrimonial que emite sus facturas de alquiler con un ERP.',
            feedback: 'Es contribuyente del Impuesto sobre Sociedades, y la AEAT confirma que las sociedades patrimoniales están incluidas (art. 3.1.a RRSIF).',
          },
          {
            id: 'c',
            text: 'Una comunidad de bienes (un taller) que factura con un programa de facturación.',
            feedback: 'Es una entidad en atribución de rentas que desarrolla una actividad económica (art. 3.1.d RRSIF).',
          },
          { id: 'd', text: 'Una S.L. inscrita en el REDEME para pedir la devolución mensual del IVA.' },
        ],
        correctOptionId: 'd',
        explanation:
          'Quien está inscrito en el REDEME liquida el IVA por meses (art. 71.3 RIVA) y, por eso, lleva los libros registro por el SII (art. 62.6 RIVA). El art. 3.3 RRSIF excluye a quienes llevan los libros por el SII.',
        ref: 'Apartado 2, «A quién afecta: la regla de los 4 NO»',
      },
      {
        id: 'fis-02-q3',
        prompt: 'Una sociedad decide usar su sistema de facturación en la modalidad no verificable. ¿Qué afirmación es correcta?',
        options: [
          {
            id: 'a',
            text: 'Debe enviar de forma automática e instantánea cada registro a la AEAT.',
            feedback: 'El envío automático y continuo define a la modalidad VERI*FACTU. En la no verificable, los registros se conservan y se entregan cuando la AEAT los requiere (art. 14.2 RRSIF).',
          },
          { id: 'b', text: 'Debe firmar electrónicamente los registros de facturación y llevar un registro de eventos.' },
          {
            id: 'c',
            text: 'Debe incluir en sus facturas la frase «VERI*FACTU».',
            feedback: 'La frase solo se incluye cuando el sistema envía todos los registros a la AEAT (art. 6.5.b del Reglamento de facturación).',
          },
          {
            id: 'd',
            text: 'Queda dispensada de incluir el código QR en sus facturas.',
            feedback: 'El QR es obligatorio en las facturas expedidas con cualquier sistema, en las dos modalidades (art. 6.5.a del Reglamento de facturación).',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Fuera de la modalidad VERI*FACTU, los registros deben firmarse electrónicamente (art. 12 RRSIF, con firma XAdES según el art. 14 de la Orden HAC/1177/2024) y el sistema debe llevar un registro de eventos (art. 8.3 RRSIF y art. 9 de la Orden).',
        ref: 'Apartado 4, «Modalidad VERI*FACTU o no verificable»',
      },
    ],
  },
  documentIds: ['doc-verifactu', 'doc-facturacion-b2b'],
  version: 1,
  verifiedAt: '2026-10-28',
  editorial: {
    status: 'publicado',
    authorId: 'p-judith-calet',
    publishedAt: '2026-10-13T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
};

export const bank: QuizQuestion[] = [
  {
    id: 'fis-02-b1',
    prompt:
      'En una comprobación, la AEAT constata que un autónomo siguió facturando en 2027 (desde el 1 de julio) y en 2028 con un programa no adaptado y sin declaración responsable. Le impone la multa del art. 201 bis LGT por cada ejercicio. Si paga en periodo voluntario y no recurre, ¿cuánto ingresará en total?',
    options: [
      { id: 'a', text: '100.000 €', feedback: 'Es el importe de las dos multas sin la reducción del 40 % por pagar en plazo y no recurrir.' },
      { id: 'b', text: '70.000 €', feedback: 'Aplica la reducción del 30 % por conformidad, que el art. 188.1 LGT reserva a las sanciones de los arts. 191 a 197.' },
      { id: 'c', text: '60.000 €' },
      { id: 'd', text: '42.000 €', feedback: 'Encadena el 30 % y el 40 %, pero la reducción por conformidad no se aplica a esta infracción.' },
    ],
    correctOptionId: 'c',
    explanation:
      'Son dos ejercicios con un sistema no adaptado: 2 × 50.000 € = 100.000 €. La reducción del 40 % del art. 188.3 LGT vale para cualquier infracción si se paga en plazo y no se recurre: 100.000 € × (1 − 0,40) = 60.000 €.',
    ref: 'Apartado 5, «Sanciones y relación con la factura electrónica B2B»',
  },
  {
    id: 'fis-02-b2',
    prompt: '¿Desde qué fecha deben los productores y comercializadores ofrecer sus sistemas de facturación plenamente adaptados al reglamento?',
    options: [
      {
        id: 'a',
        text: 'Desde el 1/1/2027.',
        feedback: 'Es la fecha de los usuarios que tributan por el Impuesto sobre Sociedades. A los productores solo les afecta como límite para los sistemas con contrato de mantenimiento plurianual.',
      },
      { id: 'b', text: 'Desde el 29/7/2025.' },
      { id: 'c', text: 'Desde el 1/7/2027.', feedback: 'Es la fecha del resto de usuarios: autónomos, no residentes con establecimiento permanente y entidades en atribución de rentas.' },
      {
        id: 'd',
        text: 'Desde octubre de 2028.',
        feedback: 'Es la fecha anunciada por Hacienda, sin norma publicada, para las obligaciones aún pendientes; la de los productores ya es exigible.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'La disposición final cuarta del RD 1007/2023 les da nueve meses desde la entrada en vigor de la Orden HAC/1177/2024, el 29/10/2024: 29/10/2024 + 9 meses = 29/7/2025. El RDL 15/2025 mantuvo esa regla.',
    ref: 'Apartado 3, «Calendario vigente y aplazamiento anunciado»',
  },
  {
    id: 'fis-02-b3',
    prompt:
      'Una S.L. sin SII, con un volumen de operaciones de 5 millones de euros en 2026 y en 2027, vende a otras empresas. Según el RD 238/2026, ¿desde cuándo debe expedir y recibir facturas electrónicas en esas operaciones?',
    options: [
      { id: 'a', text: 'Desde el 6/10/2027.', feedback: 'Esa fecha es para quienes superaron 8 millones de euros de volumen de operaciones en el año natural anterior.' },
      { id: 'b', text: 'Desde el 1/1/2027.', feedback: 'Es la fecha de Verifactu para los contribuyentes del Impuesto sobre Sociedades, una obligación distinta.' },
      {
        id: 'c',
        text: 'Desde el 6/10/2029.',
        feedback: 'Es la fecha en que las personas físicas y entidades en atribución de rentas de hasta 8 millones deben informar de los estados de la factura; no se aplica a una S.L.',
      },
      { id: 'd', text: 'Desde el 6/10/2028.' },
    ],
    correctOptionId: 'd',
    explanation:
      'Con un volumen no superior a 8 millones de euros, la obligación llega 24 meses después de la entrada en vigor de la Orden HAC/1028/2026 (disposición final cuarta.1.b del RD 238/2026): 6/10/2026 + 24 meses = 6/10/2028.',
    ref: 'Apartado 5, «Sanciones y relación con la factura electrónica B2B»',
  },
  {
    id: 'fis-02-b4',
    prompt:
      'Una autónoma emite sus facturas con una plantilla de Excel cuya macro genera automáticamente su libro registro de facturas expedidas. Según el criterio de la AEAT, ¿qué le dirías?',
    options: [
      { id: 'a', text: 'Que esa hoja es un sistema informático de facturación y le afecta Verifactu.' },
      { id: 'b', text: 'Que no le afecta, porque Excel no es un programa de facturación.', feedback: 'Cuenta la función, no la marca del programa: solo queda fuera la hoja que se usa para escribir, imprimir y guardar facturas.' },
      { id: 'c', text: 'Que solo le afectará si elige la modalidad VERI*FACTU.', feedback: 'La modalidad es una forma de cumplir; la obligación nace por usar un sistema informático de facturación.' },
      { id: 'd', text: 'Que solo le afectará si su volumen de operaciones supera 8 millones de euros.', feedback: 'El umbral de 8 millones pertenece al calendario de la factura electrónica B2B, no a Verifactu.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Para la AEAT, una hoja de cálculo es un sistema informático de facturación cuando procesa los datos para generar libros registro u otros resultados, como hace la macro. Al usarlo, la autónoma queda dentro del art. 3.1.b RRSIF y debe adaptarse antes del 1/7/2027.',
    ref: 'Apartado 1, «Qué es Verifactu y qué exige»',
  },
];

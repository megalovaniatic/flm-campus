import type { Formation, QuizQuestion } from '@flm/shared';

export const formation: Formation = {
  id: 'con-03',
  slug: 'amortizacion-contable-y-fiscal',
  area: 'contable',
  title: 'Amortización contable y fiscal: cuándo coinciden y cuándo no',
  intro:
    'Imagina un cliente, una sociedad de servicios con 14 millones de euros de cifra de negocios, que renueva sus portátiles cada tres años y los amortiza en ese plazo. Al preparar el Impuesto sobre Sociedades ves que la tabla fiscal solo admite un 25 % anual para estos equipos: ¿se pierde el gasto, hay que cambiar la contabilidad o basta con un ajuste? Aquí aprenderás a decidirlo, a cuantificar el ajuste y a registrar el impuesto diferido.',
  summary: 'Compara la amortización contable con la tabla del art. 12 LIS, ajusta el exceso, aprovecha los incentivos fiscales y registra el impuesto diferido sin errores.',
  coverTerm: 'Art. 12',
  readingMinutes: 10,
  outcomes: [
    'Calcular la cuota de amortización contable a partir de la vida útil y compararla con el coeficiente máximo de la tabla del art. 12.1.a) LIS.',
    'Cuantificar el ajuste extracontable de cada ejercicio, su reversión y el activo (4740) o pasivo (479) por impuesto diferido que genera.',
    'Decidir qué incentivo puede aplicar un cliente (elementos de escaso valor, coeficiente doble o libertad de amortización de las ERD, vehículos eléctricos) y si debe registrar impuestos diferidos.',
  ],
  blocks: [
    /* ── 1 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Contabilidad: manda la vida útil', id: 'vida-util' },
    {
      type: 'paragraph',
      text: 'En contabilidad, la amortización reparte el coste del bien «de manera sistemática y racional» en función de su [[vida útil]] y de su valor residual, atendiendo a la depreciación por funcionamiento, uso y disfrute y a la obsolescencia técnica o comercial ([NRV 2.ª.2.1 PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A2-2)). La base amortizable es el precio de adquisición, sin el IVA deducible, menos el valor residual, que se ignora si no es significativo. El método se elige con un criterio técnico-económico, «con independencia de consideraciones fiscales» ([Resolución del ICAC de 1 de marzo de 2013](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2013-2557), norma segunda, apartado 3).',
    },
    {
      type: 'list',
      items: [
        'Empieza a amortizar cuando el bien está en condiciones de funcionamiento, no en la fecha de la factura.',
        'No detengas la amortización porque el bien esté inactivo: solo cesa cuando está totalmente amortizado o se clasifica como mantenido para la venta.',
        'Revisa vida útil, valor residual y método, como mínimo, al cierre de cada ejercicio. Si cambian, es un cambio de estimación y se aplica de forma prospectiva ([NRV 22.ª PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A22)).',
        'Registra la dotación con cargo a la 681 y abono a la 281 (la 2817, en equipos para procesos de información).',
      ],
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'vida útil',
      text: 'Es el periodo durante el cual la empresa espera utilizar el activo, o las unidades de producción que espera obtener de él ([Marco Conceptual del PGC, 6.º](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A6)). Es una estimación propia, basada en el uso y el desgaste esperados, la obsolescencia y los límites legales, que debe poder justificarse: política de renovación, experiencia con bienes similares o informe técnico. Nunca se fija copiando la tabla fiscal.',
      refs: [
        { label: 'Resolución del ICAC de 1 de marzo de 2013, norma segunda, apartados 3.3 y 3.5', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2013-2557', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 2 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'La tabla fiscal: cuándo coinciden y cuándo no', id: 'tabla-fiscal' },
    {
      type: 'paragraph',
      text: 'El Impuesto sobre Sociedades parte del resultado contable y lo corrige ([art. 10.3 LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a10)). La amortización es deducible si responde a la depreciación efectiva, que normalmente se acredita con la tabla del [art. 12.1.a) LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a12): para cada tipo de elemento fija un [[coeficiente lineal máximo]] y un periodo máximo. Sirve cualquier coeficiente entre el máximo y el que resulta del periodo máximo ([art. 4.1 RIS](https://www.boe.es/buscar/act.php?id=BOE-A-2015-7771#a4)): en equipos para procesos de información, entre el 12,5 % (100 / 8 años) y el 25 %.',
    },
    {
      type: 'table',
      caption: 'Extracto de la tabla del art. 12.1.a) LIS (sin cambios desde 2015)',
      columns: ['Tipo de elemento', 'Coeficiente lineal máximo', 'Periodo máximo', 'Mínimo por tabla (100 / periodo)'],
      rows: [
        ['Equipos para procesos de información', '25 %', '8 años', '12,5 %'],
        ['Sistemas y programas informáticos', '33 %', '6 años', '16,67 %'],
        ['Mobiliario', '10 %', '20 años', '5 %'],
        ['Maquinaria', '12 %', '18 años', '5,56 %'],
        ['Elementos de transporte externo', '16 %', '14 años', '7,14 %'],
        ['Edificios comerciales, administrativos, de servicios y viviendas', '2 %', '100 años', '1 %'],
      ],
      numeric: [1, 2, 3],
    },
    {
      type: 'paragraph',
      text: 'Ambas amortizaciones coinciden cuando la cuota contable cae dentro de esa horquilla. Un equipo informático de 1.500 € con 4 años de vida útil se amortiza a 375 € anuales, justo el 25 %: lo que registras como gasto es lo que deduces, sin ajustes ni impuestos diferidos. Si el bien se compra usado, el límite fiscal es el doble del coeficiente máximo aplicado a su precio ([art. 4.3 RIS](https://www.boe.es/buscar/act.php?id=BOE-A-2015-7771#a4)).',
    },
    {
      type: 'widget',
      widget: { kind: 'amortizacion', coste: 1500, vidaUtil: 4, coeficienteFiscalMax: 25, valorResidual: 0 },
      caption: 'Con 4 años de vida útil, la cuota contable (375 €) coincide cada año con el máximo fiscal del 25 %: no hay ajuste. Con 3 años, subiría a 500 € y aparecería el desfase del caso resuelto.',
    },
    { type: 'paragraph', text: 'Cuando no coinciden, identifica la causa, porque de ella depende el signo del ajuste:' },
    {
      type: 'list',
      items: [
        '**Vida útil más corta que la de la tabla.** La cuota contable supera el máximo fiscal: sumas el exceso a la base imponible y lo restas cuando el bien ya esté amortizado en contabilidad (casillas 00303 y 00304 del modelo 200 de 2025, según el [Manual práctico de Sociedades 2025](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-sociedades-2025/capitulo-05-liquidacion-is-determinacion-imponible/bi-antes-reserva-capitalizac-compensac-00550/detalle-correcc-result-cuenta-perdidas-is/amortizaciones/diferencias-amortizacion-contable-fiscal.html)).',
        '**Un incentivo permite deducir más de lo contabilizado.** Restas la diferencia hoy y la sumas después, a medida que la contabilidad registra un gasto ya deducido.',
        '**Límites propios.** El fondo de comercio, cuya vida útil se presume de diez años salvo prueba en contrario ([art. 39.4 CCom](https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art39)), solo deduce un 5 % anual ([art. 12.2 LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a12)).',
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'El exceso no se pierde',
      text: 'Un exceso de amortización contable sobre el máximo fiscal no es una diferencia permanente: se deduce en el periodo que corresponda ([art. 11.3.1.º LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11)). Cuidado también por abajo: si un año dotas menos de lo que resulta del periodo máximo, el exceso posterior sobre el máximo se entiende correspondiente a aquel ejercicio ([art. 4.1 RIS](https://www.boe.es/buscar/act.php?id=BOE-A-2015-7771#a4)). Dota la amortización todos los años.',
      refs: [
        { label: 'Ley 27/2014, del Impuesto sobre Sociedades, art. 11.3', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11', date: '2026-10-28', kind: 'norma' },
        { label: 'Reglamento del Impuesto sobre Sociedades, art. 4.1', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-7771#a4', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 3 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Incentivos que adelantan el gasto fiscal', id: 'incentivos' },
    {
      type: 'paragraph',
      text: 'Para deducir un gasto hay que contabilizarlo, salvo en los elementos que pueden amortizarse libremente o de forma acelerada ([art. 11.3.1.º LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11)). Estos incentivos se aplican, por tanto, con una disminución extracontable, y la contabilidad sigue reflejando la vida útil real. Varios están reservados a la [[empresa de reducida dimensión]] (ERD), la que tuvo en el periodo impositivo anterior una cifra de negocios inferior a 10 millones de euros, computando el grupo, y no es entidad patrimonial ([art. 101 LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a101)).',
    },
    {
      type: 'list',
      items: [
        '**Elementos de escaso valor** ([art. 12.3.e) LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a12)): cualquier entidad, sea o no ERD, puede amortizar libremente los elementos del inmovilizado material nuevos de hasta 300 € por unidad, sin IVA deducible, con un límite de 25.000 € por periodo impositivo.',
        '**Coeficiente doble** ([art. 103 LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a103)): la ERD puede amortizar los elementos nuevos del inmovilizado material, las inversiones inmobiliarias y el inmovilizado intangible con el doble del coeficiente máximo de la tabla: 50 % en equipos informáticos, 24 % en maquinaria.',
        '**Creación de empleo** ([art. 102 LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a102)): si la ERD aumenta su plantilla media en los 24 meses siguientes al inicio del periodo en que entran en funcionamiento los elementos nuevos, y mantiene el aumento otros 24 meses, aplica la [[libertad de amortización]] hasta 120.000 € por persona de incremento.',
        '**Vehículos eléctricos y puntos de recarga** ([DA 18.ª LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#da-3)): libertad de amortización para vehículos nuevos FCV, FCHV, BEV, REEV o PHEV e infraestructuras de recarga nuevas, afectos a la actividad, que entren en funcionamiento en periodos impositivos iniciados en 2024, 2025 y 2026 (Real Decreto-ley 7/2026, convalidado). A 28 de octubre de 2026, el texto consolidado no recoge prórroga para 2027.',
      ],
    },
    {
      type: 'callout',
      tone: 'atencion',
      title: 'Comprueba el periodo y los requisitos',
      text: 'La condición de ERD se mide con la cifra de negocios del periodo anterior, y el coeficiente doble solo alcanza a los elementos puestos a disposición en un periodo en que la empresa sea ERD. Si en la libertad con creación de empleo la plantilla no aumenta o no se mantiene, hay que ingresar la cuota de lo deducido en exceso, con intereses de demora.',
      refs: [
        { label: 'Ley 27/2014, del Impuesto sobre Sociedades, arts. 101 a 103', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a101', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 4 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Del ajuste al impuesto diferido', id: 'impuesto-diferido' },
    {
      type: 'paragraph',
      text: 'Cuando las dos amortizaciones difieren, el [[valor neto contable]] del bien y su valor fiscal se separan. Esa brecha es una [[diferencia temporaria]] ([NRV 13.ª PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A13)), y su efecto impositivo se registra contra la cuenta 6301, valorado al tipo esperado en el ejercicio de reversión. El activo por impuesto diferido solo se reconoce si su recuperación es probable; salvo prueba en contrario, no lo es a más de diez años del cierre ([art. 5.3 de la Resolución del ICAC de 9 de febrero de 2016](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2016-1564)).',
    },
    {
      type: 'callout',
      tone: 'clave',
      title: 'diferencia temporaria',
      text: 'Compara al cierre el valor neto contable con el valor fiscal, es decir, el coste menos lo ya deducido. Si el fiscal es mayor, has deducido menos de lo contabilizado: la diferencia es deducible y genera un activo (4740). Si es menor porque un incentivo te dejó deducir más, es imponible y genera un pasivo (479). Registras la diferencia multiplicada por el tipo esperado cuando revierta.',
      refs: [
        { label: 'Plan General de Contabilidad, NRV 13.ª, apartados 2 y 3', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A13', date: '2026-10-28', kind: 'norma' },
      ],
    },
    {
      type: 'example',
      title: 'Portátil de 1.500 € amortizado en 3 años por una sociedad que no es ERD',
      scenario:
        'Sociedad de servicios con ejercicio natural y 14 M€ de cifra de negocios en 2025: no es ERD y tributa al 25 %. Pone en funcionamiento el 1 de enero de 2026 un equipo informático de 1.500 € (más IVA deducible) y, por su política de renovación, le asigna 3 años de vida útil, sin valor residual. Resultado contable antes de impuestos: 200.000 € cada año, sin otras diferencias; la recuperación del activo diferido es probable.',
      steps: [
        { label: 'Cuota contable anual (lineal)', formula: '1.500 € / 3 años', result: '500 € al año (33,33 %)' },
        { label: 'Máximo fiscal (equipos para procesos de información)', formula: '1.500 € × 25 %', result: '375 € al año' },
        { label: 'Ajuste de 2026, 2027 y 2028', formula: '500 € − 375 €', result: '+125 € al año (aumento)' },
        { label: 'Reversión en 2029, con el equipo ya amortizado en contabilidad', formula: '1.500 € − 3 × 375 € = 375 € pendientes', result: '−375 € (disminución)' },
        { label: 'Activo por impuesto diferido al cierre de 2026', formula: '(1.125 € fiscal − 1.000 € contable) × 25 %', result: '31,25 € en la 4740' },
        { label: 'Saldo de la 4740 al cierre de 2028', formula: '(375 € − 0 €) × 25 %', result: '93,75 €; se cancela en 2029 contra la 6301' },
        { label: 'Gasto por impuesto de 2026', formula: '200.125 € × 25 % = 50.031,25 € − 31,25 € de diferido', result: '50.000 € (25 % de 200.000 €)' },
      ],
      conclusion:
        'La contabilidad mantiene los 3 años porque son la vida útil real. Fiscalmente se deducen los mismos 1.500 €, pero 375 € se desplazan a 2029, y entretanto la 4740 recoge el impuesto que se recuperará. El gasto total por impuesto es cada año el 25 % del resultado contable.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'grafico',
        chart: {
          type: 'lineas',
          title: 'Valor neto contable frente a valor fiscal del portátil',
          unit: '€',
          xLabel: 'Fecha',
          yLabel: 'Importe (€)',
          series: [
            {
              name: 'Valor neto contable (vida útil de 3 años)',
              values: [
                { x: '01/01/2026', y: 1500 },
                { x: '31/12/2026', y: 1000 },
                { x: '31/12/2027', y: 500 },
                { x: '31/12/2028', y: 0 },
                { x: '31/12/2029', y: 0 },
              ],
            },
            {
              name: 'Valor fiscal pendiente (25 % anual)',
              values: [
                { x: '01/01/2026', y: 1500 },
                { x: '31/12/2026', y: 1125 },
                { x: '31/12/2027', y: 750 },
                { x: '31/12/2028', y: 375 },
                { x: '31/12/2029', y: 0 },
              ],
            },
          ],
        },
      },
      caption: 'La distancia entre las líneas es la diferencia temporaria deducible: 125 €, 250 € y 375 € al cierre de 2026, 2027 y 2028; se cierra en 2029. Con 4 años de vida útil, ambas líneas coincidirían.',
    },
    {
      type: 'widget',
      widget: {
        kind: 'cuentas-t',
        title: 'Registro del caso resuelto (2026-2029)',
        entries: [
          {
            date: '2026-12-31',
            concept: 'Amortización de 2026',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 500 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 500 },
            ],
          },
          {
            date: '2026-12-31',
            concept: 'Activo por impuesto diferido de 2026 (125 € × 25 %)',
            lines: [
              { account: '4740', name: 'Activos por diferencias temporarias deducibles', debit: 31.25 },
              { account: '6301', name: 'Impuesto diferido', credit: 31.25 },
            ],
          },
          {
            date: '2027-12-31',
            concept: 'Amortización de 2027',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 500 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 500 },
            ],
          },
          {
            date: '2027-12-31',
            concept: 'Activo por impuesto diferido de 2027 (125 € × 25 %)',
            lines: [
              { account: '4740', name: 'Activos por diferencias temporarias deducibles', debit: 31.25 },
              { account: '6301', name: 'Impuesto diferido', credit: 31.25 },
            ],
          },
          {
            date: '2028-12-31',
            concept: 'Amortización de 2028',
            lines: [
              { account: '681', name: 'Amortización del inmovilizado material', debit: 500 },
              { account: '2817', name: 'Amortización acumulada de equipos para procesos de información', credit: 500 },
            ],
          },
          {
            date: '2028-12-31',
            concept: 'Activo por impuesto diferido de 2028 (125 € × 25 %)',
            lines: [
              { account: '4740', name: 'Activos por diferencias temporarias deducibles', debit: 31.25 },
              { account: '6301', name: 'Impuesto diferido', credit: 31.25 },
            ],
          },
          {
            date: '2029-12-31',
            concept: 'Reversión: se deducen los 375 € pendientes (375 € × 25 %)',
            lines: [
              { account: '6301', name: 'Impuesto diferido', debit: 93.75 },
              { account: '4740', name: 'Activos por diferencias temporarias deducibles', credit: 93.75 },
            ],
          },
        ],
      },
      caption: 'La 4740 crece 31,25 € al año hasta 93,75 € y se cancela en 2029 contra la 6301. El impuesto corriente (6300 contra 4752) se registra aparte, por el importe de la liquidación.',
    },
    {
      type: 'paragraph',
      text: 'Ahora, el efecto contrario. Si el cliente fuera ERD (con 3 M€ de cifra de negocios en 2025, por ejemplo), podría deducir hasta 750 € anuales por este equipo nuevo (2 × 25 %). Puede limitarse a los 500 € contabilizados, sin ajustes, o adelantar el gasto: 750 € en 2026 y otros 750 € en 2027 (disminuciones de 250 € cada año) y sumar en 2028 los 500 € contables, ya no deducibles. El valor fiscal queda por debajo del contable y nace un pasivo en la 479. Si prevés que en 2028 siga tributando al tipo de las ERD, valóralo al 21 %: 52,50 € al cierre de 2026 y 105 € al de 2027.',
    },
    {
      type: 'callout',
      tone: 'norma',
      title: 'Tipos de gravamen para valorar el diferido',
      text: 'Usa el tipo esperado en el ejercicio de reversión, según la normativa vigente o aprobada al cierre ([NRV 13.ª.3 PGC](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A13)). General: 25 %. ERD: 23 % en 2026, 22 % en 2027, 21 % en 2028 y 20 % desde 2029. Cifra de negocios inferior a 1 M€: en 2026, 19 % por los primeros 50.000 € de base y 21 % por el resto; desde 2027, 17 % y 20 % ([art. 29.1](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a29) y [DT 44.ª LIS](https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#dt-6)).',
      refs: [
        { label: 'Ley 27/2014, del Impuesto sobre Sociedades, art. 29.1', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a29', date: '2026-10-28', kind: 'norma' },
        { label: 'Ley 27/2014, disposición transitoria cuadragésima cuarta', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#dt-6', date: '2026-10-28', kind: 'norma' },
      ],
    },

    /* ── 5 ─────────────────────────────────────────────────────────────── */
    { type: 'heading', text: 'Quién registra diferidos: microempresas y autónomos', id: 'quien-registra' },
    {
      type: 'paragraph',
      text: 'Quien aplica el PGC o el PGC de Pymes registra los impuestos diferidos con estos criterios ([NRV 15.ª del PGC de Pymes](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#A15)). Antes de proponer el asiento, descarta estos dos supuestos:',
    },
    {
      type: 'list',
      items: [
        '**Microempresa con criterios específicos** ([art. 4 del Real Decreto 1515/2007](https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#a4)): puede optar por ellos la pyme que, durante dos ejercicios consecutivos, cumple al cierre dos de estos límites: activo de hasta 1 M€, cifra de negocios de hasta 2 M€ y plantilla media de hasta 10 personas. Registra como gasto el impuesto de la liquidación, sin 4740 ni 479, y explica las diferencias en la memoria.',
        '**Empresario individual**: no contabiliza impuesto sobre beneficios ([art. 20 de la Resolución del ICAC de 9 de febrero de 2016](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2016-1564)). En el IRPF, la estimación directa sigue las normas del Impuesto sobre Sociedades ([art. 28.1 LIRPF](https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764#a28)), y la modalidad simplificada amortiza linealmente con una tabla propia ([art. 30 RIRPF](https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820#a30)).',
      ],
    },
    {
      type: 'callout',
      tone: 'consejo',
      title: 'Una ficha por elemento',
      text: 'Para cada bien con desfase, guarda en el expediente la fecha de puesta en funcionamiento, la vida útil y su justificación, el coeficiente o incentivo aplicado, el valor fiscal pendiente y el saldo de la 4740 o la 479. Así nadie tendrá que reconstruir la reversión años después.',
    },
  ],
  keyTerms: [
    {
      term: 'vida útil',
      definition: 'Periodo durante el cual la empresa espera utilizar el activo, o unidades de producción que espera obtener de él. Es una estimación propia que se revisa en cada cierre.',
    },
    {
      term: 'valor neto contable',
      definition: 'Coste del bien menos la amortización acumulada y, en su caso, los deterioros acumulados: el importe por el que figura en el balance.',
    },
    {
      term: 'coeficiente lineal máximo',
      definition: 'Porcentaje anual máximo de amortización deducible que fija la tabla del art. 12.1.a) LIS para cada tipo de elemento; por ejemplo, 25 % en equipos para procesos de información.',
    },
    {
      term: 'diferencia temporaria',
      definition: 'Diferencia entre el valor contable y el fiscal de un activo o pasivo que revertirá en el futuro: deducible (activo, cuenta 4740) o imponible (pasivo, cuenta 479).',
    },
    {
      term: 'empresa de reducida dimensión',
      definition: 'Entidad no patrimonial cuya cifra de negocios del periodo impositivo anterior, computando el grupo, es inferior a 10 millones de euros (art. 101 LIS).',
    },
    {
      term: 'libertad de amortización',
      definition: 'Deducción de la amortización sin límite anual ni necesidad de contabilizarla, en los supuestos tasados por la ley, como los elementos nuevos de hasta 300 €.',
    },
  ],
  takeaway:
    'La contabilidad amortiza según la vida útil real; la tabla fiscal solo pone un techo y algunos incentivos permiten adelantar el gasto. Cuando no coinciden, la diferencia es temporal: se ajusta hoy, revierte después y, mientras tanto, se refleja en la 4740 o en la 479.',
  sources: [
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades: art. 12 (amortizaciones y tabla de coeficientes)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a12', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades: art. 11.3.1.º (imputación contable de gastos)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a11', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades: arts. 101 a 103 (empresas de reducida dimensión)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a101', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades: disposición adicional decimoctava (vehículos e infraestructuras de recarga)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#da-3', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades: art. 29 (tipo de gravamen)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a29', date: '2026-10-28', kind: 'norma' },
    { label: 'Ley 27/2014, del Impuesto sobre Sociedades: disposición transitoria cuadragésima cuarta (tipos de 2025 a 2028)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#dt-6', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 634/2015, Reglamento del Impuesto sobre Sociedades: arts. 3 y 4', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-7771#a3', date: '2026-10-28', kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 2.ª (inmovilizado material)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A2-2', date: '2026-10-28', kind: 'norma' },
    { label: 'Plan General de Contabilidad: NRV 13.ª (impuestos sobre beneficios)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19884#A13', date: '2026-10-28', kind: 'norma' },
    { label: 'Real Decreto 1515/2007, PGC de Pymes: art. 4 (criterios específicos de microempresas)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-19966#a4', date: '2026-10-28', kind: 'norma' },
    { label: 'Resolución del ICAC de 1 de marzo de 2013 (inmovilizado material e inversiones inmobiliarias)', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2013-2557', date: '2026-10-28', kind: 'norma' },
    { label: 'Resolución del ICAC de 9 de febrero de 2016 (impuesto sobre beneficios)', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2016-1564', date: '2026-10-28', kind: 'norma' },
    { label: 'Código de Comercio: art. 39 (amortización de intangibles y fondo de comercio)', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art39', date: '2026-10-28', kind: 'norma' },
    { label: 'Resolución de 26 de marzo de 2026, del Congreso de los Diputados: convalidación del Real Decreto-ley 7/2026', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7125', date: '2026-10-28', kind: 'norma' },
    {
      label: 'AEAT, Manual práctico de Sociedades 2025: diferencias entre amortización contable y fiscal',
      url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-sociedades-2025/capitulo-05-liquidacion-is-determinacion-imponible/bi-antes-reserva-capitalizac-compensac-00550/detalle-correcc-result-cuenta-perdidas-is/amortizaciones/diferencias-amortizacion-contable-fiscal.html',
      date: '2026-10-28',
      kind: 'criterio',
    },
  ],
  quiz: {
    id: 'con-03-test',
    title: 'Test final',
    passMark: 2,
    questions: [
      {
        id: 'con-03-q1',
        prompt:
          'Una sociedad que no es ERD (14 M€ de cifra de negocios en 2025) pone en funcionamiento el 1 de enero de 2026 un portátil de 1.500 € y, por su política de renovación, lo amortiza en 3 años (lineal, sin valor residual). ¿Qué ajuste practica en el Impuesto sobre Sociedades de 2026?',
        options: [
          {
            id: 'a',
            text: 'Ninguno: la amortización es deducible siempre que esté contabilizada.',
            feedback: 'Contabilizar el gasto es necesario, pero no suficiente: solo se deduce la depreciación efectiva, que la tabla del art. 12.1.a) LIS limita al 25 % anual en estos equipos.',
          },
          { id: 'b', text: 'Un aumento de 125 € en la base imponible, que revertirá cuando el equipo esté amortizado en contabilidad.' },
          {
            id: 'c',
            text: 'Una disminución de 125 € en la base imponible.',
            feedback: 'El signo está invertido: hay disminución cuando se deduce más de lo contabilizado, por ejemplo con un incentivo, no cuando el gasto contable supera el máximo fiscal.',
          },
          {
            id: 'd',
            text: 'Un aumento de 500 € en la base imponible.',
            feedback: 'Solo deja de ser deducible el exceso sobre el máximo: los 375 € que caben en el 25 % se deducen en 2026.',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'La cuota contable es 1.500 / 3 = 500 €, pero el máximo fiscal es 1.500 × 25 % = 375 €. El exceso de 125 € se suma a la base imponible en 2026, 2027 y 2028, y los 375 € acumulados se restan en 2029, cuando el equipo ya está amortizado en contabilidad (art. 12.1.a) LIS).',
        ref: 'Apartado 2 · La tabla fiscal: cuándo coinciden y cuándo no',
      },
      {
        id: 'con-03-q2',
        prompt: 'En el caso anterior, con un tipo de gravamen del 25 % y recuperación probable, ¿cómo registras al cierre de 2026 el efecto impositivo de esa diferencia?',
        options: [
          {
            id: 'a',
            text: 'Abono en (479) Pasivos por diferencias temporarias imponibles por 31,25 €, con cargo en (6301) Impuesto diferido.',
            feedback: 'La 479 recoge diferencias que aumentarán impuestos futuros, típicas cuando se deduce más de lo contabilizado. Aquí ocurre lo contrario: se ha deducido menos.',
          },
          {
            id: 'b',
            text: 'Cargo en (4740) Activos por diferencias temporarias deducibles por 125 €, con abono en (6301) Impuesto diferido.',
            feedback: 'El activo es el efecto impositivo de la diferencia (125 € × 25 %), no la diferencia entera.',
          },
          {
            id: 'c',
            text: 'No se registra nada, porque es una diferencia permanente.',
            feedback: 'La diferencia revierte: en 2029 se restan 375 € y el activo acumulado (93,75 €) se cancela contra la 6301. Es temporaria, no permanente.',
          },
          { id: 'd', text: 'Cargo en (4740) Activos por diferencias temporarias deducibles por 31,25 €, con abono en (6301) Impuesto diferido.' },
        ],
        correctOptionId: 'd',
        explanation:
          'Al cierre de 2026, el valor fiscal del equipo (1.125 €) supera su valor neto contable (1.000 €). La diferencia de 125 € reducirá impuestos futuros: es deducible y genera un activo de 125 × 25 % = 31,25 €, con cargo a la 4740 y abono a la 6301 (NRV 13.ª PGC).',
        ref: 'Apartado 4 · Del ajuste al impuesto diferido',
      },
      {
        id: 'con-03-q3',
        prompt:
          'Un cliente ERD (3 M€ de cifra de negocios en 2025) pone en funcionamiento el 1 de enero de 2026 una máquina nueva de 60.000 € y la amortiza en contabilidad en 12 años (5.000 € anuales). Quiere aplicar el art. 103 LIS. ¿Qué es correcto para 2026?',
        options: [
          {
            id: 'a',
            text: 'No puede deducir más de 5.000 €, porque la amortización fiscal siempre exige registro contable.',
            feedback: 'El art. 11.3.1.º LIS exceptúa del requisito de imputación contable a los elementos que pueden amortizarse libremente o de forma acelerada.',
          },
          {
            id: 'b',
            text: 'Solo puede deducir 14.400 € si acorta la vida útil contable para que el gasto contable sea de 14.400 €.',
            feedback: 'La contabilidad debe reflejar la vida útil real (NRV 2.ª PGC). Acortarla por motivos fiscales no es admisible ni necesario.',
          },
          {
            id: 'c',
            text: 'Puede deducir hasta 14.400 € (60.000 € × 2 × 12 %) con una disminución de 9.400 € en la base imponible, sin modificar su contabilidad; nace una diferencia temporaria imponible.',
          },
          {
            id: 'd',
            text: 'Solo puede aplicar el coeficiente doble si incrementa su plantilla media durante 24 meses.',
            feedback: 'El requisito de plantilla es de la libertad de amortización del art. 102 LIS, no del coeficiente doble del art. 103.',
          },
        ],
        correctOptionId: 'c',
        explanation:
          'Las ERD pueden amortizar los elementos nuevos con el doble del coeficiente máximo de la tabla: en maquinaria, 2 × 12 % = 24 %, y 60.000 × 24 % = 14.400 €. Como la amortización acelerada no exige imputación contable, la diferencia (14.400 − 5.000 = 9.400 €) se resta extracontablemente y genera un pasivo por impuesto diferido (arts. 103 y 11.3.1.º LIS).',
        ref: 'Apartado 3 · Incentivos que adelantan el gasto fiscal',
      },
    ],
  },
  version: 1,
  verifiedAt: '2026-10-28',
  editorial: {
    status: 'publicado',
    authorId: 'p-judith-calet',
    publishedAt: '2026-10-12T09:00:00+02:00',
    review: { state: 'pendiente', note: 'Borrador redactado para la revisión del área.' },
  },
};

export const bank: QuizQuestion[] = [
  {
    id: 'con-03-b1',
    prompt:
      'Una sociedad que no es ERD pone en funcionamiento el 1 de enero de 2026 veinte sillas de oficina nuevas a 260 € cada una más IVA del 21 % (deducible). Las amortiza en 10 años: 520 € anuales en total. ¿Qué puede hacer en el Impuesto sobre Sociedades de 2026?',
    options: [
      {
        id: 'a',
        text: 'Solo deducir los 520 € contabilizados, porque la libertad de amortización exige contabilizar el gasto.',
        feedback: 'La libertad de amortización está exceptuada del requisito de imputación contable (art. 11.3.1.º LIS).',
      },
      {
        id: 'b',
        text: 'Nada especial: con IVA, cada silla cuesta 314,60 € y supera el límite de 300 €.',
        feedback: 'El IVA deducible no forma parte del precio de adquisición (NRV 2.ª PGC): el valor unitario es de 260 €.',
      },
      { id: 'c', text: 'Deducir los 5.200 € en 2026 con una disminución de 4.680 € y revertirla después con aumentos de 520 € anuales; nace una diferencia temporaria imponible.' },
      {
        id: 'd',
        text: 'Aplicar la libertad de amortización solo si fuera empresa de reducida dimensión.',
        feedback: 'El art. 12.3.e) LIS no exige ser ERD: lo puede aplicar cualquier entidad. Los incentivos exclusivos de las ERD son los de los arts. 102 y 103.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Son elementos nuevos del inmovilizado material de 260 € por unidad (no superan 300 €) y el total, 5.200 €, no rebasa el límite de 25.000 € por periodo. Pueden amortizarse libremente: 5.200 − 520 = 4.680 € de disminución en 2026, que revierte con aumentos de 520 € anuales mientras la contabilidad siga amortizando las sillas (art. 12.3.e) LIS).',
    ref: 'Formación «Amortización contable y fiscal», apartado 3 · Incentivos que adelantan el gasto fiscal',
  },
  {
    id: 'con-03-b2',
    prompt:
      'Una S.L. cumple desde hace años los límites de microempresa (activo de 600.000 €, cifra de negocios de 900.000 € y 6 personas en plantilla) y aplica los criterios específicos del PGC de Pymes. En 2026 su amortización contable supera el máximo fiscal y practica un aumento de 800 €. ¿Cómo refleja el efecto impositivo?',
    options: [
      { id: 'a', text: 'Contabiliza como gasto el impuesto que resulta de la liquidación (6300), sin activos ni pasivos diferidos, e informa de la diferencia en la memoria.' },
      {
        id: 'b',
        text: 'Registra un activo por impuesto diferido (4740) por el efecto impositivo del aumento.',
        feedback: 'Ese registro corresponde a quien aplica con carácter general la NRV 15.ª del PGC de Pymes, no a la microempresa que ha optado por sus criterios específicos.',
      },
      {
        id: 'c',
        text: 'Registra un pasivo por impuesto diferido (479) por el efecto impositivo del aumento.',
        feedback: 'Falla por partida doble: la microempresa no registra diferidos y, además, un aumento genera una diferencia deducible, no imponible.',
      },
      {
        id: 'd',
        text: 'Debe cambiar su amortización contable para que coincida con la fiscal.',
        feedback: 'La amortización contable sigue la vida útil (NRV 2.ª PGC); las diferencias con el Impuesto sobre Sociedades se resuelven con ajustes, no cambiando la contabilidad.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Las microempresas que optan por sus criterios específicos registran como gasto el impuesto que resulta de la liquidación del ejercicio y explican en la memoria, en el apartado de situación fiscal, las diferencias entre base imponible y resultado contable (art. 4.3 del Real Decreto 1515/2007; art. 21 de la Resolución del ICAC de 9 de febrero de 2016).',
    ref: 'Formación «Amortización contable y fiscal», apartado 5 · Quién registra diferidos: microempresas y autónomos',
  },
  {
    id: 'con-03-b3',
    prompt:
      'Una sociedad amortiza desde el 1 de enero de 2022 una máquina de 100.000 € en 10 años, sin valor residual. A 1 de enero de 2026, una revisión técnica concluye que solo podrá usarla 3 años más. ¿Cómo la amortiza en contabilidad desde 2026?',
    options: [
      {
        id: 'a',
        text: 'Reexpresa 2022-2025 con cargo a reservas, como si la vida útil total fuera de 7 años, y dota 14.285,71 € anuales.',
        feedback: 'La reexpresión retroactiva contra reservas es propia de los cambios de criterio y de la corrección de errores, no de los cambios de estimación.',
      },
      {
        id: 'b',
        text: 'Mantiene 10.000 € anuales, porque la tabla fiscal (12 %) los admite.',
        feedback: 'La contabilidad no se rige por la tabla fiscal, sino por la vida útil real, que ahora es más corta.',
      },
      {
        id: 'c',
        text: 'Dota 30.000 € en 2026 para «ponerse al día» y vuelve después a 10.000 € anuales.',
        feedback: 'No existe un ajuste de recuperación en el año del cambio: el efecto se reparte entre los ejercicios futuros.',
      },
      { id: 'd', text: 'Dota 20.000 € en 2026, 2027 y 2028: reparte el valor neto contable de 60.000 € entre los 3 años restantes.' },
    ],
    correctOptionId: 'd',
    explanation:
      'El cambio de vida útil es un cambio de estimación contable y se aplica de forma prospectiva (NRV 22.ª PGC): valor neto contable = 100.000 − 4 × 10.000 = 60.000 €; 60.000 / 3 = 20.000 € anuales. Fiscalmente, si no es ERD, el máximo para maquinaria es 12 % × 100.000 = 12.000 €: aumento de 8.000 € en 2026, 2027 y 2028, y reversión posterior.',
    ref: 'Formación «Amortización contable y fiscal», apartado 1 · Contabilidad: manda la vida útil',
  },
  {
    id: 'con-03-b4',
    prompt:
      'Una empresa de reparto que no es ERD pone en funcionamiento en enero de 2026 una furgoneta eléctrica (BEV) nueva de 45.000 €, afecta a su actividad, y la amortiza en contabilidad en 6 años (7.500 € anuales). ¿Qué opción tiene en el Impuesto sobre Sociedades de 2026?',
    options: [
      {
        id: 'a',
        text: 'Solo puede deducir el máximo de la tabla del art. 12.1.a) LIS para elementos de transporte.',
        feedback: 'La DA 18.ª LIS desplaza el límite de la tabla para estos vehículos cuando entran en funcionamiento en periodos impositivos iniciados en 2024, 2025 o 2026.',
      },
      { id: 'b', text: 'Puede amortizarla libremente: deducir en 2026 hasta 45.000 €, con una disminución de hasta 37.500 €, sin modificar su contabilidad; nace una diferencia temporaria imponible.' },
      {
        id: 'c',
        text: 'Para deducir más de 7.500 € debe amortizarla en contabilidad en un solo ejercicio.',
        feedback: 'La libertad de amortización no exige imputación contable (art. 11.3.1.º LIS); la contabilidad debe seguir reflejando la vida útil real.',
      },
      {
        id: 'd',
        text: 'Solo puede aplicar la libertad de amortización si es ERD y aumenta su plantilla.',
        feedback: 'La DA 18.ª no exige ser ERD ni crear empleo. Esos requisitos son de la libertad de amortización del art. 102 LIS.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'La DA 18.ª LIS, en la redacción del Real Decreto-ley 7/2026 (convalidado el 26 de marzo de 2026), permite amortizar libremente los vehículos nuevos FCV, FCHV, BEV, REEV o PHEV afectos a actividades económicas que entren en funcionamiento en periodos impositivos iniciados en 2024, 2025 y 2026. Como es libertad de amortización, no exige contabilizar el gasto: la diferencia con la cuota contable (hasta 37.500 €) se resta de la base imponible y genera un pasivo por impuesto diferido (479).',
    ref: 'Formación «Amortización contable y fiscal», apartado 3 · Incentivos que adelantan el gasto fiscal',
  },
];

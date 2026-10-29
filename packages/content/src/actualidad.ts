import type { EditorialMeta, NewsItem } from '@flm/shared';

/**
 * Actualidad en tu sector: novedades verificadas con la plantilla de cinco bloques.
 *
 * - Base: research/50-actualidad.verificado.md (corte 28/10/2026), contrastado otra vez con las fuentes
 *   primarias el 29/10/2026. No se publica lo que el informe marca como no verificable (año de referencia
 *   de la primera fase de la factura electrónica, apartado del art. 217 LEC, remisión de España al TJUE por los umbrales...).
 * - «date» es el día en que la novedad se hizo pública (BOE, CENDOJ, comunicado o aviso); la fuente
 *   recoge la fecha de la norma o de la resolución.
 * - Los avisos internos usan solo los datos de events.ts.
 * - Orden: de más reciente a más antigua.
 */

const editorial = (authorId: string, publishedAt: string, updatedAt?: string): EditorialMeta => ({
  status: 'publicado',
  authorId,
  publishedAt,
  ...(updatedAt ? { updatedAt } : {}),
  review: { state: 'pendiente', note: 'Pendiente de revisión del área.' },
});

export const news: NewsItem[] = [
  /* ── Aviso interno · nueva web ─────────────────────────────────────── */
  {
    id: 'news-aviso-nueva-web',
    slug: 'aviso-nueva-web-flmexperts',
    area: 'general',
    kind: 'aviso-interno',
    headline: 'Ya está en línea la nueva web flmexperts.com, con los servicios de cada área y nuestras tres sedes',
    oneLiner:
      'Estrenamos web corporativa, con una imagen renovada, los servicios de cada área, nuestras tres sedes y el respaldo de Crowe Global: ya está en línea en [flmexperts.com](https://flmexperts.com/).',
    affects: 'A todo el equipo de FLM, y en especial a quien trata con clientes, porque la web presenta los servicios de cada área y nuestras tres sedes.',
    action:
      '**Visita la web y revisa cómo presenta los servicios de tu área:** [flmexperts.com](https://flmexperts.com/).\n\n**Compártela** cuando un cliente o un contacto te pregunte por FLM, por sus servicios o por sus sedes.\n\n**Si ves algo que no cuadra** en la información de tu área, coméntalo con Comunicación.',
    example:
      'Un cliente te pregunta qué servicios laborales ofrece FLM y en qué sedes estamos. En lugar de explicarlo de memoria, envíale el enlace a flmexperts.com: ahí verá los servicios por área y nuestras tres sedes.',
    source: { label: 'FLM · Comunicación: «Ya está en línea la nueva web flmexperts.com» (Agenda del campus)', url: '#/participar/agenda/nueva-web-flmexperts', publishedOn: '2026-10-27' },
    urgency: 'informativa',
    date: '2026-10-27',
    editorial: editorial('p-laura-gil', '2026-10-27T09:00:00+01:00'),
  },

  /* ── Contable · criterio ICAC-CNMV ─────────────────────────────────── */
  {
    id: 'news-icac-cnmv-einf-2026',
    slug: 'icac-cnmv-einf-2026-esrs',
    area: 'contable',
    kind: 'criterio',
    headline: 'ICAC y CNMV: el EINF de 2026 sigue la Ley 11/2018 y recomiendan prepararlo teniendo en cuenta las ESRS',
    oneLiner:
      'El ICAC y la CNMV recuerdan que, sin transposición de la directiva europea CSRD, el **estado de información no financiera (EINF) de 2026 se rige por la Ley 11/2018**, y recomiendan prepararlo teniendo en cuenta las normas europeas **ESRS** (más de 1.000 empleados) o valorar las ESRS o el estándar voluntario europeo (menos de 1.000).',
    affects:
      'Clientes y grupos obligados a presentar el EINF conforme a la [Ley 11/2018](https://www.boe.es/buscar/act.php?id=BOE-A-2018-17989), y sus verificadores.\n\nDe forma indirecta, también los proveedores de grandes empresas que reciben peticiones de datos de sostenibilidad: según el comunicado, el estándar voluntario sirve de referencia para acotar esas peticiones en la cadena de valor.',
    action:
      '**Identifica a los clientes obligados a presentar el EINF de 2026** y cuántos empleados tiene cada uno.\n\n**Decide con cada uno el marco del informe.** Con más de 1.000 empleados: el contenido de la Ley 11/2018 más una de las alternativas ESRS que admite el Reglamento Delegado (UE) 2026/1563. Con menos: valorar las ESRS o el estándar voluntario del Reglamento Delegado (UE) 2026/1560.\n\n**Coordínalo pronto con el verificador** y comprueba también las obligaciones del [Real Decreto 214/2025](https://www.boe.es/eli/es/rd/2025/03/18/214) sobre la huella de carbono, que el comunicado recuerda.',
    example:
      'Un grupo industrial con 1.200 empleados, obligado a presentar el EINF, prepara el de 2026. Para seguir la recomendación puede elegir entre tres alternativas: ESRS «Set 1» con el *quick fix* del Reglamento Delegado 2025/1416, ESRS «Set 2», o «Set 1» con el *quick fix* y las exenciones del «Set 2». En todo caso, debe cubrir todo lo que exige la Ley 11/2018.\n\nUna sociedad obligada con 400 empleados puede valorar las ESRS o aplicar el estándar voluntario del Reglamento Delegado 2026/1560.',
    source: {
      label: 'ICAC y CNMV: «Tercer comunicado conjunto a la espera de la transposición de la Directiva CSRD y modificaciones sucesivas al ordenamiento jurídico español»',
      url: 'https://www.icac.gob.es/sites/default/files/noticias/2026-10/Comunicado%20Conjunto%20ESRS%202026%2020%2010%202026.pdf',
      publishedOn: '2026-10-20',
    },
    nuance:
      'Es una recomendación de los supervisores, no una norma: la obligación legal sigue siendo la Ley 11/2018. España no ha establecido la exención transitoria para 2025 y 2026 que permite la Directiva (UE) 2026/470 y, según el comunicado, el nuevo marco europeo (empresas con más de 1.000 empleados y 450 millones de euros de cifra de negocios) se aplicará a los ejercicios iniciados desde el 1/1/2027. Para la verificación, remite a la norma técnica del ICAC de diciembre de 2024 (no aprobada), a las directrices de COESA y a la ISSA 5000.',
    urgency: 'media',
    date: '2026-10-20',
    editorial: editorial('p-judith-calet', '2026-10-20T12:00:00+02:00'),
  },

  /* ── Aviso interno · formación en IA ───────────────────────────────── */
  {
    id: 'news-aviso-formacion-ia',
    slug: 'aviso-formacion-ia-chatgpt-claude',
    area: 'general',
    kind: 'aviso-interno',
    headline: 'Formación en IA para toda la firma: diez sesiones de ChatGPT y Claude del 2/11 al 2/12',
    oneLiner:
      'FLM organiza una formación práctica en IA de diez sesiones de dos horas para incorporar **ChatGPT** y **Claude** al trabajo diario del despacho: cinco de ChatGPT (2, 5, 9, 12 y 16 de noviembre) y cinco de Claude (23, 25, 26 y 30 de noviembre y 2 de diciembre).',
    affects: 'A toda la firma. Te interesa especialmente si todavía no usas ChatGPT o Claude en tu trabajo, o si quieres sacarles más partido.',
    action:
      '**Reserva las diez sesiones en tu agenda.** Todas son de 12:00 a 14:00, salvo la del miércoles 25 de noviembre, que será por la tarde, de 15:00 a 17:00.\n\n**Añádelas a tu calendario de una vez:** abre la entrada en la [Agenda](#/participar/agenda/formacion-ia-chatgpt-claude) y pulsa «Añadir a mi calendario (.ics)»; el archivo incluye todas las sesiones.\n\n**Organiza con tu equipo el trabajo de esas franjas** para poder asistir sin dejar a ningún cliente desatendido.',
    example:
      'Si tienes una reunión con un cliente a las 12:30 del miércoles 25 de noviembre, no se solapa con la formación, porque ese día la sesión de Claude es de 15:00 a 17:00. En cambio, una reunión a la misma hora del jueves 26 coincidiría con la tercera sesión de Claude: mejor muévela.',
    source: { label: 'FLM · Formación interna: «Formación en IA: ChatGPT y Claude» (Agenda del campus)', url: '#/participar/agenda/formacion-ia-chatgpt-claude', publishedOn: '2026-10-20' },
    urgency: 'media',
    date: '2026-10-20',
    editorial: editorial('p-laura-gil', '2026-10-20T09:00:00+02:00'),
  },

  /* ── Laboral · jurisprudencia ──────────────────────────────────────── */
  {
    id: 'news-sts-765-2026-despido-colectivo',
    slug: 'sts-765-2026-despido-colectivo-de-hecho',
    area: 'laboral',
    kind: 'jurisprudencia',
    headline: 'El Supremo suma ceses en prueba y bajas «voluntarias» para apreciar un despido colectivo de hecho',
    oneLiner:
      'El Supremo declara nulo un **despido colectivo de hecho** en una empresa de 1.185 trabajadores que, en 90 días, sumó 31 extinciones (umbral: 30) al computar, junto a despidos objetivos y disciplinarios improcedentes, **ceses en prueba sin justificar** y **bajas voluntarias ligadas a la reestructuración**.',
    affects:
      'Clientes que reorganizan, externalizan o traspasan funciones a otra empresa y van reduciendo plantilla por goteo: despidos objetivos individuales, despidos disciplinarios que luego se reconocen improcedentes, bajas incentivadas o pactadas y ceses en periodo de prueba.\n\nTambién los acuerdos de salida firmados con los comités de empresa al margen del procedimiento de despido colectivo del [art. 51 ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a51).',
    action:
      '**Lleva un contador móvil de 90 días en los clientes en reestructuración** con todas las extinciones por iniciativa de la empresa no inherentes a la persona del trabajador, incluidos los ceses en prueba sin causa acreditada y las bajas «voluntarias» o pactadas vinculadas al plan.\n\n**Si el plan proyecta reducciones que pueden superar los umbrales, valora abrir el periodo de consultas desde ese momento.** El Supremo recuerda la doctrina del TJUE (asunto C-589/22): la obligación de consultar nace cuando la empresa se plantea o proyecta la reducción, no cuando ya tiene la certeza de que despedirá.\n\n**Documenta siempre las razones reales de cada cese en periodo de prueba** y revisa qué dicen los documentos de la propia empresa: aquí, el certificado de extinciones elaborado por la empresa atribuía las bajas voluntarias al proyecto, y el Supremo las computó.',
    example:
      'Una empresa de 80 trabajadores, cuyo umbral es de 10 extinciones en 90 días ([art. 51.1.a ET](https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a51)), acumula en un trimestre 4 despidos objetivos por causas organizativas, 2 despidos disciplinarios reconocidos improcedentes, 2 ceses en prueba sin justificar y 3 bajas incentivadas por la reorganización.\n\nLas 7 extinciones que no son despidos objetivos superan el mínimo de 5 que exige el art. 51.1 ET para sumarlas: en total son 11, por encima del umbral. El riesgo es que se declare un despido colectivo de hecho nulo; en el caso del Supremo, los afectados cobran los salarios no percibidos desde el cese hasta la notificación de la sentencia y devuelven la indemnización recibida.',
    source: {
      label: 'STS (Sala de lo Social) 765/2026, de 30 de septiembre (rec. 75/2026; ECLI:ES:TS:2026:4099)',
      url: 'https://www.poderjudicial.es/search/documento/TS/11887246/despido/20261015',
      publishedOn: '2026-09-30',
    },
    nuance:
      'No toda baja voluntaria computa: solo las que tienen su origen en la iniciativa de la empresa y se producen en el contexto de la reducción de plantilla (SSTS 449/2023 y 558/2023); los ceses en prueba computan si la empresa no acredita mínimamente sus razones (STS 933/2021). Por congruencia con la demanda, la nulidad solo alcanza a los ceses producidos desde el 6/8/2025. Y los acuerdos con los comités que solo fijaban indemnizaciones no se anulan por la vía del art. 124 LRJS, sino, en su caso, por conflicto colectivo.',
    urgency: 'alta',
    date: '2026-10-15',
    editorial: editorial('p-cristina-sebastian', '2026-10-15T09:00:00+02:00'),
  },

  /* ── Contable · legislación (proyecto caducado) ────────────────────── */
  {
    id: 'news-umbrales-contables-caducados',
    slug: 'umbrales-auditoria-cuentas-abreviadas-2026',
    area: 'contable',
    kind: 'legislacion',
    headline: 'Decae la subida de umbrales: la auditoría y las cuentas abreviadas de 2026 siguen con los límites actuales',
    oneLiner:
      'Con la disolución de las Cortes caducó, el 6/10/2026, el proyecto de ley que subía los umbrales contables, así que el cierre de 2026 se hará con los **límites vigentes**: hasta 4 millones de euros de activo y 8 millones de cifra de negocios para el balance abreviado, y hasta **2,85 y 5,7 millones** para no tener que auditar.',
    affects:
      'Sociedades cercanas a los límites, sobre todo con un activo de entre 2,85 y 7,5 millones de euros o una cifra de negocios de entre 5,7 y 15 millones: son las que podían cambiar de régimen con el proyecto.\n\nAfecta a tres decisiones del cierre: si hay que auditar, si las cuentas pueden ser abreviadas y si se puede aplicar el PGC de Pymes.',
    action:
      '**Revisa los cierres de 2025 y las previsiones de 2026.** Cada régimen tiene tres límites (activo, cifra de negocios y plantilla media): para acogerse a él, la sociedad no debe superar al menos dos durante dos ejercicios consecutivos, y lo pierde si los supera dos ejercicios seguidos.\n\n**Si un cliente queda obligado a auditar 2026, la junta debe nombrar auditor antes de que termine ese ejercicio**, es decir, antes del 31/12/2026 si coincide con el año natural ([art. 264.1 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a264)). Si no lo hace, los administradores o cualquier socio pueden pedir al registrador mercantil que lo designe ([art. 265.1 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a265)).\n\n**Avisa a los clientes que contaban con la subida** y sigue la nueva legislatura: las Cortes se constituyen el 23/12/2026. Para repasar límites y plazos, tienes la formación [Cuentas anuales: formular, aprobar y depositar a tiempo](#/aprender/mercantil/cuentas-anuales-plazos).',
    example:
      'Una SL cierra 2025 y 2026 con 3,4 millones de euros de activo, 6,5 millones de cifra de negocios y 30 trabajadores de media.\n\nCon los límites vigentes supera dos de los tres de auditoría (2,85 y 5,7 millones) en ambos ejercicios, así que **debe auditar las cuentas de 2026**. En cambio, puede seguir formulando balance abreviado, porque no supera los 4 y 8 millones. Si el proyecto caducado se hubiera aprobado y aplicado ya a 2026, no habría tenido que auditar.',
    source: {
      label: 'Congreso de los Diputados: Proyecto de Ley por la que se modifican los criterios de tamaño de las empresas a efectos de información financiera (121/000075), «Concluido - (Caducado)»',
      url: 'https://www.congreso.es/es/busqueda-de-iniciativas?p_p_id=iniciativas&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_iniciativas_mode=mostrarDetalle&_iniciativas_legislatura=XV&_iniciativas_id=121%2F000075',
      publishedOn: '2026-10-06',
    },
    nuance:
      'El proyecto elevaba los límites del balance abreviado a 7,5 y 15 millones de euros y los de la exención de auditoría a 3,565 y 7,125 millones ([BOCG, Congreso, serie A, núm. 75-1](https://www.congreso.es/public_oficiales/L15/CONG/BOCG/A/BOCG-15-A-75-1.PDF)), y caducó con la disolución de las Cortes ([RD 806/2026](https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20742)). Hay otras causas de auditoría obligatoria, como la petición de la minoría ([art. 265.2 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a265)) o determinadas subvenciones. España es el único Estado miembro que no ha comunicado la transposición de la Directiva Delegada (UE) 2023/2775 y tiene abierto un procedimiento de infracción ([Comisión Europea](https://finance.ec.europa.eu/regulation-and-supervision/financial-services-legislation/enforcement-and-infringements-banking-and-finance-law/monitoring-banking-and-finance-directives/delegated-directive-20232775-amending-accounting-directive_en)); aun así, no conviene aplicar directamente la Directiva ante el Registro Mercantil, porque muchas de sus ventajas son opciones de cada Estado (criterio propio, sin pronunciamiento oficial).',
    urgency: 'alta',
    date: '2026-10-06',
    editorial: editorial('p-judith-calet', '2026-10-06T09:00:00+02:00'),
  },

  /* ── Fiscal · criterio administrativo ──────────────────────────────── */
  {
    id: 'news-verifactu-aplazamiento-anunciado',
    slug: 'verifactu-aplazamiento-anunciado-plazos-vigentes',
    area: 'fiscal',
    kind: 'criterio',
    headline: 'Verifactu: Hacienda anuncia el aplazamiento a octubre de 2028, pero siguen vigentes las fechas de 2027',
    oneLiner:
      'Hacienda anunció el 5/10/2026 que **prevé aplazar Verifactu hasta octubre de 2028**, pero mientras no se publique la norma rigen las fechas actuales: **antes del 1/1/2027** para los contribuyentes del Impuesto sobre Sociedades y **antes del 1/7/2027** para el resto de obligados.',
    affects:
      'Todos los clientes que facturan con un programa informático. Primero, las sociedades y demás contribuyentes del Impuesto sobre Sociedades; después, autónomos, entidades en atribución de rentas y no residentes con establecimiento permanente.\n\nQuedan fuera, entre otros, quienes llevan los libros registro del IVA por el SII ([art. 3.3 del reglamento](https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a3)). Revisa en especial los encargos de implantación de software, los programas a medida y los comercios y restaurantes con TPV.',
    action:
      '**No pares las adaptaciones.** Mientras no se publique la norma, el 1/1/2027 es una fecha legal vigente para las sociedades.\n\n**Pide a los proveedores la declaración responsable de cada programa** y confirma que podrán cumplir antes del 1/1/2027.\n\n**Avisa a los clientes con un mensaje claro: «anunciado, no aprobado».** Revisa cada semana el BOE y la sede de la AEAT y, si llega el aplazamiento, replanifica sin desmontar lo hecho: según la nota, las exigencias de integridad, conservación, accesibilidad, legibilidad, trazabilidad e inalterabilidad se mantendrán en términos «sustancialmente equivalentes».\n\nPara repasar quién está obligado y qué pedir al proveedor, tienes la formación [Verifactu](#/aprender/fiscal/verifactu).',
    example:
      'Una SL con ejercicio natural factura con un programa de gestión estándar. Si el 31/12/2026 aún no se ha publicado el aplazamiento, desde el 1/1/2027 su programa debe cumplir el reglamento; si se publica antes, tendrá margen hasta octubre de 2028, según lo anunciado.\n\nUna autónoma en estimación directa, con la norma vigente, debe tener su sistema adaptado antes del 1/7/2027.',
    source: {
      label: 'Ministerio de Hacienda: nota informativa de 5 de octubre de 2026 sobre la previsión de modificar los plazos del Reglamento de sistemas informáticos de facturación (RD 1007/2023)',
      url: 'https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf',
      publishedOn: '2026-10-05',
    },
    nuance:
      'Hacienda quiere hacer coincidir Verifactu con la factura electrónica obligatoria de quienes facturan hasta 8 millones de euros, pero la nota no dice con qué instrumento se aprobará el cambio. En principio basta un real decreto del Gobierno, sin pasar por las Cortes, porque el RDL 15/2025, que fijó las fechas de 2027, mantuvo el rango reglamentario del RD 1007/2023 ([disposición final segunda](https://www.boe.es/buscar/doc.php?id=BOE-A-2025-24446)). A 29/10/2026, el texto consolidado del RD 1007/2023 (último BOE consultado, el de 28/10/2026) no recoge cambios posteriores al 3/12/2025, y la AEAT mantiene las fechas de 2027 en su [nota informativa](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/nota-informativa-ampliacion-plazo-adaptacion-facturacion.html), actualizada el 13/10/2026.',
    urgency: 'alta',
    date: '2026-10-05',
    editorial: editorial('p-lluis-gomez', '2026-10-05T12:00:00+02:00', '2026-10-29'),
  },

  /* ── Fiscal · legislación ──────────────────────────────────────────── */
  {
    id: 'news-factura-electronica-b2b-calendario',
    slug: 'factura-electronica-b2b-calendario',
    area: 'fiscal',
    kind: 'legislacion',
    headline: 'Factura electrónica entre empresas: obligatoria el 6/10/2027 si se superan 8 M€ y el 6/10/2028 el resto',
    oneLiner:
      'Con la entrada en vigor de la **Orden HAC/1028/2026** el 6/10/2026 arranca el calendario de la factura electrónica obligatoria entre empresarios y profesionales: **6/10/2027** si el volumen de operaciones supera 8 millones de euros y **6/10/2028** para el resto.',
    affects:
      'Todos los clientes empresarios y profesionales que facturan a otras empresas o profesionales, y también **FLM como emisora de facturas**.\n\nDesde el 6/10/2027, quienes superaron 8 millones de euros de volumen de operaciones en el «año natural inmediato anterior» ([disposición final cuarta del RD 238/2026](https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295)) deben expedir, enviar y recibir facturas electrónicas e informar de su estado. Desde el 6/10/2028, el resto. Las personas jurídicas de hasta 8 millones también informan del estado de sus facturas desde esa fecha; las personas físicas y entidades en atribución de rentas, desde el 6/10/2029 ([calendario de la AEAT](https://sede.agenciatributaria.gob.es/Sede/todas-noticias/2026/octubre/7/solucion-publica-facturacion-electronica.html)).',
    action:
      '**Clasifica la cartera por fases.** Calcula el volumen de operaciones de cada cliente ([art. 121 de la Ley del IVA](https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740#a121)) y marca a quienes superan 8 millones de euros.\n\n**Pide a cada proveedor de software su plan** para emitir y recibir facturas electrónicas, conectarse a la solución pública de la AEAT o a plataformas privadas e informar del estado de las facturas, incluido el pago.\n\n**Avisa a los clientes de más de 8 millones** de que, durante los 12 primeros meses, deberán acompañar cada factura de un PDF legible, salvo que el destinatario acepte expresamente el formato original (disposición transitoria segunda del RD 238/2026).\n\n**Incluye el tema en las reuniones de cierre de 2026** y apóyate en la [nota informativa del Área Fiscal](#/consultar/notas/doc-facturacion-b2b).',
    example:
      'Una distribuidora de Granollers con un volumen de operaciones de unos 12 millones de euros al año deberá emitir y recibir en formato electrónico estructurado todas sus facturas a empresas, e informar de su estado, **desde el 6/10/2027**; durante el primer año enviará, además, un PDF con cada factura.\n\nUn taller de Vic que factura 600.000 € al año a otras empresas tendrá la obligación **desde el 6/10/2028**.',
    source: {
      label: 'Orden HAC/1028/2026, de 2 de octubre, por la que se regula la solución pública de facturación electrónica (BOE núm. 247)',
      url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20587',
      publishedOn: '2026-10-05',
      effectiveOn: '2026-10-06',
    },
    nuance:
      'La norma no concreta a qué año se refiere el «año natural inmediato anterior» en la primera fase: confírmalo con los criterios que publique la AEAT antes de dar una fecha a un cliente cercano a los 8 millones. La solución pública de la AEAT será gratuita y debe estar disponible al menos dos meses antes de la primera aplicación efectiva. Y no la confundas con Verifactu: la factura electrónica regula el formato, el intercambio entre empresas y el estado de pago; Verifactu, los requisitos del software y de los registros de facturación.',
    urgency: 'media',
    date: '2026-10-05',
    editorial: editorial('p-angel-ceniceros', '2026-10-05T09:00:00+02:00'),
  },

  /* ── Mercantil · jurisprudencia ────────────────────────────────────── */
  {
    id: 'news-sts-1477-2026-art-367-lsc',
    slug: 'sts-1477-2026-art-367-lsc-deudas-previas',
    area: 'mercantil',
    kind: 'jurisprudencia',
    headline: 'Art. 367 LSC: remover tarde la causa de disolución no libera a los administradores de las deudas previas',
    oneLiner:
      'El Tribunal Supremo recuerda que, para la responsabilidad solidaria de los administradores del art. 367 LSC, importa **cuándo nace la deuda** y no cuándo la conocen, y que **remover tarde la causa de disolución solo les libera de las deudas posteriores**, no de las nacidas mientras la sociedad estaba en causa de disolución.',
    affects:
      'Sociedades con pérdidas que dejan el patrimonio neto por debajo de la mitad del capital social ([art. 363.1.e LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a363)), sociedades con patrimonio neto negativo o inactivas con deudas, y sus administradores.\n\nTambién los cierres contables de 2026 que preparamos para estos clientes.',
    action:
      '**Calcula el patrimonio neto a efectos del art. 363.1.e) LSC en cada cierre**, y cada trimestre en las sociedades con pérdidas, y avisa por escrito al órgano de administración.\n\n**Desde que la causa se conoce, o debía conocerse, hay dos meses** para convocar la junta que acuerde la disolución o las medidas que remuevan la causa (como una ampliación o reducción de capital o aportaciones de los socios), o para comunicar negociaciones con los acreedores o pedir el concurso ([art. 367 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a367)).\n\n**Identifica las deudas nacidas mientras la sociedad estaba en causa de disolución:** siguen siendo un riesgo para los administradores aunque después se sanee.\n\n**Evita los saneamientos solo contables, sin soporte real.** Para el cálculo, tienes la formación [Pérdidas y causa de disolución](#/aprender/mercantil/perdidas-causa-de-disolucion).',
    example:
      'Una SL está en causa de disolución por pérdidas desde el cierre de 2024; los administradores lo saben y no convocan la junta en los dos meses siguientes. En mayo de 2025 la sociedad encarga una obra de 30.000 € que no paga, y en 2026 los socios aportan fondos y la causa desaparece.\n\nLos administradores **siguen respondiendo solidariamente de esos 30.000 €**, porque la deuda nació mientras la sociedad estaba en causa de disolución. De las deudas posteriores al saneamiento ya no responden por esta vía.',
    source: {
      label: 'STS (Sala de lo Civil) 1477/2026, de 22 de septiembre (rec. 1916/2022; ECLI:ES:TS:2026:3838)',
      url: 'https://www.poderjudicial.es/search/documento/TS/11871148/administradores/20261001',
      publishedOn: '2026-09-22',
    },
    nuance:
      'Lo decisivo es que los administradores conocieran, o debieran conocer, la causa de disolución; da igual que conocieran la deuda (en el caso, 42.000 € de IVA cobrados indebidamente). La causa se removió reclasificando un saldo de 250.000 € de la cuenta 555 «Cuenta corriente con socios» a la 118 «Aportaciones de socios»: el juzgado lo vio como un intento de «maquillar los resultados» y el Supremo no necesitó valorarlo, porque llegó tarde. Por su parte, la STS 1439/2026, de 17 de septiembre, precisa que la presunción de que las deudas son posteriores a la causa ([art. 367.2 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a367)) no se aplica si otras pruebas, incluso indiciarias, acreditan que la causa no era anterior a la deuda.',
    urgency: 'alta',
    date: '2026-10-01',
    editorial: editorial('p-joan-navarro', '2026-10-01T09:00:00+02:00'),
  },

  /* ── Laboral · legislación ─────────────────────────────────────────── */
  {
    id: 'news-rd-643-2026-bajas-codigo-ocupacion',
    slug: 'rd-643-2026-bajas-codigo-ocupacion',
    area: 'laboral',
    kind: 'legislacion',
    headline: 'Seguridad Social: bajas en 6 días y código de ocupación de toda la plantilla en seis meses',
    oneLiner:
      'El **Real Decreto 643/2026**, en vigor desde el 1/8/2026, amplía de 3 a **6 días naturales** el plazo para comunicar a la TGSS bajas y variaciones de datos, obliga a comunicar en seis meses el **código de ocupación** de cada trabajador en alta y cambia el régimen de aplazamiento de deudas con la Seguridad Social.',
    affects:
      'Todos los clientes empleadores, sobre todo aquellos cuya nómina gestionamos, y el propio equipo laboral de FLM, que debe ajustar sus procedimientos y plazos.\n\nTambién los clientes con deudas con la Seguridad Social que tengan pedido, o vayan a pedir, un aplazamiento.',
    action:
      '**Prepara el censo de códigos de ocupación por cliente y trabajador** con la Clasificación Nacional de Ocupaciones vigente y crúzalo con lo que ya consta en la TGSS: solo hay que comunicar los que falten.\n\n**Programa la comunicación por el Sistema RED y termínala en enero de 2027.** El plazo es de seis meses desde el 1/8/2026; según nuestro cálculo, vence el 1/2/2027.\n\n**Actualiza los protocolos internos con el plazo de 6 días naturales** para bajas y variaciones, aunque lo prudente es seguir comunicándolas cuanto antes.\n\n**Revisa los aplazamientos en curso:** no se exige garantía si la deuda aplazable no supera 150.000 €, o si es inferior a 250.000 € y se ingresa al menos un tercio en los 10 días siguientes a la notificación de la concesión y el resto en los dos años siguientes.',
    example:
      'Un cliente con 40 trabajadores tiene un empleado que cesa el 10/11/2026: la baja puede comunicarse hasta el 16/11/2026, dentro de los seis días naturales siguientes al cese.\n\nAdemás, el código de ocupación de sus 40 trabajadores debe constar en la TGSS antes de que venza el plazo de seis meses.',
    source: {
      label: 'Real Decreto 643/2026, de 29 de julio, que modifica los reglamentos de afiliación (RD 84/1996) y de recaudación (RD 1415/2004) de la Seguridad Social (BOE núm. 185)',
      url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-16557',
      publishedOn: '2026-07-30',
      effectiveOn: '2026-08-01',
    },
    nuance:
      'El real decreto no fija una consecuencia específica por no comunicar el código de ocupación: el dato servirá para los informes sobre coeficientes reductores de la edad de jubilación en ocupaciones excepcionalmente penosas, tóxicas, peligrosas o insalubres. Las fechas del 1/2/2027 y del ejemplo (16/11/2026) son cálculos nuestros sobre los plazos de la norma. Antes de aplicar las nuevas reglas de aplazamiento a un expediente, relee los arts. 32 a 35 del Reglamento General de Recaudación en su texto consolidado.',
    urgency: 'alta',
    date: '2026-07-30',
    editorial: editorial('p-cristina-sebastian', '2026-07-30T09:00:00+02:00'),
  },

  /* ── Mercantil · jurisprudencia ────────────────────────────────────── */
  {
    id: 'news-sts-989-2026-junta-universal',
    slug: 'sts-989-2026-junta-universal-sin-acta',
    area: 'mercantil',
    kind: 'jurisprudencia',
    headline: 'Junta universal sin acta: es la sociedad la que debe probar que asistieron todos los socios',
    oneLiner:
      'Según el Supremo, si una sociedad alega una **junta universal** sin **acta**, es ella quien debe probar que estuvo presente o representado todo el capital y que todos aceptaron la reunión y el orden del día; y la impugnación de una falsa junta universal **no caduca al año**, por ser contraria al orden público.',
    affects:
      'Sociedades familiares y pymes clientes que formalizan «juntas universales» por certificación, sin reunión real o sin la firma de todos los socios, sobre todo si hay minoritarios o conflicto entre socios.\n\nTambién nuestro propio procedimiento para redactar actas y certificaciones y elevar acuerdos a público.',
    action:
      '**Revisa la plantilla de acta de junta universal.** Debe recoger la lista de asistentes firmada por todos los socios o sus representantes, con los poderes, y la aceptación unánime de la reunión y del orden del día ([art. 178 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a178)). Levanta siempre acta ([art. 202 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a202) y [art. 97 RRM](https://www.boe.es/eli/es/rd/1996/07/19/1784/con)) y guárdala en el libro de actas.\n\n**Si hay conflicto entre socios, convoca formalmente la junta** en lugar de usar la vía universal.\n\n**Repasa los acuerdos relevantes de los últimos años** adoptados en «juntas universales» sin acta firmada, como nombramientos o ceses de administradores, y valora su riesgo.',
    example:
      'Una SL tiene tres socios, con el 60 %, el 36 % y el 4 % del capital. El administrador y el socio mayoritario elevan a público el nombramiento de un nuevo administrador, acordado «en junta universal» sin acta firmada por todos.\n\nAño y medio después, el socio del 4 % impugna alegando que no estuvo. La acción no ha caducado y él no tiene que probar su ausencia: es la sociedad la que debe acreditar que asistieron todos. Si no lo consigue, los acuerdos son nulos.',
    source: {
      label: 'STS (Sala de lo Civil) 989/2026, de 23 de junio (rec. 5079/2023; ECLI:ES:TS:2026:2710)',
      url: 'https://www.poderjudicial.es/search/documento/TS/11778617/acuerdos%20sociales/20260702',
      publishedOn: '2026-06-23',
    },
    nuance:
      'La escritura notarial prueba que se compareció ante notario con una certificación, no que su contenido sea cierto, y la inscripción en el Registro Mercantil tampoco lo subsana. Si la sociedad aporta un acta firmada por los asistentes, la carga se invierte: el impugnante debe probar su falsedad. Tardar en impugnar no es un «acto propio» del socio: en el caso, la junta era de 7/7/2014, la demanda de 1/9/2015 y la acción no había caducado ([art. 205.1 LSC](https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a205)).',
    urgency: 'media',
    date: '2026-07-02',
    editorial: editorial('p-joan-navarro', '2026-07-02T09:00:00+02:00'),
  },
];

import type { Reading } from '@flm/shared';

/**
 * Lecturas recomendadas: tres por área, a partir de research/60-lecturas.verificado.md.
 * Datos comprobados el 29/10/2026 en la ficha del editor o del organismo (`url`) y, en los
 * códigos del BOE, los manuales de la AEAT y las Lecciones, también en los créditos del PDF
 * oficial o de la muestra del editor. Textos sin formato: la ficha los muestra tal cual.
 * Mantenimiento: sustituir el Memento Fiscal y el Social cuando salgan sus ediciones 2027, el
 * Manual de Sociedades cuando la AEAT publique el de 2026 y la Guía Laboral cuando haya web 2026.
 */
export const readings: Reading[] = [
  /* ── Fiscal ─────────────────────────────────────────────────────────── */
  {
    id: 'lec-fis-01-memento-fiscal',
    area: 'fiscal',
    title: 'Memento Fiscal 2026',
    authors: 'Lefebvre (obra colectiva)',
    edition: 'Edición 2026',
    publisher: 'Lefebvre',
    isbn: '979-13-87732-86-8',
    summary:
      'Obra de consulta en un único volumen que recorre el sistema tributario español en seis partes: impuestos directos e indirectos, impuestos no estatales y tributos sobre el juego, procedimiento, obligaciones formales y, por último, entidades sin fines lucrativos y mecenazgo. Explica cada cuestión en números marginales, con ejemplos y, según la editorial, más de 24.700 citas de normativa, jurisprudencia y doctrina administrativa.',
    practicalValue:
      'Te lleva en pocos minutos al criterio aplicable en IRPF, Sociedades, IVA, Transmisiones Patrimoniales o impuestos locales, y a la norma o resolución que lo respalda. Se publicó el 11 de marzo de 2026: antes de aplicar un marginal, comprueba en el BOE si la norma ha cambiado después. La suscripción permite consultar qué marginales se han modificado.',
    audience: 'Todo el Área Fiscal, de júnior a sénior.',
    format: 'Libro en papel, acceso online con 12 meses de suscripción o ambos (de pago)',
    url: 'https://lefebvre.es/tienda/catalogo/derecho-tributario/memento-fiscal',
    verifiedAt: '2026-10-29',
  },
  {
    id: 'lec-fis-02-manual-sociedades',
    area: 'fiscal',
    title: 'Manual práctico de Sociedades 2025',
    authors: 'Departamento de Gestión Tributaria',
    edition: 'Ejercicio 2025',
    publisher: 'Agencia Estatal de Administración Tributaria (AEAT)',
    summary:
      'Manual oficial del Impuesto sobre Sociedades del ejercicio 2025, que incluye también el Impuesto sobre la Renta de no Residentes de los establecimientos permanentes y de las entidades en atribución de rentas constituidas en el extranjero con presencia en España. Una primera parte explica las novedades y las cuestiones generales del impuesto, y la segunda recorre página a página los modelos de declaración, con anexos de los modelos 200 y 202 y un apéndice normativo.',
    practicalValue:
      'Es la guía de la propia Agencia Tributaria para preparar y revisar el modelo 200: base imponible y cuota, consolidación fiscal, operaciones vinculadas, regímenes especiales y pagos fraccionados. A un perfil júnior le enseña el cierre fiscal paso a paso, y a uno sénior le sirve de lista de comprobación antes de presentar.',
    audience: 'Todo el Área Fiscal, de júnior a sénior, y el Área Contable durante el cierre.',
    format: 'Manual oficial gratuito en HTML, con PDF completo descargable',
    url: 'https://sede.agenciatributaria.gob.es/Sede/Ayuda/25Manual/200.shtml',
    verifiedAt: '2026-10-29',
  },
  {
    id: 'lec-fis-03-manual-iva',
    area: 'fiscal',
    title: 'Manual práctico IVA 2026',
    authors: 'Departamento de Gestión Tributaria',
    edition: 'Edición 2026, actualizada a 30 de septiembre de 2026',
    publisher: 'Agencia Estatal de Administración Tributaria (AEAT)',
    summary:
      'Manual oficial del IVA para 2026 que empieza por las novedades del año y explica, con numerosos ejemplos, el hecho imponible y las exenciones, los sujetos pasivos, el devengo, la base y los tipos, las deducciones y devoluciones y los regímenes especiales, incluido el simplificado de las pymes. Termina con la gestión del impuesto, las declaraciones informativas (modelos 390, 349 y 379) y las obligaciones de facturación y libros registro.',
    practicalValue:
      'Es un material gratuito muy completo para formar a perfiles júnior en la autoliquidación (modelo 303), el resumen anual (390), las operaciones intracomunitarias (349) y la facturación, y su capítulo de novedades sirve de guion para una sesión interna. Está actualizado a 30 de septiembre de 2026: comprueba en el BOE los cambios posteriores antes de aplicarlo.',
    audience: 'Perfiles júnior del Área Fiscal como lectura formativa; todo el equipo, como consulta.',
    format: 'Manual oficial gratuito en HTML, con PDF completo descargable',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/26manual/IVA.html',
    verifiedAt: '2026-10-29',
  },

  /* ── Laboral ────────────────────────────────────────────────────────── */
  {
    id: 'lec-lab-01-memento-social',
    area: 'laboral',
    title: 'Memento Social 2026',
    authors: 'Lefebvre (obra colectiva)',
    edition: 'Edición 2026',
    publisher: 'Lefebvre',
    isbn: '979-13-87732-88-2',
    summary:
      'Obra de consulta en un único volumen sobre Derecho del Trabajo y de la Seguridad Social, ordenada por voces (de la contratación y el tiempo de trabajo al despido, la incapacidad temporal o la jubilación) y por números marginales. Incorpora las reformas del último año y, según la editorial, más de 37.500 citas de jurisprudencia y doctrina.',
    practicalValue:
      'Resuelve las dudas diarias de contratación, jornada, permisos, extinción, cotización y prestaciones, y ayuda a fundamentar con jurisprudencia los informes y las cartas al cliente. Se publicó el 11 de marzo de 2026: contrasta las reformas posteriores con el Código Laboral y de la Seguridad Social del BOE, que tienes en esta misma estantería.',
    audience: 'Todo el Área Laboral, de júnior a sénior.',
    format: 'Libro en papel, acceso online con 12 meses de suscripción o ambos (de pago)',
    url: 'https://lefebvre.es/tienda/catalogo/derecho-laboral/memento-social',
    verifiedAt: '2026-10-29',
  },
  {
    id: 'lec-lab-02-codigo-laboral-boe',
    area: 'laboral',
    title: 'Código Laboral y de la Seguridad Social',
    authors: 'José María de Ancos Benavente (selección y ordenación)',
    edition: 'Edición electrónica actualizada a 21 de octubre de 2026',
    publisher: 'Agencia Estatal Boletín Oficial del Estado (BOE)',
    isbn: '978-84-340-2135-8',
    summary:
      'Recopilación oficial y gratuita de la normativa laboral y de Seguridad Social consolidada: Estatuto de los Trabajadores, Ley General de la Seguridad Social, Ley de Empleo, prevención de riesgos laborales, infracciones y sanciones, jurisdicción social, trabajo autónomo y reglamentos de cotización, recaudación y afiliación. El BOE la actualiza cuando cambia alguna de sus normas y ya incluye disposiciones recientes, como el salario mínimo de 2026 o la regulación de la jubilación flexible.',
    practicalValue:
      'Es la fuente normativa de cabecera del área: te permite citar el texto vigente en cartas de despido, informes y escritos, y comprobar si un artículo ha cambiado después de la edición del Memento o de la Guía Laboral. Se descarga gratis y, con una cuenta de Mi BOE, recibes un aviso cada vez que se actualiza.',
    audience: 'Todo el Área Laboral.',
    format: 'Código electrónico gratuito en PDF y ePUB; papel bajo demanda en tres tomos (de pago)',
    url: 'https://www.boe.es/biblioteca_juridica/codigos/codigo.php?id=093_Codigo_Laboral_y_de_la_Seguridad_Social_&tipo=C&modo=2',
    verifiedAt: '2026-10-29',
  },
  {
    id: 'lec-lab-03-guia-laboral',
    area: 'laboral',
    title: 'Guía Laboral 2026',
    authors: 'Ministerio de Trabajo y Economía Social y Ministerio de Inclusión, Seguridad Social y Migraciones',
    edition: 'Edición 2026 en papel, actualizada a 12 de mayo de 2026',
    publisher: 'Centro de Publicaciones del Ministerio de Trabajo y Economía Social',
    summary:
      'Guía oficial de información al ciudadano que repasa la contratación y las condiciones de trabajo, el salario, la negociación colectiva, el trabajo autónomo, la Seguridad Social y sus prestaciones, el desempleo y la extranjería, entre otras materias. La edición 2026 recoge la normativa aprobada entre el 5 de mayo de 2025 y el 12 de mayo de 2026, como la ampliación del permiso de nacimiento y cuidado, el nuevo régimen del contrato formativo o el salario mínimo de 2026.',
    practicalValue:
      'Sirve para la acogida de perfiles júnior y no juristas, y para responder consultas básicas de clientes con un texto oficial. Ten en cuenta que la web y el PDF gratuitos todavía son la edición 2025: hasta que el Ministerio publique la versión electrónica de 2026, comprueba cada dato en el Código Laboral y de la Seguridad Social del BOE.',
    audience: 'Perfiles júnior del Área Laboral y personal no jurista que atiende consultas laborales.',
    format: 'Libro en papel (de pago); la web y el PDF gratuitos ofrecen, por ahora, la edición 2025',
    url: 'https://www.mites.gob.es/es/Guia/',
    verifiedAt: '2026-10-29',
  },

  /* ── Mercantil ──────────────────────────────────────────────────────── */
  {
    id: 'lec-mer-01-memento-sociedades',
    area: 'mercantil',
    title: 'Memento Sociedades Mercantiles 2027',
    authors: 'Lefebvre (obra colectiva)',
    edition: 'Edición 2027',
    publisher: 'Lefebvre',
    isbn: '979-13-87925-96-3',
    summary:
      'Obra práctica que recorre toda la vida de una sociedad mercantil, desde la constitución hasta las modificaciones estructurales, la disolución, la liquidación y la extinción. Trata cada sociedad de capital, los acuerdos sociales y su impugnación, las cuentas anuales, el Registro Mercantil, los pactos parasociales, otras formas sociales y los grupos, con doctrina registral, jurisprudencia y ejemplos.',
    practicalValue:
      'Es la consulta de referencia del área para preparar juntas y acuerdos, modificaciones de estatutos y operaciones estructurales, y para resolver su inscripción. Se publicó el 13 de octubre de 2026, así que es la edición más actual para la secretaría societaria del próximo cierre: formulación, aprobación y depósito de cuentas.',
    audience: 'Área Mercantil, sobre todo perfiles sénior; útil como consulta para todo el equipo.',
    format: 'Libro en papel, acceso online con 12 meses de suscripción o ambos (de pago)',
    url: 'https://lefebvre.es/tienda/catalogo/derecho-mercantil/memento-sociedades-mercantiles',
    verifiedAt: '2026-10-29',
  },
  {
    id: 'lec-mer-02-codigo-sociedades-boe',
    area: 'mercantil',
    title: 'Código de Derecho de Sociedades',
    authors:
      'Alfonso Martínez-Echevarría y García de Dueñas, Francisco José Martínez Segovia y Patricia Santos Rodríguez (selección y ordenación)',
    edition: 'Edición electrónica actualizada a 8 de octubre de 2026',
    publisher: 'BOE y Universidad CEU San Pablo (coedición)',
    isbn: '978-84-340-2242-3',
    summary:
      'Recopilación oficial y gratuita de la normativa societaria consolidada, con la Ley de Sociedades de Capital, el régimen de modificaciones estructurales, el Código de Comercio y el Código Civil en lo pertinente y la parte aplicable del Reglamento del Registro Mercantil. Reúne también las leyes de cooperativas, sociedades laborales y participadas, sociedades profesionales, AIE y SOCIMI, además de otras entidades especiales, como las sociedades de garantía recíproca o las de capital riesgo.',
    practicalValue:
      'Te asegura trabajar con el texto vigente de la Ley de Sociedades de Capital y del Reglamento del Registro Mercantil al redactar estatutos, actas y certificaciones. Se descarga gratis en PDF o ePUB y, con una cuenta de Mi BOE, recibes un aviso cada vez que se actualiza.',
    audience: 'Todo el Área Mercantil y quien redacte documentación societaria.',
    format: 'Código electrónico gratuito en PDF y ePUB; papel bajo demanda en dos tomos (de pago)',
    url: 'https://www.boe.es/biblioteca_juridica/codigos/codigo.php?id=106_Codigo_de_Derecho_de_Sociedades&tipo=C&modo=2',
    verifiedAt: '2026-10-29',
  },
  {
    id: 'lec-mer-03-lecciones-mercantil',
    area: 'mercantil',
    title: 'Lecciones de Derecho Mercantil (volúmenes I y II)',
    authors: 'Aurelio Menéndez y Ángel Rojo (directores)',
    edition: '24.ª edición (2026)',
    publisher: 'Aranzadi La Ley',
    isbn: 'Vol. I: 978-84-1085-785-8 · Vol. II: 978-84-1085-787-2',
    summary:
      'Manual universitario, reeditado cada año desde 2003, en el que un amplio equipo de autores expone de forma sistemática el Derecho mercantil español. El volumen I trata el empresario, la contabilidad, el Registro Mercantil, la propiedad industrial, la competencia y el derecho de sociedades; el volumen II, la contratación mercantil, el derecho de los valores, el derecho concursal y preconcursal y la navegación.',
    practicalValue:
      'Da la base conceptual que necesitan los perfiles júnior del área y quienes, desde Fiscal o Contable, quieren entender bien las figuras societarias, contractuales y concursales antes de pasar a una obra práctica como el Memento. Empieza por el volumen I, que cubre el empresario y el derecho de sociedades.',
    audience: 'Perfiles júnior del Área Mercantil y profesionales de otras áreas que necesitan una base de Derecho mercantil.',
    format: 'Libro en papel en dos volúmenes, colección Manuales (de pago)',
    url: 'https://www.aranzadilaley.es/tienda/lecciones-de-derecho-mercantil-volumen-i',
    verifiedAt: '2026-10-29',
  },

  /* ── Contable ───────────────────────────────────────────────────────── */
  {
    id: 'lec-con-01-codigo-contabilidad-boe',
    area: 'contable',
    title: 'Código de Contabilidad Financiera y Sociedades',
    authors: 'Instituto de Contabilidad y Auditoría de Cuentas (ICAC)',
    edition: 'Edición electrónica actualizada a 10 de enero de 2025',
    publisher: 'BOE e ICAC (coedición)',
    isbn: '978-84-340-2212-6',
    summary:
      'Recopilación oficial y gratuita, seleccionada por el ICAC, de la normativa contable mercantil: Código de Comercio en lo pertinente, Plan General de Contabilidad, PGC de pymes con sus reformas de 2016 y 2021, Ley de Sociedades de Capital y normas para formular cuentas consolidadas. Añade nueve resoluciones del ICAC, entre ellas las de inmovilizado, deterioro, impuesto sobre beneficios, instrumentos financieros y reconocimiento de ingresos.',
    practicalValue:
      'Es el texto que todo el equipo contable debe dominar: marco conceptual, normas de registro y valoración, modelos de cuentas anuales y cuadro de cuentas, con las resoluciones que desarrollan los asientos más habituales. Su última modificación es de enero de 2025, pero el BOE indica que todas sus normas están actualizadas. No incluye las consultas del ICAC: compleméntalo con el BOICAC, como el n.º 147, publicado el 22 de octubre de 2026.',
    audience: 'Todo el Área Contable; imprescindible para los perfiles júnior.',
    format: 'Código electrónico gratuito en PDF y ePUB; papel bajo demanda en dos tomos (de pago)',
    url: 'https://www.boe.es/biblioteca_juridica/codigos/codigo.php?id=089_Codigo_de_Contabilidad_Financiera_y_Sociedades&tipo=C&modo=2',
    verifiedAt: '2026-10-29',
  },
  {
    id: 'lec-con-02-memento-contable',
    area: 'contable',
    title: 'Memento Contable 2027',
    authors: 'Lefebvre (obra colectiva)',
    edition: 'Edición 2027',
    publisher: 'Lefebvre',
    isbn: '979-13-87925-95-6',
    summary:
      'Obra de consulta que analiza la normativa contable vigente (PGC, PGC de pymes y criterios para microempresas) y la conecta con la auditoría, la fiscalidad, la valoración de empresas, la consolidación, las NIIF y el régimen de infracciones y sanciones. Se apoya en comentarios de especialistas, consultas del ICAC, doctrina administrativa, jurisprudencia y muchos ejemplos resueltos.',
    practicalValue:
      'Resuelve con rapidez cómo contabilizar una operación y qué efecto fiscal tiene, lo que encaja con el trabajo conjunto de Contable y Fiscal en el cierre y en el modelo 200. Es la edición más reciente, publicada el 13 de octubre de 2026; las consultas del ICAC posteriores, como las del BOICAC n.º 147, revísalas aparte.',
    audience: 'Todo el Área Contable, de júnior a sénior, sobre todo durante el cierre.',
    format: 'Libro en papel, acceso online con 12 meses de suscripción o ambos (de pago)',
    url: 'https://lefebvre.es/tienda/catalogo/derecho-contable/memento-contable',
    verifiedAt: '2026-10-29',
  },
  {
    id: 'lec-con-03-pgc-kpmg',
    area: 'contable',
    title: 'Plan General de Contabilidad: comentarios y desarrollos prácticos',
    authors: 'KPMG',
    edition: '6.ª edición (2025)',
    publisher: 'KPMG y Aranzadi La Ley',
    isbn: '978-84-1078-860-2 (digital)',
    summary:
      'Análisis por materias del Plan General de Contabilidad y del PGC de pymes, con ejemplos, casos prácticos y la opinión técnica de KPMG en las cuestiones que admiten interpretación. La 6.ª edición incorpora, entre otros contenidos, las consultas del ICAC sobre ingresos e instrumentos financieros, la contabilidad de la transición energética y de los nuevos impuestos y gravámenes sectoriales, la convergencia con las NIIF-UE y la normativa de sostenibilidad.',
    practicalValue:
      'Está pensada para fundamentar criterios contables complejos ante clientes o auditores con la perspectiva de una firma de auditoría, y el formato digital facilita buscar y citar. Recoge las consultas publicadas hasta el 31 de julio de 2025; KPMG anuncia actualizaciones en línea, pero comprueba siempre las consultas posteriores del ICAC.',
    audience: 'Perfiles sénior y responsables de cierre del Área Contable.',
    format: 'Libro electrónico de 4.500 páginas en la biblioteca digital de Aranzadi La Ley (de pago)',
    url: 'https://www.aranzadilaley.es/tienda/el-plan-general-de-contabilidad',
    verifiedAt: '2026-10-29',
  },
];

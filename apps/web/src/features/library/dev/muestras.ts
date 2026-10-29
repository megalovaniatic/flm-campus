/**
 * Contenido de MUESTRA de «Consultar» para revisar el diseño mientras el equipo editorial
 * redacta la actualidad y las lecturas reales.
 *
 * - Solo se usa en desarrollo (import.meta.env.DEV) y con ?muestra=1 en la dirección
 *   (por ejemplo, http://localhost:5173/?muestra=1#/consultar). Nunca en producción.
 * - Los textos son ilustrativos: no han pasado la revisión editorial ni jurídica y la interfaz
 *   los rotula como «Muestra». Las autorías son personas ficticias de la demostración.
 */
import type { EditorialMeta, NewsItem, Reading } from '@flm/shared';

const editorial = (authorId: string, at: string): EditorialMeta => ({
  status: 'publicado',
  authorId,
  publishedAt: at,
  review: { state: 'pendiente', note: 'Muestra de desarrollo: sin revisión editorial.' },
});

export const SAMPLE_NEWS: NewsItem[] = [
  {
    id: 'muestra-factura-electronica-b2b',
    slug: 'muestra-factura-electronica-b2b',
    area: 'fiscal',
    kind: 'legislacion',
    headline: 'La factura electrónica entre empresas ya tiene calendario',
    oneLiner:
      'La **Orden HAC/1028/2026** regula la solución pública de facturación electrónica de la AEAT y fija desde cuándo deberá emitir facturas electrónicas cada empresa, según su volumen de operaciones.',
    affects:
      'Empresas y profesionales que facturan a otras empresas o profesionales (operaciones B2B). Las facturas a consumidores finales quedan fuera de esta obligación.',
    action:
      'Identificar en la cartera qué clientes entran en el primer tramo del calendario y revisar con ellos su programa de facturación.\n\nAntes de fin de año, enviarles la [nota informativa del Área Fiscal](#/consultar/notas/doc-facturacion-b2b) y proponerles una reunión de adaptación.',
    example:
      'Una sociedad que el año pasado facturó más de ocho millones de euros a otras empresas estará en el primer tramo: tendrá que emitir y recibir sus facturas en formato estructurado y comunicar cuándo las cobra. Un autónomo que trabaja para pymes se incorporará después.',
    source: { label: 'Orden HAC/1028/2026 (Boletín Oficial del Estado)', url: 'https://www.boe.es/', publishedOn: '2026-10-09', effectiveOn: '2026-10-10' },
    nuance: 'El tramo depende del volumen de operaciones del ejercicio anterior. Confírmalo con el último resumen anual del IVA (modelo 390) antes de comunicar una fecha al cliente.',
    urgency: 'alta',
    date: '2026-10-26',
    editorial: editorial('p-jordi-ferrer', '2026-10-26'),
  },
  {
    id: 'muestra-radar-mercantil',
    slug: 'muestra-radar-mercantil',
    area: 'mercantil',
    kind: 'aviso-interno',
    headline: 'Radar Mercantil: cómo compartir las señales que detectas en tus clientes',
    oneLiner: 'Tras el Desayuno Mercantil del 23 de octubre, el Área Mercantil pide que cualquier señal de una posible necesidad societaria se le comunique el mismo día.',
    affects: 'Todas las personas de FLM que tratan con clientes: Fiscal, Laboral, Contable y Administración.',
    action:
      'Cuando detectes una señal —pérdidas que reducen el patrimonio neto, cambios en el accionariado, una sucesión en la empresa familiar o una compraventa de negocio—, anótala en la ficha del cliente y avisa al Área Mercantil. No hace falta tener el diagnóstico: basta con la señal.',
    example:
      'Al preparar el cierre, el Área Contable ve que las pérdidas dejan el patrimonio neto por debajo de la mitad del capital social. Lo anota y avisa a Mercantil, que valora si hay causa de disolución y lo comenta con el cliente a tiempo.',
    source: { label: 'Presentación «Radar Mercantil · Conocer para crecer» (FLM, Desayuno Mercantil)', url: 'https://www.flmexperts.com/', publishedOn: '2026-10-23' },
    urgency: 'informativa',
    date: '2026-10-24',
    editorial: editorial('p-albert-mas', '2026-10-24'),
  },
  {
    id: 'muestra-audiencia-previa-despido',
    slug: 'muestra-audiencia-previa-despido',
    area: 'laboral',
    kind: 'jurisprudencia',
    headline: 'Recordatorio: antes de un despido disciplinario hay que escuchar a la persona trabajadora',
    oneLiner: 'El Tribunal Supremo exige ofrecer una **audiencia previa** antes de despedir por motivos disciplinarios, en aplicación del artículo 7 del Convenio 158 de la OIT.',
    affects: 'Todas las empresas clientes que vayan a despedir por motivos disciplinarios, tengan o no representación legal de las personas trabajadoras.',
    action:
      'Antes de entregar la carta de despido, comunicar por escrito los hechos a la persona trabajadora y darle un plazo razonable para defenderse. Conservar la prueba de ese trámite y usar las plantillas actualizadas del Área Laboral.',
    example:
      'Una empresa detecta faltas reiteradas de puntualidad. Antes de despedir, entrega al trabajador un escrito con los hechos y le da tres días hábiles para responder. Con su respuesta, o sin ella, decide y entrega la carta.',
    source: { label: 'Sentencia del Tribunal Supremo 1250/2024 (Sala de lo Social), de 18 de noviembre', url: 'https://www.poderjudicial.es/', publishedOn: '2024-11-18' },
    nuance:
      'La exigencia se aplica a los despidos posteriores a la sentencia y no obliga a seguir un expediente formal: basta con una oportunidad real de defensa. Revisa además si el convenio colectivo prevé trámites propios.',
    urgency: 'media',
    date: '2026-10-19',
    editorial: editorial('p-nuria-roca', '2026-10-19'),
  },
];

export const SAMPLE_READINGS: Reading[] = [
  {
    id: 'muestra-curso-derecho-tributario',
    area: 'fiscal',
    title: 'Curso de Derecho Financiero y Tributario',
    authors: 'Juan Martín Queralt, Carmelo Lozano Serrano, José Manuel Tejerizo López y Gabriel Casado Ollero',
    edition: 'Edición actualizada cada año',
    publisher: 'Tecnos',
    summary:
      'Manual de referencia del Derecho tributario español: principios constitucionales, la relación jurídico-tributaria, los procedimientos de gestión, inspección y recaudación, y el régimen sancionador.',
    practicalValue: 'Ayuda a fundamentar un escrito o la respuesta a un requerimiento: explica el porqué de cada figura y remite a la jurisprudencia básica.',
    audience: 'Asesoría fiscal júnior y quien prepare recursos o alegaciones.',
    format: 'Libro impreso',
    url: 'https://www.tecnos.es/',
    verifiedAt: '2026-10-28',
  },
  {
    id: 'muestra-memento-fiscal',
    area: 'fiscal',
    title: 'Memento Fiscal',
    authors: 'Lefebvre (obra colectiva)',
    edition: 'Edición 2026',
    publisher: 'Lefebvre',
    summary: 'Obra de consulta que recorre los impuestos estatales con párrafos numerados y remisiones a la normativa, la jurisprudencia y la doctrina administrativa.',
    practicalValue: 'Resuelve dudas concretas en minutos: localizar un tipo, un plazo o una exención y comprobar de qué norma procede.',
    audience: 'Todo el Área Fiscal.',
    format: 'Libro impreso y versión digital',
    url: 'https://www.lefebvre.es/',
    verifiedAt: '2026-10-28',
  },
  {
    id: 'muestra-derecho-del-trabajo',
    area: 'laboral',
    title: 'Derecho del Trabajo',
    authors: 'Alfredo Montoya Melgar',
    edition: 'Edición actualizada cada año',
    publisher: 'Tecnos',
    summary: 'Tratado clásico del Derecho del Trabajo español: fuentes, contrato de trabajo, condiciones laborales, extinción del contrato y derecho colectivo.',
    practicalValue: 'Da el marco para entender por qué una cláusula o un despido se interpretan de una forma y no de otra, más allá del caso concreto.',
    audience: 'Graduados sociales y abogados laboralistas.',
    format: 'Libro impreso',
    url: 'https://www.tecnos.es/',
    verifiedAt: '2026-10-28',
  },
  {
    id: 'muestra-memento-contable',
    area: 'contable',
    title: 'Memento Contable',
    authors: 'Lefebvre (obra colectiva)',
    edition: 'Edición 2026',
    publisher: 'Lefebvre',
    summary: 'Comentario sistemático del Plan General de Contabilidad, con las resoluciones y consultas del ICAC relacionadas y ejemplos de registro.',
    practicalValue: 'Permite comprobar en un solo lugar la norma de registro y valoración, las consultas del ICAC aplicables y un asiento de ejemplo.',
    audience: 'Área Contable, sobre todo durante el cierre del ejercicio.',
    format: 'Libro impreso y versión digital',
    url: 'https://www.lefebvre.es/',
    verifiedAt: '2026-10-28',
  },
];

/**
 * Biblioteca · Notas informativas y documentos originales.
 * Los PDF propios de FLM y el BOICAC oficial se publican en la demo con autorización de FLM.
 * Las publicaciones de terceros o de autoría por confirmar se muestran solo como ficha.
 */
import type { EditorialMeta, LibraryDocument } from '@flm/shared';

const flm = (authorId: string, at: string): EditorialMeta => ({
  status: 'publicado',
  authorId,
  publishedAt: at,
  review: { state: 'revisado', reviewerName: 'Documento original de FLM' },
});

const v = (file: string, sizeKb: number, pages: number, uploadedAt: string, uploadedBy: string) => [{ version: 1, file, sizeKb, pages, uploadedAt, uploadedBy }];

export const documents: LibraryDocument[] = [
  {
    id: 'doc-verifactu-aplazamiento',
    title: 'El aplazamiento de VERI*FACTU a octubre de 2028 está pendiente de aprobación normativa',
    area: 'fiscal',
    issuer: 'FLM · Área Fiscal',
    date: '2026-10-29',
    summary:
      'Explica la comunicación de Hacienda de 5 de octubre de 2026, que prevé trasladar a octubre de 2028 la adaptación de los programas de facturación para coordinarla con la factura electrónica de pymes y autónomos. Mientras no se publique en el BOE, siguen vigentes el 1 de enero de 2027 para el Impuesto sobre Sociedades y el 1 de julio de 2027 para el resto. Recomienda no parar la adaptación. En castellano, catalán e inglés.',
    kind: 'nota-informativa',
    versions: v('docs/nota-verifactu-aplazamiento-2028.pdf', 210, 6, '2026-10-29', 'p-judith-calet'),
    tags: ['VERI*FACTU', 'aplazamiento', 'calendario', 'factura electrónica', 'castellano', 'català', 'English'],
    publicDemo: true,
    editorial: flm('p-judith-calet', '2026-10-29'),
  },
  {
    id: 'doc-facturacion-b2b',
    title: 'La facturación electrónica B2B: calendario y obligaciones tras la Orden HAC/1028/2026',
    area: 'fiscal',
    issuer: 'FLM · Área Fiscal',
    date: '2026-10-13',
    summary:
      'Explica la obligación de factura electrónica entre empresas y profesionales tras la orden que regula la solución pública de la AEAT: calendario según volumen de operaciones, formato estructurado, plataformas, copia a la AEAT y comunicación de estados de pago. La distingue de VERI*FACTU y cierra con recomendaciones.',
    kind: 'nota-informativa',
    versions: v('docs/nota-facturacion-electronica-b2b.pdf', 239, 6, '2026-10-13', 'p-angel-ceniceros'),
    tags: ['factura electrónica', 'B2B', 'Crea y Crece', 'AEAT'],
    publicDemo: true,
    editorial: flm('p-angel-ceniceros', '2026-10-13'),
  },
  {
    id: 'doc-iva-vehiculos',
    title: 'Tratamiento en IVA de los vehículos: deducción y cesión a empleados tras la STS de 13 de julio de 2026',
    area: 'fiscal',
    issuer: 'FLM · Área Fiscal',
    date: '2026-10-13',
    summary:
      'Fija el criterio de FLM sobre la deducción del IVA de los turismos (presunción del 50 % y cómo acreditar una afectación mayor) y analiza la cesión del vehículo a la plantilla según la sentencia del Tribunal Supremo y la doctrina administrativa. Recuerda coordinar la retribución en especie con Laboral.',
    kind: 'nota-informativa',
    versions: v('docs/nota-iva-vehiculos.pdf', 212, 3, '2026-10-13', 'p-lluis-gomez'),
    tags: ['IVA', 'vehículos', 'retribución en especie', 'Tribunal Supremo'],
    publicDemo: true,
    editorial: flm('p-lluis-gomez', '2026-10-13'),
  },
  {
    id: 'doc-verifactu',
    title: 'VERI*FACTU: plazos y exclusiones',
    area: 'fiscal',
    issuer: 'FLM · Área Fiscal',
    date: '2026-10-01',
    summary:
      'Resume quién debe adaptar sus sistemas informáticos de facturación al Reglamento aprobado por el Real Decreto 1007/2023, las dos modalidades posibles, los plazos fijados tras el Real Decreto-ley 15/2025 y la exclusión de quienes llevan los libros registro del IVA a través del SII.',
    kind: 'nota-informativa',
    versions: v('docs/nota-verifactu.pdf', 197, 2, '2026-10-01', 'p-angel-ceniceros'),
    tags: ['VERI*FACTU', 'facturación', 'SIF', 'calendario'],
    publicDemo: true,
    notice: 'Nota fechada el 1 de octubre de 2026, antes del anuncio de Hacienda de aplazar VERI*FACTU a octubre de 2028 (pendiente de aprobación). Consulta la nota del 29 de octubre de 2026 y la formación «Verifactu» para el calendario vigente.',
    editorial: flm('p-angel-ceniceros', '2026-10-01'),
  },
  {
    id: 'doc-apartahoteles',
    title: 'IVA en operaciones con apartahoteles convertidos en viviendas',
    area: 'fiscal',
    issuer: 'FLM · Área Fiscal',
    date: '2026-09-23',
    summary:
      'Comenta la consulta vinculante de la DGT V5234-26: deducción del IVA de la compra y la reforma según el destino previsto, regularización si se decide vender como viviendas antes de explotar el inmueble y tributación de la venta posterior según haya o no rehabilitación.',
    kind: 'nota-informativa',
    versions: v('docs/nota-apartahoteles-viviendas.pdf', 96, 2, '2026-09-23', 'p-lluis-gomez'),
    tags: ['IVA', 'inmobiliario', 'DGT', 'rehabilitación'],
    publicDemo: true,
    editorial: flm('p-lluis-gomez', '2026-09-23'),
  },
  {
    id: 'doc-casacion-no-residentes',
    title: 'Casación admitida sobre la deducción de gastos de alquiler de no residentes (ATS 7675/2026)',
    area: 'fiscal',
    issuer: 'FLM · Área Fiscal (comunicación a clientes)',
    date: '2026-09-22',
    summary:
      'Carta a clientes, en inglés y en español, sobre la admisión a trámite por el Tribunal Supremo de la cuestión de si los no residentes de terceros países pueden deducir gastos de alquiler como los residentes en la UE y el EEE, e invitación a revisar las autoliquidaciones del modelo 210 antes de que prescriban.',
    kind: 'nota-informativa',
    versions: v('docs/nota-casacion-no-residentes.pdf', 61, 2, '2026-09-22', 'p-angel-ceniceros'),
    tags: ['IRNR', 'modelo 210', 'Tribunal Supremo', 'no residentes'],
    publicDemo: true,
    editorial: flm('p-angel-ceniceros', '2026-09-22'),
  },
  {
    id: 'doc-correcciones-is',
    title: 'Consulta V5484-26: corrección de errores contables y el Impuesto sobre Sociedades',
    area: 'contable',
    issuer: 'FLM · Área Fiscal',
    date: '2026-09-29',
    summary:
      'Resume la consulta de la DGT sobre la baja de saldos antiguos de clientes y proveedores ya cobrados o pagados: si los ejercicios de origen tributaron correctamente, la corrección contra reservas no genera renta ni exige ajustes. Añade observaciones prácticas sobre deterioros, IVA y soporte documental.',
    kind: 'nota-informativa',
    versions: v('docs/nota-correcciones-contables-is.pdf', 56, 2, '2026-09-29', 'p-lluis-gomez'),
    tags: ['Impuesto sobre Sociedades', 'errores contables', 'reservas', 'DGT'],
    publicDemo: true,
    editorial: flm('p-lluis-gomez', '2026-09-29'),
  },
  {
    id: 'doc-radar-mercantil',
    title: 'Radar Mercantil · Conocer para crecer',
    area: 'mercantil',
    issuer: 'FLM · Área Mercantil',
    date: '2026-10-20',
    summary:
      'Presentación del Área Mercantil para el Desayuno del 23 de octubre: señales en la relación con el cliente que anticipan una necesidad mercantil, cómo compartirlas entre áreas y cómo actuar a tiempo como firma.',
    kind: 'material-evento',
    versions: v('docs/radar-mercantil-2026-10.pdf', 643, 12, '2026-10-23', 'p-joan-navarro'),
    tags: ['Mercantil', 'derivación', 'Desayuno Mercantil'],
    publicDemo: true,
    editorial: flm('p-joan-navarro', '2026-10-23'),
  },
  {
    id: 'doc-boicac-147',
    title: 'BOICAC n.º 147 · septiembre de 2026',
    area: 'contable',
    issuer: 'Instituto de Contabilidad y Auditoría de Cuentas (ICAC)',
    date: '2026-10-22',
    summary:
      'Boletín oficial del ICAC con resoluciones, información del Registro Oficial de Auditores de Cuentas, reglamentos europeos sobre sostenibilidad y tres consultas contables: informe fiscal de filiales con dominante intermedia europea, imputación temporal de ingresos en un contrato de mantenimiento y bienes recuperados mediante dación en pago.',
    kind: 'publicacion-oficial',
    versions: v('docs/boicac-147.pdf', 3189, 39, '2026-10-27', 'p-judith-calet'),
    tags: ['ICAC', 'BOICAC', 'consultas contables', 'PGC'],
    publicDemo: true,
    editorial: { status: 'publicado', authorId: 'p-judith-calet', publishedAt: '2026-10-27', review: { state: 'revisado', reviewerName: 'Publicación oficial del ICAC (reproducción autorizada citando la fuente)' } },
  },
  {
    id: 'doc-rtt-153',
    title: 'Revista Técnica Tributaria n.º 153 (abril-junio de 2026)',
    area: 'fiscal',
    issuer: 'AEDAF (publicación externa)',
    date: '2026-06-30',
    summary:
      'Número trimestral con estudios doctrinales sobre fiscalidad internacional, prórroga presupuestaria, tecnología en la AEAT, Pilar Dos de la OCDE, valor de referencia y régimen de impatriados.',
    kind: 'boletin',
    versions: v('privado/revista-tecnica-tributaria-153.pdf', 1, 476, '2026-10-28', 'p-angel-ceniceros'),
    tags: ['AEDAF', 'doctrina', 'revista'],
    publicDemo: false,
    notice: 'Publicación protegida de terceros: disponible solo en la versión interna, sujeta a la suscripción de FLM.',
    editorial: { status: 'publicado', authorId: 'p-angel-ceniceros', review: { state: 'pendiente', note: 'Confirmar licencia de distribución interna.' } },
  },
  {
    id: 'doc-campana-is-2025',
    title: 'Novedades de la campaña del Impuesto sobre Sociedades 2025 (presentación)',
    area: 'fiscal',
    issuer: 'Pendiente de confirmar (jornada externa)',
    date: '2026-07-02',
    summary:
      'Presentación en tres bloques: cambios normativos del IS 2025 (reserva de capitalización, tipos de empresas de reducida dimensión y microempresas, bases negativas en consolidación, libertad de amortización), cambios del modelo 200 y doctrina reciente.',
    kind: 'presentacion',
    versions: v('privado/novedades-campana-is-2025.pdf', 1, 44, '2026-10-28', 'p-lluis-gomez'),
    tags: ['Impuesto sobre Sociedades', 'modelo 200', 'campaña'],
    publicDemo: false,
    notice: 'Emisor por confirmar: se mantiene en la versión interna hasta verificar si puede distribuirse.',
    editorial: { status: 'publicado', authorId: 'p-lluis-gomez', review: { state: 'pendiente', note: 'Confirmar emisor y permiso de distribución.' } },
  },
  {
    id: 'doc-novedades-cataluna',
    title: 'Novedades fiscales en Cataluña: Ley 11/2026, de 9 de julio',
    area: 'fiscal',
    issuer: 'Autoría por confirmar',
    date: '2026-07-14',
    summary:
      'Resumen divulgativo de la ley catalana de medidas fiscales que acompaña a los presupuestos: deducciones autonómicas en el IRPF, ajustes en Sucesiones y Donaciones y en Transmisiones Patrimoniales, tasas y otros tributos propios.',
    kind: 'nota-informativa',
    versions: v('privado/novedades-fiscales-cataluna.pdf', 1, 9, '2026-10-28', 'p-angel-ceniceros'),
    tags: ['Cataluña', 'tributos cedidos', 'IRPF', 'ISD'],
    publicDemo: false,
    notice: 'Documento sin marca de FLM: pendiente de confirmar su autoría antes de publicarlo.',
    editorial: { status: 'publicado', authorId: 'p-angel-ceniceros', review: { state: 'pendiente', note: 'Confirmar autoría.' } },
  },
];

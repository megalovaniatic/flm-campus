/**
 * Esquemas de validación (zod). Se usan para:
 *  - validar el contenido semilla del campus antes de compilar (npm run lint:content);
 *  - validar en el servidor toda entrada de la API.
 */
import { z } from 'zod';
import { AREA_IDS } from './areas';

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha con formato AAAA-MM-DD');
const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, 'Fecha u hora local con formato AAAA-MM-DD o AAAA-MM-DDTHH:mm');
const httpsUrl = z.string().regex(/^https:\/\/[^\s]+$/, 'Enlace https obligatorio');
const nonEmpty = (label: string) => z.string().trim().min(1, `${label}: campo obligatorio`);

export const areaSchema = z.enum(AREA_IDS);

export const editorialSchema = z.object({
  status: z.enum(['borrador', 'en-revision', 'publicado', 'archivado']),
  authorId: nonEmpty('Autor'),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  review: z.object({
    state: z.enum(['pendiente', 'revisado']),
    reviewerName: z.string().optional(),
    reviewedAt: z.string().optional(),
    note: z.string().optional(),
  }),
  returnComment: z.string().optional(),
});

export const sourceSchema = z.object({
  label: nonEmpty('Fuente'),
  url: httpsUrl,
  date: dateKey.optional(),
  kind: z.enum(['norma', 'jurisprudencia', 'criterio', 'documento', 'web']).optional(),
});

const quizOptionSchema = z.object({
  id: nonEmpty('Opción'),
  text: nonEmpty('Texto de la opción'),
  feedback: z.string().optional(),
});

export const quizQuestionSchema = z
  .object({
    id: nonEmpty('Pregunta'),
    prompt: nonEmpty('Enunciado'),
    options: z.array(quizOptionSchema).min(3, 'Cada pregunta necesita al menos 3 opciones').max(4, 'Máximo 4 opciones'),
    correctOptionId: nonEmpty('Respuesta correcta'),
    explanation: nonEmpty('Explicación'),
    ref: z.string().optional(),
  })
  .superRefine((q, ctx) => {
    const ids = q.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: `Opciones repetidas en ${q.id}` });
    if (!ids.includes(q.correctOptionId)) ctx.addIssue({ code: 'custom', message: `La respuesta correcta de ${q.id} no existe` });
    for (const o of q.options) {
      if (o.id !== q.correctOptionId && !o.feedback?.trim()) {
        ctx.addIssue({ code: 'custom', message: `Falta explicar por qué la opción ${o.id} de ${q.id} es incorrecta` });
      }
    }
  });

export const quizSchema = z
  .object({
    id: nonEmpty('Test'),
    title: nonEmpty('Título del test'),
    questions: z.array(quizQuestionSchema).min(1),
    passMark: z.number().int().positive(),
  })
  .refine((q) => q.passMark <= q.questions.length, 'El aprobado no puede superar el número de preguntas');

const exampleStepSchema = z.object({ label: nonEmpty('Paso'), formula: z.string().optional(), result: z.string().optional() });

const widgetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('recargo-extemporaneo'), cuota: z.number().positive() }),
  z.object({ kind: z.literal('indemnizacion-despido'), salarioAnual: z.number().positive(), inicio: dateKey, fin: dateKey }),
  z.object({ kind: z.literal('disolucion-perdidas'), capital: z.number().positive(), patrimonioNeto: z.number(), prestamoParticipativo: z.number().optional() }),
  z.object({ kind: z.literal('calendario-cuentas'), cierre: dateKey }),
  z.object({ kind: z.literal('amortizacion'), coste: z.number().positive(), vidaUtil: z.number().positive(), coeficienteFiscalMax: z.number().positive(), valorResidual: z.number().optional() }),
  z.object({ kind: z.literal('periodificacion'), importe: z.number().positive(), inicio: dateKey, meses: z.number().int().positive(), cierre: dateKey, concepto: nonEmpty('Concepto') }),
  z.object({
    kind: z.literal('cuentas-t'),
    title: z.string().optional(),
    entries: z.array(
      z
        .object({
          date: z.string().optional(),
          concept: nonEmpty('Concepto del asiento'),
          lines: z.array(z.object({ account: nonEmpty('Cuenta'), name: nonEmpty('Nombre de la cuenta'), debit: z.number().optional(), credit: z.number().optional() })).min(2),
        })
        .refine((e) => {
          const d = e.lines.reduce((s, l) => s + (l.debit ?? 0), 0);
          const c = e.lines.reduce((s, l) => s + (l.credit ?? 0), 0);
          return Math.abs(d - c) < 0.005;
        }, 'El asiento no cuadra: el debe y el haber deben sumar lo mismo'),
    ),
  }),
  z.object({
    kind: z.literal('arbol-decision'),
    title: nonEmpty('Título'),
    start: nonEmpty('Nodo inicial'),
    nodes: z.array(
      z.object({
        id: nonEmpty('Nodo'),
        question: z.string().optional(),
        options: z.array(z.object({ label: nonEmpty('Opción'), next: nonEmpty('Destino') })).optional(),
        outcome: z.object({ title: nonEmpty('Resultado'), text: nonEmpty('Texto'), tone: z.enum(['derivar', 'resolver', 'atencion']) }).optional(),
      }),
    ),
  }),
  z.object({ kind: z.literal('linea-tiempo'), title: z.string().optional(), items: z.array(z.object({ date: nonEmpty('Fecha'), title: nonEmpty('Hito'), text: z.string().optional(), tone: z.enum(['hito', 'plazo', 'pendiente']).optional() })).min(2) }),
  z.object({ kind: z.literal('tarjetas-verdad'), title: z.string().optional(), cards: z.array(z.object({ claim: nonEmpty('Afirmación'), verdict: z.enum(['verdadero', 'falso', 'depende']), explanation: nonEmpty('Explicación') })).min(2) }),
  z.object({ kind: z.literal('comparativa'), title: z.string().optional(), columns: z.array(z.string()).min(2), rows: z.array(z.object({ label: nonEmpty('Fila'), values: z.array(z.string()) })).min(1) }),
  z.object({ kind: z.literal('clasificador'), title: nonEmpty('Título'), prompt: nonEmpty('Instrucción'), categories: z.array(z.string()).min(2), items: z.array(z.object({ label: nonEmpty('Elemento'), answer: nonEmpty('Categoría'), explanation: nonEmpty('Explicación') })).min(2) }),
  z.object({
    kind: z.literal('grafico'),
    chart: z.object({
      type: z.enum(['barras', 'lineas', 'escalones']),
      title: nonEmpty('Título del gráfico'),
      unit: z.string().optional(),
      xLabel: z.string().optional(),
      yLabel: z.string().optional(),
      series: z.array(z.object({ name: nonEmpty('Serie'), values: z.array(z.object({ x: z.union([z.string(), z.number()]), y: z.number() })).min(1) })).min(1),
    }),
  }),
]);

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heading'), text: nonEmpty('Título de sección'), id: z.string().optional() }),
  z.object({ type: z.literal('paragraph'), text: nonEmpty('Párrafo') }),
  z.object({ type: z.literal('list'), ordered: z.boolean().optional(), items: z.array(nonEmpty('Elemento')).min(1) }),
  z.object({ type: z.literal('callout'), tone: z.enum(['clave', 'atencion', 'consejo', 'norma']), title: z.string().optional(), text: nonEmpty('Texto destacado'), refs: z.array(sourceSchema).optional() }),
  z.object({ type: z.literal('quote'), text: nonEmpty('Cita'), cite: z.string().optional() }),
  z.object({ type: z.literal('example'), title: nonEmpty('Ejemplo'), scenario: nonEmpty('Planteamiento'), steps: z.array(exampleStepSchema).min(1), conclusion: nonEmpty('Conclusión') }),
  z.object({ type: z.literal('table'), caption: z.string().optional(), columns: z.array(z.string()).min(2), rows: z.array(z.array(z.string())).min(1), numeric: z.array(z.number()).optional() }),
  z.object({ type: z.literal('widget'), widget: widgetSchema, caption: z.string().optional() }),
  z.object({ type: z.literal('figure'), src: nonEmpty('Imagen'), alt: nonEmpty('Texto alternativo'), caption: z.string().optional() }),
]);

export const formationSchema = z
  .object({
    id: nonEmpty('Id'),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug en minúsculas y guiones'),
    area: areaSchema,
    title: nonEmpty('Título'),
    intro: nonEmpty('Introducción'),
    summary: nonEmpty('Resumen').max(220, 'Resumen de 220 caracteres como máximo'),
    readingMinutes: z.number().int().min(3).max(40),
    outcomes: z.array(nonEmpty('Resultado de aprendizaje')).min(2, 'Entre 2 y 3 resultados de aprendizaje').max(3, 'Entre 2 y 3 resultados de aprendizaje'),
    blocks: z.array(blockSchema).min(3),
    keyTerms: z.array(z.object({ term: nonEmpty('Término'), definition: nonEmpty('Definición') })).min(3),
    takeaway: nonEmpty('Idea clave'),
    sources: z.array(sourceSchema).min(1),
    quiz: quizSchema,
    documentIds: z.array(z.string()).optional(),
    version: z.number().int().positive(),
    editorial: editorialSchema,
    verifiedAt: dateKey,
  })
  .superRefine((f, ctx) => {
    if (f.quiz.questions.length !== 3) ctx.addIssue({ code: 'custom', message: `${f.id}: el test final debe tener exactamente 3 preguntas` });
    if (f.quiz.passMark !== 2) ctx.addIssue({ code: 'custom', message: `${f.id}: el test final se aprueba con 2 de 3` });
    if (!f.blocks.some((b) => b.type === 'example')) ctx.addIssue({ code: 'custom', message: `${f.id}: falta un ejemplo realista` });
  });

export const assessmentSchema = z
  .object({ id: nonEmpty('Id'), area: areaSchema, title: z.literal('Pon a prueba tus conocimientos'), intro: nonEmpty('Introducción'), quiz: quizSchema })
  .superRefine((a, ctx) => {
    if (a.quiz.questions.length !== 10) ctx.addIssue({ code: 'custom', message: `${a.id}: la evaluación sectorial debe tener 10 preguntas` });
    if (a.quiz.passMark !== 8) ctx.addIssue({ code: 'custom', message: `${a.id}: la evaluación sectorial se aprueba con 8 de 10` });
  });

export const newsSchema = z.object({
  id: nonEmpty('Id'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  area: areaSchema,
  kind: z.enum(['legislacion', 'jurisprudencia', 'criterio', 'aviso-interno']),
  headline: nonEmpty('Titular').max(110, 'Titular de 110 caracteres como máximo'),
  oneLiner: nonEmpty('La novedad, en una frase'),
  affects: nonEmpty('A quién afecta'),
  action: nonEmpty('Qué debemos hacer'),
  example: nonEmpty('Un ejemplo sencillo'),
  source: z.object({ label: nonEmpty('Fuente'), url: httpsUrl, publishedOn: dateKey, effectiveOn: dateKey.optional() }),
  nuance: z.string().optional(),
  urgency: z.enum(['alta', 'media', 'informativa']),
  date: dateKey,
  editorial: editorialSchema,
});

export const readingSchema = z.object({
  id: nonEmpty('Id'),
  area: areaSchema,
  title: nonEmpty('Título'),
  authors: nonEmpty('Autoría'),
  edition: nonEmpty('Edición'),
  publisher: nonEmpty('Editorial'),
  isbn: z.string().optional(),
  summary: nonEmpty('Resumen'),
  practicalValue: nonEmpty('Valor práctico'),
  audience: nonEmpty('Público'),
  format: nonEmpty('Formato'),
  url: httpsUrl,
  verifiedAt: dateKey,
});

export const documentSchema = z.object({
  id: nonEmpty('Id'),
  title: nonEmpty('Título'),
  area: z.union([areaSchema, z.literal('general')]),
  issuer: nonEmpty('Emisor'),
  date: dateKey,
  summary: nonEmpty('Resumen'),
  kind: z.enum(['nota-informativa', 'boletin', 'publicacion-oficial', 'presentacion', 'material-evento']),
  versions: z.array(z.object({ version: z.number().int().positive(), file: nonEmpty('Archivo'), sizeKb: z.number().positive(), pages: z.number().int().positive().optional(), uploadedAt: nonEmpty('Fecha de subida'), uploadedBy: nonEmpty('Responsable'), note: z.string().optional() })).min(1),
  tags: z.array(z.string()),
  publicDemo: z.boolean(),
  notice: z.string().optional(),
  editorial: editorialSchema,
});

export const eventSchema = z.object({
  id: nonEmpty('Id'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.enum(['evento', 'comunicado']),
  category: z.enum(['formacion-interna', 'desayuno', 'encuentro', 'reconocimiento', 'celebracion', 'iniciativa', 'comunicacion']),
  title: nonEmpty('Título'),
  summary: nonEmpty('Descripción breve'),
  body: z.string().optional(),
  icon: z.enum(['estrella', 'trofeo', 'cafe', 'calendario', 'formacion', 'megafono', 'web', 'boletin', 'brindis', 'resenas', 'video', 'idea']),
  image: z.object({ src: nonEmpty('Imagen'), alt: nonEmpty('Texto alternativo'), credit: z.string().optional() }).optional(),
  sessions: z.array(z.object({ start: localDateTime, end: localDateTime.optional(), label: z.string().optional(), location: z.string().optional() })),
  pendingDateNote: z.string().optional(),
  manualPhase: z.enum(['proximo', 'historico']).optional(),
  archived: z.boolean().optional(),
  department: z.string().optional(),
  links: z.array(z.object({ label: nonEmpty('Enlace'), url: z.string(), example: z.boolean().optional() })).optional(),
  materials: z.array(z.object({ label: nonEmpty('Material'), documentId: nonEmpty('Documento') })).optional(),
  recap: z.string().optional(),
  editorial: editorialSchema,
});

export const holidaySchema = z.object({
  date: dateKey,
  name: nonEmpty('Nombre del festivo'),
  scope: z.enum(['nacional', 'autonomico', 'local']),
  offices: z.array(z.enum(['Barcelona', 'Vic', 'Granollers'])),
  source: httpsUrl,
});

export const personSchema = z.object({
  id: nonEmpty('Id'),
  email: z.string().regex(/^[a-z0-9._%+-]+@flmexperts\.com$/, 'Correo corporativo @flmexperts.com obligatorio'),
  name: nonEmpty('Nombre'),
  position: nonEmpty('Puesto'),
  department: z.enum(['Fiscal', 'Laboral', 'Mercantil', 'Contable', 'Dirección', 'Administración', 'Comunicación', 'Sistemas']),
  office: z.enum(['Barcelona', 'Vic', 'Granollers']),
  role: z.enum(['empleado', 'autor', 'admin']),
  photo: z.string().optional(),
  startDate: dateKey.optional(),
  birthday: z.string().regex(/^\d{2}-\d{2}$/).optional(),
  showBirthday: z.boolean(),
  status: z.enum(['activa', 'inactiva']),
  fictional: z.boolean().optional(),
  publicSource: z.string().optional(),
});

/* Entradas de la API */
export const loginInput = z.object({ email: z.string().trim().toLowerCase().max(254), password: z.string().min(1).max(256) });
export const passwordInput = z
  .string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres')
  .max(256)
  .refine((p) => /[a-zA-ZÀ-ÿ]/.test(p) && /\d/.test(p), 'Combina letras y números');

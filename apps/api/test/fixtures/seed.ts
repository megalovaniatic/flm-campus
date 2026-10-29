import type { CampusEvent, EditorialMeta, Formation, QuizQuestion, SectorAssessment, SeedData } from '@flm/shared';

/**
 * Datos semilla mínimos para las pruebas de la API (independientes de @flm/content).
 * Reloj de referencia de las pruebas: 28/10/2026 10:00 UTC (11:00 en Madrid).
 */
export const IDS = {
  admin: 'p-admin',
  autor: 'p-autor',
  autora2: 'p-autora2',
  empleado: 'p-empleado',
  reservada: 'p-reservada',
  ficticia: 'p-ficticia',
  formation: 'fis-01',
  assessment: 'eval-fiscal',
  news: 'not-01',
  document: 'doc-01',
  encuentro: 'ev-encuentro',
  multisesion: 'ev-multisesion',
  pasado: 'ev-pasado',
  comunicado: 'com-pendiente',
  cliente: 'cl-industrias-vall',
  clienteFicticio: 'cl-ficticio',
  bienvenida: 'bv-reservada',
  bienvenidaFicticia: 'bv-ficticia',
} as const;

export const EMAILS = {
  admin: 'ana.admin@flmexperts.com',
  autor: 'jordi.autor@flmexperts.com',
  autora2: 'nuria.autora@flmexperts.com',
  empleado: 'pau.empleado@flmexperts.com',
  reservada: 'sara.reservada@flmexperts.com',
  ficticia: 'ficticia@flmexperts.com',
} as const;

/**
 * Cumpleaños y fecha de incorporación de prueba para las altas de las pruebas (obligatorios en el alta).
 * Las personas del fixture no los tienen: son los perfiles anteriores, que se completan sin inventar nada.
 */
export const NEW_PERSON_DATES = { birthday: '03-14', startDate: '2026-10-26' } as const;

export const published = (authorId: string): EditorialMeta => ({
  status: 'publicado',
  authorId,
  publishedAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-09-01T08:00:00.000Z',
  review: { state: 'revisado', reviewerName: 'Revisión jurídica', reviewedAt: '2026-08-30' },
});

/** Pregunta con tres opciones; la correcta no lleva retroalimentación, las demás sí. */
export function question(id: string, correct: 'a' | 'b' | 'c'): QuizQuestion {
  return {
    id,
    prompt: `Enunciado de la pregunta ${id}`,
    options: (['a', 'b', 'c'] as const).map((o) => ({
      id: o,
      text: `Opción ${o.toUpperCase()} de ${id}`,
      ...(o === correct ? {} : { feedback: `La opción ${o} de ${id} no es correcta.` }),
    })),
    correctOptionId: correct,
    explanation: `Explicación de la pregunta ${id}`,
    ref: 'Art. 27 LGT',
  };
}

export function formationPayload(overrides: Partial<Formation> = {}): Formation {
  return {
    id: IDS.formation,
    slug: 'recargos-extemporaneos',
    area: 'fiscal',
    title: 'Recargos por presentación extemporánea',
    intro: 'Un cliente presenta una autoliquidación con cuatro meses de retraso y sin requerimiento previo.',
    summary: 'Cómo se calculan los recargos del artículo 27 de la Ley General Tributaria.',
    readingMinutes: 8,
    outcomes: ['Calcular el recargo aplicable', 'Distinguir recargo y sanción'],
    blocks: [
      { type: 'heading', text: 'Qué dice la norma' },
      { type: 'paragraph', text: 'El **artículo 27** de la LGT fija recargos crecientes según el retraso.' },
      {
        type: 'example',
        title: 'Caso práctico',
        scenario: 'Autoliquidación presentada con cuatro meses de retraso.',
        steps: [{ label: 'Recargo del 1 % más 1 % por mes completo', formula: '1 % + 4 × 1 %', result: '5 %' }],
        conclusion: 'Se aplica un recargo del 5 % sin intereses de demora.',
      },
    ],
    keyTerms: [
      { term: 'Recargo', definition: 'Prestación accesoria por presentar fuera de plazo sin requerimiento.' },
      { term: 'Sanción', definition: 'Consecuencia de una infracción tributaria.' },
      { term: 'Requerimiento', definition: 'Actuación de la Administración que conoce el contribuyente.' },
    ],
    takeaway: 'Regularizar cuanto antes reduce el recargo.',
    sources: [{ label: 'Ley 58/2003, General Tributaria', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186', kind: 'norma' }],
    quiz: { id: 'quiz-fis-01', title: 'Test final', passMark: 2, questions: [question('q1', 'a'), question('q2', 'b'), question('q3', 'c')] },
    version: 1,
    editorial: published(IDS.autor),
    verifiedAt: '2026-10-01',
    ...overrides,
  };
}

/** Respuestas: correctas en las tres preguntas de la formación. */
export const FORMATION_CORRECT = { q1: 'a', q2: 'b', q3: 'c' } as const;

/** Evaluación del área: 10 preguntas (la correcta, siempre la «a»), aprobado con 8. */
export function assessmentPayload(overrides: Partial<SectorAssessment> = {}): SectorAssessment {
  return {
    id: IDS.assessment,
    area: 'fiscal',
    title: 'Pon a prueba tus conocimientos',
    intro: 'Diez preguntas para comprobar lo aprendido en el área Fiscal.',
    quiz: {
      id: 'quiz-eval-fiscal',
      title: 'Evaluación Fiscal',
      passMark: 8,
      questions: Array.from({ length: 10 }, (_, i) => question(`e${i + 1}`, 'a')),
    },
    ...overrides,
  };
}

const assessment = assessmentPayload();

function event(patch: Partial<CampusEvent> & Pick<CampusEvent, 'id' | 'slug' | 'title'>): CampusEvent {
  return {
    kind: 'evento',
    category: 'formacion-interna',
    summary: 'Descripción breve del evento.',
    icon: 'calendario',
    sessions: [],
    editorial: published(IDS.admin),
    ...patch,
  };
}

export const fixtureSeed: SeedData = {
  people: [
    {
      id: IDS.admin,
      email: EMAILS.admin,
      name: 'Ana Admin Puig',
      position: 'Coordinadora de formación',
      department: 'Administración',
      office: 'Barcelona',
      role: 'admin',
      status: 'activa',
    },
    {
      id: IDS.autor,
      email: EMAILS.autor,
      name: 'Jordi Autor Vidal',
      position: 'Asesor fiscal sénior',
      department: 'Fiscal',
      office: 'Barcelona',
      role: 'autor',
      status: 'activa',
    },
    {
      id: IDS.autora2,
      email: EMAILS.autora2,
      name: 'Núria Autora Serra',
      position: 'Graduada social',
      department: 'Laboral',
      office: 'Vic',
      role: 'autor',
      status: 'activa',
    },
    {
      id: IDS.empleado,
      email: EMAILS.empleado,
      name: 'Pau Empleado Camps',
      position: 'Asesor fiscal',
      department: 'Fiscal',
      office: 'Granollers',
      role: 'empleado',
      status: 'activa',
    },
    {
      id: IDS.reservada,
      email: EMAILS.reservada,
      name: 'Sara Reservada López',
      position: 'Asesora contable',
      department: 'Contable',
      office: 'Barcelona',
      role: 'empleado',
      status: 'activa',
    },
    {
      id: IDS.ficticia,
      email: EMAILS.ficticia,
      name: 'Persona Ficticia',
      position: 'Demostración',
      department: 'Fiscal',
      office: 'Barcelona',
      role: 'empleado',
      status: 'activa',
      fictional: true,
    },
  ],
  formations: [formationPayload()],
  assessments: [assessment],
  news: [
    {
      id: IDS.news,
      slug: 'verifactu-calendario',
      area: 'fiscal',
      kind: 'legislacion',
      headline: 'Nuevo calendario de implantación de Verifactu',
      oneLiner: 'Se aplaza la obligación de usar sistemas de facturación verificables.',
      affects: 'Empresas y profesionales que facturan con software.',
      action: 'Revisar con cada cliente su software de facturación.',
      example: 'Una tienda con TPV deberá actualizarlo antes de la nueva fecha.',
      source: { label: 'Agencia Tributaria', url: 'https://sede.agenciatributaria.gob.es', publishedOn: '2026-10-05' },
      urgency: 'alta',
      date: '2026-10-05',
      editorial: published(IDS.admin),
    },
  ],
  documents: [
    {
      id: IDS.document,
      title: 'Nota informativa Verifactu',
      area: 'fiscal',
      issuer: 'AEAT',
      date: '2026-10-05',
      summary: 'Resumen de la nota informativa sobre Verifactu.',
      kind: 'nota-informativa',
      versions: [{ version: 1, file: 'docs/no-existe.pdf', sizeKb: 120, uploadedAt: '2026-10-05', uploadedBy: 'Administración' }],
      tags: ['verifactu'],
      publicDemo: false,
      editorial: published(IDS.admin),
    },
  ],
  readings: [
    {
      id: 'lec-01',
      area: 'fiscal',
      title: 'Manual práctico de procedimientos tributarios',
      authors: 'Varios autores',
      edition: '2026',
      publisher: 'Editorial Jurídica',
      summary: 'Guía práctica de procedimientos.',
      practicalValue: 'Consulta rápida de plazos.',
      audience: 'Equipo fiscal',
      format: 'Papel',
      url: 'https://www.boe.es',
      verifiedAt: '2026-10-01',
    },
  ],
  events: [
    event({
      id: IDS.encuentro,
      slug: 'encuentro-otono',
      title: 'Encuentro de otoño',
      category: 'encuentro',
      icon: 'cafe',
      sessions: [{ start: '2026-11-12T09:00', end: '2026-11-12T10:30', location: 'Barcelona' }],
    }),
    event({
      id: IDS.multisesion,
      slug: 'ciclo-cierre-contable',
      title: 'Ciclo sobre el cierre contable',
      sessions: [
        { start: '2026-10-20T16:00', end: '2026-10-20T18:00', label: 'Sesión 1' },
        { start: '2026-11-03T16:00', end: '2026-11-03T18:00', label: 'Sesión 2' },
      ],
    }),
    event({ id: IDS.pasado, slug: 'desayuno-enero', title: 'Desayuno de enero', category: 'desayuno', icon: 'cafe', sessions: [{ start: '2026-01-10' }] }),
    event({
      id: IDS.comunicado,
      slug: 'nueva-web',
      kind: 'comunicado',
      category: 'comunicacion',
      title: 'Estrenamos web',
      icon: 'web',
      pendingDateNote: 'Fecha por confirmar',
    }),
  ],
  holidays: [
    { date: '2026-12-25', name: 'Navidad', scope: 'nacional', offices: [], source: 'https://www.boe.es/diario_boe/' },
    { date: '2026-12-26', name: 'Sant Esteve', scope: 'autonomico', offices: ['Barcelona', 'Vic', 'Granollers'], source: 'https://dogc.gencat.cat' },
  ],
  clients: [
    {
      id: IDS.cliente,
      name: 'Industrias del Vall, S.L.',
      sector: 'Maquinaria agrícola',
      country: 'España',
      area: 'mercantil',
      date: '2026-10-20',
      summary: 'Reorganización societaria del grupo.',
      editorial: published(IDS.admin),
    },
    {
      id: IDS.clienteFicticio,
      name: 'Ejemplo Ficticio AB',
      sector: 'Robótica',
      country: 'Suecia',
      area: 'laboral',
      date: '2026-10-21',
      fictional: true,
      editorial: published(IDS.admin),
    },
  ],
  welcomes: [
    { id: IDS.bienvenida, personId: IDS.reservada, date: '2026-10-26', message: 'Se suma al Área Contable en Barcelona.', editorial: published(IDS.admin) },
    { id: IDS.bienvenidaFicticia, personId: IDS.ficticia, date: '2026-10-19', message: 'Bienvenida de ejemplo para la demostración.', editorial: published(IDS.admin) },
  ],
};

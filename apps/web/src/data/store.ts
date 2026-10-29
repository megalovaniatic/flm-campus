/**
 * Estado de la demostración pública.
 *
 * En la demo (GitHub Pages) todo lo que hace la persona —progreso, intentos,
 * borradores, cambios de administración— se guarda solo en este navegador
 * (localStorage) y se puede restablecer. En la versión privada estas mismas
 * operaciones las resuelve la API con permisos en el servidor.
 *
 * Lo guardado lleva número de versión: si cambia su forma, se sube `version` y se añade
 * el paso correspondiente en `migrateDemo`, para no perder el progreso de nadie.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { seed } from '@flm/content';
import type {
  AuditRecord,
  CampusEvent,
  ContentType,
  EditorialStatus,
  Formation,
  FormationProgress,
  LibraryDocument,
  NewClient,
  NewsItem,
  Person,
  Quiz,
  QuizAttempt,
  QuizQuestion,
  Role,
  SectorAssessment,
  Welcome,
} from '@flm/shared';

export type ThemePref = 'sistema' | 'claro' | 'oscuro';
export type MotionPref = 'sistema' | 'reducido' | 'completo';

export interface DraftRecord {
  id: string;
  type: ContentType;
  title: string;
  status: EditorialStatus;
  authorId: string;
  updatedAt: string;
  /** Contenido del formulario (estructura según el tipo). */
  data: Record<string, unknown>;
  revision: number;
}

/** Lo publicado desde Gestión en esta demo, por lista (el contenido semilla nunca cambia). */
export interface ExtraItems {
  extraFormations: Formation;
  extraAssessments: SectorAssessment;
  extraNews: NewsItem;
  extraDocuments: LibraryDocument;
  extraEvents: CampusEvent;
  extraClients: NewClient;
  extraWelcomes: Welcome;
}

export type ExtraList = keyof ExtraItems;

/** Cualquier contenido del campus tal como se publica (tipos compartidos). */
export type CampusItem = ExtraItems[ExtraList];

export interface Notice {
  id: string;
  at: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
}

interface DemoState {
  /** Persona con la sesión iniciada en la demo. */
  userId: string | null;
  /** Rol con el que se está viendo la demo (para recorrer los tres perfiles). */
  roleView: Role | null;
  progress: Record<string, FormationProgress>;
  assessmentAttempts: Record<string, QuizAttempt[]>;
  drafts: Record<string, DraftRecord>;
  /** Cambios de estado editorial sobre el contenido del campus (publicar, archivar, restaurar…). */
  statusOverrides: Record<string, EditorialStatus>;
  eventOverrides: Record<string, Partial<Pick<CampusEvent, 'archived' | 'manualPhase'>>>;
  documentVersions: Record<string, LibraryDocument['versions']>;
  /** Contenido publicado por primera vez desde Gestión, por tipo (los selectores lo mezclan con la semilla). */
  extraFormations: Formation[];
  extraAssessments: SectorAssessment[];
  extraNews: NewsItem[];
  extraDocuments: LibraryDocument[];
  extraEvents: CampusEvent[];
  extraClients: NewClient[];
  extraWelcomes: Welcome[];
  /**
   * Revisiones publicadas de contenidos que ya estaban publicados (de la semilla o creados aquí):
   * id → versión vigente completa. Los selectores la aplican sobre el contenido original.
   */
  contentOverrides: Record<string, CampusItem>;
  peopleOverrides: Record<string, Partial<Person>>;
  revokedSessions: Record<string, string>;
  /**
   * Perfiles eliminados por administración (id → fecha ISO): quien deja FLM desaparece del campus
   * y lo que creó se conserva sin autoría (la autoría se retira al leer, ver selectors.ts).
   */
  removedPeople: Record<string, string>;
  audit: AuditRecord[];
  notices: Notice[];
  seenIntro: boolean;
  theme: ThemePref;
  motion: MotionPref;
  /** Insignias ya celebradas (para no repetir el momento de reconocimiento). */
  celebrated: string[];
  /** Atajos de una sola tecla («/» para buscar). Desactivables (WCAG 2.1.4). */
  singleKeyShortcuts: boolean;
  /** Último día (Madrid) en que se reprodujo «La llegada». */
  arrivalDay: string | null;
  setSingleKeyShortcuts: (v: boolean) => void;
  setArrivalDay: (d: string) => void;

  signIn: (userId: string) => void;
  signOut: () => void;
  setRoleView: (role: Role | null) => void;
  confirmRead: (formationId: string, version: number) => void;
  addAttempt: (formationId: string, attempt: QuizAttempt) => void;
  addAssessmentAttempt: (assessmentId: string, attempt: QuizAttempt) => void;
  saveDraft: (draft: DraftRecord) => void;
  removeDraft: (id: string) => void;
  /** Fija (o, con `null`, quita) el estado editorial de un contenido del campus. */
  setStatus: (contentId: string, status: EditorialStatus | null) => void;
  /** Archivado y fase manual de un evento (se suman a los anteriores); `null` los quita. */
  setEventOverride: (eventId: string, patch: Partial<Pick<CampusEvent, 'archived' | 'manualPhase'>> | null) => void;
  addDocumentVersion: (docId: string, versions: LibraryDocument['versions'] | null) => void;
  /** Añade o sustituye (por id) un contenido publicado desde Gestión. */
  upsertExtra: <K extends ExtraList>(list: K, item: ExtraItems[K]) => void;
  removeExtra: (list: ExtraList, id: string) => void;
  /** Versión vigente de un contenido tras publicar una revisión (`null` la quita). */
  setOverride: (id: string, item: CampusItem | null) => void;
  patchPerson: (personId: string, patch: Partial<Person>) => void;
  revokeSessions: (personId: string) => void;
  /** Elimina el perfil de quien deja FLM. Nunca el de la sesión abierta (nadie se elimina a sí mismo). */
  removePerson: (personId: string) => void;
  log: (record: Omit<AuditRecord, 'id' | 'at'>) => void;
  pushNotice: (n: Omit<Notice, 'id' | 'at' | 'read'>) => void;
  markNoticesRead: () => void;
  setSeenIntro: () => void;
  setTheme: (t: ThemePref) => void;
  setMotion: (m: MotionPref) => void;
  markCelebrated: (badgeId: string) => void;
  reset: () => void;
}

const initial = {
  /** La demo pública se abre directamente con el perfil de demostración (sin contraseña). */
  userId: 'p-judith-calet' as string | null,
  roleView: null as Role | null,
  progress: {} as Record<string, FormationProgress>,
  assessmentAttempts: {} as Record<string, QuizAttempt[]>,
  drafts: {} as Record<string, DraftRecord>,
  statusOverrides: {} as Record<string, EditorialStatus>,
  eventOverrides: {} as Record<string, Partial<Pick<CampusEvent, 'archived' | 'manualPhase'>>>,
  documentVersions: {} as Record<string, LibraryDocument['versions']>,
  extraFormations: [] as Formation[],
  extraAssessments: [] as SectorAssessment[],
  extraNews: [] as NewsItem[],
  extraDocuments: [] as LibraryDocument[],
  extraEvents: [] as CampusEvent[],
  extraClients: [] as NewClient[],
  extraWelcomes: [] as Welcome[],
  contentOverrides: {} as Record<string, CampusItem>,
  peopleOverrides: {} as Record<string, Partial<Person>>,
  revokedSessions: {} as Record<string, string>,
  removedPeople: {} as Record<string, string>,
  audit: [] as AuditRecord[],
  notices: [] as Notice[],
  seenIntro: false,
  theme: 'sistema' as ThemePref,
  motion: 'sistema' as MotionPref,
  celebrated: [] as string[],
  singleKeyShortcuts: true,
  arrivalDay: null as string | null,
};

const now = () => new Date().toISOString();
const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/** Almacenamiento seguro: si localStorage no está disponible, la demo funciona en memoria. */
const safeStorage = createJSONStorage(() => {
  try {
    const k = '__flm_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    const mem = new Map<string, string>();
    return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
  }
});

/** Lo que la demo guarda en este navegador: todo menos la presentación inicial. */
type PersistedDemo = Omit<DemoState, 'seenIntro'>;

/** Claves de la ficha que el campus ya no guarda: cumpleaños, su consentimiento y fecha de incorporación. */
const RETIRED_PERSON_KEYS = new Set(['birthday', 'showBirthday', 'startDate']);

/** Versión de lo guardado en este navegador (ver `migrateDemo`). */
export const DEMO_VERSION = 3;

/**
 * v2: el campus deja de guardar cumpleaños y fechas de incorporación, y desaparecen los
 * aniversarios en FLM; se borran los que quedaran en este navegador.
 */
function toV2(state: PersistedDemo): PersistedDemo {
  const peopleOverrides: Record<string, Partial<Person>> = {};
  for (const [id, patch] of Object.entries(state.peopleOverrides ?? {})) {
    const kept = Object.entries(patch).filter(([key]) => !RETIRED_PERSON_KEYS.has(key));
    if (kept.length) peopleOverrides[id] = Object.fromEntries(kept);
  }
  return {
    ...state,
    peopleOverrides,
    audit: (state.audit ?? []).filter((r) => r.action !== 'perfil.cumpleanos'),
    celebrated: (state.celebrated ?? []).filter((id) => !id.startsWith('trayectoria-')),
  };
}

/** Test final del editor anterior (plantilla «Test» enlazada a una formación). */
interface LegacyTestForm {
  type: 'test';
  formationId?: string;
  title?: string;
  questions?: { id: string; prompt?: string; options?: { id: string; text?: string; feedback?: string }[]; correctOptionId?: string; explanation?: string; ref?: string }[];
}

const isLegacyTest = (form: unknown): form is LegacyTestForm => typeof form === 'object' && form !== null && (form as { type?: string }).type === 'test' && 'formationId' in form;

/** Test final de una formación: 3 preguntas y se supera con 2 (las reglas del test final en Gestión). */
const FINAL_QUIZ = { questions: 3, passMark: 2 };

/** Pregunta en blanco para completar un test final al que le faltan preguntas. */
const blankQuestion = (id: string): QuizQuestion => ({ id, prompt: '', options: ['a', 'b', 'c'].map((o) => ({ id: o, text: '' })), correctOptionId: '', explanation: '' });

function legacyQuiz(form: LegacyTestForm): Quiz {
  const questions: QuizQuestion[] = (form.questions ?? []).map((q) => ({
    id: q.id,
    prompt: q.prompt ?? '',
    options: (q.options ?? []).map((o) => ({ id: o.id, text: o.text ?? '', ...(o.feedback?.trim() ? { feedback: o.feedback } : {}) })),
    correctOptionId: q.correctOptionId ?? '',
    explanation: q.explanation ?? '',
    ...(q.ref?.trim() ? { ref: q.ref } : {}),
  }));
  // Con menos de 3 preguntas no se podría publicar: se completan en blanco. Las que sobren se
  // conservan (se quitan en el editor), para no perder nada.
  for (let n = questions.length + 1; questions.length < FINAL_QUIZ.questions; n++) {
    if (!questions.some((q) => q.id === `p-${n}`)) questions.push(blankQuestion(`p-${n}`));
  }
  return { id: `quiz-${form.formationId || 'sin-formacion'}`, title: form.title?.trim() || 'Test final', passMark: FINAL_QUIZ.passMark, questions };
}

type DraftDataLike = { schema?: number; form?: Record<string, unknown> | null; sourceId?: string; mirrored?: boolean; example?: boolean; [key: string]: unknown };

const dataOf = (d: DraftRecord | undefined) => d?.data as DraftDataLike | undefined;

/** Lo publicado de una lista sin los restos de «Deshacer» ni ids repetidos (cuenta el primero, como al leerla). */
function cleanList<T extends { id: string }>(list: readonly T[] | undefined, undone: ReadonlySet<string>): T[] {
  const seen = new Set<string>();
  return (list ?? []).filter((item) => {
    if (undone.has(item.id) || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * v3: flujo «Guardar borrador» o «Publicar», sin revisión previa, y test final dentro de su formación.
 * - Lo que estaba «en revisión» vuelve a borrador y desaparece el comentario de devolución.
 * - Las formaciones de Gestión que se publicaron o archivaron con el editor anterior nunca llegaron a
 *   Aprender: vuelven a borrador, con su fecha de publicación (ya no se pueden eliminar) y con los
 *   cambios que tuvieran guardados aparte («rev-<id>»), para publicarlas ahora de verdad.
 * - Cada test final del editor anterior (con sus cambios guardados, si los hay) pasa a su formación:
 *   al borrador de la formación o, si es de la semilla, a una revisión suya («rev-<id>») que lo lleva
 *   como test pendiente de revisar. Un test sin formación, cuya formación ya no existe o que llega
 *   después de otro para la misma formación se convierte en el borrador de una formación nueva. Se
 *   completa hasta sus 3 preguntas. No se pierde nada.
 * - «Deshacer» la primera publicación dejaba el contenido en su lista con un cambio de estado a
 *   «borrador» o «en revisión»: se retiran esos restos, que serían filas fantasma en Gestión.
 * - Las fichas anonimizadas con la antigua «Eliminar datos personales» pasan a perfiles eliminados.
 * - Las listas nuevas (formaciones, evaluaciones, clientes, bienvenidas publicadas desde Gestión y
 *   revisiones publicadas) no necesitan paso: el guardado las completa con sus valores iniciales.
 */
function toV3(state: PersistedDemo): PersistedDemo {
  const drafts: Record<string, DraftRecord> = {};
  const legacy: DraftRecord[] = [];
  for (const [id, raw] of Object.entries(state.drafts ?? {})) {
    const { returnComment: _comment, ...draft } = raw as DraftRecord & { returnComment?: string };
    const data = dataOf(draft);
    const unseen = draft.type === 'formacion' && !data?.sourceId && !data?.mirrored && (draft.status === 'publicado' || draft.status === 'archivado');
    const status = (draft.status as string) === 'en-revision' || unseen ? 'borrador' : draft.status;
    const record: DraftRecord = { ...draft, status };
    if (isLegacyTest(data?.form)) legacy.push(record);
    else drafts[id] = record;
  }

  // Una formación en borrador no tiene cambios aparte: su «rev-<id>» se funde con ella (manda lo más reciente).
  for (const own of Object.values(drafts)) {
    const rev = drafts[`rev-${own.id}`];
    const revForm = dataOf(rev)?.form;
    if (own.type !== 'formacion' || own.status !== 'borrador' || dataOf(own)?.sourceId || rev?.type !== 'formacion' || !revForm) continue;
    if (rev.updatedAt > own.updatedAt) drafts[own.id] = { ...own, title: rev.title || own.title, updatedAt: rev.updatedAt, data: { ...dataOf(own), form: revForm } };
    delete drafts[rev.id];
  }

  // Los cambios guardados de un test («rev-<id>») se funden con él (manda lo más reciente).
  const tests = new Map(legacy.filter((t) => !dataOf(t)?.sourceId).map((t) => [t.id, t]));
  for (const rev of legacy.filter((t) => dataOf(t)?.sourceId)) {
    const source = tests.get(dataOf(rev)?.sourceId ?? '');
    if (!source) tests.set(rev.id, rev);
    else if (rev.updatedAt > source.updatedAt) tests.set(source.id, { ...source, title: rev.title || source.title, updatedAt: rev.updatedAt, data: { ...dataOf(source), form: dataOf(rev)?.form } });
  }

  // Cada test pasa a su formación, del más reciente al más antiguo (si había dos para la misma, el segundo no la pisa).
  const inSeed = (id: string) => seed.formations.some((f) => f.id === id);
  const claimed = new Set<string>();
  for (const test of [...tests.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
    const form = dataOf(test)?.form as unknown as LegacyTestForm;
    const quiz = legacyQuiz(form);
    const formationId = form.formationId ?? '';
    const free = !!formationId && !claimed.has(formationId);
    const own = free ? drafts[formationId] : undefined;
    const ownData = dataOf(own);
    if (own && ownData?.form && own.type === 'formacion' && own.status === 'borrador' && !ownData.sourceId) {
      claimed.add(formationId);
      drafts[own.id] = { ...own, updatedAt: test.updatedAt > own.updatedAt ? test.updatedAt : own.updatedAt, data: { ...ownData, form: { ...ownData.form, quiz } } };
      continue;
    }
    if (free && !own && inSeed(formationId)) {
      claimed.add(formationId);
      const revId = `rev-${formationId}`;
      const rev = drafts[revId];
      const revData = dataOf(rev);
      drafts[revId] = rev
        ? { ...rev, data: revData?.form ? { ...revData, form: { ...revData.form, quiz } } : { ...revData, pendingQuiz: quiz } }
        : { id: revId, type: 'formacion', title: test.title, status: 'borrador', authorId: test.authorId, updatedAt: test.updatedAt, revision: 1, data: { schema: 1, sourceId: formationId, form: null, pendingQuiz: quiz } };
      continue;
    }
    // Borrador de una formación nueva: nunca se ha publicado, aunque el test sí lo estuviera.
    const testData = dataOf(test);
    drafts[test.id] = {
      ...test,
      type: 'formacion',
      status: 'borrador',
      title: test.title || 'Formación sin título',
      data: { schema: testData?.schema ?? 1, form: { type: 'formacion', title: '', quiz: { ...quiz, id: 'quiz-sin-formacion' } }, ...(testData?.example ? { example: true } : {}) },
    };
  }

  // Ahora nadie guarda «borrador» ni «en revisión» como cambio de estado (publicar lo quita; archivar y
  // restaurar escriben «archivado» o «publicado»): los que haya son restos de «Deshacer».
  const undone = new Set<string>();
  const statusOverrides: Record<string, EditorialStatus> = {};
  for (const [id, status] of Object.entries(state.statusOverrides ?? {})) {
    if (status === 'borrador' || (status as string) === 'en-revision') undone.add(id);
    else statusOverrides[id] = status;
  }
  const kept = <T>(map: Record<string, T> | undefined): Record<string, T> => Object.fromEntries(Object.entries(map ?? {}).filter(([id]) => !undone.has(id)));

  // La antigua «Eliminar datos personales» anonimizaba la ficha (correo @anonimizada.invalid): ahora es un
  // perfil eliminado, como con «Eliminar el perfil», con la fecha en que se hizo y sin ficha ni sesiones.
  const removedPeople = { ...state.removedPeople };
  const peopleOverrides: Record<string, Partial<Person>> = {};
  const revokedSessions = { ...state.revokedSessions };
  for (const [id, patch] of Object.entries(state.peopleOverrides ?? {})) {
    if (!patch.email?.endsWith('@anonimizada.invalid')) {
      peopleOverrides[id] = patch;
      continue;
    }
    if (!removedPeople[id]) removedPeople[id] = (state.audit ?? []).find((r) => r.action === 'persona.eliminar-datos' && r.entityId === id)?.at ?? now();
    delete revokedSessions[id];
  }

  return {
    ...state,
    drafts,
    statusOverrides,
    extraNews: cleanList(state.extraNews, undone),
    extraDocuments: cleanList(state.extraDocuments, undone),
    extraEvents: cleanList(state.extraEvents, undone),
    eventOverrides: kept(state.eventOverrides),
    documentVersions: kept(state.documentVersions),
    peopleOverrides,
    revokedSessions,
    removedPeople,
  };
}

/**
 * Pone al día lo guardado por una versión anterior sin perder el progreso: aplica, por orden,
 * los pasos que le falten. Lo guardado con la versión actual se devuelve sin tocar.
 */
export function migrateDemo(persisted: unknown, version: number): PersistedDemo {
  let state = (persisted ?? {}) as PersistedDemo;
  if (version >= DEMO_VERSION) return state;
  if (version < 2) state = toV2(state);
  if (version < 3) state = toV3(state);
  return state;
}

export const useDemo = create<DemoState>()(
  persist(
    (set) => ({
      ...initial,
      signIn: (userId) => set({ userId, roleView: null }),
      signOut: () => set({ userId: null, roleView: null }),
      setRoleView: (roleView) => set({ roleView }),
      confirmRead: (formationId, version) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [formationId]: { formationId, attempts: [], ...s.progress[formationId], readAt: now(), readVersion: version },
          },
        })),
      addAttempt: (formationId, attempt) =>
        set((s) => {
          const prev = s.progress[formationId] ?? { formationId, attempts: [] };
          return { progress: { ...s.progress, [formationId]: { ...prev, attempts: [...prev.attempts, attempt] } } };
        }),
      addAssessmentAttempt: (assessmentId, attempt) =>
        set((s) => ({ assessmentAttempts: { ...s.assessmentAttempts, [assessmentId]: [...(s.assessmentAttempts[assessmentId] ?? []), attempt] } })),
      saveDraft: (draft) => set((s) => ({ drafts: { ...s.drafts, [draft.id]: draft } })),
      removeDraft: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.drafts;
          return { drafts: rest };
        }),
      setStatus: (contentId, status) =>
        set((s) => {
          const { [contentId]: _previous, ...rest } = s.statusOverrides;
          return { statusOverrides: status ? { ...rest, [contentId]: status } : rest };
        }),
      setEventOverride: (eventId, patch) =>
        set((s) => {
          const { [eventId]: previous, ...rest } = s.eventOverrides;
          return { eventOverrides: patch ? { ...rest, [eventId]: { ...previous, ...patch } } : rest };
        }),
      addDocumentVersion: (docId, versions) =>
        set((s) => {
          const { [docId]: _previous, ...rest } = s.documentVersions;
          return { documentVersions: versions ? { ...rest, [docId]: versions } : rest };
        }),
      upsertExtra: (list, item) => set((s) => ({ [list]: [item, ...(s[list] as { id: string }[]).filter((x) => x.id !== item.id)] }) as Partial<DemoState>),
      removeExtra: (list, id) => set((s) => ({ [list]: (s[list] as { id: string }[]).filter((x) => x.id !== id) }) as Partial<DemoState>),
      setOverride: (id, item) =>
        set((s) => {
          const { [id]: _previous, ...rest } = s.contentOverrides;
          return { contentOverrides: item ? { ...rest, [id]: item } : rest };
        }),
      patchPerson: (personId, patch) => set((s) => ({ peopleOverrides: { ...s.peopleOverrides, [personId]: { ...s.peopleOverrides[personId], ...patch } } })),
      revokeSessions: (personId) => set((s) => ({ revokedSessions: { ...s.revokedSessions, [personId]: now() } })),
      removePerson: (personId) =>
        set((s) => {
          if (personId === s.userId || s.removedPeople[personId]) return s;
          // Sus cambios de ficha y sus sesiones dejan de existir con el perfil.
          const { [personId]: _ficha, ...peopleOverrides } = s.peopleOverrides;
          const { [personId]: _sesiones, ...revokedSessions } = s.revokedSessions;
          return { removedPeople: { ...s.removedPeople, [personId]: now() }, peopleOverrides, revokedSessions };
        }),
      log: (record) => set((s) => ({ audit: [{ ...record, id: uid(), at: now() }, ...s.audit].slice(0, 500) })),
      pushNotice: (n) => set((s) => ({ notices: [{ ...n, id: uid(), at: now(), read: false }, ...s.notices].slice(0, 50) })),
      markNoticesRead: () => set((s) => ({ notices: s.notices.map((n) => ({ ...n, read: true })) })),
      setSeenIntro: () => set({ seenIntro: true }),
      setTheme: (theme) => set({ theme }),
      setMotion: (motion) => set({ motion }),
      markCelebrated: (badgeId) => set((s) => ({ celebrated: s.celebrated.includes(badgeId) ? s.celebrated : [...s.celebrated, badgeId] })),
      setSingleKeyShortcuts: (singleKeyShortcuts) => set({ singleKeyShortcuts }),
      setArrivalDay: (arrivalDay) => set({ arrivalDay }),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'flm-campus-demo',
      version: DEMO_VERSION,
      storage: safeStorage,
      migrate: migrateDemo,
      partialize: (s): PersistedDemo => {
        const { seenIntro: _seen, ...rest } = s;
        return rest;
      },
    },
  ),
);

export { uid, now };

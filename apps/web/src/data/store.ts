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
import type { AuditRecord, CampusEvent, EditorialStatus, FormationProgress, LibraryDocument, NewsItem, Person, QuizAttempt, Role } from '@flm/shared';

export type ThemePref = 'sistema' | 'claro' | 'oscuro';
export type MotionPref = 'sistema' | 'reducido' | 'completo';

export interface DraftRecord {
  id: string;
  type: 'formacion' | 'test' | 'noticia' | 'documento' | 'evento' | 'comunicado';
  title: string;
  status: EditorialStatus;
  authorId: string;
  updatedAt: string;
  /** Contenido del formulario (estructura según el tipo). */
  data: Record<string, unknown>;
  returnComment?: string;
  revision: number;
}

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
  /** Cambios de estado editorial sobre el contenido semilla (archivar, restaurar…). */
  statusOverrides: Record<string, EditorialStatus>;
  eventOverrides: Record<string, Partial<Pick<CampusEvent, 'archived' | 'manualPhase'>>>;
  extraDocuments: LibraryDocument[];
  documentVersions: Record<string, LibraryDocument['versions']>;
  extraNews: NewsItem[];
  extraEvents: CampusEvent[];
  peopleOverrides: Record<string, Partial<Person>>;
  revokedSessions: Record<string, string>;
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
  setStatus: (contentId: string, status: EditorialStatus) => void;
  setEventOverride: (eventId: string, patch: Partial<Pick<CampusEvent, 'archived' | 'manualPhase'>>) => void;
  addDocument: (doc: LibraryDocument) => void;
  addDocumentVersion: (docId: string, versions: LibraryDocument['versions']) => void;
  addNews: (n: NewsItem) => void;
  addEvent: (e: CampusEvent) => void;
  patchPerson: (personId: string, patch: Partial<Person>) => void;
  revokeSessions: (personId: string) => void;
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
  extraDocuments: [] as LibraryDocument[],
  documentVersions: {} as Record<string, LibraryDocument['versions']>,
  extraNews: [] as NewsItem[],
  extraEvents: [] as CampusEvent[],
  peopleOverrides: {} as Record<string, Partial<Person>>,
  revokedSessions: {} as Record<string, string>,
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

/**
 * Pone al día lo guardado por una versión anterior sin perder el progreso.
 * v2: el campus deja de guardar cumpleaños y fechas de incorporación, y desaparecen los
 * aniversarios en FLM; se borran los que quedaran en este navegador.
 */
export function migrateDemo(persisted: unknown, version: number): PersistedDemo {
  const state = (persisted ?? {}) as PersistedDemo;
  if (version >= 2) return state;
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
      setStatus: (contentId, status) => set((s) => ({ statusOverrides: { ...s.statusOverrides, [contentId]: status } })),
      setEventOverride: (eventId, patch) => set((s) => ({ eventOverrides: { ...s.eventOverrides, [eventId]: { ...s.eventOverrides[eventId], ...patch } } })),
      addDocument: (doc) => set((s) => ({ extraDocuments: [doc, ...s.extraDocuments] })),
      addDocumentVersion: (docId, versions) => set((s) => ({ documentVersions: { ...s.documentVersions, [docId]: versions } })),
      addNews: (n) => set((s) => ({ extraNews: [n, ...s.extraNews] })),
      addEvent: (e) => set((s) => ({ extraEvents: [e, ...s.extraEvents] })),
      patchPerson: (personId, patch) => set((s) => ({ peopleOverrides: { ...s.peopleOverrides, [personId]: { ...s.peopleOverrides[personId], ...patch } } })),
      revokeSessions: (personId) => set((s) => ({ revokedSessions: { ...s.revokedSessions, [personId]: now() } })),
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
      version: 2,
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

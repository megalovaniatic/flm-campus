/**
 * Preferencias de avisos (interfaz). En la demostración se guardan en este navegador;
 * la campana de avisos todavía no las aplica. En la versión interna las guardará la API.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface NoticePrefs {
  agenda: boolean;
  novedades: boolean;
  correo: boolean;
}

interface NoticePrefsState extends NoticePrefs {
  setPref: (key: keyof NoticePrefs, value: boolean) => void;
  resetPrefs: () => void;
}

export const NOTICE_DEFAULTS: NoticePrefs = { agenda: true, novedades: true, correo: false };

const storage = createJSONStorage(() => {
  try {
    const k = '__flm_avisos_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    const mem = new Map<string, string>();
    return { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
  }
});

export const useNoticePrefs = create<NoticePrefsState>()(
  persist(
    (set) => ({
      ...NOTICE_DEFAULTS,
      setPref: (key, value) => set({ [key]: value } as Partial<NoticePrefs>),
      resetPrefs: () => set({ ...NOTICE_DEFAULTS }),
    }),
    {
      name: 'flm-campus-avisos',
      version: 2,
      storage,
      // La versión 1 guardaba también el aviso de formaciones obligatorias, que ya no existen
      migrate: (persisted) => {
        const { obligatorias: _retirada, ...rest } = (persisted ?? {}) as Partial<NoticePrefs> & { obligatorias?: boolean };
        return { ...NOTICE_DEFAULTS, ...rest } as NoticePrefsState;
      },
    },
  ),
);

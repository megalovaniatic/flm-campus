import { BookOpen, CalendarDays, CornerDownLeft, FileText, Library, Newspaper, Search, Signpost, UserRound } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { Kbd } from '@/design';
import { useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { search, type ResultGroup } from './searchIndex';
import { useSearch } from './useSearch';
import styles from './CommandPalette.module.css';

const ICONS: Record<ResultGroup, typeof Search> = {
  Formaciones: BookOpen,
  Actualidad: Newspaper,
  'Notas informativas': FileText,
  Lecturas: Library,
  Agenda: CalendarDays,
  Personas: UserRound,
  Secciones: Signpost,
};

const SUGGESTIONS = ['Verifactu', 'despido', 'cuentas anuales', 'BOICAC', 'calendario', 'desayuno'];

/** Búsqueda y mando global: Ctrl/⌘ K, «/» (desactivable) o el botón «Buscar». */
export function CommandPalette() {
  const { isOpen, open, close } = useSearch();
  const singleKey = useDemo((s) => s.singleKeyShortcuts);
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  /** Elemento con el foco antes de abrir: al cerrar, el foco vuelve a él. */
  const opener = useRef<HTMLElement | null>(null);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const results = useMemo(() => search(q), [q]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open();
      } else if (singleKey && e.key === '/' && !typing) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, singleKey]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (isOpen && !d.open) {
      opener.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
      d.showModal();
      setQ('');
      setActive(0);
      input.current?.focus();
    } else if (!isOpen && d.open) {
      d.close();
      // Si el diálogo no ha devuelto el foco (p. ej., al abrirlo con Ctrl K), se devuelve a mano.
      const back = opener.current;
      opener.current = null;
      if (back?.isConnected && (document.activeElement === document.body || document.activeElement === null)) back.focus();
    }
  }, [isOpen]);

  useEffect(() => setActive(0), [q]);

  const go = (href: string) => {
    close();
    navigate(href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]!.href);
    } else if (e.key === 'Escape') {
      // En un campo de búsqueda, Esc solo borraba el texto: como indica la ayuda, cierra a la primera.
      e.preventDefault();
      close();
    }
  };

  let lastGroup: string | null = null;

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Buscar en el campus"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.field}>
          <Search size={20} aria-hidden="true" className={styles.searchIcon} />
          <input
            ref={input}
            className={styles.input}
            type="search"
            placeholder="Busca formaciones, notas, novedades, eventos o personas…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Buscar en el campus"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className={styles.esc} onClick={close}>
            Esc
          </button>
        </div>

        <div className={styles.body}>
          {!q && (
            <div className={styles.suggest}>
              <p className={styles.groupLabel}>Prueba con</p>
              <div className={styles.chips}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" className={styles.chip} onClick={() => setQ(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {q && results.length === 0 && (
            <div className={styles.empty} role="status">
              <p className={styles.emptyTitle}>{MESSAGES.emptySearch.title}</p>
              <p>{MESSAGES.emptySearch.body(q)}</p>
            </div>
          )}
          {results.length > 0 && (
            <ul id={listId} role="listbox" aria-label="Resultados" className={styles.list}>
              {results.map((r, i) => {
                const Icon = ICONS[r.group];
                const header = r.group !== lastGroup ? r.group : null;
                lastGroup = r.group;
                return (
                  <li key={`${r.group}-${r.id}`} role="presentation">
                    {header && (
                      <p className={styles.groupLabel} aria-hidden="true">
                        {header}
                      </p>
                    )}
                    <div
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      className={styles.option}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(r.href)}
                    >
                      <span className={styles.optIcon} aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      <span className={styles.optText}>
                        <span className={styles.optTitle}>{r.title}</span>
                        <span className={styles.optSub}>
                          {r.group} · {r.subtitle}
                        </span>
                      </span>
                      {i === active && <CornerDownLeft size={16} aria-hidden="true" className={styles.enter} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p className={styles.hints} aria-hidden="true">
          <span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> moverte
          </span>
          <span>
            <Kbd>Intro</Kbd> abrir
          </span>
          <span>
            <Kbd>Esc</Kbd> cerrar
          </span>
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {q && results.length > 0 ? `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}` : ''}
        </p>
      </div>
    </dialog>
  );
}

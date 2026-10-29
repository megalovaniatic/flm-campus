import { Moon, Sun, SunMoon } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/design';
import { useDemo, type MotionPref, type ThemePref } from '@/data/store';
import { usePageTitle } from '@/lib/preferences';
import { EXAMPLES } from './examples';
import { Widget } from './index';
import { Segmented } from './ui';
import styles from './Gallery.module.css';

/** Galería de desarrollo de los apoyos visuales (solo en desarrollo: /#/dev/widgets). */
export default function Gallery() {
  usePageTitle('Galería de apoyos visuales');
  const theme = useDemo((s) => s.theme);
  const setTheme = useDemo((s) => s.setTheme);
  const motionPref = useDemo((s) => s.motion);
  const setMotion = useDemo((s) => s.setMotion);
  const kinds = new Set(EXAMPLES.map((e) => e.spec.kind)).size;
  // «?solo=recargo» muestra un único ejemplo (útil para capturas y pruebas).
  const [params] = useSearchParams();
  const solo = params.get('solo');
  const shown = solo ? EXAMPLES.filter((e) => e.id === solo) : EXAMPLES;

  const go = (id: string) => {
    const el = document.getElementById(`ejemplo-${id}`);
    el?.scrollIntoView({ block: 'start' });
    el?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  };

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Inicio', to: '/' }, { label: 'Aprender', to: '/aprender' }, { label: 'Galería de apoyos visuales' }]}
        eyebrow="Solo en desarrollo"
        title="Galería de apoyos visuales"
        lede="Un ejemplo de cada tipo, con datos de los informes verificados a 28/10/2026. Sirve para revisar diseño, accesibilidad y movimiento antes de incluirlos en una formación."
        aside={
          <p className={styles.count}>
            <strong>{kinds}</strong> tipos · <strong>{EXAMPLES.length}</strong> ejemplos
          </p>
        }
      />

      <div className={styles.toolbar}>
        <Segmented<ThemePref>
          legend="Tema"
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'sistema', label: 'Sistema', icon: <SunMoon /> },
            { value: 'claro', label: 'Claro', icon: <Sun /> },
            { value: 'oscuro', label: 'Oscuro', icon: <Moon /> },
          ]}
        />
        <Segmented<MotionPref>
          legend="Movimiento"
          value={motionPref}
          onChange={setMotion}
          options={[
            { value: 'sistema', label: 'Sistema' },
            { value: 'completo', label: 'Completo' },
            { value: 'reducido', label: 'Reducido' },
          ]}
        />
        <p className={styles.toolbarNote}>Cambia las preferencias del campus en este navegador.</p>
      </div>

      <div className={styles.layout}>
        <nav className={styles.index} aria-label="Ejemplos de la galería">
          <p className={styles.indexTitle}>Ejemplos</p>
          <ol role="list">
            {EXAMPLES.map((e) => (
              <li key={e.id}>
                <button type="button" className={styles.indexLink} onClick={() => go(e.id)}>
                  {e.name}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.examples}>
          {shown.map((e) => (
            <section key={e.id} id={`ejemplo-${e.id}`} className={styles.example} aria-labelledby={`h-${e.id}`}>
              <header className={styles.exampleHead}>
                <h2 id={`h-${e.id}`} tabIndex={-1} className={styles.exampleTitle}>
                  {e.name}
                </h2>
                <p className={styles.exampleMeta}>
                  <code className={styles.code}>{e.spec.kind}</code> · {e.source}
                </p>
              </header>
              <Widget spec={e.spec} headingLevel={3} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

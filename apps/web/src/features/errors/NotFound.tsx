import { motion } from 'motion/react';
import { ArrowRight, BookOpen, House, Info, Library, Search, UserRound, Users, type LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { normalize } from '@flm/shared';
import { Button, ButtonLink, Kbd } from '@/design';
import { useDemo } from '@/data/store';
import { Logo } from '@/layout/Logo';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { useSearch } from '@/features/search/useSearch';
import styles from './NotFound.module.css';

interface Destination {
  to: string;
  slug: string;
  label: string;
  text: string;
  icon: LucideIcon;
}

const DESTINATIONS: Destination[] = [
  { to: '/aprender', slug: 'aprender', label: 'Aprender', text: 'Formaciones de Fiscal, Laboral, Mercantil y Contable, con test final.', icon: BookOpen },
  { to: '/consultar', slug: 'consultar', label: 'Consultar', text: 'Actualidad en tu sector, notas informativas y lecturas recomendadas.', icon: Library },
  { to: '/participar', slug: 'participar', label: 'Participar', text: 'Agenda, calendario y propuestas para el equipo.', icon: Users },
  { to: '/perfil', slug: 'perfil', label: 'Mi perfil', text: 'Tu progreso, tus reconocimientos y tus ajustes.', icon: UserRound },
  { to: '/sobre', slug: 'sobre', label: 'Sobre el campus', text: 'Concepto, marca, accesibilidad y privacidad.', icon: Info },
];

/** Distancia de edición (para sugerir la sección que probablemente se buscaba). */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length]!;
}

function guess(pathname: string): Destination | undefined {
  const first = normalize(pathname.split('/').filter(Boolean)[0] ?? '');
  if (!first) return undefined;
  const scored = DESTINATIONS.map((d) => ({ d, score: d.slug.startsWith(first) || first.startsWith(d.slug) ? 0 : distance(first, d.slug) })).sort((x, y) => x.score - y.score);
  const best = scored[0];
  return best && best.score <= 3 ? best.d : undefined;
}

/** Página no encontrada: qué ha pasado, qué puedes hacer y por dónde seguir. */
export default function NotFound() {
  usePageTitle('Página no encontrada');
  const { pathname } = useLocation();
  const openSearch = useSearch((s) => s.open);
  const singleKey = useDemo((s) => s.singleKeyShortcuts);
  const suggestion = guess(pathname);

  return (
    <div className={`container page ${styles.page}`}>
      <section className={styles.hero} aria-labelledby="h-404">
        <motion.div className={styles.logo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <Logo variant="diagonal" height={80} decorative />
        </motion.div>
        <motion.div className={styles.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <p className="eyebrow">Error 404 · página no encontrada</p>
          <h1 id="h-404" className={styles.title}>
            {MESSAGES.notFound.title}
          </h1>
          <p className={styles.body}>{MESSAGES.notFound.body}</p>
          <p className={styles.path}>
            Dirección solicitada: <code>{pathname}</code>
          </p>
          {suggestion && (
            <p className={styles.suggest}>
              ¿Buscabas{' '}
              <Link to={suggestion.to} className={styles.suggestLink}>
                {suggestion.label}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              ?
            </p>
          )}
          <div className={styles.actions}>
            <Button icon={<Search />} onClick={openSearch}>
              Buscar en el campus
            </Button>
            <ButtonLink to="/" variant="secondary" icon={<House />}>
              Volver al inicio
            </ButtonLink>
          </div>
          <p className={styles.keys}>
            También puedes abrir la búsqueda con <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
            {singleKey && (
              <>
                {' '}
                o con <Kbd>/</Kbd>
              </>
            )}
            .
          </p>
        </motion.div>
      </section>

      <nav aria-labelledby="h-secciones" className={styles.sections}>
        <h2 id="h-secciones" className={styles.sectionsTitle}>
          O ve directamente a una sección
        </h2>
        <ul role="list" className={styles.grid}>
          {DESTINATIONS.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.li key={d.to} className={styles.card} data-suggested={suggestion?.to === d.to || undefined} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, delay: 0.18 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span className={styles.cardText}>
                  <Link to={d.to} className={styles.stretch}>
                    {d.label}
                  </Link>
                  <span className={styles.cardSub}>{d.text}</span>
                </span>
                <ArrowRight size={18} aria-hidden="true" className={styles.arrow} />
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

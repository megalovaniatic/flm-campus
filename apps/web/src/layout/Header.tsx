import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Kbd } from '@/design';
import { useSearch } from '@/features/search/useSearch';
import { Logo } from './Logo';
import { NAV } from './nav';
import { NoticesButton } from './NoticesButton';
import { UserMenu } from './UserMenu';
import styles from './Header.module.css';

export function Header() {
  const { pathname } = useLocation();
  const open = useSearch((s) => s.open);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label="FLM Campus, ir al inicio">
          <Logo height={30} decorative />
          <span className={styles.rule} aria-hidden="true" />
          <span className={styles.campus} aria-hidden="true">
            Campus
          </span>
        </Link>

        <nav aria-label="Principal" className={styles.nav}>
          <ul role="list" className={styles.navList}>
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.to}>
                  <Link to={item.to} className={styles.navLink} aria-current={active ? 'page' : undefined}>
                    {item.label}
                    {active && <motion.span layoutId="nav-dot" className={styles.dot} transition={{ type: 'spring', stiffness: 520, damping: 34 }} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.tools}>
          <button type="button" className={styles.search} onClick={open} aria-label="Buscar en el campus (Control más K)">
            <Search size={17} aria-hidden="true" />
            <span className={styles.searchLabel}>Buscar</span>
            <span className={styles.searchKeys} aria-hidden="true">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
          <NoticesButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

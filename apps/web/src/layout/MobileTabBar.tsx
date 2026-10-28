import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { Avatar } from '@/design';
import { useMe } from '@/data/selectors';
import { NAV } from './nav';
import styles from './MobileTabBar.module.css';

const base = import.meta.env.BASE_URL;

/** Navegación inferior en móvil: la pestaña activa es un círculo marino. */
export function MobileTabBar() {
  const { pathname } = useLocation();
  const me = useMe();
  const profileActive = pathname.startsWith('/perfil');
  return (
    <nav className={styles.bar} aria-label="Principal (móvil)">
      <ul role="list" className={styles.list}>
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link to={item.to} className={styles.tab} aria-current={active ? 'page' : undefined}>
                <span className={styles.iconWrap}>
                  {active && <motion.span layoutId="tab-circle" className={styles.circle} transition={{ type: 'spring', stiffness: 520, damping: 36 }} />}
                  <Icon size={21} aria-hidden="true" className={styles.icon} />
                </span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link to="/perfil" className={styles.tab} aria-current={profileActive ? 'page' : undefined}>
            <span className={styles.iconWrap}>
              {profileActive && <motion.span layoutId="tab-circle" className={styles.circle} transition={{ type: 'spring', stiffness: 520, damping: 36 }} />}
              {me && <Avatar name={me.name} photo={me.photo ? base + me.photo : undefined} size={26} decorative />}
            </span>
            <span className={styles.label}>Perfil</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

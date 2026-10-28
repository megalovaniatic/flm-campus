import { Link } from 'react-router';
import { Logo } from './Logo';
import styles from './Footer.module.css';

const OFFICES = [
  { city: 'Barcelona', line: 'C/ Bailèn, 71 bis, 2º · 08009 Barcelona', phone: '932 657 461' },
  { city: 'Vic', line: 'C/ de Figueres, 12, Pol. Sot del Pradals · 08500 Vic', phone: '938 863 044' },
  { city: 'Granollers', line: 'C/ Girona, 15-17 · 08402 Granollers', phone: '938 792 359' },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo variant="crowe" height={34} />
          <p className={styles.motto}>
            Lo que sabe uno, lo sabemos todos<span className="red-dot" aria-hidden="true" />
          </p>
        </div>
        <ul role="list" className={styles.offices} aria-label="Sedes de FLM">
          {OFFICES.map((o) => (
            <li key={o.city}>
              <p className={styles.city}>{o.city}</p>
              <p className={styles.line}>{o.line}</p>
              <p className={styles.line}>
                <a href={`tel:+34${o.phone.replace(/\s/g, '')}`}>{o.phone}</a>
              </p>
            </li>
          ))}
        </ul>
        <div className={styles.bottom}>
          <nav aria-label="Información del campus">
            <ul role="list" className={styles.links}>
              <li>
                <Link to="/sobre">Sobre el campus</Link>
              </li>
              <li>
                <Link to="/sobre#accesibilidad">Accesibilidad</Link>
              </li>
              <li>
                <Link to="/sobre#privacidad">Privacidad y datos</Link>
              </li>
              <li>
                <a href="https://flmexperts.com/" target="_blank" rel="noreferrer">
                  flmexperts.com
                </a>
              </li>
            </ul>
          </nav>
          <p className={styles.note}>
            {__DEMO__ ? 'Demostración pública con datos de ejemplo. ' : ''}FLM Campus · uso interno · {__BUILD_DATE__.slice(0, 4)}
          </p>
        </div>
      </div>
    </footer>
  );
}

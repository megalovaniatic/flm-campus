import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { participation } from '@flm/content';
import { InstagramGlyph, LinkedInGlyph } from '@/design';
import { Logo } from './Logo';
import styles from './Footer.module.css';

/** Redes oficiales de FLM con enlace directo desde el pie: LinkedIn e Instagram, cada una con su glifo. */
const GLYPH: Record<string, ReactNode> = {
  linkedin: <LinkedInGlyph size={18} />,
  instagram: <InstagramGlyph size={18} />,
};
const SOCIAL = participation.social.filter((s) => s.id in GLYPH);

export function Footer() {
  const year = __BUILD_DATE__.slice(0, 4);
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Logo variant="crowe" height={34} />
          <p className={styles.motto}>
            Aprender juntos para asesorar mejor<span className="red-dot" aria-hidden="true" />
          </p>
        </div>
        <div className={styles.follow}>
          <p id="pie-redes" className={styles.followLabel}>
            Síguenos
          </p>
          <ul role="list" className={styles.social} aria-labelledby="pie-redes">
            {SOCIAL.map((s) => (
              <li key={s.id}>
                <a className={styles.socialLink} href={s.url} target="_blank" rel="noreferrer">
                  <span className={styles.socialGlyph} aria-hidden="true">
                    {GLYPH[s.id]}
                  </span>
                  {s.label}
                  <span className="sr-only"> de FLM (se abre en una pestaña nueva)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.bottom}>
          <p className={styles.legal}>
            © {year} FLM. Todos los derechos reservados. Las formaciones, notas informativas y demás materiales elaborados por FLM para el campus son propiedad intelectual de FLM y de uso exclusivamente interno: no pueden copiarse, extraerse, distribuirse ni difundirse fuera de la firma sin su autorización expresa. Los documentos, publicaciones, fotografías y fuentes de terceros conservan sus propios derechos.
          </p>
          <div className={styles.meta}>
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
                    flmexperts.com<span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                </li>
              </ul>
            </nav>
            <p className={styles.note}>
              {__DEMO__ ? 'Demostración pública con datos de ejemplo. ' : ''}FLM Campus · uso interno · {year}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { FlaskConical, RotateCcw } from 'lucide-react';
import { ROLE_LABEL } from '@flm/shared';
import { useMe } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { toast } from '@/design';
import styles from './DemoBand.module.css';

/** Banda fija que identifica la demostración pública y el perfil con el que se ve. */
export function DemoBand() {
  const me = useMe();
  const reset = useDemo((s) => s.reset);
  return (
    <div className={styles.band} role="note">
      <div className={`container ${styles.inner}`}>
        <span className={styles.label}>
          <FlaskConical size={14} aria-hidden="true" />
          <strong>Demostración pública</strong>
          <span className={styles.hide}> · datos de ejemplo · lo que hagas se guarda solo en este navegador</span>
        </span>
        <span className={styles.right}>
          {me && <span className={styles.role}>Viendo como {ROLE_LABEL[me.effectiveRole].toLowerCase()}</span>}
          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              reset();
              toast.success('Demostración restablecida', 'Se han borrado tu progreso y los cambios de esta demo.');
            }}
          >
            <RotateCcw size={13} aria-hidden="true" /> Restablecer
          </button>
        </span>
      </div>
    </div>
  );
}

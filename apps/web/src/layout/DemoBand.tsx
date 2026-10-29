import { FlaskConical, RotateCcw } from 'lucide-react';
import { ROLE_LABEL } from '@flm/shared';
import { useMe } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { toast, useToasts } from '@/design/Toast';
import styles from './DemoBand.module.css';

/**
 * «Restablecer» la demostración: borra lo guardado en este navegador y cierra los avisos abiertos,
 * porque su «Deshacer» devolvería lo que se acaba de borrar.
 */
export function resetDemo() {
  useDemo.getState().reset();
  useToasts.getState().clear();
}

/** Banda fija que identifica la demostración pública y el perfil con el que se ve. */
export function DemoBand() {
  const me = useMe();
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
              resetDemo();
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

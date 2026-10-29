import { FlaskConical } from 'lucide-react';
import { Notice } from '@/design';
import lib from '../Library.module.css';

/** Aviso visible cuando se revisa el diseño con contenido de muestra (solo en desarrollo). */
export function SampleNotice() {
  return (
    <div className={lib.sampleNotice}>
      <Notice tone="warning" title="Contenido de muestra · solo en desarrollo" icon={<FlaskConical size={18} />}>
        Estás viendo novedades y lecturas de muestra para revisar el diseño. No han pasado la revisión editorial y nunca se publican. Quita <code>?muestra=1</code> de la dirección para ocultarlas.
      </Notice>
    </div>
  );
}

/** Pista para el equipo: cómo revisar el diseño mientras la sección está vacía. */
export function DevSampleHint() {
  if (!import.meta.env.DEV) return null;
  return (
    <p className={lib.devHint}>
      Desarrollo: para revisar el diseño con contenido de muestra, abre <a href={`?muestra=1${window.location.hash}`}>esta misma página con ?muestra=1</a>.
    </p>
  );
}

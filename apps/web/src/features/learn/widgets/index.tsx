import type { WidgetSpec } from '@flm/shared';

/**
 * Registro de apoyos visuales interactivos de las formaciones.
 * Contrato: <Widget spec={…} /> renderiza el componente adecuado según spec.kind.
 * (Lo completa el equipo de widgets; este stub permite compilar mientras tanto.)
 */
export function Widget({ spec }: { spec: WidgetSpec }) {
  return (
    <div className="card" style={{ padding: 'var(--space-6)' }}>
      <p className="meta">Apoyo visual «{spec.kind}» en preparación.</p>
    </div>
  );
}

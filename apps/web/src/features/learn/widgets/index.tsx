import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { WidgetSpec } from '@flm/shared';
import { Notice } from '@/design';
import { Amortizacion } from './Amortizacion';
import { ArbolDecision } from './ArbolDecision';
import { CalendarioCuentas } from './CalendarioCuentas';
import { Clasificador } from './Clasificador';
import { Comparativa } from './Comparativa';
import { CuentasT } from './CuentasT';
import { Despido } from './Despido';
import { Disolucion } from './Disolucion';
import { Grafico } from './Grafico';
import { LineaTiempo } from './LineaTiempo';
import { Periodificacion } from './Periodificacion';
import { Recargo } from './Recargo';
import { TarjetasVerdad } from './TarjetasVerdad';

export interface WidgetProps {
  spec: WidgetSpec;
  /** Nivel del título del apoyo (por defecto h3, bajo los h2 de la formación). */
  headingLevel?: 2 | 3 | 4;
}

/**
 * Registro de apoyos visuales interactivos de las formaciones.
 * Contrato: <Widget spec={…} /> renderiza el componente adecuado según spec.kind.
 * Cada apoyo es autónomo (estado local), accesible con teclado y respeta el movimiento reducido.
 */
export function Widget({ spec, headingLevel = 3 }: WidgetProps) {
  return (
    <WidgetBoundary kind={spec.kind}>
      <WidgetSwitch spec={spec} headingLevel={headingLevel} />
    </WidgetBoundary>
  );
}

function WidgetSwitch({ spec, headingLevel }: Required<WidgetProps>) {
  switch (spec.kind) {
    case 'recargo-extemporaneo':
      return <Recargo spec={spec} headingLevel={headingLevel} />;
    case 'indemnizacion-despido':
      return <Despido spec={spec} headingLevel={headingLevel} />;
    case 'disolucion-perdidas':
      return <Disolucion spec={spec} headingLevel={headingLevel} />;
    case 'calendario-cuentas':
      return <CalendarioCuentas spec={spec} headingLevel={headingLevel} />;
    case 'amortizacion':
      return <Amortizacion spec={spec} headingLevel={headingLevel} />;
    case 'periodificacion':
      return <Periodificacion spec={spec} headingLevel={headingLevel} />;
    case 'cuentas-t':
      return <CuentasT spec={spec} headingLevel={headingLevel} />;
    case 'arbol-decision':
      return <ArbolDecision spec={spec} headingLevel={headingLevel} />;
    case 'linea-tiempo':
      return <LineaTiempo spec={spec} headingLevel={headingLevel} />;
    case 'tarjetas-verdad':
      return <TarjetasVerdad spec={spec} headingLevel={headingLevel} />;
    case 'comparativa':
      return <Comparativa spec={spec} headingLevel={headingLevel} />;
    case 'clasificador':
      return <Clasificador spec={spec} headingLevel={headingLevel} />;
    case 'grafico':
      return <Grafico spec={spec} headingLevel={headingLevel} />;
    default: {
      const unknown: never = spec;
      return <WidgetFallback kind={(unknown as { kind?: string }).kind ?? 'desconocido'} />;
    }
  }
}

function WidgetFallback({ kind }: { kind: string }) {
  return (
    <Notice tone="warning" title="Este apoyo visual no se ha podido mostrar">
      El resto de la formación sigue disponible. {import.meta.env.DEV ? `(Tipo «${kind}».)` : 'Si el problema continúa, avisa al equipo del campus.'}
    </Notice>
  );
}

/** Si un apoyo falla (por ejemplo, por datos incompletos), la formación sigue funcionando. */
class WidgetBoundary extends Component<{ kind: string; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(`Apoyo visual «${this.props.kind}»:`, error, info.componentStack);
  }

  override render() {
    return this.state.failed ? <WidgetFallback kind={this.props.kind} /> : this.props.children;
  }
}

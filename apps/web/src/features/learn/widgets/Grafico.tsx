import { euros, type ChartSpec, type WidgetSpec } from '@flm/shared';
import { Notice } from '@/design';
import { Chart } from './Chart';
import { formatPct } from './calc';
import { Frame } from './ui';

type Spec = Extract<WidgetSpec, { kind: 'grafico' }>;

const KIND: Record<ChartSpec['type'], string> = { barras: 'Gráfico de barras', lineas: 'Gráfico de líneas', escalones: 'Gráfico en escalones' };

const plain = (n: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(n);

/** Formato de valores según la unidad del gráfico («€», «%» u otra). */
export function formatterFor(unit?: string): { value: (n: number) => string; tick: (n: number) => string } {
  const u = (unit ?? '').trim();
  if (u === '€' || /^euros?$/i.test(u)) return { value: (n) => euros(n), tick: (n) => euros(n, 0) };
  if (u === '%') return { value: (n) => formatPct(n, 2), tick: (n) => formatPct(n, 2) };
  const suffix = u ? ` ${u}` : '';
  return { value: (n) => `${plain(n)}${suffix}`, tick: (n) => `${plain(n)}${suffix}` };
}

export function Grafico({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const { chart } = spec;
  const f = formatterFor(chart.unit);
  const empty = chart.series.every((s) => s.values.length === 0);
  return (
    <Frame kind={KIND[chart.type]} title={chart.title} headingLevel={headingLevel}>
      {empty ? (
        <Notice tone="warning">Este gráfico todavía no tiene datos.</Notice>
      ) : (
        <Chart type={chart.type} title={chart.title} series={chart.series.slice(0, 4)} xLabel={chart.xLabel} yLabel={chart.yLabel} formatValue={f.value} formatTick={f.tick} />
      )}
    </Frame>
  );
}

import { CircleCheck, TriangleAlert } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { euros, normalize, slugify, type ChartSpec, type DecisionNode, type JournalEntry, type TimelineItem, type WidgetSpec } from '@flm/shared';
import { SelectField, TextArea, TextField } from '@/design';
import { AddButton, ItemTools, move } from './fields';
import styles from './Editor.module.css';

type Of<K extends WidgetSpec['kind']> = Extract<WidgetSpec, { kind: K }>;

/* ── Campos básicos ───────────────────────────────────────────────────── */

const numText = (v: number | undefined) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : '');

function Num({ label, value, onChange, hint, optional, step = 'any' }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; hint?: string; optional?: boolean; step?: string }) {
  return (
    <TextField
      label={optional ? `${label} (opcional)` : label}
      type="number"
      inputMode="decimal"
      step={step}
      value={numText(value)}
      onChange={(e) => onChange(e.target.value === '' ? (optional ? undefined : Number.NaN) : Number(e.target.value))}
      hint={hint}
    />
  );
}

function DateInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return <TextField label={label} type="date" value={value} onChange={(e) => onChange(e.target.value)} hint={hint} />;
}

function Text({ label, value, onChange, hint, optional }: { label: string; value: string | undefined; onChange: (v: string) => void; hint?: string; optional?: boolean }) {
  return <TextField label={optional ? `${label} (opcional)` : label} value={value ?? ''} onChange={(e) => onChange(e.target.value)} hint={hint} />;
}

const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * Lista repetible de elementos de un apoyo (sin identificadores propios: se ordenan por posición).
 * `duplicate` ajusta la copia (un paso del árbol necesita otro identificador) y `remove` sustituye al
 * borrado normal cuando quitar un elemento afecta a otros datos del apoyo.
 */
function Items<T>({
  items,
  onChange,
  render,
  make,
  name,
  min = 0,
  add,
  duplicate = copy,
  remove,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, set: (next: T) => void, i: number) => ReactNode;
  make: () => T;
  name: (i: number) => string;
  min?: number;
  add: string;
  duplicate?: (item: T) => T;
  remove?: (i: number) => void;
}) {
  return (
    <div className={styles.stack}>
      <ol role="list" className={styles.items}>
        {items.map((item, i) => (
          <li key={i} className={styles.itemCard}>
            <div className={styles.itemHead}>
              <span className={styles.itemTitle}>{name(i)}</span>
              <ItemTools
                label={name(i).toLowerCase()}
                index={i}
                count={items.length}
                min={min}
                onMove={(to) => onChange(move(items, i, to))}
                onDuplicate={() => onChange([...items.slice(0, i + 1), duplicate(item), ...items.slice(i + 1)])}
                onRemove={() => (remove ? remove(i) : onChange(items.filter((_, j) => j !== i)))}
              />
            </div>
            {render(item, (next) => onChange(items.map((x, j) => (j === i ? next : x))), i)}
          </li>
        ))}
      </ol>
      <AddButton onClick={() => onChange([...items, make()])}>{add}</AddButton>
    </div>
  );
}

/** Cambio en una lista de textos: lo usan las columnas y categorías para mantener alineados sus datos. */
export type WordsOp = { kind: 'edit'; index: number; before: string } | { kind: 'move'; from: number; to: number } | { kind: 'remove'; index: number } | { kind: 'add' };

/** Aplica a una lista paralela (valores por columna) el mismo cambio que a la lista de textos. */
function follow<T>(list: T[], op: WordsOp, fill: T): T[] {
  switch (op.kind) {
    case 'move':
      return move(list, op.from, op.to);
    case 'remove':
      return list.filter((_, i) => i !== op.index);
    case 'add':
      return [...list, fill];
    default:
      return list;
  }
}

/** Lista de textos cortos (categorías, columnas…). */
function Words({ legend, values, onChange, min, add, label }: { legend: string; values: string[]; onChange: (v: string[], op: WordsOp) => void; min: number; add: string; label: (i: number) => string }) {
  return (
    <fieldset className={styles.subfields}>
      <legend className={styles.legend}>{legend}</legend>
      <ol role="list" className={styles.items}>
        {values.map((v, i) => (
          <li key={i} className={styles.inlineItem}>
            <div className={styles.grow}>
              <TextField label={label(i)} value={v} onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)), { kind: 'edit', index: i, before: v })} />
            </div>
            <ItemTools label={label(i).toLowerCase()} index={i} count={values.length} min={min} onMove={(to) => onChange(move(values, i, to), { kind: 'move', from: i, to })} onRemove={() => onChange(values.filter((_, j) => j !== i), { kind: 'remove', index: i })} />
          </li>
        ))}
      </ol>
      <AddButton onClick={() => onChange([...values, ''], { kind: 'add' })}>{add}</AddButton>
    </fieldset>
  );
}

/**
 * Comparativa tras cambiar las columnas que se comparan (todas menos la primera, que rotula las filas):
 * los valores de cada fila se mueven, se quitan o se añaden con su columna.
 */
export function compareColumns(spec: Of<'comparativa'>, compared: string[], op: WordsOp): Of<'comparativa'> {
  return {
    ...spec,
    columns: [spec.columns[0] ?? '', ...compared],
    rows: spec.rows.map((r) => {
      const values = follow(r.values, op, '');
      return { ...r, values: compared.map((_, k) => values[k] ?? '') };
    }),
  };
}

/**
 * Clasificador tras cambiar las categorías. Si una cambia de nombre, sus elementos la siguen teniendo como
 * respuesta; si se quita, se quedan sin respuesta (hay que elegir otra) en lugar de apuntar a una categoría
 * que ya no existe y que nadie podría acertar.
 */
export function classifierCategories(spec: Of<'clasificador'>, categories: string[], op: WordsOp): Of<'clasificador'> {
  const from = op.kind === 'edit' ? op.before : op.kind === 'remove' ? spec.categories[op.index] : undefined;
  const to = op.kind === 'edit' ? (categories[op.index] ?? '') : '';
  // Una categoría vacía no es la respuesta de nadie; y si la quitada sigue en la lista (estaba repetida), nada cambia.
  const relink = !!from && !(op.kind === 'remove' && categories.includes(from));
  return { ...spec, categories, items: relink ? spec.items.map((it) => (it.answer === from ? { ...it, answer: to } : it)) : spec.items };
}

/* ── Apoyos con importes y fechas ─────────────────────────────────────── */

function CuentasT({ spec, set }: { spec: Of<'cuentas-t'>; set: (s: Of<'cuentas-t'>) => void }) {
  const newEntry = (): JournalEntry => ({ concept: '', lines: [{ account: '', name: '', debit: 0 }, { account: '', name: '', credit: 0 }] });
  return (
    <>
      <Text label="Título" optional value={spec.title} onChange={(title) => set({ ...spec, title: title || undefined })} />
      <Items
        items={spec.entries}
        onChange={(entries) => set({ ...spec, entries })}
        make={newEntry}
        min={1}
        name={(i) => `Asiento ${i + 1}`}
        add="Añadir asiento"
        render={(entry, setEntry) => {
          const debit = entry.lines.reduce((s, l) => s + (l.debit ?? 0), 0);
          const credit = entry.lines.reduce((s, l) => s + (l.credit ?? 0), 0);
          const balanced = Math.abs(debit - credit) < 0.005;
          return (
            <>
              <div className={styles.grid2}>
                <Text label="Concepto" value={entry.concept} onChange={(concept) => setEntry({ ...entry, concept })} />
                <DateInput label="Fecha (opcional)" value={entry.date ?? ''} onChange={(date) => setEntry({ ...entry, ...(date ? { date } : { date: undefined }) })} />
              </div>
              <Items<JournalEntry['lines'][number]>
                items={entry.lines}
                onChange={(lines) => setEntry({ ...entry, lines })}
                make={() => ({ account: '', name: '' })}
                min={2}
                name={(i) => `Línea ${i + 1}`}
                add="Añadir línea"
                render={(line, setLine) => (
                  <div className={styles.grid4}>
                    <Text label="Cuenta" value={line.account} onChange={(account) => setLine({ ...line, account })} hint="p. ej., 625" />
                    <Text label="Nombre" value={line.name} onChange={(name) => setLine({ ...line, name })} />
                    <Num label="Debe" optional value={line.debit} onChange={(debit) => setLine({ ...line, debit })} />
                    <Num label="Haber" optional value={line.credit} onChange={(credit) => setLine({ ...line, credit })} />
                  </div>
                )}
              />
              <p className={styles.balance} data-ok={balanced || undefined} role="status">
                {balanced ? <CircleCheck size={16} aria-hidden="true" /> : <TriangleAlert size={16} aria-hidden="true" />}
                Debe {euros(debit)} · Haber {euros(credit)} · {balanced ? 'El asiento cuadra.' : 'No cuadra: el debe y el haber deben sumar lo mismo.'}
              </p>
            </>
          );
        }}
      />
    </>
  );
}

/* ── Árbol de decisión ────────────────────────────────────────────────── */

/**
 * Identificador de un paso: se escribe con libertad y se normaliza al salir del campo (o con Intro), cuando
 * se aplica a la vez a sus saltos. `onCommit` devuelve el identificador que queda.
 */
function StepId({ value, onCommit }: { value: string; onCommit: (raw: string) => string }) {
  const [draft, setDraft] = useState(value);
  const [shown, setShown] = useState(value);
  // Si el identificador cambia desde fuera (deshacer, otro paso en esta posición), el campo lo refleja.
  if (shown !== value) {
    setShown(value);
    setDraft(value);
  }
  const commit = () => {
    if (draft !== value) setDraft(onCommit(draft));
  };
  return (
    <TextField
      label="Identificador del paso"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        commit();
      }}
      hint="Corto y sin espacios: lo usan las opciones para saltar aquí. Al cambiarlo se actualizan los saltos."
    />
  );
}

/** Identificador libre a partir de una base («fin-escala», «fin-escala-2»…). */
export function freeStepId(base: string, taken: readonly string[]): string {
  const root = slugify(base) || 'paso';
  let id = root;
  let n = 2;
  while (taken.includes(id)) id = `${root}-${n++}`;
  return id;
}

type Tree = Of<'arbol-decision'>;

/** Pone otro identificador a un paso y lleva con él el primer paso y los saltos que lo usaban. */
export function renameStep(spec: Tree, index: number, raw: string): Tree {
  const from = spec.nodes[index]?.id ?? '';
  const others = spec.nodes.filter((_, j) => j !== index).map((n) => n.id);
  const to = freeStepId(slugify(raw) || from, others);
  if (to === from) return spec;
  // Si otro paso conserva el identificador anterior (estaba repetido), los saltos siguen yendo a ese.
  const follow = !!from && !others.includes(from);
  const retarget = (id: string) => (follow && id === from ? to : id);
  return {
    ...spec,
    start: retarget(spec.start),
    nodes: spec.nodes.map((n, j) => {
      const node = j === index ? { ...n, id: to } : n;
      return node.options ? { ...node, options: node.options.map((o) => ({ ...o, next: retarget(o.next) })) } : node;
    }),
  };
}

/** Quita un paso y deja sin elegir el primer paso o los saltos que llevaban a él (la validación los señala). */
export function removeStep(spec: Tree, index: number): Tree {
  const gone = spec.nodes[index]?.id ?? '';
  const nodes = spec.nodes.filter((_, j) => j !== index);
  const clear = !!gone && !nodes.some((n) => n.id === gone);
  const target = (id: string) => (clear && id === gone ? '' : id);
  return { ...spec, start: target(spec.start), nodes: nodes.map((n) => (n.options ? { ...n, options: n.options.map((o) => ({ ...o, next: target(o.next) })) } : n)) };
}

/** Copia de un paso con un identificador nuevo (con el mismo, los saltos serían ambiguos). */
export function duplicateStep(spec: Tree, node: DecisionNode): DecisionNode {
  return { ...copy(node), id: freeStepId(node.id, spec.nodes.map((n) => n.id)) };
}

function ArbolDecision({ spec, set }: { spec: Tree; set: (s: Tree) => void }) {
  const ids = spec.nodes.map((n) => n.id).filter(Boolean);
  // Un paso por identificador (si hay dos iguales, la validación lo señala) y su descripción.
  const steps = [...new Map(spec.nodes.filter((n) => n.id).map((n) => [n.id, n] as const)).values()];
  const nodeOptions = [{ value: '', label: 'Elige un paso…' }, ...steps.map((n) => ({ value: n.id, label: `${n.id} · ${n.outcome ? `Resultado: ${n.outcome.title || 'sin título'}` : n.question || 'Pregunta sin texto'}` }))];
  // Un destino que ya no existe se ve tal cual (no como «Elige un paso…»), para corregirlo.
  const optionsFor = (value: string) => (value && !ids.includes(value) ? [...nodeOptions, { value, label: `${value} · ya no existe` }] : nodeOptions);
  return (
    <>
      <Text label="Título" value={spec.title} onChange={(title) => set({ ...spec, title })} hint="La pregunta que resuelve el árbol: «¿Recargo, intereses o sanción?»." />
      <SelectField label="Primer paso" value={spec.start} onChange={(e) => set({ ...spec, start: e.target.value })} options={optionsFor(spec.start)} hint="Donde empieza el recorrido." />
      <Items
        items={spec.nodes}
        onChange={(nodes) => set({ ...spec, nodes })}
        make={(): DecisionNode => ({ id: freeStepId('pregunta', ids), question: '', options: [{ label: '', next: '' }, { label: '', next: '' }] })}
        duplicate={(node) => duplicateStep(spec, node)}
        remove={(i) => set(removeStep(spec, i))}
        min={2}
        name={(i) => `Paso ${i + 1}`}
        add="Añadir paso"
        render={(node, setNode, i) => {
          const isOutcome = !!node.outcome;
          return (
            <>
              <div className={styles.grid2}>
                <StepId
                  value={node.id}
                  onCommit={(raw) => {
                    const next = renameStep(spec, i, raw);
                    if (next !== spec) set(next);
                    return next.nodes[i]?.id ?? node.id;
                  }}
                />
                <SelectField
                  label="Tipo de paso"
                  value={isOutcome ? 'resultado' : 'pregunta'}
                  onChange={(e) =>
                    setNode(
                      e.target.value === 'resultado'
                        ? { id: node.id, outcome: node.outcome ?? { title: '', text: '', tone: 'resolver' } }
                        : { id: node.id, question: node.question ?? '', options: node.options ?? [{ label: '', next: '' }, { label: '', next: '' }] },
                    )
                  }
                  options={[
                    { value: 'pregunta', label: 'Pregunta con opciones' },
                    { value: 'resultado', label: 'Resultado (final del recorrido)' },
                  ]}
                />
              </div>
              {isOutcome && node.outcome ? (
                <>
                  <div className={styles.grid2}>
                    <Text label="Título del resultado" value={node.outcome.title} onChange={(title) => setNode({ ...node, outcome: { ...node.outcome!, title } })} />
                    <SelectField
                      label="Tono"
                      value={node.outcome.tone}
                      onChange={(e) => setNode({ ...node, outcome: { ...node.outcome!, tone: e.target.value as 'derivar' | 'resolver' | 'atencion' } })}
                      options={[
                        { value: 'resolver', label: 'Se resuelve en el área' },
                        { value: 'derivar', label: 'Derivar o consultar' },
                        { value: 'atencion', label: 'Atención' },
                      ]}
                    />
                  </div>
                  <TextArea label="Explicación" rows={3} value={node.outcome.text} onChange={(e) => setNode({ ...node, outcome: { ...node.outcome!, text: e.target.value } })} />
                </>
              ) : (
                <>
                  <TextArea label="Pregunta" rows={2} value={node.question ?? ''} onChange={(e) => setNode({ ...node, question: e.target.value })} />
                  <Items
                    items={node.options ?? []}
                    onChange={(options) => setNode({ ...node, options })}
                    make={() => ({ label: '', next: '' })}
                    min={2}
                    name={(i) => `Opción ${i + 1}`}
                    add="Añadir opción"
                    render={(o, setO) => (
                      <div className={styles.grid2}>
                        <Text label="Texto de la opción" value={o.label} onChange={(label) => setO({ ...o, label })} />
                        <SelectField label="Lleva a" value={o.next} onChange={(e) => setO({ ...o, next: e.target.value })} options={optionsFor(o.next)} />
                      </div>
                    )}
                  />
                </>
              )}
            </>
          );
        }}
      />
    </>
  );
}

/* ── Gráfico: una fila por punto del eje X y una columna por serie ────── */

/** Series de un gráfico: el gráfico distingue cuatro colores, trazos y marcadores (como el esquema). */
export const MAX_SERIES = 4;

/** Nombre de una serie nueva: el primer «Serie n» que no esté ya usado. */
export function freeSeriesName(names: readonly string[]): string {
  const taken = new Set(names.map(normalize));
  let n = names.length + 1;
  while (taken.has(normalize(`Serie ${n}`))) n++;
  return `Serie ${n}`;
}

function Grafico({ spec, set }: { spec: Of<'grafico'>; set: (s: Of<'grafico'>) => void }) {
  const chart = spec.chart;
  const setChart = (patch: Partial<ChartSpec>) => set({ ...spec, chart: { ...chart, ...patch } });
  const xs = chart.series[0]?.values.map((v) => String(v.x)) ?? [];
  const setPoint = (row: number, serie: number, y: number) =>
    setChart({ series: chart.series.map((s, j) => (j === serie ? { ...s, values: s.values.map((v, k) => (k === row ? { ...v, y } : v)) } : s)) });
  const setX = (row: number, x: string) => setChart({ series: chart.series.map((s) => ({ ...s, values: s.values.map((v, k) => (k === row ? { ...v, x } : v)) })) });
  const addRow = () => setChart({ series: chart.series.map((s) => ({ ...s, values: [...s.values, { x: '', y: 0 }] })) });
  const removeRow = (row: number) => setChart({ series: chart.series.map((s) => ({ ...s, values: s.values.filter((_, k) => k !== row) })) });
  const addSerie = () => setChart({ series: [...chart.series, { name: freeSeriesName(chart.series.map((s) => s.name)), values: xs.map((x) => ({ x, y: 0 })) }] });
  return (
    <>
      <div className={styles.grid2}>
        <SelectField
          label="Tipo de gráfico"
          value={chart.type}
          onChange={(e) => setChart({ type: e.target.value as ChartSpec['type'] })}
          options={[
            { value: 'barras', label: 'Barras' },
            { value: 'lineas', label: 'Líneas' },
            { value: 'escalones', label: 'Escalones' },
          ]}
        />
        <Text label="Título" value={chart.title} onChange={(title) => setChart({ title })} />
      </div>
      <div className={styles.grid3}>
        <Text label="Unidad" optional value={chart.unit} onChange={(unit) => setChart({ unit: unit || undefined })} hint="€, %, días…" />
        <Text label="Eje horizontal" optional value={chart.xLabel} onChange={(xLabel) => setChart({ xLabel: xLabel || undefined })} />
        <Text label="Eje vertical" optional value={chart.yLabel} onChange={(yLabel) => setChart({ yLabel: yLabel || undefined })} />
      </div>
      <fieldset className={styles.subfields}>
        <legend className={styles.legend}>Series (una columna de datos por serie, hasta {MAX_SERIES})</legend>
        <ol role="list" className={styles.items}>
          {chart.series.map((s, j) => (
            <li key={j} className={styles.inlineItem}>
              <div className={styles.grow}>
                <TextField label={`Serie ${j + 1}`} value={s.name} onChange={(e) => setChart({ series: chart.series.map((x, k) => (k === j ? { ...x, name: e.target.value } : x)) })} />
              </div>
              <ItemTools label={`la serie ${j + 1}`} index={j} count={chart.series.length} min={1} onMove={(to) => setChart({ series: move(chart.series, j, to) })} onRemove={() => setChart({ series: chart.series.filter((_, k) => k !== j) })} />
            </li>
          ))}
        </ol>
        <AddButton onClick={addSerie} disabled={chart.series.length >= MAX_SERIES}>
          Añadir serie
        </AddButton>
      </fieldset>
      <div className={styles.tableEditor} role="group" aria-label="Datos del gráfico">
        <table>
          <thead>
            <tr>
              <th scope="col">Eje horizontal</th>
              {chart.series.map((s, j) => (
                <th key={j} scope="col">
                  {s.name || `Serie ${j + 1}`}
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {xs.map((x, row) => (
              <tr key={row}>
                <td>
                  <input aria-label={`Etiqueta del punto ${row + 1}`} value={x} onChange={(e) => setX(row, e.target.value)} />
                </td>
                {chart.series.map((s, j) => (
                  <td key={j}>
                    <input aria-label={`${s.name || `Serie ${j + 1}`}, punto ${row + 1}`} type="number" step="any" inputMode="decimal" value={numText(s.values[row]?.y)} onChange={(e) => setPoint(row, j, e.target.value === '' ? 0 : Number(e.target.value))} />
                  </td>
                ))}
                <td>
                  <button type="button" className={styles.cellRemove} onClick={() => removeRow(row)} disabled={xs.length <= 1} aria-label={`Quitar el punto ${row + 1}`}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddButton onClick={addRow}>Añadir punto</AddButton>
    </>
  );
}

/* ── Formulario por tipo ─────────────────────────────────────────────── */

/** Campos de un apoyo interactivo. Cada cambio se ve al momento en la vista previa (el mismo componente que en la formación). */
export function WidgetFields({ spec, onChange }: { spec: WidgetSpec; onChange: (spec: WidgetSpec) => void }) {
  switch (spec.kind) {
    case 'recargo-extemporaneo':
      return <Num label="Cuota a ingresar (€)" value={spec.cuota} onChange={(cuota) => onChange({ ...spec, cuota: cuota ?? Number.NaN })} hint="El apoyo simula el recargo según los meses de retraso." />;
    case 'indemnizacion-despido':
      return (
        <div className={styles.grid3}>
          <Num label="Salario bruto anual (€)" value={spec.salarioAnual} onChange={(v) => onChange({ ...spec, salarioAnual: v ?? Number.NaN })} />
          <DateInput label="Inicio del contrato" value={spec.inicio} onChange={(inicio) => onChange({ ...spec, inicio })} />
          <DateInput label="Fecha de efectos del despido" value={spec.fin} onChange={(fin) => onChange({ ...spec, fin })} />
        </div>
      );
    case 'disolucion-perdidas':
      return (
        <div className={styles.grid3}>
          <Num label="Capital social (€)" value={spec.capital} onChange={(v) => onChange({ ...spec, capital: v ?? Number.NaN })} />
          <Num label="Patrimonio neto (€)" value={spec.patrimonioNeto} onChange={(v) => onChange({ ...spec, patrimonioNeto: v ?? Number.NaN })} />
          <Num label="Préstamo participativo (€)" optional value={spec.prestamoParticipativo} onChange={(v) => onChange({ ...spec, prestamoParticipativo: v })} />
        </div>
      );
    case 'calendario-cuentas':
      return <DateInput label="Cierre del ejercicio" value={spec.cierre} onChange={(cierre) => onChange({ ...spec, cierre })} hint="El calendario calcula los plazos de formulación, aprobación y depósito." />;
    case 'amortizacion':
      return (
        <div className={styles.grid2}>
          <Num label="Coste del elemento (€)" value={spec.coste} onChange={(v) => onChange({ ...spec, coste: v ?? Number.NaN })} />
          <Num label="Vida útil (años)" value={spec.vidaUtil} onChange={(v) => onChange({ ...spec, vidaUtil: v ?? Number.NaN })} />
          <Num label="Coeficiente fiscal máximo (% anual)" value={spec.coeficienteFiscalMax} onChange={(v) => onChange({ ...spec, coeficienteFiscalMax: v ?? Number.NaN })} />
          <Num label="Valor residual (€)" optional value={spec.valorResidual} onChange={(v) => onChange({ ...spec, valorResidual: v })} />
        </div>
      );
    case 'periodificacion':
      return (
        <>
          <Text label="Concepto" value={spec.concepto} onChange={(concepto) => onChange({ ...spec, concepto })} hint="p. ej., Prima del seguro multirriesgo" />
          <div className={styles.grid2}>
            <Num label="Importe (€)" value={spec.importe} onChange={(v) => onChange({ ...spec, importe: v ?? Number.NaN })} />
            <Num label="Meses que cubre" step="1" value={spec.meses} onChange={(v) => onChange({ ...spec, meses: v ?? Number.NaN })} />
            <DateInput label="Desde" value={spec.inicio} onChange={(inicio) => onChange({ ...spec, inicio })} />
            <DateInput label="Cierre del ejercicio" value={spec.cierre} onChange={(cierre) => onChange({ ...spec, cierre })} />
          </div>
        </>
      );
    case 'cuentas-t':
      return <CuentasT spec={spec} set={onChange} />;
    case 'arbol-decision':
      return <ArbolDecision spec={spec} set={onChange} />;
    case 'linea-tiempo':
      return (
        <>
          <Text label="Título" optional value={spec.title} onChange={(title) => onChange({ ...spec, title: title || undefined })} />
          <Items<TimelineItem>
            items={spec.items}
            onChange={(items) => onChange({ ...spec, items })}
            make={() => ({ date: '', title: '' })}
            min={2}
            name={(i) => `Hito ${i + 1}`}
            add="Añadir hito"
            render={(it, setIt) => (
              <>
                <div className={styles.grid3}>
                  <Text label="Fecha" value={it.date} onChange={(date) => setIt({ ...it, date })} hint="AAAA-MM-DD o un texto («Cada mes»)." />
                  <Text label="Hito" value={it.title} onChange={(title) => setIt({ ...it, title })} />
                  <SelectField
                    label="Tipo"
                    value={it.tone ?? ''}
                    onChange={(e) => setIt({ ...it, tone: (e.target.value || undefined) as typeof it.tone })}
                    options={[
                      { value: '', label: 'Sin marca' },
                      { value: 'hito', label: 'Hito' },
                      { value: 'plazo', label: 'Plazo' },
                      { value: 'pendiente', label: 'Pendiente' },
                    ]}
                  />
                </div>
                <TextArea label="Detalle (opcional)" rows={2} value={it.text ?? ''} onChange={(e) => setIt({ ...it, text: e.target.value || undefined })} />
              </>
            )}
          />
        </>
      );
    case 'tarjetas-verdad':
      return (
        <>
          <Text label="Título" optional value={spec.title} onChange={(title) => onChange({ ...spec, title: title || undefined })} />
          <Items
            items={spec.cards}
            onChange={(cards) => onChange({ ...spec, cards })}
            make={() => ({ claim: '', verdict: 'verdadero' as const, explanation: '' })}
            min={2}
            name={(i) => `Tarjeta ${i + 1}`}
            add="Añadir tarjeta"
            render={(c, setC) => (
              <>
                <TextArea label="Afirmación" rows={2} value={c.claim} onChange={(e) => setC({ ...c, claim: e.target.value })} />
                <SelectField
                  label="Es…"
                  value={c.verdict}
                  onChange={(e) => setC({ ...c, verdict: e.target.value as typeof c.verdict })}
                  options={[
                    { value: 'verdadero', label: 'Verdadero' },
                    { value: 'falso', label: 'Falso' },
                    { value: 'depende', label: 'Depende' },
                  ]}
                />
                <TextArea label="Explicación" rows={2} value={c.explanation} onChange={(e) => setC({ ...c, explanation: e.target.value })} />
              </>
            )}
          />
        </>
      );
    case 'comparativa': {
      // La primera columna rotula las filas y no se mueve ni se quita: es un campo aparte. Los valores de
      // cada fila van, en orden, con las columnas que se comparan (las siguientes).
      const [rowHeader = '', ...compared] = spec.columns;
      return (
        <>
          <Text label="Título" optional value={spec.title} onChange={(title) => onChange({ ...spec, title: title || undefined })} />
          <Text label="Encabezado de las filas" optional value={rowHeader} onChange={(header) => onChange({ ...spec, columns: [header, ...compared] })} hint="Lo que nombran las filas: «Calificación», «Lo que oyes»…" />
          <Words
            legend="Columnas que se comparan"
            values={compared}
            min={1}
            add="Añadir columna"
            label={(i) => `Columna ${i + 1}`}
            onChange={(columns, op) => onChange(compareColumns(spec, columns, op))}
          />
          <Items
            items={spec.rows}
            onChange={(rows) => onChange({ ...spec, rows })}
            make={() => ({ label: '', values: compared.map(() => '') })}
            min={1}
            name={(i) => `Fila ${i + 1}`}
            add="Añadir fila"
            render={(r, setR) => (
              <>
                <Text label={rowHeader.trim() || 'Fila'} value={r.label} onChange={(label) => setR({ ...r, label })} />
                {compared.map((col, k) => (
                  <TextArea key={k} label={col || `Columna ${k + 1}`} rows={2} value={r.values[k] ?? ''} onChange={(e) => setR({ ...r, values: compared.map((_, m) => (m === k ? e.target.value : (r.values[m] ?? ''))) })} />
                ))}
              </>
            )}
          />
        </>
      );
    }
    case 'clasificador': {
      const categories = [...new Set(spec.categories.filter((c) => c.trim()))];
      return (
        <>
          <div className={styles.grid2}>
            <Text label="Título" value={spec.title} onChange={(title) => onChange({ ...spec, title })} />
            <Text label="Instrucción" value={spec.prompt} onChange={(prompt) => onChange({ ...spec, prompt })} hint="«Clasifica cada operación…»" />
          </div>
          <Words legend="Categorías" values={spec.categories} min={2} add="Añadir categoría" label={(i) => `Categoría ${i + 1}`} onChange={(next, op) => onChange(classifierCategories(spec, next, op))} />
          <Items
            items={spec.items}
            onChange={(items) => onChange({ ...spec, items })}
            make={() => ({ label: '', answer: categories[0] ?? '', explanation: '' })}
            min={2}
            name={(i) => `Elemento ${i + 1}`}
            add="Añadir elemento"
            render={(it, setIt) => (
              <>
                <div className={styles.grid2}>
                  <Text label="Elemento" value={it.label} onChange={(label) => setIt({ ...it, label })} />
                  <SelectField
                    label="Categoría correcta"
                    value={it.answer}
                    onChange={(e) => setIt({ ...it, answer: e.target.value })}
                    options={[{ value: '', label: 'Elige…' }, ...categories.map((c) => ({ value: c, label: c })), ...(it.answer && !categories.includes(it.answer) ? [{ value: it.answer, label: `${it.answer} · ya no existe` }] : [])]}
                  />
                </div>
                <TextArea label="Explicación" rows={2} value={it.explanation} onChange={(e) => setIt({ ...it, explanation: e.target.value })} />
              </>
            )}
          />
        </>
      );
    }
    case 'grafico':
      return <Grafico spec={spec} set={onChange} />;
  }
}

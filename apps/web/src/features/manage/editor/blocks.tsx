import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpenText,
  Briefcase,
  Calculator,
  CalendarClock,
  CalendarRange,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardPaste,
  Columns3,
  GitFork,
  Heading2,
  Heading3,
  Image,
  Lightbulb,
  List,
  ListChecks,
  ListOrdered,
  Milestone,
  Pilcrow,
  Plus,
  Quote,
  Scale,
  Search,
  Shapes,
  Table,
  TrendingDown,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { normalize } from '@flm/shared';
import { Button, Checkbox, Dialog, SelectField, TextArea, TextField, useToasts } from '@/design';
import {
  blockLabel,
  CALLOUT_LABEL,
  duplicateBlock,
  kid,
  newBlock,
  newRef,
  newStep,
  SOURCE_KIND_LABEL,
  WIDGET_LABEL,
  type CalloutTone,
  type EditorBlock,
  type FieldError as FieldErrorType,
  type RefForm,
  type SourceKind,
  type WidgetKind,
} from '../forms';
import { AddButton, ChoiceGroup, FieldError, insertAt, ItemTools, itemMotion, move, Slot } from './fields';
import { PhotoPicker } from './pickers';
import { RichTextArea } from './RichTextArea';
import { WidgetFields } from './WidgetFields';
import styles from './Editor.module.css';

/* ────────────────────────────────────────────────────────────────────────────
 * Paleta de bloques
 * ──────────────────────────────────────────────────────────────────────────── */

export interface PaletteEntry {
  key: string;
  group: string;
  label: string;
  description: string;
  icon: LucideIcon;
  make: () => EditorBlock;
}

const WIDGET_ICON: Record<WidgetKind, LucideIcon> = {
  'recargo-extemporaneo': Calculator,
  'indemnizacion-despido': Briefcase,
  'disolucion-perdidas': TrendingDown,
  'calendario-cuentas': CalendarClock,
  amortizacion: Wallet,
  periodificacion: CalendarRange,
  'cuentas-t': Columns3,
  'arbol-decision': GitFork,
  'linea-tiempo': Milestone,
  'tarjetas-verdad': CircleHelp,
  comparativa: Table,
  clasificador: Shapes,
  grafico: ChartColumn,
};

const WIDGET_DESCRIPTION: Record<WidgetKind, string> = {
  'recargo-extemporaneo': 'Simula el recargo del art. 27 LGT según la cuota y los meses de retraso.',
  'indemnizacion-despido': 'Calcula la indemnización por despido con sus tramos.',
  'disolucion-perdidas': 'Comprueba si el patrimonio neto deja a la sociedad en causa de disolución.',
  'calendario-cuentas': 'Plazos de formulación, aprobación y depósito de las cuentas anuales.',
  amortizacion: 'Compara la amortización contable con el máximo fiscal, año a año.',
  periodificacion: 'Reparte un gasto entre ejercicios y propone el ajuste de cierre.',
  'cuentas-t': 'Asientos que se dibujan en cuentas en T; cada asiento tiene que cuadrar.',
  'arbol-decision': 'Preguntas encadenadas que llevan a una recomendación.',
  'linea-tiempo': 'Hitos y plazos en orden, con su fecha.',
  'tarjetas-verdad': 'Afirmaciones para decidir si son verdaderas, falsas o «depende».',
  comparativa: 'Compara opciones o supuestos, columna a columna.',
  clasificador: 'Ejercicio: clasificar cada elemento en su categoría, con explicación.',
  grafico: 'Barras, líneas o escalones con una o varias series.',
};

export const BLOCK_ICON = (b: EditorBlock): LucideIcon => {
  switch (b.type) {
    case 'heading':
      return b.level === 3 ? Heading3 : Heading2;
    case 'paragraph':
      return Pilcrow;
    case 'list':
      return b.ordered ? ListOrdered : List;
    case 'callout':
      return b.tone === 'clave' ? BookOpenText : b.tone === 'atencion' ? TriangleAlert : b.tone === 'consejo' ? Lightbulb : Scale;
    case 'quote':
      return Quote;
    case 'example':
      return ListChecks;
    case 'table':
      return Table;
    case 'widget':
      return WIDGET_ICON[b.widget.kind];
    case 'figure':
      return Image;
  }
};

const CALLOUT_ICON: Record<CalloutTone, LucideIcon> = { clave: BookOpenText, atencion: TriangleAlert, consejo: Lightbulb, norma: Scale };

const CALLOUT_DESCRIPTION: Record<CalloutTone, string> = {
  clave: '«Explicamos [término]»: define un concepto con palabras sencillas.',
  atencion: 'Un riesgo, un error frecuente o un plazo que no se puede pasar.',
  consejo: 'Una recomendación práctica para el trabajo con el cliente.',
  norma: 'Lo que dice la norma, con sus referencias oficiales.',
};

export const PALETTE: PaletteEntry[] = [
  { key: 'h2', group: 'Estructura', label: 'Apartado', description: 'Abre un apartado numerado; aparece en «En esta formación».', icon: Heading2, make: () => newBlock('heading', { level: 2 }) },
  { key: 'h3', group: 'Estructura', label: 'Subapartado', description: 'Título dentro de un apartado, para ordenar un tema largo.', icon: Heading3, make: () => newBlock('heading', { level: 3 }) },
  { key: 'p', group: 'Texto', label: 'Párrafo', description: 'Texto de lectura, con negrita, cursiva, términos y enlaces.', icon: Pilcrow, make: () => newBlock('paragraph') },
  { key: 'ul', group: 'Texto', label: 'Lista', description: 'Elementos con viñeta, uno por línea.', icon: List, make: () => newBlock('list') },
  { key: 'ol', group: 'Texto', label: 'Lista numerada', description: 'Pasos o plazos en orden.', icon: ListOrdered, make: () => ({ ...(newBlock('list') as Extract<EditorBlock, { type: 'list' }>), ordered: true }) },
  { key: 'quote', group: 'Texto', label: 'Cita', description: 'Una frase literal de una norma, sentencia o persona, con su origen.', icon: Quote, make: () => newBlock('quote') },
  ...(Object.keys(CALLOUT_LABEL) as CalloutTone[]).map((tone) => ({
    key: `callout-${tone}`,
    group: 'Recuadros',
    label: tone === 'clave' ? 'Explicamos' : CALLOUT_LABEL[tone],
    description: CALLOUT_DESCRIPTION[tone],
    icon: CALLOUT_ICON[tone],
    make: () => newBlock('callout', { tone }),
  })),
  { key: 'example', group: 'Casos, datos e imagen', label: 'Ejemplo resuelto', description: 'Un caso de cliente paso a paso, con cálculos y conclusión.', icon: ListChecks, make: () => newBlock('example') },
  { key: 'table', group: 'Casos, datos e imagen', label: 'Tabla', description: 'Datos en filas y columnas; se puede pegar desde Excel.', icon: Table, make: () => newBlock('table') },
  { key: 'figure', group: 'Casos, datos e imagen', label: 'Fotografía', description: 'Una foto aprobada de FLM, con su descripción.', icon: Image, make: () => newBlock('figure') },
  ...(Object.keys(WIDGET_LABEL) as WidgetKind[]).map((kind) => ({
    key: `widget-${kind}`,
    group: 'Apoyos interactivos',
    label: WIDGET_LABEL[kind],
    description: WIDGET_DESCRIPTION[kind],
    icon: WIDGET_ICON[kind],
    make: () => newBlock('widget', { widget: kind }),
  })),
];

/** Elegir el tipo de bloque: grupos con icono, nombre y para qué sirve; con búsqueda. */
export function BlockPalette({ open, onClose, onPick, where }: { open: boolean; onClose: () => void; onPick: (entry: PaletteEntry) => void; where: string }) {
  const [q, setQ] = useState('');
  const id = useId();
  useEffect(() => {
    if (open) setQ('');
  }, [open]);
  const shown = useMemo(() => {
    const nq = normalize(q);
    return nq ? PALETTE.filter((e) => normalize(`${e.label} ${e.description} ${e.group}`).includes(nq)) : PALETTE;
  }, [q]);
  const groups = [...new Set(shown.map((e) => e.group))];
  return (
    <Dialog open={open} onClose={onClose} title="Añadir un bloque" description={where} size="lg" variant="sheet">
      <div className={styles.palette}>
        <div className={styles.docSearch}>
          <Search size={16} aria-hidden="true" />
          <label htmlFor={`${id}-q`} className="sr-only">
            Buscar un tipo de bloque
          </label>
          <input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: tabla, plazo, gráfico…" autoComplete="off" />
        </div>
        {groups.length === 0 && <p className={styles.metaNote}>No hay bloques con esas palabras.</p>}
        {groups.map((g) => (
          <section key={g} aria-labelledby={`${id}-${normalize(g).replace(/\W+/g, '-')}`} className={styles.paletteGroup}>
            <h3 id={`${id}-${normalize(g).replace(/\W+/g, '-')}`} className={styles.paletteTitle}>
              {g}
            </h3>
            <ul role="list" className={styles.paletteList}>
              {shown
                .filter((e) => e.group === g)
                .map((e) => {
                  const Icon = e.icon;
                  return (
                    <li key={e.key}>
                      <button type="button" className={styles.paletteItem} onClick={() => onPick(e)}>
                        <span className={styles.paletteIcon} aria-hidden="true">
                          <Icon size={18} />
                        </span>
                        <span className={styles.paletteText}>
                          <span className={styles.paletteLabel}>{e.label}</span>
                          <span className={styles.paletteDesc}>{e.description}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Referencias (fuentes de la formación y referencias de un recuadro)
 * ──────────────────────────────────────────────────────────────────────────── */

export function RefsEditor({ refs, onChange, base, err, what, min = 0, add, today }: { refs: RefForm[]; onChange: (refs: RefForm[]) => void; base: string; err: (p: string) => string | undefined; what: string; min?: number; add: string; today: string }) {
  const set = (id: string, patch: Partial<RefForm>) => onChange(refs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  return (
    <div className={styles.stack}>
      {refs.length > 0 && (
        <ol role="list" className={styles.items}>
          <AnimatePresence initial={false}>
            {refs.map((r, i) => (
              <motion.li key={r.id} {...itemMotion} className={styles.itemCard}>
                <div className={styles.itemHead}>
                  <span className={styles.itemTitle}>
                    {what} {i + 1}
                  </span>
                  <ItemTools label={`${what.toLowerCase()} ${i + 1}`} index={i} count={refs.length} min={min} onMove={(to) => onChange(move(refs, i, to))} onRemove={() => onChange(refs.filter((x) => x.id !== r.id))} />
                </div>
                <Slot path={`${base}.${i}.label`}>
                  <TextField label="Nombre" value={r.label} onChange={(e) => set(r.id, { label: e.target.value })} error={err(`${base}.${i}.label`)} placeholder="p. ej., Ley 58/2003, General Tributaria, art. 27" />
                </Slot>
                <Slot path={`${base}.${i}.url`}>
                  <TextField label="Enlace oficial" type="url" inputMode="url" value={r.url} onChange={(e) => set(r.id, { url: e.target.value })} error={err(`${base}.${i}.url`)} placeholder="https://www.boe.es/…" />
                </Slot>
                <div className={styles.grid2}>
                  <SelectField
                    label="Tipo"
                    value={r.kind}
                    onChange={(e) => set(r.id, { kind: e.target.value as SourceKind | '' })}
                    options={[{ value: '', label: 'Sin indicar (web)' }, ...(Object.keys(SOURCE_KIND_LABEL) as SourceKind[]).map((k) => ({ value: k, label: SOURCE_KIND_LABEL[k] }))]}
                  />
                  <Slot path={`${base}.${i}.date`}>
                    <TextField label="Fecha de consulta" type="date" value={r.date} onChange={(e) => set(r.id, { date: e.target.value })} error={err(`${base}.${i}.date`)} />
                  </Slot>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
      <AddButton onClick={() => onChange([...refs, newRef(today)])}>{add}</AddButton>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Tabla
 * ──────────────────────────────────────────────────────────────────────────── */

type TableBlock = Extract<EditorBlock, { type: 'table' }>;

/** Lee datos pegados desde una hoja de cálculo: filas por línea y celdas separadas por tabulador (o punto y coma). */
export function parsePasted(text: string): string[][] {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  const sep = lines.some((l) => l.includes('\t')) ? '\t' : ';';
  return lines.map((l) => l.split(sep).map((c) => c.trim()));
}

function TableEditor({ b, patch, path, err }: { b: TableBlock; patch: (p: Partial<TableBlock>) => void; path: string; err: (p: string) => string | undefined }) {
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState('');
  const setCell = (rowId: string, col: number, value: string) => patch({ rows: b.rows.map((r) => (r.id === rowId ? { ...r, cells: r.cells.map((c, i) => (i === col ? value : c)) } : r)) });
  const addColumn = () => patch({ columns: [...b.columns, { id: kid('c'), label: '', numeric: false }], rows: b.rows.map((r) => ({ ...r, cells: [...r.cells, ''] })) });
  const removeColumn = (col: number) => patch({ columns: b.columns.filter((_, i) => i !== col), rows: b.rows.map((r) => ({ ...r, cells: r.cells.filter((_, i) => i !== col) })) });
  const moveColumn = (col: number, to: number) => patch({ columns: move(b.columns, col, to), rows: b.rows.map((r) => ({ ...r, cells: move(r.cells, col, to) })) });
  const usePasted = () => {
    const grid = parsePasted(pasted);
    if (grid.length < 2) return;
    const width = Math.max(2, ...grid.map((r) => r.length));
    const [head = [], ...body] = grid;
    patch({
      columns: Array.from({ length: width }, (_, i) => ({ id: kid('c'), label: head[i] ?? '', numeric: body.length > 0 && body.every((r) => /^[\s\d.,%€+-]*$/.test(r[i] ?? '') && /\d/.test(r[i] ?? '')) })),
      rows: body.map((r) => ({ id: kid('f'), cells: Array.from({ length: width }, (_, i) => r[i] ?? '') })),
    });
    setPasting(false);
    setPasted('');
  };
  return (
    <>
      <TextField label="Título de la tabla (opcional)" value={b.caption} onChange={(e) => patch({ caption: e.target.value })} hint="Se lee como el pie de la tabla: qué compara y con qué criterio." />
      <Slot path={`${path}.columns`}>
        <FieldError message={err(`${path}.columns`)} />
      </Slot>
      <Slot path={`${path}.rows`}>
        <FieldError message={err(`${path}.rows`)} />
      </Slot>
      <div className={styles.tableEditor} role="group" aria-label="Celdas de la tabla">
        <table>
          <thead>
            <tr>
              {b.columns.map((c, i) => (
                <th key={c.id} scope="col">
                  <input aria-label={`Título de la columna ${i + 1}`} value={c.label} placeholder={`Columna ${i + 1}`} onChange={(e) => patch({ columns: b.columns.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)) })} />
                  <span className={styles.colTools}>
                    <label className={styles.colNumeric}>
                      <input type="checkbox" checked={c.numeric} onChange={(e) => patch({ columns: b.columns.map((x) => (x.id === c.id ? { ...x, numeric: e.target.checked } : x)) })} />
                      Cifras
                    </label>
                    <button type="button" className={styles.cellRemove} onClick={() => moveColumn(i, i - 1)} disabled={i === 0} aria-label={`Mover la columna ${i + 1} a la izquierda`}>
                      ‹
                    </button>
                    <button type="button" className={styles.cellRemove} onClick={() => moveColumn(i, i + 1)} disabled={i === b.columns.length - 1} aria-label={`Mover la columna ${i + 1} a la derecha`}>
                      ›
                    </button>
                    <button type="button" className={styles.cellRemove} onClick={() => removeColumn(i)} disabled={b.columns.length <= 2} aria-label={`Quitar la columna ${i + 1}`}>
                      ×
                    </button>
                  </span>
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">Acciones de la fila</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, ri) => (
              <tr key={r.id}>
                {b.columns.map((c, ci) => (
                  <td key={c.id}>
                    <input aria-label={`Fila ${ri + 1}, ${c.label || `columna ${ci + 1}`}`} value={r.cells[ci] ?? ''} onChange={(e) => setCell(r.id, ci, e.target.value)} data-num={c.numeric || undefined} />
                  </td>
                ))}
                <td>
                  <span className={styles.rowTools}>
                    <button type="button" className={styles.cellRemove} onClick={() => patch({ rows: move(b.rows, ri, ri - 1) })} disabled={ri === 0} aria-label={`Subir la fila ${ri + 1}`}>
                      ↑
                    </button>
                    <button type="button" className={styles.cellRemove} onClick={() => patch({ rows: move(b.rows, ri, ri + 1) })} disabled={ri === b.rows.length - 1} aria-label={`Bajar la fila ${ri + 1}`}>
                      ↓
                    </button>
                    <button type="button" className={styles.cellRemove} onClick={() => patch({ rows: b.rows.filter((x) => x.id !== r.id) })} disabled={b.rows.length <= 1} aria-label={`Quitar la fila ${ri + 1}`}>
                      ×
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.addRow}>
        <AddButton onClick={() => patch({ rows: [...b.rows, { id: kid('f'), cells: b.columns.map(() => '') }] })}>Añadir fila</AddButton>
        <AddButton onClick={addColumn}>Añadir columna</AddButton>
        <Button variant="ghost" size="sm" icon={<ClipboardPaste />} onClick={() => setPasting((p) => !p)} aria-expanded={pasting}>
          Pegar desde Excel
        </Button>
      </div>
      {pasting && (
        <div className={styles.pasteBox}>
          <TextArea label="Pega aquí las celdas copiadas" rows={4} value={pasted} onChange={(e) => setPasted(e.target.value)} hint="La primera fila serán los títulos de las columnas. Sustituye el contenido actual de la tabla." />
          <div className={styles.addRow}>
            <Button size="sm" onClick={usePasted} disabled={parsePasted(pasted).length < 2}>
              Usar estos datos
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPasting(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Campos de cada bloque
 * ──────────────────────────────────────────────────────────────────────────── */

interface BlockFieldsProps {
  b: EditorBlock;
  i: number;
  patch: (p: Partial<EditorBlock>) => void;
  err: (path: string) => string | undefined;
  terms: string[];
  today: string;
}

function BlockFields({ b, i, patch, err, terms, today }: BlockFieldsProps) {
  const path = (k: string) => `blocks.${i}.${k}`;
  switch (b.type) {
    case 'heading':
      return (
        <>
          <ChoiceGroup<'2' | '3'>
            legend="Nivel"
            value={b.level === 3 ? '3' : '2'}
            onChange={(v) => patch({ level: v === '3' ? 3 : 2 })}
            options={[
              { value: '2', label: 'Apartado', icon: <Heading2 size={16} /> },
              { value: '3', label: 'Subapartado', icon: <Heading3 size={16} /> },
            ]}
          />
          <Slot path={path('text')}>
            <TextField label={b.level === 3 ? 'Título del subapartado' : 'Título del apartado'} value={b.text} onChange={(e) => patch({ text: e.target.value })} error={err(path('text'))} placeholder="p. ej., Qué cambia y desde cuándo" />
          </Slot>
        </>
      );
    case 'paragraph':
      return (
        <Slot path={path('text')}>
          <RichTextArea label="Párrafo" rows={4} value={b.text} onChange={(text) => patch({ text })} terms={terms} error={err(path('text'))} hint="Deja una línea en blanco para separar párrafos." />
        </Slot>
      );
    case 'list':
      return (
        <>
          <Checkbox label="Lista numerada" hint="Para pasos o plazos en orden." checked={b.ordered} onChange={(v) => patch({ ordered: v })} />
          <Slot path={path('items')}>
            <RichTextArea label="Elementos (uno por línea)" rows={4} value={b.items} onChange={(items) => patch({ items })} terms={terms} error={err(path('items'))} />
          </Slot>
        </>
      );
    case 'callout':
      return (
        <>
          <ChoiceGroup<CalloutTone>
            legend="Tipo de recuadro"
            variant="cards"
            value={b.tone}
            onChange={(tone) => patch({ tone })}
            options={(Object.keys(CALLOUT_LABEL) as CalloutTone[]).map((t) => {
              const Icon = CALLOUT_ICON[t];
              return { value: t, label: t === 'clave' ? 'Explicamos' : CALLOUT_LABEL[t], description: CALLOUT_DESCRIPTION[t], icon: <Icon size={18} /> };
            })}
          />
          <Slot path={path('title')}>
            <TextField
              label={b.tone === 'clave' ? 'Término que se explica' : 'Título (opcional)'}
              value={b.title}
              onChange={(e) => patch({ title: e.target.value })}
              error={err(path('title'))}
              hint={b.tone === 'clave' ? 'Se muestra como «EXPLICAMOS [TÉRMINO]», como en las publicaciones de FLM.' : undefined}
            />
          </Slot>
          <Slot path={path('text')}>
            <RichTextArea label="Texto del recuadro" rows={3} value={b.text} onChange={(text) => patch({ text })} terms={terms} error={err(path('text'))} />
          </Slot>
          <fieldset className={styles.subfields}>
            <legend className={styles.legend}>Referencias oficiales (opcional)</legend>
            <RefsEditor refs={b.refs} onChange={(refs) => patch({ refs })} base={path('refs')} err={err} what="Referencia" add="Añadir referencia" today={today} />
          </fieldset>
        </>
      );
    case 'quote':
      return (
        <>
          <Slot path={path('text')}>
            <TextArea label="Cita literal" rows={3} value={b.text} onChange={(e) => patch({ text: e.target.value })} error={err(path('text'))} />
          </Slot>
          <TextField label="Origen (opcional)" value={b.cite} onChange={(e) => patch({ cite: e.target.value })} hint="Norma, sentencia o persona: «STS 765/2026, FJ 3»." />
        </>
      );
    case 'example':
      return (
        <>
          <Slot path={path('title')}>
            <TextField label="Título del ejemplo" value={b.title} onChange={(e) => patch({ title: e.target.value })} error={err(path('title'))} placeholder="p. ej., Una sociedad que presenta fuera de plazo" />
          </Slot>
          <Slot path={path('scenario')}>
            <RichTextArea label="Planteamiento" rows={3} value={b.scenario} onChange={(scenario) => patch({ scenario })} terms={terms} error={err(path('scenario'))} hint="El caso del cliente, con datos realistas y cifras redondas." />
          </Slot>
          <Slot path={path('steps')}>
            <fieldset className={styles.subfields}>
              <legend className={styles.legend}>Pasos (se muestran uno a uno: «Siguiente paso» o «Ver todo»)</legend>
              <FieldError message={err(path('steps'))} />
              <ol role="list" className={styles.items}>
                <AnimatePresence initial={false}>
                  {b.steps.map((s, j) => (
                    <motion.li key={s.id} {...itemMotion} className={styles.stepRow}>
                      <div className={styles.itemHead}>
                        <span className={styles.itemTitle}>Paso {j + 1}</span>
                        <ItemTools
                          label={`el paso ${j + 1}`}
                          index={j}
                          count={b.steps.length}
                          min={1}
                          onMove={(to) => patch({ steps: move(b.steps, j, to) })}
                          onDuplicate={() => patch({ steps: insertAt(b.steps, j + 1, { ...s, id: kid('s') }) })}
                          onRemove={() => patch({ steps: b.steps.filter((x) => x.id !== s.id) })}
                        />
                      </div>
                      <Slot path={path(`steps.${j}.label`)}>
                        <TextField
                          label={`Qué se hace en el paso ${j + 1}`}
                          value={s.label}
                          onChange={(e) => patch({ steps: b.steps.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)) })}
                          error={err(path(`steps.${j}.label`))}
                        />
                      </Slot>
                      <div className={styles.grid2}>
                        <TextField label="Cálculo (opcional)" value={s.formula} onChange={(e) => patch({ steps: b.steps.map((x) => (x.id === s.id ? { ...x, formula: e.target.value } : x)) })} placeholder="p. ej., 2.800 € × 5 %" />
                        <TextField label="Resultado (opcional)" value={s.result} onChange={(e) => patch({ steps: b.steps.map((x) => (x.id === s.id ? { ...x, result: e.target.value } : x)) })} placeholder="p. ej., 140 €" />
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
              <AddButton onClick={() => patch({ steps: [...b.steps, newStep()] })}>Añadir paso</AddButton>
            </fieldset>
          </Slot>
          <Slot path={path('conclusion')}>
            <RichTextArea label="Conclusión" rows={2} value={b.conclusion} onChange={(conclusion) => patch({ conclusion })} terms={terms} error={err(path('conclusion'))} />
          </Slot>
        </>
      );
    case 'table':
      return <TableEditor b={b} patch={patch} path={`blocks.${i}`} err={err} />;
    case 'widget':
      return (
        <>
          <Slot path={path('widget')}>
            <FieldError message={err(path('widget'))} />
            <WidgetFields spec={b.widget} onChange={(widget) => patch({ widget })} />
          </Slot>
          <TextArea label="Pie del apoyo (opcional)" rows={2} value={b.caption} onChange={(e) => patch({ caption: e.target.value })} hint="Qué puede probar la persona: «Simula una cuota de 10.000 € y observa el salto al 15 %»." />
        </>
      );
    case 'figure':
      return (
        <>
          <Slot path={path('src')}>
            <PhotoPicker legend="Fotografía" value={b.src} onChange={(src, alt) => patch({ src, alt: b.alt.trim() ? b.alt : alt })} hint="Solo fotografías aprobadas de FLM. En la demostración no se pueden subir fotos." />
            <FieldError message={err(path('src'))} />
          </Slot>
          <Slot path={path('alt')}>
            <TextField label="Descripción para lectores de pantalla" value={b.alt} onChange={(e) => patch({ alt: e.target.value })} error={err(path('alt'))} hint="Qué se ve y por qué importa aquí." />
          </Slot>
          <TextField label="Pie de foto (opcional)" value={b.caption} onChange={(e) => patch({ caption: e.target.value })} />
        </>
      );
  }
}

/** Resumen de un bloque plegado. */
function blockSummary(b: EditorBlock): string {
  const text = (() => {
    switch (b.type) {
      case 'heading':
      case 'paragraph':
      case 'quote':
        return b.text;
      case 'list':
        return b.items.split('\n')[0] ?? '';
      case 'callout':
        return b.title || b.text;
      case 'example':
        return b.title;
      case 'table':
        return b.caption || b.columns.map((c) => c.label).join(' · ');
      case 'widget':
        return b.caption || WIDGET_LABEL[b.widget.kind];
      case 'figure':
        return b.alt || b.src;
    }
  })();
  const plain = text.replace(/\*\*|\[\[|\]\]|\*/g, '').trim();
  return plain ? (plain.length > 90 ? `${plain.slice(0, 88)}…` : plain) : 'Sin texto todavía';
}

/* ────────────────────────────────────────────────────────────────────────────
 * Lista de bloques: insertar en cualquier posición, reordenar, duplicar, plegar y eliminar
 * ──────────────────────────────────────────────────────────────────────────── */

function InsertPoint({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className={styles.insert}>
      <button type="button" className={styles.insertButton} onClick={onClick} aria-label={label} title={label}>
        <Plus size={16} aria-hidden="true" />
        <span className={styles.insertText} aria-hidden="true">
          Insertar aquí
        </span>
      </button>
    </div>
  );
}

export function BlockList({ blocks, update, err, errors, terms, today }: { blocks: EditorBlock[]; update: (fn: (prev: EditorBlock[]) => EditorBlock[]) => void; err: (path: string) => string | undefined; errors: FieldErrorType[]; terms: string[]; today: string }) {
  const [paletteAt, setPaletteAt] = useState<number | null>(null);
  const [folded, setFolded] = useState<Set<string>>(() => new Set());
  const [focusBlock, setFocusBlock] = useState<string | null>(null);
  const pushToast = useToasts((s) => s.push);

  useEffect(() => {
    if (!focusBlock) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(`bloque-${focusBlock}`);
      el?.querySelector<HTMLElement>('textarea, input:not([type=radio]):not([type=checkbox]), select')?.focus();
      setFocusBlock(null);
    }, 60);
    return () => window.clearTimeout(t);
  }, [focusBlock]);

  // Numeración visible de los apartados (los subapartados no cuentan).
  const numbers = useMemo(() => {
    let n = 0;
    return blocks.map((b) => (b.type === 'heading' && b.level !== 3 ? ++n : n));
  }, [blocks]);
  const withErrors = useMemo(() => new Set(errors.filter((e) => e.path.startsWith('blocks.')).map((e) => Number(e.path.split('.')[1]))), [errors]);

  const insert = (index: number, block: EditorBlock) => {
    update((prev) => insertAt(prev, index, block));
    setFocusBlock(block.id);
  };

  const remove = (b: EditorBlock, index: number) => {
    update((prev) => prev.filter((x) => x.id !== b.id));
    pushToast({
      title: 'Bloque eliminado',
      description: `${blockLabel(b)}: ${blockSummary(b)}`,
      tone: 'info',
      duration: 10_000,
      action: { label: 'Deshacer', onClick: () => insert(index, b) },
    });
  };

  const where = paletteAt === null ? '' : paletteAt >= blocks.length ? 'Se añadirá al final del contenido.' : paletteAt === 0 ? 'Se añadirá al principio del contenido.' : `Se añadirá después del bloque ${paletteAt}.`;
  const allFolded = blocks.length > 0 && blocks.every((b) => folded.has(b.id));

  return (
    <div className={styles.blockList}>
      <div className={styles.blockListTools}>
        <p className={styles.metaNote}>
          {blocks.length === 1 ? '1 bloque' : `${blocks.length} bloques`} · {numbers.at(-1) ?? 0} apartados
        </p>
        <Button variant="ghost" size="sm" icon={allFolded ? <ChevronDown /> : <ChevronRight />} onClick={() => setFolded(allFolded ? new Set() : new Set(blocks.map((b) => b.id)))}>
          {allFolded ? 'Desplegar todo' : 'Plegar todo'}
        </Button>
      </div>
      <InsertPoint onClick={() => setPaletteAt(0)} label="Insertar un bloque al principio" />
      <ol role="list" className={styles.items}>
        <AnimatePresence initial={false}>
          {blocks.map((b, i) => {
            const Icon = BLOCK_ICON(b);
            const isFolded = folded.has(b.id) && !withErrors.has(i);
            const title = b.type === 'heading' ? (b.level === 3 ? 'Subapartado' : `Apartado ${numbers[i]}`) : blockLabel(b);
            return (
              <motion.li key={b.id} {...itemMotion} className={styles.blockItem}>
                <Slot path={`blocks.${i}`}>
                  <div id={`bloque-${b.id}`} className={styles.blockCard} data-type={b.type} data-level={b.type === 'heading' ? b.level : undefined}>
                    <div className={styles.itemHead}>
                      <button
                        type="button"
                        className={styles.blockToggle}
                        aria-expanded={!isFolded}
                        onClick={() =>
                          setFolded((prev) => {
                            const next = new Set(prev);
                            if (next.has(b.id)) next.delete(b.id);
                            else next.add(b.id);
                            return next;
                          })
                        }
                      >
                        {isFolded ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                        <span className={styles.blockIcon} aria-hidden="true">
                          <Icon size={16} />
                        </span>
                        <span className={styles.blockType}>
                          {title} <span className={styles.muted}>· bloque {i + 1}</span>
                        </span>
                      </button>
                      <ItemTools
                        label={`el bloque ${i + 1}`}
                        index={i}
                        count={blocks.length}
                        onMove={(to) => update((prev) => move(prev, i, to))}
                        onDuplicate={() => insert(i + 1, duplicateBlock(b))}
                        onRemove={() => remove(b, i)}
                      />
                    </div>
                    {isFolded ? (
                      <p className={styles.blockSummary}>{blockSummary(b)}</p>
                    ) : (
                      <BlockFields b={b} i={i} patch={(p) => update((prev) => prev.map((x) => (x.id === b.id ? ({ ...x, ...p } as EditorBlock) : x)))} err={err} terms={terms} today={today} />
                    )}
                  </div>
                </Slot>
                <InsertPoint onClick={() => setPaletteAt(i + 1)} label={`Insertar un bloque después del bloque ${i + 1}`} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      <Button variant="secondary" icon={<Plus />} onClick={() => setPaletteAt(blocks.length)} className={styles.addBlock}>
        Añadir bloque
      </Button>
      <BlockPalette
        open={paletteAt !== null}
        onClose={() => setPaletteAt(null)}
        where={where}
        onPick={(entry) => {
          const at = paletteAt ?? blocks.length;
          setPaletteAt(null);
          insert(at, entry.make());
        }}
      />
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className={styles.hint}>{children}</p>;
}

import { Bell, Check, Play, Plus, RotateCcw, Save, Search } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { AREAS, AREA_LIST, isCorporateEmail, type AreaId, type FormationStatus } from '@flm/shared';
import {
  ActionButton,
  AreaTag,
  Button,
  Checkbox,
  Chip,
  EditorialChip,
  IconButton,
  Kbd,
  LearningChip,
  Notice,
  PhaseChip,
  ProgressRing,
  SelectField,
  StatusGlyph,
  Switch,
  Tabs,
  TextArea,
  TextField,
  toast,
  type ActionStatus,
} from '@/design';
import { DossierSection, SubHead } from './Section';
import styles from './LiveSystem.module.css';

/* ── Color y contraste, leídos en vivo del tema activo ─────────────────── */

type RGBA = [number, number, number, number];

function parseColor(value: string): RGBA | null {
  const rgb = value.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const p = rgb[1]!.split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0, p[3] ?? 1];
  }
  const srgb = value.match(/color\(srgb ([^)]+)\)/);
  if (srgb) {
    const p = srgb[1]!.split(/[\s/]+/).filter(Boolean).map(Number);
    return [(p[0] ?? 0) * 255, (p[1] ?? 0) * 255, (p[2] ?? 0) * 255, p[3] ?? 1];
  }
  return null;
}

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: RGBA) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const over = (fg: RGBA, bg: RGBA): RGBA => [fg[0] * fg[3] + bg[0] * (1 - fg[3]), fg[1] * fg[3] + bg[1] * (1 - fg[3]), fg[2] * fg[3] + bg[2] * (1 - fg[3]), 1];

function contrast(fg: RGBA, bg: RGBA): number {
  const a = luminance(over(fg, bg));
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const hex = ([r, g, b]: RGBA) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
const ratioText = (r: number) => `${r.toFixed(1).replace('.', ',')}:1`;

function grade(r: number, graphic = false): { label: string; tone: 'success' | 'warning' | 'danger' } {
  if (r >= 7) return { label: 'AAA', tone: 'success' };
  if (r >= 4.5) return { label: 'AA', tone: 'success' };
  if (r >= 3) return { label: graphic ? 'Solo ≥ 24 px' : 'Solo texto grande', tone: 'warning' };
  return { label: 'No apto para texto', tone: 'danger' };
}

const TEXT_TOKENS = [
  { token: '--ink', name: 'Tinta', use: 'Texto principal' },
  { token: '--ink-2', name: 'Tinta secundaria', use: 'Texto secundario y metadatos' },
  { token: '--ink-3', name: 'Tinta terciaria', use: 'Ayudas breves' },
  { token: '--accent-text', name: 'Acento en texto', use: 'Texto rojo pequeño: plazos, obligatorios' },
  { token: '--flm-vino-texto', name: 'Vino', use: 'Antetítulos' },
  { token: '--success', name: 'Éxito', use: 'Completada, superado' },
  { token: '--warning', name: 'Atención', use: 'En revisión, por confirmar' },
  { token: '--flm-rojo', name: 'Rojo FLM', use: 'Puntos, trazos y gráficos', graphic: true },
] as const;

const SURFACES = ['--paper', '--surface'] as const;

function useLiveColors(tokens: readonly string[]) {
  const probe = useRef<HTMLSpanElement>(null);
  const [values, setValues] = useState<Record<string, RGBA | null>>({});
  const [theme, setTheme] = useState('');
  const key = tokens.join('|');

  useLayoutEffect(() => {
    const read = () => {
      const el = probe.current;
      if (!el) return;
      const out: Record<string, RGBA | null> = {};
      for (const t of tokens) {
        el.style.color = `var(${t})`;
        out[t] = parseColor(getComputedStyle(el).color);
      }
      setValues(out);
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'oscuro' : 'claro');
    };
    read();
    const mo = new MutationObserver(() => requestAnimationFrame(read));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { probe, values, theme };
}

function LiveColors() {
  const all = [...TEXT_TOKENS.map((t) => t.token), ...SURFACES];
  const { probe, values, theme } = useLiveColors(all);
  const paper = values['--paper'];
  const surface = values['--surface'];
  return (
    <div className={styles.block}>
      <span ref={probe} className={styles.probe} aria-hidden="true" />
      <p className={styles.live} aria-live="polite">
        <span className={styles.liveDot} aria-hidden="true" /> Valores leídos ahora mismo del tema {theme || '…'}. Cambia el tema en Ajustes y la tabla se recalcula.
      </p>
      <div className={styles.tableWrap}>
        <table role="table" className={styles.table}>
          <caption className="sr-only">Contraste de los colores de texto del tema activo sobre el papel y sobre las tarjetas</caption>
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">
                Color
              </th>
              <th role="columnheader" scope="col">
                Valor
              </th>
              <th role="columnheader" scope="col">
                Sobre el papel
              </th>
              <th role="columnheader" scope="col">
                Sobre una tarjeta
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {TEXT_TOKENS.map((t) => {
              const v = values[t.token];
              const graphic = 'graphic' in t && t.graphic;
              return (
                <tr role="row" key={t.token}>
                  <th role="rowheader" scope="row">
                    <span className={styles.tokenCell}>
                      <span className={styles.swatch} style={{ background: `var(${t.token})` }} aria-hidden="true" />
                      <span>
                        <span className={styles.tokenName}>{t.name}</span>
                        <span className={styles.tokenUse}>{t.use}</span>
                      </span>
                    </span>
                  </th>
                  <td role="cell" className={styles.mono}>
                    {v ? hex(v) : '—'} <code>{t.token}</code>
                  </td>
                  {[paper, surface].map((bg, i) => {
                    if (!v || !bg) return <td role="cell" key={i}>—</td>;
                    const r = contrast(v, bg);
                    const g = grade(r, graphic);
                    return (
                      <td role="cell" key={i} className={styles.ratioCell}>
                        <span className={styles.cellLabel} aria-hidden="true">
                          {i === 0 ? 'Sobre el papel: ' : 'Sobre una tarjeta: '}
                        </span>
                        <span className={styles.ratio}>{ratioText(r)}</span> <Chip size="sm" tone={g.tone}>{g.label}</Chip>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Escala tipográfica (tamaño calculado en vivo) ─────────────────────── */

const TYPE = [
  { token: '--text-5xl', role: 'Titular de página', family: 'Newsreader 380, corte óptico 72', cls: 'tDisplay', sample: 'Lo que sabe uno' },
  { token: '--text-3xl', role: 'Título de sección', family: 'Newsreader 420', cls: 'tSection', sample: 'Actualidad en tu sector' },
  { token: '--text-reading', role: 'Lectura larga', family: 'Newsreader, corte óptico 18', cls: 'tReading', sample: 'Cada formación la firma una persona de la casa, con fuentes y fecha de revisión.' },
  { token: '--text-lg', role: 'Entradilla', family: 'Newsreader itálica', cls: 'tLede', sample: 'Apostamos por tu formación y tu crecimiento.' },
  { token: '--text-md', role: 'Interfaz', family: 'Inter 400–650', cls: 'tUi', sample: 'Marcar la lectura como terminada' },
  { token: '--text-sm', role: 'Metadatos', family: 'Inter, cifras tabulares', cls: 'tMeta', sample: '28 oct 2026 · 12 min · PDF · 239 KB' },
  { token: '--text-xs', role: 'Antetítulo', family: 'Inter 650, mayúsculas espaciadas', cls: 'tEyebrow', sample: 'Formación obligatoria' },
] as const;

function TypeRow({ row }: { row: (typeof TYPE)[number] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [px, setPx] = useState('');
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setPx(`${Math.round(parseFloat(getComputedStyle(el).fontSize))} px`);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);
  return (
    <li className={styles.typeRow}>
      <div className={styles.typeMeta}>
        <span className={styles.tokenName}>{row.role}</span>
        <span className={styles.tokenUse}>{row.family}</span>
        <span className={styles.mono}>
          <code>{row.token}</code> · <span aria-live="off">{px}</span>
        </span>
      </div>
      <p ref={ref} className={styles[row.cls]}>
        {row.sample}
      </p>
    </li>
  );
}

/* ── Movimiento ────────────────────────────────────────────────────────── */

const EASINGS = [
  { token: '--ease-standard', name: 'Estándar', value: '0.2, 0, 0, 1', use: 'Cambios de estado y paneles' },
  { token: '--ease-enter', name: 'Entrada', value: '0.05, 0.7, 0.1, 1', use: 'Contenido que aparece' },
  { token: '--ease-exit', name: 'Salida', value: '0.3, 0, 0.8, 0.15', use: 'Contenido que se va' },
  { token: '--ease-spring', name: 'Muelle', value: '0.34, 1.36, 0.64, 1', use: 'Interruptores y pequeños asentamientos' },
];

const DURATIONS = [
  { token: '--dur-instant', value: '90 ms', use: 'Color' },
  { token: '--dur-quick', value: '160 ms', use: 'Puntero y pulsación' },
  { token: '--dur-base', value: '260 ms', use: 'Paneles y pestañas' },
  { token: '--dur-slow', value: '420 ms', use: 'Entradas de contenido' },
  { token: '--dur-signature', value: '900 ms', use: 'Tramos de los momentos firma (en total, menos de 1,5 s)' },
];

function MotionTokens() {
  const [moved, setMoved] = useState(false);
  return (
    <div className={styles.motion}>
      <div className={styles.tracks}>
        {EASINGS.map((e) => (
          <div key={e.token} className={styles.trackRow}>
            <span className={styles.trackLabel}>
              <span className={styles.tokenName}>{e.name}</span>
              <code className={styles.monoSmall}>cubic-bezier({e.value})</code>
            </span>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.dot} data-moved={moved} style={{ transitionTimingFunction: `var(${e.token})` }} />
            </span>
          </div>
        ))}
        <Button variant="soft" size="sm" icon={moved ? <RotateCcw /> : <Play />} onClick={() => setMoved((m) => !m)} className={styles.trackButton}>
          {moved ? 'Volver' : 'Reproducir las curvas'}
        </Button>
      </div>
      <ul role="list" className={styles.durations}>
        {DURATIONS.map((d) => (
          <li key={d.token}>
            <code className={styles.monoSmall}>{d.token}</code>
            <span className={styles.durValue}>{d.value}</span>
            <span className={styles.tokenUse}>{d.use}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Apartado ──────────────────────────────────────────────────────────── */

const STATUSES: FormationStatus[] = ['sin-empezar', 'leida', 'test-intentado', 'test-superado', 'completada'];

export function LiveSystem() {
  const [action, setAction] = useState<ActionStatus>('idle');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const [area, setArea] = useState<AreaId>('fiscal');
  const areaPanel = useId();
  const [email, setEmail] = useState('');
  const [office, setOffice] = useState('Barcelona');
  const [comment, setComment] = useState('');
  const [check, setCheck] = useState(true);
  const [toggle, setToggle] = useState(true);
  const emailError = email.trim() && !isCorporateEmail(email) ? 'Usa tu correo corporativo, el que termina en @flmexperts.com.' : undefined;

  const runAction = () => {
    setAction('pending');
    timers.current.push(window.setTimeout(() => setAction('success'), 900));
    timers.current.push(window.setTimeout(() => setAction('idle'), 2600));
  };

  return (
    <DossierSection id="sistema" number="03" eyebrow="Sistema de diseño" title="Un sistema vivo" lede="Estas muestras son los componentes reales del campus, no capturas: cambian con el tema y responden al teclado.">
      <SubHead hint="Contraste calculado en tu navegador con los colores del tema activo (WCAG 2.2: 4,5:1 para texto normal y 3:1 para texto grande y gráficos).">Color y contraste</SubHead>
      <LiveColors />

      <SubHead hint="Newsreader para titulares y lectura; Inter para la interfaz. Los tamaños son fluidos: el valor en píxeles se calcula ahora, con el ancho de tu ventana.">Escala tipográfica</SubHead>
      <ul role="list" className={styles.typeList}>
        {TYPE.map((row) => (
          <TypeRow key={row.token} row={row} />
        ))}
      </ul>

      <SubHead hint="Una sola acción principal (marino con texto blanco) por bloque. Objetivos de 44 px como mínimo en pantallas táctiles.">Botones</SubHead>
      <div className={styles.specimen}>
        <div className={styles.row}>
          <Button>Acción principal</Button>
          <Button variant="secondary">Secundaria</Button>
          <Button variant="soft" icon={<Plus />}>
            Suave
          </Button>
          <Button variant="ghost">Discreta</Button>
          <Button variant="danger">Peligro</Button>
        </div>
        <div className={styles.row}>
          <Button size="sm">Pequeño</Button>
          <Button size="lg" icon={<Search />}>
            Grande
          </Button>
          <IconButton label="Buscar (muestra)" icon={<Search />} variant="soft" />
          <IconButton label="Avisos (muestra)" icon={<Bell />} />
          <ActionButton status={action} label="Guardar borrador" pendingLabel="Guardando…" successLabel="Guardado" icon={<Save size={18} />} onClick={runAction} />
          <Button variant="secondary" icon={<Check />} onClick={() => toast.success('Cambios guardados', 'Así confirma el campus un guardado: con texto, icono y anuncio para lectores de pantalla.')}>
            Mostrar un aviso
          </Button>
        </div>
        <p className={styles.caption}>«Guardar borrador» muestra la respuesta de guardado: la cápsula se contrae mientras trabaja y vuelve a abrirse con la confirmación.</p>
      </div>

      <SubHead hint="Cápsulas con icono y texto: el color nunca va solo.">Etiquetas y estados</SubHead>
      <div className={styles.specimen}>
        <div className={styles.labelled}>
          <span className={styles.rowLabel}>Áreas</span>
          <div className={styles.row}>
            {AREA_LIST.map((a) => (
              <AreaTag key={a.id} area={a.id} />
            ))}
          </div>
        </div>
        <div className={styles.labelled}>
          <span className={styles.rowLabel}>Flujo editorial</span>
          <div className={styles.row}>
            <EditorialChip status="borrador" />
            <EditorialChip status="en-revision" />
            <EditorialChip status="publicado" />
            <EditorialChip status="archivado" />
          </div>
        </div>
        <div className={styles.labelled}>
          <span className={styles.rowLabel}>Aprendizaje</span>
          <div className={styles.row}>
            {STATUSES.map((s) => (
              <LearningChip key={s} status={s} />
            ))}
          </div>
        </div>
        <div className={styles.labelled}>
          <span className={styles.rowLabel}>Agenda</span>
          <div className={styles.row}>
            <PhaseChip phase="en-curso" />
            <PhaseChip phase="proximo" />
            <PhaseChip phase="proximo" pending />
            <PhaseChip phase="historico" />
            <PhaseChip phase="archivado" />
          </div>
        </div>
        <div className={styles.labelled}>
          <span className={styles.rowLabel}>Tonos</span>
          <div className={styles.row}>
            <Chip>Neutro</Chip>
            <Chip tone="info">Información</Chip>
            <Chip tone="success">Correcto</Chip>
            <Chip tone="warning">Atención</Chip>
            <Chip tone="danger">Error</Chip>
            <Chip tone="brand">Marca</Chip>
          </div>
        </div>
      </div>

      <SubHead hint="Círculo de dos mitades: izquierda, lectura; derecha, test (trama si se ha intentado, llena si se ha superado); completo con marca, formación completada. Siempre con su texto.">Glifo de estado de una formación</SubHead>
      <ul role="list" className={styles.glyphs}>
        {STATUSES.map((s) => (
          <li key={s}>
            <StatusGlyph status={s} size={28} />
          </li>
        ))}
        <li className={styles.rings}>
          <ProgressRing value={2} total={3} size={52} label="Formaciones completadas (muestra)">
            <span className={styles.ringValue}>2/3</span>
          </ProgressRing>
          <span className={styles.tokenUse}>Anillo de progreso con el degradado oficial</span>
        </li>
      </ul>

      <SubHead hint="Patrón de pestañas: flechas izquierda y derecha, Inicio y Fin. La cápsula activa se desliza.">Pestañas</SubHead>
      <div className={styles.specimen}>
        <Tabs label="Áreas (muestra)" options={AREA_LIST.map((a) => ({ value: a.id, label: a.name }))} value={area} onChange={setArea} panelId={areaPanel} />
        <div id={areaPanel} role="tabpanel" aria-label={`Área ${AREAS[area].name}`} className={styles.tabPanel} data-area={area}>
          <span className={styles.areaBar} aria-hidden="true" />
          <div>
            <p className={styles.tokenName}>{AREAS[area].name}</p>
            <p className={styles.tokenUse}>{AREAS[area].description}</p>
            <p className={styles.caption}>{area === 'contable' ? 'Contable usa la rampa completa del degradado: «la suma de las tres».' : `Color: la meseta de la cápsula oficial ${AREAS[area].capsule}, siempre con el nombre escrito.`}</p>
          </div>
        </div>
      </div>

      <SubHead hint="Etiqueta siempre visible, ayuda y error enlazados al campo, 48 px de alto.">Campos de formulario</SubHead>
      <div className={styles.specimen}>
        <Notice tone="info">Muestras interactivas: lo que escribas aquí no se guarda.</Notice>
        <div className={styles.fields}>
          <TextField label="Correo corporativo" type="email" autoComplete="off" hint="Prueba a escribir otro dominio para ver el error." value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} />
          <SelectField
            label="Sede"
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            options={[
              { value: 'Barcelona', label: 'Barcelona' },
              { value: 'Vic', label: 'Vic' },
              { value: 'Granollers', label: 'Granollers' },
            ]}
          />
          <TextArea label="Comentario" hint="Hasta 140 caracteres." maxLength={140} value={comment} onChange={(e) => setComment(e.target.value)} />
          <div className={styles.checks}>
            <Checkbox label="Mostrar mi cumpleaños en el calendario" hint="Solo día y mes." checked={check} onChange={setCheck} />
            <Switch label="Atajos de una tecla" description="Muestra del interruptor accesible." checked={toggle} onChange={setToggle} />
            <p className={styles.caption}>
              Teclas: <Kbd>Tab</Kbd> para moverte, <Kbd>Espacio</Kbd> para marcar, <Kbd>Esc</Kbd> para cerrar.
            </p>
          </div>
        </div>
      </div>

      <SubHead hint="Movimiento con propósito, de 150 a 450 ms, con las curvas del sistema. Con el movimiento reducido, las curvas se recorren al instante.">Movimiento</SubHead>
      <MotionTokens />
    </DossierSection>
  );
}

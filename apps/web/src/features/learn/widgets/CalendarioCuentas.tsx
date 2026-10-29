import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw, TriangleAlert } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { diffDays, madridDateKey, monthShort, type WidgetSpec } from '@flm/shared';
import { Button, Notice } from '@/design';
import { calendarioCuentas, estadoPlazo, isDateKey, type EstadoPlazo } from './calc';
import { fechaConDia } from './format';
import { DateField, ExternalLink, Frame, LiveRegion, useSeen, useTransition } from './ui';
import ui from './ui.module.css';
import styles from './CalendarioCuentas.module.css';

type Spec = Extract<WidgetSpec, { kind: 'calendario-cuentas' }>;

const SOURCES = [
  { label: 'Arts. 164, 253, 279 y 282 LSC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a253' },
  { label: 'Art. 18 Ley 14/2013', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074#a18' },
  { label: 'Art. 378 RRM', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-17533#a378' },
];

interface Hito {
  id: string;
  title: string;
  short: string;
  date: string;
  rule: string;
  ref: { label: string; url: string };
  kind: 'inicio' | 'plazo' | 'consecuencia';
  note?: string;
}

const STATUS_TEXT = (estado: EstadoPlazo, dias: number) => {
  if (estado === 'vencido') return 'Vencido';
  if (estado === 'hoy') return 'Vence hoy';
  return dias === 1 ? 'Queda 1 día' : `Quedan ${dias} días`;
};

export function CalendarioCuentas({ spec, headingLevel = 3 }: { spec: Spec; headingLevel?: 2 | 3 | 4 }) {
  const [cierre, setCierre] = useState(spec.cierre);
  const [junta, setJunta] = useState<string | null>(null);
  const hoy = madridDateKey();
  const valid = isDateKey(cierre);
  const cal = calendarioCuentas(valid ? cierre : spec.cierre, junta);
  const juntaValue = junta ?? cal.juntaLimite;
  const juntaInvalida = junta !== null && junta <= cal.cierre;
  const juntaTardia = junta !== null && !juntaInvalida && junta > cal.juntaLimite;

  const hitos: Hito[] = [
    { id: 'cierre', title: 'Cierre del ejercicio', short: 'Cierre', date: cal.cierre, rule: 'Punto de partida de todos los plazos', ref: { label: 'Art. 5.1 CC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763#art5' }, kind: 'inicio' },
    { id: 'formulacion', title: 'Formular las cuentas anuales', short: 'Formular', date: cal.formulacion, rule: '3 meses desde el cierre. Firman todos los administradores.', ref: { label: 'Art. 253 LSC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a253' }, kind: 'plazo' },
    { id: 'legalizacion', title: 'Legalizar los libros', short: 'Libros', date: cal.legalizacion, rule: 'Antes de que pasen 4 meses desde el cierre, por vía telemática.', ref: { label: 'Art. 18 Ley 14/2013', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2013-10074#a18' }, kind: 'plazo' },
    {
      id: 'junta',
      title: 'Aprobar las cuentas en junta',
      short: 'Junta',
      date: cal.juntaLimite,
      rule: 'Dentro de los 6 primeros meses del ejercicio siguiente. Convoca con 15 días de antelación (SL) o un mes (SA).',
      ref: { label: 'Art. 164 LSC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a164' },
      kind: 'plazo',
      note: cal.aprobacion !== cal.juntaLimite ? `Junta prevista: ${fechaConDia(cal.aprobacion)}.` : undefined,
    },
    { id: 'deposito', title: 'Depositar en el Registro Mercantil', short: 'Depósito', date: cal.deposito, rule: `Dentro del mes siguiente a la aprobación (${cal.aprobacion === cal.juntaLimite ? 'si la junta se celebra el último día posible' : 'con la junta prevista'}).`, ref: { label: 'Art. 279 LSC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a279' }, kind: 'plazo' },
    { id: 'registral', title: 'Si no se deposita: cierre registral', short: 'Cierre registral', date: cal.cierreRegistral, rule: 'Pasado un año desde el cierre sin depósito, el Registro no inscribe documentos de la sociedad (salvo excepciones).', ref: { label: 'Art. 282 LSC', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2010-10544#a282' }, kind: 'consecuencia' },
  ];

  const live = `Con cierre el ${fechaConDia(cal.cierre)}: formular hasta el ${fechaConDia(cal.formulacion)}; legalizar los libros hasta el ${fechaConDia(cal.legalizacion)}; junta hasta el ${fechaConDia(cal.juntaLimite)}; depósito hasta el ${fechaConDia(cal.deposito)}.`;

  return (
    <Frame
      kind="Calendario · LSC y Ley 14/2013"
      title="Calendario de las cuentas anuales"
      intro="Cambia la fecha de cierre y mira cómo se mueven los plazos. Los meses se cuentan de fecha a fecha; si el día no existe, vence el último día del mes."
      sources={SOURCES}
      verified
      headingLevel={headingLevel}
    >
      <div className={styles.layout}>
        <div className={styles.inputs}>
          <DateField label="Fecha de cierre del ejercicio" value={cierre} onChange={(v) => setCierre(v)} />
          <div className={styles.juntaField}>
            <DateField label="Fecha prevista de la junta" value={juntaValue} onChange={(v) => setJunta(v)} hint="Por defecto, el último día posible. El depósito se cuenta desde la aprobación." />
            {junta !== null && (
              <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={() => setJunta(null)}>
                Usar la fecha límite
              </Button>
            )}
          </div>
        </div>
        {juntaInvalida && (
          <Notice tone="warning" icon={<TriangleAlert size={18} />}>
            La junta debe celebrarse después del cierre del ejercicio. Calculamos el depósito con la fecha límite.
          </Notice>
        )}
        {juntaTardia && (
          <Notice tone="warning" icon={<TriangleAlert size={18} />}>
            Una junta fuera de plazo es válida, pero retrasa el depósito y el resto del calendario.
          </Notice>
        )}

        <Ruler cierre={cal.cierre} hitos={hitos} hoy={hoy} />

        <ol className={styles.list} role="list">
          {hitos.map((h, i) => (
            <Milestone key={h.id} hito={h} hoy={hoy} index={i} />
          ))}
        </ol>
      </div>
      <LiveRegion message={live} />
    </Frame>
  );
}

function Milestone({ hito, hoy, index }: { hito: Hito; hoy: string; index: number }) {
  const [ref, seen] = useSeen<HTMLLIElement>();
  const { t, reduce } = useTransition();
  const { estado, dias } = estadoPlazo(hito.date, hoy);
  const day = Number(hito.date.slice(8, 10));
  const month = monthShort(Number(hito.date.slice(5, 7)));
  const year = hito.date.slice(0, 4);
  let chip: { text: string; tone: string } | null = null;
  if (hito.kind === 'plazo') chip = { text: STATUS_TEXT(estado, dias), tone: estado === 'vencido' ? 'danger' : estado === 'en-plazo' ? 'neutral' : 'warning' };
  if (hito.kind === 'inicio') chip = { text: dias < 0 ? 'Ejercicio cerrado' : dias === 0 ? 'Cierra hoy' : dias === 1 ? 'Cierra mañana' : `Cierra en ${dias} días`, tone: 'neutral' };
  if (hito.kind === 'consecuencia') chip = { text: 'Si no hay depósito', tone: 'neutral' };
  return (
    <motion.li
      ref={ref}
      className={styles.item}
      data-kind={hito.kind}
      data-state={hito.kind === 'plazo' ? estado : undefined}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={seen || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={t(0.36, index * 0.06)}
    >
      <span className={styles.node} aria-hidden="true" />
      <span className={styles.date} aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={hito.date} className={styles.dateInner} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={t(0.26)}>
            <span className={styles.day}>{day}</span>
            <span className={styles.month}>
              {month} {year}
            </span>
          </motion.span>
        </AnimatePresence>
      </span>
      <div className={styles.content}>
        <p className={styles.itemTitle}>{hito.title}</p>
        <p className={styles.when}>
          <time dateTime={hito.date}>{fechaConDia(hito.date)}</time>
        </p>
        <p className={styles.rule}>
          {hito.rule} <ExternalLink href={hito.ref.url}>{hito.ref.label}</ExternalLink>
        </p>
        {hito.note && <p className={styles.note}>{hito.note}</p>}
      </div>
      {chip && (
        <span className={styles.chip} data-tone={chip.tone}>
          {chip.text}
        </span>
      )}
    </motion.li>
  );
}

/* Regla proporcional de 13 meses desde el cierre, con «hoy» si cae dentro. */
function Ruler({ cierre, hitos, hoy }: { cierre: string; hitos: Hito[]; hoy: string }) {
  const span = Math.max(1, diffDays(cierre, hitos[hitos.length - 1]!.date) + 31);
  const pos = (d: string) => Math.min(100, Math.max(0, (diffDays(cierre, d) / span) * 100));
  const hoyPos = diffDays(cierre, hoy) >= 0 && diffDays(cierre, hoy) <= span ? pos(hoy) : null;
  const months = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className={styles.ruler} aria-hidden="true">
      <div className={styles.rulerTrack}>
        {months.map((m) => (
          <span key={m} className={styles.tick} style={{ left: `${Math.min(100, ((m * 30.44) / span) * 100)}%` }} />
        ))}
        {hoyPos !== null && (
          <span className={styles.today} style={{ left: `${hoyPos}%` }}>
            <span>Hoy</span>
          </span>
        )}
        {hitos.map((h, i) => (
          <span key={h.id} className={styles.dot} data-kind={h.kind} data-row={i % 2 ? 'top' : 'bottom'} style={{ '--x': pos(h.date) } as CSSProperties}>
            <span className={styles.dotLabel}>{h.short}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

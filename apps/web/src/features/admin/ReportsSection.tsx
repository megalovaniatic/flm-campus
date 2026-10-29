import { motion } from 'motion/react';
import { CalendarClock, ChartColumn, Download, FlaskConical, TriangleAlert, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AREAS, formatShortDate, percent, plainText, type Department, type Office } from '@flm/shared';
import { AreaTag, Avatar, Button, Checkbox, Chip, EmptyState, Notice, SelectField, StatusGlyph, toast } from '@/design';
import { assignments, useFormations, useMe, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { downloadText, toCsv } from '@/lib/download';
import { useReducedMotionPref } from '@/lib/preferences';
import { useMediaQuery } from '@/features/manage/useMediaQuery';
import { buildReport, errorsFor, statusLabel, type ComplianceRow, type DataOrigin } from './reportData';
import styles from './Admin.module.css';

const base = import.meta.env.BASE_URL;

function OriginTag({ origin }: { origin: DataOrigin }) {
  return origin === 'real' ? (
    <Chip size="sm" tone="info" icon={<UserRound size={14} />}>
      Datos reales (tú)
    </Chip>
  ) : (
    <Chip size="sm" tone="inverse" icon={<FlaskConical size={14} />}>
      Datos simulados
    </Chip>
  );
}

/** Medidor de una proporción: relleno de un solo tono sobre una pista del mismo tono, más claro. */
function Meter({ value }: { value: number }) {
  const reduce = useReducedMotionPref();
  return (
    <span className={styles.meter} aria-hidden="true">
      <motion.span className={styles.meterFill} initial={reduce ? false : { width: 0 }} animate={{ width: `${Math.round(value * 100)}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
    </span>
  );
}

function completedAt(r: ComplianceRow): string {
  if (!r.completed) return '';
  const pass = r.attempts.find((a) => a.passed)?.at ?? '';
  return pass.slice(0, 10);
}

/** Informes restringidos: cumplimiento de obligatorias y errores frecuentes, con exportación CSV. */
export function ReportsSection() {
  const me = useMe();
  const people = usePeople();
  const formations = useFormations();
  const progress = useDemo((s) => s.progress);
  const userId = useDemo((s) => s.userId);
  const compact = useMediaQuery('(max-width: 979px)');
  const [dept, setDept] = useState('');
  const [office, setOffice] = useState('');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [limit, setLimit] = useState(20);
  const report = useMemo(() => buildReport({ people, formations, assignments, demoUserId: userId, progress }), [people, formations, userId, progress]);
  const [errorsId, setErrorsId] = useState('');
  const errorsFormation = report.byFormation.find((f) => f.formation.id === errorsId)?.formation ?? report.byFormation[0]?.formation;
  const errors = useMemo(() => (errorsFormation ? errorsFor(report, errorsFormation) : null), [report, errorsFormation]);

  if (!me) return null;
  const actorId = me.id;
  const exportCsv = (name: string, rows: (string | number | undefined)[][], detail: string, entityId?: string) => {
    downloadText(`flm-campus-${name}-${report.today}.csv`, toCsv(rows), 'text/csv;charset=utf-8');
    useDemo.getState().log({ actorId, action: 'informe.exportar', entity: 'informe', ...(entityId ? { entityId } : {}), detail });
    toast.success('Informe exportado', 'CSV con separador «;», listo para abrir en Excel. La exportación consta en la auditoría.');
  };

  const intro = (
    <Notice icon={<FlaskConical size={18} />} title="Datos simulados">
      Solo tú, como persona de la demostración, aportas progreso real. Las personas ficticias reciben datos simulados y deterministas para ilustrar el informe. A las personas reales que firman contenidos no se les inventa progreso: no figuran aquí ({report.excludedReal}).
    </Notice>
  );

  if (report.byFormation.length === 0) {
    return (
      <section className={styles.section} aria-labelledby="h-informes">
        <h2 id="h-informes" className="sr-only">
          Informes
        </h2>
        {intro}
        <EmptyState icon={<ChartColumn />} title="Todavía no hay formaciones obligatorias publicadas">
          <p>
            Hay {report.pendingAssignments.length === 1 ? '1 asignación obligatoria' : `${report.pendingAssignments.length} asignaciones obligatorias`} a la espera de que se publique su formación. En cuanto estén en Aprender, verás aquí el cumplimiento por formación y por persona, y los errores frecuentes de sus tests.
          </p>
          {report.pendingAssignments.length > 0 && (
            <ul role="list" className={styles.pendingList}>
              {report.pendingAssignments.map((a) => (
                <li key={a.id}>
                  <CalendarClock size={16} aria-hidden="true" /> {a.target.kind === 'todos' ? 'Toda la firma' : '1 persona'}
                  {a.dueDate ? ` · fecha límite: ${formatShortDate(a.dueDate)}` : ''}
                </li>
              ))}
            </ul>
          )}
        </EmptyState>
      </section>
    );
  }

  const totals = report.rows.reduce((t, r) => ({ assigned: t.assigned + 1, completed: t.completed + (r.completed ? 1 : 0), overdue: t.overdue + (r.overdue ? 1 : 0) }), { assigned: 0, completed: 0, overdue: 0 });
  const departments = [...new Set(report.byPerson.map((p) => p.person.department))].sort((a, b) => a.localeCompare(b, 'es')) as Department[];
  const persons = report.byPerson.filter((p) => (!dept || p.person.department === dept) && (!office || p.person.office === office) && (!onlyOverdue || p.overdue > 0)).sort((a, b) => Number(b.origin === 'real') - Number(a.origin === 'real') || b.overdue - a.overdue || a.person.name.localeCompare(b.person.name, 'es'));
  const maxError = errors ? Math.max(0, ...errors.questions.map((q) => q.errorRate)) : 0;

  return (
    <section className={styles.section} aria-labelledby="h-informes">
      <h2 id="h-informes" className="sr-only">
        Informes
      </h2>
      {intro}

      <dl className={styles.kpis}>
        <div className={`${styles.kpi} ${styles.kpiHero}`}>
          <dt>Cumplimiento global</dt>
          <dd>{percent(totals.assigned ? totals.completed / totals.assigned : 0)}</dd>
        </div>
        <div className={styles.kpi}>
          <dt>Asignaciones persona–formación</dt>
          <dd>{totals.assigned}</dd>
        </div>
        <div className={styles.kpi}>
          <dt>Completadas</dt>
          <dd>{totals.completed}</dd>
        </div>
        <div className={styles.kpi} data-tone={totals.overdue ? 'warning' : undefined}>
          <dt>
            {totals.overdue > 0 && <TriangleAlert size={14} aria-hidden="true" />} Vencidas
          </dt>
          <dd>{totals.overdue}</dd>
        </div>
      </dl>

      {/* Por formación */}
      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>Cumplimiento por formación</h3>
          <Button
            size="sm"
            variant="secondary"
            icon={<Download />}
            onClick={() =>
              exportCsv(
                'cumplimiento-formaciones',
                [
                  ['Formación', 'Área', 'Versión', 'Asignadas', 'Completadas', 'Pendientes', 'Vencidas', '% completado', 'Origen de los datos'],
                  ...report.byFormation.map((f) => [f.formation.title, AREAS[f.formation.area].name, f.formation.version, f.assigned, f.completed, f.pending, f.overdue, f.rate === null ? '' : Math.round(f.rate * 100), 'Simulado salvo la persona de la demo']),
                ],
                'Cumplimiento (formaciones)',
              )
            }
          >
            Exportar CSV
          </Button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="sr-only">Cumplimiento por formación</caption>
            <thead>
              <tr>
                <th scope="col">Formación</th>
                <th scope="col">Asignada a</th>
                <th scope="col">Fecha límite</th>
                <th scope="col">Completadas</th>
                <th scope="col" className={styles.num}>
                  Pendientes
                </th>
                <th scope="col" className={styles.num}>
                  Vencidas
                </th>
              </tr>
            </thead>
            <tbody>
              {report.byFormation.map((f) => (
                <tr key={f.formation.id}>
                  <td>
                    <span className={styles.cellMain}>{f.formation.title}</span>
                    <span className={styles.cellSub}>
                      <AreaTag area={f.formation.area} size="sm" /> versión {f.formation.version}
                    </span>
                  </td>
                  <td>{f.target}</td>
                  <td className={styles.nowrap}>{f.dueDate ? formatShortDate(f.dueDate) : '—'}</td>
                  <td>
                    <span className={styles.meterCell}>
                      <Meter value={f.rate ?? 0} />
                      <span className={styles.meterText}>
                        {f.completed}/{f.assigned} · {percent(f.rate ?? 0)}
                      </span>
                    </span>
                  </td>
                  <td className={styles.num}>{f.pending}</td>
                  <td className={styles.num}>
                    {f.overdue > 0 ? (
                      <span className={styles.overdue}>
                        <TriangleAlert size={14} aria-hidden="true" /> {f.overdue}
                      </span>
                    ) : (
                      0
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Por persona */}
      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>Cumplimiento por persona</h3>
          <Button
            size="sm"
            variant="secondary"
            icon={<Download />}
            onClick={() =>
              exportCsv(
                'cumplimiento-personas',
                [
                  ['Persona', 'Departamento', 'Oficina', 'Formación', 'Versión', 'Estado', 'Completada', 'Fecha de finalización', 'Fecha límite', 'Vencida', 'Intentos', 'Origen de los datos'],
                  ...report.rows.map((r) => [r.person.name, r.person.department, r.person.office, r.formation.title, r.formation.version, statusLabel(r.status), r.completed ? 'Sí' : 'No', completedAt(r), r.dueDate ?? '', r.overdue ? 'Sí' : 'No', r.attempts.length, r.origin === 'real' ? 'Real (demo)' : 'Simulado']),
                ],
                'Cumplimiento (personas)',
              )
            }
          >
            Exportar CSV
          </Button>
        </div>
        <div className={styles.filters3}>
          <SelectField label="Departamento" value={dept} onChange={(e) => setDept(e.target.value)} options={[{ value: '', label: 'Todos' }, ...departments.map((d) => ({ value: d, label: d }))]} />
          <SelectField label="Sede" value={office} onChange={(e) => setOffice(e.target.value)} options={[{ value: '', label: 'Todas' }, ...(['Barcelona', 'Vic', 'Granollers'] as Office[]).map((o) => ({ value: o, label: o }))]} />
          <div className={styles.checkCell}>
            <Checkbox label="Solo con vencidas" checked={onlyOverdue} onChange={setOnlyOverdue} />
          </div>
        </div>
        <p className={styles.count} aria-live="polite">
          {persons.length === 1 ? '1 persona' : `${persons.length} personas`}
        </p>
        {persons.length === 0 ? (
          <EmptyState title="Nadie cumple estos filtros">
            <p>Quita algún filtro para ver más personas.</p>
          </EmptyState>
        ) : (
          <ul role="list" className={styles.personList}>
            {persons.slice(0, limit).map((p) => (
              <li key={p.person.id} className={styles.personRow} data-compact={compact || undefined}>
                <span className={styles.person}>
                  <Avatar name={p.person.name} photo={p.person.photo ? base + p.person.photo : undefined} size={36} decorative />
                  <span className={styles.personText}>
                    <span className={styles.personName}>{p.person.name}</span>
                    <span className={styles.personMail}>
                      {p.person.department} · {p.person.office}
                    </span>
                  </span>
                </span>
                <OriginTag origin={p.origin} />
                <span className={styles.personTotals}>
                  <strong>
                    {p.completed}/{p.assigned}
                  </strong>{' '}
                  completadas
                  {p.overdue > 0 && (
                    <span className={styles.overdue}>
                      {' '}
                      · <TriangleAlert size={14} aria-hidden="true" /> {p.overdue} {p.overdue === 1 ? 'vencida' : 'vencidas'}
                    </span>
                  )}
                </span>
                <ul role="list" className={styles.personItems}>
                  {p.items.map((r) => (
                    <li key={r.formation.id}>
                      <StatusGlyph status={r.status} size={18} withLabel={false} />
                      <span>
                        <span className={styles.itemTitle}>{r.formation.title}</span>
                        <span className={styles.cellSub}>
                          {statusLabel(r.status)}
                          {r.dueDate ? ` · antes del ${formatShortDate(r.dueDate, false)}` : ''}
                          {r.overdue ? ' · vencida' : ''}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
        {persons.length > limit && (
          <div className={styles.moreRow}>
            <Button variant="secondary" onClick={() => setLimit((l) => l + 20)}>
              Mostrar más ({persons.length - limit} restantes)
            </Button>
          </div>
        )}
      </div>

      {/* Errores frecuentes */}
      {errorsFormation && errors && (
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h3 className={styles.blockTitle}>Errores frecuentes por pregunta</h3>
            <Button
              size="sm"
              variant="secondary"
              icon={<Download />}
              onClick={() =>
                exportCsv(
                  `errores-${errorsFormation.slug}`,
                  [['Pregunta', 'Enunciado', 'Respuestas', '% de error', 'Respuesta incorrecta más elegida'], ...errors.questions.map((q) => [q.questionId, plainText(q.prompt), q.responses, Math.round(q.errorRate * 100), q.mostChosenWrong ? plainText(q.mostChosenWrong) : ''])],
                  'Errores frecuentes',
                  errorsFormation.id,
                )
              }
            >
              Exportar CSV
            </Button>
          </div>
          <div className={styles.filters3}>
            <SelectField label="Formación" value={errorsFormation.id} onChange={(e) => setErrorsId(e.target.value)} options={report.byFormation.map((f) => ({ value: f.formation.id, label: f.formation.title }))} />
          </div>
          <p className={styles.count}>
            {errors.attempts} {errors.attempts === 1 ? 'intento' : 'intentos'} de la versión vigente · {errors.passed} {errors.passed === 1 ? 'aprobado' : 'aprobados'}
            {errors.realAttempts > 0 ? ` · ${errors.realAttempts} tuyos, reales` : ''}. La pregunta con más errores va primero y se destaca.
          </p>
          <ol role="list" className={styles.errors}>
            {errors.questions.map((q, i) => {
              const top = q.errorRate > 0 && q.errorRate === maxError;
              return (
                <li key={q.questionId} className={styles.errorRow} data-top={top || undefined}>
                  <span className={styles.errorRank}>{i + 1}</span>
                  <div className={styles.errorBody}>
                    <p className={styles.errorPrompt}>{plainText(q.prompt)}</p>
                    <span className={styles.errorBar}>
                      <span className={styles.errorTrack} aria-hidden="true">
                        <span className={styles.errorFill} style={{ width: `${Math.max(2, Math.round(q.errorRate * 100))}%` }} />
                      </span>
                      <span className={styles.errorValue}>
                        {percent(q.errorRate)} de error · {q.responses} {q.responses === 1 ? 'respuesta' : 'respuestas'}
                      </span>
                    </span>
                    {q.mostChosenWrong && <p className={styles.cellSub}>Respuesta incorrecta más elegida: «{plainText(q.mostChosenWrong)}»</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}

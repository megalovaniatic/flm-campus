import { motion } from 'motion/react';
import { ChartColumn, Download, FlaskConical } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AREAS, percent, plainText } from '@flm/shared';
import { AreaTag, Button, EmptyState, Notice, SelectField, toast } from '@/design';
import { useFormations, useMe, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { downloadText, toCsv } from '@/lib/download';
import { useReducedMotionPref } from '@/lib/preferences';
import { buildReport, errorsFor } from './reportData';
import styles from './Admin.module.css';

/** Medidor de una proporción: relleno de un solo tono sobre una pista del mismo tono, más claro. */
function Meter({ value }: { value: number }) {
  const reduce = useReducedMotionPref();
  return (
    <span className={styles.meter} aria-hidden="true">
      <motion.span className={styles.meterFill} initial={reduce ? false : { width: 0 }} animate={{ width: `${Math.round(value * 100)}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
    </span>
  );
}

/**
 * Informes restringidos: participación por formación y errores frecuentes, con exportación CSV.
 * Las formaciones son voluntarias: todo es agregado y nadie aparece por su nombre.
 */
export function ReportsSection() {
  const me = useMe();
  const people = usePeople();
  const formations = useFormations();
  const progress = useDemo((s) => s.progress);
  const userId = useDemo((s) => s.userId);
  const report = useMemo(() => buildReport({ people, formations, demoUserId: userId, progress }), [people, formations, userId, progress]);
  const [errorsId, setErrorsId] = useState('');
  const errorsFormation = report.formations.find((f) => f.id === errorsId) ?? report.formations[0];
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
      Las formaciones son voluntarias, así que el informe solo da recuentos: nadie aparece por su nombre. Solo tú, como persona de la demostración, aportas progreso real; las personas ficticias reciben datos simulados y deterministas para ilustrarlo. A las personas reales que firman contenidos no se les inventa progreso: no se cuentan ({report.excludedReal}).
    </Notice>
  );

  if (report.formations.length === 0) {
    return (
      <section className={styles.section} aria-labelledby="h-informes">
        <h2 id="h-informes" className="sr-only">
          Informes
        </h2>
        {intro}
        <EmptyState icon={<ChartColumn />} title="Todavía no hay formaciones publicadas">
          <p>En cuanto haya formaciones en Aprender, verás aquí la participación en cada una y los errores más frecuentes de sus tests.</p>
        </EmptyState>
      </section>
    );
  }

  const maxError = errors ? Math.max(0, ...errors.questions.map((q) => q.errorRate)) : 0;
  // Avance medio: formaciones completadas sobre todas las que podría haber completado el equipo
  const possible = report.people * report.formations.length;

  return (
    <section className={styles.section} aria-labelledby="h-informes">
      <h2 id="h-informes" className="sr-only">
        Informes
      </h2>
      {intro}

      <dl className={styles.kpis}>
        <div className={`${styles.kpi} ${styles.kpiHero}`}>
          <dt>Avance medio del equipo</dt>
          <dd>{percent(possible ? report.totals.completed / possible : 0)}</dd>
        </div>
        <div className={styles.kpi}>
          <dt>Personas que han completado alguna</dt>
          <dd>
            {report.totals.withCompleted} de {report.people}
          </dd>
        </div>
        <div className={styles.kpi}>
          <dt>Completadas (persona × formación)</dt>
          <dd>
            {report.totals.completed} de {possible}
          </dd>
        </div>
        <div className={styles.kpi}>
          <dt>Formaciones publicadas</dt>
          <dd>{report.formations.length}</dd>
        </div>
      </dl>

      {/* Por formación */}
      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>Participación por formación</h3>
          <Button
            size="sm"
            variant="secondary"
            icon={<Download />}
            onClick={() =>
              exportCsv(
                'participacion-formaciones',
                [
                  ['Formación', 'Área', 'Versión', 'Personas', 'Completada', 'A medias', 'Sin empezar', '% completada', 'Origen de los datos'],
                  ...report.byFormation.map((f) => [f.formation.title, AREAS[f.formation.area].name, f.formation.version, f.people, f.completed, f.inProgress, f.notStarted, f.rate === null ? '' : Math.round(f.rate * 100), 'Simulado salvo la persona de la demo']),
                ],
                'Participación por formación',
              )
            }
          >
            Exportar CSV
          </Button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="sr-only">Participación por formación</caption>
            <thead>
              <tr>
                <th scope="col">Formación</th>
                <th scope="col">Completada</th>
                <th scope="col" className={styles.num}>
                  A medias
                </th>
                <th scope="col" className={styles.num}>
                  Sin empezar
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
                  <td>
                    <span className={styles.meterCell}>
                      <Meter value={f.rate ?? 0} />
                      <span className={styles.meterText}>
                        {f.completed}/{f.people} · {percent(f.rate ?? 0)}
                      </span>
                    </span>
                  </td>
                  <td className={styles.num}>{f.inProgress}</td>
                  <td className={styles.num}>{f.notStarted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            <SelectField label="Formación" value={errorsFormation.id} onChange={(e) => setErrorsId(e.target.value)} options={report.formations.map((f) => ({ value: f.id, label: f.title }))} />
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

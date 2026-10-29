import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { toCsv } from '../src/lib/csv';
import { EMAILS, FORMATION_CORRECT, IDS } from './fixtures/seed';
import { createTestEnv, DAY, json, loginAs, PASSWORD, TestClient, type TestEnv } from './helpers';

const allCorrect = (n = 10) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`e${i + 1}`, 'a']));

describe('aprendizaje', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('sirve la formación sin respuestas correctas, explicaciones ni retroalimentación', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const res = await employee.get(`/api/formations/${IDS.formation}`);
    expect(res.status).toBe(200);
    const body = await json(res);
    const text = JSON.stringify(body.formation.quiz);
    expect(text).not.toMatch(/correctOptionId|explanation|feedback/);
    expect(body.formation.quiz.questions[0].options[0]).toEqual({ id: 'a', text: 'Opción A de q1' });
    expect(body.formation.blocks).toHaveLength(3);
    expect(body.progress).toMatchObject({ status: 'sin-empezar' });
    expect(body.assignment).toMatchObject({ mandatory: true, dueDate: '2026-11-30', overdue: false });
    // También por slug.
    expect((await employee.get('/api/formations/recargos-extemporaneos')).status).toBe(200);
  });

  it('confirma la lectura, corrige el test en el servidor y guarda el historial propio', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const read = await employee.post(`/api/formations/${IDS.formation}/read`, { version: 1 });
    expect((await json(read)).progress).toMatchObject({ status: 'leida', readVersion: 1 });

    const incomplete = await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: { q1: 'a' } });
    expect(incomplete.status).toBe(400);
    expect((await json(incomplete)).error.code).toBe('RESPUESTAS_INCOMPLETAS');
    const invalid = await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: { ...FORMATION_CORRECT, q3: 'z' } });
    expect(invalid.status).toBe(400);

    const failed = await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: { q1: 'a', q2: 'a', q3: 'a' } });
    expect(failed.status).toBe(201);
    const result = await json(failed);
    expect(result).toMatchObject({ correct: 1, total: 3, passMark: 2, passed: false, progress: { status: 'test-intentado' } });
    expect(result.results[1]).toMatchObject({
      questionId: 'q2',
      chosen: 'a',
      correct: false,
      correctOptionId: 'b',
      explanation: 'Explicación de la pregunta q2',
      feedback: 'La opción a de q2 no es correcta.',
    });

    env.clock.advance(60_000);
    const passed = await json(await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: FORMATION_CORRECT, version: 1 }));
    expect(passed).toMatchObject({ correct: 3, passed: true, progress: { status: 'completada' } });

    const history = await json(await employee.get(`/api/formations/${IDS.formation}/attempts`));
    expect(history.items).toHaveLength(2);
    expect(history.items[0]).toMatchObject({ version: 1, correct: 3, total: 3, passed: true, answers: FORMATION_CORRECT });
    expect(history.items[1].at < history.items[0].at).toBe(true);
    const mine = await json(await employee.get('/api/me/attempts'));
    expect(mine.items[0]).toMatchObject({ contentId: IDS.formation, contentType: 'formacion' });

    const other = await loginAs(env, EMAILS.reservada);
    expect((await json(await other.get(`/api/formations/${IDS.formation}/attempts`))).items).toHaveLength(0);
  });

  it('rechaza un intento sobre una versión desactualizada', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const res = await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: FORMATION_CORRECT, version: 7 });
    expect(res.status).toBe(409);
    expect((await json(res)).error.code).toBe('VERSION_DESACTUALIZADA');
  });

  it('evaluaciones sectoriales: 10 preguntas, aprobado con 8', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const list = await json(await employee.get('/api/assessments?area=fiscal'));
    expect(list.items[0]).toMatchObject({ id: IDS.assessment, questions: 10, passMark: 8, passed: false });
    const detail = await json(await employee.get(`/api/assessments/${IDS.assessment}`));
    expect(JSON.stringify(detail)).not.toMatch(/correctOptionId|explanation|feedback/);

    const seven = await json(await employee.post(`/api/assessments/${IDS.assessment}/attempts`, { answers: { ...allCorrect(), e8: 'b', e9: 'b', e10: 'c' } }));
    expect(seven).toMatchObject({ correct: 7, total: 10, passed: false });
    const eight = await json(await employee.post(`/api/assessments/${IDS.assessment}/attempts`, { answers: { ...allCorrect(), e9: 'b', e10: 'c' } }));
    expect(eight).toMatchObject({ correct: 8, passed: true });
    expect(eight.results).toHaveLength(10);
    expect((await json(await employee.get(`/api/assessments/${IDS.assessment}/attempts`))).items).toHaveLength(2);
  });

  it('asignaciones obligatorias a una persona o a «todos», incluidas las altas futuras', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const extra = await admin.post('/api/assignments', { formationId: IDS.formation, target: { kind: 'persona', personId: IDS.empleado }, dueDate: '2026-11-15' });
    expect(extra.status).toBe(201);
    expect((await admin.post('/api/assignments', { formationId: IDS.formation, target: { kind: 'persona', personId: IDS.empleado } })).status).toBe(409);
    expect((await admin.post('/api/assignments', { formationId: 'no-existe', target: { kind: 'todos' } })).status).toBe(404);

    const employee = await loginAs(env, EMAILS.empleado);
    const progress = await json(await employee.get('/api/me/progress'));
    expect(progress.mandatory[0].assignment).toMatchObject({ dueDate: '2026-11-15', overdue: false });

    // Alta posterior a la asignación a «todos».
    const created = await json(
      await admin.post('/api/people', { email: 'nueva.alta@flmexperts.com', name: 'Nueva Alta', position: 'Asesora', department: 'Laboral', office: 'Vic', role: 'empleado' }),
    );
    const report = await json(await admin.get('/api/reports/compliance'));
    expect(report.rows.some((r: { personId: string }) => r.personId === created.person.id)).toBe(true);

    const items = await json(await admin.get('/api/assignments'));
    expect(items.items).toHaveLength(2);
    expect(items.items.find((a: { target: { kind: string } }) => a.target.kind === 'persona')).toMatchObject({ personName: 'Pau Empleado Camps' });

    // Pasada la fecha límite sin completarla, figura como vencida (nueva sesión: la anterior ya caducó).
    env.clock.advance(20 * DAY);
    const later = await loginAs(env, EMAILS.empleado);
    const late = await json(await later.get('/api/me/progress'));
    expect(late.mandatory[0].assignment.overdue).toBe(true);

    const admin2 = await loginAs(env, EMAILS.admin);
    expect((await admin2.delete(`/api/assignments/${(await json(extra)).assignment.id}`)).status).toBe(200);
  });
});

describe('informes restringidos', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('cumplimiento por persona y por formación, y exportación CSV', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    await employee.post(`/api/formations/${IDS.formation}/read`, {});
    await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: FORMATION_CORRECT });
    const admin = await loginAs(env, EMAILS.admin);

    const report = await json(await admin.get('/api/reports/compliance'));
    const pau = report.byPerson.find((p: { personId: string }) => p.personId === IDS.empleado);
    expect(pau).toMatchObject({ assigned: 1, completed: 1, overdue: 0 });
    expect(pau.items[0]).toMatchObject({ status: 'completada', statusLabel: 'Formación completada', dueDate: '2026-11-30' });
    const formation = report.byFormation.find((f: { formationId: string }) => f.formationId === IDS.formation);
    expect(formation.assigned).toBe(report.byPerson.length);
    expect(formation.completed).toBe(1);
    expect(formation.completionRate).toBe(Math.round((1 / formation.assigned) * 100));

    const csv = await admin.get('/api/reports/compliance?format=csv&view=personas');
    expect(csv.status).toBe(200);
    expect(csv.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(csv.headers.get('content-disposition')).toMatch(/^attachment; filename="cumplimiento-personas-2026-10-28\.csv"/);
    const bytes = new Uint8Array(await csv.clone().arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]); // BOM UTF-8 para Excel
    const text = await csv.text();
    expect(text.split('\r\n')[0]).toBe('Persona;Departamento;Oficina;Formación;Versión;Estado;Completada;Fecha de finalización;Fecha límite;Vencida;Intentos');
    expect(text).toContain('Pau Empleado Camps;Fiscal;Granollers;Recargos por presentación extemporánea;1;Formación completada;Sí;2026-10-28;2026-11-30;No;1');
    const byFormation = await (await admin.get('/api/reports/compliance?format=csv&view=formaciones')).text();
    expect(byFormation.split('\r\n')[0]).toContain('% completado');

    expect((await employee.get('/api/reports/compliance')).status).toBe(403);
    expect((await employee.get('/api/reports/compliance?format=csv')).status).toBe(403);
  });

  it('errores frecuentes por pregunta con commonErrors()', async () => {
    for (const [email, answers] of [
      [EMAILS.empleado, { q1: 'b', q2: 'b', q3: 'c' }],
      [EMAILS.reservada, { q1: 'b', q2: 'b', q3: 'a' }],
      [EMAILS.autor, { q1: 'c', q2: 'b', q3: 'c' }],
    ] as const) {
      const client = new TestClient(env.app);
      await client.login(email, PASSWORD);
      expect((await client.post(`/api/formations/${IDS.formation}/attempts`, { answers })).status).toBe(201);
    }
    const admin = await loginAs(env, EMAILS.admin);
    const report = await json(await admin.get(`/api/reports/errors/${IDS.formation}`));
    expect(report).toMatchObject({ contentId: IDS.formation, attempts: 3, version: 1 });
    expect(report.questions[0]).toMatchObject({ questionId: 'q1', errorRate: 1, responses: 3, mostChosenWrong: 'Opción B de q1' });
    expect(report.questions.find((q: { questionId: string }) => q.questionId === 'q2').errorRate).toBe(0);
    const csv = await (await admin.get(`/api/reports/errors/${IDS.formation}?format=csv`)).text();
    expect(csv).toContain('q1;Enunciado de la pregunta q1;3;100;Opción B de q1');
  });

  it('el CSV neutraliza fórmulas y escapa separadores', () => {
    const csv = toCsv(['A', 'B'], [['=HYPERLINK("http://x")', 'texto; con punto y coma'], ['+1', null]]);
    expect(csv).toContain(`"'=HYPERLINK(""http://x"")";"texto; con punto y coma"`);
    expect(csv).toContain("'+1;");
  });
});

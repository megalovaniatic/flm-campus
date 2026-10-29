import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { get, run } from '../src/db/database';
import { toCsv } from '../src/lib/csv';
import { EMAILS, FORMATION_CORRECT, formationPayload, IDS } from './fixtures/seed';
import { createTestEnv, json, loginAs, PASSWORD, TestClient, type TestEnv } from './helpers';

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
    expect(body).not.toHaveProperty('assignment');
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

  it('el progreso propio recorre todas las formaciones publicadas, sin obligatorias ni fechas límite', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    await employee.post(`/api/formations/${IDS.formation}/read`, { version: 1 });
    const progress = await json(await employee.get('/api/me/progress'));
    expect(Object.keys(progress)).toEqual(['formations']);
    expect(progress.formations).toEqual([
      expect.objectContaining({ id: IDS.formation, slug: 'recargos-extemporaneos', area: 'fiscal', progress: expect.objectContaining({ status: 'leida', readVersion: 1 }) }),
    ]);
    expect(progress.formations[0]).not.toHaveProperty('assignment');
    expect((await json(await employee.get('/api/formations'))).items[0]).not.toHaveProperty('assignment');

    // Las formaciones ya no se asignan: las rutas de asignaciones no existen.
    const admin = await loginAs(env, EMAILS.admin);
    expect((await admin.get('/api/assignments')).status).toBe(404);
    expect((await admin.post('/api/assignments', { formationId: IDS.formation, target: { kind: 'todos' } })).status).toBe(404);
  });
});

/** Publica una segunda formación (Laboral) con las mismas respuestas correctas que la del fixture. */
async function publishSecondFormation(admin: TestClient): Promise<string> {
  const { id: _id, editorial: _editorial, ...payload } = formationPayload({ slug: 'despido-objetivo', title: 'Despido objetivo', area: 'laboral' });
  const draft = (await json(await admin.post('/api/contents', { type: 'formacion', payload }))).content as { id: string; revision: number };
  expect((await admin.post(`/api/contents/${draft.id}/transitions`, { action: 'publicar', revision: draft.revision })).status).toBe(200);
  return draft.id;
}

const NAMES = ['Ana Admin Puig', 'Jordi Autor Vidal', 'Núria Autora Serra', 'Pau Empleado Camps', 'Sara Reservada López'];

/** El informe no debe llevar nada que identifique a una persona: ni nombres, ni correos, ni identificadores. */
function expectNoPersonalData(text: string) {
  for (const name of NAMES) expect(text).not.toContain(name);
  expect(text).not.toContain('@flmexperts.com');
  for (const id of [IDS.admin, IDS.autor, IDS.autora2, IDS.empleado, IDS.reservada]) expect(text).not.toContain(id);
}

describe('informes restringidos', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('participación por formación: recuentos agregados sobre las personas activas, sin nombres', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const second = await publishSecondFormation(admin);

    // Pau completa las dos; Sara lee la primera y completa la segunda.
    const pau = await loginAs(env, EMAILS.empleado);
    for (const id of [IDS.formation, second]) {
      await pau.post(`/api/formations/${id}/read`, {});
      expect((await pau.post(`/api/formations/${id}/attempts`, { answers: FORMATION_CORRECT })).status).toBe(201);
    }
    const sara = await loginAs(env, EMAILS.reservada);
    await sara.post(`/api/formations/${IDS.formation}/read`, {});
    await sara.post(`/api/formations/${second}/read`, {});
    await sara.post(`/api/formations/${second}/attempts`, { answers: FORMATION_CORRECT });
    // Jordi intenta el test de la primera sin aprobarlo; Núria lo aprueba sin confirmar la lectura. Ana no ha empezado.
    const jordi = await loginAs(env, EMAILS.autor);
    await jordi.post(`/api/formations/${IDS.formation}/attempts`, { answers: { q1: 'b', q2: 'a', q3: 'a' } });
    const nuria = await loginAs(env, EMAILS.autora2);
    await nuria.post(`/api/formations/${IDS.formation}/attempts`, { answers: FORMATION_CORRECT });

    const res = await admin.get('/api/reports/participation');
    expect(res.status).toBe(200);
    const report = await json(res);
    expect(Object.keys(report)).toEqual(['generatedAt', 'totals', 'byFormation']);
    expect(report.totals).toEqual({ people: 5, peopleWithCompleted: 2, completed: 3 });
    expect(report.byFormation).toEqual([
      { formationId: IDS.formation, title: 'Recargos por presentación extemporánea', area: 'fiscal', version: 1, people: 5, completed: 1, inProgress: 3, notStarted: 1, completionRate: 20 },
      { formationId: second, title: 'Despido objetivo', area: 'laboral', version: 1, people: 5, completed: 2, inProgress: 0, notStarted: 3, completionRate: 40 },
    ]);
    expectNoPersonalData(JSON.stringify(report));
    // Consultar el informe en pantalla no se audita; exportarlo, sí.
    expect(get(env.db, "SELECT 1 AS x FROM audit_log WHERE action = 'informe.exportar'")).toBeUndefined();

    // Solo cuentan las personas activas.
    expect((await admin.post(`/api/people/${IDS.autora2}/deactivate`)).status).toBe(200);
    let after = await json(await admin.get('/api/reports/participation'));
    expect(after.totals).toEqual({ people: 4, peopleWithCompleted: 2, completed: 3 });
    expect(after.byFormation[0]).toMatchObject({ people: 4, completed: 1, inProgress: 2, notStarted: 1, completionRate: 25 });

    // Solo cuenta la versión vigente: con una versión nueva, la primera formación vuelve a estar sin empezar.
    run(env.db, 'UPDATE contents SET version = 2 WHERE id = ?', IDS.formation);
    after = await json(await admin.get('/api/reports/participation'));
    expect(after.byFormation[0]).toMatchObject({ formationId: IDS.formation, version: 2, completed: 0, inProgress: 0, notStarted: 4, completionRate: 0 });
    expect(after.totals).toEqual({ people: 4, peopleWithCompleted: 2, completed: 2 });
  });

  it('exporta la participación en CSV (BOM, «;», descarga) sin nombres y deja constancia en la auditoría', async () => {
    const pau = await loginAs(env, EMAILS.empleado);
    await pau.post(`/api/formations/${IDS.formation}/read`, {});
    await pau.post(`/api/formations/${IDS.formation}/attempts`, { answers: FORMATION_CORRECT });
    const sara = await loginAs(env, EMAILS.reservada);
    await sara.post(`/api/formations/${IDS.formation}/read`, {});
    const admin = await loginAs(env, EMAILS.admin);

    const csv = await admin.get('/api/reports/participation?format=csv');
    expect(csv.status).toBe(200);
    expect(csv.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(csv.headers.get('content-disposition')).toMatch(/^attachment; filename="participacion-formaciones-2026-10-28\.csv"/);
    expect(csv.headers.get('cache-control')).toBe('private, no-store');
    const bytes = new Uint8Array(await csv.clone().arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]); // BOM UTF-8 para Excel
    const text = await csv.text(); // text() descarta el BOM al decodificar
    expect(text.split('\r\n')).toEqual([
      'Formación;Área;Versión;Personas;Completada;A medias;Sin empezar;% completada',
      'Recargos por presentación extemporánea;Fiscal;1;5;1;1;3;20',
      '',
    ]);
    expectNoPersonalData(text);
    expect(get(env.db, "SELECT actor_id, entity, detail FROM audit_log WHERE action = 'informe.exportar'")).toMatchObject({
      actor_id: IDS.admin,
      entity: 'informe',
      detail: 'Participación por formación',
    });

    // Solo administración; el informe de cumplimiento de obligatorias ya no existe.
    for (const path of ['/api/reports/participation', '/api/reports/participation?format=csv']) {
      expect((await pau.get(path)).status).toBe(403);
      expect((await (await loginAs(env, EMAILS.autor)).get(path)).status).toBe(403);
    }
    expect((await json(await pau.get('/api/reports/participation'))).error.message).toBe('Solo administración puede consultar los informes.');
    expect((await admin.get('/api/reports/participation?format=xlsx')).status).toBe(400);
    expect((await admin.get('/api/reports/compliance')).status).toBe(404);
  });

  it('errores frecuentes por pregunta con commonErrors() y exportación CSV solo para administración', async () => {
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
    expectNoPersonalData(JSON.stringify(report));

    const csv = await admin.get(`/api/reports/errors/${IDS.formation}?format=csv`);
    expect(csv.status).toBe(200);
    expect(csv.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(csv.headers.get('content-disposition')).toMatch(/^attachment; filename="errores-recargos-extemporaneos-2026-10-28\.csv"/);
    const bytes = new Uint8Array(await csv.clone().arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = await csv.text();
    expect(text.split('\r\n')[0]).toBe('Pregunta;Enunciado;Respuestas;% de error;Respuesta incorrecta más elegida');
    expect(text).toContain('q1;Enunciado de la pregunta q1;3;100;Opción B de q1');
    expect(get(env.db, "SELECT detail FROM audit_log WHERE action = 'informe.exportar' AND entity_id = ?", IDS.formation)).toMatchObject({ detail: 'Errores frecuentes' });

    const employee = await loginAs(env, EMAILS.empleado);
    expect((await employee.get(`/api/reports/errors/${IDS.formation}?format=csv`)).status).toBe(403);
  });

  it('el CSV neutraliza fórmulas y escapa separadores', () => {
    const csv = toCsv(['A', 'B'], [['=HYPERLINK("http://x")', 'texto; con punto y coma'], ['+1', null]]);
    expect(csv).toContain(`"'=HYPERLINK(""http://x"")";"texto; con punto y coma"`);
    expect(csv).toContain("'+1;");
  });
});

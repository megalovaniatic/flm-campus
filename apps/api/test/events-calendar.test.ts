import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EMAILS, IDS, published } from './fixtures/seed';
import { createTestEnv, json, loginAs, type TestEnv } from './helpers';

type PhaseItem = { id: string; phase: string };

describe('eventos', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('calcula la fase con eventPhase() en Europe/Madrid (varias sesiones, sin fecha, histórico)', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const { items } = await json<{ items: PhaseItem[] }>(await employee.get('/api/events'));
    const phase = Object.fromEntries(items.map((e) => [e.id, e.phase]));
    expect(phase).toEqual({
      [IDS.multisesion]: 'en-curso',
      [IDS.encuentro]: 'proximo',
      [IDS.comunicado]: 'proximo',
      [IDS.pasado]: 'historico',
    });
    expect(items.map((e) => e.id)).toEqual([IDS.multisesion, IDS.encuentro, IDS.comunicado, IDS.pasado]);
    expect((await json(await employee.get('/api/events?phase=historico'))).items).toHaveLength(1);
    expect((await json(await employee.get('/api/events?kind=comunicado'))).items).toHaveLength(1);

    const detail = await json(await employee.get('/api/events/ciclo-cierre-contable'));
    expect(detail.event.nextSession).toMatchObject({ start: '2026-11-03T16:00' });

    // Tras la última sesión (3/11 18:00 en Madrid) pasa al histórico.
    env.clock.advance(Date.parse('2026-11-03T17:01:00Z') - Date.parse('2026-10-28T10:00:00Z'));
    const later = await loginAs(env, EMAILS.empleado);
    const after = await json<{ items: PhaseItem[] }>(await later.get('/api/events'));
    expect(after.items.find((e) => e.id === IDS.multisesion)?.phase).toBe('historico');
  });

  it('reclasificación manual por administración y archivado distinto de histórico', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    let detail = (await json(await admin.get(`/api/contents/${IDS.encuentro}`))).content;
    expect(detail.phase).toBe('proximo');

    expect((await employee.patch(`/api/events/${IDS.encuentro}/phase`, { manualPhase: 'historico', revision: detail.revision })).status).toBe(403);
    const moved = await admin.patch(`/api/events/${IDS.encuentro}/phase`, { manualPhase: 'historico', revision: detail.revision });
    expect(moved.status).toBe(200);
    detail = (await json(moved)).content;
    expect(detail).toMatchObject({ phase: 'historico', manualPhase: 'historico' });
    expect((await admin.patch(`/api/events/${IDS.encuentro}/phase`, { manualPhase: null, revision: 1 })).status).toBe(409);
    const auto = await admin.patch(`/api/events/${IDS.encuentro}/phase`, { manualPhase: null, revision: detail.revision });
    detail = (await json(auto)).content;
    expect(detail.phase).toBe('proximo');

    const archived = (await json(await admin.post(`/api/contents/${IDS.pasado}/transitions`, { action: 'archivar', revision: 1 }))).content;
    expect(archived.phase).toBe('archivado');
    expect(archived.item.archived).toBe(true);
    const list = await json<{ items: PhaseItem[] }>(await employee.get('/api/events'));
    expect(list.items.map((e) => e.id)).not.toContain(IDS.pasado);
  });

  it('solo admite iconos de la lista cerrada y sesiones múltiples válidas', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const base = { slug: 'jornada-puertas', category: 'encuentro', title: 'Jornada de puertas abiertas', summary: 'Visita a las oficinas.', sessions: [{ start: '2026-12-01T10:00' }, { start: '2026-12-02T10:00' }] };
    const bad = await author.post('/api/contents', { type: 'evento', payload: { ...base, icon: 'cohete' } });
    expect(bad.status).toBe(400);
    const badSession = await author.post('/api/contents', { type: 'evento', payload: { ...base, icon: 'estrella', sessions: [{ start: '01/12/2026' }] } });
    expect(badSession.status).toBe(400);
    const ok = await author.post('/api/contents', { type: 'evento', payload: { ...base, icon: 'estrella', kind: 'comunicado', editorial: published('otra') } });
    expect(ok.status).toBe(201);
    const item = (await json(ok)).content.item;
    expect(item).toMatchObject({ kind: 'evento', icon: 'estrella', editorial: { status: 'borrador', authorId: 'p-autor' } });
    expect(item.sessions).toHaveLength(2);
  });

  it('exporta el evento a .ics con la zona Europe/Madrid', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const res = await employee.get(`/api/events/${IDS.encuentro}/ics`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/calendar; charset=utf-8');
    const ics = await res.text();
    expect(ics).toContain('DTSTART;TZID=Europe/Madrid:20261112T090000');
    expect(ics).toContain('BEGIN:VTIMEZONE');
  });
});

describe('calendario', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('usa entriesForMonth(): solo encuentros de equipo y festivos, sin fechas personales', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const nov = await json(await employee.get('/api/calendar?year=2026&month=11'));
    // Noviembre: solo el encuentro de otoño (el ciclo de formación interna del 3/11 no es un encuentro).
    expect(nov.entries).toHaveLength(1);
    expect(nov.entries[0]).toMatchObject({ kind: 'encuentro', date: '2026-11-12', title: 'Encuentro de otoño', time: '09:00', eventId: IDS.encuentro });
    expect(nov.entries[0]).not.toHaveProperty('personId');
    expect(JSON.stringify(nov)).not.toContain('@flmexperts.com');
    expect(JSON.stringify(nov)).not.toMatch(/Pau Empleado|Ana Admin|Sara Reservada/);

    const dec = await json(await employee.get('/api/calendar?year=2026&month=12'));
    expect(dec.entries.map((e: { kind: string }) => e.kind)).toEqual(['festivo', 'festivo']);
    expect(dec.entries[0]).toMatchObject({ date: '2026-12-25', title: 'Festivo', detail: 'Navidad' });
  });

  it('valida año y mes', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    expect((await employee.get('/api/calendar?year=2026&month=13')).status).toBe(400);
    expect((await employee.get('/api/calendar?month=5')).status).toBe(400);
  });

  it('gestiona festivos (solo administración)', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    const holiday = { date: '2026-09-11', name: 'Diada Nacional de Catalunya', scope: 'autonomico', offices: [], source: 'https://dogc.gencat.cat' };
    expect((await employee.post('/api/holidays', holiday)).status).toBe(403);
    const created = await admin.post('/api/holidays', holiday);
    expect(created.status).toBe(201);
    expect((await admin.post('/api/holidays', holiday)).status).toBe(409);
    expect((await json(await employee.get('/api/holidays?year=2026'))).items).toHaveLength(3);
    expect((await admin.delete(`/api/holidays/${(await json(created)).holiday.id}`)).status).toBe(200);
  });
});

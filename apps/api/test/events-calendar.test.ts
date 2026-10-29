import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { importSeed } from '../src/services/seed';
import { EMAILS, fixtureSeed, IDS, published } from './fixtures/seed';
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

  it('eventos y comunicados comparten la dirección de la agenda: un solo espacio de slugs', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    const notice = { category: 'comunicacion', title: 'Aviso de la oficina', summary: 'Cambios en la recepción.', icon: 'megafono', sessions: [] };

    // «encuentro-otono» es un evento publicado: un comunicado no puede usar la misma dirección.
    const taken = await author.post('/api/contents', { type: 'comunicado', payload: { ...notice, slug: 'encuentro-otono' } });
    expect(taken.status).toBe(409);
    expect((await json(taken)).error).toMatchObject({ code: 'SLUG_DUPLICADO', message: expect.stringContaining('agenda') });

    // Tampoco al guardar un borrador ni al guardar cambios de un evento publicado.
    const draft = (await json(await author.post('/api/contents', { type: 'comunicado', payload: { ...notice, slug: 'aviso-oficina' } }))).content;
    expect((await author.put(`/api/contents/${draft.id}`, { revision: draft.revision, payload: { ...notice, slug: 'encuentro-otono' } })).status).toBe(409);
    const encuentro = (await json(await admin.get(`/api/contents/${IDS.encuentro}`))).content;
    const moved = await admin.put(`/api/contents/${IDS.encuentro}`, { revision: encuentro.revision, payload: { ...encuentro.item, slug: 'nueva-web' } });
    expect(moved.status).toBe(409);
    expect((await json(moved)).error.code).toBe('SLUG_DUPLICADO');

    // Cada dirección sigue llevando a lo suyo.
    expect((await json(await employee.get('/api/events/encuentro-otono'))).event.id).toBe(IDS.encuentro);
    expect((await json(await employee.get('/api/events/nueva-web'))).event.id).toBe(IDS.comunicado);
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

  it('usa entriesForMonth(): encuentros de equipo y festivos; sin fechas en la ficha, ningún cumpleaños', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const nov = await json(await employee.get('/api/calendar?year=2026&month=11'));
    // Noviembre: solo el encuentro de otoño (el ciclo de formación interna del 3/11 no es un encuentro).
    // Las personas del fixture no tienen cumpleaños ni incorporación: nada se inventa.
    expect(nov.entries).toHaveLength(1);
    expect(nov.entries[0]).toMatchObject({ kind: 'encuentro', date: '2026-11-12', title: 'Encuentro de otoño', time: '09:00', eventId: IDS.encuentro });
    expect(nov.entries[0]).not.toHaveProperty('personId');
    expect(JSON.stringify(nov)).not.toContain('@flmexperts.com');
    expect(JSON.stringify(nov)).not.toMatch(/Pau Empleado|Ana Admin|Sara Reservada/);

    const dec = await json(await employee.get('/api/calendar?year=2026&month=12'));
    expect(dec.entries.map((e: { kind: string }) => e.kind)).toEqual(['festivo', 'festivo']);
    expect(dec.entries[0]).toMatchObject({ date: '2026-12-25', title: 'Festivo', detail: 'Navidad' });
  });

  it('refleja el cumpleaños de Judith cada año y su aniversario desde el 1 de septiembre de 2027', async () => {
    // Su perfil, como en la semilla de @flm/content: 26 de noviembre (sin año) y 1 de septiembre de 2026.
    const judith = { id: 'p-judith-calet', email: 'judith.calet@flmexperts.com', name: 'Judith Calet', position: 'Asesora Contable', department: 'Contable' as const, office: 'Barcelona' as const, role: 'empleado' as const, status: 'activa' as const, birthday: '11-26', startDate: '2026-09-01' };
    await importSeed(env.db, { ...fixtureSeed, people: [...fixtureSeed.people, judith] }, { now: env.clock.now() });
    const employee = await loginAs(env, EMAILS.empleado);
    const month = async (year: number, m: number) =>
      (await json(await employee.get(`/api/calendar?year=${year}&month=${m}`))).entries.filter((e: { personId?: string }) => e.personId === judith.id);

    expect(await month(2026, 11)).toEqual([
      { id: 'cumple-p-judith-calet-2026', date: '2026-11-26', kind: 'cumpleanos', title: 'Cumpleaños de Judith Calet', detail: 'Asesora Contable', personId: judith.id },
    ]);
    expect((await month(2027, 11)).map((e: { date: string }) => e.date)).toEqual(['2027-11-26']);
    expect((await month(2030, 11)).map((e: { date: string }) => e.date)).toEqual(['2030-11-26']);
    // El año de su incorporación no hay aniversario; el primero, el 1 de septiembre de 2027.
    expect(await month(2026, 9)).toEqual([]);
    expect(await month(2027, 9)).toEqual([
      {
        id: 'aniv-p-judith-calet-2027',
        date: '2027-09-01',
        kind: 'aniversario',
        title: 'Aniversario de Judith Calet en FLM',
        detail: '1 año en FLM · desde el 1 de septiembre de 2026',
        personId: judith.id,
        years: 1,
      },
    ]);
    expect(await month(2028, 9)).toEqual([expect.objectContaining({ date: '2028-09-01', years: 2, detail: '2 años en FLM · desde el 1 de septiembre de 2026' })]);
    // Ni el correo ni un año de nacimiento.
    expect(JSON.stringify(await json(await employee.get('/api/calendar?year=2026&month=11')))).not.toMatch(/@flmexperts\.com|judith\.calet/);
  });

  it('editar la ficha cambia el calendario sin duplicar; las personas desactivadas no aparecen', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    const mine = async (year: number, m: number) =>
      (await json(await employee.get(`/api/calendar?year=${year}&month=${m}`))).entries.filter((e: { personId?: string }) => e.personId === IDS.reservada);

    await admin.patch(`/api/people/${IDS.reservada}`, { birthday: '11-26', startDate: '2026-09-01' });
    expect((await mine(2026, 11)).map((e: { id: string; date: string }) => [e.id, e.date])).toEqual([[`cumple-${IDS.reservada}-2026`, '2026-11-26']]);

    // Otra fecha: la entrada se mueve (mismo identificador), no se añade otra.
    await admin.patch(`/api/people/${IDS.reservada}`, { birthday: '11-27' });
    await admin.patch(`/api/people/${IDS.reservada}`, { birthday: '11-27', position: 'Asesora contable sénior' });
    const moved = await mine(2026, 11);
    expect(moved).toEqual([expect.objectContaining({ id: `cumple-${IDS.reservada}-2026`, date: '2026-11-27', detail: 'Asesora contable sénior' })]);
    // A otro mes: desaparece de noviembre.
    await admin.patch(`/api/people/${IDS.reservada}`, { birthday: '12-02', startDate: '2025-11-10' });
    expect((await mine(2026, 11)).map((e: { kind: string; date: string }) => [e.kind, e.date])).toEqual([['aniversario', '2026-11-10']]);
    expect((await mine(2026, 12)).map((e: { kind: string; date: string }) => [e.kind, e.date])).toEqual([['cumpleanos', '2026-12-02']]);
    // Ninguna entrada repetida en todo el calendario.
    const ids = (await json(await employee.get('/api/calendar?year=2026&month=11'))).entries.map((e: { id: string }) => e.id);
    expect(new Set(ids).size).toBe(ids.length);

    // Desactivada: fuera del calendario; reactivada: vuelve, una sola vez.
    await admin.post(`/api/people/${IDS.reservada}/deactivate`);
    expect(await mine(2026, 12)).toEqual([]);
    await admin.post(`/api/people/${IDS.reservada}/reactivate`);
    expect(await mine(2026, 12)).toHaveLength(1);
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

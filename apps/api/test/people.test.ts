import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { all, get, run } from '../src/db/database';
import { EMAILS, FORMATION_CORRECT, IDS, NEW_PERSON_DATES } from './fixtures/seed';
import { createTestEnv, fileForm, json, loginAs, PASSWORD, PNG_BYTES, START, TestClient, type TestEnv } from './helpers';

describe('personas y cuentas', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('la administración lista, crea y edita fichas; las personas ficticias de la demo no se importan', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const list = await json(await admin.get('/api/people'));
    expect(list.items.map((p: { id: string }) => p.id)).not.toContain(IDS.ficticia);
    expect(list.items.find((p: { id: string }) => p.id === IDS.empleado)).toMatchObject({ accountState: 'activa', role: 'empleado' });

    const duplicate = await admin.post('/api/people', { email: EMAILS.empleado, name: 'Otra', position: 'Asesora', department: 'Fiscal', office: 'Barcelona', role: 'empleado', ...NEW_PERSON_DATES });
    expect(duplicate.status).toBe(409);
    expect((await json(duplicate)).error.code).toBe('CORREO_DUPLICADO');

    const edited = await admin.patch(`/api/people/${IDS.empleado}`, { position: 'Asesor fiscal sénior', department: 'Contable', office: 'Vic' });
    expect(edited.status).toBe(200);
    expect((await json(edited)).person).toMatchObject({ position: 'Asesor fiscal sénior', department: 'Contable', office: 'Vic' });
    expect(get(env.db, "SELECT 1 AS x FROM audit_log WHERE action = 'persona.editar' AND entity_id = ?", IDS.empleado)).toBeDefined();

    const directory = await json(await (await loginAs(env, EMAILS.empleado)).get('/api/people/directory'));
    expect(directory.items.length).toBeGreaterThan(3);
    expect(JSON.stringify(directory)).not.toContain('@flmexperts.com');
  });

  it('el alta exige el cumpleaños (día y mes, sin año) y la fecha completa de incorporación', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const base = { email: 'nueva.persona@flmexperts.com', name: 'Nueva Persona', position: 'Asesora laboral', department: 'Laboral', office: 'Vic', role: 'empleado' };

    // Sin los datos: 400 con los dos campos y un mensaje claro; no se crea nada.
    const missing = await admin.post('/api/people', base);
    expect(missing.status).toBe(400);
    const error = (await json(missing)).error;
    expect(error.code).toBe('VALIDACION');
    expect(error.details).toEqual([
      { path: 'birthday', message: 'Indica el día y el mes del cumpleaños (sin el año de nacimiento).' },
      { path: 'startDate', message: 'Indica la fecha completa de incorporación a FLM: día, mes y año.' },
    ]);
    expect(get(env.db, 'SELECT 1 AS x FROM users WHERE email = ?', base.email)).toBeUndefined();

    // Formatos: el cumpleaños nunca lleva año; la incorporación es una fecha completa que existe.
    for (const [birthday, startDate, field] of [
      ['1985-11-26', '2026-09-01', 'birthday'],
      ['26/11', '2026-09-01', 'birthday'],
      ['11-31', '2026-09-01', 'birthday'],
      ['11-26', '2026-09', 'startDate'],
      ['11-26', '2026-02-29', 'startDate'],
      ['11-26', '', 'startDate'],
    ]) {
      const res = await admin.post('/api/people', { ...base, birthday, startDate });
      expect(res.status, `${birthday} · ${startDate}`).toBe(400);
      expect((await json(res)).error.details.map((d: { path: string }) => d.path)).toEqual([field]);
    }

    // Con los dos datos: se guardan y se devuelven en la ficha. Cualquier otro campo (el año, un
    // consentimiento de versiones anteriores) se descarta.
    const created = await admin.post('/api/people', { ...base, birthday: '11-26', startDate: '2026-09-01', showBirthday: true, birthYear: 1990 });
    expect(created.status).toBe(201);
    const person = (await json(created)).person;
    expect(person).toMatchObject({ birthday: '11-26', startDate: '2026-09-01', missingPersonalDates: [] });
    expect(person).not.toHaveProperty('showBirthday');
    expect(person).not.toHaveProperty('birthYear');
    expect(get(env.db, 'SELECT birthday, start_date FROM users WHERE id = ?', person.id)).toEqual({ birthday: '11-26', start_date: '2026-09-01' });
    // La auditoría del alta no guarda las fechas.
    expect(JSON.stringify(all(env.db, 'SELECT detail FROM audit_log WHERE entity_id = ?', person.id))).not.toMatch(/11-26|2026-09-01/);
  });

  it('el alta admite el 29 de febrero, que el calendario celebra el 28 en los años no bisiestos', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const created = await admin.post('/api/people', {
      email: 'bisiesta@flmexperts.com',
      name: 'Bisiesta Prueba',
      position: 'Asesora fiscal',
      department: 'Fiscal',
      office: 'Barcelona',
      role: 'empleado',
      birthday: '02-29',
      startDate: '2024-02-29',
    });
    expect(created.status).toBe(201);
    const id = (await json(created)).person.id;
    const feb = async (year: number) =>
      (await json(await admin.get(`/api/calendar?year=${year}&month=2`))).entries.filter((e: { personId?: string }) => e.personId === id);
    expect(await feb(2027)).toEqual([
      expect.objectContaining({ id: `cumple-${id}-2027`, kind: 'cumpleanos', date: '2027-02-28', title: 'Cumpleaños de Bisiesta Prueba' }),
      expect.objectContaining({ id: `aniv-${id}-2027`, kind: 'aniversario', date: '2027-02-28', years: 3 }),
    ]);
    expect((await feb(2028)).map((e: { date: string }) => e.date)).toEqual(['2028-02-29', '2028-02-29']);
  });

  it('la incorporación admite altas previstas hasta un año vista, el mismo tope que la web', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const base = { email: 'prevista@flmexperts.com', name: 'Alta Prevista', position: 'Asesora laboral', department: 'Laboral', office: 'Vic', role: 'empleado', birthday: '05-05' };
    // Hoy es el 28 de octubre de 2026: una errata como 2062 se rechaza en el campo, con el mensaje de la web.
    const typo = await admin.post('/api/people', { ...base, startDate: '2062-09-01' });
    expect(typo.status).toBe(400);
    expect((await json(typo)).error).toMatchObject({
      code: 'VALIDACION',
      details: [{ path: 'startDate', message: 'La fecha de incorporación no puede ser posterior al 28 de octubre de 2027.' }],
    });
    expect(get(env.db, 'SELECT 1 AS x FROM users WHERE email = ?', base.email)).toBeUndefined();
    // El último día del tope sí vale.
    expect((await admin.post('/api/people', { ...base, startDate: '2027-10-28' })).status).toBe(201);
    // Igual al editar y en el autoservicio.
    expect((await admin.patch(`/api/people/${IDS.empleado}`, { startDate: '2062-09-01' })).status).toBe(400);
    const employee = await loginAs(env, EMAILS.empleado);
    const own = await employee.patch('/api/me/personal-dates', { startDate: '2030-01-01' });
    expect(own.status).toBe(400);
    expect((await json(own)).error.details.map((d: { path: string }) => d.path)).toEqual(['startDate']);
    expect(get(env.db, 'SELECT start_date FROM users WHERE id = ?', IDS.empleado)).toEqual({ start_date: null });
  });

  it('la edición acepta y valida las fechas; la ficha, la administración y el directorio las devuelven', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    // Los perfiles anteriores no las tienen: quedan sin indicar (nada se inventa).
    const before = (await json(await admin.get(`/api/people/${IDS.empleado}`))).person;
    expect(before).not.toHaveProperty('birthday');
    expect(before).not.toHaveProperty('startDate');
    expect(before.missingPersonalDates).toEqual(['birthday', 'startDate']);

    expect((await admin.patch(`/api/people/${IDS.empleado}`, { birthday: '1990-03-14' })).status).toBe(400);
    expect((await admin.patch(`/api/people/${IDS.empleado}`, { startDate: '2026-13-01' })).status).toBe(400);
    expect((await admin.patch(`/api/people/${IDS.empleado}`, { birthday: '' })).status).toBe(400);

    const patched = await admin.patch(`/api/people/${IDS.empleado}`, { birthday: '03-14' });
    expect(patched.status).toBe(200);
    const patchedPerson = (await json(patched)).person;
    expect(patchedPerson).toMatchObject({ birthday: '03-14', missingPersonalDates: ['startDate'] });
    expect(patchedPerson).not.toHaveProperty('startDate');
    // La auditoría anota el campo, no la fecha.
    expect(get(env.db, "SELECT detail FROM audit_log WHERE action = 'persona.editar' AND entity_id = ? ORDER BY id DESC", IDS.empleado)).toMatchObject({ detail: 'Campos: birthday' });

    await admin.patch(`/api/people/${IDS.empleado}`, { startDate: '2021-05-03', position: 'Asesor fiscal sénior' });
    const list = (await json(await admin.get('/api/people'))).items.find((p: { id: string }) => p.id === IDS.empleado);
    expect(list).toMatchObject({ birthday: '03-14', startDate: '2021-05-03', missingPersonalDates: [], position: 'Asesor fiscal sénior' });

    const employee = await loginAs(env, EMAILS.empleado);
    expect((await json(await employee.get('/api/me'))).person).toMatchObject({ birthday: '03-14', startDate: '2021-05-03' });
    const session = await json(await employee.get('/api/session'));
    expect(session.user).toMatchObject({ birthday: '03-14', startDate: '2021-05-03', missingPersonalDates: [] });
    // Directorio: lo necesario para el calendario, sin correos.
    const directory = (await json(await employee.get('/api/people/directory'))).items;
    expect(directory.find((p: { id: string }) => p.id === IDS.empleado)).toMatchObject({ birthday: '03-14', startDate: '2021-05-03' });
    expect(directory.find((p: { id: string }) => p.id === IDS.autor)).not.toHaveProperty('birthday');
    expect(JSON.stringify(directory)).not.toContain('@flmexperts.com');
    // Las bienvenidas muestran la ficha mínima, sin fechas (aunque la persona las tenga).
    await admin.patch(`/api/people/${IDS.reservada}`, { birthday: '07-07', startDate: '2026-10-19' });
    const welcomes = await json(await employee.get('/api/welcomes'));
    expect(welcomes.items.find((w: { person: { id: string } }) => w.person.id === IDS.reservada).person).toEqual({
      id: IDS.reservada,
      name: 'Sara Reservada López',
      position: 'Asesora contable',
      department: 'Contable',
      office: 'Barcelona',
    });
    expect(JSON.stringify(welcomes)).not.toMatch(/birthday|startDate|07-07|2026-10-19/);
  });

  it('cada persona completa sus datos del calendario que falten, sin que nada le bloquee el acceso', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    // Sin los datos, entra y usa el campus con normalidad; la sesión y el perfil dicen qué falta.
    expect((await json(await employee.get('/api/session'))).user.missingPersonalDates).toEqual(['birthday', 'startDate']);
    expect((await json(await employee.get('/api/me'))).missingPersonalDates).toEqual(['birthday', 'startDate']);
    expect((await employee.get('/api/formations')).status).toBe(200);
    expect((await employee.get('/api/calendar?year=2026&month=11')).status).toBe(200);

    // Validación, CSRF y sesión, como el resto de escrituras.
    expect((await employee.patch('/api/me/personal-dates', {})).status).toBe(400);
    expect((await employee.patch('/api/me/personal-dates', { birthday: '1990-03-14' })).status).toBe(400);
    expect((await employee.patch('/api/me/personal-dates', { birthday: '03-14' }, { csrf: false })).status).toBe(403);
    const anonymous = new TestClient(env.app);
    await anonymous.init();
    expect((await anonymous.patch('/api/me/personal-dates', { birthday: '03-14' })).status).toBe(401);

    // Primero el cumpleaños (el año no se pide ni se guarda)…
    const first = await employee.patch('/api/me/personal-dates', { birthday: '03-14' });
    expect(first.status).toBe(200);
    expect(await json(first)).toMatchObject({ person: { birthday: '03-14' }, missingPersonalDates: ['startDate'], changed: ['birthday'] });
    // …después la incorporación, y puede corregir su cumpleaños.
    const second = await employee.patch('/api/me/personal-dates', { birthday: '03-15', startDate: '2021-05-03' });
    expect(await json(second)).toMatchObject({ person: { birthday: '03-15', startDate: '2021-05-03' }, missingPersonalDates: [], changed: ['birthday', 'startDate'] });

    // La fecha de incorporación que ya consta no la cambia la persona: la corrige administración.
    const again = await employee.patch('/api/me/personal-dates', { startDate: '2020-01-01' });
    expect(again.status).toBe(409);
    expect((await json(again)).error.code).toBe('INCORPORACION_YA_INDICADA');
    // Repetir la misma no es un cambio.
    expect(await json(await employee.patch('/api/me/personal-dates', { startDate: '2021-05-03' }))).toMatchObject({ changed: [] });
    expect(get(env.db, 'SELECT birthday, start_date FROM users WHERE id = ?', IDS.empleado)).toEqual({ birthday: '03-15', start_date: '2021-05-03' });

    // Auditoría: qué campos, nunca las fechas.
    const rows = all<{ detail: string; actor_id: string }>(env.db, "SELECT detail, actor_id FROM audit_log WHERE action = 'perfil.fechas' AND entity_id = ? ORDER BY id", IDS.empleado);
    expect(rows).toEqual([
      { detail: 'Campos: birthday', actor_id: IDS.empleado },
      { detail: 'Campos: birthday, startDate', actor_id: IDS.empleado },
    ]);
    // Solo la propia ficha: no hay forma de tocar la de otra persona por esta vía.
    expect(get(env.db, 'SELECT birthday FROM users WHERE id = ?', IDS.autor)).toEqual({ birthday: null });
  });

  it('cambiar el rol revoca las sesiones de la persona', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const admin = await loginAs(env, EMAILS.admin);
    const res = await admin.patch(`/api/people/${IDS.empleado}`, { role: 'autor' });
    expect((await json(res)).sessionsRevoked).toBe(true);
    const after = await employee.get('/api/contents');
    expect(after.status).toBe(401);
    expect((await json(after)).error.message).toContain('rol');
    const again = await loginAs(env, EMAILS.empleado);
    expect((await json(await again.get('/api/session'))).permissions).toContain('contenido:crear');
    expect((await again.get('/api/contents')).status).toBe(200);
  });

  it('desactivar revoca las sesiones e impide entrar; reactivar lo permite de nuevo', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const admin = await loginAs(env, EMAILS.admin);
    expect((await admin.post(`/api/people/${IDS.empleado}/deactivate`)).status).toBe(200);
    const after = await employee.get('/api/me');
    expect(after.status).toBe(401);
    expect((await json(after)).error.message).toContain('desactivado');
    expect((await new TestClient(env.app).login(EMAILS.empleado)).status).toBe(403);
    expect((await admin.post(`/api/people/${IDS.empleado}/reactivate`)).status).toBe(200);
    expect((await new TestClient(env.app).login(EMAILS.empleado)).status).toBe(200);
  });

  it('no permite desactivar ni degradar al último administrador activo', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const demote = await admin.patch(`/api/people/${IDS.admin}`, { role: 'empleado' });
    expect(demote.status).toBe(409);
    expect((await json(demote)).error.code).toBe('ULTIMO_ADMINISTRADOR');
    expect((await admin.post(`/api/people/${IDS.admin}/deactivate`)).status).toBe(409);

    // Una administradora pendiente de activar no cuenta: aún no puede entrar.
    const created = await json(await admin.post('/api/people', { email: 'nueva.admin@flmexperts.com', name: 'Nueva Admin', position: 'Dirección', department: 'Dirección', office: 'Barcelona', role: 'admin', ...NEW_PERSON_DATES }));
    expect(created.person.accountState).toBe('pendiente-activacion');
    expect((await admin.post(`/api/people/${IDS.admin}/deactivate`)).status).toBe(409);

    expect((await admin.patch(`/api/people/${IDS.autor}`, { role: 'admin' })).status).toBe(200);
    const ok = await admin.patch(`/api/people/${IDS.admin}`, { role: 'empleado' });
    expect(ok.status).toBe(200);
    expect((await admin.get('/api/people')).status).toBe(401);
  });

  it('elimina el perfil de quien deja FLM: su contenido se conserva sin autoría y sus bienvenidas se borran', async () => {
    const author = await loginAs(env, EMAILS.autor);
    await author.upload('PUT', '/api/me/photo', fileForm(PNG_BYTES, 'retrato.png', 'image/png'));
    await author.post(`/api/formations/${IDS.formation}/attempts`, { answers: { ...FORMATION_CORRECT, q1: 'b' } });
    const draft = (await json(await author.post('/api/contents', { type: 'cliente', payload: { name: 'Borrador del cliente', sector: 'Logística', country: 'Portugal', area: 'contable', date: '2026-10-28' } }))).content;
    const photoFiles = readdirSync(join(env.storageDir, 'files'));
    expect(photoFiles).toHaveLength(1);

    const admin = await loginAs(env, EMAILS.admin);
    const welcome = (await json(await admin.post('/api/contents', { type: 'bienvenida', payload: { personId: IDS.autor, date: '2026-10-28', message: 'Se suma al Área Fiscal.' } }))).content;

    const wrong = await admin.post(`/api/people/${IDS.autor}/remove`, { confirm: 'otra@flmexperts.com' });
    expect(wrong.status).toBe(400);
    expect((await json(wrong)).error.code).toBe('CONFIRMACION_NO_VALIDA');
    const self = await admin.post(`/api/people/${IDS.admin}/remove`, { confirm: EMAILS.admin });
    expect(self.status).toBe(409);
    expect((await json(self)).error.code).toBe('AUTOELIMINACION');

    const res = await admin.post(`/api/people/${IDS.autor}/remove`, { confirm: EMAILS.autor.toUpperCase() });
    expect(res.status).toBe(200);
    expect((await json(res)).removed).toMatchObject({ id: IDS.autor, contentsWithoutAuthor: 2, welcomesDeleted: 1, attemptsAnonymized: 1 });

    // La persona desaparece: sin ficha, sin sesiones, sin foto y sin poder entrar.
    expect(get(env.db, 'SELECT 1 AS x FROM users WHERE id = ?', IDS.autor)).toBeUndefined();
    expect((await admin.get(`/api/people/${IDS.autor}`)).status).toBe(404);
    expect(all(env.db, 'SELECT id FROM sessions WHERE user_id = ?', IDS.autor)).toHaveLength(0);
    expect(existsSync(join(env.storageDir, 'files', photoFiles[0]!))).toBe(false);
    expect((await author.get('/api/me')).status).toBe(401);
    expect((await new TestClient(env.app).login(EMAILS.autor, PASSWORD)).status).toBe(401);

    // Su contenido se conserva, publicado o en borrador, sin autoría.
    const employee = await loginAs(env, EMAILS.empleado);
    const formation = (await json(await employee.get(`/api/formations/${IDS.formation}`))).formation;
    expect(formation.editorial.status).toBe('publicado');
    expect(formation.editorial).not.toHaveProperty('authorId');
    const listed = (await json(await admin.get('/api/contents'))).items.find((c: { id: string }) => c.id === draft.id);
    expect(listed).toMatchObject({ status: 'borrador', authorId: null, authorName: null });
    expect((await admin.get(`/api/contents/${welcome.id}`)).status).toBe(404);

    // Los intentos quedan como agregados anónimos.
    expect(get<{ n: number }>(env.db, 'SELECT COUNT(*) AS n FROM quiz_attempts WHERE user_id IS NULL')!.n).toBe(1);
    expect((await json(await admin.get(`/api/reports/errors/${IDS.formation}`))).attempts).toBe(1);

    // Auditoría sin datos personales y sin la IP de la persona eliminada.
    const auditRows = all<{ detail: string | null }>(env.db, 'SELECT detail FROM audit_log');
    expect(JSON.stringify(auditRows)).not.toMatch(/jordi\.autor|Jordi Autor/i);
    expect(get(env.db, "SELECT detail FROM audit_log WHERE action = 'persona.eliminar-perfil' AND entity_id = ?", IDS.autor)).toMatchObject({
      detail: 'Contenidos sin autoría: 2. Revisiones sin autoría: 0. «Revisado por» retirado: 0. Bienvenidas eliminadas: 1. Sesiones cerradas: 1. Intentos de test anonimizados: 1. Fechas del calendario borradas: 0.',
    });
    expect(all(env.db, 'SELECT id FROM audit_log WHERE actor_id = ? AND ip IS NOT NULL', IDS.autor)).toHaveLength(0);

    // El correo queda libre: si la persona vuelve, se le crea una cuenta nueva.
    const back = await admin.post('/api/people', { email: EMAILS.autor, name: 'Jordi Autor Vidal', position: 'Asesor fiscal', department: 'Fiscal', office: 'Barcelona', role: 'autor', ...NEW_PERSON_DATES });
    expect(back.status).toBe(201);
  });

  it('eliminar el perfil borra su cumpleaños y su incorporación con la ficha: desaparecen del calendario', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    await admin.patch(`/api/people/${IDS.autor}`, { birthday: '11-26', startDate: '2025-11-03' });
    const november = async () => (await json(await admin.get('/api/calendar?year=2026&month=11'))).entries.filter((e: { personId?: string }) => e.personId === IDS.autor);
    expect((await november()).map((e: { kind: string }) => e.kind)).toEqual(['aniversario', 'cumpleanos']);

    const res = await admin.post(`/api/people/${IDS.autor}/remove`, { confirm: EMAILS.autor });
    expect((await json(res)).removed).toMatchObject({ calendarDatesDeleted: 2 });
    expect(await november()).toEqual([]);
    expect(JSON.stringify(await json(await admin.get('/api/calendar?year=2026&month=11')))).not.toContain('Jordi');
    // La auditoría lo dice con un recuento, sin las fechas ni el nombre.
    const detail = get<{ detail: string }>(env.db, "SELECT detail FROM audit_log WHERE action = 'persona.eliminar-perfil' AND entity_id = ?", IDS.autor)!.detail;
    expect(detail).toContain('Fechas del calendario borradas: 2.');
    expect(JSON.stringify(all(env.db, 'SELECT detail FROM audit_log'))).not.toMatch(/11-26|2025-11-03|Jordi/);
  });

  it('al eliminar el perfil se retira su nombre de «Revisado por»; el contenido sigue revisado, con su fecha', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const admin = await loginAs(env, EMAILS.admin);
    // Jordi publica un cliente marcando que el área lo ha revisado.
    const draft = (await json(await author.post('/api/contents', { type: 'cliente', payload: { name: 'Fjordlys Analytics AS', sector: 'Software', country: 'Noruega', area: 'fiscal', date: '2026-10-28' } }))).content;
    const published = (await json(await author.post(`/api/contents/${draft.id}/transitions`, { action: 'publicar', revision: draft.revision, reviewed: true }))).content;
    expect(published.item.editorial.review).toEqual({ state: 'revisado', reviewerName: 'Jordi Autor Vidal', reviewerId: IDS.autor, reviewedAt: START.toISOString() });
    // Una anotación anterior a guardar el identificador: solo con su nombre.
    run(env.db, 'UPDATE contents SET review = ? WHERE id = ?', JSON.stringify({ state: 'revisado', reviewerName: 'Jordi Autor Vidal', reviewedAt: '2026-09-01' }), IDS.news);

    const res = await admin.post(`/api/people/${IDS.autor}/remove`, { confirm: EMAILS.autor });
    expect(res.status).toBe(200);
    expect((await json(res)).removed).toMatchObject({ reviewerNamesRemoved: 2 });

    const employee = await loginAs(env, EMAILS.empleado);
    const client = (await json(await employee.get('/api/clients'))).items.find((c: { id: string }) => c.id === draft.id);
    expect(client.editorial.review).toEqual({ state: 'revisado', reviewedAt: START.toISOString() });
    expect((await json(await employee.get(`/api/news/${IDS.news}`))).news.editorial.review).toEqual({ state: 'revisado', reviewedAt: '2026-09-01' });
    // Lo que revisó otra persona no cambia.
    expect((await json(await employee.get(`/api/formations/${IDS.formation}`))).formation.editorial.review).toMatchObject({ state: 'revisado', reviewerName: 'Revisión jurídica' });
    expect(JSON.stringify(all(env.db, 'SELECT review FROM contents'))).not.toMatch(/Jordi Autor|p-autor/);
  });

  it('cada persona gestiona su foto de perfil', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const up = await employee.upload('PUT', '/api/me/photo', fileForm(PNG_BYTES, 'yo.png', 'image/png'));
    expect(up.status).toBe(200);
    const photo = (await json(up)).person.photo as string;
    expect(photo).toMatch(/^\/api\/files\/[0-9a-f-]{36}$/);
    const img = await employee.get(photo);
    expect(img.status).toBe(200);
    expect(img.headers.get('content-type')).toBe('image/png');
    expect(img.headers.get('content-disposition')).toMatch(/^inline/);

    const replaced = await employee.upload('PUT', '/api/me/photo', fileForm(PNG_BYTES, 'yo-2.png', 'image/png'));
    expect((await json(replaced)).person.photo).not.toBe(photo);
    expect(readdirSync(join(env.storageDir, 'files'))).toHaveLength(1);

    const removed = await employee.delete('/api/me/photo');
    expect(removed.status).toBe(200);
    expect((await json(removed)).person.photo).toBeUndefined();
    expect(readdirSync(join(env.storageDir, 'files'))).toHaveLength(0);
    expect(get(env.db, "SELECT 1 AS x FROM audit_log WHERE action = 'persona.foto-eliminar' AND entity_id = ?", IDS.empleado)).toBeDefined();

    // El perfil propio no tiene preferencias de cumpleaños (el consentimiento de la versión 1 no vuelve):
    // PATCH /api/me no existe; los datos del calendario se completan con PATCH /api/me/personal-dates.
    const me = await json(await employee.get('/api/me'));
    expect(me.person).not.toHaveProperty('showBirthday');
    const legacy = await employee.patch('/api/me', { showBirthday: false });
    expect(legacy.status).toBe(404);
    expect((await json(legacy)).error.code).toBe('NO_ENCONTRADO');
  });
});

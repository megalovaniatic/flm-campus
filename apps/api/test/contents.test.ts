import { assessmentClashReason, type AreaId } from '@flm/shared';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { get, run } from '../src/db/database';
import { assessmentPayload, EMAILS, formationPayload, IDS, question } from './fixtures/seed';
import { createTestEnv, json, loginAs, START, type TestClient, type TestEnv } from './helpers';

const draftPayload = (slug: string, title: string) => {
  const { id: _id, editorial: _editorial, ...payload } = formationPayload({ slug, title, area: 'laboral' });
  return payload;
};

/** Evaluación del área completa (10 preguntas, aprobado con 8), sin los campos que gestiona el servidor. */
const evaluation = (area: AreaId) => {
  const { id: _id, ...payload } = assessmentPayload({ area, intro: `Diez preguntas sobre el área ${area}.` });
  return payload;
};

async function createDraft(client: TestClient, slug = 'despido-objetivo', title = 'Despido objetivo') {
  const res = await client.post('/api/contents', { type: 'formacion', payload: draftPayload(slug, title) });
  expect(res.status).toBe(201);
  return (await json(res)).content as { id: string; revision: number; status: string };
}

describe('flujo editorial: guardar borrador o publicar', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('«Guardar borrador» valida la forma; publicar exige el esquema zod completo del tipo', async () => {
    const author = await loginAs(env, EMAILS.autor);
    // Un test final con 2 preguntas se puede guardar como borrador, pero no publicar.
    const payload = { ...draftPayload('mal', 'Formación incompleta'), quiz: { id: 'q', title: 'Test', passMark: 2, questions: [question('a', 'a'), question('b', 'b')] } };
    const created = await author.post('/api/contents', { type: 'formacion', payload });
    expect(created.status).toBe(201);
    const draft = (await json(created)).content;
    const res = await author.post(`/api/contents/${draft.id}/transitions`, { action: 'publicar', revision: draft.revision });
    expect(res.status).toBe(400);
    const body = await json(res);
    expect(body.error.code).toBe('VALIDACION');
    expect(JSON.stringify(body.error.details)).toContain('exactamente 3 preguntas');
    expect((await json(await author.get(`/api/contents/${draft.id}`))).content.status).toBe('borrador');

    // La forma, los tipos y los valores de las listas cerradas se validan siempre, también en un borrador.
    const event = await author.post('/api/contents', { type: 'evento', payload: { slug: 'x', category: 'encuentro', title: 'X', summary: 'Y', icon: 'cohete', sessions: [] } });
    expect(event.status).toBe(400);
    expect(JSON.stringify(await json(event))).toContain('icon');
  });

  it('un borrador se guarda a medias: sin obligatorios ni mínimos, pero con la misma forma, tipos y longitudes máximas', async () => {
    const author = await loginAs(env, EMAILS.autor);
    // Una noticia con solo el titular y el área, y otra con los textos vacíos: sin slug no ocupan ninguna dirección.
    const first = await author.post('/api/contents', { type: 'noticia', payload: { headline: 'Cambios en el SII', area: 'fiscal' } });
    expect(first.status).toBe(201);
    const news = (await json(first)).content;
    expect(news).toMatchObject({ status: 'borrador', title: 'Cambios en el SII', slug: null });
    const second = await author.post('/api/contents', { type: 'noticia', payload: { headline: '', area: 'fiscal', slug: '', kind: '' } });
    expect(second.status).toBe(201);
    expect((await json(second)).content).toMatchObject({ title: '', slug: null });

    // Lo que se rellena debe tener su forma, tipo, formato y longitud máxima; los campos desconocidos se descartan.
    for (const payload of [{ headline: 'x'.repeat(111) }, { headline: 42 }, { urgency: 'muy-alta' }, { source: { url: 'ftp://aeat.es' } }]) {
      const bad = await author.post('/api/contents', { type: 'noticia', payload });
      expect(bad.status, JSON.stringify(payload)).toBe(400);
      expect((await json(bad)).error.code).toBe('VALIDACION');
    }
    const extra = (await json(await author.post('/api/contents', { type: 'noticia', payload: { headline: 'Con un campo de más', inventado: true } }))).content;
    expect(extra.item).not.toHaveProperty('inventado');

    // Una formación sin términos clave ni fuentes; después, con la idea clave vacía.
    const { keyTerms: _keyTerms, sources: _sources, ...partial } = draftPayload('despido-objetivo', 'Despido objetivo');
    const formation = (await json(await author.post('/api/contents', { type: 'formacion', payload: partial }))).content;
    const saved = await author.put(`/api/contents/${formation.id}`, { revision: formation.revision, payload: { ...partial, takeaway: '' } });
    expect(saved.status).toBe(200);
    expect((await json(saved)).content.item).not.toHaveProperty('takeaway');

    // Publicar exige el esquema completo: los campos que faltan, con su ruta.
    const publish = await author.post(`/api/contents/${news.id}/transitions`, { action: 'publicar', revision: news.revision });
    expect(publish.status).toBe(400);
    expect((await json(publish)).error.details.map((d: { path: string }) => d.path)).toEqual(expect.arrayContaining(['slug', 'kind', 'oneLiner', 'date']));

    // Un evento a medias (con una sesión aún sin fecha) tiene ficha y vista previa, sin errores.
    const event = (await json(await author.post('/api/contents', { type: 'evento', payload: { title: 'Encuentro a medias', sessions: [{ label: 'Sesión 1' }] } }))).content;
    expect(event.phase).toBe('proximo');
    const preview = await author.get(`/api/contents/${event.id}/preview`);
    expect(preview.status).toBe(200);
    expect(await json(preview)).toMatchObject({ phase: 'proximo', item: { title: 'Encuentro a medias', kind: 'evento' } });
  });

  it('las personas empleadas no pueden crear contenidos; la evaluación del área, solo administración', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    expect((await employee.post('/api/contents', { type: 'noticia', payload: {} })).status).toBe(403);
    const author = await loginAs(env, EMAILS.autor);
    const res = await author.post('/api/contents', { type: 'test', payload: {} });
    expect(res.status).toBe(403);
    expect((await json(res)).error.message).toContain('evaluación del área');
  });

  it('la autoría guarda y publica lo suyo sin revisión previa, y nunca lo de otra persona', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const other = await loginAs(env, EMAILS.autora2);
    let content = await createDraft(author);
    expect(content.status).toBe('borrador');

    const foreign = await other.put(`/api/contents/${content.id}`, { revision: content.revision, payload: draftPayload('despido-objetivo', 'Intrusión') });
    expect(foreign.status).toBe(403);
    expect((await json(foreign)).error).toMatchObject({ code: 'SOLO_LO_PROPIO', message: 'Solo puedes modificar tus propios contenidos.' });
    expect((await other.get(`/api/contents/${content.id}`)).status).toBe(403);
    expect((await json(await other.get('/api/contents'))).items).toHaveLength(0);

    const saved = await author.put(`/api/contents/${content.id}`, { revision: content.revision, payload: draftPayload('despido-objetivo', 'Despido objetivo (v2)') });
    expect(saved.status).toBe(200);
    content = (await json(saved)).content;
    expect(content).toMatchObject({ title: 'Despido objetivo (v2)', revision: 2 });

    // Otra persona autora no puede publicarlo; las acciones del flujo antiguo ya no existen.
    const foreignPublish = await other.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: content.revision });
    expect(foreignPublish.status).toBe(403);
    expect((await json(foreignPublish)).error).toMatchObject({ code: 'SOLO_LO_PROPIO', message: 'Solo puedes publicar tus propios contenidos.' });
    for (const action of ['enviar', 'devolver']) {
      expect((await author.post(`/api/contents/${content.id}/transitions`, { action, revision: content.revision })).status).toBe(400);
    }

    const published = await author.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: content.revision });
    expect(published.status).toBe(200);
    const detail = (await json(published)).content;
    expect(detail.status).toBe('publicado');
    // Publicar no afirma por sí solo que el área lo ha revisado.
    expect(detail.item.editorial).toMatchObject({ status: 'publicado', authorId: IDS.autor, review: { state: 'pendiente' } });

    const employee = await loginAs(env, EMAILS.empleado);
    const list = await json(await employee.get('/api/formations?area=laboral'));
    expect(list.items.map((f: { id: string }) => f.id)).toContain(content.id);
    expect(get(env.db, "SELECT actor_id FROM audit_log WHERE action = 'contenido.publicar' AND entity_id = ?", content.id)).toMatchObject({ actor_id: IDS.autor });
    const again = await author.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: detail.revision });
    expect(again.status).toBe(409);
    expect((await json(again)).error.code).toBe('TRANSICION_NO_VALIDA');
  });

  it('administración publica cualquier contenido y puede anotar que el área lo ha revisado', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const admin = await loginAs(env, EMAILS.admin);
    const content = await createDraft(author);
    const published = await admin.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: content.revision, reviewed: true });
    expect(published.status).toBe(200);
    const detail = (await json(published)).content;
    expect(detail.item.editorial).toMatchObject({ status: 'publicado', authorId: IDS.autor, review: { state: 'revisado', reviewerName: 'Ana Admin Puig', reviewerId: IDS.admin } });
  });

  it('publicar cambios sin «Lo ha revisado el área» deja la revisión pendiente; marcándolo, guarda quién la revisó', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const employee = await loginAs(env, EMAILS.empleado);
    const reviewOf = async () => (await json(await employee.get(`/api/formations/${IDS.formation}`))).formation.editorial.review;
    expect(await reviewOf()).toMatchObject({ state: 'revisado', reviewerName: 'Revisión jurídica' });

    const publishChanges = async (title: string, reviewed?: boolean) => {
      const current = (await json(await author.get(`/api/contents/${IDS.formation}`))).content;
      const payload = { ...draftPayload('recargos-extemporaneos', title), area: 'fiscal' };
      const saved = (await json(await author.put(`/api/contents/${IDS.formation}`, { revision: current.revision, payload }))).content;
      const res = await author.post(`/api/contents/${IDS.formation}/transitions`, { action: 'publicar', revision: saved.revision, ...(reviewed === undefined ? {} : { reviewed }) });
      expect(res.status).toBe(200);
    };
    await publishChanges('Recargos (cambios sin revisar)');
    expect(await reviewOf()).toEqual({ state: 'pendiente' });
    await publishChanges('Recargos (revisados por el área)', true);
    expect(await reviewOf()).toEqual({ state: 'revisado', reviewerName: 'Jordi Autor Vidal', reviewerId: IDS.autor, reviewedAt: START.toISOString() });
  });

  it('detecta conflictos de concurrencia con el número de revisión (409)', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const content = await createDraft(author);
    expect((await author.put(`/api/contents/${content.id}`, { revision: content.revision, payload: draftPayload('despido-objetivo', 'Primera') })).status).toBe(200);
    const stale = await author.put(`/api/contents/${content.id}`, { revision: content.revision, payload: draftPayload('despido-objetivo', 'Segunda') });
    expect(stale.status).toBe(409);
    expect((await json(stale)).error.code).toBe('CONFLICTO_REVISION');
    expect((await author.put(`/api/contents/${content.id}`, { payload: {} })).status).toBe(400);
  });

  it('editar algo publicado guarda una revisión: la versión pública no cambia hasta que su autoría la publica', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const other = await loginAs(env, EMAILS.autora2);
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    const current = (await json(await author.get(`/api/contents/${IDS.formation}`))).content;
    expect(current.status).toBe('publicado');

    const intruder = await other.put(`/api/contents/${IDS.formation}`, { revision: current.revision, payload: { ...draftPayload('recargos-extemporaneos', 'Intrusión'), area: 'fiscal' } });
    expect(intruder.status).toBe(403);

    const edited = await author.put(`/api/contents/${IDS.formation}`, {
      revision: current.revision,
      payload: { ...draftPayload('recargos-extemporaneos', 'Recargos (edición revisada)'), area: 'fiscal' },
    });
    expect(edited.status).toBe(200);
    let detail = (await json(edited)).content;
    expect(detail.status).toBe('publicado');
    expect(detail.pendingRevision).toMatchObject({ status: 'borrador' });
    expect(detail.pendingRevision.item.title).toBe('Recargos (edición revisada)');

    const visible = await json(await employee.get(`/api/formations/${IDS.formation}`));
    expect(visible.formation.title).toBe('Recargos por presentación extemporánea');
    const preview = await json(await author.get(`/api/contents/${IDS.formation}/preview`));
    expect(preview).toMatchObject({ preview: true, source: 'revision-pendiente', status: 'borrador', item: { title: 'Recargos (edición revisada)' } });
    expect(preview.item.quiz.questions[0].correctOptionId).toBe('a');

    const archiveBlocked = await admin.post(`/api/contents/${IDS.formation}/transitions`, { action: 'archivar', revision: detail.revision });
    expect(archiveBlocked.status).toBe(409);
    expect((await json(archiveBlocked)).error.code).toBe('REVISION_PENDIENTE');

    expect((await other.post(`/api/contents/${IDS.formation}/transitions`, { action: 'publicar', revision: detail.revision })).status).toBe(403);
    detail = (await json(await author.post(`/api/contents/${IDS.formation}/transitions`, { action: 'publicar', revision: detail.revision }))).content;
    expect(detail.pendingRevision).toBeNull();
    expect((await json(await employee.get(`/api/formations/${IDS.formation}`))).formation.title).toBe('Recargos (edición revisada)');
    const history = await json(await admin.get(`/api/contents/${IDS.formation}/revisions`));
    expect(history.items[0]).toMatchObject({ status: 'aprobada', decidedBy: IDS.autor });
  });

  it('archiva y restaura (publicado ↔ archivado), solo administración', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    let detail = (await json(await admin.get(`/api/contents/${IDS.news}`))).content;
    detail = (await json(await admin.post(`/api/contents/${IDS.news}/transitions`, { action: 'archivar', revision: detail.revision }))).content;
    expect(detail.status).toBe('archivado');
    expect((await employee.get(`/api/news/${IDS.news}`)).status).toBe(404);
    expect((await admin.put(`/api/contents/${IDS.news}`, { revision: detail.revision, payload: {} })).status).toBe(409);
    detail = (await json(await admin.post(`/api/contents/${IDS.news}/transitions`, { action: 'restaurar', revision: detail.revision }))).content;
    expect(detail.status).toBe('publicado');
    expect((await employee.get(`/api/news/${IDS.news}`)).status).toBe(200);

    // Ni siquiera sobre su propio contenido: la autoría no archiva ni restaura.
    const author = await loginAs(env, EMAILS.autor);
    const own = (await json(await author.get(`/api/contents/${IDS.formation}`))).content;
    const denied = await author.post(`/api/contents/${IDS.formation}/transitions`, { action: 'archivar', revision: own.revision });
    expect(denied.status).toBe(403);
    expect((await json(denied)).error.code).toBe('SIN_PERMISO');
  });

  it('vista previa solo para la autoría y administración; borradores eliminables', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const employee = await loginAs(env, EMAILS.empleado);
    const admin = await loginAs(env, EMAILS.admin);
    const draft = await createDraft(author);
    expect((await employee.get(`/api/contents/${draft.id}/preview`)).status).toBe(403);
    expect((await json(await admin.get(`/api/contents/${draft.id}/preview`))).item.title).toBe('Despido objetivo');
    expect((await employee.get(`/api/formations/${draft.id}`)).status).toBe(404);

    const duplicate = await author.post('/api/contents', { type: 'formacion', payload: draftPayload('despido-objetivo', 'Otra') });
    expect(duplicate.status).toBe(409);
    expect((await json(duplicate)).error.code).toBe('SLUG_DUPLICADO');

    const other = await loginAs(env, EMAILS.autora2);
    expect((await other.delete(`/api/contents/${draft.id}?revision=${draft.revision}`)).status).toBe(403);
    expect((await admin.delete(`/api/contents/${IDS.formation}?revision=1`)).status).toBe(409);
    expect((await author.delete(`/api/contents/${draft.id}?revision=${draft.revision}`)).status).toBe(200);
    expect((await author.get(`/api/contents/${draft.id}`)).status).toBe(404);
  });

  it('la evaluación del área es de administración en cada acción, también si figura como propia tras un cambio de rol', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    expect((await admin.patch(`/api/people/${IDS.autor}`, { role: 'admin' })).status).toBe(200);
    let jordi = await loginAs(env, EMAILS.autor);
    // Como administrador, Jordi publica la evaluación de Laboral, deja cambios pendientes y empieza la de Mercantil.
    let laboral = (await json(await jordi.post('/api/contents', { type: 'test', payload: evaluation('laboral') }))).content;
    laboral = (await json(await jordi.post(`/api/contents/${laboral.id}/transitions`, { action: 'publicar', revision: laboral.revision }))).content;
    laboral = (await json(await jordi.put(`/api/contents/${laboral.id}`, { revision: laboral.revision, payload: { ...evaluation('laboral'), intro: 'Cambios sin publicar.' } }))).content;
    expect(laboral).toMatchObject({ status: 'publicado', authorId: IDS.autor, pendingRevision: { status: 'borrador' } });
    const mercantil = (await json(await jordi.post('/api/contents', { type: 'test', payload: evaluation('mercantil') }))).content;

    // Vuelve a ser autor: las dos figuran como suyas, pero su rol ya no trabaja con evaluaciones del área.
    expect((await admin.patch(`/api/people/${IDS.autor}`, { role: 'autor' })).status).toBe(200);
    jordi = await loginAs(env, EMAILS.autor);
    const attempts: [string, string, unknown?][] = [
      ['GET', `/api/contents/${laboral.id}`],
      ['GET', `/api/contents/${laboral.id}/preview`],
      ['GET', `/api/contents/${laboral.id}/revisions`],
      ['PUT', `/api/contents/${laboral.id}`, { revision: laboral.revision, payload: evaluation('laboral') }],
      ['POST', `/api/contents/${laboral.id}/transitions`, { action: 'publicar', revision: laboral.revision }],
      ['DELETE', `/api/contents/${laboral.id}/revision?revision=${laboral.revision}`],
      ['PUT', `/api/contents/${mercantil.id}`, { revision: mercantil.revision, payload: evaluation('mercantil') }],
      ['POST', `/api/contents/${mercantil.id}/transitions`, { action: 'publicar', revision: mercantil.revision }],
      ['DELETE', `/api/contents/${mercantil.id}?revision=${mercantil.revision}`],
    ];
    for (const [method, path, body] of attempts) {
      const res = await jordi.request(method, path, body === undefined ? {} : { json: body });
      expect(res.status, `${method} ${path}`).toBe(403);
      expect((await json(res)).error).toMatchObject({ code: 'SIN_PERMISO', message: 'Tu rol no permite trabajar con contenidos de tipo evaluación del área.' });
    }
    expect((await json(await jordi.get('/api/contents'))).items.map((c: { type: string }) => c.type)).not.toContain('test');

    // Nada ha cambiado: la de Laboral sigue publicada con sus cambios pendientes y la de Mercantil, en borrador.
    expect((await json(await admin.get(`/api/contents/${laboral.id}`))).content).toMatchObject({ status: 'publicado', revision: laboral.revision, pendingRevision: { status: 'borrador' } });
    expect((await json(await admin.get(`/api/contents/${mercantil.id}`))).content).toMatchObject({ status: 'borrador', revision: mercantil.revision });
  });

  it('una sola evaluación vigente por área: 409 al crear, guardar, publicar o restaurar otra', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    // Fiscal ya tiene la suya, publicada.
    const duplicate = await admin.post('/api/contents', { type: 'test', payload: evaluation('fiscal') });
    expect(duplicate.status).toBe(409);
    // El mismo motivo que da la demo (compartido): qué evaluación tiene ya el área y qué hacer.
    expect((await json(duplicate)).error).toMatchObject({ code: 'EVALUACION_DUPLICADA', message: assessmentClashReason('Fiscal', 'publicado', 'preparar') });

    // Un borrador de Laboral no puede pasar a Fiscal, ni la de Fiscal (en sus cambios) a Laboral.
    const laboral = (await json(await admin.post('/api/contents', { type: 'test', payload: evaluation('laboral') }))).content;
    expect((await admin.put(`/api/contents/${laboral.id}`, { revision: laboral.revision, payload: evaluation('fiscal') })).status).toBe(409);
    let fiscal = (await json(await admin.get(`/api/contents/${IDS.assessment}`))).content;
    const moved = await admin.put(`/api/contents/${IDS.assessment}`, { revision: fiscal.revision, payload: evaluation('laboral') });
    expect(moved.status).toBe(409);
    expect((await json(moved)).error.message).toBe(assessmentClashReason('Laboral', 'borrador', 'preparar'));

    // Archivada, la de Fiscal deja de verse y el área puede tener otra.
    fiscal = (await json(await admin.post(`/api/contents/${IDS.assessment}/transitions`, { action: 'archivar', revision: fiscal.revision }))).content;
    expect((await json(await employee.get('/api/assessments?area=fiscal'))).items).toEqual([]);
    const replacement = (await json(await admin.post('/api/contents', { type: 'test', payload: evaluation('fiscal') }))).content;
    expect((await admin.post(`/api/contents/${replacement.id}/transitions`, { action: 'publicar', revision: replacement.revision })).status).toBe(200);
    expect((await json(await employee.get('/api/assessments?area=fiscal'))).items.map((a: { id: string }) => a.id)).toEqual([replacement.id]);

    // La archivada no se puede restaurar mientras otra sea la vigente.
    const restore = await admin.post(`/api/contents/${IDS.assessment}/transitions`, { action: 'restaurar', revision: fiscal.revision });
    expect(restore.status).toBe(409);
    expect((await json(restore)).error).toMatchObject({ code: 'EVALUACION_DUPLICADA', message: assessmentClashReason('Fiscal', 'publicado', 'restaurar') });

    // Publicar también lo comprueba (p. ej., con datos de antes de esta regla: dos evaluaciones en un área).
    run(env.db, "UPDATE contents SET payload = json_set(payload, '$.area', 'fiscal'), area = 'fiscal' WHERE id = ?", laboral.id);
    const publish = await admin.post(`/api/contents/${laboral.id}/transitions`, { action: 'publicar', revision: laboral.revision });
    expect(publish.status).toBe(409);
    expect((await json(publish)).error.code).toBe('EVALUACION_DUPLICADA');
  });
});

describe('«Ponte al día»: nuevos clientes y bienvenidas', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  const client = { name: 'Fjordlys Analytics AS', sector: 'Software de previsión de demanda', country: 'Noruega', area: 'fiscal', date: '2026-10-28', summary: 'Abre oficina en Barcelona.' };

  it('la autoría crea y publica un cliente nuevo con el país de la lista común', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const employee = await loginAs(env, EMAILS.empleado);
    expect((await author.post('/api/contents', { type: 'cliente', payload: { ...client, country: 'Noruegia' } })).status).toBe(400);
    const created = await author.post('/api/contents', { type: 'cliente', payload: client });
    expect(created.status).toBe(201);
    const content = (await json(created)).content;
    expect(content).toMatchObject({ type: 'cliente', title: 'Fjordlys Analytics AS', area: 'fiscal', status: 'borrador', authorId: IDS.autor });

    expect((await json(await employee.get('/api/clients'))).items.map((c: { id: string }) => c.id)).toEqual([IDS.cliente]);
    const published = await author.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: content.revision });
    expect(published.status).toBe(200);
    const list = await json(await employee.get('/api/clients'));
    expect(list.items.map((c: { id: string }) => c.id)).toEqual([content.id, IDS.cliente]);
    expect(list.items[0]).toMatchObject({ name: 'Fjordlys Analytics AS', country: 'Noruega', editorial: { status: 'publicado' } });
    expect((await json(await employee.get('/api/clients?limit=1'))).items).toHaveLength(1);
  });

  it('bienvenidas: una por persona activa, sin fecha de incorporación y sin el nombre en la tabla', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    const welcome = { personId: IDS.empleado, date: '2026-10-28', message: 'Se suma al Área Fiscal en Granollers.' };

    const withDate = await author.post('/api/contents', { type: 'bienvenida', payload: { ...welcome, startDate: '2026-10-01' } });
    expect(withDate.status).toBe(400);
    const unknown = await author.post('/api/contents', { type: 'bienvenida', payload: { ...welcome, personId: 'p-no-existe' } });
    expect((await json(unknown)).error.code).toBe('PERSONA_NO_DISPONIBLE');
    const repeated = await author.post('/api/contents', { type: 'bienvenida', payload: { ...welcome, personId: IDS.reservada } });
    expect(repeated.status).toBe(409);
    expect((await json(repeated)).error.code).toBe('BIENVENIDA_DUPLICADA');

    const created = await author.post('/api/contents', { type: 'bienvenida', payload: welcome });
    expect(created.status).toBe(201);
    const content = (await json(created)).content;
    expect(content.title).toBe('Bienvenida al equipo');
    expect(JSON.stringify(get(env.db, 'SELECT title, area, slug FROM contents WHERE id = ?', content.id))).not.toMatch(/Pau|Empleado/);
    expect((await author.post('/api/contents', { type: 'bienvenida', payload: welcome })).status).toBe(409);

    await author.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: content.revision });
    let list = await json(await employee.get('/api/welcomes'));
    expect(list.items.map((w: { id: string }) => w.id)).toEqual([content.id, IDS.bienvenida]);
    expect(list.items[0].person).toMatchObject({ id: IDS.empleado, name: 'Pau Empleado Camps', office: 'Granollers' });
    expect(JSON.stringify(list)).not.toContain('@flmexperts.com');

    // Si la persona se desactiva, su bienvenida deja de mostrarse.
    await admin.post(`/api/people/${IDS.reservada}/deactivate`);
    list = await json(await employee.get('/api/welcomes'));
    expect(list.items.map((w: { id: string }) => w.id)).toEqual([content.id]);
  });
});

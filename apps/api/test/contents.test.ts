import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { get } from '../src/db/database';
import { EMAILS, formationPayload, IDS, question } from './fixtures/seed';
import { createTestEnv, json, loginAs, type TestClient, type TestEnv } from './helpers';

const draftPayload = (slug: string, title: string) => {
  const { id: _id, editorial: _editorial, ...payload } = formationPayload({ slug, title, area: 'laboral' });
  return payload;
};

async function createDraft(client: TestClient, slug = 'despido-objetivo', title = 'Despido objetivo') {
  const res = await client.post('/api/contents', { type: 'formacion', payload: draftPayload(slug, title) });
  expect(res.status).toBe(201);
  return (await json(res)).content as { id: string; revision: number; status: string };
}

describe('flujo editorial', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('valida el payload con el esquema zod del tipo', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const payload = { ...draftPayload('mal', 'Formación incompleta'), quiz: { id: 'q', title: 'Test', passMark: 2, questions: [question('a', 'a'), question('b', 'b')] } };
    const res = await author.post('/api/contents', { type: 'formacion', payload });
    expect(res.status).toBe(400);
    const body = await json(res);
    expect(body.error.code).toBe('VALIDACION');
    expect(JSON.stringify(body.error.details)).toContain('exactamente 3 preguntas');

    const event = await author.post('/api/contents', { type: 'evento', payload: { slug: 'x', category: 'encuentro', title: 'X', summary: 'Y', icon: 'cohete', sessions: [] } });
    expect(event.status).toBe(400);
    expect(JSON.stringify(await json(event))).toContain('icon');
  });

  it('las personas empleadas no pueden crear contenidos', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    expect((await employee.post('/api/contents', { type: 'noticia', payload: {} })).status).toBe(403);
  });

  it('borrador → en revisión → devuelto con comentario → publicado, con permisos y propiedad', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const other = await loginAs(env, EMAILS.autora2);
    const admin = await loginAs(env, EMAILS.admin);
    let content = await createDraft(author);
    expect(content.status).toBe('borrador');

    const foreign = await other.put(`/api/contents/${content.id}`, { revision: content.revision, payload: draftPayload('despido-objetivo', 'Intrusión') });
    expect(foreign.status).toBe(403);
    expect((await json(foreign)).error.message).toBe('Solo puedes modificar tus propios borradores.');
    expect((await other.get(`/api/contents/${content.id}`)).status).toBe(403);
    expect((await json(await other.get('/api/contents'))).items).toHaveLength(0);

    const saved = await author.put(`/api/contents/${content.id}`, { revision: content.revision, payload: draftPayload('despido-objetivo', 'Despido objetivo (v2)') });
    expect(saved.status).toBe(200);
    content = (await json(saved)).content;
    expect(content).toMatchObject({ title: 'Despido objetivo (v2)', revision: 2 });

    const sent = await author.post(`/api/contents/${content.id}/transitions`, { action: 'enviar', revision: content.revision });
    content = (await json(sent)).content;
    expect(content.status).toBe('en-revision');

    const selfPublish = await author.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: content.revision });
    expect(selfPublish.status).toBe(403);
    expect((await author.put(`/api/contents/${content.id}`, { revision: content.revision, payload: draftPayload('despido-objetivo', 'X') })).status).toBe(409);

    expect((await admin.post(`/api/contents/${content.id}/transitions`, { action: 'devolver', revision: content.revision })).status).toBe(400);
    const returned = await admin.post(`/api/contents/${content.id}/transitions`, { action: 'devolver', revision: content.revision, comment: 'Falta citar el artículo 53 ET.' });
    content = (await json(returned)).content;
    expect(content).toMatchObject({ status: 'borrador', returnComment: 'Falta citar el artículo 53 ET.' });

    content = (await json(await author.post(`/api/contents/${content.id}/transitions`, { action: 'enviar', revision: content.revision }))).content;
    const published = await admin.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: content.revision });
    expect(published.status).toBe(200);
    const detail = (await json(published)).content;
    expect(detail.status).toBe('publicado');
    expect(detail.item.editorial).toMatchObject({ status: 'publicado', review: { state: 'revisado', reviewerName: 'Ana Admin Puig' } });

    const employee = await loginAs(env, EMAILS.empleado);
    const list = await json(await employee.get('/api/formations?area=laboral'));
    expect(list.items.map((f: { id: string }) => f.id)).toContain(content.id);
    expect(get(env.db, "SELECT 1 AS x FROM audit_log WHERE action = 'contenido.publicar' AND entity_id = ?", content.id)).toBeDefined();
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

  it('editar algo publicado crea una revisión: la versión pública sigue visible hasta aprobarla', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    const current = (await json(await author.get(`/api/contents/${IDS.formation}`))).content;
    expect(current.status).toBe('publicado');

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
    expect(preview).toMatchObject({ preview: true, source: 'revision-pendiente', item: { title: 'Recargos (edición revisada)' } });
    expect(preview.item.quiz.questions[0].correctOptionId).toBe('a');

    detail = (await json(await author.post(`/api/contents/${IDS.formation}/transitions`, { action: 'enviar', revision: detail.revision }))).content;
    expect(detail.pendingRevision.status).toBe('en-revision');
    const archiveBlocked = await admin.post(`/api/contents/${IDS.formation}/transitions`, { action: 'archivar', revision: detail.revision });
    expect(archiveBlocked.status).toBe(409);
    detail = (await json(await admin.post(`/api/contents/${IDS.formation}/transitions`, { action: 'publicar', revision: detail.revision }))).content;
    expect(detail.pendingRevision).toBeNull();
    expect((await json(await employee.get(`/api/formations/${IDS.formation}`))).formation.title).toBe('Recargos (edición revisada)');
    const history = await json(await admin.get(`/api/contents/${IDS.formation}/revisions`));
    expect(history.items[0]).toMatchObject({ status: 'aprobada' });
  });

  it('archiva y restaura (publicado ↔ archivado)', async () => {
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
    const author = await loginAs(env, EMAILS.autor);
    expect((await author.post(`/api/contents/${IDS.news}/transitions`, { action: 'archivar', revision: detail.revision })).status).toBe(403);
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
});

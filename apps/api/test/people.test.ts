import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { all, get } from '../src/db/database';
import { EMAILS, FORMATION_CORRECT, IDS } from './fixtures/seed';
import { createTestEnv, fileForm, json, loginAs, PASSWORD, PNG_BYTES, TestClient, type TestEnv } from './helpers';

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

    const duplicate = await admin.post('/api/people', { email: EMAILS.empleado, name: 'Otra', position: 'Asesora', department: 'Fiscal', office: 'Barcelona', role: 'empleado' });
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
    const created = await json(await admin.post('/api/people', { email: 'nueva.admin@flmexperts.com', name: 'Nueva Admin', position: 'Dirección', department: 'Dirección', office: 'Barcelona', role: 'admin' }));
    expect(created.person.accountState).toBe('pendiente-activacion');
    expect((await admin.post(`/api/people/${IDS.admin}/deactivate`)).status).toBe(409);

    expect((await admin.patch(`/api/people/${IDS.autor}`, { role: 'admin' })).status).toBe(200);
    const ok = await admin.patch(`/api/people/${IDS.admin}`, { role: 'empleado' });
    expect(ok.status).toBe(200);
    expect((await admin.get('/api/people')).status).toBe(401);
  });

  it('elimina datos personales con confirmación explícita, conserva agregados y deja auditoría', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    await employee.upload('PUT', '/api/me/photo', fileForm(PNG_BYTES, 'retrato.png', 'image/png'));
    await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: { ...FORMATION_CORRECT, q1: 'b' } });
    const photoFiles = readdirSync(join(env.storageDir, 'files'));
    expect(photoFiles).toHaveLength(1);

    const admin = await loginAs(env, EMAILS.admin);
    const wrong = await admin.post(`/api/people/${IDS.empleado}/anonymize`, { confirm: 'otra@flmexperts.com' });
    expect(wrong.status).toBe(400);
    expect((await json(wrong)).error.code).toBe('CONFIRMACION_NO_VALIDA');

    const res = await admin.post(`/api/people/${IDS.empleado}/anonymize`, { confirm: EMAILS.empleado.toUpperCase() });
    expect(res.status).toBe(200);
    const person = (await json(res)).person;
    expect(person).toMatchObject({ name: 'Persona eliminada', accountState: 'anonimizada', status: 'inactiva' });
    expect(person.email).not.toContain('pau');
    expect(person.birthday).toBeUndefined();
    expect(person.photo).toBeUndefined();
    expect(person.startDate).toBeUndefined();
    expect(existsSync(join(env.storageDir, 'files', photoFiles[0]!))).toBe(false);
    expect(all(env.db, 'SELECT id FROM sessions WHERE user_id = ?', IDS.empleado)).toHaveLength(0);

    // Los intentos se conservan desvinculados (agregados no identificativos).
    expect(get<{ n: number }>(env.db, 'SELECT COUNT(*) AS n FROM quiz_attempts WHERE user_id IS NULL')!.n).toBe(1);
    const errors = await json(await admin.get(`/api/reports/errors/${IDS.formation}`));
    expect(errors.attempts).toBe(1);

    const auditRows = all<{ detail: string | null }>(env.db, 'SELECT detail FROM audit_log');
    expect(JSON.stringify(auditRows)).not.toMatch(/pau\.empleado|Pau Empleado/i);
    expect(get(env.db, "SELECT 1 AS x FROM audit_log WHERE action = 'persona.eliminar-datos' AND entity_id = ?", IDS.empleado)).toBeDefined();

    expect((await employee.get('/api/me')).status).toBe(401);
    expect((await new TestClient(env.app).login(EMAILS.empleado, PASSWORD)).status).toBe(401);
    expect((await admin.post(`/api/people/${IDS.empleado}/reactivate`)).status).toBe(409);
  });

  it('cada persona gestiona su foto y su consentimiento de cumpleaños', async () => {
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

    const pref = await employee.patch('/api/me', { showBirthday: false });
    expect((await json(pref)).person.showBirthday).toBe(false);
    expect(get(env.db, "SELECT 1 AS x FROM audit_log WHERE action = 'perfil.cumpleanos'")).toBeDefined();
    expect((await employee.patch('/api/me', { birthday: '02-30' })).status).toBe(400);
  });
});

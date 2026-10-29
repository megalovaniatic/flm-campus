import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from '../src/config';
import { all, get, openDatabase, run, type Db } from '../src/db/database';
import { listMigrations, migrate, MigrationError } from '../src/db/migrate';
import { createBackup } from '../src/services/backup';
import { createContent, documentVersions } from '../src/services/content';
import { createUser } from '../src/services/people';
import { purgeExpiredData } from '../src/services/retention';
import { importSeed, SeedValidationError } from '../src/services/seed';
import { assessmentPayload, EMAILS, FORMATION_CORRECT as FORMATION_CORRECT_ANSWERS, fixtureSeed, IDS } from './fixtures/seed';
import { createTestEnv, DAY, json, loginAs, START } from './helpers';

describe('auditoría', () => {
  it('registra acciones de seguridad y editoriales y solo la consulta administración', async () => {
    const env = await createTestEnv();
    const employee = await loginAs(env, EMAILS.empleado);
    await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: FORMATION_CORRECT_ANSWERS });
    const admin = await loginAs(env, EMAILS.admin);
    const news = (await json(await admin.get(`/api/contents/${IDS.news}`))).content;
    await admin.post(`/api/contents/${IDS.news}/transitions`, { action: 'archivar', revision: news.revision });

    const res = await admin.get('/api/audit?action=sesion');
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.total).toBeGreaterThanOrEqual(2);
    expect(body.items[0]).toMatchObject({ action: 'sesion.inicio', entity: 'sesion' });
    const archived = await json(await admin.get(`/api/audit?entity=noticia&entityId=${IDS.news}`));
    expect(archived.items[0]).toMatchObject({ action: 'contenido.archivar', actorId: IDS.admin, actorName: 'Ana Admin Puig' });
    expect(archived.items[0].at).toBe(START.toISOString());
    expect((await employee.get('/api/audit')).status).toBe(403);
    env.close();
  });
});

describe('retención de datos', () => {
  it('purga sesiones y enlaces caducados, auditoría de más de 2 años y progreso 1 año después de la baja', async () => {
    const env = await createTestEnv();
    const employee = await loginAs(env, EMAILS.empleado);
    await employee.post(`/api/formations/${IDS.formation}/read`, {});
    await employee.post(`/api/formations/${IDS.formation}/attempts`, { answers: FORMATION_CORRECT_ANSWERS });
    const admin = await loginAs(env, EMAILS.admin);
    await admin.post('/api/people', { email: 'pendiente@flmexperts.com', name: 'Pendiente', position: 'Asesora', department: 'Fiscal', office: 'Vic', role: 'empleado' });
    await admin.post(`/api/people/${IDS.empleado}/deactivate`);
    run(env.db, "INSERT INTO audit_log (at, actor_id, action, entity) VALUES ('2024-01-01T00:00:00.000Z', NULL, 'prueba.antigua', 'sistema')");

    // Al día siguiente: las sesiones revocadas e inactivas ya no hacen falta.
    let result = purgeExpiredData(env.db, new Date(START.getTime() + 2 * DAY));
    expect(result.sessions).toBeGreaterThanOrEqual(2);
    expect(result.auditEntries).toBe(1);
    expect(result.attemptsDissociated).toBe(0);
    expect(get(env.db, 'SELECT 1 AS x FROM auth_tokens')).toBeDefined(); // el enlace de activación (7 días) sigue vigente

    // Un año y un día después de la baja.
    result = purgeExpiredData(env.db, new Date(START.getTime() + 367 * DAY));
    expect(result.tokens).toBe(1);
    expect(result.attemptsDissociated).toBe(1);
    expect(result.readsDeleted).toBe(1);
    expect(get<{ n: number }>(env.db, 'SELECT COUNT(*) AS n FROM quiz_attempts WHERE user_id IS NULL')!.n).toBe(1);
    expect(all(env.db, 'SELECT * FROM sessions')).toHaveLength(0);
    expect(get(env.db, "SELECT 1 AS x FROM audit_log WHERE action = 'retencion.purga'")).toBeDefined();
    env.close();
  });
});

const MIGRATIONS = [
  '0001_esquema_inicial.sql',
  '0002_sin_cumpleanos_ni_incorporacion.sql',
  '0003_formaciones_voluntarias.sql',
  '0004_creador_y_autoria_opcional.sql',
  '0005_pdf_pendiente_en_revision.sql',
];
const PERSONAL_DATES = ['birthday', 'show_birthday', 'start_date'];
const columnsOf = (db: Db, table: string) => all<{ name: string }>(db, `SELECT name FROM pragma_table_info('${table}')`).map((c) => c.name);
const schemaObject = (db: Db, name: string) => get(db, 'SELECT 1 AS x FROM sqlite_schema WHERE name = ?', name);

describe('migraciones y copias de seguridad', () => {
  it('aplica las migraciones una sola vez', () => {
    const db = openDatabase(':memory:');
    expect(migrate(db).applied).toEqual(MIGRATIONS);
    expect(migrate(db).applied).toEqual([]);
    expect(get<{ version: number }>(db, 'SELECT MAX(version) AS version FROM schema_migrations')!.version).toBe(5);
    expect(get<{ foreign_keys: number }>(db, 'PRAGMA foreign_keys')!.foreign_keys).toBe(1);
    // 0005: el PDF nuevo de un documento publicado espera en su revisión.
    expect(columnsOf(db, 'document_versions')).toContain('revision_id');
    db.close();
  });

  it('rechaza dos migraciones con la misma versión antes de aplicar nada', () => {
    const dir = mkdtempSync(join(tmpdir(), 'flm-migraciones-'));
    writeFileSync(join(dir, '0001_una.sql'), 'CREATE TABLE una (id TEXT);');
    writeFileSync(join(dir, '0001_otra.sql'), 'CREATE TABLE otra (id TEXT);');
    expect(() => listMigrations(dir)).toThrow(/dos migraciones con la versión 0001/);
    const db = openDatabase(':memory:');
    expect(() => migrate(db, dir)).toThrow(MigrationError);
    expect(schemaObject(db, 'una')).toBeUndefined();
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('una migración que reconstruye tablas sin claves foráneas se deshace entera si deja referencias rotas', () => {
    const dir = mkdtempSync(join(tmpdir(), 'flm-migraciones-'));
    writeFileSync(join(dir, '0001_base.sql'), 'CREATE TABLE padre (id TEXT PRIMARY KEY); CREATE TABLE hija (id TEXT PRIMARY KEY, padre_id TEXT REFERENCES padre(id));');
    writeFileSync(join(dir, '0002_rota.sql'), "-- flm:sin-claves-foraneas\nINSERT INTO hija (id, padre_id) VALUES ('h-1', 'no-existe');");
    const db = openDatabase(':memory:');
    expect(() => migrate(db, dir)).toThrow(/referencias rotas/);
    expect(all(db, 'SELECT * FROM hija')).toEqual([]);
    expect(all<{ version: number }>(db, 'SELECT version FROM schema_migrations').map((r) => r.version)).toEqual([1]);
    expect(get<{ foreign_keys: number }>(db, 'PRAGMA foreign_keys')!.foreign_keys).toBe(1);
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('la 0004 conserva todo lo anterior: «en revisión» pasa a borrador, sin borrar en cascada y con autoría opcional', () => {
    const dir = mkdtempSync(join(tmpdir(), 'flm-migraciones-'));
    for (const m of listMigrations().slice(0, 3)) copyFileSync(m.file, join(dir, m.name));
    const db = openDatabase(':memory:');
    expect(migrate(db, dir).current).toBe(3);
    const user = (id: string, extra = '') =>
      run(db, `INSERT INTO users (id, email, name, position, department, office, role, created_at, updated_at${extra ? ', anonymized_at' : ''}) VALUES (?, ?, ?, 'Puesto', 'Fiscal', 'Vic', 'autor', 'x', 'x'${extra ? ", 'x'" : ''})`, id, `${id}@flmexperts.com`, id);
    user('p-1');
    user('p-2');
    user('p-anon', 'anonimizada');
    run(db, "INSERT INTO contents (id, type, title, status, author_id, payload, return_comment, created_at, updated_at) VALUES ('f-1', 'formacion', 'Formación', 'publicado', 'p-1', '{}', NULL, 'x', 'x')");
    run(db, "INSERT INTO contents (id, type, title, status, author_id, payload, return_comment, created_at, updated_at) VALUES ('n-1', 'noticia', 'Noticia', 'en-revision', 'p-2', '{}', 'Revisa la fuente', 'x', 'x')");
    run(db, "INSERT INTO contents (id, type, title, status, author_id, payload, created_at, updated_at) VALUES ('d-1', 'documento', 'Documento', 'publicado', 'p-anon', '{}', 'x', 'x')");
    run(db, "INSERT INTO content_revisions (id, content_id, status, author_id, payload, return_comment, created_at, updated_at) VALUES ('r-1', 'f-1', 'en-revision', 'p-2', '{}', 'Cambia el ejemplo', 'x', 'x')");
    run(db, "INSERT INTO content_revisions (id, content_id, status, author_id, payload, created_at, updated_at, decided_at, decided_by) VALUES ('r-0', 'f-1', 'aprobada', 'p-1', '{}', 'x', 'x', 'x', 'p-anon')");
    run(db, "INSERT INTO document_versions (content_id, version, size_kb, uploaded_at, uploaded_by) VALUES ('d-1', 1, 10, 'x', 'p-anon')");
    run(db, "INSERT INTO read_confirmations (user_id, content_id, version, read_at) VALUES ('p-2', 'f-1', 1, 'x')");
    run(db, "INSERT INTO quiz_attempts (id, user_id, content_id, quiz_id, version, answers, correct, total, passed, created_at) VALUES ('a-1', 'p-2', 'f-1', 'q', 1, '{}', 2, 3, 1, 'x')");

    expect(migrate(db).applied).toEqual(MIGRATIONS.slice(3));
    // Nada se pierde y nada queda «en revisión».
    expect(all<{ id: string; status: string }>(db, 'SELECT id, status FROM contents ORDER BY id')).toEqual([
      { id: 'd-1', status: 'publicado' },
      { id: 'f-1', status: 'publicado' },
      { id: 'n-1', status: 'borrador' },
    ]);
    expect(all<{ id: string; status: string }>(db, 'SELECT id, status FROM content_revisions ORDER BY id')).toEqual([
      { id: 'r-0', status: 'aprobada' },
      { id: 'r-1', status: 'borrador' },
    ]);
    expect(get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM document_versions')!.n).toBe(1);
    expect(get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM read_confirmations')!.n).toBe(1);
    expect(get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM quiz_attempts')!.n).toBe(1);
    expect(columnsOf(db, 'contents')).not.toContain('return_comment');
    expect(columnsOf(db, 'content_revisions')).not.toContain('return_comment');

    // La cuenta anonimizada pasa a ser un perfil eliminado: su contenido queda sin autoría.
    expect(get(db, "SELECT 1 AS x FROM users WHERE id = 'p-anon'")).toBeUndefined();
    expect(get(db, "SELECT author_id FROM contents WHERE id = 'd-1'")).toMatchObject({ author_id: null });
    expect(get(db, "SELECT decided_by FROM content_revisions WHERE id = 'r-0'")).toMatchObject({ decided_by: null });
    expect(get(db, "SELECT uploaded_by FROM document_versions WHERE content_id = 'd-1'")).toMatchObject({ uploaded_by: null });
    expect(all(db, 'PRAGMA foreign_key_check')).toEqual([]);
    expect(get<{ integrity_check: string }>(db, 'PRAGMA integrity_check')!.integrity_check).toBe('ok');
    expect(get<{ foreign_keys: number }>(db, 'PRAGMA foreign_keys')!.foreign_keys).toBe(1);

    // Tipos nuevos y estados del flujo nuevo; borrar a una persona deja su contenido sin autoría.
    run(db, "INSERT INTO contents (id, type, title, status, author_id, payload, created_at, updated_at) VALUES ('c-1', 'cliente', 'Cliente', 'borrador', 'p-2', '{}', 'x', 'x')");
    expect(() => run(db, "INSERT INTO contents (id, type, title, status, author_id, payload, created_at, updated_at) VALUES ('x-1', 'noticia', 'X', 'en-revision', 'p-2', '{}', 'x', 'x')")).toThrow(/CHECK/);
    run(db, "DELETE FROM users WHERE id = 'p-2'");
    expect(all<{ id: string; author_id: string | null }>(db, "SELECT id, author_id FROM contents WHERE id IN ('c-1', 'n-1') ORDER BY id")).toEqual([
      { id: 'c-1', author_id: null },
      { id: 'n-1', author_id: null },
    ]);
    expect(get(db, "SELECT author_id FROM content_revisions WHERE id = 'r-1'")).toMatchObject({ author_id: null });
    expect(get(db, "SELECT user_id FROM quiz_attempts WHERE id = 'a-1'")).toMatchObject({ user_id: null });
    expect(get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM read_confirmations')!.n).toBe(0);
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('tras migrar, users no guarda cumpleaños ni fecha de incorporación y no existe la tabla de asignaciones', () => {
    const db = openDatabase(':memory:');
    migrate(db);
    const columns = columnsOf(db, 'users');
    expect(columns).toEqual(expect.arrayContaining(['id', 'email', 'name', 'position', 'department', 'office', 'role', 'photo_file_id', 'status']));
    expect(columns.filter((name) => PERSONAL_DATES.includes(name))).toEqual([]);
    expect(schemaObject(db, 'assignments')).toBeUndefined();
    expect(schemaObject(db, 'idx_assignments_unique')).toBeUndefined();
    db.close();
  });

  it('una base creada con la versión 1 pierde esas columnas, sus datos y las asignaciones al actualizarse', () => {
    const dir = mkdtempSync(join(tmpdir(), 'flm-migraciones-'));
    const first = listMigrations()[0]!;
    copyFileSync(first.file, join(dir, first.name));
    const db = openDatabase(':memory:');
    expect(migrate(db, dir)).toEqual({ applied: ['0001_esquema_inicial.sql'], current: 1 });
    run(
      db,
      `INSERT INTO users (id, email, name, position, department, office, role, start_date, birthday, show_birthday, created_at, updated_at)
       VALUES ('p-1', 'una@flmexperts.com', 'Una Persona', 'Asesora', 'Fiscal', 'Vic', 'empleado', '2020-01-01', '03-14', 1, 'x', 'x')`,
    );
    run(db, "INSERT INTO contents (id, type, title, status, author_id, payload, created_at, updated_at) VALUES ('f-1', 'formacion', 'Formación', 'publicado', 'p-1', '{}', 'x', 'x')");
    run(db, "INSERT INTO assignments (id, content_id, target_kind, person_id, due_date, assigned_at) VALUES ('a-1', 'f-1', 'persona', 'p-1', '2026-11-30', 'x')");
    run(db, "INSERT INTO audit_log (at, actor_id, action, entity, entity_id, detail) VALUES ('x', 'p-1', 'perfil.cumpleanos', 'persona', 'p-1', 'Mostrar cumpleaños en el calendario: sí')");
    run(db, "INSERT INTO audit_log (at, actor_id, action, entity, entity_id) VALUES ('x', NULL, 'persona.alta', 'persona', 'p-1')");

    expect(migrate(db).applied).toEqual(MIGRATIONS.slice(1));
    expect(columnsOf(db, 'users').filter((name) => PERSONAL_DATES.includes(name))).toEqual([]);
    expect(get<{ name: string; position: string }>(db, 'SELECT * FROM users')).toMatchObject({ id: 'p-1', name: 'Una Persona', position: 'Asesora' });
    expect(schemaObject(db, 'assignments')).toBeUndefined();
    expect(all<{ action: string }>(db, 'SELECT action FROM audit_log').map((a) => a.action)).toEqual(['persona.alta']);
    expect(all(db, 'PRAGMA foreign_key_check')).toEqual([]);
    expect(get<{ integrity_check: string }>(db, 'PRAGMA integrity_check')!.integrity_check).toBe('ok');
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it('crea una copia fechada con VACUUM INTO, comprueba su integridad y conserva las N más recientes', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'flm-copias-'));
    const dbPath = join(dir, 'campus.sqlite');
    const storage = join(dir, 'storage');
    mkdirSync(join(storage, 'files'), { recursive: true });
    writeFileSync(join(storage, 'files', 'a'.repeat(32)), 'contenido');
    const db = openDatabase(dbPath);
    migrate(db);
    await importSeed(db, fixtureSeed, { now: START });

    const first = createBackup(db, { dir: join(dir, 'copias'), now: START, storageDir: storage });
    expect(first.file).toMatch(/campus-20261028-110000\.sqlite$/);
    expect(first.integrity).toBe('ok');
    expect(existsSync(join(first.filesDir!, 'files', 'a'.repeat(32)))).toBe(true);
    const copy = new DatabaseSync(first.file, { readOnly: true });
    expect((copy.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n).toBe(5);
    copy.close();

    createBackup(db, { dir: join(dir, 'copias'), now: new Date(START.getTime() + DAY) });
    const third = createBackup(db, { dir: join(dir, 'copias'), now: new Date(START.getTime() + 2 * DAY), keep: 2 });
    expect(third.removed).toEqual(['campus-20261028-110000.sqlite']);
    expect(readdirSync(join(dir, 'copias')).filter((f) => f.endsWith('.sqlite'))).toHaveLength(2);
    expect(existsSync(first.filesDir!)).toBe(false);
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('configuración', () => {
  it('exige en producción APP_ORIGIN https, DATABASE_PATH y STORAGE_DIR, sin secretos por defecto', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' }, tmpdir())).toThrow(ConfigError);
    let problems: string[] = [];
    try {
      loadConfig({ NODE_ENV: 'production', APP_ORIGIN: 'http://campus.flmexperts.com' }, tmpdir());
    } catch (err) {
      problems = (err as ConfigError).problems;
    }
    expect(problems).toEqual(
      expect.arrayContaining(['En producción APP_ORIGIN debe usar https://.', 'DATABASE_PATH es obligatorio en producción.', 'STORAGE_DIR es obligatorio en producción.']),
    );
    const config = loadConfig(
      { NODE_ENV: 'production', APP_ORIGIN: 'https://campus.flmexperts.com/', DATABASE_PATH: '/srv/campus.sqlite', STORAGE_DIR: '/srv/archivos', TRUST_PROXY: 'true', SMTP_HOST: 'smtp.example.com', SMTP_USER: 'campus', SMTP_PASS: 'x' },
      tmpdir(),
    );
    expect(config).toMatchObject({ appOrigin: 'https://campus.flmexperts.com', secureCookies: true, trustProxy: 1, host: '0.0.0.0', smtp: { port: 587, secure: false } });
    expect(() => loadConfig({ TRUST_PROXY: 'quizá' }, tmpdir())).toThrow(/TRUST_PROXY/);
    expect(loadConfig({}, tmpdir())).toMatchObject({ env: 'development', secureCookies: false, serveWebDist: null, smtp: null });
  });
});

describe('datos semilla', () => {
  it('importa el fixture, omite las personas ficticias y es idempotente', async () => {
    const db = openDatabase(':memory:');
    migrate(db);
    const first = await importSeed(db, fixtureSeed, { now: START });
    expect(first.created).toEqual({ personas: 5, formacion: 1, test: 1, noticia: 1, documento: 1, evento: 3, comunicado: 1, cliente: 1, bienvenida: 1, festivos: 2, lecturas: 1 });
    expect(first.skipped).toMatchObject({ 'personas ficticias': 1, 'clientes ficticios': 1, 'bienvenidas sin persona': 1 });
    // La bienvenida no copia el nombre de la persona en la tabla.
    expect(get(db, 'SELECT title FROM contents WHERE id = ?', IDS.bienvenida)).toMatchObject({ title: 'Bienvenida al equipo' });
    // `kind` solo lo gestiona el servidor en eventos y comunicados: noticias y documentos conservan su clase.
    const payloadOf = (id: string) => JSON.parse(get<{ payload: string }>(db, 'SELECT payload FROM contents WHERE id = ?', id)!.payload) as Record<string, unknown>;
    expect(payloadOf(IDS.news)).toMatchObject({ kind: 'legislacion' });
    expect(payloadOf(IDS.document)).toMatchObject({ kind: 'nota-informativa' });
    expect(payloadOf(IDS.encuentro)).not.toHaveProperty('kind');
    expect(get(db, 'SELECT 1 AS x FROM users WHERE id = ?', IDS.ficticia)).toBeUndefined();
    expect(get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM users WHERE password_hash IS NOT NULL')!.n).toBe(0);

    const second = await importSeed(db, fixtureSeed, { now: START });
    expect(second.created).toEqual({});
    expect(second.skipped).toMatchObject({ personas: 5, formacion: 1, festivos: 2 });

    const withFictional = await importSeed(db, fixtureSeed, { now: START, includeFictional: true });
    expect(withFictional.created).toMatchObject({ personas: 1, cliente: 1, bienvenida: 1 });
    db.close();
  });

  it('al volver a sembrar repone la clase de noticias y documentos que una carga anterior no guardó, sin pisar nada más', async () => {
    const db = openDatabase(':memory:');
    migrate(db);
    await importSeed(db, fixtureSeed, { now: START });
    // Como quedaban con la carga anterior: sin `kind` (y un cambio hecho en la plataforma, que se respeta).
    run(db, "UPDATE contents SET payload = json_set(json_remove(payload, '$.kind'), '$.headline', 'Titular cambiado') WHERE id = ?", IDS.news);
    run(db, "UPDATE contents SET payload = json_remove(payload, '$.kind') WHERE id = ?", IDS.document);
    const report = await importSeed(db, fixtureSeed, { now: START });
    const payloadOf = (id: string) => JSON.parse(get<{ payload: string }>(db, 'SELECT payload FROM contents WHERE id = ?', id)!.payload) as Record<string, unknown>;
    expect(payloadOf(IDS.news)).toMatchObject({ kind: 'legislacion', headline: 'Titular cambiado' });
    expect(payloadOf(IDS.document)).toMatchObject({ kind: 'nota-informativa' });
    expect(report.created).toEqual({ 'clases repuestas': 2 });
    expect(report.warnings.join(' ')).toContain(`Noticia ${IDS.news}: se repone su clase («legislacion»)`);
    // Ya repuesta, otra carga no cambia nada.
    expect((await importSeed(db, fixtureSeed, { now: START })).created).toEqual({});
    db.close();
  });

  it('el contenido de una persona que no está en la plataforma se importa sin autoría, nunca atribuido a otra', async () => {
    const db = openDatabase(':memory:');
    migrate(db);
    const orphan = { ...fixtureSeed, formations: fixtureSeed.formations.map((f) => ({ ...f, editorial: { ...f.editorial, authorId: 'p-se-fue' } })) };
    const report = await importSeed(db, orphan, { now: START });
    expect(get(db, 'SELECT author_id FROM contents WHERE id = ?', IDS.formation)).toMatchObject({ author_id: null });
    expect(report.warnings.join(' ')).toContain('«p-se-fue» no existe en la plataforma: 1 contenido se importa sin autoría');
    db.close();
  });

  it('valida con los esquemas compartidos antes de escribir nada', async () => {
    const db = openDatabase(':memory:');
    migrate(db);
    const broken = { ...fixtureSeed, people: [{ ...fixtureSeed.people[0]!, email: 'externa@gmail.com' }] };
    await expect(importSeed(db, broken, { now: START })).rejects.toBeInstanceOf(SeedValidationError);
    await expect(importSeed(db, broken, { now: START })).rejects.toThrow(/Correo corporativo @flmexperts.com obligatorio/);
    expect(get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM users')!.n).toBe(0);

    // Una evaluación por área y una dirección de la agenda por evento o comunicado.
    const twice = { ...fixtureSeed, assessments: [...fixtureSeed.assessments, { ...fixtureSeed.assessments[0]!, id: 'eval-fiscal-2' }] };
    await expect(importSeed(db, twice, { now: START })).rejects.toThrow(/evaluación eval-fiscal-2 · area/);
    const sameSlug = { ...fixtureSeed, events: [...fixtureSeed.events, { ...fixtureSeed.events[0]!, id: 'com-otono', kind: 'comunicado' as const }] };
    await expect(importSeed(db, sameSlug, { now: START })).rejects.toThrow(/evento com-otono · slug/);
    expect(get<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM contents')!.n).toBe(0);
    db.close();
  });

  it('si una persona de la semilla ya tiene cuenta (p. ej. de create-admin), lo suyo se atribuye a esa cuenta por su correo', async () => {
    const db = openDatabase(':memory:');
    migrate(db);
    const account = createUser(db, { email: EMAILS.autor, name: 'Jordi Autor Vidal', position: 'Dirección', department: 'Dirección', office: 'Barcelona', role: 'admin' }, START.toISOString());
    expect(account.id).not.toBe(IDS.autor);
    // Versiones subidas por esa persona, por una persona de la semilla que no se importa y por un texto libre.
    const [first] = fixtureSeed.documents[0]!.versions;
    const seed = {
      ...fixtureSeed,
      documents: fixtureSeed.documents.map((d) => ({
        ...d,
        versions: [
          { ...first!, uploadedBy: IDS.autor },
          { ...first!, version: 2, uploadedBy: IDS.ficticia },
          { ...first!, version: 3, uploadedBy: 'Administración' },
        ],
      })),
    };
    const report = await importSeed(db, seed, { now: START });

    expect(get(db, 'SELECT 1 AS x FROM users WHERE id = ?', IDS.autor)).toBeUndefined();
    expect(get(db, 'SELECT author_id FROM contents WHERE id = ?', IDS.formation)).toMatchObject({ author_id: account.id });
    expect(report.warnings.join(' ')).not.toContain(IDS.autor);
    expect(documentVersions(db, IDS.document).map((v) => v.uploadedBy)).toEqual(['Jordi Autor Vidal', 'FLM', 'Administración']);
    // Nunca el identificador de una persona como nombre de quien subió el archivo.
    expect(all(db, 'SELECT uploaded_by, uploaded_by_name FROM document_versions ORDER BY version')).toEqual([
      { uploaded_by: account.id, uploaded_by_name: null },
      { uploaded_by: null, uploaded_by_name: null },
      { uploaded_by: null, uploaded_by_name: 'Administración' },
    ]);
    db.close();
  });

  it('no importa lo que choque con la plataforma: otra evaluación vigente del área o una dirección de la agenda ocupada', async () => {
    const db = openDatabase(':memory:');
    migrate(db);
    await importSeed(db, { ...fixtureSeed, assessments: [], events: [] }, { now: START });
    // En la plataforma ya hay una evaluación de Fiscal y un comunicado con la dirección del encuentro de otoño.
    const admin = { id: IDS.admin, email: EMAILS.admin, name: 'Ana Admin Puig', role: 'admin' as const };
    createContent(db, admin, 'test', assessmentPayload(), START);
    createContent(db, admin, 'comunicado', { slug: 'encuentro-otono', title: 'Aviso' }, START);

    const report = await importSeed(db, fixtureSeed, { now: START });
    expect(get(db, 'SELECT 1 AS x FROM contents WHERE id = ?', IDS.assessment)).toBeUndefined();
    expect(get(db, 'SELECT 1 AS x FROM contents WHERE id = ?', IDS.encuentro)).toBeUndefined();
    expect(report.created).toMatchObject({ evento: 2, comunicado: 1 });
    expect(report.warnings.join(' ')).toContain(`Evaluación ${IDS.assessment}: el área ya tiene una evaluación vigente`);
    expect(report.warnings.join(' ')).toContain(`Evento ${IDS.encuentro}: otro evento o comunicado ya usa la dirección «encuentro-otono»`);
    db.close();
  });
});

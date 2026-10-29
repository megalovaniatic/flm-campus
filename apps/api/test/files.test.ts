import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { get } from '../src/db/database';
import { contentDisposition, detectFileType, sanitizeFilename } from '../src/services/files';
import { EMAILS, IDS } from './fixtures/seed';
import { createTestEnv, fileForm, GIF_BYTES, JPEG_BYTES, json, loginAs, PNG_BYTES, pdfBytes, TestClient, type TestEnv, WEBP_BYTES } from './helpers';

const documentData = (title = 'Nota sobre el SII') =>
  JSON.stringify({ title, area: 'fiscal', issuer: 'FLM', date: '2026-10-20', summary: 'Resumen de la nota.', kind: 'nota-informativa', tags: ['sii'], publicDemo: false });

describe('detección del tipo por cabecera mágica', () => {
  it('reconoce PDF, JPEG, PNG y WebP y rechaza el resto', () => {
    expect(detectFileType(pdfBytes(16))?.mime).toBe('application/pdf');
    expect(detectFileType(JPEG_BYTES)?.mime).toBe('image/jpeg');
    expect(detectFileType(PNG_BYTES)?.mime).toBe('image/png');
    expect(detectFileType(WEBP_BYTES)?.mime).toBe('image/webp');
    expect(detectFileType(GIF_BYTES)).toBeNull();
    expect(detectFileType(new TextEncoder().encode('<html>%PDF-'))).toBeNull();
  });

  it('sanea nombres y genera Content-Disposition con nombre UTF-8', () => {
    expect(sanitizeFilename('..\\..\\etc/pass"wd<>.exe', 'pdf')).toBe('passwd.pdf');
    expect(sanitizeFilename('Nota informativa año 2026.PDF', 'pdf')).toBe('Nota informativa año 2026.pdf');
    expect(contentDisposition('attachment', 'Nota año.pdf')).toBe(`attachment; filename="Nota ano.pdf"; filename*=UTF-8''Nota%20a%C3%B1o.pdf`);
  });
});

describe('biblioteca y archivos', () => {
  let env: TestEnv;
  beforeEach(async () => {
    env = await createTestEnv();
  });
  afterEach(() => env.close());

  it('sube un PDF como borrador con nombre aleatorio fuera de rutas públicas', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const res = await author.upload('POST', '/api/documents', fileForm(pdfBytes(), 'Nota SII.pdf', 'application/pdf', { datos: documentData() }));
    expect(res.status).toBe(201);
    const content = (await json(res)).content;
    expect(content).toMatchObject({ type: 'documento', status: 'borrador' });
    expect(content.item.versions).toHaveLength(1);
    expect(content.item.versions[0]).toMatchObject({ version: 1, uploadedBy: 'Jordi Autor Vidal', available: true });

    const stored = readdirSync(join(env.storageDir, 'files'));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatch(/^[0-9a-f]{32}$/);
    const row = get<{ original_name: string; mime_type: string }>(env.db, 'SELECT original_name, mime_type FROM files')!;
    expect(row).toEqual({ original_name: 'Nota SII.pdf', mime_type: 'application/pdf' });
  });

  it('rechaza tipos no admitidos y tamaños excesivos con mensajes claros', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const fake = await author.upload('POST', '/api/documents', fileForm(new TextEncoder().encode('<html>no soy un PDF</html>'), 'falso.pdf', 'application/pdf', { datos: documentData() }));
    expect(fake.status).toBe(415);
    expect((await json(fake)).error.message).toBe('Tipo de archivo no admitido. Solo se aceptan documentos PDF e imágenes JPEG, PNG o WebP.');

    const image = await author.upload('POST', '/api/documents', fileForm(PNG_BYTES, 'foto.png', 'image/png', { datos: documentData() }));
    expect(image.status).toBe(415);
    expect((await json(image)).error.message).toBe('En este apartado solo se admiten documentos PDF.');

    const gif = await author.upload('POST', '/api/files', fileForm(GIF_BYTES, 'animacion.gif', 'image/gif'));
    expect(gif.status).toBe(415);

    const bigPdf = await author.upload('POST', '/api/documents', fileForm(pdfBytes(15 * 1024 * 1024 + 1), 'enorme.pdf', 'application/pdf', { datos: documentData() }));
    expect(bigPdf.status).toBe(413);
    expect((await json(bigPdf)).error.message).toContain('15 MB');

    const bigImage = new Uint8Array(5 * 1024 * 1024 + 1);
    bigImage.set(PNG_BYTES, 0);
    const big = await author.upload('POST', '/api/files', fileForm(bigImage, 'grande.png', 'image/png'));
    expect(big.status).toBe(413);
    expect((await json(big)).error.message).toBe('La imagen supera el tamaño máximo de 5 MB.');

    const noFile = await author.upload('POST', '/api/files', new FormData());
    expect(noFile.status).toBe(400);
    expect(readdirSync(join(env.storageDir, 'files'))).toHaveLength(0);
  });

  it('valida los datos del documento y no deja archivos huérfanos', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const res = await author.upload('POST', '/api/documents', fileForm(pdfBytes(), 'nota.pdf', 'application/pdf', { datos: JSON.stringify({ title: 'Nota', area: 'marte' }) }));
    expect(res.status).toBe(400);
    expect(readdirSync(join(env.storageDir, 'files'))).toHaveLength(0);

    // El borrador puede quedar a medias (el PDF y el título); publicarlo exige el resto de los datos.
    const partial = await author.upload('POST', '/api/documents', fileForm(pdfBytes(), 'nota.pdf', 'application/pdf', { datos: JSON.stringify({ title: 'Solo el título' }) }));
    expect(partial.status).toBe(201);
    const draft = (await json(partial)).content;
    const publish = await author.post(`/api/contents/${draft.id}/transitions`, { action: 'publicar', revision: draft.revision });
    expect(publish.status).toBe(400);
    expect((await json(publish)).error.details.map((d: { path: string }) => d.path)).toEqual(expect.arrayContaining(['area', 'issuer', 'date']));
  });

  it('descarga solo con sesión y permisos, con Content-Disposition y nosniff', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const employee = await loginAs(env, EMAILS.empleado);
    const admin = await loginAs(env, EMAILS.admin);
    const content = (await json(await author.upload('POST', '/api/documents', fileForm(pdfBytes(4096), 'Guía año.pdf', 'application/pdf', { datos: documentData() })))).content;
    const url = content.item.versions[0].file as string;

    expect((await new TestClient(env.app).get(url)).status).toBe(401);
    expect((await employee.get(url)).status).toBe(403);
    const own = await author.get(url);
    expect(own.status).toBe(200);
    expect(own.headers.get('content-type')).toBe('application/pdf');
    expect(own.headers.get('content-disposition')).toBe(`attachment; filename="Guia ano.pdf"; filename*=UTF-8''Gu%C3%ADa%20a%C3%B1o.pdf`);
    expect(own.headers.get('x-content-type-options')).toBe('nosniff');
    expect(own.headers.get('content-security-policy')).toBe("default-src 'none'; sandbox");
    expect(own.headers.get('cache-control')).toBe('private, no-store');
    expect(new Uint8Array(await own.arrayBuffer())).toEqual(pdfBytes(4096));

    const published = (await json(await admin.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: content.revision }))).content;
    expect((await employee.get(url)).status).toBe(200);
    expect((await json(await employee.get('/api/documents?area=fiscal'))).items.map((d: { id: string }) => d.id)).toContain(content.id);

    const archived = (await json(await admin.post(`/api/contents/${content.id}/transitions`, { action: 'archivar', revision: published.revision }))).content;
    expect(archived.status).toBe('archivado');
    expect((await employee.get(url)).status).toBe(403);
    expect((await admin.get(url)).status).toBe(200);
    await admin.post(`/api/contents/${content.id}/transitions`, { action: 'restaurar', revision: archived.revision });
    expect((await employee.get(url)).status).toBe(200);
  });

  it('la autoría sustituye al momento el PDF de su borrador nunca publicado; el de un documento publicado, solo administración', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const other = await loginAs(env, EMAILS.autora2);
    const admin = await loginAs(env, EMAILS.admin);
    const content = (await json(await author.upload('POST', '/api/documents', fileForm(pdfBytes(1000), 'v1.pdf', 'application/pdf', { datos: documentData() })))).content;
    expect((await other.upload('POST', `/api/documents/${content.id}/versions`, fileForm(pdfBytes(2000), 'v2.pdf', 'application/pdf'))).status).toBe(403);

    const res = await author.upload('POST', `/api/documents/${content.id}/versions`, fileForm(pdfBytes(3000), 'v2.pdf', 'application/pdf', { nota: 'Corrige la tabla de plazos' }));
    expect(res.status).toBe(201);
    const draft = (await json(res)).content;
    const versions = draft.item.versions;
    expect(versions).toHaveLength(2);
    expect(versions[1]).toMatchObject({ version: 2, note: 'Corrige la tabla de plazos', uploadedBy: 'Jordi Autor Vidal' });
    expect(versions[1]).not.toHaveProperty('pending');
    expect(versions[0].file).not.toBe(versions[1].file);
    expect((await author.get(versions[0].file)).status).toBe(200);
    expect(new Uint8Array(await (await author.get(versions[1].file)).arrayBuffer())).toHaveLength(3000);
    expect(readdirSync(join(env.storageDir, 'files'))).toHaveLength(2);

    // Una vez publicado, el PDF ya no lo cambia la autoría: solo administración.
    expect((await admin.post(`/api/contents/${content.id}/transitions`, { action: 'publicar', revision: draft.revision })).status).toBe(200);
    const denied = await author.upload('POST', `/api/documents/${content.id}/versions`, fileForm(pdfBytes(4000), 'v3.pdf', 'application/pdf'));
    expect(denied.status).toBe(403);
    expect((await json(denied)).error.message).toBe('Solo administración puede sustituir el archivo de un documento publicado.');
    expect((await author.upload('POST', `/api/documents/${IDS.document}/versions`, fileForm(pdfBytes(4000), 'v2.pdf', 'application/pdf'))).status).toBe(403);
    expect(readdirSync(join(env.storageDir, 'files'))).toHaveLength(2);
  });

  it('en un documento publicado, el PDF nuevo espera en la revisión hasta publicarla (o se descarta con ella)', async () => {
    const admin = await loginAs(env, EMAILS.admin);
    const employee = await loginAs(env, EMAILS.empleado);
    const stored = () => readdirSync(join(env.storageDir, 'files'));
    const numbers = (versions: { version: number }[]) => versions.map((v) => v.version);
    const publicVersions = async () => numbers((await json(await employee.get(`/api/documents/${IDS.document}`))).document.versions);
    const upload = async (size: number) => {
      const res = await admin.upload('POST', `/api/documents/${IDS.document}/versions`, fileForm(pdfBytes(size), `nota-${size}.pdf`, 'application/pdf', { nota: 'Nueva edición' }));
      expect(res.status).toBe(201);
      return (await json(res)).content;
    };

    let content = await upload(3000);
    expect(numbers(content.item.versions)).toEqual([1]);
    expect(content.pendingRevision.item.versions[1]).toMatchObject({ version: 2, note: 'Nueva edición', uploadedBy: 'Ana Admin Puig', pending: true });
    const pendingFile = content.pendingRevision.item.versions[1].file as string;
    expect(await publicVersions()).toEqual([1]);
    expect((await employee.get(pendingFile)).status).toBe(403);
    expect((await admin.get(pendingFile)).status).toBe(200);

    // Otro PDF sustituye al que esperaba: sigue habiendo una sola versión pendiente.
    content = await upload(5000);
    expect(numbers(content.pendingRevision.item.versions)).toEqual([1, 2]);
    expect(stored()).toHaveLength(1);

    // Al publicar la revisión, pasa a ser la versión vigente para todo el campus.
    content = (await json(await admin.post(`/api/contents/${IDS.document}/transitions`, { action: 'publicar', revision: content.revision }))).content;
    expect(content.pendingRevision).toBeNull();
    expect(await publicVersions()).toEqual([1, 2]);
    expect(content.item.versions[1]).not.toHaveProperty('pending');
    expect(new Uint8Array(await (await employee.get(content.item.versions[1].file)).arrayBuffer())).toHaveLength(5000);

    // Si la revisión se descarta, el PDF que esperaba se descarta con ella.
    content = await upload(7000);
    expect(stored()).toHaveLength(2);
    expect((await admin.delete(`/api/contents/${IDS.document}/revision?revision=${content.revision}`)).status).toBe(200);
    expect(await publicVersions()).toEqual([1, 2]);
    expect(stored()).toHaveLength(1);
    expect(get(env.db, 'SELECT COUNT(*) AS n FROM document_versions WHERE content_id = ?', IDS.document)).toEqual({ n: 2 });
  });

  it('los documentos semilla sin archivo indican que no está disponible', async () => {
    const employee = await loginAs(env, EMAILS.empleado);
    const doc = (await json(await employee.get(`/api/documents/${IDS.document}`))).document;
    expect(doc.versions[0]).toMatchObject({ available: false, file: 'docs/no-existe.pdf' });
  });

  it('las imágenes de contenidos se suben y se sirven a cualquier sesión del campus', async () => {
    const author = await loginAs(env, EMAILS.autor);
    const employee = await loginAs(env, EMAILS.empleado);
    for (const [bytes, name, mime] of [
      [JPEG_BYTES, 'foto.jpg', 'image/jpeg'],
      [WEBP_BYTES, 'foto.webp', 'image/webp'],
    ] as const) {
      const res = await author.upload('POST', '/api/files', fileForm(bytes, name, 'application/octet-stream'));
      expect(res.status).toBe(201);
      const file = (await json(res)).file;
      expect(file.mimeType).toBe(mime);
      const served = await employee.get(file.url);
      expect(served.headers.get('content-type')).toBe(mime);
    }
    expect((await employee.upload('POST', '/api/files', fileForm(PNG_BYTES, 'x.png', 'image/png'))).status).toBe(403);
  });
});

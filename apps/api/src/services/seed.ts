import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  assessmentSchema,
  documentSchema,
  eventSchema,
  formationSchema,
  holidaySchema,
  newClientSchema,
  newsSchema,
  personSchema,
  readingSchema,
  welcomeSchema,
  type CampusEvent,
  type ContentType,
  type EditorialMeta,
  type LibraryDocument,
  type SeedData,
  type Welcome,
} from '@flm/shared';
import type { z } from 'zod';
import { newId } from '../auth/tokens';
import { all, get, run, transaction, type Db } from '../db/database';
import { formatIssues } from '../lib/validation';
import { audit } from './audit';
import { storedPayload, WELCOME_TITLE } from './content';
import { MAX_PDF_BYTES, registerFile, type FileStorage, type StoredFile } from './files';

/**
 * Carga de datos semilla (`SeedData` de @flm/content). Valida todo con los esquemas compartidos
 * antes de escribir nada, inserta solo lo que no existe (nunca sobrescribe cambios hechos en la
 * plataforma) y no crea contraseñas: las cuentas quedan pendientes de activación.
 */
export class SeedValidationError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Los datos semilla no son válidos (${problems.length} problemas):\n - ${problems.slice(0, 50).join('\n - ')}`);
    this.name = 'SeedValidationError';
  }
}

export interface SeedOptions {
  now: Date;
  /** Almacenamiento para importar los PDF de la biblioteca (si se encuentran en `filesDirs`). */
  storage?: FileStorage;
  /** Carpetas donde buscar los archivos de `documents[].versions[].file`. */
  filesDirs?: string[];
  /**
   * Importar también las personas y los clientes ficticios de la demostración (`fictional: true`).
   * Por defecto no se importan: en producción solo deben existir cuentas y clientes reales.
   */
  includeFictional?: boolean;
}

export interface SeedReport {
  created: Record<string, number>;
  skipped: Record<string, number>;
  warnings: string[];
}

type Validated = { kind: string; id: string; schema: z.ZodType; value: unknown };

function validateAll(seed: SeedData): string[] {
  const items: Validated[] = [
    ...seed.people.map((v) => ({ kind: 'persona', id: v.id, schema: personSchema, value: v })),
    ...seed.formations.map((v) => ({ kind: 'formación', id: v.id, schema: formationSchema, value: v })),
    ...seed.assessments.map((v) => ({ kind: 'evaluación', id: v.id, schema: assessmentSchema, value: v })),
    ...seed.news.map((v) => ({ kind: 'noticia', id: v.id, schema: newsSchema, value: v })),
    ...seed.documents.map((v) => ({ kind: 'documento', id: v.id, schema: documentSchema, value: v })),
    ...seed.readings.map((v) => ({ kind: 'lectura', id: v.id, schema: readingSchema, value: v })),
    ...seed.events.map((v) => ({ kind: 'evento', id: v.id, schema: eventSchema, value: v })),
    ...seed.holidays.map((v) => ({ kind: 'festivo', id: v.date, schema: holidaySchema, value: v })),
    ...seed.clients.map((v) => ({ kind: 'cliente', id: v.id, schema: newClientSchema, value: v })),
    ...seed.welcomes.map((v) => ({ kind: 'bienvenida', id: v.id, schema: welcomeSchema, value: v })),
  ];
  const problems: string[] = [];
  for (const item of items) {
    const result = item.schema.safeParse(item.value);
    if (!result.success) for (const issue of formatIssues(result.error)) problems.push(`${item.kind} ${item.id} · ${issue.path}: ${issue.message}`);
  }
  const emails = new Set<string>();
  for (const p of seed.people) {
    if (emails.has(p.email)) problems.push(`persona ${p.id} · email: correo duplicado`);
    emails.add(p.email);
  }
  // Una evaluación del área por área, y eventos y comunicados con slugs distintos (comparten la dirección de la agenda).
  const areas = new Set<string>();
  for (const a of seed.assessments) {
    if (areas.has(a.area)) problems.push(`evaluación ${a.id} · area: el área ya tiene otra evaluación`);
    areas.add(a.area);
  }
  const agenda = new Set<string>();
  for (const e of seed.events) {
    if (agenda.has(e.slug)) problems.push(`evento ${e.id} · slug: otro evento o comunicado ya usa la dirección «${e.slug}»`);
    agenda.add(e.slug);
  }
  return problems;
}

export async function importSeed(db: Db, seed: SeedData, opts: SeedOptions): Promise<SeedReport> {
  const problems = validateAll(seed);
  if (problems.length) throw new SeedValidationError(problems);

  const report: SeedReport = { created: {}, skipped: {}, warnings: [] };
  const count = (bucket: 'created' | 'skipped', kind: string) => {
    report[bucket][kind] = (report[bucket][kind] ?? 0) + 1;
  };
  const nowIso = opts.now.toISOString();
  const exists = (table: string, id: string) => !!get(db, `SELECT 1 AS x FROM ${table} WHERE id = ?`, id);

  // 1. Archivos de la biblioteca (asíncrono, antes de la transacción).
  const storedFiles = new Map<string, StoredFile>();
  if (opts.storage) {
    for (const doc of seed.documents) {
      if (exists('contents', doc.id)) continue;
      for (const v of doc.versions) {
        const path = (opts.filesDirs ?? []).map((dir) => join(dir, v.file.replace(/^\/+/, ''))).find((p) => existsSync(p) && statSync(p).isFile());
        if (!path) {
          report.warnings.push(`Documento ${doc.id} v${v.version}: no se encuentra el archivo «${v.file}»; la versión queda registrada sin archivo descargable.`);
          continue;
        }
        if (statSync(path).size > MAX_PDF_BYTES) {
          report.warnings.push(`Documento ${doc.id} v${v.version}: el archivo supera 15 MB y no se importa.`);
          continue;
        }
        try {
          storedFiles.set(`${doc.id}#${v.version}`, await opts.storage.storeBytes(new Uint8Array(readFileSync(path)), v.file, ['pdf']));
        } catch (err) {
          report.warnings.push(`Documento ${doc.id} v${v.version}: ${(err as Error).message}`);
        }
      }
    }
  }

  const people = seed.people.filter((p) => opts.includeFictional || !p.fictional);
  const fictional = seed.people.length - people.length;
  if (fictional) {
    report.warnings.push(`${fictional} personas ficticias de la demostración no se importan (usa --incluir-ficticias solo en entornos de prueba).`);
    report.skipped['personas ficticias'] = fictional;
  }

  try {
    transaction(db, () => {
      // 2. Personas (sin contraseña: deben activar la cuenta con un enlace). Si la persona ya tiene cuenta,
      //    por su identificador o por su correo (p. ej. la primera administradora, creada con create-admin
      //    y un identificador aleatorio), no se duplica: lo suyo de la semilla se atribuye a esa cuenta.
      //    El cumpleaños y la fecha de incorporación se importan tal como vienen en la semilla (solo las
      //    personas que los tienen); nunca se rellenan por defecto. A una cuenta que ya existía solo se le
      //    completan los que le falten: lo indicado en la plataforma no se pisa.
      const accountOf = new Map<string, string>();
      for (const p of people) {
        const existing =
          get<{ id: string; birthday: string | null; start_date: string | null }>(db, 'SELECT id, birthday, start_date FROM users WHERE id = ?', p.id) ??
          get<{ id: string; birthday: string | null; start_date: string | null }>(db, 'SELECT id, birthday, start_date FROM users WHERE email = ?', p.email);
        if (existing) {
          accountOf.set(p.id, existing.id);
          count('skipped', 'personas');
          const birthday = !existing.birthday && p.birthday ? p.birthday : null;
          const startDate = !existing.start_date && p.startDate ? p.startDate : null;
          if (birthday || startDate) {
            run(
              db,
              'UPDATE users SET birthday = COALESCE(birthday, ?), start_date = COALESCE(start_date, ?), updated_at = ? WHERE id = ?',
              birthday,
              startDate,
              nowIso,
              existing.id,
            );
            count('created', 'fechas del calendario completadas');
            report.warnings.push(`Persona ${p.id}: su cuenta ya existía; se completan con la semilla los datos del calendario que le faltaban.`);
          }
          continue;
        }
        if (p.photo) report.warnings.push(`Persona ${p.id}: la foto «${p.photo}» no se importa; puede subirse desde la administración.`);
        run(
          db,
          `INSERT INTO users (id, email, name, position, department, office, role, birthday, start_date, status, deactivated_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          p.id,
          p.email,
          p.name,
          p.position,
          p.department,
          p.office,
          p.role,
          p.birthday ?? null,
          p.startDate ?? null,
          p.status,
          p.status === 'inactiva' ? nowIso : null,
          nowIso,
          nowIso,
        );
        count('created', 'personas');
      }

      /** Cuenta de la plataforma de una persona de la semilla (la que ya tenía con su correo, si es el caso). */
      const accountFor = (personId: string) => accountOf.get(personId) ?? personId;
      const seedPeople = new Set(seed.people.map((p) => p.id));

      // Contenido de una persona que no está en la plataforma: se importa sin autoría (firma neutra),
      // nunca atribuido a otra persona.
      const unattributed = new Map<string, number>();
      const authorFor = (authorId: string | undefined): string | null => {
        if (!authorId) return null;
        if (exists('users', accountFor(authorId))) return accountFor(authorId);
        unattributed.set(authorId, (unattributed.get(authorId) ?? 0) + 1);
        return null;
      };

      const insertContent = (
        type: ContentType,
        item: { id: string },
        meta: { title: string; area: string | null; slug: string | null; version: number },
        editorial: EditorialMeta | undefined,
        extra: { status?: string; manualPhase?: string | null } = {},
      ): boolean => {
        if (exists('contents', item.id)) {
          count('skipped', type);
          return false;
        }
        const status = extra.status ?? editorial?.status ?? 'publicado';
        const published = status === 'publicado' || status === 'archivado';
        run(
          db,
          `INSERT INTO contents (id, type, slug, title, area, status, author_id, payload, revision, version, review, manual_phase, published_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
          item.id,
          type,
          meta.slug,
          meta.title,
          meta.area,
          status,
          authorFor(editorial?.authorId),
          storedPayload(type, item),
          meta.version,
          JSON.stringify(editorial?.review ?? { state: published ? 'revisado' : 'pendiente' }),
          extra.manualPhase ?? null,
          editorial?.publishedAt ?? (published ? nowIso : null),
          editorial?.publishedAt ?? nowIso,
          editorial?.updatedAt ?? nowIso,
        );
        count('created', type);
        return true;
      };

      // Una base sembrada con una versión anterior de la carga guardó noticias y documentos sin su clase
      // (`kind`): al volver a sembrar se repone desde la semilla, solo si falta (nunca se pisa nada).
      const restoreKind = (type: 'noticia' | 'documento', item: { id: string; kind: string }) => {
        const fixed = run(db, "UPDATE contents SET payload = json_set(payload, '$.kind', ?) WHERE id = ? AND type = ? AND json_type(payload, '$.kind') IS NULL", item.kind, item.id, type);
        if (!fixed) return;
        count('created', 'clases repuestas');
        report.warnings.push(`${type === 'noticia' ? 'Noticia' : 'Documento'} ${item.id}: se repone su clase («${item.kind}»), que una versión anterior de la carga no guardó.`);
      };

      // 3. Contenidos. Las reglas de la plataforma también valen aquí: una evaluación vigente por área y
      //    un solo espacio de slugs para la agenda (lo que choque con lo ya creado no se importa y se avisa).
      for (const f of seed.formations) insertContent('formacion', f, { title: f.title, area: f.area, slug: f.slug, version: f.version }, f.editorial);
      for (const a of seed.assessments) {
        if (!exists('contents', a.id) && get(db, "SELECT 1 AS x FROM contents WHERE type = 'test' AND area = ? AND status <> 'archivado'", a.area)) {
          count('skipped', 'evaluaciones de un área que ya tiene una');
          report.warnings.push(`Evaluación ${a.id}: el área ya tiene una evaluación vigente en la plataforma; no se importa.`);
          continue;
        }
        insertContent('test', a, { title: a.title, area: a.area, slug: null, version: 1 }, undefined, { status: 'publicado' });
      }
      for (const n of seed.news) {
        if (!insertContent('noticia', n, { title: n.headline, area: n.area, slug: n.slug, version: 1 }, n.editorial)) restoreKind('noticia', n);
      }
      for (const e of seed.events as CampusEvent[]) {
        if (!exists('contents', e.id) && get(db, "SELECT 1 AS x FROM contents WHERE type IN ('evento', 'comunicado') AND slug = ?", e.slug)) {
          count('skipped', 'eventos con la dirección ocupada');
          report.warnings.push(`Evento ${e.id}: otro evento o comunicado ya usa la dirección «${e.slug}»; no se importa.`);
          continue;
        }
        insertContent(e.kind, e, { title: e.title, area: null, slug: e.slug, version: 1 }, e.editorial, {
          status: e.archived ? 'archivado' : e.editorial.status,
          manualPhase: e.manualPhase ?? null,
        });
      }
      for (const d of seed.documents as LibraryDocument[]) {
        const created = insertContent('documento', d, { title: d.title, area: d.area, slug: null, version: 1 }, d.editorial);
        if (!created) {
          restoreKind('documento', d);
          continue;
        }
        for (const v of d.versions) {
          const stored = storedFiles.get(`${d.id}#${v.version}`);
          if (stored) registerFile(db, stored, 'documento', null, nowIso);
          // `uploadedBy` es una persona de la semilla (su cuenta, si está en la plataforma) o un texto
          // libre («Administración»). El identificador de una persona nunca se guarda como nombre: sin
          // cuenta, la versión lleva la firma neutra.
          const uploader = exists('users', accountFor(v.uploadedBy)) ? accountFor(v.uploadedBy) : null;
          run(
            db,
            `INSERT INTO document_versions (content_id, version, file_id, original_file, size_kb, pages, note, uploaded_at, uploaded_by, uploaded_by_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            d.id,
            v.version,
            stored?.id ?? null,
            v.file,
            stored ? Math.max(1, Math.round(stored.size / 1024)) : v.sizeKb,
            v.pages ?? null,
            v.note ?? null,
            v.uploadedAt,
            uploader,
            uploader || seedPeople.has(v.uploadedBy) ? null : v.uploadedBy,
          );
        }
      }

      // 4. «Ponte al día»: nuevos clientes (los ficticios de la demo, solo con --incluir-ficticias) y
      //    bienvenidas (solo a personas activas que ya estén en la plataforma, una por persona).
      for (const client of seed.clients) {
        if (client.fictional && !opts.includeFictional) {
          count('skipped', 'clientes ficticios');
          continue;
        }
        insertContent('cliente', client, { title: client.name, area: client.area, slug: null, version: 1 }, client.editorial);
      }
      for (const welcome of seed.welcomes) {
        const personId = accountFor(welcome.personId);
        const person = get<{ id: string }>(db, "SELECT id FROM users WHERE id = ? AND status = 'activa' AND anonymized_at IS NULL", personId);
        const taken = get(db, "SELECT 1 AS x FROM contents WHERE type = 'bienvenida' AND id <> ? AND json_extract(payload, '$.personId') = ?", welcome.id, personId);
        if (!person || taken) {
          count('skipped', 'bienvenidas sin persona');
          continue;
        }
        const forAccount: Welcome = { ...welcome, personId };
        insertContent('bienvenida', forAccount, { title: WELCOME_TITLE, area: null, slug: null, version: 1 }, welcome.editorial);
      }

      // 5. Festivos y lecturas.
      for (const h of seed.holidays) {
        const changed = run(
          db,
          'INSERT OR IGNORE INTO holidays (id, date, name, scope, offices, source) VALUES (?, ?, ?, ?, ?, ?)',
          newId(),
          h.date,
          h.name,
          h.scope,
          JSON.stringify(h.offices),
          h.source,
        );
        count(changed ? 'created' : 'skipped', 'festivos');
      }
      for (const r of seed.readings) {
        const changed = run(db, 'INSERT OR IGNORE INTO readings (id, area, payload, updated_at) VALUES (?, ?, ?, ?)', r.id, r.area, JSON.stringify(r), nowIso);
        count(changed ? 'created' : 'skipped', 'lecturas');
      }

      for (const [authorId, n] of unattributed) {
        report.warnings.push(`La persona autora «${authorId}» no existe en la plataforma: ${n} ${n === 1 ? 'contenido se importa' : 'contenidos se importan'} sin autoría (firma neutra).`);
      }
      audit(db, { actorId: null, action: 'semilla.importar', entity: 'sistema', detail: JSON.stringify(report.created) }, opts.now);
    });
  } catch (err) {
    // Si la transacción falla, no deben quedar archivos huérfanos.
    for (const f of storedFiles.values()) await opts.storage?.remove(f.storageName);
    throw err;
  }

  // Archivos importados para documentos que al final no se crearon.
  const used = new Set(all<{ id: string }>(db, 'SELECT id FROM files').map((f) => f.id));
  for (const f of storedFiles.values()) if (!used.has(f.id)) await opts.storage?.remove(f.storageName);

  return report;
}

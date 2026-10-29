import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  assessmentSchema,
  documentSchema,
  eventSchema,
  formationSchema,
  holidaySchema,
  newsSchema,
  personSchema,
  readingSchema,
  type CampusEvent,
  type ContentType,
  type EditorialMeta,
  type LibraryDocument,
  type SeedData,
} from '@flm/shared';
import type { z } from 'zod';
import { newId } from '../auth/tokens';
import { all, get, run, transaction, type Db } from '../db/database';
import { formatIssues } from '../lib/validation';
import { audit } from './audit';
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
   * Importar también las personas ficticias de la demostración (`fictional: true`).
   * Por defecto no se importan: en producción solo deben existir cuentas reales.
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
  return problems;
}

const SERVER_FIELDS = ['id', 'editorial', 'versions', 'kind', 'archived', 'manualPhase'];

function storedPayload(item: object): string {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item)) if (!SERVER_FIELDS.includes(k)) out[k] = v;
  return JSON.stringify(out);
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
      // 2. Personas (sin contraseña: deben activar la cuenta con un enlace).
      for (const p of people) {
        if (exists('users', p.id) || get(db, 'SELECT 1 AS x FROM users WHERE email = ?', p.email)) {
          count('skipped', 'personas');
          continue;
        }
        if (p.photo) report.warnings.push(`Persona ${p.id}: la foto «${p.photo}» no se importa; puede subirse desde la administración.`);
        run(
          db,
          `INSERT INTO users (id, email, name, position, department, office, role, status, deactivated_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          p.id,
          p.email,
          p.name,
          p.position,
          p.department,
          p.office,
          p.role,
          p.status,
          p.status === 'inactiva' ? nowIso : null,
          nowIso,
          nowIso,
        );
        count('created', 'personas');
      }

      const fallbackAuthor =
        people.find((p) => p.role === 'admin' && p.status === 'activa')?.id ??
        get<{ id: string }>(db, "SELECT id FROM users WHERE role = 'admin' AND anonymized_at IS NULL ORDER BY created_at LIMIT 1")?.id;
      const reassigned = new Map<string, number>();
      const authorFor = (authorId: string | undefined, what: string): string => {
        if (authorId && exists('users', authorId)) return authorId;
        if (!fallbackAuthor) {
          throw new SeedValidationError([`${what}: no hay ninguna persona administradora a la que atribuir el contenido. Crea antes una con «npm run create-admin».`]);
        }
        if (authorId) reassigned.set(authorId, (reassigned.get(authorId) ?? 0) + 1);
        return fallbackAuthor;
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
          `INSERT INTO contents (id, type, slug, title, area, status, author_id, payload, revision, version, review, return_comment, manual_phase, published_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
          item.id,
          type,
          meta.slug,
          meta.title,
          meta.area,
          status,
          authorFor(editorial?.authorId, `${type} ${item.id}`),
          storedPayload(item),
          meta.version,
          JSON.stringify(editorial?.review ?? { state: published ? 'revisado' : 'pendiente' }),
          editorial?.returnComment ?? null,
          extra.manualPhase ?? null,
          editorial?.publishedAt ?? (published ? nowIso : null),
          editorial?.publishedAt ?? nowIso,
          editorial?.updatedAt ?? nowIso,
        );
        count('created', type);
        return true;
      };

      // 3. Contenidos.
      for (const f of seed.formations) insertContent('formacion', f, { title: f.title, area: f.area, slug: f.slug, version: f.version }, f.editorial);
      for (const a of seed.assessments) insertContent('test', a, { title: a.title, area: a.area, slug: null, version: 1 }, undefined, { status: 'publicado' });
      for (const n of seed.news) insertContent('noticia', n, { title: n.headline, area: n.area, slug: n.slug, version: 1 }, n.editorial);
      for (const e of seed.events as CampusEvent[]) {
        insertContent(e.kind, e, { title: e.title, area: null, slug: e.slug, version: 1 }, e.editorial, {
          status: e.archived ? 'archivado' : e.editorial.status,
          manualPhase: e.manualPhase ?? null,
        });
      }
      for (const d of seed.documents as LibraryDocument[]) {
        const created = insertContent('documento', d, { title: d.title, area: d.area, slug: null, version: 1 }, d.editorial);
        if (!created) continue;
        for (const v of d.versions) {
          const stored = storedFiles.get(`${d.id}#${v.version}`);
          if (stored) registerFile(db, stored, 'documento', null, nowIso);
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
            exists('users', v.uploadedBy) ? v.uploadedBy : null,
            exists('users', v.uploadedBy) ? null : v.uploadedBy,
          );
        }
      }

      // 4. Festivos y lecturas.
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

      for (const [authorId, n] of reassigned) {
        report.warnings.push(`La persona autora «${authorId}» no existe en la plataforma: ${n} contenidos se atribuyen a ${fallbackAuthor}.`);
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

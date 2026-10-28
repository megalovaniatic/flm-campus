import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Context } from 'hono';
import { newId } from '../auth/tokens';
import { get, run, type Db } from '../db/database';
import { HttpError } from '../lib/errors';

/**
 * Archivos subidos (PDF e imágenes). El tipo se decide por la cabecera mágica del contenido,
 * nunca por la extensión ni por el tipo que declara el navegador. Se guardan con un nombre
 * aleatorio en STORAGE_DIR/files, fuera de cualquier ruta pública, y solo se descargan a través
 * de la API con sesión y permisos.
 */
export const MB = 1024 * 1024;
export const MAX_PDF_BYTES = 15 * MB;
export const MAX_IMAGE_BYTES = 5 * MB;

export type FileKind = 'pdf' | 'imagen';
export type FilePurpose = 'documento' | 'imagen' | 'foto-perfil';

export interface DetectedType {
  kind: FileKind;
  mime: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp';
  ext: 'pdf' | 'jpg' | 'png' | 'webp';
}

export interface FileRow {
  id: string;
  storage_name: string;
  original_name: string;
  mime_type: string;
  kind: FileKind;
  purpose: FilePurpose;
  size_bytes: number;
  sha256: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) => signature.every((b, i) => bytes[offset + i] === b);

/** Detecta PDF (%PDF-), JPEG (FF D8 FF), PNG (89 50 4E 47 0D 0A 1A 0A) y WebP (RIFF….WEBP). */
export function detectFileType(bytes: Uint8Array): DetectedType | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { kind: 'pdf', mime: 'application/pdf', ext: 'pdf' };
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { kind: 'imagen', mime: 'image/jpeg', ext: 'jpg' };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { kind: 'imagen', mime: 'image/png', ext: 'png' };
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return { kind: 'imagen', mime: 'image/webp', ext: 'webp' };
  return null;
}

/** Nombre original saneado (sin rutas ni caracteres de control) y con la extensión real. */
export function sanitizeFilename(name: string, ext: string): string {
  const base = (name.split(/[\\/]/).pop() ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f"<>:|?*]/g, '')
    .replace(/\.[^.]*$/, '')
    .trim()
    .slice(0, 100);
  return `${base || 'archivo'}.${ext}`;
}

/** Cabecera Content-Disposition con nombre ASCII de reserva y nombre UTF-8 (RFC 6266 / RFC 5987). */
export function contentDisposition(type: 'inline' | 'attachment', filename: string): string {
  const ascii = filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, '_')
    .replace(/["\\;]/g, '_');
  const encoded = encodeURIComponent(filename).replace(/['()*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

const KIND_TEXT: Record<FileKind, string> = { pdf: 'documentos PDF', imagen: 'imágenes JPEG, PNG o WebP' };

export class FileStorage {
  readonly dir: string;

  constructor(storageDir: string) {
    this.dir = join(storageDir, 'files');
    mkdirSync(this.dir, { recursive: true });
  }

  pathOf(row: Pick<FileRow, 'storage_name'>): string {
    if (!/^[a-f0-9]{32}$/.test(row.storage_name)) throw new Error('Nombre de almacenamiento no válido');
    return join(this.dir, row.storage_name);
  }

  /**
   * Valida y guarda un archivo. Errores claros: 400 (vacío), 413 (tamaño) y 415 (tipo).
   * El registro en la base de datos lo hace `registerFile()` dentro de la transacción de quien llama.
   */
  async store(file: unknown, allowed: FileKind[]): Promise<StoredFile> {
    if (!(file instanceof File)) {
      throw new HttpError(400, 'ARCHIVO_OBLIGATORIO', 'Adjunta el archivo en el campo «archivo» de un formulario multipart/form-data.');
    }
    if (file.size === 0) throw new HttpError(400, 'ARCHIVO_VACIO', 'El archivo está vacío.');
    if (file.size > MAX_PDF_BYTES) throw tooLarge('pdf');
    return this.storeBytes(new Uint8Array(await file.arrayBuffer()), file.name, allowed);
  }

  /** Igual que `store()`, a partir de los bytes (lo usa también la carga de datos semilla). */
  async storeBytes(bytes: Uint8Array, name: string, allowed: FileKind[]): Promise<StoredFile> {
    if (bytes.length === 0) throw new HttpError(400, 'ARCHIVO_VACIO', 'El archivo está vacío.');
    const type = detectFileType(bytes);
    if (!type) {
      throw new HttpError(415, 'TIPO_NO_ADMITIDO', 'Tipo de archivo no admitido. Solo se aceptan documentos PDF e imágenes JPEG, PNG o WebP.');
    }
    if (!allowed.includes(type.kind)) {
      throw new HttpError(415, 'TIPO_NO_ADMITIDO', `En este apartado solo se admiten ${allowed.map((k) => KIND_TEXT[k]).join(' o ')}.`);
    }
    if (type.kind === 'imagen' && bytes.length > MAX_IMAGE_BYTES) throw tooLarge('imagen');
    if (type.kind === 'pdf' && bytes.length > MAX_PDF_BYTES) throw tooLarge('pdf');

    const storageName = randomBytes(16).toString('hex');
    const finalPath = this.pathOf({ storage_name: storageName });
    const tempPath = `${finalPath}.tmp`;
    await writeFile(tempPath, bytes, { mode: 0o640 });
    await rename(tempPath, finalPath);
    return {
      id: newId(),
      storageName,
      originalName: sanitizeFilename(name, type.ext),
      type,
      size: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  }

  async read(row: FileRow): Promise<Uint8Array<ArrayBuffer> | null> {
    try {
      return new Uint8Array(await readFile(this.pathOf(row)));
    } catch {
      return null;
    }
  }

  /** Borra el archivo físico; no falla si ya no existe. */
  async remove(storageName: string): Promise<void> {
    await rm(this.pathOf({ storage_name: storageName }), { force: true });
  }
}

export interface StoredFile {
  id: string;
  storageName: string;
  originalName: string;
  type: DetectedType;
  size: number;
  sha256: string;
}

function tooLarge(kind: FileKind): HttpError {
  return kind === 'pdf'
    ? new HttpError(413, 'ARCHIVO_DEMASIADO_GRANDE', 'El documento PDF supera el tamaño máximo de 15 MB.')
    : new HttpError(413, 'ARCHIVO_DEMASIADO_GRANDE', 'La imagen supera el tamaño máximo de 5 MB.');
}

export function registerFile(db: Db, stored: StoredFile, purpose: FilePurpose, userId: string | null, nowIso: string): FileRow {
  run(
    db,
    `INSERT INTO files (id, storage_name, original_name, mime_type, kind, purpose, size_bytes, sha256, uploaded_by, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    stored.id,
    stored.storageName,
    stored.originalName,
    stored.type.mime,
    stored.type.kind,
    purpose,
    stored.size,
    stored.sha256,
    userId,
    nowIso,
  );
  return getFile(db, stored.id)!;
}

export function getFile(db: Db, id: string): FileRow | undefined {
  return get<FileRow>(db, 'SELECT * FROM files WHERE id = ?', id);
}

export function publicFile(row: FileRow) {
  return {
    id: row.id,
    url: `/api/files/${row.id}`,
    name: row.original_name,
    mimeType: row.mime_type,
    kind: row.kind,
    sizeBytes: row.size_bytes,
    uploadedAt: row.uploaded_at,
  };
}

/** Lee un formulario multipart con un error claro si el cuerpo no es válido. */
export async function readMultipart(c: Context): Promise<Record<string, string | File>> {
  const type = c.req.header('content-type') ?? '';
  if (!/^multipart\/form-data\b/i.test(type)) {
    throw new HttpError(415, 'TIPO_NO_ADMITIDO', 'Envía el archivo como formulario multipart/form-data en el campo «archivo».');
  }
  try {
    const body = await c.req.parseBody();
    const out: Record<string, string | File> = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' || value instanceof File) out[key] = value;
    }
    return out;
  } catch {
    throw new HttpError(400, 'FORMULARIO_NO_VALIDO', 'No se ha podido leer el formulario enviado.');
  }
}

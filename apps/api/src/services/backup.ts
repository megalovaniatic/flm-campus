import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { madridParts } from '@flm/shared';
import type { Db } from '../db/database';

/**
 * Copias de seguridad con `VACUUM INTO`: genera un archivo SQLite compacto y coherente aunque la
 * API esté en marcha (no bloquea a quien escribe) y comprueba su integridad al terminar.
 * Opcionalmente copia también la carpeta de archivos subidos.
 */
export interface BackupOptions {
  dir: string;
  now: Date;
  /** Si se indica, copia también los archivos subidos (STORAGE_DIR) junto a la base de datos. */
  storageDir?: string;
  /** Conserva solo las N copias más recientes (borra las anteriores). */
  keep?: number;
}

export interface BackupResult {
  file: string;
  sizeBytes: number;
  integrity: string;
  filesDir: string | null;
  removed: string[];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Sello de fecha en hora de Madrid: 20261028-231503. */
export function backupStamp(now: Date): string {
  const p = madridParts(now);
  return `${p.year}${pad(p.month)}${pad(p.day)}-${pad(p.hour)}${pad(p.minute)}${pad(p.second)}`;
}

export function createBackup(db: Db, opts: BackupOptions): BackupResult {
  mkdirSync(opts.dir, { recursive: true });
  const stamp = backupStamp(opts.now);
  const file = join(opts.dir, `campus-${stamp}.sqlite`);
  if (existsSync(file)) throw new Error(`Ya existe una copia con el nombre ${file}. Espera un segundo y vuelve a intentarlo.`);

  db.prepare('VACUUM INTO ?').run(file);

  const check = new DatabaseSync(file, { readOnly: true });
  let integrity: string;
  try {
    integrity = String((check.prepare('PRAGMA integrity_check').get() as { integrity_check?: string } | undefined)?.integrity_check ?? 'desconocido');
  } finally {
    check.close();
  }
  if (integrity !== 'ok') throw new Error(`La copia ${file} no supera la comprobación de integridad: ${integrity}`);

  let filesDir: string | null = null;
  if (opts.storageDir && existsSync(opts.storageDir)) {
    filesDir = join(opts.dir, `archivos-${stamp}`);
    cpSync(opts.storageDir, filesDir, { recursive: true });
  }

  const removed: string[] = [];
  if (opts.keep && opts.keep > 0) {
    const copies = readdirSync(opts.dir)
      .filter((name) => /^campus-\d{8}-\d{6}\.sqlite$/.test(name))
      .sort()
      .reverse();
    for (const old of copies.slice(opts.keep)) {
      rmSync(join(opts.dir, old), { force: true });
      const oldFiles = join(opts.dir, old.replace(/^campus-/, 'archivos-').replace(/\.sqlite$/, ''));
      if (existsSync(oldFiles)) rmSync(oldFiles, { recursive: true, force: true });
      removed.push(old);
    }
  }

  return { file, sizeBytes: statSync(file).size, integrity, filesDir, removed };
}

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync, type StatementSync } from 'node:sqlite';

/**
 * Acceso a SQLite con `node:sqlite` (síncrono). Las operaciones de base de datos de una petición
 * se ejecutan sin ceder el bucle de eventos, de modo que las transacciones son atómicas por diseño.
 */
export type Db = DatabaseSync;
export type SqlParam = string | number | bigint | null | Uint8Array;

export function openDatabase(path: string): Db {
  const memory = path === ':memory:';
  if (!memory) mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');
  if (!memory) {
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA synchronous = NORMAL;');
  }
  return db;
}

const statementCache = new WeakMap<Db, Map<string, StatementSync>>();

function statement(db: Db, sql: string): StatementSync {
  let cache = statementCache.get(db);
  if (!cache) {
    cache = new Map();
    statementCache.set(db, cache);
  }
  let stmt = cache.get(sql);
  if (!stmt) {
    stmt = db.prepare(sql);
    cache.set(sql, stmt);
  }
  return stmt;
}

export function get<T>(db: Db, sql: string, ...params: SqlParam[]): T | undefined {
  return statement(db, sql).get(...params) as T | undefined;
}

export function all<T>(db: Db, sql: string, ...params: SqlParam[]): T[] {
  return statement(db, sql).all(...params) as T[];
}

export function run(db: Db, sql: string, ...params: SqlParam[]): number {
  return Number(statement(db, sql).run(...params).changes);
}

const depth = new WeakMap<Db, number>();

/**
 * Ejecuta `fn` en una transacción (BEGIN IMMEDIATE). Admite anidamiento mediante SAVEPOINT.
 * `fn` debe ser síncrona: las operaciones asíncronas (hash de contraseñas, escritura de archivos)
 * se hacen antes o después.
 */
export function transaction<T>(db: Db, fn: () => T): T {
  const level = depth.get(db) ?? 0;
  const savepoint = `sp_${level}`;
  db.exec(level === 0 ? 'BEGIN IMMEDIATE' : `SAVEPOINT ${savepoint}`);
  depth.set(db, level + 1);
  try {
    const result = fn();
    db.exec(level === 0 ? 'COMMIT' : `RELEASE ${savepoint}`);
    return result;
  } catch (err) {
    db.exec(level === 0 ? 'ROLLBACK' : `ROLLBACK TO ${savepoint}; RELEASE ${savepoint}`);
    throw err;
  } finally {
    depth.set(db, level);
  }
}

/** Convierte booleanos a 0/1 (SQLite no tiene tipo booleano). */
export const bit = (value: boolean): number => (value ? 1 : 0);

/** Comprueba si un error de SQLite es de restricción UNIQUE. */
export function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && /UNIQUE constraint failed/i.test(err.message);
}

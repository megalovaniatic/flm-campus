import { get, run, type Db } from '../db/database';
import { HttpError } from '../lib/errors';
import { newId, randomToken, sha256 } from '../auth/tokens';

/**
 * Enlaces de un solo uso para activar la cuenta (7 días) y restablecer la contraseña (30 minutos).
 * Se generan con 32 bytes aleatorios y solo se guarda su hash SHA-256.
 * Emitir un enlace nuevo invalida los anteriores pendientes del mismo tipo.
 */
export type TokenPurpose = 'activacion' | 'recuperacion';

export const TOKEN_TTL_MS: Record<TokenPurpose, number> = {
  activacion: 7 * 24 * 60 * 60 * 1000,
  recuperacion: 30 * 60 * 1000,
};

export interface AuthTokenRow {
  id: string;
  user_id: string;
  purpose: TokenPurpose;
  token_hash: string;
  created_at: number;
  expires_at: number;
  used_at: number | null;
  created_by: string | null;
}

const EXPIRED_MESSAGE: Record<TokenPurpose, string> = {
  activacion: 'El enlace de activación ha caducado (es válido durante 7 días). Pide a administración que te envíe uno nuevo.',
  recuperacion: 'El enlace para restablecer la contraseña ha caducado (es válido durante 30 minutos). Solicita uno nuevo.',
};

export function issueAuthToken(db: Db, userId: string, purpose: TokenPurpose, now: number, createdBy: string | null): { token: string; expiresAt: Date } {
  run(db, 'DELETE FROM auth_tokens WHERE user_id = ? AND purpose = ? AND used_at IS NULL', userId, purpose);
  const token = randomToken(32);
  const expiresAt = now + TOKEN_TTL_MS[purpose];
  run(
    db,
    'INSERT INTO auth_tokens (id, user_id, purpose, token_hash, created_at, expires_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    newId(),
    userId,
    purpose,
    sha256(token),
    now,
    expiresAt,
    createdBy,
  );
  return { token, expiresAt: new Date(expiresAt) };
}

/** Busca un enlace vigente o lanza 400 con el motivo (no válido, ya usado o caducado). */
export function findAuthToken(db: Db, token: string, purpose: TokenPurpose, now: number): AuthTokenRow {
  const row = /^[A-Za-z0-9_-]{43}$/.test(token)
    ? get<AuthTokenRow>(db, 'SELECT * FROM auth_tokens WHERE token_hash = ? AND purpose = ?', sha256(token), purpose)
    : undefined;
  if (!row) throw new HttpError(400, 'ENLACE_NO_VALIDO', 'El enlace no es válido o ha sido sustituido por otro más reciente. Solicita uno nuevo.');
  if (row.used_at !== null) throw new HttpError(400, 'ENLACE_USADO', 'Este enlace ya se ha utilizado. Si lo necesitas, solicita uno nuevo.');
  if (now >= row.expires_at) throw new HttpError(400, 'ENLACE_CADUCADO', EXPIRED_MESSAGE[purpose]);
  return row;
}

/** Marca el enlace como usado de forma atómica (garantiza el uso único aunque lleguen dos peticiones). */
export function consumeAuthToken(db: Db, row: AuthTokenRow, now: number): void {
  const changed = run(db, 'UPDATE auth_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL', now, row.id);
  if (changed !== 1) throw new HttpError(400, 'ENLACE_USADO', 'Este enlace ya se ha utilizado. Si lo necesitas, solicita uno nuevo.');
}

import { all, get, run, type Db } from '../db/database';
import { newId, randomToken, sha256 } from './tokens';

/**
 * Sesiones de servidor: la cookie lleva un token aleatorio y la base de datos solo su hash.
 * Caducan tras 12 horas sin actividad o, en cualquier caso, a los 14 días de iniciarse.
 */
export const IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000;
export const ABSOLUTE_TIMEOUT_MS = 14 * 24 * 60 * 60 * 1000;
/** La última actividad se anota como mucho una vez por minuto para no escribir en cada petición. */
const TOUCH_EVERY_MS = 60 * 1000;

export type RevokeReason =
  | 'cierre'
  | 'usuario'
  | 'admin'
  | 'desactivacion'
  | 'cambio-rol'
  | 'cambio-contrasena'
  | 'restablecimiento'
  | 'rotacion'
  | 'anonimizacion';

const REVOKE_MESSAGES: Record<RevokeReason, string> = {
  cierre: 'Has cerrado la sesión.',
  usuario: 'Esta sesión se ha cerrado desde la lista de sesiones de tu cuenta.',
  admin: 'Administración ha cerrado tu sesión.',
  desactivacion: 'Tu cuenta se ha desactivado.',
  'cambio-rol': 'Tu rol en el campus ha cambiado.',
  'cambio-contrasena': 'La contraseña de tu cuenta ha cambiado.',
  restablecimiento: 'Se ha restablecido la contraseña de tu cuenta.',
  rotacion: 'Se ha iniciado una sesión nueva en este navegador.',
  anonimizacion: 'Tu cuenta se ha dado de baja.',
};

export interface SessionRow {
  id: string;
  user_id: string;
  token_hash: string;
  csrf_token: string;
  created_at: number;
  last_seen_at: number;
  expires_at: number;
  revoked_at: number | null;
  revoked_reason: string | null;
  ip: string | null;
  user_agent: string | null;
}

export interface SessionMeta {
  ip: string | null;
  userAgent: string | null;
}

export type SessionCheck =
  | { ok: true; session: SessionRow }
  | { ok: false; code: 'SESION_NO_VALIDA' | 'SESION_CADUCADA' | 'SESION_CERRADA'; message: string };

export function createSession(db: Db, userId: string, now: number, meta: SessionMeta): { token: string; session: SessionRow } {
  const token = randomToken(32);
  const session: SessionRow = {
    id: newId(),
    user_id: userId,
    token_hash: sha256(token),
    csrf_token: randomToken(32),
    created_at: now,
    last_seen_at: now,
    expires_at: now + ABSOLUTE_TIMEOUT_MS,
    revoked_at: null,
    revoked_reason: null,
    ip: meta.ip,
    user_agent: meta.userAgent ? meta.userAgent.slice(0, 300) : null,
  };
  run(
    db,
    `INSERT INTO sessions (id, user_id, token_hash, csrf_token, created_at, last_seen_at, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    session.id,
    session.user_id,
    session.token_hash,
    session.csrf_token,
    session.created_at,
    session.last_seen_at,
    session.expires_at,
    session.ip,
    session.user_agent,
  );
  return { token, session };
}

/** Comprueba el token de la cookie y explica con claridad por qué una sesión ya no sirve. */
export function checkSession(db: Db, token: string, now: number): SessionCheck {
  const session = get<SessionRow>(db, 'SELECT * FROM sessions WHERE token_hash = ?', sha256(token));
  if (!session) {
    return { ok: false, code: 'SESION_NO_VALIDA', message: 'Tu sesión no es válida o ya no existe. Inicia sesión de nuevo.' };
  }
  if (session.revoked_at !== null) {
    const reason = REVOKE_MESSAGES[session.revoked_reason as RevokeReason] ?? 'Tu sesión se ha cerrado.';
    return { ok: false, code: 'SESION_CERRADA', message: `${reason} Inicia sesión de nuevo.` };
  }
  if (now >= session.expires_at) {
    return { ok: false, code: 'SESION_CADUCADA', message: 'Tu sesión ha caducado: ha alcanzado la duración máxima de 14 días. Inicia sesión de nuevo.' };
  }
  if (now - session.last_seen_at >= IDLE_TIMEOUT_MS) {
    return { ok: false, code: 'SESION_CADUCADA', message: 'Tu sesión ha caducado tras 12 horas sin actividad. Inicia sesión de nuevo.' };
  }
  return { ok: true, session };
}

export function touchSession(db: Db, session: SessionRow, now: number): void {
  if (now - session.last_seen_at < TOUCH_EVERY_MS) return;
  run(db, 'UPDATE sessions SET last_seen_at = ? WHERE id = ?', now, session.id);
  session.last_seen_at = now;
}

export function revokeSession(db: Db, sessionId: string, reason: RevokeReason, now: number): boolean {
  return run(db, 'UPDATE sessions SET revoked_at = ?, revoked_reason = ? WHERE id = ? AND revoked_at IS NULL', now, reason, sessionId) > 0;
}

/** Revoca todas las sesiones abiertas de una persona (opcionalmente, salvo una). Devuelve cuántas. */
export function revokeUserSessions(db: Db, userId: string, reason: RevokeReason, now: number, exceptSessionId?: string): number {
  return run(
    db,
    'UPDATE sessions SET revoked_at = ?, revoked_reason = ? WHERE user_id = ? AND revoked_at IS NULL AND id <> ?',
    now,
    reason,
    userId,
    exceptSessionId ?? '',
  );
}

/** Sustituye el token y el token CSRF de una sesión (p. ej., tras cambiar la contraseña). */
export function rotateSession(db: Db, session: SessionRow, now: number): { token: string; csrfToken: string } {
  const token = randomToken(32);
  const csrfToken = randomToken(32);
  run(db, 'UPDATE sessions SET token_hash = ?, csrf_token = ?, last_seen_at = ? WHERE id = ?', sha256(token), csrfToken, now, session.id);
  session.token_hash = sha256(token);
  session.csrf_token = csrfToken;
  session.last_seen_at = now;
  return { token, csrfToken };
}

/** Sesiones vigentes de una persona (sin revocar y sin caducar). */
export function listActiveSessions(db: Db, userId: string, now: number): SessionRow[] {
  return all<SessionRow>(
    db,
    `SELECT * FROM sessions
     WHERE user_id = ? AND revoked_at IS NULL AND expires_at > ? AND last_seen_at > ?
     ORDER BY last_seen_at DESC`,
    userId,
    now,
    now - IDLE_TIMEOUT_MS,
  );
}

/** Vista pública de una sesión (sin hashes ni token CSRF). */
export function publicSession(s: SessionRow, currentId?: string) {
  return {
    id: s.id,
    createdAt: new Date(s.created_at).toISOString(),
    lastSeenAt: new Date(s.last_seen_at).toISOString(),
    expiresAt: new Date(s.expires_at).toISOString(),
    idleExpiresAt: new Date(Math.min(s.last_seen_at + IDLE_TIMEOUT_MS, s.expires_at)).toISOString(),
    ip: s.ip,
    userAgent: s.user_agent,
    current: s.id === currentId,
  };
}

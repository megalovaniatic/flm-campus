import { IDLE_TIMEOUT_MS } from '../auth/sessions';
import { run, transaction, type Db } from '../db/database';
import { audit } from './audit';

/**
 * Política de retención (ver docs/retencion-datos.md). Se ejecuta al arrancar y una vez al día:
 * - Sesiones caducadas, inactivas o revocadas y enlaces usados o caducados: se borran.
 * - Registro de auditoría: 2 años.
 * - Intentos de test y lecturas: mientras la persona esté activa y hasta 1 año tras su baja;
 *   después, los intentos se desvinculan (quedan como agregados anónimos) y las lecturas se borran.
 */
export const RETENTION = {
  auditDays: 730,
  learningAfterLeavingDays: 365,
  /** Las sesiones caducadas o revocadas se conservan un día para poder explicar por qué se cerraron. */
  revokedSessionGraceMs: 24 * 60 * 60 * 1000,
} as const;

const DAY_MS = 86_400_000;

export interface PurgeResult {
  sessions: number;
  tokens: number;
  auditEntries: number;
  attemptsDissociated: number;
  readsDeleted: number;
}

export function purgeExpiredData(db: Db, now: Date): PurgeResult {
  const t = now.getTime();
  return transaction(db, () => {
    const grace = RETENTION.revokedSessionGraceMs;
    const sessions = run(
      db,
      'DELETE FROM sessions WHERE expires_at <= ? OR last_seen_at <= ? OR (revoked_at IS NOT NULL AND revoked_at <= ?)',
      t - grace,
      t - IDLE_TIMEOUT_MS - grace,
      t - grace,
    );
    const tokens = run(db, 'DELETE FROM auth_tokens WHERE used_at IS NOT NULL OR expires_at <= ?', t);
    const auditEntries = run(db, 'DELETE FROM audit_log WHERE at < ?', new Date(t - RETENTION.auditDays * DAY_MS).toISOString());
    const leftBefore = new Date(t - RETENTION.learningAfterLeavingDays * DAY_MS).toISOString();
    const attemptsDissociated = run(
      db,
      `UPDATE quiz_attempts SET user_id = NULL WHERE user_id IN (
         SELECT id FROM users WHERE status = 'inactiva' AND deactivated_at IS NOT NULL AND deactivated_at < ?)`,
      leftBefore,
    );
    const readsDeleted = run(
      db,
      `DELETE FROM read_confirmations WHERE user_id IN (
         SELECT id FROM users WHERE status = 'inactiva' AND deactivated_at IS NOT NULL AND deactivated_at < ?)`,
      leftBefore,
    );
    const result = { sessions, tokens, auditEntries, attemptsDissociated, readsDeleted };
    if (Object.values(result).some((n) => n > 0)) {
      audit(db, { actorId: null, action: 'retencion.purga', entity: 'sistema', detail: JSON.stringify(result) }, now);
    }
    return result;
  });
}

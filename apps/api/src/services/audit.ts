import type { AuditRecord } from '@flm/shared';
import { all, get, run, type Db, type SqlParam } from '../db/database';

/**
 * Registro de auditoría de acciones de seguridad y editoriales: quién, qué, cuándo y sobre qué entidad.
 * Nunca se guardan contraseñas, tokens, correos ni nombres en `detail`: solo identificadores y datos
 * no personales, para que eliminar el perfil de una persona no deje rastros identificativos.
 */
export interface AuditEntry {
  actorId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  detail?: string | null;
  ip?: string | null;
}

export function audit(db: Db, entry: AuditEntry, at: Date): void {
  run(
    db,
    'INSERT INTO audit_log (at, actor_id, action, entity, entity_id, detail, ip) VALUES (?, ?, ?, ?, ?, ?, ?)',
    at.toISOString(),
    entry.actorId,
    entry.action,
    entry.entity,
    entry.entityId ?? null,
    entry.detail ?? null,
    entry.ip ?? null,
  );
}

export interface AuditFilters {
  action?: string;
  entity?: string;
  entityId?: string;
  actorId?: string;
  from?: string;
  to?: string;
  limit: number;
  offset: number;
}

interface AuditRow {
  id: number;
  at: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: string | null;
  ip: string | null;
  actor_name: string | null;
}

export function queryAudit(db: Db, f: AuditFilters): { items: (AuditRecord & { actorName?: string; ip?: string })[]; total: number } {
  const where: string[] = [];
  const params: SqlParam[] = [];
  if (f.action) {
    where.push('(a.action = ? OR a.action LIKE ?)');
    params.push(f.action, `${f.action}.%`);
  }
  if (f.entity) {
    where.push('a.entity = ?');
    params.push(f.entity);
  }
  if (f.entityId) {
    where.push('a.entity_id = ?');
    params.push(f.entityId);
  }
  if (f.actorId) {
    where.push('a.actor_id = ?');
    params.push(f.actorId);
  }
  if (f.from) {
    where.push('a.at >= ?');
    params.push(f.from);
  }
  if (f.to) {
    where.push('a.at < ?');
    params.push(f.to);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = get<{ n: number }>(db, `SELECT COUNT(*) AS n FROM audit_log a ${clause}`, ...params)?.n ?? 0;
  const rows = all<AuditRow>(
    db,
    `SELECT a.*, u.name AS actor_name FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id
     ${clause} ORDER BY a.at DESC, a.id DESC LIMIT ? OFFSET ?`,
    ...params,
    f.limit,
    f.offset,
  );
  return {
    total,
    items: rows.map((r) => ({
      id: String(r.id),
      at: r.at,
      actorId: r.actor_id ?? 'sistema',
      ...(r.actor_name ? { actorName: r.actor_name } : {}),
      action: r.action,
      entity: r.entity,
      ...(r.entity_id ? { entityId: r.entity_id } : {}),
      ...(r.detail ? { detail: r.detail } : {}),
      ...(r.ip ? { ip: r.ip } : {}),
    })),
  };
}

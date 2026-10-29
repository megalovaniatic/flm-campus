import { isCorporateEmail, personSchema, type Department, type Office, type Person, type Role } from '@flm/shared';
import { z } from 'zod';
import { all, get, run, transaction, isUniqueViolation, type Db } from '../db/database';
import { conflict, notFound } from '../lib/errors';
import { birthdaySchema, dateKey } from '../lib/validation';
import { newId } from '../auth/tokens';

/** Fila de la tabla `users`. */
export interface UserRow {
  id: string;
  email: string;
  name: string;
  position: string;
  department: string;
  office: string;
  role: Role;
  photo_file_id: string | null;
  start_date: string | null;
  birthday: string | null;
  show_birthday: number;
  status: 'activa' | 'inactiva';
  password_hash: string | null;
  password_changed_at: string | null;
  activated_at: string | null;
  deactivated_at: string | null;
  anonymized_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AccountState = 'pendiente-activacion' | 'activa' | 'desactivada' | 'anonimizada';

export const ANONYMIZED_NAME = 'Persona eliminada';
/** Plazo tras la baja a partir del cual conviene anonimizar la ficha (política de retención). */
export const RETENTION_AFTER_LEAVING_DAYS = 365;

export const fileUrl = (fileId: string) => `/api/files/${fileId}`;

/** Correo corporativo normalizado (minúsculas) y validado con la regla compartida. */
export const corporateEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .refine(isCorporateEmail, 'Solo se admiten correos corporativos @flmexperts.com');

const shape = personSchema.pick({ name: true, position: true, department: true, office: true, role: true });

export const personCreateSchema = shape.extend({
  email: corporateEmail,
  /** Fecha de incorporación: genera los aniversarios. Si no consta, no se calculan. */
  startDate: dateKey.optional(),
  birthday: birthdaySchema.optional(),
  showBirthday: z.boolean().default(false),
});

export const personUpdateSchema = shape
  .extend({ email: corporateEmail, startDate: dateKey })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Indica al menos un campo que modificar');

export type PersonCreateInput = z.output<typeof personCreateSchema>;
export type PersonUpdateInput = z.output<typeof personUpdateSchema>;

export function accountState(u: UserRow): AccountState {
  if (u.anonymized_at) return 'anonimizada';
  if (u.status === 'inactiva') return 'desactivada';
  return u.password_hash ? 'activa' : 'pendiente-activacion';
}

/** Persona con la forma del tipo compartido `Person`. */
export function toPerson(u: UserRow): Person {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    position: u.position,
    department: u.department as Department,
    office: u.office as Office,
    role: u.role,
    ...(u.photo_file_id ? { photo: fileUrl(u.photo_file_id) } : {}),
    ...(u.start_date ? { startDate: u.start_date } : {}),
    ...(u.birthday ? { birthday: u.birthday } : {}),
    showBirthday: u.show_birthday === 1,
    status: u.status,
  };
}

/** Vista de administración: incluye el estado de la cuenta y si toca revisar la retención. */
export function adminPerson(u: UserRow, now: Date) {
  const leftAt = u.deactivated_at ? new Date(u.deactivated_at).getTime() : null;
  return {
    ...toPerson(u),
    accountState: accountState(u),
    activatedAt: u.activated_at,
    deactivatedAt: u.deactivated_at,
    anonymizedAt: u.anonymized_at,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
    retentionReviewDue: !u.anonymized_at && leftAt !== null && now.getTime() - leftAt > RETENTION_AFTER_LEAVING_DAYS * 86_400_000,
  };
}

/** Ficha mínima para el directorio interno (sin correo ni fechas personales). */
export function directoryEntry(u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    position: u.position,
    department: u.department,
    office: u.office,
    ...(u.photo_file_id ? { photo: fileUrl(u.photo_file_id) } : {}),
  };
}

export function getUser(db: Db, id: string): UserRow | undefined {
  return get<UserRow>(db, 'SELECT * FROM users WHERE id = ?', id);
}

export function getUserByEmail(db: Db, email: string): UserRow | undefined {
  return get<UserRow>(db, 'SELECT * FROM users WHERE email = ?', email.trim().toLowerCase());
}

export function requireUserRow(db: Db, id: string): UserRow {
  const user = getUser(db, id);
  if (!user) throw notFound('No existe ninguna persona con ese identificador.');
  return user;
}

export function userName(db: Db, id: string | null | undefined): string | undefined {
  if (!id) return undefined;
  return get<{ name: string }>(db, 'SELECT name FROM users WHERE id = ?', id)?.name;
}

/** Personas activas (no anonimizadas), en orden alfabético. */
export function activeUsers(db: Db): UserRow[] {
  return all<UserRow>(db, "SELECT * FROM users WHERE status = 'activa' AND anonymized_at IS NULL ORDER BY name COLLATE NOCASE");
}

/** Administradores activos con la cuenta ya activada (pueden iniciar sesión). */
export function countActiveAdmins(db: Db, excludeId?: string): number {
  return (
    get<{ n: number }>(
      db,
      "SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND status = 'activa' AND password_hash IS NOT NULL AND anonymized_at IS NULL AND id <> ?",
      excludeId ?? '',
    )?.n ?? 0
  );
}

/** Impide dejar el campus sin ningún administrador activo. */
export function assertNotLastAdmin(db: Db, user: UserRow, action: string): void {
  const isActiveAdmin = user.role === 'admin' && user.status === 'activa' && !!user.password_hash && !user.anonymized_at;
  if (isActiveAdmin && countActiveAdmins(db, user.id) === 0) {
    throw conflict(`No se puede ${action} al último administrador activo. Nombra antes a otra persona administradora.`, 'ULTIMO_ADMINISTRADOR');
  }
}

export function createUser(db: Db, input: PersonCreateInput, nowIso: string, id: string = newId()): UserRow {
  try {
    run(
      db,
      `INSERT INTO users (id, email, name, position, department, office, role, start_date, birthday, show_birthday, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activa', ?, ?)`,
      id,
      input.email,
      input.name.trim(),
      input.position.trim(),
      input.department,
      input.office,
      input.role,
      input.startDate ?? null,
      input.birthday ?? null,
      input.showBirthday ? 1 : 0,
      nowIso,
      nowIso,
    );
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict('Ya existe una cuenta con ese correo electrónico.', 'CORREO_DUPLICADO');
    throw err;
  }
  return requireUserRow(db, id);
}

/** Actualiza la ficha. Devuelve la fila nueva y si ha cambiado el rol. */
export function updateUser(db: Db, user: UserRow, patch: PersonUpdateInput, nowIso: string): { user: UserRow; roleChanged: boolean } {
  return transaction(db, () => {
    const roleChanged = patch.role !== undefined && patch.role !== user.role;
    if (roleChanged && user.role === 'admin') assertNotLastAdmin(db, user, 'quitar el rol de administración');
    try {
      run(
        db,
        `UPDATE users SET email = ?, name = ?, position = ?, department = ?, office = ?, role = ?, start_date = ?, updated_at = ? WHERE id = ?`,
        patch.email ?? user.email,
        patch.name?.trim() ?? user.name,
        patch.position?.trim() ?? user.position,
        patch.department ?? user.department,
        patch.office ?? user.office,
        patch.role ?? user.role,
        patch.startDate ?? user.start_date,
        nowIso,
        user.id,
      );
    } catch (err) {
      if (isUniqueViolation(err)) throw conflict('Ya existe una cuenta con ese correo electrónico.', 'CORREO_DUPLICADO');
      throw err;
    }
    return { user: requireUserRow(db, user.id), roleChanged };
  });
}

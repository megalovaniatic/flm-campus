import {
  birthdaySchema,
  fullDateSchema,
  isCorporateEmail,
  madridDateKey,
  missingPersonalDates,
  personalDatesSchema,
  personSchema,
  startDateLimitIssue,
  type Department,
  type Office,
  type Person,
  type PersonalDateField,
  type Role,
} from '@flm/shared';
import { z } from 'zod';
import { all, get, run, transaction, isUniqueViolation, type Db } from '../db/database';
import { conflict, HttpError, notFound } from '../lib/errors';
import { newId } from '../auth/tokens';

/**
 * Fila de la tabla `users`: la ficha profesional y, para el calendario de empresa, el cumpleaños
 * (solo día y mes) y la fecha de incorporación (migración 0006). Los perfiles anteriores pueden no
 * tenerlos todavía: nunca se rellenan por defecto.
 */
export interface UserRow {
  id: string;
  email: string;
  name: string;
  position: string;
  department: string;
  office: string;
  role: Role;
  photo_file_id: string | null;
  /** Cumpleaños, «MM-DD» (sin año de nacimiento). */
  birthday: string | null;
  /** Fecha de incorporación a FLM, «AAAA-MM-DD». */
  start_date: string | null;
  status: 'activa' | 'inactiva';
  password_hash: string | null;
  password_changed_at: string | null;
  activated_at: string | null;
  deactivated_at: string | null;
  /**
   * Solo en bases anteriores a la migración 0004 (que convierte esas cuentas en perfiles eliminados):
   * hoy quien deja FLM se elimina con «Eliminar el perfil» y su fila desaparece.
   */
  anonymized_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AccountState = 'pendiente-activacion' | 'activa' | 'desactivada' | 'anonimizada';

/** Plazo tras la baja a partir del cual conviene eliminar el perfil (política de retención). */
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

/** Mensajes cuando falta el dato (el formato lo valida `personalDatesSchema` de @flm/shared). */
export const PERSONAL_DATE_REQUIRED: Record<PersonalDateField, string> = {
  birthday: 'Indica el día y el mes del cumpleaños (sin el año de nacimiento).',
  startDate: 'Indica la fecha completa de incorporación a FLM: día, mes y año.',
};

/** Cumpleaños y fecha de incorporación del alta: obligatorios y validados con `personalDatesSchema`. */
const personalDatesRequired = z.object({
  birthday: z.string({ error: PERSONAL_DATE_REQUIRED.birthday }).pipe(personalDatesSchema.shape.birthday),
  startDate: z.string({ error: PERSONAL_DATE_REQUIRED.startDate }).pipe(personalDatesSchema.shape.startDate),
});

/**
 * Alta: ficha profesional, cumpleaños (día y mes, sin año) y fecha de incorporación, que alimentan el
 * calendario de empresa. Cualquier otro campo de la petición se descarta sin guardarlo.
 */
export const personCreateSchema = shape.extend({ email: corporateEmail }).extend(personalDatesRequired.shape);

/** Edición: todo opcional; el cumpleaños y la fecha de incorporación, si se envían, han de ser fechas que existan. */
export const personUpdateSchema = shape
  .extend({ email: corporateEmail, birthday: birthdaySchema, startDate: fullDateSchema })
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Indica al menos un campo que modificar');

/**
 * Autoservicio (`PATCH /api/me/personal-dates`): la persona completa lo que falta de su ficha. Puede
 * corregir su cumpleaños; la fecha de incorporación solo la indica si aún no consta.
 */
export const personalDatesPatchSchema = z
  .object({ birthday: birthdaySchema, startDate: fullDateSchema })
  .partial()
  .refine((v) => v.birthday !== undefined || v.startDate !== undefined, 'Indica tu cumpleaños, tu fecha de incorporación o ambos');

/**
 * El mismo tope que la web (`startDateLimitIssue` de @flm/shared): la fecha de incorporación puede ser
 * una alta prevista, pero no posterior a un año desde hoy (frena erratas como 2062). Si lo supera,
 * 400 `VALIDACION` en el campo `startDate`, con la forma de cualquier otro error de validación.
 */
export function assertStartDateLimit(startDate: string | undefined, nowIso: string): void {
  if (!startDate) return;
  const issue = startDateLimitIssue(startDate, madridDateKey(new Date(nowIso)));
  if (issue) throw new HttpError(400, 'VALIDACION', 'Hay datos no válidos en la petición. Revisa los campos indicados.', [{ path: 'startDate', message: issue }]);
}

export type PersonCreateInput = z.output<typeof personCreateSchema>;
export type PersonUpdateInput = z.output<typeof personUpdateSchema>;
export type PersonalDatesPatch = z.output<typeof personalDatesPatchSchema>;

export function accountState(u: UserRow): AccountState {
  if (u.anonymized_at) return 'anonimizada';
  if (u.status === 'inactiva') return 'desactivada';
  return u.password_hash ? 'activa' : 'pendiente-activacion';
}

/** Cumpleaños y fecha de incorporación de la ficha, solo los que constan. */
function personalDates(u: UserRow): Pick<Person, 'birthday' | 'startDate'> {
  return {
    ...(u.birthday ? { birthday: u.birthday } : {}),
    ...(u.start_date ? { startDate: u.start_date } : {}),
  };
}

/** Persona con la forma del tipo compartido `Person` (con el cumpleaños y la incorporación, si constan). */
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
    status: u.status,
    ...personalDates(u),
  };
}

/** Datos del calendario que faltan en la ficha («birthday», «startDate»): se piden sin bloquear el acceso. */
export function missingDatesOf(u: UserRow): PersonalDateField[] {
  return missingPersonalDates(personalDates(u));
}

/** Vista de administración: incluye el estado de la cuenta, los datos del calendario que faltan y si toca revisar la retención. */
export function adminPerson(u: UserRow, now: Date) {
  const leftAt = u.deactivated_at ? new Date(u.deactivated_at).getTime() : null;
  return {
    ...toPerson(u),
    missingPersonalDates: missingDatesOf(u),
    accountState: accountState(u),
    activatedAt: u.activated_at,
    deactivatedAt: u.deactivated_at,
    anonymizedAt: u.anonymized_at,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
    retentionReviewDue: !u.anonymized_at && leftAt !== null && now.getTime() - leftAt > RETENTION_AFTER_LEAVING_DAYS * 86_400_000,
  };
}

/** Ficha mínima de una persona (sin correo electrónico ni fechas): la de las bienvenidas. */
export function directoryCard(u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    position: u.position,
    department: u.department,
    office: u.office,
    ...(u.photo_file_id ? { photo: fileUrl(u.photo_file_id) } : {}),
  };
}

/**
 * Ficha del directorio interno (sin correo electrónico): la mínima más lo que necesita el calendario de
 * empresa, el cumpleaños (día y mes) y la fecha de incorporación, si constan.
 */
export function directoryEntry(u: UserRow) {
  return { ...directoryCard(u), ...personalDates(u) };
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
  assertStartDateLimit(input.startDate, nowIso);
  try {
    run(
      db,
      `INSERT INTO users (id, email, name, position, department, office, role, birthday, start_date, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'activa', ?, ?)`,
      id,
      input.email,
      input.name.trim(),
      input.position.trim(),
      input.department,
      input.office,
      input.role,
      input.birthday,
      input.startDate,
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
  if (patch.startDate !== user.start_date) assertStartDateLimit(patch.startDate, nowIso);
  return transaction(db, () => {
    const roleChanged = patch.role !== undefined && patch.role !== user.role;
    if (roleChanged && user.role === 'admin') assertNotLastAdmin(db, user, 'quitar el rol de administración');
    try {
      run(
        db,
        `UPDATE users SET email = ?, name = ?, position = ?, department = ?, office = ?, role = ?, birthday = ?, start_date = ?, updated_at = ? WHERE id = ?`,
        patch.email ?? user.email,
        patch.name?.trim() ?? user.name,
        patch.position?.trim() ?? user.position,
        patch.department ?? user.department,
        patch.office ?? user.office,
        patch.role ?? user.role,
        patch.birthday ?? user.birthday,
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

/**
 * Autoservicio: la persona completa los datos del calendario que faltan en su ficha. El cumpleaños lo
 * puede indicar o corregir; la fecha de incorporación, solo indicarla si aún no consta (si ya consta y
 * no coincide, la corrige administración). Nada de esto bloquea el acceso: es opcional para quien ya
 * tenía cuenta. Devuelve la fila nueva y los campos que han cambiado (sin sus valores).
 */
export function completePersonalDates(db: Db, user: UserRow, input: PersonalDatesPatch, nowIso: string): { user: UserRow; changed: PersonalDateField[] } {
  if (input.startDate !== undefined && user.start_date && input.startDate !== user.start_date) {
    throw conflict('Tu fecha de incorporación ya consta en el campus. Si no es correcta, pide a administración que la corrija.', 'INCORPORACION_YA_INDICADA');
  }
  const changed: PersonalDateField[] = [];
  if (input.birthday !== undefined && input.birthday !== user.birthday) changed.push('birthday');
  if (input.startDate !== undefined && !user.start_date) {
    assertStartDateLimit(input.startDate, nowIso);
    changed.push('startDate');
  }
  if (!changed.length) return { user, changed };
  run(
    db,
    'UPDATE users SET birthday = ?, start_date = ?, updated_at = ? WHERE id = ?',
    changed.includes('birthday') ? input.birthday! : user.birthday,
    changed.includes('startDate') ? input.startDate! : user.start_date,
    nowIso,
    user.id,
  );
  return { user: requireUserRow(db, user.id), changed };
}

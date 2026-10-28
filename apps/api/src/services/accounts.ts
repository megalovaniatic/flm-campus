import { revokeUserSessions } from '../auth/sessions';
import type { AppContext, AuthUser } from '../context';
import { get, run, transaction, type Db } from '../db/database';
import { badRequest, conflict } from '../lib/errors';
import { issueAuthToken } from './account-tokens';
import { audit } from './audit';
import { activationEmail, activationUrl } from './emails';
import { ANONYMIZED_NAME, assertNotLastAdmin, requireUserRow, type UserRow } from './people';

/**
 * Ciclo de vida de las cuentas: enlace de activación, desactivación, reactivación y
 * eliminación controlada de datos personales (anonimización).
 */

/** Emite un enlace de activación (7 días, un solo uso) y lo envía por correo. */
export async function sendActivationLink(ctx: AppContext, user: UserRow, actorId: string | null, ip?: string | null) {
  if (user.anonymized_at) throw conflict('Esta cuenta está anonimizada y no se puede activar.', 'CUENTA_ANONIMIZADA');
  if (user.password_hash) {
    throw conflict('La cuenta ya está activada. Si la persona no recuerda la contraseña, puede usar «He olvidado mi contraseña».', 'CUENTA_YA_ACTIVADA');
  }
  if (user.status !== 'activa') throw conflict('La cuenta está desactivada. Reactívala antes de enviar el enlace.', 'CUENTA_DESACTIVADA');
  const now = ctx.now();
  const { token, expiresAt } = issueAuthToken(ctx.db, user.id, 'activacion', now.getTime(), actorId);
  const url = activationUrl(ctx.config.appOrigin, token);
  audit(ctx.db, { actorId, action: 'cuenta.enlace-activacion', entity: 'persona', entityId: user.id, ip }, now);
  const sent = await ctx.mailer.send(activationEmail(user.email, user.name, url));
  // Sin SMTP, quien administra recibe el enlace para entregarlo por un canal seguro.
  return { sent, expiresAt: expiresAt.toISOString(), ...(sent ? {} : { url }) };
}

export function deactivateUser(db: Db, actor: AuthUser, user: UserRow, now: Date, ip?: string | null): UserRow {
  if (user.anonymized_at) throw conflict('Esta cuenta ya está anonimizada.', 'CUENTA_ANONIMIZADA');
  if (user.status === 'inactiva') throw conflict('La cuenta ya está desactivada.', 'CUENTA_YA_DESACTIVADA');
  return transaction(db, () => {
    assertNotLastAdmin(db, user, 'desactivar');
    const nowIso = now.toISOString();
    run(db, "UPDATE users SET status = 'inactiva', deactivated_at = ?, updated_at = ? WHERE id = ?", nowIso, nowIso, user.id);
    const closed = revokeUserSessions(db, user.id, 'desactivacion', now.getTime());
    run(db, 'DELETE FROM auth_tokens WHERE user_id = ? AND used_at IS NULL', user.id);
    audit(db, { actorId: actor.id, action: 'persona.desactivar', entity: 'persona', entityId: user.id, detail: `Sesiones cerradas: ${closed}`, ip }, now);
    return requireUserRow(db, user.id);
  });
}

export function reactivateUser(db: Db, actor: AuthUser, user: UserRow, now: Date, ip?: string | null): UserRow {
  if (user.anonymized_at) throw conflict('Una cuenta anonimizada no se puede reactivar. Crea una cuenta nueva si la persona vuelve.', 'CUENTA_ANONIMIZADA');
  if (user.status === 'activa') throw conflict('La cuenta ya está activa.', 'CUENTA_YA_ACTIVA');
  const nowIso = now.toISOString();
  run(db, "UPDATE users SET status = 'activa', deactivated_at = NULL, updated_at = ? WHERE id = ?", nowIso, user.id);
  audit(db, { actorId: actor.id, action: 'persona.reactivar', entity: 'persona', entityId: user.id, ip }, now);
  return requireUserRow(db, user.id);
}

/**
 * Eliminación controlada de datos personales. Exige escribir el correo de la persona como
 * confirmación explícita. Anonimiza nombre, correo, foto, fechas personales y puesto; borra
 * sesiones, enlaces y confirmaciones de lectura; desvincula los intentos de test (se conservan
 * solo como agregados no identificativos) y deja constancia en la auditoría.
 * Devuelve el nombre del archivo de la foto para borrarlo del almacenamiento.
 */
export function anonymizeUser(db: Db, actor: AuthUser, user: UserRow, confirmation: string, now: Date, ip?: string | null): { user: UserRow; photoStorageName: string | null } {
  if (confirmation.trim().toLowerCase() !== user.email.toLowerCase()) {
    throw badRequest('Para confirmar la eliminación, escribe exactamente el correo de la persona en el campo «confirm».', undefined, 'CONFIRMACION_NO_VALIDA');
  }
  if (user.anonymized_at) throw conflict('Los datos personales de esta cuenta ya se eliminaron.', 'CUENTA_ANONIMIZADA');
  if (user.id === actor.id) throw conflict('No puedes eliminar tus propios datos personales desde la administración. Pídeselo a otra persona administradora.', 'AUTOELIMINACION');
  return transaction(db, () => {
    assertNotLastAdmin(db, user, 'eliminar los datos de');
    const nowIso = now.toISOString();
    const photo = user.photo_file_id ? get<{ storage_name: string }>(db, 'SELECT storage_name FROM files WHERE id = ?', user.photo_file_id) : undefined;
    run(db, 'DELETE FROM sessions WHERE user_id = ?', user.id);
    run(db, 'DELETE FROM auth_tokens WHERE user_id = ?', user.id);
    run(db, 'DELETE FROM read_confirmations WHERE user_id = ?', user.id);
    const attempts = run(db, 'UPDATE quiz_attempts SET user_id = NULL WHERE user_id = ?', user.id);
    run(db, 'DELETE FROM assignments WHERE person_id = ?', user.id);
    run(
      db,
      `UPDATE users SET name = ?, email = ?, position = '', photo_file_id = NULL, start_date = NULL, birthday = NULL, show_birthday = 0,
         password_hash = NULL, password_changed_at = NULL, status = 'inactiva', deactivated_at = COALESCE(deactivated_at, ?),
         anonymized_at = ?, updated_at = ? WHERE id = ?`,
      ANONYMIZED_NAME,
      `eliminada-${user.id}@anonimizada.invalid`,
      nowIso,
      nowIso,
      nowIso,
      user.id,
    );
    if (user.photo_file_id) run(db, 'DELETE FROM files WHERE id = ?', user.photo_file_id);
    audit(
      db,
      {
        actorId: actor.id,
        action: 'persona.eliminar-datos',
        entity: 'persona',
        entityId: user.id,
        detail: `Anonimizados nombre, correo, foto y cumpleaños. Intentos de test desvinculados: ${attempts}.`,
        ip,
      },
      now,
    );
    return { user: requireUserRow(db, user.id), photoStorageName: photo?.storage_name ?? null };
  });
}

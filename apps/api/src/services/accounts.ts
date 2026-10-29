import { revokeUserSessions } from '../auth/sessions';
import type { AppContext, AuthUser } from '../context';
import { get, run, transaction, type Db } from '../db/database';
import { badRequest, conflict } from '../lib/errors';
import { issueAuthToken } from './account-tokens';
import { audit } from './audit';
import { activationEmail, activationUrl } from './emails';
import { assertNotLastAdmin, requireUserRow, type UserRow } from './people';

/**
 * Ciclo de vida de las cuentas: enlace de activación, desactivación, reactivación y
 * eliminación del perfil de quien deja FLM (su contenido se conserva sin autoría).
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

export interface RemovedProfile {
  id: string;
  /** Contenidos (de cualquier estado) que se conservan sin autoría. */
  contentsWithoutAuthor: number;
  /** Revisiones pendientes que se conservan sin autoría. */
  revisionsWithoutAuthor: number;
  /** Contenidos que revisó de los que se retira su nombre («Revisado por»): siguen constando como revisados. */
  reviewerNamesRemoved: number;
  /** Bienvenidas a la persona (publicadas o en borrador) que se borran. */
  welcomesDeleted: number;
  sessionsClosed: number;
  /** Intentos de test que se conservan como agregados anónimos. */
  attemptsAnonymized: number;
}

/**
 * «Eliminar el perfil» de una persona que deja FLM (irreversible). Exige escribir su correo como
 * confirmación explícita; nunca se aplica a la propia cuenta ni al último administrador activo.
 * En una sola transacción:
 *  - borra la fila de la persona: sus sesiones, enlaces y confirmaciones de lectura se van con ella
 *    (ON DELETE CASCADE) y su fotografía se borra;
 *  - su contenido NO se borra: formaciones, noticias, documentos, eventos… publicados, archivados o en
 *    borrador quedan sin autoría (author_id a NULL) y se firman con la firma neutra («Área X de FLM» o «FLM»);
 *  - retira su nombre de «Revisado por» en lo que revisó (por su identificador o, en anotaciones
 *    anteriores que solo guardaban el nombre, por su nombre): el contenido sigue revisado, con su fecha;
 *  - borra las bienvenidas que la anuncian (publicadas o en borrador), porque hablan de ella;
 *  - sus intentos de test se conservan como agregados anónimos (user_id a NULL);
 *  - quita su IP de la auditoría y anota `persona.eliminar-perfil` con recuentos, sin datos personales.
 * Devuelve el nombre del archivo de la foto para borrarlo del almacenamiento tras confirmar.
 */
export function removeUser(db: Db, actor: AuthUser, user: UserRow, confirmation: string, now: Date, ip?: string | null): { removed: RemovedProfile; photoStorageName: string | null } {
  if (confirmation.trim().toLowerCase() !== user.email.toLowerCase()) {
    throw badRequest('Para confirmar, escribe exactamente el correo de la persona en el campo «confirm».', undefined, 'CONFIRMACION_NO_VALIDA');
  }
  if (user.id === actor.id) throw conflict('No puedes eliminar tu propio perfil. Pídeselo a otra persona administradora.', 'AUTOELIMINACION');
  return transaction(db, () => {
    assertNotLastAdmin(db, user, 'eliminar el perfil de');
    const photo = user.photo_file_id ? get<{ storage_name: string }>(db, 'SELECT storage_name FROM files WHERE id = ?', user.photo_file_id) : undefined;
    const count = (sql: string, ...params: string[]) => get<{ n: number }>(db, sql, ...params)?.n ?? 0;

    // Las bienvenidas hablan de la persona: se borran (sus revisiones, en cascada).
    const welcomesDeleted = run(db, "DELETE FROM contents WHERE type = 'bienvenida' AND json_extract(payload, '$.personId') = ?", user.id);
    run(db, "DELETE FROM content_revisions WHERE status = 'borrador' AND json_extract(payload, '$.personId') = ? AND content_id IN (SELECT id FROM contents WHERE type = 'bienvenida')", user.id);

    const contentsWithoutAuthor = count('SELECT COUNT(*) AS n FROM contents WHERE author_id = ?', user.id);
    const revisionsWithoutAuthor = count("SELECT COUNT(*) AS n FROM content_revisions WHERE author_id = ? AND status = 'borrador'", user.id);
    // «Revisado por»: se quitan su nombre y su identificador; se conservan el estado y la fecha. Las
    // anotaciones anteriores a guardar el identificador solo tienen el nombre: se reconocen por él.
    const reviewerNamesRemoved = run(
      db,
      `UPDATE contents SET review = json_remove(review, '$.reviewerName', '$.reviewerId')
       WHERE json_extract(review, '$.reviewerId') = ? OR (json_extract(review, '$.reviewerId') IS NULL AND json_extract(review, '$.reviewerName') = ?)`,
      user.id,
      user.name,
    );
    const sessionsClosed = count('SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND revoked_at IS NULL', user.id);
    // Se hace explícito (también lo haría ON DELETE SET NULL) para dejar el recuento en la auditoría.
    const attemptsAnonymized = run(db, 'UPDATE quiz_attempts SET user_id = NULL WHERE user_id = ?', user.id);

    run(db, 'DELETE FROM users WHERE id = ?', user.id);
    if (user.photo_file_id) run(db, 'DELETE FROM files WHERE id = ?', user.photo_file_id);
    run(db, 'UPDATE audit_log SET ip = NULL WHERE actor_id = ?', user.id);

    const removed: RemovedProfile = { id: user.id, contentsWithoutAuthor, revisionsWithoutAuthor, reviewerNamesRemoved, welcomesDeleted, sessionsClosed, attemptsAnonymized };
    audit(
      db,
      {
        actorId: actor.id,
        action: 'persona.eliminar-perfil',
        entity: 'persona',
        entityId: user.id,
        detail: `Contenidos sin autoría: ${contentsWithoutAuthor}. Revisiones sin autoría: ${revisionsWithoutAuthor}. «Revisado por» retirado: ${reviewerNamesRemoved}. Bienvenidas eliminadas: ${welcomesDeleted}. Sesiones cerradas: ${sessionsClosed}. Intentos de test anonimizados: ${attemptsAnonymized}.`,
        ip,
      },
      now,
    );
    return { removed, photoStorageName: photo?.storage_name ?? null };
  });
}

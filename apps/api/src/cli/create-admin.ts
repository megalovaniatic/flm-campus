import { parseArgs } from 'node:util';
import { birthdayKey, birthdayLabel, formatLongDate, madridDateKey, startDateLimitIssue } from '@flm/shared';
import { run, transaction } from '../db/database';
import { formatIssues } from '../lib/validation';
import { createLogger } from '../lib/logger';
import { issueAuthToken, TOKEN_TTL_MS } from '../services/account-tokens';
import { audit } from '../services/audit';
import { activationEmail, activationUrl } from '../services/emails';
import { createConsoleMailer, createSmtpMailer } from '../services/mailer';
import { createUser, getUserByEmail, personCreateSchema } from '../services/people';
import { bootstrap, fail } from './common';

/**
 * Crea la primera cuenta de administración (o reemite su enlace si aún no la ha activado).
 * No hay contraseñas por defecto: se genera un enlace de activación de un solo uso (7 días)
 * con el que la persona elige su contraseña. Como en el alta desde la administración, el cumpleaños
 * (día y mes, sin año) y la fecha de incorporación son obligatorios: alimentan el calendario de empresa.
 *
 *   npm run create-admin -w @flm/api -- --email nombre@flmexperts.com --nombre "Nombre Apellido" --cumpleanos 26/11 --incorporacion 01/09/2026
 */
const HELP = `
Uso: npm run create-admin -w @flm/api -- --email <correo> --nombre "<nombre>" --cumpleanos <día/mes> --incorporacion <día/mes/año> [opciones]

  --email           Correo corporativo @flmexperts.com (obligatorio)
  --nombre          Nombre y apellidos (obligatorio)
  --cumpleanos      Día y mes del cumpleaños, sin el año de nacimiento: 26/11 (obligatorio)
  --incorporacion   Fecha de incorporación a FLM: 01/09/2026 o 2026-09-01 (obligatorio)
  --puesto          Puesto (por defecto: «Administración del campus»)
  --departamento    Fiscal, Laboral, Mercantil, Contable, Dirección, Administración, Comunicación o Sistemas (por defecto: Dirección)
  --oficina         Barcelona, Vic o Granollers (por defecto: Barcelona)

El cumpleaños y la fecha de incorporación se usan para mostrar los cumpleaños y los aniversarios de
incorporación en el calendario de empresa.
`;

const pad = (n: string) => n.padStart(2, '0');

/** «26/11» (día/mes) → «11-26». Cualquier otra forma se pasa tal cual y la rechaza la validación. */
function parseBirthdayArg(value: string): string {
  const m = /^\s*(\d{1,2})\/(\d{1,2})\s*$/.exec(value);
  return m ? birthdayKey(Number(m[1]), Number(m[2])) : value.trim();
}

/** «01/09/2026» (día/mes/año) o «2026-09-01» → «2026-09-01». */
function parseDateArg(value: string): string {
  const m = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(value);
  return m ? `${m[3]}-${pad(m[2]!)}-${pad(m[1]!)}` : value.trim();
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      nombre: { type: 'string' },
      cumpleanos: { type: 'string' },
      incorporacion: { type: 'string' },
      puesto: { type: 'string', default: 'Administración del campus' },
      departamento: { type: 'string', default: 'Dirección' },
      oficina: { type: 'string', default: 'Barcelona' },
      ayuda: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.ayuda || !values.email || !values.nombre) {
    console.log(HELP);
    if (!values.ayuda) process.exitCode = 1;
    return;
  }

  const parsed = personCreateSchema.safeParse({
    email: values.email,
    name: values.nombre,
    position: values.puesto,
    department: values.departamento,
    office: values.oficina,
    role: 'admin',
    birthday: values.cumpleanos === undefined ? undefined : parseBirthdayArg(values.cumpleanos),
    startDate: values.incorporacion === undefined ? undefined : parseDateArg(values.incorporacion),
  });
  if (!parsed.success) {
    const option: Record<string, string> = { birthday: '--cumpleanos', startDate: '--incorporacion', email: '--email', name: '--nombre', position: '--puesto', department: '--departamento', office: '--oficina' };
    fail(`Datos no válidos:\n - ${formatIssues(parsed.error).map((i) => `${option[i.path] ?? i.path}: ${i.message}`).join('\n - ')}`);
  }
  // El mismo tope que el alta desde la administración: la incorporación, como mucho, dentro de un año.
  const tooLate = startDateLimitIssue(parsed.data.startDate, madridDateKey());
  if (tooLate) fail(`Datos no válidos:\n - --incorporacion: ${tooLate}`);

  const { config, db } = bootstrap();
  const now = new Date();
  const existing = getUserByEmail(db, parsed.data.email);
  if (existing?.password_hash) fail('Esa cuenta ya está activada. Si no recuerdas la contraseña, usa «He olvidado mi contraseña» en la web.');
  if (existing && existing.role !== 'admin') fail(`La cuenta ya existe con el rol «${existing.role}». Cambia el rol desde la administración o usa otro correo.`);
  if (existing && (existing.status !== 'activa' || existing.anonymized_at)) fail('La cuenta existe pero está desactivada o anonimizada.');

  const { user, token, expiresAt } = transaction(db, () => {
    // Una cuenta pendiente creada antes de pedir estos datos: se completan los que falten (nunca se pisan).
    const completed = existing ? [...(existing.birthday ? [] : ['birthday']), ...(existing.start_date ? [] : ['startDate'])] : [];
    if (existing && completed.length) {
      run(
        db,
        'UPDATE users SET birthday = COALESCE(birthday, ?), start_date = COALESCE(start_date, ?), updated_at = ? WHERE id = ?',
        parsed.data.birthday,
        parsed.data.startDate,
        now.toISOString(),
        existing.id,
      );
      audit(db, { actorId: null, action: 'persona.editar', entity: 'persona', entityId: existing.id, detail: `Campos: ${completed.join(', ')} (create-admin)` }, now);
    }
    const user = existing ? getUserByEmail(db, parsed.data.email)! : createUser(db, parsed.data, now.toISOString());
    if (!existing) audit(db, { actorId: null, action: 'persona.alta', entity: 'persona', entityId: user.id, detail: 'Rol: admin (create-admin)' }, now);
    const issued = issueAuthToken(db, user.id, 'activacion', now.getTime(), null);
    audit(db, { actorId: null, action: 'cuenta.enlace-activacion', entity: 'persona', entityId: user.id, detail: 'create-admin' }, now);
    return { user, ...issued };
  });

  const url = activationUrl(config.appOrigin, token);
  const logger = createLogger(config.env === 'test' ? 'development' : config.env);
  const mailer = config.smtp ? createSmtpMailer(config.smtp, logger) : createConsoleMailer('production', logger);
  const sent = config.smtp ? await mailer.send(activationEmail(user.email, user.name, url)) : false;
  db.close();

  console.log(`
✔ ${existing ? 'Nuevo enlace de activación para' : 'Cuenta de administración creada para'} ${user.name} <${user.email}>
${user.birthday && user.start_date ? `\n  Calendario de empresa: cumpleaños el ${birthdayLabel(user.birthday)}; incorporación el ${formatLongDate(user.start_date)}.\n` : ''}
  Enlace de activación (un solo uso, caduca el ${expiresAt.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })},
  ${TOKEN_TTL_MS.activacion / 86_400_000} días):

  ${url}

  ${sent ? 'También se ha enviado por correo.' : 'No se ha enviado por correo (SMTP sin configurar o error de envío): entrégalo por un canal seguro.'}
  Con él, la persona elige su contraseña (mínimo 12 caracteres, con letras y números).
`);
}

main().catch((err: unknown) => fail(err instanceof Error ? err.message : String(err)));

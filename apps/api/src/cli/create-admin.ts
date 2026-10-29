import { parseArgs } from 'node:util';
import { transaction } from '../db/database';
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
 * con el que la persona elige su contraseña.
 *
 *   npm run create-admin -w @flm/api -- --email nombre@flmexperts.com --nombre "Nombre Apellido"
 */
const HELP = `
Uso: npm run create-admin -w @flm/api -- --email <correo> --nombre "<nombre>" [opciones]

  --email           Correo corporativo @flmexperts.com (obligatorio)
  --nombre          Nombre y apellidos (obligatorio)
  --puesto          Puesto (por defecto: «Administración del campus»)
  --departamento    Fiscal, Laboral, Mercantil, Contable, Dirección, Administración, Comunicación o Sistemas (por defecto: Dirección)
  --oficina         Barcelona, Vic o Granollers (por defecto: Barcelona)
`;

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      nombre: { type: 'string' },
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

  const { config, db } = bootstrap();
  const now = new Date();
  const parsed = personCreateSchema.safeParse({
    email: values.email,
    name: values.nombre,
    position: values.puesto,
    department: values.departamento,
    office: values.oficina,
    role: 'admin',
  });
  if (!parsed.success) fail(`Datos no válidos:\n - ${formatIssues(parsed.error).map((i) => `${i.path}: ${i.message}`).join('\n - ')}`);

  const existing = getUserByEmail(db, parsed.data.email);
  if (existing?.password_hash) fail('Esa cuenta ya está activada. Si no recuerdas la contraseña, usa «He olvidado mi contraseña» en la web.');
  if (existing && existing.role !== 'admin') fail(`La cuenta ya existe con el rol «${existing.role}». Cambia el rol desde la administración o usa otro correo.`);
  if (existing && (existing.status !== 'activa' || existing.anonymized_at)) fail('La cuenta existe pero está desactivada o anonimizada.');

  const { user, token, expiresAt } = transaction(db, () => {
    const user = existing ?? createUser(db, parsed.data, now.toISOString());
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

  Enlace de activación (un solo uso, caduca el ${expiresAt.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })},
  ${TOKEN_TTL_MS.activacion / 86_400_000} días):

  ${url}

  ${sent ? 'También se ha enviado por correo.' : 'No se ha enviado por correo (SMTP sin configurar o error de envío): entrégalo por un canal seguro.'}
  Con él, la persona elige su contraseña (mínimo 12 caracteres, con letras y números).
`);
}

main().catch((err: unknown) => fail(err instanceof Error ? err.message : String(err)));

import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Contraseñas con scrypt (N = 2^15, r = 8, p = 1), sal aleatoria de 16 bytes y clave de 64 bytes.
 * Formato almacenado: `scrypt$N$r$p$salBase64$claveBase64`. Los parámetros viajan con el hash
 * para poder endurecerlos en el futuro sin invalidar las contraseñas existentes.
 */
export const SCRYPT_PARAMS = { N: 2 ** 15, r: 8, p: 1, keyLength: 64, saltLength: 16 } as const;

/** scrypt con N = 2^15 y r = 8 necesita algo más de 32 MiB (el límite por defecto de Node). */
const MAX_MEM = 64 * 1024 * 1024;

function scrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password.normalize('NFKC'), salt, keyLength, options, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const { N, r, p, keyLength, saltLength } = SCRYPT_PARAMS;
  const salt = randomBytes(saltLength);
  const key = await scrypt(password, salt, keyLength, { N, r, p, maxmem: MAX_MEM });
  return ['scrypt', N, r, p, salt.toString('base64'), key.toString('base64')].join('$');
}

interface ParsedHash {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  key: Buffer;
}

function parseHash(stored: string): ParsedHash | null {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return null;
  const [N, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
  // Límites defensivos: un hash manipulado no debe poder agotar memoria o CPU.
  if (!Number.isInteger(N) || N < 2 ** 14 || N > 2 ** 20 || (N & (N - 1)) !== 0) return null;
  if (!Number.isInteger(r) || r < 1 || r > 32 || !Number.isInteger(p) || p < 1 || p > 16) return null;
  const salt = Buffer.from(parts[4] ?? '', 'base64');
  const key = Buffer.from(parts[5] ?? '', 'base64');
  if (salt.length < 16 || key.length < 32) return null;
  return { N, r, p, salt, key };
}

/** Verifica una contraseña en tiempo constante respecto al hash almacenado. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;
  const { N, r, p, salt, key } = parsed;
  const candidate = await scrypt(password, salt, key.length, { N, r, p, maxmem: Math.max(MAX_MEM, 256 * N * r) });
  return candidate.length === key.length && timingSafeEqual(candidate, key);
}

/** Indica si el hash se creó con parámetros distintos de los vigentes (se rehace al iniciar sesión). */
export function needsRehash(stored: string): boolean {
  const parsed = parseHash(stored);
  return !parsed || parsed.N !== SCRYPT_PARAMS.N || parsed.r !== SCRYPT_PARAMS.r || parsed.p !== SCRYPT_PARAMS.p || parsed.key.length !== SCRYPT_PARAMS.keyLength;
}

let dummyHash: Promise<string> | undefined;

/**
 * Hace el mismo trabajo que una verificación real cuando la cuenta no existe o no está activada,
 * para que el tiempo de respuesta no revele qué correos están registrados.
 */
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= hashPassword(randomBytes(18).toString('base64'));
  await verifyPassword(password, await dummyHash);
  return false;
}

import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';

/** Token aleatorio de 32 bytes en base64url (43 caracteres). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** Hash SHA-256 en hexadecimal: es lo único que se guarda de los tokens de sesión y de los enlaces. */
export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/** Comparación en tiempo constante de dos cadenas. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export const newId = (): string => randomUUID();

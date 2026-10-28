import type { Role } from '@flm/shared';
import type { CookieNames } from './auth/cookies';
import type { SessionRow } from './auth/sessions';
import type { AppConfig } from './config';
import type { Db } from './db/database';
import type { Logger } from './lib/logger';
import type { RateLimiter } from './middleware/rate-limit';
import type { FileStorage } from './services/files';
import type { Mailer } from './services/mailer';

/** Persona autenticada en la petición en curso. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface SessionProblem {
  code: string;
  message: string;
}

/** Tipos del contexto de Hono: variables por petición y enlaces del servidor Node. */
export type AppEnv = {
  Bindings: {
    incoming?: { socket?: { remoteAddress?: string } };
  };
  Variables: {
    requestId: string;
    clientIp: string;
    user: AuthUser | null;
    session: SessionRow | null;
    sessionProblem: SessionProblem | null;
  };
};

/** Dependencias que recibe la aplicación (se sustituyen en las pruebas). */
export interface AppDeps {
  config: AppConfig;
  db: Db;
  mailer: Mailer;
  logger: Logger;
  /** Reloj inyectable: las pruebas lo adelantan para comprobar caducidades. */
  now: () => Date;
  limiter?: RateLimiter;
}

/** Contexto compartido por rutas y servicios. */
export interface AppContext extends AppDeps {
  limiter: RateLimiter;
  cookies: CookieNames;
  storage: FileStorage;
}

import { createTransport } from 'nodemailer';
import type { NodeEnv, SmtpConfig } from '../config';
import { errorDetail, type Logger } from '../lib/logger';

/**
 * Envío de correo. En producción se usa SMTP (nodemailer); sin SMTP configurado, los mensajes
 * no se envían y quien administra recibe el enlace en la respuesta para entregarlo en mano.
 */
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  /** true si hay un servidor SMTP configurado. */
  readonly configured: boolean;
  /** Devuelve true si el mensaje se entregó al servidor de correo. Nunca lanza. */
  send(message: MailMessage): Promise<boolean>;
}

export function createSmtpMailer(smtp: SmtpConfig, logger: Logger): Mailer {
  const transporter = createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    requireTLS: !smtp.secure,
    auth: smtp.user && smtp.pass ? { user: smtp.user, pass: smtp.pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return {
    configured: true,
    async send(message) {
      try {
        await transporter.sendMail({ from: smtp.from, ...message });
        return true;
      } catch (err) {
        logger.error('No se ha podido enviar un correo', { subject: message.subject, ...errorDetail(err) });
        return false;
      }
    },
  };
}

/**
 * Sin SMTP: en desarrollo muestra el mensaje en la consola (para probar los enlaces);
 * en producción solo deja constancia de que no se ha enviado, sin el contenido (contiene enlaces secretos).
 */
export function createConsoleMailer(env: NodeEnv, logger: Logger): Mailer {
  return {
    configured: false,
    async send(message) {
      if (env === 'development') {
        logger.info(`Correo (no enviado, SMTP sin configurar) para ${message.to}: ${message.subject}\n${message.text}`);
      } else {
        logger.warn('Correo no enviado: SMTP sin configurar', { subject: message.subject });
      }
      return false;
    },
  };
}

/** Buzón en memoria para las pruebas. */
export class MemoryMailer implements Mailer {
  readonly configured = true;
  readonly outbox: MailMessage[] = [];
  async send(message: MailMessage): Promise<boolean> {
    this.outbox.push(message);
    return true;
  }
  last(to?: string): MailMessage | undefined {
    return [...this.outbox].reverse().find((m) => !to || m.to === to);
  }
}

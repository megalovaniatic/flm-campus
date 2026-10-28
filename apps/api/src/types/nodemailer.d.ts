/**
 * Tipos mínimos de nodemailer 10 (el paquete no publica tipos propios y @types/nodemailer
 * arrastra otra versión de @types/node). Solo se declara lo que usa `services/mailer.ts`.
 */
declare module 'nodemailer' {
  export interface SmtpTransportOptions {
    host: string;
    port: number;
    secure: boolean;
    auth?: { user: string; pass: string };
    requireTLS?: boolean;
    connectionTimeout?: number;
    greetingTimeout?: number;
    socketTimeout?: number;
  }

  export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
  }

  export interface Transporter {
    sendMail(options: MailOptions): Promise<{ messageId?: string }>;
    verify(): Promise<true>;
    close(): void;
  }

  export function createTransport(options: SmtpTransportOptions): Transporter;
}

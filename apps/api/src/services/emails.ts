import type { MailMessage } from './mailer';

/**
 * Plantillas de correo (texto plano). Los enlaces van a las páginas de la web, que usa rutas en el
 * fragmento (`#/activar?token=…`): el token no se envía al servidor ni aparece en registros de acceso
 * o en la cabecera Referer. La web lo lee, lo quita de la barra de direcciones y lo envía a la API.
 */
export const activationUrl = (origin: string, token: string) => `${origin}/#/activar?token=${token}`;
export const resetUrl = (origin: string, token: string) => `${origin}/#/restablecer-contrasena?token=${token}`;

const signature = '\n\n—\nFLM Campus · Plataforma interna de formación de FLM\nEste mensaje se ha generado automáticamente; no respondas a esta dirección.';

export function activationEmail(to: string, name: string, url: string): MailMessage {
  return {
    to,
    subject: 'Activa tu cuenta de FLM Campus',
    text:
      `Hola, ${name}:\n\n` +
      'Se ha creado tu cuenta en FLM Campus. Para activarla, abre este enlace y elige tu contraseña ' +
      '(al menos 12 caracteres, con letras y números):\n\n' +
      `${url}\n\n` +
      'El enlace es personal, sirve una sola vez y caduca dentro de 7 días. Si caduca, pide uno nuevo a administración.' +
      signature,
  };
}

export function resetEmail(to: string, name: string, url: string): MailMessage {
  return {
    to,
    subject: 'Restablece tu contraseña de FLM Campus',
    text:
      `Hola, ${name}:\n\n` +
      'Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si has sido tú, abre este enlace:\n\n' +
      `${url}\n\n` +
      'El enlace sirve una sola vez y caduca dentro de 30 minutos. Al cambiar la contraseña se cerrarán todas tus sesiones abiertas.\n\n' +
      'Si no lo has solicitado, ignora este mensaje: tu contraseña actual sigue siendo válida.' +
      signature,
  };
}

export function passwordChangedEmail(to: string, name: string): MailMessage {
  return {
    to,
    subject: 'Tu contraseña de FLM Campus ha cambiado',
    text:
      `Hola, ${name}:\n\n` +
      'Te confirmamos que la contraseña de tu cuenta de FLM Campus acaba de cambiar y que se han cerrado tus otras sesiones.\n\n' +
      'Si no has sido tú, avisa cuanto antes a administración o al equipo de Sistemas.' +
      signature,
  };
}

/**
 * Microcopia de estados y errores. Regla: qué ha pasado + qué puedes hacer,
 * sin culpar a la persona y conservando lo que haya escrito.
 */
export const MESSAGES = {
  emptySearch: {
    title: 'No hemos encontrado nada con esas palabras',
    body: (q: string) => `Prueba con otra palabra o con menos términos. Por ejemplo, en lugar de «${q}», busca solo su parte más característica.`,
  },
  emptyFilter: {
    title: 'No hay resultados con estos filtros',
    body: 'Quita algún filtro para ver más contenido.',
  },
  missingDocument: {
    title: 'Este documento ya no está disponible',
    body: 'Puede que se haya archivado o sustituido por una versión nueva. Búscalo en la biblioteca o consulta al área responsable.',
  },
  internalOnly: 'Disponible en la versión interna del campus.',
  unsupportedFile: (name: string) => `«${name}» no es un tipo de archivo admitido. Sube un PDF (o una imagen JPG, PNG o WebP para eventos).`,
  oversized: (name: string, max: string) => `«${name}» supera el tamaño máximo de ${max}. Reduce su tamaño o divídelo y vuelve a intentarlo.`,
  invalidFields: (n: number) => (n === 1 ? 'Revisa el campo marcado antes de continuar.' : `Revisa los ${n} campos marcados antes de continuar.`),
  required: (label: string) => `Indica ${label.toLowerCase()}.`,
  sessionExpired: {
    title: 'Tu sesión ha caducado',
    body: 'Por seguridad, cerramos la sesión tras un tiempo sin actividad. Vuelve a entrar: lo que estabas escribiendo sigue guardado en este dispositivo.',
  },
  forbidden: {
    title: 'No tienes permiso para ver esta sección',
    body: (role: string) => `Esta sección está reservada al perfil «${role}». Si crees que deberías tener acceso, escribe a administración del campus.`,
  },
  saveFailed: {
    title: 'No se ha podido guardar',
    body: 'Tus cambios siguen en este dispositivo. Revisa la conexión y pulsa «Reintentar».',
  },
  offline: 'Sin conexión. Puedes seguir leyendo; guardaremos tus cambios en este dispositivo y los enviaremos al recuperar la conexión.',
  backOnline: 'Conexión recuperada.',
  unsavedChanges: 'Tienes cambios sin guardar. Si sales ahora, se perderán los que no estén guardados como borrador.',
  notFound: {
    title: 'Esta página no existe o ya no está aquí',
    body: 'Puede que el enlace sea antiguo o tenga un error. Busca lo que necesitas o vuelve al inicio.',
  },
  demoSimulated: 'Simulación: en la demostración pública este cambio solo se guarda en tu navegador. En la versión interna lo ejecuta el servidor con permisos.',
};

# Política de retención de datos · FLM Campus

Esta política describe qué datos personales trata la plataforma interna de formación de FLM,
durante cuánto tiempo se conservan y cómo se eliminan. Aplica a la API de producción
(`apps/api`) y a sus copias de seguridad. La purga automática la ejecuta el servidor al arrancar
y después una vez al día (`src/services/retention.ts`).

> Documento técnico de referencia. La base jurídica, el registro de actividades de tratamiento y
> la información a la plantilla corresponden a la persona responsable de protección de datos de FLM.

## 1. Principios

- **Minimización.** Solo se guarda lo necesario para el trabajo y la formación: nombre, correo
  corporativo, puesto, departamento, oficina, rol y, si la persona la sube, su foto. El campus no
  guarda cumpleaños ni fechas de incorporación, y el calendario solo muestra festivos y encuentros
  de equipo. En una base anterior, la migración `0002` elimina esas columnas con sus datos (y las
  preferencias de cumpleaños anotadas en la auditoría) al arrancar el servidor.
- **Finalidad formativa.** Las formaciones del campus son voluntarias: no hay asignaciones, fechas
  límite ni avisos de plazos. Cada persona ve su propio progreso; administración solo consulta
  informes agregados y sin nombres (participación por formación y errores frecuentes por pregunta).
- **Seguridad.** Las contraseñas se guardan con scrypt; los tokens de sesión y los enlaces de un
  solo uso, únicamente como hash SHA-256. Los archivos subidos se guardan con nombres aleatorios
  fuera de cualquier ruta pública.
- **Trazabilidad sin datos personales.** El registro de auditoría guarda identificadores, no
  nombres ni correos, para que la anonimización de una persona no deje rastros legibles.

## 2. Plazos de conservación

| Dato | Plazo | Qué ocurre al vencer |
| --- | --- | --- |
| Sesiones | 12 h sin actividad o 14 días desde el inicio (lo que llegue antes) | Dejan de ser válidas al momento; la purga diaria las borra pasado **1 día** (margen para mostrar a la persona por qué se cerró su sesión). |
| Sesiones cerradas (cierre, revocación, cambio de rol o de contraseña, baja) | Inmediato | Se borran en la purga diaria pasado 1 día. |
| Enlaces de activación | 7 días, un solo uso | Se borran en la purga diaria una vez usados o caducados. |
| Enlaces de recuperación de contraseña | 30 minutos, un solo uso | Ídem. Restablecer la contraseña cierra todas las sesiones. |
| Registro de auditoría | **2 años** | Se borran las entradas con más de 730 días. |
| Intentos de test y confirmaciones de lectura | Mientras la persona esté activa y **1 año tras su baja** | Pasado el año, los intentos se **desvinculan** de la persona (se conservan como agregados anónimos para los informes de errores frecuentes) y las confirmaciones de lectura se borran. El informe de participación solo cuenta a las personas activas. |
| Ficha de la persona (nombre, correo, foto, puesto…) | Mientras haya relación con FLM | Tras la baja, administración debe ejecutar la **eliminación controlada de datos** (ver § 3). El listado de personas marca con `retentionReviewDue` las cuentas desactivadas hace más de un año que aún no se han anonimizado. |
| Fotografías de perfil | Mientras la persona no la sustituya o elimine | Al sustituirla, la anterior se borra (no se versiona). Se borra al anonimizar. |
| Contenidos editoriales y documentos de la biblioteca | Indefinido (patrimonio documental de la firma) | Se archivan, no se borran. La autoría de una persona anonimizada aparece como «Persona eliminada». |
| Copias de seguridad | Según la rotación configurada (`npm run backup -- --conservar N`) | Recomendado: 14 copias diarias. Una anonimización no se propaga a copias anteriores: al restaurar una copia hay que repetir las anonimizaciones posteriores a su fecha (constan en la auditoría). |
| Límites de frecuencia (IP y correo) | En memoria, máximo 1 hora | Se pierden al reiniciar el servidor. |

## 3. Eliminación controlada de datos personales

`POST /api/people/:id/anonymize` (permiso `datos-personales:eliminar`, solo administración):

1. Exige confirmación explícita: el campo `confirm` debe contener el correo de la persona.
2. No se puede aplicar a la propia cuenta ni al último administrador activo.
3. En una única transacción:
   - sustituye el nombre por «Persona eliminada» y el correo por una dirección no identificativa
     (`eliminada-<id>@anonimizada.invalid`);
   - borra el puesto y la contraseña;
   - borra la fotografía (registro y archivo físico);
   - borra sesiones, enlaces pendientes y confirmaciones de lectura;
   - desvincula los intentos de test (quedan como agregados anónimos);
   - deja la cuenta desactivada y anota `persona.eliminar-datos` en la auditoría (sin datos personales).
4. La operación es irreversible. Si la persona vuelve a FLM, se le crea una cuenta nueva.

## 4. Derechos de las personas

- **Acceso:** `GET /api/me` (perfil), `GET /api/me/progress` y `GET /api/me/attempts` (historial
  propio de intentos con fecha, versión, respuestas y aciertos).
- **Rectificación:** administración edita la ficha; cada persona gestiona su foto.
- **Supresión:** eliminación controlada del § 3, a petición de la persona o al vencer el plazo.

## 5. Copias de seguridad y restauración

Las copias (`VACUUM INTO`) contienen datos personales: deben guardarse cifradas, fuera del
servidor y con acceso restringido. El procedimiento de restauración está en el README de la API.
Las copias hechas antes de la migración `0002` aún guardan cumpleaños y fechas de incorporación
hasta que salen de la rotación; si se restaura una, el servidor vuelve a aplicar las migraciones
pendientes al arrancar y los elimina de nuevo.

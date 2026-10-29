# FLM Campus · API de producción (`@flm/api`)

API privada de la plataforma interna de formación de FLM (≈ 50 personas). Sirve las cuentas,
sesiones, contenidos editoriales, aprendizaje, biblioteca, vida de empresa, informes y
auditoría, y puede servir también la web compilada desde el mismo origen.

Las reglas de negocio **no se duplican**: permisos (`can()`, `checkTransition()`, `canHandleType()`), corrección de
tests (`gradeQuiz()`), estados de aprendizaje (`formationStatus()`), errores frecuentes
(`commonErrors()`), fases de eventos (`eventPhase()`), calendario (`entriesForMonth()`) y
esquemas zod se importan de `@flm/shared`, igual que en la demo pública.

## Índice

1. [Arquitectura](#1-arquitectura)
2. [Puesta en marcha (desarrollo)](#2-puesta-en-marcha-desarrollo)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Contrato con la web](#4-contrato-con-la-web)
5. [Endpoints y permisos](#5-endpoints-y-permisos)
6. [Seguridad](#6-seguridad)
7. [Despliegue](#7-despliegue)
8. [Copias de seguridad y restauración](#8-copias-de-seguridad-y-restauración)
9. [Datos semilla](#9-datos-semilla)
10. [Configuración externa necesaria](#10-configuración-externa-necesaria)
11. [Limitaciones conocidas](#11-limitaciones-conocidas)

## 1. Arquitectura

| Pieza | Elección |
| --- | --- |
| HTTP | [Hono](https://hono.dev) + `@hono/node-server` (Node 24) |
| Base de datos | SQLite con `node:sqlite` (`DatabaseSync`), modo WAL, migraciones SQL versionadas |
| Validación | zod 4 (esquemas de `@flm/shared`, mensajes en castellano con `z.locales.es`) |
| Correo | nodemailer (SMTP) |
| Empaquetado | esbuild → `dist/*.mjs` autocontenidos (sin `node_modules` en producción) |
| Pruebas | Vitest con `app.request()` (sin red) y SQLite en memoria |

```
apps/api/
├─ src/
│  ├─ app.ts               createApp(deps): middlewares y rutas (sin E/S propia: testeable)
│  ├─ server.ts            arranque: configuración, migraciones, purga diaria, servidor HTTP
│  ├─ config.ts            variables de entorno validadas con zod
│  ├─ context.ts           tipos del contexto (AppEnv, AppDeps, AppContext)
│  ├─ web.ts               web compilada desde el mismo origen con fallback SPA
│  ├─ db/                  database.ts (helpers, transacciones), migrate.ts, migrations/NNNN_….sql
│  ├─ auth/                passwords (scrypt), tokens (SHA-256), sessions, cookies
│  ├─ middleware/          request-context (IP, registro), security-headers, rate-limit,
│  │                       session, csrf, authorize (matriz de permisos), errors (413/404/500)
│  ├─ services/            people, accounts, account-tokens, content (flujo editorial),
│  │                       learning, reports, files, audit, retention, backup, seed,
│  │                       mailer, emails
│  ├─ routes/              auth, people, contents, learning, library, company, admin
│  ├─ lib/                 errors (HttpError), validation (zod), csv, logger
│  └─ cli/                 create-admin, seed, backup (+ load-content.mjs)
├─ test/                   pruebas Vitest y fixture propio (test/fixtures/seed.ts)
├─ scripts/build.mjs       compilación con esbuild
├─ docs/retencion-datos.md política de retención
├─ Dockerfile, docker-entrypoint.sh, docker-compose.example.yml, Caddyfile.example
└─ .env.example
```

**Modelo de datos.** `users` (ficha profesional y, para el calendario de empresa, el cumpleaños
—solo día y mes, `MM-DD`— y la fecha de incorporación, `AAAA-MM-DD`; opcionales en la base de datos
para los perfiles anteriores, obligatorios en el alta), `sessions`, `auth_tokens` (activación y
recuperación), `contents` (tabla genérica:
tipo —formación, evaluación del área, noticia, documento, evento, comunicado, cliente nuevo o
bienvenida—, estado editorial —borrador, publicado o archivado—, autoría opcional, `payload` JSON
validado con el esquema del tipo, número de revisión para concurrencia), `content_revisions`
(cambios guardados sobre contenido publicado, que no se ven hasta publicarlos),
`document_versions` + `files` (biblioteca; el PDF nuevo de un documento publicado espera en su
revisión, `revision_id`, hasta publicarla), `read_confirmations`, `quiz_attempts`, `holidays`,
`readings` y `audit_log`. La autoría (`contents.author_id`, `content_revisions.author_id` y
`decided_by`) es opcional: al eliminar el perfil de una persona pasa a `NULL` (`ON DELETE SET
NULL`) y el contenido se conserva con una firma neutra.

**Esquema.** Las migraciones (`src/db/migrations/NNNN_descripcion.sql`) se aplican solas al
arrancar, una sola vez y en orden; una migración publicada no se edita, se añade otra:

| Versión | Migración | Qué hace |
| --- | --- | --- |
| 1 | `0001_esquema_inicial.sql` | Esquema inicial |
| 2 | `0002_sin_cumpleanos_ni_incorporacion.sql` | Quita de `users` el cumpleaños, su consentimiento y la fecha de incorporación (con sus datos) y borra de la auditoría las preferencias de cumpleaños |
| 3 | `0003_formaciones_voluntarias.sql` | Elimina la tabla de asignaciones de formaciones y sus fechas límite: todas las formaciones son voluntarias |
| 4 | `0004_creador_y_autoria_opcional.sql` | Flujo sin revisión previa (lo que estaba «en revisión» vuelve a borrador y desaparece el comentario de devolución), tipos `cliente` y `bienvenida` del tablero «Ponte al día», autoría opcional (`author_id` y `decided_by` con `ON DELETE SET NULL`) y las cuentas anonimizadas por versiones anteriores pasan a ser perfiles eliminados. Reconstruye `contents` y `content_revisions` |
| 5 | `0005_pdf_pendiente_en_revision.sql` | `document_versions.revision_id`: el PDF nuevo de un documento publicado espera en su revisión pendiente (no se ve en el campus) y pasa a ser la versión vigente al publicarla; si la revisión se descarta, se borra con su archivo |
| 6 | `0006_cumpleanos_e_incorporacion.sql` | Vuelven a `users` el cumpleaños (`birthday`, `MM-DD`, sin año) y la fecha de incorporación (`start_date`, `AAAA-MM-DD`) para el calendario de empresa: opcionales, vacías (lo que borró la 0002 no se recupera y nada se rellena por defecto) y con un `CHECK` que exige una fecha que exista con ese formato. Sin el consentimiento (`show_birthday`) de la versión 1 |

Una migración que reconstruye tablas con claves foráneas (crear la nueva, copiar, borrar la antigua
y renombrar) empieza por la línea `-- flm:sin-claves-foraneas`. El migrador desactiva entonces las
claves foráneas **fuera** de la transacción (con ellas activas, `DROP TABLE` borraría en cascada las
filas que dependen de la tabla), comprueba `PRAGMA foreign_key_check` antes de confirmar y las vuelve
a activar al terminar, también si falla. Dos archivos con la misma versión detienen el arranque con
un error: uno de los dos se saltaría para siempre.

## 2. Puesta en marcha (desarrollo)

```powershell
npm install                                   # en la raíz del monorepo
Copy-Item apps/api/.env.example apps/api/.env # y ajusta APP_ORIGIN si hace falta
npm run create-admin -w @flm/api -- --email nombre@flmexperts.com --nombre "Nombre Apellido" --cumpleanos 26/11 --incorporacion 01/09/2026
npm run seed -w @flm/api                      # opcional: contenido de @flm/content
npm run dev -w @flm/api                       # http://127.0.0.1:3000
```

| Script | Qué hace |
| --- | --- |
| `dev` | Servidor con recarga (tsx watch) |
| `build` | Compila `dist/server.mjs`, `dist/create-admin.mjs`, `dist/seed.mjs`, `dist/backup.mjs` y copia `dist/migrations/` |
| `start` | Ejecuta `dist/server.mjs` |
| `typecheck` | `tsc --noEmit` |
| `test` | Pruebas Vitest |
| `seed` | Carga `seed` de `@flm/content` (avisa si no existe) |
| `create-admin` | Primera cuenta de administración (enlace de activación; sin contraseñas por defecto). Como el alta, exige `--cumpleanos <día/mes>` (sin año) y `--incorporacion <día/mes/año>` (o `AAAA-MM-DD`); a una cuenta pendiente que no los tenía se los completa, sin pisar los que ya constan |
| `backup` | Copia fechada con `VACUUM INTO` (`-- --archivos`, `-- --conservar 14`, `-- --destino <dir>`) |

En desarrollo la web (Vite, puerto 5173) debe llamar a la API **desde su mismo origen**: basta con
un proxy en `apps/web/vite.config.ts` (`server.proxy: { '/api': 'http://127.0.0.1:3000' }`) y
`APP_ORIGIN=http://localhost:5173`. No hace falta CORS.

## 3. Variables de entorno

| Variable | Por defecto | Descripción |
| --- | --- | --- |
| `NODE_ENV` | `development` | `production` activa HSTS, cookies `Secure` y exige `APP_ORIGIN` https, `DATABASE_PATH` y `STORAGE_DIR` |
| `PORT` | `3000` | Puerto HTTP |
| `HOST` | `127.0.0.1` (`0.0.0.0` en producción) | Interfaz de escucha |
| `APP_ORIGIN` | `http://localhost:5173` | Origen público de la web; se usa para la comprobación de `Origin` y en los enlaces de los correos |
| `DATABASE_PATH` | `./data/campus.sqlite` | Archivo SQLite |
| `STORAGE_DIR` | `./storage` | Archivos subidos (privado) |
| `BACKUP_DIR` | `./backups` | Destino de `npm run backup` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | — | Correo saliente. Sin `SMTP_HOST` no se envía nada (ver § 10) |
| `TRUST_PROXY` | `false` | `true` (= 1 proxy) o número de proxies de confianza para leer la IP de `X-Forwarded-For` |
| `SERVE_WEB_DIST` | `false` | `true` (= `../web/dist`) o ruta de la web compilada |

La API carga `apps/api/.env` si existe; en producción se recomiendan variables reales del servicio.

## 4. Contrato con la web

- **Formato de error** (siempre): `{ "error": { "code": "SESION_CADUCADA", "message": "…", "details"?: […] } }`.
  `message` está en castellano y se puede mostrar tal cual; `details` lista `{ path, message }`
  en los errores de validación (400).
- **Arranque:** `GET /api/session` devuelve `authenticated`, la persona, sus permisos y el
  `csrfToken`. Sin sesión devuelve un token CSRF previo (y una cookie `__Host-flm_csrf`) y, si la
  sesión anterior caducó o se cerró, `reason: { code, message }`. La persona lleva su cumpleaños
  (`birthday`) y su fecha de incorporación (`startDate`) si constan, y `missingPersonalDates` con los que
  faltan (`["birthday", "startDate"]` en los perfiles anteriores a pedirlos): la web los pide con
  `PATCH /api/me/personal-dates`, **sin bloquear el acceso**.
- **CSRF:** toda petición `POST`, `PUT`, `PATCH` o `DELETE` debe llevar `X-CSRF-Token` con el
  último `csrfToken` recibido (el inicio de sesión, la activación y el cambio de contraseña
  devuelven uno nuevo) y salir del mismo origen (`fetch` con `credentials: 'same-origin'`).
- **Sesión caducada:** 401 con `code` `SESION_CADUCADA` (12 h sin actividad o 14 días),
  `SESION_CERRADA` (cerrada, revocada, cambio de rol o de contraseña) o `NO_AUTENTICADO`.
- **Concurrencia editorial:** `PUT /api/contents/:id` y las transiciones exigen `revision` (el
  número recibido al cargar). Si otra persona guardó antes: 409 `CONFLICTO_REVISION`.
- **Enlaces de correo:** la web debe implementar `/activar` y `/restablecer-contrasena`, leer el
  token de `location.hash` (`#token=…`, nunca viaja al servidor en la URL) y enviarlo a
  `POST /api/auth/activate` o `POST /api/auth/password/reset`.
- **Archivos:** formularios `multipart/form-data` con el campo `archivo` (y `datos` JSON para
  documentos nuevos, `nota` opcional para versiones). Las URL de archivo (`/api/files/:id`) solo
  funcionan con sesión.
- **CSP de la web servida:** `script-src 'self'; style-src 'self'` → sin scripts ni estilos en
  línea en `index.html` (los estilos que React aplica por JS sí funcionan); imágenes de `'self'`,
  `data:` y `blob:`.

## 5. Endpoints y permisos

Los permisos son los de `@flm/shared/permissions.ts` (empleado ⊂ autor ⊂ admin). Todas las rutas no
públicas exigen sesión; las pruebas recorren `app.routes` para comprobar que ninguna queda abierta.

**Públicas**

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado (Docker, Render, Fly.io) |
| GET | `/api/session` | Sesión actual y token CSRF |
| POST | `/api/auth/login` | Inicio de sesión (rota la sesión) |
| POST | `/api/auth/activation/check` | Comprueba un enlace de activación |
| POST | `/api/auth/activate` | Activa la cuenta y fija la contraseña (inicia sesión) |
| POST | `/api/auth/password/forgot` | Solicita recuperación (respuesta genérica, 202) |
| POST | `/api/auth/password/reset` | Restablece con el enlace (cierra todas las sesiones) |

**Cuenta y progreso propios**

| Método | Ruta | Permiso |
| --- | --- | --- |
| POST | `/api/auth/logout` | `campus:leer` |
| POST | `/api/auth/password/change` | `campus:leer` (exige la contraseña actual) |
| GET | `/api/sessions` · POST `/api/sessions/revoke-others` · DELETE `/api/sessions/:id` | `campus:leer` (solo las propias) |
| GET | `/api/me` (ficha propia y `missingPersonalDates`) | `campus:leer` |
| PUT · DELETE | `/api/me/photo` | `progreso:propio` |
| PATCH | `/api/me/personal-dates` `{ birthday?, startDate? }` (completar los datos del calendario: el cumpleaños se puede corregir; la incorporación, solo indicar si falta) | `progreso:propio` |
| GET | `/api/me/progress` · `/api/me/attempts` | `progreso:propio` |

**Datos del calendario de la ficha propia.** `PATCH /api/me/personal-dates` deja completar lo que falte
sin pasar por administración y sin bloquear nada: el cumpleaños (`MM-DD`, nunca el año) se puede indicar
o corregir; la fecha de incorporación (`AAAA-MM-DD`) solo se indica si aún no consta (otra distinta: 409
`INCORPORACION_YA_INDICADA`; la corrige administración). Exige al menos uno de los dos (400 `VALIDACION`)
y, como toda escritura, sesión, token CSRF y origen. Responde `{ person, missingPersonalDates, changed }`
y anota `perfil.fechas` en la auditoría con los campos cambiados (`Campos: birthday`), nunca las fechas.

**Aprendizaje**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/formations` · `/api/formations/:idOSlug` | `campus:leer` (test sin soluciones) |
| POST | `/api/formations/:ref/read` | `progreso:propio` |
| POST · GET | `/api/formations/:ref/attempts` | `progreso:propio` (corrección en el servidor) |
| GET | `/api/assessments` · `/api/assessments/:id` | `campus:leer` |
| POST · GET | `/api/assessments/:id/attempts` | `progreso:propio` |

Todas las formaciones son voluntarias: no hay asignaciones ni fechas límite. `GET /api/me/progress`
devuelve el progreso propio en cada formación publicada (`formations`), sin más.

**Contenidos (panel editorial)**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/contents?type&status&authorId&q` | `contenido:crear` (autor: solo los suyos de los tipos de su rol; administración: todos, también los que no tienen autoría) |
| POST | `/api/contents` `{ type, payload }` | `contenido:crear` + `canHandleType(rol, tipo)` (la evaluación del área, `test`, solo administración; los documentos se crean con `POST /api/documents`). Crea el primer borrador, que puede estar a medias |
| GET | `/api/contents/:id` · `/preview` · `/revisions` | `contenido:crear` + `canHandleType` + propiedad (o `contenido:editar-cualquiera`) |
| PUT | `/api/contents/:id` `{ revision, payload }` | «Guardar borrador» (`canHandleType` + `checkTransition('guardar')`), con el esquema laxo. Si está publicado, guarda una revisión (borrador) que no cambia la versión pública hasta publicarla |
| POST | `/api/contents/:id/transitions` `{ action, revision, reviewed? }` | `canHandleType` + `checkTransition(action)`: `publicar` (la autoría, lo suyo; administración, cualquier contenido; si hay una revisión pendiente, publica la revisión), `archivar` y `restaurar` (administración). Publicar exige el esquema completo. `reviewed: true` anota «Revisado por …» (nombre e identificador de quien publica); publicar cambios de algo publicado sin `reviewed` deja la revisión pendiente |
| DELETE | `/api/contents/:id/revision?revision=` | `canHandleType` + propiedad o `contenido:editar-cualquiera` (descarta la revisión pendiente y el PDF nuevo que esperaba en ella) |
| DELETE | `/api/contents/:id?revision=` | `canHandleType` + propiedad o `contenido:editar-cualquiera`; solo borradores nunca publicados |

No hay revisión previa ni cola de revisión: los estados son `borrador`, `publicado` y `archivado`.
El tipo se comprueba en cada acción, no solo al crear: tras un cambio de rol, la evaluación del área
sigue siendo de administración aunque figure como propia (403 `SIN_PERMISO`).

**Borradores y publicación.** «Guardar borrador» (crear, `PUT` y los cambios de algo publicado) valida
una versión laxa del esquema del tipo: la misma forma (los campos desconocidos se descartan y la
bienvenida sigue sin admitir campos de más), los mismos tipos, valores de las listas cerradas,
formatos (enlaces, fechas, slugs) y longitudes máximas, pero todos los campos son opcionales, un texto
vacío cuenta como campo sin rellenar y no hay mínimos (de caracteres ni de elementos) ni reglas de
publicación (las 3 preguntas del test final, el ejemplo realista…). Publicar valida el esquema
completo (400 `VALIDACION` con la ruta de cada campo). Un borrador sin slug no ocupa ninguna dirección;
su ficha y su vista previa funcionan aunque esté a medias (un evento sin sesiones queda como próximo).

Los errores del flujo salen del código estable de `checkTransition()`: 403 `SIN_PERMISO` (el rol no
permite la acción o no trabaja con ese tipo), 403 `SOLO_LO_PROPIO` (contenido de otra persona o sin
autoría, sin `contenido:editar-cualquiera`) y 409 `TRANSICION_NO_VALIDA` (la acción no se aplica a
ese estado); además, 409 `REVISION_PENDIENTE` al archivar algo con una revisión sin publicar ni
descartar y 409 `CONFLICTO_REVISION` si otra persona guardó antes. Reglas entre contenidos (al crear,
al guardar lo ya rellenado y otra vez al publicar):

- **Slugs:** únicos por tipo, salvo eventos y comunicados, que comparten la dirección de la agenda
  (`/participar/agenda/:slug`) y, por tanto, un solo espacio de slugs: 409 `SLUG_DUPLICADO`.
- **Evaluación del área:** como mucho una vigente (no archivada, borradores incluidos) por área: 409
  `EVALUACION_DUPLICADA` al crear otra, al cambiar de área, al publicar o al restaurar una archivada.
  Archivada, deja de verse en `/api/assessments`.
- **Bienvenidas:** una por persona activa: 400 `PERSONA_NO_DISPONIBLE` y 409 `BIENVENIDA_DUPLICADA`; su
  título en `contents.title` es siempre «Bienvenida al equipo», nunca el nombre de la persona.

**Biblioteca y archivos**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/news` · `/api/news/:ref` · `/api/readings` | `campus:leer` |
| GET | `/api/documents` · `/api/documents/:id` | `campus:leer` (publicados) |
| POST | `/api/documents` (PDF ≤ 15 MB + `datos`) | `contenido:crear` + `documentos:subir` (borrador, que puede estar a medias) |
| POST | `/api/documents/:id/versions` (sustitución con historial) | `contenido:crear` + `documentos:subir`. En un borrador nunca publicado, su autoría o administración, y la versión nueva es la vigente al momento. En un documento publicado, solo administración (`documentos:reemplazar`), y el PDF nuevo espera en la revisión pendiente (`pending: true` en sus versiones) hasta publicarla; otro PDF sustituye al que esperaba y, al descartar la revisión, se borra |
| POST | `/api/files` (JPEG, PNG o WebP ≤ 5 MB) | `documentos:subir` |
| GET | `/api/files/:id` | `campus:leer` + visibilidad del documento (borradores, archivados y el PDF que espera en una revisión: autoría o administración) |

**Vida de empresa**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/events?phase&kind&category` · `/api/events/:ref` · `/api/events/:ref/ics` | `campus:leer` |
| PATCH | `/api/events/:id/phase` `{ manualPhase, revision }` | `contenido:editar-cualquiera` |
| GET | `/api/calendar?year&month` (festivos, encuentros de equipo y cumpleaños y aniversarios de incorporación de las personas activas) | `campus:leer` |
| GET | `/api/holidays?year` | `campus:leer` |
| POST · DELETE | `/api/holidays` · `/api/holidays/:id` | `contenido:editar-cualquiera` (administración: con la publicación directa, `contenido:publicar` ya lo tiene la autoría) |
| GET | `/api/clients?limit` (nuevos clientes publicados de «Ponte al día», sin datos económicos) | `campus:leer` |
| GET | `/api/welcomes?limit` (bienvenidas publicadas a personas activas, con su ficha mínima, sin correo ni fechas) | `campus:leer` |

**Cumpleaños y aniversarios.** No se guardan como eventos: `GET /api/calendar` los calcula en cada
petición con `entriesForMonth(year, month, { holidays, events, people })` a partir de la ficha de las
personas activas (`personalEntries()` de `@flm/shared`). El cumpleaños figura cada año en su día (el 29
de febrero, el 28 en los años no bisiestos) con el título «Cumpleaños de …» y el puesto; el aniversario,
cada año desde el siguiente a la incorporación («Aniversario de … en FLM», con `years` y el detalle
«1 año en FLM · desde el 1 de septiembre de 2026»). Cada entrada lleva `personId` y un identificador
estable (`cumple-<persona>-<año>`, `aniv-<persona>-<año>`): editar la ficha la mueve, sin duplicarla;
desactivar o eliminar el perfil la retira. Nunca llevan el correo ni un año de nacimiento. La
exportación `.ics` es la de cada evento (`/api/events/:ref/ics`): no incluye cumpleaños ni aniversarios.

**Personas, informes y auditoría**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/people/directory` | `campus:leer` (sin correos; con `birthday` y `startDate` si constan, para el calendario) |
| GET · POST | `/api/people` | `personas:gestionar` (alta solo @flmexperts.com, con `birthday` y `startDate` obligatorios) |
| GET · PATCH | `/api/people/:id` | `personas:gestionar` (cambiar el rol cierra sus sesiones; `birthday` y `startDate`, opcionales) |
| POST | `/api/people/:id/deactivate` · `/reactivate` · `/activation-link` | `personas:gestionar` |
| PUT · DELETE | `/api/people/:id/photo` | `personas:gestionar` |
| POST | `/api/people/:id/remove` `{ confirm: "<correo>" }` (eliminar el perfil de quien deja FLM; nunca el propio ni el del último administrador) | `datos-personales:eliminar` |
| GET · DELETE | `/api/people/:id/sessions` · DELETE `/api/people/:id/sessions/:sessionId` | `sesiones:revocar` |
| GET | `/api/reports/participation?format=json\|csv` | `informes:ver` (recuentos por formación, sin nombres) |
| GET | `/api/reports/errors/:contentId?format=json\|csv` | `informes:ver` (agregado, sin nombres) |
| GET | `/api/audit?action&entity&entityId&actorId&from&to&limit&offset` | `auditoria:ver` |

**Alta y edición de fichas.** El alta (`POST /api/people`, y también `create-admin`) exige, además de la
ficha profesional, el cumpleaños (`birthday`, `MM-DD`: día y mes, nunca el año) y la fecha completa de
incorporación (`startDate`, `AAAA-MM-DD`), validados con `personalDatesSchema` de `@flm/shared`: sin
ellos, 400 `VALIDACION` con esos campos en `details`; el 29 de febrero se admite. La incorporación puede
ser una alta prevista, pero no posterior a un año desde hoy (`startDateLimitIssue`, el mismo tope que la
web; también en la edición, en `PATCH /api/me/personal-dates` y en `create-admin`). Desde el alta, el
calendario muestra su cumpleaños y, a partir del año siguiente, su aniversario. En la edición
(`PATCH /api/people/:id`) son opcionales y se validan igual (un texto vacío no borra el dato: se
rechaza). Las fichas de administración (`GET /api/people`, `/api/people/:id`, alta y edición) llevan
`birthday`, `startDate` y `missingPersonalDates`; los perfiles anteriores quedan «sin indicar» hasta que
se completen, sin que se invente ningún dato. La auditoría (`persona.alta`, `persona.editar`) anota los
campos, nunca las fechas.

**Eliminar el perfil.** `POST /api/people/:id/remove` borra a la persona en una sola transacción:
su ficha (también su cumpleaños y su fecha de incorporación, de modo que sus cumpleaños y aniversarios
salen del calendario), sus sesiones, enlaces y confirmaciones de lectura se van con ella y su foto se borra; su contenido
(publicado, archivado o en borrador) **no se borra**: queda sin autoría y se firma con la firma neutra
de `neutralSignature()` («Área Fiscal de FLM», con su área, en formaciones y evaluaciones; «FLM» en
el resto); su nombre se retira de «Revisado por» en lo que revisó (`review.reviewerName` y
`reviewerId`; las anotaciones anteriores que solo guardaban el nombre se reconocen por él), que sigue
constando como revisado y con su fecha; las bienvenidas que la
anuncian (publicadas o en borrador) se borran; sus intentos de test se conservan como agregados
anónimos; y su IP desaparece de la auditoría. Responde con los recuentos (`contentsWithoutAuthor`,
`revisionsWithoutAuthor`, `reviewerNamesRemoved`, `welcomesDeleted`, `sessionsClosed`,
`attemptsAnonymized` y `calendarDatesDeleted`, de 0 a 2), que también constan en la auditoría
(`persona.eliminar-perfil`, con «Fechas del calendario borradas: N», sin las fechas). Detalle en
[docs/retencion-datos.md](docs/retencion-datos.md).

**Informes.** Solo dan recuentos agregados: ningún nombre, correo ni dato por persona.

- *Participación por formación* (`/api/reports/participation`): para cada formación publicada, en
  su versión vigente y sobre las personas activas, cuántas la han completado, cuántas la tienen a
  medias (leída, test intentado o test superado sin completar) y cuántas no la han empezado, con el
  porcentaje completado (estado calculado con `formationStatus()`). Lleva dos totales: personas con
  al menos una formación completada (`peopleWithCompleted`) y formaciones completadas en total
  (`completed`).

  ```json
  {
    "generatedAt": "2026-10-28T10:00:00.000Z",
    "totals": { "people": 48, "peopleWithCompleted": 31, "completed": 112 },
    "byFormation": [
      { "formationId": "fis-01", "title": "…", "area": "fiscal", "version": 1, "people": 48,
        "completed": 20, "inProgress": 9, "notStarted": 19, "completionRate": 42 }
    ]
  }
  ```

  Columnas del CSV: `Formación;Área;Versión;Personas;Completada;A medias;Sin empezar;% completada`.
- *Errores frecuentes por pregunta* (`/api/reports/errors/:contentId`) con `commonErrors()`, sobre
  todos los intentos de la versión vigente, incluidos los ya desvinculados de su persona.

Con `format=csv` se descarga un archivo para Excel (separador «;», BOM UTF-8, fórmulas
neutralizadas, `Content-Disposition: attachment`) y la exportación queda en la auditoría
(`informe.exportar`, con el detalle «Participación por formación» o «Errores frecuentes»).

## 6. Seguridad

- **Cuentas:** alta solo por administración y solo con correo @flmexperts.com; enlace de
  activación de un solo uso (7 días) con token aleatorio de 32 bytes guardado como SHA-256;
  contraseña de 12+ caracteres con letras y números (`passwordInput` de shared).
- **Contraseñas:** scrypt N=2^15, r=8, p=1, sal de 16 bytes, comparación en tiempo constante y
  verificación ficticia cuando la cuenta no existe (sin enumeración por tiempo).
- **Sesiones:** cookie `__Host-flm_sid` (HttpOnly, Secure, SameSite=Lax, Path=/; en desarrollo
  sobre http se llama `flm_sid` porque el prefijo `__Host-` exige Secure), token guardado como hash,
  12 h de inactividad y 14 días máximos, rotación al iniciar sesión, listado y revocación.
  Desactivar, cambiar el rol, restablecer o cambiar la contraseña revocan sesiones.
- **CSRF:** token por sesión en `X-CSRF-Token` (previo y en cookie `__Host-flm_csrf` para las
  rutas públicas) y comprobación de `Origin` (o `Referer`) contra `APP_ORIGIN`.
- **Límites de frecuencia** (memoria, ventana deslizante, 429 con `Retry-After`): inicio de
  sesión 5/15 min por IP+correo y 20/h por IP; recuperación 3/h por correo y 10/h por IP;
  subidas 30/h por persona; general 300/min por IP.
- **Autorización** en todas las rutas con la matriz compartida, propiedad de borradores y
  protección del último administrador activo.
- **Archivos:** tipo por cabecera mágica (`%PDF-`, JPEG, PNG, WebP), límites de 15 MB / 5 MB,
  nombres aleatorios en `STORAGE_DIR`, descarga con `Content-Disposition`, `nosniff` y CSP `sandbox`.
- **Cabeceras:** CSP estricta (API: `default-src 'none'`), HSTS en producción, `X-Frame-Options:
  DENY`, `Referrer-Policy: same-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` y
  `Cross-Origin-Resource-Policy`; `Cache-Control: no-store` en la API.
- **Entradas:** todo se valida con zod (400 con campos y mensajes en castellano); 2 MB máximo
  para JSON.
- **Auditoría:** seguridad (inicios, fallos, sesiones, contraseñas, cuentas, fichas y sus datos del
  calendario —solo qué campos cambian, nunca las fechas—, perfiles eliminados) y edición (crear,
  guardar, publicar, archivar, restaurar, descartar revisión…), consultable por administración.
  Retención en [docs/retencion-datos.md](docs/retencion-datos.md).

## 7. Despliegue

La API es un único proceso con SQLite: **una sola instancia** con almacenamiento persistente.

### Docker + Caddy (servidor propio o VPS)

```bash
# En la raíz del monorepo
cp apps/api/docker-compose.example.yml docker-compose.yml
cp apps/api/Caddyfile.example Caddyfile
mkdir -p copias && sudo chown 10001:10001 copias
cat > .env <<'EOF'
CAMPUS_DOMAIN=campus.flmexperts.com
APP_ORIGIN=https://campus.flmexperts.com
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=campus@flmexperts.com
SMTP_PASS=…
EOF
docker compose up -d --build
docker compose exec -u campus api node dist/create-admin.mjs --email nombre@flmexperts.com --nombre "Nombre" --cumpleanos 26/11 --incorporacion 01/09/2026
```

La imagen (`node:24-alpine`) solo contiene `dist/` (y la web compilada si `BUILD_WEB=true`).
El arranque ajusta la propiedad de los volúmenes y ejecuta Node como el usuario sin privilegios
`campus` (UID 10001). Volúmenes: `/app/data` (SQLite), `/app/storage` (archivos) y
`/app/backups` (copias). Caddy obtiene y renueva el certificado HTTPS.

### Render

1. *New → Web Service* desde el repositorio, entorno **Docker**, `Dockerfile Path: apps/api/Dockerfile`,
   contexto: raíz del repositorio.
2. *Disks*: un disco persistente montado en `/app/data` (Render admite un disco por servicio), y
   las variables `STORAGE_DIR=/app/data/storage` y `BACKUP_DIR=/app/data/backups`.
3. Variables: `APP_ORIGIN=https://<dominio>`, `SERVE_WEB_DIST=/app/web`, `TRUST_PROXY=true`, `SMTP_*`.
4. *Health Check Path*: `/api/health`. Dominio propio en *Settings → Custom Domains* (HTTPS incluido).
5. Primera cuenta desde *Shell* (como usuario sin privilegios):
   `su-exec campus node dist/create-admin.mjs --email … --nombre "…" --cumpleanos <día/mes> --incorporacion <día/mes/año>`.

### Fly.io

```bash
fly launch --no-deploy --dockerfile apps/api/Dockerfile   # desde la raíz del repositorio
fly volumes create campus_data --size 3 --region mad
```

En `fly.toml`:

```toml
[env]
  APP_ORIGIN = "https://campus.flmexperts.com"
  SERVE_WEB_DIST = "/app/web"
  TRUST_PROXY = "true"
  STORAGE_DIR = "/app/data/storage"
  BACKUP_DIR = "/app/data/backups"

[mounts]
  source = "campus_data"
  destination = "/app/data"

[http_service]
  internal_port = 3000
  force_https = true
  min_machines_running = 1
  [[http_service.checks]]
    path = "/api/health"
    interval = "30s"
    timeout = "5s"
```

Secretos con `fly secrets set SMTP_HOST=… SMTP_USER=… SMTP_PASS=…`; certificado con
`fly certs add campus.flmexperts.com`. Mantén **una sola máquina** (`fly scale count 1`).
Primera cuenta: `fly ssh console -C "su-exec campus node /app/dist/create-admin.mjs --email … --nombre … --cumpleanos <día/mes> --incorporacion <día/mes/año>"`.

## 8. Copias de seguridad y restauración

```bash
npm run backup -w @flm/api                                  # BACKUP_DIR/campus-AAAAMMDD-HHMMSS.sqlite
npm run backup -w @flm/api -- --archivos --conservar 14     # + copia de STORAGE_DIR, rota 14 copias
docker compose exec -u campus api node dist/backup.mjs --archivos --conservar 14   # en Docker
```

`VACUUM INTO` genera una copia coherente sin detener la API y se comprueba con
`PRAGMA integrity_check`. Programa una copia diaria (cron del anfitrión, *Cron Job* de Render o
*scheduled machine* de Fly) y llévala **fuera del servidor**, cifrada (p. ej., `restic` o
`rclone` hacia un almacenamiento de la firma).

**Restauración**

1. Detén la API (`docker compose stop api`).
2. Comprueba la copia: `sqlite3 campus-AAAAMMDD-HHMMSS.sqlite "PRAGMA integrity_check;"` → `ok`.
3. Sustituye `DATABASE_PATH` por la copia y **borra** los `campus.sqlite-wal` y `campus.sqlite-shm`
   que hubiera junto al archivo antiguo.
4. Si la copia incluye archivos (`archivos-AAAAMMDD-HHMMSS/`), restáuralos en `STORAGE_DIR`
   conservando la estructura `files/<nombre aleatorio>`.
5. Asegura la propiedad (`chown -R 10001:10001` en Docker) y arranca la API: las migraciones
   pendientes se aplican solas.
6. Repite las eliminaciones de perfil registradas en la auditoría (`persona.eliminar-perfil`) después
   de la fecha de la copia (ver [docs/retencion-datos.md](docs/retencion-datos.md)).

## 9. Datos semilla

`npm run seed -w @flm/api` importa dinámicamente `seed` de `@flm/content`; si el paquete no existe,
avisa y termina con código 1. Valida todo con los esquemas compartidos antes de escribir, inserta
solo lo que no existe (no pisa cambios hechos en la plataforma), no crea contraseñas y **no
importa las personas ficticias de la demo** (`fictional: true`) salvo con `--incluir-ficticias`.
Con la misma opción se importan los clientes ficticios de «Ponte al día»; las bienvenidas solo se
importan si su persona está activa en la plataforma y no tiene otra. Una persona de la semilla que
ya tiene cuenta (por su identificador o por su correo: p. ej. la primera administradora, creada con
`create-admin` y un identificador aleatorio) no se duplica: su autoría, las versiones de documento que
subió y su bienvenida se atribuyen a esa cuenta. Un contenido cuya autoría no está en la plataforma se
importa sin autoría (firma neutra) y se avisa; una versión subida por una persona sin cuenta lleva la
firma neutra (nunca su identificador como nombre). También aquí rige una evaluación vigente por área y
un solo espacio de slugs para la agenda: la semilla no puede repetirlos y lo que choque con lo ya
creado en la plataforma no se importa (se avisa). Volver a sembrar repone la clase (`kind`) de las
noticias y los documentos que una versión anterior de la carga guardó sin ella (solo si falta; se avisa).
De cada persona importa la ficha profesional (nombre, correo, puesto, departamento, oficina, rol y
estado) y, solo si la semilla los trae, su cumpleaños y su fecha de incorporación (hoy, solo Judith
Calet): a nadie se le rellenan por defecto. A una cuenta que ya existía solo se le completan los que le
falten (se avisa); lo que ya consta en la plataforma no se pisa. La foto no se importa (se avisa para
subirla desde la administración).
Los PDF de la biblioteca se buscan en `--archivos <carpeta>` (por defecto `packages/content` y
`apps/web/public`); si no aparecen, la versión queda registrada como «no disponible».
`dist/seed.mjs` incluye `@flm/content` si existía al compilar.

## 10. Configuración externa necesaria

- **Dominio y DNS:** p. ej. `campus.flmexperts.com` apuntando al servidor (o CNAME de Render/Fly).
- **HTTPS:** Caddy (automático con Let's Encrypt), Render o Fly.io. `APP_ORIGIN` debe ser https.
- **SMTP:** buzón de envío (Microsoft 365, Google Workspace, Amazon SES…) con SPF, DKIM y DMARC en
  `flmexperts.com` para que los enlaces no acaben en spam. Sin SMTP, al crear una cuenta la API
  devuelve a administración el enlace de activación para entregarlo en mano, y la recuperación
  de contraseña no puede funcionar.
- **Copias externas:** destino cifrado fuera del servidor para `BACKUP_DIR`.
- **Proxy:** si hay otro proxy además de Caddy (p. ej. un balanceador), ajusta `TRUST_PROXY`.

## 11. Limitaciones conocidas

- Los límites de frecuencia están en memoria: se reinician al reiniciar el servidor y no se
  comparten entre instancias (con SQLite solo debe haber una).
- Un borrador puede estar a medias (ver § 5): quien lea `/api/contents/:id` o `/preview` debe admitir
  que falten campos obligatorios hasta que se publique.
- Los informes analizan la versión vigente: el de errores frecuentes, la del test, y el de
  participación, la de cada formación (lo hecho en una versión anterior no cuenta).

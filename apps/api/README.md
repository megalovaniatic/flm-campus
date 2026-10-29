# FLM Campus · API de producción (`@flm/api`)

API privada de la plataforma interna de formación de FLM (≈ 50 personas). Sirve las cuentas,
sesiones, contenidos editoriales, aprendizaje, biblioteca, vida de empresa, informes y
auditoría, y puede servir también la web compilada desde el mismo origen.

Las reglas de negocio **no se duplican**: permisos (`can()`, `checkTransition()`), corrección de
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
│  ├─ db/                  database.ts (helpers, transacciones), migrate.ts, migrations/0001_….sql
│  ├─ auth/                passwords (scrypt), tokens (SHA-256), sessions, cookies
│  ├─ middleware/          request-context (IP, registro), security-headers, rate-limit,
│  │                       session, csrf, authorize (matriz de permisos), errors (413/404/500)
│  ├─ services/            people, accounts, account-tokens, content (flujo editorial),
│  │                       learning, assignments, reports, files, audit, retention, backup,
│  │                       seed, mailer, emails
│  ├─ routes/              auth, people, contents, learning, library, company, admin
│  ├─ lib/                 errors (HttpError), validation (zod), csv, logger
│  └─ cli/                 create-admin, seed, backup (+ load-content.mjs)
├─ test/                   pruebas Vitest y fixture propio (test/fixtures/seed.ts)
├─ scripts/build.mjs       compilación con esbuild
├─ docs/retencion-datos.md política de retención
├─ Dockerfile, docker-entrypoint.sh, docker-compose.example.yml, Caddyfile.example
└─ .env.example
```

**Modelo de datos.** `users`, `sessions`, `auth_tokens` (activación y recuperación),
`contents` (tabla genérica: tipo, estado editorial, autoría, `payload` JSON validado con el
esquema del tipo, número de revisión para concurrencia), `content_revisions` (cambios sobre
contenido publicado), `document_versions` + `files` (biblioteca), `read_confirmations`,
`quiz_attempts`, `assignments`, `holidays`, `readings` y `audit_log`.

## 2. Puesta en marcha (desarrollo)

```powershell
npm install                                   # en la raíz del monorepo
Copy-Item apps/api/.env.example apps/api/.env # y ajusta APP_ORIGIN si hace falta
npm run create-admin -w @flm/api -- --email nombre@flmexperts.com --nombre "Nombre Apellido"
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
| `create-admin` | Primera cuenta de administración (enlace de activación; sin contraseñas por defecto) |
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
  sesión anterior caducó o se cerró, `reason: { code, message }`.
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
| GET | `/api/me` | `campus:leer` |
| PATCH | `/api/me` (cumpleaños y consentimiento) | `progreso:propio` |
| PUT · DELETE | `/api/me/photo` | `progreso:propio` |
| GET | `/api/me/progress` · `/api/me/attempts` | `progreso:propio` |

**Aprendizaje**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/formations` · `/api/formations/:idOSlug` | `campus:leer` (test sin soluciones) |
| POST | `/api/formations/:ref/read` | `progreso:propio` |
| POST · GET | `/api/formations/:ref/attempts` | `progreso:propio` (corrección en el servidor) |
| GET | `/api/assessments` · `/api/assessments/:id` | `campus:leer` |
| POST · GET | `/api/assessments/:id/attempts` | `progreso:propio` |
| GET · POST | `/api/assignments` · DELETE `/api/assignments/:id` | `formaciones:asignar` |

**Contenidos (panel editorial)**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/contents?type&status&authorId&q` | `contenido:crear` (autor: solo los suyos) |
| POST | `/api/contents` `{ type, payload }` | `contenido:crear` + `CREATABLE_TYPES` |
| GET | `/api/contents/:id` · `/preview` · `/revisions` | `contenido:crear` + propiedad (o `contenido:editar-cualquiera`) |
| PUT | `/api/contents/:id` `{ revision, payload }` | `checkTransition('guardar')`; si está publicado, crea una revisión |
| POST | `/api/contents/:id/transitions` `{ action, revision, comment? }` | `checkTransition(action)`: enviar, publicar, devolver (con comentario), archivar, restaurar |
| DELETE | `/api/contents/:id/revision?revision=` | propiedad o `contenido:editar-cualquiera` |
| DELETE | `/api/contents/:id?revision=` | propiedad; solo borradores nunca publicados |

**Biblioteca y archivos**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/news` · `/api/news/:ref` · `/api/readings` | `campus:leer` |
| GET | `/api/documents` · `/api/documents/:id` | `campus:leer` (publicados) |
| POST | `/api/documents` (PDF ≤ 15 MB + `datos`) | `contenido:crear` + `documentos:subir` |
| POST | `/api/documents/:id/versions` (sustitución con historial) | `documentos:reemplazar` |
| POST | `/api/files` (JPEG, PNG o WebP ≤ 5 MB) | `documentos:subir` |
| GET | `/api/files/:id` | `campus:leer` + visibilidad del documento (borradores y archivados: autoría o administración) |

**Vida de empresa**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/events?phase&kind&category` · `/api/events/:ref` · `/api/events/:ref/ics` | `campus:leer` |
| PATCH | `/api/events/:id/phase` `{ manualPhase, revision }` | `contenido:editar-cualquiera` |
| GET | `/api/calendar?year&month` | `campus:leer` |
| GET | `/api/holidays?year` | `campus:leer` |
| POST · DELETE | `/api/holidays` · `/api/holidays/:id` | `contenido:publicar` |

**Personas, informes y auditoría**

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/people/directory` | `campus:leer` (sin correos ni fechas personales) |
| GET · POST | `/api/people` | `personas:gestionar` (alta solo @flmexperts.com) |
| GET · PATCH | `/api/people/:id` | `personas:gestionar` (cambiar el rol cierra sus sesiones) |
| POST | `/api/people/:id/deactivate` · `/reactivate` · `/activation-link` | `personas:gestionar` |
| PUT · DELETE | `/api/people/:id/photo` | `personas:gestionar` |
| POST | `/api/people/:id/anonymize` `{ confirm: "<correo>" }` | `datos-personales:eliminar` |
| GET · DELETE | `/api/people/:id/sessions` · DELETE `/api/people/:id/sessions/:sessionId` | `sesiones:revocar` |
| GET | `/api/reports/compliance?format=json\|csv&view=personas\|formaciones` | `informes:ver` |
| GET | `/api/reports/errors/:contentId?format=json\|csv` | `informes:ver` |
| GET | `/api/audit?action&entity&entityId&actorId&from&to&limit&offset` | `auditoria:ver` |

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
- **Auditoría:** seguridad (inicios, fallos, sesiones, contraseñas, cuentas) y edición
  (crear, guardar, enviar, publicar, devolver, archivar…), consultable por administración.
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
docker compose exec -u campus api node dist/create-admin.mjs --email nombre@flmexperts.com --nombre "Nombre"
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
   `su-exec campus node dist/create-admin.mjs --email … --nombre "…"`.

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
Primera cuenta: `fly ssh console -C "su-exec campus node /app/dist/create-admin.mjs --email … --nombre …"`.

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
6. Repite las anonimizaciones registradas en la auditoría después de la fecha de la copia
   (ver [docs/retencion-datos.md](docs/retencion-datos.md)).

## 9. Datos semilla

`npm run seed -w @flm/api` importa dinámicamente `seed` de `@flm/content`; si el paquete no existe,
avisa y termina con código 1. Valida todo con los esquemas compartidos antes de escribir, inserta
solo lo que no existe (no pisa cambios hechos en la plataforma), no crea contraseñas y **no
importa las personas ficticias de la demo** (`fictional: true`) salvo con `--incluir-ficticias`.
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
- Los borradores se validan con el esquema completo del tipo: no se pueden guardar contenidos a
  medias que no cumplan el esquema (p. ej., una formación con menos de 3 preguntas).
- El informe de errores frecuentes analiza la versión vigente del test.

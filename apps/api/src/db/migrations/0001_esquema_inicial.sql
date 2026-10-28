-- FLM Campus · Migración 0001: esquema inicial.
-- Fechas de dominio en texto ISO 8601 (UTC); caducidades de sesiones y enlaces en milisegundos.

-- Personas y cuentas. Las cuentas no se borran: se desactivan o se anonimizan.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL,
  office TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('empleado', 'autor', 'admin')),
  photo_file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
  start_date TEXT,
  birthday TEXT,
  show_birthday INTEGER NOT NULL DEFAULT 0 CHECK (show_birthday IN (0, 1)),
  status TEXT NOT NULL DEFAULT 'activa' CHECK (status IN ('activa', 'inactiva')),
  password_hash TEXT,
  password_changed_at TEXT,
  activated_at TEXT,
  deactivated_at TEXT,
  anonymized_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_users_status_role ON users (status, role);

-- Sesiones: solo se guarda el hash SHA-256 del token de la cookie.
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_token TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  revoked_reason TEXT,
  ip TEXT,
  user_agent TEXT
);
CREATE INDEX idx_sessions_user ON sessions (user_id);

-- Enlaces de activación (7 días) y de recuperación (30 minutos): un solo uso, guardados como hash.
CREATE TABLE auth_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('activacion', 'recuperacion')),
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_by TEXT
);
CREATE INDEX idx_auth_tokens_user ON auth_tokens (user_id, purpose);

-- Archivos subidos: nombre aleatorio en la carpeta privada STORAGE_DIR.
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  storage_name TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('pdf', 'imagen')),
  purpose TEXT NOT NULL CHECK (purpose IN ('documento', 'imagen', 'foto-perfil')),
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TEXT NOT NULL
);

-- Contenidos editoriales (formación, test, noticia, documento, evento, comunicado).
-- `payload` guarda el JSON validado con el esquema zod del tipo, sin los campos que gestiona el servidor
-- (id, editorial, versiones de documento, archivado y fase manual de eventos).
CREATE TABLE contents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado')),
  slug TEXT,
  title TEXT NOT NULL,
  area TEXT,
  status TEXT NOT NULL CHECK (status IN ('borrador', 'en-revision', 'publicado', 'archivado')),
  author_id TEXT NOT NULL REFERENCES users(id),
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  revision INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  review TEXT NOT NULL DEFAULT '{"state":"pendiente"}' CHECK (json_valid(review)),
  return_comment TEXT,
  manual_phase TEXT CHECK (manual_phase IN ('proximo', 'historico')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_contents_slug ON contents (type, slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_contents_type_status ON contents (type, status);
CREATE INDEX idx_contents_author ON contents (author_id);

-- Revisiones de contenidos publicados: la versión pública sigue visible hasta aprobar la revisión.
CREATE TABLE content_revisions (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('borrador', 'en-revision', 'aprobada', 'descartada')),
  author_id TEXT NOT NULL REFERENCES users(id),
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  return_comment TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  decided_at TEXT,
  decided_by TEXT REFERENCES users(id)
);
CREATE UNIQUE INDEX idx_revisions_open ON content_revisions (content_id) WHERE status IN ('borrador', 'en-revision');

-- Historial de versiones de los documentos de la biblioteca (se conservan las anteriores).
CREATE TABLE document_versions (
  content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_id TEXT REFERENCES files(id),
  original_file TEXT,
  size_kb INTEGER NOT NULL,
  pages INTEGER,
  note TEXT,
  uploaded_at TEXT NOT NULL,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  uploaded_by_name TEXT,
  PRIMARY KEY (content_id, version)
);
CREATE INDEX idx_document_versions_file ON document_versions (file_id);

-- Progreso de aprendizaje.
CREATE TABLE read_confirmations (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  read_at TEXT NOT NULL,
  PRIMARY KEY (user_id, content_id, version)
);

-- Intentos de test corregidos en el servidor. user_id queda a NULL al anonimizar (se conservan agregados).
CREATE TABLE quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  answers TEXT NOT NULL CHECK (json_valid(answers)),
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed INTEGER NOT NULL CHECK (passed IN (0, 1)),
  created_at TEXT NOT NULL
);
CREATE INDEX idx_attempts_user ON quiz_attempts (user_id, content_id);
CREATE INDEX idx_attempts_content ON quiz_attempts (content_id, version);

-- Formaciones obligatorias: a una persona o a «todos» (incluidas las futuras altas).
CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  target_kind TEXT NOT NULL CHECK (target_kind IN ('persona', 'todos')),
  person_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  due_date TEXT,
  assigned_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TEXT NOT NULL,
  CHECK ((target_kind = 'persona' AND person_id IS NOT NULL) OR (target_kind = 'todos' AND person_id IS NULL))
);
CREATE UNIQUE INDEX idx_assignments_unique ON assignments (content_id, target_kind, IFNULL(person_id, ''));

-- Festivos del calendario.
CREATE TABLE holidays (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('nacional', 'autonomico', 'local')),
  offices TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(offices)),
  source TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_holidays_unique ON holidays (date, offices);

-- Lecturas recomendadas.
CREATE TABLE readings (
  id TEXT PRIMARY KEY,
  area TEXT NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  updated_at TEXT NOT NULL
);

-- Registro de auditoría (sin claves foráneas para que sobreviva a cualquier cambio). Retención: 2 años.
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  detail TEXT,
  ip TEXT
);
CREATE INDEX idx_audit_at ON audit_log (at);
CREATE INDEX idx_audit_entity ON audit_log (entity, entity_id);
CREATE INDEX idx_audit_actor ON audit_log (actor_id);

-- flm:sin-claves-foraneas
-- FLM Campus · Migración 0004: el menú de creación y la autoría opcional.
--
--  1. Flujo editorial sin revisión previa: solo «Guardar borrador» y «Publicar». Lo que estaba
--     «en revisión» vuelve a borrador (no se pierde nada) y desaparece el comentario de devolución.
--  2. Tipos nuevos del tablero «Ponte al día» de Inicio: «cliente» y «bienvenida».
--  3. Autoría opcional: al eliminar el perfil de una persona que deja FLM, su contenido se conserva
--     sin autoría (author_id y decided_by pasan a NULL con ON DELETE SET NULL).
--  4. Las cuentas anonimizadas por versiones anteriores pasan a ser perfiles eliminados.
--
-- SQLite no permite cambiar un CHECK ni una clave foránea: `contents` y `content_revisions` se
-- reconstruyen (crear la tabla nueva, copiar con columnas explícitas, borrar la antigua y renombrar).
-- La primera línea pide al migrador desactivar las claves foráneas FUERA de la transacción: con ellas
-- activas, DROP TABLE contents borraría en cascada revisiones, versiones de documentos, lecturas e
-- intentos. Antes de confirmar, el migrador comprueba PRAGMA foreign_key_check.

-- 1 · Nada queda «en revisión».
UPDATE contents SET status = 'borrador' WHERE status = 'en-revision';
UPDATE content_revisions SET status = 'borrador' WHERE status = 'en-revision';

-- 2 · Contenidos: tipos nuevos, estados sin revisión y autoría opcional.
CREATE TABLE contents_nueva (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('formacion', 'test', 'noticia', 'documento', 'evento', 'comunicado', 'cliente', 'bienvenida')),
  slug TEXT,
  title TEXT NOT NULL,
  area TEXT,
  status TEXT NOT NULL CHECK (status IN ('borrador', 'publicado', 'archivado')),
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  revision INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  review TEXT NOT NULL DEFAULT '{"state":"pendiente"}' CHECK (json_valid(review)),
  manual_phase TEXT CHECK (manual_phase IN ('proximo', 'historico')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO contents_nueva (id, type, slug, title, area, status, author_id, payload, revision, version, review, manual_phase, published_at, created_at, updated_at)
SELECT id, type, slug, title, area, status, author_id, payload, revision, version, review, manual_phase, published_at, created_at, updated_at
FROM contents;

DROP TABLE contents;
ALTER TABLE contents_nueva RENAME TO contents;
CREATE UNIQUE INDEX idx_contents_slug ON contents (type, slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_contents_type_status ON contents (type, status);
CREATE INDEX idx_contents_author ON contents (author_id);

-- 3 · Revisiones de contenidos publicados: sin estado «en revisión», autoría y decisión opcionales.
CREATE TABLE content_revisions_nueva (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('borrador', 'aprobada', 'descartada')),
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  decided_at TEXT,
  decided_by TEXT REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO content_revisions_nueva (id, content_id, status, author_id, payload, created_at, updated_at, decided_at, decided_by)
SELECT id, content_id, status, author_id, payload, created_at, updated_at, decided_at, decided_by
FROM content_revisions;

DROP TABLE content_revisions;
ALTER TABLE content_revisions_nueva RENAME TO content_revisions;
CREATE UNIQUE INDEX idx_revisions_open ON content_revisions (content_id) WHERE status = 'borrador';

-- 4 · Cuentas anonimizadas: se eliminan como un perfil eliminado. Con las claves foráneas
-- desactivadas, ON DELETE SET NULL y ON DELETE CASCADE no actúan: se aplican aquí a mano.
UPDATE contents SET author_id = NULL WHERE author_id IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
UPDATE content_revisions SET author_id = NULL WHERE author_id IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
UPDATE content_revisions SET decided_by = NULL WHERE decided_by IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
UPDATE document_versions SET uploaded_by = NULL WHERE uploaded_by IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
UPDATE files SET uploaded_by = NULL WHERE uploaded_by IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
UPDATE quiz_attempts SET user_id = NULL WHERE user_id IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
DELETE FROM read_confirmations WHERE user_id IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
DELETE FROM auth_tokens WHERE user_id IN (SELECT id FROM users WHERE anonymized_at IS NOT NULL);
DELETE FROM users WHERE anonymized_at IS NOT NULL;

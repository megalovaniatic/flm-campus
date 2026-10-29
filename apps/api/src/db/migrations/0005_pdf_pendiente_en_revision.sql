-- FLM Campus · Migración 0005: el PDF nuevo de un documento publicado espera en su revisión.
--
-- Sustituir el PDF de un documento publicado es un cambio más de lo publicado: la versión nueva queda
-- unida a la revisión pendiente (`revision_id`) y el campus no la ve hasta publicar la revisión, que
-- la convierte en la vigente (revision_id a NULL). Si la revisión se descarta, la versión se borra con
-- su archivo. En un borrador que nunca se ha publicado, el PDF nuevo es el vigente al momento.
ALTER TABLE document_versions ADD COLUMN revision_id TEXT REFERENCES content_revisions(id) ON DELETE CASCADE;
CREATE INDEX idx_document_versions_revision ON document_versions (revision_id) WHERE revision_id IS NOT NULL;

-- FLM Campus · Migración 0003: todas las formaciones son voluntarias.
-- Se eliminan las asignaciones de formaciones y sus fechas límite. Ninguna tabla hace referencia a
-- `assignments`; su índice se borra de forma explícita, aunque DROP TABLE también lo eliminaría.
DROP INDEX IF EXISTS idx_assignments_unique;
DROP TABLE IF EXISTS assignments;

-- FLM Campus · Migración 0002: el campus deja de guardar cumpleaños y fechas de incorporación.
-- Ninguna de las tres columnas tiene índice ni clave foránea, y el CHECK de show_birthday es de la
-- propia columna: ALTER TABLE … DROP COLUMN (SQLite ≥ 3.35) las quita sin recrear la tabla y
-- borra esos datos de cada fila.
ALTER TABLE users DROP COLUMN show_birthday;
ALTER TABLE users DROP COLUMN birthday;
ALTER TABLE users DROP COLUMN start_date;

-- Preferencias de cumpleaños anotadas en la auditoría («Mostrar cumpleaños en el calendario: sí/no»):
-- el dato ya no existe, así que tampoco se guarda su rastro.
DELETE FROM audit_log WHERE action = 'perfil.cumpleanos';

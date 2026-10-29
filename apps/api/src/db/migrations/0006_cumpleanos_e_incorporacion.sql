-- FLM Campus · Migración 0006: vuelven el cumpleaños y la fecha de incorporación, para el calendario de empresa.
--
-- La 0002 quitó estas columnas con sus datos. Ahora se piden expresamente para mostrar en el calendario
-- de empresa los cumpleaños y los aniversarios de incorporación, que no se guardan como eventos: se
-- calculan a partir de la ficha (`personalEntries()` de @flm/shared), así que cambian con ella y no se
-- duplican. Vuelven vacías: los datos borrados por la 0002 no se recuperan y nada se rellena por defecto.
-- Son opcionales en la base de datos (los perfiles existentes no los tienen hasta que se completen);
-- el alta los exige en la API.
--
--  - birthday: solo día y mes («MM-DD»), nunca el año de nacimiento. El 29 de febrero se admite.
--  - start_date: fecha completa de incorporación a FLM («AAAA-MM-DD»).
--
-- Los CHECK comprueban que la fecha existe: date() normaliza las que no existen («2026-02-30» pasa a
-- «2026-03-02») y devuelve NULL si el formato no es el de una fecha, así que solo coincide con el valor
-- guardado si es una fecha real con ese formato exacto. Para el cumpleaños se usa un año bisiesto.
-- Ninguna de las dos columnas tiene índice ni clave foránea: ADD COLUMN no reconstruye la tabla.
ALTER TABLE users ADD COLUMN birthday TEXT CHECK (birthday IS NULL OR date('2024-' || birthday) IS ('2024-' || birthday));
ALTER TABLE users ADD COLUMN start_date TEXT CHECK (start_date IS NULL OR date(start_date) IS start_date);

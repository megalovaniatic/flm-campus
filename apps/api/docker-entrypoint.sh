#!/bin/sh
# FLM Campus · arranque del contenedor.
# La API se ejecuta SIEMPRE como el usuario sin privilegios «campus» (UID 10001).
# Si el contenedor arranca como root (p. ej. Render o Fly.io montan los volúmenes como root),
# primero crea las carpetas de datos, les da la propiedad correcta y después cede los privilegios.
set -eu

if [ "$(id -u)" = "0" ]; then
  for dir in "$(dirname "$DATABASE_PATH")" "$STORAGE_DIR" "$BACKUP_DIR"; do
    mkdir -p "$dir"
    if [ "$(stat -c %u "$dir")" != "10001" ]; then
      chmod 750 "$dir"
      chown -R campus:campus "$dir"
    fi
  done
  exec su-exec campus:campus "$@"
fi

exec "$@"

# 07 · Mantenimiento

## Tareas habituales

| Tarea | Cómo |
|---|---|
| Añadir o actualizar una formación | En la versión privada: Gestión › Nuevo › Formación (borrador → revisión → publicación). En el contenido semilla: un archivo en `packages/content/src/formaciones/` y su registro en el índice; `npm run lint:content` valida la estructura. Un cambio de fondo incrementa `version` (obliga a confirmar de nuevo la lectura). |
| Publicar una novedad | Gestión › Nuevo › Noticia (plantilla de cinco bloques). Fuente primaria con fecha obligatoria. |
| Subir o sustituir una nota informativa | Gestión › Nuevo › Documento (PDF ≤ 15 MB). Sustituir crea una versión nueva y conserva la anterior. |
| Crear un evento | Gestión › Nuevo › Evento: icono del conjunto curado, sesiones en hora de Madrid o «fecha por confirmar». Pasa solo a Histórico tras la última sesión. |
| Festivos del año siguiente | Cuando se publiquen en el BOE, el DOGC y los ayuntamientos (normalmente en otoño), actualizar `packages/content/src/festivos.ts` con la URL oficial de cada fecha. |
| Altas y bajas | Administración › Personas (alta con enlace de activación de 7 días; desactivar revoca sesiones; eliminación controlada de datos personales). |
| Fotografías | Originales fuera del repositorio; `node scripts/optimize-images.mjs <carpeta>` regenera AVIF/WebP y el manifiesto. |

## Calendario de revisión de contenidos

- **Trimestral**: revisar la vigencia de cada formación (campo `verifiedAt`) y de las lecturas (ediciones nuevas).
- **Ante cambios normativos**: actualizar la formación afectada, publicar la novedad en Actualidad y, si el cambio es relevante, subir la versión para pedir de nuevo la lectura.
- **Cada enero**: revisar importes anuales (SMI, interés de demora, límites) citados en formaciones y apoyos interactivos.

## Dependencias

- `npm outdated` mensual; actualizar con `npm update` y ejecutar `npm run check` antes de publicar.
- Node.js LTS: seguir el calendario oficial (actualizar la versión de `engines` y del flujo de GitHub Actions).

## Copias de seguridad (versión privada)

`npm run backup -w @flm/api` crea una copia consistente de SQLite (`VACUUM INTO`). Programarla a diario y conservar copias fuera del servidor (ver `apps/api/README.md`). Probar la restauración al menos una vez por trimestre.

## Incidencias

1. Reproducir en la demo o en local.
2. Revisar el registro de auditoría y los registros del servidor.
3. Corregir con prueba automatizada que cubra el caso.
4. Publicar y anotar el cambio.

# 07 · Mantenimiento

## Tareas habituales

| Tarea | Cómo |
|---|---|
| Añadir o actualizar una formación | En la plataforma: «Crear» (cabecera, menú de usuario o Ctrl K) › Formación, con su test final; «Guardar borrador» y, cuando esté lista, «Publicar» (la autoría publica lo suyo; administración, cualquier contenido). Editar algo publicado guarda los cambios aparte hasta publicarlos. En el contenido semilla: un archivo en `packages/content/src/formaciones/` y su registro en el índice; `npm run lint:content` valida la estructura. Un cambio de fondo se marca como «Cambio importante», incrementa `version` y obliga a confirmar de nuevo la lectura. |
| Evaluación del área | Administración: «Crear» › Evaluación del área (diez preguntas, que se pueden importar de los tests de sus formaciones; se supera con 8). Una vigente por área, publicada o en borrador: para cambiarla, edítala (los cambios se guardan aparte hasta publicarlos); para sustituirla por otra, archiva antes la anterior. Archivada deja de verse en Aprender y se puede restaurar si el área no tiene otra. |
| Publicar una novedad | «Crear» › Noticia (plantilla de cinco bloques). Fuente primaria con fecha obligatoria. |
| Subir o sustituir una nota informativa | «Crear» › Documento (PDF ≤ 15 MB). La autoría sustituye el PDF de su borrador nunca publicado. El de uno publicado lo sustituye administración: el PDF nuevo queda pendiente con los cambios y el campus sigue mostrando el vigente hasta publicarlos; entonces pasa a ser una versión nueva y la anterior se conserva en el historial. |
| Crear un evento o un comunicado | «Crear» › Evento: icono del conjunto curado, sesiones en hora de Madrid o «fecha por confirmar», materiales, enlaces y foto aprobada. Pasa solo a Histórico tras la última sesión. «Crear» › Comunicado para avisos a toda la firma. |
| «Ponte al día» de Inicio | «Crear» › Nuevo cliente (nombre, sector, país de la lista común y área; sin datos económicos y con permiso para anunciarlo) o › Bienvenida (persona activa del directorio sin bienvenida previa, con su conocimiento; sin fecha de incorporación). |
| Archivar o restaurar | Administración, desde Gestión › Publicado o › Archivado. Un contenido con cambios sin publicar se publica o se descartan sus cambios antes de archivarlo. |
| Festivos del año siguiente | Cuando se publiquen en el BOE, el DOGC y los ayuntamientos (normalmente en otoño), actualizar `packages/content/src/festivos.ts` con la URL oficial de cada fecha. |
| Altas y bajas | Administración › Personas (alta con enlace de activación de 7 días; desactivar revoca sesiones). Cuando alguien deja FLM, «Eliminar el perfil», confirmado escribiendo su correo (sin distinguir mayúsculas), borra sus datos, sus sesiones y las bienvenidas que la anuncian en «Ponte al día», también en borrador o con la cuenta ya desactivada; sus formaciones y demás contenidos se quedan, sin autoría y con la firma neutra («Área Fiscal de FLM» o «FLM»), y se retira su nombre de «Revisado por» en lo que revisó (sigue constando como revisado). En Gestión aparecen como «Sin autoría» y los edita administración. |
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

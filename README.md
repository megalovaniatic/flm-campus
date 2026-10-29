# FLM Campus

**Tu espacio para estar al día, compartir conocimiento y avanzar en FLM.**

Plataforma interna de FLM (asesoría fiscal, laboral, mercantil y contable · Barcelona, Vic y Granollers) para **aprender** (formaciones por área con test y evaluaciones sectoriales), **consultar** (actualidad, notas informativas originales y lecturas recomendadas) y **participar** (agenda, calendario y aportaciones), con perfiles, gestión de contenidos y administración.

- **Demostración pública**: https://megalovaniatic.github.io/flm-campus/ — abre directamente con un perfil de demostración, sin iniciar sesión.
- **Concepto creativo**: «Círculo de confianza» — *Aprender juntos para asesorar mejor.*

## Estado: qué es operativo, qué es demostración y qué requiere configuración

| Parte | Estado |
|---|---|
| Interfaz completa (escritorio y móvil), contenidos, tests y evaluaciones, biblioteca con PDF, agenda y calendario | **Operativo** en la demo y en la versión privada |
| Progreso, borradores, aprobación editorial y administración en la demo | **Simulado**: se guarda solo en el navegador (localStorage) y se puede restablecer |
| API con autenticación, sesiones, permisos en servidor, subidas, informes y auditoría (`apps/api`) | **Operativa en local** con pruebas automatizadas; **requiere configuración externa** para producción (alojamiento con volumen persistente, dominio, HTTPS, SMTP) |
| Revisión jurídica de las formaciones | Contenido verificado con fuentes primarias y **pendiente de validación por cada área de FLM** antes del lanzamiento interno |

## Estructura del monorepo

```
apps/
  web/        Cliente React 19 + Vite 8 + TypeScript (demo pública y versión privada)
  api/        API Node 24 + Hono + SQLite (node:sqlite): auth, permisos, contenidos, aprendizaje, archivos
packages/
  shared/     Tipos, reglas de negocio (Europe/Madrid, ciclo de vida de eventos, progreso, permisos) y esquemas zod
  content/    Contenido semilla: formaciones, tests, evaluaciones, actualidad, biblioteca, eventos, festivos, personas
docs/         Entregables: marca, concepto, sistema de diseño, arquitectura, QA, lanzamiento, mantenimiento
scripts/      Utilidades (optimización de imágenes)
research/     Informes de investigación y verificación de contenidos
```

## Requisitos

- Node.js 24 LTS (o ≥ 22.13) y npm 11.
- Git y, para publicar, GitHub CLI.

## Puesta en marcha

```bash
npm install
```

```bash
npm run dev
```

Abre http://localhost:5173 (demo con datos de ejemplo). Para la API en local:

```bash
npm run dev:api
```

## Compilación

```bash
npm run build:demo
```

Genera la demo estática en `apps/web/dist` (modo `demo`). Para la versión privada conectada a la API: `npm run build` (modo `production`) y `npm run build:api`.

## Verificación

```bash
npm run check
```

Ejecuta comprobación de tipos de todos los paquetes, pruebas unitarias (reglas compartidas, cálculos de los apoyos interactivos, datos guardados de la demo y API) y la validación del contenido (estructura, al menos tres formaciones por área, tests de 3 preguntas con aprobado 2/3, evaluaciones de 10 con aprobado 8, cinco bloques en actualidad, enlaces de ejemplo identificados y fichas de personas con cumpleaños y fecha de incorporación solo cuando constan: el cumpleaños, solo de Judith Calet; la incorporación, de Judith Calet, Lluís Gómez y Christopher Raudales). Procedimientos manuales en [`docs/09-informe-qa.md`](docs/09-informe-qa.md).

## Despliegue

- **Demo pública (GitHub Pages)**: el flujo `.github/workflows/pages.yml` comprueba, compila en modo demo y publica en cada `push` a `main`. Las rutas usan *hash* para que los enlaces directos funcionen.
- **Versión privada**: ver [`apps/api/README.md`](apps/api/README.md) (Docker con volumen persistente detrás de HTTPS; variables en `apps/api/.env.example`, sin secretos en el repositorio).

## Documentación

| Entregable | Documento |
|---|---|
| 1. Investigación de marca | [docs/01-investigacion-de-marca.md](docs/01-investigacion-de-marca.md) |
| 2. Concepto creativo | [docs/02-concepto-creativo.md](docs/02-concepto-creativo.md) |
| 3. Sistema de diseño | [docs/03-sistema-de-diseno.md](docs/03-sistema-de-diseno.md) · [especificación](docs/diseno/especificacion.md) |
| 4. Mapa del sitio y recorridos | [docs/04-arquitectura-y-recorridos.md](docs/04-arquitectura-y-recorridos.md) |
| 5. Diseños de escritorio y móvil | [docs/05-disenos.md](docs/05-disenos.md) |
| 6–7. Implementación, arquitectura y mantenimiento | [docs/06-arquitectura-tecnica.md](docs/06-arquitectura-tecnica.md) · [docs/07-mantenimiento.md](docs/07-mantenimiento.md) |
| 8. Demostración pública | Sección «Demo» |
| 9. Informe de QA | [docs/09-informe-qa.md](docs/09-informe-qa.md) |
| 10. Lista de lanzamiento | [docs/10-checklist-lanzamiento.md](docs/10-checklist-lanzamiento.md) |

## Demo

**https://megalovaniatic.github.io/flm-campus/**

Enlaces directos de ejemplo:

- Una formación: https://megalovaniatic.github.io/flm-campus/#/aprender/fiscal/recargos-presentacion-fuera-de-plazo
- Notas informativas: https://megalovaniatic.github.io/flm-campus/#/consultar/notas
- Agenda: https://megalovaniatic.github.io/flm-campus/#/participar/agenda
- Sobre el campus (concepto y sistema de diseño): https://megalovaniatic.github.io/flm-campus/#/sobre

En la demo puedes cambiar de perfil desde el avatar › «Ver la demo como» (Empleado, Autor, Administrador) y restablecerla desde la banda superior. Todo lo que hagas se guarda solo en tu navegador.

## Créditos y licencias

- Logotipos, fotografías y documentos: propiedad de FLM, usados con su autorización. No reutilizar fuera de este proyecto.
- Tipografías Inter, Newsreader y Belleza (SIL Open Font License 1.1), autoalojadas.
- Iconos Lucide (ISC). Glifos de redes según Simple Icons (CC0).
- Código: uso interno de FLM.

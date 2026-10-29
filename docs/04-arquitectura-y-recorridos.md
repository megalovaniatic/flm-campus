# 04 · Arquitectura de información y recorridos

## 1. Principio de organización

La navegación principal sigue los tres propósitos del campus más un punto de partida personal. Cada destino tiene un propósito único; no hay secciones redundantes.

| Destino | Propósito | Intenciones que resuelve |
|---|---|---|
| **Inicio** | Punto de partida personal con datos vivos | «Quiero saber qué tengo pendiente» · «¿Qué pasa hoy en FLM?» |
| **Aprender** | Formación por área, tests y evaluaciones | «Quiero aprender algo útil» |
| **Consultar** | Biblioteca: Actualidad, Notas informativas, Lecturas | «Necesito un documento» · «Quiero entender una novedad» |
| **Participar** | Agenda, calendario y aportaciones | «¿Qué está pasando en la firma?» · «Quiero aportar algo» |
| Perfil (avatar) | Progreso, resultados, reconocimientos, ajustes | «¿Cómo voy?» |
| Gestión (autoría y administración) | Crear, revisar y publicar contenidos | «Quiero aportar contenido» · «Necesito gestionar contenido» |
| Administración | Personas, accesos, informes, auditoría | «Necesito gestionar accesos» |

La búsqueda global (Ctrl/⌘ K o «/») atraviesa todo: formaciones, novedades, notas, lecturas, agenda, personas y secciones.

## 2. Mapa del sitio

```mermaid
flowchart TD
  I[Inicio] --> A[Aprender]
  I --> C[Consultar]
  I --> P[Participar]
  I -. avatar .-> PF[Perfil]
  A --> AA[Área: Fiscal · Laboral · Mercantil · Contable]
  AA --> AF[Formación]
  AF --> AT[Test final · 3 preguntas · aprobado 2/3]
  AA --> AE[Pon a prueba tus conocimientos · 10 preguntas · aprobado 8/10]
  C --> CN[Actualidad en tu sector]
  CN --> CND[Novedad en cinco bloques]
  C --> CD[Notas informativas · PDF originales]
  C --> CL[Lecturas recomendadas]
  P --> PA[Agenda: Actuales y próximos · Histórico]
  P --> PC[Calendario: cumpleaños · aniversarios · encuentros · festivos]
  P --> PP[Participa: temas, mejoras, vídeos, LinkedIn, reseñas]
  PF --> PFA[Ajustes]
  PF -. autoría .-> G[Gestión de contenidos]
  G --> GE[Editor por plantilla: formación · test · noticia · documento · evento · comunicado]
  PF -. administración .-> AD[Administración: personas · informes · auditoría · retención]
  I --- S[Sobre el campus: concepto, marca, sistema de diseño, accesibilidad, privacidad]
```

## 3. Recorridos clave

### Empleado: aprender algo útil y demostrarlo

```mermaid
flowchart LR
  A[Inicio · «Tu siguiente paso»] --> B[Formación obligatoria Verifactu]
  B --> C[Lee: resultados de aprendizaje, bloques, ejemplo resuelto, idea clave]
  C --> D[«Marcar la lectura como terminada»]
  D --> E[Test: 3 preguntas con corrección al margen]
  E -->|2/3 o más| F[«El escalón»: Formación completada]
  E -->|menos de 2| G[«Aún no» · Repasar · Volver a intentarlo]
  G --> E
  F --> H[Perfil: progreso y reconocimiento]
```

### Empleado: encontrar un documento y entender una novedad

```mermaid
flowchart LR
  A[Ctrl K «verifactu»] --> B[Nota informativa VERI*FACTU]
  B --> C[Miniatura · Abrir · Descargar]
  A --> D[Novedad en Actualidad]
  D --> E[1 La novedad · 2 A quién afecta · 3 Qué debemos hacer · 4 Ejemplo · 5 Fuente y fecha]
  E --> F[Copiar referencia]
```

### Empleado: saber qué pasa y participar

```mermaid
flowchart LR
  A[Inicio · Hoy en FLM] --> B[Agenda: Formación en IA · 10 sesiones]
  B --> C[Añadir a mi calendario .ics]
  A --> D[Calendario del mes]
  D --> E[Panel del día]
  A --> F[Participa: proponer un tema]
  F --> G[Correo prerrellenado a barcelona@flmexperts.com]
```

### Autor: aportar contenido

```mermaid
flowchart LR
  A[Gestión · Nuevo] --> B[Plantilla: Noticia en cinco bloques]
  B --> C[Autoguardado · Vista previa]
  C --> D[Enviar a revisión]
  D --> E{Administración}
  E -->|Publica| F[Publicado · visible en Actualidad]
  E -->|Devuelve con comentario| G[Borrador con comentario]
  G --> C
```

### Administración: gestionar contenido y accesos

```mermaid
flowchart LR
  A[Gestión · Pendiente de tu revisión] --> B[Publicar · Deshacer 10 s]
  C[Administración · Personas] --> D[Alta con enlace de activación de 7 días]
  C --> E[Desactivar = revoca sesiones]
  C --> F[Eliminar datos personales con confirmación]
  G[Informes] --> H[Cumplimiento de obligatorias · errores frecuentes · CSV]
  I[Auditoría] --> J[Quién, qué y cuándo]
```

## 4. Coherencia escritorio–móvil

- Mismos destinos y en el mismo orden: cabecera en escritorio, barra inferior en móvil (Inicio, Aprender, Consultar, Participar, Perfil).
- Búsqueda en la cabecera en ambos tamaños.
- Paneles laterales en escritorio que pasan a hojas inferiores en móvil.
- Calendario: cuadrícula en escritorio; tira semanal y lista en móvil.
- Lectura: índice y glosario al margen en escritorio; desplegables en línea en móvil.

## 5. Rutas directas

La demostración usa rutas con *hash* para que cualquier enlace directo funcione en GitHub Pages (p. ej. `…/#/aprender/fiscal`, `…/#/consultar/notas/doc-boicac-147`, `…/#/participar/agenda/desayuno-mercantil-radar`). La versión privada puede usar rutas limpias servidas por la API.

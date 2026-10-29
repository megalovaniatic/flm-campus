# Informe de QA · FLM Campus

> **Fecha:** 29 de octubre de 2026 · **Versión:** la publicada en `main` con este documento · **Norma de accesibilidad:** WCAG 2.2 AA
> **Entornos:** compilación de la demo (`npm run build:demo` servida con `vite preview` en `/flm-campus/`) en el navegador integrado (Chromium), y servidor de desarrollo para la revisión experta.
> **Documentos relacionados:** [crítica de diseño y auditoría de accesibilidad](qa/critica-diseno-y-accesibilidad.md) · [lista de lanzamiento](10-checklist-lanzamiento.md) · [mantenimiento](07-mantenimiento.md)

## 1. Resumen

| Comprobación | Resultado |
|---|---|
| Tipos (TypeScript, 4 paquetes) | Sin errores |
| Pruebas automáticas (`npm run check`) | **154 de 154** superadas: reglas compartidas 21, API 81, apoyos interactivos 42, contenido 10 |
| Auditoría automática con axe-core 4.10.2 (WCAG 2.0, 2.1 y 2.2, niveles A y AA) | **0 incidencias** en 32 rutas a 360 px y en 19 rutas a 1440 px, más 1 falso positivo explicado en §3.3 |
| Reajuste sin desplazamiento horizontal (360 px) | **0 px** en todas las rutas, después de corregir 2 desbordamientos encontrados en esta pasada |
| Revisión experta de diseño y accesibilidad | 33 hallazgos (1 crítico, 10 importantes y 22 menores): **29 corregidos**; quedan 4 menores, cada uno con su propuesta |
| Robustez ante una publicación nueva | Corregida en esta pasada: antes salía una pantalla de error genérica en inglés; ahora la página se recarga sola una vez (§5) |
| Compilación de la demo | Correcta. Fragmentos principales en §6 |

**Valoración:** la demo pública está lista para enseñarse y compartirse. Antes del lanzamiento interno faltan tres cosas: la validación jurídica de los contenidos por cada área, la prueba con lectores de pantalla reales y el despliegue privado con la API (§8).

## 2. Pruebas automáticas

Se lanzan con `npm run check`, que también ejecuta el flujo de GitHub Pages antes de cada publicación. Si una prueba falla, no se publica.

| Paquete | Pruebas | Qué garantizan |
|---|---|---|
| `packages/shared` | 21 | Fechas en Europe/Madrid. Fases de evento (en curso, próximo, histórico y archivado; varias sesiones; fecha pendiente). Corrección de tests: 2 de 3 y 8 de 10. Estados de aprendizaje. Matriz de permisos y transiciones editoriales con su código de error. Calendario con la semana empezando en lunes. Exportación .ics con `VTIMEZONE`. |
| `apps/api` | 81 | Autenticación (scrypt N=2¹⁵, solo correos @flmexperts.com, enlaces de un solo uso, cookie `__Host-flm_sid`, caducidad a las 12 h sin actividad y a los 14 días, rotación y revocación de sesiones). Seguridad (CSP estricta, HSTS en producción, token CSRF, comprobación de `Origin`, límites de peticiones con `Retry-After`, matriz de permisos, 401 sin sesión). Flujo editorial (borrador → revisión → devuelto o publicado, revisiones de lo publicado, conflictos 409, archivo). Archivos (tipo real por los primeros bytes, nombres saneados, descarga solo con permiso, historial de versiones). Aprendizaje (el test se corrige en el servidor y nunca envía las respuestas; asignaciones; CSV que neutraliza fórmulas). Personas (no se puede quitar el último administrador; borrado de datos personales con confirmación). Operación (auditoría, purgas de retención, migraciones, copias con `VACUUM INTO`, configuración de producción obligatoria). |
| `apps/web` (apoyos interactivos) | 42 | Cálculos de los simuladores: recargos del art. 27 LGT, plazos de cuentas anuales, amortización contable y fiscal, devengo y asientos. Se comparan con casos resueltos a mano. |
| `packages/content` | 10 | Estructura de todo el contenido semilla validada con los esquemas zod. Tres formaciones por área. Tests de 3 preguntas que se superan con 2. Evaluaciones de 10 que se superan con 8. Actualidad con los cinco bloques. Los enlaces de ejemplo están identificados como tales. |

## 3. Auditoría automática de accesibilidad

### 3.1 Método

- Se inyecta axe-core 4.10.2 en la página servida desde la compilación de la demo. Se recorren las rutas cambiando el *hash*: en cada una se espera a que cambie el título y después 1,5 s, para que terminen las animaciones de entrada.
- Etiquetas evaluadas: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `wcag22aa`.
- **Móvil:** emulación a 360 × 780 con pantalla táctil (los controles pequeños crecen a 44 px). **Escritorio:** 1440 × 900.
- En cada ruta también se mide el desbordamiento horizontal (`scrollWidth − clientWidth`).
- Se recorrió con el perfil de empleado. Las rutas de gestión y administración se repitieron con el perfil de administración («Ver la demo como»). Con el perfil de empleado, esas rutas muestran «Acceso restringido», que también pasó la auditoría.

### 3.2 Resultados

| Grupo | Rutas | 360 px | 1440 px |
|---|---|---|---|
| Inicio y Aprender | `/`, `/aprender`, `/aprender/fiscal`, `/aprender/laboral`, formaciones `recargos-presentacion-fuera-de-plazo`, `cuando-derivar-a-mercantil` y `boicac-147`, test final, `/aprender/contable/evaluacion` | 0 incidencias · 0 px | 0 incidencias · 0 px |
| Consultar | `/consultar`, `/consultar/actualidad`, `/consultar/notas`, `/consultar/lecturas` | 0 incidencias · 0 px (lecturas: 61 px antes de la corrección) | 0 incidencias · 0 px |
| Participar | `/participar`, `/participar/agenda` (también con el evento del desayuno, el de la formación en IA y un enlace a un evento inexistente), `/participar/calendario`, `/participar/contribuye` | 0 incidencias, más 1 falso positivo · 0 px | 0 incidencias · 0 px |
| Perfil y otras | `/perfil`, `/perfil/ajustes`, `/sobre` y una ruta inexistente (404) | 0 incidencias · 0 px | 0 incidencias · 0 px |
| Gestión y administración | `/gestion` y los editores de evento, formación, noticia, documento, test y comunicado, `/admin`, `/admin/personas` | 0 incidencias · 0 px (editor de formación: 14 px antes de la corrección) | 0 incidencias · 0 px |

### 3.3 Falso positivo

Con un enlace a un evento inexistente, axe marcó «contraste insuficiente» en la pestaña activa «Actuales y próximos»: texto blanco sobre `#EBEAE7`. Ese fondo no es el real. La cápsula activa es un elemento hermano que se desliza entre pestañas (`layoutId`), y axe no siempre lo detecta. Comprobado en el DOM: la cápsula está presente, es opaca y es marino `#172641`, así que el contraste real es 15,1:1. La revisión experta ya identificó este mismo caso.

### 3.4 Correcciones de esta pasada

| Hallazgo | Corrección |
|---|---|
| A 360 px, la estantería de Lecturas ensanchaba la página 61 px: la balda (`max-content`) agrandaba la columna de la rejilla | `grid-template-columns: minmax(0, 1fr)` en `features/library/ReadingsPage.module.css`. La balda se desplaza dentro de su propio contenedor, como estaba previsto |
| Los botones de subir, bajar y eliminar bloque del editor de formaciones (3 × 44 px en táctil) se salían 14 px | La cabecera del bloque admite salto de línea y los botones bajan a la línea siguiente, alineados a la derecha (`features/manage/editor/Editor.module.css`) |

## 4. Revisión experta de diseño y accesibilidad

La revisión completa, con capturas, medidas y archivos modificados, está en [`qa/critica-diseno-y-accesibilidad.md`](qa/critica-diseno-y-accesibilidad.md). Hubo 33 hallazgos y la revisión corrigió 20, entre ellos el crítico: el enlace «Saltar al contenido» abría un 404. Esta pasada final ha resuelto 9 de los 13 pendientes:

| ID | Hallazgo | Estado |
|---|---|---|
| M10 | «Lectura confirmada» se anunciaba tres veces | **Corregido.** Un solo anuncio, que incluye el siguiente paso, y sin aviso emergente que lo repita |
| M11 | «Lectura confirmada» aparecía como botón apagado (2,86:1) | **Corregido.** Ahora es una cápsula de estado con icono y texto en verde sobre fondo verde suave (≥ 4,5:1) |
| M13 | En los editores, los ejemplos del campo parecían valores ya escritos | **Corregido.** Llevan delante «p. ej.,» |
| M14 | El asterisco de obligatorio no se explicaba | **Corregido.** «Los campos marcados con * son obligatorios» al principio de cada formulario de gestión. El asterisco es decorativo y los lectores anuncian «obligatorio» por el atributo `required` |
| M15 | El foco inicial de «¿Salir del test?» iba a «Cerrar» | **Corregido.** `Dialog` admite `data-autofocus`: el foco va a la acción segura («Seguir con el test», «Seguir editando», «Cancelar») o, al borrar datos personales, al campo de confirmación. Verificado en el navegador |
| M16 | En móvil, la píldora «Te quedan N min» tapaba el texto | **Corregido.** Por debajo de 720 px solo queda el filete de progreso |
| M19 | Contadores dentro de círculos | **Corregido.** La insignia de avisos es una cápsula también con un solo dígito. El contador de «Pendiente de tu revisión» ya lo era |
| M20 | El botón «Cerrar» de los diálogos medía 36 px en escritorio | **Corregido.** Mide 44 px (verificado) |
| M22 | Faltaban los festivos de diciembre | **Resuelto en el contenido:** 8, 25 y 26 de diciembre, con la fuente oficial (DOGC). El 6 de diciembre de 2026 cae en domingo y no figura en el calendario laboral de Cataluña |
| M12 | Demasiadas regiones con nombre en formación, perfil y editor | **Pendiente (menor).** Nombrar solo las secciones de primer nivel; el resto se navega por encabezados |
| M17 | El H1 de la evaluación sectorial es genérico | **Se mantiene a propósito.** «Pon a prueba tus conocimientos» es el nombre fijado en el encargo. El área aparece en el antetítulo y en el título de la página («… · Contable») |
| M18 | Al enfocar una expresión de «La llegada», no se resalta la tarjeta asociada | **Pendiente (pulido).** Resaltar la tarjeta con `data-index` |
| M21 | Enlaces de fuentes de 17–22 px de alto | **Pendiente (opcional).** Ya cumplen 2.5.8 por la excepción de espaciado |

## 5. Pruebas funcionales en el navegador

Recorridos hechos con teclado y ratón sobre la demo. Los resultados detallados de la revisión experta están en su documento.

| Recorrido | Resultado |
|---|---|
| Formación completa: lectura → confirmar → test (2/3) → «El escalón» → revisar respuestas | Correcto. El foco pasa a «Hacer el test» y el resultado queda visible bajo la cabecera |
| Evaluación sectorial: introducción, preguntas y salida con «¿Salir del test?» | Correcto. Esc cierra; el foco inicial va a «Seguir con el test» y vuelve a la nota al margen |
| Agenda y calendario: fases en Europe/Madrid, detalle de evento, «Copiar enlace», rejilla con flechas, Inicio/Fin y Re Pág/Av Pág | Correcto. La exportación .ics la cubren las pruebas automáticas |
| Notas informativas: filtros, hoja lateral con miniatura del PDF, versiones y descarga | Correcto. La hoja atrapa el foco y lo devuelve al cerrar |
| Búsqueda global (Ctrl K) | Correcta. Esc cierra a la primera y el foco vuelve al origen |
| Gestión: los seis editores, validación y resumen de errores con enlace a cada campo | Correcto. El flujo borrador → revisión → publicado o devuelto se simula en el navegador y lo cubren las pruebas de la API |
| Roles: Empleado, Autor y Administrador con «Ver la demo como»; rutas protegidas | Correcto. Sin permiso se ve «Acceso restringido» |
| 404 con sugerencia de sección | Correcto |
| **Versión nueva publicada con el campus abierto** (simulado ocultando un fragmento de la compilación) | **Corregido en esta pasada.** Antes salía «Unexpected Application Error!», la pantalla genérica en inglés de React Router. Ahora `RouteError` recarga la página una vez y, si vuelve a fallar en menos de 15 s, explica qué pasa y ofrece «Recargar la página» y «Volver al inicio» sin perder la cabecera. Vite también avisa (`vite:preloadError`) y la recarga es la misma |
| «La llegada»: una vez al día (Madrid), se interrumpe con cualquier tecla o toque y termina por seguridad a los 2,6 s | Correcto |
| Movimiento reducido (del sistema o del ajuste del campus) y tema oscuro | Correcto. Se muestra directamente el estado final y los contrastes se verificaron en oscuro |

## 6. Rendimiento y compilación

Compilación de la demo del 29/10/2026. Tamaños comprimidos con gzip.

| Fragmento | Tamaño | Cuándo se carga |
|---|---|---|
| `index` (armazón e Inicio) | 36,3 KB | Siempre |
| `react` | 100,3 KB | Siempre (en caché entre versiones si no cambia) |
| `motion` | 56,2 KB | Siempre |
| `contenido` (contenido semilla de la demo) | 133,4 KB | Siempre en la demo; la versión privada lo pide a la API |
| `FormationPage` | 40,3 KB | Al abrir una formación |
| `pdf` (pdf.js) | 129,3 KB | Solo al previsualizar un PDF |

Cada página es un fragmento propio. Las fotografías se sirven en AVIF o WebP con dimensiones explícitas, así que la página no salta al cargar. Las tipografías están en el propio servidor, sin peticiones a terceros.

## 7. Seguridad y privacidad de la demo pública

- La demo no tiene servidor: no contiene secretos ni claves, y todo lo que se hace se guarda solo en el navegador (`localStorage`). Se puede borrar con «Restablecer».
- Solo se publican documentos de FLM aprobados para la demo. Los documentos de terceros (revista de AEDAF, presentación de la campaña de Sociedades y novedades de Cataluña) aparecen como fichas sin archivo.
- Las personas reales aparecen con su nombre y área públicos y con la fuente anotada. Solo llevan fotografía cuando FLM la ha aportado o hay autorización expresa. Las personas ficticias de relleno están marcadas como tales en Administración, y a las reales no se les atribuye ningún dato inventado.
- En la versión privada, la seguridad la cubren las 81 pruebas de la API (§2). Configuración y despliegue en [`apps/api/README.md`](../apps/api/README.md).

## 8. Qué no se ha probado

| Pendiente | Cómo hacerlo |
|---|---|
| Lectores de pantalla reales | NVDA con Chrome y con Firefox en Windows; VoiceOver con Safari en macOS e iOS. Recorrer la formación, el test, el calendario, la búsqueda y un editor. Hasta ahora los nombres accesibles se han comprobado en el árbol de accesibilidad de Chrome |
| Navegadores no Chromium | Firefox y Safari de escritorio y Safari en iOS, sobre todo `<dialog>`, `color-mix()` y las animaciones con `layoutId` |
| Dispositivos reales | Un iPhone y un Android de gama media: gestos, teclado virtual en los editores y rendimiento de las animaciones |
| Zoom del 200 % en escritorio | Comprobación manual. El reajuste a 320 px, equivalente al 400 %, ya está verificado |
| Despliegue privado | Docker y Caddy con HTTPS, SMTP real para los enlaces de activación, copias de seguridad en el servidor y restauración de prueba |
| Contenido | Validación jurídica de las 12 formaciones y sus tests por cada área (todas en «pendiente de revisión»), festivos locales de 2027 y sustitución de los enlaces de ejemplo |

## 9. Procedimiento manual antes de cada publicación

1. `npm run check` sin errores (también lo ejecuta GitHub Actions).
2. `npm run build:demo` y `vite preview` (configuración «demo-build» de `.claude/launch.json`).
3. Recorrido con teclado desde una carga limpia: el primer Tab va a «Saltar al contenido»; Intro lleva al contenido sin cambiar de página.
4. Formación de prueba: confirmar la lectura, test con 2/3 y «El escalón». Después, «Restablecer».
5. Auditoría de axe en las rutas de §3.2 a 360 y 1440 px: 0 incidencias y 0 px de desbordamiento.
6. Tema oscuro y movimiento reducido en Inicio, en una formación y en el calendario.
7. Tras publicar, abrir la URL pública en una ventana privada: carga sin iniciar sesión, los enlaces directos con `#/…` funcionan y no hay errores en la consola.

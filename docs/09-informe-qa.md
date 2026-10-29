# Informe de QA · FLM Campus

> **Fecha:** 29 de octubre de 2026 · **Versión:** la publicada en `main` con este documento · **Norma de accesibilidad:** WCAG 2.2 AA
> **Entornos:** compilación de la demo (`npm run build:demo` servida con `vite preview` en `/flm-campus/`) en Chrome sin interfaz controlado con el protocolo DevTools (emulación de móvil táctil y de escritorio, tema claro y oscuro) y en el navegador integrado (Chromium), y servidor de desarrollo para la revisión experta.
> **Documentos relacionados:** [crítica de diseño y auditoría de accesibilidad](qa/critica-diseno-y-accesibilidad.md) · [lista de lanzamiento](10-checklist-lanzamiento.md) · [mantenimiento](07-mantenimiento.md)

## 1. Resumen

| Comprobación | Resultado |
|---|---|
| Tipos (TypeScript, 4 paquetes) | Sin errores |
| Pruebas automáticas (`npm run check`) | **376 de 376** superadas: reglas compartidas 48, API 113, web 201, contenido 14 |
| Auditoría automática con axe-core 4.10.2 (WCAG 2.0, 2.1 y 2.2, niveles A y AA) | **0 incidencias reales** en 35 rutas (18 de empleado y 17 de Gestión y Administración) a 360 y 1440 px, en tema claro y oscuro: 140 pasadas. Quedan 3 falsos positivos explicados en §3.3. La pasada de la tarde (§3.5) añadió otras 201 sobre lo que ha cambiado: 0 incidencias y 0 px, más un falso positivo ya conocido |
| Revisión cruzada de las siete formaciones de Contabilidad | 1 contradicción, 3 imprecisiones y 3 detalles entre formaciones: **todos corregidos**, con la norma y las instrucciones de la AEAT comprobadas (§3.5) |
| Reajuste sin desplazamiento horizontal (360 px) | **0 px** en todas las rutas, después de corregir los 2 desbordamientos encontrados en esta pasada (§3.4) |
| Revisión experta de diseño y accesibilidad | 33 hallazgos (1 crítico, 10 importantes y 22 menores): **29 corregidos**; quedan 4 menores, cada uno con su propuesta |
| Revisión de código del creador, el flujo editorial y la eliminación de perfiles | 42 hallazgos de cuatro revisores; otros cuatro agentes intentaron refutarlos: **41 confirmados y corregidos**, 1 descartado (§4.1) |
| Robustez ante una publicación nueva | Corregida en esta pasada: antes salía una pantalla de error genérica en inglés; ahora la página se recarga sola una vez (§5) |
| Compilación de la demo | Correcta. Fragmentos principales en §6 |

**Valoración:** la demo pública está lista para enseñarse y compartirse. Antes del lanzamiento interno faltan tres cosas: la validación jurídica de los contenidos por cada área, la prueba con lectores de pantalla reales y el despliegue privado con la API (§8).

## 2. Pruebas automáticas

Se lanzan con `npm run check`, que también ejecuta el flujo de GitHub Pages antes de cada publicación. Si una prueba falla, no se publica.

| Paquete | Pruebas | Qué garantizan |
|---|---|---|
| `packages/shared` | 48 | Fechas en Europe/Madrid. Fases de evento (en curso, próximo, histórico y archivado; varias sesiones; fecha pendiente). Corrección de tests: 2 de 3 y 8 de 10. Estados de aprendizaje y reconocimientos (el de una evaluación superada se conserva aunque se archive). Matriz de permisos: «Guardar borrador» y «Publicar», la autoría publica lo suyo, archivar y restaurar solo administración, el tipo se comprueba en cada acción (`canHandleType`) y una sola evaluación vigente por área. Firma neutra del contenido sin autoría («Área Fiscal de FLM», «FLM»). Esquemas del creador: subapartados, país de la lista común y apoyos interactivos (árbol de decisión, clasificador y gráfico). Calendario con la semana empezando en lunes: encuentros de equipo, festivos y, calculados desde la ficha, cumpleaños (el 29 de febrero pasa al 28 en los años no bisiestos) y aniversarios desde el año siguiente a la incorporación, sin duplicados ni personas inactivas. Validación del cumpleaños (día y mes, sin año) y de la fecha de incorporación. Línea de autoría «Nombre — Puesto». Exportación .ics con `VTIMEZONE`. |
| `apps/api` | 113 | Autenticación (scrypt N=2¹⁵, solo correos @flmexperts.com, enlaces de un solo uso que se comprueban antes de pedir la contraseña, cookie `__Host-flm_sid`, caducidad a las 12 h sin actividad y a los 14 días, rotación y revocación de sesiones). Seguridad (CSP estricta, HSTS en producción, token CSRF, comprobación de `Origin`, límites de peticiones con `Retry-After`; por IP solo cuentan los inicios de sesión fallidos, también en ráfagas simultáneas, y 40 inicios correctos seguidos desde la misma IP entran, matriz de permisos, 401 sin sesión). Flujo editorial (guardar borrador y publicar, sin revisión previa: la autoría publica lo suyo y administración, cualquier contenido; los borradores se guardan a medias y solo al publicar se exige el contenido completo; el tipo se comprueba en cada acción, también tras un cambio de rol; cambios sobre lo publicado que no se ven hasta publicarlos y que, sin «Lo ha revisado el área», vuelven a quedar pendientes de revisión; conflictos 409; archivo y restauración solo por administración; una sola evaluación vigente por área; eventos y comunicados sin direcciones repetidas; nuevos clientes y bienvenidas, una por persona activa). Archivos (tipo real por los primeros bytes, nombres saneados, descarga solo con permiso, historial de versiones; el PDF nuevo de un documento publicado espera en la revisión hasta publicarla). Aprendizaje (el test se corrige en el servidor y nunca envía las respuestas; progreso propio). Informes restringidos, agregados y sin nombres (participación por formación y errores frecuentes por pregunta), con CSV que neutraliza fórmulas. Personas (no se puede quitar el último administrador; el alta exige cumpleaños e incorporación y la persona puede completar los suyos si faltan; el calendario los convierte en cumpleaños y aniversarios; eliminación del perfil confirmada con su correo, que conserva su contenido sin autoría, retira su nombre de «Revisado por» y borra sus bienvenidas y sus dos fechas). Operación (auditoría, purgas de retención, migraciones —también la reconstrucción de tablas sin perder las filas que dependen de ellas—, copias con `VACUUM INTO`, carga de la semilla que asocia cada persona a la cuenta que ya tenga con su correo, configuración de producción obligatoria). |
| `apps/web` | 201 | Acceso: activar la cuenta y crear una contraseña nueva desde los enlaces de los correos (comprobación del enlace, requisitos y errores). Calendario de empresa: cumpleaños y aniversarios desde la ficha, también tras editarla, sin duplicados. Alta de personas con cumpleaños e incorporación obligatorios. Firma «Judith Calet — Asesora Contable» en formaciones, tests y vistas previas. Enlaces internos del texto enriquecido por el router. Bienvenidas: una por persona; en la demo, las nuevas solo para personas ficticias, y las de las incorporaciones reales se pueden retocar. Creador: los formularios de los ocho tipos (abrir y guardar un contenido publicado no pierde nada; validación con resumen de errores; apoyos interactivos como el árbol de decisión, el clasificador, la comparativa y el gráfico), publicar, «Deshacer», archivar y restaurar con los permisos de cada rol, la propiedad de las revisiones y una evaluación vigente por área. Eliminación del perfil: recuentos del diálogo, confirmación con el correo, firma neutra e informes sin la persona. Lectura: fotografías del creador, referencias de «Explicamos», «Repasa» que encuentra su apartado aunque cambie de número y fechas en hora de Madrid. Puesta al día de lo que la demo guarda en el navegador (versiones 2 y 3) sin perder progreso ni borradores. Cálculos de los simuladores: recargos del art. 27 LGT, plazos de cuentas anuales, amortización contable y fiscal, devengo y asientos, comparados con casos resueltos a mano. |
| `packages/content` | 14 | Estructura de todo el contenido semilla validada con los esquemas zod. Al menos tres formaciones por área y, en Contabilidad, las siete previstas (las tres de base más importaciones y DUA, amortizaciones, bienes de inversión y facturas de anticipo). Los enlaces internos del contenido llevan a páginas que existen. Tests de 3 preguntas que se superan con 2. Evaluaciones de 10 que se superan con 8. Actualidad con los cinco bloques. «Ponte al día»: clientes de ejemplo ficticios con país de la lista y bienvenidas a las tres incorporaciones reales del 1 de septiembre de 2026, con la fecha de su ficha. Los enlaces de ejemplo están identificados como tales. Las fichas de personas llevan datos profesionales y, para el calendario de empresa, solo las fechas facilitadas: el cumpleaños (sin año), solo de Judith Calet; la incorporación, de Judith Calet, Lluís Gómez y Christopher Raudales. El perfil de la demostración, sin fotografía. |

## 3. Auditoría automática de accesibilidad

### 3.1 Método

- Chrome sin interfaz controlado con el protocolo DevTools carga cada ruta de la compilación de la demo, espera al encabezado principal y después 0,6 s, e inyecta axe-core 4.10.2.
- Etiquetas evaluadas: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `wcag22aa`.
- **Móvil:** emulación a 360 × 800 con pantalla táctil (los controles pequeños crecen a 44 px). **Escritorio:** 1440 × 900. Cada ruta, en tema claro y oscuro (`prefers-color-scheme`) y con movimiento reducido.
- En cada ruta también se mide el desbordamiento horizontal (`scrollWidth − clientWidth`) y se listan los elementos que ensanchan la página fuera de contenedores con desplazamiento propio. Además se cuenta que no haya más de una tarjeta protagonista por pantalla.
- Las rutas de empleado se recorren con el perfil de la demostración. Las de Gestión y Administración, con «Ver la demo como» › Administración. Con el perfil de empleado, esas rutas muestran «Acceso restringido», que también pasó la auditoría.

### 3.2 Resultados

| Grupo | Rutas | 360 px (claro y oscuro) | 1440 px (claro y oscuro) |
|---|---|---|---|
| Inicio y Aprender | `/`, `/aprender`, `/aprender/fiscal`, las formaciones `devengo-y-periodificacion` y `recargos-presentacion-fuera-de-plazo` (con su test final), `/aprender/fiscal/evaluacion` | 0 incidencias · 0 px | 0 incidencias · 0 px, más 1 falso positivo (término clave junto a un enlace, §3.3) |
| Consultar | `/consultar`, `/consultar/actualidad`, `/consultar/notas`, `/consultar/lecturas` | 0 incidencias · 0 px | 0 incidencias · 0 px |
| Participar | `/participar`, `/participar/agenda`, `/participar/calendario`, `/participar/contribuye` | 0 incidencias · 0 px | 0 incidencias · 0 px |
| Perfil y otras | `/perfil`, `/perfil/ajustes`, `/sobre` y una ruta inexistente (404) | 0 incidencias · 0 px | 0 incidencias · 0 px |
| Gestión | `/gestion`, el creador `/gestion/nuevo`, los editores nuevos de formación, noticia, documento, evento, comunicado, cliente y bienvenida, y la edición de una formación (`fis-01`) y de una evaluación del área (`eval-fiscal`) | 0 incidencias · 0 px (edición de `fis-01`: 296 px antes de la corrección) | 0 incidencias · 0 px, más 2 falsos positivos en la vista previa del editor (§3.3) |
| Administración | `/admin`, `/admin/personas`, `/admin/informes`, `/admin/auditoria`, `/admin/retencion` | 0 incidencias · 0 px (Retención: 38 px antes de la corrección) | 0 incidencias · 0 px |

### 3.3 Falsos positivos

- **Pestaña activa de la Agenda** (de la pasada anterior). Con un enlace a un evento inexistente, axe marcó «contraste insuficiente» en «Actuales y próximos»: texto blanco sobre `#EBEAE7`. Ese fondo no es el real. La cápsula activa es un elemento hermano que se desliza entre pestañas (`layoutId`), y axe no siempre lo detecta. Comprobado en el DOM: la cápsula está presente, es opaca y es marino `#172641`, así que el contraste real es 15,1:1.
- **«Idea clave» en la vista previa del editor.** axe calcula blanco sobre el crema de la página (1,06:1). La vista previa es una columna fija con desplazamiento propio y axe no resuelve bien el fondo de lo que hay dentro. Comprobado en el DOM, con la caja a la vista: el texto es blanco sobre marino `#172641` en tema claro y marino sobre crema en oscuro, por encima de 10:1. En la edición de `fis-01`, desplazando la columna hasta la caja, axe ya no la marca.
- **Término clave junto a un enlace partido en dos líneas** (`target-size`). axe toma la caja que une las dos líneas del enlace «Marco Conceptual del PGC» y la superpone al término «devengo». Los dos son objetivos dentro de una frase, que WCAG 2.5.8 exime. axe no aplica esa excepción porque Chrome trata siempre un `<button>` como `inline-block`, aunque se declare `inline`. Con el término a la vista, nada lo tapa. El mismo caso aparece a 1440 px en «Facturas de anticipo» (apartado 4: el término junto al enlace al art. 2.2 del Reglamento de facturación) cuando el enlace se parte en dos líneas.

### 3.4 Correcciones de esta pasada

| Hallazgo | Corrección |
|---|---|
| A 360 px, la regla de plazos de Retención ensanchaba la página 38 px. La animación de cada marca escribía su propio `transform` y borraba el `translateX` que la centra, así que en escritorio las marcas tampoco quedaban centradas en su punto | La posición va en un contenedor y la animación, dentro (`features/admin/RetentionSection.tsx` y `Admin.module.css`) |
| A 360 px, editar una formación con tablas ensanchaba la página 296 px. Los textos solo para lectores de pantalla de los botones de cada columna (`position: absolute`) escapaban del desplazamiento de la tabla | `position: relative` en el contenedor de la tabla del editor (`features/manage/editor/Editor.module.css`) |
| La tabla de participación de Informes se desplaza en móvil, pero no se podía alcanzar con el teclado | Región con nombre y enfocable, con anillo de foco (`features/admin/ReportsSection.tsx`) |
| La columna de vista previa del editor se desplaza, pero no se podía alcanzar con el teclado | Enfocable y con anillo de foco (`features/manage/EditorPage.tsx`) |
| «Insertar aquí» del editor bajaba el contraste del texto con `opacity: 0.55` | Discreto por el color (`--ink-3`, que cumple 4,5:1) y no por la opacidad (`Editor.module.css`) |

### 3.5 Pasada de la tarde del 29/10/2026

Cubre las cuatro formaciones nuevas de Contabilidad, la firma de todas las formaciones, los cumpleaños y aniversarios del calendario, el alta de personas y los cambios de Inicio, Aprender, Consultar y el pie. Mismo método que §3.1.

| Grupo | Rutas | Pasadas | Resultado |
|---|---|---|---|
| Calendario, perfil y administración (servidor de desarrollo) | `/participar/calendario` con `?dia=2026-11-26`, `2026-09-01` y `2027-09-01`, `/participar`, `/perfil`, `/perfil/ajustes`, una formación, `/admin` y `/admin/personas` | 36 | 0 incidencias · 0 px |
| Contabilidad (compilación de la demo) | `/aprender/contable`, `importaciones-y-dua`, `amortizaciones`, `bienes-de-inversion` y `facturas-de-anticipo` con dos de sus tests, `/aprender`, `/sobre`, el calendario del 26/11/2026 y `/perfil` | 44 | 0 incidencias · 0 px |
| Enlaces internos (compilación de la demo, tras corregirlos) | Contabilidad y sus cuatro formaciones nuevas, dos tests, una noticia con enlaces a formaciones e Inicio | 36 | 0 incidencias · 0 px |
| Incorporaciones, foto de Aprender, Consultar y pie (servidor de desarrollo) | `/`, `/aprender`, `/consultar`, `/participar` y `/sobre`; como administración, `/admin/personas`, `/gestion`, la edición de una bienvenida real y una bienvenida nueva | 29 | 0 incidencias · 0 px |
| Nota de VERI*FACTU de octubre de 2028 y cabeceras (servidor de desarrollo) | `/consultar`, `/participar`, `/aprender` con el mismo óvalo, la ficha de la nota nueva, su noticia, `/consultar/actualidad` e Inicio | 28 | 0 incidencias · 0 px |
| Pasada final (compilación de la demo) | `/`, `/aprender`, `/consultar`, `/participar`, `/participar/calendario`, `/sobre` y «Facturas de anticipo» | 28 | 0 incidencias · 0 px, más el falso positivo del término junto a un enlace (§3.3) en «Facturas de anticipo» a 1440 px |

| Hallazgo | Corrección |
|---|---|
| Un enlace interno del texto (`[texto](#/ruta)`) abría la otra página a media altura: el router lo trataba como «volver» con la misma clave para todas y restauraba la posición de otra página | Los enlaces internos del texto enriquecido van por el `Link` del router y la página empieza arriba (`lib/rich.tsx`, con prueba). Afectaba también a los enlaces de las noticias |
| Las capturas de la documentación salían en blanco | La demo se había compilado sin `VITE_BASE=/flm-campus/` y los recursos no cargaban en la captura. Se compila con esa base antes de capturar (§9) |
| Revisión cruzada de las siete formaciones contables: las bases del modelo 303 con prorrata se daban por dudosas en «Bienes de inversión» | Las instrucciones del 303 de 2026 dicen que las bases figuran siempre sin prorratear: corregido y alineado con «Importaciones y DUA» |
| El porcentaje de referencia de la regularización (art. 107 LIVA) y el periodo cuando el uso empieza más tarde | El definitivo del año en que se soportó el IVA; el año de inicio del uso y los cuatro (o nueve) siguientes |
| El IVA del anticipo en una importación | Se devenga con la importación, no con el anticipo; la regla del art. 75.Dos se limita a las compras interiores en «Amortizaciones» y «Bienes de inversión» |
| Anticipo en divisa, cuenta de los servicios ligados a un inmovilizado, casillas de los honorarios del despacho y justificación de los suplidos | Criterios alineados entre formaciones y marcados «confírmalo con el área» donde no hay criterio oficial expreso |
| Revisión independiente de los cambios de Inicio, Aprender, Consultar y el pie (13 observaciones) | Corregidas 11: al editar una bienvenida real, la persona ya no desaparece de la lista si se elige a otra; la foto de Unsplash no se ofrece como foto de eventos ni de formaciones; los mensajes de bienvenida se ciñen a los datos facilitados; el aviso legal distingue lo elaborado por FLM de lo de terceros; el enlace a flmexperts.com avisa de la pestaña nueva; el glifo de las redes se distingue al pasar el ratón; y cinco textos que habían dejado de ser ciertos. Quedan como están las mayúsculas de los puestos y el correo de Christopher Raudales, deducido del formato corporativo y anotado como pendiente de confirmar |

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
| M19 | Contadores dentro de círculos | **Corregido.** La insignia de avisos es una cápsula también con un solo dígito. Los contadores de las pestañas de Gestión (Todo, Borradores, Publicado, Archivado) ya lo eran |
| M20 | El botón «Cerrar» de los diálogos medía 36 px en escritorio | **Corregido.** Mide 44 px (verificado) |
| M22 | Faltaban los festivos de diciembre | **Resuelto en el contenido:** 8, 25 y 26 de diciembre, con la fuente oficial (DOGC). El 6 de diciembre de 2026 cae en domingo y no figura en el calendario laboral de Cataluña |
| M12 | Demasiadas regiones con nombre en formación, perfil y editor | **Pendiente (menor).** Nombrar solo las secciones de primer nivel; el resto se navega por encabezados |
| M17 | El H1 de la evaluación sectorial es genérico | **Se mantiene a propósito.** «Pon a prueba tus conocimientos» es el nombre fijado en el encargo. El área aparece en el antetítulo y en el título de la página («… · Contable») |
| M18 | Al enfocar una expresión de «La llegada», no se resalta la tarjeta asociada | **Pendiente (pulido).** Resaltar la tarjeta con `data-index` |
| M21 | Enlaces de fuentes de 17–22 px de alto | **Pendiente (opcional).** Ya cumplen 2.5.8 por la excepción de espaciado |

### 4.1 Revisión de código del creador, el flujo editorial y la eliminación de perfiles

Cuatro revisores independientes leyeron el código del creador, del flujo editorial, de la eliminación de perfiles, de los datos de la demo y de la API, y comprobaron cada sospecha con pruebas temporales. Otros cuatro agentes intentaron refutar cada hallazgo. De 42, **41 se confirmaron y se corrigieron**, cada uno con su prueba automática. El descartado era solo una diferencia de redacción entre la auditoría de la demo y la de la API. Los más relevantes:

| Ámbito | Hallazgo | Corrección |
|---|---|---|
| Creador | El bloque «Fotografía» se publicaba como imagen rota | Las fotos aprobadas se pintan con su componente y con el texto alternativo de quien publica |
| Creador | En el árbol de decisión, renombrar, duplicar o borrar un paso dejaba saltos rotos y se podía publicar | Las referencias se actualizan y la validación, también en la API, exige un árbol completo |
| Creador | Clasificador, comparativa, gráfico y ejemplo resuelto admitían datos que la lectura no podía mostrar | Validación y editores coherentes con lo que se ve publicado |
| Flujo editorial | Un autor podía publicar los cambios de una formación ajena si los había empezado administración | La propiedad de una revisión es la del contenido, en la demo y en la API |
| Flujo editorial | Tras un cambio de rol, un autor podía editar una evaluación del área | El tipo se comprueba en cada acción (`canHandleType`) |
| Flujo editorial | Publicar una segunda evaluación del área sustituía a la anterior y dejaba sin efecto los intentos superados | Una sola evaluación vigente por área; archivar la retira de verdad y el reconocimiento ya conseguido se conserva |
| Flujo editorial | Publicar cambios sin «Lo ha revisado el área» conservaba el «Revisado por» anterior | Vuelven a quedar pendientes de revisión |
| Eliminación del perfil | La API conservaba el nombre de la persona en «Revisado por» | Se retira junto con su autoría |
| Eliminación del perfil | La demo pedía el nombre para confirmar y la API, el correo | Las dos piden el correo |
| Datos de la demo | Al ponerse al día, un navegador con datos anteriores podía perder el test final de una formación publicada desde Gestión | La migración conserva todo y lleva cada test a su formación |
| API | «Guardar borrador» exigía el contenido completo | Los borradores se guardan a medias; el esquema completo se exige al publicar |

## 5. Pruebas funcionales en el navegador

Recorridos hechos con teclado y ratón sobre la demo. Los resultados detallados de la revisión experta están en su documento.

| Recorrido | Resultado |
|---|---|
| Formación completa: lectura → confirmar → test (2/3) → «El escalón» → revisar respuestas | Correcto. El foco pasa a «Hacer el test» y el resultado queda visible bajo la cabecera |
| Evaluación sectorial: introducción, preguntas y salida con «¿Salir del test?» | Correcto. Esc cierra; el foco inicial va a «Seguir con el test» y vuelve a la nota al margen |
| Agenda y calendario: fases en Europe/Madrid, detalle de evento, «Copiar enlace», rejilla con flechas, Inicio/Fin y Re Pág/Av Pág | Correcto. La exportación .ics la cubren las pruebas automáticas |
| Notas informativas: filtros, hoja lateral con miniatura del PDF, versiones y descarga | Correcto. La hoja atrapa el foco y lo devuelve al cerrar |
| Búsqueda global (Ctrl K) | Correcta. Esc cierra a la primera y el foco vuelve al origen |
| Gestión: el creador por destino (`/gestion/nuevo`), los editores de los ocho tipos, validación y resumen de errores con enlace a cada campo | Correcto. Los 26 tipos de bloque de la paleta (apartado y subapartado, texto, los cuatro recuadros, ejemplo resuelto, tabla, fotografía y los 13 apoyos interactivos) se añaden sin errores ni avisos en la consola, y la vista previa los pinta todos. «Partir de un ejemplo» → «Publicar» con confirmación → «Ver publicado» abre la formación en Aprender › Laboral con su firma y «Pendiente de revisión por el área». Publicar sin completar muestra, en cada tipo, el resumen de campos pendientes. Las reglas de cada rol las cubren `forms.test.ts`, `actions.test.ts` y la API |
| Eliminar el perfil (Administración › Personas) | Correcto. Bloqueado para la propia cuenta. El diálogo explica con recuentos reales qué se conserva y con qué firma, y qué bienvenida se retira. Pide el correo de la persona y los errores quedan enlazados al campo. El foco empieza en «Cancelar» y, al terminar, pasa al título «Personas». Las formaciones de la persona pasan a firmar «Área Fiscal de FLM» y sus noticias, «FLM». La auditoría lo anota sin datos personales. A 360 px, el diálogo no se sale |
| «Ponte al día» en Inicio | Correcto. Noticias, nuevos clientes, incorporaciones (Judith Calet, Lluís Gómez y Christopher Raudales, del 1 de septiembre de 2026; las tres últimas anunciadas, sin caducidad) y próximos eventos tras la bienvenida. Quien es autor o administrador ve en cada recuadro un atajo al creador («Nueva noticia», «Nuevo cliente», «Nueva bienvenida», «Nuevo evento») |
| Calendario de empresa: cumpleaños y aniversarios | Correcto. El 26 de noviembre sale «Cumpleaños de Judith Calet»; el 1 de septiembre de 2027, el primer aniversario de las tres incorporaciones de 2026 («1 año en FLM · desde el 1 de septiembre de 2026»). Cambiar el cumpleaños desde el perfil mueve la entrada sin duplicarla |
| Alta de una persona (Administración › Personas) | Correcto. Explica para qué se usan las fechas; sin cumpleaños (día y mes) o sin fecha de incorporación no se guarda, con los errores enlazados a cada campo. Las fichas incompletas se señalan y se pueden completar sin bloquear el acceso |
| Formaciones de Contabilidad | Correcto. Las siete aparecen en Aprender › Contabilidad, firmadas «Judith Calet — Asesora Contable», y se enlazan entre sí: el enlace abre la otra formación desde arriba |
| Pie | Correcto. Lema «Aprender juntos para asesorar mejor», «Síguenos» con LinkedIn e Instagram (glifo, nombre y aviso de pestaña nueva para lectores de pantalla), aviso de propiedad intelectual y enlaces del campus; sin sedes. A 360 px, nada se sale |
| Activar la cuenta y crear una contraseña nueva, contra la API en local con la web interna | Correcto, 19 comprobaciones. El enlace del correo abre su formulario y el token desaparece de la barra de direcciones. Se valida la longitud y la coincidencia antes de enviar. Al activar, la API abre la sesión. El enlace usado, el caducado y el recortado explican qué hacer. «He olvidado mi contraseña» envía el enlace. Tras guardar la nueva, la anterior ya no entra. axe sin incidencias en cada paso |
| Roles: Empleado, Autor y Administrador con «Ver la demo como»; rutas protegidas | Correcto. Sin permiso se ve «Acceso restringido» |
| 404 con sugerencia de sección | Correcto |
| **Versión nueva publicada con el campus abierto** (simulado ocultando un fragmento de la compilación) | **Corregido en esta pasada.** Antes salía «Unexpected Application Error!», la pantalla genérica en inglés de React Router. Ahora `RouteError` recarga la página una vez y, si vuelve a fallar en menos de 15 s, explica qué pasa y ofrece «Recargar la página» y «Volver al inicio» sin perder la cabecera. Vite también avisa (`vite:preloadError`) y la recarga es la misma |
| «La llegada»: una vez al día (Madrid), se interrumpe con cualquier tecla o toque y termina por seguridad a los 2,6 s | Correcto |
| Movimiento reducido (del sistema o del ajuste del campus) y tema oscuro | Correcto. Se muestra directamente el estado final y los contrastes se verificaron en oscuro |

## 6. Rendimiento y compilación

Compilación de la demo del 29/10/2026 por la tarde. Tamaños comprimidos con gzip.

| Fragmento | Tamaño | Cuándo se carga |
|---|---|---|
| `index` (armazón) | 24,7 KB | Siempre |
| `react` | 96,7 KB | Siempre (en caché entre versiones si no cambia) |
| `motion` | 54,2 KB | Siempre |
| `contenido` (contenido semilla de la demo) | 205,9 KB | Siempre en la demo; la versión privada lo pide a la API. Crece con las cuatro formaciones de Contabilidad (unas 26.000 palabras con sus fuentes) |
| `FormationPage` | 6,0 KB | Al abrir una formación (la lectura y los apoyos interactivos van en fragmentos propios) |
| `EditorPage` | 36,7 KB | Solo en Gestión, al abrir el editor |
| `pdf` (pdf.js) | 124,7 KB | Solo al previsualizar un PDF |

Cada página es un fragmento propio. Las fotografías se sirven en AVIF o WebP con dimensiones explícitas, así que la página no salta al cargar. Las tipografías están en el propio servidor, sin peticiones a terceros.

## 7. Seguridad y privacidad de la demo pública

- La demo no tiene servidor: no contiene secretos ni claves, y todo lo que se hace se guarda solo en el navegador (`localStorage`). Se puede borrar con «Restablecer».
- Solo se publican documentos de FLM aprobados para la demo. Los documentos de terceros (revista de AEDAF, presentación de la campaña de Sociedades y novedades de Cataluña) aparecen como fichas sin archivo.
- Las personas reales aparecen con su nombre y área públicos y con la fuente anotada. Solo llevan fotografía cuando FLM la ha aportado; el perfil de la demostración aparece con sus iniciales, sin foto. Las personas ficticias de relleno están marcadas como tales en Administración, y a las reales no se les atribuye ningún dato inventado: las bienvenidas de Judith Calet, Lluís Gómez y Christopher Raudales llevan el puesto, la sede y la fecha de incorporación que ha facilitado FLM, y el único cumpleaños que consta es el de Judith Calet, que lo ha dado ella.
- Las cabeceras de Aprender, Consultar y Participar llevan ilustraciones de búhos aportadas por FLM, acreditadas en «Sobre el campus».
- En la versión privada, la seguridad la cubren las 113 pruebas de la API (§2). Configuración y despliegue en [`apps/api/README.md`](../apps/api/README.md).

## 8. Qué no se ha probado

| Pendiente | Cómo hacerlo |
|---|---|
| Lectores de pantalla reales | NVDA con Chrome y con Firefox en Windows; VoiceOver con Safari en macOS e iOS. Recorrer la formación, el test, el calendario, la búsqueda y un editor. Hasta ahora los nombres accesibles se han comprobado en el árbol de accesibilidad de Chrome |
| Navegadores no Chromium | Firefox y Safari de escritorio y Safari en iOS, sobre todo `<dialog>`, `color-mix()` y las animaciones con `layoutId` |
| Dispositivos reales | Un iPhone y un Android de gama media: gestos, teclado virtual en los editores y rendimiento de las animaciones |
| Zoom del 200 % en escritorio | Comprobación manual. El reajuste a 320 px, equivalente al 400 %, ya está verificado |
| Despliegue privado | Docker y Caddy con HTTPS, SMTP real para los enlaces de activación, copias de seguridad en el servidor y restauración de prueba |
| Gestión y Administración contra la API | Hoy las dos compilaciones trabajan sobre el almacén del navegador; el cliente `apps/web/src/data/api.ts` ya sigue el contrato de la API, pero ninguna pantalla lo usa todavía. Las reglas de la API las cubren sus 113 pruebas |
| Contenido | Validación jurídica de las 16 formaciones y sus tests por cada área (todas en «pendiente de revisión»; para las cuatro nuevas de Contabilidad, los puntos concretos están en la [lista de lanzamiento](10-checklist-lanzamiento.md)), festivos locales de 2027 y sustitución de los enlaces de ejemplo |

## 9. Procedimiento manual antes de cada publicación

1. `npm run check` sin errores (también lo ejecuta GitHub Actions).
2. `npm run build:demo` con `VITE_BASE=/flm-campus/` (como GitHub Pages) y `vite preview` (configuración «demo-build» de `.claude/launch.json`). Sin esa base, la página carga en el navegador pero las capturas de `scripts/capturas.mjs` salen en blanco.
3. Recorrido con teclado desde una carga limpia: el primer Tab va a «Saltar al contenido»; Intro lleva al contenido sin cambiar de página.
4. Formación de prueba: confirmar la lectura, test con 2/3 y «El escalón». Después, «Restablecer».
5. Auditoría de axe en las rutas de §3.2 a 360 y 1440 px, en claro y oscuro: 0 incidencias (salvo los falsos positivos de §3.3) y 0 px de desbordamiento.
6. Tema oscuro y movimiento reducido en Inicio, en una formación y en el calendario.
7. Tras publicar, abrir la URL pública en una ventana privada: carga sin iniciar sesión, los enlaces directos con `#/…` funcionan y no hay errores en la consola.

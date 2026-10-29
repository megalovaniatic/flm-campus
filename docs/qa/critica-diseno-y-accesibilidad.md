# Crítica de diseño y auditoría de accesibilidad · FLM Campus

> **Actualización (29/10/2026, pasada final):** después de esta revisión se resolvieron 9 de los 13 pendientes (M10, M11, M13, M14, M15, M16, M19, M20 y M22). El estado vigente de cada hallazgo está en [`../09-informe-qa.md`](../09-informe-qa.md) §4.

> **Nota (29/10/2026, cambios posteriores a la revisión):** a petición de la clienta, el campus dejó de guardar y mostrar cumpleaños y fechas de incorporación (y con ellas los aniversarios y la trayectoria de «Tu recorrido»), el perfil de la demostración ya no lleva fotografía y todas las formaciones son voluntarias, sin obligatorias, fechas límite ni avisos de plazos. Lo que esta revisión dice de esas pantallas (las citas de I4, los plazos de Inicio y de la campana en M2, M3, el ejemplo «Antes del 15 nov» de la tabla de contraste y los cumpleaños del apartado «Calendario» del §6) se conserva como registro. Más tarde, el mismo día, la clienta pidió recuperar el cumpleaños (día y mes, sin año) y la fecha de incorporación solo para el calendario de empresa, que vuelve a mostrar cumpleaños y aniversarios calculados desde cada ficha (véase docs/04-arquitectura-y-recorridos.md); la trayectoria de «Tu recorrido» sigue retirada.

> **Fecha:** 29 de octubre de 2026 · **Entorno:** desarrollo, `http://localhost:5173` (rutas con hash) · **Norma:** WCAG 2.2 AA, el objetivo del proyecto, que incluye 2.1 AA · **Método:** skills `design:design-critique` y `design:accessibility-review` · **Referencia:** `docs/diseno/especificacion.md`, `docs/03-sistema-de-diseno.md` y `apps/web/src/styles/tokens.css`.

## Alcance y método

- **Navegador integrado** con pestaña propia a 1440×900 y 390×844. También a 320 px para comprobar el reajuste (equivale a un zoom del 400 %). Temas claro y oscuro con `prefers-color-scheme`.
- **Rutas recorridas:** `/`, `/aprender`, `/aprender/fiscal` y la formación `recargos-presentacion-fuera-de-plazo` con su apoyo interactivo; además `/aprender/contable/evaluacion`, `/consultar`, `/consultar/notas` (con la hoja de un documento), `/consultar/lecturas`, `/consultar/actualidad`, `/participar`, `/participar/agenda`, `/participar/calendario`, `/participar/contribuye`, `/perfil`, `/perfil/ajustes`, `/sobre` y `/acceso`. Con el rol de administración, cambiado desde el avatar con «Ver la demo como», se recorrieron `/gestion`, `/gestion/nuevo/evento`, `/admin` y `/admin/personas`.
- **Flujo completo de una formación:** «Marcar la lectura como terminada» y test respondido con B (correcta), C (correcta) y A (errónea), es decir, 2/3. Después, «El escalón» y «Revisar respuestas». Evaluación Contable: introducción, primera pregunta y diálogo «¿Salir del test?».
- **Teclado:**
  - Tab desde una carga limpia y enlace de salto.
  - Pestañas con flechas, Inicio y Fin; rejilla del calendario con flechas, Inicio, Fin y Av Pág.
  - Esc en diálogos, hojas, menús y en la búsqueda Ctrl K.
- **Comprobación automática:** un script propio en la página revisó:
  - el contraste de cada nodo de texto, componiendo las transparencias;
  - los objetivos táctiles de menos de 24 y de menos de 44 px;
  - los nombres accesibles, los ID duplicados, los encabezados, los puntos de referencia y el desplazamiento horizontal.

  Se repitió tras las correcciones en 19 rutas en claro y en 15 en oscuro. Los «fallos» de contraste por cápsulas activas dibujadas en un elemento hermano se revisaron a mano y son falsos positivos.
- **Movimiento:** se muestreó fotograma a fotograma «La llegada» en un iframe del mismo origen (duración e interrupción) y el desplazamiento al cambiar de página.
- **Limitaciones:**
  - No se ha probado con un lector de pantalla real (NVDA o VoiceOver). Los nombres se comprobaron en el árbol de accesibilidad de Chrome.
  - Actualidad, lecturas y festivos se estaban rellenando en paralelo. Actualidad y lecturas ya tenían contenido al final de la sesión; los festivos de diciembre aún no.

---

## 1. Resumen ejecutivo

FLM Campus ya se percibe como un producto de marca y no como una plantilla. El sistema editorial (Newsreader con Inter), la gramática de formas (círculo, cápsula y puente) y los dos momentos firma están muy cuidados. La base de accesibilidad es sólida:
- foco de doble anillo;
- patrones ARIA correctos en pestañas, rejilla del calendario, combobox y `<dialog>` nativo;
- regiones vivas;
- movimiento reducido con composición final;
- contraste del tema oscuro bien calibrado.

La revisión encontró **33 hallazgos: 1 crítico, 10 importantes y 22 menores**. **He corregido 20**, todos en `apps/web/src`, con `tsc --noEmit` sin errores tras cada lote. **Quedan 13 pendientes con propuesta.**

- **Crítico:** el enlace «Saltar al contenido» llevaba a «Página no encontrada», porque con rutas en el hash `#contenido` se leía como una página. Era lo primero que encontraba una persona que navega con teclado. **Corregido.**
- **Importantes, todos corregidos:**
  - pérdidas de foco al confirmar la lectura, al guardar con `ActionButton`, al elegir una sugerencia y al cerrar Ctrl K;
  - resultado del test tapado por la cabecera fija;
  - nombres accesibles pegados en unos 20 componentes («Octubre de 20265 documentos» se oía como «veinte mil…»);
  - deslizamiento de unos 450 ms en cada cambio de página;
  - interruptor apagado sin contraste;
  - «El escalón» y los anillos casi invisibles en oscuro;
  - el dato erróneo «Próximo · 27 oct» en la portada para un comunicado en curso.
- **Pendientes prioritarios:**
  - el estado «Lectura confirmada», que hoy es un botón apagado al 50 % y se anuncia tres veces;
  - el exceso de regiones nombradas;
  - la píldora de lectura flotante en móvil;
  - el pulido de los editores (marcadores y asterisco).

---

## 2. Puntuación por criterio (0–10)

| Criterio | Antes | Después | Comentario |
|---|---|---|---|
| Primera impresión y propósito | 9 | 9 | El titular es el menú; datos vivos en el primer pliegue a 1440 y a 390 px. |
| Usabilidad y flujos | 7,5 | 8,5 | Flujo de aprendizaje claro. Las pérdidas de foco y el resultado tapado ya están resueltos. |
| Jerarquía visual y tipografía | 9 | 9 | Escala editorial excelente, con una sola cifra protagonista por pantalla. |
| Coherencia con el sistema y la marca | 8 | 8,5 | Logotipos originales y rojo bien usado. Quedan contadores en círculo y la cápsula de estado como botón. |
| Movimiento y momentos firma | 8 | 9 | La llegada y El escalón tienen significado. Se han quitado el deslizamiento entre páginas y el rebote de más. |
| Accesibilidad (WCAG 2.2 AA) | 6 | 8,5 | El enlace de salto roto y los nombres pegados pesaban mucho; ahora quedan detalles. |
| Responsive (390 y 320 px) | 8 | 9 | Ya no hay recortes a 320 px; el móvil está muy trabajado (tira semanal, hoja de términos). |
| Tema oscuro | 7 | 8,5 | Tokens excelentes. Faltaban el escalón y los anillos, ya corregidos. |
| Microcopia | 8 | 8,5 | Tuteo profesional y errores útiles. Se han corregido plurales y duplicados. |
| **Global** | **7,8** | **8,7** | |

---

## 3. Crítica de diseño (formato `design:design-critique`)

### Impresión general

Es un campus con voz propia y una disciplina de marca poco habitual. «La llegada» convierte el titular en el menú, y el test como «pruebas de imprenta» firmadas por la autoría es memorable y útil. La mayor oportunidad no está en añadir nada, sino en rematar los estados intermedios: lectura confirmada, pendiente, resultado y modo oscuro, para que estén a la altura de los momentos firma.

### Usabilidad

| Hallazgo | Severidad | Recomendación |
|---|---|---|
| El enlace de salto abría un 404 (C1) | Crítico | Corregido: enfoca `<main>` sin navegar. |
| Foco perdido al confirmar la lectura y en botones de guardado (I1) | Importante | Corregido: `aria-disabled` mientras trabaja y foco a «Hacer el test». |
| Resultado del test bajo la cabecera (I2) | Importante | Corregido: el resultado se trae a la vista. |
| «Próximo · 27 oct» para un comunicado en curso (I8) | Importante | Corregido: «En curso · hasta el 27 nov». |
| Esc en Ctrl K solo vaciaba el campo; no devolvía el foco (I9) | Importante | Corregido. |
| «Lectura confirmada» como botón apagado (M11) | Menor | Pendiente: cápsula de estado legible. |
| Marcadores que parecen valores en editores (M13) | Menor | Pendiente: «p. ej., …» o itálica. |

### Jerarquía visual

- **Lo primero que se ve:** el H1 en Newsreader con las tres expresiones subrayadas por el degradado y el punto rojo final. Es correcto: es el menú y el mensaje.
- **Recorrido de lectura:** antetítulo con fecha y saludo, H1, entradilla, «Tu siguiente paso» (con filete degradado, la acción principal), Hoy en FLM, tira de datos, Actualidad, Lo que viene y la biblioteca. En las páginas interiores: migas, antetítulo, H1 con punto rojo y entradilla en itálica.
- **Énfasis:** se usa una sola cifra grande por pantalla (2/3 en el resultado, 375,00 € en el simulador y 11/8 en Notas). El rojo queda para puntos, trazos y portadas tipográficas (≥ 24 px). El degradado no pasa de filetes y trazos.
- **Mejora pendiente:** en la evaluación sectorial el H1 es genérico («Pon a prueba tus conocimientos») y el área solo aparece en el antetítulo (M17).

### Coherencia

| Elemento | Incidencia | Recomendación |
|---|---|---|
| Separación de cifras y etiquetas | Algunos componentes usaban separadores `sr-only` (filtros de Notas) y otros no («Octubre de 20265…») | Corregido: patrón `sr-only` en todos (I4). |
| Movimiento | Muelle del punto 520/22 frente al 520/26 de la especificación; deslizamiento global entre páginas | Corregido (M6, I5). |
| Gramática de formas | Contadores dentro de círculos (campana «6», «Pendiente de tu revisión 0») | Pendiente: cápsula (M19). |
| Nombres de sección | «Participar › Participa» | Corregido: «Formas de participar» (M4). |
| Objetivos de 44 px | Interruptor de 28 px, «Restablecer» de 30 px y «Cerrar» de 36 px | Interruptor y Restablecer corregidos; Cerrar, pendiente (M20). |

### Movimiento (medido)

| Momento | Especificación | Antes | Después |
|---|---|---|---|
| La llegada, fin perceptible | ≤ 1,5 s, una vez al día | ≈ 1,9 s (rebote del punto del 18 %) | ≈ 1,6 s (rebote del 11 %); opcional: adelantar el punto a 1,1 s |
| Interrupción de La llegada | Cualquier tecla, clic, toque o rueda | Tecla a 300 ms: composición final en el siguiente fotograma | Igual |
| El escalón | ≤ 1,5 s; sin escalón si no se supera | Línea de tiempo de 1,45 s; «Aún no» en tinta | Igual; ahora también visible en oscuro |
| Cambio de página | Sin animación de desplazamiento | Deslizamiento de ≈ 450 ms (de 1400 a 0 px) | Instantáneo |
| Movimiento reducido | Composición final | La llegada no se reproduce y las transiciones CSS duran 0,01 ms | Además, los anillos respetan el ajuste del campus |

---

## 4. Hallazgos por severidad

Estado: **Corregido**, con el archivo y cómo se verificó, o **Pendiente**, con propuesta.

### Crítico

| ID | Pantalla | Problema | WCAG | Estado |
|---|---|---|---|---|
| C1 | Todas: enlace «Saltar al contenido» | Con rutas en el hash, `href="#contenido"` se interpretaba como la ruta «contenido». Al pulsarlo con Intro se abría **«Página no encontrada»**. | 2.4.1 Evitar bloques; 2.1.1 Teclado | **Corregido** en `layout/AppShell.tsx`: evita la navegación, enfoca `<main>` y lo trae al inicio. Verificado: la URL no cambia y el siguiente Tab entra en el contenido. |

### Importantes

| ID | Pantalla | Problema | WCAG | Estado |
|---|---|---|---|---|
| I1 | Formación › Terminar; todos los `ActionButton` (guardar borrador, publicar, guardar ajustes, copiar enlace) | El botón usaba `disabled` mientras trabajaba y, en la lectura, también al confirmar. El foco caía en `<body>` (medido). | 2.4.3 Orden del foco | **Corregido** en `design/Button.tsx` (`aria-disabled` y clic bloqueado mientras está pendiente) y en `learn/FormationPage.tsx` (el foco pasa a «Hacer el test»). Verificado: el foco sigue en el botón durante reposo, pendiente, éxito y reposo. |
| I2 | Test final › Resultado («El escalón») | El foco iba al título con `preventScroll`. Con la última pregunta desplazada, «2/3» quedaba a 2 px del borde, bajo la cabecera fija de 72 px, y el momento firma se veía cortado. | 2.4.11 Foco no oculto (parcial); 1.3.2 | **Corregido** en `learn/quiz/QuizEngine.tsx`: el resultado se trae a la vista bajo la cabecera. Verificado: el título queda a 134 px. |
| I3 | Todas en desarrollo; Acceso; Árbol de decisión; apoyos con región viva | Los indicadores «primera vez» (`useRef(true)`) fallan con el doble montaje de StrictMode:<br>• al cargar, el foco saltaba a `<main>` y el primer Tab se saltaba el enlace de salto, la cabecera y la navegación;<br>• Acceso enfocaba el H2;<br>• el árbol desplazaba la página hasta él;<br>• las regiones vivas anunciaban el resultado inicial. | 2.4.3; 3.2.1 | **Corregido** comparando con el valor anterior en `AppShell.tsx`, `auth/AccessPage.tsx`, `widgets/ArbolDecision.tsx` y `widgets/ui.tsx` (`LiveRegion`). Verificado: el primer Tab va a «Saltar al contenido». |
| I4 | Notas, Actualidad, Consultar, formación (apartados, «Explicamos», índice, asientos), perfil, gestión, ajustes, editor, agenda, calendario, Formas de participar, avisos, tira de Inicio, pestañas con contador | Nombres accesibles pegados. Ejemplos: «Octubre de 20265 documentos», «Apartado 1Recargo…», «Explicamosrequerimiento previo», «Trayectoria0 reconocimientos», «Pendiente de tu revisión0», «Actuales y próximos7», «SistemaSigue el ajuste…», «Cumpleaños5 en octubre», «LinkedInFLM…» y «…1/12formaciones». Muchos títulos nombran regiones, así que el error también se oía al entrar en la sección. | 1.3.1; 2.4.6 Encabezados y etiquetas; 4.1.2 | **Corregido** con separadores `sr-only` en 20 componentes; el anillo de la tira de Inicio pasa a decorativo para no repetir el dato. Verificado en el árbol: «Octubre de 2026, 5 documentos», «Apartado 1. Recargo o sanción…» y «Explicamos: requerimiento previo». |
| I5 | Todas | `scroll-behavior: smooth` en `:root` deslizaba cada cambio de página unos 450 ms desde la posición anterior, con la página nueva ya pintada. | 2.3.3 (AAA); principio 6 de la especificación | **Corregido** en `styles/base.css`: los saltos internos ya pedían desplazamiento suave y respetan el movimiento reducido. Verificado: salto instantáneo. |
| I6 | Ajustes, apoyo «Recargo», editor (`Switch`) | Pista apagada al 22 % del marino: 1,56:1 frente al blanco, con la bola blanca sobre gris claro. Objetivo de 48×28 px. | 1.4.11 Contraste no textual; 2.5.8 | **Corregido** en `design/Field.module.css`: pista al 55 % (3,58:1) y zona táctil de 44 px sin cambiar el dibujo. |
| I7 | Tema oscuro: «El escalón» y anillos de progreso | La cápsula «Formación completada» era marino sobre el negro de FLM (1,15:1) y los puentes hacia el marino desaparecían. Los arcos, en burdeos (1,84:1) y marino (1,15:1), eran casi invisibles. | 1.4.11 | **Corregido** con los tokens `--ring-1..3` en `styles/tokens.css`: en claro reproducen el degradado oficial y en oscuro usan la versión aclarada, como ya hacían Laboral y Mercantil. Cambios en `design/ProgressRing.tsx` y `motion/Escalon.tsx`: la cápsula usa la superficie inversa (crema con texto marino en oscuro). Verificado con captura. |
| I8 | Inicio › tira «Participar» | «Ya está en línea la nueva web… · **Próximo · 27 oct**» el 29 de octubre, cuando el comunicado sigue en curso hasta el 27 de noviembre. Participar lo muestra «En curso». | 3.2.4 Identificación coherente | **Corregido** en `home/HomePage.tsx`: «En curso · hasta el 27 nov». |
| I9 | Búsqueda global (Ctrl K) | • Al abrir con Ctrl K y cerrar, el foco podía quedar en `<body>`.<br>• En el campo de búsqueda, Esc solo vaciaba el texto (hacían falta dos pulsaciones, aunque la ayuda dice «Esc cerrar»).<br>• El estado decía «1 resultados». | 2.4.3; 3.2.4; 4.1.3 | **Corregido** en `search/CommandPalette.tsx`: devuelve el foco al elemento de origen, Esc cierra a la primera y el plural es correcto. Verificado. |
| I10 | Consultar › «Prueba con» | Al elegir una sugerencia, el botón desaparecía y el foco se perdía. | 2.4.3 | **Corregido** en `library/ConsultHub.tsx`: el foco pasa a «Resultados para «BOICAC»: 3 resultados». Verificado. |

### Menores

| ID | Pantalla | Problema | WCAG | Estado |
|---|---|---|---|---|
| M1 | Formación (escritorio) | Tabla de recargos de 729 px en una columna de 671 px: desplazamiento horizontal y aviso «Desliza la tabla» también a 1440 px. | 1.4.10 (no falla: región desplazable con foco) | **Corregido** en `reading/Blocks.module.css`: las cabeceras numéricas pueden partirse; la tabla cabe y el aviso desaparece. |
| M2 | Inicio, avisos, apoyo de cuentas anuales, búsqueda | Plurales: «quedan 1 días», «Cierra en 1 días», «1 resultados». | — | **Corregido** («vence hoy», «queda 1 día», «Cierra mañana»). |
| M3 | Campana de avisos | Obligatorias en orden inverso: la que vence el 30 nov aparecía antes que la del 15 nov. | — | **Corregido** en `layout/NoticesButton.tsx`: orden por vencimiento. |
| M4 | Participar › Participa | Migas y título casi duplicados. | 2.4.6 | **Corregido:** «Formas de participar», como la sección del hub, en el título, las migas y el buscador. |
| M5 | Gestión y Administración | Aviso con título «Simulación» y texto «Simulación: este cambio…» (se repite y «este cambio» no tiene referente). | — | **Corregido** con texto propio. |
| M6 | Inicio › La llegada | Muelle del punto 520/22 (la especificación pide 520/26): rebote del 18 % y fin perceptible de unos 1,9 s. | Principio 6 | **Corregido** (520/26, a 1,2 s): unos 1,6 s. Opcional: adelantar a 1,1 s para cumplir ≤ 1,5 s estrictos. |
| M7 | Anillos de progreso | Ignoraban el ajuste «Movimiento: Reducido» del campus; solo leían el sistema. | 2.3.3 | **Corregido:** `useReducedMotionPref()`. |
| M8 | Banda de demostración (táctil) | «Restablecer» de 30 px (el proyecto pide 44). | 2.5.8 (cumple 24) | **Corregido:** zona táctil de 44 px con `pointer: coarse`. |
| M9 | 320 px / zoom del 400 % | El avatar de la cabecera y «Perfil» en la barra inferior se recortaban 17 px; los botones largos («Cargar ejemplos para probar la revisión») se salían. | 1.4.10 Reajuste | **Corregido:** columnas `minmax(0,1fr)`, sin la palabra «Campus» por debajo de 360 px y botones en dos líneas por debajo de 480 px. Verificado: `scrollWidth` = 320 en 8 rutas. |
| M10 | Formación › Terminar | Triple anuncio al confirmar la lectura: el botón (`aria-live`), una región `sr-only` y el aviso emergente dicen «Lectura confirmada». | 4.1.3 (verbosidad) | **Pendiente.** Quitar `aria-live` del botón en este uso y mantener la región con el siguiente paso. |
| M11 | Formación › Terminar | «Lectura confirmada» es un botón desactivado al 50 % (2,86:1). Está exento por inactivo, pero es la confirmación principal del recorrido. | 1.4.3 (exento) | **Pendiente.** Mostrarlo como cápsula de estado (icono y texto, ≥ 4,5:1), no como botón apagado. |
| M12 | Formación, perfil, ajustes, editor | Exceso de puntos de referencia: cada `section` con `aria-labelledby` es una región (hasta 12 en una formación, más `header` y `footer` anidados). | 1.3.1 (buena práctica) | **Pendiente.** Nombrar solo las secciones de primer nivel; el resto se navega por encabezados. |
| M13 | Editores | Marcadores de ejemplo que parecen valores («Desayuno Laboral», en tinta terciaria a 6:1). | 3.3.2 (buena práctica) | **Pendiente.** Usar «p. ej., Desayuno Laboral» o `::placeholder` en itálica. |
| M14 | Editores | El asterisco de obligatorio no se explica en pantalla. | 3.3.2 | **Pendiente.** Añadir «Los campos con * son obligatorios» al principio del formulario. |
| M15 | Evaluación › «¿Salir del test?» | El foco inicial va a «Cerrar». | 2.4.3 (buena práctica) | **Pendiente.** Llevar el foco a la acción segura «Seguir con el test». |
| M16 | Formación (móvil) | La píldora «Te quedan N min / Has llegado al final» flota bajo la cabecera y tapa parte del texto o de un elemento enfocado. | 2.4.11 (riesgo) | **Pendiente.** Integrarla en la cabecera o sumar su alto a `scroll-padding-top`. |
| M17 | Evaluación sectorial | H1 genérico «Pon a prueba tus conocimientos». | 2.4.6 | **Pendiente.** Cambiarlo por «Evaluación de Contable» (u otra área) y mantener el antetítulo. |
| M18 | Inicio › La llegada | La especificación pide que, al pasar o enfocar una expresión, el trazo pase de 3 a 5 px y su columna de la tira se resalte. Hoy solo crece el trazo, y lo hace hasta 6 px. Además, tras interrumpir, el tercer trazo aún se dibuja 160 ms por la transición CSS. | — | **Pendiente.** Resaltar la tarjeta asociada con `data-index` y anular la transición mientras dure `data-play`. |
| M19 | Campana y Gestión | Contadores dentro de círculos («6», «0»): la gramática reserva el círculo para personas y estados. | Marca | **Pendiente.** Usar la cápsula (radio completo) también con un solo dígito. |
| M20 | Diálogos (escritorio) | Botón «Cerrar» de 36 px; el proyecto pide 44 y cumple 2.5.8. | 2.5.8 | **Pendiente.** Usar 44 px, como en móvil. |
| M21 | Fuentes de la formación y tabla del perfil | Enlaces en bloque de 17 a 22 px de alto; cumplen por la excepción de espaciado. | 2.5.8 (cumple) | **Pendiente (opcional).** `min-height: 24px`. |
| M22 | Calendario (contenido) | Diciembre sin los festivos nacionales del 6 y del 8; los festivos se estaban cargando. | — | **Pendiente** (equipo de contenido). |

---

## 5. Auditoría de accesibilidad (formato `design:accessibility-review`)

**Norma:** WCAG 2.2 AA · **Fecha:** 29/10/2026

### Resumen

**Incidencias encontradas:** 33 · **Críticas:** 1 · **Importantes:** 10 · **Menores:** 22 · **Corregidas:** 20 · **Pendientes:** 13.

### Por principio

| Principio | Incidencias |
|---|---|
| Perceptible | I4 (1.3.1), I6 e I7 (1.4.11), M1 y M9 (1.4.10), M11 (1.4.3, exento), M12 (1.3.1) |
| Operable | C1 (2.4.1, 2.1.1), I1, I3, I9, I10 y M15 (2.4.3), I2 y M16 (2.4.11), I5 y M7 (2.3.3), I6, M8, M20 y M21 (2.5.8), I4, M4 y M17 (2.4.6) |
| Comprensible | I8 (3.2.4), I3 (3.2.1), M13 y M14 (3.3.2) |
| Robusto | I4 (4.1.2), I9 y M10 (4.1.3) |

### Comprobación de contraste

| Elemento | Primer plano | Fondo | Ratio | Requerido | ¿Cumple? |
|---|---|---|---|---|---|
| Texto principal | #172641 | #F8F6F2 (papel) | 14,0:1 | 4,5:1 | Sí |
| Texto secundario | #4F5661 | #F8F6F2 | 6,86:1 | 4,5:1 | Sí |
| Texto terciario sobre crema | #5C636E | #EFEBE4 | 5,10:1 | 4,5:1 | Sí |
| Rojo oscuro (plazos «Antes del 15 nov») | #90101A | #F8F6F2 | 8,55:1 | 4,5:1 | Sí |
| Antetítulos (vino) | #6C131C | #F8F6F2 | 11,13:1 | 4,5:1 | Sí |
| Botón principal | #FFFFFF | #172641 | 15,11:1 | 4,5:1 | Sí |
| Insignia de avisos | #FFFFFF | #90101A | 9,23:1 | 4,5:1 | Sí |
| Rojo FLM como texto | #E53327 | blanco / papel | 4,34 / 4,02:1 | 3:1 (≥ 24 px) | Sí: solo en portadas «Art. 27», en el punto del H1 y en gráficos. En las 19 rutas no hay texto rojo pequeño. |
| Oscuro: texto | #F3EFE8 | #081225 | 16,31:1 | 4,5:1 | Sí |
| Oscuro: secundario | #B7BCC6 | #0E1A31 | 9,10:1 | 4,5:1 | Sí |
| Oscuro: terciario | #8F96A3 | #0E1A31 | 5,83:1 | 4,5:1 | Sí |
| Oscuro: acento | #FF8A7F | #081225 | 8,18:1 | 4,5:1 | Sí |
| Interruptor apagado (antes → ahora) | #CCD0D5 → #7F8897 | blanco | 1,56 → 3,58:1 | 3:1 | No → **Sí** |
| Oscuro: arco burdeos (antes → ahora) | #792C35 → #C9707A | #0E1A31 | 1,84 → 5,02:1 | 3:1 | No → **Sí** |
| Oscuro: cápsula del escalón (antes → ahora) | #172641 → #EFEBE4 | #0E1A31 | 1,15 → 14,6:1 | 3:1 | No → **Sí** |

### Navegación con teclado

| Elemento | Orden con Tab | Intro/Espacio | Esc | Flechas |
|---|---|---|---|---|
| «Saltar al contenido» | Primero (tras I3) | Lleva al contenido (antes, a un 404) | — | — |
| Navegación principal | Tras la marca; `aria-current="page"` | Navega; el foco pasa a `<main>` | — | — |
| Pestañas «Áreas» (Aprender) | Una parada (tabindex itinerante) | Activación automática | — | ← → Inicio Fin; refleja `?area=` en la URL |
| Rejilla del calendario | Una parada | Selecciona el día y actualiza el panel | — | ← → ↑ ↓, Inicio/Fin de semana, Re Pág/Av Pág de mes; anuncia «Diciembre de 2026: 12 entradas» |
| Test (radios nativos) | Grupo `fieldset` | Intro comprueba | — | ↑ ↓ cambian de opción. El foco va a la nota al margen y después a la siguiente pregunta. |
| Diálogo «¿Salir del test?» | Foco atrapado (inicio en «Cerrar», M15) | — | Cierra y devuelve el foco al enlace | — |
| Hoja de un documento (Notas) | Foco atrapado | — | Cierra y devuelve el foco al título del documento | — |
| Menú del avatar y avisos | Botón con `aria-expanded` | Abre con el foco en el primer enlace | Cierra y vuelve al botón | — |
| Búsqueda Ctrl K | Combobox con `aria-activedescendant` | Abre el resultado | Cierra a la primera y devuelve el foco (tras I9) | ↑ ↓ |
| Agenda «Ver detalle» | Botón con `aria-expanded` | Despliega; la etiqueta cambia a «Ocultar detalle» | — | — |
| Interruptores y filtros | `role="switch"` / `radiogroup` nativo | Conmutan o seleccionan | — | Flechas en los grupos de radios |

### Lector de pantalla (árbol de accesibilidad de Chrome)

| Elemento | Se anuncia como | Incidencia |
|---|---|---|
| Título de mes (Notas, Actualidad) | «Octubre de 2026, 5 documentos», encabezado 2 y nombre de región | Corregido (antes «…20265…») |
| Apartado de una formación | «Apartado 1. Recargo o sanción: lo decide el requerimiento previo» | Corregido |
| Recuadro «Explicamos» | Nota «Explicamos: requerimiento previo» | Corregido |
| Opción del test tras comprobar | «B. No hay recargo… (respuesta correcta)»; la elegida, «(tu respuesta: incorrecta)» | Correcto |
| Resultado del test | Encabezado «2 de 3 aciertos. Superado» (la cifra grande está oculta) y región viva «Resultado: 2 de 3 aciertos. Superado.» | Correcto |
| «El escalón» | Imagen «Formación completada» | Correcto |
| Simulador del recargo | Deslizador con `aria-valuetext` («4 meses completos. Presentación dentro del 5.º mes. Recargo del 5 %»); el odómetro está oculto; estado «Recargo a pagar: 375,00 €…» | Correcto |
| Tira de Inicio | «Aprender: 1/12 formaciones completadas» | Corregido (antes, cifras pegadas y el anillo repetido) |
| Pestañas con contador | «Actuales y próximos: 7», seleccionada | Corregido |
| Opciones de Ajustes | «Sistema. Sigue el ajuste de tu dispositivo», botón de opción | Corregido |
| Día del calendario | «Jueves, 29 de octubre, hoy: sin entradas», seleccionado | Correcto |
| «Marcar la lectura como terminada» | «Confirmando…» y después «Lectura confirmada» tres veces | Pendiente (M10) |

### Correcciones prioritarias

1. **C1 Enlace de salto:** afecta a todas las personas que usan teclado o lector de pantalla desde el primer Tab. Corregido.
2. **I1–I3, I9 e I10 (gestión del foco):** el foco no debe caer nunca en `<body>` tras una acción. Corregidos. Repetir la prueba con NVDA y Chrome.
3. **I4 Nombres pegados:** mejoran la comprensión de títulos, regiones y controles para lectores de pantalla. Corregido. Al crear componentes nuevos, seguir el patrón `sr-only` de separación.

---

## 6. Lo que funciona especialmente bien

- **La portada.** El titular es el menú y los datos vivos (siguiente paso, Hoy en FLM, progreso, agenda, biblioteca) aparecen en el primer pliegue a 1440 y a 390 px. «La llegada» se reproduce una vez al día, se interrumpe al instante y, con movimiento reducido, deja la composición final idéntica.
- **«Pruebas de imprenta».**
  - Usa `fieldset`/`legend` y radios nativos.
  - La opción errónea se tacha con un anillo abierto en tinta (nunca en rojo) y la correcta se subraya.
  - La nota al margen va firmada por la autoría (con foto y cargo) e incluye «Por qué no:» y «Repasa:», enlazada en la revisión.
  - El foco pasa a la nota y una región viva sin redundancias anuncia el resultado.
- **«El escalón».** Usa la geometría de la marca, sin letras ni confeti, con una línea de tiempo de 1,45 s y la cápsula «Formación completada» con marca. Si no se supera, no hay escalón y el veredicto «Aún no» aparece en tinta.
- **Apoyo interactivo «Recargo».** Etiquetas visibles, ayudas enlazadas, `aria-valuetext` descriptivo, región de estado, gráfico de escalones con trama a partir de 12 meses, comparación con el requerimiento, fuentes enlazadas y fecha de verificación («Cálculo orientativo con las reglas verificadas a 28/10/2026»).
- **Calendario.** Implementa el patrón de rejilla completo (flechas, Inicio/Fin y Re Pág/Av Pág, con anuncio del mes). Cada tipo lleva icono, color y texto («Festivo» siempre escrito). En móvil se convierte en tira semanal con lista por días. Los cumpleaños solo aparecen con consentimiento y sin año.
- **Notas informativas.** Miniatura real de la primera página, versión vigente e historial, «Descargar (PDF · 3,1 MB)» visible, hoja lateral con Esc y retorno del foco, y filtros como `radiogroup` nativo con recuentos bien anunciados.
- **Tema oscuro.** Los tokens están bien calibrados: no hay fallos de contraste de texto en 15 rutas, el logotipo va sobre placa clara y el oscuro tiene tonos propios para Laboral y Mercantil.
- **Disciplina de marca.**
  - Solo se usan los logotipos originales (PNG o WebP), sin pseudologotipos.
  - El rojo #E53327 queda reservado a puntos, trazos y cifras grandes.
  - El degradado se limita a filetes y anillos.
  - Las personas reales y ficticias están rotuladas en Administración, y la demo rotula «Simulación».
- **Formularios.** Etiquetas visibles, ayudas con `aria-describedby`, errores con `role="alert"` y un resumen enfocable con botones que llevan a cada campo («Revisa los 3 campos marcados antes de continuar»).
- **Microcopia.** Tuteo profesional y mensajes que dicen qué ha pasado y qué se puede hacer. Por ejemplo, el estado vacío de Actualidad lleva a las notas informativas.

---

## 7. Recomendaciones prioritarias (pendientes)

1. **Estado «Lectura confirmada» (M11 y M10).** Es el hito del recorrido de aprendizaje. Conviene mostrarlo como cápsula de estado legible, con icono y texto a ≥ 4,5:1, en lugar de un botón apagado, y anunciarlo una sola vez.
2. **Puntos de referencia (M12).** Nombrar solo las secciones de primer nivel. Con 10 o 12 regiones por página, la navegación por regiones del lector pierde utilidad.
3. **Píldora de lectura en móvil (M16).** Integrarla en la cabecera para que no tape el texto ni un elemento enfocado.
4. **Editores (M13, M14).** Marcar los ejemplos con «p. ej.» o en itálica y explicar el asterisco.
5. **Pulido de marca y movimiento (M18, M19, M6).**
   - Resaltar la tarjeta de la tira al enfocar una expresión.
   - Usar cápsulas para los contadores.
   - Adelantar el punto de La llegada a 1,1 s si se quiere cumplir ≤ 1,5 s estrictos.
6. **Validación con tecnologías de apoyo.** Repetir los flujos de test, calendario y búsqueda con NVDA y Chrome (Windows) y con VoiceOver y Safari (iOS), y probar con zoom del 200 % en escritorio.
7. **Gobierno del sistema.** Documentar los tokens nuevos `--ring-1`, `--ring-2` y `--ring-3` en `docs/03-sistema-de-diseno.md` (§2.1 y §2.2).

---

## Anexo A · Archivos modificados (`apps/web/src`)

| Archivo | Cambio |
|---|---|
| `layout/AppShell.tsx` | Enlace de salto sin navegación (C1); foco a `<main>` solo cuando cambia la ruta (I3). |
| `styles/base.css` | Sin `scroll-behavior: smooth` global (I5). |
| `styles/tokens.css` | Tokens `--ring-1..3` en claro y oscuro (I7). |
| `design/Button.tsx` / `Button.module.css` | `ActionButton` con `aria-disabled` mientras trabaja (I1); botones en dos líneas por debajo de 480 px (M9). |
| `design/Field.module.css` | Contraste y zona táctil del interruptor (I6). |
| `design/Tabs.tsx` | Separador del contador (I4). |
| `design/ProgressRing.tsx` | Ajuste de movimiento del campus, paradas en oscuro y opción `decorative` (I7, M7, I4). |
| `motion/Escalon.tsx` | Cápsula en superficie inversa y paradas `--ring-*` (I7). |
| `features/learn/FormationPage.tsx` | Foco a «Hacer el test» y separador del apartado (I1, I4). |
| `features/learn/quiz/QuizEngine.tsx` | Resultado a la vista bajo la cabecera (I2). |
| `features/learn/reading/Blocks.tsx`, `Blocks.module.css`, `ReadingAids.tsx` | «Explicamos», índice y tabla de escritorio (I4, M1). |
| `features/learn/widgets/ArbolDecision.tsx`, `ui.tsx`, `CalendarioCuentas.tsx`, `Journal.tsx` | Compatibles con StrictMode, plural y separadores (I3, M2, I4). |
| `features/home/HomePage.tsx`, `Arrival.tsx` | «En curso», plurales, separadores, anillo decorativo y muelle del punto (I8, M2, I4, M6). |
| `features/library/NotesPage.tsx`, `NewsList.tsx`, `ConsultHub.tsx` | Separadores y foco tras una sugerencia (I4, I10). |
| `features/search/CommandPalette.tsx`, `searchIndex.ts` | Foco de vuelta, Esc y plural; «Formas de participar» (I9, M4). |
| `features/community/AgendaEntry.tsx`, `CalendarPage.tsx`, `ContributePage.tsx` | Separadores y nuevo título «Formas de participar» (I4, M4). |
| `features/profile/ProfilePage.tsx`, `Recognitions.tsx`, `SettingsPage.tsx` | Separadores (I4). |
| `features/manage/ManagePage.tsx`, `editor/fields.tsx`; `features/admin/AdminPage.tsx` | Separadores y textos de «Simulación» (I4, M5). |
| `features/auth/AccessPage.tsx` | Foco al cambiar de vista compatible con StrictMode (I3). |
| `features/about/LiveSystem.tsx` | Separadores de las muestras de color (I4). |
| `layout/NoticesButton.tsx`, `DemoBand.module.css`, `Header.module.css`, `MobileTabBar.module.css` | Orden y plurales de los avisos; zona táctil; reajuste a 320 px (M3, M2, M8, M9). |

No se han tocado `packages/content` ni la lógica de `packages/shared`. Tras cada lote se ejecutó `npx tsc --noEmit -p apps/web/tsconfig.json` sin errores, y tras el último lote se recorrieron 24 rutas sin errores en la consola.

## Anexo B · Notas de la sesión

- Al no poder abrir más pestañas, cerré una pestaña antigua del panel que apuntaba a `file:///…/apps/web/index.html`, que no se puede usar en el navegador integrado. Todo el trabajo se hizo en una pestaña propia.
- **Estado de la demo en este navegador:**
  - la formación «Presentar fuera de plazo…» queda completada (lectura confirmada y 2 intentos del test con 2/3);
  - hay una respuesta sin guardar en la evaluación Contable.

  Se restablece con «Restablecer», en la banda de demostración.
- Al probar «Copiar enlace» en la agenda, se copió al portapapeles el enlace del evento «Comida de Navidad».
- **Trabajo en paralelo durante la revisión:**
  - otros cambios modificaron `Arrival.tsx` (red de seguridad de 2,6 s) y `searchIndex.ts` (`areaName` para noticias de área general);
  - la consola registró un fallo transitorio de la búsqueda global con noticias «general», que ya estaba corregido al revisarlo;
  - mis ediciones se aplicaron sobre esas versiones.
- **Contenido observado:** faltan los festivos de diciembre (M22).

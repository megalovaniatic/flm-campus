# FLM Campus · Especificación de diseño para construcción

> Concepto: **«Círculo de confianza»** · Lema: *«Aprender juntos para asesorar mejor.»*
> Base elegida por el jurado (2 de 3 votos) con injertos de «Punto y seguido» (sistema editorial), «Vasos comunicantes» (geometría de la marca: «El escalón») y «Círculo abierto» (capa de herramienta).
> Esta especificación es la referencia obligatoria para cualquier pantalla. Si algo no está aquí, se resuelve con los mismos principios.

## 1. Principios

1. **La marca no se toca; se usa.** Logotipos: solo los PNG originales de `apps/web/public/brand/` sobre fondo claro (en modo oscuro, sobre una placa clara en cápsula). Nunca recolorear, recortar, animar por dentro ni componer pseudologotipos: **ninguna letra dentro de un círculo**, ningún círculo «C», ninguna cápsula blanca con palabra en mayúsculas sobre degradado que imite FISCAL/LABORAL/MERCANTIL.
2. **Gramática de formas con significado fijo.**
   - **Círculo** = persona real (foto o iniciales de dos letras) o estado (glifo).
   - **Cápsula** (radio completo) = acción, etiqueta, estado, lugar o momento.
   - **Puente** (conector líquido entre dos círculos, geometría de `FLM-Diagonal.png`) = conexión creada por una acción (completar, aprobar, sesiones de un mismo evento). Nunca se une al logotipo.
   - **Rectángulo** con radio pequeño (6–8 px) = documento o imagen de archivo.
3. **Utilidad antes que eslogan.** La primera pantalla muestra datos vivos (siguiente paso, progreso, novedades, agenda) también a 1366×768 y 390×844.
4. **El rojo se mira, no se lee.** `#E53327` solo en gráficos, puntos, trazos y texto ≥ 24 px. El texto rojo pequeño va en `--flm-rojo-oscuro #90101A`. Botón principal: marino con texto blanco.
5. **El color nunca va solo.** Áreas, estados y tipos se nombran siempre por escrito (y con icono o forma).
6. **Movimiento con significado.** Dos momentos firma como máximo (La llegada y El escalón), una vez al día o por logro, ≤ 1,5 s, interrumpibles, sin bucles infinitos. Con movimiento reducido, la composición final dice lo mismo.
7. **Nada inventado.** Sin fotos de stock de personas (única excepción, pedida por FLM: la cápsula de Aprender, de Unsplash y acreditada), sin cifras inventadas, sin datos personales inventados de personas reales. En la demo todo lo simulado se rotula.

## 2. Tokens (ver `apps/web/src/styles/tokens.css`)

| Uso | Token | Valor |
|---|---|---|
| Rojo FLM (logotipo) | `--flm-rojo` | #E53327 |
| Rojo oscuro (web) — texto rojo pequeño, botón peligro | `--flm-rojo-oscuro` | #90101A |
| Burdeos (cápsula LABORAL) | `--flm-burdeos` | #84343D |
| Marino FLM — texto principal, acción principal | `--flm-marino` | #172641 |
| Negro (web) — fondo modo oscuro | `--flm-negro` | #081225 |
| Crema (web) — superficies hundidas | `--flm-crema` | #EFEBE4 |
| Gris (web) — texto secundario | `--flm-gris` | #4F5661 |
| Papel — fondo general | `--paper` | #F8F6F2 |
| Degradado oficial | `--flm-gradient` | rojo → burdeos → marino (muestreado) |

**Áreas** (meseta de color de cada cápsula oficial): Fiscal = rojo, Laboral = burdeos, Mercantil = marino, **Contable = la rampa completa del degradado** («la suma de las tres»). En la interfaz el área se muestra con un punto o anillo de su color + el nombre escrito. Variable CSS por área: `--area` vía `[data-area='fiscal|laboral|mercantil|contable']`. Para Contable, donde se necesite un relleno usar `var(--area-contable-fill)` (el degradado de trazo, aclarado en oscuro); donde se necesite un color plano (texto, borde fino) usar `--flm-marino`.

**Degradado**: el completo (con #E53327) solo en trazos, anillos, filetes, bandas y conectores. Como superficie, solo su tramo desde #B8302D (`--grad-spotlight`) o la pieza de redes recreada con círculos (`--grad-redes`, en Participar), en una única tarjeta protagonista por pantalla —la de la acción principal—, que no ocupa más de 1/6 de la primera vista a 1440 × 900. Como mucho, un segundo foco claro con lavados ≤ 8 % (12 % en oscuro). Lo demás, papel y tarjetas blancas.

**Secciones** = tramos del degradado, solo como trazo en el cromo; **áreas** = mesetas en el contenido; **Toda la firma** = las tres mesetas.

## 3. Tipografía

- **Newsreader** (variable, `opsz` 6–72): titulares (opsz 72, peso 380–440, tracking −0,02 em), lectura larga (opsz 16–18, 20/32 en escritorio, 18/29 en móvil, columna de 66 caracteres), entradillas e itálicas expresivas. Clase utilitaria: `.serif`.
- **Inter** (variable, `opsz`, la de flmexperts.com): interfaz, navegación, formularios, metadatos, cifras tabulares (`font-variant-numeric: tabular-nums`).
- **Belleza** (fuente de destacados de flmexperts.com): **solo** en el recuadro «Explicamos [TÉRMINO]» de las formaciones, en mayúsculas espaciadas, como en el LinkedIn de FLM.
- Escala en `tokens.css` (`--text-*`). Titulares con `text-wrap: balance`; párrafos con `text-wrap: pretty` y `hyphens: auto` (lang es).
- Antetítulos: Inter 12/16, mayúsculas, peso 600, +0,14 em, color `--flm-vino #6C131C` sobre claro.

## 4. Estructura y navegación

- **Escritorio (≥ 1024 px)**: cabecera fija de 72 px (papel 85 % + desenfoque, filete inferior al desplazar). Izquierda: `flm-horizontal.png` (32 px de alto) + filete vertical 1×24 px + «Campus» (Inter 600, 17 px). Navegación: **Inicio · Aprender · Consultar · Participar**; indicador activo = cápsula tintada (rojo al 8 %) más la gota: un punto rojo de 6 px bajo la etiqueta que viaja con `layoutId` (se estira como una gota). Derecha: cápsula «Buscar · Ctrl K», campana de avisos, avatar con menú (Perfil, Ajustes, Gestión, Administración, Ver como, Cerrar sesión).
- **Móvil (< 1024 px)**: barra superior de 56 px (logotipo + «Campus», buscar, avatar) y barra inferior de 64 px + zona segura: Inicio, Aprender, Consultar, Participar, Perfil. Pestaña activa = icono dentro de un círculo marino de 40 px + etiqueta en negrita.
- **Pie**: `flm-crowe-horizontal.png` (oficial, con «A business associate of Crowe Global») y el lema; «Síguenos» con enlace directo a LinkedIn e Instagram de FLM, cada uno con su glifo (Simple Icons); aviso de propiedad intelectual (lo que FLM elabora para el campus es suyo y de uso interno: no se copia, extrae ni difunde sin autorización; lo de terceros conserva sus derechos); enlaces (Sobre el campus, Accesibilidad, Privacidad, flmexperts.com) y aviso de demostración. Sin sedes desde el 29/10/2026.
- **Rutas** (hash): `/`, `/aprender`, `/aprender/:area`, `/aprender/:area/:slug`, `/aprender/:area/:slug/test`, `/aprender/:area/evaluacion`, `/consultar`, `/consultar/actualidad(/:slug)`, `/consultar/notas(/:id)`, `/consultar/lecturas(/:id)`, `/participar`, `/participar/agenda(/:slug)`, `/participar/calendario`, `/participar/contribuye`, `/perfil`, `/perfil/ajustes`, `/gestion(...)`, `/admin(...)`, `/sobre`, `/acceso`, `*`.
- Rejilla: contenedor `--content-max` (82 rem) con `--gutter`; lectura `--reading-max` (42 rem).
- Tarjetas: superficie blanca, borde 1 px `--line`, radio 24 px (20 px en móvil), sin sombra en reposo, salvo la tarjeta protagonista y el foco claro; sombra `--shadow-2` solo en elevación (hover en escritorio, capas flotantes).

## 5. Momentos firma

### 5.1 La llegada (Inicio)
Una vez al día (fecha de Madrid, guardada con try/catch), interrumpible con cualquier tecla, clic, toque o desplazamiento. Total ≤ 1,5 s.
- 0–200 ms: antetítulo «miércoles, 28 de octubre · Buenas noches, Judith» (saludo según la hora de Madrid: días < 14 h, tardes < 21 h, noches).
- 120–700 ms: líneas del H1 suben dentro de su máscara (`y` 105 % → 0, 600 ms, `cubic-bezier(0.22,1,0.36,1)`, 60 ms entre líneas). H1 en Newsreader: «Tu espacio para *estar al día*, *compartir conocimiento* y *avanzar* en FLM» — las tres expresiones son enlaces en itálica (Consultar › Actualidad, Participar, Aprender).
- 700–1250 ms: bajo cada expresión se dibuja un trazo de 3 px en orden de lectura; los tres comparten **un único degradado** que abarca el titular (rojo → burdeos → marino).
- 1300 ms: el punto final es un **círculo rojo** que aparece con muelle (stiffness 520, damping 26).
- 200–900 ms: la fotografía real de la oficina nace como círculo y se expande en cápsula (`clip-path`).
- 800–1200 ms: la tira de datos vivos sube (`y` 16 → 0) con 70 ms de escalonado.
- Interacción: al pasar o enfocar una expresión, su trazo pasa de 3 a 5 px y su columna de la tira se resalta (sin bajar la opacidad del resto por debajo de 0,65).

### 5.2 El escalón (al completar)
Al aprobar el test (≥ 2/3) con la lectura confirmada:
- El glifo de estado ampliado (tres círculos sin letras: Lectura · Test · Completada) se conecta con puentes líquidos.
- El último círculo **sube un escalón** (geometría `FLM-H-Arriba`, muelle 300/26) y se expande en la cápsula «Formación completada» con una marca de verificación. `aria-live` anuncia el resultado y el foco va al título del resultado.
- Sin aprobar: no hay escalón. Veredicto «Aún no» en tinta (nunca en rojo), con «Repasar» y «Volver a intentarlo».
- Evaluación sectorial (8/10): diez puntos; al superar, aparece el sello del área (cápsula oficial PNG para Fiscal/Laboral/Mercantil; anillo degradado para Contable).

## 6. Glifo de estado de formación

Círculo de dos mitades (SVG 20–24 px): mitad izquierda = lectura (llena si está confirmada); mitad derecha = test (trama diagonal si intentado, llena si superado); **círculo completo con marca** = completada. Siempre acompañado del texto: *Sin empezar · Formación leída · Test intentado · Test superado · Completada*. La lectura se marca **solo** con el botón «Marcar la lectura como terminada» (nunca por desplazamiento).

## 7. Tratamiento por tipo de contenido

- **Formación**: portada tipográfica con un «término de portada» del color del área («Art. 27», «147», «¿A Mercantil?»), nunca stock. Lectura con índice fijo «En esta formación», términos clave al margen (enlazados con `aria-describedby`; en línea en móvil), recuadro «Explicamos» en Belleza, ejemplo resuelto paso a paso («Siguiente paso» / «Ver todo», nunca ligado al desplazamiento), apoyos visuales interactivos accesibles con teclado, «Idea clave», fuentes, autoría (persona real + cargo + estado de revisión) y fechas sin repetir. Todas las formaciones son voluntarias: ninguna lleva rótulo de obligatoria ni fecha límite.
- **Test** («Pruebas de imprenta»): una pregunta por pantalla, `fieldset`/`legend` y radios nativos; al comprobar, la opción errónea se tacha en tinta con un anillo abierto y la correcta se subraya; nota al margen firmada por la autoría: «Por qué no…», «La respuesta correcta es B…», «Repasa: apartado n». Resultado con cifra grande (Newsreader) y veredicto.
- **Actualidad**: cinco bloques en columna vertical numerada (variante Vertical): 1 La novedad, en una frase · 2 A quién afecta · 3 **Qué debemos hacer** (el más visible) · 4 Un ejemplo sencillo · 5 Fuente y fecha (con «Copiar referencia»). Tipo con icono y palabra: Legislación, Resolución judicial, Criterio administrativo, Aviso interno.
- **Notas informativas**: archivo con miniatura real de la primera página (pdf.js, perezoso), versión, páginas, tamaño, «Abrir» y «Descargar (PDF · 239 KB)» visibles; avisos editoriales; documentos no publicables → «Disponible en la versión interna».
- **Lecturas**: «La estantería» con portadas tipográficas por área; ficha con edición, resumen, valor práctico, público y enlace.
- **Agenda**: «Actuales y próximos» como agenda editorial con fecha grande; varias sesiones = círculos de fecha unidos por puente; «Fecha por confirmar» = anillo discontinuo; detalle desplegable (layout); «Añadir a mi calendario (.ics)». «Histórico» compacto por meses, con foto real y material.
- **Calendario**: mes con lunes como primer día; encuentros de equipo, festivos y, desde la ficha de cada persona, cumpleaños (día y mes) y aniversarios en FLM (desde el año siguiente a la incorporación); tipos con icono + color + texto (Encuentro de equipo: grupo/marino; Festivo: sol/gris, siempre rotulado «Festivo»; Cumpleaños: tarta/rojo; Aniversario en FLM: insignia/ámbar); panel del día; navegación de mes y año; en móvil, tira semanal + lista.
- **Perfil**: progreso por área, tus formaciones, historial de intentos, evaluaciones sectoriales, reconocimientos de aprendizaje y contribución (cápsulas) y ajustes.
- **Gestión**: pestañas Todo · Borradores · Publicado · Archivado, creador por destino (`/gestion/nuevo`) con «Guardar borrador» y «Publicar», plantillas por tipo, editor con vista previa, autoguardado local, aviso de cambios sin guardar, «Deshacer» tras publicar.

## 8. Accesibilidad (WCAG 2.2 AA)

Foco visible doble anillo (`--focus-ring`) que sigue la forma; objetivos táctiles ≥ 44 px; `scroll-padding-top` para que la cabecera no tape el foco; nada solo con hover; atajos de una tecla («/») desactivables en Ajustes; formularios con etiquetas, ayudas y errores enlazados; regiones `aria-live` para resultados y guardados; idioma `es-ES`; contraste ≥ 4,5:1 en texto normal.

## 9. Microcopia (castellano de España, tuteo profesional)

Mensajes en `apps/web/src/lib/messages.ts`: búsqueda vacía, documento no disponible, archivo no admitido, tamaño excesivo, campos no válidos, sesión caducada, permisos insuficientes, error al guardar, sin conexión, cambios sin guardar, página no disponible. Siempre: qué ha pasado + qué puedes hacer + conservar lo escrito.

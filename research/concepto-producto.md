# FLM Campus · Concepto creativo «Círculo abierto»

> **Todo FLM Campus, a un círculo de distancia.**

| | |
|---|---|
| Enfoque | Producto digital premium: velocidad percibida, teclado primero, búsqueda global, estados impecables, microinteracciones táctiles y cero fricción en el día a día |
| Plataforma | FLM Campus · uso interno · unas 50 personas · castellano de España |
| Condición de la clienta | Se conservan los logotipos y los colores existentes. No se cambian. |
| Técnica | React 19 + Vite + TypeScript · Motion (motion.dev) · SVG y CSS · demo estática en GitHub Pages |
| Estado | Propuesta de dirección creativa para validar con FLM · 28 de octubre de 2026 |

> **Nota del 29/10/2026.** Propuesta conservada tal como se presentó. Después, a petición de la clienta, FLM Campus dejó de guardar y mostrar cumpleaños y fechas de incorporación, y todas sus formaciones pasaron a ser voluntarias. Por eso no forman parte del producto las categorías «Cumpleaños» y «Aniversario FLM» del calendario, los cumpleaños y aniversarios de «Esta semana en FLM», el «En FLM desde…» y las insignias de antigüedad del perfil, la búsqueda de personas, las formaciones obligatorias pendientes y sus fechas límite ni el informe de obligatorias por departamento: administración solo ve informes agregados, sin nombres. Lo vigente está en `docs/`.

---

## 0. La idea en treinta segundos

FLM ya tiene un gesto propio que todavía no vive en digital: **el círculo que se abre**. En sus logotipos de departamento, el círculo de la inicial se expande en una cápsula que aloja un nombre (FISCAL ocupa el lugar de la F, LABORAL el de la L y MERCANTIL el de la M). En las versiones diagonal y en escalera, los círculos se unen con conectores líquidos.

«Círculo abierto» convierte ese gesto en el **comportamiento** del producto:

1. **Todo se abre desde donde lo tocas.** La búsqueda, un PDF, un evento o un día del calendario crecen desde el círculo o la cápsula que has pulsado, igual que la F crece hasta FISCAL.
2. **Una tecla para todo.** Ctrl K (⌘K en Mac), «/» o el círculo de búsqueda del móvil encuentran formaciones, notas informativas, actualidad, lecturas, eventos, fechas y personas en menos de 50 ms.
3. **Aprender es conectar.** Al superar un test, sus tres círculos se unen con los conectores líquidos de la marca.

El logotipo no se toca. Los colores son los oficiales. Las fotos son reales. No hay datos inventados.

---

## 1. Por qué es auténtico y por qué sorprende

FLM ya tiene un gesto propio: en sus logotipos de departamento, el círculo de la inicial se abre en una cápsula que contiene un nombre; en sus versiones diagonal y en escalera, los círculos se unen con conectores líquidos; en LinkedIn, sus mensajes viven dentro de cápsulas escalonadas; y en el Desayuno Mercantil, la presentación interna ordenaba sus ideas en tres cápsulas (Obtener, Compartir, Anticipar). «Círculo abierto» convierte ese gesto en el comportamiento del Campus: todo lo que se toca se abre desde donde se tocó, y lo aprendido se demuestra conectando círculos. No añadimos colores ni retocamos el logotipo: usamos la artwork original, el rojo #E53327, el burdeos del centro del degradado y el marino #172641, más neutros cálidos tomados de la madera y la luz de la oficina. Frente a la versión anterior (barra marino, titular genérico, pestañas y fotos de stock con contadores de visitas), proponemos una herramienta de trabajo: búsqueda global con Ctrl K, teclado primero, estados de progreso que se leen sin color, portadas tipográficas en lugar de stock y fotografías reales solo donde cuentan una historia real. Sorprende porque la marca deja de ser decoración y pasa a ser interacción. Es auténtico porque cada forma tiene un origen verificable en los archivos de FLM.

---

## 2. Lo verificado y lo propuesto

### 2.1 Elementos de marca verificados (archivos oficiales y canales de FLM)

| Elemento | Dónde se ha verificado | Cómo lo usa el Campus |
|---|---|---|
| Tres círculos tangentes con F, L y M blancas y degradado horizontal continuo | FLM-Horizontal.png, FLM-Vertical.png, logo-hor-FLM-Crowe.png, logo-ver-FLM-Crowe.png | Logotipo intacto en el raíl, la barra móvil y el acceso |
| Rojo #E53327 y marino #172641 exactos en los extremos; burdeos #812D34 en el centro (≈ #822D33); tramo plano de LABORAL #7F343E | Muestreo de píxeles propio sobre los PNG oficiales | Tokens de color. El degradado se reproduce como interpolación sRGB #E53327 → #172641, cuyo punto medio es ese burdeos |
| El círculo de la inicial se expande en cápsula con el nombre del departamento | FLM - Fiscal.png, FLM - Laboral.png, FLM - Mercantil.png | Gramática de interacción: círculo → cápsula → panel. Cabeceras oficiales de área |
| Conectores líquidos en escalera (radio de acuerdo ≈ 0,32 del diámetro; desplazamiento entre círculos ≈ 0,97 D) | FLM-Diagonal, FLM-H-Arriba, FLM-H-Abajo, FLM-V-Derecha, FLM-V-Izq | Conectores entre pasos, sesiones y círculos del test |
| Círculos blancos con letras caladas sobre grandes círculos translúcidos; rojo vivo #FD1910 (medido #F91910), vino #6C131C (medido #66131C), azul profundo #002149, casi negro #151024 (medido #131025) | FLM-Horizontal Redes.png | Atmósfera de la pantalla de acceso, del modo noche y del momento de insignia |
| Frases dentro de cápsulas escalonadas unidas por conectores | Portada de la página de LinkedIn («Tu partner estratégico en el laberinto legal») | La «escalera» Aprender · Consultar · Participar de la portada |
| Círculo de color + cápsula blanca con texto | Publicación «Checklist mercantil antes de cerrar el año» | Patrón de fila accesible: color en el círculo, texto marino sobre blanco |
| Serif para el concepto que se explica | Publicación «Explicamos MASA ACTIVA» | Literata para términos clave y lectura |
| Tres verbos en cápsulas | Pantalla de la presentación del Desayuno Mercantil (foto real) | Confirma que FLM ya ordena ideas en tres verbos y cápsulas |
| Madera de arce, luz cálida, moqueta gris azulada, lomos rojos, verdes y marinos | Fotos de recepción y bibliotecas | Neutros cálidos (Papel, Lino) y la «estantería» de lecturas |

Observación: los rótulos físicos de recepción, el roll-up de la biblioteca y las libretas muestran una versión lineal del logotipo distinta de los archivos actuales («FLM | A business associate of Crowe Global», «Experts legals | Comptables»). Esas fotos se usan como ambiente, sin que el rótulo tenga protagonismo, para no mostrar dos logotipos en primer plano.

### 2.2 Decisiones propuestas (producto, no marca)

Neutros cálidos, tipografías, iconografía, gramática de movimiento, glifo de estado de dos mitades, portadas tipográficas, modo noche y toda la arquitectura de información. Ninguna altera un archivo de marca.

---

## 3. Principios de producto

1. **Se abre desde donde lo tocas.** Cada transición es una transformación de contenedor: el círculo se estira en cápsula y la cápsula se despliega en panel o página. Nunca se pierde el hilo espacial.
2. **Una tecla para todo.** Ctrl K / ⌘K o «/» abren la búsqueda y mando; G + letra navega; «?» muestra los atajos. Todo es igual de accesible con ratón y con el dedo.
3. **Instantáneo o explicado.** Precarga por intención, búsqueda local y guardado optimista con «Deshacer». Si algo tarda más de 150 ms aparece un esqueleto con la forma real; si falla, se explica qué ha pasado y qué hacer, sin perder lo escrito.
4. **El estado se lee sin color.** Forma + texto: un círculo vacío, a medias o lleno dice cómo vas.
5. **Nada inventado.** Ni visitas, ni rankings, ni personas de stock. En la demo, todo dato ficticio va rotulado.
6. **La marca no se toca; se usa.** El logotipo es siempre el archivo original; la geometría se deriva, nunca se recompone.

---

## 4. Dirección de arte

### 4.1 Paleta y contrastes medidos (WCAG 2.2)

| Token | Hex | Origen | Uso | Contraste |
|---|---|---|---|---|
| Marino FLM | #172641 | Oficial | Texto principal, acción primaria, área Mercantil | 13,77:1 sobre Papel · 15,11:1 sobre Blanco |
| Burdeos FLM | #822D33 | Oficial (centro del degradado) | Texto de acento pequeño, enlaces, rótulos, área Laboral | 8,07:1 sobre Papel · 8,85:1 sobre Blanco |
| Rojo FLM | #E53327 | Oficial | Señales, momentos de marca, área Fiscal. Texto solo ≥ 24 px (o ≥ 18,66 px en negrita) | 3,96:1 sobre Papel · 4,34:1 sobre Blanco · blanco sobre rojo 4,34:1 |
| Rojo vivo | #FD1910 | Oficial (redes) | Acento en modo noche | 4,70:1 sobre #151024 (texto apto solo sobre ese fondo) |
| Vino | #6C131C | Oficial (redes) | Superficies cálidas en modo noche | Papel 10,95:1 |
| Azul profundo | #002149 | Oficial (redes) | Superficies elevadas en modo noche | Papel 14,57:1 |
| Casi negro | #151024 | Oficial (redes) | Fondo del modo noche | Papel 16,92:1 |
| Papel | #F7F4EF | Derivado (paredes y luz de la oficina) | Fondo general | — |
| Blanco | #FFFFFF | — | Lectura, tarjetas, cápsulas | — |
| Lino | #EFEAE2 | Derivado (arce claro) | Raíl, zonas secundarias, estados hover | Marino 12,62:1 |
| Línea | #DDD5CA | Derivado | Separadores decorativos (nunca informativos) | 1,33:1 |
| Borde | #857D72 | Derivado | Bordes de campos y controles | 3,70:1 sobre Papel · 4,06:1 sobre Blanco |
| Pizarra | #4A5168 | Derivado del marino | Texto secundario | 7,17:1 sobre Papel · 7,87:1 sobre Blanco |
| Niebla | #5A6074 | Derivado | Metadatos, texto terciario | 5,70:1 sobre Papel |
| Lavanda noche | #B9B3C9 | Derivado | Texto secundario en modo noche | 9,15:1 sobre #151024 |
| Borde noche | #8F88A3 | Derivado | Bordes de campos en modo noche | 5,50:1 sobre #151024 |

**Reglas que se derivan de la medición**

- El rojo FLM nunca se usa para texto pequeño ni como fondo de botones con texto normal (por eso la acción primaria es Marino con texto blanco, 15,11:1). Es el error de contraste más visible de la versión anterior.
- Rojo, burdeos y marino apenas contrastan entre sí (2,04:1 y 1,71:1): el área se nombra siempre en texto y se apoya en la forma.
- **Degradado oficial:** `linear-gradient(90deg, #E53327, #172641)` con interpolación sRGB, la predeterminada de CSS. Su punto medio teórico (#7E2C34) coincide con el burdeos medido (#812D34). No se usa interpolación oklab ni oklch, que aclararía el centro. Siempre de izquierda (rojo) a derecha (marino), como el logotipo.

### 4.2 Proporciones (modo claro)

62 % Papel y Blanco · 22 % Marino (texto y acción) · 8 % Lino y neutros · 5 % Burdeos · como máximo 3 % Rojo. El degradado aparece solo como hilo de 2 px, en conectores líquidos, en el marcador de Contable y en los dos momentos firma.

### 4.3 Fondos y motivos

- **Fondo plano Papel.** La calma es la base: no hay texturas ni degradados detrás del texto.
- **Cuatro motivos derivados, nunca con letras:** el **círculo** (unidad y estado), la **cápsula** (acción, etiqueta, búsqueda), el **conector líquido** (relación y secuencia: pasos, sesiones, respuestas) y el **hilo** (progreso).
- **Atmósfera «Redes»:** círculos translúcidos superpuestos en rojo vivo, vino, azul profundo y casi negro, con grano del 3 %. Solo en la pantalla de acceso, la cabecera de Inicio en modo noche y el momento de insignia.
- **Áreas:** Fiscal = Rojo (posición de la F), Laboral = Burdeos (posición de la L), Mercantil = Marino (posición de la M), Contable = círculo con el degradado completo (atraviesa las tres áreas; no tiene letra propia y no se le inventa una).
- **Porciones del degradado = secuencia.** Cuando hay pasos (la escalera de Inicio, los tres círculos del test), cada círculo es una porción del degradado continuo, como en el logotipo, y no se confunde con un color de área.

### 4.4 Logotipo

- Siempre el archivo original (PNG con transparencia hasta disponer de los vectores oficiales). Nunca se recolorea, se redibuja, se deforma ni se anima su interior: solo entra o sale completo (opacidad 0 → 1, 200 ms).
- Horizontal en el raíl (92 px de ancho) y en la barra móvil (76 px). Zona de respeto: medio diámetro de círculo. Nunca por debajo de 72 px de ancho.
- «Campus» se escribe a la derecha, separado por la zona de respeto y un filete vertical de 1 × 24 px, en Mona Sans 600: es el nombre del producto junto al logotipo, no un logotipo nuevo.
- Logotipos de departamento (FISCAL, LABORAL, MERCANTIL) como cabecera de su área, a 240 px de ancho o más. Contable: logotipo horizontal y el título «Área Contable», sin variante inventada.
- «A business associate of Crowe Global»: solo mediante los archivos oficiales logo-hor-FLM-Crowe.png o logo-ver-FLM-Crowe.png, en la pantalla de acceso y en «Acerca del Campus», a 240 px de ancho o más (la línea de texto queda en unos 12 px). La frase no se recompone en otra tipografía ni se traduce.
- Diagonal y vertical: formatos grandes (acceso, página no disponible, estados vacíos amplios).
- Modo noche: el círculo marino se pierde sobre #151024 (1,23:1). El logotipo va sobre una placa Papel en forma de cápsula (margen de medio diámetro) hasta que FLM facilite una versión negativa oficial. La versión «Redes» solo se usa como composición completa (icono de la aplicación).

### 4.5 Fotografía

- Solo fotografías reales de FLM, con su color natural y cálido, sin duotonos ni velos.
- Personas en círculo (autoría: Ángel María Ceniceros, Socio del Área Fiscal). Espacios en cápsula o en rectángulo con radio de 24 px.
- Usos: acceso (fachada facetada de aluminio, «EDIFICIO FACHADA FLM 1»); cabecera de Consultar (baldas de la biblioteca, recortadas sin el roll-up); cabecera de Participar (recepción con personas en movimiento, irreconocibles); histórico del Desayuno Mercantil (foto real, resumen y material).
- Recortes: evitar elementos ajenos al despacho, como la bandera de un balcón vecino en «EDIFICIO FLM 1». Priorizar facetas, madera y luz.
- Sin stock en las formaciones: **portadas tipográficas generativas** (campo del área, término clave en Literata y una composición de círculos translúcidos con semilla propia por formación). Si FLM quisiera stock, solo de objetos y espacios, nunca de personas que parezcan plantilla, y rotulado como imagen ilustrativa.
- El archivo «BUZON SUGERENCIAS FOTO.jpg» es un icono de stock con un violeta ajeno a la paleta: se sustituye por el icono del sistema en Marino, salvo que FLM lo considere propio.

### 4.6 Iconografía

- **Phosphor Icons** (licencia MIT): peso Regular a 20/24 px; peso Fill para el estado activo (el icono «se llena» como un círculo).
- Set curado para eventos y comunicados: Estrella, Trofeo, Taza de café, Calendario y Formación (birrete).
- Calendario: Cumpleaños (pastel), Aniversario FLM (medalla), Encuentro de equipo (grupo), Festivo (sol).
- Tipos de actualidad: Legislación (pergamino), Resolución judicial (mazo), Criterio administrativo (edificio institucional), Aviso interno (megáfono).
- Redes: glifos oficiales de LinkedIn e Instagram (Simple Icons, CC0) en Marino monocromo.

### 4.7 Forma, espacio y profundidad

- Base de 4 px; escala 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96.
- Rejilla de 12 columnas, medianil de 24 px, contenido de 1120 px como máximo; lectura a 680 px (unos 66 caracteres).
- Radios: cápsula 9999 px (botones, filtros, búsqueda, estados); tarjetas 24 px en escritorio y 20 px en móvil; miniaturas 16 px.
- Profundidad por bordes, no por sombras. Sombra solo en capas flotantes: `0 24px 64px -16px rgb(23 38 65 / 0.28)`.
- Objetivos táctiles de 44 × 44 px o más.

---

## 5. Tipografía

| Rol | Familia | Licencia | Ajustes |
|---|---|---|---|
| Titulares | **Mona Sans** (GitHub), variable: peso 200–900, anchura 75–125 | SIL OFL 1.1 | 650–750; wdth 100 en frases largas y 106–125 en títulos cortos, nombres de área y cifras |
| Interfaz | **Mona Sans** | SIL OFL 1.1 | 450–600, wdth 100; etiquetas de la barra inferior a wdth 90 |
| Lectura | **Literata** (TypeTogether para Google), variable: tamaño óptico 7–72, peso 200–900, cursiva | SIL OFL 1.1 | 400, tamaño óptico automático, 66 caracteres por línea |
| Atajos y datos técnicos | **JetBrains Mono** | SIL OFL 1.1 | 500 a 11–12 px, solo en cápsulas de atajo, versiones y tamaños de archivo |

**Escala**

| Estilo | Escritorio | Móvil | Ajustes |
|---|---|---|---|
| H1 de Inicio (frase larga) | 48/52 px | 30/33 px | Mona Sans 700 · wdth 100 · −0,02 em · `text-wrap: balance` |
| H1 de página | 44/48 | 30/34 | 700 · wdth 112 |
| Display de área y cifras | 64/64 | 40/40 | 750 · wdth 125 (nombre del área en su cabecera, progreso) |
| H2 | 28/34 | 24/30 | 650 · wdth 106 |
| H3 | 20/26 | 19/25 | 600 · wdth 100 |
| Rótulo | 12/16 | 12/16 | 650 · wdth 120 · mayúsculas · +0,09 em |
| Texto de interfaz | 15/22 | 16/24 | 450 |
| Metadatos | 13/18 | 13/18 | 500 · Niebla |
| Lectura | Literata 19/31 | 18/29 | 400 |
| Entradilla | Literata 21/32 cursiva | 18/27 cursiva | 400 |
| Término clave | Literata 22/28 | 20/26 | 600 |
| Atajo | JetBrains Mono 11/16 | — | 500 · cápsula con borde #857D72 |

**Por qué:** Mona Sans tiene un eje de anchura (75–125) que permite que la letra se «abra» igual que el círculo se abre en cápsula (el texto de ayuda de la búsqueda pasa de wdth 92 a 100 mientras la cápsula se estira) y que palabras largas como «Participar» o «Administración» quepan a 12 px en móvil sin cortes. Su construcción grotesca y sus pesos altos dialogan con las letras rotundas del logotipo sin imitarlas. Literata se diseñó para leer en pantalla durante mucho tiempo, tiene tamaños ópticos y aporta la voz editorial que FLM ya usa en «Explicamos MASA ACTIVA». JetBrains Mono hace legibles los atajos de un producto pensado para el teclado. Las tres son OFL y cubren el castellano completo.

**Castellano:** `lang="es-ES"`; tilde en mayúsculas (ÁREA, FORMACIÓN); «comillas latinas»; signos ¿ y ¡; espacio no separable antes de unidades y del signo % («12 min», «20 MB», «15 %»); cifras tabulares en tablas y calendario (se comprueba en compilación que la fuente las incluye; si no, esas cifras pasan a JetBrains Mono); `hyphens: auto` en lectura; fechas como «28 de octubre de 2026» y horas como «9:30».

**Rendimiento:** woff2 autoalojados con subconjuntos latin y latin-ext; se precargan dos archivos (Mona Sans variable y Literata redonda); `font-display: swap` con métricas de reserva ajustadas (`size-adjust`) para que el cambio de fuente no mueva la página.

---

## 6. Arquitectura y navegación

### 6.1 Mapa del sitio

```
Inicio                        /
Aprender · Formación          /aprender
  ├─ Fiscal · Laboral · Mercantil · Contable      /aprender/{area}
  │    ├─ Formación (lectura + test)              /aprender/{area}/{formacion}  (#test)
  │    └─ «Pon a prueba tus conocimientos»        /aprender/{area}/evaluacion
Consultar · Biblioteca        /consultar
  ├─ Notas informativas       /consultar/notas  ·  /consultar/notas/{nota} (visor PDF)
  ├─ Actualidad en tu sector  /consultar/actualidad  ·  /consultar/actualidad/{novedad}
  └─ Lecturas recomendadas    /consultar/lecturas  ·  /consultar/lecturas/{area}
Participar · Vida en FLM      /participar
  ├─ Eventos y comunicados    /participar/eventos?vista=proximos|historico · /participar/eventos/{evento}
  ├─ Calendario               /participar/calendario/{aaaa}/{mm}
  └─ Comunidad                /participar/comunidad
Perfil                        /perfil  (progreso · insignias · ajustes)
Gestión [Autor, Administrador]   /gestion
  ├─ Contenidos               /gestion/contenidos?estado=borrador|revision|publicado|archivado
  ├─ Nuevo desde plantilla    /gestion/nuevo/{plantilla}
  └─ [Administrador] Personas · Sesiones · Informes
Búsqueda (alternativa sin ventana)   /buscar?q=…        Página no disponible (404)
```

Los tres propósitos del Campus son la navegación: **Aprender, Consultar, Participar**. Inicio y Perfil completan cinco destinos, siempre en el mismo orden. Gestión solo aparece para Autor y Administrador.

### 6.2 Navegación por dispositivo

- **Escritorio (1200 px o más):** raíl izquierdo de 256 px, plegable a 72 px. Contiene el logotipo y «Campus», la cápsula «Buscar · Ctrl K», los cuatro destinos con contadores (pendientes, novedades), el bloque «Tus áreas» con progreso (Fiscal 1/3…), Gestión según el rol y, abajo, el perfil. El contenido usa un máximo de 1120 px; en lectura, índice a la izquierda (200 px), texto de 680 px y términos clave en el margen derecho (240 px, a partir de 1280 px).
- **Tableta (768–1199 px):** raíl plegado de 72 px con etiqueta bajo cada icono; la búsqueda es un círculo arriba.
- **Móvil (menos de 768 px):** barra superior de 56 px (logotipo, círculo de búsqueda y avisos) y barra inferior de 64 px más el área segura, con Inicio, Aprender, Consultar, Participar y Perfil. Sin menú hamburguesa. Gestión se abre desde Perfil y desde la búsqueda (acciones con «>»). Filtros y detalles en hojas inferiores con botón de cierre visible.
- Los filtros y pestañas viven en la URL (`?area=laboral`): los enlaces directos funcionan y atrás/adelante restaura el desplazamiento y el foco.

### 6.3 Flujos clave

| Intención | Camino más corto |
|---|---|
| «Quiero aprender algo útil» | Inicio → cápsula Aprender (pendientes) → formación → test → «Conectar» → insignia |
| «Necesito encontrar un documento» | Ctrl K → «verifactu» → Intro abre el visor · Ctrl Intro descarga el PDF original |
| «Quiero entender una novedad» | Inicio («Tu día») o Consultar → Actualidad → cinco bloques → «Copiar cita» |
| «Quiero saber qué pasa en la firma» | Participar → Actuales y próximos · Calendario |
| «Quiero aportar algo» | Participar → Comunidad (propón un tema, una mejora o un vídeo) · Autor: Crear → plantilla → Enviar a revisión |
| «Necesito gestionar contenido o accesos» | Gestión → En revisión → Publicar (con Deshacer) · Personas → Desactivar cuenta o revocar sesiones |

### 6.4 Composición y ritmo

- Todas las páginas empiezan igual: rótulo con el verbo, H1, una frase de propósito y la acción principal a la derecha; debajo, filtros en cápsulas; después, el contenido.
- Ritmo: módulos densos de producto (listas, tablas) con un único momento editorial por pantalla (una portada, una cita o una foto real). Separación entre secciones: 64 px en escritorio, 40 px en móvil.
- Las cabeceras de área muestran su logotipo oficial de departamento.

---

## 7. Primera pantalla

### 7.1 Escritorio (1440 × 900)

```
┌─ Raíl 256 px (Lino) ─┬─ Lienzo (Papel) · contenido 1120 px ─────────────────────────────────────┐
│ [FLM]  │  Campus      │ Miércoles, 28 de octubre de 2026                      (aviso)  [+ Crear]  │
│                      │                                                                           │
│ (lupa) Buscar Ctrl K │ BUENOS DÍAS                                       ┌─ Tu día ───────────────┐│
│                      │ Tu espacio para estar al día,                    │ PARA HOY               ││
│ (*) Inicio           │ compartir conocimiento y                         │ (½) Formación · 9 min  ││
│ ( ) Aprender      2  │ avanzar en FLM.                                  │ ACTUALIDAD EN TU SECTOR││
│ ( ) Consultar     3  │ Apostamos por tu formación y tu crecimiento.     │ «La novedad, en una…»  ││
│ ( ) Participar       │                                                  │ ESTA SEMANA EN FLM     ││
│                      │ (O)=[ Aprender · 2 obligatorias pendientes   > ] │ Cumpleaños · Aniv. ·   ││
│ TUS ÁREAS            │   \                                               │ Festivo                ││
│ (o) Fiscal      1/3  │    (O)=[ Consultar · 3 novedades esta semana > ] └────────────────────────┘│
│ (o) Laboral     0/3  │      \                                            ┌─ Lo último en FLM ─────┐│
│ (o) Mercantil   2/3  │       (O)=[ Participar · Desayuno Fiscal…     > ] │ [foto real en cápsula] ││
│ (o) Contable    0/3  │                                                  └────────────────────────┘│
│ Gestión              │ ── Continúa aprendiendo ─────────────────────────────────────────────────  │
│ (CD) Cuenta demo     │                                                                           │
└──────────────────────┴───────────────────────────────────────────────────────────────────────────┘
```

- **Raíl (256 px, Lino #EFEAE2, filete derecho #DDD5CA):** logotipo horizontal original a 92 px + filete + «Campus» (Mona Sans 600, wdth 112, 18 px). Debajo, cápsula de búsqueda de 208 × 40 px (blanca): círculo Marino de 28 px con lupa blanca, «Buscar» y la cápsula de atajo «Ctrl K». Cuatro destinos de 44 px de alto (Inicio activo: cápsula blanca e icono Fill); contadores Aprender 2 y Consultar 3. Rótulo «TUS ÁREAS» y cuatro filas con marcador de 12 px y progreso tabular. Abajo: Gestión (según el rol) y el perfil (avatar de iniciales en Marino, «Cuenta de demostración», «Empleado · Área Fiscal» y el selector «Ver como», marcado como Demo).
- **Barra superior del lienzo (64 px):** fecha en Pizarra 14 px; a la derecha, círculo de avisos de 40 px con un punto rojo de 8 px (etiqueta accesible «Avisos: 3 nuevos») y, para Autor o Administrador, la cápsula «Crear» en Marino.
- **Columnas 1–8 (unos 740 px):** rótulo «BUENOS DÍAS» (Burdeos, cambia a «BUENAS TARDES» a partir de las 14:00, hora de Madrid). H1 en Mona Sans 700, wdth 100, 48/52 px, Marino, con `text-wrap: balance`, en tres líneas: «Tu espacio para estar al / día, compartir conocimiento / y avanzar en FLM.» Debajo, en Literata cursiva 21/30 Pizarra: «Apostamos por tu formación y tu crecimiento.» A 370 px de altura, la **escalera**: tres filas de 56 px separadas 8 px y desplazadas 0, 56 y 112 px. Cada fila es un círculo de 56 px (porción del degradado oficial, con icono blanco: birrete, libros, grupo) unido a una cápsula blanca de 368 px con borde #DDD5CA: «Aprender» (Mona Sans 650, 19 px, Marino) y «2 formaciones obligatorias pendientes» (14 px, Pizarra); «Consultar · 3 novedades en Actualidad esta semana»; «Participar · Desayuno Fiscal, fecha por confirmar». Cada fila termina en un círculo de flecha de 32 px. Los círculos se unen con dos conectores líquidos, como en FLM-Diagonal. Cada cápsula lleva al siguiente paso útil, no a una portada genérica.
- **Columnas 9–12 (unos 357 px):** tarjeta «Tu día» (blanca, radio 24, padding 24): «Para hoy» con la formación obligatoria en curso (glifo de dos mitades, título en Literata 600 17 px, área, minutos restantes y cápsula «Continuar»); «Actualidad en tu sector» con la última novedad (tipo con icono, área y fecha); «Esta semana en FLM» con cumpleaños, aniversarios y el próximo festivo verificado (icono y texto). Debajo, «Lo último en FLM»: la foto real del Desayuno Mercantil recortada en cápsula de 357 × 96 px (mesa y pantalla) con «Celebrado · Ver resumen y material».
- Por debajo del pliegue: «Continúa aprendiendo» (portadas tipográficas), «Actualidad en tu sector» (tres entradas), «Eventos y comunicados» y una franja «Participa» con LinkedIn, reseñas, propuestas y vídeos, con prioridad visual menor.

### 7.2 Móvil (390 × 844)

- Barra superior de 56 px bajo la barra de estado: logotipo original a 76 px + «Campus» (16 px); a la derecha, círculos de 44 px para buscar y para avisos.
- Margen lateral de 16 px. Rótulo «BUENOS DÍAS · MIÉRCOLES, 28 DE OCTUBRE» (12 px, Burdeos). H1 en Mona Sans 700, wdth 100, 30/33 px, en cuatro líneas con `text-wrap: balance`: «Tu espacio para estar al día, compartir conocimiento y avanzar en FLM.» Apoyo en Literata cursiva 17/24: «Apostamos por tu formación y tu crecimiento.»
- Escalera vertical (como FLM-Vertical y FLM-V-Izq): tres cápsulas de 358 × 64 px separadas 8 px, desplazadas 0, 12 y 24 px, con círculos de 48 px unidos por conectores líquidos verticales. Cada una con etiqueta y subtítulo con tu estado real.
- La tarjeta «Tu día» asoma unos 150 px por encima de la barra inferior para invitar a desplazarse.
- Barra inferior de 64 px más el área segura: Inicio (activo: icono Fill y cápsula que abraza la etiqueta), Aprender (contador 2), Consultar, Participar y Perfil. Etiquetas en Mona Sans 600, 12 px, wdth 90.
- Tirar hacia abajo desde arriba en Inicio abre la búsqueda (con su botón como alternativa).

### 7.3 Acceso de la demo pública

Pantalla dividida 5/7: a la izquierda, la fachada facetada real a sangre; a la derecha, sobre Papel, el logotipo oficial con «A business associate of Crowe Global» a 280 px, el rótulo «DEMO PÚBLICA · DATOS FICTICIOS», «FLM Campus», el mensaje base y tres cápsulas: «Entrar como empleado», «Entrar como autor» y «Entrar como administrador», con la nota «Las funciones de administración están simuladas». En producción, la misma composición con correo @flmexperts.com, sin pruebas cognitivas (se puede pegar la contraseña y usar gestores de contraseñas).

---

## 8. Momentos firma

### 8.1 «Abrir el círculo»: búsqueda y mando global

**Disparador.** Ctrl K / ⌘K o «/» fuera de un campo; clic o toque en la cápsula de búsqueda del raíl o en el círculo de búsqueda de la barra móvil; en móvil, además, tirar hacia abajo 72 px o más desde arriba en Inicio.

**Coreografía (escritorio)**

| Tiempo | Qué pasa | Curva |
|---|---|---|
| 0 ms | El foco pasa al campo antes de animar: no se pierde ninguna tecla | — |
| 0–180 ms | Velo Marino de 0 a 40 % de opacidad; la página retrocede a escala 0,99 | cubic-bezier(0.2, 0, 0, 1) |
| 0–260 ms | El círculo de la lupa (28 px) viaja al centro superior (16 vh) y la cápsula se estira de 208 × 40 a 680 × 56 px, el mismo gesto que convierte la F en FISCAL (`layoutId` de Motion) | muelle {rigidez 420, amortiguación 36} |
| 120–260 ms | Aparece «Busca formaciones, notas, actualidad o personas» mientras su anchura pasa de wdth 92 a 100 | opacidad 140 ms, ease-out |
| 180–420 ms | El panel se despliega desde el borde inferior de la cápsula (`clip-path` de inset 100 % a 0); grupos escalonados 30 ms: Continuar, Pendientes, Acciones (opacidad + 6 px, 160 ms) | cubic-bezier(0.16, 1, 0.3, 1) |
| Al escribir | Resultados en menos de 50 ms con coincidencias subrayadas en Burdeos; escribir un área seguida de espacio («laboral ») la convierte en ficha de filtro (escala 0,92 → 1, 140 ms); el lector de pantalla anuncia «12 resultados» | — |
| Intro | La fila elegida se transforma en la cabecera de la página destino (`layoutId` compartido, 320 ms); el velo se va en 160 ms | muelle {420, 36} |
| Esc | Recorrido inverso en el 70 % del tiempo: panel 160 ms, cápsula de vuelta 200 ms | cubic-bezier(0.4, 0, 1, 1) |

**Móvil.** El círculo de 44 px se abre en una hoja a pantalla completa con un `clip-path` circular desde su centro (300 ms, cubic-bezier(0.32, 0.72, 0, 1)). El teclado se abre en el mismo toque y las búsquedas recientes aparecen como cápsulas. Se cierra con «Cancelar» o deslizando hacia abajo.

**Qué encuentra.** Formaciones, notas informativas (con texto del PDF), actualidad, lecturas, eventos, fechas del calendario y personas (nombre y cargo). Prefijos: «>» para acciones (Subir nota informativa, Crear borrador, Ir a Laboral) y «@» para personas. Ignora tildes y tolera erratas: «nomina» encuentra «nómina» y «verifatcu» propone «VERI*FACTU».

**Movimiento reducido.** Sin viaje, estiramiento ni recorte: el velo y el panel aparecen con un fundido de 120 ms, el foco ya está en el campo y el contenido, los grupos y los anuncios son idénticos. Si el sistema pide reducir transparencias, el velo es opaco y sin desenfoque.

**Por qué se recuerda.** Toma el gesto que define la identidad departamental de FLM (el círculo que se abre para alojar un nombre) y lo convierte en la acción más frecuente del día: preguntar y encontrar. Es rápido, funciona igual con teclado, ratón y dedo, y enseña la lógica de todo el producto: todo se abre desde donde lo tocas.

### 8.2 «Conectar»: resultado del test e insignia

**Disparador.** «Ver resultado» tras la tercera pregunta del test de una formación, o tras la décima de «Pon a prueba tus conocimientos».

**Durante el test.** El progreso son tres círculos tangentes de 20 px sin letras. Cada uno es una porción del degradado oficial (rojo, burdeos y marino, en el orden del logotipo). Al comprobar cada respuesta, el círculo se llena con su color y un check (correcta) o con trama y aspa (incorrecta), siempre con texto: «Pregunta 2 de 3 · Correcta».

**Coreografía del resultado**

| Tiempo | Aprobado (2 o 3 de 3) | Curva |
|---|---|---|
| 0–280 ms | El resto del test se funde (160 ms); los tres círculos viajan al centro y crecen de 20 a 72 px | muelle {380, 34} |
| 280–640 ms | Los círculos se colocan en la escalera de FLM-Diagonal (desplazamiento 0,97 D) y crecen conectores líquidos entre los acertados (cuello de 0 a 0,42 D, radio de acuerdo 0,32 D). Con 3 de 3, el degradado se vuelve continuo en toda la forma (400 ms). Con 2 de 3, el fallado queda aparte, en contorno, con «Repasar» | cubic-bezier(0.65, 0, 0.35, 1), 360 ms |
| 640–820 ms | Titular «Test superado · 3 de 3» (opacidad + 8 px) | ease-out, 180 ms |
| 820–1100 ms | El glifo de la formación completa su segunda mitad: «Formación completada» (o «Te falta terminar la lectura» si no se había leído) | 300 ms |
| 1100–1500 ms | Solo si se gana una insignia: la forma se condensa en un círculo de 88 px (300 ms), se «sella» (escala 1,04 → 1) y se traza un anillo (400 ms). «Nueva insignia · Fiscal al día» y «Ver en mi perfil». Al continuar, la insignia vuela al avatar (420 ms), que muestra un único anillo | muelle {600, 30} |

**Si no se aprueba (menos de 2 de 3).** Los círculos no se mueven ni se conectan. Titular «Aún no · 1 de 3». Cada pregunta fallada se despliega con tu respuesta, por qué no es correcta, la respuesta correcta explicada y «Repasar la sección 2». Acción principal: «Volver a intentarlo», con preguntas y opciones en otro orden. Sin sacudidas ni destellos rojos.

**Evaluación de 10 preguntas (aprobado con 8).** Diez círculos de 14 px (dos filas de cinco en móvil) que, al aprobar, se unen en un hilo continuo con un conector cada 40 ms (unos 600 ms) y dan la insignia «Evaluación Fiscal superada».

**Movimiento reducido.** Se muestra directamente la composición final (conectada o separada) con un fundido de 150 ms; la insignia aparece sellada y sin vuelo. Un anuncio `aria-live` dice: «Test superado. 3 de 3 respuestas correctas. Formación completada. Nueva insignia: Fiscal al día». El foco pasa al titular del resultado.

**Por qué se recuerda.** La recompensa es la propia construcción de la marca: aprobar conecta literalmente los círculos, como en el logotipo diagonal de FLM. Es una metáfora exacta de aprender (conectar conceptos), se gana en lugar de decorar, dura menos de 1,5 s y es sobria para una firma profesional. Al fallar no hay castigo visual, solo un camino claro para repasar.

---

## 9. Microinteracciones

1. **Presión de cápsula.** Al pulsar cualquier botón o cápsula (ratón, dedo, Intro o Espacio), baja a escala 0,97 en 90 ms (cubic-bezier(0.2, 0, 0, 1)) y su fondo se oscurece un 4 %; al soltar vuelve con un muelle {600, 34} (unos 180 ms). Movimiento reducido: solo cambia el color.
2. **Indicador que se estira.** En el raíl y en la barra inferior, el destino activo tiene un círculo tras el icono que se estira en cápsula hasta abrazar la etiqueta (`layoutId`, muelle {420, 36}, unos 260 ms). A mitad del recorrido, el icono pasa de Regular a Fill. Movimiento reducido: cambio instantáneo.
3. **Entrada del día.** Solo en la primera visita de cada jornada (hora de Madrid): los tres círculos de la escalera aparecen (escala 0,6 → 1, escalonados 70 ms), los conectores crecen (240 ms, cubic-bezier(0.65, 0, 0.35, 1)) y cada cápsula blanca se estira desde su círculo (280 ms, cubic-bezier(0.16, 1, 0.3, 1)). Los subtítulos aparecen al final (120 ms). Total: unos 700 ms, sin bucles. En el resto de visitas, y con movimiento reducido, el estado final aparece con un fundido de 150 ms.
4. **Pistas de atajos.** Mantener Ctrl o ⌘ durante 600 ms muestra cápsulas de atajo junto a destinos y acciones (opacidad + 4 px, 120 ms, escalonado 15 ms); al soltar desaparecen en 80 ms. «?» abre la hoja completa. Los atajos de una tecla se pueden desactivar o reasignar en Ajustes y nunca actúan dentro de un campo.
5. **Hilo de lectura.** Un hilo de 2 px con el degradado oficial crece arriba con el desplazamiento (`useScroll` + `useSpring` {200, 40}); los círculos del índice se llenan al cruzar cada sección (160 ms) y, al final, el hilo termina en un punto que se convierte en la cápsula «Ir al test» (240 ms). La posición se guarda para «Seguir donde lo dejaste». Movimiento reducido: avance sin suavizado.
6. **Respuesta y comprobación.** Las opciones son cápsulas con un círculo de letra (A–D). Al elegir, el círculo se llena desde el centro (escala 0 → 1, 160 ms, cubic-bezier(0.16, 1, 0.3, 1)) y se habilita «Comprobar». Al comprobar, el check o el aspa se dibujan (200 ms) y la explicación se despliega (220 ms). Teclas 1–4 e Intro. Sin sacudidas: la correcta se marca con borde, icono y texto.
7. **Vista rápida de PDF.** Con una nota enfocada, Espacio (o una pulsación larga de 400 ms en móvil, con un anillo que se completa como indicador) abre la miniatura como visor superpuesto (transformación de contenedor, 280 ms, muelle {380, 36}). Las flechas pasan a la nota anterior o siguiente; Espacio o Esc cierran en 200 ms. Movimiento reducido: fundido de 120 ms.
8. **Estantería de lecturas.** Al pasar el puntero o enfocar un lomo, se eleva 10 px (160 ms, ease-out) y su título se ensancha (wdth 75 → 100). Al abrirlo, el lomo se convierte en la ficha del libro (320 ms) o en hoja inferior en móvil (300 ms, cubic-bezier(0.32, 0.72, 0, 1)). Las flechas recorren la balda. Movimiento reducido: ficha directa.
9. **Calendario.** Al cambiar de mes, la rejilla se desplaza 24 px en la dirección elegida con fundido cruzado (220 ms, cubic-bezier(0.32, 0.72, 0, 1)) y los dígitos del título ruedan (180 ms). Al elegir un día, su círculo se abre en panel lateral o en hoja inferior (260 ms). Movimiento reducido: cambio directo.
10. **Evento expandible.** La entrada se despliega en su sitio (260 ms, muelle {420, 36}): la imagen pasa de cápsula a 16:9 con radio de 20 px y las sesiones aparecen como círculos unidos por conectores (escalonados 50 ms). «Añadir a mi calendario» descarga un .ics y lo confirma con un aviso. Movimiento reducido: despliegue sin animación.
11. **Guardar, publicar y deshacer.** La cápsula de estado del editor pasa de «Guardando…» (arco que gira, 700 ms, lineal) a «Guardado» (check dibujado en 180 ms) y después a «Guardado hace 5 s». Al publicar, el medio círculo de «En revisión» se completa en «Publicado» (300 ms) y aparece el aviso «Publicado. Ya lo ve todo el equipo · Deshacer», que dura 10 s y se detiene con el foco o el puntero. Si falla: estado de alerta con «Reintentar ahora», reintentos automáticos a los 2, 5 y 10 s y copia local intacta.
12. **Deslizar en móvil.** En Actualidad y en avisos, deslizar a la izquierda revela «Marcar como leída» (umbral del 30 % del ancho, muelle {500, 40}, vibración de 8 ms en Android). La misma acción está en el menú «…» de cada fila. Movimiento reducido: la fila cambia de estado sin desplazarse.

---

## 10. Sistema de movimiento

| Token | Valor | Uso |
|---|---|---|
| `dur.presion` | 90 ms | Pulsación |
| `dur.micro` | 140 ms | Selección, fichas, texto de ayuda |
| `dur.fundido` | 180 ms | Apariciones |
| `dur.base` | 220 ms | Cambios de diseño pequeños |
| `dur.contenedor` | 280 ms | Visor, panel, hoja |
| `dur.pagina` | 320 ms | Elemento compartido entre páginas |
| `ease.salida` | cubic-bezier(0.16, 1, 0.3, 1) | Lo que entra |
| `ease.estandar` | cubic-bezier(0.2, 0, 0, 1) | Transiciones generales |
| `ease.retirada` | cubic-bezier(0.4, 0, 1, 1) | Lo que sale (70 % de la duración de entrada) |
| `ease.hoja` | cubic-bezier(0.32, 0.72, 0, 1) | Hojas inferiores, calendario |
| `ease.liquido` | cubic-bezier(0.65, 0, 0.35, 1) | Conectores líquidos |
| `muelle.capsula` | rigidez 420, amortiguación 36 (ζ ≈ 0,88) | Estiramientos círculo → cápsula |
| `muelle.presion` | rigidez 600, amortiguación 34 | Retorno táctil |
| `muelle.sello` | rigidez 600, amortiguación 30 | Insignia |

**Reglas:** nada se mueve en bucle; las salidas son más rápidas que las entradas; los desplazamientos no superan 24 px; se animan solo `transform`, `opacity`, `clip-path` y el atributo `d` de los conectores; el interior del logotipo no se anima nunca; nunca hay más de un momento firma a la vez. `MotionConfig reducedMotion="user"` y `@media (prefers-reduced-motion: reduce)` sustituyen el movimiento por fundidos de 120–150 ms. Ajustes también permite forzar el movimiento reducido.

---

## 11. Tratamientos de contenido

### Formación

Cabecera con la cápsula del área y el tipo; título en Mona Sans 700 (44/48); entradilla práctica en Literata 21/32; una sola fila de metadatos: foto circular del autor, nombre y cargo debajo («Ángel María Ceniceros · Socio del Área Fiscal»), «12 min de lectura» y una única fecha («Actualizada el 20 de octubre de 2026», y «publicada el 3 de octubre» solo si difieren). Bloque «Al terminar podrás», con dos o tres resultados en cápsulas numeradas. Módulos cortos (unos 3 min) con H2; términos clave subrayados en punteado Burdeos, con definición emergente y recuadro «Término clave» en serif; «Caso práctico» con cálculo paso a paso (← y →, cada cifra enlazada a su fuente); diagramas SVG propios (comparativas, líneas de tiempo con conectores, árbol de decisión). La formación de Mercantil sobre cuándo derivar a un cliente se presenta como un árbol de decisión de cápsulas «Sí / No». La de BOICAC 147 se presenta como cálculo animado paso a paso. Cierre con «Para llevar» y el test integrado en la misma página (`#test`). Pie con referencias oficiales enlazadas y «Revisado por… el…».

**Glifo de estado de dos mitades** (forma + texto, nunca solo color):

| Estado | Glifo | Texto |
|---|---|---|
| Sin empezar | Círculo en contorno | «Sin empezar» |
| Leyendo | La mitad izquierda se llena con el avance | «Leída al 60 %» |
| Formación leída | Mitad izquierda llena | «Leída» |
| Test intentado | Mitad derecha con trama | «Test intentado · 1 de 3» |
| Test superado | Mitad derecha llena | «Test superado · 3 de 3» |
| Formación completada | Círculo lleno con check | «Completada» (lectura + test superado) |

Portadas tipográficas generativas por formación: campo del área (Contable con el degradado completo), término principal en Literata y círculos translúcidos con semilla propia. Nunca muestran cifras que no estén en el contenido verificado.

### Test

Tres preguntas: una por pantalla en móvil y una debajo de otra en escritorio, con avance por teclado (1–4 e Intro). Retroalimentación inmediata tras «Comprobar»: correcta o incorrecta con icono y texto, por qué la elegida no es correcta, la explicación de la correcta y un enlace a la sección relacionada. Aprobado con 2 de 3. El resultado usa la firma «Conectar». «Volver a intentarlo» cambia el orden de preguntas y opciones; el historial de intentos queda en el perfil. «Pon a prueba tus conocimientos»: diez preguntas de dificultad media, aprobado con 8 de 10, sin retroalimentación hasta el final (modo evaluación) y con revisión completa después; si se interrumpe, se guarda el avance. Accesible: `fieldset` y `legend`, radios nativos estilizados, resultado en `aria-live` y sin límite de tiempo.

### Actualidad en tu sector

Lista editorial fácil de recorrer: fecha con cifras tabulares, tipo con icono y texto (Legislación, Resolución judicial, Criterio administrativo, Aviso interno) y área. El titular es «La novedad, en una frase» en Literata 22/30; debajo, «A quién afecta» en cápsulas. El detalle tiene cinco bloques numerados en círculos:

1. **La novedad, en una frase:** destacada, en serif grande.
2. **A quién afecta:** perfiles de cliente o expedientes que hay que revisar, con «Copiar lista».
3. **Qué debemos hacer:** pasos accionables que empiezan con un verbo.
4. **Un ejemplo sencillo:** recuadro de caso.
5. **Fuente y fecha:** referencia oficial enlazada (BOE, CENDOJ, AEAT, DGT), fecha de la norma o resolución y fecha de publicación en el Campus, con «Copiar cita».

Los matices van en una nota «Ojo con…». La plantilla de autoría reproduce los cinco bloques con límites (la frase de la novedad, 160 caracteres como máximo) y vista previa en vivo.

### Notas informativas

Rejilla de fichas con la miniatura real de la primera página (renderizada en compilación con pdf.js), título, área, fecha, versión vigente y tamaño («PDF · 412 KB»). Acciones: «Abrir» (visor integrado) y «Descargar original». Filtros por área en cápsulas, búsqueda en el texto del PDF y orden por fecha. Espacio abre la vista rápida; en móvil, pulsación larga. Gestión: subir (arrastrar o seleccionar; solo PDF de hasta 20 MB), sustituir creando una versión nueva (historial v1 → v3 con fecha y autor), archivar y restaurar. Archivado no es lo mismo que histórico. Si un documento se retira, su enlace lleva a la versión vigente.

### Lecturas recomendadas

«La estantería»: lomos verticales que recuerdan la biblioteca real del despacho (crema con banda roja, marino, burdeos), tres por área. Cada lomo lleva título y autor en Mona Sans condensada (wdth 75). Al abrirlo, la ficha muestra título y autor, la edición concreta, un resumen breve, el valor práctico, a quién va dirigido y un enlace de referencia verificable. En móvil, la balda se desplaza en horizontal con ajuste y la ficha se abre en hoja inferior. Botón «Ver como lista» como alternativa accesible.

### Eventos y comunicados

Una sola línea de tiempo con el interruptor «Actuales y próximos | Histórico». Cada entrada: círculo de fecha (día y mes) o círculo discontinuo «Fecha por confirmar», icono del set curado, título, descripción breve, estado en cápsula (Próximo, Hoy, En curso, Fecha por confirmar, Celebrado) y la acción adecuada (Añadir a mi calendario, Ver material, Más detalles). Los comunicados (nueva web corporativa, boletín trimestral) llevan la etiqueta «Comunicado». Las sesiones múltiples se muestran como círculos conectados; el evento pasa al histórico tras la última sesión (hora de Madrid) y, sin fecha, sigue en próximos. El histórico es una rejilla con fotos reales: el Desayuno Mercantil, con su foto, su resumen y la presentación descargable. El próximo desayuno, el Fiscal, figura como «Fecha por confirmar». Los enlaces externos provisionales llevan la etiqueta «Enlace de ejemplo». La reclasificación manual y el archivado solo están en Gestión.

### Calendario

Mes en rejilla (lunes primero, es-ES, Europe/Madrid) con «‹ Hoy ›» y un selector de mes y año en cápsulas. Cuatro categorías con icono, texto y tono: Cumpleaños (pastel, Rojo), Aniversario FLM (medalla, Burdeos, «5 años»), Encuentro de equipo (grupo, Marino) y Festivo (sol, celda con trama). La leyenda funciona como filtro. Al elegir un día, su círculo se abre en panel lateral (escritorio) u hoja inferior (móvil). En móvil, tira semanal más agenda, con la rejilla mensual opcional. Los cumpleaños muestran solo día y mes (sin año ni edad); los aniversarios se calculan desde la fecha de alta; los festivos se publican solo con fuente verificada y siempre con la etiqueta «Festivo».

### Perfil

Cabecera con foto o iniciales en círculo, nombre, cargo, departamento en cápsula, correo @flmexperts.com y «En FLM desde marzo de 2019». Progreso: matriz de 4 áreas por 3 formaciones con el glifo de dos mitades y cuatro anillos de evaluación. Formaciones obligatorias pendientes con fecha límite. Historial de tests (fecha, resultado, superado o no). Insignias sobrias tipo sello: antigüedad (1, 3, 5, 10, 15 y 20 años), áreas al día y evaluaciones superadas; las no ganadas aparecen en contorno discontinuo con cómo conseguirlas. Sin puntos ni rankings. Reconocimientos por contribuciones publicadas (título, fecha y unas palabras de administración). Ajustes: avisos, tema (claro, noche o sistema), movimiento, tamaño de lectura, atajos de una tecla (activar, desactivar o reasignar) y cerrar sesión (también en todos los dispositivos).

### Gestión

Espacio único tipo bandeja: lista con vista de tablero opcional por estado. Cada estado tiene icono y forma propios: Borrador (lápiz, contorno discontinuo), En revisión (reloj, medio círculo), Publicado (check, círculo lleno) y Archivado (caja, trama). Plantillas: Formación, Test, Actualidad (cinco bloques), Nota informativa, Evento y Comunicado, con valores por defecto (área del autor, fecha y hora de Madrid, icono sugerido). Editor dividido: formulario a la izquierda y vista previa en vivo a la derecha (en móvil, pestañas «Editar» y «Vista previa»). Guardado automático con copia local, «Enviar a revisión» (Autor), «Publicar» con confirmación y «Deshacer» (Administrador), diferencias entre versiones y protección ante cambios sin guardar. Administración: personas (activar y desactivar), sesiones (revocar), supresión controlada de datos personales con doble confirmación, recuperación segura de contraseña e informes restringidos (formaciones obligatorias por departamento y errores frecuentes por pregunta). En la demo pública, una banda fija dice «Simulación: los cambios no se guardan» y hay un selector de rol.

---

## 12. Estados impecables (textos)

| Situación | Mensaje | Acciones |
|---|---|---|
| Búsqueda sin resultados | «No hemos encontrado nada con “verifatcu”. ¿Querías decir “VERI*FACTU”?» | Quitar filtros · Proponer este tema |
| Documento no disponible | «Este documento se ha retirado o sustituido por una versión más reciente.» | Ver la versión vigente · Volver a Notas informativas |
| Archivo no admitido | «Solo se pueden subir archivos PDF. “Informe.docx” no es compatible: guárdalo como PDF y vuelve a intentarlo.» | Elegir otro archivo |
| Archivo demasiado grande | «“Nota-IVA.pdf” ocupa 32 MB y el máximo es 20 MB. Comprímelo o divídelo en partes.» | Elegir otro archivo |
| Campo no válido | «Añade la fuente oficial (enlace al BOE, la AEAT, el CENDOJ…) para poder enviar a revisión.» Junto al campo y en un resumen con enlaces | Ir al campo |
| Sesión caducada | «Tu sesión ha caducado por seguridad. Vuelve a entrar: tu borrador está guardado en este dispositivo.» | Entrar de nuevo |
| Permisos insuficientes | «Publicar es una función de administración. Puedes enviar el contenido a revisión y te avisaremos cuando se publique.» | Enviar a revisión |
| Error al guardar | «No se ha podido guardar. Tu texto sigue aquí y hay una copia en este dispositivo. Lo intentaremos de nuevo en 10 s.» | Reintentar ahora |
| Sin conexión | «Sin conexión. Puedes seguir leyendo lo que ya has abierto; enviaremos tus respuestas cuando vuelva la conexión.» | — |
| Cambios sin guardar | «Tienes cambios sin guardar en “Recargos por presentación fuera de plazo”.» | Guardar borrador y salir · Salir sin guardar · Seguir editando |
| Página no disponible | «Esta página no existe o ha cambiado de sitio.» Con el buscador ya enfocado | Ir al inicio |
| Histórico vacío | «Todavía no hay eventos en el histórico. Cuando termine el próximo, lo verás aquí con sus fotos y su material.» | Ver próximos |
| Carga lenta | Esqueletos con la forma real del contenido, solo si la espera supera 150 ms. Nunca un indicador de carga a pantalla completa | — |

---

## 13. Mapa de teclado

| Acción | Atajo |
|---|---|
| Buscar y mando | Ctrl K · ⌘K · / |
| Ver atajos | ? |
| Ir a Inicio, Aprender, Consultar, Participar, Mi perfil, Gestión | G I · G A · G C · G P · G M · G G |
| Cambiar de área (en Aprender) | 1 Fiscal · 2 Laboral · 3 Mercantil · 4 Contable |
| Moverse por listas, abrir, volver | J y K (o flechas) · Intro · Esc |
| Vista rápida de PDF | Espacio |
| Descargar el PDF original desde la búsqueda | Ctrl Intro |
| Sección anterior o siguiente · ir al test | [ · ] · T |
| Responder | 1–4 · Intro (comprobar y siguiente) |
| Calendario | Flechas · RePág y AvPág · Inicio y Fin · H (hoy) |
| Crear · guardar borrador · enviar a revisión o publicar | C · Ctrl S · Ctrl Mayús Intro (con confirmación) |

En Mac, Ctrl pasa a ⌘. Los atajos de una tecla se pueden desactivar o reasignar y nunca actúan con el foco en un campo de texto.

---

## 14. Accesibilidad WCAG 2.2 AA: lo que exige este concepto

- **1.4.3 y 1.4.11 (contraste):** tokens medidos (sección 4.1); bordes de campo #857D72 (3,70:1); anillo de foco doble (2 px Marino + 2 px de separación Papel; Papel sobre fondos oscuros).
- **1.4.1 (uso del color):** el área, el estado y el resultado se expresan siempre con texto y forma.
- **2.1.4 (atajos de una tecla):** se pueden desactivar o reasignar y solo actúan fuera de los campos.
- **2.4.7 y 2.4.11 (foco visible y no tapado):** `scroll-padding` que reserva la barra superior y la inferior; los avisos no tapan el foco.
- **2.5.7 (movimientos de arrastre):** deslizar, arrastrar en el tablero o cerrar hojas siempre tienen alternativa con botón o menú.
- **2.5.8 (tamaño del objetivo):** 44 × 44 px como norma (el mínimo es 24 × 24).
- **3.2.3 y 3.2.6 (navegación y ayuda coherentes):** cinco destinos iguales en todos los dispositivos; la ayuda («?» y «Ayuda» en el menú de perfil) siempre en el mismo sitio.
- **3.3.7 y 3.3.8 (entrada redundante y autenticación accesible):** no se piden datos ya dados; sin pruebas cognitivas; se puede pegar la contraseña y usar gestores.
- **4.1.3 (mensajes de estado):** `aria-live` para recuentos de búsqueda, guardado, resultados de test y avisos.
- **Estructura:** puntos de referencia (navegación, principal, complementario), jerarquía de titulares, `lang="es-ES"`, `<abbr>` para siglas (LGT, ET, ICAC), reflujo a 320 px y zoom del 200 % sin pérdida.

---

## 15. Cómo se construye en React

- **Base:** React 19 + Vite + TypeScript en modo estricto; React Router en modo SPA con rutas diferidas.
- **Movimiento:** Motion (`motion/react`): `LayoutGroup` y `layoutId` para las transformaciones círculo → cápsula → panel; `AnimatePresence`; `useScroll` y `useSpring` para el hilo; `MotionConfig reducedMotion="user"`. GSAP no hace falta: un generador `conectorLiquido(a, b, { cuello, radio })` devuelve siempre la misma estructura de comandos SVG (arcos, sin filtros de desenfoque), y Motion interpola su atributo `d`.
- **Componentes base:** `Capsula`, `Circulo`, `ConectorLiquido`, `Hilo`, `GlifoEstado`, `Escalera`, `Buscador`, `PortadaTipografica`, `Estanteria` y `LineaDeTiempo`, con tokens en variables CSS (claro y noche) y CSS Modules.
- **Librerías:** cmdk (MIT) para la búsqueda y mando como combobox accesible; React Aria Components y @internationalized/date (Apache 2.0) para el calendario (es-ES, Europe/Madrid), diálogos, menús y pestañas; MiniSearch (MIT) con índice generado en compilación (normalización sin tildes, prefijos y tolerancia a erratas); pdfjs-dist (Apache 2.0) para el visor y las miniaturas; @phosphor-icons/react (MIT) con importación por icono; vite-plugin-pwa (opcional) para leer sin conexión.
- **Contenido:** formaciones, actualidad, eventos y lecturas en archivos validados con Zod durante la compilación; la demo solo incluye contenido aprobado para publicarse.
- **Velocidad percibida:** precarga por intención (80 ms de puntero encima, foco o inicio de toque); esqueletos solo tras 150 ms; actualizaciones optimistas; restauración del desplazamiento; imágenes AVIF o WebP con `srcset` y color dominante como marcador.
- **Presupuestos:** JS inicial de 150 KB gzip como máximo; LCP de 1,8 s o menos (móvil medio, 4G); INP de 100 ms o menos; CLS de 0,05 o menos; fuentes de 180 KB o menos; resultados de búsqueda en menos de 50 ms con unos 1.000 documentos.
- **GitHub Pages:** `base: '/flm-campus/'`, `404.html` como copia de `index.html` para que funcionen los enlaces directos, banda «Simulación» en Gestión y datos ficticios rotulados.
- **Calidad:** Playwright con axe-core en cada ruta (claro, noche, móvil y movimiento reducido); prueba automática del contraste de los tokens; Lighthouse CI con los presupuestos anteriores.

---

## 16. Frente a la versión anterior

| Aspecto | Versión anterior | «Círculo abierto» |
|---|---|---|
| Marca | Logotipo sobre barra marino en discos blancos, una versión que no coincide con ningún archivo oficial revisado | Archivo original intacto; el gesto de la marca vive en la interacción |
| Primera pantalla | Titular genérico «Aprende hoy. Aplícalo cada día.» y pestañas por área | Mensaje base, escalera Aprender · Consultar · Participar con tu estado real y «Tu día» |
| Imágenes | Stock y escenas generadas | Solo fotos reales de FLM; portadas tipográficas generativas |
| Datos | Contadores de visitas | Ninguna métrica inventada; demo rotulada |
| Búsqueda | Por área | Global (Ctrl K), sin tildes y tolerante a erratas |
| Contraste | Botones rojos con texto blanco pequeño (4,34:1) | Tokens medidos; rojo nunca en texto pequeño |
| Progreso | «Marcar como completada» | Glifo de dos mitades: leída, test intentado, test superado, completada |
| Móvil | Pestañas con desplazamiento horizontal | Cinco destinos en barra inferior, los mismos que en escritorio |
| Movimiento | Casi inexistente | Gramática propia (círculo → cápsula → panel) y dos momentos firma |

---

## 17. Riesgos y mitigaciones

1. **Fidelidad del logotipo.** Solo hay PNG. Pedir a FLM los vectores originales (SVG, AI o PDF) y una versión negativa; no vectorizar a mano para producción; el logotipo nunca se anima por dentro.
2. **La escalera y el test recuerdan a FLM-Diagonal.** Deben leerse como componentes y no como logotipos: iconos en lugar de letras, cápsulas blancas, tamaños de 20–72 px. Validarlo con la clienta antes de producir.
3. **Contraste del rojo.** #E53327 da 3,96:1 sobre Papel y 4,34:1 con blanco: queda prohibido en texto pequeño y en botones con texto normal, y una prueba de contraste en CI lo vigila.
4. **Áreas poco distinguibles por color** (2,04:1 y 1,71:1 entre sí) y Contable sin variante oficial: forma y texto siempre; no se inventa un logotipo para Contable; consultar a FLM.
5. **Atajos de una tecla y tecnologías de apoyo:** se pueden desactivar y reasignar y no actúan en campos.
6. **Descubrimiento de la búsqueda** por personas poco habituadas al teclado: cápsula visible con texto, consejo inicial una sola vez y círculo de búsqueda en móvil; nada depende solo del teclado.
7. **Rendimiento en Android de gama media:** el eje de anchura y los conectores SVG se limitan a tres elementos animados a la vez, con alternativa estática y el presupuesto de JS vigilado.
8. **GitHub Pages:** rutas profundas con `404.html`, ruta base y un índice de búsqueda que solo contiene contenido aprobado para la demo.
9. **Datos personales en la demo:** nombres, cumpleaños y progreso ficticios y rotulados; fotos de personas (socio, asistentes al desayuno) solo con su consentimiento.
10. **Exceso de movimiento:** momentos firma de 1,5 s como máximo, sin bucles, entrada de Inicio una vez al día y preferencia del usuario respetada.
11. **Exactitud jurídica:** formaciones y actualidad necesitan fuentes y revisión editorial antes de publicarse; las portadas tipográficas no pueden sugerir cifras no verificadas.

---

## 18. Preguntas abiertas para FLM

1. ¿Existen originales vectoriales y una versión negativa oficial del logotipo?
2. ¿Hay una variante de departamento para Contable o se prefiere no tenerla?
3. ¿Hay guía de marca o una tipografía corporativa definida (por ejemplo, la del bloque de Crowe Global)?
4. ¿Contamos con consentimiento de imagen para el socio fotografiado y los asistentes al Desayuno Mercantil?
5. ¿Qué festivos (nacionales, autonómicos y locales de Barcelona) deben figurar y con qué fuente?
6. ¿Quién valida los contenidos jurídicos y contables antes de publicarlos?

---

## Archivos revisados

- Brief: C:\Users\usuario\Downloads\FLM_Campus_Design_Development_Brief_EN.md
- Logotipos: C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\recursos\identidad-flm\ (FLM-Horizontal.png, logo-hor-FLM-Crowe.png, logo-ver-FLM-Crowe.png, FLM-Vertical.png, FLM-Diagonal.png, FLM-H-Arriba.png, FLM-H-Abajo.png, FLM-V-Derecha.png, FLM-V-Izq.png, FLM-Horizontal Marco.png, FLM-Horizontal Marco Transparente.png, FLM-Horizontal Redes.png, FLM - Fiscal.png, FLM - Laboral.png, FLM - Mercantil.png)
- Fotografías: misma carpeta (RECEPCIÓ.jpg, BIBLIOTECA 1.jpg, BIBLIOTECA 2.jpg, LIBRETA FLM 1.jpg, EDIFICIO FLM 1.jpg, EDIFICIO FACHADA FLM 1.jpg, EDIFICIO FACHADA FLM 3.jpg, ÁNGEL MARÍA CENICEROS 3 - Socio Área Fiscal.jpg, Desayuno Mercantil FLM.png) y C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\FOTOS FLM RECURSOS\BUZON SUGERENCIAS FOTO.jpg
- Comunicación en redes: C:\Users\usuario\Documents\FLM CAMPUS\research\downloads\02-redes-crowe\linkedin-img\ (cover.jpg, p05-mitos-1.jpg, p07-palabra-1.jpg, p08-checklist.jpg)
- Web corporativa descargada (tipografías y estilos): C:\Users\usuario\Documents\FLM CAMPUS\research\downloads\site-raw\
- Versión anterior: C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\preview-portada.png, preview-formacion.png, preview-eventos.png, preview-campus-movil-verificado.png, preview-calendario-v20.png, preview-perfil.png, preview-notas-informativas.png y preview-test-sector-movil.png
- Medición de color y contraste: muestreo de píxeles de los PNG oficiales y cálculo de contraste WCAG con scripts propios (resultados en la sección 4.1)

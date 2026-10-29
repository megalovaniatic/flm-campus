# Vasos comunicantes

## Concepto de marca en movimiento para FLM Campus

**Enfoque:** marca en movimiento (motion branding) · **Fecha:** 28 de octubre de 2026 · **Estado:** propuesta para validar con FLM

> **Nota del 29/10/2026.** Propuesta conservada tal como se presentó. Después, a petición de la clienta, FLM Campus dejó de guardar y mostrar cumpleaños y fechas de incorporación, y todas sus formaciones pasaron a ser voluntarias. Por eso no forman parte del producto las categorías «Cumpleaños» y «Aniversario FLM» del calendario (ni su anillo «una vuelta más»), el anillo de antigüedad del perfil («En FLM desde…»), los reconocimientos por antigüedad, las formaciones obligatorias con fecha límite ni el informe de obligatorias completadas: administración solo ve informes agregados, sin nombres. Lo vigente está en `docs/`.

> **Compromiso con la clienta.** No se modifica ningún logotipo ni ningún color. Usamos los archivos originales tal como están y no los redibujamos, recoloreamos ni deformamos. Todos los tonos de la interfaz son los colores oficiales o mezclas de esos colores con blanco o entre sí; no hay ningún tono nuevo. Todo el movimiento sale de la geometría oficial, que hemos medido píxel a píxel sobre los archivos.

---

## 0. El concepto en cinco líneas

1. Las variantes oficiales de FLM (horizontal, vertical, diagonal, escalón arriba y abajo, cápsulas de departamento, fondo de Redes) son **fotogramas de una misma física**: círculos que se tocan, se expanden, se conectan y se superponen, unidos por un único degradado.
2. Hemos medido que ese degradado **se comporta como un líquido**. En FISCAL, LABORAL y MERCANTIL el color del departamento ocupa una meseta sólida en su cápsula y la transición se comprime en el resto: el color fluye hacia el recipiente que se agranda.
3. **Vasos comunicantes** convierte esa física en la gramática de interacción de todo el Campus. Cada variante oficial pasa a ser un verbo: recorrer, listar, avanzar, archivar, entrar en un área o convivir.
4. El nombre también expresa el propósito: en un despacho multidisciplinar, lo que sabe Fiscal afecta a Mercantil y a Laboral, y **cuando uno aprende, sube el nivel de todos**.
5. Hay dos momentos firma. En la **Obertura**, la marca se vierte en los tres caminos (Aprender, Consultar, Participar). En **El escalón**, aprobar una formación es literalmente la variante oficial «H-Arriba».

**Lema del concepto:** *Cuando uno aprende, sube el nivel de todos.*
El mensaje base de la clienta («Tu espacio para estar al día, compartir conocimiento y avanzar en FLM.») y el de apoyo («Apostamos por tu formación y tu crecimiento.») se mantienen como titulares del producto.

---

## 1. Lo que hemos verificado

### 1.1 Sistema de logotipos (archivos originales con transparencia)

| Archivo | Disposición | Observación útil para el movimiento |
|---|---|---|
| `FLM-Horizontal.png` | Tres círculos en fila | Los círculos se solapan un 3 % y forman una «cintura» de contacto |
| `FLM-Vertical.png` | Tres círculos en columna | Degradado vertical: sigue el recorrido F→M |
| `FLM-Diagonal.png` | Escalera descendente | Los círculos no se tocan: los une un conector líquido con filetes cóncavos |
| `FLM-H-Abajo.png` | F–L en fila, M baja un escalón | Escalón hacia abajo |
| `FLM-H-Arriba.png` | F–L en fila, M sube un escalón | Escalón hacia arriba |
| `FLM-V-Derecha.png` / `FLM-V-Izq.png` | Columna con un escalón lateral | Degradado diagonal que también sigue el recorrido |
| `FLM - Fiscal/Laboral/Mercantil.png` | La inicial se expande en cápsula con el nombre del área | **F→FISCAL, L→LABORAL, M→MERCANTIL**. Contable no tiene letra |
| `FLM-Horizontal Redes.png` | Círculos blancos con letras caladas sobre grandes círculos translúcidos | Atmósfera y comunidad |
| `logo-hor-FLM-Crowe.png` / `logo-ver-FLM-Crowe.png` | Con «A business associate of Crowe Global» | Firma institucional |

### 1.2 Geometría medida (sobre `FLM-Horizontal.png` 1314×449 y `FLM-Diagonal.png` 1314×1315)

| Medida | Valor en el original | Regla derivada para el Campus |
|---|---|---|
| Diámetro del círculo | 447 px (R = 223,5) | D |
| Distancia entre centros contiguos | 433 px | **paso = 0,969 D** |
| Solape entre círculos contiguos | 14 px | 3 % de D: la «cintura» de contacto |
| Paso en la diagonal | 431 × 433 px | El mismo paso en x y en y |
| Tramos rectos del conector | 70–71 px | **0,32 R** |
| Radio de los filetes cóncavos | 138–143 px | **0,62 R** |
| Cuello mínimo del conector | ≈134 px | 0,6 R |
| Texto dentro de la cápsula de departamento | Empieza a ≈0,68 R del extremo | Margen interior de toda cápsula |

El conector **no es un «goo» orgánico**. Es un trazado geométrico exacto: un tramo recto, un filete de un cuarto de círculo y otro tramo recto, simétrico respecto al punto medio entre centros. Lo reproducimos con esa misma geometría (anexo A).

### 1.3 Color medido

| Color | Valor | Dónde se mide |
|---|---|---|
| Rojo FLM | `#E53327` | Meseta izquierda del degradado (0–11,5 % del ancho) |
| Marino FLM | `#172641` | Meseta derecha (90,5–100 %) |
| Burdeos, punto medio de la rampa | `#7E2C34` (`#842D33` al 48,7 %) | `FLM-Horizontal.png` |
| Burdeos Laboral | `#7F343E` | Meseta sólida de la cápsula LABORAL (≈39–64 % del ancho) |
| Rojo vivo · vino · azul profundo · noche | `#FD1910` · `#6C131C` · `#002149` · `#151024` | `FLM-Horizontal Redes.png` |

**El degradado tiene dos paradas en sRGB:** `linear-gradient(90deg, #E53327 11.5%, #172641 90.5%)`, con mesetas sólidas en los extremos. No se interpola en OKLCH ni en OKLab, porque eso cambiaría el burdeos central.

**Hallazgo clave:** en las cápsulas de departamento la meseta se desplaza hacia el área.
- FISCAL es rojo sólido hasta ≈45 % del ancho.
- LABORAL tiene meseta `#7F343E` en el centro.
- MERCANTIL es marino sólido desde ≈47 %.

El color no cambia; **se redistribuye**. Esta es la base física del concepto.

### 1.4 Cómo comunica FLM hoy (LinkedIn, descargas en `research/downloads/02-redes-crowe`)

- **Portada:** «Tu partner estratégico en el laberinto legal». Las palabras van dentro de cápsulas unidas con los mismos conectores líquidos. FLM ya escribe con su geometría.
- **«Checklist mercantil antes de cerrar el año»:** cápsulas blancas con círculos de verificación.
- **«3 cosas que tu empresa debe revisar…»:** un CTA en cápsula («Descubre más») que termina en un círculo con flecha, y un numeral en serifa.
- **«Explicamos MASA ACTIVA»:** acento tipográfico con serifa clásica sobre un degradado granulado rojo-marino.
- **«5 mitos sobre la factura electrónica»:** foto con veladura roja→marina, filetes finos y logotipo en contorno.

**Conclusión:** el Campus no inventa un lenguaje. Extiende al tiempo, al gesto y al estado uno que FLM ya utiliza.

### 1.5 Fotografía real disponible

- **Recepción (`RECEPCIÓ.jpg`).** Personas caminando con desenfoque de movimiento por exposición larga. Es, literalmente, «FLM en movimiento».
- **Salas-biblioteca (`BIBLIOTECA 1/2.jpg`).** Tomos jurídicos con lomos de bandas rojas, mesa de madera y roll-up de FLM.
- **Edificio y fachada.** Muro cortina de vidrio facetado, de ritmo escalonado.
- **Libreta burdeos** con bolígrafo.
- **Retrato del socio del Área Fiscal.**
- **Desayuno Mercantil.** Pantalla con «La información es poder» y tres cápsulas: Obtener, Compartir, Anticipar. En «Compartir» se lee: «Fiscal, Laboral y Mercantil, con la misma visión de cada cliente». Es la idea de vasos comunicantes, dicha por FLM.
- **Observaciones:**
  - El «buzón de sugerencias» es un icono de stock con degradado violeta→rojo, no una foto, y queda fuera de la paleta.
  - `bilbao_berria_restaurante_barcelona_catedral.jpg` es una imagen de terceros.
  - La señalética, el roll-up y la libreta usan un logotipo lineal distinto («FLM | A business associate of Crowe Global» en trazo fino). El Campus usa solo los archivos de círculos facilitados (ver riesgos).

### 1.6 Verificado frente a propuesto

| Verificado (no se toca) | Propuesto (decisión de diseño) |
|---|---|
| Logotipos y variantes, en sus archivos originales | Significado de cada variante como verbo de interacción |
| Rojo `#E53327`, marino `#172641` y degradado sRGB con mesetas | Papel `#FAF7F7` y tonos funcionales como mezclas de los oficiales |
| Burdeos de rampa `#7E2C34` y de Laboral `#7F343E` | Asignación de color por área (Fiscal, Laboral, Mercantil = mesetas oficiales; Contable = la rampa completa) |
| Paleta de Redes | Uso de esa paleta solo como atmósfera |
| Geometría de solape, conector y cápsula | Animaciones construidas con esa geometría |
| Cápsula de departamento F/L/M | Glifos posicionales sin letras para la interfaz |
| Comunicación con cápsulas y conectores en LinkedIn | Escalera de tres caminos en el inicio |

---

## 2. La idea

FLM ya tiene un sistema de movimiento; solo le faltaba el tiempo. Sus variantes oficiales son instantes de una misma física, y nuestro trabajo consiste en dibujar los fotogramas intermedios.

Los círculos son **vasos**. El degradado es **un único líquido** compartido. Los conectores de la versión diagonal son **el paso del líquido de un vaso a otro**. Las cápsulas de departamento son **un vaso que se agranda y recibe más color**. El fondo de Redes es **muchos vasos que coinciden**.

**Vasos comunicantes** es una imagen que en español todo el mundo entiende: áreas que dependen unas de otras y que comparten nivel. Para FLM es exacta. El Campus existe para que el conocimiento pase de un departamento a otro y de una persona al equipo. Estar «al día» es, en el fondo, tener todos el mismo nivel.

**Por qué sorprende.** Nadie espera que el logotipo de una asesoría sea, literalmente, la navegación, la barra de progreso y el momento de aprobado.

**Por qué es auténtico.** No añade ni un color, ni una forma, ni un logotipo nuevos.

---

## 3. La física de la marca: cuatro verbos y un líquido

| Verbo | Forma oficial de origen | Qué significa en el Campus | Ejemplos |
|---|---|---|---|
| **Tocar** | Solape del 3 % entre círculos (cintura) | Relación, foco, «estás aquí» | Indicador de navegación, foco, módulo actual |
| **Expandir** | Círculo → cápsula (departamentos) | Abrir, entrar, completar | Buscar, chips, eventos, entrar en un área, «Completada» |
| **Conectar** | Conector líquido (diagonal y escalones) | Secuencia, avance, consecuencia | Pasos de un ejemplo, test → completada, flujo editorial |
| **Superponer** | Círculos translúcidos (Redes) | Comunidad, coincidencia, ambiente | Participar, días con varios eventos, reconocimientos |
| **El líquido** | Degradado con mesetas | El color nunca cambia, se redistribuye | Áreas, transiciones, progreso |

### Siete reglas de movimiento

1. **Un solo líquido.** El degradado oficial se trata como un fluido. Nunca se recolorea, solo se redistribuye: se crean mesetas como en los logotipos de departamento y el color viaja por la rampa oficial, nunca en atajo.
2. **Dirección con sentido.** Avanzar va hacia el marino (izquierda→derecha, arriba→abajo). Volver, cerrar o deshacer va hacia el rojo, por el camino inverso.
3. **Contacto antes que salto.** Nada se teletransporta: lo que tocas se convierte en lo que abres (elementos compartidos con `layoutId`). Dos cosas relacionadas se tocan antes de conectarse.
4. **Geometría exacta.** Se usan el paso de 0,969 D, los filetes de 0,62 R y los tramos de 0,32 R. Está prohibido el «goo» de desenfoque más umbral.
5. **El logotipo no se mueve por dentro.** En reposo siempre se ve el archivo original. Durante una transición se mueve una forma geométrica sustituta, sin letras, que aterriza exactamente sobre el logotipo y le cede el sitio con un fundido de 120 ms.
6. **Lo real no se anima.** Las fotografías de personas y lugares de FLM no se deforman ni se mueven por dentro: son la parte quieta del vaso.
7. **Reposo.** No hay bucles infinitos ni movimientos autónomos de más de 5 s. El único movimiento ambiental está ligado al desplazamiento y desaparece con movimiento reducido.

---

## 4. Diccionario: cada variante oficial, un significado

| Variante oficial | Significado | Dónde aparece |
|---|---|---|
| **Horizontal** (tres en fila) | Conjunto y estado | Logotipo de cabecera; glifo de estado de cada formación |
| **Vertical** (columna) | Lista y pila | Navegación del inicio en móvil, módulos, cinco bloques de Actualidad |
| **Diagonal** (escalera) | Recorrido | Escalera de tres caminos del inicio; ejemplos resueltos paso a paso |
| **H-Arriba** (sube un escalón) | Avanzar, aprobar, publicar, restaurar | Momento firma «El escalón»; publicar y restaurar en Gestión |
| **H-Abajo** (baja un escalón) | Retirar, archivar, pasar a histórico | Archivar contenidos; eventos que pasan a Histórico |
| **Departamentos** (círculo → cápsula) | Entrar en un área, abrir, completar | Chips y cabeceras de área, «Formación completada» |
| **Redes** (translúcidos superpuestos) | Comunidad, coincidencia, atmósfera | Participar, calendario, Perfil |
| **FLM + Crowe** | Firma institucional | Pie, acceso, «Acerca del Campus» |

---

## 5. Semántica del círculo: estados sin colores nuevos

No añadimos verde, ámbar ni ningún color semántico. Cada estado se comunica con **forma + texto**, y el color solo refuerza. Así se cumple WCAG 1.4.1, porque nunca se depende únicamente del color.

| Forma | Significado | Texto que siempre la acompaña |
|---|---|---|
| Anillo cerrado (trazo de 2 px) | Disponible, sin empezar | «Sin empezar» |
| Anillo con nivel parcial | En progreso | «Leída», «Test intentado» |
| Círculo lleno | Hecho, aprobado, confirmado | «Test aprobado», «Confirmado» |
| Anillo abierto (hueco a las dos en punto) | Incompleto, incorrecto, error recuperable | «No es correcta», «No se ha podido guardar» |
| Anillo discontinuo | Pendiente | «Fecha por confirmar», «Borrador» |
| Cápsula (el círculo expandido) | Abierto, activo, completado | «Completada», «Publicado» |
| Escalón arriba / abajo | Avance / retirada | «Publicado», «Restaurado» / «Archivado», «Histórico» |

### Glifo de estado de una formación (tres círculos F·L·M sin letras)

Las posiciones del glifo codifican los cuatro estados que pide el brief:

- **F = Lectura**: se llena cuando se han leído todos los módulos.
- **L = Test**: con nivel a la mitad si se ha intentado; lleno si se ha aprobado.
- **M = Completada**: solo cuando F y L están llenos. En ese momento sube un escalón (H-Arriba).

Los estados resultantes son **Leída**, **Test intentado**, **Test aprobado** y **Completada**, siempre con su texto. Si alguien aprueba el test sin terminar la lectura, M no sube y aparece el aviso «Te falta terminar la lectura para completar la formación».

### Glifos posicionales de área (pictogramas de interfaz, no logotipos)

Son tres puntos en los que el área se identifica por la posición expandida, igual que en los logotipos oficiales:

- **Fiscal**: ▬●● (primera posición expandida)
- **Laboral**: ●▬● (segunda)
- **Mercantil**: ●●▬ (tercera)
- **Contable**: los tres puntos fundidos en una cápsula con la rampa completa: **«la suma»**. Contabilidad atraviesa las tres áreas.

Nunca llevan letras, para no imitar los logotipos de departamento.

---

## 6. Dirección de arte

### 6.1 Tokens de color (todos oficiales o mezclas de oficiales)

| Token | Valor | Origen |
|---|---|---|
| `--flm-rojo` | `#E53327` | Oficial |
| `--flm-marino` | `#172641` | Oficial |
| `--flm-burdeos` | `#7F343E` | Meseta oficial de Laboral |
| `--flm-degradado` | `linear-gradient(90deg, #E53327 11.5%, #172641 90.5%)` | Oficial, en sRGB |
| `--redes-rojo-vivo` / `--redes-vino` / `--redes-azul` / `--redes-noche` | `#FD1910` / `#6C131C` / `#002149` / `#151024` | Oficiales (Redes) |
| `--papel` | `#FAF7F7` | 4 % del punto medio del degradado sobre blanco |
| `--superficie` | `#FFFFFF` | Blanco |
| `--tinta` | `#172641` | Marino |
| `--tinta-2` | `#576174` | Marino al 72 % sobre papel |
| `--linea` | `#DADADE` | Marino al 14 %, filetes decorativos |
| `--borde-control` | `#7D8493` | Marino al 55 %, bordes de campos |
| `--rojo-texto` | `#D32E25` | 85 % rojo FLM + 15 % vino oficial; solo para texto pequeño en rojo |
| `--tinte-rojo` / `--tinte-burdeos` / `--tinte-marino` | `#F9EBEB` / `#F0E7E8` / `#ECEAEC` | Oficial al 6–8 % sobre papel |
| `--area-fiscal` / `--area-laboral` / `--area-mercantil` / `--area-contable` | `#E53327` / `#7F343E` / `#172641` / la rampa completa | Mesetas oficiales y rampa |

### 6.2 Contraste (calculado con la fórmula WCAG)

| Combinación | Ratio | Uso permitido |
|---|---|---|
| Blanco sobre rojo FLM `#E53327` | **4,34:1** | Solo texto grande (≥24 px, o ≥18,66 px en negrita) y gráficos |
| Rojo FLM sobre papel | 4,08:1 | Solo texto grande y gráficos |
| Blanco sobre `#D32E25` | 5,02:1 | Texto normal |
| `#D32E25` sobre papel | 4,71:1 | Antetítulos y énfasis |
| Blanco sobre burdeos `#7F343E` | 8,53:1 | Texto normal |
| Blanco sobre marino | 15,11:1 | Texto normal |
| Marino sobre papel | 14,18:1 | Texto principal |
| `#576174` sobre papel | 5,85:1 | Texto secundario |
| `#7D8493` sobre papel | 3,52:1 | Bordes de controles (≥3:1) |
| Rojo sobre marino | 3,48:1 | Solo gráficos y texto grande |
| Blanco sobre rojo vivo `#FD1910` | 3,95:1 | Atmósfera, sin texto pequeño |
| Rojo frente a burdeos / burdeos frente a marino | 1,96:1 / 1,77:1 | **Nunca distinguir áreas solo por color**: posición + nombre |

Más allá del ≈5 % de la rampa (`#DC3228`), el blanco ya alcanza 4,64:1. **Regla:** en una cápsula con degradado, el texto pequeño nunca se coloca sobre la meseta roja.

### 6.3 Proporciones

| Elemento | Proporción | Uso |
|---|---|---|
| Papel y blanco | ≈72 % | Superficies |
| Marino | ≈16 % | Texto, acciones principales, pie |
| Degradado | ≈8 % | Solo en círculos, cápsulas y conectores, nunca como lavado de fondos grandes |
| Rojo puro | ≈3 % | Puntos activos, inicio de cada recorrido, cifras grandes |
| Paleta de Redes | ≈1 % | Atmósfera de Participar, Perfil y reconocimientos |

La acción principal es una **cápsula marina** (15:1). El rojo se reserva para la energía de marca, no para botones con texto pequeño.

### 6.4 Fondos y motivos

- **Fondo:** papel `#FAF7F7` (cálido, en diálogo con la madera de miel de las fotos) y tarjetas blancas con filete `--linea` y radio de 28 px, sin sombras pesadas. Solo los paneles flotantes llevan sombra: `0 12px 32px rgba(23,38,65,.12)`.
- **Atmósfera de Redes:** dos o tres círculos translúcidos de 400–720 px (rojo al 9–10 %, marino al 7–8 %) que sangran fuera del lienzo. Solo aparecen en el inicio, en Participar y en Perfil.
- **Rejilla FLM:** cualquier composición de círculos usa el paso de 0,969 D.
- **Cápsula con remate circular**, tomada del CTA «Descubre más»: `[ Texto ··· (→) ]`.
- **Filetes finos de 1 px** para separar cabecera, secciones y pie, como en las piezas de LinkedIn.
- **Nada de ilustraciones genéricas.** Los diagramas se construyen con círculos, cápsulas y conectores. Las barras de los gráficos son cápsulas.

### 6.5 Uso del logotipo

**Dónde se usa cada archivo**
- **Cabecera:** `FLM-Horizontal.png` (o su SVG, si FLM lo facilita) a 28 px de alto en escritorio y 20–22 px en móvil. A su derecha va un filete de 1 px de la misma altura y el texto «Campus» en Archivo 600. «Campus» es texto de interfaz, no un logotipo nuevo. El espacio de respeto es medio diámetro de círculo.
- **Pie, pantalla de acceso y «Acerca del Campus»:** `logo-hor-FLM-Crowe.png` o `logo-ver-FLM-Crowe.png`. La frase de Crowe nunca se reescribe ni se traduce.
- **Cabeceras de Fiscal, Laboral y Mercantil:** su logotipo oficial de departamento a 56–64 px. Contable usa su glifo «suma» y su nombre, sin crear un logotipo «CONTABLE».
- **Favicon e icono de aplicación:** `FLM-Horizontal Redes.png`, el avatar cuadrado oficial.

**Lo que no se hace nunca**
- Recolorear, perfilar, rotar, separar letras, animar el interior o colocarlo sobre fotos sin una placa de papel.
- Usarlo sobre fondos oscuros sin una versión en negativo oficial (se pedirá a FLM).

### 6.6 Fotografía

- **Lo real, en color real.** Personas y lugares de FLM aparecen dentro de **círculos** (retratos, la recepción) o **cápsulas anchas** (salas, edificio), sin veladuras sobre caras ni texto encima de personas.
- **Lo ilustrativo, en duotono FLM.** El stock para temas profesionales va en duotono marino (sombras `#172641` → luces `#FAF7F7`), de modo que se distingue de un vistazo y nunca se confunde con una actividad real.
- **Las formaciones no llevan foto de stock**, sino portada tipográfica con numeral.

**Asignación de las fotos reales**

| Foto | Dónde se usa |
|---|---|
| Recepción | Inicio |
| Biblioteca | Cabecera de Consultar |
| Edificio | Pantalla de acceso y página 404 |
| Libreta | Notas informativas |
| Desayuno Mercantil | Histórico de eventos |
| Socio fiscal | Solo como autor de contenidos que haya firmado y con su consentimiento |

### 6.7 Iconografía

Usamos **Lucide** (licencia ISC), con trazo de 1,75 px y extremos redondeados, en 20 y 24 px. En la navegación los iconos van siempre dentro de un círculo y siempre con etiqueta de texto visible. Los iconos de eventos son: estrella, trofeo, taza de café, calendario, birrete y megáfono (comunicados).

---

## 7. Tipografía

### 7.1 Familias (licencia SIL OFL 1.1, variables, alojamiento propio)

**Archivo** (Omnibus-Type)
- Variable con anchura `wdth` 62–125, peso `wght` 100–900 y cursiva. Ejes comprobados contra la API de Google Fonts.
- Usos: interfaz, navegación, botones, etiquetas, datos y palabras dentro de cápsulas.

**Newsreader** (Production Type)
- Variable con tamaño óptico `opsz` 6–72, peso `wght` 200–800, romana y cursiva. Ejes comprobados contra la API de Google Fonts.
- Usos: titulares editoriales, lectura larga de formaciones y Actualidad, numerales grandes y la frase de apoyo.

### 7.2 Por qué estas dos

- **El eje de anchura de Archivo materializa el verbo *expandir*.**
  - Las palabras en cápsula se componen a anchura 106–112 en gran tamaño y riman con FISCAL, LABORAL y MERCANTIL de los logotipos de departamento.
  - En móvil la cápsula comprime su texto (anchura 75–92) en lugar de partirse en dos líneas.
  - En la entrada de una cápsula, la palabra se estira de 75 a 106 mientras el círculo se convierte en cápsula.
  - Tiene cifras tabulares para fechas y notas de test.
  - Es de una fundición argentina, con español y latín extendido completos (á é í ó ú ü ñ ¿ ¡ « » ª º € ·, también la ele geminada catalana).
- **Newsreader aporta la voz editorial de «la biblioteca del despacho»**, los tomos jurídicos de las salas, y continúa los acentos con serifa que FLM ya usa en LinkedIn.
  - Está diseñada para leer en pantalla de forma continua, con tamaños ópticos que se ajustan solos.
- **El logotipo no se compone con tipografía:** se usa siempre como archivo.

### 7.3 Escala

| Rol | Familia | Escritorio | Móvil | Ajustes |
|---|---|---|---|---|
| H1 de inicio | Newsreader | 60/64 | 32/36 | opsz 72, wght 400, interletraje −1,5 % |
| Palabra en cápsula | Archivo | 40/40 | 22/24 | wght 720, wdth 106 (móvil 92) |
| H2 | Newsreader | 40/44 | 28/32 | opsz 60, wght 420 |
| H3, título de tarjeta | Archivo | 21/28 | 18/24 | wght 650 |
| Lectura | Newsreader | 19/30 | 17/27 | opsz automático, 64–70 caracteres por línea |
| Interfaz | Archivo | 16/24 | 16/24 | wght 450 |
| Secundario | Archivo | 14/20 | 14/20 | wght 500, `--tinta-2` |
| Antetítulo | Archivo | 12,5/16 | 12/16 | Mayúsculas acentuadas (FORMACIÓN), wght 650, +8 %, `--rojo-texto` |
| Numeral de portada | Newsreader | 120 | 72 | opsz 72, wght 300 |

### 7.4 Normas tipográficas

- **Puntuación y mayúsculas:** comillas latinas « », raya para incisos y mayúsculas siempre acentuadas.
- **Cifras y párrafos:** `tabular-nums` en fechas y resultados; `hyphens: auto` con `lang="es-ES"` solo en párrafos, nunca en titulares.
- **Carga de fuentes:** WOFF2 con subconjunto latino y `font-display: swap`. Se precargan solo las dos romanas; la cursiva se carga diferida. Se usan métricas de respaldo (`size-adjust` y `ascent-override` sobre Arial y Georgia) para que la maqueta no salte.
- **Presupuesto:** fuentes ≤ 260 KB en total; cada archivo debería quedar en unos 70–100 KB, a verificar tras el subsetting.

---

## 8. Sistema de movimiento

### 8.1 Tokens

| Token | Valor | Uso |
|---|---|---|
| `--t-contacto` | 120 ms | Pulsación, pulso de guardado, fundido de traspaso al logotipo |
| `--t-rapido` | 180 ms | Hover, foco, chips |
| `--t-expandir` | 260 ms | Círculo→cápsula pequeño (buscar, chip) |
| `--t-panel` | 340 ms | Cápsula→panel, hojas inferiores, fichas |
| `--t-verter` | 360 ms | Formación de conectores |
| `--t-escena` | 440 ms | Cambio de área o de página con elemento compartido |
| `--e-expandir` | `cubic-bezier(0.22, 1, 0.36, 1)` | Abrir: decidido al inicio, suave al final |
| `--e-recoger` | `cubic-bezier(0.4, 0, 1, 1)` en 200 ms | Cerrar: acelera al salir |
| `--e-verter` | `cubic-bezier(0.65, 0, 0.35, 1)` | Líquido que pasa entre vasos |
| `--e-nivel` | `cubic-bezier(0.33, 0, 0.2, 1)` | Nivel que sube |
| `--e-entrar` | `cubic-bezier(0.33, 1, 0.68, 1)` | Fundidos y deslizamientos de contenido |

| Muelle (Motion) | Parámetros | Comportamiento calculado |
|---|---|---|
| `contacto` | stiffness 520, damping 40 | ζ ≈ 0,88; sin rebote visible; ≈200 ms |
| `capsula` | stiffness 320, damping 32 | ζ ≈ 0,89; ≈250 ms |
| `aparecer` | stiffness 420, damping 32 | ζ ≈ 0,78; rebote ≈2 %; ≈250 ms |
| `escalon` | stiffness 300, damping 26 | ζ ≈ 0,75; rebote ≈3 %; ≈310 ms |

**Límites:** la interfaz se mueve entre 120 y 440 ms y como máximo 24 px. Los momentos firma duran 1,5–1,7 s, siempre se pueden saltar y nunca bloquean la interacción.

### 8.2 Implementación en React 19 + Vite + TypeScript

**Motion (`motion/react`)**
- `MotionConfig reducedMotion` respeta el sistema y además un ajuste propio, «Reducir movimiento», en Perfil > Ajustes.
- `LazyMotion` con `domMax` y componentes `m` para cargar menos código.
- `layoutId` para los elementos compartidos.
- `useScroll` + `useTransform` para el nivel de lectura y la atmósfera.
- `animate()` con secuencias (`at`) para los momentos firma.
- **No hace falta GSAP:** nos ahorramos una segunda librería y una segunda lógica de tiempo.

**Conector:** el trazado se genera con la geometría oficial (anexo A). El cuello se forma con un **escalado perpendicular al eje A→B de 0 a 1**: solo es una transformación, sin recalcular trazados. El último fotograma coincide exactamente con el original.

**Círculo → cápsula**
- El contenido se maqueta ya con su ancho final, sin reflujo, y se revela con `clip-path: inset(... round R)`.
- El recorte se aplica a una capa interior (o se elimina al terminar) para no cortar el anillo de foco.

**Sustituto de logotipo:** una cápsula geométrica del color de la meseta viaja hasta la cabecera y se funde en 120 ms con el PNG o SVG oficial de departamento.

**Rendimiento**
- Solo se animan `transform`, `opacity` y `clip-path`; `will-change` se pone solo durante la animación.
- Los momentos firma no se ejecutan si la pestaña está oculta.
- Presupuesto: JS inicial ≤ 170 KB comprimido; prueba en un Android de gama media.

**Control de calidad**
- Capturas de Playwright del fotograma final de cada transición, superpuestas a los PNG oficiales: la geometría debe coincidir.
- Pruebas con `prefers-reduced-motion: reduce`, solo teclado, VoiceOver iOS y NVDA.

---

## 9. Arquitectura y navegación

### 9.1 Mapa del sitio

- **Inicio** (personal)
- **Aprender**: Fiscal · Laboral · Mercantil · Contable → tres formaciones por área → test final (3 preguntas, aprobado 2/3). Además, «Pon a prueba tus conocimientos» por área (10 preguntas, aprobado 8/10).
- **Consultar**: Notas informativas · Actualidad en tu sector · Lecturas recomendadas.
- **Participar**: Eventos y comunicados (Actuales y próximos / Histórico) · Calendario · Propuestas (temas de formación, mejoras de procesos, LinkedIn, reseñas, vídeos).
- **Perfil** (avatar): Mi progreso · Reconocimientos · Ajustes · Cerrar sesión.
- **Gestión** (solo autores y administración): Contenidos · Revisión · Personas y accesos · Informes.
- **Buscar**: global y siempre accesible.

**Decisión clave:** la navegación usa los tres verbos del propósito. La escalera del inicio y la barra de navegación dicen exactamente lo mismo.

### 9.2 Escritorio

- **Cabecera de 72 px**:
  - A la izquierda, logotipo + «Campus».
  - En el centro, Inicio · Aprender · Consultar · Participar (Archivo 500, 15 px) con la **gota** como indicador activo.
  - A la derecha, buscar (círculo de 40 px que se expande) y avatar con anillo de progreso, que abre Perfil, Gestión (según rol) y Cerrar sesión.
- **Subsecciones:** control segmentado en cápsula con la gota deslizante.
- **Rejilla y ritmo:**
  - 12 columnas, márgenes de 64 px, calles de 24 px y ancho máximo de 1312 px.
  - Columna de lectura de 680 px.
  - Base de 8 px; separación entre secciones de 96 px (64 en móvil), marcada con filetes finos.
- **Puntos de corte:**

| Ancho | Composición |
|---|---|
| < 600 px | Gramática vertical |
| 600–1023 px | Diagonal compacta |
| ≥ 1024 px | Diagonal completa |

### 9.3 Móvil (experiencia de primera clase)

- **Barra superior de 56 px:** logotipo, buscar y avatar → Perfil, igual que en escritorio.
- **Barra inferior de 64 px + zona segura:** Inicio · Aprender · Consultar · Participar, con icono y etiqueta siempre visibles. La pestaña activa lleva su icono dentro de un círculo marino de 40 px que viaja como una gota.
- **Hojas inferiores** para día de calendario, evento y lectura, con botón Cerrar (nunca solo arrastre). Todos los objetivos táctiles miden ≥ 44 px.
- **Gestión** se abre desde Perfil, con edición en una columna y alternancia Editar/Vista previa.

### 9.4 Transiciones entre páginas

- **Con elemento compartido:** lo que tocas se convierte en la cabecera de destino. Un chip de área se expande en cabecera de área, una tarjeta en título y una cápsula de la escalera en la cabecera de su sección. Dura 440 ms con el muelle `capsula`.
- **El resto:** fundido de 180 ms con desplazamiento de 12 px en el sentido del recorrido.
- **Foco y anuncio:** el foco va al H1 de destino y se anuncia el título de la página.

---

## 10. Primera pantalla

### 10.1 Escritorio (1440 × 900)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [FLM] │ Campus        Inicio·  Aprender  Consultar  Participar      (⌕)  (AM) │ 72
├──────────────────────────────────────────────────────────────────────────────┤
│ Buenos días, Alex · miércoles, 28 de octubre   (Cuenta de demostración)      │
│                                                             ╭────────────╮   │
│ Tu espacio para estar al día,                             ╱   RECEPCIÓN    ╲  │
│ compartir conocimiento                                   │  (foto real FLM)  │ │
│ y avanzar en FLM.                                         ╲  ◯ ◯ (Redes)   ╱  │
│                                                             ╰────────────╯   │
│ ( Aprender  → )  12 formaciones · Fiscal, Laboral, Mercantil y Contable       │
│ Apostamos por ╰─( Consultar  → )  Notas informativas, actualidad y lecturas  │
│ tu formación y            ╰─( Participar  → )  Eventos, calendario y propuestas│
│ tu crecimiento.                                                              │
│ ┌ Continúa tu formación ─┐ ┌ Actualidad en tu sector ┐ ┌ Próximo en FLM ────┐ │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Cabecera (0–72)**
- Logotipo `FLM-Horizontal` de 28 px de alto en x 64, y 22.
- Filete de 24 px y «Campus» en Archivo 600 de 18 px.
- Navegación centrada en 720.
- Buscar (Ø 40) en x 1268 y avatar (Ø 40) en x 1336.

**Saludo (y 112)**
- Archivo 500, 15 px, `--tinta-2`: «Buenos días, Alex · miércoles, 28 de octubre».
- Etiqueta en cápsula de contorno: «Cuenta de demostración».

**H1 (x 64, y 144–336, columnas 1–8)**
- Newsreader opsz 72, peso 400, 60/64, marino.
- Tres líneas: «Tu espacio para estar al día, / compartir conocimiento / y avanzar en FLM.»
- Es visible desde el primer fotograma: no retrasa el LCP.

**Círculo fotográfico**
- Ø 336 en x 1040–1376, y 104–440, con `RECEPCIÓ.jpg`. Se ven las personas en movimiento y el rótulo de FLM.
- Detrás, dos círculos de Redes:
  - Ø 520 en `#E53327` al 9 %, con centro en 1290, 210.
  - Ø 440 en `#172641` al 8 %, con centro en 1160, 520.
- Pie de foto en y 452 (Archivo 13 px): «Recepción de FLM, Barcelona».

**Escalera de tres caminos (gramática Diagonal con cápsulas)**
- Cápsulas de 88 px de alto (R 44), con paso de 85,3 px en x e y y un solape de 2,7 px.
- Un solo degradado oficial recorre toda la escalera, de rojo a marino.
- Cada cápsula lleva la palabra (Archivo 720, wdth 106, 40 px, blanco) y un remate circular blanco de Ø 56 con una flecha del color de la cápsula.

| Cápsula | Posición | Texto a la derecha (Archivo 500, 15 px, `--tinta-2`) |
|---|---|---|
| **Aprender** | x 64–374, y 372–460 | «12 formaciones · Fiscal, Laboral, Mercantil y Contable» |
| **Consultar** | x 371–705, y 457–545 | «Notas informativas, actualidad y lecturas» |
| **Participar** | x 702–1060, y 542–630 | «Eventos, calendario y propuestas» |

Los conectores siguen la geometría oficial.

**Frase de apoyo**
- En el triángulo inferior izquierdo (x 64, y 492): Newsreader cursiva 22/28, `--tinta-2`: «Apostamos por tu formación / y tu crecimiento.»

**Fila «Hoy» (y 676–856)**
- Tres tarjetas blancas de cuatro columnas, con radio de 28 px y filete.
  1. **Continúa tu formación:** glifo de estado (F lleno) + «Mercantil · Cuándo derivar un cliente a Mercantil» + «Módulo 2 de 4 · 6 min» + cápsula «Continuar».
  2. **Actualidad en tu sector:** solo el bloque 1 de la última pieza publicada («La novedad, en una frase»), su tipo (Legislación, Jurisprudencia, Criterio administrativo o Aviso interno), su fecha y el glifo de área.
  3. **Próximo en FLM:** «Desayuno Fiscal» con anillo discontinuo y el texto «Fecha por confirmar»; debajo, la formación de ChatGPT y Claude con su fecha o el aviso «Fecha por confirmar».

### 10.2 Móvil (390 × 844)

```
┌──────────────────────────────┐
│ [FLM]│Campus        (⌕) (AM) │ 56
│ Buenos días, Alex  (Demo)    │
│ Tu espacio para estar        │   ◯ Redes al 7–9 %
│ al día, compartir            │
│ conocimiento y avanzar       │
│ en FLM.                      │
│ (◉) Aprender               › │  ← círculos tangentes en columna
│ (◉) Consultar              › │     (gramática FLM-Vertical,
│ (◉) Participar             › │      degradado vertical)
│ Apostamos por tu formación…  │
│ ┌ Continúa tu formación ───┐ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Inicio Aprender Consultar Participar │ 64 + zona segura
└──────────────────────────────┘
```

**Barra superior (56 px)**
- Logotipo de 20 px de alto en x 16, filete y «Campus» de 15 px.
- Buscar (Ø 40, objetivo de 44 px) y avatar (Ø 36, objetivo de 44 px).

**Saludo y H1**
- Saludo en y 72 (13 px) con la etiqueta «Demo».
- H1 en y 96–240: Newsreader 32/36, cuatro líneas.
- Detrás, a la derecha: círculo de Redes Ø 300 en rojo al 9 % y Ø 240 en marino al 7 %. El texto mantiene un contraste ≥ 12:1.

**Tres caminos en columna (y 264–452)**
- Tres círculos de Ø 64 con paso vertical de 62 px y cintura de contacto, como `FLM-Vertical`, con degradado vertical.
- Cada círculo lleva un icono blanco de 28 px: birrete, libro abierto o personas.
- A la derecha (x 96): la palabra en Archivo 700 de 22 px y una sublínea de 13 px.
- Cada fila es un enlace completo de 62 px de alto, con galón ›.

**Resto de la pantalla**
- Frase de apoyo en y 484 (Newsreader cursiva 17 px).
- «Continúa tu formación» en y 528–720, a todo el ancho, con radio de 24 px.
- Barra inferior de pestañas.
- La foto de la recepción aparece justo debajo del pliegue, en el bloque «Vida en FLM».

---

## 11. Momentos firma

### 11.1 Obertura: la marca se vierte en tres caminos

**Disparador:** primera visita a Inicio en la sesión, recordada con un indicador en `sessionStorage` dentro de `try/catch`; si el almacenamiento falla, se trata como ya vista. Se reproduce cuando las fuentes están listas (`document.fonts.ready`, con un máximo de 300 ms de espera). No se reproduce con enlaces directos a otras secciones. Cualquier tecla, clic, toque o desplazamiento la completa al instante.

**Coreografía en escritorio** (ms desde el primer pintado)

| Tiempo | Qué ocurre | Curva |
|---|---|---|
| 0 | Cabecera, saludo, H1, foto y textos ya visibles e interactivos. Los tres círculos extremos de la escalera están en su sitio a escala 0 | — |
| 0–360 | El círculo de **Aprender** aparece (escala 0→1) | Muelle `aparecer` 420/32 |
| 160–520 | El conector 1 forma su cuello (k 0→1): el líquido baja un escalón | 360 ms, `cubic-bezier(0.65,0,0.35,1)` |
| 300–660 | Aparece el círculo de **Consultar** cuando llega el líquido | Muelle `aparecer` |
| 460–820 | Se forma el conector 2 | 360 ms, `--e-verter` |
| 600–960 | Aparece el círculo de **Participar** | Muelle `aparecer` |
| 700 / 780 / 860 → +520 | Cada círculo se **expande en su cápsula** (recorte de Ø 88 a su ancho). El degradado único se revela hacia la derecha: el color fluye de rojo a marino. La palabra pasa de 0 a 1 de opacidad en 200 ms y de anchura 75 a 106 en 360 ms. El remate circular pasa de escala 0,6 a 1 en 200 ms | 520 ms, `cubic-bezier(0.22,1,0.36,1)` |
| 1000–1300 | Los textos de apoyo entran (x −8→0 y opacidad), con 60 ms de escalonado | 240 ms, `--e-entrar` |
| 1000–1600 | Los círculos de Redes suben de opacidad 0 a 0,09 | 600 ms, `--e-entrar` |
| 1150–1500 | Las tarjetas «Hoy» suben (y 16→0, opacidad), con 70 ms de escalonado | 320 ms, `--e-expandir` |

**Duración total:** ≈1,5 s.

**Móvil**
- Columna vertical: los círculos aparecen en 0–320, 120–440 y 240–560 ms (muelle `aparecer`) con su cintura de contacto.
- Las etiquetas entran desde x −12 en 240 ms, con 80 ms de escalonado, desde los 200 ms.
- La tarjeta entra en 600–900 ms. Total ≈0,9 s.

**Movimiento reducido:** composición final desde el primer fotograma. La escalera funciona como un cartel estático; solo hay un fundido de opacidad de 150 ms en el grupo, o ninguno si el ajuste «Reducir movimiento» está activo. Los enlaces y textos son idénticos.

**Por qué se recuerda:** es la variante Diagonal oficial convertida en navegación. Explica en 1,5 s la gramática que usa todo el Campus: la marca no decora la portada, **es** la portada.

### 11.2 El escalón: aprobar es subir un escalón

**Disparador:** el instante en que una formación pasa a **Completada**. Normalmente ocurre al aprobar el test final (≥ 2/3) con la lectura ya terminada. La variante para «Pon a prueba tus conocimientos» se dispara con ≥ 8/10.

**Coreografía**, sobre el glifo de estado F·L·M ampliado a Ø 72 en el centro del resultado

| Tiempo | Qué ocurre | Curva |
|---|---|---|
| 0 | `aria-live` anuncia «Test aprobado: 2 de 3 respuestas correctas. Formación completada.» y el foco pasa al título «Has aprobado» | — |
| 0–380 | Los puntos de las preguntas acertadas viajan al círculo **L** y se funden en él: tus respuestas llenan el vaso del test. Los fallos quedan como anillo abierto en su fila | 300 ms cada uno, `cubic-bezier(0.55,0,1,0.45)`, 60 ms de escalonado |
| 300–700 | El nivel de **L** sube hasta lleno («Test aprobado») | 400 ms, `cubic-bezier(0.33,0,0.2,1)` |
| 700–1120 | **M sube un escalón** (−0,969 D en vertical). La cintura L–M se suelta y se forma el conector oficial (k 0→1, reflejado como H-Arriba). M se llena de marino mientras sube | Muelle `escalon` 300/26 (rebote ≈3 %) |
| 1120–1560 | M se **expande en cápsula**: «Formación completada» (Archivo 600, 18 px, blanco sobre marino, 15:1), con un círculo de verificación al final | 440 ms, `--e-expandir`; verificación 200 ms |
| 1400–1700 | Aparecen el detalle y las acciones: «2 de 3 correctas · Aprobado (mínimo 2)», «Revisar respuestas», «Siguiente formación» | 280 ms, `--e-entrar` |

- **Si completa el área (tres de tres):** el texto de la cápsula cambia a «Fiscal: 3 de 3 formaciones completadas» y aparece la insignia de área en Perfil (fundido de 240 ms). No hay confeti.
- **Sin aprobar:** no hay escalón. L sube solo hasta la mitad («Test intentado», 300 ms). El mensaje dice: «Te ha faltado una. Revisa la explicación y vuelve a intentarlo cuando quieras.» Hay un botón «Volver a intentarlo». No hay sacudidas ni destellos rojos.

**Movimiento reducido:** estado final inmediato, con M ya elevada y la cápsula «Formación completada». La composición estática H-Arriba sigue diciendo «has subido un escalón». Mismo anuncio y mismos textos; cambio con fundido de 120 ms.

**Por qué se recuerda:** la recompensa es la propia marca. «Apostamos por tu formación y tu crecimiento» se convierte en un gesto que se reconoce en el logotipo de cada día.

---

## 12. Microinteracciones

1. **La gota de navegación (tocar + expandir).**
   - El indicador activo es un círculo de 6 px bajo la sección. Al cambiar de sección viaja con el muelle `contacto` (≈200 ms) y se estira como una gota (escala X 1→1,8→1) antes de asentarse.
   - En móvil hace lo mismo el círculo de 40 px de la pestaña activa.
   - Con movimiento reducido aparece directamente en su sitio.
2. **Buscar que se expande.**
   - El botón circular de 40 px se convierte en una cápsula de 360 px (260 ms, `--e-expandir`). Se abre con «/» y el texto de ayuda entra con anchura 75→100.
   - Escape lo recoge (200 ms, `--e-recoger`) y devuelve el foco al botón.
   - Los resultados se agrupan por tipo, con glifo de área.
3. **Chips de área posicionales hacia el logotipo de departamento.**
   - Al seleccionar un chip, su punto se convierte en cápsula (180 ms).
   - Al entrar en el área, la cápsula viaja a la cabecera (`layoutId`, muelle `capsula`) con el color de la meseta del área. El color viaja siempre por la rampa oficial.
   - Al llegar se funde en 120 ms con el PNG oficial de Fiscal, Laboral o Mercantil. Contable aterriza en su glifo «suma».
   - Funciona con flechas y Enter, con `aria-pressed`.
4. **Lectura como nivel.**
   - Un vaso de 32 px en la barra fija se llena con el avance de lectura: línea de nivel plana, sin olas, ligada al desplazamiento.
   - La columna de módulos (gramática Vertical) llena cada círculo al terminar el módulo (380 ms, `--e-nivel`).
   - Con movimiento reducido el nivel cambia sin interpolación.
5. **Términos clave en cápsula.**
   - El término resaltado (cápsula con tinte burdeos al 8 %) se expande en una ficha de definición anclada (340 ms, muelle `capsula`).
   - Se abre con clic, toque, Enter o Espacio y se cierra con Escape o tocando fuera; nunca depende del hover.
   - Con movimiento reducido aparece con un fundido de 120 ms.
6. **Responder y comprobar.**
   - Al elegir una opción, su círculo se llena desde el centro (160 ms).
   - «Comprobar» convierte el círculo en la cápsula «Correcta», o deja un anillo abierto con «No es correcta» y marca la opción buena como «Respuesta correcta».
   - La explicación se despliega en 280 ms, el foco va a su título y `aria-live` lo anuncia. Nunca hay sacudidas.
7. **Ejemplo práctico paso a paso (gramática Diagonal).**
   - Cada paso de un cálculo es un círculo. «Siguiente paso» o la flecha derecha vierten el conector hasta el siguiente (360 ms, `--e-verter`), y ese paso se expande en cápsula con su cifra.
   - «Ver todo» muestra la escalera completa. Con movimiento reducido, escalera completa y estática.
8. **Evento que se abre y fecha que se cierra.**
   - La cápsula del evento (icono en círculo, título y fecha) crece hasta panel: radio de 999 a 28 px en 340 ms, con el icono anclado por `layoutId`.
   - «Fecha por confirmar» es un anillo discontinuo. Cuando Gestión confirma la fecha, el trazo se cierra (400 ms).
   - Escape cierra el panel y devuelve el foco.
9. **Calendario superpuesto.**
   - El cambio de mes desliza la rejilla 24 px en el sentido del recorrido, con fundido (220 ms).
   - Un día con varias entradas muestra círculos translúcidos superpuestos que, al seleccionarlo, se separan en una cápsula con la lista (260 ms).
   - El aniversario dibuja su anillo completo en 600 ms («una vuelta más»).
   - Teclado: flechas para los días; RePág y AvPág para los meses.
10. **Estantería de lecturas.**
    - Cada libro es un lomo tipográfico (Archivo con anchura 62) con la banda de color de su área, como los tomos de la biblioteca del despacho.
    - Al activarlo, el lomo sube 12 px y se expande en ficha (340 ms, muelle `capsula`).
    - Siempre hay alternativa «Ver como lista».
11. **Guardar, enviar, publicar, archivar.**

    | Acción | Respuesta visual | Tiempo y curva |
    |---|---|---|
    | Guardar | Rótulo «Guardado · 10:42» con un pulso de contacto único (anillo de escala 1→1,15 y opacidad 0,6→0) | 120 ms |
    | Enviar a revisión | El conector se vierte al siguiente estado | 360 ms |
    | Publicar o restaurar | Sube un escalón (H-Arriba) | Muelle `escalon` |
    | Archivar | Baja un escalón (H-Abajo) | — |
    | Error al guardar | El conector se retrae y aparece «No se ha podido guardar. Tus cambios siguen aquí.» | 240 ms |

12. **Pulsación y foco.**
    - Toda cápsula se comprime al pulsarla (escala 0,98 × 0,96, 120 ms) y recupera su forma con un muelle 600/30, como un líquido contenido.
    - El foco visible es un doble anillo (2 px marino + 2 px blanco, separado 3 px) que sigue la forma de la cápsula.
    - Con movimiento reducido no hay compresión, pero el foco se mantiene igual.

---

## 13. Tratamiento de contenidos

### Formación

**Portada tipográfica, sin foto de stock**
- Numeral grande de Newsreader (01, 02, 03) dentro de un círculo, glifo de área, título y una introducción práctica de dos líneas.
- Una sola línea de metadatos sin repeticiones: «8 min de lectura · Actualizada el 20 oct 2026». La fecha de publicación solo se muestra si difiere.
- Autor con foto en círculo o iniciales, nombre y cargo.

**Cuerpo**
- «Al terminar sabrás…» con dos o tres resultados como círculos tangentes.
- Módulos cortos en la columna de 680 px, con la lista vertical de módulos en el margen y el vaso de lectura arriba.
- Términos clave en cápsula y ejemplo práctico animado (gramática Diagonal).
- Gráficos de cápsulas cuando ayudan a entender un dato.
- «La clave» en un panel burdeos, como la libreta, con Newsreader cursiva.
- Fuentes citadas al pie y la cápsula «Hacer el test» con remate circular.
- El glifo F·L·M muestra siempre el estado con su texto.

### Test

- **Una pregunta por pantalla**, con tres puntos tangentes de progreso.
- **Pregunta** en Newsreader de 24 px.
- **Opciones** como cápsulas de al menos 56 px de alto con su círculo de selección.
- **«Comprobar»** da respuesta inmediata con el porqué, tanto si aciertas como si fallas, y muestra la correcta.
- **Resultado:** aprobado con 2/3 → «El escalón»; si no, «Test intentado» y «Volver a intentarlo». Las opciones se barajan y se conserva el historial de intentos en Perfil.
- **«Pon a prueba tus conocimientos»:** diez preguntas con progreso en hilera de diez círculos (dos filas de cinco en móvil). Aprobado con 8/10 y la misma gramática.

### Actualidad en tu sector

- **Plantilla de cinco bloques** como una columna de cinco círculos tangentes que se llenan al leer:
  1. «La novedad, en una frase» (Newsreader 28 px, el titular)
  2. «A quién afecta» (chips de tipos de cliente o expediente)
  3. «Qué debemos hacer» (lista de comprobación en cápsulas, como el checklist de LinkedIn)
  4. «Un ejemplo sencillo» (recuadro de ejemplo)
  5. «Fuente y fecha» (enlace a la fuente oficial con su fecha)
- **Tipo de pieza** con icono y texto: Legislación, Jurisprudencia, Criterio administrativo o Aviso interno.
- **En el listado** solo se ven el bloque 1, el tipo, el área, la fecha y la lectura estimada.

### Notas informativas

- **Rejilla de documentos:** vista previa de la primera página del PDF (generada en la compilación) con un círculo superpuesto que lleva el glifo de área. Debajo, título, fecha, páginas y tamaño.
- **Acciones:** «Abrir» en cápsula y «Descargar (PDF, 240 KB)» con un nombre accesible completo.
- **Búsqueda y filtros:** campo de búsqueda en cápsula y chips posicionales.
- **Versiones:** se muestran como hojas superpuestas; la nueva tapa a la anterior, que pasa a «Versión anterior».
- **Estado vacío:** «No hemos encontrado notas con «IVA franquiciado». Prueba con menos palabras o quita el filtro Fiscal.»

### Lecturas recomendadas

- **La estantería:** cuatro baldas, una por área, con tres lomos tipográficos en cada una.
- **Ficha al abrir un lomo:** título y autor, edición, resumen, valor práctico, a quién va dirigido y enlace de referencia identificado como externo.
- **En móvil:** balda horizontal con desplazamiento magnético y ficha en hoja inferior. Siempre hay vista de lista.

### Eventos y comunicados

**Estructura**
- Control segmentado «Actuales y próximos | Histórico».
- **Río de eventos:** una línea líquida vertical con el marcador «Hoy» tangente. Los próximos van en orden de fecha; los que no tienen fecha se agrupan en «Fecha por confirmar», con anillo discontinuo.

**Cada entrada**
- Una cápsula con el icono del conjunto curado (estrella, trofeo, taza de café, calendario, birrete, megáfono), título, fecha o «Fecha por confirmar», estado (Próximo, En curso, Celebrado) y una acción («Añadir a mi calendario», «Ver material»).
- Los eventos de varias sesiones muestran una cadena de círculos, uno por sesión. Pasan a Histórico tras la última sesión, con hora de Europe/Madrid.

**Casos concretos**
- El Desayuno Mercantil aparece en Histórico con su foto real, su resumen y el material descargable.
- El Desayuno Fiscal aparece como pendiente de fecha.
- «Archivado» solo se ve en Gestión.

### Calendario

| Categoría | Forma | Icono |
|---|---|---|
| Cumpleaños | Círculo rojo lleno | Tarta |
| Aniversario FLM | Anillo burdeos («una vuelta completa»), generado desde la fecha de alta | Trofeo |
| Encuentro de equipo | Cápsula marina que abarca los días | Personas |
| Festivo | Día con trama neutra | Siempre con la etiqueta «Festivo» y solo con fechas verificadas |

- **Navegación:** «‹ octubre 2026 ›» y «Hoy».
- **Día seleccionado:** se abre en un panel lateral en escritorio y en una hoja inferior en móvil.
- **Móvil:** por defecto, lista de agenda con una tira semanal de siete círculos.
- **Privacidad:** los cumpleaños muestran solo día y mes.

### Perfil

- **Cabecera:**
  - Foto o iniciales en círculo, nombre (Newsreader 40), cargo, glifo de departamento y correo @flmexperts.com.
  - Anillo de antigüedad («En FLM desde marzo de 2019»).
- **«Tu recorrido»:** cuatro filas de área, con tres glifos F·L·M por fila más la evaluación sectorial, y una leyenda «Cómo leer tu progreso».
- **Formación:** formaciones obligatorias pendientes con su fecha límite e historial de tests (fecha, resultado, intento).
- **Reconocimientos:** anillos de antigüedad (1, 3, 5, 10 años), cápsulas de área completada y contribuciones publicadas citadas por título y fecha.
- **Ajustes:** «Reducir movimiento», notificaciones y Cerrar sesión.

### Gestión

- **Espacio único:**
  - Lista por tipo de contenido, con filtro de estado en forma de cadena de círculos.
  - «Crear» con seis plantillas (Formación, Test, Actualidad de cinco bloques, Documento, Evento y Comunicado).
  - Editor en formulario por secciones numeradas, con vista previa en vivo.
- **Estados como escalera:** Borrador → En revisión → Publicado, en fila. Archivado está un escalón por debajo (H-Abajo) y Restaurar lo devuelve arriba (H-Arriba).
- **Roles:** el rol Autor envía a revisión; Administración publica o devuelve con comentario.
- **Protección del trabajo:** autoguardado con rótulo de hora y aviso antes de salir: «Tienes cambios sin guardar. ¿Quieres salir igualmente?»
- **Administración:** activar y desactivar cuentas, revocar sesiones e informes restringidos (obligatorias completadas, errores frecuentes).
- **Demostración:** todo con datos de demostración y la franja «Funciones simuladas en la demostración».

### Participar: propuestas

- **Superposición de Redes:** tarjetas para apoyar el LinkedIn de FLM Soluciones legales, invitar a una reseña voluntaria y auténtica, proponer un tema de formación o una mejora de procesos (barcelona@flmexperts.com) y participar en vídeos (comunicacion@flmexperts.com).
- **Prioridad visual:** siempre por debajo de Aprender y Consultar.

### Mensajes de error y estados vacíos (muestra de tono)

- «Este archivo no es un PDF. Sube la nota en PDF (máximo 20 MB).»
- «Tu sesión ha caducado. Vuelve a entrar: tu borrador está guardado.»
- «No tienes permiso para publicar. Puedes enviarlo a revisión.»
- «Sin conexión. Lo intentaremos de nuevo en cuanto vuelva.»
- «Esta página no existe o se ha movido.»

---

## 14. Accesibilidad (WCAG 2.2 AA) y movimiento reducido

- **Contraste:** aplicado según la tabla 6.2. Los bordes de controles cumplen ≥ 3:1 y el foco es visible con doble anillo.
- **Objetivos táctiles:** ≥ 44 × 44 px (la norma pide 24).
- **Arrastre:** ninguna función depende solo de arrastrar (2.5.7); hay botones para meses y hojas.
- **Hover:** no hay contenido que dependa de él.
- **Semántica:**
  - `lang="es-ES"`, puntos de referencia y títulos jerárquicos.
  - Los SVG decorativos llevan `aria-hidden`.
  - El significado lo dan textos y formas, nunca solo el color.
- **Anuncios y foco:** `aria-live` para resultados, guardado y errores. El foco se gestiona en cambios de página, paneles y hojas.
- **Movimiento reducido:**
  - Se respeta la preferencia del sistema y además existe el ajuste propio «Reducir movimiento».
  - No hay escalados, desplazamientos, parallax ni formación de cuellos.
  - Quedan fundidos de ≤ 150 ms o cambios instantáneos.
  - Cada estado final se ha diseñado primero como composición estática comprensible.
- **Pausa:** ningún movimiento automático dura más de 5 s (2.2.2).

---

## 15. Por qué supera claramente la versión anterior

| Versión anterior | Vasos comunicantes |
|---|---|
| «FLM University», barra marina genérica | «FLM Campus» sobre papel cálido, con la marca en su sitio |
| Logotipo recoloreado (círculos blancos con letras de color sobre marino) | Archivos originales sin alterar; cada variante oficial con un significado |
| Titular propio («Aprende hoy. Aplícalo cada día.») | Mensaje base de la clienta y escalera de tres caminos derivada de la Diagonal |
| Pestañas de texto por área | Glifos posicionales y transición que aterriza en el logotipo de departamento |
| Tarjetas con fotos de stock | Portadas tipográficas con numeral; fotos reales en color y stock en duotono |
| Fechas en «hoja de calendario» | Río de eventos con anillos de fecha pendiente y paso a Histórico |
| Retrato de un socio como «responsable de ejemplo» | Autoría solo real y consentida |
| Sin lenguaje de movimiento | Una física de marca: tocar, expandir, conectar, superponer |

---

## 16. Riesgos y decisiones pendientes con FLM

1. **Formas en movimiento:** las formas geométricas que sustituyen al logotipo durante las transiciones (sin letras, menos de 0,5 s) necesitan la aprobación de FLM. Pedir los originales vectoriales (SVG, AI o PDF) de todas las variantes para evitar el escalado de PNG.
2. **Rojo oficial:** con texto blanco pequeño da 4,34:1. Se limita a texto grande y gráficos, y se usa el tono funcional `#D32E25` (rojo + vino oficiales) solo para texto pequeño. FLM debe validarlo.
3. **Sin colores semánticos nuevos (verde, ámbar):** hay que probar con usuarios que «Aprobado» y los errores se entienden con forma y texto.
4. **Contable sin letra:** el glifo «suma» y la rampa completa como color de área son pictogramas de interfaz. No se crea un logotipo «CONTABLE»; confirmar si existe uno oficial.
5. **Dos logotipos conviven:** el lineal de la señalética, el roll-up y la libreta, y el de círculos. Confirmar cuál está vigente; el Campus usa solo los archivos de círculos facilitados.
6. **Demostración pública en GitHub Pages:** el socio, los asistentes al Desayuno Mercantil y las personas de la recepción necesitan consentimiento escrito, o hay que excluir o difuminar esas fotos en la versión pública.
7. **Imágenes de origen dudoso:** el icono del buzón es de stock y queda fuera de la paleta (proponemos redibujarlo como pictograma del sistema). La foto del restaurante es de terceros: no se usa sin licencia ni confirmación de que fuera el lugar de un evento.
8. **Fatiga en una herramienta diaria:** la Obertura solo una vez por sesión, duraciones cortas y ajuste para reducir movimiento. Validarlo con cinco empleados.
9. **Navegación con verbos** (Aprender, Consultar, Participar) en lugar de sustantivos: validarla con una prueba rápida de árbol de navegación con cinco empleados («¿Dónde buscarías el próximo desayuno?»).
10. **Rendimiento en móviles modestos:** SVG, fuentes variables y Motion. Mitigación: solo transformaciones, LazyMotion, subsetting y presupuestos de 170 KB de JS y 260 KB de fuentes.
11. **Desviación respecto a la geometría oficial durante el desarrollo:** un módulo único `geometria.ts` y pruebas visuales que superpongan el último fotograma sobre los PNG oficiales.
12. **Componentes poco habituales** (lomos rotados, glifo F·L·M): alternativas de lista, etiquetas de texto obligatorias y pruebas con lector de pantalla.
13. **Contenido sin inventar:** autores «pendiente de asignar» hasta su confirmación, fechas «por confirmar», ninguna estadística del despacho y datos de demostración rotulados.
14. **Rutas en GitHub Pages:** usar enrutado con almohadilla, o copiar `index.html` como `404.html`, para que funcionen los enlaces directos a secciones.

---

## Anexo A. Código de referencia

```ts
// src/marca/geometria.ts
// Medidas tomadas de FLM-Horizontal.png y FLM-Diagonal.png (R = 223,5 px).
export const PASO = 0.969;                   // distancia entre centros / diámetro (433 / 447)
export const FILETE = 0.62;                  // radio de los filetes del conector / R
export const RECTO = 2 * PASO - 1 - FILETE;  // tramos rectos / R (≈ 0,318)

/**
 * Conector líquido oficial entre el círculo A (centro cx, cy, radio r) y el
 * círculo B, situado un paso abajo-derecha (variante Diagonal / H-Abajo).
 * Para el escalón hacia arriba (H-Arriba), reflejar con scale(1,-1) respecto a A.
 * Se dibuja junto con ambos círculos y con el mismo degradado (userSpaceOnUse).
 */
export function conectorDiagonal(cx: number, cy: number, r: number): string {
  const p = 2 * PASO * r, f = FILETE * r, s = RECTO * r;
  const bx = cx + p, by = cy + p;
  return [
    `M ${cx + r} ${cy}`,                               // punto derecho de A
    `L ${cx + r} ${cy + s}`,                           // tramo recto
    `A ${f} ${f} 0 0 0 ${cx + r + f} ${cy + s + f}`,   // filete cóncavo
    `L ${bx} ${by - r}`,                               // tramo recto hasta la cima de B
    `A ${r} ${r} 0 0 0 ${bx - r} ${by}`,               // cuarto superior izquierdo de B
    `L ${bx - r} ${by - s}`,                           // tramo recto
    `A ${f} ${f} 0 0 0 ${bx - r - f} ${by - s - f}`,   // filete cóncavo opuesto
    `L ${cx} ${cy + r}`,                               // tramo recto hasta la base de A
    `A ${r} ${r} 0 0 0 ${cx + r} ${cy}`,               // cuarto inferior derecho de A
    "Z",
  ].join(" ");
}
```

```tsx
// src/marca/Conector.tsx — el cuello se forma con un escalado perpendicular al eje A→B.
import { useEffect, useRef } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { conectorDiagonal, PASO } from "./geometria";

type Props = { cx: number; cy: number; r: number; visible: boolean; reducido: boolean; relleno: string };

export function Conector({ cx, cy, r, visible, reducido, relleno }: Props) {
  const ref = useRef<SVGPathElement>(null);
  const k = useMotionValue(visible ? 1 : 0);          // 0 = sin cuello · 1 = geometría oficial
  const mx = cx + PASO * r, my = cy + PASO * r;        // punto medio entre centros
  const transformar = (v: number) =>
    `translate(${mx} ${my}) rotate(45) scale(1 ${v}) rotate(-45) translate(${-mx} ${-my})`;

  useMotionValueEvent(k, "change", (v) => ref.current?.setAttribute("transform", transformar(v)));
  useEffect(() => {
    if (reducido) { k.set(visible ? 1 : 0); return; }
    const control = animate(k, visible ? 1 : 0, { duration: 0.36, ease: [0.65, 0, 0.35, 1] });
    return () => control.stop();
  }, [visible, reducido, k]);

  return <path ref={ref} d={conectorDiagonal(cx, cy, r)} fill={relleno}
               transform={transformar(k.get())} aria-hidden="true" />;
}
```

```tsx
// src/main.tsx — movimiento: preferencia del sistema + ajuste propio del Campus.
<MotionConfig reducedMotion={ajustes.reducirMovimiento ? "always" : "user"}>
  <LazyMotion features={domMax} strict>
    <App />
  </LazyMotion>
</MotionConfig>
```

```ts
// Obertura: una vez por sesión; si el almacenamiento falla, no se reproduce.
export function oberturaPendiente(): boolean {
  try {
    if (sessionStorage.getItem("flm-obertura") === "1") return false;
    sessionStorage.setItem("flm-obertura", "1");
    return true;
  } catch {
    return false;
  }
}
```

## Anexo B. Recursos revisados

**Brief y versión anterior**
- `C:\Users\usuario\Downloads\FLM_Campus_Design_Development_Brief_EN.md`
- Versión anterior: `preview-portada.png`, `preview-formacion.png` y `preview-eventos.png`, en `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\`

**Identidad, en `...\FLM UNIVERSITY\recursos\identidad-flm\`**
- Las 11 variantes de logotipo y las 2 firmas con Crowe.
- Fotos de la recepción, las bibliotecas, el edificio y la fachada, la libreta, el socio fiscal, el Desayuno Mercantil y la imagen del restaurante.

**Otros recursos**
- Buzón: `...\FLM UNIVERSITY\FOTOS FLM RECURSOS\BUZON SUGERENCIAS FOTO.jpg`
- Comunicación en LinkedIn: `C:\Users\usuario\Documents\FLM CAMPUS\research\downloads\02-redes-crowe\linkedin-img\` (portada y publicaciones p05, p06, p07 y p08).

**Comprobaciones realizadas**
- Mediciones de color y geometría con muestreo de píxeles sobre los PNG originales.
- Contrastes calculados con la fórmula de luminancia relativa de WCAG 2.x.
- Ejes de Archivo y Newsreader comprobados contra la API de Google Fonts.

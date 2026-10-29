# 03 · Sistema de diseño de FLM Campus

> Fuente de verdad en código: `apps/web/src/styles/tokens.css` (tokens), `apps/web/src/styles/layout.css` (composición y utilidades), `apps/web/src/design/` (componentes), `apps/web/src/motion/` (movimiento de marca) y `apps/web/src/layout/Logo.tsx` (logotipos oficiales).
> Especificación de construcción: [`docs/diseno/especificacion.md`](diseno/especificacion.md). Demostración viva: página **Sobre el campus › Sistema de diseño** (`/#/sobre#sistema`).

## 1. Principios

1. **La marca no se toca; se usa.** Logotipos originales en PNG/WebP con transparencia, sin recolorear ni recomponer. En modo oscuro, sobre placa clara.
2. **Coherencia antes que creatividad puntual.** Toda pantalla se construye con estos tokens y componentes; si falta algo, se amplía el sistema, no se improvisa.
3. **Gramática de formas con significado**: círculo = persona o estado · cápsula = acción, etiqueta, lugar o momento · puente líquido = conexión creada por una acción · rectángulo de radio pequeño = documento o archivo.
4. **El color nunca va solo** y **el rojo se mira, no se lee** (texto rojo pequeño en `--flm-rojo-oscuro`).
5. **Movimiento con significado, breve y opcional**: respeta `prefers-reduced-motion` y el ajuste propio del campus.

## 2. Tokens

### 2.1 Color de marca (verificado)

| Token | Valor | Origen | Uso |
|---|---|---|---|
| `--flm-rojo` | `#E53327` | Logotipo oficial (muestreo de píxel) | Puntos, trazos, gráficos, Fiscal, texto ≥ 24 px |
| `--flm-rojo-web` | `#E22F29` | `variables.css` de flmexperts.com | Referencia (no se usa en texto) |
| `--flm-rojo-oscuro` | `#90101A` | `variables.css` | Texto rojo pequeño, avisos, botón de peligro |
| `--flm-burdeos` | `#84343D` | Cápsula oficial «LABORAL» | Área Laboral, aniversarios |
| `--flm-marino` | `#172641` | Logotipo y web | Tinta principal, acción principal, Mercantil |
| `--flm-azul` | `#1F2F4A` | `variables.css` | Estado *hover* de la acción principal |
| `--flm-negro` | `#081225` | `variables.css` | Fondo del modo oscuro |
| `--flm-crema` | `#EFEBE4` | `variables.css` | Superficies hundidas |
| `--flm-gris` | `#4F5661` | `variables.css` | Texto secundario |
| `--flm-rojo-vivo`, `--flm-vino`, `--flm-azul-profundo`, `--flm-noche` | `#FD1910`, `#6C131C`, `#002149`, `#151024` | Pieza oficial de redes | Antetítulos (vino), atmósfera de acceso |
| `--flm-gradient` | rojo → `#B8302D` → `#792C35` → `#3F293C` → marino | Muestreo del degradado del logotipo | Trazos, anillos, conectores (≤ 2–3 % de la pantalla) |

### 2.2 Color semántico (tema claro / oscuro)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--paper` | `#F8F6F2` | `#081225` | Fondo general |
| `--surface` / `--surface-2` | `#FFFFFF` / `#FBFAF7` | `#0E1A31` / `#12203A` | Tarjetas y capas |
| `--surface-sunken` | crema | `#0B1529` | Zonas hundidas |
| `--ink` / `--ink-2` / `--ink-3` | marino / gris / `#5C636E` | `#F3EFE8` / `#B7BCC6` / `#8F96A3` | Texto (`--ink-3` ≥ 4,5:1 también sobre la crema) |
| `--line` / `--line-strong` | marino 12 % / 24 % | crema 12 % / 24 % | Bordes y separadores |
| `--accent-text` | rojo oscuro | `#FF8A7F` | Texto de acento pequeño |
| `--success`, `--warning`, `--danger` (+ `-soft`) | verdes, ámbar, rojo oscuro | tintes claros | Estados |
| `--ring-1` / `--ring-2` / `--ring-3` | `#E53327` / `#792C35` / `#172641` | `#F0493D` / `#C9707A` / `#8FA3C7` | Paradas del degradado en trazos SVG (`ProgressRing`, «El escalón»). En oscuro se aclaran porque el burdeos y el marino desaparecen sobre el fondo marino. Algunas vistas (consultas, noticia) los redefinen localmente con cinco paradas para sus anillos de etapa |

Contrastes clave (WCAG 2.2): marino sobre papel ≈ 13,8:1 · gris sobre papel ≈ 7:1 · rojo oscuro sobre papel ≈ 8,4:1 · blanco sobre marino ≈ 15,1:1 · rojo FLM sobre blanco 4,3:1 (solo texto grande o gráficos).

### 2.3 Áreas y calendario

| Área | Token | Color | Fundamento |
|---|---|---|---|
| Fiscal | `--area-fiscal` | rojo | Meseta de la cápsula FISCAL |
| Laboral | `--area-laboral` | burdeos | Meseta de la cápsula LABORAL |
| Mercantil | `--area-mercantil` | marino | Meseta de la cápsula MERCANTIL |
| Contable | `--area-contable` + `--area-contable-fill` | marino + degradado completo | «La suma de las tres»: no tiene letra ni cápsula propia |

Uso: `data-area="fiscal|laboral|mercantil|contable"` expone `--area` (color plano) y `--area-fill` (relleno). Calendario: `--cal-cumpleanos` (rojo), `--cal-aniversario` (burdeos), `--cal-encuentro` (marino), `--cal-festivo` (gris), siempre con icono y texto.

### 2.4 Tipografía

| Rol | Familia | Licencia | Notas |
|---|---|---|---|
| Titulares y lectura | **Newsreader** variable (`opsz` 6–72) | SIL OFL 1.1 | Titulares opsz 72 peso 370–440; lectura opsz 16–18, 20/32 |
| Interfaz y datos | **Inter** variable (`opsz`) | SIL OFL 1.1 | Tipografía de flmexperts.com; cifras tabulares |
| Destacado «Explicamos» | **Belleza** | SIL OFL 1.1 | Tipografía de destacados de la web; uso restringido |

Escala fluida: `--text-xs` 12 · `--text-sm` 14 · `--text-md` 16 · `--text-lg` 18 · `--text-xl` 20 · `--text-2xl` 22–26 · `--text-3xl` 26–36 · `--text-4xl` 32–52 · `--text-5xl` 40–76 · `--text-6xl` 46–108 · `--text-reading` 17–19. Interlineados: 1,04 (display) · 1,2 · 1,5 · 1,62 (lectura). Todas autoalojadas (sin peticiones a Google Fonts) con `font-display: swap` y subconjuntos por `unicode-range`.

### 2.5 Espacio, radios, sombras y capas

- Espaciado base 4 px: `--space-1` (4) … `--space-24` (96); `--section-gap` 56–120 px; `--gutter` 16–40 px; contenido máx. `82rem`; lectura máx. `42rem` (≈ 66 caracteres).
- Radios: `--radius-xs` 6 · `sm` 10 · `md` 14 · `lg` 20 · `xl` 28 · `2xl` 40 · `pill` 999 (cápsulas).
- Sombras: `--shadow-1` (sutil), `--shadow-2` (elevación al pasar), `--shadow-3` (capas flotantes). Profundidad en reposo mediante bordes, no sombras.
- Capas: navegación 40 · superposiciones 60 · avisos 80 · enlace de salto 100.

### 2.6 Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--dur-instant` | 90 ms | Cambios de color |
| `--dur-quick` | 160 ms | Hover, pulsación |
| `--dur-base` | 260 ms | Paneles, pestañas |
| `--dur-slow` | 420 ms | Entradas de contenido |
| `--dur-signature` | 900 ms | Fragmentos de momentos firma (≤ 1,5 s en total) |
| `--ease-standard` | `cubic-bezier(0.2,0,0,1)` | General |
| `--ease-enter` / `--ease-exit` | `(0.05,0.7,0.1,1)` / `(0.3,0,0.8,0.15)` | Entradas / salidas |
| Muelles (Motion) | 460–520 de rigidez, 34–36 de amortiguación | Cápsulas que viajan (`layoutId`) |

Movimiento reducido: `MotionConfig reducedMotion` global + `useReducedMotionPref()` (sistema o ajuste del campus) + reglas CSS que anulan transiciones. Toda secuencia tiene un estado final estático equivalente.

## 3. Componentes

### Button · ButtonLink · IconButton · ActionButton

| Variante | Cuándo |
|---|---|
| `primary` | Acción principal de la pantalla (marino, texto blanco) |
| `secondary` | Acción secundaria (borde) |
| `soft` / `ghost` | Acciones terciarias y de barra |
| `danger` | Acciones destructivas (rojo oscuro, 9:1) |
| `inverse` | Sobre fondos oscuros |

Tamaños `sm` (36 px; 44 px en táctil), `md` (44), `lg` (54). Estados: reposo, *hover*, pulsado (escala 0,97), foco (doble anillo), deshabilitado (50 %). `ActionButton` añade `status: idle | pending | success | error`: la cápsula se contrae alrededor del indicador mientras trabaja y vuelve a abrirse con la confirmación (`aria-live`, `aria-busy`). `IconButton` exige `label` (nombre accesible y *tooltip* nativo).

| ✅ Hacer | ❌ Evitar |
|---|---|
| Un solo `primary` por bloque | Botones rojos con texto blanco normal |
| Verbos claros: «Enviar a revisión» | «Aceptar», «OK» sin contexto |

### Chip · AreaTag · EditorialChip · LearningChip · PhaseChip
Cápsulas de estado con icono y texto. `AreaTag` muestra punto de color + nombre del área. Estados editoriales: Borrador, En revisión, Publicado, Archivado. Estados de aprendizaje: Sin empezar, Formación leída, Test intentado, Test superado, Completada. Fases de evento: En curso, Próximo, Histórico, Archivado y «Fecha por confirmar».

### StatusGlyph
Círculo de dos mitades: izquierda lectura, derecha test (trama si intentado, llena si superado); completo con marca = completada. Siempre con etiqueta de texto (`withLabel`). Rol: imagen decorativa con el texto visible al lado.

### Avatar
Círculo con fotografía aportada o iniciales de dos letras (nunca fotos inventadas). Tonos de marca deterministas por nombre. `decorative` cuando el nombre ya está escrito al lado.

### ProgressRing
Anillo con el degradado oficial (tokens `--ring-*`, aclarados en tema oscuro); `aria-label` «Formaciones completadas: 2 de 12». Animación de trazo con movimiento reducido respetado.

### Picture
Fotografías reales en AVIF/WebP con `srcset`, dimensiones explícitas (sin saltos de diseño) y marcador difuminado (LQIP). `decorative` cuando el texto ya lo explica.

### Dialog (centrado y panel lateral)
`<dialog>` nativo: capa superior, fondo inerte, foco atrapado, Esc para cerrar y retorno del foco. `variant="sheet"` = panel lateral en escritorio y hoja inferior en móvil. `dismissable={false}` para proteger cambios sin guardar.

### Toast
Región `aria-live="polite"`; se pausa con el puntero o el foco; acción opcional («Deshacer», «Reintentar»). API: `toast.success|error|info(título, descripción?, acción?)`.

### Campos: TextField · TextArea · SelectField · Checkbox · Switch
Etiqueta siempre visible, ayuda (`aria-describedby`), error con icono y `role="alert"`, contador en áreas de texto, altura mínima 48 px, `Switch` con `role="switch"`. Los obligatorios llevan `required` (lo anuncia el lector de pantalla) y un asterisco decorativo; todo formulario con más de un campo explica el asterisco al principio («Los campos marcados con * son obligatorios»).

### Tabs
Patrón ARIA *tabs* con tabindex itinerante, flechas, Inicio y Fin. La cápsula activa se desliza (`layoutId`).

### Popover
Panel desplegable (patrón *disclosure*): Esc y clic fuera lo cierran; el foco entra y vuelve al botón.

### PageHeader
Migas («Estás en»), antetítulo, titular en Newsreader, entradilla en itálica y acciones. Una por página principal.

### EmptyState · Notice · Skeleton · Kbd
Estados vacíos y de error con explicación y salida; avisos en línea (info, atención, peligro, éxito); esqueletos con la forma real; teclas.

### Logo
Logotipos originales: `horizontal`, `crowe` (con «A business associate of Crowe Global»), `croweVertical`, `diagonal`, `vertical`, `fiscal`, `laboral`, `mercantil`. Placa clara automática en modo oscuro.

### Movimiento de marca: `bridgePath` y `Escalon`
`bridgePath(c1, r1, c2, r2, spread)` dibuja el puente líquido entre dos círculos (inspirado en la versión diagonal del logotipo). `Escalon` es el momento firma de formación completada: los círculos se llenan, se conectan, el último sube un peldaño y se abre en la cápsula «Formación completada»; con movimiento reducido muestra el estado final.

## 4. Patrones

- **Navegación**: cabecera fija (Inicio · Aprender · Consultar · Participar) con punto rojo que viaja; barra inferior en móvil con círculo activo; búsqueda global Ctrl/⌘ K y «/» (desactivable); migas en páginas interiores.
- **Lectura**: columna de 66 caracteres, índice fijo, términos clave al margen, «Explicamos», ejemplos paso a paso, idea clave con punto rojo, fuentes.
- **Evaluación**: una pregunta por pantalla, corrección al margen firmada, resultado con cifra grande, «El escalón» al completar.
- **Datos**: tarjetas con enlace que cubre la tarjeta (un solo enlace con nombre claro), tablas con columnas numéricas tabulares, filtros reflejados en la URL.
- **Retroalimentación**: guardado con `ActionButton` + *toast*; errores con qué ha pasado y qué hacer; aviso de conexión; demo con banda identificativa.

## 5. Accesibilidad del sistema

Objetivo WCAG 2.2 AA: foco visible de doble anillo (2.4.7, 2.4.11), `scroll-padding-top` bajo la cabecera fija, objetivos ≥ 44 px (2.5.8), sin dependencia del *hover*, atajos de una tecla desactivables (2.1.4), idioma `es-ES`, regiones `aria-live` para resultados y guardados, contraste ≥ 4,5:1 en texto normal y alto contraste forzado de Windows soportado.

## 6. Gobierno

- Los cambios de tokens se hacen en `tokens.css` y se documentan aquí.
- Un componente nuevo entra en `design/` solo si se usa en dos o más secciones; si no, vive en su carpeta de funcionalidad.
- Revisión de diseño y accesibilidad antes de publicar cambios relevantes (ver `docs/09-informe-qa.md`).

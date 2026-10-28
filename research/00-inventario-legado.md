# 00 · Inventario de datos auténticos del campus anterior (FLM UNIVERSITY)

- Fecha del inventario: 28/10/2026 (Europe/Madrid).
- Carpeta analizada en solo lectura (no se ha modificado nada): `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\`. En este documento se abrevia como `LEGADO\`.
- Objetivo: separar los datos reales aportados por FLM, y la ubicación de sus archivos fuente, del contenido generado por la versión anterior, que no se va a reutilizar.

## Leyenda

| Etiqueta | Significado |
|---|---|
| **[FLM]** | Dato o archivo real aportado por FLM o por la usuaria, con respaldo documental en la carpeta. |
| **[FLM-sin-doc]** | Dato real aportado por FLM que solo consta transcrito en el código o en maquetas de la versión anterior: el documento original no está en la carpeta. |
| **[PÚBLICO]** | Documento o dato público de terceros (ICAC, BOE, Generalitat…). |
| **[EXTERNO]** | Material de terceros con derechos (revista, presentación de una jornada, imágenes descargadas de webs). |
| **[DUDOSO]** | Aportado, pero con indicios que obligan a confirmar su origen o su vigencia. |
| **[GEN]** | Generado por la versión anterior (textos, tests, resúmenes, maquetas, imágenes de IA): no reutilizar. |

## Método y fuentes

- Archivos leídos: `README.md`, `dist\agenda.js`, `dist\event-hub.js`, `dist\event-icons.js`, `dist\birthdays.js`, `dist\management-model.js`, `dist\views.js`, `dist\recognition-model.js`, `dist\note-library.js`, `dist\library-books.js`, `dist\catalog.js`, `dist\news-seeds.js` y `dist\news-extra-seeds.js`.
- Archivos adicionales donde estaban realmente los datos:
  - `campus-management.cjs`, líneas 13-30: datos semilla de eventos, anuncios, cumpleaños, aniversarios y festivos. `agenda.js` y `event-hub.js` solo los muestran.
  - `notes-server.cjs`: semillas de la biblioteca de notas.
  - `tmp\library-import\import.py`: nombres originales de 6 PDF.
  - `tmp\prepare_real_assets.py` y `tmp\prepare_stock_assets.py`: procedencia de las imágenes.
  - `tmp\revista-t4\revista_real.py` y `tmp\cartel-resenas\create.py`: maquetas que repiten datos de eventos.
  - `flm-campus-sites\dist\public-data.js`: instantánea publicada.
  - `app-data\campus.sqlite-wal`: base local leída en bruto. Solo contiene las mismas semillas y ningún dato real adicional.
- Historial Git local: se revisaron los objetos sueltos (Git no está instalado) para ver cuándo apareció cada dato.
- PDF:
  - Leídos completos con Read: Radar Mercantil, VERI*FACTU, IVA de vehículos, apartahoteles, casación y correcciones del IS.
  - Facturación electrónica: miniatura de la primera página y texto ya extraído en `tmp\pdfs`.
  - Novedades fiscales en Cataluña, campaña del IS 2025, Revista Técnica Tributaria y BOICAC 147: miniatura o primeras páginas, metadatos y extracción de texto.
  - No se pudo usar `pages:"1-2"` porque falta `pdftoppm` en el equipo.
- Imágenes: revisadas visualmente, con hojas de contacto, y por sus metadatos EXIF.
- Horas: Europe/Madrid. El cambio a horario de invierno fue el 25/10/2026. El desayuno del 23/10 cae en CEST (UTC+2); las fechas de noviembre y diciembre, en CET (UTC+1).

---

## 1. Eventos y comunicados reales

### 1.1 Resumen (estado a 28/10/2026)

| # | Evento | Fecha y hora | Lugar | Estado | Imagen real | Etiqueta |
|---|---|---|---|---|---|---|
| 1 | Formación en IA: ChatGPT + Claude (10 sesiones) | Del 02/11/2026 al 02/12/2026, de 12:00 a 14:00 h. Excepción: el 25/11, de 15:00 a 17:00 h | No consta | Próximo | Ninguna | [FLM-sin-doc] |
| 2 | Desayuno Mercantil «Radar Mercantil» | Viernes 23/10/2026, de 09:30 a 10:30 h | Sala Biblioteca | Celebrado (histórico) | Foto + PDF | [FLM] |
| 3 | Próximo desayuno Fiscal | Sin fecha | No consta | Pendiente de convocatoria | Ninguna | [FLM-sin-doc] |
| 4 | Comida de Navidad | Miércoles 16/12/2026, 14:00 h | Restaurant BILBAOBERRIA La Barra | Confirmado | Foto del restaurante (de internet, licencia desconocida) | [FLM-sin-doc] |
| 5 | FLM Awards: votación de los premios de Navidad | Sin fecha | — | Próximamente; falta el formulario real | Ninguna | [FLM-sin-doc] |
| 6 | Concurso de reseñas en Google | Hasta el 31/12/2026 | — | En curso | Ninguna real | [FLM-sin-doc] |
| 7 | Nueva web corporativa | Anunciada en el campus el 27/10/2026 | https://flmexperts.com/ | Disponible | Captura de la web | [FLM] |
| 8 | Newsletter trimestral | Sin fecha | — | Próximamente | Ninguna real | [FLM-sin-doc] |
| 9 | Precierres 2026 (comunicación interna) | 28/10/2026 | — | Vigente | — | [FLM-sin-doc] |

### 1.2 Formación en IA: ChatGPT + Claude

| N.º | Herramienta | Día | Fecha | Horario | Inicio y fin en ISO |
|---|---|---|---|---|---|
| 1 | ChatGPT (sesión 1) | Lunes | 02/11/2026 | 12:00–14:00 | 2026-11-02T12:00+01:00 / T14:00+01:00 |
| 2 | ChatGPT (sesión 2) | Jueves | 05/11/2026 | 12:00–14:00 | 2026-11-05T12:00+01:00 / T14:00+01:00 |
| 3 | ChatGPT (sesión 3) | Lunes | 09/11/2026 | 12:00–14:00 | 2026-11-09T12:00+01:00 / T14:00+01:00 |
| 4 | ChatGPT (sesión 4) | Jueves | 12/11/2026 | 12:00–14:00 | 2026-11-12T12:00+01:00 / T14:00+01:00 |
| 5 | ChatGPT (sesión 5) | Lunes | 16/11/2026 | 12:00–14:00 | 2026-11-16T12:00+01:00 / T14:00+01:00 |
| 6 | Claude (sesión 1) | Lunes | 23/11/2026 | 12:00–14:00 | 2026-11-23T12:00+01:00 / T14:00+01:00 |
| 7 | **Claude (sesión 2): excepción de tarde** | **Miércoles** | **25/11/2026** | **15:00–17:00** | 2026-11-25T15:00+01:00 / T17:00+01:00 |
| 8 | Claude (sesión 3) | Jueves | 26/11/2026 | 12:00–14:00 | 2026-11-26T12:00+01:00 / T14:00+01:00 |
| 9 | Claude (sesión 4) | Lunes | 30/11/2026 | 12:00–14:00 | 2026-11-30T12:00+01:00 / T14:00+01:00 |
| 10 | Claude (sesión 5) | Miércoles | 02/12/2026 | 12:00–14:00 | 2026-12-02T12:00+01:00 / T14:00+01:00 |

- **Total: 10 sesiones de 2 h (20 h).** La excepción del 25/11 por la tarde es una de las diez (la 2.ª de Claude), no una undécima sesión. Los días de la semana se han comprobado con el calendario.
- Datos que no constan:
  - Lugar.
  - Formador o proveedor.
  - Modalidad. La versión anterior la etiquetó como «formación presencial», pero no hay fuente que lo respalde.
- Descripción factual: formación del equipo en el uso de ChatGPT y Claude. La frase descriptiva del campus anterior es [GEN].
- Enlaces: ninguno. Imagen: ninguna (solo icono).
- Fuentes:
  - `LEGADO\dist\agenda.js`, constante `AI_SESSIONS`.
  - Semilla `ai-2026` en `LEGADO\campus-management.cjs`.
  - El README habla de un «calendario facilitado», pero el documento original no está en la carpeta.
  - Historial: la primera versión, del 26/10, decía «Fechas y horarios por confirmar» (noviembre y diciembre). Después se pasó al «calendario definitivo».

### 1.3 Desayuno Mercantil «Radar Mercantil» (celebrado)

- Título real, según la portada del PDF: «Desayuno Mercantil · Radar Mercantil. Conocer para crecer: señales para cuidar mejor a nuestros clientes».
- Fecha y hora: viernes 23/10/2026, de 09:30 a 10:30 h (2026-10-23T09:30+02:00 / T10:30+02:00).
- Lugar: Sala Biblioteca, en la oficina de FLM.
- Ponentes: Joan Navarro (Socio del Área Mercantil) y Lorena Ortiz (Abogada mercantil).
- Estado: celebrado. Va a Histórico.
- Descripción factual, sacada del PDF: sesión de unos 40 minutos para que el resto de áreas aprenda a detectar necesidades mercantiles de sus clientes. Contenido:
  - Por qué compartir información: FLM está trabajando con HubSpot para reunir la información de clientes.
  - Quiénes son los ponentes y qué servicios ofrece el área.
  - Un caso real de conflicto entre socios, citando una noticia de finanzas.com.
  - 10 señales para derivar a Mercantil y ejemplos por departamento.
  - Un calendario anual de servicios societarios.
  - Una dinámica con tres casos.
  - Un circuito de derivación en tres pasos: detecta, comparte, acompañamos.
- Material descargable: `LEGADO\dist\assets\formaciones\radar-mercantil-flm-20261020.pdf` (12 páginas).
- Foto:
  - Original: `LEGADO\recursos\identidad-flm\Desayuno Mercantil FLM.png` (1290×2152, vertical). Antes estaba en `Downloads\IMG_8609.PNG`.
  - Copia optimizada: `LEGADO\dist\assets\company\breakfast-mercantil.jpg`.
- Atención:
  - La página 11 del PDF tiene dos marcadores sin rellenar: el canal de contacto («[ email / Teams ]») y el plazo de respuesta («[ 48 h ]»).
  - En la foto aparecen personas identificables.
- Fuentes: el PDF y la semilla `desayuno-mercantil` (09:30, Sala Biblioteca), que coincide con el PDF.

### 1.4 Próximo desayuno Fiscal (pendiente)

- Dato: el siguiente desayuno departamental será con el Área Fiscal. Día, hora, lugar y ponentes están sin confirmar.
- Además, se prevé seguir con desayunos de otras áreas.
- Fuentes:
  - Semilla `desayuno-fiscal`. Figura como «pendiente de convocatoria» desde la primera versión (26/10/2026).
  - El cierre de la noticia del desayuno Mercantil en `dist\agenda.js`.

### 1.5 Comida de Navidad

- Fecha y hora: miércoles 16/12/2026, a las 14:00 h (2026-12-16T14:00+01:00). La hora de fin no consta.
- Lugar: Restaurant BILBAOBERRIA La Barra (web: https://www.bilbaoberrialabarra.com/).
- Dirección: **no consta en ningún archivo**.
- Estado: «fecha, hora y lugar confirmados» desde la primera versión, del 26/10/2026. Esa versión lo mostraba con etiquetas en catalán (Data / Hora / Lloc), lo que sugiere que el dato llegó así.
- Descripción factual: comida de todo el equipo para celebrar el cierre del año.
- Imagen: `LEGADO\recursos\identidad-flm\bilbao_berria_restaurante_barcelona_catedral.jpg`.
  - Muestra el interior de un restaurante; mide 683×487.
  - Está descargada de internet: sin autor y con licencia desconocida.
  - El nombre del archivo alude a «Bilbao Berria… Catedral»: hay que confirmar que es el mismo local que «BILBAOBERRIA La Barra».
- Fuentes: semilla `comida-2026` y el blob antiguo de `views.js` en el historial Git. La revista prototipo [GEN] repite los mismos datos.

### 1.6 FLM Awards

- Dato: votación mediante encuestas para los premios de empresa de Navidad, los «FLM Awards».
- Enlace: el que figura (`https://docs.google.com/forms/`) es un marcador genérico; falta el formulario real.
- Fecha: no consta ni la de votación ni la de entrega. Tampoco constan categorías.
- Fuente: semilla `flm-awards-2026`.

### 1.7 Concurso de reseñas

- Dato: concurso interno para conseguir reseñas de clientes en Google. Plazo: hasta el 31/12/2026.
- Hay **dos enlaces distintos** a la ficha de FLM en Google Maps; hay que confirmar cuál es el oficial:
  - `https://maps.app.goo.gl/MZV1S1RQopMHvdbp9`, en `dist\views.js` (bloque de reseñas del campus).
  - `https://maps.app.goo.gl/rtdJCuyF4vwAZPcE9`, en el cartel.
- Bases: solo constan en el cartel [GEN] `LEGADO\output\pdf\FLM_Concurso_de_Resenas_2026.pdf`, que usa un correo de ejemplo (ejemplo@flmexperts.com). No hay documento de FLM que las respalde; **hay que confirmarlas**. Según el cartel:
  - Premio: 1 día de vacaciones adicional en 2027 para quien más puntos sume.
  - Cada reseña positiva suma 1 punto.
  - Se envía una captura por correo.
- Fuente: semilla `concurso-resenas-2026`.

### 1.8 Nueva web corporativa

- Dato: FLM estrena web. El anuncio en el campus está fechado el 27/10/2026; la fecha real de lanzamiento no está verificada.
- URL: https://flmexperts.com/ (servicios: https://flmexperts.com/#servicios).
- Imagen: `LEGADO\dist\assets\company\new-flm-website.png` (1864×966), una captura de la portada nueva. Muestra:
  - Cabecera con el logo FLM + Crowe y menú «Servicios» y «Sedes».
  - Botón para reservar consultoría.
  - Titular sobre abogados y asesores fiscales, laborales y mercantiles.
  - Dos personas en la imagen de fondo de la propia web.
- Datos corporativos visibles en la captura (validarlos en la web):
  - Más de 100 años de trayectoria.
  - Oficinas en Barcelona, Vic y Granollers.
  - Respaldo internacional de Crowe Global.
- Fuente: semilla `nueva-web-flm`.

### 1.9 Newsletter trimestral

- Dato: FLM prepara una newsletter trimestral con noticias del despacho, del sector y del equipo. Estado: «próximamente», sin fecha ni responsable.
- Ojo: `LEGADO\output\pdf\FLM_Revista_Trimestral_T4_2026_Prototipo.pdf` («Nº 01 · T4 2026») es una maqueta [GEN] de la versión anterior, no una edición de FLM.
- Fuente: semilla `newsletter-trimestral`.

### 1.10 Otros comunicados e iniciativas

- **Precierres 2026** (comunicación interna de FLM, 28/10/2026):
  - Recordatorio para organizar reuniones de precierre con sociedades y profesionales y compartirlas con la persona responsable.
  - El texto lo redactó la versión anterior, pero el recordatorio procede de FLM, según el comentario de `LEGADO\dist\news-extra-seeds.js`.
- **Buzón de sugerencias**: las ideas de formación y las mejoras de procesos se envían a barcelona@flmexperts.com.
- **Vídeos de empresa**: quien quiera participar contacta con comunicacion@flmexperts.com.
- **Reseñas de clientes** en Google (ver 1.7) y **apoyo a LinkedIn** (ver sección 3).
- Contexto: FLM trabaja con HubSpot (Radar Mercantil, p. 3). El dominio corporativo es @flmexperts.com. El brief de `output\` habla de unos 50 empleados, sin documento de FLM que lo respalde.

### 1.11 Festivos [PÚBLICO] (no aportados por FLM; reverificar)

| Fecha | Festivo | Ámbito |
|---|---|---|
| 08/12/2026 | Inmaculada Concepción | Nacional |
| 25/12/2026 | Navidad | Nacional |
| 26/12/2026 | Sant Esteve | Cataluña |
| 2027: 01/01, 06/01, 26/03, 01/05, 12/10, 01/11, 06/12, 08/12, 25/12 | Año Nuevo, Reyes, Viernes Santo, Día del Trabajo, Fiesta Nacional, Todos los Santos, Constitución, Inmaculada, Navidad | Nacional |
| 2027: 29/03, 24/06, 11/09 | Lunes de Pascua, Sant Joan, Diada | Cataluña |
| 2027: 17/05, 24/09 | Segunda Pascua, La Mercè | Barcelona (local) |

Fuentes:
- Constante `CALENDAR_HOLIDAYS_2027` en `LEGADO\dist\birthdays.js` (cita la Orden EMT/52/2026 y el Decreto de Alcaldía ANY2026-15675).
- Generalitat: https://treball.gencat.cat/ca/ambits/relacions_laborals/ci/calendari_laboral/calendari-festes-2027/
- Ayuntamiento de Barcelona: https://bcnroc.ajuntament.barcelona.cat/jspui/bitstream/11703/148041/1/GM_DA_FestesLocals_BCN_2027.pdf

---

## 2. Documentos PDF (`LEGADO\dist\assets\notas` y `LEGADO\dist\assets\formaciones`)

### 2.1 Tabla resumen

| # | Ruta (`LEGADO\dist\assets\…`) | Título real | Emisor | Fecha | Área | Págs. | Tipo |
|---|---|---|---|---|---|---|---|
| 1 | `notas\facturacion-electronica.pdf` | Nota informativa. La facturación electrónica B2B: calendario y obligaciones tras la Orden HAC/1028/2026 | FLM (logo FLM + Crowe). Autor en metadatos: Angel Maria Ceniceros | Octubre de 2026 (PDF del 13/10/2026) | Fiscal | 6 | Propio de FLM [FLM] |
| 2 | `notas\iva-vehiculos.pdf` | Nota informativa. Tratamiento en IVA de los vehículos: deducción y cesión a empleados tras la STS de 13 de julio de 2026 | FLM (logo FLM + Crowe). Autor en metadatos: Lluís Gómez | Octubre de 2026 (PDF del 13/10/2026) | Fiscal (IVA; se coordina con Laboral) | 3 | Propio de FLM [FLM] |
| 3 | `notas\verifactu.pdf` | Nota informativa: VERI*FACTU — plazos y exclusiones | FLM (cabecera de marca «FISCAL L M») | Octubre de 2026 (PDF del 01/10/2026) | Fiscal | 2 | Propio de FLM [FLM] (plazo quizá superado, ver ficha) |
| 4 | `notas\apartahoteles-viviendas.pdf` | IVA en operaciones con apartahoteles convertidos a viviendas | FLM (logo lineal FLM con «A business associate of Crowe Global») | Septiembre de 2026 (PDF del 23/09/2026) | Fiscal | 2 | Propio de FLM [FLM] |
| 5 | `notas\casacion-no-residentes.pdf` | ATS 7675/2026, de 15 de julio (carta a clientes: p. 1 en inglés, p. 2 en español) | FLM | Septiembre de 2026 (PDF del 22/09/2026) | Fiscal (IRNR) | 2 | Propio de FLM [FLM] (comunicación a clientes) |
| 6 | `notas\correcciones-is.pdf` | Resumen consulta V5484-26. IS, errores contables | FLM. Autor en metadatos: Lluís Gómez Palanques | Septiembre de 2026 (PDF del 29/09/2026) | Fiscal / Contable | 2 | Propio de FLM [FLM] |
| 7 | `notas\novedades-fiscales-cataluna.pdf` | Novedades fiscales en Cataluña. Ley 11/2026, de 9 de julio (resumen divulgativo para clientes) | **No identificado** (sin marca FLM) | PDF del 28/10/2026 | Fiscal | 9 | [DUDOSO] |
| 8 | `notas\campana-is-2025.pdf` | Novedades campaña IS 2025 (presentación) | **No identificado**. Metadatos: «Delegació Catalana» | PDF del 02/07/2026 | Fiscal (IS) | 44 | [EXTERNO] probable |
| 9 | `notas\revista-tecnica-tributaria-153.pdf` | Revista Técnica Tributaria, n.º 153 (abril-junio de 2026) | AEDAF (revista externa) | Abril-junio de 2026 | Fiscal | 476 | [EXTERNO] con derechos |
| 10 | `formaciones\boicac-147.pdf` | BOICAC n.º 147, septiembre de 2026. Boletín del Instituto de Contabilidad y Auditoría de Cuentas | ICAC (Ministerio de Economía, Comercio y Empresa) | Septiembre de 2026; cierre de edición: 22/10/2026 | Contable / auditoría | 39 | [PÚBLICO] |
| 11 | `formaciones\radar-mercantil-flm-20261020.pdf` | Radar Mercantil · Conocer para crecer: señales para cuidar mejor a nuestros clientes (Desayuno Mercantil) | FLM, Área Mercantil (Joan Navarro y Lorena Ortiz) | 20/10/2026 según el nombre; evento del 23/10/2026; exportado el 23/10/2026 | Mercantil | 12 | Propio de FLM, interno [FLM] |
| 12 | `formaciones\newsletter-flm-boicac-147.pdf` | FLM Newsletter · Consultas del ICAC · BOICAC 147 | **Generado por la versión anterior** (ReportLab), aunque lleva la firma «FLM» | 27/10/2026 | Contable | 4 | [GEN]: no reutilizar |

Notas a la tabla:
- Las fechas entre paréntesis son las de creación del PDF según sus metadatos. Las notas 1 a 3 no llevan fecha impresa.
- Cada PDF de `notas\` tiene una miniatura `.jpg` de su primera página con el mismo nombre. Son derivadas y se pueden regenerar.
- Nombres originales (copiados desde el Escritorio de la usuaria el 28/10/2026):
  - #7: «NOVEDADES FISCALES CATALUÑA.pdf»
  - #4: «Nota informativa Cambio destino aparthoteles convertidas a viviendas (1).pdf»
  - #6: «NOTA CORRECCIONES IS 1.pdf»
  - #5: «Nota informativa Admisión Recurso Casacion Supremo- version clientes.pdf»
  - #9: «REVISTA TÉCNICA TRIBUTARIA.pdf»
  - #8: «NOVEDADES CAMPAÑA IS 2025.pdf»
  - #1 a #3 se añadieron el 26/10/2026 con nombre original desconocido.
- La biblioteca anterior asignaba el área «fiscal» a todas las notas.

### 2.2 Fichas (resumen con mis palabras)

1. **Facturación electrónica B2B** [FLM]
   - Resumen: explica la obligación de factura electrónica entre empresas tras la orden que regula la solución pública de la AEAT. Expone el calendario según el volumen de operaciones: 6/10/2027 para quienes superan 8 M€, 6/10/2028 para el resto, y 2029 para la comunicación de estados y pagos de personas físicas pequeñas. Detalla el formato estructurado, las plataformas, la copia a la AEAT y la comunicación de rechazos y pagos en cuatro días. Lo distingue de VERI*FACTU y cierra con recomendaciones y fuentes.
   - Texto extraído: `LEGADO\tmp\pdfs\facturacion-electronica.txt`.
2. **IVA de vehículos** [FLM]
   - Resumen: fija el criterio de FLM sobre la deducción del IVA de turismos (presunción del 50 % y cómo probarla). Analiza la cesión del vehículo al empleado: no sujeta si es gratuita y sujeta si es onerosa, según la STS 3546/2026 y la doctrina del TEAC y la DGT. Recuerda que combustible y mantenimiento se analizan aparte y que la retribución en especie del IRPF debe coordinarse con Laboral.
3. **VERI*FACTU** [FLM]
   - Resumen: resume quién debe adaptar los sistemas informáticos de facturación (RD 1007/2023) y las dos modalidades. Plazos tras el RDL 15/2025: 1/1/2027 para sociedades y 1/7/2027 para el resto. Explica la exclusión de quienes llevan el SII, sus matices y otras exclusiones.
   - Atención: el 05/10/2026 Hacienda anunció un aplazamiento a octubre de 2028 que la nota no recoge. Antes de publicarla, hay que revisar si FLM la ha actualizado.
4. **Apartahoteles convertidos en viviendas** [FLM]
   - Resumen: comenta la consulta DGT V5234-26, de 22/07/2026. El IVA de la compra y la reforma es deducible según el destino previsto, pero hay que regularizarlo de una vez si se decide vender como viviendas antes de explotar el inmueble. La venta posterior tributa según las obras sean rehabilitación (primera entrega sujeta) o no (segunda entrega exenta, con posible renuncia).
5. **Casación de no residentes** [FLM]
   - Resumen: carta a clientes, en inglés y en español, sobre la admisión a casación por el Tribunal Supremo (ATS 7675/2026) de la deducción de gastos de alquiler para no residentes de terceros países. Expone la diferencia de trato frente a los residentes de la UE y el EEE. Invita a impugnar los modelos 210 de 2022 antes de que prescriban.
6. **Correcciones contables en el IS** [FLM]
   - Resumen: resume la consulta DGT V5484-26, de 18/08/2026, sobre dar de baja saldos antiguos de clientes y proveedores ya cobrados o pagados. Si los ejercicios de origen tributaron correctamente, la corrección contra reservas no genera renta ni exige ajustes extracontables. Añade observaciones prácticas sobre deterioros, IVA y soporte documental.
7. **Novedades fiscales en Cataluña** [DUDOSO]
   - Resumen: resumen divulgativo de la Ley catalana 11/2026, de acompañamiento presupuestario (DOGC del 13/07/2026; en vigor desde el 14/07/2026). Recoge nuevas deducciones autonómicas en IRPF y ajustes en Sucesiones y Donaciones e ITP-AJD. También tasas, canon del agua e impuesto sobre estancias turísticas.
   - Duda: no lleva logotipo ni firma de FLM. Se creó con python-docx y se convirtió a PDF el 28/10/2026 a las 15:13, siete minutos antes de importarse. Hay que confirmar si es un documento de FLM.
8. **Novedades campaña IS 2025** [EXTERNO probable]
   - Resumen: presentación en tres bloques. Primero, los cambios normativos del IS 2025: reserva de capitalización, tipos para empresas de reducida dimensión y microempresas, bases imponibles negativas en consolidación y libertad de amortización en renovables. Después, los cambios del modelo 200. Por último, doctrina y jurisprudencia recientes (TEAC, TS y DGT).
   - Duda: no identifica al emisor. Los metadatos dicen «Delegació Catalana» y conserva texto de relleno de plantilla, así que probablemente es material de una jornada externa. Hay que confirmar si puede distribuirse.
9. **Revista Técnica Tributaria 153** [EXTERNO]
   - Resumen: número trimestral de la revista de AEDAF con estudios doctrinales. Temas: Directiva 2003/49/UE y convenios (asunto Velcro), prórroga presupuestaria, responsabilidad patrimonial, tecnología e IA en la AEAT, Pilar Dos de la OCDE, valor de referencia y tasación pericial contradictoria, y régimen de impatriados.
   - Publicación protegida: hay que confirmar la suscripción o licencia antes de alojarla.
10. **BOICAC 147** [PÚBLICO]
    - Resumen: boletín oficial del ICAC. Incluye resoluciones sancionadoras y altas y bajas del Registro Oficial de Auditores, además de dos reglamentos delegados europeos sobre sostenibilidad. Trae tres consultas contables (pp. 32-37):
      - Informe fiscal de filiales con dominante intermedia europea.
      - Imputación temporal de ingresos en un contrato de mantenimiento.
      - Bien recuperado mediante dación en pago.
    - El ICAC autoriza la reproducción citando la procedencia.
    - Texto extraído: `LEGADO\tmp\boicac147\original.txt`.
11. **Radar Mercantil** [FLM]
    - Resumen: presentación del Área Mercantil para el desayuno del 23/10/2026; el contenido detallado está en 1.3.
    - Es material interno. La página 11 tiene dos marcadores sin completar (canal de contacto y plazo de respuesta).
    - Metadatos: autor «FLM»; creado con PptxGenJS y exportado desde PowerPoint el 23/10/2026.
12. **Newsletter BOICAC 147** [GEN]
    - Síntesis y ejemplos redactados por la versión anterior (`LEGADO\tmp\boicac147\newsletter_equipo.py`). No reutilizar.

### 2.3 Otros documentos de la carpeta (todos [GEN]; no reutilizar)

- `LEGADO\output\pdf\FLM_Concurso_de_Resenas_2026.pdf` (cartel, 1 p.).
- `LEGADO\output\pdf\FLM_Mapa_del_sitio_y_flujos.pdf` (4 p.).
- `LEGADO\output\pdf\FLM_Newsletter_Consultas_ICAC_147.pdf` (4 p.).
- `LEGADO\output\pdf\FLM_Revista_Trimestral_T4_2026_Prototipo.pdf` (5 p.).
- `LEGADO\Nota_informativa_FLM_ICAC_147.docx`, generado con python-docx a partir de la newsletter.
- `LEGADO\tmp\icac\*.pdf` y `LEGADO\tmp\boicac147\newsletter-antes-correcciones.pdf` (borradores).
- `LEGADO\output\FLM_Campus_Design_Development_Brief_EN.md`: brief del producto. No aporta datos nuevos salvo los ya citados (Instagram, unos 50 empleados, correos de contacto).

### 2.4 Entradas de `catalog.js` y de las semillas de noticias basadas en material aportado

Solo sirven para trazabilidad: sus textos son [GEN].

- `catalog.js`:
  - Basadas en las notas 1-3: «Nota FLM: facturación electrónica B2B», «Nota FLM: IVA de vehículos y cesión a empleados» y «Nota FLM: VERI*FACTU, plazos y exclusiones».
  - Basada en el BOICAC 147: «BOICAC 147: tres consultas para comentar en equipo». Se atribuye a Judith Calet, Asesora Contable.
  - «¿Cuándo referir un cliente a mercantil?»: adjunta el Radar Mercantil, pero su texto se elaboró con fuentes del BOE.
  - Las otras 20 formaciones, de las 25 que tiene el catálogo, se redactaron a partir de fuentes públicas (AEAT, BOE, ICAC, Seguridad Social, Comisión Europea): [GEN].
- `news-seeds.js`: referencias aportadas por la usuaria, sin documento en la carpeta:
  - DGT, consulta del 26/06/2026 sobre ingresos anticipados. Falta el número; el enlace apunta a elderecho.com.
  - DGT V5476-26 (14/08/2026), sobre precio variable. Falta contrastar el texto íntegro.
  - STSJ de Madrid 10659/2026, sobre la prueba de pérdidas en criptomonedas.
  - Tribunal Supremo, 18/05/2026, sobre AJD en una obra nueva antigua. Falta contrastarla.
  - STS 3779/2026 (Porcelanosa Grupo AIE), sobre refacturación a coste e IVA.
  - La entrada sobre TEAC 08201/2023 y 07794/2023 la localizó la propia versión anterior.
- `news-extra-seeds.js`:
  - «Precierres 2026» procede de FLM (comunicación interna).
  - Las otras dos entradas (participaciones no cotizadas; salarios reconocidos judicialmente) son [GEN] con fuente en el BOE.

---

## 3. LinkedIn y redes

- Página de empresa: https://www.linkedin.com/company/flm-soluciones-legales/ (FLM Soluciones legales).
- **No hay ninguna URL ni fecha de publicaciones concretas**, ni en los archivos actuales ni en el historial Git.
- La versión anterior mostraba tres tarjetas. Las presentaba como «selección resumida del perfil consultado el 26/10/2026», con imágenes ilustrativas y enlace solo al perfil general. Esas tres «publicaciones» no son verificables y se deben tratar como no confirmadas:

| Tema (título usado) | Área | URL | Fecha |
|---|---|---|---|
| Cinco errores mercantiles que conviene prevenir | Mercantil | No consta | No consta |
| Prepara la fiscalidad del último trimestre | Fiscal | No consta | No consta |
| Horas extraordinarias: registro y reclamaciones | Laboral | No consta | No consta |

- Otras referencias:
  - Instagram: https://www.instagram.com/flm_solucioneslegales/ (citado en el brief).
  - Fichas de Google Maps: dos enlaces distintos (ver 1.7).

---

## 4. Personas reales

| Persona | Cargo | Dónde aparece | Fotografías disponibles | Notas |
|---|---|---|---|---|
| Ángel María Ceniceros | Socio del Área Fiscal | Nombres de archivo de sus fotos; README; autor en metadatos de `facturacion-electronica.pdf` | Ver lista debajo | En la versión anterior figuraba como «perfil de responsable de ejemplo» |
| Joan Navarro | Socio del Área Mercantil | Radar Mercantil, pp. 1, 4 y 12. Según el PDF, más de 25 años en derecho societario y M&A | Solo dentro del PDF (pp. 4 y 12) | Ponente del Desayuno Mercantil |
| Lorena Ortiz | Abogada mercantil | Radar Mercantil, pp. 1, 4 y 12. Según el PDF, trabaja en español, catalán e inglés | Solo dentro del PDF (pp. 4 y 12) | Ponente del Desayuno Mercantil |
| Judith Calet | Asesora Contable, según la versión anterior | Autora de la formación BOICAC 147 en `catalog.js`; perfil de demostración del departamento Contable | `LEGADO\dist\assets\judith-calet.jpeg` (retrato sentada con libreta FLM; EXIF del 23/10/2026) | Confirmar el cargo. La fecha de incorporación de la demo era de ejemplo |
| Lluís Gómez (Palanques) | No consta | Autor en metadatos de `iva-vehiculos.pdf` y `correcciones-is.pdf`. Su nombre también se usó en un aniversario ficticio | Ninguna | Confirmar el cargo (probablemente Fiscal) |
| Jia Miao | No consta | Solo en un cumpleaños ficticio | Ninguna | Confirmar si es empleada real; no reutilizar la fecha |
| Christofer Raudales | No consta | Solo en un aniversario ficticio | Ninguna | Confirmar si es empleado real; no reutilizar la fecha |

Fotos disponibles de Ángel María Ceniceros:
- `LEGADO\recursos\identidad-flm\ÁNGEL MARÍA CENICEROS 3 - Socio Área Fiscal.jpg`: sentado, vertical.
- `LEGADO\recursos\identidad-flm\ÁNGEL MARÍA CENICEROS 15 - Socio Área Fiscal.jpg`: de pie junto a la puerta con el vinilo FLM, horizontal.
- `LEGADO\dist\assets\angel.jpg`: de pie con los brazos cruzados, 2000×3000. Es de la misma sesión, pero el original no está en `recursos`.
- `LEGADO\dist\assets\angel-web.jpg`: copia reducida de la anterior.
- `LEGADO\dist\assets\company\angel.jpg`: copia optimizada de la n.º 3.

Otros datos sobre personas:
- **Asistentes del Desayuno Mercantil**: en la foto aparecen al menos cuatro personas con el rostro visible (y otras parcialmente), sin nombre en ningún archivo.
- **Recepción**: las tres personas que aparecen están desenfocadas por el movimiento y no son identificables.
- **Fotógrafo de la sesión corporativa** (no es personal de FLM), según el EXIF:
  - Artist: «raquelgrafic.com».
  - Copyright: «BRANDING CONSCIENTE».
  - Cámara Canon EOS R6 Mark II. Fechas: 25/11/2025 (oficina) y 17/12/2025 (retratos).

---

## 5. Imágenes

### 5.1 `LEGADO\recursos\identidad-flm\` (35 archivos)

Fotografías (sesión de raquelgrafic.com / Branding Consciente, salvo que se indique otra cosa):

| Archivo | Qué muestra | ¿Personas identificables? | Copia en `dist\assets\company` | Fecha de toma |
|---|---|---|---|---|
| BIBLIOTECA 1.jpg | Sala Biblioteca: mesa larga de madera, sillas de piel negras, estanterías con libros jurídicos y roll-up de FLM | No | library-1.jpg | 25/11/2025 |
| BIBLIOTECA 2.jpg | La misma sala desde otro ángulo, con el roll-up «A business associate of Crowe Global · www.flmexperts.com» y ventana a la calle | No | library-2.jpg | 25/11/2025 |
| RECEPCIÓ.jpg | Recepción con mostrador de madera y logo FLM, puertas de vidrio y sofás morados | No (3 personas desenfocadas) | reception.jpg | 25/11/2025 |
| LIBRETA FLM 1.jpg | Libreta corporativa burdeos con logo FLM y bolígrafo FLM sobre mesa redonda | No | notebook-1.jpg | 25/11/2025 |
| LIBRETA FLM 2.jpg | La misma libreta en un plano más abierto, con sillón y planta | No | notebook-2.jpg | 25/11/2025 |
| EDIFICIOS.jpg | Contrapicado de los edificios del entorno (fachadas clásicas y el edificio de oficinas) con cielo | No | neighbourhood.jpg | 25/11/2025 |
| EDIFICIO FLM 1.jpg | Exterior del edificio de oficinas (fachada de aluminio y vidrio en zigzag) en contrapicado, con árboles | No | building-1.jpg | 25/11/2025 |
| EDIFICIO FLM 2.jpg | El mismo exterior, en vertical | No | building-2.jpg | 25/11/2025 |
| EDIFICIO FLM 3.jpg | Exterior desde otro ángulo, con un edificio clásico a la derecha | No | building-3.jpg | 25/11/2025 |
| EDIFICIO FLM 4.jpg | Esquina del edificio de oficinas | No | building-4.jpg | 25/11/2025 |
| EDIFICIO FLM 5.jpg | Fachada en contrapicado junto a un árbol | No | building-5.jpg | 25/11/2025 |
| EDIFICIO FACHADA FLM 1.jpg | Detalle de los módulos de ventana de la fachada | No | facade-1.jpg | 25/11/2025 |
| EDIFICIO FACHADA FLM 2.jpg | Detalle vertical de la fachada | No | facade-2.jpg | 25/11/2025 |
| EDIFICIO FACHADA FLM 3.jpg | Fachada con ramas de árbol y cielo | No | facade-3.jpg | 25/11/2025 |
| EDIFICIO FACHADA ENFRENTE.jpg | Edificio clásico de esquina frente a la oficina, con un taxi barcelonés en movimiento | No | — | 25/11/2025 |
| EDIFICIO FACHADA ENFRENTE 3.jpg | El mismo edificio clásico enmarcado por árboles, en vertical | No | — | 25/11/2025 |
| ÁNGEL MARÍA CENICEROS 3 - Socio Área Fiscal.jpg | Retrato vertical, sentado a una mesa | **Sí** (Ángel María Ceniceros) | angel.jpg | 17/12/2025 |
| ÁNGEL MARÍA CENICEROS 15 - Socio Área Fiscal.jpg | Retrato horizontal, de pie junto a una puerta con el vinilo FLM | **Sí** (Ángel María Ceniceros) | — | 17/12/2025 |
| Desayuno Mercantil FLM.png | **Foto del Desayuno Mercantil (23/10/2026)** en la Sala Biblioteca: mesa con bocadillos y bollería y pantalla con la diapositiva 3 del Radar Mercantil. Sin EXIF; antes era `IMG_8609.PNG` | **Sí** (al menos 4 asistentes con el rostro visible, sin nombre) | breakfast-mercantil.jpg | 23/10/2026 (deducida por el contenido) |
| bilbao_berria_restaurante_barcelona_catedral.jpg | **Interior de restaurante** (asociado a la comida de Navidad): botelleros iluminados, lámparas colgantes y sillas rojas de pata de gallo. Descargada de internet, sin autor | No | — | Desconocida |

Logotipos (PNG del 26/05/2026; fondo transparente salvo que se indique otra cosa):

| Archivo | Descripción |
|---|---|
| FLM-Horizontal.png | Logo principal: tres círculos F·L·M con degradado rojo, burdeos y azul marino. Idéntico a `dist\assets\company\logo-flm.png` |
| logo-hor-FLM-Crowe.png | Logo horizontal con «A business associate of Crowe Global». Idéntico a `dist\assets\company\logo-flm-crowe.png` |
| logo-ver-FLM-Crowe.png | Logo grande con «A business associate of Crowe Global» debajo |
| FLM-Vertical.png | Círculos F·L·M en columna |
| FLM-V-Derecha.png / FLM-V-Izq.png | Variantes verticales escalonadas |
| FLM-Diagonal.png | Círculos en diagonal |
| FLM-H-Abajo.png / FLM-H-Arriba.png | Variantes horizontales escalonadas, con la M abajo o arriba |
| FLM-Horizontal Marco.png | Logo sobre un cuadrado blanco |
| FLM-Horizontal Marco Transparente.png | Logo pequeño centrado en un lienzo cuadrado transparente |
| FLM-Horizontal Redes.png | Avatar para redes: círculos blancos con letras sobre fondo degradado rojo y azul |
| FLM - Fiscal.png / FLM - Laboral.png / FLM - Mercantil.png | Logos de área: el círculo de la letra correspondiente se sustituye por la palabra FISCAL, LABORAL o MERCANTIL |

### 5.2 `LEGADO\FOTOS FLM RECURSOS\` (5 archivos)

| Archivo | Descripción | Personas |
|---|---|---|
| BUZON SUGERENCIAS FOTO.jpg | **No es una fotografía**: icono plano de un buzón con un sobre, en blanco sobre un círculo degradado de morado a rojo (980×980). Probablemente es un icono de banco de imágenes; origen y licencia desconocidos. Idéntico a `dist\assets\buzon-sugerencias.jpg` | No |
| BIBLIOTECA 2.jpg | Duplicado exacto de `identidad-flm\BIBLIOTECA 2.jpg` | No |
| FLM - Fiscal.png, FLM - Laboral.png, FLM - Mercantil.png | Duplicados exactos de los logos de área | — |

### 5.3 `LEGADO\dist\assets\company\` (19 archivos: copias optimizadas a un máximo de 1440 px)

| Archivo | Original | Notas |
|---|---|---|
| breakfast-mercantil.jpg | Desayuno Mercantil FLM.png | Foto clave del desayuno; personas identificables |
| new-flm-website.png | Captura de la nueva web (no está en `recursos`) | Foto clave de la web nueva; dos personas de fondo, de la propia web |
| angel.jpg | ÁNGEL MARÍA CENICEROS 3 | Persona identificable |
| library-1.jpg, library-2.jpg | BIBLIOTECA 1 y 2 | — |
| reception.jpg | RECEPCIÓ | — |
| notebook-1.jpg, notebook-2.jpg | LIBRETA FLM 1 y 2 | — |
| neighbourhood.jpg | EDIFICIOS | — |
| building-1…5.jpg | EDIFICIO FLM 1…5 | — |
| facade-1…3.jpg | EDIFICIO FACHADA FLM 1…3 | — |
| logo-flm.png, logo-flm-crowe.png | FLM-Horizontal.png y logo-hor-FLM-Crowe.png | Copias idénticas |

### 5.4 Otras imágenes de `LEGADO\dist\assets\` (raíz)

| Archivo | Descripción | Etiqueta |
|---|---|---|
| judith-calet.jpeg | Retrato de Judith Calet, sentada con una libreta FLM (persona identificable) | [FLM] |
| angel.jpg / angel-web.jpg | Ángel María Ceniceros de pie con los brazos cruzados (original de 2000×3000 y copia de 600×900) | [FLM] |
| buzon-sugerencias.jpg | Icono del buzón (ver 5.2) | [FLM], licencia desconocida |
| brand.jpg | Pieza de marca «FLM, tu partner legal. Fiscal · Laboral · Mercantil» con ondas rojas sobre azul marino (399×501). Procedencia no documentada (¿web o redes de FLM?) | [FLM] |
| logo-original.jpg | Avatar de FLM de 200×200: círculos blancos sobre degradado. Probablemente de redes | [FLM] |
| google-review-logo.png | Imitación del logo «Google Reviews» **generada con ChatGPT**: es idéntica a `LEGADO\Imagen de ChatGPT 26 oct 2026, 16_43_26.png`. Marca de terceros | [GEN]: no reutilizar |
| logo.svg | Logo recreado en SVG por la versión anterior | [GEN]: usar los PNG originales |

### 5.5 Imágenes de banco (`LEGADO\recursos\fotos-stock\` y su copia en `LEGADO\dist\assets\stock\`)

Según `catalog.js`, FLM las aportó como «fotografías de stock»: se copiaron del Escritorio el 27/10/2026. No tienen metadatos de autor. Por los nombres y el contenido, parecen descargadas de webs de terceros. **Licencia desconocida en todos los casos.**

| Original | Copia | Qué muestra | Indicio de procedencia | Licencia |
|---|---|---|---|---|
| 68b9e59b104ae633a42979b3_66d86d5a05faeab3f47dea82_taxes.jpg | tax-documents.jpg | Recibos, carpeta «Income Tax» y calculadora, con logos de comercios de terceros | Patrón de nombre de CDN de Webflow (descarga de una web) | Desconocida |
| ce7664c93bbd41bd9ed9663c29388aec.webp | tax-return.jpg | Manos con calculadora y bolígrafo sobre formularios, portátil y gafas | Nombre en forma de hash; web desconocida | Desconocida |
| Contabilidad-que-es-en-que-consiste-y-que-tipos-hay1.jpg | team-analysis.jpg | Cinco personas (modelos) reunidas ante portátiles y una pantalla con gráficos | Imagen de un artículo de blog | Desconocida |
| hhh.jpg | tax-calendar.jpg | Letras «TAX» sobre cubos de madera con iconos y monedas | Sin pista | Desconocida |
| impuestoshero.jpg | tax-planning.jpg | Pilas de monedas con el texto «TAXES%» e iconos superpuestos | Imagen de cabecera de una web | Desconocida |
| Juvenile-Lawyer.jpg | legal-desk.jpg | Libro abierto, mazo, balanza y portátil | Imagen de una web (450×266) | Desconocida |
| lawyer-and-client-shake-hands-after-winning-a-law-2023-11-27-04-51-47-utc-2048x1365-1.jpg | legal-agreement.jpg | Apretón de manos con estatua de la justicia, mazo y documentos | Nombre con patrón de Envato Elements y sufijo de tamaño de WordPress: copiada de una web | Desconocida |
| mejorar-contabilidad-de-la-empresa.jpg | accounting-work.jpg | Persona con calculadora y portátil, con gráficos impresos | Imagen de un blog | Desconocida |
| programa-de-contabilidad-1.webp | financial-charts.jpg | Monedas, calculadora y gráficos, con formas naranjas de la web original | Imagen de un blog | Desconocida |
| Screenshot-2025-10-28-at-10.15.56-AM.png | legal-review.jpg | Abogado firmando documentos, con balanza y mazo | Captura de pantalla de macOS de una imagen ajena | Desconocida |

### 5.6 Imágenes generadas (todas [GEN]; no reutilizar)

- `LEGADO\dist\assets\covers\fiscal.png`, `laboral.png`, `mercantil.png`, `contable.png`, `referir-cliente-mercantil.png` y `referir-cliente-mercantil-test.png`: generadas con image_gen. No retratan a personal de FLM (`IMAGE_ASSETS.md`).
- `LEGADO\dist\assets\covers\boicac-147.svg` y `boicac-147-test.svg`.
- `LEGADO\tmp\revista-t4\assets\navidad.png` y `portada.png` (ambiente generado con IA) y `campus.png` (captura del campus anterior).
- Todas las `LEGADO\preview-*.png`, `LEGADO\tmp\flow-map-*.png` y `LEGADO\tmp\cartel-resenas\preview.png`: capturas o maquetas de la versión anterior.

---

## 6. Cumpleaños y aniversarios

- Los cumpleaños y aniversarios de la versión anterior son **ficticios**: el README los identifica como ejemplo y los aniversarios llevan `example:true`. **No se extraen.**
- Usaban nombres de personas posiblemente reales: Judith Calet, Jia Miao, Lluís Gómez y Christofer Raudales. Por eso esas fechas no deben trasladarse a ningún sitio.
- Un comentario de `dist\birthdays.js` dice que las fechas de noviembre y diciembre las facilitó FLM, lo que contradice al README. Ver dudas.
- La versión anterior generaba los aniversarios a partir de la fecha de incorporación guardada en cada cuenta. No hay ninguna fecha real de incorporación en la carpeta: la base local solo contiene semillas.

## 7. Contenido generado en la versión anterior (no reutilizar)

- Textos de formación, tests y resúmenes: 25 entradas con tests de tres preguntas en `dist\catalog.js` (22 formaciones y 3 basadas en notas); tests sectoriales de diez preguntas en `dist\sector-tests.js`; y rutas de aprendizaje en `dist\lesson-paths.js`.
- Textos de noticias:
  - Todos los cuerpos de `dist\news-seeds.js` y `dist\news-extra-seeds.js`.
  - La estructura editorial de `dist\news-structure.js`.
- Selección de lecturas recomendadas: `dist\library-books.js` contiene 12 obras reales de Lefebvre y CEF, pero la selección y las reseñas son de la versión anterior; no consta que FLM las aportara.
- Descripciones de eventos y anuncios, la noticia del desayuno (`renderMercantilNewsPage`) y los textos de la portada.
- Maquetas: newsletter BOICAC 147, revista T4 2026, cartel del concurso de reseñas, mapa del sitio y nota en `.docx`.
- Imágenes generadas (ver 5.6).
- Cumpleaños y aniversarios ficticios.

## 8. Dudas abiertas

1. **Formación en IA**:
   - El calendario original no está en la carpeta.
   - Faltan lugar, modalidad (¿presencial?), formador o proveedor y grupos de asistentes.
   - Confirmar que son 10 sesiones en total y que la del 25/11 por la tarde es una de ellas.
2. **Desayuno Mercantil**:
   - Completar o confirmar los marcadores de la p. 11 del PDF (canal de derivación y plazo de respuesta) antes de ofrecerlo como descarga.
   - Obtener el consentimiento de los asistentes que salen en la foto.
3. **Desayuno Fiscal**: fecha, hora, lugar y ponentes.
4. **Comida de Navidad**:
   - Falta la dirección.
   - Confirmar que el restaurante de la foto («Bilbao Berria… Catedral», imagen de internet sin licencia) es el mismo que «BILBAOBERRIA La Barra».
   - Faltan la hora de fin y a quién se confirma la asistencia.
5. **FLM Awards**: enlace real del formulario, fechas de votación y de entrega, y categorías.
6. **Concurso de reseñas**:
   - Las bases (premio de 1 día de vacaciones en 2027, 1 punto por reseña y correo de envío) solo constan en un cartel generado con un correo de ejemplo.
   - Hay dos enlaces de Google Maps distintos: ¿cuál es el oficial?
7. **Nueva web**:
   - Fecha real de lanzamiento.
   - Validar los datos de la captura: más de 100 años; sedes en Barcelona, Vic y Granollers.
8. **Newsletter**: fecha de la primera edición y responsable. El «Nº 01 T4 2026» es una maqueta generada.
9. **LinkedIn**: no hay URLs ni fechas de publicaciones. Hay que pedir a FLM las publicaciones que quiera destacar.
10. **PDF**:
    - «Novedades fiscales en Cataluña»: ¿es de FLM? No tiene marca y se creó el mismo día de la importación.
    - «Novedades campaña IS 2025»: emisor real («Delegació Catalana») y permiso para distribuirla.
    - Revista de AEDAF: derechos de difusión interna.
    - VERI*FACTU: ¿hay versión actualizada tras el anuncio de aplazamiento del 05/10/2026?
11. **Personas**:
    - Confirmar los cargos de Judith Calet y Lluís Gómez.
    - Confirmar si Jia Miao y Christofer Raudales son personal real.
    - Obtener el consentimiento para usar las fotos (Ángel María Ceniceros, Judith Calet, Joan Navarro y Lorena Ortiz).
    - Revisar las condiciones de licencia y el crédito de la sesión de raquelgrafic.com / Branding Consciente.
12. **Stock e iconos**: ninguna imagen de banco tiene licencia acreditada (incluido el icono del buzón). Sustituirlas o conseguir la licencia.
13. **Demo pública anterior**: según el README, `LEGADO\flm-campus-sites\` es una demostración pública. Incluye fotos de personas, el Radar interno, la revista de AEDAF y el stock sin licencia. Conviene comprobar si sigue en línea.
14. **Cumpleaños**: un comentario de `birthdays.js` dice que FLM facilitó las fechas, frente al README, que las da por ficticias. Confirmar que nunca se entregaron fechas reales.

## 9. Índice de rutas absolutas clave

- Datos de eventos (semillas): `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\campus-management.cjs`
- Sesiones de IA: `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\dist\agenda.js`
- Instantánea publicada de todos los datos: `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\flm-campus-sites\dist\public-data.js`
- Notas PDF: `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\dist\assets\notas\`
- PDF de formaciones: `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\dist\assets\formaciones\`
- Fotos y logos originales de FLM: `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\recursos\identidad-flm\`
- Buzón de sugerencias y logos de área: `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\FOTOS FLM RECURSOS\`
- Copias optimizadas: `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\dist\assets\company\`
- Retratos sueltos: `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\dist\assets\judith-calet.jpeg` y `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\dist\assets\angel.jpg`
- Stock (licencia desconocida): `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\recursos\fotos-stock\`
- Textos extraídos de PDF reales (útiles para búsqueda): `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\tmp\pdfs\` y `C:\Users\usuario\Documents\ChatGPT\FLM UNIVERSITY\tmp\boicac147\original.txt`

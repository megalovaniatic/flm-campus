# FLM Campus · Investigación 03 · Aprendizaje en línea basado en evidencias

> **Nota del 29/10/2026.** Informe conservado tal como se redactó. Después, a petición de la clienta, todas las formaciones del campus pasaron a ser voluntarias y el campus dejó de guardar fechas de incorporación. Por eso no se aplica lo que aquí se propone para las formaciones *obligatorias* (asignación por la administración, fecha límite, «Al día en obligatorias», recuento de pendientes e informe de compleción por persona y por departamento) ni el reconocimiento «Antigüedad · [n] años en FLM». Administración solo ve informes agregados y sin nombres: participación por formación y errores frecuentes por pregunta. El resto del modelo de aprendizaje (estados de cada formación, test final, evaluación sectorial y reconocimientos de aprendizaje y contribución) sigue vigente.

- **Entregable:** 03-aprendizaje
- **Fecha de verificación:** 28/10/2026 (Europe/Madrid)
- **Pregunta:** qué patrones de universidades e instituciones educativas de prestigio, respaldados por la investigación, deben guiar las formaciones cortas de FLM Campus para profesionales de asesoría fiscal, laboral, mercantil y contable.
- **Requisitos del brief que condicionan el diseño** (`C:\Users\usuario\Downloads\FLM_Campus_Design_Development_Brief_EN.md`, §7, §11, §12 y §14):
  - Cada formación incluye 2 o 3 resultados de aprendizaje, términos clave destacados, un ejemplo realista, apoyo visual, una idea clave y un test final.
  - El test final tiene 3 preguntas y se aprueba con **al menos 2/3**. Explica el razonamiento de las respuestas incorrectas, muestra la explicación correcta y permite otro intento.
  - La evaluación sectorial «Pon a prueba tus conocimientos» tiene 10 preguntas de dificultad media y se aprueba con **8/10**.
  - Hay que distinguir siempre entre *formación leída*, *test intentado*, *test superado* y *formación completada*.
  - Los reconocimientos deben ser «meaningful and professional».
  - Objetivo de accesibilidad WCAG 2.2 AA, con soporte para «movimiento reducido».

> **Método de verificación.** Las nueve experiencias de referencia se comprobaron el 28/10/2026 en la página oficial de cada institución o en su centro de ayuda, con WebFetch. Algunos sitios bloquean el acceso automatizado: FutureLearn, Khan Academy, Taylor & Francis, APA PsycNet, Springer, Cambridge y EUR-Lex. En esos casos se leyó el texto de la página con el navegador integrado de la aplicación.
>
> Los datos bibliográficos de las referencias (autores, año, título, revista, volumen, número y páginas) se cotejaron por DOI con los metadatos de Crossref. Los hallazgos que se atribuyen a cada estudio se contrastaron con su resumen en PubMed, ERIC o la página del editor. La normativa se consultó en el texto consolidado del BOE y en EUR-Lex.
>
> **Límites:**
> - Durante la sesión se agotó la cuota compartida de búsquedas web, por lo que algunas comprobaciones quedaron pendientes.
> - ScienceDirect exigió un CAPTCHA, que no se intentó resolver.
> - Algunos PDF no pudieron extraerse.
>
> Lo afectado por estos límites se marca como **NO VERIFICADO** o como *verificación parcial*. Los cálculos propios (probabilidades de acierto al azar, medias, umbrales) se señalan como tales.

---

## 1. Resumen ejecutivo

1. **Las nueve experiencias analizadas coinciden en seis patrones:**
   - **Resultados de aprendizaje explícitos al inicio.** Ejemplo: OpenLearn.
   - **Ciclos cortos de actividad.** En HBS Online hay una actividad cada 3–5 minutos.
   - **Aprender haciendo con feedback inmediato.** Ejemplos: CMU OLI y MITx.
   - **Separación entre «participación» y «logro»:**
     - OpenLearn distingue la *statement of participation* de la *badge*.
     - FutureLearn exige el 90 % de los pasos completados y un 70 % en los tests.
     - UNED Abierta distingue la insignia gratuita del certificado con ECTS.
   - **Progreso basado en rendimiento demostrado, no en tiempo.** Ejemplo: los niveles de dominio de Khan Academy.
   - **Feedback como herramienta de mejora.** Ejemplo: la evaluación continua y formativa de la UOC.
2. **La práctica de recuperación es la técnica con evidencia más sólida, junto con la práctica espaciada:**
   - Dunlosky et al. (2013) las califican de «alta utilidad», mientras que la relectura y el subrayado obtienen utilidad baja.
   - En el aula, los cuestionarios elevan el rendimiento con un efecto medio, g = 0,499 en 222 estudios (Yang et al., 2021).
   - La guía del IES (2007) asigna evidencia «fuerte» a usar cuestionarios para reexponer el contenido clave.
3. **El feedback funciona mejor cuando explica el porqué:**
   - El feedback de alta información (tarea y proceso) tiene d = 0,99, frente a 0,46 del correctivo simple (Wisniewski et al., 2020).
   - La explicación mejora la transferencia a preguntas nuevas (Butler et al., 2013).
   - El feedback centrado en la persona («¡muy bien!») es el menos eficaz (Hattie y Timperley, 2007). Más de un tercio de las intervenciones de feedback empeoraron el rendimiento (Kluger y DeNisi, 1996).
4. **Los ejemplos resueltos aceleran el aprendizaje de quien empieza, pero pueden ser redundantes para expertos** (efecto de reversión por pericia; Kalyuga et al., 2003). Por eso proponemos ejemplos con desvanecimiento y una «ruta rápida» para perfiles sénior.
5. **Diseño visual:** Mayer (2020) sistematiza 15 principios. Señalización y contigüidad están entre los de mayor beneficio en una metasíntesis de 29 revisiones y 1.189 estudios (Noetel et al., 2022). Se aplican así: términos clave en recuadro, figura junto al texto que explica y bloques cortos.
6. **Patrón de formación FLM** (§4):
   - 9 bloques y entre 6 y 10 minutos de lectura.
   - Test de 3 preguntas, aprobado con ≥ 2/3, con explicación de cada opción y reintento con variantes.
   - Evaluación sectorial de 10 preguntas que intercala las tres formaciones del área. Se aprueba con ≥ 8/10 y se repite tras 24 h con otra selección de preguntas.
7. **Estados medibles** (§5). Igual que SCORM 2004 y cmi5, separamos dos dimensiones: lectura y test.
   - **Leída** = todos los bloques vistos y tiempo activo ≥ 50 % del estimado, o confirmación manual.
   - **Test intentado** = al menos un envío completo.
   - **Test superado** = ≥ 2/3 en un intento.
   - **Completada** = leída **y** superada, equivalente a `CompletedAndPassed` de cmi5.
8. **Progreso sin infantilizar:**
   - Sin puntos, rachas ni clasificaciones.
   - Reconocimientos informativos con metadatos, según los elementos de la Recomendación europea sobre microcredenciales de 2022 y, opcionalmente, Open Badges 3.0.
   - Visibilidad privada por defecto y un «momento de reconocimiento» contenido.
9. **Normativa relacionada** (§6):
   - Según el RD 694/2017 (art. 3.2), las actividades de menos de dos horas no son «acciones formativas» a efectos de bonificación. Una formación corta de FLM no sería bonificable por sí sola.
   - El art. 23.3 ET reconoce 20 horas anuales de permiso retribuido de formación.
   - El seguimiento del progreso debe cumplir la minimización de datos del RGPD (art. 5.1.c).
10. **Pendiente o NO VERIFICADO** (§7): el criterio de «finalización» en teleformación de FUNDAE (Orden TAS/2307/2007), los requisitos completos de insignia de UNED Abierta y la duración exacta del *cold call* de HBS.

---

## 2. Experiencias de referencia (9 ejemplos verificados)

### 2.1 Tabla resumen

| # | Institución / experiencia | Patrón principal | Cómo lo adaptamos en FLM Campus |
|---|---|---|---|
| 1 | The Open University – OpenLearn | Resultados de aprendizaje explícitos. Distingue participación (lectura) de logro (cuestionario aprobado). Reintento con espera | Bloque «Al terminar, podrás…». Estados *Leída* y *Test superado* separados. Espera de 24 h solo en la evaluación sectorial |
| 2 | Carnegie Mellon – Open Learning Initiative (OLI) | Aprender haciendo con feedback inmediato y pistas. Datos por objetivo | Paso «¿Qué harías?» dentro del ejemplo. Informe de errores frecuentes por resultado de aprendizaje |
| 3 | Harvard Business School Online | Método del caso con protagonista real. Una actividad cada 3–5 min. Reflexión escrita | Ejemplo realista como caso de cliente. Interacción ligera por bloque. Sin temporizadores |
| 4 | MIT Open Learning / MITx | Fragmentación, andamiaje y ejemplos paso a paso. Práctica de bajo riesgo y autoevaluación periódica | Bloques de una idea. Ejemplo animado paso a paso. Pregunta de repaso espaciada |
| 5 | UOC | Modelo centrado en la actividad. Evaluación «continua y formativa» con retorno de mejora | Feedback como orientación, no como nota. Roles de autor y revisor |
| 6 | UNED Abierta | Cursos abiertos permanentes. Insignia gratuita frente a certificado con créditos ECTS | Dos niveles de reconocimiento: registro interno y reconocimiento con metadatos. Derecho a terminar lo empezado |
| 7 | FutureLearn (cursos de universidades socias) | Umbrales explícitos: 90 % de pasos marcados, todas las preguntas intentadas y ≥ 70 %. Certificado con horas para el desarrollo profesional continuo (CPD) | Criterios numéricos visibles. «Intentado» exige responder todas las preguntas. Carga en minutos en cada reconocimiento |
| 8 | Khan Academy | Aprendizaje para el dominio: niveles según el porcentaje de acierto y la evaluación mixta | Progreso por rendimiento demostrado. Evaluación sectorial intercalada. No rebajar registros profesionales |
| 9 | Coursera – Wharton (U. of Pennsylvania), *Introduction to Financial Accounting* | Cuestionarios de práctica por módulo, separados del examen final | Test por formación (práctica) frente a evaluación sectorial (logro) |

### 2.2 The Open University – OpenLearn

**Qué se ha verificado**

- La formación gratuita *Introduction to bookkeeping and accounting* (https://www.open.edu/openlearn/money-business/introduction-bookkeeping-and-accounting/content-section-overview):
  - Declara 8 horas de estudio y nivel introductorio.
  - Abre con una lista de cinco resultados de aprendizaje bajo el encabezado «After studying this course, you should be able to:». Los resultados usan verbos de acción, por ejemplo registrar transacciones por partida doble o preparar un balance de sumas y saldos, un balance de situación y una cuenta de pérdidas y ganancias.
  - Se estructura en tres secciones con subapartados numerados, una conclusión y «Next steps».
  - Ofrece una *statement of participation* gratuita.
- **Requisitos de la statement of participation** (https://www.open.edu/openlearn/get-started/frequently-asked-questions/understanding-statements-participation):
  - Es necesario estar inscrito y leer la introducción y la guía del curso.
  - Hay que leer cada página y enviar los cuestionarios que contenga. La página indica «Read every page of the course and submit any quizzes within it».
  - La barra de seguimiento llega al 100 % cuando todo está hecho.
  - No otorga crédito académico formal.
  - La página es del 01/02/2018 y advierte de que puede estar desactualizada.
- **Cursos con insignia** (*badged open courses*), por ejemplo *Multidisciplinary study: the value and benefits* (https://www.open.edu/openlearn/education-development/multidisciplinary-study-the-value-and-benefits/content-section-1):
  - Para obtener la insignia hay que leer cada sección y obtener **al menos un 50 %** en el cuestionario final.
  - La mayoría de las preguntas admite **tres intentos**; las de verdadero/falso, normalmente uno.
  - Si no se aprueba, el cuestionario completo puede repetirse **pasadas 24 horas**, sin límite de veces.
  - Las respuestas incorrectas suelen ir acompañadas de feedback y pistas.
- **Programa de insignias de la OU:**
  - La OU indica que hay más de 80 cursos con insignia y que algunos están avalados por otras organizaciones, entre ellas la CPD Standards Office (https://university.open.ac.uk/open-educational-resources/node/307, sin fecha visible).
  - Según la página de OpenLearn (publicada el 01/12/2015 y actualizada el 01/04/2024), la insignia se emite junto con la *statement of participation* y puede compartirse en LinkedIn (https://www.open.edu/openlearn/get-started/badges-come-openlearn-0).
  - Law (2015) describe el piloto de 2013 y la serie de 2014, evaluada con cuestionarios Moodle (https://doi.org/10.1080/02680513.2015.1104500).

**Patrones:** resultados de aprendizaje explícitos; secciones cortas numeradas; dos niveles de reconocimiento (participación frente a logro); reintento con espera; feedback con pistas.

**Adaptación en FLM Campus:**
- Bloque «Al terminar, podrás…» con 2–3 resultados.
- Separar *Leída* (participación) de *Test superado* (logro).
- Aplicar la espera de 24 h solo en la evaluación sectorial, que es la que otorga reconocimiento. En el test corto se usarán variantes de las preguntas (§4.4).

### 2.3 Carnegie Mellon University – Open Learning Initiative (OLI)

**Qué se ha verificado**

- **Página principal** (https://oli.cmu.edu/):
  - El estudiante aprende haciendo con práctica interactiva («Learn by doing»).
  - Recibe feedback inmediato en cada pregunta y dispone de pistas integradas.
  - Tiene objetivos de aprendizaje claros («clear learning goals»).
  - El profesorado ve datos en tiempo real para detectar lagunas.
- **Impacto declarado** (https://oli.cmu.edu/about/impact/): la página cita a Lovett, Meyer y Thille (2008). Según su resumen, los estudiantes de OLI-Statistics en modalidad híbrida cubrieron el temario de un semestre en la mitad de tiempo, con resultados iguales o mejores que con la enseñanza tradicional (https://doi.org/10.5334/2008-14).
- **Comunicado de CMU del 14/09/2015** (https://www.cmu.edu/news/stories/archives/2015/september/moocs-vs-oli.html). En un curso de introducción a la psicología:
  - Los alumnos solo-MOOC (18.645) obtuvieron un 57 % de media en el examen final, frente al 66 % de los alumnos MOOC + OLI (9.075).
  - La diferencia se mantuvo al ajustar por formación previa.
  - Cada actividad de «hacer» se asoció a unas seis veces más aprendizaje que cada vídeo visto o página leída.
- **Matiz del artículo original** (Koedinger et al., 2015, https://doi.org/10.1145/2724660.2724681): el beneficio de 1 desviación típica más de «hacer» es «more than six times» el de ver o leer. Los datos son **correlacionales**, aunque los autores aplican técnicas de inferencia causal.

**Patrones:** aprender haciendo; feedback inmediato y pistas; objetivos explícitos ligados a datos.

**Adaptación en FLM Campus:**
- En el ejemplo realista, antes de mostrar el último paso, se pregunta «¿Qué harías tú?». Es una interacción de un clic, sin nota, con feedback inmediato.
- El panel de administración muestra los errores frecuentes por resultado de aprendizaje.

### 2.4 Harvard Business School Online

**Qué se ha verificado**

- **Modelo general:** HBS Online presenta su enfoque como el método del caso de HBS llevado al entorno en línea, con escenarios reales de expertos y una comunidad de pares (https://online.hbs.edu/why-hbs-online).
- **Elementos interactivos** (artículo de Catherine Cote, 19/10/2023, https://online.hbs.edu/blog/post/interactive-online-learning):
  - Hay una actividad cada 3–5 minutos: reflexiones escritas, encuestas, preguntas de opción múltiple, ordenaciones y nubes de palabras.
  - La mayoría de las respuestas (reflexiones, valoraciones y ordenaciones) se comparten con la cohorte.
  - El alumno asume la perspectiva de un directivo ante un reto real y después ve cómo lo resolvió.
  - El *cold call* es una ventana emergente con temporizador.
- **Requisitos del certificado de *Financial Accounting*** (https://info.email.online.hbs.edu/certificate-of-completion-requirements-financial-accounting):
  - Siete módulos, cada uno con un cuestionario final, que deben completarse en sus plazos.
  - La media de cuestionarios debe ser **≥ 50 %**. Se descarta la nota más baja, pero no puede dejarse un módulo sin terminar.
  - Las respuestas deben escribirse con palabras propias; las de una sola palabra cuentan como participación incompleta.
- **Certificados:** cada curso da un *Certificate of Completion*, y tres cursos de un itinerario en 18 meses dan un *Certificate of Specialization* (https://online.hbs.edu/why-hbs-online/about-our-courses-and-programs).

**Patrones:** caso real con protagonista; interacción frecuente; reflexión escrita; cohorte con plazos.

**Adaptación en FLM Campus:**
- El ejemplo realista se plantea como un **caso de cliente** de la práctica diaria de FLM, con una decisión del asesor.
- Cada bloque admite como mucho una interacción ligera.
- **No adoptamos:**
  - Temporizadores, porque WCAG 2.2.1 «Timing Adjustable» (nivel A) exige poder desactivar, ajustar o ampliar los límites de tiempo (https://www.w3.org/TR/WCAG22/).
  - Respuestas públicas por defecto, por privacidad en una plantilla pequeña.
  - Plazos de cohorte.

### 2.5 MIT Open Learning / MITx

**Qué se ha verificado:** el artículo «A 'mind and hand' approach to online learning» (MIT Open Learning, 24/08/2023, https://openlearning.mit.edu/news/mind-and-hand-approach-online-learning) describe que los cursos MITx:
- se diseñan a partir de objetivos de aprendizaje;
- usan andamiaje y fragmentan ideas complejas en piezas más pequeñas;
- guían paso a paso con ejemplos;
- ofrecen práctica de bajo riesgo con feedback instantáneo;
- incluyen autoevaluaciones periódicas que funcionan como práctica de recuperación espaciada;
- incorporan ejercicios de reflexión y corrección entre pares con rúbricas.

El artículo apoya el enfoque de aprender haciendo en la investigación sobre el *doer effect*.

**Patrones:** fragmentación; ejemplo paso a paso; práctica de bajo riesgo con feedback; repaso periódico.

**Adaptación en FLM Campus:**
- Bloques de una sola idea.
- Ejemplo resuelto animado paso a paso (el brief pide «animated worked examples»), que avanza a ritmo del usuario.
- Una pregunta de repaso espaciada tras completar la formación (§4.7).

### 2.6 Universitat Oberta de Catalunya (UOC)

**Qué se ha verificado**

- **Modelo educativo según los graduados** (https://www.uoc.edu/es/estudios/acceso-matricula/modelo-educativo-graduados):
  - Está «centrado en la actividad de aprendizaje».
  - La evaluación es «continua y formativa» y ofrece retroalimentación para mejorar.
  - Intervienen tres perfiles docentes: profesor, profesor colaborador y tutor.
  - Usa metodologías como proyectos y aprendizaje basado en problemas.
- **Guía del estudiantado 2024-2025** (https://www.uoc.edu/estudiant/portal/guia_2024/es/com_estudia/avaluacio/index.html):
  - La evaluación continua se basa en actividades distribuidas a lo largo del semestre y exige resolver retos o actividades vinculados a competencias profesionales.
  - Se recibe retroalimentación con sugerencias de mejora, y el estudiante debe tener un papel activo ante ella.
  - En algunas asignaturas se complementa con una prueba de síntesis (máximo 1 h) o un examen (máximo 2 h), ambos en línea.

**Patrones:** actividad como eje; feedback orientado a la mejora; roles docentes diferenciados.

**Adaptación en FLM Campus:**
- Redactar el feedback como orientación («Revisa el bloque 2: …»), no como juicio.
- Separar los roles **Autor** y **Revisor/Administrador**, como pide el brief, para garantizar la revisión editorial del contenido jurídico y contable.

### 2.7 UNED Abierta

**Qué se ha verificado**

- **Plataforma:** el catálogo https://iedra.uned.es/ funciona sobre Open edX (© UNED Abierta) y muestra cursos con la etiqueta «Abierto permanentemente».
- **Normativa Interna de los Cursos en Línea, Masivos y Abiertos de UNED Abierta**, aprobada por el Consejo de Gobierno el 12/12/2025 y publicada en el BICI n.º 13, Anexo I, de 12/01/2026 (https://www.uned.es/universidad/dam/inicio/institucional/secretaria-general/normativa/13-Anexo-I-BICI_12012026-Normativa-Interna-de-los-Cursos-en-Línea,-Masivos-y-Abiertos-de-UNED-Abierta.pdf; copia en `research/downloads/03-aprendizaje-uned-normativa/`):
  - **Art. 5.1.** El acceso, la evaluación y la acreditación se realizan exclusivamente en línea.
  - **Art. 6.2.** Quien supera el curso puede obtener:
    - una insignia digital, gratuita y sin reconocimiento ECTS;
    - un certificado digital, con coste y con los créditos ECTS que correspondan.
  - **Art. 6.3.a.** Toda persona registrada tiene derecho a terminar la formación iniciada mientras el curso siga abierto.
- *Verificación parcial:* el texto se extrajo de una copia incompleta del PDF. No se pudieron leer los artículos 1–3, la equivalencia entre horas y ECTS ni los requisitos concretos para superar un curso (**NO VERIFICADO**).

**Patrones:** curso abierto permanente; dos niveles de acreditación; derecho a terminar.

**Adaptación en FLM Campus:**
- Diferenciar el **registro interno** (estado completada) del **reconocimiento** con metadatos (§5.5).
- Si una formación se actualiza o se archiva, quien la había empezado puede terminar la versión iniciada o recibe un aviso claro de los cambios.

### 2.8 FutureLearn

**Qué se ha verificado**

- **Requisitos del Certificate of Achievement** (centro de ayuda, actualizado «hace 1 mes» respecto al 28/10/2026, https://futurelearn.zendesk.com/hc/en-us/articles/115008376948):
  - completar el **90 % de los pasos** con el botón «Mark as complete»;
  - **intentar todas las preguntas** de los tests;
  - obtener una **puntuación global de al menos el 70 %**;
  - estar en una modalidad de pago o patrocinada.
- **Contenido del certificado:**
  - Indica la duración en semanas, las horas semanales y la puntuación media de los tests.
  - La página sugiere usarlo para justificar horas de desarrollo profesional continuo (CPD).
  - Aclara que no otorga créditos ni titulación universitaria.
- **Investigación:** Ferguson y Sharples (2014) analizaron 18 cursos de FutureLearn y sitúan el «aprendizaje conversacional a escala» entre los enfoques pedagógicos para grandes grupos (https://doi.org/10.1007/978-3-319-11200-8_8).

**Patrones:** umbrales numéricos explícitos; exigencia de intentar todas las preguntas; horas acreditadas.

**Adaptación en FLM Campus:**
- Mostrar al usuario los criterios exactos de cada estado (§5.1).
- Un intento solo cuenta si se han respondido todas las preguntas.
- Cada reconocimiento indica su carga en minutos.

### 2.9 Khan Academy

**Qué se ha verificado:** el artículo de ayuda «How do Khan Academy's Mastery levels work?» (actualizado «hace 3 años», https://support.khanacademy.org/hc/en-us/articles/5548760867853) define cinco niveles por destreza:

| Nivel | Cómo se alcanza |
|---|---|
| *Not Started* | Sin actividad |
| *Attempted* | Menos del 70 % de aciertos en un ejercicio |
| *Familiar* | Entre el 70 % y el 99 % |
| *Proficient* | El 100 % |
| *Mastered* | Estar en *Proficient* y acertar esa destreza en una evaluación mixta |

Los niveles **bajan** si se fallan preguntas en evaluaciones posteriores.

**Patrones:** aprendizaje para el dominio; progreso basado en rendimiento; evaluación mixta (intercalada) que consolida.

**Adaptación en FLM Campus:**
- El progreso se basa en lo demostrado, no en el tiempo conectado.
- La evaluación sectorial mezcla las tres formaciones del área.
- **No rebajamos** un estado ya conseguido, porque es un registro profesional. En su lugar mostramos un aviso de «repaso recomendado» (§5.2).

### 2.10 Coursera – Wharton (University of Pennsylvania), *Introduction to Financial Accounting*

**Qué se ha verificado:** la página del curso (https://www.coursera.org/learn/wharton-accounting) muestra:
- 4 módulos, 29 vídeos, 20 lecturas y 10 tareas, con un *Practice Quiz* en cada módulo, deberes y un *Learning check-in*;
- un examen final en dos partes;
- una dedicación de unas 2 semanas a 10 h/semana.

Los vídeos duran unos 15 minutos de media (cálculo propio: 426 min / 29 vídeos).

**Patrones:** práctica separada de la evaluación sumativa; examen final integrador.

**Adaptación en FLM Campus:**
- El test de cada formación tiene función formativa y la evaluación sectorial, función acreditativa.
- Nuestros bloques serán bastante más cortos que estos vídeos (§3.4).

**Nota complementaria (no universitaria).** *Learning How to Learn* (Coursera; socio Deep Teaching Solutions; B. Oakley y T. Sejnowski; 4.197.481 inscritos el 28/10/2026, https://www.coursera.org/learn/learning-how-to-learn) enseña a adultos técnicas como la práctica de recuperación, la repetición espaciada y el *chunking*, e incluye cuestionarios de práctica de recuperación. Puede inspirar una minipieza de bienvenida, «Cómo sacar partido a FLM Campus».

---

## 3. Evidencia de investigación

### 3.1 Práctica de recuperación (efecto test)

- **Roediger y Karpicke (2006)** (https://doi.org/10.1111/j.1467-9280.2006.01693.x):
  - Los participantes estudiaron textos en prosa y después hicieron pruebas de recuerdo o los volvieron a estudiar.
  - A los 5 minutos rendía más volver a estudiar. A los 2 días y a la semana, haber hecho pruebas producía una retención sustancialmente mayor.
  - Releer aumentaba la confianza de los participantes, aunque en las pruebas diferidas recordaran menos.
- **Karpicke y Roediger (2008)** (https://doi.org/10.1126/science.1152408): una vez aprendido un elemento, seguir estudiándolo no mejoró el recuerdo diferido, pero seguir recuperándolo tuvo un gran efecto positivo. Las predicciones de los estudiantes sobre su rendimiento no se correlacionaban con el rendimiento real.
- **Metaanálisis y revisiones:**
  - Las pruebas de recuerdo producen beneficios mayores que las de reconocimiento (Rowland, 2014, https://doi.org/10.1037/a0037559).
  - Los tests de práctica superan a la relectura y a todas las demás condiciones de comparación (Adesope et al., 2017, https://doi.org/10.3102/0034654316689306).
  - En el aula, con 222 estudios y 48.478 estudiantes, el efecto es medio (g = 0,499) y depende, entre otros factores, del feedback correctivo y del número de repeticiones (Yang et al., 2021, https://doi.org/10.1037/bul0000309).
  - En contextos educativos reales, el 57 % de los efectos fueron medios o grandes (Agarwal et al., 2021, https://doi.org/10.1007/s10648-021-09595-9).
- **Comparación de técnicas** (Dunlosky et al., 2013, https://doi.org/10.1177/1529100612453266):
  - Los tests de práctica y la práctica distribuida son las técnicas de **utilidad alta**.
  - Resumir, subrayar, la palabra clave mnemotécnica, las imágenes mentales y la relectura son de **utilidad baja**.
  - Los autores recomiendan explícitamente practicar con tests en lugar de releer.
- **Guía del IES (Pashler et al., 2007, https://ies.ed.gov/ncee/wwc/PracticeGuide/1):**
  - Usar cuestionarios para reexponer el contenido clave tiene evidencia **fuerte**.
  - Usar preguntas previas para introducir un tema tiene evidencia **mínima**.
- **Efecto del pretest:** aunque se falle, intentar responder antes de estudiar mejoró el aprendizaje posterior en cinco experimentos (Richland, Kornell y Kao, 2009, https://doi.org/10.1037/a0016496).

**Implicaciones para FLM:**
- El test final se presenta como **parte del aprendizaje**, no como control.
- Las preguntas de aplicación con caso son preferibles a las de reconocimiento literal.
- La pregunta inicial «¿Qué harías tú?» es **opcional y no puntúa**, porque su evidencia aplicada es menor.

### 3.2 Feedback

- **Hattie y Timperley (2007)** (https://doi.org/10.3102/003465430298487) proponen un modelo de feedback:
  - Tres preguntas: hacia dónde voy, cómo voy y qué sigue.
  - Cuatro niveles: tarea, proceso, autorregulación y persona.
  - En la descripción de Wisniewski et al. (2020): «the least effective is self or praise feedback».
- **Wisniewski, Zierer y Hattie (2020)** (https://doi.org/10.3389/fpsyg.2019.03087):
  - Con 435 estudios y más de 61.000 participantes, el efecto medio del feedback es d = 0,48.
  - Depende sobre todo de la información que transmite:
    - refuerzo o castigo, d = 0,24;
    - feedback correctivo, d = 0,46;
    - **feedback de alta información** (tarea y proceso), **d = 0,99**.
- **Kluger y DeNisi (1996)** (https://doi.org/10.1037/0033-2909.119.2.254): el feedback mejoró el rendimiento de media (d = 0,41), pero **más de un tercio** de las intervenciones lo empeoró. La eficacia disminuye cuanto más se desplaza la atención de la tarea hacia la persona.
- **Shute (2008)** (https://doi.org/10.3102/0034654307313795): el feedback formativo debe ser no evaluativo, de apoyo, oportuno y específico.
- **Feedback en tests de opción múltiple:**
  - Sin feedback, los distractores pueden dejar conocimiento erróneo. El feedback, inmediato o diferido, aumenta las respuestas correctas y reduce esas intrusiones (Butler y Roediger, 2008, https://doi.org/10.3758/MC.36.3.604).
  - Explicar por qué la respuesta es correcta da el mismo resultado que dar solo la respuesta en las preguntas repetidas, pero **mejora la transferencia** a preguntas de inferencia nuevas (Butler, Godbole y Marsh, 2013, https://doi.org/10.1037/a0031026).
  - En otro estudio, el feedback diferido superó al inmediato, y «responder hasta acertar» rindió igual que mostrar la respuesta (Butler, Karpicke y Roediger, 2007, https://doi.org/10.1037/1076-898X.13.4.273).

**Implicaciones para FLM:**
- Cada opción de cada pregunta tiene su propia explicación, que incluye:
  - por qué es incorrecta;
  - cuál es la regla correcta y su fuente, con un enlace al BOE con ancla;
  - qué bloque repasar.
- El feedback se muestra al enviar las tres respuestas, con un ligero diferimiento dentro del intento.
- El tono se centra en la tarea, sin elogios a la persona.

### 3.3 Ejemplos resueltos, escenarios y pericia

- **Ejemplos resueltos frente a resolución de problemas** (Sweller y Cooper, 1985, https://doi.org/10.1207/s1532690xci0201_3): estudiar ejemplos resueltos requirió menos tiempo que resolver problemas, y después los problemas de la misma estructura se resolvieron más rápido y con menos errores.
- **Principios de diseño:** Atkinson, Derry, Renkl y Wortham (2000, https://doi.org/10.3102/00346543070002181) los sistematizan.
- **Desvanecimiento** (Renkl y Atkinson, 2003, https://doi.org/10.1207/S15326985EP3801_3): los ejemplos funcionan mejor al principio y la resolución de problemas, en fases posteriores. Proponen integrar pasos a resolver por el alumno de forma progresiva (*fading*).
- **Reversión por pericia:**
  - Técnicas muy eficaces con principiantes pueden perder eficacia o ser contraproducentes con alumnos experimentados (Kalyuga et al., 2003, https://doi.org/10.1207/S15326985EP3801_4).
  - Kalyuga (2007) desarrolla sus implicaciones para adaptar la instrucción al alumno (https://doi.org/10.1007/s10648-007-9054-3).
- **Ejemplos ilustrativos** (Rawson, Thomas y Jacoby, 2015, https://doi.org/10.1007/s10648-014-9273-3):
  - Mejoran el aprendizaje de conceptos declarativos, es decir, términos con definición breve, con d entre 0,74 y 1,67.
  - Influye cómo se intercalan los ejemplos de conceptos distintos y si se presentan junto a la definición.
- **Guía del IES:** intercalar ejemplos resueltos con problemas y conectar lo abstracto con lo concreto tienen evidencia **moderada**.
- **Primeros principios de Merrill** (2002, https://doi.org/10.1007/BF02505024): se aprende mejor resolviendo problemas reales, activando lo que ya se sabe, viendo una demostración, aplicando y luego integrando lo aprendido en la propia práctica.
- **Aprender haciendo:** Koedinger et al. (2015) y Lovett et al. (2008), ya citados en §2.3.

**Implicaciones para FLM:**
- El ejemplo realista es un **caso de cliente resuelto paso a paso**. El último paso lo decide el usuario («¿Qué harías tú?») antes de ver la solución.
- Para perfiles sénior se ofrece una **ruta rápida** («¿Ya dominas el tema? Ve al test»). Ver §5.2 para su efecto en el estado.
- La idea clave termina con «Cómo aplicarlo con un cliente».

### 3.4 Principios multimedia y diseño visual

- **Mayer (2020), *Multimedia Learning*, 3.ª ed.** (https://doi.org/10.1017/9781316941355; índice consultado en Cambridge): revisa 15 principios basados en más de 200 experimentos, organizados en tres grupos.

| Objetivo | Principios |
|---|---|
| Reducir el procesamiento superfluo | Coherencia, señalización, redundancia, contigüidad espacial y contigüidad temporal |
| Gestionar el procesamiento esencial | Segmentación, preentrenamiento y modalidad |
| Fomentar el procesamiento generativo | Personalización, voz, imagen, corporeización, inmersión y actividad generativa |

A estos 14 se suma el principio multimedia, que el libro trata aparte (capítulo 5).

- **Mayer y Moreno (2003)** (https://doi.org/10.1207/S15326985EP3801_6) parten de tres supuestos: un canal verbal y otro visual, capacidad limitada de cada canal y procesamiento activo. A partir de ellos proponen formas de evitar la sobrecarga.
- **Noetel et al. (2022)** (https://doi.org/10.3102/00346543211052329), con 29 revisiones, 1.189 estudios y 78.177 participantes:
  - 11 principios muestran efectos positivos significativos.
  - Los mayores beneficios corresponden a los subtítulos en vídeos en segunda lengua, la contigüidad y la **señalización**.
  - Hay evidencia robusta para modalidad, animación, coherencia, **segmentación** y **personalización**, entre otros.
  - El buen diseño importa más con materiales complejos y en entornos de ritmo marcado por el sistema que en los de ritmo propio.
- **Duración de los segmentos:**
  - Con 6,9 millones de sesiones en edX, los vídeos más cortos resultaron mucho más atractivos (Guo, Kim y Rubin, 2014, https://doi.org/10.1145/2556325.2566239).
  - UC San Diego advierte de que la cifra de «6 minutos» procede de MOOC y se ha sobreinterpretado. Recomienda vídeos lo más cortos posible, con un único microobjetivo (https://multimedia.ucsd.edu/best-practices/video-length.html).
- **Guía del IES:** combinar gráficos con descripciones verbales tiene evidencia **moderada**.
- **Distinción importante:** el subrayado que hace el alumno es de utilidad baja (Dunlosky et al., 2013). Los **términos clave destacados por el diseñador** se apoyan en los principios de señalización y preentrenamiento.

**Implicaciones para FLM:**
- Bloques de una sola idea con encabezados informativos.
- Recuadro de términos clave antes de su primer uso.
- Figuras junto al texto que las explica, nunca en una pestaña aparte.
- Sin imágenes decorativas dentro del contenido de aprendizaje.
- Tono cercano y profesional, de tú.
- Ejemplos animados que avanzan a ritmo del usuario («Siguiente paso»).

### 3.5 Práctica espaciada e intercalada

- **Cepeda et al. (2006)** (https://doi.org/10.1037/0033-2909.132.3.354): con 317 experimentos, el intervalo entre sesiones que maximiza la retención crece a medida que aumenta el plazo hasta la prueba.
- **Cepeda et al. (2008)** (https://doi.org/10.1111/j.1467-9280.2008.02209.x): con más de 1.350 participantes, el intervalo óptimo pasa de cerca del 20–40 % del plazo hasta la prueba, cuando esta es a una semana, a cerca del 5–10 %, cuando es a un año.
- **Latimier, Peyre y Ramus (2021)** (https://doi.org/10.1007/s10648-020-09572-8): espaciar la práctica de recuperación es claramente mejor que concentrarla (g = 0,74). No se encontró diferencia entre intervalos crecientes y uniformes.
- **Educación espaciada en profesionales** (Kerfoot et al., 2007, https://doi.org/10.1111/j.1365-2929.2006.02644.x): en un ensayo aleatorizado con estudiantes de medicina, los casos con pregunta y explicación enviados semanalmente por correo mejoraron la retención a final de curso. Los tamaños de efecto fueron 1,01 y 0,73 en los grupos con más tiempo transcurrido.
- **Guía del IES:** espaciar el aprendizaje tiene evidencia **moderada**.
- **Revisión tutorial** (Weinstein, Madan y Sumeracki, 2018, https://doi.org/10.1186/s41235-017-0087-y): resume seis estrategias con apoyo sólido: práctica espaciada, intercalado, recuperación, elaboración, ejemplos concretos y codificación dual.

**Implicaciones para FLM:**
- Una pregunta de repaso a las **3–5 semanas** de completar cada formación. Cálculo propio: entre el 5 % y el 10 % de un horizonte de retención de un año (18–37 días), según Cepeda et al. (2008).
- La evaluación sectorial **intercala** preguntas de las tres formaciones del área.

### 3.6 Resultados de aprendizaje y alineamiento

- **Taxonomía de Bloom revisada** (Krathwohl, 2002, https://doi.org/10.1207/s15430421tip4104_2):
  - Clasifica los objetivos en dos dimensiones: proceso cognitivo y tipo de conocimiento.
  - Las seis categorías del proceso cognitivo, según la revisión de Anderson y Krathwohl (2001), son recordar, comprender, aplicar, analizar, evaluar y crear.
  - *Verificación parcial:* el texto completo del artículo no fue accesible. Las seis categorías se contrastaron con una fuente secundaria (https://en.wikipedia.org/wiki/Bloom%27s_taxonomy).
- **Alineamiento constructivo** (Biggs, 1996, https://doi.org/10.1007/BF00138871): los objetivos se formulan como desempeños, y las actividades y la evaluación se alinean con ellos.
- **Manual europeo de Cedefop** *Defining, writing and applying learning outcomes* (2017, DOI 10.2801/566770; 2.ª edición en junio de 2022, https://www.cedefop.europa.eu/en/publications/4156): es la referencia europea para redactar resultados de aprendizaje.
- **Recomendación del Consejo de la UE sobre microcredenciales** (16/06/2022, 2022/C 243/02, DO C 243 de 27/06/2022, p. 10, https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32022H0627(02)): los resultados del aprendizaje son uno de los **elementos obligatorios** para describir una microcredencial (Anexo I).

**Implicaciones para FLM:**
- Entre 2 y 3 resultados por formación, con verbos de acción del nivel *aplicar* o *analizar*, por ejemplo: «Identificar si un cliente debe derivarse al departamento Mercantil».
- **Cada pregunta del test se vincula a un resultado** (R1, R2, R3).

### 3.7 Motivación, progreso y reconocimiento

- **Teoría de la autodeterminación** (Ryan y Deci, 2000, https://doi.org/10.1037/0003-066X.55.1.68): la motivación aumenta cuando se satisfacen tres necesidades: competencia, autonomía y relación con los demás.
- **Recompensas y motivación intrínseca** (Deci, Koestner y Ryan, 1999, https://doi.org/10.1037/0033-2909.125.6.627). Metaanálisis de 128 estudios:
  - Las recompensas condicionadas a participar, completar o rendir **redujeron** la motivación intrínseca de libre elección (d = −0,40, −0,36 y −0,28).
  - El **feedback positivo informativo la aumentó** (d = 0,33 en conducta de libre elección y 0,31 en interés declarado).
- **Gamificación** (Sailer y Homner, 2020, https://doi.org/10.1007/s10648-019-09498-w):
  - Efectos pequeños pero significativos en resultados cognitivos (g = 0,49), motivacionales (g = 0,36) y conductuales (g = 0,25).
  - Solo el efecto cognitivo se mantuvo estable en los estudios de mayor rigor.

**Implicaciones para FLM:**
- Los reconocimientos son **informativos**: certifican una competencia con criterios y fecha.
- No son premios controladores: ni puntos, ni rankings entre compañeros, ni rachas con pérdida.
- El feedback habla de la tarea, no de la persona (§5.4).

### 3.8 Diseño de preguntas

- **Pautas de redacción** (Haladyna, Downing y Rodriguez, 2002, https://doi.org/10.1207/S15324818AME1503_5): validaron una taxonomía de 31 pautas para redactar preguntas de opción múltiple en evaluación de aula. *Solo se verificó el resumen; el detalle de cada pauta no se ha comprobado.*
- **Número de opciones** (Rodriguez, 2005, https://doi.org/10.1111/j.1745-3992.2005.00006.x): tras 80 años de investigación, **tres opciones** son óptimas. Permiten más preguntas por unidad de tiempo sin perjudicar la calidad psicométrica.
- **Acierto al azar** (cálculo propio, distribución binomial):

| Prueba | Con 3 opciones | Con 4 opciones |
|---|---|---|
| Test de 3 preguntas, aprobado con ≥ 2 aciertos | 7/27 ≈ **25,9 %** | 10/64 ≈ **15,6 %** |
| Evaluación de 10 preguntas, aprobado con ≥ 8 aciertos | 201/59.049 ≈ **0,34 %** | 436/1.048.576 ≈ **0,04 %** |

**Implicaciones para FLM:**
- El test de 3 preguntas es **formativo**, porque el umbral de 2/3 admite acierto por azar.
- Lo que acredita es la evaluación sectorial.
- Usaremos 3 opciones por defecto y 4 solo si existe un cuarto distractor realmente plausible, tomado de un error real de la práctica.

### 3.9 Aprendizaje para el dominio

- **Bloom (1984)** (https://doi.org/10.3102/0013189X013006004) plantea el «problema de las 2 sigmas»: buscar métodos de enseñanza en grupo tan eficaces como la tutoría individual. Entre otras vías, analiza el aprendizaje para el dominio.
- **Kulik, Kulik y Bangert-Drowns (1990)** (https://doi.org/10.3102/00346543060002265): en 108 evaluaciones controladas, los programas de dominio tuvieron efectos positivos en el rendimiento en exámenes.

**Implicación para FLM:** el ciclo es test, feedback correctivo y nuevo intento hasta superar el test. Es el mismo ciclo que siguen Khan Academy y OpenLearn.

### 3.10 Síntesis: patrón, evidencia y aplicación

| Patrón del brief | Evidencia principal | Fuerza | Aplicación en FLM Campus |
|---|---|---|---|
| Resultados de aprendizaje claros | Biggs 1996; Krathwohl 2002; Cedefop 2017; Recomendación UE 2022 | Marco consolidado (normativo y teórico) | 2–3 resultados con verbo de acción, cada uno vinculado a preguntas |
| Módulos cortos | Mayer 2020 (segmentación); Noetel 2022; Guo 2014 | Robusta (metasíntesis) | Bloques de 150–350 palabras con una idea cada uno |
| Ejemplos resueltos | Sweller y Cooper 1985; Atkinson 2000; Renkl y Atkinson 2003; IES rec. 2 | Moderada según IES | Caso de cliente paso a paso con el último paso para el usuario |
| Escenarios prácticos | Merrill 2002; Koedinger 2015; Lovett 2008; IES rec. 4 | Moderada; datos correlacionales sólidos | Introducción con caso; preguntas de aplicación |
| Práctica de recuperación | Roediger y Karpicke 2006; Yang 2021; Agarwal 2021; IES rec. 5b | **Fuerte** | Test final y repaso espaciado |
| Feedback constructivo | Hattie y Timperley 2007; Wisniewski 2020; Butler 2013; Shute 2008 | **Fuerte** (alta información, d = 0,99) | Explicación por opción con fuente y bloque a repasar |
| Progreso visible | Khan Academy; FutureLearn; Deci 1999; Ryan y Deci 2000 | Práctica institucional y teoría motivacional | Estados por criterios; reconocimientos informativos |
| Espaciado e intercalado | Cepeda 2006 y 2008; Latimier 2021; Kerfoot 2007; IES rec. 1 | Moderada a fuerte | Repaso a las 3–5 semanas; evaluación sectorial intercalada |

---

## 4. Patrón de formación FLM

### 4.1 Principios

1. **Una formación responde a una pregunta profesional real.** Por ejemplo: «¿Cuándo derivo un cliente a Mercantil?».
2. **Se aprende haciendo.** Al menos una decisión del usuario antes del test.
3. **Cada resultado de aprendizaje está alineado con al menos una pregunta.**
4. **Explicamos siempre el porqué, con su fuente.** Artículo exacto y enlace con ancla.
5. **Breve no significa superficial.** Lo que no ayuda a cumplir un resultado se elimina, siguiendo el principio de coherencia.
6. **Nada depende de un temporizador ni del color.** Todo funciona con teclado, en el móvil y con el movimiento reducido activado.
7. **El progreso es privado y profesional.**

### 4.2 Anatomía de una formación (9 bloques)

| # | Bloque | Propósito | Extensión orientativa | Base | Notas de interfaz y movimiento |
|---|---|---|---|---|---|
| 0 | **Cabecera** | Título; área; autor (nombre, cargo, foto o iniciales); revisor; «Publicada el 12/11/2026 · Actualizada el 03/02/2027» en una sola línea; «Lectura 8 min · Test 3 preguntas»; estado | — | Brief §7 | El estado se muestra con chip de texto, no solo con color |
| 1 | **Introducción práctica** | Situación de cliente en 2–4 líneas y por qué importa. Opcional: «¿Qué harías tú?» en un clic, sin nota | 60–120 palabras | Merrill 2002; Richland 2009 (pretest) | La respuesta opcional no se guarda en el historial |
| 2 | **Al terminar, podrás…** | 2–3 resultados con verbo de acción y contexto | 1 línea por resultado | Biggs 1996; Krathwohl 2002; OpenLearn | Cada resultado lleva una etiqueta R1, R2 o R3, reutilizada en el feedback |
| 3 | **Bloques de contenido** (3–5) | Una idea por bloque con encabezado informativo | 150–350 palabras por bloque | Mayer (segmentación, señalización); HBS 3–5 min | La barra de progreso de lectura avanza por bloques vistos |
| 4 | **Términos clave** (recuadro) | Definir antes de usar | 3–6 términos de 1–2 líneas | Mayer (preentrenamiento); Rawson 2015 | En el texto, el término se despliega al tocarlo. Nada depende de pasar el ratón |
| 5 | **Ejemplo realista** | Caso resuelto paso a paso con cifras, fechas y plazos verificados. El último paso lo decide el usuario | 3–6 pasos | Sweller y Cooper 1985; Renkl y Atkinson 2003; HBS; OLI | «Siguiente paso» a ritmo del usuario. Con movimiento reducido, el contenido aparece sin animación |
| 6 | **Apoyo visual** | Cronograma (plazos), tabla comparativa, desglose de cálculo o diagrama de decisión | 1–2 figuras | Mayer (contigüidad); IES rec. 3; Noetel 2022 | Pie de figura y texto alternativo (WCAG 1.1.1). Contraste AA (1.4.3 y 1.4.11) |
| 7 | **Idea clave** | 1–3 frases para recordar, más «Cómo aplicarlo con un cliente» (1–3 acciones). Opcional: «Pregunta para pensar» de tipo *por qué* | ≤ 80 palabras | Merrill (integración); IES rec. 7 (preguntas explicativas profundas, evidencia **fuerte**) | Recuadro final. Su visualización marca el fin de la lectura |
| 8 | **Fuentes y verificación** | Norma con enlace al BOE con ancla, BOICAC o resolución, con fecha de verificación | Lista breve | Brief §7 | Enlaces externos identificados como tales |
| 9 | **Test final** | 3 preguntas (§4.4) | 2–4 min | §3.1, §3.2, §3.8 | Feedback claro y sin temporizador |

**Extensión total recomendada:** entre 1.200 y 2.000 palabras, unos 6–10 minutos (§4.6). Si un tema necesita más, se divide en dos formaciones encadenadas.

### 4.3 Plantilla de autoría (lista de comprobación del revisor)

- [ ] El título responde a una pregunta profesional o a una tarea concreta.
- [ ] La introducción presenta una situación de cliente realista, sin datos personales reales.
- [ ] Hay 2–3 resultados con verbo de acción. Cada resultado tiene **al menos 2 preguntas** en el banco: la original y una variante.
- [ ] Cada bloque tiene una sola idea y un encabezado informativo, con un máximo de unas 350 palabras.
- [ ] Los términos clave están definidos antes de usarse e incluyen su referencia normativa.
- [ ] Las cifras, plazos y tipos del ejemplo y de las figuras tienen fuente y fecha de verificación.
- [ ] Cada opción de cada pregunta tiene su explicación: por qué es o no correcta, la fuente y el bloque a repasar.
- [ ] Las figuras tienen texto alternativo y el contraste es AA.
- [ ] Hay una nota de cambios si la formación es una actualización sustancial (§5.2).
- [ ] La ha revisado una segunda persona del área, distinta del autor, antes de publicarse.

### 4.4 Test final (3 preguntas · aprobado con ≥ 2/3)

**Reglas**

1. **Una pregunta por resultado de aprendizaje.** Con 2 resultados, la tercera pregunta integra ambos.
2. **Formato de aplicación:** un escenario breve más 3 opciones (4 si hay un distractor plausible). Las opciones son homogéneas y los distractores proceden de errores reales de la práctica (§3.8).
3. **Sin límite de tiempo** (WCAG 2.2.1). Una pregunta por pantalla en el móvil y las tres seguidas en el escritorio.
4. **Envío completo:** solo se puede enviar con las 3 preguntas respondidas, igual que FutureLearn exige intentar todas.
5. **Feedback al enviar:**
   - Resultado global, por ejemplo «2 de 3 · Superado».
   - Para cada pregunta: qué has respondido, si es correcta, **por qué la opción elegida no lo es** (brief), la explicación de la correcta con su fuente y el enlace al bloque.
   - Las preguntas falladas aparecen primero.
6. **Reintento inmediato e ilimitado.** En las preguntas falladas se usa **otra variante** del mismo resultado. Si no hay variante, se repite la pregunta con las opciones reordenadas y se marca para que el autor añada una. Repetir exactamente las mismas preguntas tras ver la solución no comprueba nada.
7. **Una vez superado, el test sigue superado.** Puede practicarse de nuevo en modo «Practicar», sin efecto en el estado.
8. **Registro:**
   - El **primer intento** sirve para diagnóstico e informes de errores frecuentes.
   - Se guarda el **mejor resultado** y el historial de intentos es visible solo para el empleado y la administración (§5.6).

**Ejemplo ilustrativo del formato** (área Laboral, nivel *aplicar*). Sirve solo para mostrar el patrón; la versión final debe pasar la revisión editorial del área.

> **Situación.** Marta lleva 8 meses en la plantilla de un cliente. Pregunta si puede usar el permiso retribuido de formación del artículo 23.3 del Estatuto de los Trabajadores para un curso relacionado con su puesto. ¿Qué le indicamos?
>
> - **A.** Sí: le corresponden 20 horas retribuidas este año.
> - **B.** Todavía no: el permiso exige al menos un año de antigüedad en la empresa. *(correcta)*
> - **C.** Sí, y además puede acumular las horas de los próximos cinco años.
>
> **Feedback si elige A:** «No es correcta. Las 20 horas anuales existen, pero solo para quien tiene al menos un año de antigüedad, y Marta lleva 8 meses. Repasa el bloque 2.»
>
> **Feedback si elige C:** «No es correcta. El art. 23.3 permite acumular las horas por un periodo de hasta cinco años, pero no elimina el requisito de un año de antigüedad, que Marta aún no cumple.»
>
> **Explicación de la correcta:** «Correcta. El art. 23.3 ET reconoce un permiso retribuido de veinte horas anuales de formación profesional para el empleo, vinculada a la actividad de la empresa, a quien tenga al menos un año de antigüedad. Las horas son acumulables por un periodo de hasta cinco años. Fuente: https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a23 (texto consolidado, última actualización publicada el 21/10/2026).»

### 4.5 Evaluación sectorial «Pon a prueba tus conocimientos» (10 preguntas · aprobado con 8/10)

**Composición**
- 3 preguntas de cada una de las 3 formaciones del área más 1 de integración entre formaciones.
- Las preguntas se presentan **intercaladas**, no agrupadas por formación (§3.5; evaluación mixta de Khan Academy).

**Dificultad media**
- Escenarios de aplicación y análisis, no definiciones literales.
- **Regla práctica propuesta, no normativa:** tras los 15–20 primeros intentos, revisar las preguntas con un acierto en primer intento superior al 90 % (demasiado fáciles) o inferior al 40 % (difíciles o ambiguas).
- Con unos 50 empleados, estos datos son orientativos.

**Banco de preguntas y repetición**
- Banco mínimo de **20 preguntas por área**, para que cada intento tenga una selección distinta.
- Si no se aprueba, puede repetirse **a partir de 24 horas** con otra selección. Es la misma pauta que siguen los cuestionarios con insignia de OpenLearn (§2.2) y aprovecha el espaciado.
- El mensaje indica la fecha y hora exactas en horario de Europe/Madrid.

**Resultados y acceso**
- Al terminar se muestra el resultado global, el detalle **por formación y por resultado de aprendizaje** (feedback de alta información, §3.2) y las formaciones recomendadas para repasar.
- Está disponible en cualquier momento, también como diagnóstico. Se recomienda hacerla después de completar las tres formaciones del área.
- Superarla genera el reconocimiento «Evaluación sectorial superada · [Área]» (§5.5).

**Protección frente al azar:** con 3 opciones, aprobar con 8/10 respondiendo al azar tiene una probabilidad del 0,34 % (cálculo propio, §3.8).

### 4.6 Tiempo estimado de lectura

- **Referencia:** en inglés, la lectura silenciosa de no ficción va a unas 238 palabras/min de media, con un rango habitual de 175–300. La velocidad varía entre idiomas según cuántas palabras necesita cada uno para el mismo mensaje (Brysbaert, 2019, https://doi.org/10.1016/j.jml.2019.104047; resumen consultado en https://bibbase.org/network/publication/brysbaert-howmanywordsdowereadperminuteareviewandmetaanalysisofreadingrate-2019).
- **Supuesto de diseño prudente (no es un dato publicado):** **200 palabras/min** para texto técnico-jurídico en castellano, más unos 30 segundos por figura o tabla compleja. El resultado se redondea al minuto superior.
- **Calibración:** a partir de 20 lecturas completadas, ajustar la estimación a la mediana real de la formación.
- **Formato:** «Lectura 8 min · Test 3 preguntas».

### 4.7 Repaso espaciado

- Entre **3 y 5 semanas** después de completar una formación, el campus propone en la página de inicio personal **una pregunta de repaso**: una variante no vista, con explicación (§3.5).
- No cambia ningún estado. Si se falla, sugiere el bloque que conviene releer.
- Lleva una etiqueta discreta, «Repaso disponible», y puede desactivarse en el perfil, por respeto a la autonomía.

### 4.8 Accesibilidad y movimiento

- Objetivo **WCAG 2.2 AA**. La W3C Recommendation vigente es la del 12/12/2024 (https://www.w3.org/TR/WCAG22/).
- **Sin límites de tiempo** en tests (2.2.1).
- Texto alternativo en las figuras (1.1.1), contraste AA (1.4.3 y 1.4.11) y encabezados y etiquetas descriptivos (2.4.6).
- El feedback del test combina icono, texto y color. El foco pasa al resumen de resultados y se anuncia en una región *aria-live*.
- Con `prefers-reduced-motion`, los ejemplos animados se convierten en pasos estáticos y el «momento de reconocimiento» se reduce a un cambio de estado con texto.

---

## 5. Estados de progreso: definiciones medibles

**Por qué hay dos dimensiones.** SCORM 2004 separa `cmi.completion_status` (completed, incomplete, not attempted, unknown) de `cmi.success_status` (passed, failed, unknown). SCORM 1.2 mezclaba ambos en un único `lesson_status` (https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/). cmi5 (AICC, edición «Quartz», 01/06/2016, https://github.com/AICC/CMI-5_Spec_Current/blob/quartz/cmi5_spec.md) distingue:
- *Completed*: el alumno «viewed or did all of the relevant activities» (§9.3.3);
- *Passed*: el alumno «attempted and succeeded in a judged activity» (§9.3.4).

Con la propiedad `moveOn` (§13.1.4), cmi5 define cuándo una unidad queda satisfecha: `Passed`, `Completed`, `CompletedAndPassed`, `CompletedOrPassed` o `NotApplicable`. Su `masteryScore` es un decimal entre 0 y 1. En xAPI, el objeto *Result* tiene campos independientes `completion` y `success` (https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md).

FLM Campus adopta la misma separación: **lectura** (dimensión de compleción) y **test** (dimensión de éxito).

### 5.1 Tabla de estados

| Estado | Criterio medible | Evento que se registra | Equivalente en los estándares | Cómo se muestra |
|---|---|---|---|---|
| **Sin empezar** | No hay apertura registrada | — | SCORM: *not attempted* | «Sin empezar» |
| **En curso** | Abierta, sin lectura completada ni test superado | `abierta_en` (primera vez) | SCORM: *incomplete* | «En curso · 2 de 5 bloques» |
| **Leída** | (a) Todos los bloques han estado visibles (≥ 60 % de cada bloque en pantalla) **y** el bloque «Idea clave» se ha mostrado **y** el tiempo activo es ≥ 50 % del estimado, **o bien** (b) el usuario confirma «He terminado la lectura» al final | `lectura_completada_en` y `metodo` (automático o manual) | cmi5 *Completed*; xAPI `completion = true`; SCORM *completed* | «Leída» y botón «Hacer el test» |
| **Test intentado** | Al menos **un envío completo** (3/3 respondidas) | Intento: fecha, preguntas, opciones elegidas, aciertos y si aprueba | cmi5 *Passed* o *Failed*; xAPI `success` informado | «Test intentado · 1 de 3 · Puedes volver a intentarlo» |
| **Test superado** | Un intento con **≥ 2 aciertos de 3**. En la evaluación sectorial, **≥ 8 de 10** | `superado_en` y mejor resultado | cmi5 *Passed* con `masteryScore` 0,6667 (2/3) u 0,8 (8/10); xAPI `success = true`; SCORM *passed* | «Test superado · 3 de 3» |
| **Completada** | **Leída y test superado**, en cualquier orden, sobre la **misma versión** de la formación | `completada_en` (cuando se cumple la segunda condición) y `version` | cmi5 `moveOn = CompletedAndPassed` | «Completada el 12/11/2026» |

**Indicadores adicionales,** que no son estados de la formación:
- *Obligatoria* (asignada por la administración, con fecha límite opcional);
- *Actualizada* (hay una versión posterior con cambios sustanciales);
- *Repaso disponible*;
- *Archivada*.

**Por qué el umbral de tiempo del 50 %** (cálculo propio):
- Con la estimación de 200 palabras/min, completar el 50 % del tiempo equivale a leer a 400 palabras/min. Eso supera el máximo del rango habitual de lectura silenciosa (unas 300 palabras/min; Brysbaert, 2019).
- El umbral no penaliza a quien lee rápido, pero filtra el simple desplazamiento por la página.
- El tiempo activo se calcula **en el navegador**: pestaña visible y alguna interacción en los últimos 60 segundos. Solo se guarda el resultado, no el registro de tiempos (§5.7).
- La opción (b), la confirmación manual, garantiza la accesibilidad: los lectores de pantalla o la versión imprimible pueden no activar la detección automática.

### 5.2 Reglas

1. **Orden libre.** Se puede superar el test antes de terminar la lectura. El estado queda en «Test superado · Lectura pendiente» hasta cumplir ambas condiciones.
2. **Regla de compleción configurable por formación**, equivalente a `moveOn` de cmi5:
   - **Lectura + test**, por defecto y obligatoria en formaciones *obligatorias*.
   - **Lectura o test**, para formaciones de actualización dirigidas a perfiles sénior (*ruta rápida*; §3.3, reversión por pericia).
   - **Solo test**, para repasos.
3. **Intentos.**
   - Test de la formación: ilimitados y sin espera.
   - Evaluación sectorial: ilimitados, con 24 h entre un intento no superado y el siguiente.
   - Un test abandonado sin enviar **no cuenta** como intento.
4. **Sin retroceso.** Un test superado o una formación completada no vuelve a un estado anterior por intentos de práctica posteriores ni por fallar una pregunta de repaso. Khan Academy sí rebaja niveles (§2.9), pero en un registro profesional preferimos indicar «Repaso disponible».
5. **Versiones.**
   - Una **corrección menor** (erratas o enlaces) no afecta a los estados.
   - Una **actualización sustancial**, por ejemplo por un cambio normativo, publica una versión nueva con un bloque «Qué ha cambiado». La compleción anterior se conserva en el historial como «Completada (versión del 12/11/2026)». Se marca *Actualizada* y, si la formación es obligatoria, vuelve a «Pendiente de actualizar».
   - Para normalizarla, la administración elige si basta con leer los cambios o hay que superar de nuevo el test.
6. **Derecho a terminar** (como UNED Abierta, art. 6.3.a). Si se archiva una formación, quien la tenía en curso puede terminarla durante un plazo que fije la administración, por ejemplo 30 días. En su historial queda «Formación archivada».
7. **Fecha de compleción:** la del momento en que se cumple la segunda condición.

### 5.3 Agregados

- **Por área:** «Fiscal · 2 de 3 formaciones completadas · Evaluación sectorial: superada (9/10, 14/11/2026)».
- **Obligatorias:** «Al día» o «2 pendientes · la próxima vence el 30/11/2026».
- **Historial personal:** formaciones completadas por fecha, con versión y resultado del test. Los intentos son visibles solo para el empleado y la administración.

### 5.4 Cómo mostrar el progreso sin infantilizar

**Principios** (basados en §3.2 y §3.7):
- Cifras y estados con significado profesional («3 de 12») en lugar de puntos, niveles o porcentajes decorativos.
- Feedback sobre la tarea, no sobre la persona.
- Sin clasificaciones entre compañeros, sin rachas que penalicen interrupciones y sin comparaciones.
- Progreso **privado por defecto**. El empleado decide qué reconocimientos muestra en su perfil (autonomía).
- Un «momento de reconocimiento» **contenido**, como pide el brief: un sello que se asienta en menos de 1 s, sin confeti ni sonido, con versión estática para movimiento reducido.

**Ejemplos de redacción:**

| Situación | Sí (profesional) | No (infantilizante) |
|---|---|---|
| Test superado | «Test superado: 3 de 3. Lo hemos añadido a tu historial.» | «¡Bravo, campeón! +50 puntos» |
| Test no superado | «Has acertado 1 de 3. Revisa las explicaciones y vuelve a intentarlo cuando quieras.» | «¡Oh, no! ¡Tú puedes!» |
| Respuesta incorrecta | «No es correcta. El plazo es X porque… Fuente: art. … Repasa el bloque 2.» | «¡Casi!» |
| Formación completada | «Formación completada el 12/11/2026 · versión vigente.» | «¡Logro desbloqueado!» |
| Evaluación sectorial no superada | «6 de 10 (se necesitan 8). Te recomendamos repasar «…» y «…». Podrás repetirla desde el 29/10/2026 a las 10:15.» | «Has perdido tu racha» |

### 5.5 Reconocimientos profesionales

**Catálogo propuesto** (sobrio, sin inflación de insignias):

| Reconocimiento | Criterio | Observaciones |
|---|---|---|
| **Itinerario completado · [Área]** | Las 3 formaciones del área completadas en su versión vigente | Si una formación se actualiza sustancialmente, el reconocimiento indica «obtenido con la versión del dd/mm/aaaa» |
| **Evaluación sectorial superada · [Área]** | ≥ 8/10 en «Pon a prueba tus conocimientos» | Muestra la puntuación y la fecha |
| **Autor/a FLM Campus** | Al menos una formación o noticia publicada tras revisión | Lo pide el brief («Recognition for published contributions»). Indica el número de contenidos publicados |
| **Antigüedad · [n] años en FLM** | Calculado a partir de la fecha de incorporación del perfil | Lo pide el brief («tenure badges») |
| *(estado, no reconocimiento)* **Al día en obligatorias** | Todas las obligatorias completadas en su versión vigente | Se muestra en el perfil, no como insignia |

**Metadatos de cada reconocimiento.** Se adaptan los elementos obligatorios del Anexo I de la Recomendación del Consejo sobre microcredenciales (2022/C 243/02, https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32022H0627(02)):
- titular;
- título;
- entidad que lo expide (FLM);
- fecha;
- resultados de aprendizaje;
- carga de trabajo (en minutos);
- tipo de evaluación (por ejemplo, «test en línea no supervisado»);
- forma de participación (en línea);
- garantía de calidad (revisión editorial por el área).

Opcionalmente, en una fase posterior, podrían exportarse como **Open Badges 3.0** (1EdTech, Final Release, versión del documento 1.4.5 de 29/06/2026, alineada con el modelo de Verifiable Credentials 2.0 del W3C, https://www.imsglobal.org/spec/ob/v3p0/). Así el empleado podría compartirlos fuera del campus, igual que las insignias de OpenLearn (§2.2).

### 5.6 Informes para la administración

- **Formaciones obligatorias:** compleción por persona y por departamento. Acceso restringido a la administración, como pide el brief.
- **Errores frecuentes:**
  - Por pregunta: porcentaje de acierto en primer intento y opción incorrecta más elegida, con enlace para editar la pregunta o el bloque.
  - Por resultado de aprendizaje: dónde falla más el equipo.
- **Calidad del banco de preguntas:** preguntas sin variante, demasiado fáciles o demasiado difíciles (§4.5).
- **No se generan** informes individuales de tiempo de lectura ni de desplazamiento por la página.

### 5.7 Privacidad y conservación

- Registrar el progreso de los empleados es un **tratamiento de datos personales**. Hay que:
  - informar de qué se registra, con qué fines, a quién se comunica y cuánto se conserva (RGPD, art. 13);
  - limitar los datos a lo necesario (art. 5.1.c, «minimización de datos»).
- En el ámbito laboral, los Estados miembros y los convenios colectivos pueden establecer normas más específicas (art. 88). Fuente: https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32016R0679. El reglamento sigue vigente; no se ha verificado si hay modificaciones en tramitación.
- **Datos que se guardan:**
  - Sí: estados con fecha y versión, intentos (preguntas, opciones elegidas y aciertos) y reconocimientos.
  - No: registros de tiempo por bloque, de desplazamiento por la página ni de actividad fuera del campus.
- **Conservación (propuesta pendiente de validar con quien asuma la protección de datos en FLM):**
  - Detalle de cada intento: 24 meses, después agregado y anonimizado para las estadísticas de errores.
  - Estados y reconocimientos: mientras dure la relación laboral, más el plazo que fije la política de FLM.
  - El brief pide documentar reglas de conservación y supresión.
- **Recomendación de confianza:** comunicar que los resultados de los tests tienen **finalidad formativa** y no se usan para evaluar el desempeño. Si FLM quisiera otro uso, debería informarlo de antemano y revisarlo con su asesoría laboral.

---

## 6. Marco normativo relacionado (vigencia a 28/10/2026)

| Norma | Contenido relevante | Vigencia y cambios | Implicación para FLM Campus |
|---|---|---|---|
| **Estatuto de los Trabajadores, art. 23.3** (https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430#a23) | Permiso retribuido de 20 horas anuales de formación profesional para el empleo, vinculada a la actividad de la empresa, para quien tenga al menos un año de antigüedad. Acumulable por un periodo de hasta cinco años. Se entiende cumplido si la formación se hace dentro de un plan de la empresa o de la negociación colectiva. No incluye la formación obligatoria por otras leyes | Texto consolidado: última actualización publicada el 21/10/2026 | Registrar fecha y duración de las formaciones puede servir para documentar el plan de formación. Su cómputo a efectos del art. 23.3 debe valorarlo el área laboral de FLM |
| **RD 694/2017, art. 3.2** (https://www.boe.es/buscar/act.php?id=BOE-A-2017-7769#a3) | En la formación programada por las empresas, la duración y los contenidos los determina la empresa. **No** son acciones formativas las actividades informativas o divulgativas ni «las que tengan una duración inferior a dos horas» | Texto consolidado: última actualización publicada el 31/12/2025. El RD 1189/2025 modificó los arts. 18 y 25 con efectos desde el 01/01/2026. **No se ha verificado** si hay un proyecto de sustitución en tramitación | Una formación de 6–10 min **no es bonificable por sí sola**. Para bonificar habría que agrupar formaciones en acciones de ≥ 2 h y cumplir los requisitos de teleformación |
| **RD 694/2017, art. 4.1 y 4.2** (https://www.boe.es/buscar/act.php?id=BOE-A-2017-7769#a4) | Hay teleformación cuando la parte presencial es ≤ 20 %. Exige una plataforma virtual de aprendizaje con «seguimiento continuo y en tiempo real», evaluación de todo el proceso y al menos un tutor por cada 80 participantes | Como arriba | Si FLM decide bonificar, la plataforma debería aportar esas evidencias. Requiere una decisión y una consulta a FUNDAE |
| **RD 694/2017, art. 7.2** (https://www.boe.es/buscar/act.php?id=BOE-A-2017-7769#a7) | Diploma para quien supera la formación con evaluación positiva; certificado de asistencia para quien la termina sin ella | Como arriba | Refuerza la distinción entre participación (*Leída*) y logro (*Superado*) |
| **RGPD, arts. 5.1.c, 13 y 88** (https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32016R0679) | Minimización, información al interesado y tratamiento en el ámbito laboral | Vigente. No se han verificado propuestas de modificación | §5.7 |
| **Recomendación del Consejo 2022/C 243/02** (https://eur-lex.europa.eu/legal-content/ES/TXT/HTML/?uri=CELEX:32022H0627(02)) | Elementos tipo para describir microcredenciales (Anexo I) | Recomendación, no vinculante | Metadatos de los reconocimientos (§5.5) |
| **WCAG 2.2** (W3C Recommendation, 12/12/2024, https://www.w3.org/TR/WCAG22/) | Criterios de accesibilidad: 2.2.1, 1.1.1, 1.4.3, 1.4.11, 2.4.6… | Norma técnica. Es el objetivo AA que fija el brief, no una obligación legal verificada para una intranet privada | §4.8 |
| **NO VERIFICADO: Orden TAS/2307/2007** | Se cree que establece que en teleformación ha finalizado quien ha realizado al menos el 75 % de los controles periódicos de seguimiento | No se pudo localizar su texto consolidado en el BOE (el identificador probado no corresponde) y se agotó la cuota de búsquedas | Si FLM quiere bonificar, debe confirmarse con FUNDAE o en el BOE antes de fijar criterios |

---

## 7. Datos no verificados, límites y decisiones pendientes

**No verificado o verificado solo en parte**

1. **Criterio de finalización en teleformación de FUNDAE** (supuesto 75 % de controles; Orden TAS/2307/2007): **NO VERIFICADO**, por la razón indicada en §6.
2. **UNED Abierta:** la equivalencia entre horas y ECTS y los requisitos concretos para superar un curso no se pudieron leer, porque la copia del PDF estaba incompleta (**NO VERIFICADO**). Los arts. 5.1, 6.2 y 6.3 sí están verificados.
3. **HBS Online:** la duración exacta del temporizador del *cold call* no está verificada, porque las fuentes secundarias discrepan. Solo se confirma que existe un temporizador.
4. **Haladyna et al. (2002):** solo se verificó el resumen (taxonomía de 31 pautas). Las pautas concretas no se citan.
5. **Taxonomía de Bloom revisada:** el texto completo de Krathwohl (2002) no fue accesible. Las seis categorías se contrastaron con una fuente secundaria.
6. **Velocidad de lectura en castellano:** no se ha encontrado un dato publicado verificado. Las 200 palabras/min son un **supuesto de diseño** que debe calibrarse con datos reales.
7. **Mekler et al. (2017) y Hamari et al. (2014)** sobre elementos de gamificación: no se pudo verificar su contenido (CAPTCHA o acceso restringido) y **se han excluido** del razonamiento.
8. **Cambios normativos en tramitación** que afecten al RD 694/2017 o al RGPD: no verificados, porque se agotó la cuota de búsquedas.
9. **FutureLearn:** el artículo de ayuda indica «actualizado hace 1 mes», sin fecha exacta. **Khan Academy:** «actualizado hace 3 años».

**Decisiones pendientes para FLM**

1. **Bonificación:** ¿quiere FLM bonificar parte de la formación a través de FUNDAE? Si es así, hay que diseñar acciones de al menos 2 h que agrupen formaciones y verificar los requisitos de teleformación.
2. **Regla de compleción por defecto** en formaciones no obligatorias: «Lectura + test», recomendada, o «Lectura o test» para perfiles sénior.
3. **Número de opciones:** 3 por defecto, según Rodriguez (2005), o 4 en el test de 3 preguntas para reducir el acierto al azar del 25,9 % al 15,6 %.
4. **Carga de autoría:** 6 preguntas por formación (2 por resultado) y 20 por área para la evaluación sectorial.
5. **Plazos de conservación** de intentos y estados (§5.7), que debe validar quien asuma la protección de datos.
6. **Uso de los resultados:** exclusivamente formativo (recomendado) o también para otros fines, con información previa.
7. **Exportación** de reconocimientos como Open Badges 3.0: sí o no, y en qué fase.

---

## 8. Referencias (APA 7; datos bibliográficos cotejados por DOI en Crossref)

**Práctica de recuperación y técnicas de estudio**
- Adesope, O. O., Trevisan, D. A., & Sundararajan, N. (2017). Rethinking the use of tests: A meta-analysis of practice testing. *Review of Educational Research, 87*(3), 659–701. https://doi.org/10.3102/0034654316689306
- Agarwal, P. K., Nunes, L. D., & Blunt, J. R. (2021). Retrieval practice consistently benefits student learning: A systematic review of applied research in schools and classrooms. *Educational Psychology Review, 33*(4), 1409–1453. https://doi.org/10.1007/s10648-021-09595-9
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology. *Psychological Science in the Public Interest, 14*(1), 4–58. https://doi.org/10.1177/1529100612453266
- Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning. *Science, 319*(5865), 966–968. https://doi.org/10.1126/science.1152408
- Pashler, H., et al. (2007). *Organizing instruction and study to improve student learning* (IES Practice Guide). Institute of Education Sciences, U.S. Department of Education. https://ies.ed.gov/ncee/wwc/PracticeGuide/1
- Richland, L. E., Kornell, N., & Kao, L. S. (2009). The pretesting effect: Do unsuccessful retrieval attempts enhance learning? *Journal of Experimental Psychology: Applied, 15*(3), 243–257. https://doi.org/10.1037/a0016496
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255. https://doi.org/10.1111/j.1467-9280.2006.01693.x
- Rowland, C. A. (2014). The effect of testing versus restudy on retention: A meta-analytic review of the testing effect. *Psychological Bulletin, 140*(6), 1432–1463. https://doi.org/10.1037/a0037559
- Weinstein, Y., Madan, C. R., & Sumeracki, M. A. (2018). Teaching the science of learning. *Cognitive Research: Principles and Implications, 3*, 2. https://doi.org/10.1186/s41235-017-0087-y
- Yang, C., Luo, L., Vadillo, M. A., Yu, R., & Shanks, D. R. (2021). Testing (quizzing) boosts classroom learning: A systematic and meta-analytic review. *Psychological Bulletin, 147*(4), 399–435. https://doi.org/10.1037/bul0000309

**Feedback**
- Butler, A. C., Godbole, N., & Marsh, E. J. (2013). Explanation feedback is better than correct answer feedback for promoting transfer of learning. *Journal of Educational Psychology, 105*(2), 290–298. https://doi.org/10.1037/a0031026
- Butler, A. C., Karpicke, J. D., & Roediger, H. L. (2007). The effect of type and timing of feedback on learning from multiple-choice tests. *Journal of Experimental Psychology: Applied, 13*(4), 273–281. https://doi.org/10.1037/1076-898X.13.4.273
- Butler, A. C., & Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. *Memory & Cognition, 36*(3), 604–616. https://doi.org/10.3758/MC.36.3.604
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112. https://doi.org/10.3102/003465430298487
- Kluger, A. N., & DeNisi, A. (1996). The effects of feedback interventions on performance: A historical review, a meta-analysis, and a preliminary feedback intervention theory. *Psychological Bulletin, 119*(2), 254–284. https://doi.org/10.1037/0033-2909.119.2.254
- Shute, V. J. (2008). Focus on formative feedback. *Review of Educational Research, 78*(1), 153–189. https://doi.org/10.3102/0034654307313795
- Wisniewski, B., Zierer, K., & Hattie, J. (2020). The power of feedback revisited: A meta-analysis of educational feedback research. *Frontiers in Psychology, 10*, 3087. https://doi.org/10.3389/fpsyg.2019.03087

**Ejemplos resueltos, carga cognitiva y aprender haciendo**
- Atkinson, R. K., Derry, S. J., Renkl, A., & Wortham, D. (2000). Learning from examples: Instructional principles from the worked examples research. *Review of Educational Research, 70*(2), 181–214. https://doi.org/10.3102/00346543070002181
- Kalyuga, S. (2007). Expertise reversal effect and its implications for learner-tailored instruction. *Educational Psychology Review, 19*(4), 509–539. https://doi.org/10.1007/s10648-007-9054-3
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31. https://doi.org/10.1207/S15326985EP3801_4
- Koedinger, K. R., Kim, J., Jia, J. Z., McLaughlin, E. A., & Bier, N. L. (2015). Learning is not a spectator sport: Doing is better than watching for learning from a MOOC. En *Proceedings of the Second (2015) ACM Conference on Learning @ Scale* (pp. 111–120). ACM. https://doi.org/10.1145/2724660.2724681
- Koedinger, K. R., McLaughlin, E. A., Jia, J. Z., & Bier, N. L. (2016). Is the doer effect a causal relationship? En *Proceedings of the Sixth International Conference on Learning Analytics & Knowledge* (pp. 388–397). ACM. https://doi.org/10.1145/2883851.2883957
- Lovett, M., Meyer, O., & Thille, C. (2008). The Open Learning Initiative: Measuring the effectiveness of the OLI statistics course in accelerating student learning. *Journal of Interactive Media in Education, 2008*(1), 13. https://doi.org/10.5334/2008-14
- Merrill, M. D. (2002). First principles of instruction. *Educational Technology Research and Development, 50*(3), 43–59. https://doi.org/10.1007/BF02505024
- Rawson, K. A., Thomas, R. C., & Jacoby, L. L. (2015). The power of examples: Illustrative examples enhance conceptual learning of declarative concepts. *Educational Psychology Review, 27*(3), 483–504. https://doi.org/10.1007/s10648-014-9273-3
- Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition: A cognitive load perspective. *Educational Psychologist, 38*(1), 15–22. https://doi.org/10.1207/S15326985EP3801_3
- Sweller, J., & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. *Cognition and Instruction, 2*(1), 59–89. https://doi.org/10.1207/s1532690xci0201_3
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (1998). Cognitive architecture and instructional design. *Educational Psychology Review, 10*(3), 251–296. https://doi.org/10.1023/A:1022193728205
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31*(2), 261–292. https://doi.org/10.1007/s10648-019-09465-5

**Multimedia, lectura y vídeo**
- Brysbaert, M. (2019). How many words do we read per minute? A review and meta-analysis of reading rate. *Journal of Memory and Language, 109*, 104047. https://doi.org/10.1016/j.jml.2019.104047
- Guo, P. J., Kim, J., & Rubin, R. (2014). How video production affects student engagement: An empirical study of MOOC videos. En *Proceedings of the First ACM Conference on Learning @ Scale* (pp. 41–50). ACM. https://doi.org/10.1145/2556325.2566239
- Mayer, R. E. (2020). *Multimedia learning* (3.ª ed.). Cambridge University Press. https://doi.org/10.1017/9781316941355
- Mayer, R. E., & Moreno, R. (2003). Nine ways to reduce cognitive load in multimedia learning. *Educational Psychologist, 38*(1), 43–52. https://doi.org/10.1207/S15326985EP3801_6
- Noetel, M., Griffith, S., Delaney, O., Harris, N. R., Sanders, T., Parker, P., del Pozo Cruz, B., & Lonsdale, C. (2022). Multimedia design for learning: An overview of reviews with meta-meta-analysis. *Review of Educational Research, 92*(3), 413–454. https://doi.org/10.3102/00346543211052329

**Espaciado**
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. https://doi.org/10.1037/0033-2909.132.3.354
- Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H. (2008). Spacing effects in learning: A temporal ridgeline of optimal retention. *Psychological Science, 19*(11), 1095–1102. https://doi.org/10.1111/j.1467-9280.2008.02209.x
- Kerfoot, B. P., DeWolf, W. C., Masser, B. A., Church, P. A., & Federman, D. D. (2007). Spaced education improves the retention of clinical knowledge by medical students: A randomised controlled trial. *Medical Education, 41*(1), 23–31. https://doi.org/10.1111/j.1365-2929.2006.02644.x
- Latimier, A., Peyre, H., & Ramus, F. (2021). A meta-analytic review of the benefit of spacing out retrieval practice episodes on retention. *Educational Psychology Review, 33*(3), 959–987. https://doi.org/10.1007/s10648-020-09572-8

**Resultados de aprendizaje y dominio**
- Biggs, J. (1996). Enhancing teaching through constructive alignment. *Higher Education, 32*(3), 347–364. https://doi.org/10.1007/BF00138871
- Bloom, B. S. (1984). The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring. *Educational Researcher, 13*(6), 4–16. https://doi.org/10.3102/0013189X013006004
- Cedefop (2017). *Defining, writing and applying learning outcomes: A European handbook*. Oficina de Publicaciones de la UE. https://doi.org/10.2801/566770 (2.ª ed., junio de 2022: https://www.cedefop.europa.eu/en/publications/4156)
- Krathwohl, D. R. (2002). A revision of Bloom's taxonomy: An overview. *Theory Into Practice, 41*(4), 212–218. https://doi.org/10.1207/s15430421tip4104_2
- Kulik, C.-L. C., Kulik, J. A., & Bangert-Drowns, R. L. (1990). Effectiveness of mastery learning programs: A meta-analysis. *Review of Educational Research, 60*(2), 265–299. https://doi.org/10.3102/00346543060002265

**Motivación**
- Deci, E. L., Koestner, R., & Ryan, R. M. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. *Psychological Bulletin, 125*(6), 627–668. https://doi.org/10.1037/0033-2909.125.6.627
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. *American Psychologist, 55*(1), 68–78. https://doi.org/10.1037/0003-066X.55.1.68
- Sailer, M., & Homner, L. (2020). The gamification of learning: A meta-analysis. *Educational Psychology Review, 32*(1), 77–112. https://doi.org/10.1007/s10648-019-09498-w

**Diseño de preguntas**
- Haladyna, T. M., Downing, S. M., & Rodriguez, M. C. (2002). A review of multiple-choice item-writing guidelines for classroom assessment. *Applied Measurement in Education, 15*(3), 309–333. https://doi.org/10.1207/S15324818AME1503_5
- Rodriguez, M. C. (2005). Three options are optimal for multiple-choice items: A meta-analysis of 80 years of research. *Educational Measurement: Issues and Practice, 24*(2), 3–13. https://doi.org/10.1111/j.1745-3992.2005.00006.x

**Experiencias institucionales (investigación)**
- Ferguson, R., & Sharples, M. (2014). Innovative pedagogy at massive scale: Teaching and learning in MOOCs. En *Open Learning and Teaching in Educational Communities (EC-TEL 2014)*, LNCS 8719 (pp. 98–111). Springer. https://doi.org/10.1007/978-3-319-11200-8_8
- Law, P. (2015). Digital badging at The Open University: Recognition for informal learning. *Open Learning: The Journal of Open, Distance and e-Learning, 30*(3), 221–234. https://doi.org/10.1080/02680513.2015.1104500

**Estándares técnicos**
- 1EdTech. *Open Badges Specification*, v3.0 (Final Release; versión del documento 1.4.5, 29/06/2026). https://www.imsglobal.org/spec/ob/v3p0/
- ADL. *Experience API (xAPI) – Data* (serie 1.0.x). https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md
- AICC. *cmi5 Specification* («Quartz», 1.ª ed., 01/06/2016). https://github.com/AICC/CMI-5_Spec_Current/blob/quartz/cmi5_spec.md
- Rustici Software. *SCORM Run-Time Reference* (SCORM 1.2 y 2004). https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
- W3C. *Web Content Accessibility Guidelines (WCAG) 2.2*, W3C Recommendation, 12/12/2024. https://www.w3.org/TR/WCAG22/

## 9. Fuentes institucionales consultadas (28/10/2026)

| Institución | URL | Qué se comprobó |
|---|---|---|
| OpenLearn (OU) | https://www.open.edu/openlearn/money-business/introduction-bookkeeping-and-accounting/content-section-overview | Resultados de aprendizaje, horas, estructura |
| OpenLearn (OU) | https://www.open.edu/openlearn/get-started/frequently-asked-questions/understanding-statements-participation | Requisitos de la *statement of participation* |
| OpenLearn (OU) | https://www.open.edu/openlearn/education-development/multidisciplinary-study-the-value-and-benefits/content-section-1 | Insignia: 50 %, 3 intentos, 24 h |
| OpenLearn (OU) | https://www.open.edu/openlearn/get-started/badges-come-openlearn-0 | Insignias y su uso compartido |
| The Open University | https://university.open.ac.uk/open-educational-resources/node/307 | Más de 80 cursos con insignia; aval de la CPD Standards Office |
| CMU OLI | https://oli.cmu.edu/ y https://oli.cmu.edu/about/impact/ | Aprender haciendo, feedback, pistas; impacto |
| CMU | https://www.cmu.edu/news/stories/archives/2015/september/moocs-vs-oli.html | 57 % frente a 66 %; ≈ 6 veces |
| HBS Online | https://online.hbs.edu/why-hbs-online | Método del caso |
| HBS Online | https://online.hbs.edu/blog/post/interactive-online-learning | Actividad cada 3–5 min; *cold call* con temporizador |
| HBS Online | https://info.email.online.hbs.edu/certificate-of-completion-requirements-financial-accounting | Requisitos del certificado |
| HBS Online | https://online.hbs.edu/why-hbs-online/about-our-courses-and-programs | Certificados de curso y de especialización |
| MIT Open Learning | https://openlearning.mit.edu/news/mind-and-hand-approach-online-learning | Diseño MITx |
| UOC | https://www.uoc.edu/es/estudios/acceso-matricula/modelo-educativo-graduados | Modelo educativo |
| UOC | https://www.uoc.edu/estudiant/portal/guia_2024/es/com_estudia/avaluacio/index.html | Evaluación continua, feedback, PS y EX |
| UNED Abierta | https://iedra.uned.es/ | Plataforma Open edX; cursos abiertos permanentemente |
| UNED Abierta | Normativa interna (PDF en el BICI de 12/01/2026; copia local en `research/downloads/03-aprendizaje-uned-normativa/`) | Arts. 5.1, 6.2 y 6.3 |
| FutureLearn | https://futurelearn.zendesk.com/hc/en-us/articles/115008376948 | Requisitos del *Certificate of Achievement* |
| Khan Academy | https://support.khanacademy.org/hc/en-us/articles/5548760867853 | Niveles de dominio |
| Coursera / Wharton | https://www.coursera.org/learn/wharton-accounting | Estructura del curso |
| Coursera | https://www.coursera.org/learn/learning-how-to-learn | Nota complementaria |
| UC San Diego | https://multimedia.ucsd.edu/best-practices/video-length.html | Matiz sobre la duración de los vídeos |
| IES (EE. UU.) | https://ies.ed.gov/ncee/wwc/PracticeGuide/1 | Recomendaciones y niveles de evidencia |
| Cedefop | https://www.cedefop.europa.eu/en/publications/4156 | Manual de resultados de aprendizaje |

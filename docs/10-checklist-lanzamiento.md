# 10 · Lista de comprobación para el lanzamiento interno

## Contenido y marca

- [ ] Cada área revisa y valida sus formaciones (tres por área y siete en Contabilidad), tests y bancos de preguntas (estado de revisión «revisado»: en la plataforma, al publicar se marca «Lo ha revisado el área» y se muestra «Revisado por …»).
  - [ ] **Importaciones y DUA:** honorarios del transitario (exentos por el art. 64 LIVA si están en la base del DUA; los casos los tratan con IVA) y en qué casillas van cuando el despacho es de un bien de inversión; DUA a nombre de otra persona y proveedor que importa él mismo; fecha de la compra según el Incoterm (mercancías en tránsito); cuenta del IVA diferido (475); tipo de cambio de la parte de una compra cubierta por un anticipo; los aranceles y tipos de cambio de los casos son supuestos.
  - [ ] **Amortizaciones:** meses o días en el primer y el último año; uso de la 233 durante el ejercicio; 523 o 410 para transporte e instalación; suscripciones de software en la nube; recambio o bien de inversión en la sustitución de un grupo completo; reparto entre suelo y construcción; valor residual frente al coeficiente fiscal; cuenta de las obras en local alquilado.
  - [ ] **Bienes de inversión:** cómo se mide el umbral de 3.005,06 € (gastos accesorios, IVA no deducible, piezas que solo funcionan juntas); periodo y cuenta de la regularización única del art. 110; instalaciones en edificios (5 o 10 años); obras del inquilino y mejoras; renting y leasing; anticipo y entrega en años distintos.
  - [ ] **Facturas de anticipo:** formato de la factura definitiva que descuenta el anticipo; anticipo devuelto (art. 80.Dos) y cantidades retenidas; inversión del sujeto pasivo con anticipos; facturas previas en entregas intracomunitarias; cuenta de los anticipos de servicios y de las provisiones para suplidos; componente financiero a más de un año; base de la retención sin IVA; subcuenta del IVA pendiente de factura.
  - [ ] Las cuatro son largas (31 a 35 minutos de lectura): valorar dividirlas en dos partes cada una.
- [ ] Todas las formaciones firman «Judith Calet — Asesora Contable» (campo de autoría `authorId` y puesto de su ficha; a petición suya, 29/10/2026). Confirmar con ella el puesto antes del lanzamiento: cambiarlo en su ficha actualiza la firma de todas. Si un perfil se elimina, su contenido se conserva con la firma neutra del área.
- [ ] Decidir quién tiene el rol de autor en cada área: publica lo suyo directamente, sin revisión previa (administración puede editar, archivar y restaurar cualquier contenido).
- [ ] Revisar la vigencia de Actualidad (fechas de entrada en vigor y aplazamientos).
- [ ] Confirmar los festivos de 2027 de Barcelona, Vic y Granollers cuando se publiquen.
- [ ] Validar con Crowe la mención «A business associate of Crowe Global» y la discrepancia con la web nueva.
- [ ] Confirmar autoría y permiso de distribución de los documentos marcados como internos (revista AEDAF, presentación IS 2025, novedades de Cataluña).
- [ ] Completar los marcadores pendientes del Radar Mercantil (canal de contacto y plazo de respuesta, pág. 11).
- [ ] Sustituir los enlaces de ejemplo (FLM Awards, reseñas) por los definitivos.
- [ ] Solicitar a FLM versiones vectoriales (SVG o PDF) del logotipo y una versión negativa oficial.

## Personas y datos

- [ ] Cargar las cuentas reales (solo @flmexperts.com) y retirar las personas ficticias de la demo.
- [ ] Pedir a cada persona que complete su cumpleaños (día y mes) y su fecha de incorporación desde su perfil, o que los facilite a administración: los perfiles cargados sin ellos no salen en el calendario de empresa hasta entonces (no se bloquea el acceso ni se inventa ninguna fecha).
- [ ] Consentimiento escrito para retratos y fotografías de actos con personas identificables.
- [ ] Aprobar la política de retención (`apps/api/docs/retencion-datos.md`) y registrar el tratamiento en el registro de actividades (RGPD).

## Infraestructura (versión privada)

- [ ] Alojamiento con volumen persistente (Docker), dominio interno y certificado HTTPS.
- [ ] Variables de entorno de producción (`APP_ORIGIN`, rutas de datos, SMTP) fuera del repositorio.
- [ ] SMTP para activaciones y recuperación de contraseña; probar ambos flujos.
- [ ] Crear la primera cuenta administradora con `npm run create-admin -w @flm/api -- --email <correo> --nombre "<nombre>" --cumpleanos <día/mes> --incorporacion <día/mes/año>` (el cumpleaños, sin año, y la fecha de incorporación son obligatorios, como en cualquier alta).
- [ ] Copias diarias automatizadas y prueba de restauración.
- [ ] Monitorización básica (disponibilidad y errores) y responsable de guardia.

## Calidad

- [ ] `npm run check` en verde.
- [ ] Recorridos manuales del informe de QA en escritorio (Chrome, Edge, Firefox, Safari) y móvil (iOS y Android).
- [ ] Prueba con lector de pantalla (NVDA y VoiceOver) de portada, formación, test y gestión.
- [ ] Prueba de carga ligera con 50 sesiones simultáneas.

## Comunicación

- [ ] Anuncio interno del lanzamiento (comunicado en la agenda). Debe explicar que las formaciones son voluntarias, que los tests sirven para aprender y no para evaluar a nadie, y que administración solo ve datos agregados, sin nombres.
- [ ] Sesión de bienvenida de 15 minutos y guía rápida para autores: «Crear» (cabecera, menú de usuario o Ctrl K), plantillas, «Guardar borrador» y «Publicar».
- [ ] Buzón de sugerencias activo (barcelona@flmexperts.com).

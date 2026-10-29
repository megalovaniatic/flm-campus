# 10 · Lista de comprobación para el lanzamiento interno

## Contenido y marca

- [ ] Cada área revisa y valida sus tres formaciones, tests y bancos de preguntas (estado de revisión «revisado»).
- [ ] Confirmar la autoría de cada formación con las personas que figuran como autoras.
- [ ] Revisar la vigencia de Actualidad (fechas de entrada en vigor y aplazamientos).
- [ ] Confirmar los festivos de 2027 de Barcelona, Vic y Granollers cuando se publiquen.
- [ ] Validar con Crowe la mención «A business associate of Crowe Global» y la discrepancia con la web nueva.
- [ ] Confirmar autoría y permiso de distribución de los documentos marcados como internos (revista AEDAF, presentación IS 2025, novedades de Cataluña).
- [ ] Completar los marcadores pendientes del Radar Mercantil (canal de contacto y plazo de respuesta, pág. 11).
- [ ] Sustituir los enlaces de ejemplo (FLM Awards, reseñas) por los definitivos.
- [ ] Solicitar a FLM versiones vectoriales (SVG o PDF) del logotipo y una versión negativa oficial.

## Personas y datos

- [ ] Cargar las cuentas reales (solo @flmexperts.com) y retirar las personas ficticias de la demo.
- [ ] Consentimiento escrito para retratos y fotografías de actos con personas identificables.
- [ ] Aprobar la política de retención (`apps/api/docs/retencion-datos.md`) y registrar el tratamiento en el registro de actividades (RGPD).

## Infraestructura (versión privada)

- [ ] Alojamiento con volumen persistente (Docker), dominio interno y certificado HTTPS.
- [ ] Variables de entorno de producción (`APP_ORIGIN`, rutas de datos, SMTP) fuera del repositorio.
- [ ] SMTP para activaciones y recuperación de contraseña; probar ambos flujos.
- [ ] Crear la primera cuenta administradora con `npm run create-admin -w @flm/api`.
- [ ] Copias diarias automatizadas y prueba de restauración.
- [ ] Monitorización básica (disponibilidad y errores) y responsable de guardia.

## Calidad

- [ ] `npm run check` en verde.
- [ ] Recorridos manuales del informe de QA en escritorio (Chrome, Edge, Firefox, Safari) y móvil (iOS y Android).
- [ ] Prueba con lector de pantalla (NVDA y VoiceOver) de portada, formación, test y gestión.
- [ ] Prueba de carga ligera con 50 sesiones simultáneas.

## Comunicación

- [ ] Anuncio interno del lanzamiento (comunicado en la agenda). Debe explicar que las formaciones son voluntarias, que los tests sirven para aprender y no para evaluar a nadie, y que administración solo ve datos agregados, sin nombres.
- [ ] Sesión de bienvenida de 15 minutos y guía rápida para autores.
- [ ] Buzón de sugerencias activo (barcelona@flmexperts.com).

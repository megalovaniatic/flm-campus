# Verifactu: el nuevo sistema de facturación y su calendario

**Dosier de investigación · FLM Campus · Área Fiscal · Ficha 11-FIS-02 · Versión verificada**
**Fecha de corte y de consulta de todas las fuentes:** 28/10/2026 (Europe/Madrid)
**Público:** personas del equipo (perfiles junior y senior) que asesoran a pymes, autónomos y startups.
**Objetivo de la formación:** saber qué clientes están afectados, qué deben exigir a su software de facturación y desde cuándo, y explicarlo con seguridad.

> **Nota de verificación (28/10/2026).** Se ha comprobado de forma independiente cada dato contra fuentes primarias: textos consolidados y fichas «Análisis» del BOE, sumarios diarios del BOE del 5 al 28/10/2026, páginas y FAQ de la AEAT y la nota del Ministerio de Hacienda. Las fechas, importes, artículos, anclas y claves del test se confirman. Se corrige lo siguiente:
> - El calendario se ha cambiado dos veces en el BOE, no tres.
> - La lista de supuestos de liquidación mensual que obligan al SII estaba incompleta (art. 71.3 RIVA).
> - El art. 8 de la Orden no se aplica a la modalidad VERI\*FACTU.
> - Se corrige el primer paso del árbol de decisión, que no tenía en cuenta las facturas voluntarias.
> - Se añaden varios matices menores.
>
> Todo se detalla en el «Registro de verificación» final.

> **Estado a 28/10/2026 en 30 segundos.** Fechas exigibles según el BOE: **antes del 1/1/2027** para los contribuyentes del Impuesto sobre Sociedades y **antes del 1/7/2027** para el resto de obligados (disposición final 4.ª del RD 1007/2023, en la redacción del Real Decreto-ley 15/2025). Los productores y comercializadores de software están obligados desde el **29/07/2025**. El traslado a **octubre de 2028** es una **previsión** anunciada por el Ministerio de Hacienda el 5/10/2026: **no hay norma publicada en el BOE** a la fecha de corte (comprobados los sumarios del 5 al 28/10/2026).

---

## 1. Por qué importa

Una S.L. cliente factura con un ERP en la nube y con un TPV en tienda. Tras leer que Verifactu «se aplaza a 2028», nos pregunta si puede parar la migración de su software. A 28/10/2026 la respuesta es no. El BOE sigue exigiendo que las sociedades tengan el sistema adaptado antes del 1 de enero de 2027, y los autónomos antes del 1 de julio de 2027. Además, conservar un programa no adaptado que pueda facturar puede costar 50.000 € por ejercicio. El cliente espera que su asesor sepa distinguir lo vigente de lo anunciado y qué pedir al proveedor de software.

---

## 2. Resultados de aprendizaje

Al terminar la formación, la persona participante será capaz de:

1. **Identificar** si un cliente está obligado al Reglamento de sistemas informáticos de facturación (art. 3 del RRSIF y «regla de los 4 NO» de la AEAT) y **asignarle** su fecha vigente: antes del 1/1/2027 o antes del 1/7/2027.
2. **Decidir**, junto al cliente, entre la modalidad VERI\*FACTU y la NO VERI\*FACTU, y **comprobar** que su software aporta declaración responsable, código QR y, en su caso, firma electrónica y registro de eventos.
3. **Calcular** la exposición sancionadora del art. 201 bis LGT y las fechas de la factura electrónica B2B que corresponden a cada cliente (6/10/2027 o 6/10/2028).

---

## 3. Contenido esencial

### Bloque 1. Qué es Verifactu y de dónde sale

«Verifactu» es el nombre con el que se conoce el Reglamento de requisitos de los sistemas informáticos de facturación (RRSIF). Lo aprobó el Real Decreto 1007/2023 (BOE de 6/12/2023).

**Origen legal.** El RRSIF desarrolla el art. 29.2.j) de la LGT, que añadió la Ley 11/2021 y que está en vigor desde el 11/10/2021. Ese artículo obliga a productores, comercializadores y usuarios a que los sistemas informáticos contables, de facturación o de gestión garanticen seis cualidades de los registros: integridad, conservación, accesibilidad, legibilidad, trazabilidad e inalterabilidad. El RRSIF solo desarrolla esa obligación para los sistemas de facturación.

**Cómo funciona.** Cada factura genera automáticamente un registro de alta, o uno de anulación si la factura se emitió por error. Cada registro se encadena con el anterior mediante una huella o *hash*, y la factura incorpora un código QR.

La Orden HAC/1177/2024, en vigor desde el 29/10/2024, concreta las especificaciones técnicas. Verifactu no crea ningún impuesto: regula cómo se expiden, registran y conservan las facturas emitidas.

**Referencias normativas**
- Art. 29.2.j) LGT (Ley 58/2003): https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a29
- Art. decimotercero, apartado 4, de la Ley 11/2021 (añade la letra j): https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473#ad-3
- RRSIF (RD 1007/2023), artículos:
  - art. 1: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1
  - art. 8: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a8
  - art. 9: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a9
  - art. 10: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-2
  - art. 11: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-3
  - art. 12: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-4
- Preámbulo del RD 1007/2023 (se centra «exclusivamente» en los sistemas de facturación): https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#pr
- Arts. 6.5 y 7.5 del Reglamento de facturación (RD 1619/2012), añadidos por la DF 1.ª del RD 1007/2023: https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6 · https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a7
- Orden HAC/1177/2024 (BOE 28/10/2024; en vigor 29/10/2024): https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138

### Bloque 2. Quién está obligado y quién queda fuera

**Quién está obligado.** Quien utilice un sistema informático de facturación (SIF), aunque sea solo en una parte de su actividad, si es uno de estos obligados:
- Contribuyentes del Impuesto sobre Sociedades. No lo están las entidades totalmente exentas del art. 9.1 LIS. Las parcialmente exentas solo lo están por las operaciones que generan rentas sujetas y no exentas.
- Personas físicas con actividad económica (IRPF).
- No residentes con establecimiento permanente.
- Entidades en atribución de rentas con actividad.

También están obligados los productores y comercializadores de software de facturación.

**La «regla de los 4 NO» de la AEAT.** Queda dentro quien cumple estas cuatro condiciones:
1. No factura exclusivamente a mano.
2. No lleva sus libros por el SII.
3. No tiene su domicilio fiscal en el País Vasco ni en Navarra.
4. No tiene una resolución de no aplicación.

**Cuándo hay SII.** El SII es obligatorio para quien liquida el IVA por meses (art. 71.3 RIVA). Liquidan por meses:
- Quien superó un volumen de operaciones de 6.010.121,04 € el año anterior.
- Quien adquiere un patrimonio empresarial y, sumando el del transmitente, supera ese umbral.
- Los inscritos en el REDEME.
- Los grupos de entidades.
- Los titulares de depósitos fiscales de gasolinas, gasóleos o biocarburantes, y quienes extraen esos productos de ellos.

El resto puede optar voluntariamente por el SII.

**Ojo con las hojas de cálculo.** Una hoja de cálculo con una macro que genera libros registro sí es SIF.

**Referencias normativas**
- RRSIF:
  - art. 1.3 (territorios forales): https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1
  - art. 3 (ámbito subjetivo y exclusión del SII): https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a3
  - art. 4 (operaciones excluidas): https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a4
  - art. 5 (resolución de no aplicación): https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a5
- Reglamento del IVA (RD 1624/1992):
  - art. 62.6 (SII): https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a62
  - art. 71.3 (liquidación mensual; el ordinal 5.º lo añadió la DF 3.ª de la Ley 7/2024, en vigor el 22/12/2024): https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a71
- Art. 9 de la Ley 27/2014 del Impuesto sobre Sociedades (entidades exentas): https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a9
- AEAT, FAQ «Cuestiones generales: ámbitos de aplicación» (actualizadas a 21/10/2026): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html

### Bloque 3. Calendario vigente a 28/10/2026 y aplazamiento anunciado

El BOE ha cambiado el calendario dos veces, y hay un tercer aplazamiento que solo está anunciado:

| Momento | Contribuyentes del IS | Resto de obligados |
|---|---|---|
| Texto original del RD 1007/2023 | Antes del 1/7/2025 | Antes del 1/7/2025 |
| RD 254/2025 | Antes del 1/1/2026 | Antes del 1/7/2026 |
| RDL 15/2025 (vigente; convalidado por el Congreso el 11/12/2025) | **Antes del 1/1/2027** | **Antes del 1/7/2027** |

**Productores.** Debían ofrecer productos adaptados desde el 29/07/2025, nueve meses después de la entrada en vigor de la Orden HAC/1177/2024.

**Aplazamiento anunciado.** El 5/10/2026 Hacienda anunció su previsión de aplazar las obligaciones pendientes hasta octubre de 2028. El objetivo es alinearlas con la factura electrónica de pymes y autónomos.

**Situación a 28/10/2026.** No hay ninguna norma publicada en el BOE ni ningún proyecto en tramitación pública. Las Cortes están disueltas, pero eso no impide el cambio, por dos motivos:
- El RD 1007/2023 conserva su rango reglamentario, así que el Gobierno puede modificarlo.
- Hasta las elecciones, el Gobierno conserva plenas facultades. De hecho, después de la disolución ha aprobado los reales decretos-leyes 28/2026 a 31/2026.

Mientras no se publique una norma, rigen las fechas de 2027.

**Referencias normativas**
- Disposición final 4.ª del RD 1007/2023 (redacción vigente): https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#df-4
- Real Decreto 254/2025, de 1 de abril (BOE 2/4/2025): https://www.boe.es/buscar/doc.php?id=BOE-A-2025-6600
- Real Decreto-ley 15/2025, de 2 de diciembre, disposiciones finales 1.ª y 2.ª (BOE 3/12/2025; en vigor 4/12/2025): https://www.boe.es/buscar/doc.php?id=BOE-A-2025-24446
- Resolución de 11/12/2025 de convalidación (BOE 16/12/2025): https://www.boe.es/buscar/doc.php?id=BOE-A-2025-25695
- Nota informativa del Ministerio de Hacienda de 5/10/2026: https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf
- AEAT, nota informativa sobre la ampliación del plazo (página actualizada 13/10/2026): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/nota-informativa-ampliacion-plazo-adaptacion-facturacion.html
- Real Decreto 806/2026, de 5 de octubre, de disolución de las Cortes (elecciones el 29/11/2026): https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742
- Art. 78.2 de la Constitución (la Diputación Permanente asume la convalidación de decretos-leyes con las Cámaras disueltas): https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229#a78
- Sumarios del BOE de 7, 14 y 21/10/2026 (RDL 28/2026 a 31/2026), por la API de datos abiertos:
  - https://www.boe.es/datosabiertos/api/boe/sumario/20261007
  - https://www.boe.es/datosabiertos/api/boe/sumario/20261014
  - https://www.boe.es/datosabiertos/api/boe/sumario/20261021

### Bloque 4. VERI\*FACTU o NO VERI\*FACTU: qué cambia en el día a día

Todos los SIF cumplen los mismos principios, pero el usuario elige la modalidad.

**VERI\*FACTU.** El sistema remite automáticamente a la AEAT todos los registros. A cambio:
- Se presume que el sistema cumple por diseño.
- Basta la huella; no hace falta firma electrónica.
- No necesita registro de eventos.
- No se le aplica el requerimiento de copia de los registros conservados.
- No tiene las obligaciones de conservación y exportación del art. 8 de la Orden, porque los registros ya están en la AEAT.

La factura lleva el QR y la frase «VERI\*FACTU» o «Factura verificable en la sede electrónica de la AEAT». La opción dura, como mínimo, hasta el 31 de diciembre del año del primer envío. La AEAT exceptúa de esta permanencia el periodo de pruebas previo a la fecha obligatoria.

**NO VERI\*FACTU.** El usuario conserva los registros en el propio sistema o, tras una exportación segura, fuera de él. Los registros van firmados electrónicamente (XAdES), el sistema lleva registro de eventos y los registros se entregan cuando la AEAT los requiere. La factura lleva QR, pero no la frase.

**Referencias normativas**
- RRSIF:
  - art. 8: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a8
  - art. 12: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-4
  - art. 14: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-6
  - art. 15: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-7
  - art. 16: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1-8
- Orden HAC/1177/2024:
  - art. 3: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a3
  - art. 8: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a8
  - art. 9: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a9
  - art. 14: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-6
  - art. 16: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-8
  - art. 17: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-9
  - art. 18: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-10
  - art. 20: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a2-2
  - art. 21: https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a2-3
- Art. 6.5 RD 1619/2012: https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6
- AEAT, FAQ «Sistemas VERI\*FACTU» (21/10/2026): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/sistemas-verifactu.html
- AEAT, FAQ «Cuestiones generales: objeto» (periodo de pruebas): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes.html

### Bloque 5. Sanciones y relación con la factura electrónica B2B

El art. 201 bis LGT tipifica dos infracciones graves.

**Productores y comercializadores.**
- 150.000 € por cada ejercicio con ventas y por cada tipo de sistema que, por ejemplo, permita llevar contabilidades distintas, ocultar o alterar registros, o incumpla las especificaciones.
- 1.000 € por cada sistema vendido sin certificar.

**Usuarios.** 50.000 € por ejercicio por tener un sistema no certificado o alterado. Según la AEAT, tras la fecha obligatoria puede bastar con conservar un SIF no adaptado que todavía permita facturar.

**Verifactu no es la factura electrónica B2B.** La factura electrónica B2B deriva de la Ley 18/2022 y del RD 238/2026. La Orden HAC/1028/2026 entró en vigor el 6/10/2026, así que se exige:
- desde el 6/10/2027, a quien tenga un volumen de operaciones superior a 8 M€;
- desde el 6/10/2028, al resto.

Las dos normas se conectan porque el software de factura electrónica también debe cumplir el art. 29.2.j) LGT.

**Referencias normativas**
- Art. 201 bis LGT (ojo: el BOE lo ancla como «a2-2»): https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a2-2
- Art. 188 LGT (reducciones de sanciones): https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a188
- Art. 2 bis.6 de la Ley 56/2007 (redacción del art. 12 de la Ley 18/2022, con efectos diferidos): https://www.boe.es/buscar/act.php?id=BOE-A-2007-22440#a2bis
- Ley 18/2022:
  - art. 12: https://www.boe.es/buscar/act.php?id=BOE-A-2022-15818#a1-4
  - DF 8.ª: https://www.boe.es/buscar/act.php?id=BOE-A-2022-15818#df-8
- RD 238/2026 (BOE 31/3/2026; en vigor 20/4/2026):
  - art. 2.d): https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#a2
  - art. 4: https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#a4
  - DT 2.ª: https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#dt-2
  - DT 3.ª: https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#dt-3
  - DF 4.ª: https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#df-4
- Orden HAC/1028/2026 (BOE 5/10/2026; en vigor 6/10/2026): https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20587
- AEAT, calendario de la factura electrónica (13/10/2026): https://sede.agenciatributaria.gob.es/Sede/iva/factura-electronica/calendario-implantacion.html
- AEAT, FAQ sobre sanciones y plazos («Cuestiones generales: objeto», 21/10/2026): https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes.html

---

## 4. Términos clave

| Término | Definición breve y precisa | Fuente |
|---|---|---|
| **Sistema informático de facturación (SIF)** | Conjunto de *hardware* y *software* que se usa para expedir facturas. Admite la entrada de datos de facturación, los conserva y los procesa para producir otros resultados. Incluye, por ejemplo, ERP, TPV, programas en la nube y hojas de cálculo que generan libros registro. | Art. 1.2 RRSIF: https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1 · FAQ AEAT ámbitos |
| **Registro de facturación (alta / anulación)** | Fichero XML que el SIF genera automáticamente. El de alta se genera al expedir cada factura o justo antes; el de anulación, para anular una factura emitida por error. Contiene los datos de la factura, los del sistema y la huella del registro anterior. | Arts. 9 a 11 RRSIF (#a9, #a1-2, #a1-3); arts. 10 y 11 Orden HAC/1177/2024 |
| **Huella o *hash*** | Resumen criptográfico de los datos clave del registro, que encadena cada registro con el anterior: cualquier alteración rompe la cadena y se detecta. En el alta se calcula sobre: NIF del emisor, número y serie, fecha de expedición, tipo de factura, cuota total, importe total, huella del registro anterior, y fecha, hora y huso horario de generación. | Art. 12 RRSIF (#a1-4); art. 13 Orden HAC/1177/2024 (#a1-5) |
| **VERI\*FACTU (sistema de emisión de facturas verificables)** | Modalidad en la que el SIF remite a la AEAT todos los registros que genera, de forma continuada, automática e instantánea. Exime de firmar los registros, del registro de eventos y de las obligaciones de conservación y exportación del art. 8 de la Orden. Obliga a mantener la opción hasta el 31 de diciembre del año del primer envío. | Art. 16 RRSIF (#a1-8); arts. 3 y 17 Orden |
| **Declaración responsable** | Certificación escrita con la que el productor afirma que su sistema, en cada versión, cumple el art. 29.2.j) LGT, el RRSIF y la Orden. Debe estar visible en el propio sistema y entregarse al cliente y al comercializador. | Art. 13 RRSIF (#a1-5); art. 15 Orden HAC/1177/2024 (#a1-7) |
| **Registro de eventos** | Bitácora encadenada y firmada que exige la modalidad NO VERI\*FACTU. Registra, entre otros, el inicio y el fin del modo NO VERI\*FACTU, la detección de anomalías, las restauraciones de copias y las exportaciones. Genera un resumen al menos cada 6 horas de funcionamiento. | Art. 8.3 RRSIF (#a8); art. 9 Orden HAC/1177/2024 (#a9) |

---

## 5. Ejemplo realista resuelto paso a paso

> Datos ficticios, construidos para la formación. Fecha de análisis: 28/10/2026. Se aplican las fechas **vigentes**; el escenario anunciado se trata al final de cada caso.

### Caso A. «Ferretería Albufera, S.L.» (sociedad)

**Datos.**
- S.L. con domicilio fiscal en Valencia y contribuyente del Impuesto sobre Sociedades.
- Volumen de operaciones de 2025: 2.400.000 €. IVA trimestral.
- No está inscrita en el REDEME, no forma parte de un grupo de IVA ni ha optado voluntariamente por el SII.
- Factura con un ERP en la nube (facturas completas a profesionales) y con un TPV en la tienda (facturas simplificadas).

| Paso | Qué comprobamos | Regla y cálculo | Resultado |
|---|---|---|---|
| 1 | ¿Debe llevar el SII? | Umbral de liquidación mensual (art. 71.3.1.º RIVA): 6.010.121,04 €. Margen = 6.010.121,04 − 2.400.000,00 = **3.610.121,04 €** por debajo. Sin REDEME, sin grupo, sin opción voluntaria y sin ningún otro supuesto del art. 71.3 RIVA. | No lleva SII, así que no le alcanza la exclusión del art. 3.3 RRSIF |
| 2 | Regla de los 4 NO | Usa SIF (ERP y TPV) · no lleva SII · domicilio en territorio común · sin resolución del art. 5 | **Obligada** (art. 3.1.a RRSIF) |
| 3 | Fecha vigente | DF 4.ª RD 1007/2023: «antes del 1 de enero de 2027». Días = 01/01/2027 − 28/10/2026 = 3 (oct.) + 30 (nov.) + 31 (dic.) + 1 = **65 días** | Último día con sistema no adaptado: 31/12/2026. Periodo de pruebas hasta esa fecha (criterio AEAT) |
| 4 | Inventario de sistemas | 2 sistemas que expiden facturas → **2 declaraciones responsables** (art. 13 RRSIF). También hay QR en los tiques (art. 7.5 RD 1619/2012) | Pedir ambas declaraciones al proveedor o proveedores |
| 5 | Exposición si el TPV no se adapta y sigue facturando en 2027 y 2028 | Sanción = n.º de ejercicios × 50.000 € = 2 × 50.000 = **100.000 €**. Con la reducción del 40 % por pago en plazo sin recurso (art. 188.3 LGT): 100.000 × (1 − 0,40) = **60.000 €**. La reducción del 30 % por conformidad no se aplica, porque el art. 188.1 solo alcanza a los arts. 191 a 197. | Riesgo de 100.000 € (60.000 € con pronto pago) |
| 6 | Factura electrónica B2B | Volumen ≤ 8.000.000 € → 24 meses desde la entrada en vigor de la Orden HAC/1028/2026: 06/10/2026 + 24 meses = **06/10/2028**. Se supone que su volumen de 2026 tampoco supera 8 M€: es el que cuenta para la fase de 2027 (DF 4.ª.1.a RD 238/2026). Los tiques del TPV quedan fuera de la factura electrónica obligatoria, salvo las facturas simplificadas cualificadas del art. 7.2 ROF (art. 4.1 RD 238/2026). | Emitir y recibir facturas electrónicas, e informar de estados y pagos, desde el 06/10/2028 |
| 7 | Escenario anunciado | Nota de Hacienda de 5/10/2026: previsión de llevar las obligaciones pendientes a octubre de 2028 | **Sin efecto jurídico** hasta que se publique en el BOE. Planificar con el 1/1/2027 |

**Nota de lectura del paso 5.** El art. 201 bis.4 LGT fija la multa del usuario «por cada ejercicio», sin multiplicarla por el número de sistemas. En cambio, la multa del productor sí se multiplica por tipo de sistema. Es una lectura literal del precepto; no se ha localizado doctrina administrativa que la desarrolle.

**Lo que la S.L. debe exigir a su proveedor (lista de comprobación)**
1. **Declaración responsable** de cada sistema y versión, visible en el programa y entregada al cliente (art. 15 Orden HAC/1177/2024):
   - Debe empezar por el título «DECLARACIÓN RESPONSABLE DEL SISTEMA INFORMÁTICO DE FACTURACIÓN».
   - Entre otros datos, debe incluir: nombre y código del sistema, versión, componentes, si solo funciona como VERI\*FACTU, si admite varios obligados, tipos de firma, identificación del productor, y fecha y lugar de firma.
2. Generación automática de **registros de alta y anulación** encadenados con huella (arts. 9 a 12 RRSIF).
3. **Código QR** de entre 30×30 y 40×40 mm en las facturas completas y en las simplificadas. En la factura electrónica estructurada basta con incluir la URL del QR como un campo (arts. 20 y 21 de la Orden).
4. **Modalidad** elegida:
   - VERI\*FACTU: remisión automática y frase en la factura.
   - NO VERI\*FACTU: firma XAdES con certificado cualificado, registro de eventos y remisión a requerimiento.
5. **Exportación** de registros y conservación garantizada aunque se cambie de programa (art. 8 de la Orden). Es imprescindible en NO VERI\*FACTU. En VERI\*FACTU no es exigible, porque el art. 3 de la Orden excluye el art. 8: los registros ya están en la AEAT.
6. Si un mismo sistema factura para varios obligados (por ejemplo, una asesoría que factura por cuenta de sus clientes), **cadenas separadas por obligado**. El cliente sigue siendo responsable (arts. 6 y 7 RRSIF; art. 2 de la Orden).
7. Sistemas con **contrato de mantenimiento plurianual**: deben estar adaptados antes de las fechas de los usuarios (DF 4.ª RD 1007/2023).

### Caso B. «Marta Soler, diseñadora gráfica» (autónoma)

**Datos.**
- Persona física en el IRPF (estimación directa), con domicilio fiscal en Girona.
- Emite unas 90 facturas al año a empresas. Volumen de operaciones de 2025: 68.000 €.
- Factura con una plantilla de Excel cuya macro genera automáticamente su libro registro de facturas expedidas.

| Paso | Qué comprobamos | Regla y cálculo | Resultado |
|---|---|---|---|
| 1 | ¿Su Excel es un SIF? | FAQ de la AEAT: una hoja de cálculo pasa a ser SIF si procesa los datos para generar libros registro u otras salidas tributarias (por ejemplo, con una macro) | **Sí es SIF** |
| 2 | Regla de los 4 NO | Usa SIF · no lleva SII · Girona es territorio común · sin resolución | **Obligada** (art. 3.1.b RRSIF) |
| 3 | Fecha vigente | «Resto de obligados»: antes del 1/7/2027. Días = 01/07/2027 − 28/10/2026 = 3 + 30 + 31 + 31 + 28 + 31 + 30 + 31 + 30 + 1 = **246 días** | Último día con sistema no adaptado: 30/06/2027 (fin del periodo de pruebas) |
| 4 | Opciones | (a) Programa adaptado con declaración responsable. (b) Aplicación gratuita de la AEAT: es VERI\*FACTU por definición (art. 16.4 RRSIF) y exige facturar en nombre propio o por apoderado, y siempre con destinatario (art. 19 de la Orden). (c) Facturación íntegramente manual, que queda fuera del RRSIF; en general no se pueden mezclar facturas manuales y facturas con SIF (FAQ AEAT). | Recomendación: (a) o (b), según volumen y necesidades |
| 5 | Exposición si mantiene el Excel con macro en 2027 | 1 ejercicio × 50.000 € = **50.000 €**. Con la reducción del 40 %: 50.000 × 0,60 = **30.000 €**. Peso sobre su volumen anual: 50.000 / 68.000 = **73,5 %** | La sanción es fija: no depende del tamaño del negocio |
| 6 | Factura electrónica B2B | Volumen ≤ 8 M€; se supone que el de 2026 tampoco supera 8 M€. Emitir y recibir desde 06/10/2026 + 24 meses = **06/10/2028**. Informar de estados (incluido el pago) 12 meses después: 06/10/2028 + 12 meses = **06/10/2029** (DT 3.ª RD 238/2026) | Dos hitos B2B distintos para la autónoma |
| 7 | Escenario anunciado | Si se aprobara la alineación anunciada, su obligación Verifactu pasaría a octubre de 2028 | Hoy no es exigible: planificar con el 1/7/2027 |

**Resumen comparativo de fechas (vigentes a 28/10/2026)**

| Obligación | Caso A (S.L., 2,4 M€) | Caso B (autónoma, 68.000 €) |
|---|---|---|
| Verifactu (RRSIF) | Antes del 1/1/2027 | Antes del 1/7/2027 |
| Fin del periodo de pruebas sin permanencia (criterio AEAT) | 31/12/2026 | 30/06/2027 |
| Factura electrónica B2B: emitir y recibir | 06/10/2028 | 06/10/2028 |
| Factura electrónica B2B: informar de estados y pagos | 06/10/2028 | 06/10/2029 |
| Fecha anunciada, **no vigente** | Octubre de 2028 | Octubre de 2028 |

---

## 6. Propuesta de apoyo visual

### 6.1 Visual principal: línea de tiempo interactiva «Vigente frente a anunciado»

Dos carriles horizontales (Verifactu arriba, factura electrónica B2B abajo), una marca de «Hoy: 28/10/2026» y un conmutador que muestra u oculta lo **anunciado** (trazo discontinuo y etiqueta «previsión, sin norma»). Al pulsar cada hito se abre la referencia normativa. Datos exactos:

| Fecha | Hito | Carril | Estado | Fuente |
|---|---|---|---|---|
| 11/10/2021 | Entran en vigor los arts. 29.2.j) y 201 bis LGT | Verifactu | Histórico | Notas del BOE a la LGT |
| 07/12/2023 | Entra en vigor el RD 1007/2023 (BOE 6/12/2023) | Verifactu | Histórico | BOE-A-2023-24840 |
| 29/10/2024 | Entra en vigor la Orden HAC/1177/2024 (BOE 28/10/2024) | Verifactu | Vigente | BOE-A-2024-22138 |
| 03/04/2025 | Entra en vigor el RD 254/2025 (fechas 1/1/2026 y 1/7/2026) | Verifactu | Superado | BOE-A-2025-6600 |
| 29/07/2025 | Productores: software plenamente adaptado. Límite para que la AEAT habilite el servicio de recepción VERI\*FACTU | Verifactu | Exigible | DF 4.ª RD 1007/2023; AEAT |
| 04/12/2025 | Entra en vigor el RDL 15/2025 (fechas 2027) | Verifactu | Vigente | BOE-A-2025-24446 |
| 11/12/2025 | Convalidación del RDL 15/2025 por el Congreso | Verifactu | Vigente | BOE-A-2025-25695 |
| 20/04/2026 | Entra en vigor el RD 238/2026 (efectos diferidos) | B2B | Vigente | BOE-A-2026-7295 |
| 05/10/2026 | Nota de Hacienda: previsión de aplazar a octubre de 2028 | Verifactu | **Anunciado** | Nota de Hacienda |
| 06/10/2026 | Entra en vigor la Orden HAC/1028/2026: arranca el cómputo B2B | B2B | Vigente | BOE-A-2026-20587 |
| 06/10/2026 | El BOE publica el RD 806/2026 (disolución de las Cortes) | Contexto | — | BOE-A-2026-20742 |
| 28/10/2026 | **Hoy (fecha de corte)** | Ambos | — | — |
| 29/11/2026 | Elecciones generales | Contexto | — | RD 806/2026 |
| 31/12/2026 | Fin del periodo de pruebas para contribuyentes del IS | Verifactu | Vigente (criterio AEAT) | FAQ AEAT |
| 01/01/2027 | Límite Verifactu: contribuyentes del IS | Verifactu | **Vigente** | DF 4.ª RD 1007/2023 |
| 30/06/2027 | Fin del periodo de pruebas para el resto | Verifactu | Vigente (criterio AEAT) | FAQ AEAT |
| 01/07/2027 | Límite Verifactu: resto de obligados | Verifactu | **Vigente** | DF 4.ª RD 1007/2023 |
| 06/10/2027 | B2B: volumen > 8 M€ (más PDF durante 12 meses) y plataformas privadas | B2B | Vigente | RD 238/2026; AEAT |
| 06/10/2028 | B2B: resto de empresarios y profesionales | B2B | Vigente | RD 238/2026; AEAT |
| Octubre de 2028 (día sin concretar) | Verifactu, si se aprueba la alineación | Verifactu | **Anunciado** | Nota de Hacienda |
| 06/10/2029 | B2B: estados de factura de personas físicas y entidades en atribución ≤ 8 M€ | B2B | Vigente | DT 3.ª RD 238/2026; AEAT |

### 6.2 Árbol de decisión «¿Le afecta a mi cliente y desde cuándo?»

1. ¿Expide facturas, por obligación o voluntariamente?
   - **No** → fuera del RRSIF (FAQ AEAT).
   - **Sí** → 2. Ojo: aunque no esté obligado a facturar, si expide facturas voluntariamente con un SIF, la AEAT considera aplicable el RRSIF (FAQ ámbitos: régimen de agricultura, ganadería y pesca y recargo de equivalencia).
2. ¿Utiliza algún SIF (ERP, TPV, programa en la nube, hoja de cálculo que genera libros)?
   - **No, todo a mano** → fuera.
   - **Sí** → 3.
3. ¿Lleva los libros por el SII, por liquidar el IVA por meses (art. 71.3 RIVA) o por opción voluntaria?
   - **Sí** → fuera (art. 3.3 RRSIF).
   - **No** → 4.
4. ¿Tiene su domicilio fiscal en el País Vasco o en Navarra, con normativa foral?
   - **Sí** → normativa foral propia (por ejemplo, TicketBAI de las Haciendas forales vascas).
   - **No** (Canarias, Ceuta y Melilla incluidas) → 5.
5. ¿Tiene resolución de no aplicación (art. 5)?
   - **Sí** → lo que diga la resolución.
   - **No** → 6.
6. ¿Es contribuyente del Impuesto sobre Sociedades?
   - **Sí** → **antes del 1/1/2027**.
   - **No** (IRPF con actividad, no residente con establecimiento permanente, entidad en atribución) → **antes del 1/7/2027**.

Rama lateral: ¿es productor o comercializador de software? Entonces está obligado desde el **29/07/2025**.

### 6.3 Comparativa VERI\*FACTU frente a NO VERI\*FACTU (tabla comparativa)

| Aspecto | VERI\*FACTU | NO VERI\*FACTU |
|---|---|---|
| Remisión a la AEAT | Automática y continua de todos los registros (art. 16.1 RRSIF), con un control de flujo inicial de 60 segundos entre envíos (art. 16.2 Orden) | Solo a requerimiento (art. 14.2 RRSIF; art. 18 Orden) |
| Huella o *hash* | Sí | Sí |
| Firma electrónica de los registros | No (art. 16.3 RRSIF) | Sí, XAdES con certificado cualificado (art. 12 RRSIF; art. 14 Orden) |
| Registro de eventos | No (art. 3 Orden) | Sí, con resumen cada 6 horas (art. 9 Orden) |
| Conservación y exportación de registros por el usuario | No se le exige (art. 3 Orden): los registros ya están en la AEAT | Sí, durante el plazo de conservación de las facturas, incluso si cambia de sistema (art. 8 Orden) |
| Código QR | Sí | Sí |
| Frase en la factura | «VERI\*FACTU» o «Factura verificable en la sede electrónica de la AEAT» | No |
| Permanencia | Hasta el 31/12 del año del primer envío (art. 16.5 RRSIF; art. 17 Orden), salvo en el periodo de pruebas | No aplica |
| Si falla la conexión | Seguir facturando y reintentar al menos cada hora, avisando de la incidencia (art. 16.4 Orden; FAQ AEAT) | No aplica: no hay remisión continua |

### 6.4 Calculadora interactiva «Plazo y exposición»

- **Entradas:** tipo de cliente (IS / resto); fecha de hoy; n.º de ejercicios con SIF no adaptado (n); ¿pago en plazo sin recurso? (sí/no).
- **Fórmulas:**
  - Días restantes = fecha límite − hoy. Con hoy = 28/10/2026: **65** días para el IS y **246** para el resto.
  - Sanción del usuario = n × 50.000 € × (1 − 0,40), si hay pronto pago sin recurso; sin pronto pago, n × 50.000 €.
  - Sanción del productor por las letras a) a e) del art. 201 bis.1 = 150.000 € × ejercicios con ventas × tipos de sistema.
  - Sanción del productor por falta de certificación (letra f) = 1.000 € × sistemas vendidos sin certificar.
- **Valores de prueba:**
  - n = 1 → 50.000 € (30.000 € con pronto pago).
  - n = 2 → 100.000 € (60.000 €).
  - n = 3 → 150.000 € (90.000 €).
  - Productor con 2 tipos de sistema en 1 ejercicio → 300.000 €.
  - 35 sistemas sin certificar → 35.000 €.

---

## 7. Errores frecuentes o ideas erróneas habituales

1. **«Verifactu ya está aplazado a octubre de 2028.»** Falso a 28/10/2026. Es una previsión que Hacienda anunció el 5/10/2026. El BOE mantiene el 1/1/2027 (IS) y el 1/7/2027 (resto), y la AEAT conserva esas fechas en sus FAQ actualizadas a 21/10/2026. *Feedback:* un anuncio no modifica un reglamento; hace falta una norma publicada que cambie la DF 4.ª del RD 1007/2023.
2. **«Verifactu obliga a enviar todas las facturas a Hacienda en tiempo real.»** Falso. La remisión es propia de la modalidad VERI\*FACTU, que es opcional. La modalidad NO VERI\*FACTU es válida si firma los registros, lleva registro de eventos y los entrega cuando la AEAT los requiere (arts. 12, 14.2, 15 y 16 RRSIF).
3. **«Si facturo con Excel o Word no me afecta.»** Depende. Para la AEAT, la hoja de cálculo es SIF si genera libros registro u otras salidas tributarias (por ejemplo, con una macro). Solo queda fuera quien factura íntegramente a mano. Además, en general no se pueden mezclar facturas manuales y facturas emitidas con SIF.
4. **«Verifactu y la factura electrónica B2B son lo mismo.»** Falso. Son normas, calendarios y obligaciones distintas. El RRSIF regula el registro inalterable de las facturas emitidas. El RD 238/2026 regula el formato electrónico estructurado entre empresas y la información sobre estados y pagos. Se conectan porque el software de factura electrónica también debe cumplir el art. 29.2.j) LGT (art. 2 bis.6 Ley 56/2007; art. 2.d RD 238/2026).
5. **«Las sanciones son solo para el proveedor del software.»** Falso. El usuario que tenga un sistema no certificado o alterado se expone a 50.000 € por ejercicio (art. 201 bis LGT). El productor se expone a 150.000 € por ejercicio y tipo de sistema, o a 1.000 € por sistema vendido sin certificar.

---

## 8. Idea clave final

A 28/10/2026 manda el BOE, no los titulares:
- Sociedades: antes del 1/1/2027.
- Autónomos y resto de obligados: antes del 1/7/2027.
- El aplazamiento a octubre de 2028 solo será exigible cuando se publique.

Aplica la regla de los 4 NO, exige a cada proveedor su declaración responsable y no confundas Verifactu con la factura electrónica B2B (6/10/2027 o 6/10/2028).

---

## 9. Test de la formación

**Pregunta 1.** Hoy, 28/10/2026, la administradora de una S.L. te dice que ha leído que Verifactu se aplaza a octubre de 2028 y que va a parar la adaptación de su software. La sociedad es contribuyente del Impuesto sobre Sociedades, liquida el IVA trimestralmente, tiene su domicilio fiscal en Madrid y no lleva SII. ¿Qué le respondes?

- A) Que tiene razón: la nota de Hacienda de 5/10/2026 ya ha trasladado su obligación a octubre de 2028.
- B) Que su fecha exigible sigue siendo antes del 1/1/2027, porque el aplazamiento solo será efectivo cuando una norma publicada en el BOE modifique la DF 4.ª del RD 1007/2023.
- C) Que su fecha es antes del 1/7/2026, según el RD 254/2025.
- D) Que, por ser una pyme, su fecha es antes del 1/7/2027.

**Correcta: B**

- **Por qué B es correcta:** la DF 4.ª del RD 1007/2023, en la redacción del RDL 15/2025 (convalidado el 11/12/2025), fija para los contribuyentes del IS la adaptación antes del 1/1/2027. El texto consolidado del BOE no recoge ninguna modificación posterior, y la AEAT mantiene esa fecha en sus FAQ de 21/10/2026.
- **Por qué A es incorrecta:** la nota de Hacienda es una previsión. Una nota de prensa no modifica un reglamento ni tiene efectos jurídicos hasta que se apruebe y publique la norma.
- **Por qué C es incorrecta:** las fechas del RD 254/2025 (1/1/2026 para el IS y 1/7/2026 para el resto) quedaron sustituidas por el RDL 15/2025. Además, el 1/7/2026 nunca fue la fecha de las sociedades.
- **Por qué D es incorrecta:** el RRSIF distingue por tipo de contribuyente, no por tamaño: todo contribuyente del IS (art. 3.1.a) tiene la fecha del 1/1/2027. El umbral de 8 M€ pertenece al calendario de la factura electrónica B2B.

**Pregunta 2.** Según el RRSIF y el criterio publicado por la AEAT, ¿cuál de estos clientes **no** está sujeto al RRSIF? Todos tienen su domicilio fiscal en territorio común.

- A) Un autónomo en estimación directa que factura con un programa en la nube.
- B) Una S.L. inscrita en el REDEME (devolución mensual del IVA).
- C) Una sociedad patrimonial que emite sus facturas de alquiler con un ERP.
- D) Una comunidad de bienes (taller de reparación) que factura con un programa de facturación.

**Correcta: B**

- **Por qué B es correcta:** quien está en el REDEME liquida el IVA por meses (art. 71.3.3.º RIVA) y, por ello, lleva sus libros por el SII (art. 62.6 RIVA). El art. 3.3 RRSIF excluye a quienes llevan los libros por el SII.
- **Por qué A es incorrecta:** es contribuyente del IRPF con actividad económica y usa un SIF (art. 3.1.b RRSIF).
- **Por qué C es incorrecta:** las sociedades patrimoniales son contribuyentes del IS, y la AEAT confirma que están obligadas sea cual sea su actividad (art. 3.1.a RRSIF).
- **Por qué D es incorrecta:** una comunidad de bienes con actividad es una entidad en régimen de atribución de rentas que desarrolla actividades económicas (art. 3.1.d RRSIF).

**Pregunta 3.** Una sociedad decide usar su SIF en la modalidad NO VERI\*FACTU. ¿Qué afirmación es correcta?

- A) Debe firmar electrónicamente los registros de facturación y llevar un registro de eventos.
- B) Debe remitir de forma automática e instantánea cada registro a la AEAT.
- C) Debe imprimir en sus facturas la frase «VERI\*FACTU».
- D) Queda dispensada de incluir el código QR en sus facturas.

**Correcta: A**

- **Por qué A es correcta:** fuera de VERI\*FACTU, los registros deben firmarse electrónicamente (art. 12 RRSIF; firma XAdES según el art. 14 de la Orden), y el sistema debe llevar registro de eventos (art. 8.3 RRSIF; art. 9 de la Orden).
- **Por qué B es incorrecta:** la remisión automática y continua es lo que define a VERI\*FACTU (art. 16.1 RRSIF). En NO VERI\*FACTU los registros se conservan y se entregan a requerimiento (art. 14.2 RRSIF; art. 18 de la Orden).
- **Por qué C es incorrecta:** la frase solo se incluye cuando el sistema remite todos los registros a la AEAT (art. 6.5.b RD 1619/2012; art. 20.1.b de la Orden).
- **Por qué D es incorrecta:** el QR es obligatorio en las facturas expedidas con cualquier SIF, en ambas modalidades (art. 6.5.a RD 1619/2012; art. 20.1.a de la Orden).

---

## 10. Banco para la evaluación sectorial «Pon a prueba tus conocimientos»

**Pregunta B1.** En una comprobación, la AEAT constata que un autónomo siguió facturando durante 2027 (desde el 1 de julio) y durante 2028 con un programa no adaptado y sin declaración responsable. Le impone la sanción del art. 201 bis LGT por cada ejercicio. Si paga en periodo voluntario y no recurre, ¿cuánto ingresará en total?

- A) 100.000 €
- B) 60.000 €
- C) 70.000 €
- D) 42.000 €

**Correcta: B**

- **Por qué B es correcta:** 2 ejercicios × 50.000 € = 100.000 €. Se aplica la reducción del 40 % del art. 188.3 LGT, que vale para cualquier infracción (salvo actas con acuerdo) si se paga en plazo y no se recurre: 100.000 × (1 − 0,40) = 60.000 €.
- **Por qué A es incorrecta:** omite la reducción del 40 % por pronto pago sin recurso.
- **Por qué C es incorrecta:** aplica la reducción del 30 % por conformidad (100.000 × 0,70), que el art. 188.1 LGT reserva a las sanciones de los arts. 191 a 197, no a las del art. 201 bis.
- **Por qué D es incorrecta:** encadena el 30 % y el 40 % (100.000 × 0,70 × 0,60 = 42.000 €), pero el 30 % no es aplicable a esta infracción.

**Pregunta B2.** ¿Desde qué fecha deben los productores y comercializadores ofrecer sus sistemas de facturación plenamente adaptados al RRSIF?

- A) Desde el 29/07/2025.
- B) Desde el 1/1/2027.
- C) Desde el 1/7/2027.
- D) Desde octubre de 2028.

**Correcta: A**

- **Por qué A es correcta:** la DF 4.ª del RD 1007/2023 les da nueve meses desde la entrada en vigor de la Orden HAC/1177/2024 (29/10/2024): 29/10/2024 + 9 meses = 29/07/2025. La AEAT confirma esa fecha, y el RDL 15/2025 mantuvo la regla.
- **Por qué B es incorrecta:** es la fecha de los usuarios contribuyentes del IS. Para los productores solo opera como límite de los sistemas con contratos de mantenimiento plurianual.
- **Por qué C es incorrecta:** es la fecha del resto de usuarios (autónomos, establecimientos permanentes y entidades en atribución).
- **Por qué D es incorrecta:** es la fecha anunciada, no aprobada, y se refiere a las obligaciones pendientes de los usuarios, no a la de los productores, que ya es exigible.

**Pregunta B3.** Una S.L. sin SII, con un volumen de operaciones de 5 M€ en 2026 y en 2027, vende a otras empresas. Según el RD 238/2026 y la Orden HAC/1028/2026, ¿desde cuándo debe expedir y recibir facturas electrónicas en esas operaciones?

- A) Desde el 6/10/2027.
- B) Desde el 6/10/2028.
- C) Desde el 1/1/2027.
- D) Desde el 6/10/2029.

**Correcta: B**

- **Por qué B es correcta:** con un volumen no superior a 8 M€, la obligación nace 24 meses después de la entrada en vigor de la orden de la solución pública (DF 4.ª.1.b RD 238/2026): 06/10/2026 + 24 meses = 06/10/2028. Así lo recoge también el calendario de la AEAT.
- **Por qué A es incorrecta:** el 6/10/2027 es para quienes superaron los 8 M€ de volumen de operaciones en el año natural anterior.
- **Por qué C es incorrecta:** el 1/1/2027 es la fecha Verifactu de los contribuyentes del IS, una obligación distinta.
- **Por qué D es incorrecta:** el 6/10/2029 es la fecha en la que las personas físicas y las entidades en atribución de rentas con volumen ≤ 8 M€ deben informar de los estados de factura (DT 3.ª). No se aplica a una S.L. ni a la obligación de emitir y recibir.

**Pregunta B4.** Una autónoma emite sus facturas con una plantilla de Excel que, mediante una macro, genera automáticamente su libro registro de facturas expedidas. Según las FAQ de la AEAT (actualizadas a 21/10/2026), ¿qué le dirías?

- A) Que esa hoja de cálculo se considera un SIF y, por tanto, le afecta el RRSIF.
- B) Que nunca le afecta, porque Excel no es un programa de facturación.
- C) Que solo le afectará si opta voluntariamente por la modalidad VERI\*FACTU.
- D) Que solo le afectará si su volumen de operaciones supera 8 M€.

**Correcta: A**

- **Por qué A es correcta:** para la AEAT, una hoja de cálculo es SIF cuando procesa los datos de facturación para generar libros registro u otras salidas tributarias, como hace la macro. Al usar un SIF, la autónoma queda dentro del art. 3.1.b RRSIF.
- **Por qué B es incorrecta:** lo relevante es la función, no la marca del programa. Solo queda fuera el uso de la hoja de cálculo para teclear, imprimir o guardar facturas, o para listas simples con sumas.
- **Por qué C es incorrecta:** VERI\*FACTU es una modalidad para cumplir la obligación; la obligación nace por usar un SIF.
- **Por qué D es incorrecta:** el umbral de 8 M€ pertenece al calendario de la factura electrónica B2B (RD 238/2026), no al RRSIF.

---

## 11. Fuentes

### 11.1 Fuentes primarias (todas consultadas el 28/10/2026)

| # | Fuente | URL | Qué se ha verificado |
|---|---|---|---|
| 1 | Ley 58/2003, General Tributaria, texto consolidado (art. 29) | https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a29 | Texto de la letra j), que alcanza a sistemas contables, de facturación y de gestión. La añadió el art. 13.4 de la Ley 11/2021; en vigor desde el 11/10/2021 |
| 2 | LGT, art. 201 bis | https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a2-2 | Infracciones graves; 150.000 €, 1.000 € y 50.000 €. Lo añadió el art. 13.21 de la Ley 11/2021; en vigor desde el 11/10/2021 |
| 3 | LGT, art. 188 | https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a188 | 30 % solo para los arts. 191-197. 40 % para cualquier infracción con pago en plazo y sin recurso, salvo actas con acuerdo |
| 4 | Ley 11/2021, art. decimotercero y DF 7.ª | https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473#ad-3 | BOE núm. 164, de 10/07/2021; modifica la LGT. Los apartados cuatro y veintiuno entran en vigor a los tres meses |
| 5 | RD 1007/2023 y RRSIF, texto consolidado | https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840 | BOE núm. 291, de 06/12/2023; en vigor 07/12/2023. Última actualización publicada el 03/12/2025. Arts. 1, 3-8 y 9-17; DF 1.ª, 3.ª y 4.ª |
| 6 | RD 1007/2023, ficha «Análisis» | https://www.boe.es/buscar/doc.php?id=BOE-A-2023-24840 | Referencias posteriores: solo el RD 254/2025 y el RDL 15/2025; ninguna de 2026 |
| 7 | Orden HAC/1177/2024 | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138 | Orden de 17/10/2024, BOE núm. 260, de 28/10/2024; en vigor 29/10/2024. Corrección de errores en el BOE núm. 270, de 08/11/2024. Arts. 2, 3, 8, 9 y 13-21 |
| 8 | Real Decreto 254/2025 | https://www.boe.es/buscar/doc.php?id=BOE-A-2025-6600 | BOE núm. 80, de 02/04/2025; en vigor 03/04/2025. Fechas 1/1/2026 y 1/7/2026; fecha original 1/7/2025. Modifica los arts. 4 y 6 y la DF 4.ª |
| 9 | Real Decreto-ley 15/2025 | https://www.boe.es/buscar/doc.php?id=BOE-A-2025-24446 | BOE núm. 290, de 03/12/2025; en vigor 04/12/2025. DF 1.ª (fechas 2027) y DF 2.ª (salvaguarda del rango reglamentario) |
| 10 | Resolución de convalidación del RDL 15/2025 | https://www.boe.es/buscar/doc.php?id=BOE-A-2025-25695 | Acuerdo del Congreso de 11/12/2025; BOE núm. 301, de 16/12/2025 |
| 11 | RD 1619/2012, Reglamento de facturación (arts. 6 y 7) | https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6 | Apartado 5: QR y frase VERI\*FACTU; art. 7.5 para facturas simplificadas |
| 12 | RD 1624/1992, Reglamento del IVA (arts. 62 y 71) | https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a62 · https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a71 | SII para quien liquida por meses. Supuestos del art. 71.3: umbral de 6.010.121,04 €, adquisición de patrimonio empresarial, REDEME, grupo de entidades y depósitos fiscales de hidrocarburos (5.º, añadido por la Ley 7/2024; en vigor 22/12/2024). Opción voluntaria |
| 13 | Ley 27/2014, del Impuesto sobre Sociedades (art. 9) | https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a9 | Entidades totalmente exentas (Estado, comunidades autónomas, entidades locales, etc.) |
| 14 | Ley 18/2022 (art. 12 y DF 8.ª) | https://www.boe.es/buscar/act.php?id=BOE-A-2022-15818#a1-4 · https://www.boe.es/buscar/act.php?id=BOE-A-2022-15818#df-8 | Efectos al año y a los dos años del desarrollo reglamentario; condicionado a la excepción comunitaria |
| 15 | Ley 56/2007 (art. 2 bis) | https://www.boe.es/buscar/act.php?id=BOE-A-2007-22440#a2bis | Apartado 6: el software de factura electrónica debe cumplir el art. 29.2.j) LGT; efectos diferidos |
| 16 | Real Decreto 238/2026 | https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295 | Real Decreto de 25/03/2026, BOE núm. 79, de 31/03/2026; en vigor 20/04/2026. Arts. 2.d), 3 y 4; DT 2.ª y 3.ª; DF 3.ª y 4.ª |
| 17 | Orden HAC/1028/2026 | https://www.boe.es/buscar/act.php?id=BOE-A-2026-20587 | Orden de 2/10/2026, BOE núm. 247, de 05/10/2026; en vigor 06/10/2026. Inicia el cómputo de los plazos B2B |
| 18 | Real Decreto 806/2026 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742 | BOE núm. 248, de 06/10/2026. Elecciones el 29/11/2026; Cámaras el 23/12/2026 |
| 19 | Ley 50/1997, del Gobierno (art. 21) | https://www.boe.es/buscar/act.php?id=BOE-A-1997-25336#a21 | Gobierno en funciones tras las elecciones: despacho ordinario, salvo urgencia o interés general acreditados |
| 20 | Ministerio de Hacienda, nota informativa de 5/10/2026 | https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf | Previsión de aplazar las obligaciones pendientes hasta octubre de 2028 y posterior convergencia con ViDA. Los metadatos del PDF aluden a pymes y autónomos |
| 21 | Ministerio de Hacienda, tramitaciones abiertas de audiencia e información pública | https://www.hacienda.gob.es/es-ES/Normativa%20y%20doctrina/NormasEnTramitacion/Paginas/AudienciaAbiertas.aspx | A 28/10/2026 solo figuran dos proyectos (modelo 576 y módulos 2027); ninguno sobre el RD 1007/2023 |
| 22 | AEAT, página SIF y VERI\*FACTU | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html | Actualizada el 13/10/2026; enlaza la comunicación de Hacienda como «previsión» |
| 23 | AEAT, nota informativa sobre la ampliación del plazo | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/nota-informativa-ampliacion-plazo-adaptacion-facturacion.html | Fechas 2027 y periodo de pruebas; actualizada el 13/10/2026 |
| 24 | AEAT, FAQ «Cuestiones generales: objeto» | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes.html | Sanciones; tenencia de un SIF no adaptado; periodo de pruebas hasta el 31/12/2026 o el 30/06/2027; actualizadas el 21/10/2026 |
| 25 | AEAT, FAQ «Cuestiones generales: ámbitos de aplicación» | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html | Regla de los 4 NO; hojas de cálculo; facturación manual y mezcla; sociedades patrimoniales; forales; Canarias, Ceuta y Melilla; facturas voluntarias con SIF |
| 26 | AEAT, FAQ «Sistemas VERI\*FACTU» | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/sistemas-verifactu.html | Diferencias entre modalidades; permanencia; incidencias (seguir facturando); VERI\*FACTU exime de conservar y exportar; no sustituye los libros registro ni los modelos 347 y 349 |
| 27 | AEAT, novedades: RD 254/2025 | https://sede.agenciatributaria.gob.es/Sede/iva/novedades-iva/novedades-normativa-2025/real-decreto-254-2025-1-abril.html | Plazo de los productores: 29/07/2025 |
| 28 | AEAT, aplicación gratuita VERI\*FACTU (noticia de 13/10/2025) | https://sede.agenciatributaria.gob.es/Sede/todas-noticias/2025/octubre/13/aplicacion-gratuita-facturacion-verifactu.html | Aplicación gratuita para quien emite pocas facturas |
| 29 | AEAT, calendario de implantación de la factura electrónica | https://sede.agenciatributaria.gob.es/Sede/iva/factura-electronica/calendario-implantacion.html | 06/10/2027, 06/10/2028 y 06/10/2029; actualizada el 13/10/2026 |
| 30 | AEAT, novedades: RD 238/2026 | https://sede.agenciatributaria.gob.es/Sede/iva/novedades-iva/novedades-normativa-2026/real-decreto-238-2026-25-marzo.html | Fases de 12 y 24 meses; actualizada el 27/10/2026 |
| 31 | BOE, sumarios diarios del 05/10/2026 al 28/10/2026 (API de datos abiertos) | https://www.boe.es/datosabiertos/api/boe/sumario/20261028 (mismo patrón para cada fecha) | No se ha publicado ninguna disposición que modifique el RD 1007/2023. RDL 28 y 29/2026 (BOE 07/10), 30/2026 (BOE 14/10) y 31/2026 (BOE 21/10) |
| 32 | Constitución Española (art. 78.2) | https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229#a78 | Con las Cámaras disueltas, la Diputación Permanente asume las facultades del art. 86 |
| 33 | Directiva (UE) 2025/516 (ViDA), referencia del BOE | https://www.boe.es/buscar/doc.php?id=DOUE-L-2025-80487 | Directiva de 11/03/2025, publicada en el DOUE el 25/03/2025 y en vigor el 14/04/2025. Arts. 218 y 232 modificados; los Estados pueden aplicar ese cambio desde el 14/04/2025. Transposición escalonada hasta el 01/07/2030 y 2035 |
| 34 | AEAT, novedades: Directiva (UE) 2025/516 | https://sede.agenciatributaria.gob.es/Sede/iva/novedades-iva/novedades-normativa-2025/directiva-2025-516-consejo-11-2025.html | Calendario ViDA: factura electrónica nacional desde su entrada en vigor, «bajo determinadas condiciones»; información digital intracomunitaria desde el 01/07/2030 |
| 35 | Haciendas forales de Araba y Gipuzkoa, páginas TicketBAI | https://web.araba.eus/es/hacienda/ticketbai · https://www.gipuzkoa.eus/es/web/ogasuna/ticketbai | Existencia del sistema foral TicketBAI y de su registro de software garante |

### 11.2 Estado de vigencia a 28/10/2026 y cambios pendientes

- **Vigente y exigible:**
  - Arts. 29.2.j) y 201 bis LGT, desde el 11/10/2021.
  - RRSIF con la DF 4.ª en la redacción del RDL 15/2025: IS antes del 1/1/2027; resto antes del 1/7/2027; productores desde el 29/07/2025.
  - Orden HAC/1177/2024.

  El texto consolidado del BOE (última actualización publicada el 03/12/2025) y su ficha «Análisis» no recogen ninguna norma de 2026 que modifique el RD 1007/2023. Tampoco hay ninguna en los sumarios del BOE del 5 al 28/10/2026.
- **Vigente con efectos diferidos:** RD 238/2026 y Orden HAC/1028/2026 (factura electrónica B2B). Fechas: 06/10/2027, 06/10/2028 y, para los estados de factura de personas físicas y entidades en atribución con volumen ≤ 8 M€, 06/10/2029.
- **Pendiente (anunciado, sin norma):**
  - Aplazamiento de las obligaciones pendientes del RD 1007/2023 hasta octubre de 2028 (nota de Hacienda de 5/10/2026). Requiere una norma que modifique la DF 4.ª del RD 1007/2023.
  - Instrumento (análisis propio, no confirmado por Hacienda): como la DF 2.ª del RDL 15/2025 mantiene el rango reglamentario de ese real decreto, basta un real decreto, aunque en 2025 se usó un real decreto-ley.
  - Hacienda anuncia, además, una segunda modificación posterior para hacer converger ámbitos y aspectos técnicos con ViDA, manteniendo garantías sustancialmente equivalentes.
- **Contexto que condiciona la tramitación:**
  - El RD 806/2026 disolvió las Cortes; las elecciones son el 29/11/2026.
  - Hasta las elecciones, el Gobierno conserva sus facultades. Tras la disolución ha aprobado cuatro reales decretos-leyes (28 a 31/2026), cuya convalidación corresponde a la Diputación Permanente (art. 78.2 CE).
  - Tras las elecciones, el Gobierno queda en funciones y limita su gestión al despacho ordinario, salvo urgencia o interés general acreditados (art. 21.3 Ley 50/1997).
  - No consta en qué fecha se aprobará el aplazamiento ni si se hará antes del 1/1/2027.
- **Recomendación operativa para clientes:**
  - Planificar con las fechas de 2027.
  - Aprovechar el periodo de pruebas sin permanencia (hasta el 31/12/2026 o el 30/06/2027).
  - Revisar el BOE semanalmente hasta fin de año.

### 11.3 Datos NO VERIFICADOS (y por qué)

- **Día exacto y alcance del aplazamiento anunciado.** La nota de Hacienda habla de «octubre de 2028» y de las obligaciones pendientes del RD 1007/2023 en general. No precisa el día ni aclara expresamente si alcanza a todos los contribuyentes del IS (incluidos los de más de 8 M€). El texto justifica la alineación con la factura electrónica «para pymes y autónomos», y el título que figura en los metadatos del PDF alude también a pymes y autónomos. NO VERIFICADO: dependerá del texto de la norma que se apruebe.
- **Posible aprobación de la norma por el Consejo de Ministros aún no publicada.** No se han podido consultar las referencias del Consejo de Ministros de octubre de 2026 en la web de La Moncloa (las direcciones probadas devolvieron error 404). El BOE no ha publicado nada hasta el 28/10/2026. NO VERIFICADO.
- **Cumplimiento formal de la condición de la DF 8.ª de la Ley 18/2022** (excepción comunitaria a los arts. 218 y 232 de la Directiva 2006/112/CE). Sí se ha verificado que la Directiva (UE) 2025/516 añadió a esos artículos la posibilidad de imponer la factura electrónica nacional sin aceptación del destinatario, aplicable desde el 14/04/2025 (fuente 33). Pero no consta en el BOE una declaración expresa de que la condición se dé por cumplida; el RD 238/2026 solo se declara coherente con esa Directiva. NO VERIFICADO como dato formal.
- **Algoritmo de huella y ubicación exacta del QR.** La Orden HAC/1177/2024 remite a documentos técnicos de la sede de la AEAT (arts. 13.2 y 21.1), que no se han revisado para este dosier. NO VERIFICADO; no se citan en el contenido.
- **TicketBAI en Bizkaia.** Se ha confirmado en las webs oficiales de Araba y Gipuzkoa. La web de Bizkaia (Batuz) no ha podido leerse en esta revisión, porque su contenido se carga con JavaScript. NO VERIFICADO para Bizkaia.
- **Prensa y doctrina posteriores al 21/10/2026.** En esta revisión no se pudieron hacer búsquedas web generales porque se había agotado el cupo. La vigencia se ha comprobado directamente en las fuentes primarias:
  - sumarios del BOE del 5 al 28/10/2026;
  - texto consolidado y ficha «Análisis» del RD 1007/2023;
  - FAQ de la AEAT de 21/10/2026;
  - página de tramitaciones abiertas de Hacienda.

### 11.4 Nota técnica sobre las anclas del BOE

Las anclas del BOE no siempre coinciden con el número de artículo. Se han comprobado en el HTML descargado el 28/10/2026 (carpeta `research/downloads/11-fis-02-verifactu-verif-boe/`):

| Norma | Anclas |
|---|---|
| LGT | art. 29 → `#a29`; art. 188 → `#a188`; **art. 201 bis → `#a2-2`** |
| RRSIF | arts. 1 a 9 → `#a1` a `#a9`; **arts. 10 a 17 → `#a1-2` a `#a1-9`**; DF 4.ª → `#df-4` |
| Orden HAC/1177/2024 | arts. 1 a 9 → `#a1` a `#a9`; **arts. 10 a 19 → `#a1-2` a `#a1-11`**; **arts. 20 y 21 → `#a2-2` y `#a2-3`** |
| Ley 18/2022 | art. 12 → `#a1-4`; DF 8.ª → `#df-8` |
| RD 238/2026 | art. 2 → `#a2`; art. 4 → `#a4`; DT 2.ª → `#dt-2`; DT 3.ª → `#dt-3`; DF 4.ª → `#df-4` |
| Ley 11/2021 | art. decimotercero → `#ad-3` |
| Ley 56/2007 | art. 2 bis → `#a2bis` |
| RD 1619/2012 | arts. 6 y 7 → `#a6` y `#a7` |
| RIVA | arts. 62 y 71 → `#a62` y `#a71` |
| LIS | art. 9 → `#a9` |
| Ley 50/1997 | art. 21 → `#a21` |
| Constitución | art. 78 → `#a78` |

El RDL 15/2025 y el RD 254/2025 no tienen texto consolidado propio con anclas: su página `act.php` devuelve el texto original. Por eso se enlazan en su versión original (`doc.php`).

---

## 12. Tiempo de lectura estimado

- **Contenido formativo para el alumnado** (secciones 1 a 5, 7 y 8, sin las listas de referencias normativas): unas 3.040 palabras → **15 minutos** de lectura a 200 palabras por minuto, un ritmo prudente para texto técnico-jurídico. Si se leen también las referencias normativas (unas 3.480 palabras en total): unos 17 minutos.
- **Desglose orientativo:**
  - Núcleo conceptual (secciones 1, 2, 3, 7 y 8; unas 1.520 palabras): ≈ 7,5 minutos.
  - Términos clave (unas 370 palabras): ≈ 2 minutos.
  - Casos prácticos (unas 1.150 palabras): ≈ 6 minutos.
- **Test (sección 9):** unas 690 palabras; ≈ 3,5 minutos de lectura y 5 minutos con respuesta.
- **Banco sectorial (sección 10):** unas 760 palabras; ≈ 4 minutos de lectura y 7 minutos con respuesta.
- *Método:* recuento de palabras por secciones de esta versión verificada. La versión original declaraba unas 2.680 palabras (13 minutos); la diferencia se debe a las precisiones añadidas en la verificación.
- La sección 6 es una especificación para el equipo de diseño y no computa como lectura del alumnado.

---

## Registro de verificación

Verificación independiente realizada el 28/10/2026. Método: descarga directa de las fuentes primarias (BOE, AEAT, Ministerio de Hacienda, Haciendas forales) en `research/downloads/11-fis-02-verifactu-verif-boe/`, `research/downloads/11-fis-02-verifactu-verif-web/`, `research/downloads/11-fis-02-verifactu-verif-web2/` y `research/downloads/11-fis-02-verifactu-verif-sumarios/`, y lectura del texto íntegro. No se ha ejecutado ningún archivo descargado.

| Dato | Estado | Fuente |
|---|---|---|
| RD 1007/2023, de 5 de diciembre: BOE núm. 291, de 06/12/2023; en vigor el 07/12/2023 | CONFIRMADO | https://www.boe.es/buscar/doc.php?id=BOE-A-2023-24840 |
| Fecha original de adaptación: 1/7/2025 para todos los obligados del art. 3.1 (tabla del bloque 3) | CONFIRMADO | Texto original de la DF 4.ª: https://www.boe.es/buscar/doc.php?id=BOE-A-2023-24840; preámbulo del RD 254/2025: https://www.boe.es/buscar/doc.php?id=BOE-A-2025-6600 |
| RD 254/2025, de 1 de abril: BOE núm. 80, de 02/04/2025; en vigor el 03/04/2025; fechas 1/1/2026 (IS) y 1/7/2026 (resto); modifica los arts. 4 y 6 y la DF 4.ª | CONFIRMADO | https://www.boe.es/buscar/doc.php?id=BOE-A-2025-6600 |
| RDL 15/2025, de 2 de diciembre: BOE núm. 290, de 03/12/2025; en vigor el 04/12/2025; DF 1.ª (fechas 2027) y DF 2.ª (rango) | CONFIRMADO | https://www.boe.es/buscar/doc.php?id=BOE-A-2025-24446 |
| Convalidación del RDL 15/2025 el 11/12/2025; Resolución publicada en el BOE núm. 301, de 16/12/2025 | CONFIRMADO | https://www.boe.es/buscar/doc.php?id=BOE-A-2025-25695 |
| DF 4.ª vigente: IS antes del 1/1/2027; resto antes del 1/7/2027; productores, 9 meses; mantenimiento plurianual; servicio AEAT en 9 meses | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#df-4 |
| Productores obligados desde el 29/07/2025 (29/10/2024 + 9 meses) | CONFIRMADO | DF 4.ª; https://sede.agenciatributaria.gob.es/Sede/iva/novedades-iva/novedades-normativa-2025/real-decreto-254-2025-1-abril.html |
| «El calendario se ha movido tres veces» | CORREGIDO: son dos modificaciones en el BOE (RD 254/2025 y RDL 15/2025) y una tercera solo anunciada | BOE-A-2025-6600; BOE-A-2025-24446; nota de Hacienda |
| Texto consolidado del RD 1007/2023: última actualización publicada el 03/12/2025; sin modificaciones de 2026 en «Análisis» | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840 · https://www.boe.es/buscar/doc.php?id=BOE-A-2023-24840 |
| Ninguna disposición publicada en el BOE entre el 05/10 y el 28/10/2026 modifica el RD 1007/2023 | CONFIRMADO | https://www.boe.es/datosabiertos/api/boe/sumario/20261005 a …/20261028 |
| Nota de Hacienda de 05/10/2026: previsión de aplazamiento hasta octubre de 2028 para hacerlo coincidir con la factura electrónica de ≤ 8 M€; convergencia posterior con ViDA; garantías sustancialmente equivalentes | CONFIRMADO | https://www.hacienda.gob.es/sgt/gabsehacienda/nota-informativa-verifactu.pdf |
| El título en los metadatos del PDF alude a pymes y autónomos | CONFIRMADO | Metadatos del PDF anterior (creado el 05/10/2026) |
| Día exacto y alcance subjetivo del aplazamiento anunciado | NO VERIFICABLE | La nota no lo concreta |
| Sin proyecto en audiencia pública sobre el RD 1007/2023 (solo modelo 576 y módulos 2027, publicados el 22/10/2026) | CONFIRMADO | https://www.hacienda.gob.es/es-ES/Normativa%20y%20doctrina/NormasEnTramitacion/Paginas/AudienciaAbiertas.aspx |
| Aprobación en el Consejo de Ministros aún no publicada | NO VERIFICABLE | Referencias de La Moncloa no accesibles (404) |
| RD 806/2026, de 5 de octubre: BOE núm. 248, de 06/10/2026; Cortes disueltas; elecciones el 29/11/2026; Cámaras el 23/12/2026 | CONFIRMADO | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742 |
| Tras la disolución, el Gobierno aprobó los RDL 28/2026 a 31/2026; la Diputación Permanente asume el art. 86 CE (dato añadido) | CONFIRMADO | Sumarios del BOE de 07/10, 14/10 y 21/10/2026; https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229#a78 |
| Art. 21.3 Ley 50/1997 (Gobierno en funciones) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-1997-25336#a21 |
| Ley 11/2021: BOE núm. 164, de 10/07/2021; el art. 13.4 añade el 29.2.j) y el art. 13.21 añade el 201 bis; DF 7.ª a): +3 meses = 11/10/2021 | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2021-11473#ad-3 · https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a29 |
| El art. 29.2.j) LGT alcanza a sistemas contables, de facturación y de gestión; el RRSIF solo desarrolla los de facturación | CORREGIDO (precisión: el original hablaba solo de «software de facturación») | https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a29; preámbulo del RD 1007/2023 |
| Art. 201 bis: 150.000 € por ejercicio y tipo; 1.000 € por sistema sin certificar; 50.000 € por ejercicio al usuario; infracciones graves | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a2-2 |
| Art. 188.1: 30 % solo para los arts. 191-197. Art. 188.3: 40 % para cualquier infracción con pago en plazo y sin recurso (excepto actas con acuerdo; precisión añadida) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a188 |
| Orden HAC/1177/2024, de 17 de octubre: BOE núm. 260, de 28/10/2024; en vigor el 29/10/2024; corrección en el BOE núm. 270, de 08/11/2024 | CONFIRMADO | https://www.boe.es/buscar/doc.php?id=BOE-A-2024-22138 |
| Art. 3 Orden: VERI\*FACTU no está sujeto a los arts. 6.b-f, 7.f, h, i, j, 8 y 9 | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a3 |
| Lista de comprobación, punto 5 (exportación y conservación del art. 8 de la Orden como exigencia general) | CORREGIDO: solo es exigible en NO VERI\*FACTU (art. 3 Orden; FAQ AEAT) | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a3; FAQ «Sistemas VERI\*FACTU» |
| Bloque 4: en NO VERI\*FACTU los registros se conservan «en el propio sistema» | CORREGIDO (precisión: también fuera, tras una exportación segura; art. 8.2 Orden) | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a8 |
| Art. 9 Orden: lista de eventos y resumen al menos cada 6 horas | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a9 |
| Arts. 10 y 11 Orden: registros en formato XML y UTF-8 | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-2 |
| Art. 13 Orden: datos sobre los que se calcula la huella del alta | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-5 |
| Art. 14 Orden: firma XAdES Enveloped con certificado cualificado | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-6 |
| Art. 15 Orden: título y contenido de la declaración responsable | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-7 |
| Art. 16.2 Orden (60 s) y art. 16.4 (reintento al menos cada hora y aviso) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-8 |
| Art. 17 Orden: permanencia hasta el 31/12 | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-9 |
| Art. 18 Orden: remisión a requerimiento | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-10 |
| Art. 19 Orden: aplicación de la AEAT (en nombre propio o por apoderado; destinatario obligatorio) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a1-11 |
| Arts. 20 y 21 Orden: QR de 30×30 a 40×40 mm; URL como campo en la factura electrónica; frase solo en VERI\*FACTU | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a2-2 |
| Art. 2 Orden: cadenas independientes por obligado | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2024-22138#a2 |
| RRSIF, arts. 1.2 (definición de SIF) y 1.3 (forales; Canarias, Ceuta y Melilla) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a1 |
| RRSIF, art. 3 (ámbito subjetivo, entidades exentas, exclusión del SII) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a3 |
| RRSIF, arts. 4, 5 y 6 (redacción del RD 254/2025 en los arts. 4 y 6) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840#a4 |
| RRSIF, arts. 7, 8.3, 9-14 y 16 (varios obligados; eventos; registros; huella y firma; declaración responsable; requerimiento; VERI\*FACTU) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2023-24840 (anclas `#a7` a `#a9` y `#a1-2` a `#a1-8`) |
| RD 1619/2012, arts. 6.5 y 7.5 (QR y frase) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a6 |
| RIVA, art. 62.6 (SII obligatorio con periodo mensual; opción voluntaria) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a62 |
| Supuestos de liquidación mensual que llevan al SII («volumen > 6.010.121,04 €, REDEME o grupo de entidades») | CORREGIDO: la lista estaba incompleta; el art. 71.3 añade la adquisición de patrimonio empresarial (2.º) y los depósitos fiscales de hidrocarburos (5.º, Ley 7/2024, en vigor 22/12/2024) | https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a71 |
| Umbral de 6.010.121,04 € (art. 71.3.1.º) y REDEME (art. 71.3.3.º) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-1992-28925#a71 |
| LIS, art. 9.1 (entidades totalmente exentas) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328#a9 |
| Ley 18/2022: art. 12 y DF 8.ª (1 y 2 años; condición de la excepción comunitaria) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2022-15818#df-8 |
| Cumplimiento formal de la condición de la DF 8.ª Ley 18/2022 | NO VERIFICABLE | Sin constancia expresa en el BOE (contexto ViDA: fuente 33) |
| Ley 56/2007, art. 2 bis.6 | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2007-22440#a2bis |
| RD 238/2026, de 25 de marzo: BOE núm. 79, de 31/03/2026; en vigor el 20/04/2026 (a los 20 días) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295 |
| RD 238/2026, art. 2.d) (sistemas adaptados al art. 29.2.j LGT) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#a2 |
| RD 238/2026, art. 4.1: las facturas simplificadas quedan excluidas, salvo las cualificadas (dato añadido al caso A) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#a4 |
| RD 238/2026, DF 4.ª: 12 meses (> 8 M€ en el año natural anterior) y 24 meses (resto); plataformas a los 12 meses | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#df-4 |
| RD 238/2026, DT 2.ª (PDF durante 12 meses) y DT 3.ª (personas físicas y entidades en atribución ≤ 8 M€: estados 12 meses después) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#dt-3 |
| Orden HAC/1028/2026, de 2 de octubre: BOE núm. 247, de 05/10/2026; en vigor el 06/10/2026; inicia el cómputo | CONFIRMADO | https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20587 |
| Fechas B2B: 06/10/2027, 06/10/2028 y 06/10/2029 | CONFIRMADO | BOE-A-2026-7295; https://sede.agenciatributaria.gob.es/Sede/iva/factura-electronica/calendario-implantacion.html |
| Directiva (UE) 2025/516, de 11/03/2025: DOUE de 25/03/2025; en vigor el 14/04/2025; arts. 218 y 232 aplicables desde el 14/04/2025; información digital desde el 01/07/2030 (antes NO VERIFICADO) | CONFIRMADO | https://www.boe.es/buscar/doc.php?id=DOUE-L-2025-80487; AEAT, novedades ViDA |
| FAQ AEAT «objeto» (21/10/2026): sanciones; tenencia de un SIF no adaptado; periodo de pruebas sin permanencia hasta el 31/12/2026 o el 30/06/2027 | CONFIRMADO | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes.html |
| FAQ AEAT «ámbitos» (21/10/2026): regla de los 4 NO; hojas de cálculo con macro; facturación manual y prohibición general de mezcla; sociedad patrimonial obligada; Canarias, Ceuta y Melilla incluidas | CONFIRMADO | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html |
| Árbol de decisión, paso 1 («¿Está obligado a expedir factura? No → fuera») | CORREGIDO: si expide facturas voluntariamente con un SIF, la AEAT aplica el RRSIF | FAQ AEAT «ámbitos» (régimen de agricultura, ganadería y pesca; recargo de equivalencia) |
| FAQ AEAT «Sistemas VERI\*FACTU» (21/10/2026): modalidades; permanencia; incidencias; exención de conservar; 347 y 349 | CONFIRMADO | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/sistemas-verifactu.html |
| Página SIF de la AEAT (13/10/2026): comunicación de Hacienda como «previsión»; FAQ actualizadas a 21/10/2026 | CONFIRMADO | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu.html |
| Nota informativa de la AEAT sobre la ampliación (13/10/2026) | CONFIRMADO | https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/nota-informativa-ampliacion-plazo-adaptacion-facturacion.html |
| Noticia de la AEAT de 13/10/2025 sobre la aplicación gratuita | CONFIRMADO | https://sede.agenciatributaria.gob.es/Sede/todas-noticias/2025/octubre/13/aplicacion-gratuita-facturacion-verifactu.html |
| Novedades de la AEAT sobre el RD 238/2026 (actualizada el 27/10/2026) | CONFIRMADO | https://sede.agenciatributaria.gob.es/Sede/iva/novedades-iva/novedades-normativa-2026/real-decreto-238-2026-25-marzo.html |
| TicketBAI como sistema foral vasco | CONFIRMADO (Araba y Gipuzkoa) / NO VERIFICABLE (Bizkaia) | https://web.araba.eus/es/hacienda/ticketbai · https://www.gipuzkoa.eus/es/web/ogasuna/ticketbai |
| Anclas del BOE de la sección 11.4 | CONFIRMADO | HTML de cada norma descargado el 28/10/2026 |
| El RDL 15/2025 y el RD 254/2025 no tienen texto consolidado con anclas (su `act.php` devuelve el original) | CONFIRMADO | https://www.boe.es/buscar/act.php?id=BOE-A-2025-6600 · https://www.boe.es/buscar/act.php?id=BOE-A-2025-24446 |
| Instrumento previsible del aplazamiento («un real decreto») | CORREGIDO (matiz: basta un real decreto, aunque en 2025 se usó un real decreto-ley; sigue siendo análisis propio) | DF 2.ª RDL 15/2025 |
| Cálculos: 65 y 246 días; margen de 3.610.121,04 €; 100.000/60.000 €; 50.000/30.000 €; 73,5 %; 70.000 € y 42.000 € (distractores); calculadora (90.000; 300.000; 35.000 €); 06/10/2026 + 12, + 24 y + 36 meses | CONFIRMADO | Recalculado (2027 no es bisiesto; 50.000/68.000 = 0,7353) |
| Supuesto de volumen de 2026 ≤ 8 M€ en los casos A y B (precisión añadida, necesaria para la fase B2B) | CONFIRMADO | DF 4.ª.1.a RD 238/2026 |
| Claves del test (P1: B; P2: B; P3: A) y del banco (B1: B; B2: A; B3: B; B4: A): correcta inequívoca y distractores incorrectos | CONFIRMADO | Normas citadas en cada explicación |
| Enunciado de la pregunta 2 | CORREGIDO (ajuste: se añade «según el RRSIF y el criterio publicado por la AEAT» y el domicilio en territorio común, para evitar la objeción basada en el art. 1.1 RRSIF sobre sociedades patrimoniales sin actividad económica) | FAQ AEAT «ámbitos» (sociedad patrimonial) |
| Lectura literal del art. 201 bis.4 (multa del usuario por ejercicio, no por sistema) | CONFIRMADO (texto) / NO VERIFICABLE (sin doctrina administrativa localizada) | https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186#a2-2 |
| Algoritmo de huella y ubicación del QR (documentos técnicos de la AEAT) | NO VERIFICABLE | No revisados; no se usan en el contenido |
| Prensa y doctrina posteriores al 21/10/2026 por buscador web | NO VERIFICABLE | Cupo de búsquedas agotado; sustituido por la revisión de fuentes primarias (sumarios del BOE, FAQ de la AEAT, Hacienda) |
| Recuento de palabras y tiempos de lectura (sección 12) | CORREGIDO (recalculado sobre esta versión) | Recuento propio por secciones |

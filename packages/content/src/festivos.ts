/**
 * Festivos laborales de las sedes de FLM (Barcelona, Vic y Granollers), comprobados el 29/10/2026
 * en las fuentes oficiales. Base: research/70-festivos.verificado.md.
 *
 * - Comunes a las tres sedes: en Cataluña, el calendario aplicable lo fija la orden anual del DOGC,
 *   que recoge las fiestas estatales y las propias. El ámbito sigue la columna «Cataluña» de la
 *   resolución anual del BOE: (*) y (**) → 'nacional'; (***) → 'autonomico'.
 *     · 2026: Orden EMT/66/2025 (DOGC núm. 9406, 06/05/2025) y BOE-A-2025-21667.
 *     · 2027: Orden EMT/52/2026 (DOGC núm. 9637, 01/04/2026) y BOE-A-2026-21254.
 * - Locales 2026: fechas de la Orden EMT/208/2025 (DOGC núm. 9565, 17/12/2025), que la Orden EMT/3/2026
 *   no modifica para estas sedes. Nombres según cada ayuntamiento: Decreto de Alcaldía ANY2025-16408
 *   (Gaseta Municipal de Barcelona, 06/06/2025), calendario 2026 de vic.cat y calendario de granollers.cat.
 * - Locales 2027: pendientes. La orden de fiestas locales de 2027 no está publicada en el DOGC
 *   (comprobado en Treball y en el CIDO el 29/10/2026); hasta entonces no se cargan fechas locales de 2027.
 * - Se mantienen los festivos que caen en sábado (15/08/2026, 26/12/2026, 01/05/2027, 11/09/2027
 *   y 25/12/2027): son fiestas laborales oficiales.
 */
import type { Holiday, Office } from '@flm/shared';

/** Orden EMT/66/2025, de 30 de abril: calendario oficial de fiestas laborales en Cataluña para 2026. */
const DOGC_CALENDARIO_2026 = 'https://dogc.gencat.cat/es/document-del-dogc/?documentId=1013204';
/** Orden EMT/52/2026, de 25 de marzo: calendario oficial de fiestas laborales en Cataluña para 2027. */
const DOGC_CALENDARIO_2027 = 'https://dogc.gencat.cat/es/document-del-dogc/?documentId=1040896';
/** Orden EMT/208/2025, de 11 de diciembre: calendario de fiestas locales en Cataluña para 2026. */
const DOGC_LOCALES_2026 = 'https://dogc.gencat.cat/es/document-del-dogc/?documentId=1032232';

const nacional = (date: string, name: string, source: string): Holiday => ({ date, name, scope: 'nacional', offices: [], source });
const autonomico = (date: string, name: string, source: string): Holiday => ({ date, name, scope: 'autonomico', offices: [], source });
const local = (date: string, name: string, office: Office, source: string): Holiday => ({ date, name, scope: 'local', offices: [office], source });

/** Festivos verificados para las sedes de FLM (Barcelona, Vic y Granollers). */
export const holidays: Holiday[] = [
  /* ── 2026 ─────────────────────────────────────────────────────────────── */
  nacional('2026-01-01', 'Año Nuevo', DOGC_CALENDARIO_2026),
  nacional('2026-01-06', 'Epifanía del Señor (Reyes)', DOGC_CALENDARIO_2026),
  nacional('2026-04-03', 'Viernes Santo', DOGC_CALENDARIO_2026),
  autonomico('2026-04-06', 'Lunes de Pascua', DOGC_CALENDARIO_2026),
  nacional('2026-05-01', 'Fiesta del Trabajo', DOGC_CALENDARIO_2026),
  local('2026-05-15', 'La Ascensión', 'Granollers', DOGC_LOCALES_2026),
  local('2026-05-25', 'Lunes de Pascua Granada', 'Barcelona', DOGC_LOCALES_2026),
  local('2026-05-25', 'Lunes de Pascua Granada', 'Vic', DOGC_LOCALES_2026),
  autonomico('2026-06-24', 'San Juan', DOGC_CALENDARIO_2026),
  local('2026-07-06', 'San Miguel de los Santos (Fiesta Mayor de Vic)', 'Vic', DOGC_LOCALES_2026),
  nacional('2026-08-15', 'Asunción de la Virgen', DOGC_CALENDARIO_2026),
  local('2026-08-28', 'Fiesta Mayor de Granollers', 'Granollers', DOGC_LOCALES_2026),
  autonomico('2026-09-11', 'Diada Nacional de Cataluña', DOGC_CALENDARIO_2026),
  local('2026-09-24', 'Nuestra Señora de la Merced (La Mercè)', 'Barcelona', DOGC_LOCALES_2026),
  nacional('2026-10-12', 'Fiesta Nacional de España', DOGC_CALENDARIO_2026),
  nacional('2026-12-08', 'Inmaculada Concepción', DOGC_CALENDARIO_2026),
  nacional('2026-12-25', 'Navidad', DOGC_CALENDARIO_2026),
  autonomico('2026-12-26', 'San Esteban (Sant Esteve)', DOGC_CALENDARIO_2026),

  /* ── 2027 (solo nacionales y autonómicos; locales pendientes del DOGC) ── */
  nacional('2027-01-01', 'Año Nuevo', DOGC_CALENDARIO_2027),
  nacional('2027-01-06', 'Epifanía del Señor (Reyes)', DOGC_CALENDARIO_2027),
  nacional('2027-03-26', 'Viernes Santo', DOGC_CALENDARIO_2027),
  autonomico('2027-03-29', 'Lunes de Pascua', DOGC_CALENDARIO_2027),
  nacional('2027-05-01', 'Fiesta del Trabajo', DOGC_CALENDARIO_2027),
  autonomico('2027-06-24', 'San Juan', DOGC_CALENDARIO_2027),
  autonomico('2027-09-11', 'Diada Nacional de Cataluña', DOGC_CALENDARIO_2027),
  nacional('2027-10-12', 'Fiesta Nacional de España', DOGC_CALENDARIO_2027),
  nacional('2027-11-01', 'Todos los Santos', DOGC_CALENDARIO_2027),
  nacional('2027-12-06', 'Día de la Constitución Española', DOGC_CALENDARIO_2027),
  nacional('2027-12-08', 'Inmaculada Concepción', DOGC_CALENDARIO_2027),
  nacional('2027-12-25', 'Navidad', DOGC_CALENDARIO_2027),
];

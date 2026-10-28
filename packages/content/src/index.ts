import type { SeedData } from '@flm/shared';
import { news } from './actualidad';
import { assignments } from './asignaciones';
import { documents } from './documents';
import { assessments } from './evaluaciones';
import { events } from './events';
import { formations } from './formaciones';
import { holidays } from './festivos';
import { readings } from './lecturas';
import { people, REAL_PEOPLE } from './people';

/** Contenido semilla del campus: lo consume la demo pública y el script de carga de la API. */
export const seed: SeedData = { people, formations, assessments, news, documents, readings, events, holidays, assignments };

export { REAL_PEOPLE };
export { participation } from './participacion';

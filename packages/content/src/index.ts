import type { SeedData } from '@flm/shared';
import { news } from './actualidad';
import { documents } from './documents';
import { assessments } from './evaluaciones';
import { events } from './events';
import { formations } from './formaciones';
import { holidays } from './festivos';
import { readings } from './lecturas';
import { people, REAL_PEOPLE } from './people';
import { clients, welcomes } from './ponte-al-dia';

/** Contenido semilla del campus: lo consume la demo pública y el script de carga de la API. */
export const seed: SeedData = { people, formations, assessments, news, documents, readings, events, holidays, clients, welcomes };

export { REAL_PEOPLE };
export { participation } from './participacion';

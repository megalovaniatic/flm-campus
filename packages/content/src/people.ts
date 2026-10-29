/**
 * Personas de la DEMOSTRACIÓN.
 *
 * - Judith Calet (Asesora Contable) aparece con su nombre, con su autorización expresa, como perfil
 *   con el que se abre la demo. No lleva fotografía: el campus muestra sus iniciales.
 * - El resto son personas FICTICIAS creadas para mostrar la administración, los informes y la autoría
 *   de contenidos. No tienen fotografía (solo iniciales) para no fabricar retratos de plantilla.
 *   En la versión privada estos datos se sustituyen por las cuentas reales.
 * - Datos profesionales y, para el calendario de empresa, el cumpleaños (solo día y mes, sin año de
 *   nacimiento) y la fecha de incorporación. Solo constan los que han facilitado la propia persona o
 *   FLM (hoy, los de Judith Calet y la incorporación del 1 de septiembre de 2026 de Lluís Gómez y
 *   Christopher Raudales): nunca se inventan. El resto de perfiles los tiene «sin indicar» hasta que
 *   se completen desde el perfil o desde Administración › Personas.
 */
import type { Department, Office, Person, Role } from '@flm/shared';

/**
 * Cumpleaños («MM-DD», sin año) y fecha de incorporación facilitados por la propia persona.
 * Judith Calet: 26 de noviembre; en FLM desde el 1 de septiembre de 2026.
 */
const PERSONAL_DATES: Record<string, Pick<Person, 'birthday' | 'startDate'>> = {
  'p-judith-calet': { birthday: '11-26', startDate: '2026-09-01' },
};

type Row = [id: string, name: string, position: string, department: Department, office: Office, role: Role];

const ROWS: Row[] = [
  ['p-carme-soler', 'Carme Soler Puig', 'Coordinadora de formación interna', 'Administración', 'Barcelona', 'admin'],
  ['p-jordi-ferrer', 'Jordi Ferrer Vidal', 'Asesor fiscal sénior', 'Fiscal', 'Barcelona', 'autor'],
  ['p-nuria-roca', 'Núria Roca Serra', 'Graduada social sénior', 'Laboral', 'Barcelona', 'autor'],
  ['p-albert-mas', 'Albert Mas Coll', 'Abogado mercantilista sénior', 'Mercantil', 'Barcelona', 'autor'],
  ['p-montse-vila', 'Montserrat Vila Riera', 'Asesora contable sénior', 'Contable', 'Barcelona', 'autor'],
  ['p-laura-gil', 'Laura Gil Martínez', 'Técnica de Comunicación', 'Comunicación', 'Barcelona', 'admin'],
  ['p-marc-pujol', 'Marc Pujol Ribas', 'Técnico de Sistemas', 'Sistemas', 'Barcelona', 'admin'],
  ['p-elena-navarro', 'Elena Navarro Ruiz', 'Asesora fiscal sénior', 'Fiscal', 'Barcelona', 'autor'],
  ['p-david-romero', 'David Romero Sanz', 'Asesor fiscal', 'Fiscal', 'Barcelona', 'empleado'],
  ['p-sara-lopez', 'Sara López Bosch', 'Asesora fiscal', 'Fiscal', 'Barcelona', 'empleado'],
  ['p-pau-camps', 'Pau Camps Torras', 'Asesor fiscal júnior', 'Fiscal', 'Barcelona', 'empleado'],
  ['p-irene-castro', 'Irene Castro Molina', 'Asesora fiscal', 'Fiscal', 'Vic', 'empleado'],
  ['p-joan-sala', 'Joan Sala Prat', 'Asesor fiscal sénior', 'Fiscal', 'Vic', 'empleado'],
  ['p-ana-herrera', 'Ana Herrera Gómez', 'Asesora fiscal', 'Fiscal', 'Granollers', 'empleado'],
  ['p-oriol-font', 'Oriol Font Valls', 'Asesor fiscal', 'Fiscal', 'Granollers', 'empleado'],
  ['p-cristina-moreno', 'Cristina Moreno Díaz', 'Graduada social sénior', 'Laboral', 'Barcelona', 'autor'],
  ['p-xavier-roig', 'Xavier Roig Marín', 'Graduado social', 'Laboral', 'Barcelona', 'empleado'],
  ['p-lucia-ortega', 'Lucía Ortega Peña', 'Técnica de nóminas', 'Laboral', 'Barcelona', 'empleado'],
  ['p-miquel-batlle', 'Miquel Batlle Grau', 'Técnico de nóminas', 'Laboral', 'Barcelona', 'empleado'],
  ['p-paula-santos', 'Paula Santos Rey', 'Abogada laboralista', 'Laboral', 'Barcelona', 'empleado'],
  ['p-gemma-pons', 'Gemma Pons Ferrer', 'Técnica de nóminas', 'Laboral', 'Vic', 'empleado'],
  ['p-raul-diaz', 'Raúl Díaz Campos', 'Graduado social', 'Laboral', 'Vic', 'empleado'],
  ['p-marta-vidal', 'Marta Vidal Soler', 'Técnica de nóminas', 'Laboral', 'Granollers', 'empleado'],
  ['p-hector-gimenez', 'Héctor Giménez Lara', 'Técnico laboral júnior', 'Laboral', 'Granollers', 'empleado'],
  ['p-silvia-marti', 'Sílvia Martí Rovira', 'Abogada mercantilista sénior', 'Mercantil', 'Barcelona', 'autor'],
  ['p-alejandro-ruiz', 'Alejandro Ruiz Ortiz', 'Abogado mercantilista', 'Mercantil', 'Barcelona', 'empleado'],
  ['p-clara-esteve', 'Clara Esteve Mir', 'Abogada mercantilista', 'Mercantil', 'Barcelona', 'empleado'],
  ['p-bernat-oliver', 'Bernat Oliver Sastre', 'Paralegal', 'Mercantil', 'Barcelona', 'empleado'],
  ['p-teresa-blanco', 'Teresa Blanco Gil', 'Abogada concursal', 'Mercantil', 'Barcelona', 'empleado'],
  ['p-ivan-serrano', 'Iván Serrano Vega', 'Abogado mercantilista', 'Mercantil', 'Granollers', 'empleado'],
  ['p-judith-calet', 'Judith Calet', 'Asesora Contable', 'Contable', 'Barcelona', 'empleado'],
  ['p-ramon-costa', 'Ramon Costa Bru', 'Asesor contable sénior', 'Contable', 'Barcelona', 'autor'],
  ['p-beatriz-leon', 'Beatriz León Cano', 'Asesora contable', 'Contable', 'Barcelona', 'empleado'],
  ['p-adria-casals', 'Adrià Casals Mora', 'Asesor contable', 'Contable', 'Barcelona', 'empleado'],
  ['p-noelia-fuentes', 'Noelia Fuentes Ríos', 'Asesora contable júnior', 'Contable', 'Barcelona', 'empleado'],
  ['p-eduard-riba', 'Eduard Riba Fabra', 'Asesor contable', 'Contable', 'Vic', 'empleado'],
  ['p-rosa-jimenez', 'Rosa Jiménez Prieto', 'Asesora contable', 'Contable', 'Vic', 'empleado'],
  ['p-toni-ventura', 'Toni Ventura Gual', 'Asesor contable', 'Contable', 'Granollers', 'empleado'],
  ['p-mireia-sola', 'Mireia Solà Ribera', 'Asesora contable', 'Contable', 'Granollers', 'empleado'],
  ['p-lourdes-mena', 'Lourdes Mena Cid', 'Administrativa sénior', 'Administración', 'Barcelona', 'empleado'],
  ['p-sergio-pastor', 'Sergio Pastor Lozano', 'Administrativo', 'Administración', 'Barcelona', 'empleado'],
  ['p-ester-coll', 'Ester Coll Badia', 'Recepción', 'Administración', 'Barcelona', 'empleado'],
  ['p-quim-vives', 'Quim Vives Arnau', 'Administrativo', 'Administración', 'Vic', 'empleado'],
  ['p-marina-castell', 'Marina Castell Puig', 'Técnica de Comunicación', 'Comunicación', 'Barcelona', 'autor'],
  ['p-victor-aguilar', 'Víctor Aguilar Nieto', 'Asesor fiscal', 'Fiscal', 'Barcelona', 'empleado'],
  ['p-claudia-reyes', 'Claudia Reyes Ferrán', 'Asesora laboral', 'Laboral', 'Barcelona', 'empleado'],
  ['p-guillem-tort', 'Guillem Tort Sabater', 'Asesor contable', 'Contable', 'Barcelona', 'empleado'],
  ['p-patricia-luna', 'Patricia Luna Varela', 'Asesora fiscal', 'Fiscal', 'Granollers', 'empleado'],
];

const emailOf = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .join('.')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z.]/g, '') + '@flmexperts.com';

/**
 * Personas REALES de FLM identificadas en canales públicos de la firma (web, LinkedIn, YouTube, prensa)
 * o en el material aportado. Solo se usa su información profesional pública. Su autoría en la demo
 * es indicativa y está pendiente de validación.
 */
const REAL: Person[] = [
  {
    id: 'p-angel-ceniceros',
    email: 'angel.ceniceros@flmexperts.com',
    name: 'Ángel María Ceniceros',
    position: 'Socio del Área Fiscal',
    department: 'Fiscal',
    office: 'Barcelona',
    role: 'autor',
    photo: 'img/people/angel-ceniceros.webp',
    status: 'activa',
    publicSource: 'Fotografía corporativa aportada por FLM; autor de la nota «Facturación electrónica B2B».',
  },
  {
    id: 'p-lluis-gomez',
    email: 'lluis.gomez@flmexperts.com',
    name: 'Lluís Gómez Palanques',
    position: 'Asesor fiscal',
    department: 'Fiscal',
    office: 'Barcelona',
    role: 'autor',
    status: 'activa',
    publicSource: 'Autor de las notas informativas «IVA de vehículos» y «Consulta V5484-26» aportadas por FLM. Puesto y fecha de incorporación facilitados por FLM.',
    startDate: '2026-09-01',
  },
  {
    id: 'p-christopher-raudales',
    email: 'christopher.raudales@flmexperts.com',
    name: 'Christopher Raudales',
    position: 'Asesor contable',
    department: 'Contable',
    office: 'Barcelona',
    role: 'empleado',
    status: 'activa',
    publicSource: 'Puesto, sede y fecha de incorporación facilitados por FLM. Correo con el formato corporativo (nombre.apellido), pendiente de confirmar.',
    startDate: '2026-09-01',
  },
  {
    id: 'p-cristina-sebastian',
    email: 'cristina.sebastian@flmexperts.com',
    name: 'Cristina Sebastián',
    position: 'Socia del Área Laboral',
    department: 'Laboral',
    office: 'Barcelona',
    role: 'autor',
    status: 'activa',
    publicSource: 'Iberian Lawyer (02/10/2025) y canal de YouTube de FLM.',
  },
  {
    id: 'p-joan-navarro',
    email: 'joan.navarro@flmexperts.com',
    name: 'Joan Navarro',
    position: 'Socio del Área Mercantil',
    department: 'Mercantil',
    office: 'Barcelona',
    role: 'autor',
    status: 'activa',
    publicSource: 'Canal de YouTube de FLM y ponente del Desayuno Mercantil (23/10/2026).',
  },
  {
    id: 'p-lorena-ortiz',
    email: 'lorena.ortiz@flmexperts.com',
    name: 'Lorena Ortiz',
    position: 'Abogada del Área Mercantil',
    department: 'Mercantil',
    office: 'Barcelona',
    role: 'autor',
    status: 'activa',
    publicSource: 'Ponente del Desayuno Mercantil (23/10/2026), material aportado por FLM.',
  },
  {
    id: 'p-joan-marso',
    email: 'joan.marso@flmexperts.com',
    name: 'Joan Marsó',
    position: 'Responsable de FLM Vic',
    department: 'Dirección',
    office: 'Vic',
    role: 'empleado',
    status: 'activa',
    publicSource: 'LinkedIn de FLM, El 9 Nou y EL9FM.',
  },
];

export const people: Person[] = [
  ...REAL,
  ...ROWS.map(([id, name, position, department, office, role]): Person => {
    const isJudith = id === 'p-judith-calet';
    return {
      id,
      email: isJudith ? 'judith.calet@flmexperts.com' : emailOf(name),
      name,
      position,
      department,
      office,
      role,
      status: 'activa',
      fictional: isJudith ? undefined : true,
      publicSource: isJudith ? 'Perfil de la demostración, con autorización expresa.' : undefined,
      ...PERSONAL_DATES[id],
    };
  }),
];

/** Personas reales que aparecen con autorización de FLM. */
export const REAL_PEOPLE = new Set([...REAL.map((p) => p.id), 'p-judith-calet']);

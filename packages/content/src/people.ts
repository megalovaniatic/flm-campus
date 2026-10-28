/**
 * Personas de la DEMOSTRACIÓN.
 *
 * - Judith Calet (Asesora Contable) aparece con su nombre y fotografía con su autorización expresa,
 *   como perfil con el que se abre la demo.
 * - El resto son personas FICTICIAS creadas para mostrar el calendario, los aniversarios y la
 *   administración. No tienen fotografía (solo iniciales) para no fabricar retratos de plantilla.
 *   En la versión privada estos datos se sustituyen por las cuentas reales.
 */
import type { Department, Office, Person, Role } from '@flm/shared';

type Row = [id: string, name: string, position: string, department: Department, office: Office, role: Role, startDate: string, birthday?: string];

const ROWS: Row[] = [
  ['p-carme-soler', 'Carme Soler Puig', 'Coordinadora de formación interna', 'Administración', 'Barcelona', 'admin', '1996-03-04', '02-14'],
  ['p-jordi-ferrer', 'Jordi Ferrer Vidal', 'Asesor fiscal sénior', 'Fiscal', 'Barcelona', 'autor', '2001-09-17', '06-21'],
  ['p-nuria-roca', 'Núria Roca Serra', 'Graduada social sénior', 'Laboral', 'Barcelona', 'autor', '2004-01-12', '11-08'],
  ['p-albert-mas', 'Albert Mas Coll', 'Abogado mercantilista sénior', 'Mercantil', 'Barcelona', 'autor', '2006-05-22', '03-30'],
  ['p-montse-vila', 'Montserrat Vila Riera', 'Asesora contable sénior', 'Contable', 'Barcelona', 'autor', '2008-10-01', '12-03'],
  ['p-laura-gil', 'Laura Gil Martínez', 'Técnica de Comunicación', 'Comunicación', 'Barcelona', 'admin', '2019-02-11', '07-09'],
  ['p-marc-pujol', 'Marc Pujol Ribas', 'Técnico de Sistemas', 'Sistemas', 'Barcelona', 'admin', '2017-11-06', '09-15'],
  ['p-elena-navarro', 'Elena Navarro Ruiz', 'Asesora fiscal sénior', 'Fiscal', 'Barcelona', 'autor', '2012-04-16', '10-30'],
  ['p-david-romero', 'David Romero Sanz', 'Asesor fiscal', 'Fiscal', 'Barcelona', 'empleado', '2018-09-03', '01-25'],
  ['p-sara-lopez', 'Sara López Bosch', 'Asesora fiscal', 'Fiscal', 'Barcelona', 'empleado', '2021-03-15', '11-19'],
  ['p-pau-camps', 'Pau Camps Torras', 'Asesor fiscal júnior', 'Fiscal', 'Barcelona', 'empleado', '2025-09-08', '04-02'],
  ['p-irene-castro', 'Irene Castro Molina', 'Asesora fiscal', 'Fiscal', 'Vic', 'empleado', '2016-11-02', '08-12'],
  ['p-joan-sala', 'Joan Sala Prat', 'Asesor fiscal sénior', 'Fiscal', 'Vic', 'empleado', '2003-06-02', '05-17'],
  ['p-ana-herrera', 'Ana Herrera Gómez', 'Asesora fiscal', 'Fiscal', 'Granollers', 'empleado', '2014-12-01', '12-22'],
  ['p-oriol-font', 'Oriol Font Valls', 'Asesor fiscal', 'Fiscal', 'Granollers', 'empleado', '2020-01-20', '06-06'],
  ['p-cristina-moreno', 'Cristina Moreno Díaz', 'Graduada social sénior', 'Laboral', 'Barcelona', 'autor', '2010-02-08', '11-27'],
  ['p-xavier-roig', 'Xavier Roig Marín', 'Graduado social', 'Laboral', 'Barcelona', 'empleado', '2015-07-01', '02-03'],
  ['p-lucia-ortega', 'Lucía Ortega Peña', 'Técnica de nóminas', 'Laboral', 'Barcelona', 'empleado', '2022-05-09', '10-11'],
  ['p-miquel-batlle', 'Miquel Batlle Grau', 'Técnico de nóminas', 'Laboral', 'Barcelona', 'empleado', '2019-11-25', '09-28'],
  ['p-paula-santos', 'Paula Santos Rey', 'Abogada laboralista', 'Laboral', 'Barcelona', 'empleado', '2023-01-16', '12-09'],
  ['p-gemma-pons', 'Gemma Pons Ferrer', 'Técnica de nóminas', 'Laboral', 'Vic', 'empleado', '2011-11-14', '03-08'],
  ['p-raul-diaz', 'Raúl Díaz Campos', 'Graduado social', 'Laboral', 'Vic', 'empleado', '2017-09-04', '07-23'],
  ['p-marta-vidal', 'Marta Vidal Soler', 'Técnica de nóminas', 'Laboral', 'Granollers', 'empleado', '2013-03-11', '11-02'],
  ['p-hector-gimenez', 'Héctor Giménez Lara', 'Técnico laboral júnior', 'Laboral', 'Granollers', 'empleado', '2026-02-02', '01-14'],
  ['p-silvia-marti', 'Sílvia Martí Rovira', 'Abogada mercantilista sénior', 'Mercantil', 'Barcelona', 'autor', '2009-09-07', '04-27'],
  ['p-alejandro-ruiz', 'Alejandro Ruiz Ortiz', 'Abogado mercantilista', 'Mercantil', 'Barcelona', 'empleado', '2018-01-08', '12-16'],
  ['p-clara-esteve', 'Clara Esteve Mir', 'Abogada mercantilista', 'Mercantil', 'Barcelona', 'empleado', '2021-10-04', '10-05'],
  ['p-bernat-oliver', 'Bernat Oliver Sastre', 'Paralegal', 'Mercantil', 'Barcelona', 'empleado', '2024-04-15', '06-30'],
  ['p-teresa-blanco', 'Teresa Blanco Gil', 'Abogada concursal', 'Mercantil', 'Barcelona', 'empleado', '2015-11-30', '08-19'],
  ['p-ivan-serrano', 'Iván Serrano Vega', 'Abogado mercantilista', 'Mercantil', 'Granollers', 'empleado', '2019-06-10', '02-26'],
  ['p-judith-calet', 'Judith Calet', 'Asesora Contable', 'Contable', 'Barcelona', 'empleado', '2026-09-01'],
  ['p-ramon-costa', 'Ramon Costa Bru', 'Asesor contable sénior', 'Contable', 'Barcelona', 'autor', '1999-11-15', '09-01'],
  ['p-beatriz-leon', 'Beatriz León Cano', 'Asesora contable', 'Contable', 'Barcelona', 'empleado', '2016-02-29', '02-29'],
  ['p-adria-casals', 'Adrià Casals Mora', 'Asesor contable', 'Contable', 'Barcelona', 'empleado', '2020-10-19', '11-13'],
  ['p-noelia-fuentes', 'Noelia Fuentes Ríos', 'Asesora contable júnior', 'Contable', 'Barcelona', 'empleado', '2025-11-03', '05-05'],
  ['p-eduard-riba', 'Eduard Riba Fabra', 'Asesor contable', 'Contable', 'Vic', 'empleado', '2007-04-23', '12-28'],
  ['p-rosa-jimenez', 'Rosa Jiménez Prieto', 'Asesora contable', 'Contable', 'Vic', 'empleado', '2012-11-05', '07-31'],
  ['p-toni-ventura', 'Toni Ventura Gual', 'Asesor contable', 'Contable', 'Granollers', 'empleado', '2018-11-12', '10-24'],
  ['p-mireia-sola', 'Mireia Solà Ribera', 'Asesora contable', 'Contable', 'Granollers', 'empleado', '2022-09-12', '11-21'],
  ['p-lourdes-mena', 'Lourdes Mena Cid', 'Administrativa sénior', 'Administración', 'Barcelona', 'empleado', '1991-11-18', '04-11'],
  ['p-sergio-pastor', 'Sergio Pastor Lozano', 'Administrativo', 'Administración', 'Barcelona', 'empleado', '2014-01-07', '08-04'],
  ['p-ester-coll', 'Ester Coll Badia', 'Recepción', 'Administración', 'Barcelona', 'empleado', '2010-11-22', '12-12'],
  ['p-quim-vives', 'Quim Vives Arnau', 'Administrativo', 'Administración', 'Vic', 'empleado', '2005-02-14', '03-19'],
  ['p-marina-castell', 'Marina Castell Puig', 'Técnica de Comunicación', 'Comunicación', 'Barcelona', 'autor', '2024-11-04', '11-24'],
  ['p-victor-aguilar', 'Víctor Aguilar Nieto', 'Asesor fiscal', 'Fiscal', 'Barcelona', 'empleado', '2023-11-27', '10-02'],
  ['p-claudia-reyes', 'Claudia Reyes Ferrán', 'Asesora laboral', 'Laboral', 'Barcelona', 'empleado', '2024-10-21', '06-14'],
  ['p-guillem-tort', 'Guillem Tort Sabater', 'Asesor contable', 'Contable', 'Barcelona', 'empleado', '2017-10-30', '01-06'],
  ['p-patricia-luna', 'Patricia Luna Varela', 'Asesora fiscal', 'Fiscal', 'Granollers', 'empleado', '2011-10-31', '11-30'],
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
 * o en el material aportado. Solo se usa su información profesional pública: no se inventan fechas
 * de alta ni cumpleaños. Su autoría en la demo es indicativa y está pendiente de validación.
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
    showBirthday: false,
    status: 'activa',
    publicSource: 'Fotografía corporativa aportada por FLM; autor de la nota «Facturación electrónica B2B».',
  },
  {
    id: 'p-lluis-gomez',
    email: 'lluis.gomez@flmexperts.com',
    name: 'Lluís Gómez Palanques',
    position: 'Equipo del Área Fiscal',
    department: 'Fiscal',
    office: 'Barcelona',
    role: 'autor',
    showBirthday: false,
    status: 'activa',
    publicSource: 'Autor de las notas informativas «IVA de vehículos» y «Consulta V5484-26» aportadas por FLM.',
  },
  {
    id: 'p-cristina-sebastian',
    email: 'cristina.sebastian@flmexperts.com',
    name: 'Cristina Sebastián',
    position: 'Socia del Área Laboral',
    department: 'Laboral',
    office: 'Barcelona',
    role: 'autor',
    showBirthday: false,
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
    showBirthday: false,
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
    showBirthday: false,
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
    showBirthday: false,
    status: 'activa',
    publicSource: 'LinkedIn de FLM, El 9 Nou y EL9FM.',
  },
];

export const people: Person[] = [
  ...REAL,
  ...ROWS.map(([id, name, position, department, office, role, startDate, birthday]): Person => {
    const isJudith = id === 'p-judith-calet';
    return {
      id,
      email: isJudith ? 'judith.calet@flmexperts.com' : emailOf(name),
      name,
      position,
      department,
      office,
      role,
      startDate,
      birthday,
      showBirthday: !!birthday,
      status: 'activa',
      photo: isJudith ? 'img/people/judith-calet.webp' : undefined,
      fictional: isJudith ? undefined : true,
      publicSource: isJudith ? 'Perfil de la demostración, con autorización expresa.' : undefined,
    };
  }),
];

/** Personas reales que aparecen con autorización de FLM. */
export const REAL_PEOPLE = new Set([...REAL.map((p) => p.id), 'p-judith-calet']);

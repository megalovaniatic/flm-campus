/**
 * Ficha de una persona: alta y edición desde Administración › Personas, y autoservicio de los datos del
 * calendario desde el perfil o los ajustes. Lógica pura, con pruebas en personForm.test.ts.
 *
 * - El cumpleaños se pide como día y mes, sin el año de nacimiento; la incorporación, como fecha completa.
 * - Se valida con los esquemas compartidos (`personSchema`, `birthdaySchema`, `fullDateSchema`), los mismos
 *   que aplica la API en `POST /api/people`, `PATCH /api/people/:id` y `PATCH /api/me/personal-dates`.
 * - Nunca se rellenan por defecto. En un alta son obligatorios; en un perfil anterior que no los tiene se
 *   pueden dejar en blanco (no bloquea nada), y lo que ya consta no se vacía: se corrige.
 * - Las entradas del calendario salen de la ficha (`personalEntries`): al guardarla cambian al momento,
 *   sin eventos guardados aparte y, por tanto, sin duplicados.
 */
import {
  birthdayKey,
  birthdayLabel,
  birthdaySchema,
  CORPORATE_DOMAIN,
  daysInMonth,
  formatLongDate,
  fullDateSchema,
  isValidBirthday,
  isValidDateKey,
  latestStartDate as sharedLatestStartDate,
  madridDateKey,
  missingPersonalDates,
  monthName,
  personSchema,
  slugify,
  startDateLimitIssue,
  yearlyDate,
  type Department,
  type Office,
  type Person,
  type PersonalDateField,
  type Role,
} from '@flm/shared';

export const DEPARTMENTS: Department[] = ['Fiscal', 'Laboral', 'Mercantil', 'Contable', 'Dirección', 'Administración', 'Comunicación', 'Sistemas'];
export const OFFICES: Office[] = ['Barcelona', 'Vic', 'Granollers'];
export const ROLES: Role[] = ['empleado', 'autor', 'admin'];

/** Para qué se piden (en Administración): acompaña a los dos campos en el alta y en la edición. */
export const PERSONAL_DATES_PURPOSE =
  'Se usan solo para mostrar su cumpleaños (el día y el mes, nunca el año de nacimiento) y su aniversario de incorporación en el calendario de empresa, que ve todo el equipo.';

/** Para qué se piden (autoservicio, en el perfil y los ajustes). */
export const OWN_DATES_PURPOSE =
  'Se usan solo para mostrar tu cumpleaños (el día y el mes, nunca el año de nacimiento) y tu aniversario de incorporación en el calendario de empresa, que ve todo el equipo.';

export interface PersonForm {
  name: string;
  email: string;
  position: string;
  department: Department | '';
  office: Office | '';
  role: Role;
  /** Cumpleaños, día y mes por separado ('' = sin elegir; '1'…'31' y '1'…'12'). */
  birthdayDay: string;
  birthdayMonth: string;
  /** Fecha de incorporación, «AAAA-MM-DD» (campo de fecha). */
  startDate: string;
}

/** Campos con su propio mensaje de error. El cumpleaños (día y mes) es uno solo. */
export type PersonField = 'name' | 'email' | 'position' | 'department' | 'office' | 'role' | 'birthday' | 'startDate';

/** Orden de los campos en el formulario y en el resumen de errores. */
export const FIELD_ORDER: PersonField[] = ['name', 'email', 'position', 'department', 'office', 'role', 'birthday', 'startDate'];

/** Control que recibe el foco desde el resumen de errores (atributo `name`). */
export const FIELD_CONTROL: Record<PersonField, string> = {
  name: 'name',
  email: 'email',
  position: 'position',
  department: 'department',
  office: 'office',
  role: 'role',
  birthday: 'birthdayDay',
  startDate: 'startDate',
};

export interface FieldIssue {
  field: PersonField;
  message: string;
}

/** Nombres de los campos en la auditoría («Campos: puesto, cumpleaños»): sin valores, que son datos personales. */
const AUDIT_LABEL: Partial<Record<keyof Person, string>> = {
  name: 'nombre',
  email: 'correo',
  position: 'puesto',
  department: 'departamento',
  office: 'sede',
  role: 'rol',
  birthday: 'cumpleaños',
  startDate: 'fecha de incorporación',
};

const MISSING_TEXT: Record<string, string> = {
  birthday: 'Falta el cumpleaños',
  startDate: 'Falta la fecha de incorporación',
  'birthday,startDate': 'Faltan el cumpleaños y la fecha de incorporación',
};

export function emptyPersonForm(): PersonForm {
  return { name: '', email: '', position: '', department: '', office: '', role: 'empleado', birthdayDay: '', birthdayMonth: '', startDate: '' };
}

/** Día y mes de un cumpleaños «MM-DD» para los selectores (vacíos si no consta o no es válido). */
export function birthdayParts(birthday: string | undefined): { day: string; month: string } {
  if (!isValidBirthday(birthday)) return { day: '', month: '' };
  return { day: String(Number(birthday.slice(3, 5))), month: String(Number(birthday.slice(0, 2))) };
}

export function personToForm(p: Person): PersonForm {
  const { day, month } = birthdayParts(p.birthday);
  return {
    name: p.name,
    email: p.email,
    position: p.position,
    department: p.department,
    office: p.office,
    role: p.role,
    birthdayDay: day,
    birthdayMonth: month,
    startDate: isValidDateKey(p.startDate) ? p.startDate : '',
  };
}

/** Días que puede tener un cumpleaños en ese mes: el 29 de febrero existe (se celebra el 28 los años no bisiestos). Sin mes, 31. */
export function birthdayDaysIn(month: string): number {
  const m = Number(month);
  return Number.isInteger(m) && m >= 1 && m <= 12 ? daysInMonth(2024, m) : 31;
}

/** ¿Existe ese día en ese mes? Para desactivar en los selectores las combinaciones imposibles. */
export function birthdayExists(day: string, month: string): boolean {
  if (!day || !month) return true;
  return Number(day) <= birthdayDaysIn(month);
}

/** «MM-DD» si están el día y el mes y la fecha existe; si no, undefined. */
export function birthdayFromParts(day: string, month: string): string | undefined {
  if (!day || !month) return undefined;
  const key = birthdayKey(Number(day), Number(month));
  return birthdaySchema.safeParse(key).success ? key : undefined;
}

/** Problema del cumpleaños, o undefined si está bien (o en blanco cuando no es obligatorio). */
export function birthdayIssue(day: string, month: string, required: boolean): string | undefined {
  if (!day && !month) return required ? 'Indica el día y el mes del cumpleaños (sin el año de nacimiento).' : undefined;
  if (!day) return 'Elige también el día del cumpleaños.';
  if (!month) return 'Elige también el mes del cumpleaños.';
  if (!birthdayFromParts(day, month)) return `El ${Number(day)} de ${monthName(Number(month))} no existe: elige otro día.`;
  return undefined;
}

/** Último día admitido como fecha de incorporación: un año después de hoy (el mismo tope que la API, de @flm/shared). */
export function latestStartDate(today: string = madridDateKey()): string {
  return sharedLatestStartDate(today);
}

/** Problema de la fecha de incorporación, o undefined si está bien (o en blanco cuando no es obligatoria). */
export function startDateIssue(value: string, required: boolean, today: string = madridDateKey()): string | undefined {
  const v = value.trim();
  if (!v) return required ? 'Indica la fecha completa de incorporación a FLM: día, mes y año.' : undefined;
  if (!fullDateSchema.safeParse(v).success) return 'Indica una fecha de incorporación que exista, con día, mes y año.';
  return startDateLimitIssue(v, today) ?? undefined;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const EMPTY_MESSAGE: Record<Exclude<PersonField, 'birthday' | 'startDate'>, string> = {
  name: 'Indica el nombre y los apellidos.',
  email: `Indica el correo corporativo (termina en @${CORPORATE_DOMAIN}).`,
  position: 'Indica el puesto.',
  department: 'Elige el departamento.',
  office: 'Elige la sede.',
  role: 'Elige el rol en el campus.',
};

export interface ValidateOptions {
  /** Personas del campus, para no repetir el correo. */
  people: readonly Person[];
  /** Ficha que se edita. Sin ella es un alta y todo es obligatorio. */
  editing?: Person;
  today?: string;
}

/** ¿Es obligatorio el dato? En un alta, siempre; al editar, si ya constaba (se corrige, no se vacía). */
export function isRequiredDate(field: PersonalDateField, editing: Person | undefined): boolean {
  if (!editing) return true;
  return field === 'birthday' ? isValidBirthday(editing.birthday) : isValidDateKey(editing.startDate);
}

/**
 * Errores del formulario, en el orden de los campos y uno por campo. La ficha se valida con el esquema
 * compartido `personSchema`; el cumpleaños y la incorporación, con `birthdaySchema` y `fullDateSchema`.
 */
export function validatePersonForm(form: PersonForm, { people, editing, today }: ValidateOptions): FieldIssue[] {
  const found = new Map<PersonField, string>();
  const email = normalizeEmail(form.email);
  const candidate = {
    id: editing?.id ?? 'p-nueva',
    email,
    name: form.name.trim(),
    position: form.position.trim(),
    department: form.department,
    office: form.office,
    role: form.role,
    status: editing?.status ?? 'activa',
  };
  const parsed = personSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as PersonField;
      if (found.has(field) || !(field in EMPTY_MESSAGE)) continue;
      const key = field as keyof typeof EMPTY_MESSAGE;
      found.set(field, key === 'email' && email ? `Usa el correo corporativo: tiene que terminar en @${CORPORATE_DOMAIN}.` : EMPTY_MESSAGE[key]);
    }
  }
  if (!found.has('email') && people.some((p) => p.id !== editing?.id && p.email.toLowerCase() === email)) {
    found.set('email', 'Ya hay una persona con ese correo en el campus: búscala en la lista.');
  }
  const birthday = birthdayIssue(form.birthdayDay, form.birthdayMonth, isRequiredDate('birthday', editing));
  if (birthday) found.set('birthday', birthday);
  const start = startDateIssue(form.startDate, isRequiredDate('startDate', editing), today);
  if (start) found.set('startDate', start);
  return FIELD_ORDER.flatMap((field) => (found.has(field) ? [{ field, message: found.get(field)! }] : []));
}

/** Id estable a partir del nombre («p-ana-perez-gomez»), sin repetir ninguno existente ni eliminado. */
export function personIdFor(name: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = `p-${slugify(name) || 'persona'}`;
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** Ficha nueva a partir de un formulario ya validado: activa, con su cumpleaños y su fecha de incorporación. */
export function newPersonFrom(form: PersonForm, takenIds: Iterable<string>): Person {
  const birthday = birthdayFromParts(form.birthdayDay, form.birthdayMonth);
  const startDate = form.startDate.trim();
  if (!birthday || !isValidDateKey(startDate) || !form.department || !form.office) throw new Error('Formulario sin validar');
  const name = form.name.trim().replace(/\s+/g, ' ');
  return {
    id: personIdFor(name, takenIds),
    email: normalizeEmail(form.email),
    name,
    position: form.position.trim(),
    department: form.department,
    office: form.office,
    role: form.role,
    status: 'activa',
    birthday,
    startDate,
  };
}

/**
 * Cambios de una edición ya validada: solo los campos que cambian (el rol tiene su propia acción, que
 * cierra las sesiones). Un dato del calendario en blanco que no constaba sigue sin constar.
 */
export function personPatch(before: Person, form: PersonForm): Partial<Person> {
  const patch: Partial<Person> = {};
  const name = form.name.trim().replace(/\s+/g, ' ');
  const email = normalizeEmail(form.email);
  const position = form.position.trim();
  if (name !== before.name) patch.name = name;
  if (email !== before.email) patch.email = email;
  if (position !== before.position) patch.position = position;
  if (form.department && form.department !== before.department) patch.department = form.department;
  if (form.office && form.office !== before.office) patch.office = form.office;
  const birthday = birthdayFromParts(form.birthdayDay, form.birthdayMonth);
  if (birthday && birthday !== before.birthday) patch.birthday = birthday;
  const startDate = form.startDate.trim();
  if (isValidDateKey(startDate) && startDate !== before.startDate) patch.startDate = startDate;
  return patch;
}

/** «Campos: puesto, cumpleaños» para la auditoría: qué cambió, nunca los valores. */
export function auditFields(patch: Partial<Person>): string {
  const labels = (Object.keys(patch) as (keyof Person)[]).map((k) => AUDIT_LABEL[k] ?? k);
  return `Campos: ${labels.join(', ')}`;
}

/* ── Autoservicio: la persona completa sus datos del calendario ─────────── */

export interface OwnDatesForm {
  birthdayDay: string;
  birthdayMonth: string;
  startDate: string;
}

export function ownDatesForm(p: Pick<Person, 'birthday' | 'startDate'>): OwnDatesForm {
  const { day, month } = birthdayParts(p.birthday);
  return { birthdayDay: day, birthdayMonth: month, startDate: isValidDateKey(p.startDate) ? p.startDate : '' };
}

/** La persona indica su fecha de incorporación solo si aún no consta; después la corrige administración. */
export function canEditOwnStartDate(p: Pick<Person, 'startDate'>): boolean {
  return !isValidDateKey(p.startDate);
}

/**
 * Autoservicio (como `PATCH /api/me/personal-dates`): la persona corrige su cumpleaños y, si aún no consta,
 * indica su fecha de incorporación. Puede completar uno solo (el otro sigue «sin indicar») y nada la
 * bloquea; lo que ya consta no se vacía. Devuelve los errores o lo que cambia (vacío si no cambia nada).
 */
export function validateOwnDates(form: OwnDatesForm, person: Pick<Person, 'birthday' | 'startDate'>, today?: string): { issues: FieldIssue[]; patch: Partial<Pick<Person, 'birthday' | 'startDate'>> } {
  const issues: FieldIssue[] = [];
  const patch: Partial<Pick<Person, 'birthday' | 'startDate'>> = {};
  const bIssue = birthdayIssue(form.birthdayDay, form.birthdayMonth, isValidBirthday(person.birthday));
  if (bIssue) issues.push({ field: 'birthday', message: bIssue });
  else {
    const birthday = birthdayFromParts(form.birthdayDay, form.birthdayMonth);
    if (birthday && birthday !== person.birthday) patch.birthday = birthday;
  }
  if (canEditOwnStartDate(person)) {
    const sIssue = startDateIssue(form.startDate, false, today);
    if (sIssue) issues.push({ field: 'startDate', message: sIssue });
    else if (form.startDate.trim()) patch.startDate = form.startDate.trim();
  }
  return { issues, patch: issues.length ? {} : patch };
}

/* ── Presentación ───────────────────────────────────────────────────────── */

/** «Falta el cumpleaños», «Falta la fecha de incorporación» o los dos; null si están completos. */
export function missingText(p: Pick<Person, 'birthday' | 'startDate'>): string | null {
  const missing = missingPersonalDates(p);
  return missing.length ? (MISSING_TEXT[missing.join(',')] ?? null) : null;
}

/** «26 de noviembre» o null. */
export function birthdayText(p: Pick<Person, 'birthday'>): string | null {
  return isValidBirthday(p.birthday) ? birthdayLabel(p.birthday) : null;
}

/**
 * Qué aparecerá en el calendario de empresa con estos datos, para las confirmaciones:
 * «su cumpleaños (cada 26 de noviembre)» y «su aniversario en FLM (cada año desde el 1 de septiembre de 2027)».
 * El aniversario empieza al cumplirse el primer año; el 29 de febrero se celebra el 28 los años no bisiestos.
 */
export function calendarParts(p: Partial<Pick<Person, 'birthday' | 'startDate'>>, owner: 'su' | 'tu'): string[] {
  const parts: string[] = [];
  if (isValidBirthday(p.birthday)) parts.push(`${owner} cumpleaños (cada ${birthdayLabel(p.birthday)}${p.birthday === '02-29' ? ', el 28 los años no bisiestos' : ''})`);
  if (isValidDateKey(p.startDate)) parts.push(`${owner} aniversario en FLM (cada año desde el ${formatLongDate(yearlyDate(p.startDate.slice(5), Number(p.startDate.slice(0, 4)) + 1))})`);
  return parts;
}

/** «1 de septiembre de 2026» o null. */
export function startDateText(p: Pick<Person, 'startDate'>): string | null {
  return isValidDateKey(p.startDate) ? formatLongDate(p.startDate) : null;
}

/** Filtro de Administración › Personas por los datos del calendario. */
export type CalendarDataFilter = '' | 'completos' | 'incompletos';

export function matchesCalendarFilter(p: Pick<Person, 'birthday' | 'startDate'>, filter: CalendarDataFilter): boolean {
  if (!filter) return true;
  const complete = missingPersonalDates(p).length === 0;
  return filter === 'completos' ? complete : !complete;
}

import { CalendarHeart, Check, CircleAlert } from 'lucide-react';
import { useId, useRef, useState, type FormEvent, type ReactNode, type Ref } from 'react';
import { isValidBirthday, monthName, type Person } from '@flm/shared';
import { Button, TextField, toast } from '@/design';
import { useDemo } from '@/data/store';
import fieldStyles from '@/design/Field.module.css';
import {
  auditFields,
  birthdayDaysIn,
  calendarParts,
  canEditOwnStartDate,
  FIELD_CONTROL,
  latestStartDate,
  ownDatesForm,
  OWN_DATES_PURPOSE,
  startDateText,
  validateOwnDates,
  type FieldIssue,
  type OwnDatesForm as OwnDatesValues,
  type PersonField,
} from './personForm';
import styles from './Admin.module.css';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Cumpleaños con dos selectores, día y mes, sin año de nacimiento. Las combinaciones que no existen
 * (31 de abril, 30 de febrero) no se pueden elegir; el 29 de febrero, sí. La pista y el error se
 * enlazan a los dos selectores (aria-describedby).
 */
export function BirthdayField({
  day,
  month,
  onChange,
  error,
  required,
  hint,
  legend = 'Cumpleaños',
}: {
  day: string;
  month: string;
  onChange: (next: { day: string; month: string }) => void;
  error?: string;
  required?: boolean;
  hint?: ReactNode;
  legend?: string;
}) {
  const id = useId();
  const max = birthdayDaysIn(month);
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  const control = `${fieldStyles.control} ${fieldStyles.select}`;
  return (
    <fieldset className={`${fieldStyles.field} ${styles.dateSet}`} data-invalid={error ? true : undefined}>
      <legend className={`${fieldStyles.label} ${styles.dateLegend}`}>
        {legend}
        {required && (
          <span className={fieldStyles.required} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </legend>
      {hint && (
        <p id={`${id}-hint`} className={fieldStyles.hint}>
          {hint}
        </p>
      )}
      <div className={styles.dateParts}>
        <div className={styles.datePart}>
          <label htmlFor={`${id}-d`} className={styles.datePartLabel}>
            Día
          </label>
          <select id={`${id}-d`} name={FIELD_CONTROL.birthday} value={day} required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={control} onChange={(e) => onChange({ day: e.target.value, month })}>
            <option value="">Día</option>
            {DAYS.map((d) => (
              <option key={d} value={String(d)} disabled={d > max}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.datePart}>
          <label htmlFor={`${id}-m`} className={styles.datePartLabel}>
            Mes
          </label>
          <select id={`${id}-m`} name="birthdayMonth" value={month} required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={control} onChange={(e) => onChange({ day, month: e.target.value })}>
            <option value="">Mes</option>
            {MONTHS.map((m) => (
              <option key={m} value={String(m)} disabled={!!day && Number(day) > birthdayDaysIn(String(m))}>
                {capitalize(monthName(m))}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className={fieldStyles.error} role="alert">
          <CircleAlert size={15} aria-hidden="true" /> {error}
        </p>
      )}
    </fieldset>
  );
}

/** Fecha completa de incorporación a FLM (día, mes y año), con el selector de fecha del sistema. */
export function StartDateField({ value, onChange, error, required, hint, label = 'Fecha de incorporación a FLM' }: { value: string; onChange: (v: string) => void; error?: string; required?: boolean; hint?: ReactNode; label?: string }) {
  return (
    <TextField
      type="date"
      name={FIELD_CONTROL.startDate}
      label={label}
      value={value}
      min="1950-01-01"
      max={latestStartDate()}
      required={required}
      hint={hint}
      error={error}
      onChange={(e) => onChange(e.target.value)}
      className={styles.dateInput}
    />
  );
}

/** Resumen de errores al enviar: recibe el foco y cada error lleva a su campo. */
export function FormErrorSummary({ issues, title, onPick, ref }: { issues: FieldIssue[]; title: string; onPick: (field: PersonField) => void; ref?: Ref<HTMLDivElement> }) {
  const id = useId();
  if (!issues.length) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" aria-labelledby={id} className={styles.formSummary}>
      <p id={id} className={styles.formSummaryTitle}>
        <CircleAlert size={18} aria-hidden="true" /> {title}
      </p>
      <ul className={styles.formSummaryList}>
        {issues.map((i) => (
          <li key={i.field}>
            <button type="button" className={styles.formSummaryLink} onClick={() => onPick(i.field)}>
              {i.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Pone el foco en el control de un campo dentro de un formulario (por su atributo `name`). */
export function focusControl(form: HTMLFormElement | null, field: PersonField) {
  form?.querySelector<HTMLElement>(`[name="${FIELD_CONTROL[field]}"]`)?.focus();
}

/** Para qué sirven, en una línea con icono (encabeza los formularios de fechas). */
export function DatesPurpose({ children }: { children: ReactNode }) {
  return (
    <p className={styles.purpose}>
      <CalendarHeart size={18} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Texto de confirmación: qué aparecerá en el calendario a partir de ahora. */
function savedText(patch: Partial<Pick<Person, 'birthday' | 'startDate'>>): string {
  const parts = calendarParts(patch, 'tu');
  return `En el calendario de empresa ${parts.length > 1 ? 'aparecerán' : 'aparecerá'} ${parts.join(' y ')}.`;
}

const missingNothing = (v: OwnDatesValues) => !v.birthdayDay && !v.birthdayMonth && !v.startDate;

/**
 * Autoservicio: la persona completa o corrige sus datos del calendario desde su perfil o los ajustes,
 * sin que nada la bloquee. Corrige su cumpleaños cuando quiera; la fecha de incorporación la indica solo
 * si aún no consta (después la cambia administración). En la demo se guarda en este navegador; en la
 * versión interna, con `PATCH /api/me/personal-dates`.
 *
 * `inline`: con su propio botón «Guardar» (Ajustes). Sin él, el botón va fuera, con `form={formId}` (diálogo).
 */
export function OwnDatesForm({ person, formId, onDone, inline = false, showPurpose = true }: { person: Person; formId: string; onDone?: () => void; inline?: boolean; showPurpose?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<OwnDatesValues>(() => ownDatesForm(person));
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [tried, setTried] = useState(false);
  const editableStart = canEditOwnStartDate(person);
  const hasBirthday = isValidBirthday(person.birthday);
  const errorOf = (f: PersonField) => (tried ? issues.find((i) => i.field === f)?.message : undefined);

  const update = (patch: Partial<OwnDatesValues>) => {
    const next = { ...values, ...patch };
    setValues(next);
    if (tried) setIssues(validateOwnDates(next, person).issues);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateOwnDates(values, person);
    setTried(true);
    setIssues(result.issues);
    if (result.issues.length) {
      window.setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    if (!Object.keys(result.patch).length) {
      toast.info('No hay cambios que guardar', missingNothing(values) ? 'Puedes completarlos más adelante: el campus funciona igual mientras tanto.' : 'Tus datos del calendario ya estaban así.');
      onDone?.();
      return;
    }
    const st = useDemo.getState();
    st.patchPerson(person.id, result.patch);
    st.log({ actorId: person.id, action: 'perfil.fechas', entity: 'persona', entityId: person.id, detail: auditFields(result.patch) });
    toast.success('Datos guardados', savedText(result.patch));
    setTried(false);
    onDone?.();
  };

  return (
    <form id={formId} ref={formRef} className={styles.ownForm} onSubmit={submit} noValidate>
      {showPurpose && <DatesPurpose>{OWN_DATES_PURPOSE}</DatesPurpose>}
      <FormErrorSummary ref={summaryRef} issues={tried ? issues : []} title={issues.length === 1 ? 'Revisa este dato antes de guardar:' : 'Revisa estos datos antes de guardar:'} onPick={(f) => focusControl(formRef.current, f)} />
      <BirthdayField
        legend="Tu cumpleaños"
        day={values.birthdayDay}
        month={values.birthdayMonth}
        onChange={({ day, month }) => update({ birthdayDay: day, birthdayMonth: month })}
        required={hasBirthday}
        hint={hasBirthday ? 'Solo el día y el mes. Puedes corregirlo cuando quieras.' : 'Solo el día y el mes: el año no se pide. Si prefieres hacerlo más adelante, déjalo en blanco.'}
        error={errorOf('birthday')}
      />
      {editableStart ? (
        <StartDateField
          label="Tu fecha de incorporación a FLM"
          value={values.startDate}
          onChange={(v) => update({ startDate: v })}
          hint="El día en que empezaste en FLM. Si no la sabes con seguridad, déjala en blanco: administración puede completarla."
          error={errorOf('startDate')}
        />
      ) : (
        <div className={styles.fixedDate}>
          <p className={styles.fixedLabel}>Tu fecha de incorporación a FLM</p>
          <p className={styles.fixedValue}>{startDateText(person)}</p>
          <p className={fieldStyles.hint}>Solo la cambia administración. Si no es correcta, pídele a administración del campus que la corrija.</p>
        </div>
      )}
      {inline && (
        <div className={styles.ownActions}>
          <Button type="submit" icon={<Check />}>
            Guardar
          </Button>
        </div>
      )}
    </form>
  );
}

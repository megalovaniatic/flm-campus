import { Check, UserPlus } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { ROLE_DESCRIPTION, ROLE_LABEL, type Person, type Role } from '@flm/shared';
import { Button, Dialog, SelectField, TextField, toast } from '@/design';
import { useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { ChoiceGroup } from '@/features/manage/editor/fields';
import { BirthdayField, DatesPurpose, focusControl, FormErrorSummary, StartDateField } from './PersonalDates';
import {
  auditFields,
  calendarParts,
  DEPARTMENTS,
  emptyPersonForm,
  isRequiredDate,
  newPersonFrom,
  OFFICES,
  PERSONAL_DATES_PURPOSE,
  personPatch,
  personToForm,
  ROLES,
  validatePersonForm,
  type FieldIssue,
  type PersonField,
  type PersonForm,
} from './personForm';
import styles from './Admin.module.css';

/** Qué abre el diálogo: un alta o la ficha de una persona. */
export type PersonDialogTarget = { mode: 'alta' } | { mode: 'editar'; person: Person };

interface Props {
  target: PersonDialogTarget | null;
  /** Personas del campus (para no repetir el correo). */
  people: Person[];
  /** Ids que ya no se pueden usar: los de la semilla, las altas y los perfiles eliminados. */
  takenIds: string[];
  actorId: string;
  onClose: () => void;
  /** Tras guardar, con la persona tal como queda. */
  onSaved?: (person: Person) => void;
}

/** « En el calendario de empresa aparecerán su cumpleaños (cada 26 de noviembre) y su aniversario en FLM (…)». */
function calendarLine(p: Pick<Person, 'birthday' | 'startDate'>): string {
  const parts = calendarParts(p, 'su');
  return parts.length ? ` En el calendario de empresa ${parts.length > 1 ? 'aparecerán' : 'aparecerá'} ${parts.join(' y ')}.` : '';
}

/**
 * «Dar de alta a una persona» y «Editar la ficha» (Administración › Personas). Pide la ficha profesional
 * y, para el calendario de empresa, el cumpleaños (día y mes, sin año) y la fecha completa de
 * incorporación: obligatorios en el alta; en un perfil anterior que no los tiene se pueden dejar en
 * blanco y completar después. Los errores se enlazan a cada campo y se resumen al principio.
 *
 * En la demo se guarda en este navegador (`addPerson` y `patchPerson`) y queda en la auditoría
 * (persona.alta y persona.editar). En la versión interna, `POST /api/people` (que envía el enlace de
 * activación de 7 días) y `PATCH /api/people/:id`.
 */
export function PersonDialog({ target, people, takenIds, actorId, onClose, onSaved }: Props) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<PersonForm>(emptyPersonForm);
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [tried, setTried] = useState(false);

  // Cada vez que se abre, el formulario empieza de cero (alta) o con la ficha (edición).
  const open = !!target;
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (target) {
      setForm(target.mode === 'editar' ? personToForm(target.person) : emptyPersonForm());
      setIssues([]);
      setTried(false);
    }
  }
  // Se mantiene el último destino mientras el diálogo se cierra, para que no se vacíe al desvanecerse.
  const [last, setLast] = useState(target);
  if (target && target !== last) setLast(target);
  const shown = target ?? last;
  const editing = shown?.mode === 'editar' ? shown.person : undefined;

  const errorOf = (f: PersonField) => (tried ? issues.find((i) => i.field === f)?.message : undefined);
  const set = (patch: Partial<PersonForm>) => {
    const next = { ...form, ...patch };
    setForm(next);
    if (tried) setIssues(validatePersonForm(next, { people, editing }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validatePersonForm(form, { people, editing });
    setTried(true);
    setIssues(found);
    if (found.length) {
      window.setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    const st = useDemo.getState();
    if (!editing) {
      const person = newPersonFrom(form, takenIds);
      st.addPerson(person);
      st.log({ actorId, action: 'persona.alta', entity: 'persona', entityId: person.id, detail: `Rol: ${person.role}` });
      toast.success('Persona dada de alta', `${person.name} ya está en el campus.${calendarLine(person)}`);
      onSaved?.(person);
      onClose();
      return;
    }
    const patch = personPatch(editing, form);
    if (!Object.keys(patch).length) {
      toast.info('No hay cambios que guardar', `La ficha de ${editing.name} ya estaba así.`);
      onClose();
      return;
    }
    st.patchPerson(editing.id, patch);
    st.log({ actorId, action: 'persona.editar', entity: 'persona', entityId: editing.id, detail: auditFields(patch) });
    const name = patch.name ?? editing.name;
    toast.success('Ficha actualizada', `Se han guardado los cambios de ${name}.${calendarLine({ birthday: patch.birthday, startDate: patch.startDate })}`);
    onSaved?.({ ...editing, ...patch });
    onClose();
  };

  const birthdayRequired = isRequiredDate('birthday', editing);
  const startRequired = isRequiredDate('startDate', editing);
  const title = editing ? 'Editar la ficha' : 'Dar de alta a una persona';
  const description = editing
    ? `${editing.name} · ${editing.email}`
    : __DEMO__
      ? 'En esta demostración el alta se guarda solo en tu navegador. En la versión interna, la persona recibe un enlace de activación de 7 días para crear su contraseña.'
      : 'La persona recibirá un enlace de activación de 7 días para crear su contraseña.';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="sheet"
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} icon={editing ? <Check /> : <UserPlus />}>
            {editing ? 'Guardar los cambios' : 'Dar de alta'}
          </Button>
        </>
      }
    >
      {shown && (
        <form id={formId} ref={formRef} className={styles.personForm} onSubmit={submit} noValidate>
          <p className={styles.dialogNote}>Los campos marcados con * son obligatorios.</p>
          <FormErrorSummary ref={summaryRef} issues={tried ? issues : []} title={MESSAGES.invalidFields(issues.length)} onPick={(f) => focusControl(formRef.current, f)} />

          <fieldset className={styles.formGroup}>
            <legend className={styles.formGroupTitle}>Ficha profesional</legend>
            <TextField name="name" label="Nombre y apellidos" required autoComplete="off" value={form.name} onChange={(e) => set({ name: e.target.value })} error={errorOf('name')} data-autofocus />
            <TextField
              name="email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              label="Correo corporativo"
              required
              hint="Termina en @flmexperts.com. Es con el que entrará en el campus."
              value={form.email}
              onChange={(e) => set({ email: e.target.value })}
              error={errorOf('email')}
            />
            <TextField name="position" label="Puesto" required autoComplete="off" value={form.position} onChange={(e) => set({ position: e.target.value })} error={errorOf('position')} placeholder="p. ej., Asesora fiscal" />
            <div className={styles.formPair}>
              <SelectField
                name="department"
                label="Departamento"
                required
                value={form.department}
                onChange={(e) => set({ department: e.target.value as PersonForm['department'] })}
                error={errorOf('department')}
                options={[{ value: '', label: 'Elige el departamento' }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]}
              />
              <SelectField
                name="office"
                label="Sede"
                required
                value={form.office}
                onChange={(e) => set({ office: e.target.value as PersonForm['office'] })}
                error={errorOf('office')}
                options={[{ value: '', label: 'Elige la sede' }, ...OFFICES.map((o) => ({ value: o, label: o }))]}
              />
            </div>
            {editing ? (
              <p className={styles.dialogNote}>
                Rol en el campus: <strong>{ROLE_LABEL[editing.role]}</strong>. Se cambia con «Cambiar rol…», que cierra sus sesiones para aplicarlo.
              </p>
            ) : (
              <ChoiceGroup<Role> legend="Rol en el campus" variant="cards" value={form.role} onChange={(role) => set({ role })} options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r], description: ROLE_DESCRIPTION[r] }))} />
            )}
          </fieldset>

          <fieldset className={styles.formGroup}>
            <legend className={styles.formGroupTitle}>Calendario de empresa</legend>
            <DatesPurpose>{PERSONAL_DATES_PURPOSE}</DatesPurpose>
            <BirthdayField
              day={form.birthdayDay}
              month={form.birthdayMonth}
              onChange={({ day, month }) => set({ birthdayDay: day, birthdayMonth: month })}
              required={birthdayRequired}
              hint={birthdayRequired ? 'Solo el día y el mes: el año de nacimiento no se pide.' : 'Solo el día y el mes. Si no lo sabes, déjalo en blanco: la persona puede completarlo desde su perfil.'}
              error={errorOf('birthday')}
            />
            <StartDateField
              value={form.startDate}
              onChange={(startDate) => set({ startDate })}
              required={startRequired}
              hint={startRequired ? 'Día, mes y año. El primer aniversario se celebra al cumplirse un año.' : 'Día, mes y año. Si no la sabes con seguridad, déjala en blanco: no se inventa.'}
              error={errorOf('startDate')}
            />
          </fieldset>
        </form>
      )}
    </Dialog>
  );
}

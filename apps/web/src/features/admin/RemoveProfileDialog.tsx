import { FilePen, FileText, Hand, LogOut, ScrollText, UserRoundMinus, UserRoundX, UserX, Users } from 'lucide-react';
import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AREAS, type Person } from '@flm/shared';
import { Avatar, Button, Dialog, TextField } from '@/design';
import { AREA_REFERENCE } from '@/features/learn/common/data';
import { useContentRows } from '@/features/manage/model';
import { confirmsRemoval, listFormat, removalImpact, type RemovalImpact } from './removal';
import styles from './Admin.module.css';

const base = import.meta.env.BASE_URL;

/** Recuentos sobre las filas de Gestión: las mismas que se conservan sin autoría o se retiran (sus bienvenidas). */
function useRemovalImpact(person: Person | undefined): RemovalImpact | null {
  const rows = useContentRows();
  return useMemo(() => (person ? removalImpact(person.id, rows, AREA_REFERENCE) : null), [person, rows]);
}

function Effect({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className={styles.impactItem}>
      <span className={styles.impactIcon} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.impactText}>{children}</div>
    </li>
  );
}

interface Props {
  /** Persona cuyo perfil se va a eliminar; el diálogo está abierto mientras haya una. */
  person: Person | null;
  onClose: () => void;
  /** `confirm`: el correo tal como se ha escrito (sin los espacios de los extremos), que la API exige para eliminarlo. */
  onConfirm: (impact: RemovalImpact, confirm: string) => void;
  /** «Desactivar la cuenta» en su lugar, para quien solo se ausenta (si está activa y se puede). */
  onDeactivate?: () => void;
}

/**
 * «Eliminar el perfil» de quien deja FLM: explica con recuentos reales qué pasa (el perfil
 * desaparece, sus contenidos se conservan sin autoría y con firma neutra, sus bienvenidas se
 * retiran y sus intentos quedan anónimos) y pide escribir su correo para confirmar, como la API.
 * El foco empieza en «Cancelar», la acción segura.
 */
export function RemoveProfileDialog({ person, onClose, onConfirm, onDeactivate }: Props) {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  // Cada vez que se abre, la confirmación empieza vacía.
  const open = !!person;
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setText('');
      setError(undefined);
    }
  }
  // Se mantiene la última persona mientras el diálogo se cierra, para que no se vacíe al desvanecerse.
  const [last, setLast] = useState(person);
  if (person && person !== last) setLast(person);
  const shown = person ?? last ?? undefined;
  const impact = useRemovalImpact(shown);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!shown || !impact) return;
    if (!confirmsRemoval(text, shown.email)) {
      setError(text.trim() ? `El correo no coincide. Escríbelo tal como aparece: «${shown.email}».` : `Escribe su correo, «${shown.email}», para confirmar.`);
      inputRef.current?.focus();
      return;
    }
    onConfirm(impact, text.trim());
  };

  const areas = impact?.referenceAreas.map((a) => AREAS[a].name) ?? [];
  const job = shown ? [shown.position, shown.department, shown.office].filter(Boolean).join(' · ') : '';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Eliminar el perfil"
      description="Para quien ya no forma parte de FLM: su perfil desaparece del campus y lo que creó se conserva sin autoría."
      footer={
        <>
          <Button variant="ghost" data-autofocus onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} variant="danger" icon={<UserRoundMinus />}>
            Eliminar el perfil
          </Button>
        </>
      }
    >
      {shown && impact && (
        <form id={formId} className={styles.dialogBody} onSubmit={submit} noValidate>
          <div className={styles.removeWho}>
            <Avatar name={shown.name} photo={shown.photo ? base + shown.photo : undefined} size={44} decorative />
            <span className={styles.personText}>
              <span className={styles.personName}>{shown.name}</span>
              <span className={styles.personMail}>{shown.email}</span>
              {job && <span className={styles.personMail}>{job}</span>}
            </span>
          </div>

          <div className={styles.impactBlock}>
            <h3 className={styles.impactTitle}>Qué pasará</h3>
            <ul role="list" className={styles.impact}>
              <Effect icon={<UserRoundX size={16} />}>
                <p>Deja de aparecer en el campus: en Personas, en las búsquedas, en los informes y en «Ponte al día».</p>
              </Effect>
              <Effect icon={<FileText size={16} />}>
                {impact.keptTotal === 0 ? (
                  <p>No firma ningún contenido publicado.</p>
                ) : (
                  <>
                    <p>
                      <strong>Sus contenidos se conservan</strong>, sin autoría y con una firma neutra:
                    </p>
                    <ul className={styles.signatures}>
                      {impact.kept.map((g) => (
                        <li key={g.signature}>
                          {g.text}, con la firma <span className={styles.signatureName}>«{g.signature}»</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Effect>
              {impact.drafts > 0 && (
                <Effect icon={<FilePen size={16} />}>
                  <p>
                    {impact.drafts === 1 ? '1 borrador queda' : `${impact.drafts} borradores quedan`} en Gestión sin autoría: administración decide si {impact.drafts === 1 ? 'lo publica o lo elimina' : 'los publica o los elimina'}.
                  </p>
                </Effect>
              )}
              {impact.welcomes > 0 && (
                <Effect icon={<Hand size={16} />}>
                  <p>{impact.welcomes === 1 ? 'Se retira su bienvenida' : `Se retiran sus ${impact.welcomes} bienvenidas`} de «Ponte al día» y de Gestión.</p>
                </Effect>
              )}
              {areas.length > 0 && (
                <Effect icon={<Users size={16} />}>
                  <p>
                    Es la persona de referencia {areas.length === 1 ? `del Área ${areas[0]}` : `de las áreas ${listFormat.format(areas)}`}: {areas.length === 1 ? 'el área deja' : 'las áreas dejan'} de mostrar ese bloque.
                  </p>
                </Effect>
              )}
              <Effect icon={<LogOut size={16} />}>
                <p>Se cierran sus sesiones y sus intentos de test quedan en los informes como agregados anónimos.</p>
              </Effect>
              <Effect icon={<ScrollText size={16} />}>
                <p>Queda constancia en la auditoría, sin datos personales en el detalle.</p>
              </Effect>
            </ul>
          </div>

          {shown.status === 'activa' && onDeactivate && (
            <div className={styles.removeAlt}>
              <p>¿Solo se ausenta una temporada? Desactiva la cuenta: no podrá entrar, pero conserva su perfil y se puede reactivar.</p>
              <Button size="sm" variant="secondary" icon={<UserX />} onClick={onDeactivate}>
                Desactivar la cuenta
              </Button>
            </div>
          )}

          <TextField
            ref={inputRef}
            label={`Para confirmar, escribe su correo: «${shown.email}»`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(undefined);
            }}
            inputMode="email"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            hint="Es la confirmación explícita que exige la política de conservación. En la versión interna no se puede deshacer."
            error={error}
          />
          {__DEMO__ && <p className={styles.dialogNote}>En esta demostración puedes recuperarlo con «Restablecer», en la banda superior.</p>}
        </form>
      )}
    </Dialog>
  );
}

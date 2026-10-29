import { AnimatePresence, motion } from 'motion/react';
import {
  BadgeCheck,
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  CircleCheck,
  CircleSlash,
  Ellipsis,
  FlaskConical,
  Lock,
  LogOut,
  PenLine,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserPen,
  UserPlus,
  UserRound,
  UserRoundMinus,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { can, formatShortDate, madridParts, missingPersonalDates, normalize, relativeDay, madridDateKey, ROLE_DESCRIPTION, ROLE_LABEL, type Office, type Person, type Role } from '@flm/shared';
import { Avatar, Button, Chip, Dialog, EmptyState, Popover, SelectField, toast } from '@/design';
import { campusPeople, DEMO_USER_ID, useMe, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { ChoiceGroup } from '@/features/manage/editor/fields';
import { useMediaQuery } from '@/features/manage/useMediaQuery';
import { birthdayText, matchesCalendarFilter, type CalendarDataFilter } from './personForm';
import { PersonDialog, type PersonDialogTarget } from './PersonDialog';
import { confirmsRemoval, removalAuditDetail, type RemovalImpact } from './removal';
import { RemoveProfileDialog } from './RemoveProfileDialog';
import styles from './Admin.module.css';

const base = import.meta.env.BASE_URL;
const pad = (n: number) => String(n).padStart(2, '0');

function activeAdmins(people: Person[], excludeId?: string) {
  return people.filter((p) => p.role === 'admin' && p.status === 'activa' && p.id !== excludeId).length;
}

type Act = 'editar' | 'rol' | 'desactivar' | 'reactivar' | 'revocar' | 'eliminar-perfil';

/** Quién actúa: su id y el rol con el que ve el campus. */
interface Actor {
  id: string;
  effectiveRole: Role;
}

/** Motivo por el que una acción no está disponible (mismas reglas que la API), o null. */
function guard(p: Person, act: Act, actor: Actor, people: Person[], nextRole?: Role): string | null {
  if (act === 'eliminar-perfil' && !can(actor.effectiveRole, 'datos-personales:eliminar')) return 'Solo administración puede eliminar perfiles.';
  if (p.id === actor.id) {
    if (act === 'rol') return 'No puedes cambiar tu propio rol desde la administración. Pídeselo a otra persona administradora.';
    if (act === 'desactivar') return 'No puedes desactivar tu propia cuenta desde la administración.';
    if (act === 'eliminar-perfil') return 'No puedes eliminar tu propio perfil. Pídeselo a otra persona administradora.';
  }
  if (act === 'eliminar-perfil' && __DEMO__ && p.id === DEMO_USER_ID) return 'Es el perfil con el que se recorre esta demostración: no se puede eliminar.';
  const lastAdmin = p.role === 'admin' && p.status === 'activa' && activeAdmins(people, p.id) === 0;
  if (lastAdmin) {
    if (act === 'rol' && nextRole && nextRole !== 'admin') return 'No se puede quitar el rol de administración al último administrador activo. Nombra antes a otra persona administradora.';
    if (act === 'desactivar') return 'No se puede desactivar al último administrador activo. Nombra antes a otra persona administradora.';
    if (act === 'eliminar-perfil') return 'No se puede eliminar el perfil del último administrador activo. Nombra antes a otra persona administradora.';
  }
  if (act === 'desactivar' && p.status === 'inactiva') return 'La cuenta ya está desactivada.';
  if (act === 'reactivar' && p.status === 'activa') return 'La cuenta ya está activa.';
  return null;
}

const ROLE_ICON: Record<Role, ReactNode> = { admin: <ShieldCheck size={14} />, autor: <PenLine size={14} />, empleado: <UserRound size={14} /> };

function RoleChip({ role }: { role: Role }) {
  return (
    <Chip size="sm" tone={role === 'admin' ? 'brand' : role === 'autor' ? 'info' : 'neutral'} icon={ROLE_ICON[role]}>
      {ROLE_LABEL[role]}
    </Chip>
  );
}

function StatusChip({ p }: { p: Person }) {
  return p.status === 'activa' ? (
    <Chip size="sm" tone="success" icon={<CircleCheck size={14} />}>
      Activa
    </Chip>
  ) : (
    <Chip size="sm" tone="neutral" icon={<CircleSlash size={14} />}>
      Inactiva
    </Chip>
  );
}

function OriginChip({ p }: { p: Person }) {
  return p.fictional ? (
    <Chip size="sm" tone="inverse" icon={<FlaskConical size={14} />}>
      Persona ficticia
    </Chip>
  ) : (
    <Chip size="sm" tone="neutral" icon={<BadgeCheck size={14} />}>
      Persona real
    </Chip>
  );
}

/** Qué falta, en corto, para la columna «Calendario». */
const MISSING_SHORT: Record<string, string> = {
  birthday: 'Falta el cumpleaños',
  startDate: 'Falta la incorporación',
  'birthday,startDate': 'Faltan los dos datos',
};

/**
 * Datos del calendario de empresa: completos o qué falta (icono y texto, nunca solo el color), con los
 * que constan. Faltar un dato no bloquea nada: la persona entra y usa el campus igual.
 */
function CalendarDates({ p }: { p: Person }) {
  const missing = missingPersonalDates(p);
  const birthday = birthdayText(p);
  const start = !missing.includes('startDate') && p.startDate ? `En FLM desde el ${formatShortDate(p.startDate)}` : null;
  const known = [birthday && `Cumple el ${birthday}`, start].filter(Boolean).join(' · ');
  return (
    <span className={styles.statusCell}>
      <span className="sr-only">Datos del calendario: </span>
      {missing.length ? (
        <Chip size="sm" tone="warning" icon={<CalendarX2 size={14} />}>
          {MISSING_SHORT[missing.join(',')]}
        </Chip>
      ) : (
        <Chip size="sm" tone="success" icon={<CalendarCheck2 size={14} />}>
          Completos
        </Chip>
      )}
      {known && <span className={styles.note}>{known}</span>}
    </span>
  );
}

function revokedLabel(iso: string | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  const p = madridParts(d);
  return `Sesiones revocadas ${relativeDay(madridDateKey(d))}, ${pad(p.hour)}:${pad(p.minute)}`;
}

function PersonActions({ p, people, actor, onPick }: { p: Person; people: Person[]; actor: Actor; onPick: (p: Person, act: Act) => void }) {
  const missing = missingPersonalDates(p).length > 0;
  const items: { act: Act; label: string; icon: ReactNode; danger?: boolean; reason: string | null; hint?: string }[] = [
    { act: 'editar', label: 'Editar la ficha…', icon: <UserPen size={18} />, reason: null, hint: missing ? 'Faltan datos del calendario: puedes completarlos aquí.' : undefined },
    { act: 'rol', label: 'Cambiar rol…', icon: <UserCog size={18} />, reason: guard(p, 'rol', actor, people) },
    p.status === 'activa'
      ? { act: 'desactivar', label: 'Desactivar la cuenta…', icon: <UserX size={18} />, reason: guard(p, 'desactivar', actor, people) }
      : { act: 'reactivar', label: 'Reactivar la cuenta', icon: <UserCheck size={18} />, reason: guard(p, 'reactivar', actor, people) },
    { act: 'revocar', label: 'Revocar sesiones…', icon: <LogOut size={18} />, reason: null },
    { act: 'eliminar-perfil', label: 'Eliminar el perfil…', icon: <UserRoundMinus size={18} />, danger: true, reason: guard(p, 'eliminar-perfil', actor, people) },
  ];
  return (
    <Popover label={`Acciones para ${p.name}`} width={290} triggerClassName={styles.more} trigger={<Ellipsis size={20} aria-hidden="true" />}>
      {(close) => (
        <ul role="list" className={styles.menu}>
          {items.map((it) => (
            <li key={it.act}>
              <button
                type="button"
                className={styles.menuItem}
                data-danger={it.danger || undefined}
                aria-disabled={it.reason ? true : undefined}
                onClick={() => {
                  if (it.reason) {
                    toast.error('Acción no disponible', it.reason);
                    return;
                  }
                  close();
                  onPick(p, it.act);
                }}
              >
                {it.reason ? <Lock size={18} /> : it.icon}
                <span className={styles.menuText}>
                  {it.label}
                  {(it.reason ?? it.hint) && <span className={styles.menuReason}>{it.reason ?? it.hint}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  );
}

function PersonName({ p }: { p: Person }) {
  return (
    <span className={styles.person}>
      <Avatar name={p.name} photo={p.photo ? base + p.photo : undefined} size={36} decorative />
      <span className={styles.personText}>
        <span className={styles.personName}>{p.name}</span>
        <span className={styles.personMail}>{p.email}</span>
      </span>
    </span>
  );
}

const rowMotion = {
  layout: 'position' as const,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.12 } },
  transition: { duration: 0.2 },
};

/**
 * Personas: alta, ficha (con los datos del calendario de empresa), roles, activación, sesiones y
 * eliminación del perfil de quien deja FLM. «Eliminar el perfil» sustituye a la antigua «Eliminar
 * datos personales» (anonimizar la ficha): hace todo lo que hacía y además retira a la persona del
 * campus y deja su contenido sin autoría.
 *
 * Los perfiles a los que les falta el cumpleaños o la fecha de incorporación se señalan y se pueden
 * filtrar, pero nada se bloquea: cada persona los completa desde su perfil o administración, aquí.
 */
export function PeopleSection() {
  const me = useMe();
  const people = usePeople();
  const revoked = useDemo((s) => s.revokedSessions);
  const removed = useDemo((s) => s.removedPeople);
  const extra = useDemo((s) => s.extraPeople);
  const removedCount = Object.keys(removed).length;
  const compact = useMediaQuery('(max-width: 979px)');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [estado, setEstado] = useState('');
  const [sede, setSede] = useState('');
  const [origen, setOrigen] = useState('');
  const [calendario, setCalendario] = useState<CalendarDataFilter>('');
  const [limit, setLimit] = useState(24);
  const [dialog, setDialog] = useState<{ p: Person; act: Exclude<Act, 'reactivar' | 'editar'> } | null>(null);
  const [editor, setEditor] = useState<PersonDialogTarget | null>(null);
  const [nextRole, setNextRole] = useState<Role>('empleado');
  // Ids que ya no puede llevar un alta: semilla, altas de esta demo y perfiles eliminados (seguirían ocultos).
  const takenIds = useMemo(() => [...campusPeople(extra).map((p) => p.id), ...Object.keys(removed)], [extra, removed]);
  const incomplete = useMemo(() => people.filter((p) => missingPersonalDates(p).length > 0).length, [people]);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return people
      .filter((p) => {
        if (role && p.role !== role) return false;
        if (estado && p.status !== estado) return false;
        if (sede && p.office !== sede) return false;
        if (origen === 'real' && p.fictional) return false;
        if (origen === 'ficticia' && !p.fictional) return false;
        if (!matchesCalendarFilter(p, calendario)) return false;
        if (nq && !nq.split(' ').every((t) => normalize(`${p.name} ${p.email} ${p.position} ${p.department} ${p.office}`).includes(t))) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [people, q, role, estado, sede, origen, calendario]);

  if (!me) return null;
  const actor: Actor = { id: me.id, effectiveRole: me.effectiveRole };
  const activeCount = people.filter((p) => p.status === 'activa').length;
  const adminCount = activeAdmins(people);
  const realCount = people.filter((p) => !p.fictional).length;

  const log = (action: string, p: Person, detail?: string) => useDemo.getState().log({ actorId: actor.id, action, entity: 'persona', entityId: p.id, ...(detail ? { detail } : {}) });

  const onPick = (p: Person, act: Act) => {
    if (act === 'editar') {
      setEditor({ mode: 'editar', person: p });
      return;
    }
    if (act === 'reactivar') {
      useDemo.getState().patchPerson(p.id, { status: 'activa' });
      log('persona.reactivar', p);
      toast.success('Cuenta reactivada', `${p.name} puede volver a entrar en el campus.`);
      return;
    }
    if (act === 'rol') setNextRole(p.role);
    setDialog({ p, act });
  };

  const close = () => setDialog(null);
  const d = dialog;
  const roleReason = d?.act === 'rol' ? guard(d.p, 'rol', actor, people, nextRole) : null;

  const confirm = () => {
    if (!d) return;
    const st = useDemo.getState();
    const { p, act } = d;
    const reason = guard(p, act, actor, people, nextRole);
    if (reason) {
      toast.error('Acción no disponible', reason);
      return;
    }
    if (act === 'rol') {
      if (nextRole === p.role) return close();
      st.patchPerson(p.id, { role: nextRole });
      st.revokeSessions(p.id);
      log('persona.cambiar-rol', p, `Rol: ${p.role} → ${nextRole}. Sesiones cerradas.`);
      toast.success('Rol actualizado', `${p.name} pasa a ${ROLE_LABEL[nextRole].toLowerCase()}. Sus sesiones se han cerrado para aplicar el cambio.`);
    } else if (act === 'desactivar') {
      st.patchPerson(p.id, { status: 'inactiva' });
      st.revokeSessions(p.id);
      log('persona.desactivar', p, 'Sesiones cerradas.');
      toast.success('Cuenta desactivada', `${p.name} ya no puede entrar y sus sesiones se han cerrado.`);
    } else if (act === 'revocar') {
      st.revokeSessions(p.id);
      log('sesion.revocar-todas', p, 'Sesiones cerradas.');
      toast.success('Sesiones revocadas', `${p.name} tendrá que volver a iniciar sesión en todos sus dispositivos.`);
    }
    close();
  };

  /**
   * Elimina el perfil: la persona desaparece del campus (usePeople), su contenido queda sin autoría
   * y con firma neutra, sus bienvenidas se retiran y sus intentos solo cuentan como agregados anónimos.
   * `confirm` es el correo escrito en el diálogo. En la versión interna lo hace la API con
   * `api.removePerson(p.id, confirm)` (borrado real de la cuenta, que vuelve a comprobar el correo)
   * y no se puede deshacer.
   */
  const removeProfile = (impact: RemovalImpact, confirm: string) => {
    if (d?.act !== 'eliminar-perfil') return;
    const { p } = d;
    const reason = guard(p, 'eliminar-perfil', actor, people);
    if (reason) {
      toast.error('Acción no disponible', reason);
      return;
    }
    // La misma comprobación que la API: sin su correo no se elimina.
    if (!confirmsRemoval(confirm, p.email)) {
      toast.error('Falta la confirmación', `Para eliminar el perfil, escribe su correo: «${p.email}».`);
      return;
    }
    log('persona.eliminar-perfil', p, removalAuditDetail(impact));
    useDemo.getState().removePerson(p.id);
    close();
    toast.success('Perfil eliminado', `${p.name} ya no aparece en el campus.${impact.keptTotal + impact.drafts > 0 ? ' Sus contenidos se conservan sin autoría.' : ''}`);
    // Su fila desaparece: el foco pasa al título de la sección para no perderse.
    window.setTimeout(() => headingRef.current?.focus(), 0);
  };

  const filtersOn = !!(q || role || estado || sede || origen || calendario);
  const shown = filtered.slice(0, limit);

  return (
    <section className={styles.section} aria-labelledby="h-personas">
      <div className={styles.sectionHead}>
        <div className={styles.headText}>
          <h2 id="h-personas" ref={headingRef} tabIndex={-1} className="section-title">
            Personas
          </h2>
          <p className={styles.summary}>
            <Users size={16} aria-hidden="true" /> {people.length} personas · {activeCount} activas · {adminCount} {adminCount === 1 ? 'administrador activo' : 'administradores activos'} · {realCount} reales y {people.length - realCount} ficticias
            {removedCount > 0 ? ` · ${removedCount} ${removedCount === 1 ? 'perfil eliminado' : 'perfiles eliminados'}` : ''}
          </p>
        </div>
        <Button icon={<UserPlus />} onClick={() => setEditor({ mode: 'alta' })}>
          Dar de alta a una persona
        </Button>
      </div>

      <div className={styles.toolbar} role="search" aria-label="Buscar y filtrar personas">
        <div className={styles.search}>
          <label htmlFor="admin-personas-q" className="sr-only">
            Buscar por nombre, correo o puesto
          </label>
          <Search size={18} aria-hidden="true" className={styles.searchIcon} />
          <input id="admin-personas-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo o puesto" className={styles.searchInput} autoComplete="off" />
          {q && (
            <button type="button" className={styles.clear} aria-label="Borrar la búsqueda" onClick={() => setQ('')}>
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className={styles.filters5}>
          <SelectField label="Rol" value={role} onChange={(e) => setRole(e.target.value)} options={[{ value: '', label: 'Todos' }, ...(['admin', 'autor', 'empleado'] as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))]} />
          <SelectField
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'activa', label: 'Activa' },
              { value: 'inactiva', label: 'Inactiva' },
            ]}
          />
          <SelectField label="Sede" value={sede} onChange={(e) => setSede(e.target.value)} options={[{ value: '', label: 'Todas' }, ...(['Barcelona', 'Vic', 'Granollers'] as Office[]).map((o) => ({ value: o, label: o }))]} />
          <SelectField
            label="Origen"
            value={origen}
            onChange={(e) => setOrigen(e.target.value)}
            options={[
              { value: '', label: 'Todas' },
              { value: 'real', label: 'Personas reales' },
              { value: 'ficticia', label: 'Personas ficticias' },
            ]}
          />
          <SelectField
            label="Calendario"
            value={calendario}
            onChange={(e) => setCalendario(e.target.value as CalendarDataFilter)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'completos', label: 'Datos completos' },
              { value: 'incompletos', label: 'Faltan datos' },
            ]}
          />
        </div>
      </div>
      {incomplete > 0 && (
        <div className={styles.datesNote} role="note">
          <span className={styles.datesNoteIcon} aria-hidden="true">
            <CalendarClock size={18} />
          </span>
          <p className={styles.datesNoteText}>
            <strong>
              {incomplete === 1 ? 'A 1 perfil le faltan' : `A ${incomplete} perfiles les faltan`} datos del calendario de empresa
            </strong>{' '}
            (cumpleaños o fecha de incorporación). No se bloquea su acceso: cada persona puede completarlos desde su perfil y tú, con «Editar la ficha». Nunca se rellenan por defecto.
          </p>
          <Button size="sm" variant="secondary" onClick={() => setCalendario((c) => (c === 'incompletos' ? '' : 'incompletos'))}>
            {calendario === 'incompletos' ? 'Mostrar también los completos' : 'Ver solo esos perfiles'}
          </Button>
        </div>
      )}
      <p className={styles.count} aria-live="polite">
        {filtered.length === 1 ? '1 persona' : `${filtered.length} personas`}
        {filtersOn ? ' con estos filtros' : ''}
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search />} title={q ? MESSAGES.emptySearch.title : MESSAGES.emptyFilter.title}>
          <p>{q ? MESSAGES.emptySearch.body(q) : MESSAGES.emptyFilter.body}</p>
        </EmptyState>
      ) : compact ? (
        <ul role="list" className={styles.cards}>
          <AnimatePresence initial={false}>
            {shown.map((p) => (
              <motion.li key={p.id} {...rowMotion} className={styles.card}>
                <div className={styles.cardTop}>
                  <PersonName p={p} />
                  <PersonActions p={p} people={people} actor={actor} onPick={onPick} />
                </div>
                <p className={styles.cardLine}>{[p.position, p.department, p.office].filter(Boolean).join(' · ') || 'Sin datos de puesto'}</p>
                <div className={styles.chips}>
                  <RoleChip role={p.role} />
                  <StatusChip p={p} />
                  <OriginChip p={p} />
                </div>
                <CalendarDates p={p} />
                {revoked[p.id] && <p className={styles.note}>{revokedLabel(revoked[p.id])}</p>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="sr-only">Personas del campus ({filtered.length})</caption>
            <thead>
              <tr>
                <th scope="col">Persona</th>
                <th scope="col">Puesto y sede</th>
                <th scope="col">Rol</th>
                <th scope="col">Estado</th>
                <th scope="col">Calendario</th>
                <th scope="col">Origen</th>
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {shown.map((p) => (
                  <motion.tr key={p.id} {...rowMotion}>
                    <td>
                      <PersonName p={p} />
                    </td>
                    <td>
                      <span className={styles.cellMain}>{p.position || '—'}</span>
                      <span className={styles.cellSub}>
                        {p.department} · {p.office}
                      </span>
                    </td>
                    <td>
                      <RoleChip role={p.role} />
                    </td>
                    <td>
                      <span className={styles.statusCell}>
                        <StatusChip p={p} />
                        {revoked[p.id] && <span className={styles.note}>{revokedLabel(revoked[p.id])}</span>}
                      </span>
                    </td>
                    <td>
                      <CalendarDates p={p} />
                    </td>
                    <td>
                      <OriginChip p={p} />
                    </td>
                    <td className={styles.actionsCell}>
                      <PersonActions p={p} people={people} actor={actor} onPick={onPick} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
      {filtered.length > limit && (
        <div className={styles.moreRow}>
          <Button variant="secondary" onClick={() => setLimit((l) => l + 24)}>
            Mostrar más ({filtered.length - limit} restantes)
          </Button>
        </div>
      )}

      <PersonDialog target={editor} people={people} takenIds={takenIds} actorId={actor.id} onClose={() => setEditor(null)} />

      {/* Antes que los demás diálogos: al pasar de «Eliminar el perfil» a «Desactivar», este se cierra primero y el foco vuelve bien. */}
      <RemoveProfileDialog
        person={d?.act === 'eliminar-perfil' ? d.p : null}
        onClose={close}
        onConfirm={removeProfile}
        onDeactivate={d?.act === 'eliminar-perfil' && !guard(d.p, 'desactivar', actor, people) ? () => setDialog({ p: d.p, act: 'desactivar' }) : undefined}
      />

      <Dialog
        open={d?.act === 'rol'}
        onClose={close}
        title="Cambiar el rol"
        description={d ? `${d.p.name} · ahora: ${ROLE_LABEL[d.p.role].toLowerCase()}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button icon={<UserCog />} onClick={confirm} disabled={!!roleReason || nextRole === d?.p.role}>
              Cambiar el rol
            </Button>
          </>
        }
      >
        <div className={styles.dialogBody}>
          <ChoiceGroup<Role> legend="Rol en el campus" variant="cards" value={nextRole} onChange={setNextRole} options={(['empleado', 'autor', 'admin'] as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r], description: ROLE_DESCRIPTION[r] }))} error={roleReason ?? undefined} />
          <p className={styles.dialogNote}>Para aplicar el cambio al momento, se cierran sus sesiones abiertas.</p>
        </div>
      </Dialog>

      <Dialog
        open={d?.act === 'desactivar'}
        onClose={close}
        size="sm"
        title="¿Desactivar la cuenta?"
        description={d ? `${d.p.name} no podrá entrar en el campus y se cerrarán todas sus sesiones. Su perfil y sus contenidos no cambian, y podrás reactivarla más adelante.` : undefined}
        footer={
          <>
            <Button variant="ghost" data-autofocus onClick={close}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<UserX />} onClick={confirm}>
              Desactivar
            </Button>
          </>
        }
      />

      <Dialog
        open={d?.act === 'revocar'}
        onClose={close}
        size="sm"
        title="¿Revocar todas las sesiones?"
        description={d ? `${d.p.name} tendrá que volver a iniciar sesión en todos sus dispositivos. Útil si ha perdido un equipo o sospecha de un acceso indebido.` : undefined}
        footer={
          <>
            <Button variant="ghost" data-autofocus onClick={close}>
              Cancelar
            </Button>
            <Button icon={<LogOut />} onClick={confirm}>
              Revocar sesiones
            </Button>
          </>
        }
      />
    </section>
  );
}

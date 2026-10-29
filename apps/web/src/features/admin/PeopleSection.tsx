import { AnimatePresence, motion } from 'motion/react';
import { BadgeCheck, CircleCheck, CircleSlash, Ellipsis, Eraser, FlaskConical, Lock, LogOut, PenLine, Search, ShieldCheck, UserCheck, UserCog, UserRound, Users, UserX, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { madridParts, normalize, relativeDay, madridDateKey, ROLE_DESCRIPTION, ROLE_LABEL, type Office, type Person, type Role } from '@flm/shared';
import { Avatar, Button, Chip, Dialog, EmptyState, Popover, SelectField, TextField, toast } from '@/design';
import { useMe, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { ChoiceGroup } from '@/features/manage/editor/fields';
import { useMediaQuery } from '@/features/manage/useMediaQuery';
import styles from './Admin.module.css';

const base = import.meta.env.BASE_URL;
const ANON_NAME = 'Persona eliminada';
const pad = (n: number) => String(n).padStart(2, '0');

export const isAnonymized = (p: Person) => p.email.endsWith('@anonimizada.invalid');

function activeAdmins(people: Person[], excludeId?: string) {
  return people.filter((p) => p.role === 'admin' && p.status === 'activa' && !isAnonymized(p) && p.id !== excludeId).length;
}

type Act = 'rol' | 'desactivar' | 'reactivar' | 'revocar' | 'eliminar';

/** Motivo por el que una acción no está disponible (mismas reglas que la API), o null. */
function guard(p: Person, act: Act, meId: string, people: Person[], nextRole?: Role): string | null {
  if (isAnonymized(p)) return act === 'reactivar' ? 'Una cuenta anonimizada no se puede reactivar. Crea una cuenta nueva si la persona vuelve.' : 'Los datos personales de esta cuenta ya se eliminaron.';
  if (p.id === meId) {
    if (act === 'rol') return 'No puedes cambiar tu propio rol desde la administración. Pídeselo a otra persona administradora.';
    if (act === 'desactivar') return 'No puedes desactivar tu propia cuenta desde la administración.';
    if (act === 'eliminar') return 'No puedes eliminar tus propios datos personales desde la administración. Pídeselo a otra persona administradora.';
  }
  const lastAdmin = p.role === 'admin' && p.status === 'activa' && activeAdmins(people, p.id) === 0;
  if (lastAdmin) {
    if (act === 'rol' && nextRole && nextRole !== 'admin') return 'No se puede quitar el rol de administración al último administrador activo. Nombra antes a otra persona administradora.';
    if (act === 'desactivar') return 'No se puede desactivar al último administrador activo. Nombra antes a otra persona administradora.';
    if (act === 'eliminar') return 'No se pueden eliminar los datos del último administrador activo. Nombra antes a otra persona administradora.';
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
  if (isAnonymized(p))
    return (
      <Chip size="sm" tone="inverse" icon={<Eraser size={14} />}>
        Datos eliminados
      </Chip>
    );
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

function revokedLabel(iso: string | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  const p = madridParts(d);
  return `Sesiones revocadas ${relativeDay(madridDateKey(d))}, ${pad(p.hour)}:${pad(p.minute)}`;
}

function PersonActions({ p, people, meId, onPick }: { p: Person; people: Person[]; meId: string; onPick: (p: Person, act: Act) => void }) {
  const items: { act: Act; label: string; icon: ReactNode; danger?: boolean; reason: string | null }[] = [
    { act: 'rol', label: 'Cambiar rol…', icon: <UserCog size={18} />, reason: guard(p, 'rol', meId, people) },
    p.status === 'activa'
      ? { act: 'desactivar', label: 'Desactivar la cuenta…', icon: <UserX size={18} />, reason: guard(p, 'desactivar', meId, people) }
      : { act: 'reactivar', label: 'Reactivar la cuenta', icon: <UserCheck size={18} />, reason: guard(p, 'reactivar', meId, people) },
    { act: 'revocar', label: 'Revocar sesiones…', icon: <LogOut size={18} />, reason: isAnonymized(p) ? 'Esta cuenta no tiene sesiones: sus datos se eliminaron.' : null },
    { act: 'eliminar', label: 'Eliminar datos personales…', icon: <Eraser size={18} />, danger: true, reason: guard(p, 'eliminar', meId, people) },
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
                  {it.reason && <span className={styles.menuReason}>{it.reason}</span>}
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
        <span className={styles.personMail}>{isAnonymized(p) ? 'Correo anonimizado' : p.email}</span>
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

/** Personas: roles, activación, sesiones y eliminación controlada de datos personales. */
export function PeopleSection() {
  const me = useMe();
  const people = usePeople();
  const revoked = useDemo((s) => s.revokedSessions);
  const compact = useMediaQuery('(max-width: 979px)');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [estado, setEstado] = useState('');
  const [sede, setSede] = useState('');
  const [origen, setOrigen] = useState('');
  const [limit, setLimit] = useState(24);
  const [dialog, setDialog] = useState<{ p: Person; act: Exclude<Act, 'reactivar'> } | null>(null);
  const [nextRole, setNextRole] = useState<Role>('empleado');
  const [confirmName, setConfirmName] = useState('');

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return people
      .filter((p) => {
        if (role && p.role !== role) return false;
        if (estado === 'activa' && (p.status !== 'activa' || isAnonymized(p))) return false;
        if (estado === 'inactiva' && (p.status !== 'inactiva' || isAnonymized(p))) return false;
        if (estado === 'anonimizada' && !isAnonymized(p)) return false;
        if (sede && p.office !== sede) return false;
        if (origen === 'real' && p.fictional) return false;
        if (origen === 'ficticia' && !p.fictional) return false;
        if (nq && !nq.split(' ').every((t) => normalize(`${p.name} ${p.email} ${p.position} ${p.department} ${p.office}`).includes(t))) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [people, q, role, estado, sede, origen]);

  if (!me) return null;
  const actor = me;
  const activeCount = people.filter((p) => p.status === 'activa').length;
  const adminCount = activeAdmins(people);
  const realCount = people.filter((p) => !p.fictional).length;

  const log = (action: string, p: Person, detail?: string) => useDemo.getState().log({ actorId: actor.id, action, entity: 'persona', entityId: p.id, ...(detail ? { detail } : {}) });

  const onPick = (p: Person, act: Act) => {
    if (act === 'reactivar') {
      useDemo.getState().patchPerson(p.id, { status: 'activa' });
      log('persona.reactivar', p);
      toast.success('Cuenta reactivada', `${p.name} puede volver a entrar en el campus.`);
      return;
    }
    if (act === 'rol') setNextRole(p.role);
    setConfirmName('');
    setDialog({ p, act });
  };

  const close = () => setDialog(null);
  const d = dialog;
  const roleReason = d?.act === 'rol' ? guard(d.p, 'rol', actor.id, people, nextRole) : null;
  const nameMatches = !!d && normalize(confirmName) === normalize(d.p.name);

  const confirm = () => {
    if (!d) return;
    const st = useDemo.getState();
    const { p, act } = d;
    const reason = guard(p, act, actor.id, people, nextRole);
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
    } else if (act === 'eliminar') {
      if (!nameMatches) return;
      // Cadenas vacías (no undefined) para que la anonimización sobreviva al guardado local.
      st.patchPerson(p.id, {
        name: ANON_NAME,
        email: `eliminada-${p.id}@anonimizada.invalid`,
        position: '',
        photo: '',
        startDate: '',
        birthday: '',
        showBirthday: false,
        publicSource: '',
        status: 'inactiva',
      });
      st.revokeSessions(p.id);
      log('persona.eliminar-datos', p, 'Anonimizados nombre, correo, foto y cumpleaños. Intentos de test desvinculados.');
      toast.success('Datos personales eliminados', 'La ficha queda anonimizada y la acción consta en la auditoría.');
    }
    close();
  };

  const filtersOn = !!(q || role || estado || sede || origen);
  const shown = filtered.slice(0, limit);

  return (
    <section className={styles.section} aria-labelledby="h-personas">
      <div className={styles.sectionHead}>
        <h2 id="h-personas" className="section-title">
          Personas
        </h2>
        <p className={styles.summary}>
          <Users size={16} aria-hidden="true" /> {people.length} personas · {activeCount} activas · {adminCount} {adminCount === 1 ? 'administrador activo' : 'administradores activos'} · {realCount} reales y {people.length - realCount} ficticias
        </p>
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
        <div className={styles.filters4}>
          <SelectField label="Rol" value={role} onChange={(e) => setRole(e.target.value)} options={[{ value: '', label: 'Todos' }, ...(['admin', 'autor', 'empleado'] as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))]} />
          <SelectField
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'activa', label: 'Activa' },
              { value: 'inactiva', label: 'Inactiva' },
              { value: 'anonimizada', label: 'Datos eliminados' },
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
        </div>
      </div>
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
                  <PersonActions p={p} people={people} meId={actor.id} onPick={onPick} />
                </div>
                <p className={styles.cardLine}>{[p.position, p.department, p.office].filter(Boolean).join(' · ') || 'Sin datos de puesto'}</p>
                <div className={styles.chips}>
                  <RoleChip role={p.role} />
                  <StatusChip p={p} />
                  <OriginChip p={p} />
                </div>
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
                <th scope="col">Puesto</th>
                <th scope="col">Sede</th>
                <th scope="col">Rol</th>
                <th scope="col">Estado</th>
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
                      <span className={styles.cellSub}>{p.department}</span>
                    </td>
                    <td>{p.office}</td>
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
                      <OriginChip p={p} />
                    </td>
                    <td className={styles.actionsCell}>
                      <PersonActions p={p} people={people} meId={actor.id} onPick={onPick} />
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
        description={d ? `${d.p.name} no podrá entrar en el campus y se cerrarán todas sus sesiones. Podrás reactivarla más adelante.` : undefined}
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

      <Dialog
        open={d?.act === 'eliminar'}
        onClose={close}
        title="Eliminar datos personales"
        description={d ? `Anonimiza la ficha de ${d.p.name}. En la versión interna no se puede deshacer.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<Eraser />} onClick={confirm} disabled={!nameMatches}>
              Eliminar datos personales
            </Button>
          </>
        }
      >
        {d && (
          <form
            className={styles.dialogBody}
            onSubmit={(e) => {
              e.preventDefault();
              if (nameMatches) confirm();
            }}
          >
            <ul className={styles.effects}>
              <li>Nombre y correo pasan a «{ANON_NAME}» y a una dirección no válida.</li>
              <li>Se borran la fotografía, el puesto, la fecha de incorporación y el cumpleaños.</li>
              <li>Se cierran sus sesiones; los intentos de test se desvinculan y quedan solo como agregados anónimos.</li>
              <li>Queda constancia en la auditoría, sin datos personales en el detalle.</li>
            </ul>
            <TextField label={`Para confirmar, escribe «${d.p.name}»`} value={confirmName} onChange={(e) => setConfirmName(e.target.value)} autoComplete="off" spellCheck={false} hint="Es la confirmación explícita que exige la política de retención." data-autofocus />
            {__DEMO__ && <p className={styles.dialogNote}>En esta demostración puedes recuperarlo con «Restablecer», en la banda superior.</p>}
          </form>
        )}
      </Dialog>
    </section>
  );
}

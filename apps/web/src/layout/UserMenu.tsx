import { BookOpenCheck, ChevronDown, Info, LayoutDashboard, LogOut, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { ROLE_LABEL, type Role } from '@flm/shared';
import { Avatar, Popover } from '@/design';
import { useMe } from '@/data/selectors';
import { useDemo } from '@/data/store';
import styles from './UserMenu.module.css';

const base = import.meta.env.BASE_URL;

export function UserMenu() {
  const me = useMe();
  const setRoleView = useDemo((s) => s.setRoleView);
  const signOut = useDemo((s) => s.signOut);
  const navigate = useNavigate();
  if (!me) return null;
  const role = me.effectiveRole;

  return (
    <Popover
      label={`Menú de ${me.name}`}
      triggerClassName={styles.trigger}
      width={300}
      trigger={
        <>
          <Avatar name={me.name} photo={me.photo ? base + me.photo : undefined} size={36} decorative />
          <ChevronDown size={15} aria-hidden="true" className={styles.chev} />
        </>
      }
    >
      {(close) => (
        <div className={styles.menu}>
          <div className={styles.who}>
            <Avatar name={me.name} photo={me.photo ? base + me.photo : undefined} size={44} decorative />
            <div>
              <p className={styles.name}>{me.name}</p>
              <p className={styles.position}>{me.position}</p>
            </div>
          </div>
          <ul role="list" className={styles.list}>
            <li>
              <Link to="/perfil" onClick={close} className={styles.item}>
                <UserRound size={18} aria-hidden="true" /> Mi perfil y progreso
              </Link>
            </li>
            <li>
              <Link to="/perfil/ajustes" onClick={close} className={styles.item}>
                <Settings size={18} aria-hidden="true" /> Ajustes
              </Link>
            </li>
            {(role === 'autor' || role === 'admin') && (
              <li>
                <Link to="/gestion" onClick={close} className={styles.item}>
                  <LayoutDashboard size={18} aria-hidden="true" /> Gestión de contenidos
                </Link>
              </li>
            )}
            {role === 'admin' && (
              <li>
                <Link to="/admin" onClick={close} className={styles.item}>
                  <ShieldCheck size={18} aria-hidden="true" /> Administración
                </Link>
              </li>
            )}
            <li>
              <Link to="/sobre" onClick={close} className={styles.item}>
                <Info size={18} aria-hidden="true" /> Sobre el campus
              </Link>
            </li>
          </ul>
          {__DEMO__ && (
            <fieldset className={styles.viewAs}>
              <legend>
                <BookOpenCheck size={14} aria-hidden="true" /> Ver la demo como
              </legend>
              <div className={styles.roles}>
                {(['empleado', 'autor', 'admin'] as Role[]).map((r) => (
                  <label key={r} className={styles.role} data-active={role === r}>
                    <input type="radio" name="ver-como" value={r} checked={role === r} onChange={() => setRoleView(r === me.role ? null : r)} />
                    {ROLE_LABEL[r]}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <button
            type="button"
            className={styles.item}
            onClick={() => {
              close();
              signOut();
              navigate('/acceso');
            }}
          >
            <LogOut size={18} aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      )}
    </Popover>
  );
}

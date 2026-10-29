import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ChartColumn, FileQuestionMark, FlaskConical, Inbox, LayoutGrid, ScrollText, Timer, UserRoundX, Users } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ButtonLink, EmptyState, Notice, PageHeader } from '@/design';
import { useFormations, usePeople } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { MESSAGES } from '@/lib/messages';
import { usePageTitle } from '@/lib/preferences';
import { useContentRows, withoutAuthor } from '@/features/manage/model';
import { AuditSection } from './AuditSection';
import { PeopleSection } from './PeopleSection';
import { ReportsSection } from './ReportsSection';
import { RetentionSection } from './RetentionSection';
import styles from './AdminPage.module.css';

type SectionId = 'personas' | 'informes' | 'auditoria' | 'retencion';

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon; title: string; lede: string }[] = [
  { id: 'personas', label: 'Personas', icon: Users, title: 'Personas y accesos', lede: 'Alta y ficha (con las fechas del calendario de empresa), roles, activación, sesiones y eliminación del perfil de quien deja FLM: su contenido se conserva sin autoría.' },
  { id: 'informes', label: 'Informes', icon: ChartColumn, title: 'Informes restringidos', lede: 'Participación en las formaciones, sin nombres, y errores frecuentes por pregunta.' },
  { id: 'auditoria', label: 'Auditoría', icon: ScrollText, title: 'Auditoría', lede: 'Quién hizo qué, sobre qué y cuándo. Sin contraseñas, tokens ni datos personales en el detalle.' },
  { id: 'retencion', label: 'Retención', icon: Timer, title: 'Retención de datos', lede: 'Cuánto se conserva cada dato y cómo se elimina.' },
];

function AdminNav({ current }: { current: SectionId | null }) {
  const items: { id: SectionId | null; label: string; icon: LucideIcon }[] = [{ id: null, label: 'Resumen', icon: LayoutGrid }, ...SECTIONS];
  return (
    <nav className={styles.nav} aria-label="Secciones de administración">
      <ul role="list" className={styles.navList}>
        {items.map(({ id, label, icon: Icon }) => {
          const active = id === current;
          return (
            <li key={label}>
              <Link to={id ? `/admin/${id}` : '/admin'} className={styles.navLink} aria-current={active ? 'page' : undefined}>
                {active && <motion.span layoutId="admin-nav-pill" className={styles.navPill} transition={{ type: 'spring', stiffness: 460, damping: 38 }} aria-hidden="true" />}
                <span className={styles.navContent}>
                  <Icon size={16} aria-hidden="true" /> {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Overview() {
  const people = usePeople();
  const audit = useDemo((s) => s.audit);
  const formations = useFormations();
  const rows = useContentRows();
  const active = people.filter((p) => p.status === 'activa');
  const admins = active.filter((p) => p.role === 'admin').length;
  const real = people.filter((p) => !p.fictional).length;
  // Sin revisión previa: lo que queda por hacer son los borradores (también los cambios sin publicar).
  const drafts = rows.filter((r) => r.status === 'borrador' || !!r.revisionOf).length;
  // Con la regla del filtro «Autoría › Sin autoría» de Gestión: la cifra es la que se ve al abrirlo.
  const orphan = rows.filter((r) => withoutAuthor(r, people)).length;

  const cards: { id: SectionId; figure: string; caption: string; detail: string }[] = [
    { id: 'personas', figure: String(active.length), caption: active.length === 1 ? 'persona activa' : 'personas activas', detail: `${admins} ${admins === 1 ? 'administrador' : 'administradores'} · ${real} ${real === 1 ? 'persona real' : 'personas reales'} en la demo` },
    { id: 'informes', figure: String(formations.length), caption: formations.length === 1 ? 'formación publicada' : 'formaciones publicadas', detail: 'Participación sin nombres y errores frecuentes' },
    { id: 'auditoria', figure: String(audit.length), caption: audit.length === 1 ? 'registro de esta demo' : 'registros de esta demo', detail: 'Más ejemplos rotulados para ver el formato' },
    { id: 'retencion', figure: '12 h', caption: 'sin actividad cierran la sesión', detail: '14 días como máximo · auditoría, 2 años' },
  ];

  return (
    <>
      <ul role="list" className={styles.overview}>
        {cards.map((c, i) => {
          const s = SECTIONS.find((x) => x.id === c.id)!;
          const Icon = s.icon;
          return (
            <motion.li key={c.id} className={styles.ovCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              <span className={styles.ovIcon} aria-hidden="true">
                <Icon size={18} />
              </span>
              <h2 className={styles.ovTitle}>
                <Link to={`/admin/${c.id}`} className={styles.stretch}>
                  {s.title}
                </Link>
              </h2>
              <p className={styles.ovFigure}>
                {c.figure} <span className={styles.ovCaption}>{c.caption}</span>
              </p>
              <p className={styles.ovDetail}>{c.detail}</p>
              <span className={styles.ovGo} aria-hidden="true">
                Abrir <ArrowRight size={16} />
              </span>
            </motion.li>
          );
        })}
      </ul>
      <Link to="/gestion?estado=borrador" className={styles.pendingLink}>
        <Inbox size={18} aria-hidden="true" />
        <span>
          Gestión de contenidos: <strong>{drafts === 0 ? 'ningún borrador' : drafts === 1 ? '1 borrador' : `${drafts} borradores`}</strong> sin publicar
        </span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      {orphan > 0 && (
        <Link to="/gestion?autoria=sin" className={styles.pendingLink}>
          <UserRoundX size={18} aria-hidden="true" />
          <span>
            Sin autoría: <strong>{orphan === 1 ? '1 contenido' : `${orphan} contenidos`}</strong> con la firma neutra, que solo edita administración
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </>
  );
}

/** Administración: resumen y cuatro secciones (personas, informes, auditoría, retención). */
export default function AdminPage() {
  const { section } = useParams();
  const current = SECTIONS.find((s) => s.id === section) ?? null;
  const unknown = !!section && !current;
  usePageTitle(current ? `${current.label} · Administración` : 'Administración');

  return (
    <div className="container page">
      <PageHeader
        crumbs={current ? [{ label: 'Inicio', to: '/' }, { label: 'Administración', to: '/admin' }, { label: current.label }] : [{ label: 'Inicio', to: '/' }, { label: 'Administración' }]}
        eyebrow="Administración"
        title={current ? current.title : 'Administración del campus'}
        lede={current ? current.lede : 'Personas, informes, auditoría y retención: lo que solo ve administración.'}
      />
      <AdminNav current={current?.id ?? null} />
      {__DEMO__ && (
        <div className={styles.sim}>
          <Notice icon={<FlaskConical size={18} />} title="Simulación">
            En la demostración pública, los cambios de administración solo se guardan en tu navegador; en la versión interna los ejecuta el servidor con permisos.
          </Notice>
        </div>
      )}
      {unknown ? (
        <EmptyState icon={<FileQuestionMark />} title={MESSAGES.notFound.title} action={<ButtonLink to="/admin">Volver a Administración</ButtonLink>}>
          <p>Las secciones de administración son Personas, Informes, Auditoría y Retención.</p>
        </EmptyState>
      ) : current?.id === 'personas' ? (
        <PeopleSection />
      ) : current?.id === 'informes' ? (
        <ReportsSection />
      ) : current?.id === 'auditoria' ? (
        <AuditSection />
      ) : current?.id === 'retencion' ? (
        <RetentionSection />
      ) : (
        <Overview />
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import { areaName, type EditorialStatus, type EventPhase, type FormationStatus, type Scope } from '@flm/shared';
import { Archive, BookOpenCheck, CircleCheck, CircleDashed, CircleDot, Clock3, Eye, FilePen } from 'lucide-react';
import styles from './Chip.module.css';

export type ChipTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand' | 'inverse';

export function Chip({ tone = 'neutral', icon, children, size = 'md' }: { tone?: ChipTone; icon?: ReactNode; children: ReactNode; size?: 'sm' | 'md' }) {
  return (
    <span className={[styles.chip, styles[tone], styles[size]].join(' ')}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Etiqueta de área: punto de color + nombre (el color nunca va solo). «general» = toda la firma.
 * `on='wash'`: sobre el lavado de su propia área, cápsula blanca con filete para que no se funda.
 */
export function AreaTag({ area, size = 'md', solid = false, on }: { area: Scope; size?: 'sm' | 'md'; solid?: boolean; on?: 'wash' }) {
  return (
    <span className={[styles.area, styles[size], solid ? styles.areaSolid : ''].join(' ')} data-area={area} data-on={on}>
      <span className={styles.dot} aria-hidden="true" />
      {areaName(area)}
    </span>
  );
}

const EDITORIAL: Record<EditorialStatus, { tone: ChipTone; icon: ReactNode; label: string }> = {
  borrador: { tone: 'neutral', icon: <FilePen size={14} />, label: 'Borrador' },
  publicado: { tone: 'success', icon: <Eye size={14} />, label: 'Publicado' },
  archivado: { tone: 'inverse', icon: <Archive size={14} />, label: 'Archivado' },
};

export function EditorialChip({ status, size }: { status: EditorialStatus; size?: 'sm' | 'md' }) {
  const s = EDITORIAL[status];
  return (
    <Chip tone={s.tone} icon={s.icon} size={size}>
      {s.label}
    </Chip>
  );
}

const LEARNING: Record<FormationStatus, { tone: ChipTone; icon: ReactNode; label: string }> = {
  'sin-empezar': { tone: 'neutral', icon: <CircleDashed size={14} />, label: 'Sin empezar' },
  leida: { tone: 'info', icon: <BookOpenCheck size={14} />, label: 'Formación leída' },
  'test-intentado': { tone: 'warning', icon: <CircleDot size={14} />, label: 'Test intentado' },
  'test-superado': { tone: 'info', icon: <CircleCheck size={14} />, label: 'Test superado' },
  completada: { tone: 'success', icon: <CircleCheck size={14} />, label: 'Completada' },
};

export function LearningChip({ status, size }: { status: FormationStatus; size?: 'sm' | 'md' }) {
  const s = LEARNING[status];
  return (
    <Chip tone={s.tone} icon={s.icon} size={size}>
      {s.label}
    </Chip>
  );
}

const PHASE: Record<EventPhase, { tone: ChipTone; label: string }> = {
  'en-curso': { tone: 'brand', label: 'En curso' },
  proximo: { tone: 'info', label: 'Próximo' },
  historico: { tone: 'neutral', label: 'Histórico' },
  archivado: { tone: 'inverse', label: 'Archivado' },
};

export function PhaseChip({ phase, pending, size }: { phase: EventPhase; pending?: boolean; size?: 'sm' | 'md' }) {
  if (pending && phase === 'proximo') {
    return (
      <Chip tone="warning" icon={<Clock3 size={14} />} size={size}>
        Fecha por confirmar
      </Chip>
    );
  }
  const s = PHASE[phase];
  return (
    <Chip tone={s.tone} size={size}>
      {s.label}
    </Chip>
  );
}

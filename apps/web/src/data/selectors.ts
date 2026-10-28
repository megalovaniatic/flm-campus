/**
 * Vista unificada del contenido: combina el contenido semilla con los cambios
 * hechos en la demo (estados editoriales, documentos y eventos añadidos…).
 */
import { useMemo } from 'react';
import {
  type AreaId,
  type CampusEvent,
  type EditorialStatus,
  type Formation,
  type LibraryDocument,
  type NewsItem,
  type Person,
  type Role,
  can,
  formationStatus,
  type Permission,
} from '@flm/shared';
import { seed } from '@flm/content';
import { useDemo } from './store';

export const DEMO_USER_ID = 'p-judith-calet';

export function usePeople(): Person[] {
  const overrides = useDemo((s) => s.peopleOverrides);
  return useMemo(() => seed.people.map((p) => ({ ...p, ...overrides[p.id] })), [overrides]);
}

/** Persona con la sesión iniciada (en la demo, el perfil elegido). */
export function useMe(): (Person & { effectiveRole: Role }) | null {
  const userId = useDemo((s) => s.userId);
  const roleView = useDemo((s) => s.roleView);
  const people = usePeople();
  return useMemo(() => {
    const p = people.find((x) => x.id === userId);
    if (!p) return null;
    return { ...p, effectiveRole: roleView ?? p.role };
  }, [people, userId, roleView]);
}

export function useCan(permission: Permission): boolean {
  const me = useMe();
  return !!me && can(me.effectiveRole, permission);
}

function withStatus<T extends { id: string; editorial: { status: EditorialStatus } }>(items: T[], overrides: Record<string, EditorialStatus>): T[] {
  return items.map((i) => (overrides[i.id] ? { ...i, editorial: { ...i.editorial, status: overrides[i.id]! } } : i));
}

export function useFormations(includeAll = false): Formation[] {
  const overrides = useDemo((s) => s.statusOverrides);
  return useMemo(() => {
    const list = withStatus(seed.formations, overrides);
    return includeAll ? list : list.filter((f) => f.editorial.status === 'publicado');
  }, [overrides, includeAll]);
}

export function useFormation(area: string | undefined, slug: string | undefined): Formation | undefined {
  const list = useFormations();
  return list.find((f) => f.area === area && f.slug === slug);
}

export function useAreaFormations(area: AreaId): Formation[] {
  const list = useFormations();
  return useMemo(() => list.filter((f) => f.area === area), [list, area]);
}

export function useFormationStatus(f: Formation | undefined) {
  const progress = useDemo((s) => (f ? s.progress[f.id] : undefined));
  return f ? formationStatus(progress, f) : 'sin-empezar';
}

export function useNews(includeAll = false): NewsItem[] {
  const overrides = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraNews);
  return useMemo(() => {
    const list = withStatus([...extra, ...seed.news], overrides).sort((a, b) => b.date.localeCompare(a.date));
    return includeAll ? list : list.filter((n) => n.editorial.status === 'publicado');
  }, [overrides, extra, includeAll]);
}

export function useDocuments(includeAll = false): LibraryDocument[] {
  const overrides = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraDocuments);
  const versions = useDemo((s) => s.documentVersions);
  return useMemo(() => {
    const list = withStatus([...extra, ...seed.documents], overrides)
      .map((d) => (versions[d.id] ? { ...d, versions: versions[d.id]! } : d))
      .sort((a, b) => b.date.localeCompare(a.date));
    const visible = __DEMO__ ? list : list;
    return includeAll ? visible : visible.filter((d) => d.editorial.status === 'publicado');
  }, [overrides, extra, versions, includeAll]);
}

export function useEvents(includeArchived = false): CampusEvent[] {
  const overrides = useDemo((s) => s.eventOverrides);
  const statusOverrides = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraEvents);
  return useMemo(() => {
    const list = withStatus([...extra, ...seed.events], statusOverrides).map((e) => ({ ...e, ...overrides[e.id] }));
    return list.filter((e) => e.editorial.status === 'publicado' || (includeArchived && e.editorial.status === 'archivado'));
  }, [overrides, statusOverrides, extra, includeArchived]);
}

export const readings = seed.readings;
export const holidays = seed.holidays;
export const assessments = seed.assessments;
export const assignments = seed.assignments;

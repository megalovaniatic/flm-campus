/**
 * Vista unificada del contenido: combina el contenido semilla con los cambios
 * hechos en la demo (lo publicado desde Gestión, las revisiones publicadas y los estados editoriales).
 */
import { useMemo } from 'react';
import {
  type AreaId,
  type CampusEvent,
  type EditorialStatus,
  type Formation,
  type LibraryDocument,
  type NewClient,
  type NewsItem,
  type Person,
  type SectorAssessment,
  type Welcome,
  type Role,
  can,
  formationStatus,
  type Permission,
  bylineFor,
  type Byline,
  type SignedContent,
} from '@flm/shared';
import { seed } from '@flm/content';
import { useDemo } from './store';

export const DEMO_USER_ID = 'p-judith-calet';

/**
 * Personas que siguen en el campus: la semilla con los cambios de la demo, sin los perfiles
 * eliminados. Las fichas que anonimizó la antigua «Eliminar datos personales» (correo
 * @anonimizada.invalid, en navegadores con datos anteriores) cuentan también como perfiles eliminados.
 */
export function visiblePeople(people: readonly Person[], overrides: Record<string, Partial<Person>>, removed: Record<string, string>): Person[] {
  return people.flatMap((p) => {
    if (removed[p.id]) return [];
    const merged = { ...p, ...overrides[p.id] };
    return merged.email.endsWith('@anonimizada.invalid') ? [] : [merged];
  });
}

/** Personas del campus. Sin los perfiles eliminados: desaparecen de listas, informes, buscadores, bienvenidas y firmas. */
export function usePeople(): Person[] {
  const overrides = useDemo((s) => s.peopleOverrides);
  const removed = useDemo((s) => s.removedPeople);
  return useMemo(() => visiblePeople(seed.people, overrides, removed), [overrides, removed]);
}

/**
 * Firma de un contenido: su persona autora o, si no tiene autoría, no existe o su perfil se ha
 * eliminado, la firma neutra («Área Fiscal de FLM» en formaciones y tests; «FLM» en lo demás).
 */
export function useByline(authorId: string | undefined, content: SignedContent): Byline<Person> {
  const people = usePeople();
  const { type, area } = content;
  return useMemo(() => bylineFor(authorId, people, { type, area }), [authorId, people, type, area]);
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

/**
 * Contenido vigente de un tipo: lo publicado desde Gestión (`extra`) y la semilla, con las revisiones
 * publicadas aplicadas (`overrides`: la versión nueva sustituye a la anterior con el mismo id) y los
 * cambios de estado editorial. Un id repetido en `extra` y en la semilla cuenta una sola vez.
 */
export function mergeContent<T extends { id: string; editorial: { status: EditorialStatus } }>(
  extra: readonly T[],
  base: readonly T[],
  overrides: Readonly<Record<string, unknown>>,
  statuses: Record<string, EditorialStatus>,
): T[] {
  const seen = new Set<string>();
  const list: T[] = [];
  for (const item of [...extra, ...base]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const current = (overrides[item.id] as T | undefined) ?? item;
    // La revisión publicada conserva el estado del original (publicado o archivado).
    list.push(current === item ? item : { ...current, editorial: { ...current.editorial, status: item.editorial.status } });
  }
  return withStatus(list, statuses);
}

export function useFormations(includeAll = false): Formation[] {
  const statuses = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraFormations);
  const overrides = useDemo((s) => s.contentOverrides);
  return useMemo(() => {
    const list = mergeContent(extra, seed.formations, overrides, statuses);
    return includeAll ? list : list.filter((f) => f.editorial.status === 'publicado');
  }, [extra, overrides, statuses, includeAll]);
}

/**
 * Evaluaciones del área con las revisiones publicadas desde Gestión. No llevan estado editorial propio:
 * están publicadas salvo que administración las archive (`statuses`, como en la API). En el campus cuenta
 * una por área, la vigente: la más reciente sin archivar. Con `includeArchived` (Gestión) salen todas.
 */
export function pickAssessments(
  extra: readonly SectorAssessment[],
  base: readonly SectorAssessment[],
  overrides: Readonly<Record<string, unknown>>,
  statuses: Record<string, EditorialStatus>,
  includeArchived = false,
): SectorAssessment[] {
  const seen = new Set<string>();
  const areas = new Set<string>();
  const list: SectorAssessment[] = [];
  for (const a of [...extra, ...base]) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    const current = (overrides[a.id] as SectorAssessment | undefined) ?? a;
    if (!includeArchived && (statuses[a.id] === 'archivado' || areas.has(current.area))) continue;
    areas.add(current.area);
    list.push(current);
  }
  return list;
}

/** Evaluaciones del área («Pon a prueba tus conocimientos»): la vigente de cada área o, en Gestión, todas. */
export function useAssessments(includeArchived = false): SectorAssessment[] {
  const extra = useDemo((s) => s.extraAssessments);
  const overrides = useDemo((s) => s.contentOverrides);
  const statuses = useDemo((s) => s.statusOverrides);
  return useMemo(() => pickAssessments(extra, seed.assessments, overrides, statuses, includeArchived), [extra, overrides, statuses, includeArchived]);
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
  const statuses = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraNews);
  const overrides = useDemo((s) => s.contentOverrides);
  return useMemo(() => {
    const list = mergeContent(extra, seed.news, overrides, statuses).sort((a, b) => b.date.localeCompare(a.date));
    return includeAll ? list : list.filter((n) => n.editorial.status === 'publicado');
  }, [statuses, extra, overrides, includeAll]);
}

export function useDocuments(includeAll = false): LibraryDocument[] {
  const statuses = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraDocuments);
  const overrides = useDemo((s) => s.contentOverrides);
  const versions = useDemo((s) => s.documentVersions);
  return useMemo(() => {
    const list = mergeContent(extra, seed.documents, overrides, statuses)
      .map((d) => (versions[d.id] ? { ...d, versions: versions[d.id]! } : d))
      .sort((a, b) => b.date.localeCompare(a.date));
    return includeAll ? list : list.filter((d) => d.editorial.status === 'publicado');
  }, [statuses, extra, overrides, versions, includeAll]);
}

export function useEvents(includeArchived = false): CampusEvent[] {
  const eventOverrides = useDemo((s) => s.eventOverrides);
  const statuses = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraEvents);
  const overrides = useDemo((s) => s.contentOverrides);
  return useMemo(() => {
    const list = mergeContent(extra, seed.events, overrides, statuses).map((e) => ({ ...e, ...eventOverrides[e.id] }));
    return list.filter((e) => e.editorial.status === 'publicado' || (includeArchived && e.editorial.status === 'archivado'));
  }, [eventOverrides, statuses, extra, overrides, includeArchived]);
}

/** Nuevos clientes publicados (desde Gestión y los de ejemplo), del más reciente al más antiguo. */
export function useClients(includeAll = false): NewClient[] {
  const statuses = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraClients);
  const overrides = useDemo((s) => s.contentOverrides);
  return useMemo(() => {
    const list = mergeContent(extra, seed.clients, overrides, statuses).sort((a, b) => b.date.localeCompare(a.date));
    return includeAll ? list : list.filter((c) => c.editorial.status === 'publicado');
  }, [statuses, extra, overrides, includeAll]);
}

/** Bienvenidas publicadas a personas que siguen en el equipo, de la más reciente a la más antigua. */
export function useWelcomes(includeAll = false): (Welcome & { person: Person })[] {
  const statuses = useDemo((s) => s.statusOverrides);
  const extra = useDemo((s) => s.extraWelcomes);
  const overrides = useDemo((s) => s.contentOverrides);
  const people = usePeople();
  return useMemo(() => {
    const byId = new Map(people.map((p) => [p.id, p]));
    return mergeContent(extra, seed.welcomes, overrides, statuses)
      .filter((w) => includeAll || w.editorial.status === 'publicado')
      .flatMap((w) => {
        const person = byId.get(w.personId);
        return person && person.status === 'activa' ? [{ ...w, person }] : [];
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [statuses, extra, overrides, people, includeAll]);
}

export const readings = seed.readings;
export const holidays = seed.holidays;

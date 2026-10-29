import { monthName } from '@flm/shared';
import { capitalize } from './labels';

export interface MonthGroup<T> {
  /** «2026-10» */
  key: string;
  /** «Octubre de 2026» */
  title: string;
  items: T[];
}

/** Agrupa por mes una lista ya ordenada por fecha (más reciente primero). */
export function groupByMonth<T>(items: T[], dateOf: (item: T) => string): MonthGroup<T>[] {
  const groups: MonthGroup<T>[] = [];
  for (const item of items) {
    const key = dateOf(item).slice(0, 7);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      const [y, m] = key.split('-').map(Number) as [number, number];
      group = { key, title: `${capitalize(monthName(m))} de ${y}`, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

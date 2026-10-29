import { describe, expect, it } from 'vitest';
import { migrateDemo } from './store';

describe('estado guardado de la demo', () => {
  it('al pasar a la versión 2 borra cumpleaños, fechas de incorporación y aniversarios, y conserva el progreso', () => {
    const record = (id: string, action: string) => ({ id, at: '2026-10-28T10:00:00.000Z', actorId: 'p-judith-calet', action, entity: 'persona', entityId: 'p-judith-calet' });
    const v1 = {
      progress: { 'fis-01': { formationId: 'fis-01', readAt: '2026-10-28T10:00:00.000Z', readVersion: 1, attempts: [] } },
      peopleOverrides: { 'p-judith-calet': { birthday: '03-14', showBirthday: true }, 'p-sara-lopez': { role: 'autor', startDate: '', birthday: '', showBirthday: false } },
      audit: [record('1', 'perfil.cumpleanos'), record('2', 'persona.rol')],
      celebrated: ['trayectoria-1', 'area-fiscal'],
      theme: 'oscuro',
    };
    const v2 = migrateDemo(v1, 1);
    expect(v2.progress).toEqual(v1.progress);
    expect(v2.peopleOverrides).toEqual({ 'p-sara-lopez': { role: 'autor' } });
    expect(v2.audit.map((r) => r.id)).toEqual(['2']);
    expect(v2.celebrated).toEqual(['area-fiscal']);
    expect(v2.theme).toBe('oscuro');
  });

  it('no toca lo guardado con la versión actual', () => {
    const v2 = { peopleOverrides: { 'p-sara-lopez': { role: 'autor' as const } }, celebrated: ['area-fiscal'] };
    expect(migrateDemo(v2, 2)).toBe(v2);
  });
});

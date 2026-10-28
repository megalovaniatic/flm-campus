import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { can } from '@flm/shared';

describe('humo', () => {
  it('node:sqlite y @flm/shared funcionan en Vitest', () => {
    const db = new DatabaseSync(':memory:');
    db.exec('CREATE TABLE t (v TEXT)');
    db.prepare('INSERT INTO t (v) VALUES (?)').run('hola');
    expect(db.prepare('SELECT v FROM t').get()).toMatchObject({ v: 'hola' });
    expect(can('admin', 'informes:ver')).toBe(true);
  });
});

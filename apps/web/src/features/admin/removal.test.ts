import { describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import type { DraftRecord } from '@/data/store';
import { formationToForm } from '@/features/manage/forms';
import { contentRows, draftRow } from '@/features/manage/model';
import { confirmsRemoval, removalAuditDetail, removalImpact, type RemovalRow } from './removal';
import { buildReport, errorsFor } from './reportData';

const reference = { fiscal: 'p-x', laboral: 'p-cristina-sebastian', mercantil: 'p-joan-navarro', contable: 'p-judith-calet' };

const rows: RemovalRow[] = [
  { type: 'formacion', status: 'publicado', area: 'fiscal', ownerId: 'p-x' },
  { type: 'formacion', status: 'archivado', area: 'fiscal', ownerId: 'p-x' },
  { type: 'formacion', status: 'publicado', area: 'laboral', ownerId: 'p-x' },
  { type: 'noticia', status: 'publicado', area: 'fiscal', ownerId: 'p-x' },
  { type: 'documento', status: 'publicado', area: 'general', ownerId: 'p-x' },
  { type: 'noticia', status: 'borrador', area: 'fiscal', ownerId: 'p-x' },
  // Revisión pendiente de una formación publicada: cuenta como borrador, no como contenido.
  { type: 'formacion', status: 'borrador', area: 'fiscal', ownerId: 'p-x', revisionOf: 'fis-01' },
  { type: 'evento', status: 'publicado', area: null, ownerId: 'p-otra' },
  { type: 'comunicado', status: 'publicado', area: null },
  // Bienvenidas de «Ponte al día»: la dedicada a p-x se retira con su perfil; la de otra persona, no.
  { type: 'bienvenida', status: 'publicado', area: null, ownerId: 'p-laura-gil', personId: 'p-x' },
  { type: 'bienvenida', status: 'publicado', area: null, ownerId: 'p-laura-gil', personId: 'p-otra' },
];

describe('qué cambia al eliminar un perfil', () => {
  const impact = removalImpact('p-x', rows, reference);

  it('agrupa lo publicado y lo archivado por la firma neutra que llevará', () => {
    expect(impact.kept).toEqual([
      { signature: 'Área Fiscal de FLM', text: '2 formaciones' },
      { signature: 'Área Laboral de FLM', text: '1 formación' },
      { signature: 'FLM', text: '1 noticia y 1 documento' },
    ]);
    expect(impact.keptTotal).toBe(5);
  });

  it('cuenta borradores y revisiones pendientes, bienvenidas y áreas de referencia', () => {
    expect(impact).toMatchObject({ drafts: 2, welcomes: 1, referenceAreas: ['fiscal'] });
    expect(removalImpact('p-sin-nada', rows, reference)).toEqual({ kept: [], keptTotal: 0, drafts: 0, welcomes: 0, referenceAreas: [] });
  });

  it('el detalle de la auditoría solo lleva recuentos, sin datos de la persona', () => {
    expect(removalAuditDetail(impact)).toBe('Contenidos publicados o archivados sin autoría: 5 · borradores sin autoría: 2 · bienvenidas retiradas: 1. Sesiones cerradas.');
  });

  it('los cambios sin publicar cuentan para quien firma el contenido, no para quien los empezó', () => {
    const f = seed.formations.find((x) => x.editorial.authorId === 'p-judith-calet')!;
    // Ángel empieza, con la vista de administración, cambios en la formación de Judith.
    const record: DraftRecord = {
      id: `rev-${f.id}`,
      type: 'formacion',
      title: f.title,
      status: 'borrador',
      authorId: 'p-angel-ceniceros',
      updatedAt: '2026-10-29T10:00:00.000Z',
      revision: 1,
      data: { schema: 2, sourceId: f.id, form: formationToForm(f) },
    };
    const drafts = { [record.id]: record };
    const all = contentRows({ formations: seed.formations, assessments: seed.assessments, statuses: {}, news: seed.news, documents: seed.documents, events: seed.events, clients: seed.clients, welcomes: seed.welcomes, drafts, removed: {}, people: seed.people });
    expect(all.find((r) => r.id === record.id)).toMatchObject({ authorId: 'p-angel-ceniceros', ownerId: 'p-judith-calet' });
    const before = removalImpact('p-judith-calet', all.filter((r) => r.id !== record.id), reference);
    expect(removalImpact('p-judith-calet', all, reference).drafts).toBe(before.drafts + 1);
    expect(removalImpact('p-angel-ceniceros', all, reference).drafts).toBe(removalImpact('p-angel-ceniceros', all.filter((r) => r.id !== record.id), reference).drafts);
  });
});

describe('bienvenidas que se retiran con el perfil', () => {
  /** Fila de Gestión de un borrador de bienvenida (o de los cambios sin publicar de una publicada). */
  const welcomeDraft = (id: string, personId: string, authorId: string, sourceId?: string) => {
    const record: DraftRecord = {
      id,
      type: 'bienvenida',
      title: 'Bienvenida',
      status: 'borrador',
      authorId,
      updatedAt: '2026-10-29T10:00:00.000Z',
      revision: 1,
      data: { schema: 2, form: { type: 'bienvenida', personId, date: '2026-10-29', message: 'Se suma al Área Fiscal en Vic.', confirmed: true }, ...(sourceId ? { sourceId } : {}) },
    };
    return draftRow(record, { [id]: record })!;
  };

  it('cuenta la bienvenida en borrador, aunque aún no se vea en «Ponte al día»', () => {
    expect(removalImpact('p-irene-castro', [welcomeDraft('bor-bv', 'p-irene-castro', 'p-judith-calet')], reference)).toMatchObject({ welcomes: 1, keptTotal: 0, drafts: 0 });
  });

  it('cuenta la publicada aunque la cuenta ya esté desactivada (Gestión la sigue mostrando), una sola vez con sus cambios sin publicar', () => {
    const published: RemovalRow = { type: 'bienvenida', status: 'publicado', area: null, ownerId: 'p-laura-gil', personId: 'p-pau-camps' };
    const revision = welcomeDraft('rev-bv-pau-camps', 'p-pau-camps', 'p-laura-gil', 'bv-pau-camps');
    expect(revision).toMatchObject({ personId: 'p-pau-camps', revisionOf: 'bv-pau-camps' });
    expect(removalImpact('p-pau-camps', [published, revision], reference).welcomes).toBe(1);
  });

  it('no cuentan como contenido que se conserva, aunque las haya escrito ella; las que escribió para otra persona, sí', () => {
    const own: RemovalRow[] = [
      { type: 'bienvenida', status: 'publicado', area: null, ownerId: 'p-x', personId: 'p-x' },
      welcomeDraft('bor-bv-x', 'p-x', 'p-x'),
      { type: 'bienvenida', status: 'publicado', area: null, ownerId: 'p-x', personId: 'p-otra' },
    ];
    expect(removalImpact('p-x', own, reference)).toMatchObject({ kept: [{ signature: 'FLM', text: '1 bienvenida' }], keptTotal: 1, drafts: 0, welcomes: 2 });
  });
});

describe('confirmación de «Eliminar el perfil»', () => {
  const person = seed.people.find((p) => p.fictional && p.status === 'activa')!;

  it('es su correo, como en la API: sin distinguir mayúsculas ni contar los espacios de los extremos', () => {
    expect(confirmsRemoval(person.email, person.email)).toBe(true);
    expect(confirmsRemoval(`  ${person.email.toUpperCase()} `, person.email)).toBe(true);
  });

  it('no vale su nombre, ni parte del correo, ni dejarlo vacío', () => {
    expect(confirmsRemoval(person.name, person.email)).toBe(false);
    expect(confirmsRemoval(person.email.split('@')[0]!, person.email)).toBe(false);
    expect(confirmsRemoval(' ', person.email)).toBe(false);
    expect(confirmsRemoval('', '')).toBe(false);
  });
});

describe('informes tras eliminar un perfil', () => {
  const now = new Date('2026-10-29T10:00:00.000Z');
  const target = seed.people.find((p) => p.fictional && p.status === 'activa')!;
  const before = buildReport({ people: seed.people, formations: seed.formations, demoUserId: 'p-judith-calet', progress: {}, now });
  const after = buildReport({ people: seed.people.filter((p) => p.id !== target.id), formations: seed.formations, demoUserId: 'p-judith-calet', progress: {}, now });

  it('la persona deja de contar en la participación', () => {
    expect(after.people).toBe(before.people - 1);
    expect(after.rows.some((r) => r.personId === target.id)).toBe(false);
  });

  it('sus intentos siguen en los errores frecuentes como agregados anónimos, sin su id', () => {
    for (const f of seed.formations) {
      expect(errorsFor(after, f).attempts, f.id).toBe(errorsFor(before, f).attempts);
      expect(errorsFor(after, f).questions, f.id).toEqual(errorsFor(before, f).questions);
    }
    const anonymous = Object.values(after.anonymousAttempts).flat();
    expect(anonymous.length).toBeGreaterThan(0);
    expect(anonymous.every((a) => !a.id.includes(target.id))).toBe(true);
  });

  it('sin bajas no hay intentos anónimos', () => {
    expect(Object.values(before.anonymousAttempts).flat()).toEqual([]);
  });
});

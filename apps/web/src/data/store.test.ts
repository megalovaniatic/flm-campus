import { beforeEach, describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import { runToastAction, useToasts } from '@/design/Toast';
import { announce, applyTransition } from '@/features/manage/actions';
import { formationToForm, newsToForm } from '@/features/manage/forms';
import { draftRow, readDraft, type Actor } from '@/features/manage/model';
import { resetDemo } from '@/layout/DemoBand';
import { mergeContent } from './selectors';
import { DEMO_VERSION, migrateDemo, useDemo } from './store';

const AT = '2026-10-28T10:00:00.000Z';
const LATER = '2026-10-28T12:00:00.000Z';

const admin: Actor = { id: 'p-admin', email: 'p-admin@flmexperts.com', name: 'Ana Admin', position: 'Asesoría', department: 'Fiscal', office: 'Barcelona', role: 'admin', status: 'activa', effectiveRole: 'admin' };

/** Pregunta y test final tal como los guardaba el editor anterior (plantilla «Test» enlazada a una formación). */
const question = (prompt = '¿Pregunta?') => ({ id: 'p1', prompt, options: [{ id: 'a', text: 'Sí', feedback: '' }, { id: 'b', text: 'No', feedback: 'Porque no.' }, { id: 'c', text: 'Quizá', feedback: 'Tampoco.' }], correctOptionId: 'a', explanation: 'Porque sí.', ref: 'Apartado 1' });
const legacyTest = (id: string, formationId: string, extra: Record<string, unknown> = {}, questions = [question()]) => ({ id, type: 'test', title: 'Test final', status: 'borrador', authorId: 'p-judith-calet', updatedAt: AT, revision: 1, data: { schema: 1, form: { type: 'test', formationId, title: 'Test final', questions } }, ...extra });
const formationDraft = (id: string, title: string, status: string, extra: Record<string, unknown> = {}, data: Record<string, unknown> = {}) => ({ id, type: 'formacion', title, status, authorId: 'p-judith-calet', updatedAt: AT, revision: 1, data: { schema: 1, form: { type: 'formacion', area: 'fiscal', title }, ...data }, ...extra });
/** Pregunta en blanco con la que se completa un test migrado. */
const blank = (id: string) => ({ id, prompt: '', options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }], correctOptionId: '', explanation: '' });

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
    const v3 = { peopleOverrides: { 'p-sara-lopez': { role: 'autor' as const } }, celebrated: ['area-fiscal'] };
    expect(DEMO_VERSION).toBe(3);
    expect(migrateDemo(v3, 3)).toBe(v3);
  });

  it('al pasar a la versión 3 lo «en revisión» vuelve a borrador, sin comentarios de devolución y sin perder nada', () => {
    const at = '2026-10-28T10:00:00.000Z';
    const noticia = { type: 'noticia', headline: 'Aviso', area: 'fiscal' };
    const v2 = {
      progress: { 'fis-01': { formationId: 'fis-01', readAt: at, readVersion: 1, attempts: [] } },
      drafts: {
        'bor-1': { id: 'bor-1', type: 'noticia', title: 'Aviso', status: 'en-revision', authorId: 'p-judith-calet', updatedAt: at, revision: 3, data: { schema: 1, form: noticia } },
        'bor-2': { id: 'bor-2', type: 'noticia', title: 'Devuelto', status: 'borrador', authorId: 'p-judith-calet', updatedAt: at, revision: 2, returnComment: 'Falta la fuente', data: { schema: 1, form: noticia } },
      },
      statusOverrides: { 'bor-9': 'en-revision', 'not-01': 'archivado' },
    };
    const v3 = migrateDemo(v2, 2);
    expect(v3.progress).toEqual(v2.progress);
    expect(v3.drafts['bor-1']).toMatchObject({ status: 'borrador', revision: 3, data: { schema: 1, form: noticia } });
    expect(v3.drafts['bor-2']).toMatchObject({ status: 'borrador', title: 'Devuelto' });
    expect(Object.values(v3.drafts).some((d) => 'returnComment' in d)).toBe(false);
    // «En revisión» como cambio de estado solo lo dejaba «Deshacer»: se retira (ver la prueba de los restos de «Deshacer»).
    expect(v3.statusOverrides).toEqual({ 'not-01': 'archivado' });
  });

  it('al pasar a la versión 3 cada test final del editor anterior pasa a su formación', () => {
    const v2 = {
      drafts: {
        'bor-f': formationDraft('bor-f', 'Mi formación', 'borrador', { revision: 4 }),
        'bor-t1': legacyTest('bor-t1', 'bor-f'),
        'bor-t2': legacyTest('bor-t2', 'fis-01'),
        'bor-t3': legacyTest('bor-t3', ''),
      },
    };
    const { drafts } = migrateDemo(v2, 2);
    expect(Object.keys(drafts).sort()).toEqual(['bor-f', 'bor-t3', 'rev-fis-01']);
    // Las 3 preguntas del test final: la del test antiguo y dos en blanco para completarlo.
    const quiz = { id: 'quiz-bor-f', title: 'Test final', passMark: 2, questions: [{ ...question(), options: [{ id: 'a', text: 'Sí' }, { id: 'b', text: 'No', feedback: 'Porque no.' }, { id: 'c', text: 'Quizá', feedback: 'Tampoco.' }] }, blank('p-2'), blank('p-3')] };
    expect(drafts['bor-f']!.data).toMatchObject({ form: { type: 'formacion', title: 'Mi formación', quiz } });
    expect(drafts['rev-fis-01']).toMatchObject({ type: 'formacion', status: 'borrador', data: { sourceId: 'fis-01', form: null, pendingQuiz: { ...quiz, id: 'quiz-fis-01' } } });
    expect(drafts['bor-t3']).toMatchObject({ type: 'formacion', data: { form: { type: 'formacion', quiz: { ...quiz, id: 'quiz-sin-formacion' } } } });
  });

  it('al pasar a la versión 3 el test migrado se completa hasta sus 3 preguntas, sin recortar las que sobren', () => {
    const four = ['¿Una?', '¿Dos?', '¿Tres?', '¿Cuatro?'].map((prompt, i) => ({ ...question(prompt), id: `p${i + 1}` }));
    const v2 = {
      drafts: {
        'bor-f1': formationDraft('bor-f1', 'Una pregunta', 'borrador'),
        'bor-t1': legacyTest('bor-t1', 'bor-f1'),
        'bor-f2': formationDraft('bor-f2', 'Cuatro preguntas', 'borrador'),
        'bor-t2': legacyTest('bor-t2', 'bor-f2', {}, four),
      },
    };
    const { drafts } = migrateDemo(v2, 2);
    // Se puede publicar en cuanto se completen las dos preguntas en blanco; las que sobren se quitan en el editor.
    expect(readDraft(drafts['bor-f1'])?.form).toMatchObject({ type: 'formacion', quiz: { questions: [{ id: 'p1', prompt: '¿Pregunta?' }, { id: 'p-2', prompt: '' }, { id: 'p-3', prompt: '' }] } });
    expect(readDraft(drafts['bor-f2'])?.form).toMatchObject({ type: 'formacion', quiz: { questions: four.map((q) => ({ id: q.id, prompt: q.prompt })) } });
  });

  it('al pasar a la versión 3 las formaciones publicadas o archivadas en Gestión vuelven a borrador, con su fecha, sus cambios y su test', () => {
    const v2 = {
      drafts: {
        'bor-f1': formationDraft('bor-f1', 'Publicada', 'publicado', { authorId: 'p-sara-lopez', revision: 2 }, { publishedAt: AT, reviewerName: 'Judith Calet' }),
        // Sus cambios guardados aparte, más recientes que lo publicado.
        'rev-bor-f1': formationDraft('rev-bor-f1', 'Publicada y corregida', 'en-revision', { updatedAt: LATER }, { sourceId: 'bor-f1' }),
        'bor-f2': formationDraft('bor-f2', 'Archivada', 'archivado', {}, { publishedAt: AT }),
        'bor-t1': legacyTest('bor-t1', 'bor-f1', { status: 'publicado' }),
      },
    };
    const { drafts } = migrateDemo(v2, 2);
    expect(Object.keys(drafts).sort()).toEqual(['bor-f1', 'bor-f2']);
    expect(drafts['bor-f1']).toMatchObject({ status: 'borrador', authorId: 'p-sara-lopez', updatedAt: LATER, data: { publishedAt: AT, form: { title: 'Publicada y corregida', quiz: { id: 'quiz-bor-f1' } } } });
    expect(drafts['bor-f2']).toMatchObject({ status: 'borrador', data: { publishedAt: AT } });
    // En Gestión es un borrador normal (sin «cambios sin publicar»), con el test del editor anterior dentro.
    const row = draftRow(drafts['bor-f1']!, drafts);
    expect(row).toMatchObject({ status: 'borrador', publishedAt: AT, openRevision: undefined, revisionOf: undefined });
    expect(readDraft(drafts['bor-f1'])?.form).toMatchObject({ type: 'formacion', quiz: { questions: [{ prompt: '¿Pregunta?' }, {}, {}] } });
  });

  it('al pasar a la versión 3 un test sin su formación, o el segundo para la misma, pasa a una formación nueva; sus cambios guardados mandan', () => {
    const v2 = {
      drafts: {
        // Su formación se eliminó con el editor anterior.
        'bor-t1': legacyTest('bor-t1', 'bor-borrada', { status: 'publicado', data: { schema: 1, publishedAt: AT, form: { type: 'test', formationId: 'bor-borrada', title: 'Test huérfano', questions: [question()] } } }),
        // Dos tests para la misma formación de la semilla: el más reciente va a la formación.
        'bor-t2': legacyTest('bor-t2', 'fis-01', { updatedAt: LATER }, [question('¿La más reciente?')]),
        'bor-t3': legacyTest('bor-t3', 'fis-01', {}, [question('¿La anterior?')]),
        // Test publicado con cambios guardados aparte («rev-<id>»): pasa a su formación con los cambios.
        'bor-f': formationDraft('bor-f', 'Mi formación', 'borrador'),
        'bor-t4': legacyTest('bor-t4', 'bor-f', { status: 'publicado' }, [question('¿Publicada?')]),
        'rev-bor-t4': legacyTest('rev-bor-t4', 'bor-f', { updatedAt: LATER, data: { schema: 1, sourceId: 'bor-t4', form: { type: 'test', formationId: 'bor-f', title: 'Test final', questions: [question('¿Corregida?')] } } }),
      },
    };
    const { drafts } = migrateDemo(v2, 2);
    expect(Object.keys(drafts).sort()).toEqual(['bor-f', 'bor-t1', 'bor-t3', 'rev-fis-01']);
    expect(drafts['bor-t1']).toMatchObject({ type: 'formacion', status: 'borrador', title: 'Test final', data: { form: { type: 'formacion', quiz: { id: 'quiz-sin-formacion', title: 'Test huérfano' } } } });
    expect(drafts['bor-t1']!.data.publishedAt).toBeUndefined();
    expect(drafts['rev-fis-01']).toMatchObject({ data: { sourceId: 'fis-01', pendingQuiz: { questions: [{ prompt: '¿La más reciente?' }, {}, {}] } } });
    expect(drafts['bor-t3']).toMatchObject({ type: 'formacion', status: 'borrador', data: { form: { quiz: { questions: [{ prompt: '¿La anterior?' }, {}, {}] } } } });
    expect(drafts['bor-f']).toMatchObject({ data: { form: { quiz: { questions: [{ prompt: '¿Corregida?' }, {}, {}] } } } });
  });

  it('al pasar a la versión 3 se retiran los restos de «Deshacer» de las listas publicadas', () => {
    const [news] = seed.news;
    const [event] = seed.events;
    const [doc] = seed.documents;
    const v2 = {
      drafts: { 'bor-n1': { id: 'bor-n1', type: 'noticia', title: 'Aviso', status: 'en-revision', authorId: 'p-judith-calet', updatedAt: AT, revision: 2, data: { schema: 1, form: { type: 'noticia', headline: 'Aviso', area: 'fiscal' } } } },
      // Publicado y deshecho (con su borrador o sin él), y publicado dos veces: cuenta el primero.
      extraNews: [{ ...news!, id: 'bor-n2', slug: 'otra-2' }, { ...news!, id: 'bor-n1', slug: 'aviso' }, { ...news!, id: 'bor-n2', slug: 'otra' }],
      extraEvents: [{ ...event!, id: 'bor-e1', slug: 'evento' }],
      extraDocuments: [{ ...doc!, id: 'bor-d1' }],
      statusOverrides: { 'bor-n1': 'en-revision', 'bor-e1': 'borrador', 'bor-d1': 'borrador', 'bor-n2': 'publicado', [news!.id]: 'archivado' },
      eventOverrides: { 'bor-e1': { manualPhase: 'proximo' }, [event!.id]: { archived: true } },
      documentVersions: { 'bor-d1': doc!.versions, [doc!.id]: doc!.versions },
    };
    const v3 = migrateDemo(v2, 2);
    expect(v3.extraNews.map((n) => [n.id, n.slug])).toEqual([['bor-n2', 'otra-2']]);
    expect(v3.extraEvents).toEqual([]);
    expect(v3.extraDocuments).toEqual([]);
    expect(v3.statusOverrides).toEqual({ 'bor-n2': 'publicado', [news!.id]: 'archivado' });
    expect(v3.eventOverrides).toEqual({ [event!.id]: { archived: true } });
    expect(Object.keys(v3.documentVersions)).toEqual([doc!.id]);
    expect(v3.drafts['bor-n1']).toMatchObject({ status: 'borrador' });
  });

  it('al pasar a la versión 3 las fichas anonimizadas con «Eliminar datos personales» pasan a perfiles eliminados', () => {
    const anonymized = (id: string) => ({ name: 'Persona eliminada', email: `eliminada-${id}@anonimizada.invalid`, position: '', photo: '', publicSource: '', status: 'inactiva' });
    const v2 = {
      peopleOverrides: { 'p-pau-camps': anonymized('p-pau-camps'), 'p-noelia-fuentes': anonymized('p-noelia-fuentes'), 'p-sara-lopez': { role: 'autor' } },
      revokedSessions: { 'p-pau-camps': AT, 'p-sara-lopez': AT },
      audit: [
        { id: '2', at: LATER, actorId: 'p-judith-calet', action: 'persona.rol', entity: 'persona', entityId: 'p-pau-camps' },
        { id: '1', at: AT, actorId: 'p-judith-calet', action: 'persona.eliminar-datos', entity: 'persona', entityId: 'p-pau-camps' },
      ],
    };
    const v3 = migrateDemo(v2, 2);
    expect(v3.removedPeople['p-pau-camps']).toBe(AT);
    expect(v3.removedPeople['p-noelia-fuentes']).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(v3.peopleOverrides).toEqual({ 'p-sara-lopez': { role: 'autor' } });
    expect(v3.revokedSessions).toEqual({ 'p-sara-lopez': AT });
    expect(v3.audit).toEqual(v2.audit);
  });
});

describe('lo migrado sigue el flujo actual', () => {
  beforeEach(() => useDemo.getState().reset());

  it('una formación «publicada» con el editor anterior llega ahora a Aprender, con su fecha de publicación', () => {
    const form = { ...formationToForm(seed.formations[0]!), slug: undefined, title: 'Recargos desde Gestión' };
    useDemo.setState(migrateDemo({ drafts: { 'bor-f3': formationDraft('bor-f3', form.title, 'publicado', {}, { form, publishedAt: AT }) } }, 2));
    const row = draftRow(useDemo.getState().drafts['bor-f3']!, useDemo.getState().drafts)!;
    expect(row.status).toBe('borrador');
    expect(applyTransition(admin, row, 'publicar')).toMatchObject({ ok: true, href: '/aprender/fiscal/recargos-desde-gestion' });
    const s = useDemo.getState();
    const published = mergeContent(s.extraFormations, seed.formations, s.contentOverrides, s.statusOverrides).find((f) => f.id === 'bor-f3');
    expect(published?.editorial).toMatchObject({ status: 'publicado', publishedAt: AT });
  });

  it('una noticia que se publicó y se deshizo vuelve a publicarse con su dirección, sin «-2»', () => {
    const [news] = seed.news;
    const form = { ...newsToForm(news!), headline: 'Aviso de prueba' };
    const v2 = {
      drafts: { 'bor-n1': { id: 'bor-n1', type: 'noticia', title: form.headline, status: 'en-revision', authorId: admin.id, updatedAt: AT, revision: 2, data: { schema: 1, form } } },
      extraNews: [{ ...news!, id: 'bor-n1', slug: 'aviso-de-prueba', headline: form.headline }],
      statusOverrides: { 'bor-n1': 'en-revision' },
    };
    useDemo.setState(migrateDemo(v2, 2));
    const row = draftRow(useDemo.getState().drafts['bor-n1']!, useDemo.getState().drafts)!;
    expect(applyTransition(admin, row, 'publicar')).toMatchObject({ ok: true, href: '/consultar/actualidad/aviso-de-prueba' });
  });
});

describe('«Restablecer» la demo', () => {
  beforeEach(() => {
    useDemo.getState().reset();
    useToasts.getState().clear();
  });

  it('cierra los avisos abiertos: su «Deshacer» ya no puede devolver lo borrado', () => {
    const form = { ...newsToForm(seed.news[0]!), headline: 'Aviso para deshacer' };
    useDemo.getState().saveDraft({ id: 'bor-n2', type: 'noticia', title: form.headline, status: 'borrador', authorId: admin.id, updatedAt: AT, revision: 1, data: { schema: 2, form } });
    const row = draftRow(useDemo.getState().drafts['bor-n2']!, useDemo.getState().drafts)!;
    announce(row, 'publicar', applyTransition(admin, row, 'publicar'));
    expect(useToasts.getState().items.map((t) => t.action?.label)).toContain('Deshacer');

    const shown = useToasts.getState().items.find((t) => t.action?.label === 'Deshacer')!;
    resetDemo();
    expect(useToasts.getState().items).toEqual([]);
    expect(useDemo.getState().drafts).toEqual({});
    expect(useDemo.getState().extraNews).toEqual([]);
    // El aviso aún se ve mientras se desvanece: pulsar «Deshacer» entonces no hace nada.
    expect(runToastAction(shown)).toBe(false);
    expect(useDemo.getState().drafts).toEqual({});
  });
});

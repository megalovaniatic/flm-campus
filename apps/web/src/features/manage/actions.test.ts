import { beforeEach, describe, expect, it } from 'vitest';
import { seed } from '@flm/content';
import { assessmentClashReason, type AreaId, type EditorialStatus, type Formation, type Role } from '@flm/shared';
import { mergeContent, pickAssessments, visiblePeople } from '@/data/selectors';
import { useDemo, type DraftRecord } from '@/data/store';
import { buildIndex } from '@/features/search/searchIndex';
import { applyTransition, removeWorkingDraft } from './actions';
import { assessmentToForm, documentToForm, eventToForm, formationToForm, newsToForm, type AnyForm } from './forms';
import { areaAssessmentRow, canEditRow, canSeeRow, contentRows, draftRow, isOwnRow, revisionId, rowForm, typeNotAllowed, withoutAuthor, type Actor, type ContentRow, type DraftData } from './model';

const person = (id: string, role: Role): Actor => ({
  id,
  email: `${id}@flmexperts.com`,
  name: id === 'p-admin' ? 'Ana Admin' : 'Jordi Autor',
  position: 'Asesoría',
  department: 'Fiscal',
  office: 'Barcelona',
  role,
  status: 'activa',
  effectiveRole: role,
});
const admin = person('p-admin', 'admin');
const author = person('p-autor', 'autor');
const other = person('p-otra', 'autor');

function draft(id: string, form: AnyForm, authorId: string, extra: Partial<DraftData> = {}): ContentRow {
  const record: DraftRecord = { id, type: form.type, title: 'Borrador', status: 'borrador', authorId, updatedAt: new Date().toISOString(), revision: 1, data: { schema: 2, form, ...extra } as unknown as Record<string, unknown> };
  useDemo.getState().saveDraft(record);
  return draftRow(useDemo.getState().drafts[id]!, useDemo.getState().drafts)!;
}

const merged = <T extends { id: string; editorial: { status: EditorialStatus } }>(extra: readonly T[], base: readonly T[]) => {
  const s = useDemo.getState();
  return mergeContent(extra, base, s.contentOverrides, s.statusOverrides);
};
const formations = () => merged(useDemo.getState().extraFormations, seed.formations);

/** Evaluaciones vigentes en el campus (una por área, sin las archivadas). */
const vigentes = () => {
  const s = useDemo.getState();
  return pickAssessments(s.extraAssessments, seed.assessments, s.contentOverrides, s.statusOverrides);
};

const people = () => {
  const s = useDemo.getState();
  return visiblePeople(seed.people, s.peopleOverrides, s.removedPeople);
};

/** Filas de Gestión con el estado actual de la demo (lo que calcula useContentRows). */
const rowsNow = (): ContentRow[] => {
  const s = useDemo.getState();
  return contentRows({
    formations: formations(),
    assessments: pickAssessments(s.extraAssessments, seed.assessments, s.contentOverrides, s.statusOverrides, true),
    statuses: s.statusOverrides,
    news: merged(s.extraNews, seed.news),
    documents: merged(s.extraDocuments, seed.documents),
    events: merged(s.extraEvents, seed.events),
    clients: merged(s.extraClients, seed.clients),
    welcomes: merged(s.extraWelcomes, seed.welcomes),
    drafts: s.drafts,
    removed: s.removedPeople,
    people: people(),
  });
};
const rowOf = (id: string) => rowsNow().find((r) => r.id === id)!;

/** Evaluación completa de un área: la de la semilla, con el «por qué no» de cada opción incorrecta. */
function evaluationForm(area: AreaId): AnyForm {
  const form = assessmentToForm(seed.assessments.find((a) => a.area === area)!);
  return { ...form, quiz: { ...form.quiz, id: '', questions: form.quiz.questions.map((q) => ({ ...q, options: q.options.map((o) => ({ ...o, feedback: o.feedback || 'No es la correcta.' })) })) } };
}

describe('publicar desde el creador (demo)', () => {
  beforeEach(() => {
    useDemo.getState().reset();
  });

  it('la autoría publica su formación y aparece en Aprender; «Deshacer» la retira', () => {
    const base = formationToForm(seed.formations[0]!);
    const row = draft('bor-nueva', { ...base, slug: undefined, title: 'Recargos para principiantes' }, author.id);
    expect(applyTransition(other, row, 'publicar')).toMatchObject({ ok: false, reason: 'Solo puedes publicar tus propios contenidos.' });

    const out = applyTransition(author, row, 'publicar');
    expect(out.ok).toBe(true);
    expect(out.href).toBe('/aprender/fiscal/recargos-para-principiantes');
    const published = formations().find((f) => f.id === 'bor-nueva') as Formation;
    expect(published.editorial).toMatchObject({ status: 'publicado', authorId: author.id, review: { state: 'pendiente' } });
    expect(useDemo.getState().drafts['bor-nueva']).toMatchObject({ status: 'publicado', data: { mirrored: true, publishedSlug: 'recargos-para-principiantes' } });

    out.undo?.();
    expect(formations().some((f) => f.id === 'bor-nueva')).toBe(false);
    expect(useDemo.getState().drafts['bor-nueva']?.status).toBe('borrador');
  });

  it('no publica un contenido incompleto: devuelve los errores para enlazarlos', () => {
    const row = draft('bor-vacia', { ...newsToForm(seed.news[0]!), headline: '' }, author.id);
    const out = applyTransition(author, row, 'publicar');
    expect(out.ok).toBe(false);
    expect(out.errors?.[0]?.path).toBe('headline');
  });

  it('publicar los cambios de una formación de la demo sustituye la versión vigente, con cambio importante', () => {
    const seedFormation = seed.formations[0]!;
    const form = { ...formationToForm(seedFormation), title: 'Título revisado', majorChange: true };
    const row = draft(revisionId(seedFormation.id), form, admin.id, { sourceId: seedFormation.id });
    const out = applyTransition(admin, row, 'publicar', { reviewed: true });
    expect(out.ok).toBe(true);
    const current = formations().find((f) => f.id === seedFormation.id)!;
    expect(current).toMatchObject({ title: 'Título revisado', version: seedFormation.version + 1, slug: seedFormation.slug });
    expect(current.editorial).toMatchObject({ status: 'publicado', authorId: seedFormation.editorial.authorId, review: { state: 'revisado', reviewerName: 'Ana Admin', reviewerId: admin.id } });
    expect(useDemo.getState().drafts[revisionId(seedFormation.id)]).toBeUndefined();
    out.undo?.();
    expect(formations().find((f) => f.id === seedFormation.id)?.title).toBe(seedFormation.title);
  });

  it('archivar y restaurar es de administración; los borradores publicados no se eliminan', () => {
    const f = seed.formations[1]!;
    const row: ContentRow = { key: `c:${f.id}`, id: f.id, type: 'formacion', title: f.title, area: f.area, status: 'publicado', authorId: author.id, updatedAt: '', origin: 'campus' };
    expect(applyTransition(author, row, 'archivar').ok).toBe(false);
    expect(applyTransition(admin, row, 'archivar')).toMatchObject({ ok: true, to: 'archivado' });
    expect(formations().find((x) => x.id === f.id)?.editorial.status).toBe('archivado');

    const published = draft('bor-pub', formationToForm(f), author.id, { publishedAt: '2026-10-01T10:00:00.000Z' });
    expect(removeWorkingDraft(author, { ...published, status: 'publicado' }).ok).toBe(false);
  });

  it('una bienvenida por persona: no se publica otra para quien ya la tiene', () => {
    const w = seed.welcomes[0]!;
    const row = draft('bor-bv', { type: 'bienvenida', personId: w.personId, date: '2026-10-29', message: 'Bienvenida otra vez.', confirmed: true }, author.id);
    expect(applyTransition(author, row, 'publicar')).toMatchObject({ ok: false, reason: 'Esta persona ya tiene una bienvenida. Edita la que existe en lugar de crear otra.' });
  });

  it('publicar cambios sin «Lo ha revisado el área» deja la revisión pendiente; al marcarla se guarda quién', () => {
    const documents = () => merged(useDemo.getState().extraDocuments, seed.documents);
    const doc = seed.documents.find((d) => d.editorial.review.state === 'revisado')!;
    const form = documentToForm(doc);
    expect(applyTransition(admin, draft(revisionId(doc.id), { ...form, summary: `${form.summary} Actualizado.` }, admin.id, { sourceId: doc.id }), 'publicar').ok).toBe(true);
    expect(documents().find((d) => d.id === doc.id)?.editorial.review).toEqual({ state: 'pendiente' });
    expect(applyTransition(admin, draft(revisionId(doc.id), { ...form, summary: 'Otro cambio.' }, admin.id, { sourceId: doc.id }), 'publicar', { reviewed: true }).ok).toBe(true);
    expect(documents().find((d) => d.id === doc.id)?.editorial.review).toMatchObject({ state: 'revisado', reviewerName: 'Ana Admin', reviewerId: admin.id });

    // Lo publicado desde Gestión: el borrador deja de decir quién lo revisó (vistas previas).
    const news = () => merged(useDemo.getState().extraNews, seed.news).find((n) => n.id === 'bor-not')!;
    const base = { ...newsToForm(seed.news[0]!), slug: undefined, headline: 'Novedad revisada' };
    expect(applyTransition(author, draft('bor-not', base, author.id), 'publicar', { reviewed: true }).ok).toBe(true);
    expect(news().editorial.review).toMatchObject({ state: 'revisado', reviewerName: 'Jordi Autor', reviewerId: author.id });
    expect(useDemo.getState().drafts['bor-not']?.data).toMatchObject({ reviewerName: 'Jordi Autor', reviewerId: author.id });
    expect(applyTransition(author, draft(revisionId('bor-not'), { ...base, headline: 'Novedad cambiada' }, author.id, { sourceId: 'bor-not' }), 'publicar').ok).toBe(true);
    expect(news()).toMatchObject({ headline: 'Novedad cambiada', editorial: { review: { state: 'pendiente' } } });
    expect(useDemo.getState().drafts['bor-not']?.data).not.toHaveProperty('reviewerName');
    expect(useDemo.getState().drafts['bor-not']?.data).not.toHaveProperty('reviewerId');
  });

  it('eventos y comunicados comparten direcciones: un evento nuevo no se queda con la de un comunicado', () => {
    const notice = seed.events.find((e) => e.kind === 'comunicado')!;
    const event = seed.events.find((e) => e.kind === 'evento')!;
    const row = draft('bor-ev', { ...eventToForm(event), slug: undefined, title: notice.slug.replace(/-/g, ' ') }, author.id);
    expect(applyTransition(author, row, 'publicar')).toMatchObject({ ok: true, href: `/participar/agenda/${notice.slug}-2` });
  });

  it('los cambios de algo que aún no está en el campus no se publican a ciegas', () => {
    // Formación «publicada» con el editor anterior sin llegar a Aprender (datos de v2).
    const form = { ...formationToForm(seed.formations[0]!), slug: undefined, title: 'Formación antigua' };
    useDemo.getState().saveDraft({ id: 'bor-v2', type: 'formacion', title: form.title, status: 'publicado', authorId: author.id, updatedAt: '2026-10-20T10:00:00.000Z', revision: 3, data: { schema: 1, form } });
    const row = draft(revisionId('bor-v2'), { ...form, title: 'Formación antigua, revisada' }, author.id, { sourceId: 'bor-v2' });
    expect(applyTransition(author, row, 'publicar')).toMatchObject({ ok: false, reason: 'Este contenido aún no está en el campus: publícalo primero.' });
    expect(useDemo.getState().contentOverrides).toEqual({});
  });
});

describe('propiedad y tipo en cada acción (demo)', () => {
  beforeEach(() => {
    useDemo.getState().reset();
  });

  it('los cambios guardados de algo publicado son de quien firma el contenido, no de quien los empezó', () => {
    const f = seed.formations.find((x) => x.editorial.authorId === 'p-angel-ceniceros')!;
    // Cambios empezados con la vista de administración sobre la formación de otra persona.
    const row = draft(revisionId(f.id), { ...formationToForm(f), title: 'Cambio ajeno' }, author.id, { sourceId: f.id });
    expect(applyTransition(author, row, 'publicar')).toMatchObject({ ok: false, reason: 'Solo puedes publicar tus propios contenidos.' });
    expect(removeWorkingDraft(author, row)).toMatchObject({ ok: false, reason: 'Solo puedes consultar y modificar tus propios contenidos.' });

    const listed = rowOf(row.id);
    expect(listed).toMatchObject({ authorId: author.id, ownerId: 'p-angel-ceniceros', revisionOf: f.id });
    expect([isOwnRow(author, listed), canEditRow(author, listed), canSeeRow(author, listed)]).toEqual([false, false, false]);
    expect(formations().find((x) => x.id === f.id)?.title).toBe(f.title);

    // Quien firma el contenido sí los publica, y la autoría no cambia.
    const owner = { ...author, id: 'p-angel-ceniceros' };
    expect(isOwnRow(owner, listed) && canEditRow(owner, listed)).toBe(true);
    expect(applyTransition(owner, row, 'publicar').ok).toBe(true);
    expect(formations().find((x) => x.id === f.id)).toMatchObject({ title: 'Cambio ajeno', editorial: { authorId: 'p-angel-ceniceros' } });
  });

  it('la evaluación del área es de administración en cada acción, aunque figure como propia', () => {
    // Creada con el rol de administración por quien ahora es autor.
    const row = draft('bor-eval', evaluationForm('laboral'), author.id);
    expect(applyTransition(author, row, 'publicar')).toMatchObject({ ok: false, reason: typeNotAllowed('autor', 'test') });
    expect(removeWorkingDraft(author, row)).toMatchObject({ ok: false, reason: typeNotAllowed('autor', 'test') });
    expect(canEditRow(author, row)).toBe(false);
    expect(canEditRow({ ...author, effectiveRole: 'admin' }, row)).toBe(true);
    expect(typeNotAllowed('autor', 'test')).toBe('Tu perfil (Autor) no puede modificar ni publicar evaluaciones del área.');
  });
});

describe('evaluación del área (demo)', () => {
  beforeEach(() => {
    useDemo.getState().reset();
  });

  it('archivarla la retira de verdad del campus; Gestión la ve archivada y la puede restaurar', () => {
    const fiscal = seed.assessments.find((a) => a.area === 'fiscal')!;
    expect(rowOf(fiscal.id).status).toBe('publicado');
    expect(applyTransition(admin, rowOf(fiscal.id), 'archivar')).toMatchObject({ ok: true, to: 'archivado' });
    expect(vigentes().some((a) => a.area === 'fiscal')).toBe(false);
    expect(rowOf(fiscal.id)).toMatchObject({ status: 'archivado', publicHref: undefined });
    expect(applyTransition(admin, rowOf(fiscal.id), 'restaurar')).toMatchObject({ ok: true, to: 'publicado' });
    expect(vigentes().find((a) => a.area === 'fiscal')?.id).toBe(fiscal.id);
  });

  it('una vigente por área: la nueva no tapa a la publicada y la archivada no vuelve encima de otra', () => {
    const old = seed.assessments.find((a) => a.area === 'contable')!;
    const row = draft('bor-eval2', evaluationForm('contable'), admin.id);
    expect(areaAssessmentRow(rowsNow(), 'contable', row.id)?.id).toBe(old.id);
    expect(applyTransition(admin, row, 'publicar')).toMatchObject({ ok: false, reason: 'El área Contable ya tiene su evaluación publicada. Edítala en lugar de publicar otra, o archívala antes.' });
    expect(vigentes().find((a) => a.area === 'contable')?.id).toBe(old.id);

    // Archivada la anterior, la nueva se publica y pasa a ser la vigente.
    expect(applyTransition(admin, rowOf(old.id), 'archivar').ok).toBe(true);
    expect(areaAssessmentRow(rowsNow(), 'contable', row.id)).toBeUndefined();
    expect(applyTransition(admin, row, 'publicar').ok).toBe(true);
    expect(vigentes().find((a) => a.area === 'contable')?.id).toBe('bor-eval2');
    expect(areaAssessmentRow(rowsNow(), 'contable')?.id).toBe('bor-eval2');
    expect(applyTransition(admin, rowOf(old.id), 'restaurar')).toMatchObject({ ok: false, reason: 'El área Contable ya tiene otra evaluación publicada. Archívala antes de restaurar esta.' });
  });

  it('un borrador de evaluación también ocupa el área, como en la API: la archivada no se restaura encima', () => {
    const old = seed.assessments.find((a) => a.area === 'laboral')!;
    expect(applyTransition(admin, rowOf(old.id), 'archivar').ok).toBe(true);
    const row = draft('bor-eval3', evaluationForm('laboral'), admin.id);
    expect(areaAssessmentRow(rowsNow(), 'laboral')?.id).toBe('bor-eval3');
    expect(applyTransition(admin, rowOf(old.id), 'restaurar')).toMatchObject({ ok: false, reason: assessmentClashReason('Laboral', 'borrador', 'restaurar') });
    expect(removeWorkingDraft(admin, row).ok).toBe(true);
    expect(applyTransition(admin, rowOf(old.id), 'restaurar')).toMatchObject({ ok: true, to: 'publicado' });
  });

  it('ni Gestión ni la paleta Ctrl K empiezan una evaluación sin elegir el área', () => {
    const index = buildIndex({ formations: [], news: [], documents: [], events: [], readings: [], role: 'admin' });
    expect(index.some((i) => i.href === '/gestion/nuevo/formacion')).toBe(true);
    expect(index.some((i) => i.href.startsWith('/gestion/nuevo/test'))).toBe(false);
  });
});

describe('filas de Gestión (demo)', () => {
  beforeEach(() => {
    useDemo.getState().reset();
  });

  it('la revisión que dejó la migración con el test pendiente se ve con su formación y se puede descartar', () => {
    const f = seed.formations[0]!;
    const quiz = { ...f.quiz, title: 'Test del editor anterior' };
    useDemo.getState().saveDraft({ id: revisionId(f.id), type: 'formacion', title: 'Test final', status: 'borrador', authorId: author.id, updatedAt: new Date().toISOString(), revision: 1, data: { schema: 1, sourceId: f.id, form: null, pendingQuiz: quiz } });
    const row = rowOf(revisionId(f.id));
    expect(row).toMatchObject({ title: f.title, area: f.area, status: 'borrador', revisionOf: f.id, ownerId: f.editorial.authorId });
    expect(rowOf(f.id).openRevision?.id).toBe(revisionId(f.id));
    const campus = (id: string) => {
      const item = formations().find((x) => x.id === id);
      return item ? { form: formationToForm(item) } : null;
    };
    expect(rowForm(row, campus)).toMatchObject({ type: 'formacion', title: f.title, quiz: { title: 'Test del editor anterior' } });
    expect(removeWorkingDraft(admin, row).ok).toBe(true);
    expect(useDemo.getState().drafts[revisionId(f.id)]).toBeUndefined();
  });

  it('«Sin autoría» cuenta lo mismo en el resumen de Administración que en el filtro de Gestión', () => {
    const orphan = () => rowsNow().filter((r) => withoutAuthor(r, people())).length;
    // Las evaluaciones del área no tienen autoría personal.
    expect(orphan()).toBe(seed.assessments.length);
    const his = rowsNow().filter((r) => r.ownerId === 'p-angel-ceniceros').length;
    expect(his).toBeGreaterThan(0);
    useDemo.getState().removePerson('p-angel-ceniceros');
    expect(orphan()).toBe(seed.assessments.length + his);
  });
});

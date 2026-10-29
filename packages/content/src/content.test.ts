/**
 * Validación del contenido semilla (npm run lint:content).
 * Comprueba estructura, reglas del brief y referencias cruzadas antes de compilar.
 */
import { describe, expect, it } from 'vitest';
import {
  AREA_IDS,
  assessmentSchema,
  documentSchema,
  eventSchema,
  formationSchema,
  holidaySchema,
  isValidBirthday,
  isValidDateKey,
  newClientSchema,
  newsSchema,
  personalDatesSchema,
  personSchema,
  readingSchema,
  welcomeSchema,
} from '@flm/shared';
import { seed } from './index';

const issues = (schema: { safeParse: (v: unknown) => { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } } }, items: { id?: string; date?: string }[]) =>
  items.flatMap((item) => {
    const r = schema.safeParse(item);
    return r.success ? [] : (r.error?.issues ?? []).map((i) => `${item.id ?? item.date}: ${i.path.join('.')} → ${i.message}`);
  });

describe('contenido semilla', () => {
  it('personas válidas con correo corporativo', () => {
    expect(issues(personSchema, seed.people)).toEqual([]);
    expect(new Set(seed.people.map((p) => p.id)).size).toBe(seed.people.length);
  });

  it('cumpleaños y fecha de incorporación solo los facilitados (Judith y las incorporaciones de septiembre), válidos y sin año de nacimiento; el perfil de la demo, sin foto', () => {
    // Nadie más tiene fechas inventadas: quedan «sin indicar» hasta que se completen.
    const conFechas = seed.people.filter((p) => ['birthday', 'showBirthday', 'startDate'].some((k) => k in p));
    expect(conFechas.map((p) => p.id).sort()).toEqual(['p-christopher-raudales', 'p-judith-calet', 'p-lluis-gomez']);
    expect(seed.people.filter((p) => p.birthday).map((p) => p.id)).toEqual(['p-judith-calet']);
    for (const id of ['p-lluis-gomez', 'p-christopher-raudales']) expect(seed.people.find((p) => p.id === id), id).toMatchObject({ startDate: '2026-09-01', office: 'Barcelona' });
    const judith = seed.people.find((p) => p.id === 'p-judith-calet')!;
    expect(judith).toMatchObject({ name: 'Judith Calet', birthday: '11-26', startDate: '2026-09-01' });
    expect(isValidBirthday(judith.birthday)).toBe(true);
    expect(isValidDateKey(judith.startDate)).toBe(true);
    expect(personalDatesSchema.safeParse({ birthday: judith.birthday, startDate: judith.startDate }).success).toBe(true);
    expect('showBirthday' in judith).toBe(false);
    expect(judith.photo).toBeUndefined();
  });

  it('formaciones válidas (resultados, ejemplo, test de 3 con aprobado 2)', () => {
    expect(issues(formationSchema, seed.formations)).toEqual([]);
  });

  it('al menos tres formaciones por área', () => {
    if (!seed.formations.length) return;
    for (const area of AREA_IDS) expect(seed.formations.filter((f) => f.area === area).length, area).toBeGreaterThanOrEqual(3);
  });

  it('Contabilidad: las tres de base y las de importaciones, amortizaciones, bienes de inversión y anticipos', () => {
    if (!seed.formations.length) return;
    const contable = seed.formations.filter((f) => f.area === 'contable').map((f) => `${f.id} ${f.slug}`);
    expect(contable.sort()).toEqual([
      'con-01 boicac-147',
      'con-02 devengo-y-periodificacion',
      'con-03 amortizacion-contable-y-fiscal',
      'con-04 importaciones-y-dua',
      'con-05 amortizaciones',
      'con-06 bienes-de-inversion',
      'con-07 facturas-de-anticipo',
    ]);
  });

  it('los enlaces internos del contenido llevan a páginas que existen', () => {
    const targets = new Set([
      ...seed.formations.map((f) => `/aprender/${f.area}/${f.slug}`),
      ...seed.events.map((e) => `/participar/agenda/${e.slug}`),
      ...seed.documents.map((d) => `/consultar/notas/${d.id}`),
    ]);
    const text = JSON.stringify([seed.formations, seed.news, seed.documents, seed.events, seed.welcomes]);
    const links = [...text.matchAll(/\]\(#(\/[^)\s]+)\)/g)].map((m) => m[1]!);
    expect(links.length).toBeGreaterThan(0);
    expect(links.filter((l) => !targets.has(l))).toEqual([]);
  });

  it('ids y slugs únicos', () => {
    const ids = [...seed.formations, ...seed.news, ...seed.documents, ...seed.events, ...seed.readings, ...seed.assessments, ...seed.clients, ...seed.welcomes].map((x) => x.id);
    expect(ids.length - new Set(ids).size).toBe(0);
    const slugs = seed.formations.map((f) => `${f.area}/${f.slug}`);
    expect(slugs.length - new Set(slugs).size).toBe(0);
  });

  it('autores y documentos referenciados existen', () => {
    const people = new Set(seed.people.map((p) => p.id));
    const docs = new Set(seed.documents.map((d) => d.id));
    const missing: string[] = [];
    for (const f of seed.formations) {
      if (f.editorial.authorId && !people.has(f.editorial.authorId)) missing.push(`${f.id}: autor ${f.editorial.authorId}`);
      for (const d of f.documentIds ?? []) if (!docs.has(d)) missing.push(`${f.id}: documento ${d}`);
    }
    for (const e of seed.events) for (const m of e.materials ?? []) if (!docs.has(m.documentId)) missing.push(`${e.id}: material ${m.documentId}`);
    for (const n of seed.news) if (n.editorial.authorId && !people.has(n.editorial.authorId)) missing.push(`${n.id}: autor ${n.editorial.authorId}`);
    expect(missing).toEqual([]);
  });

  it('evaluaciones sectoriales de 10 preguntas (aprobado 8)', () => {
    expect(issues(assessmentSchema, seed.assessments)).toEqual([]);
  });

  it('actualidad con los cinco bloques', () => {
    expect(issues(newsSchema, seed.news)).toEqual([]);
  });

  it('lecturas: tres por área cuando están completas', () => {
    expect(issues(readingSchema, seed.readings)).toEqual([]);
    if (!seed.readings.length) return;
    for (const area of AREA_IDS) expect(seed.readings.filter((r) => r.area === area).length, area).toBe(3);
  });

  it('documentos, eventos y festivos válidos', () => {
    expect(issues(documentSchema, seed.documents)).toEqual([]);
    expect(issues(eventSchema, seed.events)).toEqual([]);
    expect(issues(holidaySchema, seed.holidays)).toEqual([]);
  });

  it('«Ponte al día»: clientes ficticios y bienvenidas a las incorporaciones reales del 1 de septiembre', () => {
    expect(issues(newClientSchema, seed.clients)).toEqual([]);
    expect(seed.clients.every((c) => c.fictional)).toBe(true);
    expect(issues(welcomeSchema, seed.welcomes)).toEqual([]);
    // Ninguna bienvenida puede llevar la fecha de incorporación de la persona
    expect(welcomeSchema.safeParse({ ...seed.welcomes[0], startDate: '2026-10-01' }).success).toBe(false);
    // Solo personas reales, anunciadas el día en que se incorporaron (que es el de su ficha)
    const byId = new Map(seed.people.map((p) => [p.id, p]));
    expect(seed.welcomes.map((w) => w.personId)).toEqual(['p-judith-calet', 'p-lluis-gomez', 'p-christopher-raudales']);
    for (const w of seed.welcomes) {
      const person = byId.get(w.personId)!;
      expect(person.fictional, w.id).toBeUndefined();
      expect(w.date, w.id).toBe(person.startDate);
    }
  });

  it('enlaces de ejemplo identificados', () => {
    for (const e of seed.events) for (const l of e.links ?? []) if (/example|ejemplo/.test(l.url)) expect(l.example, `${e.id}: ${l.url}`).toBe(true);
  });
});

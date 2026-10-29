/**
 * Validación del contenido semilla (npm run lint:content).
 * Comprueba estructura, reglas del brief y referencias cruzadas antes de compilar.
 */
import { describe, expect, it } from 'vitest';
import { AREA_IDS, assessmentSchema, documentSchema, eventSchema, formationSchema, holidaySchema, newClientSchema, newsSchema, personSchema, readingSchema, welcomeSchema } from '@flm/shared';
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

  it('solo datos profesionales: sin cumpleaños ni fecha de incorporación, y el perfil de la demo sin foto', () => {
    const retirados = ['birthday', 'showBirthday', 'startDate'];
    expect(seed.people.filter((p) => retirados.some((k) => k in p)).map((p) => p.id)).toEqual([]);
    expect(seed.people.find((p) => p.id === 'p-judith-calet')?.photo).toBeUndefined();
  });

  it('formaciones válidas (resultados, ejemplo, test de 3 con aprobado 2)', () => {
    expect(issues(formationSchema, seed.formations)).toEqual([]);
  });

  it('tres formaciones por área cuando el contenido está completo', () => {
    if (!seed.formations.length) return;
    for (const area of AREA_IDS) expect(seed.formations.filter((f) => f.area === area).length, area).toBe(3);
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

  it('«Ponte al día»: clientes ficticios y bienvenidas a personas de la plantilla de ejemplo', () => {
    expect(issues(newClientSchema, seed.clients)).toEqual([]);
    expect(seed.clients.every((c) => c.fictional)).toBe(true);
    expect(issues(welcomeSchema, seed.welcomes)).toEqual([]);
    // Ninguna bienvenida puede llevar la fecha de incorporación de la persona
    expect(welcomeSchema.safeParse({ ...seed.welcomes[0], startDate: '2026-10-01' }).success).toBe(false);
    const fictional = new Set(seed.people.filter((p) => p.fictional).map((p) => p.id));
    expect(seed.welcomes.filter((w) => !fictional.has(w.personId)).map((w) => w.id)).toEqual([]);
  });

  it('enlaces de ejemplo identificados', () => {
    for (const e of seed.events) for (const l of e.links ?? []) if (/example|ejemplo/.test(l.url)) expect(l.example, `${e.id}: ${l.url}`).toBe(true);
  });
});

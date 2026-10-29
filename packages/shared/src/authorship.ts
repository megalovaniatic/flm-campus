/**
 * Autoría y firma de los contenidos.
 *
 * Cuando una persona deja FLM, administración elimina su perfil y lo que creó se conserva sin
 * autoría personal: `editorial.authorId` desaparece (en la API, `author_id` queda a NULL). Ese
 * contenido, y cualquiera cuya persona autora ya no esté en el campus, se firma de forma neutra
 * con el nombre de la firma:
 *  - formaciones y tests: «Área Fiscal de FLM», «Área Laboral de FLM»… (el área que los respalda);
 *  - noticias, eventos, comunicados, documentos, clientes y bienvenidas: «FLM».
 */
import { AREAS, isAreaId, type AreaId } from './areas';
import type { ContentType } from './types';

/** Contenidos que llevan firma: los del flujo editorial y los anuncios de «Ponte al día». */
export type SignedType = ContentType | 'cliente' | 'bienvenida';

/** Qué se firma: el tipo y, si lo tiene, el área (solo cuenta en formaciones y tests). */
export interface SignedContent {
  type: SignedType;
  area?: string | null;
}

/** Quién firma: la persona autora o, sin ella, la firma neutra (con su área en formaciones y tests). */
export type Byline<P> = { kind: 'persona'; person: P } | { kind: 'neutra'; name: string; area?: AreaId };

/**
 * Rótulo de quien ya no está en el campus, para la auditoría y los registros internos.
 * Nunca firma un contenido: el contenido sin autoría lleva la firma neutra.
 */
export const REMOVED_PERSON = 'Persona eliminada';

/** Tipos que firma un área cuando no tienen autoría personal. */
const AREA_SIGNED: ReadonlySet<SignedType> = new Set<SignedType>(['formacion', 'test']);

/** Área con la que firma un contenido sin autoría: solo formaciones y tests, y solo si tienen área. */
export function signingArea({ type, area }: SignedContent): AreaId | undefined {
  return AREA_SIGNED.has(type) && isAreaId(area) ? area : undefined;
}

/** Firma neutra de un contenido sin autoría personal: «Área Fiscal de FLM» o «FLM». */
export function neutralSignature(content: SignedContent): string {
  const area = signingArea(content);
  return area ? `Área ${AREAS[area].name} de FLM` : 'FLM';
}

/** Ids de perfiles eliminados: un conjunto o un registro por id (como `removedPeople` de la demo). */
type Removed = ReadonlySet<string> | Readonly<Record<string, unknown>>;

const isRemoved = (id: string, removed: Removed | undefined) => (!removed ? false : removed instanceof Set ? removed.has(id) : Object.hasOwn(removed, id));

function lookup<P extends { id: string }>(people: readonly P[] | ReadonlyMap<string, P>, id: string): P | undefined {
  return 'get' in people ? people.get(id) : people.find((p) => p.id === id);
}

/**
 * Firma de un contenido: la persona autora si sigue en el campus; si el contenido no tiene
 * autoría, si la persona no existe o si su perfil se ha eliminado, la firma neutra.
 *
 * `people`: las personas del campus (en la web, `usePeople()`, que ya deja fuera los perfiles
 * eliminados). `removed`: ids de perfiles eliminados, por si la lista todavía los incluye.
 */
export function bylineFor<P extends { id: string }>(authorId: string | undefined, people: readonly P[] | ReadonlyMap<string, P>, content: SignedContent, removed?: Removed): Byline<P> {
  const person = authorId && !isRemoved(authorId, removed) ? lookup(people, authorId) : undefined;
  if (person) return { kind: 'persona', person };
  const area = signingArea(content);
  return area ? { kind: 'neutra', name: neutralSignature(content), area } : { kind: 'neutra', name: neutralSignature(content) };
}

/** Nombre con el que firma un contenido (buscadores, textos de apoyo y lectores de pantalla). */
export function bylineName(byline: Byline<{ name: string }>): string {
  return byline.kind === 'persona' ? byline.person.name : byline.name;
}

/** Separador entre el nombre y el puesto en la firma de una persona. */
export const AUTHOR_SEPARATOR = ' — ';

/** Quien firma con su nombre: basta con el nombre y, si lo tiene, el puesto de su ficha. */
export interface AuthorLike {
  name: string;
  position?: string | null;
}

/** Las dos partes de la firma de una persona, ya limpias: el puesto solo si lo tiene. */
export function authorParts(person: AuthorLike): { name: string; position?: string } {
  const name = person.name.trim();
  const position = person.position?.trim();
  return position ? { name, position } : { name };
}

/**
 * Firma de la persona autora en una línea: nombre y puesto unidos por « — »
 * («Judith Calet — Asesora Contable»); sin puesto, solo el nombre.
 *
 * Es la única forma de mostrar la autoría de una formación y de su test (cabecera, notas al margen
 * y vista previa del editor). Sale siempre de la ficha de la persona que figura en
 * `editorial.authorId`, nunca de un texto escrito en cada formación: si cambia el puesto, cambia en todas.
 */
export function authorLine(person: AuthorLike): string {
  const { name, position } = authorParts(person);
  return position ? `${name}${AUTHOR_SEPARATOR}${position}` : name;
}

/**
 * Línea de firma de un contenido: la de la persona autora («Judith Calet — Asesora Contable») o,
 * sin ella, la firma neutra tal cual, sin puesto («Área Fiscal de FLM», «FLM»).
 */
export function bylineLine(byline: Byline<AuthorLike>): string {
  return byline.kind === 'persona' ? authorLine(byline.person) : byline.name;
}

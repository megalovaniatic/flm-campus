/**
 * Puntos de partida del creador para empezar rápido:
 *  - la estructura recomendada de una formación (los apartados de las formaciones del campus);
 *  - «Partir de un ejemplo»: una copia de un contenido real de la demo, que se reescribe.
 */
import type { ContentType, Person } from '@flm/shared';
import { duplicateBlock, kid, newBlock, newForm, type AnyForm, type EditorBlock, type FormationForm } from './forms';

const heading = (text: string, level: 2 | 3 = 2): EditorBlock => ({ ...(newBlock('heading', { level }) as Extract<EditorBlock, { type: 'heading' }>), text });

/**
 * Formación con la estructura de las del campus: qué es y a quién afecta (con «Explicamos»), cómo se
 * aplica con un ejemplo resuelto, errores frecuentes («Atención») y qué hacer con el cliente
 * (lista numerada). Los títulos se pueden cambiar; los bloques que sobren se eliminan.
 */
export function recommendedFormation(me: Pick<Person, 'department'> | null, today: string): FormationForm {
  const base = newForm('formacion', me, today) as FormationForm;
  return {
    ...base,
    blocks: [
      heading('Qué es y a quién afecta'),
      newBlock('paragraph'),
      newBlock('callout', { tone: 'clave' }),
      heading('Cómo se aplica, paso a paso'),
      newBlock('paragraph'),
      newBlock('example'),
      heading('Errores frecuentes'),
      newBlock('callout', { tone: 'atencion' }),
      heading('Qué hacer con el cliente'),
      { ...(newBlock('list') as Extract<EditorBlock, { type: 'list' }>), ordered: true },
    ],
  };
}

/** Formulario inicial de un tipo: la formación llega con su estructura recomendada. */
export function startForm(type: ContentType, me: Pick<Person, 'department'> | null, today: string): AnyForm {
  return type === 'formacion' ? recommendedFormation(me, today) : newForm(type, me, today);
}

const copyTitle = (s: string) => (s.trim() ? `Copia de ${s.trim()}` : s);

/**
 * Copia de un contenido existente como borrador nuevo («Partir de un ejemplo»): conserva la estructura y
 * el texto para reescribirlos, y quita lo que identifica al original (dirección, versión, PDF, persona…).
 */
export function copyAsNew(form: AnyForm, today: string): AnyForm {
  const copy = JSON.parse(JSON.stringify(form)) as AnyForm;
  switch (copy.type) {
    case 'formacion':
      return {
        ...copy,
        slug: undefined,
        title: copyTitle(copy.title),
        version: 1,
        majorChange: false,
        verifiedAt: today,
        blocks: copy.blocks.map(duplicateBlock),
        outcomes: copy.outcomes.map((o) => ({ ...o, id: kid('o') })),
        keyTerms: copy.keyTerms.map((k) => ({ ...k, id: kid('t') })),
        sources: copy.sources.map((s) => ({ ...s, id: kid('r') })),
        quiz: { ...copy.quiz, id: '', questions: copy.quiz.questions.map((q) => ({ ...q, id: kid('p') })) },
      };
    case 'test':
      return copy;
    case 'noticia':
      return { ...copy, slug: undefined, headline: copyTitle(copy.headline), date: today };
    case 'documento':
      return { ...copy, title: copyTitle(copy.title), versions: [], upload: undefined, versionNote: '', date: today };
    case 'evento':
    case 'comunicado':
      return {
        ...copy,
        slug: undefined,
        title: copyTitle(copy.title),
        manualPhase: '',
        recap: '',
        sessions: copy.sessions.map((s) => ({ ...s, id: kid('s') })),
        links: copy.links.map((l) => ({ ...l, id: kid('l') })),
        materials: copy.materials.map((m) => ({ ...m, id: kid('m') })),
      };
    case 'cliente':
      return { ...copy, name: copyTitle(copy.name), date: today, confirmed: false };
    case 'bienvenida':
      // Una bienvenida por persona: se copia el mensaje y se elige a otra persona.
      return { ...copy, personId: '', date: today, confirmed: false };
  }
}

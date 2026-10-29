/**
 * Borradores de ejemplo para recorrer el flujo de revisión en la demostración.
 * Están rotulados como «Ejemplo», los firman personas ficticias y no contienen
 * información normativa: solo sirven para probar enviar, publicar, devolver y deshacer.
 */
import { madridDateKey } from '@flm/shared';
import { useDemo, type DraftRecord } from '@/data/store';
import { newForm, type EventForm, type FormationForm, type NewsForm } from './forms';
import type { DraftData } from './model';

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export function loadExampleDrafts(): number {
  const st = useDemo.getState();
  const today = madridDateKey();

  const comunicado: EventForm = {
    ...(newForm('comunicado', null, today) as EventForm),
    title: 'Ejemplo · Presentamos FLM Campus al equipo',
    summary: 'Borrador de ejemplo para probar la revisión: un comunicado que invita a todo el equipo a conocer el campus.',
    body: 'Este texto es un **ejemplo de la demostración**. En la versión interna, Comunicación prepararía aquí el anuncio real, con sus fechas y enlaces.',
    pendingDate: true,
    pendingDateNote: 'Fecha por confirmar',
    sessions: [],
    links: [{ id: 'l-ej-1', label: 'Abrir el campus', url: 'https://campus.flmexperts.com/', example: true }],
  };

  const noticia: NewsForm = {
    ...(newForm('noticia', null, today) as NewsForm),
    area: 'fiscal',
    kind: 'aviso-interno',
    urgency: 'informativa',
    headline: 'Ejemplo · Aviso interno para probar el flujo editorial',
    oneLiner: 'Texto de ejemplo para comprobar cómo se revisa y se publica una novedad en cinco bloques.',
    affects: 'A quien quiera probar la demostración con el perfil de administración.',
    action: '**Revisa** el contenido, publícalo o devuélvelo con un comentario, y prueba «Deshacer» durante los 10 segundos siguientes.',
    example: 'Publica este aviso, abre Consultar › Actualidad y vuelve a Gestión para archivarlo.',
    sourceLabel: 'Ejemplo de la demostración (sin fuente normativa)',
    sourceUrl: 'https://flmexperts.com/',
  };

  const formacion: FormationForm = {
    ...(newForm('formacion', null, today) as FormationForm),
    area: 'contable',
    title: 'Ejemplo · Formación en preparación',
    coverTerm: 'Ejemplo',
    summary: 'Borrador de ejemplo devuelto con comentarios para que veas cómo lo recibe la persona autora.',
  };

  const make = (id: string, form: DraftData['form'], title: string, status: DraftRecord['status'], authorId: string, at: string, returnComment?: string): DraftRecord => ({
    id,
    type: form.type,
    title,
    status,
    authorId,
    updatedAt: at,
    data: { schema: 1, form, example: true } satisfies DraftData as unknown as Record<string, unknown>,
    revision: 1,
    ...(returnComment ? { returnComment } : {}),
  });

  const list = [
    make('ej-comunicado', comunicado, comunicado.title, 'en-revision', 'p-marina-castell', minutesAgo(95)),
    make('ej-noticia', noticia, noticia.headline, 'en-revision', 'p-jordi-ferrer', minutesAgo(40)),
    make('ej-formacion', formacion, formacion.title, 'borrador', 'p-montse-vila', minutesAgo(180), 'Falta el ejemplo resuelto y los términos clave: complétalos antes de volver a enviarla.'),
  ];
  let added = 0;
  for (const d of list) {
    if (st.drafts[d.id]) continue;
    st.saveDraft(d);
    added++;
  }
  return added;
}

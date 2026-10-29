import { AnimatePresence, motion } from 'motion/react';
import { Check, Import, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
import { plainText, type QuizQuestion } from '@flm/shared';
import { Button, Dialog, IconButton, Notice, SelectField, TextField } from '@/design';
import { kid, newOption, newQuestion, OPTION_LETTERS, reviewRefProblem, type QuestionForm, type QuizForm, type ReviewTarget } from '../forms';
import { AddButton, FieldError, ItemTools, itemMotion, move, Section, Slot } from './fields';
import { RichTextArea } from './RichTextArea';
import styles from './Editor.module.css';

export type { ReviewTarget };

/** Pregunta del banco que se puede importar a la evaluación (de las formaciones del área). */
export interface PoolQuestion {
  key: string;
  source: string;
  question: QuizQuestion;
}

function QuestionCard({
  q,
  i,
  count,
  total,
  base,
  update,
  err,
  sections,
  openedSections,
  removable,
  terms,
}: {
  q: QuestionForm;
  i: number;
  count: number;
  total: number;
  base: string;
  update: (fn: (prev: QuizForm) => QuizForm) => void;
  err: (p: string) => string | undefined;
  sections?: ReviewTarget[];
  openedSections?: ReviewTarget[];
  removable: boolean;
  terms?: string[];
}) {
  const patch = (p: Partial<QuestionForm>) => update((prev) => ({ ...prev, questions: prev.questions.map((x) => (x.id === q.id ? { ...x, ...p } : x)) }));
  const path = `${base}.questions.${i}`;
  const freeId = ['a', 'b', 'c', 'd'].find((id) => !q.options.some((o) => o.id === id));
  // Un «Repasa» que no es ninguno de los apartados se conserva como opción; si ya no coincide con ellos, se rotula y se avisa.
  const stale = sections && q.ref ? reviewRefProblem(q.ref, sections, openedSections) : null;
  const refOptions = sections ? [{ value: '', label: 'Sin «Repasa»' }, ...sections, ...(q.ref && !sections.some((s) => s.value === q.ref) ? [{ value: q.ref, label: stale ? `(ya no coincide) ${q.ref}` : q.ref }] : [])] : null;
  return (
    <Section
      level={3}
      kicker={i + 1}
      title={`Pregunta ${i + 1} de ${total}`}
      description="Mejor de aplicación práctica que de memoria."
      aside={
        <ItemTools
          label={`la pregunta ${i + 1}`}
          index={i}
          count={count}
          min={removable ? 0 : count}
          onMove={(to) => update((prev) => ({ ...prev, questions: move(prev.questions, i, to) }))}
          onRemove={() => update((prev) => ({ ...prev, questions: prev.questions.filter((x) => x.id !== q.id) }))}
        />
      }
    >
      <Slot path={`${path}.prompt`}>
        <RichTextArea label="Enunciado" required rows={3} value={q.prompt} onChange={(prompt) => patch({ prompt })} terms={terms} error={err(`${path}.prompt`)} />
      </Slot>
      <Slot path={`${path}.correct`}>
        <fieldset className={styles.subfields}>
          <legend className={styles.legend}>Opciones y respuesta correcta</legend>
          <p className={styles.hint}>Marca la correcta. En cada opción incorrecta explica «por qué no»: es la nota al margen que verá la persona al corregir.</p>
          <FieldError message={err(`${path}.correct`) ?? err(`${path}.options`)} />
          <ol role="list" className={styles.items}>
            <AnimatePresence initial={false}>
              {q.options.map((o, j) => {
                const letter = OPTION_LETTERS[j] ?? String(j + 1);
                const correct = o.id === q.correctOptionId;
                const setOpt = (p: Partial<typeof o>) => patch({ options: q.options.map((x) => (x.id === o.id ? { ...x, ...p } : x)) });
                return (
                  <motion.li key={o.id} {...itemMotion} className={styles.option} data-correct={correct || undefined}>
                    <div className={styles.optionHead}>
                      <span className={styles.optionLetter} aria-hidden="true">
                        {letter}
                      </span>
                      <label className={styles.correctToggle}>
                        <input type="radio" name={`correcta-${q.id}`} checked={correct} onChange={() => patch({ correctOptionId: o.id })} />
                        <span className={styles.correctMark} aria-hidden="true">
                          {correct && <Check size={14} strokeWidth={3} />}
                        </span>
                        <span>
                          <span className="sr-only">Opción {letter}: </span>
                          {correct ? 'Respuesta correcta' : 'Marcar como correcta'}
                        </span>
                      </label>
                      {q.options.length > 3 && (
                        <IconButton label={`Eliminar la opción ${letter}`} icon={<Trash />} size="sm" onClick={() => patch({ options: q.options.filter((x) => x.id !== o.id), correctOptionId: correct ? '' : q.correctOptionId })} />
                      )}
                    </div>
                    <Slot path={`${path}.options.${j}.text`}>
                      <TextField label={`Texto de la opción ${letter}`} value={o.text} onChange={(e) => setOpt({ text: e.target.value })} error={err(`${path}.options.${j}.text`)} />
                    </Slot>
                    <AnimatePresence initial={false}>
                      {!correct && (
                        <motion.div key="why" className={styles.whyWrap} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}>
                          <Slot path={`${path}.options.${j}.feedback`}>
                            <TextField label={`Por qué no es correcta la ${letter}`} required={!!q.correctOptionId} value={o.feedback} onChange={(e) => setOpt({ feedback: e.target.value })} error={err(`${path}.options.${j}.feedback`)} />
                          </Slot>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
          <AddButton disabled={q.options.length >= 4 || !freeId} onClick={() => freeId && patch({ options: [...q.options, newOption(freeId)] })}>
            Añadir una cuarta opción
          </AddButton>
        </fieldset>
      </Slot>
      <Slot path={`${path}.explanation`}>
        <RichTextArea label="Explicación de la respuesta correcta" required rows={3} value={q.explanation} onChange={(explanation) => patch({ explanation })} terms={terms} error={err(`${path}.explanation`)} hint="Por qué es la correcta, con la referencia normativa si la hay." />
      </Slot>
      {refOptions ? (
        <>
          <SelectField label="«Repasa» (opcional)" value={q.ref} onChange={(e) => patch({ ref: e.target.value })} options={refOptions} hint="Si se falla, el test enlaza con este apartado de la formación." />
          {stale && (
            <Notice tone="warning" title="Este «Repasa» ya no coincide con los apartados">
              <p>{stale.message}. Elige de nuevo el apartado al que remitir si se falla la pregunta.</p>
              {stale.suggestion && (
                <div className={styles.noticeActions}>
                  <Button size="sm" variant="secondary" onClick={() => patch({ ref: stale.suggestion!.value })}>
                    Usar «{stale.suggestion.label}»
                  </Button>
                </div>
              )}
            </Notice>
          )}
        </>
      ) : (
        <TextField label="«Repasa» (opcional)" value={q.ref} onChange={(e) => patch({ ref: e.target.value })} hint="Formación o apartado al que remitir si se falla." />
      )}
    </Section>
  );
}

/** Importar preguntas del banco de las formaciones del área (evaluaciones). */
function ImportDialog({ open, onClose, pool, taken, room, onImport }: { open: boolean; onClose: () => void; pool: PoolQuestion[]; taken: Set<string>; room: number; onImport: (qs: QuizQuestion[]) => void }) {
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const available = pool.filter((p) => !taken.has(p.question.id));
  const sources = [...new Set(available.map((p) => p.source))];
  const toggle = (key: string, on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Importar preguntas"
      description={`De los tests y bancos de las formaciones del área. Caben ${room === 1 ? '1 pregunta más' : `${room} preguntas más`}.`}
      variant="sheet"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} data-autofocus>
            Cancelar
          </Button>
          <Button
            icon={<Import />}
            disabled={picked.size === 0 || picked.size > room}
            onClick={() => {
              onImport(available.filter((p) => picked.has(p.key)).map((p) => p.question));
              setPicked(new Set());
            }}
          >
            {picked.size > room ? `Solo caben ${room}` : picked.size === 1 ? 'Añadir 1 pregunta' : `Añadir ${picked.size} preguntas`}
          </Button>
        </>
      }
    >
      {available.length === 0 ? (
        <p>No quedan preguntas por importar: ya están todas en la evaluación.</p>
      ) : (
        sources.map((s) => (
          <fieldset key={s} className={styles.importGroup}>
            <legend className={styles.legend}>{s}</legend>
            <ul role="list" className={styles.docList}>
              {available
                .filter((p) => p.source === s)
                .map((p) => (
                  <li key={p.key}>
                    <label className={styles.docOption} data-checked={picked.has(p.key) || undefined}>
                      <input type="checkbox" checked={picked.has(p.key)} onChange={(e) => toggle(p.key, e.target.checked)} />
                      <span className={styles.docText}>
                        <span className={styles.docTitle}>{plainText(p.question.prompt)}</span>
                        <span className={styles.docMeta}>{p.question.options.length} opciones</span>
                      </span>
                    </label>
                  </li>
                ))}
            </ul>
          </fieldset>
        ))
      )}
    </Dialog>
  );
}

/**
 * Cuestionario: el test final de una formación (3 preguntas, se supera con 2) o la evaluación del área
 * (10 preguntas, se supera con 8). Cada opción incorrecta lleva su «por qué no».
 */
export function QuizEditor({
  quiz,
  update,
  err,
  base,
  count,
  passMark,
  sections,
  openedSections,
  pool,
  terms,
}: {
  quiz: QuizForm;
  update: (fn: (prev: QuizForm) => QuizForm) => void;
  err: (p: string) => string | undefined;
  base: string;
  count: number;
  passMark: number;
  /** Apartados actuales de la formación, para el «Repasa» de cada pregunta. */
  sections?: ReviewTarget[];
  /** Apartados al abrir el editor: con ellos se ve qué «Repasa» nombraba uno que se ha renombrado o borrado. */
  openedSections?: ReviewTarget[];
  pool?: PoolQuestion[];
  terms?: string[];
}) {
  const [importing, setImporting] = useState(false);
  const flexible = !!pool;
  const total = quiz.questions.length;
  const taken = useMemo(() => new Set(quiz.questions.map((q) => q.id)), [quiz.questions]);
  const toForm = (q: QuizQuestion): QuestionForm => ({
    id: taken.has(q.id) ? kid('p') : q.id,
    prompt: q.prompt,
    options: q.options.map((o) => ({ id: o.id, text: o.text, feedback: o.feedback ?? '' })),
    correctOptionId: q.correctOptionId,
    explanation: q.explanation,
    ref: q.ref ?? '',
  });
  return (
    <>
      <Slot path={`${base}.questions`}>
        <p className={styles.quizCount} role="status" data-complete={total === count || undefined}>
          {total} de {count} preguntas · se supera con {passMark} aciertos
        </p>
        <FieldError message={err(`${base}.questions`)} />
      </Slot>
      {/* El test final tiene un número fijo de preguntas, pero un borrador traído del editor anterior puede tener
          menos o más: se pueden añadir las que faltan y quitar las que sobran hasta llegar a ese número. */}
      {(flexible || total < count) && (
        <div className={styles.addRow}>
          <AddButton disabled={total >= count} onClick={() => update((prev) => ({ ...prev, questions: [...prev.questions, newQuestion()] }))}>
            Añadir pregunta
          </AddButton>
          {flexible && (
            <Button variant="secondary" size="sm" icon={<Import />} disabled={total >= count} onClick={() => setImporting(true)}>
              Importar de las formaciones del área
            </Button>
          )}
        </div>
      )}
      {quiz.questions.map((q, i) => (
        <QuestionCard key={q.id} q={q} i={i} count={total} total={Math.max(count, total)} base={base} update={update} err={err} sections={sections} openedSections={openedSections} removable={flexible || total > count} terms={terms} />
      ))}
      {flexible && pool && (
        <ImportDialog
          open={importing}
          onClose={() => setImporting(false)}
          pool={pool}
          taken={taken}
          room={count - total}
          onImport={(qs) => {
            update((prev) => ({ ...prev, questions: [...prev.questions, ...qs.map(toForm)].slice(0, count) }));
            setImporting(false);
          }}
        />
      )}
    </>
  );
}

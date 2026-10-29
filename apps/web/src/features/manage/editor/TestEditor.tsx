import { AnimatePresence, motion } from 'motion/react';
import { Check, Trash } from 'lucide-react';
import { useMemo } from 'react';
import { IconButton, Notice, SelectField, TextArea, TextField } from '@/design';
import { useFormations } from '@/data/selectors';
import { useDemo } from '@/data/store';
import { newOption, OPTION_LETTERS, type QuestionForm, type TestForm } from '../forms';
import { readDraft } from '../model';
import { AddButton, FieldError, itemMotion, RICH_HINT, Section, Slot, type EditorProps } from './fields';
import styles from './Editor.module.css';

function QuestionCard({ q, i, update, err }: { q: QuestionForm; i: number; update: EditorProps<TestForm>['update']; err: EditorProps<TestForm>['err'] }) {
  const patch = (p: Partial<QuestionForm>) => update((prev) => ({ ...prev, questions: prev.questions.map((x) => (x.id === q.id ? { ...x, ...p } : x)) }));
  const base = `questions.${i}`;
  const freeId = ['a', 'b', 'c', 'd'].find((id) => !q.options.some((o) => o.id === id));
  return (
    <Section kicker={i + 1} title={`Pregunta ${i + 1} de 3`} description="Una pregunta de aplicación práctica, mejor que de memoria.">
      <Slot path={`${base}.prompt`}>
        <TextArea label="Enunciado" required rows={3} value={q.prompt} onChange={(e) => patch({ prompt: e.target.value })} error={err(`${base}.prompt`)} hint={RICH_HINT} />
      </Slot>
      <Slot path={`${base}.correct`}>
        <fieldset className={styles.subfields}>
          <legend className={styles.legend}>Opciones y respuesta correcta</legend>
          <p className={styles.hint}>Marca la correcta. En cada opción incorrecta explica «por qué no»: es la nota al margen que verá la persona al corregir.</p>
          <FieldError message={err(`${base}.correct`)} />
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
                        <IconButton
                          label={`Eliminar la opción ${letter}`}
                          icon={<Trash />}
                          size="sm"
                          onClick={() => patch({ options: q.options.filter((x) => x.id !== o.id), correctOptionId: correct ? '' : q.correctOptionId })}
                        />
                      )}
                    </div>
                    <Slot path={`${base}.options.${j}.text`}>
                      <TextField label={`Texto de la opción ${letter}`} value={o.text} onChange={(e) => setOpt({ text: e.target.value })} error={err(`${base}.options.${j}.text`)} />
                    </Slot>
                    <AnimatePresence initial={false}>
                      {!correct && (
                        <motion.div key="why" className={styles.whyWrap} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}>
                          <Slot path={`${base}.options.${j}.feedback`}>
                            <TextArea label={`Por qué no es correcta la ${letter}`} required={!!q.correctOptionId} rows={2} value={o.feedback} onChange={(e) => setOpt({ feedback: e.target.value })} error={err(`${base}.options.${j}.feedback`)} />
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
      <Slot path={`${base}.explanation`}>
        <TextArea label="Explicación de la respuesta correcta" required rows={3} value={q.explanation} onChange={(e) => patch({ explanation: e.target.value })} error={err(`${base}.explanation`)} hint={`Por qué es la correcta, con la referencia normativa si la hay. ${RICH_HINT}`} />
      </Slot>
      <TextField label="Repasa (opcional)" value={q.ref} onChange={(e) => patch({ ref: e.target.value })} hint="Apartado de la formación al que remitir si se falla: «Apartado 2 · Plazos»." />
    </Section>
  );
}

/** Test final: exactamente 3 preguntas de 3–4 opciones, con «por qué no» obligatorio. Aprobado: 2/3. */
export function TestEditor({ value: f, update, err }: EditorProps<TestForm>) {
  const formations = useFormations(true);
  const drafts = useDemo((s) => s.drafts);
  const options = useMemo(() => {
    const own = Object.values(drafts)
      .filter((d) => d.type === 'formacion' && !readDraft(d)?.sourceId)
      .map((d) => ({ value: d.id, label: `${d.title || 'Formación sin título'} (en Gestión)` }));
    return [{ value: '', label: 'Elige una formación…' }, ...formations.map((x) => ({ value: x.id, label: x.title })), ...own];
  }, [formations, drafts]);
  return (
    <>
      <Section title="Test final" description="Exactamente 3 preguntas de 3 o 4 opciones. Se aprueba con 2 de 3 aciertos.">
        <Slot path="formationId">
          <SelectField label="Formación" required value={f.formationId} onChange={(e) => update((p) => ({ ...p, formationId: e.target.value }))} options={options} error={err('formationId')} hint={options.length === 1 ? 'Todavía no hay formaciones: crea antes la formación con su plantilla.' : 'El test se muestra al final de esta formación.'} />
        </Slot>
        <Slot path="title">
          <TextField label="Título del test" required value={f.title} onChange={(e) => update((p) => ({ ...p, title: e.target.value }))} error={err('title')} />
        </Slot>
        <Notice title="Aprobado: 2 de 3">Es el mismo criterio en todas las formaciones. Con el test superado y la lectura confirmada, la formación queda completada.</Notice>
      </Section>
      {f.questions.map((q, i) => (
        <QuestionCard key={q.id} q={q} i={i} update={update} err={err} />
      ))}
    </>
  );
}

import { AnimatePresence, motion } from 'motion/react';
import { BookOpenText, CircleCheck, FileText, Images, ListChecks, NotebookText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AREA_LIST, type AreaId } from '@flm/shared';
import { Checkbox, Notice, SelectField, TextArea, TextField } from '@/design';
import { formationMinutes, kid, QUIZ_RULES, reviewTargets, type FieldError as FieldErrorType, type FormationForm } from '../forms';
import { BlockList, RefsEditor } from './blocks';
import { AddButton, FieldError, ItemTools, itemMotion, move, Section, Slot, type EditorProps } from './fields';
import { DocumentChecklist } from './pickers';
import { QuizEditor } from './QuizEditor';
import { RichTextArea } from './RichTextArea';
import styles from './Editor.module.css';

/** Pasos de la formación: cada uno agrupa sus campos y cuenta sus errores pendientes. */
export const FORMATION_STEPS = [
  { id: 'portada', label: 'Portada y resumen', icon: Images, match: (p: string) => /^(title|coverTerm|summary|intro|outcomes|area|version)/.test(p) },
  { id: 'contenido', label: 'Contenido', icon: BookOpenText, match: (p: string) => p.startsWith('blocks') },
  { id: 'terminos', label: 'Términos e idea clave', icon: NotebookText, match: (p: string) => p.startsWith('keyTerms') || p.startsWith('takeaway') },
  { id: 'fuentes', label: 'Fuentes y documentos', icon: FileText, match: (p: string) => p.startsWith('sources') || p.startsWith('verifiedAt') || p.startsWith('documentIds') },
  { id: 'test', label: 'Test final', icon: ListChecks, match: (p: string) => p.startsWith('quiz') },
] as const;

export type FormationStep = (typeof FORMATION_STEPS)[number]['id'];

const stepAnchor = (id: string) => `paso-${id}`;

/** Lleva a un paso: desplaza la página hasta su sección y deja el foco en su título. */
export function goToStep(id: string, reduce: boolean) {
  const el = document.getElementById(stepAnchor(id));
  if (!el) return;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
}

function StepNav({ errors, showCounts, reduce }: { errors: FieldErrorType[]; showCounts: boolean; reduce: boolean }) {
  return (
    <nav className={styles.steps} aria-label="Pasos de la formación">
      <ol role="list">
        {FORMATION_STEPS.map((s, i) => {
          const pending = errors.filter((e) => s.match(e.path)).length;
          const Icon = s.icon;
          return (
            <li key={s.id}>
              <button type="button" className={styles.step} onClick={() => goToStep(s.id, reduce)} data-pending={(showCounts && pending > 0) || undefined}>
                <span className={styles.stepNum} aria-hidden="true">
                  {i + 1}
                </span>
                <Icon size={16} aria-hidden="true" className={styles.stepIcon} />
                <span>{s.label}</span>
                {showCounts && (pending > 0 ? <span className={styles.stepCount}>{pending === 1 ? '1 pendiente' : `${pending} pendientes`}</span> : <CircleCheck size={16} aria-label="completo" className={styles.stepOk} />)}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Apartados actuales, para el «Repasa» de cada pregunta del test (y para ver cuáles ya no coinciden). */
const useReviewTargets = (form: FormationForm) => useMemo(() => reviewTargets(form.blocks), [form.blocks]);

/**
 * Formación: portada tipográfica, resumen y resultados; contenido por apartados con todos los bloques
 * (texto, recuadros, ejemplo resuelto, tablas, fotos y apoyos interactivos); términos e idea clave;
 * fuentes y documentos; y el test final de tres preguntas.
 */
export function FormationEditor({ value: f, update, err, ctx, errors, showErrors, reduce, initialStep }: EditorProps<FormationForm> & { errors: FieldErrorType[]; showErrors: boolean; reduce: boolean; initialStep?: string | null }) {
  const set = <K extends keyof FormationForm>(k: K, v: FormationForm[K]) => update((p) => ({ ...p, [k]: v }));
  const terms = f.keyTerms.map((k) => k.term.trim()).filter(Boolean);
  const sections = useReviewTargets(f);
  // Los apartados al abrir el editor: un «Repasa» que nombraba uno que luego se renombra o se borra se avisa.
  const [openedSections] = useState(sections);

  useEffect(() => {
    if (!initialStep) return;
    const t = window.setTimeout(() => goToStep(initialStep, reduce), 220);
    return () => window.clearTimeout(t);
    // Solo al abrir el editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <StepNav errors={errors} showCounts={showErrors} reduce={reduce} />

      <Section id={stepAnchor('portada')} kicker={1} title="Portada y resumen" description="La portada es tipográfica: un «término de portada» en el color del área, nunca una foto de archivo.">
        <div className={styles.grid2}>
          <SelectField label="Área" value={f.area} onChange={(e) => set('area', e.target.value as AreaId)} options={AREA_LIST.map((a) => ({ value: a.id, label: a.name }))} />
          <Slot path="coverTerm">
            <TextField label="Término de portada" value={f.coverTerm} maxLength={16} onChange={(e) => set('coverTerm', e.target.value)} error={err('coverTerm')} hint="Por ejemplo: «Art. 27», «147», «¿A Mercantil?». Hasta 16 caracteres." />
          </Slot>
        </div>
        <Slot path="title">
          <TextField label="Título" required value={f.title} onChange={(e) => set('title', e.target.value)} error={err('title')} placeholder="p. ej., Cuándo derivar un cliente a Mercantil" />
        </Slot>
        <Slot path="summary">
          <TextArea label="Resumen para las tarjetas" required rows={2} maxLength={220} value={f.summary} onChange={(e) => set('summary', e.target.value)} error={err('summary')} hint="Una frase que invite a leerla." />
        </Slot>
        <Slot path="intro">
          <RichTextArea label="Introducción práctica" required rows={4} value={f.intro} onChange={(intro) => set('intro', intro)} terms={terms} error={err('intro')} hint="Por qué importa, con una situación real de cliente." />
        </Slot>
        <Slot path="outcomes">
          <fieldset className={styles.subfields}>
            <legend className={styles.legend}>Al terminar, sabrás… (entre 2 y 3 resultados)</legend>
            <FieldError message={err('outcomes')} />
            <ol role="list" className={styles.items}>
              <AnimatePresence initial={false}>
                {f.outcomes.map((o, i) => (
                  <motion.li key={o.id} {...itemMotion} className={styles.inlineItem}>
                    <Slot path={`outcomes.${i}`} className={styles.grow}>
                      <TextField label={`Resultado ${i + 1}`} value={o.text} onChange={(e) => update((p) => ({ ...p, outcomes: p.outcomes.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) }))} error={err(`outcomes.${i}`)} placeholder="p. ej., Identificar cuándo un caso fiscal tiene una derivada mercantil" />
                    </Slot>
                    <ItemTools label={`el resultado ${i + 1}`} index={i} count={f.outcomes.length} min={2} onMove={(to) => update((p) => ({ ...p, outcomes: move(p.outcomes, i, to) }))} onRemove={() => update((p) => ({ ...p, outcomes: p.outcomes.filter((x) => x.id !== o.id) }))} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
            <AddButton disabled={f.outcomes.length >= 3} onClick={() => update((p) => ({ ...p, outcomes: [...p.outcomes, { id: kid('o'), text: '' }] }))}>
              Añadir resultado
            </AddButton>
          </fieldset>
        </Slot>
        <p className={styles.metaNote}>
          Lectura estimada: <strong>{formationMinutes(f)} min</strong> · versión {f.version}
          {f.majorChange ? ` → ${f.version + 1} al publicar` : ''}
        </p>
        {ctx.isRevision && (
          <Checkbox
            label="Cambio importante: pedir de nuevo la confirmación de lectura"
            hint={`Al publicar, la formación pasa a la versión ${f.version + 1}: quien ya la había completado tendrá que volver a leerla y confirmar. Úsalo para cambios de criterio o de norma, no para erratas.`}
            checked={f.majorChange}
            onChange={(v) => set('majorChange', v)}
          />
        )}
      </Section>

      <Section id={stepAnchor('contenido')} kicker={2} title="Contenido" description="Apartados y subapartados con sus bloques, en orden de lectura. Inserta un bloque donde quieras con «+»; muévelos con las flechas. El ejemplo resuelto es obligatorio.">
        <Slot path="blocks">
          <FieldError message={err('blocks')} />
        </Slot>
        <BlockList blocks={f.blocks} update={(fn) => update((p) => ({ ...p, blocks: fn(p.blocks) }))} err={err} errors={errors} terms={terms} today={ctx.today} />
      </Section>

      <Section id={stepAnchor('terminos')} kicker={3} title="Términos clave e idea clave" description="Al menos 3 términos. En el texto, enlázalos con el botón «Término» o escribiendo [[término]]: la definición aparece al margen.">
        <Slot path="keyTerms">
          <FieldError message={err('keyTerms')} />
        </Slot>
        <ol role="list" className={styles.items}>
          <AnimatePresence initial={false}>
            {f.keyTerms.map((k, i) => (
              <motion.li key={k.id} {...itemMotion} className={styles.itemCard}>
                <div className={styles.itemHead}>
                  <span className={styles.itemTitle}>Término {i + 1}</span>
                  <ItemTools label={`el término ${i + 1}`} index={i} count={f.keyTerms.length} min={1} onMove={(to) => update((p) => ({ ...p, keyTerms: move(p.keyTerms, i, to) }))} onRemove={() => update((p) => ({ ...p, keyTerms: p.keyTerms.filter((x) => x.id !== k.id) }))} />
                </div>
                <Slot path={`keyTerms.${i}.term`}>
                  <TextField label="Término" value={k.term} onChange={(e) => update((p) => ({ ...p, keyTerms: p.keyTerms.map((x) => (x.id === k.id ? { ...x, term: e.target.value } : x)) }))} error={err(`keyTerms.${i}.term`)} />
                </Slot>
                <Slot path={`keyTerms.${i}.definition`}>
                  <TextArea label="Definición" rows={2} value={k.definition} onChange={(e) => update((p) => ({ ...p, keyTerms: p.keyTerms.map((x) => (x.id === k.id ? { ...x, definition: e.target.value } : x)) }))} error={err(`keyTerms.${i}.definition`)} />
                </Slot>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
        <AddButton onClick={() => update((p) => ({ ...p, keyTerms: [...p.keyTerms, { id: kid('t'), term: '', definition: '' }] }))}>Añadir término</AddButton>
        <Slot path="takeaway">
          <RichTextArea label="Idea clave" required rows={2} value={f.takeaway} onChange={(takeaway) => set('takeaway', takeaway)} terms={terms} error={err('takeaway')} hint="La idea que debe quedar, en una o dos frases. Se destaca al final con el punto rojo." />
        </Slot>
      </Section>

      <Section id={stepAnchor('fuentes')} kicker={4} title="Fuentes y documentos" description="Normas, resoluciones o criterios con su enlace oficial (https://) y los documentos originales de la biblioteca.">
        <Slot path="sources">
          <FieldError message={err('sources')} />
        </Slot>
        <RefsEditor refs={f.sources} onChange={(sources) => set('sources', sources)} base="sources" err={err} what="Fuente" min={1} add="Añadir fuente" today={ctx.today} />
        <Slot path="verifiedAt">
          <TextField label="Normativa comprobada a fecha de" type="date" value={f.verifiedAt} onChange={(e) => set('verifiedAt', e.target.value)} error={err('verifiedAt')} hint="Se muestra como «Normativa comprobada a …» al final de la formación." />
        </Slot>
        <DocumentChecklist legend="Documentos originales (opcional)" hint="Aparecen como «Documentos originales» junto a las fuentes, con su descarga." selected={f.documentIds} onChange={(documentIds) => set('documentIds', documentIds)} />
      </Section>

      <Section id={stepAnchor('test')} kicker={5} title="Test final" description="Tres preguntas de 3 o 4 opciones con «por qué no» en cada incorrecta. Se supera con 2 de 3; con la lectura confirmada, la formación queda completada.">
        <Slot path="quiz.title">
          <TextField label="Título del test" value={f.quiz.title} onChange={(e) => update((p) => ({ ...p, quiz: { ...p.quiz, title: e.target.value } }))} />
        </Slot>
        {sections.length === 0 && <Notice title="«Repasa» necesita apartados">Añade apartados en «Contenido» para enlazar cada pregunta con el apartado que conviene repasar.</Notice>}
        <QuizEditor quiz={f.quiz} update={(fn) => update((p) => ({ ...p, quiz: fn(p.quiz) }))} err={err} base="quiz" count={QUIZ_RULES.formacion.count} passMark={QUIZ_RULES.formacion.passMark} sections={sections} openedSections={openedSections} terms={terms} />
      </Section>
    </>
  );
}

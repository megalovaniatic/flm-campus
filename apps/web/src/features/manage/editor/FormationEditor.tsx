import { AnimatePresence, motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Heading, Lightbulb, List, Lock, Pilcrow, SquarePen } from 'lucide-react';
import { Link } from 'react-router';
import { AREA_LIST, type AreaId } from '@flm/shared';
import { Checkbox, Notice, SelectField, TextArea, TextField } from '@/design';
import { BLOCK_LABEL, CALLOUT_LABEL, formationMinutes, kid, newBlock, type CalloutTone, type EditableBlockType, type EditorBlock, type FormationForm } from '../forms';
import { AddButton, FieldError, ItemTools, itemMotion, move, RICH_HINT, Section, Slot, type EditorProps } from './fields';
import styles from './Editor.module.css';

const BLOCK_ICON: Record<EditableBlockType | 'locked', LucideIcon> = {
  heading: Heading,
  paragraph: Pilcrow,
  callout: Lightbulb,
  list: List,
  example: SquarePen,
  locked: Lock,
};

const ADDABLE: EditableBlockType[] = ['heading', 'paragraph', 'callout', 'list', 'example'];

function BlockFields({ b, i, update, err }: { b: EditorBlock; i: number; update: EditorProps<FormationForm>['update']; err: EditorProps<FormationForm>['err'] }) {
  const patch = (p: Partial<EditorBlock>) => update((prev) => ({ ...prev, blocks: prev.blocks.map((x) => (x.id === b.id ? ({ ...x, ...p } as EditorBlock) : x)) }));
  const path = (k: string) => `blocks.${i}.${k}`;
  switch (b.type) {
    case 'heading':
      return (
        <Slot path={path('text')}>
          <TextField label="Título de la sección" value={b.text} onChange={(e) => patch({ text: e.target.value })} error={err(path('text'))} placeholder="Qué cambia y desde cuándo" />
        </Slot>
      );
    case 'paragraph':
      return (
        <Slot path={path('text')}>
          <TextArea label="Párrafo" rows={4} value={b.text} onChange={(e) => patch({ text: e.target.value })} error={err(path('text'))} hint={`Deja una línea en blanco para separar párrafos. ${RICH_HINT}`} />
        </Slot>
      );
    case 'callout':
      return (
        <>
          <div className={styles.grid2}>
            <SelectField
              label="Tipo de recuadro"
              value={b.tone}
              onChange={(e) => patch({ tone: e.target.value as CalloutTone })}
              options={(Object.keys(CALLOUT_LABEL) as CalloutTone[]).map((t) => ({ value: t, label: t === 'clave' ? 'Explicamos (término)' : CALLOUT_LABEL[t] }))}
            />
            <TextField label={b.tone === 'clave' ? 'Término que se explica' : 'Título (opcional)'} value={b.title} onChange={(e) => patch({ title: e.target.value })} hint={b.tone === 'clave' ? 'Se muestra como «EXPLICAMOS [TÉRMINO]».' : undefined} />
          </div>
          <Slot path={path('text')}>
            <TextArea label="Texto del recuadro" rows={3} value={b.text} onChange={(e) => patch({ text: e.target.value })} error={err(path('text'))} hint={RICH_HINT} />
          </Slot>
        </>
      );
    case 'list':
      return (
        <>
          <Checkbox label="Lista numerada" hint="Para pasos o plazos en orden." checked={b.ordered} onChange={(v) => patch({ ordered: v })} />
          <Slot path={path('items')}>
            <TextArea label="Elementos (uno por línea)" rows={4} value={b.items} onChange={(e) => patch({ items: e.target.value })} error={err(path('items'))} hint={RICH_HINT} />
          </Slot>
        </>
      );
    case 'example':
      return (
        <>
          <Slot path={path('title')}>
            <TextField label="Título del ejemplo" value={b.title} onChange={(e) => patch({ title: e.target.value })} error={err(path('title'))} placeholder="Una sociedad que presenta fuera de plazo" />
          </Slot>
          <Slot path={path('scenario')}>
            <TextArea label="Planteamiento" rows={3} value={b.scenario} onChange={(e) => patch({ scenario: e.target.value })} error={err(path('scenario'))} hint="El caso del cliente, con datos realistas y cifras redondas." />
          </Slot>
          <Slot path={path('steps')}>
            <fieldset className={styles.subfields}>
              <legend className={styles.legend}>Pasos (se muestran uno a uno: «Siguiente paso» / «Ver todo»)</legend>
              <FieldError message={err(path('steps'))} />
              <ol role="list" className={styles.items}>
                <AnimatePresence initial={false}>
                  {b.steps.map((s, j) => (
                    <motion.li key={s.id} {...itemMotion} className={styles.stepRow}>
                      <div className={styles.itemHead}>
                        <span className={styles.itemTitle}>Paso {j + 1}</span>
                        <ItemTools
                          label={`el paso ${j + 1}`}
                          index={j}
                          count={b.steps.length}
                          min={1}
                          onMove={(to) => patch({ steps: move(b.steps, j, to) })}
                          onRemove={() => patch({ steps: b.steps.filter((x) => x.id !== s.id) })}
                        />
                      </div>
                      <TextField label={`Qué se hace en el paso ${j + 1}`} value={s.label} onChange={(e) => patch({ steps: b.steps.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)) })} />
                      <div className={styles.grid2}>
                        <TextField label="Cálculo (opcional)" value={s.formula} onChange={(e) => patch({ steps: b.steps.map((x) => (x.id === s.id ? { ...x, formula: e.target.value } : x)) })} placeholder="1.000 € × 5 %" />
                        <TextField label="Resultado (opcional)" value={s.result} onChange={(e) => patch({ steps: b.steps.map((x) => (x.id === s.id ? { ...x, result: e.target.value } : x)) })} placeholder="50 €" />
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
              <AddButton onClick={() => patch({ steps: [...b.steps, { id: kid('s'), label: '', formula: '', result: '' }] })}>Añadir paso</AddButton>
            </fieldset>
          </Slot>
          <Slot path={path('conclusion')}>
            <TextArea label="Conclusión" rows={2} value={b.conclusion} onChange={(e) => patch({ conclusion: e.target.value })} error={err(path('conclusion'))} />
          </Slot>
        </>
      );
    case 'locked':
      return (
        <p className={styles.lockedNote}>
          Bloque avanzado ({b.block.type}): tablas, apoyos interactivos y figuras se conservan tal cual. Puedes moverlo o eliminarlo.
        </p>
      );
  }
}

/** Formación: portada tipográfica, resultados, bloques sencillos, términos, idea clave y fuentes. */
export function FormationEditor({ value: f, update, err }: EditorProps<FormationForm>) {
  const set = <K extends keyof FormationForm>(k: K, v: FormationForm[K]) => update((p) => ({ ...p, [k]: v }));
  return (
    <>
      <Section title="Portada" description="La portada es tipográfica: un «término de portada» del color del área, nunca una foto de archivo.">
        <div className={styles.grid2}>
          <SelectField label="Área" value={f.area} onChange={(e) => set('area', e.target.value as AreaId)} options={AREA_LIST.map((a) => ({ value: a.id, label: a.name }))} />
          <Slot path="coverTerm">
            <TextField label="Término de portada" value={f.coverTerm} maxLength={16} onChange={(e) => set('coverTerm', e.target.value)} error={err('coverTerm')} hint="Por ejemplo: «Art. 27», «147», «¿A Mercantil?». Hasta 16 caracteres." />
          </Slot>
        </div>
        <Slot path="title">
          <TextField label="Título" required value={f.title} onChange={(e) => set('title', e.target.value)} error={err('title')} placeholder="Cuándo derivar un cliente a Mercantil" />
        </Slot>
        <Slot path="summary">
          <TextArea label="Resumen para las tarjetas" required rows={2} maxLength={220} value={f.summary} onChange={(e) => set('summary', e.target.value)} error={err('summary')} hint="Una frase que invite a leerla." />
        </Slot>
        <p className={styles.metaNote}>
          Lectura estimada: <strong>{formationMinutes(f)} min</strong> · versión {f.version}
        </p>
      </Section>

      <Section title="Introducción y resultados">
        <Slot path="intro">
          <TextArea label="Introducción práctica" required rows={4} value={f.intro} onChange={(e) => set('intro', e.target.value)} error={err('intro')} hint={`Por qué importa, con una situación real de cliente. ${RICH_HINT}`} />
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
                      <TextField label={`Resultado ${i + 1}`} value={o.text} onChange={(e) => update((p) => ({ ...p, outcomes: p.outcomes.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) }))} error={err(`outcomes.${i}`)} placeholder="Identificar cuándo un caso fiscal tiene una derivada mercantil" />
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
      </Section>

      <Section title="Contenido" description="Bloques sencillos en orden de lectura. Ordénalos con las flechas; el ejemplo resuelto es obligatorio.">
        <Slot path="blocks">
          <FieldError message={err('blocks')} />
        </Slot>
        <ol role="list" className={styles.items}>
          <AnimatePresence initial={false}>
            {f.blocks.map((b, i) => {
              const Icon = BLOCK_ICON[b.type];
              return (
                <motion.li key={b.id} {...itemMotion} className={styles.blockCard} data-type={b.type}>
                  <div className={styles.itemHead}>
                    <span className={styles.blockType}>
                      <span className={styles.blockIcon} aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      {BLOCK_LABEL[b.type]} <span className={styles.muted}>· bloque {i + 1}</span>
                    </span>
                    <ItemTools label={`el bloque ${i + 1}`} index={i} count={f.blocks.length} onMove={(to) => update((p) => ({ ...p, blocks: move(p.blocks, i, to) }))} onRemove={() => update((p) => ({ ...p, blocks: p.blocks.filter((x) => x.id !== b.id) }))} />
                  </div>
                  <BlockFields b={b} i={i} update={update} err={err} />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
        <div className={styles.addRow} role="group" aria-label="Añadir bloque">
          <span className={styles.addLabel}>Añadir:</span>
          {ADDABLE.map((t) => {
            const Icon = BLOCK_ICON[t];
            return (
              <AddButton key={t} onClick={() => update((p) => ({ ...p, blocks: [...p.blocks, newBlock(t)] }))}>
                <span className={styles.addInner}>
                  <Icon size={14} aria-hidden="true" /> {BLOCK_LABEL[t]}
                </span>
              </AddButton>
            );
          })}
        </div>
      </Section>

      <Section title="Términos clave" description="Al menos 3. En el texto, enlázalos escribiendo [[término]]: la definición aparecerá al margen.">
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
      </Section>

      <Section title="Idea clave">
        <Slot path="takeaway">
          <TextArea label="La idea que debe quedar" required rows={2} value={f.takeaway} onChange={(e) => set('takeaway', e.target.value)} error={err('takeaway')} hint="Una o dos frases. Se destaca al final de la formación." />
        </Slot>
      </Section>

      <Section title="Fuentes" description="Normas, resoluciones o criterios con su enlace oficial (https://).">
        <Slot path="sources">
          <FieldError message={err('sources')} />
        </Slot>
        <ol role="list" className={styles.items}>
          <AnimatePresence initial={false}>
            {f.sources.map((s, i) => (
              <motion.li key={s.id} {...itemMotion} className={styles.itemCard}>
                <div className={styles.itemHead}>
                  <span className={styles.itemTitle}>Fuente {i + 1}</span>
                  <ItemTools label={`la fuente ${i + 1}`} index={i} count={f.sources.length} min={1} onMove={(to) => update((p) => ({ ...p, sources: move(p.sources, i, to) }))} onRemove={() => update((p) => ({ ...p, sources: p.sources.filter((x) => x.id !== s.id) }))} />
                </div>
                <Slot path={`sources.${i}.label`}>
                  <TextField label="Nombre" value={s.label} onChange={(e) => update((p) => ({ ...p, sources: p.sources.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)) }))} error={err(`sources.${i}.label`)} placeholder="Real Decreto 1007/2023, art. 3" />
                </Slot>
                <div className={styles.grid2}>
                  <Slot path={`sources.${i}.url`}>
                    <TextField label="Enlace" type="url" inputMode="url" value={s.url} onChange={(e) => update((p) => ({ ...p, sources: p.sources.map((x) => (x.id === s.id ? { ...x, url: e.target.value } : x)) }))} error={err(`sources.${i}.url`)} placeholder="https://www.boe.es/…" />
                  </Slot>
                  <TextField label="Fecha de consulta" type="date" value={s.date} onChange={(e) => update((p) => ({ ...p, sources: p.sources.map((x) => (x.id === s.id ? { ...x, date: e.target.value } : x)) }))} />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
        <AddButton onClick={() => update((p) => ({ ...p, sources: [...p.sources, { id: kid('f'), label: '', url: '', date: '' }] }))}>Añadir fuente</AddButton>
      </Section>

      <Notice title="El test final va aparte">
        Prepara sus tres preguntas con la plantilla <Link to="/gestion/nuevo/test">Test</Link> y vincúlalo a esta formación.
      </Notice>
    </>
  );
}

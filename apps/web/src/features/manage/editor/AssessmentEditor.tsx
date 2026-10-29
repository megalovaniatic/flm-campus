import { useMemo } from 'react';
import { Link } from 'react-router';
import { AREA_LIST, AREAS, type AreaId } from '@flm/shared';
import { Notice, SelectField, TextArea } from '@/design';
import { useAssessments, useFormations } from '@/data/selectors';
import { ASSESSMENT_TITLE, assessmentIntro, QUIZ_RULES, type AssessmentForm } from '../forms';
import { areaAssessmentRow, editHref, useContentRows, type ContentRow } from '../model';
import { Section, Slot, type EditorProps } from './fields';
import { QuizEditor, type PoolQuestion } from './QuizEditor';

const LIST = new Intl.ListFormat('es', { type: 'conjunction' });

/**
 * Evaluación del área («Pon a prueba tus conocimientos»): diez preguntas de dificultad media sobre las
 * formaciones del área; se supera con 8. Las preguntas se pueden escribir o importar de los tests de
 * las formaciones del área. Una por área: las áreas que ya tienen la suya se ven, pero no se pueden elegir.
 */
export function AssessmentEditor({ value: f, update, err, ctx }: EditorProps<AssessmentForm>) {
  const formations = useFormations();
  const assessments = useAssessments();
  const rows = useContentRows();
  const pool = useMemo<PoolQuestion[]>(() => {
    const own = formations.filter((x) => x.area === f.area).flatMap((x) => x.quiz.questions.map((question) => ({ key: `${x.id}:${question.id}`, source: x.title, question })));
    const current = assessments.find((a) => a.area === f.area);
    const previous = (current?.quiz.questions ?? []).map((question) => ({ key: `eval:${question.id}`, source: 'Evaluación publicada', question }));
    const seen = new Set<string>();
    return [...previous, ...own].filter((p) => (seen.has(p.question.id) ? false : (seen.add(p.question.id), true)));
  }, [formations, assessments, f.area]);
  // Áreas que ya tienen evaluación (publicada o en borrador), sin contar esta.
  const taken = useMemo(() => {
    const map = new Map<AreaId, ContentRow>();
    for (const a of AREA_LIST) {
      const row = areaAssessmentRow(rows, a.id, ctx.contentId);
      if (row) map.set(a.id, row);
    }
    return map;
  }, [rows, ctx.contentId]);
  const clash = taken.get(f.area);
  const takenNames = AREA_LIST.filter((a) => taken.has(a.id) && a.id !== f.area).map((a) => a.name);

  return (
    <>
      <Section title={ASSESSMENT_TITLE} description="Una evaluación por área, voluntaria y repetible. Aparece en la página del área, después de sus formaciones.">
        {ctx.isRevision ? (
          <Notice title={`Área ${AREAS[f.area].name}`}>Los cambios se guardan aparte: la evaluación publicada no cambia hasta que pulses «Publicar cambios».</Notice>
        ) : (
          <>
            <SelectField
              label="Área"
              value={f.area}
              onChange={(e) => update((p) => ({ ...p, area: e.target.value as AreaId, intro: p.intro === assessmentIntro(p.area) ? assessmentIntro(e.target.value as AreaId) : p.intro }))}
              options={AREA_LIST.map((a) => (a.id !== f.area && taken.has(a.id) ? { value: a.id, label: `${a.name} · ya tiene su evaluación`, disabled: true } : { value: a.id, label: a.name }))}
              hint={takenNames.length ? `${LIST.format(takenNames)} ${takenNames.length === 1 ? 'ya tiene' : 'ya tienen'} su evaluación: para cambiarla, edítala desde Gestión.` : undefined}
            />
            {clash && (
              <Notice tone="warning" title={`El área ${AREAS[f.area].name} ya tiene su evaluación`}>
                {clash.status === 'publicado' ? 'Solo hay una por área: esta no se podrá publicar mientras esa siga publicada.' : 'Ya hay un borrador de evaluación para esta área.'} Elige otra área o{' '}
                <Link to={editHref(clash)}>{clash.status === 'publicado' ? 'edita la que ya existe' : 'sigue con ese borrador'}</Link>.
              </Notice>
            )}
          </>
        )}
        <Slot path="intro">
          <TextArea label="Introducción" required rows={3} value={f.intro} onChange={(e) => update((p) => ({ ...p, intro: e.target.value }))} error={err('intro')} hint="Qué evalúa y cómo se supera, en dos frases." />
        </Slot>
      </Section>
      <QuizEditor quiz={f.quiz} update={(fn) => update((p) => ({ ...p, quiz: fn(p.quiz) }))} err={err} base="quiz" count={QUIZ_RULES.test.count} passMark={QUIZ_RULES.test.passMark} pool={pool} />
    </>
  );
}

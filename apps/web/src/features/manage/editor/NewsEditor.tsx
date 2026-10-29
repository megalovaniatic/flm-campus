import { AREA_LIST, type NewsKind, type Scope } from '@flm/shared';
import { SelectField, TextArea, TextField } from '@/design';
import { NEWS_KIND_ICON } from '../catalog';
import { NEWS_KIND_LABEL, URGENCY_LABEL, type NewsForm, type Urgency } from '../forms';
import { ChoiceGroup, RICH_HINT, Section, Slot, type EditorProps } from './fields';
import styles from './Editor.module.css';

const KIND_HELP: Record<NewsKind, string> = {
  legislacion: 'Leyes, reales decretos, órdenes',
  jurisprudencia: 'Sentencias y autos',
  criterio: 'Consultas de la DGT, AEAT, ICAC…',
  'aviso-interno': 'Comunicación de FLM',
};

/** Noticia de Actualidad: plantilla de los cinco bloques con guía en cada campo. */
export function NewsEditor({ value: f, update, err }: EditorProps<NewsForm>) {
  const set = <K extends keyof NewsForm>(k: K, v: NewsForm[K]) => update((p) => ({ ...p, [k]: v }));
  const len = f.headline.trim().length;
  return (
    <>
      <Section title="Clasificación" description="El tipo, el área y la urgencia se muestran siempre con su nombre escrito.">
        <ChoiceGroup<NewsKind>
          legend="Tipo de novedad"
          variant="cards"
          value={f.kind}
          onChange={(v) => set('kind', v)}
          options={(Object.keys(NEWS_KIND_LABEL) as NewsKind[]).map((k) => {
            const Icon = NEWS_KIND_ICON[k];
            return { value: k, label: NEWS_KIND_LABEL[k], description: KIND_HELP[k], icon: <Icon size={18} /> };
          })}
        />
        <div className={styles.grid2}>
          <SelectField
            label="Área"
            value={f.area}
            onChange={(e) => set('area', e.target.value as Scope)}
            options={[...AREA_LIST.map((a) => ({ value: a.id, label: a.name })), { value: 'general', label: 'Toda la firma (general)' }]}
            hint={f.kind === 'aviso-interno' ? 'Los avisos internos suelen ser para toda la firma.' : undefined}
          />
          <Slot path="date">
            <TextField label="Fecha en el campus" type="date" hint="Con esta fecha aparece en Actualidad." value={f.date} onChange={(e) => set('date', e.target.value)} error={err('date')} />
          </Slot>
        </div>
        <ChoiceGroup<Urgency>
          legend="Urgencia"
          hint="«Urgencia alta» la destaca en Inicio y en Actualidad: resérvala para plazos cercanos."
          value={f.urgency}
          onChange={(v) => set('urgency', v)}
          options={(['alta', 'media', 'informativa'] as Urgency[]).map((u) => ({ value: u, label: URGENCY_LABEL[u] }))}
        />
      </Section>

      <Section title="Titular">
        <Slot path="headline">
          <TextField
            label="Titular"
            required
            value={f.headline}
            onChange={(e) => set('headline', e.target.value)}
            error={err('headline')}
            hint={`Concreto y sin siglas sin explicar. ${len}/110 caracteres.`}
            placeholder="Qué cambia, para quién y desde cuándo"
          />
        </Slot>
      </Section>

      <Section title="Los cinco bloques" description="Escribe para alguien con prisa: frases cortas y una idea por bloque. La vista previa los numera en columna.">
        <Slot path="oneLiner">
          <TextArea
            label="1 · La novedad, en una frase"
            required
            rows={2}
            value={f.oneLiner}
            onChange={(e) => set('oneLiner', e.target.value)}
            error={err('oneLiner')}
            hint="Qué cambia y desde cuándo, sin tecnicismos."
          />
        </Slot>
        <Slot path="affects">
          <TextArea label="2 · A quién afecta" required rows={2} value={f.affects} onChange={(e) => set('affects', e.target.value)} error={err('affects')} hint="Tipo de cliente o de persona (sociedades, autónomos, empleadores…) y en qué casos." />
        </Slot>
        <Slot path="action" className={styles.keySlot}>
          <TextArea
            label="3 · Qué debemos hacer"
            required
            rows={3}
            value={f.action}
            onChange={(e) => set('action', e.target.value)}
            error={err('action')}
            hint={`El bloque más visible: la acción concreta para el equipo de FLM, en imperativo y con plazo si lo hay. ${RICH_HINT}`}
          />
        </Slot>
        <Slot path="example">
          <TextArea label="4 · Un ejemplo sencillo" required rows={3} value={f.example} onChange={(e) => set('example', e.target.value)} error={err('example')} hint="Un caso breve con cifras redondas." />
        </Slot>
        <fieldset className={styles.subfields}>
          <legend className={styles.legend}>5 · Fuente y fecha</legend>
          <Slot path="sourceLabel">
            <TextField
              label="Fuente"
              required
              value={f.sourceLabel}
              onChange={(e) => set('sourceLabel', e.target.value)}
              error={err('sourceLabel')}
              hint={f.kind === 'aviso-interno' ? 'Quién lo comunica: «Dirección de FLM», «Comunicación»…' : 'Norma, resolución o criterio, con su nombre oficial.'}
            />
          </Slot>
          <Slot path="sourceUrl">
            <TextField
              label={f.kind === 'aviso-interno' ? 'Enlace' : 'Enlace oficial'}
              required
              type="text"
              inputMode="url"
              placeholder={f.kind === 'aviso-interno' ? 'https:// o #/participar/agenda/…' : 'https://'}
              value={f.sourceUrl}
              onChange={(e) => set('sourceUrl', e.target.value)}
              error={err('sourceUrl')}
              hint={f.kind === 'aviso-interno' ? 'Un enlace https:// o una página del campus que empiece por #/ (por ejemplo, el evento en la agenda).' : 'Empieza por https:// (BOE, DOGC, sede de la AEAT, CENDOJ…).'}
            />
          </Slot>
          <div className={styles.grid2}>
            <Slot path="publishedOn">
              <TextField label="Publicación" required type="date" value={f.publishedOn} onChange={(e) => set('publishedOn', e.target.value)} error={err('publishedOn')} />
            </Slot>
            <Slot path="effectiveOn">
              <TextField label="Entrada en vigor (opcional)" type="date" value={f.effectiveOn} onChange={(e) => set('effectiveOn', e.target.value)} error={err('effectiveOn')} />
            </Slot>
          </div>
        </fieldset>
      </Section>

      <Section title="Matices" description="Opcional: excepciones, dudas abiertas o criterios que aún pueden cambiar.">
        <TextArea label="Matices (opcional)" rows={3} value={f.nuance} onChange={(e) => set('nuance', e.target.value)} hint={RICH_HINT} />
      </Section>
    </>
  );
}

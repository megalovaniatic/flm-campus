import { AnimatePresence, motion } from 'motion/react';
import { FileCheck, FileUp, LoaderCircle, RefreshCw, X } from 'lucide-react';
import { useId, useRef, useState, type DragEvent } from 'react';
import { AREA_LIST, can, fileSize, formatShortDate, type AreaId, type LibraryDocument } from '@flm/shared';
import { Button, Notice, SelectField, Switch, TextArea, TextField } from '@/design';
import { DOC_KIND_LABEL, type DocumentForm } from '../forms';
import { checkPdf } from '../pdf';
import { FieldError, Section, Slot, type EditorProps } from './fields';
import styles from './Editor.module.css';

type UploadState = { kind: 'idle' } | { kind: 'checking'; name: string } | { kind: 'error'; message: string };

/** Zona de subida: arrastrar o elegir; valida cabecera %PDF-, 15 MB, páginas y miniatura. */
function UploadZone({ form, onFile, onClear, error }: { form: DocumentForm; onFile: (u: NonNullable<DocumentForm['upload']>) => void; onClear: () => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ kind: 'idle' });
  const [over, setOver] = useState(false);
  const hintId = useId();
  const current = [...form.versions].sort((a, b) => b.version - a.version)[0];
  const nextVersion = (current?.version ?? 0) + 1;

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setState({ kind: 'checking', name: file.name });
    const res = await checkPdf(file);
    if (!res.ok) {
      setState({ kind: 'error', message: res.message });
      return;
    }
    setState({ kind: 'idle' });
    onFile({ name: file.name, sizeKb: res.sizeKb, pages: res.pages, thumb: res.thumb, checkedAt: new Date().toISOString() });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    void handle(e.dataTransfer.files?.[0]);
  };

  return (
    <div className={styles.upload}>
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={(e) => {
          void handle(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <AnimatePresence mode="popLayout" initial={false}>
        {form.upload ? (
          <motion.div key="file" className={styles.fileCard} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ type: 'spring', stiffness: 420, damping: 34 }}>
            <span className={styles.fileThumb} aria-hidden="true">
              {form.upload.thumb ? <motion.img src={form.upload.thumb} alt="" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} /> : <FileCheck size={24} />}
            </span>
            <span className={styles.fileInfo}>
              <strong className={styles.fileName}>{form.upload.name}</strong>
              <span className={styles.fileMeta}>
                PDF · {fileSize(form.upload.sizeKb)}
                {form.upload.pages ? ` · ${form.upload.pages} págs.` : ''} · se publicará como versión {nextVersion}
              </span>
              <span className={styles.fileOk}>
                <FileCheck size={14} aria-hidden="true" /> Validado en tu navegador (cabecera PDF y tamaño)
              </span>
            </span>
            <span className={styles.fileActions}>
              <Button size="sm" variant="ghost" icon={<RefreshCw />} onClick={() => input.current?.click()}>
                Cambiar
              </Button>
              <Button size="sm" variant="ghost" icon={<X />} onClick={onClear}>
                Quitar
              </Button>
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="drop"
            className={styles.drop}
            data-over={over || undefined}
            data-invalid={!!error || state.kind === 'error' || undefined}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className={styles.dropIcon} aria-hidden="true">
              {state.kind === 'checking' ? <LoaderCircle className={styles.spin} size={22} /> : <FileUp size={22} />}
            </span>
            <p className={styles.dropTitle}>{current ? `Sustituir el PDF (versión ${nextVersion})` : 'Arrastra aquí el PDF'}</p>
            <p id={hintId} className={styles.dropHint}>
              Solo PDF, hasta 15 MB. {current ? 'La versión vigente y el historial se conservan.' : 'Se comprueba en tu navegador antes de guardarlo.'}
            </p>
            <Button variant="secondary" size="sm" icon={<FileUp />} onClick={() => input.current?.click()} aria-describedby={hintId} disabled={state.kind === 'checking'}>
              {current ? 'Elegir el PDF nuevo' : 'Elegir archivo'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="sr-only" aria-live="polite">
        {state.kind === 'checking' ? `Comprobando «${state.name}»…` : form.upload ? `«${form.upload.name}» validado.` : ''}
      </p>
      {state.kind === 'error' && <FieldError message={state.message} />}
      {state.kind !== 'error' && <FieldError message={error} />}
    </div>
  );
}

export function DocumentEditor({ value: f, update, err, ctx }: EditorProps<DocumentForm>) {
  const set = <K extends keyof DocumentForm>(k: K, v: DocumentForm[K]) => update((p) => ({ ...p, [k]: v }));
  const history = [...f.versions].sort((a, b) => b.version - a.version);
  // Como en la API: la autoría sustituye el PDF de su borrador nunca publicado; en uno publicado, administración,
  // y el PDF nuevo queda pendiente con los cambios (el campus sigue mostrando el vigente hasta publicarlos).
  const canUpload = !ctx.isRevision || can(ctx.role, 'documentos:reemplazar');
  const description = ctx.isRevision
    ? canUpload
      ? 'El PDF nuevo queda pendiente con el resto de los cambios: el campus sigue mostrando el vigente hasta que los publiques, y el anterior queda en el historial.'
      : 'El archivo publicado y su historial de versiones.'
    : history.length
      ? 'Sustituir el archivo crea una versión nueva al publicar; las anteriores quedan en el historial.'
      : 'Sube el documento original. El PDF se valida antes de guardarlo.';
  return (
    <>
      <Section title="Archivo PDF" description={description}>
        {canUpload ? (
          <Slot path="upload">
            <UploadZone form={f} error={err('upload')} onFile={(u) => set('upload', u)} onClear={() => update((p) => ({ ...p, upload: undefined, versionNote: '' }))} />
          </Slot>
        ) : (
          <Notice title="El PDF lo sustituye administración">Puedes cambiar la ficha del documento. Si hay que sustituir el archivo, pídeselo a administración: la versión anterior se conserva en el historial.</Notice>
        )}
        {f.upload && (
          <TextField label="Qué cambia en esta versión (opcional)" value={f.versionNote} onChange={(e) => set('versionNote', e.target.value)} hint="Aparece en el historial: «Corrige el calendario de la página 3»." maxLength={160} />
        )}
        {history.length > 0 && (
          <div className={styles.history}>
            <p className={styles.legend}>Historial publicado</p>
            <ol role="list">
              {history.map((v, i) => (
                <li key={v.version}>
                  <span className={styles.vBadge}>v{v.version}</span>
                  <span>
                    {i === 0 ? 'Vigente' : 'Anterior'} · {formatShortDate(v.uploadedAt.slice(0, 10))} · {fileSize(v.sizeKb)}
                    {v.pages ? ` · ${v.pages} págs.` : ''}
                    {v.note ? ` · ${v.note}` : ''}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Section>

      <Section title="Metadatos" description="Lo que se ve en la ficha de Consultar › Notas informativas.">
        <Slot path="title">
          <TextField label="Título" required value={f.title} onChange={(e) => set('title', e.target.value)} error={err('title')} hint="El título del documento original, completo." />
        </Slot>
        <div className={styles.grid2}>
          <SelectField label="Tipo de documento" value={f.kind} onChange={(e) => set('kind', e.target.value as LibraryDocument['kind'])} options={(Object.keys(DOC_KIND_LABEL) as LibraryDocument['kind'][]).map((k) => ({ value: k, label: DOC_KIND_LABEL[k] }))} />
          <SelectField label="Área" value={f.area} onChange={(e) => set('area', e.target.value as AreaId | 'general')} options={[...AREA_LIST.map((a) => ({ value: a.id, label: a.name })), { value: 'general', label: 'General (varias áreas)' }]} />
        </div>
        <div className={styles.grid2}>
          <Slot path="issuer">
            <TextField label="Emisor" required value={f.issuer} onChange={(e) => set('issuer', e.target.value)} error={err('issuer')} hint="Quién firma el original: «FLM · Área Fiscal», «ICAC»…" />
          </Slot>
          <Slot path="date">
            <TextField label="Fecha del documento" required type="date" value={f.date} onChange={(e) => set('date', e.target.value)} error={err('date')} />
          </Slot>
        </div>
        <Slot path="summary">
          <TextArea label="Resumen" required rows={4} maxLength={700} value={f.summary} onChange={(e) => set('summary', e.target.value)} error={err('summary')} hint="Qué explica y para qué le sirve al equipo. Dos o tres frases." />
        </Slot>
        <TextField label="Etiquetas (opcional)" value={f.tags} onChange={(e) => set('tags', e.target.value)} hint="Separadas por comas: «IVA, vehículos, Tribunal Supremo». Ayudan a la búsqueda." />
        <TextArea label="Aviso editorial (opcional)" rows={2} value={f.notice} onChange={(e) => set('notice', e.target.value)} hint="Visible sobre la ficha: por ejemplo, si parte del contenido puede haber quedado desfasado." />
        {ctx.isAdmin && (
          <Switch
            label="Se puede mostrar en la demostración pública"
            description="Solo documentos propios de FLM o con permiso de distribución. En esta demostración los PDF subidos no se publican: quedan «disponibles en la versión interna»."
            checked={f.publicDemo}
            onChange={(v) => set('publicDemo', v)}
          />
        )}
      </Section>
    </>
  );
}

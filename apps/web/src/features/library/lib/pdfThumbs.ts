/**
 * Miniaturas REALES de la primera página de cada PDF, renderizadas con pdf.js.
 *
 * - pdf.js (y su worker) se cargan de forma perezosa: solo cuando la primera miniatura
 *   entra en pantalla en «Notas informativas».
 * - Se pide solo lo necesario para la página 1 (peticiones parciales, sin precarga).
 * - Caché en memoria por archivo durante la sesión: al volver a la lista, aparecen al instante.
 * - Como máximo dos renderizados a la vez, para no competir con la interfaz.
 */
import type { PDFWorker } from 'pdfjs-dist';

export interface Thumb {
  /** URL de objeto (JPEG) de la miniatura. */
  src: string;
  /** Alto / ancho de la página. */
  ratio: number;
}

type Pdfjs = typeof import('pdfjs-dist');

/** Ancho de render: nítido en pantallas de alta densidad sin pesar demasiado. */
const RENDER_WIDTH = 480;
const MAX_PARALLEL = 2;

let lib: Promise<Pdfjs> | null = null;
let worker: PDFWorker | null = null;
const ready = new Map<string, Thumb>();
const pending = new Map<string, Promise<Thumb>>();
let running = 0;
const waiting: (() => void)[] = [];

function loadPdfjs(): Promise<Pdfjs> {
  if (!lib) {
    const loading = import('pdfjs-dist').then((m) => {
      m.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      return m;
    });
    loading.catch(() => {
      lib = null;
    });
    lib = loading;
  }
  return lib;
}

async function withSlot<T>(task: () => Promise<T>): Promise<T> {
  if (running >= MAX_PARALLEL) await new Promise<void>((resolve) => waiting.push(resolve));
  running++;
  try {
    return await task();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

async function renderFirstPage(url: string): Promise<Thumb> {
  const pdfjs = await loadPdfjs();
  worker ??= new pdfjs.PDFWorker({ verbosity: pdfjs.VerbosityLevel.ERRORS });
  const task = pdfjs.getDocument({
    url,
    worker,
    disableAutoFetch: true,
    disableStream: true,
    enableXfa: false,
    verbosity: pdfjs.VerbosityLevel.ERRORS,
  });
  try {
    const doc = await task.promise;
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: RENDER_WIDTH / base.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvas, viewport, annotationMode: pdfjs.AnnotationMode.DISABLE }).promise;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
    const src = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/jpeg', 0.86);
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
    return { src, ratio: base.height / base.width };
  } finally {
    // Libera el documento en el worker (el worker compartido sigue vivo para las demás miniaturas).
    void task.destroy();
  }
}

/** Miniatura ya disponible en caché (para pintarla sin esperar). */
export function peekThumb(url: string): Thumb | null {
  return ready.get(url) ?? null;
}

/** Miniatura de la primera página (comparte el trabajo entre peticiones del mismo archivo). */
export function getThumb(url: string): Promise<Thumb> {
  const done = ready.get(url);
  if (done) return Promise.resolve(done);
  let job = pending.get(url);
  if (!job) {
    job = withSlot(() => renderFirstPage(url)).then(
      (thumb) => {
        ready.set(url, thumb);
        pending.delete(url);
        return thumb;
      },
      (error: unknown) => {
        pending.delete(url);
        throw error;
      },
    );
    pending.set(url, job);
  }
  return job;
}

/** Adelanta la descarga de pdf.js cuando el navegador está desocupado (solo en esta página). */
export function warmUpPdfjs() {
  const start = () => void loadPdfjs().catch(() => undefined);
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(start, { timeout: 2500 });
  else setTimeout(start, 800);
}

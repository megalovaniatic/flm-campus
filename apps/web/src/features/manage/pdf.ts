/**
 * Validación de PDF en el navegador (sin subir nada):
 *  1. cabecera mágica «%PDF-» leída con FileReader;
 *  2. tamaño máximo de 15 MB;
 *  3. número de páginas y miniatura real de la primera página con pdf.js (carga perezosa).
 */
import { MESSAGES } from '@/lib/messages';

export const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

function readBytes(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error('No se ha podido leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
}

export type PdfCheck = { ok: true; sizeKb: number; pages?: number; thumb?: string } | { ok: false; message: string };

export async function checkPdf(file: File): Promise<PdfCheck> {
  let head: Uint8Array;
  try {
    head = new Uint8Array(await readBytes(file.slice(0, MAGIC.length)));
  } catch {
    return { ok: false, message: `No se ha podido leer «${file.name}». Vuelve a intentarlo o elige otro archivo.` };
  }
  if (head.length < MAGIC.length || MAGIC.some((b, i) => head[i] !== b)) return { ok: false, message: MESSAGES.unsupportedFile(file.name) };
  if (file.size > MAX_PDF_BYTES) return { ok: false, message: MESSAGES.oversized(file.name, '15 MB') };
  const sizeKb = Math.max(1, Math.round(file.size / 1024));
  try {
    const data = await readBytes(file);
    const info = await inspectPdf(data);
    return { ok: true, sizeKb, ...info };
  } catch {
    return { ok: true, sizeKb };
  }
}

/** Páginas y miniatura de la primera página. Si pdf.js falla, el PDF sigue siendo válido. */
async function inspectPdf(data: ArrayBuffer): Promise<{ pages?: number; thumb?: string }> {
  try {
    const [pdfjs, worker] = await Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const task = pdfjs.getDocument({ data: new Uint8Array(data) });
    const doc = await task.promise;
    const pages = doc.numPages;
    let thumb: string | undefined;
    try {
      const page = await doc.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: 220 / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvas, viewport }).promise;
      thumb = canvas.toDataURL('image/webp', 0.7);
      if (!thumb.startsWith('data:image/webp')) thumb = canvas.toDataURL('image/jpeg', 0.72);
    } catch {
      thumb = undefined;
    }
    await task.destroy();
    return { pages, thumb };
  } catch {
    return {};
  }
}

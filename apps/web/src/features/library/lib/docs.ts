import { fileSize, type DocumentVersion, type LibraryDocument } from '@flm/shared';
import { asset } from '@/lib/download';

/** Versión vigente: la de número más alto (la última del historial). */
export function currentVersion(doc: LibraryDocument): DocumentVersion | undefined {
  let best: DocumentVersion | undefined;
  for (const v of doc.versions) if (!best || v.version > best.version) best = v;
  return best;
}

/** En la demostración pública solo se enlazan los PDF autorizados; en la versión interna, todos. */
export const isAvailable = (doc: LibraryDocument) => !__DEMO__ || doc.publicDemo;

export const fileUrl = (v: DocumentVersion) => asset(v.file);

export const fileName = (v: DocumentVersion) => v.file.split('/').pop() || 'documento.pdf';

/** «PDF · 239 KB» */
export const formatLabel = (v: DocumentVersion) => `PDF · ${fileSize(v.sizeKb)}`;

/** Las presentaciones y el material de eventos suelen ser apaisados. */
export const isLandscape = (doc: LibraryDocument) => doc.kind === 'presentacion' || doc.kind === 'material-evento';

/** Historial de versiones de la más reciente a la más antigua. */
export const versionsNewestFirst = (doc: LibraryDocument) => [...doc.versions].sort((a, b) => b.version - a.version);

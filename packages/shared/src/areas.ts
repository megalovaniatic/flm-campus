/**
 * Las cuatro áreas profesionales del campus.
 * Fiscal, Laboral y Mercantil se corresponden con las iniciales del logotipo
 * (sistema de departamentos de FLM); Contable se añade con su inicial «C».
 */
export const AREA_IDS = ['fiscal', 'laboral', 'mercantil', 'contable'] as const;
export type AreaId = (typeof AREA_IDS)[number];

export interface AreaInfo {
  id: AreaId;
  name: string;
  /** Inicial que se muestra en el círculo del selector de áreas. */
  initial: string;
  /** Nombre en mayúsculas, como en las cápsulas de departamento de FLM. */
  capsule: string;
  /** Frase breve que describe el área en el campus. */
  description: string;
}

export const AREAS: Record<AreaId, AreaInfo> = {
  fiscal: {
    id: 'fiscal',
    name: 'Fiscal',
    initial: 'F',
    capsule: 'FISCAL',
    description: 'Impuestos, obligaciones formales y procedimientos ante la Administración tributaria.',
  },
  laboral: {
    id: 'laboral',
    name: 'Laboral',
    initial: 'L',
    capsule: 'LABORAL',
    description: 'Contratación, jornada, extinción de contratos y Seguridad Social.',
  },
  mercantil: {
    id: 'mercantil',
    name: 'Mercantil',
    initial: 'M',
    capsule: 'MERCANTIL',
    description: 'Sociedades, órganos de gobierno, operaciones societarias y situaciones concursales.',
  },
  contable: {
    id: 'contable',
    name: 'Contable',
    initial: 'C',
    capsule: 'CONTABLE',
    description: 'Registro, valoración y cierre contable conforme al Plan General de Contabilidad.',
  },
};

export const AREA_LIST: AreaInfo[] = AREA_IDS.map((id) => AREAS[id]);

/** Ámbito de un contenido: un área o «toda la firma» (avisos internos, documentos generales). */
export type Scope = AreaId | 'general';

/** Nombre visible de un ámbito («Fiscal», «Toda la firma»…). */
export function areaName(scope: Scope): string {
  return scope === 'general' ? 'Toda la firma' : AREAS[scope].name;
}

export function isAreaId(value: unknown): value is AreaId {
  return typeof value === 'string' && (AREA_IDS as readonly string[]).includes(value);
}

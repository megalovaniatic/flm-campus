/**
 * «Ponte al día» de la DEMOSTRACIÓN: nuevos clientes y bienvenidas al equipo.
 *
 * - Los clientes son empresas INVENTADAS para la demo (marcadas como ficticias): nombre, sector,
 *   país de origen y el área de FLM que lleva el encargo.
 * - Las bienvenidas son a personas FICTICIAS de la plantilla de ejemplo. Solo el anuncio tiene
 *   fecha: las fichas de las personas no guardan fecha de incorporación.
 */
import type { EditorialMeta, NewClient, Welcome } from '@flm/shared';

const editorial = (date: string): EditorialMeta => ({
  status: 'publicado',
  authorId: 'p-laura-gil',
  publishedAt: `${date}T09:00:00.000Z`,
  review: { state: 'revisado' },
});

export const clients: NewClient[] = [
  {
    id: 'cl-polderzon',
    name: 'Polderzon Energie BV',
    sector: 'Energía solar para naves industriales',
    country: 'Países Bajos',
    area: 'mercantil',
    date: '2026-10-28',
    summary: 'Abre filial en Barcelona: constitución de la sociedad y pacto de socios.',
    fictional: true,
    editorial: editorial('2026-10-28'),
  },
  {
    id: 'cl-atelier-lunaire',
    name: 'Atelier Lunaire Textiles',
    sector: 'Moda y textil técnico',
    country: 'Francia',
    area: 'fiscal',
    date: '2026-10-27',
    summary: 'Empieza a vender en España: IVA en ventas a distancia y facturación electrónica.',
    fictional: true,
    editorial: editorial('2026-10-27'),
  },
  {
    id: 'cl-kestrelwerk',
    name: 'Kestrelwerk Robotik GmbH',
    sector: 'Robótica industrial',
    country: 'Alemania',
    area: 'laboral',
    date: '2026-10-23',
    summary: 'Desplaza a seis técnicos a Granollers: contratos y desplazamiento transnacional.',
    fictional: true,
    editorial: editorial('2026-10-23'),
  },
  {
    id: 'cl-azulejo-atlantico',
    name: 'Azulejo Atlântico, Lda.',
    sector: 'Cerámica y materiales de construcción',
    country: 'Portugal',
    area: 'contable',
    date: '2026-10-21',
    summary: 'Sucursal en Vic: contabilidad y cierre de su primer ejercicio en España.',
    fictional: true,
    editorial: editorial('2026-10-21'),
  },
  {
    id: 'cl-tlali',
    name: 'Grupo Tlali Alimentos',
    sector: 'Alimentación y bebidas',
    country: 'México',
    area: 'mercantil',
    date: '2026-10-16',
    summary: 'Distribución en Europa: contrato de agencia y registro de marca.',
    fictional: true,
    editorial: editorial('2026-10-16'),
  },
  {
    id: 'cl-maple-quill',
    name: 'Maple & Quill Software',
    sector: 'Software para despachos profesionales',
    country: 'Canadá',
    area: 'general',
    date: '2026-10-09',
    summary: 'Centro de desarrollo en Barcelona: sociedad, nóminas y deducciones por I+D.',
    fictional: true,
    editorial: editorial('2026-10-09'),
  },
];

export const welcomes: Welcome[] = [
  {
    id: 'bv-noelia-fuentes',
    personId: 'p-noelia-fuentes',
    date: '2026-10-26',
    message: 'Se suma al Área Contable en Barcelona para reforzar los cierres de fin de año.',
    editorial: editorial('2026-10-26'),
  },
  {
    id: 'bv-hector-gimenez',
    personId: 'p-hector-gimenez',
    date: '2026-10-19',
    message: 'Refuerza el Área Laboral en Granollers: nóminas, contratos y trámites con la Seguridad Social.',
    editorial: editorial('2026-10-19'),
  },
  {
    id: 'bv-pau-camps',
    personId: 'p-pau-camps',
    date: '2026-10-05',
    message: 'Llega al Área Fiscal en Barcelona, con foco en IVA y facturación electrónica.',
    editorial: editorial('2026-10-05'),
  },
];

/**
 * Países de origen de los clientes («Ponte al día»): nombre en castellano y código ISO 3166-1 alfa-2.
 * Una sola lista para el esquema, el creador y el tablero de Inicio.
 */
export const COUNTRIES = [
  { code: 'DE', name: 'Alemania' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CA', name: 'Canadá' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'AE', name: 'Emiratos Árabes Unidos' },
  { code: 'ES', name: 'España' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'FR', name: 'Francia' },
  { code: 'GR', name: 'Grecia' },
  { code: 'IN', name: 'India' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italia' },
  { code: 'JP', name: 'Japón' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MA', name: 'Marruecos' },
  { code: 'MX', name: 'México' },
  { code: 'NO', name: 'Noruega' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'PE', name: 'Perú' },
  { code: 'PL', name: 'Polonia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'RO', name: 'Rumanía' },
  { code: 'SE', name: 'Suecia' },
  { code: 'CH', name: 'Suiza' },
  { code: 'TR', name: 'Turquía' },
  { code: 'UY', name: 'Uruguay' },
] as const;

export type CountryName = (typeof COUNTRIES)[number]['name'];

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name) as [CountryName, ...CountryName[]];

/** Código ISO de un país de la lista (o undefined si no está). */
export function countryCode(name: string): string | undefined {
  return COUNTRIES.find((c) => c.name === name)?.code;
}

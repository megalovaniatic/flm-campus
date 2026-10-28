/**
 * Exportación CSV compatible con Excel en castellano: separador «;», BOM UTF-8 y saltos CRLF.
 * Neutraliza la inyección de fórmulas (celdas que empiezan por =, +, -, @, tabulador o retorno).
 */
export type CsvValue = string | number | boolean | null | undefined;

function cell(value: CsvValue): string {
  if (value === null || value === undefined) return '';
  let text = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[";\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  return `﻿${[headers, ...rows].map((row) => row.map(cell).join(';')).join('\r\n')}\r\n`;
}

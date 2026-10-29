import { formatLongDate, monthShort, number, weekdayMondayFirst, weekdayName } from '@flm/shared';

/** «12/06/2009». */
export const fechaCorta = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}/${key.slice(0, 4)}`;

/** «miércoles, 31 de marzo de 2027». */
export const fechaConDia = (key: string) => `${weekdayName(weekdayMondayFirst(key))}, ${formatLongDate(key)}`;

/** «31 mar 2027». */
export const fechaBreve = (key: string) => `${Number(key.slice(8, 10))} ${monthShort(Number(key.slice(5, 7)))} ${key.slice(0, 4)}`;

/** Fecha de una línea de tiempo: si es clave AAAA-MM-DD, «12 de febrero de 2012»; si no, el texto tal cual. */
export const fechaLibre = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? formatLongDate(value) : value);

/** Días con dos decimales: «606,75». */
export const dias2 = (n: number) => number(n, 2);

/** «1 día» / «12 días». */
export const diasTexto = (n: number) => (Math.abs(n) === 1 ? '1 día' : `${number(n)} días`);

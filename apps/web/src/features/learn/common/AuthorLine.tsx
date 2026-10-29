import { AUTHOR_SEPARATOR, authorLine, authorParts, type AuthorLike } from '@flm/shared';
import styles from './AuthorLine.module.css';

/**
 * Separador a la vista: el espacio de antes de la raya no parte línea, para que la raya nunca la
 * empiece. Si no cabe en una, se parte tras la raya y el puesto pasa entero a la siguiente
 * («Judith Calet —» / «Asesora Contable»).
 */
const VISIBLE_SEPARATOR = AUTHOR_SEPARATOR.replace(/^ /, ' ');

/**
 * Firma de la persona autora de una formación o de su test, en una sola línea:
 * «Judith Calet — Asesora Contable» (`authorLine`, con el nombre y el puesto de su ficha).
 *
 * Es la única forma de mostrarla en Aprender (cabecera de la formación, notas al margen del test)
 * y en la vista previa del editor. Cada sitio pone su tipografía (`nameClassName`, `roleClassName`):
 * el nombre destaca y la raya con el puesto va en el tono secundario. El lector de pantalla oye la
 * línea entera una sola vez; las piezas con estilo quedan ocultas para él.
 *
 * La firma neutra («Área Fiscal de FLM») no pasa por aquí: va tal cual, sin puesto.
 */
export function AuthorLine({ person, className, nameClassName, roleClassName }: { person: AuthorLike; className?: string; nameClassName?: string; roleClassName?: string }) {
  const { name, position } = authorParts(person);
  return (
    <span className={[styles.line, className ?? ''].join(' ').trim()}>
      <span className="sr-only">{authorLine(person)}</span>
      <span aria-hidden="true">
        <span className={nameClassName}>{name}</span>
        {position && (
          <span className={[styles.role, roleClassName ?? ''].join(' ').trim()}>
            {VISIBLE_SEPARATOR}
            <span className={styles.position}>{position}</span>
          </span>
        )}
      </span>
    </span>
  );
}

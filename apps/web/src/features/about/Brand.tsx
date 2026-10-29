import { BadgeCheck, PenLine } from 'lucide-react';
import { Chip } from '@/design';
import { Logo, type LogoVariant } from '@/layout/Logo';
import { asset } from '@/lib/download';
import { DossierSection, SubHead } from './Section';
import styles from './Brand.module.css';

const LOGOS: { variant: LogoVariant; file: string; use: string; height: number }[] = [
  { variant: 'horizontal', file: 'FLM-Horizontal.png', use: 'Cabecera del campus', height: 36 },
  { variant: 'crowe', file: 'logo-hor-FLM-Crowe.png', use: 'Pie y pantalla de acceso; la mención va siempre en inglés, sin traducir', height: 36 },
  { variant: 'diagonal', file: 'FLM-Diagonal.png', use: 'Página no encontrada; su geometría inspira los puentes', height: 72 },
  { variant: 'vertical', file: 'FLM-Vertical.png', use: 'Reservado para formatos verticales', height: 72 },
  { variant: 'fiscal', file: 'FLM - Fiscal.png', use: 'Sello del área al superar su evaluación', height: 26 },
  { variant: 'laboral', file: 'FLM - Laboral.png', use: 'Sello del área al superar su evaluación', height: 26 },
  { variant: 'mercantil', file: 'FLM - Mercantil.png', use: 'Sello del área al superar su evaluación', height: 26 },
];

interface Swatch {
  name: string;
  hex: string;
  token: string;
  source: string;
  use: string;
}

const COLORS: Swatch[] = [
  { name: 'Rojo FLM', hex: '#E53327', token: '--flm-rojo', source: 'Logotipo (muestreo de los PNG oficiales)', use: 'Puntos, trazos y gráficos; área Fiscal; en texto, solo a partir de 24 px' },
  { name: 'Rojo de la web', hex: '#E22F29', token: '--flm-rojo-web', source: 'variables.css de flmexperts.com', use: 'Referencia; no se usa en texto' },
  { name: 'Rojo oscuro', hex: '#90101A', token: '--flm-rojo-oscuro', source: 'variables.css de flmexperts.com', use: 'Texto rojo pequeño y botón de peligro' },
  { name: 'Burdeos', hex: '#84343D', token: '--flm-burdeos', source: 'Cápsula oficial LABORAL (PNG)', use: 'Área Laboral' },
  { name: 'Marino FLM', hex: '#172641', token: '--flm-marino', source: 'Logotipo (muestreo de los PNG oficiales)', use: 'Tinta principal, acción principal y área Mercantil' },
  { name: 'Azul de la web', hex: '#1F2F4A', token: '--flm-azul', source: 'variables.css de flmexperts.com', use: 'Acción principal al pasar el puntero' },
  { name: 'Negro de la web', hex: '#081225', token: '--flm-negro', source: 'variables.css de flmexperts.com', use: 'Fondo del modo oscuro' },
  { name: 'Crema de la web', hex: '#EFEBE4', token: '--flm-crema', source: 'variables.css de flmexperts.com', use: 'Superficies hundidas' },
  { name: 'Gris de la web', hex: '#4F5661', token: '--flm-gris', source: 'variables.css de flmexperts.com', use: 'Texto secundario' },
];

const LEDGER: { item: string; detail: string; source: string; verified: boolean }[] = [
  { item: 'Logotipos', detail: 'Horizontal, con Crowe, vertical, diagonal, cápsulas de área y pieza de redes. Se usan tal cual, sin recolorear ni recomponer.', source: 'Archivos originales aportados por FLM', verified: true },
  { item: 'Colores', detail: 'Los nueve valores de la tabla anterior.', source: 'PNG oficiales y variables.css de flmexperts.com', verified: true },
  { item: 'Tipografías de la web', detail: 'Inter (general) y Belleza (destacados).', source: 'variables.css de flmexperts.com', verified: true },
  { item: 'Trayectoria y sedes', detail: '«Desde 1921»; Barcelona, Vic y Granollers.', source: 'flmexperts.com', verified: true },
  { item: 'Mención de Crowe Global', detail: '«A business associate of Crowe Global», solo con el archivo oficial que la incluye.', source: 'Archivo oficial y directorio de Crowe Global', verified: true },
  { item: 'Newsreader', detail: 'Titulares y lectura larga, con cortes ópticos de 6 a 72.', source: 'Propuesta del campus (licencia SIL OFL)', verified: false },
  { item: 'Gramática de formas', detail: 'Círculo, cápsula, puente y rectángulo con significado fijo.', source: 'Lectura del comportamiento del logotipo', verified: false },
  { item: 'Tratamiento de áreas', detail: 'Cada área toma la meseta de color de su cápsula oficial y siempre se nombra por escrito.', source: 'Lectura de las cápsulas FISCAL, LABORAL y MERCANTIL', verified: false },
  { item: 'Contable', detail: 'La rampa completa del degradado, «la suma de las tres». No tiene letra ni cápsula propias: no se inventan.', source: 'No existe una cápsula oficial de Contable', verified: false },
  { item: 'Neutros y modo oscuro', detail: 'Papel, superficies y tintes accesibles derivados de los colores oficiales.', source: 'Decisión de diseño del campus', verified: false },
];

export function Brand() {
  return (
    <DossierSection id="marca" number="02" eyebrow="Marca" title="Verificado frente a propuesto" lede="La marca no se toca; se usa. Esto es lo que procede de los archivos y la web de FLM, y lo que propone el campus.">
      <SubHead hint="Archivos PNG originales con transparencia. En modo oscuro se apoyan en una placa clara, porque no existe versión en negativo.">Logotipos oficiales</SubHead>
      <ul role="list" className={styles.logos}>
        {LOGOS.map((l) => (
          <li key={l.variant} className={styles.logo}>
            <span className={styles.logoArt}>
              <Logo variant={l.variant} height={l.height} />
            </span>
            <span className={styles.logoFile}>{l.file}</span>
            <span className={styles.logoUse}>{l.use}</span>
          </li>
        ))}
        <li className={styles.logo}>
          <span className={styles.logoArt}>
            <img src={asset('brand/flm-redes.png')} alt="Pieza oficial de FLM para redes" width={72} height={72} className={styles.redes} loading="lazy" decoding="async" />
          </span>
          <span className={styles.logoFile}>FLM-Horizontal Redes.png</span>
          <span className={styles.logoUse}>Pantalla de acceso, completa y sin recortar</span>
        </li>
      </ul>

      <SubHead hint="Valores medidos en los PNG oficiales y en la hoja variables.css de flmexperts.com. El campus no añade colores nuevos.">Colores de marca</SubHead>
      <ul role="list" className={styles.swatches}>
        {COLORS.map((c) => (
          <li key={c.token} className={styles.swatch}>
            <span className={styles.chip} style={{ background: `var(${c.token})` }} aria-hidden="true" />
            <span className={styles.swName}>{c.name}</span>
            <span className={styles.swHex}>
              {c.hex} <code>{c.token}</code>
            </span>
            <span className={styles.swSource}>{c.source}</span>
            <span className={styles.swUse}>{c.use}</span>
          </li>
        ))}
      </ul>
      <div className={styles.gradientRow}>
        <span className={styles.gradientBar} aria-hidden="true" />
        <p>
          <strong>Degradado del logotipo</strong>, muestreado en el archivo oficial: rojo → burdeos → marino. Solo en trazos, anillos, filetes y conectores, y como máximo en un 2–3 % de la pantalla.
        </p>
      </div>

      <SubHead hint="Las dos tipografías de flmexperts.com, autoalojadas en el campus.">Tipografías de la web</SubHead>
      <div className={styles.types}>
        <div className={styles.type}>
          <p className={styles.typeSampleInter}>Inter</p>
          <p className={styles.typeText}>Tipografía general de la web. En el campus: interfaz, formularios, metadatos y cifras tabulares (0123456789).</p>
        </div>
        <div className={styles.type}>
          <p className={styles.typeSampleBelleza}>Explicamos</p>
          <p className={styles.typeText}>Belleza, la de los destacados de la web y de la serie «Explicamos» de LinkedIn. Uso restringido al recuadro «Explicamos» de las formaciones.</p>
        </div>
        <div className={styles.type}>
          <p className={styles.typeSampleNews}>Newsreader</p>
          <p className={styles.typeText}>
            <strong>Propuesta del campus</strong> para titulares y lectura larga: rigor de publicación profesional y cortes ópticos para cada tamaño.
          </p>
        </div>
      </div>

      <SubHead>Resumen: qué es de FLM y qué propone el campus</SubHead>
      <div className={styles.tableWrap}>
        <table role="table" className={styles.table}>
          <caption className="sr-only">Elementos de marca verificados y propuestas del campus, con su fuente</caption>
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">
                Elemento
              </th>
              <th role="columnheader" scope="col">
                Detalle
              </th>
              <th role="columnheader" scope="col">
                Fuente
              </th>
              <th role="columnheader" scope="col">
                Estado
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {LEDGER.map((r) => (
              <tr role="row" key={r.item} data-verified={r.verified}>
                <th role="rowheader" scope="row">
                  {r.item}
                </th>
                <td role="cell">{r.detail}</td>
                <td role="cell" className={styles.source}>
                  <span className={styles.cellLabel} aria-hidden="true">
                    Fuente:{' '}
                  </span>
                  {r.source}
                </td>
                <td role="cell" className={styles.status}>
                  {r.verified ? (
                    <Chip tone="success" icon={<BadgeCheck size={14} />} size="sm">
                      Verificado
                    </Chip>
                  ) : (
                    <Chip tone="info" icon={<PenLine size={14} />} size="sm">
                      Propuesta
                    </Chip>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DossierSection>
  );
}

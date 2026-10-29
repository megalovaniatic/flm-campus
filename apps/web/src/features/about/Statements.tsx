import { CircleCheck, Cookie, FlaskConical, Globe, HardDrive, Image, Lock, Mail, Server, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { participation } from '@flm/content';
import { MESSAGES } from '@/lib/messages';
import { DossierSection, SubHead } from './Section';
import styles from './Statements.module.css';

/* ── 05 · Accesibilidad ────────────────────────────────────────────────── */

export function Accessibility() {
  return (
    <DossierSection id="accesibilidad" number="05" eyebrow="Accesibilidad" title="Declaración de accesibilidad" lede="Objetivo: cumplir las pautas WCAG 2.2 en el nivel AA en todo el campus.">
      <div className={styles.columns}>
        <div className={styles.column}>
          <h3 className={styles.colTitle}>Cómo está construido</h3>
          <ul className={styles.list}>
            <li>Estructura semántica: un único titular por página, encabezados en orden, regiones y migas.</li>
            <li>Todo se usa con teclado; el foco es siempre visible (doble anillo que sigue la forma) y la cabecera fija no lo tapa.</li>
            <li>Objetivos táctiles de 44 px como mínimo y nada que dependa solo de pasar el puntero.</li>
            <li>Contraste de 4,5:1 en texto normal; el rojo del logotipo nunca se usa en texto pequeño.</li>
            <li>El color nunca va solo: áreas, estados y tipos se nombran por escrito y con icono o forma.</li>
            <li>Resultados, guardados y avisos se anuncian a los lectores de pantalla.</li>
            <li>Movimiento reducido según tu sistema o tu ajuste, modo oscuro y alto contraste de Windows.</li>
            <li>Atajos de una sola tecla desactivables (criterio 2.1.4) e idioma de la página en español de España.</li>
          </ul>
        </div>
        <div className={styles.column}>
          <h3 className={styles.colTitle}>Cómo se comprueba</h3>
          <ul className={styles.list}>
            <li>
              Cada sección se revisa con teclado, con el árbol de accesibilidad del navegador y a 360, 390 y 1440 px de ancho, en modo claro y oscuro y con el movimiento reducido.
            </li>
            <li>
              El contraste de los colores del tema activo se calcula en vivo en <Link to="/sobre#sistema">«Sistema de diseño»</Link>.
            </li>
            <li>En cada publicación se comprueban automáticamente los tipos, las reglas de negocio (fechas, permisos y progreso) y la estructura de los contenidos.</li>
          </ul>
          <p className={styles.pending}>
            <strong>Pendiente antes de la puesta en marcha:</strong> auditoría con lectores de pantalla (NVDA y VoiceOver), análisis automático con axe y una prueba con personas del equipo.
          </p>
        </div>
        <div className={styles.column}>
          <h3 className={styles.colTitle}>Limitaciones conocidas</h3>
          <ul className={styles.list}>
            <li>Las notas informativas son los PDF originales de FLM y pueden no estar etiquetados; su ficha incluye un resumen accesible.</li>
            <li>Los logotipos son imágenes PNG (no hay vectores oficiales todavía): en el modo de alto contraste conservan sus colores.</li>
            <li>Los vídeos y perfiles externos (YouTube, LinkedIn, Instagram) dependen de la accesibilidad de cada plataforma.</li>
          </ul>
        </div>
      </div>
      <p className={styles.contact}>
        <Mail size={16} aria-hidden="true" />
        <span>
          ¿Has encontrado una barrera? Escribe al buzón de sugerencias, <a href={`mailto:${participation.contacts.suggestions}?subject=${encodeURIComponent('Accesibilidad del campus')}`}>{participation.contacts.suggestions}</a>, con la página y lo que ha pasado. Lo revisaremos y te contestaremos.
        </span>
      </p>
    </DossierSection>
  );
}

/* ── 06 · Privacidad ───────────────────────────────────────────────────── */

const PRINCIPLES = [
  {
    icon: UserRound,
    title: 'Datos profesionales y del calendario',
    text: 'Nombre, correo corporativo, puesto, departamento y sede. Para el calendario de empresa, el día y el mes del cumpleaños (nunca el año de nacimiento) y la fecha de incorporación: solo los que da la persona o administración, nunca inventados.',
  },
  { icon: Image, title: 'Fotografías reales', text: 'Solo las aportadas por FLM, también las de las portadas de Aprender, Consultar y Participar. Ninguna presenta a alguien como parte del equipo sin serlo: quien no tiene foto aparece con sus iniciales.' },
  { icon: ShieldCheck, title: 'Personas de la demostración', text: 'Salvo las identificadas como reales (información profesional pública o autorización expresa), son ficticias y no tienen foto.' },
  { icon: Cookie, title: 'Sin seguimiento', text: 'Ni analítica ni cookies de terceros. Las tipografías se sirven desde el propio campus.' },
];

const RETENTION = [
  {
    data: 'Ficha (nombre, correo corporativo, puesto, departamento, sede y perfil)',
    purpose: 'Identificarte y firmar tus contenidos',
    time: 'Mientras trabajes en FLM. Cuando dejas la firma, administración elimina tu perfil, a más tardar al año de la baja: desapareces del campus (también del calendario) y lo que publicaste se conserva sin tu nombre, firmado por tu área o por FLM.',
  },
  {
    data: 'Cumpleaños (solo día y mes) y fecha de incorporación',
    purpose: 'Mostrar en el calendario de empresa, que ve todo el equipo, tu cumpleaños cada año y tu aniversario en FLM desde el primer año. Las fechas se calculan desde tu ficha: no se guardan aparte ni se usan para nada más',
    time: 'Mientras tengas perfil en el campus. Se borran al eliminarlo; con la cuenta desactivada dejan de verse en el calendario. Si faltan, se piden en tu perfil, sin bloquear nada.',
  },
  { data: 'Progreso: lecturas confirmadas e intentos de test', purpose: 'Mostrarte tu progreso y elaborar informes agregados, sin nombres, de participación y errores frecuentes', time: 'Mientras estés en activo y hasta un año después de la baja, o hasta que se elimine tu perfil. Después, los intentos quedan como datos agregados anónimos y las lecturas se borran.' },
  { data: 'Sesión (cookie técnica)', purpose: 'Mantenerte conectado de forma segura', time: 'Caduca tras 12 horas sin actividad y, como máximo, a los 14 días. Se borra al día siguiente.' },
  { data: 'Enlaces de activación y de recuperación', purpose: 'Crear o restablecer tu contraseña', time: 'Activación: 7 días. Recuperación: 30 minutos. Un solo uso.' },
  { data: 'Registro de auditoría', purpose: 'Saber quién hizo qué y cuándo en la gestión', time: '2 años.' },
];

export function Privacy() {
  return (
    <DossierSection id="privacidad" number="06" eyebrow="Privacidad" title="Privacidad y conservación de datos" lede="Minimización por defecto: el campus solo guarda lo que necesita para funcionar, y durante el tiempo justo.">
      <ul role="list" className={styles.principles}>
        {PRINCIPLES.map((p) => {
          const Icon = p.icon;
          return (
            <li key={p.title}>
              <span className={styles.pIcon} aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className={styles.pTitle}>{p.title}</span>
              <span className={styles.pText}>{p.text}</span>
            </li>
          );
        })}
      </ul>

      <SubHead hint="Resumen de la política de conservación que aplica el servidor de la versión interna.">Qué se guarda y cuánto tiempo</SubHead>
      <div className={styles.tableWrap}>
        <table role="table" className={styles.table}>
          <caption className="sr-only">Datos que guarda la versión interna, para qué y durante cuánto tiempo</caption>
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">
                Dato
              </th>
              <th role="columnheader" scope="col">
                Para qué
              </th>
              <th role="columnheader" scope="col">
                Cuánto tiempo
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {RETENTION.map((r) => (
              <tr role="row" key={r.data}>
                <th role="rowheader" scope="row">
                  {r.data}
                </th>
                <td role="cell">
                  <span className={styles.cellLabel} aria-hidden="true">
                    Para qué:{' '}
                  </span>
                  {r.purpose}
                </td>
                <td role="cell">
                  <span className={styles.cellLabel} aria-hidden="true">
                    Cuánto tiempo:{' '}
                  </span>
                  {r.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.callout}>
        <span className={styles.calloutIcon} aria-hidden="true">
          <HardDrive size={20} />
        </span>
        <div>
          <p className={styles.calloutTitle}>En esta demostración, todo se queda en tu navegador</p>
          <p className={styles.calloutText}>
            No hay servidor ni cuentas reales: tu progreso, los intentos, los borradores, los cambios de fichas (también los cumpleaños y las fechas de incorporación que se introduzcan) y las preferencias se guardan en el almacenamiento local de este navegador. Puedes descargarlos o borrarlos cuando quieras desde <Link to="/perfil/ajustes#privacidad">Ajustes › Privacidad</Link> y{' '}
            <Link to="/perfil/ajustes#sesion">«Restablecer la demostración»</Link>.
          </p>
        </div>
      </div>
    </DossierSection>
  );
}

/* ── 07 · Demo y versión interna ───────────────────────────────────────── */

export function DemoVsPrivate() {
  return (
    <DossierSection id="demo" number="07" eyebrow="Demostración y versión interna" title="Qué es real, qué es simulación y qué falta configurar" lede="La demostración pública enseña el campus completo sin servidor. La versión interna usa la misma interfaz con la API y sus permisos.">
      <div className={styles.columns}>
        <div className={styles.column} data-kind="ok">
          <h3 className={styles.colTitle}>
            <CircleCheck size={18} aria-hidden="true" /> Operativo en la demo
          </h3>
          <ul className={styles.list}>
            <li>Navegación, búsqueda global (Ctrl K y «/») y avisos.</li>
            <li>Formaciones con lectura, test corregido al momento, estados de progreso y «El escalón».</li>
            <li>Actualidad, notas informativas en PDF y lecturas recomendadas.</li>
            <li>Agenda con exportación a calendario (.ics) y calendario del mes, con cumpleaños y aniversarios en FLM calculados desde cada ficha.</li>
            <li>Perfil, reconocimientos y ajustes de tema, movimiento y atajos.</li>
          </ul>
        </div>
        <div className={styles.column} data-kind="sim">
          <h3 className={styles.colTitle}>
            <FlaskConical size={18} aria-hidden="true" /> Simulado, solo en tu navegador
          </h3>
          <ul className={styles.list}>
            <li>Acceso sin contraseña y «Ver como» autor o administrador.</li>
            <li>Borradores, publicación, archivo y «Deshacer».</li>
            <li>Subida de documentos, altas, fichas, roles y cuentas de personas, eliminación de perfiles, informes y auditoría.</li>
            <li>Preferencias de avisos y resumen por correo.</li>
          </ul>
          <p className={styles.note}>{MESSAGES.demoSimulated}</p>
        </div>
        <div className={styles.column} data-kind="ext">
          <h3 className={styles.colTitle}>
            <Server size={18} aria-hidden="true" /> Requiere configuración externa
          </h3>
          <ul className={styles.list}>
            <li>
              <strong>Alojamiento de la API</strong>: Node.js con base de datos SQLite, carpeta privada de archivos y copias de seguridad.
            </li>
            <li>
              <strong>Servidor de correo (SMTP)</strong> para activar cuentas y recuperar contraseñas.
            </li>
            <li>
              <strong>Dominio propio</strong>, por ejemplo un subdominio de flmexperts.com.
            </li>
            <li>
              <strong>HTTPS</strong>, obligatorio: las cookies de sesión solo viajan cifradas.
            </li>
          </ul>
        </div>
      </div>
    </DossierSection>
  );
}

/* ── 08 · Créditos ─────────────────────────────────────────────────────── */

export function Credits() {
  return (
    <DossierSection id="creditos" number="08" eyebrow="Créditos" title="Quién y qué hay detrás">
      <dl className={styles.credits}>
        <div>
          <dt>Fotografía</dt>
          <dd>Fotografías corporativas aportadas por FLM: sede de Barcelona (fachada, recepción y biblioteca), libretas, retrato de Ángel María Ceniceros y Desayuno Mercantil. Las de las portadas de Aprender, Consultar y Participar también las ha aportado FLM.</dd>
        </div>
        <div>
          <dt>Logotipos</dt>
          <dd>Archivos originales de FLM, usados sin modificar.</dd>
        </div>
        <div>
          <dt>Tipografías</dt>
          <dd>Inter (Rasmus Andersson), Newsreader (Production Type) y Belleza (Eduardo Tunni), con licencia SIL Open Font License 1.1, autoalojadas mediante Fontsource.</dd>
        </div>
        <div>
          <dt>Iconos</dt>
          <dd>Lucide, con licencia ISC. Glifos de LinkedIn e Instagram de Simple Icons (CC0).</dd>
        </div>
        <div>
          <dt>Software</dt>
          <dd>React, React Router, Motion, Zustand, Vite y TypeScript; pdf.js para las miniaturas; Hono y Zod en la API. Licencias MIT y Apache 2.0.</dd>
        </div>
        <div>
          <dt>Concepto</dt>
          <dd>«Círculo de confianza», con injertos de «Punto y seguido», «Vasos comunicantes» y «Círculo abierto».</dd>
        </div>
        <div>
          <dt>Contenidos</dt>
          <dd>Formaciones, actualidad y lecturas preparadas para el campus a partir de fuentes oficiales, citadas en cada pieza junto a su fecha de revisión.</dd>
        </div>
        <div>
          <dt>Canales de FLM</dt>
          <dd>
            <a href="https://flmexperts.com/" target="_blank" rel="noreferrer">
              flmexperts.com<span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>{' '}
            ·{' '}
            {participation.social.map((s, i) => (
              <span key={s.id}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
                {i < participation.social.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <p className={styles.sign}>
        <Globe size={15} aria-hidden="true" /> FLM · Barcelona · Vic · Granollers <Lock size={15} aria-hidden="true" className={styles.signLock} /> Uso interno
      </p>
    </DossierSection>
  );
}

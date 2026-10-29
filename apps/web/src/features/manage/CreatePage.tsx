import { ArrowRight, Copy, ListChecks, Search } from 'lucide-react';
import { useId, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { AREAS, AREA_LIST, normalize, type AreaId, type ContentType } from '@flm/shared';
import { Button, ButtonLink, Dialog, EmptyState, Kbd, PageHeader } from '@/design';
import { useMe } from '@/data/selectors';
import { usePageTitle } from '@/lib/preferences';
import { areaAssessmentRow, canCreateType, canEditRow, editHref, GROUPS, TYPE_META, useContentRows, type ContentRow, type CreatorGroup } from './model';
import { TypeTile } from './TypeTile';
import styles from './CreatePage.module.css';

/** Tarjeta especial del creador: el test final se edita dentro de su formación. */
type CardKind = ContentType | 'test-final';

const SECTION_OF: Record<CreatorGroup, string | undefined> = { aprender: 'aprender', consultar: 'consultar', participar: 'participar', inicio: undefined };

const CARDS: Record<CreatorGroup, CardKind[]> = {
  aprender: ['formacion', 'test-final', 'test'],
  consultar: ['noticia', 'documento'],
  participar: ['evento', 'comunicado'],
  inicio: ['cliente', 'bienvenida'],
};

const TEST_FINAL = {
  label: 'Test final',
  description: 'Las tres preguntas de una formación, con «por qué no» en cada opción incorrecta, explicación y «Repasa».',
  destination: 'Aprender › al final de su formación',
};

/** Elegir de una lista (ejemplos, formaciones, áreas) en un diálogo con búsqueda. */
function PickDialog({ open, onClose, title, description, items, empty }: { open: boolean; onClose: () => void; title: string; description: string; items: { id: string; title: string; subtitle: string; to: string }[]; empty: ReactNode }) {
  const [q, setQ] = useState('');
  const id = useId();
  const shown = useMemo(() => {
    const nq = normalize(q);
    return (nq ? items.filter((i) => normalize(`${i.title} ${i.subtitle}`).includes(nq)) : items).slice(0, 40);
  }, [items, q]);
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} variant="sheet" size="md">
      <div className={styles.pick}>
        {items.length > 6 && (
          <div className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <label htmlFor={`${id}-q`} className="sr-only">
              Buscar
            </label>
            <input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título" autoComplete="off" />
          </div>
        )}
        {items.length === 0 ? (
          empty
        ) : (
          <ul role="list" className={styles.pickList}>
            {shown.map((i) => (
              <li key={i.id}>
                <Link to={i.to} className={styles.pickItem} onClick={onClose}>
                  <span className={styles.pickText}>
                    <span className={styles.pickTitle}>{i.title}</span>
                    <span className={styles.pickSub}>{i.subtitle}</span>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
            {shown.length === 0 && <li className={styles.pickEmpty}>No hay nada con esas palabras.</li>}
          </ul>
        )}
      </div>
    </Dialog>
  );
}

function TypeCard({ kind, onExample, onPick }: { kind: CardKind; onExample?: () => void; onPick?: () => void }) {
  const isTestFinal = kind === 'test-final';
  const meta = isTestFinal ? null : TYPE_META[kind];
  const label = meta?.label ?? TEST_FINAL.label;
  const description = meta?.description ?? TEST_FINAL.description;
  const destination = meta?.destination ?? TEST_FINAL.destination;
  const titleId = useId();
  return (
    <li className={styles.card} data-cta-host>
      <span className={styles.tileWrap}>{isTestFinal ? <span className={styles.testTile} aria-hidden="true"><ListChecks size={24} /></span> : <TypeTile type={kind as ContentType} size={48} />}</span>
      <div className={styles.cardBody}>
        <h3 id={titleId} className={styles.cardTitle}>
          {onPick ? (
            <button type="button" className={styles.stretch} onClick={onPick}>
              {label}
            </button>
          ) : (
            <Link to={`/gestion/nuevo/${kind}`} className={styles.stretch}>
              {label}
            </Link>
          )}
        </h3>
        <p className={styles.cardText}>{description}</p>
        <p className={styles.where}>
          <span className={styles.whereLabel}>Aparece en</span> {destination}
        </p>
      </div>
      <div className={styles.cardFoot}>
        <span className="cta-pill" aria-hidden="true">
          {onPick ? (kind === 'test' ? 'Elegir el área' : 'Elegir la formación') : 'Empezar'} <ArrowRight size={16} />
        </span>
        {onExample && (
          <Button variant="ghost" size="sm" icon={<Copy />} onClick={onExample} className={styles.example} aria-describedby={titleId}>
            Partir de un ejemplo
          </Button>
        )}
      </div>
    </li>
  );
}

/** «Crear contenido»: los tipos en tarjetas agrupadas por dónde aparecen, con un ejemplo real para empezar rápido. */
export default function CreatePage() {
  usePageTitle('Crear contenido');
  const me = useMe();
  const rows = useContentRows();
  const [examplesOf, setExamplesOf] = useState<ContentType | null>(null);
  const [picking, setPicking] = useState<'test-final' | 'test' | null>(null);

  const examples = useMemo(() => {
    if (!examplesOf) return [];
    return rows
      .filter((r) => r.type === examplesOf && r.status === 'publicado' && !r.revisionOf)
      .map((r) => ({ id: r.id, title: r.title, subtitle: exampleSubtitle(r), to: `/gestion/nuevo/${r.type}?desde=${encodeURIComponent(r.id)}` }));
  }, [rows, examplesOf]);

  if (!me) return null;
  const role = me.effectiveRole;
  const can = (kind: CardKind) => (kind === 'test-final' ? canCreateType(role, 'formacion') : canCreateType(role, kind));

  // Test final: formaciones que la persona puede editar (las suyas o, en administración, todas).
  const formations = rows
    .filter((r) => r.type === 'formacion' && !r.revisionOf && r.status !== 'archivado' && canEditRow(me, r))
    .map((r) => ({ id: r.key, title: r.title, subtitle: r.status === 'borrador' ? 'Borrador' : 'Publicada · los cambios se guardan aparte hasta publicarlos', to: `${editHref(r)}?paso=test` }));
  // Evaluación del área: una por área. Si ya la tiene (publicada o en borrador), se abre esa; si la
  // anterior está archivada, se empieza otra.
  const areas = AREA_LIST.map((a) => {
    const row = areaAssessmentRow(rows, a.id);
    const archived = !row && rows.some((r) => r.type === 'test' && r.area === a.id && !r.revisionOf && r.status === 'archivado');
    const subtitle = row ? (row.status === 'publicado' ? 'Evaluación publicada: los cambios se guardan aparte' : 'Borrador sin publicar: sigue donde lo dejaste') : archived ? 'La anterior está archivada: empieza una nueva' : 'Sin evaluación todavía';
    return { id: a.id, title: `Área ${a.name}`, subtitle, to: row ? editHref(row) : `/gestion/nuevo/test?area=${a.id}` };
  });

  const groups = GROUPS.map((g) => ({ ...g, cards: CARDS[g.id].filter(can) })).filter((g) => g.cards.length > 0);

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Inicio', to: '/' }, { label: 'Gestión', to: '/gestion' }, { label: 'Crear contenido' }]}
        eyebrow="Gestión · crear"
        title="¿Qué quieres crear?"
        lede="Elige un tipo. Se guarda como borrador mientras escribes y, cuando esté listo, lo publicas: aparecerá donde indica cada tarjeta."
        actions={
          <ButtonLink variant="ghost" to="/gestion">
            Ver mis contenidos
          </ButtonLink>
        }
      />

      {groups.length === 0 ? (
        <EmptyState title="Tu perfil no puede crear contenidos" action={<ButtonLink to="/">Volver al inicio</ButtonLink>}>
          <p>Crear y publicar contenidos es de la autoría y de administración.</p>
        </EmptyState>
      ) : (
        groups.map((g) => (
          <section key={g.id} className={styles.group} aria-labelledby={`grupo-${g.id}`} data-section={SECTION_OF[g.id]}>
            <div className={styles.groupHead}>
              <p className="section-kicker">{g.label}</p>
              <h2 id={`grupo-${g.id}`} className="section-title">
                {g.id === 'inicio' ? 'Para Inicio' : `Para ${g.label}`}
              </h2>
              {/* Las evaluaciones del área son de administración: la autoría solo ve formaciones y su test final. */}
              <p className={styles.groupLede}>{g.id === 'aprender' && !g.cards.includes('test') ? 'Formaciones con su test final de tres preguntas.' : g.lede}</p>
            </div>
            <ul role="list" className={styles.cards}>
              {g.cards.map((kind) =>
                kind === 'test-final' ? (
                  <TypeCard key={kind} kind={kind} onPick={() => setPicking('test-final')} />
                ) : kind === 'test' ? (
                  <TypeCard key={kind} kind={kind} onPick={() => setPicking('test')} />
                ) : (
                  <TypeCard key={kind} kind={kind} onExample={() => setExamplesOf(kind)} />
                ),
              )}
            </ul>
          </section>
        ))
      )}

      <PickDialog
        open={!!examplesOf}
        onClose={() => setExamplesOf(null)}
        title={examplesOf ? `Partir de un ejemplo · ${TYPE_META[examplesOf].label}` : 'Partir de un ejemplo'}
        description="Se crea un borrador nuevo con la estructura y el texto del ejemplo para que lo reescribas. El original no cambia."
        items={examples}
        empty={
          <p>
            Todavía no hay contenidos publicados de este tipo. <Link to={examplesOf ? `/gestion/nuevo/${examplesOf}` : '/gestion/nuevo'}>Empieza desde la plantilla</Link>.
          </p>
        }
      />
      <PickDialog
        open={picking === 'test-final'}
        onClose={() => setPicking(null)}
        title="¿De qué formación es el test?"
        description="El test final va dentro de su formación: se abre el editor en el paso «Test final»."
        items={[{ id: 'nueva', title: 'Una formación nueva', subtitle: 'Empieza la formación y escribe su test al final', to: '/gestion/nuevo/formacion?paso=test' }, ...formations]}
        empty={null}
      />
      <PickDialog
        open={picking === 'test'}
        onClose={() => setPicking(null)}
        title="¿De qué área es la evaluación?"
        description="Una evaluación por área: diez preguntas sobre sus formaciones; se supera con 8."
        items={areas}
        empty={null}
      />
      <p className={styles.footNote}>
        Atajo: pulsa <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> y escribe «crear» desde cualquier página.
      </p>
    </div>
  );
}

function exampleSubtitle(r: ContentRow): string {
  const area = r.area && r.area !== 'general' ? `Área ${AREAS[r.area as AreaId].name}` : r.area === 'general' ? 'Toda la firma' : '';
  return [TYPE_META[r.type].label, area].filter(Boolean).join(' · ');
}

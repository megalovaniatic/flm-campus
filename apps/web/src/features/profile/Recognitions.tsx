import { animate, useInView } from 'motion/react';
import { ArrowRight, Award, BookOpenCheck, Feather, GraduationCap, Medal, Sparkles, type LucideIcon } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AREA_IDS, formatLongDate, madridDateKey, type AreaId, type Badge, type BadgeFamily } from '@flm/shared';
import { useDemo } from '@/data/store';
import { useReducedMotionPref } from '@/lib/preferences';
import type { UpcomingBadge } from './useProfileData';
import styles from './Recognitions.module.css';

type IconType = LucideIcon;

const FAMILIES: { id: BadgeFamily; title: string; hint: string; icon: IconType }[] = [
  { id: 'trayectoria', title: 'Trayectoria', hint: 'Aniversarios en FLM', icon: Award },
  { id: 'aprendizaje', title: 'Aprendizaje', hint: 'Itinerarios de área y evaluaciones', icon: GraduationCap },
  { id: 'contribucion', title: 'Contribución', hint: 'Lo que compartes con el equipo', icon: Feather },
];

const dayOf = (value: string) => (value.length === 10 ? value : madridDateKey(new Date(value)));

function areaOf(badge: Badge): AreaId | undefined {
  const id = badge.id.replace(/^(area|evaluacion)-/, '');
  return (AREA_IDS as readonly string[]).includes(id) ? (id as AreaId) : undefined;
}

function glyphFor(badge: Badge): IconType {
  if (badge.family === 'trayectoria') return Award;
  if (badge.family === 'contribucion') return Feather;
  return badge.id.startsWith('evaluacion-') ? Medal : BookOpenCheck;
}

/** Cifra que acompaña a la cápsula (años, aciertos...). Nunca la inicial de un área dentro de un círculo. */
function markOf(badge: Badge): string | undefined {
  if (badge.id.startsWith('area-')) return undefined;
  return badge.mark;
}

interface CapsuleProps {
  badge: Badge;
  fresh: boolean;
  play: boolean;
  delay: number;
  reduce: boolean;
}

/**
 * Cápsula de reconocimiento. La primera vez que aparece, el círculo se abre en cápsula
 * (clip-path) y la recorre un barrido del degradado oficial. Sin confeti ni sonidos.
 */
function BadgeCapsule({ badge, fresh, play, delay, reduce }: CapsuleProps) {
  const ref = useRef<HTMLLIElement>(null);
  const band = useRef<HTMLSpanElement>(null);
  const shouldAnimate = fresh && !reduce;
  const Icon = glyphFor(badge);
  const area = areaOf(badge);
  const mark = markOf(badge);

  // Antes de pintar: si toca celebrarla, la cápsula empieza cerrada sobre su círculo.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !shouldAnimate) return;
    const h = el.offsetHeight;
    el.style.clipPath = `inset(0px ${Math.max(0, el.offsetWidth - h)}px 0px 0px round ${h / 2}px)`;
  }, [shouldAnimate]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldAnimate || !play) return;
    const h = el.offsetHeight;
    const w = el.offsetWidth;
    const round = `round ${h / 2}px`;
    const open = animate(el, { clipPath: [`inset(0px ${Math.max(0, w - h)}px 0px 0px ${round})`, `inset(0px 0px 0px 0px ${round})`] }, { duration: 0.46, delay, ease: [0.22, 1, 0.36, 1] });
    const sweep = band.current ? animate(band.current, { x: ['-120%', '330%'] }, { duration: 0.9, delay: delay + 0.1, ease: [0.65, 0, 0.35, 1] }) : undefined;
    open.then(() => {
      el.style.clipPath = '';
    });
    return () => {
      open.stop();
      sweep?.stop();
    };
  }, [play, shouldAnimate, delay]);

  return (
    <li ref={ref} className={styles.capsule} data-fresh={fresh || undefined} data-area={area}>
      <span className={styles.glyph} data-family={badge.family} data-area-glyph={area ? 'true' : undefined} aria-hidden="true">
        <Icon size={20} aria-hidden="true" />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>
          {badge.title}
          {fresh && (
            <span className={styles.new}>
              <Sparkles size={12} aria-hidden="true" /> Nuevo
            </span>
          )}
        </span>
        <span className={styles.desc}>
          {badge.description}
          {badge.earnedAt && <> · {formatLongDate(dayOf(badge.earnedAt))}</>}
        </span>
      </span>
      {mark && (
        <span className={styles.mark} aria-hidden="true">
          {mark}
        </span>
      )}
      {shouldAnimate && (
        <span className={styles.sweep} aria-hidden="true">
          <span ref={band} className={styles.band} />
        </span>
      )}
    </li>
  );
}

function UpcomingCapsule({ item }: { item: UpcomingBadge }) {
  return (
    <li className={styles.capsule} data-upcoming="true">
      <span className={styles.glyph} data-upcoming="true" aria-hidden="true" />
      <span className={styles.text}>
        <span className={styles.kicker}>Por llegar</span>
        <span className={styles.title}>
          {item.to ? (
            <Link to={item.to} className={styles.stretch}>
              {item.title}
              <ArrowRight size={14} aria-hidden="true" className={styles.arrow} />
            </Link>
          ) : (
            item.title
          )}
        </span>
        <span className={styles.desc}>{item.detail}</span>
      </span>
    </li>
  );
}

/**
 * Reconocimientos agrupados por familia. Las insignias nuevas (no celebradas todavía) se
 * celebran una sola vez al entrar en pantalla, con anuncio para lectores de pantalla.
 */
export function Recognitions({ badges, upcoming, fresh }: { badges: Badge[]; upcoming: UpcomingBadge[]; fresh: ReadonlySet<string> }) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, amount: 0.25 });
  const reduce = useReducedMotionPref();
  const markCelebrated = useDemo((s) => s.markCelebrated);
  const [announcement, setAnnouncement] = useState('');
  const [toCelebrate] = useState(() => badges.filter((b) => fresh.has(b.id)));

  useEffect(() => {
    if (!inView || toCelebrate.length === 0) return;
    setAnnouncement(
      toCelebrate.length === 1
        ? `Nuevo reconocimiento: ${toCelebrate[0]!.title}. ${toCelebrate[0]!.description}`
        : `Tienes ${toCelebrate.length} reconocimientos nuevos: ${toCelebrate.map((b) => b.title).join(', ')}.`,
    );
    const wait = reduce ? 0 : 1100 + (toCelebrate.length - 1) * 220;
    const timer = window.setTimeout(() => toCelebrate.forEach((b) => markCelebrated(b.id)), wait);
    return () => window.clearTimeout(timer);
  }, [inView, reduce, toCelebrate, markCelebrated]);

  let order = 0;

  return (
    <div ref={root} className={styles.families}>
      {FAMILIES.map((family) => {
        const earned = badges.filter((b) => b.family === family.id);
        const next = upcoming.filter((u) => u.family === family.id);
        const FamilyIcon = family.icon;
        return (
          <section key={family.id} className={styles.family} aria-labelledby={`fam-${family.id}`}>
            <header className={styles.familyHead}>
              <span className={styles.familyIcon} aria-hidden="true">
                <FamilyIcon size={18} aria-hidden="true" />
              </span>
              <div>
                <h3 id={`fam-${family.id}`} className={styles.familyTitle}>
                  {family.title}
                  <span className={styles.count}>
                    {earned.length}
                    <span className="sr-only"> {earned.length === 1 ? 'reconocimiento' : 'reconocimientos'}</span>
                  </span>
                </h3>
                <p className={styles.familyHint}>{family.hint}</p>
              </div>
            </header>
            <ul role="list" className={styles.capsules}>
              {earned.map((b) => {
                const isFresh = fresh.has(b.id);
                const delay = isFresh ? 0.12 + order++ * 0.22 : 0;
                return <BadgeCapsule key={b.id} badge={b} fresh={isFresh} play={inView} delay={delay} reduce={reduce} />;
              })}
              {next.map((u) => (
                <UpcomingCapsule key={u.title} item={u} />
              ))}
            </ul>
          </section>
        );
      })}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

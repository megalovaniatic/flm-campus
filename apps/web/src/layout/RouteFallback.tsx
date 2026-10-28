import { Skeleton } from '@/design';

/** Esqueleto con la forma real de una página mientras se carga la sección. */
export function RouteFallback() {
  return (
    <div className="container page" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      <Skeleton width={120} height={12} />
      <div style={{ height: 16 }} />
      <Skeleton width="min(36rem, 90%)" height={44} radius={12} />
      <div style={{ height: 12 }} />
      <Skeleton width="min(28rem, 70%)" height={20} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: 16, marginTop: 40 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={200} radius={24} />
        ))}
      </div>
    </div>
  );
}

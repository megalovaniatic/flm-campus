import { usePageTitle } from '@/lib/preferences';

/** Página provisional mientras se construye la sección. */
export function Placeholder({ title }: { title: string }) {
  usePageTitle(title);
  return (
    <div className="container page">
      <p className="eyebrow">FLM Campus</p>
      <h1 className="display" style={{ fontSize: 'var(--text-5xl)', marginTop: 12 }}>
        {title}
      </h1>
    </div>
  );
}

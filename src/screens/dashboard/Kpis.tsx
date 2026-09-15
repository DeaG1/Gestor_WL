import type { Kpi } from '../../domain/dashboard-overview.ts';

export default function Kpis({ kpis }: { kpis: Kpi[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--space-3)' }}>
      {kpis.map((k) => (
        <div key={k.label} className="card elev-sm" style={{ padding: 'var(--space-4)', gap: 6 }}>
          <div className="card-kicker" style={{ color: 'var(--color-neutral-500)' }}>{k.label}</div>
          <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1, color: k.color }}>
            {k.value}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

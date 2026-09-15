import type { TypeLegendRow } from '../../domain/dashboard-overview.ts';

export default function TypeDonut({ bg, center, legend }: { bg: string; center: string; legend: TypeLegendRow[] }) {
  return (
    <div className="card elev-sm" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)', flexDirection: 'row', alignItems: 'center' }}>
      <div style={{ width: 150, height: 150, flex: 'none', borderRadius: '50%', background: bg, display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 104, height: 104, borderRadius: '50%', background: 'var(--color-surface)', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1 }}>{center}</div>
            <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginTop: 3 }}>
              GTD
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div>
          <div className="card-title" style={{ fontSize: 15 }}>FCFS vs GTD</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>GTD é vaga garantida; FCFS depende de velocidade</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {legend.map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
              <span style={{ flex: 1 }}>{l.label}</span>
              <span style={{ fontWeight: 500 }}>{l.count}</span>
              <span style={{ color: 'var(--color-neutral-500)', width: 38, textAlign: 'right' }}>{l.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

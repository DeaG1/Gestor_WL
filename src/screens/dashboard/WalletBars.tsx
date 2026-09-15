import type { TypeLegendRow, WalletBar } from '../../domain/dashboard-overview.ts';

export default function WalletBars({ bars, legend }: { bars: WalletBar[]; legend: TypeLegendRow[] }) {
  return (
    <div className="card elev-sm" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)' }}>
      <div>
        <div className="card-title" style={{ fontSize: 15 }}>WL por wallet</div>
        <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>Quantas vagas você tem e de que tipo</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {bars.map((w) => (
          <div key={w.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>{w.name}</span>
              <span style={{ color: 'var(--color-neutral-400)' }}>{w.count} WL · {w.minted} mintadas</span>
            </div>
            <div style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', background: 'var(--color-neutral-900)', gap: 2 }}>
              {w.segs.map((s) => (
                <div key={s.title} title={s.title} style={{ width: s.width, background: s.color, transition: 'width .4s ease' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 12, color: 'var(--color-neutral-400)', flexWrap: 'wrap' }}>
        {legend.map((l) => (
          <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
            {l.label} · {l.count}
          </span>
        ))}
      </div>
    </div>
  );
}

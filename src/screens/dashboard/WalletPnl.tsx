import type { WalletPnl as WalletPnlRow } from '../../domain/dashboard-finance.ts';

export default function WalletPnl({ rows }: { rows: WalletPnlRow[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,440px), 1fr))', gap: 'var(--space-3)' }}>
      {rows.map((w) => (
        <div key={w.name} className="card elev-sm" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: w.dot }} />
            <div className="card-title" style={{ fontSize: 15 }}>Resultado {w.name}</div>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-neutral-500)' }}>
              {w.minted} mints registrados
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Gasto</div>
              <div style={{ fontSize: 20, fontWeight: 500 }}>{w.cost}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Vendido</div>
              <div style={{ fontSize: 20, fontWeight: 500 }}>{w.sold}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>Lucro</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: w.profitColor }}>{w.profit}</div>
            </div>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: 'var(--color-neutral-900)' }}>
            <div style={{ width: w.roiWidth, background: w.dot, transition: 'width .4s' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{w.roiLabel}</div>
        </div>
      ))}
    </div>
  );
}

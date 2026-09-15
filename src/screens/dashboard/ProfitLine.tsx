import type { ProfitLine as ProfitLineModel } from '../../domain/dashboard-finance.ts';

export default function ProfitLine(
  { line, total, color }: { line: ProfitLineModel | null; total: string; color: string },
) {
  return (
    <div className="card elev-sm" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <div className="card-title" style={{ fontSize: 15 }}>Lucro acumulado</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>Venda − custo, mint a mint, em ordem de data</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 500, color }}>{total}</div>
      </div>
      {line ? (
        <>
          <svg viewBox="0 0 600 150" preserveAspectRatio="none" style={{ width: '100%', height: 130, display: 'block', overflow: 'visible' }}>
            <line x1={0} y1={line.zeroY} x2={600} y2={line.zeroY} stroke="var(--color-neutral-700)" strokeDasharray="3 5" />
            <polygon points={line.areaPoints} fill="var(--color-accent)" opacity={0.14} />
            <polyline
              points={line.points}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth={2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {line.dots.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="var(--color-bg)"
                stroke="var(--color-accent)"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-neutral-500)' }}>
            <span>{line.first}</span>
            <span>{line.last}</span>
          </div>
        </>
      ) : (
        <div
          style={{
            height: 130, display: 'grid', placeItems: 'center', border: '1px dashed var(--color-divider)',
            borderRadius: 'var(--radius-md)', textAlign: 'center', padding: 'var(--space-4)',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', maxWidth: 300 }}>
            Ao marcar um mint como <span style={{ color: 'var(--color-accent-300)' }}>Mintado</span>, registre quanto
            custou e por quanto vendeu. O gráfico monta sozinho.
          </div>
        </div>
      )}
    </div>
  );
}

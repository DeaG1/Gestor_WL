import type { AgendaBar } from '../../domain/dashboard-overview.ts';

export default function AgendaBars({ bars }: { bars: AgendaBar[] }) {
  return (
    <div className="card elev-sm" style={{ padding: 'var(--space-6)', gap: 'var(--space-4)' }}>
      <div>
        <div className="card-title" style={{ fontSize: 15 }}>Agenda de mints</div>
        <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>Mints com data marcada, por dia</div>
      </div>
      {bars.length > 0 ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, paddingTop: 8 }}>
          {bars.map((b) => (
            <div
              key={b.label}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, color: b.numColor }}>{b.count}</div>
              <div
                title={b.title}
                style={{
                  width: '100%', maxWidth: 44, height: b.height, borderRadius: '6px 6px 3px 3px',
                  background: b.color, transformOrigin: 'bottom', animation: 'wl-grow .5s ease-out',
                }}
              />
              <div style={{ fontSize: 11, color: b.labelColor, whiteSpace: 'nowrap' }}>{b.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Nenhum mint com data ainda.</div>
      )}
    </div>
  );
}

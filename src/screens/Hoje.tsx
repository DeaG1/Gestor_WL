import { ArrowSquareOut, PencilSimple } from '@phosphor-icons/react';
import { itemView } from '../domain/item-view.ts';
import type { ItemView } from '../domain/item-view.ts';
import { todayModel } from '../domain/today.ts';
import type { UpcomingDay } from '../domain/today.ts';
import type { ScreenProps } from './actions.ts';
import type { WLItem } from '../lib/types.ts';
import { Tag, TagOutline } from '../ui/Tag.tsx';

function FullMeta({ view, item }: { view: ItemView; item: WLItem }) {
  return (
    <div
      style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
        marginTop: 6, fontSize: 12, color: 'var(--color-neutral-400)',
      }}
    >
      <Tag bg={view.walletBg} fg={view.walletFg}>{item.wallet}</Tag>
      {item.type && <TagOutline>{item.type}</TagOutline>}
      {item.chain && <span>{item.chain}</span>}
      {view.costLabel && <span>{view.costLabel}</span>}
      {item.notes && <span>{item.notes}</span>}
    </div>
  );
}

function CompactMeta({ view, item }: { view: ItemView; item: WLItem }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--color-neutral-400)' }}>
      <Tag bg={view.walletBg} fg={view.walletFg}>{item.wallet}</Tag>
      <span>{item.type}</span>
      <span>{item.chain}</span>
      <span>{item.notes}</span>
    </div>
  );
}

export default function Hoje({ gestor, today, actions }: ScreenProps) {
  const currency = gestor.settings.currency;
  const model = todayModel(gestor.items, today, gestor.settings.showPast);

  const stats: { value: number; label: string }[] = [
    { value: model.pendingToday, label: 'pra mintar hoje' },
    { value: model.futureDayCount, label: 'dias agendados' },
    { value: model.undatedCount, label: 'sem data' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-8)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Hoje · horários em BRT
          </div>
          <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>{model.todayLong}</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', minWidth: 90,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      <section>
        <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-3)' }}>Mints de hoje</h6>
        {model.todayItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {model.todayItems.map((item) => {
              const view = itemView(item, currency);
              return (
                <div
                  key={item.id}
                  className="card elev-sm"
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 'var(--space-6)',
                    padding: 'var(--space-4) var(--space-6)', opacity: view.opacity, boxShadow: view.ring,
                  }}
                >
                  <div style={{ width: 84, flex: 'none' }}>
                    <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1, color: 'var(--color-accent-300)' }}>
                      {view.timeLabel}
                    </div>
                    <div style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginTop: 4 }}>
                      {view.timeSub}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 500, textDecoration: view.deco }}>{item.name}</div>
                    <FullMeta view={view} item={item} />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flex: 'none' }}>
                    {view.hasLink && (
                      <a className="btn btn-ghost" href={item.link} target="_blank" rel="noopener">
                        Abrir mint <ArrowSquareOut size={14} weight="bold" />
                      </a>
                    )}
                    <button className="btn btn-primary" onClick={() => actions.mint(item)}>{view.mintLabel}</button>
                    <button className="btn btn-secondary" onClick={() => actions.skip(item)}>{view.skipLabel}</button>
                    <button className="btn btn-secondary btn-icon" title="Editar" onClick={() => actions.edit(item)}>
                      <PencilSimple size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card elev-sm" style={{ padding: 'var(--space-6)', flexDirection: 'row', alignItems: 'center', gap: 'var(--space-6)' }}>
            <div style={{ fontSize: 30, fontWeight: 500, color: 'var(--color-neutral-600)', letterSpacing: '-.02em' }}>—</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>Nada pra mintar hoje</div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginTop: 2 }}>
                Próximo: <span style={{ color: 'var(--color-text)' }}>{model.nextLabel}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {model.past.length > 0 && (
        <section>
          <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-3)' }}>
            Passaram sem marcar · {model.past.length}
          </h6>
          <div className="card elev-sm" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            {model.past.map((item) => {
              const view = itemView(item, currency);
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
                    padding: 'var(--space-3) var(--space-6)', borderBottom: '1px solid var(--color-divider)',
                  }}
                >
                  <div style={{ width: 84, flex: 'none', fontSize: 13, color: 'var(--color-neutral-400)' }}>
                    {view.dateShort}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginLeft: 10 }}>
                      {item.wallet} · {item.type} {item.chain}
                    </span>
                  </div>
                  <button className="btn btn-ghost" onClick={() => actions.mint(item)}>Mintei</button>
                  <button className="btn btn-ghost" style={{ color: 'var(--color-neutral-400)' }} onClick={() => actions.skip(item)}>
                    Pulei
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-3)' }}>Próximos</h6>
        {model.upcoming.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {model.upcoming.map((g: UpcomingDay) => (
              <div
                key={g.day}
                style={{
                  display: 'grid', gridTemplateColumns: '132px 20px minmax(0,1fr)',
                  gap: '0 var(--space-4)', paddingBottom: 'var(--space-6)',
                }}
              >
                <div style={{ paddingTop: 8, textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{g.weekday}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{g.dateShort} · {g.rel}</div>
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', top: 0, bottom: 'calc(var(--space-6) * -1)', width: 1, background: 'var(--color-divider)' }} />
                  <div style={{ position: 'relative', width: 9, height: 9, borderRadius: '50%', background: 'var(--color-bg)', border: '2px solid var(--color-accent)', marginTop: 12 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {g.items.map((item) => {
                    const view = itemView(item, currency);
                    return (
                      <div
                        key={item.id}
                        className="card"
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 'var(--space-4)',
                          padding: 'var(--space-3) var(--space-4)', opacity: view.opacity,
                        }}
                      >
                        <div style={{ width: 56, flex: 'none', fontSize: 16, fontWeight: 500, color: 'var(--color-accent-300)' }}>
                          {view.timeLabel}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500 }}>{item.name}</div>
                        <CompactMeta view={view} item={item} />
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ width: 28, height: 28 }}
                          title="Editar"
                          onClick={() => actions.edit(item)}
                        >
                          <PencilSimple size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--color-neutral-500)' }}>Nenhum mint com data marcada.</div>
        )}
      </section>

      <section>
        <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-3)' }}>
          Sem data · {model.undatedCount}
        </h6>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {model.undated.map((item) => {
            const view = itemView(item, currency);
            return (
              <button key={item.id} className="wl-chip" title="Definir data" onClick={() => actions.edit(item)}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: view.dot }} />
                {item.name}
                <span style={{ color: 'var(--color-neutral-500)', fontSize: 11 }}>{view.statusLabel}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

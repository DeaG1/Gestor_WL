import type { Tab, Wallet } from '../lib/types.ts';

export interface SidebarBadges {
  hoje: string;
  lista: string;
  notif: string;
}

export interface WalletCardView {
  wallet: Wallet;
  dot: string;
  name: string;
  sub: string;
  count: number;
}

interface SidebarProps {
  tab: Tab;
  onTab: (tab: Tab) => void;
  badges: SidebarBadges;
  walletCards: WalletCardView[];
  nowLabel: string;
  onNew: () => void;
}

const NAV_ITEMS: { tab: Tab; label: string }[] = [
  { tab: 'dash', label: 'Dashboard' },
  { tab: 'hoje', label: 'Hoje' },
  { tab: 'lista', label: 'Lista' },
  { tab: 'cal', label: 'Calendário' },
  { tab: 'notif', label: 'Notificações' },
];

const badgeFor = (tab: Tab, badges: SidebarBadges): string => {
  switch (tab) {
    case 'hoje': return badges.hoje;
    case 'lista': return badges.lista;
    case 'notif': return badges.notif;
    default: return '';
  }
};

export default function Sidebar({ tab, onTab, badges, walletCards, nowLabel, onNew }: SidebarProps) {
  return (
    <aside
      style={{
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', gap: 'var(--space-8)',
        padding: 'var(--space-8) var(--space-6)',
        borderRight: '1px solid var(--color-divider)',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <div style={{
          fontFamily: 'var(--font-heading)', fontWeight: 500, fontSize: 20, letterSpacing: '-0.01em',
        }}
        >
          Gestor WL
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 2 }}>
          FCFS · GTD · Blowfly & MEGA
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((n) => (
          <button
            key={n.tab}
            type="button"
            className={`wl-nav-item${n.tab === tab ? ' wl-nav-item-active' : ''}`}
            onClick={() => onTab(n.tab)}
          >
            <span>{n.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-neutral-500)' }}>
              {badgeFor(n.tab, badges)}
            </span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="btn btn-primary btn-block"
        style={{ marginTop: 0 }}
        onClick={onNew}
      >
        + Nova WL
      </button>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {walletCards.map((w) => (
          <div
            key={w.wallet}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: w.dot, flex: 'none' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{w.sub}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>{w.count}</div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--color-neutral-600)', padding: '4px 2px' }}>
          {nowLabel}
        </div>
      </div>
    </aside>
  );
}

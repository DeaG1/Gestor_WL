import { useState } from 'react';
import { overviewModel } from '../../domain/dashboard-overview.ts';
import { financeModel } from '../../domain/dashboard-finance.ts';
import type { ScreenProps } from '../actions.ts';
import { WALLETS, type DashScope } from '../../lib/types.ts';
import { Seg } from '../../ui/Seg.tsx';
import Kpis from './Kpis.tsx';
import WalletBars from './WalletBars.tsx';
import TypeDonut from './TypeDonut.tsx';
import AgendaBars from './AgendaBars.tsx';
import ProfitLine from './ProfitLine.tsx';
import WalletPnl from './WalletPnl.tsx';
import MintedTable from './MintedTable.tsx';

const SCOPE_OPTIONS: DashScope[] = ['Tudo', ...WALLETS];

export default function Dashboard({ gestor, today, actions }: ScreenProps) {
  const [scope, setScope] = useState<DashScope>('Tudo');
  const currency = gestor.settings.currency;

  const overview = overviewModel(gestor.items, today, scope, currency);
  const finance = financeModel(gestor.items, scope, currency);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Dashboard
          </div>
          <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Visão geral</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--color-neutral-400)' }}>{overview.summary}</p>
        </div>
        <Seg name="dash-scope" value={scope} options={SCOPE_OPTIONS} onChange={setScope} />
      </header>

      <Kpis kpis={overview.kpis} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,440px), 1fr))', gap: 'var(--space-3)' }}>
        <WalletBars bars={overview.walletBars} legend={overview.typeLegend} />
        <TypeDonut bg={overview.donutBg} center={overview.donutCenter} legend={overview.typeLegend} />
        <AgendaBars bars={overview.agendaBars} />
        <ProfitLine line={finance.line} total={finance.profitTotal} color={finance.profitColor} />
      </div>

      <WalletPnl rows={finance.walletPnl} />

      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <h6 style={{ color: 'var(--color-neutral-500)', margin: 0 }}>Mints registrados</h6>
          <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{finance.pnlCount}</span>
        </div>
        <MintedTable rows={finance.mintedRows} currency={currency} onEdit={actions.edit} />
      </section>
    </div>
  );
}

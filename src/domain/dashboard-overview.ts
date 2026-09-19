import { short } from '@shared/date.ts';
import { money, num } from '@shared/money.ts';
import { NEG, POS, TYPE_COLORS, TYPE_KEYS, type TypeKey } from '../lib/tokens.ts';
import { WALLETS, type DashScope, type Wallet, type WLItem } from '../lib/types.ts';
import { walletCountsLabel } from './wallet-cards.ts';

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  color: string;
}

export interface WalletBar {
  name: Wallet;
  count: number;
  minted: number;
  segs: { title: string; width: string; color: string }[];
}

export interface TypeLegendRow {
  label: TypeKey;
  color: string;
  count: number;
  pct: string;
}

export interface AgendaBar {
  count: number;
  height: string;
  label: string;
  title: string;
  color: string;
  numColor: string;
  labelColor: string;
}

export interface OverviewModel {
  summary: string;
  kpis: Kpi[];
  walletBars: WalletBar[];
  typeLegend: TypeLegendRow[];
  donutBg: string;
  donutCenter: string;
  agendaBars: AgendaBar[];
}

export const typeKeyOf = (item: WLItem): TypeKey => (item.type || 'Sem tipo') as TypeKey;

const sumBy = (list: WLItem[], key: 'cost' | 'sold'): number =>
  list.reduce((acc, i) => acc + num(i[key]), 0);

export const overviewModel = (
  items: WLItem[],
  today: string,
  scope: DashScope,
  currency: string,
): OverviewModel => {
  const scoped = scope === 'Tudo' ? items : items.filter((i) => i.wallet === scope);
  const minted = scoped.filter((i) => i.done === 'mintado');
  const byWallet = (w: Wallet) => items.filter((i) => i.wallet === w);

  const totalCost = sumBy(minted, 'cost');
  const totalSold = sumBy(minted, 'sold');
  const totalProfit = totalSold - totalCost;
  const scheduled = scoped.filter((i) => i.done === 'pendente' && i.date >= today && i.date).length;
  const undatedAll = items.filter((i) => !i.date && i.done === 'pendente').length;

  const kpis: Kpi[] = [
    {
      label: 'WL totais',
      value: String(scoped.length),
      sub: walletCountsLabel(items),
      color: 'var(--color-text)',
    },
    {
      label: 'Mintadas',
      value: String(minted.length),
      sub: `${scoped.filter((i) => i.done === 'pulado').length} puladas · ${scheduled} agendadas`,
      color: 'var(--color-text)',
    },
    {
      label: 'Gasto',
      value: money(totalCost, currency),
      sub: 'soma dos custos de mint',
      color: 'var(--color-text)',
    },
    {
      label: 'Vendido',
      value: money(totalSold, currency),
      sub: 'soma das vendas',
      color: 'var(--color-text)',
    },
    {
      label: 'Lucro',
      value: money(totalProfit, currency),
      sub: totalCost ? `ROI ${Math.round((totalProfit / totalCost) * 100)}%` : 'registre custo e venda',
      color: totalProfit < 0 ? NEG : POS,
    },
  ];

  const walletBars: WalletBar[] = (scope === 'Tudo' ? WALLETS : [scope]).map((w) => {
    const list = byWallet(w);
    return {
      name: w,
      count: list.length,
      minted: list.filter((i) => i.done === 'mintado').length,
      segs: TYPE_KEYS.map((k) => {
        const count = list.filter((i) => typeKeyOf(i) === k).length;
        return {
          title: `${k}: ${count}`,
          width: list.length ? `${(count / list.length) * 100}%` : '0%',
          color: TYPE_COLORS[k],
        };
      }).filter((s) => s.width !== '0%'),
    };
  });

  const typeLegend: TypeLegendRow[] = TYPE_KEYS.map((k) => {
    const count = scoped.filter((i) => typeKeyOf(i) === k).length;
    return {
      label: k,
      color: TYPE_COLORS[k],
      count,
      pct: scoped.length ? `${Math.round((count / scoped.length) * 100)}%` : '0%',
    };
  });

  let acc = 0;
  const stops = typeLegend
    .filter((t) => t.count)
    .map((t) => {
      const from = acc;
      acc += (t.count / scoped.length) * 100;
      return `${t.color} ${from}% ${acc}%`;
    });

  const gtd = scoped.filter((i) => i.type.includes('GTD')).length;

  const agendaDays = [...new Set(scoped.filter((i) => i.date).map((i) => i.date))].sort().slice(0, 8);
  const agendaMax = Math.max(1, ...agendaDays.map((d) => scoped.filter((i) => i.date === d).length));

  const agendaBars: AgendaBar[] = agendaDays.map((d) => {
    const onDay = scoped.filter((i) => i.date === d);
    const isPast = d < today;
    const isToday = d === today;
    return {
      count: onDay.length,
      height: `${(onDay.length / agendaMax) * 100}%`,
      label: short(d),
      title: onDay.map((i) => i.name).join(', '),
      color: isToday
        ? 'var(--color-accent)'
        : isPast
          ? 'var(--color-neutral-800)'
          : 'var(--color-accent-700)',
      numColor: isPast ? 'var(--color-neutral-600)' : 'var(--color-text)',
      labelColor: isToday ? 'var(--color-accent)' : 'var(--color-neutral-500)',
    };
  });

  return {
    summary:
      `${items.length} WL em ${WALLETS.length} wallets · ` +
      `${items.filter((i) => i.done === 'mintado').length} mintadas · ` +
      `${undatedAll} ainda sem data`,
    kpis,
    walletBars,
    typeLegend,
    donutBg: stops.length ? `conic-gradient(${stops.join(', ')})` : 'var(--color-neutral-900)',
    donutCenter: scoped.length ? `${Math.round((gtd / scoped.length) * 100)}%` : '0%',
    agendaBars,
  };
};

import { short } from '@shared/date.ts';
import { money, num } from '@shared/money.ts';
import { NEG, POS, WDOT } from '../lib/tokens.ts';
import { WALLETS, type DashScope, type Wallet, type WLItem } from '../lib/types.ts';

export interface ProfitLine {
  dots: { x: number; y: number }[];
  points: string;
  areaPoints: string;
  zeroY: number;
  first: string;
  last: string;
}

export interface WalletPnl {
  name: Wallet;
  dot: string;
  minted: number;
  cost: string;
  sold: string;
  profit: string;
  profitColor: string;
  roiWidth: string;
  roiLabel: string;
}

export interface FinanceModel {
  profitTotal: string;
  profitColor: string;
  line: ProfitLine | null;
  walletPnl: WalletPnl[];
  mintedRows: WLItem[];
  pnlCount: string;
}

const sumBy = (list: WLItem[], key: 'cost' | 'sold'): number =>
  list.reduce((acc, i) => acc + num(i[key]), 0);

export const financeModel = (
  items: WLItem[],
  scope: DashScope,
  currency: string,
): FinanceModel => {
  const scoped = scope === 'Tudo' ? items : items.filter((i) => i.wallet === scope);
  const minted = scoped.filter((i) => i.done === 'mintado');
  const totalProfit = sumBy(minted, 'sold') - sumBy(minted, 'cost');

  const series = minted
    .filter((i) => num(i.cost) || num(i.sold))
    .sort((a, b) => (a.date || '9').localeCompare(b.date || '9'));

  let running = 0;
  const cumulative = series.map((i) => (running += num(i.sold) - num(i.cost)));

  let line: ProfitLine | null = null;

  if (cumulative.length) {
    const all = [0, ...cumulative];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const span = max - min || 1;
    const px = (k: number) => (series.length > 1 ? (k / (series.length - 1)) * 600 : 300);
    const py = (v: number) => 10 + (1 - (v - min) / span) * 130;

    const dots = cumulative.map((v, k) => ({ x: px(k), y: py(v) }));
    const points = dots.map((p) => `${p.x},${p.y}`).join(' ');
    const zeroY = py(0);
    const label = (i: WLItem) => `${i.name} · ${i.date ? short(i.date) : ''}`;

    line = {
      dots,
      points,
      areaPoints: `${dots[0].x},${zeroY} ${points} ${dots[dots.length - 1].x},${zeroY}`,
      zeroY,
      first: label(series[0]),
      last: series.length > 1 ? label(series[series.length - 1]) : '',
    };
  }

  const walletPnl: WalletPnl[] = WALLETS.map((w) => {
    const list = items.filter((i) => i.wallet === w && i.done === 'mintado');
    const cost = sumBy(list, 'cost');
    const sold = sumBy(list, 'sold');
    const profit = sold - cost;
    return {
      name: w,
      dot: WDOT[w],
      minted: list.length,
      cost: money(cost, currency),
      sold: money(sold, currency),
      profit: money(profit, currency),
      profitColor: profit < 0 ? NEG : POS,
      roiWidth: cost ? `${Math.max(0, Math.min(100, (sold / cost) * 50))}%` : '0%',
      roiLabel: cost
        ? `ROI ${Math.round((profit / cost) * 100)}% · cada ${currency} 1 gasto virou ` +
          `${currency} ${(sold / cost).toFixed(2)}`
        : 'sem custo registrado ainda',
    };
  });

  const mintedRows = [...minted].sort((a, b) => b.date.localeCompare(a.date));

  return {
    profitTotal: money(totalProfit, currency),
    profitColor: totalProfit < 0 ? NEG : POS,
    line,
    walletPnl,
    mintedRows,
    pnlCount: mintedRows.length ? `${mintedRows.length} · lucro ${money(totalProfit, currency)}` : '',
  };
};

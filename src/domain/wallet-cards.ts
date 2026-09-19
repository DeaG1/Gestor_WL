import { WALLETS, type Wallet, type WLItem } from '../lib/types.ts';

export interface WalletCard {
  wallet: Wallet;
  count: number;
  minted: number;
  undated: number;
  sub: string;
}

/** "Blowfly, MEGA & Loculus" — os nomes no formato do subtítulo da marca. */
export const walletNames = (wallets: readonly string[] = WALLETS): string =>
  wallets.length <= 1
    ? wallets.join('')
    : `${wallets.slice(0, -1).join(', ')} & ${wallets[wallets.length - 1]}`;

/** "3 Blowfly · 2 MEGA · 0 Loculus" — contagem por wallet, na ordem de WALLETS. */
export const walletCountsLabel = (items: WLItem[]): string =>
  WALLETS.map((w) => `${items.filter((i) => i.wallet === w).length} ${w}`).join(' · ');

/** Os mini-cards do rodapé da sidebar, um por wallet. */
export const walletCards = (items: WLItem[]): WalletCard[] =>
  WALLETS.map((wallet) => {
    const list = items.filter((i) => i.wallet === wallet);
    const minted = list.filter((i) => i.done === 'mintado').length;
    const undated = list.filter((i) => !i.date && i.done === 'pendente').length;
    return {
      wallet,
      count: list.length,
      minted,
      undated,
      sub: `${minted} mintadas · ${undated} sem data`,
    };
  });

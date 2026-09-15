import { WALLETS, type Wallet, type WLItem } from '../lib/types.ts';

export interface WalletCard {
  wallet: Wallet;
  count: number;
  minted: number;
  undated: number;
  sub: string;
}

/** Os dois mini-cards do rodapé da sidebar, um por wallet. */
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

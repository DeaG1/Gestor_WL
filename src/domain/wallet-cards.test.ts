import { describe, expect, it } from 'vitest';
import { walletCards } from './wallet-cards.ts';
import type { WLItem } from '../lib/types.ts';

const make = (over: Partial<WLItem>): WLItem => ({
  id: Math.random().toString(36), name: 'X', wallet: 'Blowfly', type: 'FCFS', chain: 'RH',
  date: '', time: '', status: 'TBH', cost: null, sold: null, supply: null,
  link: '', notes: '', done: 'pendente', ...over,
});

describe('walletCards', () => {
  it('devolve sempre as duas wallets, na ordem', () => {
    expect(walletCards([]).map((c) => c.wallet)).toEqual(['Blowfly', 'MEGA']);
  });

  it('conta o total e as mintadas de cada wallet', () => {
    const cards = walletCards([
      make({ wallet: 'Blowfly', done: 'mintado' }),
      make({ wallet: 'Blowfly' }),
      make({ wallet: 'MEGA' }),
    ]);
    expect(cards[0].count).toBe(2);
    expect(cards[0].minted).toBe(1);
    expect(cards[1].count).toBe(1);
  });

  it('conta como "sem data" só o que ainda está pendente', () => {
    const cards = walletCards([
      make({ wallet: 'Blowfly', date: '' }),                      // conta
      make({ wallet: 'Blowfly', date: '', done: 'mintado' }),     // não conta
      make({ wallet: 'Blowfly', date: '', done: 'pulado' }),      // não conta
      make({ wallet: 'Blowfly', date: '2026-09-15' }),            // não conta
    ]);
    expect(cards[0].undated).toBe(1);
  });

  it('monta o subtítulo do card', () => {
    const cards = walletCards([make({ wallet: 'MEGA', done: 'mintado' }), make({ wallet: 'MEGA' })]);
    expect(cards[1].sub).toBe('1 mintadas · 1 sem data');
  });
});

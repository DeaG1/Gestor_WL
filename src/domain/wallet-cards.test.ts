import { describe, expect, it } from 'vitest';
import { walletCards, walletNames } from './wallet-cards.ts';
import type { WLItem } from '../lib/types.ts';

const make = (over: Partial<WLItem>): WLItem => ({
  id: Math.random().toString(36), name: 'X', wallet: 'Blowfly', type: 'FCFS', chain: 'RH',
  date: '', time: '', status: 'TBH', cost: null, sold: null, supply: null,
  link: '', notes: '', done: 'pendente', ...over,
});

describe('walletCards', () => {
  it('devolve sempre todas as wallets, na ordem', () => {
    expect(walletCards([]).map((c) => c.wallet)).toEqual(['Blowfly', 'MEGA', 'Loculus']);
  });

  it('conta a Loculus no terceiro card', () => {
    const cards = walletCards([make({ wallet: 'Loculus', done: 'mintado' }), make({ wallet: 'Loculus' })]);
    expect(cards[2].count).toBe(2);
    expect(cards[2].minted).toBe(1);
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

  it('junta os nomes das wallets no formato da marca', () => {
    expect(walletNames(['Blowfly', 'MEGA'])).toBe('Blowfly & MEGA');
    expect(walletNames()).toBe('Blowfly, MEGA & Loculus');
    expect(walletNames(['Blowfly'])).toBe('Blowfly');
  });

  it('monta o subtítulo do card', () => {
    const cards = walletCards([make({ wallet: 'MEGA', done: 'mintado' }), make({ wallet: 'MEGA' })]);
    expect(cards[1].sub).toBe('1 mintadas · 1 sem data');
  });
});

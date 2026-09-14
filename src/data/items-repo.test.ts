import { describe, expect, it } from 'vitest';
import { itemToRow, rowToItem, type WLItemRow } from './items-repo.ts';

const row = (over: Partial<WLItemRow> = {}): WLItemRow => ({
  id: 'abc', name: 'Fortune Foes', wallet: 'MEGA', type: '', chain: '',
  mint_date: '2026-09-15', mint_time: '06:00:00', status: 'Confirmado',
  cost: null, sold: null, supply: null, link: '', notes: '', done: 'pendente',
  ...over,
});

describe('rowToItem', () => {
  it('corta os segundos do horário', () => {
    expect(rowToItem(row()).time).toBe('06:00');
  });

  it('troca null por string vazia em data e hora', () => {
    const item = rowToItem(row({ mint_date: null, mint_time: null }));
    expect(item.date).toBe('');
    expect(item.time).toBe('');
  });

  it('preserva null em custo e venda', () => {
    const item = rowToItem(row());
    expect(item.cost).toBeNull();
    expect(item.sold).toBeNull();
  });

  it('converte numeric que volta como string', () => {
    const item = rowToItem(row({ cost: '0.02', sold: 1.5 }));
    expect(item.cost).toBe(0.02);
    expect(item.sold).toBe(1.5);
  });
});

describe('itemToRow', () => {
  it('manda só os campos presentes no patch', () => {
    expect(itemToRow({ done: 'mintado' })).toEqual({ done: 'mintado' });
  });

  it('renomeia data e hora, virando null quando vazias', () => {
    expect(itemToRow({ date: '', time: '' })).toEqual({ mint_date: null, mint_time: null });
    expect(itemToRow({ date: '2026-09-15', time: '06:00' }))
      .toEqual({ mint_date: '2026-09-15', mint_time: '06:00' });
  });

  it('deixa custo null passar como null, não como zero', () => {
    expect(itemToRow({ cost: null, sold: 0 })).toEqual({ cost: null, sold: 0 });
  });

  it('nunca manda o id no patch', () => {
    expect(itemToRow({ id: 'abc', name: 'X' })).toEqual({ name: 'X' });
  });
});

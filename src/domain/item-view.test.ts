import { describe, expect, it } from 'vitest';
import { itemView } from './item-view.ts';
import type { WLItem } from '../lib/types.ts';

const make = (over: Partial<WLItem> = {}): WLItem => ({
  id: '1', name: 'Fortune Foes', wallet: 'MEGA', type: '', chain: '',
  date: '2026-09-15', time: '06:00', status: 'Confirmado',
  cost: null, sold: null, supply: null, link: '', notes: '', done: 'pendente',
  ...over,
});

describe('itemView — horário e data', () => {
  it('mostra a hora e o sufixo BRT quando há horário', () => {
    const v = itemView(make(), '$');
    expect(v.timeLabel).toBe('06:00');
    expect(v.timeShort).toBe('06:00');
    expect(v.timeSub).toBe('BRT');
  });

  it('cai para TBH quando não há horário', () => {
    const v = itemView(make({ time: '' }), '$');
    expect(v.timeLabel).toBe('—');
    expect(v.timeShort).toBe('TBH');
    expect(v.timeSub).toBe('horário TBH');
  });

  it('formata a data curta e a data com hora', () => {
    const v = itemView(make(), '$');
    expect(v.dateShort).toBe('ter 15/09');
    expect(v.dateTime).toBe('ter 15/09 · 06:00');
  });

  it('diz "sem data" e "—" quando não há data', () => {
    const v = itemView(make({ date: '', time: '' }), '$');
    expect(v.dateShort).toBe('sem data');
    expect(v.dateTime).toBe('—');
  });
});

describe('itemView — dinheiro', () => {
  it('esconde custo e venda enquanto o item é pendente e nada foi registrado', () => {
    const v = itemView(make(), '$');
    expect(v.costLabel).toBe('');
    expect(v.soldLabel).toBe('');
    expect(v.profitLabel).toBe('');
  });

  it('mostra zero explícito quando o item foi mintado', () => {
    const v = itemView(make({ done: 'mintado' }), '$');
    expect(v.costLabel).toBe('$ 0');
    expect(v.soldLabel).toBe('$ 0');
    expect(v.profitLabel).toBe('$ 0');
  });

  it('calcula o lucro e usa a cor positiva', () => {
    const v = itemView(make({ done: 'mintado', cost: 0.02, sold: 0.5 }), '$');
    expect(v.profit).toBeCloseTo(0.48);
    expect(v.profitLabel).toBe('$ 0,48');
    expect(v.profitColor).toBe('var(--color-accent-300)');
  });

  it('usa a cor neutra quando o lucro é negativo', () => {
    const v = itemView(make({ done: 'mintado', cost: 1, sold: 0.5 }), '$');
    expect(v.profitLabel).toBe('−$ 0,5');
    expect(v.profitColor).toBe('var(--color-neutral-400)');
  });
});

describe('itemView — status e estado', () => {
  it('mostra o status do item por extenso enquanto ele é pendente', () => {
    expect(itemView(make({ status: 'TBH' }), '$').statusLabel).toBe('Sem horário');
    expect(itemView(make({ status: 'TBA' }), '$').statusLabel).toBe('Sem data');
    expect(itemView(make({ status: 'Confirmado' }), '$').statusLabel).toBe('Confirmado');
  });

  it('escolhe a cor pelo status guardado, não pelo texto exibido', () => {
    // O banco guarda TBH/TBA; se a cor fosse buscada pelo rótulo traduzido,
    // cairia no fallback e os dois status ficariam da mesma cor.
    const tbh = itemView(make({ status: 'TBH' }), '$');
    const tba = itemView(make({ status: 'TBA' }), '$');
    expect(tbh.statusBg).toBe('oklch(0.42 0.10 55)');
    expect(tba.statusBg).toBe('var(--color-neutral-800)');
    expect(tbh.statusBg).not.toBe(tba.statusBg);
  });

  it('troca o status por Mintado e risca o nome', () => {
    const v = itemView(make({ done: 'mintado' }), '$');
    expect(v.statusLabel).toBe('Mintado');
    expect(v.deco).toBe('line-through');
    expect(v.opacity).toBe(0.5);
    expect(v.ring).toBe('0 0 0 1px var(--color-accent-700)');
  });

  it('troca o status por Pulado sem riscar', () => {
    const v = itemView(make({ done: 'pulado' }), '$');
    expect(v.statusLabel).toBe('Pulado');
    expect(v.deco).toBe('none');
    expect(v.opacity).toBe(0.5);
  });

  it('vira Desfazer nos botões do item já resolvido', () => {
    expect(itemView(make({ done: 'mintado' }), '$').mintLabel).toBe('Desfazer');
    expect(itemView(make({ done: 'pulado' }), '$').skipLabel).toBe('Desfazer');
    expect(itemView(make(), '$').mintLabel).toBe('Mintado');
    expect(itemView(make(), '$').skipLabel).toBe('Pular');
  });

  it('assume qtd 1 num item mintado sem supply', () => {
    expect(itemView(make({ done: 'mintado' }), '$').supplyLabel).toBe('1');
    expect(itemView(make(), '$').supplyLabel).toBe('');
    expect(itemView(make({ supply: 3 }), '$').supplyLabel).toBe('3');
  });

  it('leva as cores da wallet', () => {
    const v = itemView(make({ wallet: 'Blowfly' }), '$');
    expect(v.dot).toBe('oklch(0.82 0.15 88)');
    expect(v.walletBg).toBe('oklch(0.42 0.09 85)');
  });
});

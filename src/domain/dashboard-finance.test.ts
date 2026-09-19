import { describe, expect, it } from 'vitest';
import { financeModel } from './dashboard-finance.ts';
import type { WLItem } from '../lib/types.ts';

const make = (over: Partial<WLItem>): WLItem => ({
  id: Math.random().toString(36), name: 'X', wallet: 'Blowfly', type: 'FCFS', chain: 'RH',
  date: '', time: '', status: 'TBH', cost: null, sold: null, supply: null,
  link: '', notes: '', done: 'pendente', ...over,
});

describe('financeModel — linha de lucro', () => {
  it('não monta linha quando nada foi mintado com valor', () => {
    const m = financeModel([make({ done: 'mintado' })], 'Tudo', '$');
    expect(m.line).toBeNull();
  });

  it('acumula o lucro em ordem de data', () => {
    const items = [
      make({ name: 'B', done: 'mintado', date: '2026-09-12', cost: 1, sold: 5 }),
      make({ name: 'A', done: 'mintado', date: '2026-09-10', cost: 2, sold: 1 }),
    ];
    const m = financeModel(items, 'Tudo', '$');
    expect(m.line!.dots.length).toBe(2);
    expect(m.profitTotal).toBe('$ 3');
    // A primeiro (−1 acumulado), depois B (+3).
    expect(m.line!.first).toBe('A · qui 10/09');
    expect(m.line!.last).toBe('B · sáb 12/09');
  });

  it('espalha os pontos na largura de 600 e fecha a área no zero', () => {
    const items = [
      make({ done: 'mintado', date: '2026-09-10', cost: 0, sold: 2 }),
      make({ done: 'mintado', date: '2026-09-11', cost: 0, sold: 2 }),
      make({ done: 'mintado', date: '2026-09-12', cost: 0, sold: 2 }),
    ];
    const line = financeModel(items, 'Tudo', '$').line!;
    expect(line.dots.map((d) => d.x)).toEqual([0, 300, 600]);
    expect(line.areaPoints.startsWith(`0,${line.zeroY} `)).toBe(true);
    expect(line.areaPoints.endsWith(` 600,${line.zeroY}`)).toBe(true);
  });

  it('centraliza o ponto único', () => {
    const items = [make({ done: 'mintado', date: '2026-09-10', cost: 1, sold: 2 })];
    expect(financeModel(items, 'Tudo', '$').line!.dots[0].x).toBe(300);
  });
});

describe('financeModel — resultado por wallet', () => {
  const items = [
    make({ wallet: 'Blowfly', done: 'mintado', date: '2026-09-10', cost: 1, sold: 3 }),
    make({ wallet: 'MEGA', done: 'mintado', date: '2026-09-11', cost: 2, sold: 1 }),
  ];

  it('mostra todas as wallets mesmo com o escopo filtrado', () => {
    expect(financeModel(items, 'MEGA', '$').walletPnl.map((w) => w.name))
      .toEqual(['Blowfly', 'MEGA', 'Loculus']);
  });

  it('soma por wallet e descreve o ROI', () => {
    const [blowfly, mega] = financeModel(items, 'Tudo', '$').walletPnl;
    expect(blowfly.cost).toBe('$ 1');
    expect(blowfly.sold).toBe('$ 3');
    expect(blowfly.profit).toBe('$ 2');
    expect(blowfly.roiLabel).toBe('ROI 200% · cada $ 1 gasto virou $ 3.00');
    expect(mega.profit).toBe('−$ 1');
    expect(mega.profitColor).toBe('var(--color-neutral-400)');
  });

  it('avisa quando não há custo registrado', () => {
    const m = financeModel([make({ wallet: 'Blowfly' })], 'Tudo', '$');
    expect(m.walletPnl[0].roiLabel).toBe('sem custo registrado ainda');
    expect(m.walletPnl[0].roiWidth).toBe('0%');
  });

  it('limita a barra de ROI a 100%', () => {
    const rico = [make({ wallet: 'Blowfly', done: 'mintado', cost: 1, sold: 50 })];
    expect(financeModel(rico, 'Tudo', '$').walletPnl[0].roiWidth).toBe('100%');
  });
});

describe('financeModel — tabela de mints', () => {
  it('lista só os mintados do escopo, do mais recente para o mais antigo', () => {
    const items = [
      make({ name: 'Velho', done: 'mintado', date: '2026-09-01' }),
      make({ name: 'Novo', done: 'mintado', date: '2026-09-20' }),
      make({ name: 'Pendente' }),
    ];
    const m = financeModel(items, 'Tudo', '$');
    expect(m.mintedRows.map((i) => i.name)).toEqual(['Novo', 'Velho']);
    expect(m.pnlCount).toBe('2 · lucro $ 0');
  });

  it('deixa o contador vazio quando não há mint registrado', () => {
    expect(financeModel([], 'Tudo', '$').pnlCount).toBe('');
  });
});

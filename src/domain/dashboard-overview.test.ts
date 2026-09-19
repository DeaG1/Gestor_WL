import { describe, expect, it } from 'vitest';
import { overviewModel } from './dashboard-overview.ts';
import type { WLItem } from '../lib/types.ts';

const make = (over: Partial<WLItem>): WLItem => ({
  id: Math.random().toString(36), name: 'X', wallet: 'Blowfly', type: 'FCFS', chain: 'RH',
  date: '', time: '', status: 'TBH', cost: null, sold: null, supply: null,
  link: '', notes: '', done: 'pendente', ...over,
});

const TODAY = '2026-09-13';

const items: WLItem[] = [
  make({ name: 'A', wallet: 'Blowfly', type: 'FCFS', done: 'mintado', cost: 1, sold: 3, date: '2026-09-10' }),
  make({ name: 'B', wallet: 'Blowfly', type: 'GTD', date: '2026-09-15' }),
  make({ name: 'C', wallet: 'Blowfly', type: '' }),
  make({ name: 'D', wallet: 'MEGA', type: 'GTD + FCFS', done: 'pulado' }),
  make({ name: 'E', wallet: 'MEGA', type: 'GTD', date: '2026-09-15' }),
];

describe('overviewModel — resumo e KPIs', () => {
  it('resume sempre o conjunto inteiro, ignorando o escopo', () => {
    const m = overviewModel(items, TODAY, 'Blowfly', '$');
    // Sem data e ainda pendente é só o C: o D não tem data, mas está pulado.
    expect(m.summary).toBe('5 WL em 3 wallets · 1 mintadas · 1 ainda sem data');
  });

  it('conta as WL do escopo', () => {
    expect(overviewModel(items, TODAY, 'Tudo', '$').kpis[0].value).toBe('5');
    expect(overviewModel(items, TODAY, 'MEGA', '$').kpis[0].value).toBe('2');
  });

  it('mantém o sub do primeiro KPI sobre todas as wallets', () => {
    expect(overviewModel(items, TODAY, 'MEGA', '$').kpis[0].sub).toBe('3 Blowfly · 2 MEGA · 0 Loculus');
  });

  it('conta a Loculus no resumo e no sub do primeiro KPI', () => {
    const comLoculus = [...items, make({ name: 'L', wallet: 'Loculus' })];
    const m = overviewModel(comLoculus, TODAY, 'Tudo', '$');
    expect(m.summary.startsWith('6 WL em 3 wallets')).toBe(true);
    expect(m.kpis[0].sub).toBe('3 Blowfly · 2 MEGA · 1 Loculus');
  });

  it('conta mintadas, puladas e agendadas', () => {
    const m = overviewModel(items, TODAY, 'Tudo', '$');
    expect(m.kpis[1].value).toBe('1');
    // agendadas = pendentes com data >= hoje: B e E.
    expect(m.kpis[1].sub).toBe('1 puladas · 2 agendadas');
  });

  it('soma gasto, vendido e lucro só dos mintados', () => {
    const m = overviewModel(items, TODAY, 'Tudo', '$');
    expect(m.kpis[2].value).toBe('$ 1');
    expect(m.kpis[3].value).toBe('$ 3');
    expect(m.kpis[4].value).toBe('$ 2');
    expect(m.kpis[4].sub).toBe('ROI 200%');
  });

  it('pede o registro quando não há custo lançado', () => {
    const m = overviewModel([make({ name: 'Z' })], TODAY, 'Tudo', '$');
    expect(m.kpis[4].sub).toBe('registre custo e venda');
    expect(m.kpis[4].color).toBe('var(--color-accent-300)');
  });

  it('pinta o lucro negativo de neutro', () => {
    const perda = [make({ done: 'mintado', cost: 3, sold: 1 })];
    expect(overviewModel(perda, TODAY, 'Tudo', '$').kpis[4].color).toBe('var(--color-neutral-400)');
  });
});

describe('overviewModel — barras por wallet e donut', () => {
  it('mostra todas as wallets quando o escopo é Tudo, e só uma quando filtrado', () => {
    expect(overviewModel(items, TODAY, 'Tudo', '$').walletBars.map((b) => b.name))
      .toEqual(['Blowfly', 'MEGA', 'Loculus']);
    expect(overviewModel(items, TODAY, 'MEGA', '$').walletBars.map((b) => b.name)).toEqual(['MEGA']);
  });

  it('divide a barra por tipo, em proporção, descartando os tipos zerados', () => {
    const bar = overviewModel(items, TODAY, 'Blowfly', '$').walletBars[0];
    expect(bar.count).toBe(3);
    expect(bar.minted).toBe(1);
    expect(bar.segs.map((s) => s.title)).toEqual(['FCFS: 1', 'GTD: 1', 'Sem tipo: 1']);
    expect(bar.segs[0].width).toBe('33.33333333333333%');
  });

  it('conta cada tipo na legenda, com percentual', () => {
    const legend = overviewModel(items, TODAY, 'Tudo', '$').typeLegend;
    expect(legend.map((l) => [l.label, l.count, l.pct])).toEqual([
      ['FCFS', 1, '20%'],
      ['GTD', 2, '40%'],
      ['GTD + FCFS', 1, '20%'],
      ['Sem tipo', 1, '20%'],
    ]);
  });

  it('mede o centro do donut pelos que têm GTD no tipo', () => {
    // GTD, GTD e GTD + FCFS = 3 de 5.
    expect(overviewModel(items, TODAY, 'Tudo', '$').donutCenter).toBe('60%');
  });

  it('deixa o donut neutro quando não há nada no escopo', () => {
    expect(overviewModel([], TODAY, 'Tudo', '$').donutBg).toBe('var(--color-neutral-900)');
    expect(overviewModel([], TODAY, 'Tudo', '$').donutCenter).toBe('0%');
  });
});

describe('overviewModel — agenda', () => {
  it('agrupa por data, ordena e mede a barra pela maior', () => {
    const m = overviewModel(items, TODAY, 'Tudo', '$');
    expect(m.agendaBars.map((b) => b.label)).toEqual(['qui 10/09', 'ter 15/09']);
    expect(m.agendaBars[1].count).toBe(2);
    expect(m.agendaBars[1].height).toBe('100%');
    expect(m.agendaBars[0].height).toBe('50%');
  });

  it('pinta passado, hoje e futuro de cores diferentes', () => {
    const comHoje = [...items, make({ name: 'Hoje', date: TODAY })];
    const bars = overviewModel(comHoje, TODAY, 'Tudo', '$').agendaBars;
    expect(bars.find((b) => b.label === 'qui 10/09')!.color).toBe('var(--color-neutral-800)');
    expect(bars.find((b) => b.label === 'dom 13/09')!.color).toBe('var(--color-accent)');
    expect(bars.find((b) => b.label === 'ter 15/09')!.color).toBe('var(--color-accent-700)');
  });

  it('para em 8 datas', () => {
    const muitas = Array.from({ length: 12 }, (_, k) =>
      make({ name: `M${k}`, date: `2026-10-${String(k + 1).padStart(2, '0')}` }));
    expect(overviewModel(muitas, TODAY, 'Tudo', '$').agendaBars.length).toBe(8);
  });
});

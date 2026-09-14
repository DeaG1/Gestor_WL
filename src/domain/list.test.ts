import { describe, expect, it } from 'vitest';
import { filterItems, listSummary } from './list.ts';
import { DEFAULT_FILTERS, type Filters, type WLItem } from '../lib/types.ts';

const make = (over: Partial<WLItem>): WLItem => ({
  id: Math.random().toString(36), name: 'X', wallet: 'Blowfly', type: 'FCFS', chain: 'RH',
  date: '', time: '', status: 'TBH', cost: null, sold: null, supply: null,
  link: '', notes: '', done: 'pendente', ...over,
});

const f = (over: Partial<Filters> = {}): Filters => ({ ...DEFAULT_FILTERS, done: 'Tudo', ...over });

describe('filterItems — busca e filtros', () => {
  const items = [
    make({ name: 'Yield Farm', wallet: 'Blowfly', type: 'FCFS', chain: 'RH' }),
    make({ name: 'Akai', wallet: 'MEGA', type: 'GTD', chain: '' }),
    make({ name: 'Misfits', wallet: 'MEGA', type: 'GTD + FCFS', chain: '' }),
    make({ name: 'Arcana', wallet: 'Blowfly', type: 'FCFS', chain: 'ARC', done: 'mintado' }),
  ];

  it('busca por nome, sem diferenciar maiúsculas', () => {
    expect(filterItems(items, f({ q: 'yield' })).map((i) => i.name)).toEqual(['Yield Farm']);
  });

  it('filtra por wallet', () => {
    expect(filterItems(items, f({ wallet: 'MEGA' })).map((i) => i.name)).toEqual(['Akai', 'Misfits']);
  });

  it('filtra por chain', () => {
    expect(filterItems(items, f({ chain: 'ARC' })).map((i) => i.name)).toEqual(['Arcana']);
  });

  it('o filtro GTD casa também com "GTD + FCFS"', () => {
    expect(filterItems(items, f({ type: 'GTD' })).map((i) => i.name)).toEqual(['Akai', 'Misfits']);
  });

  it('o filtro FCFS casa também com "GTD + FCFS"', () => {
    expect(filterItems(items, f({ type: 'FCFS' })).map((i) => i.name))
      .toEqual(['Arcana', 'Misfits', 'Yield Farm']);
  });

  it('filtra por situação', () => {
    expect(filterItems(items, f({ done: 'Mintados' })).map((i) => i.name)).toEqual(['Arcana']);
    expect(filterItems(items, f({ done: 'Pendentes' })).length).toBe(3);
  });
});

describe('filterItems — ordenação', () => {
  it('põe os itens com data primeiro, em ordem crescente', () => {
    const items = [
      make({ name: 'Sem data B' }),
      make({ name: 'Akai', date: '2026-09-23' }),
      make({ name: 'Sem data A' }),
      make({ name: 'Fortune Foes', date: '2026-09-15' }),
    ];
    expect(filterItems(items, f()).map((i) => i.name))
      .toEqual(['Fortune Foes', 'Akai', 'Sem data A', 'Sem data B']);
  });

  it('desempata por nome dentro do mesmo dia', () => {
    const items = [
      make({ name: 'Zebra', date: '2026-09-15' }),
      make({ name: 'Alfa', date: '2026-09-15' }),
    ];
    expect(filterItems(items, f()).map((i) => i.name)).toEqual(['Alfa', 'Zebra']);
  });
});

describe('listSummary', () => {
  it('conta o que está à vista e o total por wallet', () => {
    const items = [make({ wallet: 'Blowfly' }), make({ wallet: 'Blowfly' }), make({ wallet: 'MEGA' })];
    expect(listSummary(2, items)).toBe('2 de 3 WL · 2 Blowfly · 1 MEGA');
  });
});

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
    make({ name: 'Rojak', wallet: 'Blowfly', type: '', chain: '', done: 'pulado' }),
  ];

  it('busca por nome, sem diferenciar maiúsculas', () => {
    expect(filterItems(items, f({ q: 'yield' })).map((i) => i.name)).toEqual(['Yield Farm']);
  });

  it('filtra por wallet', () => {
    expect(filterItems(items, f({ wallet: 'MEGA' })).map((i) => i.name)).toEqual(['Akai', 'Misfits']);
  });

  it('filtra por "Sem tipo" sem cair na armadilha do "contém"', () => {
    // "Sem tipo" precisa de um ramo próprio: nenhum tipo contém esse texto, e
    // comparar com a string vazia seria pior ainda — todo texto a contém, e o
    // filtro devolveria a lista inteira.
    const semTipo = filterItems(items, f({ type: 'Sem tipo' }));
    expect(semTipo.map((i) => i.name)).toEqual(['Rojak']);
    expect(semTipo.length).toBeLessThan(items.length);
  });

  it('filtra por chain', () => {
    expect(filterItems(items, f({ chain: 'ARC' })).map((i) => i.name)).toEqual(['Arcana']);
  });

  it('filtra pelas redes acrescentadas depois', () => {
    const redes = [
      make({ name: 'Na Solana', chain: 'SOLANA' }),
      make({ name: 'Na Base', chain: 'BASE' }),
      make({ name: 'Na Zec', chain: 'ZEC' }),
      make({ name: 'Na BNB', chain: 'BNB' }),
    ];
    expect(filterItems(redes, f({ chain: 'SOLANA' })).map((i) => i.name)).toEqual(['Na Solana']);
    expect(filterItems(redes, f({ chain: 'BNB' })).map((i) => i.name)).toEqual(['Na BNB']);
    expect(filterItems(redes, f({ chain: 'Todas' })).length).toBe(4);
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
    expect(filterItems(items, f({ done: 'Pulados' })).map((i) => i.name)).toEqual(['Rojak']);
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
    expect(listSummary(2, items)).toBe('2 de 3 WL · 2 Blowfly · 1 MEGA · 0 Loculus');
  });

  it('conta a Loculus no resumo', () => {
    const items = [make({ wallet: 'MEGA' }), make({ wallet: 'Loculus' }), make({ wallet: 'Loculus' })];
    expect(listSummary(3, items)).toBe('3 de 3 WL · 0 Blowfly · 1 MEGA · 2 Loculus');
  });
});

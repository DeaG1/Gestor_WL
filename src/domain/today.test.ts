import { describe, expect, it } from 'vitest';
import { itemsOn, todayModel } from './today.ts';
import type { WLItem } from '../lib/types.ts';

const make = (over: Partial<WLItem>): WLItem => ({
  id: Math.random().toString(36), name: 'X', wallet: 'Blowfly', type: 'FCFS', chain: 'RH',
  date: '', time: '', status: 'TBH', cost: null, sold: null, supply: null,
  link: '', notes: '', done: 'pendente', ...over,
});

const TODAY = '2026-09-13';

describe('itemsOn', () => {
  it('pega os itens do dia ordenados por horário, com os sem hora no fim', () => {
    const items = [
      make({ name: 'Tarde', date: TODAY, time: '15:00' }),
      make({ name: 'Sem hora', date: TODAY, time: '' }),
      make({ name: 'Cedo', date: TODAY, time: '06:00' }),
      make({ name: 'Outro dia', date: '2026-09-14', time: '01:00' }),
    ];
    expect(itemsOn(items, TODAY).map((i) => i.name)).toEqual(['Cedo', 'Tarde', 'Sem hora']);
  });
});

describe('todayModel', () => {
  const items = [
    make({ name: 'Hoje pendente', date: TODAY, time: '06:00' }),
    make({ name: 'Hoje mintado', date: TODAY, time: '07:00', done: 'mintado' }),
    make({ name: 'Atrasado', date: '2026-09-10' }),
    make({ name: 'Atrasado resolvido', date: '2026-09-09', done: 'mintado' }),
    make({ name: 'Amanhã', date: '2026-09-14' }),
    make({ name: 'Depois A', date: '2026-09-15', time: '06:00' }),
    make({ name: 'Depois B', date: '2026-09-15', time: '' }),
    make({ name: 'Sem data' }),
    make({ name: 'Sem data resolvido', done: 'pulado' }),
  ];

  it('separa os mints do dia e conta só os pendentes', () => {
    const m = todayModel(items, TODAY, true);
    expect(m.todayItems.map((i) => i.name)).toEqual(['Hoje pendente', 'Hoje mintado']);
    expect(m.pendingToday).toBe(1);
  });

  it('lista os que passaram sem marcar, ignorando os já resolvidos', () => {
    const m = todayModel(items, TODAY, true);
    expect(m.past.map((i) => i.name)).toEqual(['Atrasado']);
  });

  it('esconde os atrasados quando showPast é falso', () => {
    expect(todayModel(items, TODAY, false).past).toEqual([]);
  });

  it('agrupa os próximos por data, em ordem crescente', () => {
    const m = todayModel(items, TODAY, true);
    expect(m.upcoming.map((d) => d.day)).toEqual(['2026-09-14', '2026-09-15']);
    expect(m.upcoming[1].items.map((i) => i.name)).toEqual(['Depois A', 'Depois B']);
    expect(m.futureDayCount).toBe(2);
  });

  it('rotula o dia seguinte como "amanhã" e os demais em dias', () => {
    const m = todayModel(items, TODAY, true);
    expect(m.upcoming[0].rel).toBe('amanhã');
    expect(m.upcoming[0].weekday).toBe('Segunda');
    expect(m.upcoming[1].rel).toBe('em 2 dias');
    expect(m.upcoming[1].dateShort).toBe('15/09');
  });

  it('lista os sem data ainda pendentes', () => {
    const m = todayModel(items, TODAY, true);
    expect(m.undated.map((i) => i.name)).toEqual(['Sem data']);
    expect(m.undatedCount).toBe(1);
  });

  it('escreve o título longo do dia', () => {
    expect(todayModel(items, TODAY, true).todayLong).toBe('Domingo, 13 de setembro');
  });

  it('aponta o próximo dia com mint e quem minta nele', () => {
    const m = todayModel(items, TODAY, true);
    expect(m.nextDay).toBe('2026-09-14');
    expect(m.nextLabel).toBe('seg 14/09 — Amanhã');
  });

  it('avisa quando não há próximo dia marcado', () => {
    const m = todayModel([make({ name: 'Sem data' })], TODAY, true);
    expect(m.nextDay).toBeNull();
    expect(m.nextLabel).toBe('nenhum marcado');
  });
});

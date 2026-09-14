import { describe, expect, it } from 'vitest';
import { calendarWeeks, monthTitle } from './calendar.ts';
import type { WLItem } from '../lib/types.ts';

const make = (over: Partial<WLItem>): WLItem => ({
  id: Math.random().toString(36), name: 'X', wallet: 'Blowfly', type: 'FCFS', chain: 'RH',
  date: '', time: '', status: 'TBH', cost: null, sold: null, supply: null,
  link: '', notes: '', done: 'pendente', ...over,
});

describe('monthTitle', () => {
  it('escreve o mês por extenso, capitalizado', () => {
    expect(monthTitle(2026, 8)).toBe('Setembro 2026');
    expect(monthTitle(2026, 2)).toBe('Março 2026');
  });
});

describe('calendarWeeks', () => {
  it('começa no domingo anterior ao dia 1', () => {
    // 2026-09-01 é uma terça, então a grade abre em 30/08.
    const weeks = calendarWeeks([], 2026, 8, '2026-09-13');
    expect(weeks[0].days[0].day).toBe('2026-08-30');
    expect(weeks[0].days[0].inMonth).toBe(false);
    expect(weeks[0].days[2].day).toBe('2026-09-01');
    expect(weeks[0].days[2].inMonth).toBe(true);
  });

  it('entrega sempre semanas de 7 dias', () => {
    const weeks = calendarWeeks([], 2026, 8, '2026-09-13');
    expect(weeks.every((w) => w.days.length === 7)).toBe(true);
  });

  it('não passa de 6 nem fica abaixo de 4 semanas', () => {
    for (let m = 0; m < 12; m++) {
      const weeks = calendarWeeks([], 2026, m, '2026-09-13');
      expect(weeks.length).toBeGreaterThanOrEqual(4);
      expect(weeks.length).toBeLessThanOrEqual(6);
    }
  });

  it('marca o dia de hoje', () => {
    const weeks = calendarWeeks([], 2026, 8, '2026-09-13');
    const todays = weeks.flatMap((w) => w.days).filter((d) => d.isToday);
    expect(todays.map((d) => d.day)).toEqual(['2026-09-13']);
  });

  it('pendura os mints no dia certo, ordenados por horário', () => {
    const items = [
      make({ name: 'Tarde', date: '2026-09-15', time: '15:00' }),
      make({ name: 'Cedo', date: '2026-09-15', time: '06:00' }),
      make({ name: 'Outro mês', date: '2026-10-02' }),
    ];
    const weeks = calendarWeeks(items, 2026, 8, '2026-09-13');
    const dia15 = weeks.flatMap((w) => w.days).find((d) => d.day === '2026-09-15')!;
    expect(dia15.items.map((i) => i.name)).toEqual(['Cedo', 'Tarde']);
  });
});

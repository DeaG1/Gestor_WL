import { describe, expect, it } from 'vitest';
import { cap, daysBetween, fromIso, iso, nowHHMM, pad, short, todayIso } from './date.ts';

describe('pad e cap', () => {
  it('preenche com zero à esquerda', () => {
    expect(pad(5)).toBe('05');
    expect(pad(12)).toBe('12');
  });

  it('capitaliza a primeira letra', () => {
    expect(cap('domingo')).toBe('Domingo');
    expect(cap('terça')).toBe('Terça');
  });
});

describe('iso e fromIso', () => {
  it('formata uma data local como YYYY-MM-DD', () => {
    expect(iso(new Date(2026, 8, 15))).toBe('2026-09-15');
  });

  it('faz o caminho de volta sem escorregar um dia', () => {
    expect(iso(fromIso('2026-09-15'))).toBe('2026-09-15');
  });
});

describe('short', () => {
  it('formata como dia da semana abreviado + dd/mm', () => {
    expect(short('2026-09-15')).toBe('ter 15/09');
    expect(short('2026-09-13')).toBe('dom 13/09');
  });
});

describe('todayIso', () => {
  it('usa o fuso de São Paulo, não o da máquina', () => {
    // 2026-09-14T02:00Z ainda é dia 13 às 23h em São Paulo (UTC-3).
    expect(todayIso(new Date('2026-09-14T02:00:00Z'))).toBe('2026-09-13');
  });

  it('vira o dia junto com São Paulo', () => {
    expect(todayIso(new Date('2026-09-14T03:00:00Z'))).toBe('2026-09-14');
  });
});

describe('nowHHMM', () => {
  it('devolve a hora de São Paulo em 24h', () => {
    expect(nowHHMM(new Date('2026-09-14T11:05:00Z'))).toBe('08:05');
  });

  it('usa 00:00 na meia-noite, nunca 24:00', () => {
    expect(nowHHMM(new Date('2026-09-14T03:00:00Z'))).toBe('00:00');
  });
});

describe('daysBetween', () => {
  it('conta os dias entre duas datas ISO', () => {
    expect(daysBetween('2026-09-13', '2026-09-14')).toBe(1);
    expect(daysBetween('2026-09-13', '2026-09-15')).toBe(2);
    expect(daysBetween('2026-09-15', '2026-09-13')).toBe(-2);
  });
});

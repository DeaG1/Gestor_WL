import { describe, expect, it } from 'vitest';
import { money, num } from './money.ts';

describe('num', () => {
  it('trata não-registrado como zero', () => {
    expect(num(null)).toBe(0);
    expect(num(undefined)).toBe(0);
    expect(num('')).toBe(0);
  });

  it('aceita vírgula decimal', () => {
    expect(num('1,5')).toBe(1.5);
  });

  it('aceita número e string numérica', () => {
    expect(num(2.25)).toBe(2.25);
    expect(num('2.25')).toBe(2.25);
  });

  it('devolve zero para lixo', () => {
    expect(num('abc')).toBe(0);
  });
});

describe('money', () => {
  it('formata no padrão pt-BR com a moeda na frente', () => {
    expect(money(1.5, '$')).toBe('$ 1,5');
    expect(money(1200, 'R$')).toBe('R$ 1.200');
  });

  it('usa o sinal de menos unicode em valores negativos', () => {
    expect(money(-3, '$')).toBe('−$ 3');
  });

  it('corta em duas casas decimais', () => {
    expect(money(0.025, 'ETH')).toBe('ETH 0,03');
  });
});

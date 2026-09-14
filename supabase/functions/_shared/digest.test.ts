import { describe, expect, it } from 'vitest';
import { buildDigest, type DigestItem } from './digest.ts';

const item = (over: Partial<DigestItem> = {}): DigestItem => ({
  name: 'Fortune Foes', time: '06:00', wallet: 'MEGA', type: '', chain: '',
  cost: null, link: '', ...over,
});

describe('buildDigest', () => {
  it('avisa quando não há mint no dia', () => {
    expect(buildDigest('2026-09-15', [], '$')).toBe('Nenhum mint em ter 15/09.');
  });

  it('lista um mint com horário e wallet', () => {
    expect(buildDigest('2026-09-15', [item()], '$')).toBe(
      'Mints de ter 15/09 (BRT):\n• 06:00 — Fortune Foes  [MEGA]',
    );
  });

  it('escreve "horário TBH" quando não há hora', () => {
    const msg = buildDigest('2026-09-15', [item({ name: 'Yield Farm', time: '' })], '$');
    expect(msg).toContain('• horário TBH — Yield Farm');
  });

  it('junta wallet, tipo e chain com separador do meio', () => {
    const msg = buildDigest('2026-09-15', [
      item({ name: 'Yield Farm', time: '', wallet: 'Blowfly', type: 'FCFS', chain: 'RH' }),
    ], '$');
    expect(msg).toContain('[Blowfly · FCFS · RH]');
  });

  it('acrescenta o custo quando registrado', () => {
    const msg = buildDigest('2026-09-15', [item({ cost: 0.02 })], '$');
    expect(msg).toContain('· custo $ 0,02');
  });

  it('omite o custo quando é zero ou não registrado', () => {
    expect(buildDigest('2026-09-15', [item({ cost: 0 })], '$')).not.toContain('custo');
    expect(buildDigest('2026-09-15', [item({ cost: null })], '$')).not.toContain('custo');
  });

  it('põe o link numa linha própria, indentada', () => {
    const msg = buildDigest('2026-09-15', [item({ link: 'https://ex.com/mint' })], '$');
    expect(msg).toContain('\n  https://ex.com/mint');
  });

  it('monta o exemplo do handoff por inteiro', () => {
    const msg = buildDigest('2026-09-15', [
      item(),
      item({ name: 'Yield Farm', time: '', wallet: 'Blowfly', type: 'FCFS', chain: 'RH', cost: 0.02 }),
    ], '$');
    expect(msg).toBe(
      'Mints de ter 15/09 (BRT):\n' +
      '• 06:00 — Fortune Foes  [MEGA]\n' +
      '• horário TBH — Yield Farm  [Blowfly · FCFS · RH] · custo $ 0,02',
    );
  });
});

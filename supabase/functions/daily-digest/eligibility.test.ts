import { describe, expect, it } from 'vitest';
import { MAX_ATTEMPTS, shouldSend, STALE_CLAIM_MINUTES, type EligibilityInput } from './eligibility.ts';

const NOW = new Date('2026-09-15T08:05:00-03:00');

const input = (over: Partial<EligibilityInput> = {}): EligibilityInput => ({
  discordOn: true,
  webhook: 'https://discord.com/api/webhooks/x',
  reminderHour: '08:00',
  nowHHMM: '08:05',
  now: NOW,
  log: null,
  ...over,
});

const minutesAgo = (min: number): string => new Date(NOW.getTime() - min * 60_000).toISOString();

describe('shouldSend', () => {
  it('envia quando a hora chegou e nada foi registrado hoje', () => {
    expect(shouldSend(input())).toBe(true);
  });

  it('não envia antes da hora', () => {
    expect(shouldSend(input({ nowHHMM: '07:59' }))).toBe(false);
  });

  it('envia na hora exata', () => {
    expect(shouldSend(input({ nowHHMM: '08:00' }))).toBe(true);
  });

  it('não envia com o canal desligado ou sem webhook', () => {
    expect(shouldSend(input({ discordOn: false }))).toBe(false);
    expect(shouldSend(input({ webhook: '' }))).toBe(false);
  });

  it('não reenvia o que já foi enviado hoje', () => {
    expect(shouldSend(input({ log: { status: 'ok', attempts: 1, claimedAt: minutesAgo(20) } }))).toBe(false);
  });

  it('não atropela um envio em andamento recém-reivindicado', () => {
    expect(
      shouldSend(input({ log: { status: 'sending', attempts: 1, claimedAt: minutesAgo(1) } })),
    ).toBe(false);
  });

  it('tenta de novo depois de uma falha', () => {
    expect(shouldSend(input({ log: { status: 'error', attempts: 1, claimedAt: minutesAgo(1) } }))).toBe(true);
    expect(shouldSend(input({ log: { status: 'error', attempts: 2, claimedAt: minutesAgo(1) } }))).toBe(true);
  });

  it('desiste na terceira tentativa', () => {
    expect(shouldSend(input({ log: { status: 'error', attempts: MAX_ATTEMPTS, claimedAt: minutesAgo(1) } }))).toBe(
      false,
    );
  });

  describe('claim "sending" travado', () => {
    it('não retenta um claim mais novo que o limite', () => {
      const claimedAt = minutesAgo(STALE_CLAIM_MINUTES - 1);
      expect(shouldSend(input({ log: { status: 'sending', attempts: 1, claimedAt } }))).toBe(false);
    });

    it('retenta um claim mais velho que o limite', () => {
      const claimedAt = minutesAgo(STALE_CLAIM_MINUTES + 1);
      expect(shouldSend(input({ log: { status: 'sending', attempts: 1, claimedAt } }))).toBe(true);
    });

    it('não retenta um claim velho que já esgotou as tentativas', () => {
      const claimedAt = minutesAgo(STALE_CLAIM_MINUTES + 1);
      expect(
        shouldSend(input({ log: { status: 'sending', attempts: MAX_ATTEMPTS, claimedAt } })),
      ).toBe(false);
    });
  });
});

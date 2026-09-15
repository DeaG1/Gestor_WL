import { describe, expect, it } from 'vitest';
import { shouldSend, type EligibilityInput } from './eligibility.ts';

const input = (over: Partial<EligibilityInput> = {}): EligibilityInput => ({
  discordOn: true,
  webhook: 'https://discord.com/api/webhooks/x',
  reminderHour: '08:00',
  nowHHMM: '08:05',
  log: null,
  ...over,
});

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
    expect(shouldSend(input({ log: { status: 'ok', attempts: 1 } }))).toBe(false);
  });

  it('não atropela um envio em andamento', () => {
    expect(shouldSend(input({ log: { status: 'sending', attempts: 1 } }))).toBe(false);
  });

  it('tenta de novo depois de uma falha', () => {
    expect(shouldSend(input({ log: { status: 'error', attempts: 1 } }))).toBe(true);
    expect(shouldSend(input({ log: { status: 'error', attempts: 2 } }))).toBe(true);
  });

  it('desiste na terceira tentativa', () => {
    expect(shouldSend(input({ log: { status: 'error', attempts: 3 } }))).toBe(false);
  });
});

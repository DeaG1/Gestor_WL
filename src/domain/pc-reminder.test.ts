import { describe, expect, it } from 'vitest';
import { shouldNotifyPc, type PcReminderInput } from './pc-reminder.ts';

const input = (over: Partial<PcReminderInput> = {}): PcReminderInput => ({
  pcOn: true,
  permissionGranted: true,
  nowHHMM: '08:05',
  reminderHour: '08:00',
  notifiedDay: null,
  today: '2026-09-15',
  pendingTodayCount: 2,
  ...over,
});

describe('shouldNotifyPc', () => {
  it('dispara quando tudo está de acordo', () => {
    expect(shouldNotifyPc(input())).toBe(true);
  });

  it('não dispara com o toggle desligado', () => {
    expect(shouldNotifyPc(input({ pcOn: false }))).toBe(false);
  });

  it('não dispara sem permissão concedida', () => {
    expect(shouldNotifyPc(input({ permissionGranted: false }))).toBe(false);
  });

  it('não dispara antes do horário configurado', () => {
    expect(shouldNotifyPc(input({ nowHHMM: '07:59' }))).toBe(false);
  });

  it('dispara na hora exata', () => {
    expect(shouldNotifyPc(input({ nowHHMM: '08:00' }))).toBe(true);
  });

  it('não dispara sem mints pendentes hoje', () => {
    expect(shouldNotifyPc(input({ pendingTodayCount: 0 }))).toBe(false);
  });

  it('não dispara de novo no mesmo dia', () => {
    expect(shouldNotifyPc(input({ notifiedDay: '2026-09-15' }))).toBe(false);
  });

  it('dispara de novo num dia diferente do último registrado', () => {
    expect(shouldNotifyPc(input({ notifiedDay: '2026-09-14' }))).toBe(true);
  });
});

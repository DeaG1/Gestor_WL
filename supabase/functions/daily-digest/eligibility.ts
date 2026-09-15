export const MAX_ATTEMPTS = 3;

export interface EligibilityInput {
  discordOn: boolean;
  webhook: string;
  /** 'HH:MM' em BRT. */
  reminderHour: string;
  /** 'HH:MM' em BRT, agora. */
  nowHHMM: string;
  log: { status: 'sending' | 'ok' | 'error'; attempts: number } | null;
}

/**
 * Manda enviar quando o canal está ligado, a hora já passou e o dia ainda não
 * foi resolvido. Um log 'ok' fecha o dia; 'sending' é outro tick em andamento;
 * 'error' pode ser retentado até MAX_ATTEMPTS.
 */
export const shouldSend = (i: EligibilityInput): boolean => {
  if (!i.discordOn || !i.webhook) return false;
  if (i.nowHHMM < i.reminderHour) return false;
  if (!i.log) return true;
  return i.log.status === 'error' && i.log.attempts < MAX_ATTEMPTS;
};

export const MAX_ATTEMPTS = 3;

/** Um claim 'sending' mais velho que isto é considerado travado (isolate morto no meio do envio). */
export const STALE_CLAIM_MINUTES = 15;

export interface EligibilityInput {
  discordOn: boolean;
  webhook: string;
  /** 'HH:MM' em BRT. */
  reminderHour: string;
  /** 'HH:MM' em BRT, agora. */
  nowHHMM: string;
  /** Instante atual, para medir a idade de um claim 'sending' travado. */
  now: Date;
  log: {
    status: 'sending' | 'ok' | 'error';
    attempts: number;
    /** Quando a linha virou 'sending' pela última vez. */
    claimedAt: string | null;
  } | null;
}

/**
 * Manda enviar quando o canal está ligado, a hora já passou e o dia ainda não
 * foi resolvido. Um log 'ok' fecha o dia. 'error' pode ser retentado até
 * MAX_ATTEMPTS. 'sending' é normalmente outro tick em andamento — mas se o
 * claim está mais velho que STALE_CLAIM_MINUTES, o isolate provavelmente
 * morreu no meio do envio e a linha pode ser retentada como se fosse erro.
 */
export const shouldSend = (i: EligibilityInput): boolean => {
  if (!i.discordOn || !i.webhook) return false;
  if (i.nowHHMM < i.reminderHour) return false;
  if (!i.log) return true;
  if (i.log.status === 'ok') return false;
  if (i.log.attempts >= MAX_ATTEMPTS) return false;
  if (i.log.status === 'error') return true;

  // status === 'sending': só retenta se o claim travou.
  if (!i.log.claimedAt) return false;
  const ageMinutes = (i.now.getTime() - new Date(i.log.claimedAt).getTime()) / 60_000;
  return ageMinutes > STALE_CLAIM_MINUTES;
};

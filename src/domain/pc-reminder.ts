export interface PcReminderInput {
  /** Toggle "Aviso no PC" ligado nas configurações. */
  pcOn: boolean;
  /** `Notification.permission === 'granted'`. */
  permissionGranted: boolean;
  /** 'HH:MM' em BRT, agora. */
  nowHHMM: string;
  /** 'HH:MM' em BRT, horário configurado do lembrete. */
  reminderHour: string;
  /** Último dia (YYYY-MM-DD) em que o aviso já disparou, ou null. */
  notifiedDay: string | null;
  /** Hoje, YYYY-MM-DD. */
  today: string;
  /** Quantos itens pendentes têm mint marcado para hoje. */
  pendingTodayCount: number;
}

/**
 * Decide se o aviso do sistema (Notification API) deve disparar agora.
 * Espelha a regra do protótipo (`checkReminder`): a aba precisa estar aberta,
 * o horário configurado já ter passado, haver pendência hoje e o dia ainda
 * não ter sido notificado.
 */
export const shouldNotifyPc = (i: PcReminderInput): boolean =>
  i.pcOn &&
  i.permissionGranted &&
  i.nowHHMM >= i.reminderHour &&
  i.notifiedDay !== i.today &&
  i.pendingTodayCount > 0;

import { useEffect } from 'react';
import { nowHHMM } from '@shared/date.ts';
import { buildDigest } from '@shared/digest.ts';
import { shouldNotifyPc } from '../domain/pc-reminder.ts';
import { itemsOn } from '../domain/today.ts';
import type { Settings, WLItem } from './types.ts';

/** Mesma chave do protótipo (`Gestor WL.dc.html`), guarda o último dia notificado. */
const NOTIFIED_KEY = 'gestor-wl-notified';

const readNotifiedDay = (): string | null => {
  try {
    return localStorage.getItem(NOTIFIED_KEY);
  } catch {
    return null; // ambiente sem localStorage — segue sem persistir
  }
};

const writeNotifiedDay = (day: string): void => {
  try {
    localStorage.setItem(NOTIFIED_KEY, day);
  } catch {
    // pior caso: notifica de novo no próximo tick
  }
};

/**
 * "Aviso no PC": dispara a Notification API do navegador quando o horário do
 * lembrete chega, com a aba aberta — igual ao protótipo. Roda no Shell (não
 * na tela de Notificações) porque precisa disparar não importa qual tela o
 * dono esteja olhando.
 */
export const usePcReminder = (items: WLItem[], settings: Settings, today: string, now: Date): void => {
  useEffect(() => {
    const permissionGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
    const pending = itemsOn(items, today).filter((i) => i.done === 'pendente');

    const fire = shouldNotifyPc({
      pcOn: settings.pcOn,
      permissionGranted,
      nowHHMM: nowHHMM(now),
      reminderHour: settings.reminderHour,
      notifiedDay: readNotifiedDay(),
      today,
      pendingTodayCount: pending.length,
    });
    if (!fire) return;

    writeNotifiedDay(today);
    const msg = buildDigest(today, pending, settings.currency);
    new Notification('Gestor WL', { body: msg });
  }, [items, settings.pcOn, settings.reminderHour, settings.currency, today, now]);
};

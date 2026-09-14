import { todayIso } from '@shared/date.ts';
import { supabase } from '../lib/supabase.ts';
import type { Settings, Tab } from '../lib/types.ts';

export interface SettingsRow {
  reminder_hour: string;
  discord_webhook: string;
  discord_on: boolean;
  pc_on: boolean;
  currency: string;
  start_view: string;
  show_past: boolean;
}

export interface LastNotification {
  day: string;
  status: 'sending' | 'ok' | 'error';
  sentAt: string | null;
  error: string | null;
}

export const DEFAULT_SETTINGS: Settings = {
  reminderHour: '08:00',
  discordWebhook: '',
  discordOn: true,
  pcOn: false,
  currency: '$',
  startView: 'dash',
  showPast: true,
};

export const rowToSettings = (row: SettingsRow): Settings => ({
  reminderHour: row.reminder_hour.slice(0, 5),
  discordWebhook: row.discord_webhook,
  discordOn: row.discord_on,
  pcOn: row.pc_on,
  currency: row.currency,
  startView: row.start_view as Tab,
  showPast: row.show_past,
});

const settingsToRow = (patch: Partial<Settings>): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  if (patch.reminderHour !== undefined) row.reminder_hour = patch.reminderHour;
  if (patch.discordWebhook !== undefined) row.discord_webhook = patch.discordWebhook;
  if (patch.discordOn !== undefined) row.discord_on = patch.discordOn;
  if (patch.pcOn !== undefined) row.pc_on = patch.pcOn;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.startView !== undefined) row.start_view = patch.startView;
  if (patch.showPast !== undefined) row.show_past = patch.showPast;
  return row;
};

export const getSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase.from('user_settings').select('*').single();
  if (error) throw new Error(`Não consegui carregar as configurações: ${error.message}`);
  return rowToSettings(data as SettingsRow);
};

export const saveSettings = async (patch: Partial<Settings>): Promise<void> => {
  const { data: session } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('user_settings')
    .update(settingsToRow(patch))
    .eq('user_id', session.user?.id ?? '');
  if (error) throw new Error(`Não consegui salvar as configurações: ${error.message}`);
};

/** Último envio do lembrete, para a linha de estado do card do Discord. */
export const getLastNotification = async (): Promise<LastNotification | null> => {
  const { data, error } = await supabase
    .from('notification_log')
    .select('day, status, sent_at, error')
    .eq('channel', 'discord')
    .lte('day', todayIso())
    .order('day', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return {
    day: data.day as string,
    status: data.status as LastNotification['status'],
    sentAt: (data.sent_at as string | null) ?? null,
    error: (data.error as string | null) ?? null,
  };
};

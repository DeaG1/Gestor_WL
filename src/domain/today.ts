import { cap, daysBetween, fromIso, MON, pad, short, WDL } from '@shared/date.ts';
import type { WLItem } from '../lib/types.ts';

export interface UpcomingDay {
  day: string;
  weekday: string;
  dateShort: string;
  rel: string;
  items: WLItem[];
}

export interface TodayModel {
  todayItems: WLItem[];
  past: WLItem[];
  upcoming: UpcomingDay[];
  undated: WLItem[];
  pendingToday: number;
  futureDayCount: number;
  undatedCount: number;
  todayLong: string;
  nextDay: string | null;
  nextLabel: string;
}

export const itemsOn = (items: WLItem[], day: string): WLItem[] =>
  items
    .filter((i) => i.date === day)
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));

export const todayModel = (items: WLItem[], today: string, showPast: boolean): TodayModel => {
  const todayItems = itemsOn(items, today);

  const past = showPast
    ? items
        .filter((i) => i.date && i.date < today && i.done === 'pendente')
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const futureDays = [...new Set(items.filter((i) => i.date > today).map((i) => i.date))].sort();

  const upcoming: UpcomingDay[] = futureDays.map((day) => {
    const d = fromIso(day);
    const diff = daysBetween(today, day);
    return {
      day,
      weekday: cap(WDL[d.getDay()]),
      dateShort: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
      rel: diff === 1 ? 'amanhã' : `em ${diff} dias`,
      items: itemsOn(items, day),
    };
  });

  const undated = items.filter((i) => !i.date && i.done === 'pendente');

  const nextDay = futureDays[0] ?? null;
  const t = fromIso(today);

  return {
    todayItems,
    past,
    upcoming,
    undated,
    pendingToday: todayItems.filter((i) => i.done === 'pendente').length,
    futureDayCount: futureDays.length,
    undatedCount: undated.length,
    todayLong: `${cap(WDL[t.getDay()])}, ${t.getDate()} de ${MON[t.getMonth()]}`,
    nextDay,
    nextLabel: nextDay
      ? `${short(nextDay)} — ${itemsOn(items, nextDay).map((i) => i.name).join(', ')}`
      : 'nenhum marcado',
  };
};

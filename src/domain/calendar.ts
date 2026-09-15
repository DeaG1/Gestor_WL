import { cap, iso, MON } from '@shared/date.ts';
import type { WLItem } from '../lib/types.ts';
import { itemsOn } from './today.ts';

export interface CalDay {
  num: number;
  day: string;
  inMonth: boolean;
  isToday: boolean;
  /** Cor do número do dia: accent hoje, neutral-400 nos demais. */
  numColor: string;
  items: WLItem[];
}

export interface CalWeek {
  days: CalDay[];
}

export const monthTitle = (year: number, month: number): string => `${cap(MON[month])} ${year}`;

export const calendarWeeks = (
  items: WLItem[],
  year: number,
  month: number,
  today: string,
): CalWeek[] => {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const weeks: CalWeek[] = [];

  for (let w = 0; w < 6; w++) {
    const days: CalDay[] = [];

    for (let k = 0; k < 7; k++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + k);
      const day = iso(d);
      const isToday = day === today;
      days.push({
        num: d.getDate(),
        day,
        inMonth: d.getMonth() === month,
        isToday,
        numColor: isToday ? 'var(--color-accent)' : 'var(--color-neutral-400)',
        items: itemsOn(items, day),
      });
    }

    weeks.push({ days });

    const nextWeekStart = new Date(
      start.getFullYear(), start.getMonth(), start.getDate() + (w + 1) * 7,
    );
    if (nextWeekStart.getMonth() !== month && w >= 3) break;
  }

  return weeks;
};

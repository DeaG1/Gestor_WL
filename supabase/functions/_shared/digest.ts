import { short } from './date.ts';
import { money, num } from './money.ts';

export interface DigestItem {
  name: string;
  time: string;
  wallet: string;
  type: string;
  chain: string;
  cost: number | null;
  link: string;
}

/** Texto puro, sem emoji. Formato fixado no handoff. */
export const buildDigest = (day: string, items: DigestItem[], currency: string): string => {
  if (!items.length) return `Nenhum mint em ${short(day)}.`;

  const lines = items.map((i) => {
    const meta = [i.wallet, i.type, i.chain].filter(Boolean).join(' · ');
    const cost = num(i.cost) ? ` · custo ${money(num(i.cost), currency)}` : '';
    const link = i.link ? `\n  ${i.link}` : '';
    return `• ${i.time || 'horário TBH'} — ${i.name}  [${meta}]${cost}${link}`;
  });

  return `Mints de ${short(day)} (BRT):\n${lines.join('\n')}`;
};

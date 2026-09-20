import { short } from '@shared/date.ts';
import { money, num } from '@shared/money.ts';
import { NEG, POS, STAG, WCAL, WDOT, WTAG } from '../lib/tokens.ts';
import { STATUS_LABELS, type WLItem } from '../lib/types.ts';

export interface ItemView {
  item: WLItem;
  isDone: boolean;
  isMinted: boolean;
  isSkipped: boolean;
  profit: number;
  timeLabel: string;
  timeShort: string;
  timeSub: string;
  dateShort: string;
  dateTime: string;
  supplyLabel: string;
  costLabel: string;
  soldLabel: string;
  profitLabel: string;
  profitColor: string;
  dot: string;
  walletBg: string;
  walletFg: string;
  calBg: string;
  statusLabel: string;
  statusBg: string;
  statusFg: string;
  hasLink: boolean;
  opacity: number;
  deco: 'line-through' | 'none';
  ring: string;
  mintLabel: string;
  skipLabel: string;
}

export const itemView = (item: WLItem, currency: string): ItemView => {
  const isMinted = item.done === 'mintado';
  const isSkipped = item.done === 'pulado';
  const isDone = item.done !== 'pendente';

  const cost = num(item.cost);
  const sold = num(item.sold);
  const profit = sold - cost;

  // A chave escolhe a cor e vem do valor guardado; o rótulo é o texto exibido.
  // Separados de proposito: STAG nao conhece 'Sem horário'.
  const statusKey = isDone ? (isMinted ? 'Mintado' : 'Pulado') : item.status;
  const statusLabel = isDone ? statusKey : STATUS_LABELS[item.status];
  const [statusBg, statusFg] = STAG[statusKey] ?? STAG.TBA;
  const [walletBg, walletFg] = WTAG[item.wallet] ?? WTAG.MEGA;

  return {
    item,
    isDone,
    isMinted,
    isSkipped,
    profit,
    timeLabel: item.time || '—',
    timeShort: item.time || 'TBH',
    timeSub: item.time ? 'BRT' : 'horário TBH',
    dateShort: item.date ? short(item.date) : 'sem data',
    dateTime: item.date ? `${short(item.date)}${item.time ? ` · ${item.time}` : ''}` : '—',
    supplyLabel: item.supply != null ? String(item.supply) : isMinted ? '1' : '',
    costLabel: cost !== 0 || isMinted ? money(cost, currency) : '',
    soldLabel: sold !== 0 || isMinted ? money(sold, currency) : '',
    profitLabel: isMinted || sold !== 0 ? money(profit, currency) : '',
    profitColor: profit < 0 ? NEG : POS,
    dot: WDOT[item.wallet] ?? WDOT.MEGA,
    walletBg,
    walletFg,
    calBg: WCAL[item.wallet] ?? WCAL.MEGA,
    statusLabel,
    statusBg,
    statusFg,
    hasLink: !!item.link,
    opacity: isDone ? 0.5 : 1,
    deco: isMinted ? 'line-through' : 'none',
    ring: isMinted ? '0 0 0 1px var(--color-accent-700)' : 'var(--shadow-sm)',
    mintLabel: isMinted ? 'Desfazer' : 'Mintado',
    skipLabel: isSkipped ? 'Desfazer' : 'Pular',
  };
};

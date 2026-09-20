import type { Filters, WLItem } from '../lib/types.ts';
import { walletCountsLabel } from './wallet-cards.ts';

/**
 * "Sem tipo" é o tipo vazio e precisa de ramo próprio: comparar por `includes`
 * não serve — nenhum tipo contém o texto "Sem tipo", e usar a string vazia
 * casaria com tudo. Para os demais, `includes` é regra do handoff: filtrar por
 * "GTD" também traz as WL marcadas como "GTD + FCFS".
 */
const matchesType = (item: WLItem, type: Exclude<Filters['type'], 'Todos'>): boolean =>
  type === 'Sem tipo' ? item.type === '' : item.type.includes(type);

const matchesDone = (item: WLItem, done: Filters['done']): boolean => {
  if (done === 'Tudo') return true;
  if (done === 'Pendentes') return item.done === 'pendente';
  if (done === 'Mintados') return item.done === 'mintado';
  return item.done === 'pulado';
};

export const filterItems = (items: WLItem[], f: Filters): WLItem[] => {
  const q = f.q.trim().toLowerCase();

  return items
    .filter((i) =>
      (!q || i.name.toLowerCase().includes(q)) &&
      (f.wallet === 'Todas' || i.wallet === f.wallet) &&
      (f.type === 'Todos' || matchesType(i, f.type)) &&
      (f.chain === 'Todas' || i.chain === f.chain) &&
      matchesDone(i, f.done))
    .sort((a, b) =>
      (a.date ? 0 : 1) - (b.date ? 0 : 1) ||
      a.date.localeCompare(b.date) ||
      a.name.localeCompare(b.name));
};

export const listSummary = (shown: number, items: WLItem[]): string =>
  `${shown} de ${items.length} WL · ${walletCountsLabel(items)}`;

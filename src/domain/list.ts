import type { Filters, WLItem } from '../lib/types.ts';

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
      (f.type === 'Todos' || i.type.includes(f.type)) &&
      (f.chain === 'Todas' || i.chain === f.chain) &&
      matchesDone(i, f.done))
    .sort((a, b) =>
      (a.date ? 0 : 1) - (b.date ? 0 : 1) ||
      a.date.localeCompare(b.date) ||
      a.name.localeCompare(b.name));
};

export const listSummary = (shown: number, items: WLItem[]): string => {
  const blowfly = items.filter((i) => i.wallet === 'Blowfly').length;
  const mega = items.filter((i) => i.wallet === 'MEGA').length;
  return `${shown} de ${items.length} WL · ${blowfly} Blowfly · ${mega} MEGA`;
};

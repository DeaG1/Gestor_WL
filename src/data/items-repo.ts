import { supabase } from '../lib/supabase.ts';
import type { Chain, Done, Status, Wallet, WLItem, WLType } from '../lib/types.ts';

export interface WLItemRow {
  id: string;
  name: string;
  wallet: string;
  type: string;
  chain: string;
  mint_date: string | null;
  mint_time: string | null;
  status: string;
  cost: number | string | null;
  sold: number | string | null;
  supply: number | null;
  link: string;
  notes: string;
  done: string;
}

const toNumber = (v: number | string | null): number | null =>
  v === null ? null : typeof v === 'number' ? v : Number(v);

export const rowToItem = (row: WLItemRow): WLItem => ({
  id: row.id,
  name: row.name,
  wallet: row.wallet as Wallet,
  type: row.type as WLType,
  chain: row.chain as Chain,
  date: row.mint_date ?? '',
  time: row.mint_time ? row.mint_time.slice(0, 5) : '',
  status: row.status as Status,
  cost: toNumber(row.cost),
  sold: toNumber(row.sold),
  supply: row.supply,
  link: row.link,
  notes: row.notes,
  done: row.done as Done,
});

/** Só os campos presentes no patch viram colunas. O id nunca é enviado. */
export const itemToRow = (patch: Partial<WLItem>): Record<string, unknown> => {
  const row: Record<string, unknown> = {};
  const copy = ['name', 'wallet', 'type', 'chain', 'status', 'cost', 'sold',
                'supply', 'link', 'notes', 'done'] as const;

  for (const key of copy) {
    if (patch[key] !== undefined) row[key] = patch[key];
  }
  if (patch.date !== undefined) row.mint_date = patch.date || null;
  if (patch.time !== undefined) row.mint_time = patch.time || null;

  return row;
};

const fail = (context: string, message: string): never => {
  throw new Error(`${context}: ${message}`);
};

export const listItems = async (): Promise<WLItem[]> => {
  const { data, error } = await supabase.from('wl_items').select('*');
  if (error) fail('Não consegui carregar as WL', error.message);
  return (data as WLItemRow[]).map(rowToItem);
};

export const insertItem = async (item: Omit<WLItem, 'id'>): Promise<WLItem> => {
  const { data, error } = await supabase
    .from('wl_items')
    .insert(itemToRow(item))
    .select()
    .single();
  if (error) fail('Não consegui cadastrar a WL', error.message);
  return rowToItem(data as WLItemRow);
};

export const updateItem = async (id: string, patch: Partial<WLItem>): Promise<void> => {
  const { error } = await supabase.from('wl_items').update(itemToRow(patch)).eq('id', id);
  if (error) fail('Não consegui salvar a WL', error.message);
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('wl_items').delete().eq('id', id);
  if (error) fail('Não consegui excluir a WL', error.message);
};

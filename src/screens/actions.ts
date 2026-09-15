import type { Gestor } from '../data/use-gestor.ts';
import type { WLItem } from '../lib/types.ts';

export interface ItemActions {
  /** Pendente → mintado e abre "Registrar mint". Mintado → volta a pendente. */
  mint: (item: WLItem) => void;
  /** Alterna pendente ↔ pulado. */
  skip: (item: WLItem) => void;
  /** Abre o modal de edição preenchido. */
  edit: (item: WLItem) => void;
}

export interface ScreenProps {
  gestor: Gestor;
  today: string;
  actions: ItemActions;
}

type SaveItem = (id: string, patch: Partial<WLItem>) => void;
type OpenForm = (item: Partial<WLItem>, isEdit: boolean) => void;

export const makeItemActions = (saveItem: SaveItem, openForm: OpenForm): ItemActions => ({
  mint: (item) => {
    if (item.done === 'mintado') {
      saveItem(item.id, { done: 'pendente' });
      return;
    }
    saveItem(item.id, { done: 'mintado' });
    openForm({ ...item, done: 'mintado' }, true);
  },
  skip: (item) => saveItem(item.id, { done: item.done === 'pulado' ? 'pendente' : 'pulado' }),
  edit: (item) => openForm(item, true),
});

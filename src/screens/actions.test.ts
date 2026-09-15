import { describe, expect, it, vi } from 'vitest';
import { makeItemActions } from './actions.ts';
import type { WLItem } from '../lib/types.ts';

const item = (over: Partial<WLItem> = {}): WLItem => ({
  id: '1', name: 'Fortune Foes', wallet: 'MEGA', type: '', chain: '',
  date: '2026-09-15', time: '06:00', status: 'Confirmado',
  cost: null, sold: null, supply: null, link: '', notes: '', done: 'pendente',
  ...over,
});

const setup = () => {
  const saveItem = vi.fn();
  const openForm = vi.fn();
  return { saveItem, openForm, actions: makeItemActions(saveItem, openForm) };
};

describe('makeItemActions', () => {
  it('marca como mintado e abre o registro de mint', () => {
    const { actions, saveItem, openForm } = setup();
    actions.mint(item());
    expect(saveItem).toHaveBeenCalledWith('1', { done: 'mintado' });
    expect(openForm).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', done: 'mintado' }), true,
    );
  });

  it('desfaz o mint sem abrir modal nenhum', () => {
    const { actions, saveItem, openForm } = setup();
    actions.mint(item({ done: 'mintado' }));
    expect(saveItem).toHaveBeenCalledWith('1', { done: 'pendente' });
    expect(openForm).not.toHaveBeenCalled();
  });

  it('alterna pendente e pulado', () => {
    const { actions, saveItem } = setup();
    actions.skip(item());
    expect(saveItem).toHaveBeenCalledWith('1', { done: 'pulado' });
    actions.skip(item({ done: 'pulado' }));
    expect(saveItem).toHaveBeenLastCalledWith('1', { done: 'pendente' });
  });

  it('abre a edição com o item preenchido', () => {
    const { actions, openForm } = setup();
    const it_ = item();
    actions.edit(it_);
    expect(openForm).toHaveBeenCalledWith(it_, true);
  });
});

// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGestor, type GestorRepos } from './use-gestor.ts';
import { DEFAULT_SETTINGS } from './settings-repo.ts';
import type { WLItem } from '../lib/types.ts';

const item = (over: Partial<WLItem> = {}): WLItem => ({
  id: '1', name: 'Fortune Foes', wallet: 'MEGA', type: '', chain: '',
  date: '2026-09-15', time: '06:00', status: 'Confirmado',
  cost: null, sold: null, supply: null, link: '', notes: '', done: 'pendente',
  ...over,
});

const fakeRepos = (over: Partial<GestorRepos> = {}): GestorRepos => ({
  listItems: vi.fn().mockResolvedValue([item()]),
  insertItem: vi.fn(async (i) => ({ ...i, id: 'novo' })),
  updateItem: vi.fn().mockResolvedValue(undefined),
  deleteItem: vi.fn().mockResolvedValue(undefined),
  getSettings: vi.fn().mockResolvedValue({ ...DEFAULT_SETTINGS, currency: 'R$' }),
  saveSettings: vi.fn().mockResolvedValue(undefined),
  ...over,
});

// Os repos precisam ser um objeto ESTÁVEL entre renders: useGestor recarrega
// quando a identidade muda, então criar o dublê dentro do callback do
// renderHook geraria um laço infinito de re-render.
describe('useGestor — carga', () => {
  it('carrega itens e configurações e sai do loading', async () => {
    const repos = fakeRepos();
    const { result } = renderHook(() => useGestor(repos));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.settings.currency).toBe('R$');
    expect(result.current.error).toBeNull();
  });

  it('guarda o erro de carga sem quebrar', async () => {
    const repos = fakeRepos({ listItems: vi.fn().mockRejectedValue(new Error('sem rede')) });
    const { result } = renderHook(() => useGestor(repos));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('sem rede');
  });
});

describe('useGestor — mutações otimistas', () => {
  it('marca como mintado na hora e persiste', async () => {
    const repos = fakeRepos();
    const { result } = renderHook(() => useGestor(repos));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.saveItem('1', { done: 'mintado' }); });

    expect(result.current.items[0].done).toBe('mintado');
    expect(repos.updateItem).toHaveBeenCalledWith('1', { done: 'mintado' });
  });

  it('desfaz e mostra o erro quando a gravação falha', async () => {
    const repos = fakeRepos({
      updateItem: vi.fn().mockRejectedValue(new Error('RLS negou')),
    });
    const { result } = renderHook(() => useGestor(repos));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.saveItem('1', { done: 'mintado' }); });

    expect(result.current.items[0].done).toBe('pendente');
    expect(result.current.error).toBe('RLS negou');
  });

  it('acrescenta o item devolvido pelo banco, com o id de verdade', async () => {
    const repos = fakeRepos();
    const { result } = renderHook(() => useGestor(repos));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const { id: _id, ...semId } = item();
    await act(async () => { await result.current.addItem(semId); });

    expect(result.current.items.map((i) => i.id)).toContain('novo');
  });

  it('remove na hora e devolve o item se a exclusão falhar', async () => {
    const repos = fakeRepos({ deleteItem: vi.fn().mockRejectedValue(new Error('falhou')) });
    const { result } = renderHook(() => useGestor(repos));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.removeItem('1'); });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.error).toBe('falhou');
  });

  it('altera uma configuração e desfaz quando falha', async () => {
    const repos = fakeRepos({ saveSettings: vi.fn().mockRejectedValue(new Error('não deu')) });
    const { result } = renderHook(() => useGestor(repos));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.setSetting('reminderHour', '09:30'); });

    expect(result.current.settings.reminderHour).toBe('08:00');
    expect(result.current.error).toBe('não deu');
  });

  it('limpa o erro quando pedido', async () => {
    const repos = fakeRepos({ updateItem: vi.fn().mockRejectedValue(new Error('x')) });
    const { result } = renderHook(() => useGestor(repos));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.saveItem('1', { done: 'pulado' }); });

    act(() => { result.current.dismissError(); });
    expect(result.current.error).toBeNull();
  });

  it('restaura a lista quando duas alterações partem juntas e a segunda falha', async () => {
    const repos = fakeRepos({
      listItems: vi.fn().mockResolvedValue([item(), item({ id: '2', name: 'Akai' })]),
      updateItem: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('falhou')),
    });
    const { result } = renderHook(() => useGestor(repos));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await Promise.all([
        result.current.saveItem('1', { done: 'mintado' }),
        result.current.saveItem('2', { done: 'pulado' }),
      ]);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.find((i) => i.id === '2')?.done).toBe('pendente');
    expect(result.current.error).toBe('falhou');
  });
});

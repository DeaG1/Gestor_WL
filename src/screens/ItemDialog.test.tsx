// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ItemDialog } from './ItemDialog.tsx';
import { EMPTY_ITEM } from '../lib/types.ts';

const setup = (over: Partial<Parameters<typeof ItemDialog>[0]> = {}) => {
  const onSave = vi.fn();
  render(
    <ItemDialog
      item={{ ...EMPTY_ITEM }}
      isEdit={false}
      currency="$"
      onSave={onSave}
      onDelete={() => {}}
      onClose={() => {}}
      {...over}
    />,
  );
  return { onSave };
};

describe('ItemDialog', () => {
  it('abre a WL nova sem data e com status "Sem data"', () => {
    setup();
    expect(screen.getByLabelText('Data')).toHaveValue('');
    expect(screen.getByRole('radio', { name: 'Sem data' })).toBeChecked();
  });

  it('não salva sem nome', async () => {
    const { onSave } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('força Confirmado quando data e hora estão preenchidas', async () => {
    const { onSave } = setup({
      item: { ...EMPTY_ITEM, name: 'Akai', date: '2026-09-23', time: '15:15', status: 'TBH' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ status: 'Confirmado' }));
  });

  it('preserva o status quando falta a hora', async () => {
    const { onSave } = setup({
      item: { ...EMPTY_ITEM, name: 'Yield Farm', date: '2026-09-15', time: '', status: 'TBH' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ status: 'TBH' }));
  });

  it('chama a ação de registrar mint quando o item já está mintado', () => {
    setup({ item: { ...EMPTY_ITEM, name: 'Akai', done: 'mintado' }, isEdit: true });
    expect(screen.getByText('Registrar mint')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });

  it('calcula o lucro enquanto se digita', async () => {
    setup({ item: { ...EMPTY_ITEM, name: 'Akai', cost: 1, done: 'mintado' }, isEdit: true });
    await userEvent.type(screen.getByLabelText('Vendido por ($)'), '3');
    expect(screen.getByTestId('form-profit')).toHaveTextContent('$ 2');
  });

  it('só mostra Excluir em edição', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Excluir' })).toBeNull();
  });
});

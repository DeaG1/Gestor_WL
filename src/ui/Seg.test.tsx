// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Seg } from './Seg.tsx';

describe('Seg', () => {
  it('marca a opção corrente', () => {
    render(<Seg name="wallet" value="MEGA" options={['Blowfly', 'MEGA']} onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'MEGA' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Blowfly' })).not.toBeChecked();
  });

  it('avisa a escolha', async () => {
    const onChange = vi.fn();
    render(<Seg name="wallet" value="MEGA" options={['Blowfly', 'MEGA']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Blowfly' }));
    expect(onChange).toHaveBeenCalledWith('Blowfly');
  });

  it('aceita rótulo diferente do valor', () => {
    render(
      <Seg
        name="done"
        value="mintado"
        options={[{ label: 'Pendente', value: 'pendente' }, { label: 'Mintado', value: 'mintado' }]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Mintado' })).toBeChecked();
  });
});

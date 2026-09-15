import { PencilSimple } from '@phosphor-icons/react';
import { itemView } from '../../domain/item-view.ts';
import type { WLItem } from '../../lib/types.ts';
import { Tag } from '../../ui/Tag.tsx';

export interface MintedTableProps {
  rows: WLItem[];
  currency: string;
  onEdit: (item: WLItem) => void;
}

export default function MintedTable({ rows, currency, onEdit }: MintedTableProps) {
  if (rows.length === 0) {
    return <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Nenhum mint marcado como mintado ainda.</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Wallet</th>
          <th>Data</th>
          <th>Qtd</th>
          <th style={{ textAlign: 'right' }}>Custo</th>
          <th style={{ textAlign: 'right' }}>Venda</th>
          <th style={{ textAlign: 'right' }}>Lucro</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => {
          const view = itemView(item, currency);
          return (
            <tr key={item.id}>
              <td style={{ fontWeight: 500 }}>{item.name}</td>
              <td>
                <Tag bg={view.walletBg} fg={view.walletFg}>{item.wallet}</Tag>
              </td>
              <td style={{ color: 'var(--color-neutral-400)' }}>{view.dateShort}</td>
              <td style={{ color: 'var(--color-neutral-400)' }}>{view.supplyLabel}</td>
              <td style={{ textAlign: 'right' }}>{view.costLabel}</td>
              <td style={{ textAlign: 'right' }}>{view.soldLabel}</td>
              <td style={{ textAlign: 'right', fontWeight: 500, color: view.profitColor }}>{view.profitLabel}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} title="Editar" onClick={() => onEdit(item)}>
                  <PencilSimple size={16} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

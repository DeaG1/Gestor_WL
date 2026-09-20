import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { ArrowRight, ArrowSquareOut, Check, PencilSimple } from '@phosphor-icons/react';
import { filterItems, listSummary } from '../domain/list.ts';
import { itemView } from '../domain/item-view.ts';
import type { ScreenProps } from './actions.ts';
import { CHAINS, DEFAULT_FILTERS, WALLETS } from '../lib/types.ts';
import type { Filters } from '../lib/types.ts';
import { Seg } from '../ui/Seg.tsx';
import { Tag } from '../ui/Tag.tsx';

const WALLET_OPTIONS: Filters['wallet'][] = ['Todas', ...WALLETS];
const TYPE_OPTIONS: Filters['type'][] = ['Todos', 'FCFS', 'GTD', 'Sem tipo'];
const CHAIN_OPTIONS: Filters['chain'][] = ['Todas', ...CHAINS];
const DONE_OPTIONS: Filters['done'][] = ['Pendentes', 'Mintados', 'Pulados', 'Tudo'];

export default function Lista({ gestor, actions }: ScreenProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const currency = gestor.settings.currency;

  const rows = filterItems(gestor.items, filters);
  const summary = listSummary(rows.length, gestor.items);

  const onSearch = (e: ChangeEvent<HTMLInputElement>) =>
    setFilters((f) => ({ ...f, q: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
          Lista
        </div>
        <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Todas as WL</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--color-neutral-400)' }}>{summary}</p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
        <input
          className="input"
          style={{ width: 220 }}
          placeholder="Buscar por nome"
          value={filters.q}
          onChange={onSearch}
        />
        <Seg
          name="wallet-filter"
          value={filters.wallet}
          options={WALLET_OPTIONS}
          onChange={(v) => setFilters((f) => ({ ...f, wallet: v }))}
        />
        <Seg
          name="type-filter"
          value={filters.type}
          options={TYPE_OPTIONS}
          onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
        />
        <Seg
          name="chain-filter"
          value={filters.chain}
          options={CHAIN_OPTIONS}
          onChange={(v) => setFilters((f) => ({ ...f, chain: v }))}
        />
        <Seg
          name="done-filter"
          value={filters.done}
          options={DONE_OPTIONS}
          onChange={(v) => setFilters((f) => ({ ...f, done: v }))}
        />
      </div>

      <div className="card elev-sm" style={{ padding: 'var(--space-2) var(--space-4)' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Wallet</th>
              <th>Tipo</th>
              <th>Chain</th>
              <th>Data · BRT</th>
              <th>Status</th>
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
                <tr key={item.id} style={{ opacity: view.opacity }}>
                  <td>
                    <div style={{ fontWeight: 500, textDecoration: view.deco }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{item.notes}</div>
                  </td>
                  <td>
                    <Tag bg={view.walletBg} fg={view.walletFg}>{item.wallet}</Tag>
                  </td>
                  <td style={{ color: 'var(--color-accent-300)', fontSize: 13 }}>{item.type}</td>
                  <td style={{ fontSize: 13 }}>{item.chain}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{view.dateTime}</td>
                  <td>
                    <Tag bg={view.statusBg} fg={view.statusFg}>{view.statusLabel}</Tag>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{view.costLabel}</td>
                  <td style={{ textAlign: 'right', fontSize: 13 }}>{view.soldLabel}</td>
                  <td style={{ textAlign: 'right', fontSize: 13, fontWeight: 500, color: view.profitColor }}>
                    {view.profitLabel}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 2 }}>
                      {view.hasLink && (
                        <a
                          className="btn btn-ghost btn-icon"
                          style={{ width: 28, height: 28 }}
                          href={item.link}
                          target="_blank"
                          rel="noopener"
                          title="Abrir link"
                        >
                          <ArrowSquareOut size={16} />
                        </a>
                      )}
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{ width: 28, height: 28 }}
                        title={view.mintLabel}
                        onClick={() => actions.mint(item)}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{ width: 28, height: 28, color: 'var(--color-neutral-400)' }}
                        title={view.skipLabel}
                        onClick={() => actions.skip(item)}
                      >
                        <ArrowRight size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{ width: 28, height: 28 }}
                        title="Editar"
                        onClick={() => actions.edit(item)}
                      >
                        <PencilSimple size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

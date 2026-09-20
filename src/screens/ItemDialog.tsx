import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Dialog } from '../ui/Dialog.tsx';
import { Field } from '../ui/Field.tsx';
import { Seg } from '../ui/Seg.tsx';
import type { SegOption } from '../ui/Seg.tsx';
import { CHAINS, EMPTY_ITEM, STATUSES, STATUS_LABELS, TYPES, WALLETS } from '../lib/types.ts';
import type { Done, WLItem } from '../lib/types.ts';
import { money, num } from '@shared/money.ts';
import { NEG, POS } from '../lib/tokens.ts';

const DONE_OPTIONS: SegOption<Done>[] = [
  { label: 'Pendente', value: 'pendente' },
  { label: 'Mintado', value: 'mintado' },
  { label: 'Pulado', value: 'pulado' },
];

type FormState = Omit<WLItem, 'id'>;
type MoneyKey = 'cost' | 'sold';

const toFormState = (item: Partial<WLItem>): FormState => {
  const merged = { ...EMPTY_ITEM, ...item };
  const { name, wallet, type, chain, date, time, status, cost, sold, supply, link, notes, done } = merged;
  return { name, wallet, type, chain, date, time, status, cost, sold, supply, link, notes, done };
};

export interface ItemDialogProps {
  item: Partial<WLItem>;
  isEdit: boolean;
  currency: string;
  onSave: (patch: Omit<WLItem, 'id'>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ItemDialog({ item, isEdit, currency, onSave, onDelete, onClose }: ItemDialogProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(item));

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onText = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setField(key, e.target.value as FormState[typeof key]);

  const onMoney = (key: MoneyKey) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setField(key, (v === '' ? null : Number(v)) as FormState[typeof key]);
  };

  // supply é integer no banco: "1.5" quebra o cast no Postgres. cost e sold
  // são numeric — decimais neles são corretos, então ficam de fora.
  const onSupply = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setField('supply', (v === '' ? null : Math.trunc(Number(v))) as FormState['supply']);
  };

  const title = !isEdit ? 'Nova WL' : form.done === 'mintado' ? 'Registrar mint' : 'Editar WL';
  const saveLabel = isEdit ? 'Salvar' : 'Cadastrar';

  const profit = num(form.sold) - num(form.cost);

  const save = () => {
    if (!form.name.trim()) return;
    const status = form.date && form.time ? 'Confirmado' : form.status;
    onSave({ ...form, status });
  };

  return (
    <Dialog onClose={onClose} width={600}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
        <div className="dialog-title">{title}</div>
        {isEdit && (
          <button
            className="btn btn-ghost"
            style={{ marginLeft: 'auto', color: 'var(--color-neutral-400)' }}
            onClick={onDelete}
          >
            Excluir
          </button>
        )}
      </div>

      <Field label="Nome">
        {(id) => (
          <input
            id={id}
            className="input"
            autoFocus
            placeholder="Ex.: Terminal Cats"
            value={form.name}
            onChange={onText('name')}
          />
        )}
      </Field>

      {/* minWidth 0 nas colunas: sem isso o grid recusa encolher abaixo do
          conteúdo e o segmentado transborda por cima da coluna vizinha. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 'var(--space-4)',
        alignItems: 'start',
      }}
      >
        <div style={{ minWidth: 0 }}>
          <Field label="Wallet">
            {(id) => (
              <Seg name={id} value={form.wallet} options={WALLETS} stretch paddingInline={8}
                onChange={(v) => setField('wallet', v)}
              />
            )}
          </Field>
        </div>
        <div style={{ minWidth: 0 }}>
          <Field label="Tipo">
            {(id) => (
              <Seg name={id} value={form.type} options={TYPES} stretch paddingInline={6}
                onChange={(v) => setField('type', v)}
              />
            )}
          </Field>
        </div>
        <div style={{ minWidth: 0 }}>
          <Field label="Chain">
            {(id) => (
              <Seg name={id} value={form.chain} options={CHAINS} stretch paddingInline={8}
                onChange={(v) => setField('chain', v)}
              />
            )}
          </Field>
        </div>
      </div>

      {/* Status ganhou mais espaco: os rotulos por extenso ("Sem horário")
          sao bem mais largos que as siglas que ficavam aqui antes. */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--space-4)' }}>
        <Field label="Data">
          {(id) => (
            <input id={id} className="input" type="date" value={form.date} onChange={onText('date')} />
          )}
        </Field>
        <Field label="Horário (BRT)">
          {(id) => (
            <input id={id} className="input" type="time" value={form.time} onChange={onText('time')} />
          )}
        </Field>
        <div style={{ minWidth: 0 }}>
          <Field label="Status">
            {(id) => (
              <Seg
                name={id}
                value={form.status}
                options={STATUSES.map((s) => ({ label: STATUS_LABELS[s], value: s }))}
                stretch
                paddingInline={6}
                onChange={(v) => setField('status', v)}
              />
            )}
          </Field>
        </div>
      </div>

      <Field label="Link do mint">
        {(id) => (
          <input id={id} className="input" placeholder="https://" value={form.link} onChange={onText('link')} />
        )}
      </Field>

      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Financeiro
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Seg name="done" value={form.done} options={DONE_OPTIONS} onChange={(v) => setField('done', v)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-4)' }}>
          <Field label={`Custo do mint (${currency})`}>
            {(id) => (
              <input
                id={id}
                className="input"
                type="number"
                step="any"
                placeholder="0"
                value={form.cost ?? ''}
                onChange={onMoney('cost')}
              />
            )}
          </Field>
          <Field label={`Vendido por (${currency})`}>
            {(id) => (
              <input
                id={id}
                className="input"
                type="number"
                step="any"
                placeholder="0"
                value={form.sold ?? ''}
                onChange={onMoney('sold')}
              />
            )}
          </Field>
          <Field label="Qtd mintada">
            {(id) => (
              <input
                id={id}
                className="input"
                type="number"
                step="1"
                placeholder="1"
                value={form.supply ?? ''}
                onChange={onSupply}
              />
            )}
          </Field>
          <Field label="Lucro">
            {(id) => (
              <div id={id} className="input" style={{ display: 'flex', alignItems: 'center', background: 'transparent' }}>
                <span data-testid="form-profit" style={{ color: profit < 0 ? NEG : POS, fontWeight: 500 }}>
                  {form.cost != null || form.sold != null ? money(profit, currency) : '—'}
                </span>
              </div>
            )}
          </Field>
        </div>
      </div>

      <Field label="Observações">
        {(id) => (
          <textarea
            id={id}
            className="input"
            style={{ minHeight: 56 }}
            placeholder="horário original, condições, lembretes…"
            value={form.notes}
            onChange={onText('notes')}
          />
        )}
      </Field>

      <div className="dialog-actions">
        <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={save}>{saveLabel}</button>
      </div>
    </Dialog>
  );
}

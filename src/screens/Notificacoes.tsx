import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { nowHHMM, short } from '@shared/date.ts';
import { buildDigest } from '@shared/digest.ts';
import { itemsOn, todayModel } from '../domain/today.ts';
import { getLastNotification } from '../data/settings-repo.ts';
import type { LastNotification } from '../data/settings-repo.ts';
import { supabase } from '../lib/supabase.ts';
import { Field } from '../ui/Field.tsx';
import { Seg } from '../ui/Seg.tsx';
import type { SegOption } from '../ui/Seg.tsx';
import type { ScreenProps } from './actions.ts';

type DigestMode = 'today' | 'next';

const MODE_OPTIONS: SegOption<DigestMode>[] = [
  { label: 'Hoje', value: 'today' },
  { label: 'Próximo dia com mint', value: 'next' },
];

const lastNoteText = (n: LastNotification | null, today: string): string => {
  if (!n) return 'nenhum envio registrado ainda';
  const dayLabel = n.day === today ? 'hoje' : short(n.day);
  const timeLabel = n.sentAt ? nowHHMM(new Date(n.sentAt)) : '';
  const when = timeLabel ? `${dayLabel} ${timeLabel}` : dayLabel;
  if (n.status === 'ok') return `último envio: ${when} · ok`;
  if (n.error) return `último envio: ${when} · falhou — ${n.error}`;
  return '';
};

const pcStatusText = (): string => {
  if (typeof Notification === 'undefined') return 'Navegador sem suporte.';
  if (Notification.permission === 'granted') return 'Permissão concedida.';
  if (Notification.permission === 'denied') return 'Permissão negada no navegador.';
  return 'Ative para pedir permissão.';
};

export default function Notificacoes({ gestor, today, actions: _actions }: ScreenProps) {
  const [mode, setMode] = useState<DigestMode>('today');
  const [sendStatus, setSendStatus] = useState('');
  const [lastNotification, setLastNotification] = useState<LastNotification | null>(null);
  const [copyLabel, setCopyLabel] = useState('Copiar');

  useEffect(() => {
    let cancelled = false;
    void getLastNotification().then((n) => { if (!cancelled) setLastNotification(n); });
    return () => { cancelled = true; };
  }, []);

  const model = todayModel(gestor.items, today, gestor.settings.showPast);
  const digestDay = mode === 'today' || !model.nextDay ? today : model.nextDay;
  const pending = itemsOn(gestor.items, digestDay).filter((i) => i.done === 'pendente');
  const digestMsg = buildDigest(digestDay, pending, gestor.settings.currency);

  const onHour = (e: ChangeEvent<HTMLInputElement>) => {
    void gestor.setSetting('reminderHour', e.target.value);
  };

  const onWebhook = (e: ChangeEvent<HTMLInputElement>) => {
    void gestor.setSetting('discordWebhook', e.target.value);
  };

  const onToggleDiscord = (e: ChangeEvent<HTMLInputElement>) => {
    void gestor.setSetting('discordOn', e.target.checked);
  };

  const onTogglePc = async (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked && typeof Notification !== 'undefined') {
      await Notification.requestPermission();
    }
    void gestor.setSetting('pcOn', checked);
  };

  const onSendDiscord = async () => {
    setSendStatus('Enviando…');
    try {
      const { data } = await supabase.functions.invoke('daily-digest', { body: { mode: 'test' } });
      setSendStatus(data?.ok ? 'Enviado.' : `Falhou (${data?.status ?? 'erro'}).`);
    } catch {
      setSendStatus('Falhou (erro).');
    }
  };

  const onTestPc = () => {
    if (typeof Notification === 'undefined') return;
    new Notification('Gestor WL', { body: digestMsg });
  };

  const onCopy = () => {
    void navigator.clipboard.writeText(digestMsg).then(() => {
      setCopyLabel('Copiado');
      setTimeout(() => setCopyLabel('Copiar'), 1500);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <header>
        <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
          Notificações
        </div>
        <h1 style={{ fontSize: 34, margin: '4px 0 0' }}>Lembrete diário</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--color-neutral-400)', maxWidth: 640 }}>
          No horário abaixo, a lista de mints do dia é montada e enviada pelos canais ativos. Com a tela aberta,
          o Discord e o aviso no PC disparam sozinhos.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 'var(--space-8)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ maxWidth: 200 }}>
            <Field label="Horário do lembrete (BRT)">
              {(id) => (
                <input id={id} className="input" type="time" value={gestor.settings.reminderHour} onChange={onHour} />
              )}
            </Field>
          </div>

          <div className="card elev-sm" style={{ gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="card-title" style={{ flex: 1, fontSize: 15 }}>Discord</div>
              <label className="radio">
                <input type="checkbox" checked={gestor.settings.discordOn} onChange={onToggleDiscord} />
                <span className="dot" style={{ borderRadius: 4 }} />
                <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>ativo</span>
              </label>
            </div>
            <Field label="Webhook do canal">
              {(id) => (
                <input
                  id={id}
                  className="input"
                  placeholder="https://discord.com/api/webhooks/…"
                  value={gestor.settings.discordWebhook}
                  onChange={onWebhook}
                />
              )}
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => void onSendDiscord()}>Enviar agora</button>
              <span style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{sendStatus}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
              {lastNoteText(lastNotification, today)}
            </div>
          </div>

          <div className="card elev-sm" style={{ gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="card-title" style={{ flex: 1, fontSize: 15 }}>Aviso no PC</div>
              <label className="radio">
                <input type="checkbox" checked={gestor.settings.pcOn} onChange={(e) => void onTogglePc(e)} />
                <span className="dot" style={{ borderRadius: 4 }} />
                <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>ativo</span>
              </label>
            </div>
            <p className="card-body">
              Notificação do sistema quando a página estiver aberta no horário.{' '}
              <span style={{ color: 'var(--color-neutral-400)' }}>{pcStatusText()}</span>
            </p>
            <div>
              <button className="btn btn-secondary" onClick={onTestPc}>Testar agora</button>
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 'var(--space-8)' }}>
          <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-3)' }}>
            Prévia da mensagem · {short(digestDay)}
          </h6>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <Seg name="digest-mode" value={mode} options={MODE_OPTIONS} onChange={setMode} />
            <button className="btn btn-ghost" onClick={onCopy}>{copyLabel}</button>
          </div>
          <pre
            style={{
              margin: 0, padding: 'var(--space-6)', background: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)',
              font: '13px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace',
              whiteSpace: 'pre-wrap', color: 'var(--color-neutral-200)',
            }}
          >
            {digestMsg}
          </pre>
        </div>
      </div>
    </div>
  );
}

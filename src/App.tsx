import { useMemo, useState } from 'react';
import { nowHHMM, short, todayIso } from '@shared/date.ts';
import { useGestor } from './data/use-gestor.ts';
import { useNow } from './lib/use-now.ts';
import { useSession } from './lib/use-session.ts';
import { EMPTY_ITEM, WALLETS } from './lib/types.ts';
import type { Tab, WLItem } from './lib/types.ts';
import { ErrorBanner } from './ui/ErrorBanner.tsx';
import { WDOT } from './lib/tokens.ts';
import { todayModel } from './domain/today.ts';
import Login from './screens/Login.tsx';
import Sidebar from './screens/Sidebar.tsx';
import type { SidebarBadges, WalletCardView } from './screens/Sidebar.tsx';
import { makeItemActions } from './screens/actions.ts';
import type { ItemActions, ScreenProps } from './screens/actions.ts';

export default function App() {
  const session = useSession();
  if (session === undefined) return null;
  if (session === null) return <Login />;
  return <Shell />;
}

const PLACEHOLDER_LABELS: Record<Tab, string> = {
  dash: 'Dashboard',
  hoje: 'Hoje',
  lista: 'Lista',
  cal: 'Calendário',
  notif: 'Notificações',
};

/**
 * Espaço reservado às cinco telas das Tasks 17–21. Elas recebem exatamente
 * `ScreenProps` — este placeholder já recebe o mesmo contrato, só não usa.
 */
function Placeholder({ tab }: ScreenProps & { tab: Tab }) {
  return (
    <p style={{ fontSize: 14, color: 'var(--color-neutral-500)' }}>
      {PLACEHOLDER_LABELS[tab]}
    </p>
  );
}

function Shell() {
  const gestor = useGestor();
  const now = useNow();
  const today = todayIso(now);

  const [tab, setTab] = useState<Tab | null>(null);
  const current = tab ?? gestor.settings.startView;

  const [form, setForm] = useState<{ item: Partial<WLItem>; isEdit: boolean } | null>(null);

  const actions: ItemActions = useMemo(
    () => makeItemActions(
      (id, patch) => { void gestor.saveItem(id, patch); },
      (item, isEdit) => setForm({ item, isEdit }),
    ),
    [gestor.saveItem],
  );

  const todayM = todayModel(gestor.items, today, gestor.settings.showPast);

  const badges: SidebarBadges = {
    hoje: todayM.pendingToday > 0 ? String(todayM.pendingToday) : '',
    lista: gestor.items.length > 0 ? String(gestor.items.length) : '',
    notif: gestor.settings.discordOn || gestor.settings.pcOn ? 'on' : '',
  };

  const walletCards: WalletCardView[] = WALLETS.map((w) => {
    const items = gestor.items.filter((i) => i.wallet === w);
    const minted = items.filter((i) => i.done === 'mintado').length;
    const undated = items.filter((i) => !i.date).length;
    return {
      wallet: w,
      dot: WDOT[w],
      name: w,
      sub: `${minted} mintadas · ${undated} sem data`,
      count: items.length,
    };
  });

  const nowLabel = `${nowHHMM(now)} BRT · ${short(today)}`;

  const onNew = () => setForm({ item: { ...EMPTY_ITEM, date: today }, isEdit: false });

  return (
    <div className="wl-shell">
      <Sidebar
        tab={current}
        onTab={setTab}
        badges={badges}
        walletCards={walletCards}
        nowLabel={nowLabel}
        onNew={onNew}
      />
      <main className="wl-main">
        <div className="wl-page">
          {gestor.error && <ErrorBanner message={gestor.error} onDismiss={gestor.dismissError} />}
          {gestor.loading ? (
            <p style={{ fontSize: 14, color: 'var(--color-neutral-500)' }}>Carregando…</p>
          ) : gestor.error && gestor.items.length === 0 ? (
            <button className="btn btn-secondary" onClick={() => void gestor.reload()}>
              Tentar de novo
            </button>
          ) : (
            <Placeholder gestor={gestor} today={today} actions={actions} tab={current} />
          )}
        </div>
      </main>
      {form && null /* Task 16 monta o dialog do item aqui, usando `form`/`setForm`. */}
    </div>
  );
}

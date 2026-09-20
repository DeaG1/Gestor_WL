export type Wallet = 'Blowfly' | 'MEGA' | 'Loculus';
export type WLType = 'FCFS' | 'GTD' | 'GTD + FCFS' | '';
export type Chain = 'RH' | 'ARC' | '';
export type Status = 'Confirmado' | 'TBH' | 'TBA';
export type Done = 'pendente' | 'mintado' | 'pulado';
export type Tab = 'dash' | 'hoje' | 'lista' | 'cal' | 'notif';
export type DashScope = 'Tudo' | Wallet;

export interface WLItem {
  id: string;
  name: string;
  wallet: Wallet;
  type: WLType;
  chain: Chain;
  /** '' ou 'YYYY-MM-DD'. Vem de mint_date. */
  date: string;
  /** '' ou 'HH:MM' em BRT. Vem de mint_time. */
  time: string;
  status: Status;
  /** null = não registrado, distinto de 0. */
  cost: number | null;
  sold: number | null;
  supply: number | null;
  link: string;
  notes: string;
  done: Done;
}

export interface Settings {
  reminderHour: string;
  discordWebhook: string;
  discordOn: boolean;
  pcOn: boolean;
  currency: string;
  startView: Tab;
  showPast: boolean;
}

export interface Filters {
  q: string;
  wallet: 'Todas' | Wallet;
  type: 'Todos' | 'FCFS' | 'GTD' | 'GTD + FCFS';
  chain: 'Todas' | 'RH' | 'ARC';
  done: 'Pendentes' | 'Mintados' | 'Pulados' | 'Tudo';
}

export const WALLETS: Wallet[] = ['Blowfly', 'MEGA', 'Loculus'];
export const TYPES: Exclude<WLType, ''>[] = ['FCFS', 'GTD', 'GTD + FCFS'];
export const CHAINS: Exclude<Chain, ''>[] = ['RH', 'ARC'];
export const STATUSES: Status[] = ['Confirmado', 'TBH', 'TBA'];

/**
 * Como cada status aparece na tela. O banco continua guardando 'TBH' e 'TBA'
 * — a tradução é só de exibição, então nenhuma WL precisou ser alterada.
 * Atenção: as cores de status são escolhidas pelo valor guardado, nunca por
 * este rótulo.
 */
export const STATUS_LABELS: Record<Status, string> = {
  Confirmado: 'Confirmado',
  TBH: 'Sem horário',
  TBA: 'Sem data',
};

export const EMPTY_ITEM: Omit<WLItem, 'id'> = {
  name: '', wallet: 'Blowfly', type: 'FCFS', chain: 'RH', date: '', time: '',
  status: 'TBH', cost: null, sold: null, supply: null, link: '', notes: '', done: 'pendente',
};

export const DEFAULT_FILTERS: Filters = {
  q: '', wallet: 'Todas', type: 'Todos', chain: 'Todas', done: 'Pendentes',
};

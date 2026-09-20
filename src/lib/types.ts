export type Wallet = 'Blowfly' | 'MEGA' | 'Loculus';
export type WLType = 'FCFS' | 'GTD' | 'GTD + FCFS' | '';
// Para acrescentar uma rede: o nome aqui, o mesmo nome em CHAINS, e uma
// migration recriando wl_items_chain_check com ele. Nada mais — o filtro da
// Lista e o campo do modal saem de CHAINS.
export type Chain = 'RH' | 'ARC' | 'ZEC' | 'BNB' | 'SOLANA' | 'BASE' | '';
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
  type: 'Todos' | 'FCFS' | 'GTD' | 'GTD + FCFS' | 'Sem tipo';
  chain: 'Todas' | Exclude<Chain, ''>;
  done: 'Pendentes' | 'Mintados' | 'Pulados' | 'Tudo';
}

export const WALLETS: Wallet[] = ['Blowfly', 'MEGA', 'Loculus'];
/**
 * O que dá para escolher no modal. "Sem tipo" é o tipo vazio, e existia nos
 * dados antigos sem ter como ser escolhido.
 *
 * 'GTD + FCFS' saiu das opções a pedido do dono, mas continua válido no banco
 * e no tipo WLType: WL antigas marcadas assim seguem legíveis, e o filtro por
 * "GTD" continua trazendo elas.
 */
export const TYPE_CHOICES: { label: string; value: WLType }[] = [
  { label: 'FCFS', value: 'FCFS' },
  { label: 'GTD', value: 'GTD' },
  { label: 'Sem tipo', value: '' },
];
export const CHAINS: Exclude<Chain, ''>[] = ['RH', 'ARC', 'ZEC', 'BNB', 'SOLANA', 'BASE'];
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

// Nasce sem data e, por isso, com status 'TBA' ("Sem data"): e o estado real
// de uma WL recem-ganha, cuja data de mint ainda nao foi anunciada. Quando a
// data sair, o status vira 'TBH' ("Sem horário"); com data e hora, o proprio
// modal forca 'Confirmado' ao salvar.
export const EMPTY_ITEM: Omit<WLItem, 'id'> = {
  name: '', wallet: 'Blowfly', type: 'FCFS', chain: 'RH', date: '', time: '',
  status: 'TBA', cost: null, sold: null, supply: null, link: '', notes: '', done: 'pendente',
};

export const DEFAULT_FILTERS: Filters = {
  q: '', wallet: 'Todas', type: 'Todos', chain: 'Todas', done: 'Pendentes',
};

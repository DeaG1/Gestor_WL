import type { Status, WLType } from './types.ts';

// Loculus não vem do handoff: foi acrescentada depois. Matiz 340 (rosa/magenta)
// porque é a mais distante das outras duas wallets — ~90° do azul da MEGA e
// ~105° do amarelo da Blowfly —, e no calendário a cor é a única pista de qual
// wallet é qual. Luminosidade e croma seguem o padrão das outras duas.
export const WDOT: Record<string, string> = {
  Blowfly: 'oklch(0.82 0.15 88)',
  MEGA: 'oklch(0.72 0.14 250)',
  Loculus: 'oklch(0.76 0.14 340)',
};

/** [fundo, texto] da tag de wallet. */
export const WTAG: Record<string, [string, string]> = {
  Blowfly: ['oklch(0.42 0.09 85)', 'oklch(0.93 0.12 90)'],
  MEGA: ['oklch(0.42 0.1 250)', 'oklch(0.92 0.07 250)'],
  Loculus: ['oklch(0.42 0.10 340)', 'oklch(0.92 0.07 340)'],
};

/** Fundo do bloco de mint no calendário. */
export const WCAL: Record<string, string> = {
  Blowfly: 'oklch(0.36 0.07 85)',
  MEGA: 'oklch(0.36 0.08 250)',
  Loculus: 'oklch(0.36 0.08 340)',
};

/** [fundo, texto] da tag de status. */
export const STAG: Record<string, [string, string]> = {
  Confirmado: ['oklch(0.40 0.09 150)', 'oklch(0.92 0.10 150)'],
  TBH: ['oklch(0.42 0.10 55)', 'oklch(0.92 0.09 60)'],
  TBA: ['var(--color-neutral-800)', 'var(--color-neutral-100)'],
  Mintado: ['var(--color-accent-800)', 'var(--color-accent-100)'],
  Pulado: ['oklch(0.40 0.10 25)', 'oklch(0.92 0.06 25)'],
};

export type TypeKey = Exclude<WLType, ''> | 'Sem tipo';

export const TYPE_KEYS: TypeKey[] = ['FCFS', 'GTD', 'GTD + FCFS', 'Sem tipo'];

export const TYPE_COLORS: Record<TypeKey, string> = {
  'FCFS': 'var(--color-accent-400)',
  'GTD': 'var(--color-accent-600)',
  'GTD + FCFS': 'var(--color-accent-800)',
  'Sem tipo': 'var(--color-neutral-700)',
};

/** Lucro positivo e negativo. */
export const POS = 'var(--color-accent-300)';
export const NEG = 'var(--color-neutral-400)';

export const statusColors = (label: Status | 'Mintado' | 'Pulado'): [string, string] =>
  STAG[label] ?? STAG.TBA;

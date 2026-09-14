export const TZ = 'America/Sao_Paulo';

export const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const WDL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const MON = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const DAY_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
});
const TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});

export const pad = (n: number): string => String(n).padStart(2, '0');

export const cap = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const iso = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromIso = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const short = (day: string): string => {
  const d = fromIso(day);
  return `${WD[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

/** Data corrente em São Paulo — 'en-CA' já formata como YYYY-MM-DD. */
export const todayIso = (now: Date = new Date()): string => DAY_FMT.format(now);

/** Hora corrente em São Paulo, 'HH:MM'. */
export const nowHHMM = (now: Date = new Date()): string => TIME_FMT.format(now);

export const daysBetween = (from: string, to: string): number =>
  Math.round((fromIso(to).getTime() - fromIso(from).getTime()) / 864e5);

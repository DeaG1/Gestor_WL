export const num = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
};

export const money = (n: number, currency: string): string => {
  const abs = Math.abs(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return `${n < 0 ? '−' : ''}${currency} ${abs}`;
};

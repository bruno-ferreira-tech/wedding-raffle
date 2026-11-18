export const PRICE_CENTS = 2000;
export const MIN_NUMBER_ID = 1;
export const MAX_NUMBER_ID = 2000;

export function parseNumberInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < MIN_NUMBER_ID || n > MAX_NUMBER_ID) {
    return null;
  }
  return n;
}

export function formatRaffleNumber(id: number): string {
  return String(id).padStart(4, '0');
}

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function totalCents(count: number, unitPriceCents: number = PRICE_CENTS): number {
  return count * unitPriceCents;
}

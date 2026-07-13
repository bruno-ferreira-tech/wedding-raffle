export const PRICE_CENTS = 2000;
export const MIN_NUMBER_ID = 1;
export const MAX_NUMBER_ID = 2000;

export function formatRaffleNumber(id: number): string {
  return String(id).padStart(4, '0');
}

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function totalCents(count: number): number {
  return count * PRICE_CENTS;
}

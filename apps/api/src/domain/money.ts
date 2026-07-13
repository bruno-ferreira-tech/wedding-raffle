export const PRICE_CENTS = 2000;

export function totalCents(count: number): number {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('count inválido');
  }
  return count * PRICE_CENTS;
}

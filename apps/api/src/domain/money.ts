export const PRICE_CENTS = 2000;

export function totalCents(
  count: number,
  unitPriceCents: number = PRICE_CENTS,
): number {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('count inválido');
  }
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 1) {
    throw new Error('unitPriceCents inválido');
  }
  return count * unitPriceCents;
}

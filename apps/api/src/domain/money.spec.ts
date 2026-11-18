import { PRICE_CENTS, totalCents } from './money';

describe('money', () => {
  it('totals batch at R$20 each', () => {
    expect(PRICE_CENTS).toBe(2000);
    expect(totalCents(3)).toBe(6000);
  });

  it('rejects invalid count', () => {
    expect(() => totalCents(0)).toThrow(/inválido/);
    expect(() => totalCents(1.5)).toThrow(/inválido/);
    expect(() => totalCents(-1)).toThrow(/inválido/);
  });
});

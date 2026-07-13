import { eligiblePool, pickWinner } from './draw';

describe('draw', () => {
  it('builds pool from paid numbers excluding prior winners', () => {
    const paid = [
      { id: 1, buyerName: 'A' },
      { id: 2, buyerName: 'B' },
      { id: 3, buyerName: 'C' },
    ];
    expect(eligiblePool(paid, [2]).map((p) => p.id)).toEqual([1, 3]);
  });

  it('picks winner using provided rng index', () => {
    const pool = [
      { id: 10, buyerName: 'A' },
      { id: 20, buyerName: 'B' },
    ];
    expect(pickWinner(pool, () => 1)).toEqual({ id: 20, buyerName: 'B' });
  });

  it('throws when pool empty', () => {
    expect(() => pickWinner([], () => 0)).toThrow(/nenhum/i);
  });

  it('throws when rng returns out-of-range index', () => {
    const pool = [{ id: 1, buyerName: 'A' }];
    expect(() => pickWinner(pool, () => -1)).toThrow(/rng inválido/);
    expect(() => pickWinner(pool, () => 1)).toThrow(/rng inválido/);
  });
});

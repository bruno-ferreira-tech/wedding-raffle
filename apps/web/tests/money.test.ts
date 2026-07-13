import { describe, expect, it } from 'vitest';
import { formatBRL, formatRaffleNumber, PRICE_CENTS } from '../src/lib/money';

describe('money helpers', () => {
  it('pads raffle numbers to 4 digits', () => {
    expect(formatRaffleNumber(1)).toBe('0001');
    expect(formatRaffleNumber(42)).toBe('0042');
    expect(formatRaffleNumber(2000)).toBe('2000');
  });

  it('formats cents as BRL', () => {
    expect(formatBRL(PRICE_CENTS)).toMatch(/R\$\s*20,00/);
    expect(formatBRL(4000)).toMatch(/R\$\s*40,00/);
  });
});

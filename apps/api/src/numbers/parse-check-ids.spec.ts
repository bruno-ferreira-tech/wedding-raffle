import { parseCheckIds } from './parse-check-ids';

describe('parseCheckIds', () => {
  it('parses comma-separated unique ids in 1..2000', () => {
    expect(parseCheckIds('1,42,2000')).toEqual([1, 42, 2000]);
  });

  it('trims whitespace and rejects empty', () => {
    expect(() => parseCheckIds('')).toThrow('ids obrigatório');
    expect(() => parseCheckIds('  ')).toThrow('ids obrigatório');
  });

  it('rejects invalid or out-of-range ids', () => {
    expect(() => parseCheckIds('0')).toThrow('Número(s) inválido(s)');
    expect(() => parseCheckIds('2001')).toThrow('Número(s) inválido(s)');
    expect(() => parseCheckIds('1.5')).toThrow('Número(s) inválido(s)');
    expect(() => parseCheckIds('abc')).toThrow('Número(s) inválido(s)');
  });

  it('rejects duplicates', () => {
    expect(() => parseCheckIds('1,1')).toThrow('Número(s) duplicado(s)');
  });

  it('caps at 50 ids', () => {
    const ids = Array.from({ length: 51 }, (_, i) => String(i + 1)).join(',');
    expect(() => parseCheckIds(ids)).toThrow('Máximo de 50 números');
  });
});

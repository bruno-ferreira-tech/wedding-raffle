import { parseDrawInput } from './draw-validation';

describe('parseDrawInput', () => {
  it('accepts empty body with no label', () => {
    expect(parseDrawInput({})).toEqual({ prizeLabel: undefined });
  });

  it('trims a provided prizeLabel', () => {
    expect(parseDrawInput({ prizeLabel: '  1º prêmio  ' })).toEqual({
      prizeLabel: '1º prêmio',
    });
  });

  it('rejects empty prizeLabel string', () => {
    expect(() => parseDrawInput({ prizeLabel: '   ' })).toThrow(/prêmio/i);
  });

  it('rejects non-string prizeLabel', () => {
    expect(() => parseDrawInput({ prizeLabel: 1 })).toThrow(/prêmio/i);
  });
});

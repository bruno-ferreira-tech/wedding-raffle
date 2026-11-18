import { slugify } from './slug';

describe('slugify', () => {
  it('converts names to clean URL slugs', () => {
    expect(slugify('Bruno & Carol')).toBe('bruno-e-carol');
    expect(slugify('Mariana e Felipe - 2026')).toBe('mariana-e-felipe-2026');
    expect(slugify('  João   &   Maria  ')).toBe('joao-e-maria');
    expect(slugify('Casamento dos Sonhos!')).toBe('casamento-dos-sonhos');
  });

  it('handles accented characters', () => {
    expect(slugify('Vitória & André')).toBe('vitoria-e-andre');
    expect(slugify('Conceição')).toBe('conceicao');
  });
});

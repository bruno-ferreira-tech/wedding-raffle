import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SplitText } from './split-text';

describe('SplitText', () => {
  it('splits text into spans with class anime-char', () => {
    const { container } = render(<SplitText text="Hello" />);
    const chars = container.querySelectorAll('.anime-char');
    expect(chars.length).toBe(5);
  });
});
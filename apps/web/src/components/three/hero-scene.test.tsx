import { render, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroScene } from './hero-scene';

describe('HeroScene', () => {
  it('renders without crashing', () => {
    const { container } = render(<HeroScene />);
    expect(container).not.toBeNull();
  });

  it('updates scroll progress on scroll-progress custom event', () => {
    const { container } = render(<HeroScene />);
    const el = container.firstElementChild;
    expect(el?.getAttribute('data-scroll-progress')).toBe('0');

    act(() => {
      window.dispatchEvent(new CustomEvent('scroll-progress', { detail: 0.65 }));
    });

    expect(el?.getAttribute('data-scroll-progress')).toBe('0.65');
  });
});


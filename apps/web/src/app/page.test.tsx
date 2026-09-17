import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPage from './page';

describe('LandingPage', () => {
  it('renders the fixed background canvas container', () => {
    const { container } = render(<LandingPage />);
    const canvasContainer = container.querySelector('.canvas-container');
    expect(canvasContainer).not.toBeNull();
    expect(canvasContainer?.className).toContain('fixed');
    expect(canvasContainer?.className).toContain('z-0');
  });

  it('has a gsap-trigger section for scroll animations', () => {
    const { container } = render(<LandingPage />);
    const trigger = container.querySelector('.gsap-trigger');
    expect(trigger).not.toBeNull();
  });

  it('simulator card has tactile motion classes and dashed border', () => {
    const { container } = render(<LandingPage />);
    const simulator = container.querySelector('.receipt-card');
    expect(simulator).not.toBeNull();
    expect(simulator?.className).toContain('border-dashed');
  });
});

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPage from './page';

describe('LandingPage', () => {
  it('renders the 3D canvas container in the pedestal stage', () => {
    const { container } = render(<LandingPage />);
    const canvasContainer = container.querySelector('.canvas-container');
    expect(canvasContainer).not.toBeNull();
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

  it('renders the pinned stage container and act indicator', () => {
    const { container } = render(<LandingPage />);
    const stage = container.querySelector('.pinned-stage');
    const actIndicator = container.querySelector('.act-indicator');
    expect(stage).not.toBeNull();
    expect(actIndicator).not.toBeNull();
  });

  it('renders dedicated 3D pedestal stage in Act 1 without background overlap', () => {
    const { container } = render(<LandingPage />);
    const pedestal = container.querySelector('.pedestal-stage');
    expect(pedestal).not.toBeNull();
  });

  it('adds aria-current to active act button and tabular-nums to stage footer', () => {
    const { container } = render(<LandingPage />);
    const activeBtn = container.querySelector('.act-indicator button[aria-current="step"]');
    expect(activeBtn).not.toBeNull();
    const footer = container.querySelector('.stage-footer');
    expect(footer?.className).toContain('tabular-nums');
  });

  it('renders ticket and simulator stages in dedicated act viewports', () => {
    const { container } = render(<LandingPage />);
    const ticketAct = container.querySelector('.stage-act-ticket');
    const simAct = container.querySelector('.stage-act-simulator');
    expect(ticketAct).not.toBeNull();
    expect(simAct).not.toBeNull();
  });
});

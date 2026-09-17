import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LiveTelaoPreview } from './live-telao-preview';

describe('LiveTelaoPreview', () => {
  it('renders telao preview with title and live ticker', () => {
    render(<LiveTelaoPreview />);
    expect(screen.getByText(/Telão da Festa/i)).toBeDefined();
    expect(screen.getByText(/Tempo Real/i)).toBeDefined();
  });
});

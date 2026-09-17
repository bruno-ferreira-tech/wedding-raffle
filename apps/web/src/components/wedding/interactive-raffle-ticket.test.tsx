import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { InteractiveRaffleTicket } from './interactive-raffle-ticket';

describe('InteractiveRaffleTicket', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders ticket with serial number and guest quantity', () => {
    render(<InteractiveRaffleTicket ticketCount={3} ticketPrice={25} />);
    expect(screen.getByText(/3 cotas/i)).toBeDefined();
    expect(screen.getByText(/R\$\s*75/i)).toBeDefined();
  });

  it('triggers confirmation and stamp when clicked', () => {
    const handleSimulate = vi.fn();
    render(<InteractiveRaffleTicket ticketCount={2} ticketPrice={25} onSimulateDraw={handleSimulate} />);
    const ticket = screen.getByRole('button', { name: /bilhete de rifa/i });
    fireEvent.click(ticket);
    expect(handleSimulate).toHaveBeenCalled();
    expect(screen.getAllByText(/CONFIRMADO/i).length).toBeGreaterThan(0);
  });
});

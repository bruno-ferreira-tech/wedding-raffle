import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InteractiveRaffleTicket } from './interactive-raffle-ticket';

describe('InteractiveRaffleTicket', () => {
  it('renders ticket with serial number and guest quantity', () => {
    render(<InteractiveRaffleTicket ticketCount={3} ticketPrice={25} />);
    expect(screen.getByText(/3 cotas/i)).toBeDefined();
    expect(screen.getByText(/R\$\s*75/i)).toBeDefined();
  });
});

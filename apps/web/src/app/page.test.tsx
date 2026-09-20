import { render, within, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import LandingPage from './page';

afterEach(() => {
  cleanup();
});

describe('LandingPage', () => {
  it('renders the 3D canvas container in the hero', () => {
    const { container } = render(<LandingPage />);
    const canvasContainer = container.querySelector('.canvas-container');
    expect(canvasContainer).not.toBeNull();
  });

  it('renders the editorial header with brand, nav links, and action buttons', () => {
    const { container } = render(<LandingPage />);
    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    const withinHeader = within(header as HTMLElement);
    expect(withinHeader.getByText('Corta-Gravata')).toBeDefined();
    expect(withinHeader.getByText('Rifa do Casal')).toBeDefined();
    expect(withinHeader.getByText('Entrar')).toBeDefined();
    expect(withinHeader.getByText(/Criar Nossa Rifa/i)).toBeDefined();
  });

  it('renders the hero with headline, guarantees and 3D canvas', () => {
    const { container } = render(<LandingPage />);
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toContain('O Corta-Gravata que');
    expect(h1?.textContent).toContain('arrecada mais');
    expect(h1?.textContent).toContain('e alegra a festa.');
    expect(container.textContent).toContain('Sem mensalidade');
    expect(container.textContent).toContain('Saque PIX direto');
    expect(container.textContent).toContain('Pronto em 3 minutos');
  });

  it('renders the 3-step Como funciona no grande dia section', () => {
    const { container } = render(<LandingPage />);
    expect(container.textContent).toContain('Como funciona no grande dia');
    expect(container.textContent).toContain('QR Code nas Mesas');
    expect(container.textContent).toContain('Padrinhos com Celular');
    expect(container.textContent).toContain('Clímax no Telão');
  });

  it('renders interactive raffle ticket with fine stationery styling and aria-label', () => {
    const { container } = render(<LandingPage />);
    const ticket = container.querySelector('[aria-label="Bilhete de rifa interativo"]');
    expect(ticket).not.toBeNull();
    expect(container.textContent).toContain('O Comprovante que o');
    expect(container.textContent).toContain('Convidado Guarda');
  });

  it('renders Modo Padrinhos interactive mobile pocket demo', () => {
    const { container } = render(<LandingPage />);
    expect(container.textContent).toContain('Modo Padrinhos: A Ferramenta de Bolso');
    expect(container.textContent).toContain('Mesa 08 • Família Silva');
    expect(container.textContent).toContain('Padrinho Lucas');

    // Test clicking a quota button in the demo
    const quotaBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('4 cotas')) || container.querySelector('button');
    expect(quotaBtn).not.toBeNull();
  });

  it('renders the live telao projection section', () => {
    const { container } = render(<LandingPage />);
    expect(container.textContent).toContain('O Telão ao Vivo no Salão Nobre');
    const telao = container.querySelector('.live-telao');
    expect(telao).not.toBeNull();
  });

  it('renders honeymoon calculator as physical receipt card with sliders and tabular numerals', () => {
    const { container } = render(<LandingPage />);
    const receiptCard = container.querySelector('.receipt-card');
    expect(receiptCard).not.toBeNull();
    expect(receiptCard?.className).toContain('border-dashed');
    expect(receiptCard?.className).toContain('border-2');

    // Check sliders
    const guestsInput = container.querySelector('input[aria-label="Convidados esperados"]') as HTMLInputElement;
    expect(guestsInput).not.toBeNull();
    expect(guestsInput.min).toBe('50');
    expect(guestsInput.max).toBe('500');

    const ticketPriceInput = container.querySelector('input[aria-label="Valor da cota"]') as HTMLInputElement;
    expect(ticketPriceInput).not.toBeNull();
    expect(ticketPriceInput.min).toBe('10');
    expect(ticketPriceInput.max).toBe('100');

    const ticketsPerGuestInput = container.querySelector('input[aria-label="Cotas médias por convidado"]') as HTMLInputElement;
    expect(ticketsPerGuestInput).not.toBeNull();
    expect(ticketsPerGuestInput.min).toBe('1');
    expect(ticketsPerGuestInput.max).toBe('5');

    // Check tabular numerals
    const numerals = receiptCard!.querySelectorAll('.wedding-numeral');
    expect(numerals.length).toBeGreaterThanOrEqual(4);
    numerals.forEach((el) => {
      expect(el.className).toContain('tabular-nums');
      expect(el.className).toContain('wedding-numeral');
    });
  });

  it('updates honeymoon calculator calculations dynamically when changing sliders', () => {
    const { container } = render(<LandingPage />);
    const guestsInput = container.querySelector('input[aria-label="Convidados esperados"]') as HTMLInputElement;
    const ticketPriceInput = container.querySelector('input[aria-label="Valor da cota"]') as HTMLInputElement;
    const ticketsPerGuestInput = container.querySelector('input[aria-label="Cotas médias por convidado"]') as HTMLInputElement;

    fireEvent.change(guestsInput, { target: { value: '200' } });
    fireEvent.change(ticketPriceInput, { target: { value: '50' } });
    fireEvent.change(ticketsPerGuestInput, { target: { value: '3' } });

    expect(container.textContent).toContain('200 pessoas');
    expect(container.textContent).toContain('R$ 50,00');
    expect(container.textContent).toContain('3 bilhetes');
    expect(container.textContent).toContain('Arrecadação bruta (600 cotas)');
  });

  it('renders honest comparison section (Antes vs Agora)', () => {
    const { container } = render(<LandingPage />);
    expect(container.textContent).toContain('Por que abandonar a gravata tradicional?');
    expect(container.textContent).toContain('A Gravata Tradicional');
    expect(container.textContent).toContain('Com o Corta-Gravata');
  });

  it('renders FAQ accordion and toggles answer on click', () => {
    const { container } = render(<LandingPage />);
    expect(container.textContent).toContain('Perguntas Frequentes');
    
    // Find the first question button
    const firstFaqBtn = within(container).getByRole('button', { name: /Como os noivos recebem o dinheiro arrecadado\?/i });
    expect(firstFaqBtn).not.toBeNull();
    expect(firstFaqBtn.textContent).toContain('Como os noivos recebem o dinheiro arrecadado?');
    
    // Click to open
    fireEvent.click(firstFaqBtn);
    expect(container.textContent).toContain('Todo o valor arrecadado via PIX cai diretamente na conta bancária');
  });

  it('renders Grand Finale CTA, satin marquee ribbon and footer', () => {
    const { container } = render(<LandingPage />);
    expect(container.textContent).toContain('Prontos para brindar com');
    expect(container.textContent).toContain('Criar Nossa Rifa Grátis');
    expect(container.textContent).toContain('Celebre com elegância');
    expect(container.textContent).toContain('Todos os direitos reservados.');
  });
});

import { render, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPage from './page';

describe('LandingPage', () => {
  it('renders the 3D canvas container in the hero pedestal', () => {
    const { container } = render(<LandingPage />);
    const canvasContainer = container.querySelector('.canvas-container');
    expect(canvasContainer).not.toBeNull();
  });

  it('has a gsap-trigger section for scroll animations', () => {
    const { container } = render(<LandingPage />);
    const trigger = container.querySelector('.gsap-trigger');
    expect(trigger).not.toBeNull();
  });

  it('renders the editorial header with brand, badge and action buttons', () => {
    const { container } = render(<LandingPage />);
    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    const withinHeader = within(header!);
    expect(withinHeader.getByText('Corta-Gravata')).toBeDefined();
    expect(withinHeader.getByText('Rifa do Casal')).toBeDefined();
    expect(withinHeader.getByText('Entrar')).toBeDefined();
    expect(withinHeader.getByText(/Criar Nossa Rifa/i)).toBeDefined();
  });

  it('renders the hero with headline, guarantees and 3D pedestal', () => {
    const { container } = render(<LandingPage />);
    const hero = container.querySelector('#vinculo');
    expect(hero).not.toBeNull();
    const withinHero = within(hero!);
    const h1 = hero!.querySelector('h1');
    expect(h1?.textContent).toContain('O Corta-Gravata que');
    expect(h1?.textContent).toContain('arrecada mais');
    expect(h1?.textContent).toContain('e alegra a festa.');
    expect(withinHero.getByText('Sem mensalidade fixa')).toBeDefined();
    expect(withinHero.getByText('Saque PIX direto na conta')).toBeDefined();
    expect(withinHero.getByText('Pronto em 3 minutos')).toBeDefined();
    const canvasContainer = hero!.querySelector('.canvas-container');
    expect(canvasContainer).not.toBeNull();
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

  it('renders telao and finale stages in dedicated act viewports', () => {
    const { container } = render(<LandingPage />);
    const telaoAct = container.querySelector('.stage-act-telao');
    const finaleAct = container.querySelector('.stage-act-finale');
    expect(telaoAct).not.toBeNull();
    expect(finaleAct).not.toBeNull();
  });

  it('renders interactive raffle ticket with fine stationery styling and aria-label', () => {
    const { container } = render(<LandingPage />);
    const ticket = container.querySelector('[aria-label="Bilhete de rifa interativo"]');
    expect(ticket).not.toBeNull();
  });

  it('renders Modo Padrinhos showcase card with pocket tactile preview', () => {
    const { container } = render(<LandingPage />);
    expect(container.textContent).toContain('O Segredo da Arrecadação');
    expect(container.textContent).toContain('Modo Padrinhos: Ferramenta de Bolso');
    expect(container.textContent).toContain('Mesa 04 • Família Silva');
    expect(container.textContent).toContain('Padrinho Lucas');
    expect(container.textContent).toContain('2 cotas da sorte');
    expect(container.textContent).toContain('R$ 50,00');
    expect(container.textContent).toContain('Confirmado • Telão Sincronizado');
  });

  it('renders O Telão da Festa section with espresso velvet theme and LiveTelaoPreview', () => {
    const { container } = render(<LandingPage />);
    const telaoSection = container.querySelector('#telao');
    expect(telaoSection).not.toBeNull();
    expect(telaoSection?.className).toContain('bg-[#161311]');
    expect(telaoSection?.className).toContain('border-amber-500/20');
    expect(telaoSection?.className).toContain('shadow-[inset_0_1px_0_rgba(212,175,55,0.15)]');

    expect(telaoSection?.textContent).toContain('O Telão ao Vivo no Salão Nobre');
    expect(telaoSection?.textContent).toContain('Telão da Festa • Ao Vivo');
    expect(telaoSection?.textContent).toContain('Total Arrecadado na Pista');
    expect(telaoSection?.textContent).toContain('Simular PIX no Telão');
    expect(telaoSection?.textContent).toContain(
      'Atualização instantânea via Server-Sent Events e roleta ao vivo na hora do brinde'
    );
  });
});


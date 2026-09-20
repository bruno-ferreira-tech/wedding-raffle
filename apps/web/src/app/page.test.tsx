import { render, within, fireEvent } from '@testing-library/react';
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
    const withinHeader = within(header as HTMLElement);
    expect(withinHeader.getByText('Corta-Gravata')).toBeDefined();
    expect(withinHeader.getByText('Rifa do Casal')).toBeDefined();
    expect(withinHeader.getByText('Entrar')).toBeDefined();
    expect(withinHeader.getByText(/Criar Nossa Rifa/i)).toBeDefined();
  });

  it('renders the hero with headline, guarantees and 3D pedestal', () => {
    const { container } = render(<LandingPage />);
    const hero = container.querySelector('#vinculo');
    expect(hero).not.toBeNull();
    const withinHero = within(hero as HTMLElement);
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

  it('renders honeymoon calculator as physical receipt card with dashed borders, multi-stop shadow and tabular numerals', () => {
    const { container } = render(<LandingPage />);
    const receiptCard = container.querySelector('.receipt-card');
    expect(receiptCard).not.toBeNull();
    expect(receiptCard?.className).toContain('border-dashed');
    expect(receiptCard?.className).toContain('border-2');
    expect(receiptCard?.className).toContain('border-stone-300');
    expect(receiptCard?.className).toContain('dark:border-stone-700');
    expect(receiptCard?.className).toContain('rounded-2xl');
    expect(receiptCard?.className).toContain(
      'shadow-[0_2px_8px_rgba(44,38,30,0.04),0_12px_28px_-4px_rgba(44,38,30,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]'
    );

    // Check sliders
    const guestsInput = container.querySelector('input[aria-label="Convidados esperados"]') as HTMLInputElement;
    expect(guestsInput).not.toBeNull();
    expect(guestsInput.min).toBe('50');
    expect(guestsInput.max).toBe('500');
    expect(guestsInput.step).toBe('10');

    const ticketPriceInput = container.querySelector('input[aria-label="Valor da cota"]') as HTMLInputElement;
    expect(ticketPriceInput).not.toBeNull();
    expect(ticketPriceInput.min).toBe('10');
    expect(ticketPriceInput.max).toBe('100');
    expect(ticketPriceInput.step).toBe('5');

    const ticketsPerGuestInput = container.querySelector('input[aria-label="Cotas médias por convidado"]') as HTMLInputElement;
    expect(ticketsPerGuestInput).not.toBeNull();
    expect(ticketsPerGuestInput.min).toBe('1');
    expect(ticketsPerGuestInput.max).toBe('5');
    expect(ticketsPerGuestInput.step).toBe('1');

    // Check all numbers in receipt card have tabular-nums and wedding-numeral
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

  it('renders Grand Finale (Ato 5) with champagne gold badge, monumental headline, tactile CTAs and guarantees', () => {
    const { container } = render(<LandingPage />);
    const finaleSection = container.querySelector('#celebracao');
    expect(finaleSection).not.toBeNull();
    expect(finaleSection?.className).toContain('stage-act-finale');

    // Badge "Ato 5 • A Celebração" em marfim/ouro champanhe
    expect(finaleSection?.textContent).toContain('Ato 5 • A Celebração');
    const badge = finaleSection?.querySelector('.border-amber-500\\/25');
    expect(badge).not.toBeNull();
    expect(badge?.className).toContain('text-[#9a7837]');

    // Manchete monumental
    expect(finaleSection?.textContent).toContain('Prontos para brindar com');
    expect(finaleSection?.textContent).toContain('leveza e requinte?');

    // Texto de apoio caloroso
    expect(finaleSection?.textContent).toContain(
      'Crie a rifa do seu casamento gratuitamente agora mesmo. Leva menos de 3 minutos e você pode testar o link com seus padrinhos hoje.'
    );

    // CTA Primário com borda ouro 18K e specular highlight
    const primaryBtn = finaleSection?.querySelector('a[href="/cadastro"]');
    expect(primaryBtn).not.toBeNull();
    expect(primaryBtn?.textContent).toContain('Criar Nossa Rifa Grátis');
    const primaryBtnWrapper = primaryBtn?.closest('.wedding-button');
    expect(primaryBtnWrapper?.className).toContain('shadow-[0_4px_16px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]');
    expect(primaryBtnWrapper?.className).toContain('border-amber-400/30');

    // CTA Secundário com borda hairline e sombra suave
    const secondaryBtn = finaleSection?.querySelector('a[href="/e/bruno-moreira"]');
    expect(secondaryBtn).not.toBeNull();
    expect(secondaryBtn?.textContent).toContain('Ver Demonstração');

    // Três garantias com checks ópticos
    expect(finaleSection?.textContent).toContain('Sem mensalidade fixa');
    expect(finaleSection?.textContent).toContain('Saque PIX direto na conta');
    expect(finaleSection?.textContent).toContain('Pronto em 3 minutos');
  });

  it('renders Fita Marquee Acetinada with hairline borders, backdrop blur and micro-tracked messages', () => {
    const { container } = render(<LandingPage />);
    const marqueeRibbon = container.querySelector('.shadow-\\[inset_0_1px_0_rgba\\(255\\,255\\,255\\,0\\.7\\)\\]');
    expect(marqueeRibbon).not.toBeNull();
    expect(marqueeRibbon?.className).toContain('border-y');
    expect(marqueeRibbon?.className).toContain('border-stone-900/[0.08]');
    expect(marqueeRibbon?.className).toContain('dark:border-white/[0.08]');
    expect(marqueeRibbon?.className).toContain('bg-white/85');
    expect(marqueeRibbon?.className).toContain('dark:bg-stone-900/85');
    expect(marqueeRibbon?.className).toContain('backdrop-blur-sm');

    // Mensagens em caixa alta com micro-tracking elegante
    const marqueeSpans = marqueeRibbon?.querySelectorAll('span.tracking-\\[0\\.12em\\]');
    expect(marqueeSpans && marqueeSpans.length).toBeGreaterThanOrEqual(5);
    expect(marqueeRibbon?.textContent).toContain('Celebre com elegância');
    expect(marqueeRibbon?.textContent).toContain('Baixa Instantânea via PIX');
    expect(marqueeRibbon?.textContent).toContain('Diversão garantida no telão da pista');
    expect(marqueeRibbon?.textContent).toContain('Ferramenta ágil para os padrinhos');
    expect(marqueeRibbon?.textContent).toContain('Dinheiro direto para a Lua de Mel');
  });

  it('renders editorial footer with copyright and subtle hairline border', () => {
    const { container } = render(<LandingPage />);
    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer?.className).toContain('border-t');
    expect(footer?.className).toContain('border-stone-900/[0.06]');
    expect(footer?.className).toContain('dark:border-white/[0.06]');
    expect(footer?.textContent).toContain(
      `© ${new Date().getFullYear()} Corta-Gravata • Onde a tradição encontra o requinte.`
    );
  });
});


'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  PaletteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WalletIcon,
  CalculatorIcon,
  CoinsIcon,
  TvIcon,
  SmartphoneIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Marquee } from '@/components/ui/marquee';
import { HeroScene } from '@/components/three/hero-scene';
import { formatBRL } from '@/lib/money';
import { animatePulse } from '@/lib/animations';
import { SplitText } from '@/components/ui/split-text';
import { InteractiveRaffleTicket } from '@/components/wedding/interactive-raffle-ticket';
import { LiveTelaoPreview } from '@/components/wedding/live-telao-preview';

const ACTS = [
  { id: 'vinculo', label: '1. O Vínculo' },
  { id: 'bilhete', label: '2. O Bilhete' },
  { id: 'arrecadacao', label: '3. A Arrecadação' },
  { id: 'telao', label: '4. O Telão' },
  { id: 'celebracao', label: '5. A Celebração' },
];

export default function LandingPage() {
  const [activeAct, setActiveAct] = useState(0);

  // Calculator state
  const [guests, setGuests] = useState(150);
  const [ticketPrice, setTicketPrice] = useState(25);
  const [ticketsPerGuest, setTicketsPerGuest] = useState(2);
  const netDisplayRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const bentoContainerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const totalTickets = guests * ticketsPerGuest;
  const estimatedGross = totalTickets * ticketPrice * 100;
  const feePercent = 0.049;
  const estimatedFee = Math.round(estimatedGross * feePercent);
  const estimatedNet = estimatedGross - estimatedFee;

  const scrollToSection = (id: string, index: number) => {
    setActiveAct(index);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // IntersectionObserver to update active act as user naturally scrolls
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = ACTS.findIndex((act) => act.id === entry.target.id);
          if (index !== -1) {
            setActiveAct(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '-20% 0px -40% 0px',
      threshold: 0.2,
    });

    ACTS.forEach((act) => {
      const el = document.getElementById(act.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // GSAP kinetic reaction on calculator slider change
  useEffect(() => {
    let isMounted = true;
    if (netDisplayRef.current) {
      import('gsap').then(({ default: gsap }) => {
        if (!isMounted || !netDisplayRef.current) return;
        try {
          gsap.fromTo(
            netDisplayRef.current,
            { scale: 1.08, filter: 'brightness(1.15)', color: '#d4af37' },
            { scale: 1, filter: 'brightness(1)', color: 'var(--primary)', duration: 0.45, ease: 'back.out(1.8)' }
          );
        } catch {
          // Graceful fallback
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [estimatedNet]);

  // GSAP Bento Cards Reveal
  useEffect(() => {
    let isMounted = true;
    let ctx: { revert: () => void } | undefined;
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([{ default: gsap }, { default: ScrollTrigger }]) => {
      if (!isMounted) return;
      try {
        gsap.registerPlugin(ScrollTrigger);
        if (!bentoContainerRef.current) return;

        ctx = gsap.context(() => {
          const cards = gsap.utils.toArray('.gsap-bento');
          gsap.fromTo(
            cards,
            { y: 50, opacity: 0, scale: 0.98 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: bentoContainerRef.current,
                start: 'top 85%',
              },
            }
          );
        }, bentoContainerRef);
      } catch {
        // Graceful fallback for headless/JSDOM test environments
      }
    });

    return () => {
      isMounted = false;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-dvh w-full bg-background gsap-trigger text-foreground">
      {/* Warm Ivory Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-85">
              Corta-Gravata
            </Link>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex rounded-full border-primary/40 bg-primary/10 text-primary font-medium px-3 py-0.5">
              Rifa do Casal
            </Badge>
          </div>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Button asChild variant="ghost" size="sm" className="rounded-full font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-black/5">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="wedding-button rounded-full text-sm shadow-sm">
              <Link href="/cadastro">
                Criar Nossa Rifa <ArrowRightIcon className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Floating Act Navigation Indicator (Pinned Stage Navigator) */}
      <div className="pinned-stage sticky top-20 z-40 w-full flex justify-center px-4 py-2 pointer-events-none">
        <div className="act-indicator inline-flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-card/90 backdrop-blur-md border border-stone-900/[0.08] shadow-[0_2px_12px_rgba(44,38,30,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] pointer-events-auto overflow-x-auto max-w-full">
          {ACTS.map((act, index) => {
            const isActive = activeAct === index;
            return (
              <button
                key={act.id}
                type="button"
                aria-current={isActive ? 'step' : undefined}
                onClick={() => scrollToSection(act.id, index)}
                className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 select-none cursor-pointer whitespace-nowrap tabular-nums ${
                  isActive
                    ? 'text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-act-pill"
                    className="absolute inset-0 rounded-full bg-primary shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACT 1: O VÍNCULO (Hero & Dedicated 3D Pedestal Stage) */}
      <section
        id="vinculo"
        className="stage-act-pedestal pedestal-stage relative min-h-[90vh] flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 pt-4 pb-8 text-center border-b border-border/50"
      >
        <div className="max-w-4xl mx-auto space-y-4 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs backdrop-blur-xs"
          >
            <SparklesIcon className="size-3.5 text-primary" />
            A tradição do casamento, reinventada com requinte e alegria
          </motion.div>

          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.14]">
            <SplitText text="O Corta-Gravata que" />{' '}
            <span className="text-primary italic">arrecada mais</span>{' '}
            <SplitText text="e alegra a festa." />
          </h1>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
            Substitua a gravata picotada por uma celebração digital e acolhedora: os convidados participam pelo PIX na mesa, acompanham o telão ao vivo e concorrem a um mimo especial.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-full sm:w-auto"
            >
              <Button
                asChild
                size="lg"
                className="wedding-button wedding-shimmer h-12 px-8 rounded-full text-sm sm:text-base font-semibold w-full shadow-md cursor-pointer border border-amber-400/30 shadow-[0_2px_10px_rgba(212,175,55,0.25),inset_0_1px_0_rgba(255,255,255,0.4)]"
                onMouseEnter={() => {
                  if (ctaRef.current) animatePulse(ctaRef.current);
                }}
              >
                <Link ref={ctaRef} href="/cadastro" className="inline-flex items-center justify-center">
                  Criar Rifa dos Noivos Grátis
                  <ArrowRightIcon className="size-4 ml-2 translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-full sm:w-auto"
            >
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-7 rounded-full border-stone-900/[0.08] bg-card/90 text-foreground text-sm sm:text-base hover:bg-muted font-medium w-full shadow-[0_1px_3px_rgba(44,38,30,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xs cursor-pointer"
              >
                <Link href="/e/bruno-moreira" target="_blank">
                  Ver Exemplo ao Vivo
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-3.5 text-primary" /> Sem mensalidade fixa
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-3.5 text-primary" /> Saque PIX direto na conta
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-3.5 text-primary" /> Pronto em 3 minutos
            </span>
          </div>

          {/* Dedicated Radiant 3D Pedestal Arena */}
          <div className="canvas-container relative w-full flex items-center justify-center py-2">
            <HeroScene className="w-[260px] h-[200px] sm:w-[340px] sm:h-[240px] mx-auto cursor-grab active:cursor-grabbing" />
          </div>
        </div>

        {/* Clear, animated scroll indicator to explore Ato 2 */}
        <div className="pt-4 pb-2">
          <motion.button
            type="button"
            whileHover={{ y: 2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => scrollToSection('bilhete', 1)}
            aria-label="Descer para o Ato 2: O Bilhete"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-card hover:bg-primary/10 shadow-[0_2px_8px_rgba(44,38,30,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] transition-colors text-xs font-semibold text-primary cursor-pointer"
          >
            <span>Desça para ver o Ato 2: O Bilhete do Convidado</span>
            <span className="text-base inline-block transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
          </motion.button>
        </div>
      </section>

      {/* ACT 2: O BILHETE (Physical Paper Ticket Experience) */}
      <section
        id="bilhete"
        className="stage-act-ticket relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center border-b border-border/50 bg-secondary/15"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
            <CoinsIcon className="size-3.5 text-primary" />
            Ato 2 • Papelaria &amp; Tradição
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            O Comprovante que o <span className="text-primary italic">Convidado Guarda</span>
          </h2>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
            Nada de impressos perdidos pelo chão: o convidado adquire pelo celular e tem em mãos um comprovante elegante, com número de sorteio autenticado e baixa instantânea.
          </p>

          {/* Interactive Raffle Ticket Component */}
          <div className="w-full max-w-md mx-auto pt-4 text-left">
            <InteractiveRaffleTicket
              ticketCount={ticketsPerGuest}
              ticketPrice={ticketPrice}
              coupleNames="Noivos Felizes"
            />
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            ✨ Toque no bilhete acima para simular a carimbada de validação física e a comemoração
          </p>
        </div>
      </section>

      {/* ACT 3: A ARRECADAÇÃO (Honeymoon Revenue Simulator) */}
      <section
        id="arrecadacao"
        className="stage-act-simulator relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center border-b border-border/50"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
            <CalculatorIcon className="size-3.5 text-primary" />
            Ato 3 • A Matemática da Festa
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            Simulador em <span className="text-primary italic">Tempo Real</span>
          </h2>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
            Ajuste os parâmetros da festa e veja a arrecadação líquida estimada direto para a sua lua de mel.
          </p>

          {/* Live Simulator Card */}
          <div className="w-full max-w-lg mx-auto pt-4 text-left">
            <motion.div
              className="receipt-card border-dashed border-2 border-stone-300 dark:border-stone-700 wedding-card p-6 sm:p-8 flex flex-col justify-between bg-card shadow-[0_2px_8px_rgba(44,38,30,0.04),0_12px_28px_-4px_rgba(44,38,30,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] rounded-2xl"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border border-dashed">
                  <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                    <CalculatorIcon className="size-5 text-primary" />
                    Simulador da Festa
                  </h3>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Em tempo real
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Convidados esperados</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums">{guests} pessoas</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="10"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Valor da cota</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums">R$ {ticketPrice},00</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Cotas médias por convidado</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums">{ticketsPerGuest} bilhetes</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={ticketsPerGuest}
                      onChange={(e) => setTicketsPerGuest(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border border-dashed pt-5 space-y-2 mt-6">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Arrecadação bruta ({totalTickets} cotas)</span>
                  <span className="wedding-numeral font-medium text-foreground tabular-nums">{formatBRL(estimatedGross)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Taxa de serviço e PIX (4.9%)</span>
                  <span className="wedding-numeral font-medium text-muted-foreground tabular-nums">- {formatBRL(estimatedFee)}</span>
                </div>
                <div className="pt-3 border-t border-border/60 flex items-baseline justify-between">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Líquido para a Lua de Mel
                  </div>
                  <div ref={netDisplayRef} className="font-heading font-bold text-3xl sm:text-4xl text-primary wedding-numeral tracking-tight tabular-nums">
                    <NumberTicker value={estimatedNet} formatFn={(n) => formatBRL(Math.round(n))} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ACT 4: O TELÃO (Velvet Night Projection Experience) */}
      <section
        id="telao"
        className="stage-act-telao relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center border-b border-border/50 bg-[#161311] text-[#fbf9f6]"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-[#f5d77f] shadow-[inset_0_1px_0_rgba(212,175,55,0.15)]">
            <TvIcon className="size-3.5 text-[#d4af37] translate-y-[-0.5px]" />
            <span className="leading-none">Ato 4 • A Pista de Dança</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            O Telão ao Vivo no <span className="text-[#d4af37] italic">Salão Nobre</span>
          </h2>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-stone-300 font-normal leading-relaxed">
            Conecte ao projetor da festa em 1 clique. O painel monumenta os valores em tempo real e o sorteio gera o momento mais vibrante da noite.
          </p>

          {/* Live Telão Projection Component */}
          <div className="w-full max-w-2xl mx-auto pt-4 text-left">
            <LiveTelaoPreview />
          </div>

          <p className="text-xs text-stone-400 pt-2 flex items-center justify-center gap-1.5">
            <span>🥂</span>
            <span>Atualização instantânea via Server-Sent Events e roleta ao vivo na hora do brinde</span>
          </p>
        </div>
      </section>

      {/* ACT 5: A CELEBRAÇÃO / GRAND FINALE */}
      <section
        id="celebracao"
        className="stage-act-finale relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-24 text-center border-b border-border/50 bg-secondary/20"
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <Badge variant="outline" className="rounded-full border-primary/30 bg-card px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
            Ato 5 • A Celebração
          </Badge>

          <h2 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
            Prontos para brindar com <span className="text-primary italic">leveza e requinte?</span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Crie a rifa do seu casamento gratuitamente agora mesmo. Leva menos de 3 minutos e você pode testar o link com seus padrinhos hoje.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-full sm:w-auto"
            >
              <Button asChild size="lg" className="wedding-button wedding-shimmer h-14 px-10 rounded-full text-lg font-semibold shadow-xl cursor-pointer w-full border border-amber-400/30 shadow-[0_4px_16px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]">
                <Link href="/cadastro" className="inline-flex items-center justify-center">
                  Criar Nossa Rifa Grátis
                  <ArrowRightIcon className="size-5 ml-2 translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-full sm:w-auto"
            >
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-stone-900/[0.08] bg-card text-foreground text-base hover:bg-muted font-medium w-full shadow-[0_1px_3px_rgba(44,38,30,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] cursor-pointer">
                <Link href="/e/bruno-moreira" target="_blank">
                  Ver Demonstração
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium pt-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Sem mensalidade fixa
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Saque PIX direto na conta
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="size-4 text-primary" /> Pronto em 3 minutos
            </span>
          </div>
        </div>
      </section>

      {/* PLATFORM BENEFITS EDITORIAL SHOWCASE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-border/50 bg-secondary/10" ref={bentoContainerRef}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="rounded-full border-primary/30 bg-card px-4 py-1 text-xs font-semibold text-primary shadow-xs">
              Recursos da Plataforma
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Tudo o que você precisa para o grande dia
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Do momento em que os padrinhos circulam pelas mesas até o clímax do brinde e sorteio no telão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 (Destaque Principal: Modo Padrinhos - col-span-1 lg:col-span-2) */}
            <motion.div
              className="gsap-bento wedding-card p-6 sm:p-8 flex flex-col justify-between lg:col-span-2 border border-stone-900/[0.08] shadow-[0_1px_3px_rgba(44,38,30,0.03),0_8px_20px_-4px_rgba(44,38,30,0.05),inset_0_1px_0_rgba(255,255,255,0.85)] rounded-2xl"
              whileHover={{ y: -3, scale: 1.004 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
                    <SmartphoneIcon className="size-3.5" />
                    O Segredo da Arrecadação
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-foreground">
                    Modo Padrinhos: Ferramenta de Bolso
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Uma interface ultrarrápida pensada para os padrinhos circularem entre as mesas com um copo na mão. Registre pagamentos em dinheiro vivo ou via PIX em apenas 2 toques, enquanto o telão no salão atualiza automaticamente.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2Icon className="size-3.5 text-primary" /> Baixa em 2 toques
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2Icon className="size-3.5 text-primary" /> Sem instalar aplicativo
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2Icon className="size-3.5 text-primary" /> Funciona em qualquer celular
                    </span>
                  </div>
                </div>

                {/* Tactile Pocket Preview Mock */}
                <div className="md:col-span-5 bg-card/90 rounded-xl p-4 border border-stone-200/90 dark:border-stone-800 shadow-[0_2px_12px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] space-y-3 select-none">
                  <div className="flex items-center justify-between border-b border-dashed border-stone-200 dark:border-stone-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-semibold text-foreground tracking-wide">Mesa 04 • Família Silva</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Padrinho Lucas
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor selecionado</div>
                      <div className="font-heading text-lg font-bold text-foreground">2 cotas da sorte</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total PIX</div>
                      <div className="wedding-numeral text-lg font-bold text-primary tabular-nums">R$ 50,00</div>
                    </div>
                  </div>

                  <div className="w-full py-2 px-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 text-primary text-xs font-semibold">
                    <CheckCircle2Icon className="size-3.5" />
                    <span>Confirmado • Telão Sincronizado</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: PIX sem atrito */}
            <motion.div
              className="gsap-bento wedding-card p-6 sm:p-8 flex flex-col justify-between border border-stone-900/[0.08] shadow-[0_1px_3px_rgba(44,38,30,0.03),0_8px_20px_-4px_rgba(44,38,30,0.05),inset_0_1px_0_rgba(255,255,255,0.85)] rounded-2xl"
              whileHover={{ y: -3, scale: 1.006 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <div>
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <WalletIcon className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">PIX sem atrito</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Leitura instantânea de QR Code com baixa imediata. Sem exigir download de aplicativo e sem constrangimento para o convidado na mesa.
                </p>
              </div>
              <div className="pt-4 border-t border-border/50 text-xs font-medium text-primary flex items-center gap-1">
                <span>Comprovante digital imediato</span>
                <span className="translate-x-0.5">→</span>
              </div>
            </motion.div>

            {/* Card 3: Sorteio Auditável */}
            <motion.div
              className="gsap-bento wedding-card p-6 sm:p-8 flex flex-col justify-between border border-stone-900/[0.08] shadow-[0_1px_3px_rgba(44,38,30,0.03),0_8px_20px_-4px_rgba(44,38,30,0.05),inset_0_1px_0_rgba(255,255,255,0.85)] rounded-2xl"
              whileHover={{ y: -3, scale: 1.006 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <div>
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <TvIcon className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">Sorteio Auditável</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Algoritmo transparente e animação empolgante no telão da festa, garantindo lisura total e o ápice de diversão no salão na hora do brinde.
                </p>
              </div>
              <div className="pt-4 border-t border-border/50 text-xs font-medium text-primary flex items-center gap-1">
                <span>Conexão em 1 clique ao projetor</span>
                <span className="translate-x-0.5">→</span>
              </div>
            </motion.div>

            {/* Card 4: Harmonia Visual */}
            <motion.div
              className="gsap-bento wedding-card p-6 sm:p-8 flex flex-col justify-between border border-stone-900/[0.08] shadow-[0_1px_3px_rgba(44,38,30,0.03),0_8px_20px_-4px_rgba(44,38,30,0.05),inset_0_1px_0_rgba(255,255,255,0.85)] rounded-2xl"
              whileHover={{ y: -3, scale: 1.006 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <div>
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <PaletteIcon className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">Harmonia Visual</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Paletas nobres inspiradas em convites de alta papelaria: Champagne, Rosé Floral e Noite de Gala. O sistema se adapta perfeitamente à sua decoração.
                </p>
              </div>
              <div className="pt-4 border-t border-border/50 text-xs font-medium text-primary flex items-center gap-1">
                <span>Três temas de gala inclusos</span>
                <span className="translate-x-0.5">→</span>
              </div>
            </motion.div>

            {/* Card 5: Sem Mensalidade */}
            <motion.div
              className="gsap-bento wedding-card p-6 sm:p-8 flex flex-col justify-between border border-stone-900/[0.08] shadow-[0_1px_3px_rgba(44,38,30,0.03),0_8px_20px_-4px_rgba(44,38,30,0.05),inset_0_1px_0_rgba(255,255,255,0.85)] rounded-2xl"
              whileHover={{ y: -3, scale: 1.006 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <div>
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <CoinsIcon className="size-6" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">Sem Mensalidade</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Crie sua rifa gratuitamente e pague apenas uma pequena taxa sobre as cotas recebidas. O saldo arrecadado cai direto na conta dos noivos via PIX.
                </p>
              </div>
              <div className="pt-4 border-t border-border/50 text-xs font-medium text-primary flex items-center gap-1">
                <span>Taxa única de 4.9% sem mensalidades</span>
                <span className="translate-x-0.5">→</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Ribbon - Continuous elegant tape */}
      <div className="border-y border-stone-900/[0.08] bg-card/85 py-4 backdrop-blur-sm overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <Marquee speedSecs={35} pauseOnHover>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground px-8">
            🥂 Celebre com elegância
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary px-8">
            ⚡ Baixa Instantânea via PIX
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground px-8">
            📺 Diversão garantida no telão da pista
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary px-8">
            🤵 Ferramenta ágil para os padrinhos
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground px-8">
            ✈️ Dinheiro direto para a Lua de Mel
          </span>
        </Marquee>
      </div>

      {/* Stage Footer for ergonomic act tracking */}
      <div className="stage-footer py-6 text-center text-xs text-muted-foreground tabular-nums">
        Ato {activeAct + 1} de 5 • Corta-Gravata
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-8 text-center bg-background">
        <p className="text-sm text-muted-foreground font-medium">
          © {new Date().getFullYear()} Corta-Gravata • Onde a tradição encontra o requinte.
        </p>
      </footer>
    </div>
  );
}

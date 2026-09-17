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
  ChevronDownIcon,
  CoinsIcon,
  TvIcon,
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

export default function LandingPage() {
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

  // GSAP ScrollTrigger to orchestrate full page scroll progress
  useEffect(() => {
    let ctx: { revert: () => void };
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([{ default: gsap }, { default: ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      
      if (!mainRef.current) return;
      
      ctx = gsap.context(() => {
        // Continuous scrub across the whole page to drive 3D ring separation & re-union
        ScrollTrigger.create({
          trigger: mainRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
          onUpdate: (self) => {
            window.dispatchEvent(new CustomEvent('scroll-progress', { detail: self.progress }));
          }
        });
      }, mainRef);
    });
    
    return () => { if (ctx) ctx.revert(); };
  }, []);

  // GSAP kinetic reaction on calculator slider change
  useEffect(() => {
    if (netDisplayRef.current) {
      import('gsap').then(({ default: gsap }) => {
        gsap.fromTo(
          netDisplayRef.current,
          { scale: 1.08, filter: 'brightness(1.15)', color: '#d4af37' },
          { scale: 1, filter: 'brightness(1)', color: 'var(--primary)', duration: 0.45, ease: 'back.out(1.8)' }
        );
      });
    }
  }, [estimatedNet]);

  // GSAP Bento Cards Reveal
  useEffect(() => {
    let ctx: { revert: () => void };
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([{ default: gsap }, { default: ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      
      if (!bentoContainerRef.current) return;
      
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray('.gsap-bento');
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.98 },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1, 
            duration: 0.8, 
            stagger: 0.08, 
            ease: 'power3.out',
            scrollTrigger: {
              trigger: bentoContainerRef.current,
              start: 'top 85%',
            }
          }
        );
      }, bentoContainerRef);
    });

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-dvh w-full bg-background gsap-trigger text-foreground overflow-x-hidden">
      {/* Three.js Fixed Stage: Dual 3D Rings separate on scroll and reunite at bottom */}
      <div className="canvas-container fixed inset-0 z-0 pointer-events-none">
        <HeroScene className="w-full h-full" />
      </div>

      {/* Warm Ivory Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
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

      {/* Main Flow Layer */}
      <div className="scroll-content relative z-10 w-full">
        {/* Hero Section: Centered over intertwined rings */}
        <section className="min-h-[88vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs backdrop-blur-xs"
            >
              <SparklesIcon className="size-3.5 text-primary" />
              A tradição do casamento, reinventada com requinte e alegria
            </motion.div>

            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.12]">
              <SplitText text="O Corta-Gravata que" />{' '}
              <span className="text-primary italic">arrecada mais</span>{' '}
              <SplitText text="e alegra a festa." />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground font-normal leading-relaxed"
            >
              Substitua a gravata picotada por uma celebração digital e acolhedora: os convidados participam pelo PIX na mesa, acompanham o telão ao vivo e concorrem a um mimo especial.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="wedding-button wedding-shimmer h-13 px-8 rounded-full text-base font-semibold w-full sm:w-auto shadow-md cursor-pointer"
                onMouseEnter={() => {
                  if (ctaRef.current) animatePulse(ctaRef.current);
                }}
              >
                <Link ref={ctaRef} href="/cadastro">
                  Criar Rifa dos Noivos Grátis
                  <ArrowRightIcon className="size-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-13 px-8 rounded-full border-border bg-card/80 text-foreground text-base hover:bg-muted font-medium w-full sm:w-auto shadow-xs backdrop-blur-xs">
                <Link href="/e/bruno-moreira" target="_blank">
                  Ver Exemplo ao Vivo
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2Icon className="size-4 text-primary" /> Sem mensalidade fixa
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2Icon className="size-4 text-primary" /> Saque PIX direto na conta
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2Icon className="size-4 text-primary" /> Pronto em 3 minutos
              </span>
            </motion.div>

            {/* Hint to scroll down and see rings separate */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="pt-10 flex flex-col items-center gap-1.5 text-xs text-muted-foreground/80 select-none"
            >
              <span>Role para explorar a experiência</span>
              <ChevronDownIcon className="size-4 text-primary" />
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Kinetic Showcase */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24" ref={bentoContainerRef}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
            
            {/* Card 1: Interactive Revenue Simulator (4 cols) - Inspired by physical receipt voucher */}
            <motion.div 
              className="gsap-bento receipt-card border-dashed border-2 md:col-span-6 lg:col-span-5 wedding-card p-6 sm:p-8 flex flex-col justify-between min-h-[500px] bg-card"
              whileHover={{ scale: 0.985, y: 2 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border border-dashed">
                  <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                    <CalculatorIcon className="size-5 text-primary" />
                    Simulador da Festa
                  </h3>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Em tempo real
                  </span>
                </div>
                
                <div className="space-y-5 pt-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Convidados esperados</span>
                      <span className="wedding-numeral font-bold text-primary">{guests} pessoas</span>
                    </div>
                    <input
                      type="range" min="50" max="500" step="10" value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Valor da cota</span>
                      <span className="wedding-numeral font-bold text-primary">R$ {ticketPrice},00</span>
                    </div>
                    <input
                      type="range" min="10" max="100" step="5" value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Cotas médias por convidado</span>
                      <span className="wedding-numeral font-bold text-primary">{ticketsPerGuest} bilhetes</span>
                    </div>
                    <input
                      type="range" min="1" max="5" step="1" value={ticketsPerGuest}
                      onChange={(e) => setTicketsPerGuest(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border border-dashed pt-5 space-y-1.5 mt-8">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Arrecadação bruta ({totalTickets} cotas)</span>
                  <span className="wedding-numeral font-medium text-foreground">{formatBRL(estimatedGross)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Taxa de serviço e PIX (4.9%)</span>
                  <span className="wedding-numeral font-medium text-muted-foreground">- {formatBRL(estimatedFee)}</span>
                </div>
                <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Líquido para a Lua de Mel
                  </div>
                  <div ref={netDisplayRef} className="font-heading font-bold text-3xl sm:text-4xl text-primary wedding-numeral tracking-tight">
                    <NumberTicker value={estimatedNet} formatFn={(n) => formatBRL(Math.round(n))} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Interactive Raffle Ticket (7 cols) - UI Forager Paper Ticket Archetype */}
            <motion.div 
              className="gsap-bento md:col-span-6 lg:col-span-7 wedding-card p-6 sm:p-8 flex flex-col justify-between min-h-[500px] bg-card/90 backdrop-blur-xs"
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Papelaria &amp; Tradição
                    </span>
                    <h3 className="font-heading font-bold text-2xl text-foreground">
                      O Bilhete que o Convidado Recebe
                    </h3>
                  </div>
                  <CoinsIcon className="size-6 text-primary/80" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nada de impressos perdidos pelo chão: o convidado adquire pelo celular e tem em mãos um comprovante elegante, com número de sorteio autenticado e baixa instantânea.
                </p>

                {/* Live Ticket Component responding to simulator */}
                <div className="pt-2">
                  <InteractiveRaffleTicket 
                    ticketCount={ticketsPerGuest} 
                    ticketPrice={ticketPrice}
                    coupleNames="Noivos Felizes"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border mt-4">
                <span>✨ Clique no bilhete para simular o efeito tátil da confirmação</span>
                <span className="font-semibold text-primary">100% Digital &amp; Tátil</span>
              </div>
            </motion.div>

            {/* Card 3: Live Telão Projection Simulation (Full Width 12 cols) */}
            <motion.div 
              className="gsap-bento md:col-span-12 wedding-card p-6 sm:p-8 bg-card"
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <TvIcon className="size-6" />
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-foreground">
                    O Telão que Transforma a Pista de Dança
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    Conecte o projetor do salão em 1 clique. O painel monumenta os valores em tempo real, exibe o feed de quem acabou de contribuir e gera o ápice da festa com o sorteio animado.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground font-medium pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2Icon className="size-4 text-primary" /> Atualização em milissegundos via SSE (Server-Sent Events)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2Icon className="size-4 text-primary" /> Visual de gala com alto contraste para leitura à distância
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2Icon className="size-4 text-primary" /> Animação de sorteio com roleta e revelação dramática
                    </li>
                  </ul>
                </div>

                <div className="lg:col-span-7">
                  <LiveTelaoPreview />
                </div>
              </div>
            </motion.div>

            {/* Card 4: Modo Padrinhos (Pocket Operator) */}
            <motion.div 
              className="gsap-bento md:col-span-6 lg:col-span-4 wedding-card p-6 sm:p-8"
              whileHover={{ y: -4, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                <ShieldCheckIcon className="size-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">Modo Padrinhos</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Uma ferramenta de bolso para os padrinhos circularem pelas mesas. Permite registrar pagamentos em dinheiro vivo ou via PIX com velocidade de 2 toques.
              </p>
            </motion.div>

            {/* Card 5: PIX Direto */}
            <motion.div 
              className="gsap-bento md:col-span-6 lg:col-span-4 wedding-card p-6 sm:p-8"
              whileHover={{ y: -4, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                <WalletIcon className="size-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">PIX sem atrito</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Leitura instantânea de QR Code com baixa imediata. Sem exigir download de aplicativo e sem constrangimento para o convidado.
              </p>
            </motion.div>

            {/* Card 6: Harmonia Visual */}
            <motion.div 
              className="gsap-bento md:col-span-12 lg:col-span-4 wedding-card p-6 sm:p-8"
              whileHover={{ y: -4, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                <PaletteIcon className="size-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">Harmonia Visual</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paletas nobres inspiradas em convites de alta papelaria: Champagne, Rosé Floral e Noite de Gala. O sistema se adapta perfeitamente à sua decoração.
              </p>
            </motion.div>

          </div>
        </main>

        {/* Marquee Ribbon - Continuous elegant tape */}
        <div className="border-y border-border bg-card/80 py-4 backdrop-blur-sm overflow-hidden">
          <Marquee speedSecs={35} pauseOnHover>
            <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground px-8">
              🥂 Celebre com elegância
            </span>
            <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-primary px-8">
              ⚡ Baixa Instantânea via PIX
            </span>
            <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground px-8">
              📺 Diversão garantida no telão da pista
            </span>
            <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-primary px-8">
              🤵 Ferramenta ágil para os padrinhos
            </span>
            <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground px-8">
              ✈️ Dinheiro direto para a Lua de Mel
            </span>
          </Marquee>
        </div>

        {/* Call to Action Footer: Where the 3D Rings Reunite at the Bottom */}
        <section className="relative py-28 px-4 sm:px-8 bg-secondary/30 text-center">
          <div className="mx-auto max-w-3xl space-y-8 relative z-10">
            <Badge variant="outline" className="rounded-full border-primary/30 bg-card px-4 py-1 text-xs font-semibold text-primary">
              Prontos para Celebrar
            </Badge>

            <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground leading-[1.15]">
              Prontos para brindar com leveza, requinte e união?
            </h2>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Crie a rifa do seu casamento gratuitamente agora mesmo. Leva menos de 3 minutos e você pode testar o link com seus padrinhos hoje.
            </p>

            <div className="pt-4">
              <Button asChild size="lg" className="wedding-button wedding-shimmer h-14 px-10 rounded-full text-lg font-semibold shadow-xl cursor-pointer">
                <Link href="/cadastro">
                  Começar Nossa Celebração
                  <ArrowRightIcon className="size-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-10 px-4 sm:px-8 text-center bg-background">
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} Corta-Gravata • Onde a tradição encontra o requinte.
          </p>
        </footer>
      </div>
    </div>
  );
}

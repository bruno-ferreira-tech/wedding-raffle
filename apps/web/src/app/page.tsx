'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  PaletteIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TvIcon,
  WalletIcon,
  CalculatorIcon,
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

  useEffect(() => {
    let ctx: { revert: () => void };
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([{ default: gsap }, { default: ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      
      if (!mainRef.current) return;
      
      ctx = gsap.context(() => {
        // Create a scroll trigger that scrubs through the page
        ScrollTrigger.create({
          trigger: mainRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            // Dispatch a custom event to notify HeroScene
            window.dispatchEvent(new CustomEvent('scroll-progress', { detail: self.progress }));
          }
        });
      }, mainRef);
    });
    
    return () => { if (ctx) ctx.revert(); };
  }, []);

  useEffect(() => {
    // GSAP kinetic reaction on calculator change
    if (netDisplayRef.current) {
      import('gsap').then(({ default: gsap }) => {
        gsap.fromTo(
          netDisplayRef.current,
          { scale: 1.05, filter: 'brightness(1.1)', color: 'var(--primary)' },
          { scale: 1, filter: 'brightness(1)', color: 'var(--primary)', duration: 0.4, ease: 'back.out(1.5)' }
        );
      });
    }
  }, [estimatedNet]);

  useEffect(() => {
    // GSAP entrance animation for Bento Grid
    let ctx: { revert: () => void };
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([{ default: gsap }, { default: ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);
      
      if (!bentoContainerRef.current) return;
      
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray('.gsap-bento');
        
        // Initial reveal
        gsap.fromTo(
          cards,
          { y: 80, opacity: 0, scale: 0.97 },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1, 
            duration: 0.9, 
            stagger: 0.1, 
            ease: 'power3.out',
            scrollTrigger: {
              trigger: bentoContainerRef.current,
              start: 'top 90%',
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
      <div className="canvas-container fixed inset-0 z-0 pointer-events-none">
        <HeroScene className="w-full h-full" />
      </div>

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
            <Button asChild size="sm" className="wedding-button rounded-full text-sm">
              <Link href="/cadastro">
                Criar Nossa Rifa <ArrowRightIcon className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="scroll-content relative z-10 w-full pt-[100vh]">
        {/* Main Bento Grid Kinetic Showcase */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20 sm:pt-16 sm:pb-32" ref={bentoContainerRef}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-auto">
          
          {/* Card 1: Main Hero with 3D Rings (Spans 8 columns) */}
          <motion.div 
            className="gsap-bento md:col-span-8 wedding-card flex flex-col md:flex-row overflow-hidden relative min-h-[480px] sm:min-h-[520px] isolate"
            whileHover={{ y: -4, scale: 0.995 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Text Content */}
            <div className="p-8 sm:p-12 md:w-3/5 flex flex-col justify-center space-y-6 z-10 relative">
              <Badge variant="outline" className="w-fit text-primary border-primary/20 bg-primary/5 text-xs font-semibold px-3 py-1 rounded-full">
                <SparklesIcon className="size-3.5 mr-1.5 inline-block" />
                A tradição, sem constrangimento
              </Badge>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                <SplitText text="O Corta-Gravata que" /> <span className="text-primary italic">arrecada mais</span> <SplitText text="e alegra a festa." />
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md">
                Substitua o dinheiro picotado por uma experiência tátil e elegante. Os convidados participam pelo PIX e concorrem a um prêmio especial da noite.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  asChild
                  className="wedding-button h-13 px-8 rounded-full text-base font-semibold shadow-md w-full sm:w-auto"
                  onMouseEnter={() => {
                    if (ctaRef.current) animatePulse(ctaRef.current);
                  }}
                >
                  <Link ref={ctaRef} href="/cadastro">
                    Garanta sua participação <ArrowRightIcon className="size-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Subtle Gradient Backdrop */}
            <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/5 z-0 opacity-15 md:opacity-100 pointer-events-none flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card md:hidden" />
            </div>
          </motion.div>

          {/* Card 2: The Ticket Simulator (Spans 4 columns) - Inspired by paper receipts */}
          <motion.div 
            className="gsap-bento receipt-card border-dashed border-2 md:col-span-4 wedding-card p-6 sm:p-8 flex flex-col justify-between min-h-[480px] sm:min-h-[520px] bg-card"
            whileHover={{ scale: 0.985, y: 2 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border border-dashed">
                <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                  <CalculatorIcon className="size-5 text-primary" />
                  Simulador de Lua de Mel
                </h3>
              </div>
              
              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Convidados</span>
                    <span className="wedding-numeral font-bold text-primary">{guests}</span>
                  </div>
                  <input
                    type="range" min="50" max="500" step="10" value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Valor por cota</span>
                    <span className="wedding-numeral font-bold text-primary">R$ {ticketPrice},00</span>
                  </div>
                  <input
                    type="range" min="10" max="100" step="5" value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Cotas por convidado</span>
                    <span className="wedding-numeral font-bold text-primary">{ticketsPerGuest}</span>
                  </div>
                  <input
                    type="range" min="1" max="5" step="1" value={ticketsPerGuest}
                    onChange={(e) => setTicketsPerGuest(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border border-dashed pt-5 space-y-1 mt-8">
               <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                 Estimativa Livre (Pós-taxa 4.9%)
               </div>
               <div ref={netDisplayRef} className="font-heading font-bold text-4xl text-primary wedding-numeral tracking-tight">
                   <NumberTicker value={estimatedNet} formatFn={(n) => formatBRL(Math.round(n))} />
               </div>
            </div>
          </motion.div>

          {/* Card 3: Telão Festivo */}
          <motion.div 
            className="gsap-bento md:col-span-12 lg:col-span-8 wedding-card p-6 sm:p-8 bg-card flex flex-col sm:flex-row gap-6 items-center"
            whileHover={{ y: -4, scale: 0.995 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
             <div className="size-16 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <TvIcon className="size-8" />
             </div>
             <div>
               <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Telão Festivo ao Vivo</h3>
               <p className="text-muted-foreground leading-relaxed">
                 O coração da festa. Conecte ao projetor do salão: a arrecadação sobe em tempo real e o sorteio final gera um momento vibrante na pista de dança, revelando o vencedor com grande estilo.
               </p>
             </div>
          </motion.div>

          {/* Card 4: Pagamento Tátil */}
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
               Um toque, uma leitura de QR Code, e o número é garantido instantaneamente. Zero necessidade de conferir comprovantes em papel.
             </p>
          </motion.div>

          {/* Card 5: Modo Padrinho */}
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
               Uma tela otimizada para os padrinhos operarem pelo celular enquanto circulam pelas mesas. Receba em dinheiro ou PIX com um clique.
             </p>
          </motion.div>

           {/* Card 6: Design Autêntico */}
           <motion.div 
            className="gsap-bento md:col-span-6 lg:col-span-4 wedding-card p-6 sm:p-8"
            whileHover={{ y: -4, scale: 0.995 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
             <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                <PaletteIcon className="size-6" />
             </div>
             <h3 className="font-heading text-xl font-bold text-foreground mb-2">Harmonia Visual</h3>
             <p className="text-sm text-muted-foreground leading-relaxed">
               Paletas desenhadas como convites de luxo: Champagne, Rosé Floral e Noite de Gala. A tecnologia que respeita a beleza do seu evento.
             </p>
          </motion.div>

           {/* Card 7: Saque Rápido */}
           <motion.div 
            className="gsap-bento md:col-span-6 lg:col-span-4 wedding-card p-6 sm:p-8"
            whileHover={{ y: -4, scale: 0.995 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
             <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                <CheckCircle2Icon className="size-6" />
             </div>
             <h3 className="font-heading text-xl font-bold text-foreground mb-2">Dinheiro na Mão</h3>
             <p className="text-sm text-muted-foreground leading-relaxed">
               Ao final do evento, com um único comando, transfira o valor acumulado direto para a conta bancária do casal. Simples e seguro.
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
            📺 Diversão garantida na pista
          </span>
          <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-primary px-8">
            🤵 Ferramenta de bolso para os padrinhos
          </span>
          <span className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground px-8">
            ✈️ Ajuda real para a Lua de Mel
          </span>
        </Marquee>
      </div>

      {/* Call to Action Footer */}
      <section className="py-24 px-4 sm:px-8 bg-secondary/20">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl text-foreground leading-[1.1]">
            Prontos para brindar com leveza e praticidade?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Crie sua conta agora mesmo. É gratuito para configurar e testar o link da sua rifa sem compromisso.
          </p>
          <div className="pt-4">
            <Button asChild size="lg" className="wedding-button h-14 px-10 rounded-full text-lg font-semibold shadow-xl">
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

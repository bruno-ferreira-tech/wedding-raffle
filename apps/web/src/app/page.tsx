'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CheckCircle2Icon,
  CalculatorIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Marquee } from '@/components/ui/marquee';
import { HeroScene } from '@/components/three/hero-scene';
import { formatBRL } from '@/lib/money';
import { InteractiveRaffleTicket } from '@/components/wedding/interactive-raffle-ticket';
import { LiveTelaoPreview } from '@/components/wedding/live-telao-preview';

const springButton = { type: 'spring', stiffness: 400, damping: 25 } as const;
const springAccordion = { type: 'spring', stiffness: 320, damping: 26 } as const;

const FAQS = [
  {
    q: 'Como os noivos recebem o dinheiro arrecadado?',
    a: 'Todo o valor arrecadado via PIX cai diretamente na conta bancária cadastrada pelos noivos. O saque pode ser realizado a qualquer momento, sem carência e sem travas.',
  },
  {
    q: 'E se algum convidado quiser contribuir em dinheiro vivo?',
    a: 'Os padrinhos utilizam o Modo Padrinho no próprio celular para registrar contribuições em dinheiro vivo em 2 toques. O valor entra na contabilidade da festa e o convidado ganha seu bilhete da sorte normalmente.',
  },
  {
    q: 'Precisa baixar algum aplicativo na hora da festa?',
    a: 'Não! Nem os noivos, nem os padrinhos e nem os convidados precisam baixar nada. Funciona 100% pelo navegador de qualquer celular com leitura instantânea de QR Code.',
  },
  {
    q: 'Como funciona a exibição no telão da pista?',
    a: 'Basta abrir o link do telão no notebook conectado ao projetor ou TV do salão. A tela atualiza em tempo real a cada novo Pix e inclui a roleta animada para o sorteio no momento do brinde.',
  },
  {
    q: 'Existe alguma mensalidade ou taxa oculta?',
    a: 'Zero mensalidade e zero custo de ativação. Cobramos apenas uma taxa única e transparente de 4.9% sobre as cotas recebidas para cobrir os custos bancários e de processamento.',
  },
];

export default function LandingPage() {
  const [guests, setGuests] = useState(150);
  const [ticketPrice, setTicketPrice] = useState(25);
  const [ticketsPerGuest, setTicketsPerGuest] = useState(2);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [demoCotas, setDemoCotas] = useState(2);
  const [demoConfirmed, setDemoConfirmed] = useState(false);

  const totalTickets = guests * ticketsPerGuest;
  const estimatedGross = totalTickets * ticketPrice * 100;
  const feePercent = 0.049;
  const estimatedFee = Math.round(estimatedGross * feePercent);
  const estimatedNet = estimatedGross - estimatedFee;

  const [tickerKey, setTickerKey] = useState(0);
  useEffect(() => {
    setTickerKey((k) => k + 1);
  }, [estimatedNet]);

  return (
    <div className="relative min-h-dvh w-full bg-[#faf8f5] text-[#1c1917] overflow-x-hidden font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-stone-900/[0.06] bg-[#faf8f5]/92 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Corta-Gravata
            </span>
            <span className="hidden sm:inline-flex items-center text-[11px] font-medium tracking-widest uppercase text-stone-400 pl-3 border-l border-stone-300/80">
              Rifa do Casal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#padrinhos" className="hover:text-foreground transition-colors">Modo Padrinhos</a>
            <a href="#telao" className="hover:text-foreground transition-colors">Telão ao Vivo</a>
            <a href="#calculadora" className="hover:text-foreground transition-colors">Simulador</a>
            <a href="#duvidas" className="hover:text-foreground transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-full font-medium text-sm text-stone-600 hover:text-foreground hover:bg-stone-900/[0.04]">
              <Link href="/login">Entrar</Link>
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton}>
              <Button asChild size="sm" className="wedding-button rounded-full text-sm font-semibold shadow-[0_2px_8px_rgba(212,175,55,0.25),inset_0_1px_0_rgba(255,255,255,0.4)] border border-amber-400/30 cursor-pointer">
                <Link href="/cadastro" className="inline-flex items-center">
                  Criar Nossa Rifa <ArrowRightIcon className="size-3.5 ml-1.5 translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* HERO ASSIMÉTRICO */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left: Manifesto */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="h-px w-8 bg-amber-600/40" />
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">Casamentos · Brasil · 2026</p>
              </div>
              
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-[76px] xl:text-[84px] font-semibold tracking-tight text-foreground leading-[1.04]">
                O Corta-Gravata que{' '}
                <span className="text-primary italic font-normal">arrecada mais</span>
                {' '}e alegra a festa.
              </h1>
              
              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Sem o constrangimento de picotar gravata e sem notas amassadas pelo bolso. Seus convidados contribuem pelo celular no PIX, vibram com o sorteio no telão e você recebe direto na conta para a lua de mel.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton} className="w-full sm:w-auto">
                  <Button asChild size="lg" className="wedding-button h-14 px-8 rounded-full text-base font-semibold w-full shadow-[0_4px_16px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] border border-amber-400/40 cursor-pointer">
                    <Link href="/cadastro" className="inline-flex items-center justify-center">
                      Criar Rifa dos Noivos Grátis
                      <ArrowRightIcon className="size-4 ml-2 translate-x-0.5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton} className="w-full sm:w-auto">
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-stone-900/[0.08] bg-white/90 text-foreground text-base hover:bg-stone-100 font-medium w-full shadow-[0_1px_3px_rgba(44,38,30,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] cursor-pointer">
                    <Link href="/e/bruno-moreira" target="_blank">Ver Exemplo ao Vivo</Link>
                  </Button>
                </motion.div>
              </div>
              
              {/* Guarantees — NO Lucide icons, refined typography */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-500 font-medium pt-1">
                <span>Sem mensalidade</span>
                <span className="text-stone-300">·</span>
                <span>Saque PIX direto</span>
                <span className="text-stone-300">·</span>
                <span>Pronto em 3 minutos</span>
              </div>
            </div>
            
            {/* Right: Pedestal Joalheiro */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#fbf9f6] to-[#f4eee6] border border-stone-900/[0.06] p-4 shadow-[0_2px_8px_rgba(44,38,30,0.03),0_18px_36px_-8px_rgba(44,38,30,0.07),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col items-center">
                <HeroScene className="canvas-container w-full h-[360px] sm:h-[400px] lg:h-[460px]" />
                <div className="pt-2 pb-1 text-center">
                  <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
                    ✦ Alianças em Ouro 18K · Interativas
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll affordance editorial */}
          <div className="mt-16 flex flex-col items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-medium">
              Role para descobrir
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: [0.25, 1, 0.5, 1] }}
              className="w-px h-6 bg-gradient-to-b from-stone-400 to-transparent"
            />
          </div>
        </div>
      </section>

      {/* NARRATIVA DA FESTA — editorial, NOT 3 identical cards */}
      <section id="como-funciona" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] bg-[#fbf9f6]/60">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl mb-20 sm:mb-24">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium mb-3">Dinâmica do Salão</p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.08]">
              Na festa.<br /><span className="italic font-normal text-stone-500">No salão. Em dois toques.</span>
            </h2>
          </div>
          
          <div className="relative pl-6 sm:pl-10 border-l border-stone-300/70 space-y-16 sm:space-y-24">
            {/* Item 1 — QR Code na mesa */}
            <div className="relative max-w-2xl group">
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 size-3 rounded-full bg-stone-300 border-2 border-[#faf8f5] group-hover:bg-primary transition-colors" />
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-heading italic text-[#b89047]/60 text-4xl sm:text-5xl font-semibold">01</span>
                <span className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">
                  Mesa de Jantar · Ao lado do menu impresso
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                QR Code na mesa
              </h3>
              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
                Seu convidado senta, vê o QR Code discreto ao lado do cardápio e contribui pelo celular — sem app, sem senha, sem constrangimento.
              </p>
            </div>
            
            {/* Item 2 — Padrinho */}
            <div className="relative max-w-2xl group sm:translate-x-8">
              <div className="absolute -left-[31px] sm:-left-[79px] top-1.5 size-3 rounded-full bg-stone-300 border-2 border-[#faf8f5] group-hover:bg-primary transition-colors" />
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-heading italic text-[#b89047]/60 text-4xl sm:text-5xl font-semibold">02</span>
                <span className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">
                  Pista de Dança · Direto pelo smartphone
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                Padrinho com o celular
              </h3>
              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
                Ele já está na pista. Dois toques e o PIX está registrado. O bilhete é emitido na hora.
              </p>
            </div>
            
            {/* Item 3 — Telão */}
            <div className="relative max-w-2xl group sm:translate-x-16">
              <div className="absolute -left-[31px] sm:-left-[111px] top-1.5 size-3 rounded-full bg-stone-300 border-2 border-[#faf8f5] group-hover:bg-primary transition-colors" />
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-heading italic text-[#b89047]/60 text-4xl sm:text-5xl font-semibold">03</span>
                <span className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">
                  Palco Principal · Momento do brinde
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                Clímax no telão
              </h3>
              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
                O salão inteiro vê o valor crescer em tempo real. Na hora do brinde: a roleta gira e o sorteio acontece ao vivo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BILHETE DA SORTE */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#f5f0ea]/70 border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="max-w-xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium mb-3">Lembrança Física & Digital</p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.08] mb-6">
              O Comprovante que o<br />Convidado Guarda
            </h2>
            <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
              Não é um ticket qualquer. É um pedaço da festa — numerado, autenticado e elegante como o papel de algodão de um convite.
            </p>
          </div>

          {/* Estojo Passe-Partout */}
          <div className="relative mx-auto max-w-2xl rounded-3xl bg-[#faf8f5] border border-stone-900/[0.07] p-8 sm:p-12 shadow-[0_2px_6px_rgba(44,38,30,0.03),0_24px_48px_-12px_rgba(44,38,30,0.09),inset_0_1px_0_rgba(255,255,255,0.95)]">
            <div className="flex justify-center">
              <InteractiveRaffleTicket ticketCount={1} ticketPrice={50} coupleNames="Ana & Bruno" />
            </div>

            <div className="mt-8 pt-6 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-4 text-[11px] text-stone-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500/60" />
                Papel Algodão 300g
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500/60" />
                Serrilha Picotada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500/60" />
                QR Code & Sorteio Único
              </span>
            </div>
          </div>

          <p className="mt-6 text-xs text-stone-500 italic">
            ↑ Toque no bilhete para validar o carimbo interativo
          </p>
        </div>
      </section>

      {/* PADRINHOS */}
      <section id="padrinhos" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium mb-3">Para os Padrinhos</p>
                <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.08]">
                  Padrinho de verdade<br /><span className="italic font-normal text-stone-500">não precisa de caderneta.</span>
                </h2>
              </div>
              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed">
                Com o celular no bolso, ele registra quem contribuiu — em dinheiro vivo ou PIX — sem sair da pista de dança. O bilhete é emitido e enviado na hora.
              </p>
              <div className="space-y-4 pt-2 text-sm text-stone-600">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-serif font-bold text-base leading-none mt-0.5">—</span>
                  <span><strong>Sem papel nem caneta:</strong> Contabilidade automática da arrecadação da festa.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-serif font-bold text-base leading-none mt-0.5">—</span>
                  <span><strong>Dinheiro vivo ou PIX:</strong> O padrinho recebe a nota ou gera o QR Code no balcão.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-serif font-bold text-base leading-none mt-0.5">—</span>
                  <span><strong>Zero aplicativos:</strong> Abre direto pelo navegador de qualquer smartphone.</span>
                </div>
              </div>
            </div>
            
            {/* Padrinho Demo Mockup — Chassi de Bolso Refinado */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md p-6 sm:p-7 rounded-[28px] bg-[#faf8f5] border border-stone-900/[0.08] shadow-[0_4px_16px_rgba(44,38,30,0.04),0_20px_44px_-10px_rgba(44,38,30,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] space-y-5 select-none">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-amber-600/70 ring-4 ring-amber-500/10" />
                    <span className="text-xs font-semibold text-foreground tracking-tight">Mesa 08 • Família Silva</span>
                  </div>
                  <span className="text-[10px] font-sans font-medium tracking-wide text-stone-500 bg-stone-200/50 px-2.5 py-1 rounded-full border border-stone-300/40">
                    Padrinho Lucas
                  </span>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                    Modo Padrinhos: A Ferramenta de Bolso
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[1, 2, 4].map((n) => (
                      <motion.button
                        key={n}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        transition={springButton}
                        onClick={() => {
                          setDemoCotas(n);
                          setDemoConfirmed(false);
                        }}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          demoCotas === n
                            ? 'border-primary bg-primary text-white shadow-[0_2px_8px_rgba(184,144,71,0.3)]'
                            : 'border-stone-200/80 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {n} {n === 1 ? 'cota' : 'cotas'}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-baseline py-2 px-3 rounded-xl bg-stone-100/60 border border-stone-200/50">
                  <span className="text-xs text-stone-500 font-medium">Valor da contribuição:</span>
                  <span className="font-heading text-xl font-bold text-primary tabular-nums">
                    {formatBRL(demoCotas * 25 * 100)}
                  </span>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springButton}
                  onClick={() => setDemoConfirmed(true)}
                  className="w-full py-3.5 rounded-xl wedding-button font-semibold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2Icon className="size-4" />
                  <span>{demoConfirmed ? 'Contribuição Registrada!' : 'Confirmar no PIX / Dinheiro'}</span>
                </motion.button>

                {demoConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#8c6b2d] text-xs text-center font-medium"
                  >
                    🎉 Bilhete № 0489 gerado e telão sincronizado!
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TELÃO */}
      <section id="telao" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#161311] border-b border-white/[0.04] text-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="size-1.5 rounded-full bg-amber-400" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300/80 font-medium">
                Projeção na Pista de Dança
              </p>
            </div>
            
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              O salão inteiro<br /><span className="italic font-normal text-amber-300/90">vibra junto.</span>
            </h2>
            
            <p className="text-stone-400 mt-5 text-sm sm:text-base font-normal leading-relaxed">
              O Telão ao Vivo no Salão Nobre sincroniza cada cota em tempo real. No momento do brinde, a roleta gira para revelar o vencedor diante de todos os convidados.
            </p>
          </div>
          
          {/* Moldura de Palco & Display de Alta Resolução */}
          <div className="relative mx-auto max-w-5xl rounded-[32px] p-2 sm:p-4 bg-gradient-to-b from-[#2a241e] to-[#1a1614] border border-amber-500/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="live-telao rounded-2xl overflow-hidden">
              <LiveTelaoPreview />
            </div>
            <div className="py-3 px-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-400 font-medium">
              <span className="flex items-center gap-1.5 text-amber-400/90">
                ✦ Transmissão ao vivo via navegador
              </span>
              <span>Compatível com Smart TVs, telões de LED e projetores HDMI</span>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section id="calculadora" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] bg-[#faf8f5]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center max-w-xl mx-auto mb-14 sm:mb-18">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium mb-3">Transparência Total</p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.08]">
              Quanto vai chegar<br /><span className="italic font-normal text-stone-500">na conta dos noivos?</span>
            </h2>
            <p className="text-base sm:text-lg text-stone-600 font-normal mt-4 leading-relaxed">
              Ajuste e veja o número em tempo real. Sem pegadinhas, sem taxas escondidas.
            </p>
          </div>
          
          <div className="w-full max-w-xl mx-auto pt-2 text-left">
            <div className="receipt-card border-dashed border-2 border-stone-300/90 p-7 sm:p-9 rounded-[28px] bg-white shadow-[0_2px_8px_rgba(44,38,30,0.03),0_16px_36px_-6px_rgba(44,38,30,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200/90 border-dashed">
                  <div>
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-foreground tracking-tight">
                      Simulador da Festa
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">Estimativa em tempo real para a lua de mel</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60">
                    Em tempo real
                  </span>
                </div>

                <div className="space-y-5 pt-1">
                  {/* Slider 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="font-medium text-stone-700">Convidados esperados</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums text-base">{guests} pessoas</span>
                    </div>
                    <input
                      type="range"
                      aria-label="Convidados esperados"
                      min="50"
                      max="500"
                      step="10"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-stone-100 rounded-full appearance-none cursor-pointer border border-stone-200/60"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="font-medium text-stone-700">Valor da cota</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums text-base">R$ {ticketPrice},00</span>
                    </div>
                    <input
                      type="range"
                      aria-label="Valor da cota"
                      min="10"
                      max="100"
                      step="5"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-stone-100 rounded-full appearance-none cursor-pointer border border-stone-200/60"
                    />
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="font-medium text-stone-700">Cotas médias por convidado</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums text-base">{ticketsPerGuest} bilhetes</span>
                    </div>
                    <input
                      type="range"
                      aria-label="Cotas médias por convidado"
                      min="1"
                      max="5"
                      step="1"
                      value={ticketsPerGuest}
                      onChange={(e) => setTicketsPerGuest(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-stone-100 rounded-full appearance-none cursor-pointer border border-stone-200/60"
                    />
                  </div>
                </div>
              </div>

              {/* Totais do Recibo */}
              <div className="border-t border-stone-200/90 border-dashed pt-6 space-y-2.5 mt-8">
                <div className="flex justify-between text-xs sm:text-sm text-stone-600">
                  <span>Arrecadação bruta ({totalTickets} cotas)</span>
                  <span className="wedding-numeral font-semibold text-foreground tabular-nums">{formatBRL(estimatedGross)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-stone-500">
                  <span>Taxa de serviço e PIX (4.9%)</span>
                  <span className="wedding-numeral font-medium text-stone-500 tabular-nums">- {formatBRL(estimatedFee)}</span>
                </div>
                <div className="pt-4 border-t border-stone-200/80 flex items-baseline justify-between">
                  <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                    Líquido para a Lua de Mel
                  </div>
                  <div key={tickerKey} className="font-heading font-bold text-3xl sm:text-4xl text-primary wedding-numeral tracking-tight tabular-nums">
                    <NumberTicker value={estimatedNet} formatFn={(n) => formatBRL(Math.round(n))} />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-center text-xs text-stone-400">
              ✦ Saques transferidos diretamente para a chave PIX dos noivos · Sem carência bancária
            </p>
          </div>
        </div>
      </section>

      {/* COMPARATIVO */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#f5f0ea]/60 border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl mb-16 sm:mb-20">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium mb-3">Evolução do Rito</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.12]">
              Por que abandonar a gravata tradicional?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Left — O Passado */}
            <div className="p-8 sm:p-10 rounded-3xl bg-stone-200/40 border border-stone-300/60 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">O Passado</span>
              </div>
              <h3 className="font-heading text-2xl font-semibold text-stone-700">A Gravata Tradicional</h3>
              <p className="text-base text-stone-600 leading-relaxed">
                Picotar a gravata do noivo garante risada, mas é constrangedor para quem não quer participar. Notas amassadas no bolso do smoking não chegam completas. A contabilidade some com a festa.
              </p>
              <div className="pt-2 text-xs text-stone-400 space-y-1.5">
                <p>— Tesoura na gravata cara do noivo</p>
                <p>— Constrangimento para convidados sem dinheiro</p>
                <p>— Risco de perda de notas na festa</p>
              </div>
            </div>

            {/* Right — O Presente de Alta Costura */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-500/30 shadow-[0_2px_8px_rgba(44,38,30,0.03),0_18px_36px_-8px_rgba(44,38,30,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] space-y-4">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">O Presente</span>
              </div>
              <h3 className="font-heading text-2xl font-semibold text-foreground">Com o Corta-Gravata</h3>
              <p className="text-base text-stone-600 leading-relaxed">
                PIX na hora, bilhete na tela, valor subindo no telão. Ninguém precisa carregar nota na carteira numa festa. O dinheiro chega direto na conta dos noivos, limpo e contabilizado.
              </p>
              <div className="pt-2 text-xs text-stone-500 space-y-1.5">
                <p>✦ Bilhete elegante numerado como lembrança</p>
                <p>✦ PIX instantâneo pelo QR Code da mesa</p>
                <p>✦ Salão inteiro vibrando com o telão ao vivo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] bg-[#faf8f5]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium mb-3">Tire Suas Dúvidas</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              Perguntas Frequentes
            </h2>
          </div>
          
          <div className="space-y-3.5">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-stone-900/[0.07] bg-white overflow-hidden shadow-[0_1px_3px_rgba(44,38,30,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(44,38,30,0.05)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 sm:p-7 text-left font-heading font-semibold text-base sm:text-lg text-foreground flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={springAccordion}
                      className="shrink-0 text-stone-400"
                    >
                      <ChevronDownIcon className="size-5" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springAccordion}
                        className="overflow-hidden"
                      >
                        <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-1 text-sm sm:text-base text-stone-600 leading-relaxed border-t border-stone-100 font-normal">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRAND FINALE */}
      <section className="py-32 sm:py-40 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f7f4ed] to-[#faf8f5]">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <div className="inline-flex items-center justify-center size-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-primary text-sm font-serif">
            ✦
          </div>

          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.06]">
            Prontos para brindar com<br /><span className="italic font-normal text-primary">leveza e requinte?</span>
          </h2>
          
          <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto leading-relaxed">
            Celebre com elegância — crie a rifa dos noivos em 3 minutos e deixe a festa render o que ela merece para a sua lua de mel.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton} className="w-full sm:w-auto">
              <Button asChild size="lg" className="wedding-button h-15 px-10 rounded-full text-base font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.35),inset_0_1px_0_rgba(255,255,255,0.45)] cursor-pointer border border-amber-400/40 w-full sm:w-auto">
                <Link href="/cadastro" className="inline-flex items-center justify-center">
                  Criar Nossa Rifa Grátis <ArrowRightIcon className="size-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400 font-medium pt-2">
            <span>Sem mensalidade</span>
            <span>·</span>
            <span>Sem fidelidade</span>
            <span>·</span>
            <span>Cancele quando quiser</span>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-stone-900/[0.06] py-4 overflow-hidden bg-white/40">
        <Marquee speedSecs={30} pauseOnHover>
          <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide uppercase text-stone-400">Casamento de Ana & Rodrigo · São Paulo</span>
          <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide uppercase text-stone-400">Casamento de Beatriz & João · Rio de Janeiro</span>
          <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide uppercase text-stone-400">Casamento de Carolina & Pedro · Belo Horizonte</span>
          <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide uppercase text-stone-400">Casamento de Daniela & Lucas · Curitiba</span>
          <span className="mx-8 text-xs sm:text-sm font-medium tracking-wide uppercase text-stone-400">Casamento de Mariana & Rafael · Porto Alegre</span>
        </Marquee>
      </div>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 text-center space-y-3 bg-[#faf8f5]">
        <p className="font-heading text-lg font-semibold text-stone-700">Corta-Gravata</p>
        <p className="text-xs text-stone-400 max-w-md mx-auto">
          O ateliê digital para a arrecadação da gravata e do sapatinho dos noivos com elegância, afeto e transparência.
        </p>
        <p className="text-[11px] text-stone-400 pt-4 border-t border-stone-200/60 max-w-xs mx-auto">
          © {new Date().getFullYear()} Corta-Gravata · Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

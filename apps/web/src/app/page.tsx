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
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Corta-Gravata
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-[#9a7837] border border-amber-500/20">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: Manifesto */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">Casamentos · Brasil · 2026</p>
              
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-[80px] font-semibold tracking-tight text-foreground leading-[1.04]">
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
              
              {/* Guarantees — NO Lucide icons, just text with interpunct */}
              <p className="text-xs text-stone-400 font-medium">
                Sem mensalidade · Saque PIX direto · Pronto em 3 minutos
              </p>
            </div>
            
            {/* Right: Pedestal */}
            <div className="lg:col-span-5 flex flex-col items-center gap-4">
              <HeroScene className="canvas-container w-full h-[380px] lg:h-[480px]" />
              <p className="text-xs text-stone-400 tracking-wide">✦ Alianças em Ouro 18K · Interativas</p>
            </div>
          </div>
          
          {/* Scroll affordance */}
          <div className="mt-16 flex justify-center">
            <p className="text-xs uppercase tracking-widest text-stone-400 font-medium animate-bounce">Role para descobrir ↓</p>
          </div>
        </div>
      </section>

      {/* NARRATIVA DA FESTA — editorial, NOT 3 identical cards */}
      <section id="como-funciona" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-tight mb-20">
            Na festa.<br /><span className="italic font-normal text-stone-500">No salão. Em dois toques.</span>
          </h2>
          
          <div className="space-y-20">
            {/* Item 1 — QR Code na mesa */}
            <div className="max-w-[70%]">
              <p className="font-heading italic text-[#b89047]/50 text-6xl font-semibold mb-4">01</p>
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">QR Code na mesa</h3>
              <p className="text-stone-600 leading-relaxed">Seu convidado senta, vê o QR Code discreto ao lado do cardápio e contribui pelo celular — sem app, sem senha, sem constrangimento.</p>
            </div>
            
            {/* Item 2 — Padrinho */}
            <div className="ml-auto max-w-[55%]">
              <p className="font-heading italic text-[#b89047]/50 text-6xl font-semibold mb-4">02</p>
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">Padrinho com o celular</h3>
              <p className="text-stone-600 leading-relaxed">Ele já está na pista. Dois toques e o PIX está registrado. O bilhete é emitido na hora.</p>
            </div>
            
            {/* Item 3 — Telão */}
            <div className="max-w-[65%]">
              <p className="font-heading italic text-[#b89047]/50 text-6xl font-semibold mb-4">03</p>
              <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">Clímax no telão</h3>
              <p className="text-stone-600 leading-relaxed">O salão inteiro vê o valor crescer em tempo real. Na hora do brinde: a roleta gira e o sorteio acontece ao vivo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BILHETE DA SORTE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f5f0ea] border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-tight mb-6">
            O Comprovante que o<br />Convidado Guarda
          </h2>
          <p className="text-stone-600 leading-relaxed mb-12 max-w-xl mx-auto">
            Não é um ticket qualquer. É um pedaço da festa — numerado, autenticado e elegante como o papel de algodão de um convite.
          </p>
          <div className="flex justify-center">
            <InteractiveRaffleTicket ticketCount={1} ticketPrice={50} coupleNames="Ana & Bruno" />
          </div>
          <p className="mt-6 text-xs text-stone-400 italic">↑ Toque no bilhete para validar</p>
        </div>
      </section>

      {/* PADRINHOS */}
      <section id="padrinhos" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-3">Para os Padrinhos</p>
                <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-tight">
                  Padrinho de verdade<br /><span className="italic font-normal text-stone-500">não precisa de caderneta.</span>
                </h2>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Com o celular, ele registra quem contribuiu — em dinheiro ou PIX — sem sair do lugar. O bilhete é emitido na hora.
              </p>
              <div className="space-y-3 text-sm text-stone-600">
                <p>— Funciona offline para dinheiro vivo</p>
                <p>— Bilhete emitido instantaneamente</p>
                <p>— Sem necessidade de app ou cadastro</p>
              </div>
            </div>
            
            {/* Padrinho Demo Mockup */}
            <div className="p-6 rounded-3xl bg-[#faf8f5] border border-stone-900/[0.08] shadow-[0_4px_16px_rgba(44,38,30,0.06),0_16px_36px_-6px_rgba(44,38,30,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] space-y-4 select-none">
              <div className="flex items-center justify-between border-b border-dashed border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-foreground">Mesa 08 • Família Silva</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-full">
                  Padrinho Lucas
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  Modo Padrinhos: A Ferramenta de Bolso
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setDemoCotas(n);
                        setDemoConfirmed(false);
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        demoCotas === n
                          ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                          : 'border-stone-200 bg-white text-foreground hover:bg-stone-100'
                      }`}
                    >
                      {n} {n === 1 ? 'cota' : 'cotas'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-baseline py-1">
                <span className="text-xs text-stone-500">Valor da contribuição:</span>
                <span className="font-heading text-xl font-bold text-primary tabular-nums">
                  {formatBRL(demoCotas * 25 * 100)}
                </span>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={springButton}
                onClick={() => setDemoConfirmed(true)}
                className="w-full py-3 rounded-xl wedding-button font-semibold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2Icon className="size-4" />
                <span>{demoConfirmed ? 'Contribuição Registrada!' : 'Confirmar no PIX / Dinheiro'}</span>
              </motion.button>

              {demoConfirmed && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs text-center font-medium"
                >
                  🎉 Bilhete № 0489 gerado e telão sincronizado!
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TELÃO */}
      <section id="telao" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#161311] border-b border-white/[0.04]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-3">Projeção ao Vivo</p>
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
              O salão inteiro<br /><span className="italic font-normal text-amber-400/80">vibra junto.</span>
            </h2>
            <p className="text-stone-500 mt-4 text-sm">O Telão ao Vivo no Salão Nobre</p>
          </div>
          <div className="live-telao">
            <LiveTelaoPreview />
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section id="calculadora" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              Quanto vai chegar<br /><span className="italic font-normal text-stone-500">na conta dos noivos?</span>
            </h2>
            <p className="text-stone-600 mt-4 leading-relaxed">Ajuste e veja o número em tempo real. Sem pegadinhas, sem taxas escondidas.</p>
          </div>
          
          <div className="w-full max-w-lg mx-auto pt-4 text-left">
            <div className="receipt-card border-dashed border-2 border-stone-300 p-6 sm:p-8 rounded-2xl bg-white shadow-[0_2px_8px_rgba(44,38,30,0.04),0_12px_28px_-4px_rgba(44,38,30,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 border-dashed">
                  <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                    <CalculatorIcon className="size-5 text-primary" />
                    Simulador da Festa
                  </h3>
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                    Em tempo real
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Slider 1 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Convidados esperados</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums">{guests} pessoas</span>
                    </div>
                    <input
                      type="range"
                      aria-label="Convidados esperados"
                      min="50"
                      max="500"
                      step="10"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-stone-200 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Valor da cota</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums">R$ {ticketPrice},00</span>
                    </div>
                    <input
                      type="range"
                      aria-label="Valor da cota"
                      min="10"
                      max="100"
                      step="5"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-stone-200 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">Cotas médias por convidado</span>
                      <span className="wedding-numeral font-bold text-primary tabular-nums">{ticketsPerGuest} bilhetes</span>
                    </div>
                    <input
                      type="range"
                      aria-label="Cotas médias por convidado"
                      min="1"
                      max="5"
                      step="1"
                      value={ticketsPerGuest}
                      onChange={(e) => setTicketsPerGuest(Number(e.target.value))}
                      className="w-full accent-primary h-2 bg-stone-200 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Totais do Recibo */}
              <div className="border-t border-stone-200 border-dashed pt-5 space-y-2 mt-6">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Arrecadação bruta ({totalTickets} cotas)</span>
                  <span className="wedding-numeral font-medium text-foreground tabular-nums">{formatBRL(estimatedGross)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Taxa de serviço e PIX (4.9%)</span>
                  <span className="wedding-numeral font-medium text-stone-500 tabular-nums">- {formatBRL(estimatedFee)}</span>
                </div>
                <div className="pt-3 border-t border-stone-200 flex items-baseline justify-between">
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                    Líquido para a Lua de Mel
                  </div>
                  <div key={tickerKey} className="font-heading font-bold text-3xl sm:text-4xl text-primary wedding-numeral tracking-tight tabular-nums">
                    <NumberTicker value={estimatedNet} formatFn={(n) => formatBRL(Math.round(n))} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARATIVO */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f5f0ea] border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-16">
            Por que abandonar a gravata tradicional?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left — neutral tone, no X icons */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl font-semibold text-stone-600">A Gravata Tradicional</h3>
              <p className="text-stone-500 leading-relaxed">Picotar a gravata do noivo garante risada, mas é constrangedor para quem não quer participar. Notas amassadas no bolso do smoking não chegam completas. A contabilidade some com a festa.</p>
            </div>
            {/* Right — elevated, champagne border */}
            <div className="pl-8 border-l-2 border-amber-400/40 bg-amber-50/30 rounded-r-2xl pr-6 py-2 space-y-4">
              <h3 className="font-heading text-xl font-semibold text-foreground">Com o Corta-Gravata</h3>
              <p className="text-stone-600 leading-relaxed">PIX na hora, bilhete na tela, valor subindo no telão. Ninguém precisa carregar nota na carteira numa festa. O dinheiro chega direto na conta dos noivos, limpo e contabilizado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06]">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-heading text-4xl font-semibold tracking-tight text-foreground mb-12">Perguntas Frequentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-stone-900/[0.08] bg-white overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left font-heading font-semibold text-base sm:text-lg text-foreground flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
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
                        <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-stone-600 leading-relaxed border-t border-stone-100">
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
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[#f7f4ed]">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h2 className="font-heading text-5xl sm:text-6xl font-semibold tracking-tight text-foreground leading-tight">
            Prontos para brindar com<br /><span className="italic font-normal text-primary">leveza e requinte?</span>
          </h2>
          <p className="text-stone-600 leading-relaxed">Celebre com elegância — crie a rifa dos noivos em 3 minutos e deixe a festa render o que ela merece.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton}>
              <Button asChild size="lg" className="wedding-button h-14 px-10 rounded-full text-base font-semibold shadow-[0_4px_16px_rgba(212,175,55,0.3)] cursor-pointer border border-amber-400/40">
                <Link href="/cadastro" className="inline-flex items-center">
                  Criar Nossa Rifa Grátis <ArrowRightIcon className="size-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
          <p className="text-xs text-stone-400">Sem mensalidade · Sem fidelidade · Cancele quando quiser</p>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-stone-900/[0.06] py-4 overflow-hidden">
        <Marquee speedSecs={30} pauseOnHover>
          <span className="mx-8 text-sm font-medium text-stone-400">Casamento de Ana & Rodrigo</span>
          <span className="mx-8 text-sm font-medium text-stone-400">Casamento de Beatriz & João</span>
          <span className="mx-8 text-sm font-medium text-stone-400">Casamento de Carolina & Pedro</span>
          <span className="mx-8 text-sm font-medium text-stone-400">Casamento de Daniela & Lucas</span>
          <span className="mx-8 text-sm font-medium text-stone-400">Casamento de Mariana & Rafael</span>
        </Marquee>
      </div>

      {/* FOOTER */}
      <footer className="py-8 px-4 text-center">
        <p className="text-xs text-stone-400">© {new Date().getFullYear()} Corta-Gravata · Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

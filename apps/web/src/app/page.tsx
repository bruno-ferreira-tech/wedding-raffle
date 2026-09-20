'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  SparklesIcon,
  WalletIcon,
  CalculatorIcon,
  TvIcon,
  SmartphoneIcon,
  HeartIcon,
  QrCodeIcon,
  HelpCircleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  CoinsIcon,
  ChevronRightIcon,
  XIcon,
  FlameIcon,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Marquee } from '@/components/ui/marquee';
import { HeroScene } from '@/components/three/hero-scene';
import { formatBRL } from '@/lib/money';
import { InteractiveRaffleTicket } from '@/components/wedding/interactive-raffle-ticket';
import { LiveTelaoPreview } from '@/components/wedding/live-telao-preview';

/**
 * Presets de Física de Molas (emil-kowalski)
 */
const springButton = { type: 'spring', stiffness: 400, damping: 25 } as const;
const springCard = { type: 'spring', stiffness: 350, damping: 28 } as const;
const springAccordion = { type: 'spring', stiffness: 320, damping: 26 } as const;

/**
 * Perguntas Frequentes (FAQ)
 */
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
  // Calculadora da Lua de Mel
  const [guests, setGuests] = useState(150);
  const [ticketPrice, setTicketPrice] = useState(25);
  const [ticketsPerGuest, setTicketsPerGuest] = useState(2);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Modo Padrinho Demo State
  const [demoCotas, setDemoCotas] = useState(2);
  const [demoConfirmed, setDemoConfirmed] = useState(false);

  const netDisplayRef = useRef<HTMLDivElement>(null);

  const totalTickets = guests * ticketsPerGuest;
  const estimatedGross = totalTickets * ticketPrice * 100; // em centavos
  const feePercent = 0.049;
  const estimatedFee = Math.round(estimatedGross * feePercent);
  const estimatedNet = estimatedGross - estimatedFee;

  // Reação cinética suave ao alterar valores da calculadora
  const [tickerKey, setTickerKey] = useState(0);
  useEffect(() => {
    setTickerKey((k) => k + 1);
  }, [estimatedNet]);

  return (
    <div className="relative min-h-dvh w-full bg-[#faf8f5] dark:bg-[#12100e] text-[#1c1917] dark:text-[#fbf9f6] selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER EDITORIAL (impeccable: hairline borders & specular light)
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-stone-900/[0.06] dark:border-white/[0.08] bg-[#faf8f5]/92 dark:bg-[#12100e]/92 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Corta-Gravata
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-[#9a7837] dark:text-[#f5d77f] border border-amber-500/20">
              Rifa do Casal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-stone-300">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#padrinhos" className="hover:text-foreground transition-colors">Modo Padrinhos</a>
            <a href="#telao" className="hover:text-foreground transition-colors">Telão ao Vivo</a>
            <a href="#calculadora" className="hover:text-foreground transition-colors">Simulador</a>
            <a href="#duvidas" className="hover:text-foreground transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-full font-medium text-sm text-stone-600 dark:text-stone-300 hover:text-foreground hover:bg-stone-900/[0.04]">
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

      {/* ─────────────────────────────────────────────────────────────
          2. HERO MONUMENTAL & EDITORIAL (taste-skill + emil-kowalski)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] dark:border-white/[0.06] overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Coluna Editorial Textual */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              
              {/* Badge Editorial de Alta Costura */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-[#9a7837] dark:text-[#f5d77f] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              >
                <SparklesIcon className="size-3.5 text-amber-500" />
                <span className="leading-none tracking-wide">A tradição da gravata, reinventada para a era do PIX</span>
              </motion.div>

              {/* Manchete Monumental com Tipografia Serifada de Alta Costura */}
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.06]">
                O Corta-Gravata que <span className="text-primary italic font-normal">arrecada mais</span> e alegra a festa.
              </h1>

              {/* Subtítulo Afetuoso & Humano (avoid-ai-design) */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Sem o constrangimento de picotar gravata e sem notas amassadas pelo bolso. Seus convidados contribuem pelo celular no PIX, vibram com o sorteio no telão e você recebe direto na conta para a lua de mel.
              </p>

              {/* Ações Primárias com Micro-Press Tátil (emil-kowalski) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton} className="w-full sm:w-auto">
                  <Button
                    asChild
                    size="lg"
                    className="wedding-button wedding-shimmer h-14 px-8 rounded-full text-base font-semibold w-full shadow-lg cursor-pointer border border-amber-400/40 shadow-[0_4px_16px_rgba(212,175,55,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]"
                  >
                    <Link href="/cadastro" className="inline-flex items-center justify-center">
                      Criar Rifa dos Noivos Grátis
                      <ArrowRightIcon className="size-4 ml-2 translate-x-0.5" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton} className="w-full sm:w-auto">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 rounded-full border-stone-900/[0.08] dark:border-white/[0.12] bg-white/90 dark:bg-stone-900/90 text-foreground text-base hover:bg-stone-100 dark:hover:bg-stone-800 font-medium w-full shadow-[0_1px_3px_rgba(44,38,30,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xs cursor-pointer"
                  >
                    <Link href="/e/bruno-moreira" target="_blank">
                      Ver Exemplo ao Vivo
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Selos de Confiança (impeccable) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-4 text-primary" /> Sem mensalidade
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-4 text-primary" /> Saque PIX direto
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-4 text-primary" /> Pronto em 3 minutos
                </span>
              </div>
            </div>

            {/* Coluna Visual: Pedestal das Alianças 3D em Ouro 18K */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="canvas-container relative w-full flex items-center justify-center">
                <div className="relative p-4 sm:p-6 rounded-3xl bg-radial from-amber-500/10 via-transparent to-transparent border border-amber-500/15 shadow-[0_12px_36px_-6px_rgba(212,175,55,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] bg-white/40 dark:bg-stone-900/40 backdrop-blur-xs">
                  <HeroScene className="w-[300px] h-[240px] sm:w-[380px] sm:h-[280px] mx-auto cursor-grab active:cursor-grabbing" />
                  <div className="text-center pt-2 text-[11px] uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400 font-semibold">
                    ✨ Alianças em Ouro 18K Interativas
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* INDICADOR EXPLÍCITO DE DESCIDA (Elimina qualquer dúvida de conteúdo abaixo) */}
          <div className="pt-14 pb-2 flex flex-col items-center justify-center gap-2 text-center select-none">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
              Role para ver como a festa ganha vida
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="flex flex-col items-center"
            >
              <div className="w-[1.5px] h-6 bg-gradient-to-b from-[#d4af37] to-transparent rounded-full" />
              <ChevronDownIcon className="size-4 text-primary -mt-1" />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. COMO FUNCIONA NA FESTA (3 Passos Claros & Conectados)
          ───────────────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] dark:border-white/[0.06] bg-[#fbf9f6] dark:bg-[#141210]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7837] dark:text-[#f5d77f]">
              Simplicidade Total
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Como funciona no grande dia
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
              Três passos pensados para a dinâmica real de um casamento: sem atrito, sem fila e com máxima diversão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Passo 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={springCard}
              className="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-900/[0.08] dark:border-white/[0.1] shadow-[0_2px_8px_rgba(44,38,30,0.03),0_12px_24px_-4px_rgba(44,38,30,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="size-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-primary font-heading font-bold text-xl shadow-xs">
                  1
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  QR Code nas Mesas
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  Os convidados encontram o display na mesa, apontam a câmera do celular e escolhem com quantas cotas desejam participar.
                </p>
              </div>
              <div className="pt-6 border-t border-stone-100 dark:border-stone-800 text-xs font-semibold text-primary flex items-center gap-1">
                <span>Leitura instantânea sem baixar app</span>
              </div>
            </motion.div>

            {/* Passo 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={springCard}
              className="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-900/[0.08] dark:border-white/[0.1] shadow-[0_2px_8px_rgba(44,38,30,0.03),0_12px_24px_-4px_rgba(44,38,30,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="size-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-primary font-heading font-bold text-xl shadow-xs">
                  2
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Padrinhos com Celular
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  Os padrinhos circulam com uma ferramenta ágil de bolso. Recebem no Pix ou em dinheiro e emitem o bilhete na hora em 2 toques.
                </p>
              </div>
              <div className="pt-6 border-t border-stone-100 dark:border-stone-800 text-xs font-semibold text-primary flex items-center gap-1">
                <span>Agilidade total na pista e no salão</span>
              </div>
            </motion.div>

            {/* Passo 3 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={springCard}
              className="p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-900/[0.08] dark:border-white/[0.1] shadow-[0_2px_8px_rgba(44,38,30,0.03),0_12px_24px_-4px_rgba(44,38,30,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="size-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-primary font-heading font-bold text-xl shadow-xs">
                  3
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  Clímax no Telão
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  O telão da festa atualiza o total arrecadado ao vivo. Na hora do brinde, a roleta animada sorteia o vencedor diante de todos.
                </p>
              </div>
              <div className="pt-6 border-t border-stone-100 dark:border-stone-800 text-xs font-semibold text-primary flex items-center gap-1">
                <span>Transparência e emoção compartilhada</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. O BILHETE DA SORTE (Papelaria Fina Interativa)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] dark:border-white/[0.06] bg-[#f7f4ed] dark:bg-[#161311]">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7837] dark:text-[#f5d77f]">
            Papelaria Digital &amp; Tradição
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            O Comprovante que o <span className="text-primary italic font-normal">Convidado Guarda</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            Nada de pedacinhos de gravata perdidos pelo chão: o convidado contribui e tem em mãos um comprovante elegante, com número de sorteio autenticado e baixa instantânea.
          </p>

          <div className="w-full max-w-md mx-auto pt-4 text-left">
            <InteractiveRaffleTicket
              ticketCount={ticketsPerGuest}
              ticketPrice={ticketPrice}
              coupleNames="Ana & Rodrigo"
            />
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 pt-2">
            ✨ Toque no bilhete acima para simular a validação física e a comemoração
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. MODO PADRINHOS & O TELÃO AO VIVO (Dupla Dinâmica)
          ───────────────────────────────────────────────────────────── */}
      <section id="padrinhos" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] dark:border-white/[0.06]">
        <div className="mx-auto max-w-6xl space-y-16">
          
          {/* Bloco 1: Modo Padrinhos */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
                <SmartphoneIcon className="size-3.5" />
                <span>O Segredo da Arrecadação</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Modo Padrinhos: A Ferramenta de Bolso
              </h2>
              <p className="text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                Padrinho com copo na mão não pode ficar digitando formulário longo. O Modo Padrinhos é uma tela de bolso ultrarrápida para circular pelas mesas e registrar pagamentos em dinheiro ou PIX em 2 toques.
              </p>
              <div className="space-y-2.5 pt-1 text-sm text-stone-600 dark:text-stone-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-primary" />
                  <span>Baixa no PIX ou dinheiro vivo instantânea</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-primary" />
                  <span>Atualiza o telão e o ranking no mesmo segundo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-primary" />
                  <span>Funciona em qualquer celular sem precisar instalar app</span>
                </div>
              </div>
            </div>

            {/* Mockup Interativo do Celular do Padrinho */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-[#faf8f5] dark:bg-stone-900 border border-stone-900/[0.08] dark:border-white/[0.1] shadow-[0_4px_16px_rgba(44,38,30,0.06),0_16px_36px_-6px_rgba(44,38,30,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] space-y-4 select-none">
                <div className="flex items-center justify-between border-b border-dashed border-stone-200 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-foreground">Mesa 08 • Família Silva</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-stone-500 bg-stone-200/60 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                    Padrinho Lucas
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                    Selecione as cotas:
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
                            : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-foreground hover:bg-stone-100'
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
                    className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs text-center font-medium"
                  >
                    🎉 Bilhete № 0489 gerado e telão sincronizado!
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Bloco 2: O Telão da Festa */}
          <div id="telao" className="rounded-3xl p-8 sm:p-12 bg-[#161311] text-[#fbf9f6] border border-amber-500/20 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(212,175,55,0.15)] space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold text-[#f5d77f]">
                <TvIcon className="size-3.5 text-[#d4af37]" />
                <span>O Clímax da Pista</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
                O Telão ao Vivo no Salão Nobre
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Conecte em 1 clique ao projetor ou TV da festa. O salão inteiro vibra com cada doação e se reúne para o sorteio na hora do brinde.
              </p>
            </div>

            <div className="live-telao max-w-2xl mx-auto pt-2">
              <LiveTelaoPreview />
            </div>

            <p className="text-center text-xs text-stone-400">
              🥂 Atualização instantânea via Server-Sent Events e roleta ao vivo na hora do brinde
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CALCULADORA DA LUA DE MEL (impeccable: recibo com números tabulares)
          ───────────────────────────────────────────────────────────── */}
      <section id="calculadora" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] dark:border-white/[0.06] bg-[#faf8f5] dark:bg-[#12100e]">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7837] dark:text-[#f5d77f]">
            A Matemática da Festa
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Simulador de Arrecadação em <span className="text-primary italic font-normal">Tempo Real</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
            Ajuste os parâmetros da festa e veja a arrecadação líquida estimada direto para a sua lua de mel.
          </p>

          {/* Card do Recibo Físico */}
          <div className="w-full max-w-lg mx-auto pt-4 text-left">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              transition={springCard}
              className="receipt-card border-dashed border-2 border-stone-300 dark:border-stone-700 p-6 sm:p-8 rounded-2xl bg-white dark:bg-stone-900 shadow-[0_2px_8px_rgba(44,38,30,0.04),0_12px_28px_-4px_rgba(44,38,30,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 border-dashed">
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
                      className="w-full accent-primary h-2 bg-stone-200 dark:bg-stone-800 rounded-full appearance-none cursor-pointer"
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
                      className="w-full accent-primary h-2 bg-stone-200 dark:bg-stone-800 rounded-full appearance-none cursor-pointer"
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
                      className="w-full accent-primary h-2 bg-stone-200 dark:bg-stone-800 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Totais do Recibo */}
              <div className="border-t border-stone-200 dark:border-stone-800 border-dashed pt-5 space-y-2 mt-6">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Arrecadação bruta ({totalTickets} cotas)</span>
                  <span className="wedding-numeral font-medium text-foreground tabular-nums">{formatBRL(estimatedGross)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Taxa de serviço e PIX (4.9%)</span>
                  <span className="wedding-numeral font-medium text-stone-500 tabular-nums">- {formatBRL(estimatedFee)}</span>
                </div>
                <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-baseline justify-between">
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
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

      {/* ─────────────────────────────────────────────────────────────
          7. ANTES VS AGORA (Comparativo sem Clichês)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] dark:border-white/[0.06] bg-[#fbf9f6] dark:bg-[#141210]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7837] dark:text-[#f5d77f]">
              Comparativo Honesto
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Por que abandonar a gravata tradicional?
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
              Veja a diferença prática entre o método antigo e a celebração moderna com o Corta-Gravata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* O Passado */}
            <div className="p-8 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                <XIcon className="size-4 text-rose-500" />
                <span>O Método Antigo</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground">
                A Gravata Tradicional
              </h3>
              <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Constrangimento de passar a tesoura em uma gravata cara.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Convidados sem dinheiro em espécie na carteira.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Pedaços de tecido espalhados que vão direto para o lixo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Padrinhos envergonhados tendo que cobrar mesa por mesa.</span>
                </li>
              </ul>
            </div>

            {/* O Presente */}
            <div className="p-8 rounded-2xl bg-white dark:bg-stone-900 border-2 border-primary/40 shadow-lg space-y-5 relative">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <CheckCircle2Icon className="size-4 text-primary" />
                <span>A Nova Tradição</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground">
                Com o Corta-Gravata
              </h3>
              <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2Icon className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>Todos participam pelo celular via PIX em 10 segundos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2Icon className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>Bilhete digital elegante que o convidado guarda de recordação.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2Icon className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>Telão ao vivo animando a pista com ranking e roleta de prêmios.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2Icon className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>Todo o valor cai direto na conta dos noivos sem intermediários.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. PERGUNTAS FREQUENTES (FAQ)
          ───────────────────────────────────────────────────────────── */}
      <section id="duvidas" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] dark:border-white/[0.06]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7837] dark:text-[#f5d77f]">
              Tire Suas Dúvidas
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Perguntas Frequentes
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
              Tudo o que você precisa saber para levar o Corta-Gravata para o seu casamento.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-stone-900/[0.08] dark:border-white/[0.1] bg-white dark:bg-stone-900 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left font-heading font-semibold text-base sm:text-lg text-foreground flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-800/50 transition-colors"
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
                        <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
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

      {/* ─────────────────────────────────────────────────────────────
          9. GRAND FINALE (A Celebração - taste-skill)
          ───────────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-stone-900/[0.06] dark:border-white/[0.06] bg-[#f7f4ed] dark:bg-[#161311] text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-[#9a7837] dark:text-[#f5d77f]">
            <SparklesIcon className="size-3.5 text-amber-500" />
            <span>Comece Hoje Mesmo</span>
          </span>

          <h2 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Prontos para brindar com <span className="text-primary italic font-normal">leveza e requinte?</span>
          </h2>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
            Junte-se a centenas de casais que transformaram a arrecadação da festa em um momento inesquecível de diversão e carinho.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton} className="w-full sm:w-auto">
              <Button asChild size="lg" className="wedding-button wedding-shimmer h-14 px-10 rounded-full text-base font-semibold w-full shadow-lg border border-amber-400/40 shadow-[0_4px_16px_rgba(212,175,55,0.3)] cursor-pointer">
                <Link href="/cadastro" className="inline-flex items-center justify-center">
                  Criar Nossa Rifa Grátis
                  <ArrowRightIcon className="size-4 ml-2 translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={springButton} className="w-full sm:w-auto">
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full border-stone-900/[0.08] dark:border-white/[0.12] bg-white dark:bg-stone-900 text-foreground text-base hover:bg-stone-100 dark:hover:bg-stone-800 font-medium w-full shadow-[0_1px_3px_rgba(44,38,30,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] cursor-pointer">
                <Link href="/e/bruno-moreira" target="_blank">
                  Ver Exemplo ao Vivo
                </Link>
              </Button>
            </motion.div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-stone-500 font-medium">
            <span>✨ Sem mensalidade</span>
            <span>•</span>
            <span>⚡ Saque PIX imediato</span>
            <span>•</span>
            <span>📱 Funciona direto no navegador</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FITA MARQUEE ACETINADA & RODAPÉ
          ───────────────────────────────────────────────────────────── */}
      <div className="border-y border-stone-900/[0.08] dark:border-white/[0.08] bg-white/85 dark:bg-stone-900/85 py-4.5 backdrop-blur-sm overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <Marquee speedSecs={35} pauseOnHover>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400 px-8">
            🥂 Celebre com elegância
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary px-8">
            ⚡ Baixa Instantânea via PIX
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400 px-8">
            📺 Diversão garantida no telão da pista
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary px-8">
            🤵 Ferramenta ágil para os padrinhos
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400 px-8">
            ✈️ Dinheiro direto para a Lua de Mel
          </span>
        </Marquee>
      </div>

      {/* Rodapé Editorial */}
      <footer className="border-t border-stone-900/[0.06] dark:border-white/[0.06] py-12 px-4 sm:px-8 text-center bg-[#faf8f5] dark:bg-[#12100e]">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="font-heading text-xl font-bold tracking-tight text-foreground">
            Corta-Gravata
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            A tradição do casamento reinventada com requinte, leveza e tecnologia.
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-medium pt-2">
            © {new Date().getFullYear()} Corta-Gravata • Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

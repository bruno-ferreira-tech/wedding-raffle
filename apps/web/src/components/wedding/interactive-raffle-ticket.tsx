'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { SparklesIcon, HeartIcon, QrCodeIcon } from 'lucide-react';
import { formatBRL } from '@/lib/money';

interface InteractiveRaffleTicketProps {
  ticketCount: number;
  ticketPrice: number;
  coupleNames?: string;
  onSimulateDraw?: () => void;
}

export function InteractiveRaffleTicket({
  ticketCount,
  ticketPrice,
  coupleNames = 'Ana & Rodrigo',
  onSimulateDraw,
}: InteractiveRaffleTicketProps) {
  const [serial] = useState('№ 0482');
  const [isSparkling, setIsSparkling] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const totalValue = ticketCount * ticketPrice * 100;

  const handleSparkle = () => {
    setIsSparkling(true);
    if (onSimulateDraw) onSimulateDraw();

    if (ticketRef.current) {
      import('animejs').then((animeModule) => {
        const anime = (animeModule as { default?: unknown; animate?: unknown }).default ?? animeModule;
        (anime as (opts: Record<string, unknown>) => void)({
          targets: ticketRef.current,
          scale: [1, 1.03, 0.98, 1],
          rotateZ: [-0.5, 0.5, -0.2, 0],
          duration: 550,
          easing: 'easeOutElastic(1, .5)',
        });
      });
    }

    setTimeout(() => setIsSparkling(false), 800);
  };

  return (
    <motion.div
      ref={ticketRef}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={handleSparkle}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#dcd3c4] bg-[#fdfbf7] p-5 sm:p-6 shadow-[0_4px_16px_-2px_rgba(44,38,30,0.08),0_1px_3px_rgba(44,38,30,0.04)] select-none transition-colors hover:border-[#b89047]/60"
    >
      {/* Decorative notch cutouts on both ends to simulate physical ticket stub */}
      <div className="absolute -left-3 top-1/2 -mt-3.5 size-7 rounded-full bg-background border border-[#dcd3c4] shadow-inner" />
      <div className="absolute -right-3 top-1/2 -mt-3.5 size-7 rounded-full bg-background border border-[#dcd3c4] shadow-inner" />

      {/* Ticket Header */}
      <div className="flex items-center justify-between border-b border-dashed border-[#e3dacd] pb-3.5">
        <div className="flex items-center gap-2">
          <HeartIcon className="size-4 text-[#b89047] fill-[#b89047]/20" />
          <span className="font-heading text-sm font-semibold tracking-wide text-foreground">
            {coupleNames} • 2026
          </span>
        </div>
        <span className="wedding-numeral text-xs font-semibold tracking-wider text-[#9a7837] bg-[#b89047]/10 px-2.5 py-0.5 rounded-full border border-[#b89047]/20">
          {serial}
        </span>
      </div>

      {/* Ticket Body */}
      <div className="py-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Participação na Festa
            </div>
            <div className="text-xl font-heading font-bold text-foreground">
              {ticketCount} {ticketCount === 1 ? 'cota' : 'cotas'} da sorte
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Valor do Apoio
            </div>
            <div className="wedding-numeral text-xl font-bold text-[#b89047]">
              {formatBRL(totalValue)}
            </div>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Válido para o Sorteio no Telão
          </span>
          <span className="wedding-numeral font-medium text-foreground">
            {ticketCount * 2}% de probabilidade
          </span>
        </div>
      </div>

      {/* Ticket Footer / Tear Strip */}
      <div className="border-t border-dashed border-[#e3dacd] pt-3.5 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 text-[11px]">
          <QrCodeIcon className="size-3.5 text-foreground/70" />
          <span>Autenticado via PIX</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[#b89047] font-semibold text-xs group-hover:underline">
          <SparklesIcon className={`size-3.5 ${isSparkling ? 'animate-spin text-amber-500' : ''}`} />
          {isSparkling ? 'Boa sorte!' : 'Toque para testar'}
        </span>
      </div>
    </motion.div>
  );
}

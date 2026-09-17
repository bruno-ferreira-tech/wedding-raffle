'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SparklesIcon, HeartIcon, QrCodeIcon, CheckCircle2Icon, RotateCcwIcon } from 'lucide-react';
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
  const [isStamped, setIsStamped] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const ticketRef = useRef<HTMLDivElement>(null);
  const totalValue = ticketCount * ticketPrice * 100;

  const handleTriggerValidation = () => {
    setIsStamped(true);
    if (onSimulateDraw) onSimulateDraw();

    // Haptic feedback for tactile phones
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([35, 20, 35]);
      } catch {
        // Ignored if unsupported
      }
    }

    // Spawn celebratory floating gold flakes
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 120,
    }));
    setParticles(newParticles);

    // Anime.js v4 kinetic impact bounce
    const target = ticketRef.current;
    if (target) {
      import('animejs').then((animeModule) => {
        if (typeof animeModule.animate === 'function') {
          animeModule.animate(target, {
            scale: [1, 1.04, 0.98, 1],
            rotateZ: [-1, 1, -0.5, 0],
            duration: 520,
            ease: 'easeOutElastic(1, .6)',
          });
        }
      });
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStamped(false);
    setParticles([]);
  };

  return (
    <div className="space-y-3">
      <motion.div
        ref={ticketRef}
        role="button"
        tabIndex={0}
        aria-label="Bilhete de rifa interativo"
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        onClick={handleTriggerValidation}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTriggerValidation();
          }
        }}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 p-5 sm:p-6 select-none ${
          isStamped
            ? 'border-[#b89047] bg-[#fcf9f2] shadow-[0_8px_24px_-4px_rgba(184,144,71,0.22)]'
            : 'border-[#dcd3c4] bg-[#fdfbf7] shadow-[0_4px_16px_-2px_rgba(44,38,30,0.08),0_1px_3px_rgba(44,38,30,0.04)] hover:border-[#b89047]/60'
        }`}
      >
        {/* Decorative notch cutouts on both ends to simulate physical paper stub */}
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
        <div className="py-4 space-y-3 relative z-10">
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
              <span className={`size-2 rounded-full ${isStamped ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-emerald-500 animate-pulse'}`} />
              {isStamped ? 'Confirmado no Telão!' : 'Válido para o Sorteio no Telão'}
            </span>
            <span className="wedding-numeral font-medium text-foreground">
              {ticketCount * 2}% de probabilidade
            </span>
          </div>
        </div>

        {/* Ticket Footer / Tear Strip */}
        <div className="border-t border-dashed border-[#e3dacd] pt-3.5 flex items-center justify-between text-xs text-muted-foreground relative z-10">
          <div className="flex items-center gap-1.5 text-[11px]">
            <QrCodeIcon className="size-3.5 text-foreground/70" />
            <span>Autenticado via PIX</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[#b89047] font-semibold text-xs group-hover:underline">
            <SparklesIcon className={`size-3.5 ${isStamped ? 'text-emerald-600' : 'text-amber-500'}`} />
            {isStamped ? 'Validado com sucesso!' : 'Toque para testar'}
          </span>
        </div>

        {/* Authentic Red/Gold Ink Stamp Overlay when clicked */}
        <AnimatePresence>
          {isStamped && (
            <motion.div
              initial={{ scale: 2.4, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 0.95, rotate: -8 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="border-4 border-emerald-700/85 text-emerald-800 bg-emerald-50/85 px-4 py-1.5 rounded-xl uppercase tracking-widest font-heading font-black text-sm sm:text-base shadow-lg rotate-[-8deg] flex items-center gap-2 backdrop-blur-xs">
                <CheckCircle2Icon className="size-5 text-emerald-700" />
                <span>CONFIRMADO • PAGO</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating golden confetti flakes */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.2, x: p.x, y: p.y - 40 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 size-2 rounded-full bg-[#d4af37] pointer-events-none z-30 shadow-xs"
          />
        ))}
      </motion.div>

      {/* Action feedback bar */}
      <div className="flex items-center justify-between text-xs px-1">
        {isStamped ? (
          <span className="text-emerald-700 font-medium flex items-center gap-1.5">
            <CheckCircle2Icon className="size-3.5 text-emerald-600" />
            Simulação ativa: Bilhete validado e cotas somadas!
          </span>
        ) : (
          <span className="text-muted-foreground">
            👆 Toque no bilhete acima para testar a validação
          </span>
        )}

        {isStamped && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs underline cursor-pointer"
          >
            <RotateCcwIcon className="size-3" />
            Testar novamente
          </button>
        )}
      </div>
    </div>
  );
}

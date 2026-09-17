'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TvIcon, SparklesIcon, UsersIcon, FlameIcon } from 'lucide-react';
import { formatBRL } from '@/lib/money';

export function LiveTelaoPreview() {
  const [totalPot, setTotalPot] = useState(385000); // R$ 3.850,00
  const [recentPurchases, setRecentPurchases] = useState([
    { id: 1, name: 'Tio Carlos', tickets: 4, value: 10000, time: 'Agora mesmo' },
    { id: 2, name: 'Padrinho Lucas', tickets: 2, value: 5000, time: 'Há 1 min' },
    { id: 3, name: 'Mariana & Gabriel', tickets: 3, value: 7500, time: 'Há 3 min' },
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const potRef = useRef<HTMLDivElement>(null);

  const handleSimulatePurchase = () => {
    setIsAnimating(true);
    const mockNames = ['Madrinha Júlia', 'Primo Felipe', 'Dr. Roberto', 'Tia Beatriz', 'Irmão Matheus'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomTickets = Math.floor(Math.random() * 3) + 2; // 2 to 4
    const purchaseValue = randomTickets * 2500;

    setTotalPot((prev) => prev + purchaseValue);
    setRecentPurchases((prev) => [
      {
        id: Date.now(),
        name: randomName,
        tickets: randomTickets,
        value: purchaseValue,
        time: 'Agora mesmo',
      },
      ...prev.slice(0, 2),
    ]);

    if (potRef.current) {
      import('gsap').then(({ default: gsap }) => {
        gsap.fromTo(
          potRef.current,
          { scale: 1.12, color: '#f5d77f' },
          { scale: 1, color: '#d4af37', duration: 0.45, ease: 'back.out(2)' }
        );
      });
    }

    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#171513] text-[#fbf9f6] p-5 sm:p-7 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.35)] border border-[#332c25]">
      {/* Telão Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-[#b89047]/20 border border-[#b89047]/40 flex items-center justify-center text-[#d4af37]">
            <TvIcon className="size-4" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-[#b89047]">
              Telão da Festa • Ao Vivo
            </div>
            <div className="text-sm font-heading font-medium text-white/90">
              Projeção do Salão Nobre
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 text-[11px] font-medium text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
          Tempo Real
        </span>
      </div>

      {/* Main Monumental Counter Stage */}
      <div className="py-6 text-center space-y-1 relative">
        <div className="text-xs uppercase tracking-widest text-stone-400 font-medium flex items-center justify-center gap-1.5">
          <FlameIcon className="size-3.5 text-amber-500" />
          Total Arrecadado na Pista
        </div>
        <div
          ref={potRef}
          className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-[#d4af37] wedding-numeral origin-center transition-transform"
        >
          {formatBRL(totalPot)}
        </div>
        <p className="text-xs text-stone-400">
          Atualizado instantaneamente a cada pagamento PIX
        </p>
      </div>

      {/* Real-time Purchase Stream */}
      <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-stone-400 font-medium">
          <span className="flex items-center gap-1">
            <UsersIcon className="size-3 text-[#b89047]" /> Últimos Participantes
          </span>
          <span>Feed da Pista</span>
        </div>

        <div className="space-y-1.5 min-h-[96px]">
          <AnimatePresence mode="popLayout">
            {recentPurchases.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-xs border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#b89047]" />
                  <span className="font-medium text-white/90">{item.name}</span>
                  <span className="text-[10px] text-stone-400">({item.tickets} cotas)</span>
                </div>
                <div className="wedding-numeral font-semibold text-[#f5d77f]">
                  +{formatBRL(item.value)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Simulation Action */}
      <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
        <span className="text-[11px] text-stone-400">
          Experimente como o telão reage:
        </span>
        <button
          type="button"
          onClick={handleSimulatePurchase}
          disabled={isAnimating}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#b89047] hover:bg-[#c9a24d] active:scale-95 text-stone-950 px-3.5 py-1.5 text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <SparklesIcon className="size-3.5" />
          Simular PIX no Telão
        </button>
      </div>
    </div>
  );
}

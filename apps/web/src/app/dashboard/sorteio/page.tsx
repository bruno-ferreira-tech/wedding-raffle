'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  LockIcon,
  PartyPopperIcon,
  SparklesIcon,
  TrophyIcon,
  UnlockIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { launchCelebrationConfetti } from '@/lib/confetti';
import { motion, AnimatePresence } from 'motion/react';
import { scalePop, staggerContainer, cardReveal } from '@/lib/animations';
import {
  ApiError,
  drawDashboardEvent,
  fetchDashboardEvents,
  fetchDashboardEvent,
  fetchState,
  setDashboardSalesStatus,
  type DrawResult,
  type EventDetail,
  type SalesStatus,
  type StateSnapshot,
} from '@/lib/api';
import { formatRaffleNumber } from '@/lib/money';

export default function DashboardSorteioPage() {
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [state, setState] = useState<StateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [salesPending, startSalesTransition] = useTransition();
  const [drawPending, startDrawTransition] = useTransition();

  const [prizeLabel, setPrizeLabel] = useState('');
  const [lastWinner, setLastWinner] = useState<DrawResult | null>(null);

  const loadData = useCallback(async () => {
    try {
      const list = await fetchDashboardEvents();
      if (list.length === 0) {
        router.push('/dashboard');
        return;
      }
      const detailed = await fetchDashboardEvent(list[0].id);
      setEvent(detailed);

      const snapshot = await fetchState({ slug: detailed.slug });
      setState(snapshot);

      // Set default prize label based on drawn results vs configured prizes
      const drawnCount = snapshot.drawResults.length;
      if (detailed.prizes && detailed.prizes.length > drawnCount) {
        setPrizeLabel(detailed.prizes[drawnCount].label);
      } else {
        setPrizeLabel(`Prêmio #${drawnCount + 1}`);
      }
    } catch {
      setError('Falha ao carregar painel do sorteio.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function onToggleSales(nextStatus: SalesStatus) {
    if (!event) return;
    setError(null);

    startSalesTransition(async () => {
      try {
        await setDashboardSalesStatus(event.id, nextStatus);
        toast.success(
          nextStatus === 'closed'
            ? 'Vendas travadas! O sorteio já pode ser iniciado.'
            : 'Vendas reabertas com sucesso.',
        );
        await loadData();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Falha ao alterar status de vendas.';
        setError(msg);
      }
    });
  }

  function onDrawNext() {
    if (!event) return;
    setError(null);

    startDrawTransition(async () => {
      try {
        const winner = await drawDashboardEvent(event.id, prizeLabel.trim() || undefined);
        setLastWinner(winner);
        launchCelebrationConfetti({ count: 110 });
        toast.success(`🎉 Vencedor sorteado: Número ${formatRaffleNumber(winner.numberId)} (${winner.buyerName})!`);
        await loadData();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Não foi possível sortear.';
        setError(msg);
      }
    });
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isSalesClosed = state?.salesStatus === 'closed';
  const eligibleCount = state?.counts.pago ?? 0;
  const drawResults = state?.drawResults ?? [];

  return (
    <div className="min-h-dvh w-full bg-[#faf8f5] text-stone-900">
      <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#faf8f5]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="size-8 rounded-full hover:bg-stone-200/60 text-stone-700">
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-4" />
              </Link>
            </Button>
            <h1 className="font-heading text-lg font-bold text-stone-900">Sorteio da Festa</h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isSalesClosed
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800'
              }`}
            >
              <span className={`size-2 rounded-full ${isSalesClosed ? 'bg-red-600' : 'bg-emerald-600 animate-pulse'}`} />
              {isSalesClosed ? 'Vendas pausadas' : 'Vendas abertas'}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {error ? (
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Step 1: Trava de Vendas */}
          <motion.div variants={cardReveal}>
            <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 sm:p-7">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="font-heading text-xl font-bold text-stone-900">1. Congelar Vendas</CardTitle>
                <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                  Para sortear com integridade, encerre as vendas para que os números participantes sejam congelados.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    Status atual:{' '}
                    <span className={isSalesClosed ? 'text-red-700 font-bold' : 'text-emerald-800 font-bold'}>
                      {isSalesClosed ? 'Pausadas para o sorteio' : 'Recebendo pagamentos'}
                    </span>
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5 font-medium">
                    <span className="wedding-numeral font-bold text-stone-900">{eligibleCount}</span> bilhete(s) concorrendo neste momento.
                  </p>
                </div>

                {isSalesClosed ? (
                  <Button
                    variant="outline"
                    onClick={() => onToggleSales('open')}
                    disabled={salesPending}
                    className="rounded-full border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs uppercase h-10 px-5 font-semibold"
                  >
                    <UnlockIcon className="size-3.5 mr-1.5" />
                    Reabrir Vendas
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => onToggleSales('closed')}
                    disabled={salesPending}
                    className="rounded-full text-xs uppercase tracking-wider h-10 px-5 shadow-sm font-semibold"
                  >
                    <LockIcon className="size-3.5 mr-1.5" />
                    Travar Vendas para Sortear
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: Sorteio do Próximo Prêmio */}
          <motion.div variants={cardReveal}>
            <Card className="rounded-[24px] border border-stone-300 bg-white shadow-[0_2px_8px_rgba(44,38,30,0.04),0_18px_36px_-6px_rgba(44,38,30,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] p-6 sm:p-7">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-stone-900 text-stone-50">
                    <PartyPopperIcon className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl font-bold text-stone-900">2. Sortear Prêmio</CardTitle>
                    <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                      O vencedor é sorteado aleatoriamente entre os números confirmados e transmitido na mesma hora no Telão.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-xs uppercase tracking-wider text-stone-700 block mb-1.5 font-semibold">
                      Nome do Prêmio Sorteado
                    </label>
                    <Input
                      value={prizeLabel}
                      onChange={(e) => setPrizeLabel(e.target.value)}
                      placeholder="Ex: Whisky 12 Anos"
                      disabled={drawPending}
                      className="h-12 rounded-xl bg-stone-50/50 border-stone-300 focus:ring-2 focus:ring-stone-900 text-stone-900 shadow-2xs font-medium"
                    />

                    {/* Prêmios Configurados na Rifa */}
                    {event?.prizes && event.prizes.length > 0 ? (
                      <div className="space-y-1.5 pt-2.5">
                        <span className="text-[11px] uppercase tracking-wider text-stone-600 font-semibold block">
                          Prêmios cadastrados (clique para selecionar):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {event.prizes.map((p, idx) => {
                            const isAlreadyDrawn = drawResults.some((d) => d.prizeIndex === p.prizeIndex);
                            const isCurrent = prizeLabel === p.label;
                            return (
                              <button
                                key={p.prizeIndex ?? idx}
                                type="button"
                                onClick={() => setPrizeLabel(p.label)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  isAlreadyDrawn
                                    ? 'bg-stone-100 text-stone-400 border border-stone-200 line-through opacity-70'
                                    : isCurrent
                                      ? 'bg-stone-900 text-stone-50 border border-stone-900 shadow-sm ring-2 ring-stone-900/20'
                                      : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200'
                                }`}
                              >
                                <span>#{idx + 1}</span>
                                <span>{p.label}</span>
                                {isAlreadyDrawn ? (
                                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold ml-0.5">
                                    ✓ Sorteado
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="sm:self-end">
                    <Button
                      size="lg"
                      onClick={onDrawNext}
                      disabled={!isSalesClosed || eligibleCount === 0 || drawPending}
                      className="h-12 w-full sm:w-auto font-semibold px-8 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_12px_28px_-6px_rgba(44,38,30,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer disabled:opacity-50"
                    >
                      {drawPending ? <Spinner data-icon="inline-start" /> : <SparklesIcon className="size-4 mr-2" />}
                      {drawPending ? 'Sorteando…' : 'Sortear Agora!'}
                    </Button>
                  </div>
                </div>

                {!isSalesClosed ? (
                  <p className="text-xs text-[#855b1b] bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
                    ⚠️ Você precisa travar as vendas no passo 1 antes de realizar o sorteio.
                  </p>
                ) : eligibleCount === 0 ? (
                  <p className="text-xs text-[#855b1b] bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
                    ⚠️ Nenhum número pago foi registrado ainda.
                  </p>
                ) : null}

                <AnimatePresence>
                  {lastWinner ? (
                    <motion.div
                      key={lastWinner.numberId}
                      variants={scalePop}
                      initial="hidden"
                      animate="visible"
                      className="mt-4 rounded-2xl border border-stone-300 bg-stone-50/90 p-6 text-center shadow-sm space-y-2"
                    >
                      <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-0.5 text-xs font-bold text-[#855b1b]">
                        ✦ Último Sorteado
                      </span>
                      <h3 className="wedding-numeral text-4xl sm:text-5xl font-bold text-stone-900 tabular-nums">
                        Número {formatRaffleNumber(lastWinner.numberId)}
                      </h3>
                      <p className="text-xl font-bold text-stone-800">
                        {lastWinner.buyerName}
                      </p>
                      <p className="text-xs text-stone-600 uppercase tracking-wider font-semibold">
                        Prêmio: {lastWinner.prizeLabel}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 3: Histórico de Vencedores */}
          <motion.div variants={cardReveal}>
            <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] overflow-hidden">
              <CardHeader className="p-6 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-stone-900 text-stone-50">
                    <TrophyIcon className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl font-bold text-stone-900">Vencedores Sorteados</CardTitle>
                    <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
                      Todos os bilhetes premiados da rifa.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {drawResults.length === 0 ? (
                  <div className="p-10 text-center text-sm text-stone-500 font-medium">
                    Nenhum sorteio realizado ainda.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50/80 text-xs uppercase tracking-wider text-stone-600 font-bold">
                          <th className="p-4 pl-6">#</th>
                          <th className="p-4">Prêmio</th>
                          <th className="p-4">Número</th>
                          <th className="p-4">Ganhador</th>
                          <th className="p-4 pr-6">Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-xs">
                        {drawResults.map((result, idx) => (
                          <tr key={`${result.numberId}-${result.prizeIndex}`} className="hover:bg-stone-50/60 transition-colors">
                            <td className="p-4 pl-6 text-stone-500 font-semibold">#{idx + 1}</td>
                            <td className="p-4 font-semibold text-stone-900 text-sm">
                              {result.prizeLabel}
                            </td>
                            <td className="p-4 font-bold text-stone-900 text-sm wedding-numeral tabular-nums">
                              {formatRaffleNumber(result.numberId)}
                            </td>
                            <td className="p-4 text-sm font-medium text-stone-800">{result.buyerName}</td>
                            <td className="p-4 pr-6 text-stone-500 font-mono">
                              {new Date(result.drawnAt).toLocaleTimeString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

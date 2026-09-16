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
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-background text-foreground transition-colors duration-500">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="apple-pressable size-8 rounded-full border border-white/10 hover:bg-white/10">
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-4" />
              </Link>
            </Button>
            <h1 className="font-heading text-lg font-bold">Painel do Sorteio</h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md ${
                isSalesClosed
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <span className={`size-2 rounded-full ${isSalesClosed ? 'bg-destructive' : 'bg-emerald-400 animate-pulse'}`} />
              {isSalesClosed ? 'Vendas Travadas' : 'Vendas Abertas'}
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

        {/* Step 1: Trava de Vendas */}
        <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-6 sm:p-7 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_both]">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-heading text-xl font-bold">1. Controle de Vendas</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Para sortear com integridade, encerre as vendas antes do sorteio para que a cartela seja congelada.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div>
              <p className="text-sm font-semibold">
                Status atual:{' '}
                <span className={isSalesClosed ? 'text-destructive font-mono' : 'text-emerald-400 font-mono'}>
                  {isSalesClosed ? 'VENDAS TRAVADAS' : 'VENDAS ABERTAS'}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                <span className="apple-numeral font-bold text-foreground">{eligibleCount}</span> número(s) pago(s) concorrendo neste momento.
              </p>
            </div>

            {isSalesClosed ? (
              <Button
                variant="outline"
                onClick={() => onToggleSales('open')}
                disabled={salesPending}
                className="apple-pressable rounded-full border-white/15 bg-white/5 hover:bg-white/10 font-mono text-xs uppercase h-10 px-5"
              >
                <UnlockIcon className="size-3.5 mr-1.5" />
                Reabrir Vendas
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => onToggleSales('closed')}
                disabled={salesPending}
                className="apple-pressable rounded-full font-mono text-xs uppercase tracking-wider h-10 px-5 shadow-lg shadow-destructive/20"
              >
                <LockIcon className="size-3.5 mr-1.5" />
                Travar Vendas para Sortear
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Sorteio do Próximo Prêmio */}
        <Card className="apple-glass rounded-3xl border-primary/30 shadow-2xl p-6 sm:p-7 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_0.1s_both] relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <PartyPopperIcon className="size-4" />
              </div>
              <div>
                <CardTitle className="font-heading text-xl font-bold">2. Sortear Prêmio</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  O vencedor é sorteado criptograficamente entre os números pagos e projetado instantaneamente no Telão.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                  Nome do Prêmio Sorteado
                </label>
                <Input
                  value={prizeLabel}
                  onChange={(e) => setPrizeLabel(e.target.value)}
                  placeholder="Ex: Whisky 12 Anos"
                  disabled={drawPending}
                  className="h-12 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:self-end">
                <Button
                  size="lg"
                  onClick={onDrawNext}
                  disabled={!isSalesClosed || eligibleCount === 0 || drawPending}
                  className="apple-pressable h-12 w-full sm:w-auto font-heading uppercase tracking-wider px-8 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 disabled:opacity-50"
                >
                  {drawPending ? <Spinner data-icon="inline-start" /> : <SparklesIcon className="size-4 mr-2" />}
                  {drawPending ? 'Sorteando…' : 'Sortear Agora!'}
                </Button>
              </div>
            </div>

            {!isSalesClosed ? (
              <p className="text-xs text-amber-400/90 font-mono">
                ⚠️ Você precisa travar as vendas no passo 1 antes de realizar o sorteio.
              </p>
            ) : eligibleCount === 0 ? (
              <p className="text-xs text-amber-400/90 font-mono">
                ⚠️ Nenhum número pago foi registrado ainda.
              </p>
            ) : null}

            {lastWinner ? (
              <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/10 p-5 text-center backdrop-blur-md animate-[chip-in_0.45s_cubic-bezier(0.16,1,0.3,1)_both]">
                <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/15 px-3 py-0.5 font-mono text-xs font-semibold text-primary mb-2">
                  🎉 Último Sorteado
                </span>
                <h3 className="font-heading text-4xl font-bold text-primary apple-numeral">
                  Número {formatRaffleNumber(lastWinner.numberId)}
                </h3>
                <p className="text-xl font-bold text-foreground mt-1">
                  {lastWinner.buyerName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
                  Prêmio: {lastWinner.prizeLabel}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Step 3: Histórico de Vencedores */}
        <Card className="apple-glass rounded-3xl border-white/12 shadow-xl overflow-hidden animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
          <CardHeader className="p-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <TrophyIcon className="size-4" />
              </div>
              <div>
                <CardTitle className="font-heading text-xl font-bold">Vencedores Sorteados</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Lista de todos os ganhadores do casamento.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {drawResults.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Nenhum sorteio realizado ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 pl-6">#</th>
                      <th className="p-4">Prêmio</th>
                      <th className="p-4">Número</th>
                      <th className="p-4">Ganhador(a)</th>
                      <th className="p-4 pr-6">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {drawResults.map((result, idx) => (
                      <tr key={`${result.numberId}-${result.prizeIndex}`} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 pl-6 text-muted-foreground">#{idx + 1}</td>
                        <td className="p-4 font-sans font-semibold text-foreground text-sm">
                          {result.prizeLabel}
                        </td>
                        <td className="p-4 font-bold text-primary text-sm apple-numeral">
                          {formatRaffleNumber(result.numberId)}
                        </td>
                        <td className="p-4 font-sans text-sm">{result.buyerName}</td>
                        <td className="p-4 pr-6 text-muted-foreground">
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
      </main>
    </div>
  );
}

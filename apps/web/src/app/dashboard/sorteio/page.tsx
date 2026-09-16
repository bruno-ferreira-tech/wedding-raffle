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
    <div className="min-h-dvh w-full bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="size-8 rounded-full hover:bg-muted">
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-4" />
              </Link>
            </Button>
            <h1 className="font-heading text-lg font-bold text-foreground">Sorteio da Festa</h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isSalesClosed
                  ? 'border-destructive/30 bg-destructive/10 text-destructive'
                  : 'border-emerald-600/30 bg-emerald-50 text-emerald-700'
              }`}
            >
              <span className={`size-2 rounded-full ${isSalesClosed ? 'bg-destructive' : 'bg-emerald-600 animate-pulse'}`} />
              {isSalesClosed ? 'Vendas Congeladas' : 'Vendas Abertas'}
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
        <Card className="wedding-card shadow-sm p-6 sm:p-7">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-heading text-xl font-bold text-foreground">1. Congelar Vendas</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Para sortear com integridade, encerre as vendas para que os números participantes sejam congelados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div>
              <p className="text-sm font-semibold">
                Status atual:{' '}
                <span className={isSalesClosed ? 'text-destructive font-semibold' : 'text-emerald-700 font-semibold'}>
                  {isSalesClosed ? 'VENDAS TRAVADAS PARA O SORTEIO' : 'RECEBENDO VENDAS'}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="wedding-numeral font-bold text-foreground">{eligibleCount}</span> bilhete(s) concorrendo neste momento.
              </p>
            </div>

            {isSalesClosed ? (
              <Button
                variant="outline"
                onClick={() => onToggleSales('open')}
                disabled={salesPending}
                className="rounded-full border-border bg-card hover:bg-muted text-xs uppercase h-10 px-5 font-semibold"
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

        {/* Step 2: Sorteio do Próximo Prêmio */}
        <Card className="wedding-card border-primary/30 shadow-md p-6 sm:p-7">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PartyPopperIcon className="size-4" />
              </div>
              <div>
                <CardTitle className="font-heading text-xl font-bold text-foreground">2. Sortear Prêmio</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  O vencedor é sorteado aleatoriamente entre os números confirmados e transmitido na mesma hora no Telão.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                  Nome do Prêmio Sorteado
                </label>
                <Input
                  value={prizeLabel}
                  onChange={(e) => setPrizeLabel(e.target.value)}
                  placeholder="Ex: Whisky 12 Anos"
                  disabled={drawPending}
                  className="h-12 rounded-xl bg-background border-border focus:ring-2 focus:ring-primary shadow-2xs"
                />
              </div>

              <div className="sm:self-end">
                <Button
                  size="lg"
                  onClick={onDrawNext}
                  disabled={!isSalesClosed || eligibleCount === 0 || drawPending}
                  className="wedding-button h-12 w-full sm:w-auto font-semibold px-8 rounded-2xl shadow-md disabled:opacity-50"
                >
                  {drawPending ? <Spinner data-icon="inline-start" /> : <SparklesIcon className="size-4 mr-2" />}
                  {drawPending ? 'Sorteando…' : 'Sortear Agora!'}
                </Button>
              </div>
            </div>

            {!isSalesClosed ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠️ Você precisa travar as vendas no passo 1 antes de realizar o sorteio.
              </p>
            ) : eligibleCount === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠️ Nenhum número pago foi registrado ainda.
              </p>
            ) : null}

            {lastWinner ? (
              <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/10 p-5 text-center shadow-xs">
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/20 px-3 py-0.5 text-xs font-semibold text-primary mb-2">
                  🎉 Último Sorteado
                </span>
                <h3 className="wedding-numeral text-4xl font-bold text-primary">
                  Número {formatRaffleNumber(lastWinner.numberId)}
                </h3>
                <p className="text-xl font-bold text-foreground mt-1">
                  {lastWinner.buyerName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">
                  Prêmio: {lastWinner.prizeLabel}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Step 3: Histórico de Vencedores */}
        <Card className="wedding-card shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrophyIcon className="size-4" />
              </div>
              <div>
                <CardTitle className="font-heading text-xl font-bold text-foreground">Vencedores Sorteados</CardTitle>
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
                    <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      <th className="p-4 pl-6">#</th>
                      <th className="p-4">Prêmio</th>
                      <th className="p-4">Número</th>
                      <th className="p-4">Ganhador(a)</th>
                      <th className="p-4 pr-6">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {drawResults.map((result, idx) => (
                      <tr key={`${result.numberId}-${result.prizeIndex}`} className="hover:bg-muted/40 transition-colors">
                        <td className="p-4 pl-6 text-muted-foreground font-semibold">#{idx + 1}</td>
                        <td className="p-4 font-semibold text-foreground text-sm">
                          {result.prizeLabel}
                        </td>
                        <td className="p-4 font-bold text-primary text-sm wedding-numeral">
                          {formatRaffleNumber(result.numberId)}
                        </td>
                        <td className="p-4 text-sm text-foreground">{result.buyerName}</td>
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

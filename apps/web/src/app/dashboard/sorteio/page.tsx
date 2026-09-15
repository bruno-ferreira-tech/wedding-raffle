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
import { Badge } from '@/components/ui/badge';
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
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="size-8">
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-4" />
              </Link>
            </Button>
            <h1 className="font-heading text-lg font-bold">Painel do Sorteio</h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={isSalesClosed ? 'destructive' : 'default'}
              className="font-mono text-xs uppercase tracking-wider"
            >
              {isSalesClosed ? '🔒 Vendas Travadas' : '🟢 Vendas Abertas'}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {/* Step 1: Trava de Vendas */}
        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="font-heading text-xl">1. Controle de Vendas</CardTitle>
            <CardDescription>
              Para sortear com segurança e integridade, encerre as vendas para que ninguém mais compre durante o sorteio.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Status atual:{' '}
                <span className={isSalesClosed ? 'text-destructive font-mono' : 'text-primary font-mono'}>
                  {isSalesClosed ? 'VENDAS TRAVADAS' : 'VENDAS ABERTAS'}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {eligibleCount} número(s) pago(s) concorrendo neste momento.
              </p>
            </div>

            {isSalesClosed ? (
              <Button
                variant="outline"
                onClick={() => onToggleSales('open')}
                disabled={salesPending}
                className="font-mono text-xs uppercase"
              >
                <UnlockIcon className="size-4 mr-1.5" />
                Reabrir Vendas
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => onToggleSales('closed')}
                disabled={salesPending}
                className="font-mono text-xs uppercase tracking-wider"
              >
                <LockIcon className="size-4 mr-1.5" />
                Travar Vendas para Sortear
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Sorteio do Próximo Prêmio */}
        <Card className="border-primary/40 bg-gradient-to-br from-card to-primary/5 shadow-[0_0_40px_-16px_var(--glow)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PartyPopperIcon className="size-5 text-primary" />
              <CardTitle className="font-heading text-xl">2. Sortear Prêmio</CardTitle>
            </div>
            <CardDescription>
              O número é escolhido criptograficamente entre os números pagos e transmitido ao vivo no Telão com contagem regressiva.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                  Nome do Prêmio
                </label>
                <Input
                  value={prizeLabel}
                  onChange={(e) => setPrizeLabel(e.target.value)}
                  placeholder="Ex: Whisky 12 Anos"
                  disabled={drawPending}
                />
              </div>

              <div className="sm:self-end">
                <Button
                  size="lg"
                  onClick={onDrawNext}
                  disabled={!isSalesClosed || eligibleCount === 0 || drawPending}
                  className="w-full sm:w-auto font-heading uppercase tracking-wide px-8 shadow-md"
                >
                  {drawPending ? <Spinner data-icon="inline-start" /> : <SparklesIcon className="size-4 mr-2" />}
                  {drawPending ? 'Sorteando…' : 'Sortear Agora!'}
                </Button>
              </div>
            </div>

            {!isSalesClosed ? (
              <p className="text-xs text-muted-foreground">
                ⚠️ Você precisa travar as vendas no passo 1 antes de realizar o sorteio.
              </p>
            ) : eligibleCount === 0 ? (
              <p className="text-xs text-muted-foreground">
                ⚠️ Nenhum número pago foi registrado ainda.
              </p>
            ) : null}

            {lastWinner ? (
              <div className="mt-4 rounded-xl border border-primary/40 bg-primary/10 p-4 text-center animate-[chip-in_0.45s_ease_both]">
                <Badge variant="outline" className="font-mono text-xs mb-2 border-primary/40 text-primary">
                  Último Sorteado
                </Badge>
                <h3 className="font-heading text-3xl font-bold text-primary">
                  Número {formatRaffleNumber(lastWinner.numberId)}
                </h3>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {lastWinner.buyerName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Prêmio: {lastWinner.prizeLabel}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Step 3: Histórico de Vencedores */}
        <Card className="border-border/60 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrophyIcon className="size-5 text-primary" />
              <CardTitle className="font-heading text-xl">Vencedores Sorteados</CardTitle>
            </div>
            <CardDescription>
              Lista de todos os ganhadores do casamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {drawResults.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhum sorteio realizado ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-4">#</th>
                      <th className="p-4">Prêmio</th>
                      <th className="p-4">Número</th>
                      <th className="p-4">Ganhador(a)</th>
                      <th className="p-4">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 font-mono text-xs">
                    {drawResults.map((result, idx) => (
                      <tr key={`${result.numberId}-${result.prizeIndex}`} className="hover:bg-muted/10">
                        <td className="p-4 text-muted-foreground">#{idx + 1}</td>
                        <td className="p-4 font-sans font-semibold text-foreground text-sm">
                          {result.prizeLabel}
                        </td>
                        <td className="p-4 font-bold text-primary text-sm">
                          {formatRaffleNumber(result.numberId)}
                        </td>
                        <td className="p-4 font-sans text-sm">{result.buyerName}</td>
                        <td className="p-4 text-muted-foreground">
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

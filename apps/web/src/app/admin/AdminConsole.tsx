'use client';

import {
  DicesIcon,
  LockIcon,
  LogInIcon,
  StoreIcon,
  TrophyIcon,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useId, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  ApiError,
  drawNext,
  fetchState,
  getEventsUrl,
  loginAdmin,
  setSalesStatus,
  type DrawResult,
  type StateSnapshot,
} from '@/lib/api';
import { formatBRL, formatRaffleNumber } from '@/lib/money';
import { parseRealtimeEvent } from '@/lib/sse';

export function AdminConsole() {
  const passwordId = useId();
  const prizeId = useId();

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [state, setState] = useState<StateSnapshot | null>(null);
  const [prizeLabel, setPrizeLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const next = await fetchState();
    setState(next);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    refresh().catch((err) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Falha ao carregar estado.');
    });
    return () => {
      cancelled = true;
    };
  }, [authed, refresh]);

  useEffect(() => {
    if (!authed) return;

    const es = new EventSource(getEventsUrl());
    es.onmessage = (msg) => {
      const event = parseRealtimeEvent(msg.data);
      if (!event) return;
      switch (event.type) {
        case 'connected':
        case 'heartbeat':
          break;
        case 'order.reserved':
        case 'sale.completed':
        case 'sales.updated':
        case 'draw.winner':
          void refresh().catch(() => {
            /* keep last snapshot */
          });
          break;
        default: {
          const _exhaustive: never = event;
          return _exhaustive;
        }
      }
    };

    return () => {
      es.close();
    };
  }, [authed, refresh]);

  function handleAuthError(err: unknown): boolean {
    if (err instanceof ApiError && err.status === 401) {
      setAuthed(false);
      setError('Sessão expirada. Entre novamente.');
      return true;
    }
    return false;
  }

  function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await loginAdmin(password);
        setAuthed(true);
        setPassword('');
      } catch (err) {
        const msg =
          err instanceof ApiError && err.status === 401
            ? 'Senha incorreta.'
            : err instanceof Error
              ? err.message
              : 'Falha no login.';
        setError(msg);
      }
    });
  }

  function toggleSales() {
    if (!state) return;
    const next = state.salesStatus === 'open' ? 'closed' : 'open';
    setError(null);
    startTransition(async () => {
      try {
        await setSalesStatus(next);
        await refresh();
        toast.success(
          next === 'closed' ? 'Vendas encerradas.' : 'Vendas reabertas.',
        );
      } catch (err) {
        if (handleAuthError(err)) return;
        setError(err instanceof Error ? err.message : 'Falha ao alterar vendas.');
      }
    });
  }

  function onDraw(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const label = prizeLabel.trim();
    startTransition(async () => {
      try {
        const winner = await drawNext(label ? { prizeLabel: label } : undefined);
        await refresh();
        setPrizeLabel('');
        toast.success(
          `Vencedor: ${formatRaffleNumber(winner.numberId)} — ${winner.buyerName}`,
        );
      } catch (err) {
        if (handleAuthError(err)) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Falha no sorteio.',
        );
      }
    });
  }

  if (!authed) {
    return (
      <div className="relative min-h-dvh w-full overflow-x-hidden bg-background text-foreground">
        {/* Ambient background glow */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        </div>

        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
          <header className="flex flex-col items-center text-center gap-3 mb-6 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_both]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase backdrop-blur-md">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Console Master
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Admin
              </span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-[32ch]">
              Vendas, arrecadação e sorteio geral do Corta-Gravata.
            </p>
          </header>

          <Card className="apple-glass rounded-3xl border border-white/12 shadow-2xl p-4 sm:p-6 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">
            <CardHeader className="text-center pb-3">
              <CardTitle className="font-heading text-xl">Acesso Master</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Informe a chave mestre do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="admin-login" className="flex flex-col gap-4" onSubmit={onLogin}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor={passwordId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center block">
                      Senha
                    </FieldLabel>
                    <Input
                      id={passwordId}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={pending}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      autoFocus
                      className="h-12 text-center font-mono text-xl tracking-[0.25em] rounded-2xl bg-black/25 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </Field>
                </FieldGroup>
                {error ? (
                  <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
              </form>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                type="submit"
                form="admin-login"
                size="lg"
                className="apple-pressable h-12 w-full rounded-2xl font-heading text-sm font-semibold tracking-wider uppercase bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                disabled={pending}
              >
                {pending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <LogInIcon data-icon="inline-start" className="size-4 mr-2" />
                )}
                {pending ? 'Entrando…' : 'Entrar'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const salesOpen = state?.salesStatus === 'open';

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-background text-foreground transition-colors duration-500">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-1/2 -right-48 h-80 w-80 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-3 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_both]">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-muted-foreground uppercase backdrop-blur-md">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Console Master
          </span>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Painel Admin
            </span>
          </h1>
        </header>

        {state ? (
          <section
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_0.08s_both]"
            aria-live="polite"
          >
            <Card className="apple-glass rounded-2xl border-white/12 p-3 text-center">
              <CardDescription className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                Disponíveis
              </CardDescription>
              <CardTitle className="font-mono text-2xl font-bold apple-numeral mt-1 text-foreground">
                {state.counts.disponivel}
              </CardTitle>
            </Card>
            <Card className="apple-glass rounded-2xl border-white/12 p-3 text-center">
              <CardDescription className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                Reservados
              </CardDescription>
              <CardTitle className="font-mono text-2xl font-bold apple-numeral mt-1 text-amber-400">
                {state.counts.reservado}
              </CardTitle>
            </Card>
            <Card className="apple-glass rounded-2xl border-white/12 p-3 text-center">
              <CardDescription className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                Pagos
              </CardDescription>
              <CardTitle className="font-mono text-2xl font-bold apple-numeral mt-1 text-emerald-400">
                {state.counts.pago}
              </CardTitle>
            </Card>
            <Card className="apple-glass rounded-2xl border-primary/30 p-3 text-center">
              <CardDescription className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
                Arrecadado
              </CardDescription>
              <CardTitle className="font-mono text-lg font-bold text-primary apple-numeral mt-1">
                {formatBRL(state.arrecadadoCents)}
              </CardTitle>
            </Card>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        )}

        <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-5 sm:p-6 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_0.12s_both]">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-heading text-xl font-bold">Vendas</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              Status:{' '}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                  salesOpen
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-destructive/30 bg-destructive/10 text-destructive'
                }`}
              >
                {salesOpen ? 'Abertas' : 'Encerradas'}
              </span>
            </CardDescription>
          </CardHeader>
          <CardFooter className="p-0 pt-2">
            <Button
              type="button"
              variant={salesOpen ? 'destructive' : 'default'}
              size="lg"
              className="apple-pressable h-12 w-full rounded-2xl font-heading text-xs font-semibold tracking-wider uppercase shadow-md"
              onClick={toggleSales}
              disabled={pending || !state}
            >
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : salesOpen ? (
                <LockIcon data-icon="inline-start" className="size-4 mr-2" />
              ) : (
                <StoreIcon data-icon="inline-start" className="size-4 mr-2" />
              )}
              {salesOpen ? 'Encerrar vendas' : 'Reabrir vendas'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-5 sm:p-6 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_0.16s_both]">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-heading text-xl font-bold">Sorteio</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Feche as vendas antes de sortear o próximo prêmio.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form id="admin-draw" className="flex flex-col gap-4" onSubmit={onDraw}>
              <FieldGroup>
                <Field data-disabled={salesOpen || undefined}>
                  <FieldLabel htmlFor={prizeId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rótulo do prêmio (opcional)
                  </FieldLabel>
                  <Input
                    id={prizeId}
                    value={prizeLabel}
                    onChange={(e) => setPrizeLabel(e.target.value)}
                    disabled={pending || salesOpen}
                    placeholder="Ex.: Lua de mel"
                    className="h-11 rounded-xl bg-black/30 border-white/15 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </FieldGroup>
              {salesOpen ? (
                <Alert className="rounded-2xl border-white/15 bg-white/5">
                  <AlertTitle>Vendas abertas</AlertTitle>
                  <AlertDescription>
                    Feche as vendas antes de sortear.
                  </AlertDescription>
                </Alert>
              ) : null}
            </form>
          </CardContent>
          <CardFooter className="p-0 pt-4">
            <Button
              type="submit"
              form="admin-draw"
              size="lg"
              className="apple-pressable h-12 w-full rounded-2xl font-heading text-xs font-semibold tracking-wider uppercase bg-primary text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50"
              disabled={pending || !state || salesOpen}
            >
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <DicesIcon data-icon="inline-start" className="size-4 mr-2" />
              )}
              {pending ? 'Sorteando…' : 'Sortear próximo'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="apple-glass rounded-3xl border-white/12 shadow-xl p-5 sm:p-6 animate-[fade-up_0.55s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-heading text-xl font-bold">Vencedores</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">Histórico de sorteios realizados.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            {!state || state.drawResults.length === 0 ? (
              <Empty className="border border-dashed border-white/15 rounded-2xl py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <TrophyIcon className="text-primary" />
                  </EmptyMedia>
                  <EmptyTitle>Nenhum sorteio ainda</EmptyTitle>
                  <EmptyDescription>
                    Os vencedores aparecem aqui após cada rodada.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="flex flex-col gap-3">
                {state.drawResults.map((w: DrawResult, index) => (
                  <li key={w.prizeIndex} className="flex flex-col gap-2">
                    {index > 0 ? <Separator className="bg-white/10" /> : null}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                        #{w.prizeIndex} · {w.prizeLabel}
                      </span>
                      <Badge variant="outline" className="font-mono text-primary border-primary/30 apple-numeral">
                        {formatRaffleNumber(w.numberId)}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{w.buyerName}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {error ? (
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}

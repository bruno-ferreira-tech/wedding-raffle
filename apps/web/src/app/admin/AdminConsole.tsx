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
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-3 animate-[fade-up_0.55s_ease_both]">
          <Badge
            variant="secondary"
            className="w-fit font-mono tracking-[0.18em] uppercase"
          >
            Console master
          </Badge>
          <h1 className="font-heading text-5xl font-bold tracking-tight text-balance sm:text-6xl">
            <span className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
              Admin
            </span>
          </h1>
          <p className="max-w-[36ch] text-base text-muted-foreground">
            Vendas, arrecadação e sorteio do Corta-Gravata.
          </p>
        </header>

        <Card className="border-primary/20 bg-card/70 shadow-[0_0_40px_-16px_var(--glow)] backdrop-blur-md animate-[fade-up_0.55s_ease_0.12s_both]">
          <CardHeader>
            <CardTitle className="font-heading">Entrar</CardTitle>
            <CardDescription>Acesso restrito ao console master.</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="admin-login" className="flex flex-col gap-5" onSubmit={onLogin}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={passwordId}>Senha</FieldLabel>
                  <Input
                    id={passwordId}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={pending}
                    autoComplete="current-password"
                    required
                    autoFocus
                  />
                </Field>
              </FieldGroup>
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              form="admin-login"
              size="lg"
              className="h-11 w-full font-heading tracking-wide uppercase"
              disabled={pending}
            >
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <LogInIcon data-icon="inline-start" />
              )}
              {pending ? 'Entrando…' : 'Entrar'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const salesOpen = state?.salesStatus === 'open';

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-3 animate-[fade-up_0.55s_ease_both]">
        <Badge
          variant="secondary"
          className="w-fit font-mono tracking-[0.18em] uppercase"
        >
          Console master
        </Badge>
        <h1 className="font-heading text-5xl font-bold tracking-tight text-balance sm:text-6xl">
          <span className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
            Painel
          </span>
        </h1>
      </header>

      {state ? (
        <section
          className="grid grid-cols-2 gap-3 animate-[fade-up_0.55s_ease_0.08s_both] sm:grid-cols-4"
          aria-live="polite"
        >
          <Card size="sm" className="bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardDescription className="font-mono text-xs tracking-[0.14em] uppercase">
                Disponíveis
              </CardDescription>
              <CardTitle className="font-mono text-2xl tabular-nums">
                {state.counts.disponivel}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm" className="bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardDescription className="font-mono text-xs tracking-[0.14em] uppercase">
                Reservados
              </CardDescription>
              <CardTitle className="font-mono text-2xl tabular-nums">
                {state.counts.reservado}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card size="sm" className="bg-card/70 backdrop-blur-md">
            <CardHeader>
              <CardDescription className="font-mono text-xs tracking-[0.14em] uppercase">
                Pagos
              </CardDescription>
              <CardTitle className="font-mono text-2xl tabular-nums">
                {state.counts.pago}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            size="sm"
            className="col-span-2 border-primary/20 bg-card/70 backdrop-blur-md sm:col-span-1"
          >
            <CardHeader>
              <CardDescription className="font-mono text-xs tracking-[0.14em] uppercase">
                Arrecadado
              </CardDescription>
              <CardTitle className="font-mono text-xl text-primary tabular-nums">
                {formatBRL(state.arrecadadoCents)}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      )}

      <Card className="border-primary/20 bg-card/70 shadow-[0_0_40px_-16px_var(--glow)] backdrop-blur-md animate-[fade-up_0.55s_ease_0.12s_both]">
        <CardHeader>
          <CardTitle className="font-heading">Vendas</CardTitle>
          <CardDescription className="flex items-center gap-2">
            Status:{' '}
            <Badge variant={salesOpen ? 'default' : 'destructive'}>
              {salesOpen ? 'Abertas' : 'Encerradas'}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            type="button"
            variant={salesOpen ? 'destructive' : 'default'}
            size="lg"
            className="h-11 w-full font-heading tracking-wide uppercase"
            onClick={toggleSales}
            disabled={pending || !state}
          >
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : salesOpen ? (
              <LockIcon data-icon="inline-start" />
            ) : (
              <StoreIcon data-icon="inline-start" />
            )}
            {salesOpen ? 'Encerrar vendas' : 'Reabrir vendas'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-primary/20 bg-card/70 backdrop-blur-md animate-[fade-up_0.55s_ease_0.16s_both]">
        <CardHeader>
          <CardTitle className="font-heading">Sorteio</CardTitle>
          <CardDescription>
            Feche as vendas antes de sortear o próximo prêmio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="admin-draw" className="flex flex-col gap-5" onSubmit={onDraw}>
            <FieldGroup>
              <Field data-disabled={salesOpen || undefined}>
                <FieldLabel htmlFor={prizeId}>Rótulo do prêmio (opcional)</FieldLabel>
                <Input
                  id={prizeId}
                  value={prizeLabel}
                  onChange={(e) => setPrizeLabel(e.target.value)}
                  disabled={pending || salesOpen}
                  placeholder="Ex.: Lua de mel"
                />
              </Field>
            </FieldGroup>
            {salesOpen ? (
              <Alert>
                <AlertTitle>Vendas abertas</AlertTitle>
                <AlertDescription>
                  Feche as vendas antes de sortear.
                </AlertDescription>
              </Alert>
            ) : null}
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="admin-draw"
            size="lg"
            className="h-11 w-full font-heading tracking-wide uppercase"
            disabled={pending || !state || salesOpen}
          >
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <DicesIcon data-icon="inline-start" />
            )}
            {pending ? 'Sorteando…' : 'Sortear próximo'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-card/70 backdrop-blur-md animate-[fade-up_0.55s_ease_0.2s_both]">
        <CardHeader>
          <CardTitle className="font-heading">Vencedores</CardTitle>
          <CardDescription>Histórico de sorteios realizados.</CardDescription>
        </CardHeader>
        <CardContent>
          {!state || state.drawResults.length === 0 ? (
            <Empty className="border border-dashed border-border/80 py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TrophyIcon />
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
                  {index > 0 ? <Separator /> : null}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                      #{w.prizeIndex} · {w.prizeLabel}
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {formatRaffleNumber(w.numberId)}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{w.buyerName}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

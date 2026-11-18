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
import { NumberTicker } from '@/components/ui/number-ticker';
import { launchCelebrationConfetti } from '@/lib/confetti';
import { motion } from 'motion/react';
import { fadeUp, cardReveal, staggerContainer } from '@/lib/animations';
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
        launchCelebrationConfetti({ count: 90 });
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
      <motion.div
        className="flex min-h-dvh w-full flex-col justify-center bg-background px-4 py-12 text-foreground"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto flex w-full max-w-md flex-col justify-center">
          <header className="flex flex-col items-center text-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Administração Geral
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Painel Admin
            </h1>
            <p className="text-sm text-muted-foreground max-w-[34ch]">
              Vendas, arrecadação e sorteio geral do Corta-Gravata.
            </p>
          </header>

          <Card className="wedding-card shadow-lg p-4 sm:p-6">
            <CardHeader className="text-center pb-3">
              <CardTitle className="font-heading text-xl font-bold text-foreground">Acesso Administrativo</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Informe a chave de segurança do sistema
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
                      className="h-12 text-center font-mono text-xl tracking-[0.25em] rounded-2xl bg-background border-border focus:ring-2 focus:ring-primary shadow-2xs"
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
                className="wedding-button h-12 w-full rounded-2xl text-sm font-semibold shadow-md"
                disabled={pending}
              >
                {pending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <LogInIcon data-icon="inline-start" className="size-4 mr-2" />
                )}
                {pending ? 'Entrando…' : 'Entrar no Painel'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    );
  }

  const salesOpen = state?.salesStatus === 'open';

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Administração Geral
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Painel Admin
          </h1>
        </header>

        {state ? (
          <motion.section
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <motion.div variants={cardReveal}>
              <Card className="wedding-card p-3 text-center shadow-xs">
                <CardDescription className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">
                  Livres
                </CardDescription>
                <CardTitle className="wedding-numeral text-2xl font-bold mt-1 text-foreground">
                  <NumberTicker value={state.counts.disponivel} />
                </CardTitle>
              </Card>
            </motion.div>
            <motion.div variants={cardReveal}>
              <Card className="wedding-card p-3 text-center shadow-xs">
                <CardDescription className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">
                  Reservados
                </CardDescription>
                <CardTitle className="wedding-numeral text-2xl font-bold mt-1 text-amber-600">
                  <NumberTicker value={state.counts.reservado} />
                </CardTitle>
              </Card>
            </motion.div>
            <motion.div variants={cardReveal}>
              <Card className="wedding-card p-3 text-center shadow-xs">
                <CardDescription className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">
                  Pagos
                </CardDescription>
                <CardTitle className="wedding-numeral text-2xl font-bold mt-1 text-emerald-600">
                  <NumberTicker value={state.counts.pago} />
                </CardTitle>
              </Card>
            </motion.div>
            <motion.div variants={cardReveal}>
              <Card className="wedding-card border-primary/30 p-3 text-center shadow-xs">
                <CardDescription className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground">
                  Arrecadado
                </CardDescription>
                <CardTitle className="wedding-numeral text-lg font-bold text-primary mt-1">
                  <NumberTicker
                    value={state.arrecadadoCents}
                    formatFn={(n) => formatBRL(Math.round(n))}
                  />
                </CardTitle>
              </Card>
            </motion.div>
          </motion.section>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        )}

        <Card className="wedding-card shadow-sm p-5 sm:p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-heading text-xl font-bold text-foreground">Vendas</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              Status:{' '}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                  salesOpen
                    ? 'border-emerald-600/30 bg-emerald-50 text-emerald-700'
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
              className="h-12 w-full rounded-2xl text-xs font-semibold tracking-wider uppercase shadow-sm"
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

        <Card className="wedding-card shadow-sm p-5 sm:p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-heading text-xl font-bold text-foreground">Sorteio</CardTitle>
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
                    className="h-11 rounded-xl bg-background border-border focus:ring-2 focus:ring-primary shadow-2xs"
                  />
                </Field>
              </FieldGroup>
              {salesOpen ? (
                <Alert className="rounded-2xl border-border bg-secondary/30">
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
              className="wedding-button wedding-shimmer h-12 w-full rounded-2xl text-xs font-semibold tracking-wider uppercase shadow-md disabled:opacity-50"
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

        <Card className="wedding-card shadow-sm p-5 sm:p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-heading text-xl font-bold text-foreground">Vencedores</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">Histórico de sorteios realizados.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            {!state || state.drawResults.length === 0 ? (
              <Empty className="border border-dashed border-border rounded-2xl py-6">
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
                    {index > 0 ? <Separator className="bg-border" /> : null}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs tracking-wider text-muted-foreground uppercase font-semibold">
                        #{w.prizeIndex} · {w.prizeLabel}
                      </span>
                      <Badge variant="outline" className="text-primary border-primary/30 wedding-numeral font-bold">
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

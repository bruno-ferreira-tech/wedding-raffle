'use client';

import { CheckIcon, LogInIcon } from 'lucide-react';
import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useState,
  useTransition,
} from 'react';
import { toast } from 'sonner';
import { BingoBoard } from '@/app/_components/BingoBoard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  ApiError,
  fetchNumberBoard,
  getEventsUrl,
  loginPadrinho,
  markPaid,
  type NumberBoardCell,
} from '@/lib/api';
import { formatRaffleNumber } from '@/lib/money';
import { parseRealtimeEvent } from '@/lib/sse';

export function PadrinhoConsole() {
  const passwordId = useId();
  const nameId = useId();

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [board, setBoard] = useState<NumberBoardCell[] | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadBoard = useCallback(async () => {
    const cells = await fetchNumberBoard();
    setBoard(cells);
    setSelected((prev) =>
      prev.filter((id) => {
        const cell = cells.find((c) => c.id === id);
        return cell?.status === 'disponivel';
      }),
    );
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setBoardLoading(true);
    loadBoard()
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar a cartela.');
      })
      .finally(() => {
        if (!cancelled) setBoardLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authed, loadBoard]);

  useEffect(() => {
    if (!authed) return;
    const es = new EventSource(getEventsUrl());
    es.onmessage = (msg) => {
      const event = parseRealtimeEvent(msg.data);
      if (!event) return;
      if (
        event.type === 'order.reserved' ||
        event.type === 'sale.completed' ||
        event.type === 'sales.updated'
      ) {
        void loadBoard().catch(() => undefined);
      }
    };
    return () => es.close();
  }, [authed, loadBoard]);

  function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await loginPadrinho(password);
        setAuthed(true);
        setPassword('');
      } catch (err) {
        const message =
          err instanceof ApiError && err.status === 401
            ? 'Senha incorreta.'
            : err instanceof Error
              ? err.message
              : 'Falha no login.';
        setError(message);
      }
    });
  }

  function toggleNumber(id: number) {
    setError(null);
    const cell = board?.find((c) => c.id === id);
    if (!cell || cell.status !== 'disponivel') {
      setError(`Número ${formatRaffleNumber(id)} indisponível.`);
      return;
    }
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((n) => n !== id)
        : [...prev, id].sort((a, b) => a - b),
    );
  }

  function onMarkPaid(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!buyerName.trim()) {
      setError('Informe o nome do comprador.');
      return;
    }
    if (selected.length === 0) {
      setError('Selecione ao menos um número na cartela.');
      return;
    }

    const numbers = [...selected];
    const name = buyerName.trim();

    startTransition(async () => {
      try {
        await markPaid({ buyerName: name, numberIds: numbers });
        toast.success(
          `Pago: ${numbers.map(formatRaffleNumber).join(', ')} — ${name}`,
        );
        setSelected([]);
        setBuyerName('');
        await loadBoard();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setAuthed(false);
          setError('Sessão expirada. Entre novamente.');
          return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Não foi possível marcar como pago.';
        setError(message);
        void loadBoard().catch(() => undefined);
      }
    });
  }

  if (!authed) {
    return (
      <div className="relative min-h-dvh w-full overflow-x-hidden bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
          <header className="flex flex-col items-center text-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Modo Padrinho
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Acesso do Padrinho
            </h1>
            <p className="text-sm text-muted-foreground max-w-[34ch]">
              Marque bilhetes pagos em dinheiro ou PIX em mãos durante a festa.
            </p>
          </header>

          <Card className="wedding-card shadow-lg p-2 sm:p-4">
            <CardHeader className="text-center pb-3">
              <CardTitle className="font-heading text-xl font-bold text-foreground">Entrar na Cartela</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Informe a senha de acesso informada pelos noivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="padrinho-login"
                className="flex flex-col gap-4"
                onSubmit={onLogin}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor={passwordId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center block">
                      Senha de Acesso
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
                      className="h-12 text-center font-mono text-xl tracking-[0.25em] rounded-2xl bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
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
                form="padrinho-login"
                size="lg"
                className="wedding-button h-12 w-full rounded-2xl text-base font-semibold shadow-md"
                disabled={pending}
              >
                {pending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <LogInIcon data-icon="inline-start" className="size-4 mr-2" />
                )}
                {pending ? 'Entrando…' : 'Acessar Cartela'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Modo Padrinho
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl text-foreground">
            Registrar Venda em Mãos
          </h1>
          <p className="max-w-[44ch] text-base text-muted-foreground leading-relaxed">
            Selecione os números na cartela, digite o nome do convidado e confirme o recebimento.
          </p>
        </header>

        <Card className="wedding-card shadow-lg overflow-hidden">
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="font-heading text-2xl font-bold text-foreground">Cartela da Festa</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Grade oficial ao vivo sincronizada com o telão e o site dos noivos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-6">
            <BingoBoard
              cells={board}
              selected={selected}
              loading={boardLoading}
              disabled={pending}
              onToggle={toggleNumber}
            />

            <div className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5">
              <form
                id="padrinho-mark-paid"
                className="flex flex-col gap-5"
                onSubmit={onMarkPaid}
              >
                <FieldGroup>
                  <Field
                    data-invalid={
                      Boolean(error && !buyerName.trim()) || undefined
                    }
                  >
                    <FieldLabel htmlFor={nameId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nome do Comprador
                    </FieldLabel>
                    <Input
                      id={nameId}
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      disabled={pending}
                      required
                      autoComplete="name"
                      placeholder="Ex: Tio Roberto ou Carlos Oliveira"
                      className="h-12 rounded-xl bg-background border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                      aria-invalid={
                        Boolean(error && !buyerName.trim()) || undefined
                      }
                    />
                  </Field>
                </FieldGroup>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Selecionados ({selected.length})
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {selected.length === 0
                        ? 'Nenhum número selecionado'
                        : `${selected.slice(0, 8).map(formatRaffleNumber).join(', ')}${selected.length > 8 ? '…' : ''}`}
                    </span>
                  </div>
                </div>

                {error ? (
                  <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/10">
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
              </form>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border bg-secondary/10 p-4 sm:p-6">
            <Button
              type="submit"
              form="padrinho-mark-paid"
              size="lg"
              className="wedding-button h-14 w-full rounded-2xl text-base font-semibold shadow-md disabled:opacity-50"
              disabled={pending || selected.length === 0}
            >
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <CheckIcon data-icon="inline-start" className="size-5 mr-2" />
              )}
              {pending ? 'Registrando…' : `Marcar ${selected.length} Número(s) como Pago`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

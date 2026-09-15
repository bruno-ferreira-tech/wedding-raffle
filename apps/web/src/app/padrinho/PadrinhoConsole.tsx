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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-3 animate-[fade-up_0.55s_ease_both]">
          <Badge
            variant="secondary"
            className="w-fit font-mono tracking-[0.18em] uppercase"
          >
            Operação assistida
          </Badge>
          <h1 className="font-heading text-5xl font-bold tracking-tight text-balance sm:text-6xl">
            <span className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
              Padrinho
            </span>
          </h1>
          <p className="max-w-[36ch] text-base text-muted-foreground">
            Marque números pagos em dinheiro ou PIX presencial.
          </p>
        </header>

        <Card className="border-primary/20 bg-card/70 shadow-[0_0_40px_-16px_var(--glow)] backdrop-blur-md animate-[fade-up_0.55s_ease_0.12s_both]">
          <CardHeader>
            <CardTitle className="font-heading">Entrar</CardTitle>
            <CardDescription>
              Acesso do padrinho ao console de pagamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="padrinho-login"
              className="flex flex-col gap-5"
              onSubmit={onLogin}
            >
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
              form="padrinho-login"
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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-3 animate-[fade-up_0.55s_ease_both]">
        <Badge
          variant="secondary"
          className="w-fit font-mono tracking-[0.18em] uppercase"
        >
          Operação assistida
        </Badge>
        <h1 className="font-heading text-5xl font-bold tracking-tight text-balance sm:text-6xl">
          <span className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
            Marcar pago
          </span>
        </h1>
        <p className="max-w-[40ch] text-base text-muted-foreground">
          Toque na cartela, confirme o nome e registre o pagamento.
        </p>
      </header>

      <Card className="border-primary/20 bg-card/70 shadow-[0_0_40px_-16px_var(--glow)] backdrop-blur-md animate-[fade-up_0.55s_ease_0.12s_both]">
        <CardHeader>
          <CardTitle className="font-heading">Cartela presencial</CardTitle>
          <CardDescription>
            Mesma grade do convidado — ideal para quem paga no caixa.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <BingoBoard
            cells={board}
            selected={selected}
            loading={boardLoading}
            disabled={pending}
            onToggle={toggleNumber}
          />

          <Separator />

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
                <FieldLabel htmlFor={nameId}>Nome do comprador</FieldLabel>
                <Input
                  id={nameId}
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  disabled={pending}
                  required
                  autoComplete="name"
                  placeholder="Quem pagou"
                  aria-invalid={
                    Boolean(error && !buyerName.trim()) || undefined
                  }
                />
              </Field>
            </FieldGroup>

            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  Selecionados
                </span>
                <span className="font-mono text-sm text-foreground">
                  {selected.length === 0
                    ? 'Nenhum'
                    : `${selected.length} · ${selected
                        .slice(0, 8)
                        .map(formatRaffleNumber)
                        .join(' ')}${selected.length > 8 ? '…' : ''}`}
                </span>
              </div>
            </div>

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
            form="padrinho-mark-paid"
            size="lg"
            className="h-11 w-full font-heading tracking-wide uppercase"
            disabled={pending || selected.length === 0}
          >
            {pending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <CheckIcon data-icon="inline-start" />
            )}
            {pending ? 'Registrando…' : 'Marcar como pago'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

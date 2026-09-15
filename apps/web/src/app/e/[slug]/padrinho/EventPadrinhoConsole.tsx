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
  padrinhoMarkPaid,
  verifyPadrinhoPin,
  type EventPublicData,
  type NumberBoardCell,
} from '@/lib/api';
import { formatBRL, formatRaffleNumber, totalCents } from '@/lib/money';
import { parseRealtimeEvent } from '@/lib/sse';

type Props = {
  event: EventPublicData;
};

export function EventPadrinhoConsole({ event }: Props) {
  const pinId = useId();
  const nameId = useId();

  const [pin, setPin] = useState('');
  const [activePin, setActivePin] = useState<string | null>(null);
  const [board, setBoard] = useState<NumberBoardCell[] | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const authed = Boolean(activePin);

  const loadBoard = useCallback(async () => {
    const cells = await fetchNumberBoard({ slug: event.slug });
    setBoard(cells);
    setSelected((prev) =>
      prev.filter((id) => {
        const cell = cells.find((c) => c.id === id);
        return cell?.status === 'disponivel';
      }),
    );
  }, [event.slug]);

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
    const es = new EventSource(getEventsUrl({ slug: event.slug }));
    es.onmessage = (msg) => {
      const data = parseRealtimeEvent(msg.data);
      if (!data) return;
      if (
        data.type === 'order.reserved' ||
        data.type === 'sale.completed' ||
        data.type === 'sales.updated'
      ) {
        void loadBoard().catch(() => undefined);
      }
    };
    return () => es.close();
  }, [authed, event.slug, loadBoard]);

  function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await verifyPadrinhoPin(event.slug, pin.trim());
        setActivePin(pin.trim());
        toast.success('Acesso liberado!');
      } catch (err) {
        const message =
          err instanceof ApiError && (err.status === 401 || err.status === 403)
            ? 'PIN de 4 dígitos incorreto.'
            : err instanceof Error
              ? err.message
              : 'Falha na verificação.';
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
    if (!activePin) return;
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
        await padrinhoMarkPaid(event.slug, {
          pin: activePin,
          buyerName: name,
          numberIds: numbers,
        });
        toast.success(
          `Venda confirmada: ${numbers.map(formatRaffleNumber).join(', ')} — ${name}`,
        );
        setSelected([]);
        setBuyerName('');
        await loadBoard();
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setActivePin(null);
          setError('PIN expirado ou inválido. Digite novamente.');
          return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Não foi possível registrar a venda.';
        setError(message);
        void loadBoard().catch(() => undefined);
      }
    });
  }

  const themeAttr = event.themeId ? { 'data-theme': event.themeId } : {};
  const total = selected.length > 0 ? totalCents(selected.length, event.ticketPriceCents) : 0;
  const livres = board?.filter((c) => c.status === 'disponivel').length ?? null;

  return (
    <div {...themeAttr} className="min-h-dvh w-full text-foreground bg-background transition-colors duration-300">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-2 animate-[fade-up_0.55s_ease_both]">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="w-fit font-mono tracking-[0.18em] uppercase"
            >
              Console do Padrinho
            </Badge>
            {authed ? (
              <Badge variant="secondary" className="w-fit font-mono">
                PIN Ativo
              </Badge>
            ) : null}
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            <span className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
              {event.coupleNames ? `Venda Assistida · ${event.coupleNames}` : event.title}
            </span>
          </h1>
          <p className="max-w-[48ch] text-base text-muted-foreground">
            Receba o dinheiro ou PIX em mãos do convidado e marque os números instantaneamente na cartela oficial.
          </p>
        </header>

        {!authed ? (
          <Card className="mx-auto w-full max-w-md border-primary/20 bg-card/70 backdrop-blur-md animate-[fade-up_0.55s_ease_0.12s_both]">
            <CardHeader>
              <CardTitle className="font-heading">Identificação do Padrinho</CardTitle>
              <CardDescription>
                Digite o PIN de 4 dígitos informado pelos noivos para liberar as vendas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="padrinho-login-form" className="flex flex-col gap-4" onSubmit={onLogin}>
                <Field data-invalid={Boolean(error) || undefined}>
                  <FieldLabel htmlFor={pinId}>PIN do Casamento</FieldLabel>
                  <Input
                    id={pinId}
                    type="password"
                    maxLength={10}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    disabled={pending}
                    required
                    placeholder="••••"
                    className="text-center font-mono text-2xl tracking-[0.3em]"
                    autoFocus
                  />
                </Field>

                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Não foi possível entrar</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="padrinho-login-form"
                size="lg"
                className="w-full font-heading uppercase"
                disabled={pending || !pin.trim()}
              >
                {pending ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" />}
                {pending ? 'Verificando…' : 'Acessar Cartela'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-primary/20 bg-card/70 backdrop-blur-md animate-[fade-up_0.55s_ease_0.12s_both]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading">Cartela do Evento</CardTitle>
                <CardDescription>
                  {livres !== null ? `${livres} números livres · ${formatBRL(event.ticketPriceCents)} cada` : 'Carregando…'}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs text-muted-foreground"
                onClick={() => {
                  setActivePin(null);
                  setPin('');
                }}
              >
                Trocar PIN
              </Button>
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

              <form id="mark-paid-form" className="flex flex-col gap-5" onSubmit={onMarkPaid}>
                <FieldGroup>
                  <Field data-invalid={Boolean(error && !buyerName.trim()) || undefined}>
                    <FieldLabel htmlFor={nameId}>Nome do Convidado</FieldLabel>
                    <Input
                      id={nameId}
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      disabled={pending}
                      required
                      placeholder="Nome de quem pagou em mãos"
                    />
                  </Field>
                </FieldGroup>

                <div className="flex items-end justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      Selecionados
                    </span>
                    <span className="font-mono text-sm text-foreground">
                      {selected.length === 0
                        ? 'Nenhum'
                        : `${selected.length} · ${selected.slice(0, 6).map(formatRaffleNumber).join(' ')}${selected.length > 6 ? '…' : ''}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      Valor Recebido
                    </span>
                    <p className="font-mono text-2xl font-semibold text-primary tabular-nums">
                      {formatBRL(total)}
                    </p>
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
                form="mark-paid-form"
                size="lg"
                className="h-11 w-full font-heading uppercase"
                disabled={pending || selected.length === 0}
              >
                {pending ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" />}
                {pending ? 'Registrando pagamento…' : 'Confirmar Pagamento Recebido'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

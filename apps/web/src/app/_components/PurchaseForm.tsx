'use client';

import { useRouter } from 'next/navigation';
import {
  FormEvent,
  useCallback,
  useEffect,
  useId,
  useState,
  useTransition,
} from 'react';
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
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { BingoBoard } from '@/app/_components/BingoBoard';
import {
  ApiError,
  fetchNumberBoard,
  createOrder,
  fetchState,
  getEventsUrl,
  type NumberBoardCell,
  type SalesStatus,
  type EventPublicData,
} from '@/lib/api';
import {
  formatBRL,
  formatRaffleNumber,
  PRICE_CENTS,
  totalCents,
} from '@/lib/money';
import { parseRealtimeEvent } from '@/lib/sse';

type PurchaseFormProps = {
  event?: EventPublicData;
};

export function PurchaseForm({ event }: PurchaseFormProps = {}) {
  const router = useRouter();
  const nameId = useId();
  const slug = event?.slug;
  const unitPrice = event?.ticketPriceCents ?? PRICE_CENTS;
  const [salesStatus, setSalesStatus] = useState<SalesStatus | null>(
    event?.salesStatus ?? null,
  );
  const [board, setBoard] = useState<NumberBoardCell[] | null>(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [buyerName, setBuyerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const salesClosed = salesStatus === 'closed';

  const loadBoard = useCallback(async () => {
    const [state, cells] = await Promise.all([
      fetchState(slug ? { slug } : undefined),
      fetchNumberBoard(slug ? { slug } : undefined),
    ]);
    setSalesStatus(state.salesStatus);
    setBoard(cells);
    setSelected((prev) =>
      prev.filter((id) => {
        const cell = cells.find((c) => c.id === id);
        return cell?.status === 'disponivel';
      }),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBoardLoading(true);
    loadBoard()
      .catch(() => {
        if (cancelled) return;
        setError('Não foi possível carregar a cartela de números.');
      })
      .finally(() => {
        if (!cancelled) setBoardLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadBoard]);

  useEffect(() => {
    const es = new EventSource(getEventsUrl(slug ? { slug } : undefined));
    es.onmessage = (msg) => {
      const data = parseRealtimeEvent(msg.data);
      if (!data) return;
      if (
        data.type === 'order.reserved' ||
        data.type === 'sale.completed' ||
        data.type === 'sales.updated'
      ) {
        void loadBoard().catch(() => {
          /* keep last board */
        });
      }
    };
    return () => es.close();
  }, [loadBoard, slug]);

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

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (salesClosed) {
      setError('Vendas encerradas.');
      return;
    }
    if (!buyerName.trim()) {
      setError('Informe o nome do comprador.');
      return;
    }
    if (selected.length === 0) {
      setError('Selecione ao menos um número na cartela.');
      return;
    }

    startTransition(async () => {
      try {
        const order = await createOrder({
          buyerName: buyerName.trim(),
          numberIds: selected,
          slug,
        });
        toast.success('Pedido criado — continue no PIX');
        if (slug) {
          router.push(`/e/${slug}/pedido/${order.id}`);
        } else {
          router.push(`/pedido/${order.id}`);
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Não foi possível criar o pedido.';
        setError(message);
        void loadBoard().catch(() => undefined);
      }
    });
  }

  const total = selected.length > 0 ? totalCents(selected.length, unitPrice) : 0;
  const livres =
    board?.filter((c) => c.status === 'disponivel').length ?? null;

  const themeAttr = event?.themeId ? { 'data-theme': event.themeId } : {};

  return (
    <div {...themeAttr} className="min-h-dvh w-full text-foreground bg-background transition-colors duration-300">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        {salesClosed ? (
          <Alert variant="destructive">
            <AlertTitle>Vendas encerradas</AlertTitle>
            <AlertDescription>
              Não é mais possível comprar números neste momento.
            </AlertDescription>
          </Alert>
        ) : null}

        <header className="flex flex-col gap-3 animate-[fade-up_0.55s_ease_both]">
          <Badge
            variant="secondary"
            className="w-fit font-mono tracking-[0.18em] uppercase"
          >
            <span
              className="size-1.5 animate-pulse rounded-full bg-primary"
              aria-hidden
            />
            {event?.salesStatus === 'closed' ? 'Sorteio em andamento' : 'Rifa ao vivo'}
          </Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            <span className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent">
              {event?.coupleNames ? `Corta-Gravata · ${event.coupleNames}` : 'Corta-Gravata'}
            </span>
          </h1>
          <p className="max-w-[48ch] text-base text-muted-foreground">
            {event?.welcomeMessage ||
              `Toque nos números da cartela como num bingo. Cada um custa ${formatBRL(unitPrice)}.`}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {livres !== null && !salesClosed ? (
              <Badge variant="outline" className="w-fit font-mono">
                {livres.toLocaleString('pt-BR')} slots livres · {formatBRL(unitPrice)} cada
              </Badge>
            ) : null}

            {event?.eventDate ? (
              <Badge variant="secondary" className="w-fit font-mono">
                📅 {new Date(event.eventDate).toLocaleDateString('pt-BR')}
              </Badge>
            ) : null}
          </div>

          {event?.prizes && event.prizes.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs font-mono tracking-wider uppercase text-muted-foreground self-center mr-1">
                Prêmios:
              </span>
              {event.prizes.map((p) => (
                <Badge
                  key={p.prizeIndex}
                  variant="default"
                  className="bg-primary/20 text-primary border border-primary/30 font-sans"
                >
                  #{p.prizeIndex + 1} {p.label}
                </Badge>
              ))}
            </div>
          ) : null}
        </header>

      <Card className="border-primary/20 bg-card/70 shadow-[0_0_40px_-16px_var(--glow)] backdrop-blur-md animate-[fade-up_0.55s_ease_0.12s_both]">
        <CardHeader>
          <CardTitle className="font-heading">Cartela</CardTitle>
          <CardDescription>
            Números riscados já foram reservados ou vendidos. Os verdes são
            seus.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <BingoBoard
            cells={board}
            selected={selected}
            loading={boardLoading}
            disabled={salesClosed || pending}
            onToggle={toggleNumber}
          />

          <Separator />

          <form
            id="purchase-form"
            className="flex flex-col gap-5"
            onSubmit={onSubmit}
          >
            <FieldGroup>
              <Field
                data-invalid={
                  Boolean(error && !buyerName.trim()) || undefined
                }
              >
                <FieldLabel htmlFor={nameId}>Nome</FieldLabel>
                <Input
                  id={nameId}
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  disabled={salesClosed || pending}
                  required
                  autoComplete="name"
                  placeholder="Seu nome completo"
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
              <div className="text-right">
                <span className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  Total
                </span>
                <p className="font-mono text-2xl font-semibold text-primary tabular-nums">
                  {selected.length === 0 ? formatBRL(0) : formatBRL(total)}
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
            form="purchase-form"
            size="lg"
            className="h-11 w-full font-heading tracking-wide uppercase"
            disabled={salesClosed || pending || selected.length === 0}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? 'Criando pedido…' : 'Pagar com PIX'}
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}

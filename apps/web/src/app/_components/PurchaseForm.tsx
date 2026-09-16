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
  }, [slug]);

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
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
            <AlertTitle>Vendas encerradas</AlertTitle>
            <AlertDescription>
              Não é mais possível comprar números neste momento.
            </AlertDescription>
          </Alert>
        ) : null}

        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              <span
                className="size-1.5 mr-1.5 animate-pulse rounded-full bg-primary"
                aria-hidden
              />
              {event?.salesStatus === 'closed' ? 'Sorteio em andamento' : 'Rifa ao vivo'}
            </Badge>

            {event?.eventDate ? (
              <Badge variant="outline" className="rounded-full border-border bg-card text-xs text-muted-foreground">
                📅 {new Date(event.eventDate).toLocaleDateString('pt-BR')}
              </Badge>
            ) : null}
          </div>

          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {event?.coupleNames ? `Corta-Gravata · ${event.coupleNames}` : 'Corta-Gravata dos Noivos'}
          </h1>
          <p className="max-w-[54ch] text-base text-muted-foreground leading-relaxed">
            {event?.welcomeMessage ||
              `Escolha seus bilhetes da sorte na cartela abaixo e participe da brincadeira! Cada número é ${formatBRL(unitPrice)}.`}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {livres !== null && !salesClosed ? (
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {livres.toLocaleString('pt-BR')} números disponíveis · {formatBRL(unitPrice)} cada
              </span>
            ) : null}

            {event?.prizes && event.prizes.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1 mr-1">
                  Prêmios:
                </span>
                {event.prizes.map((p) => (
                  <Badge
                    key={p.prizeIndex}
                    variant="outline"
                    className="rounded-full border-border bg-card text-foreground text-xs font-medium"
                  >
                    🎁 #{p.prizeIndex + 1} {p.label}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </header>

      <Card className="wedding-card shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-2xl font-bold text-foreground">Cartela da Sorte</CardTitle>
          <CardDescription className="text-muted-foreground">
            Clique nos números que deseja levar. Os números dourados serão reservados para você.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <BingoBoard
            cells={board}
            selected={selected}
            loading={boardLoading}
            disabled={salesClosed || pending}
            onToggle={toggleNumber}
          />

          <Separator className="bg-border" />

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
                <FieldLabel htmlFor={nameId} className="text-sm font-semibold text-foreground">Seu Nome Completo</FieldLabel>
                <Input
                  id={nameId}
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  disabled={salesClosed || pending}
                  required
                  autoComplete="name"
                  placeholder="Ex: Pedro Henrique Silva"
                  className="h-11 rounded-xl border-border bg-background px-4 text-foreground focus-visible:ring-primary shadow-2xs"
                  aria-invalid={
                    Boolean(error && !buyerName.trim()) || undefined
                  }
                />
              </Field>
            </FieldGroup>

            <div className="flex items-end justify-between gap-4 rounded-2xl border border-border bg-secondary/40 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Bilhetes Escolhidos
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {selected.length === 0
                    ? 'Nenhum bilhete selecionado'
                    : `${selected.length} bilhete(s) · ${selected
                        .slice(0, 8)
                        .map(formatRaffleNumber)
                        .join(', ')}${selected.length > 8 ? '…' : ''}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Valor Total
                </span>
                <p className="wedding-numeral text-3xl font-bold text-primary">
                  {selected.length === 0 ? formatBRL(0) : formatBRL(total)}
                </p>
              </div>
            </div>

            {error ? (
              <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/10">
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </form>
        </CardContent>
        <CardFooter className="pt-2 pb-6">
          <Button
            type="submit"
            form="purchase-form"
            size="lg"
            className="wedding-button h-12 w-full rounded-full text-base font-semibold shadow-md"
            disabled={salesClosed || pending || selected.length === 0}
          >
            {pending ? <Spinner data-icon="inline-start" className="mr-2" /> : null}
            {pending ? 'Preparando bilhetes…' : `Confirmar Bilhetes · ${formatBRL(total)}`}
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}

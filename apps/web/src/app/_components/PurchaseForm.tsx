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
import { NumberTicker } from '@/components/ui/number-ticker';
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

      <Card className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-6 sm:p-7">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="font-heading text-2xl font-bold text-stone-900">Cartela da Sorte</CardTitle>
          <CardDescription className="text-xs text-stone-600 font-medium mt-0.5">
            Toque nos números desejados para selecionar. Bilhetes confirmados são reservados imediatamente para você.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex flex-col gap-6 pt-2">
          <BingoBoard
            cells={board}
            selected={selected}
            loading={boardLoading}
            disabled={salesClosed || pending}
            onToggle={toggleNumber}
          />

          <Separator className="bg-stone-200" />

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
                <FieldLabel htmlFor={nameId} className="text-xs font-semibold uppercase tracking-wider text-stone-700">Seu Nome Completo *</FieldLabel>
                <Input
                  id={nameId}
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  disabled={salesClosed || pending}
                  required
                  autoComplete="name"
                  placeholder="Ex: Pedro Henrique Silva"
                  className="h-12 rounded-xl border border-stone-300 bg-stone-50/50 px-4 text-stone-900 font-medium focus-visible:ring-2 focus-visible:ring-stone-900 shadow-2xs"
                  aria-invalid={
                    Boolean(error && !buyerName.trim()) || undefined
                  }
                />
              </Field>
            </FieldGroup>

            <div className="flex items-end justify-between gap-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 sm:p-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Bilhetes Escolhidos
                </span>
                  <span className="text-sm font-semibold text-stone-900">
                    {selected.length === 0
                      ? 'Nenhum bilhete selecionado'
                      : `${selected.length} ${selected.length === 1 ? 'bilhete' : 'bilhetes'} · ${selected
                          .slice(0, 8)
                          .map(formatRaffleNumber)
                          .join(', ')}${selected.length > 8 ? '…' : ''}`}
                  </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Valor Total
                </span>
                <p className="wedding-numeral text-3xl font-bold text-stone-900 tabular-nums">
                  <NumberTicker
                    value={selected.length === 0 ? 0 : total}
                    formatFn={(n) => formatBRL(Math.round(n))}
                  />
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
        <CardFooter className="p-0 pt-6">
          <Button
            type="submit"
            form="purchase-form"
            size="lg"
            className="h-13 w-full rounded-full text-base font-semibold bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_12px_28px_-6px_rgba(44,38,30,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            disabled={salesClosed || pending || selected.length === 0}
          >
            {pending ? <Spinner data-icon="inline-start" className="mr-2" /> : null}
            {pending ? 'Preparando bilhetes…' : `Pagar com PIX · ${formatBRL(total)}`}
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}

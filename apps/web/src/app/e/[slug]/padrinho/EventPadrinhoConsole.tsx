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
import { NumberTicker } from '@/components/ui/number-ticker';
import { launchCelebrationConfetti } from '@/lib/confetti';
import { motion } from 'motion/react';
import { fadeUp } from '@/lib/animations';
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
        launchCelebrationConfetti({ count: 50 });
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
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Modo Padrinho
            </span>
            {authed ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/30 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Acesso Liberado
              </span>
            ) : null}
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl text-foreground">
            {event.coupleNames ? `Ajudar os Noivos · ${event.coupleNames}` : event.title}
          </h1>
          <p className="max-w-[50ch] text-base text-muted-foreground leading-relaxed">
            Receba o valor em mãos (dinheiro ou PIX) dos convidados e marque os números instantaneamente na cartela oficial da festa.
          </p>
        </header>

        {!authed ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto w-full max-w-md"
          >
            <Card className="wedding-card shadow-lg p-2 sm:p-4">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LogInIcon className="size-6" />
                </div>
                <CardTitle className="font-heading text-2xl font-bold text-foreground">Identificação do Padrinho</CardTitle>
                <CardDescription className="text-sm text-muted-foreground pt-1">
                  Digite a senha de 4 dígitos informada pelos noivos para liberar a marcação de bilhetes.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <form id="padrinho-login-form" className="flex flex-col gap-5" onSubmit={onLogin}>
                  <Field data-invalid={Boolean(error) || undefined}>
                    <FieldLabel htmlFor={pinId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center block">
                      Senha de 4 dígitos
                    </FieldLabel>
                    <Input
                      id={pinId}
                      type="password"
                      maxLength={10}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      disabled={pending}
                      required
                      placeholder="••••"
                      className="h-14 text-center font-mono text-3xl tracking-[0.4em] rounded-2xl bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                      autoFocus
                    />
                  </Field>

                  {error ? (
                    <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
                      <AlertTitle>Não foi possível entrar</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                </form>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  type="submit"
                  form="padrinho-login-form"
                  size="lg"
                  className="wedding-button h-12 w-full rounded-2xl text-base font-semibold shadow-md"
                  disabled={pending || !pin.trim()}
                >
                  {pending ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" className="size-4 mr-2" />}
                  {pending ? 'Verificando senha…' : 'Acessar Cartela'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          <Card className="wedding-card shadow-lg overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
              <div>
                <CardTitle className="font-heading text-2xl font-bold text-foreground">Cartela da Festa</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-0.5">
                  {livres !== null ? (
                    <span>
                      <strong className="text-foreground">{livres}</strong> números livres ·{' '}
                      <span className="text-primary font-semibold">{formatBRL(event.ticketPriceCents)}</span> cada
                    </span>
                  ) : (
                    'Carregando cartela…'
                  )}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-border bg-card text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setActivePin(null);
                  setPin('');
                }}
              >
                Trocar Senha
              </Button>
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
                <form id="mark-paid-form" className="flex flex-col gap-5" onSubmit={onMarkPaid}>
                  <FieldGroup>
                    <Field data-invalid={Boolean(error && !buyerName.trim()) || undefined}>
                      <FieldLabel htmlFor={nameId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Nome do Convidado Comprador
                      </FieldLabel>
                      <Input
                        id={nameId}
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        disabled={pending}
                        required
                        placeholder="Ex: Tio Roberto ou Carlos Oliveira"
                        className="h-12 rounded-xl bg-background border-border px-4 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-2xs"
                      />
                    </Field>
                  </FieldGroup>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Números Escolhidos ({selected.length})
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {selected.length === 0
                          ? 'Toque nos números livres acima'
                          : `${selected.slice(0, 8).map(formatRaffleNumber).join(', ')}${selected.length > 8 ? '…' : ''}`}
                      </span>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Valor Total em Mãos
                      </span>
                      <p className="wedding-numeral text-3xl font-bold text-primary">
                        <NumberTicker
                          value={total}
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
              </div>
            </CardContent>
            <CardFooter className="border-t border-border bg-secondary/10 p-4 sm:p-6">
              <Button
                type="submit"
                form="mark-paid-form"
                size="lg"
                className="wedding-button wedding-shimmer h-14 w-full rounded-2xl text-base font-semibold shadow-md disabled:opacity-50"
                disabled={pending || selected.length === 0}
              >
                {pending ? <Spinner data-icon="inline-start" /> : <CheckIcon data-icon="inline-start" className="size-5 mr-2" />}
                {pending ? 'Registrando venda…' : `Confirmar Pagamento Recebido (${formatBRL(total)})`}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

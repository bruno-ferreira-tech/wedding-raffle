'use client';

import Link from 'next/link';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  ApiError,
  confirmFakePayment,
  fetchOrder,
  isFakePaymentProvider,
  type OrderResponse,
  type OrderStatusValue,
} from '@/lib/api';
import { formatBRL, formatRaffleNumber } from '@/lib/money';

type Props = {
  orderId: number;
  backHref?: string;
  themeId?: string;
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function statusLabel(status: OrderStatusValue): string {
  switch (status) {
    case 'pending':
      return 'Aguardando pagamento';
    case 'paid':
      return 'Pago';
    case 'expired':
      return 'Expirado';
    case 'cancelled':
      return 'Cancelado';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function statusVariant(
  status: OrderStatusValue,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'outline';
    case 'expired':
    case 'cancelled':
      return 'destructive';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function OrderStatus({ orderId, backHref = '/', themeId }: Props) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    try {
      const next = await fetchOrder(orderId);
      setOrder(next);
      setError(null);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Falha ao carregar pedido.';
      setError(message);
    }
  }, [orderId]);

  useEffect(() => {
    void refresh();

    const interval = window.setInterval(() => {
      setNow(Date.now());
      void refresh();
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, [refresh]);

  async function onCopyPix() {
    if (!order?.pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(order.pixCopyPaste);
      setCopied(true);
      toast.success('Código PIX copiado!');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Não foi possível copiar o código PIX.');
    }
  }

  async function onConfirmFake() {
    setConfirming(true);
    try {
      const next = await confirmFakePayment(orderId);
      setOrder(next);
      toast.success('Pagamento simulado com sucesso!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Falha ao simular pagamento.',
      );
    } finally {
      setConfirming(false);
    }
  }

  const themeAttr = themeId ? { 'data-theme': themeId } : {};

  if (!order && !error) {
    return (
      <div {...themeAttr} className="min-h-dvh w-full text-foreground bg-background">
        <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 py-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div {...themeAttr} className="min-h-dvh w-full text-foreground bg-background">
        <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 py-8">
          <Button variant="link" asChild className="w-fit px-0 font-heading">
            <Link href={backHref}>← Voltar para a cartela</Link>
          </Button>
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const remainingMs = order.expiresAt
    ? new Date(order.expiresAt).getTime() - now
    : 0;
  const showFake =
    order.status === 'pending' && isFakePaymentProvider(order.pixCopyPaste);

  return (
    <div {...themeAttr} className="min-h-dvh w-full text-foreground bg-background transition-colors duration-300">
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <Button variant="ghost" asChild className="w-fit px-3 rounded-full text-primary hover:bg-black/5">
          <Link href={backHref}>← Voltar para a cartela</Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pedido #{order.id}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Participante: <strong className="text-foreground font-semibold">{order.buyerName}</strong>
            </p>
          </div>
          <Badge variant={statusVariant(order.status)} className="rounded-full px-3 py-1 text-xs uppercase tracking-wider font-semibold">
            {order.status === 'pending' ? (
              <span className="size-1.5 mr-1.5 animate-pulse rounded-full bg-primary" />
            ) : null}
            {statusLabel(order.status)}
          </Badge>
        </div>

      {order.status === 'paid' ? (
        <Card className="wedding-card border-primary/40 p-6 text-center space-y-4 shadow-md">
          <div className="mx-auto size-16 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <CheckIcon className="size-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold text-foreground">Pagamento Confirmado!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Seus bilhetes foram registrados com sucesso e já estão concorrendo no sorteio dos noivos.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="lg" className="wedding-button h-11 rounded-full px-8 shadow-sm">
              <Link href={backHref}>Acompanhar Cartela</Link>
            </Button>
          </div>
        </Card>
      ) : null}

      {order.status === 'expired' ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
          <AlertTitle>Pedido expirado</AlertTitle>
          <AlertDescription>
            O prazo de pagamento terminou e os números voltaram para a cartela da festa.
          </AlertDescription>
        </Alert>
      ) : null}

      {order.status === 'cancelled' ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
          <AlertTitle>Pedido cancelado</AlertTitle>
          <AlertDescription>Você pode escolher novos bilhetes na cartela a qualquer momento.</AlertDescription>
        </Alert>
      ) : null}

      <Card className="wedding-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg font-semibold text-foreground">Resumo dos Bilhetes</CardTitle>
          <CardDescription className="text-xs">
            {order.numberIds.length} bilhete(s) reservado(s) neste pedido
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {order.numberIds
              .slice()
              .sort((a, b) => a - b)
              .map((id) => (
                <Badge key={id} variant="outline" className="rounded-md border-border bg-secondary/50 font-mono text-xs px-2.5 py-1 text-foreground font-semibold">
                  {formatRaffleNumber(id)}
                </Badge>
              ))}
          </div>
          <Separator className="bg-border" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valor total</span>
            <p className="wedding-numeral text-3xl font-bold text-primary">
              {formatBRL(order.totalCents)}
            </p>
          </div>
        </CardContent>
      </Card>

      {order.status === 'pending' ? (
        <Card className="wedding-card border-primary/30 shadow-md">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="font-heading text-2xl font-bold text-foreground">Pague com PIX</CardTitle>
            <CardDescription className="text-xs">
              {order.expiresAt
                ? `Tempo restante para pagamento: ${formatCountdown(remainingMs)}`
                : 'Aguardando confirmação bancária'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {order.pixQrBase64 ? (
              <div className="rounded-2xl bg-white p-4 border border-border shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${order.pixQrBase64}`}
                  alt="QR Code PIX"
                  className="size-52"
                />
              </div>
            ) : null}

            {order.pixCopyPaste ? (
              <div className="w-full space-y-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider block text-center font-medium">
                  Chave Copia e Cola
                </span>
                <pre className="overflow-x-auto rounded-xl border border-border bg-secondary/50 p-3 font-mono text-xs leading-relaxed text-foreground break-all select-all">
                  {order.pixCopyPaste}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Gerando cobrança PIX…</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
            <Button
              type="button"
              className="wedding-button h-11 w-full rounded-full font-semibold shadow-sm"
              onClick={() => void onCopyPix()}
              disabled={!order.pixCopyPaste}
            >
              {copied ? (
                <CheckIcon className="size-4 mr-2" />
              ) : (
                <CopyIcon className="size-4 mr-2" />
              )}
              {copied ? 'Código PIX Copiado!' : 'Copiar Código PIX'}
            </Button>
            {showFake ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-full border-border bg-card text-xs font-medium hover:bg-muted"
                onClick={() => void onConfirmFake()}
                disabled={confirming}
              >
                {confirming ? <Spinner className="size-4 mr-2" /> : null}
                {confirming ? 'Simulando…' : 'Simular Pagamento (Ambiente de Teste)'}
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      ) : null}

      {error ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      </div>
    </div>
  );
}

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
        <Button variant="ghost" asChild className="apple-pressable w-fit px-3 rounded-full font-heading text-primary hover:bg-white/5">
          <Link href={backHref}>← Voltar para a cartela</Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pedido #{order.id}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Titular: <strong className="text-foreground font-medium">{order.buyerName}</strong>
            </p>
          </div>
          <Badge variant={statusVariant(order.status)} className="rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider">
            {order.status === 'pending' ? (
              <span className="size-1.5 mr-1.5 animate-pulse rounded-full bg-primary" />
            ) : null}
            {statusLabel(order.status)}
          </Badge>
        </div>

      {order.status === 'paid' ? (
        <Card className="apple-glass rounded-3xl border-primary/40 p-6 text-center space-y-4 shadow-[0_20px_60px_-15px_rgba(198,167,94,0.35)]">
          <div className="mx-auto size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
            <CheckIcon className="size-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold text-foreground">Pagamento Confirmado!</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Seus bilhetes foram emitidos e já estão concorrendo no sorteio ao vivo da festa.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild size="lg" className="apple-pressable h-11 rounded-full font-heading px-8 shadow-md">
              <Link href={backHref}>Acompanhar Sorteio</Link>
            </Button>
          </div>
        </Card>
      ) : null}

      {order.status === 'expired' ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
          <AlertTitle>Pedido expirado</AlertTitle>
          <AlertDescription>
            O prazo de pagamento terminou e os números foram liberados para outros convidados.
          </AlertDescription>
        </Alert>
      ) : null}

      {order.status === 'cancelled' ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
          <AlertTitle>Pedido cancelado</AlertTitle>
          <AlertDescription>Tente novamente selecionando outros bilhetes na cartela.</AlertDescription>
        </Alert>
      ) : null}

      <Card className="apple-glass rounded-3xl border-white/10 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg font-semibold">Resumo dos Bilhetes</CardTitle>
          <CardDescription className="text-xs">
            {order.numberIds.length} bilhete(s) reservado(s) para este pedido
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {order.numberIds
              .slice()
              .sort((a, b) => a - b)
              .map((id) => (
                <Badge key={id} variant="secondary" className="rounded-lg border-white/10 bg-white/5 font-mono text-xs px-2.5 py-1">
                  {formatRaffleNumber(id)}
                </Badge>
              ))}
          </div>
          <Separator className="bg-white/10" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total do Pedido</span>
            <p className="apple-numeral font-mono text-3xl font-bold text-primary">
              {formatBRL(order.totalCents)}
            </p>
          </div>
        </CardContent>
      </Card>

      {order.status === 'pending' ? (
        <Card className="apple-glass rounded-3xl border-primary/30 shadow-2xl">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="font-heading text-xl font-bold">Pague com PIX</CardTitle>
            <CardDescription className="text-xs">
              {order.expiresAt
                ? `Tempo restante: ${formatCountdown(remainingMs)}`
                : 'Aguardando confirmação bancária'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {order.pixQrBase64 ? (
              <div className="rounded-2xl bg-white p-3 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${order.pixQrBase64}`}
                  alt="QR Code PIX"
                  className="size-48"
                />
              </div>
            ) : null}

            {order.pixCopyPaste ? (
              <div className="w-full space-y-2">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider block text-center">
                  Código Copia e Cola
                </span>
                <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs leading-relaxed text-muted-foreground break-all select-all">
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
              className="apple-pressable h-11 w-full rounded-full font-heading uppercase tracking-wider shadow-lg shadow-primary/20"
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
                className="apple-pressable h-11 w-full rounded-full border-white/20 bg-white/5 font-heading text-xs uppercase tracking-wider backdrop-blur-md hover:bg-white/10"
                onClick={() => void onConfirmFake()}
                disabled={confirming}
              >
                {confirming ? <Spinner className="size-4 mr-2" /> : null}
                {confirming ? 'Simulando…' : 'Simular Pagamento (Teste)'}
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

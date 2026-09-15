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
        <Button variant="link" asChild className="w-fit px-0 font-heading text-primary">
          <Link href={backHref}>← Voltar para a cartela</Link>
        </Button>

        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Pedido #{order.id}
          </h1>
          <Badge variant={statusVariant(order.status)} className="w-fit font-mono uppercase tracking-wider">
            {statusLabel(order.status)}
          </Badge>
        </div>

      {order.status === 'paid' ? (
        <Alert>
          <AlertTitle>Pagamento confirmado</AlertTitle>
          <AlertDescription>Obrigado, {order.buyerName}!</AlertDescription>
        </Alert>
      ) : null}

      {order.status === 'expired' ? (
        <Alert variant="destructive">
          <AlertTitle>Pedido expirado</AlertTitle>
          <AlertDescription>
            Os números voltaram a ficar disponíveis — escolha de novo na página inicial.
          </AlertDescription>
        </Alert>
      ) : null}

      {order.status === 'cancelled' ? (
        <Alert variant="destructive">
          <AlertTitle>Pedido cancelado</AlertTitle>
          <AlertDescription>Tente novamente com outros números.</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-primary/20 bg-card/70 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="font-heading">Números</CardTitle>
          <CardDescription>{order.buyerName}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {order.numberIds
              .slice()
              .sort((a, b) => a - b)
              .map((id) => (
                <Badge key={id} variant="secondary" className="font-mono">
                  {formatRaffleNumber(id)}
                </Badge>
              ))}
          </div>
          <p className="font-mono text-2xl font-semibold text-primary tabular-nums">
            {formatBRL(order.totalCents)}
          </p>
        </CardContent>
      </Card>

      {order.status === 'pending' ? (
        <Card className="border-primary/20 bg-card/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="font-heading">PIX copia e cola</CardTitle>
            <CardDescription>
              {order.expiresAt
                ? `Expira em ${formatCountdown(remainingMs)}`
                : 'Aguardando código'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {order.pixCopyPaste ? (
              <pre className="overflow-x-auto rounded-lg border border-border bg-background/60 p-3 font-mono text-xs leading-relaxed wrap-break-word whitespace-pre-wrap">
                {order.pixCopyPaste}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">Aguardando código PIX…</p>
            )}
            <Separator />
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void onCopyPix()}
              disabled={!order.pixCopyPaste}
            >
              {copied ? (
                <CheckIcon data-icon="inline-start" />
              ) : (
                <CopyIcon data-icon="inline-start" />
              )}
              {copied ? 'Copiado' : 'Copiar PIX'}
            </Button>
            {showFake ? (
              <Button
                type="button"
                onClick={() => void onConfirmFake()}
                disabled={confirming}
              >
                {confirming ? <Spinner data-icon="inline-start" /> : null}
                {confirming ? 'Confirmando…' : 'Simular pagamento'}
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      </div>
    </div>
  );
}

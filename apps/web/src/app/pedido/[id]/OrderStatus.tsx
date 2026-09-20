'use client';

import Link from 'next/link';
import { CheckIcon, CopyIcon, ArrowLeftIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { launchCelebrationConfetti } from '@/lib/confetti';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp, scalePop } from '@/lib/animations';
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
      return 'Aguardando PIX';
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
  const confettiFired = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchOrder(orderId);
      setOrder(next);
      setError(null);
      if (next.status === 'paid' && !confettiFired.current) {
        confettiFired.current = true;
        launchCelebrationConfetti({ count: 90 });
      }
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
        <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-5 px-4 py-8 sm:py-12">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-44 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div {...themeAttr} className="min-h-dvh w-full text-foreground bg-background">
        <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-4 py-8">
          <Button variant="ghost" asChild className="w-fit px-2 rounded-full text-stone-700">
            <Link href={backHref}>
              <ArrowLeftIcon className="size-4 mr-1.5" />
              Voltar
            </Link>
          </Button>
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
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
  const ticketCount = order.numberIds.length;

  return (
    <div {...themeAttr} className="min-h-dvh w-full text-foreground bg-background transition-colors duration-300">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-5 px-4 py-8 sm:py-12">

        {/* Back link */}
        <Button
          variant="ghost"
          asChild
          className="w-fit -ml-2 px-2 rounded-full text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-900/[0.05]"
        >
          <Link href={backHref}>
            <ArrowLeftIcon className="size-3.5 mr-1" />
            Voltar para a cartela
          </Link>
        </Button>

        {/* Order header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500 mb-1">
              Comprovante
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Pedido #{order.id}
            </h1>
            <p className="text-sm text-stone-600 mt-0.5 font-medium">
              {order.buyerName}
            </p>
          </div>
          <Badge
            variant={statusVariant(order.status)}
            className="rounded-full px-3 py-1 text-xs font-semibold shrink-0 mt-1"
          >
            {order.status === 'pending' ? (
              <span className="size-1.5 mr-1.5 animate-pulse rounded-full bg-current inline-block" />
            ) : null}
            {statusLabel(order.status)}
          </Badge>
        </div>

        {/* Status banners */}
        <AnimatePresence mode="wait">
          {order.status === 'paid' ? (
            <motion.div
              key="status-paid"
              variants={scalePop}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
                <div className="mx-auto size-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckIcon className="size-7 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-heading text-xl font-bold text-emerald-900">Pagamento confirmado!</h2>
                  <p className="text-sm text-emerald-800/80 max-w-xs mx-auto leading-relaxed">
                    Seus bilhetes estão registrados e já concorrem ao sorteio.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-emerald-50 font-semibold text-xs px-5 h-9"
                >
                  <Link href={backHref}>Ver a cartela</Link>
                </Button>
              </div>
            </motion.div>
          ) : null}

          {order.status === 'expired' ? (
            <motion.div key="status-expired" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
                <AlertTitle>Pedido expirado</AlertTitle>
                <AlertDescription>
                  O prazo de pagamento terminou e os números voltaram para a cartela.
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : null}

          {order.status === 'cancelled' ? (
            <motion.div key="status-cancelled" variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
              <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/10">
                <AlertTitle>Pedido cancelado</AlertTitle>
                <AlertDescription>
                  Você pode escolher novos bilhetes na cartela a qualquer momento.
                </AlertDescription>
              </Alert>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Ticket summary */}
        <div className="rounded-[24px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(44,38,30,0.03),0_12px_24px_-6px_rgba(44,38,30,0.05)] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {ticketCount === 1 ? '1 bilhete' : `${ticketCount} bilhetes`}
            </span>
            <span className="wedding-numeral text-2xl font-bold text-stone-900 tabular-nums">
              {formatBRL(order.totalCents)}
            </span>
          </div>

          <Separator className="bg-stone-100" />

          <div className="flex flex-wrap gap-1.5 max-h-[9rem] overflow-y-auto">
            {order.numberIds
              .slice()
              .sort((a, b) => a - b)
              .map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-xs font-semibold text-stone-800"
                >
                  {formatRaffleNumber(id)}
                </span>
              ))}
          </div>
        </div>

        {/* PIX payment block */}
        {order.status === 'pending' ? (
          <div className="rounded-[24px] border border-stone-300 bg-white shadow-[0_2px_8px_rgba(44,38,30,0.04),0_18px_36px_-6px_rgba(44,38,30,0.08)] p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-stone-900">Pague com PIX</h2>
                <p className="text-xs text-stone-600 mt-0.5 font-medium">
                  {order.expiresAt ? (
                    <>
                      Expira em{' '}
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        {formatCountdown(remainingMs)}
                      </span>
                    </>
                  ) : (
                    'Aguardando confirmação bancária'
                  )}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 shrink-0">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Pendente
              </span>
            </div>

            {order.pixQrBase64 ? (
              <div className="flex justify-center">
                <div className="rounded-2xl bg-white p-3 border border-stone-200 shadow-sm inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${order.pixQrBase64}`}
                    alt="QR Code PIX"
                    className="w-44 h-44 sm:w-52 sm:h-52"
                  />
                </div>
              </div>
            ) : null}

            {order.pixCopyPaste ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                  Ou copie o código
                </span>
                <pre className="w-full overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-[11px] leading-relaxed text-stone-700 break-all select-all whitespace-pre-wrap">
                  {order.pixCopyPaste}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-stone-500 text-center">Gerando cobrança PIX…</p>
            )}

            <div className="flex flex-col gap-2.5">
              <Button
                type="button"
                className="h-12 w-full rounded-full text-sm font-semibold bg-stone-900 hover:bg-stone-800 text-stone-50 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_12px_28px_-6px_rgba(44,38,30,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer disabled:opacity-50"
                onClick={() => void onCopyPix()}
                disabled={!order.pixCopyPaste}
              >
                {copied ? (
                  <CheckIcon className="size-4 mr-2" />
                ) : (
                  <CopyIcon className="size-4 mr-2" />
                )}
                {copied ? 'Código copiado!' : 'Copiar código PIX'}
              </Button>
              {showFake ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-full border-stone-300 bg-white text-xs font-medium text-stone-700 hover:bg-stone-50"
                  onClick={() => void onConfirmFake()}
                  disabled={confirming}
                >
                  {confirming ? <Spinner className="size-4 mr-2" /> : null}
                  {confirming ? 'Simulando…' : 'Simular pagamento (teste)'}
                </Button>
              ) : null}
            </div>
          </div>
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

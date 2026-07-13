'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ApiError,
  confirmFakePayment,
  fetchOrder,
  isFakePaymentProvider,
  type OrderResponse,
  type OrderStatusValue,
} from '@/lib/api';
import { formatBRL, formatRaffleNumber } from '@/lib/money';
import styles from './pedido.module.css';

type Props = {
  orderId: number;
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

function statusClass(status: OrderStatusValue): string {
  switch (status) {
    case 'paid':
      return styles.statusPaid;
    case 'expired':
    case 'cancelled':
      return styles.statusExpired;
    case 'pending':
      return styles.statusPending;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function OrderStatus({ orderId }: Props) {
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
  }, [refresh]);

  useEffect(() => {
    if (!order || order.status !== 'pending') return;
    const id = window.setInterval(() => {
      void refresh();
    }, 2000);
    return () => window.clearInterval(id);
  }, [order, refresh]);

  useEffect(() => {
    if (!order || order.status !== 'pending' || !order.expiresAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [order]);

  async function copyPix() {
    if (!order?.pixCopyPaste) return;
    try {
      await navigator.clipboard.writeText(order.pixCopyPaste);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar o código PIX.');
    }
  }

  async function onConfirmFake() {
    setConfirming(true);
    setError(null);
    try {
      const next = await confirmFakePayment(orderId);
      setOrder(next);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Falha ao simular pagamento.';
      setError(message);
    } finally {
      setConfirming(false);
    }
  }

  if (!order && !error) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Carregando pedido…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <Link href="/" className={styles.brandLink}>
          Corta-Gravata
        </Link>
        <p className={styles.error} role="alert">
          {error}
        </p>
      </div>
    );
  }

  const remainingMs = order.expiresAt
    ? new Date(order.expiresAt).getTime() - now
    : 0;
  const showFake =
    order.status === 'pending' && isFakePaymentProvider(order.pixCopyPaste);

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.brandLink}>
        Corta-Gravata
      </Link>

      <h1 className={styles.title}>Pedido #{order.id}</h1>
      <p className={`${styles.status} ${statusClass(order.status)}`}>
        {statusLabel(order.status)}
      </p>

      {order.status === 'paid' ? (
        <p className={styles.message}>
          Pagamento confirmado. Obrigado, {order.buyerName}!
        </p>
      ) : null}

      {order.status === 'expired' ? (
        <p className={styles.message}>
          Este pedido expirou. Os números voltaram a ficar disponíveis — você
          pode escolher de novo na página inicial.
        </p>
      ) : null}

      {order.status === 'cancelled' ? (
        <p className={styles.message}>
          Este pedido foi cancelado. Tente novamente com outros números.
        </p>
      ) : null}

      <section className={styles.section}>
        <span className={styles.label}>Números</span>
        <div className={styles.numbers}>
          {order.numberIds
            .slice()
            .sort((a, b) => a - b)
            .map((id, index) => (
              <span
                key={id}
                className={styles.chip}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {formatRaffleNumber(id)}
              </span>
            ))}
        </div>
        <p className={styles.total}>{formatBRL(order.totalCents)}</p>
      </section>

      {order.status === 'pending' ? (
        <section className={styles.section}>
          <span className={styles.label}>PIX copia e cola</span>
          {order.pixCopyPaste ? (
            <pre className={styles.pixBox}>{order.pixCopyPaste}</pre>
          ) : (
            <p className={styles.message}>Aguardando código PIX…</p>
          )}
          {order.expiresAt ? (
            <p className={styles.countdown}>
              Expira em {formatCountdown(remainingMs)}
            </p>
          ) : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => void copyPix()}
              disabled={!order.pixCopyPaste}
            >
              {copied ? 'Copiado' : 'Copiar PIX'}
            </button>
            {showFake ? (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => void onConfirmFake()}
                disabled={confirming}
              >
                {confirming ? 'Confirmando…' : 'Simular pagamento'}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

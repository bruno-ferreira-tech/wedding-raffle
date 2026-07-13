'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchState,
  getEventsUrl,
  type RecentSale,
  type StateSnapshot,
} from '@/lib/api';
import { formatBRL, formatRaffleNumber } from '@/lib/money';
import { parseRealtimeEvent } from '@/lib/sse';
import styles from './telao.module.css';

type RevealPhase = 'idle' | 'countdown' | 'number' | 'name';

type RevealWinner = {
  prizeIndex: number;
  prizeLabel: string;
  numberId: number;
  buyerName: string;
};

type RevealState = {
  phase: RevealPhase;
  countdown: number | null;
  winner: RevealWinner | null;
};

const INITIAL_REVEAL: RevealState = {
  phase: 'idle',
  countdown: null,
  winner: null,
};

export function Telao() {
  const [state, setState] = useState<StateSnapshot | null>(null);
  const [feedPulse, setFeedPulse] = useState<number | null>(null);
  const [reveal, setReveal] = useState<RevealState>(INITIAL_REVEAL);
  const [live, setLive] = useState(false);
  const revealTimers = useRef<number[]>([]);

  const clearRevealTimers = useCallback(() => {
    for (const id of revealTimers.current) {
      window.clearTimeout(id);
    }
    revealTimers.current = [];
  }, []);

  const refreshState = useCallback(async () => {
    const next = await fetchState();
    setState(next);
    return next;
  }, []);

  const startReveal = useCallback(
    (winner: RevealWinner) => {
      clearRevealTimers();
      setReveal({
        phase: 'countdown',
        countdown: 3,
        winner,
      });

      const tick = (n: number) => {
        const id = window.setTimeout(() => {
          if (n > 1) {
            setReveal((prev) => ({ ...prev, countdown: n - 1 }));
            tick(n - 1);
          } else {
            setReveal((prev) => ({
              ...prev,
              phase: 'number',
              countdown: null,
            }));
            const nameId = window.setTimeout(() => {
              setReveal((prev) => ({ ...prev, phase: 'name' }));
            }, 1600);
            revealTimers.current.push(nameId);
            const dismissId = window.setTimeout(() => {
              setReveal(INITIAL_REVEAL);
            }, 9000);
            revealTimers.current.push(dismissId);
          }
        }, 900);
        revealTimers.current.push(id);
      };
      tick(3);
    },
    [clearRevealTimers],
  );

  useEffect(() => {
    let cancelled = false;
    refreshState().catch(() => {
      if (!cancelled) setState(null);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshState]);

  useEffect(() => {
    const es = new EventSource(getEventsUrl());

    es.onopen = () => setLive(true);
    es.onerror = () => setLive(false);

    es.onmessage = (msg) => {
      const event = parseRealtimeEvent(msg.data);
      if (!event) return;

      switch (event.type) {
        case 'connected':
        case 'heartbeat':
        case 'order.reserved':
          break;
        case 'sales.updated':
          setState((prev) =>
            prev ? { ...prev, salesStatus: event.salesStatus } : prev,
          );
          void refreshState();
          break;
        case 'sale.completed':
          void refreshState().then((next) => {
            if (next?.recentSales[0]) {
              setFeedPulse(next.recentSales[0].numberId);
            }
          });
          break;
        case 'draw.winner':
          startReveal({
            prizeIndex: event.prizeIndex,
            prizeLabel: event.prizeLabel,
            numberId: event.numberId,
            buyerName: event.buyerName,
          });
          void refreshState();
          break;
        default: {
          const _exhaustive: never = event;
          return _exhaustive;
        }
      }
    };

    return () => {
      es.close();
      clearRevealTimers();
    };
  }, [clearRevealTimers, refreshState, startReveal]);

  useEffect(() => {
    if (feedPulse === null) return;
    const id = window.setTimeout(() => setFeedPulse(null), 2200);
    return () => window.clearTimeout(id);
  }, [feedPulse]);

  const counts = state?.counts;
  const recent = state?.recentSales ?? [];
  const revealing = reveal.phase !== 'idle' && reveal.winner;

  return (
    <div className={styles.stage}>
      <div className={styles.vignette} aria-hidden />
      <div className={styles.grain} aria-hidden />

      <header className={styles.header}>
        <h1 className={styles.brand}>Corta-Gravata</h1>
        <p className={styles.live}>
          <span
            className={live ? styles.liveDotOn : styles.liveDotOff}
            aria-hidden
          />
          {live ? 'Ao vivo' : 'Reconectando…'}
          {state ? (
            <>
              {' · '}
              {state.salesStatus === 'open'
                ? 'Vendas abertas'
                : 'Vendas encerradas'}
            </>
          ) : null}
        </p>
      </header>

      <section className={styles.counters} aria-live="polite">
        <Counter label="Disponíveis" value={counts?.disponivel} delay={0} />
        <Counter label="Reservados" value={counts?.reservado} delay={1} />
        <Counter label="Pagos" value={counts?.pago} delay={2} />
        <div className={`${styles.counter} ${styles.counterWide}`}>
          <span className={styles.counterLabel}>Arrecadado</span>
          <span className={styles.counterMoney}>
            {state ? formatBRL(state.arrecadadoCents) : '—'}
          </span>
        </div>
      </section>

      <section className={styles.feedSection}>
        <h2 className={styles.feedTitle}>Últimas vendas</h2>
        <ul className={styles.feed}>
          {recent.length === 0 ? (
            <li className={styles.feedEmpty}>Aguardando as primeiras vendas…</li>
          ) : (
            recent.slice(0, 12).map((sale: RecentSale, index) => (
              <li
                key={`${sale.numberId}-${sale.updatedAt}`}
                className={`${styles.feedItem} ${
                  feedPulse === sale.numberId ? styles.feedItemPulse : ''
                }`}
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <span className={styles.feedNumber}>
                  {formatRaffleNumber(sale.numberId)}
                </span>
                <span className={styles.feedName}>{sale.buyerName}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      {state && state.drawResults.length > 0 ? (
        <section className={styles.winnersStrip} aria-label="Vencedores">
          {state.drawResults.map((w) => (
            <div key={w.prizeIndex} className={styles.winnerChip}>
              <span className={styles.winnerChipLabel}>{w.prizeLabel}</span>
              <span className={styles.winnerChipNumber}>
                {formatRaffleNumber(w.numberId)}
              </span>
              <span className={styles.winnerChipName}>{w.buyerName}</span>
            </div>
          ))}
        </section>
      ) : null}

      {revealing ? (
        <div className={styles.reveal} role="dialog" aria-live="assertive">
          <div className={styles.revealInner}>
            <p className={styles.revealPrize}>{reveal.winner!.prizeLabel}</p>
            {reveal.phase === 'countdown' && reveal.countdown !== null ? (
              <p className={styles.revealCountdown} key={reveal.countdown}>
                {reveal.countdown}
              </p>
            ) : null}
            {reveal.phase === 'number' || reveal.phase === 'name' ? (
              <p className={styles.revealNumber} key="number">
                {formatRaffleNumber(reveal.winner!.numberId)}
              </p>
            ) : null}
            {reveal.phase === 'name' ? (
              <p className={styles.revealName} key="name">
                {reveal.winner!.buyerName}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Counter({
  label,
  value,
  delay,
}: {
  label: string;
  value: number | undefined;
  delay: number;
}) {
  return (
    <div
      className={styles.counter}
      style={{ animationDelay: `${0.12 + delay * 0.08}s` }}
    >
      <span className={styles.counterLabel}>{label}</span>
      <span className={styles.counterValue}>
        {value === undefined ? '—' : value}
      </span>
    </div>
  );
}

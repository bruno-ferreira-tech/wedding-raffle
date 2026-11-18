'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  fetchState,
  getEventsUrl,
  type RecentSale,
  type StateSnapshot,
  type EventPublicData,
} from '@/lib/api';
import { formatBRL, formatRaffleNumber } from '@/lib/money';
import { parseRealtimeEvent } from '@/lib/sse';
import { NumberTicker } from '@/components/ui/number-ticker';
import { ConfettiScene } from '@/components/three/confetti-scene';
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

type TelaoProps = {
  event?: EventPublicData;
};

export function Telao({ event }: TelaoProps = {}) {
  const slug = event?.slug;
  const [state, setState] = useState<StateSnapshot | null>(null);
  const [feedPulse, setFeedPulse] = useState<number | null>(null);
  const [reveal, setReveal] = useState<RevealState>(INITIAL_REVEAL);
  const [live, setLive] = useState(false);
  const [showConfetti3D, setShowConfetti3D] = useState(false);
  const revealTimers = useRef<number[]>([]);

  const clearRevealTimers = useCallback(() => {
    for (const id of revealTimers.current) {
      window.clearTimeout(id);
    }
    revealTimers.current = [];
  }, []);

  const refreshState = useCallback(async () => {
    const next = await fetchState(slug ? { slug } : undefined);
    setState(next);
    return next;
  }, [slug]);

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
            // Launch Three.js 3D confetti on winner reveal
            setShowConfetti3D(true);
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
    const es = new EventSource(getEventsUrl(slug ? { slug } : undefined));

    es.onopen = () => setLive(true);
    es.onerror = () => setLive(false);

    es.onmessage = (msg) => {
      const event = parseRealtimeEvent(msg.data);
      if (!event) return;

      switch (event.type) {
        case 'connected':
        case 'heartbeat':
          break;
        case 'order.reserved':
          void refreshState();
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
  }, [clearRevealTimers, refreshState, slug, startReveal]);

  useEffect(() => {
    if (feedPulse === null) return;
    const id = window.setTimeout(() => setFeedPulse(null), 2200);
    return () => window.clearTimeout(id);
  }, [feedPulse]);

  const counts = state?.counts;
  const recent = state?.recentSales ?? [];
  const revealing = reveal.phase !== 'idle' && reveal.winner;

  return (
    <div className={styles.stage} data-theme={event?.themeId}>
      <div className={styles.vignette} aria-hidden />
      <div className={styles.grain} aria-hidden />
      <div className={styles.scanline} aria-hidden />

      <header className={styles.header}>
        <h1 className={styles.brand}>
          {event?.coupleNames ? `Corta-Gravata · ${event.coupleNames}` : 'Corta-Gravata'}
        </h1>
        <p className={styles.live}>
          <span
            className={live ? styles.liveDotOn : styles.liveDotOff}
            aria-hidden
          />
          {live ? 'Ao vivo' : 'Reconectando…'}
          {state ? (
            <>
              {' · '}
              {state.salesStatus === 'open' ? 'Cotas abertas' : 'Pausado para o sorteio'}
            </>
          ) : null}
        </p>
      </header>

      <section className={styles.counters} aria-live="polite">
        <Counter label="Disponíveis" value={counts?.disponivel} delay={0} />
        <Counter label="Reservados" value={counts?.reservado} delay={1} />
        <Counter label="Confirmados" value={counts?.pago} delay={2} />
        <div className={`${styles.counter} ${styles.counterWide}`}>
          <span className={styles.counterLabel}>Total Arrecadado</span>
          <span className={styles.counterMoney}>
            {state ? (
              <NumberTicker
                value={state.arrecadadoCents}
                formatFn={(n) => formatBRL(Math.round(n))}
              />
            ) : (
              '—'
            )}
          </span>
        </div>
      </section>

      <section className={styles.feedSection}>
        <h2 className={styles.feedTitle}>Últimas participações</h2>
        <ul className={styles.feed}>
          {recent.length === 0 ? (
            <li className={styles.feedEmpty}>Aguardando as primeiras participações…</li>
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

      {/* Three.js 3D Confetti — only mounts on winner reveal */}
      {showConfetti3D && (
        <ConfettiScene
          count={250}
          duration={7000}
          onComplete={() => setShowConfetti3D(false)}
        />
      )}

      <AnimatePresence>
        {revealing && (
          <motion.div
            className={styles.reveal}
            role="dialog"
            aria-live="assertive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className={styles.revealInner}
              initial={{ scale: 0.85, y: 32 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.p
                className={styles.revealPrize}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {reveal.winner!.prizeLabel}
              </motion.p>
              <AnimatePresence mode="wait">
                {reveal.phase === 'countdown' && reveal.countdown !== null ? (
                  <motion.p
                    key={`countdown-${reveal.countdown}`}
                    className={styles.revealCountdown}
                    initial={{ opacity: 0, scale: 1.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  >
                    {reveal.countdown}
                  </motion.p>
                ) : null}
                {reveal.phase === 'number' || reveal.phase === 'name' ? (
                  <motion.p
                    key="winner-number"
                    className={styles.revealNumber}
                    initial={{ opacity: 0, scale: 0.5, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.05 }}
                  >
                    {formatRaffleNumber(reveal.winner!.numberId)}
                  </motion.p>
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {reveal.phase === 'name' ? (
                  <motion.p
                    key="winner-name"
                    className={styles.revealName}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  >
                    {reveal.winner!.buyerName}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        {value === undefined ? '—' : <NumberTicker value={value} />}
      </span>
    </div>
  );
}

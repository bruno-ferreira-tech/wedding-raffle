'use client';

import { FormEvent, useCallback, useEffect, useId, useState, useTransition } from 'react';
import {
  ApiError,
  drawNext,
  fetchState,
  loginAdmin,
  setSalesStatus,
  type DrawResult,
  type StateSnapshot,
} from '@/lib/api';
import { formatBRL, formatRaffleNumber } from '@/lib/money';
import styles from './admin.module.css';

export function AdminConsole() {
  const passwordId = useId();
  const prizeId = useId();

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [state, setState] = useState<StateSnapshot | null>(null);
  const [prizeLabel, setPrizeLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const next = await fetchState();
    setState(next);
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    refresh().catch((err) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : 'Falha ao carregar estado.');
    });
    return () => {
      cancelled = true;
    };
  }, [authed, refresh]);

  function handleAuthError(err: unknown): boolean {
    if (err instanceof ApiError && err.status === 401) {
      setAuthed(false);
      setError('Sessão expirada. Entre novamente.');
      return true;
    }
    return false;
  }

  function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await loginAdmin(password);
        setAuthed(true);
        setPassword('');
      } catch (err) {
        const msg =
          err instanceof ApiError && err.status === 401
            ? 'Senha incorreta.'
            : err instanceof Error
              ? err.message
              : 'Falha no login.';
        setError(msg);
      }
    });
  }

  function toggleSales() {
    if (!state) return;
    const next = state.salesStatus === 'open' ? 'closed' : 'open';
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await setSalesStatus(next);
        await refresh();
        setMessage(
          next === 'closed' ? 'Vendas encerradas.' : 'Vendas reabertas.',
        );
      } catch (err) {
        if (handleAuthError(err)) return;
        setError(err instanceof Error ? err.message : 'Falha ao alterar vendas.');
      }
    });
  }

  function onDraw(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const label = prizeLabel.trim();
    startTransition(async () => {
      try {
        const winner = await drawNext(label ? { prizeLabel: label } : undefined);
        await refresh();
        setPrizeLabel('');
        setMessage(
          `Vencedor: ${formatRaffleNumber(winner.numberId)} — ${winner.buyerName}`,
        );
      } catch (err) {
        if (handleAuthError(err)) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Falha no sorteio.',
        );
      }
    });
  }

  if (!authed) {
    return (
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Controle</p>
          <h1 className={styles.brand}>Admin</h1>
          <p className={styles.tagline}>
            Vendas, arrecadação e sorteio do Corta-Gravata.
          </p>
        </header>
        <form className={styles.form} onSubmit={onLogin}>
          <div>
            <label className={styles.fieldLabel} htmlFor={passwordId}>
              Senha
            </label>
            <input
              id={passwordId}
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              autoComplete="current-password"
              required
              autoFocus
            />
          </div>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className={styles.cta} disabled={pending}>
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  const salesOpen = state?.salesStatus === 'open';

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Admin</p>
        <h1 className={styles.brand}>Painel</h1>
      </header>

      {state ? (
        <section className={styles.stats} aria-live="polite">
          <div className={styles.stat}>
            <span className={styles.statLabel}>Disponíveis</span>
            <span className={styles.statValue}>{state.counts.disponivel}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Reservados</span>
            <span className={styles.statValue}>{state.counts.reservado}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Pagos</span>
            <span className={styles.statValue}>{state.counts.pago}</span>
          </div>
          <div className={styles.statWide}>
            <span className={styles.statLabel}>Arrecadado</span>
            <span className={styles.statMoney}>
              {formatBRL(state.arrecadadoCents)}
            </span>
          </div>
        </section>
      ) : (
        <p className={styles.muted}>Carregando estado…</p>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vendas</h2>
        <p className={styles.salesStatus}>
          Status:{' '}
          <strong className={salesOpen ? styles.open : styles.closed}>
            {salesOpen ? 'Abertas' : 'Encerradas'}
          </strong>
        </p>
        <button
          type="button"
          className={salesOpen ? styles.dangerBtn : styles.cta}
          onClick={toggleSales}
          disabled={pending || !state}
        >
          {salesOpen ? 'Encerrar vendas' : 'Reabrir vendas'}
        </button>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sorteio</h2>
        <form className={styles.form} onSubmit={onDraw}>
          <div>
            <label className={styles.fieldLabel} htmlFor={prizeId}>
              Rótulo do prêmio (opcional)
            </label>
            <input
              id={prizeId}
              className={styles.input}
              style={{ width: '100%' }}
              value={prizeLabel}
              onChange={(e) => setPrizeLabel(e.target.value)}
              disabled={pending || salesOpen}
              placeholder="Ex.: Lua de mel"
            />
          </div>
          <button
            type="submit"
            className={styles.cta}
            disabled={pending || !state || salesOpen}
          >
            {pending ? 'Sorteando…' : 'Sortear próximo'}
          </button>
          {salesOpen ? (
            <p className={styles.hint}>Feche as vendas antes de sortear.</p>
          ) : null}
        </form>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Vencedores</h2>
        {!state || state.drawResults.length === 0 ? (
          <p className={styles.muted}>Nenhum sorteio ainda.</p>
        ) : (
          <ul className={styles.winners}>
            {state.drawResults.map((w: DrawResult) => (
              <li key={w.prizeIndex} className={styles.winner}>
                <span className={styles.winnerPrize}>
                  #{w.prizeIndex} · {w.prizeLabel}
                </span>
                <span className={styles.winnerNumber}>
                  {formatRaffleNumber(w.numberId)}
                </span>
                <span className={styles.winnerName}>{w.buyerName}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className={styles.success} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}

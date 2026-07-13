'use client';

import { useRouter } from 'next/navigation';
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useState,
  useTransition,
} from 'react';
import {
  ApiError,
  checkNumbers,
  createOrder,
  fetchState,
  type SalesStatus,
} from '@/lib/api';
import {
  formatBRL,
  formatRaffleNumber,
  MAX_NUMBER_ID,
  MIN_NUMBER_ID,
  PRICE_CENTS,
  totalCents,
} from '@/lib/money';
import styles from './purchase.module.css';

function parseNumberInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < MIN_NUMBER_ID || n > MAX_NUMBER_ID) {
    return null;
  }
  return n;
}

export function PurchaseForm() {
  const router = useRouter();
  const nameId = useId();
  const numberId = useId();
  const [salesStatus, setSalesStatus] = useState<SalesStatus | null>(null);
  const [disponivel, setDisponivel] = useState<number | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [numberDraft, setNumberDraft] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [pending, startTransition] = useTransition();

  const salesClosed = salesStatus === 'closed';

  useEffect(() => {
    let cancelled = false;
    fetchState()
      .then((state) => {
        if (cancelled) return;
        setSalesStatus(state.salesStatus);
        setDisponivel(state.counts.disponivel);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Não foi possível carregar o estado das vendas.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function addNumber() {
    setError(null);
    const id = parseNumberInput(numberDraft);
    if (id === null) {
      setError(`Digite um número entre ${MIN_NUMBER_ID} e ${MAX_NUMBER_ID}.`);
      return;
    }
    if (selected.includes(id)) {
      setError(`O número ${formatRaffleNumber(id)} já está na lista.`);
      return;
    }

    setChecking(true);
    try {
      const [result] = await checkNumbers([id]);
      if (!result || result.status !== 'disponivel') {
        setError(`Número ${formatRaffleNumber(id)} indisponível.`);
        return;
      }
      setSelected((prev) => [...prev, id].sort((a, b) => a - b));
      setNumberDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao verificar número.');
    } finally {
      setChecking(false);
    }
  }

  function removeNumber(id: number) {
    setSelected((prev) => prev.filter((n) => n !== id));
  }

  function onNumberKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void addNumber();
    }
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
      setError('Selecione ao menos um número.');
      return;
    }

    startTransition(async () => {
      try {
        const order = await createOrder({
          buyerName: buyerName.trim(),
          numberIds: selected,
        });
        router.push(`/pedido/${order.id}`);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Não foi possível criar o pedido.';
        setError(message);
      }
    });
  }

  const total = selected.length > 0 ? totalCents(selected.length) : 0;
  const busy = pending || checking;

  return (
    <div className={styles.page}>
      {salesClosed ? (
        <p className={styles.closedBanner} role="status">
          Vendas encerradas — não é mais possível comprar números.
        </p>
      ) : null}

      <header className={styles.hero}>
        <h1 className={styles.brand}>Corta-Gravata</h1>
        <p className={styles.tagline}>
          Escolha seus números e pague com PIX. Cada número custa{' '}
          {formatBRL(PRICE_CENTS)}.
        </p>
        {disponivel !== null && !salesClosed ? (
          <p className={styles.meta}>{disponivel} disponíveis</p>
        ) : null}
      </header>

      <form className={styles.form} onSubmit={onSubmit}>
        <div>
          <label className={styles.fieldLabel} htmlFor={numberId}>
            Número
          </label>
          <div className={styles.row}>
            <input
              id={numberId}
              className={styles.input}
              inputMode="numeric"
              placeholder="0001 – 2000"
              value={numberDraft}
              onChange={(e) => setNumberDraft(e.target.value)}
              onKeyDown={onNumberKeyDown}
              disabled={salesClosed || busy}
              autoComplete="off"
            />
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => void addNumber()}
              disabled={salesClosed || busy}
            >
              Adicionar
            </button>
          </div>
          <p className={styles.hint}>
            Busque pelo número e adicione à sua seleção.
          </p>
        </div>

        <div>
          <span className={styles.fieldLabel}>Selecionados</span>
          {selected.length === 0 ? (
            <p className={styles.emptyHint}>Nenhum número ainda.</p>
          ) : (
            <div className={styles.selected} aria-live="polite">
              {selected.map((id, index) => (
                <button
                  key={id}
                  type="button"
                  className={styles.chip}
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => removeNumber(id)}
                  aria-label={`Remover ${formatRaffleNumber(id)}`}
                >
                  {formatRaffleNumber(id)}
                  <span className={styles.chipRemove} aria-hidden>
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor={nameId}>
            Nome
          </label>
          <input
            id={nameId}
            className={styles.input}
            style={{ width: '100%' }}
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            disabled={salesClosed || busy}
            required
            autoComplete="name"
            placeholder="Seu nome completo"
          />
        </div>

        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>
            {selected.length === 0 ? formatBRL(0) : formatBRL(total)}
          </span>
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className={styles.cta}
          disabled={salesClosed || busy || selected.length === 0}
        >
          {pending ? 'Criando pedido…' : 'Pagar com PIX'}
        </button>
      </form>
    </div>
  );
}

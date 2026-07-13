'use client';

import {
  FormEvent,
  KeyboardEvent,
  useId,
  useState,
  useTransition,
} from 'react';
import {
  ApiError,
  checkNumbers,
  loginPadrinho,
  markPaid,
} from '@/lib/api';
import {
  formatRaffleNumber,
  MAX_NUMBER_ID,
  MIN_NUMBER_ID,
  parseNumberInput,
} from '@/lib/money';
import styles from './padrinho.module.css';

export function PadrinhoConsole() {
  const passwordId = useId();
  const nameId = useId();
  const numberId = useId();

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [numberDraft, setNumberDraft] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [pending, startTransition] = useTransition();

  function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        await loginPadrinho(password);
        setAuthed(true);
        setPassword('');
      } catch (err) {
        const message =
          err instanceof ApiError && err.status === 401
            ? 'Senha incorreta.'
            : err instanceof Error
              ? err.message
              : 'Falha no login.';
        setError(message);
      }
    });
  }

  async function addNumber() {
    setError(null);
    setSuccess(null);
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

  function onMarkPaid(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!buyerName.trim()) {
      setError('Informe o nome do comprador.');
      return;
    }
    if (selected.length === 0) {
      setError('Selecione ao menos um número.');
      return;
    }

    const numbers = [...selected];
    const name = buyerName.trim();

    startTransition(async () => {
      try {
        await markPaid({ buyerName: name, numberIds: numbers });
        setSuccess(
          `Pago: ${numbers.map(formatRaffleNumber).join(', ')} — ${name}`,
        );
        setSelected([]);
        setBuyerName('');
        setNumberDraft('');
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setAuthed(false);
          setError('Sessão expirada. Entre novamente.');
          return;
        }
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Não foi possível marcar como pago.';
        setError(message);
      }
    });
  }

  const busy = pending || checking;

  if (!authed) {
    return (
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Dia do casamento</p>
          <h1 className={styles.brand}>Padrinho</h1>
          <p className={styles.tagline}>
            Marque números pagos em dinheiro ou PIX presencial.
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

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Padrinho</p>
        <h1 className={styles.brand}>Marcar pago</h1>
        <p className={styles.tagline}>
          Selecione os números, confirme o nome e registre o pagamento.
        </p>
      </header>

      <form className={styles.form} onSubmit={onMarkPaid}>
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
              disabled={busy}
              autoComplete="off"
            />
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => void addNumber()}
              disabled={busy}
            >
              Add
            </button>
          </div>
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
            Nome do comprador
          </label>
          <input
            id={nameId}
            className={styles.input}
            style={{ width: '100%' }}
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            disabled={busy}
            required
            autoComplete="name"
            placeholder="Quem pagou"
          />
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className={styles.success} role="status">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          className={styles.cta}
          disabled={busy || selected.length === 0}
        >
          {pending ? 'Registrando…' : 'Marcar como pago'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { NumberBoardCell, NumberBoardStatus } from '@/lib/api';
import { formatRaffleNumber } from '@/lib/money';
import styles from './bingo-board.module.css';

type Props = {
  cells: NumberBoardCell[] | null;
  selected: number[];
  disabled?: boolean;
  loading?: boolean;
  onToggle: (id: number) => void;
  className?: string;
};

function isTaken(status: NumberBoardStatus): boolean {
  return status === 'reservado' || status === 'pago';
}

export function BingoBoard({
  cells,
  selected,
  disabled = false,
  loading = false,
  onToggle,
  className,
}: Props) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  if (loading || !cells) {
    return (
      <div className={cn(styles.shell, className)}>
        <div className={styles.loading} role="status">
          Carregando cartela…
        </div>
      </div>
    );
  }

  const livres = cells.filter((c) => c.status === 'disponivel').length;

  return (
    <div className={cn(styles.shell, className)}>
      <div className={styles.toolbar}>
        <div className={styles.legend} aria-hidden>
          <span className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchDisponivel}`} />
            Livre
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchSelecionado}`} />
            Seu
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.swatch} ${styles.swatchIndisponivel}`} />
            Indisponível
          </span>
        </div>
        <p className={styles.hint}>{livres.toLocaleString('pt-BR')} livres na cartela</p>
      </div>

      <div className={styles.boardWrap}>
        <div
          className={styles.board}
          role="group"
          aria-label="Cartela de números do sorteio"
        >
          {cells.map((cell) => {
            const taken = isTaken(cell.status);
            const isSelected = selectedSet.has(cell.id);
            return (
              <button
                key={cell.id}
                type="button"
                className={cn(
                  styles.cell,
                  isSelected && styles.cellSelected,
                  taken && styles.cellTaken,
                )}
                disabled={disabled || taken}
                aria-pressed={isSelected}
                aria-label={`Número ${formatRaffleNumber(cell.id)}${
                  taken
                    ? cell.status === 'pago'
                      ? ', já vendido'
                      : ', reservado'
                    : isSelected
                      ? ', selecionado'
                      : ', disponível'
                }`}
                onClick={() => onToggle(cell.id)}
              >
                {formatRaffleNumber(cell.id)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

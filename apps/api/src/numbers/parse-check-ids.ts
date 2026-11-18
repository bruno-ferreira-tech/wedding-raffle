import {
  MAX_NUMBER_ID,
  MIN_NUMBER_ID,
} from '../orders/order-validation';

const MAX_CHECK_IDS = 50;

export function parseCheckIds(raw: string | undefined): number[] {
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error('ids obrigatório');
  }

  const parts = raw.split(',').map((p) => p.trim());
  if (parts.length > MAX_CHECK_IDS) {
    throw new Error('Máximo de 50 números');
  }

  const numberIds: number[] = [];
  const seen = new Set<number>();

  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      throw new Error('Número(s) inválido(s)');
    }
    const value = Number(part);
    if (
      !Number.isInteger(value) ||
      value < MIN_NUMBER_ID ||
      value > MAX_NUMBER_ID
    ) {
      throw new Error('Número(s) inválido(s)');
    }
    if (seen.has(value)) {
      throw new Error('Número(s) duplicado(s)');
    }
    seen.add(value);
    numberIds.push(value);
  }

  return numberIds;
}

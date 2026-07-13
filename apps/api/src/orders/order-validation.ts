export const RESERVATION_MINUTES = 15;
export const MIN_NUMBER_ID = 1;
export const MAX_NUMBER_ID = 2000;

export type CreateOrderInput = {
  buyerName: string;
  numberIds: number[];
};

export function parseCreateOrderInput(raw: {
  buyerName?: unknown;
  numberIds?: unknown;
}): CreateOrderInput {
  if (typeof raw.buyerName !== 'string' || raw.buyerName.trim() === '') {
    throw new Error('Nome do comprador é obrigatório');
  }

  if (!Array.isArray(raw.numberIds) || raw.numberIds.length === 0) {
    throw new Error('Selecione ao menos um número');
  }

  const numberIds: number[] = [];
  const seen = new Set<number>();

  for (const value of raw.numberIds) {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error('Número(s) inválido(s)');
    }
    if (value < MIN_NUMBER_ID || value > MAX_NUMBER_ID) {
      throw new Error('Número(s) inválido(s)');
    }
    if (seen.has(value)) {
      throw new Error('Número(s) duplicado(s)');
    }
    seen.add(value);
    numberIds.push(value);
  }

  return {
    buyerName: raw.buyerName.trim(),
    numberIds,
  };
}

export function reservationExpiresAt(now: Date = new Date()): Date {
  return new Date(now.getTime() + RESERVATION_MINUTES * 60_000);
}

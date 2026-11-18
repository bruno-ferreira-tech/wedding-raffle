export type RealtimeEvent =
  | { type: 'connected' }
  | { type: 'heartbeat' }
  | { type: 'order.reserved'; orderId: number; numberIds: number[] }
  | { type: 'sale.completed'; orderId: number; numberIds: number[] }
  | { type: 'sales.updated'; salesStatus: 'open' | 'closed' }
  | {
      type: 'draw.winner';
      prizeIndex: number;
      prizeLabel: string;
      numberId: number;
      buyerName: string;
    };

export function parseRealtimeEvent(raw: string): RealtimeEvent | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!data || typeof data !== 'object' || !('type' in data)) {
    return null;
  }

  const type = (data as { type: unknown }).type;
  if (typeof type !== 'string') {
    return null;
  }

  switch (type) {
    case 'connected':
    case 'heartbeat':
      return { type };
    case 'order.reserved':
    case 'sale.completed': {
      const payload = data as {
        orderId?: unknown;
        numberIds?: unknown;
      };
      if (
        typeof payload.orderId !== 'number' ||
        !Array.isArray(payload.numberIds) ||
        !payload.numberIds.every((n) => typeof n === 'number')
      ) {
        return null;
      }
      return {
        type,
        orderId: payload.orderId,
        numberIds: payload.numberIds,
      };
    }
    case 'sales.updated': {
      const payload = data as { salesStatus?: unknown };
      if (payload.salesStatus !== 'open' && payload.salesStatus !== 'closed') {
        return null;
      }
      return { type, salesStatus: payload.salesStatus };
    }
    case 'draw.winner': {
      const payload = data as {
        prizeIndex?: unknown;
        prizeLabel?: unknown;
        numberId?: unknown;
        buyerName?: unknown;
      };
      if (
        typeof payload.prizeIndex !== 'number' ||
        typeof payload.prizeLabel !== 'string' ||
        typeof payload.numberId !== 'number' ||
        typeof payload.buyerName !== 'string'
      ) {
        return null;
      }
      return {
        type,
        prizeIndex: payload.prizeIndex,
        prizeLabel: payload.prizeLabel,
        numberId: payload.numberId,
        buyerName: payload.buyerName,
      };
    }
    default:
      return null;
  }
}

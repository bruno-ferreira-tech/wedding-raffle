export type RealtimeEventName =
  | 'order.reserved'
  | 'sale.completed'
  | 'sales.updated'
  | 'draw.winner';

export type RealtimePayloadByEvent = {
  'order.reserved': { orderId: number; numberIds: number[] };
  'sale.completed': { orderId: number; numberIds: number[] };
  'sales.updated': { salesStatus: 'open' | 'closed' };
  'draw.winner': {
    prizeIndex: number;
    prizeLabel: string;
    numberId: number;
    buyerName: string;
  };
};

type Handler<E extends RealtimeEventName> = (
  payload: RealtimePayloadByEvent[E],
) => void;

/**
 * Minimal in-memory pub/sub for SSE / tellão.
 * Single-process only (YAGNI Redis for MVP).
 */
export class EventBus {
  private readonly listeners = new Map<
    RealtimeEventName,
    Set<Handler<RealtimeEventName>>
  >();

  on<E extends RealtimeEventName>(
    event: E,
    handler: Handler<E>,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as Handler<RealtimeEventName>);
    return () => {
      set!.delete(handler as Handler<RealtimeEventName>);
    };
  }

  emit<E extends RealtimeEventName>(
    event: E,
    payload: RealtimePayloadByEvent[E],
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      (handler as Handler<E>)(payload);
    }
  }
}

export const eventBus = new EventBus();
export const EVENT_BUS = Symbol('EVENT_BUS');

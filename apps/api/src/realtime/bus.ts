export type RealtimeEventName = 'order.reserved' | 'sale.completed';

export type RealtimePayload = {
  orderId: number;
  numberIds: number[];
};

type Handler = (payload: RealtimePayload) => void;

/**
 * Minimal in-memory pub/sub for SSE / tellão.
 * Single-process only (YAGNI Redis for MVP).
 */
export class EventBus {
  private readonly listeners = new Map<RealtimeEventName, Set<Handler>>();

  on(event: RealtimeEventName, handler: Handler): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler);
    return () => {
      set!.delete(handler);
    };
  }

  emit(event: RealtimeEventName, payload: RealtimePayload): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      handler(payload);
    }
  }
}

export const eventBus = new EventBus();
export const EVENT_BUS = Symbol('EVENT_BUS');

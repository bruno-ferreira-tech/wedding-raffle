import { describe, expect, it } from 'vitest';
import { parseRealtimeEvent } from '../src/lib/sse';

describe('parseRealtimeEvent', () => {
  it('parses draw.winner', () => {
    expect(
      parseRealtimeEvent(
        JSON.stringify({
          type: 'draw.winner',
          prizeIndex: 1,
          prizeLabel: 'Lua de mel',
          numberId: 42,
          buyerName: 'Ana',
        }),
      ),
    ).toEqual({
      type: 'draw.winner',
      prizeIndex: 1,
      prizeLabel: 'Lua de mel',
      numberId: 42,
      buyerName: 'Ana',
    });
  });

  it('parses sale.completed', () => {
    expect(
      parseRealtimeEvent(
        JSON.stringify({ type: 'sale.completed', orderId: 9, numberIds: [1, 2] }),
      ),
    ).toEqual({
      type: 'sale.completed',
      orderId: 9,
      numberIds: [1, 2],
    });
  });

  it('parses order.reserved', () => {
    expect(
      parseRealtimeEvent(
        JSON.stringify({ type: 'order.reserved', orderId: 3, numberIds: [7, 8] }),
      ),
    ).toEqual({
      type: 'order.reserved',
      orderId: 3,
      numberIds: [7, 8],
    });
  });

  it('returns null for garbage', () => {
    expect(parseRealtimeEvent('not-json')).toBeNull();
    expect(parseRealtimeEvent('{"type":"unknown"}')).toBeNull();
  });
});

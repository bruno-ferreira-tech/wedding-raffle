import { EventBus } from './bus';

describe('EventBus', () => {
  it('delivers sale.completed to subscribers', () => {
    const bus = new EventBus();
    const received: unknown[] = [];
    bus.on('sale.completed', (payload) => received.push(payload));

    bus.emit('sale.completed', { orderId: 1, numberIds: [10, 20] });

    expect(received).toEqual([{ orderId: 1, numberIds: [10, 20] }]);
  });

  it('delivers sales.updated to subscribers', () => {
    const bus = new EventBus();
    const received: unknown[] = [];
    bus.on('sales.updated', (payload) => received.push(payload));

    bus.emit('sales.updated', { salesStatus: 'closed' });

    expect(received).toEqual([{ salesStatus: 'closed' }]);
  });

  it('delivers draw.winner to subscribers', () => {
    const bus = new EventBus();
    const received: unknown[] = [];
    bus.on('draw.winner', (payload) => received.push(payload));

    bus.emit('draw.winner', {
      prizeIndex: 1,
      prizeLabel: 'Prêmio 1',
      numberId: 42,
      buyerName: 'Ana',
    });

    expect(received).toEqual([
      {
        prizeIndex: 1,
        prizeLabel: 'Prêmio 1',
        numberId: 42,
        buyerName: 'Ana',
      },
    ]);
  });

  it('unsubscribe stops delivery', () => {
    const bus = new EventBus();
    const received: unknown[] = [];
    const off = bus.on('order.reserved', (payload) => received.push(payload));

    off();
    bus.emit('order.reserved', { orderId: 2, numberIds: [3] });

    expect(received).toEqual([]);
  });
});

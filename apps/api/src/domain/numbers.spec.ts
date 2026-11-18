import {
  assertCanReserve,
  applyReservation,
  applyRelease,
  applyMarkPaid,
  applyConfirmPaid,
  type NumberRow,
} from './numbers';

describe('reservation', () => {
  const base = (id: number): NumberRow => ({
    id,
    status: 'disponivel',
    orderId: null,
    buyerName: null,
  });

  it('reserves available numbers for an order', () => {
    const rows = [base(1), base(2)];
    const next = applyReservation(rows, { orderId: 10, buyerName: 'Ana' });
    expect(
      next.every((r) => r.status === 'reservado' && r.orderId === 10),
    ).toBe(true);
  });

  it('rejects if any number is not disponivel', () => {
    const rows: NumberRow[] = [
      base(1),
      { id: 2, status: 'pago', orderId: 1, buyerName: 'B' },
    ];
    expect(() => assertCanReserve(rows)).toThrow(/indispon/);
  });

  it('releases reserved numbers back to disponivel', () => {
    const rows: NumberRow[] = [
      { id: 1, status: 'reservado', orderId: 10, buyerName: 'Ana' },
    ];
    expect(applyRelease(rows)[0].status).toBe('disponivel');
    expect(applyRelease(rows)[0].orderId).toBeNull();
    expect(applyRelease(rows)[0].buyerName).toBeNull();
  });

  it('marks paid from disponivel (padrinho)', () => {
    const rows = [base(5)];
    const next = applyMarkPaid(rows, { orderId: 99, buyerName: 'Carlos' });
    expect(next[0]).toMatchObject({
      status: 'pago',
      buyerName: 'Carlos',
      orderId: 99,
    });
  });

  it('confirms paid from reservado', () => {
    const rows: NumberRow[] = [
      { id: 1, status: 'reservado', orderId: 10, buyerName: 'Ana' },
    ];
    const next = applyConfirmPaid(rows);
    expect(next[0]).toMatchObject({
      status: 'pago',
      orderId: 10,
      buyerName: 'Ana',
    });
  });

  it('throws if confirm paid when not reservado', () => {
    const rows: NumberRow[] = [base(1)];
    expect(() => applyConfirmPaid(rows)).toThrow(/não está reservado/);
  });
});

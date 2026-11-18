export type NumberStatus = 'disponivel' | 'reservado' | 'pago';

export type NumberRow = {
  id: number;
  status: NumberStatus;
  orderId: number | null;
  buyerName: string | null;
};

export function assertCanReserve(rows: NumberRow[]): void {
  const blocked = rows.filter((r) => r.status !== 'disponivel');
  if (blocked.length) {
    throw new Error(
      `Número(s) indisponível(is): ${blocked.map((b) => b.id).join(', ')}`,
    );
  }
}

export function applyReservation(
  rows: NumberRow[],
  opts: { orderId: number; buyerName: string },
): NumberRow[] {
  assertCanReserve(rows);
  return rows.map((r) => ({
    ...r,
    status: 'reservado' as const,
    orderId: opts.orderId,
    buyerName: opts.buyerName,
  }));
}

export function applyRelease(rows: NumberRow[]): NumberRow[] {
  return rows.map((r) => {
    if (r.status !== 'reservado') return r;
    return {
      ...r,
      status: 'disponivel' as const,
      orderId: null,
      buyerName: null,
    };
  });
}

export function applyMarkPaid(
  rows: NumberRow[],
  opts: { orderId: number; buyerName: string },
): NumberRow[] {
  assertCanReserve(rows);
  return rows.map((r) => ({
    ...r,
    status: 'pago' as const,
    orderId: opts.orderId,
    buyerName: opts.buyerName,
  }));
}

export function applyConfirmPaid(rows: NumberRow[]): NumberRow[] {
  return rows.map((r) => {
    if (r.status !== 'reservado') {
      throw new Error(`Número ${r.id} não está reservado`);
    }
    return { ...r, status: 'pago' as const };
  });
}

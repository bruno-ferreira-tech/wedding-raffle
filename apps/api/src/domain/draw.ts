export type PaidEntry = { id: number; buyerName: string };

export function eligiblePool(
  paid: PaidEntry[],
  drawnIds: number[],
): PaidEntry[] {
  const taken = new Set(drawnIds);
  return paid.filter((p) => !taken.has(p.id));
}

export function pickWinner(
  pool: PaidEntry[],
  randomIndex: (maxExclusive: number) => number,
): PaidEntry {
  if (pool.length === 0) {
    throw new Error('Nenhum número elegível para sorteio');
  }
  const idx = randomIndex(pool.length);
  if (idx < 0 || idx >= pool.length) {
    throw new Error('rng inválido');
  }
  return pool[idx];
}

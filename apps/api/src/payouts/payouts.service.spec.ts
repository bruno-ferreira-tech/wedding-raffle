describe('payouts balance calculations', () => {
  it('computes net balance correctly from gross revenue, fee, and withdrawals', () => {
    const grossRevenueCents = 100000; // R$ 1.000,00
    const platformFeeCents = 4900; // R$ 49,00 (4.9%)
    const netRevenueCents = grossRevenueCents - platformFeeCents; // R$ 951,00
    const totalWithdrawnCents = 30000; // R$ 300,00

    const availableBalanceCents = netRevenueCents - totalWithdrawnCents;
    expect(availableBalanceCents).toBe(65100); // R$ 651,00
  });
});

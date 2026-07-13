import { FakePaymentProvider } from './fake';

describe('FakePaymentProvider', () => {
  const provider = new FakePaymentProvider();

  it('returns deterministic PIX charge for an order', async () => {
    const expiresAt = new Date('2026-07-13T12:00:00.000Z');

    const result = await provider.createPixCharge({
      orderId: 42,
      amountCents: 1500,
      buyerName: 'Maria Silva',
      expiresAt,
    });

    expect(result).toEqual({
      provider: 'fake',
      providerChargeId: 'fake_42',
      copyPaste: 'FAKE-PIX-ORDER-42-1500',
    });
  });

  it('embeds orderId in providerChargeId and copyPaste', async () => {
    const result = await provider.createPixCharge({
      orderId: 7,
      amountCents: 200,
      buyerName: 'João',
      expiresAt: new Date(),
    });

    expect(result.providerChargeId).toBe('fake_7');
    expect(result.copyPaste).toBe('FAKE-PIX-ORDER-7-200');
  });
});

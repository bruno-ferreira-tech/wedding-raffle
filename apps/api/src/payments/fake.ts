import type { CreatePixInput, CreatePixResult, PaymentProvider } from './types';

export class FakePaymentProvider implements PaymentProvider {
  async createPixCharge(input: CreatePixInput): Promise<CreatePixResult> {
    return {
      provider: 'fake',
      providerChargeId: `fake_${input.orderId}`,
      copyPaste: `FAKE-PIX-ORDER-${input.orderId}-${input.amountCents}`,
    };
  }
}

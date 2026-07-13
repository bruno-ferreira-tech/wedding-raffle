import type { CreatePixInput, CreatePixResult, PaymentProvider } from './types';

/**
 * Mercado Pago PIX stub — selected only when PAYMENT_PROVIDER=mercadopago.
 * Real preference/payment creation is deferred until MP credentials + flow are ready.
 */
export class MercadoPagoPixPaymentProvider implements PaymentProvider {
  constructor(private readonly accessToken: string) {}

  async createPixCharge(_input: CreatePixInput): Promise<CreatePixResult> {
    if (!this.accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is required');
    }
    throw new Error('MercadoPago PIX createPixCharge is not implemented');
  }
}

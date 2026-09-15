import type { CreatePixInput, CreatePixResult, PaymentProvider } from './types';

/**
 * Mercado Pago PIX payment provider via /v1/payments endpoint.
 */
export class MercadoPagoPixPaymentProvider implements PaymentProvider {
  constructor(private readonly accessToken: string) {}

  async createPixCharge(input: CreatePixInput): Promise<CreatePixResult> {
    if (!this.accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN is required');
    }

    const amountInReais = Number((input.amountCents / 100).toFixed(2));
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `wr-order-${input.orderId}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: amountInReais,
        description: `Corta-Gravata - Pedido #${input.orderId}`,
        payment_method_id: 'pix',
        payer: {
          email: `comprador+${input.orderId}@corta-gravata.local`,
          first_name: input.buyerName,
        },
        date_of_expiration: input.expiresAt.toISOString(),
        metadata: {
          order_id: input.orderId,
          buyer_name: input.buyerName,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Mercado Pago Payment creation failed (${response.status}): ${errorText}`,
      );
    }

    const data = (await response.json()) as {
      id: number | string;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
        };
      };
    };

    const copyPaste = data.point_of_interaction?.transaction_data?.qr_code;
    const qrBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!copyPaste) {
      throw new Error(
        'Mercado Pago PIX payment was created but qr_code was missing from transaction_data',
      );
    }

    return {
      provider: 'mercadopago',
      providerChargeId: String(data.id),
      copyPaste,
      qrBase64: qrBase64 ? `data:image/png;base64,${qrBase64}` : undefined,
    };
  }
}
